// 山本案（現物出資型）提案資料
// 数値は structure.py が書き出す figures.json を読む。手打ちしない。
const fs = require("fs");
const pptxgen = require("pptxgenjs");

const F = JSON.parse(fs.readFileSync(__dirname + "/figures.json", "utf8"));
const C1 = F.first;                 // ファーストクローズ 5億円
const C2 = F.second;                // セカンドクローズ 10億円
const P1 = C1.holds["12"];          // 主線（回転12ヶ月）
const P2 = C2.holds["12"];
const UN = F.unit["ニュートラル"];
const UH = F.unit_held["ニュートラル"];
const HOLDS = ["9", "12", "15", "18"];

// ─────────────────────────────────────────── 数値フォーマッタ
const oku   = (v) => (v / 1e8).toFixed(2) + "億";
const okuN  = (v) => (v / 1e8).toFixed(0) + "億";
const hyaku = (v) => Math.round(v / 1e6) + "百万";
const man   = (v) => Math.round(v / 1e4).toLocaleString() + "万";
const pc    = (v) => (v * 100).toFixed(1) + "%";
const pt    = (v) => (v >= 0 ? "＋" : "▲") + Math.abs(v * 100).toFixed(1) + "pt";
const mon   = (v) => v.toFixed(1) + "ヶ月";
const f2    = (v) => v.toFixed(2);

// ─────────────────────────────────────────── palette / type
const BG      = "0C0C0C";   // 背景
const CARD    = "171614";   // カード
const CARD2   = "1F1D19";   // カード（強調）
const LINE    = "2E2A24";   // 罫
const GOLD    = "A78450";   // ブランドゴールド
const GOLD_L  = "C9A96E";   // ライトゴールド
const GOLD_D  = "6E5730";   // ダークゴールド
const IVORY   = "EFEBE3";   // 主要テキスト
const MUTED   = "9A938A";   // 補助テキスト
const DIM     = "6E675E";   // 極薄テキスト
const RED     = "B4553F";   // 下振れ

const SERIF = "Yu Mincho";  // 見出し（游明朝）
const SANS  = "Yu Gothic";  // 本文（游ゴシック）
const LATIN = "Cambria";    // 英字・数値

const W = 13.333, H = 7.5;
const M = 0.72;                       // 左右マージン
const CW = W - M * 2;                 // コンテンツ幅

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.author = "株式会社WineBank";
pres.company = "株式会社WineBank";
pres.title = "ワインファンド（SPC）組成のご提案";

let page = 0;

// ─────────────────────────────────────────── helpers
function base(dark = true) {
  const s = pres.addSlide();
  s.background = { color: dark ? BG : BG };
  return s;
}

function chrome(s, eyebrow, title, lead) {
  page += 1;
  s.addText(eyebrow, {
    x: M, y: 0.42, w: CW, h: 0.24, margin: 0,
    fontFace: LATIN, fontSize: 10.5, bold: true, color: GOLD,
    charSpacing: 3.4,
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

// カード（塗り＋細枠）
function card(s, x, y, w, h, opt = {}) {
  s.addShape(pres.ShapeType.roundRect, {
    x, y, w, h, rectRadius: 0.045,
    fill: { color: opt.fill || CARD },
    line: { color: opt.line || LINE, width: 0.75 },
  });
}

// ゴールドの丸バッジ（本デッキの共通モチーフ）
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

// 大きな数値タイル
function stat(s, x, y, w, h, value, unit, label, note, opt = {}) {
  card(s, x, y, w, h, { fill: opt.fill || CARD, line: opt.line || LINE });
  s.addText(
    [
      { text: value, options: { fontFace: LATIN, fontSize: opt.vs || 34, bold: true, color: opt.color || GOLD_L } },
      { text: unit ? " " + unit : "", options: { fontFace: SANS, fontSize: 12.5, bold: true, color: opt.color || GOLD_L } },
    ],
    { x: x + 0.26, y: y + 0.20, w: w - 0.52, h: 0.62, margin: 0, valign: "middle" }
  );
  s.addText(label, {
    x: x + 0.26, y: y + 0.84, w: w - 0.52, h: 0.26, margin: 0,
    fontFace: SANS, fontSize: 11, bold: true, color: IVORY,
  });
  if (note) {
    s.addText(note, {
      x: x + 0.26, y: y + 1.09, w: w - 0.52, h: 0.42, margin: 0,
      fontFace: SANS, fontSize: 9, color: MUTED, lineSpacingMultiple: 1.15,
    });
  }
}

// 表
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
  valAxisMaxVal: 40, valAxisMinVal: 0,
};

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
    x: M, y: 1.86, w: 5.20, h: 0.36, rectRadius: 0.04,
    fill: { color: CARD2 }, line: { color: GOLD_D, width: 1 },
  });
  s.addText("山本案｜WineBank現物出資60%＋投資家出資40%", {
    x: M, y: 1.86, w: 5.20, h: 0.36, margin: 0, align: "center", valign: "middle",
    fontFace: SANS, fontSize: 11, bold: true, color: GOLD_L, charSpacing: 1.2,
  });
  s.addText("WINE FUND ｜ SPC PROPOSAL", {
    x: M, y: 2.42, w: 8.4, h: 0.28, margin: 0,
    fontFace: LATIN, fontSize: 11, bold: true, color: GOLD, charSpacing: 3.6,
  });
  s.addText("ワインファンド（SPC）", {
    x: M, y: 2.80, w: 8.6, h: 0.78, margin: 0,
    fontFace: SERIF, fontSize: 41, bold: true, color: IVORY,
  });
  s.addText("組成のご提案", {
    x: M, y: 3.56, w: 8.6, h: 0.78, margin: 0,
    fontFace: SERIF, fontSize: 41, bold: true, color: GOLD_L,
  });
  s.addText(`ファーストクローズ ${okuN(C1.total)}円 → 年度内セカンドクローズ ${okuN(C2.total)}円 ／ 運用期間5年 ／ 年1回分配`, {
    x: M, y: 4.52, w: 9.6, h: 0.3, margin: 0,
    fontFace: SANS, fontSize: 12.5, color: MUTED,
  });
  s.addText("2026年9月", {
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
    x: W - M - 3, y: H - 0.92, w: 3, h: 0.28, margin: 0, align: "right",
    fontFace: LATIN, fontSize: 9.5, bold: true, color: GOLD_D, charSpacing: 2.6,
  });
  s.addNotes("WineBankが総額の60%を現物出資し、投資家と同じ持分で損益を負う構成。ファーストクローズ5億円、年度内にセカンドクローズ10億円。");
}

// ═══════════════════════════════════════════════════════════ 02 サマリー
{
  const s = chrome(base(), "EXECUTIVE SUMMARY", "本ファンドの骨子",
    "実物ワインの流通価格差を収益源とする、現物裏付け型の短期回転ファンド。WineBankが総額の60%を現物で出資し、投資家と同じ持分で損益を負う。");

  const tw = (CW - 0.30 * 3) / 4;
  stat(s, M + (tw + 0.30) * 0, 1.82, tw, 1.62, "60", "%",
    "WineBankの現物出資比率",
    `ファーストクローズ総額${okuN(C1.total)}円のうち現物${okuN(C1.wb_capital)}円。現金拠出ではなく自己勘定在庫を拠出する`);
  stat(s, M + (tw + 0.30) * 1, 1.82, tw, 1.62, okuN(C1.inv_capital).replace("億", ""), "億円",
    "投資家出資（1stクローズ）",
    `1口5,000万円以上。年度内のセカンドクローズで投資家出資${okuN(C2.inv_capital)}円・総額${okuN(C2.total)}円へ`);
  stat(s, M + (tw + 0.30) * 2, 1.82, tw, 1.62, "12", "ヶ月",
    "在庫回転期間（主線）",
    "最短9ヶ月、延びても15〜18ヶ月を想定レンジとする");
  stat(s, M + (tw + 0.30) * 3, 1.82, tw, 1.62, pc(P1.inv_yld).replace("%", ""), "%",
    "投資家利回り（定常年間）",
    `出資${okuN(C1.inv_capital)}円に対する取分。5年通算の年平均は${pc(P1.avg5)}`,
    { vs: 30, fill: CARD2, line: GOLD_D });

  const pts = [
    ["WineBankが総額の60%を現物で出資し、同じ船に乗る。",
     `デットを廃し、WineBankが自己勘定のワイン現物${okuN(C1.wb_capital)}円を出資する。現金の拠出ではないが、投資家と同じ持分として損益をそのまま負う。値付けで抜く動機は構造的に生じない。`],
    ["在庫回転12ヶ月で売り切る。組入銘柄の選定と配分ルールで実現する。",
     `流動性の高い銘柄をSPCに組み入れる。回転12ヶ月に必要な年間販売額は${oku(P1.sales)}円。最短9ヶ月、延びても15〜18ヶ月を想定レンジとする。`],
    ["収益は「流通価格差」と「ワインの値上がり」の二階建て。",
     "同一商品の流通段階間の価格差（フロー）に加え、保有期間中の価格上昇年6%（ストック）が乗る。値上がり分は保有期間によらず利回りを底上げする。"],
    ["報酬は成功報酬（折半）と管理報酬年2%の二本立て。",
     `SPC税前利益のうち投資家出資分に帰属する分（40%）を投資家とWineBankで折半する。折半の定義は従来から変更していない。加えて総額の年2%（ファーストクローズで${hyaku(C1.mgmt)}円）を管理報酬として計上し、従来のSPC人件費360万円はこれに置き換える。`],
  ];
  let y = 3.72;
  pts.forEach((p, i) => {
    badge(s, M, y + 0.02, 0.30, String(i + 1).padStart(2, "0"), { size: 8.5 });
    s.addText(p[0], {
      x: M + 0.46, y: y - 0.02, w: CW - 0.46, h: 0.26, margin: 0,
      fontFace: SANS, fontSize: 12, bold: true, color: IVORY,
    });
    s.addText(p[1], {
      x: M + 0.46, y: y + 0.24, w: CW - 0.46, h: 0.34, margin: 0,
      fontFace: SANS, fontSize: 9.5, color: MUTED, lineSpacingMultiple: 1.12,
    });
    y += 0.70;
  });
  s.addNotes(`主線は回転12ヶ月で投資家利回り${pc(P1.inv_yld)}、5年通算の年平均${pc(P1.avg5)}。想定レンジ9〜18ヶ月では${pc(C1.holds["18"].inv_yld)}〜${pc(C1.holds["9"].inv_yld)}。`);
}

