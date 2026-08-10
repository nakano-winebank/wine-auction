const pptxgen = require("pptxgenjs");
const fs = require("fs");
const path = require("path");

/* =====================================================================
   トンマナは「株式会社WineBank 会社紹介（2026年6月）」に準拠
   白背景 / 濃紺フッターバー / タンアクセント / ロゴ右上
   ===================================================================== */

const PAPER   = "FFFFFF";
const INK     = "1A1A1A"; // 見出し・本文
const NAVY    = "2F3941"; // フッターバー・強調ブロック
const NAVY_D  = "232C33";
const TAN     = "C68A65"; // アクセント
const TAN_D   = "A06D4C";
const TAN_LT  = "EFDCCE";
const GREY    = "6E7378";
const GREY_LT = "A6ABAF";
const MIST    = "F6F6F6"; // カード地
const LINE    = "DDE0E2";

const FJP = "Yu Gothic";
const FEN = "Calibri";

const W = 13.333, H = 7.5;
const M = 0.62;
const BAR_H = 0.30;              // フッターバー
const BODY_TOP = 1.52;           // 本文開始
const BODY_BOT = 7.02;           // 本文下限

const DIR = __dirname;
const b64 = (p) => fs.readFileSync(path.join(DIR, p)).toString("base64");
const LOGO = "image/png;base64," + b64("logo.png");

const pres = new pptxgen();
pres.defineLayout({ name: "W16x9", width: W, height: H });
pres.layout = "W16x9";
pres.author = "株式会社WineBank";
pres.company = "株式会社WineBank";
pres.title = "森ビル株式会社 業務提携ご提案";

let pageNo = 0;

/* ============================ chrome ============================ */

function bar(s, showPage) {
  s.addShape(pres.ShapeType.rect, {
    x: 0, y: H - BAR_H, w: W, h: BAR_H, fill: { color: NAVY }, line: { width: 0 },
  });
  if (showPage) {
    s.addText(String(pageNo), {
      x: W - M - 0.8, y: H - BAR_H - 0.34, w: 0.8, h: 0.28, margin: 0, align: "right",
      fontFace: FEN, fontSize: 10, color: GREY_LT,
    });
    s.addText("CONFIDENTIAL", {
      x: M, y: H - BAR_H - 0.34, w: 3.2, h: 0.28, margin: 0,
      fontFace: FEN, fontSize: 8.5, color: "C7CACC", charSpacing: 1.2,
    });
  }
}

function logo(s) {
  s.addImage({ data: LOGO, x: W - M - 1.36, y: 0.32, w: 1.36, h: 0.271 });
}

// 標準コンテンツスライド
function slide(chip, title, lead) {
  pageNo++;
  const s = pres.addSlide();
  s.background = { color: PAPER };
  logo(s);
  if (chip) {
    const cw = 0.32 + chip.length * 0.090;
    s.addShape(pres.ShapeType.roundRect, {
      x: M, y: 0.32, w: cw, h: 0.26, rectRadius: 0.03,
      fill: { color: TAN }, line: { width: 0 },
    });
    s.addText(chip, {
      x: M, y: 0.32, w: cw, h: 0.26, margin: 0, align: "center", valign: "middle",
      fontFace: FJP, fontSize: 8.5, bold: true, color: PAPER,
    });
  }
  s.addText(title, {
    x: M, y: 0.64, w: 10.4, h: 0.46, margin: 0, valign: "middle",
    fontFace: FJP, fontSize: 23, bold: true, color: INK,
  });
  if (lead) {
    s.addText(lead, {
      x: M, y: 1.12, w: W - M * 2, h: 0.34, margin: 0,
      fontFace: FJP, fontSize: 11.5, color: GREY, lineSpacing: 17,
    });
  }
  bar(s, true);
  return s;
}

function card(s, x, y, w, h, opts = {}) {
  s.addShape(pres.ShapeType.roundRect, {
    x, y, w, h, rectRadius: 0.05,
    fill: { color: opts.fill || MIST },
    line: opts.line ? { color: opts.line, width: 1 } : { width: 0 },
  });
}

function bullets(s, items, x, y, w, h, o = {}) {
  s.addText(
    items.map((t, i) => ({
      text: t,
      options: { bullet: { code: "25AA" }, breakLine: i !== items.length - 1 },
    })),
    {
      x, y, w, h, margin: 0,
      fontFace: FJP, fontSize: o.size || 11, color: o.color || INK,
      lineSpacing: o.lineSpacing || 16, paraSpaceAfter: o.gap === undefined ? 5 : o.gap,
    }
  );
}

// 見出し（本文中の小見出し）
function head(s, t, x, y, w, o = {}) {
  s.addText(t, {
    x, y, w, h: 0.30, margin: 0,
    fontFace: FJP, fontSize: o.size || 14, bold: true, color: o.color || INK,
  });
}

// タン色の番号バッジ
function num(s, x, y, d, label, o = {}) {
  s.addShape(pres.ShapeType.ellipse, {
    x, y, w: d, h: d, fill: { color: o.fill || TAN }, line: { width: 0 },
  });
  s.addText(label, {
    x, y, w: d, h: d, margin: 0, align: "center", valign: "middle",
    fontFace: FEN, fontSize: o.size || 11, bold: true, color: o.color || PAPER,
  });
}

// 濃紺の強調バンド（会社紹介 p7 の見出し帯に相当）
function band(s, y, text, o = {}) {
  s.addShape(pres.ShapeType.rect, {
    x: M, y, w: W - M * 2, h: o.h || 0.44, fill: { color: NAVY }, line: { width: 0 },
  });
  s.addText(text, {
    x: M, y, w: W - M * 2, h: o.h || 0.44, margin: 0, align: "center", valign: "middle",
    fontFace: FJP, fontSize: o.size || 12.5, bold: true, color: PAPER,
  });
}

/* ============================ 1. 表紙 ============================ */
{
  const s = pres.addSlide();
  s.background = { color: PAPER };
  s.addImage({ data: LOGO, x: W - M - 1.86, y: 0.44, w: 1.86, h: 0.371 });

  s.addText("すべての人にファインワインを", {
    x: M, y: 2.06, w: 9.0, h: 0.34, margin: 0,
    fontFace: FJP, fontSize: 13, color: GREY,
  });
  s.addText("森ビル株式会社 御中", {
    x: M, y: 2.46, w: 9.0, h: 0.34, margin: 0,
    fontFace: FJP, fontSize: 13.5, bold: true, color: TAN,
  });
  s.addText("ヒルズ経済圏 × ファインワイン", {
    x: M, y: 2.94, w: 11.0, h: 0.76, margin: 0,
    fontFace: FJP, fontSize: 36, bold: true, color: INK,
  });
  s.addShape(pres.ShapeType.rect, {
    x: M, y: 3.86, w: 1.30, h: 0.045, fill: { color: TAN }, line: { width: 0 },
  });
  s.addText("Cloud Wine Cave を核とした、ワーカー・レジデンス・テナント飲食店向け\nワインインフラの共同構築に関するご提案", {
    x: M, y: 4.10, w: 9.4, h: 0.76, margin: 0,
    fontFace: FJP, fontSize: 13, color: "44494D", lineSpacing: 22,
  });

  const stats = [
    ["55年", "酒販事業の実績"],
    ["30億円", "管理ワイン在庫"],
    ["50万本", "アクセスできる在庫"],
    ["26店舗", "コルケージ無料の提携店"],
  ];
  stats.forEach((st, i) => {
    const x = M + i * 2.92;
    s.addText(st[0], {
      x, y: 5.42, w: 2.70, h: 0.50, margin: 0,
      fontFace: FJP, fontSize: 26, bold: true, color: TAN,
    });
    s.addText(st[1], {
      x, y: 5.94, w: 2.70, h: 0.28, margin: 0,
      fontFace: FJP, fontSize: 9.5, color: GREY,
    });
  });

  s.addText("2026年8月　株式会社WineBank", {
    x: M, y: 6.56, w: 6.0, h: 0.28, margin: 0, fontFace: FJP, fontSize: 10.5, color: GREY,
  });
  s.addText("CONFIDENTIAL", {
    x: W - M - 3.0, y: 6.56, w: 3.0, h: 0.28, margin: 0, align: "right",
    fontFace: FEN, fontSize: 9, color: GREY_LT, charSpacing: 1.4,
  });
  bar(s, false);
  s.addNotes("森ビル様向け業務提携提案。Cloud Wine Cave（クラウド型共有セラー）を核に、ヒルズのテナント飲食店・ワーカー・レジデンス居住者を一つのワイン在庫で結ぶ。投資商品の訴求は行わない。");
}

/* ============================ 2. エグゼクティブサマリー ============================ */
{
  const s = slide("SUMMARY", "ご提案の骨子",
    "ヒルズには「良いワインを必要とする人」が三層で密集しています。三層の課題は、一つの在庫で同時に解けます。");

  band(s, 1.60, "その一つの在庫が、Cloud Wine Cave（クラウド型共有セラー）です。", { h: 0.52, size: 14 });

  const cols = [
    { n: "01", t: "何を", b: ["Cloud Wine Caveを核とした6つのプログラムを共同組成", "在庫は当社が保有。利用者は使った分だけ支払う"] },
    { n: "02", t: "誰に", b: ["ヒルズのテナント飲食店（在庫リスクからの解放）", "ヒルズワーカー（接待・会食）", "レジデンス居住者（自宅消費・贈答）"] },
    { n: "03", t: "森ビル様の便益", b: ["テナント飲食店の在庫負担軽減と収益性改善", "居住者・ワーカーの満足度と定着", "商業区画の話題性、レベニューシェア収入"] },
    { n: "04", t: "当社が持ち込むもの", b: ["55年の仕入網と30億円の管理在庫", "定温ラストワンマイル配送網 WineGO", "グランメゾン運営とティエリー・マルクス"] },
  ];
  const cw = (W - M * 2 - 0.30 * 3) / 4;
  cols.forEach((c, i) => {
    const x = M + i * (cw + 0.30);
    card(s, x, 2.36, cw, 2.86);
    s.addShape(pres.ShapeType.rect, {
      x: x + 0.28, y: 2.66, w: 0.34, h: 0.035, fill: { color: TAN }, line: { width: 0 },
    });
    s.addText(c.t, {
      x: x + 0.28, y: 2.86, w: cw - 0.56, h: 0.32, margin: 0,
      fontFace: FJP, fontSize: 15, bold: true, color: INK,
    });
    bullets(s, c.b, x + 0.28, 3.28, cw - 0.56, 1.80, { size: 10.2, lineSpacing: 14.5, gap: 6 });
  });

  s.addText("各プログラムは単独でも成立します。まずは設備投資を伴わないCloud Wine Cave／WineGO／CLUBから、3か月のPoCでご検証いただくご提案です。", {
    x: M, y: 5.46, w: 12.0, h: 0.32, margin: 0, fontFace: FJP, fontSize: 11, bold: true, color: TAN_D,
  });
  s.addText("※ 本ご提案は「使えるサービス」としてのご提案であり、投資商品・利回りのご案内ではありません。", {
    x: M, y: 5.86, w: 12.0, h: 0.28, margin: 0, fontFace: FJP, fontSize: 9, color: GREY_LT,
  });
}

/* ============================ 3. なぜヒルズか ============================ */
{
  const s = slide("WHY HILLS", "ヒルズには、ワインを必要とする人が三層で密集している",
    "そしてこの三層は、互いに別々の相手ではありません。同じ街で、同じ夜に、同じ一本を必要としています。");

  const layers = [
    {
      t: "テナント飲食店", sub: "ヒルズ内の高級店・グランメゾン",
      pain: ["高額ワインの在庫が資金を拘束する", "セラー設備への投資と保管スペースの限界", "富裕層客の突発的な注文に応えられない"],
    },
    {
      t: "ヒルズワーカー", sub: "オフィス就業者・法人接待",
      pain: ["店内価格は市価の2〜3倍。接待費が膨らむ", "急な会食に「格」に見合う一本が出せない", "自分で選ぶ自信がなく、いつも同じ銘柄になる"],
    },
    {
      t: "レジデンス居住者", sub: "住宅棟・サービスアパートメント",
      pain: ["自宅セラーはすぐ満杯。保管環境も不安", "どこで買えば間違いないかが分からない", "並行品・二次流通品の真贋と来歴が読めない"],
    },
  ];
  const cw = (W - M * 2 - 0.32 * 2) / 3;
  layers.forEach((l, i) => {
    const x = M + i * (cw + 0.32);
    card(s, x, 1.62, cw, 2.90);
    s.addShape(pres.ShapeType.rect, {
      x: x + 0.28, y: 1.86, w: 0.34, h: 0.035, fill: { color: TAN }, line: { width: 0 },
    });
    s.addText(l.t, {
      x: x + 0.28, y: 2.02, w: cw - 0.56, h: 0.34, margin: 0,
      fontFace: FJP, fontSize: 17, bold: true, color: INK,
    });
    s.addText(l.sub, {
      x: x + 0.28, y: 2.38, w: cw - 0.56, h: 0.28, margin: 0,
      fontFace: FJP, fontSize: 9.5, color: GREY,
    });
    s.addText("いま抱えている課題", {
      x: x + 0.28, y: 2.78, w: cw - 0.56, h: 0.26, margin: 0,
      fontFace: FJP, fontSize: 10.5, bold: true, color: TAN_D,
    });
    bullets(s, l.pain, x + 0.28, 3.08, cw - 0.56, 1.28, { size: 10.3, lineSpacing: 15, gap: 6 });
  });

  band(s, 4.74, "一つの在庫を三層で共有すれば、在庫負担も、価格も、突発対応も、同時に解決できる。", { h: 0.52, size: 14 });

  const solves = [
    ["飲食店は在庫を持たない", "必要な分だけ卸値で引き出す。資金は寝かせない。"],
    ["ワーカーは手ぶらで会食へ", "提携店へ事前配送、コルケージ無料。店内価格から解放。"],
    ["居住者は迷わず買える", "正規ルートの一本を、コンシェルジュ経由で自宅セラーへ。"],
  ];
  const sw = (W - M * 2 - 0.32 * 2) / 3;
  solves.forEach((sv, i) => {
    const x = M + i * (sw + 0.32);
    s.addText(sv[0], {
      x, y: 5.46, w: sw, h: 0.30, margin: 0,
      fontFace: FJP, fontSize: 13, bold: true, color: INK,
    });
    s.addText(sv[1], {
      x, y: 5.78, w: sw, h: 0.50, margin: 0,
      fontFace: FJP, fontSize: 10, color: GREY, lineSpacing: 14,
    });
  });
}

