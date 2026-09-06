// 山本案：前回資料（デット型）から今回資料（現物出資型）への変更点まとめ（DOCX）
// 数値は structure.py が書き出す figures.json を読む。手打ちしない。
const {
  Document, Packer, Paragraph, TextRun, AlignmentType, BorderStyle,
  Table, TableRow, TableCell, WidthType, Footer, PageNumber,
  convertInchesToTwip, VerticalAlign,
} = require("docx");
const fs = require("fs");

const F = JSON.parse(fs.readFileSync(__dirname + "/figures.json", "utf8"));
const L = F.legacy;
const C1 = F.first, C2 = F.second;
const P1 = C1.holds["12"], P2 = C2.holds["12"];

const oku   = (v) => (v / 1e8).toFixed(2) + "億円";
const okuN  = (v) => (v / 1e8).toFixed(0) + "億円";
const hyaku = (v) => Math.round(v / 1e6) + "百万円";
const man   = (v) => Math.round(v / 1e4).toLocaleString() + "万円";
const pc    = (v) => (v * 100).toFixed(1) + "%";
const mon   = (v) => v.toFixed(1) + "ヶ月";

const SERIF = "Yu Mincho";
const SANS  = "Yu Gothic";
const GOLD  = "6E5730";
const RED   = "9C3D28";

