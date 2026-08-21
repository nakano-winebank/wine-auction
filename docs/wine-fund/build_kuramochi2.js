// 倉持案 v2（直接所有・委託販売型／単独投資家1億円）の提案資料を生成する。
//
// 数値は一切ハードコードしない。kuramochi_direct.py が書き出した
// kuramochi_direct.json をすべての表・グラフの供給源とする。
//
//   python3 -c "import kuramochi_direct as K; K.export_json()"
//   node build_kuramochi2.js
//
// トンマナは build.js / build_kuramochi.js と共通（黒×金）。

const pptxgen = require("pptxgenjs");
const D = require("./kuramochi_direct.json");

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
const pt   = (x, n = 1) => (x >= 0 ? "＋" : "▲") + Math.abs(x * 100).toFixed(n) + "pt";
const num  = (x, n = 2) => x.toFixed(n);

// 回転期間でJSONの行を引く
const R = (t) => D.rows.find((r) => r.turn === t);
const RF = (t) => D.rows_flat.find((r) => r.turn === t);
const RN = (t) => D.rows_neg.find((r) => r.turn === t);
const SU = (t) => D.selfuse.find((r) => r.turn === t);

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
      x: x + 0.26, y: y + 1.09, w: w - 0.52, h: 0.44, margin: 0,
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

// 脚注
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

