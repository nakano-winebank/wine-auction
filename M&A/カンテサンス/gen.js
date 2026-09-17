const pptxgen = require("pptxgenjs");
const p = new pptxgen();
p.layout = "LAYOUT_WIDE";            // 13.33 x 7.5
p.title = "カンテサンス 株式譲渡価格50億円の妥当性検証";
p.author = "株式会社WineBank";

/* ---------------- palette ---------------- */
const DARK="2B1520", BERRY="6D2E46", ROSE="A26769", GOLD="B58B2A",
      INK="1F1A1C", MUTE="6E6368", TINT="F7F3F4", LINE="E4DADD", W="FFFFFF",
      GRN="2E6F4E", AMB="A8741A", RED="9B2C2C";
const SERIF="Cambria", SANS="Calibri";
const SW=13.33, M=0.62;

/* ---------------- helpers ---------------- */
let pageNo = 0;
function header(s, kicker, title, lead){
  s.addText(kicker, {x:M, y:0.34, w:10, h:0.26, isTextBox:true, margin:0,
    fontFace:SANS, fontSize:11, bold:true, color:GOLD, charSpacing:1.4});
  s.addText(title, {x:M, y:0.62, w:SW-2*M, h:0.52, isTextBox:true, margin:0,
    fontFace:SERIF, fontSize:29, bold:true, color:INK});
  if(lead) s.addText(lead, {x:M, y:1.19, w:SW-2*M, h:0.36, isTextBox:true, margin:0,
    fontFace:SANS, fontSize:12.5, color:MUTE, lineSpacing:17});
}
function footer(s, dark){
  pageNo++;
  const c = dark ? "8A7278" : MUTE;
  s.addText("カンテサンス（株式会社プティ・ボノム）株式譲渡価格50億円の妥当性検証 ／ 銀行ご提出用",
    {x:M, y:7.02, w:9.5, h:0.25, isTextBox:true, margin:0, fontFace:SANS, fontSize:8, color:c});
  s.addText(String(pageNo), {x:SW-M-0.9, y:7.02, w:0.9, h:0.25, isTextBox:true, margin:0,
    fontFace:SANS, fontSize:9, color:c, align:"right"});
}
function badge(s, x, y, txt, bg){
  s.addShape(p.ShapeType.ellipse, {x, y, w:0.30, h:0.30, fill:{color:bg||BERRY}});
  s.addText(txt, {x, y, w:0.30, h:0.30, isTextBox:true, margin:0, align:"center", valign:"middle",
    fontFace:SANS, fontSize:11.5, bold:true, color:W});
}
function card(s, x, y, w, h, fill){
  s.addShape(p.ShapeType.roundRect, {x, y, w, h, rectRadius:0.05,
    fill:{color:fill||TINT}, line:{color:LINE, width:0.75}});
}
const tOpt = (extra={}) => Object.assign({
  fontFace:SANS, fontSize:11, color:INK, border:{type:"solid", pt:0.5, color:LINE},
  valign:"middle", autoPage:false
}, extra);
const hd = t => ({text:t, options:{bold:true, color:W, fill:{color:BERRY}, fontSize:10.5}});
const num = (t,o={}) => ({text:t, options:Object.assign({align:"right"}, o)});

/* ---------------- shared figures (百万円) ---------------- */
const NI=350, OP=528, EBITDA=529, CASH=1743, LOAN=500, LIAB=141, NA=2315, SALES=1015;
const NONOP = CASH+LOAN;              // 2,243
const oku = v => (v/100);
const f2 = v => oku(v).toFixed(2);
const f1 = v => oku(v).toFixed(1);

/* =========================================================
   S1  表紙
========================================================= */
{
const s = p.addSlide(); s.background = {color:DARK};
s.addShape(p.ShapeType.ellipse,{x:9.5,y:-1.5,w:6.2,h:6.2,fill:{color:BERRY},transparency:62});
s.addText("銀行ご提出用資料", {x:M, y:1.05, w:8, h:0.3, isTextBox:true, margin:0,
  fontFace:SANS, fontSize:12, bold:true, color:GOLD, charSpacing:2});
s.addText("株式譲渡価格 50億円の\n妥当性検証", {x:M, y:1.52, w:8.6, h:1.8, isTextBox:true, margin:0,
  fontFace:SERIF, fontSize:42, bold:true, color:W, lineSpacing:52});
s.addText("株式会社プティ・ボノム（Quintessence／東京・御殿山）\n19年連続ミシュラン三つ星・20年連続増収増益・無借金",
  {x:M, y:3.45, w:8.6, h:0.8, isTextBox:true, margin:0, fontFace:SANS, fontSize:14, color:"D9CBCF", lineSpacing:24});

const st=[["EV/EBITDA","5.2倍","提示50億円ベース"],["営業利益率","52.0%","2026/12期 想定"],["ネットキャッシュ","22.4億円","価格の45%"]];
st.forEach((v,i)=>{
  const x = M + i*3.05;
  s.addShape(p.ShapeType.roundRect,{x, y:4.5, w:2.8, h:1.2, rectRadius:0.05, fill:{color:"3B1E2B"}, line:{color:"5A3240", width:0.75}});
  s.addText(v[0], {x:x+0.2, y:4.62, w:2.4, h:0.25, isTextBox:true, margin:0, fontFace:SANS, fontSize:9.5, color:GOLD, bold:true});
  s.addText(v[1], {x:x+0.2, y:4.86, w:2.4, h:0.5, isTextBox:true, margin:0, fontFace:SERIF, fontSize:25, bold:true, color:W});
  s.addText(v[2], {x:x+0.2, y:5.36, w:2.4, h:0.25, isTextBox:true, margin:0, fontFace:SANS, fontSize:9, color:"AC969C"});
});
s.addText("本資料は、対象会社の事業価値と提示価格の妥当性を検証したものです。p.18には、当社によるグランメゾン承継の実績を参考として掲載しています。\n2026年9月17日　株式会社WineBank",
  {x:M, y:6.15, w:9.5, h:0.7, isTextBox:true, margin:0, fontFace:SANS, fontSize:10, color:"9C858B", lineSpacing:16});
footer(s, true);
}

/* =========================================================
   S2  エグゼクティブサマリー
========================================================= */
{
const s = p.addSlide();
header(s, "EXECUTIVE SUMMARY", "結論：50億円は妥当。理論上限は約57億円");
s.addShape(p.ShapeType.roundRect,{x:M, y:1.26, w:SW-2*M, h:0.86, rectRadius:0.04, fill:{color:BERRY}});
s.addText("2026年12月期末の想定財務を前提とすれば、株式譲渡価格50億円は4つの評価手法すべてで説明可能な水準にある。\n許容上限は55億円、理論上限は57.4億円。60億円は現在の収益力では説明できない。",
  {x:M+0.28, y:1.34, w:SW-2*M-0.56, h:0.7, isTextBox:true, margin:0, fontFace:SANS, fontSize:12.5, color:W, lineSpacing:20, valign:"middle"});

const items=[
 ["①","価格の45%はキャッシュ","50億円のうち22.4億円（現預金17.4億＋役員貸付5.0億）は非事業用資産。買主が事業リスクを負うのは残る事業価値27.6億円のみ。"],
 ["②","EV/EBITDA 5.2倍","中小M&A実務における小売飲食業のEBITDA倍率目安（約6倍）を下回る。営業利益率52%・無借金・20年連続増収増益の企業としては割安な部類。"],
 ["③","年買法では営業利益5.1年分","純資産23.15億＋営業利益5.09年分。実務慣行の「純資産＋営業利益3〜6年」のレンジに位置する。"],
 ["④","DCF期待値 50.7億円","三つ星維持50%／二つ星降格35%／星喪失15%の加重期待値が50.7億円。提示価格50億円とほぼ一致する。"]
];
items.forEach((it,i)=>{
  const x = M + (i%2)*(SW-2*M)/2 + (i%2? 0.16:0);
  const y = 2.32 + Math.floor(i/2)*1.55;
  const w = (SW-2*M)/2 - 0.16;
  card(s, x, y, w, 1.38);
  badge(s, x+0.22, y+0.2, it[0]);
  s.addText(it[1], {x:x+0.62, y:y+0.2, w:w-0.85, h:0.3, isTextBox:true, margin:0,
    fontFace:SERIF, fontSize:14.5, bold:true, color:BERRY});
  s.addText(it[2], {x:x+0.22, y:y+0.58, w:w-0.44, h:0.72, isTextBox:true, margin:0,
    fontFace:SANS, fontSize:11, color:INK, lineSpacing:16});
});
s.addText([{text:"資金調達：",options:{bold:true,color:INK}},
 {text:"LBOローン20億円は、タームローンA 14億円（元金均等）＋タームローンB 6億円（期限一括）の設計で初年度DSCR 1.35を確保できる。7年間の累積余剰キャッシュフロー7.56億円が期限一括分6.00億円を上回るため、リファイナンスなしで完済が可能（p.15・p.16）。",options:{}}],
 {x:M, y:5.52, w:SW-2*M, h:0.5, isTextBox:true, margin:0, fontFace:SANS, fontSize:10.5, color:MUTE, lineSpacing:16});
footer(s);
}

