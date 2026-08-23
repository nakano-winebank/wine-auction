// 倉持案 v3（固定リターン型／単独投資家1億円・最長2年）の提案資料を生成する。
//
// 数値は一切ハードコードしない。kuramochi_fixed.py が書き出した
// kuramochi_fixed.json をすべての表・グラフの供給源とする。
//
//   python3 -c "import kuramochi_fixed as K; K.export_json()"
//   node build_kuramochi3.js
//
// トンマナは build.js / build_kuramochi2.js と共通（黒×金）。

const pptxgen = require("pptxgenjs");
const D = require("./kuramochi_fixed.json");

// ─────────────────────────────────────────── palette / type
const BG      = "0C0C0C";
const CARD    = "171614";
const CARD2   = "1F1D19";
const LINE    = "2E2A24";
const GOLD    = "A78450";
const GOLD_L  = "C9A96E";
const GOLD_D  = "6E5730";
const IVORY   = "EFEBE3";
const MUTED   = "9A938A";
const DIM     = "6E675E";
const RED     = "B4553F";

const SERIF = "Yu Mincho";
const SANS  = "Yu Gothic";
const LATIN = "Cambria";

const W = 13.333, H = 7.5;
const M = 0.72;
const CW = W - M * 2;

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.author = "株式会社WineBank";
pres.company = "株式会社WineBank";
pres.title = "ワイン現物投資のご提案";

let page = 0;

// ─────────────────────────────────────────── 数値フォーマット
const oku  = (x) => (x / 1e8).toFixed(2) + "億";
const man  = (x) => Math.round(x / 1e4).toLocaleString() + "万";
const yen  = (x) => Math.round(x).toLocaleString() + "円";
const pct  = (x, n = 1) => (x * 100).toFixed(n) + "%";
const num  = (x, n = 2) => x.toFixed(n);

const PM = (name) => D.paces_main.find((p) => p.name === name);   // 本案
const PA = (name) => D.paces_alt.find((p) => p.name === name);    // 対比案
const MAIN = "1年目80%・2年目20%";          // 主線
const PACE_NAMES = D.paces_main.map((p) => p.name);

// 固定リターンの段（6ヶ月以内 / 7〜12ヶ月 / 13〜24ヶ月）
const TIER_LABELS = ["取得から12ヶ月以内", "13〜24ヶ月", "24ヶ月超（残存）"];
const TIER_NOTES = ["1年目に売却が成立した場合", "2年目に売却が成立した場合",
                    "契約期間の満了時に残っていた場合"];

// ─────────────────────────────────────────── helpers
function base() {
  const s = pres.addSlide();
  s.background = { color: BG };
  return s;
}

function chrome(s, eyebrow, title, lead) {
  page += 1;
  s.addText(eyebrow, {
    x: M, y: 0.42, w: CW, h: 0.24, margin: 0,
    fontFace: LATIN, fontSize: 10.5, bold: true, color: GOLD, charSpacing: 3.4,
  });
  s.addText(title, {
    x: M, y: 0.70, w: CW, h: 0.60, margin: 0,
    fontFace: SERIF, fontSize: 27, bold: true, color: IVORY,
  });
  if (lead) {
    s.addText(lead, {
      x: M, y: 1.33, w: CW, h: 0.34, margin: 0,
      fontFace: SANS, fontSize: 11.5, color: MUTED,
    });
  }
  s.addText("CONFIDENTIAL ｜ 株式会社WineBank", {
    x: M, y: H - 0.46, w: 5.5, h: 0.24, margin: 0,
    fontFace: SANS, fontSize: 8.5, color: DIM,
  });
  s.addText(String(page).padStart(2, "0"), {
    x: W - M - 1.0, y: H - 0.46, w: 1.0, h: 0.24, margin: 0, align: "right",
    fontFace: LATIN, fontSize: 9.5, color: GOLD_D, charSpacing: 1.5,
  });
  return s;
}

function card(s, x, y, w, h, opt = {}) {
  s.addShape(pres.ShapeType.roundRect, {
    x, y, w, h, rectRadius: 0.045,
    fill: { color: opt.fill || CARD },
    line: { color: opt.line || LINE, width: 0.75 },
  });
}

function badge(s, x, y, d, label, opt = {}) {
  s.addShape(pres.ShapeType.ellipse, {
    x, y, w: d, h: d,
    fill: { color: opt.fill || BG },
    line: { color: opt.line || GOLD, width: 0.9 },
  });
  s.addText(label, {
    x, y, w: d, h: d, margin: 0, align: "center", valign: "middle",
    fontFace: opt.face || LATIN, fontSize: opt.size || 11,
    bold: true, color: opt.color || GOLD_L,
  });
}

function stat(s, x, y, w, h, value, unit, label, note, opt = {}) {
  card(s, x, y, w, h, { fill: opt.fill || CARD, line: opt.line || LINE });
  s.addText(
    [
      { text: value, options: { fontFace: LATIN, fontSize: opt.vs || 32, bold: true, color: opt.color || GOLD_L } },
      { text: unit ? " " + unit : "", options: { fontFace: SANS, fontSize: 12.5, bold: true, color: opt.color || GOLD_L } },
    ],
    { x: x + 0.26, y: y + 0.18, w: w - 0.52, h: 0.60, margin: 0, valign: "middle" }
  );
  s.addText(label, {
    x: x + 0.26, y: y + 0.80, w: w - 0.52, h: 0.26, margin: 0,
    fontFace: SANS, fontSize: 11, bold: true, color: IVORY,
  });
  if (note) {
    s.addText(note, {
      x: x + 0.26, y: y + 1.05, w: w - 0.52, h: 0.46, margin: 0,
      fontFace: SANS, fontSize: 9, color: MUTED, lineSpacingMultiple: 1.15,
    });
  }
}

// 表。rowH は LibreOffice の最小行高（約0.25）を下回らないよう 0.28 以上で使う。
function table(s, rows, x, y, w, colW, opt = {}) {
  s.addTable(rows, {
    x, y, w, colW,
    border: { type: "solid", pt: 0.6, color: LINE },
    fontFace: SANS, fontSize: opt.fontSize || 10,
    color: IVORY, fill: { color: CARD },
    valign: "middle", align: "center",
    rowH: opt.rowH || 0.34,
    margin: opt.margin === undefined ? 0.05 : opt.margin,
  });
}
function th(t) {
  return { text: t, options: { fill: { color: "231F1A" }, color: GOLD_L, bold: true, fontSize: 9.5, fontFace: SANS } };
}
function td(t, o = {}) {
  return { text: t, options: Object.assign({ fontFace: o.latin ? LATIN : SANS }, o) };
}

function note(s, text, y) {
  s.addText(text, {
    x: M, y: y, w: CW, h: 0.46, margin: 0,
    fontFace: SANS, fontSize: 8, color: DIM, lineSpacingMultiple: 1.25,
  });
}

const CHART_BASE = {
  showLegend: false,
  chartColors: [GOLD, GOLD_D],
  catAxisLabelColor: MUTED, catAxisLabelFontFace: SANS, catAxisLabelFontSize: 9,
  valAxisLabelColor: DIM, valAxisLabelFontFace: LATIN, valAxisLabelFontSize: 8.5,
  valGridLine: { color: "232019", size: 0.6 },
  catGridLine: { style: "none" },
  valAxisLineShow: false, catAxisLineShow: false,
  showValue: true, dataLabelColor: IVORY, dataLabelFontFace: LATIN,
  dataLabelFontSize: 9.5, dataLabelPosition: "outEnd", dataLabelFormatCode: '0.0"%"',
  showTitle: true, titleColor: IVORY, titleFontFace: SANS, titleFontSize: 11, titleBold: true,
};

const TIER_TXT = D.tiers_main.map((t, i) => TIER_LABELS[i] + " 簿価＋" + pct(t.rate, 1)).join(" ／ ");

// ═══════════════════════════════════════════════════════════ 01 表紙
{
  const s = base();
  s.addShape(pres.ShapeType.ellipse, {
    x: 8.55, y: -0.95, w: 6.1, h: 6.1,
    fill: { color: BG }, line: { color: "1E1A15", width: 1.1 },
  });
  s.addShape(pres.ShapeType.ellipse, {
    x: 9.55, y: 0.05, w: 4.1, h: 4.1,
    fill: { color: BG }, line: { color: GOLD_D, width: 0.9 },
  });
  s.addShape(pres.ShapeType.ellipse, {
    x: 11.25, y: 1.75, w: 0.7, h: 0.7,
    fill: { color: GOLD }, line: { color: GOLD, width: 0 },
  });

  s.addText("WINEBANK", {
    x: M, y: 0.62, w: 6, h: 0.3, margin: 0,
    fontFace: LATIN, fontSize: 13, bold: true, color: IVORY, charSpacing: 5.5,
  });
  s.addShape(pres.ShapeType.roundRect, {
    x: M, y: 1.86, w: 3.60, h: 0.36, rectRadius: 0.04,
    fill: { color: CARD2 }, line: { color: GOLD_D, width: 1 },
  });
  s.addText("倉持案｜固定リターン型", {
    x: M, y: 1.86, w: 3.60, h: 0.36, margin: 0, align: "center", valign: "middle",
    fontFace: SANS, fontSize: 11, bold: true, color: GOLD_L, charSpacing: 1.2,
  });
  s.addText("WINE ｜ DIRECT OWNERSHIP", {
    x: M, y: 2.42, w: 8.4, h: 0.28, margin: 0,
    fontFace: LATIN, fontSize: 11, bold: true, color: GOLD, charSpacing: 3.6,
  });
  s.addText("ワイン現物への", {
    x: M, y: 2.80, w: 8.6, h: 0.78, margin: 0,
    fontFace: SERIF, fontSize: 41, bold: true, color: IVORY,
  });
  s.addText("ご投資のご提案", {
    x: M, y: 3.56, w: 8.6, h: 0.78, margin: 0,
    fontFace: SERIF, fontSize: 41, bold: true, color: GOLD_L,
  });
  s.addText("ご投資額 1億円（現物を直接ご所有）／ 契約期間 最長2年 ／ 保有期間に応じた固定リターン", {
    x: M, y: 4.52, w: 9.9, h: 0.3, margin: 0,
    fontFace: SANS, fontSize: 12.5, color: MUTED,
  });
  s.addText("2026年8月", {
    x: M, y: 4.86, w: 9.0, h: 0.3, margin: 0,
    fontFace: SANS, fontSize: 10.5, color: DIM,
  });

  s.addText("株式会社WineBank", {
    x: M, y: H - 1.28, w: 6, h: 0.32, margin: 0,
    fontFace: SERIF, fontSize: 15, bold: true, color: IVORY,
  });
  s.addText("東京都港区六本木4-12-8 第6DMJビル 2階　／　創業 1970年", {
    x: M, y: H - 0.92, w: 8, h: 0.28, margin: 0,
    fontFace: SANS, fontSize: 9.5, color: DIM,
  });
  s.addText("CONFIDENTIAL", {
    x: W - M - 3.0, y: H - 0.92, w: 3.0, h: 0.28, margin: 0, align: "right",
    fontFace: LATIN, fontSize: 9.5, bold: true, color: GOLD_D, charSpacing: 2.4,
  });
}

