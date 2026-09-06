/**
 * ワイン購入（会員導線の入口）
 *
 * 「ワインを買う → 会員口座が開く → 保有ワインとランクが付く → マイルが貯まる」までを
 * 1本の処理にまとめる。管理画面から手作業で再現していた流れを、会員が自分で通せるようにする。
 *
 * 設計の要点:
 *   購入プランは member_ranks から動的に組み立てる。プランの金額はランクの簿価下限そのもので、
 *   本数は代表銘柄の単価から逆算する。こうしておくと管理画面でランクの閾値を変えたときに
 *   プランが自動で追従し、料率・金額をこのファイルに書き写す必要がない。
 */
const db = require('../database');
const { nowIso } = require('../db/helpers');
const members = require('./members');
const miles = require('./miles');

/**
 * ランクごとの代表銘柄。金額ではなく「単価」だけを持たせているのがポイントで、
 * 必要本数はランクの簿価下限から計算する。銘柄の入れ替えはここを直すだけで済む。
 */
const REPRESENTATIVE_WINES = {
  PRESTIGE: {
    wineName: 'シャトー・ランシュ・バージュ',
    producer: 'Château Lynch-Bages',
    vintage: 2016,
    region: 'ボルドー / ポイヤック',
    unitPrice: 50000,
    tagline: 'ポイヤック格付5級。安定した価格推移で、はじめての資産保有に向く1本。',
  },
  GOLD: {
    wineName: 'シャトー・マルゴー',
    producer: 'Château Margaux',
    vintage: 2015,
    region: 'ボルドー / マルゴー',
    unitPrice: 250000,
    tagline: '五大シャトーの一角。2015年は当たり年として評価が高い。',
  },
  SIGNATURE: {
    wineName: 'ラ・ターシュ',
    producer: 'Domaine de la Romanée-Conti',
    vintage: 2018,
    region: 'ブルゴーニュ / ヴォーヌ・ロマネ',
    unitPrice: 625000,
    tagline: 'DRC のモノポール。世界的に流通量が限られ、二次流通の厚みがある。',
  },
};

// 代表銘柄が未登録のランク用。ランクを新設してもプランが欠けないようにする。
const FALLBACK_WINE = {
  wineName: 'WineBank セレクション',
  producer: 'WineBank',
  vintage: null,
  region: '—',
  unitPrice: 50000,
  tagline: 'ソムリエが選定したセレクションです。',
};

/** 入会記念ボーナス（期間限定マイル・180日）。料率ではなく定額なのでここで持つ。 */
const WELCOME_BONUS_MILES = 3000;

/** 既定の保管場所。実運用では拠点マスタに寄せる。 */
const DEFAULT_STORAGE_SITE = '鈴与 清水';

function wineFor(rankCode) {
  return REPRESENTATIVE_WINES[rankCode] || FALLBACK_WINE;
}

/**
 * 購入プラン一覧。ランク master から組み立てるので、料率も金額もここには書かない。
 * 本数は簿価下限を必ず満たすよう切り上げる（＝購入すれば必ずそのランクに到達する）。
 */
async function listPlans() {
  const ranks = await members.listRanks();
  return ranks
    .filter(r => r.min_book_value > 0)
    .map(rank => {
      const wine = wineFor(rank.code);
      const quantity = Math.ceil(rank.min_book_value / wine.unitPrice);
      const bookValue = quantity * wine.unitPrice;
      return {
        rankCode: rank.code,
        rankName: rank.name,
        wine,
        quantity,
        unitPrice: wine.unitPrice,
        bookValue,
        feeRate: rank.fee_rate,
        mileRate: rank.mile_rate,
        // 会員に見せる想定値。いずれもランク master 由来で算出している。
        annualFee: Math.round(bookValue * rank.fee_rate),
        firstYearMiles: Math.round(bookValue * rank.mile_rate),
        welcomeBonusMiles: WELCOME_BONUS_MILES,
      };
    });
}

async function getPlan(rankCode) {
  const plans = await listPlans();
  const plan = plans.find(p => p.rankCode === rankCode);
  if (!plan) throw new Error(`購入プランが見つかりません: ${rankCode}`);
  return plan;
}

/**
 * プランを購入する。会員口座がなければ同時に開設する。
 *
 * 1. 会員口座を用意（既にあればそれを使う）
 * 2. 保有ワインを登録（初回時価＝取得単価。購入当日は含み損益ゼロから始める）
 * 3. ランクを再判定（addHolding の中で走る）
 * 4. 初年度のマイル還元を付与（額面＝今回の簿価 × ランクの還元率）
 * 5. 入会記念ボーナスを付与（初回購入のみ・期間限定180日）
 *
 * @param {number} userId
 * @param {string} rankCode  プラン＝ランクのコード
 */
