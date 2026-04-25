const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const db = new DatabaseSync(path.join(__dirname, 'wine_auction.db'));

// パフォーマンス設定
db.exec("PRAGMA journal_mode = WAL");
db.exec("PRAGMA foreign_keys = ON");

// スキーマ作成
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    display_name TEXT,
    full_name TEXT,
    phone TEXT,
    license_image_url TEXT,
    license_verified INTEGER DEFAULT 0,
    stripe_customer_id TEXT,
    rating REAL DEFAULT 5.0,
    trade_count INTEGER DEFAULT 0,
    is_verified_seller INTEGER DEFAULT 0,
    is_admin INTEGER DEFAULT 0,
    email_verified INTEGER DEFAULT 0,
    verification_token TEXT,
    reset_token TEXT,
    reset_token_expires TEXT,
    is_blocked INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
  );

  CREATE TABLE IF NOT EXISTS auctions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    seller_id INTEGER NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    producer TEXT NOT NULL,
    vintage INTEGER,
    region TEXT,
    appellation TEXT,
    grape TEXT,
    volume_ml INTEGER DEFAULT 750,
    description TEXT,
    condition_note TEXT DEFAULT '未開封',
    score_rp INTEGER,
    score_ws INTEGER,
    starting_price INTEGER NOT NULL,
    current_price INTEGER NOT NULL,
    bid_count INTEGER DEFAULT 0,
    bidder_count INTEGER DEFAULT 0,
    end_time TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    image_emoji TEXT DEFAULT '🍷',
    image_color TEXT DEFAULT 'from-red-900 via-red-700 to-red-900',
    image_url TEXT,
    wine_type TEXT DEFAULT 'red',
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
  );

  CREATE TABLE IF NOT EXISTS bids (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    auction_id INTEGER NOT NULL REFERENCES auctions(id),
    bidder_id INTEGER NOT NULL REFERENCES users(id),
    amount INTEGER NOT NULL,
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
  );

  CREATE TABLE IF NOT EXISTS watchlist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    auction_id INTEGER NOT NULL REFERENCES auctions(id),
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    UNIQUE(user_id, auction_id)
  );

  CREATE TABLE IF NOT EXISTS auction_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    auction_id INTEGER NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    label TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
  );

  CREATE TABLE IF NOT EXISTS blocked_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    blocker_id INTEGER NOT NULL REFERENCES users(id),
    blocked_id INTEGER NOT NULL REFERENCES users(id),
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    UNIQUE(blocker_id, blocked_id)
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    auction_id INTEGER NOT NULL REFERENCES auctions(id),
    buyer_id INTEGER NOT NULL REFERENCES users(id),
    seller_id INTEGER NOT NULL REFERENCES users(id),
    amount INTEGER NOT NULL,
    stripe_payment_intent_id TEXT,
    stripe_status TEXT DEFAULT 'pending',
    status TEXT DEFAULT 'pending',
    shipping_name TEXT,
    shipping_zip TEXT,
    shipping_address TEXT,
    shipping_phone TEXT,
    shipping_method TEXT DEFAULT 'normal',
    shipping_fee INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    paid_at TEXT,
    UNIQUE(auction_id)
  );