// ═══════════════════════════════════════════════════════════ 03 資本構成
{
  const s = chrome(base(), "CAPITAL STRUCTURE", "資本構成とリターンの配分",
    `総額${okuN(C1.total)}円をWineBankの現物出資${okuN(C1.wb_capital)}円（60%）と投資家出資${okuN(C1.inv_capital)}円（40%）で構成する。投資家に帰属する利益を折半する報酬体系は従来どおり。`);

  const bw = (CW - 0.30 * 2) / 3, by = 1.78;
  const tranches = [
    ["現物出資｜WineBank", (C1.wb_capital / 1e8).toFixed(1), "億円", "総額の60%（ワイン現物）",
     ["自己勘定のワイン現物を拠出", "現金の拠出ではない", "投資家と同じ持分として損益を負う"], false],
    ["出資｜投資家", (C1.inv_capital / 1e8).toFixed(1), "億円", "投資家帰属利益の50%を受領",
     ["匿名組合出資（1口5,000万円以上）", "満期に元本償還", "年1回分配（4年目以降は解約可）"], true],
    ["WineBank受取", String(Math.round(P1.wb_total / 1e6)), "百万円",
     `持分${Math.round(P1.wb_equity/1e6)}＋成功報酬${Math.round(P1.fee/1e6)}＋管理報酬${Math.round(P1.wb_mgmt/1e6)}（百万円）`,
     ["現物出資分の持分利益を受領", "成功報酬は投資家帰属利益の50%", "管理報酬は総額の年2%"], false],
  ];
  tranches.forEach((t, i) => {
    const x = M + (bw + 0.30) * i;
    card(s, x, by, bw, 1.86, { fill: t[5] ? CARD2 : CARD, line: t[5] ? GOLD_D : LINE });
    s.addText(t[0], { x: x + 0.26, y: by + 0.16, w: bw - 0.52, h: 0.26, margin: 0, fontFace: SANS, fontSize: 11.5, bold: true, color: t[5] ? GOLD_L : IVORY });
    s.addText([
      { text: t[1], options: { fontFace: LATIN, fontSize: 28, bold: true, color: GOLD_L } },
      { text: " " + t[2], options: { fontFace: SANS, fontSize: 12, bold: true, color: GOLD_L } },
    ], { x: x + 0.26, y: by + 0.44, w: bw - 0.52, h: 0.46, margin: 0, valign: "middle" });
    s.addText(t[3], { x: x + 0.26, y: by + 0.94, w: bw - 0.52, h: 0.24, margin: 0, fontFace: SANS, fontSize: 10, bold: true, color: IVORY });
    s.addText(t[4].map((v) => "・" + v).join("\n"), {
      x: x + 0.26, y: by + 1.18, w: bw - 0.52, h: 0.62, margin: 0,
      fontFace: SANS, fontSize: 9, color: MUTED, lineSpacingMultiple: 1.2 });
  });

  const rows = [
    [th("項目"), th("金額"), th("内容")],
    [td("年間税前利益（SPC）"), td(oku(P1.pretax) + "円", { bold: true }),
     td(`在庫回転12ヶ月・年間売上${oku(P1.sales)}円。管理報酬${hyaku(C1.mgmt)}円を費用計上した後の金額`, { align: "left" })],
    [td("├ 投資家帰属分（40%）"), td(hyaku(P1.attr) + "円"),
     td(`投資家出資${okuN(C1.inv_capital)}円÷総額${okuN(C1.total)}円＝40%。この分を投資家とWineBankで折半する`, { align: "left" })],
    [td("│　├ 投資家"), td(hyaku(P1.inv) + "円", { bold: true, color: GOLD_L }),
     td(`出資${okuN(C1.inv_capital)}円に対し 投資家利回り ${pc(P1.inv_yld)}`, { align: "left", color: GOLD_L, bold: true })],
    [td("│　└ WineBank"), td(hyaku(P1.fee) + "円"),
     td("投資家帰属利益の50%（成功報酬）。定義は従来から変更していない", { align: "left" })],
    [td("└ WineBank出資分帰属（60%）"), td(hyaku(P1.wb_equity) + "円"),
     td(`現物出資${okuN(C1.wb_capital)}円に対する持分。出資者として損益をそのまま負う`, { align: "left" })],
    [td("管理報酬"), td(hyaku(C1.mgmt) + "円"),
     td(`総額の年2%。従来のSPC人件費360万円に代えて計上。うち60%はWineBank自身の出資分に対応する自己負担分`, { align: "left" })],
  ];
  table(s, rows, M, 3.74, CW, [2.72, 1.78, 7.39], { rowH: 0.315, fontSize: 8.5 });

  card(s, M, 6.02, CW, 0.94, { fill: CARD2, line: GOLD_D });
  s.addText("前回資料（デット型）からの変更（回転12ヶ月）", { x: M + 0.30, y: 6.10, w: 5.6, h: 0.22, margin: 0, fontFace: SANS, fontSize: 10.5, bold: true, color: GOLD_L });
  s.addText([
    { text: "① 前回：デット2億＋エクイティ3億・折半 ", options: { fontFace: SANS, fontSize: 9.5, color: MUTED } },
    { text: pc(F.legacy.inv_yld), options: { fontFace: LATIN, fontSize: 12, bold: true, color: IVORY } },
    { text: "　→　② デットを廃しWineBank現物出資60%へ ", options: { fontFace: SANS, fontSize: 9.5, color: MUTED } },
    { text: pc(P1.inv_yld + F.params.mgmt_rate * F.params.success), options: { fontFace: LATIN, fontSize: 12, bold: true, color: IVORY } },
    { text: "　→　③ 管理報酬 年2% を新設 ", options: { fontFace: SANS, fontSize: 9.5, color: MUTED } },
    { text: pc(P1.inv_yld), options: { fontFace: LATIN, fontSize: 12, bold: true, color: GOLD_L } },
  ], { x: M + 0.30, y: 6.34, w: CW - 0.60, h: 0.24, margin: 0, valign: "middle" });
  s.addText(`※ 折半の定義は一貫して変更していない。投資家の取分＝SPC税前利益×出資比率40%×50%。管理報酬年2%の新設により投資家利回りは${pt(-F.params.mgmt_rate * F.params.success)}低下し、20%の分岐点は回転${mon(F.legacy.breakeven)}から回転${mon(C1.breakeven.neutral)}へ縮まる。現物出資するワインの評価方法は組成時の別途協議事項とし、本試算ではSPC取得原価を前回と同じ定価比${f2(UN.spc_cost)}に置いている。`, {
    x: M + 0.30, y: 6.60, w: CW - 0.60, h: 0.24, margin: 0, fontFace: SANS, fontSize: 8, color: DIM });

  s.addNotes(`投資家帰属分（40%）を折半。管理報酬2%の新設で${pc(P1.inv_yld)}。現物出資の評価方法は別途協議。`);
}

// ═══════════════════════════════════════════════════════════ 04 段階クローズ
{
  const s = chrome(base(), "STAGED CLOSING", "段階クローズ：5億円から始め、年度内に10億円へ",
    "同じ資本構成（WineBank現物出資60%＋投資家出資40%）のまま規模だけを拡大する。比率が同じため利回りはほぼ変わらない。");

  const cwid = (CW - 0.32) / 2;
  const closes = [
    ["FIRST CLOSE", "ファーストクローズ", C1, P1, "まず5億円で組成し、回転12ヶ月の実績を作る", true],
    ["SECOND CLOSE", "セカンドクローズ（年度内）", C2, P2, "販売実力の拡大を確認したうえで倍増する", false],
  ];
  closes.forEach((c, i) => {
    const x = M + (cwid + 0.32) * i;
    const C = c[2], P = c[3];
    card(s, x, 1.78, cwid, 1.98, { fill: c[5] ? CARD2 : CARD, line: c[5] ? GOLD_D : LINE });
    s.addText(c[0], { x: x + 0.28, y: 1.94, w: cwid - 0.56, h: 0.22, margin: 0, fontFace: LATIN, fontSize: 9.5, bold: true, color: GOLD, charSpacing: 2.4 });
    s.addText(c[1], { x: x + 0.28, y: 2.16, w: cwid - 0.56, h: 0.28, margin: 0, fontFace: SANS, fontSize: 12.5, bold: true, color: c[5] ? GOLD_L : IVORY });
    s.addText([
      { text: "総額 ", options: { fontFace: SANS, fontSize: 11, color: MUTED } },
      { text: okuN(C.total) + "円", options: { fontFace: LATIN, fontSize: 26, bold: true, color: GOLD_L } },
      { text: "　＝　WineBank現物 " + okuN(C.wb_capital) + "円 ＋ 投資家 " + okuN(C.inv_capital) + "円", options: { fontFace: SANS, fontSize: 11, color: IVORY } },
    ], { x: x + 0.28, y: 2.50, w: cwid - 0.56, h: 0.48, margin: 0, valign: "middle" });
    s.addText("必要な年間販売額　" + oku(P.sales) + "円　／　投資家利回り　" + pc(P.inv_yld), {
      x: x + 0.28, y: 3.04, w: cwid - 0.56, h: 0.26, margin: 0, fontFace: SANS, fontSize: 10.5, bold: true, color: GOLD_L });
    s.addText(c[4], { x: x + 0.28, y: 3.32, w: cwid - 0.56, h: 0.34, margin: 0, fontFace: SANS, fontSize: 9.5, color: MUTED, lineSpacingMultiple: 1.18 });
  });

  const rows = [
    [th("項目"), th("ファーストクローズ"), th("セカンドクローズ"), th("備考")],
    [td("総額"), td(okuN(C1.total) + "円", { bold: true, color: GOLD_L }), td(okuN(C2.total) + "円", { bold: true, color: GOLD_L }), td("資本構成の比率は同一", { align: "left" })],
    [td("WineBank現物出資（60%）"), td(okuN(C1.wb_capital) + "円"), td(okuN(C2.wb_capital) + "円"), td("自己勘定のワイン現物を拠出", { align: "left" })],
    [td("投資家出資（40%）"), td(okuN(C1.inv_capital) + "円"), td(okuN(C2.inv_capital) + "円"), td("1口5,000万円以上", { align: "left" })],
    [td("必要な年間販売額"), td(oku(P1.sales) + "円", { color: GOLD_L }), td(oku(P2.sales) + "円", { color: RED, bold: true }), td("回転12ヶ月を実現するために必要な販売額", { align: "left" })],
    [td("年間税前利益（SPC）"), td(oku(P1.pretax) + "円"), td(oku(P2.pretax) + "円"), td("管理報酬控除後", { align: "left" })],
    [td("投資家取分（折半後）"), td(hyaku(P1.inv) + "円"), td(hyaku(P2.inv) + "円"), td("投資家帰属分の50%", { align: "left" })],
    [td("投資家利回り（定常年間）"), td(pc(P1.inv_yld), { bold: true, color: GOLD_L }), td(pc(P2.inv_yld), { bold: true, color: GOLD_L }), td("規模拡大で固定費が薄まりわずかに改善する", { align: "left" })],
    [td("5年通算 年平均利回り"), td(pc(P1.avg5)), td(pc(P2.avg5)), td("仕入展開6ヶ月の立ち上がりを含む", { align: "left" })],
    [td("WineBank受取"), td(hyaku(P1.wb_total) + "円"), td(hyaku(P2.wb_total) + "円"), td("持分＋成功報酬＋管理報酬", { align: "left" })],
    [td("20%の分岐点"), td("回転" + mon(C1.breakeven.neutral)), td("回転" + mon(C2.breakeven.neutral)), td("これを超えると貴社基準を下回る", { align: "left" })],
  ];
  table(s, rows, M, 3.90, CW, [2.62, 2.10, 2.10, 5.07], { rowH: 0.238, fontSize: 8.5 });

  card(s, M, 6.36, CW, 0.62, { fill: CARD2, line: GOLD_D });
  s.addText([
    { text: "セカンドクローズの判断基準：", options: { fontFace: SANS, fontSize: 10, bold: true, color: GOLD_L } },
    { text: "規模を倍にすると必要な年間販売額も " + oku(P1.sales) + "円 → " + oku(P2.sales) + "円 と倍増する。これは現状の販売実力（年5〜7億円）の2倍を超える水準であり、規模拡大は販売実力の拡大とセットでなければ回転12ヶ月を維持できない。セカンドクローズはファーストクローズの回転実績を確認したうえで判断する。", options: { fontFace: SANS, fontSize: 9.5, color: IVORY } },
  ], { x: M + 0.30, y: 6.44, w: CW - 0.60, h: 0.46, margin: 0, valign: "middle", lineSpacingMultiple: 1.18 });

  s.addNotes("比率が同じなので利回りはほぼ同じ。問題は必要販売額が倍増すること。セカンドクローズは回転実績を見て判断する。");
}

// ═══════════════════════════════════════════════════════════ 05 販売計画
{
  const s = chrome(base(), "SALES PLAN", "在庫回転12ヶ月をどう実現するか",
    `ファーストクローズでは回転12ヶ月に年間${oku(P1.sales)}円の販売が必要となる。組入銘柄の選定を主たる手段とし、配分ルールと販路拡大で補う。`);

  const mk = (h) => {
    const d = C1.holds[h];
    const ok = d.inv_yld >= F.params.target;
    const main = h === "12";
    const pos = h === "9" ? "販路拡大が実現した場合の上限"
      : main ? "貴社基準20%を満たす水準" : "20%を下回る";
    return [
      td(h + "ヶ月" + (h === "9" ? "（最短）" : main ? "（主線）" : ""), main ? { bold: true, color: GOLD_L } : {}),
      td(oku(d.sales) + "円", main ? { bold: true, color: GOLD_L } : {}),
      td(oku(d.pretax) + "円"),
      td(hyaku(d.inv) + "円"),
      td(pc(d.inv_yld), { bold: true, color: ok ? GOLD_L : RED }),
      td(hyaku(d.wb_total) + "円"),
      td(pos, { align: "left", color: ok ? (main ? GOLD_L : IVORY) : RED }),
    ];
  };
  const rows = [[th("在庫回転期間"), th("必要な年間販売額"), th("年間税前利益"), th("投資家取分"), th("投資家利回り"), th("WineBank受取"), th("位置づけ")]]
    .concat(HOLDS.map(mk));
  table(s, rows, M, 1.80, CW, [1.74, 1.72, 1.44, 1.62, 1.42, 1.72, 2.23], { rowH: 0.42 });

  const cw3 = (CW - 0.28 * 2) / 3;
  const plan = [
    ["第一の手段", "組入銘柄の選定", "Liv-ex掲載の流動性上位銘柄など、回転の速い銘柄をSPCに組み入れる。何を持たせるかで回転期間の大半が決まるため、これが最も効く打ち手となる。WineBankの現物出資分についても同じ基準で拠出銘柄を選定する。", true],
    ["第二の手段", "配分ルール", "自己勘定在庫と重複する銘柄は在庫比率でプロラタ配分し、判断を要する場合はSPC在庫を優先する。契約別紙として明文化する。", false],
    ["第三の手段", "販路の拡大", "輸出入ライセンスを活かした海外販売、2026年9月開始のWineBank Auction、グループ飲食（アピシウス／ティエリーマルクス）。これらは出資金ではなくWineBank側の資本で手当てする。", false],
  ];
  plan.forEach((c, i) => {
    const x = M + (cw3 + 0.28) * i;
    card(s, x, 4.10, cw3, 2.02, { fill: c[3] ? CARD2 : CARD, line: c[3] ? GOLD_D : LINE });
    s.addText(c[0], { x: x + 0.26, y: 4.28, w: cw3 - 0.52, h: 0.26, margin: 0, fontFace: SANS, fontSize: 11, bold: true, color: c[3] ? GOLD_L : IVORY });
    s.addText(c[1], { x: x + 0.26, y: 4.58, w: cw3 - 0.52, h: 0.40, margin: 0, valign: "middle", fontFace: SANS, fontSize: 17, bold: true, color: GOLD_L });
    s.addText(c[2], { x: x + 0.26, y: 5.04, w: cw3 - 0.52, h: 0.98, margin: 0, fontFace: SANS, fontSize: 9, color: MUTED, lineSpacingMultiple: 1.24 });
  });

  s.addText(`※ 回転12ヶ月に必要な年間販売額${oku(P1.sales)}円は、現状の販売実力（5〜7億円）の上限をやや上回る。銘柄の大半はSPCと自己勘定で重複しないため配分の判断自体が生じず、回転期間は「何を組み入れるか」でほぼ決まる。重複銘柄の取扱いは在庫配分の公平性の頁を参照。投資家利回りが20%を割り込むのは回転が${mon(C1.breakeven.neutral)}を超えた場合であり、主線12ヶ月との余裕は${(C1.breakeven.neutral - 12).toFixed(1)}ヶ月しかない。回転12ヶ月の達成が貴社基準を満たすための必須条件となる。`, {
    x: M, y: 6.22, w: CW, h: 0.44, margin: 0, fontFace: SANS, fontSize: 8.5, color: DIM, lineSpacingMultiple: 1.2 });

  s.addNotes(`回転12ヶ月＝年間${oku(P1.sales)}円。組入銘柄の選定が最大の手段。20%の分岐点は回転${mon(C1.breakeven.neutral)}。`);
}

