const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  BorderStyle, PageBreak, Footer, PageNumber, convertInchesToTwip,
} = require("docx");
const fs = require("fs");

const SERIF = "Yu Mincho";
const SANS = "Yu Gothic";

function p(text, o = {}) {
  return new Paragraph({
    alignment: o.align || AlignmentType.LEFT,
    spacing: { before: o.before ?? 0, after: o.after ?? 120, line: o.line ?? 300 },
    indent: o.indent,
    border: o.border,
    children: [new TextRun({
      text, font: o.font || SERIF, size: o.size || 21,
      bold: o.bold || false, color: o.color || "000000",
    })],
  });
}

// 別紙見出し
function annexTitle(n, title) {
  return [
    new Paragraph({
      spacing: { before: 0, after: 60 },
      children: [new TextRun({ text: n, font: SANS, size: 20, bold: true, color: "6E5730" })],
    }),
    new Paragraph({
      spacing: { before: 0, after: 240 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "A78450", space: 6 } },
      children: [new TextRun({ text: title, font: SERIF, size: 30, bold: true })],
    }),
  ];
}

// 条見出し
function article(no, name) {
  return new Paragraph({
    spacing: { before: 260, after: 100, line: 300 },
    children: [new TextRun({ text: `第${no}条（${name}）`, font: SANS, size: 21, bold: true })],
  });
}

// 項（番号付き）
function item(n, text) {
  return new Paragraph({
    spacing: { before: 0, after: 100, line: 300 },
    indent: { left: convertInchesToTwip(0.28), hanging: convertInchesToTwip(0.28) },
    children: [new TextRun({ text: `${n}　${text}`, font: SERIF, size: 21 })],
  });
}

// 号（(1)(2)…）
function sub(n, text) {
  return new Paragraph({
    spacing: { before: 0, after: 80, line: 300 },
    indent: { left: convertInchesToTwip(0.62), hanging: convertInchesToTwip(0.34) },
    children: [new TextRun({ text: `(${n})　${text}`, font: SERIF, size: 21 })],
  });
}

// 条文本文（項番号なし）
function body(text) {
  return new Paragraph({
    spacing: { before: 0, after: 100, line: 300 },
    indent: { left: convertInchesToTwip(0.28) },
    children: [new TextRun({ text, font: SERIF, size: 21 })],
  });
}

const children = [];

// ───────────────────────────────── 表紙
children.push(
  new Paragraph({
    spacing: { before: 1200, after: 80 },
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "WINEBANK WINE FUND", font: "Cambria", size: 20, bold: true, color: "6E5730", characterSpacing: 60 })],
  }),
  new Paragraph({
    spacing: { before: 0, after: 120 },
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "匿名組合契約　別紙", font: SERIF, size: 44, bold: true })],
  }),
  new Paragraph({
    spacing: { before: 0, after: 720 },
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "在庫配分方針／情報開示および報告事項／利益相反取引の管理", font: SERIF, size: 24 })],
  }),
  new Paragraph({
    spacing: { before: 0, after: 60 },
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "ドラフト（法務レビュー前）", font: SANS, size: 22, bold: true, color: "8B2E1F" })],
  }),
  new Paragraph({
    spacing: { before: 0, after: 900 },
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "2026年8月　株式会社WineBank", font: SERIF, size: 21 })],
  }),
);

// 前書き
children.push(
  new Paragraph({
    spacing: { before: 0, after: 140 },
    border: { top: { style: BorderStyle.SINGLE, size: 4, color: "BFBFBF", space: 10 } },
    children: [new TextRun({ text: "本書の位置づけ", font: SANS, size: 21, bold: true })],
  }),
  p("本書は、株式会社WineBank（以下「営業者」という。）を営業者とする匿名組合契約に添付する別紙のドラフトである。2026年8月の打合せにおいて公認会計士より指摘された、運営者の情報開示義務および報告義務の具体化、ならびに利益相反管理ルールの整備に対応するものである。"),
  p("あわせて、営業者が自己の計算において保有するワイン在庫と本匿名組合の在庫との間の配分の公平性についても、取扱いを明文化している。"),
  p("本書は事業側での検討のためのたたき台であり、法的助言を構成するものではない。条項の効力、匿名組合契約との整合、金融商品取引法その他の関係法令上の取扱いについては、顧問弁護士および公認会計士の確認を経たうえで確定するものとする。金額その他の未確定事項は「●」で表示している。"),
);

