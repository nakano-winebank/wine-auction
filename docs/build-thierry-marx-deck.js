/**
 * （仮称）THIERRY MARX BISTRO 開業工程 納品デッキ生成
 *
 *   node docs/build-thierry-marx-deck.js
 *
 * 数字や日程が動いたらこのファイルを直して再実行する。
 * ハウススタイルとガント描画は .claude/skills/winebank-deck/ 側に置いてある。
 *
 * 典拠は2つ。混ぜないように出所をコメントで残しておく。
 *  (A) 営業と出店に関する契約書（定期建物賃貸借契約書）（案）契約番号 90238-2047-000
 *  (B) ノーツデザインオフィス「[B-0105・0106] THIERRY MARX 新装工事 工程表」2026年8月28日修正
 * (B)のバー日付は工程表の作図位置から読み取った値で、±2〜3日の誤差を含む。
 * ヘッダーに明記された着工2/10・竣工4/15のみ確定値として扱う。
 */

const pptxgen = require("pptxgenjs");
const path = require("path");
const { addGantt, addLegend, D } = require(
  path.join(__dirname, "..", ".claude", "skills", "winebank-deck", "scripts", "gantt.js")
);

// ---- ハウススタイル ------------------------------------------------------
const C = {
  bordeaux: "8C2740",
  ink: "1B1A19",
  grey: "6E6866",
  line: "DCD7D2",
  band: "F5F3F1",
  white: "FFFFFF",
  navy: "2C4A6E",
  brass: "9C6E28",
  sage: "4E6B54",
  plum: "6B4A72",
};
const F = { jp: "Yu Gothic", mincho: "Yu Mincho", num: "Arial" };
const TODAY = D(2026, 8, 28);

const SRC_A = "出典①：営業と出店に関する契約書（定期建物賃貸借契約書）（案）契約番号 90238-2047-000／賃貸人 三井不動産株式会社・賃借人 株式会社WineBank";
const SRC_B = "出典②：ノーツデザインオフィス「[B-0105・0106] THIERRY MARX 新装工事 工程表」2026年8月28日修正";
const SRC_AB = SRC_A + "　　" + SRC_B;

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.33" x 7.5" — スライド追加前に設定する
pres.author = "株式会社WineBank";
pres.title = "（仮称）THIERRY MARX BISTRO 開業工程";

// ---- 部品 ----------------------------------------------------------------
function titleSlide(s, text, kicker) {
  if (kicker) {
    s.addText(kicker, {
      x: 0.5, y: 0.34, w: 12.33, h: 0.24,
      fontSize: 9.5, fontFace: F.jp, color: C.bordeaux, bold: true,
      charSpacing: 2, margin: 0,
    });
  }
  s.addText(text, {
    x: 0.5, y: 0.6, w: 12.33, h: 0.55,
    fontSize: 25, bold: true, fontFace: F.jp, color: C.ink, margin: 0,
  });
}

function lede(s, text) {
  s.addText(text, {
    x: 0.5, y: 1.18, w: 12.33, h: 0.26,
    fontSize: 10.5, fontFace: F.jp, color: C.grey, margin: 0,
  });
}

function footnote(s, text) {
  s.addText(text, {
    x: 0.5, y: 6.98, w: 12.33, h: 0.24,
    fontSize: 7.5, fontFace: F.jp, color: C.grey, margin: 0,
  });
}

function darkSlide() {
  const s = pres.addSlide();
  s.background = { color: C.bordeaux };
  return s;
}

// ==========================================================================
// 1. 表紙
// ==========================================================================
{
  const s = darkSlide();
  s.addText("WINE BANK", {
    x: 0.9, y: 0.75, w: 6, h: 0.3,
    fontSize: 11, fontFace: F.jp, color: C.white, charSpacing: 5, margin: 0,
  });
  s.addText("（仮称）THIERRY MARX BISTRO", {
    x: 0.9, y: 2.4, w: 11.5, h: 0.75,
    fontSize: 38, fontFace: F.mincho, color: C.white, margin: 0,
  });
  s.addText("竣工・開業までの工程", {
    x: 0.9, y: 3.2, w: 11.5, h: 0.62,
    fontSize: 30, fontFace: F.mincho, color: C.white, margin: 0,
  });
  s.addText("東京ミッドタウン　B0105号室・B0106号室　／　183.59㎡（55.53坪）", {
    x: 0.92, y: 4.15, w: 11.5, h: 0.3,
    fontSize: 13, fontFace: F.jp, color: "E8D5DA", margin: 0,
  });
  s.addText("着工 2027年2月10日 ▸ 竣工 2027年4月15日 ▸ 開業 2027年4月30日", {
    x: 0.92, y: 4.52, w: 11.5, h: 0.3,
    fontSize: 13, fontFace: F.num, color: "E8D5DA", margin: 0,
  });
  s.addText("ノーツデザインオフィス工程表（2026年8月28日修正）反映版", {
    x: 0.92, y: 4.95, w: 11.5, h: 0.3,
    fontSize: 11, fontFace: F.jp, color: "D7AEBA", margin: 0,
  });
  s.addText("2026年8月28日　株式会社WineBank", {
    x: 7.4, y: 6.55, w: 5, h: 0.3,
    fontSize: 10, fontFace: F.jp, color: "E8D5DA", align: "right", margin: 0,
  });
  s.addNotes("設計会社（ノーツデザインオフィス）の新装工事工程表を、契約書ベースの開業工程にマージした版。");
}

