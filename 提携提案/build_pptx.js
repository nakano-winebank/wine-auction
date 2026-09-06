/**
 * 「WineBank × 中伊豆ワイナリー 業務提携イメージ」提案資料(.pptx)の生成スクリプト。
 * 原稿は同ディレクトリの .md。内容を直すときは .md と本ファイルの両方を更新すること。
 *   NODE_PATH=<pptxgenjsの場所> node build_pptx.js [出力パス]
 */
const PptxGenJS = require("pptxgenjs");

const OUT = process.argv[2] || "WineBank×中伊豆ワイナリー_業務提携イメージ.pptx";

// WineBankのブランドゴールドを基調にした配色
const GOLD = "A78450";
const GOLD_LT = "C9AE7E";
const DARK = "1C1714";
const DARK_2 = "2A2320";
const INK = "2B2622";
const MUTED = "6F665F";
const TINT = "F5EFE4";
const WHITE = "FFFFFF";
const LINE = "E2D8C6";

const FONT = "Meiryo";
const W = 13.333;
const M = 0.7; // 左右マージン

const pptx = new PptxGenJS();
pptx.layout = "LAYOUT_WIDE";
pptx.author = "株式会社WineBank";
pptx.company = "株式会社WineBank";
pptx.title = "WineBank × 中伊豆ワイナリー 業務提携イメージ";

/** 明るい本文スライドの共通ヘッダ（連番＋見出し）。 */
function contentSlide(num, title, sub) {
  const s = pptx.addSlide();
  s.background = { color: WHITE };
  s.addShape(pptx.ShapeType.ellipse, {
    x: M, y: 0.45, w: 0.52, h: 0.52, fill: { color: GOLD },
  });
  s.addText(String(num), {
    x: M, y: 0.45, w: 0.52, h: 0.52, isTextBox: true, align: "center", valign: "middle",
    fontFace: FONT, fontSize: 16, bold: true, color: WHITE, margin: 0,
  });
  s.addText(title, {
    x: M + 0.75, y: 0.42, w: W - M * 2 - 0.75, h: 0.6, isTextBox: true, valign: "middle",
    fontFace: FONT, fontSize: 26, bold: true, color: INK, margin: 0,
  });
  if (sub) {
    s.addText(sub, {
      x: M + 0.75, y: 1.02, w: W - M * 2 - 0.75, h: 0.32, isTextBox: true, valign: "middle",
      fontFace: FONT, fontSize: 12, color: MUTED, margin: 0,
    });
  }
  return s;
}

/** 角丸カード＋見出し＋本文。柱の説明や3分割レイアウトで多用する。 */
function card(s, { x, y, w, h, head, body, tint = TINT, headColor = INK, badge = null }) {
  s.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h, rectRadius: 0.08, fill: { color: tint }, line: { color: LINE, width: 0.75 },
  });
  let tx = x + 0.3;
  let tw = w - 0.6;
  if (badge) {
    s.addShape(pptx.ShapeType.ellipse, { x: x + 0.28, y: y + 0.26, w: 0.44, h: 0.44, fill: { color: GOLD } });
    s.addText(badge, {
      x: x + 0.28, y: y + 0.26, w: 0.44, h: 0.44, isTextBox: true, align: "center", valign: "middle",
      fontFace: FONT, fontSize: 13, bold: true, color: WHITE, margin: 0,
    });
    tx = x + 0.86;
    tw = w - 1.16;
  }
  s.addText(head, {
    x: tx, y: y + 0.24, w: tw, h: 0.48, isTextBox: true, valign: "middle",
    fontFace: FONT, fontSize: 15, bold: true, color: headColor, margin: 0,
  });
  if (body) {
    s.addText(
      body.map((t, i) => ({
        text: t, options: { bullet: true, breakLine: i < body.length - 1, paraSpaceAfter: 5 },
      })),
      {
        x: x + 0.3, y: y + 0.78, w: w - 0.6, h: h - 1.02, isTextBox: true,
        fontFace: FONT, fontSize: 11.5, color: INK, margin: 0, lineSpacingMultiple: 1.15,
      }
    );
  }
}

