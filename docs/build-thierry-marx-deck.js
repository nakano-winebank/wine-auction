/**
 * （仮称）THIERRY MARX BISTRO 開業工程 納品デッキ生成
 *
 *   node docs/build-thierry-marx-deck.js
 *
 * 数字や日程が動いたらこのファイルを直して再実行する。
 * ハウススタイルとガント描画は .claude/skills/winebank-deck/ 側に置いてある。
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
const SRC =
  "出典：営業と出店に関する契約書（定期建物賃貸借契約書）（案）契約番号 90238-2047-000／賃貸人 三井不動産株式会社・賃借人 株式会社WineBank";

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
    x: 0.9, y: 2.5, w: 11.5, h: 0.75,
    fontSize: 38, fontFace: F.mincho, color: C.white, margin: 0,
  });
  s.addText("開業までの工程", {
    x: 0.9, y: 3.3, w: 11.5, h: 0.62,
    fontSize: 30, fontFace: F.mincho, color: C.white, margin: 0,
  });
  s.addText("東京ミッドタウン　B0105号室・B0106号室　／　183.59㎡（55.53坪）", {
    x: 0.92, y: 4.25, w: 11.5, h: 0.3,
    fontSize: 13, fontFace: F.jp, color: "E8D5DA", margin: 0,
  });
  s.addText("2026年8月 ▸ 2027年4月30日 開業", {
    x: 0.92, y: 4.62, w: 11.5, h: 0.3,
    fontSize: 13, fontFace: F.num, color: "E8D5DA", margin: 0,
  });
  s.addText("2026年8月18日　株式会社WineBank", {
    x: 7.4, y: 6.55, w: 5, h: 0.3,
    fontSize: 10, fontFace: F.jp, color: "E8D5DA", align: "right", margin: 0,
  });
  s.addNotes("契約書（案）の確定日程をもとに作成した開業工程。現在は設計プラン決めと幹部採用のフェーズ。");
}

// ==========================================================================
// 2. サマリー
// ==========================================================================
{
  const s = pres.addSlide();
  titleSlide(s, "工期は実質2ヶ月。設計フェーズの前倒しが唯一の余地", "サマリー");

  const lead = [
    "引渡（2027年2月15日）から完成（4月中旬）まで実質2ヶ月しかなく、重飲食・厨房付き183.59㎡としては極めてタイト。",
    "着工を1日も遅らせないため、賃貸人の2つの承認（デザインクライテリア／工事等承認申請）を引渡前に取り切る。",
    "現在地は設計プラン決めと幹部採用。プラン確定を9月末に置き、そこから基本設計・実施設計を逆算している。",
  ];
  s.addText(lead.map((t, i) => ({
    text: t, options: { bullet: { indent: 14 }, breakLine: i < lead.length - 1, paraSpaceAfter: 6 },
  })), {
    x: 0.55, y: 1.3, w: 12.2, h: 1.3,
    fontSize: 12, fontFace: F.jp, color: C.ink, margin: 0,
  });

  const cards = [
    { l: "契約締結", v: "2026.09.01", n: "第1回敷金 ¥11,105,988" },
    { l: "物件 引渡", v: "2027.02.15", n: "第2回敷金は前日 2/14" },
    { l: "工事 完成", v: "2027.04.15", n: "B工事・C工事 並走" },
    { l: "営業開始日", v: "2027.04.30", n: "出店料等の起算日" },
    { l: "出店期間 満了", v: "2037.01.31", n: "定期借家・更新なし" },
    { l: "賃貸人負担", v: "¥100,000,000", n: "B・C工事の上限額" },
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

  s.addText("いま押さえるべき3つの論点", {
    x: 0.5, y: 4.72, w: 12.33, h: 0.3,
    fontSize: 13, bold: true, fontFace: F.jp, color: C.ink, margin: 0,
  });
  const pts = [
    { h: "承認を先行させる", b: "デザインクライテリアの事前協議を基本設計段階（10〜11月）から開始し、工事等承認は2/14までに取得。" },
    { h: "負担区分を発注前に固める", b: "賃貸人負担1億円の内訳は覚書待ち。厨房機器・什器・備品は対象外のため自社負担額を2月上旬までに確定。" },
    { h: "トレーニングをバッファにしない", b: "4/16〜4/28は訓練期間。工事完成を4/10目標で管理し、是正の予備日を5日確保する。" },
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
  footnote(s, SRC);
}

// ==========================================================================
// 3. 全体工程
// ==========================================================================
{
  const s = pres.addSlide();
  titleSlide(s, "全体工程", "2026年8月 – 2027年5月");
  s.addText("5つの領域を並走させ、引渡（2/15）で工事に合流させる。ひし形は契約書で確定した動かせない期日。", {
    x: 0.5, y: 1.18, w: 12.33, h: 0.26,
    fontSize: 10.5, fontFace: F.jp, color: C.grey, margin: 0,
  });

  addGantt(s, pres, {
    x: 0.5, y: 1.55, w: 12.33, h: 4.65, labelW: 2.5,
    start: D(2026, 8, 1), end: D(2027, 5, 31), today: D(2026, 8, 18),
    rowFont: 10,
    rows: [
      { type: "group", name: "領域", color: C.ink },
      { type: "task", name: "契約・法務", s: D(2026, 8, 1), e: D(2027, 4, 30), color: C.navy, live: true },
      { type: "task", name: "設計", s: D(2026, 8, 1), e: D(2027, 2, 14), color: C.brass, live: true },
      { type: "task", name: "工事", s: D(2026, 12, 1), e: D(2027, 4, 22), color: C.bordeaux },
      { type: "task", name: "採用・組織", s: D(2026, 8, 1), e: D(2027, 3, 31), color: C.sage, live: true },
      { type: "task", name: "開業準備", s: D(2026, 11, 1), e: D(2027, 4, 30), color: C.plum },
      { type: "group", name: "マイルストーン", color: C.bordeaux },
      { type: "ms", name: "定期建物賃貸借契約 締結", date: D(2026, 9, 1), color: C.navy },
      { type: "ms", name: "設計プラン 確定", date: D(2026, 9, 30), color: C.brass },
      { type: "ms", name: "工事等承認申請 承認取得", date: D(2027, 2, 14), color: C.brass },
      { type: "ms", name: "物件 引渡", date: D(2027, 2, 15), color: C.bordeaux },
      { type: "ms", name: "工事 完成・引渡検査", date: D(2027, 4, 15), color: C.bordeaux },
      { type: "ms", name: "グランドオープン", date: D(2027, 4, 30), color: C.plum },
    ],
  });

  addLegend(s, pres, {
    x: 0.5, y: 6.35, gap: 1.45,
    items: [
      { label: "契約・法務", color: C.navy },
      { label: "設計", color: C.brass },
      { label: "工事", color: C.bordeaux },
      { label: "採用・組織", color: C.sage },
      { label: "開業準備", color: C.plum },
      { label: "確定期日", color: C.ink, shape: "diamond" },
    ],
  });
  footnote(s, SRC);
}

// ==========================================================================
// 4. フェーズ① 設計・契約
// ==========================================================================
{
  const s = pres.addSlide();
  titleSlide(s, "フェーズ① 設計・契約 ─ 引渡前にすべての承認を取り切る", "2026年8月 – 2027年2月14日");
  s.addText("プラン確定（9/30）を起点に、基本設計・実施設計・賃貸人承認を直列でつなぐ。ここが遅れると着工がそのまま遅れる。", {
    x: 0.5, y: 1.18, w: 12.33, h: 0.26,
    fontSize: 10.5, fontFace: F.jp, color: C.grey, margin: 0,
  });

  addGantt(s, pres, {
    x: 0.5, y: 1.55, w: 12.33, h: 5.1, labelW: 3.1,
    start: D(2026, 8, 1), end: D(2027, 3, 10), today: D(2026, 8, 18),
    rowFont: 9.5,
    rows: [
      { type: "group", name: "契約・法務", color: C.navy },
      { type: "task", name: "契約条件精査・社内決裁", s: D(2026, 8, 1), e: D(2026, 8, 31), color: C.navy, live: true },
      { type: "ms", name: "定期建物賃貸借契約 締結／第1回敷金", date: D(2026, 9, 1), color: C.navy },
      { type: "task", name: "施設設置契約書（共用部客席）締結", s: D(2026, 9, 1), e: D(2026, 10, 31), color: C.navy },
      { type: "task", name: "新会社 設立", s: D(2026, 9, 15), e: D(2026, 11, 30), color: C.navy },
      { type: "task", name: "地位承継 覚書（3者）締結", s: D(2026, 12, 1), e: D(2026, 12, 25), color: C.navy },
      { type: "task", name: "B・C工事 賃貸人負担額 覚書", s: D(2027, 1, 15), e: D(2027, 2, 28), color: C.navy },
      { type: "ms", name: "第2回敷金・開店前準備期間負担金ほか", date: D(2027, 2, 14), color: C.navy },
      { type: "group", name: "設計", color: C.brass },
      { type: "task", name: "コンセプト・プラン決め", s: D(2026, 8, 1), e: D(2026, 9, 30), color: C.brass, live: true },
      { type: "ms", name: "プラン 確定", date: D(2026, 9, 30), color: C.brass },
      { type: "task", name: "デザインクライテリア 事前協議", s: D(2026, 9, 15), e: D(2026, 11, 30), color: C.brass },
      { type: "task", name: "基本設計", s: D(2026, 10, 1), e: D(2026, 11, 30), color: C.brass },
      { type: "task", name: "厨房計画・機器仕様確定", s: D(2026, 11, 1), e: D(2027, 1, 31), color: C.brass },
      { type: "task", name: "実施設計", s: D(2026, 12, 1), e: D(2027, 1, 31), color: C.brass },
      { type: "task", name: "保健所・消防 事前協議", s: D(2027, 1, 5), e: D(2027, 2, 28), color: C.brass },
      { type: "task", name: "工事等承認申請 → 賃貸人承認", s: D(2027, 1, 15), e: D(2027, 2, 14), color: C.brass },
    ],
  });
  footnote(s, "第23条1項により、賃貸人の承認前は着工できない。承認取得を2/14に置き、引渡日（2/15）から即着工する前提。");
}

// ==========================================================================
// 5. フェーズ② 工事
// ==========================================================================
{
  const s = pres.addSlide();
  titleSlide(s, "フェーズ② 工事 ─ B工事とC工事を並走させて2ヶ月で仕上げる", "2026年12月 – 2027年4月22日");
  s.addText("引渡と同時にB工事着手、5日遅れでC工事を重ねる。騒音・振動・臭気を伴う工種は時間制限を受ける前提で組む。", {
    x: 0.5, y: 1.18, w: 12.33, h: 0.26,
    fontSize: 10.5, fontFace: F.jp, color: C.grey, margin: 0,
  });

  addGantt(s, pres, {
    x: 0.5, y: 1.55, w: 12.33, h: 3.5, labelW: 3.1,
    start: D(2026, 12, 1), end: D(2027, 5, 8),
    rowFont: 10,
    rows: [
      { type: "group", name: "発注準備", color: C.bordeaux },
      { type: "task", name: "B工事 見積・発注（賃貸人指定業者）", s: D(2026, 12, 1), e: D(2027, 1, 31), color: C.bordeaux },
      { type: "task", name: "C工事 施工者選定・見積", s: D(2026, 12, 1), e: D(2027, 1, 31), color: C.bordeaux },
      { type: "ms", name: "C工事発注先 書面提出", date: D(2027, 2, 5), color: C.bordeaux },
      { type: "group", name: "施工", color: C.bordeaux },
      { type: "ms", name: "物件 引渡", date: D(2027, 2, 15), color: C.bordeaux },
      { type: "task", name: "B工事 施工", s: D(2027, 2, 15), e: D(2027, 4, 10), color: C.bordeaux },
      { type: "task", name: "C工事 施工（内装）", s: D(2027, 2, 20), e: D(2027, 4, 12), color: C.bordeaux },
      { type: "task", name: "厨房機器・什器・備品 搬入設置", s: D(2027, 4, 1), e: D(2027, 4, 15), color: C.bordeaux },
      { type: "task", name: "完成検査・是正", s: D(2027, 4, 13), e: D(2027, 4, 17), color: C.bordeaux },
      { type: "task", name: "消防・保健所検査／営業許可", s: D(2027, 4, 15), e: D(2027, 4, 22), color: C.bordeaux },
    ],
  });

  const notes = [
    { h: "工事区分", b: "A工事＝賃貸人負担／B工事＝賃借人負担・賃貸人施工／C工事＝賃借人負担・賃貸人承認の業者が施工。" },
    { h: "賃貸人負担 1億円", b: "B・C工事につき上限1億円を賃貸人が負担。ただし厨房機器・什器・備品は対象外。" },
    { h: "工事時間の制限", b: "事務所・住宅・美術館に近接するため、騒音・振動・臭気を伴う工事は実施時間の制限を受ける。" },
  ];
  const nw = (12.33 - 2 * 0.24) / 3;
  notes.forEach((n, i) => {
    const nx = 0.5 + i * (nw + 0.24);
    s.addShape(pres.ShapeType.rect, {
      x: nx, y: 5.3, w: nw, h: 1.32,
      fill: { color: C.band }, line: { color: C.line, width: 0.75 },
    });
    s.addText(n.h, {
      x: nx + 0.16, y: 5.42, w: nw - 0.32, h: 0.28,
      fontSize: 11, bold: true, fontFace: F.jp, color: C.bordeaux, margin: 0,
    });
    s.addText(n.b, {
      x: nx + 0.16, y: 5.72, w: nw - 0.32, h: 0.78,
      fontSize: 9.5, fontFace: F.jp, color: C.ink, margin: 0, valign: "top",
    });
  });
  footnote(s, "本契約第22条・第23条および特記事項 第4条・第6条による。");
}

// ==========================================================================
// 6. フェーズ③ 採用・開業準備
// ==========================================================================
{
  const s = pres.addSlide();
  titleSlide(s, "フェーズ③ 採用・開業準備 ─ 工事と独立して先行できる", "2026年8月 – 2027年4月30日");
  s.addText("採用とメニュー開発は工事の進捗に依存しない。ここを前倒しできれば、4月のトレーニング期間に余裕が生まれる。", {
    x: 0.5, y: 1.18, w: 12.33, h: 0.26,
    fontSize: 10.5, fontFace: F.jp, color: C.grey, margin: 0,
  });

  addGantt(s, pres, {
    x: 0.5, y: 1.55, w: 12.33, h: 5.1, labelW: 3.1,
    start: D(2026, 8, 1), end: D(2027, 5, 10), today: D(2026, 8, 18),
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
      { type: "task", name: "ワイン・食材 仕入先契約", s: D(2026, 12, 1), e: D(2027, 3, 15), color: C.plum },
      { type: "task", name: "原価設計・事業計画確定", s: D(2027, 1, 5), e: D(2027, 2, 28), color: C.plum },
      { type: "task", name: "POS・予約システム導入", s: D(2027, 1, 5), e: D(2027, 3, 31), color: C.plum },
      { type: "task", name: "販促・PR／メディア対応", s: D(2027, 1, 15), e: D(2027, 4, 29), color: C.plum },
      { type: "ms", name: "予約受付 開始", date: D(2027, 3, 16), color: C.plum },
      { type: "task", name: "スタッフトレーニング（1〜2週間）", s: D(2027, 4, 16), e: D(2027, 4, 28), color: C.plum },
      { type: "task", name: "プレオープン・レセプション", s: D(2027, 4, 27), e: D(2027, 4, 29), color: C.plum },
      { type: "ms", name: "グランドオープン", date: D(2027, 4, 30), color: C.plum },
    ],
  });
  footnote(s, "営業時間は11:00〜23:00、終日全席禁煙（特記事項 第1条・第10条）。");
}

// ==========================================================================
// 7. マイルストーン一覧
// ==========================================================================
{
  const s = pres.addSlide();
  titleSlide(s, "マイルストーン一覧", "確定事項と社内目標値");
  s.addText("網掛けは契約書で日付・金額が確定している事項。それ以外は確定事項から逆算した社内目標値。", {
    x: 0.5, y: 1.18, w: 12.33, h: 0.26,
    fontSize: 10.5, fontFace: F.jp, color: C.grey, margin: 0,
  });

  const head = ["期日", "マイルストーン", "根拠・備考"];
  const data = [
    ["2026.09.01", "定期建物賃貸借契約 締結", "第1回敷金 ¥11,105,988 預託／内装管理費 ¥1,285,130 一括払い", 1],
    ["2026.09.30", "設計プラン 確定", "基本設計着手の前提。以降のクリティカルパスの起点", 0],
    ["2026.11.30", "基本設計 完了・賃貸人事前協議 完了", "デザインクライテリア（特記事項 第6条2項）適合の確認", 0],
    ["2027.01.31", "実施設計 完了", "B工事・C工事の見積確定に必要", 0],
    ["2027.02.05", "C工事発注先の書面提出", "特記事項 第4条2項「C工事着手前、賃貸人の指定する期日まで」", 0],
    ["2027.02.14", "工事等承認申請 承認取得", "第23条1項。承認前は着工不可", 0],
    ["2027.02.14", "第2回敷金ほか 支払", "敷金 ¥462,780／開店前準備期間負担金 ¥550,770／契約時販促負担金 ¥1,000,000", 1],
    ["2027.02.15", "物件 引渡", "要目表(4)。出店期間の起算日。以降 B工事・C工事に着手", 1],
    ["2027.04.15", "工事 完成・引渡検査", "厨房機器・什器・備品の搬入設置を含む", 0],
    ["2027.04.22", "消防・保健所検査／飲食店営業許可 取得", "申請者名義は新会社への地位承継と整合させる", 0],
    ["2027.04.28", "スタッフトレーニング 完了", "1〜2週間（4/16〜4/28）", 0],
    ["2027.04.30", "グランドオープン（営業開始日）", "要目表(4)。同日から出店料・共益費・販促費の起算", 1],
  ];

  const rows = [head.map((h) => ({
    text: h,
    options: { bold: false, color: C.grey, fontSize: 9, fill: { color: C.band }, fontFace: F.jp },
  }))];
  for (const [dt, name, note, fixed] of data) {
    const bg = fixed ? "F7EBEE" : C.white;
    rows.push([
      { text: dt, options: { fontFace: F.num, bold: !!fixed, color: fixed ? C.bordeaux : C.ink, fill: { color: bg } } },
      { text: name, options: { fontFace: F.jp, bold: !!fixed, color: fixed ? C.bordeaux : C.ink, fill: { color: bg } } },
      { text: note, options: { fontFace: F.jp, color: C.grey, fill: { color: bg } } },
    ]);
  }

  s.addTable(rows, {
    x: 0.5, y: 1.6, w: 12.33, colW: [1.5, 4.1, 6.73],
    fontSize: 9.5, color: C.ink, valign: "middle",
    border: [
      { type: "none" }, { type: "none" },
      { type: "solid", color: C.line, pt: 0.5 }, { type: "none" },
    ],
    rowH: 0.36, margin: [3, 6, 3, 6],
  });
  footnote(s, SRC);
}

// ==========================================================================
// 8. 資金・支払スケジュール
// ==========================================================================
{
  const s = pres.addSlide();
  titleSlide(s, "資金・支払スケジュール", "契約要目表および特記事項 第2条・第3条");
  s.addText("出店料・負担金はいずれも消費税別途。網掛けは営業開始日（2027年4月30日）から発生する継続費用。", {
    x: 0.5, y: 1.18, w: 12.33, h: 0.26,
    fontSize: 10.5, fontFace: F.jp, color: C.grey, margin: 0,
  });

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
  footnote(s, "敷金総額 ¥38,870,959（@¥211,727/㎡）。解約金は平均月額出店料等の8ヶ月相当額、営業開始日前解約金は16ヶ月相当額に賃貸人負担額を加算。");
}

// ==========================================================================
// 9. クリティカルパスと留意点
// ==========================================================================
{
  const s = pres.addSlide();
  titleSlide(s, "クリティカルパスと留意点", "リスクと対策");

  const risks = [
    {
      cat: "工期",
      h: "引渡から完成まで実質2ヶ月",
      b: "重飲食・厨房付き183.59㎡としては極めてタイト。B工事とC工事の取り合いが滞れば4月中旬完成が崩れる。",
      f: "引渡前に施工者間で総合工程・取り合い調整を完了。厨房機器は実施設計完了時点（1月末）で発注確定。",
    },
    {
      cat: "工事条件",
      h: "騒音・振動・臭気を伴う工事は時間制限",
      b: "事務所・住宅・美術館に近接するため、工事実施時間の制限が工期と費用に影響する旨を承諾する条項がある。",
      f: "1日あたりの作業可能時間帯を書面で確認し、深夜・早朝の割増を当初予算に織り込む。",
    },
    {
      cat: "承認",
      h: "賃貸人承認が二段構え",
      b: "デザインクライテリア承認と工事等承認申請の双方が必要で、いずれも承認前は着工できない。",
      f: "基本設計段階（10〜11月）からサイン・ファサードを先行協議し、2/14までに承認を取り切る。",
    },
    {
      cat: "費用区分",
      h: "賃貸人負担1億円の確定は覚書待ち",
      b: "金額は見積書と内装工事図面に基づき確定する建付け。厨房機器・什器・備品は賃貸人負担の対象外。",
      f: "負担区分を発注前に合意し、1月末の見積確定と同時に覚書ドラフトを回付。自社負担額を2月上旬に確定。",
    },
    {
      cat: "組織",
      h: "地位承継と許認可名義の整合",
      b: "新会社への承継は賃借人が連帯保証人となることを条件に賃貸人が承諾し、3者覚書を締結する。",
      f: "新会社設立を11月末までに完了し年内に覚書締結。以降の工事発注・許認可は新会社名義に統一。",
    },
    {
      cat: "契約リスク",
      h: "開業遅延のペナルティが重い",
      b: "営業開始日に営業を開始しないことは契約解除事由。営業開始日前の解約は出店料等16ヶ月相当額＋賃貸人負担額。",
      f: "トレーニング期間をバッファ扱いしない。完成を4/10目標で管理し、是正の予備日を5日確保する。",
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
      fontSize: 9, fontFace: F.jp, margin: 0,
    });
  });
  footnote(s, SRC);
}

// ==========================================================================
// 10. 次のアクション
// ==========================================================================
{
  const s = darkSlide();
  s.addText("次のアクション", {
    x: 0.9, y: 0.95, w: 11.5, h: 0.6,
    fontSize: 30, fontFace: F.mincho, color: C.white, margin: 0,
  });

  const acts = [
    { d: "2026年8月中", h: "契約条件の最終確認と社内決裁", b: "9月1日の契約締結と第1回敷金 ¥11,105,988・内装管理費 ¥1,285,130 の資金手当てを確定させる。" },
    { d: "2026年9月末", h: "設計プランの確定", b: "以降の全工程がここから逆算される。同時にデザインクライテリアの事前協議を賃貸人と開始する。" },
    { d: "2026年10月末", h: "幹部採用の完了と新会社設立の着手", b: "総支配人・エグゼクティブシェフを確定し、11月末の新会社設立、年内の3者覚書締結につなげる。" },
  ];
  acts.forEach((a, i) => {
    const ay = 2.15 + i * 1.42;
    s.addText(String(i + 1), {
      x: 0.9, y: ay, w: 0.5, h: 0.5,
      fontSize: 26, fontFace: F.num, color: "E0A5B4", margin: 0,
    });
    s.addText(a.d, {
      x: 1.55, y: ay + 0.02, w: 2.2, h: 0.3,
      fontSize: 11, fontFace: F.num, color: "E0A5B4", margin: 0,
    });
    s.addText(a.h, {
      x: 3.8, y: ay - 0.02, w: 8.5, h: 0.36,
      fontSize: 17, bold: true, fontFace: F.jp, color: C.white, margin: 0,
    });
    s.addText(a.b, {
      x: 3.8, y: ay + 0.4, w: 8.5, h: 0.6,
      fontSize: 10.5, fontFace: F.jp, color: "E8D5DA", margin: 0,
    });
  });

  s.addText("株式会社WineBank　2026年8月18日", {
    x: 7.4, y: 6.7, w: 5, h: 0.3,
    fontSize: 10, fontFace: F.jp, color: "E8D5DA", align: "right", margin: 0,
  });
}

const out = path.join(__dirname, "THIERRY_MARX_BISTRO_開業工程_20260818.pptx");
pres.writeFile({ fileName: out }).then(() => console.log("wrote", out));
