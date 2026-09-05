/**
 * 会員管理（WineBank でワインを購入した後）
 *
 * 会員口座 → 保有ワイン（簿価・時価）→ ランク判定 → 管理手数料 → マイル還元
 * という一連の流れを扱う。金額はすべて円の整数。
 */
const db = require('../database');
const { insertReturningId, nowIso, isoAfterDays } = require('../db/helpers');
const miles = require('./miles');

// ───────────────────────────────── ランク

async function listRanks() {
  const rows = await db.prepare(
    'SELECT * FROM member_ranks WHERE is_active = 1 ORDER BY sort_order ASC'
  ).all();
  return rows.map(r => ({
    ...r,
    min_book_value: Number(r.min_book_value),
    fee_rate: Number(r.fee_rate),
    mile_rate: Number(r.mile_rate),
  }));
}

/** 簿価合計から該当ランクを決める。どのランクにも満たない場合は null。 */
async function rankForBookValue(bookValue) {
  const ranks = await listRanks();
  let hit = null;
  for (const r of ranks) {
    if (bookValue >= r.min_book_value) hit = r;
  }
  return hit;
}

async function getRank(code) {
  if (!code) return null;
  const r = await db.prepare('SELECT * FROM member_ranks WHERE code = ?').get(code);
  if (!r) return null;
  return {
    ...r,
    min_book_value: Number(r.min_book_value),
    fee_rate: Number(r.fee_rate),
    mile_rate: Number(r.mile_rate),
  };
}

// ───────────────────────────────── 会員口座

function buildAccountNo(userId) {
  return `WB${String(userId).padStart(6, '0')}`;
}

/** 会員口座を作る（既にあればそれを返す）。 */
async function createAccount(userId, opts = {}) {
  const existing = await db.prepare('SELECT * FROM member_accounts WHERE user_id = ?').get(userId);
  if (existing) return existing;

  const user = await db.prepare('SELECT id FROM users WHERE id = ?').get(userId);
  if (!user) throw new Error('ユーザーが見つかりません');

  const now = nowIso();
  const id = await insertReturningId(`
    INSERT INTO member_accounts
      (user_id, account_no, rank_code, locked_rank_code, status, joined_at, note, created_at, updated_at)
    VALUES (?, ?, NULL, ?, 'active', ?, ?, ?, ?)
  `, [userId, opts.accountNo || buildAccountNo(userId), opts.lockedRankCode || null,
      opts.joinedAt || now, opts.note || null, now, now]);

  await recalcRank(id);
  return db.prepare('SELECT * FROM member_accounts WHERE id = ?').get(id);
}

async function getAccount(memberId) {
  return db.prepare('SELECT * FROM member_accounts WHERE id = ?').get(memberId);
}

async function getAccountByUser(userId) {
  return db.prepare('SELECT * FROM member_accounts WHERE user_id = ?').get(userId);
}

async function listAccounts({ status = null, limit = 100, offset = 0 } = {}) {
  const params = [];
  let where = '';
  if (status) { where = 'WHERE m.status = ?'; params.push(status); }
  params.push(limit, offset);
  const rows = await db.prepare(`
    SELECT m.*, u.email, u.display_name, u.full_name
    FROM member_accounts m
    JOIN users u ON m.user_id = u.id
    ${where}
    ORDER BY m.id ASC
    LIMIT ? OFFSET ?
  `).all(...params);
  return rows;
}

// ───────────────────────────────── 保有ワイン

const ACTIVE_HOLDING_STATUSES = ['stored', 'shipped'];

/**
 * 保有ワインを登録する。購入直後にここへ入り、以後この行が会員資産の一次情報になる。
 */
