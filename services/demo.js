/**
 * デモ用「時間送り」
 *
 * ⚠️ 検証専用の機能です。環境変数 DEMO_MODE=1 のときだけ routes/demo.js が登録されます。
 *    本番環境では DEMO_MODE を設定しないこと。
 *
 * 方式について:
 *   アプリ全体の現在時刻を仮想化する（nowIso() を差し替える）方法は、会員管理以外の
 *   すべてのモジュールに影響が及び、本番で誤爆したときの被害が読めない。
 *   そこでこちらは逆向きに、「対象会員の台帳の日時を N 日ぶん過去へずらす」ことで
 *   時間が経過した状態を作る。本番コードが通る経路は一切変わらず、影響範囲も
 *   指定した1会員の行だけに閉じる。
 *
 *   日時をずらしたあとで、実際のバッチと同じ関数（expireLots / grantAnnualReward /
 *   accrueManagementFee）をそのまま呼ぶので、再現される結果は本番の挙動と同じになる。
 */
const db = require('../database');
const { nowIso, isoAfterDays } = require('../db/helpers');
const members = require('./members');
const miles = require('./miles');

/** デモ機能が有効かどうか。ルート登録の可否もこれで判定する。 */
function isEnabled() {
  return process.env.DEMO_MODE === '1';
}

/**
 * 会員1人ぶんの、日時を持つ列の一覧。ここに挙げた列だけがシフトの対象。
 * where は member_id を1つだけバインドする形に揃えてある。
 */
const SHIFT_TARGETS = [
  { table: 'member_accounts', where: 'id = ?',
    cols: ['joined_at', 'created_at', 'updated_at'] },
  { table: 'holdings', where: 'member_id = ?',
    cols: ['acquired_at', 'released_at', 'created_at', 'updated_at'] },
  { table: 'holding_valuations', where: 'holding_id IN (SELECT id FROM holdings WHERE member_id = ?)',
    cols: ['as_of', 'created_at'] },
  { table: 'management_fees', where: 'member_id = ?',
    cols: ['period_start', 'period_end', 'billed_at', 'paid_at', 'created_at'] },
  { table: 'mile_lots', where: 'member_id = ?',
    cols: ['granted_at', 'expires_at', 'created_at'] },
  { table: 'mile_transactions', where: 'member_id = ?',
    cols: ['occurred_at', 'created_at'] },
];

/** ISO 日時を days 日ぶん過去へずらす。null はそのまま。 */
function shiftBack(value, days) {
  if (value === null || value === undefined || value === '') return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString();
}

/** 対象会員の台帳の日時をまとめて過去へずらす。 */
async function shiftMemberDates(memberId, days) {
  let updated = 0;
  for (const target of SHIFT_TARGETS) {
    const rows = await db.prepare(
      `SELECT id, ${target.cols.join(', ')} FROM ${target.table} WHERE ${target.where}`
    ).all(memberId);

    for (const row of rows) {
      const sets = [];
      const params = [];
      for (const c of target.cols) {
        if (row[c] === null || row[c] === undefined) continue;
        sets.push(`${c} = ?`);
        params.push(shiftBack(row[c], days));
      }
      if (!sets.length) continue;
      params.push(row.id);
      await db.prepare(`UPDATE ${target.table} SET ${sets.join(', ')} WHERE id = ?`).run(...params);
      updated += 1;
    }
  }
  return updated;
}

/**
 * デモ用の時価変動。年率 annualGrowthRate で複利成長させた時価を1本ぶん記録する。
 * あくまで画面の見え方を確認するための仮定値で、相場観を表すものではない。
 */
const DEFAULT_ANNUAL_GROWTH_RATE = 0.08;

async function revalueHoldings(memberId, days, annualGrowthRate) {
  const holdings = await members.listHoldings(memberId);
  const factor = Math.pow(1 + annualGrowthRate, days / 365);
  const results = [];
  for (const h of holdings) {
    const base = h.latest_market_price === null ? h.acquired_unit_price : h.latest_market_price;
    const next = Math.round(base * factor);
    if (next === base) continue;
    await members.addValuation(h.id, next, { source: 'demo' });
    results.push({ holdingId: h.id, from: base, to: next });
  }
  return results;
}

/**
 * 時間を進める。
 *
 * @param {number} memberId
 * @param {number} days                進める日数（1〜3650）
 * @param {object} opts                { annualGrowthRate, skipFee }
 * @returns 実行した処理の内訳
 */
async function advanceTime(memberId, days, opts = {}) {
  if (!isEnabled()) throw new Error('デモ機能は無効です（DEMO_MODE=1 で有効化してください）');

  const member = await members.getAccount(memberId);
  if (!member) throw new Error('会員口座が見つかりません');

  const n = Math.round(Number(days));
  if (!Number.isFinite(n) || n < 1 || n > 3650) {
    throw new Error('進める日数は 1〜3650 日で指定してください');
  }

  const growth = opts.annualGrowthRate === undefined
    ? DEFAULT_ANNUAL_GROWTH_RATE : Number(opts.annualGrowthRate);

  const log = [];

  // 1. 台帳の日時を過去へずらす＝時間が経過した状態を作る
  const shifted = await shiftMemberDates(memberId, n);
  log.push(`${n}日ぶん時間を進めました（${shifted}行を調整）`);

  // 2. 時価を更新する。年次還元より先に走らせて、還元額が最新の資産状況を反映するようにする
  const revalued = await revalueHoldings(memberId, n, growth);
  if (revalued.length) {
    log.push(`保有${revalued.length}銘柄の時価を更新しました（年率${(growth * 100).toFixed(1)}%想定）`);
  }

  // 3. 期限切れマイルの失効。本番の1時間バッチと同じ関数を呼ぶ
  const expired = await miles.expireLots(nowIso(), memberId);
  if (expired.lots > 0) {
    log.push(`${expired.amount.toLocaleString()}マイルが有効期限切れで失効しました`);
  }

  // 4. 経過した年数ぶんの年次還元
  const rewards = [];
  const years = Math.floor(n / 365);
  for (let i = 0; i < years; i += 1) {
    try {
      const r = await members.grantAnnualReward(memberId, { memo: '年次還元（デモ）' });
      rewards.push(r);
      log.push(`年次還元マイル ${r.amount.toLocaleString()} を付与しました`);
    } catch (e) {
      log.push(`年次還元をスキップしました: ${e.message}`);
      break;
    }
  }

  // 5. 経過期間ぶんの管理手数料を計上
  let fee = null;
  if (!opts.skipFee) {
    try {
      fee = await members.accrueManagementFee(memberId, isoAfterDays(-n), nowIso());
      log.push(`管理手数料 ¥${Number(fee.amount).toLocaleString()} を計上しました`);
    } catch (e) {
      log.push(`管理手数料の計上をスキップしました: ${e.message}`);
    }
  }

  return {
    days: n,
    shiftedRows: shifted,
    revalued,
    expired,
    rewards,
    fee,
    log,
    balance: await miles.getBalance(memberId),
  };
}

module.exports = {
  isEnabled,
  advanceTime,
  shiftMemberDates,
  DEFAULT_ANNUAL_GROWTH_RATE,
};
