const pptxgen = require("pptxgenjs");

/* ============================ Design tokens ============================ */
const INK       = "1A0E14"; // near-black plum (dark grounds)
const INK2      = "2A141D";
const WINE      = "6B1F32"; // primary bordeaux
const WINE_DEEP = "45121F";
const WINE_SOFT = "9B5568";
const GOLD      = "C2A15A";
const GOLD_LT   = "E6D6AE";
const PAPER     = "FFFFFF";
const MIST      = "F4F1F2"; // card tint
const MIST2     = "EAE4E6";
const TEXT      = "241A1E";
const GREY      = "6E666A";
const GREY_LT   = "9A9498";

const FJP  = "Yu Gothic";      // Japanese + latin body
const FEN  = "Cambria";        // latin display accents

const W = 13.333, H = 7.5;
const M = 0.62;               // page margin

const pres = new pptxgen();
pres.defineLayout({ name: "W16x9", width: W, height: H });
pres.layout = "W16x9";
pres.author = "株式会社WineBank";
pres.company = "株式会社WineBank";
pres.title = "森ビル株式会社 業務提携ご提案";

let pageNo = 0;

/* ============================ Helpers ============================ */

function softShadow() {
  return { type: "outer", color: "8A7078", blur: 10, offset: 2, angle: 90, opacity: 0.18 };
}

function newSlide(dark) {
  const s = pres.addSlide();
  s.background = { color: dark ? INK : PAPER };
  return s;
}

// Light content slide with standard header
function contentSlide(kicker, title, lead) {
  pageNo++;
  const s = newSlide(false);
  s.addText(kicker, {
    x: M, y: 0.42, w: 9.0, h: 0.26, margin: 0,
    fontFace: FEN, fontSize: 11, bold: true, color: GOLD, charSpacing: 2.4,
  });
  s.addText(title, {
    x: M, y: 0.72, w: 11.2, h: 0.62, margin: 0,
    fontFace: FJP, fontSize: 30, bold: true, color: WINE_DEEP,
  });
  if (lead) {
    s.addText(lead, {
      x: M, y: 1.40, w: 12.1, h: 0.42, margin: 0,
      fontFace: FJP, fontSize: 13, color: GREY, lineSpacing: 19,
    });
  }
  footer(s);
  return s;
}

function footer(s, darkMode) {
  s.addText("WineBank × Mori Building ｜ 業務提携ご提案", {
    x: M, y: H - 0.46, w: 6.0, h: 0.26, margin: 0,
    fontFace: FJP, fontSize: 8.5, color: darkMode ? "6A5560" : GREY_LT,
  });
  s.addText(String(pageNo), {
    x: W - M - 0.9, y: H - 0.46, w: 0.9, h: 0.26, margin: 0, align: "right",
    fontFace: FEN, fontSize: 9, color: darkMode ? "6A5560" : GREY_LT,
  });
  s.addText("CONFIDENTIAL", {
    x: W - M - 3.0, y: H - 0.46, w: 2.0, h: 0.26, margin: 0, align: "right",
    fontFace: FEN, fontSize: 8, color: darkMode ? "5A4750" : "C6C0C3", charSpacing: 1.2,
  });
}

// Rounded tinted card
function card(s, x, y, w, h, opts = {}) {
  s.addShape(pres.ShapeType.roundRect, {
    x, y, w, h, rectRadius: 0.09,
    fill: { color: opts.fill || MIST },
    line: opts.line ? { color: opts.line, width: 1 } : { color: opts.fill || MIST, width: 0 },
    shadow: opts.shadow === false ? undefined : softShadow(),
  });
}

// Gold outlined circle carrying a number or short glyph
function badge(s, x, y, d, label, opts = {}) {
  s.addShape(pres.ShapeType.ellipse, {
    x, y, w: d, h: d,
    fill: { color: opts.fill || "FFFFFF" },
    line: { color: opts.line || GOLD, width: 1.25 },
  });
  s.addText(label, {
    x, y, w: d, h: d, margin: 0, align: "center", valign: "middle",
    fontFace: FEN, fontSize: opts.size || 13, bold: true, color: opts.color || WINE,
  });
}

function bullets(s, items, x, y, w, h, opts = {}) {
  s.addText(
    items.map((t, i) => ({
      text: t,
      options: { bullet: { code: "25AA" }, breakLine: i !== items.length - 1 },
    })),
    {
      x, y, w, h, margin: 0,
      fontFace: FJP, fontSize: opts.size || 11.5, color: opts.color || TEXT,
      lineSpacing: opts.lineSpacing || 17, paraSpaceAfter: opts.gap === undefined ? 5 : opts.gap,
    }
  );
}

/* ============================ 1. Title ============================ */
{
  const s = newSlide(true);
  // depth: two soft plum blocks, no stripes
  s.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: W, h: H, fill: { color: INK } });
  s.addShape(pres.ShapeType.ellipse, {
    x: 8.3, y: -2.4, w: 8.2, h: 8.2, fill: { color: WINE_DEEP, transparency: 45 }, line: { width: 0 },
  });
  s.addShape(pres.ShapeType.ellipse, {
    x: 9.9, y: 2.6, w: 5.4, h: 5.4, fill: { color: WINE, transparency: 62 }, line: { width: 0 },
  });

  s.addText("BUSINESS PARTNERSHIP PROPOSAL", {
    x: M, y: 1.16, w: 8.0, h: 0.3, margin: 0,
    fontFace: FEN, fontSize: 12, bold: true, color: GOLD, charSpacing: 3.4,
  });
  s.addText("森ビル株式会社 御中", {
    x: M, y: 1.60, w: 8.0, h: 0.4, margin: 0,
    fontFace: FJP, fontSize: 15, color: GOLD_LT,
  });
  s.addText("ヒルズ経済圏 × 高級ワイン", {
    x: M, y: 2.18, w: 9.4, h: 0.85, margin: 0,
    fontFace: FJP, fontSize: 42, bold: true, color: PAPER,
  });
  s.addText("「世界一のセラーがある街」を、港区に。", {
    x: M, y: 3.06, w: 9.4, h: 0.62, margin: 0,
    fontFace: FJP, fontSize: 26, bold: true, color: GOLD,
  });
  s.addText(
    "主要ヒルズのワーカー・レジデンス居住者に向けた、\nワイン・ライフスタイル基盤の共同構築に関するご提案",
    { x: M, y: 3.80, w: 8.2, h: 0.8, margin: 0, fontFace: FJP, fontSize: 13.5, color: "CDBFC5", lineSpacing: 22 }
  );

  // stat strip
  const stats = [
    ["55年", "酒販事業の仕入実績"],
    ["30億円", "管理ワイン在庫（26年4月末）"],
    ["7.2億円", "累計調達額"],
    ["約4倍", "ワイン指数 20年上昇（Liv-ex 1000）"],
  ];
  stats.forEach((st, i) => {
    const x = M + i * 3.0;
    s.addText(st[0], {
      x, y: 5.10, w: 2.8, h: 0.5, margin: 0,
      fontFace: FJP, fontSize: 27, bold: true, color: GOLD,
    });
    s.addText(st[1], {
      x, y: 5.62, w: 2.8, h: 0.5, margin: 0,
      fontFace: FJP, fontSize: 9.5, color: "B4A6AC", lineSpacing: 13,
    });
  });

  s.addText("2026年8月　株式会社WineBank", {
    x: M, y: 6.62, w: 6.0, h: 0.3, margin: 0, fontFace: FJP, fontSize: 11, color: "9C8C93",
  });
  s.addText("CONFIDENTIAL", {
    x: W - M - 3.0, y: 6.62, w: 3.0, h: 0.3, margin: 0, align: "right",
    fontFace: FEN, fontSize: 9.5, color: "7A6771", charSpacing: 1.6,
  });
  s.addNotes("森ビル様向け業務提携提案。ヒルズワーカー・レジデンス居住者を対象に、WineBank CLUB／レジデンス購買連携／WineGO／クラウドワインセラー出店／ティエリー・マルクス業態／ワイン預りの6プログラムを提案する。");
}

/* ============================ 2. Executive Summary ============================ */
{
  const s = contentSlide("EXECUTIVE SUMMARY", "ご提案の骨子",
    "港区の主要ヒルズに、「買う・飲む・預ける・育てる」を一つに束ねたワイン基盤を共同で実装させていただきたく存じます。");

  // headline band
  card(s, M, 1.92, W - M * 2, 0.94, { fill: WINE_DEEP, shadow: false });
  s.addText(
    "ヒルズは、日本で最も「高級ワインを最も必要とする人」が密集する街。しかし街の中に、正しい品質・正しい価格で即座に手に入る基盤は存在しません。",
    { x: M + 0.34, y: 1.92, w: W - M * 2 - 0.68, h: 0.94, margin: 0, valign: "middle",
      fontFace: FJP, fontSize: 14, bold: true, color: GOLD_LT, lineSpacing: 21 }
  );

  const cols = [
    { n: "01", t: "何を", b: ["6つのプログラムを束ねた「Hills Wine Program」を共同組成", "会員 / 購買 / 配送 / 施設 / 飲食 / 保管を一気通貫"] },
    { n: "02", t: "誰に", b: ["主要ヒルズのオフィスワーカー（法人接待・会食需要）", "ヒルズレジデンス居住者（自宅消費・コレクション・資産）"] },
    { n: "03", t: "森ビル様の便益", b: ["テナント・居住者の付加価値と定着率", "商業区画の話題性と賃料・NOI向上余地", "レベニューシェアによる新規収益"] },
    { n: "04", t: "当社が持ち込むもの", b: ["30億円の管理ワイン在庫と55年の仕入網", "グランメゾン運営／ティエリー・マルクス", "WineGO 定温ラストワンマイル網"] },
  ];
  const cw = (W - M * 2 - 0.36 * 3) / 4;
  cols.forEach((c, i) => {
    const x = M + i * (cw + 0.36);
    card(s, x, 3.12, cw, 2.86);
    badge(s, x + 0.30, 3.40, 0.52, c.n, { size: 12 });
    s.addText(c.t, {
      x: x + 0.30, y: 4.04, w: cw - 0.6, h: 0.34, margin: 0,
      fontFace: FJP, fontSize: 15, bold: true, color: WINE_DEEP,
    });
    bullets(s, c.b, x + 0.30, 4.44, cw - 0.6, 1.42, { size: 10.5, lineSpacing: 15, gap: 6 });
  });

  s.addText("※ 各プログラムは単独でも成立し、段階的な導入が可能です（詳細は後掲の導入ロードマップをご参照ください）。", {
    x: M, y: 6.16, w: 11.0, h: 0.3, margin: 0, fontFace: FJP, fontSize: 9.5, color: GREY_LT,
  });
}

