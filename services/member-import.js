/**
 * 既存会員データの一括インポート（CLUB会員 / 投資会員）
 *
 * 設計の要点:
 *
 * 1. **列名を推測しない。** アップロードされたファイルのヘッダー行をそのまま読み出し、
 *    管理者が「どの列がどの項目か」を画面上で対応付けてから取り込む。
 *    候補は提示するが、確認なしに適用することはない（analyze → mapping → dryRun → execute）。
 *
 * 2. **2段階。** dryRun が取込結果のプレビューと digest（内容のハッシュ）を返し、
 *    execute は同じ digest が送られてきたときだけ実行する。プレビューで見たものと
 *    違うデータがうっかり本番投入されることがない。
 *
 * 3. **CLUB のランクと投資ランクは別軸。** CLUB（Standard / Ambassador / Gold / Black）は
 *    club_memberships に持ち、簿価から算定される投資ランク（member_ranks）とは混ぜない。
 *    どちらにも Gold があるため、同じ列に入れると区別がつかなくなる。
 *
 * 4. **ワイン未購入の CLUB 会員には会員口座を作らない。** 保有ゼロ・ランク未確定の
 *    空口座が大量に並ぶのを避ける。投資実績ができた時点で紐づける。
 *
 * ⚠️ 取り込む実データは個人情報を含む。リポジトリにコミットしないこと。
 *    テストとテンプレートは架空の匿名データだけを使っている。
 */
const crypto = require('crypto');
const XLSX = require('xlsx');
const db = require('../database');
const { insertReturningId, nowIso } = require('../db/helpers');
const members = require('./members');

/** 一度に取り込める上限。CLUB会員が約994名なので、余裕を見て 5000。 */
const MAX_ROWS = 5000;

// ───────────────────────────────── 取込対象の項目定義

/**
 * 取り込む項目。label は画面の対応付けUIに出す表示名、
 * hints は「候補」を出すためのゆるい手がかり（一致しなくても構わない）。
 */
const FIELDS = {
  club: [
    { key: 'club_member_no', label: '会員番号',       required: true,  hints: ['会員番号', '会員No', 'ID', 'no'] },
    { key: 'club_rank',      label: '会員ランク',     required: false, hints: ['ランク', '会員ランク', 'rank', '区分'] },
    { key: 'name',           label: '氏名',           required: true,  hints: ['氏名', '名前', 'お名前', 'name'] },
    { key: 'name_kana',      label: 'なまえ（かな）', required: false, hints: ['なまえ', 'カナ', 'かな', 'フリガナ', 'ふりがな', 'kana'] },
    { key: 'phone',          label: '電話番号',       required: false, hints: ['電話', 'TEL', 'tel', 'phone', '携帯'] },
    { key: 'email',          label: 'メールアドレス', required: false, hints: ['メール', 'mail', 'email', 'アドレス'] },
    { key: 'joined_at',      label: '入会日',         required: false, hints: ['入会日', '入会', '登録日', 'join'] },
    { key: 'joined_store',   label: '入会店舗',       required: false, hints: ['店舗', '入会店舗', '店', 'store'] },
    { key: 'withdrawn_at',   label: '退会日',         required: false, hints: ['退会日', '退会', 'withdraw'] },
  ],
  investment: [
    { key: 'member_no',   label: '会員番号',       required: false, hints: ['会員番号', '会員No', 'ID', 'no'] },
    { key: 'name',        label: '氏名',           required: true,  hints: ['氏名', '名前', 'お名前', 'name'] },
    { key: 'email',       label: 'メールアドレス', required: true,  hints: ['メール', 'mail', 'email', 'アドレス'] },
    { key: 'phone',       label: '電話番号',       required: false, hints: ['電話', 'TEL', 'tel', 'phone'] },
    { key: 'legacy_rank', label: '購入額ランク',   required: false, hints: ['ランク', '購入額', 'rank', '区分'] },
    { key: 'bottles',     label: '保有本数',       required: true,  hints: ['本数', '保有本数', '数量', 'bottles'] },
    { key: 'book_value',  label: '簿価',           required: true,  hints: ['簿価', '取得', '購入額', '金額', 'value'] },
    { key: 'joined_at',   label: '入会日',         required: false, hints: ['入会日', '入会', '登録日'] },
  ],
};

