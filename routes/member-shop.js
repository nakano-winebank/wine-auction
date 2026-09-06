/**
 * 会員向け 購入・マイル利用 API（/api/member/shop）
 *
 * ワインを買う → 口座が開く → マイルが貯まる → マイルを使う、という一連の流れを
 * 会員自身がブラウザから通せるようにするためのエンドポイント群。
 */
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const members = require('../services/members');
const miles = require('../services/miles');
const purchase = require('../services/purchase');
const demo = require('../services/demo');

// ⚠️ 有償のマイル購入は、資金決済法上の前払式支払手段に該当し得るため既定で無効。
//    法務・財務局の確認が済むまで、本番環境でこのフラグを立てないこと。
//    詳細は services/miles.js の PURCHASED_KIND 付近の注意書きを参照。
function milePurchaseEnabled() {
  return process.env.MILE_PURCHASE_ENABLED === '1';
}

router.use(authenticateToken);

const handle = (fn) => async (req, res) => {
  try {
    await fn(req, res);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

/** 画面が最初に叩く。どの機能が開いているかをフロントに伝える。 */
router.get('/config', handle(async (req, res) => {
  const account = await members.getAccountByUser(req.user.id);
  res.json({
    hasAccount: !!account,
    demoMode: demo.isEnabled(),
    milePurchaseEnabled: milePurchaseEnabled(),
    mileToYen: miles.MILE_TO_YEN,
    channels: miles.REDEEM_CHANNELS,
    milePacks: milePurchaseEnabled() ? purchase.listMilePacks() : [],
  });
}));

// ───────────────────────────────── ワイン購入

router.get('/plans', handle(async (req, res) => {
  res.json({ plans: await purchase.listPlans() });
}));

router.post('/purchase', handle(async (req, res) => {
  const { rankCode } = req.body;
  if (!rankCode) throw new Error('プラン（rankCode）を指定してください');
  res.status(201).json(await purchase.purchasePlan(req.user.id, rankCode));
}));

// ───────────────────────────────── マイルを使う

router.post('/miles/redeem', handle(async (req, res) => {
  const account = await members.getAccountByUser(req.user.id);
  if (!account) throw new Error('会員口座が開設されていません');
  if (account.status !== 'active') throw new Error('この会員口座は現在ご利用いただけません');

  const { amount, channel, memo } = req.body;
  const result = await miles.redeem(account.id, amount, { channel, memo });
  res.json(result);
}));

// ───────────────────────────────── マイルを買う（有償・要フラグ）

router.post('/miles/purchase', handle(async (req, res) => {
  if (!milePurchaseEnabled()) {
    return res.status(403).json({
      error: 'マイルの追加購入は現在ご利用いただけません（法務確認中）',
    });
  }
  const { packCode } = req.body;
  if (!packCode) throw new Error('パック（packCode）を指定してください');
  res.status(201).json(await purchase.purchaseMiles(req.user.id, packCode));
}));

module.exports = router;
