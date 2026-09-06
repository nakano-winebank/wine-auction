const os = require('node:os');
const path = require('node:path');
const fs = require('node:fs');
const test = require('node:test');
const assert = require('node:assert');

// database.js を読み込む前に、テスト専用の SQLite ファイルへ差し替える
const TMP_DB = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'wb-shop-')), 'test.db');
process.env.SQLITE_PATH = TMP_DB;
delete process.env.DATABASE_URL;

const db = require('../database');
const { migrate } = require('../db/membership-schema');
const { insertReturningId } = require('../db/helpers');
const members = require('../services/members');
const miles = require('../services/miles');
const purchase = require('../services/purchase');
const demo = require('../services/demo');

let seq = 0;
async function makeUser() {
  seq += 1;
  return insertReturningId(
    `INSERT INTO users (username, email, password_hash, display_name) VALUES (?, ?, ?, ?)`,
    [`shop_user_${seq}`, `shop${seq}@example.test`, 'x', `購入テスト${seq}`]
  );
}

test.before(async () => { await migrate(); });

// ───────────────────────────────── 購入プラン

test('購入プランはランク master から組み立てられ、本数は簿価下限を必ず満たす', async () => {
  const plans = await purchase.listPlans();
  assert.ok(plans.length >= 3, 'ランクの数だけプランが出る');

  const ranks = await members.listRanks();
  for (const plan of plans) {
    const rank = ranks.find(r => r.code === plan.rankCode);
    assert.ok(plan.bookValue >= rank.min_book_value,
      `${plan.rankCode}: 購入すれば必ずそのランクに到達する`);
    assert.strictEqual(plan.bookValue, plan.quantity * plan.unitPrice);
    // 料率はランク master 由来であること（プラン側に定数を持たない）
    assert.strictEqual(plan.mileRate, rank.mile_rate);
    assert.strictEqual(plan.feeRate, rank.fee_rate);
  }
});

test('ランクの簿価下限を変えるとプランの金額が追従する', async () => {
  const before = (await purchase.listPlans()).find(p => p.rankCode === 'PRESTIGE');
  await db.prepare('UPDATE member_ranks SET min_book_value = ? WHERE code = ?')
    .run(2000000, 'PRESTIGE');

  const after = (await purchase.listPlans()).find(p => p.rankCode === 'PRESTIGE');
  assert.ok(after.bookValue > before.bookValue, 'コード変更なしにプランが変わる');
  assert.ok(after.bookValue >= 2000000);

  await db.prepare('UPDATE member_ranks SET min_book_value = ? WHERE code = ?')
    .run(1000000, 'PRESTIGE');
});

test('プランを購入すると口座開設・保有登録・ランク付与・マイル付与が一度に走る', async () => {
  const userId = await makeUser();
  const result = await purchase.purchasePlan(userId, 'GOLD');

  assert.strictEqual(result.isFirstPurchase, true);
  assert.strictEqual(result.rankCode, 'GOLD');
  assert.ok(result.accountNo.startsWith('WB'));

  const summary = await members.getPortfolioSummary(result.memberId);
  assert.strictEqual(summary.bookValue, result.plan.bookValue);
  assert.strictEqual(summary.bottles, result.plan.quantity);

  // 初年度還元＋入会記念ボーナスの2本
  assert.strictEqual(result.grants.length, 2);
  const rank = await members.getRank('GOLD');
  assert.strictEqual(result.grants[0].amount, Math.round(result.plan.bookValue * rank.mile_rate));
  assert.strictEqual(result.grants[1].amount, purchase.WELCOME_BONUS_MILES);
  assert.strictEqual(result.balance, result.grants[0].amount + result.grants[1].amount);

  // 購入時点では含み損益ゼロ（時価＝取得単価）
  assert.strictEqual(summary.unrealizedGain, 0);
});

