/**
 * 会員向け通知メールのバッチ
 *
 * ⚠️ 既定では送信しない。環境変数 MEMBER_MAIL_BATCH=1 を明示的に設定したときだけ動く。
 *    本番には既に RESEND_API_KEY が入っているため、フラグなしで有効にすると
 *    ブランチをデプロイした瞬間に全会員へ一斉送信されてしまう。既定を「送らない」にしてあるのはこのため。
 *
 * 二重送信の防止:
 *   member_notifications に「誰に・何の通知を・どの対象について送ったか」を記録し、
 *   (member_id, type, dedupe_key) に UNIQUE インデックスを張っている。
 *   バッチが1日に何度走っても、同じ対象への通知は一度しか出ない。
 *
 * 動作確認:
 *   dryRun: true を渡すと、送信も記録もせずに「送る予定の内容」だけを返す。
 */
const db = require('../database');
const { insertReturningId, nowIso, isoAfterDays } = require('../db/helpers');
const members = require('./members');
const miles = require('./miles');
const mailer = require('../utils/mailer');

/** バッチを動かしてよいか。明示的な opt-in を要求する。 */
function isBatchEnabled() {
  return process.env.MEMBER_MAIL_BATCH === '1';
}

const TYPES = {
  MILE_EXPIRY: 'mile_expiry',
  ANNUAL_REWARD: 'annual_reward',
  QUARTERLY_REPORT: 'quarterly_report',
};

/** 失効予告を出すリードタイム（日）。 */
const EXPIRY_WARNING_DAYS = 30;

/**
 * 年次還元の通知対象にする「最近の付与」の範囲（日）。
 * これがないと、バッチを初めて有効にした日に過去の還元すべてが通知されてしまう。
 */
const REWARD_NOTICE_WINDOW_DAYS = 7;

/** 四半期レポートを流す、四半期開始からの日数。 */
const QUARTER_REPORT_WINDOW_DAYS = 7;

// ───────────────────────────────── 送信記録

async function alreadySent(memberId, type, dedupeKey) {
  const row = await db.prepare(
    'SELECT id FROM member_notifications WHERE member_id = ? AND type = ? AND dedupe_key = ?'
  ).get(memberId, type, dedupeKey);
  return !!row;
}

