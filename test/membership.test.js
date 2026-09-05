const os = require('node:os');
const path = require('node:path');
const fs = require('node:fs');
const test = require('node:test');
const assert = require('node:assert');

// database.js を読み込む前に、テスト専用の SQLite ファイルへ差し替える
const TMP_DB = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'wb-test-')), 'test.db');
process.env.SQLITE_PATH = TMP_DB;
delete process.env.DATABASE_URL;

const db = require('../database');
const { migrate } = require('../db/membership-schema');
const { insertReturningId, isoAfterDays, nowIso } = require('../db/helpers');
const members = require('../services/members');
const miles = require('../services/miles');

let seq = 0;
async function makeMember(lockedRankCode = null) {
  seq += 1;
  const userId = await insertReturningId(
    `INSERT INTO users (username, email, password_hash, display_name) VALUES (?, ?, ?, ?)`,
    [`test_user_${seq}`, `test${seq}@example.test`, 'x', `テスト会員${seq}`]
  );
  const account = await members.createAccount(userId, { lockedRankCode });
  return account.id;
}

test.before(async () => { await migrate(); });

// ───────────────────────────────── ランク判定

test('簿価合計からランクが自動で決まる', async () => {
  const memberId = await makeMember();

  // 100万円分（20,000円 × 50本）→ PRESTIGE
  await members.addHolding(memberId, {
    wineName: 'Château Test', quantity: 50, acquiredUnitPrice: 20000,
  });
  assert.strictEqual(await members.recalcRank(memberId), 'PRESTIGE');

  // さらに 300万円分積むと合計400万 → GOLD
  await members.addHolding(memberId, {
    wineName: 'Château Test 2', quantity: 60, acquiredUnitPrice: 50000,
  });
  const summary = await members.getPortfolioSummary(memberId);
  assert.strictEqual(summary.bookValue, 4000000);
  assert.strictEqual(summary.bottles, 110);
  assert.strictEqual(await members.recalcRank(memberId), 'GOLD');
});

test('ランクを手動ロックすると簿価に関わらず据え置かれる', async () => {
  const memberId = await makeMember('SIGNATURE');
  await members.addHolding(memberId, {
    wineName: 'Château Lock', quantity: 1, acquiredUnitPrice: 20000,
  });
  assert.strictEqual(await members.recalcRank(memberId), 'SIGNATURE');
});

test('簿価がどのランクにも満たない場合はランクなし', async () => {
  const memberId = await makeMember();
  await members.addHolding(memberId, {
    wineName: 'Petit', quantity: 1, acquiredUnitPrice: 20000,
  });
  assert.strictEqual(await members.recalcRank(memberId), null);
});

// ───────────────────────────────── 時価と含み益

test('時価を登録すると含み益が出る。未評価分は簿価で埋める', async () => {
  const memberId = await makeMember();
  const a = await members.addHolding(memberId, {
    wineName: '評価あり', quantity: 10, acquiredUnitPrice: 20000, unitMarketPrice: 26000,
  });
  await members.addHolding(memberId, {
    wineName: '評価なし', quantity: 10, acquiredUnitPrice: 20000,
  });

  const summary = await members.getPortfolioSummary(memberId);
  assert.strictEqual(summary.bookValue, 400000);
  // 評価あり 260,000 + 評価なしは簿価 200,000 で補完
  assert.strictEqual(summary.marketValue, 460000);
  assert.strictEqual(summary.unrealizedGain, 60000);

  // 最新の時価だけが採用される
  await members.addValuation(a.id, 30000, { asOf: isoAfterDays(1) });
  const after = await members.getPortfolioSummary(memberId);
  assert.strictEqual(after.marketValue, 500000);
});

test('出庫・売却した保有は資産合計から外れる', async () => {
  const memberId = await makeMember();
  const h = await members.addHolding(memberId, {
    wineName: '売却予定', quantity: 50, acquiredUnitPrice: 20000,
  });
  assert.strictEqual((await members.getPortfolioSummary(memberId)).bookValue, 1000000);

  await members.updateHolding(h.id, { status: 'sold', releasedAt: nowIso() });
  assert.strictEqual((await members.getPortfolioSummary(memberId)).bookValue, 0);
  assert.strictEqual((await members.getAccount(memberId)).rank_code, null);
});

// ───────────────────────────────── 管理手数料

