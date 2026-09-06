const os = require('node:os');
const path = require('node:path');
const fs = require('node:fs');
const test = require('node:test');
const assert = require('node:assert');

// database.js を読み込む前に、テスト専用の SQLite ファイルへ差し替える
const TMP_DB = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'wb-mail-')), 'test.db');
process.env.SQLITE_PATH = TMP_DB;
delete process.env.DATABASE_URL;
delete process.env.RESEND_API_KEY;   // 実送信させない（mailer は未設定ならコンソール出力のみ）
delete process.env.MEMBER_MAIL_BATCH;

const db = require('../database');
const { migrate } = require('../db/membership-schema');
const { insertReturningId, isoAfterDays } = require('../db/helpers');
const members = require('../services/members');
const miles = require('../services/miles');
const purchase = require('../services/purchase');
const mailer = require('../utils/mailer');
const notifications = require('../services/notifications');

// mailer を差し替えて、実際に送られた内容を捕まえる
const outbox = [];
for (const name of ['sendMileExpiryWarning', 'sendAnnualRewardNotice', 'sendQuarterlyReport']) {
  mailer[name] = async (payload) => { outbox.push({ name, payload }); };
}

let seq = 0;
async function makeMemberWithWine(rankCode = 'PRESTIGE') {
  seq += 1;
  const userId = await insertReturningId(
    `INSERT INTO users (username, email, password_hash, display_name, full_name) VALUES (?, ?, ?, ?, ?)`,
    [`mail_user_${seq}`, `mail${seq}@example.test`, 'x', `通知テスト${seq}`, `通知 太郎${seq}`]
  );
  return purchase.purchasePlan(userId, rankCode);
}

test.before(async () => { await migrate(); });
test.beforeEach(() => { outbox.length = 0; });

// ───────────────────────────────── 安全側の既定

test('MEMBER_MAIL_BATCH が未設定なら runAll は何も送らない', async () => {
  await makeMemberWithWine();
  const result = await notifications.runAll();
  assert.match(result.skipped, /MEMBER_MAIL_BATCH/);
  assert.strictEqual(outbox.length, 0, 'テスト環境で誤送信しない');
});

test('dryRun では送信も記録もしない', async () => {
  const { memberId } = await makeMemberWithWine();
  // 入会記念ボーナス（180日）を失効予告の窓に入れる
  await db.prepare(`UPDATE mile_lots SET expires_at = ? WHERE member_id = ? AND kind = 'bonus'`)
    .run(isoAfterDays(20), memberId);

  const result = await notifications.runExpiryWarnings({ dryRun: true });
  assert.ok(result.count >= 1);
  assert.strictEqual(outbox.length, 0, '送信しない');

  const rows = await db.prepare(
    'SELECT COUNT(*) AS n FROM member_notifications WHERE member_id = ?').get(memberId);
  assert.strictEqual(Number(rows.n), 0, '記録もしない');
});

// ───────────────────────────────── ① 失効30日前の予告

test('30日以内に失効するマイルがある会員に予告が飛ぶ', async () => {
  const { memberId } = await makeMemberWithWine();
  await db.prepare(`UPDATE mile_lots SET expires_at = ? WHERE member_id = ? AND kind = 'bonus'`)
    .run(isoAfterDays(20), memberId);

  await notifications.runExpiryWarnings();
  const mail = outbox.find(m => m.name === 'sendMileExpiryWarning' && m.payload.email.includes('mail'));
  assert.ok(mail, '予告メールが作られる');
  assert.strictEqual(mail.payload.amount, purchase.WELCOME_BONUS_MILES, '失効額が入る');
  assert.ok(mail.payload.expiresAt, '失効日が入る');
  assert.ok(mail.payload.lots.length >= 1, '内訳が入る');
  assert.ok(typeof mail.payload.balance === 'number', '残高も添える');
});

test('同じロットについて予告を二度送らない', async () => {
  const { memberId } = await makeMemberWithWine();
  await db.prepare(`UPDATE mile_lots SET expires_at = ? WHERE member_id = ? AND kind = 'bonus'`)
    .run(isoAfterDays(15), memberId);

  await notifications.runExpiryWarnings();
  const first = outbox.filter(m => m.name === 'sendMileExpiryWarning').length;
  assert.ok(first >= 1);

  outbox.length = 0;
  await notifications.runExpiryWarnings();  // 同じ日に2回走らせる
  const sentAgain = outbox.filter(m =>
    m.name === 'sendMileExpiryWarning' && m.payload.lots.some(l => l.amount === purchase.WELCOME_BONUS_MILES));
  assert.strictEqual(sentAgain.length, 0, '二重送信されない');
});

test('期限がまだ遠いマイルには予告を出さない', async () => {
  const { memberId } = await makeMemberWithWine();
  // 全ロットの期限を 90日先にする
  await db.prepare('UPDATE mile_lots SET expires_at = ? WHERE member_id = ?')
    .run(isoAfterDays(90), memberId);

  await notifications.runExpiryWarnings();
  const mine = outbox.filter(m => m.payload.email === `mail${seq}@example.test`);
  assert.strictEqual(mine.length, 0);
});

// ───────────────────────────────── ② 年次還元の付与通知

test('年次還元マイルを付与すると通知が飛び、二度は飛ばない', async () => {
  const { memberId } = await makeMemberWithWine('GOLD');
  const reward = await members.grantAnnualReward(memberId);

  await notifications.runAnnualRewardNotices();
  const mail = outbox.find(m => m.name === 'sendAnnualRewardNotice');
  assert.ok(mail, '付与通知が作られる');
  assert.strictEqual(mail.payload.amount, reward.amount);
  assert.strictEqual(mail.payload.rankName, 'GOLD');
  const rank = await members.getRank('GOLD');
  assert.strictEqual(mail.payload.mileRate, rank.mile_rate, '料率はランク master 由来');
  assert.ok(mail.payload.bookValue > 0, '対象簿価が入る');

  outbox.length = 0;
  await notifications.runAnnualRewardNotices();
  assert.strictEqual(outbox.filter(m => m.name === 'sendAnnualRewardNotice').length, 0);
});