// ═══════════════════════════════════════════════════════════ 06 スキーム
{
  const s = chrome(base(), "STRUCTURE", "ファンドスキーム",
    "WineBankが免許事業者として売買当事者となり、SPCは現物の所有者として損益を受ける。WineBankは出資者でもある。");

  const bw = 3.55, by = 1.86, bh = 1.30;
  const bx1 = M, bx2 = M + (CW - bw) / 2, bx3 = M + CW - bw;

  card(s, bx1, by, bw, bh);
  s.addText("投資家（資産管理会社ほか）", { x: bx1 + 0.24, y: by + 0.24, w: bw - 0.48, h: 0.28, margin: 0, fontFace: SANS, fontSize: 13, bold: true, color: IVORY });
  s.addText("匿名組合出資（現金）　" + okuN(C1.inv_capital) + "円", { x: bx1 + 0.24, y: by + 0.58, w: bw - 0.48, h: 0.26, margin: 0, fontFace: SANS, fontSize: 10.5, color: GOLD_L });
  s.addText("投資家帰属利益の50%を年1回受領", { x: bx1 + 0.24, y: by + 0.86, w: bw - 0.48, h: 0.26, margin: 0, fontFace: SANS, fontSize: 9.5, color: MUTED });

  card(s, bx2, by, bw, bh, { fill: CARD2, line: GOLD_D });
  s.addText("ワインファンドSPC", { x: bx2 + 0.24, y: by + 0.24, w: bw - 0.48, h: 0.28, margin: 0, fontFace: SANS, fontSize: 13, bold: true, color: GOLD_L });
  s.addText("合同会社＋匿名組合（GK-TK）", { x: bx2 + 0.24, y: by + 0.58, w: bw - 0.48, h: 0.26, margin: 0, fontFace: SANS, fontSize: 10.5, color: IVORY });
  s.addText("ワイン現物を所有・損益が帰属", { x: bx2 + 0.24, y: by + 0.86, w: bw - 0.48, h: 0.26, margin: 0, fontFace: SANS, fontSize: 9.5, color: MUTED });

  card(s, bx3, by, bw, bh);
  s.addText("株式会社WineBank", { x: bx3 + 0.24, y: by + 0.24, w: bw - 0.48, h: 0.28, margin: 0, fontFace: SANS, fontSize: 13, bold: true, color: IVORY });
  s.addText("現物出資（ワイン）　" + okuN(C1.wb_capital) + "円　＋　GP実行", { x: bx3 + 0.24, y: by + 0.58, w: bw - 0.48, h: 0.26, margin: 0, fontFace: SANS, fontSize: 10.5, color: GOLD_L });
  s.addText("酒類販売業免許・取引口座を保有", { x: bx3 + 0.24, y: by + 0.86, w: bw - 0.48, h: 0.26, margin: 0, fontFace: SANS, fontSize: 9.5, color: MUTED });

  s.addShape(pres.ShapeType.rightArrow, { x: bx1 + bw + 0.10, y: by + 0.52, w: bx2 - bx1 - bw - 0.20, h: 0.26, fill: { color: GOLD_D }, line: { color: GOLD_D, width: 0 } });
  s.addShape(pres.ShapeType.leftArrow, { x: bx2 + bw + 0.10, y: by + 0.52, w: bx3 - bx2 - bw - 0.20, h: 0.26, fill: { color: GOLD }, line: { color: GOLD, width: 0 } });

  const sw = (CW - 0.28 * 3) / 4, sy = 3.60, sh = 1.76;
  const steps = [
    ["01", "調達・拠出", "WineBankが自社の免許・取引口座で調達した正規品のうち、総額の60%相当を現物出資としてSPCへ拠出する", "現物出資 " + okuN(C1.wb_capital) + "円"],
    ["02", "取得", "投資家出資分（40%）は、WineBankが調達した現物をSPCへ譲渡（酒類卸売）して取得する", "SPC取得原価 " + f2(UN.spc_cost)],
    ["03", "保管・販売", "定温倉庫で保管（全量付保）。B2B酒販店卸とB2C自社EC・オークションの2系統で販売", "定価比 " + UN.p_b2b.toFixed(0) + "／" + UN.p_b2c.toFixed(0)],
    ["04", "分配", "投資家出資分に帰属する40%を折半し年1回分配。WineBank出資分の60%は持分として帰属", "投資家50：WB50"],
  ];
  steps.forEach((st, i) => {
    const x = M + (sw + 0.28) * i;
    card(s, x, sy, sw, sh);
    badge(s, x + 0.24, sy + 0.22, 0.34, st[0]);
    s.addText(st[1], { x: x + 0.68, y: sy + 0.24, w: sw - 0.92, h: 0.30, margin: 0, valign: "middle", fontFace: SANS, fontSize: 12, bold: true, color: IVORY });
    s.addText(st[2], { x: x + 0.24, y: sy + 0.70, w: sw - 0.48, h: 0.66, margin: 0, fontFace: SANS, fontSize: 9.5, color: MUTED, lineSpacingMultiple: 1.2 });
    s.addText(st[3], { x: x + 0.24, y: sy + 1.40, w: sw - 0.48, h: 0.24, margin: 0, fontFace: SANS, fontSize: 10, bold: true, color: GOLD_L });
  });

  s.addText("※ ワイン現物はSPC名義で保有し、WineBankの債権者から倒産隔離する。WineBankはGPとして実行を担うと同時に総額の60%の出資者でもあるため、SPCの損益をそのまま負う。報酬は「投資家帰属利益を折半する成功報酬」と「総額の年2%の管理報酬」に限定する。現物出資するワインの評価方法は組成時の別途協議事項とする。", {
    x: M, y: 5.56, w: CW, h: 0.40, margin: 0,
    fontFace: SANS, fontSize: 9, color: DIM, lineSpacingMultiple: 1.2,
  });
  s.addNotes("免許事業者であるWineBankが売買当事者。かつ総額60%の出資者として同じ損益を負う。");
}

// ═══════════════════════════════════════════════════════════ 07 商流の制約
{
  const s = chrome(base(), "REGULATORY & TRADE PRACTICE", "なぜSPCが直接仕入・販売できないのか",
    "酒類は免許業種であり、取引口座は法人単位で審査される。SPC単独では商流に乗れない。");

  const cw = (CW - 0.30 * 2) / 3;
  const walls = [
    ["酒類販売業免許", "酒類の売買には販売場ごとの免許が必要。新設SPCが一般酒類小売業免許・酒類卸売業免許を取得するには、経営基礎要件（直近3事業年度の財務内容等）や需給調整要件の充足が求められ、設立直後の器としては実務上ハードルが高く、審査にも相応の期間を要する。"],
    ["インポーターの取引基準", "大手インポーターは新規取引先に対し、与信・取引実績・年間取引量を審査したうえで口座を開設する。事業実体を持たないSPCでは口座開設に至らない。特価・正規割当は長年の取引関係に紐づいており、法人格が変われば引き継げない。"],
    ["割当（アロケーション）の属人性", "希少銘柄の割当はWineBank名義に対して付与されるものであり、第三者へ譲り渡すことができない。創業55年の酒販実績と輸出入ライセンスに基づく調達力は、SPCへ移管できない無形資産である。"],
  ];
  walls.forEach((wl, i) => {
    const x = M + (cw + 0.30) * i;
    card(s, x, 1.82, cw, 2.16);
    badge(s, x + 0.26, 2.04, 0.34, String(i + 1).padStart(2, "0"));
    s.addText(wl[0], { x: x + 0.70, y: 2.06, w: cw - 0.96, h: 0.30, margin: 0, valign: "middle", fontFace: SANS, fontSize: 12, bold: true, color: IVORY });
    s.addText(wl[1], { x: x + 0.26, y: 2.56, w: cw - 0.52, h: 1.32, margin: 0, fontFace: SANS, fontSize: 9.5, color: MUTED, lineSpacingMultiple: 1.24 });
  });

  card(s, M, 4.22, CW, 1.70, { fill: CARD2, line: GOLD_D });
  s.addText("採用するスキーム", { x: M + 0.30, y: 4.40, w: 3.0, h: 0.28, margin: 0, fontFace: SANS, fontSize: 12, bold: true, color: GOLD_L });
  s.addText("WineBankが免許事業者として仕入・販売の当事者となり、現物をSPCへ拠出・譲渡する。SPCは所有者として損益を受ける。", {
    x: M + 0.30, y: 4.70, w: CW - 0.60, h: 0.28, margin: 0, fontFace: SANS, fontSize: 12.5, bold: true, color: IVORY,
  });

  const flow = [
    ["WineBank出資分（60%）— 現物出資", `自己勘定のワイン現物${okuN(C1.wb_capital)}円相当をSPCへ現物出資する。評価方法（取得原価にどれだけ付加するか）は組成時の別途協議事項とし、第三者による評価と併せて確定させる。本試算ではSPC取得原価を定価比${f2(UN.spc_cost)}に置いている。`],
    ["投資家出資分（40%）— 現物譲渡＋1%", `投資家の現金出資${okuN(C1.inv_capital)}円分は、WineBankが調達した現物をSPCへ譲渡して取得する。同額譲渡では対価なき役務提供となり寄附金認定・移転価格の論点を招くため、独立企業間価格として最小限の1%を付加する。`],
  ];
  flow.forEach((f, i) => {
    const x = M + 0.30 + i * ((CW - 0.60) / 2 + 0.10);
    const w = (CW - 0.60) / 2 - 0.10;
    s.addText(f[0], { x, y: 5.08, w, h: 0.26, margin: 0, fontFace: SANS, fontSize: 10.5, bold: true, color: GOLD_L });
    s.addText(f[1], { x, y: 5.34, w, h: 0.56, margin: 0, fontFace: SANS, fontSize: 9, color: MUTED, lineSpacingMultiple: 1.2 });
  });

  s.addText("※ SPC自体の免許要否、委託・売買形態の切り分け、および酒類の現物出資が免許・消費税・法人税上どう扱われるかは、所轄税務署（酒類指導官）および顧問弁護士・公認会計士との確認事項として、契約書ドラフト作成前に確定させる。", {
    x: M, y: 6.06, w: CW, h: 0.28, margin: 0, fontFace: SANS, fontSize: 8.5, color: DIM,
  });
  s.addNotes("免許・口座・割当の3つの壁。現物出資分と現金出資分で取得ルートが分かれる点に注意。");
}

// ═══════════════════════════════════════════════════════════ 08 収益の源泉
{
  const s = chrome(base(), "SOURCE OF RETURN", "収益の源泉：ワイン流通の価格差",
    "同一商品が流通段階ごとに異なる価格で存在する。この価格差＝粗利をファンドが取り込む。");

  const steps = [
    ["インポーター仕入", "40", "仕入①", GOLD_D],
    ["酒販店仕入", "60", "仕入②", GOLD_D],
    ["酒販店卸 売値", UN.p_b2b.toFixed(0), "売却① B2B", GOLD],
    ["ネット最安 売値", UN.p_b2c.toFixed(0), "売却② B2C", GOLD],
    ["希望小売価格", "100", "消費者", LINE],
  ];
  const bw = (CW - 0.26 * 4) / 5;
  steps.forEach((st, i) => {
    const x = M + (bw + 0.26) * i;
    card(s, x, 1.88, bw, 1.86, { fill: i === 4 ? CARD : CARD2, line: st[3] });
    s.addText(st[0], { x: x + 0.20, y: 2.06, w: bw - 0.40, h: 0.26, margin: 0, fontFace: SANS, fontSize: 10.5, bold: true, color: IVORY });
    s.addText(st[1], { x: x + 0.20, y: 2.42, w: bw - 0.40, h: 0.76, margin: 0, valign: "middle", fontFace: LATIN, fontSize: 40, bold: true, color: i === 4 ? MUTED : GOLD_L });
    s.addText(st[2], { x: x + 0.20, y: 3.28, w: bw - 0.40, h: 0.26, margin: 0, fontFace: SANS, fontSize: 9.5, color: MUTED });
  });

  card(s, M, 4.02, CW, 2.14, { fill: CARD2, line: GOLD_D });
  s.addText("主線（ニュートラル）の置き方　― 保有12ヶ月の場合", { x: M + 0.30, y: 4.18, w: 6, h: 0.28, margin: 0, fontFace: SANS, fontSize: 12, bold: true, color: GOLD_L });

  const calc = [
    ["仕入ポートフォリオ", "インポーター40 ＋ 酒販店60 を半々", "市中原価 " + f2(UN.mkt_cost), false],
    ["SPCの取得", "現物出資（60%）と現物譲渡＋1%（40%）", "SPC取得原価 " + f2(UN.spc_cost), false],
    ["売却ポートフォリオ", `酒販店卸${UN.p_b2b.toFixed(0)}（B2B）＋ ネット最安${UN.p_b2c.toFixed(0)}（B2C）を半々`, "取得時の売値 " + f2(UN.price), false],
    ["保有中の値上がり", "ワイン価格の年間上昇6%を12ヶ月保有", "×" + UH.k.toFixed(3) + " → 売値 " + f2(UH.price), false],
    ["変動販売費", `B2B 1.0% ／ B2C 11.2% の加重平均 ${(UN.var_rate * 100).toFixed(2)}%`, "▲ " + f2(UH.var) + " → 手取り " + f2(UH.net), false],
    ["単位粗利", `手取り${f2(UH.net)} − SPC取得原価${f2(UN.spc_cost)}`, `粗利 ${f2(UH.gross)}（粗利率 ${pc(UH.gm)}）`, true],
  ];
  let cy = 4.52;
  calc.forEach((c) => {
    s.addText(c[0], { x: M + 0.30, y: cy, w: 3.4, h: 0.26, margin: 0, fontFace: SANS, fontSize: 10.5, bold: true, color: IVORY });
    s.addText(c[1], { x: M + 3.80, y: cy, w: 5.0, h: 0.26, margin: 0, fontFace: SANS, fontSize: 10.5, color: MUTED });
    s.addText(c[2], { x: M + 8.90, y: cy, w: CW - 9.20, h: 0.26, margin: 0, align: "right", fontFace: SANS, fontSize: 10.5, bold: true, color: c[3] ? GOLD_L : IVORY });
    cy += 0.28;
  });

  s.addText("価格の上昇は流通段階全体（希望小売・ネット最安・卸値）が連動するため、取得原価は据え置きのまま売値だけが上がる。上昇率は会社資料のFine Wine年率10%に対し、保守的に6%を主線とする。", {
    x: M, y: 6.26, w: CW, h: 0.28, margin: 0, fontFace: SANS, fontSize: 9, color: DIM,
  });
  s.addNotes("会社紹介資料17ページの流通価格構造を採用。値上がり年6%を保有期間ぶん売値に乗せる。");
}