/* =========================================================
   S3  検証の枠組み
========================================================= */
{
const s = p.addSlide();
header(s, "APPROACH", "4つの評価手法と2つのクロスチェックで判断する",
  "年買法だけでは「高い」、マルチプルだけでは「安い」という逆の結論が出る。両者が割れる理由そのものが、この案件の性質を説明している。");
const blocks=[
 ["検証①","マルチプル法","EV/EBITDA・EV/営業利益。セクター水準との比較","p.9"],
 ["検証②","年買法","純資産＋営業利益n年。中小M&A実務の慣行","p.10"],
 ["検証③","DCF（確率分解）","3シナリオ×3割引率。本資料の中心的手法","p.11"],
 ["検証④","類似取引事例","国内高級レストランの譲渡事例との比較","p.12"],
 ["CHECK A","ブレークイーブン分析","利益が何%落ちるまで50億円が正当化されるか","p.14"],
 ["CHECK B","20億円LBOの返済可能性","返済プロファイル・ストレス耐性・保全","p.15-16"]
];
blocks.forEach((b,i)=>{
  const x = M + (i%3)*4.08;
  const y = 2.0 + Math.floor(i/3)*2.05;
  const isChk = i>=4;
  card(s, x, y, 3.85, 1.85, isChk? "FFFFFF":TINT);
  s.addText(b[0], {x:x+0.24, y:y+0.22, w:2.4, h:0.26, isTextBox:true, margin:0,
    fontFace:SANS, fontSize:10, bold:true, color:isChk?GOLD:ROSE, charSpacing:1});
  s.addText(b[1], {x:x+0.24, y:y+0.52, w:3.4, h:0.36, isTextBox:true, margin:0,
    fontFace:SERIF, fontSize:16, bold:true, color:INK});
  s.addText(b[2], {x:x+0.24, y:y+0.96, w:3.4, h:0.6, isTextBox:true, margin:0,
    fontFace:SANS, fontSize:10.5, color:MUTE, lineSpacing:15});
  s.addText(b[3], {x:x+3.0, y:y+1.44, w:0.6, h:0.24, isTextBox:true, margin:0,
    fontFace:SANS, fontSize:9, color:ROSE, align:"right"});
});
s.addText("すべての検証は 2026年12月期（IM記載の会社計画）ベース。2025年12月期実績ベースの数値とは異なる。\n参考　p.18　グランメゾンのM&A後バリューアップ実績（株式会社アピシウス／2024年6月取得）",
  {x:M, y:6.30, w:SW-2*M, h:0.5, isTextBox:true, margin:0, fontFace:SANS, fontSize:10, color:MUTE, lineSpacing:15});
footer(s);
}

/* =========================================================
   S4  対象会社概要
========================================================= */
{
const s = p.addSlide();
header(s, "TARGET", "対象会社の概要と、営業利益率52%の構造");
const rows=[
 [{text:"商号",options:{bold:true}},"株式会社プティ・ボノム"],
 [{text:"店舗",options:{bold:true}},"Quintessence（東京都品川区北品川・ガーデンシティ品川御殿山1F／賃借）"],
 [{text:"開業／星",options:{bold:true}},"2006年開業。2008年以降 19年連続ミシュラン三つ星"],
 [{text:"株主",options:{bold:true}},"岸田周三氏 100%（今回100%譲渡）"],
 [{text:"子会社",options:{bold:true}},"カンテサンスプラス 100%（高級スイーツEC）／株式会社BISは対象外"],
 [{text:"規模",options:{bold:true}},"54席・営業日数252日・年間来店 約1.4万人・従業員22名"],
 [{text:"有利子負債",options:{bold:true}},"なし（無借金）"]
];
s.addTable(rows.map(r=>[{text:r[0].text,options:{bold:true,fill:{color:TINT},fontSize:10.5}},{text:r[1],options:{fontSize:10.5}}]),
  tOpt({x:M, y:1.42, w:6.55, colW:[1.45,5.10], rowH:0.42}));

card(s, 7.42, 1.42, 5.29, 1.36);
s.addText("客単価の分解（2026年想定）", {x:7.66, y:1.56, w:4.8, h:0.26, isTextBox:true, margin:0,
  fontFace:SANS, fontSize:10, bold:true, color:GOLD});
s.addText([{text:"7.2",options:{fontSize:26,bold:true,color:BERRY,fontFace:SERIF}},
 {text:"万円／人",options:{fontSize:11,color:INK}},
 {text:"   ＝ フード 4.6万円 ＋ ドリンク 2.5万円\n（ドリンク原価 0.9万円／粗利率 64.5%、ドリンク年商 約3.6億円）",options:{fontSize:10.5,color:MUTE}}],
 {x:7.66, y:1.86, w:4.85, h:0.8, isTextBox:true, margin:0, lineSpacing:16});

const drv=[
 ["高単価","三つ星ブランドに支えられた客単価7.2万円＋サービス料10%"],
 ["高稼働","54席×1.6回転×252日。予約は常時充足"],
 ["低原価","卸を使わずサントリー・ファインズ等から直接仕入。中間マージンなし"],
 ["低販管費","1店舗・賃借（賃料は売上比1.97%）・設備投資ほぼゼロ・広告費なし"]
];
s.addText("営業利益率52%を成立させている4要因", {x:7.42, y:2.96, w:5.3, h:0.28, isTextBox:true, margin:0,
  fontFace:SERIF, fontSize:14, bold:true, color:INK});
drv.forEach((d,i)=>{
  const y = 3.34 + i*0.78;
  badge(s, 7.42, y+0.04, String(i+1), ROSE);
  s.addText(d[0], {x:7.82, y:y, w:1.2, h:0.26, isTextBox:true, margin:0, fontFace:SANS, fontSize:11, bold:true, color:BERRY});
  s.addText(d[1], {x:7.82, y:y+0.26, w:4.9, h:0.44, isTextBox:true, margin:0, fontFace:SANS, fontSize:10, color:MUTE, lineSpacing:14});
});
s.addText("有形固定資産は建物附属設備29.7万円＋工具器具備品116.6万円＝計146万円。物的担保余力は事実上ワイン在庫（簿価1.19億円）のみ。",
  {x:M, y:4.62, w:6.55, h:0.6, isTextBox:true, margin:0, fontFace:SANS, fontSize:10, color:MUTE, lineSpacing:15});
footer(s);
}

/* =========================================================
   S5  業績推移
========================================================= */
{
const s = p.addSlide();
header(s, "TRACK RECORD", "20年連続増収増益。利益率は5年間で44%→52%へ上昇",
  "コロナ期（2021年12月期）を含む過去5年間、一度も減収・減益がない。利益率は毎期改善しており、収益の再現性は極めて高い。");
const cats=["2021/12","2022/12","2023/12","2024/12","2025/12","2026/12計画"];
s.addChart(p.ChartType.bar, [
  {name:"売上高", labels:cats, values:[700,770,832,891,976,1015]},
  {name:"営業利益", labels:cats, values:[310,350,393,442,505,528]}
], {x:M, y:2.05, w:8.2, h:3.7, barDir:"col", barGapWidthPct:60,
   chartColors:[ROSE, BERRY], showLegend:true, legendPos:"t", legendFontSize:10, legendColor:INK,
   showValue:true, dataLabelPosition:"outEnd", dataLabelFontSize:8.5, dataLabelColor:INK,
   catAxisLabelColor:MUTE, catAxisLabelFontSize:9.5, valAxisLabelColor:MUTE, valAxisLabelFontSize:9,
   valGridLine:{color:LINE, size:0.5}, catGridLine:{style:"none"}, valAxisTitle:"百万円",
   showValAxisTitle:true, valAxisTitleFontSize:9, valAxisTitleColor:MUTE, valAxisMaxVal:1200});

card(s, 9.05, 2.05, 3.66, 3.7);
s.addText("営業利益率の推移", {x:9.28, y:2.2, w:3.2, h:0.26, isTextBox:true, margin:0,
  fontFace:SANS, fontSize:10, bold:true, color:GOLD});
const mg=[["2021/12","44.3%"],["2022/12","45.5%"],["2023/12","47.2%"],["2024/12","49.6%"],["2025/12","51.7%"],["2026/12","52.0%"]];
mg.forEach((m,i)=>{
  const y = 2.56 + i*0.42;
  s.addText(m[0], {x:9.28, y:y, w:1.5, h:0.3, isTextBox:true, margin:0, fontFace:SANS, fontSize:11, color:MUTE, valign:"middle"});
  s.addText(m[1], {x:10.6, y:y, w:1.0, h:0.3, isTextBox:true, margin:0, fontFace:SANS, fontSize:12, bold:true, color:i===5?BERRY:INK, align:"right", valign:"middle"});
  s.addShape(p.ShapeType.rect,{x:11.75, y:y+0.1, w:0.88*(parseFloat(m[1])/52), h:0.11, fill:{color:i===5?BERRY:ROSE}});
});
s.addText("CAGR（2021→2026）\n売上 +7.7%　営業利益 +11.2%", {x:9.28, y:5.14, w:3.35, h:0.5, isTextBox:true, margin:0,
  fontFace:SANS, fontSize:10, color:INK, lineSpacing:15});
s.addText("出所：IM記載の決算数値（2021/12期〜2025/12期実績）および2026/12期会社計画（IM p.40）。",
  {x:M, y:6.0, w:SW-2*M, h:0.3, isTextBox:true, margin:0, fontFace:SANS, fontSize:9.5, color:MUTE});
footer(s);
}