const KINDS = Object.keys(FIELDS);

/**
 * 移行前の購入額ランク。実効ランクは簿価から算定するので、ここは表記ゆれを
 * 揃えて legacy_rank に保存するためだけに使う（判定には使わない）。
 */
const LEGACY_RANK_LABELS = {
  'ブロンズ': 'ブロンズ', 'bronze': 'ブロンズ',
  'シルバー': 'シルバー', 'silver': 'シルバー',
  'スタンダード': 'スタンダード', 'standard': 'スタンダード',
  'ゴールド': 'ゴールド', 'gold': 'ゴールド',
  'プラチナ': 'プラチナ', 'platinum': 'プラチナ',
  'ダイヤモンド': 'ダイヤモンド', 'diamond': 'ダイヤモンド',
};

/** CLUB のランク表記。未知の値は弾かずそのまま残し、警告だけ出す。 */
const CLUB_RANK_LABELS = {
  'standard': 'Standard', 'スタンダード': 'Standard',
  'ambassador': 'Ambassador', 'アンバサダー': 'Ambassador',
  'gold': 'Gold', 'ゴールド': 'Gold',
  'black': 'Black', 'ブラック': 'Black',
};

// ───────────────────────────────── 値の正規化

function cleanCell(v) {
  if (v === null || v === undefined) return '';
  if (v instanceof Date) return v;
  return String(v).replace(/^﻿/, '').trim();
}

/** Excel のシリアル値・文字列・Date のいずれでも ISO 日付にする。空なら null。 */
function toIsoDate(v) {
  const raw = cleanCell(v);
  if (raw === '') return null;
  if (raw instanceof Date) return Number.isNaN(raw.getTime()) ? null : raw.toISOString();

  // Excel のシリアル値（1900年起算）
  if (/^\d+(\.\d+)?$/.test(raw)) {
    const serial = Number(raw);
    if (serial > 20000 && serial < 80000) {
      const d = new Date(Date.UTC(1899, 11, 30) + serial * 86400000);
      return Number.isNaN(d.getTime()) ? null : d.toISOString();
    }
  }
  const normalized = raw.replace(/[年月]/g, '/').replace(/日/g, '').replace(/\./g, '/');
  const d = new Date(normalized);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/** 「¥1,200,000」「1200000円」などを整数にする。数値にならなければ null。 */
function toAmount(v) {
  const raw = cleanCell(v);
  if (raw === '') return null;
  const n = Number(String(raw).replace(/[¥,，\s円]/g, ''));
  return Number.isFinite(n) ? Math.round(n) : null;
}

function toInt(v) {
  const raw = cleanCell(v);
  if (raw === '') return null;
  const n = Number(String(raw).replace(/[,，\s本]/g, ''));
  return Number.isFinite(n) ? Math.round(n) : null;
}

function toEmail(v) {
  const raw = String(cleanCell(v)).toLowerCase();
  return raw === '' ? null : raw;
}

function looksLikeEmail(v) {
  return typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function toText(v) {
  const raw = cleanCell(v);
  if (raw instanceof Date) return raw.toISOString();
  return raw === '' ? null : raw;
}

// ───────────────────────────────── ① ファイルを読む

/**
 * アップロードされたファイルの中身を、加工せずそのまま見せる。
 * ここで列名を決めつけないのが肝で、実物のヘッダーを管理者に確認してもらう。
 */
function analyze(buffer, { sampleSize = 5 } = {}) {
  const wb = XLSX.read(buffer, { type: 'buffer', codepage: 65001, cellDates: true });
  const sheets = wb.SheetNames.map(name => {
    const raw = XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, defval: '', blankrows: false });
    const headers = (raw[0] || []).map(h => String(cleanCell(h)));
    const body = raw.slice(1).filter(r => r.some(c => cleanCell(c) !== ''));
    return {
      name,
      headers,
      rowCount: body.length,
      // プレビューは管理者だけが見る。ログには出さない。
      sampleRows: body.slice(0, sampleSize).map(r =>
        headers.map((_, i) => String(cleanCell(r[i] ?? '')).slice(0, 60))),
    };
  });
  return { sheets };
}

// ───────────────────────────────── 列構成レポート（個人情報を含まない）