/* ============================ 3. Why now ============================ */
{
  const s = contentSlide("WHY NOW", "なぜ、いま「街 × ワイン」なのか",
    "高級ワインは、消費財であると同時に、株式との相関が低い実物資産として富裕層のポートフォリオに定着しつつあります。");

  const stats = [
    { v: "1/4", sz: 30, l: "世界の富裕層のうち\nワインコレクターとされる割合" },
    { v: "約4倍", sz: 30, l: "Liv-ex Fine Wine 1000\n過去20年の指数上昇" },
    { v: "約4,700億円", sz: 22, l: "国内ワイン市場規模\n（国内製造＋輸入・2022年実績）" },
    { v: "+18.06%", sz: 27, l: "P1ファンド累計実績\n（2022.9〜2026.4・経費控除後）" },
  ];
  const cw = (W - M * 2 - 0.32 * 3) / 4;
  stats.forEach((st, i) => {
    const x = M + i * (cw + 0.32);
    card(s, x, 2.00, cw, 1.66);
    s.addText(st.v, {
      x: x + 0.24, y: 2.18, w: cw - 0.48, h: 0.58, margin: 0, valign: "middle",
      fontFace: FJP, fontSize: st.sz, bold: true, color: WINE,
    });
    s.addText(st.l, {
      x: x + 0.24, y: 2.82, w: cw - 0.48, h: 0.66, margin: 0,
      fontFace: FJP, fontSize: 10, color: GREY, lineSpacing: 14,
    });
  });

  // Two-column: 街の現実 / 空白
  card(s, M, 3.92, 6.06, 2.20, { fill: MIST });
  s.addText("港区・ヒルズの現実", {
    x: M + 0.32, y: 4.12, w: 5.4, h: 0.34, margin: 0,
    fontFace: FJP, fontSize: 15, bold: true, color: WINE_DEEP,
  });
  bullets(s, [
    "接待・会食は日常業務。ワインは「格」を伝える最重要ツール",
    "レジデンス居住者は自宅セラーを持つが、補充・管理・目利きは自力",
    "海外からの居住者・来訪者ほど、ワインの質に対する評価眼が厳しい",
  ], M + 0.32, 4.52, 5.42, 1.44, { size: 11, lineSpacing: 16 });

  card(s, M + 6.42, 3.92, 6.06, 2.20, { fill: WINE_DEEP, shadow: false });
  s.addText("いま街に足りないもの", {
    x: M + 6.74, y: 4.12, w: 5.4, h: 0.34, margin: 0,
    fontFace: FJP, fontSize: 15, bold: true, color: GOLD,
  });
  bullets(s, [
    "正規品を、正しい価格（ネット最安値水準）で買える窓口",
    "「今夜必要」に応える、定温・即時のラストワンマイル",
    "所有ワインを預け、時価で把握し、いつでも出せる仕組み",
  ], M + 6.74, 4.52, 5.42, 1.44, { size: 11, lineSpacing: 16, color: "E8DDE1" });

  s.addText("出典：Liv-ex、キリンHD「2024年 日本のワイン市場」、当社P1ファンド運用実績。ワインの将来の運用成果を保証するものではありません。", {
    x: M, y: 6.30, w: 12.0, h: 0.3, margin: 0, fontFace: FJP, fontSize: 8.5, color: GREY_LT,
  });
}

/* ============================ 4. Target ============================ */
{
  const s = contentSlide("TARGET", "ターゲット：ヒルズワーカー と ヒルズレジデンス",
    "同じ「高級ワイン」でも、二つの層は求めるものが異なります。両方を一つの基盤で満たします。");

  const groups = [
    {
      title: "ヒルズワーカー",
      sub: "六本木・麻布台・虎ノ門・アークヒルズ等のオフィス就業者",
      tone: WINE_DEEP,
      pain: [
        "接待でのワインは店内価格が市価の2〜3倍。経費が膨らむ",
        "急な会食に、店の在庫だけでは「格」に見合う一本が出せない",
        "自分で選ぶ自信がなく、結局いつも同じ銘柄になる",
      ],
      sol: [
        "提携店へのコルケージ完全無料 ＋ 手ぶらBYO（WineGOが会場へ直送）",
        "ネット最安値水準での購入と、専属コンシェルジュによる銘柄選定",
        "グループ飲食店20%OFF・乾杯シャンパンサービス",
      ],
    },
    {
      title: "ヒルズレジデンス居住者",
      sub: "住宅棟・サービスアパートメントの居住者／ご家族",
      tone: WINE,
      pain: [
        "自宅セラーはすぐ満杯。良い年を買い増せず、保管環境も不安",
        "所有ワインの本数・時価・飲み頃を誰も把握していない",
        "並行品・二次流通品の真贋と来歴が確認できない",
      ],
      sol: [
        "全ボトル撮影・登録・時価評価のうえお預かり、いつでも出庫",
        "正規インポーター直の仕入と真贋保証・プロヴナンス管理",
        "記念年ヴィンテージ・ギフト・ホームパーティの一括手配",
      ],
    },
  ];

  const cw = (W - M * 2 - 0.42) / 2;
  groups.forEach((g, i) => {
    const x = M + i * (cw + 0.42);
    card(s, x, 1.94, cw, 4.26, { fill: MIST });
    s.addShape(pres.ShapeType.roundRect, {
      x, y: 1.94, w: cw, h: 0.86, rectRadius: 0.09, fill: { color: g.tone }, line: { width: 0 },
    });
    s.addText(g.title, {
      x: x + 0.34, y: 2.02, w: cw - 0.68, h: 0.4, margin: 0,
      fontFace: FJP, fontSize: 19, bold: true, color: PAPER,
    });
    s.addText(g.sub, {
      x: x + 0.34, y: 2.42, w: cw - 0.68, h: 0.3, margin: 0,
      fontFace: FJP, fontSize: 10, color: "D9C9CF",
    });

    s.addText("いま抱えている課題", {
      x: x + 0.34, y: 3.02, w: cw - 0.68, h: 0.28, margin: 0,
      fontFace: FJP, fontSize: 12, bold: true, color: GREY,
    });
    bullets(s, g.pain, x + 0.34, 3.34, cw - 0.68, 1.20, { size: 10.8, lineSpacing: 15, color: TEXT });

    s.addShape(pres.ShapeType.line, {
      x: x + 0.34, y: 4.62, w: cw - 0.68, h: 0, line: { color: MIST2, width: 1 },
    });
    s.addText("Hills Wine Program の解", {
      x: x + 0.34, y: 4.72, w: cw - 0.68, h: 0.28, margin: 0,
      fontFace: FJP, fontSize: 12, bold: true, color: WINE,
    });
    bullets(s, g.sol, x + 0.34, 5.04, cw - 0.68, 1.06, { size: 10.8, lineSpacing: 15, color: TEXT });
  });
}

/* ============================ 5. Program overview ============================ */
{
  const s = contentSlide("PARTNERSHIP OVERVIEW", "提携全体像：Hills Wine Program（6プログラム）",
    "ワーカー・レジデンス・商業区画のそれぞれに接点を持ち、一つの会員基盤で束ねます。");

  const progs = [
    { n: "01", t: "WineBank CLUB ヒルズ会員", d: "テナント法人・居住者向けの特別会員枠。飲食20%OFF、コルケージ無料、月3回無料配送。", tag: "ワーカー／レジデンス" },
    { n: "02", t: "レジデンス・ワイン購買連携", d: "コンシェルジュ経由で正規品を直接ご購入。真贋保証と来歴管理を伴う「信用力のある窓口」。", tag: "レジデンス" },
    { n: "03", t: "WineGO ヒルズ・デリバリー", d: "街区内ターミナルから定温で最短5分。利便性と価格を両立した即時配送網。", tag: "ワーカー／レジデンス" },
    { n: "04", t: "クラウドワインセラー出店", d: "数千本規模のウォークインセラーを核とした、在庫共有型フードホールを商業区画に。", tag: "商業施設" },
    { n: "05", t: "ティエリー・マルクス業態出店", d: "ミシュラン累計7つ星シェフの日本再進出業態。街区の格とメディア露出を創出。", tag: "商業施設" },
    { n: "06", t: "富裕層向けワイン預りサービス", d: "全ボトル撮影・登録・時価評価のうえ定温保管。動産保険と承継サポートまで。", tag: "レジデンス" },
  ];

  const cw = (W - M * 2 - 0.34 * 2) / 3;
  const ch = 1.98;
  progs.forEach((p, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = M + col * (cw + 0.34);
    const y = 1.96 + row * (ch + 0.24);
    card(s, x, y, cw, ch);
    badge(s, x + 0.28, y + 0.32, 0.50, p.n, { size: 11.5 });
    s.addText(p.t, {
      x: x + 0.88, y: y + 0.20, w: cw - 1.14, h: 0.72, margin: 0, valign: "middle",
      fontFace: FJP, fontSize: 12.5, bold: true, color: WINE_DEEP,
    });
    s.addText(p.d, {
      x: x + 0.28, y: y + 0.98, w: cw - 0.56, h: 0.62, margin: 0,
      fontFace: FJP, fontSize: 10.2, color: TEXT, lineSpacing: 14.5,
    });
    s.addText(p.tag, {
      x: x + 0.28, y: y + ch - 0.38, w: cw - 0.56, h: 0.26, margin: 0,
      fontFace: FJP, fontSize: 9, bold: true, color: GOLD,
    });
  });

  s.addText("6つは独立して導入可能ですが、①の会員基盤に接続することで顧客データ・単価・継続率が最大化されます。", {
    x: M, y: 6.34, w: 12.0, h: 0.3, margin: 0, fontFace: FJP, fontSize: 10.5, color: WINE, bold: true,
  });
}

/* ============================ 6. P01 WineBank CLUB ============================ */
{
  const s = contentSlide("PROGRAM 01", "WineBank CLUB ヒルズ会員プログラム",
    "既存のWineBank CLUBに「ヒルズ枠」を新設。テナント法人の福利厚生と、レジデンス居住者特典として提供します。");

  card(s, M, 1.94, 7.42, 4.26, { fill: MIST });
  s.addText("会員特典（ヒルズ枠・標準セット）", {
    x: M + 0.34, y: 2.16, w: 6.8, h: 0.34, margin: 0,
    fontFace: FJP, fontSize: 16, bold: true, color: WINE_DEEP,
  });

  const perks = [
    ["グループ飲食店 20%OFF", "アピシウス、ティエリー・マルクス業態ほか。将来的に100店舗以上へ拡大予定。"],
    ["コルケージ完全無料", "提携26店舗へのBYOで抜栓料・持込料ゼロ。重いボトルはWineGOが運ぶ「手ぶらBYO」。"],
    ["ワイン配送 月3回無料", "自宅・会食先・贈答先へ。都心はWineGOで当日デリバリー。"],
    ["ネット最安値水準で購入", "インポーター直の仕入力による特別価格（10〜20%OFF）。"],
    ["ワイン100本お預かり", "ご自宅に眠るワインを引き取り、撮影・登録・時価査定のうえ保管。"],
  ];
  perks.forEach((p, i) => {
    const y = 2.62 + i * 0.68;
    badge(s, M + 0.36, y + 0.03, 0.34, "✓", { size: 11, color: GOLD });
    s.addText(p[0], {
      x: M + 0.84, y, w: 6.4, h: 0.26, margin: 0,
      fontFace: FJP, fontSize: 12, bold: true, color: TEXT,
    });
    s.addText(p[1], {
      x: M + 0.84, y: y + 0.26, w: 6.4, h: 0.36, margin: 0,
      fontFace: FJP, fontSize: 9.5, color: GREY, lineSpacing: 13,
    });
  });

  const rx = M + 7.84;
  const rw = W - M - rx;
  card(s, rx, 1.94, rw, 1.86, { fill: WINE_DEEP, shadow: false });
  s.addText("森ビル様の便益", {
    x: rx + 0.32, y: 2.10, w: rw - 0.64, h: 0.32, margin: 0,
    fontFace: FJP, fontSize: 15, bold: true, color: GOLD,
  });
  bullets(s, [
    "テナント法人への他にない福利厚生メニュー",
    "レジデンス契約時の付加価値・更新率向上",
    "Hills Club／アカデミーヒルズ等 既存会員組織との相互送客",
  ], rx + 0.32, 2.46, rw - 0.64, 1.20, { size: 10.2, lineSpacing: 14, gap: 4, color: "E8DDE1" });

  card(s, rx, 3.96, rw, 2.24, { fill: MIST });
  s.addText("提供・課金イメージ", {
    x: rx + 0.32, y: 4.12, w: rw - 0.64, h: 0.32, margin: 0,
    fontFace: FJP, fontSize: 15, bold: true, color: WINE_DEEP,
  });
  bullets(s, [
    "個人会員：年会費制（通常30万円／年、ヒルズ枠は特別設定）",
    "法人会員：テナント企業単位の包括契約（人数枠課金）",
    "森ビル様には会費のレベニューシェアをお支払い",
    "入会・本人確認・請求は当社が全て運用（森ビル様の実務負荷ゼロ）",
  ], rx + 0.32, 4.50, rw - 0.64, 1.58, { size: 10, lineSpacing: 14, gap: 4 });
}

