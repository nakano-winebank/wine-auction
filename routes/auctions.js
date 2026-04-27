const express = require('express');
const router = express.Router();
const db = require('../database');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { sendAdminNewListingNotification } = require('../utils/mailer');

// オークション一覧（フィルター・ソート対応）
router.get('/', optionalAuth, (req, res) => {
  const { region, wine_type, vintage_from, vintage_to, price_min, price_max, sort, q } = req.query;

  let conditions = ["a.status = 'active'"];
  const params = [];

  if (region) {
    conditions.push("a.region LIKE ?");
    params.push(`%${region}%`);
  }
  if (wine_type) {
    conditions.push("a.wine_type = ?");
    params.push(wine_type);
  }
  if (vintage_from) {
    conditions.push("a.vintage >= ?");
    params.push(parseInt(vintage_from));
  }
  if (vintage_to) {
    conditions.push("a.vintage <= ?");
    params.push(parseInt(vintage_to));
  }
  if (price_min) {
    conditions.push("a.current_price >= ?");
    params.push(parseInt(price_min));
  }
  if (price_max) {
    conditions.push("a.current_price <= ?");
    params.push(parseInt(price_max));
  }
  if (q) {
    conditions.push("(a.title LIKE ? OR a.producer LIKE ? OR a.region LIKE ?)");
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  let orderBy = 'a.end_time ASC'; // デフォルト：終了が近い順
  if (sort === 'bids') orderBy = 'a.bid_count DESC';
  else if (sort === 'price_high') orderBy = 'a.current_price DESC';
  else if (sort === 'price_low') orderBy = 'a.current_price ASC';
  else if (sort === 'new') orderBy = 'a.created_at DESC';

  const auctions = db.prepare(`
    SELECT a.*, u.display_name as seller_name, u.rating as seller_rating, u.is_verified_seller,
      CASE WHEN a.end_time <= datetime('now', '+1 hour') THEN 1 ELSE 0 END as ending_soon
    FROM auctions a
    JOIN users u ON a.seller_id = u.id
    ${where}
    ORDER BY ${orderBy}
  `).all(...params);

  // ウォッチ済みフラグ付与
  if (req.user) {
    const watched = db.prepare('SELECT auction_id FROM watchlist WHERE user_id = ?').all(req.user.id);
    const watchedSet = new Set(watched.map(w => w.auction_id));
    auctions.forEach(a => { a.is_watched = watchedSet.has(a.id); });
  }

  res.json({ auctions, total: auctions.length });
});

// オークション詳細
router.get('/:id', optionalAuth, (req, res) => {
  const auction = db.prepare(`
    SELECT a.*, u.display_name as seller_name, u.rating as seller_rating,
           u.trade_count as seller_trade_count, u.is_verified_seller,
           u.username as seller_username
    FROM auctions a
    JOIN users u ON a.seller_id = u.id
    WHERE a.id = ?
  `).get(req.params.id);

  if (!auction) return res.status(404).json({ error: 'オークションが見つかりません' });

  // 画像一覧
  auction.images = db.prepare('SELECT url, label, sort_order FROM auction_images WHERE auction_id = ? ORDER BY sort_order').all(req.params.id);

  // 最高入札者ID
  const topBid = db.prepare('SELECT bidder_id FROM bids WHERE auction_id = ? ORDER BY amount DESC LIMIT 1').get(req.params.id);
  auction.top_bidder_id = topBid ? topBid.bidder_id : null;

  // ウォッチ状態
  if (req.user) {
    const watched = db.prepare('SELECT id FROM watchlist WHERE user_id = ? AND auction_id = ?').get(req.user.id, req.params.id);
    auction.is_watched = !!watched;
    auction.is_top_bidder = topBid ? topBid.bidder_id === req.user.id : false;
  }

  res.json(auction);
});

// 出品（オークション作成）
router.post('/', authenticateToken, (req, res) => {
  const {
    title, producer, vintage, region, appellation, grape, volume_ml,
    description, condition_note, score_rp, score_ws, starting_price,
    end_hours, image_emoji, image_color, image_url, wine_type
  } = req.body;

  if (!title || !producer || !starting_price || !end_hours) {
    return res.status(400).json({ error: 'タイトル・生産者・開始価格・終了時間は必須です' });
  }

  const endTime = new Date(Date.now() + parseInt(end_hours) * 3600 * 1000);
  const endTimeStr = endTime.toISOString().replace('T', ' ').slice(0, 19);

  // 管理者は即公開、一般ユーザーは承認待ち
  const seller = db.prepare('SELECT is_admin FROM users WHERE id = ?').get(req.user.id);
  const isAdmin = seller && seller.is_admin;
  const initialStatus = isAdmin ? 'active' : 'pending';
  const approvalStatus = isAdmin ? 'approved' : 'pending';

  const result = db.prepare(`
    INSERT INTO auctions (seller_id, title, producer, vintage, region, appellation, grape, volume_ml,
      description, condition_note, score_rp, score_ws, starting_price, current_price,
      end_time, status, approval_status, image_emoji, image_color, image_url, wine_type)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    req.user.id, title, producer,
    vintage ? parseInt(vintage) : null,
    region || null, appellation || null, grape || null,
    volume_ml ? parseInt(volume_ml) : 750,
    description || null, condition_note || null,
    score_rp ? parseInt(score_rp) : null,
    score_ws ? parseInt(score_ws) : null,
    parseInt(starting_price), parseInt(starting_price),
    endTimeStr, initialStatus, approvalStatus,
    image_emoji || '🍷',
    image_color || 'from-red-900 via-red-700 to-red-900',
    image_url || null, wine_type || 'red'
  );

  // 一般ユーザー出品時：管理者全員にメール通知
  if (!isAdmin) {
    const admins = db.prepare('SELECT email FROM users WHERE is_admin = 1').all();
    const sellerUser = db.prepare('SELECT display_name, username FROM users WHERE id = ?').get(req.user.id);
    admins.forEach(admin => {
      sendAdminNewListingNotification(
        admin.email,
        sellerUser.display_name || sellerUser.username,
        title,
        result.lastInsertRowid
      ).catch(() => {});
    });
  }

  const auction = db.prepare('SELECT * FROM auctions WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({
    ...auction,
    message: isAdmin ? '出品しました' : '出品申請を受け付けました。管理者の承認後に公開されます。'
  });
});

// ウォッチリスト追加/削除
router.post('/:id/watch', authenticateToken, (req, res) => {
  const existing = db.prepare('SELECT id FROM watchlist WHERE user_id = ? AND auction_id = ?').get(req.user.id, req.params.id);
  if (existing) {
    db.prepare('DELETE FROM watchlist WHERE user_id = ? AND auction_id = ?').run(req.user.id, req.params.id);
    res.json({ watched: false });
  } else {
    db.prepare('INSERT INTO watchlist (user_id, auction_id) VALUES (?, ?)').run(req.user.id, req.params.id);
    res.json({ watched: true });
  }
});

// ウォッチリスト一覧
router.get('/user/watchlist', authenticateToken, (req, res) => {
  const auctions = db.prepare(`
    SELECT a.*, u.display_name as seller_name, 1 as is_watched
    FROM watchlist w
    JOIN auctions a ON w.auction_id = a.id
    JOIN users u ON a.seller_id = u.id
    WHERE w.user_id = ?
    ORDER BY w.created_at DESC
  `).all(req.user.id);
  res.json({ auctions });
});

module.exports = router;