// ═══════════════════════════════════════════════════════ 02 骨子
{
  const m = PM(MAIN);
  const s = chrome(base(), "EXECUTIVE SUMMARY", "本ご提案の骨子",
    "ワイン現物をご自身で直接ご所有いただき、保有期間に応じた固定のリターンをお支払いする。");

  const sw = (CW - 0.30 * 3) / 4;
  const tiles = [
    ["1.0", "億円", "ご投資額", "現物を貴社名義で直接ご所有。SPC・匿名組合を組成しないため、その維持費は発生しない。", false],
    ["2", "年", "契約期間（最長）", "1年で多くを売り切ることを前提とし、残りは2年目に精算する設計。", false],
    [pct(m.irr).replace("%", ""), "%", "想定IRR（年率）", "1年目80%・2年目20%で売却した場合。倉庫費・保険料を控除した後の数値。", true],
    ["＋" + pct(D.tiers_main[0].rate, 0).replace("%", ""), "%", "1年目の固定リターン", "簿価に対する上乗せ率。2年目は＋" + pct(D.tiers_main[1].rate, 0) + "、24ヶ月超の残存は＋" + pct(D.tiers_main[2].rate, 0) + "（もしくは要協議）。", false],
  ];
  tiles.forEach((t, i) => {
    stat(s, M + (sw + 0.30) * i, 1.78, sw, 1.56, t[0], t[1], t[2], t[3],
      t[4] ? { fill: CARD2, line: GOLD_D } : {});
  });

  const pts = [
    ["投資家のリターンは、保有期間だけで決まります。",
     "WineBankの実際の販売価格・販売費・人件費は、貴社のリターンに影響しない。" + TIER_TXT + "。販売価格からの逆算や利益配分の計算は発生しない。"],
    ["現物は貴社名義。売主はWineBank。",
     "ワインは貴社が直接所有し、WineBankの債権者から隔離される。一方で顧客への売主はWineBankであり、貴社は営業・価格交渉・受注・請求・回収を行わない。"],
    ["毎月、売れたぶんだけ精算します。",
     "保有リストを毎月ご報告し、当月に売却が成立したぶんを簿価＋所定率でお支払いする。資金は運用期間中も継続的にお手元へ戻る。"],
    ["倉庫費・保険料は貴社にご負担いただきます。",
     "1年目 " + man(D.carry_y1) + "円 ／ 2年目 " + man(D.carry_y2) + "円。貴社が倉庫と直接契約されることで、所有に関わる権利を完全に保有いただく。"],
  ];
  let y = 3.60;
  pts.forEach((p, i) => {
    badge(s, M, y, 0.30, String(i + 1).padStart(2, "0"), { size: 9 });
    s.addText(p[0], {
      x: M + 0.44, y: y - 0.02, w: CW - 0.44, h: 0.26, margin: 0,
      fontFace: SANS, fontSize: 12, bold: true, color: IVORY,
    });
    s.addText(p[1], {
      x: M + 0.44, y: y + 0.25, w: CW - 0.44, h: 0.44, margin: 0,
      fontFace: SANS, fontSize: 9.5, color: MUTED, lineSpacingMultiple: 1.2,
    });
    y += 0.78;
  });
  s.addNotes("倉持案v3。固定リターン型。主線は1年目80%・2年目20%でIRR15.7%。");
}

// ═══════════════════════════════════════════════════ 03 スキーム
{
  const s = chrome(base(), "STRUCTURE", "スキームの全体像",
    "取得・保有・販売・精算の4段階。貴社は現物を所有し、販売実務はすべてWineBankが担う。");

  const bw = (CW - 0.26 * 3) / 4, by = 1.80;
  const boxes = [
    ["① 取得", "WineBank → 貴社",
     ["WineBankがインポーター・酒販店から正規品を調達", "市中原価に" + pct(D.acq_markup, 0) + "を付して貴社へ譲渡", "所有権・名義が貴社へ移転"],
     "ご投資額 " + oku(D.capital) + "円 ＝ 簿価", false],
    ["② 保有", "貴社が直接所有",
     ["定温倉庫で保管（全量付保）", "倉庫・保険は貴社が直接契約しご負担", "毎月、保有リストをご報告"],
     "1年目 " + man(D.carry_y1) + "円／2年目 " + man(D.carry_y2) + "円", false],
    ["③ 販売", "WineBank → 顧客",
     ["売主はWineBank。貴社は売買契約の当事者にならない", "営業・価格交渉・受注・請求・回収はWineBank", "B2B酒販店卸とB2C自社EC・オークション"],
     "販売価格は貴社のリターンに影響しない", false],
    ["④ 精算", "毎月",
     ["当月に売却が成立したぶんを精算", "簿価に保有期間に応じた率を上乗せ", "ご指定口座へお振込み"],
     TIER_TXT.split(" ／ ")[0], true],
  ];
  boxes.forEach((b, i) => {
    const x = M + (bw + 0.26) * i;
    card(s, x, by, bw, 2.30, { fill: b[4] ? CARD2 : CARD, line: b[4] ? GOLD_D : LINE });
    s.addText(b[0], {
      x: x + 0.24, y: by + 0.16, w: bw - 0.48, h: 0.26, margin: 0,
      fontFace: SANS, fontSize: 12, bold: true, color: b[4] ? GOLD_L : IVORY,
    });
    s.addText(b[1], {
      x: x + 0.24, y: by + 0.44, w: bw - 0.48, h: 0.24, margin: 0,
      fontFace: SANS, fontSize: 9.5, color: GOLD,
    });
    s.addText(b[2].map((v) => "・" + v).join("\n"), {
      x: x + 0.24, y: by + 0.76, w: bw - 0.48, h: 1.06, margin: 0,
      fontFace: SANS, fontSize: 9, color: MUTED, lineSpacingMultiple: 1.25,
    });
    s.addText(b[3], {
      x: x + 0.24, y: by + 1.90, w: bw - 0.48, h: 0.28, margin: 0,
      fontFace: SANS, fontSize: 9, bold: true, color: GOLD_L,
    });
  });
  [0, 1, 2].forEach((i) => {
    s.addShape(pres.ShapeType.rightArrow, {
      x: M + bw + 0.01 + (bw + 0.26) * i, y: by + 1.03, w: 0.24, h: 0.24,
      fill: { color: GOLD_D }, line: { color: GOLD_D, width: 0 },
    });
  });

  const rows = [
    [th("項目"), th("ご提示済みの案（利益配分型）"), th("本ご提案（固定リターン型）")],
    [td("投資家のリターンの決まり方"), td("販売価格→販売費→人件費→税前利益→配分率"),
     td("保有期間だけで決まる。簿価＋所定率", { color: GOLD_L, bold: true })],
    [td("WineBankの販売価格"), td("投資家のリターンに直結する"), td("投資家のリターンに影響しない", { color: GOLD_L, bold: true })],
    [td("倉庫費・保険料"), td("WineBank側で負担し費用計上"), td("貴社が直接契約しご負担", { color: GOLD_L, bold: true })],
    [td("精算のタイミング"), td("期間損益の計算後"), td("毎月、売却成立のつど")],
    [td("投資家の指標"), td("定常年間利回り"), td("IRR（月次の実際の入金から算出）")],
  ];
  table(s, rows, M, 4.30, CW, [3.10, 4.40, 4.39], { rowH: 0.28, fontSize: 8.5 });

  note(s, "※ 「わかりやすさ」を最優先し、WineBankの損益計算を投資家のリターンから切り離した設計としている。WineBankが所定率を上回る価格で販売できた部分はWineBankの収益となり、下回った場合の負担もWineBankが負う。", 6.28);
  s.addNotes("4段階。利益配分型との対比表。計算の単純化が主眼。");
}