/**
 * 実ファイルから「列の構成」だけを取り出す。
 *
 * 取り込みの設計に必要なのは列名と値の形であって、中身そのものではない。
 * このレポートは実データを持ち出さずに構成を共有するためのもので、
 * 個人情報が出ないよう次の制限をかけている。
 *
 *   - 値をそのまま載せるのは「低カーディナリティかつ各値が3件以上ある」列だけ
 *     （ランクや店舗のような区分値。氏名やメールは値の種類が多いので自動的に外れる）
 *   - メール・電話・氏名らしき列は、種類数に関わらず値を出さない
 *   - 日付は書式（YYYY/M/D など）のみ、数値は桁数の範囲のみ
 */

/** 値の見た目から型を推定する。 */
function inferType(values) {
  const nonEmpty = values.filter(v => v !== '');
  if (!nonEmpty.length) return 'empty';
  const hit = (fn) => nonEmpty.filter(fn).length / nonEmpty.length;

  if (hit(v => looksLikeEmail(String(v).toLowerCase())) > 0.7) return 'email';
  if (hit(v => /^[\d\-+()\s]{9,}$/.test(String(v))) > 0.7) return 'phone';
  if (hit(v => v instanceof Date || toIsoDate(v) !== null) > 0.7) {
    // 数値だけの列を日付と誤認しないよう、桁数で除外する
    if (hit(v => /^\d{1,6}$/.test(String(v).trim())) > 0.7) return 'number';
    return 'date';
  }
  if (hit(v => /^[¥￥]?[\d,，\s]+[円]?$/.test(String(v).trim())) > 0.7) return 'number';
  return 'text';
}

/** 値を出してよい列か。区分値だけを通す。 */
function safeToShowValues(type, counts) {
  if (type !== 'text' && type !== 'number') return false;
  const distinct = counts.size;
  if (distinct === 0 || distinct > 20) return false;
  // どの値も3件以上あることを条件にして、個人を特定し得る値が出ないようにする
  for (const n of counts.values()) if (n < 3) return false;
  return true;
}

/** 日付の書式を、値を出さずに表す。 */
function dateShape(sample) {
  const raw = String(sample).trim();
  if (/^\d+(\.\d+)?$/.test(raw)) return 'Excelのシリアル値';
  return raw
    .replace(/\d{4}/, 'YYYY')
    .replace(/\d{1,2}/, 'M')
    .replace(/\d{1,2}/, 'D');
}

/**
 * @param {Buffer} buffer  アップロードされたファイル
 * @param {string} kind    club / investment（対応付けの候補を併せて出すため）
 */
function schemaReport(buffer, { kind, sheetName } = {}) {
  const wb = XLSX.read(buffer, { type: 'buffer', codepage: 65001, cellDates: true });
  const name = sheetName || wb.SheetNames[0];
  const ws = wb.Sheets[name];
  if (!ws) throw new Error(`シートが見つかりません: ${name}`);

  const raw = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '', blankrows: false });
  const headers = (raw[0] || []).map(h => String(cleanCell(h)));
  const body = raw.slice(1).filter(r => r.some(c => cleanCell(c) !== ''));

  const columns = headers.map((header, i) => {
    const values = body.map(r => cleanCell(r[i] ?? ''));
    const nonEmpty = values.filter(v => v !== '');
    const type = inferType(values);

    const counts = new Map();
    for (const v of nonEmpty) {
      const key = String(v);
      counts.set(key, (counts.get(key) || 0) + 1);
    }

    const col = {
      index: i,
      header,
      type,
      rows: values.length,
      filled: nonEmpty.length,
      empty: values.length - nonEmpty.length,
      distinctCount: counts.size,
    };

    if (type === 'date' && nonEmpty.length) {
      col.shape = dateShape(nonEmpty[0]);
    } else if (type === 'number' && nonEmpty.length) {
      const digits = nonEmpty.map(v => String(v).replace(/[^\d]/g, '').length).filter(n => n > 0);
      col.shape = digits.length ? `${Math.min(...digits)}〜${Math.max(...digits)}桁` : null;
    } else if (type === 'text' && nonEmpty.length) {
      const lens = nonEmpty.map(v => String(v).length);
      col.shape = `${Math.min(...lens)}〜${Math.max(...lens)}文字`;
    }

    if (safeToShowValues(type, counts)) {
      col.values = [...counts.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([value, count]) => ({ value, count }));
    }
    return col;
  });

  return {
    sheetName: name,
    sheetNames: wb.SheetNames,
    rowCount: body.length,
    columnCount: headers.length,
    columns,
    suggestedMapping: kind ? suggestMapping(headers, kind) : null,
    fields: kind ? FIELDS[kind] : null,
  };
}