async function recordSent(memberId, type, dedupeKey, toEmail, detail, status = 'sent') {
  return insertReturningId(`
    INSERT INTO member_notifications
      (member_id, type, dedupe_key, status, to_email, detail, sent_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [memberId, type, dedupeKey, status, toEmail || null,
      detail ? JSON.stringify(detail) : null, nowIso(), nowIso()]);
}

/** 送信対象になる会員（口座が有効で、メールアドレスがある人）。 */
async function activeMembers() {
  return db.prepare(`
    SELECT m.id, m.rank_code, u.email, u.display_name, u.full_name
    FROM member_accounts m
    JOIN users u ON m.user_id = u.id
    WHERE m.status = 'active' AND u.email IS NOT NULL AND u.email != ''
    ORDER BY m.id ASC
  `).all();
}

function displayName(row) {
  return row.full_name || row.display_name || 'お客様';
}

// ───────────────────────────────── ① マイル失効30日前の予告

/**
 * 30日以内に失効するロットを会員ごとにまとめて1通で知らせる。
 * 通知済みかどうかはロット単位で判定するので、あとから期限が近づいたロットは
 * そのときに改めて通知される。
 */
async function runExpiryWarnings(opts = {}) {
  const at = opts.at || nowIso();
  const cutoff = isoAfterDays(opts.withinDays || EXPIRY_WARNING_DAYS, new Date(at));
  const sent = [];

  for (const member of await activeMembers()) {
    const lots = await db.prepare(`
      SELECT id, kind, remaining_amount, expires_at
      FROM mile_lots
      WHERE member_id = ? AND remaining_amount > 0
        AND expires_at IS NOT NULL AND expires_at > ? AND expires_at <= ?
      ORDER BY expires_at ASC
    `).all(member.id, at, cutoff);

    const targets = [];
    for (const lot of lots) {
      if (await alreadySent(member.id, TYPES.MILE_EXPIRY, `lot=${lot.id}`)) continue;
      targets.push(lot);
    }
    if (!targets.length) continue;

    const amount = targets.reduce((sum, l) => sum + Number(l.remaining_amount), 0);
    const payload = {
      email: member.email,
      name: displayName(member),
      amount,
      expiresAt: targets[0].expires_at,
      balance: await miles.getBalance(member.id),
      lots: targets.map(l => ({
        amount: Number(l.remaining_amount), expiresAt: l.expires_at, kind: l.kind,
      })),
    };

    if (opts.dryRun) { sent.push({ memberId: member.id, ...payload, dryRun: true }); continue; }

    try {
      await mailer.sendMileExpiryWarning(payload);
      for (const lot of targets) {
        await recordSent(member.id, TYPES.MILE_EXPIRY, `lot=${lot.id}`, member.email,
          { amount: Number(lot.remaining_amount), expiresAt: lot.expires_at });
      }
      sent.push({ memberId: member.id, amount, lots: targets.length });
    } catch (e) {
      console.error(`マイル失効予告の送信に失敗（会員${member.id}）:`, e.message);
      await recordSent(member.id, TYPES.MILE_EXPIRY, `lot=${targets[0].id}`, member.email,
        { error: e.message }, 'failed');
    }
  }

  return { type: TYPES.MILE_EXPIRY, count: sent.length, sent };
}

// ───────────────────────────────── ② 年次還元マイルの付与通知

async function runAnnualRewardNotices(opts = {}) {
  const at = opts.at || nowIso();
  const since = isoAfterDays(-(opts.windowDays || REWARD_NOTICE_WINDOW_DAYS), new Date(at));
  const sent = [];

  for (const member of await activeMembers()) {
    const lots = await db.prepare(`
      SELECT id, granted_amount, granted_at, expires_at
      FROM mile_lots
      WHERE member_id = ? AND kind = 'reward' AND source_type = 'annual_reward'
        AND granted_at >= ? AND granted_at <= ?
      ORDER BY granted_at ASC
    `).all(member.id, since, at);

    for (const lot of lots) {
      const key = `lot=${lot.id}`;
      if (await alreadySent(member.id, TYPES.ANNUAL_REWARD, key)) continue;

      const rank = await members.getRank(member.rank_code);
      const summary = await members.getPortfolioSummary(member.id);
      const payload = {
        email: member.email,
        name: displayName(member),
        amount: Number(lot.granted_amount),
        expiresAt: lot.expires_at,
        balance: await miles.getBalance(member.id),
        rankName: rank ? rank.name : '—',
        mileRate: rank ? rank.mile_rate : 0,
        bookValue: summary.bookValue,
      };

      if (opts.dryRun) { sent.push({ memberId: member.id, ...payload, dryRun: true }); continue; }

      try {
        await mailer.sendAnnualRewardNotice(payload);
        await recordSent(member.id, TYPES.ANNUAL_REWARD, key, member.email,
          { amount: payload.amount });
        sent.push({ memberId: member.id, amount: payload.amount });
      } catch (e) {
        console.error(`年次還元通知の送信に失敗（会員${member.id}）:`, e.message);
        await recordSent(member.id, TYPES.ANNUAL_REWARD, key, member.email,
          { error: e.message }, 'failed');
      }
    }
  }

  return { type: TYPES.ANNUAL_REWARD, count: sent.length, sent };
}

// ───────────────────────────────── ③ 四半期の評価額レポート

/** 「2026年 第3四半期」のようなラベルと、四半期の開始日を返す。 */
function quarterOf(at) {
  const d = new Date(at);
  const q = Math.floor(d.getUTCMonth() / 3) + 1;
  const year = d.getUTCFullYear();
  return {
    key: `${year}Q${q}`,
    label: `${year}年 第${q}四半期`,
    startsAt: new Date(Date.UTC(year, (q - 1) * 3, 1)).toISOString(),
  };
}

/**
 * 四半期レポート。四半期の開始から QUARTER_REPORT_WINDOW_DAYS 以内のときだけ流す
 * （日次バッチから毎日呼ばれても、四半期ごとに1回だけ出る）。force で窓を無視できる。
 */
async function runQuarterlyReports(opts = {}) {
  const at = opts.at || nowIso();
  const quarter = quarterOf(at);
  const elapsedDays = (new Date(at) - new Date(quarter.startsAt)) / (24 * 3600 * 1000);

  if (!opts.force && elapsedDays > QUARTER_REPORT_WINDOW_DAYS) {
    return { type: TYPES.QUARTERLY_REPORT, count: 0, sent: [], skipped: '配信期間外' };
  }

  const sent = [];
  for (const member of await activeMembers()) {
    if (await alreadySent(member.id, TYPES.QUARTERLY_REPORT, quarter.key)) continue;

    const summary = await members.getPortfolioSummary(member.id);
    if (summary.bottles === 0) continue; // 保有がない会員には送らない

    const rank = await members.getRank(member.rank_code);
    const payload = {
      email: member.email,
      name: displayName(member),
      quarterLabel: quarter.label,
      bottles: summary.bottles,
      bookValue: summary.bookValue,
      marketValue: summary.marketValue,
      unrealizedGain: summary.unrealizedGain,
      unrealizedGainRate: summary.unrealizedGainRate,
      rankName: rank ? rank.name : '—',
      mileRate: rank ? rank.mile_rate : 0,
      nextRank: await members.nextRankFor(summary.bookValue),
      balance: await miles.getBalance(member.id),
    };

    if (opts.dryRun) { sent.push({ memberId: member.id, ...payload, dryRun: true }); continue; }

    try {
      await mailer.sendQuarterlyReport(payload);
      await recordSent(member.id, TYPES.QUARTERLY_REPORT, quarter.key, member.email,
        { marketValue: summary.marketValue, bookValue: summary.bookValue });
      sent.push({ memberId: member.id, marketValue: summary.marketValue });
    } catch (e) {
      console.error(`四半期レポートの送信に失敗（会員${member.id}）:`, e.message);
      await recordSent(member.id, TYPES.QUARTERLY_REPORT, quarter.key, member.email,
        { error: e.message }, 'failed');
    }
  }

  return { type: TYPES.QUARTERLY_REPORT, count: sent.length, sent, quarter: quarter.key };
}

// ───────────────────────────────── まとめて実行

/**
 * 3種類の通知をまとめて回す。server.js の日次バッチから呼ぶ。
 * dryRun を渡さない限り、MEMBER_MAIL_BATCH=1 でなければ何もしない。
 */
async function runAll(opts = {}) {
  if (!opts.dryRun && !isBatchEnabled()) {
    return { skipped: 'MEMBER_MAIL_BATCH が未設定のため送信しません', results: [] };
  }
  const results = [];
  for (const run of [runExpiryWarnings, runAnnualRewardNotices, runQuarterlyReports]) {
    try {
      results.push(await run(opts));
    } catch (e) {
      console.error('通知バッチのエラー:', e.message);
      results.push({ error: e.message });
    }
  }
  return { results };
}

module.exports = {
  TYPES,
  EXPIRY_WARNING_DAYS,
  REWARD_NOTICE_WINDOW_DAYS,
  QUARTER_REPORT_WINDOW_DAYS,
  isBatchEnabled,
  quarterOf,
  alreadySent,
  runExpiryWarnings,
  runAnnualRewardNotices,
  runQuarterlyReports,
  runAll,
};