// ==========================================================================
// 2. サマリー
// ==========================================================================
{
  const s = pres.addSlide();
  titleSlide(s, "設計は約3ヶ月前倒し。ただしB工事とC工事は並走ではなく直列", "サマリー");

  const lead = [
    "設計会社工程では基本設計は8/20完了済み、実施設計10/19完了、B工事金額合意10/31。前回想定より約3ヶ月早い。",
    "一方でB工事（2/1〜2/17）とC工事（2/18〜4/18）は直列。B工事の遅延はそのままC工事と竣工に波及する。",
    "工程表の着工日2/10が、契約上の引渡日2/15より5日早い。着工の前提を設計会社・TMMに確認する必要がある。",
  ];
  s.addText(lead.map((t, i) => ({
    text: t, options: { bullet: { indent: 14 }, breakLine: i < lead.length - 1, paraSpaceAfter: 6 },
  })), {
    x: 0.55, y: 1.3, w: 12.2, h: 1.3,
    fontSize: 12, fontFace: F.jp, color: C.ink, margin: 0,
  });

  const cards = [
    { l: "実施設計 完了", v: "2026.10.19", n: "ノーツデザインオフィス" },
    { l: "B工事 金額合意", v: "2026.10.31", n: "TMM（ビル側）と合意" },
    { l: "着工", v: "2027.02.10", n: "工程表ヘッダー記載" },
    { l: "物件 引渡", v: "2027.02.15", n: "契約書（予定）" },
    { l: "竣工", v: "2027.04.15", n: "工程表ヘッダー記載" },
    { l: "営業開始日", v: "2027.04.30", n: "契約書（予定）" },
  ];
  const cw = (12.33 - 5 * 0.18) / 6;
  cards.forEach((c, i) => {
    const cx = 0.5 + i * (cw + 0.18);
    s.addShape(pres.ShapeType.rect, {
      x: cx, y: 3.0, w: cw, h: 1.42,
      fill: { color: C.band }, line: { color: C.line, width: 0.75 },
    });
    s.addText(c.l, {
      x: cx + 0.14, y: 3.14, w: cw - 0.28, h: 0.22,
      fontSize: 8.5, fontFace: F.jp, color: C.grey, margin: 0,
    });
    s.addText(c.v, {
      x: cx + 0.14, y: 3.42, w: cw - 0.28, h: 0.42,
      fontSize: 16, bold: true, fontFace: F.num, color: C.bordeaux, margin: 0,
    });
    s.addText(c.n, {
      x: cx + 0.14, y: 3.88, w: cw - 0.28, h: 0.42,
      fontSize: 8.5, fontFace: F.jp, color: C.grey, margin: 0, valign: "top",
    });
  });

  s.addText("いま確認・決定すべき3点", {
    x: 0.5, y: 4.72, w: 12.33, h: 0.3,
    fontSize: 13, bold: true, fontFace: F.jp, color: C.ink, margin: 0,
  });
  const pts = [
    { h: "着工日2/10の前提を確認", b: "契約上の引渡は2/15。引渡前のB工事着手が可能か、三井不動産・TMM・ディコンの3者で確認する。" },
    { h: "B工事金額合意を10/31で固める", b: "賃貸人負担1億円の覚書を前倒しで締結でき、自社負担額を年内に確定できる。" },
    { h: "長納期品のリードタイム管理", b: "分電盤は10/20発注・2/8設置。厨房機器も同様に実施設計完了（10/19）直後に発注を確定させる。" },
  ];
  const pw = (12.33 - 2 * 0.24) / 3;
  pts.forEach((p, i) => {
    const px = 0.5 + i * (pw + 0.24);
    s.addShape(pres.ShapeType.rect, {
      x: px, y: 5.12, w: pw, h: 1.5,
      fill: { color: C.white }, line: { color: C.line, width: 0.75 },
    });
    s.addText(String(i + 1), {
      x: px + 0.16, y: 5.24, w: 0.4, h: 0.3,
      fontSize: 12, bold: true, fontFace: F.num, color: C.bordeaux, margin: 0,
    });
    s.addText(p.h, {
      x: px + 0.5, y: 5.24, w: pw - 0.66, h: 0.3,
      fontSize: 11.5, bold: true, fontFace: F.jp, color: C.ink, margin: 0, valign: "middle",
    });
    s.addText(p.b, {
      x: px + 0.16, y: 5.58, w: pw - 0.32, h: 0.92,
      fontSize: 9.5, fontFace: F.jp, color: C.grey, margin: 0, valign: "top",
    });
  });
  footnote(s, SRC_AB);
}