// ═══════════════════════════════════════════ 04 固定リターン
{
  const s = chrome(base(), "INVESTOR RETURN", "投資家のリターン：保有期間だけで決まります",
    "簿価に対する上乗せ率を保有期間で固定する。WineBankの販売実績は一切影響しない。");

  const tw = (CW - 0.30 * 2) / 3;
  D.tiers_main.forEach((t, i) => {
    const x = M + (tw + 0.30) * i;
    const hl = i === 1;
    card(s, x, 1.80, tw, 1.86, { fill: hl ? CARD2 : CARD, line: hl ? GOLD_D : LINE });
    s.addText(TIER_LABELS[i], {
      x: x + 0.22, y: 1.96, w: tw - 0.44, h: 0.26, margin: 0, align: "center",
      fontFace: SANS, fontSize: 11.5, bold: true, color: hl ? GOLD_L : IVORY,
    });
    s.addText(TIER_NOTES[i], {
      x: x + 0.22, y: 2.26, w: tw - 0.44, h: 0.22, margin: 0, align: "center",
      fontFace: SANS, fontSize: 8.5, color: MUTED,
    });
    s.addText("＋" + pct(t.rate, 1), {
      x: x + 0.22, y: 2.48, w: tw - 0.44, h: 0.56, margin: 0, align: "center",
      fontFace: LATIN, fontSize: 34, bold: true, color: hl ? GOLD_L : IVORY,
    });
    s.addText(i === 2 ? "もしくは要協議" : "簿価1,000万円なら " + man(1e7 * (1 + t.rate)) + "円のお支払い", {
      x: x + 0.22, y: 3.12, w: tw - 0.44, h: 0.24, margin: 0, align: "center",
      fontFace: SANS, fontSize: 9, color: i === 2 ? GOLD : MUTED,
    });
  });

  const hw = (CW - 0.30) / 2;
  card(s, M, 3.86, hw, 2.30, { fill: CARD2, line: GOLD_D });
  s.addText("この設計が意味すること", {
    x: M + 0.28, y: 4.00, w: hw - 0.56, h: 0.26, margin: 0,
    fontFace: SANS, fontSize: 11, bold: true, color: GOLD_L,
  });
  s.addText("価格変動リスクはWineBankが負う", {
    x: M + 0.28, y: 4.28, w: hw - 0.56, h: 0.32, margin: 0,
    fontFace: SERIF, fontSize: 17, bold: true, color: IVORY,
  });
  s.addText("WineBankが所定率を上回る価格で販売できれば、その差額はWineBankの収益となる。逆に想定より安くしか売れなかった場合も、貴社へのお支払いは変わらない。ワイン市況の下振れ、値引き販売、販売費や人件費の増加は、いずれも貴社のリターンに影響しない設計としている。", {
    x: M + 0.28, y: 4.68, w: hw - 0.56, h: 1.30, margin: 0,
    fontFace: SANS, fontSize: 10, color: MUTED, lineSpacingMultiple: 1.35,
  });

  card(s, M + hw + 0.30, 3.86, hw, 2.30);
  s.addText("段階の置き方について", {
    x: M + hw + 0.58, y: 4.00, w: hw - 0.56, h: 0.26, margin: 0,
    fontFace: SANS, fontSize: 11, bold: true, color: IVORY,
  });
  s.addText("1年目" + pct(D.tiers_main[0].rate, 0) + "・2年目" + pct(D.tiers_main[1].rate, 0) + "は、資金拘束が1年延びることへの上乗せを10ポイントとした水準。24ヶ月超の" + pct(D.tiers_main[2].rate, 0) + "は、契約期間の満了時に残っていた在庫をWineBankが引き取る際の率とする。ご参考までに、上乗せをより緩やかにした案との対比は次のとおり。", {
    x: M + hw + 0.58, y: 4.30, w: hw - 0.56, h: 0.80, margin: 0,
    fontFace: SANS, fontSize: 9.5, color: MUTED, lineSpacingMultiple: 1.3,
  });
  const alt = [
    ["本案　" + D.tiers_main.map((t) => pct(t.rate, 0)).join(" / "),
     pct(PM("1年以内に100%売却").irr), pct(PM(MAIN).irr), pct(PM("1年目50%・2年目50%").irr)],
    ["対比　" + D.tiers_alt.map((t) => pct(t.rate, 1)).join(" / "),
     pct(PA("1年以内に100%売却").irr), pct(PA(MAIN).irr), pct(PA("1年目50%・2年目50%").irr)],
  ];
  table(s, [
    [th("13〜24ヶ月の水準"), th("1年で100%"), th("80%→20%"), th("50%→50%")],
    ...alt.map((a, i) => [
      td(a[0], { align: "left", bold: i === 0, color: i === 0 ? GOLD_L : IVORY }),
      td(a[1], { bold: i === 0, color: i === 0 ? GOLD_L : IVORY }),
      td(a[2], { bold: i === 0, color: i === 0 ? GOLD_L : IVORY }),
      td(a[3], { bold: i === 0, color: i === 0 ? GOLD_L : IVORY }),
    ]),
  ], M + hw + 0.58, 5.20, hw - 0.56, [2.18, 1.02, 1.02, 1.02], { rowH: 0.30, fontSize: 8.5 });

  note(s, "※ 簿価とは、貴社がWineBankから現物を取得された価格（市中原価＋" + pct(D.acq_markup, 0) + "）。上乗せ率は保有期間、すなわち取得から売却成立までの月数で判定する。24ヶ月超の" + pct(D.tiers_main[2].rate, 0) + "は契約期間の満了時に残存した在庫の引き取り率であり、水準は要協議とする（後掲）。ご投資額" + oku(D.capital) + "円は定価換算で約" + oku(D.rrp_total) + "円相当のワインにあたる。", 6.32);
  s.addNotes("固定リターン7.5/12.5/30%。25%案との対比も掲載。");
}

// ═══════════════════════════════════════════ 05 想定IRR
{
  const s = chrome(base(), "EXPECTED IRR", "想定IRR：早く売り切るほど高くなります",
    "ご投資額1億円。各期間内で毎月フラットに売却される前提。倉庫費・保険料を控除した後の数値。");

  const rows = [
    [th("売却ペース"), th("平均保有期間"), th("受取総額"), th("倉庫費・保険料"),
     th("純利益"), th("想定IRR（年率）")],
    ...D.paces_main.map((p) => {
      const hl = p.name === MAIN;
      return [
        td(p.name + (hl ? "（主線）" : ""), { bold: hl, color: hl ? GOLD_L : IVORY }),
        td(p.avg_hold.toFixed(1) + "ヶ月"),
        td(man(p.recv) + "円"),
        td("▲" + man(p.carry) + "円"),
        td(man(p.profit) + "円"),
        td(pct(p.irr), { bold: true, color: GOLD_L }),
      ];
    }),
  ];
  table(s, rows, M, 1.78, CW, [2.60, 1.70, 1.90, 2.00, 1.80, 1.89], { rowH: 0.40, fontSize: 9.5 });

  card(s, M, 3.92, CW, 1.10, { fill: CARD2, line: GOLD_D });
  s.addText("1年で売り切れれば " + pct(PM("1年以内に100%売却").irr) + "、2年目にずれ込むほど下がります。", {
    x: M + 0.30, y: 4.02, w: CW - 0.60, h: 0.28, margin: 0,
    fontFace: SANS, fontSize: 12, bold: true, color: GOLD_L,
  });
  s.addText("上乗せ率が1年目" + pct(D.tiers_main[0].rate, 0) + "・2年目" + pct(D.tiers_main[1].rate, 0) + "であるのに対し、資金の拘束期間は倍になるため、売却が2年目にずれ込むほどIRRは低下する。したがって本設計では、1年で多くを売り切ることが前提となる。なお2年目の上乗せをさらに厚くすれば売却ペースによらずIRRを揃えることもできるが、その分WineBank側の下振れ耐性は下がる（後掲の対比）。", {
    x: M + 0.30, y: 4.34, w: CW - 0.60, h: 0.60, margin: 0,
    fontFace: SANS, fontSize: 9.5, color: MUTED, lineSpacingMultiple: 1.25,
  });

  s.addChart(pres.ChartType.bar,
    [{ name: "想定IRR", labels: D.paces_main.map((p) => p.name.replace("・", "\n")),
       values: D.paces_main.map((p) => +(p.irr * 100).toFixed(1)) }],
    Object.assign({}, CHART_BASE, {
      x: M, y: 5.10, w: CW, h: 1.50,
      title: "売却ペース別の想定IRR（年率・%）", valAxisMaxVal: 20, valAxisMinVal: 0,
    }));

  note(s, "※ IRRは月次のキャッシュフロー（毎月の精算入金から倉庫費・保険料を控除したもの）から算出し、年率に換算したもの。倉庫費・保険料は在庫の残存にかかわらず年額固定で計上する保守的な置き方としている。倉持様よりご提示いただいた19.5%・16%・14.4%は倉庫費・保険料の控除前の数値であり、本表は控除後の数値である。", 6.66);
  s.addNotes("IRR 16.1/15.7/16.4/16.7%。倉持氏の試算15.8%・15〜16%とほぼ一致。");
}

// ═══════════════════════════════════════════ 06 月次の資金の流れ
{
  const m = PM(MAIN);
  const s = chrome(base(), "CASH FLOW", "毎月の資金の流れ",
    "主線（1年目80%・2年目20%）の場合。毎月、売却が成立したぶんを精算しお振込みする。");

  const rows = [
    [th("時期"), th("当月の売却（簿価）"), th("上乗せ率"), th("精算額"),
     th("倉庫費・保険料"), th("お手元への入金")],
  ];
  const picks = [1, 3, 6, 7, 9, 12, 13, 18, 24];
  picks.forEach((mm) => {
    const r = D.schedule.find((x) => x.m === mm);
    if (!r) return;
    const hl = mm === 6 || mm === 12;
    rows.push([
      td(mm + "ヶ月目", { bold: hl, color: hl ? GOLD_L : IVORY }),
      td(man(r.book) + "円"),
      td("＋" + pct(r.rate, 1), { color: GOLD_L }),
      td(man(r.recv) + "円"),
      td("▲" + man(r.carry) + "円"),
      td(man(r.recv - r.carry) + "円", { bold: true, color: GOLD_L }),
    ]);
  });
  table(s, rows, M, 1.78, CW, [1.70, 2.30, 1.60, 2.10, 2.20, 1.99], { rowH: 0.30, fontSize: 9 });

  const bw = (CW - 0.30 * 2) / 3;
  const sums = [
    ["24ヶ月の受取総額", man(m.recv) + "円", "うち元本 " + oku(D.capital) + "円、上乗せ分 " + man(m.recv - D.capital) + "円"],
    ["倉庫費・保険料（2年計）", "▲" + man(m.carry) + "円", "1年目 " + man(D.carry_y1) + "円 ＋ 2年目 " + man(D.carry_y2) + "円"],
    ["純利益", man(m.profit) + "円", "想定IRR " + pct(m.irr) + "（年率）"],
  ];
  sums.forEach((c, i) => {
    const x = M + (bw + 0.30) * i;
    card(s, x, 4.94, bw, 1.16, { fill: i === 2 ? CARD2 : CARD, line: i === 2 ? GOLD_D : LINE });
    s.addText(c[0], {
      x: x + 0.26, y: 5.06, w: bw - 0.52, h: 0.22, margin: 0,
      fontFace: SANS, fontSize: 9.5, color: GOLD,
    });
    s.addText(c[1], {
      x: x + 0.26, y: 5.28, w: bw - 0.52, h: 0.36, margin: 0,
      fontFace: LATIN, fontSize: 20, bold: true, color: GOLD_L,
    });
    s.addText(c[2], {
      x: x + 0.26, y: 5.66, w: bw - 0.52, h: 0.34, margin: 0,
      fontFace: SANS, fontSize: 8.5, color: MUTED, lineSpacingMultiple: 1.2,
    });
  });

  note(s, "※ 表は代表的な月のみ抜粋。実際には毎月、保有リストと売却実績をご報告したうえで精算する。1年目は毎月 簿価" + man(D.capital * 0.8 / 12) + "円ぶん、2年目は毎月 簿価" + man(D.capital * 0.2 / 12) + "円ぶんが売却される前提で置いている。", 6.28);
  s.addNotes("月次精算のイメージ。6ヶ月目まで7.5%、7-12ヶ月12.5%、13ヶ月以降30%。");
}

