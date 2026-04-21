const express = require('express');
const router = express.Router();
const db = require('../database');
const { authenticateToken } = require('../middleware/auth');

// ユーザープロフィール取得（公開）
router.get('/:id', (req, res) => {
  const user = db.prepare(`
    SELECT id, username, display_name, rating, trade_count, is_verified_seller, created_at
    FROM users WHERE id = ? AND is_blocked = 0
  `).get(parseInt(req.params.id));
  if (!user) return res.status(404).json({ error: 'ユーザーが見つかりません' });
  res.json(user);
});

// ユーザーをブロック（出品者が入札者をブロック）
router.post('/:id/block', authenticateToken, (req, res) => {
  const targetId = parseInt(req.params.id);
  const blockerId = req.user.id;

  if (targetId === blockerId) return res.status(400).json({ error: '自分をブロックできません' });

  const target = db.prepare('SELECT id, username FROM users WHERE id = ?').get(targetId);
  if (!target) return res.status(404).json({ error: 'ユーザーが見つかりません' });

  const existing = db.prepare('SELECT id FROM blocked_users WHERE blocker_id = ? AND blocked_id = ?').get(blockerId, targetId);
  if (existing) {
    // アンブロック
    db.prepare('DELETE FROM blocked_users WHERE blocker_id = ? AND blocked_id = ?').run(blockerId, targetId);
    return res.json({ blocked: false, message: `${target.username} のブロックを解除しました` });
  }

  db.prepare('INSERT INTO blocked_users (blocker_id, blocked_id) VALUES (?, ?)').run(blockerId, targetId);
  res.json({ blocked: true, message: `${target.username} をブロックしました` });
});

// 自分のブロックリスト
router.get('/me/blocks', authenticateToken, (req, res) => {
  const blocks = db.prepare(`
    SELECT u.id, u.username, u.display_name, bu.created_at
    FROM blocked_users bu
    JOIN users u ON bu.blocked_id = u.id
    WHERE bu.blocker_id = ?
    ORDER BY bu.created_at DESC
  `).all(req.user.id);
  res.json(blocks);
});

module.exports = router;