test('購入時の還元は年次還元の通知対象にしない', async () => {
  await makeMemberWithWine('PRESTIGE');   // source_type='purchase_reward' のロットができる
  await notifications.runAnnualRewardNotices();
  const mine = outbox.filter(m =>
    m.name === 'sendAnnualRewardNotice' && m.payload.email === `mail${seq}@example.test`);
  assert.strictEqual(mine.length, 0);
});

test('古い還元は通知対象から外れる（バッチ有効化時の一斉送信を防ぐ）', async () => {
  const { memberId } = await makeMemberWithWine('PRESTIGE');
  await members.grantAnnualReward(memberId);
  // 付与日を30日前にずらす＝通知の窓（7日）から外れる
  await db.prepare(`UPDATE mile_lots SET granted_at = ? WHERE member_id = ? AND source_type = 'annual_reward'`)
    .run(isoAfterDays(-30), memberId);

  await notifications.runAnnualRewardNotices();
  const mine = outbox.filter(m =>
    m.name === 'sendAnnualRewardNotice' && m.payload.email === `mail${seq}@example.test`);
  assert.strictEqual(mine.length, 0);
});

// ───────────────────────────────── ③ 四半期レポート

test('四半期レポートには簿価・時価・含み益・ランク・次ランクが入る', async () => {
  const { memberId } = await makeMemberWithWine('PRESTIGE');
  // 時価を1割上げて含み益を作る
  for (const h of await members.listHoldings(memberId)) {
    await members.addValuation(h.id, Math.round(h.acquired_unit_price * 1.1));
  }

  const result = await notifications.runQuarterlyReports({ force: true });
  assert.ok(result.count >= 1);

  const mail = outbox.find(m =>
    m.name === 'sendQuarterlyReport' && m.payload.email === `mail${seq}@example.test`);
  assert.ok(mail);
  const p = mail.payload;
  assert.ok(p.quarterLabel.includes('四半期'));
  assert.ok(p.bookValue > 0);
  assert.ok(p.marketValue > p.bookValue, '時価が簿価を上回る');
  assert.ok(p.unrealizedGain > 0, '含み益が出る');
  assert.strictEqual(p.rankName, 'PRESTIGE');
  assert.ok(p.nextRank && p.nextRank.remaining > 0, '次ランクまでの残りが入る');
  assert.ok(typeof p.balance === 'number');
});

test('四半期レポートは同じ四半期に二度送られない', async () => {
  await makeMemberWithWine('PRESTIGE');
  await notifications.runQuarterlyReports({ force: true });
  const first = outbox.filter(m => m.name === 'sendQuarterlyReport').length;
  assert.ok(first >= 1);

  outbox.length = 0;
  await notifications.runQuarterlyReports({ force: true });
  assert.strictEqual(outbox.filter(m => m.name === 'sendQuarterlyReport').length, 0);
});

test('四半期の配信期間を過ぎていると流さない', async () => {
  await makeMemberWithWine('PRESTIGE');
  // 四半期の中日を指定する（1月〜3月なら2月15日あたり）
  const now = new Date();
  const q = Math.floor(now.getUTCMonth() / 3);
  const midQuarter = new Date(Date.UTC(now.getUTCFullYear(), q * 3 + 1, 15)).toISOString();

  const result = await notifications.runQuarterlyReports({ at: midQuarter });
  assert.strictEqual(result.count, 0);
  assert.match(result.skipped, /配信期間外/);
});

test('四半期のラベルとキーが月から正しく決まる', () => {
  assert.strictEqual(notifications.quarterOf('2026-01-15T00:00:00Z').key, '2026Q1');
  assert.strictEqual(notifications.quarterOf('2026-07-01T00:00:00Z').key, '2026Q3');
  assert.strictEqual(notifications.quarterOf('2026-12-31T00:00:00Z').label, '2026年 第4四半期');
});

test('保有ワインがない会員には四半期レポートを送らない', async () => {
  seq += 1;
  const userId = await insertReturningId(
    `INSERT INTO users (username, email, password_hash, display_name) VALUES (?, ?, ?, ?)`,
    [`mail_empty_${seq}`, `empty${seq}@example.test`, 'x', '保有なし']
  );
  await members.createAccount(userId);

  await notifications.runQuarterlyReports({ force: true });
  const mine = outbox.filter(m => m.payload.email === `empty${seq}@example.test`);
  assert.strictEqual(mine.length, 0);
});

// ───────────────────────────────── まとめて実行

test('MEMBER_MAIL_BATCH=1 なら3種類の通知が一度に回る', async () => {
  const { memberId } = await makeMemberWithWine('GOLD');
  await db.prepare(`UPDATE mile_lots SET expires_at = ? WHERE member_id = ? AND kind = 'bonus'`)
    .run(isoAfterDays(10), memberId);
  await members.grantAnnualReward(memberId);

  process.env.MEMBER_MAIL_BATCH = '1';
  try {
    const { results } = await notifications.runAll({ force: true });
    const types = results.map(r => r.type);
    assert.deepStrictEqual(types, ['mile_expiry', 'annual_reward', 'quarterly_report']);
    assert.ok(outbox.length >= 3, '3種類とも送られる');
  } finally {
    delete process.env.MEMBER_MAIL_BATCH;
  }
});
