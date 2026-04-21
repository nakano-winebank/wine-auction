const express = require('express');
const router = express.Router();
const multer = require('multer');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');
const db = require('../database');
const { authenticateToken } = require('../middleware/auth');

// ZIP解凍用（Node.js標準モジュールのみ使用）
const zlib = require('zlib');

// アップロードディレクトリ確保
const UPLOADS_DIR = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// 管理者チェック
function requireAdmin(req, res, next) {
  const user = db.prepare('SELECT is_admin FROM users WHERE id = ?').get(req.user.id);
  if (!user || !user.is_admin) return res.status(403).json({ error: '管理者権限が必要です' });
  next();
}

// カラム名の正規化（日本語・英語どちらも受け付ける）
const COLUMN_MAP = {
  // 日本語列名
  'タイトル': 'title', '商品名': 'title', 'ワイン名': 'title',
  '生産者': 'producer', 'プロデューサー': 'producer',
  'ヴィンテージ': 'vintage', 'ビンテージ': 'vintage', '年': 'vintage',
  '産地': 'region', '地域': 'region',
  'アペラシオン': 'appellation', 'AOC': 'appellation',
  '品種': 'grape', 'ブドウ品種': 'grape',
  '容量ml': 'volume_ml', '容量': 'volume_ml', 'ボトルサイズ': 'volume_ml',
  '説明': 'description', '商品説明': 'description',
  '保管状態': 'condition_note', 'コンディション': 'condition_note',
  'RPスコア': 'score_rp', 'RP': 'score_rp', 'ロバートパーカー': 'score_rp',
  'WSスコア': 'score_ws', 'WS': 'score_ws', 'ワインスペクテイター': 'score_ws',
  '開始価格': 'starting_price', '開始金額': 'starting_price', 'スタート価格': 'starting_price',
  '終了時間': 'end_hours', '終了時間(時間)': 'end_hours', '終了まで時間': 'end_hours', '掲載時間': 'end_hours',
  'ワイン種別': 'wine_type', '種別': 'wine_type', '色': 'wine_type',
  '絵文字': 'image_emoji',
  // 画像URL列（3枚）
  '正面画像URL': 'img_front', '正面URL': 'img_front', '画像URL': 'img_front', '写真URL': 'img_front',
  '背面画像URL': 'img_back', '背面URL': 'img_back', '裏ラベルURL': 'img_back',
  'キャップ画像URL': 'img_cap', 'キャップURL': 'img_cap', 'シールURL': 'img_cap',
  // 英語列名
  'title': 'title', 'producer': 'producer', 'vintage': 'vintage',
  'region': 'region', 'appellation': 'appellation', 'grape': 'grape',
  'volume_ml': 'volume_ml', 'description': 'description',
  'condition_note': 'condition_note', 'score_rp': 'score_rp',
  'score_ws': 'score_ws', 'starting_price': 'starting_price',
  'end_hours': 'end_hours', 'wine_type': 'wine_type', 'image_emoji': 'image_emoji',
  'img_front': 'img_front', 'img_back': 'img_back', 'img_cap': 'img_cap',
};

const WINE_COLORS = {
  red: 'from-red-900 via-red-700 to-red-900',
  white: 'from-yellow-800 via-yellow-600 to-yellow-800',
  sparkling: 'from-yellow-800 via-yellow-600 to-yellow-800',
  rose: 'from-pink-800 via-pink-500 to-pink-800',
  other: 'from-gray-700 via-gray-500 to-gray-700',
};
const WINE_EMOJIS = { red: '🍷', white: '🥂', sparkling: '🍾', rose: '🌸', other: '🍶' };

// ワイン種別の正規化
function normalizeWineType(val) {
  if (!val) return 'red';
  const v = String(val).toLowerCase().trim();
  if (['赤', 'red', 'rouge'].includes(v)) return 'red';
  if (['白', 'white', 'blanc'].includes(v)) return 'white';
  if (['スパークリング', 'sparkling', 'champagne', 'シャンパン', 'シャンパーニュ', 'fizz'].includes(v)) return 'sparkling';
  if (['ロゼ', 'rose', 'rosé'].includes(v)) return 'rose';
  return 'other';
}