// ═══════════════════════════════════════════ 07 IRRと実額
{
  const s = chrome(base(), "IRR AND ACTUAL AMOUNT", "IRRと実際の受取額の関係",
    "IRRは資金効率の指標であり、受取額そのものではない。誤解を避けるため両方を併記する。");

  const rows = [
    [th("売却ペース"), th("平均保有期間"), th("想定IRR（年率）"),
     th("純利益（2年通算の実額）"), th("ご投資額1億円に対する実利回り")],
    ...D.paces_main.map((p) => {
      const hl = p.name === MAIN;
      return [
        td(p.name + (hl ? "（主線）" : ""), { bold: hl, color: hl ? GOLD_L : IVORY }),
        td(p.avg_hold.toFixed(1) + "ヶ月"),
        td(pct(p.irr), { bold: true, color: GOLD_L }),
        td(man(p.profit) + "円", { bold: true }),
        td(pct(p.simple), { color: IVORY }),
      ];
    }),
  ];
  table(s, rows, M, 1.78, CW, [2.60, 1.90, 2.20, 2.70, 2.49], { rowH: 0.42, fontSize: 9.5 });

  const hw = (CW - 0.30) / 2;
  card(s, M, 4.14, hw, 2.06, { fill: CARD2, line: GOLD_D });
  s.addText("なぜ早く売れるほど実額が小さくなるのか", {
    x: M + 0.28, y: 4.26, w: hw - 0.56, h: 0.26, margin: 0,
    fontFace: SANS, fontSize: 11, bold: true, color: GOLD_L,
  });
  s.addText("IRRは「戻った資金を同じ利回りで再投資できる」前提の指標である。1年以内に売り切れた場合、IRRは " + pct(PM("1年以内に100%売却").irr) + " となるが、実際にお手元に残るのは " + man(PM("1年以内に100%売却").profit) + "円（ご投資額に対して " + pct(PM("1年以内に100%売却").simple) + "）にとどまる。資金が早く戻るぶん拘束期間が短く、そのぶん受取額も小さくなるためである。", {
    x: M + 0.28, y: 4.58, w: hw - 0.56, h: 1.10, margin: 0,
    fontFace: SANS, fontSize: 9.5, color: MUTED, lineSpacingMultiple: 1.3,
  });
  s.addText("実額を優先されるか、資金効率を優先されるかで、望ましい売却ペースが変わる点にご留意いただきたい。", {
    x: M + 0.28, y: 5.74, w: hw - 0.56, h: 0.36, margin: 0,
    fontFace: SANS, fontSize: 9.5, bold: true, color: IVORY, lineSpacingMultiple: 1.2,
  });

  card(s, M + hw + 0.30, 4.14, hw, 2.06);
  s.addText("継続してご投資いただく場合", {
    x: M + hw + 0.58, y: 4.26, w: hw - 0.56, h: 0.26, margin: 0,
    fontFace: SANS, fontSize: 11, bold: true, color: IVORY,
  });
  s.addText("戻った資金を同じ条件で次の仕入に充てていただければ、IRRと実利回りは一致に近づく。1回限りのご投資とされるか、ローリングで継続されるかによって実際の運用成果が変わるため、ご意向を伺ったうえで契約期間と更新条件を設計したい。", {
    x: M + hw + 0.58, y: 4.58, w: hw - 0.56, h: 0.96, margin: 0,
    fontFace: SANS, fontSize: 9.5, color: MUTED, lineSpacingMultiple: 1.3,
  });
  s.addText("ご参考：ご提示済みの利益配分型（在庫回転12ヶ月）では、1億円を通年で運用いただく前提で投資家取分 " + man(D.v2.investor) + "円・年率 " + pct(D.v2.yld) + " でした。本ご提案は計算の単純さと引き換えに、1回限りのご投資では実額が小さくなります。", {
    x: M + hw + 0.58, y: 5.58, w: hw - 0.56, h: 0.52, margin: 0,
    fontFace: SANS, fontSize: 8.5, color: DIM, lineSpacingMultiple: 1.25,
  });
  s.addNotes("IRRと実額の乖離を明示。1年100%売却なら実額840万・8.4%。");
}

// ═══════════════════════════════════════════ 08 販売方法2案
{
  const s = chrome(base(), "SALES STRUCTURE", "販売方法：2案をご提示します",
    "経済条件はどちらも同じ。酒類販売業免許の整理がついたほうを採用する。");

  const hw = (CW - 0.30) / 2;
  const plans = [
    ["A", "委託販売型", "投資家が所有したまま、WineBankが自己名義で顧客へ販売する",
     ["所有権は貴社から顧客へ直接移転する", "WineBankが自己の名をもって販売する問屋型", "売却成立時に簿価＋所定率で精算する"],
     "WineBankが一度買い取る必要がなく、商流がシンプル",
     "投資家所有の酒類をWineBankが継続的に委託販売する場合に、投資家側に免許が不要かの確認を要する", false],
    ["B", "再買取型", "WineBankが投資家から簿価＋所定率で再取得し、自社商品として販売する",
     ["WineBankが貴社から現物を買い取る", "その後WineBank自身の商品として顧客へ販売", "買取時点で簿価＋所定率をお支払いする"],
     "顧客への販売時点で所有者・売主ともWineBankとなり商流が明快",
     "投資家からWineBankへの再譲渡を反復すること自体が酒類販売に当たらないか、という別の論点が残る", true],
  ];
  plans.forEach((p, i) => {
    const x = M + (hw + 0.30) * i;
    card(s, x, 1.78, hw, 3.86, { fill: p[6] ? CARD2 : CARD, line: p[6] ? GOLD_D : LINE });
    badge(s, x + 0.28, 1.94, 0.34, p[0], { size: 12 });
    s.addText(p[1], {
      x: x + 0.72, y: 1.94, w: hw - 1.00, h: 0.32, margin: 0,
      fontFace: SANS, fontSize: 14, bold: true, color: p[6] ? GOLD_L : IVORY,
    });
    s.addText(p[2], {
      x: x + 0.28, y: 2.40, w: hw - 0.56, h: 0.44, margin: 0,
      fontFace: SANS, fontSize: 10, color: GOLD, lineSpacingMultiple: 1.25,
    });
    s.addText(p[3].map((v) => "・" + v).join("\n"), {
      x: x + 0.28, y: 2.90, w: hw - 0.56, h: 0.86, margin: 0,
      fontFace: SANS, fontSize: 9.5, color: MUTED, lineSpacingMultiple: 1.3,
    });
    s.addText("メリット", {
      x: x + 0.28, y: 3.86, w: hw - 0.56, h: 0.20, margin: 0,
      fontFace: SANS, fontSize: 9, bold: true, color: GOLD,
    });
    s.addText(p[4], {
      x: x + 0.28, y: 4.08, w: hw - 0.56, h: 0.44, margin: 0,
      fontFace: SANS, fontSize: 9.5, color: IVORY, lineSpacingMultiple: 1.25,
    });
    s.addText("確認を要する論点", {
      x: x + 0.28, y: 4.62, w: hw - 0.56, h: 0.20, margin: 0,
      fontFace: SANS, fontSize: 9, bold: true, color: RED,
    });
    s.addText(p[5], {
      x: x + 0.28, y: 4.84, w: hw - 0.56, h: 0.66, margin: 0,
      fontFace: SANS, fontSize: 9.5, color: MUTED, lineSpacingMultiple: 1.25,
    });
  });

  card(s, M, 5.78, CW, 0.86, { fill: CARD2, line: GOLD_D });
  s.addText("経済条件はどちらも同じです。", {
    x: M + 0.30, y: 5.88, w: 3.60, h: 0.26, margin: 0,
    fontFace: SANS, fontSize: 11.5, bold: true, color: GOLD_L,
  });
  s.addText("貴社が受け取る金額（簿価＋" + D.tiers_main.map((t) => pct(t.rate, 1)).join("／") + "）も、精算のタイミング（毎月）も、AとBで変わらない。2案を所轄税務署の酒類指導官にご提示し、貴社側に酒類販売業免許が不要と整理できるほうを採用する。", {
    x: M + 4.00, y: 5.86, w: CW - 4.30, h: 0.60, margin: 0,
    fontFace: SANS, fontSize: 9.5, color: MUTED, lineSpacingMultiple: 1.25,
  });
  s.addNotes("A委託販売型 / B再買取型。免許の整理がついたほうを採用。");
}

