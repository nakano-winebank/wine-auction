const os = require('node:os');
const path = require('node:path');
const fs = require('node:fs');
const test = require('node:test');
const assert = require('node:assert');

// database.js を読み込む前に、テスト専用の SQLite ファイルへ差し替える
const TMP_DB = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'wb-import-')), 'test.db');
process.env.SQLITE_PATH = TMP_DB;
delete process.env.DATABASE_URL;

const XLSX = require('xlsx');
const db = require('../database');
const { migrate } = require('../db/membership-schema');
const members = require('../services/members');
const importer = require('../services/member-import');

/**
 * テストで使うのはすべて架空の匿名データ。
 * 実際の会員データはリポジトリに置かないこと。
 */
function buildXlsx(rows, sheetName = 'Sheet1') {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), sheetName);
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}

// 実物とは列名も列順もあえて変えてある（列名を推測しない作りであることを確かめるため）
const CLUB_HEADERS = ['会員番号', '会員ランク', '氏名', 'なまえ', '電話番号', 'メールアドレス', '入会日', '入会店舗', '退会日'];
const clubRow = (no, rank, name, kana, tel, mail, joined, store, left) =>
  [no, rank, name, kana, tel, mail, joined, store, left];

const INVEST_HEADERS = ['会員番号', '氏名', 'メールアドレス', '電話番号', '購入額ランク', '保有本数', '簿価', '入会日'];
const investRow = (no, name, mail, tel, rank, bottles, book, joined) =>
  [no, name, mail, tel, rank, bottles, book, joined];

test.before(async () => { await migrate(); });

// ───────────────────────────────── ファイルを読む・対応付ける

test('アップロードされたファイルのヘッダーとサンプル行をそのまま返す', () => {
  const buf = buildXlsx([
    CLUB_HEADERS,
    clubRow('C001', 'Gold', '匿名 一郎', 'とくめい いちろう', '090-0000-0001', 'a1@example.test', '2020/4/1', '銀座店', ''),
    clubRow('C002', 'Black', '匿名 二郎', 'とくめい じろう', '090-0000-0002', 'a2@example.test', '2021/5/2', '青山店', ''),
  ], '会員リスト');

  const { sheets } = importer.analyze(buf);
  assert.strictEqual(sheets.length, 1);
  assert.strictEqual(sheets[0].name, '会員リスト');
  assert.deepStrictEqual(sheets[0].headers, CLUB_HEADERS);
  assert.strictEqual(sheets[0].rowCount, 2);
  assert.strictEqual(sheets[0].sampleRows.length, 2);
});

test('対応付けの候補は出るが、確定はあくまで呼び出し側が行う', () => {
  const mapping = importer.suggestMapping(CLUB_HEADERS, 'club');
  assert.strictEqual(mapping.club_member_no, 0);
  assert.strictEqual(mapping.name, 2);
  assert.strictEqual(mapping.email, 5);

  // 見出しが想定と違うファイルでは、無理に当てずに null を返す
  const odd = importer.suggestMapping(['col_a', 'col_b'], 'club');
  assert.strictEqual(odd.club_member_no, null);
  assert.strictEqual(odd.name, null);
});

test('必須項目が対応付けられていないとドライランが止まる', async () => {
  const buf = buildXlsx([CLUB_HEADERS, clubRow('C900', 'Gold', '匿名', '', '', '', '', '', '')]);
  await assert.rejects(
    () => importer.dryRun(buf, { kind: 'club', mapping: { club_member_no: 0 } }),
    /必須項目の対応付けが未設定/);
});

// ───────────────────────────────── 値の正規化

test('日付・金額・本数の表記ゆれを吸収する', () => {
  assert.strictEqual(importer.toIsoDate('2020/4/1').slice(0, 10), '2020-04-01');
  assert.strictEqual(importer.toIsoDate('2020年4月1日').slice(0, 10), '2020-04-01');
  assert.strictEqual(importer.toIsoDate(''), null);
  assert.strictEqual(importer.toIsoDate('  '), null);
  assert.strictEqual(importer.toAmount('¥1,200,000'), 1200000);
  assert.strictEqual(importer.toAmount('1200000円'), 1200000);
  assert.strictEqual(importer.toInt('12本'), 12);
  assert.strictEqual(importer.toEmail('  A1@Example.TEST '), 'a1@example.test');
});

