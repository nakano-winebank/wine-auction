/**
 * 会員管理（ワイン購入後）スキーマ
 *
 * PostgreSQL / SQLite の両モードで同じ定義から DDL を生成する。
 * database.js の既存スキーマとは独立して、起動時に冪等に適用される。
 */
const db = require('../database');

// 型のマッピング。左が論理型、右が [PostgreSQL, SQLite]。
const TYPES = {
  id:      ['SERIAL PRIMARY KEY', 'INTEGER PRIMARY KEY AUTOINCREMENT'],
  int:     ['INT', 'INTEGER'],
  bigint:  ['BIGINT', 'INTEGER'],
  num:     ['DOUBLE PRECISION', 'REAL'],
  text:    ['TEXT', 'TEXT'],
  ts:      ['TIMESTAMP', 'TEXT'],
};

function col(name, type, extra = '') {
  return { name, type, extra };
}

// 会員ランク master。料率はここを直せばコード変更なしで変わる。
const TABLES = [
  {
    name: 'member_ranks',
    cols: [
      col('id', 'id'),
      col('code', 'text', 'NOT NULL UNIQUE'),
      col('name', 'text', 'NOT NULL'),
      col('min_book_value', 'bigint', 'NOT NULL DEFAULT 0'),   // 簿価下限（円）
      col('fee_rate', 'num', 'NOT NULL DEFAULT 0.025'),        // 年間管理手数料率
      col('mile_rate', 'num', 'NOT NULL DEFAULT 0.035'),       // 年間マイル還元率
      col('sort_order', 'int', 'NOT NULL DEFAULT 0'),
      col('is_active', 'int', 'NOT NULL DEFAULT 1'),
    ],
  },
  {
    name: 'member_accounts',
    cols: [
      col('id', 'id'),
      col('user_id', 'int', 'NOT NULL UNIQUE REFERENCES users(id)'),
      col('account_no', 'text', 'NOT NULL UNIQUE'),
      col('rank_code', 'text'),                                 // 実効ランク（自動算定 or ロック値）
      col('locked_rank_code', 'text'),                          // 手動ロック。NULL なら簿価から自動算定
      col('status', 'text', "NOT NULL DEFAULT 'active'"),        // active / suspended / closed
      col('joined_at', 'ts'),
      // 移行前の購入額ランク（ブロンズ／シルバー／スタンダード／ゴールド／プラチナ／ダイヤモンド）。
      // 実効ランクはあくまで簿価から算定するので、これは突合・監査用の参考値。
      col('legacy_rank', 'text'),
      col('note', 'text'),
      col('created_at', 'ts'),
      col('updated_at', 'ts'),
    ],
    indexes: [['member_accounts_status_idx', 'status']],
  },
  {
    name: 'holdings',
    cols: [
      col('id', 'id'),
      col('member_id', 'int', 'NOT NULL REFERENCES member_accounts(id)'),
      col('wine_name', 'text', 'NOT NULL'),
      col('producer', 'text'),
      col('vintage', 'int'),
      col('region', 'text'),
      col('volume_ml', 'int', 'NOT NULL DEFAULT 750'),
      col('quantity', 'int', 'NOT NULL DEFAULT 1'),
      col('acquired_unit_price', 'bigint', 'NOT NULL'),          // 取得単価＝簿価（円/本・税込）
      col('acquired_at', 'ts'),
      col('purchase_channel', 'text'),                           // ec / auction / concierge / transfer
      col('storage_site', 'text'),                               // 鈴与 / 寺田 / 舞浜 など
      col('storage_location', 'text'),
      col('status', 'text', "NOT NULL DEFAULT 'stored'"),         // stored / shipped / sold / withdrawn
      col('released_at', 'ts'),
      col('note', 'text'),
      col('created_at', 'ts'),
      col('updated_at', 'ts'),
    ],
    indexes: [
      ['holdings_member_idx', 'member_id'],
      ['holdings_status_idx', 'status'],
    ],
  },
  {
    name: 'holding_valuations',
    cols: [
      col('id', 'id'),
      col('holding_id', 'int', 'NOT NULL REFERENCES holdings(id)'),
      col('as_of', 'ts', 'NOT NULL'),
      col('unit_market_price', 'bigint', 'NOT NULL'),            // 時価（円/本）
      col('source', 'text'),                                     // liv-ex / rakuten / manual
      col('created_at', 'ts'),
    ],
    indexes: [['holding_valuations_holding_idx', 'holding_id, as_of']],
  },
  {
    name: 'management_fees',
    cols: [
      col('id', 'id'),
      col('member_id', 'int', 'NOT NULL REFERENCES member_accounts(id)'),
      col('period_start', 'ts', 'NOT NULL'),
      col('period_end', 'ts', 'NOT NULL'),
      col('basis_book_value', 'bigint', 'NOT NULL'),             // 賦課対象の簿価
      col('fee_rate', 'num', 'NOT NULL'),
      col('amount', 'bigint', 'NOT NULL'),
      col('status', 'text', "NOT NULL DEFAULT 'draft'"),          // draft / billed / paid / void
      col('billed_at', 'ts'),
      col('paid_at', 'ts'),
      col('created_at', 'ts'),
    ],
    indexes: [['management_fees_member_idx', 'member_id, period_start']],
  },
  {
    // 付与ロット。有効期限つきで、消込は期限が近い順（FIFO by expiry）。
    name: 'mile_lots',
    cols: [
      col('id', 'id'),
      col('member_id', 'int', 'NOT NULL REFERENCES member_accounts(id)'),
      col('kind', 'text', 'NOT NULL'),                           // reward / bonus / campaign / adjust / purchased
      col('granted_amount', 'bigint', 'NOT NULL'),
      col('remaining_amount', 'bigint', 'NOT NULL'),
      // 有償で購入されたマイルの支払対価（円）。無償付与は NULL。
      // 資金決済法上、前払式支払手段に当たるのは「対価を得て発行される」もの＝この列が入る行だけ。
      // 未使用残高の集計を有償分だけで出せるよう、台帳の段階で分離しておく。
      col('paid_amount', 'bigint'),
      col('granted_at', 'ts', 'NOT NULL'),
      col('expires_at', 'ts'),                                   // NULL = 無期限
      col('source_type', 'text'),                                // fee_offset / auction / event / school ...
      col('source_id', 'text'),
      col('memo', 'text'),
      col('created_at', 'ts'),
    ],
    indexes: [['mile_lots_member_idx', 'member_id, expires_at']],
  },
  {
    name: 'mile_transactions',
    cols: [
      col('id', 'id'),
      col('member_id', 'int', 'NOT NULL REFERENCES member_accounts(id)'),
      col('lot_id', 'int', 'REFERENCES mile_lots(id)'),
      col('type', 'text', 'NOT NULL'),                           // grant / redeem / expire / cancel / adjust
      col('amount', 'bigint', 'NOT NULL'),                       // 付与は正、消費・失効は負
      col('balance_after', 'bigint', 'NOT NULL'),
      col('occurred_at', 'ts', 'NOT NULL'),
      col('channel', 'text'),                                    // restaurant / grandmaison / club / auction / school / event / wine
      col('yen_per_mile', 'num'),                                // 利用時に適用した充当レート
      col('yen_value', 'bigint'),                                // 充当額（円）
      col('reference', 'text'),
      col('memo', 'text'),
      col('created_at', 'ts'),
    ],
    indexes: [['mile_transactions_member_idx', 'member_id, occurred_at']],
  },
  {
    /**
     * マイルの利用チャネルと充当レート。
     *
     * 景品表示法5条2号（有利誤認表示）の観点から、利用先によって1マイルあたりの
     * 充当額が異なる場合は、会員が交換先を選ぶ前にレートを明示する必要がある。
     * レートをコードに埋めず master に置いているのは、member_ranks と同じ理由で、
     * 変更があってもコード改修なしで反映できるようにするため。
     */
    name: 'mile_channels',
    cols: [
      col('id', 'id'),
      col('code', 'text', 'NOT NULL UNIQUE'),
      col('name', 'text', 'NOT NULL'),
      col('description', 'text'),
      col('yen_per_mile', 'num', 'NOT NULL DEFAULT 1'),   // 1マイルあたりの充当額（円）
      col('sort_order', 'int', 'NOT NULL DEFAULT 0'),
      col('is_active', 'int', 'NOT NULL DEFAULT 1'),
    ],
  },
  {
    /**
     * WineBank CLUB の会員資格。
     *
     * CLUB のランク（Standard / Ambassador / Gold / Black）は年会費で決まる会員制度で、
     * 簿価から自動算定される投資ランク（member_ranks）とは別の軸。どちらにも Gold が
     * あるため、同じ列に混ぜると区別がつかなくなる。ここを独立したテーブルにしておくと
     * 「CLUB Black かつ 投資 SIGNATURE」のような組み合わせが自然に表現できる。
     *
     * ワインを購入していない CLUB 会員には member_accounts を作らないので、
     * member_id は NULL のままになる（投資実績ができた時点で紐づく）。
     */
    name: 'club_memberships',
    cols: [
      col('id', 'id'),
      col('club_member_no', 'text', 'NOT NULL UNIQUE'),   // CLUB の会員番号
      col('user_id', 'int'),                              // ログインユーザーと紐づいた場合
      col('member_id', 'int'),                            // 会員口座と紐づいた場合
      col('club_rank', 'text'),                           // Standard / Ambassador / Gold / Black
      col('name', 'text'),
      col('name_kana', 'text'),
      col('phone', 'text'),
      col('email', 'text'),
      col('joined_at', 'ts'),
      col('joined_store', 'text'),
      col('withdrawn_at', 'ts'),
      col('status', 'text', "NOT NULL DEFAULT 'active'"),  // active / withdrawn
      col('source', 'text'),                               // 取込元（import:club など）
      col('note', 'text'),
      col('created_at', 'ts'),
      col('updated_at', 'ts'),
    ],
    indexes: [
      ['club_memberships_email_idx', 'email'],
      ['club_memberships_status_idx', 'status'],
      ['club_memberships_member_idx', 'member_id'],
    ],
  },
  {
    // 一括インポートの実行記録。誰がいつ何件取り込んだかを後から追える。
    name: 'member_import_batches',
    cols: [
      col('id', 'id'),
      col('kind', 'text', 'NOT NULL'),        // club / investment
      col('executed_by', 'int'),              // 実行した管理者の users.id
      col('file_name', 'text'),
      col('digest', 'text'),                  // 取り込んだ内容のハッシュ（ドライラン結果との一致確認用）
      col('total_rows', 'int', 'NOT NULL DEFAULT 0'),
      col('created_count', 'int', 'NOT NULL DEFAULT 0'),
      col('updated_count', 'int', 'NOT NULL DEFAULT 0'),
      col('skipped_count', 'int', 'NOT NULL DEFAULT 0'),
      col('detail', 'text'),
      col('executed_at', 'ts', 'NOT NULL'),
      col('created_at', 'ts'),
    ],
    indexes: [['member_import_batches_kind_idx', 'kind, executed_at']],
  },
  {
    // 送信済み通知の記録。バッチが繰り返し走っても同じ通知を二度送らないための台帳。
    // dedupe_key に「何に対する通知か」を入れる（例: lot=123 / 2026Q3）。
    name: 'member_notifications',
    cols: [
      col('id', 'id'),
      col('member_id', 'int', 'NOT NULL REFERENCES member_accounts(id)'),
      col('type', 'text', 'NOT NULL'),        // mile_expiry / annual_reward / quarterly_report
      col('dedupe_key', 'text', 'NOT NULL'),
      col('status', 'text', "NOT NULL DEFAULT 'sent'"),  // sent / failed
      col('to_email', 'text'),
      col('detail', 'text'),
      col('sent_at', 'ts', 'NOT NULL'),
      col('created_at', 'ts'),
    ],
    indexes: [
      // 同じ対象への二重送信は DB レベルで弾く
      ['member_notifications_key_idx', 'member_id, type, dedupe_key', 'UNIQUE'],
      ['member_notifications_sent_idx', 'type, sent_at'],
    ],
  },
];

