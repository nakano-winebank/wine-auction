/**
 * デモ用 時間送り API（/api/demo）
 *
 * ⚠️ 検証専用。server.js は DEMO_MODE=1 のときだけこのルータを登録する。
 *    本番環境では DEMO_MODE を設定しないこと。
 */
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const members = require('../services/members');
const demo = require('../services/demo');

router.use(authenticateToken);

// ルータが登録されていても、実行時にもう一度フラグを確認する（二重の歯止め）。
router.use((req, res, next) => {
  if (!demo.isEnabled()) {
    return res.status(403).json({ error: 'デモ機能は無効です' });
  }
  next();
});

router.get('/status', (req, res) => {
  res.json({ enabled: true, defaultAnnualGrowthRate: demo.DEFAULT_ANNUAL_GROWTH_RATE });
});

/** 自分の会員口座の時間を進める。他人の口座は操作できない。 */
router.post('/advance', async (req, res) => {
  try {
    const account = await members.getAccountByUser(req.user.id);
    if (!account) throw new Error('会員口座が開設されていません');

    const days = req.body.days === undefined ? 365 : req.body.days;
    const result = await demo.advanceTime(account.id, days, {
      annualGrowthRate: req.body.annualGrowthRate,
    });
    res.json(result);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

module.exports = router;