// ═══════════════════════════════════════════ 09 収益の源泉
{
  const s = chrome(base(), "SOURCE OF RETURN", "収益の源泉：ワイン流通の価格差",
    "同一商品が流通段階ごとに異なる価格で存在する。この価格差が、固定リターンの原資となる。");

  const pw = (CW - 0.24 * 4) / 5;
  const steps = [
    ["インポーター仕入", "40", "調達①", false],
    ["酒販店 仕入", "60", "調達②", false],
    ["貴社 簿価", num(D.cost_ratio), "市中原価＋" + pct(D.acq_markup, 0), true],
    ["酒販店卸 売値", "70", "売却① B2B", false],
    ["ネット最安 売値", "80", "売却② B2C", false],
  ];
  steps.forEach((c, i) => {
    const x = M + (pw + 0.24) * i;
    card(s, x, 1.80, pw, 1.44, { fill: c[3] ? CARD2 : CARD, line: c[3] ? GOLD_D : LINE });
    s.addText(c[0], {
      x: x + 0.20, y: 1.92, w: pw - 0.40, h: 0.24, margin: 0,
      fontFace: SANS, fontSize: 9.5, bold: true, color: c[3] ? GOLD_L : IVORY,
    });
    s.addText(c[1], {
      x: x + 0.20, y: 2.20, w: pw - 0.40, h: 0.62, margin: 0,
      fontFace: LATIN, fontSize: 34, bold: true, color: c[3] ? GOLD_L : IVORY,
    });
    s.addText(c[2], {
      x: x + 0.20, y: 2.88, w: pw - 0.40, h: 0.24, margin: 0,
      fontFace: SANS, fontSize: 8.5, color: MUTED,
    });
  });

  const hw = (CW - 0.30) / 2;
  card(s, M, 3.48, hw, 2.52, { fill: CARD2, line: GOLD_D });
  s.addText("なぜこの利益率をお支払いできるのか", {
    x: M + 0.28, y: 3.60, w: hw - 0.56, h: 0.26, margin: 0,
    fontFace: SANS, fontSize: 11, bold: true, color: GOLD_L,
  });
  const lines = [
    ["貴社の簿価（定価比）", num(D.cost_ratio)],
    ["WineBankの売値（定価比・加重平均）", num(D.sell_ratio)],
    ["価格差", "＋" + num(D.sell_ratio - D.cost_ratio)],
    ["簿価に対する比率", pct((D.sell_ratio - D.cost_ratio) / D.cost_ratio)],
  ];
  let ly = 3.94;
  lines.forEach((l, i) => {
    const hl = i >= 2;
    s.addText(l[0], {
      x: M + 0.28, y: ly, w: hw - 1.60, h: 0.26, margin: 0,
      fontFace: SANS, fontSize: 10, color: hl ? GOLD_L : MUTED, bold: hl,
    });
    s.addText(l[1], {
      x: M + hw - 1.60, y: ly, w: 1.32, h: 0.26, margin: 0, align: "right",
      fontFace: LATIN, fontSize: 12, bold: true, color: hl ? GOLD_L : IVORY,
    });
    ly += 0.32;
  });
  s.addText("この価格差から、WineBankが変動販売費（売上の" + pct(D.var_rate, 2) + "）と人件費（同" + pct(D.labor_rate, 1) + "）を負担したうえで、貴社への上乗せ分をお支払いする。保有期間中のワイン価格の上昇（年" + pct(D.appreciation, 0) + "を保守的な前提とする）も原資に加わる。", {
    x: M + 0.28, y: 5.30, w: hw - 0.56, h: 0.44, margin: 0,
    fontFace: SANS, fontSize: 8.5, color: MUTED, lineSpacingMultiple: 1.2,
  });

  card(s, M + hw + 0.30, 3.48, hw, 2.52);
  s.addText("他社が再現できない調達力", {
    x: M + hw + 0.58, y: 3.60, w: hw - 0.56, h: 0.26, margin: 0,
    fontFace: SANS, fontSize: 11, bold: true, color: IVORY,
  });
  const src = [
    ["創業55年の酒類販売業免許", "大手インポーターとの直接取引口座を保有する"],
    ["輸出入ライセンス", "海外からの直接調達と、海外への販売が可能"],
    ["割当（アロケーション）", "希少銘柄の割当はWineBank名義に対して付与される"],
    ["B2B・B2Cの両輪", "酒販店卸に加え、自社EC・オークション・CLUB会員・グループ飲食"],
  ];
  let sy = 3.92;
  src.forEach((c) => {
    s.addShape(pres.ShapeType.ellipse, {
      x: M + hw + 0.60, y: sy + 0.07, w: 0.09, h: 0.09,
      fill: { color: GOLD }, line: { color: GOLD, width: 0 },
    });
    s.addText(c[0], {
      x: M + hw + 0.80, y: sy - 0.02, w: hw - 1.10, h: 0.22, margin: 0,
      fontFace: SANS, fontSize: 10, bold: true, color: IVORY,
    });
    s.addText(c[1], {
      x: M + hw + 0.80, y: sy + 0.19, w: hw - 1.10, h: 0.30, margin: 0,
      fontFace: SANS, fontSize: 8.5, color: MUTED, lineSpacingMultiple: 1.15,
    });
    sy += 0.50;
  });

  note(s, "※ 定価比の数値は、平均定価25,000円／本のワインを100としたときの各流通段階の価格。ご投資額" + oku(D.capital) + "円は定価換算で約" + oku(D.rrp_total) + "円相当（約" + Math.round(D.rrp_total / 25000).toLocaleString() + "本）にあたる。", 6.14);
  s.addNotes("価格差52.5→75。簿価比42.9%。ここから固定リターンを払う。");
}

// ═══════════════════════════════════════════ 10 WineBank側
{
  const m = PM(MAIN);
  const s = chrome(base(), "WINEBANK SIDE", "WineBank側の収益構造",
    "貴社のリターンに影響しない部分ではあるが、事業として成立していることをご確認いただきたい。");

  const rows = [
    [th("売却ペース"), th("顧客への売上"), th("貴社へのお支払い"), th("変動販売費"),
     th("人件費"), th("WineBank粗利"), th("取得マージン"), th("WineBank合計")],
    ...D.paces_main.map((p) => {
      const hl = p.name === MAIN;
      return [
        td(p.name + (hl ? "（主線）" : ""), { bold: hl, color: hl ? GOLD_L : IVORY }),
        td(oku(p.wb_sales) + "円"),
        td("▲" + oku(p.wb_pay) + "円"),
        td("▲" + man(p.wb_var) + "円"),
        td("▲" + man(p.wb_labor) + "円"),
        td(man(p.wb_gross) + "円"),
        td(man(p.wb_margin) + "円"),
        td(man(p.wb_total) + "円", { bold: true, color: GOLD_L }),
      ];
    }),
  ];
  table(s, rows, M, 1.78, CW, [2.30, 1.50, 1.66, 1.28, 1.24, 1.40, 1.30, 1.21], { rowH: 0.40, fontSize: 8.5 });

  const hw = (CW - 0.30) / 2;
  card(s, M, 4.06, hw, 2.10, { fill: CARD2, line: GOLD_D });
  s.addText("売れ行きが落ちるほどWineBankの取り分が減ります", {
    x: M + 0.28, y: 4.18, w: hw - 0.56, h: 0.26, margin: 0,
    fontFace: SANS, fontSize: 11, bold: true, color: GOLD_L,
  });
  s.addText("1年以内に売り切れた場合の " + man(PM("1年以内に100%売却").wb_total) + "円に対し、2年目にずれ込むほどWineBankの取り分は縮み、1年目30%・2年目70%では " + man(PM("1年目30%・2年目70%").wb_total) + "円まで下がる。貴社へのお支払いが保有期間とともに増える一方、WineBankの売上はさほど増えないためである。早期に売り切る動機がWineBank側に強く働く構造としている。", {
    x: M + 0.28, y: 4.50, w: hw - 0.56, h: 1.46, margin: 0,
    fontFace: SANS, fontSize: 9.5, color: MUTED, lineSpacingMultiple: 1.3,
  });

  card(s, M + hw + 0.30, 4.06, hw, 2.10);
  s.addText("貴社とWineBankの取り分", {
    x: M + hw + 0.58, y: 4.18, w: hw - 0.56, h: 0.26, margin: 0,
    fontFace: SANS, fontSize: 11, bold: true, color: IVORY,
  });
  table(s, [
    [th("売却ペース"), th("貴社 純利益"), th("WineBank"), th("比率")],
    ...D.paces_main.map((p) => {
      const tot = p.profit + p.wb_total;
      const hl = p.name === MAIN;
      return [
        td(p.name, { bold: hl, color: hl ? GOLD_L : IVORY }),
        td(man(p.profit) + "円"),
        td(man(p.wb_total) + "円"),
        td(Math.round(p.profit / tot * 100) + ":" + Math.round(p.wb_total / tot * 100)),
      ];
    }),
  ], M + hw + 0.58, 4.50, hw - 0.56, [2.10, 1.20, 1.20, 0.74], { rowH: 0.30, fontSize: 8.5 });

  note(s, "※ ニュートラル（ワイン価格の年間上昇" + pct(D.appreciation, 0) + "・値引きなし）の前提。取得マージンは取得時にWineBankが得る" + pct(D.acq_markup, 0) + "分（" + man(m.wb_margin) + "円）。WineBank粗利からは、この表に含まれない一般管理費を負担する。", 6.32);
  s.addNotes("WB合計 2,166/1,919/1,547/1,299万。売れ行きが落ちるほど減る。");
}

// ═══════════════════════════════════════════ 11 下振れ耐性
{
  const s = chrome(base(), "DOWNSIDE", "下振れ時に何が起きるか",
    "貴社のリターンは変わらない。影響を受けるのはWineBank側の取り分のみとなる。");

  const rows = [
    [th("売却ペース"), ...D.case_labels.map((c) => th(c))],
    ...D.downside_main.map((r) => {
      const hl = r.name === MAIN;
      return [
        td(r.name + (hl ? "（主線）" : ""), { bold: hl, color: hl ? GOLD_L : IVORY }),
        ...r.vals.map((v) => td((v < 0 ? "▲" : "") + man(Math.abs(v)) + "円",
          { bold: true, color: v < 0 ? RED : (v < 5e6 ? IVORY : GOLD_L) })),
      ];
    }),
  ];
  s.addText("本案（" + D.tiers_main.map((t) => pct(t.rate, 0)).join(" / ") + "）の場合のWineBank合計", {
    x: M, y: 1.74, w: CW, h: 0.22, margin: 0,
    fontFace: SANS, fontSize: 9.5, bold: true, color: GOLD,
  });
  table(s, rows, M, 2.00, CW, [2.90, 2.25, 2.25, 2.25, 2.24], { rowH: 0.34, fontSize: 9 });

  s.addText("対比案（" + D.tiers_alt.map((t) => pct(t.rate, 1)).join(" / ") + "）の場合のWineBank合計", {
    x: M, y: 3.78, w: CW, h: 0.22, margin: 0,
    fontFace: SANS, fontSize: 9.5, bold: true, color: GOLD,
  });
  const rows25 = [
    [th("売却ペース"), ...D.case_labels.map((c) => th(c))],
    ...D.downside_alt.map((r) => {
      const hl = r.name === MAIN;
      return [
        td(r.name + (hl ? "（主線）" : ""), { bold: hl, color: hl ? GOLD_L : IVORY }),
        ...r.vals.map((v) => td((v < 0 ? "▲" : "") + man(Math.abs(v)) + "円",
          { bold: true, color: v < 0 ? RED : (v < 5e6 ? IVORY : GOLD_L) })),
      ];
    }),
  ];
  table(s, rows25, M, 4.04, CW, [2.90, 2.25, 2.25, 2.25, 2.24], { rowH: 0.34, fontSize: 9 });

  card(s, M, 5.86, CW, 0.92, { fill: CARD2, line: GOLD_D });
  s.addText("貴社のリターンは、いずれのケースでも変わりません。", {
    x: M + 0.30, y: 5.96, w: 5.20, h: 0.26, margin: 0,
    fontFace: SANS, fontSize: 11.5, bold: true, color: GOLD_L,
  });
  s.addText("ワイン市況が横ばいにとどまっても、値引き販売が必要になっても、貴社への精算額は簿価＋所定率のまま変わらない。本案では売れ行きが2年目にずれ込んでもWineBank側は黒字を確保できるが、2年目の上乗せを厚くした対比案では下振れ時に赤字となる。事業の継続性という観点からは本案のほうが安定している。", {
    x: M + 5.70, y: 5.94, w: CW - 6.00, h: 0.66, margin: 0,
    fontFace: SANS, fontSize: 9, color: MUTED, lineSpacingMultiple: 1.25,
  });
  s.addNotes("30%案は1年目30%/2年目70%・上昇0%・値引き5%で▲244万。25%案なら+106万。");
}

