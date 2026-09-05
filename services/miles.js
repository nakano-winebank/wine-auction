/**
 * ワインマイル台帳
 *
 * 8/31 中谷氏MTGでの決定事項に基づく:
 *   - マイルはコミュニティ通貨。ワイン購入以外（スクール・イベント・オークション）でも使える
 *   - 利用に応じて付与される「期間限定マイル」は 3〜6ヶ月の有効期限を持つ
 *
 * 設計:
 *   付与は「ロット」単位で記録し、消費は有効期限の近いロットから順に引き当てる（FIFO by expiry）。
 *   期限切れは sweep で remaining を 0 にし、失効トランザクションを 1 本立てる。
 *   残高は mile_lots.remaining_amount の合計を正とし、mile_transactions は監査証跡。
 */
const db = require('../database');
const { insertReturningId, nowIso, isoAfterDays } = require('../db/helpers');

/** 種別ごとの既定有効期間（日）。grant 時に validDays を渡せば個別に上書きできる。 */
const MILE_VALIDITY_DAYS = {
  reward:   365, // 預かり資産に対する年次還元マイル
  bonus:    180, // 行動連動（オークション参加・来店など）＝期間限定マイル 6ヶ月
  campaign:  90, // 販促。3ヶ月
  adjust:   365, // 手動調整
};

const GRANT_KINDS = Object.keys(MILE_VALIDITY_DAYS);

/** 現在の残高（有効期限内のロット残の合計）。 */
async function getBalance(memberId, at = nowIso()) {
  const row = await db.prepare(`
    SELECT COALESCE(SUM(remaining_amount), 0) AS balance
    FROM mile_lots
    WHERE member_id = ? AND remaining_amount > 0
      AND (expires_at IS NULL OR expires_at > ?)
  `).get(memberId, at);
  return Number(row ? row.balance : 0);
}

/**
 * 失効予定の内訳。会員に「いつ何マイル消えるか」を見せるための集計。
 * withinDays を指定するとその期間内に切れるものだけを返す。
 */
async function getExpirySchedule(memberId, withinDays = null) {
  const now = nowIso();
  const params = [memberId, now];
  let cutoff = '';
  if (withinDays !== null) {
    cutoff = ' AND expires_at <= ?';
    params.push(isoAfterDays(withinDays));
  }
  const lots = await db.prepare(`
    SELECT id, kind, remaining_amount, granted_at, expires_at, source_type, memo
    FROM mile_lots
    WHERE member_id = ? AND remaining_amount > 0
      AND expires_at IS NOT NULL AND expires_at > ?${cutoff}
    ORDER BY expires_at ASC
  `).all(...params);
  return lots.map(l => ({ ...l, remaining_amount: Number(l.remaining_amount) }));
}

/**
 * マイルを付与する。
 * @param {number} memberId
 * @param {number} amount   付与額面（正の整数）
 * @param {object} opts     { kind, validDays, sourceType, sourceId, memo, grantedAt }
 */