test('2回目の購入では入会記念ボーナスは付かず、ランクが上がる', async () => {
  const userId = await makeUser();
  const first = await purchase.purchasePlan(userId, 'PRESTIGE');
  assert.strictEqual(first.rankCode, 'PRESTIGE');

  const second = await purchase.purchasePlan(userId, 'GOLD');
  assert.strictEqual(second.isFirstPurchase, false);
  assert.strictEqual(second.grants.length, 1, '還元のみ。入会記念は初回だけ');
  assert.strictEqual(second.memberId, first.memberId, '口座は二重に開かれない');
  assert.strictEqual(second.rankCode, 'GOLD');
});

// ───────────────────────────────── マイルを使う

test('マイルはチャネルを指定して利用でき、残高不足と不明チャネルは弾かれる', async () => {
  const userId = await makeUser();
  const { memberId, balance } = await purchase.purchasePlan(userId, 'PRESTIGE');

  const result = await miles.redeem(memberId, 3000, { channel: 'restaurant' });
  assert.strictEqual(result.redeemed, 3000);
  assert.strictEqual(await miles.getBalance(memberId), balance - 3000);

  await assert.rejects(
    () => miles.redeem(memberId, balance * 10, { channel: 'school' }),
    /残高が不足/);
  await assert.rejects(
    () => miles.redeem(memberId, 100, { channel: 'casino' }),
    /不明な利用チャネル/);

  // 残高不足で弾かれたときは台帳が動いていないこと
  assert.strictEqual(await miles.getBalance(memberId), balance - 3000);
});

test('マイル利用は有効期限の近いロットから引き当てられる', async () => {
  const userId = await makeUser();
  const { memberId } = await purchase.purchasePlan(userId, 'PRESTIGE');

  // 入会記念ボーナス（180日）が、還元（365日）より先に消える
  const bonus = purchase.WELCOME_BONUS_MILES;
  await miles.redeem(memberId, bonus, { channel: 'event' });

  const lots = await db.prepare(
    `SELECT kind, remaining_amount FROM mile_lots WHERE member_id = ? ORDER BY expires_at ASC`
  ).all(memberId);
  const bonusLot = lots.find(l => l.kind === 'bonus');
  assert.strictEqual(Number(bonusLot.remaining_amount), 0, '期限の近いボーナスから消える');
});

// ───────────────────────────────── 有償マイル（前払式支払手段の論点）

test('有償購入マイルは kind と支払対価で無償付与と台帳上分離される', async () => {
  const userId = await makeUser();
  const { memberId } = await purchase.purchasePlan(userId, 'PRESTIGE');

  const result = await purchase.purchaseMiles(userId, 'pack_50k');
  assert.strictEqual(result.grant.kind, 'purchased');
  assert.strictEqual(result.grant.paidAmount, 50000);
  assert.strictEqual(result.grant.amount, 50000);

  const lot = await db.prepare(
    `SELECT kind, paid_amount FROM mile_lots WHERE id = ?`).get(result.grant.lotId);
  assert.strictEqual(lot.kind, 'purchased');
  assert.strictEqual(Number(lot.paid_amount), 50000);

  // 無償付与分には支払対価が入らない
  const free = await db.prepare(
    `SELECT COUNT(*) AS n FROM mile_lots WHERE member_id = ? AND kind != 'purchased' AND paid_amount IS NOT NULL`
  ).get(memberId);
  assert.strictEqual(Number(free.n), 0);
});

test('有償分の未使用残高は無償付与マイルを含まない', async () => {
  const userId = await makeUser();
  const { memberId, balance: freeBalance } = await purchase.purchasePlan(userId, 'PRESTIGE');

  await purchase.purchaseMiles(userId, 'pack_10k');
  const outstanding = await miles.getPurchasedOutstanding(undefined, memberId);

  assert.strictEqual(outstanding.miles, 10000, '有償で発行した分だけを数える');
  assert.strictEqual(outstanding.yen, 10000, '供託判定の基礎になる円換算');
  assert.strictEqual(outstanding.grantedPaidAmount, 10000);
  assert.strictEqual(await miles.getBalance(memberId), freeBalance + 10000,
    '会員から見た残高は有償・無償の合計');
});

