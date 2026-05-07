const express = require('express');
const router = express.Router();
const db = require('../database');
const { authenticateToken } = require('../middleware/auth');

const PAYJP_SECRET_KEY = process.env.PAYJP_SECRET_KEY || '';
const PAYJP_PUBLIC_KEY = process.env.PAYJP_PUBLIC_KEY || '';
const PAYJP_BASE = 'https://api.pay.jp/v1';

// 公開鍵を返す
router.get('/public-key', (req, res) => {
  res.json({
    public_key: PAYJP_PUBLIC_KEY,
    configured: !!PAYJP_PUBLIC_KEY,
    test_mode: PAYJP_PUBLIC_KEY.startsWith('pk_test_')
  });
});

// Pay.jp API ヘルパー
async function payjpRequest(method, path, body) {
  if (!PAYJP_SECRET_KEY) throw new Error('PAYJP_SECRET_KEY が未設定です');
  const auth = Buffer.from(PAYJP_SECRET_KEY + ':').toString('base64');
  const opts = {
    method,
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  };
  if (body) opts.body = new URLSearchParams(body).toString();
  const res = await fetch(`${PAYJP_BASE}${path}`, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Pay.jp APIエラー');
  return data;
}

// 落札確認 & 注文情報取得
router.get('/order/:auctionId', authenticateToken, async (req, res) => {
  const auctionId = parseInt(req.params.auctionId);
  const userId = req.user.id;

  const auction = await db.prepare(`
    SELECT a.*, u.display_name as seller_name, u.username as seller_username
    FROM auctions a JOIN users u ON a.seller_id = u.id WHERE a.id = ?
  `).get(auctionId);

  if (!auction) return res.status(404).json({ error: 'オークションが見つかりません' });
  if (auction.status !== 'ended') return res.status(400).json({ error: 'オークションはまだ終了していません' });

  const topBid = await db.prepare(`
    SELECT b.bidder_id, b.amount, u.display_name, u.username
    FROM bids b JOIN users u ON b.bidder_id = u.id
    WHERE b.auction_id = ? ORDER BY b.amount DESC LIMIT 1
  `).get(auctionId);

  if (!topBid || topBid.bidder_id !== userId) return res.status(403).json({ error: '落札者ではありません' });

  const existingOrder = await db.prepare('SELECT * FROM orders WHERE auction_id = ?').get(auctionId);

  res.json({ auction, winner: topBid, order: existingOrder || null, testMode: PAYJP_SECRET_KEY.startsWith('sk_test_') });
});

// Pay.jp トークンで決済実行
router.post('/charge', authenticateToken, async (req, res) => {
  const { auction_id, payjp_token, shipping_name, shipping_zip, shipping_address, shipping_phone, shipping_method, shipping_fee } = req.body;
  const userId = req.user.id;

  if (!shipping_name || !shipping_zip || !shipping_address) {
    return res.status(400).json({ error: '配送先情報を入力してください' });
  }

  const auctionId = parseInt(auction_id);
  const method = shipping_method || 'normal';
  const fee = parseInt(shipping_fee) || 0;

  const auction = await db.prepare('SELECT * FROM auctions WHERE id = ?').get(auctionId);
  if (!auction) return res.status(404).json({ error: 'オークションが見つかりません' });
  if (auction.status !== 'ended') return res.status(400).json({ error: 'オークションはまだ終了していません' });

  const topBid = await db.prepare('SELECT bidder_id, amount FROM bids WHERE auction_id = ? ORDER BY amount DESC LIMIT 1').get(auctionId);
  if (!topBid || topBid.bidder_id !== userId) return res.status(403).json({ error: '落札者ではありません' });

  const existingOrder = await db.prepare('SELECT * FROM orders WHERE auction_id = ?').get(auctionId);
  if (existingOrder && existingOrder.status === 'paid') return res.status(400).json({ error: 'すでに支払い済みです' });

  const total = topBid.amount + fee;

  try {
    let chargeId = 'demo_' + Date.now();

    if (PAYJP_SECRET_KEY && payjp_token) {
      const charge = await payjpRequest('POST', '/charges', {
        amount: total, currency: 'jpy', card: payjp_token,
        description: `WineBank 落札: ${auction.title}`,
        metadata: `auction_id=${auctionId},buyer_id=${userId}`
      });
      chargeId = charge.id;
    }

    if (existingOrder) {
      await db.prepare(`
        UPDATE orders SET
          stripe_payment_intent_id = ?, stripe_status = 'succeeded',
          shipping_name = ?, shipping_zip = ?, shipping_address = ?, shipping_phone = ?,
          shipping_method = ?, shipping_fee = ?,
          status = 'paid', fulfillment_status = 'paid', paid_at = datetime('now', 'localtime')
        WHERE auction_id = ? AND buyer_id = ?
      `).run(chargeId, shipping_name, shipping_zip, shipping_address, shipping_phone, method, fee, auctionId, userId);
    } else {
      await db.prepare(`
        INSERT INTO orders
          (auction_id, buyer_id, seller_id, amount, stripe_payment_intent_id, stripe_status,
           shipping_name, shipping_zip, shipping_address, shipping_phone,
           shipping_method, shipping_fee, status, fulfillment_status, paid_at)
        VALUES (?, ?, ?, ?, ?, 'succeeded', ?, ?, ?, ?, ?, ?, 'paid', 'paid', datetime('now', 'localtime'))
      `).run(auctionId, userId, auction.seller_id, total, chargeId,
             shipping_name, shipping_zip, shipping_address, shipping_phone, method, fee);
    }

    await db.prepare('UPDATE users SET trade_count = trade_count + 1 WHERE id = ?').run(auction.seller_id);
    await db.prepare('UPDATE users SET trade_count = trade_count + 1 WHERE id = ?').run(userId);

    res.json({ success: true, charge_id: chargeId, message: '注文が確定しました' });
  } catch (err) {
    console.error('Pay.jp charge error:', err);
    res.status(500).json({ error: err.message || 'お支払いの処理中にエラーが発生しました' });
  }
});

module.exports = router;