/* ============================ 4. 提携全体像 ============================ */
{
  const s = slide("OVERVIEW", "提携全体像：Hills Wine Program（6プログラム）",
    "①が土台です。②〜⑥は①の在庫と配送網の上に載ることで、それぞれ単独より強く働きます。");

  const progs = [
    { n: "01", t: "Cloud Wine Cave", d: "当社の管理在庫を「自分のセラー」として使う。共有セラー型・置きワイン型・レジデンス向けの3形態。", tag: "飲食店／レジデンス", main: true },
    { n: "02", t: "WineGO ヒルズ・デリバリー", d: "街区内ターミナルから定温のまま最短5分。Cloud Wine Caveを成立させる配送網。", tag: "飲食店／ワーカー／レジデンス" },
    { n: "03", t: "WineBank CLUB ヒルズ会員", d: "通常プランに加え、ヒルズ向けにオーダーメイドした Hills WineBank CLUB をご提案。", tag: "ワーカー／レジデンス" },
    { n: "04", t: "クラウドワインセラー出店", d: "数千本のウォークインセラーを核とした、在庫共有型フードホールを商業区画に。", tag: "商業施設" },
    { n: "05", t: "ティエリー・マルクス業態出店", d: "ミシュラン累計7つ星シェフの日本再進出業態。街区の格とメディア露出を創出。", tag: "商業施設" },
    { n: "06", t: "ワイン預りサービス", d: "居住者のご自宅ワインをお預かりし、一覧化して定温保管。必要なときに出庫。", tag: "レジデンス" },
  ];

  const cw = (W - M * 2 - 0.30 * 2) / 3;
  const ch = 1.90;
  progs.forEach((p, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = M + col * (cw + 0.30);
    const y = 1.60 + row * (ch + 0.26);
    card(s, x, y, cw, ch, { fill: p.main ? NAVY : MIST });
    num(s, x + 0.28, y + 0.30, 0.46, p.n, p.main ? { fill: TAN } : {});
    s.addText(p.t, {
      x: x + 0.86, y: y + 0.20, w: cw - 1.14, h: 0.66, margin: 0, valign: "middle",
      fontFace: FJP, fontSize: 13, bold: true, color: p.main ? PAPER : INK,
    });
    s.addText(p.d, {
      x: x + 0.28, y: y + 0.94, w: cw - 0.56, h: 0.60, margin: 0,
      fontFace: FJP, fontSize: 10, color: p.main ? "DDE1E4" : INK, lineSpacing: 14,
    });
    s.addText(p.tag, {
      x: x + 0.28, y: y + ch - 0.36, w: cw - 0.56, h: 0.26, margin: 0,
      fontFace: FJP, fontSize: 8.8, bold: true, color: p.main ? TAN_LT : TAN_D,
    });
  });

  s.addText("段階導入：①②③（設備投資ほぼ不要・3〜4か月で開始可能） → 効果検証のうえ ④⑤（区画を伴う出店）。⑥は③と同時に付帯。", {
    x: M, y: 5.86, w: 12.0, h: 0.32, margin: 0, fontFace: FJP, fontSize: 11, bold: true, color: TAN_D,
  });
}

/* ============================ 5. Cloud Wine Cave とは ============================ */
{
  const s = slide("PROGRAM 01", "Cloud Wine Cave とは",
    "当社が保有・管理する数万本のワイン在庫を、クラウド上の「自分のセラー」として使っていただく仕組みです。");

  // 4 stats
  const stats = [
    ["30億円", "当社の管理ワイン在庫"],
    ["50万本", "アクセスできる在庫本数"],
    ["最短翌日", "前日午前中のご注文で翌日着"],
    ["0円", "利用者が抱える在庫金額"],
  ];
  const stw = (W - M * 2 - 0.28 * 3) / 4;
  stats.forEach((st, i) => {
    const x = M + i * (stw + 0.28);
    card(s, x, 1.58, stw, 1.10);
    s.addText(st[0], {
      x: x + 0.24, y: 1.70, w: stw - 0.48, h: 0.44, margin: 0,
      fontFace: FJP, fontSize: 22, bold: true, color: TAN,
    });
    s.addText(st[1], {
      x: x + 0.24, y: 2.18, w: stw - 0.48, h: 0.30, margin: 0,
      fontFace: FJP, fontSize: 9.5, color: GREY,
    });
  });

  // flow
  head(s, "仕組み", M, 2.94, 3.0);
  const steps = [
    ["01", "リストから選ぶ", "専用アプリ／Webから数万本の在庫を検索。銘柄・ヴィンテージ・価格が一覧で見える。"],
    ["02", "注文する", "在庫は当社が保有。発注の瞬間まで、利用者側に資金負担も保管責任も発生しない。"],
    ["03", "定温で届く", "10〜15℃を保ったままお届け。館内ストレージ開設後は即日・最短5分。"],
    ["04", "使った分だけ支払う", "月締め請求。売れ残りリスクも、セラー設備への投資も不要。"],
  ];
  const fw = (W - M * 2 - 0.46 * 3) / 4;
  steps.forEach((st, i) => {
    const x = M + i * (fw + 0.46);
    card(s, x, 3.30, fw, 1.72);
    num(s, x + 0.26, 3.52, 0.44, st[0]);
    s.addText(st[1], {
      x: x + 0.26, y: 4.04, w: fw - 0.52, h: 0.30, margin: 0,
      fontFace: FJP, fontSize: 13, bold: true, color: INK,
    });
    s.addText(st[2], {
      x: x + 0.26, y: 4.36, w: fw - 0.52, h: 0.58, margin: 0,
      fontFace: FJP, fontSize: 9.6, color: GREY, lineSpacing: 13.5,
    });
    if (i < 3) {
      s.addShape(pres.ShapeType.triangle, {
        x: x + fw + 0.10, y: 4.06, w: 0.26, h: 0.24, rotate: 90,
        fill: { color: TAN }, line: { width: 0 },
      });
    }
  });

  card(s, M, 5.22, W - M * 2, 0.92, { fill: MIST });
  s.addText("スピードは、在庫をどこに置くかで決まります。", {
    x: M + 0.34, y: 5.34, w: 4.90, h: 0.30, margin: 0,
    fontFace: FJP, fontSize: 13, bold: true, color: INK,
  });
  s.addText("現状は当社倉庫からの配送のため、前日午前中のご注文で翌日着が基本です。館内にワインストレージをご用意いただければ、同じ仕組みが即日・最短5分になります。この一点が、高級店にとっての価値を大きく変えます（詳細は後掲のご相談事項）。", {
    x: M + 0.34, y: 5.64, w: 11.7, h: 0.44, margin: 0,
    fontFace: FJP, fontSize: 10.2, color: GREY, lineSpacing: 14,
  });
}

/* ============================ 6. Cloud Wine Cave for 飲食店 ============================ */
{
  const s = slide("PROGRAM 01-A", "Cloud Wine Cave for テナント飲食店",
    "高級店ほど、ワイン在庫は重い。その重さを、店から街へ移します。");

  // before / after
  const cmp = [
    {
      h: "いまの高級店のワイン在庫", dark: false,
      rows: [
        ["資金", "常時30本（平均3万円）で約90万円が寝る"],
        ["設備", "セラー設備の投資と保管スペースの確保"],
        ["リスク", "売れ残り・破損・劣化はすべて店の負担"],
        ["品揃え", "資金の範囲でしかリストを組めない"],
        ["突発対応", "在庫にない一本は、その場では出せない"],
      ],
    },
    {
      h: "Cloud Wine Cave 導入後", dark: true,
      rows: [
        ["資金", "在庫金額 0円。使った分だけ月締めで支払う"],
        ["設備", "セラー投資は不要。街区内ターミナルが担う"],
        ["リスク", "保管・劣化・破損のリスクは当社が保有"],
        ["品揃え", "数万本のリストがそのまま自店のリストに"],
        ["突発対応", "前日午前中の注文で翌日着。館内ストレージ開設後は最短5分"],
      ],
    },
  ];
  const cw = (W - M * 2 - 0.34) / 2;
  cmp.forEach((c, i) => {
    const x = M + i * (cw + 0.34);
    card(s, x, 1.60, cw, 3.42, { fill: c.dark ? NAVY : MIST });
    s.addText(c.h, {
      x: x + 0.32, y: 1.78, w: cw - 0.64, h: 0.34, margin: 0,
      fontFace: FJP, fontSize: 15, bold: true, color: c.dark ? TAN_LT : GREY,
    });
    c.rows.forEach((r, j) => {
      const y = 2.28 + j * 0.54;
      s.addText(r[0], {
        x: x + 0.32, y, w: 0.90, h: 0.30, margin: 0, valign: "middle",
        fontFace: FJP, fontSize: 10, bold: true, color: c.dark ? TAN : TAN_D,
      });
      s.addText(r[1], {
        x: x + 1.28, y, w: cw - 1.60, h: 0.34, margin: 0, valign: "middle",
        fontFace: FJP, fontSize: 10.2, color: c.dark ? "E3E6E8" : INK, lineSpacing: 13.5,
      });
    });
  });

  head(s, "価格の考え方", M, 5.22, 4.0);
  const prices = [
    ["テナント飲食店向け", "卸値", "インポーター直の仕入水準。一般の酒販ルートより明確に低い価格帯。"],
    ["森ビル様の便益", "テナント収益性", "ワイン原価と在庫負担が下がり、店の利益率と賃料負担力が上がる。"],
    ["導入コスト", "0円", "初期費用・月額固定費なし。使った分の商品代のみ。"],
  ];
  const pw = (W - M * 2 - 0.30 * 2) / 3;
  prices.forEach((p, i) => {
    const x = M + i * (pw + 0.30);
    card(s, x, 5.58, pw, 1.06, { fill: PAPER, line: LINE });
    s.addText(p[0], {
      x: x + 0.26, y: 5.68, w: pw - 0.52, h: 0.24, margin: 0,
      fontFace: FJP, fontSize: 9.5, color: GREY,
    });
    s.addText(p[1], {
      x: x + 0.26, y: 5.92, w: 2.2, h: 0.30, margin: 0,
      fontFace: FJP, fontSize: 15, bold: true, color: TAN,
    });
    s.addText(p[2], {
      x: x + 0.26, y: 6.22, w: pw - 0.52, h: 0.34, margin: 0,
      fontFace: FJP, fontSize: 8.8, color: GREY, lineSpacing: 12,
    });
  });
}