/* ── 1. 表紙 ─────────────────────────────────────────── */
{
  const s = pptx.addSlide();
  s.background = { color: DARK };
  s.addShape(pptx.ShapeType.ellipse, { x: 9.6, y: -1.9, w: 6.4, h: 6.4, fill: { color: DARK_2 } });
  s.addText("業務提携のご提案", {
    x: M + 0.3, y: 1.9, w: 8.8, h: 0.4, isTextBox: true,
    fontFace: FONT, fontSize: 14, color: GOLD_LT, charSpacing: 3, margin: 0,
  });
  s.addText("WineBank × 中伊豆ワイナリー", {
    x: M + 0.3, y: 2.45, w: 9.6, h: 0.95, isTextBox: true,
    fontFace: FONT, fontSize: 40, bold: true, color: WHITE, margin: 0,
  });
  s.addText("業務提携イメージ", {
    x: M + 0.3, y: 3.42, w: 9.6, h: 0.7, isTextBox: true,
    fontFace: FONT, fontSize: 28, bold: true, color: GOLD, margin: 0,
  });
  s.addText("志太会長個人でのお取り組みを前提とした、提携の具体像と進め方", {
    x: M + 0.3, y: 4.35, w: 9.6, h: 0.4, isTextBox: true,
    fontFace: FONT, fontSize: 14, color: "BDB2A6", margin: 0,
  });
  s.addText("2026年9月　株式会社WineBank", {
    x: M + 0.3, y: 6.15, w: 9.6, h: 0.35, isTextBox: true,
    fontFace: FONT, fontSize: 12, color: "9A8F84", margin: 0,
  });
  s.addNotes("8/19ご提案の「2. ワイン現物購入1,000万円」に紐づく業務提携案。9/3の奥村様ご返信（志太会長個人でのお取り組み）を前提に具体化した。");
}

/* ── 2. 本書の位置づけ／ご確認いただいた前提 ─────────── */
{
  const s = contentSlide(1, "本書の位置づけ", "2026年8月19日付ご提案「2. ワイン現物購入1,000万円」に紐づく業務提携案の具体化");
  s.addText(
    [
      { text: "法人（SDI株式会社）ではなく志太会長個人でのお取り組み", options: { bold: true } },
      { text: "というご意向を前提に、提携の具体像・役割分担・進め方を整理しました。" },
    ],
    { x: M, y: 1.55, w: W - M * 2, h: 0.4, isTextBox: true, fontFace: FONT, fontSize: 13, color: INK, margin: 0 }
  );
  s.addText("ご確認いただいた前提", {
    x: M, y: 2.15, w: 5, h: 0.35, isTextBox: true, fontFace: FONT, fontSize: 14, bold: true, color: GOLD, margin: 0,
  });
  s.addTable(
    [
      [
        { text: "項目", options: { bold: true, color: INK, fill: { color: TINT } } },
        { text: "ご回答（2026年9月／SDI様）", options: { bold: true, color: INK, fill: { color: TINT } } },
      ],
      ["提携の主体", "シダックス中伊豆ワイナリーヒルズ株式会社"],
      ["表記", "中伊豆ワイナリー（「西伊豆」表記を訂正）"],
      ["現物購入分の決済", "2026年9月末／当初の想定どおり"],
      ["神山フォレスト1階レストラン", "本提携には含めない（別トラックで並行）"],
    ],
    {
      x: M, y: 2.58, w: 7.6, colW: [2.7, 4.9], rowH: 0.5,
      fontFace: FONT, fontSize: 11.5, color: INK, valign: "middle",
      border: { type: "solid", color: LINE, pt: 0.75 },
    }
  );
  card(s, {
    x: 8.6, y: 2.15, w: W - M - 8.6, h: 3.7, head: "対象施設",
    body: [
      "中伊豆ワイナリー シャトーT.S（静岡県伊豆市）",
      "運営：シダックス中伊豆ワイナリーヒルズ株式会社",
      "2000年、志太会長が私財を投じて創業",
      "約10haの自社畑・醸造設備・レストラン群・チャペル",
    ],
  });
  s.addText("※「1. WineFUND（ファンド出資）」は本書の対象外とし、将来の選択肢として位置づけています（11ページ参照）。", {
    x: M, y: 6.15, w: W - M * 2, h: 0.35, isTextBox: true, fontFace: FONT, fontSize: 10.5, color: MUTED, margin: 0,
  });
}

