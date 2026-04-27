const express = require('express');
const router = express.Router();
const db = require('../database');
const { authenticateToken } = require('../middleware/auth');
const { sendNewMessageNotification } = require('../utils/mailer');

// マイページデータ（入札中・出品中・ウォッチリスト）
router.get('/', authenticateToken, (req, res) => {
  const userId = req.user.id;

  // 入札中オークション（自分が入札したことのあるアクティブオークション）
  const bidding = db.prepare(`
    SELECT DISTINCT a.*, u.display_name as seller_name,
      b_max.amount as my_highest_bid,
      b_top.bidder_id = ? as is_top_bidder,
      b_top.amount as current_top_amount
    FROM bids b
    JOIN auctions a ON b.auction_id = a.id
    JOIN users u ON a.seller_id = u.id
    JOIN (SELECT auction_id, MAX(amount) as amount FROM bids WHERE bidder_id = ? GROUP BY auction_id) b_max
      ON b_max.auction_id = a.id
    JOIN (SELECT auction_id, bidder_id, amount FROM bids b1
          WHERE b1.amount = (SELECT MAX(b2.amount) FROM bids b2 WHERE b2.auction_id = b1.auction_id)
          GROUP BY auction_id) b_top
      ON b_top.auction_id = a.id
    WHERE b.bidder_id = ? AND a.seller_id != ?
    ORDER BY a.end_time ASC
  `).all(userId, userId, userId, userId);

  // 自分の出品
  const selling = db.prepare(`
    SELECT a.*, u.display_name as seller_name
    FROM auctions a
    JOIN users u ON a.seller_id = u.id
    WHERE a.seller_id = ?
    ORDER BY a.created_at DESC
  `).all(userId);

  // ウォッチリスト
  const watchlist = db.prepare(`
    SELECT a.*, u.display_name as seller_name, 1 as is_watched,
      b_top.bidder_id = ? as is_top_bidder
    FROM watchlist w
    JOIN auctions a ON w.auction_id = a.id
    JOIN users u ON a.seller_id = u.id
    LEFT JOIN (SELECT auction_id, bidder_id FROM bids b1
               WHERE b1.amount = (SELECT MAX(b2.amount) FROM bids b2 WHERE b2.auction_id = b1.auction_id)
               GROUP BY auction_id) b_top ON b_top.auction_id = a.id
    WHERE w.user_id = ?
    ORDER BY w.created_at DESC
  `).all(userId, userId);

  // ユーザー情報
  const user = db.prepare(`
    SELECT id, username, display_name, full_name, phone, email,
           license_image_url, license_verified,
           rating, trade_count, is_verified_seller, created_at
    FROM users WHERE id = ?
  `).get(userId);

  res.json({ user, bidding, selling, watchlist });
});

// プロフィール更新（住所・銀行口座含む）
router.patch('/profile', authenticateToken, (req, res) => {
  const { display_name, full_name, phone,
          address_zip, address_pref, address_city, address_street,
          bank_name, bank_branch, bank_account_type, bank_account_number, bank_account_holder } = req.body;
  const userId = req.user.id;

  db.prepare(`
    UPDATE users SET
      display_name = COALESCE(?, display_name),
      full_name = COALESCE(?, full_name),
      phone = COALESCE(?, phone),
      address_zip = COALESCE(?, address_zip),
      address_pref = COALESCE(?, address_pref),
      address_city = COALESCE(?, address_city),
      address_street = COALESCE(?, address_street),
      bank_name = COALESCE(?, bank_name),
      bank_branch = COALESCE(?, bank_branch),
      bank_account_type = COALESCE(?, bank_account_type),
      bank_account_number = COALESCE(?, bank_account_number),
      bank_account_holder = COALESCE(?, bank_account_holder)
    WHERE id = ?
  `).run(
    display_name || null, full_name || null, phone || null,
    address_zip || null, address_pref || null, address_city || null, address_street || null,
    bank_name || null, bank_branch || null, bank_account_type || null,
    bank_account_number || null, bank_account_holder || null,
    userId
  );

  const user = db.prepare(`
    SELECT id, username, display_name, full_name, phone, email,
           address_zip, address_pref, address_city, address_street,
           bank_name, bank_branch, bank_account_type, bank_account_number, bank_account_holder,
           license_image_url, license_verified, rating, trade_count, is_verified_seller
    FROM users WHERE id = ?
  `).get(userId);

  res.json({ success: true, user });
});