// テンプレートExcelを生成して返す
router.get('/template', authenticateToken, requireAdmin, (req, res) => {
  const wb = XLSX.utils.book_new();

  // ヘッダー行（日本語）
  const headers = [
    'タイトル', '生産者', 'ヴィンテージ', '産地', 'アペラシオン',
    '品種', '容量ml', '保管状態', '説明', 'RPスコア', 'WSスコア',
    '開始価格', '終了時間(時間)', 'ワイン種別',
    '正面画像URL', '背面画像URL', 'キャップ画像URL'
  ];

  // サンプルデータ2行
  const samples = [
    [
      'シャトー・マルゴー 2018 750ml', 'Château Margaux', 2018,
      'フランス / ボルドー', 'Margaux AOC 1er Grand Cru',
      'Cab.S 87% / Merlot 8%', 750, '未開封 / 木箱付き',
      'ボルドー最高峰のワインです。', 97, 96,
      50000, 72, '赤',
      'https://drive.google.com/uc?id=XXXXX', '', ''
    ],
    [
      'ドン・ペリニョン 2013', 'Dom Pérignon', 2013,
      'フランス / シャンパーニュ', 'Champagne AOC',
      'Chardonnay / Pinot Noir', 750, '未開封',
      'プレステージ・キュヴェの頂点。', 95, 94,
      20000, 120, 'スパークリング',
      '', '', ''
    ],
  ];

  const ws = XLSX.utils.aoa_to_sheet([headers, ...samples]);

  // 列幅設定
  ws['!cols'] = [
    {wch:40},{wch:25},{wch:10},{wch:25},{wch:30},
    {wch:25},{wch:10},{wch:20},{wch:40},{wch:8},{wch:8},
    {wch:12},{wch:15},{wch:12}
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'ワインデータ');

  // 注意事項シート
  const notes = [
    ['項目', '説明', '必須', '例'],
    ['タイトル', 'オークションのタイトル', '○', 'シャトー・マルゴー 2018 750ml'],
    ['生産者', 'ワイナリー・シャトー名', '○', 'Château Margaux'],
    ['ヴィンテージ', 'ワインの年号（数字）', '', '2018'],
    ['産地', '国・地域', '', 'フランス / ボルドー'],
    ['アペラシオン', 'AOC・DOCなど格付け', '', 'Margaux AOC 1er Grand Cru'],
    ['品種', 'ブドウ品種の構成', '', 'Cab.S 87% / Merlot 8%'],
    ['容量ml', 'ボトル容量（数字）', '', '750 / 1500 / 3000'],
    ['保管状態', '保管状況', '', '未開封 / 木箱付き / 温度管理済み'],
    ['説明', '商品説明文', '', '自由記述'],
    ['RPスコア', 'ロバートパーカーポイント（数字）', '', '98'],
    ['WSスコア', 'ワインスペクテイター（数字）', '', '97'],
    ['開始価格', '入札開始金額（円・数字）', '○', '50000'],
    ['終了時間(時間)', 'オークション期間（時間単位）', '○', '72（=3日）/ 120（=5日）/ 168（=7日）'],
    ['ワイン種別', '赤 / 白 / スパークリング / ロゼ / その他', '', '赤'],
  ];
  const wsNotes = XLSX.utils.aoa_to_sheet(notes);
  wsNotes['!cols'] = [{wch:20},{wch:40},{wch:6},{wch:40}];
  XLSX.utils.book_append_sheet(wb, wsNotes, '入力ガイド');

  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename="wine_auction_template.xlsx"');
  res.send(buf);
});