/* =========================================================
   S6  想定PL
========================================================= */
{
const s = p.addSlide();
header(s, "2026/12期 想定損益", "評価の基礎となる損益：EBITDA 5.29億円、FCF 3.50億円",
  "減価償却1百万円・設備投資ゼロ・運転資本の増減も軽微なため、当期純利益がほぼそのままフリーキャッシュフローになる。");
const rows=[
 [hd("損益計算書（百万円）"), hd("2025/12 実績"), hd("2026/12 計画"), hd("増減")],
 ["売上高", num("976"), num("1,015"), num("+39")],
 ["営業利益", num("505"), num("528"), num("+23")],
 [{text:"　営業利益率",options:{color:MUTE}}, num("51.7%",{color:MUTE}), num("52.0%",{color:MUTE}), num("+0.3pt",{color:MUTE})],
 ["営業外収益", num("6"), num("6"), num("±0")],
 ["税引前当期純利益", num("511"), num("534"), num("+23")],
 ["法人税等（実効税率34.4%）", num("176"), num("184"), num("+8")],
 [{text:"当期純利益",options:{bold:true}}, num("335",{bold:true}), num("350",{bold:true}), num("+15",{bold:true})],
 ["減価償却費", num("1"), num("1"), num("±0")],
 [{text:"EBITDA",options:{bold:true,fill:{color:TINT}}}, num("506",{bold:true,fill:{color:TINT}}), num("529",{bold:true,fill:{color:TINT}}), num("+23",{bold:true,fill:{color:TINT}})],
 ["設備投資", num("0"), num("0"), num("±0")],
 [{text:"フリーキャッシュフロー",options:{bold:true,fill:{color:TINT}}}, num("336",{bold:true,fill:{color:TINT}}), num("350",{bold:true,fill:{color:TINT}}), num("+14",{bold:true,fill:{color:TINT}})]
];
s.addTable(rows, tOpt({x:M, y:1.95, w:7.9, colW:[3.4,1.5,1.5,1.5], rowH:0.34, fontSize:10.5}));

card(s, 8.72, 1.95, 3.99, 2.05);
s.addText("評価上の重要な確認点", {x:8.96, y:2.10, w:3.5, h:0.26, isTextBox:true, margin:0,
  fontFace:SANS, fontSize:10, bold:true, color:GOLD});
s.addText("役員賞与（売上比9.77%＝約95百万円）は販管費に計上済み。したがって営業利益528百万円は役員報酬・賞与を控除した後の数値であり、評価にあたって二重に控除する必要はない。",
  {x:8.96, y:2.40, w:3.5, h:1.4, isTextBox:true, margin:0, fontFace:SANS, fontSize:10.5, color:INK, lineSpacing:16});

card(s, 8.72, 4.18, 3.99, 1.65, "FFFFFF");
s.addText("FCF ＝ 当期純利益", {x:8.96, y:4.32, w:3.5, h:0.26, isTextBox:true, margin:0,
  fontFace:SANS, fontSize:10, bold:true, color:GOLD});
s.addText([{text:"3.50",options:{fontFace:SERIF,fontSize:30,bold:true,color:BERRY}},{text:" 億円",options:{fontSize:12,color:INK}}],
  {x:8.96, y:4.60, w:3.5, h:0.5, isTextBox:true, margin:0});
s.addText("設備投資がほぼ発生しない業態のため、利益がそのまま返済原資・株主還元原資になる。",
  {x:8.96, y:5.12, w:3.5, h:0.6, isTextBox:true, margin:0, fontFace:SANS, fontSize:10, color:MUTE, lineSpacing:14});
s.addText("出所：2025/12期はIM記載の実績、2026/12期はIM p.40の会社計画。実効税率は2025年実績（34.4%）を適用。",
  {x:M, y:6.15, w:SW-2*M, h:0.3, isTextBox:true, margin:0, fontFace:SANS, fontSize:9.5, color:MUTE});
footer(s);
}

/* =========================================================
   S7  想定BS
========================================================= */
{
const s = p.addSlide();
header(s, "2026/12期末 想定貸借対照表", "純資産23.15億円、ネットキャッシュ22.43億円",
  "20年間無配で利益を内部留保してきたため、2025/12期末純資産19.65億円に2026年の当期純利益3.50億円が積み上がる。");
const rows=[
 [hd("資産（百万円）"), hd("2025実績"), hd("2026想定"), hd("負債・純資産（百万円）"), hd("2025実績"), hd("2026想定")],
 ["現預金", num("1,398"), num("1,743"), "仕入債務・未払費用", num("27"), num("27")],
 ["商品（ワイン在庫）", num("119"), num("119"), "未払法人税等・未払消費税", num("114"), num("114")],
 ["長期貸付金（役員）", num("500"), num("500"), {text:"有利子負債",options:{bold:true}}, num("0",{bold:true}), num("0",{bold:true})],
 ["その他資産", num("89"), num("94"), {text:"負債合計",options:{bold:true,fill:{color:TINT}}}, num("141",{bold:true,fill:{color:TINT}}), num("141",{bold:true,fill:{color:TINT}})],
 ["", num(""), num(""), {text:"純資産合計",options:{bold:true,fill:{color:TINT}}}, num("1,965",{bold:true,fill:{color:TINT}}), num("2,315",{bold:true,fill:{color:TINT}})],
 [{text:"資産合計",options:{bold:true,fill:{color:TINT}}}, num("2,106",{bold:true,fill:{color:TINT}}), num("2,456",{bold:true,fill:{color:TINT}}), {text:"負債・純資産合計",options:{bold:true,fill:{color:TINT}}}, num("2,106",{bold:true,fill:{color:TINT}}), num("2,456",{bold:true,fill:{color:TINT}})]
];
s.addTable(rows, tOpt({x:M, y:2.0, w:12.09, colW:[2.35,1.2,1.2,3.14,1.2,1.2], rowH:0.40, fontSize:10.5}));

const box=[["現預金","17.43億円"],["＋ 長期貸付金（役員）","5.00億円"],["＝ ネットキャッシュ","22.43億円"]];
card(s, M, 5.02, 5.4, 1.3);
box.forEach((b,i)=>{
  const y=5.14+i*0.36;
  s.addText(b[0], {x:M+0.24, y:y, w:3.2, h:0.3, isTextBox:true, margin:0, fontFace:SANS,
    fontSize:i===2?12:11, bold:i===2, color:i===2?BERRY:INK, valign:"middle"});
  s.addText(b[1], {x:M+3.4, y:y, w:1.75, h:0.3, isTextBox:true, margin:0, fontFace:SANS,
    fontSize:i===2?13:11, bold:i===2, color:i===2?BERRY:INK, align:"right", valign:"middle"});
});
s.addText("注意：役員貸付金5.00億円は「現金」ではない", {x:6.25, y:5.02, w:6.46, h:0.28, isTextBox:true, margin:0,
  fontFace:SERIF, fontSize:13, bold:true, color:RED});
s.addText("仲介の「ネットキャッシュ約20億円」のうち5.00億円は岸田氏に対する長期貸付金であり、同氏が返済して初めて現金になる。クロージング時の現金精算を条件化しない限り、買主は譲渡後に5億円の債権回収を追うことになる（p.17 論点1）。",
  {x:6.25, y:5.34, w:6.46, h:0.9, isTextBox:true, margin:0, fontFace:SANS, fontSize:10.5, color:INK, lineSpacing:16});
s.addText("出所：2025/12期はIM記載のBS。2026/12期は無配・設備投資ゼロ・負債横ばいを前提に、当期純利益350百万円が全額現預金と純資産に積み上がるものとして推計。",
  {x:M, y:6.45, w:SW-2*M, h:0.3, isTextBox:true, margin:0, fontFace:SANS, fontSize:9.5, color:MUTE});
footer(s);
}