/**
 * 既に作られているテーブルに後から追加された列を、冪等に足す。
 * CREATE TABLE IF NOT EXISTS は既存テーブルに列を増やしてくれないため、
 * スキーマを拡張したときはここに1行足す。
 */
async function addColumnIfMissing(table, column, pg) {
  const type = TYPES[column.type][pg ? 0 : 1];
  const exists = pg
    ? await db.prepare(
        'SELECT 1 AS found FROM information_schema.columns WHERE table_name = ? AND column_name = ?'
      ).get(table, column.name)
    : await db.prepare(
        `SELECT 1 AS found FROM pragma_table_info('${table}') WHERE name = ?`
      ).get(column.name);
  if (exists) return false;
  await db.exec(`ALTER TABLE ${table} ADD COLUMN ${column.name} ${type}`);
  return true;
}

// 後から足した列。テーブル定義（TABLES）にも同じ列を書いておくこと。
const ADDED_COLUMNS = [
  ['mile_lots', col('paid_amount', 'bigint')],
  ['member_accounts', col('legacy_rank', 'text')],
  // 利用時に適用した充当レートと充当額。後からいくら充当したかを証明できるようにする
  ['mile_transactions', col('yen_per_mile', 'num')],
  ['mile_transactions', col('yen_value', 'bigint')],
];

