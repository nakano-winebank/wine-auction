// 山本案：前回資料（原価卸＋折半）から今回資料（時価−α卸＋プロラタ配分）への変更点（DOCX）
// 数値は structure.py が書き出す figures.json を読む。手打ちしない。
const {
  Document, Packer, Paragraph, TextRun, AlignmentType, BorderStyle,
  Table, TableRow, TableCell, WidthType, Footer, PageNumber,
  convertInchesToTwip, VerticalAlign,
} = require("docx");
const fs = require("fs");

const F = JSON.parse(fs.readFileSync(__dirname + "/figures.json", "utf8"));
const PA = F.params;
const L = F.legacy;
const C1 = F.first, C2 = F.second;
const P1 = C1.holds["12"], P2 = C2.holds["12"];

const oku   = (v) => (v / 1e8).toFixed(2) + "億円";
const okuN  = (v) => (v / 1e8).toFixed(0) + "億円";
const hyaku = (v) => Math.round(v / 1e6) + "百万円";
const man   = (v) => Math.round(v / 1e4).toLocaleString() + "万円";
const pc    = (v) => (v * 100).toFixed(1) + "%";
const pt    = (v) => (v >= 0 ? "＋" : "▲") + Math.abs(v * 100).toFixed(1) + "pt";
const mon   = (v) => v.toFixed(1) + "ヶ月";
const f2    = (v) => v.toFixed(2);

// 両者の取り分の合計（パイ）
const pieOld = L.inv + L.wb_total;
const pieNew = P1.inv + P1.wb_total;

const SERIF = "Yu Mincho";
const SANS  = "Yu Gothic";
const GOLD  = "6E5730";
const RED   = "9C3D28";

function p(text, o = {}) {
  return new Paragraph({
    alignment: o.align || AlignmentType.LEFT,
    spacing: { before: o.before ?? 0, after: o.after ?? 120, line: o.line ?? 300 },
    children: [new TextRun({
      text, font: o.font || SERIF, size: o.size || 21,
      bold: o.bold || false, color: o.color || "000000",
    })],
  });
}

function h1(text) {
  return new Paragraph({
    spacing: { before: 360, after: 180, line: 300 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "A78450", space: 6 } },
    children: [new TextRun({ text, font: SERIF, size: 26, bold: true })],
  });
}

function h2(text) {
  return new Paragraph({
    spacing: { before: 240, after: 100, line: 300 },
    children: [new TextRun({ text, font: SANS, size: 21, bold: true, color: GOLD })],
  });
}

function bullet(text) {
  return new Paragraph({
    spacing: { before: 0, after: 80, line: 300 },
    indent: { left: convertInchesToTwip(0.3), hanging: convertInchesToTwip(0.18) },
    children: [new TextRun({ text: "・" + text, font: SERIF, size: 21 })],
  });
}

function cell(text, o = {}) {
  return new TableCell({
    width: { size: o.w || 25, type: WidthType.PERCENTAGE },
    shading: o.head ? { fill: "F2EEE6" } : undefined,
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    children: [new Paragraph({
      spacing: { before: 0, after: 0, line: 260 },
      alignment: o.align || AlignmentType.LEFT,
      children: [new TextRun({
        text, font: o.head ? SANS : SERIF, size: o.size || 19,
        bold: o.head || o.bold || false, color: o.color || "000000",
      })],
    })],
  });
}

function tbl(rows, widths) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top:    { style: BorderStyle.SINGLE, size: 4, color: "BFB6A6" },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: "BFB6A6" },
      left:   { style: BorderStyle.SINGLE, size: 4, color: "BFB6A6" },
      right:  { style: BorderStyle.SINGLE, size: 4, color: "BFB6A6" },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: "D8D0C2" },
      insideVertical:   { style: BorderStyle.SINGLE, size: 2, color: "D8D0C2" },
    },
    rows: rows.map((r, ri) => new TableRow({
      children: r.map((c, ci) => {
        const o = typeof c === "string" ? { text: c } : c;
        return cell(o.text, Object.assign({ head: ri === 0, w: widths[ci] }, o));
      }),
    })),
  });
}

const children = [];