/* ============================ 6b. 置きワイン（消化仕入） ============================ */
{
  const s = slide("PROGRAM 01-B", "置きワイン ─ 売れた分だけ、お支払いいただく",
    "ワインの月商が見込める店には、在庫を店内に置きます。所有権は当社のまま、売れた本数だけを月締めでご請求します。");

  head(s, "仕組み", M, 1.60, 4.0);
  const flow = [
    ["当社が銘柄を選定し、店内セラーへ預託", "所有権は当社。店は仕入計上をせず、リストに載せて販売するだけ。"],
    ["売れた本数のみ、月締めでご請求", "キャッシュアウトは売れた後。仕入時点の資金拘束が発生しません。"],
    ["売れ残り・劣化・破損は当社負担", "動かない銘柄は当社が回収し、入れ替えます。店に損失は残りません。"],
    ["定期的に構成を見直す", "客層と販売実績を見て、価格帯と銘柄を組み替えていきます。"],
  ];
  flow.forEach((f, i) => {
    const y = 2.00 + i * 0.86;
    s.addShape(pres.ShapeType.rect, {
      x: M, y: y + 0.10, w: 0.22, h: 0.035, fill: { color: TAN }, line: { width: 0 },
    });
    s.addText(f[0], {
      x: M + 0.38, y, w: 6.10, h: 0.28, margin: 0,
      fontFace: FJP, fontSize: 12.5, bold: true, color: INK,
    });
    s.addText(f[1], {
      x: M + 0.38, y: y + 0.30, w: 6.10, h: 0.44, margin: 0,
      fontFace: FJP, fontSize: 10, color: GREY, lineSpacing: 14,
    });
  });

  card(s, M, 5.50, 6.48, 1.20, { fill: MIST });
  s.addText("対象と条件", {
    x: M + 0.30, y: 5.62, w: 6.0, h: 0.26, margin: 0,
    fontFace: FJP, fontSize: 12.5, bold: true, color: TAN_D,
  });
  s.addText("ワインの月商が一定以上ある店を優先します。とくに海外からの富裕層が多く入る店は、高単価銘柄の回転が読めるため相性が良いと考えています。与信は売上入金を担保とする形（口座振替・売上債権譲渡等）でご相談させてください。", {
    x: M + 0.30, y: 5.90, w: 5.90, h: 0.68, margin: 0,
    fontFace: FJP, fontSize: 9.8, color: INK, lineSpacing: 13.5,
  });

  const rx = M + 6.82;
  const rw = W - M - rx;
  card(s, rx, 1.60, rw, 2.42, { fill: NAVY });
  s.addText("店にとって、何が変わるか", {
    x: rx + 0.32, y: 1.78, w: rw - 0.64, h: 0.30, margin: 0,
    fontFace: FJP, fontSize: 15, bold: true, color: TAN_LT,
  });
  bullets(s, [
    "自己資金では置けない価格帯を、リストに載せられる",
    "在庫を持つのは当社。店の在庫回転率は悪化しない",
    "品揃えの厚みが、そのまま客単価に効く",
    "セラーの空きスペースを当社在庫で埋められる",
  ], rx + 0.32, 2.16, rw - 0.64, 1.70, { size: 10.2, lineSpacing: 15, gap: 6, color: "E3E6E8" });

  card(s, rx, 4.20, rw, 1.32, { fill: PAPER, line: LINE });
  s.addText("森ビル様の便益", {
    x: rx + 0.30, y: 4.34, w: rw - 0.60, h: 0.28, margin: 0,
    fontFace: FJP, fontSize: 12.5, bold: true, color: TAN_D,
  });
  s.addText("テナント飲食店の客単価と収益性が上がります。大きなセラーを持たない店でも高級ワインを扱えるため、区画の使い方の選択肢が広がります。", {
    x: rx + 0.30, y: 4.64, w: rw - 0.60, h: 0.68, margin: 0,
    fontFace: FJP, fontSize: 9.8, color: INK, lineSpacing: 13.5,
  });

  card(s, rx, 5.70, rw, 1.00, { fill: MIST });
  s.addText("共有セラー型との併用", {
    x: rx + 0.30, y: 5.82, w: rw - 0.60, h: 0.26, margin: 0,
    fontFace: FJP, fontSize: 11.5, bold: true, color: INK,
  });
  s.addText("定番は置きワインで店に置き、突発の一本はCloud Wine Caveから引く。この二段構えが実務上いちばん機能します。", {
    x: rx + 0.30, y: 6.08, w: rw - 0.60, h: 0.52, margin: 0,
    fontFace: FJP, fontSize: 9.6, color: GREY, lineSpacing: 13,
  });
}

/* ============================ 7. Cloud Wine Cave for レジデンス ============================ */
{
  const s = slide("PROGRAM 01-C", "Cloud Wine Cave for レジデンス居住者",
    "同じ在庫をヒルズレジデンス居住者にも開放するご提案です。価格は飲食店向け卸値の1.1倍を想定。開放の是非は森ビル様とご相談させてください。");

  // pricing concept
  card(s, M, 1.60, 6.10, 2.34, { fill: NAVY });
  s.addText("価格設計：卸値 × 1.1〜1.3", {
    x: M + 0.34, y: 1.80, w: 5.4, h: 0.36, margin: 0,
    fontFace: FJP, fontSize: 17, bold: true, color: TAN_LT,
  });
  s.addText("テナント飲食店向けの卸値に対し、居住者向けは1.1〜1.3倍。飲食店の仕入価格を必ず下回らせない設計とすることで、テナントとの価格逆転を防ぎます。", {
    x: M + 0.34, y: 2.24, w: 5.42, h: 0.62, margin: 0,
    fontFace: FJP, fontSize: 10.5, color: "DDE1E4", lineSpacing: 15,
  });
  const ladder = [
    ["テナント飲食店", "卸値"],
    ["レジデンス居住者", "卸値 × 1.1〜1.3"],
    ["一般のネット最安値", "これを下回る水準"],
    ["レストラン店頭価格", "市価の2〜3倍"],
  ];
  ladder.forEach((l, i) => {
    const y = 2.96 + i * 0.24;
    s.addText(l[0], {
      x: M + 0.34, y, w: 2.7, h: 0.22, margin: 0,
      fontFace: FJP, fontSize: 9.6, color: "B9BEC2",
    });
    s.addText(l[1], {
      x: M + 3.10, y, w: 2.66, h: 0.22, margin: 0,
      fontFace: FJP, fontSize: 9.6, bold: true, color: i === 1 ? TAN : PAPER,
    });
  });

  // pros / cautions
  const px = M + 6.44;
  const pw = W - M - px;
  card(s, px, 1.60, pw, 1.10, { fill: MIST });
  s.addText("開放するメリット", {
    x: px + 0.30, y: 1.70, w: pw - 0.60, h: 0.26, margin: 0,
    fontFace: FJP, fontSize: 12.5, bold: true, color: INK,
  });
  s.addText("居住者は市中よりはるかに有利な価格で正規品を購入でき、レジデンスの付加価値が明確になる。単価・頻度ともに高く、街区内の流通額を押し上げる。", {
    x: px + 0.30, y: 1.98, w: pw - 0.60, h: 0.62, margin: 0,
    fontFace: FJP, fontSize: 10, color: INK, lineSpacing: 14,
  });

  card(s, px, 2.84, pw, 1.10, { fill: PAPER, line: TAN });
  s.addText("留意すべき点", {
    x: px + 0.30, y: 2.94, w: pw - 0.60, h: 0.26, margin: 0,
    fontFace: FJP, fontSize: 12.5, bold: true, color: TAN_D,
  });
  s.addText("テナント飲食店から見た「客が安く買えてしまう」感覚への配慮。および一般消費者向け販売としての数量・提供方法の設計。", {
    x: px + 0.30, y: 3.22, w: pw - 0.60, h: 0.62, margin: 0,
    fontFace: FJP, fontSize: 10, color: INK, lineSpacing: 14,
  });

  band(s, 4.16, "当社のご提案：まずはWineBank CLUB会員となった居住者に限定して開放し、テナントへの影響を検証したうえで拡大する。", { h: 0.52, size: 13 });

  head(s, "段階開放の設計（案）", M, 4.94, 4.0);
  const phases = [
    ["STEP 1", "CLUB会員限定", "会員となった居住者のみ。コンシェルジュ経由の注文に限定し、数量上限を設ける。"],
    ["STEP 2", "全居住者へ", "テナント飲食店への影響を検証したうえで、レジデンス全体へ案内を拡大。"],
    ["STEP 3", "贈答・催事へ", "お中元・お歳暮、ホームパーティ、館内イベント向けの一括手配まで拡張。"],
  ];
  const sw = (W - M * 2 - 0.30 * 2) / 3;
  phases.forEach((p, i) => {
    const x = M + i * (sw + 0.30);
    card(s, x, 5.30, sw, 1.36);
    s.addText(p[0], {
      x: x + 0.28, y: 5.42, w: sw - 0.56, h: 0.24, margin: 0,
      fontFace: FEN, fontSize: 10, bold: true, color: TAN, charSpacing: 1.2,
    });
    s.addText(p[1], {
      x: x + 0.28, y: 5.68, w: sw - 0.56, h: 0.28, margin: 0,
      fontFace: FJP, fontSize: 13, bold: true, color: INK,
    });
    s.addText(p[2], {
      x: x + 0.28, y: 5.98, w: sw - 0.56, h: 0.56, margin: 0,
      fontFace: FJP, fontSize: 9.4, color: GREY, lineSpacing: 13,
    });
  });
}

/* ============================ 8. WineGO ============================ */
{
  const s = slide("PROGRAM 02", "WineGO ヒルズ・デリバリー",
    "Cloud Wine Caveを成立させるのは、街区内の定温ラストワンマイルです。「今すぐ」に応えられなければ、共有セラーは機能しません。");

  const cmp = [
    { h: "一般的な酒類配送", b: ["最短60分〜／常温配送", "希少銘柄の取扱いなし", "夜間・突発の依頼に弱い"], dark: false },
    { h: "WineGO", b: ["街区内ターミナルから最短5分", "10〜15℃の定温ラストワンマイル", "希少ヴィンテージ・高級シャンパンを常時"], dark: true },
  ];
  const cw2 = 3.40;
  cmp.forEach((c, i) => {
    const x = M + i * (cw2 + 0.30);
    card(s, x, 1.60, cw2, 1.92, { fill: c.dark ? NAVY : MIST });
    s.addText(c.h, {
      x: x + 0.28, y: 1.76, w: cw2 - 0.56, h: 0.30, margin: 0,
      fontFace: FJP, fontSize: 14, bold: true, color: c.dark ? TAN_LT : GREY,
    });
    bullets(s, c.b, x + 0.28, 2.14, cw2 - 0.56, 1.20,
      { size: 10.2, lineSpacing: 14.5, color: c.dark ? "E3E6E8" : INK });
  });

  const ux = M + (cw2 + 0.30) * 2;
  const uw = W - M - ux;
  card(s, ux, 1.60, uw, 4.14, { fill: MIST });
  s.addText("ヒルズでの4つの使い方", {
    x: ux + 0.32, y: 1.78, w: uw - 0.64, h: 0.30, margin: 0,
    fontFace: FJP, fontSize: 15, bold: true, color: INK,
  });
  const uses = [
    ["店舗への即時補充", "テナント飲食店がCloud Wine Caveから発注。最短5分で厨房へ。"],
    ["会食先への事前配送", "提携レストランへ事前に届けておき、手ぶらで会食へ。コルケージ無料。"],
    ["自宅配送", "居住者がアプリで購入。定温のまま自宅セラーへ。4桁コードで受渡し。"],
    ["ターミナル受取", "街区内の拠点で好きな時間にピックアップ。帰宅動線で完結。"],
  ];
  uses.forEach((u, i) => {
    const y = 2.24 + i * 0.84;
    num(s, ux + 0.34, y + 0.02, 0.40, String(i + 1), { size: 10 });
    s.addText(u[0], {
      x: ux + 0.86, y, w: uw - 1.18, h: 0.26, margin: 0,
      fontFace: FJP, fontSize: 12.5, bold: true, color: INK,
    });
    s.addText(u[1], {
      x: ux + 0.86, y: y + 0.26, w: uw - 1.18, h: 0.46, margin: 0,
      fontFace: FJP, fontSize: 9.6, color: GREY, lineSpacing: 13,
    });
  });

  card(s, M, 3.74, cw2 * 2 + 0.30, 2.00, { fill: PAPER, line: LINE });
  s.addText("森ビル様にお願いしたいこと", {
    x: M + 0.30, y: 3.90, w: 6.6, h: 0.28, margin: 0,
    fontFace: FJP, fontSize: 14, bold: true, color: TAN_D,
  });
  bullets(s, [
    "街区内バックヤード等に、小規模ターミナル（2〜5坪）のご提供",
    "配送員の館内動線・荷捌きに関する運用ご調整",
    "テナント飲食店へのご紹介（在庫リスクゼロの共有セラーとして）",
  ], M + 0.30, 4.26, 6.60, 1.26, { size: 10.5, lineSpacing: 15 });

  s.addText("ターミナルは定温設備を備えた小規模スペースです。ヒルズ内に1拠点あれば、街区全体をカバーできます。", {
    x: M, y: 5.92, w: 12.0, h: 0.30, margin: 0, fontFace: FJP, fontSize: 10, color: GREY,
  });
}

/* ============================ 9. WineBank CLUB ============================ */
{
  const s = slide("PROGRAM 03-A", "WineBank CLUB（通常）",
    "まず現行のWineBank CLUBです。月額会費制で、ワインの購入とグループ飲食店のご利用がお得になる会員サービスです。");

  card(s, M, 1.60, 7.36, 4.14, { fill: MIST });
  s.addText("現行の会員特典", {
    x: M + 0.34, y: 1.80, w: 6.8, h: 0.32, margin: 0,
    fontFace: FJP, fontSize: 16, bold: true, color: INK,
  });
  const perks = [
    ["グループ飲食店 20%OFF", "将来的に100店舗以上へ拡大予定。"],
    ["コルケージ完全無料", "提携26店舗へのBYOで抜栓料・持込料ゼロ。WineGOで購入した場合は最短5分で「手ぶらBYO」。"],
    ["ワイン配送 月3回無料", "自宅・会食先・贈答先へ。都心はWineGOで当日デリバリー。"],
    ["ネット最安値水準での購入", "インポーター直の仕入力による特別価格。会員ランクに応じて設定。"],
    ["優先割当", "アロケーションワイン、希少ウイスキー等を会員に優先してご案内。"],
  ];
  perks.forEach((p, i) => {
    const y = 2.26 + i * 0.66;
    s.addShape(pres.ShapeType.ellipse, {
      x: M + 0.36, y: y + 0.04, w: 0.30, h: 0.30, fill: { color: TAN }, line: { width: 0 },
    });
    s.addText("\u2713", {
      x: M + 0.36, y: y + 0.04, w: 0.30, h: 0.30, margin: 0, align: "center", valign: "middle",
      fontFace: FEN, fontSize: 11, bold: true, color: PAPER,
    });
    s.addText(p[0], {
      x: M + 0.80, y, w: 6.4, h: 0.26, margin: 0,
      fontFace: FJP, fontSize: 12, bold: true, color: INK,
    });
    s.addText(p[1], {
      x: M + 0.80, y: y + 0.26, w: 6.4, h: 0.34, margin: 0,
      fontFace: FJP, fontSize: 9.4, color: GREY, lineSpacing: 13,
    });
  });

  const rx = M + 7.70;
  const rw = W - M - rx;
  card(s, rx, 1.60, rw, 1.86, { fill: MIST });
  s.addText("会費と運用", {
    x: rx + 0.32, y: 1.76, w: rw - 0.64, h: 0.30, margin: 0,
    fontFace: FJP, fontSize: 15, bold: true, color: INK,
  });
  bullets(s, [
    "個人会員：年会費 30万円／年",
    "入会・本人確認・請求はすべて当社が運用",
    "会員数は千人規模への拡大を計画",
  ], rx + 0.32, 2.12, rw - 0.64, 1.20, { size: 10.2, lineSpacing: 14, gap: 4 });

  card(s, rx, 3.62, rw, 2.12, { fill: NAVY });
  s.addText("ワイン100本のお預かりについて", {
    x: rx + 0.32, y: 3.78, w: rw - 0.64, h: 0.30, margin: 0,
    fontFace: FJP, fontSize: 14, bold: true, color: TAN_LT,
  });
  s.addText("ご自宅ワインのお預かりは、CLUBの標準特典ではありません。別プランとしてご案内しているもので、本ご提案では Program 06「ワイン預りサービス」として切り出しています。混同を避けるため、ここでは含めていません。", {
    x: rx + 0.32, y: 4.12, w: rw - 0.64, h: 1.50, margin: 0,
    fontFace: FJP, fontSize: 9.8, color: "DDE1E4", lineSpacing: 14,
  });

  s.addText("ヒルズ向けには、この通常プランをそのまま提供せず、次ページのとおりオーダーメイドさせていただきたく存じます。", {
    x: M, y: 5.90, w: 12.0, h: 0.28, margin: 0, fontFace: FJP, fontSize: 10, bold: true, color: TAN_D,
  });
}

