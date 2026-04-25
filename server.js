require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const nodemailer = require('nodemailer');

// メール送信設定
const mailTransporter = (process.env.EMAIL_USER && process.env.EMAIL_PASS)
  ? nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    })
  : null;

async function sendOutbidEmail(toEmail, toName, auctionTitle, newAmount, auctionId) {
  if (!mailTransporter) return;
  try {
    await mailTransporter.sendMail({
      from: `"WineBank オークション" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: `【WineBank】入札を更新されました：${auctionTitle}`,
      html: `
        <div style="font-family:sans-serif;max-width:500px;margin:0 auto;">
          <h2 style="color:#6B1A1A;">WineBank オークション</h2>
          <p>${toName} 様</p>
          <p>ご入札中のオークションで、より高い入札がありました。</p>
          <table style="border-collapse:collapse;width:100%;">
            <tr><td style="padding:8px;background:#f5f5f5;"><b>商品</b></td><td style="padding:8px;">${auctionTitle}</td></tr>
            <tr><td style="padding:8px;background:#f5f5f5;"><b>現在の最高額</b></td><td style="padding:8px;color:#c0392b;"><b>¥${newAmount.toLocaleString()}</b></td></tr>
          </table>
          <p style="margin-top:20px;">
            <a href="${process.env.BASE_URL || 'https://wine-auction-production.up.railway.app'}/detail?id=${auctionId}"
               style="background:#6B1A1A;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">
              入札ページへ
            </a>
          </p>
          <p style="color:#999;font-size:12px;">このメールはWineBankオークションから自動送信されています。</p>
        </div>
      `
    });
  } catch(e) {
    console.error('メール送信エラー:', e.message);
  }
}

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

// セキュリティヘッダー（開発中はCSPを無効化、本番で有効化）
app.use(helmet({
  contentSecurityPolicy: false
}));

// レート制限
const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, standardHeaders: true, legacyHeaders: false });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { error: 'Too many requests, please try again later.' } });
const bidLimiter  = rateLimit({ windowMs: 60 * 1000, max: 30 });

app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 認証
app.use('/api/auth', require('./routes/auth'));

// オークション一覧・詳細・出品・ウォッチリスト
app.use('/api/auctions', require('./routes/auctions'));

// マイページ
app.use('/api/mypage', require('./routes/mypage'));

// Stripe決済
app.use('/api/stripe', require('./routes/stripe'));

// 画像アップロード
app.use('/api/upload', require('./routes/upload'));

// ユーザーブロック・プロフィール
app.use('/api/users', require('./routes/users'));

// 管理画面
app.use('/api/admin', require('./routes/admin'));

// 一括インポート
app.use('/api/import', require('./routes/import'));

// 入札履歴 GET
app.get('/api/auctions/:id/bids', (req, res) => {
  const db = require('./database');
  const bids = db.prepare(`
    SELECT b.id, b.amount, b.created_at, u.display_name, u.username
    FROM bids b JOIN users u ON b.bidder_id = u.id
    WHERE b.auction_id = ? ORDER BY b.amount DESC
  `).all(req.params.id);
  const auction = db.prepare('SELECT starting_price, current_price, bid_count FROM auctions WHERE id = ?').get(req.params.id);
  res.json({ bids: bids.map((b, i) => ({ ...b, is_highest: i === 0 })), auction });
});

// 入札 POST（Socket.io統合）
const { authenticateToken } = require('./middleware/auth');

app.post('/api/auctions/:id/bids', bidLimiter, authenticateToken, (req, res) => {
  const db = require('./database');
  const auctionId = parseInt(req.params.id);
  const { amount } = req.body;

  if (!amount || isNaN(amount)) {
    return res.status(400).json({ error: '入札金額を正しく入力してください' });
  }
  const bidAmount = parseInt(amount);

  try {
    const result = db.transaction(() => {
      const auction = db.prepare('SELECT * FROM auctions WHERE id = ?').get(auctionId);
      if (!auction) throw new Error('オークションが見つかりません');
      if (auction.status !== 'active') throw new Error('このオークションは終了しています');

      const endTime = new Date(auction.end_time);
      if (endTime <= new Date()) throw new Error('オークションは終了しています');
      if (auction.seller_id === req.user.id) throw new Error('自分の出品には入札できません');

      // ブロックチェック（出品者が入札者をブロックしている場合）
      const isBlocked = db.prepare('SELECT id FROM blocked_users WHERE blocker_id = ? AND blocked_id = ?').get(auction.seller_id, req.user.id);
      if (isBlocked) throw new Error('この出品者から入札をブロックされています');

      const minBid = auction.current_price + 1000;
      if (bidAmount < minBid) throw new Error(`入札金額は¥${minBid.toLocaleString()}以上にしてください`);

      const existingBid = db.prepare('SELECT id FROM bids WHERE auction_id = ? AND bidder_id = ?').get(auctionId, req.user.id);
      const isNewBidder = !existingBid;

      // 前の最高入札者を記録（メール通知用）
      const prevTopBid = db.prepare(`
        SELECT b.amount, u.email, u.display_name, u.username
        FROM bids b JOIN users u ON b.bidder_id = u.id
        WHERE b.auction_id = ? AND b.bidder_id != ?
        ORDER BY b.amount DESC LIMIT 1
      `).get(auctionId, req.user.id);

      db.prepare('INSERT INTO bids (auction_id, bidder_id, amount) VALUES (?, ?, ?)').run(auctionId, req.user.id, bidAmount);

      // ウォッチリストに自動追加（既にある場合は無視）
      db.prepare('INSERT OR IGNORE INTO watchlist (user_id, auction_id) VALUES (?, ?)').run(req.user.id, auctionId);

      // 終了5分前なら5分延長
      let newEndTime = auction.end_time;
      let extended = false;
      const fiveMin = new Date(Date.now() + 5 * 60 * 1000);
      if (endTime < fiveMin) {
        newEndTime = new Date(Date.now() + 5 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 19);
        extended = true;
      }

      db.prepare(`UPDATE auctions SET current_price = ?, bid_count = bid_count + 1,
        bidder_count = bidder_count + ?, end_time = ? WHERE id = ?
      `).run(bidAmount, isNewBidder ? 1 : 0, newEndTime, auctionId);

      return {
        auction: db.prepare('SELECT * FROM auctions WHERE id = ?').get(auctionId),
        extended,
        prevTopBid
      };
    });

    // 前の最高入札者にメール通知（非同期・ノンブロッキング）
    if (result.prevTopBid && result.prevTopBid.email) {
      const name = result.prevTopBid.display_name || result.prevTopBid.username;
      sendOutbidEmail(result.prevTopBid.email, name, result.auction.title, bidAmount, auctionId);
    }

    // リアルタイム通知（全接続ユーザーに配信）
    io.to(`auction:${auctionId}`).emit('bid:new', {
      auction_id: auctionId,
      amount: bidAmount,
      new_price: result.auction.current_price,
      bid_count: result.auction.bid_count,
      bidder_count: result.auction.bidder_count,
      end_time: result.auction.end_time,
      extended: result.extended
    });

    res.json({
      success: true,
      amount: bidAmount,
      new_price: result.auction.current_price,
      bid_count: result.auction.bid_count,
      bidder_count: result.auction.bidder_count,
      end_time: result.auction.end_time,
      extended: result.extended,
      message: result.extended ? '入札しました！終了時刻が5分延長されました' : '入札しました！現在の最高入札者です'
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// HTMLフォールバック
app.get('/detail', (req, res) => res.sendFile(path.join(__dirname, 'public', 'detail.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));
app.get('/sell', (req, res) => res.sendFile(path.join(__dirname, 'public', 'sell.html')));
app.get('/mypage', (req, res) => res.sendFile(path.join(__dirname, 'public', 'mypage.html')));
app.get('/checkout', (req, res) => res.sendFile(path.join(__dirname, 'public', 'checkout.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));
app.get('/admin/import', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin-import.html')));
app.get('/admin/photos', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin-photos.html')));

// Socket.io
io.on('connection', (socket) => {
  socket.on('join:auction', (id) => socket.join(`auction:${id}`));
  socket.on('leave:auction', (id) => socket.leave(`auction:${id}`));
});

// 期限切れオークションを1分ごとにチェック
setInterval(() => {
  const db = require('./database');
  try {
    const ended = db.prepare(
      `SELECT id FROM auctions WHERE status = 'active' AND end_time <= datetime('now')`
    ).all();
    if (ended.length > 0) {
      db.prepare(`UPDATE auctions SET status = 'ended' WHERE status = 'active' AND end_time <= datetime('now')`).run();
      ended.forEach(a => io.to(`auction:${a.id}`).emit('auction:ended', { auction_id: a.id }));
    }
  } catch(e) {}
}, 60 * 1000);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`
🍷 ワインオークション サーバー起動
━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 http://localhost:${PORT}
━━━━━━━━━━━━━━━━━━━━━━━━━━━
テストアカウント:
  メール: lover@example.com
  パスワード: password123
━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
});