/** レポートを、そのまま貼り付けられるテキストにする。 */
function schemaReportText(report, kind) {
  const typeLabel = {
    email: 'メール', phone: '電話番号', date: '日付', number: '数値', text: 'テキスト', empty: '（空）',
  };
  const lines = [];
  lines.push(`シート: ${report.sheetName}（全 ${report.sheetNames.length} シート）`);
  lines.push(`${report.rowCount} 行 × ${report.columnCount} 列`);
  lines.push('');
  lines.push('列名\t型\t入力あり\t空欄\t値の種類\t形/値');

  for (const c of report.columns) {
    const detail = c.values
      ? c.values.map(v => `${v.value}(${v.count})`).join(' / ')
      : (c.shape || '');
    lines.push([
      c.header || `(列${c.index + 1})`,
      typeLabel[c.type] || c.type,
      c.filled, c.empty, c.distinctCount, detail,
    ].join('\t'));
  }

  if (report.fields) {
    lines.push('');
    lines.push('■ 取込項目への対応付け（自動判定）');
    for (const f of report.fields) {
      const idx = report.suggestedMapping[f.key];
      const col = idx === null || idx === undefined ? '（見つからず）' : report.columns[idx].header;
      lines.push(`${f.label}${f.required ? '（必須）' : ''}\t→\t${col}`);
    }
  }
  lines.push('');
  lines.push('※ このレポートには個人を特定し得る値を含めていません。');
  return lines.join('\n');
}

/**
 * ヘッダー名から対応付けの「候補」を出す。あくまで候補で、
 * 管理者が画面で確認・修正してから使う。確信が持てない列は null のままにする。
 */
function suggestMapping(headers, kind) {
  const fields = FIELDS[kind];
  if (!fields) throw new Error(`不明な取込種別です: ${kind}`);

  const used = new Set();
  const mapping = {};
  for (const field of fields) {
    let hit = null;
    for (let i = 0; i < headers.length; i += 1) {
      if (used.has(i)) continue;
      const h = String(headers[i]).toLowerCase().replace(/\s/g, '');
      if (!h) continue;
      if (field.hints.some(hint => h.includes(String(hint).toLowerCase()))) { hit = i; break; }
    }
    if (hit !== null) used.add(hit);
    mapping[field.key] = hit;
  }
  return mapping;
}

// ───────────────────────────────── ② 行を正規化する

function extractRows(buffer, sheetName) {
  const wb = XLSX.read(buffer, { type: 'buffer', codepage: 65001, cellDates: true });
  const ws = wb.Sheets[sheetName || wb.SheetNames[0]];
  if (!ws) throw new Error(`シートが見つかりません: ${sheetName}`);
  const raw = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '', blankrows: false });
  if (raw.length < 2) throw new Error('データ行がありません');
  return { headers: (raw[0] || []).map(h => String(cleanCell(h))), body: raw.slice(1) };
}

/** 対応付けに従って行をオブジェクトにする。行番号は Excel の見た目に合わせて +2。 */
function buildRecords(body, mapping, kind) {
  const fields = FIELDS[kind];
  return body
    .filter(r => r.some(c => cleanCell(c) !== ''))
    .map((row, i) => {
      const rec = { _row: i + 2 };
      for (const field of fields) {
        const idx = mapping[field.key];
        rec[field.key] = idx === null || idx === undefined ? '' : (row[idx] ?? '');
      }
      return rec;
    });
}

function validateMapping(mapping, kind) {
  const missing = FIELDS[kind]
    .filter(f => f.required && (mapping[f.key] === null || mapping[f.key] === undefined))
    .map(f => f.label);
  if (missing.length) {
    throw new Error(`必須項目の対応付けが未設定です: ${missing.join(' / ')}`);
  }
}

// ───────────────────────────────── ③ ドライラン（取込結果のプレビュー）