/* ── 3. 基本コンセプト ───────────────────────────────── */
{
  const s = contentSlide(2, "提携の基本コンセプト", "両者は競合せず、ほぼ完全に補完関係にある");
  s.addText("「つくる・魅せる」中伊豆　×　「集める・値付ける・回す」WineBank", {
    x: M, y: 1.6, w: W - M * 2, h: 0.45, isTextBox: true,
    fontFace: FONT, fontSize: 18, bold: true, color: GOLD, margin: 0,
  });
  const cw = 5.55;
  card(s, {
    x: M, y: 2.25, w: cw, h: 3.8, head: "中伊豆ワイナリーが持つもの",
    body: [
      "約10haの自社畑・醸造設備・自社ブランド（「志太」ほか）",
      "レストラン群、ワインラウンジ、チャペル／ブライダル",
      "ワイナリー来訪者・ブライダルOB・法人接点",
      "生産、体験、婚礼の現場運営力",
    ],
  });
  card(s, {
    x: W - M - cw, y: 2.25, w: cw, h: 3.8, head: "WineBankが持つもの", tint: "F0F3F5",
    body: [
      "ファインワインの調達力・真贋／保管品質・資産評価",
      "六本木ミッドタウン terrace、WINE CAVE ROPPONGI、銀座提携店",
      "投資会員（1,000万円以上の資産形成層）、CLUB月額会員",
      "マーケットプレイス（会員間売買）、EC（青山ワインマーケット）",
    ],
  });
  s.addShape(pptx.ShapeType.ellipse, { x: W / 2 - 0.42, y: 3.75, w: 0.84, h: 0.84, fill: { color: GOLD } });
  s.addText("×", {
    x: W / 2 - 0.42, y: 3.75, w: 0.84, h: 0.84, isTextBox: true, align: "center", valign: "middle",
    fontFace: FONT, fontSize: 26, bold: true, color: WHITE, margin: 0,
  });
  s.addText("中伊豆は「良いワインを生み、良い時間を提供する場」を持ち、WineBankは「良いワインを世界から集め、資産として値付け、動かす仕組み」を持つ。この2つを繋ぐことが本提携の骨子です。", {
    x: M, y: 6.25, w: W - M * 2, h: 0.5, isTextBox: true, fontFace: FONT, fontSize: 12, color: INK, margin: 0,
  });
}

/* ── 4. 4本の柱 ─────────────────────────────────────── */
{
  const s = contentSlide(3, "提携イメージ ── 4本の柱", "会員・モノ・体験・チャネルの4方向で結ぶ");
  const cw = 5.9;
  const ch = 2.05;
  const xs = [M, W - M - cw];
  const ys = [1.7, 3.95];
  const pillars = [
    ["1", "クロスメンバーシップ", ["WineBank会員とワイナリー会員・ブライダルOBの相互送客", "双方の会員証で相互特典が使える設計"]],
    ["2", "セラー／熟成・保管アライアンス", ["ご購入分を「志太コレクション」として中伊豆に展示・保管", "将来はWineBank会員向けの寄託サービスへ"]],
    ["3", "体験コンテンツの共同開発", ["会員限定ファインワイン会、収穫期ワイナリーツアー", "ブライダル連携、ワインリスト監修、オーベルジュ構想"]],
    ["4", "都心チャネルでのブランド発信", ["六本木・銀座の直営／提携店でのオンリスト", "青山ワインマーケット（EC）での販売"]],
  ];
  pillars.forEach((p, i) => {
    card(s, {
      x: xs[i % 2], y: ys[Math.floor(i / 2)], w: cw, h: ch,
      badge: p[0], head: p[1], body: p[2],
    });
  });
  s.addText("いずれも新規投資を伴わず、既にある会員・場所・在庫を組み合わせるところから始められます。", {
    x: M, y: 6.25, w: W - M * 2, h: 0.4, isTextBox: true, fontFace: FONT, fontSize: 12, bold: true, color: GOLD, margin: 0,
  });
}