// ═══════════════════════════════════════════ 12 24ヶ月時点
{
  const s = chrome(base(), "END OF TERM", "契約期間（2年）の満了時の扱い",
    "24ヶ月時点で売却が完了していない場合の取り扱いを、契約上あらかじめ定めておく。");

  const hw = (CW - 0.30) / 2;
  card(s, M, 1.78, hw, 2.40, { fill: CARD2, line: GOLD_D });
  s.addText("WineBankが引き取る", {
    x: M + 0.28, y: 1.92, w: hw - 0.56, h: 0.28, margin: 0,
    fontFace: SANS, fontSize: 13, bold: true, color: GOLD_L,
  });
  s.addText("24ヶ月時点で残っている在庫を、WineBankが簿価＋" + pct(D.tiers_main[2].rate, 0) + "、もしくはその時点での市況を踏まえた協議により引き取る。これにより、貴社は売れ残りリスクを負わない。", {
    x: M + 0.28, y: 2.28, w: hw - 0.56, h: 0.60, margin: 0,
    fontFace: SANS, fontSize: 10, color: MUTED, lineSpacingMultiple: 1.3,
  });
  table(s, [
    [th("24ヶ月時点の残存"), th("簿価"), th("＋" + pct(D.tiers_main[2].rate, 0) + "での引き取り額")],
    ...D.residual_cost.map((r) => [
      td(pct(r.res, 0)), td(man(r.book) + "円"),
      td(man(r.pay30) + "円", { bold: true, color: GOLD_L }),
    ]),
  ], M + 0.28, 2.92, hw - 0.56, [1.74, 1.60, 1.90], { rowH: 0.30, fontSize: 9 });

  card(s, M + hw + 0.30, 1.78, hw, 2.40);
  s.addText("引き取り後のWineBankの採算", {
    x: M + hw + 0.58, y: 1.92, w: hw - 0.56, h: 0.28, margin: 0,
    fontFace: SANS, fontSize: 13, bold: true, color: IVORY,
  });
  s.addText("引き取った在庫はWineBankの資産として残るため即時の損失ではないが、取得原価が押し上がる。定価100あたりで見ると次のとおり。", {
    x: M + hw + 0.58, y: 2.28, w: hw - 0.56, h: 0.44, margin: 0,
    fontFace: SANS, fontSize: 9.5, color: MUTED, lineSpacingMultiple: 1.25,
  });
  table(s, [
    [th("引き取り率"), th("前提"), th("取得原価"), th("2年後の手取り"), th("単位粗利")],
    ...D.residual_main.map((r) => [
      td("＋" + pct(D.tiers_main[2].rate, 0)), td(r.tag), td(num(r.cost)), td(num(r.net)),
      td((r.gross >= 0 ? "＋" : "▲") + num(Math.abs(r.gross)),
         { bold: true, color: r.gross < 0 ? RED : GOLD_L }),
    ]),
  ], M + hw + 0.58, 2.90, hw - 0.56, [1.16, 1.02, 1.02, 1.30, 0.74], { rowH: 0.32, fontSize: 8.5 });

  card(s, M, 4.34, CW, 1.90, { fill: CARD2, line: GOLD_D });
  s.addText("引き取り条件は「＋" + pct(D.tiers_main[2].rate, 0) + "もしくは要協議」とし、上限を設けることをご提案します。", {
    x: M + 0.30, y: 4.46, w: 6.60, h: 0.28, margin: 0,
    fontFace: SANS, fontSize: 12, bold: true, color: GOLD_L,
  });
  s.addText("ワイン価格が上昇していれば引き取り後も薄いながら黒字だが、横ばいだと引き取った時点で逆ざやとなる（上表）。WineBankが無条件に全量を＋" + pct(D.tiers_main[2].rate, 0) + "で引き取る建て付けとすると、売れ残りが大きい局面でWineBankが立ち行かなくなり、かえって貴社のリスクとなる。そこで、引き取りは「＋" + pct(D.tiers_main[2].rate, 0) + "もしくはその時点の市況を踏まえた協議」とし、あわせて無条件の引き取り義務に上限（例：ご投資額の20%まで）を設けることをご提案したい。上限を超える部分については①契約期間を延長して販売を継続する、②貴社に現物をお引き渡しする、のいずれかを選択いただく建て付けとする。", {
    x: M + 0.30, y: 4.84, w: CW - 0.60, h: 1.24, margin: 0,
    fontFace: SANS, fontSize: 10, color: MUTED, lineSpacingMultiple: 1.35,
  });

  note(s, "※ 引き取り率「＋" + pct(D.tiers_main[2].rate, 0) + "もしくは要協議」は倉持様よりご提示いただいた条件。上限を設ける点はWineBank側からのご提案であり、ご提示内容には含まれていない。引き取りを「義務」とするか「WineBankのオプション」とするかで、貴社の想定IRRが確定するか否かが変わるため、契約書作成前に確定させたい。", 6.36);
  s.addNotes("残存の扱いは未確定。義務か上限つきか。WB側の提案として明示。");
}

// ═══════════════════════════════════════════ 13 費用の前提
{
  const s = chrome(base(), "COST", "費用の前提",
    "貴社にご負担いただくのは倉庫費・保険料のみ。販売にかかる費用はすべてWineBankが負担する。");

  const hw = (CW - 0.30) / 2;
  card(s, M, 1.78, hw, 2.60, { fill: CARD2, line: GOLD_D });
  s.addText("貴社のご負担", {
    x: M + 0.28, y: 1.92, w: hw - 0.56, h: 0.28, margin: 0,
    fontFace: SANS, fontSize: 13, bold: true, color: GOLD_L,
  });
  table(s, [
    [th("項目"), th("金額"), th("備考")],
    [td("倉庫費・保険料（1年目）"), td(man(D.carry_y1) + "円", { bold: true, color: GOLD_L }),
     td("定温倉庫での保管と動産総合保険", { align: "left" })],
    [td("倉庫費・保険料（2年目）"), td(man(D.carry_y2) + "円", { bold: true, color: GOLD_L }),
     td("在庫の減少を織り込んだ水準", { align: "left" })],
    [td("2年合計"), td(man(D.carry_y1 + D.carry_y2) + "円", { bold: true }),
     td("ご投資額に対して " + pct((D.carry_y1 + D.carry_y2) / D.capital) + "（2年通算）", { align: "left" })],
  ], M + 0.28, 2.30, hw - 0.56, [2.10, 1.30, 1.84], { rowH: 0.36, fontSize: 9 });
  s.addText("貴社が倉庫と直接ご契約いただくことで、所有に関わる権利を完全に保有いただき、WineBankの他の資産と混同されることを避ける。", {
    x: M + 0.28, y: 3.84, w: hw - 0.56, h: 0.44, margin: 0,
    fontFace: SANS, fontSize: 9, color: MUTED, lineSpacingMultiple: 1.2,
  });

  card(s, M + hw + 0.30, 1.78, hw, 2.60);
  s.addText("WineBankの負担", {
    x: M + hw + 0.58, y: 1.92, w: hw - 0.56, h: 0.28, margin: 0,
    fontFace: SANS, fontSize: 13, bold: true, color: IVORY,
  });
  table(s, [
    [th("項目"), th("料率"), th("備考")],
    [td("変動販売費"), td(pct(D.var_rate, 2)),
     td("モール・出品5.5%／カード決済3.2%／出庫・梱包2.5% の加重", { align: "left" })],
    [td("人件費"), td(pct(D.labor_rate, 1)),
     td("調達・保管管理・販売の実務に係る人員コスト", { align: "left" })],
    [td("入庫・検品"), td("実費"),
     td("入庫時の検品・棚入れ", { align: "left" })],
  ], M + hw + 0.58, 2.30, hw - 0.56, [1.60, 1.10, 2.54], { rowH: 0.36, fontSize: 9 });
  s.addText("いずれも売上に対する料率であり、貴社のリターンには影響しない。WineBankが所定率を上回る価格で販売できるかどうかは、WineBank側の責任範囲となる。", {
    x: M + hw + 0.58, y: 3.84, w: hw - 0.56, h: 0.44, margin: 0,
    fontFace: SANS, fontSize: 9, color: MUTED, lineSpacingMultiple: 1.2,
  });

  card(s, M, 4.54, CW, 1.70, { fill: CARD2, line: GOLD_D });
  s.addText("SPC・匿名組合を用いないことで、年660万円の維持費と組成の手間がなくなります。", {
    x: M + 0.30, y: 4.64, w: CW - 0.60, h: 0.28, margin: 0,
    fontFace: SANS, fontSize: 12, bold: true, color: GOLD_L,
  });
  const bw = (CW - 0.60 - 0.30 * 2) / 3;
  const gone = [
    ["SPC維持費", "年200万円", "税務・事務受託・法務"],
    ["SPC人件費・予備費", "年410万円", "SPC運営に係る実務人件費と予備費"],
    ["AUP（合意された手続）", "年50万円", "公認会計士による外部検証"],
  ];
  gone.forEach((c, i) => {
    const x = M + 0.30 + (bw + 0.30) * i;
    s.addText(c[0], {
      x: x, y: 5.02, w: bw, h: 0.22, margin: 0,
      fontFace: SANS, fontSize: 9.5, color: GOLD,
    });
    s.addText(c[1], {
      x: x, y: 5.24, w: bw, h: 0.32, margin: 0,
      fontFace: LATIN, fontSize: 17, bold: true, color: IVORY,
    });
    s.addText(c[2], {
      x: x, y: 5.60, w: bw, h: 0.44, margin: 0,
      fontFace: SANS, fontSize: 8.5, color: MUTED, lineSpacingMultiple: 1.2,
    });
  });

  note(s, "※ 現物の直接所有であり金融商品取引法上のファンド持分に該当しないため、適格機関投資家等特例業務の届出も要しない。倉庫費・保険料の実額は在庫の残存に応じて変動するが、本資料では貴社よりご提示いただいた年額固定（1年目" + man(D.carry_y1) + "円・2年目" + man(D.carry_y2) + "円）で保守的に計上している。", 6.36);
  s.addNotes("投資家負担は倉庫費・保険料のみ。SPC費用660万が不要。");
}