/**
 * 欠損・重複・退会済みの扱いはここで一箇所に集約している。
 *
 * CLUB会員:
 *   - 会員番号なし / 氏名なし         → 取り込まない（エラー）
 *   - ファイル内で会員番号が重複      → 2件目以降は取り込まない（エラー）
 *   - 既に同じ会員番号がある          → 更新
 *   - 退会日あり                      → status='withdrawn' で取り込む（会員口座は作らない）
 *   - メール欠損                      → 取り込む（電話のみの会員がいるため）。ユーザー紐づけはしない
 *   - メールがファイル内で重複        → 取り込むが警告。自動のユーザー紐づけはしない（誤紐づけ防止）
 *
 * 投資会員:
 *   - 氏名 / メール / 本数 / 簿価が欠損 → 取り込まない（エラー）
 *   - メールがファイル内で重複          → 2件目以降は取り込まない（エラー）
 *   - 既存ユーザーとメール一致          → そのユーザーに会員口座を作る／既存口座を更新
 *   - 実効ランクは簿価から自動算定。購入額ランクは legacy_rank に参考値として残す
 */
async function planClub(records) {
  const seenNo = new Map();
  const emailCount = new Map();
  for (const r of records) {
    const email = toEmail(r.email);
    if (email) emailCount.set(email, (emailCount.get(email) || 0) + 1);
  }

  const items = [];
  for (const r of records) {
    const no = toText(r.club_member_no);
    const name = toText(r.name);
    const email = toEmail(r.email);
    const withdrawnAt = toIsoDate(r.withdrawn_at);
    const warnings = [];

    if (!no) { items.push({ row: r._row, action: 'skip', reason: '会員番号が空です' }); continue; }
    if (!name) { items.push({ row: r._row, action: 'skip', reason: '氏名が空です', key: no }); continue; }
    if (seenNo.has(no)) {
      items.push({ row: r._row, action: 'skip', key: no,
        reason: `会員番号が${seenNo.get(no)}行目と重複しています` });
      continue;
    }
    seenNo.set(no, r._row);

    if (email && !looksLikeEmail(email)) warnings.push('メールアドレスの形式が不正です');
    if (!email) warnings.push('メールアドレスがありません（通知メールは届きません）');
    else if (emailCount.get(email) > 1) warnings.push('同じメールアドレスが複数行にあります');

    const rawRank = String(toText(r.club_rank) || '').toLowerCase();
    const clubRank = CLUB_RANK_LABELS[rawRank] || toText(r.club_rank);
    if (clubRank && !Object.values(CLUB_RANK_LABELS).includes(clubRank)) {
      warnings.push(`未知の会員ランクです: ${clubRank}`);
    }

    const existing = await db.prepare(
      'SELECT id FROM club_memberships WHERE club_member_no = ?').get(no);

    items.push({
      row: r._row,
      action: existing ? 'update' : 'create',
      key: no,
      warnings,
      withdrawn: !!withdrawnAt,
      values: {
        club_member_no: no,
        club_rank: clubRank,
        name,
        name_kana: toText(r.name_kana),
        phone: toText(r.phone),
        email: email && looksLikeEmail(email) ? email : null,
        joined_at: toIsoDate(r.joined_at),
        joined_store: toText(r.joined_store),
        withdrawn_at: withdrawnAt,
        status: withdrawnAt ? 'withdrawn' : 'active',
      },
    });
  }
  return items;
}