/* =========================================================
   S8  価格の分解（ウォーターフォール）
========================================================= */
{
const s = p.addSlide();
header(s, "PRICE BRIDGE", "50億円のうち、事業に対して払うのは27.6億円",
  "株式価値から非事業用資産を控除して事業価値（EV）を求める。この27.6億円が妥当かどうかが、本件の論点のすべてである。");
const bx=[{l:"株式価値",v:"50.00",h:3.30,y:2.05,c:BERRY},
          {l:"現預金",v:"▲17.43",h:1.15,y:2.05,c:ROSE},
          {l:"役員貸付金",v:"▲5.00",h:0.33,y:3.20,c:ROSE},
          {l:"事業価値（EV）",v:"27.57",h:1.82,y:3.53,c:DARK}];
const base=5.35;
bx.forEach((b,i)=>{
  const x = M + 0.35 + i*1.72;
  const yTop = base - (i===0? b.h : (i===1? b.h+ (5.35-3.20-b.h) : 0));
  // 明示的に座標指定
  const geo = [
    {x, y:base-3.30, h:3.30},
    {x, y:base-3.30, h:1.15},
    {x, y:base-2.15, h:0.33},
    {x, y:base-1.82, h:1.82}
  ][i];
  s.addShape(p.ShapeType.rect, {x:geo.x, y:geo.y, w:1.35, h:geo.h, fill:{color:b.c}});
  s.addText(b.v+" 億円", {x:geo.x-0.15, y:geo.y-0.34, w:1.65, h:0.3, isTextBox:true, margin:0,
    fontFace:SANS, fontSize:12, bold:true, color:i>=2&&i<3?INK:INK, align:"center"});
  s.addText(b.l, {x:geo.x-0.25, y:base+0.08, w:1.85, h:0.3, isTextBox:true, margin:0,
    fontFace:SANS, fontSize:10.5, color:INK, align:"center"});
});
s.addShape(p.ShapeType.line,{x:M+0.35, y:base, w:7.2, h:0, line:{color:LINE, width:1}});

card(s, 8.05, 1.95, 4.66, 4.12);
s.addText("前提の置き方でEVは5.2〜6.5倍に振れる", {x:8.29, y:2.1, w:4.2, h:0.3, isTextBox:true, margin:0,
  fontFace:SERIF, fontSize:13.5, bold:true, color:INK});
const cases=[
 [hd("EVの算定ケース"), hd("EV"), hd("倍率")],
 [{text:"① 仲介前提\n（現預金＋役員貸付を全額控除）",options:{fontSize:9.5}}, num("27.57億",{fontSize:10}), num("5.2倍",{bold:true,fontSize:10})],
 [{text:"② 未払税金等1.41億を負債類似として加算",options:{fontSize:9.5}}, num("28.98億",{fontSize:10}), num("5.5倍",{fontSize:10})],
 [{text:"③ 役員貸付が未精算＋運転資金2.0億を留保",options:{fontSize:9.5}}, num("34.57億",{fontSize:10}), num("6.5倍",{bold:true,color:RED,fontSize:10})]
];
s.addTable(cases, tOpt({x:8.29, y:2.50, w:4.18, colW:[2.18,1.0,1.0], rowH:0.58, fontSize:9.5}));
s.addText("銀行審査で最も効く論点は③。役員貸付金5.0億円の精算方法と、買収後に対象会社へ留保すべき運転資金の水準によって、実質的に払っている倍率は5.2倍から6.5倍まで動く。SPA上の手当てが価格そのものと同じ重みを持つ。",
  {x:8.29, y:4.98, w:4.18, h:1.0, isTextBox:true, margin:0, fontFace:SANS, fontSize:10, color:MUTE, lineSpacing:15});
s.addText("以下、本資料では断りのない限りケース①（EV 27.57億円）を基準とする。",
  {x:M, y:6.32, w:7.3, h:0.3, isTextBox:true, margin:0, fontFace:SANS, fontSize:10, color:MUTE});
footer(s);
}

/* =========================================================
   S9  検証① マルチプル
========================================================= */
{
const s = p.addSlide();
header(s, "検証① マルチプル法", "EV/EBITDA 5.2倍。セクター実務目安の6倍を下回る");
const rows=[
 [hd("株式譲渡価格"), hd("事業価値（EV）"), hd("EV/EBITDA"), hd("EV/営業利益"), hd("単純回収年数（EV÷FCF）"), hd("判定")],
 ["45.00億円", num("22.57億円"), num("4.27倍"), num("4.27倍"), num("6.4年"), {text:"売主が応じない水準",options:{color:MUTE,fontSize:10}}],
 [{text:"50.00億円（提示）",options:{bold:true,fill:{color:TINT}}}, num("27.57億円",{bold:true,fill:{color:TINT}}), num("5.21倍",{bold:true,fill:{color:TINT}}), num("5.22倍",{fill:{color:TINT}}), num("7.9年",{fill:{color:TINT}}), {text:"妥当",options:{bold:true,color:GRN,fill:{color:TINT},fontSize:10}}],
 ["55.00億円", num("32.57億円"), num("6.16倍"), num("6.17倍"), num("9.3年"), {text:"許容上限",options:{color:AMB,fontSize:10}}],
 ["60.00億円", num("37.57億円"), num("7.10倍"), num("7.11倍"), num("10.7年"), {text:"説明困難",options:{color:RED,fontSize:10}}]
];
s.addTable(rows, tOpt({x:M, y:1.72, w:12.09, colW:[2.1,2.1,1.8,1.8,2.49,1.8], rowH:0.44, fontSize:10.5}));

s.addText("比較対象", {x:M, y:4.02, w:5, h:0.3, isTextBox:true, margin:0, fontFace:SERIF, fontSize:14, bold:true, color:INK});
const cmp=[
 ["小売飲食業のEBITDA倍率 実務目安","約6倍","中小M&A実務の業種別目安（2026年7月時点）"],
 ["ひらまつ（東証スタンダード・2764）","経常利益率 約3.0%","FY2027/3会社予想 売上105.9億／経常3.2億。国内で唯一の高級レストラン上場企業"],
 ["カンテサンス","営業利益率 52.0%","上場高級外食の約17倍の収益性。ただし1店舗・属人性のディスカウントは別途必要"]
];
cmp.forEach((c,i)=>{
  const y=4.36+i*0.70;
  s.addShape(p.ShapeType.rect,{x:M, y:y+0.06, w:0.05, h:0.5, fill:{color:i===2?BERRY:ROSE}});
  s.addText(c[0], {x:M+0.2, y:y, w:3.5, h:0.28, isTextBox:true, margin:0, fontFace:SANS, fontSize:11, bold:true, color:INK});
  s.addText(c[1], {x:M+3.75, y:y, w:1.9, h:0.28, isTextBox:true, margin:0, fontFace:SANS, fontSize:11.5, bold:true, color:BERRY});
  s.addText(c[2], {x:M+0.2, y:y+0.28, w:11.3, h:0.4, isTextBox:true, margin:0, fontFace:SANS, fontSize:10, color:MUTE, lineSpacing:14});
});
s.addText("留意：上場外食のマルチプルは多店舗展開による分散を前提としている。1店舗・1名依存のディスカウントは検証③のDCFで織り込む。個社マルチプルは正式提出前に直近株価ベースへ差替えを推奨。",
  {x:M, y:6.50, w:SW-2*M, h:0.36, isTextBox:true, margin:0, fontFace:SANS, fontSize:9.5, color:MUTE, lineSpacing:14});
footer(s);
}

/* =========================================================
   S10 検証② 年買法
========================================================= */
{
const s = p.addSlide();
header(s, "検証② 年買法（純資産＋営業利益n年）", "営業利益5.09年分。実務慣行レンジ（3〜6年）の範囲内",
  "中小企業M&Aで最も広く使われる簡便法。実務慣行の3〜6年のレンジの中で、50億円は営業利益5.09年分にあたる。");
const rows=[
 [hd("算式"), hd("金額"), hd("提示50億円との差"), hd("位置づけ")],
 ["純資産 ＋ 営業利益 × 3年", num("38.99億円"), num("▲11.01億円",{color:RED}), "実務レンジの下限"],
 ["純資産 ＋ 営業利益 × 4年", num("44.27億円"), num("▲5.73億円",{color:RED}), "実務レンジの中位"],
 [{text:"純資産 ＋ 営業利益 × 5年",options:{bold:true,fill:{color:TINT}}}, num("49.55億円",{bold:true,fill:{color:TINT}}), num("▲0.45億円",{bold:true,fill:{color:TINT}}), {text:"実務レンジの上限側＝提示価格とほぼ一致",options:{bold:true,fill:{color:TINT},fontSize:10}}],
 ["純資産 ＋ 営業利益 × 6年", num("54.83億円"), num("+4.83億円",{color:GRN}), "実務レンジの上限"]
];
s.addTable(rows, tOpt({x:M, y:2.0, w:8.3, colW:[2.9,1.6,1.9,1.9], rowH:0.44, fontSize:10.5}));

card(s, M, 4.22, 8.3, 0.95, "FFFFFF");
s.addText([{text:"50.00億円 ＝ 純資産 23.15億円 ＋ 営業利益 ",options:{fontSize:13,color:INK}},
 {text:"5.09年分",options:{fontSize:17,bold:true,color:BERRY,fontFace:SERIF}},
 {text:"（EBITDAベースでは 5.08年分）",options:{fontSize:11,color:MUTE}}],
 {x:M+0.28, y:4.42, w:7.8, h:0.55, isTextBox:true, margin:0, lineSpacing:20});

card(s, 9.1, 2.0, 3.61, 3.17);
s.addText("この手法が本件を過小評価する理由", {x:9.34, y:2.15, w:3.2, h:0.3, isTextBox:true, margin:0,
  fontFace:SANS, fontSize:10, bold:true, color:GOLD});
const why=[
 "純資産23.15億円のうち22.43億円はキャッシュ。つまり年買法は「キャッシュ＋営業利益n年」を足しているだけで、事業そのものを評価していない",
 "設備投資が不要で減価償却もほぼゼロという資本効率の高さが、純資産にも営業利益n年にも反映されない",
 "20年連続増収増益という利益の再現性（＝割引率の低下要因）を織り込む余地がない"
];
why.forEach((t,i)=>{
  const y=2.5+i*0.9;
  badge(s, 9.34, y, String(i+1), ROSE);
  s.addText(t, {x:9.74, y:y-0.03, w:2.78, h:0.85, isTextBox:true, margin:0, fontFace:SANS, fontSize:9.5, color:INK, lineSpacing:13.5});
});
s.addText("結論：年買法単独では50億円は「実務レンジの上限側」。この手法だけを根拠に高い／安いは判断せず、検証③のDCFで事業価値の妥当性を確認する。",
  {x:M, y:5.45, w:12.09, h:0.4, isTextBox:true, margin:0, fontFace:SANS, fontSize:11, color:INK, lineSpacing:16});
footer(s);
}