// ═══════════════════════════════════════════════════════════ 09 チャネル別の単位経済
{
  const s = chrome(base(), "CHANNEL ECONOMICS", "販売チャネル別の手取り：B2B卸とB2Cネット販売",
    "売値だけでは判断できない。手数料構造が全く異なるため、手取りベースで比較する。");

  const cwid = (CW - 0.34) / 2;
  const chans = [
    ["B2B｜酒販店卸", f2(UN.p_b2b), [["出庫・配送", "0.6%", "ケース／パレット単位出荷。1回あたりの出荷単位が大きい"],
                                ["決済・与信", "0.4%", "掛売のため決済手数料なし。回収コストと貸倒引当"]],
     "1.0%", f2(UN.p_b2b - UN.net_b2b), f2(UN.net_b2b), false],
    ["B2C｜自社EC・オークション", f2(UN.p_b2c), [["モール・出品手数料", "5.5%", "楽天／Yahoo／寺田Wine Market（10〜12%）と自社EC・自社オークション（0〜3%）の加重平均"],
                                ["カード決済手数料", "3.2%", "クレジットカード決済"],
                                ["出庫・梱包・クール便", "2.5%", "1口1,300円＋梱包資材。1口平均6万円想定"]],
     "11.2%", f2(UN.p_b2c - UN.net_b2c), f2(UN.net_b2c), true],
  ];
  chans.forEach((c, i) => {
    const x = M + (cwid + 0.34) * i;
    card(s, x, 1.80, cwid, 3.24, { fill: c[6] ? CARD2 : CARD, line: c[6] ? GOLD_D : LINE });
    s.addText(c[0], { x: x + 0.28, y: 1.98, w: cwid - 1.90, h: 0.30, margin: 0, valign: "middle", fontFace: SANS, fontSize: 13, bold: true, color: c[6] ? GOLD_L : IVORY });
    s.addText([
      { text: "売値 ", options: { fontFace: SANS, fontSize: 10, color: MUTED } },
      { text: c[1], options: { fontFace: LATIN, fontSize: 20, bold: true, color: IVORY } },
    ], { x: x + cwid - 1.90, y: 1.96, w: 1.62, h: 0.34, margin: 0, align: "right", valign: "middle" });

    let yy = 2.44;
    c[2].forEach((r) => {
      s.addText(r[0], { x: x + 0.28, y: yy, w: cwid - 1.30, h: 0.22, margin: 0, fontFace: SANS, fontSize: 10, bold: true, color: IVORY });
      s.addText(r[1], { x: x + cwid - 1.02, y: yy, w: 0.74, h: 0.22, margin: 0, align: "right", fontFace: LATIN, fontSize: 11, bold: true, color: GOLD_L });
      s.addText(r[2], { x: x + 0.28, y: yy + 0.21, w: cwid - 0.56, h: 0.32, margin: 0, fontFace: SANS, fontSize: 8.5, color: MUTED, lineSpacingMultiple: 1.15 });
      yy += 0.58;
    });

    const fy = 4.28;
    s.addText("変動販売費 合計", { x: x + 0.28, y: fy, w: 2.6, h: 0.24, margin: 0, fontFace: SANS, fontSize: 10, color: MUTED });
    s.addText(c[3] + "（▲" + c[4] + "）", { x: x + cwid - 2.20, y: fy, w: 1.92, h: 0.24, margin: 0, align: "right", fontFace: SANS, fontSize: 10.5, bold: true, color: RED });
    s.addText("手取り", { x: x + 0.28, y: fy + 0.30, w: 2.2, h: 0.38, margin: 0, valign: "middle", fontFace: SANS, fontSize: 11, bold: true, color: IVORY });
    s.addText(c[5], { x: x + cwid - 2.20, y: fy + 0.28, w: 1.92, h: 0.42, margin: 0, align: "right", valign: "middle", fontFace: LATIN, fontSize: 25, bold: true, color: GOLD_L });
  });

  card(s, M, 5.24, CW, 1.00, { fill: CARD2, line: GOLD_D });
  s.addText([
    { text: `手数料が重くても、B2Cのほうが手取りは${(UN.net_b2c - UN.net_b2b).toFixed(2)}ポイント高い。`, options: { fontFace: SANS, fontSize: 12, bold: true, color: GOLD_L } },
    { text: `　B2Cは手数料率11.2%を負うが、売値が定価比${UN.p_b2c.toFixed(0)}とB2Bの${UN.p_b2b.toFixed(0)}を10ポイント上回るため、差引きで勝る。ただしB2Cは1本ずつの出荷となり販売量の上限が低いため、回転期間を確保するにはB2Bの卸売が不可欠となる。両者を半々で運用し、加重平均で売値${f2(UN.price)}・変動販売費${(UN.var_rate * 100).toFixed(2)}%・手取り${f2(UN.net)}を主線とする（いずれも取得時点の価格。保有中の値上がりは次頁以降で加算）。`, options: { fontFace: SANS, fontSize: 10, color: IVORY } },
  ], { x: M + 0.30, y: 5.36, w: CW - 0.60, h: 0.76, margin: 0, valign: "middle", lineSpacingMultiple: 1.22 });

  s.addNotes(`チャネル別の手取り比較。B2C ${f2(UN.net_b2c)} > B2B ${f2(UN.net_b2b)}。ただし回転を作るにはB2Bが必要。`);
}

// ═══════════════════════════════════════════════════════════ 10 3シナリオの単位経済
{
  const s = chrome(base(), "UNIT ECONOMICS", "3シナリオの単位経済（保有12ヶ月・定価100あたり）",
    "SPC取得原価と変動販売費を控除し、保有中の値上がりを売値に加算したうえでの粗利。");

  const order = ["ネガティブ", "ニュートラル", "ポジティブ"];
  const captions = {
    "ネガティブ": "売値を5%値引き（B2B66.5／B2C76）かつ価格は横ばい",
    "ニュートラル": "仕入40/60の半々・売却はB2B70とB2C80の半々・年6%上昇",
    "ポジティブ": "仕入はインポーター40のみ・売却はネット最安80のみ（B2C100%）",
  };
  const labels = ["市中仕入原価", "SPC取得原価", "取得時の売値", "保有12ヶ月の上昇", "売却時の売値", "変動販売費", "手取り", "単位粗利", "粗利率（売上比）", "投下原価利益率"];
  const cw = (CW - 0.32 * 2) / 3;

  order.forEach((name, i) => {
    const u = F.unit[name], h = F.unit_held[name];
    const main = name === "ニュートラル";
    const vals = [f2(u.mkt_cost), f2(u.spc_cost), f2(u.price), "×" + h.k.toFixed(3),
      f2(h.price), f2(h.var), f2(h.net), f2(h.gross), pc(h.gm), pc(h.gross / h.spc_cost)];
    const x = M + (cw + 0.32) * i;
    card(s, x, 1.78, cw, 4.30, { fill: main ? CARD2 : CARD, line: main ? GOLD_D : LINE });
    s.addText(name + (main ? "（主線）" : ""), {
      x: x + 0.28, y: 2.00, w: cw - 0.56, h: 0.32, margin: 0,
      fontFace: SANS, fontSize: 13, bold: true, color: main ? GOLD_L : IVORY,
    });
    let yy = 2.44;
    vals.forEach((v, j) => {
      const hot = (j === 1 || j === 3 || j === 6 || j === 7 || j === 8 || j === 9);
      s.addText(labels[j], { x: x + 0.28, y: yy, w: cw - 1.60, h: 0.26, margin: 0, valign: "middle", fontFace: SANS, fontSize: 9.5, color: MUTED });
      s.addText(j === 5 ? "▲ " + v : v, {
        x: x + cw - 1.62, y: yy, w: 1.34, h: 0.26, margin: 0, align: "right", valign: "middle",
        fontFace: LATIN, fontSize: (j === 8 || j === 9 || j === 3) ? 12.5 : 13.5, bold: true,
        color: j === 5 ? RED : (hot ? (main ? GOLD_L : IVORY) : IVORY),
      });
      yy += 0.315;
    });
    s.addText(captions[name], {
      x: x + 0.28, y: 5.56, w: cw - 0.56, h: 0.40, margin: 0,
      fontFace: SANS, fontSize: 9, color: DIM, lineSpacingMultiple: 1.2,
    });
  });

  s.addText(`※ 粗利率（売上比）は単位粗利を売却時の売値で除したもの、投下原価利益率は投下資本であるSPC取得原価で除したもの。分母が異なるだけで同じ単位粗利を見ている。利回りの源泉となるのは後者であり、年1回転すれば投下資本が年${pc(UH.gross / UH.spc_cost)}増えることを意味する。`, {
    x: M, y: 6.22, w: CW, h: 0.40, margin: 0, fontFace: SANS, fontSize: 8.5, color: DIM, lineSpacingMultiple: 1.2,
  });
  s.addNotes(`粗利率${pc(UH.gm)}と投下原価利益率${pc(UH.gross / UH.spc_cost)}は分母が違うだけ。利回りの源泉は後者。`);
}

// ═══════════════════════════════════════════════════════════ 11 費用前提
{
  const s = chrome(base(), "COST ASSUMPTIONS", "SPC費用の前提",
    "共通費用とチャネル別の変動販売費に分けて計上。監査・法務まで含め、利回りを作るための圧縮は行っていない。");

  s.addText("共通費用", { x: M, y: 1.78, w: 3, h: 0.24, margin: 0, fontFace: SANS, fontSize: 11, bold: true, color: GOLD_L });
  const rows = [
    [th("費用項目"), th("単価・料率"), th("根拠・備考")],
    [td("保管（定温倉庫）"), td("年7,500円／ロット"), td("1ロット＝定価100万円相当（約40本）。月約16円／本で業務用パレット定温保管の一般水準", { align: "left" })],
    [td("動産総合保険"), td("平均在庫簿価の年0.15%"), td("火災・破損・盗難・輸送中事故を全量付保。滞留・破損ロスは保険でカバーするため別途計上しない", { align: "left" })],
    [td("入庫・検品"), td("320円／ロット"), td("入庫時の検品・棚入れ。出庫費用はチャネル別の変動販売費に含む", { align: "left" })],
    [td("SPC維持費"), td("年200万円（固定）"), td("税務・事務受託・法務", { align: "left" })],
    [td("管理報酬"), td("総額の年2%", { color: GOLD_L, bold: true }),
     td(`1stクローズで年${man(C1.mgmt)}円、2ndクローズで年${man(C2.mgmt)}円。従来のSPC人件費360万円に代えて計上`, { align: "left", color: GOLD_L })],
    [td("AUP（合意された手続）"), td("年50万円（固定）"), td("公認会計士による合意された手続の実施と報告書の発行", { align: "left" })],
    [td("予備費"), td("年50万円（固定）"), td("想定外の実費に充当。未使用分はSPCの利益に残る", { align: "left" })],
    [td("WineBank販売オペコスト"), td("SPC負担なし"), td("WineBankの成功報酬・持分取分から負担する", { align: "left" })],
  ];
  table(s, rows, M, 1.96, CW, [2.55, 2.15, 7.19], { rowH: 0.305 });

  s.addText("チャネル別 変動販売費（売上比）", { x: M, y: 4.74, w: 5, h: 0.24, margin: 0, fontFace: SANS, fontSize: 11, bold: true, color: GOLD_L });
  const chw = (CW - 0.30 * 2) / 3;
  const boxes = [
    ["B2B｜酒販店卸", "1.0", ["出庫・配送 0.6%", "決済・与信（貸倒引当）0.4%"], false],
    ["B2C｜自社EC・オークション", "11.2", ["モール・出品手数料 5.5%", "カード決済 3.2%", "出庫・梱包・クール便 2.5%"], false],
    ["加重平均（半々）", (UN.var_rate * 100).toFixed(2), ["売値ベースの加重平均", "定価100あたり ▲" + f2(UN.var)], true],
  ];
  boxes.forEach((b, i) => {
    const x = M + (chw + 0.30) * i;
    card(s, x, 5.00, chw, 1.20, { fill: b[3] ? CARD2 : CARD, line: b[3] ? GOLD_D : LINE });
    s.addText(b[0], { x: x + 0.26, y: 5.14, w: chw - 1.50, h: 0.26, margin: 0, fontFace: SANS, fontSize: 11, bold: true, color: b[3] ? GOLD_L : IVORY });
    s.addText([
      { text: b[1], options: { fontFace: LATIN, fontSize: 21, bold: true, color: GOLD_L } },
      { text: " %", options: { fontFace: SANS, fontSize: 11, bold: true, color: GOLD_L } },
    ], { x: x + chw - 1.44, y: 5.10, w: 1.18, h: 0.34, margin: 0, align: "right", valign: "middle" });
    s.addText(b[2].join("　／　"), {
      x: x + 0.26, y: 5.46, w: chw - 0.52, h: 0.62, margin: 0,
      fontFace: SANS, fontSize: 9, color: MUTED, lineSpacingMultiple: 1.2 });
  });

  const cd = C1.cost_detail;
  s.addText(`※ 保管料は業務用パレット定温保管の水準（月10〜20円／本）。個人向けセラー預かり（月100〜150円／本）とは別の料金帯。ファーストクローズの主線（在庫回転12ヶ月・年間販売${oku(P1.sales)}円）における年間SPC費用の合計は${man(P1.cost)}円で、内訳は変動販売費${man(cd.selling)}円・保管${man(cd.storage)}円・固定費${man(cd.fixed)}円（うち管理報酬${man(C1.mgmt)}円）・保険${man(cd.insurance)}円・入庫${man(cd.inbound)}円。その他の運用前提：総額の95%をワイン購入に充当（現金5%）／仕入展開6ヶ月／ローリング運用／利益は複利再投資せず年1回分配／税前利益のうち投資家出資分に帰属する40%を投資家とWineBankで折半／利回りは投資家の税引前ベース。`, {
    x: M, y: 6.26, w: CW, h: 0.48, margin: 0, fontFace: SANS, fontSize: 8.5, color: DIM, lineSpacingMultiple: 1.2,
  });
  s.addNotes("SPC人件費360万円を管理報酬（総額の年2%）に置き換えた点が前回からの変更。");
}