/* ============================ 7. P02 Residence purchase ============================ */
{
  const s = contentSlide("PROGRAM 02", "レジデンス・ワイン購買連携",
    "「どこで買えば間違いないか」に、街として答えを持つ。エノテカに代表される専門店級の信用力を、レジデンスのサービス導線に組み込みます。");

  // credibility pillars
  const pillars = [
    { t: "正規ルート仕入", d: "海外ドメーヌ・ネゴシアン・国内正規インポーターからの直接買付。並行品・二次流通品に依存しません。" },
    { t: "真贋保証と来歴管理", d: "フランス国家ソムリエ資格保持者が選定。プロヴナンス（来歴）を全ボトルで管理。" },
    { t: "55年の割当力", d: "市場に出る前に押さえられるトップキュヴェの優先割当枠を確保。" },
    { t: "適正価格", d: "会員はネット最安値水準（10〜20%OFF）。店頭価格・レストラン価格との差が明確。" },
  ];
  const cw = (W - M * 2 - 0.30 * 3) / 4;
  pillars.forEach((p, i) => {
    const x = M + i * (cw + 0.30);
    card(s, x, 2.06, cw, 1.86);
    s.addText(p.t, {
      x: x + 0.26, y: 2.28, w: cw - 0.52, h: 0.34, margin: 0,
      fontFace: FJP, fontSize: 13, bold: true, color: WINE,
    });
    s.addText(p.d, {
      x: x + 0.26, y: 2.68, w: cw - 0.52, h: 1.02, margin: 0,
      fontFace: FJP, fontSize: 10, color: TEXT, lineSpacing: 14,
    });
  });

  // flow
  s.addText("ご利用の流れ", {
    x: M, y: 4.14, w: 5.0, h: 0.32, margin: 0,
    fontFace: FJP, fontSize: 15, bold: true, color: WINE_DEEP,
  });
  const steps = [
    ["01", "ご相談", "コンシェルジュ／専用アプリから\n予算とシーンをお伝えいただく"],
    ["02", "ご提案", "ソムリエが銘柄を選定。\n記念年ヴィンテージ・ギフトにも対応"],
    ["03", "納品", "定温配送でご自宅セラーへ。\n贈答先への直送・のし対応も可"],
    ["04", "その後", "購入履歴と時価をクラウド管理。\nお預かり・買取・出庫まで一気通貫"],
  ];
  const sw = (W - M * 2 - 0.30 * 3) / 4;
  steps.forEach((st, i) => {
    const x = M + i * (sw + 0.30);
    card(s, x, 4.56, sw, 1.56, { fill: i === 3 ? WINE_DEEP : MIST, shadow: i !== 3 });
    const dark = i === 3;
    s.addText(st[0], {
      x: x + 0.26, y: 4.72, w: 1.0, h: 0.3, margin: 0,
      fontFace: FEN, fontSize: 12, bold: true, color: GOLD,
    });
    s.addText(st[1], {
      x: x + 0.26, y: 5.02, w: sw - 0.52, h: 0.3, margin: 0,
      fontFace: FJP, fontSize: 13, bold: true, color: dark ? PAPER : WINE_DEEP,
    });
    s.addText(st[2], {
      x: x + 0.26, y: 5.36, w: sw - 0.52, h: 0.62, margin: 0,
      fontFace: FJP, fontSize: 9.5, color: dark ? "E8DDE1" : GREY, lineSpacing: 13,
    });
  });

  s.addText("森ビル様には、レジデンスのコンシェルジュ導線・入居者向け案内へのご掲載をお願いし、売上のレベニューシェアをお支払いします。", {
    x: M, y: 6.28, w: 12.0, h: 0.3, margin: 0, fontFace: FJP, fontSize: 9.5, color: GREY_LT,
  });
}

/* ============================ 8. P03 WineGO ============================ */
{
  const s = contentSlide("PROGRAM 03", "WineGO ヒルズ・デリバリー",
    "「カクヤスの利便性と価格」を、高級ワインで。街区内のターミナルから、定温のまま最短5分でお届けします。");

  // comparison strip
  const comp = [
    { h: "一般的な酒類配送", b: ["最短60分〜／常温配送", "希少銘柄の取扱いなし", "夜間・突発の依頼に弱い"], dark: false },
    { h: "WineGO", b: ["街区内ターミナルから最短5分", "10〜15℃の定温ラストワンマイル", "希少ヴィンテージ・超高級シャンパンを常時"], dark: true },
  ];
  const cw2 = 3.42;
  comp.forEach((c, i) => {
    const x = M + i * (cw2 + 0.30);
    card(s, x, 2.02, cw2, 1.98, { fill: c.dark ? WINE_DEEP : MIST, shadow: !c.dark });
    s.addText(c.h, {
      x: x + 0.28, y: 2.22, w: cw2 - 0.56, h: 0.32, margin: 0,
      fontFace: FJP, fontSize: 14, bold: true, color: c.dark ? GOLD : GREY,
    });
    bullets(s, c.b, x + 0.28, 2.60, cw2 - 0.56, 1.20,
      { size: 10.3, lineSpacing: 14.5, color: c.dark ? "E8DDE1" : TEXT });
  });

  // 4 use cases
  const ux = M + (cw2 + 0.30) * 2;
  const uw = W - M - ux;
  card(s, ux, 2.02, uw, 4.18, { fill: MIST });
  s.addText("ヒルズでの4つの使い方", {
    x: ux + 0.34, y: 2.22, w: uw - 0.68, h: 0.32, margin: 0,
    fontFace: FJP, fontSize: 16, bold: true, color: WINE_DEEP,
  });
  const uses = [
    ["自宅配送", "居住者がアプリで購入。配送員が定温のままセラーまで。4桁コードで受渡し。"],
    ["ターミナル受取", "街区内の提携店・拠点で好きな時間にピックアップ。帰宅動線で完結。"],
    ["会食先への事前配送", "提携レストランへ事前に届けておき、手ぶらで会食へ。コルケージは無料。"],
    ["会食中の追加オーダー", "「もう一本」に、席を立たずに応える。5〜10分で店へ到着。"],
  ];
  uses.forEach((u, i) => {
    const y = 2.68 + i * 0.86;
    badge(s, ux + 0.36, y + 0.04, 0.42, String(i + 1), { size: 11 });
    s.addText(u[0], {
      x: ux + 0.92, y, w: uw - 1.26, h: 0.28, margin: 0,
      fontFace: FJP, fontSize: 12.5, bold: true, color: TEXT,
    });
    s.addText(u[1], {
      x: ux + 0.92, y: y + 0.28, w: uw - 1.26, h: 0.46, margin: 0,
      fontFace: FJP, fontSize: 9.8, color: GREY, lineSpacing: 13.5,
    });
  });

  // what we need
  card(s, M, 4.22, cw2 * 2 + 0.30, 1.98, { fill: PAPER, line: MIST2 });
  s.addText("森ビル様にお願いしたいこと", {
    x: M + 0.28, y: 4.42, w: 6.6, h: 0.3, margin: 0,
    fontFace: FJP, fontSize: 14, bold: true, color: WINE,
  });
  bullets(s, [
    "街区内バックヤード等に、小規模ターミナル（2〜5坪）のご提供",
    "配送員の館内動線・荷捌きに関する運用ご調整",
    "テナント飲食店へのご紹介（在庫リスクゼロの共有セラーとして提案）",
  ], M + 0.28, 4.80, 6.6, 1.24, { size: 10.5, lineSpacing: 15 });

  s.addText("※ WineGOは飲食店向けの「クラウド型共有セラー」として設計。ヒルズ内テナント飲食店は在庫を持たずに希少銘柄を提供でき、CF改善にも直結します。", {
    x: M, y: 6.32, w: 12.0, h: 0.3, margin: 0, fontFace: FJP, fontSize: 8.8, color: GREY_LT,
  });
}

/* ============================ 9. P04 Cloud wine cellar ============================ */
{
  const s = contentSlide("PROGRAM 04", "クラウドワインセラー出店（商業区画）",
    "『大型ウォークインワインセラーを目玉とした、セラー在庫共有型フードホール』。数千本のセラーを中央に据え、360度を専門飲食区画が囲みます。");

  // concept points
  const pts = [
    { n: "01", t: "360度の大型ウォークインセラー", d: "数千本規模のセラーが全区画からの借景となり、他にない空間体験を生む。" },
    { n: "02", t: "在庫はセラーが持つ", d: "各店は在庫を抱えず、必要な分を卸値〜ネット最安値で即時購入。CFが劇的に改善。" },
    { n: "03", t: "回遊通路で施設全体へ", d: "セラーを囲む回遊動線が滞在時間を延ばし、隣接区画への送客を生む。" },
  ];
  const pw = (W - M * 2 - 0.30 * 2) / 3;
  pts.forEach((p, i) => {
    const x = M + i * (pw + 0.30);
    card(s, x, 2.14, pw, 1.72);
    badge(s, x + 0.26, 2.36, 0.48, p.n, { size: 11 });
    s.addText(p.t, {
      x: x + 0.84, y: 2.38, w: pw - 1.12, h: 0.44, margin: 0, valign: "middle",
      fontFace: FJP, fontSize: 12.5, bold: true, color: WINE_DEEP,
    });
    s.addText(p.d, {
      x: x + 0.26, y: 2.96, w: pw - 0.52, h: 0.72, margin: 0,
      fontFace: FJP, fontSize: 10, color: TEXT, lineSpacing: 14,
    });
  });

  // three-way win
  s.addText("三者にとってのWin", {
    x: M, y: 4.06, w: 5.0, h: 0.32, margin: 0,
    fontFace: FJP, fontSize: 15, bold: true, color: WINE_DEEP,
  });
  const wins = [
    { h: "出店者", b: ["卸値〜最安値で即時仕入", "店内在庫・セラー設備が不要", "大型セラーが自店の借景に"], dark: false },
    { h: "商業施設（森ビル様）", b: ["前例のない話題性と施設イメージ向上", "出店誘致が容易になり、賃料・保証金の引上げ余地", "施設全体・レジデンスへも卸値供給"], dark: true },
    { h: "来館者・居住者", b: ["数千本から選べる圧倒的な品揃え", "専門店価格でグラス・ボトルを楽しめる", "その場で購入し、自宅へ配送も可能"], dark: false },
  ];
  const ww = (W - M * 2 - 0.30 * 2) / 3;
  wins.forEach((w2, i) => {
    const x = M + i * (ww + 0.30);
    card(s, x, 4.48, ww, 1.72, { fill: w2.dark ? WINE_DEEP : MIST, shadow: !w2.dark });
    s.addText(w2.h, {
      x: x + 0.28, y: 4.64, w: ww - 0.56, h: 0.3, margin: 0,
      fontFace: FJP, fontSize: 13, bold: true, color: w2.dark ? GOLD : WINE,
    });
    bullets(s, w2.b, x + 0.28, 4.98, ww - 0.56, 1.10,
      { size: 9.8, lineSpacing: 13.5, gap: 3, color: w2.dark ? "E8DDE1" : TEXT });
  });

  s.addText("想定規模：セラー約30坪 ＋ 飲食区画約100坪（日比谷ミッドタウン地下1階フードホール、虎ノ門横丁の客単価・区画割りを参照）。取扱いはワインに限らず酒類全般。", {
    x: M, y: 6.34, w: 12.0, h: 0.3, margin: 0, fontFace: FJP, fontSize: 8.8, color: GREY_LT,
  });
}