// ═══════════════════════════════════════════ 14 在庫の管理
{
  const s = chrome(base(), "SEGREGATION", "在庫の分別管理とご報告",
    "貴社の所有物であることを、帳簿と現物の両面で明確にする。");

  const cw3 = (CW - 0.30 * 2) / 3;
  const items = [
    ["01", "名義と保管場所を分ける", "現物は貴社名義で保有し、WineBankの債権者から隔離される。倉庫内では別ロケーション・別ラベルで管理し、WineBank自己勘定の在庫と物理的に分ける。今後この形態の取引を継続する場合にも、棚を分けた運用を前提とする。", true],
    ["02", "毎月、保有リストをご報告", "SKU別に、期首在庫・当月売却・期末在庫・簿価を記載した保有リストを毎月ご提出する。売却が成立したぶんは同じ月に精算し、ご指定口座へお振込みする。", false],
    ["03", "配分は在庫比率のプロラタ", "同一銘柄が貴社在庫とWineBank自己勘定の双方にある場合、売却を在庫数量の比率に応じて配分する。累計配分比率と在庫比率の乖離を毎月の報告に含める。", false],
  ];
  items.forEach((c, i) => {
    const x = M + (cw3 + 0.30) * i;
    card(s, x, 1.78, cw3, 2.06, { fill: c[3] ? CARD2 : CARD, line: c[3] ? GOLD_D : LINE });
    badge(s, x + 0.26, 1.96, 0.30, c[0], { size: 9 });
    s.addText(c[1], {
      x: x + 0.66, y: 1.94, w: cw3 - 0.92, h: 0.28, margin: 0,
      fontFace: SANS, fontSize: 11.5, bold: true, color: c[3] ? GOLD_L : IVORY,
    });
    s.addText(c[2], {
      x: x + 0.26, y: 2.38, w: cw3 - 0.52, h: 1.32, margin: 0,
      fontFace: SANS, fontSize: 9.5, color: MUTED, lineSpacingMultiple: 1.3,
    });
  });

  const rows = [
    [th("ご報告の内容"), th("頻度"), th("内容")],
    [td("保有リスト"), td("毎月"), td("SKU別の期首在庫・当月売却・期末在庫・簿価", { align: "left" })],
    [td("精算明細"), td("毎月"), td("当月の売却数量・簿価・上乗せ率・精算額・お振込み額", { align: "left" })],
    [td("配分台帳"), td("毎月"), td("WineBank自己勘定との累計配分比率と在庫比率の乖離", { align: "left" })],
    [td("倉庫の棚卸"), td("四半期"), td("第三者による棚卸を実施し、結果をご報告", { align: "left" })],
    [td("契約上の権利"), td("随時"), td("会計帳簿・請求書・契約書・銀行取引記録の閲覧および調査権", { align: "left" })],
  ];
  table(s, rows, M, 4.04, CW, [2.40, 1.40, 8.09], { rowH: 0.34, fontSize: 9 });

  note(s, "※ 現物は貴社名義で保有されるため、器（SPC・匿名組合）を介する場合よりも倒産隔離は強固となる。倉庫費・保険料を貴社が直接ご契約いただくことで、所有に関わる権利を完全に保有いただく建て付けとしている。", 6.16);
  s.addNotes("分別管理。毎月の保有リストと精算明細。四半期の第三者棚卸。");
}

// ═══════════════════════════════════════════ 15 リスク
{
  const s = chrome(base(), "RISK", "想定されるリスクと対応策", null);

  const cw4 = (CW - 0.26 * 3) / 4;
  const risks = [
    ["免許・商流リスク", "販売方法の適法性", "委託販売型・再買取型の2案を所轄税務署の酒類指導官および顧問弁護士に提示し、貴社側に酒類販売業免許が不要と整理できる方を採用する。契約書作成前に確定させる。"],
    ["売れ残りリスク", "24ヶ月で売却が完了しない", "WineBankが簿価＋所定率で引き取る建て付けとする。ただし引き取り義務には上限を設け、超過分は期間延長または現物のお引き渡しとする（前掲）。"],
    ["カウンターパーティリスク", "WineBankの信用・実行力", "現物は貴社名義で保有されるため、WineBankの債権者から隔離される。販売先が代金を支払わない場合の貸倒れは、売主であるWineBankが負担する。"],
    ["価格変動リスク", "Fine Wine市況の下落・停滞", "貴社のリターンは保有期間だけで決まるため、市況の影響を受けない。影響を受けるのはWineBank側の取り分のみとなる。"],
    ["流動性リスク", "現物のため即時換金できない", "現物への投資であり、換金には販売を要する。契約期間中の中途解約には応じられない設計としている。急な資金需要に備える性格の投資ではない点をご了解いただきたい。"],
    ["調達リスク", "想定価格・数量で仕入れられない", "インポーター・酒販店との年間調達枠を事前に締結する。調達実績は毎月の保有リストでご確認いただける。"],
    ["オペレーションリスク", "保管中の破損・劣化・盗難", "定温倉庫での保管と動産総合保険による全量付保。保険料は倉庫費とあわせて貴社にご負担いただく。四半期ごとに第三者棚卸を実施する。"],
    ["税務リスク", "取得時" + pct(D.acq_markup, 0) + "・委託販売の取扱い", "譲渡価格の算定根拠を文書化し、第三者卸価格との比較資料を年次で整備する。委託販売では税務上の売上が委託者に立つため、消費税の取扱いは貴社顧問税理士にご確認いただきたい。"],
  ];
  risks.forEach((r, i) => {
    const col = i % 4, row = Math.floor(i / 4);
    const x = M + (cw4 + 0.26) * col;
    const y = 1.62 + row * 2.42;
    card(s, x, y, cw4, 2.20);
    s.addText(r[0], {
      x: x + 0.24, y: y + 0.16, w: cw4 - 0.48, h: 0.30, margin: 0,
      fontFace: SANS, fontSize: 11, bold: true, color: IVORY,
    });
    s.addText(r[1], {
      x: x + 0.24, y: y + 0.48, w: cw4 - 0.48, h: 0.36, margin: 0,
      fontFace: SANS, fontSize: 9, color: GOLD, lineSpacingMultiple: 1.15,
    });
    s.addText(r[2], {
      x: x + 0.24, y: y + 0.90, w: cw4 - 0.48, h: 1.18, margin: 0,
      fontFace: SANS, fontSize: 8.5, color: MUTED, lineSpacingMultiple: 1.25,
    });
  });
  s.addNotes("リスク8項目。価格変動リスクは投資家に及ばない設計。");
}

// ═══════════════════════════════════════════ 16 ご投資条件
{
  const m = PM(MAIN);
  const s = chrome(base(), "TERMS", "ご投資条件（ドラフト）",
    "取得・所有・販売の枠組み（左）と、リターン・費用・報告（右）に分けて記載する。");

  const hw = (CW - 0.30) / 2;
  const left = [
    [th("項目"), th("内容")],
    [td("形態"), td("ワイン現物の直接所有。SPC・匿名組合を組成しない", { align: "left", color: GOLD_L, bold: true })],
    [td("ご投資額"), td(oku(D.capital) + "円（全額をワイン現物に充当）", { align: "left", color: GOLD_L, bold: true })],
    [td("契約期間"), td("最長2年。1年で多くを売り切ることを前提とする", { align: "left", color: GOLD_L, bold: true })],
    [td("取得"), td("WineBankが市中原価に" + pct(D.acq_markup, 0) + "を付して譲渡。所有権・名義が貴社へ移転", { align: "left" })],
    [td("販売"), td("A 委託販売型 または B 再買取型。いずれも貴社は営業・価格交渉・受注・請求・回収を行わない", { align: "left" })],
    [td("販売チャネル"), td("酒販店卸（B2B）と自社EC・オークション（B2C）", { align: "left" })],
    [td("中途解約"), td("契約期間中の中途解約には応じられない", { align: "left" })],
    [td("期間満了時"), td("残存在庫はWineBankが簿価＋" + pct(D.tiers_main[2].rate, 0) + "、もしくは要協議で引き取る（上限は要協議）", { align: "left" })],
  ];
  table(s, left, M, 1.78, hw, [1.55, 4.25], { rowH: 0.42, fontSize: 8.5 });

  const right = [
    [th("項目"), th("内容")],
    [td("投資家の取り分"), td(TIER_TXT, { align: "left", color: GOLD_L, bold: true })],
    [td("判定基準"), td("取得から売却成立までの保有期間。WineBankの販売価格は影響しない", { align: "left", color: GOLD_L, bold: true })],
    [td("精算"), td("毎月。当月に売却が成立したぶんをご指定口座へお振込み", { align: "left", color: GOLD_L, bold: true })],
    [td("貴社のご負担"), td("倉庫費・保険料のみ（1年目" + man(D.carry_y1) + "円／2年目" + man(D.carry_y2) + "円）。貴社が倉庫と直接契約", { align: "left" })],
    [td("WineBankの負担"), td("変動販売費" + pct(D.var_rate, 2) + "・人件費" + pct(D.labor_rate, 1) + "・入庫検品。いずれも貴社のリターンに影響しない", { align: "left" })],
    [td("想定リターン"), td("IRR " + pct(m.irr) + "（1年目80%・2年目20%で売却の場合）／純利益 " + man(m.profit) + "円", { align: "left", color: GOLD_L, bold: true })],
    [td("報告"), td("毎月：保有リスト・精算明細・配分台帳／四半期：第三者棚卸", { align: "left" })],
    [td("在庫配分"), td("在庫比率によるプロラタを原則とし、乖離を毎月開示する", { align: "left" })],
  ];
  table(s, right, M + hw + 0.30, 1.78, hw, [1.55, 4.25], { rowH: 0.42, fontSize: 8.5 });

  card(s, M, 5.92, CW, 0.88, { fill: CARD2, line: GOLD_D });
  s.addText("計算は「簿価×所定率」だけ。販売価格からの逆算は発生しません。", {
    x: M + 0.30, y: 6.02, w: 6.40, h: 0.26, margin: 0,
    fontFace: SANS, fontSize: 11, bold: true, color: GOLD_L,
  });
  s.addText("貴社にご確認いただくのは、毎月の保有リストと精算明細（売却数量・簿価・保有期間・上乗せ率・お振込み額）のみとなる。", {
    x: M + 6.90, y: 6.00, w: CW - 7.20, h: 0.60, margin: 0,
    fontFace: SANS, fontSize: 9, color: MUTED, lineSpacingMultiple: 1.25,
  });
  s.addNotes("条件ドラフト。主線IRR15.7%。期間満了時の引き取り上限は要協議。");
}

