const express = require('express');
const router = express.Router({ mergeParams: true });
const db = require('../database');
const { authenticateToken } = require('../middleware/auth');

// 入札履歴取得
router.get('/', (req, res) => {
  const bids = db.prepare(`
    SELECT b.id, b.amount, b.created_at,
           u.display_name, u.username
    FROM bids b
    JOIN users u ON b.bidder_id = u.id
    WHERE b.auction_id = ?
    ORDER BY b.amount DESC
  `).all(req.params.id);

  const masked = bids.map((bid, index) => ({
    ...bid,
    is_highest: index === 0
  }));

  const auction = db.prepare('SELECT starting_price, current_price, bid_count FROM auctions WHERE id = ?').get(req.params.id);
  res.json({ bids: masked, auction });
});

module.exports = router;
