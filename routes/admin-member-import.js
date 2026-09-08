/**
 * 管理者向け 会員データ一括インポート API（/api/admin/member-import）
 *
 * analyze（ファイルの中身を見る）→ mapping（列の対応付けを確認）→ dry-run（プレビュー）
 * → execute（実行）の4段階。いきなり本番投入はできない作りにしてある。
 *
 * ⚠️ 扱うのは個人情報。取り込んだ実データはリポジトリにコミットしないこと。
 */
const express = require('express');
const router = express.Router();
const multer = require('multer');
const db = require('../database');
const { authenticateToken } = require('../middleware/auth');
const importer = require('../services/member-import');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

async function requireAdmin(req, res, next) {
  const user = await db.prepare('SELECT is_admin FROM users WHERE id = ?').get(req.user.id);
  if (!user || !user.is_admin) return res.status(403).json({ error: '管理者権限が必要です' });
  next();
}

router.use(authenticateToken, requireAdmin);

const handle = (fn) => async (req, res) => {
  try {
    await fn(req, res);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

/** 取り込める項目の定義。画面が対応付けUIを組み立てるのに使う。 */
router.get('/fields', handle(async (req, res) => {
  res.json({ kinds: importer.KINDS, fields: importer.FIELDS, maxRows: importer.MAX_ROWS });
}));

/**
 * ① ファイルの中身を見る。
 * ここでは列名を決めつけず、実際のヘッダーとサンプル行をそのまま返す。
 * mapping は「候補」であって、画面で管理者が確認・修正してから使う。
 */
router.post('/analyze', upload.single('file'), handle(async (req, res) => {
  if (!req.file) throw new Error('ファイルを選択してください');
  const kind = req.body.kind;
  if (!importer.KINDS.includes(kind)) throw new Error('取込種別を指定してください');

  const { sheets } = importer.analyze(req.file.buffer);
  res.json({
    kind,
    fileName: req.file.originalname,
    sheets: sheets.map(s => ({
      ...s,
      suggestedMapping: importer.suggestMapping(s.headers, kind),
    })),
  });
}));

/**
 * 列構成レポート。実データを持ち出さずに、列の構成だけを共有するために使う。
 *
 * 個人を特定し得る値は含めない（値をそのまま出すのは、ランクや店舗のような
 * 区分値だけ。氏名やメールは値の種類が多いため自動的に除外される）。
 */
router.post('/schema-report', upload.single('file'), handle(async (req, res) => {
  if (!req.file) throw new Error('ファイルを選択してください');
  const report = importer.schemaReport(req.file.buffer, {
    kind: req.body.kind || null,
    sheetName: req.body.sheetName || null,
  });
  res.json({ report, text: importer.schemaReportText(report, req.body.kind) });
}));

/** ② ドライラン。DB は変更せず、取り込み結果のプレビューと digest を返す。 */
router.post('/dry-run', upload.single('file'), handle(async (req, res) => {
  if (!req.file) throw new Error('ファイルを選択してください');
  const { kind, sheetName } = req.body;
  const mapping = JSON.parse(req.body.mapping || '{}');
  const result = await importer.dryRun(req.file.buffer, { kind, sheetName, mapping });
  res.json(result);
}));

/** ③ 実行。ドライランで得た digest が一致しないと実行しない。 */
router.post('/execute', upload.single('file'), handle(async (req, res) => {
  if (!req.file) throw new Error('ファイルを選択してください');
  const { kind, sheetName, digest } = req.body;
  const mapping = JSON.parse(req.body.mapping || '{}');
  const result = await importer.execute(req.file.buffer, {
    kind, sheetName, mapping, digest,
    executedBy: req.user.id,
    fileName: req.file.originalname,
  });
  res.json(result);
}));

/** 過去の取り込み履歴。 */
router.get('/batches', handle(async (req, res) => {
  const rows = await db.prepare(`
    SELECT b.*, u.display_name AS executed_by_name
    FROM member_import_batches b
    LEFT JOIN users u ON b.executed_by = u.id
    ORDER BY b.executed_at DESC, b.id DESC
    LIMIT 50
  `).all();
  res.json({ batches: rows });
}));

/**
 * 絞り込み条件を組み立てる。件数取得と一覧取得で同じ条件を使い回すため、
 * WHERE 句とパラメータを別々に返す（LIMIT / OFFSET は呼び出し側で足す）。
 */
function clubFilter(query) {
  const clauses = [];
  const params = [];
  if (query.status) { clauses.push('status = ?'); params.push(query.status); }
  if (query.rank)   { clauses.push('club_rank = ?'); params.push(query.rank); }
  if (query.linked === '1')  clauses.push('member_id IS NOT NULL');
  if (query.linked === '0')  clauses.push('member_id IS NULL');

  const q = (query.q || '').trim();
  if (q) {
    // 会員番号・氏名・なまえ・メール・電話を横断で探す
    clauses.push('(club_member_no LIKE ? OR name LIKE ? OR name_kana LIKE ? OR email LIKE ? OR phone LIKE ?)');
    const like = `%${q}%`;
    params.push(like, like, like, like, like);
  }
  return { where: clauses.length ? 'WHERE ' + clauses.join(' AND ') : '', params };
}

/** 取り込んだ CLUB 会員の一覧。 */
router.get('/club-members', handle(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 100, 500);
  const offset = parseInt(req.query.offset, 10) || 0;
  const { where, params } = clubFilter(req.query);

  const rows = await db.prepare(`
    SELECT * FROM club_memberships ${where}
    ORDER BY club_member_no ASC LIMIT ? OFFSET ?
  `).all(...params, limit, offset);

  const total = await db.prepare(
    `SELECT COUNT(*) AS n FROM club_memberships ${where}`).get(...params);

  res.json({ members: rows, total: Number(total.n), limit, offset });
}));

/** CLUB会員の内訳。取り込み結果をひと目で確かめるために使う。 */
router.get('/club-members/summary', handle(async (req, res) => {
  const byStatus = await db.prepare(
    'SELECT status, COUNT(*) AS n FROM club_memberships GROUP BY status').all();
  const byRank = await db.prepare(`
    SELECT club_rank, COUNT(*) AS n FROM club_memberships
    WHERE status = 'active' GROUP BY club_rank ORDER BY n DESC`).all();
  const linked = await db.prepare(
    'SELECT COUNT(*) AS n FROM club_memberships WHERE member_id IS NOT NULL').get();
  const noEmail = await db.prepare(
    `SELECT COUNT(*) AS n FROM club_memberships WHERE email IS NULL OR email = ''`).get();
  const total = await db.prepare('SELECT COUNT(*) AS n FROM club_memberships').get();

  res.json({
    total: Number(total.n),
    linked: Number(linked.n),        // 投資側の会員口座と紐づいている数
    noEmail: Number(noEmail.n),      // 通知メールが届かない数
    byStatus: byStatus.map(r => ({ status: r.status, count: Number(r.n) })),
    byRank: byRank.map(r => ({ rank: r.club_rank || '(未設定)', count: Number(r.n) })),
  });
}));

module.exports = router;
