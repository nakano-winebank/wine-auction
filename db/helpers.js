const db = require('../database');

/**
 * INSERT して採番された id を返す。
 * PostgreSQL は RETURNING id、SQLite は lastInsertRowid と、取り方が違うので吸収する。
 */
async function insertReturningId(sql, params = []) {
  if (db.isPG) {
    const row = await db.prepare(`${sql} RETURNING id`).get(...params);
    return row ? row.id : null;
  }
  const result = await db.prepare(sql).run(...params);
  return Number(result.lastInsertRowid);
}

/** ISO8601 文字列。TIMESTAMP(PG) / TEXT(SQLite) のどちらにもそのまま入る。 */
function nowIso() {
  return new Date().toISOString();
}

/** days 日後の ISO 文字列。 */
function isoAfterDays(days, from = new Date()) {
  const d = new Date(from);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString();
}

/** SQLite は真偽値を 0/1 で返すので、両モードで同じ扱いにする。 */
function toBool(v) {
  return v === true || v === 1 || v === '1';
}

module.exports = { insertReturningId, nowIso, isoAfterDays, toBool };