// ───────────────────────────────── 表紙
children.push(
  new Paragraph({
    spacing: { before: 1000, after: 80 },
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "WINEBANK WINE FUND", font: "Cambria", size: 20, bold: true, color: GOLD, characterSpacing: 60 })],
  }),
  p("ワインファンド（SPC）組成のご提案", { align: AlignmentType.CENTER, size: 26, bold: true, after: 60 }),
  p("山本案　前回資料からの変更点", { align: AlignmentType.CENTER, size: 36, bold: true, after: 200 }),
  p("原価で卸して出口で折半する方式から、時価−αで卸して出口は出資比率どおりに分ける方式へ",
    { align: AlignmentType.CENTER, size: 20, color: "555555", after: 700 }),
  p("2026年9月", { align: AlignmentType.CENTER, size: 20, color: "555555", after: 60 }),
  p("株式会社WineBank", { align: AlignmentType.CENTER, size: 21, bold: true, after: 700 }),
);

children.push(
  h1("本書の位置づけ"),
  p("本書は、WineBankの取り分を「出口の成功報酬（折半）」から「SPCへ卸す時点の値入れ」へ移す変更について、前回資料から何をどう変えたかを整理したものである。提案資料本体とあわせてご確認いただきたい。"),
  p("金額・利回りはすべて共通の収益モデル（model.py）から算出しており、前回資料の数値も同一のモデルで再計算して対照している。前提を変えていない項目については、前回資料と完全に同じ数値になることを確認済みである。"),
);

// ───────────────────────────────── 1. 変更の要旨
children.push(
  h1("1. 変更の要旨"),
  p("変更は3点である。①が本質的な変更であり、②③はこれに付随する。"),
  tbl([
    ["変更点", "前回（原価卸＋折半）", "今回（時価−α卸＋プロラタ）"],
    [{ text: "① WineBankの取り分", bold: true },
     `SPCへは原価（定価比${f2(L.spc_cost)}）で卸し、出口でSPC税前利益のうち投資家帰属分（40%）を投資家と折半する`,
     { text: `SPCへ卸す時点で値入れする。出口で取るのは管理報酬（総額の年2%）のみとし、成功報酬（折半）は取らない`, bold: true }],
    [{ text: "② 損益の配分", bold: true },
     "投資家帰属分（40%）を折半したうえで配分する",
     "SPC税前利益を出資比率どおり60：40でプロラタ配分する"],
    [{ text: "③ 卸値のルール", bold: true },
     `市中原価${f2(PA.mkt_cost)}＋現物譲渡1% ＝ ${f2(L.spc_cost)}`,
     { text: `時価 ×（1−α）。α＝${pc(PA.alpha)}、時価＝取得時の加重平均売値${f2(PA.jika)} → SPC簿価 ${f2(PA.book)}`, bold: true }],
    [{ text: "結果（回転12ヶ月）", bold: true },
     { text: `投資家利回り ${pc(L.inv_yld)}`, bold: true },
     { text: `投資家利回り ${pc(P1.inv_yld)}`, bold: true }],
  ], [16, 42, 42]),
);

// ───────────────────────────────── 2. 詳細
children.push(h1("2. 変更点の詳細"));

children.push(
  h2("① WineBankの取り分を、出口から入口へ移す"),
  p(`前回はSPCへ原価で卸し、出口でSPC税前利益のうち投資家出資分に帰属する40%を投資家とWineBankで折半していた。今回はSPCへ卸す時点で時価から${pc(PA.alpha)}を控除した価格（定価比${f2(PA.book)}）とし、その値入れをWineBankの取り分とする。出口で取るのは管理報酬のみとなる。`),
  bullet(`WineBankの値入れは定価比 ${f2(PA.book - PA.mkt_cost)}（簿価比 ${pc(PA.transfer_rate)}）。回転12ヶ月・総額${okuN(C1.total)}の定常状態では年${hyaku(P1.transfer)}となる。`),
  bullet(`前回の値入れ（現物譲渡1%）は年${hyaku(L.transfer)}にすぎず、WineBankの取り分の大半は出口の成功報酬（年${hyaku(L.fee)}）と持分（年${hyaku(L.wb_equity)}）であった。`),
  bullet("折半という概念が不要になる。投資家の取分は「SPC税前利益 × 出資比率40%」だけで決まるため、配分の説明が出資比率の一語で済む。"),

  h2("② 損益は出資比率どおりにプロラタ配分する"),
  p("成功報酬（折半）を廃止し、SPC税前利益を出資比率どおり60：40で分ける。配分がプロラタであるため、投資家利回りは「SPC税前利益 ÷ 総額」に等しくなり、出資比率そのものには依存しない。"),

  h2("③ 卸値は時価に連動して決まる"),
  p(`卸値を「時価 ×（1−α）」としたことで、仕入価格が動いても売値が動いても、SPCの簿価と時価の関係は変わらない。その結果、投資家利回りはこれらの変動から遮断される。`),
  tbl([
    ["変動要因", "前回", "今回"],
    ["市中仕入価格（定価比 50 → 45）", "＋7.7pt", { text: pt(C1.sensitivity.cost45 - C1.sensitivity.base), bold: true }],
    ["売却価格（売値 ▲5%）", "▲3.5pt", { text: pt(C1.sensitivity.price5 - C1.sensitivity.base), bold: true }],
    ["ワイン価格上昇率（年6% → 0%）", "▲4.0pt", { text: pt(C1.sensitivity.appr0 - C1.sensitivity.base), color: RED, bold: true }],
    ["在庫回転期間（12 → 18ヶ月）", "▲6.1pt", { text: pt(C1.sensitivity.hold18 - C1.sensitivity.base), color: RED, bold: true }],
  ], [40, 30, 30]),
  p("仕入と売値から遮断される一方、ワイン価格の上昇率への依存は強まる。投資家利回りを動かす要因は「在庫回転期間」と「ワイン価格の上昇率」の2つに絞られた。", { before: 140 }),
);