/* ============================ 9b. Hills WineBank CLUB ============================ */
{
  const s = slide("PROGRAM 03-B", "Hills WineBank CLUB ─ ヒルズ向けのオーダーメイド",
    "通常のCLUBをそのまま持ち込むのではなく、館内で完結する特典に組み替えます。名称・ブランディングは森ビル様とご相談させてください。");

  const rows = [
    ["項目", "通常の WineBank CLUB", "Hills WineBank CLUB（ご提案）"],
    ["対象", "一般個人", "ヒルズのテナント法人・レジデンス居住者"],
    ["年会費", "30万円／年", "ヒルズ枠として特別設定。法人は人数枠課金"],
    ["飲食特典", "グループ飲食店 20%OFF", "グループ店に加え、館内の対象店を追加"],
    ["コルケージ", "提携26店舗へのBYO無料", "館内対象店を追加。会食先への事前配送込み"],
    ["配送", "月3回無料", "館内ストレージ開設後は即日・回数を拡大"],
    ["ワイン購入", "ネット最安値水準", "Cloud Wine Cave を卸値×1.1〜1.3で利用"],
    ["受渡し", "自宅・会食先へ配送", "住宅棟共用部のプライベートセラーで受渡し"],
    ["入会窓口", "当社EC・会員紹介", "レジデンスコンシェルジュ／テナント総務経由"],
  ];
  const colW = [1.46, 2.86, 3.72];
  const tW = colW.reduce((a, b) => a + b, 0);
  s.addTable(rows, {
    x: M, y: 1.60, w: tW, colW,
    border: { type: "solid", color: LINE, pt: 0.75 },
    fontFace: FJP, fontSize: 9.6, color: INK, valign: "middle", rowH: 0.46,
    autoPage: false,
  });
  s.addShape(pres.ShapeType.rect, {
    x: M, y: 1.60, w: tW, h: 0.46, fill: { color: NAVY }, line: { width: 0 },
  });
  let hx = M;
  rows[0].forEach((hstr, i) => {
    s.addText(hstr, {
      x: hx + 0.12, y: 1.60, w: colW[i] - 0.24, h: 0.46, margin: 0, valign: "middle",
      fontFace: FJP, fontSize: 9.6, bold: true, color: TAN_LT,
    });
    hx += colW[i];
  });

  const rx = M + tW + 0.34;
  const rw = W - M - rx;
  card(s, rx, 1.60, rw, 2.06, { fill: MIST });
  s.addText("オーダーメイドの考え方", {
    x: rx + 0.30, y: 1.74, w: rw - 0.60, h: 0.28, margin: 0,
    fontFace: FJP, fontSize: 13, bold: true, color: INK,
  });
  bullets(s, [
    "Hills Club・アカデミーヒルズ等の既存会員組織と機能が重複しない設計にする",
    "特典は「館内で完結するもの」を優先する",
    "テナント法人は総務経由の一括契約とし、個人手続きを増やさない",
  ], rx + 0.30, 2.06, rw - 0.60, 1.50, { size: 9.8, lineSpacing: 13.5, gap: 6 });

  card(s, rx, 3.84, rw, 1.72, { fill: NAVY });
  s.addText("通常CLUBとの切り分け", {
    x: rx + 0.30, y: 3.98, w: rw - 0.60, h: 0.28, margin: 0,
    fontFace: FJP, fontSize: 13, bold: true, color: TAN_LT,
  });
  s.addText("ワイン100本のお預かりは、CLUBの標準特典ではなく Program 06「ワイン預りサービス」として切り出しています。混同を避けるため、Hills版では預り枠の有無・本数・料金を個別に設計します。", {
    x: rx + 0.30, y: 4.30, w: rw - 0.60, h: 1.06, margin: 0,
    fontFace: FJP, fontSize: 9.8, color: "DDE1E4", lineSpacing: 14,
  });

  s.addText("年会費・特典水準は、対象人数と館内対象店の範囲が決まった段階で確定させていただきます。会員特典の相当額の考え方は Appendix に記載しています。", {
    x: M, y: 5.86, w: 12.0, h: 0.30, margin: 0, fontFace: FJP, fontSize: 9.6, color: GREY,
  });
}

/* ============================ 10. フードホール出店 ============================ */
{
  const s = slide("PROGRAM 04", "クラウドワインセラー出店（商業区画）",
    "『大型ウォークインワインセラーを目玉とした、セラー在庫共有型フードホール』。Cloud Wine Caveを、街の風景として可視化します。");

  const pts = [
    { n: "01", t: "360度の大型ウォークインセラー", d: "数千本規模のセラーが全区画からの借景となり、他にない空間体験を生む。" },
    { n: "02", t: "在庫はセラーが持つ", d: "各店は在庫を抱えず、必要な分を卸値〜ネット最安値で即時購入。CFが劇的に改善。" },
    { n: "03", t: "回遊通路で施設全体へ", d: "セラーを囲む回遊動線が滞在時間を延ばし、隣接区画への送客を生む。" },
  ];
  const pw = (W - M * 2 - 0.30 * 2) / 3;
  pts.forEach((p, i) => {
    const x = M + i * (pw + 0.30);
    card(s, x, 1.62, pw, 1.74);
    num(s, x + 0.26, 1.84, 0.44, p.n);
    s.addText(p.t, {
      x: x + 0.80, y: 1.80, w: pw - 1.06, h: 0.52, margin: 0, valign: "middle",
      fontFace: FJP, fontSize: 12.5, bold: true, color: INK,
    });
    s.addText(p.d, {
      x: x + 0.26, y: 2.44, w: pw - 0.52, h: 0.72, margin: 0,
      fontFace: FJP, fontSize: 10, color: INK, lineSpacing: 14,
    });
  });

  head(s, "三者にとってのWin", M, 3.56, 5.0);
  const wins = [
    { h: "出店者", b: ["卸値〜最安値で即時仕入", "店内在庫・セラー設備が不要", "大型セラーが自店の借景に"], dark: false },
    { h: "商業施設（森ビル様）", b: ["前例のない話題性と施設イメージ向上", "出店誘致が容易になり、賃料・保証金の引上げ余地", "施設全体・レジデンスへも卸値供給"], dark: true },
    { h: "来館者・居住者", b: ["数千本から選べる圧倒的な品揃え", "専門店価格でグラス・ボトルを楽しめる", "その場で購入し、自宅へ配送も可能"], dark: false },
  ];
  const ww = (W - M * 2 - 0.30 * 2) / 3;
  wins.forEach((w2, i) => {
    const x = M + i * (ww + 0.30);
    card(s, x, 3.94, ww, 1.80, { fill: w2.dark ? NAVY : MIST });
    s.addText(w2.h, {
      x: x + 0.28, y: 4.10, w: ww - 0.56, h: 0.30, margin: 0,
      fontFace: FJP, fontSize: 13, bold: true, color: w2.dark ? TAN_LT : TAN_D,
    });
    bullets(s, w2.b, x + 0.28, 4.46, ww - 0.56, 1.18,
      { size: 9.8, lineSpacing: 13.5, gap: 3, color: w2.dark ? "E3E6E8" : INK });
  });

  s.addText("想定規模：セラー約30坪 ＋ 飲食区画約100坪（日比谷ミッドタウン地下1階フードホール、虎ノ門横丁の客単価・区画割りを参照）。取扱いはワインに限らず酒類全般。", {
    x: M, y: 5.90, w: 12.0, h: 0.30, margin: 0, fontFace: FJP, fontSize: 8.8, color: GREY_LT,
  });
}

/* ============================ 11. ティエリー・マルクス ============================ */
{
  const s = slide("PROGRAM 05", "ティエリー・マルクス業態の出店",
    "ミシュラン累計7つ星・レジオン・ドヌール勲章受章のシェフによる日本再進出業態を、ヒルズの商業区画へ。");

  card(s, M, 1.60, 5.92, 4.52, { fill: NAVY });
  s.addText("THIERRY MARX", {
    x: M + 0.36, y: 1.80, w: 5.2, h: 0.36, margin: 0,
    fontFace: FEN, fontSize: 20, bold: true, color: TAN_LT, charSpacing: 1.8,
  });
  s.addText("ミシュラン星請負人。同世代のシェフの中でも最も注目を集める一人。", {
    x: M + 0.36, y: 2.18, w: 5.2, h: 0.30, margin: 0,
    fontFace: FJP, fontSize: 10.5, color: "B9BEC2",
  });
  bullets(s, [
    "1999年 ルレ・エ・シャトー「コーディヤン・バージュ」でミシュラン2つ星",
    "2010年 マンダリン オリエンタル パリでミシュラン2つ星",
    "2006年 ゴー・エ・ミヨ シェフ・オブ・ザ・イヤー",
    "2013年 フランス レジオン・ドヌール勲章 受章",
    "2022年 ミシュランガイド 年間ベストメンター",
    "2023年 パリ8区サントノーレに「オノール」オープン",
  ], M + 0.36, 2.62, 5.20, 2.52, { size: 10.2, lineSpacing: 17, gap: 9, color: "E3E6E8" });
  s.addText("大手TV局との連携により、開業時の露出を確保。国内外の富裕層・メディアを街区に呼び込みます。", {
    x: M + 0.36, y: 5.32, w: 5.20, h: 0.56, margin: 0,
    fontFace: FJP, fontSize: 10.5, bold: true, color: TAN, lineSpacing: 15,
  });

  const rx = M + 6.24;
  const rw = W - M - rx;
  head(s, "出店フォーマット（ご相談のたたき台）", rx, 1.60, rw, { size: 15 });
  const fmts = [
    ["グランメゾン", "40〜60席・客単価3〜5万円。街区のフラッグシップとして。"],
    ["ブラッスリー／ビストロ", "60〜90席・客単価1.5〜2万円。ワーカーの日常会食を取り込む。"],
    ["ベーカリー＆カフェ", "20〜40坪。朝夕の生活動線を押さえ、居住者の日常接点に。"],
  ];
  fmts.forEach((f, i) => {
    const y = 2.06 + i * 0.94;
    card(s, rx, y, rw, 0.80);
    s.addText(f[0], {
      x: rx + 0.28, y: y + 0.08, w: 2.4, h: 0.28, margin: 0,
      fontFace: FJP, fontSize: 12.5, bold: true, color: TAN_D,
    });
    s.addText(f[1], {
      x: rx + 0.28, y: y + 0.36, w: rw - 0.56, h: 0.30, margin: 0,
      fontFace: FJP, fontSize: 9.8, color: GREY,
    });
  });

  card(s, rx, 4.92, rw, 1.20, { fill: PAPER, line: LINE });
  s.addText("運営体制の裏付け", {
    x: rx + 0.28, y: 5.06, w: rw - 0.56, h: 0.28, margin: 0,
    fontFace: FJP, fontSize: 12.5, bold: true, color: INK,
  });
  s.addText("創業41年のグランメゾン「アピシウス」を2024年6月に100%株式取得。ミシュラン掲載、World of Fine Wine 3つ星を5年連続。グランメゾンを実際に運営している事業者として出店いたします。", {
    x: rx + 0.28, y: 5.36, w: rw - 0.56, h: 0.62, margin: 0,
    fontFace: FJP, fontSize: 9.6, color: INK, lineSpacing: 13.5,
  });
}

