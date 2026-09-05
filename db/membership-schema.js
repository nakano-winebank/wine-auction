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
      col('kind', 'text', 'NOT NULL'),                           // reward / bonus / campaign / adjust
      col('granted_amount', 'bigint', 'NOT NULL'),
      col('remaining_amount', 'bigint', 'NOT NULL'),
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
      col('reference', 'text'),
      col('memo', 'text'),
      col('created_at', 'ts'),
    ],
    indexes: [['mile_transactions_member_idx', 'member_id, occurred_at']],
  },
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
    for (const [name, cols] of t.indexes || []) {
      await db.exec(`CREATE INDEX IF NOT EXISTS ${name} ON ${t.name} (${cols})`);
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