test('管理手数料は簿価 × 料率 × 日割りで計上される', async () => {
  const memberId = await makeMember();
  await members.addHolding(memberId, {
    wineName: '手数料テスト', quantity: 50, acquiredUnitPrice: 20000,
  });

  const fee = await members.accrueManagementFee(
    memberId, '2026-01-01T00:00:00.000Z', '2027-01-01T00:00:00.000Z');
  // 1,000,000 × 2.5% × 365/365
  assert.strictEqual(Number(fee.amount), 25000);
  assert.strictEqual(Number(fee.basis_book_value), 1000000);

  // 同じ期間の二重計上は弾く
  await assert.rejects(
    () => members.accrueManagementFee(memberId, '2026-01-01T00:00:00.000Z', '2027-01-01T00:00:00.000Z'),
    /既に計上/
  );

  // 半年なら按分される
  const half = await members.accrueManagementFee(
    memberId, '2027-01-01T00:00:00.000Z', '2027-07-01T00:00:00.000Z');
  assert.strictEqual(Number(half.amount), Math.round(1000000 * 0.025 * (181 / 365)));
});

// ───────────────────────────────── マイル台帳

test('付与と消費で残高が動く', async () => {
  const memberId = await makeMember();
  await miles.grant(memberId, 10000, { kind: 'reward' });
  assert.strictEqual(await miles.getBalance(memberId), 10000);

  await miles.redeem(memberId, 3000, { channel: 'restaurant' });
  assert.strictEqual(await miles.getBalance(memberId), 7000);

  const txns = await miles.listTransactions(memberId);
  assert.strictEqual(txns[0].type, 'redeem');
  assert.strictEqual(txns[0].amount, -3000);
  assert.strictEqual(txns[0].balance_after, 7000);
});

test('残高不足の消費は拒否され、台帳は一切動かない', async () => {
  const memberId = await makeMember();
  await miles.grant(memberId, 1000);

  await assert.rejects(() => miles.redeem(memberId, 1001), /残高が不足/);
  assert.strictEqual(await miles.getBalance(memberId), 1000);
  assert.strictEqual((await miles.listTransactions(memberId)).length, 1);
});

test('消費は有効期限が近いロットから引き当てられる', async () => {
  const memberId = await makeMember();
  // 期限の遠いロットを先に付与しても、期限の近い方から先に減る
  await miles.grant(memberId, 5000, { kind: 'reward', validDays: 365, memo: '遠い' });
  await miles.grant(memberId, 3000, { kind: 'bonus', validDays: 30, memo: '近い' });

  const result = await miles.redeem(memberId, 4000);
  assert.strictEqual(result.lots.length, 2);
  assert.strictEqual(result.lots[0].amount, 3000);  // 期限30日のロットを使い切る
  assert.strictEqual(result.lots[1].amount, 1000);  // 残りを期限365日から
  assert.strictEqual(await miles.getBalance(memberId), 4000);
});

test('無期限ロットは期限つきロットより後に消費される', async () => {
  const memberId = await makeMember();
  await miles.grant(memberId, 2000, { kind: 'adjust', validDays: null, memo: '無期限' });
  await miles.grant(memberId, 1000, { kind: 'bonus', validDays: 60 });

  const result = await miles.redeem(memberId, 1500);
  assert.strictEqual(result.lots[0].amount, 1000);
  assert.strictEqual(result.lots[0].expiresAt !== null, true);
  assert.strictEqual(result.lots[1].amount, 500);
});

test('期限切れロットは残高から外れ、失効として記録される', async () => {
  const memberId = await makeMember();
  // 期限を過去に置いた「期間限定マイル」
  await miles.grant(memberId, 4000, {
    kind: 'bonus', validDays: -1, grantedAt: isoAfterDays(-200),
  });
  await miles.grant(memberId, 1000, { kind: 'reward' });

  // 期限切れは sweep 前から残高に含まれない
  assert.strictEqual(await miles.getBalance(memberId), 1000);

  const result = await miles.expireLots();
  assert.strictEqual(result.lots >= 1, true);

  const expired = (await miles.listTransactions(memberId)).find(t => t.type === 'expire');
  assert.strictEqual(expired.amount, -4000);
  assert.strictEqual(await miles.getBalance(memberId), 1000);

  // 二度目の sweep で二重に失効させない
  const again = await miles.expireLots(nowIso(), memberId);
  assert.strictEqual(again.lots, 0);
});