async function grant(memberId, amount, opts = {}) {
  const value = Math.round(Number(amount));
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error('付与マイルは1以上の整数で指定してください');
  }
  const kind = opts.kind || 'reward';
  if (!GRANT_KINDS.includes(kind)) {
    throw new Error(`不明なマイル種別です: ${kind}`);
  }

  const grantedAt = opts.grantedAt || nowIso();
  const validDays = opts.validDays === undefined ? MILE_VALIDITY_DAYS[kind] : opts.validDays;
  const expiresAt = validDays === null ? null : isoAfterDays(validDays, new Date(grantedAt));

  const lotId = await insertReturningId(`
    INSERT INTO mile_lots
      (member_id, kind, granted_amount, remaining_amount, granted_at, expires_at, source_type, source_id, memo, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [memberId, kind, value, value, grantedAt, expiresAt,
      opts.sourceType || null, opts.sourceId || null, opts.memo || null, nowIso()]);

  const balance = await getBalance(memberId);
  await insertReturningId(`
    INSERT INTO mile_transactions
      (member_id, lot_id, type, amount, balance_after, occurred_at, channel, reference, memo, created_at)
    VALUES (?, ?, 'grant', ?, ?, ?, ?, ?, ?, ?)
  `, [memberId, lotId, value, balance, grantedAt,
      opts.channel || null, opts.sourceId || null, opts.memo || null, nowIso()]);

  return { lotId, amount: value, expiresAt, balance };
}

/**
 * マイルを消費する。有効期限の近いロットから順に引き当てる。
 * 残高不足の場合は何も書き込まずに例外を投げる。
 */
async function redeem(memberId, amount, opts = {}) {
  const value = Math.round(Number(amount));
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error('利用マイルは1以上の整数で指定してください');
  }

  const occurredAt = opts.occurredAt || nowIso();
  const balance = await getBalance(memberId, occurredAt);
  if (balance < value) {
    throw new Error(`マイル残高が不足しています（残高 ${balance.toLocaleString()} / 必要 ${value.toLocaleString()}）`);
  }

  // 期限が近い順、次に付与が古い順。期限なしは最後に回す。
  const lots = await db.prepare(`
    SELECT id, remaining_amount, expires_at
    FROM mile_lots
    WHERE member_id = ? AND remaining_amount > 0
      AND (expires_at IS NULL OR expires_at > ?)
    ORDER BY (CASE WHEN expires_at IS NULL THEN 1 ELSE 0 END), expires_at ASC, granted_at ASC, id ASC
  `).all(memberId, occurredAt);

  let left = value;
  const applied = [];
  let running = balance;

  for (const lot of lots) {
    if (left <= 0) break;
    const take = Math.min(Number(lot.remaining_amount), left);
    await db.prepare('UPDATE mile_lots SET remaining_amount = remaining_amount - ? WHERE id = ?')
      .run(take, lot.id);
    left -= take;
    running -= take;
    await insertReturningId(`
      INSERT INTO mile_transactions
        (member_id, lot_id, type, amount, balance_after, occurred_at, channel, reference, memo, created_at)
      VALUES (?, ?, 'redeem', ?, ?, ?, ?, ?, ?, ?)
    `, [memberId, lot.id, -take, running, occurredAt,
        opts.channel || null, opts.reference || null, opts.memo || null, nowIso()]);
    applied.push({ lotId: lot.id, amount: take, expiresAt: lot.expires_at });
  }

  return { redeemed: value, balance: running, lots: applied };
}

/**
 * 有効期限切れロットを失効させる。日次バッチから呼ぶ想定。
 * memberId を渡すとその会員だけを対象にする。
 */
async function expireLots(at = nowIso(), memberId = null) {
  const params = [at];
  let scope = '';
  if (memberId !== null) {
    scope = ' AND member_id = ?';
    params.push(memberId);
  }
  const lots = await db.prepare(`
    SELECT id, member_id, remaining_amount
    FROM mile_lots
    WHERE remaining_amount > 0 AND expires_at IS NOT NULL AND expires_at <= ?${scope}
    ORDER BY member_id ASC, expires_at ASC
  `).all(...params);

  let total = 0;
  for (const lot of lots) {
    const amount = Number(lot.remaining_amount);
    await db.prepare('UPDATE mile_lots SET remaining_amount = 0 WHERE id = ?').run(lot.id);
    const balance = await getBalance(lot.member_id, at);
    await insertReturningId(`
      INSERT INTO mile_transactions
        (member_id, lot_id, type, amount, balance_after, occurred_at, channel, reference, memo, created_at)
      VALUES (?, ?, 'expire', ?, ?, ?, NULL, NULL, ?, ?)
    `, [lot.member_id, lot.id, -amount, balance, at, '有効期限切れ', nowIso()]);
    total += amount;
  }

  return { lots: lots.length, amount: total };
}

/** 台帳の明細。 */
async function listTransactions(memberId, limit = 100, offset = 0) {
  const rows = await db.prepare(`
    SELECT t.*, l.kind, l.expires_at
    FROM mile_transactions t
    LEFT JOIN mile_lots l ON t.lot_id = l.id
    WHERE t.member_id = ?
    ORDER BY t.occurred_at DESC, t.id DESC
    LIMIT ? OFFSET ?
  `).all(memberId, limit, offset);
  return rows.map(r => ({
    ...r,
    amount: Number(r.amount),
    balance_after: Number(r.balance_after),
  }));
}

/** 期間内の付与・利用・失効のサマリ。PL 突合用。 */
async function summarize(memberId, from, to) {
  const rows = await db.prepare(`
    SELECT type, COALESCE(SUM(amount), 0) AS total, COUNT(*) AS count
    FROM mile_transactions
    WHERE member_id = ? AND occurred_at >= ? AND occurred_at < ?
    GROUP BY type
  `).all(memberId, from, to);
  const out = { granted: 0, redeemed: 0, expired: 0, adjusted: 0 };
  for (const r of rows) {
    const total = Number(r.total);
    if (r.type === 'grant') out.granted += total;
    else if (r.type === 'redeem') out.redeemed += Math.abs(total);
    else if (r.type === 'expire') out.expired += Math.abs(total);
    else out.adjusted += total;
  }
  return out;
}

module.exports = {
  MILE_VALIDITY_DAYS,
  GRANT_KINDS,
  getBalance,
  getExpirySchedule,
  grant,
  redeem,
  expireLots,
  listTransactions,
  summarize,
};