// ==========================================================================
// 3. 体制
// ==========================================================================
{
  const s = pres.addSlide();
  titleSlide(s, "プロジェクト体制", "関係会社と担当");
  lede(s, "現場名：[B-0105・0106] THIERRY MARX 新装工事　／　建設地：東京都港区赤坂9-7-1　東京ミッドタウン1F");

  const orgs = [
    { role: "発注者", name: "株式会社WineBank", note: "賃借人。契約締結後、代表者が代表を務める新会社へ地位承継予定（特記事項 第11条）。" },
    { role: "賃貸人", name: "三井不動産株式会社", note: "定期建物賃貸借契約の相手方。デザインクライテリアおよび工事等承認の承認権者。" },
    { role: "施設管理", name: "東京ミッドタウンマネジメント株式会社", note: "ビル側窓口。基本設計の内容確認、B工事の見積作成・金額合意、TMM書類の受付。" },
    { role: "設計管理", name: "ノーツデザインオフィス", note: "基本設計・実施設計・官公庁申請・竣工図提出を担当。総合監修は藤原氏。" },
    { role: "工事請負施工", name: "株式会社ディコン", note: "C工事の施工。B工事は賃貸人指定業者が施工（契約第22条）。" },
  ];
  const rowH = 0.66;
  orgs.forEach((o, i) => {
    const y = 1.62 + i * (rowH + 0.12);
    s.addShape(pres.ShapeType.rect, {
      x: 0.5, y: y, w: 7.5, h: rowH,
      fill: { color: i === 0 ? "F7EBEE" : C.white }, line: { color: C.line, width: 0.75 },
    });
    s.addText(o.role, {
      x: 0.68, y: y + 0.08, w: 1.5, h: 0.28,
      fontSize: 9, fontFace: F.jp, color: C.grey, margin: 0,
    });
    s.addText(o.name, {
      x: 0.68, y: y + 0.31, w: 6.9, h: 0.3,
      fontSize: 14, bold: true, fontFace: F.jp,
      color: i === 0 ? C.bordeaux : C.ink, margin: 0,
    });
    s.addText(o.note, {
      x: 8.2, y: y + 0.06, w: 4.63, h: rowH - 0.1,
      fontSize: 9, fontFace: F.jp, color: C.grey, margin: 0, valign: "middle",
    });
  });

  const y2 = 1.62 + 5 * (rowH + 0.12) + 0.18;
  s.addText("工程表に記載の担当", {
    x: 0.5, y: y2, w: 12.33, h: 0.28,
    fontSize: 11, bold: true, fontFace: F.jp, color: C.ink, margin: 0,
  });
  const people = [
    { r: "総合監修", n: "NDO 藤原" },
    { r: "実施設計", n: "坂本" },
    { r: "管理", n: "瀬崎" },
    { r: "調整", n: "野上" },
  ];
  const pwd = 2.2;
  people.forEach((p, i) => {
    const px = 0.5 + i * (pwd + 0.2);
    s.addShape(pres.ShapeType.rect, {
      x: px, y: y2 + 0.34, w: pwd, h: 0.66,
      fill: { color: C.band }, line: { color: C.line, width: 0.75 },
    });
    s.addText(p.r, {
      x: px + 0.14, y: y2 + 0.4, w: pwd - 0.28, h: 0.2,
      fontSize: 8.5, fontFace: F.jp, color: C.grey, margin: 0,
    });
    s.addText(p.n, {
      x: px + 0.14, y: y2 + 0.62, w: pwd - 0.28, h: 0.3,
      fontSize: 13, bold: true, fontFace: F.jp, color: C.ink, margin: 0,
    });
  });
  s.addText("所属が明記されているのは藤原氏（NDO）のみ。坂本・瀬崎・野上の各氏は工程表上に所属の記載がなく、要確認。", {
    x: 10.1, y: y2 + 0.44, w: 2.73, h: 0.6,
    fontSize: 8.5, fontFace: F.jp, color: C.bordeaux, margin: 0, valign: "middle",
  });

  footnote(s, SRC_B + "　　建設地の表記は工程表の住居表示。契約書上の地番は「東京都港区赤坂九丁目142番1他」。");
}

// ==========================================================================
// 4. 全体工程
// ==========================================================================
{
  const s = pres.addSlide();
  titleSlide(s, "全体工程", "2026年7月 – 2027年5月");
  lede(s, "設計会社工程（設計・申請・B工事・C工事）に、契約・採用・開業準備を重ねた全体像。ひし形は期日が動かせない項目。");

  addGantt(s, pres, {
    x: 0.5, y: 1.55, w: 12.33, h: 4.6, labelW: 2.75,
    start: D(2026, 7, 1), end: D(2027, 5, 20), today: TODAY,
    rowFont: 9.5,
    rows: [
      { type: "group", name: "領域", color: C.ink },
      { type: "task", name: "設計（ノーツデザインオフィス）", s: D(2026, 7, 3), e: D(2026, 10, 19), color: C.brass, live: true },
      { type: "task", name: "ビル側確認・B工事見積（TMM）", s: D(2026, 8, 20), e: D(2026, 10, 31), color: C.navy, live: true },
      { type: "task", name: "申請・届出", s: D(2026, 11, 4), e: D(2027, 1, 7), color: C.brass },
      { type: "task", name: "分電盤（長納期品）", s: D(2026, 9, 19), e: D(2027, 2, 8), color: C.bordeaux },
      { type: "task", name: "B工事（準備〜施工）", s: D(2026, 12, 19), e: D(2027, 2, 17), color: C.bordeaux },
      { type: "task", name: "C工事（株式会社ディコン）", s: D(2027, 2, 18), e: D(2027, 4, 18), color: C.bordeaux },
      { type: "task", name: "採用・組織", s: D(2026, 8, 1), e: D(2027, 3, 31), color: C.sage, live: true },
      { type: "task", name: "開業準備", s: D(2026, 11, 1), e: D(2027, 4, 30), color: C.plum },
      { type: "group", name: "マイルストーン", color: C.bordeaux },
      { type: "ms", name: "定期建物賃貸借契約 締結", date: D(2026, 9, 1), color: C.navy },
      { type: "ms", name: "B工事 見積・金額合意", date: D(2026, 10, 31), color: C.navy },
      { type: "ms", name: "着工（工程表ヘッダー）", date: D(2027, 2, 10), color: C.bordeaux },
      { type: "ms", name: "物件 引渡（契約書）", date: D(2027, 2, 15), color: C.bordeaux },
      { type: "ms", name: "竣工", date: D(2027, 4, 15), color: C.bordeaux },
      { type: "ms", name: "グランドオープン", date: D(2027, 4, 30), color: C.plum },
    ],
  });

  addLegend(s, pres, {
    x: 0.5, y: 6.32, gap: 1.6,
    items: [
      { label: "設計・申請", color: C.brass },
      { label: "ビル側協議", color: C.navy },
      { label: "工事", color: C.bordeaux },
      { label: "採用・組織", color: C.sage },
      { label: "開業準備", color: C.plum },
      { label: "確定期日", color: C.ink, shape: "diamond" },
    ],
  });
  footnote(s, SRC_AB);
}