/* =========================================================
   S11 検証③ DCF
========================================================= */
{
const s = p.addSlide();
header(s, "検証③ DCF（シナリオ分解）", "三つ星維持なら35.0億円、二つ星降格なら23.7億円",
  "岸田氏在任の1〜3年目はFCF 3.50億円で固定し、ロックアップ明けの4年目以降をシナリオ分岐させる。継続成長率0%、割引率10%を基準とする。");
const cats=["割引率 8%","割引率 10%","割引率 12%"];
s.addChart(p.ChartType.bar, [
  {name:"A 三つ星維持（FCF 3.50億）", labels:cats, values:[43.75,35.00,29.17]},
  {name:"B 二つ星降格（FCF 2.00億）", labels:cats, values:[28.87,23.73,20.27]},
  {name:"C 星喪失（FCF 1.00億）", labels:cats, values:[18.94,16.22,14.34]}
], {x:M, y:2.22, w:7.5, h:3.45, barDir:"col", barGapWidthPct:45,
   chartColors:[BERRY, ROSE, "C9B7BC"], showLegend:true, legendPos:"t", legendFontSize:9.5, legendColor:INK,
   showValue:true, dataLabelPosition:"outEnd", dataLabelFontSize:8.5, dataLabelColor:INK, dataLabelFormatCode:"0.0",
   catAxisLabelColor:MUTE, catAxisLabelFontSize:10, valAxisLabelColor:MUTE, valAxisLabelFontSize:9,
   valGridLine:{color:LINE, size:0.5}, catGridLine:{style:"none"}, valAxisTitle:"事業価値（億円）",
   showValAxisTitle:true, valAxisTitleFontSize:9, valAxisTitleColor:MUTE, valAxisMaxVal:50});


card(s, 8.32, 2.22, 4.39, 3.45);
s.addText("前提", {x:8.56, y:2.36, w:3.9, h:0.26, isTextBox:true, margin:0, fontFace:SANS, fontSize:10, bold:true, color:GOLD});
const asm=[
 ["FCF","当期純利益350百万円＝FCF（減価償却1・設備投資0・運転資本増減ゼロ）"],
 ["1〜3年目","3シナリオ共通で3.50億円。岸田氏が毎日厨房に立つ前提（売主回答）"],
 ["4年目以降","A：3.50億円据置／B：二つ星降格により売上▲32%・利益率52%→29%で2.00億円／C：星喪失で1.00億円"],
 ["割引率","10%を基準（リスクフリー1.5%＋株式リスクプレミアム6%×β1.1＋規模・属人性プレミアム2%）"],
 ["継続成長率","0%（54席固定・値上げ以外の成長ドライバーなし）"]
];
asm.forEach((a,i)=>{
  const y=2.66+i*0.60;
  s.addText(a[0], {x:8.56, y:y, w:1.0, h:0.24, isTextBox:true, margin:0, fontFace:SANS, fontSize:9.5, bold:true, color:BERRY});
  s.addText(a[1], {x:9.5, y:y-0.02, w:2.98, h:0.6, isTextBox:true, margin:0, fontFace:SANS, fontSize:8.8, color:INK, lineSpacing:12.5});
});
s.addText("提示価格50億円が織り込む事業価値27.57億円は、シナリオA（35.0億円）とB（23.7億円）の間にあり、Bに近い。つまり50億円という価格は、既に「星が落ちる可能性」を相当程度織り込んだ水準である。次ページでこれを確率に換算する。",
  {x:M, y:5.82, w:12.09, h:0.6, isTextBox:true, margin:0, fontFace:SANS, fontSize:11, color:INK, lineSpacing:16});
footer(s);
}

/* =========================================================
   S12 検証④ 類似事例
========================================================= */
{
const s = p.addSlide();
header(s, "検証④ 類似取引事例", "直接比較できる事例は存在しない。倍率では負けていない",
  "国内のミシュラン三つ星は約20店。うち法人形態で営業利益5億円規模の店舗の譲渡事例は確認できない。");
const rows=[
 [hd("事例"), hd("営業利益"), hd("株式価値"), hd("倍率"), hd("本件との比較可能性")],
 ["京都・二つ星レストラン（非公開）", num("約20百万円"), num("1.5億円"), num("約7.5倍※"), {text:"倍率は近いが規模が1/25。参考に留まる",options:{fontSize:10}}],
 ["アピシウス（東京・高級フレンチ）", num("約1.5億円弱"), num("―"), num("―"), {text:"国内高級フレンチの利益水準の目線",options:{fontSize:10}}],
 ["ロオジエ（東京・三つ星）", num("2〜3億円程度"), num("―"), num("―"), {text:"国内高級フレンチの事実上の利益上限",options:{fontSize:10}}],
 [{text:"カンテサンス（本件）",options:{bold:true,fill:{color:TINT}}}, num("5.28億円",{bold:true,fill:{color:TINT}}), num("50.00億円",{bold:true,fill:{color:TINT}}), num("5.2倍",{bold:true,fill:{color:TINT}}), {text:"国内高級レストランで突出した収益規模",options:{bold:true,fill:{color:TINT},fontSize:10}}]
];
s.addTable(rows, tOpt({x:M, y:2.0, w:12.09, colW:[3.3,1.8,1.8,1.5,3.69], rowH:0.46, fontSize:10.5}));
s.addText("※ EV/営業利益ベース。非公開案件につきヒアリング情報に基づく概算であり、検証可能な一次情報ではない。",
  {x:M, y:4.42, w:12.09, h:0.26, isTextBox:true, margin:0, fontFace:SANS, fontSize:9.5, color:MUTE});

const fnd=[
 ["倍率では割高ではない","比較可能な数少ない事例と比べても、EV/営業利益5.2倍は同等かそれ以下。「高すぎる」という主張は、倍率を根拠にはできない。", GRN],
 ["ただし絶対額の裏付けはない","1店舗・1名に対して事業価値27.6億円という集中度を、国内の取引事例で裏付けることはできない。事例が存在しないためである。", AMB],
 ["したがってDCFで判断する","事例が使えない以上、価格の妥当性は将来キャッシュフローとその実現確率で判断するほかない（次ページ）。", BERRY]
];
fnd.forEach((f,i)=>{
  const x = M + i*4.08;
  card(s, x, 4.85, 3.85, 1.55, i===2?"FFFFFF":TINT);
  s.addShape(p.ShapeType.ellipse,{x:x+0.24, y:5.0, w:0.22, h:0.22, fill:{color:f[2]}});
  s.addText(f[0], {x:x+0.56, y:4.96, w:3.1, h:0.3, isTextBox:true, margin:0, fontFace:SANS, fontSize:11.5, bold:true, color:f[2]});
  s.addText(f[1], {x:x+0.24, y:5.32, w:3.4, h:0.95, isTextBox:true, margin:0, fontFace:SANS, fontSize:10, color:INK, lineSpacing:14.5});
});
footer(s);
}

/* =========================================================
   S13 統合判定（核心）
========================================================= */
{
const s = p.addSlide();
header(s, "統合判定", "価格が織り込む「三つ星維持確率」。50億円は34%で成立する",
  "シナリオA（35.0億円）とB（23.7億円）の間で価格を按分し、その価格が成立するために必要な三つ星維持確率を逆算した。");
const rows=[
 [hd("株式譲渡価格"), hd("事業価値（EV）"), hd("EV/EBITDA"), hd("必要な三つ星維持確率"), hd("判定")],
 ["45.00億円", num("22.57億円"), num("4.27倍"), num("0%（B案でも成立）"), {text:"売主が応じない",options:{color:MUTE,fontSize:10.5}}],
 [{text:"50.00億円（提示）",options:{bold:true,fill:{color:"EFE6E9"}}}, num("27.57億円",{bold:true,fill:{color:"EFE6E9"}}), num("5.21倍",{bold:true,fill:{color:"EFE6E9"}}), num("34.1%",{bold:true,color:GRN,fill:{color:"EFE6E9"}}), {text:"◎ 妥当。星が落ちる前提でも概ね説明できる",options:{bold:true,color:GRN,fill:{color:"EFE6E9"},fontSize:10.5}}],
 ["53.00億円", num("30.57億円"), num("5.78倍"), num("60.6%"), {text:"○ 交渉の実務的な着地上限",options:{color:GRN,fontSize:10.5}}],
 ["55.00億円", num("32.57億円"), num("6.16倍"), num("78.4%"), {text:"△ 許容上限。星維持をほぼ前提とする",options:{color:AMB,fontSize:10.5}}],
 ["57.40億円", num("34.97億円"), num("6.61倍"), num("100%"), {text:"理論上限。降格リスクをゼロと置く水準",options:{color:AMB,fontSize:10.5}}],
 ["60.00億円", num("37.57億円"), num("7.10倍"), num("122.8%"), {text:"× 説明不能。維持ケースDCFをも超える",options:{bold:true,color:RED,fontSize:10.5}}]
];
s.addTable(rows, tOpt({x:M, y:2.05, w:12.09, colW:[2.2,2.0,1.7,2.6,3.59], rowH:0.42, fontSize:10.5}));

s.addShape(p.ShapeType.roundRect,{x:M, y:5.28, w:12.09, h:1.1, rectRadius:0.04, fill:{color:BERRY}});
s.addText([{text:"適正レンジ 50〜53億円　／　許容上限 55億円　／　57.4億円で三つ星維持100%前提　／　60億円は説明不能\n",options:{fontSize:13.5,bold:true,color:W}},
 {text:"加重期待値（維持50%／降格35%／喪失15%）による株式価値は50.67億円。提示価格50億円はこの期待値をわずかに下回る。「50億円以上」という売主条件と3社競合を踏まえても、55億円を超える提示は本資料の前提では正当化できない。",options:{fontSize:10.5,color:"EBDCE1"}}],
 {x:M+0.28, y:5.4, w:11.53, h:0.9, isTextBox:true, margin:0, lineSpacing:18, valign:"middle"});
footer(s);
}