// ───────────────────────────────── 別紙1
children.push(new Paragraph({ children: [new PageBreak()] }));
children.push(...annexTitle("別紙 1", "在庫配分方針"));

children.push(article(1, "目的"));
children.push(body("本別紙は、営業者が本匿名組合の営業のために取得し、保管し、および販売するワイン（以下「本件在庫」という。）と、営業者が自己の計算において保有するワイン（以下「自己勘定在庫」という。）との間に生じうる利益相反を防止し、本件在庫の売却が匿名組合員の利益に適合する形で行われることを担保するための取扱いを定めるものである。"));

children.push(article(2, "定義"));
children.push(item(1, "「対象銘柄」とは、生産者名、銘柄名、ヴィンテージおよび容量の組合せにより特定される単位をいう。"));
children.push(item(2, "「実現単価」とは、対象銘柄ごとの、当該四半期における売却総額を当該四半期における売却本数で除して得られる金額をいう。"));
children.push(item(3, "「四半期」とは、本匿名組合の事業年度を3か月ごとに区分した各期間をいう。"));

children.push(article(3, "本件在庫の優先売却"));
children.push(item(1, "営業者は、同一の対象銘柄について本件在庫および自己勘定在庫の双方を保有する場合、当該対象銘柄に係る本件在庫の全量を売却し終えるまで、当該対象銘柄に係る自己勘定在庫を売却してはならない。"));
children.push(item(2, "前項の規定にかかわらず、購入者が自己勘定在庫を特定して指名した場合その他やむを得ない事由がある場合は、この限りでない。この場合、営業者は、当該売却の日時、数量、単価および事由を記録し、第8条に定める配分台帳に記載するものとする。"));
children.push(item(3, "本条に定める優先売却は、匿名組合員の利益を保護するための措置であるとともに、本匿名組合の在庫回転期間に係る運用目標（12か月）を達成するための手段でもあることを、両当事者は確認する。"));

children.push(article(4, "銘柄の排他"));
children.push(body("営業者は、本件在庫に組み入れる対象銘柄と自己勘定在庫に係る対象銘柄とが可能な限り重複しないよう努めるものとする。営業者は、組成時において両者の重複状況を調査し、その結果を匿名組合員に報告する。"));

children.push(article(5, "取得時の按分"));
children.push(body("営業者が同一の対象銘柄を複数ロット取得する場合、本件在庫および自己勘定在庫への割当ては、取得時点における両者の在庫金額の比率に応じて按分するものとする。"));

children.push(article(6, "実現単価の同一性"));
children.push(body("営業者は、同一の対象銘柄について同一の四半期に本件在庫および自己勘定在庫の双方を売却した場合において、本件在庫に係る実現単価が自己勘定在庫に係る実現単価を下回らないようにしなければならない。"));

children.push(article(7, "差額の補填"));
children.push(item(1, "前条の規定に反し、本件在庫に係る実現単価が自己勘定在庫に係る実現単価を下回った場合、営業者は、その差額に当該四半期における本件在庫の売却本数を乗じて得られる金額を、本匿名組合に対して支払うものとする。"));
children.push(item(2, "前項の支払は、当該四半期に係る別紙2第1条の報告書の提出後30日以内に行うものとする。"));

children.push(article(8, "配分台帳"));
children.push(item(1, "営業者は、対象銘柄ごとに、本件在庫および自己勘定在庫のそれぞれについて、期首数量、取得数量、取得単価、売却数量、売却単価および期末数量を記録した台帳（以下「配分台帳」という。）を作成し、維持するものとする。"));
children.push(item(2, "営業者は、四半期ごとに配分台帳を匿名組合員に開示するものとする。"));

children.push(article(9, "出庫指示の自動割当"));
children.push(item(1, "営業者は、本件在庫および自己勘定在庫のいずれから出庫するかの決定を、あらかじめ定めた規則に基づき情報システムにより自動的に行うものとし、担当者の裁量によらない運用とする。"));
children.push(item(2, "担当者が前項の決定を変更する場合、営業者は、その理由を記録し、配分台帳に記載するものとする。"));