// ==========================================================================
// 5. フェーズ① 設計・申請・契約
// ==========================================================================
{
  const s = pres.addSlide();
  titleSlide(s, "フェーズ① 設計・申請・契約 ─ 年内にB工事の金額と負担区分を確定させる", "2026年7月 – 2027年2月");
  lede(s, "上2ブロックは設計会社工程からの転記。B工事の金額合意が10/31に前倒しされたことで、賃貸人負担額の覚書も年内に締結できる。");

  addGantt(s, pres, {
    x: 0.5, y: 1.55, w: 12.33, h: 5.1, labelW: 3.35,
    start: D(2026, 7, 1), end: D(2027, 2, 28), today: TODAY,
    rowFont: 9.5,
    rows: [
      { type: "group", name: "設計（ノーツデザインオフィス）", color: C.brass },
      { type: "task", name: "基本設計", s: D(2026, 7, 3), e: D(2026, 8, 20), color: C.brass },
      { type: "task", name: "実施設計", s: D(2026, 9, 19), e: D(2026, 10, 19), color: C.brass },
      { type: "task", name: "防火防災管理者の選任", s: D(2026, 11, 4), e: D(2026, 12, 4), color: C.brass },
      { type: "task", name: "TMM書類提出", s: D(2026, 12, 2), e: D(2026, 12, 18), color: C.brass },
      { type: "task", name: "官公庁書類提出", s: D(2026, 12, 22), e: D(2027, 1, 7), color: C.brass },
      { type: "group", name: "東京ミッドタウンマネジメント", color: C.navy },
      { type: "task", name: "基本設計 ビル側内容確認", s: D(2026, 8, 20), e: D(2026, 9, 18), color: C.navy, live: true },
      { type: "task", name: "B工事 見積作成・金額合意", s: D(2026, 9, 19), e: D(2026, 10, 31), color: C.navy },
      { type: "group", name: "契約・法務（WineBank）", color: C.sage },
      { type: "task", name: "契約条件精査・社内決裁", s: D(2026, 8, 1), e: D(2026, 8, 31), color: C.sage, live: true },
      { type: "ms", name: "定期建物賃貸借契約 締結／第1回敷金", date: D(2026, 9, 1), color: C.sage },
      { type: "task", name: "新会社 設立", s: D(2026, 9, 15), e: D(2026, 11, 30), color: C.sage },
      { type: "task", name: "B・C工事 賃貸人負担額 覚書", s: D(2026, 11, 1), e: D(2026, 12, 25), color: C.sage },
      { type: "task", name: "地位承継 覚書（3者）締結", s: D(2026, 12, 1), e: D(2026, 12, 25), color: C.sage },
      { type: "ms", name: "第2回敷金・開店前準備期間負担金ほか", date: D(2027, 2, 14), color: C.sage },
    ],
  });
  footnote(s, "設計会社工程では実施設計が10/19完了。前回版（12/1〜1/31）から約3ヶ月前倒しとなり、承認・見積・発注の各工程に余裕が生まれる。");
}