/* ============================ 12. ワイン預りサービス ============================ */
{
  const s = slide("PROGRAM 06", "居住者向け ワイン預りサービス（預り料要検討）",
    "Cloud Wine Caveの逆方向のサービスです。ご自宅のセラーは、いずれ必ず満杯になります。");

  const steps = [
    ["01", "お引き取り", "現在の保管先・ご自宅へ伺い、全ボトルを回収。ヒルズ館内からの搬出も当社が対応。"],
    ["02", "撮影・登録・一覧化", "全ボトルを撮影しリスト化。何を何本持っているかが、アプリでいつでも分かる。"],
    ["03", "定温保管", "14℃・湿度70%、24時間365日の温度監視。東日本大震災でも破損実績ゼロの専門倉庫。"],
    ["04", "出庫・ご配送", "回数無制限。ご自宅・会食先・贈答先へ。都心はWineGOで当日配送も可能。"],
  ];
  const sw = (W - M * 2 - 0.32 * 3) / 4;
  steps.forEach((st, i) => {
    const x = M + i * (sw + 0.32);
    card(s, x, 1.62, sw, 2.30);
    num(s, x + 0.28, 1.84, 0.46, st[0]);
    s.addText(st[1], {
      x: x + 0.28, y: 2.42, w: sw - 0.56, h: 0.34, margin: 0,
      fontFace: FJP, fontSize: 13, bold: true, color: INK,
    });
    s.addText(st[2], {
      x: x + 0.28, y: 2.82, w: sw - 0.56, h: 0.94, margin: 0,
      fontFace: FJP, fontSize: 9.8, color: INK, lineSpacing: 13.5,
    });
  });

  card(s, M, 4.14, 6.06, 1.62, { fill: MIST });
  s.addText("安心の担保", {
    x: M + 0.30, y: 4.30, w: 5.4, h: 0.30, margin: 0,
    fontFace: FJP, fontSize: 14, bold: true, color: TAN_D,
  });
  bullets(s, [
    "動産保険の付保（事業者責による破損は全額補償）",
    "正規ルート仕入と真贋保証、プロヴナンス管理",
    "セキュリティ・補助電源完備の専門倉庫（都内2か所）",
  ], M + 0.30, 4.66, 5.44, 1.02, { size: 10.2, lineSpacing: 14, gap: 3 });

  card(s, M + 6.42, 4.14, 6.06, 1.62, { fill: NAVY });
  s.addText("レジデンス向けオプション", {
    x: M + 6.72, y: 4.30, w: 5.4, h: 0.30, margin: 0,
    fontFace: FJP, fontSize: 14, bold: true, color: TAN_LT,
  });
  bullets(s, [
    "居住者は100本まで保管料無料枠を付帯（101本目以降 月100円／本）",
    "住宅棟共用部に「プライベートセラー」を設置し、館内で受渡し",
    "ご入居・ご退去時の一括引取／一括納品にも対応",
  ], M + 6.72, 4.66, 5.44, 1.02, { size: 10.2, lineSpacing: 14, gap: 3, color: "E3E6E8" });

  s.addText("預けたワインはCloud Wine Caveの画面から一元で確認でき、当社の在庫と同じ操作で出庫できます。", {
    x: M, y: 5.92, w: 12.0, h: 0.30, margin: 0, fontFace: FJP, fontSize: 10, color: GREY,
  });
}

/* ============================ 13. ポジショニング ============================ */
{
  const s = slide("POSITIONING", "「日常で使える」ことが、この提案のすべてです",
    "NOT A HOTELが別荘を「投資」と言わずに売り切ったように、私たちも会員権を「使えるもの」として提案します。");

  // 2x2 map
  const gx = M, gy = 1.66, gw = 6.60, gh = 4.10;
  s.addShape(pres.ShapeType.rect, { x: gx, y: gy, w: gw, h: gh, fill: { color: MIST }, line: { width: 0 } });
  s.addShape(pres.ShapeType.line, { x: gx, y: gy + gh / 2, w: gw, h: 0, line: { color: "CDD1D4", width: 1 } });
  s.addShape(pres.ShapeType.line, { x: gx + gw / 2, y: gy, w: 0, h: gh, line: { color: "CDD1D4", width: 1 } });

  s.addText("非日常（年に数回）", {
    x: gx + 0.14, y: gy + 0.12, w: 2.8, h: 0.24, margin: 0,
    fontFace: FJP, fontSize: 9.5, color: GREY_LT,
  });
  s.addText("日常（毎週）", {
    x: gx + gw / 2 + 0.14, y: gy + 0.12, w: 2.8, h: 0.24, margin: 0,
    fontFace: FJP, fontSize: 9.5, color: GREY_LT,
  });
  s.addText("使うと、消える", {
    x: gx + 0.14, y: gy + gh - 0.34, w: 2.8, h: 0.24, margin: 0,
    fontFace: FJP, fontSize: 9.5, color: GREY_LT,
  });
  s.addText("使わなければ、手元に残る", {
    x: gx + 0.14, y: gy + 0.44, w: 3.0, h: 0.24, margin: 0,
    fontFace: FJP, fontSize: 9.5, color: GREY_LT,
  });

  const plots = [
    { t: "高級時計・アート", x: gx + 1.10, y: gy + 1.02, tone: "chip" },
    { t: "NOT A HOTEL", x: gx + 1.10, y: gy + 1.62, tone: "chip" },
    { t: "リゾート・ゴルフ会員権", x: gx + 0.90, y: gy + 2.86, tone: "chip" },
    { t: "レストラン接待（現状）", x: gx + gw / 2 + 0.50, y: gy + 3.10, tone: "chip" },
  ];
  const txtW = (t) => 0.32 + [...t].reduce((a, c) => a + (c.charCodeAt(0) < 128 ? 0.058 : 0.118), 0);
  plots.forEach((p) => {
    const wch = txtW(p.t);
    s.addShape(pres.ShapeType.roundRect, {
      x: p.x, y: p.y, w: wch, h: 0.34, rectRadius: 0.05,
      fill: { color: PAPER }, line: { color: "CDD1D4", width: 1 },
    });
    s.addText(p.t, {
      x: p.x, y: p.y, w: wch, h: 0.34, margin: 0, align: "center", valign: "middle",
      fontFace: FJP, fontSize: 9.5, color: GREY,
    });
  });
  s.addShape(pres.ShapeType.roundRect, {
    x: gx + gw / 2 + 0.46, y: gy + 1.20, w: 2.70, h: 0.62, rectRadius: 0.05,
    fill: { color: NAVY }, line: { width: 0 },
  });
  s.addText("WineBank\nヒルズ会員", {
    x: gx + gw / 2 + 0.46, y: gy + 1.20, w: 2.70, h: 0.62, margin: 0, align: "center", valign: "middle",
    fontFace: FJP, fontSize: 12, bold: true, color: TAN_LT, lineSpacing: 15,
  });

  const rx = M + 7.06;
  const rw = W - M - rx;
  const points = [
    { n: "01", t: "会食のたびに、得をする", d: "コルケージ無料と卸値仕入。市価の2〜3倍を払う店内価格から解放されます。" },
    { n: "02", t: "飲まなければ、手元に残る", d: "使わなかった分は現物のワインとして定温倉庫に残り、いつでも出庫・贈答できます。" },
    { n: "03", t: "世界観が先、価格が後", d: "セラーと名店の体験を先に見ていただく。会員権は、その体験への入口として提示します。" },
  ];
  points.forEach((p, i) => {
    const y = 1.66 + i * 1.42;
    card(s, rx, y, rw, 1.26, { fill: i === 0 ? NAVY : MIST });
    const dark = i === 0;
    num(s, rx + 0.28, y + 0.22, 0.44, p.n);
    s.addText(p.t, {
      x: rx + 0.84, y: y + 0.20, w: rw - 1.12, h: 0.46, margin: 0, valign: "middle",
      fontFace: FJP, fontSize: 13, bold: true, color: dark ? TAN_LT : INK,
    });
    s.addText(p.d, {
      x: rx + 0.28, y: y + 0.72, w: rw - 0.56, h: 0.46, margin: 0,
      fontFace: FJP, fontSize: 9.8, color: dark ? "E3E6E8" : GREY, lineSpacing: 13.5,
    });
  });
  s.addText("※ NOT A HOTELの事例は同社公表資料に基づく当社整理です。", {
    x: rx, y: 5.94, w: rw, h: 0.28, margin: 0, fontFace: FJP, fontSize: 8.6, color: GREY_LT,
  });
}

/* ============================ 14. 森ビル様にとっての価値 ============================ */
{
  const s = slide("VALUE", "森ビル様にとっての価値",
    "単発のテナント誘致ではなく、街区の「体験の質」と「収益源」を同時に増やすご提案です。");

  const quad = [
    { t: "テナント飲食店の収益性", d: "ワイン在庫の資金拘束とセラー投資が消え、原価が下がります。店の利益率が上がることは、賃料負担力に直結します。", k: "テナント売上／退店率" },
    { t: "ワーカー・居住者の満足", d: "接待コストの実質削減と、居住者の生活の質。数字で語れる福利厚生であり、更新・定着の理由になります。", k: "会員加入率／契約更新率" },
    { t: "街のブランドと話題性", d: "数千本のウォークインセラーとミシュランシェフ。国内外のメディア露出と、海外富裕層の来街動機をつくります。", k: "メディア露出／来館者数" },
    { t: "新規収益", d: "会費・売上のレベニューシェア、賃料＋歩合、送客手数料。森ビル様の追加投資を伴わない収益源です。", k: "レベニューシェア収入" },
  ];
  const cw = (W - M * 2 - 0.32) / 2;
  const chh = 1.88;
  quad.forEach((q, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = M + col * (cw + 0.32);
    const y = 1.60 + row * (chh + 0.26);
    card(s, x, y, cw, chh, { fill: row === 0 ? MIST : PAPER, line: row === 1 ? LINE : null });
    s.addText(q.t, {
      x: x + 0.32, y: y + 0.20, w: cw - 0.64, h: 0.32, margin: 0,
      fontFace: FJP, fontSize: 16, bold: true, color: INK,
    });
    s.addText(q.d, {
      x: x + 0.32, y: y + 0.58, w: cw - 0.64, h: 0.78, margin: 0,
      fontFace: FJP, fontSize: 10.6, color: INK, lineSpacing: 15,
    });
    s.addText("主要KPI：" + q.k, {
      x: x + 0.32, y: y + chh - 0.44, w: cw - 0.64, h: 0.28, margin: 0,
      fontFace: FJP, fontSize: 9.6, bold: true, color: TAN_D,
    });
  });

  band(s, 5.68, "森ビル様に新たな設備投資・人員配置をお願いしない設計。運営・与信・在庫リスクは当社が保有します。", { h: 0.50, size: 13 });
}

/* ============================ 14b. 森ビル様へのご相談事項 ============================ */
{
  const s = slide("REQUEST", "森ビル様へご相談させていただきたいこと",
    "当社が負担するものと、森ビル様にお願いしたいものを整理しました。①がこのご提案の成否を決めます。");

  const asks = [
    {
      t: "館内ワインストレージのご提供", pri: "最重要",
      ask: "街区内に定温のワイン保管スペース（15〜30坪）をご用意いただきたく存じます。",
      ours: "定温設備・什器・在庫（数千〜1万本）・常駐スタッフ・運営はすべて当社が負担します。在庫リスクも当社が保有します。",
      dark: true,
    },
    {
      t: "テナント飲食店へのご紹介", pri: "",
      ask: "Cloud Wine Cave と置きワインの導入について、対象店へのお取り次ぎをお願いしたく存じます。",
      ours: "提案・与信審査・導入運用・アフターは当社が行います。森ビル様に営業の実務は発生しません。",
      dark: false,
    },
    {
      t: "館内動線・搬入の運用ご調整", pri: "",
      ask: "配送スタッフの館内動線、荷捌き場の使用、夜間帯の出入りについてご調整をお願いします。",
      ours: "車両・スタッフ・保険・温度管理はすべて当社側で手配します。",
      dark: false,
    },
    {
      t: "居住者・テナント法人へのご案内", pri: "",
      ask: "レジデンスコンシェルジュおよびテナント総務経由での告知導線をお願いしたく存じます。",
      ours: "入会受付・本人確認・請求・問い合わせ対応は当社が一括で運用します。",
      dark: false,
    },
  ];

  const cw = (W - M * 2 - 0.28) / 2;
  const chh = 2.24;
  asks.forEach((a, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = M + col * (cw + 0.28);
    const y = 1.60 + row * (chh + 0.24);
    card(s, x, y, cw, chh, { fill: a.dark ? NAVY : MIST });
    s.addText(`0${i + 1}`, {
      x: x + 0.30, y: y + 0.20, w: 0.60, h: 0.28, margin: 0,
      fontFace: FEN, fontSize: 12, bold: true, color: TAN,
    });
    s.addText(a.t, {
      x: x + 0.86, y: y + 0.18, w: cw - 2.00, h: 0.32, margin: 0,
      fontFace: FJP, fontSize: 15, bold: true, color: a.dark ? PAPER : INK,
    });
    if (a.pri) {
      s.addShape(pres.ShapeType.roundRect, {
        x: x + cw - 1.06, y: y + 0.18, w: 0.80, h: 0.28, rectRadius: 0.03,
        fill: { color: TAN }, line: { width: 0 },
      });
      s.addText(a.pri, {
        x: x + cw - 1.06, y: y + 0.18, w: 0.80, h: 0.28, margin: 0, align: "center", valign: "middle",
        fontFace: FJP, fontSize: 8.5, bold: true, color: PAPER,
      });
    }
    s.addText("お願いしたいこと", {
      x: x + 0.30, y: y + 0.62, w: cw - 0.60, h: 0.24, margin: 0,
      fontFace: FJP, fontSize: 9.2, bold: true, color: a.dark ? TAN : TAN_D,
    });
    s.addText(a.ask, {
      x: x + 0.30, y: y + 0.86, w: cw - 0.60, h: 0.48, margin: 0,
      fontFace: FJP, fontSize: 10.2, color: a.dark ? PAPER : INK, lineSpacing: 14,
    });
    s.addText("当社が負担するもの", {
      x: x + 0.30, y: y + 1.40, w: cw - 0.60, h: 0.24, margin: 0,
      fontFace: FJP, fontSize: 9.2, bold: true, color: a.dark ? TAN : TAN_D,
    });
    s.addText(a.ours, {
      x: x + 0.30, y: y + 1.64, w: cw - 0.60, h: 0.52, margin: 0,
      fontFace: FJP, fontSize: 9.8, color: a.dark ? "DDE1E4" : GREY, lineSpacing: 13.5,
    });
  });

  s.addText("①以外は、既存の館内オペレーションの中でご対応いただける範囲を想定しています。①については次ページで経済性を整理しました。", {
    x: M, y: 6.42, w: 12.0, h: 0.30, margin: 0, fontFace: FJP, fontSize: 10, color: GREY,
  });
}