// ───────────────────────────────── CLUB会員のドライラン

test('CLUB会員のドライランは DB を変更せず、新規・更新・対象外を仕分ける', async () => {
  const buf = buildXlsx([
    CLUB_HEADERS,
    clubRow('C101', 'Standard', '匿名 一郎', 'いちろう', '090-0000-0101', 'c101@example.test', '2020/4/1', '銀座店', ''),
    clubRow('C102', 'Black',    '匿名 二郎', 'じろう',   '090-0000-0102', 'c102@example.test', '2021/5/2', '青山店', '2024/3/31'),
    clubRow('',     'Gold',     '匿名 三郎', 'さぶろう', '',              '',                  '',         '',       ''),
    clubRow('C104', 'Gold',     '',          '',         '',              'c104@example.test', '',         '',       ''),
    clubRow('C101', 'Gold',     '匿名 重複', '',         '',              '',                  '',         '',       ''),
  ]);
  const mapping = importer.suggestMapping(CLUB_HEADERS, 'club');
  const plan = await importer.dryRun(buf, { kind: 'club', mapping });

  assert.strictEqual(plan.summary.total, 5);
  assert.strictEqual(plan.summary.create, 2, 'C101 と C102 だけが取込対象');
  assert.strictEqual(plan.summary.skip, 3);
  assert.strictEqual(plan.summary.withdrawn, 1, '退会日のある行が1件');

  const reasons = plan.items.filter(i => i.action === 'skip').map(i => i.reason);
  assert.ok(reasons.some(r => r.includes('会員番号が空')));
  assert.ok(reasons.some(r => r.includes('氏名が空')));
  assert.ok(reasons.some(r => r.includes('重複')));

  // DB は変わっていない
  const n = await db.prepare('SELECT COUNT(*) AS n FROM club_memberships').get();
  assert.strictEqual(Number(n.n), 0);
});

test('メールがない会員も取り込むが、警告を出す', async () => {
  const buf = buildXlsx([
    CLUB_HEADERS,
    clubRow('C201', 'Standard', '匿名 電話のみ', '', '090-0000-0201', '', '2019/1/1', '銀座店', ''),
  ]);
  const plan = await importer.dryRun(buf, {
    kind: 'club', mapping: importer.suggestMapping(CLUB_HEADERS, 'club') });

  assert.strictEqual(plan.summary.create, 1, '電話のみの会員も取り込む');
  assert.ok(plan.items[0].warnings.some(w => w.includes('メールアドレスがありません')));
});

test('CLUB会員の取り込みを実行すると、退会済みは withdrawn で登録される', async () => {
  const rows = [
    CLUB_HEADERS,
    clubRow('C301', 'Ambassador', '匿名 四郎', 'しろう', '090-0000-0301', 'c301@example.test', '2020/4/1', '銀座店', ''),
    clubRow('C302', 'Black',      '匿名 五郎', 'ごろう', '090-0000-0302', 'c302@example.test', '2021/5/2', '青山店', '2024/3/31'),
  ];
  const buf = buildXlsx(rows);
  const mapping = importer.suggestMapping(CLUB_HEADERS, 'club');
  const plan = await importer.dryRun(buf, { kind: 'club', mapping });

  const result = await importer.execute(buf, {
    kind: 'club', mapping, digest: plan.digest, fileName: 'anon-club.xlsx' });
  assert.strictEqual(result.applied.created, 2);

  const active = await db.prepare(
    'SELECT * FROM club_memberships WHERE club_member_no = ?').get('C301');
  assert.strictEqual(active.status, 'active');
  assert.strictEqual(active.club_rank, 'Ambassador');
  assert.strictEqual(active.member_id, null, 'ワイン未購入なので会員口座は作らない');

  const left = await db.prepare(
    'SELECT * FROM club_memberships WHERE club_member_no = ?').get('C302');
  assert.strictEqual(left.status, 'withdrawn');
  assert.ok(left.withdrawn_at);

  // 会員口座は1件も増えていない
  const accounts = await db.prepare('SELECT COUNT(*) AS n FROM member_accounts').get();
  assert.strictEqual(Number(accounts.n), 0);
});