/* ============================ 10. P05 Thierry Marx ============================ */
{
  const s = contentSlide("PROGRAM 05", "ティエリー・マルクス業態の出店",
    "ミシュラン累計7つ星・レジオン・ドヌール勲章受章のシェフによる日本再進出業態を、ヒルズの商業区画へ。");

  // left: chef credentials
  card(s, M, 1.98, 5.92, 4.22, { fill: WINE_DEEP, shadow: false });
  s.addText("THIERRY MARX", {
    x: M + 0.36, y: 2.20, w: 5.2, h: 0.34, margin: 0,
    fontFace: FEN, fontSize: 20, bold: true, color: GOLD, charSpacing: 1.6,
  });
  s.addText("ミシュラン星請負人。同世代のシェフの中でも最も注目を集める一人。", {
    x: M + 0.36, y: 2.58, w: 5.2, h: 0.3, margin: 0,
    fontFace: FJP, fontSize: 10.5, color: "CBBAC1",
  });
  bullets(s, [
    "1999年 ルレ・エ・シャトー「コーディヤン・バージュ」でミシュラン2つ星",
    "2010年 マンダリン オリエンタル パリでミシュラン2つ星",
    "2006年 ゴー・エ・ミヨ シェフ・オブ・ザ・イヤー",
    "2013年 フランス レジオン・ドヌール勲章 受章",
    "2022年 ミシュランガイド 年間ベストメンター",
    "2023年 パリ8区サントノーレに「オノール」オープン",
  ], M + 0.36, 3.00, 5.2, 2.30, { size: 10.2, lineSpacing: 16, gap: 7, color: "E8DDE1" });
  s.addText("大手TV局との連携により、開業時の露出を確保。国内外の富裕層・メディアを街区に呼び込みます。", {
    x: M + 0.36, y: 5.44, w: 5.2, h: 0.56, margin: 0,
    fontFace: FJP, fontSize: 10.5, bold: true, color: GOLD, lineSpacing: 15,
  });

  // right: formats + operator credibility
  const rx = M + 6.24;
  const rw = W - M - rx;
  s.addText("出店フォーマット（ご相談のたたき台）", {
    x: rx, y: 1.98, w: rw, h: 0.32, margin: 0,
    fontFace: FJP, fontSize: 15, bold: true, color: WINE_DEEP,
  });
  const fmts = [
    ["グランメゾン", "40〜60席・客単価3〜5万円。街区のフラッグシップとして。"],
    ["ブラッスリー／ビストロ", "60〜90席・客単価1.5〜2万円。ワーカーの日常会食を取り込む。"],
    ["ベーカリー＆カフェ", "20〜40坪。朝夕の生活動線を押さえ、居住者の日常接点に。"],
  ];
  fmts.forEach((f, i) => {
    const y = 2.42 + i * 0.86;
    card(s, rx, y, rw, 0.74, { fill: MIST });
    s.addText(f[0], {
      x: rx + 0.28, y: y + 0.08, w: 2.2, h: 0.28, margin: 0,
      fontFace: FJP, fontSize: 12.5, bold: true, color: WINE,
    });
    s.addText(f[1], {
      x: rx + 0.28, y: y + 0.36, w: rw - 0.56, h: 0.3, margin: 0,
      fontFace: FJP, fontSize: 9.8, color: GREY,
    });
  });

  card(s, rx, 5.06, rw, 1.14, { fill: PAPER, line: MIST2 });
  s.addText("運営体制の裏付け", {
    x: rx + 0.28, y: 5.20, w: rw - 0.56, h: 0.28, margin: 0,
    fontFace: FJP, fontSize: 12.5, bold: true, color: WINE_DEEP,
  });
  s.addText("創業41年のグランメゾン「アピシウス」を2024年6月に100%株式取得。ミシュラン掲載、World of Fine Wine 3つ星を5年連続、食べログ4.26（2026年5月時点）。グランメゾンを実際に運営している事業者として出店いたします。", {
    x: rx + 0.28, y: 5.50, w: rw - 0.56, h: 0.60, margin: 0,
    fontFace: FJP, fontSize: 9.8, color: TEXT, lineSpacing: 13.5,
  });
}

/* ============================ 11. P06 Storage ============================ */
{
  const s = contentSlide("PROGRAM 06", "富裕層向け ワイン預りサービス",
    "ご自宅のセラーは、いずれ必ず満杯になります。街区の外にある「もう一つのセラー」を、居住者特典としてご提供します。");

  // process timeline
  const steps = [
    ["01", "お引き取り", "現在の保管先・ご自宅へ伺い、全ボトルを回収。ヒルズ館内からの搬出も当社が対応。"],
    ["02", "撮影・登録・時価算定", "全ボトルを撮影しリスト化。Liv-ex等を参照した時価をアプリでいつでも確認。"],
    ["03", "定温保管", "14℃・湿度70%、24時間365日の温度監視。東日本大震災でも破損実績ゼロの専門倉庫。"],
    ["04", "出庫・ご配送", "回数無制限。ご自宅・会食先・贈答先へ。都心はWineGOで当日配送も可能。"],
    ["05", "売却・ご承継", "オークション・飲食店・愛好家への売却チャネル。相続・承継サポートも用意。"],
  ];
  const sw = (W - M * 2 - 0.26 * 4) / 5;
  steps.forEach((st, i) => {
    const x = M + i * (sw + 0.26);
    card(s, x, 2.02, sw, 2.42);
    badge(s, x + 0.24, 2.24, 0.48, st[0], { size: 11 });
    s.addText(st[1], {
      x: x + 0.24, y: 2.80, w: sw - 0.48, h: 0.50, margin: 0,
      fontFace: FJP, fontSize: 12, bold: true, color: WINE_DEEP,
    });
    s.addText(st[2], {
      x: x + 0.24, y: 3.34, w: sw - 0.48, h: 0.94, margin: 0,
      fontFace: FJP, fontSize: 9.6, color: TEXT, lineSpacing: 13.5,
    });
  });

  card(s, M, 4.62, 6.06, 1.58, { fill: MIST });
  s.addText("安心の担保", {
    x: M + 0.30, y: 4.78, w: 5.4, h: 0.3, margin: 0,
    fontFace: FJP, fontSize: 14, bold: true, color: WINE,
  });
  bullets(s, [
    "動産保険の付保（事業者責による破損は全額補償）",
    "正規ルート仕入と真贋保証、プロヴナンス管理",
    "セキュリティ・補助電源完備の専門倉庫（都内2か所）",
  ], M + 0.30, 5.12, 5.44, 1.00, { size: 10.2, lineSpacing: 14, gap: 3 });

  card(s, M + 6.42, 4.62, 6.06, 1.58, { fill: WINE_DEEP, shadow: false });
  s.addText("レジデンス向けオプション", {
    x: M + 6.72, y: 4.78, w: 5.4, h: 0.3, margin: 0,
    fontFace: FJP, fontSize: 14, bold: true, color: GOLD,
  });
  bullets(s, [
    "居住者は100本まで保管料無料枠を付帯（101本目以降 月100円／本）",
    "住宅棟共用部に「プライベートセラー」を設置し、館内で受渡し",
    "ご入居・ご退去時の一括引取／一括納品にも対応",
  ], M + 6.72, 5.12, 5.44, 1.00, { size: 10.2, lineSpacing: 14, gap: 3, color: "E8DDE1" });
}

/* ============================ 12. Benefits & KPI ============================ */
{
  const s = contentSlide("VALUE FOR MORI BUILDING", "森ビル様にとっての価値",
    "単発のテナント誘致ではなく、街区の「体験の質」と「収益源」を同時に増やすご提案です。");

  const quad = [
    { t: "資産価値・NOI", d: "他にない体験を持つ商業区画は、誘致力と賃料交渉力を高めます。セラー区画は出店者メリットが大きく、賃料・保証金の引上げ余地が生まれます。", k: "商業区画の賃料単価／稼働率" },
    { t: "テナント・居住者満足", d: "接待コストの実質削減と、居住者の生活の質。数字で語れる福利厚生であり、更新・定着の理由になります。", k: "会員加入率／契約更新率" },
    { t: "街のブランドと話題性", d: "数千本のウォークインセラーとミシュランシェフ。国内外のメディア露出と、海外富裕層の来街動機をつくります。", k: "メディア露出／来館者数" },
    { t: "新規収益", d: "会費・売上のレベニューシェア、賃料＋歩合、送客手数料。森ビル様の追加投資を伴わない収益源です。", k: "レベニューシェア収入" },
  ];
  const cw = (W - M * 2 - 0.34) / 2;
  const chh = 1.96;
  quad.forEach((q, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = M + col * (cw + 0.34);
    const y = 2.00 + row * (chh + 0.28);
    card(s, x, y, cw, chh, { fill: row === 0 ? MIST : PAPER, line: row === 1 ? MIST2 : undefined, shadow: row === 0 });
    s.addText(q.t, {
      x: x + 0.32, y: y + 0.22, w: cw - 0.64, h: 0.34, margin: 0,
      fontFace: FJP, fontSize: 16, bold: true, color: WINE_DEEP,
    });
    s.addText(q.d, {
      x: x + 0.32, y: y + 0.62, w: cw - 0.64, h: 0.80, margin: 0,
      fontFace: FJP, fontSize: 10.8, color: TEXT, lineSpacing: 15,
    });
    s.addText("主要KPI：" + q.k, {
      x: x + 0.32, y: y + chh - 0.46, w: cw - 0.64, h: 0.28, margin: 0,
      fontFace: FJP, fontSize: 9.8, bold: true, color: GOLD,
    });
  });

  card(s, M, 6.20 - 0.02, W - M * 2, 0.0, { shadow: false, fill: PAPER });
  s.addText("森ビル様に新たな設備投資・人員配置をお願いしない設計を基本とし、当社が運営・与信・在庫リスクを負担いたします。", {
    x: M, y: 6.22, w: 12.0, h: 0.3, margin: 0, fontFace: FJP, fontSize: 10.5, bold: true, color: WINE,
  });
}

/* ============================ 13. Scheme / economics ============================ */
{
  const s = contentSlide("SCHEME", "提携スキームと収益設計（たたき台）",
    "プログラムごとに役割と分配を切り分け、導入しやすいものから順に着手できる構成としています。");

  const rows = [
    ["プログラム", "収益源", "森ビル様の関与", "当社の関与", "分配イメージ"],
    ["01 WineBank CLUB", "年会費・購入手数料", "テナント・居住者への告知", "会員運用・請求・特典提供", "会費のレベニューシェア"],
    ["02 レジデンス購買連携", "ワイン販売", "コンシェルジュ導線への組込み", "商品調達・与信・配送・CS", "売上に対する送客手数料"],
    ["03 WineGO デリバリー", "ワイン販売・配送料", "ターミナル区画（2〜5坪）", "在庫・配送員・システム一式", "区画賃料 ＋ 売上歩合"],
    ["04 クラウドワインセラー", "飲食売上・卸売上", "商業区画の割当", "セラー投資・運営・出店者募集", "賃料 ＋ 売上歩合"],
    ["05 ティエリー・マルクス業態", "飲食売上", "商業区画の割当・共同PR", "シェフ招聘・店舗運営一切", "賃料 ＋ 売上歩合"],
    ["06 ワイン預りサービス", "保管料・売却手数料", "居住者への案内・受渡し協力", "引取・撮影・保管・保険・売却", "保管料のレベニューシェア"],
  ];

  s.addTable(rows, {
    x: M, y: 1.96, w: W - M * 2,
    colW: [2.42, 2.10, 2.62, 2.62, 2.33],
    border: { type: "solid", color: "E2DADD", pt: 0.75 },
    fontFace: FJP, fontSize: 9.5, color: TEXT, valign: "middle",
    rowH: 0.54,
    autoPage: false,
  });
  // header row restyle is not directly supported post-hoc; overlay header band
  s.addShape(pres.ShapeType.rect, {
    x: M, y: 1.96, w: W - M * 2, h: 0.50, fill: { color: WINE_DEEP }, line: { width: 0 },
  });
  const heads = rows[0];
  const colW = [2.42, 2.10, 2.62, 2.62, 2.33];
  let hx = M;
  heads.forEach((hstr, i) => {
    s.addText(hstr, {
      x: hx + 0.12, y: 1.96, w: colW[i] - 0.24, h: 0.50, margin: 0, valign: "middle",
      fontFace: FJP, fontSize: 10, bold: true, color: GOLD,
    });
    hx += colW[i];
  });

  s.addText("※ 分配率・賃料条件は個別協議のうえ決定させていただきたく存じます。上表は議論の出発点としての整理です。", {
    x: M, y: 5.96, w: 12.0, h: 0.3, margin: 0, fontFace: FJP, fontSize: 9.5, color: GREY_LT,
  });
  s.addText("段階導入の考え方：まずは①②③（設備投資ほぼ不要・3〜4か月で開始可能） → 効果検証のうえ ④⑤（区画を伴う出店） → ⑥は①と同時に付帯", {
    x: M, y: 6.34, w: 12.0, h: 0.34, margin: 0, fontFace: FJP, fontSize: 10.5, bold: true, color: WINE,
  });
}

