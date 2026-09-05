/**
 * 管理者向け 会員管理 API
 * 会員口座の開設、保有ワインの登録・出庫、時価更新、手数料計上、マイルの付与・利用・失効。
 */
const express = require('express');
const router = express.Router();
const db = require('../database');
const { authenticateToken } = require('../middleware/auth');
const { nowIso } = require('../db/helpers');
const members = require('../services/members');
const miles = require('../services/miles');

async function requireAdmin(req, res, next) {
  const user = await db.prepare('SELECT is_admin FROM users WHERE id = ?').get(req.user.id);
  if (!user || !user.is_admin) return res.status(403).json({ error: '管理者権限が必要です' });
  next();
}

router.use(authenticateToken, requireAdmin);

// エラーを 400 に落とす薄いラッパ。各ハンドラで try/catch を書かずに済ませる。
const handle = (fn) => async (req, res) => {
  try {
    await fn(req, res);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

// ───────────────────────────────── ランク

router.get('/ranks', handle(async (req, res) => {
  res.json({ ranks: await members.listRanks() });
}));

router.patch('/ranks/:code', handle(async (req, res) => {
  const { minBookValue, feeRate, mileRate, name, isActive } = req.body;
  const fields = [];
  const params = [];
  if (minBookValue !== undefined) { fields.push('min_book_value = ?'); params.push(Math.round(Number(minBookValue))); }
  if (feeRate !== undefined)      { fields.push('fee_rate = ?');       params.push(Number(feeRate)); }
  if (mileRate !== undefined)     { fields.push('mile_rate = ?');      params.push(Number(mileRate)); }
  if (name !== undefined)         { fields.push('name = ?');           params.push(name); }
  if (isActive !== undefined)     { fields.push('is_active = ?');      params.push(isActive ? 1 : 0); }
  if (!fields.length) throw new Error('更新する項目がありません');
  params.push(req.params.code);
  await db.prepare(`UPDATE member_ranks SET ${fields.join(', ')} WHERE code = ?`).run(...params);
  res.json({ rank: await members.getRank(req.params.code) });
}));

// 有効期限切れの一括失効。id を省略すると全会員が対象。
// 「/:id」を含む可変ルートより前に置き、id として解釈されないようにする。
router.post('/miles/expire', handle(async (req, res) => {
  const memberId = req.body.memberId ? parseInt(req.body.memberId, 10) : null;
  res.json(await miles.expireLots(nowIso(), memberId));
}));

// ───────────────────────────────── 会員口座

router.get('/', handle(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 100, 500);
  const offset = parseInt(req.query.offset, 10) || 0;
  const accounts = await members.listAccounts({ status: req.query.status || null, limit, offset });

  // 一覧に簿価・時価・マイル残高を添えて、明細を開かなくても状況が分かるようにする
  const rows = [];
  for (const a of accounts) {
    const [portfolio, balance] = await Promise.all([
      members.getPortfolioSummary(a.id),
      miles.getBalance(a.id),
    ]);
    rows.push({ ...a, portfolio, mile_balance: balance });
  }
  res.json({ members: rows });
}));

router.post('/', handle(async (req, res) => {
  const { userId, lockedRankCode, note } = req.body;
  if (!userId) throw new Error('userId は必須です');
  const account = await members.createAccount(parseInt(userId, 10), { lockedRankCode, note });
  res.status(201).json({ member: account });
}));

router.get('/:id', handle(async (req, res) => {
  const overview = await members.getMemberOverview(parseInt(req.params.id, 10));
  if (!overview) return res.status(404).json({ error: '会員口座が見つかりません' });
  res.json(overview);
}));

router.patch('/:id', handle(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { status, lockedRankCode, note } = req.body;
  const fields = [];
  const params = [];
  if (status !== undefined)         { fields.push('status = ?');           params.push(status); }
  if (lockedRankCode !== undefined) { fields.push('locked_rank_code = ?'); params.push(lockedRankCode || null); }
  if (note !== undefined)           { fields.push('note = ?');             params.push(note); }
  if (!fields.length) throw new Error('更新する項目がありません');
  fields.push('updated_at = ?');
  params.push(nowIso(), id);
  await db.prepare(`UPDATE member_accounts SET ${fields.join(', ')} WHERE id = ?`).run(...params);
  await members.recalcRank(id);
  res.json({ member: await members.getAccount(id) });
}));