test('同じファイルをもう一度取り込むと更新になり、重複登録されない', async () => {
  const rows = [
    CLUB_HEADERS,
    clubRow('C301', 'Black', '匿名 四郎', 'しろう', '090-0000-9999', 'c301@example.test', '2020/4/1', '銀座店', ''),
  ];
  const buf = buildXlsx(rows);
  const mapping = importer.suggestMapping(CLUB_HEADERS, 'club');
  const plan = await importer.dryRun(buf, { kind: 'club', mapping });
  assert.strictEqual(plan.summary.update, 1);

  const result = await importer.execute(buf, { kind: 'club', mapping, digest: plan.digest });
  assert.strictEqual(result.applied.updated, 1);
  assert.strictEqual(result.applied.created, 0);

  const row = await db.prepare(
    'SELECT * FROM club_memberships WHERE club_member_no = ?').get('C301');
  assert.strictEqual(row.club_rank, 'Black', '更新が反映される');
  assert.strictEqual(row.phone, '090-0000-9999');

  const n = await db.prepare(
    'SELECT COUNT(*) AS n FROM club_memberships WHERE club_member_no = ?').get('C301');
  assert.strictEqual(Number(n.n), 1);
});

// ───────────────────────────────── 2段階（digest）

test('ドライランと違う内容では実行できない', async () => {
  const mapping = importer.suggestMapping(CLUB_HEADERS, 'club');
  const bufA = buildXlsx([CLUB_HEADERS,
    clubRow('C401', 'Gold', '匿名 A', '', '', 'c401@example.test', '', '', '')]);
  const bufB = buildXlsx([CLUB_HEADERS,
    clubRow('C402', 'Gold', '匿名 B', '', '', 'c402@example.test', '', '', '')]);

  const planA = await importer.dryRun(bufA, { kind: 'club', mapping });
  // A のプレビューで得た digest で B を流し込もうとする
  await assert.rejects(
    () => importer.execute(bufB, { kind: 'club', mapping, digest: planA.digest }),
    /ドライランの結果と内容が一致しません/);

  const none = await db.prepare(
    'SELECT COUNT(*) AS n FROM club_memberships WHERE club_member_no = ?').get('C402');
  assert.strictEqual(Number(none.n), 0, '弾かれた側は登録されない');
});

test('digest なしでは実行できない', async () => {
  const mapping = importer.suggestMapping(CLUB_HEADERS, 'club');
  const buf = buildXlsx([CLUB_HEADERS,
    clubRow('C501', 'Gold', '匿名 C', '', '', 'c501@example.test', '', '', '')]);
  await assert.rejects(
    () => importer.execute(buf, { kind: 'club', mapping }),
    /ドライランの結果と内容が一致しません/);
});

// ───────────────────────────────── 投資会員