children.push(article(10, "分別保管"));
children.push(item(1, "営業者は、本件在庫を自己勘定在庫と区分されたロケーションにおいて保管し、本件在庫であることを識別できる表示を付すものとする。"));
children.push(item(2, "営業者は、四半期ごとに第三者による実地棚卸を実施し、その結果を匿名組合員に報告するものとする。"));

children.push(article(11, "遵守状況の検証"));
children.push(body("本別紙に定める取扱いの遵守状況は、公認会計士による合意された手続の対象に含めるものとし、営業者は、年1回、その報告書を匿名組合員に提出するものとする。"));

children.push(article(12, "違反時の是正"));
children.push(body("営業者は、本別紙に定める取扱いに違反した場合、遅滞なく匿名組合員に報告するとともに、是正措置の内容およびその実施時期を書面により提示するものとする。"));

// ───────────────────────────────── 別紙2
children.push(new Paragraph({ children: [new PageBreak()] }));
children.push(...annexTitle("別紙 2", "情報開示および報告事項"));

children.push(article(1, "四半期報告"));
children.push(body("営業者は、各四半期の末日から45日以内に、次に掲げる事項を記載した報告書を匿名組合員に提出するものとする。"));
[
  "損益計算書、貸借対照表および資金収支計算書",
  "対象銘柄ごとの仕入数量、仕入単価、販売数量、販売単価および在庫数量",
  "在庫明細および帳簿価額",
  "本匿名組合に係る銀行口座の残高および主要な支払内容",
  "営業者またはその関係会社との取引の内容、金額および取引条件",
  "別紙1第8条に定める配分台帳",
  "在庫回転期間の実績および運用目標との差異ならびにその要因",
  "販売チャネルごとの販売実績および変動販売費の実績",
  "事業の進捗状況",
].forEach((t, i) => children.push(sub(i + 1, t)));

children.push(article(2, "年次報告"));
children.push(body("営業者は、各事業年度の終了後90日以内に、当該事業年度に係る決算書類および公認会計士による合意された手続に係る報告書を匿名組合員に提出するものとする。"));

children.push(article(3, "随時報告"));
children.push(body("営業者は、次に掲げる事由が生じた場合、当該事由を知った日から5営業日以内に、その内容および対応方針を匿名組合員に報告するものとする。"));
[
  "事業計画の重大な変更",
  "一の事由につき●円を超える損失の発生またはそのおそれ",
  "不正または法令違反の発生またはそのおそれ",
  "酒類販売業免許の取消、失効その他の変更",
  "主要な仕入先または販売先との取引の停止",
  "保管中の本件在庫に係る重大な滅失、毀損または盗難",
  "その他本匿名組合の財産または損益に重大な影響を及ぼす事由",
].forEach((t, i) => children.push(sub(i + 1, t)));

children.push(article(4, "事前承認事項"));
children.push(body("営業者は、次に掲げる行為を行う場合、あらかじめ匿名組合員の書面による承認を得るものとする。"));
[
  "一の取引につき●円を超える仕入または売却",
  "借入れその他の資金調達および担保の設定",
  "本匿名組合の財産による追加投資",
  "本契約および本匿名組合に係る関連契約の変更",
  "運用方針、在庫回転期間に係る運用目標または販売チャネル構成の重大な変更",
  "営業者またはその関係会社との間の取引であって別紙3第3条に定めるもの",
].forEach((t, i) => children.push(sub(i + 1, t)));

children.push(article(5, "閲覧および調査"));
children.push(item(1, "匿名組合員は、営業者に対し、本匿名組合に係る会計帳簿、請求書、契約書、銀行取引記録その他の資料の閲覧および謄写を求めることができる。"));
children.push(item(2, "匿名組合員は、あらかじめ営業者に通知したうえで、本件在庫が保管される倉庫について実地調査を行うことができる。"));
children.push(item(3, "営業者は、前2項の求めに対し、正当な理由なくこれを拒んではならない。"));

children.push(article(6, "報告様式"));
children.push(body("第1条および第2条に定める報告の様式は、営業者と匿名組合員との協議により定めるものとし、本匿名組合の期間を通じて継続的に比較可能な形式を維持するものとする。"));

// ───────────────────────────────── 別紙3
children.push(new Paragraph({ children: [new PageBreak()] }));
children.push(...annexTitle("別紙 3", "利益相反取引の管理"));