`);

// マイグレーション: カラム追加（既存DBへの対応）
const existingCols = db.prepare("PRAGMA table_info(auctions)").all().map(c => c.name);
if (!existingCols.includes('image_url')) {
  db.exec("ALTER TABLE auctions ADD COLUMN image_url TEXT");
}
const userCols = db.prepare("PRAGMA table_info(users)").all().map(c => c.name);
const userIntCols = ['is_admin','email_verified','is_blocked','license_verified'];
const userTextCols = ['verification_token','reset_token','reset_token_expires','full_name','phone','license_image_url','stripe_customer_id'];
userIntCols.forEach(col => { if (!userCols.includes(col)) db.exec(`ALTER TABLE users ADD COLUMN ${col} INTEGER DEFAULT 0`); });
userTextCols.forEach(col => { if (!userCols.includes(col)) db.exec(`ALTER TABLE users ADD COLUMN ${col} TEXT`); });

const orderCols = db.prepare("PRAGMA table_info(orders)").all().map(c => c.name);
if (!orderCols.includes('shipping_method')) db.exec("ALTER TABLE orders ADD COLUMN shipping_method TEXT DEFAULT 'normal'");
if (!orderCols.includes('shipping_fee')) db.exec("ALTER TABLE orders ADD COLUMN shipping_fee INTEGER DEFAULT 0");

// ヘルパー: トランザクション
function transaction(fn) {
  db.exec('BEGIN');
  try {
    const result = fn();
    db.exec('COMMIT');
    return result;
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }
}

db.transaction = transaction;

// シードデータ（初回のみ）
const userCount = db.prepare('SELECT COUNT(*) as c FROM users').get();
if (userCount.c === 0) {
  const bcrypt = require('bcryptjs');

  const insertUser = db.prepare(`
    INSERT INTO users (username, email, password_hash, display_name, rating, trade_count, is_verified_seller)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const hash = bcrypt.hashSync('password123', 10);
  // is_admin=1 でテストアカウントを管理者に設定
  db.prepare(`
    INSERT INTO users (username, email, password_hash, display_name, rating, trade_count, is_verified_seller, is_admin, email_verified)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run('wine_lover', 'lover@example.com', hash, 'wine_lover_***', 4.8, 45, 0, 1, 1);
  insertUser.run('WineCellar_Osaka', 'cellar@example.com', hash, 'WineCellar_Osaka', 4.9, 342, 1);
  insertUser.run('bordeaux_fan', 'bordeaux@example.com', hash, 'bordeaux_***', 4.7, 89, 0);
  insertUser.run('sakura_wine', 'sakura@example.com', hash, 'sakura_wine_***', 4.9, 120, 0);
  insertUser.run('tokyo_wine', 'tokyo@example.com', hash, 'tokyo_wine_***', 4.6, 33, 0);


  const now = new Date();
  const endTimes = [
    new Date(now.getTime() + 2 * 24 * 3600 * 1000 + 14 * 60 * 1000),  // 2日14分後
    new Date(now.getTime() + 4 * 24 * 3600 * 1000),                    // 4日後
    new Date(now.getTime() + 6 * 24 * 3600 * 1000),                    // 6日後
    new Date(now.getTime() + 1 * 24 * 3600 * 1000 + 45 * 60 * 1000),  // 1日45分後
    new Date(now.getTime() + 5 * 24 * 3600 * 1000),                    // 5日後
    new Date(now.getTime() + 7 * 24 * 3600 * 1000),                    // 7日後
    new Date(now.getTime() + 3 * 24 * 3600 * 1000),                    // 3日後
    new Date(now.getTime() + 2 * 24 * 3600 * 1000),                    // 2日後
  ].map(d => d.toISOString().replace('T', ' ').slice(0, 19));

  const insertAuction = db.prepare(`
    INSERT INTO auctions (seller_id, title, producer, vintage, region, appellation, grape, volume_ml,
      description, condition_note, score_rp, score_ws, starting_price, current_price,
      bid_count, bidder_count, end_time, image_emoji, image_color, wine_type)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const wines = [
    [2, 'シャトー・マルゴー 2015 750ml', 'Château Margaux', 2015, 'ボルドー', 'Margaux AOC 1er Grand Cru', 'Cab.S 87% / Merlot 8% / 他', 750,
     '2015年のシャトー・マルゴーです。ボルドーの偉大なヴィンテージの一つ。ロバート・パーカーより98点、ワイン・スペクテイターより98点の最高評価を受けています。\n\n当セラーにて温度・湿度管理のもと購入時から保管。木箱未開封でお届けします。正規輸入品でございます。',
     '木箱未開封 / 温度管理済みセラー保管', 98, 98, 50000, 85000, 23, 8, endTimes[0], '🍷', 'from-red-900 via-red-700 to-red-900', 'red'],
    [2, 'ドン・ペリニョン 2012 シャンパーニュ', 'Dom Pérignon', 2012, 'シャンパーニュ', 'Champagne AOC', 'Chardonnay / Pinot Noir', 750,
     '2012年のドン・ペリニョン。最高のシャンパーニュヴィンテージの一つ。フレッシュな果実味と複雑なミネラル感が絶妙にバランスしています。',
     '未開封 / 専用ケース付き', 96, 95, 18000, 28500, 8, 5, endTimes[1], '🥂', 'from-yellow-800 via-yellow-600 to-yellow-800', 'sparkling'],
    [2, 'ロマネ・コンティ 2018 750ml', 'Domaine de la Romanée-Conti', 2018, 'ブルゴーニュ', 'Romanée-Conti Grand Cru', 'Pinot Noir 100%', 750,
     'ブルゴーニュの最高峰、ロマネ・コンティの2018年。DRCが誇る至高の一本。希少性の高さから世界中のコレクターが求める究極のワインです。',
     '未開封 / 木箱 / 証明書付き', 100, 99, 1500000, 1850000, 41, 12, endTimes[2], '🍾', 'from-purple-900 via-purple-700 to-purple-900', 'red'],
    [2, 'ペトリュス 2010 ポムロール 750ml', 'Château Pétrus', 2010, 'ボルドー', 'Pomerol AOC', 'Merlot 100%', 750,
     '2010年のペトリュス。伝説的なボルドーヴィンテージで生産されたポムロールの王。',
     '未開封 / OWC / 温度管理済み', 100, 98, 350000, 420000, 37, 11, endTimes[3], '🥃', 'from-amber-900 via-amber-700 to-amber-900', 'red'],
    [2, 'サッシカイア 2017 トスカーナ 750ml', 'Tenuta San Guido', 2017, 'イタリア / トスカーナ', 'Bolgheri Sassicaia DOC', 'Cab.S 85% / Cab.F 15%', 750,
     'スーパータスカンの先駆者、サッシカイア2017年。',
     '未開封 / 木箱付き', 95, 96, 22000, 32000, 15, 6, endTimes[4], '🍷', 'from-red-800 via-red-600 to-red-800', 'red'],
    [2, 'ウィスパリング・エンジェル ロゼ 2022', "Château d'Esclans", 2022, 'フランス / プロヴァンス', 'Côtes de Provence AOC', 'Grenache / Cinsault', 750,
     'プロヴァンスロゼの代名詞。エレガントで洗練された一本。',
     '未開封', null, 90, 3200, 4800, 5, 4, endTimes[5], '🌸', 'from-pink-800 via-pink-500 to-pink-800', 'rose'],
    [2, 'オーパス・ワン 2019 マグナム 1500ml', 'Opus One Winery', 2019, 'アメリカ / カリフォルニア', 'Napa Valley AVA', 'Cab.S 76% / Merlot 13%', 1500,
     '2019年のオーパス・ワン マグナムボトル。カリフォルニアの最高峰。',
     '未開封 / 木箱付き', 97, 97, 120000, 165000, 19, 7, endTimes[6], '🍾', 'from-green-900 via-green-700 to-green-900', 'red'],
    [2, 'ハーラン・エステート 2016 ナパヴァレー', 'Harlan Estate', 2016, 'アメリカ / カリフォルニア', 'Napa Valley AVA', 'Cab.S 72% / Merlot 17%', 750,
     'カリフォルニアのカルトワイン、ハーラン・エステート2016年。',
     '未開封 / OWC', 98, 97, 70000, 95000, 12, 5, endTimes[7], '🍷', 'from-slate-800 via-slate-600 to-slate-800', 'red'],
  ];

  for (const wine of wines) {
    insertAuction.run(...wine);
  }

  // 入札履歴シード（全オークション）— bid_countと実レコードを一致させる
  const insertBid = db.prepare(`INSERT INTO bids (auction_id, bidder_id, amount, created_at) VALUES (?, ?, ?, ?)`);

  // [auction_id, [[bidder_id, amount], ...]] — 時系列順（古い順）
  const allBidHistory = [
    // 1: マルゴー（23件）
    [1, [[3,50000],[4,53000],[5,55000],[3,58000],[4,61000],[5,63000],[3,66000],[4,68000],
         [5,70000],[3,72000],[4,74000],[5,75000],[3,76000],[4,77000],[5,78000],[3,79000],
         [4,80000],[5,81000],[3,82000],[4,83000],[5,84000],[3,84500],[4,85000]]],
    // 2: ドン・ペリニョン（8件）
    [2, [[3,18000],[4,19000],[5,20000],[3,22000],[4,24000],[5,25000],[3,27000],[4,28500]]],
    // 3: ロマネ・コンティ（41件）
    [3, [[3,1500000],[4,1550000],[5,1580000],[3,1600000],[4,1620000],[5,1640000],[3,1660000],
         [4,1680000],[5,1700000],[3,1710000],[4,1720000],[5,1730000],[3,1740000],[4,1750000],
         [5,1760000],[3,1770000],[4,1775000],[5,1780000],[3,1785000],[4,1790000],[5,1795000],
         [3,1800000],[4,1805000],[5,1810000],[3,1815000],[4,1820000],[5,1825000],[3,1830000],
         [4,1835000],[5,1838000],[3,1840000],[4,1842000],[5,1844000],[3,1845000],[4,1846000],
         [5,1847000],[3,1848000],[4,1849000],[5,1849500],[3,1849800],[4,1850000]]],
    // 4: ペトリュス（37件）
    [4, [[3,350000],[4,355000],[5,360000],[3,365000],[4,370000],[5,373000],[3,376000],
         [4,379000],[5,382000],[3,385000],[4,388000],[5,390000],[3,392000],[4,394000],
         [5,396000],[3,397000],[4,398000],[5,399000],[3,400000],[4,401000],[5,402000],
         [3,404000],[4,406000],[5,408000],[3,410000],[4,412000],[5,413000],[3,414000],
         [4,415000],[5,416000],[3,417000],[4,418000],[5,418500],[3,419000],[4,419500],
         [5,419800],[3,420000]]],
    // 5: サッシカイア（15件）
    [5, [[3,22000],[4,23000],[5,24000],[3,25000],[4,26000],[5,27000],[3,28000],[4,29000],
         [5,29500],[3,30000],[4,30500],[5,31000],[3,31500],[4,32000],[5,32000]]],
    // 6: ウィスパリング・エンジェル（5件）
    [6, [[3,3200],[4,3500],[5,3800],[3,4200],[4,4800]]],
    // 7: オーパス・ワン（19件）
    [7, [[3,120000],[4,125000],[5,128000],[3,130000],[4,133000],[5,136000],[3,139000],
         [4,142000],[5,145000],[3,148000],[4,151000],[5,154000],[3,157000],[4,160000],
         [5,161000],[3,162000],[4,163000],[5,164000],[3,165000]]],
    // 8: ハーラン・エステート（12件）
    [8, [[3,70000],[4,73000],[5,76000],[3,79000],[4,82000],[5,85000],[3,88000],
         [4,90000],[5,92000],[3,93000],[4,94000],[5,95000]]],
  ];

  allBidHistory.forEach(([auctionId, bids]) => {
    bids.forEach(([bidderId, amount], i) => {
      const hoursAgo = (bids.length - i) * 2; // 2時間ずつ間隔
      const t = new Date(now.getTime() - hoursAgo * 3600 * 1000).toISOString();
      insertBid.run(auctionId, bidderId, amount, t);
    });
  });

  console.log('✅ データベース初期化完了');
}