test('投資会員は簿価からランクが決まり、旧・購入額ランクは参考値として残る', async () => {
  const rows = [
    INVEST_HEADERS,
    investRow('I001', '匿名 投資一郎', 'i001@example.test', '090-1000-0001', 'ゴールド',     16, 4000000, '2022/6/1'),
    investRow('I002', '匿名 投資二郎', 'i002@example.test', '090-1000-0002', 'ダイヤモンド', 20, 10000000, '2021/2/1'),
    investRow('I003', '匿名 投資三郎', 'i003@example.test', '090-1000-0003', 'ブロンズ',      2,  200000, '2023/9/1'),
  ];
  const buf = buildXlsx(rows);
  const mapping = importer.suggestMapping(INVEST_HEADERS, 'investment');
  const plan = await importer.dryRun(buf, { kind: 'investment', mapping });

  assert.strictEqual(plan.summary.create, 3);
  // 簿価から算定されるランク（購入額ランクではない）
  const byRow = Object.fromEntries(plan.items.map(i => [i.row, i]));
  assert.strictEqual(byRow[2].preview.rankCode, 'GOLD');
  assert.strictEqual(byRow[3].preview.rankCode, 'SIGNATURE');
  assert.strictEqual(byRow[4].preview.rankCode, null, '20万円はどのランクの下限にも届かない');
  assert.ok(byRow[4].warnings.some(w => w.includes('ランクは未確定')));

  const result = await importer.execute(buf, { kind: 'investment', mapping, digest: plan.digest });
  assert.strictEqual(result.applied.created, 3);

  const user = await db.prepare('SELECT id FROM users WHERE email = ?').get('i001@example.test');
  const account = await members.getAccountByUser(user.id);
  assert.strictEqual(account.rank_code, 'GOLD', '実効ランクは簿価から算定される');
  assert.strictEqual(account.legacy_rank, 'ゴールド', '旧ランクは参考値として保持される');

  const summary = await members.getPortfolioSummary(account.id);
  assert.strictEqual(summary.bookValue, 4000000);
  assert.strictEqual(summary.bottles, 16);
  assert.strictEqual(summary.unrealizedGain, 0, '移行時は時価＝簿価');
});

test('投資会員の欠損・重複は取り込まれない', async () => {
  const rows = [
    INVEST_HEADERS,
    investRow('I101', '匿名 欠損1', '',                   '', 'ゴールド', 10, 4000000, ''),
    investRow('I102', '',           'i102@example.test',  '', 'ゴールド', 10, 4000000, ''),
    investRow('I103', '匿名 欠損3', 'i103@example.test',  '', 'ゴールド',  0, 4000000, ''),
    investRow('I104', '匿名 欠損4', 'i104@example.test',  '', 'ゴールド', 10,       0, ''),
    investRow('I105', '匿名 重複A', 'dup@example.test',   '', 'ゴールド', 10, 4000000, ''),
    investRow('I106', '匿名 重複B', 'dup@example.test',   '', 'ゴールド', 10, 4000000, ''),
  ];
  const buf = buildXlsx(rows);
  const mapping = importer.suggestMapping(INVEST_HEADERS, 'investment');
  const plan = await importer.dryRun(buf, { kind: 'investment', mapping });

  assert.strictEqual(plan.summary.create, 1, '重複の1件目だけが通る');
  assert.strictEqual(plan.summary.skip, 5);

  const reasons = plan.items.filter(i => i.action === 'skip').map(i => i.reason).join(' / ');
  assert.ok(reasons.includes('メールアドレスが空または不正'));
  assert.ok(reasons.includes('氏名が空'));
  assert.ok(reasons.includes('保有本数が0以下'));
  assert.ok(reasons.includes('簿価が0以下'));
  assert.ok(reasons.includes('重複'));
});

test('簿価が本数で割り切れない場合は警告が出る', async () => {
  const buf = buildXlsx([INVEST_HEADERS,
    investRow('I201', '匿名 端数', 'i201@example.test', '', 'スタンダード', 3, 1000000, '')]);
  const plan = await importer.dryRun(buf, {
    kind: 'investment', mapping: importer.suggestMapping(INVEST_HEADERS, 'investment') });
  assert.ok(plan.items[0].warnings.some(w => w.includes('割り切れない')));
});

