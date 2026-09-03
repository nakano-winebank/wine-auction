const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        WidthType, AlignmentType, HeadingLevel, ShadingType, BorderStyle } = require('docx');
const fs = require('fs');

const FONT = "Meiryo";
const W = { a: 1250, b: 2900, c: 2950, d: 3006 };   // DXA（合計10,106＝本文幅）
const TOTAL = W.a + W.b + W.c + W.d;

function t(text, opts = {}) {
  return new TextRun({ text, font: FONT, size: opts.size || 17, bold: !!opts.bold,
                       color: opts.color || "000000" });
}
function p(text, opts = {}) {
  return new Paragraph({ children: [t(text, opts)], spacing: { after: opts.after ?? 40 },
                         alignment: opts.align });
}
function cell(text, opts = {}) {
  const lines = Array.isArray(text) ? text : [text];
  return new TableCell({
    width: { size: opts.w, type: WidthType.DXA },
    shading: opts.fill ? { type: ShadingType.CLEAR, fill: opts.fill } : undefined,
    margins: { top: 60, bottom: 60, left: 80, right: 80 },
    children: lines.map(l => new Paragraph({
      children: [t(l, { bold: opts.bold, size: opts.size || 16, color: opts.color })],
      spacing: { after: 0 } })),
  });
}
function headRow(labels) {
  const ws = [W.a, W.b, W.c, W.d];
  return new TableRow({
    tableHeader: true,
    children: labels.map((l, i) => cell(l, { w: ws[i], bold: true, fill: "1F3864", color: "FFFFFF" })),
  });
}
function row(cells) {
  const ws = [W.a, W.b, W.c, W.d];
  return new TableRow({ children: cells.map((c, i) => cell(c, { w: ws[i] })) });
}
function sectionRow(label) {
  return new TableRow({
    children: [new TableCell({
      columnSpan: 4, width: { size: TOTAL, type: WidthType.DXA },
      shading: { type: ShadingType.CLEAR, fill: "D9E2F3" },
      margins: { top: 60, bottom: 60, left: 80, right: 80 },
      children: [new Paragraph({ children: [t(label, { bold: true, size: 17 })] })],
    })],
  });
}
function table(rows) {
  return new Table({ columnWidths: [W.a, W.b, W.c, W.d], width: { size: TOTAL, type: WidthType.DXA },
                     rows });
}

// ── 反映済みの修正（変更履歴つき） ──────────────────────────
const APPLIED = [
  ["【区分】", "現行", "修正案", "理由"],
];
const A = [
  ["第1条2項1号", "本件出資総額が著しく増額した場合、対象会社の六本木ミッドタウン開業スケジュールが著しく遅延が生じた場合",
   "本件ラウンドにおける本件出資総額が金【　　】円を超えて増額した場合、又は対象会社の六本木ミッドタウンにおける開業が【　　】か月を超えて遅延した場合",
   "「著しく」の基準が不明確。事業収支資料p11は調達2.0-3.0億円を掲げており、1.5億円からの増額が白紙解約事由に触れうる。閾値は要協議（空欄）"],
  ["第2条1項5号", "対象会社又はWBP3の買収",
   "対象会社又は合同会社WineBank P3（以下「WBP3」という。）の買収",
   "WBP3の定義規定が本文になく、ここが初出。資本政策上の正式名称で定義"],
  ["第2条2項1号", "甲は、2026年4月以降、5年～10年以内に",
   "甲は、本件実行日以降、5年～10年以内に",
   "2026年4月は本合意締結時点（2026年9月）で既に過去。出口時期の起算点が不明確になる"],
  ["第2条3項3号", "対象会社の株式について、WBP3の持株比率を66％未満に希釈化させること",
   "対象会社の株式について、中野邦人及びWBP3の合計持株比率（発行済株式総数を基準とし、新株予約権その他の潜在株式は算入しない。）を66％未満に希釈化させること",
   "WBP3単独は700株＝23.3％で、文字どおり読むと締結時点で既に違反。66.7％となるのは中野邦人（1,300株）との合計。また潜在株式を含めるとSO発行で60.6％となり抵触するため基準を明記"],
  ["第2条3項4号", "対象会社の株式について、種類株式を発行すること",
   "対象会社の株式について、乙の事前の書面による同意なく種類株式を発行すること",
   "全面禁止だと将来のVCラウンドで優先株が使えず、追加調達の手段を失う"],
  ["第2条3項5号", "WBP3と本件34％投資家との間で、",
   "WBP3と本件ラウンドにおける外部投資家（本合意締結日現在の合計持株比率33.3％。以下「本件外部投資家」という。）との間で、",
   "「本件34％投資家」は定義規定がなく、単独34％の投資家も存在しない（外部合計33.3％、最大は投資家Cの13.3％）"],
  ["第2条3項6号", "対象会社の配当可能利益の34％を超える利益を本件34％投資家に配当",
   "対象会社の配当可能利益のうち本件外部投資家の合計持株比率（33.3％）を超える割合の利益を本件外部投資家に配当",
   "同上。34％→実際の33.3％に修正"],
  ["第3条1項1号\n（旧第4条）", "第２条第１項第７号の違反",
   "第２条第１項第６号の違反",
   "第2条1項は第6号まで。第7号は存在しない"],
  ["第4条3項\n（旧第5条）", "３　前二条の場合において",
   "３　前二項の場合において",
   "文脈上、同条第1項・第2項を指す"],
  ["第6条5項\n（旧第7条）", "本件取得株式／第５条の規定を準用する",
   "本件株式／第４条の規定を準用する",
   "用語の統一と、条番号繰上げに伴う参照修正"],
  ["第3条〜第9条\n（旧第4条〜第10条）", "第4条（解除）…第10条（準拠法及び裁判管轄）",
   "第3条（解除）…第9条（準拠法及び裁判管轄）",
   "第3条が欠落していたため各条を繰上げ。既に相手方へ旧番号で提示済みの場合は、繰上げの代わりに「第3条（削除）」を挿入する方法もある"],
  ["全体", "本件出資持分／出資者の出資比率／出資持分譲渡契約／退社",
   "本件株式／株主の持株比率／株式譲渡契約／株主でなくなる",
   "対象会社は株式会社。原文は合同会社（持分会社）の用語のままで、テンプレート流用と思われる"],
];