children.push(article(1, "独立企業間価格の原則"));
children.push(body("営業者またはその関係会社と本匿名組合との間の取引は、第三者との間の取引において通常適用される条件と同等の条件によるものとする。"));

children.push(article(2, "現物の譲渡価格"));
children.push(item(1, "営業者が調達したワインを本匿名組合に譲渡する場合の価格は、営業者の取得価額に1パーセントを加算した金額とする。"));
children.push(item(2, "前項の加算率は、本契約の期間を通じて変更しないものとする。"));
children.push(item(3, "営業者は、第1項の価格の合理性を説明するため、同種の取引に係る第三者の卸売価格との比較資料を毎事業年度作成し、保存するものとする。"));
children.push(item(4, "第1項の加算は、営業者が酒類販売業免許に基づく売買の当事者として在庫リスク、与信および入出庫事務を負担することの対価であり、これ以外に営業者が本匿名組合から受領する期中報酬または成功報酬は存在しないことを、両当事者は確認する。"));

children.push(article(3, "関連当事者取引の事前承認"));
children.push(body("営業者は、営業者またはその関係会社と本匿名組合との間で、一の取引につき●円を超える取引を行う場合、あらかじめ匿名組合員の書面による承認を得るものとする。ただし、前条に定める現物の譲渡については、この限りでない。"));

children.push(article(4, "記録の作成および保存"));
children.push(body("営業者は、営業者またはその関係会社との取引について、取引の内容、金額、取引条件およびその決定根拠を記録し、本契約の終了後●年間保存するものとする。"));

children.push(article(5, "報告"));
children.push(body("営業者は、営業者またはその関係会社との取引の内容、金額および取引条件を、別紙2第1条第5号に基づき四半期ごとに匿名組合員に報告するものとする。"));

children.push(article(6, "在庫配分との関係"));
children.push(body("本件在庫と自己勘定在庫との間の配分に係る利益相反の管理については、別紙1の定めるところによる。"));

// ───────────────────────────────── 確定事項の一覧
children.push(new Paragraph({ children: [new PageBreak()] }));
children.push(...annexTitle("参考", "確定を要する事項"));
children.push(p("本ドラフトにおいて「●」で表示した事項および契約締結前に確定を要する事項は、以下のとおりである。", { after: 200 }));

const todo = [
  ["別紙2 第3条(2)", "随時報告を要する損失の金額基準"],
  ["別紙2 第4条(1)", "事前承認を要する仕入または売却の金額基準"],
  ["別紙3 第3条", "事前承認を要する関連当事者取引の金額基準"],
  ["別紙3 第4条", "取引記録の保存期間"],
  ["別紙1 第4条", "組成時における本件在庫と自己勘定在庫の対象銘柄の重複状況（調査のうえ確定）"],
  ["全般", "本匿名組合が営業者の連結範囲に含まれるか否か、およびこれに伴う会計上の取扱い"],
  ["全般", "本匿名組合における酒類販売業免許の要否ならびに売買形態と委託形態の切分け（所轄税務署の酒類指導官および顧問弁護士に確認）"],
  ["全般", "適格機関投資家等特例業務に係る届出および適格機関投資家の確保"],
];
todo.forEach(([where, what]) => {
  children.push(new Paragraph({
    spacing: { before: 0, after: 110, line: 300 },
    indent: { left: convertInchesToTwip(0.34), hanging: convertInchesToTwip(0.34) },
    children: [
      new TextRun({ text: "・", font: SERIF, size: 21 }),
      new TextRun({ text: `【${where}】`, font: SANS, size: 21, bold: true }),
      new TextRun({ text: what, font: SERIF, size: 21 }),
    ],
  }));
});

const doc = new Document({
  styles: { default: { document: { run: { font: SERIF, size: 21 } } } },
  sections: [{
    properties: {
      page: {
        margin: {
          top: convertInchesToTwip(1.0), bottom: convertInchesToTwip(1.0),
          left: convertInchesToTwip(1.0), right: convertInchesToTwip(1.0),
        },
      },
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ children: [PageNumber.CURRENT], font: SERIF, size: 18, color: "808080" })],
        })],
      }),
    },
    children,
  }],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync("WineBank_ワインファンド_契約別紙ドラフト_20260811.docx", buf);
  console.log("written");
});