/* ── 5. 柱① ─────────────────────────────────────────── */
{
  const s = contentSlide(4, "柱① クロスメンバーシップ（会員の相互開放）", "中伊豆は都心の富裕層接点を、WineBankは「会員が誇れる目的地」を得る");
  const cw = 4.35;
  card(s, {
    x: M, y: 1.85, w: cw, h: 3.7, head: "WineBank → 中伊豆",
    body: [
      "投資会員・CLUB会員へ中伊豆ワイナリーをご案内",
      "優先予約、限定ヴィンテージ、貸切ワイン会",
      "都心の資産形成層を伊豆へ送客",
    ],
  });
  card(s, {
    x: W - M - cw, y: 1.85, w: cw, h: 3.7, head: "中伊豆 → WineBank", tint: "F0F3F5",
    body: [
      "ワイナリー会員・ブライダルOB・リピーターへCLUBをご案内",
      "レストランのワインを仕入れ原価相当で愉しめる月額会員制",
      "既存顧客の満足度向上と再来訪の動機づくり",
    ],
  });
  s.addShape(pptx.ShapeType.roundRect, {
    x: M + cw + 0.35, y: 2.75, w: W - M * 2 - cw * 2 - 0.7, h: 1.9, rectRadius: 0.08,
    fill: { color: DARK }, line: { color: DARK, width: 0 },
  });
  s.addText("相互送客", {
    x: M + cw + 0.35, y: 2.95, w: W - M * 2 - cw * 2 - 0.7, h: 0.45, isTextBox: true, align: "center",
    fontFace: FONT, fontSize: 17, bold: true, color: GOLD, margin: 0,
  });
  s.addText("双方の会員証で\n相互の特典が使える\n設計とする", {
    x: M + cw + 0.35, y: 3.45, w: W - M * 2 - cw * 2 - 0.7, h: 1.0, isTextBox: true, align: "center",
    fontFace: FONT, fontSize: 12, color: WHITE, margin: 0, lineSpacingMultiple: 1.25,
  });
  s.addText("収益・精算のイメージ（例示・要協議）：相互紹介手数料（入会1件あたり定額）、または会費のレベニューシェア", {
    x: M, y: 5.85, w: W - M * 2, h: 0.4, isTextBox: true, fontFace: FONT, fontSize: 11.5, color: MUTED, margin: 0,
  });
}

/* ── 6. 柱② ─────────────────────────────────────────── */
{
  const s = contentSlide(5, "柱② セラー／熟成・保管アライアンス", "個人資産としてのワインを、来訪動機を生む資産に変える");
  s.addShape(pptx.ShapeType.roundRect, {
    x: M, y: 1.8, w: W - M * 2, h: 1.55, rectRadius: 0.08, fill: { color: DARK }, line: { color: DARK, width: 0 },
  });
  s.addText("「志太コレクション」構想", {
    x: M + 0.45, y: 2.0, w: 7.5, h: 0.45, isTextBox: true,
    fontFace: FONT, fontSize: 19, bold: true, color: GOLD, margin: 0,
  });
  s.addText("志太会長個人でご購入いただく1,000万円分のファインワインを、中伊豆ワイナリーのワイン蔵に置き、ワイナリーの目玉コンテンツとして公開する。", {
    x: M + 0.45, y: 2.5, w: W - M * 2 - 0.9, h: 0.7, isTextBox: true,
    fontFace: FONT, fontSize: 13, color: WHITE, margin: 0, lineSpacingMultiple: 1.2,
  });
  const cw = 3.85;
  const items = [
    ["しまう資産 → 見せる資産", ["世界のファインワインが並ぶ蔵そのものが来訪動機になる", "自社ワインの価値提示（比較の文脈づくり）にも効く"]],
    ["WineBankが担う実務", ["銘柄の選定・調達・真贋保証", "資産評価と売却タイミングのご提案"]],
    ["将来の展開", ["WineBank会員向け寄託（預かり）サービスの共同展開", "保管料の折半、または売却益の成功報酬（例示）"]],
  ];
  items.forEach((it, i) => {
    card(s, { x: M + i * (cw + 0.3), y: 3.6, w: cw, h: 2.6, head: it[0], body: it[1] });
  });
}

/* ── 7. 柱③ ─────────────────────────────────────────── */
{
  const s = contentSlide(6, "柱③ 体験コンテンツの共同開発", "ワイナリーという「場」と、希少ワインという「中身」を掛け合わせる");
  const rows = [
    ["ファインワイン会", "WineBank供給の希少ワイン × 中伊豆の料理・空間で、会員限定イベント（年4回程度）"],
    ["ワイナリーツアー", "収穫期・仕込み期に投資会員をご招待。畑〜醸造〜垂直試飲の一日"],
    ["ブライダル連携", "挙式カップルへ「生まれ年ワイン」「記念ヴィンテージの積立」をご提案"],
    ["ペアリング監修", "WineBankソムリエによる中伊豆レストランのワインリスト監修・スタッフ研修"],
    ["オーベルジュ構想", "中長期。宿泊 × セラー × 食のパッケージ（8月3日メールでお伝えしたビジネスモデル）"],
  ];
  rows.forEach((r, i) => {
    const y = 1.8 + i * 0.86;
    s.addShape(pptx.ShapeType.roundRect, {
      x: M, y, w: W - M * 2, h: 0.72, rectRadius: 0.06,
      fill: { color: i % 2 === 0 ? TINT : WHITE }, line: { color: LINE, width: 0.75 },
    });
    s.addShape(pptx.ShapeType.ellipse, { x: M + 0.26, y: y + 0.16, w: 0.4, h: 0.4, fill: { color: GOLD } });
    s.addText(String(i + 1), {
      x: M + 0.26, y: y + 0.16, w: 0.4, h: 0.4, isTextBox: true, align: "center", valign: "middle",
      fontFace: FONT, fontSize: 12, bold: true, color: WHITE, margin: 0,
    });
    s.addText(r[0], {
      x: M + 0.8, y, w: 2.5, h: 0.72, isTextBox: true, valign: "middle",
      fontFace: FONT, fontSize: 13, bold: true, color: INK, margin: 0,
    });
    s.addText(r[1], {
      x: M + 3.35, y, w: W - M * 2 - 3.6, h: 0.72, isTextBox: true, valign: "middle",
      fontFace: FONT, fontSize: 11.5, color: INK, margin: 0,
    });
  });
  s.addText("収益・精算のイメージ（例示・要協議）：イベント売上のレベニューシェア（粗利折半）", {
    x: M, y: 6.25, w: W - M * 2, h: 0.35, isTextBox: true, fontFace: FONT, fontSize: 11.5, color: MUTED, margin: 0,
  });
}

