const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateToken } = require('../middleware/auth');

const UPLOADS_DIR = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = `wine_${req.user.id}_${Date.now()}${ext}`;
    cb(null, name);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('JPG / PNG / WebP / GIF のみアップロードできます'));
  }
});

// POST /api/upload/image — 1枚アップロード
router.post('/image', authenticateToken, (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: '画像ファイルを選択してください' });
    res.json({ url: `/uploads/${req.file.filename}` });
  });
});

// POST /api/upload/auction-images/:auctionId — 複数枚保存
router.post('/auction-images/:auctionId', authenticateToken, (req, res) => {
  const db = require('../database');
  const auctionId = parseInt(req.params.auctionId);
  const auction = db.prepare('SELECT * FROM auctions WHERE id = ? AND seller_id = ?').get(auctionId, req.user.id);
  if (!auction) return res.status(403).json({ error: '権限がありません' });

  const { images } = req.body; // [{ url, label, sort_order }]
  if (!Array.isArray(images) || images.length === 0) return res.status(400).json({ error: '画像データがありません' });

  db.prepare('DELETE FROM auction_images WHERE auction_id = ?').run(auctionId);
  const stmt = db.prepare('INSERT INTO auction_images (auction_id, url, label, sort_order) VALUES (?, ?, ?, ?)');
  images.forEach((img, i) => stmt.run(auctionId, img.url, img.label || null, img.sort_order ?? i));

  res.json({ success: true });
});

module.exports = router;
