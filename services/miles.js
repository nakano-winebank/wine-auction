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
  reward:    365, // 預かり資産に対する年次還元マイル
  bonus:     180, // 行動連動（オークション参加・来店など）＝期間限定マイル 6ヶ月
  campaign:   90, // 販促。3ヶ月
  adjust:    365, // 手動調整
  purchased: 180, // 有償購入マイル。下の注意書きを必ず読むこと
};

/**
 * ⚠️ 有償購入マイル（kind='purchased'）についての注意 — 法務確認前に本番公開しないこと
 *
 * 無償で「付与」するマイル（reward / bonus / campaign / adjust）は、資金決済法3条1項の
 * 「対価を得て発行される」という要件を満たさないため、前払式支払手段には当たらない。
 * 一方、現金で「購入」できるマイルは対価性があり、自家型前払式支払手段に該当し得る。
 * 該当すると、財務局への届出と、基準日（3/31・9/30）の未使用残高が1,000万円を超えた
 * ときの発行保証金の供託義務が発生する。
 *
 * ただし同法4条2号により「発行の日から6ヶ月以内に限り使用できるもの」は適用除外となる。
 * そのため既定の有効期間を 180日 に置いている。ここを 180 より延ばす、あるいは無期限
 * （null）にすると適用除外から外れるので、変更する場合は必ず法務確認を通すこと。
 *
 * いずれにせよ上記は法令の構造整理であって法務判断ではない。財務局・顧問弁護士の確認が済むまで
 * 有償購入は MILE_PURCHASE_ENABLED フラグで閉じたままにしておくこと（routes/member-shop.js）。
 *
 * 集計は getPurchasedOutstanding() が有償分だけを対象にする。
 */
const PURCHASED_KIND = 'purchased';

const GRANT_KINDS = Object.keys(MILE_VALIDITY_DAYS);

/**
 * マイルを使えるチャネル。8/31 中谷氏MTGの「マイルはコミュニティ通貨」を実装に落としたもの。
 * ワイン購入以外でも使えることがこの一覧で表現されている。
 */
const REDEEM_CHANNELS = [
  { code: 'restaurant',  name: '系列レストラン',     description: 'グループ直営レストランでのお支払いに充当' },
  { code: 'grandmaison', name: 'グランメゾン',       description: '提携グランメゾンのコース・ペアリングに充当' },
  { code: 'school',      name: 'ワインスクール',     description: '講座の受講料に充当' },
  { code: 'event',       name: '会員交流イベント',   description: '試飲会・生産者を招いた会の参加費に充当' },
  { code: 'auction',     name: 'オークション',       description: '落札代金の一部に充当' },
  { code: 'club',        name: 'CLUB年会費',         description: 'WineBank CLUB の年会費に充当' },
  { code: 'wine',        name: 'ワイン購入',         description: 'ワインのご購入代金に充当' },
];

const REDEEM_CHANNEL_CODES = REDEEM_CHANNELS.map(c => c.code);

/** 1マイルあたりの円換算。充当額の表示と、有償分の未使用残高（円）の算定に使う。 */
const MILE_TO_YEN = 1;

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

  // 有償購入分だけ支払対価を記録する。無償付与は NULL のままにして台帳上で分離する。
  const paidAmount = opts.paidAmount === undefined || opts.paidAmount === null
    ? null : Math.round(Number(opts.paidAmount));
  if (paidAmount !== null && (!Number.isFinite(paidAmount) || paidAmount < 0)) {
    throw new Error('支払対価は0以上で指定してください');
  }
  if (kind === PURCHASED_KIND && paidAmount === null) {
    throw new Error('有償購入マイルには支払対価（paidAmount）が必須です');
  }

  const lotId = await insertReturningId(`
    INSERT INTO mile_lots
      (member_id, kind, granted_amount, remaining_amount, paid_amount, granted_at, expires_at, source_type, source_id, memo, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [memberId, kind, value, value, paidAmount, grantedAt, expiresAt,
      opts.sourceType || null, opts.sourceId || null, opts.memo || null, nowIso()]);

  const balance = await getBalance(memberId);
  await insertReturningId(`
    INSERT INTO mile_transactions
      (member_id, lot_id, type, amount, balance_after, occurred_at, channel, reference, memo, created_at)
    VALUES (?, ?, 'grant', ?, ?, ?, ?, ?, ?, ?)
  `, [memberId, lotId, value, balance, grantedAt,
      opts.channel || null, opts.sourceId || null, opts.memo || null, nowIso()]);

  return { lotId, amount: value, kind, paidAmount, expiresAt, balance };
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

  if (opts.channel && !REDEEM_CHANNEL_CODES.includes(opts.channel)) {
    throw new Error(`不明な利用チャネルです: ${opts.channel}`);
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

/**
 * 有償で発行したマイルの未使用残高。資金決済法の基準日残高（3/31・9/30）の算定に使う。
 * 無償付与分は前払式支払手段に当たらないため、この集計から必ず除外する。
 *
 * @param {string} asOf     基準日時（ISO）。この時点で有効なロットだけを数える
 * @param {number} memberId 省略すると全会員の合計
 */
async function getPurchasedOutstanding(asOf = nowIso(), memberId = null) {
  const params = [PURCHASED_KIND, asOf];
  let scope = '';
  if (memberId !== null) {
    scope = ' AND member_id = ?';
    params.push(memberId);
  }
  const row = await db.prepare(`
    SELECT COALESCE(SUM(remaining_amount), 0) AS miles,
           COALESCE(SUM(paid_amount), 0)      AS paid,
           COUNT(*)                           AS lots
    FROM mile_lots
    WHERE kind = ? AND remaining_amount > 0
      AND (expires_at IS NULL OR expires_at > ?)${scope}
  `).get(...params);

  const miles = Number(row ? row.miles : 0);
  return {
    asOf,
    lots: Number(row ? row.lots : 0),
    miles,                              // 未使用マイル数
    yen: miles * MILE_TO_YEN,           // 未使用残高（円）＝供託の判定基礎
    grantedPaidAmount: Number(row ? row.paid : 0), // 発行時に受け取った対価の合計
  };
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
  PURCHASED_KIND,
  REDEEM_CHANNELS,
  REDEEM_CHANNEL_CODES,
  MILE_TO_YEN,
  getBalance,
  getPurchasedOutstanding,
  getExpirySchedule,
  grant,
  redeem,
  expireLots,
  listTransactions,
  summarize,
};