/* ============================ 14c. 館内ワインストレージ ============================ */
{
  const s = slide("REQUEST 01", "館内ワインストレージの共同開設をご相談させてください",
    "場所を森ビル様に、在庫と運営を当社に。この分担が、館内の飲食テナントとレジデンスの体験を一段変えます。");

  // before / after speed
  const speed = [
    { h: "現状（当社倉庫からの配送）", v: "前日午前中のご注文で 翌日着", dark: false },
    { h: "館内ストレージ開設後", v: "即日・最短5分", dark: true },
  ];
  speed.forEach((sp, i) => {
    const x = M + i * 3.30;
    card(s, x, 1.58, 3.10, 0.94, { fill: sp.dark ? NAVY : MIST });
    s.addText(sp.h, {
      x: x + 0.26, y: 1.66, w: 2.58, h: 0.26, margin: 0,
      fontFace: FJP, fontSize: 9.4, color: sp.dark ? TAN_LT : GREY,
    });
    s.addText(sp.v, {
      x: x + 0.26, y: 1.94, w: 2.58, h: 0.44, margin: 0,
      fontFace: FJP, fontSize: sp.dark ? 17 : 13, bold: true, color: sp.dark ? PAPER : INK,
    });
  });
  s.addText("「今夜あと一本」に応えられるかどうかが、高級店にとっての価値の分かれ目になります。", {
    x: M + 6.90, y: 1.58, w: 5.20, h: 0.94, margin: 0, valign: "middle",
    fontFace: FJP, fontSize: 11.5, bold: true, color: TAN_D, lineSpacing: 17,
  });

  head(s, "投資が回収される循環", M, 2.72, 5.0);
  const loop = [
    ["飲食店", "店内のワインセラーを縮小できる。高級店では一般に3〜8坪を占めています。"],
    ["飲食店", "空いた面積を客席や厨房に転用し、売上を伸ばせる。"],
    ["飲食店 → 森ビル様", "その対価として、館内ストレージの利用料をお支払いいただく。"],
    ["森ビル様", "区画から利用料収入が立ち、開設費の回収見通しが持てる。"],
    ["当社", "在庫と配送スタッフを常駐させ、館内へ即日で届ける。"],
    ["飲食店", "在庫を持たないまま品揃えが厚くなり、客単価が上がる。"],
  ];
  loop.forEach((l, i) => {
    const y = 3.10 + i * 0.53;
    s.addText(String(i + 1), {
      x: M, y, w: 0.30, h: 0.26, margin: 0,
      fontFace: FEN, fontSize: 10.5, bold: true, color: TAN,
    });
    s.addText(l[0], {
      x: M + 0.34, y, w: 1.62, h: 0.26, margin: 0,
      fontFace: FJP, fontSize: 10, bold: true, color: INK,
    });
    s.addText(l[1], {
      x: M + 2.00, y, w: 4.52, h: 0.44, margin: 0,
      fontFace: FJP, fontSize: 9.8, color: GREY, lineSpacing: 13.5,
    });
  });

  const rx = M + 6.90;
  const rw = W - M - rx;
  card(s, rx, 2.72, rw, 2.28, { fill: MIST });
  s.addText("負担の切り分け", {
    x: rx + 0.30, y: 2.86, w: rw - 0.60, h: 0.28, margin: 0,
    fontFace: FJP, fontSize: 13, bold: true, color: INK,
  });
  const split = [
    ["場所（15〜30坪）", "森ビル様"],
    ["定温設備・什器", "当社"],
    ["ワイン在庫（数千〜1万本）", "当社"],
    ["常駐スタッフ・配送", "当社"],
    ["在庫リスク・劣化・破損", "当社"],
  ];
  split.forEach((sp, i) => {
    const y = 3.22 + i * 0.34;
    s.addText(sp[0], {
      x: rx + 0.30, y, w: 3.20, h: 0.28, margin: 0, valign: "middle",
      fontFace: FJP, fontSize: 9.8, color: INK,
    });
    s.addText(sp[1], {
      x: rx + 3.56, y, w: 1.30, h: 0.28, margin: 0, valign: "middle",
      fontFace: FJP, fontSize: 9.8, bold: true, color: sp[1] === "森ビル様" ? TAN_D : GREY,
    });
    if (i < split.length - 1) {
      s.addShape(pres.ShapeType.line, {
        x: rx + 0.30, y: y + 0.31, w: rw - 0.60, h: 0, line: { color: "E4E6E8", width: 1 },
      });
    }
  });

  card(s, rx, 5.18, rw, 1.52, { fill: NAVY });
  s.addText("テナント利用が想定に届かない場合", {
    x: rx + 0.30, y: 5.32, w: rw - 0.60, h: 0.28, margin: 0,
    fontFace: FJP, fontSize: 12.5, bold: true, color: TAN_LT,
  });
  s.addText("当社が全量を活用します。レジデンス居住者向けの供給、館外への配送、EC出荷に転用できるため、稼働率のリスクは当社が引き取る形でご相談させてください。", {
    x: rx + 0.30, y: 5.62, w: rw - 0.60, h: 0.94, margin: 0,
    fontFace: FJP, fontSize: 9.8, color: "DDE1E4", lineSpacing: 14,
  });

  s.addText("※ セラー面積・席数の数値は一般的な高級飲食店を前提とした当社の目安です。実際の利用料水準・区画条件は個別にご相談させてください。", {
    x: M, y: 6.42, w: 6.60, h: 0.44, margin: 0, fontFace: FJP, fontSize: 8.6, color: GREY_LT, lineSpacing: 12,
  });
}

/* ============================ 14d. 差別化 ============================ */
{
  const s = slide("WHY WINEBANK", "ワインを供給するだけの相手なら、他にもいます",
    "在庫を並べるだけなら専門小売でも足ります。街区の中で回すには、配送・会員・飲食・保管まで自社で持っている必要があります。");

  const rows = [
    ["", "ワイン専門小売・インポーター", "WineBank"],
    ["正規品の在庫供給", "可能", "可能（管理在庫30億円・50万本）"],
    ["街区内への即日・即時配送", "対応していない", "WineGO により自社で実施"],
    ["在庫リスクの引受（消化仕入）", "限定的", "置きワインとして標準で提供"],
    ["会員基盤・課金の運用", "小売の会員制度まで", "CLUB として会費・特典・請求を運用"],
    ["レストランの運営", "行っていない", "グランメゾンを自社で運営"],
    ["シェフの招致", "行っていない", "ティエリー・マルクス業態を出店可能"],
    ["ワインの預り・保管", "行っていない", "都内2か所・動産保険付きで受託"],
    ["商業区画の企画", "テナント出店まで", "セラー在庫共有型フードホールを企画・運営"],
  ];
  const colW = [2.66, 2.60, 3.36];
  const tW = colW.reduce((a, b) => a + b, 0);
  s.addTable(rows, {
    x: M, y: 1.66, w: tW, colW,
    border: { type: "solid", color: LINE, pt: 0.75 },
    fontFace: FJP, fontSize: 9.8, color: INK, valign: "middle", rowH: 0.46,
    autoPage: false,
  });
  s.addShape(pres.ShapeType.rect, {
    x: M, y: 1.66, w: tW, h: 0.46, fill: { color: NAVY }, line: { width: 0 },
  });
  let hx = M;
  rows[0].forEach((hstr, i) => {
    s.addText(hstr, {
      x: hx + 0.12, y: 1.66, w: colW[i] - 0.24, h: 0.46, margin: 0, valign: "middle",
      fontFace: FJP, fontSize: 9.8, bold: true, color: TAN_LT,
    });
    hx += colW[i];
  });

  const rx = M + tW + 0.34;
  const rw = W - M - rx;
  card(s, rx, 1.66, rw, 2.30, { fill: NAVY });
  s.addText("この一枚で申し上げたいこと", {
    x: rx + 0.30, y: 1.82, w: rw - 0.60, h: 0.28, margin: 0,
    fontFace: FJP, fontSize: 13, bold: true, color: TAN_LT,
  });
  s.addText("館内ストレージをご用意いただいた先で、そこに置いた在庫を「動かす」手段を持っているかどうかが差になります。当社は配送・会員・飲食・保管を自社で持っているため、置いた在庫が滞留しません。", {
    x: rx + 0.30, y: 2.14, w: rw - 0.60, h: 1.70, margin: 0,
    fontFace: FJP, fontSize: 10, color: "DDE1E4", lineSpacing: 14.5,
  });

  card(s, rx, 4.10, rw, 2.16, { fill: MIST });
  s.addText("自社で持っているもの", {
    x: rx + 0.30, y: 4.24, w: rw - 0.60, h: 0.28, margin: 0,
    fontFace: FJP, fontSize: 13, bold: true, color: INK,
  });
  bullets(s, [
    "仕入：55年の酒販実績と輸出入免許",
    "保管：都内2か所の定温倉庫",
    "配送：WineGO の定温ラストワンマイル",
    "販売：EC・卸・会員制サロン",
    "飲食：グランメゾンの運営",
  ], rx + 0.30, 4.58, rw - 0.60, 1.58, { size: 9.4, lineSpacing: 13, gap: 3 });

  s.addText("※ 比較欄は一般的な高級ワイン専門小売・インポーターの事業範囲についての当社の理解です。特定の企業を指すものではありません。", {
    x: M, y: 6.44, w: tW, h: 0.30, margin: 0, fontFace: FJP, fontSize: 8.6, color: GREY_LT,
  });
}

/* ============================ 15. スキーム ============================ */
{
  const s = slide("SCHEME", "提携スキームと収益設計（たたき台）",
    "プログラムごとに役割と分配を切り分け、導入しやすいものから順に着手できる構成としています。");

  const rows = [
    ["プログラム", "収益源", "森ビル様の関与", "当社の関与", "分配イメージ"],
    ["01 Cloud Wine Cave", "ワイン卸売上", "テナント飲食店・居住者へのご紹介", "在庫保有・与信・システム・CS", "流通額に対するレベニューシェア"],
    ["02 WineGO デリバリー", "配送料・ワイン販売", "ターミナル区画（2〜5坪）", "在庫・配送員・システム一式", "区画賃料 ＋ 売上歩合"],
    ["03 WineBank CLUB", "年会費・購入手数料", "テナント・居住者への告知", "会員運用・請求・特典提供", "会費のレベニューシェア"],
    ["04 クラウドワインセラー", "飲食売上・卸売上", "商業区画の割当", "セラー投資・運営・出店者募集", "賃料 ＋ 売上歩合"],
    ["05 ティエリー・マルクス業態", "飲食売上", "商業区画の割当・共同PR", "シェフ招聘・店舗運営一切", "賃料 ＋ 売上歩合"],
    ["06 ワイン預りサービス", "保管料・出庫料", "居住者への案内・受渡し協力", "引取・撮影・保管・保険", "保管料のレベニューシェア"],
  ];
  const colW = [2.46, 2.10, 2.60, 2.60, 2.33];
  const tW = colW.reduce((a, b) => a + b, 0);
  s.addTable(rows, {
    x: M, y: 1.60, w: tW, colW,
    border: { type: "solid", color: LINE, pt: 0.75 },
    fontFace: FJP, fontSize: 9.5, color: INK, valign: "middle", rowH: 0.54,
    autoPage: false,
  });
  s.addShape(pres.ShapeType.rect, {
    x: M, y: 1.60, w: tW, h: 0.48, fill: { color: NAVY }, line: { width: 0 },
  });
  let hx = M;
  rows[0].forEach((hstr, i) => {
    s.addText(hstr, {
      x: hx + 0.12, y: 1.60, w: colW[i] - 0.24, h: 0.48, margin: 0, valign: "middle",
      fontFace: FJP, fontSize: 10, bold: true, color: TAN_LT,
    });
    hx += colW[i];
  });

  s.addText("※ 分配率・賃料条件は個別協議のうえ決定させていただきたく存じます。上表は議論の出発点としての整理です。", {
    x: M, y: 5.44, w: 12.0, h: 0.28, margin: 0, fontFace: FJP, fontSize: 9.4, color: GREY_LT,
  });
  s.addText("段階導入の考え方：まずは①②③（設備投資ほぼ不要・3〜4か月で開始可能） → 効果検証のうえ ④⑤（区画を伴う出店） → ⑥は③と同時に付帯", {
    x: M, y: 5.82, w: 12.0, h: 0.32, margin: 0, fontFace: FJP, fontSize: 10.8, bold: true, color: TAN_D,
  });
}