/* =========================================================
   S14 ブレークイーブン・感応度
========================================================= */
{
const s = p.addSlide();
header(s, "CHECK A ブレークイーブン分析", "営業利益が恒久的に21%落ちても、50億円は正当化される",
  "提示価格が織り込む事業価値27.57億円を、割引率10%・継続成長率0%で維持するために必要な利益水準を逆算した。");
const bk=[["必要な恒久FCF","2.76億円","現状3.50億円に対し ▲21.2%"],
          ["必要な恒久営業利益","4.15億円","現状5.28億円に対し ▲21.4%"],
          ["必要な営業利益率","40.9%","現状52.0%から11.1pt低下まで許容"]];
bk.forEach((b,i)=>{
  const x = M + i*4.08;
  card(s, x, 2.0, 3.85, 1.4, "FFFFFF");
  s.addText(b[0], {x:x+0.24, y:2.14, w:3.4, h:0.26, isTextBox:true, margin:0, fontFace:SANS, fontSize:10, bold:true, color:GOLD});
  s.addText(b[1], {x:x+0.24, y:2.42, w:3.4, h:0.5, isTextBox:true, margin:0, fontFace:SERIF, fontSize:26, bold:true, color:BERRY});
  s.addText(b[2], {x:x+0.24, y:2.94, w:3.4, h:0.34, isTextBox:true, margin:0, fontFace:SANS, fontSize:10, color:MUTE, lineSpacing:14});
});
s.addText("感応度：営業利益の恒久的な減少率 × 割引率 → 事業価値（億円）", {x:M, y:3.62, w:8, h:0.3, isTextBox:true, margin:0,
  fontFace:SERIF, fontSize:13.5, bold:true, color:INK});
const drops=[0,0.10,0.20,0.30,0.50];
const rates=[0.08,0.10,0.12];
const hdr=[hd("営業利益の恒久的減少")].concat(rates.map(r=>hd("割引率 "+(r*100)+"%")), [hd("該当シナリオの目安")]);
const body = drops.map(d=>{
  const fcf = ((OP*(1-d))+6)*0.655;
  const cells = rates.map(r=>{
    const v = fcf/r/100;
    const ok = v>=27.57;
    return num(v.toFixed(1)+"億", {color: ok?GRN:RED, bold: r===0.10});
  });
  const lbl = d===0?"現状維持（±0%）":"▲"+(d*100)+"%";
  const memo = {0:"三つ星維持",0.1:"軽微な客離れ",0.2:"ブレークイーブン水準",0.3:"二つ星降格の入口",0.5:"二つ星降格〜星喪失"}[d];
  return [{text:lbl,options:{bold:d===0.2,fill:{color:d===0.2?TINT:W}}}].concat(cells, [{text:memo,options:{fontSize:10,color:MUTE}}]);
});
s.addTable([hdr].concat(body), tOpt({x:M, y:3.96, w:12.09, colW:[2.8,1.9,1.9,1.9,3.59], rowH:0.37, fontSize:10.5}));
s.addText("緑＝提示価格が織り込むEV 27.57億円を上回る（価格が正当化される）／赤＝下回る。割引率10%・営業利益▲20%までが許容範囲。\n参考：レバレッジなしIRR 12.5%（EV27.57億円で取得、10年保有、Exit EV/EBITDA 5.0倍、三つ星維持前提）。単純回収年数はEV÷FCFで7.9年、EV÷営業利益で5.2年。",
  {x:M, y:6.28, w:12.09, h:0.6, isTextBox:true, margin:0, fontFace:SANS, fontSize:9.5, color:MUTE, lineSpacing:14});
footer(s);
}

/* =========================================================
   S15 20億円LBOの返済可能性
========================================================= */
{
const s = p.addSlide();
header(s, "CHECK B ①　20億円LBOの返済可能性", "LBOローン20億円は、返済プロファイルの設計で成立する",
  "20億円を7年で均等償却する前提では初年度DSCRが1.01となる。これは借入金額の問題ではなく返済設計の問題であり、タームローンAとBに分ければ初年度からDSCR 1.35を確保できる。");
const tiles=[["初年度DSCR","1.35","タームローンA 14億＋B 6億／7年・金利3%"],
             ["7年間の累積余剰CF","7.56億円","期限一括分6.00億円を上回る"],
             ["ネット Debt/EBITDA","2.6倍","グロス3.8倍。対象会社は無借金・現預金17.43億円"]];
tiles.forEach((t,i)=>{
  const x = M + i*4.08;
  card(s, x, 1.95, 3.85, 1.12, "FFFFFF");
  s.addText(t[0], {x:x+0.24, y:2.07, w:3.4, h:0.24, isTextBox:true, margin:0, fontFace:SANS, fontSize:9.5, bold:true, color:GOLD});
  s.addText(t[1], {x:x+0.24, y:2.32, w:3.4, h:0.44, isTextBox:true, margin:0, fontFace:SERIF, fontSize:24, bold:true, color:BERRY});
  s.addText(t[2], {x:x+0.24, y:2.76, w:3.4, h:0.26, isTextBox:true, margin:0, fontFace:SANS, fontSize:9, color:MUTE});
});

s.addText("返済方式別の比較（借入20.00億円・7年・金利3%）", {x:M, y:3.22, w:6.2, h:0.28, isTextBox:true, margin:0,
  fontFace:SERIF, fontSize:13, bold:true, color:INK});
const way=[
 [hd("返済方式"), hd("初年度返済"), hd("初年度DSCR"), hd("7年後残高")],
 [{text:"① 元金均等（7年で全額償却）",options:{fontSize:9}}, num("3.46億",{fontSize:9}), num("1.01",{color:RED,bold:true,fontSize:9}), num("0",{fontSize:9})],
 [{text:"② 元利均等（7年で全額償却）",options:{fontSize:9}}, num("3.21億",{fontSize:9}), num("1.09",{color:AMB,fontSize:9}), num("0",{fontSize:9})],
 [{text:"③ TLA 14億＋TLB 6億（期限一括）",options:{fontSize:9,bold:true,fill:{color:TINT}}}, num("2.60億",{fontSize:9,fill:{color:TINT}}), num("1.35",{color:GRN,bold:true,fontSize:9,fill:{color:TINT}}), num("6.00億",{fontSize:9,fill:{color:TINT}})],
 [{text:"④ TLA 12億＋TLB 8億（期限一括）",options:{fontSize:9}}, num("2.31億",{fontSize:9}), num("1.51",{color:GRN,fontSize:9}), num("8.00億",{fontSize:9})]
];
s.addTable(way, tOpt({x:M, y:3.56, w:6.2, colW:[2.9,1.0,1.15,1.15], rowH:0.40, fontSize:9}));
card(s, M, 5.70, 6.2, 0.95);
s.addText("③を推奨する理由", {x:M+0.22, y:5.82, w:3.0, h:0.24, isTextBox:true, margin:0, fontFace:SANS, fontSize:9.5, bold:true, color:GOLD});
s.addText("元本を14億円に絞ることで年間元本負担が2.00億円に下がり、平常時DSCRが1.35〜1.56で推移する。残る6.00億円は7年間の余剰キャッシュフローで返済でき、リファイナンスを前提としない。",
  {x:M+0.22, y:6.06, w:5.8, h:0.55, isTextBox:true, margin:0, fontFace:SANS, fontSize:9.5, color:INK, lineSpacing:13.5});

s.addText("推奨ストラクチャー③の7年返済計画（億円）", {x:7.02, y:3.22, w:5.7, h:0.28, isTextBox:true, margin:0,
  fontFace:SERIF, fontSize:13, bold:true, color:INK});
const sc=[[1,20.00,2.00,0.60,2.60,1.35,0.90],[2,18.00,2.00,0.54,2.54,1.38,1.86],[3,16.00,2.00,0.48,2.48,1.41,2.88],
          [4,14.00,2.00,0.42,2.42,1.45,3.96],[5,12.00,2.00,0.36,2.36,1.48,5.10],[6,10.00,2.00,0.30,2.30,1.52,6.30],
          [7, 8.00,2.00,0.24,2.24,1.56,7.56]];
const amo=[[hd("年度"), hd("期首残高"), hd("元本"), hd("利息"), hd("返済計"), hd("DSCR"), hd("累積余剰CF")]].concat(
  sc.map(r=>[{text:String(r[0])+"年目",options:{fontSize:9}}, num(r[1].toFixed(2),{fontSize:9}), num(r[2].toFixed(2),{fontSize:9}),
             num(r[3].toFixed(2),{fontSize:9}), num(r[4].toFixed(2),{fontSize:9}),
             num(r[5].toFixed(2),{fontSize:9,bold:true,color:GRN}), num("+"+r[6].toFixed(2),{fontSize:9})]),
  [[{text:"累計",options:{bold:true,fill:{color:TINT},fontSize:9}}, num("—",{fill:{color:TINT},fontSize:9}), num("14.00",{bold:true,fill:{color:TINT},fontSize:9}),
    num("2.94",{fill:{color:TINT},fontSize:9}), num("16.94",{bold:true,fill:{color:TINT},fontSize:9}), num("—",{fill:{color:TINT},fontSize:9}),
    num("+7.56",{bold:true,color:GRN,fill:{color:TINT},fontSize:9})]]);
s.addTable(amo, tOpt({x:7.02, y:3.56, w:5.7, colW:[0.78,0.86,0.72,0.72,0.82,0.7,1.1], rowH:0.33, fontSize:9}));
s.addText("7年間の累積余剰キャッシュフロー7.56億円が、期限一括のタームローンB 6.00億円を上回る。リファイナンスを前提とせず、7年で20.00億円を完済できる。",
  {x:7.02, y:6.56, w:5.7, h:0.4, isTextBox:true, margin:0, fontFace:SANS, fontSize:9, color:MUTE, lineSpacing:12.5});
footer(s);
}