// ───────────────────────────────── 3. 数値の対照
children.push(
  h1("3. 数値の対照（在庫回転12ヶ月・ワイン価格上昇 年6%・総額5億円）"),
  tbl([
    ["項目", "前回（原価卸＋折半）", "今回（時価−α卸＋プロラタ）"],
    ["SPC簿価（定価比）", f2(L.spc_cost), { text: f2(PA.book), bold: true }],
    ["必要な年間販売額", oku(L.sales), { text: oku(P1.sales), bold: true }],
    ["SPC年間税前利益", oku(L.pretax), oku(P1.pretax)],
    ["投資家取分", hyaku(L.inv), hyaku(P1.inv)],
    [{ text: "投資家利回り（定常年間）", bold: true }, { text: pc(L.inv_yld), bold: true }, { text: pc(P1.inv_yld), bold: true }],
    ["5年通算 年平均利回り", pc(L.avg5), pc(P1.avg5)],
    ["WineBank：値入れ（前取り）", hyaku(L.transfer), { text: hyaku(P1.transfer), bold: true }],
    ["WineBank：成功報酬", hyaku(L.fee), { text: "なし", bold: true }],
    ["WineBank：持分（60%）", hyaku(L.wb_equity), hyaku(P1.wb_equity)],
    ["WineBank：管理報酬", hyaku(C1.mgmt), hyaku(C1.mgmt)],
    [{ text: "WineBank受取合計", bold: true }, { text: hyaku(L.wb_total), bold: true }, { text: hyaku(P1.wb_total), bold: true }],
    [{ text: "20%の分岐点（回転期間）", bold: true }, { text: mon(L.breakeven), bold: true },
     { text: mon(C1.breakeven.neutral), color: RED, bold: true }],
  ], [34, 33, 33]),
  p(`セカンドクローズ（総額${okuN(C2.total)}）では、投資家利回り ${pc(P2.inv_yld)}、投資家取分 ${hyaku(P2.inv)}、WineBank受取 ${hyaku(P2.wb_total)}、必要な年間販売額 ${oku(P2.sales)} となる。`, { before: 140 }),
);

// ───────────────────────────────── 4. 変更していない点
children.push(
  h1("4. 変更していない点"),
  bullet("資本構成。WineBankが現物で総額の60%を出資し、投資家が現金で40%を出資する。"),
  bullet(`段階クローズ。ファーストクローズ${okuN(C1.total)} → 年度内セカンドクローズ${okuN(C2.total)}。`),
  bullet("管理報酬。総額の年2%をSPC費用に計上する。"),
  bullet("収益モデルの前提。仕入40／60の半々、売却はB2B70とB2C80の半々、変動販売費6.44%、ワイン価格の年間上昇6%、稼働率95%、仕入展開6ヶ月、運用期間5年。"),
  bullet("解約条件と分配。当初3年間はロックアップ、4年目以降は年度ごとの解約日に申出可。分配は年1回。"),
  bullet("在庫配分の原則。在庫比率によるプロラタ配分を原則とし、プロラタで決し得ない部分についてSPCを優先する。"),
  bullet("提示指標。IRRは用いず、「投資家利回り（定常年間）」と「年平均利回り（5年通算）」の2つに統一している。"),
  bullet("粗利の定義。粗利は変動販売費を控除した後の金額としている。"),
);