// ───────────────────────────────── 保有ワイン

router.get('/:id/holdings', handle(async (req, res) => {
  const holdings = await members.listHoldings(parseInt(req.params.id, 10), {
    includeReleased: req.query.include_released === '1',
  });
  res.json({ holdings });
}));

router.post('/:id/holdings', handle(async (req, res) => {
  const holding = await members.addHolding(parseInt(req.params.id, 10), req.body);
  res.status(201).json({ holding });
}));

router.patch('/holdings/:holdingId', handle(async (req, res) => {
  const holding = await members.updateHolding(parseInt(req.params.holdingId, 10), req.body);
  res.json({ holding });
}));

router.post('/holdings/:holdingId/valuations', handle(async (req, res) => {
  const { unitMarketPrice, asOf, source } = req.body;
  const valuation = await members.addValuation(
    parseInt(req.params.holdingId, 10), unitMarketPrice, { asOf, source });
  res.status(201).json({ valuation });
}));

// ───────────────────────────────── 管理手数料

router.get('/:id/fees', handle(async (req, res) => {
  res.json({ fees: await members.listFees(parseInt(req.params.id, 10)) });
}));

router.post('/:id/fees', handle(async (req, res) => {
  const { periodStart, periodEnd, feeRate } = req.body;
  if (!periodStart || !periodEnd) throw new Error('periodStart と periodEnd は必須です');
  const fee = await members.accrueManagementFee(
    parseInt(req.params.id, 10), periodStart, periodEnd, { feeRate });
  res.status(201).json({ fee });
}));

router.patch('/fees/:feeId', handle(async (req, res) => {
  const { status } = req.body;
  const allowed = ['draft', 'billed', 'paid', 'void'];
  if (!allowed.includes(status)) throw new Error(`status は ${allowed.join(' / ')} のいずれかです`);
  const stamp = status === 'billed' ? 'billed_at' : status === 'paid' ? 'paid_at' : null;
  const sql = stamp
    ? `UPDATE management_fees SET status = ?, ${stamp} = ? WHERE id = ?`
    : 'UPDATE management_fees SET status = ? WHERE id = ?';
  const params = stamp
    ? [status, nowIso(), parseInt(req.params.feeId, 10)]
    : [status, parseInt(req.params.feeId, 10)];
  await db.prepare(sql).run(...params);
  res.json({ fee: await db.prepare('SELECT * FROM management_fees WHERE id = ?').get(parseInt(req.params.feeId, 10)) });
}));

// ───────────────────────────────── マイル

router.get('/:id/miles', handle(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const [balance, expiring, transactions] = await Promise.all([
    miles.getBalance(id),
    miles.getExpirySchedule(id),
    miles.listTransactions(id, 200),
  ]);
  res.json({ balance, expiring, transactions });
}));

router.post('/:id/miles/grant', handle(async (req, res) => {
  const { amount, kind, validDays, sourceType, sourceId, memo, channel } = req.body;
  const result = await miles.grant(parseInt(req.params.id, 10), amount, {
    kind, validDays, sourceType, sourceId, memo, channel,
  });
  res.status(201).json(result);
}));

// 年次還元。額面はランクの還元率 × 簿価から自動算出する。
router.post('/:id/miles/annual-reward', handle(async (req, res) => {
  const { mileRate, periodRatio, validDays, memo } = req.body;
  const result = await members.grantAnnualReward(parseInt(req.params.id, 10), {
    mileRate, periodRatio, validDays, memo,
  });
  res.status(201).json(result);
}));

router.post('/:id/miles/redeem', handle(async (req, res) => {
  const { amount, channel, reference, memo } = req.body;
  const result = await miles.redeem(parseInt(req.params.id, 10), amount, { channel, reference, memo });
  res.json(result);
}));

module.exports = router;
