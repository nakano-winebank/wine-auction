const pptxgen = require("pptxgenjs");

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
  // 装飾：ゴールドの同心円（右側）
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
  s.addText("投資枠 5億円 ／ 期間3年 ／ 半期分配 ／ SPC収益は投資家50：WineBank50", {
    x: M, y: 4.52, w: 9.0, h: 0.3, margin: 0,
    fontFace: SANS, fontSize: 12.5, color: MUTED,
  });
  s.addText("2026年8月11日改訂版　現物譲渡1%・SPC人件費を反映", {
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
  s.addNotes("5億円のワインファンド組成提案。8/5版に対し、①SPC人件費360万円、②WineBank→SPC現物譲渡1%、③商流・免許上の制約を反映した改訂版。");
}

// ═══════════════════════════════════════════════════════════ 02 サマリー
{
  const s = chrome(base(), "EXECUTIVE SUMMARY", "本ファンドの骨子",
    "実物ワインの流通価格差を収益源とする、現物裏付け型の短期回転ファンド。");

  const tw = (CW - 0.30 * 3) / 4;
  stat(s, M + (tw + 0.30) * 0, 1.82, tw, 1.62, "5", "億円", "投資受入枠", "SPC（GK-TK方式を想定）／期間3年・半期分配");
  stat(s, M + (tw + 0.30) * 1, 1.82, tw, 1.62, "32.7", "%", "想定粗利率（主線）", "SPC取得原価50.5・売値75・粗利24.5");
  stat(s, M + (tw + 0.30) * 2, 1.82, tw, 1.62, "16.9", "%", "定常年間利回り", "回転12ヶ月・投資家取分ベースの実力値");
  stat(s, M + (tw + 0.30) * 3, 1.82, tw, 1.62, "11.1–17.0", "%", "年平均利回り（3年通算）", "回転12ヶ月〜9ヶ月／税引前",
    { vs: 24, fill: CARD2, line: GOLD_D });

  const pts = [
    ["リターンを決めるのは粗利率ではなく在庫回転期間。", "粗利率は前提として固定されるため、投資家リターンは「在庫を年に何回まわせるか」でほぼ決まる。回転9ヶ月で定常利回り23.1%、12ヶ月で16.9%。"],
    ["現物ワインが常に元本を裏付ける。", "SPC名義でワイン現物を保有。値上がり益は一切リターンに算入せず、流通価格差のみを収益源とする保守設計。"],
    ["酒類の商流上、SPCは直接仕入・販売ができない。", "WineBankが免許事業者として調達し、現物をSPCへ譲渡する。独立企業間価格として1%を付加（5億なら実商品原価4.95億＋譲渡マージン500万円）。"],
    ["解約自由度と利回りはトレードオフ。", "半期解約に応じるには現金保有比率を上げる必要があり、稼働率85%→70%で定常利回りは16.9%→13.7%に低下する。"],
  ];
  let y = 3.72;
  pts.forEach((p, i) => {
    badge(s, M, y + 0.02, 0.30, String(i + 1).padStart(2, "0"), { size: 8.5 });
    s.addText(p[0], {
      x: M + 0.46, y: y - 0.02, w: CW - 0.46, h: 0.26, margin: 0,
      fontFace: SANS, fontSize: 12, bold: true, color: IVORY,
    });
    s.addText(p[1], {
      x: M + 0.46, y: y + 0.24, w: CW - 0.46, h: 0.30, margin: 0,
      fontFace: SANS, fontSize: 10, color: MUTED,
    });
    y += 0.68;
  });
  s.addNotes("骨子。主線は回転9〜12ヶ月で定常年間利回り16.9〜23.1%、3年通算の年平均利回り11.1〜17.0%。");
}

// ═══════════════════════════════════════════════════════════ 03 改訂差分
{
  const s = chrome(base(), "REVISION", "8月5日版からの改訂点",
    "ご指摘の2点をモデルに織り込み、全数値を再計算した。定常利回りへの影響は合計▲1.0ポイント。");

  const cw = (CW - 0.34 * 2) / 3;
  const items = [
    ["01", "SPC人件費 年360万円を計上", "SPC運営に係るWineBank側の実務人件費を、GP取分ではなくSPCの固定費として明示計上。SPC維持費は年800万円→1,160万円。", "定常利回り ▲0.36pt"],
    ["02", "現物譲渡に1%を付加", "WineBankが取得した現物をSPCへ譲渡する際、独立企業間価格として1%を付加。SPCの取得原価は定価比50.0→50.5となる。", "定常利回り ▲0.61pt"],
    ["03", "商流・免許の制約を明記", "酒類販売業免許と取引口座の制約により、SPCが直接仕入・販売を行えない点をスキームの前提として1枚で整理（次々頁）。", "スキーム前提の明確化"],
  ];
  items.forEach((it, i) => {
    const x = M + (cw + 0.34) * i;
    card(s, x, 1.86, cw, 2.06);
    badge(s, x + 0.26, 2.08, 0.34, it[0]);
    s.addText(it[1], {
      x: x + 0.70, y: 2.10, w: cw - 0.96, h: 0.30, margin: 0, valign: "middle",
      fontFace: SANS, fontSize: 12, bold: true, color: IVORY,
    });
    s.addText(it[2], {
      x: x + 0.26, y: 2.60, w: cw - 0.52, h: 0.82, margin: 0,
      fontFace: SANS, fontSize: 9.5, color: MUTED, lineSpacingMultiple: 1.22,
    });
    s.addText(it[3], {
      x: x + 0.26, y: 3.46, w: cw - 0.52, h: 0.26, margin: 0,
      fontFace: SANS, fontSize: 10, bold: true, color: i === 2 ? GOLD_L : RED,
    });
  });

  const rows = [
    [th("在庫回転期間"), th("定常年間利回り（8/5版）"), th("定常年間利回り（今回版）"), th("差"),
     th("年平均利回り 3年通算（8/5版）"), th("年平均利回り 3年通算（今回版）"), th("差")],
    [td("9ヶ月"), td("24.3%"), td("23.1%"), td("▲1.2pt", { color: RED }), td("18.0%"), td("17.0%"), td("▲1.0pt", { color: RED })],
    [td("12ヶ月（主線）", { bold: true, color: GOLD_L }), td("17.8%"), td("16.9%", { bold: true, color: GOLD_L }), td("▲1.0pt", { color: RED }), td("11.8%"), td("11.1%", { bold: true, color: GOLD_L }), td("▲0.7pt", { color: RED })],
    [td("15ヶ月"), td("14.0%"), td("13.1%"), td("▲0.8pt", { color: RED }), td("11.5%"), td("10.8%"), td("▲0.8pt", { color: RED })],
    [td("18ヶ月"), td("11.4%"), td("10.7%"), td("▲0.8pt", { color: RED }), td("5.6%"), td("5.1%"), td("▲0.4pt", { color: RED })],
  ];
  table(s, rows, M, 4.16, CW, [2.3, 1.72, 1.72, 1.0, 1.86, 1.86, 1.0], { rowH: 0.33 });

  s.addText("※ 8/5版の列は、今回と同一の月次モデルに旧前提（譲渡マージンなし・人件費なし）を入れて再計算したもの。定常年間利回り＝運用が軌道に乗った後の年間実力値、年平均利回り＝運用期間中の累計分配額を出資額と年数で割った通算値。いずれも投資家の税引前ベース。", {
    x: M, y: 5.90, w: CW, h: 0.44, margin: 0,
    fontFace: SANS, fontSize: 8.5, color: DIM, lineSpacingMultiple: 1.2,
  });
  s.addNotes("改訂は2点。影響は定常年間利回りで▲1.0pt、3年通算の年平均利回りで▲0.7pt。粗利率は33.3%→32.7%となる。");
}

// ═══════════════════════════════════════════════════════════ 04 スキーム
{
  const s = chrome(base(), "STRUCTURE", "ファンドスキーム",
    "WineBankが免許事業者として売買当事者となり、SPCは現物の所有者として損益を受ける。");

  // 3ボックス（投資家 / SPC / WineBank）
  const bw = 3.55, by = 1.86, bh = 1.30;
  const bx1 = M, bx2 = M + (CW - bw) / 2, bx3 = M + CW - bw;

  card(s, bx1, by, bw, bh);
  s.addText("投資家（資産管理会社）", { x: bx1 + 0.24, y: by + 0.24, w: bw - 0.48, h: 0.28, margin: 0, fontFace: SANS, fontSize: 13, bold: true, color: IVORY });
  s.addText("匿名組合出資　5億円", { x: bx1 + 0.24, y: by + 0.58, w: bw - 0.48, h: 0.26, margin: 0, fontFace: SANS, fontSize: 10.5, color: GOLD_L });
  s.addText("半期ごとに税前利益の50%を受領", { x: bx1 + 0.24, y: by + 0.86, w: bw - 0.48, h: 0.26, margin: 0, fontFace: SANS, fontSize: 9.5, color: MUTED });

  card(s, bx2, by, bw, bh, { fill: CARD2, line: GOLD_D });
  s.addText("ワインファンドSPC", { x: bx2 + 0.24, y: by + 0.24, w: bw - 0.48, h: 0.28, margin: 0, fontFace: SANS, fontSize: 13, bold: true, color: GOLD_L });
  s.addText("合同会社＋匿名組合（GK-TK）", { x: bx2 + 0.24, y: by + 0.58, w: bw - 0.48, h: 0.26, margin: 0, fontFace: SANS, fontSize: 10.5, color: IVORY });
  s.addText("ワイン現物を所有・損益が帰属", { x: bx2 + 0.24, y: by + 0.86, w: bw - 0.48, h: 0.26, margin: 0, fontFace: SANS, fontSize: 9.5, color: MUTED });

  card(s, bx3, by, bw, bh);
  s.addText("株式会社WineBank", { x: bx3 + 0.24, y: by + 0.24, w: bw - 0.48, h: 0.28, margin: 0, fontFace: SANS, fontSize: 13, bold: true, color: IVORY });
  s.addText("酒類販売業免許・取引口座を保有", { x: bx3 + 0.24, y: by + 0.58, w: bw - 0.48, h: 0.26, margin: 0, fontFace: SANS, fontSize: 10.5, color: GOLD_L });
  s.addText("調達・譲渡・保管・販売を実行（GP）", { x: bx3 + 0.24, y: by + 0.86, w: bw - 0.48, h: 0.26, margin: 0, fontFace: SANS, fontSize: 9.5, color: MUTED });

  // 矢印
  s.addShape(pres.ShapeType.rightArrow, { x: bx1 + bw + 0.10, y: by + 0.52, w: bx2 - bx1 - bw - 0.20, h: 0.26, fill: { color: GOLD_D }, line: { color: GOLD_D, width: 0 } });
  s.addShape(pres.ShapeType.leftArrow, { x: bx2 + bw + 0.10, y: by + 0.52, w: bx3 - bx2 - bw - 0.20, h: 0.26, fill: { color: GOLD_D }, line: { color: GOLD_D, width: 0 } });

  // 4ステップ
  const sw = (CW - 0.28 * 3) / 4, sy = 3.60, sh = 1.76;
  const steps = [
    ["01", "調達", "WineBankが自社の免許・取引口座でインポーター／酒販店から正規品を調達", "定価比 40〜60"],
    ["02", "譲渡", "現物をSPCへ譲渡（酒類卸売）。独立企業間価格として1%を付加", "SPC取得原価 50.5"],
    ["03", "保管・販売", "専門定温倉庫で保管（全量付保）。WineBankが酒販店卸／自社EC／オークションで販売", "定価比 70〜80"],
    ["04", "分配", "SPCの税前利益を半期ごとに折半し分配。元本はSPC内で継続運用", "投資家50：WB50"],
  ];
  steps.forEach((st, i) => {
    const x = M + (sw + 0.28) * i;
    card(s, x, sy, sw, sh);
    badge(s, x + 0.24, sy + 0.22, 0.34, st[0]);
    s.addText(st[1], { x: x + 0.68, y: sy + 0.24, w: sw - 0.92, h: 0.30, margin: 0, valign: "middle", fontFace: SANS, fontSize: 12, bold: true, color: IVORY });
    s.addText(st[2], { x: x + 0.24, y: sy + 0.70, w: sw - 0.48, h: 0.66, margin: 0, fontFace: SANS, fontSize: 9.5, color: MUTED, lineSpacingMultiple: 1.2 });
    s.addText(st[3], { x: x + 0.24, y: sy + 1.40, w: sw - 0.48, h: 0.24, margin: 0, fontFace: SANS, fontSize: 10, bold: true, color: GOLD_L });
  });

  s.addText("※ ワイン現物はSPC名義で保有し、WineBankの債権者から倒産隔離する。WineBankはGPとして実行を担い、報酬は「譲渡時1%」と「利益折半のGP取分」に限定。SPCに対する別途の管理報酬（期中報酬・成功報酬）は課さない。", {
    x: M, y: 5.56, w: CW, h: 0.40, margin: 0,
    fontFace: SANS, fontSize: 9, color: DIM, lineSpacingMultiple: 1.2,
  });
  s.addNotes("免許事業者であるWineBankが売買当事者。SPCは所有者として損益を受ける。");
}

// ═══════════════════════════════════════════════════════════ 05 商流の制約（新規）
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

  // 採用スキーム
  card(s, M, 4.22, CW, 1.70, { fill: CARD2, line: GOLD_D });
  s.addText("採用するスキーム", { x: M + 0.30, y: 4.40, w: 3.0, h: 0.28, margin: 0, fontFace: SANS, fontSize: 12, bold: true, color: GOLD_L });
  s.addText("WineBankが免許事業者として仕入・販売の当事者となり、現物をSPCへ譲渡する。SPCは所有者として損益を受ける。", {
    x: M + 0.30, y: 4.70, w: CW - 0.60, h: 0.28, margin: 0, fontFace: SANS, fontSize: 12.5, bold: true, color: IVORY,
  });

  const flow = [
    ["譲渡価格を同額にできない理由", "WineBankは在庫リスク・与信・入出庫事務を負って調達する。同額譲渡では対価なき役務提供となり、税務上も寄附金認定・移転価格の論点を招く。独立企業間価格として最小限の1%を付加する。"],
    ["1%の金額イメージ", "SPC払込5億円 → 実商品原価4.95億円 ＋ 譲渡マージン500万円。回転12ヶ月・稼働率85%の定常状態では、年間のSPC仕入4.25億円に対しWineBankの譲渡マージンは年約420万円となる。"],
  ];
  flow.forEach((f, i) => {
    const x = M + 0.30 + i * ((CW - 0.60) / 2 + 0.10);
    const w = (CW - 0.60) / 2 - 0.10;
    s.addText(f[0], { x, y: 5.08, w, h: 0.26, margin: 0, fontFace: SANS, fontSize: 10.5, bold: true, color: GOLD_L });
    s.addText(f[1], { x, y: 5.34, w, h: 0.52, margin: 0, fontFace: SANS, fontSize: 9.5, color: MUTED, lineSpacingMultiple: 1.2 });
  });

  s.addText("※ SPC自体の免許要否および委託・売買形態の切り分けは、所轄税務署（酒類指導官）および顧問弁護士との確認事項として、契約書ドラフト作成前に確定させる。", {
    x: M, y: 6.06, w: CW, h: 0.28, margin: 0, fontFace: SANS, fontSize: 8.5, color: DIM,
  });
  s.addNotes("会計士・FMが必ず確認する論点。免許・口座・割当の3つの壁があるため、WineBankが当事者となる。1%は独立企業間価格の最小値として設定。");
}