// ==========================================================================
// 6. フェーズ② 工事・竣工
// ==========================================================================
{
  const s = pres.addSlide();
  titleSlide(s, "フェーズ② 工事・竣工 ─ B工事完了を待ってC工事に入る直列工程", "2026年9月 – 2027年4月30日");
  lede(s, "B工事は2/1〜2/17の約2.5週間、C工事は2/18〜4/18の2ヶ月。並走しないため、B工事の遅延はそのまま竣工日に跳ね返る。");

  addGantt(s, pres, {
    x: 0.5, y: 1.55, w: 12.33, h: 3.55, labelW: 3.35,
    start: D(2026, 9, 1), end: D(2027, 5, 5),
    rowFont: 9.5,
    rows: [
      { type: "group", name: "長納期品（工程表 特記）", color: C.brass },
      { type: "task", name: "分電盤 発注準備", s: D(2026, 9, 19), e: D(2026, 10, 18), color: C.brass },
      { type: "task", name: "分電盤 発注〜設置", s: D(2026, 10, 20), e: D(2027, 2, 8), color: C.brass },
      { type: "group", name: "B工事（賃貸人指定業者）", color: C.bordeaux },
      { type: "task", name: "B工事準備", s: D(2026, 12, 19), e: D(2027, 1, 31), color: C.bordeaux },
      { type: "ms", name: "着工（工程表ヘッダー 2/10）", date: D(2027, 2, 10), color: C.bordeaux },
      { type: "task", name: "B工事 施工", s: D(2027, 2, 1), e: D(2027, 2, 17), color: C.bordeaux },
      { type: "group", name: "C工事・竣工（株式会社ディコン）", color: C.bordeaux },
      { type: "ms", name: "物件 引渡（契約書 2/15）", date: D(2027, 2, 15), color: C.navy },
      { type: "task", name: "C工事 施工", s: D(2027, 2, 18), e: D(2027, 4, 18), color: C.bordeaux },
      { type: "task", name: "官公庁検査", s: D(2027, 4, 9), e: D(2027, 4, 17), color: C.navy },
      { type: "ms", name: "竣工", date: D(2027, 4, 15), color: C.bordeaux },
      { type: "task", name: "開店準備", s: D(2027, 4, 17), e: D(2027, 4, 25), color: C.plum },
      { type: "ms", name: "グランドオープン", date: D(2027, 4, 30), color: C.plum },
    ],
  });

  const notes = [
    { h: "着工日と引渡日が逆転", b: "工程表の着工は2/10、契約上の引渡は2/15。引渡前のB工事着手が可能か、三井不動産・TMM・ディコンに確認が必要。" },
    { h: "B工事とC工事は直列", b: "前回想定の並走ではなくB工事完了後にC工事着手。B工事2/17完了が守れないと竣工4/15が崩れる。" },
    { h: "竣工図提出は開業後", b: "ノーツデザインオフィスによる竣工図提出は4月末〜5月。開業とは切り離して管理する。" },
  ];
  const nw = (12.33 - 2 * 0.24) / 3;
  notes.forEach((n, i) => {
    const nx = 0.5 + i * (nw + 0.24);
    s.addShape(pres.ShapeType.rect, {
      x: nx, y: 5.32, w: nw, h: 1.32,
      fill: { color: C.band }, line: { color: C.line, width: 0.75 },
    });
    s.addText(n.h, {
      x: nx + 0.16, y: 5.44, w: nw - 0.32, h: 0.28,
      fontSize: 11, bold: true, fontFace: F.jp, color: C.bordeaux, margin: 0,
    });
    s.addText(n.b, {
      x: nx + 0.16, y: 5.74, w: nw - 0.32, h: 0.78,
      fontSize: 9.5, fontFace: F.jp, color: C.ink, margin: 0, valign: "top",
    });
  });
  footnote(s, SRC_B + "　　バーの日付は工程表の作図位置から読み取った値で±2〜3日の誤差を含む。着工2/10・竣工4/15はヘッダー記載の確定値。");
}

// ==========================================================================
// 7. フェーズ③ 採用・開業準備
// ==========================================================================
{
  const s = pres.addSlide();
  titleSlide(s, "フェーズ③ 採用・開業準備 ─ 工事と独立して先行できる", "2026年8月 – 2027年4月30日");
  lede(s, "設計会社工程には含まれないWineBank側の準備。竣工4/15から開業4/30までの実働は約2週間で、ここがトレーニング枠になる。");

  addGantt(s, pres, {
    x: 0.5, y: 1.55, w: 12.33, h: 5.1, labelW: 3.35,
    start: D(2026, 8, 1), end: D(2027, 5, 10), today: TODAY,
    rowFont: 9.5,
    rows: [
      { type: "group", name: "採用・組織", color: C.sage },
      { type: "task", name: "幹部採用（総支配人・シェフ）", s: D(2026, 8, 1), e: D(2026, 10, 31), color: C.sage, live: true },
      { type: "task", name: "主要ポジション採用（ソムリエ等）", s: D(2026, 10, 1), e: D(2026, 12, 31), color: C.sage },
      { type: "task", name: "社員採用（キッチン・ホール）", s: D(2026, 11, 1), e: D(2027, 2, 28), color: C.sage },
      { type: "task", name: "労務体制・就業規則 整備", s: D(2026, 11, 1), e: D(2027, 1, 31), color: C.sage },
      { type: "task", name: "アルバイト採用", s: D(2027, 1, 5), e: D(2027, 3, 31), color: C.sage },
      { type: "group", name: "開業準備", color: C.plum },
      { type: "task", name: "メニュー開発・監修", s: D(2026, 11, 1), e: D(2027, 2, 28), color: C.plum },
      { type: "task", name: "厨房機器 発注〜搬入設置", s: D(2026, 10, 20), e: D(2027, 4, 10), color: C.plum },
      { type: "task", name: "ワイン・食材 仕入先契約", s: D(2026, 12, 1), e: D(2027, 3, 15), color: C.plum },
      { type: "task", name: "原価設計・事業計画確定", s: D(2027, 1, 5), e: D(2027, 2, 28), color: C.plum },
      { type: "task", name: "POS・予約システム導入", s: D(2027, 1, 5), e: D(2027, 3, 31), color: C.plum },
      { type: "task", name: "販促・PR／メディア対応", s: D(2027, 1, 15), e: D(2027, 4, 29), color: C.plum },
      { type: "ms", name: "予約受付 開始", date: D(2027, 3, 16), color: C.plum },
      { type: "task", name: "スタッフトレーニング（約2週間）", s: D(2027, 4, 16), e: D(2027, 4, 28), color: C.plum },
      { type: "ms", name: "グランドオープン", date: D(2027, 4, 30), color: C.plum },
    ],
  });
  footnote(s, "厨房機器は分電盤と同じ長納期品として、実施設計完了（10/19）直後に発注を確定させる前提で置いている。営業時間は11:00〜23:00、終日全席禁煙。");
}