/* ── 8. 柱④ ─────────────────────────────────────────── */
{
  const s = contentSlide(7, "柱④ 都心チャネルでの中伊豆ブランド発信", "「伊豆に行かないと飲めない」を「都心で出会い、伊豆に会いに行く」導線へ");
  const cw = 3.85;
  const ch = [
    ["Bistro&Bar WineBank terrace", ["六本木ミッドタウン", "会員が集まる場でのオンリスト・グラス提供"]],
    ["WineBank CLUB 加盟店", ["銀座「L'atelier de oto」ほか提携店ネットワーク", "会員向けサービスのなかでの取扱い"]],
    ["青山ワインマーケット（EC）", ["都心・全国への販売チャネル", "限定キュヴェ・ヴィンテージの企画販売"]],
  ];
  ch.forEach((c, i) => {
    card(s, { x: M + i * (cw + 0.3), y: 1.9, w: cw, h: 2.5, head: c[0], body: c[1] });
  });
  s.addShape(pptx.ShapeType.roundRect, {
    x: M, y: 4.75, w: W - M * 2, h: 1.55, rectRadius: 0.08, fill: { color: TINT }, line: { color: LINE, width: 0.75 },
  });
  s.addText("都心で中伊豆ワインに出会った会員が、ワイナリーを訪れ、そこで世界のファインワインに出会う。柱①〜④は一本の循環としてつながります。", {
    x: M + 0.45, y: 4.95, w: W - M * 2 - 0.9, h: 1.15, isTextBox: true, valign: "middle",
    fontFace: FONT, fontSize: 14, bold: true, color: INK, margin: 0, lineSpacingMultiple: 1.3,
  });
  s.addText("※ 神山フォレスト1階レストランの件は、本提携とは別トラックとして整理しています。", {
    x: M, y: 6.5, w: W - M * 2, h: 0.35, isTextBox: true, fontFace: FONT, fontSize: 10.5, color: MUTED, margin: 0,
  });
}

/* ── 9. 役割分担と収益 ───────────────────────────────── */
{
  const s = contentSlide(8, "誰が何を出し、何を得るか", "数値条件はすべて協議の出発点としての例示です");
  const head = ["柱", "WineBankが提供", "中伊豆／志太会長が提供", "収益・精算のイメージ（例示）"];
  const body = [
    ["① 会員", "CLUB／投資会員の送客、会員管理基盤、入会導線", "ワイナリー会員・ブライダルOBへの告知、施設優待枠", "相互紹介手数料（入会1件あたり定額）または会費のレベニューシェア"],
    ["② セラー", "ワインの選定・調達・真贋保証・評価・売却支援", "蔵／セラーのスペース、温湿度管理、現地オペレーション", "保管料の折半、または売却益に対する成功報酬"],
    ["③ 体験", "希少ワインの供給、ソムリエ派遣、会員集客", "会場、料理、宿泊・婚礼オペレーション", "イベント売上のレベニューシェア（粗利折半）"],
    ["④ 販売", "都心店舗・ECでの販売チャネル", "中伊豆ワインの供給（卸条件）", "通常の卸・受託販売条件＋販促協力"],
  ];
  s.addTable(
    [head.map((h) => ({ text: h, options: { bold: true, color: INK, fill: { color: TINT } } })), ...body],
    {
      x: M, y: 1.75, w: W - M * 2, colW: [1.3, 3.5, 3.5, 3.63], rowH: 0.85,
      fontFace: FONT, fontSize: 11, color: INK, valign: "middle",
      border: { type: "solid", color: LINE, pt: 0.75 },
    }
  );
  s.addText("※ Phase 1のパイロット実績を踏まえ、レベニューシェア率・年間本数・開催頻度を数値で確定させる想定です。", {
    x: M, y: 6.35, w: W - M * 2, h: 0.4, isTextBox: true, fontFace: FONT, fontSize: 11.5, color: MUTED, margin: 0,
  });
}