async function planInvestment(records) {
  const seenEmail = new Map();
  const items = [];

  for (const r of records) {
    const name = toText(r.name);
    const email = toEmail(r.email);
    const bottles = toInt(r.bottles);
    const bookValue = toAmount(r.book_value);
    const warnings = [];

    if (!name) { items.push({ row: r._row, action: 'skip', reason: '氏名が空です' }); continue; }
    if (!email || !looksLikeEmail(email)) {
      items.push({ row: r._row, action: 'skip', key: name,
        reason: 'メールアドレスが空または不正です（会員口座の作成に必要）' });
      continue;
    }
    if (seenEmail.has(email)) {
      items.push({ row: r._row, action: 'skip', key: email,
        reason: `メールアドレスが${seenEmail.get(email)}行目と重複しています` });
      continue;
    }
    seenEmail.set(email, r._row);

    if (!bottles || bottles <= 0) {
      items.push({ row: r._row, action: 'skip', key: email, reason: '保有本数が0以下または空です' });
      continue;
    }
    if (!bookValue || bookValue <= 0) {
      items.push({ row: r._row, action: 'skip', key: email, reason: '簿価が0以下または空です' });
      continue;
    }
    if (bookValue % bottles !== 0) {
      warnings.push('簿価が本数で割り切れないため、取得単価は円未満を四捨五入します');
    }

    const rawLegacy = String(toText(r.legacy_rank) || '').toLowerCase();
    const legacyRank = LEGACY_RANK_LABELS[rawLegacy] || toText(r.legacy_rank);
    if (legacyRank && !Object.values(LEGACY_RANK_LABELS).includes(legacyRank)) {
      warnings.push(`未知の購入額ランクです: ${legacyRank}`);
    }

    const user = await db.prepare('SELECT id FROM users WHERE LOWER(email) = ?').get(email);
    const account = user
      ? await db.prepare('SELECT id FROM member_accounts WHERE user_id = ?').get(user.id)
      : null;
    if (account) warnings.push('既に会員口座があります。保有ワインを追加する形で取り込みます');

    // 実効ランクは簿価から算定する。購入額ランクは判定に使わない。
    const rank = await members.rankForBookValue(bookValue);
    if (!rank) warnings.push('簿価がどのランクの下限にも届かないため、ランクは未確定になります');

    items.push({
      row: r._row,
      action: account ? 'update' : 'create',
      key: email,
      warnings,
      values: {
        name, email, phone: toText(r.phone),
        bottles, bookValue,
        unitPrice: Math.round(bookValue / bottles),
        legacyRank,
        joinedAt: toIsoDate(r.joined_at),
      },
      preview: {
        existingUser: !!user,
        rankCode: rank ? rank.code : null,
        legacyRank,
      },
    });
  }
  return items;
}

/** 内容のハッシュ。ドライランで見たものと同じデータかを execute 側で確かめるために使う。 */
function digestOf(kind, items) {
  const payload = JSON.stringify({ kind, items: items.map(i => [i.row, i.action, i.key, i.values]) });
  return crypto.createHash('sha256').update(payload).digest('hex').slice(0, 32);
}

function summarize(items) {
  return {
    total: items.length,
    create: items.filter(i => i.action === 'create').length,
    update: items.filter(i => i.action === 'update').length,
    skip: items.filter(i => i.action === 'skip').length,
    warnings: items.filter(i => (i.warnings || []).length > 0).length,
    withdrawn: items.filter(i => i.withdrawn).length,
  };
}

/** ドライラン。DB は一切変更しない。 */
async function dryRun(buffer, { kind, sheetName, mapping }) {
  if (!KINDS.includes(kind)) throw new Error(`不明な取込種別です: ${kind}`);
  validateMapping(mapping, kind);

  const { body } = extractRows(buffer, sheetName);
  const records = buildRecords(body, mapping, kind);
  if (records.length === 0) throw new Error('取り込む行がありません');
  if (records.length > MAX_ROWS) {
    throw new Error(`一度に取り込めるのは${MAX_ROWS}件までです（${records.length}件）`);
  }

  const items = kind === 'club' ? await planClub(records) : await planInvestment(records);
  return { kind, summary: summarize(items), items, digest: digestOf(kind, items) };
}

// ───────────────────────────────── ④ 実行

