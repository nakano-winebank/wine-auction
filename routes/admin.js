const express = require('express');
const router = express.Router();
const db = require('../database');
const { authenticateToken } = require('../middleware/auth');

// 管理者チェックミドルウェア
function requireAdmin(req, res, next) {
  const user = db.prepare('SELECT is_admin FROM users WHERE id = ?').get(req.user.id);
  if (!user || !user.is_admin) return res.status(403).json({ error: '管理者権限が必要です' });
  next();
}

router.use(authenticateToken, requireAdmin);

// ダッシュボード統計
router.get('/stats', (req, res) => {
  const stats = {
    users:    db.prepare('SELECT COUNT(*) as c FROM users').get().c,
    auctions: db.prepare('SELECT COUNT(*) as c FROM auctions').get().c,
    active:   db.prepare("SELECT COUNT(*) as c FROM auctions WHERE status='active'").get().c,
    bids:     db.prepare('SELECT COUNT(*) as c FROM bids').get().c,
    orders:   db.prepare('SELECT COUNT(*) as c FROM orders').get().c,
    paid:     db.prepare("SELECT COUNT(*) as c FROM orders WHERE status='paid'").get().c,
    revenue:  db.prepare("SELECT COALESCE(SUM(amount),0) as s FROM orders WHERE status='paid'").get().s,
  };
  res.json(stats);
});

// ユーザー一覧
router.get('/users', (req, res) => {
  const { q, page = 1 } = req.query;
  const limit = 20;
  const offset = (parseInt(page) - 1) * limit;
  const search = q ? `%${q}%` : '%';
  const users = db.prepare(`
    SELECT id, username, email, display_name, rating, trade_count,
           is_verified_seller, is_admin, email_verified, is_blocked, created_at
    FROM users WHERE username LIKE ? OR email LIKE ?
    ORDER BY created_at DESC LIMIT ? OFFSET ?
  `).all(search, search, limit, offset);
  const total = db.prepare('SELECT COUNT(*) as c FROM users WHERE username LIKE ? OR email LIKE ?').get(search, search).c;
  res.json({ users, total, page: parseInt(page), pages: Math.ceil(total / limit) });
});

// ユーザー操作
router.patch('/users/:id', (req, res) => {
  const { is_blocked, is_admin, is_verified_seller } = req.body;
  const userId = parseInt(req.params.id);

  const fields = [];
  const vals = [];
  if (is_blocked !== undefined) { fields.push('is_blocked = ?'); vals.push(is_blocked ? 1 : 0); }
  if (is_admin !== undefined)   { fields.push('is_admin = ?');   vals.push(is_admin ? 1 : 0); }
  if (is_verified_seller !== undefined) { fields.push('is_verified_seller = ?'); vals.push(is_verified_seller ? 1 : 0); }

  if (!fields.length) return res.status(400).json({ error: '更新フィールドがありません' });
  vals.push(userId);
  db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`).run(...vals);
  res.json({ success: true });
});

// オークション一覧
router.get('/auctions', (req, res) => {
  const { status, page = 1 } = req.query;
  const limit = 20;
  const offset = (parseInt(page) - 1) * limit;
  const whereClause = status ? 'WHERE a.status = ?' : 'WHERE 1=1';
  const params = status ? [status, limit, offset] : [limit, offset];

  const auctions = db.prepare(`
    SELECT a.id, a.title, a.producer, a.current_price, a.bid_count,
           a.status, a.end_time, a.created_at, u.username as seller
    FROM auctions a JOIN users u ON a.seller_id = u.id
    ${whereClause}
    ORDER BY a.created_at DESC LIMIT ? OFFSET ?
  `).all(...params);

  const total = status
    ? db.prepare("SELECT COUNT(*) as c FROM auctions WHERE status = ?").get(status).c
    : db.prepare("SELECT COUNT(*) as c FROM auctions").get().c;

  res.json({ auctions, total, page: parseInt(page), pages: Math.ceil(total / limit) });
});

// オークション操作（強制終了など）
router.patch('/auctions/:id', (req, res) => {
  const { status } = req.body;
  if (!['active', 'ended'].includes(status)) return res.status(400).json({ error: '無効なステータスです' });
  db.prepare('UPDATE auctions SET status = ? WHERE id = ?').run(status, parseInt(req.params.id));
  res.json({ success: true });
});

// 注文一覧
router.get('/orders', (req, res) => {
  const { page = 1 } = req.query;
  const limit = 20;
  const offset = (parseInt(page) - 1) * limit;
  const orders = db.prepare(`
    SELECT o.*, a.title, ub.username as buyer, us.username as seller
    FROM orders o
    JOIN auctions a ON o.auction_id = a.id
    JOIN users ub ON o.buyer_id = ub.id
    JOIN users us ON o.seller_id = us.id
    ORDER BY o.created_at DESC LIMIT ? OFFSET ?
  `).all(limit, offset);
  const total = db.prepare('SELECT COUNT(*) as c FROM orders').get().c;
  res.json({ orders, total, page: parseInt(page), pages: Math.ceil(total / limit) });
});

module.exports = router;