// ==========================================================================
// 8. 前回工程からの変更点
// ==========================================================================
{
  const s = pres.addSlide();
  titleSlide(s, "前回工程からの変更点", "設計会社工程の反映による差分");
  lede(s, "前回（8月18日版）は契約書の確定日程からの逆算のみ。今回は設計会社工程を典拠として置き換えた。");

  const data = [
    ["基本設計", "2026.10.01 – 11.30", "2026.07.03 – 08.20（完了）", "約3ヶ月前倒し", 1],
    ["実施設計", "2026.12.01 – 2027.01.31", "2026.09.19 – 10.19", "約3ヶ月前倒し", 1],
    ["B工事 見積・金額合意", "2027.01.31", "2026.10.31", "3ヶ月前倒し。負担額覚書も年内に締結可能", 1],
    ["申請・届出", "2027.01 – 02（保健所・消防）", "2026.11.04 – 2027.01.07", "防火防災管理者選任・TMM書類・官公庁書類に細分化", 1],
    ["B工事・C工事の関係", "2/15〜4/12 を並走", "B工事 2/1–2/17 → C工事 2/18–4/18 の直列", "並走前提が崩れる。工程リスクは増加", 2],
    ["着工日", "2027.02.15（引渡日と同日）", "2027.02.10", "引渡日より5日早い。前提の確認が必要", 2],
    ["竣工", "2027.04.15", "2027.04.15", "一致", 0],
    ["分電盤（長納期品）", "計上なし", "2026.10.20 発注 – 2027.02.08 設置", "新規計上。厨房機器も同様の管理が必要", 2],
    ["竣工図提出", "計上なし", "2027.04月末 – 05月", "新規計上。開業後の設計会社業務", 0],
  ];

  const rows = [["項目", "前回（8/18版）", "今回（設計会社工程反映）", "影響"].map((h) => ({
    text: h,
    options: { color: C.grey, fontSize: 9, fill: { color: C.band }, fontFace: F.jp },
  }))];
  for (const [item, before, after, impact, kind] of data) {
    // kind 1=前倒し（good） 2=要注意 0=変更なし・軽微
    const bg = kind === 2 ? "F7EBEE" : C.white;
    const ic = kind === 2 ? C.bordeaux : kind === 1 ? C.sage : C.grey;
    rows.push([
      { text: item, options: { fontFace: F.jp, bold: true, color: C.ink, fill: { color: bg } } },
      { text: before, options: { fontFace: F.jp, color: C.grey, fill: { color: bg } } },
      { text: after, options: { fontFace: F.jp, color: C.ink, fill: { color: bg } } },
      { text: impact, options: { fontFace: F.jp, bold: kind === 2, color: ic, fill: { color: bg } } },
    ]);
  }

  s.addTable(rows, {
    x: 0.5, y: 1.6, w: 12.33, colW: [2.45, 2.95, 3.15, 3.78],
    fontSize: 9.5, color: C.ink, valign: "middle",
    border: [
      { type: "none" }, { type: "none" },
      { type: "solid", color: C.line, pt: 0.5 }, { type: "none" },
    ],
    rowH: 0.44, margin: [3, 6, 3, 6],
  });
  footnote(s, "網掛けは対応が必要な変更。" + "　　" + SRC_B);
}

// ==========================================================================
// 9. マイルストーン一覧
// ==========================================================================
{
  const s = pres.addSlide();
  titleSlide(s, "マイルストーン一覧", "確定事項と社内目標値");
  lede(s, "網掛けは契約書または設計会社工程表に日付が明記されている事項。それ以外は逆算による社内目標値。");

  const data = [
    ["2026.08.20", "基本設計 完了", "ノーツデザインオフィス", "設計会社工程", 1],
    ["2026.09.01", "定期建物賃貸借契約 締結", "第1回敷金 ¥11,105,988／内装管理費 ¥1,285,130", "契約書", 1],
    ["2026.09.18", "基本設計 ビル側内容確認 完了", "東京ミッドタウンマネジメント", "設計会社工程", 1],
    ["2026.10.19", "実施設計 完了", "ノーツデザインオフィス。厨房機器の発注確定はこの直後", "設計会社工程", 1],
    ["2026.10.31", "B工事 見積作成・金額合意", "賃貸人負担1億円の内訳を確定し、覚書の締結につなげる", "設計会社工程", 1],
    ["2026.12.04", "防火防災管理者の選任", "新会社への地位承継と名義を整合させる", "設計会社工程", 1],
    ["2027.01.07", "官公庁書類提出 完了", "TMM書類提出は12/18まで", "設計会社工程", 1],
    ["2027.02.08", "分電盤 設置完了", "10/20発注の長納期品", "設計会社工程", 1],
    ["2027.02.10", "着工", "工程表ヘッダー記載。契約上の引渡日より5日早い", "設計会社工程", 2],
    ["2027.02.14", "第2回敷金ほか 支払", "敷金 ¥462,780／開店前準備期間負担金 ¥550,770／契約時販促負担金 ¥1,000,000", "契約書", 1],
    ["2027.02.15", "物件 引渡", "出店期間の起算日", "契約書", 1],
    ["2027.02.17", "B工事 完了", "この日を落とすとC工事と竣工がそのまま後ろ倒しになる", "設計会社工程", 2],
    ["2027.04.15", "竣工", "官公庁検査は4月中旬に並走", "設計会社工程", 1],
    ["2027.04.28", "スタッフトレーニング 完了", "竣工から開業までの約2週間", "社内目標", 0],
    ["2027.04.30", "グランドオープン（営業開始日）", "同日から出店料・共益費・販促費の起算", "契約書", 1],
  ];

  const rows = [["期日", "マイルストーン", "内容", "典拠"].map((h) => ({
    text: h,
    options: { color: C.grey, fontSize: 8.5, fill: { color: C.band }, fontFace: F.jp },
  }))];
  for (const [dt, name, note, src, kind] of data) {
    const bg = kind === 2 ? "F7EBEE" : kind === 1 ? "FAF7F8" : C.white;
    rows.push([
      { text: dt, options: { fontFace: F.num, bold: kind > 0, color: kind === 2 ? C.bordeaux : C.ink, fill: { color: bg } } },
      { text: name, options: { fontFace: F.jp, bold: kind > 0, color: kind === 2 ? C.bordeaux : C.ink, fill: { color: bg } } },
      { text: note, options: { fontFace: F.jp, color: C.grey, fill: { color: bg } } },
      { text: src, options: { fontFace: F.jp, color: C.grey, fill: { color: bg } } },
    ]);
  }

  s.addTable(rows, {
    x: 0.5, y: 1.6, w: 12.33, colW: [1.35, 3.5, 6.08, 1.4],
    fontSize: 8.8, color: C.ink, valign: "middle",
    border: [
      { type: "none" }, { type: "none" },
      { type: "solid", color: C.line, pt: 0.5 }, { type: "none" },
    ],
    rowH: 0.32, margin: [2, 6, 2, 6],
  });
  footnote(s, SRC_AB);
}

