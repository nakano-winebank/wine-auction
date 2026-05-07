const path = require('path');

const DATABASE_URL = process.env.DATABASE_URL;
const USE_PG = !!DATABASE_URL;

let db;

if (USE_PG) {
  // ===================== PostgreSQL モード =====================
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: DATABASE_URL.includes('railway') || DATABASE_URL.includes('neon') || DATABASE_URL.includes('supabase')
      ? { rejectUnauthorized: false }
      : undefined,
    max: 20,
    idleTimeoutMillis: 30000,
  });

  // SQLite → PostgreSQL の SQL 変換
  function convertSQL(sql) {
    let s = sql;
    // INTEGER PRIMARY KEY AUTOINCREMENT → SERIAL PRIMARY KEY
    s = s.replace(/INTEGER\s+PRIMARY\s+KEY\s+AUTOINCREMENT/gi, 'SERIAL PRIMARY KEY');
    // datetime('now', 'localtime') → NOW()
    s = s.replace(/datetime\s*\(\s*'now'\s*,\s*'localtime'\s*\)/gi, 'NOW()');
    // datetime('now') → NOW()
    s = s.replace(/datetime\s*\(\s*'now'\s*\)/gi, 'NOW()');
    // datetime('now', '+1 hour') → NOW() + INTERVAL '1 hour'
    s = s.replace(/datetime\s*\(\s*'now'\s*,\s*'([^']+)'\s*\)/gi, (_, interval) => `NOW() + INTERVAL '${interval}'`);
    // INSERT OR IGNORE → INSERT ... ON CONFLICT DO NOTHING
    s = s.replace(/INSERT\s+OR\s+IGNORE\s+INTO/gi, 'INSERT INTO');
    // REAL → DOUBLE PRECISION
    s = s.replace(/\bREAL\b/gi, 'DOUBLE PRECISION');
    // INTEGER DEFAULT → INT DEFAULT (fine as-is)
    // ? placeholders → $1, $2, ...
    let idx = 0;
    s = s.replace(/\?/g, () => `$${++idx}`);
    return s;
  }

  // ON CONFLICT DO NOTHING を付与（INSERT OR IGNORE の変換用）
  function addOnConflictIfNeeded(originalSQL, convertedSQL) {
    if (/INSERT\s+OR\s+IGNORE/i.test(originalSQL)) {
      // INSERT INTO ... VALUES (...) の後に ON CONFLICT DO NOTHING を追加
      return convertedSQL.replace(/(VALUES\s*\([^)]+\))/, '$1 ON CONFLICT DO NOTHING');
    }
    return convertedSQL;
  }

  function prepare(sql) {
    const pgSQL = addOnConflictIfNeeded(sql, convertSQL(sql));
    return {
      get: async (...params) => {
        const result = await pool.query(pgSQL, params);
        return result.rows[0] || null;
      },
      all: async (...params) => {
        const result = await pool.query(pgSQL, params);
        return result.rows;
      },
      run: async (...params) => {
        const result = await pool.query(pgSQL, params);
        return {
          changes: result.rowCount,
          lastInsertRowid: result.rows && result.rows[0] ? result.rows[0].id : null,
        };
      },
    };
  }

  async function exec(sql) {
    const pgSQL = convertSQL(sql);
    // 複数ステートメントを分割して実行
    const statements = pgSQL.split(';').map(s => s.trim()).filter(s => s.length > 0);
    for (const stmt of statements) {
      await pool.query(stmt);
    }
  }

  async function transaction(fn) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await fn();
      await client.query('COMMIT');
      return result;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  db = { prepare, exec, transaction, pool, isPG: true };

  // 初期化（非同期）
  async function initPG() {
    console.log('🐘 PostgreSQL モードで起動');

    // スキーマ作成
    await exec(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        display_name TEXT,
        full_name TEXT,
        phone TEXT,
        birthdate TEXT,
        license_image_url TEXT,
        license_verified INT DEFAULT 0,
        stripe_customer_id TEXT,
        rating DOUBLE PRECISION DEFAULT 5.0,
        trade_count INT DEFAULT 0,
        is_verified_seller INT DEFAULT 0,
        is_admin INT DEFAULT 0,
        email_verified INT DEFAULT 0,
        verification_token TEXT,
        reset_token TEXT,
        reset_token_expires TEXT,
        is_blocked INT DEFAULT 0,
        address_zip TEXT,
        address_pref TEXT,
        address_city TEXT,
        address_street TEXT,
        bank_name TEXT,
        bank_branch TEXT,
        bank_account_type TEXT,
        bank_account_number TEXT,
        bank_account_holder TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await exec(`
      CREATE TABLE IF NOT EXISTS auctions (
        id SERIAL PRIMARY KEY,
        seller_id INT NOT NULL REFERENCES users(id),
        title TEXT NOT NULL,
        producer TEXT NOT NULL,
        vintage INT,
        region TEXT,
        appellation TEXT,
        grape TEXT,
        volume_ml INT DEFAULT 750,
        description TEXT,
        condition_note TEXT DEFAULT '未開封',
        score_rp INT,
        score_ws INT,
        starting_price INT NOT NULL,
        current_price INT NOT NULL,
        bid_count INT DEFAULT 0,
        bidder_count INT DEFAULT 0,
        end_time TIMESTAMP NOT NULL,
        status TEXT DEFAULT 'active',
        approval_status TEXT DEFAULT 'approved',
        image_emoji TEXT DEFAULT '🍷',
        image_color TEXT DEFAULT 'from-red-900 via-red-700 to-red-900',
        image_url TEXT,
        wine_type TEXT DEFAULT 'red',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await exec(`
      CREATE TABLE IF NOT EXISTS bids (
        id SERIAL PRIMARY KEY,
        auction_id INT NOT NULL REFERENCES auctions(id),
        bidder_id INT NOT NULL REFERENCES users(id),
        amount INT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await exec(`
      CREATE TABLE IF NOT EXISTS watchlist (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id),
        auction_id INT NOT NULL REFERENCES auctions(id),
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, auction_id)
      )
    `);

    await exec(`
      CREATE TABLE IF NOT EXISTS auction_images (
        id SERIAL PRIMARY KEY,
        auction_id INT NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
        url TEXT NOT NULL,
        label TEXT,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await exec(`
      CREATE TABLE IF NOT EXISTS blocked_users (
        id SERIAL PRIMARY KEY,
        blocker_id INT NOT NULL REFERENCES users(id),
        blocked_id INT NOT NULL REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(blocker_id, blocked_id)
      )
    `);

    await exec(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        auction_id INT NOT NULL REFERENCES auctions(id) UNIQUE,
        buyer_id INT NOT NULL REFERENCES users(id),
        seller_id INT NOT NULL REFERENCES users(id),
        amount INT NOT NULL,
        stripe_payment_intent_id TEXT,
        stripe_status TEXT DEFAULT 'pending',
        status TEXT DEFAULT 'pending',
        fulfillment_status TEXT DEFAULT 'pending_payment',
        shipping_name TEXT,
        shipping_zip TEXT,
        shipping_address TEXT,
        shipping_phone TEXT,
        shipping_method TEXT DEFAULT 'normal',
        shipping_fee INT DEFAULT 0,
        tracking_number TEXT,
        carrier TEXT,
        shipped_at TIMESTAMP,
        delivered_at TIMESTAMP,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        paid_at TIMESTAMP
      )
    `);

    await exec(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        order_id INT REFERENCES orders(id),
        sender_id INT NOT NULL REFERENCES users(id),
        receiver_id INT NOT NULL REFERENCES users(id),
        content TEXT NOT NULL,
        is_read INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // シードデータ（初回のみ）
    const countResult = await pool.query('SELECT COUNT(*) as c FROM users');
    if (parseInt(countResult.rows[0].c) === 0) {
      await seedData();
    }

    // ワイン画像URL設定
    await setWineImages();

    // 管理者アカウント
    await createAdminAccount();

    console.log('✅ PostgreSQL 初期化完了');
  }

  async function seedData() {
    const bcrypt = require('bcryptjs');
    const hash = bcrypt.hashSync('password123', 10);

    await pool.query(`
      INSERT INTO users (username, email, password_hash, display_name, rating, trade_count, is_verified_seller, is_admin, email_verified)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, ['wine_lover', 'lover@example.com', hash, 'wine_lover_***', 4.8, 45, 0, 1, 1]);

    const users = [
      ['WineCellar_Osaka', 'cellar@example.com', hash, 'WineCellar_Osaka', 4.9, 342, 1],
      ['bordeaux_fan', 'bordeaux@example.com', hash, 'bordeaux_***', 4.7, 89, 0],
      ['sakura_wine', 'sakura@example.com', hash, 'sakura_wine_***', 4.9, 120, 0],
      ['tokyo_wine', 'tokyo@example.com', hash, 'tokyo_wine_***', 4.6, 33, 0],
    ];
    for (const u of users) {
      await pool.query(`INSERT INTO users (username, email, password_hash, display_name, rating, trade_count, is_verified_seller) VALUES ($1,$2,$3,$4,$5,$6,$7)`, u);
    }

    const now = new Date();
    const endTimes = [
      new Date(now.getTime() + 2 * 24 * 3600 * 1000 + 14 * 60 * 1000),
      new Date(now.getTime() + 4 * 24 * 3600 * 1000),
      new Date(now.getTime() + 6 * 24 * 3600 * 1000),
      new Date(now.getTime() + 1 * 24 * 3600 * 1000 + 45 * 60 * 1000),
      new Date(now.getTime() + 5 * 24 * 3600 * 1000),
      new Date(now.getTime() + 7 * 24 * 3600 * 1000),
      new Date(now.getTime() + 3 * 24 * 3600 * 1000),
      new Date(now.getTime() + 2 * 24 * 3600 * 1000),
    ].map(d => d.toISOString().replace('T', ' ').slice(0, 19));

    const wines = [
      [2, 'シャトー・マルゴー 2015 750ml', 'Château Margaux', 2015, 'ボルドー', 'Margaux AOC 1er Grand Cru', 'Cab.S 87% / Merlot 8% / 他', 750,
       '2015年のシャトー・マルゴーです。ボルドーの偉大なヴィンテージの一つ。ロバート・パーカーより98点、ワイン・スペクテイターより98点の最高評価を受けています。\n\n当セラーにて温度・湿度管理のもと購入時から保管。木箱未開封でお届けします。正規輸入品でございます。',
       '木箱未開封 / 温度管理済みセラー保管', 98, 98, 50000, 85000, 23, 8, endTimes[0], '🍷', 'from-red-900 via-red-700 to-red-900', 'red'],
      [2, 'ドン・ペリニョン 2012 シャンパーニュ', 'Dom Pérignon', 2012, 'シャンパーニュ', 'Champagne AOC', 'Chardonnay / Pinot Noir', 750,
       '2012年のドン・ペリニョン。最高のシャンパーニュヴィンテージの一つ。',
       '未開封 / 専用ケース付き', 96, 95, 18000, 28500, 8, 5, endTimes[1], '🥂', 'from-yellow-800 via-yellow-600 to-yellow-800', 'sparkling'],
      [2, 'ロマネ・コンティ 2018 750ml', 'Domaine de la Romanée-Conti', 2018, 'ブルゴーニュ', 'Romanée-Conti Grand Cru', 'Pinot Noir 100%', 750,
       'ブルゴーニュの最高峰、ロマネ・コンティの2018年。DRCが誇る至高の一本。',
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
      await pool.query(`
        INSERT INTO auctions (seller_id, title, producer, vintage, region, appellation, grape, volume_ml,
          description, condition_note, score_rp, score_ws, starting_price, current_price,
          bid_count, bidder_count, end_time, image_emoji, image_color, wine_type)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)
      `, wine);
    }

    // 入札履歴シード
    const allBidHistory = [
      [1, [[3,50000],[4,53000],[5,55000],[3,58000],[4,61000],[5,63000],[3,66000],[4,68000],
           [5,70000],[3,72000],[4,74000],[5,75000],[3,76000],[4,77000],[5,78000],[3,79000],
           [4,80000],[5,81000],[3,82000],[4,83000],[5,84000],[3,84500],[4,85000]]],
      [2, [[3,18000],[4,19000],[5,20000],[3,22000],[4,24000],[5,25000],[3,27000],[4,28500]]],
      [3, [[3,1500000],[4,1550000],[5,1580000],[3,1600000],[4,1620000],[5,1640000],[3,1660000],
           [4,1680000],[5,1700000],[3,1710000],[4,1720000],[5,1730000],[3,1740000],[4,1750000],
           [5,1760000],[3,1770000],[4,1775000],[5,1780000],[3,1785000],[4,1790000],[5,1795000],
           [3,1800000],[4,1805000],[5,1810000],[3,1815000],[4,1820000],[5,1825000],[3,1830000],
           [4,1835000],[5,1838000],[3,1840000],[4,1842000],[5,1844000],[3,1845000],[4,1846000],
           [5,1847000],[3,1848000],[4,1849000],[5,1849500],[3,1849800],[4,1850000]]],
      [4, [[3,350000],[4,355000],[5,360000],[3,365000],[4,370000],[5,373000],[3,376000],
           [4,379000],[5,382000],[3,385000],[4,388000],[5,390000],[3,392000],[4,394000],
           [5,396000],[3,397000],[4,398000],[5,399000],[3,400000],[4,401000],[5,402000],
           [3,404000],[4,406000],[5,408000],[3,410000],[4,412000],[5,413000],[3,414000],
           [4,415000],[5,416000],[3,417000],[4,418000],[5,418500],[3,419000],[4,419500],
           [5,419800],[3,420000]]],
      [5, [[3,22000],[4,23000],[5,24000],[3,25000],[4,26000],[5,27000],[3,28000],[4,29000],
           [5,29500],[3,30000],[4,30500],[5,31000],[3,31500],[4,32000],[5,32000]]],
      [6, [[3,3200],[4,3500],[5,3800],[3,4200],[4,4800]]],
      [7, [[3,120000],[4,125000],[5,128000],[3,130000],[4,133000],[5,136000],[3,139000],
           [4,142000],[5,145000],[3,148000],[4,151000],[5,154000],[3,157000],[4,160000],
           [5,161000],[3,162000],[4,163000],[5,164000],[3,165000]]],
      [8, [[3,70000],[4,73000],[5,76000],[3,79000],[4,82000],[5,85000],[3,88000],
           [4,90000],[5,92000],[3,93000],[4,94000],[5,95000]]],
    ];

    for (const [auctionId, bids] of allBidHistory) {
      for (let i = 0; i < bids.length; i++) {
        const [bidderId, amount] = bids[i];
        const hoursAgo = (bids.length - i) * 2;
        const t = new Date(now.getTime() - hoursAgo * 3600 * 1000).toISOString();
        await pool.query('INSERT INTO bids (auction_id, bidder_id, amount, created_at) VALUES ($1, $2, $3, $4)', [auctionId, bidderId, amount, t]);
      }
    }

    // デモ注文シード
    await pool.query(`INSERT INTO orders (auction_id, buyer_id, seller_id, amount, status, fulfillment_status) VALUES ($1, $2, $3, $4, $5, $6)`, [4, 1, 2, 422000, 'pending', 'pending_payment']);
    await pool.query(`INSERT INTO orders (auction_id, buyer_id, seller_id, amount, status, fulfillment_status) VALUES ($1, $2, $3, $4, $5, $6)`, [1, 1, 2, 90000, 'pending', 'pending_payment']);

    console.log('✅ PostgreSQL シードデータ投入完了');
  }

  async function setWineImages() {
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
    for (const [producer, url] of Object.entries(wineImageMap)) {
      await pool.query("UPDATE auctions SET image_url = $1 WHERE producer = $2 AND (image_url IS NULL OR image_url = '')", [url, producer]);
    }
  }

  async function createAdminAccount() {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (adminEmail && adminPassword) {
      const bcrypt = require('bcryptjs');
      const existing = await pool.query('SELECT id FROM users WHERE email = $1', [adminEmail]);
      if (existing.rows.length === 0) {
        const hash = bcrypt.hashSync(adminPassword, 10);
        await pool.query(`INSERT INTO users (username, email, password_hash, display_name, is_admin, email_verified) VALUES ($1, $2, $3, $4, 1, 1)`,
          ['admin_nakano', adminEmail, hash, '管理者']);
        console.log('✅ 管理者アカウント作成:', adminEmail);
      } else {
        await pool.query('UPDATE users SET is_admin = 1, email_verified = 1 WHERE email = $1', [adminEmail]);
        console.log('✅ 管理者権限付与:', adminEmail);
      }
    }
  }

  db.init = initPG;

} else {
  // ===================== SQLite モード（ローカル開発用） =====================
  const { DatabaseSync } = require('node:sqlite');
  const sqliteDb = new DatabaseSync(path.join(__dirname, 'wine_auction.db'));

  sqliteDb.exec("PRAGMA journal_mode = WAL");
  sqliteDb.exec("PRAGMA foreign_keys = ON");

  // スキーマ作成
  sqliteDb.exec(`
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
  const existingCols = sqliteDb.prepare("PRAGMA table_info(auctions)").all().map(c => c.name);
  if (!existingCols.includes('image_url')) sqliteDb.exec("ALTER TABLE auctions ADD COLUMN image_url TEXT");

  const userCols = sqliteDb.prepare("PRAGMA table_info(users)").all().map(c => c.name);
  const userIntCols = ['is_admin','email_verified','is_blocked','license_verified'];
  const userTextCols = ['verification_token','reset_token','reset_token_expires','full_name','phone','license_image_url','stripe_customer_id'];
  userIntCols.forEach(col => { if (!userCols.includes(col)) sqliteDb.exec(`ALTER TABLE users ADD COLUMN ${col} INTEGER DEFAULT 0`); });
  userTextCols.forEach(col => { if (!userCols.includes(col)) sqliteDb.exec(`ALTER TABLE users ADD COLUMN ${col} TEXT`); });

  const orderCols = sqliteDb.prepare("PRAGMA table_info(orders)").all().map(c => c.name);
  if (!orderCols.includes('shipping_method')) sqliteDb.exec("ALTER TABLE orders ADD COLUMN shipping_method TEXT DEFAULT 'normal'");
  if (!orderCols.includes('shipping_fee')) sqliteDb.exec("ALTER TABLE orders ADD COLUMN shipping_fee INTEGER DEFAULT 0");

  const addrCols = ['address_zip','address_pref','address_city','address_street','bank_name','bank_branch','bank_account_type','bank_account_number','bank_account_holder'];
  addrCols.forEach(col => { if (!userCols.includes(col)) sqliteDb.exec(`ALTER TABLE users ADD COLUMN ${col} TEXT`); });

  const auctionCols2 = sqliteDb.prepare("PRAGMA table_info(auctions)").all().map(c => c.name);
  if (!auctionCols2.includes('approval_status')) sqliteDb.exec("ALTER TABLE auctions ADD COLUMN approval_status TEXT DEFAULT 'approved'");

  const userCols2 = sqliteDb.prepare("PRAGMA table_info(users)").all().map(c => c.name);
  if (!userCols2.includes('birthdate')) sqliteDb.exec("ALTER TABLE users ADD COLUMN birthdate TEXT");

  const orderCols2 = sqliteDb.prepare("PRAGMA table_info(orders)").all().map(c => c.name);
  if (!orderCols2.includes('fulfillment_status')) sqliteDb.exec("ALTER TABLE orders ADD COLUMN fulfillment_status TEXT DEFAULT 'pending_payment'");
  if (!orderCols2.includes('tracking_number')) sqliteDb.exec("ALTER TABLE orders ADD COLUMN tracking_number TEXT");
  if (!orderCols2.includes('carrier')) sqliteDb.exec("ALTER TABLE orders ADD COLUMN carrier TEXT");
  if (!orderCols2.includes('shipped_at')) sqliteDb.exec("ALTER TABLE orders ADD COLUMN shipped_at TEXT");
  if (!orderCols2.includes('delivered_at')) sqliteDb.exec("ALTER TABLE orders ADD COLUMN delivered_at TEXT");
  if (!orderCols2.includes('completed_at')) sqliteDb.exec("ALTER TABLE orders ADD COLUMN completed_at TEXT");

  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER REFERENCES orders(id),
      sender_id INTEGER NOT NULL REFERENCES users(id),
      receiver_id INTEGER NOT NULL REFERENCES users(id),
      content TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now', 'localtime'))
    );
  `);

  // SQLite用ラッパー: prepare → get/all/run を async 互換にする
  function prepare(sql) {
    const stmt = sqliteDb.prepare(sql);
    return {
      get: async (...params) => stmt.get(...params) || null,
      all: async (...params) => stmt.all(...params),
      run: async (...params) => {
        const result = stmt.run(...params);
        return result;
      },
    };
  }

  function exec(sql) {
    return sqliteDb.exec(sql);
  }

  function transaction(fn) {
    sqliteDb.exec('BEGIN');
    try {
      const result = fn();
      sqliteDb.exec('COMMIT');
      return result;
    } catch (e) {
      sqliteDb.exec('ROLLBACK');
      throw e;
    }
  }

  db = { prepare, exec, transaction, isPG: false, _sqlite: sqliteDb };

  // シードデータ
  const userCount = sqliteDb.prepare('SELECT COUNT(*) as c FROM users').get();
  if (userCount.c === 0) {
    const bcrypt = require('bcryptjs');
    const hash = bcrypt.hashSync('password123', 10);

    sqliteDb.prepare(`
      INSERT INTO users (username, email, password_hash, display_name, rating, trade_count, is_verified_seller, is_admin, email_verified)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run('wine_lover', 'lover@example.com', hash, 'wine_lover_***', 4.8, 45, 0, 1, 1);

    const insertUser = sqliteDb.prepare(`INSERT INTO users (username, email, password_hash, display_name, rating, trade_count, is_verified_seller) VALUES (?, ?, ?, ?, ?, ?, ?)`);
    insertUser.run('WineCellar_Osaka', 'cellar@example.com', hash, 'WineCellar_Osaka', 4.9, 342, 1);
    insertUser.run('bordeaux_fan', 'bordeaux@example.com', hash, 'bordeaux_***', 4.7, 89, 0);
    insertUser.run('sakura_wine', 'sakura@example.com', hash, 'sakura_wine_***', 4.9, 120, 0);
    insertUser.run('tokyo_wine', 'tokyo@example.com', hash, 'tokyo_wine_***', 4.6, 33, 0);

    const now = new Date();
    const endTimes = [
      new Date(now.getTime() + 2 * 24 * 3600 * 1000 + 14 * 60 * 1000),
      new Date(now.getTime() + 4 * 24 * 3600 * 1000),
      new Date(now.getTime() + 6 * 24 * 3600 * 1000),
      new Date(now.getTime() + 1 * 24 * 3600 * 1000 + 45 * 60 * 1000),
      new Date(now.getTime() + 5 * 24 * 3600 * 1000),
      new Date(now.getTime() + 7 * 24 * 3600 * 1000),
      new Date(now.getTime() + 3 * 24 * 3600 * 1000),
      new Date(now.getTime() + 2 * 24 * 3600 * 1000),
    ].map(d => d.toISOString().replace('T', ' ').slice(0, 19));

    const insertAuction = sqliteDb.prepare(`
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
       '2012年のドン・ペリニョン。最高のシャンパーニュヴィンテージの一つ。',
       '未開封 / 専用ケース付き', 96, 95, 18000, 28500, 8, 5, endTimes[1], '🥂', 'from-yellow-800 via-yellow-600 to-yellow-800', 'sparkling'],
      [2, 'ロマネ・コンティ 2018 750ml', 'Domaine de la Romanée-Conti', 2018, 'ブルゴーニュ', 'Romanée-Conti Grand Cru', 'Pinot Noir 100%', 750,
       'ブルゴーニュの最高峰、ロマネ・コンティの2018年。DRCが誇る至高の一本。',
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

    const insertBid = sqliteDb.prepare('INSERT INTO bids (auction_id, bidder_id, amount, created_at) VALUES (?, ?, ?, ?)');
    const allBidHistory = [
      [1, [[3,50000],[4,53000],[5,55000],[3,58000],[4,61000],[5,63000],[3,66000],[4,68000],
           [5,70000],[3,72000],[4,74000],[5,75000],[3,76000],[4,77000],[5,78000],[3,79000],
           [4,80000],[5,81000],[3,82000],[4,83000],[5,84000],[3,84500],[4,85000]]],
      [2, [[3,18000],[4,19000],[5,20000],[3,22000],[4,24000],[5,25000],[3,27000],[4,28500]]],
      [3, [[3,1500000],[4,1550000],[5,1580000],[3,1600000],[4,1620000],[5,1640000],[3,1660000],
           [4,1680000],[5,1700000],[3,1710000],[4,1720000],[5,1730000],[3,1740000],[4,1750000],
           [5,1760000],[3,1770000],[4,1775000],[5,1780000],[3,1785000],[4,1790000],[5,1795000],
           [3,1800000],[4,1805000],[5,1810000],[3,1815000],[4,1820000],[5,1825000],[3,1830000],
           [4,1835000],[5,1838000],[3,1840000],[4,1842000],[5,1844000],[3,1845000],[4,1846000],
           [5,1847000],[3,1848000],[4,1849000],[5,1849500],[3,1849800],[4,1850000]]],
      [4, [[3,350000],[4,355000],[5,360000],[3,365000],[4,370000],[5,373000],[3,376000],
           [4,379000],[5,382000],[3,385000],[4,388000],[5,390000],[3,392000],[4,394000],
           [5,396000],[3,397000],[4,398000],[5,399000],[3,400000],[4,401000],[5,402000],
           [3,404000],[4,406000],[5,408000],[3,410000],[4,412000],[5,413000],[3,414000],
           [4,415000],[5,416000],[3,417000],[4,418000],[5,418500],[3,419000],[4,419500],
           [5,419800],[3,420000]]],
      [5, [[3,22000],[4,23000],[5,24000],[3,25000],[4,26000],[5,27000],[3,28000],[4,29000],
           [5,29500],[3,30000],[4,30500],[5,31000],[3,31500],[4,32000],[5,32000]]],
      [6, [[3,3200],[4,3500],[5,3800],[3,4200],[4,4800]]],
      [7, [[3,120000],[4,125000],[5,128000],[3,130000],[4,133000],[5,136000],[3,139000],
           [4,142000],[5,145000],[3,148000],[4,151000],[5,154000],[3,157000],[4,160000],
           [5,161000],[3,162000],[4,163000],[5,164000],[3,165000]]],
      [8, [[3,70000],[4,73000],[5,76000],[3,79000],[4,82000],[5,85000],[3,88000],
           [4,90000],[5,92000],[3,93000],[4,94000],[5,95000]]],
    ];

    allBidHistory.forEach(([auctionId, bids]) => {
      bids.forEach(([bidderId, amount], i) => {
        const hoursAgo = (bids.length - i) * 2;
        const t = new Date(now.getTime() - hoursAgo * 3600 * 1000).toISOString();
        insertBid.run(auctionId, bidderId, amount, t);
      });
    });

    console.log('✅ SQLite データベース初期化完了');
  }

  // ワイン画像URL設定
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
    sqliteDb.prepare("UPDATE auctions SET image_url = ? WHERE producer = ? AND (image_url IS NULL OR image_url = '')").run(url, producer);
  });

  // 管理者アカウント自動作成
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminEmail && adminPassword) {
    const bcrypt = require('bcryptjs');
    const existing = sqliteDb.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail);
    if (!existing) {
      const hash = bcrypt.hashSync(adminPassword, 10);
      sqliteDb.prepare(`INSERT INTO users (username, email, password_hash, display_name, is_admin, email_verified) VALUES (?, ?, ?, ?, 1, 1)`)
        .run('admin_nakano', adminEmail, hash, '管理者');
      console.log('✅ 管理者アカウント作成:', adminEmail);
    } else {
      sqliteDb.prepare('UPDATE users SET is_admin = 1, email_verified = 1 WHERE email = ?').run(adminEmail);
      console.log('✅ 管理者権限付与:', adminEmail);
    }
  }

  db.init = async () => { console.log('📦 SQLite モードで起動'); };
}

module.exports = db;