// ═══════════════════════════════════════════════════════════ 12 ベースケース表
{
  const s = chrome(base(), "BASE CASE ｜ 主線", "ニュートラル：在庫回転期間別シミュレーション",
    `SPC取得原価${f2(UN.spc_cost)}・ワイン価格上昇 年6%／ファーストクローズ総額${okuN(C1.total)}円（WineBank現物${okuN(C1.wb_capital)}＋投資家${okuN(C1.inv_capital)}）・投資家帰属利益を折半・稼働率95%`);

  const mk = (h) => {
    const d = C1.holds[h], main = h === "12", ok = d.inv_yld >= F.params.target;
    return [
      td(h + "ヶ月" + (main ? "（主線）" : ""), main ? { bold: true, color: GOLD_L } : {}),
      td(oku(d.sales)), td(oku(d.gross - d.selling)), td(pc((d.gross - d.selling) / d.sales)), td(oku(d.pretax)),
      td(hyaku(d.attr)), td(hyaku(d.inv)),
      td(pc(d.inv_yld), { bold: true, color: ok ? GOLD_L : RED }),
      td(hyaku(d.avg5 * C1.inv_capital * 5)),
      td(pc(d.avg5), { bold: true, color: ok ? GOLD_L : IVORY }),
    ];
  };
  const rows = [[th("在庫回転期間"), th("年間売上"), th("年間粗利※"), th("粗利率"), th("年間税前利益"), th("投資家帰属分（40%）"), th("投資家取分（折半後）"), th("投資家利回り"), th("5年累計分配"), th("投資家 年平均利回り 5年通算")]]
    .concat(HOLDS.map(mk));
  table(s, rows, M, 1.82, CW, [1.52, 0.94, 0.94, 0.80, 1.14, 1.62, 1.55, 1.10, 1.06, 1.22], { rowH: 0.40 });

  card(s, M, 4.06, 6.05, 1.98, { fill: CARD2, line: GOLD_D });
  s.addText(`粗利率${pc(UH.gm)}が投資家利回り${pc(P1.inv_yld)}になる理由`, { x: M + 0.28, y: 4.20, w: 5.5, h: 0.26, margin: 0, fontFace: SANS, fontSize: 11.5, bold: true, color: GOLD_L });
  const bridge = [
    ["定価100あたり", `原価${f2(UN.spc_cost)}で仕入れ、手取り${f2(UH.net)}で回収 → 単位粗利${f2(UH.gross)}`, false],
    [`粗利率 ${pc(UH.gm)}`, `分母は売却時の売値${f2(UH.price)}`, false],
    [`投下原価利益率 ${pc(UH.gross / UH.spc_cost)}`, `分母は投下資本である取得原価${f2(UN.spc_cost)}。年1回転なので資本が年${pc(UH.gross / UH.spc_cost)}増える`, true],
    [`税前利益 ${oku(P1.pretax)}円`, `SPC費用 計${man(P1.cost)}円を控除した後の年間税前利益`, false],
    [`投資家利回り ${pc(P1.inv_yld)}`, `帰属分${hyaku(P1.attr)}円を折半した${hyaku(P1.inv)}円 ÷ 出資${okuN(C1.inv_capital)}円`, true],
  ];
  let by = 4.52;
  bridge.forEach((b) => {
    s.addText(b[0], { x: M + 0.28, y: by, w: 1.90, h: 0.28, margin: 0, valign: "middle", fontFace: SANS, fontSize: 9.5, bold: true, color: b[2] ? GOLD_L : IVORY });
    s.addText(b[1], { x: M + 2.22, y: by, w: 3.60, h: 0.28, margin: 0, valign: "middle", fontFace: SANS, fontSize: 8.5, color: MUTED, lineSpacingMultiple: 1.1 });
    by += 0.30;
  });

  card(s, M + 6.35, 4.06, CW - 6.35, 1.98, { fill: CARD2, line: GOLD_D });
  s.addText("想定レンジのご提示", { x: M + 6.63, y: 4.24, w: 4, h: 0.26, margin: 0, fontFace: SANS, fontSize: 12, bold: true, color: GOLD_L });
  s.addText("投資家利回り（定常年間・税引前）", {
    x: M + 6.63, y: 4.54, w: CW - 6.95, h: 0.24, margin: 0,
    fontFace: SANS, fontSize: 10.5, color: IVORY });
  s.addText([
    { text: `${pc(C1.holds["18"].inv_yld).replace("%", "")} – ${pc(C1.holds["9"].inv_yld).replace("%", "")}`, options: { fontFace: LATIN, fontSize: 30, bold: true, color: GOLD_L } },
    { text: " %", options: { fontFace: SANS, fontSize: 15, bold: true, color: GOLD_L } },
  ], { x: M + 6.63, y: 4.78, w: CW - 6.95, h: 0.50, margin: 0, valign: "middle" });
  s.addText(`主線の回転12ヶ月で${pc(P1.inv_yld)}と貴社基準20%を満たす。ただし20%の分岐点は回転${mon(C1.breakeven.neutral)}であり、余裕は${(C1.breakeven.neutral - 12).toFixed(1)}ヶ月しかない。15ヶ月まで延びると${pc(C1.holds["15"].inv_yld)}となり基準を下回る。`, {
    x: M + 6.63, y: 5.34, w: CW - 6.95, h: 0.58, margin: 0, fontFace: SANS, fontSize: 10, color: MUTED, lineSpacingMultiple: 1.2,
  });
  s.addText("※ 年間粗利は変動販売費控除後。", { x: M, y: 6.14, w: CW, h: 0.22, margin: 0, fontFace: SANS, fontSize: 8, color: DIM });
  s.addNotes(`主線は回転12ヶ月で${pc(P1.inv_yld)}。20%の分岐点は回転${mon(C1.breakeven.neutral)}で余裕は${(C1.breakeven.neutral - 12).toFixed(1)}ヶ月。`);
}

// ═══════════════════════════════════════════════════════════ 13 回転とリターン
{
  const s = chrome(base(), "BASE CASE ｜ 主線", "在庫回転期間と投資家リターンの関係",
    `いずれも投資家出資${okuN(C1.inv_capital)}円に対する数値。20%の分岐点は回転${mon(C1.breakeven.neutral)}であり、主線12ヶ月との余裕は小さい。`);

  const cats = HOLDS.map((h) => h + "ヶ月");
  const v1 = HOLDS.map((h) => +(C1.holds[h].inv_yld * 100).toFixed(1));
  const v2 = HOLDS.map((h) => +(C1.holds[h].avg5 * 100).toFixed(1));
  const cwid = (CW - 0.32) / 2;
  card(s, M, 1.80, cwid, 2.86);
  s.addChart(pres.ChartType.bar, [{ name: "投資家利回り", labels: cats, values: v1 }],
    Object.assign({}, CHART_BASE, {
      x: M + 0.14, y: 1.90, w: cwid - 0.28, h: 2.66,
      barDir: "col", barGapWidthPct: 55,
      title: "投資家利回り（定常年間・％）", valAxisMaxVal: Math.ceil(Math.max(...v1) * 1.2),
      chartColors: [GOLD],
      plotArea: { fill: { color: CARD } }, chartArea: { fill: { color: CARD } },
    }));
  card(s, M + cwid + 0.32, 1.80, cwid, 2.86);
  s.addChart(pres.ChartType.bar, [{ name: "投資家 年平均利回り", labels: cats, values: v2 }],
    Object.assign({}, CHART_BASE, {
      x: M + cwid + 0.46, y: 1.90, w: cwid - 0.28, h: 2.66,
      barDir: "col", barGapWidthPct: 55,
      title: "投資家 年平均利回り（5年通算・％）", valAxisMaxVal: Math.ceil(Math.max(...v2) * 1.2),
      chartColors: [GOLD_D],
      plotArea: { fill: { color: CARD } }, chartArea: { fill: { color: CARD } },
    }));

  const notes = [
    ["回転12ヶ月が必須条件", `20%の分岐点は回転${mon(C1.breakeven.neutral)}。主線との余裕は${(C1.breakeven.neutral - 12).toFixed(1)}ヶ月しかなく、回転12ヶ月の達成が貴社基準を満たすための必須条件となる。管理報酬2%を課す分、前回のデット型（余裕${(F.legacy.breakeven - 12).toFixed(1)}ヶ月）より余裕は小さい。`],
    ["値上がりが4ポイントを底上げする", `値上がりを織り込まない場合、主線でも${pc(C1.holds["12"].appr0)}にとどまり20%を割る。年6%の上昇が約${((P1.inv_yld - C1.holds["12"].appr0) * 100).toFixed(1)}ポイントを底上げして${pc(P1.inv_yld)}に届かせている（次頁）。`],
  ];
  notes.forEach((n, i) => {
    const x = M + i * (CW / 2 + 0.15);
    const w = CW / 2 - 0.15;
    card(s, x, 4.86, w, 1.34, { fill: i === 0 ? CARD2 : CARD, line: i === 0 ? GOLD_D : LINE });
    s.addText(n[0], { x: x + 0.28, y: 5.04, w: w - 0.56, h: 0.28, margin: 0, fontFace: SANS, fontSize: 12, bold: true, color: GOLD_L });
    s.addText(n[1], { x: x + 0.28, y: 5.36, w: w - 0.56, h: 0.72, margin: 0, fontFace: SANS, fontSize: 9.5, color: MUTED, lineSpacingMultiple: 1.18 });
  });
  s.addNotes("回転期間が一次的にリターンを決める。管理報酬2%の分だけ前回より余裕が小さい。");
}