// ==========================================================================
// 10. 資金・支払スケジュール
// ==========================================================================
{
  const s = pres.addSlide();
  titleSlide(s, "資金・支払スケジュール", "契約要目表および特記事項 第2条・第3条");
  lede(s, "出店料・負担金はいずれも消費税別途。網掛けは営業開始日（2027年4月30日）から発生する継続費用。");

  const data = [
    ["2026.09.01", "第1回 敷金", "¥11,105,988", "本契約締結時", 0],
    ["2026.09.01", "内装管理費", "¥1,285,130", "第1回敷金預託日に一括", 0],
    ["2027.02.14", "第2回 敷金", "¥462,780", "引渡日の前日", 0],
    ["2027.02.14", "開店前準備期間負担金", "¥550,770", "第2回敷金預託日に一括", 0],
    ["2027.02.14", "契約時販促負担金", "¥1,000,000", "第2回敷金預託日に一括", 0],
    ["2027.04.30〜", "固定出店料", "¥2,221,439 ／月", "@¥12,100/㎡。起算日＝営業開始日", 1],
    ["2027.04.30〜", "第2出店料", "約¥854,700 ／月", "総額¥100,000,000／117ヶ月。営業開始日変更時は覚書で再設定", 1],
    ["2027.04.30〜", "経常販売促進費", "¥277,588 ／月", "@¥1,512/㎡", 1],
    ["2027.04.30〜", "第3〜61回 敷金", "¥462,749 ／月", "59回分割。月前半売上預り金から控除", 1],
    ["売上連動", "変動出店料", "超過額の 7.0%", "月間売上高 ¥27,767,987 を超過した額に対して", 0],
    ["売上連動", "ポイントカード費用", "利用実績の 1.0%", "ほか駐車場負担金（弊社計算による割引相当額）", 0],
  ];

  const rows = [["期日", "費目", "金額", "備考"].map((h) => ({
    text: h,
    options: { color: C.grey, fontSize: 9, fill: { color: C.band }, fontFace: F.jp },
  }))];
  for (const [dt, item, amt, note, cont] of data) {
    const bg = cont ? "F7EBEE" : C.white;
    rows.push([
      { text: dt, options: { fontFace: F.num, color: C.ink, fill: { color: bg } } },
      { text: item, options: { fontFace: F.jp, bold: !!cont, color: cont ? C.bordeaux : C.ink, fill: { color: bg } } },
      { text: amt, options: { fontFace: F.num, bold: true, align: "right", color: C.ink, fill: { color: bg } } },
      { text: note, options: { fontFace: F.jp, color: C.grey, fill: { color: bg } } },
    ]);
  }

  s.addTable(rows, {
    x: 0.5, y: 1.6, w: 12.33, colW: [1.55, 2.9, 2.2, 5.68],
    fontSize: 9.5, color: C.ink, valign: "middle",
    border: [
      { type: "none" }, { type: "none" },
      { type: "solid", color: C.line, pt: 0.5 }, { type: "none" },
    ],
    rowH: 0.38, margin: [3, 6, 3, 6],
  });
  footnote(s, "敷金総額 ¥38,870,959（@¥211,727/㎡）。B工事・C工事費は賃貸人負担1億円が上限で、金額合意（10/31）後に覚書で確定。" + "　　" + SRC_A);
}