// ═══════════════════════════════════════════════════════════ 06 収益の源泉
{
  const s = chrome(base(), "SOURCE OF RETURN", "収益の源泉：ワイン流通の価格差",
    "同一商品が流通段階ごとに異なる価格で存在する。この価格差＝粗利をファンドが取り込む。");

  const steps = [
    ["インポーター仕入", "40", "仕入①", GOLD_D],
    ["酒販店仕入", "60", "仕入②", GOLD_D],
    ["酒販店卸 売値", "70", "売却①", GOLD],
    ["ネット最安 売値", "80", "売却②", GOLD],
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

  card(s, M, 4.02, CW, 1.94, { fill: CARD2, line: GOLD_D });
  s.addText("主線（ニュートラル）の置き方", { x: M + 0.30, y: 4.20, w: 5, h: 0.28, margin: 0, fontFace: SANS, fontSize: 12, bold: true, color: GOLD_L });

  const calc = [
    ["仕入ポートフォリオ", "インポーター40 ＋ 酒販店60 を半々", "市中原価 50.0"],
    ["現物譲渡（WineBank→SPC）", "独立企業間価格として1%を付加", "SPC取得原価 50.5"],
    ["売却ポートフォリオ", "酒販店卸70 ＋ ネット最安80 を半々", "売値 75.0"],
    ["単位粗利", "売値75.0 − SPC取得原価50.5", "粗利 24.5（粗利率32.7%）"],
  ];
  let cy = 4.58;
  calc.forEach((c, i) => {
    s.addText(c[0], { x: M + 0.30, y: cy, w: 3.4, h: 0.26, margin: 0, fontFace: SANS, fontSize: 10.5, bold: true, color: IVORY });
    s.addText(c[1], { x: M + 3.80, y: cy, w: 5.4, h: 0.26, margin: 0, fontFace: SANS, fontSize: 10.5, color: MUTED });
    s.addText(c[2], { x: M + 9.30, y: cy, w: CW - 9.60, h: 0.26, margin: 0, align: "right", fontFace: SANS, fontSize: 10.5, bold: true, color: i === 3 ? GOLD_L : IVORY });
    cy += 0.33;
  });

  s.addText("副次（ポジティブ）：仕入はインポーター40のみ・売却はネット最安80のみ → SPC取得原価40.4・粗利39.6（粗利率49.5%）。調達枠の確保が前提条件。", {
    x: M, y: 6.08, w: CW, h: 0.28, margin: 0, fontFace: SANS, fontSize: 9, color: DIM,
  });
  s.addNotes("会社紹介資料17ページの流通価格構造をそのまま採用。");
}

// ═══════════════════════════════════════════════════════════ 07 単位経済
{
  const s = chrome(base(), "UNIT ECONOMICS", "3シナリオの単位経済（定価100あたり）",
    "現物譲渡の1%は、全シナリオでSPCの取得原価に上乗せして計上している。");

  const sc = [
    ["ネガティブ", ["50.00", "50.50", "71.25", "20.75", "29.1%", "41.1%"], "ニュートラルから売値を5%値引き", LINE, false],
    ["ニュートラル（主線）", ["50.00", "50.50", "75.00", "24.50", "32.7%", "48.5%"], "仕入40/60の半々・売却70/80の半々", GOLD_D, true],
    ["ポジティブ", ["40.00", "40.40", "80.00", "39.60", "49.5%", "98.0%"], "仕入はインポーター40のみ・売却はネット最安80のみ", LINE, false],
  ];
  const labels = ["市中仕入原価", "SPC取得原価（＋1%）", "売値", "単位粗利", "粗利率", "投下原価利益率"];
  const cw = (CW - 0.32 * 2) / 3;

  sc.forEach((c, i) => {
    const x = M + (cw + 0.32) * i;
    card(s, x, 1.82, cw, 3.90, { fill: c[4] ? CARD2 : CARD, line: c[3] });
    s.addText(c[0], {
      x: x + 0.28, y: 2.02, w: cw - 0.56, h: 0.32, margin: 0,
      fontFace: SANS, fontSize: 13, bold: true, color: c[4] ? GOLD_L : IVORY,
    });
    let yy = 2.52;
    c[1].forEach((v, j) => {
      s.addText(labels[j], { x: x + 0.28, y: yy, w: cw - 1.60, h: 0.28, margin: 0, valign: "middle", fontFace: SANS, fontSize: 10, color: MUTED });
      s.addText(v, {
        x: x + cw - 1.60, y: yy, w: 1.32, h: 0.28, margin: 0, align: "right", valign: "middle",
        fontFace: LATIN, fontSize: j >= 4 ? 13 : 14, bold: true,
        color: j === 3 || j === 4 ? (c[4] ? GOLD_L : IVORY) : (j === 1 ? GOLD_L : IVORY),
      });
      yy += 0.44;
    });
    s.addText(c[2], {
      x: x + 0.28, y: 5.16, w: cw - 0.56, h: 0.44, margin: 0,
      fontFace: SANS, fontSize: 9, color: DIM, lineSpacingMultiple: 1.2,
    });
  });

  s.addText("※ 交渉余地を織り込み、ニュートラルを提案の主線とする。ポジティブは調達・販売チャネルを最適化した場合の上振れ余地として位置づける。8/5版では粗利率33.3%としていたが、譲渡1%の付加により32.7%となる。", {
    x: M, y: 5.92, w: CW, h: 0.40, margin: 0, fontFace: SANS, fontSize: 9, color: DIM, lineSpacingMultiple: 1.2,
  });
  s.addNotes("粗利率は33.3%から32.7%へ。譲渡1%は毎回の仕入に対して発生する。");
}

// ═══════════════════════════════════════════════════════════ 08 費用前提
{
  const s = chrome(base(), "COST ASSUMPTIONS", "SPC費用の前提",
    "WineBank人件費 年360万円をSPCの固定費として新たに計上した（下表の網掛け）。");

  const rows = [
    [th("費用項目"), th("単価・料率"), th("根拠・備考")],
    [td("保管・保険"), td("年7,500円／ロット"), td("定温専門倉庫（鈴与ファインワインセンター見積ベース）。1ロット＝定価100万円相当", { align: "left" })],
    [td("物流・入出庫・検品"), td("640円／ロット（往復）"), td("入庫時・出庫時の作業費および国内配送", { align: "left" })],
    [td("決済・出品手数料・送料"), td("売上の1.0%"), td("カード決済／オークション出品料／個口配送", { align: "left" })],
    [td("滞留・値引き・破損ロス"), td("売上の2.0%"), td("想定価格で売り切れなかった分の値引き処分・破損等", { align: "left" })],
    [td("SPC維持費"), td("年800万円（固定）"), td("監査・税務・事務受託・法務。ファンド規模によらず固定", { align: "left" })],
    [{ text: "SPC人件費（新規計上）", options: { fill: { color: "2A2318" }, color: GOLD_L, bold: true, fontFace: SANS } },
     { text: "年360万円（固定）", options: { fill: { color: "2A2318" }, color: GOLD_L, bold: true, fontFace: SANS } },
     { text: "SPC運営に係るWineBank側の実務人件費。SPCの固定費として明示計上する", options: { fill: { color: "2A2318" }, color: IVORY, fontFace: SANS, align: "left" } }],
    [td("WineBank販売オペコスト"), td("SPC負担なし"), td("GP取分（利益の50%）から負担。SPCに管理報酬・成功報酬は課さない", { align: "left" })],
  ];
  table(s, rows, M, 1.74, CW, [2.85, 2.35, 6.69], { rowH: 0.37 });

  // 内訳スタット（コンパクト版）
  const bw = (CW - 0.26 * 3) / 4;
  const items = [
    ["12.6", "百万円", "滞留・値引き・破損ロス", "売上比2.0%。費用最大項目"],
    ["11.6", "百万円", "SPC固定費", "維持費800万＋人件費360万"],
    ["6.3", "百万円", "保管・保険", "平均在庫850ロット相当"],
    ["6.3", "百万円", "決済・手数料・送料", "売上比1.0%"],
  ];
  const ty = 4.86, th2 = 1.16;
  items.forEach((it, i) => {
    const x = M + (bw + 0.26) * i;
    const hot = i === 1;
    card(s, x, ty, bw, th2, { fill: hot ? CARD2 : CARD, line: hot ? GOLD_D : LINE });
    s.addText([
      { text: it[0], options: { fontFace: LATIN, fontSize: 24, bold: true, color: GOLD_L } },
      { text: " " + it[1], options: { fontFace: SANS, fontSize: 11, bold: true, color: GOLD_L } },
    ], { x: x + 0.24, y: ty + 0.12, w: bw - 0.48, h: 0.42, margin: 0, valign: "middle" });
    s.addText(it[2], { x: x + 0.24, y: ty + 0.56, w: bw - 0.48, h: 0.24, margin: 0, fontFace: SANS, fontSize: 10.5, bold: true, color: IVORY });
    s.addText(it[3], { x: x + 0.24, y: ty + 0.80, w: bw - 0.48, h: 0.24, margin: 0, fontFace: SANS, fontSize: 8.5, color: MUTED });
  });

  s.addText("上記はニュートラル・回転12ヶ月・稼働率85%における年間SPC費用（合計3,739万円）の内訳。その他の運用前提：稼働率85%（残15%は運転資金・解約準備として現金保有）／仕入展開6ヶ月／ローリング運用／利益はSPC内で複利再投資せず半期分配／税前利益を投資家50：WineBank50で折半／利回りは投資家の税引前ベース。", {
    x: M, y: 6.20, w: CW, h: 0.40, margin: 0, fontFace: SANS, fontSize: 8.5, color: DIM, lineSpacingMultiple: 1.2,
  });
  s.addNotes("SPC費用の合計は年3,739万円。人件費360万を加えた。");
}

// ═══════════════════════════════════════════════════════════ 09 ベースケース表
{
  const s = chrome(base(), "BASE CASE ｜ 主線", "ニュートラル：在庫回転期間別シミュレーション",
    "SPC取得原価50.5・売値75・粗利24.5（粗利率32.7%）／投資枠5億円・稼働率85%");

  const rows = [
    [th("在庫回転期間"), th("年回転数"), th("年間売上"), th("年間粗利"), th("SPC費用"), th("年間税前利益"), th("投資家配当／年"), th("定常年間利回り"), th("年平均利回り 3年通算"), th("年平均利回り 5年通算")],
    [td("9ヶ月"), td("1.33回"), td("8.42億"), td("2.75億"), td("44百万"), td("2.31億"), td("116百万"), td("23.1%", { bold: true }), td("17.0%", { bold: true, color: GOLD_L }), td("20.7%")],
    [td("12ヶ月", { bold: true, color: GOLD_L }), td("1.00回"), td("6.31億"), td("2.06億"), td("37百万"), td("1.69億"), td("84百万"), td("16.9%", { bold: true }), td("11.1%", { bold: true, color: GOLD_L }), td("13.4%")],
    [td("15ヶ月"), td("0.80回"), td("5.05億"), td("1.65億"), td("33百万"), td("1.31億"), td("66百万"), td("13.1%", { bold: true }), td("10.8%", { bold: true, color: GOLD_L }), td("9.7%")],
    [td("18ヶ月"), td("0.67回"), td("4.21億"), td("1.37億"), td("31百万"), td("1.07億"), td("53百万"), td("10.7%", { bold: true }), td("5.1%", { bold: true, color: RED }), td("9.5%")],
  ];
  table(s, rows, M, 1.82, CW, [1.45, 0.95, 1.05, 1.05, 1.00, 1.24, 1.34, 1.15, 1.30, 1.36], { rowH: 0.40 });

  card(s, M, 4.06, 6.05, 1.98);
  s.addText("読み方", { x: M + 0.28, y: 4.24, w: 3, h: 0.26, margin: 0, fontFace: SANS, fontSize: 12, bold: true, color: GOLD_L });
  const read = [
    "定常年間利回り＝運用が軌道に乗った後の年間実力値",
    "年平均利回り＝累計分配額÷出資額÷年数。仕入展開6ヶ月と満期前の清算期間を織り込んだ通算値",
    "回転期間が短いほど改善幅は加速（15→12ヶ月で＋3.8pt、12→9ヶ月で＋6.2pt）",
  ];
  let ry = 4.58;
  read.forEach((t) => {
    badge(s, M + 0.28, ry + 0.015, 0.16, "", { line: GOLD_D, fill: GOLD_D });
    s.addText(t, { x: M + 0.56, y: ry - 0.04, w: 5.25, h: 0.36, margin: 0, fontFace: SANS, fontSize: 10, color: MUTED, lineSpacingMultiple: 1.15 });
    ry += 0.44;
  });

  card(s, M + 6.35, 4.06, CW - 6.35, 1.98, { fill: CARD2, line: GOLD_D });
  s.addText("想定レンジのご提示", { x: M + 6.63, y: 4.24, w: 4, h: 0.26, margin: 0, fontFace: SANS, fontSize: 12, bold: true, color: GOLD_L });
  s.addText("定常年間利回り（税引前）", {
    x: M + 6.63, y: 4.54, w: CW - 6.95, h: 0.24, margin: 0,
    fontFace: SANS, fontSize: 10.5, color: IVORY });
  s.addText([
    { text: "16.9 – 23.1", options: { fontFace: LATIN, fontSize: 30, bold: true, color: GOLD_L } },
    { text: " %", options: { fontFace: SANS, fontSize: 15, bold: true, color: GOLD_L } },
  ], { x: M + 6.63, y: 4.78, w: CW - 6.95, h: 0.50, margin: 0, valign: "middle" });
  s.addText("実務上の想定回転期間を9〜12ヶ月として提示する（3年通算の年平均利回りは11.1〜17.0%）。18ヶ月まで悪化すると定常利回りは10.7%まで低下するため、回転期間の管理が最大の運用課題となる。", {
    x: M + 6.63, y: 5.34, w: CW - 6.95, h: 0.58, margin: 0, fontFace: SANS, fontSize: 10, color: MUTED, lineSpacingMultiple: 1.2,
  });
  s.addNotes("主線のレンジは11.0〜16.9%。");
}

// ═══════════════════════════════════════════════════════════ 10 回転とリターン（チャート）
{
  const s = chrome(base(), "BASE CASE ｜ 主線", "回転期間と投資家リターンの関係",
    "粗利率は前提として固定されるため、投資家リターンは実質的に在庫回転数の一次関数になる。");

  const cats = ["9ヶ月", "12ヶ月", "15ヶ月", "18ヶ月"];
  const specs = [
    ["定常年間利回り", [23.1, 16.9, 13.1, 10.7], 28],
    ["年平均利回り（3年通算）", [17.0, 11.1, 10.8, 5.1], 22],
    ["年平均利回り（5年通算）", [20.7, 13.4, 9.7, 9.5], 25],
  ];
  const cwid = (CW - 0.30 * 2) / 3;
  specs.forEach((sp, i) => {
    const x = M + (cwid + 0.30) * i;
    card(s, x, 1.80, cwid, 2.72);
    s.addChart(pres.ChartType.bar, [{ name: sp[0], labels: cats, values: sp[1] }],
      Object.assign({}, CHART_BASE, {
        x: x + 0.10, y: 1.90, w: cwid - 0.20, h: 2.52,
        barDir: "col", barGapWidthPct: 55,
        title: sp[0], valAxisMaxVal: sp[2],
        chartColors: [i === 0 ? GOLD : GOLD_D],
        plotArea: { fill: { color: CARD } }, chartArea: { fill: { color: CARD } },
      }));
  });

  const notes = [
    ["回転期間がすべて", "回転12ヶ月を1ヶ月短縮するごとに定常利回りは約1.5ポイント改善する。値引きや粗利率の微調整より、回転を上げる打ち手のほうが効く。"],
    ["18ヶ月×3年満期は不整合", "展開6ヶ月＋回転18ヶ月では3年間に1回転しかできず、資金が1年以上遊ぶ。回転期間15ヶ月以上を想定する場合は満期5年での設計が必要となる。"],
  ];
  notes.forEach((n, i) => {
    const x = M + i * (CW / 2 + 0.15);
    const w = CW / 2 - 0.15;
    card(s, x, 4.72, w, 1.34, { fill: i === 0 ? CARD2 : CARD, line: i === 0 ? GOLD_D : LINE });
    s.addText(n[0], { x: x + 0.28, y: 4.90, w: w - 0.56, h: 0.28, margin: 0, fontFace: SANS, fontSize: 12, bold: true, color: GOLD_L });
    s.addText(n[1], { x: x + 0.28, y: 5.22, w: w - 0.56, h: 0.68, margin: 0, fontFace: SANS, fontSize: 10, color: MUTED, lineSpacingMultiple: 1.2 });
  });
  s.addNotes("回転期間が一次的にリターンを決める。");
}

// ═══════════════════════════════════════════════════════════ 11 上振れ・下振れ
{
  const s = chrome(base(), "UPSIDE / DOWNSIDE ｜ 副次", "上振れ余地と下振れリスク",
    "調達・販売チャネルの寄せ方で上振れし、値引き販売で下振れする。いずれも譲渡1%・人件費計上後の数値。");

  // ポジティブ
  card(s, M, 1.80, CW / 2 - 0.15, 2.62, { fill: CARD2, line: GOLD_D });
  s.addText("ポジティブ｜SPC取得原価40.4・売値80・粗利率49.5%", {
    x: M + 0.28, y: 1.98, w: CW / 2 - 0.71, h: 0.28, margin: 0, fontFace: SANS, fontSize: 11.5, bold: true, color: GOLD_L });
  table(s, [
    [th("回転期間"), th("年間売上"), th("年間税前"), th("定常利回り"), th("年平均3年")],
    [td("9ヶ月"), td("11.22億"), td("5.01億"), td("50.1%"), td("37.3%", { bold: true, color: GOLD_L })],
    [td("12ヶ月"), td("8.42億"), td("3.71億"), td("37.1%"), td("24.6%", { bold: true, color: GOLD_L })],
    [td("15ヶ月"), td("6.73億"), td("2.93億"), td("29.3%"), td("24.2%")],
    [td("18ヶ月"), td("5.61億"), td("2.41億"), td("24.1%"), td("11.9%")],
  ], M + 0.28, 2.32, 5.23, [0.98, 1.10, 1.05, 1.05, 1.05], { rowH: 0.325, fontSize: 9.5 });
  s.addText("インポーター直仕入の比率と自社EC・オークション販売の比率を引き上げることで到達。年間調達枠の確保が前提条件。", {
    x: M + 0.28, y: 3.98, w: CW / 2 - 0.71, h: 0.34, margin: 0, fontFace: SANS, fontSize: 9, color: MUTED, lineSpacingMultiple: 1.2 });

  // ネガティブ
  const nx = M + CW / 2 + 0.15;
  card(s, nx, 1.80, CW / 2 - 0.15, 2.62);
  s.addText("ネガティブ｜売値5%値引き・粗利率29.1%", {
    x: nx + 0.28, y: 1.98, w: CW / 2 - 0.71, h: 0.28, margin: 0, fontFace: SANS, fontSize: 11.5, bold: true, color: IVORY });
  table(s, [
    [th("回転期間"), th("年間売上"), th("年間税前"), th("定常利回り"), th("年平均3年")],
    [td("9ヶ月"), td("8.00億"), td("1.90億"), td("19.0%"), td("14.0%", { bold: true })],
    [td("12ヶ月"), td("6.00億"), td("1.38億"), td("13.8%"), td("9.0%", { bold: true })],
    [td("15ヶ月"), td("4.80億"), td("1.07億"), td("10.7%"), td("8.7%")],
    [td("18ヶ月"), td("4.00億"), td("0.86億"), td("8.6%"), td("4.1%", { color: RED })],
  ], nx + 0.28, 2.32, 5.23, [0.98, 1.10, 1.05, 1.05, 1.05], { rowH: 0.325, fontSize: 9.5 });
  s.addText("売値5%（定価比3.75ポイント）の値引きで定常利回りは約3ポイント低下。粗利24.5に対しては15%のインパクトとなる。", {
    x: nx + 0.28, y: 3.98, w: CW / 2 - 0.71, h: 0.34, margin: 0, fontFace: SANS, fontSize: 9, color: MUTED, lineSpacingMultiple: 1.2 });

  card(s, M, 4.62, CW, 1.42, { fill: CARD2, line: GOLD_D });
  s.addText("最重要の示唆", { x: M + 0.30, y: 4.80, w: 3, h: 0.28, margin: 0, fontFace: SANS, fontSize: 12, bold: true, color: GOLD_L });
  s.addText("「回転を上げるために値引く」は割に合わない。売値5%の値引きは粗利を15%毀損し、失う利回り3.1ポイントを取り戻すには回転期間を12ヶ月から10ヶ月へ短縮する必要がある。価格を維持したまま販売チャネルを増やすことが本筋の改善手段となる。", {
    x: M + 0.30, y: 5.12, w: CW - 0.60, h: 0.72, margin: 0, fontFace: SANS, fontSize: 11.5, color: IVORY, lineSpacingMultiple: 1.28 });
  s.addNotes("値引きは割に合わない。チャネル増加が本筋。");
}

// ═══════════════════════════════════════════════════════════ 12 3シナリオ比較
{
  const s = chrome(base(), "COMPARISON", "3シナリオ比較：定常年間利回り",
    "現物譲渡1%・SPC人件費360万円を反映した後の、運用が軌道に乗った後の年間実力値。");

  const cats = ["9ヶ月", "12ヶ月", "15ヶ月", "18ヶ月"];
  card(s, M, 1.80, CW, 2.98);
  s.addChart(pres.ChartType.bar, [
    { name: "ポジティブ", labels: cats, values: [50.1, 37.1, 29.3, 24.1] },
    { name: "ニュートラル（主線）", labels: cats, values: [23.1, 16.9, 13.1, 10.7] },
    { name: "ネガティブ", labels: cats, values: [19.0, 13.8, 10.7, 8.6] },
  ], Object.assign({}, CHART_BASE, {
    x: M + 0.14, y: 1.92, w: CW - 0.28, h: 2.74,
    barDir: "col", barGapWidthPct: 45,
    title: "在庫回転期間別 定常年間利回り（％）",
    chartColors: [GOLD_L, GOLD, GOLD_D],
    showLegend: true, legendPos: "b", legendColor: MUTED, legendFontFace: SANS, legendFontSize: 9.5,
    valAxisMaxVal: 58,
    plotArea: { fill: { color: CARD } }, chartArea: { fill: { color: CARD } },
  }));

  const cols = [
    ["主線の提示レンジ", "回転9〜12ヶ月で定常利回り16.9〜23.1%（3年通算の年平均利回り11.1〜17.0%）。保守的な前提を積み上げた数値であり、交渉の出発点として提示する。", true],
    ["上振れの条件", "調達をインポーター直に寄せ、販売を自社チャネルに寄せれば、同じ回転期間で利回りは2倍以上になる。", false],
    ["下振れの限界", "値引き5%を強いられても、回転9ヶ月を維持できれば定常利回り19.0%を確保できる。回転の維持が防衛線。", false],
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

// ═══════════════════════════════════════════════════════════ 13 感応度
{
  const s = chrome(base(), "SENSITIVITY", "感応度：何が崩れると利回りがどう動くか",
    "ニュートラル・回転12ヶ月（定常利回り16.9%）を基準とした、各変数の単独変動による影響。");

  const rows = [
    [th("変動要因"), th("変動幅"), th("定常利回りへの影響"), th("深刻度"), th("対応方針")],
    [td("在庫回転期間"), td("12ヶ月 → 18ヶ月"), td("16.9% → 10.7%（▲6.2pt）", { color: RED, bold: true }), td("最大", { color: RED, bold: true }), td("販売チャネル多重化・売れ筋銘柄への集中", { align: "left" })],
    [td("滞留・破損ロス率"), td("売上比 2% → 8%"), td("16.9% → 13.1%（▲3.8pt）", { color: RED }), td("大"), td("仕入時の銘柄選定基準を厳格化・全量付保", { align: "left" })],
    [td("稼働率"), td("85% → 70%"), td("16.9% → 13.7%（▲3.2pt）", { color: RED }), td("大"), td("解約条項の設計と表裏。後述のトレードオフを参照", { align: "left" })],
    [td("売却価格"), td("売値75 → 71.25（▲5%）"), td("16.9% → 13.8%（▲3.1pt）", { color: RED }), td("大"), td("値引き販売を禁じ、価格維持を運用ルール化", { align: "left" })],
    [td("現物譲渡マージン"), td("1% → 2%"), td("16.9% → 16.3%（▲0.6pt）", { color: MUTED }), td("小"), td("1%を上限として契約書に固定し、事後変更を認めない", { align: "left" })],
    [td("SPC人件費"), td("360万円 → 720万円"), td("16.9% → 16.5%（▲0.4pt）", { color: MUTED }), td("小"), td("固定額として契約書に明記し、規模拡大時も据え置き", { align: "left" })],
    [td("仕入価格"), td("市中原価 50 → 45"), td("16.9% → 23.6%（＋6.7pt）", { color: GOLD_L, bold: true }), td("上振れ", { color: GOLD_L, bold: true }), td("インポーター直取引比率の引き上げが最大の改善策", { align: "left" })],
  ];
  table(s, rows, M, 1.82, CW, [1.96, 2.28, 2.72, 0.96, 3.97], { rowH: 0.41 });

  card(s, M, 5.30, CW, 0.86, { fill: CARD2, line: GOLD_D });
  s.addText("結論：リターン改善の打ち手は「回転期間の短縮」と「仕入価格の引き下げ」の2つに集約される。今回追加した譲渡1%・人件費360万円は、いずれも合計1.0ポイント程度の影響にとどまり、スキームの成否を左右する変数ではない。", {
    x: M + 0.30, y: 5.44, w: CW - 0.60, h: 0.58, margin: 0, valign: "middle",
    fontFace: SANS, fontSize: 11.5, color: IVORY, lineSpacingMultiple: 1.25 });
  s.addNotes("譲渡1%・人件費は感応度としては小さい。回転と仕入価格が本丸。");
}

// ═══════════════════════════════════════════════════════════ 14 リスク
{
  const s = chrome(base(), "RISK", "想定されるリスクと対応策", null);

  const risks = [
    ["在庫リスク", "想定価格で売り切れず滞留する", "銘柄をLiv-ex掲載の流通量の多い銘柄に限定。四半期ごとに滞留在庫を洗い出し、簿価見直しを実施。"],
    ["価格変動リスク", "Fine Wine市況の下落", "短期回転モデルのため市況依存度は低い。値上がり益はリターンに一切算入していない。"],
    ["流動性リスク", "現物のため即時換金できない", "常時15%を現金で保有。半期解約に応じる場合は稼働率が下がり利回りも下がる点を明示する。"],
    ["調達リスク", "想定価格・数量で仕入れられない", "インポーター・酒販店との年間調達枠を事前に締結。調達実績を四半期報告。"],
    ["オペレーションリスク", "保管中の破損・劣化・盗難", "専門定温倉庫での保管と全量付保。倉庫在庫は月次で第三者棚卸。"],
    ["カウンターパーティリスク", "WineBankの信用・実行力", "SPCを倒産隔離。ワイン現物はSPC名義で保有し、WineBankの債権者から隔離する。"],
    ["免許・商流リスク", "免許事業者の変更・取引口座の喪失", "WineBankの免許維持を契約上の義務とし、免許喪失時は在庫を売却清算して早期償還する条項を置く。"],
    ["移転価格リスク", "譲渡1%の妥当性を否認される", "譲渡価格の算定根拠を文書化。第三者卸価格との比較資料を年次で整備し、税務調査に備える。"],
  ];
  const cwid = (CW - 0.28 * 3) / 4;
  risks.forEach((r, i) => {
    const col = i % 4, row = Math.floor(i / 4);
    const x = M + (cwid + 0.28) * col;
    const y = 1.64 + row * 2.28;
    const isNew = i >= 6;
    card(s, x, y, cwid, 2.08, { fill: isNew ? CARD2 : CARD, line: isNew ? GOLD_D : LINE });
    s.addText(r[0], { x: x + 0.26, y: y + 0.22, w: cwid - 0.52, h: 0.28, margin: 0, fontFace: SANS, fontSize: 12, bold: true, color: isNew ? GOLD_L : IVORY });
    s.addText(r[1], { x: x + 0.26, y: y + 0.54, w: cwid - 0.52, h: 0.42, margin: 0, fontFace: SANS, fontSize: 9.5, color: GOLD_L, lineSpacingMultiple: 1.15 });
    s.addText(r[2], { x: x + 0.26, y: y + 1.02, w: cwid - 0.52, h: 0.88, margin: 0, fontFace: SANS, fontSize: 9.5, color: MUTED, lineSpacingMultiple: 1.24 });
  });
  s.addText("※ 網掛けの2件は、今回の改訂（免許・商流の整理と現物譲渡1%）に伴い新たに追加したリスク項目。", {
    x: M, y: 6.24, w: CW, h: 0.26, margin: 0, fontFace: SANS, fontSize: 8.5, color: DIM });
  s.addNotes("免許・商流リスクと移転価格リスクを新規追加。");
}

// ═══════════════════════════════════════════════════════════ 15 条件
{
  const s = chrome(base(), "TERMS", "ファンド設計条件（ドラフト）", null);

  const rows = [
    [th("項目"), th("内容"), th("備考")],
    [td("組成形態"), td("合同会社＋匿名組合（GK-TK）", { align: "left" }), td("SPCレベルでは非課税、投資家側で課税", { align: "left" })],
    [td("募集総額"), td("5億円", { align: "left" }), td("追加募集は半期ごとの受入日に実施", { align: "left" })],
    [td("運用期間"), td("3年（回転15ヶ月超を想定する場合は5年）", { align: "left" }), td("満期時に在庫を売却清算のうえ元本償還", { align: "left" })],
    [td("現物の取得"), td("WineBankが調達した現物をSPCへ譲渡（＋1%）", { align: "left", color: GOLD_L, bold: true }), td("5億の場合、実商品原価4.95億＋譲渡マージン500万円", { align: "left" })],
    [td("分配"), td("半期ごと（税前利益を投資家50：WineBank50）", { align: "left" }), td("元本はSPC内に留保し継続運用", { align: "left" })],
    [td("SPC負担費用"), td("保管・物流・手数料・ロス・維持費800万・人件費360万", { align: "left", color: GOLD_L, bold: true }), td("これ以外の管理報酬・成功報酬は課さない", { align: "left" })],
    [td("想定リターン"), td("定常年間利回り 16.9〜23.1%（回転12〜9ヶ月）", { align: "left" }), td("ニュートラル前提。3年通算の年平均利回りは11.1〜17.0%", { align: "left" })],
    [td("中途解約"), td("半期ごとの解約日に申出可（90日前通知）", { align: "left" }), td("現金保有比率の引き上げが必要（下記参照）", { align: "left" })],
    [td("元本の裏付け"), td("SPC名義のワイン現物および現金", { align: "left" }), td("月次で在庫明細・簿価を報告", { align: "left" })],
    [td("報告"), td("月次：在庫・売上／四半期：試算表／年次：監査済決算", { align: "left" }), td("会計監査人を設置", { align: "left" })],
  ];
  table(s, rows, M, 1.62, CW, [2.10, 5.30, 4.49], { rowH: 0.335 });

  card(s, M, 5.42, CW, 1.24, { fill: CARD2, line: GOLD_D });
  s.addText("解約自由度と利回りのトレードオフ", { x: M + 0.30, y: 5.56, w: 5, h: 0.26, margin: 0, fontFace: SANS, fontSize: 11.5, bold: true, color: GOLD_L });
  s.addText("半期解約に応じるには常時1〜3割を現金または即時換金可能な在庫で保有する必要があり、その分だけ稼働率が下がる。稼働率85%→70%で定常年間利回りは16.9%→13.7%、3年通算の年平均利回りは11.1%→8.9%に低下する。解約条件はご要望に合わせて設計するが、利回りとの両立が難しい点を事前に共有したい。", {
    x: M + 0.30, y: 5.84, w: CW - 0.60, h: 0.68, margin: 0, fontFace: SANS, fontSize: 10, color: MUTED, lineSpacingMultiple: 1.24 });
  s.addNotes("条件はドラフト。折半の定義は税前利益ベース。");
}

// ═══════════════════════════════════════════════════════════ 16 ネクストステップ
{
  const s = chrome(base(), "NEXT STEPS", "今後の進め方", null);

  const steps = [
    ["01", "前提条件のすり合わせ", "想定回転期間・解約条件・折半の定義（税前利益ベース）、および現物譲渡1%の水準についてご意見をいただく。"],
    ["02", "免許・税務の確定", "SPCの免許要否と売買形態を所轄税務署（酒類指導官）・顧問弁護士と確認。譲渡価格1%の算定根拠を文書化する。"],
    ["03", "調達枠の確保と実証", "インポーター・酒販店との年間調達枠を締結し、小規模ロットで回転期間の実証を行う。"],
    ["04", "スキーム組成", "GK-TKの組成、契約書一式（匿名組合契約・業務委託契約・売買基本契約）の作成、会計監査人の選定。"],
    ["05", "投資実行", "半期の受入日に合わせて着金、運用開始。月次で在庫明細・簿価を報告する。"],
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
  s.addText("本資料の数値は一定の前提に基づく試算であり、将来の運用成果を保証するものではありません。最終的な条件は契約書に基づきます。免許・税務の取扱いは、所轄官庁および専門家の確認を経て確定します。", {
    x: M + 0.30, y: 5.20, w: CW - 0.60, h: 0.74, margin: 0, valign: "middle",
    fontFace: SANS, fontSize: 10, color: MUTED, lineSpacingMultiple: 1.24 });
  s.addNotes("次のステップ。免許・税務の確定を第2ステップに追加。");
}

// ═══════════════════════════════════════════════════════════ 17 まとめ：投資する意義
{
  const s = chrome(base(), "CONCLUSION", "まとめ：本ファンドに出資いただく意義", null);

  const LW = 7.15;   // 左カラム幅
  const merits = [
    ["現物が元本を裏付ける",
     "出資金は常にワイン現物と現金として存在する。SPC名義で保有し倒産隔離。値上がり益はリターンに一切算入していない。"],
    ["相場ではなく流通の価格差から収益を得る",
     "Liv-ex市況の上下ではなく、40〜60で仕入れ70〜80で売る価格差が収益源。市況が横ばいでも成立し、株式・債券との相関が低い。"],
    ["他社が再現できない調達力",
     "創業55年の酒販免許、大手インポーターとの直接取引、輸出入ライセンス。新規参入業者が正規品を同じ価格で大量に仕入れることはできない。"],
    ["出口を自社で複数持っている",
     "酒販店卸・自社EC（楽天／Yahoo／寺田）・WineBank Auction・CLUB会員・グループのアピシウス。回転期間を自力で短縮できる構造。"],
    ["運営者と利害が完全に一致している",
     "期中報酬も成功報酬も取らず、報酬は利益の折半のみ。投資家が儲からなければWineBankも儲からない。1号ファンド（2022年〜）の運営実績あり。"],
  ];
  let my = 1.72;
  merits.forEach((m, i) => {
    card(s, M, my, LW, 0.82, { fill: i === 4 ? CARD2 : CARD, line: i === 4 ? GOLD_D : LINE });
    badge(s, M + 0.24, my + 0.24, 0.34, String(i + 1).padStart(2, "0"));
    s.addText(m[0], {
      x: M + 0.68, y: my + 0.12, w: LW - 0.94, h: 0.26, margin: 0,
      fontFace: SANS, fontSize: 11.5, bold: true, color: i === 4 ? GOLD_L : IVORY });
    s.addText(m[1], {
      x: M + 0.68, y: my + 0.38, w: LW - 0.94, h: 0.36, margin: 0,
      fontFace: SANS, fontSize: 9, color: MUTED, lineSpacingMultiple: 1.15 });
    my += 0.90;
  });

  // 右カラム：貴社の投資基準との照合
  const RX = M + LW + 0.30, RW = CW - LW - 0.30;
  card(s, RX, 1.72, RW, 4.42, { fill: CARD2, line: GOLD_D });
  s.addText("貴社の投資基準との照合", {
    x: RX + 0.28, y: 1.92, w: RW - 0.56, h: 0.28, margin: 0,
    fontFace: SANS, fontSize: 12.5, bold: true, color: GOLD_L });

  const checks = [
    ["想定利回り20%（実績）に対して",
     "定常年間利回りが20%に到達するのは在庫回転10.3ヶ月。回転9ヶ月なら23.1%、12ヶ月で16.9%。",
     "回転10ヶ月前後が貴社基準との分岐点。ここを運用KPIとして四半期報告する。"],
    ["半期受入・半期解約に対して",
     "半期分配・半期受入日の設計で貴社の運用サイクルと整合。",
     "ただし解約に応じる分だけ現金比率が上がり利回りは下がる（稼働率85%→70%で16.9%→13.7%）。解約枠の上限設定をご相談したい。"],
    ["リスク分散に対して",
     "伝統的資産と相関の低い実物資産。既存30億円のポートフォリオに対し5億円は約17%。",
     "単一銘柄ではなく数千本・複数産地への分散となり、ポートフォリオ内での分散効果が働く。"],
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
  s.addText("ワインは飲めば消える嗜好品ではなく、正規流通の価格差という再現性のある収益源です。その価格差を取りに行く実務を、55年分の免許と取引関係で担うのがWineBankです。本ファンドは、値上がりを待つ投資ではなく、この実務そのものに出資いただくご提案です。", {
    x: M + 0.30, y: 6.36, w: CW - 0.60, h: 0.42, margin: 0, valign: "middle",
    fontFace: SANS, fontSize: 10.5, color: IVORY, lineSpacingMultiple: 1.2 });

  s.addNotes("まとめ。意義は5点。先方基準20%に対しては回転10.3ヶ月が分岐点であることを明示する。");
}

// ═══════════════════════════════════════════════════════════ 18 クロージング
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

pres.writeFile({ fileName: "WineBank_ワインファンドSPC組成提案_5億_20260811.pptx" })
  .then((f) => console.log("written:", f));
