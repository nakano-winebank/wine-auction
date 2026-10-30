const path = require("path");
const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const Fa = require("react-icons/fa6");
const [PPTX_SKILL, STYLE, OUT] = process.argv.slice(2);
const S = require(STYLE);

async function icon(name, hex, px = 256) {
  const svg = ReactDOMServer.renderToStaticMarkup(React.createElement(Fa[name], { color: "#" + hex, size: px }));
  return "image/png;base64," + (await sharp(Buffer.from(svg)).resize(px, px).png().toBuffer()).toString("base64");
}

(async () => {
  const pres = new pptxgen();
  pres.title = "中小企業のAI M&A部門 事業概要";
  const k = S.setup(pres, { footer: "Confidential", pptxSkill: PPTX_SKILL });
  const { C, H, M, CW, T } = k;
  const tblBorder = { type: "solid", pt: 0.75, color: H.accent3 };

  // ===== 1. 表紙 =====
  pres.addSection({ title: "導入" });
  let s = k.cover({ section: "導入", kicker: "BUSINESS OVERVIEW ／ 事業概要", title: "中小企業に、\nAIの「M&A部門」を。", sub: "〜 49戦の手順×AIで、M&Aで不幸になる人をなくす 〜", name: "中野 邦人", role: "株式会社WineBank 代表取締役 ／ 株式会社あどばる 代表取締役会長" });
  s.addNotes("M&A担当がいない会社に、AIと49戦の経験で『社内M&A部門』を月額で提供する事業です。");

  // ===== 2. ひと目でわかる =====
  s = k.content({ section: "導入", kicker: "ONE PAGE", title: "この事業を、ひと言でいうと", sub: "M&A担当がいない会社に入り込み、買収を成功させながら担当者を育てる" });
  const op = [
    { n: "01", h: "誰に", b: "M&Aで成長したいが、社内にM&A担当がいない・育てたい年商10〜100億円の企業" },
    { n: "02", h: "何を", b: "①M&A担当の派遣 ②自社データを学習するAI ③全案件が集まるM&A情報REINS。この3点セットを月額で" },
    { n: "03", h: "なぜ勝てる", b: "49戦の勝ちと負けから作った判断ルールをAIに組み込み、買い手の側だけに立つ" },
  ];
  for (let i = 0; i < 3; i++) {
    const x = M + i * 4.03;
    k.card(s, x, 2.3, 3.77, 2.95, { name: "one page " + op[i].n });
    T(s, op[i].n, { x: x + 2.7, y: 2.45, w: 0.85, h: 0.5, fontSize: 24, bold: true, color: C.accent3, align: "right" });
    k.pill(s, x + 0.3, 2.55, 1.3, op[i].h);
    T(s, op[i].b, { x: x + 0.3, y: 3.15, w: 3.2, h: 1.95, fontSize: 14 });
  }
  k.bar(s, 5.55, "月額50万円〜で「社内M&A部門」を持てる。成約したときだけ成功報酬", "仲介の高額手数料でも、マッチングサイトの丸投げでもない第三の選択肢");
  s.addNotes("誰に・何を・なぜ勝てるか。この3つだけ覚えて帰ってもらうページです。");

  // ===== 3. 課題 =====
  pres.addSection({ title: "課題と原点" });
  s = k.content({ section: "課題と原点", kicker: "PROBLEM", title: "買い手の味方で、買った後まで責任を持つ人がいない", sub: "M&Aの需要は増え続けているのに、中小企業の買い手は一人で戦っている" });
  k.stat(s, M, 2.25, 3.77, 2.15, "127万", "人", "後継者のいない70歳以上の経営者（2025年時点）");
  k.stat(s, M + 4.03, 2.25, 3.77, 2.15, "約4,700", "件／年", "国内のM&A件数（2024年）。後継者不在に比べ桁違いに少ない");
  k.stat(s, M + 8.06, 2.25, 3.77, 2.15, "6,700万〜", "1.3億円", "大手仲介の1件あたり平均手数料");
  const pains = [
    ["担当者がいない", "案件の良し悪しを判断できる人が社内にいない。仲介の言い値で買う"],
    ["仲介は利益相反", "日本の中小M&Aは約8割が両手仲介。買い手のためだけに動く人がいない"],
    ["買った後に失敗", "仲介の仕事は成約まで。統合で人が辞め、数字が崩れても誰も止めない"],
  ];
  for (let i = 0; i < 3; i++) {
    const x = M + i * 4.03;
    k.card(s, x, 4.55, 3.77, 1.65, { fill: "FFFFFF", name: "pain " + (i + 1) });
    k.badge(s, x + 0.25, 4.75, 0.42, "×", { fill: C.text1, size: 14 });
    T(s, pains[i][0], { x: x + 0.8, y: 4.75, w: 2.8, h: 0.42, fontSize: 15, bold: true, valign: "middle" });
    T(s, pains[i][1], { x: x + 0.3, y: 5.3, w: 3.25, h: 0.85, fontSize: 11.5, color: C.accent2 });
  }
  k.source(s, "出典：経済産業省（2018年4月発表データ）、レコフ「MARR Online」、経済産業省 M&A支援機関登録制度 実績報告（2023年）、各社有価証券報告書");
  s.addNotes("市場はある。でも買い手側には、判断できる人も、味方も、買った後の支援もない。");

  // ===== 4. 創業の理由 =====
  s = k.content({ section: "課題と原点", kicker: "WHY WE DO THIS", title: "M&Aで不幸になる人を、これ以上増やさない", sub: "49戦して分かったのは、M&Aは才能ではなく手順で勝てるということ" });
  const story = [
    ["原体験", "自分も負けた。多店舗飲食（11店舗）で−1.40億円、ポータル事業で−1.70億円。幸福度の谷は、いつもM&Aの負けと同じ年にあった"],
    ["気づき", "負けた理由は才能ではなく、手順を飛ばしたこと。値づけ・PMI責任者・売る時期を、買う前に決めていなかった"],
    ["決意", "やり方さえ知っていれば、M&Aは成功できる。その手順を、買い手の側に立って渡す"],
  ];
  for (let i = 0; i < 3; i++) {
    const y = 2.3 + i * 1.45;
    k.badge(s, M, y + 0.3, 0.62, String(i + 1), { size: 16 });
    k.card(s, M + 0.85, y, 6.4, 1.27, { name: "story " + (i + 1) });
    T(s, story[i][0], { x: M + 1.1, y: y + 0.12, w: 5.9, h: 0.35, fontSize: 14, bold: true, color: C.accent1 });
    T(s, story[i][1], { x: M + 1.1, y: y + 0.47, w: 5.9, h: 0.75, fontSize: 12 });
  }
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 8.3, y: 2.3, w: 4.28, h: 4.17, rectRadius: 0.06, fill: { color: C.text1 }, line: { color: C.text1 }, objectName: "founder quote" });
  T(s, [
    { text: "“", options: { fontSize: 40, bold: true, color: C.accent1, breakLine: true } },
    { text: "失敗して不幸になる人を、増やしたくない。成功してほしい。", options: { fontSize: 18, bold: true, color: C.background1, breakLine: true } },
    { text: " ", options: { fontSize: 8, breakLine: true } },
    { text: "自分の49戦の勝ちと負けから、その手順を全部渡します。", options: { fontSize: 13, color: C.accent3, breakLine: true } },
    { text: " ", options: { fontSize: 10, breakLine: true } },
    { text: "中野 邦人", options: { fontSize: 14, bold: true, color: C.accent4 } },
  ], { x: 8.65, y: 2.4, w: 3.6, h: 3.95 });
  s.addNotes("ここが一番伝えたいところ。自分も負けた。だから、同じ負け方をする人を減らしたい。");

  // ===== 5. 実績 =====
  s = k.content({ section: "課題と原点", kicker: "TRACK RECORD", title: "49戦の実績：純資産より安く買い、営業利益を積み上げる", sub: "買った値段に対して「手元に残った資産（売却額を含む）」と「育った営業利益」で測る。すべて自社の実案件" });
  const SC = 2.0 / 18.2; // 1億円あたりの棒の長さ
  const panel = (x, o) => {
    if (o.dark) s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 2.2, w: 5.85, h: 4.42, rectRadius: 0.06, fill: { color: C.text1 }, line: { color: C.text1 }, objectName: "panel " + o.tag });
    else k.card(s, x, 2.2, 5.85, 4.42, { name: "panel " + o.tag });
    const fg = o.dark ? C.background1 : C.text1, sub = o.dark ? C.accent3 : C.accent2;
    k.pill(s, x + 0.3, 2.42, 1.55, o.tag, { fill: C.accent1 });
    T(s, o.head, { x: x + 2.0, y: 2.38, w: 3.6, h: 0.38, fontSize: 14, bold: true, color: o.dark ? C.accent4 : C.text1, valign: "middle" });
    // 購入額 vs 資産
    const bars = [["購入額", o.buy, H.accent5], ["純資産＋売却", o.asset, H.accent1]];
    bars.forEach(([lbl, v, col], i) => {
      const y = 3.0 + i * 0.55;
      T(s, lbl, { x: x + 0.3, y, w: 1.15, h: 0.42, fontSize: 11, bold: true, color: sub, valign: "middle" });
      s.addShape(pres.shapes.RECTANGLE, { x: x + 1.45, y: y + 0.04, w: v * SC, h: 0.34, fill: { color: col }, line: { color: col }, objectName: o.tag + " bar " + lbl });
      T(s, v.toFixed(1) + "億", { x: x + 1.53 + v * SC, y, w: 0.9, h: 0.42, fontSize: 12, bold: true, color: fg, valign: "middle" });
    });
    T(s, [{ text: o.mult, options: { fontSize: 28, bold: true, color: C.accent1, breakLine: true } }, { text: "購入額に対する資産", options: { fontSize: 9, color: sub } }], { x: x + 4.3, y: 2.9, w: 1.35, h: 1.15, align: "right", valign: "middle" });
    s.addShape(pres.shapes.LINE, { x: x + 0.3, y: 4.2, w: 5.25, h: 0, line: { color: o.dark ? "4E443C" : H.accent3, width: 0.75 } });
    // 営業利益
    T(s, o.opLabel, { x: x + 0.3, y: 4.3, w: 2.6, h: 0.3, fontSize: 11, bold: true, color: sub });
    T(s, [{ text: o.op, options: { fontSize: 30, bold: true, color: o.dark ? C.accent4 : C.text1 } }, { text: o.opUnit, options: { fontSize: 12, bold: true, color: sub } }], { x: x + 0.3, y: 4.6, w: 2.7, h: 0.7, valign: "middle" });
    T(s, o.opNote, { x: x + 0.3, y: 5.3, w: 2.6, h: 0.5, fontSize: 9.5, color: sub });
    // 代表案件
    o.deals.forEach((d, i) => {
      const y = 4.35 + i * 0.75;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: x + 3.05, y, w: 2.5, h: 0.65, rectRadius: 0.05, fill: { color: o.dark ? "3A322C" : C.background1 }, line: { color: o.dark ? "4E443C" : H.accent3 }, objectName: o.tag + " deal " + (i + 1) });
      T(s, [{ text: d[0], options: { bold: true, fontSize: 10.5, color: fg, breakLine: true } }, { text: d[1], options: { fontSize: 9, color: sub } }], { x: x + 3.15, y, w: 2.35, h: 0.65, valign: "middle" });
    });
    T(s, o.msg, { x: x + 0.3, y: 5.95, w: 5.25, h: 0.55, fontSize: 11.5, bold: true, color: o.dark ? C.accent4 : C.accent1, valign: "middle" });
  };
  panel(M, { tag: "第1期 2011–19", head: "数で獲りにいき、授業料も払った", buy: 10.8, asset: 7.3, mult: "0.7倍", opLabel: "保有期間中の営業利益", op: "累計7.6", opUnit: " 億円", opNote: "資産と合わせると14.9億円が戻った",
    deals: [["多店舗飲食C社（25店舗）", "3.3億円で取得 → 累計営業利益3.9億円"], ["ポータル事業D", "1,100万円で取得 → 累計1.7億円"]], msg: "負けも含めて、この9年がいまの判断ルールになった" });
  panel(M + 6.0, { dark: true, tag: "第2期 2020–", head: "純資産より安く買う", buy: 14.4, asset: 18.2, mult: "1.3倍", opLabel: "単年度の営業利益（2026年予想）", op: "2.4", opUnit: " 億円／年", opNote: "M&Aで取得したグループ会社の合計",
    deals: [["飲食A社", "8.2億円 → 純資産13.0億＋営業利益1.3億／年"], ["飲食B事業", "1,400万円 → 純資産7,000万＋営業利益8,000万／年"]], msg: "買った時点で資産が買値を上回り、利益は毎年積み上がる" });
  k.source(s, "第2期の純資産＋売却は、売却済み案件を売却額に置き換えて算出（あどばる株式の売却は含めない）。出典：中野邦人 M&A勝敗一覧表");
  s.addNotes("見るのは2つ。買った値段に対して資産がいくら残ったか、営業利益がいくらに育ったか。第1期は資産では0.7倍、ただ保有中に7.6億の営業利益を出した。第2期は純資産より安く買っているので、資産は買値の1.3倍。そのうえ単年度で2.4億の営業利益に育っている。飲食A社は8.2億で買って純資産13億、今期の営業利益1.3億。飲食B事業は1,400万で買って純資産7,000万、今期8,000万。");

  // ===== 6. 勝ち筋5原則 → サービス =====
  pres.addSection({ title: "サービス" });
  s = k.content({ section: "サービス", kicker: "PLAYBOOK", title: "49戦で残った5原則を、そのままサービスの判断基準に", sub: "他社が真似できないのは、AIではなく「負けから作ったルール」" });
  const rules = [
    ["純資産を下回る価格でしか買わない", "飲食A社：8.2億円で純資産13.0億円を取得", "AIが決算書とIMから適正価格を算出し、入口で足切り"],
    ["自分で見つける。仲介から始めない", "約50案件の発掘はほぼ自分。仲介経由は3割以下", "買収方針から候補企業を逆算し、直接打診を指導"],
    ["PMI責任者が決まらない案件は買わない", "同じポータル事業で、置いた人により5.0億円の差", "基本合意の前に「PMI責任者の指名」を必須に"],
    ["本業の外は、買わずに自分で作る", "買った本業外は全敗。自社で作った本業外は勝ち", "買収戦略の段階で本業外の案件を外す"],
    ["売る時期を、買う前に決めておく", "6年保有で−1.70億円／2ヶ月で30%売却し回収", "撤退ラインを買収前に文書化して合意"],
  ];
  T(s, "原則 と 49戦での実例", { x: M + 0.75, y: 2.15, w: 6, h: 0.3, fontSize: 10, bold: true, color: C.accent2 });
  T(s, "サービスでの実装", { x: 8.15, y: 2.15, w: 4.4, h: 0.3, fontSize: 10, bold: true, color: C.accent1 });
  for (let i = 0; i < 5; i++) {
    const y = 2.5 + i * 0.83;
    k.badge(s, M, y + 0.13, 0.5, "0" + (i + 1), { size: 12 });
    k.card(s, M + 0.7, y, 6.35, 0.72, { fill: "FFFFFF", noShadow: true, name: "rule " + (i + 1) });
    T(s, [{ text: rules[i][0], options: { bold: true, fontSize: 12.5, breakLine: true } }, { text: rules[i][1], options: { fontSize: 10.5, color: C.accent2 } }], { x: M + 0.9, y, w: 6.0, h: 0.72, valign: "middle" });
    s.addShape(pres.shapes.CHEVRON, { x: 7.67, y: y + 0.2, w: 0.26, h: 0.32, fill: { color: C.accent1 }, line: { color: C.accent1 }, objectName: "arrow " + (i + 1) });
    k.card(s, 8.1, y, 4.48, 0.72, { name: "impl " + (i + 1) });
    T(s, rules[i][2], { x: 8.3, y, w: 4.1, h: 0.72, fontSize: 11.5, valign: "middle" });
  }
  k.note(s, 6.7, "値づけを決める。PMIの人を決める。売る時期を決める。この3つを買う前に紙に書けば、負けても致命傷にはならない。");
  s.addNotes("原則の左側は私の実例、右側はそれをサービスでどう再現するか。案件名は伏せています。");

  // ===== 6b. 3点セット =====
  s = k.content({ section: "サービス", kicker: "SERVICE STACK", title: "人だけならSES、ツールだけならまとめサイト", sub: "3つ揃えて「社内M&A部門」。まずツールを入れ、そのうえに担当者を派遣する二段構え" });
  const layers = [
    { n: "①", t: "M&A担当の派遣・伴走", d: "コンサルタントが週次で入り、案件を進めながら担当者を育てる", alone: "単体なら：M&A担当のSES", c: C.text1, fg: C.background1, sub: C.accent3 },
    { n: "②", t: "自社データを学習するAI", d: "自社のBS/PL・強み・過去の検討履歴を投入。案件ごとにシナジーと投資回収を自動で試算", alone: "単体なら：分析ツール", c: C.accent1, fg: C.background1, sub: C.background2 },
    { n: "③", t: "M&A情報REINS", d: "全M&A会社・サイトのオープン情報を横断して毎日収集。買い手の方針に合う案件だけを通知", alone: "単体なら：無料のまとめサイト", c: C.background2, fg: C.text1, sub: C.accent2 },
  ];
  for (let i = 0; i < 3; i++) {
    const y = 2.25 + i * 1.42, L = layers[i], w = 6.4 + i * 0.5, x = M + (7.4 - w) / 2;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h: 1.28, rectRadius: 0.06, fill: { color: L.c }, line: { color: i === 2 ? H.accent3 : L.c }, objectName: "layer " + L.n });
    T(s, L.n, { x: x + 0.2, y, w: 0.6, h: 1.28, fontSize: 26, bold: true, color: i === 2 ? C.accent1 : C.accent4, valign: "middle" });
    T(s, [{ text: L.t, options: { fontSize: 15, bold: true, color: L.fg, breakLine: true } }, { text: L.d, options: { fontSize: 10.5, color: L.sub } }], { x: x + 0.85, y, w: w - 3.1, h: 1.28, valign: "middle" });
    T(s, L.alone, { x: x + w - 2.15, y, w: 2.0, h: 1.28, fontSize: 9.5, italic: true, color: L.sub, align: "right", valign: "middle" });
  }
  // 二段階
  const sx = 8.45;
  k.card(s, sx, 2.25, 4.13, 1.95, { name: "stage 1" });
  k.pill(s, sx + 0.25, 2.42, 1.0, "STEP 1");
  T(s, "ツールを入れる（③＋②）", { x: sx + 1.4, y: 2.38, w: 2.6, h: 0.38, fontSize: 13, bold: true, valign: "middle" });
  T(s, "全案件が自動で集まり、自社に合うかをAIが判定。月額の小さな契約で入口をつくる", { x: sx + 0.25, y: 2.88, w: 3.7, h: 1.2, fontSize: 11, color: C.accent2 });
  s.addShape(pres.shapes.CHEVRON, { x: sx + 1.9, y: 4.28, w: 0.4, h: 0.3, rotate: 90, fill: { color: C.accent1 }, line: { color: C.accent1 }, objectName: "stage arrow" });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: sx, y: 4.66, w: 4.13, h: 1.95, rectRadius: 0.06, fill: { color: C.text1 }, line: { color: C.text1 }, objectName: "stage 2" });
  k.pill(s, sx + 0.25, 4.83, 1.0, "STEP 2");
  T(s, "担当を派遣する（①）", { x: sx + 1.4, y: 4.79, w: 2.6, h: 0.38, fontSize: 13, bold: true, color: C.accent4, valign: "middle" });
  T(s, "ツールで見えた有望案件を、派遣した担当が一緒に進める。人の時間はツールで減らし、1人10社を回す", { x: sx + 0.25, y: 5.29, w: 3.7, h: 1.2, fontSize: 11, color: C.accent3 });
  k.note(s, 6.7, "3つが同じデータでつながっているから、SESでもまとめサイトでもない。使うほど自社専用のAIに育つ");
  s.addNotes("人だけ出せばSES、情報を集めるだけならMANDAと同じ。ツールで入って、そのうえに人を乗せる二段構え。担当が抜けてもツールとデータが残るので、解約されにくい。");

  // ===== 6c. M&A情報REINS =====
  s = k.content({ section: "サービス", kicker: "M&A INFORMATION REINS", title: "M&A情報REINS：散らばった公開案件を毎日ひとつに", sub: "MANDAが実証した横断収集を土台に、「見るだけ」で終わらせず自社データのAIにつなぐ" });
  const flow = [
    ["FaGlobe", "集める", "M&Aマッチングサイト、仲介各社の公開案件、金融機関・公的機関の案件情報を毎日収集"],
    ["FaLayerGroup", "整える", "同じ案件の重複をまとめ、成約済み・掲載終了を除外。業種・地域・規模の表記をそろえる"],
    ["FaFilter", "選ぶ", "買い手の買収方針と自社データで、合う案件だけをAIが点数づけ"],
    ["FaBell", "届ける", "新着の有望案件を毎朝通知。気になる案件は担当がすぐ打診"],
  ];
  for (let i = 0; i < 4; i++) {
    const x = M + i * 3.03;
    k.card(s, x, 2.25, 2.8, 2.3, { name: "reins " + flow[i][1] });
    k.badge(s, x + 0.25, 2.45, 0.62, "", { fill: C.text1 });
    s.addImage({ data: await icon(flow[i][0], H.accent4), x: x + 0.4, y: 2.6, w: 0.32, h: 0.32 });
    T(s, flow[i][1], { x: x + 1.0, y: 2.45, w: 1.6, h: 0.62, fontSize: 17, bold: true, valign: "middle" });
    T(s, flow[i][2], { x: x + 0.25, y: 3.2, w: 2.35, h: 1.5, fontSize: 11, color: C.accent2 });
    if (i < 3) s.addShape(pres.shapes.CHEVRON, { x: x + 2.84, y: 3.38, w: 0.16, h: 0.28, fill: { color: C.accent1 }, line: { color: C.accent1 }, objectName: "reins arrow" });
  }
  k.card(s, M, 4.75, 2.8, 1.75, { name: "reins scale" });
  T(s, [{ text: "約2万", options: { fontSize: 32, bold: true, color: C.accent1 } }, { text: " 件", options: { fontSize: 13, bold: true } }], { x: M + 0.25, y: 4.85, w: 2.4, h: 0.8, valign: "middle" });
  T(s, "横断収集で集まる公開案件の規模（MANDAの実績）", { x: M + 0.25, y: 5.65, w: 2.35, h: 0.75, fontSize: 10.5, color: C.accent2 });
  k.card(s, M + 3.03, 4.75, 8.8, 1.75, { fill: "FFFFFF", name: "reins vs manda" });
  T(s, [
    { text: "MANDAとの違い", options: { bold: true, color: C.accent1, fontSize: 12.5, breakLine: true } },
    { text: "MANDAは「探しやすくする」ところで止まり、無料のまま収益化できなかった。M&A情報REINSは集めた案件を②自社データのAIに流し込み、①派遣した担当が動く。情報そのものではなく、情報から先の意思決定でお金をいただく", options: { fontSize: 11.5 } },
  ], { x: M + 3.3, y: 4.75, w: 8.3, h: 1.75, valign: "middle" });
  k.source(s, "収集は掲載元の利用規約に沿い、提携・API・掲載許諾を優先する。件数はMANDA株式会社 会社紹介資料による");
  s.addNotes("M&A版のREINS。オープンになっている案件は全部ここに集まる状態をつくる。MANDAと違うのは、集めた先にAIと人がいること。");

  // ===== 7. AIの使い方 =====
  s = k.content({ section: "サービス", kicker: "AI × EXPERIENCE", title: "AIは誰でも使える。差がつくのは、何を判断させるか", sub: "AIが作業の大半を担い、49戦のルールで判定し、最後は人が責任を持つ" });
  // 入力
  k.card(s, M, 2.3, 2.55, 3.55, { name: "input" });
  T(s, "入力", { x: M + 0.25, y: 2.45, w: 2, h: 0.35, fontSize: 13, bold: true, color: C.accent1 });
  T(s, [{ text: "自社のBS/PL・試算表", options: { breakLine: true } }, { text: "買収方針（業種・エリア・予算）", options: { breakLine: true } }, { text: "M&A情報REINSの全案件・IM", options: { breakLine: true } }, { text: "市場・企業データ" }].map((r, i, a) => ({ ...r, options: { ...r.options, bullet: { indent: 12 }, paraSpaceAfter: 8, breakLine: i < a.length - 1 } })), { x: M + 0.25, y: 2.9, w: 2.15, h: 2.8, fontSize: 11.5 });
  // AIエンジン
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 3.55, y: 2.3, w: 5.0, h: 3.55, rectRadius: 0.06, fill: { color: C.text1 }, line: { color: C.text1 }, objectName: "ai engine" });
  T(s, "AIエージェント", { x: 3.8, y: 2.42, w: 3, h: 0.35, fontSize: 13, bold: true, color: C.accent4 });
  const mods = [["FaRoute", "買収戦略", "何を買うべきか"], ["FaMagnifyingGlass", "ソーシング", "候補を探す"], ["FaFilter", "スクリーニング", "足切り・優先度"], ["FaChartLine", "価格算定", "純資産・適正価格"], ["FaCoins", "資金設計", "借入余力・調達"], ["FaPeopleGroup", "PMI計画", "責任者・100日"]];
  for (let i = 0; i < 6; i++) {
    const col = i % 3, row = Math.floor(i / 3), x = 3.8 + col * 1.55, y = 2.9 + row * 1.42;
    k.darkCard(s, x, y, 1.42, 1.28, { name: "module " + mods[i][1] });
    s.addImage({ data: await icon(mods[i][0], H.accent4), x: x + 0.53, y: y + 0.14, w: 0.36, h: 0.36 });
    T(s, mods[i][1], { x, y: y + 0.55, w: 1.42, h: 0.35, fontSize: 11.5, bold: true, color: C.background1, align: "center" });
    T(s, mods[i][2], { x, y: y + 0.88, w: 1.42, h: 0.3, fontSize: 9, color: C.accent5, align: "center" });
  }
  // ルールゲート
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 8.75, y: 2.3, w: 1.15, h: 3.55, rectRadius: 0.06, fill: { color: C.accent1 }, line: { color: C.accent1 }, objectName: "rule gate" });
  T(s, "49戦の\n5原則で\n判定", { x: 8.75, y: 2.3, w: 1.15, h: 3.55, fontSize: 13, bold: true, color: C.background1, align: "center", valign: "middle" });
  // 出力
  k.card(s, 10.1, 2.3, 2.48, 3.55, { name: "output" });
  T(s, "出力", { x: 10.35, y: 2.45, w: 2, h: 0.35, fontSize: 13, bold: true, color: C.accent1 });
  T(s, ["買う／見送るの判断と理由", "適正価格と交渉の上限", "資金調達の組み立て", "PMI責任者と撤退ライン"].map((t, i, a) => ({ text: t, options: { bullet: { indent: 12 }, paraSpaceAfter: 8, breakLine: i < a.length - 1 } })), { x: 10.35, y: 2.9, w: 2.08, h: 2.8, fontSize: 11.5 });
  k.bar(s, 6.05, "最終判断・交渉・責任は人（コンサルタントと中野）が持つ", "AIで1人あたりの担当社数を増やし、価格を抑えながら品質を保つ", { h: 0.85 });
  s.addNotes("AIは道具。差は、49戦のルールでAIの出した答えを判定するところにある。");

  // ===== 7b. IMデータベース =====
  s = k.content({ section: "サービス", kicker: "IM DATABASE", title: "関東圏×4業種のIMデータベースで「適正価格」を語る", sub: "成約データまでは持てなくても、IM（企業概要書）なら集められる。地域と業種を絞って、M&A版REINSの土台をつくる" });
  const stepLbl = (y, n, t, fill) => {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M, y, w: 0.95, h: 1.75, rectRadius: 0.06, fill: { color: fill }, line: { color: fill }, objectName: "step label " + n });
    T(s, [{ text: "STEP", options: { fontSize: 9.5, breakLine: true } }, { text: n, options: { fontSize: 24, breakLine: true } }, { text: t, options: { fontSize: 10.5 } }], { x: M, y, w: 0.95, h: 1.75, bold: true, color: C.background1, align: "center", valign: "middle" });
  };
  const chev = (x, y) => s.addShape(pres.shapes.CHEVRON, { x, y, w: 0.22, h: 0.3, fill: { color: C.accent1 }, line: { color: C.accent1 }, objectName: "flow arrow" });
  stepLbl(2.2, "1", "支援前", C.text1);
  const st1 = [
    ["集める", "提携FA・仲介から受け取ったIM、顧問先・士業経由、自社49戦の案件、公開案件"],
    ["AIで構造化", "業種・地域・売上・営業利益・EBITDA・純資産・希望価格・人員・設備を自動で抽出"],
    ["IMデータベース", "関東圏（一都三県）×4業種にまず特化"],
    ["適正価格の幅", "業種×規模ごとのEBITDA倍率・純資産倍率で「高い／妥当／安い」を判定"],
  ];
  for (let i = 0; i < 4; i++) {
    const x = 1.9 + i * 2.7, dk = i === 2;
    if (dk) s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 2.2, w: 2.38, h: 1.75, rectRadius: 0.06, fill: { color: C.text1 }, line: { color: C.text1 }, objectName: "im database" });
    else k.card(s, x, 2.2, 2.38, 1.75, { name: "step1 " + st1[i][0] });
    T(s, st1[i][0], { x: x + 0.18, y: 2.3, w: 2.05, h: 0.4, fontSize: 14, bold: true, color: dk ? C.accent4 : C.text1 });
    T(s, st1[i][1], { x: x + 0.18, y: 2.72, w: 2.05, h: dk ? 0.6 : 1.15, fontSize: 10.5, color: dk ? C.accent3 : C.accent2 });
    if (dk) ["生産", "卸", "飲食", "不動産"].forEach((g, j) => k.pill(s, x + 0.18 + j * 0.52, 3.45, 0.48, g, { fill: C.accent1 }));
    if (i < 3) chev(x + 2.43, 2.92);
  }
  stepLbl(4.15, "2", "支援中・後", C.accent1);
  k.card(s, 1.9, 4.15, 2.3, 0.8, { name: "input im" });
  T(s, [{ text: "検討した全IM", options: { bold: true, breakLine: true } }, { text: "NDA後に受け取った資料をすべて", options: { fontSize: 10, color: C.accent2 } }], { x: 2.08, y: 4.15, w: 2.0, h: 0.8, fontSize: 12.5, valign: "middle" });
  k.card(s, 1.9, 5.1, 2.3, 0.8, { name: "input own" });
  T(s, [{ text: "自社のBS/PL・強み", options: { bold: true, breakLine: true } }, { text: "顧客基盤・拠点・人材・仕入・技術", options: { fontSize: 10, color: C.accent2 } }], { x: 2.08, y: 5.1, w: 2.0, h: 0.8, fontSize: 12.5, valign: "middle" });
  chev(4.3, 4.88);
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 4.62, y: 4.15, w: 2.75, h: 1.75, rectRadius: 0.06, fill: { color: C.accent1 }, line: { color: C.accent1 }, objectName: "cross analysis" });
  T(s, [{ text: "AIで掛け合わせ分析", options: { bold: true, fontSize: 14, breakLine: true } }, { text: " ", options: { fontSize: 5, breakLine: true } }, { text: "相手のIM×自社の数字と強みを突き合わせ、データベースの相場と比べる", options: { fontSize: 10.5 } }], { x: 4.8, y: 4.15, w: 2.4, h: 1.75, color: C.background1, valign: "middle" });
  chev(7.47, 4.88);
  k.card(s, 7.8, 4.15, 4.78, 1.75, { name: "outputs" });
  T(s, "アウトプット", { x: 8.0, y: 4.22, w: 2, h: 0.32, fontSize: 11, bold: true, color: C.accent1 });
  ["適正価格と交渉の上限", "シナジー試算（売上・コスト）", "借入余力と資金計画", "レッドフラグとPMIの論点"].forEach((t, i) => {
    const x = 8.0 + (i % 2) * 2.25, y = 4.6 + Math.floor(i / 2) * 0.6;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: 2.13, h: 0.5, rectRadius: 0.05, fill: { color: C.background1 }, line: { color: C.accent3 }, objectName: "out " + (i + 1) });
    T(s, t, { x, y, w: 2.13, h: 0.5, fontSize: 10, bold: true, align: "center", valign: "middle" });
  });
  k.pill(s, 10.2, 4.0, 2.25, "↑ 匿名化してDBへ還元", { fill: C.accent3, color: C.text1 });
  k.note(s, 6.15, "使うほど相場の精度が上がる。守秘義務：IMはNDAの範囲内でのみ利用し、DB化は開示元の同意を得た項目を社名が分からない形に加工して行う");
  s.addNotes("成約データは持てないが、IMなら集められる。関東の生産・卸・飲食・不動産に絞って相場をつくり、適正価格をアドバイスする。支援が始まったら、受け取ったIMをすべて取り込み、お客様のBS/PLと強みに掛け合わせて分析する。分析したIMは匿名化してデータベースに戻すので、使うほど精度が上がる。");

  // ===== 8. 競合との違い =====
  s = k.content({ section: "サービス", kicker: "POSITIONING", title: "仲介でもマッチングサイトでもない、第三の選択肢", sub: "「買い手の味方」として「成功まで伴走する」のは、ここだけ" });
  // マップ
  const mx = M, my = 2.3, mw = 5.9, mh = 3.75;
  s.addShape(pres.shapes.RECTANGLE, { x: mx, y: my, w: mw, h: mh, fill: { color: C.background2 }, line: { color: C.accent3 }, objectName: "map bg" });
  s.addShape(pres.shapes.LINE, { x: mx, y: my + mh / 2, w: mw, h: 0, line: { color: H.accent5, width: 0.75, dashType: "dash" } });
  s.addShape(pres.shapes.LINE, { x: mx + mw / 2, y: my, w: 0, h: mh, line: { color: H.accent5, width: 0.75, dashType: "dash" } });
  T(s, "買い手の味方", { x: mx + 0.1, y: my + 0.08, w: 2, h: 0.3, fontSize: 9.5, bold: true, color: C.accent2 });
  T(s, "中立・両手", { x: mx + 0.1, y: my + mh - 0.38, w: 2, h: 0.3, fontSize: 9.5, bold: true, color: C.accent2 });
  T(s, "情報を渡すだけ", { x: mx + 0.1, y: my + mh / 2 + 0.05, w: 2, h: 0.3, fontSize: 9.5, color: C.accent2 });
  T(s, "成功まで伴走", { x: mx + mw - 2.1, y: my + mh / 2 + 0.05, w: 2, h: 0.3, fontSize: 9.5, color: C.accent2, align: "right" });
  const dot = (x, y, d, label, fill, tc) => { s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: fill }, line: { color: fill }, objectName: "pos " + label }); T(s, label, { x, y, w: d, h: d, fontSize: 10.5, bold: true, color: tc, align: "center", valign: "middle" }); };
  dot(mx + 0.55, my + 2.25, 1.2, "マッチング\nサイト", H.accent3, C.text1);
  dot(mx + 3.2, my + 2.15, 1.3, "大手仲介", H.accent5, C.background1);
  dot(mx + 2.95, my + 0.55, 1.0, "買い手\nFA", H.accent3, C.text1);
  dot(mx + 4.2, my + 0.3, 1.45, "当社", H.accent1, C.background1);
  // 比較表
  const ck = (t, good) => ({ text: t, options: { align: "center", bold: good, color: good ? C.accent1 : C.accent2 } });
  const th = (t, hi) => ({ text: t, options: { bold: true, color: C.background1, fill: { color: hi ? C.accent1 : C.text1 }, align: "center", fontSize: 11 } });
  s.addTable([
    [th(""), th("大手仲介"), th("マッチング"), th("当社", true)],
    [{ text: "立場", options: { bold: true } }, ck("両手が中心"), ck("中立"), ck("買い手専任", true)],
    [{ text: "費用", options: { bold: true } }, ck("数千万〜億"), ck("無料〜数%"), ck("月50万＋成功報酬", true)],
    [{ text: "判断の支援", options: { bold: true } }, ck("△"), ck("×"), ck("AI＋5原則", true)],
    [{ text: "買った後", options: { bold: true } }, ck("×"), ck("×"), ck("PMIまで", true)],
    [{ text: "人が育つ", options: { bold: true } }, ck("×"), ck("×"), ck("担当者を育成", true)],
  ], { x: 6.95, y: 2.3, w: 5.63, colW: [1.35, 1.35, 1.35, 1.58], rowH: 0.62, fontSize: 11, valign: "middle", border: tblBorder, color: C.text1, fill: { color: "FFFFFF" }, margin: [0.03, 0.08, 0.03, 0.08], objectName: "comparison" });
  k.note(s, 6.3, "→ 担当者が育つので、2件目以降は自社で買えるようになる。それでも続けたいと思われる伴走をする");
  s.addNotes("左のマップで立ち位置、右の表で違い。費用は仲介の1/10以下で、買った後と人材育成まで入っている。");

  // ===== 9. 誰に =====
  s = k.content({ section: "サービス", kicker: "TARGET", title: "お客様：M&A担当を育てたい会社", sub: "単価の低い個人の買い手は狙わず、継続して買う法人に絞る" });
  const per = [
    { ic: "FaBuilding", t: "M&A担当がいない・育てたい中堅中小企業", s: "年商10〜100億円／M&Aで成長したい", p: "案件の良し悪しを判断できない。仲介の言い値で買う", w: "社内にM&A部門をつくる代わりに", pr: "最優先" },
    { ic: "FaBriefcase", t: "PE・サーチファンド・承継ファンド", s: "年に複数件を検討・投資", p: "ソーシングの効率が悪い。スクリーニングに手間がかかる", w: "アナリストの手間の代わりに", pr: "高" },
    { ic: "FaLandmark", t: "士業・地方銀行・信用金庫", s: "顧問先・取引先の買い手を支援", p: "顧問先の買収相談に応える道具とネットワークがない", w: "顧問サービスの付加価値に（紹介チャネル）", pr: "紹介元" },
  ];
  for (let i = 0; i < 3; i++) {
    const x = M + i * 4.03, p = per[i];
    k.card(s, x, 2.3, 3.77, 4.3, { name: "persona " + (i + 1) });
    k.badge(s, x + 0.3, 2.55, 0.72, "", { fill: C.text1 });
    s.addImage({ data: await icon(p.ic, H.accent4), x: x + 0.48, y: 2.73, w: 0.36, h: 0.36 });
    k.pill(s, x + 2.45, 2.75, 1.05, p.pr, i === 0 ? {} : { fill: C.background1, line: C.accent1, color: C.accent1 });
    T(s, p.t, { x: x + 0.3, y: 3.45, w: 3.2, h: 0.7, fontSize: 14.5, bold: true });
    T(s, p.s, { x: x + 0.3, y: 4.15, w: 3.2, h: 0.35, fontSize: 10.5, color: C.accent2 });
    T(s, [{ text: "悩み", options: { bold: true, color: C.accent1, breakLine: true } }, { text: p.p, options: { breakLine: true } }, { text: " ", options: { fontSize: 6, breakLine: true } }, { text: "払う理由", options: { bold: true, color: C.accent1, breakLine: true } }, { text: p.w }], { x: x + 0.3, y: 4.6, w: 3.2, h: 1.9, fontSize: 12 });
  }
  s.addNotes("一番のお客様は、M&Aで成長したいのに担当者がいない会社。");

  // ===== 10. 12ヶ月の伴走 =====
  s = k.content({ section: "サービス", kicker: "HOW IT WORKS", title: "12ヶ月で「自社で買える会社」にする", sub: "コンサルタントが案件を進めながら、担当者に手順を移植する" });
  const tl = [
    ["1〜2ヶ月", "戦略と値づけ基準", "自社BS/PLをAIで分析し、買う領域・予算・借入余力を決める", "自社の買収基準を言える"],
    ["3〜5ヶ月", "ソーシングとIM読解", "候補リストを作って打診。IMをAIで読み、足切りと優先順位をつける", "IMを読み、足切りできる"],
    ["6〜8ヶ月", "交渉・DD・資金", "交渉に同席して指導。DDの論点整理と資金調達の設計", "仲介と対等に交渉できる"],
    ["9〜12ヶ月", "クロージングとPMI", "PMI責任者と100日プラン、撤退ラインを決める", "買った後を自走できる"],
  ];
  s.addShape(pres.shapes.LINE, { x: M + 0.35, y: 2.65, w: CW - 0.7, h: 0, line: { color: H.accent3, width: 2 } });
  for (let i = 0; i < 4; i++) {
    const x = M + i * 3.03;
    k.badge(s, x + 0.12, 2.42, 0.46, String(i + 1), { size: 12, fill: i === 3 ? C.text1 : C.accent1 });
    T(s, tl[i][0], { x: x + 0.7, y: 2.42, w: 2, h: 0.46, fontSize: 13, bold: true, color: C.accent1, valign: "middle" });
    k.card(s, x, 3.1, 2.8, 2.15, { name: "step " + (i + 1) });
    T(s, tl[i][1], { x: x + 0.25, y: 3.25, w: 2.35, h: 0.4, fontSize: 14, bold: true });
    T(s, tl[i][2], { x: x + 0.25, y: 3.7, w: 2.35, h: 1.45, fontSize: 11.5, color: C.accent2 });
    k.card(s, x, 5.38, 2.8, 0.72, { fill: "FFFFFF", noShadow: true, name: "goal " + (i + 1) });
    T(s, [{ text: "担当者が ", options: { bold: true, color: C.accent1 } }, { text: tl[i][3], options: { bold: true } }], { x: x + 0.2, y: 5.38, w: 2.45, h: 0.72, fontSize: 11.5, valign: "middle" });
  }
  k.note(s, 6.3, "体制：コンサルタント1人で10社まで（交渉段階は同時3社まで）。顧客同士がぶつからないよう、同業は1社まで");
  s.addNotes("成果は成約だけではない。12ヶ月後に担当者が自分で回せるようになることを約束する。");

  // ===== 11. 料金 =====
  s = k.content({ section: "サービス", kicker: "PRICING", title: "ツールで入り、人で深め、成約したら成功報酬", sub: "M&A担当を1人採用する（年収800〜1,500万円＋採用費）より安く、社内に人とデータが育つ" });
  const plans = [
    { n: "ツール", p: "10", u: "万円／月", t: "③＋②　入口のプラン", items: ["M&A情報REINS（全案件の横断収集）", "自社データを学習するAI", "シナジー・投資回収の試算", "有望案件の毎朝通知"], dark: false },
    { n: "スタンダード", p: "50", u: "万円／月", t: "①＋②＋③　12ヶ月", items: ["ツールの全機能", "M&A担当の派遣・育成", "ソーシング・IMの読解", "資金調達の設計", "交渉への同席と指導"], dark: false },
    { n: "プレミアム", p: "80", u: "万円／月", t: "枠数限定", items: ["スタンダードの全内容", "中野との月1時間の壁打ち", "49戦の基準でのフィードバック", "交渉の代行"], dark: true },
    { n: "成功報酬", p: "2〜3", u: "%", t: "成約時のみ・最低500万円", items: ["買い手FAとしてクロージングまで", "支払済み月額の50%を充当", "二重取りにしない"], dark: false },
  ];
  for (let i = 0; i < 4; i++) {
    const x = M + i * 2.99, p = plans[i], dk = p.dark, cw = 2.84;
    if (dk) s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 2.3, w: cw, h: 4.35, rectRadius: 0.06, fill: { color: C.text1 }, line: { color: C.text1 }, objectName: "plan premium" });
    else k.card(s, x, 2.3, cw, 4.35, { name: "plan " + p.n });
    if (dk) k.pill(s, x + 1.65, 2.52, 1.0, "おすすめ", { fill: C.accent1 });
    T(s, p.n, { x: x + 0.25, y: 2.5, w: 1.6, h: 0.4, fontSize: 14, bold: true, color: dk ? C.accent4 : C.accent1 });
    T(s, [{ text: p.p, options: { fontSize: 36, bold: true, color: dk ? C.background1 : C.text1 } }, { text: " " + p.u, options: { fontSize: 11, bold: true, color: dk ? C.accent3 : C.accent2 } }], { x: x + 0.25, y: 2.95, w: 2.45, h: 0.85, valign: "middle" });
    T(s, p.t, { x: x + 0.25, y: 3.8, w: 2.4, h: 0.3, fontSize: 10, color: dk ? C.accent5 : C.accent2 });
    s.addShape(pres.shapes.LINE, { x: x + 0.25, y: 4.22, w: cw - 0.5, h: 0, line: { color: dk ? "4E443C" : H.accent3, width: 0.75 } });
    T(s, p.items.map((t, j, a) => ({ text: t, options: { bullet: { indent: 11 }, paraSpaceAfter: 5, breakLine: j < a.length - 1 } })), { x: x + 0.25, y: 4.35, w: cw - 0.4, h: 2.2, fontSize: 10.5, color: dk ? C.background1 : C.text1 });
  }
  k.source(s, "価格はすべて税別・仮置き。顧客インタビューで支払意思額を検証して確定する");
  s.addNotes("入口はツールの月10万円。有望案件が見えたら担当を派遣するスタンダードへ。プレミアムの価値は中野本人との壁打ちで、枠数を絞る。");

  // ===== 12. 独自データ =====
  pres.addSection({ title: "事業性" });
  s = k.content({ section: "事業性", kicker: "MOAT", title: "使うほど溜まるデータが、真似されない強みになる", sub: "不動産のREINSの本当の価値は成約データ。M&Aでも同じ資産をつくる" });
  const fw = [[2.85, 2.3, "伴走する顧客が\n増える"], [5.1, 3.65, "買収ニーズと\n検討データが溜まる"], [2.85, 5.0, "成約データ（価格・\n倍率）が溜まる"], [0.75, 3.65, "AIの価格算定と\n判断の精度が上がる"]];
  s.addShape(pres.shapes.OVAL, { x: 3.12, y: 3.6, w: 1.7, h: 1.25, fill: { color: C.text1 }, line: { color: C.text1 }, objectName: "flywheel hub" });
  T(s, "データの\n好循環", { x: 3.12, y: 3.6, w: 1.7, h: 1.25, fontSize: 13, bold: true, color: C.background1, align: "center", valign: "middle" });
  for (const [x, y, t] of fw) { k.card(s, x, y, 2.2, 1.05, { name: "fw node" }); T(s, t, { x, y, w: 2.2, h: 1.05, fontSize: 11.5, bold: true, align: "center", valign: "middle" }); }
  const arr = (o) => s.addShape(pres.shapes.LINE, { ...o, line: { color: H.accent1, width: 2, endArrowType: "triangle" } });
  arr({ x: 5.1, y: 2.85, w: 0.9, h: 0.75 });
  arr({ x: 5.1, y: 4.75, w: 0.9, h: 0.5, flipH: true });
  arr({ x: 1.85, y: 4.75, w: 0.95, h: 0.5, flipH: true, flipV: true });
  arr({ x: 1.85, y: 2.85, w: 0.95, h: 0.75, flipV: true });
  const assets = [["FaChartLine", "成約価格データベース", "公開されない中小M&Aの成約価格・倍率。AIの価格算定の根拠になる"], ["FaShieldHalved", "認証バイヤーの一覧", "財務・実績・反社を確認した買い手。悪質な買い手問題への答えになる"], ["FaDatabase", "買収ニーズのデータ", "誰が何をいくらで買いたいか（本人同意のもと）。仲介・FA向けの商品になる"]];
  for (let i = 0; i < 3; i++) {
    const y = 2.3 + i * 1.45;
    k.card(s, 7.7, y, 4.88, 1.3, { name: "asset " + (i + 1) });
    k.badge(s, 7.9, y + 0.32, 0.66, "", { fill: C.text1 });
    s.addImage({ data: await icon(assets[i][0], H.accent4), x: 8.06, y: y + 0.48, w: 0.34, h: 0.34 });
    T(s, assets[i][1], { x: 8.75, y: y + 0.13, w: 3.7, h: 0.38, fontSize: 13.5, bold: true });
    T(s, assets[i][2], { x: 8.75, y: y + 0.52, w: 3.7, h: 0.72, fontSize: 10.5, color: C.accent2 });
  }
  s.addNotes("最初は人とノウハウで勝つ。続けるほどデータが溜まり、後から来た競合が追いつけなくなる。");

  // ===== 13. 事業計画 =====
  s = k.content({ section: "事業性", kicker: "BUSINESS PLAN", title: "3年目に売上10億円：ツール200社×派遣100社", sub: "ツールと派遣の月額がストック収益になり、成約時の成功報酬が上乗せされる（仮説）" });
  s.addChart(pres.charts.BAR, [
    { name: "ツール月額", labels: ["1年目", "2年目", "3年目"], values: [0.12, 0.6, 2.4] },
    { name: "派遣・伴走の月額", labels: ["1年目", "2年目", "3年目"], values: [0.62, 2.59, 6.72] },
    { name: "成功報酬", labels: ["1年目", "2年目", "3年目"], values: [0.12, 0.48, 1.5] },
  ], {
    x: M, y: 2.2, w: 6.6, h: 4.45, barDir: "col", barGrouping: "stacked", barGapWidthPct: 55,
    chartColors: [H.accent4, H.dk1, H.accent1], showValue: false, dataLabelPosition: "ctr", dataLabelFormatCode: "0.0", dataLabelColor: "FFFFFF", dataLabelFontSize: 10, dataLabelFontFace: "+mn-lt",
    showLegend: true, legendPos: "b", legendFontSize: 10, legendFontFace: "+mn-lt", legendColor: H.accent2,
    showTitle: true, title: "売上高（億円）", titleFontSize: 12, titleFontFace: "+mn-lt", titleColor: H.dk1,
    catAxisLabelColor: H.dk1, catAxisLabelFontSize: 11, catAxisLabelFontFace: "+mn-lt", valAxisLabelColor: H.accent5, valAxisLabelFontSize: 9, valAxisLabelFontFace: "+mn-lt",
    valGridLine: { color: "EDE6DA", size: 0.5 }, catGridLine: { style: "none" }, valAxisLabelFormatCode: "0", objectName: "plan chart",
  });
  const kp = [["0.9億", "1年目", "ツール10社・派遣10社・成約2件"], ["3.7億", "2年目", "ツール50社・派遣40社・成約8件"], ["10.6億", "3年目", "ツール200社・派遣100社・成約25件"]];
  for (let i = 0; i < 3; i++) {
    const y = 2.3 + i * 1.12;
    k.card(s, 7.7, y, 4.88, 0.98, { name: "kpi " + (i + 1) });
    T(s, kp[i][0], { x: 7.95, y, w: 1.55, h: 0.98, fontSize: 24, bold: true, color: C.accent1, valign: "middle" });
    T(s, [{ text: kp[i][1], options: { bold: true, breakLine: true } }, { text: kp[i][2], options: { fontSize: 10.5, color: C.accent2 } }], { x: 9.55, y, w: 2.9, h: 0.98, fontSize: 12.5, valign: "middle" });
  }
  k.bar(s, 5.72, "ツールが入口、派遣が収益の柱", "ツール契約の一部が派遣に上がる。コンサル1人あたり年約8,000万円", { x: 7.7, w: 4.88, h: 0.95, size: 14 });
  s.addNotes("数字は仮説。ツール月10万円、派遣は1人10社で月50〜80万円、年3件成約が前提。ツールの社数には派遣先は含めていない。");

  // ===== 14. ロードマップ =====
  s = k.content({ section: "事業性", kicker: "ROADMAP", title: "小さく有償で始め、データで勝つ", sub: "段階ごとに「次へ進む条件」を決め、満たしてから投資を増やす" });
  const ph = [
    ["PHASE 1", "0〜6ヶ月", "立ち上げ", ["中野＋コンサルタント2名", "M&A情報REINS＋AIの初版", "ツール10社・派遣10社", "M&A支援機関登録・法務整理"], "継続意向 70%以上"],
    ["PHASE 2", "6〜18ヶ月", "拡大", ["コンサルタント5名", "ツール50社・派遣40社", "成約8件", "提携金融機関3〜5行"], "成約8件"],
    ["PHASE 3", "18〜36ヶ月", "データで勝つ", ["コンサルタント10名", "ツール200社・派遣100社", "成約データでAI価格算定", "仲介・FA向けの打診サービス"], "成約25件"],
  ];
  for (let i = 0; i < 3; i++) {
    const x = M + i * 4.03, dk = i === 2;
    if (dk) s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 2.3, w: 3.77, h: 4.3, rectRadius: 0.06, fill: { color: C.text1 }, line: { color: C.text1 }, objectName: "phase 3" });
    else k.card(s, x, 2.3, 3.77, 4.3, { name: "phase " + (i + 1) });
    k.pill(s, x + 0.3, 2.55, 1.15, ph[i][0]);
    T(s, ph[i][1], { x: x + 1.6, y: 2.55, w: 1.9, h: 0.3, fontSize: 11, bold: true, color: dk ? C.accent4 : C.accent2, valign: "middle" });
    T(s, ph[i][2], { x: x + 0.3, y: 3.05, w: 3.2, h: 0.5, fontSize: 19, bold: true, color: dk ? C.background1 : C.text1 });
    T(s, ph[i][3].map((t, j, a) => ({ text: t, options: { bullet: { indent: 12 }, paraSpaceAfter: 6, breakLine: j < a.length - 1 } })), { x: x + 0.3, y: 3.65, w: 3.2, h: 1.95, fontSize: 12, color: dk ? C.background1 : C.text1 });
    s.addShape(pres.shapes.LINE, { x: x + 0.3, y: 5.7, w: 3.17, h: 0, line: { color: dk ? "4E443C" : H.accent3, width: 0.75 } });
    T(s, [{ text: "次へ進む条件　", options: { bold: true, color: C.accent1 } }, { text: ph[i][4], options: { bold: true, color: dk ? C.background1 : C.text1 } }], { x: x + 0.3, y: 5.8, w: 3.2, h: 0.6, fontSize: 11.5, valign: "middle" });
  }
  s.addNotes("最初の半年は、中野と2名で10社。ここで継続意向が取れたら拡大する。");

  // ===== 15. 締め =====
  pres.addSection({ title: "まとめ" });
  s = k.dark({ section: "まとめ", kicker: "C L O S I N G", title: "M&Aは、才能ではなく\n手順で勝てる。", body: [
    { text: "その手順を、49戦の勝ちと負けから。", options: { breakLine: true } },
    { text: "AIと一緒に、御社の担当者へ渡します。", options: { bold: true, color: C.accent4, breakLine: true } },
    { text: " ", options: { breakLine: true } },
    { text: "値づけを決める。PMIの人を決める。売る時期を決める。", options: { breakLine: true } },
    { text: "この3つを買う前に紙に書けば、負けても致命傷にはなりません。" },
  ], name: "中野 邦人 ／ 株式会社WineBank" });
  s.addNotes("講演の締めと同じメッセージで終える。手順は再現できる、だから教えられる。");

  await k.write(OUT);
  console.log("done");
})();