/* ============================ 14. Sizing ============================ */
{
  const s = contentSlide("SIZING", "事業規模イメージ（当社試算）",
    "森ビル様と共有すべき前提を明示したうえでの試算です。数値は今後のすり合わせで更新させていただきます。");

  s.addText("会員数の想定（名）", {
    x: M, y: 2.00, w: 4.0, h: 0.3, margin: 0,
    fontFace: FJP, fontSize: 13, bold: true, color: WINE_DEEP,
  });
  s.addChart(
    pres.ChartType.bar,
    [{ name: "会員数", labels: ["Year 1", "Year 2", "Year 3"], values: [200, 500, 1000] }],
    {
      x: M - 0.10, y: 2.34, w: 4.10, h: 2.90,
      barDir: "col", barGapWidthPct: 60,
      chartColors: [WINE],
      showValue: true, dataLabelPosition: "outEnd",
      dataLabelFontFace: FJP, dataLabelFontSize: 10, dataLabelColor: TEXT,
      showLegend: false, showTitle: false,
      catAxisLabelFontFace: FJP, catAxisLabelFontSize: 10, catAxisLabelColor: GREY,
      valAxisLabelFontFace: FJP, valAxisLabelFontSize: 9, valAxisLabelColor: GREY_LT,
      valGridLine: { color: "EDE7E9", size: 1 },
      catGridLine: { style: "none" },
      valAxisMinVal: 0, valAxisMaxVal: 1200, valAxisMajorUnit: 300,
    }
  );

  s.addText("年間流通総額の想定（百万円）", {
    x: M + 4.34, y: 2.00, w: 4.4, h: 0.3, margin: 0,
    fontFace: FJP, fontSize: 13, bold: true, color: WINE_DEEP,
  });
  s.addChart(
    pres.ChartType.bar,
    [
      { name: "CLUB・購買・WineGO", labels: ["Year 1", "Year 2", "Year 3"], values: [70, 175, 350] },
      { name: "クラウドワインセラー", labels: ["Year 1", "Year 2", "Year 3"], values: [null, 400, 450] },
      { name: "レストラン業態", labels: ["Year 1", "Year 2", "Year 3"], values: [null, null, 600] },
    ],
    {
      x: M + 4.24, y: 2.34, w: 4.30, h: 2.90,
      barDir: "col", barGrouping: "stacked", barGapWidthPct: 60,
      chartColors: [WINE, WINE_SOFT, GOLD],
      showValue: true, dataLabelPosition: "ctr",
      dataLabelFontFace: FJP, dataLabelFontSize: 9, dataLabelColor: "FFFFFF",
      showLegend: true, legendPos: "b", legendFontFace: FJP, legendFontSize: 9, legendColor: GREY,
      showTitle: false,
      catAxisLabelFontFace: FJP, catAxisLabelFontSize: 10, catAxisLabelColor: GREY,
      valAxisLabelFontFace: FJP, valAxisLabelFontSize: 9, valAxisLabelColor: GREY_LT,
      valGridLine: { color: "EDE7E9", size: 1 },
      catGridLine: { style: "none" },
    }
  );

  const ax = M + 8.86;
  const aw = W - M - ax;
  card(s, ax, 2.00, aw, 4.16, { fill: MIST });
  s.addText("試算の前提", {
    x: ax + 0.30, y: 2.20, w: aw - 0.60, h: 0.3, margin: 0,
    fontFace: FJP, fontSize: 14, bold: true, color: WINE_DEEP,
  });
  bullets(s, [
    "対象母集団：主要ヒルズのオフィスワーカーおよびレジデンス居住者（規模は森ビル様公表値をもとに要確認）",
    "会員転換率：Y1 0.2% → Y3 0.8% 程度を想定",
    "会員ARPU：年35万円（年会費＋ワイン購入＋配送）",
    "クラウドワインセラー：Y2開業、年商4.0〜4.5億円",
    "レストラン業態：Y3開業、年商6.0億円",
    "森ビル様配分：流通総額の概ね10%前後を想定（賃料・歩合・RS合算）",
  ], ax + 0.30, 2.58, aw - 0.60, 3.30, { size: 9.8, lineSpacing: 13.5, gap: 6 });

  // Year 3 summary tiles under the charts
  const tiles = [
    ["1,000名", "Year 3 会員数"],
    ["14.0億円", "Year 3 年間流通総額"],
    ["約1.4億円", "うち森ビル様配分（イメージ）"],
  ];
  const tw = (8.60 - 0.24 * 2) / 3;
  tiles.forEach((t, i) => {
    const x = M - 0.06 + i * (tw + 0.24);
    card(s, x, 5.44, tw, 0.80, { fill: WINE_DEEP, shadow: false });
    s.addText(t[0], {
      x: x + 0.22, y: 5.52, w: tw - 0.44, h: 0.36, margin: 0,
      fontFace: FJP, fontSize: 17, bold: true, color: GOLD,
    });
    s.addText(t[1], {
      x: x + 0.22, y: 5.90, w: tw - 0.44, h: 0.26, margin: 0,
      fontFace: FJP, fontSize: 8.8, color: "CBBAC1",
    });
  });

  s.addText("※ 上記は当社による試算であり、確定的な見通しではありません。母集団・転換率は森ビル様のデータをいただいたうえで精緻化させていただきます。", {
    x: M, y: 6.44, w: 12.0, h: 0.3, margin: 0, fontFace: FJP, fontSize: 8.8, color: GREY_LT,
  });
}

/* ============================ 15. Roadmap ============================ */
{
  const s = contentSlide("ROADMAP", "導入ロードマップ",
    "設備投資を伴わないプログラムから開始し、効果を確認しながら区画を伴う出店へ進みます。");

  const phases = [
    { p: "PHASE 0", t: "実証", items: ["1棟でのPoC実施", "WineBank CLUB ヒルズ枠の限定募集", "WineGO 館内配送テスト"], color: MIST },
    { p: "PHASE 1", t: "本格展開", items: ["主要ヒルズへCLUB展開", "レジデンス購買連携の導線実装", "ワイン預りサービス付帯開始"], color: MIST },
    { p: "PHASE 2", t: "区画出店", items: ["クラウドワインセラー区画の設計・工事", "出店者募集とセラー在庫の構築", "施設内テナントへの卸売開始"], color: WINE_DEEP },
    { p: "PHASE 3", t: "街区の象徴へ", items: ["ティエリー・マルクス業態の出店", "他ヒルズ・海外物件への横展開", "国内外富裕層向けプログラム化"], color: WINE_DEEP },
  ];

  const pw = (W - M * 2 - 0.30 * 3) / 4;
  phases.forEach((ph, i) => {
    const x = M + i * (pw + 0.30);
    const dark = ph.color === WINE_DEEP;
    card(s, x, 2.20, pw, 3.30, { fill: ph.color, shadow: !dark });
    s.addText(ph.p, {
      x: x + 0.30, y: 2.44, w: pw - 0.60, h: 0.28, margin: 0,
      fontFace: FEN, fontSize: 11, bold: true, color: GOLD, charSpacing: 2,
    });
    s.addText(ph.t, {
      x: x + 0.30, y: 2.76, w: pw - 0.60, h: 0.52, margin: 0,
      fontFace: FJP, fontSize: 17, bold: true, color: dark ? PAPER : WINE_DEEP,
    });
    bullets(s, ph.items, x + 0.30, 3.36, pw - 0.60, 1.90,
      { size: 10.5, lineSpacing: 16, gap: 9, color: dark ? "E8DDE1" : TEXT });
  });

  // timeline markers
  const marks = ["0〜3か月", "3〜12か月", "12〜24か月", "24か月〜"];
  marks.forEach((m2, i) => {
    const x = M + i * (pw + 0.30);
    s.addText(m2, {
      x, y: 5.62, w: pw, h: 0.28, margin: 0, align: "center",
      fontFace: FJP, fontSize: 10, bold: true, color: GREY,
    });
  });

  s.addText("最短ケースでは、ご合意から約3か月でPHASE 0を開始できます（酒販免許・保管倉庫・配送体制は当社既存アセットを使用するため）。", {
    x: M, y: 6.14, w: 12.0, h: 0.34, margin: 0, fontFace: FJP, fontSize: 10.5, bold: true, color: WINE,
  });
}

/* ============================ 16. PoC ============================ */
{
  const s = contentSlide("FIRST STEP", "まずは1棟で。3か月のPoCをご提案します",
    "大きな意思決定の前に、小さく確かめる。費用は当社が負担いたします。");

  card(s, M, 2.00, 3.60, 4.20, { fill: WINE_DEEP, shadow: false });
  s.addText("PoC の概要", {
    x: M + 0.32, y: 2.22, w: 3.0, h: 0.3, margin: 0,
    fontFace: FJP, fontSize: 15, bold: true, color: GOLD,
  });
  const facts = [
    ["対象", "麻布台ヒルズ または 六本木ヒルズ 1棟"],
    ["期間", "3か月"],
    ["対象者", "テナント法人 5〜10社／レジデンス居住者 50世帯程度"],
    ["費用", "当社全額負担（森ビル様のご負担なし）"],
  ];
  facts.forEach((f, i) => {
    const y = 2.66 + i * 0.86;
    s.addText(f[0], {
      x: M + 0.32, y, w: 3.0, h: 0.26, margin: 0,
      fontFace: FJP, fontSize: 10, bold: true, color: GOLD,
    });
    s.addText(f[1], {
      x: M + 0.32, y: y + 0.26, w: 3.0, h: 0.52, margin: 0,
      fontFace: FJP, fontSize: 11.5, color: PAPER, lineSpacing: 15,
    });
  });

  s.addText("実施内容", {
    x: M + 3.96, y: 2.00, w: 4.4, h: 0.3, margin: 0,
    fontFace: FJP, fontSize: 15, bold: true, color: WINE_DEEP,
  });
  const acts = [
    ["01", "CLUB ヒルズ枠の限定募集", "対象者へ会員権を無償付与し、飲食20%OFF・コルケージ無料・配送特典を実利用いただく。"],
    ["02", "館内デリバリーの実証", "バックヤードに仮設ターミナルを設置し、定温配送のリードタイムと運用負荷を計測。"],
    ["03", "ワイン預りの受付", "居住者のご自宅ワインをお引き取りし、撮影・登録・時価評価までを実施。"],
  ];
  acts.forEach((a, i) => {
    const y = 2.42 + i * 1.28;
    card(s, M + 3.96, y, 4.40, 1.14, { fill: MIST });
    badge(s, M + 4.20, y + 0.20, 0.44, a[0], { size: 11 });
    s.addText(a[1], {
      x: M + 4.76, y: y + 0.20, w: 3.44, h: 0.30, margin: 0,
      fontFace: FJP, fontSize: 12, bold: true, color: WINE_DEEP,
    });
    s.addText(a[2], {
      x: M + 4.30, y: y + 0.56, w: 3.90, h: 0.48, margin: 0,
      fontFace: FJP, fontSize: 9.6, color: TEXT, lineSpacing: 13,
    });
  });

  const rx = M + 8.72;
  const rw = W - M - rx;
  card(s, rx, 2.00, rw, 2.02, { fill: MIST });
  s.addText("成功基準（案）", {
    x: rx + 0.30, y: 2.18, w: rw - 0.60, h: 0.3, margin: 0,
    fontFace: FJP, fontSize: 14, bold: true, color: WINE,
  });
  bullets(s, [
    "対象者の会員継続意向 60%以上",
    "1会員あたり月1回以上の特典利用",
    "館内配送の平均リードタイム10分以内",
    "重大な運用インシデント ゼロ",
  ], rx + 0.30, 2.54, rw - 0.60, 1.36, { size: 10.2, lineSpacing: 14, gap: 4 });

  card(s, rx, 4.18, rw, 2.02, { fill: PAPER, line: MIST2 });
  s.addText("お願いしたいご協力", {
    x: rx + 0.30, y: 4.36, w: rw - 0.60, h: 0.3, margin: 0,
    fontFace: FJP, fontSize: 14, bold: true, color: WINE,
  });
  bullets(s, [
    "対象テナント・居住者へのご案内",
    "仮設ターミナル用スペース（2〜3坪）",
    "館内動線・搬入に関する運用ご調整",
    "実施後の効果検証への同席",
  ], rx + 0.30, 4.72, rw - 0.60, 1.36, { size: 10.2, lineSpacing: 14, gap: 4 });
}