function ddlFor(table, pg) {
  const i = pg ? 0 : 1;
  const cols = table.cols.map(c => `  ${c.name} ${TYPES[c.type][i]}${c.extra ? ' ' + c.extra : ''}`);
  return `CREATE TABLE IF NOT EXISTS ${table.name} (\n${cols.join(',\n')}\n)`;
}

const DEFAULT_RANKS = [
  // code, name, 簿価下限, 手数料率, マイル還元率, 並び順
  ['PRESTIGE',  'PRESTIGE',  1000000,  0.025, 0.035, 10],
  ['GOLD',      'GOLD',      4000000,  0.025, 0.045, 20],
  ['SIGNATURE', 'SIGNATURE', 10000000, 0.025, 0.055, 30],
];

async function migrate() {
  const pg = !!db.isPG;

  for (const t of TABLES) {
    await db.exec(ddlFor(t, pg));
    for (const [name, cols, unique] of t.indexes || []) {
      await db.exec(
        `CREATE ${unique === 'UNIQUE' ? 'UNIQUE ' : ''}INDEX IF NOT EXISTS ${name} ON ${t.name} (${cols})`);
    }
  }

  for (const [table, column] of ADDED_COLUMNS) {
    await addColumnIfMissing(table, column, pg);
  }

  // 利用チャネル master の初期投入（既存行は上書きしない）
  const { REDEEM_CHANNELS } = require('../services/miles');
  for (let i = 0; i < REDEEM_CHANNELS.length; i += 1) {
    const c = REDEEM_CHANNELS[i];
    const existing = await db.prepare('SELECT id FROM mile_channels WHERE code = ?').get(c.code);
    if (!existing) {
      await db.prepare(`
        INSERT INTO mile_channels (code, name, description, yen_per_mile, sort_order, is_active)
        VALUES (?, ?, ?, ?, ?, 1)
      `).run(c.code, c.name, c.description, c.yenPerMile, (i + 1) * 10);
    }
  }

  // ランク master の初期投入（既存行は上書きしない）
  for (const [code, name, minBook, feeRate, mileRate, order] of DEFAULT_RANKS) {
    const existing = await db.prepare('SELECT id FROM member_ranks WHERE code = ?').get(code);
    if (!existing) {
      await db.prepare(`
        INSERT INTO member_ranks (code, name, min_book_value, fee_rate, mile_rate, sort_order, is_active)
        VALUES (?, ?, ?, ?, ?, ?, 1)
      `).run(code, name, minBook, feeRate, mileRate, order);
    }
  }

  console.log('✅ 会員管理スキーマ 初期化完了');
}

module.exports = { migrate, TABLES, DEFAULT_RANKS };