/* ── 10. 進め方 3フェーズ ───────────────────────────── */
{
  const s = contentSlide(9, "進め方 ── 3つのフェーズ", "最初から重い契約は不要。実績を見てからご判断いただける設計");
  const cw = 3.85;
  const phases = [
    ["Phase 0", "〜2026年9月末", "個人でのお取り組みを開始", [
      "ワイン現物購入 1,000万円（＋会員ご参画）",
      "銘柄は資産性・贈答性・展示価値の3軸で選定案をご提示",
      "この時点では提携契約は不要",
    ]],
    ["Phase 1", "2026年10〜12月", "基本合意とパイロット", [
      "業務提携覚書（MOU）の締結",
      "パイロット①：会員向けツアー＋ファインワイン会",
      "パイロット②：都内店舗での中伊豆ワイン オンリスト",
    ]],
    ["Phase 2", "2027年〜", "本契約・事業化", [
      "業務提携本契約、販売代理・寄託契約を個別に締結",
      "セラー事業、ブライダル連携、オーベルジュ構想",
      "規模が見えた段階で共同出資・ファンド参画もご検討可能",
    ]],
  ];
  phases.forEach((p, i) => {
    const x = M + i * (cw + 0.3);
    s.addShape(pptx.ShapeType.roundRect, {
      x, y: 1.85, w: cw, h: 0.95, rectRadius: 0.06, fill: { color: i === 0 ? GOLD : DARK }, line: { width: 0 },
    });
    s.addText(p[0], {
      x: x + 0.3, y: 1.95, w: cw - 0.6, h: 0.4, isTextBox: true,
      fontFace: FONT, fontSize: 17, bold: true, color: WHITE, margin: 0,
    });
    s.addText(p[1], {
      x: x + 0.3, y: 2.35, w: cw - 0.6, h: 0.32, isTextBox: true,
      fontFace: FONT, fontSize: 11.5, color: i === 0 ? "FBF3E6" : GOLD_LT, margin: 0,
    });
    card(s, { x, y: 2.9, w: cw, h: 3.0, head: p[2], body: p[3] });
  });
  s.addText("最初の一歩（Phase 0）は個人で完結し、契約を待たずに9月末に着手できます。", {
    x: M, y: 6.15, w: W - M * 2, h: 0.4, isTextBox: true, fontFace: FONT, fontSize: 12.5, bold: true, color: GOLD, margin: 0,
  });
}