// ═══════════════════════════════════════════ 17 今後の進め方
{
  const s = chrome(base(), "NEXT STEPS", "今後の進め方", null);

  const cw5 = (CW - 0.26 * 4) / 5;
  const steps = [
    ["01", "前提条件のすり合わせ", "上乗せ率（1年目" + pct(D.tiers_main[0].rate, 0) + "・2年目" + pct(D.tiers_main[1].rate, 0) + "）、契約期間、期間満了時の引き取り条件と上限についてご意見をいただく。", true],
    ["02", "免許・税務の確定", "委託販売型・再買取型の2案を所轄税務署の酒類指導官および顧問弁護士に提示し、採用する方式を確定する。消費税の取扱いもあわせて確認する。", true],
    ["03", "調達枠の確保", "インポーター・酒販店との年間調達枠を締結する。組入銘柄はLiv-ex掲載の流動性上位銘柄を中心に選定する。", false],
    ["04", "契約書の作成", "売買契約・委託販売契約（または再買取契約）・別紙（保有リストと精算／在庫配分／情報開示／期間満了時の扱い）を作成する。", false],
    ["05", "取得・運用開始", "ご入金に合わせて調達・取得を開始。翌月から毎月、保有リストのご報告と精算を行う。", false],
  ];
  steps.forEach((c, i) => {
    const x = M + (cw5 + 0.26) * i;
    card(s, x, 1.76, cw5, 2.62, { fill: c[3] ? CARD2 : CARD, line: c[3] ? GOLD_D : LINE });
    badge(s, x + 0.26, 1.96, 0.36, c[0], { size: 10 });
    s.addText(c[1], {
      x: x + 0.26, y: 2.50, w: cw5 - 0.52, h: 0.52, margin: 0,
      fontFace: SANS, fontSize: 11.5, bold: true, color: c[3] ? GOLD_L : IVORY,
      lineSpacingMultiple: 1.15,
    });
    s.addText(c[2], {
      x: x + 0.26, y: 3.10, w: cw5 - 0.52, h: 1.14, margin: 0,
      fontFace: SANS, fontSize: 8.5, color: MUTED, lineSpacingMultiple: 1.3,
    });
  });

  card(s, M, 4.72, CW, 1.36, { fill: CARD2, line: GOLD_D });
  s.addText("先にご確認をお願いしたい点", {
    x: M + 0.30, y: 4.84, w: 6, h: 0.24, margin: 0,
    fontFace: SANS, fontSize: 10.5, bold: true, color: GOLD_L,
  });
  const asks = [
    ["2年目の上乗せ率", "本案の" + pct(D.tiers_main[1].rate, 0) + "では売却が2年目にずれ込むほどIRRが下がる。厚くすればIRRは揃うが、WineBankの下振れ耐性は下がる。"],
    ["期間満了時の引き取り", "＋" + pct(D.tiers_main[2].rate, 0) + "とするか要協議とするか。WineBankの義務とするかオプションとするか。義務とする場合の上限をどこに置くか。"],
    ["ご投資の継続性", "1回限りとされるか、償還資金を次の仕入に充ててローリングで継続されるか。"],
  ];
  asks.forEach((a, i) => {
    const x = M + 0.30 + (CW - 0.60) / 3 * i;
    s.addText("● " + a[0], {
      x: x, y: 5.14, w: (CW - 0.60) / 3 - 0.24, h: 0.22, margin: 0,
      fontFace: SANS, fontSize: 9.5, bold: true, color: GOLD,
    });
    s.addText(a[1], {
      x: x, y: 5.36, w: (CW - 0.60) / 3 - 0.24, h: 0.56, margin: 0,
      fontFace: SANS, fontSize: 8.5, color: MUTED, lineSpacingMultiple: 1.25,
    });
  });

  note(s, "本資料の数値は一定の前提に基づく試算であり、将来の運用成果を保証するものではありません。最終的な条件は契約書に基づきます。免許・税務の取扱いは、所轄官庁および専門家の確認を経て確定します。", 6.28);
  s.addNotes("次のステップ。上乗せ率・引き取り・継続性が要確認。");
}

// ═══════════════════════════════════════════ 18 まとめ
{
  const m = PM(MAIN);
  const s = chrome(base(), "CONCLUSION", "まとめ：本ご提案の意義", null);

  const hw = CW * 0.56;
  const pts = [
    ["01", "計算がシンプルです",
     "簿価に保有期間に応じた率を掛けるだけ。販売価格からの逆算も、販売費や人件費の按分も、利益配分の計算も発生しない。ご確認いただくのは毎月の保有リストと精算明細のみ。"],
    ["02", "価格変動リスクを負いません",
     "ワイン市況が下落しても、値引き販売が必要になっても、貴社への精算額は変わらない。影響を受けるのはWineBank側の取り分のみとなる。"],
    ["03", "1年で売り切るほどリターンが高くなります",
     "1年以内に売り切れれば想定IRR " + pct(PM("1年以内に100%売却").irr) + "。上乗せ率は1年目" + pct(D.tiers_main[0].rate, 0) + "・2年目" + pct(D.tiers_main[1].rate, 0) + "の2段階で、早期の売却がそのままリターンにつながる。"],
    ["04", "所有権が貴社に完全に残ります",
     "現物は貴社名義で保有され、倉庫も貴社が直接ご契約いただく。WineBankの他の資産と混同されることがなく、器を介する場合より倒産隔離は強固。"],
    ["05", "他社が再現できない調達力",
     "創業55年の酒販免許、大手インポーターとの直接取引、輸出入ライセンス。新規参入業者が正規品を同じ値で大量に仕入れることはできない。"],
  ];
  let y = 1.62;
  pts.forEach((p, i) => {
    const hl = i === 0;
    card(s, M, y, hw, 0.88, { fill: hl ? CARD2 : CARD, line: hl ? GOLD_D : LINE });
    badge(s, M + 0.24, y + 0.14, 0.30, p[0], { size: 9 });
    s.addText(p[1], {
      x: M + 0.66, y: y + 0.10, w: hw - 0.92, h: 0.26, margin: 0,
      fontFace: SANS, fontSize: 11.5, bold: true, color: hl ? GOLD_L : IVORY,
    });
    s.addText(p[2], {
      x: M + 0.66, y: y + 0.38, w: hw - 0.92, h: 0.42, margin: 0,
      fontFace: SANS, fontSize: 8.5, color: MUTED, lineSpacingMultiple: 1.2,
    });
    y += 0.94;
  });

  const rx = M + hw + 0.30, rw = CW - hw - 0.30;
  card(s, rx, 1.62, rw, 4.64, { fill: CARD2, line: GOLD_D });
  s.addText("主線の数字", {
    x: rx + 0.28, y: 1.76, w: rw - 0.56, h: 0.28, margin: 0,
    fontFace: SANS, fontSize: 12.5, bold: true, color: GOLD_L,
  });
  const facts = [
    ["ご投資額", oku(D.capital) + "円", "現物を貴社名義で直接ご所有"],
    ["想定IRR（年率）", pct(m.irr), "1年目80%・2年目20%で売却の場合"],
    ["純利益（2年通算）", man(m.profit) + "円", "受取総額 " + man(m.recv) + "円 − 元本 − 倉庫費 " + man(m.carry) + "円"],
    ["上乗せ率", D.tiers_main.map((t) => "＋" + pct(t.rate, 0)).join(" ／ "), "12ヶ月以内 ／ 13〜24ヶ月 ／ 24ヶ月超（残存）"],
  ];
  let cy = 2.10;
  facts.forEach((c) => {
    s.addShape(pres.ShapeType.ellipse, {
      x: rx + 0.30, y: cy + 0.07, w: 0.10, h: 0.10,
      fill: { color: GOLD }, line: { color: GOLD, width: 0 },
    });
    s.addText(c[0], {
      x: rx + 0.52, y: cy - 0.02, w: rw - 0.82, h: 0.22, margin: 0,
      fontFace: SANS, fontSize: 10, color: IVORY,
    });
    s.addText(c[1], {
      x: rx + 0.52, y: cy + 0.20, w: rw - 0.82, h: 0.40, margin: 0,
      fontFace: LATIN, fontSize: c[1].length > 12 ? 15 : 20, bold: true, color: GOLD_L,
    });
    s.addText(c[2], {
      x: rx + 0.52, y: cy + 0.60, w: rw - 0.82, h: 0.34, margin: 0,
      fontFace: SANS, fontSize: 8.5, color: MUTED, lineSpacingMultiple: 1.2,
    });
    cy += 1.02;
  });

  s.addText("ワインは飲めば消える嗜好品ではなく、正規流通の価格差という再現性のある収益源です。その価格差を取りに行く実務を、55年分の免許と取引関係で担うのがWineBankです。本ご提案では、その実務にともなう価格変動リスクをWineBankが引き受け、貴社には保有期間に応じた固定のリターンをお支払いします。", {
    x: M, y: 6.42, w: CW, h: 0.44, margin: 0,
    fontFace: SANS, fontSize: 9.5, color: MUTED, lineSpacingMultiple: 1.3,
  });
  s.addNotes("まとめ。計算の単純さ・価格変動リスクなし・IRRが揃う・所有権が残る・調達力。");
}

// ═══════════════════════════════════════════ 19 裏表紙
{
  const s = base();
  page += 1;
  s.addShape(pres.ShapeType.ellipse, {
    x: 8.9, y: -2.4, w: 6.6, h: 6.6,
    fill: { color: BG }, line: { color: GOLD_D, width: 0.9 },
  });
  s.addShape(pres.ShapeType.ellipse, {
    x: -2.6, y: 1.6, w: 5.4, h: 5.4,
    fill: { color: BG }, line: { color: "1E1A15", width: 1.1 },
  });
  s.addText("すべての人にファインワインを", {
    x: M, y: 2.86, w: CW, h: 0.72, margin: 0, align: "center",
    fontFace: SERIF, fontSize: 30, bold: true, color: IVORY,
  });
  s.addText("Wine × Technology", {
    x: M, y: 3.56, w: CW, h: 0.34, margin: 0, align: "center",
    fontFace: LATIN, fontSize: 13, bold: true, color: GOLD, charSpacing: 4.5,
  });
  s.addText("株式会社WineBank", {
    x: M, y: 4.52, w: CW, h: 0.34, margin: 0, align: "center",
    fontFace: SERIF, fontSize: 15, bold: true, color: GOLD_L,
  });
  s.addText("創業1970年　／　東京都港区六本木4-12-8 第6DMJビル 2階", {
    x: M, y: 4.88, w: CW, h: 0.28, margin: 0, align: "center",
    fontFace: SANS, fontSize: 9.5, color: DIM,
  });
  s.addText("CONFIDENTIAL ｜ 株式会社WineBank", {
    x: M, y: H - 0.46, w: 5.5, h: 0.24, margin: 0,
    fontFace: SANS, fontSize: 8.5, color: DIM,
  });
  s.addText(String(page).padStart(2, "0"), {
    x: W - M - 1.0, y: H - 0.46, w: 1.0, h: 0.24, margin: 0, align: "right",
    fontFace: LATIN, fontSize: 9.5, color: GOLD_D, charSpacing: 1.5,
  });
}

pres.writeFile({ fileName: "WineBank_ワイン現物投資のご提案_倉持案_固定リターン型_1億円_20260821.pptx" })
  .then((f) => console.log("written:", f));
