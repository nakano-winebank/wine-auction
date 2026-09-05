/**
 * 会員向け API（マイ・セラー）
 * ログインしている本人の会員口座・保有ワイン・マイルだけを返す。
 */
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const members = require('../services/members');
const miles = require('../services/miles');

// 本人の会員口座を解決する。未開設なら 404 を返し、フロントで案内を出す。
async function resolveMember(req, res, next) {
  const account = await members.getAccountByUser(req.user.id);
  if (!account) {
    return res.status(404).json({ error: 'まだ会員口座が開設されていません', hasAccount: false });
  }
  if (account.status !== 'active') {
    return res.status(403).json({ error: 'この会員口座は現在ご利用いただけません' });
  }
  req.member = account;
  next();
}

router.use(authenticateToken);

// 会員口座の有無だけを確認する（口座がなくても 200 を返す）
router.get('/status', async (req, res) => {
  const account = await members.getAccountByUser(req.user.id);
  res.json({ hasAccount: !!account, status: account ? account.status : null });
});

// マイ・セラー全体
router.get('/', resolveMember, async (req, res) => {
  const overview = await members.getMemberOverview(req.member.id);
  res.json(overview);
});

// 保有ワイン
router.get('/holdings', resolveMember, async (req, res) => {
  const includeReleased = req.query.include_released === '1';
  res.json({ holdings: await members.listHoldings(req.member.id, { includeReleased }) });
});

// 資産サマリ
router.get('/portfolio', resolveMember, async (req, res) => {
  const portfolio = await members.getPortfolioSummary(req.member.id);
  const rank = await members.getRank(req.member.rank_code);
  const nextRank = await members.nextRankFor(portfolio.bookValue);
  res.json({ portfolio, rank, nextRank });
});

// マイル残高・失効予定・明細
router.get('/miles', resolveMember, async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 100, 500);
  const [balance, expiring, transactions] = await Promise.all([
    miles.getBalance(req.member.id),
    miles.getExpirySchedule(req.member.id, parseInt(req.query.within_days, 10) || 180),
    miles.listTransactions(req.member.id, limit),
  ]);
  res.json({ balance, expiring, transactions });
});

// 管理手数料の履歴
router.get('/fees', resolveMember, async (req, res) => {
  res.json({ fees: await members.listFees(req.member.id) });
});

module.exports = router;