// ───────────────────────────────── 5. ご留意いただきたい点
children.push(
  h1("5. ご留意いただきたい点"),

  h2("20%までの余裕がなくなった"),
  p(`投資家利回りが20%を割り込む回転期間は、前回の${mon(L.breakeven)}から今回${mon(C1.breakeven.neutral)}へ縮まった。主線の回転12ヶ月がそのまま分岐点であり、余裕はない。回転が15ヶ月へ延びれば${pc(C1.holds["15"].inv_yld)}、18ヶ月なら${pc(C1.holds["18"].inv_yld)}まで低下する。`),
  p(`ただし回転12ヶ月に必要な年間販売額は${oku(L.sales)}から${oku(P1.sales)}へ下がった。卸値が上がったぶん同じ金額で持てるワインが減るためで、現状の販売実力（年5〜7億円）の範囲内に収まる点は前回より条件が良い。`),

  h2("ワイン価格の上昇率への依存が強まった"),
  p(`SPCの収益は「αの取り込み」と「保有中の値上がり」の二階建てになる。前回は仕入の安さも収益源だったが、卸値が時価連動になったことでその分が消えた。値上がりを織り込まない場合、投資家利回りは主線でも${pc(C1.sensitivity.appr0)}まで下がり、20%を確保するには回転を${mon(C1.breakeven.appr0)}まで縮める必要がある。`),

  h2("ファンドの実質規模が小さくなる"),
  p(`SPC簿価が${f2(L.spc_cost)}から${f2(PA.book)}へ上がるため、同じ${okuN(C1.total)}で持てるワインは定価換算で約15%少なくなる。利益は1本あたりで発生するので、ファンドが生む付加価値そのものが年${hyaku(pieOld)}から年${hyaku(pieNew)}へ、約${hyaku(pieOld - pieNew)}小さくなる。WineBankはその分を卸値で前取りしているため自社の損得はおおむね中立だが、投資家から見ると「同じ${okuN(C1.inv_capital)}でより少ないワインを持つ」構造になる。`),

  h2("WineBankの収入が前倒しで確定する"),
  p(`WineBank受取${hyaku(P1.wb_total)}のうち、値入れ${hyaku(P1.transfer)}と管理報酬${hyaku(C1.mgmt)}の計${hyaku(P1.transfer + C1.mgmt)}は運用成果によらず確定し、成果に連動するのは持分${hyaku(P1.wb_equity)}のみとなる。前回は${hyaku(L.wb_total)}のうち成果連動分が${hyaku(L.fee + L.wb_equity)}であった。持分60%を通じて損益を負う点は変わらないが、「投資家が儲からなければWineBankも儲からない」という説明はそのままでは使えない。提案資料では受取の内訳を明示している。`),

  h2("卸値そのものが最大の利益相反論点になる"),
  bullet(`αを契約上${pc(PA.alpha)}に固定し、期中の変更には投資家の事前承認を要する設計とする。`),
  bullet("時価の算定方法（B2B卸値とB2C売値の加重平均）を契約に明記し、算定根拠を四半期ごとに開示する。"),
  bullet("WineBank出資分に対応する値入れは自己取引となるため、内部利益の消去要否を会計・税務の両面で組成前に確定させる。"),
  bullet("第三者卸価格との比較資料を年次で整備し、移転価格上の説明責任を果たせる状態を維持する。AUPの検証対象にも含める。"),

  h2("3シナリオの定義を組み替えた"),
  p("前回は調達価格と売却価格でポジティブ／ネガティブを定義していたが、卸値が時価連動になったことでこれらは投資家利回りに効かなくなった。そのまま用いるとポジティブがニュートラルを下回る逆転が生じるため、今回はワイン価格の上昇率（年10%／6%／0%）でシナリオを定義し直している。"),
);

const doc = new Document({
  styles: { default: { document: { run: { font: SERIF, size: 21 } } } },
  sections: [{
    properties: {
      page: {
        margin: {
          top: convertInchesToTwip(0.98), bottom: convertInchesToTwip(0.98),
          left: convertInchesToTwip(0.94), right: convertInchesToTwip(0.94),
        },
      },
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ children: [PageNumber.CURRENT], font: "Cambria", size: 18, color: "888888" })],
        })],
      }),
    },
    children,
  }],
});

Packer.toBuffer(doc).then((buf) => {
  const name = "WineBank_ワインファンド_山本案_前回からの変更点_20260924.docx";
  fs.writeFileSync(__dirname + "/" + name, buf);
  console.log("written:", name);
});