async function purchasePlan(userId, rankCode) {
  const plan = await getPlan(rankCode);

  const before = await members.getAccountByUser(userId);
  const isFirstPurchase = !before;

  const account = await members.createAccount(userId);
  if (account.status !== 'active') {
    throw new Error('この会員口座は現在ご利用いただけません');
  }

  const purchasedAt = nowIso();
  const holding = await members.addHolding(account.id, {
    wineName: plan.wine.wineName,
    producer: plan.wine.producer,
    vintage: plan.wine.vintage,
    region: plan.wine.region,
    quantity: plan.quantity,
    acquiredUnitPrice: plan.unitPrice,
    acquiredAt: purchasedAt,
    purchaseChannel: 'ec',
    storageSite: DEFAULT_STORAGE_SITE,
    unitMarketPrice: plan.unitPrice, // 購入時点の時価は取得単価と同じ
    valuationSource: 'purchase',
    note: `${plan.rankName} プラン`,
  });

  // ランクは addHolding 内で再判定済み。還元率は判定後のランクから引く。
  const rank = await members.getRank((await members.getAccount(account.id)).rank_code);
  const grants = [];

  const rewardAmount = Math.round(plan.bookValue * (rank ? rank.mile_rate : plan.mileRate));
  if (rewardAmount > 0) {
    grants.push(await miles.grant(account.id, rewardAmount, {
      kind: 'reward',
      sourceType: 'purchase_reward',
      sourceId: String(holding.id),
      channel: 'wine',
      memo: `${plan.rankName} 初年度還元 ${((rank ? rank.mile_rate : plan.mileRate) * 100).toFixed(1)}%`,
    }));
  }

  if (isFirstPurchase && WELCOME_BONUS_MILES > 0) {
    grants.push(await miles.grant(account.id, WELCOME_BONUS_MILES, {
      kind: 'bonus',
      sourceType: 'welcome',
      channel: 'wine',
      memo: 'ご入会記念ボーナス（期間限定）',
    }));
  }

  return {
    memberId: account.id,
    accountNo: account.account_no,
    isFirstPurchase,
    plan,
    holding,
    rankCode: rank ? rank.code : null,
    grants,
    balance: await miles.getBalance(account.id),
  };
}

// ───────────────────────────────── マイルのみの追加購入（有償）

/**
 * ⚠️ 法務確認前に本番公開しないこと。詳細は services/miles.js の PURCHASED_KIND 付近の注意書き。
 *
 * 有償パックには「おまけマイル」を付けていない。おまけを付けると1回の購入の中に
 * 有償分（前払式支払手段に当たり得る）と無償分（当たらない）が混ざり、未使用残高を
 * 有償分だけで集計するのが難しくなるため。販促を付けたい場合は、購入とは別の
 * kind='campaign' のロットとして独立に付与すること。
 */
const MILE_PACKS = [
  { code: 'pack_10k',  yen: 10000 },
  { code: 'pack_50k',  yen: 50000 },
  { code: 'pack_100k', yen: 100000 },
];

/** パック一覧。マイル数は円から換算するだけで、レートは miles.MILE_TO_YEN に一本化してある。 */
function listMilePacks() {
  return MILE_PACKS.map(p => ({
    ...p,
    miles: Math.round(p.yen / miles.MILE_TO_YEN),
    validDays: miles.MILE_VALIDITY_DAYS[miles.PURCHASED_KIND],
  }));
}

/**
 * マイルを有償で購入する。
 *
 * 決済は未接続で、台帳への記録だけを行う（デモ・検証用）。実運用に載せる前に
 * Pay.jp の決済成立を待ってから grant する導線に差し替えること。
 */
async function purchaseMiles(userId, packCode) {
  const pack = listMilePacks().find(p => p.code === packCode);
  if (!pack) throw new Error(`マイルパックが見つかりません: ${packCode}`);

  const account = await members.getAccountByUser(userId);
  if (!account) throw new Error('先にワインをご購入いただくと会員口座が開設されます');
  if (account.status !== 'active') throw new Error('この会員口座は現在ご利用いただけません');

  const grant = await miles.grant(account.id, pack.miles, {
    kind: miles.PURCHASED_KIND,
    paidAmount: pack.yen,
    sourceType: 'mile_purchase',
    sourceId: pack.code,
    memo: `マイル購入 ¥${pack.yen.toLocaleString()}（デモ・検証用／決済未接続）`,
  });

  return {
    memberId: account.id,
    pack,
    grant,
    balance: await miles.getBalance(account.id),
    purchasedOutstanding: await miles.getPurchasedOutstanding(nowIso(), account.id),
  };
}

module.exports = {
  REPRESENTATIVE_WINES,
  MILE_PACKS,
  listMilePacks,
  purchaseMiles,
  WELCOME_BONUS_MILES,
  DEFAULT_STORAGE_SITE,
  listPlans,
  getPlan,
  purchasePlan,
};