/* =========================================================
   S16 ストレス耐性と保全
========================================================= */
{
const s = p.addSlide();
header(s, "CHECK B ②　ストレス耐性と保全", "20億円のストレス耐性と、銀行にご提案できる保全",
  "推奨ストラクチャー③（TLA 14億＋TLB 6億／7年・金利3%）に対し、収益が悪化した場合の返済可能性を検証した。");
const st=[
 [hd("シナリオ"), hd("FCF"), hd("DSCR"), hd("7年間の返済可能性")],
 [{text:"平常時",options:{bold:true}}, num("3.50億"), num("1.35〜1.56",{color:GRN,bold:true}), {text:"全期間で1.35以上。累積余剰7.56億円でTLBも完済",options:{fontSize:10}}],
 [{text:"営業利益▲21%（p.14 ブレークイーブン）",options:{bold:true}}, num("2.76億"), num("1.06",{color:GRN,bold:true}), {text:"初年度から1.0を維持。元利返済に支障なし",options:{fontSize:10}}],
 [{text:"二つ星降格（4年目以降）",options:{bold:true}}, num("2.00億"), num("0.83〜0.89",{color:AMB,bold:true}), {text:"4〜7年の累積不足1.32億円。3年目末の累積余剰2.88億円で全額吸収可能。ただしTLB 6.00億円は留保現金またはリファイナンスによる返済となる",options:{fontSize:10}}],
 [{text:"星喪失（4年目以降）",options:{bold:true}}, num("1.00億"), num("0.41〜0.45",{color:RED,bold:true}), {text:"累積不足5.32億円。累積余剰2.88億円＋留保現金6.00億円で元利返済は継続できるが、TLB 6.00億円は返済不能",options:{fontSize:10}}]
];
s.addTable(st, tOpt({x:M, y:1.95, w:12.09, colW:[3.1,1.2,1.5,6.29], rowH:0.44, fontSize:10}));

card(s, M, 4.42, 5.95, 1.62);
s.addText("ネットレバレッジ", {x:M+0.24, y:4.54, w:3.0, h:0.24, isTextBox:true, margin:0, fontFace:SANS, fontSize:9.5, bold:true, color:GOLD});
const nl=[["LBOローン","20.00億円"],["− 対象会社に留保する現預金","6.00億円"],["＝ 連結ネットデット","14.00億円（2.6倍）"]];
nl.forEach((n,i)=>{
  const y=4.80+i*0.30;
  s.addText(n[0], {x:M+0.24, y:y, w:3.3, h:0.26, isTextBox:true, margin:0, fontFace:SANS, fontSize:i===2?11:10, bold:i===2, color:i===2?BERRY:INK, valign:"middle"});
  s.addText(n[1], {x:M+3.55, y:y, w:2.2, h:0.26, isTextBox:true, margin:0, fontFace:SANS, fontSize:i===2?11:10, bold:i===2, color:i===2?BERRY:INK, align:"right", valign:"middle"});
});
s.addText("対象会社は無借金で現預金17.43億円を持つため、グロス3.8倍に対しネットは2.6倍にとどまる。",
  {x:M+0.24, y:5.72, w:5.45, h:0.28, isTextBox:true, margin:0, fontFace:SANS, fontSize:9.5, color:MUTE});

card(s, 6.78, 4.42, 5.93, 1.62, "FFFFFF");
s.addText("保全・コベナンツ案（ご提案）", {x:7.02, y:4.54, w:4.0, h:0.24, isTextBox:true, margin:0, fontFace:SANS, fontSize:9.5, bold:true, color:GOLD});
s.addText("① 対象会社株式100%への質権設定　② ワイン在庫（簿価1.19億円）への担保設定　③ DSCR 1.1倍以上の維持　④ 対象会社に現預金6.00億円以上を留保　⑤ TLB完済までの配当・自己株取得の制限　⑥ 超過キャッシュフローの50%をTLBへ充当（キャッシュスイープ）　⑦ 岸田氏の退任・料理長交代・ミシュラン評価変動の報告義務　⑧ サントリー・ファインズとの取引条件変更時の報告義務",
  {x:7.02, y:4.80, w:5.45, h:1.2, isTextBox:true, margin:0, fontFace:SANS, fontSize:9.5, color:INK, lineSpacing:13.5});

s.addShape(p.ShapeType.roundRect,{x:M, y:6.18, w:12.09, h:0.66, rectRadius:0.04, fill:{color:BERRY}});
s.addText([{text:"実質的な論点は金額ではなく期間　",options:{bold:true,fontSize:11.5,color:W}},
 {text:"貴行のスタートアップM&A融資が5年目線の場合、TLA 11億円＋TLB 9億円で初年度DSCR 1.25を確保できるものの、5年後にTLB 9.00億円のリファイナンスが必要になる。7年を許容いただけるかが、20億円を自力返済で完結させられるかの分岐点となる。",options:{fontSize:10,color:"EBDCE1"}}],
 {x:M+0.28, y:6.26, w:11.53, h:0.5, isTextBox:true, margin:0, lineSpacing:15, valign:"middle"});
footer(s);
}

/* =========================================================
   S16 価格を毀損しうる論点
========================================================= */
{
const s = p.addSlide();
header(s, "RISK", "価格の前提を崩しうる8つの論点と、その手当て");
const rows=[
 [hd("論点"), hd("価格への影響"), hd("手当て")],
 [{text:"1　役員貸付金5.00億円の回収",options:{bold:true}}, {text:"未精算ならEVは27.6→32.6億円（6.2倍）へ",options:{color:RED}}, "クロージング時の現金精算をSPAの前提条件とする"],
 [{text:"2　後継シェフの不在",options:{bold:true}}, {text:"シナリオB/Cの発生確率が上昇",options:{color:RED}}, "売主は在籍5名につき「料理長を任せられるタイプではない」と回答済み。3年ロックアップ中の招聘を岸田氏の努力義務として契約化"],
 [{text:"3　ミシュラン評価の降格",options:{bold:true}}, {text:"営業利益5.28→2.00億円（シナリオB）",options:{color:RED}}, "星の維持に連動したアーンアウト（価格の一部後払い）を提案"],
 [{text:"4　岸田氏の3年経過後の活動",options:{bold:true}}, "ブランドの希薄化", "「新店舗・ガストロノミーは考えていない／他店監修はあり得る」との回答。競業避止＋監修の事前承諾制を条件化"],
 [{text:"5　「50億円は最低ライン」＋3社競合",options:{bold:true}}, {text:"55億円超で説明困難（p.13）",options:{color:RED}}, "上限55億円の規律。EV固定＋クロージング時ネットキャッシュ実額連動方式とすれば、額面を上げつつ実質負担を抑えられる"],
 [{text:"6　店舗の賃貸借契約",options:{bold:true}}, "賃料は売上比1.97%＝年約1,900万円", "残存期間とオーナーチェンジ条項の確認（ガーデンシティ品川御殿山1F）"],
 [{text:"7　ワイン在庫の簿価",options:{bold:true}}, {text:"上振れ要因",options:{color:GRN}}, "簿価1.19億円。一次価格で継続仕入した希少銘柄を含むため、時価評価で含み益が生じる可能性"],
 [{text:"8　仕入先アロケーションの帰属",options:{bold:true}}, "収益構造の前提", "サントリー・ファインズ等の配分が会社に帰属するか岸田氏個人に帰属するか、契約形態を確認"]
];
s.addTable(rows, tOpt({x:M, y:1.42, w:12.09, colW:[3.1,3.0,5.99], rowH:0.42, fontSize:9.8}));
s.addText("論点1・2・3は価格そのものに直結する。特に論点1は、精算方法次第で実質的に支払う倍率が5.2倍から6.5倍へ動くため、価格交渉と同じ重みで手当てを要する。",
  {x:M, y:6.35, w:12.09, h:0.36, isTextBox:true, margin:0, fontFace:SANS, fontSize:10.5, color:INK, lineSpacing:15});
footer(s);
}