/* ============================ 16. 事業規模イメージ ============================ */
{
  const s = slide("SIZING", "事業規模イメージ（当社試算）",
    "森ビル様と共有すべき前提を明示したうえでの試算です。数値は今後のすり合わせで更新させていただきます。");

  head(s, "Cloud Wine Cave 導入店舗数（店）", M, 1.60, 4.2, { size: 13 });
  s.addChart(
    pres.ChartType.bar,
    [{ name: "導入店舗数", labels: ["Year 1", "Year 2", "Year 3"], values: [8, 20, 35] }],
    {
      x: M - 0.10, y: 1.94, w: 4.10, h: 2.80,
      barDir: "col", barGapWidthPct: 60,
      chartColors: [TAN],
      showValue: true, dataLabelPosition: "outEnd",
      dataLabelFontFace: FJP, dataLabelFontSize: 10, dataLabelColor: INK,
      showLegend: false, showTitle: false,
      catAxisLabelFontFace: FJP, catAxisLabelFontSize: 10, catAxisLabelColor: GREY,
      valAxisLabelFontFace: FJP, valAxisLabelFontSize: 9, valAxisLabelColor: GREY_LT,
      valGridLine: { color: "EDEEEF", size: 1 },
      catGridLine: { style: "none" },
      valAxisMinVal: 0, valAxisMaxVal: 40, valAxisMajorUnit: 10,
    }
  );

  head(s, "年間流通総額の想定（百万円）", M + 4.34, 1.60, 4.4, { size: 13 });
  s.addChart(
    pres.ChartType.bar,
    [
      { name: "Cloud Wine Cave・WineGO・CLUB", labels: ["Year 1", "Year 2", "Year 3"], values: [90, 240, 430] },
      { name: "クラウドワインセラー", labels: ["Year 1", "Year 2", "Year 3"], values: [null, 400, 450] },
      { name: "レストラン業態", labels: ["Year 1", "Year 2", "Year 3"], values: [null, null, 600] },
    ],
    {
      x: M + 4.24, y: 1.94, w: 4.30, h: 2.80,
      barDir: "col", barGrouping: "stacked", barGapWidthPct: 60,
      chartColors: [TAN, NAVY, "9AA1A6"],
      showValue: true, dataLabelPosition: "ctr",
      dataLabelFontFace: FJP, dataLabelFontSize: 9, dataLabelColor: "FFFFFF",
      showLegend: true, legendPos: "b", legendFontFace: FJP, legendFontSize: 8.5, legendColor: GREY,
      showTitle: false,
      catAxisLabelFontFace: FJP, catAxisLabelFontSize: 10, catAxisLabelColor: GREY,
      valAxisLabelFontFace: FJP, valAxisLabelFontSize: 9, valAxisLabelColor: GREY_LT,
      valGridLine: { color: "EDEEEF", size: 1 },
      catGridLine: { style: "none" },
    }
  );

  const ax = M + 8.86;
  const aw = W - M - ax;
  card(s, ax, 1.60, aw, 4.10);
  s.addText("試算の前提", {
    x: ax + 0.30, y: 1.78, w: aw - 0.60, h: 0.30, margin: 0,
    fontFace: FJP, fontSize: 14, bold: true, color: INK,
  });
  bullets(s, [
    "対象：主要ヒルズのテナント飲食店、オフィスワーカー、レジデンス居住者（規模は森ビル様公表値をもとに要確認）",
    "Cloud Wine Cave：1店あたり月商 80〜120万円を想定",
    "CLUB会員：Y1 200名 → Y3 1,000名、ARPU 年35万円",
    "クラウドワインセラー：Y2開業、年商4.0〜4.5億円",
    "レストラン業態：Y3開業、年商6.0億円",
    "森ビル様配分：流通総額の概ね10%前後（賃料・歩合・RS合算）",
  ], ax + 0.30, 2.16, aw - 0.60, 3.28, { size: 9.6, lineSpacing: 13.5, gap: 6 });

  const tiles = [
    ["35店", "Year 3 導入店舗数"],
    ["14.8億円", "Year 3 年間流通総額"],
    ["約1.5億円", "うち森ビル様配分（イメージ）"],
  ];
  const tw = (8.60 - 0.24 * 2) / 3;
  tiles.forEach((t, i) => {
    const x = M - 0.06 + i * (tw + 0.24);
    card(s, x, 5.02, tw, 0.78, { fill: NAVY });
    s.addText(t[0], {
      x: x + 0.22, y: 5.10, w: tw - 0.44, h: 0.34, margin: 0,
      fontFace: FJP, fontSize: 16, bold: true, color: TAN_LT,
    });
    s.addText(t[1], {
      x: x + 0.22, y: 5.46, w: tw - 0.44, h: 0.26, margin: 0,
      fontFace: FJP, fontSize: 8.6, color: "B9BEC2",
    });
  });

  s.addText("※ 上記は当社による試算であり、確定的な見通しではありません。母集団・転換率は森ビル様のデータをいただいたうえで精緻化させていただきます。", {
    x: M, y: 5.94, w: 12.0, h: 0.28, margin: 0, fontFace: FJP, fontSize: 8.8, color: GREY_LT,
  });
}

/* ============================ 17. ロードマップ ============================ */
{
  const s = slide("ROADMAP", "導入ロードマップ",
    "設備投資を伴わないプログラムから開始し、効果を確認しながら区画を伴う出店へ進みます。");

  const phases = [
    { p: "PHASE 0", t: "実証", items: ["1棟でのPoC実施", "テナント飲食店5店でCloud Wine Cave試験導入", "WineGO 館内配送テスト"], dark: false },
    { p: "PHASE 1", t: "本格展開", items: ["主要ヒルズへCloud Wine Cave展開", "CLUBヒルズ枠の募集開始", "レジデンス開放の是非を判断"], dark: false },
    { p: "PHASE 2", t: "区画出店", items: ["クラウドワインセラー区画の設計・工事", "出店者募集とセラー在庫の構築", "施設内テナントへの卸売拡大"], dark: true },
    { p: "PHASE 3", t: "街区の象徴へ", items: ["ティエリー・マルクス業態の出店", "他ヒルズ・海外物件への横展開", "国内外富裕層向けプログラム化"], dark: true },
  ];

  const pw = (W - M * 2 - 0.30 * 3) / 4;
  phases.forEach((ph, i) => {
    const x = M + i * (pw + 0.30);
    card(s, x, 1.68, pw, 3.36, { fill: ph.dark ? NAVY : MIST });
    s.addText(ph.p, {
      x: x + 0.30, y: 1.92, w: pw - 0.60, h: 0.26, margin: 0,
      fontFace: FEN, fontSize: 11, bold: true, color: TAN, charSpacing: 2,
    });
    s.addText(ph.t, {
      x: x + 0.30, y: 2.24, w: pw - 0.60, h: 0.48, margin: 0,
      fontFace: FJP, fontSize: 18, bold: true, color: ph.dark ? PAPER : INK,
    });
    bullets(s, ph.items, x + 0.30, 2.86, pw - 0.60, 1.90,
      { size: 10.4, lineSpacing: 16, gap: 9, color: ph.dark ? "E3E6E8" : INK });
  });

  const marks = ["0〜3か月", "3〜12か月", "12〜24か月", "24か月〜"];
  marks.forEach((m2, i) => {
    const x = M + i * (pw + 0.30);
    s.addText(m2, {
      x, y: 5.16, w: pw, h: 0.28, margin: 0, align: "center",
      fontFace: FJP, fontSize: 10, bold: true, color: GREY,
    });
  });

  s.addText("最短ケースでは、ご合意から約3か月でPHASE 0を開始できます（酒販免許・保管倉庫・配送体制・在庫は当社既存アセットを使用するため）。", {
    x: M, y: 5.72, w: 12.0, h: 0.32, margin: 0, fontFace: FJP, fontSize: 10.8, bold: true, color: TAN_D,
  });
}

/* ============================ 18. PoC ============================ */
{
  const s = slide("FIRST STEP", "まずは1棟で。3か月のPoCをご提案します",
    "大きな意思決定の前に、小さく確かめる。費用は当社が負担いたします。");

  card(s, M, 1.62, 3.58, 4.24, { fill: NAVY });
  s.addText("PoC の概要", {
    x: M + 0.32, y: 1.80, w: 3.0, h: 0.30, margin: 0,
    fontFace: FJP, fontSize: 15, bold: true, color: TAN_LT,
  });
  const facts = [
    ["対象", "麻布台ヒルズ または 六本木ヒルズ 1棟"],
    ["期間", "3か月"],
    ["対象者", "テナント飲食店5店／レジデンス居住者50世帯程度"],
    ["費用", "当社全額負担（森ビル様のご負担なし）"],
  ];
  facts.forEach((f, i) => {
    const y = 2.26 + i * 0.88;
    s.addText(f[0], {
      x: M + 0.32, y, w: 3.0, h: 0.24, margin: 0,
      fontFace: FJP, fontSize: 9.6, bold: true, color: TAN,
    });
    s.addText(f[1], {
      x: M + 0.32, y: y + 0.24, w: 3.0, h: 0.54, margin: 0,
      fontFace: FJP, fontSize: 11.5, color: PAPER, lineSpacing: 15,
    });
  });

  head(s, "実施内容", M + 3.94, 1.62, 4.4, { size: 15 });
  const acts = [
    ["01", "Cloud Wine Cave の試験導入", "テナント飲食店5店にリストとアプリを提供。発注から着荷までの実運用を検証。"],
    ["02", "館内デリバリーの実証", "バックヤードに仮設ターミナルを設置し、定温配送のリードタイムと運用負荷を計測。"],
    ["03", "居住者向け先行案内", "CLUB会員となった居住者に卸値×1.1〜1.3で開放し、需要と単価を確認。"],
  ];
  acts.forEach((a, i) => {
    const y = 2.04 + i * 1.30;
    card(s, M + 3.94, y, 4.38, 1.16);
    num(s, M + 4.18, y + 0.20, 0.42, a[0], { size: 10 });
    s.addText(a[1], {
      x: M + 4.72, y: y + 0.20, w: 3.44, h: 0.30, margin: 0,
      fontFace: FJP, fontSize: 11.5, bold: true, color: INK,
    });
    s.addText(a[2], {
      x: M + 4.22, y: y + 0.58, w: 3.90, h: 0.50, margin: 0,
      fontFace: FJP, fontSize: 9.4, color: GREY, lineSpacing: 13,
    });
  });

  const rx = M + 8.68;
  const rw = W - M - rx;
  card(s, rx, 1.62, rw, 2.04);
  s.addText("成功基準（案）", {
    x: rx + 0.30, y: 1.78, w: rw - 0.60, h: 0.28, margin: 0,
    fontFace: FJP, fontSize: 14, bold: true, color: TAN_D,
  });
  bullets(s, [
    "導入店の継続利用意向 80%以上",
    "1店あたり月10本以上の発注",
    "館内配送の平均リードタイム10分以内",
    "重大な運用インシデント ゼロ",
  ], rx + 0.30, 2.14, rw - 0.60, 1.38, { size: 10, lineSpacing: 14, gap: 4 });

  card(s, rx, 3.82, rw, 2.04, { fill: PAPER, line: LINE });
  s.addText("お願いしたいご協力", {
    x: rx + 0.30, y: 3.98, w: rw - 0.60, h: 0.28, margin: 0,
    fontFace: FJP, fontSize: 14, bold: true, color: TAN_D,
  });
  bullets(s, [
    "対象テナント・居住者へのご案内",
    "仮設ターミナル用スペース（2〜3坪）",
    "館内動線・搬入に関する運用ご調整",
    "実施後の効果検証への同席",
  ], rx + 0.30, 4.34, rw - 0.60, 1.38, { size: 10, lineSpacing: 14, gap: 4 });
}

/* ============================ 19. リスク・コンプライアンス ============================ */
{
  const s = slide("RISK", "品質・リスク管理とコンプライアンス",
    "高額かつ繊細な商材を街区で扱うにあたり、当社が負う責任と管理体制を明確にしています。");

  const risks = [
    { t: "偽造・真贋", r: "並行品・二次流通品に潜む真贋リスク", c: "国内外の正規取扱業者からのみ仕入れ。国家ソムリエ資格保持者による選定と、全ボトルのプロヴナンス管理。" },
    { t: "品質劣化", r: "輸送・保管中の温度変化による品質毀損", c: "14℃・湿度70%での定温定湿保管、24時間365日の温度監視。配送も高級ワインに適した定温帯で実施。" },
    { t: "破損・紛失", r: "保管中・配送中の事故", c: "動産保険を付保し、事業者責による破損は全額補償。委託倉庫は東日本大震災でも破損実績ゼロ、補助電源完備。" },
    { t: "法令遵守", r: "酒類販売業免許、未成年者飲酒防止", c: "当社が免許主体となり販売・配送を実施。年齢確認を配送時に徹底。広告表現は事前に法務レビューを実施。" },
    { t: "テナント配慮", r: "居住者向け開放による価格関係の影響", c: "居住者価格は飲食店向け卸値を下回らせない設計。段階開放とし、影響を検証しながら拡大します。" },
    { t: "個人情報", r: "テナント・居住者情報の取扱い", c: "会員情報は当社が管理主体となり、森ビル様からの個人情報のご提供を前提としない設計（申込は本人から直接）。" },
  ];

  const cw = (W - M * 2 - 0.30) / 2;
  const chh = 1.28;
  risks.forEach((rk, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = M + col * (cw + 0.30);
    const y = 1.60 + row * (chh + 0.22);
    card(s, x, y, cw, chh);
    s.addText(rk.t, {
      x: x + 0.28, y: y + 0.16, w: 1.9, h: 0.28, margin: 0,
      fontFace: FJP, fontSize: 13, bold: true, color: TAN_D,
    });
    s.addText(rk.r, {
      x: x + 2.22, y: y + 0.18, w: cw - 2.50, h: 0.26, margin: 0,
      fontFace: FJP, fontSize: 9.4, color: GREY,
    });
    s.addText(rk.c, {
      x: x + 0.28, y: y + 0.52, w: cw - 0.56, h: 0.64, margin: 0,
      fontFace: FJP, fontSize: 9.8, color: INK, lineSpacing: 13.5,
    });
  });

  s.addText("在庫・与信・配送・保管に関わるリスクは、原則としてすべて当社が保有します。", {
    x: M, y: 6.10, w: 12.0, h: 0.30, margin: 0, fontFace: FJP, fontSize: 10.8, bold: true, color: TAN_D,
  });
}