async function applyClub(items, source) {
  let created = 0, updated = 0;
  for (const item of items) {
    if (item.action === 'skip') continue;
    const v = item.values;
    const now = nowIso();

    const existing = await db.prepare(
      'SELECT id FROM club_memberships WHERE club_member_no = ?').get(v.club_member_no);

    if (existing) {
      await db.prepare(`
        UPDATE club_memberships
        SET club_rank = ?, name = ?, name_kana = ?, phone = ?, email = ?,
            joined_at = ?, joined_store = ?, withdrawn_at = ?, status = ?,
            source = ?, updated_at = ?
        WHERE id = ?
      `).run(v.club_rank, v.name, v.name_kana, v.phone, v.email,
             v.joined_at, v.joined_store, v.withdrawn_at, v.status,
             source, now, existing.id);
      updated += 1;
    } else {
      await insertReturningId(`
        INSERT INTO club_memberships
          (club_member_no, user_id, member_id, club_rank, name, name_kana, phone, email,
           joined_at, joined_store, withdrawn_at, status, source, created_at, updated_at)
        VALUES (?, NULL, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [v.club_member_no, v.club_rank, v.name, v.name_kana, v.phone, v.email,
          v.joined_at, v.joined_store, v.withdrawn_at, v.status, source, now, now]);
      created += 1;
    }

    // 既にログインユーザー・会員口座がある場合だけ紐づける。
    // ワイン未購入の CLUB 会員に会員口座は作らない。
    if (v.email) {
      const user = await db.prepare('SELECT id FROM users WHERE LOWER(email) = ?').get(v.email);
      if (user) {
        const account = await db.prepare(
          'SELECT id FROM member_accounts WHERE user_id = ?').get(user.id);
        await db.prepare(
          'UPDATE club_memberships SET user_id = ?, member_id = ? WHERE club_member_no = ?'
        ).run(user.id, account ? account.id : null, v.club_member_no);
      }
    }
  }
  return { created, updated };
}

async function applyInvestment(items, source) {
  let created = 0, updated = 0;
  for (const item of items) {
    if (item.action === 'skip') continue;
    const v = item.values;

    let user = await db.prepare('SELECT id FROM users WHERE LOWER(email) = ?').get(v.email);
    if (!user) {
      // ログインできない状態で作る。パスワードは本人がリセットして設定する想定。
      const userId = await insertReturningId(`
        INSERT INTO users (username, email, password_hash, display_name, full_name, phone)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [v.email, v.email, '!migrated', v.name, v.name, v.phone]);
      user = { id: userId };
    }

    const before = await members.getAccountByUser(user.id);
    const account = await members.createAccount(user.id, { joinedAt: v.joinedAt });

    await members.addHolding(account.id, {
      wineName: '移行時点の保有（明細未分割）',
      quantity: v.bottles,
      acquiredUnitPrice: v.unitPrice,
      acquiredAt: v.joinedAt || nowIso(),
      purchaseChannel: 'transfer',
      unitMarketPrice: v.unitPrice,   // 移行時は時価＝簿価から始める
      valuationSource: 'migration',
      note: source,
    });

    if (v.legacyRank) {
      await db.prepare('UPDATE member_accounts SET legacy_rank = ?, updated_at = ? WHERE id = ?')
        .run(v.legacyRank, nowIso(), account.id);
    }

    // CLUB 側に同じメールの行があれば紐づける
    await db.prepare(
      'UPDATE club_memberships SET user_id = ?, member_id = ? WHERE LOWER(email) = ?'
    ).run(user.id, account.id, v.email);

    if (before) updated += 1; else created += 1;
  }
  return { created, updated };
}

/**
 * 実行。ドライランで得た digest と一致しないと実行しない。
 * 「プレビューで見たものと違うデータが入る」事故をここで止める。
 */
async function execute(buffer, { kind, sheetName, mapping, digest, executedBy, fileName }) {
  const plan = await dryRun(buffer, { kind, sheetName, mapping });
  if (!digest || digest !== plan.digest) {
    throw new Error('ドライランの結果と内容が一致しません。もう一度プレビューからやり直してください');
  }

  const source = `import:${kind}:${new Date().toISOString().slice(0, 10)}`;
  const applied = kind === 'club'
    ? await applyClub(plan.items, source)
    : await applyInvestment(plan.items, source);

  const batchId = await insertReturningId(`
    INSERT INTO member_import_batches
      (kind, executed_by, file_name, digest, total_rows, created_count, updated_count,
       skipped_count, detail, executed_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [kind, executedBy || null, fileName || null, plan.digest, plan.summary.total,
      applied.created, applied.updated, plan.summary.skip,
      // 個人情報は残さず、件数と行番号だけを監査用に持つ
      JSON.stringify({ skippedRows: plan.items.filter(i => i.action === 'skip').map(i => i.row) }),
      nowIso(), nowIso()]);

  return { batchId, kind, digest: plan.digest, summary: plan.summary, applied };
}

module.exports = {
  FIELDS, KINDS, MAX_ROWS,
  CLUB_RANK_LABELS, LEGACY_RANK_LABELS,
  analyze, suggestMapping, extractRows, buildRecords, validateMapping,
  schemaReport, schemaReportText, inferType,
  dryRun, execute, digestOf,
  toIsoDate, toAmount, toInt, toEmail,
};