/* =========================================================
   S18 参考：アピシウスのバリューアップ実績
========================================================= */
{
const s = p.addSlide();
header(s, "REFERENCE　／　株式会社アピシウス（東京・銀座）", "参考：グランメゾンのM&A後バリューアップ実績",
  "当社は2024年6月、創業40年を超えるグランメゾンを取得した。39年間にわたり赤字が続き、40年目にようやく黒字化した店を引き継ぎ、2年間で売上30%増・営業利益250%超の増加を実現している。");
const tiles=[["売上高","＋30%","取得前比（2年間）"],
             ["営業利益","＋250%超","取得前比（2年間）"],
             ["幹部メンバー継続率","100%","一人も欠けていない"]];
tiles.forEach((t,i)=>{
  const x = M + i*4.08;
  s.addShape(p.ShapeType.roundRect, {x, y:1.92, w:3.85, h:1.18, rectRadius:0.05,
    fill:{color: i===2 ? BERRY : TINT}, line:{color: i===2 ? BERRY : LINE, width:0.75}});
  s.addText(t[0], {x:x+0.24, y:2.04, w:3.4, h:0.26, isTextBox:true, margin:0,
    fontFace:SANS, fontSize:10, bold:true, color: i===2 ? "E8D6DB" : GOLD});
  s.addText(t[1], {x:x+0.24, y:2.30, w:3.4, h:0.50, isTextBox:true, margin:0,
    fontFace:SERIF, fontSize:29, bold:true, color: i===2 ? W : BERRY});
  s.addText(t[2], {x:x+0.24, y:2.80, w:3.4, h:0.24, isTextBox:true, margin:0,
    fontFace:SANS, fontSize:9, color: i===2 ? "C9AEB6" : MUTE});
});

s.addText("取得前と、取得から2年後", {x:M, y:3.28, w:5.0, h:0.28, isTextBox:true, margin:0,
  fontFace:SERIF, fontSize:13.5, bold:true, color:INK});
const cmp=[
 [hd(""), hd("取得前（〜2024年5月）"), hd("取得後2年（2026年）")],
 [{text:"業績",options:{bold:true,fontSize:10}},
  {text:"39年間にわたり赤字。40年目にようやく黒字化",options:{fontSize:10}},
  {text:"売上 ＋30%／営業利益 ＋250%超",options:{fontSize:10,bold:true,color:GRN}}],
 [{text:"人員",options:{bold:true,fontSize:10}},
  {text:"―",options:{fontSize:10,color:MUTE}},
  {text:"幹部メンバーは全員が継続。経営陣の入替えなし",options:{fontSize:10}}],
 [{text:"労働環境",options:{bold:true,fontSize:10}},
  {text:"サービス残業が常態化",options:{fontSize:10}},
  {text:"サービス残業を撤廃。12月を除き残業自体が発生しない体制へ",options:{fontSize:10,bold:true,color:GRN}}],
 [{text:"店舗",options:{bold:true,fontSize:10}},
  {text:"―",options:{fontSize:10,color:MUTE}},
  {text:"店内の一部改装・修繕を実施。業態・客層は変更せず",options:{fontSize:10}}]
];
s.addTable(cmp, tOpt({x:M, y:3.62, w:7.2, colW:[0.95,2.55,3.70], rowH:0.46, fontSize:10}));

card(s, 8.02, 3.28, 4.69, 2.62, "FFFFFF");
s.addText("本件において踏襲する運営方針", {x:8.26, y:3.40, w:4.2, h:0.26, isTextBox:true, margin:0,
  fontFace:SANS, fontSize:10, bold:true, color:GOLD});
const keep=[
 ["人を入れ替えない","幹部・従業員の雇用と処遇をそのまま承継する"],
 ["労働環境を先に整える","サービス残業の撤廃と、残業が発生しない体制の構築"],
 ["手を入れるのは最小限","改装・修繕は必要な範囲にとどめ、業態と客層は変えない"],
 ["収益はコスト削減で作らない","原価・人件費の圧縮ではなく、店の価値を高めて伸ばす"]
];
keep.forEach((k,i)=>{
  const y = 3.72 + i*0.54;
  badge(s, 8.26, y+0.03, String(i+1), ROSE);
  s.addText(k[0], {x:8.62, y:y, w:3.9, h:0.24, isTextBox:true, margin:0,
    fontFace:SANS, fontSize:10.5, bold:true, color:BERRY});
  s.addText(k[1], {x:8.62, y:y+0.23, w:3.9, h:0.30, isTextBox:true, margin:0,
    fontFace:SANS, fontSize:9, color:MUTE, lineSpacing:12});
});

s.addShape(p.ShapeType.roundRect,{x:M, y:6.10, w:SW-2*M, h:0.80, rectRadius:0.04, fill:{color:BERRY}});
s.addText([{text:"買収後の実行力は、実績で裏付けられています。\n",options:{fontSize:12.5, bold:true, color:W}},
 {text:"39年間赤字が続いたグランメゾンを取得し、幹部を一人も欠くことなく、2年間で営業利益を250%超伸ばしました。対象会社は既に高収益であり、必要なのは再建ではなく承継ですが、買収後の運営を担う体制は既に実証されています。",
  options:{fontSize:10.5, color:"EBDCE1"}}],
 {x:M+0.28, y:6.18, w:SW-2*M-0.56, h:0.64, isTextBox:true, margin:0, lineSpacing:17, valign:"middle"});
footer(s);
}

/* =========================================================
   S17 結論・前提
========================================================= */
{
const s = p.addSlide(); s.background={color:DARK};
s.addShape(p.ShapeType.ellipse,{x:10.2,y:4.6,w:5.6,h:5.6,fill:{color:BERRY},transparency:66});
s.addText("CONCLUSION", {x:M, y:0.55, w:8, h:0.3, isTextBox:true, margin:0,
  fontFace:SANS, fontSize:11, bold:true, color:GOLD, charSpacing:1.4});
s.addText("結論", {x:M, y:0.85, w:8, h:0.55, isTextBox:true, margin:0,
  fontFace:SERIF, fontSize:32, bold:true, color:W});
const con=[
 ["01","株式譲渡価格50億円は妥当","2026年12月期末の想定財務を前提とすれば、EV/EBITDA 5.2倍、年買法で営業利益5.09年分、DCF加重期待値50.67億円。4手法すべてで説明可能な水準にある。"],
 ["02","許容上限は55億円、理論上限は57.4億円","55億円は三つ星維持確率78%、57.4億円は100%を前提とする。60億円は維持ケースのDCFをも超え、現在の収益力では説明できない。"],
 ["03","価格の45%はキャッシュで裏付けられている","50億円のうち22.43億円は非事業用資産。事業リスクにさらされるのは27.57億円のみで、営業利益が恒久的に21%落ちてもこの水準は正当化される。"],
 ["04","ただし2つの条件が前提","(a) 役員貸付金5.00億円のクロージング時現金精算、(b) 岸田氏3年ロックアップの契約担保。(a)が崩れると実質倍率は6.5倍となり、評価は一段厳しくなる。"]
];
con.forEach((c,i)=>{
  const y = 1.72 + i*1.18;
  s.addText(c[0], {x:M, y:y, w:0.7, h:0.4, isTextBox:true, margin:0, fontFace:SERIF, fontSize:20, bold:true, color:GOLD});
  s.addText(c[1], {x:M+0.8, y:y, w:7.0, h:0.32, isTextBox:true, margin:0, fontFace:SERIF, fontSize:16, bold:true, color:W});
  s.addText(c[2], {x:M+0.8, y:y+0.36, w:7.1, h:0.72, isTextBox:true, margin:0, fontFace:SANS, fontSize:10.5, color:"C9B6BC", lineSpacing:15});
});
s.addShape(p.ShapeType.roundRect,{x:8.85, y:1.72, w:3.86, h:4.6, rectRadius:0.04, fill:{color:"3B1E2B"}, line:{color:"5A3240", width:0.75}});
s.addText("前提条件と出所", {x:9.09, y:1.88, w:3.4, h:0.28, isTextBox:true, margin:0,
  fontFace:SANS, fontSize:10, bold:true, color:GOLD});
s.addText([
 {text:"・2025/12期まではIM記載の決算数値。2026/12期はIM p.40の会社計画。\n",options:{}},
 {text:"・2026/12期末BSは、無配・設備投資ゼロ・負債横ばいを前提に当期純利益350百万円が全額現預金と純資産に積み上がるものとして推計。\n",options:{}},
 {text:"・FCF＝当期純利益（減価償却1百万円、設備投資ゼロ、運転資本増減ゼロ）。\n",options:{}},
 {text:"・DCFは割引率10%・継続成長率0%を基準とし、1〜3年目は3シナリオ共通で3.50億円。\n",options:{}},
 {text:"・EBITDA倍率の業種別目安（小売飲食業 約6倍）は2026年7月時点の中小M&A実務データ。ひらまつ（2764）はFY2027/3会社予想。\n",options:{}},
 {text:"・売主側条件（3年ロックアップ、後継シェフ、譲渡理由、選定基準）は仲介回答（2026年9月）による。\n",options:{}},
 {text:"・LBOローンの返済試算は借入20.00億円・7年・金利3%、タームローンA 14.00億円（元金均等）＋タームローンB 6.00億円（期限一括）を前提。\n",options:{}},
 {text:"・本資料は対象会社の事業価値および提示価格の妥当性を検証したもの。買収ストラクチャーおよびエクイティの調達計画は別途。\n",options:{}},
 {text:"・p.18の株式会社アピシウスに関する計数は、同社の取得時（2024年6月）と2026年時点との比較。売上高・営業利益はいずれも取得前比。",options:{}}
], {x:9.09, y:2.2, w:3.4, h:3.9, isTextBox:true, margin:0, valign:"top", fontFace:SANS, fontSize:8.6, color:"B4A0A6", lineSpacing:12.5});
footer(s, true);
}

p.writeFile({fileName:"カンテサンス_株式譲渡価格50億円_妥当性検証.pptx"}).then(f=>console.log("WROTE", f));