// ═══════════════════════════════════════════════════════════ 14 値上がりの織り込み
{
  const s = chrome(base(), "PRICE APPRECIATION", "ワイン価格の上昇をどう織り込むか",
    "回転が落ちれば利回りは下がるが、保有が延びれば売値は上がる。両者は別々の収益源として足し合わさる。");

  const cwid = (CW - 0.32) / 2;
  const lift = P1.inv_yld - C1.holds["12"].appr0;
  const layers = [
    ["フロー｜流通価格差", "回転に対するリターン", "40〜60で仕入れ、70〜80で売る。年に何回まわせるかに比例するため、回転期間が短いほど大きくなる。",
      `主線（回転12ヶ月）で ${pc(C1.holds["12"].appr0)}`, false],
    ["ストック｜ワインの値上がり", "在庫に対するリターン", "保有している間、価格帯全体が年6%上昇する。在庫金額に対して発生するため、回転期間によらずほぼ一定になる。",
      `回転期間によらず 約 ＋${(lift * 100).toFixed(1)}pt`, true],
  ];
  layers.forEach((l, i) => {
    const x = M + (cwid + 0.32) * i;
    card(s, x, 1.82, cwid, 1.72, { fill: l[4] ? CARD2 : CARD, line: l[4] ? GOLD_D : LINE });
    s.addText(l[0], { x: x + 0.28, y: 1.98, w: cwid - 2.60, h: 0.28, margin: 0, fontFace: SANS, fontSize: 12.5, bold: true, color: l[4] ? GOLD_L : IVORY });
    s.addText(l[1], { x: x + cwid - 2.54, y: 1.98, w: 2.26, h: 0.28, margin: 0, align: "right", valign: "middle", fontFace: SANS, fontSize: 9.5, color: MUTED });
    s.addText(l[2], { x: x + 0.28, y: 2.32, w: cwid - 0.56, h: 0.62, margin: 0, fontFace: SANS, fontSize: 9.5, color: MUTED, lineSpacingMultiple: 1.22 });
    s.addText(l[3], { x: x + 0.28, y: 3.02, w: cwid - 0.56, h: 0.32, margin: 0, valign: "middle", fontFace: SANS, fontSize: 13, bold: true, color: GOLD_L });
  });

  const rows = [[th("在庫回転期間"), th("売値の上昇倍率"), th("① 価格差による利回り（上昇0%）"), th("② 値上がりによる上乗せ"), th("投資家利回り（①＋②）")]]
    .concat(HOLDS.map((h) => {
      const d = C1.holds[h], main = h === "12";
      return [
        td(h + "ヶ月" + (main ? "（主線）" : ""), main ? { bold: true, color: GOLD_L } : {}),
        td("×" + d.k.toFixed(3)), td(pc(d.appr0)),
        td("＋" + ((d.inv_yld - d.appr0) * 100).toFixed(1) + "pt", { color: GOLD_L }),
        td(pc(d.inv_yld), { bold: true, color: d.inv_yld >= F.params.target ? GOLD_L : IVORY }),
      ];
    }));
  table(s, rows, M, 3.66, CW, [2.25, 2.05, 3.05, 2.35, 2.19], { rowH: 0.375 });

  card(s, M, 5.66, 6.05, 1.12);
  s.addText("上昇率を変えた場合（主線）", { x: M + 0.26, y: 5.77, w: 4.2, h: 0.24, margin: 0, fontFace: SANS, fontSize: 10.5, bold: true, color: GOLD_L });
  const rates = [["0%（横ばい）", pc(C1.sensitivity.appr0)], ["6%（主線）", pc(C1.sensitivity.base)], ["10%（会社資料水準）", pc(C1.sensitivity.appr10)]];
  rates.forEach((r, i) => {
    const x = M + 0.26 + i * 1.86;
    s.addText(r[0], { x, y: 6.03, w: 1.78, h: 0.22, margin: 0, fontFace: SANS, fontSize: 9, color: MUTED });
    s.addText(r[1], { x, y: 6.24, w: 1.78, h: 0.34, margin: 0, valign: "middle", fontFace: LATIN, fontSize: 19, bold: true, color: i === 1 ? GOLD_L : IVORY });
  });

  card(s, M + 6.35, 5.66, CW - 6.35, 1.12, { fill: CARD2, line: GOLD_D });
  s.addText("値上がりは「相殺」ではなく「底上げ」", { x: M + 6.61, y: 5.77, w: 5, h: 0.24, margin: 0, fontFace: SANS, fontSize: 10.5, bold: true, color: GOLD_L });
  s.addText(`値上がりは在庫金額に対して発生するため、年間の上乗せ幅は回転期間によらず約${(lift * 100).toFixed(1)}ポイントで一定になる。回転が落ちた分をちょうど埋め合わせるわけではなく、どの回転期間でも一律に底上げする性質のもの。したがって回転期間の管理は引き続き最大の運用課題である。`, {
    x: M + 6.61, y: 6.02, w: CW - 6.87, h: 0.68, margin: 0, fontFace: SANS, fontSize: 9, color: MUTED, lineSpacingMultiple: 1.2 });

  s.addNotes(`値上がり効果は約＋${(lift * 100).toFixed(1)}ptで一定。これがないと主線でも${pc(C1.sensitivity.appr0)}で20%を割る。`);
}

// ═══════════════════════════════════════════════════════════ 15 上振れ・下振れ
{
  const s = chrome(base(), "UPSIDE / DOWNSIDE ｜ 副次", "上振れ余地と下振れリスク",
    "いずれも在庫回転期間を横軸に置いている。必要年間売上を併記し、実現可能性が判断できるようにしている。");

  const scTable = (key, x, hot) => {
    const sc = C1.scenarios[key];
    return [[th("回転期間"), th("必要年間売上"), th("年間税前"), th("投資家取分"), th("投資家利回り")]]
      .concat(HOLDS.map((h) => {
        const d = sc[h], ok = d.inv_yld >= F.params.target;
        return [td(h + "ヶ月"), td(oku(d.sales)), td(oku(d.pretax)), td(hyaku(d.inv)),
          td(pc(d.inv_yld), { bold: h === "9" || h === "12", color: hot ? GOLD_L : RED })];
      }));
  };

  card(s, M, 1.80, CW / 2 - 0.15, 2.76, { fill: CARD2, line: GOLD_D });
  s.addText(`ポジティブ｜取得原価${f2(F.unit["ポジティブ"].spc_cost)}・B2C100%・上昇6%`, {
    x: M + 0.28, y: 1.98, w: CW / 2 - 0.71, h: 0.28, margin: 0, fontFace: SANS, fontSize: 11.5, bold: true, color: GOLD_L });
  table(s, scTable("positive", M, true), M + 0.28, 2.32, 5.23, [0.90, 1.05, 0.98, 0.98, 1.32], { rowH: 0.315, fontSize: 9.5 });
  s.addText(`インポーター直仕入の比率を引き上げ、販売をネット最安値帯に寄せることで到達。ただし回転12ヶ月でも年間${oku(C1.scenarios.positive["12"].sales)}円の販売を要するため、現状の販売実力では到達しない。上限の目安として示す。`, {
    x: M + 0.28, y: 4.00, w: CW / 2 - 0.71, h: 0.52, margin: 0, fontFace: SANS, fontSize: 9, color: MUTED, lineSpacingMultiple: 1.2 });

  const nx = M + CW / 2 + 0.15;
  card(s, nx, 1.80, CW / 2 - 0.15, 2.76);
  s.addText("ネガティブ｜売値5%値引き ＋ 価格は横ばい（上昇0%）", {
    x: nx + 0.28, y: 1.98, w: CW / 2 - 0.71, h: 0.28, margin: 0, fontFace: SANS, fontSize: 11.5, bold: true, color: IVORY });
  table(s, scTable("negative", nx, false), nx + 0.28, 2.32, 5.23, [0.90, 1.05, 0.98, 0.98, 1.32], { rowH: 0.315, fontSize: 9.5 });
  s.addText(`値引き（${pt(C1.sensitivity.price5 - C1.sensitivity.base)}）と価格横ばい（${pt(C1.sensitivity.appr0 - C1.sensitivity.base)}）が同時に起きた複合ケース。この複合下振れでは回転${mon(C1.breakeven.negative)}まで縮めないと20%に届かず、想定レンジでは20%を確保できない。値引きを禁じることが最優先の防衛線となる。`, {
    x: nx + 0.28, y: 4.00, w: CW / 2 - 0.71, h: 0.52, margin: 0, fontFace: SANS, fontSize: 9, color: MUTED, lineSpacingMultiple: 1.2 });

  card(s, M, 4.74, CW, 1.42, { fill: CARD2, line: GOLD_D });
  s.addText("最重要の示唆", { x: M + 0.30, y: 4.92, w: 3, h: 0.28, margin: 0, fontFace: SANS, fontSize: 12, bold: true, color: GOLD_L });
  s.addText(`「回転を上げるために値引く」は割に合わない。売値5%の値引きは単位粗利を15%毀損し、失う投資家利回り${Math.abs((C1.sensitivity.price5 - C1.sensitivity.base) * 100).toFixed(1)}ポイントを取り戻すには回転を12ヶ月から約10ヶ月へ短縮する必要がある。価格を維持したまま販売チャネルを増やすことが本筋の改善手段であり、むしろ売れ残りは値上がりを取りにいく機会でもある。`, {
    x: M + 0.30, y: 5.24, w: CW - 0.60, h: 0.72, margin: 0, fontFace: SANS, fontSize: 11.5, color: IVORY, lineSpacingMultiple: 1.28 });
  s.addNotes("値引きは割に合わない。チャネル増加が本筋。");
}

// ═══════════════════════════════════════════════════════════ 16 3シナリオ比較
{
  const s = chrome(base(), "COMPARISON", "3シナリオ比較：投資家 定常年間利回り",
    `投資家出資${okuN(C1.inv_capital)}円に対する年間実力値。SPC税前利益のうち投資家出資分に帰属する分（40%）を、投資家とWineBankで折半した後の金額ベース。`);

  const cats = HOLDS.map((h) => h + "ヶ月");
  const ser = (key) => HOLDS.map((h) => +(C1.scenarios[key][h].inv_yld * 100).toFixed(1));
  const vp = ser("positive"), vn = ser("neutral"), vg = ser("negative");
  card(s, M, 1.80, CW, 2.98);
  s.addChart(pres.ChartType.bar, [
    { name: "ポジティブ", labels: cats, values: vp },
    { name: "ニュートラル（主線）", labels: cats, values: vn },
    { name: "ネガティブ", labels: cats, values: vg },
  ], Object.assign({}, CHART_BASE, {
    x: M + 0.14, y: 1.92, w: CW - 0.28, h: 2.74,
    barDir: "col", barGapWidthPct: 45,
    title: "在庫回転期間別 投資家利回り（％）",
    chartColors: [GOLD_L, GOLD, GOLD_D],
    showLegend: true, legendPos: "b", legendColor: MUTED, legendFontFace: SANS, legendFontSize: 9.5,
    valAxisMaxVal: Math.ceil(Math.max(...vp) * 1.12),
    plotArea: { fill: { color: CARD } }, chartArea: { fill: { color: CARD } },
  }));

  const cols = [
    ["主線の提示レンジ", `回転12ヶ月で投資家利回り${pc(P1.inv_yld)}。想定レンジ9〜18ヶ月では${pc(C1.holds["18"].inv_yld)}〜${pc(C1.holds["9"].inv_yld)}となり、20%を確保できるのは回転${mon(C1.breakeven.neutral)}までとなる。`, true],
    ["上振れの条件", `調達をインポーター直に寄せた場合の水準。ただし回転12ヶ月で年間${oku(C1.scenarios.positive["12"].sales)}円の販売を要するため、現状は到達しない。上限の目安。`, false],
    ["下振れの限界", `値引き5%と価格横ばいが重なった場合、想定レンジ内では20%に届かない（分岐点は回転${mon(C1.breakeven.negative)}）。値引き販売の禁止が最優先の防衛線となる。`, false],
  ];
  const cwid = (CW - 0.28 * 2) / 3;
  cols.forEach((c, i) => {
    const x = M + (cwid + 0.28) * i;
    card(s, x, 4.96, cwid, 1.12, { fill: c[2] ? CARD2 : CARD, line: c[2] ? GOLD_D : LINE });
    s.addText(c[0], { x: x + 0.26, y: 5.12, w: cwid - 0.52, h: 0.26, margin: 0, fontFace: SANS, fontSize: 11.5, bold: true, color: c[2] ? GOLD_L : IVORY });
    s.addText(c[1], { x: x + 0.26, y: 5.42, w: cwid - 0.52, h: 0.54, margin: 0, fontFace: SANS, fontSize: 9.5, color: MUTED, lineSpacingMultiple: 1.2 });
  });
  s.addNotes("3シナリオ比較。");
}

// ═══════════════════════════════════════════════════════════ 17 感応度
{
  const s = chrome(base(), "SENSITIVITY", "感応度：何が崩れると利回りがどう動くか",
    `主線（在庫回転12ヶ月・投資家利回り${pc(P1.inv_yld)}）を基準とした、各変数の単独変動による影響。`);

  const S = C1.sensitivity, b = S.base;
  const mv = (v) => `${pc(b)} → ${pc(v)}（${pt(v - b)}）`;
  const rows = [
    [th("変動要因"), th("変動幅"), th("投資家利回りへの影響"), th("深刻度"), th("対応方針")],
    [td("在庫回転期間"), td("12ヶ月 → 18ヶ月"), td(mv(S.hold18), { color: RED, bold: true }), td("最大", { color: RED, bold: true }), td("組入銘柄の選定・販売チャネルの多重化", { align: "left" })],
    [td("ワイン価格上昇率"), td("年6% → 0%（横ばい）"), td(mv(S.appr0), { color: RED }), td("大", { color: RED }), td("回転期間を短縮し、価格差収益の比重を高める", { align: "left" })],
    [td("売却価格"), td("売値 ▲5%（70/80→66.5/76）"), td(mv(S.price5), { color: RED }), td("大"), td("値引き販売を禁じ、価格維持を運用ルール化", { align: "left" })],
    [td("稼働率"), td("95% → 85%"), td(mv(S.util85), { color: RED }), td("中"), td("3年経過後の解約に備えた現金比率の設計と表裏", { align: "left" })],
    [td("B2Cのモール手数料"), td("5.5% → 8.0%"), td(mv(S.mall8), { color: MUTED }), td("小"), td("自社EC・自社オークションの構成比を引き上げる", { align: "left" })],
    [td("ワイン価格上昇率"), td("年6% → 10%（会社資料水準）"), td(mv(S.appr10), { color: GOLD_L }), td("上振れ", { color: GOLD_L }), td("Liv-ex連動銘柄の構成比を高める", { align: "left" })],
    [td("調達構成"), td("定価比 50 → 45"), td(mv(S.cost45), { color: GOLD_L, bold: true }), td("上振れ", { color: GOLD_L, bold: true }), td("インポーター直取引比率の引き上げが最大の改善策", { align: "left" })],
  ];
  table(s, rows, M, 1.80, CW, [1.96, 2.42, 2.58, 0.96, 3.97], { rowH: 0.39 });

  card(s, M, 5.14, CW, 1.10, { fill: CARD2, line: GOLD_D });
  s.addText(`結論：20%の分岐点は回転${mon(C1.breakeven.neutral)}（ニュートラル前提）であり、主線12ヶ月からの余裕は${(C1.breakeven.neutral - 12).toFixed(1)}ヶ月しかない。管理報酬年2%を課すため、前回のデット型（分岐点${mon(F.legacy.breakeven)}・余裕${(F.legacy.breakeven - 12).toFixed(1)}ヶ月）より余裕はさらに小さくなっている。回転12ヶ月の達成は「上振れ条件」ではなく必要条件であり、ここが本ファンド最大の管理項目となる。回転が15ヶ月へ延びれば${pc(C1.holds["15"].inv_yld)}、18ヶ月なら${pc(C1.holds["18"].inv_yld)}まで低下する。したがって組入銘柄は流動性上位に絞り込み、B2B卸とB2Cを併走させて販売量を確保する設計とする。`, {
    x: M + 0.30, y: 5.26, w: CW - 0.60, h: 0.86, margin: 0, valign: "middle",
    fontFace: SANS, fontSize: 10.5, color: IVORY, lineSpacingMultiple: 1.22 });
  s.addNotes(`20%の分岐点は回転${mon(C1.breakeven.neutral)}。管理報酬2%の分だけ前回より余裕が縮んでいる。`);
}