// Excel / CSV インポート
router.post('/auctions', authenticateToken, requireAdmin, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'ファイルを選択してください' });

  let rows;
  try {
    const wb = XLSX.read(req.file.buffer, { type: 'buffer', codepage: 65001 });
    const ws = wb.Sheets[wb.SheetNames[0]];
    // ヘッダー行を raw 配列で取得してから正規化
    const raw = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
    if (raw.length < 2) return res.status(400).json({ error: 'データが空です（ヘッダー行＋データ1行以上必要）' });

    // 1行目をヘッダーとしてマッピング
    const headers = raw[0].map(h => {
      const clean = String(h).replace(/^\uFEFF/, '').trim();
      return COLUMN_MAP[clean] || COLUMN_MAP[clean.toLowerCase()] || null;
    });

    rows = raw.slice(1).map(rowArr => {
      const obj = {};
      headers.forEach((field, idx) => {
        if (field) obj[field] = rowArr[idx] ?? '';
      });
      return obj;
    }).filter(r => Object.values(r).some(v => v !== ''));
  } catch (e) {
    return res.status(400).json({ error: 'ファイルの読み込みに失敗しました: ' + e.message });
  }

  if (rows.length === 0) return res.status(400).json({ error: 'データが空です' });
  if (rows.length > 1000) return res.status(400).json({ error: '一度にインポートできるのは1000件までです' });

  const sellerId = req.user.id;
  const now = new Date();
  const results = { success: 0, failed: 0, errors: [] };

  const stmt = db.prepare(`
    INSERT INTO auctions (
      seller_id, title, producer, vintage, region, appellation, grape, volume_ml,
      description, condition_note, score_rp, score_ws, starting_price, current_price,
      end_time, image_emoji, image_color, wine_type
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  rows.forEach((rawRow, i) => {
    // カラム名を正規化（BOM除去・前後スペース除去）
    const row = {};
    Object.entries(rawRow).forEach(([k, v]) => {
      const clean = String(k).replace(/^\uFEFF/, '').trim();
      const mapped = COLUMN_MAP[clean] || COLUMN_MAP[clean.toLowerCase()];
      if (mapped) row[mapped] = v;
    });

    const rowNum = i + 2; // ヘッダー行が1行目なので

    // 必須チェック
    if (!row.title) {
      results.failed++;
      results.errors.push({ row: rowNum, error: 'タイトルが空です' });
      return;
    }
    if (!row.producer) {
      results.failed++;
      results.errors.push({ row: rowNum, title: row.title, error: '生産者が空です' });
      return;
    }
    const startingPrice = parseInt(row.starting_price);
    if (!startingPrice || startingPrice <= 0) {
      results.failed++;
      results.errors.push({ row: rowNum, title: row.title, error: '開始価格が無効です' });
      return;
    }
    const endHours = parseFloat(row.end_hours) || 72;
    if (endHours <= 0) {
      results.failed++;
      results.errors.push({ row: rowNum, title: row.title, error: '終了時間が無効です' });
      return;
    }

    const wineType = normalizeWineType(row.wine_type);
    const endTime = new Date(now.getTime() + endHours * 3600 * 1000)
      .toISOString().replace('T', ' ').slice(0, 19);

    try {
      stmt.run(
        sellerId,
        String(row.title).trim(),
        String(row.producer).trim(),
        row.vintage ? parseInt(row.vintage) : null,
        row.region ? String(row.region).trim() : null,
        row.appellation ? String(row.appellation).trim() : null,
        row.grape ? String(row.grape).trim() : null,
        row.volume_ml ? parseInt(row.volume_ml) : 750,
        row.description ? String(row.description).trim() : null,
        row.condition_note ? String(row.condition_note).trim() : null,
        row.score_rp ? parseInt(row.score_rp) : null,
        row.score_ws ? parseInt(row.score_ws) : null,
        startingPrice, startingPrice,
        endTime,
        row.image_emoji || WINE_EMOJIS[wineType],
        WINE_COLORS[wineType],
        wineType
      );
      const auctionId = db.prepare('SELECT last_insert_rowid() as id').get().id;
      results.success++;
      results.ids = results.ids || [];
      results.ids.push(auctionId);

      // 画像URL列がある場合はauction_imagesに保存
      const imgEntries = [
        { url: row.img_front, label: '正面' },
        { url: row.img_back,  label: '背面（裏ラベル）' },
        { url: row.img_cap,   label: 'キャップシール' },
      ].filter(e => e.url && String(e.url).startsWith('http'));

      if (imgEntries.length > 0) {
        const imgStmt = db.prepare('INSERT INTO auction_images (auction_id, url, label, sort_order) VALUES (?, ?, ?, ?)');
        imgEntries.forEach((img, idx) => imgStmt.run(auctionId, String(img.url).trim(), img.label, idx));
      }
    } catch (e) {
      results.failed++;
      results.errors.push({ row: rowNum, title: row.title, error: e.message });
    }
  });

  res.json({
    success: true,
    total: rows.length,
    imported: results.success,
    failed: results.failed,
    errors: results.errors.slice(0, 20),
    auction_ids: results.ids || [],
  });
});

// ── ZIP一括写真アップロード ──────────────────────────────
// ファイル命名規則: {auction_id}_{ラベル}.jpg  例: 42_正面.jpg, 42_背面.jpg
// または: {行番号}_{ラベル}.jpg（auction_idsをクエリで渡す）
const zipUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 500 * 1024 * 1024 } });

router.post('/photos-zip', authenticateToken, requireAdmin, zipUpload.single('zip'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'ZIPファイルを選択してください' });

  // auction_ids: カンマ区切りで行番号→IDのマッピング用（省略時はファイル名のIDをそのまま使用）
  const auctionIds = req.body.auction_ids ? req.body.auction_ids.split(',').map(Number) : null;

  try {
    const AdmZip = (() => { try { return require('adm-zip'); } catch { return null; } })();
    if (!AdmZip) return res.status(500).json({ error: 'adm-zipが未インストールです。npm install adm-zip を実行してください。' });

    const zip = new AdmZip(req.file.buffer);
    const entries = zip.getEntries().filter(e => !e.isDirectory && /\.(jpg|jpeg|png|webp)$/i.test(e.entryName));

    const results = { saved: 0, skipped: 0, errors: [] };
    const imgStmt = db.prepare('INSERT OR IGNORE INTO auction_images (auction_id, url, label, sort_order) VALUES (?, ?, ?, ?)');

    for (const entry of entries) {
      const filename = path.basename(entry.entryName);
      // ファイル名から auction_id とラベルを抽出: 例 "42_正面.jpg" or "42.jpg"
      const match = filename.match(/^(\d+)(?:_(.+?))?\.(jpg|jpeg|png|webp)$/i);
      if (!match) { results.skipped++; continue; }

      let auctionId = parseInt(match[1]);
      const labelRaw = match[2] || '正面';

      // 行番号→auction_id変換（auction_idsが渡された場合）
      if (auctionIds && auctionIds.length > 0) {
        const idx = auctionId - 1; // 行番号は1始まり
        if (idx >= 0 && idx < auctionIds.length) auctionId = auctionIds[idx];
      }

      const auction = db.prepare('SELECT id FROM auctions WHERE id = ?').get(auctionId);
      if (!auction) { results.skipped++; results.errors.push(`${filename}: auction_id ${auctionId} が存在しません`); continue; }

      // ファイル保存
      const ext = path.extname(filename).toLowerCase();
      const savedName = `wine_${auctionId}_${Date.now()}_${Math.random().toString(36).slice(2,6)}${ext}`;
      const savedPath = path.join(UPLOADS_DIR, savedName);
      fs.writeFileSync(savedPath, entry.getData());

      // ラベルからsort_order
      const labelOrder = { '正面': 0, '背面': 1, '裏ラベル': 1, 'キャップ': 2, 'キャップシール': 2 };
      const sortOrder = labelOrder[labelRaw] ?? 3;

      imgStmt.run(auctionId, `/uploads/${savedName}`, labelRaw, sortOrder);
      results.saved++;
    }

    res.json({ success: true, total: entries.length, saved: results.saved, skipped: results.skipped, errors: results.errors.slice(0, 20) });
  } catch (e) {
    res.status(500).json({ error: 'ZIP処理エラー: ' + e.message });
  }
});

// ── バッチ写真登録: 最近インポートしたオークション一覧 ──
router.get('/recent-auctions', authenticateToken, requireAdmin, (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const auctions = db.prepare(`
    SELECT a.id, a.title, a.producer, a.vintage, a.image_emoji, a.image_color,
           COUNT(ai.id) as photo_count
    FROM auctions a
    LEFT JOIN auction_images ai ON ai.auction_id = a.id
    WHERE a.seller_id = ?
    GROUP BY a.id
    ORDER BY a.created_at DESC LIMIT ?
  `).all(req.user.id, limit);
  res.json({ auctions });
});

module.exports = router;