test('期間限定マイルの既定有効期限は6ヶ月、還元マイルは1年', async () => {
  const memberId = await makeMember();
  const bonus = await miles.grant(memberId, 100, { kind: 'bonus' });
  const reward = await miles.grant(memberId, 100, { kind: 'reward' });

  const days = (iso) => Math.round((new Date(iso) - Date.now()) / 86400000);
  assert.strictEqual(days(bonus.expiresAt), 180);
  assert.strictEqual(days(reward.expiresAt), 365);
});

test('不正な付与は弾かれる', async () => {
  const memberId = await makeMember();
  await assert.rejects(() => miles.grant(memberId, 0), /1以上/);
  await assert.rejects(() => miles.grant(memberId, -5), /1以上/);
  await assert.rejects(() => miles.grant(memberId, 100, { kind: 'unknown' }), /不明なマイル種別/);
});

test('期間サマリで付与・利用・失効が集計できる', async () => {
  const memberId = await makeMember();
  await miles.grant(memberId, 10000);
  await miles.redeem(memberId, 2500);

  const s = await miles.summarize(memberId, isoAfterDays(-1), isoAfterDays(1));
  assert.strictEqual(s.granted, 10000);
  assert.strictEqual(s.redeemed, 2500);
  assert.strictEqual(s.expired, 0);
});

// ───────────────────────────────── 年次還元

test('年次還元はランクの還元率 × 簿価で付与される', async () => {
  const memberId = await makeMember();
  await members.addHolding(memberId, {
    wineName: '還元テスト', quantity: 50, acquiredUnitPrice: 20000,   // 100万円 → PRESTIGE 3.5%
  });

  const result = await members.grantAnnualReward(memberId);
  assert.strictEqual(result.amount, 35000);
  assert.strictEqual(await miles.getBalance(memberId), 35000);
});

test('上位ランクほど還元率が高い', async () => {
  const gold = await makeMember();
  await members.addHolding(gold, { wineName: 'GOLD', quantity: 100, acquiredUnitPrice: 40000 }); // 400万
  assert.strictEqual((await members.grantAnnualReward(gold)).amount, 180000);  // 4.5%

  const sig = await makeMember();
  await members.addHolding(sig, { wineName: 'SIG', quantity: 200, acquiredUnitPrice: 50000 });   // 1000万
  assert.strictEqual((await members.grantAnnualReward(sig)).amount, 550000);   // 5.5%
});

test('保有ワインがない会員には還元できない', async () => {
  const memberId = await makeMember();
  await assert.rejects(() => members.grantAnnualReward(memberId), /ランクが未確定/);
});

test('期中入会は periodRatio で按分できる', async () => {
  const memberId = await makeMember();
  await members.addHolding(memberId, {
    wineName: '按分', quantity: 50, acquiredUnitPrice: 20000,
  });
  const result = await members.grantAnnualReward(memberId, { periodRatio: 0.5 });
  assert.strictEqual(result.amount, 17500);
});

// ───────────────────────────────── 会員サマリ

test('会員サマリに資産・マイル・次ランクまでの距離が揃う', async () => {
  const memberId = await makeMember();
  await members.addHolding(memberId, {
    wineName: 'サマリ', quantity: 50, acquiredUnitPrice: 20000, unitMarketPrice: 22000,
  });
  await members.grantAnnualReward(memberId);
  await miles.redeem(memberId, 5000, { channel: 'club' });

  const o = await members.getMemberOverview(memberId);
  assert.strictEqual(o.rank.code, 'PRESTIGE');
  assert.strictEqual(o.portfolio.bookValue, 1000000);
  assert.strictEqual(o.portfolio.marketValue, 1100000);
  assert.strictEqual(o.miles.balance, 30000);
  assert.strictEqual(o.nextRank.code, 'GOLD');
  assert.strictEqual(o.nextRank.remaining, 3000000);
  assert.strictEqual(o.miles.expiring.length, 1);
});

test('会員口座は同じユーザーに二重開設されない', async () => {
  const memberId = await makeMember();
  const account = await members.getAccount(memberId);
  const again = await members.createAccount(account.user_id);
  assert.strictEqual(again.id, memberId);
});

test.after(() => {
  if (db._sqlite) db._sqlite.close();
  fs.rmSync(path.dirname(TMP_DB), { recursive: true, force: true });
});