/* ── 11. 契約形態と主体の整理 ───────────────────────── */
{
  const s = contentSlide(10, "契約形態と主体の整理", "軽い形から順に、必要になった段階で締結する");
  s.addTable(
    [
      [
        { text: "", options: { fill: { color: TINT } } },
        { text: "形態", options: { bold: true, color: INK, fill: { color: TINT } } },
        { text: "内容", options: { bold: true, color: INK, fill: { color: TINT } } },
        { text: "想定タイミング", options: { bold: true, color: INK, fill: { color: TINT } } },
      ],
      ["A", "業務提携覚書", "相互送客・共同イベントの方向性合意。金銭債務を伴わない", "Phase 1"],
      ["B", "販売／オンリスト契約", "中伊豆ワインの卸・受託販売", "Phase 1〜2"],
      ["C", "寄託（保管）契約", "ワインの預かり・保険・善管注意義務を明記", "Phase 2"],
      ["D", "共同事業・出資", "JV設立、オーベルジュ等の共同運営", "Phase 2以降"],
    ],
    {
      x: M, y: 1.8, w: 7.5, colW: [0.5, 2.1, 3.4, 1.5], rowH: 0.6,
      fontFace: FONT, fontSize: 11, color: INK, valign: "middle",
      border: { type: "solid", color: LINE, pt: 0.75 },
    }
  );
  s.addShape(pptx.ShapeType.roundRect, {
    x: 8.5, y: 1.8, w: W - M - 8.5, h: 3.6, rectRadius: 0.08, fill: { color: DARK }, line: { width: 0 },
  });
  s.addText("契約主体は2本立て", {
    x: 8.8, y: 2.0, w: W - M - 8.8 - 0.3, h: 0.42, isTextBox: true,
    fontFace: FONT, fontSize: 15, bold: true, color: GOLD, margin: 0,
  });
  s.addText(
    [
      { text: "① 個人としての購入・会員参画", options: { bold: true, color: WHITE, breakLine: true } },
      { text: "志太会長個人 ⇔ WineBank（Phase 0）\n契約を待たず9月末に着手可能\n", options: { color: "C9C0B8", breakLine: true, paraSpaceAfter: 10 } },
      { text: "② 施設利用を伴う業務提携", options: { bold: true, color: WHITE, breakLine: true } },
      { text: "シダックス中伊豆ワイナリーヒルズ株式会社 ⇔ WineBank（Phase 1以降）\n覚書から段階的に", options: { color: "C9C0B8" } },
    ],
    {
      x: 8.8, y: 2.5, w: W - M - 8.8 - 0.3, h: 2.75, isTextBox: true, valign: "top",
      fontFace: FONT, fontSize: 11, margin: 0, lineSpacingMultiple: 1.25,
    }
  );
  s.addText("①が先に動くことで、②の協議は「実物がある状態」から始められます。", {
    x: M, y: 6.0, w: W - M * 2, h: 0.4, isTextBox: true, fontFace: FONT, fontSize: 12.5, bold: true, color: GOLD, margin: 0,
  });
}

/* ── 12. 志太会長個人にとってのメリット ─────────────── */
{
  const s = contentSlide(11, "志太会長個人にとってのメリット", "ファンド（案1）ではなく現物購入（案2）を選ぶ意味");
  const merits = [
    ["流動性", "GPの判断を待たず、贈答・会食・売却がいつでも自由"],
    ["使える資産", "会食・接待でそのまま活きる。ボトルそのものが話題になる水準の銘柄構成"],
    ["中伊豆への還元", "ご自身のコレクションがワイナリーの集客コンテンツになり、創業の物語を延長できる"],
    ["会食コストの圧縮", "WineBank CLUBにより、都内提携店でのワインを仕入れ原価相当で"],
    ["段階的な意思決定", "まず個人で始め、手応えを見てから法人・ファンドへ広げられる（逆は難しい）"],
  ];
  merits.forEach((m, i) => {
    const y = 1.8 + i * 0.86;
    s.addShape(pptx.ShapeType.roundRect, {
      x: M, y, w: W - M * 2, h: 0.72, rectRadius: 0.06,
      fill: { color: i % 2 === 0 ? TINT : WHITE }, line: { color: LINE, width: 0.75 },
    });
    s.addText(String(i + 1).padStart(2, "0"), {
      x: M + 0.25, y, w: 0.75, h: 0.72, isTextBox: true, valign: "middle",
      fontFace: FONT, fontSize: 20, bold: true, color: GOLD_LT, margin: 0,
    });
    s.addText(m[0], {
      x: M + 1.0, y, w: 2.4, h: 0.72, isTextBox: true, valign: "middle",
      fontFace: FONT, fontSize: 13.5, bold: true, color: INK, margin: 0,
    });
    s.addText(m[1], {
      x: M + 3.45, y, w: W - M * 2 - 3.7, h: 0.72, isTextBox: true, valign: "middle",
      fontFace: FONT, fontSize: 11.5, color: INK, margin: 0,
    });
  });
  s.addText("SDI様法人としてのWineFUND（案1）は、Phase 1の実績を見てから「実物を見て判断する」という順序でご検討いただけます。", {
    x: M, y: 6.25, w: W - M * 2, h: 0.35, isTextBox: true, fontFace: FONT, fontSize: 11, color: MUTED, margin: 0,
  });
}