async function addHolding(memberId, input) {
  const member = await getAccount(memberId);
  if (!member) throw new Error('会員口座が見つかりません');

  const quantity = parseInt(input.quantity, 10);
  const unitPrice = Math.round(Number(input.acquiredUnitPrice));
  if (!Number.isFinite(quantity) || quantity <= 0) throw new Error('本数は1以上で指定してください');
  if (!Number.isFinite(unitPrice) || unitPrice <= 0) throw new Error('取得単価は1以上で指定してください');
  if (!input.wineName) throw new Error('銘柄名は必須です');

  const now = nowIso();
  const id = await insertReturningId(`
    INSERT INTO holdings
      (member_id, wine_name, producer, vintage, region, volume_ml, quantity,
       acquired_unit_price, acquired_at, purchase_channel, storage_site, storage_location,
       status, note, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [memberId, input.wineName, input.producer || null, input.vintage || null, input.region || null,
      input.volumeMl || 750, quantity, unitPrice, input.acquiredAt || now,
      input.purchaseChannel || null, input.storageSite || null, input.storageLocation || null,
      input.status || 'stored', input.note || null, now, now]);

  // 初回時価が渡されていれば評価も同時に記録する
  if (input.unitMarketPrice) {
    await addValuation(id, input.unitMarketPrice, { source: input.valuationSource || 'manual' });
  }

  await recalcRank(memberId);
  return db.prepare('SELECT * FROM holdings WHERE id = ?').get(id);
}

async function updateHolding(holdingId, patch) {
  const holding = await db.prepare('SELECT * FROM holdings WHERE id = ?').get(holdingId);
  if (!holding) throw new Error('保有ワインが見つかりません');

  const fields = [];
  const params = [];
  const map = {
    quantity: 'quantity', status: 'status', storageSite: 'storage_site',
    storageLocation: 'storage_location', note: 'note', releasedAt: 'released_at',
    acquiredUnitPrice: 'acquired_unit_price',
  };
  for (const [key, column] of Object.entries(map)) {
    if (patch[key] !== undefined) { fields.push(`${column} = ?`); params.push(patch[key]); }
  }
  if (!fields.length) return holding;

  fields.push('updated_at = ?');
  params.push(nowIso(), holdingId);
  await db.prepare(`UPDATE holdings SET ${fields.join(', ')} WHERE id = ?`).run(...params);

  await recalcRank(holding.member_id);
  return db.prepare('SELECT * FROM holdings WHERE id = ?').get(holdingId);
}

/** 最新の時価を紐づけた保有一覧。 */
async function listHoldings(memberId, { includeReleased = false } = {}) {
  const statuses = includeReleased
    ? ['stored', 'shipped', 'sold', 'withdrawn']
    : ACTIVE_HOLDING_STATUSES;
  const placeholders = statuses.map(() => '?').join(', ');

  const rows = await db.prepare(`
    SELECT h.*,
           v.unit_market_price AS latest_market_price,
           v.as_of             AS latest_valuation_at,
           v.source            AS latest_valuation_source
    FROM holdings h
    LEFT JOIN (
      SELECT hv.holding_id, hv.unit_market_price, hv.as_of, hv.source
      FROM holding_valuations hv
      JOIN (
        SELECT holding_id, MAX(as_of) AS as_of
        FROM holding_valuations GROUP BY holding_id
      ) latest ON latest.holding_id = hv.holding_id AND latest.as_of = hv.as_of
    ) v ON v.holding_id = h.id
    WHERE h.member_id = ? AND h.status IN (${placeholders})
    ORDER BY h.acquired_at DESC, h.id DESC
  `).all(memberId, ...statuses);

  return rows.map(r => {
    const quantity = Number(r.quantity);
    const unitBook = Number(r.acquired_unit_price);
    const unitMarket = r.latest_market_price === null || r.latest_market_price === undefined
      ? null : Number(r.latest_market_price);
    return {
      ...r,
      quantity,
      acquired_unit_price: unitBook,
      latest_market_price: unitMarket,
      book_value: unitBook * quantity,
      market_value: unitMarket === null ? null : unitMarket * quantity,
      unrealized_gain: unitMarket === null ? null : (unitMarket - unitBook) * quantity,
    };
  });
}

async function addValuation(holdingId, unitMarketPrice, opts = {}) {
  const price = Math.round(Number(unitMarketPrice));
  if (!Number.isFinite(price) || price < 0) throw new Error('時価は0以上で指定してください');
  const id = await insertReturningId(`
    INSERT INTO holding_valuations (holding_id, as_of, unit_market_price, source, created_at)
    VALUES (?, ?, ?, ?, ?)
  `, [holdingId, opts.asOf || nowIso(), price, opts.source || 'manual', nowIso()]);
  return db.prepare('SELECT * FROM holding_valuations WHERE id = ?').get(id);
}

// ───────────────────────────────── 資産サマリとランク再計算

/** 簿価・時価・含み益の合計。ランク判定と手数料計算の共通の土台。 */
async function getPortfolioSummary(memberId) {
  const holdings = await listHoldings(memberId);
  let bookValue = 0, marketValue = 0, bottles = 0, valuedBookValue = 0;

  for (const h of holdings) {
    bookValue += h.book_value;
    bottles += h.quantity;
    if (h.market_value !== null) {
      marketValue += h.market_value;
      valuedBookValue += h.book_value;
    }
  }

  // 時価未評価の分は簿価で埋めて、合計時価が過小に出ないようにする
  const estimatedMarketValue = marketValue + (bookValue - valuedBookValue);

  return {
    bottles,
    holdingCount: holdings.length,
    bookValue,
    marketValue: estimatedMarketValue,
    valuedBookValue,
    unrealizedGain: estimatedMarketValue - bookValue,
    unrealizedGainRate: bookValue > 0 ? (estimatedMarketValue - bookValue) / bookValue : 0,
  };
}

/**
 * 簿価合計からランクを再判定して保存する。
 * locked_rank_code が入っている会員はそれを優先する（手動据置）。
 */
async function recalcRank(memberId) {
  const member = await getAccount(memberId);
  if (!member) throw new Error('会員口座が見つかりません');

  let code = member.locked_rank_code;
  if (!code) {
    const { bookValue } = await getPortfolioSummary(memberId);
    const rank = await rankForBookValue(bookValue);
    code = rank ? rank.code : null;
  }

  if (code !== member.rank_code) {
    await db.prepare('UPDATE member_accounts SET rank_code = ?, updated_at = ? WHERE id = ?')
      .run(code, nowIso(), memberId);
  }
  return code;
}

// ───────────────────────────────── 管理手数料

/**
 * 期間の管理手数料を計上する（簿価ベース・日割り）。
 * 手数料率はランク master から引く。同一期間の重複計上は防ぐ。
 */
async function accrueManagementFee(memberId, periodStart, periodEnd, opts = {}) {
  const member = await getAccount(memberId);
  if (!member) throw new Error('会員口座が見つかりません');

  const start = new Date(periodStart);
  const end = new Date(periodEnd);
  if (!(end > start)) throw new Error('期間の指定が不正です');

  const dup = await db.prepare(`
    SELECT id FROM management_fees
    WHERE member_id = ? AND period_start = ? AND period_end = ? AND status != 'void'
  `).get(memberId, start.toISOString(), end.toISOString());
  if (dup) throw new Error('同じ期間の手数料が既に計上されています');

  const rank = await getRank(member.rank_code);
  const feeRate = opts.feeRate !== undefined ? Number(opts.feeRate) : (rank ? rank.fee_rate : 0.025);

  const { bookValue } = await getPortfolioSummary(memberId);
  const days = (end - start) / (24 * 3600 * 1000);
  const amount = Math.round(bookValue * feeRate * (days / 365));

  const id = await insertReturningId(`
    INSERT INTO management_fees
      (member_id, period_start, period_end, basis_book_value, fee_rate, amount, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, 'draft', ?)
  `, [memberId, start.toISOString(), end.toISOString(), bookValue, feeRate, amount, nowIso()]);

  return db.prepare('SELECT * FROM management_fees WHERE id = ?').get(id);
}

async function listFees(memberId) {
  const rows = await db.prepare(
    'SELECT * FROM management_fees WHERE member_id = ? ORDER BY period_start DESC, id DESC'
  ).all(memberId);
  return rows.map(r => ({
    ...r,
    basis_book_value: Number(r.basis_book_value),
    amount: Number(r.amount),
    fee_rate: Number(r.fee_rate),
  }));
}

// ───────────────────────────────── 年次マイル還元

/**
 * 預かり資産（簿価）に対する年次マイル還元を付与する。
 * 還元率はランク master 由来。額面 = 簿価 × 還元率 × 期間按分。
 */
async function grantAnnualReward(memberId, opts = {}) {
  const member = await getAccount(memberId);
  if (!member) throw new Error('会員口座が見つかりません');

  const rank = await getRank(member.rank_code);
  if (!rank) throw new Error('ランクが未確定のため還元できません（保有ワインを登録してください）');

  const mileRate = opts.mileRate !== undefined ? Number(opts.mileRate) : rank.mile_rate;
  const { bookValue } = await getPortfolioSummary(memberId);
  const ratio = opts.periodRatio === undefined ? 1 : Number(opts.periodRatio);
  const amount = Math.round(bookValue * mileRate * ratio);

  if (amount <= 0) throw new Error('還元対象の預かり資産がありません');

  return miles.grant(memberId, amount, {
    kind: 'reward',
    validDays: opts.validDays,
    sourceType: 'annual_reward',
    sourceId: opts.sourceId || null,
    memo: opts.memo || `${rank.code} 年次還元 ${(mileRate * 100).toFixed(1)}%`,
  });
}

/** 会員1件の全体像。マイページ・管理画面の両方がこれを使う。 */
async function getMemberOverview(memberId) {
  const member = await getAccount(memberId);
  if (!member) return null;

  const [user, rank, portfolio, holdings, balance, expiring, fees, transactions] = await Promise.all([
    db.prepare('SELECT id, email, display_name, full_name, phone FROM users WHERE id = ?').get(member.user_id),
    getRank(member.rank_code),
    getPortfolioSummary(memberId),
    listHoldings(memberId),
    miles.getBalance(memberId),
    miles.getExpirySchedule(memberId),
    listFees(memberId),
    miles.listTransactions(memberId, 50),
  ]);

  const nextRank = await nextRankFor(portfolio.bookValue);

  // 90日以内に切れる分は UI で警告を出すため、別途集計しておく
  const soonCutoff = isoAfterDays(90);
  const expiringSoon = expiring.filter(l => l.expires_at && l.expires_at <= soonCutoff);
  const expiringSoonAmount = expiringSoon.reduce((sum, l) => sum + l.remaining_amount, 0);

  return {
    member, user, rank, nextRank, portfolio, holdings, fees,
    miles: { balance, expiring, expiringSoon, expiringSoonAmount, transactions },
  };
}

/** 次のランクまでの必要簿価。ゲーミフィケーション用の表示に使う。 */
async function nextRankFor(bookValue) {
  const ranks = await listRanks();
  const next = ranks.find(r => r.min_book_value > bookValue);
  if (!next) return null;
  return { ...next, remaining: next.min_book_value - bookValue };
}

module.exports = {
  listRanks, getRank, rankForBookValue, nextRankFor,
  createAccount, getAccount, getAccountByUser, listAccounts,
  addHolding, updateHolding, listHoldings, addValuation,
  getPortfolioSummary, recalcRank,
  accrueManagementFee, listFees,
  grantAnnualReward, getMemberOverview,
};