// ==========================================================================
// 11. クリティカルパスと留意点
// ==========================================================================
{
  const s = pres.addSlide();
  titleSlide(s, "クリティカルパスと留意点", "リスクと対策");

  const risks = [
    {
      cat: "工程の前提",
      h: "着工2/10が契約上の引渡2/15より早い",
      b: "工程表ヘッダーは着工2027年2月10日。契約書の引渡日は2月15日で、5日の逆転がある。B工事の施工バーも2/1起点で描かれている。",
      f: "引渡前のB工事着手が可能かを三井不動産・TMM・ディコンに確認する。不可なら工程全体を5日後ろ倒しし、竣工日の再設定を求める。",
    },
    {
      cat: "工期",
      h: "B工事とC工事が直列。緩衝がない",
      b: "B工事2/1〜2/17、C工事2/18〜4/18。前回想定の並走ではないため、B工事の遅延はそのまま竣工4/15に跳ね返る。",
      f: "B工事の完了判定基準を事前に文書化し、2/17時点でC工事が着手できる引渡条件をディコンと合意しておく。",
    },
    {
      cat: "長納期品",
      h: "分電盤は10月発注・2月設置",
      b: "設計会社が特記事項として挙げているとおり、発注から設置まで約3.5ヶ月を要する。厨房機器も同等以上のリードタイムが見込まれる。",
      f: "実施設計完了（10/19）を厨房機器の発注確定日として運用する。輸入機器がある場合は9月中に納期回答を取り付ける。",
    },
    {
      cat: "費用区分",
      h: "賃貸人負担1億円の覚書を年内に",
      b: "B工事の金額合意が10/31に前倒しされたことで、賃貸人負担額を確定する条件が整う。厨房機器・什器・備品は賃貸人負担の対象外。",
      f: "10/31の金額合意と同時に覚書ドラフトを回付し、12月中に締結。自社負担額を年内に確定して資金計画に反映する。",
    },
    {
      cat: "工事条件",
      h: "騒音・振動・臭気を伴う工事は時間制限",
      b: "事務所・住宅・美術館に近接するため工事実施時間の制限を承諾する条項がある。C工事の2ヶ月はこの制約下での実働となる。",
      f: "作業可能時間帯を書面で確認し、C工事の見積・工程に反映させる。深夜・早朝の割増を当初予算に織り込む。",
    },
    {
      cat: "契約リスク",
      h: "竣工から開業まで実働2週間",
      b: "竣工4/15、営業開始日4/30。営業開始日に営業を開始しないことは契約解除事由で、開業前解約は出店料等16ヶ月相当額＋賃貸人負担額。",
      f: "トレーニング期間をバッファ扱いしない。官公庁検査（4月中旬）と是正を竣工前に織り込み、4/15を実質的な最終期限として管理する。",
    },
  ];

  const cw = (12.33 - 0.3) / 2;
  const ch = 1.62;
  risks.forEach((r, i) => {
    const cx = 0.5 + (i % 2) * (cw + 0.3);
    const cy = 1.25 + Math.floor(i / 2) * (ch + 0.22);
    s.addShape(pres.ShapeType.rect, {
      x: cx, y: cy, w: cw, h: ch,
      fill: { color: C.white }, line: { color: C.line, width: 0.75 },
    });
    s.addText(r.cat, {
      x: cx + 0.18, y: cy + 0.11, w: cw - 0.36, h: 0.2,
      fontSize: 8.5, bold: true, fontFace: F.jp, color: C.bordeaux, charSpacing: 1, margin: 0,
    });
    s.addText(r.h, {
      x: cx + 0.18, y: cy + 0.33, w: cw - 0.36, h: 0.28,
      fontSize: 12, bold: true, fontFace: F.jp, color: C.ink, margin: 0,
    });
    s.addText(r.b, {
      x: cx + 0.18, y: cy + 0.64, w: cw - 0.36, h: 0.48,
      fontSize: 9, fontFace: F.jp, color: C.grey, margin: 0, valign: "top",
    });
    s.addText([
      { text: "対策　", options: { bold: true, color: C.bordeaux } },
      { text: r.f, options: { color: C.ink } },
    ], {
      x: cx + 0.18, y: cy + 1.14, w: cw - 0.36, h: 0.4,
      fontSize: 9, fontFace: F.jp, margin: 0, valign: "top",
    });
  });
  footnote(s, SRC_AB);
}

// ==========================================================================
// 12. 次のアクション
// ==========================================================================
{
  const s = darkSlide();
  s.addText("次のアクション", {
    x: 0.9, y: 0.85, w: 11.5, h: 0.6,
    fontSize: 30, fontFace: F.mincho, color: C.white, margin: 0,
  });

  const acts = [
    { d: "2026年8月中", h: "着工日2/10の前提確認と契約締結の準備", b: "引渡2/15との逆転についてノーツデザインオフィス・TMM・ディコンに照会。9/1の契約締結と第1回敷金 ¥11,105,988・内装管理費 ¥1,285,130 の資金手当てを確定。" },
    { d: "2026年9月中旬", h: "基本設計のビル側内容確認を完了させる", b: "TMMの確認完了（9/18）を受けて実施設計に入る。並行して幹部採用を10月末までに確定させる。" },
    { d: "2026年10月末", h: "実施設計完了とB工事金額合意", b: "実施設計10/19完了を受けて厨房機器の発注を確定。10/31のB工事金額合意と同時に、賃貸人負担額の覚書ドラフトを回付する。" },
  ];
  acts.forEach((a, i) => {
    const ay = 2.0 + i * 1.5;
    s.addText(String(i + 1), {
      x: 0.9, y: ay, w: 0.5, h: 0.5,
      fontSize: 26, fontFace: F.num, color: "E0A5B4", margin: 0,
    });
    s.addText(a.d, {
      x: 1.55, y: ay + 0.02, w: 2.3, h: 0.3,
      fontSize: 11, fontFace: F.num, color: "E0A5B4", margin: 0,
    });
    s.addText(a.h, {
      x: 3.9, y: ay - 0.02, w: 8.4, h: 0.36,
      fontSize: 17, bold: true, fontFace: F.jp, color: C.white, margin: 0,
    });
    s.addText(a.b, {
      x: 3.9, y: ay + 0.4, w: 8.4, h: 0.75,
      fontSize: 10.5, fontFace: F.jp, color: "E8D5DA", margin: 0, valign: "top",
    });
  });

  s.addText("株式会社WineBank　2026年8月28日", {
    x: 7.4, y: 6.75, w: 5, h: 0.3,
    fontSize: 10, fontFace: F.jp, color: "E8D5DA", align: "right", margin: 0,
  });
}

const out = path.join(__dirname, "THIERRY_MARX_BISTRO_開業工程_20260828.pptx");
pres.writeFile({ fileName: out }).then(() => console.log("wrote", out));