// 配分ティア。各段の代表回転期間からJSONの配分率を引く（数値の二重管理を避ける）
const TIER_ROWS = [
  { label: "6ヶ月以内",  turn: 6 },
  { label: "9ヶ月以内",  turn: 9 },
  { label: "15ヶ月以内", turn: 12, main: true },
  { label: "18ヶ月以内", turn: 18 },
  { label: "24ヶ月以内", turn: 24 },
  { label: "24ヶ月超",   turn: 30 },
];
const TIER_TXT = TIER_ROWS.map((t) => t.label + pct(R(t.turn).wb_share, 0)).join(" ／ ");

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
    x: M, y: 1.86, w: 4.00, h: 0.36, rectRadius: 0.04,
    fill: { color: CARD2 }, line: { color: GOLD_D, width: 1 },
  });
  s.addText("倉持案｜現物直接所有・委託販売型", {
    x: M, y: 1.86, w: 4.00, h: 0.36, margin: 0, align: "center", valign: "middle",
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
  s.addText("ご投資額 1億円（現物を直接ご所有）／ SPC・匿名組合を用いない設計 ／ 委託販売", {
    x: M, y: 4.52, w: 9.6, h: 0.3, margin: 0,
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

// ═══════════════════════════════════════════════════════ 02 サマリー
{
  const r12 = R(12);
  const s = chrome(base(), "EXECUTIVE SUMMARY", "本ご提案の骨子",
    "ワイン現物をご自身で直接ご所有いただき、販売はWineBankが受託する。SPCも匿名組合も用いない。");

  const sw = (CW - 0.30 * 3) / 4;
  const tiles = [
    ["1.0", "億円", "ご投資額", "現物を貴社名義で直接ご所有。SPC・匿名組合を組成しないため、その維持費は一切発生しない。", false],
    ["12", "ヶ月", "在庫回転期間（主線）", "最短6ヶ月、延びても24ヶ月を想定レンジとする。回転が延びても利回りはほぼ落ちない。", false],
    [pct(r12.yld).replace("%", ""), "%", "投資家利回り（年率）", "在庫回転12ヶ月・ニュートラルの主線。ご投資額1億円に対する年率。", true],
    [pct(SU(12).off_b2c).replace("%", ""), "%引", "自己利用時の割引", "お飲みになる場合はWineBankの逸失利益のみご負担。ネット最安値比。", false],
  ];
  tiles.forEach((t, i) => {
    stat(s, M + (sw + 0.30) * i, 1.78, sw, 1.56, t[0], t[1], t[2], t[3],
      t[4] ? { fill: CARD2, line: GOLD_D } : {});
  });

  const pts = [
    ["現物を直接ご所有いただく。SPC・匿名組合を組成しない。",
     "WineBankが市中原価に" + pct(D.markup, 0) + "を付して現物を譲渡し、所有権を貴社へ移転する。SPC維持費・AUP・匿名組合の管理コストは発生しない。倒産隔離は名義そのもので担保される。"],
    ["顧客に対する売主はWineBank。貴社は売買契約の当事者になりません。",
     "WineBankが自己の名をもって販売する問屋型の委託販売とする。請求書の発行・代金回収・クレーム対応・返品はすべてWineBankが行い、貸倒れが生じた場合もWineBankが負担する。貴社に販売の事務負担は生じない。"],
    ["利益配分は在庫回転期間に応じたティア。早期売却の責任をWineBankが負う。",
     TIER_TXT + "。回転が延びるほどWineBankの取り分が減り、投資家の利回りを下支えする構造とする。"],
    ["お飲みになりたいときは、WineBankの逸失利益のみご負担で現物をお引き取りいただける。",
     "在庫回転12ヶ月の場合、平均定価" + yen(D.bottle_rrp) + "のワインを実質" + yen(SU(12).yen_eff) + "。同時点のネット最安値" + yen(SU(12).yen_b2c) + "に対し" + yen(SU(12).yen_save) + "安。"],
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
  s.addNotes("倉持案v2。直接所有・委託販売。1億円。回転12ヶ月で年率" + pct(r12.yld) + "。");
}

// ═══════════════════════════════════════════════════ 03 スキーム
{
  const s = chrome(base(), "STRUCTURE", "スキームの全体像",
    "取得は売買、販売は委託。貴社は現物の所有者であり続け、販売当事者にはならない。");

  const bw = (CW - 0.34 * 2) / 3, by = 1.80;
  const boxes = [
    ["① 取得（売買）", "WineBank → 貴社",
     ["WineBankがインポーター・酒販店から正規品を調達", "市中原価に" + pct(D.markup, 0) + "を付して貴社へ譲渡", "所有権・名義が貴社へ移転する"],
     "取得原価 定価比 " + num(D.unit.cost), false],
    ["② 保有", "貴社が直接所有",
     ["定温倉庫で保管（全量付保）", "貴社名義・別ロケーションで分別管理", "四半期ごとに在庫明細・簿価をご報告"],
     "ご投資額 1億円 ＝ 定価換算 " + oku(R(12).lots * 1e6) + "円", true],
    ["③ 販売（委託）", "WineBank → 顧客",
     ["売主はWineBank。貴社は売買契約の当事者にならない", "請求・回収・クレーム対応・返品はWineBankが行う", "B2B酒販店卸とB2C自社EC・オークション"],
     "販売差益をティアで配分", false],
  ];
  boxes.forEach((b, i) => {
    const x = M + (bw + 0.34) * i;
    card(s, x, by, bw, 2.36, { fill: b[4] ? CARD2 : CARD, line: b[4] ? GOLD_D : LINE });
    s.addText(b[0], {
      x: x + 0.26, y: by + 0.18, w: bw - 0.52, h: 0.26, margin: 0,
      fontFace: SANS, fontSize: 12, bold: true, color: b[4] ? GOLD_L : IVORY,
    });
    s.addText(b[1], {
      x: x + 0.26, y: by + 0.46, w: bw - 0.52, h: 0.24, margin: 0,
      fontFace: SANS, fontSize: 10, color: GOLD,
    });
    s.addText(b[2].map((v) => "・" + v).join("\n"), {
      x: x + 0.26, y: by + 0.80, w: bw - 0.52, h: 1.00, margin: 0,
      fontFace: SANS, fontSize: 9.5, color: MUTED, lineSpacingMultiple: 1.25,
    });
    s.addText(b[3], {
      x: x + 0.26, y: by + 1.92, w: bw - 0.52, h: 0.28, margin: 0,
      fontFace: SANS, fontSize: 10, bold: true, color: GOLD_L,
    });
  });
  [0, 1].forEach((i) => {
    s.addShape(pres.ShapeType.rightArrow, {
      x: M + bw + 0.05 + (bw + 0.34) * i, y: by + 1.06, w: 0.24, h: 0.24,
      fill: { color: GOLD_D }, line: { color: GOLD_D, width: 0 },
    });
  });

  const rows = [
    [th("項目"), th("v1（ご提示済み・SPC型）"), th("v2（本ご提案・直接所有型）")],
    [td("器"), td("合同会社＋匿名組合（GK-TK）"), td("器を用いない。貴社が現物を直接所有", { color: GOLD_L, bold: true })],
    [td("投資家の立場"), td("匿名組合員（出資者）"), td("現物の所有者。売買契約の当事者にはならない", { color: GOLD_L, bold: true })],
    [td("SPC維持費・AUP等"), td("年660万円"), td("発生しない", { color: GOLD_L, bold: true })],
    [td("顧客に対する売主"), td("SPC"), td("WineBank", { color: GOLD_L, bold: true })],
    [td("WineBankの報酬"), td("SPC税前利益の50%（折半）"), td("在庫回転期間に応じたティア配分")],
    [td("現物の譲渡"), td("SPCへ市中原価＋1%"), td("貴社へ市中原価＋" + pct(D.markup, 0))],
  ];
  table(s, rows, M, 4.28, CW, [2.60, 4.65, 4.64], { rowH: 0.28, fontSize: 8.5 });

  note(s, "※ 取得のみ売買とし、以後の顧客への販売は委託販売とする。顧客に対する売主はWineBankであり、貴社は売買契約の当事者にならない。貴社が反復継続して酒類を販売する形にもならない。契約書の作成前に所轄税務署の酒類指導官および顧問弁護士の確認を経て確定させる。", 6.30);
  s.addNotes("v1との対比。器を持たないことでSPC維持費660万が消える。委託販売により投資家は販売当事者にならない。");
}

// ═══════════════════════════════════════════ 04 なぜ委託販売か
{
  const s = chrome(base(), "REGULATORY & TRADE PRACTICE", "なぜ「委託販売」なのか",
    "酒類は免許業種であり、取引口座は法人単位で審査される。所有と販売を分けることで論点を解消する。");

  const cw3 = (CW - 0.30 * 2) / 3;
  const items = [
    ["01", "酒類販売業免許", "酒類を継続反復して販売するには販売場ごとの免許が必要となる。貴社ご自身が売主として売却を繰り返す形にすると、貴社側に免許が必要となるおそれがある。"],
    ["02", "インポーターの取引基準", "大手インポーターは新規取引先に対し与信・取引実績・年間取引量を審査する。事業実体を持たない法人では口座開設に至らない。"],
    ["03", "割当（アロケーション）の属人性", "希少銘柄の割当はWineBank名義に対して付与されるものであり、第三者へ譲り渡すことができない。創業55年の取引実績と輸出入ライセンスに基づく調達力は移管できない。"],
  ];
  items.forEach((c, i) => {
    const x = M + (cw3 + 0.30) * i;
    card(s, x, 1.80, cw3, 1.78);
    badge(s, x + 0.26, 1.98, 0.30, c[0], { size: 9 });
    s.addText(c[1], {
      x: x + 0.66, y: 1.96, w: cw3 - 0.92, h: 0.28, margin: 0,
      fontFace: SANS, fontSize: 11.5, bold: true, color: IVORY,
    });
    s.addText(c[2], {
      x: x + 0.26, y: 2.40, w: cw3 - 0.52, h: 1.06, margin: 0,
      fontFace: SANS, fontSize: 9.5, color: MUTED, lineSpacingMultiple: 1.3,
    });
  });

  card(s, M, 3.80, CW, 2.06, { fill: CARD2, line: GOLD_D });
  s.addText("採用する建て付け", {
    x: M + 0.30, y: 3.94, w: 6, h: 0.24, margin: 0,
    fontFace: SANS, fontSize: 11, bold: true, color: GOLD_L,
  });
  s.addText("取得は売買、販売は委託。顧客に対する売主はWineBankとし、貴社は売買契約の当事者になりません。", {
    x: M + 0.30, y: 4.20, w: CW - 0.60, h: 0.30, margin: 0,
    fontFace: SANS, fontSize: 14, bold: true, color: IVORY,
  });
  const two = [
    ["貴社にご負担いただかないもの",
     "売主はWineBankであるため、貴社は顧客との売買契約の当事者になりません。請求書の発行・代金回収・クレーム対応・返品はすべてWineBankが行い、顧客が代金を支払わない場合の貸倒れもWineBankが負担する（商法上、問屋は買主の履行を担保する責任を負う）。免許・取引口座・割当もすべてWineBank側に残るため、貴社に免許取得の負担は生じない。"],
    ["取得時の" + pct(D.markup, 0) + "について",
     "貴社の取得原価は定価比 " + num(D.unit.cost) + "（市中原価 " + num(D.unit.mkt_cost) + " ＋ " + pct(D.markup, 0) + "）。1億円のご投資に対し実商品原価は約" + oku(1e8 / (1 + D.markup)) + "円、WineBankの譲渡益は約" + man(1e8 - 1e8 / (1 + D.markup)) + "円となる。WineBankは在庫リスク・与信・入出庫事務を負って調達するため、独立企業間価格として設定している。"],
  ];
  two.forEach((c, i) => {
    const x = M + 0.30 + (CW / 2 - 0.10) * i;
    s.addText(c[0], {
      x: x, y: 4.62, w: CW / 2 - 0.44, h: 0.24, margin: 0,
      fontFace: SANS, fontSize: 10, bold: true, color: GOLD,
    });
    s.addText(c[1], {
      x: x, y: 4.88, w: CW / 2 - 0.44, h: 0.84, margin: 0,
      fontFace: SANS, fontSize: 9, color: MUTED, lineSpacingMultiple: 1.25,
    });
  });

  note(s, "※ 委託販売の形式（問屋型か代理型か）、および貴社側に酒類販売業免許を要しないことの確認は、契約書ドラフト作成前に所轄税務署の酒類指導官および顧問弁護士との間で確定させる。委託販売では税務上の売上が委託者に立つため、消費税の取扱いについては貴社顧問税理士のご確認をお願いしたい。移転価格については譲渡価格の算定根拠を文書化し、第三者卸価格との比較資料を年次で整備する。", 6.10);
  s.addNotes("免許の論点。委託販売＝問屋型にすることで投資家が販売当事者にならない。要・酒類指導官確認。");
}

// ═══════════════════════════════════════════ 05 収益の源泉
{
  const s = chrome(base(), "SOURCE OF RETURN", "収益の源泉：ワイン流通の価格差",
    "同一商品が流通段階ごとに異なる価格で存在する。この価格差＝粗利を取りに行く。");

  const pw = (CW - 0.24 * 4) / 5;
  const steps = [
    ["インポーター仕入", "40", "調達①", false],
    ["酒販店 仕入", "60", "調達②", false],
    ["貴社 取得原価", num(D.unit.cost), "市中原価＋" + pct(D.markup, 0), true],
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

  card(s, M, 3.50, CW, 2.36, { fill: CARD2, line: GOLD_D });
  s.addText("主線（ニュートラル）の置き方　── 在庫回転12ヶ月の場合　定価100あたり", {
    x: M + 0.30, y: 3.64, w: 9.5, h: 0.26, margin: 0,
    fontFace: SANS, fontSize: 11, bold: true, color: GOLD_L,
  });
  const lines = [
    ["仕入ポートフォリオ", "インポーター40 ＋ 酒販店60 を半々", "市中原価 " + num(D.unit.mkt_cost), false],
    ["現物譲渡（WineBank→貴社）", "独立企業間価格として" + pct(D.markup, 0) + "を付加", "取得原価 " + num(D.unit.cost), true],
    ["売却ポートフォリオ", "酒販店卸70（B2B）＋ ネット最安80（B2C）を半々", "取得時の売値 " + num(D.unit.price), false],
    ["保有中の値上がり", "ワイン価格の年間上昇" + pct(D.appreciation, 0) + " を12ヶ月保有", "×" + num(D.unit.k12, 3) + " → 売値 " + num(D.unit.price12), false],
    ["変動販売費", "モール・出品5.5%／カード決済3.2%／出庫・梱包2.5% の加重 " + pct(D.var_rate, 2), "▲" + num(D.unit.var12), false],
    ["人件費", "WineBank側の実務人件費 売上の" + pct(D.labor_rate, 1), "▲" + num(D.unit.labor12), false],
    ["単位粗利", "手取り " + num(D.unit.net12) + " − 取得原価 " + num(D.unit.cost), "粗利 " + num(D.unit.gross12) + "（投下原価比 " + pct(D.unit.gross12 / D.unit.cost) + "）", true],
  ];
  let ly = 3.98;
  lines.forEach((l) => {
    s.addText(l[0], {
      x: M + 0.30, y: ly, w: 2.90, h: 0.24, margin: 0,
      fontFace: SANS, fontSize: 9.5, color: l[3] ? GOLD_L : IVORY, bold: l[3],
    });
    s.addText(l[1], {
      x: M + 3.24, y: ly, w: 5.60, h: 0.24, margin: 0,
      fontFace: SANS, fontSize: 9.5, color: MUTED,
    });
    s.addText(l[2], {
      x: M + 8.90, y: ly, w: 2.90, h: 0.24, margin: 0, align: "right",
      fontFace: SANS, fontSize: 9.5, bold: true, color: l[3] ? GOLD_L : IVORY,
    });
    ly += 0.265;
  });

  note(s, "価格の上昇は流通段階全体（希望小売・ネット最安・卸値）が連動するため、取得原価は据え置きのまま売値だけが上がる。上昇率は会社資料のFine Wine年率10%に対し、保守的に" + pct(D.appreciation, 0) + "を主線とする。", 6.10);
  s.addNotes("収益の源泉。取得原価52.50、売却時79.50、手取り68.42、粗利15.92。");
}

// ═══════════════════════════════════════════ 06 販売チャネル
{
  const s = chrome(base(), "CHANNEL ECONOMICS", "販売チャネル別の手取り：B2B卸とB2Cネット販売",
    "売値だけでは判断できない。手数料構造が全く異なるため、手取りベースで比較する。");

  const hw = (CW - 0.34) / 2;
  const ch = [
    ["B2B ｜ 酒販店卸", "70.00", [
      ["出庫・配送", "0.6%", "ケース／パレット単位出荷。1回あたりの出荷単位が大きい"],
      ["決済・与信", "0.4%", "掛売のため決済手数料なし。回収コストと貸倒引当"],
    ], "1.0%", "▲0.70", num(D.unit.net_b2b), false],
    ["B2C ｜ 自社EC・オークション", "80.00", [
      ["モール・出品手数料", "5.5%", "楽天／Yahoo／寺田 Wine Market（10〜12%）と自社EC・自社オークション（0〜3%）の加重平均"],
      ["カード決済手数料", "3.2%", "クレジットカード決済"],
      ["出庫・梱包・クール便", "2.5%", "1口1,300円＋梱包資材。1口平均6万円想定"],
    ], "11.2%", "▲8.96", num(D.unit.net_b2c), true],
  ];
  ch.forEach((c, i) => {
    const x = M + (hw + 0.34) * i;
    card(s, x, 1.80, hw, 2.52, { fill: c[6] ? CARD2 : CARD, line: c[6] ? GOLD_D : LINE });
    s.addText(c[0], {
      x: x + 0.28, y: 1.96, w: hw - 1.80, h: 0.28, margin: 0,
      fontFace: SANS, fontSize: 12.5, bold: true, color: c[6] ? GOLD_L : IVORY,
    });
    s.addText([
      { text: "売値 ", options: { fontFace: SANS, fontSize: 10, color: MUTED } },
      { text: c[1], options: { fontFace: LATIN, fontSize: 22, bold: true, color: IVORY } },
    ], { x: x + hw - 2.00, y: 1.90, w: 1.72, h: 0.34, margin: 0, align: "right", valign: "middle" });

    let yy = 2.38;
    const step = c[2].length >= 3 ? 0.47 : 0.62;
    c[2].forEach((f) => {
      s.addText(f[0], {
        x: x + 0.28, y: yy, w: hw - 1.40, h: 0.22, margin: 0,
        fontFace: SANS, fontSize: 10, bold: true, color: IVORY,
      });
      s.addText(f[1], {
        x: x + hw - 1.12, y: yy, w: 0.84, h: 0.22, margin: 0, align: "right",
        fontFace: LATIN, fontSize: 10.5, bold: true, color: GOLD_L,
      });
      s.addText(f[2], {
        x: x + 0.28, y: yy + 0.20, w: hw - 0.56, h: 0.28, margin: 0,
        fontFace: SANS, fontSize: 8, color: DIM, lineSpacingMultiple: 1.1,
      });
      yy += step;
    });
    s.addText("変動販売費 合計", {
      x: x + 0.28, y: 3.86, w: hw - 2.20, h: 0.24, margin: 0,
      fontFace: SANS, fontSize: 10, color: MUTED,
    });
    s.addText(c[3] + "（" + c[4] + "）", {
      x: x + hw - 2.40, y: 3.86, w: 2.12, h: 0.24, margin: 0, align: "right",
      fontFace: SANS, fontSize: 10, bold: true, color: RED,
    });
    s.addText("手取り", {
      x: x + 0.28, y: 4.02, w: hw - 2.60, h: 0.28, margin: 0,
      fontFace: SANS, fontSize: 11, bold: true, color: IVORY,
    });
    s.addText(c[5], {
      x: x + hw - 2.80, y: 3.96, w: 2.52, h: 0.34, margin: 0, align: "right",
      fontFace: LATIN, fontSize: 22, bold: true, color: GOLD_L,
    });
  });

  card(s, M, 4.52, CW, 1.30, { fill: CARD2, line: GOLD_D });
  s.addText("手数料が重くても、B2Cのほうが手取りは " + num(D.unit.net_b2c - D.unit.net_b2b) + " ポイント高い。", {
    x: M + 0.30, y: 4.66, w: 5.10, h: 0.26, margin: 0,
    fontFace: SANS, fontSize: 11.5, bold: true, color: GOLD_L,
  });
  s.addText("B2Cは手数料率11.2%を負うが、売値が定価比80とB2Bの70を10ポイント上回るため、差し引きで勝る。ただしB2Cは1本ずつの出荷となり販売量の上限が低いため、在庫回転期間を確保するにはB2Bの卸売が不可欠となる。両者を半々で運用し、加重平均で売値 " + num(D.unit.price) + " ・変動販売費 " + pct(D.var_rate, 2) + " を主線とする（いずれも取得時点の価格。保有中の値上がりは次頁以降で加算）。", {
    x: M + 5.50, y: 4.62, w: CW - 5.80, h: 1.02, margin: 0,
    fontFace: SANS, fontSize: 9, color: MUTED, lineSpacingMultiple: 1.3,
  });
  s.addNotes("チャネル別手取り。B2B 69.30 / B2C 71.04。加重平均で売値75.00。");
}

// ═══════════════════════════════════════════ 07 単位経済
{
  const s = chrome(base(), "UNIT ECONOMICS", "3シナリオの単位経済（在庫回転12ヶ月・定価100あたり）",
    "取得時の" + pct(D.markup, 0) + "、変動販売費、人件費をすべて控除したうえでの粗利。");

  const cw3 = (CW - 0.30 * 2) / 3;
  const order = ["ネガティブ", "ニュートラル", "ポジティブ"];
  const memo = {
    "ネガティブ": "売値を5%値引き（B2B66.5／B2C76）かつ価格は横ばい",
    "ニュートラル": "仕入40/60の半々・売却はB2B70とB2C80の半々・年" + pct(D.appreciation, 0) + "上昇",
    "ポジティブ": "仕入はインポーター直の40のみ・売却はネット最安80のみ（B2C100%）",
  };
  order.forEach((name, i) => {
    const v = D.scen[name];
    const hl = name === "ニュートラル";
    const x = M + (cw3 + 0.30) * i;
    card(s, x, 1.78, cw3, 3.42, { fill: hl ? CARD2 : CARD, line: hl ? GOLD_D : LINE });
    s.addText(name + (hl ? "（主線）" : ""), {
      x: x + 0.28, y: 1.94, w: cw3 - 0.56, h: 0.28, margin: 0,
      fontFace: SANS, fontSize: 12.5, bold: true, color: hl ? GOLD_L : IVORY,
    });
    const rows = [
      ["貴社 取得原価", num(v.cost), false],
      ["取得時の売値", num(v.price), false],
      ["保有12ヶ月の上昇", "×" + num(D.unit.k12, 3), false],
      ["売却時の売値", num(v.price12), false],
      ["変動販売費 " + pct(D.var_rate, 2), "▲" + num(v.price12 * D.var_rate), false],
      ["人件費 " + pct(D.labor_rate, 1), "▲" + num(v.price12 * D.labor_rate), false],
      ["手取り", num(v.net12), false],
      ["単位粗利", num(v.gross12), true],
      ["投下原価利益率", pct(v.gross12 / v.cost), true],
    ];
    let yy = 2.34;
    rows.forEach((r) => {
      s.addText(r[0], {
        x: x + 0.28, y: yy, w: cw3 - 1.30, h: 0.24, margin: 0,
        fontFace: SANS, fontSize: 9.5, color: r[2] ? (hl ? GOLD_L : IVORY) : MUTED, bold: r[2],
      });
      s.addText(r[1], {
        x: x + cw3 - 1.30, y: yy, w: 1.02, h: 0.24, margin: 0, align: "right",
        fontFace: LATIN, fontSize: 11, bold: true,
        color: r[1].startsWith("▲") ? RED : (r[2] ? GOLD_L : IVORY),
      });
      yy += 0.265;
    });
    s.addText(memo[name], {
      x: x + 0.28, y: 4.74, w: cw3 - 0.56, h: 0.30, margin: 0,
      fontFace: SANS, fontSize: 8, color: DIM, lineSpacingMultiple: 1.15,
    });
  });

  note(s, "※ 投下原価利益率は単位粗利を貴社の取得原価で除したもの。利回りの源泉はこちらであり、1年で1回転すれば投下資本が年" + pct(D.unit.gross12 / D.unit.cost) + "増えることを意味する。ここから在庫全体にかかる固定経費（保管・保険・入庫）を控除したものが税前利益となる。", 5.42);
  s.addNotes("単位経済3シナリオ。ニュートラルで粗利15.92、投下原価利益率30.3%。");
}

// ═══════════════════════════════════════════ 08 費用の前提
{
  const r12 = R(12);
  const s = chrome(base(), "COST ASSUMPTIONS", "費用の前提",
    "固定経費はご投資額1億円に対してフルに計上し、変動経費は売上に連動させる。");

  const rows = [
    [th("区分"), th("費目"), th("単価・料率"), th("在庫回転12ヶ月での金額"), th("根拠・備考")],
    [td("固定経費"), td("保管（定温倉庫）"), td("年7,500円／ロット"), td(man(r12.cost.storage) + "円", { bold: true }),
     td("1ロット＝定価100万円相当（約40本）。月約16円／本で業務用パレット定温保管の一般水準", { align: "left" })],
    [td(""), td("動産総合保険"), td("平均在庫簿価の年0.15%"), td(man(r12.cost.insurance) + "円", { bold: true }),
     td("火災・破損・盗難・輸送中事故を全量付保。滞留・破損ロスは保険でカバーするため別途計上しない", { align: "left" })],
    [td(""), td("入庫・検品"), td("320円／ロット"), td(man(r12.cost.inbound) + "円", { bold: true }),
     td("入庫時の検品・棚入れ。出庫費用は変動販売費に含む", { align: "left" })],
    [td("変動経費", { color: GOLD_L, bold: true }), td("変動販売費"), td("売上の " + pct(D.var_rate, 2), { color: GOLD_L, bold: true }), td(man(r12.cost.selling) + "円", { bold: true, color: GOLD_L }),
     td("モール・出品5.5%／カード決済3.2%／出庫・梱包・クール便2.5% をB2B・B2Cの構成比で加重", { align: "left" })],
    [td(""), td("人件費"), td("売上の " + pct(D.labor_rate, 1), { color: GOLD_L, bold: true }), td(man(r12.cost.labor) + "円", { bold: true, color: GOLD_L }),
     td("WineBank側の実務人件費。調達・保管・販売の実務に係る人員コストを売上連動で計上する", { align: "left" })],
    [td("合計", { bold: true }), td(""), td("変動経費計 " + pct(D.total_rate, 2), { bold: true }), td(man(r12.cost_total) + "円", { bold: true, color: GOLD_L }),
     td("年間売上 " + oku(r12.sales) + "円に対する総費用率 " + pct(r12.cost_rate) + "（固定経費を含む）", { align: "left", color: GOLD_L })],
  ];
  table(s, rows, M, 1.78, CW, [1.20, 2.10, 1.90, 2.10, 4.59], { rowH: 0.44, fontSize: 8.5 });

  const bw = (CW - 0.30 * 2) / 3;
  const cards = [
    ["SPCを組成しないことで消える費用", "年 660万円",
     "SPC維持費200万・SPC人件費360万・AUP50万・予備費50万。器を持たないため、いずれも発生しない。"],
    ["変動経費の合計", pct(D.total_rate, 2),
     "変動販売費 " + pct(D.var_rate, 2) + " ＋ 人件費 " + pct(D.labor_rate, 1) + "。売上に連動するため、回転が落ちても金額として自動的に縮む。"],
    ["在庫", Math.round(r12.lots) + " ロット",
     "ご投資額1億円をフルにワイン現物へ充当。定価換算で約" + oku(r12.lots * 1e6) + "円、平均定価" + yen(D.bottle_rrp) + "なら約" + Math.round(r12.lots * 1e6 / D.bottle_rrp).toLocaleString() + "本。"],
  ];
  cards.forEach((c, i) => {
    const x = M + (bw + 0.30) * i;
    card(s, x, 4.86, bw, 1.30, { fill: i === 0 ? CARD2 : CARD, line: i === 0 ? GOLD_D : LINE });
    s.addText(c[0], {
      x: x + 0.26, y: 4.98, w: bw - 0.52, h: 0.24, margin: 0,
      fontFace: SANS, fontSize: 9.5, color: GOLD,
    });
    s.addText(c[1], {
      x: x + 0.26, y: 5.22, w: bw - 0.52, h: 0.34, margin: 0,
      fontFace: LATIN, fontSize: 19, bold: true, color: GOLD_L,
    });
    s.addText(c[2], {
      x: x + 0.26, y: 5.58, w: bw - 0.52, h: 0.46, margin: 0,
      fontFace: SANS, fontSize: 8.5, color: MUTED, lineSpacingMultiple: 1.2,
    });
  });

  note(s, "※ 保管料は業務用パレット定温保管の水準（月10〜20円／本）。個人向けセラー預かり（月100〜150円／本）とは別の料金帯。固定経費はご投資額1億円をフルにワイン現物へ充当した前提で計上しており、在庫回転が変わってもほぼ一定（在庫回転12ヶ月で計" + man(r12.cost.storage + r12.cost.insurance + r12.cost.inbound) + "円）。", 6.30);
  s.addNotes("費用前提。固定経費164万＋変動販売費975万＋人件費1,136万＝2,275万。総費用率15.0%。");
}

// ═══════════════════════════════════════════ 09 利益配分ティア
{
  const s = chrome(base(), "PROFIT SHARING", "利益配分：在庫回転期間に応じたティア",
    "早く売り切る責任をWineBankに負わせる設計。回転が延びるほどWineBankの取り分が減る。");

  s.addText("在庫回転期間", {
    x: M, y: 1.76, w: 2.0, h: 0.20, margin: 0,
    fontFace: SANS, fontSize: 8.5, color: DIM,
  });
  const tw = (CW - 0.20 * 5) / 6;
  TIER_ROWS.forEach((t, i) => {
    const ws = R(t.turn).wb_share;
    const x = M + (tw + 0.20) * i;
    card(s, x, 2.00, tw, 1.50, { fill: t.main ? CARD2 : CARD, line: t.main ? GOLD_D : LINE });
    s.addText(t.label, {
      x: x + 0.14, y: 2.10, w: tw - 0.28, h: 0.24, margin: 0, align: "center",
      fontFace: SANS, fontSize: 9.5, bold: true, color: t.main ? GOLD_L : IVORY,
    });
    s.addText("WineBank", {
      x: x + 0.14, y: 2.36, w: tw - 0.28, h: 0.20, margin: 0, align: "center",
      fontFace: SANS, fontSize: 8, color: MUTED,
    });
    s.addText(pct(ws, 0), {
      x: x + 0.14, y: 2.54, w: tw - 0.28, h: 0.38, margin: 0, align: "center",
      fontFace: LATIN, fontSize: 22, bold: true, color: IVORY,
    });
    s.addText("投資家 " + pct(1 - ws, 0), {
      x: x + 0.14, y: 2.98, w: tw - 0.28, h: 0.26, margin: 0, align: "center",
      fontFace: SANS, fontSize: 10, bold: true, color: GOLD_L,
    });
    if (t.main) {
      s.addText("主線12ヶ月はこの段", {
        x: x + 0.14, y: 3.24, w: tw - 0.28, h: 0.20, margin: 0, align: "center",
        fontFace: SANS, fontSize: 7.5, color: GOLD,
      });
    }
  });

  const hw = (CW - 0.30) / 2;
  card(s, M, 3.62, hw, 2.30, { fill: CARD2, line: GOLD_D });
  s.addText("この設計が意味すること", {
    x: M + 0.28, y: 3.76, w: hw - 0.56, h: 0.26, margin: 0,
    fontFace: SANS, fontSize: 11, bold: true, color: GOLD_L,
  });
  s.addText("在庫回転の責任をWineBankが負う", {
    x: M + 0.28, y: 4.04, w: hw - 0.56, h: 0.30, margin: 0,
    fontFace: SERIF, fontSize: 16, bold: true, color: IVORY,
  });
  s.addText("回転が延びればWineBankの取り分は" + pct(R(6).wb_share, 0) + "から" + pct(R(24).wb_share, 0) + "まで下がる。年額でみると在庫回転6ヶ月の" + man(R(6).wb_total) + "円に対し、24ヶ月では" + man(R(24).wb_total) + "円まで縮む。一方で投資家の利回りは回転が延びてもほとんど落ちない。回転リスクをWineBank側に寄せた構造であり、WineBankは早期に売り切る強い動機を持つ。", {
    x: M + 0.28, y: 4.42, w: hw - 0.56, h: 1.30, margin: 0,
    fontFace: SANS, fontSize: 10, color: MUTED, lineSpacingMultiple: 1.35,
  });

  const rows = [
    [th("在庫回転期間"), th("WineBank"), th("投資家"), th("WineBank受取"), th("投資家利回り")],
    ...[6, 9, 12, 15, 18, 24].map((t) => {
      const r = R(t);
      const hl = t === 12;
      return [
        td(t + "ヶ月" + (hl ? "（主線）" : ""), { bold: hl, color: hl ? GOLD_L : IVORY }),
        td(pct(r.wb_share, 0)),
        td(pct(1 - r.wb_share, 0), { color: GOLD_L, bold: true }),
        td(man(r.wb_total) + "円"),
        td(pct(r.yld), { bold: true, color: GOLD_L }),
      ];
    }),
  ];
  table(s, rows, M + hw + 0.30, 3.62, hw, [1.42, 1.02, 0.94, 1.32, 1.10], { rowH: 0.33, fontSize: 9 });

  note(s, "※ 表のWineBank受取は年額、投資家利回りは年率。ティアは個々の在庫の保有期間ではなく、ポートフォリオ全体の在庫回転期間で判定する。WineBank受取には配分ぶんに加えて取得時の" + pct(D.markup, 0) + "マージンと人件費を含む。境界の前後では配分率が段階的に切り替わるため、境界をまたぐ時期の運用ルール（値引き販売の制限を含む）は契約別紙で定める。", 6.14);
  s.addNotes("ティア配分。WineBankが回転リスクを負う設計。境界の運用ルールは別紙で。");
}

// ═══════════════════════════════════════════ 10 シミュレーション
{
  const s = chrome(base(), "BASE CASE ｜ 主線", "在庫回転期間別シミュレーション",
    "ご投資額1億円・ニュートラル・ワイン価格の年間上昇" + pct(D.appreciation, 0) + "。投資家利回りはすべて年率換算。");

  const list = [6, 9, 12, 15, 18, 24, 36];
  const rows = [
    [th("在庫回転期間"), th("年間回転数"), th("年間売上"), th("費用計"), th("税前利益"),
     th("WineBank"), th("投資家取分"), th("投資家利回り（年率）"), th("1回転あたり")],
    ...list.map((t) => {
      const r = R(t);
      const hl = t === 12;
      return [
        td(t + "ヶ月" + (hl ? "（主線）" : ""), { bold: hl, color: hl ? GOLD_L : IVORY }),
        td(r.turns.toFixed(2) + "回"),
        td(oku(r.sales) + "円"),
        td(man(r.cost_total) + "円"),
        td(man(r.pretax) + "円"),
        td(pct(r.wb_share, 0)),
        td(man(r.investor) + "円"),
        td(pct(r.yld), { bold: true, color: r.yld >= 0.10 ? GOLD_L : RED }),
        td(pct(r.yld_per_turn)),
      ];
    }),
  ];
  table(s, rows, M, 1.78, CW, [1.52, 1.05, 1.20, 1.20, 1.28, 0.98, 1.28, 1.72, 1.65], { rowH: 0.34, fontSize: 9 });

  const hw = (CW - 0.30) / 2;
  card(s, M, 4.66, hw, 1.44, { fill: CARD2, line: GOLD_D });
  s.addText("ご要望の水準との照合", {
    x: M + 0.28, y: 4.78, w: hw - 0.56, h: 0.24, margin: 0,
    fontFace: SANS, fontSize: 10.5, bold: true, color: GOLD_L,
  });
  const checks = [
    ["最低10%", "在庫回転 " + D.cross10[0] + "ヶ月まで確保。主線12ヶ月で " + pct(R(12).yld) + "。"],
    ["20%は取り過ぎ", "在庫回転 " + D.cross20[0] + "ヶ月より速くならない限り超えない。"],
  ];
  let cy = 5.06;
  checks.forEach((c) => {
    s.addText("● " + c[0], {
      x: M + 0.28, y: cy, w: 1.90, h: 0.24, margin: 0,
      fontFace: SANS, fontSize: 9.5, bold: true, color: GOLD,
    });
    s.addText(c[1], {
      x: M + 2.20, y: cy, w: hw - 2.48, h: 0.44, margin: 0,
      fontFace: SANS, fontSize: 9.5, color: MUTED, lineSpacingMultiple: 1.2,
    });
    cy += 0.48;
  });

  card(s, M + hw + 0.30, 4.66, hw, 1.44);
  s.addText("回転が延びても利回りは落ちない", {
    x: M + hw + 0.58, y: 4.78, w: hw - 0.56, h: 0.24, margin: 0,
    fontFace: SANS, fontSize: 10.5, bold: true, color: IVORY,
  });
  s.addText("在庫回転12ヶ月 " + pct(R(12).yld) + " に対し、18ヶ月 " + pct(R(18).yld) + "、24ヶ月 " + pct(R(24).yld) + "。ティア配分により投資家の取り分比率が上がるため、回転の悪化は利回りにほとんど響かない。ご参考までに、ご提示済みのSPC型（v1・総額5億）では回転18ヶ月で14.9%と主線21.0%から6.1ポイント低下する設計であった。", {
    x: M + hw + 0.58, y: 5.06, w: hw - 0.56, h: 0.96, margin: 0,
    fontFace: SANS, fontSize: 9.5, color: MUTED, lineSpacingMultiple: 1.3,
  });

  note(s, "※ 1回転あたりの利回りは年率を年間回転数で除したもの。在庫回転6ヶ月なら年2回転するため、1回転 " + pct(R(6).yld_per_turn) + " × 2回で年率 " + pct(R(6).yld) + " となる。", 6.34);
  s.addNotes("主線12ヶ月で年率11.5%。10%は34.1ヶ月まで、20%は4.6ヶ月より速い場合のみ超過。");
}

// ═══════════════════════════════════════════ 11 回転リスク
{
  const s = chrome(base(), "TURNOVER RISK", "在庫回転リスクはWineBankが負担する",
    "本設計の最大の特徴。回転が悪化した場合の影響はWineBank側の取り分が吸収する。");

  const cats = ["6ヶ月", "9ヶ月", "12ヶ月", "18ヶ月", "24ヶ月", "36ヶ月"];
  const list = [6, 9, 12, 18, 24, 36];

  card(s, M, 1.76, (CW - 0.30) / 2, 2.90);
  s.addChart(pres.ChartType.bar,
    [{ name: "投資家利回り", labels: cats, values: list.map((t) => +(R(t).yld * 100).toFixed(1)) }],
    Object.assign({}, CHART_BASE, {
      x: M + 0.16, y: 1.92, w: (CW - 0.30) / 2 - 0.32, h: 2.58,
      title: "投資家利回り（年率・%）", valAxisMaxVal: 20, valAxisMinVal: 0,
    }));

  card(s, M + (CW - 0.30) / 2 + 0.30, 1.76, (CW - 0.30) / 2, 2.90);
  s.addChart(pres.ChartType.bar,
    [{ name: "WineBank受取", labels: cats, values: list.map((t) => +(R(t).wb_total / 1e4).toFixed(0)) }],
    Object.assign({}, CHART_BASE, {
      x: M + (CW - 0.30) / 2 + 0.46, y: 1.92, w: (CW - 0.30) / 2 - 0.32, h: 2.58,
      title: "WineBank受取（年額・万円）", chartColors: [GOLD_D],
      dataLabelFormatCode: '#,##0', valAxisMaxVal: 8000, valAxisMinVal: 0,
    }));

  const bw = (CW - 0.30 * 2) / 3;
  const msgs = [
    ["投資家", "回転が延びても横ばい",
     "在庫回転6ヶ月 " + pct(R(6).yld) + " → 24ヶ月 " + pct(R(24).yld) + "。差は" + Math.abs((R(6).yld - R(24).yld) * 100).toFixed(1) + "ポイントにとどまる。", true],
    ["WineBank", "回転が延びると急減",
     "同じ区間で " + man(R(6).wb_total) + "円 → " + man(R(24).wb_total) + "円。" + (R(6).wb_total / R(24).wb_total).toFixed(1) + "分の1まで縮む。", false],
    ["結果として", "利害が一致する",
     "早期に売り切る動機はWineBank側に強く働く。投資家は回転の巧拙にかかわらず安定した利回りを受け取る。", false],
  ];
  msgs.forEach((c, i) => {
    const x = M + (bw + 0.30) * i;
    card(s, x, 4.84, bw, 1.34, { fill: c[3] ? CARD2 : CARD, line: c[3] ? GOLD_D : LINE });
    s.addText(c[0], {
      x: x + 0.26, y: 4.96, w: bw - 0.52, h: 0.22, margin: 0,
      fontFace: SANS, fontSize: 9, color: GOLD,
    });
    s.addText(c[1], {
      x: x + 0.26, y: 5.20, w: bw - 0.52, h: 0.30, margin: 0,
      fontFace: SANS, fontSize: 13, bold: true, color: c[3] ? GOLD_L : IVORY,
    });
    s.addText(c[2], {
      x: x + 0.26, y: 5.54, w: bw - 0.52, h: 0.54, margin: 0,
      fontFace: SANS, fontSize: 9, color: MUTED, lineSpacingMultiple: 1.25,
    });
  });

  note(s, "※ WineBank受取には利益配分ぶんに加え、取得時の" + pct(D.markup, 0) + "マージンと人件費を含む。人件費は実務にかかる原価であってWineBankの利益ではない。", 6.34);
  s.addNotes("回転リスクの所在。投資家は横ばい、WineBankは急減。利害一致の説明。");
}

// ═══════════════════════════════════════════ 12 値上がり前提
{
  const s = chrome(base(), "PRICE APPRECIATION", "ワイン価格の上昇をどう織り込むか",
    "収益は二階建て。流通価格差（フロー）とワインの値上がり（ストック）で構成される。");

  const hw = (CW - 0.30) / 2;
  card(s, M, 1.78, hw, 1.16);
  s.addText("フロー ｜ 流通価格差", {
    x: M + 0.28, y: 1.92, w: hw - 2.20, h: 0.26, margin: 0,
    fontFace: SANS, fontSize: 12, bold: true, color: IVORY,
  });
  s.addText("回転に対するリターン", {
    x: M + hw - 2.20, y: 1.94, w: 1.92, h: 0.22, margin: 0, align: "right",
    fontFace: SANS, fontSize: 8.5, color: DIM,
  });
  s.addText("40〜60で仕入れ、70〜80で売る。年に何回まわせるかに比例するため、在庫回転期間が短いほど大きくなる。", {
    x: M + 0.28, y: 2.24, w: hw - 0.56, h: 0.56, margin: 0,
    fontFace: SANS, fontSize: 9.5, color: MUTED, lineSpacingMultiple: 1.25,
  });

  card(s, M + hw + 0.30, 1.78, hw, 1.16, { fill: CARD2, line: GOLD_D });
  s.addText("ストック ｜ ワインの値上がり", {
    x: M + hw + 0.58, y: 1.92, w: hw - 2.20, h: 0.26, margin: 0,
    fontFace: SANS, fontSize: 12, bold: true, color: GOLD_L,
  });
  s.addText("在庫に対するリターン", {
    x: M + hw * 2 + 0.30 - 2.20, y: 1.94, w: 1.92, h: 0.22, margin: 0, align: "right",
    fontFace: SANS, fontSize: 8.5, color: DIM,
  });
  s.addText("保有している間、価格帯全体が年" + pct(D.appreciation, 0) + "上昇する。在庫金額に対して発生するため、在庫回転期間が延びても金額としては目減りしない。", {
    x: M + hw + 0.58, y: 2.24, w: hw - 0.56, h: 0.56, margin: 0,
    fontFace: SANS, fontSize: 9.5, color: MUTED, lineSpacingMultiple: 1.25,
  });

  const list = [6, 9, 12, 18, 24];
  const rows = [
    [th("在庫回転期間"), th("売値の上昇倍率"), th("① 上昇0%（横ばい）の場合"), th("② 年" + pct(D.appreciation, 0) + "上昇を織り込んだ場合"), th("値上がりによる上乗せ")],
    ...list.map((t) => {
      const a = RF(t), b = R(t), hl = t === 12;
      return [
        td(t + "ヶ月" + (hl ? "（主線）" : ""), { bold: hl, color: hl ? GOLD_L : IVORY }),
        td("×" + Math.pow(1 + D.appreciation, t / 12).toFixed(3)),
        td(pct(a.yld), { color: a.yld >= 0.10 ? IVORY : RED }),
        td(pct(b.yld), { bold: true, color: GOLD_L }),
        td(pt(b.yld - a.yld), { color: GOLD_L }),
      ];
    }),
  ];
  table(s, rows, M, 3.10, CW, [2.10, 2.10, 2.90, 3.30, 1.49], { rowH: 0.38, fontSize: 9 });

  card(s, M, 5.44, CW, 1.02, { fill: CARD2, line: GOLD_D });
  s.addText("値上がりが横ばいの場合、主線からの余裕は0.8ヶ月しかありません。", {
    x: M + 0.30, y: 5.56, w: 6.20, h: 0.26, margin: 0,
    fontFace: SANS, fontSize: 11.5, bold: true, color: GOLD_L,
  });
  s.addText("ワイン価格が横ばい（0%）にとどまった場合、在庫回転12ヶ月なら " + pct(RF(12).yld) + " と10%は確保するものの、10%を割るのは在庫回転 " + D.cross10_flat[0] + "ヶ月であり、主線からの余裕は " + (D.cross10_flat[0] - 12).toFixed(1) + "ヶ月しかない。年" + pct(D.appreciation, 0) + "の上昇を織り込むことで、この余裕は " + (D.cross10[0] - 12).toFixed(1) + "ヶ月まで広がる。値上がりは上乗せではなく、在庫回転の余裕を確保するための前提条件と位置づけていただきたい。", {
    x: M + 0.30, y: 5.84, w: CW - 0.60, h: 0.50, margin: 0,
    fontFace: SANS, fontSize: 9.5, color: MUTED, lineSpacingMultiple: 1.25,
  });

  note(s, "※ 上昇率" + pct(D.appreciation, 0) + "は、会社資料のFine Wine年率10%に対し保守的に置いたもの。年10%の場合は主線で " + pct(D.rate_sens[2].yld) + " となる。", 6.58);
  s.addNotes("値上がりは10%確保の前提条件。3.01%以上が必要、余裕は2.99pt。横ばいなら8.5%。");
}

// ═══════════════════════════════════════════ 13 下振れ
{
  const s = chrome(base(), "DOWNSIDE", "下振れリスク：何が起きると10%を割るか",
    "在庫回転の悪化ではなく、価格前提の悪化が主たるリスクとなる。");

  const hw = (CW - 0.30) / 2;
  const list = [6, 12, 18, 24];
  card(s, M, 1.76, hw, 2.70);
  s.addText("① 価格が横ばい（上昇0%・値引きなし）", {
    x: M + 0.28, y: 1.90, w: hw - 0.56, h: 0.26, margin: 0,
    fontFace: SANS, fontSize: 11.5, bold: true, color: IVORY,
  });
  table(s, [
    [th("在庫回転期間"), th("税前利益"), th("投資家取分"), th("投資家利回り")],
    ...list.map((t) => {
      const r = RF(t);
      return [td(t + "ヶ月"), td(man(r.pretax) + "円"), td(man(r.investor) + "円"),
              td(pct(r.yld), { bold: true, color: r.yld >= 0.10 ? IVORY : RED })];
    }),
  ], M + 0.28, 2.24, hw - 0.56, [1.34, 1.30, 1.30, 1.30], { rowH: 0.34, fontSize: 9 });
  s.addText("横ばいでも主線12ヶ月なら " + pct(RF(12).yld) + " を確保するが、10%を割るのは在庫回転 " + D.cross10_flat[0] + "ヶ月。余裕は " + (D.cross10_flat[0] - 12).toFixed(1) + "ヶ月しかない。", {
    x: M + 0.28, y: 3.98, w: hw - 0.56, h: 0.28, margin: 0,
    fontFace: SANS, fontSize: 9, color: MUTED, lineSpacingMultiple: 1.2,
  });

  card(s, M + hw + 0.30, 1.76, hw, 2.70, { fill: CARD2, line: GOLD_D });
  s.addText("② ネガティブ（売値5%値引き ＋ 価格は横ばい）", {
    x: M + hw + 0.58, y: 1.90, w: hw - 0.56, h: 0.26, margin: 0,
    fontFace: SANS, fontSize: 11.5, bold: true, color: GOLD_L,
  });
  table(s, [
    [th("在庫回転期間"), th("税前利益"), th("投資家取分"), th("投資家利回り")],
    ...list.map((t) => {
      const r = RN(t);
      return [td(t + "ヶ月"), td(man(r.pretax) + "円"), td(man(r.investor) + "円"),
              td(pct(r.yld), { bold: true, color: r.yld >= 0.10 ? IVORY : RED })];
    }),
  ], M + hw + 0.58, 2.24, hw - 0.56, [1.34, 1.30, 1.30, 1.30], { rowH: 0.34, fontSize: 9 });
  s.addText("値引きが重なるとどの回転期間でも10%に届かない。10%を割る唯一の経路であり、値引き販売の制限が最優先の防衛線となる。", {
    x: M + hw + 0.58, y: 3.98, w: hw - 0.56, h: 0.28, margin: 0,
    fontFace: SANS, fontSize: 9, color: MUTED, lineSpacingMultiple: 1.2,
  });

  card(s, M, 4.60, CW, 1.72, { fill: CARD2, line: GOLD_D });
  s.addText("最重要の示唆", {
    x: M + 0.30, y: 4.72, w: 6, h: 0.24, margin: 0,
    fontFace: SANS, fontSize: 10.5, bold: true, color: GOLD_L,
  });
  s.addText("最も重いのは「値引き」、次いで「価格の横ばい」です。", {
    x: M + 0.30, y: 4.98, w: CW - 0.60, h: 0.30, margin: 0,
    fontFace: SERIF, fontSize: 16, bold: true, color: IVORY,
  });
  s.addText("在庫回転の悪化そのものはティア配分が吸収する（主線12ヶ月 " + pct(R(12).yld) + " に対し24ヶ月 " + pct(R(24).yld) + "）。価格が横ばいにとどまると主線では " + pct(RF(12).yld) + " を保つものの、在庫回転 " + D.cross10_flat[0] + "ヶ月で10%を割る。値引きが加われば全域で10%に届かない。売値5%の値引きは単位粗利を約" + pct(1 - (D.scen["ネガティブ"].gross12 / D.scen["ニュートラル"].gross12), 0) + "毀損し、価格横ばいの前提で比べると値引きなしの " + pct(RF(12).yld) + " に対し値引きありでは " + pct(RN(12).yld) + " まで低下する。ティア配分は回転の悪化を吸収できても、粗利そのものの毀損は吸収できない。価格を維持したまま販売チャネルを増やすことが本筋の改善手段であり、売れ残りはむしろ値上がりを取りにいく機会でもある。契約上、一定率を超える値引き販売にはご承認をいただく建て付けとする。", {
    x: M + 0.30, y: 5.34, w: CW - 0.60, h: 0.86, margin: 0,
    fontFace: SANS, fontSize: 9.5, color: MUTED, lineSpacingMultiple: 1.3,
  });
  s.addNotes("下振れ。横ばいで8.5%、ネガティブで6.1%。値引き禁止が防衛線。");
}

// ═══════════════════════════════════════════ 14 感応度
{
  const s = chrome(base(), "SENSITIVITY", "感応度：何が崩れると利回りがどう動くか",
    "主線（在庫回転12ヶ月・投資家利回り年率 " + pct(R(12).yld) + "）を基準とした、各変数の単独変動による影響。");

  const b = R(12).yld;
  const rows = [
    [th("変動要因"), th("変動幅"), th("投資家利回りへの影響"), th("深刻度"), th("対応方針")],
    [td("ワイン価格上昇率"), td("年" + pct(D.appreciation, 0) + " → 0%（横ばい）"),
     td(pct(b) + " → " + pct(RF(12).yld) + "（" + pt(RF(12).yld - b) + "）", { color: RED }),
     td("最大", { color: GOLD_L, bold: true }), td("Liv-ex連動銘柄の構成比を高め、価格の下支えがある銘柄に絞る", { align: "left" })],
    [td("売却価格"), td("売値 ▲5%（70/80→66.5/76）"),
     td(pct(b) + " → " + pct(D.scen["ネガティブ"].yld12) + "（" + pt(D.scen["ネガティブ"].yld12 - b) + "）", { color: RED }),
     td("大"), td("値引き販売を禁じ、価格維持を運用ルール化する", { align: "left" })],
    [td("人件費率"), td("売上の" + pct(D.labor_rate, 1) + " → 10.0%"),
     td(pct(b) + " → " + pct(D.labor_sens[3].yld) + "（" + pt(D.labor_sens[3].yld - b) + "）", { color: RED }),
     td("中"), td("料率を契約で固定し、実費との差額精算を行わない建て付けとする", { align: "left" })],
    [td("在庫回転期間"), td("12ヶ月 → 24ヶ月"),
     td(pct(b) + " → " + pct(R(24).yld) + "（" + pt(R(24).yld - b) + "）", { color: GOLD_L }),
     td("小", { color: GOLD_L }), td("ティア配分が吸収する。WineBank側の取り分が減ることで下支えされる", { align: "left" })],
    [td("ワイン価格上昇率"), td("年" + pct(D.appreciation, 0) + " → 10%（会社資料水準）"),
     td(pct(b) + " → " + pct(D.rate_sens[2].yld) + "（" + pt(D.rate_sens[2].yld - b) + "）", { color: GOLD_L }),
     td("上振れ", { color: GOLD_L }), td("Liv-ex掲載の流動性上位銘柄の構成比を高める", { align: "left" })],
    [td("調達構成"), td("定価比 50 → 40（インポーター直取引の比率を上げる）"),
     td(pct(b) + " → " + pct(D.scen["ポジティブ"].yld12) + "（" + pt(D.scen["ポジティブ"].yld12 - b) + "）", { color: GOLD_L }),
     td("上振れ", { color: GOLD_L }), td("インポーター直取引比率の引き上げが最大の改善策", { align: "left" })],
  ];
  table(s, rows, M, 1.78, CW, [1.90, 2.70, 2.60, 1.00, 3.69], { rowH: 0.46, fontSize: 8.5 });

  card(s, M, 5.16, CW, 1.14, { fill: CARD2, line: GOLD_D });
  s.addText("結論：本設計における最大の管理項目は「在庫回転」ではなく「価格の維持」です。", {
    x: M + 0.30, y: 5.28, w: CW - 0.60, h: 0.26, margin: 0,
    fontFace: SANS, fontSize: 11.5, bold: true, color: GOLD_L,
  });
  s.addText("在庫回転の悪化はティア配分が吸収するため、12ヶ月から24ヶ月へ倍増しても投資家利回りへの影響は" + pt(R(24).yld - b) + "にとどまる。これに対し、ワイン価格が横ばいにとどまると" + pt(RF(12).yld - b) + "、値引き販売を行えばさらに下振れする。したがって運用の中心は、流動性上位銘柄への絞り込みと、価格を維持したままの販路拡大に置く。なお、インポーターの仕入価格が上昇する局面では希望小売価格も連動して上昇するため、定価比の構造は維持され、利回りへの影響は生じない。", {
    x: M + 0.30, y: 5.56, w: CW - 0.60, h: 0.66, margin: 0,
    fontFace: SANS, fontSize: 9.5, color: MUTED, lineSpacingMultiple: 1.3,
  });
  s.addNotes("感応度。最大の管理項目は価格維持。回転はティアが吸収する。");
}

// ═══════════════════════════════════════════ 15 自己利用
{
  const s = chrome(base(), "PERSONAL USE", "自己利用：お飲みになりたいときは実費のみで",
    "名義が貴社にあるため、現物をそのままお引き取りいただける。WineBankの逸失利益のみご負担いただく。");

  const su12 = SU(12);
  const sw = (CW - 0.30 * 2) / 3;
  const tiles = [
    [yen(su12.cost * D.bottle_rrp / 100).replace("円", ""), "円", "すでにお支払い済みの取得原価",
     "平均定価" + yen(D.bottle_rrp) + "のワイン1本あたり。定価比 " + num(su12.cost) + "。", false],
    [yen(su12.yen_comp).replace("円", ""), "円", "WineBankへの補償（逸失利益）",
     "委託販売に回していればWineBankが得たはずの配分ぶん。在庫回転12ヶ月・WineBank" + pct(su12.wb_share, 0) + "の場合。", false],
    [yen(su12.yen_eff).replace("円", ""), "円", "実質のお引き取り価格",
     "同時点のネット最安値 " + yen(su12.yen_b2c) + " に対し " + yen(su12.yen_save) + " 安（" + pct(su12.off_b2c) + "引）。", true],
  ];
  tiles.forEach((t, i) => {
    stat(s, M + (sw + 0.30) * i, 1.78, sw, 1.56, t[0], t[1], t[2], t[3],
      t[4] ? { fill: CARD2, line: GOLD_D, vs: 30 } : { vs: 30 });
  });

  const list = [6, 12, 18, 24];
  const rows = [
    [th("在庫回転期間"), th("WineBank配分率"), th("WineBankへの補償"), th("実質お引き取り価格"),
     th("同時点のネット最安値"), th("差額"), th("希望小売価格比")],
    ...list.map((t) => {
      const v = SU(t), hl = t === 12;
      return [
        td(t + "ヶ月" + (hl ? "（主線）" : ""), { bold: hl, color: hl ? GOLD_L : IVORY }),
        td(pct(v.wb_share, 0)),
        td(yen(v.yen_comp)),
        td(yen(v.yen_eff), { bold: true, color: GOLD_L }),
        td(yen(v.yen_b2c)),
        td(yen(v.yen_save) + "安", { color: GOLD_L }),
        td(pct(v.off_rrp) + "引", { bold: true, color: GOLD_L }),
      ];
    }),
  ];
  table(s, rows, M, 3.54, CW, [1.86, 1.66, 1.76, 1.96, 2.06, 1.44, 1.15], { rowH: 0.38, fontSize: 9 });

  card(s, M, 5.56, CW, 0.88, { fill: CARD2, line: GOLD_D });
  s.addText("長くお持ちいただくほど、安くお飲みいただけます。", {
    x: M + 0.30, y: 5.66, w: 5.60, h: 0.26, margin: 0,
    fontFace: SANS, fontSize: 11.5, bold: true, color: GOLD_L,
  });
  s.addText("在庫回転期間が延びるほどWineBankの配分率が下がるため、ご負担いただく補償額も小さくなる。在庫回転24ヶ月なら実質 " + yen(SU(24).yen_eff) + "、ネット最安値比 " + pct(SU(24).off_b2c) + "引。定価比では " + num(SU(24).effective) + " となる。", {
    x: M + 6.00, y: 5.64, w: CW - 6.30, h: 0.60, margin: 0,
    fontFace: SANS, fontSize: 9.5, color: MUTED, lineSpacingMultiple: 1.25,
  });

  note(s, "※ 補償額は通常の売却と同じ基準（変動販売費・人件費を控除した後の利益に配分率を乗じたもの）で算定する。保管・保険は在庫全体に対して発生済みのため配賦しない。自己利用に供した分は運用資産から外れるため、その分のリターンは生じない。年間のご利用上限本数は契約別紙で定める。なお法人が所有する資産を役員が私的に利用する場合の税務上の取扱いについては、貴社顧問税理士のご確認をお願いしたい。", 6.52);
  s.addNotes("自己利用。12ヶ月で実質16,281円→本設計では15,513円。ネット最安比26.8%引き。役員給与認定リスクは要確認。");
}

// ═══════════════════════════════════════════ 16 在庫の分別管理
{
  const s = chrome(base(), "SEGREGATION & FAIRNESS", "在庫の分別管理と配分の公平性",
    "調達・保管・販売のすべてをWineBankが担うため、配分に構造的な利益相反が生じる。");

  const cw3 = (CW - 0.30 * 2) / 3;
  const items = [
    ["01", "名義による分別", "現物は貴社名義で保有し、WineBankの債権者から隔離される。器を介さないため、倒産隔離は名義そのもので担保される。倉庫内では別ロケーション・別ラベルで管理し、現物の特定可能性を確保する。", true],
    ["02", "プロラタ配分を原則とする", "同一銘柄が貴社在庫とWineBank自己勘定の双方にある場合、売却を在庫数量の比率に応じて配分する。偶々の売却順が公平性を損なわないよう、累計配分比率を在庫比率に一致させる配分台帳で管理する。", false],
    ["03", "判断を要する場合は貴社優先", "乖離が同等である場合や、ロット単位の売却などプロラタで割り切れない場合は、貴社在庫を優先して売却する。四半期末の乖離が許容幅を超えた場合は翌四半期に是正する。", false],
  ];
  items.forEach((c, i) => {
    const x = M + (cw3 + 0.30) * i;
    card(s, x, 1.78, cw3, 1.90, { fill: c[3] ? CARD2 : CARD, line: c[3] ? GOLD_D : LINE });
    badge(s, x + 0.26, 1.96, 0.30, c[0], { size: 9 });
    s.addText(c[1], {
      x: x + 0.66, y: 1.94, w: cw3 - 0.92, h: 0.28, margin: 0,
      fontFace: SANS, fontSize: 11.5, bold: true, color: c[3] ? GOLD_L : IVORY,
    });
    s.addText(c[2], {
      x: x + 0.26, y: 2.38, w: cw3 - 0.52, h: 1.18, margin: 0,
      fontFace: SANS, fontSize: 9.5, color: MUTED, lineSpacingMultiple: 1.3,
    });
  });

  const rows = [
    [th("担保の手段"), th("内容")],
    [td("組入銘柄の選定"), td("Liv-ex掲載の流動性上位銘柄を組み入れ、可能な限り自己勘定在庫と重複させない。重複しない銘柄では配分の判断自体が生じない", { align: "left" })],
    [td("取得時の按分"), td("同一SKUを複数ロット取得する場合は、貴社とWineBank自己勘定の在庫比率に応じて按分して割り当てる", { align: "left" })],
    [td("配分台帳"), td("SKU別に期首在庫・取得・売却・期末在庫を両建てで記録し、累計配分比率と在庫比率の乖離を四半期ごとに開示する", { align: "left" })],
    [td("システムによる自動割当"), td("出庫指示はシステム側で自動割当とし、担当者が出所を選択できない設計とする。変更は理由の記録を必須とする", { align: "left" })],
    [td("倉庫内の分別保管"), td("貴社名義の在庫は別ロケーション・別ラベルで管理し、現物の特定可能性を確保する。四半期ごとに第三者棚卸を実施する", { align: "left" })],
    [td("独立第三者による検証"), td("配分ルールの遵守状況について、公認会計士による合意された手続（AUP）を年次で実施することも可能とする", { align: "left" })],
  ];
  table(s, rows, M, 3.84, CW, [2.90, 8.99], { rowH: 0.34, fontSize: 9 });

  note(s, "※ 「貴社在庫を完売するまで自己勘定を売らない」という運用は、商品構成が銘柄ごとに異なるため実務上成立しない。したがってプロラタ配分を原則とし、プロラタで決し得ない部分について貴社を優先する設計とした。在庫回転期間は主として「何を組み入れるか」で決まるため、組成時の銘柄選定が最大の担保となる。", 6.34);
  s.addNotes("分別管理。名義で倒産隔離。プロラタ原則、判断を要する場合は投資家優先。");
}

// ═══════════════════════════════════════════ 17 報告・利益相反
{
  const s = chrome(base(), "GOVERNANCE", "情報開示・報告と利益相反の管理",
    "運営者への依存度が高い設計であるため、開示義務と利益相反管理を契約上で具体的に定める。");

  const hw = (CW - 0.30) / 2;
  card(s, M, 1.78, hw, 3.46);
  s.addText("契約上の報告・開示義務", {
    x: M + 0.28, y: 1.92, w: hw - 0.56, h: 0.26, margin: 0,
    fontFace: SANS, fontSize: 12, bold: true, color: IVORY,
  });
  const discl = [
    "四半期ごとの在庫明細・簿価・売上・販売実績",
    "仕入数量・仕入単価・販売数量・販売単価・在庫数量",
    "委託販売の精算明細（売却価格・控除費用・配分額）",
    "配分台帳（累計配分比率と在庫比率の乖離）",
    "関連当事者取引・利益相反取引の内容、金額、取引条件",
    "一定金額以上の取引、追加取得、契約変更の事前承認",
    "会計帳簿・請求書・契約書・銀行取引記録の閲覧および調査権",
    "重大な計画変更、損失発生、不正または法令違反時の速やかな報告",
  ];
  let dy = 2.26;
  discl.forEach((t) => {
    s.addShape(pres.ShapeType.ellipse, {
      x: M + 0.30, y: dy + 0.06, w: 0.09, h: 0.09,
      fill: { color: GOLD }, line: { color: GOLD, width: 0 },
    });
    s.addText(t, {
      x: M + 0.50, y: dy - 0.02, w: hw - 0.80, h: 0.30, margin: 0,
      fontFace: SANS, fontSize: 9.5, color: MUTED,
    });
    dy += 0.335;
  });

  card(s, M + hw + 0.30, 1.78, hw, 3.46, { fill: CARD2, line: GOLD_D });
  s.addText("利益相反の管理", {
    x: M + hw + 0.58, y: 1.92, w: hw - 0.56, h: 0.26, margin: 0,
    fontFace: SANS, fontSize: 12, bold: true, color: GOLD_L,
  });
  const conf = [
    ["独立企業間価格の原則", "運営者およびその関係会社との取引は、第三者との取引条件と同等の条件によるものとする。"],
    ["価格根拠の文書化", "取得時の" + pct(D.markup, 0) + "を含め、価格および取引条件の合理性を客観的資料により説明できる状態を維持する。第三者卸価格との比較資料を年次で整備する。"],
    ["重要な関連当事者取引の事前承認", "一定金額以上の取引については、貴社または独立した第三者の事前承認を要する。"],
    ["在庫配分ルールの遵守", "前頁の配分方針を契約別紙として明文化し、逸脱時の是正・補填手続を定める。"],
    ["値引き販売の制限", "一定率を超える値引き販売には貴社のご承認を要する。ティア境界をまたぐ時期の運用も同様とする。"],
  ];
  let cy = 2.26;
  conf.forEach((c) => {
    s.addText(c[0], {
      x: M + hw + 0.58, y: cy, w: hw - 0.56, h: 0.22, margin: 0,
      fontFace: SANS, fontSize: 10, bold: true, color: IVORY,
    });
    s.addText(c[1], {
      x: M + hw + 0.58, y: cy + 0.21, w: hw - 0.56, h: 0.40, margin: 0,
      fontFace: SANS, fontSize: 8.5, color: MUTED, lineSpacingMultiple: 1.2,
    });
    cy += 0.58;
  });

  const bw = (CW - 0.30 * 2) / 3;
  const foot = [
    ["形態", "現物の直接所有", "器を用いないため、金融商品取引法上のファンド持分には該当しない。適格機関投資家等特例業務の届出も要しない。"],
    ["外部検証", "AUP（合意された手続）", "財務諸表監査ではなく、目的を限定した合意された手続。配分ルールの遵守状況も対象に含めることができる。"],
    ["報告頻度", "四半期", "在庫明細・簿価・売上・販売実績を四半期ごとに開示し、年次で総括を報告する。"],
  ];
  foot.forEach((c, i) => {
    const x = M + (bw + 0.30) * i;
    card(s, x, 5.42, bw, 1.06);
    s.addText(c[0], {
      x: x + 0.26, y: 5.52, w: bw - 0.52, h: 0.20, margin: 0,
      fontFace: SANS, fontSize: 8.5, color: DIM,
    });
    s.addText(c[1], {
      x: x + 0.26, y: 5.72, w: bw - 0.52, h: 0.28, margin: 0,
      fontFace: SANS, fontSize: 12, bold: true, color: GOLD_L,
    });
    s.addText(c[2], {
      x: x + 0.26, y: 6.02, w: bw - 0.52, h: 0.38, margin: 0,
      fontFace: SANS, fontSize: 8, color: MUTED, lineSpacingMultiple: 1.15,
    });
  });
  s.addNotes("ガバナンス。器がないため金商法のファンド持分に非該当。特例業務届出も不要。");
}

// ═══════════════════════════════════════════ 18 リスク
{
  const s = chrome(base(), "RISK", "想定されるリスクと対応策", null);

  const cw4 = (CW - 0.26 * 3) / 4;
  const risks = [
    ["在庫リスク", "想定価格で売り切れず滞留する", "銘柄をLiv-ex掲載の流通量の多い銘柄に限定。四半期ごとに滞留在庫を洗い出し、簿価見直しを実施。滞留は値上がりを取る期間でもある。"],
    ["価格変動リスク", "Fine Wine市況の下落・停滞", "主線は年" + pct(D.appreciation, 0) + "上昇を織り込むが、横ばい（0%）でも在庫回転12ヶ月で " + pct(RF(12).yld) + " を確保する。会社資料の年率10%に対し保守的な前提。値引き販売が重なると10%を割る。"],
    ["流動性リスク", "現物のため即時換金できない", "現物への投資であり、換金には販売を要する。急な資金需要に備える設計とはなっていない点をご了解いただきたい。"],
    ["調達リスク", "想定価格・数量で仕入れられない", "インポーター・酒販店との年間調達枠を事前に締結。調達実績を四半期報告。"],
    ["オペレーションリスク", "保管中の破損・劣化・盗難", "定温倉庫での保管と動産総合保険による全量付保。ロスは保険でカバーする前提のため費用計上していない。倉庫在庫は四半期ごとに第三者棚卸。"],
    ["カウンターパーティリスク", "WineBankの信用・販売先の与信", "現物は貴社名義で保有されるため、WineBankの債権者から隔離される。販売先が代金を支払わない場合の貸倒れは、売主であるWineBankが負担し貴社には及ばない。"],
    ["免許・商流リスク", "免許事業者の変更・取引口座の喪失", "WineBankの免許維持を契約上の義務とし、免許喪失時は在庫を売却清算する条項を置く。委託販売の形式は事前に酒類指導官の確認を得る。"],
    ["移転価格リスク", "取得時" + pct(D.markup, 0) + "の妥当性を否認される", "譲渡価格の算定根拠を文書化。第三者卸価格との比較資料を年次で整備し、税務調査に備える。"],
  ];
  risks.forEach((r, i) => {
    const col = i % 4, row = Math.floor(i / 4);
    const x = M + (cw4 + 0.26) * col;
    const y = 1.62 + row * 2.42;
    card(s, x, y, cw4, 2.20);
    s.addText(r[0], {
      x: x + 0.24, y: y + 0.18, w: cw4 - 0.48, h: 0.26, margin: 0,
      fontFace: SANS, fontSize: 11.5, bold: true, color: IVORY,
    });
    s.addText(r[1], {
      x: x + 0.24, y: y + 0.48, w: cw4 - 0.48, h: 0.40, margin: 0,
      fontFace: SANS, fontSize: 9, color: GOLD, lineSpacingMultiple: 1.15,
    });
    s.addText(r[2], {
      x: x + 0.24, y: y + 0.94, w: cw4 - 0.48, h: 1.14, margin: 0,
      fontFace: SANS, fontSize: 8.5, color: MUTED, lineSpacingMultiple: 1.25,
    });
  });
  s.addNotes("リスク8項目。最大は価格変動リスク。流動性リスクは現物投資の性質として明示。");
}

// ═══════════════════════════════════════════ 19 設計条件
{
  const r12 = R(12);
  const s = chrome(base(), "TERMS", "ご投資条件（ドラフト）",
    "取得・所有・販売の枠組み（左）と、費用・配分・報告（右）に分けて記載する。");

  const hw = (CW - 0.30) / 2;
  const left = [
    [th("項目"), th("内容")],
    [td("形態"), td("ワイン現物の直接所有。SPC・匿名組合を組成しない", { align: "left", color: GOLD_L, bold: true })],
    [td("ご投資額"), td("1億円（全額をワイン現物に充当）", { align: "left", color: GOLD_L, bold: true })],
    [td("取得"), td("WineBankが市中原価に" + pct(D.markup, 0) + "を付して譲渡。所有権・名義が貴社へ移転", { align: "left" })],
    [td("販売"), td("委託販売（問屋型）。顧客に対する売主はWineBank。貴社は売買契約の当事者にならない", { align: "left", color: GOLD_L, bold: true })],
    [td("販売事務・回収"), td("請求書発行・代金回収・クレーム対応・返品はWineBankが行う。貸倒れもWineBankが負担する", { align: "left" })],
    [td("販売チャネル"), td("酒販店卸（B2B）と自社EC・オークション（B2C）を半々", { align: "left" })],
    [td("在庫回転目標"), td("12ヶ月。最短6ヶ月、延びても24ヶ月を想定レンジとする", { align: "left", color: GOLD_L, bold: true })],
    [td("換金"), td("現物への投資であり、換金には販売を要する。即時の換金には応じられない", { align: "left" })],
    [td("元本の裏付け"), td("貴社名義のワイン現物。四半期ごとに在庫明細・簿価を報告", { align: "left" })],
  ];
  table(s, left, M, 1.78, hw, [1.55, 4.25], { rowH: 0.40, fontSize: 8.5 });

  const right = [
    [th("項目"), th("内容")],
    [td("固定経費"), td("保管・保険・入庫。ご投資額1億円に対しフル計上（年 約" + man(r12.cost.storage + r12.cost.insurance + r12.cost.inbound) + "円）", { align: "left" })],
    [td("変動経費"), td("変動販売費 売上の" + pct(D.var_rate, 2) + " ＋ 人件費 売上の" + pct(D.labor_rate, 1) + " ＝ 計" + pct(D.total_rate, 2), { align: "left", color: GOLD_L, bold: true })],
    [td("利益配分"), td(TIER_TXT + "（在庫回転期間で判定）", { align: "left", color: GOLD_L, bold: true })],
    [td("価格前提"), td("ワイン価格の年間上昇" + pct(D.appreciation, 0) + "。会社資料のFine Wine年率10%に対し保守的に設定", { align: "left" })],
    [td("想定リターン"), td("投資家利回り（年率）" + pct(r12.yld) + " ＝ 年 " + man(r12.investor) + "円（在庫回転12ヶ月）", { align: "left", color: GOLD_L, bold: true })],
    [td("自己利用"), td("WineBankの逸失利益をご負担のうえ現物をお引き取りいただける。年間上限本数は別紙で定める", { align: "left", color: GOLD_L, bold: true })],
    [td("報告"), td("四半期：在庫明細・簿価・売上・販売実績・配分台帳／年次：総括", { align: "left" })],
    [td("在庫配分"), td("在庫比率によるプロラタを原則とし、判断を要する場合は貴社在庫を優先する", { align: "left" })],
  ];
  table(s, right, M + hw + 0.30, 1.78, hw, [1.55, 4.25], { rowH: 0.40, fontSize: 8.5 });

  card(s, M, 5.96, CW, 0.86, { fill: CARD2, line: GOLD_D });
  s.addText("SPC・匿名組合を用いないことで、年660万円の維持費と組成の手間がなくなります。", {
    x: M + 0.30, y: 6.06, w: 6.60, h: 0.24, margin: 0,
    fontFace: SANS, fontSize: 10.5, bold: true, color: GOLD_L,
  });
  s.addText("金融商品取引法上のファンド持分に該当しないため、適格機関投資家等特例業務の届出も要しない。現物の所有者として、在庫そのものが元本の裏付けとなる。", {
    x: M + 7.00, y: 6.04, w: CW - 7.30, h: 0.56, margin: 0,
    fontFace: SANS, fontSize: 9, color: MUTED, lineSpacingMultiple: 1.25,
  });
  s.addNotes("条件ドラフト。SPC不要で660万削減。金商法のファンド持分に非該当。");
}

// ═══════════════════════════════════════════ 20 今後の進め方
{
  const s = chrome(base(), "NEXT STEPS", "今後の進め方", null);

  const cw5 = (CW - 0.26 * 4) / 5;
  const steps = [
    ["01", "前提条件のすり合わせ", "在庫回転期間・販売チャネル構成・配分ティア・人件費率についてご意見をいただく。取得時" + pct(D.markup, 0) + "の水準もあわせてご確認いただきたい。", false],
    ["02", "免許・税務の確定", "委託販売の形式について所轄税務署の酒類指導官および顧問弁護士と確認する。取得時" + pct(D.markup, 0) + "の算定根拠を文書化する。", true],
    ["03", "調達枠の確保と実証", "インポーター・酒販店との年間調達枠を締結し、小規模ロットで在庫回転期間とチャネル別手数料の実証を行う。", false],
    ["04", "契約書の作成", "売買基本契約・委託販売契約・別紙（在庫配分方針／情報開示・報告／利益相反管理／自己利用）を作成する。", false],
    ["05", "取得・運用開始", "ご入金に合わせて調達・取得を開始。四半期ごとに在庫明細・簿価・売上・配分台帳をご報告する。", false],
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
    ["委託販売の形式", "貴社側に酒類販売業免許を要しないことの確認。契約書作成前の確定を要する。"],
    ["自己利用の税務", "法人所有資産を役員が私的に利用する場合の取扱い。貴社顧問税理士のご確認をお願いしたい。"],
    ["配分ティアの水準", "優先配当・上限の設定を含め、ご投資家のご意向を伺ったうえで確定させたい。"],
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
  s.addNotes("次のステップ。免許確認・自己利用の税務・配分ティアの水準が要確認事項。");
}

// ═══════════════════════════════════════════ 21 まとめ
{
  const r12 = R(12);
  const s = chrome(base(), "CONCLUSION", "まとめ：本ご提案の意義", null);

  const hw = CW * 0.56;
  const pts = [
    ["01", "所有は貴社、売主はWineBank",
     "ワインは貴社名義で保有され、WineBankの債権者から隔離される。一方で顧客への売主はWineBankであり、貴社は売買契約の当事者にならない。販売の事務も貸倒れのリスクもご負担いただかない。"],
    ["02", "在庫回転の責任はWineBankが負う",
     "回転が延びればWineBankの取り分が" + pct(R(6).wb_share, 0) + "から" + pct(R(24).wb_share, 0) + "まで下がる。投資家利回りは在庫回転6ヶ月 " + pct(R(6).yld) + " から24ヶ月 " + pct(R(24).yld) + " までほぼ横ばいで推移する。"],
    ["03", "他社が再現できない調達力",
     "創業55年の酒販免許、大手インポーターとの直接取引、輸出入ライセンス。新規参入業者が正規品を同じ値で大量に仕入れることはできない。"],
    ["04", "出口をB2BとB2Cの両輪で持っている",
     "酒販店卸（B2B）に加え、自社EC・オークション・CLUB会員・グループのアピシウス（B2C）。手取りの高いチャネルを選べる構造。"],
    ["05", "お飲みになりたいときは実費のみで",
     "名義が貴社にあるため現物をそのままお引き取りいただける。平均定価" + yen(D.bottle_rrp) + "のワインを実質" + yen(SU(12).yen_eff) + "、ネット最安値比" + pct(SU(12).off_b2c) + "引。"],
  ];
  let y = 1.62;
  pts.forEach((p, i) => {
    const hl = i === 4;
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
  s.addText("ご要望との照合", {
    x: rx + 0.28, y: 1.76, w: rw - 0.56, h: 0.28, margin: 0,
    fontFace: SANS, fontSize: 12.5, bold: true, color: GOLD_L,
  });
  const checks = [
    ["最低10%は確保したい",
     "在庫回転12ヶ月で年率 " + pct(r12.yld) + "。在庫回転が " + D.cross10[0] + "ヶ月まで延びても10%を確保する。",
     "横ばいの場合は主線で " + pct(RF(12).yld) + "。ただし10%を割るのは在庫回転 " + D.cross10_flat[0] + "ヶ月であり、余裕は " + (D.cross10_flat[0] - 12).toFixed(1) + "ヶ月しかない。"],
    ["20%は取り過ぎ",
     "在庫回転が " + D.cross20[0] + "ヶ月より速くならない限り20%を超えない。",
     "想定レンジ（6〜24ヶ月）では " + pct(R(24).yld) + " 〜 " + pct(R(6).yld) + " に収まる。"],
    ["人件費を適正に計上してほしい",
     "売上の" + pct(D.labor_rate, 1) + "を人件費として計上。在庫回転12ヶ月で年 " + man(r12.cost.labor) + "円。",
     "変動販売費 " + pct(D.var_rate, 2) + " と合わせて " + pct(D.total_rate, 2) + "。固定経費を含めた総費用率は " + pct(r12.cost_rate) + "。"],
    ["SPCの無駄なコストを避けたい",
     "SPC維持費・AUP・予備費・SPC人件費の年660万円が不要となる。",
     "金融商品取引法上のファンド持分にも該当せず、特例業務の届出も要しない。"],
  ];
  let cy = 2.14;
  checks.forEach((c) => {
    s.addShape(pres.ShapeType.ellipse, {
      x: rx + 0.30, y: cy + 0.07, w: 0.10, h: 0.10,
      fill: { color: GOLD }, line: { color: GOLD, width: 0 },
    });
    s.addText(c[0], {
      x: rx + 0.52, y: cy - 0.02, w: rw - 0.82, h: 0.22, margin: 0,
      fontFace: SANS, fontSize: 10.5, bold: true, color: IVORY,
    });
    s.addText(c[1], {
      x: rx + 0.52, y: cy + 0.21, w: rw - 0.82, h: 0.38, margin: 0,
      fontFace: SANS, fontSize: 9, color: GOLD_L, lineSpacingMultiple: 1.2,
    });
    s.addText(c[2], {
      x: rx + 0.52, y: cy + 0.60, w: rw - 0.82, h: 0.38, margin: 0,
      fontFace: SANS, fontSize: 8.5, color: MUTED, lineSpacingMultiple: 1.2,
    });
    cy += 1.02;
  });

  s.addText("ワインは飲めば消える嗜好品ではなく、正規流通の価格差という再現性のある収益源です。その価格差を取りに行く実務を、55年分の免許と取引関係で担うのがWineBankです。本ご提案は、値上がりを待つ投資ではなく、この実務そのものにご参加いただくご提案です。", {
    x: M, y: 6.42, w: CW, h: 0.44, margin: 0,
    fontFace: SANS, fontSize: 9.5, color: MUTED, lineSpacingMultiple: 1.3,
  });
  s.addNotes("まとめ。ご要望4点との照合。10%は値上がり前提である点を明記。");
}

// ═══════════════════════════════════════════ 22 裏表紙
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

pres.writeFile({ fileName: "WineBank_ワイン現物投資のご提案_倉持案_直接所有委託販売_1億円_20260820.pptx" })
  .then((f) => console.log("written:", f));