test('既存ユーザーと同じメールなら、新しいユーザーを作らずその口座に足す', async () => {
  const buf1 = buildXlsx([INVEST_HEADERS,
    investRow('I301', '匿名 既存', 'i301@example.test', '', 'スタンダード', 10, 1000000, '')]);
  const mapping = importer.suggestMapping(INVEST_HEADERS, 'investment');
  const plan1 = await importer.dryRun(buf1, { kind: 'investment', mapping });
  await importer.execute(buf1, { kind: 'investment', mapping, digest: plan1.digest });

  const buf2 = buildXlsx([INVEST_HEADERS,
    investRow('I301', '匿名 既存', 'i301@example.test', '', 'ゴールド', 12, 3000000, '')]);
  const plan2 = await importer.dryRun(buf2, { kind: 'investment', mapping });
  assert.strictEqual(plan2.summary.update, 1);
  assert.ok(plan2.items[0].warnings.some(w => w.includes('既に会員口座があります')));

  await importer.execute(buf2, { kind: 'investment', mapping, digest: plan2.digest });

  const users = await db.prepare(
    'SELECT COUNT(*) AS n FROM users WHERE email = ?').get('i301@example.test');
  assert.strictEqual(Number(users.n), 1, 'ユーザーは重複しない');

  const user = await db.prepare('SELECT id FROM users WHERE email = ?').get('i301@example.test');
  const account = await members.getAccountByUser(user.id);
  const summary = await members.getPortfolioSummary(account.id);
  assert.strictEqual(summary.bookValue, 4000000, '簿価が合算される');
  assert.strictEqual(account.rank_code, 'GOLD', 'ランクが上がる');
});

test('CLUB会員と投資会員は別軸で保持され、Gold の名前が衝突しない', async () => {
  const mapping = importer.suggestMapping(INVEST_HEADERS, 'investment');
  const buf = buildXlsx([INVEST_HEADERS,
    investRow('I401', '匿名 二刀流', 'both@example.test', '', 'ゴールド', 16, 4000000, '')]);
  const plan = await importer.dryRun(buf, { kind: 'investment', mapping });
  await importer.execute(buf, { kind: 'investment', mapping, digest: plan.digest });

  const clubMapping = importer.suggestMapping(CLUB_HEADERS, 'club');
  const clubBuf = buildXlsx([CLUB_HEADERS,
    clubRow('C601', 'Black', '匿名 二刀流', '', '', 'both@example.test', '2020/1/1', '銀座店', '')]);
  const clubPlan = await importer.dryRun(clubBuf, { kind: 'club', mapping: clubMapping });
  await importer.execute(clubBuf, { kind: 'club', mapping: clubMapping, digest: clubPlan.digest });

  const user = await db.prepare('SELECT id FROM users WHERE email = ?').get('both@example.test');
  const account = await members.getAccountByUser(user.id);
  const club = await db.prepare(
    'SELECT * FROM club_memberships WHERE club_member_no = ?').get('C601');

  assert.strictEqual(account.rank_code, 'GOLD', '投資ランクは簿価から算定');
  assert.strictEqual(club.club_rank, 'Black', 'CLUBランクは別に保持される');
  assert.strictEqual(club.member_id, account.id, '会員口座と紐づく');
  assert.strictEqual(club.user_id, user.id);
});

// ───────────────────────────────── 監査

test('取り込みの実行は履歴に残り、個人情報は保存されない', async () => {
  const batches = await db.prepare(
    'SELECT * FROM member_import_batches ORDER BY id DESC LIMIT 1').get();
  assert.ok(batches, '履歴が残る');
  assert.ok(['club', 'investment'].includes(batches.kind));
  assert.ok(batches.digest);

  const all = await db.prepare('SELECT detail FROM member_import_batches').all();
  for (const b of all) {
    assert.ok(!/@example\.test/.test(b.detail || ''),
      '履歴にメールアドレスなどの個人情報を残さない');
  }
});

test('取り込み上限を超えるファイルは弾かれる', async () => {
  const rows = [CLUB_HEADERS];
  for (let i = 0; i < importer.MAX_ROWS + 1; i += 1) {
    rows.push(clubRow(`X${i}`, 'Standard', `匿名 ${i}`, '', '', '', '', '', ''));
  }
  await assert.rejects(
    () => importer.dryRun(buildXlsx(rows), {
      kind: 'club', mapping: importer.suggestMapping(CLUB_HEADERS, 'club') }),
    /一度に取り込めるのは/);
});