/* ============================ 17. Risk / compliance ============================ */
{
  const s = contentSlide("RISK & COMPLIANCE", "品質・リスク管理とコンプライアンス",
    "高額かつ繊細な商材を街区で扱うにあたり、当社が負う責任と管理体制を明確にしています。");

  const risks = [
    { t: "偽造・真贋", r: "並行品・二次流通品に潜む真贋リスク", c: "国内外の正規取扱業者からのみ仕入れ。国家ソムリエ資格保持者による選定と、全ボトルのプロヴナンス管理。" },
    { t: "品質劣化", r: "輸送・保管中の温度変化による価値毀損", c: "14℃・湿度70%での定温定湿保管、24時間365日の温度監視。配送も高級ワインに適した定温帯で実施。" },
    { t: "破損・紛失", r: "保管中・配送中の事故", c: "動産保険を付保し、事業者責による破損は全額補償。委託倉庫は東日本大震災でも破損実績ゼロ、補助電源完備。" },
    { t: "法令遵守", r: "酒類販売業免許、未成年者飲酒防止、景表法・薬機法的表示", c: "当社が免許主体となり販売・配送を実施。年齢確認を配送時に徹底。広告表現は事前に法務レビューを実施。" },
    { t: "資産性の表示", r: "「投資」としての訴求に伴う金商法・景表法リスク", c: "本提携は「使えるライフスタイル・サービス」として提供し、断定的な利回り訴求は行いません。" },
    { t: "個人情報", r: "テナント・居住者情報の取扱い", c: "会員情報は当社が管理主体となり、森ビル様からの個人情報のご提供を前提としない設計（申込は会員本人から直接）。" },
  ];

  const cw = (W - M * 2 - 0.32) / 2;
  const chh = 1.28;
  risks.forEach((rk, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = M + col * (cw + 0.32);
    const y = 1.98 + row * (chh + 0.24);
    card(s, x, y, cw, chh, { fill: MIST });
    s.addText(rk.t, {
      x: x + 0.28, y: y + 0.16, w: 1.9, h: 0.3, margin: 0,
      fontFace: FJP, fontSize: 13, bold: true, color: WINE,
    });
    s.addText(rk.r, {
      x: x + 2.22, y: y + 0.18, w: cw - 2.50, h: 0.28, margin: 0,
      fontFace: FJP, fontSize: 9.6, color: GREY,
    });
    s.addText(rk.c, {
      x: x + 0.28, y: y + 0.52, w: cw - 0.56, h: 0.64, margin: 0,
      fontFace: FJP, fontSize: 10, color: TEXT, lineSpacing: 13.5,
    });
  });

  s.addText("在庫・与信・配送・保管に関わるリスクは、原則としてすべて当社が保有します。", {
    x: M, y: 6.46, w: 12.0, h: 0.3, margin: 0, fontFace: FJP, fontSize: 10.5, bold: true, color: WINE,
  });
}

/* ============================ 18. Company ============================ */
{
  const s = contentSlide("COMPANY", "会社概要と実績",
    "1970年創業の酒販事業を承継し、仕入・保管・小売・飲食・テクノロジーを垂直統合しています。");

  const info = [
    ["会社名", "株式会社WineBank"],
    ["代表取締役", "中野 邦人（Nakano Kunihito）"],
    ["資本金", "437,169千円（資本準備金含む）"],
    ["本社", "東京都港区六本木4丁目12番8号 第6DMJビル 2階"],
    ["創業", "1970年10月"],
    ["事業概要", "ワインを中心とした酒類販売／食品・雑貨の販売／レストラン事業／WineTech事業"],
  ];
  card(s, M, 1.96, 6.30, 3.16, { fill: MIST });
  info.forEach((r, i) => {
    const y = 2.16 + i * 0.48;
    s.addText(r[0], {
      x: M + 0.30, y, w: 1.30, h: 0.34, margin: 0, valign: "middle",
      fontFace: FJP, fontSize: 10, bold: true, color: WINE,
    });
    s.addText(r[1], {
      x: M + 1.66, y, w: 4.40, h: 0.42, margin: 0, valign: "middle",
      fontFace: FJP, fontSize: 10, color: TEXT, lineSpacing: 13,
    });
  });

  const rx = M + 6.62;
  const rw = W - M - rx;
  const nums = [
    ["30億円", "管理ワイン在庫（2026年4月末）"],
    ["7.2億円", "累計調達額"],
    ["55年", "酒販事業の実績"],
    ["+18.06%", "P1ファンド累計（2022.9〜2026.4）"],
  ];
  const nw = (rw - 0.28) / 2;
  nums.forEach((n, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = rx + col * (nw + 0.28);
    const y = 1.96 + row * 1.02;
    card(s, x, y, nw, 0.90, { fill: WINE_DEEP, shadow: false });
    s.addText(n[0], {
      x: x + 0.26, y: y + 0.10, w: nw - 0.52, h: 0.40, margin: 0,
      fontFace: FJP, fontSize: 21, bold: true, color: GOLD,
    });
    s.addText(n[1], {
      x: x + 0.26, y: y + 0.52, w: nw - 0.52, h: 0.30, margin: 0,
      fontFace: FJP, fontSize: 9, color: "CBBAC1",
    });
  });

  card(s, rx, 4.06, rw, 1.06, { fill: PAPER, line: MIST2 });
  s.addText("株主・主要提携先", {
    x: rx + 0.28, y: 4.20, w: rw - 0.56, h: 0.28, margin: 0,
    fontFace: FJP, fontSize: 12.5, bold: true, color: WINE_DEEP,
  });
  s.addText("東証プライム上場企業2社（うちマネーフォワードグループ）、超富裕層向けファミリーオフィス、独立系最大手の倉庫会社ほか。SBIとの提携により世界初のワインST（セキュリティトークン）を組成。", {
    x: rx + 0.28, y: 4.50, w: rw - 0.56, h: 0.52, margin: 0,
    fontFace: FJP, fontSize: 9.6, color: TEXT, lineSpacing: 13.5,
  });

  // group assets strip
  card(s, M, 5.28, W - M * 2, 0.92, { fill: MIST });
  const assets = [
    ["アピシウス", "創業41年のグランメゾンを100%取得"],
    ["ティエリー・マルクス", "ミシュラン累計7つ星シェフとの提携"],
    ["WineGO", "定温ラストワンマイル配送網"],
    ["WineBank CLUB", "会員制ワインサロン事業"],
    ["WineTech", "クラウド管理・マーケットプレイス・ファンド"],
  ];
  const awd = (W - M * 2 - 0.52) / 5;
  assets.forEach((a, i) => {
    const x = M + 0.26 + i * awd;
    s.addText(a[0], {
      x, y: 5.42, w: awd - 0.2, h: 0.26, margin: 0,
      fontFace: FJP, fontSize: 11.5, bold: true, color: WINE,
    });
    s.addText(a[1], {
      x, y: 5.70, w: awd - 0.2, h: 0.38, margin: 0,
      fontFace: FJP, fontSize: 8.8, color: GREY, lineSpacing: 12,
    });
  });
}

/* ============================ 19. Closing ============================ */
{
  pageNo++;
  const s = newSlide(true);
  s.addShape(pres.ShapeType.ellipse, {
    x: -2.6, y: 3.0, w: 8.0, h: 8.0, fill: { color: WINE_DEEP, transparency: 52 }, line: { width: 0 },
  });
  s.addShape(pres.ShapeType.ellipse, {
    x: 9.6, y: -2.0, w: 6.6, h: 6.6, fill: { color: WINE, transparency: 66 }, line: { width: 0 },
  });

  s.addText("CLOSING", {
    x: M, y: 0.90, w: 6.0, h: 0.3, margin: 0,
    fontFace: FEN, fontSize: 12, bold: true, color: GOLD, charSpacing: 3.2,
  });
  s.addText("ヒルズに、世界一のセラーを。", {
    x: M, y: 1.30, w: 10.0, h: 0.78, margin: 0,
    fontFace: FJP, fontSize: 36, bold: true, color: PAPER,
  });
  s.addText(
    "富裕層とハイスペック人材が最も密度高く集まる街に、彼らが本当に欲しいものを置く。\n私たちは在庫も、仕入網も、シェフも、配送網も、すでに持っています。",
    { x: M, y: 2.16, w: 9.6, h: 0.8, margin: 0, fontFace: FJP, fontSize: 14, color: "CDBFC5", lineSpacing: 24 }
  );

  const reasons = [
    { n: "01", t: "すぐ始められる", d: "酒販免許・保管倉庫・配送体制・在庫は稼働中。新設が必要なものはほとんどありません。" },
    { n: "02", t: "森ビル様の負担が小さい", d: "設備投資・人員配置を前提としない設計。在庫・与信・運営リスクは当社が保有します。" },
    { n: "03", t: "街の格に直結する", d: "ミシュランシェフと数千本のセラー。テナント誘致にも、海外富裕層の来街動機にもなります。" },
  ];
  const cw = (W - M * 2 - 0.34 * 2) / 3;
  reasons.forEach((r, i) => {
    const x = M + i * (cw + 0.34);
    s.addShape(pres.ShapeType.roundRect, {
      x, y: 3.30, w: cw, h: 1.94, rectRadius: 0.09,
      fill: { color: INK2 }, line: { color: "45303A", width: 1 },
    });
    badge(s, x + 0.30, 3.56, 0.48, r.n, { size: 11, fill: INK2, line: GOLD, color: GOLD });
    s.addText(r.t, {
      x: x + 0.90, y: 3.58, w: cw - 1.18, h: 0.44, margin: 0, valign: "middle",
      fontFace: FJP, fontSize: 15, bold: true, color: GOLD,
    });
    s.addText(r.d, {
      x: x + 0.30, y: 4.20, w: cw - 0.60, h: 0.86, margin: 0,
      fontFace: FJP, fontSize: 10.5, color: "CDBFC5", lineSpacing: 14.5,
    });
  });

  s.addText("次のステップ", {
    x: M, y: 5.52, w: 3.0, h: 0.3, margin: 0,
    fontFace: FJP, fontSize: 13, bold: true, color: GOLD,
  });
  s.addText("① 本提案のご説明とディスカッション　→　② 対象街区・対象プログラムの絞り込み　→　③ PoC条件の合意（目安：ご合意から3か月で開始）", {
    x: M, y: 5.84, w: 11.4, h: 0.34, margin: 0,
    fontFace: FJP, fontSize: 12, color: PAPER,
  });

  s.addText("株式会社WineBank　東京都港区六本木4-12-8 第6DMJビル2階　TEL 03-6416-9370", {
    x: M, y: 6.52, w: 9.0, h: 0.3, margin: 0, fontFace: FJP, fontSize: 10, color: "9C8C93",
  });
  footer(s, true);
}