// 免許証画像URL保存
router.post('/license', authenticateToken, (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: '画像URLが必要です' });

  db.prepare('UPDATE users SET license_image_url = ?, license_verified = 0 WHERE id = ?')
    .run(url, req.user.id);

  res.json({ success: true, message: '本人確認書類を提出しました。審査後に確認済みになります。' });
});

// メッセージ一覧（注文IDごと）
router.get('/messages/:orderId', authenticateToken, (req, res) => {
  const orderId = parseInt(req.params.orderId);
  // 自分が buyer or seller の注文か確認
  const order = db.prepare('SELECT * FROM orders WHERE id = ? AND (buyer_id = ? OR seller_id = ?)').get(orderId, req.user.id, req.user.id);
  if (!order) return res.status(403).json({ error: 'アクセス権限がありません' });

  const messages = db.prepare(`
    SELECT m.*, u.display_name as sender_name, u.username as sender_username
    FROM messages m JOIN users u ON m.sender_id = u.id
    WHERE m.order_id = ?
    ORDER BY m.created_at ASC
  `).all(orderId);

  // 未読を既読に
  db.prepare('UPDATE messages SET is_read = 1 WHERE order_id = ? AND receiver_id = ?').run(orderId, req.user.id);

  res.json({ messages, order });
});

// メッセージ送信
router.post('/messages/:orderId', authenticateToken, (req, res) => {
  const orderId = parseInt(req.params.orderId);
  const { content } = req.body;
  if (!content || !content.trim()) return res.status(400).json({ error: 'メッセージを入力してください' });

  const order = db.prepare('SELECT * FROM orders WHERE id = ? AND (buyer_id = ? OR seller_id = ?)').get(orderId, req.user.id, req.user.id);
  if (!order) return res.status(403).json({ error: 'アクセス権限がありません' });

  // 相手を特定
  const receiverId = req.user.id === order.buyer_id ? order.seller_id : order.buyer_id;

  db.prepare('INSERT INTO messages (order_id, sender_id, receiver_id, content) VALUES (?, ?, ?, ?)').run(orderId, req.user.id, receiverId, content.trim());

  // 相手にメール通知
  const receiver = db.prepare('SELECT email, display_name, username FROM users WHERE id = ?').get(receiverId);
  const sender = db.prepare('SELECT display_name, username FROM users WHERE id = ?').get(req.user.id);
  const auction = db.prepare('SELECT title FROM auctions WHERE id = ?').get(order.auction_id);
  if (receiver && sender && auction) {
    sendNewMessageNotification(
      receiver.email,
      receiver.display_name || receiver.username,
      sender.display_name || sender.username,
      auction.title,
      orderId
    ).catch(() => {});
  }

  res.json({ success: true });
});

// 未読メッセージ数
router.get('/messages/unread/count', authenticateToken, (req, res) => {
  const count = db.prepare('SELECT COUNT(*) as c FROM messages WHERE receiver_id = ? AND is_read = 0').get(req.user.id);
  res.json({ count: count.c });
});

// 注文履歴
router.get('/orders', authenticateToken, (req, res) => {
  const orders = db.prepare(`
    SELECT o.*, a.title, a.producer, a.image_emoji, a.image_color,
           s.display_name as seller_name
    FROM orders o
    JOIN auctions a ON o.auction_id = a.id
    JOIN users s ON o.seller_id = s.id
    WHERE o.buyer_id = ?
    ORDER BY o.created_at DESC
  `).all(req.user.id);
  res.json({ orders });
});

module.exports = router;