// ワイン画像URL設定（Wikimedia Commons）
const wineImageMap = {
  'Château Margaux':               'https://upload.wikimedia.org/wikipedia/commons/3/34/Chateau-Margaux_1947.JPG',
  'Dom Pérignon':                  'https://upload.wikimedia.org/wikipedia/commons/7/76/Dom_Perignon_1999.jpg',
  'Domaine de la Romanée-Conti':   'https://upload.wikimedia.org/wikipedia/commons/b/ba/Bouteille_de_Roman%C3%A9e_Conti.JPG',
  'Château Pétrus':                'https://upload.wikimedia.org/wikipedia/commons/1/11/Ch%C3%A2teau_P%C3%A9trus.jpg',
  'Tenuta San Guido':              'https://upload.wikimedia.org/wikipedia/commons/2/2f/Sassicaia.jpg',
  "Château d'Esclans":             'https://upload.wikimedia.org/wikipedia/commons/1/12/18-07-2017_Portuguese_ros%C3%A9_wine%2C_Mateus.JPG',
  'Opus One Winery':               'https://upload.wikimedia.org/wikipedia/commons/4/45/Opus_One_1997.jpg',
  'Harlan Estate':                 'https://upload.wikimedia.org/wikipedia/commons/4/4f/1997_Bryant_Family_Vineyard.jpeg',
};
Object.entries(wineImageMap).forEach(([producer, url]) => {
  db.prepare("UPDATE auctions SET image_url = ? WHERE producer = ? AND (image_url IS NULL OR image_url = '')").run(url, producer);
});

// 管理者アカウント自動作成（環境変数から）
const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;
if (adminEmail && adminPassword) {
  const bcrypt = require('bcryptjs');
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail);
  if (!existing) {
    const hash = bcrypt.hashSync(adminPassword, 10);
    db.prepare(`
      INSERT INTO users (username, email, password_hash, display_name, is_admin, email_verified)
      VALUES (?, ?, ?, ?, 1, 1)
    `).run('admin_nakano', adminEmail, hash, '管理者');
    console.log('✅ 管理者アカウント作成:', adminEmail);
  } else {
    db.prepare('UPDATE users SET is_admin = 1, email_verified = 1 WHERE email = ?').run(adminEmail);
    console.log('✅ 管理者権限付与:', adminEmail);
  }
}

module.exports = db;