// ═══════════════════════════════════════════════════════════ 18 在庫配分の公平性
{
  const s = chrome(base(), "FAIR ALLOCATION", "WineBank在庫との公平性をどう担保するか",
    "調達・保管・販売のすべてをWineBankが担うため配分に構造的な利益相反が生じる。在庫比率によるプロラタ配分を原則とする。");

  const cw = (CW - 0.28 * 2) / 3;
  const layers = [
    ["01", "現物出資が相反そのものを縮小する", `WineBankが自己勘定在庫の相当部分（ファーストクローズで${okuN(C1.wb_capital)}円相当）をSPCへ拠出するため、両者に同一銘柄が併存する場面自体が減る。加えてWineBankはSPCの持分60%を通じて損益を負うため、SPC在庫を後回しにする経済的動機が構造的に小さい。`, true],
    ["02", "プロラタ配分を原則とする", "同一銘柄が両者にある場合、売却を在庫数量の比率に応じて配分する。個々の売却は分割できないため、累計の配分比率が在庫比率に一致するよう配分台帳で管理し、乖離の大きい側から出庫する。判断を要する場合はSPC在庫を優先する。", false],
    ["03", "価格同一ルールと補填条項", "同一SKU・同一四半期の実現単価は、SPCがWineBank自己勘定を下回らないものとする。下回った場合は差額×SPC数量をWineBankがSPCへ現金で補填する。運用が崩れても投資家が金額で守られる仕組みとする。", false],
  ];
  layers.forEach((l, i) => {
    const x = M + (cw + 0.28) * i;
    card(s, x, 1.78, cw, 2.02, { fill: l[3] ? CARD2 : CARD, line: l[3] ? GOLD_D : LINE });
    badge(s, x + 0.26, 1.98, 0.34, l[0]);
    s.addText(l[1], { x: x + 0.70, y: 2.00, w: cw - 0.96, h: 0.30, margin: 0, valign: "middle", fontFace: SANS, fontSize: 11, bold: true, color: l[3] ? GOLD_L : IVORY });
    s.addText(l[2], { x: x + 0.26, y: 2.48, w: cw - 0.52, h: 1.42, margin: 0, fontFace: SANS, fontSize: 9, color: MUTED, lineSpacingMultiple: 1.22 });
  });

  const rows = [
    [th("担保の手段"), th("内容")],
    [td("拠出銘柄の選定ルール"), td("現物出資する銘柄は流動性上位から選び、滞留在庫の受け皿としない。拠出銘柄リストは投資家の事前確認を要する", { align: "left", color: GOLD_L })],
    [td("現物出資の評価"), td("評価方法は組成時に別途協議して確定し、第三者評価または客観的な価格資料で裏付ける。評価根拠は投資家へ開示する", { align: "left", color: GOLD_L })],
    [td("取得時の按分"), td("同一SKUを複数ロット取得する場合は、SPCとWineBank自己勘定の在庫比率に応じて按分して割り当てる", { align: "left" })],
    [td("配分台帳"), td("SKU別に期首在庫・取得・売却・期末在庫を両建てで記録し、累計配分比率と在庫比率の乖離を四半期ごとに投資家へ開示する", { align: "left" })],
    [td("システムによる自動割当"), td("出庫指示はシステム側で自動割当とし、担当者が出所を選択できない設計とする。変更は理由の記録を必須とする", { align: "left" })],
    [td("倉庫内の分別保管"), td("SPC名義の在庫は別ロケーション・別ラベルで管理し、現物の特定可能性を確保する。四半期ごとに第三者棚卸を実施する", { align: "left" })],
    [td("独立第三者による検証"), td("AUPの対象に配分ルールおよび拠出銘柄選定の遵守状況を含め、公認会計士による年次の検証を受ける", { align: "left" })],
  ];
  table(s, rows, M, 3.94, CW, [2.60, 9.29], { rowH: 0.285 });

  s.addText("※ SPC在庫を完売するまで自己勘定在庫を売らないという運用は、商品構成が銘柄ごとに異なるため実務上成立しない。したがってプロラタ配分を原則とし、プロラタで決まらない部分についてSPCを優先する設計とした。現物出資型では「何を拠出するか」が「どちらを先に売るか」以上に重要な論点となるため、拠出銘柄の選定ルールを最大の担保として新たに置いている。", {
    x: M, y: 6.34, w: CW, h: 0.36, margin: 0, fontFace: SANS, fontSize: 8, color: DIM, lineSpacingMultiple: 1.18 });
  s.addNotes("現物出資により相反は縮小するが、拠出銘柄の選定が新たな論点になる。");
}

// ═══════════════════════════════════════════════════════════ 19 ガバナンス
{
  const s = chrome(base(), "GOVERNANCE", "情報開示・報告と利益相反の管理",
    "運営者への依存度が高いスキームであるため、開示義務と利益相反管理を契約上で具体的に定める。");

  const lw = (CW - 0.30) / 2;
  card(s, M, 1.78, lw, 3.46);
  s.addText("契約上の報告・開示義務", { x: M + 0.28, y: 1.96, w: lw - 0.56, h: 0.28, margin: 0, fontFace: SANS, fontSize: 12.5, bold: true, color: GOLD_L });
  const disc = [
    "四半期ごとの損益、資金収支および事業進捗",
    "仕入数量・仕入単価・販売数量・販売単価・在庫数量",
    "現物出資した銘柄の明細、評価額およびその算定根拠",
    "資金使途、銀行口座残高および主要な支払内容",
    "関連当事者取引・利益相反取引の内容、金額、取引条件",
    "一定金額以上の取引、借入れ、追加投資、契約変更の事前承認",
    "会計帳簿・請求書・契約書・銀行取引記録の閲覧および調査権",
    "重大な計画変更、損失発生、不正または法令違反時の速やかな報告",
  ];
  let dy = 2.34;
  disc.forEach((d) => {
    badge(s, M + 0.30, dy + 0.045, 0.14, "", { line: GOLD, fill: GOLD });
    s.addText(d, { x: M + 0.54, y: dy - 0.04, w: lw - 0.84, h: 0.32, margin: 0, fontFace: SANS, fontSize: 9.5, color: MUTED, lineSpacingMultiple: 1.15 });
    dy += 0.345;
  });

  const rx = M + lw + 0.30;
  card(s, rx, 1.78, lw, 3.46, { fill: CARD2, line: GOLD_D });
  s.addText("利益相反の管理", { x: rx + 0.28, y: 1.96, w: lw - 0.56, h: 0.28, margin: 0, fontFace: SANS, fontSize: 12.5, bold: true, color: GOLD_L });
  const coi = [
    ["現物出資の評価", "拠出するワインの評価方法を契約上明記し、第三者評価または客観的な価格資料により裏付ける。評価額および拠出銘柄は投資家の事前確認を要する。"],
    ["独立企業間価格の原則", "運営者およびその関係会社との取引は、第三者との取引条件と同等の条件によるものとする。現物譲渡の1%を含め、価格の合理性を客観的資料で説明できる状態を維持する。"],
    ["重要な関連当事者取引の事前承認", "一定金額以上の取引については、投資家または独立した第三者の事前承認を要する。"],
    ["在庫配分ルールの遵守", "前頁の配分方針および拠出銘柄選定ルールを契約別紙として明文化し、逸脱時の是正・補填手続を定める。"],
  ];
  let cy = 2.34;
  coi.forEach((c) => {
    s.addText(c[0], { x: rx + 0.28, y: cy, w: lw - 0.56, h: 0.24, margin: 0, fontFace: SANS, fontSize: 10.5, bold: true, color: IVORY });
    s.addText(c[1], { x: rx + 0.28, y: cy + 0.24, w: lw - 0.56, h: 0.48, margin: 0, fontFace: SANS, fontSize: 9, color: MUTED, lineSpacingMultiple: 1.2 });
    cy += 0.72;
  });

  const bw = (CW - 0.28 * 2) / 3;
  const g = [
    ["ファンド形態", "適格機関投資家等特例業務", "第1号ファンド（合同会社WineBank P1）で届出の実績がある。適格機関投資家1名以上の確保を組成条件とする。"],
    ["外部検証", "AUP（合意された手続）", "財務諸表監査ではなく、目的を限定した合意された手続を採用。年50万円をSPC費用に計上済み。現物出資の評価も検証対象に含める。"],
    ["報告頻度", "四半期", "在庫明細・簿価・売上・試算表を四半期ごとに開示。年次で決算を報告する。"],
  ];
  g.forEach((x0, i) => {
    const x = M + (bw + 0.28) * i;
    card(s, x, 5.44, bw, 1.24);
    s.addText(x0[0], { x: x + 0.26, y: 5.56, w: bw - 0.52, h: 0.22, margin: 0, fontFace: SANS, fontSize: 9.5, color: MUTED });
    s.addText(x0[1], { x: x + 0.26, y: 5.78, w: bw - 0.52, h: 0.28, margin: 0, fontFace: SANS, fontSize: 12, bold: true, color: GOLD_L });
    s.addText(x0[2], { x: x + 0.26, y: 6.08, w: bw - 0.52, h: 0.54, margin: 0, fontFace: SANS, fontSize: 8.5, color: MUTED, lineSpacingMultiple: 1.18 });
  });
  s.addNotes("高岡先生の指摘事項を条項化。現物出資の評価を開示・相反管理の両方に追加した。");
}

// ═══════════════════════════════════════════════════════════ 20 リスク
{
  const s = chrome(base(), "RISK", "想定されるリスクと対応策", null);

  const risks = [
    ["在庫リスク", "想定価格で売り切れず滞留する", "銘柄をLiv-ex掲載の流通量の多い銘柄に限定。四半期ごとに滞留在庫を洗い出し、簿価見直しを実施。滞留は値上がりを取る期間でもある。"],
    ["価格変動リスク", "Fine Wine市況の下落・停滞", `主線は年6%上昇を織り込むが、横ばい（0%）でも投資家利回り${pc(C1.sensitivity.appr0)}を確保できる。会社資料の年率10%に対し保守的な前提。`],
    ["流動性リスク", "現物のため即時換金できない", "当初3年間はロックアップ。4年目以降は年度ごとの解約日に対応し、解約枠に応じて現金比率を引き上げる。"],
    ["調達リスク", "想定価格・数量で仕入れられない", "インポーター・酒販店との年間調達枠を事前に締結。調達実績を四半期報告。"],
    ["オペレーションリスク", "保管中の破損・劣化・盗難", "定温倉庫での保管と動産総合保険による全量付保。ロスは保険でカバーする前提のため費用計上していない。倉庫在庫は四半期ごとに第三者棚卸。"],
    ["カウンターパーティリスク", "WineBankの信用・実行力", `SPCを倒産隔離。ワイン現物はSPC名義で保有しWineBankの債権者から隔離する。WineBankは総額の60%（${okuN(C1.wb_capital)}円）を出資しており、投資家と損益をともにする。`],
    ["免許・商流リスク", "免許事業者の変更・取引口座の喪失", "WineBankの免許維持を契約上の義務とし、免許喪失時は在庫を売却清算して早期償還する条項を置く。"],
    ["現物出資の評価リスク", "拠出価格の妥当性を否認される", "評価方法を契約上明記し、第三者評価または客観的な価格資料で裏付ける。酒類の現物出資に係る免許・消費税・法人税上の取扱いは組成前に専門家と確定させる。"],
  ];
  const cwid = (CW - 0.28 * 3) / 4;
  risks.forEach((r, i) => {
    const col = i % 4, row = Math.floor(i / 4);
    const x = M + (cwid + 0.28) * col;
    const y = 1.70 + row * 2.32;
    card(s, x, y, cwid, 2.10, { fill: i === 7 ? CARD2 : CARD, line: i === 7 ? GOLD_D : LINE });
    s.addText(r[0], { x: x + 0.26, y: y + 0.22, w: cwid - 0.52, h: 0.28, margin: 0, fontFace: SANS, fontSize: 12, bold: true, color: IVORY });
    s.addText(r[1], { x: x + 0.26, y: y + 0.54, w: cwid - 0.52, h: 0.42, margin: 0, fontFace: SANS, fontSize: 9.5, color: GOLD_L, lineSpacingMultiple: 1.15 });
    s.addText(r[2], { x: x + 0.26, y: y + 1.02, w: cwid - 0.52, h: 0.92, margin: 0, fontFace: SANS, fontSize: 9, color: MUTED, lineSpacingMultiple: 1.2 });
  });
  s.addNotes("デットの廃止により保証・金利リスクは消え、代わりに現物出資の評価リスクが加わった。");
}