/* ── 13. 想定スケジュール ───────────────────────────── */
{
  const s = contentSlide(12, "想定スケジュール", "2026年9月〜2027年3月");
  const rows = [
    ["2026年9月中旬", "本提案のご説明MTG（志太会長・奥村様・資産運用ご担当者様）"],
    ["2026年9月下旬", "銘柄構成のご提示 → ご発注"],
    ["2026年9月末", "現物購入1,000万円の決済／会員ご登録"],
    ["2026年10月", "業務提携覚書（MOU）の協議・締結、中伊豆ワイナリー訪問（実地確認）"],
    ["2026年11月", "パイロット① 会員向けワイナリーツアー＋ファインワイン会"],
    ["2026年12月", "パイロット② 都内店舗での中伊豆ワイン・オンリスト開始"],
    ["2027年1〜3月", "実績レビュー → 本契約・事業化の協議"],
  ];
  const x0 = M + 2.9;
  s.addShape(pptx.ShapeType.rect, { x: x0, y: 1.8, w: 0.035, h: 4.35, fill: { color: LINE }, line: { width: 0 } });
  rows.forEach((r, i) => {
    const y = 1.75 + i * 0.63;
    const hot = i <= 2;
    s.addText(r[0], {
      x: M, y, w: 2.6, h: 0.5, isTextBox: true, align: "right", valign: "middle",
      fontFace: FONT, fontSize: 12, bold: hot, color: hot ? GOLD : MUTED, margin: 0,
    });
    s.addShape(pptx.ShapeType.ellipse, {
      x: x0 - 0.09, y: y + 0.16, w: 0.22, h: 0.22,
      fill: { color: hot ? GOLD : WHITE }, line: { color: hot ? GOLD : GOLD_LT, width: 1.25 },
    });
    s.addText(r[1], {
      x: x0 + 0.35, y, w: W - M - x0 - 0.35, h: 0.5, isTextBox: true, valign: "middle",
      fontFace: FONT, fontSize: 12.5, bold: hot, color: INK, margin: 0,
    });
  });
  s.addText("金色の3項目は、9月末決済に向けて今月中に動く部分です。", {
    x: M, y: 6.3, w: W - M * 2, h: 0.35, isTextBox: true, fontFace: FONT, fontSize: 11, color: MUTED, margin: 0,
  });
}

/* ── 14. 次のステップ（クロージング） ───────────────── */
{
  const s = pptx.addSlide();
  s.background = { color: DARK };
  s.addShape(pptx.ShapeType.ellipse, { x: 10.2, y: 4.3, w: 5.6, h: 5.6, fill: { color: DARK_2 } });
  s.addText("次のステップ", {
    x: M + 0.3, y: 0.85, w: 8, h: 0.7, isTextBox: true,
    fontFace: FONT, fontSize: 30, bold: true, color: GOLD, margin: 0,
  });
  const steps = [
    ["本提案のご説明MTG", "9月中旬｜過去の提携事例も、この場で開示可能な範囲を口頭にてご共有いたします"],
    ["銘柄構成のご提示", "9月中旬〜下旬｜資産性・贈答性・展示価値の3軸で選定案を作成"],
    ["現物購入1,000万円のご発注・決済", "9月末｜当初の想定どおり"],
    ["業務提携覚書（MOU）の協議開始", "10月｜シダックス中伊豆ワイナリーヒルズ株式会社様と"],
  ];
  steps.forEach((st, i) => {
    const y = 1.9 + i * 0.95;
    s.addShape(pptx.ShapeType.ellipse, { x: M + 0.3, y: y + 0.05, w: 0.5, h: 0.5, fill: { color: GOLD } });
    s.addText(String(i + 1), {
      x: M + 0.3, y: y + 0.05, w: 0.5, h: 0.5, isTextBox: true, align: "center", valign: "middle",
      fontFace: FONT, fontSize: 14, bold: true, color: WHITE, margin: 0,
    });
    s.addText(st[0], {
      x: M + 1.0, y, w: 9.0, h: 0.4, isTextBox: true,
      fontFace: FONT, fontSize: 16, bold: true, color: WHITE, margin: 0,
    });
    s.addText(st[1], {
      x: M + 1.0, y: y + 0.38, w: 9.6, h: 0.35, isTextBox: true,
      fontFace: FONT, fontSize: 11.5, color: "B4A99E", margin: 0,
    });
  });
  s.addText("株式会社WineBank　代表 中野邦人", {
    x: M + 0.3, y: 6.15, w: 7.5, h: 0.3, isTextBox: true,
    fontFace: FONT, fontSize: 12, bold: true, color: WHITE, margin: 0,
  });
  s.addText("〒106-0032 東京都港区六本木4-12-8 第六DMJビル2階　TEL 03-6416-9370　nakano@wine-bank.co.jp", {
    x: M + 0.3, y: 6.5, w: 11.5, h: 0.3, isTextBox: true,
    fontFace: FONT, fontSize: 10.5, color: "9A8F84", margin: 0,
  });
}

pptx.writeFile({ fileName: OUT }).then(() => console.log("wrote " + OUT));