// ── 未反映（要判断） ────────────────────────────────
const OPEN = [
  ["【論点】", "現状", "考えられる対応", "背景"],
];
const B = [
  ["出資額の端数", "第1条1項は「金20,000,000円」。@150,000円では133.33株となり割り切れない",
   "133株＝19,950,000円 または 134株＝20,100,000円 に金額を合わせる（資本政策は133株で総額ちょうど1.5億円）",
   "旧資本政策は134株＝20,100,000円で計上されており、合意書と10万円ずれていた"],
  ["甲の当事者性", "甲は株式会社WineBank。しかし対象会社の株主は中野邦人（個人）とWBP3の2者で、株式会社WineBankは株主ではない",
   "中野邦人個人を甲側の当事者に加える（連帯して確約）",
   "株主でない甲が「WBP3の持株比率を維持する」と確約しても履行可能性に疑義。ただし個人保証的な性格を帯びるため経営判断事項"],
  ["66％条項と追加調達", "甲側2,000株は固定。66％維持の上限は3,030株で、割当後は既に3,000株",
   "①甲側の同時出資、②66％を引下げ、③「本合意締結時点の比率」に限定、のいずれか",
   "追加発行余地は30株＝約455万円のみ。事業収支資料p11の「調達2.0-3.0億円」は現行条項下では達成不能"],
  ["株主優待の範囲", "第2条1項1号はオーナーズルーム・ケータリング利用権と50％割引（月1回・上限4名）のみ",
   "事業収支資料p11の「FC1店舗出店権利」「フランス視察」を付与するか否かを明記",
   "資料と合意書で特典が一致していない。出資額に応じた差であれば資料側にその旨の注記が必要"],
  ["乙が法人の場合", "第8条1項3号の譲渡による終了は、除外事由が相続・二親等以内の親族のみ",
   "乙が法人の場合の組織再編（合併・会社分割等）を除外事由に追加",
   "AnyColorオーナーが個人名義か法人名義かにより要否が変わる"],
  ["書面の名称", "表題は「合意書」",
   "「確約書」等に改めるか、現行のままとするか",
   "社内では確約書と呼称されている。内容は双方向の合意であり「合意書」でも整合する"],
  ["払込と割当の期日", "第1条1項の本件実行日は2026年10月末日",
   "資本政策の割当日を10月末に統一（修正版資本政策は10月末で作成済み）",
   "旧資本政策は2026年12月末。2か月ずれると払込金の性格（申込証拠金／預り金）が問題になる"],
  ["対象会社の事業範囲", "対象会社は六本木1号店の運営会社",
   "2号店以降を対象会社が担うのか別会社とするのかを明記",
   "投資家が見る5か年計画は9店舗連結（FY2031営業利益352百万円）。Post4.5億円の評価と出資対象の範囲が一致しているか要確認"],
];

const doc = new Document({
  styles: { default: { document: { run: { font: FONT, size: 18 } } } },
  sections: [{
    properties: { page: { size: { width: 11906, height: 16838, orientation: "portrait" },
                          margin: { top: 900, bottom: 900, left: 900, right: 900 } } },
    children: [
      new Paragraph({ children: [t("合意書　修正対照表", { bold: true, size: 26 })],
                      spacing: { after: 120 } }),
      p("対象：株式会社Brasserie Thierry Marx 第三者割当増資に関する合意書（2026年9月）", { size: 16, color: "595959" }),
      p("突合資料：株式会社Brasserie Thierry Marx資本政策202609（投資家様）／THIERRY MARX × WineBank（投資家様）20260904／5か年事業計画FY2027-2031", { size: 16, color: "595959" }),
      p("", { after: 160 }),
      new Paragraph({ children: [t("１．修正版docxに反映済み（変更履歴つき）", { bold: true, size: 20 })],
                      spacing: { after: 100 } }),
      table([headRow(APPLIED[0]), ...A.map(r => row(r))]),
      new Paragraph({ children: [t("", {})], spacing: { after: 240 } }),
      new Paragraph({ children: [t("２．未反映（ご判断が必要な事項）", { bold: true, size: 20 })],
                      spacing: { after: 100 } }),
      table([headRow(OPEN[0]), ...B.map(r => row(r))]),
      new Paragraph({ children: [t("", {})], spacing: { after: 200 } }),
      p("※ 本対照表は提出済みの各資料との整合性の観点から作成したものであり、法的な有効性・妥当性についての判断を含みません。締結前に弁護士の確認を受けてください。",
        { size: 16, color: "C00000" }),
    ],
  }],
});

Packer.toBuffer(doc).then(b => {
  fs.writeFileSync("/home/user/wine-auction/事業計画/合意書_修正対照表.docx", b);
  console.log("saved 対照表");
});