// ═══════════════════════════════════════════════════════════ 21 条件
{
  const s = chrome(base(), "TERMS", "ファンド設計条件（ドラフト）",
    "組成・資本構成（左）と、運用・費用・報告（右）に分けて記載する。");

  const tw2 = (CW - 0.30) / 2;
  const colW = [1.68, tw2 - 1.68];

  const left = [
    [th("項目"), th("内容")],
    [td("組成形態"), td("合同会社＋匿名組合（GK-TK）。SPCレベルでは非課税、投資家側で課税", { align: "left" })],
    [td("ファンド形態"), td("適格機関投資家等特例業務による私募。適格機関投資家1名以上の確保を組成条件とする", { align: "left" })],
    [td("募集総額"), td(`ファーストクローズ${okuN(C1.total)}円 → 年度内セカンドクローズ${okuN(C2.total)}円`, { align: "left", color: GOLD_L, bold: true })],
    [td("資本構成"), td(`WineBank現物出資60%（${okuN(C1.wb_capital)}円）＋投資家出資40%（${okuN(C1.inv_capital)}円）。1口5,000万円以上`, { align: "left", color: GOLD_L, bold: true })],
    [td("損益の配分"), td("投資家出資分に帰属する40%を投資家とWineBankで折半（成功報酬）。WineBank出資分の60%は持分として帰属", { align: "left", color: GOLD_L, bold: true })],
    [td("運用期間"), td("5年。満期時に在庫を売却清算のうえ元本償還", { align: "left" })],
    [td("中途解約"), td("3年経過後、年度ごとの解約日に申出可（90日前通知）。当初3年間はロックアップ", { align: "left", color: GOLD_L, bold: true })],
    [td("分配"), td("年1回。元本はSPC内に留保し継続運用（複利再投資は行わない）", { align: "left" })],
  ];
  const right = [
    [th("項目"), th("内容")],
    [td("現物の取得"), td(`WineBank出資分は現物出資。投資家出資分はWineBankからSPCへ譲渡（＋1%）。評価方法は組成時に別途協議`, { align: "left" })],
    [td("資金配分"), td("総額の95%をワイン購入、5%を現金保有", { align: "left", color: GOLD_L, bold: true })],
    [td("販売チャネル"), td("酒販店卸（B2B）と自社EC・オークション（B2C）を半々", { align: "left" })],
    [td("在庫回転目標"), td("12ヶ月。最短9ヶ月、延びても15〜18ヶ月を想定レンジとする", { align: "left", color: GOLD_L, bold: true })],
    [td("SPC負担費用"), td("保管・保険・入庫・変動販売費／維持費200万・管理報酬（総額の年2%）・AUP50万・予備費50万", { align: "left" })],
    [td("想定リターン"), td(`投資家利回り${pc(P1.inv_yld)}（回転12ヶ月・定常年間）。5年通算の年平均は${pc(P1.avg5)}`, { align: "left", color: GOLD_L, bold: true })],
    [td("報告・外部検証"), td("四半期：在庫明細・簿価・売上・試算表／年次：決算。AUPを年次実施", { align: "left" })],
    [td("在庫配分"), td("在庫比率によるプロラタを原則とし、判断を要する場合はSPC在庫を優先", { align: "left", color: GOLD_L, bold: true })],
  ];
  table(s, left,  M, 1.74, tw2, colW, { rowH: 0.335, fontSize: 8.5 });
  table(s, right, M + tw2 + 0.30, 1.74, tw2, colW, { rowH: 0.335, fontSize: 8.5 });

  card(s, M, 5.96, CW, 0.94, { fill: CARD2, line: GOLD_D });
  s.addText("3年ロックアップが稼働率95%を可能にしている", { x: M + 0.30, y: 6.06, w: 6, h: 0.24, margin: 0, fontFace: SANS, fontSize: 11, bold: true, color: GOLD_L });
  s.addText(`半期解約を前提とすると常時1〜3割を現金または即時換金可能な在庫で保有する必要があり、稼働率が下がって利回りも下がる（稼働率95%→85%で投資家利回りは${pc(C1.sensitivity.base)}→${pc(C1.sensitivity.util85)}）。当初3年ロックアップ・4年目以降は年度ごとの解約という設計により、現金保有を5%に抑え、総額の95%をワインに充当できる。`, {
    x: M + 0.30, y: 6.32, w: CW - 0.60, h: 0.48, margin: 0, fontFace: SANS, fontSize: 9, color: MUTED, lineSpacingMultiple: 1.16 });
  s.addNotes("運用期間5年・3年ロックアップ・年度解約。分配は年1回。報告は四半期。");
}

// ═══════════════════════════════════════════════════════════ 22 ネクストステップ
{
  const s = chrome(base(), "NEXT STEPS", "今後の進め方", null);

  const steps = [
    ["01", "前提条件のすり合わせ", "想定回転期間・販売チャネル構成・解約条件・折半の定義（税前利益ベース）、管理報酬2%の水準についてご意見をいただく。"],
    ["02", "現物出資の評価方法の確定", "WineBankが拠出するワインの評価方法と拠出銘柄の選定基準を確定する。第三者評価の要否、消費税・法人税上の取扱いを併せて確認する。"],
    ["03", "免許・税務の確定", "SPCの免許要否と売買形態、酒類の現物出資の取扱いを所轄税務署（酒類指導官）・顧問弁護士と確認。譲渡価格1%の算定根拠を文書化する。"],
    ["04", "調達枠の確保と実証", "インポーター・酒販店との年間調達枠を締結し、小規模ロットで回転期間とチャネル別手数料の実証を行う。"],
    ["05", "ファーストクローズと実証", `総額${okuN(C1.total)}円で組成し運用開始。回転12ヶ月の実績を確認したうえで、年度内のセカンドクローズ（総額${okuN(C2.total)}円）を判断する。`],
  ];
  const cwid = (CW - 0.24 * 4) / 5;
  steps.forEach((st, i) => {
    const x = M + (cwid + 0.24) * i;
    card(s, x, 1.72, cwid, 3.10, { fill: i === 1 ? CARD2 : CARD, line: i === 1 ? GOLD_D : LINE });
    badge(s, x + 0.24, 1.96, 0.40, st[0], { size: 12 });
    s.addText(st[1], { x: x + 0.24, y: 2.52, w: cwid - 0.48, h: 0.62, margin: 0, fontFace: SANS, fontSize: 12, bold: true, color: IVORY, lineSpacingMultiple: 1.15 });
    s.addText(st[2], { x: x + 0.24, y: 3.20, w: cwid - 0.48, h: 1.42, margin: 0, fontFace: SANS, fontSize: 9.5, color: MUTED, lineSpacingMultiple: 1.26 });
  });

  card(s, M, 5.04, CW, 1.06);
  s.addText("本資料の数値は一定の前提に基づく試算であり、将来の運用成果を保証するものではありません。最終的な条件は契約書に基づきます。免許・税務の取扱いおよび現物出資の評価は、所轄官庁および専門家の確認を経て確定します。", {
    x: M + 0.30, y: 5.20, w: CW - 0.60, h: 0.74, margin: 0, valign: "middle",
    fontFace: SANS, fontSize: 10, color: MUTED, lineSpacingMultiple: 1.24 });
  s.addNotes("現物出資の評価方法の確定を第2ステップに置く。セカンドクローズは回転実績を見て判断。");
}

// ═══════════════════════════════════════════════════════════ 23 まとめ
{
  const s = chrome(base(), "CONCLUSION", "まとめ：本ファンドに出資いただく意義", null);

  const LW = 7.15;
  const merits = [
    ["運営者が同じ船に乗っている",
     `WineBankが総額の60%（ファーストクローズで${okuN(C1.wb_capital)}円）をワイン現物で出資する。デットのような優先弁済も保証もなく、投資家と同じ持分として損益をそのまま負う。値付けや配分で抜く経済的動機が構造的に生じない。`],
    ["現物が元本を裏付ける",
     "出資金の95%が常にワイン現物として存在する。SPC名義で保有し倒産隔離。保有している限り値上がりも取り込める。"],
    ["収益が二階建てで、片方が崩れても成立する",
     `流通価格差（回転に対するリターン）とワインの値上がり（在庫に対するリターン）。価格が横ばいでも投資家利回り${pc(C1.sensitivity.appr0)}、回転が18ヶ月に延びても${pc(C1.holds["18"].inv_yld)}を確保する。`],
    ["他社が再現できない調達力",
     "創業55年の酒販免許、大手インポーターとの直接取引、輸出入ライセンス。新規参入業者が正規品を同じ価格で大量に仕入れることはできない。"],
    ["出口をB2B・B2Cの両輪で持っている",
     "酒販店卸（B2B）に加え、自社EC・オークション・CLUB会員・グループのアピシウス（B2C）。手取りの高いチャネルを選べる構造。"],
  ];
  let my = 1.72;
  merits.forEach((m, i) => {
    card(s, M, my, LW, 0.82, { fill: i === 0 ? CARD2 : CARD, line: i === 0 ? GOLD_D : LINE });
    badge(s, M + 0.24, my + 0.24, 0.34, String(i + 1).padStart(2, "0"));
    s.addText(m[0], {
      x: M + 0.68, y: my + 0.10, w: LW - 0.94, h: 0.26, margin: 0,
      fontFace: SANS, fontSize: 11.5, bold: true, color: i === 0 ? GOLD_L : IVORY });
    s.addText(m[1], {
      x: M + 0.68, y: my + 0.36, w: LW - 0.94, h: 0.40, margin: 0,
      fontFace: SANS, fontSize: 8.5, color: MUTED, lineSpacingMultiple: 1.12 });
    my += 0.90;
  });

  const RX = M + LW + 0.30, RW = CW - LW - 0.30;
  card(s, RX, 1.72, RW, 4.42, { fill: CARD2, line: GOLD_D });
  s.addText("貴社の投資基準との照合", {
    x: RX + 0.28, y: 1.92, w: RW - 0.56, h: 0.28, margin: 0,
    fontFace: SANS, fontSize: 12.5, bold: true, color: GOLD_L });

  const checks = [
    ["想定利回り20%（実績）に対して",
     `在庫回転12ヶ月を主線とし、投資家利回り${pc(P1.inv_yld)}。20%の分岐点は回転${mon(C1.breakeven.neutral)}であり、余裕は${(C1.breakeven.neutral - 12).toFixed(1)}ヶ月しかない。`,
     "回転12ヶ月の達成が20%確保の必要条件となる。流動性上位の銘柄に絞って組み入れ、回転期間を運用KPIとして四半期報告する。"],
    ["解約条件に対して",
     "運用期間5年・当初3年ロックアップ・4年目以降は年度ごとの解約。分配は毎年1回。",
     `この設計により現金保有を5%に抑え、総額の95%をワインに充当できる。半期解約を前提とすると稼働率が下がり${pc(C1.sensitivity.base)}→${pc(C1.sensitivity.util85)}に低下する。`],
    ["リスク分散に対して",
     `伝統的資産と相関の低い実物資産。既存30億円のポートフォリオに対し出資${okuN(C1.inv_capital)}円は約7%。`,
     "単一銘柄ではなく複数産地・複数ヴィンテージへの分散となり、ポートフォリオ内での分散効果が働く。"],
  ];
  let cy = 2.34;
  checks.forEach((c) => {
    badge(s, RX + 0.28, cy + 0.045, 0.15, "", { line: GOLD, fill: GOLD });
    s.addText(c[0], {
      x: RX + 0.54, y: cy - 0.02, w: RW - 0.82, h: 0.24, margin: 0,
      fontFace: SANS, fontSize: 10.5, bold: true, color: IVORY });
    s.addText(c[1], {
      x: RX + 0.54, y: cy + 0.23, w: RW - 0.82, h: 0.42, margin: 0,
      fontFace: SANS, fontSize: 9, color: MUTED, lineSpacingMultiple: 1.18 });
    s.addText(c[2], {
      x: RX + 0.54, y: cy + 0.66, w: RW - 0.82, h: 0.50, margin: 0,
      fontFace: SANS, fontSize: 9, color: GOLD_L, lineSpacingMultiple: 1.18 });
    cy += 1.30;
  });

  card(s, M, 6.26, CW, 0.62);
  s.addText("ワインは飲めば消える嗜好品ではなく、正規流通の価格差という再現性のある収益源です。その価格差を取りに行く実務を、55年分の免許と取引関係で担うのがWineBankです。本ファンドは、その実務にWineBank自身も現物で出資し、同じ船に乗ったうえでご一緒いただくご提案です。", {
    x: M + 0.30, y: 6.36, w: CW - 0.60, h: 0.42, margin: 0, valign: "middle",
    fontFace: SANS, fontSize: 10.5, color: IVORY, lineSpacingMultiple: 1.2 });

  s.addNotes("最大の訴求点は現物出資60%による利害の一致。");
}

// ═══════════════════════════════════════════════════════════ 24 クロージング
{
  const s = base();
  page += 1;
  s.addShape(pres.ShapeType.ellipse, {
    x: -1.6, y: 1.55, w: 4.4, h: 4.4,
    fill: { color: BG }, line: { color: "1E1A15", width: 1.1 },
  });
  s.addShape(pres.ShapeType.ellipse, {
    x: 10.9, y: -1.3, w: 4.4, h: 4.4,
    fill: { color: BG }, line: { color: GOLD_D, width: 0.9 },
  });

  s.addText("すべての人にファインワインを", {
    x: M, y: 2.72, w: CW, h: 0.76, margin: 0, align: "center",
    fontFace: SERIF, fontSize: 34, bold: true, color: IVORY,
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

pres.writeFile({ fileName: "WineBank_ワインファンドSPC組成提案_山本案_現物出資型_20260906.pptx" })
  .then((f) => console.log("written:", f));
