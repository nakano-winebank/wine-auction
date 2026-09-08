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

const handle = (fn) => async (req, res) => {
  try {
    await fn(req, res);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

/**
 * プログラムの公開情報（ランク別の付与率・利用先ごとの充当レート）。
 *
 * 利用規約が「当社ウェブサイトに掲載する」と約束している内容そのものなので、
 * 規約ページがこれを読んで描画する。規約本文に数値を書き写さないことで、
 * master を変えたときに規約の記載とずれるのを防いでいる。
 *
 * 個人情報を含まない公開情報のため、ログイン不要。認証を掛ける前に登録している。
 */
router.get('/program', handle(async (req, res) => {
  const ranks = await members.listRanks();
  res.json({
    ranks: ranks.map(r => ({
      code: r.code, name: r.name,
      minBookValue: r.min_book_value,
      mileRate: r.mile_rate,
      feeRate: r.fee_rate,
    })),
    channels: await miles.listChannels(),
    validityDays: miles.MILE_VALIDITY_DAYS,
    expiryNoticeDays: 30,
  });
}));

router.use(authenticateToken);

const handleAuthed = handle;

/** 画面が最初に叩く。どの機能が開いているかをフロントに伝える。 */
router.get('/config', handle(async (req, res) => {
  const account = await members.getAccountByUser(req.user.id);
  res.json({
    hasAccount: !!account,
    demoMode: demo.isEnabled(),
    // 決済未接続のため、プラン購入も DEMO_MODE でしか動かない
    planPurchaseEnabled: demo.isEnabled(),
    mileToYen: miles.MILE_TO_YEN,
    // 充当レート込み。画面は交換先を選ぶ前にこれを表示する（景表法の有利誤認表示対策）
    channels: await miles.listChannels(),
  });
}));

// ───────────────────────────────── ワイン購入

router.get('/plans', handle(async (req, res) => {
  res.json({ plans: await purchase.listPlans() });
}));

/**
 * ⚠️ 決済が未接続のため、DEMO_MODE=1 のときだけ実行できる。
 *
 * このエンドポイントは呼ばれた時点で保有ワイン（＝簿価）とマイルを発生させる。
 * 決済を挟まないまま公開すると、ログインできる利用者が任意回数呼んで資産とマイルを
 * 無制限に作れてしまう（作られたマイルはそのまま各チャネルで充当できてしまう）。
 *
 * Pay.jp を接続する際は、このフラグ判定を「決済成立の確認」に置き換え、決済IDで冪等にすること。
 * プラン一覧の取得（GET /plans）は情報を返すだけなので閉じていない。
 */
router.post('/purchase', handle(async (req, res) => {
  if (!demo.isEnabled()) {
    return res.status(403).json({
      error: 'ただいまオンラインでのご購入を承っておりません。担当コンシェルジュまでお問い合わせください。',
      reason: 'payment_not_connected',
    });
  }
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

module.exports = router;