function p(text, o = {}) {
  return new Paragraph({
    alignment: o.align || AlignmentType.LEFT,
    spacing: { before: o.before ?? 0, after: o.after ?? 120, line: o.line ?? 300 },
    indent: o.indent,
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

// ── 表
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
  p("デット型（デット2億円＋エクイティ3億円）から 現物出資型（WineBank現物出資60%＋投資家出資40%）へ",
    { align: AlignmentType.CENTER, size: 20, color: "555555", after: 700 }),
  p("2026年9月", { align: AlignmentType.CENTER, size: 20, color: "555555", after: 60 }),
  p("株式会社WineBank", { align: AlignmentType.CENTER, size: 21, bold: true, after: 700 }),
);

// ───────────────────────────────── 本書の位置づけ
children.push(
  h1("本書の位置づけ"),
  p("本書は、山本様よりご提案いただいた資本構成の変更を反映するにあたり、前回資料（2026年8月・デット型）から今回資料（現物出資型）へ何をどう変更したかを整理したものである。提案資料本体とあわせてご確認いただきたい。"),
  p("金額・利回りはすべて共通の収益モデル（model.py）から算出しており、前回資料の数値も同一のモデルで再計算して対照している。前提を変えていない項目については、前回資料と完全に同じ数値になることを確認済みである。"),
);

// ───────────────────────────────── 1. 変更の要旨
children.push(
  h1("1. 変更の要旨"),
  p("変更は5点である。うち①が本質的な変更であり、②〜⑤はこれに付随する。"),
  tbl([
    ["変更点", "前回（デット型）", "今回（現物出資型）"],
    [{ text: "① 資本構成", bold: true },
     "デット2億円（金利4%・WineBank保証）＋投資家エクイティ3億円。WineBankの現金拠出はなし",
     { text: "WineBankがワイン現物で総額の60%を出資し、投資家が現金で40%を出資する。デットは廃止", bold: true }],
    [{ text: "② 募集総額", bold: true },
     "総額5億円の単一クローズ",
     `ファーストクローズ${okuN(C1.total)} → 年度内セカンドクローズ${okuN(C2.total)}の段階クローズ`],
    [{ text: "③ 報酬体系", bold: true },
     "投資家帰属利益を折半する成功報酬のみ。残高比例フィーは課さない。SPC人件費360万円をSPC費用に計上",
     "成功報酬（折半）は従来どおり。加えて管理報酬として総額の年2%を計上し、SPC人件費360万円はこれに置き換える"],
    [{ text: "④ 分配頻度", bold: true }, "半期ごと", "年1回（当初3年はロックアップ、4年目以降は年1回の解約可）"],
    [{ text: "⑤ 想定利回り", bold: true },
     `投資家利回り ${pc(L.inv_yld)}（出資3億円に対して）`,
     { text: `投資家利回り ${pc(P1.inv_yld)}（1stクローズ・出資${okuN(C1.inv_capital)}に対して）`, bold: true }],
  ], [16, 42, 42]),
);

// ───────────────────────────────── 2. 変更点の詳細
children.push(h1("2. 変更点の詳細"));

children.push(
  h2("① 資本構成：デットを廃止し、WineBankが現物で60%を出資する"),
  p("前回はWineBankが現金を拠出せず、デット2億円について金利4%と保証責任のみを負う構成であった。今回はWineBankが自己勘定のワイン現物を拠出して総額の60%を出資し、投資家と同じ持分として損益をそのまま負う。"),
  bullet("WineBankには優先弁済も保証もない。SPCの損益が悪化すれば、WineBankの持分もそのまま毀損する。"),
  bullet("前回論点となっていた「保証の実効性（WineBankの保証余力）」および「投資家が5億円を拠出した場合の合成利回り」は、デットの廃止により論点そのものが消滅した。"),
  bullet("WineBankが自ら60%を保有するため、SPCへの拠出価格を吊り上げても自己の持分利益が同額減る。値付けで抜く経済的動機が構造的に生じない点は、本変更の最大の利点である。"),
  p("なお、現物出資するワインの評価方法（取得原価にどれだけ付加するか）は組成時の別途協議事項とし、本資料の試算ではSPC取得原価を前回と同じ定価比50.50（市中原価50.00＋現物譲渡1%）に置いている。評価方法が確定した時点で、全数値がそれに追随する。", { before: 100 }),
);

children.push(
  h2("② 募集総額：段階クローズとする"),
  p("同じ資本構成の比率を保ったまま、規模のみを2段階で拡大する。比率が同一であるため利回りはほぼ変わらない（規模拡大で固定費が薄まるぶん、わずかに改善する）。"),
  tbl([
    ["項目", "ファーストクローズ", "セカンドクローズ（年度内）"],
    ["総額", { text: okuN(C1.total), bold: true }, { text: okuN(C2.total), bold: true }],
    ["WineBank現物出資（60%）", okuN(C1.wb_capital), okuN(C2.wb_capital)],
    ["投資家出資（40%）", okuN(C1.inv_capital), okuN(C2.inv_capital)],
    ["必要な年間販売額（回転12ヶ月）", oku(P1.sales), { text: oku(P2.sales), color: RED, bold: true }],
    ["投資家利回り（定常年間）", { text: pc(P1.inv_yld), bold: true }, { text: pc(P2.inv_yld), bold: true }],
  ], [34, 33, 33]),
  p("ただし必要な年間販売額は倍増する。現状の販売実力（年5〜7億円）に対しセカンドクローズは2倍を超える水準となるため、セカンドクローズはファーストクローズの回転実績を確認したうえで判断する設計としている。", { before: 140 }),
);

children.push(
  h2("③ 報酬体系：管理報酬 年2% を新設する"),
  p("折半（投資家帰属利益の50%をWineBankが受け取る成功報酬）の定義は一切変更していない。今回新設したのは、これとは別の管理報酬である。"),
  bullet(`管理報酬は総額の年2%（ファーストクローズで年${man(C1.mgmt)}、セカンドクローズで年${man(C2.mgmt)}）をSPC費用として計上する。`),
  bullet("従来SPC費用に計上していたSPC人件費360万円は、これに置き換えて廃止する。"),
  bullet(`管理報酬はWineBankが全額を受領するが、そのうち60%はWineBank自身の出資分に対応する自己負担分の還流である。さらに投資家帰属分は折半されるため、管理報酬を課さない場合と比べたWineBankの純増は年${hyaku(C1.mgmt_net)}（1stクローズ）にとどまる。`),
  bullet(`一方で投資家利回りは ${pc(P1.inv_yld + F.params.mgmt_rate * F.params.success)} から ${pc(P1.inv_yld)} へ 1.0ポイント低下する。`),
);

children.push(
  h2("④ 分配頻度：半期ごと から 年1回 へ"),
  p("当初3年間はロックアップ、4年目以降は年度ごとの解約日に解約可という設計は前回から変更していない。分配のみ半期から年1回へ変更した。5年通算の累計分配額に対する影響はない。"),
);

children.push(
  h2("⑤ 想定利回り：20%目標に対する水準"),
  p(`前回の${pc(L.inv_yld)}から今回${pc(P1.inv_yld)}へ、0.6ポイント低下した。内訳は次のとおりである。`),
  tbl([
    ["段階", "投資家利回り", "内容"],
    ["前回（デット型）", pc(L.inv_yld), "SPC税前利益 × 出資比率60% × 折半50% ÷ 出資3億円"],
    ["デットを廃し現物出資60%へ", pc(P1.inv_yld + F.params.mgmt_rate * F.params.success),
     "SPC人件費360万円を廃止したぶん、いったん上昇する"],
    [{ text: "管理報酬 年2% を新設", bold: true }, { text: pc(P1.inv_yld), bold: true },
     "管理報酬をSPC費用に計上したぶん低下する（▲1.0pt）"],
  ], [30, 18, 52]),
);

// ───────────────────────────────── 3. 数値の対照
children.push(
  h1("3. 数値の対照（在庫回転12ヶ月・ニュートラル・ワイン価格上昇 年6%）"),
  tbl([
    ["項目", "前回（デット型・5億円）", "今回1stクローズ（5億円）", "今回2ndクローズ（10億円）"],
    ["投資家の拠出", "エクイティ3億円＋貸付2億円", okuN(C1.inv_capital), okuN(C2.inv_capital)],
    ["WineBankの拠出", "なし（保証のみ）", `ワイン現物 ${okuN(C1.wb_capital)}`, `ワイン現物 ${okuN(C2.wb_capital)}`],
    ["必要な年間販売額", oku(L.sales), oku(P1.sales), oku(P2.sales)],
    ["SPC年間税前利益", oku(L.pretax), oku(P1.pretax), oku(P2.pretax)],
    ["投資家帰属分", `${hyaku(L.attr)}（5分の3）`, `${hyaku(P1.attr)}（40%）`, `${hyaku(P2.attr)}（40%）`],
    ["投資家取分（折半後）", hyaku(L.inv), hyaku(P1.inv), hyaku(P2.inv)],
    [{ text: "投資家利回り（定常年間）", bold: true }, { text: pc(L.inv_yld), bold: true },
     { text: pc(P1.inv_yld), bold: true }, { text: pc(P2.inv_yld), bold: true }],
    ["5年通算 年平均利回り", pc(L.avg5), pc(P1.avg5), pc(P2.avg5)],
    ["WineBank受取", `${hyaku(L.wb)}（成功報酬＋デット分−金利）`,
     `${hyaku(P1.wb_total)}（持分＋成功報酬＋管理報酬）`, `${hyaku(P2.wb_total)}（同左）`],
    [{ text: "20%の分岐点（回転期間）", bold: true }, { text: mon(L.breakeven), bold: true },
     { text: mon(C1.breakeven.neutral), color: RED, bold: true },
     { text: mon(C2.breakeven.neutral), color: RED, bold: true }],
    [{ text: "主線12ヶ月からの余裕", bold: true }, { text: (L.breakeven - 12).toFixed(1) + "ヶ月", bold: true },
     { text: (C1.breakeven.neutral - 12).toFixed(1) + "ヶ月", color: RED, bold: true },
     { text: (C2.breakeven.neutral - 12).toFixed(1) + "ヶ月", color: RED, bold: true }],
  ], [26, 26, 24, 24]),
);

// ───────────────────────────────── 4. 変更していない点
children.push(
  h1("4. 変更していない点"),
  p("次の各項目は前回資料から一切変更していない。数値も同一のモデルから再計算し、前回と完全に一致することを確認している。"),
  bullet("折半の定義。折半とは「投資家が得た利益をWineBankと折半する成功報酬」であり、SPC全体の利益を50対50で割るという意味ではない。"),
  bullet("収益モデルの前提。仕入40／60の半々、売却はB2B70とB2C80の半々、変動販売費6.44%、ワイン価格の年間上昇6%、稼働率95%、仕入展開6ヶ月、運用期間5年。"),
  bullet("単位経済。SPC取得原価50.50・売却時の売値79.50・手取り74.38・単位粗利23.88・粗利率30.0%・投下原価利益率47.3%（保有12ヶ月・定価100あたり）。"),
  bullet("粗利の定義。粗利は変動販売費を控除した後の金額としている。"),
  bullet("在庫配分の原則。在庫比率によるプロラタ配分を原則とし、プロラタで決し得ない部分についてSPCを優先する。"),
  bullet("提示指標。IRRは用いず、「投資家利回り（定常年間）」と「年平均利回り（5年通算）」の2つに統一している。"),
  bullet("解約条件。運用期間5年、当初3年間はロックアップ、4年目以降は年度ごとの解約日に申出可。"),
);

// ───────────────────────────────── 5. ご留意いただきたい点
children.push(
  h1("5. ご留意いただきたい点"),
  h2("20%までの余裕がさらに小さくなっている"),
  p(`投資家利回りが20%を割り込む回転期間は、前回の${mon(L.breakeven)}から今回${mon(C1.breakeven.neutral)}へ縮まった。主線12ヶ月からの余裕は${(L.breakeven - 12).toFixed(1)}ヶ月から${(C1.breakeven.neutral - 12).toFixed(1)}ヶ月へと小さくなっている。管理報酬 年2% を新設したことによる。`),
  p("回転12ヶ月の達成は「上振れ条件」ではなく、20%を確保するための必要条件である。回転が15ヶ月へ延びれば投資家利回りは" + pc(C1.holds["15"].inv_yld) + "、18ヶ月なら" + pc(C1.holds["18"].inv_yld) + "まで低下する。これが本ファンド最大の管理項目であることは前回から変わらない。"),

  h2("セカンドクローズは販売実力の拡大とセットになる"),
  p(`総額を${okuN(C1.total)}から${okuN(C2.total)}へ倍増させると、回転12ヶ月を維持するために必要な年間販売額も${oku(P1.sales)}から${oku(P2.sales)}へ倍増する。これは現状の販売実力（年5〜7億円）の2倍を超える水準である。規模の拡大は販売チャネルの拡大とセットで判断する必要がある。`),

  h2("今回確定していない事項"),
  bullet("現物出資するワインの評価方法（取得原価への付加率）。本資料の試算ではSPC取得原価を前回と同じ定価比50.50に置いている。付加率を引き上げるとSPCの取得原価が上がり、投資家利回りは低下する。"),
  bullet("酒類の現物出資に係る免許上・消費税上・法人税上の取扱い。現物出資は税務上「時価による譲渡」として扱われるため、拠出時にWineBank側で課税が生じうる点を含め、組成前に専門家と確定させる必要がある。"),
  bullet("適格機関投資家1名以上の確保。適格機関投資家等特例業務による私募の前提条件であり、組成条件として確保する必要がある。"),
  bullet("WineBankが現物出資する銘柄の選定基準。現物出資型では「何を拠出するか」が回転期間を大きく左右するため、拠出銘柄の選定ルールを契約上明文化することとしている。"),

  h2("5年通算の年平均利回りについて"),
  p(`回転15ヶ月（${pc(C1.holds["15"].avg5)}）より回転18ヶ月（${pc(C1.holds["18"].avg5)}）のほうが高くなっている。これは運用期間5年のあいだに何回転が収まるかによる段差であり、両者とも実現回転は3.0回である一方、18ヶ月のほうが1回転あたりの値上がりが大きいために生じる。また本モデルは満期時の残存在庫を簿価で戻す保守的な計算としているため、回転15ヶ月では完了間近の回転に含まれる利益が計上されない。実務上の取扱いは満期時の売却清算条件とあわせて整理する。`),
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
  const name = "WineBank_ワインファンド_山本案_前回からの変更点_20260906.docx";
  fs.writeFileSync(__dirname + "/" + name, buf);
  console.log("written:", name);
});