/* ============================ 20. Appendix: wine as asset ============================ */
{
  const s = contentSlide("APPENDIX A", "参考：資産としての高級ワイン",
    "P1ファンドの実運用における騰落率実績（2022年運用開始 → 2026年4月末時点の比較）。");

  const tbl = [
    ["地域", "銘柄", "時価", "上昇率"],
    ["ブルゴーニュ", "2011 Michel Lafarge Volnay 1er Cru Rouge", "¥36,800", "+242.42%"],
    ["ブルゴーニュ", "2015 Faiveley Latricieres Chambertin Grand Cru", "¥74,800", "+240.85%"],
    ["ブルゴーニュ", "2016 Jean Grivot Clos de Vougeot Grand Cru", "¥80,080", "+213.39%"],
    ["ボルドー", "2004 Chateau Margaux", "¥239,400", "+227.27%"],
    ["ボルドー", "2007 Chateau Pichon Longueville Comtesse de Lalande", "¥66,000", "+212.91%"],
    ["シャンパーニュ", "1998 Krug Brut", "¥164,801", "+95.35%"],
    ["アメリカ", "2019 Screaming Eagle Oakville Cabernet Sauvignon", "¥877,800", "+86.67%"],
  ];
  const colW = [1.90, 4.60, 1.30, 1.30];
  s.addTable(tbl, {
    x: M, y: 2.02, w: 9.10, colW,
    border: { type: "solid", color: "E2DADD", pt: 0.75 },
    fontFace: FJP, fontSize: 10, color: TEXT, valign: "middle", rowH: 0.42,
  });
  s.addShape(pres.ShapeType.rect, {
    x: M, y: 2.02, w: 9.10, h: 0.42, fill: { color: WINE_DEEP }, line: { width: 0 },
  });
  let hx = M;
  tbl[0].forEach((hstr, i) => {
    s.addText(hstr, {
      x: hx + 0.12, y: 2.02, w: colW[i] - 0.24, h: 0.42, margin: 0, valign: "middle",
      fontFace: FJP, fontSize: 10, bold: true, color: GOLD,
    });
    hx += colW[i];
  });

  const rx = M + 9.42;
  const rw = W - M - rx;
  card(s, rx, 2.02, rw, 1.46, { fill: WINE_DEEP, shadow: false });
  s.addText("+18.06%", {
    x: rx + 0.26, y: 2.22, w: rw - 0.52, h: 0.52, margin: 0,
    fontFace: FJP, fontSize: 28, bold: true, color: GOLD,
  });
  s.addText("P1ファンド累計パフォーマンス\n（2022年9月〜2026年4月・経費控除後）", {
    x: rx + 0.26, y: 2.78, w: rw - 0.52, h: 0.56, margin: 0,
    fontFace: FJP, fontSize: 9.5, color: "CBBAC1", lineSpacing: 13,
  });
  card(s, rx, 3.62, rw, 1.46, { fill: MIST });
  s.addText("約4倍", {
    x: rx + 0.26, y: 3.82, w: rw - 0.52, h: 0.52, margin: 0,
    fontFace: FJP, fontSize: 28, bold: true, color: WINE,
  });
  s.addText("Liv-ex Fine Wine 1000\n過去20年の指数上昇（年率約7%）", {
    x: rx + 0.26, y: 4.38, w: rw - 0.52, h: 0.56, margin: 0,
    fontFace: FJP, fontSize: 9.5, color: GREY, lineSpacing: 13,
  });

  s.addText("保有構成：ボルドー 52.8% / ブルゴーニュ 38.3% / カリフォルニア 5.6% / シャンパーニュ 1.8% / イタリア 1.3% ほか。長期熟成後に需要が高まる2010年〜近年ヴィンテージを中心に構成。", {
    x: M, y: 5.62, w: 12.0, h: 0.5, margin: 0, fontFace: FJP, fontSize: 10, color: TEXT, lineSpacing: 14,
  });
  s.addText("出典：WineBank P1ファンド運用実績、Liv-ex。過去の実績であり、将来の運用成果を保証するものではありません。", {
    x: M, y: 6.24, w: 12.0, h: 0.3, margin: 0, fontFace: FJP, fontSize: 8.8, color: GREY_LT,
  });
}

/* ============================ 21. Appendix: CLUB detail ============================ */
{
  const s = contentSlide("APPENDIX B", "参考：WineBank CLUB 会員特典の価値",
    "通常会員の年会費30万円に対し、提供サービスは46.4万円相当。ヒルズ枠ではこれを基準に条件を設計します。");

  const rows = [
    ["サービス", "内容", "相当額"],
    ["初回引取・入庫・撮影・時価算定", "現在の保管先・ご自宅へ伺い、全ボトルを撮影・登録", "100,000円"],
    ["ワイン保管（100本まで）", "定温14℃・湿度70%の専門倉庫でお預かり", "120,000円"],
    ["WineBank Standard 会員資格", "グループ飲食店20%OFF、優先割当ほか", "100,000円"],
    ["出庫・ご配送", "回数無制限・無料（持込・贈答・ご自宅）", "54,000円"],
    ["コルケージ無料", "提携26店舗へのBYO。抜栓料・持込料ゼロ", "60,000円"],
    ["資産保全", "動産保険の付保および真贋保証", "30,000円"],
    ["合計", "", "464,000円相当"],
  ];
  const colW = [2.86, 4.36, 1.58];
  const tW = colW.reduce((a, b) => a + b, 0);
  s.addTable(rows, {
    x: M, y: 2.06, w: tW, colW,
    border: { type: "solid", color: "E2DADD", pt: 0.75 },
    fontFace: FJP, fontSize: 9.8, color: TEXT, valign: "middle", rowH: 0.46,
  });
  s.addShape(pres.ShapeType.rect, {
    x: M, y: 2.06, w: tW, h: 0.46, fill: { color: WINE_DEEP }, line: { width: 0 },
  });
  let hx = M;
  rows[0].forEach((hstr, i) => {
    s.addText(hstr, {
      x: hx + 0.12, y: 2.06, w: colW[i] - 0.24, h: 0.46, margin: 0, valign: "middle",
      fontFace: FJP, fontSize: 9.8, bold: true, color: GOLD,
    });
    hx += colW[i];
  });

  s.addText("別途申し受けるもの：ワイン売却時の手数料10%／相続・ご承継サポート（別途お見積り）／当日エクスプレス配送 5,000円・回／101本目以降の保管料 月100円・本", {
    x: M, y: 5.86, w: tW, h: 0.5, margin: 0, fontFace: FJP, fontSize: 9.2, color: GREY, lineSpacing: 13,
  });

  const rx = M + tW + 0.34;
  const rw = W - M - rx;
  card(s, rx, 2.06, rw, 3.32, { fill: WINE_DEEP, shadow: false });
  s.addText("接待費の実質削減効果", {
    x: rx + 0.28, y: 2.26, w: rw - 0.56, h: 0.36, margin: 0,
    fontFace: FJP, fontSize: 14, bold: true, color: GOLD,
  });
  s.addText("店内価格は市価の2〜3倍。BYO無料とネット最安値仕入により、年間接待費600万円規模の利用で約200万円の削減余地が生まれます。", {
    x: rx + 0.28, y: 2.72, w: rw - 0.56, h: 1.10, margin: 0,
    fontFace: FJP, fontSize: 10, color: "CBBAC1", lineSpacing: 15,
  });
  s.addText("会員特典46.4万円相当 ＋ 接待費削減 約200万円\n＝ 年会費を大きく上回る実利", {
    x: rx + 0.28, y: 3.92, w: rw - 0.56, h: 0.66, margin: 0,
    fontFace: FJP, fontSize: 10.5, bold: true, color: GOLD_LT, lineSpacing: 16,
  });
  s.addText("「持っているだけで得」が、法人会員への最初の一言になります。", {
    x: rx + 0.28, y: 4.70, w: rw - 0.56, h: 0.56, margin: 0,
    fontFace: FJP, fontSize: 9.8, color: "CBBAC1", lineSpacing: 14,
  });
}

/* ============================ 22. Appendix C: price structure ============================ */
{
  const s = contentSlide("APPENDIX C", "なぜ、価格で勝てるのか",
    "ワイン流通は、生産者から消費者までに何段もの中間マージンが積み上がります。当社は最上流に立っています。");

  const baseY = 4.66;
  const maxH = 2.26;
  const bars = [
    { name: "インポーター\n仕入価格", v: 40, disp: "40", wb: true },
    { name: "酒販店①\n仕入価格", v: 60, disp: "60" },
    { name: "酒販店②\n仕入価格", v: 70, disp: "70" },
    { name: "一般消費者\n購入価格", v: 100, disp: "80〜100" },
    { name: "レストラン\n店頭価格", v: 300, disp: "150〜300", range: 150 },
  ];
  const bw = 1.62, gap = 0.62;
  const startX = (W - (bars.length * bw + (bars.length - 1) * gap)) / 2;

  // why the top of the chain is not contestable
  card(s, M, 2.06, 7.20, 1.30, { fill: MIST });
  s.addText("最上流に立てる理由", {
    x: M + 0.30, y: 2.22, w: 6.6, h: 0.28, margin: 0,
    fontFace: FJP, fontSize: 13, bold: true, color: WINE_DEEP,
  });
  bullets(s, [
    "創業55年の酒販業実績による、生産者・インポーターとの信頼とパイプ",
    "国内大手インポーターとの直接取引による特価・正規品仕入",
    "海外輸出入ライセンスを活かした独自の仕入ネットワークと情報収集",
  ], M + 0.30, 2.56, 6.60, 0.70, { size: 9.8, lineSpacing: 13, gap: 2 });

  // baseline
  s.addShape(pres.ShapeType.line, {
    x: startX - 0.30, y: baseY, w: bars.length * bw + (bars.length - 1) * gap + 0.60, h: 0,
    line: { color: "DCD3D7", width: 1 },
  });

  bars.forEach((b, i) => {
    const x = startX + i * (bw + gap);
    const h = (b.v / 300) * maxH;
    if (b.range) {
      const hLow = (b.range / 300) * maxH;
      s.addShape(pres.ShapeType.rect, {
        x, y: baseY - h, w: bw, h: h - hLow,
        fill: { color: WINE_SOFT, transparency: 52 }, line: { width: 0 },
      });
      s.addShape(pres.ShapeType.rect, {
        x, y: baseY - hLow, w: bw, h: hLow,
        fill: { color: WINE_SOFT }, line: { width: 0 },
      });
    } else {
      s.addShape(pres.ShapeType.rect, {
        x, y: baseY - h, w: bw, h,
        fill: { color: b.wb ? GOLD : WINE }, line: { width: 0 },
      });
    }
    s.addText(b.disp, {
      x, y: baseY - h - 0.38, w: bw, h: 0.32, margin: 0, align: "center",
      fontFace: FJP, fontSize: 15, bold: true, color: b.wb ? "8A6A18" : WINE_DEEP,
    });
    s.addText(b.name, {
      x, y: baseY + 0.10, w: bw, h: 0.50, margin: 0, align: "center",
      fontFace: FJP, fontSize: 10, color: GREY, lineSpacing: 13.5,
    });
    if (b.wb) {
      s.addText("WineBank はここ", {
        x: x - 0.20, y: baseY - h - 0.74, w: bw + 0.40, h: 0.30, margin: 0, align: "center",
        fontFace: FJP, fontSize: 11, bold: true, color: GOLD,
      });
    }
  });

  // punch band with the three consequences
  card(s, M, 5.42, W - M * 2, 1.06, { fill: WINE_DEEP, shadow: false });
  s.addText("レストラン店頭価格の\n1/4〜1/7 の水準で仕入れる。", {
    x: M + 0.34, y: 5.42, w: 4.40, h: 1.06, margin: 0, valign: "middle",
    fontFace: FJP, fontSize: 15, bold: true, color: GOLD, lineSpacing: 21,
  });
  const meanings = [
    ["会員は最安値で買える", "ネット最安値水準から\nさらに10〜20%OFF"],
    ["飲食店は在庫ゼロで足りる", "資金を寝かせずに\nワインリストが華やぐ"],
    ["新規参入は追随できない", "参入業者は「70」の\n水準からしか始まらない"],
  ];
  meanings.forEach((m2, i) => {
    const x = M + 5.10 + i * 2.42;
    s.addText(m2[0], {
      x, y: 5.60, w: 2.32, h: 0.28, margin: 0,
      fontFace: FJP, fontSize: 10.5, bold: true, color: PAPER,
    });
    s.addText(m2[1], {
      x, y: 5.90, w: 2.32, h: 0.48, margin: 0,
      fontFace: FJP, fontSize: 9, color: "CBBAC1", lineSpacing: 12.5,
    });
  });

  s.addText("※ 希望小売価格を100とした相対指数。ネット最安値／並行輸入価格は概ね80の水準。出典：当社資料。", {
    x: M, y: 6.58, w: 12.0, h: 0.28, margin: 0, fontFace: FJP, fontSize: 8.8, color: GREY_LT,
  });
}

