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

/** 取り込んだ CLUB 会員の一覧（確認用）。 */
router.get('/club-members', handle(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 100, 500);
  const offset = parseInt(req.query.offset, 10) || 0;
  const params = [];
  let where = '';
  if (req.query.status) { where = 'WHERE status = ?'; params.push(req.query.status); }
  params.push(limit, offset);

  const rows = await db.prepare(`
    SELECT * FROM club_memberships ${where} ORDER BY club_member_no ASC LIMIT ? OFFSET ?
  `).all(...params);
  const total = await db.prepare(
    `SELECT COUNT(*) AS n FROM club_memberships ${where}`
  ).get(...params.slice(0, params.length - 2));

  res.json({ members: rows, total: Number(total.n) });
}));

module.exports = router;