test('有償購入マイルの有効期限は6ヶ月以内（資金決済法4条2号の適用除外を外さないため）', async () => {
  assert.ok(miles.MILE_VALIDITY_DAYS.purchased !== null, '無期限にしない');
  assert.ok(miles.MILE_VALIDITY_DAYS.purchased <= 180,
    '180日を超えると適用除外から外れるため、変更には法務確認が要る');
});

test('支払対価なしで有償マイルを発行しようとすると弾かれる', async () => {
  const userId = await makeUser();
  const { memberId } = await purchase.purchasePlan(userId, 'PRESTIGE');
  await assert.rejects(
    () => miles.grant(memberId, 1000, { kind: 'purchased' }),
    /支払対価/);
});

// ───────────────────────────────── デモ用の時間送り

test('DEMO_MODE が無効なら時間送りは実行できない', async () => {
  const userId = await makeUser();
  const { memberId } = await purchase.purchasePlan(userId, 'PRESTIGE');

  delete process.env.DEMO_MODE;
  assert.strictEqual(demo.isEnabled(), false);
  await assert.rejects(() => demo.advanceTime(memberId, 365), /デモ機能は無効/);
});

test('1年進めると年次還元が付与され、期間限定マイルが失効する', async () => {
  const userId = await makeUser();
  const purchased = await purchase.purchasePlan(userId, 'GOLD');
  const memberId = purchased.memberId;

  process.env.DEMO_MODE = '1';
  try {
    const result = await demo.advanceTime(memberId, 365);

    // 購入時の還元（365日）と入会記念ボーナス（180日）が両方とも期限切れになる
    assert.strictEqual(result.expired.amount, purchased.balance);

    // 年次還元が1本入る。額面はランクの還元率 × 簿価
    assert.strictEqual(result.rewards.length, 1);
    const rank = await members.getRank('GOLD');
    const summary = await members.getPortfolioSummary(memberId);
    assert.strictEqual(result.rewards[0].amount, Math.round(summary.bookValue * rank.mile_rate));

    // 残高は新しく付与された還元分だけ
    assert.strictEqual(await miles.getBalance(memberId), result.rewards[0].amount);

    // 管理手数料が1年ぶん計上される
    assert.ok(result.fee, '手数料が計上される');
    const fees = await members.listFees(memberId);
    assert.strictEqual(fees.length, 1);
    assert.strictEqual(fees[0].fee_rate, rank.fee_rate, '料率はランク master 由来');

    // 時価が更新され、含み益が出ている
    assert.ok(result.revalued.length > 0);
    assert.ok(summary.unrealizedGain > 0, '1年ぶん値上がりした状態になる');
  } finally {
    delete process.env.DEMO_MODE;
  }
});

test('時間送りは指定した会員以外の台帳に触れない', async () => {
  const otherUserId = await makeUser();
  const other = await purchase.purchasePlan(otherUserId, 'PRESTIGE');
  const otherLotsBefore = await db.prepare(
    `SELECT id, granted_at, expires_at FROM mile_lots WHERE member_id = ? ORDER BY id`
  ).all(other.memberId);

  const userId = await makeUser();
  const target = await purchase.purchasePlan(userId, 'PRESTIGE');

  process.env.DEMO_MODE = '1';
  try {
    await demo.advanceTime(target.memberId, 365);
  } finally {
    delete process.env.DEMO_MODE;
  }

  const otherLotsAfter = await db.prepare(
    `SELECT id, granted_at, expires_at FROM mile_lots WHERE member_id = ? ORDER BY id`
  ).all(other.memberId);
  assert.deepStrictEqual(otherLotsAfter, otherLotsBefore, '他会員の台帳は不変');
  assert.strictEqual(await miles.getBalance(other.memberId), other.balance);
});

test('進める日数の範囲外は弾かれる', async () => {
  const userId = await makeUser();
  const { memberId } = await purchase.purchasePlan(userId, 'PRESTIGE');
  process.env.DEMO_MODE = '1';
  try {
    await assert.rejects(() => demo.advanceTime(memberId, 0), /1〜3650/);
    await assert.rejects(() => demo.advanceTime(memberId, 5000), /1〜3650/);
  } finally {
    delete process.env.DEMO_MODE;
  }
});
