const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../database');
const { JWT_SECRET, authenticateToken } = require('../middleware/auth');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/mailer');

// 新規登録
router.post('/register', (req, res) => {
  const { username, email, password, display_name, full_name, phone } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'ユーザー名・メールアドレス・パスワードは必須です' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'パスワードは6文字以上にしてください' });
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return res.status(400).json({ error: 'ユーザー名は半角英数字とアンダーバーのみ使用できます' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE username = ? OR email = ?').get(username, email);
  if (existing) {
    return res.status(409).json({ error: 'このユーザー名またはメールアドレスはすでに使用されています' });
  }

  const password_hash = bcrypt.hashSync(password, 10);
  const verification_token = crypto.randomBytes(32).toString('hex');

  const result = db.prepare(
    'INSERT INTO users (username, email, password_hash, display_name, full_name, phone, verification_token) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(username, email, password_hash, display_name || username, full_name || null, phone || null, verification_token);

  sendVerificationEmail(email, username, verification_token).catch(() => {});

  const token = jwt.sign(
    { id: result.lastInsertRowid, username, email },
    JWT_SECRET,
    { expiresIn: '30d' }
  );

  res.status(201).json({
    token,
    user: { id: result.lastInsertRowid, username, email, display_name: display_name || username },
    message: '登録しました。確認メールをお送りしました。'
  });
});

// ログイン
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'メールアドレスとパスワードを入力してください' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'メールアドレスまたはパスワードが正しくありません' });
  }

  if (user.is_blocked) {
    return res.status(403).json({ error: 'このアカウントは停止されています。管理者にお問い合わせください。' });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, email: user.email },
    JWT_SECRET,
    { expiresIn: '30d' }
  );

  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      display_name: user.display_name,
      rating: user.rating,
      trade_count: user.trade_count,
      is_verified_seller: user.is_verified_seller,
      is_admin: user.is_admin,
      email_verified: user.email_verified
    }
  });
});

// メール確認
router.get('/verify-email', (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).json({ error: 'トークンが必要です' });

  const user = db.prepare('SELECT id FROM users WHERE verification_token = ?').get(token);
  if (!user) return res.status(400).json({ error: '無効または期限切れのトークンです' });

  db.prepare('UPDATE users SET email_verified = 1, verification_token = NULL WHERE id = ?').run(user.id);
  res.json({ success: true, message: 'メールアドレスを確認しました' });
});

// メール確認再送
router.post('/resend-verification', authenticateToken, (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (user.email_verified) return res.status(400).json({ error: 'すでに確認済みです' });

  const token = crypto.randomBytes(32).toString('hex');
  db.prepare('UPDATE users SET verification_token = ? WHERE id = ?').run(token, user.id);
  sendVerificationEmail(user.email, user.username, token).catch(() => {});
  res.json({ success: true, message: '確認メールを再送しました' });
});

// パスワードリセット要求
router.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'メールアドレスを入力してください' });

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  // ユーザーが存在しなくても同じレスポンスを返す（enumeration防止）
  if (user) {
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1時間
    db.prepare('UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?')
      .run(resetToken, expires, user.id);
    sendPasswordResetEmail(user.email, user.username, resetToken).catch(() => {});
  }

  res.json({ success: true, message: 'パスワードリセットメールを送信しました（登録済みの場合）' });
});

// パスワードリセット実行
router.post('/reset-password', (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ error: 'トークンとパスワードが必要です' });
  if (password.length < 6) return res.status(400).json({ error: 'パスワードは6文字以上にしてください' });

  const user = db.prepare('SELECT * FROM users WHERE reset_token = ?').get(token);
  if (!user) return res.status(400).json({ error: '無効なトークンです' });
  if (new Date(user.reset_token_expires) < new Date()) {
    return res.status(400).json({ error: 'トークンの有効期限が切れています。再度お試しください。' });
  }

  const hash = bcrypt.hashSync(password, 10);
  db.prepare('UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?')
    .run(hash, user.id);

  res.json({ success: true, message: 'パスワードを変更しました' });
});

// 自分のプロフィール取得
router.get('/me', authenticateToken, (req, res) => {
  const user = db.prepare(`
    SELECT id, username, email, display_name, full_name, phone,
           license_image_url, license_verified,
           rating, trade_count, is_verified_seller, is_admin, email_verified, created_at
    FROM users WHERE id = ?
  `).get(req.user.id);
  if (!user) return res.status(404).json({ error: 'ユーザーが見つかりません' });
  res.json(user);
});

module.exports = router;
