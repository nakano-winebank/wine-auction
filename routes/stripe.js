const express = require('express');
const router = express.Router();
const db = require('../database');
const { authenticateToken } = require('../middleware/auth');

// Stripeキーは環境変数から取得（未設定ならテストモード）
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_YOUR_KEY_HERE';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

let stripe;
try {
  stripe = require('stripe')(STRIPE_SECRET_KEY);
} catch (e) {
  console.error('Stripe初期化エラー:', e.message);
}

// 落札確認 & 注文情報取得
router.get('/order/:auctionId', authenticateToken, (req, res) => {
  const auctionId = parseInt(req.params.auctionId);
  const userId = req.user.id;

  const auction = db.prepare(`
    SELECT a.*, u.display_name as seller_name, u.username as seller_username
    FROM auctions a
    JOIN users u ON a.seller_id = u.id
    WHERE a.id = ?
  `).get(auctionId);

  if (!auction) return res.status(404).json({ error: 'オークションが見つかりません' });
  if (auction.status !== 'ended') return res.status(400).json({ error: 'オークションはまだ終了していません' });

  // 落札者確認（最高入札者）
  const topBid = db.prepare(`
    SELECT b.bidder_id, b.amount, u.display_name, u.username
    FROM bids b JOIN users u ON b.bidder_id = u.id
    WHERE b.auction_id = ?
    ORDER BY b.amount DESC LIMIT 1
  `).get(auctionId);

  if (!topBid || topBid.bidder_id !== userId) {
    return res.status(403).json({ error: '落札者ではありません' });
  }

  // 既存の注文確認
  const existingOrder = db.prepare('SELECT * FROM orders WHERE auction_id = ?').get(auctionId);

  res.json({
    auction,
    winner: topBid,
    order: existingOrder || null
  });
});

// Payment Intent 作成
router.post('/create-payment-intent', authenticateToken, (req, res) => {
  const { auction_id } = req.body;
  const userId = req.user.id;

  if (!stripe) return res.status(500).json({ error: 'Stripe未設定です。環境変数STRIPE_SECRET_KEYを設定してください。' });

  const auctionId = parseInt(auction_id);

  const auction = db.prepare('SELECT * FROM auctions WHERE id = ?').get(auctionId);
  if (!auction) return res.status(404).json({ error: 'オークションが見つかりません' });
  if (auction.status !== 'ended') return res.status(400).json({ error: 'オークションはまだ終了していません' });

  // 落札者確認
  const topBid = db.prepare(`
    SELECT bidder_id, amount FROM bids WHERE auction_id = ?
    ORDER BY amount DESC LIMIT 1
  `).get(auctionId);

  if (!topBid || topBid.bidder_id !== userId) {
    return res.status(403).json({ error: '落札者ではありません' });
  }

  // 既存注文チェック（支払済みなら拒否）
  const existingOrder = db.prepare('SELECT * FROM orders WHERE auction_id = ?').get(auctionId);
  if (existingOrder && existingOrder.status === 'paid') {
    return res.status(400).json({ error: 'すでに支払い済みです' });
  }

  stripe.paymentIntents.create({
    amount: topBid.amount,
    currency: 'jpy',
    metadata: {
      auction_id: auctionId.toString(),
      buyer_id: userId.toString(),
      seller_id: auction.seller_id.toString()
    },
    description: `ワインオークション落札: ${auction.title}`
  }).then(paymentIntent => {
    // 注文レコード作成（または更新）
    if (existingOrder) {
      db.prepare(`UPDATE orders SET stripe_payment_intent_id = ?, stripe_status = 'pending' WHERE auction_id = ?`)
        .run(paymentIntent.id, auctionId);
    } else {
      db.prepare(`
        INSERT INTO orders (auction_id, buyer_id, seller_id, amount, stripe_payment_intent_id)
        VALUES (?, ?, ?, ?, ?)
      `).run(auctionId, userId, auction.seller_id, topBid.amount, paymentIntent.id);
    }

    res.json({ client_secret: paymentIntent.client_secret });
  }).catch(err => {
    console.error('Stripe PaymentIntent error:', err);
    res.status(500).json({ error: 'お支払いの準備中にエラーが発生しました' });
  });
});

// 配送情報 & 支払い確定
router.post('/confirm-order', authenticateToken, (req, res) => {
  const {
    auction_id, payment_intent_id,
    shipping_name, shipping_zip, shipping_address, shipping_phone,
    shipping_method, shipping_fee
  } = req.body;
  const userId = req.user.id;

  if (!shipping_name || !shipping_zip || !shipping_address) {
    return res.status(400).json({ error: '配送先情報を入力してください' });
  }

  const method = shipping_method || 'normal';
  const fee = parseInt(shipping_fee) || 0;

  let order = db.prepare('SELECT * FROM orders WHERE auction_id = ? AND buyer_id = ?').get(parseInt(auction_id), userId);

  // デモモード: Stripe未設定の場合は注文レコードがまだないので作成する
  if (!order) {
    const auction = db.prepare('SELECT * FROM auctions WHERE id = ?').get(parseInt(auction_id));
    if (!auction) return res.status(404).json({ error: 'オークションが見つかりません' });
    const topBid = db.prepare('SELECT bidder_id, amount FROM bids WHERE auction_id = ? ORDER BY amount DESC LIMIT 1').get(parseInt(auction_id));
    if (!topBid || topBid.bidder_id !== userId) return res.status(403).json({ error: '落札者ではありません' });
    db.prepare('INSERT INTO orders (auction_id, buyer_id, seller_id, amount, stripe_payment_intent_id, shipping_method, shipping_fee) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(parseInt(auction_id), userId, auction.seller_id, topBid.amount + fee, payment_intent_id || 'demo', method, fee);
    order = db.prepare('SELECT * FROM orders WHERE auction_id = ? AND buyer_id = ?').get(parseInt(auction_id), userId);
  }

  db.prepare(`
    UPDATE orders SET
      shipping_name = ?, shipping_zip = ?, shipping_address = ?, shipping_phone = ?,
      shipping_method = ?, shipping_fee = ?,
      status = 'paid', stripe_status = 'succeeded', paid_at = datetime('now', 'localtime')
    WHERE auction_id = ? AND buyer_id = ?
  `).run(shipping_name, shipping_zip, shipping_address, shipping_phone, method, fee, parseInt(auction_id), userId);

  // 出品者の取引数を更新
  db.prepare('UPDATE users SET trade_count = trade_count + 1 WHERE id = ?').run(order.seller_id);
  db.prepare('UPDATE users SET trade_count = trade_count + 1 WHERE id = ?').run(userId);

  res.json({ success: true, message: '注文が確定しました' });
});

// Stripe Webhook（本番用）
router.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  if (!STRIPE_WEBHOOK_SECRET || !stripe) {
    return res.json({ received: true });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object;
    const auctionId = parseInt(pi.metadata.auction_id);
    db.prepare(`
      UPDATE orders SET status = 'paid', stripe_status = 'succeeded', paid_at = datetime('now', 'localtime')
      WHERE stripe_payment_intent_id = ?
    `).run(pi.id);
  }

  res.json({ received: true });
});

module.exports = router;