/* ============================ 23. Appendix D: founder ============================ */
{
  const s = contentSlide("APPENDIX D", "代表取締役 中野 邦人",
    "不動産投資・不動産証券化・ホテルコンド開発・スペースシェアリングを経て、ワインへ。デベロッパーの言語が通じる相手です。");

  // left: career timeline
  s.addText("経歴", {
    x: M, y: 1.98, w: 3.0, h: 0.30, margin: 0,
    fontFace: FJP, fontSize: 14, bold: true, color: WINE_DEEP,
  });
  const career = [
    ["2001", "株式会社モリモト", "不動産投資事業部にて不動産の購入・売却および不動産証券化に従事"],
    ["2003", "株式会社LEXINGTON", "富裕層向け資産コンサルティング"],
    ["2006", "株式会社Seven Signatures 取締役", "ホテルコンド事業開発・投資スキーム構築・国内不動産開発。ハワイのTrump Tower Waikikiプロジェクトに参画"],
    ["2008", "株式会社あどばる 設立・代表取締役社長", "不動産のスペースシェアリング事業。飲食・宿泊・会議の時間貸しコンテンツを展開"],
    ["2020", "株式会社WineBank をM&Aにより100%取得、代表取締役就任", ""],
    ["2021", "株式会社あどばる が東証プライム上場グループ入り", ""],
    ["2022", "株式会社AbHeri が東証グロース上場グループ入り", ""],
  ];
  let cy = 2.36;
  career.forEach((c) => {
    const y = cy;
    cy += c[2] ? 0.68 : 0.46;
    s.addText(c[0], {
      x: M, y, w: 0.72, h: 0.28, margin: 0,
      fontFace: FEN, fontSize: 12, bold: true, color: GOLD,
    });
    s.addText(c[1], {
      x: M + 0.78, y, w: 6.20, h: 0.28, margin: 0,
      fontFace: FJP, fontSize: 10.8, bold: true, color: TEXT,
    });
    if (c[2]) {
      s.addText(c[2], {
        x: M + 0.78, y: y + 0.27, w: 6.20, h: 0.38, margin: 0,
        fontFace: FJP, fontSize: 9.2, color: GREY, lineSpacing: 12.5,
      });
    }
  });

  // right: three hooks
  const rx = M + 7.28;
  const rw = W - M - rx;
  const hooks = [
    { n: "01", t: "不動産・施設運営の出身", d: "不動産証券化、ホテルコンド開発、時間貸しスペース事業。街と区画の経済で会話ができます。" },
    { n: "02", t: "2社を上場企業グループへ", d: "あどばる（東証プライム）、AbHeri（東証グロース）。立ち上げから引き渡しまでを2度経験。" },
    { n: "03", t: "いまはワイン一本", d: "2020年にWineBankを承継。シリアルアントレプレナーとして本事業に専念しています。" },
  ];
  hooks.forEach((hk, i) => {
    const y = 1.98 + i * 1.48;
    card(s, rx, y, rw, 1.32, { fill: i === 0 ? WINE_DEEP : MIST, shadow: i !== 0 });
    const dark = i === 0;
    badge(s, rx + 0.28, y + 0.22, 0.46, hk.n,
      { size: 11, fill: dark ? WINE_DEEP : "FFFFFF", line: GOLD, color: dark ? GOLD : WINE });
    s.addText(hk.t, {
      x: rx + 0.86, y: y + 0.22, w: rw - 1.14, h: 0.46, margin: 0, valign: "middle",
      fontFace: FJP, fontSize: 13, bold: true, color: dark ? GOLD : WINE_DEEP,
    });
    s.addText(hk.d, {
      x: rx + 0.28, y: y + 0.76, w: rw - 0.56, h: 0.48, margin: 0,
      fontFace: FJP, fontSize: 9.8, color: dark ? "E8DDE1" : TEXT, lineSpacing: 13.5,
    });
  });

  s.addText("※ Seven Signatures在籍時、Donald Trump氏とのハワイ・Trump Tower Waikikiプロジェクトにおいて1日あたり売上高のギネス記録を樹立。", {
    x: M, y: 6.56, w: 12.0, h: 0.28, margin: 0,
    fontFace: FJP, fontSize: 8.8, color: GREY_LT,
  });
}

/* ============================ 24. Appendix E: history & momentum ============================ */
{
  const s = contentSlide("APPENDIX E", "55年の沿革と、いま動いていること",
    "1970年札幌の酒販店として創業。承継後の6年間で、EC・ファンド・グランメゾン・プラットフォームを積み上げました。");

  s.addText("沿革", {
    x: M, y: 1.98, w: 3.0, h: 0.30, margin: 0,
    fontFace: FJP, fontSize: 14, bold: true, color: WINE_DEEP,
  });
  const hist = [
    ["1970.10", "北海道札幌で「有限会社中村」開業。1996年よりワイン販売に注力"],
    ["2007.05", "楽天市場に出店しワインEC開始（現在はYahoo・寺田ワインマーケットにも出店）"],
    ["2011.04", "ラ・ブリック（レストラン）／カーヴ・ド・ブリック（ワインショップ）開業"],
    ["2020.07", "中野邦人がM&Aにより100%取得、代表取締役就任"],
    ["2022.05", "Wine Cave Roppongi 開業"],
    ["2022.07", "ワインファンド1号 運用開始（2026年4月時点 累計+18.06%）"],
    ["2022.09", "株式会社WineBank へ商号変更"],
    ["2023.02", "ワイン投資プラットフォーム「WineBank」リリース"],
    ["2024.06", "創業41年のグランメゾン「アピシウス」を100%株式取得"],
    ["2026.07", "六本木の路面店に「Bistro & Bar WineBank terrace」開業"],
  ];
  hist.forEach((r, i) => {
    const y = 2.36 + i * 0.38;
    s.addText(r[0], {
      x: M, y, w: 0.92, h: 0.30, margin: 0, valign: "middle",
      fontFace: FEN, fontSize: 9.6, bold: true, color: GOLD,
    });
    s.addText(r[1], {
      x: M + 0.98, y, w: 5.86, h: 0.30, margin: 0, valign: "middle",
      fontFace: FJP, fontSize: 9.6, color: TEXT, lineSpacing: 13,
    });
  });

  const rx = M + 7.16;
  const rw = W - M - rx;
  card(s, rx, 1.98, rw, 2.62, { fill: MIST });
  s.addText("いま動いている3つの大型提携", {
    x: rx + 0.30, y: 2.16, w: rw - 0.60, h: 0.30, margin: 0,
    fontFace: FJP, fontSize: 14, bold: true, color: WINE_DEEP,
  });
  const deals = [
    ["SBI証券", "世界初のワインST（セキュリティトークン）の構築・販売"],
    ["ティエリー・マルクス × TBS", "有名仏シェフとのレストラン事業。ライセンスとPRの両輪"],
    ["WineBank CLUB ＋ 他社提携", "レストランサブスク。レコール・デュ・ヴァン等と業務提携"],
  ];
  deals.forEach((d, i) => {
    const y = 2.56 + i * 0.68;
    badge(s, rx + 0.30, y + 0.02, 0.36, String(i + 1), { size: 10 });
    s.addText(d[0], {
      x: rx + 0.78, y, w: rw - 1.08, h: 0.26, margin: 0,
      fontFace: FJP, fontSize: 11.5, bold: true, color: WINE,
    });
    s.addText(d[1], {
      x: rx + 0.78, y: y + 0.26, w: rw - 1.08, h: 0.34, margin: 0,
      fontFace: FJP, fontSize: 9.2, color: GREY, lineSpacing: 12.5,
    });
  });

  card(s, rx, 4.76, rw, 1.44, { fill: WINE_DEEP, shadow: false });
  s.addText("中長期の絵姿（2029年9月期）", {
    x: rx + 0.30, y: 4.92, w: rw - 0.60, h: 0.28, margin: 0,
    fontFace: FJP, fontSize: 13, bold: true, color: GOLD,
  });
  const goals = [["在庫 55億円", "管理ワイン在庫"], ["売上 25億円", "ワイン関連事業"], ["IPO", "を見据えた成長"]];
  const gw = (rw - 0.60) / 3;
  goals.forEach((g, i) => {
    const x = rx + 0.30 + i * gw;
    s.addText(g[0], {
      x, y: 5.28, w: gw - 0.10, h: 0.34, margin: 0,
      fontFace: FJP, fontSize: 14, bold: true, color: PAPER,
    });
    s.addText(g[1], {
      x, y: 5.62, w: gw - 0.10, h: 0.28, margin: 0,
      fontFace: FJP, fontSize: 8.6, color: "CBBAC1",
    });
  });

  s.addText("主要株主：マネーフォワードベンチャーパートナーズ株式会社／株式会社ベクトル／寺田倉庫株式会社／株式会社PrivateBANK", {
    x: M, y: 6.20, w: 12.0, h: 0.26, margin: 0, fontFace: FJP, fontSize: 9, color: GREY,
  });
  s.addText("※ 中長期計画は当社事業計画に基づく想定であり、確定的な見通しではありません。上表のワイン関連事業売上とは別途、レストラン事業売上を見込んでいます。", {
    x: M, y: 6.50, w: 12.0, h: 0.26, margin: 0, fontFace: FJP, fontSize: 8.6, color: GREY_LT,
  });
}

/* ============================ write ============================ */
const OUT = process.argv[2] || "森ビル様_業務提携ご提案_WineBank.pptx";
pres.writeFile({ fileName: OUT }).then(() => console.log("wrote", OUT));