/* ============================ 20. クロージング ============================ */
{
  pageNo++;
  const s = pres.addSlide();
  s.background = { color: PAPER };
  logo(s);

  s.addText("ヒルズに、街の共有セラーを。", {
    x: M, y: 1.20, w: 11.0, h: 0.76, margin: 0,
    fontFace: FJP, fontSize: 34, bold: true, color: INK,
  });
  s.addShape(pres.ShapeType.rect, {
    x: M, y: 2.12, w: 1.30, h: 0.045, fill: { color: TAN }, line: { width: 0 },
  });
  s.addText("ワインを必要とする人が最も密度高く集まる街に、その在庫を置く。\n私たちは在庫も、仕入網も、シェフも、配送網も、すでに持っています。", {
    x: M, y: 2.34, w: 9.6, h: 0.80, margin: 0,
    fontFace: FJP, fontSize: 13.5, color: "44494D", lineSpacing: 24,
  });

  const reasons = [
    { n: "01", t: "すぐ始められる", d: "酒販免許・保管倉庫・配送体制・在庫は稼働中。新設が必要なものはほとんどありません。" },
    { n: "02", t: "森ビル様の負担が小さい", d: "設備投資・人員配置を前提としない設計。在庫・与信・運営リスクは当社が保有します。" },
    { n: "03", t: "テナントの利益になる", d: "在庫負担とワイン原価が下がる提案は、テナント飲食店にとって断る理由がありません。" },
  ];
  const cw = (W - M * 2 - 0.32 * 2) / 3;
  reasons.forEach((r, i) => {
    const x = M + i * (cw + 0.32);
    card(s, x, 3.50, cw, 1.86, { fill: i === 1 ? NAVY : MIST });
    const dark = i === 1;
    num(s, x + 0.30, 3.74, 0.46, r.n);
    s.addText(r.t, {
      x: x + 0.88, y: 3.72, w: cw - 1.16, h: 0.48, margin: 0, valign: "middle",
      fontFace: FJP, fontSize: 15, bold: true, color: dark ? TAN_LT : INK,
    });
    s.addText(r.d, {
      x: x + 0.30, y: 4.34, w: cw - 0.60, h: 0.86, margin: 0,
      fontFace: FJP, fontSize: 10.4, color: dark ? "E3E6E8" : GREY, lineSpacing: 14.5,
    });
  });

  s.addText("次のステップ", {
    x: M, y: 5.62, w: 3.0, h: 0.28, margin: 0,
    fontFace: FJP, fontSize: 12.5, bold: true, color: TAN_D,
  });
  s.addText("① 本提案のご説明とディスカッション　→　② 対象街区・対象プログラムの絞り込み　→　③ PoC条件の合意（目安：ご合意から3か月で開始）", {
    x: M, y: 5.94, w: 11.6, h: 0.32, margin: 0,
    fontFace: FJP, fontSize: 11.5, color: INK,
  });
  s.addText("株式会社WineBank　東京都港区六本木4-12-8 第6DMJビル2階　TEL 03-6416-9370", {
    x: M, y: 6.52, w: 9.0, h: 0.28, margin: 0, fontFace: FJP, fontSize: 10, color: GREY,
  });
  bar(s, true);
}

/* ============================ 21. Appendix 扉 ============================ */
{
  pageNo++;
  const s = pres.addSlide();
  s.background = { color: PAPER };
  logo(s);
  s.addText("APPENDIX", {
    x: 0, y: 3.06, w: W, h: 0.60, margin: 0, align: "center",
    fontFace: FEN, fontSize: 30, bold: true, color: INK, charSpacing: 2.4,
  });
  s.addShape(pres.ShapeType.rect, {
    x: (W - 0.80) / 2, y: 3.76, w: 0.80, h: 0.035, fill: { color: TAN }, line: { width: 0 },
  });
  s.addText("会社紹介（2026年6月）より抜粋", {
    x: 0, y: 3.94, w: W, h: 0.30, margin: 0, align: "center",
    fontFace: FJP, fontSize: 11, color: GREY,
  });
  bar(s, true);
}

/* ============================ 22-26. 会社紹介 p.3-7 をそのまま ============================ */
["03", "04", "05", "06", "07"].forEach((n) => {
  pageNo++;
  const s = pres.addSlide();
  s.background = { color: PAPER };
  s.addImage({ data: "image/jpeg;base64," + b64(`ap/page-${n}.jpg`), x: 0, y: 0, w: W, h: H });
});

/* ============================ 27. 価格構造 ============================ */
{
  const s = slide("APPENDIX", "なぜ、Cloud Wine Cave の価格が成立するのか",
    "ワイン流通は、生産者から消費者までに何段もの中間マージンが積み上がります。当社は最上流に立っています。");

  const baseY = 4.72;
  const maxH = 2.24;
  const bars = [
    { name: "インポーター\n仕入価格", v: 40, disp: "40", wb: true },
    { name: "酒販店①\n仕入価格", v: 60, disp: "60" },
    { name: "酒販店②\n仕入価格", v: 70, disp: "70" },
    { name: "一般消費者\n購入価格", v: 100, disp: "80〜100" },
    { name: "レストラン\n店頭価格", v: 300, disp: "150〜300", range: 150 },
  ];
  const bw = 1.62, gap = 0.62;
  const startX = (W - (bars.length * bw + (bars.length - 1) * gap)) / 2;

  card(s, M, 1.62, 7.20, 1.28);
  s.addText("最上流に立てる理由", {
    x: M + 0.30, y: 1.76, w: 6.6, h: 0.28, margin: 0,
    fontFace: FJP, fontSize: 13, bold: true, color: INK,
  });
  bullets(s, [
    "創業55年の酒販業実績による、生産者・インポーターとの信頼とパイプ",
    "国内大手インポーターとの直接取引による特価・正規品仕入",
    "海外輸出入ライセンスを活かした独自の仕入ネットワークと情報収集",
  ], M + 0.30, 2.10, 6.60, 0.70, { size: 9.8, lineSpacing: 13, gap: 2 });

  s.addShape(pres.ShapeType.line, {
    x: startX - 0.30, y: baseY, w: bars.length * bw + (bars.length - 1) * gap + 0.60, h: 0,
    line: { color: LINE, width: 1 },
  });

  bars.forEach((b, i) => {
    const x = startX + i * (bw + gap);
    const h = (b.v / 300) * maxH;
    if (b.range) {
      const hLow = (b.range / 300) * maxH;
      s.addShape(pres.ShapeType.rect, {
        x, y: baseY - h, w: bw, h: h - hLow,
        fill: { color: NAVY, transparency: 55 }, line: { width: 0 },
      });
      s.addShape(pres.ShapeType.rect, {
        x, y: baseY - hLow, w: bw, h: hLow,
        fill: { color: NAVY }, line: { width: 0 },
      });
    } else {
      s.addShape(pres.ShapeType.rect, {
        x, y: baseY - h, w: bw, h,
        fill: { color: b.wb ? TAN : "9AA1A6" }, line: { width: 0 },
      });
    }
    s.addText(b.disp, {
      x, y: baseY - h - 0.38, w: bw, h: 0.32, margin: 0, align: "center",
      fontFace: FJP, fontSize: 15, bold: true, color: b.wb ? TAN_D : INK,
    });
    s.addText(b.name, {
      x, y: baseY + 0.10, w: bw, h: 0.50, margin: 0, align: "center",
      fontFace: FJP, fontSize: 10, color: GREY, lineSpacing: 13.5,
    });
    if (b.wb) {
      s.addText("WineBank はここ", {
        x: x - 0.20, y: baseY - h - 0.74, w: bw + 0.40, h: 0.30, margin: 0, align: "center",
        fontFace: FJP, fontSize: 11, bold: true, color: TAN_D,
      });
    }
  });

  card(s, M, 5.46, W - M * 2, 1.02, { fill: NAVY });
  s.addText("レストラン店頭価格の\n1/4〜1/7 の水準で仕入れる。", {
    x: M + 0.34, y: 5.46, w: 4.40, h: 1.02, margin: 0, valign: "middle",
    fontFace: FJP, fontSize: 15, bold: true, color: TAN_LT, lineSpacing: 21,
  });
  const meanings = [
    ["飲食店は卸値で仕入れられる", "在庫を持たずに、店内価格の\n数分の一で調達できる"],
    ["居住者にも余力を渡せる", "卸値×1.1でも、市中の\nどの価格帯より有利"],
    ["新規参入は追随できない", "参入業者は「70」の\n水準からしか始まらない"],
  ];
  meanings.forEach((m2, i) => {
    const x = M + 5.10 + i * 2.42;
    s.addText(m2[0], {
      x, y: 5.62, w: 2.32, h: 0.28, margin: 0,
      fontFace: FJP, fontSize: 10.5, bold: true, color: PAPER,
    });
    s.addText(m2[1], {
      x, y: 5.92, w: 2.32, h: 0.48, margin: 0,
      fontFace: FJP, fontSize: 9, color: "B9BEC2", lineSpacing: 12.5,
    });
  });

  s.addText("※ 希望小売価格を100とした相対指数。ネット最安値／並行輸入価格は概ね80の水準。出典：当社資料。", {
    x: M, y: 6.60, w: 12.0, h: 0.28, margin: 0, fontFace: FJP, fontSize: 8.8, color: GREY_LT,
  });
}

/* ============================ 28. CLUB特典の価値 ============================ */
{
  const s = slide("APPENDIX", "WineBank CLUB 会員特典の内訳",
    "通常会員の年会費30万円に対し、提供サービスは46.4万円相当。ヒルズ枠ではこれを基準に条件を設計します。");

  const rows = [
    ["サービス", "内容", "相当額"],
    ["初回引取・入庫・撮影・登録", "現在の保管先・ご自宅へ伺い、全ボトルを撮影・登録", "100,000円"],
    ["ワイン保管（100本まで）", "定温14℃・湿度70%の専門倉庫でお預かり", "120,000円"],
    ["WineBank Standard 会員資格", "グループ飲食店20%OFF、優先割当ほか", "100,000円"],
    ["出庫・ご配送", "回数無制限・無料（持込・贈答・ご自宅）", "54,000円"],
    ["コルケージ無料", "提携26店舗へのBYO。抜栓料・持込料ゼロ", "60,000円"],
    ["保険・真贋保証", "動産保険の付保および真贋保証", "30,000円"],
    ["合計", "", "464,000円相当"],
  ];
  const colW = [2.86, 4.36, 1.58];
  const tW = colW.reduce((a, b) => a + b, 0);
  s.addTable(rows, {
    x: M, y: 1.62, w: tW, colW,
    border: { type: "solid", color: LINE, pt: 0.75 },
    fontFace: FJP, fontSize: 9.8, color: INK, valign: "middle", rowH: 0.46,
  });
  s.addShape(pres.ShapeType.rect, {
    x: M, y: 1.62, w: tW, h: 0.46, fill: { color: NAVY }, line: { width: 0 },
  });
  let hx = M;
  rows[0].forEach((hstr, i) => {
    s.addText(hstr, {
      x: hx + 0.12, y: 1.62, w: colW[i] - 0.24, h: 0.46, margin: 0, valign: "middle",
      fontFace: FJP, fontSize: 9.8, bold: true, color: TAN_LT,
    });
    hx += colW[i];
  });

  s.addText("別途申し受けるもの：相続・ご承継サポート（別途お見積り）／当日エクスプレス配送 5,000円・回／101本目以降の保管料 月100円・本", {
    x: M, y: 5.42, w: tW, h: 0.50, margin: 0, fontFace: FJP, fontSize: 9.2, color: GREY, lineSpacing: 13,
  });

  const rx = M + tW + 0.34;
  const rw = W - M - rx;
  card(s, rx, 1.62, rw, 3.32, { fill: NAVY });
  s.addText("接待費の実質削減効果", {
    x: rx + 0.28, y: 1.80, w: rw - 0.56, h: 0.34, margin: 0,
    fontFace: FJP, fontSize: 14, bold: true, color: TAN_LT,
  });
  s.addText("店内価格は市価の2〜3倍。BYO無料と卸値仕入により、年間接待費600万円規模の利用で約200万円の削減余地が生まれます。", {
    x: rx + 0.28, y: 2.24, w: rw - 0.56, h: 1.06, margin: 0,
    fontFace: FJP, fontSize: 10, color: "DDE1E4", lineSpacing: 15,
  });
  s.addText("会員特典46.4万円相当 ＋ 接待費削減 約200万円\n＝ 年会費を大きく上回る実利", {
    x: rx + 0.28, y: 3.42, w: rw - 0.56, h: 0.66, margin: 0,
    fontFace: FJP, fontSize: 10.5, bold: true, color: TAN, lineSpacing: 16,
  });
  s.addText("「持っているだけで得」が、法人会員への最初の一言になります。", {
    x: rx + 0.28, y: 4.20, w: rw - 0.56, h: 0.56, margin: 0,
    fontFace: FJP, fontSize: 9.8, color: "B9BEC2", lineSpacing: 14,
  });
}

/* ============================ write ============================ */
const OUT = process.argv[2] || "森ビル様_業務提携ご提案_WineBank.pptx";
pres.writeFile({ fileName: OUT }).then(() => console.log("wrote", OUT));
