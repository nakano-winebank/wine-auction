const pptxgen = require("pptxgenjs");
const p = new pptxgen();
p.layout = "LAYOUT_WIDE";            // 13.33 x 7.5
p.title = "カンテサンス 買収案件 銀行ご提出用資料";
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
  s.addText("カンテサンス（株式会社プティ・ボノム）買収案件 ／ みずほ銀行ご提出用　2026年9月20日 株式会社WineBank",
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


/* --- スキーム図用のヘルパ --- */
function box(s,x,y,w,h,title,sub,o={}){
  s.addShape(p.ShapeType.roundRect,{x,y,w,h,rectRadius:0.05,fill:{color:o.fill||W},line:{color:o.line||BERRY,width:o.lw||1.25}});
  s.addText(title,{x:x+0.12,y:y+0.13,w:w-0.24,h:0.30,isTextBox:true,margin:0,align:"center",
    fontFace:SANS,fontSize:o.ts||12.5,bold:true,color:o.tc||INK});
  if(sub) s.addText(sub,{x:x+0.10,y:y+0.43,w:w-0.20,h:h-0.52,isTextBox:true,margin:0,align:"center",
    fontFace:SANS,fontSize:o.ss||9,color:o.sc||MUTE,lineSpacing:12});
}
const vA=(s,x,y1,y2,c)=>s.addShape(p.ShapeType.line,{x,y:y1,w:0,h:y2-y1,line:{color:c||BERRY,width:1.5,endArrowType:"triangle"}});
const hA=(s,x1,x2,y,c)=>s.addShape(p.ShapeType.line,{x:Math.min(x1,x2),y,w:Math.abs(x2-x1),h:0,
  line:{color:c||BERRY,width:1.5,endArrowType:"triangle"}});
const lab=(s,x,y,w,t,o={})=>s.addText(t,{x,y,w,h:o.h||0.36,isTextBox:true,margin:0,align:"center",
  fontFace:SANS,fontSize:o.fs||8.5,bold:true,color:o.c||BERRY,lineSpacing:11});

/* ===== p.1  表紙 ===== */
{
const s = p.addSlide(); s.background = {color:DARK};
s.addShape(p.ShapeType.ellipse,{x:9.5,y:-1.5,w:6.2,h:6.2,fill:{color:BERRY},transparency:62});
s.addText("みずほ銀行 御中 ／ ご提出用資料", {x:M, y:1.05, w:8, h:0.3, isTextBox:true, margin:0,
  fontFace:SANS, fontSize:12, bold:true, color:GOLD, charSpacing:2});
s.addText("カンテサンス\n買収案件のご相談", {x:M, y:1.52, w:8.6, h:1.8, isTextBox:true, margin:0,
  fontFace:SERIF, fontSize:40, bold:true, color:W, lineSpacing:50});
s.addText("株式会社プティ・ボノム（Quintessence／東京・御殿山）\n19年連続ミシュラン三つ星・20年連続増収増益・無借金",
  {x:M, y:3.45, w:8.6, h:0.8, isTextBox:true, margin:0, fontFace:SANS, fontSize:14, color:"D9CBCF", lineSpacing:24});

const st=[["譲受価額","50〜55億円","EV/EBITDA 5.2〜6.2倍"],["ご相談額","41.4億円","ターム20.0＋ブリッジ21.4"],["初年度DSCR","1.36倍","当初案。ご相談案（p.24）では1.38倍"]];
st.forEach((v,i)=>{
  const x = M + i*3.05;
  s.addShape(p.ShapeType.roundRect,{x, y:4.5, w:2.8, h:1.2, rectRadius:0.05, fill:{color:"3B1E2B"}, line:{color:"5A3240", width:0.75}});
  s.addText(v[0], {x:x+0.2, y:4.62, w:2.4, h:0.25, isTextBox:true, margin:0, fontFace:SANS, fontSize:9.5, color:GOLD, bold:true});
  s.addText(v[1], {x:x+0.2, y:4.86, w:2.4, h:0.5, isTextBox:true, margin:0, fontFace:SERIF, fontSize:25, bold:true, color:W});
  s.addText(v[2], {x:x+0.2, y:5.36, w:2.4, h:0.25, isTextBox:true, margin:0, fontFace:SANS, fontSize:9, color:"AC969C"});
});
s.addText("対象会社の概要、譲受価額の妥当性、買収ストラクチャー、返済可能性を一冊にまとめたものです。\n2026年9月20日　株式会社WineBank",
  {x:M, y:6.15, w:9.5, h:0.7, isTextBox:true, margin:0, fontFace:SANS, fontSize:10, color:"9C858B", lineSpacing:16});
footer(s, true);
}

/* ===== p.2  カンテサンスとは ===== */
{
const BG="1C0E14", CARD="30161F", EDGE="522C39", BERRY="6D2E46",
      GOLD="E0B94A", GOLDD="C9A227", W="FFFFFF", TXT="D6C6CB", DIM="9C868D";
const SERIF="Cambria", SANS="Calibri";
const SW=13.33, M=0.62;

const s = p.addSlide();
s.background = {color:BG};
s.addShape(p.ShapeType.ellipse,{x:10.3,y:-4.2,w:7.8,h:7.8,fill:{color:BERRY},transparency:82});
s.addShape(p.ShapeType.ellipse,{x:-3.0,y:5.2,w:6.4,h:6.4,fill:{color:BERRY},transparency:88});

/* ---------- 見出し ---------- */
s.addText("QUINTESSENCE　／　カンテサンス（東京・品川御殿山）", {x:M, y:0.40, w:10, h:0.26, isTextBox:true, margin:0,
  fontFace:SANS, fontSize:11, bold:true, color:GOLD, charSpacing:1.6});
s.addText("創刊号から、ずっと三つ星。", {x:M, y:0.70, w:SW-2*M, h:0.76, isTextBox:true, margin:0,
  fontFace:SERIF, fontSize:44, bold:true, color:W});
s.addText("『ミシュランガイド東京』は2007年に創刊。2008年版から2026年版までの19版すべてで、カンテサンスは最高評価を保持している。",
  {x:M, y:1.52, w:SW-2*M, h:0.32, isTextBox:true, margin:0, fontFace:SANS, fontSize:13, color:TXT});

/* ---------- 19年 × ★★★ ---------- */
const SZ=0.20, IN=0.225, GW=2*IN+SZ, PITCH=1.135;
function yearGroup(gx, gy, year){
  for(let k=0;k<3;k++){
    s.addShape(p.ShapeType.star5, {x:gx+k*IN, y:gy, w:SZ, h:SZ, fill:{color:GOLD}});
  }
  s.addText(String(year), {x:gx-0.16, y:gy+0.24, w:GW+0.32, h:0.20, isTextBox:true, margin:0,
    fontFace:SANS, fontSize:8, color:DIM, align:"center"});
}
const X0=0.92;
for(let i=0;i<10;i++) yearGroup(X0+i*PITCH, 2.02, 2008+i);
for(let i=0;i<9;i++)  yearGroup(X0+i*PITCH, 2.62, 2018+i);
s.addText([{text:"19年分の ",options:{fontSize:10.5, color:DIM, breakLine:false}},
           {text:"★★★",options:{fontSize:10.5, bold:true, color:GOLD, breakLine:true}},
           {text:"一度も欠けていない",options:{fontSize:11, bold:true, color:GOLDD}}],
  {x:10.72, y:2.58, w:2.22, h:0.50, isTextBox:true, margin:0, fontFace:SANS, align:"right", valign:"middle", lineSpacing:16});

/* ---------- 3軒だけ ---------- */
s.addShape(p.ShapeType.roundRect,{x:M, y:3.36, w:SW-2*M, h:1.04, rectRadius:0.04, fill:{color:GOLD}});
s.addText("創刊号から19年連続で三つ星を守っている店は、東京に3軒しかない。",
  {x:M+0.34, y:3.47, w:SW-2*M-0.68, h:0.34, isTextBox:true, margin:0,
   fontFace:SERIF, fontSize:19, bold:true, color:"2A1F06"});
const three=[["かんだ","（日本料理）",false],["ジョエル・ロブション","（フランス料理）",false],["カンテサンス","（フランス料理）",true]];
three.forEach((t,i)=>{
  const x = M+0.34 + i*3.80;
  if(t[2]) s.addShape(p.ShapeType.star5,{x:x, y:3.94, w:0.17, h:0.17, fill:{color:"2A1F06"}});
  s.addText([{text:t[0],options:{fontSize:13, bold:true, color:"2A1F06"}},
             {text:"　"+t[1],options:{fontSize:10, color:"6B5518"}}],
    {x: t[2] ? x+0.24 : x, y:3.90, w:3.60, h:0.28, isTextBox:true, margin:0, fontFace:SANS, valign:"middle"});
});

/* ---------- 4つの事実 ---------- */
const facts=[
 ["メニューが、ない","開業以来、おまかせの一コースのみ。「その日いちばんおいしい食材を知っているのは僕たちです」（岸田周三）"],
 ["33歳、当時最年少","2007年の創刊号で三つ星。パリ「アストランス」でスーシェフを務め、帰国した翌年のことだった。"],
 ["緑の星も、持っている","2021年、持続可能な漁業への取り組みでミシュラン グリーンスターを獲得。東京で6軒のみの初年度認定。"],
 ["星を持って、巣立った","この店の卒業生12名以上が独立し、それぞれにミシュランの星を得ている。"]
];
facts.forEach((f,i)=>{
  const x = M + i*3.08;
  s.addShape(p.ShapeType.roundRect,{x, y:4.76, w:2.84, h:1.82, rectRadius:0.05,
    fill:{color:CARD}, line:{color:EDGE, width:0.75}});
  s.addShape(p.ShapeType.star5,{x:x+0.24, y:4.94, w:0.16, h:0.16, fill:{color:GOLD}});
  s.addText(f[0], {x:x+0.24, y:5.18, w:2.36, h:0.46, isTextBox:true, margin:0,
    fontFace:SERIF, fontSize:14, bold:true, color:GOLD, lineSpacing:19});
  s.addText(f[1], {x:x+0.24, y:5.70, w:2.36, h:0.80, isTextBox:true, margin:0,
    fontFace:SANS, fontSize:9.5, color:TXT, lineSpacing:14});
});

/* ---------- 出所 ---------- */
s.addText("出所：『ミシュランガイド東京2026』（2025年9月発表。東京の三つ星12軒・星付き160軒で19年連続世界最多）ほか公開情報。創刊号の三つ星8軒のうち2018年版時点で11年連続は4軒、うち「すきやばし次郎」は2020年版より掲載対象外。",
  {x:M, y:6.78, w:12.09, h:0.20, isTextBox:true, margin:0, fontFace:SANS, fontSize:7, color:"7E666D"});

s.addNotes("『ミシュランガイド東京』は2007年創刊、2026年版で19版目。創刊号から19年連続で三つ星を維持しているのは、かんだ／ガストロノミー ジョエル・ロブション／カンテサンスの3軒のみ（2018年版時点で11年連続は4軒、うちすきやばし次郎は2020年版より掲載対象外）。岸田周三氏は創刊号で33歳、当時最年少での三つ星獲得。開業以来おまかせ一コースのみ。2021年ミシュラン グリーンスター獲得。東京は19年連続で星付き店数世界一（三つ星12軒、パリ10軒、ニューヨーク5軒）。");
footer(s, true);
}

/* ===== p.3  エグゼクティブサマリー ===== */
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
 {text:"買収目的会社（SPC）方式により、みずほ銀行41.4億円（タームローン20.0億円＋ブリッジローン21.4億円）と投資家の出資10.0億円で取得する。ブリッジローンは合併直後に対象会社の余剰現金で全額返済し、合併後の有利子負債は20.0億円、初年度DSCRは1.36倍となる（p.16〜p.22）。",options:{}}],
 {x:M, y:5.52, w:SW-2*M, h:0.6, isTextBox:true, margin:0, fontFace:SANS, fontSize:10.5, color:MUTE, lineSpacing:16});
footer(s);
}

/* ===== p.4  検証の枠組み ===== */
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
 ["CHECK B","返済可能性","返済プロファイル・月次資金繰り・ストレス耐性","p.20-22"]
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
s.addText("すべての検証は 2026年12月期（IM記載の会社計画）ベース。2025年12月期実績ベースの数値とは異なる。\n買収ストラクチャーは p.16〜p.19、参考資料としてグランメゾンのM&A後バリューアップ実績を p.24 に掲載している。",
  {x:M, y:6.30, w:SW-2*M, h:0.5, isTextBox:true, margin:0, fontFace:SANS, fontSize:10, color:MUTE, lineSpacing:15});
footer(s);
}

/* ===== p.5  対象会社概要 ===== */
{
const s = p.addSlide();
header(s, "TARGET", "対象会社の概要と、営業利益率52%の構造");
const rows=[
 [{text:"商号",options:{bold:true}},"株式会社プティ・ボノム"],
 [{text:"店舗",options:{bold:true}},"Quintessence（東京都品川区北品川・ガーデンシティ品川御殿山1F／賃借）"],
 [{text:"開業／星",options:{bold:true}},"2006年開業。2008年以降 19年連続ミシュラン三つ星"],
 [{text:"株主",options:{bold:true}},"岸田周三氏 100%（今回100%譲渡）"],
 [{text:"子会社",options:{bold:true}},"カンテサンスプラス 100%（高級スイーツEC）／株式会社BISは対象外"],
 [{text:"規模",options:{bold:true}},"34席・1日平均54名（約1.6回転）・営業日数 約235日・年間来店 約1.27万人・従業員21名"],
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
 ["高稼働","34席×約1.6回転×約235日。リピート希望率7割、海外からの問い合わせは半数以上あるが意図的に絞っている"],
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

/* ===== p.6  業績推移 ===== */
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

/* ===== p.7  想定PL ===== */
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

/* ===== p.8  想定BS ===== */
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
s.addText("仲介の「ネットキャッシュ約20億円」のうち5.00億円は岸田氏に対する長期貸付金であり、同氏が返済して初めて現金になる。クロージング時の現金精算を条件化しない限り、買主は譲渡後に5億円の債権回収を追うことになる（p.23 論点1）。",
  {x:6.25, y:5.34, w:6.46, h:0.9, isTextBox:true, margin:0, fontFace:SANS, fontSize:10.5, color:INK, lineSpacing:16});
s.addText("出所：2025/12期はIM記載のBS。2026/12期は無配・設備投資ゼロ・負債横ばいを前提に、当期純利益350百万円が全額現預金と純資産に積み上がるものとして推計。",
  {x:M, y:6.45, w:SW-2*M, h:0.3, isTextBox:true, margin:0, fontFace:SANS, fontSize:9.5, color:MUTE});
footer(s);
}

/* ===== p.9  価格の分解 ===== */
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

/* ===== p.10  検証① ===== */
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

s.addText("比較対象", {x:M, y:3.94, w:5, h:0.3, isTextBox:true, margin:0, fontFace:SERIF, fontSize:14, bold:true, color:INK});
const cmp=[
 ["小売飲食業のEBITDA倍率 実務目安","約6倍","中小M&A実務の業種別目安（2026年7月時点）"],
 ["ひらまつ（東証スタンダード・2764）","経常利益率 約3.0%","FY2027/3会社予想 売上105.9億／経常3.2億。国内で唯一の高級レストラン上場企業"],
 ["カンテサンス","営業利益率 52.0%","上場高級外食の約17倍の収益性。ただし1店舗・属人性のディスカウントは別途必要"]
];
cmp.forEach((c,i)=>{
  const y=4.26+i*0.64;
  s.addShape(p.ShapeType.rect,{x:M, y:y+0.06, w:0.05, h:0.5, fill:{color:i===2?BERRY:ROSE}});
  s.addText(c[0], {x:M+0.2, y:y, w:3.5, h:0.28, isTextBox:true, margin:0, fontFace:SANS, fontSize:11, bold:true, color:INK});
  s.addText(c[1], {x:M+3.75, y:y, w:1.9, h:0.28, isTextBox:true, margin:0, fontFace:SANS, fontSize:11.5, bold:true, color:BERRY});
  s.addText(c[2], {x:M+0.2, y:y+0.28, w:11.3, h:0.4, isTextBox:true, margin:0, fontFace:SANS, fontSize:10, color:MUTE, lineSpacing:14});
});
s.addText([{text:"修正営業利益ベースでは4.5倍　",options:{bold:true,color:BERRY}},
 {text:"売主は「修正営業利益5.8億円」で本件を提示している。会計上の営業利益との差額は岸田氏の役員報酬（月60万円＋役員賞与9,540万円）であり、経営者報酬を一般的な水準に正常化したもの。この基準では2026年12月期は約6.1億円となり、EV27.57億円は4.5倍に相当する。ただし正常化益は岸田氏ご退任後にしか実現しないため、返済原資は会計ベースのFCF 3.50億円で見ている。",options:{color:MUTE}}],
  {x:M, y:6.30, w:SW-2*M, h:0.62, isTextBox:true, margin:0, fontFace:SANS, fontSize:9, lineSpacing:12.5});
footer(s);
}

/* ===== p.11  検証② ===== */
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

/* ===== p.12  検証③ ===== */
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
 ["継続成長率","0%（34席固定・値上げ以外の成長ドライバーなし）"]
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

/* ===== p.13  検証④ ===== */
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

/* ===== p.14  統合判定 ===== */
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

/* ===== p.15  ブレークイーブン ===== */
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

/* ===== p.16  M&Aスキーム ===== */
{
const s=p.addSlide();
header(s,"STRUCTURE","M&Aスキーム（SPC方式）",
  "資本金10万円のSPCを設立し、みずほ銀行のローンと投資家の出資をもって対象会社の全株式を取得。クロージング後にSPCと対象会社を合併する。譲受価額はレンジ（50.0〜55.0億円）で提示する。");

box(s,4.70,1.58,2.20,0.84,"中野 邦人 氏","SPC設立者",{fill:TINT});
box(s,7.10,1.58,2.20,0.84,"榊原 氏","投資家",{fill:TINT});
vA(s,5.80,2.42,3.06); vA(s,8.20,2.42,3.06);
lab(s,5.88,2.48,1.85,"出資10万円（67%）\n＋ 株主貸付 700万円");
lab(s,8.28,2.48,1.70,"出資 10.0億円\n（33%）");

box(s,M,3.06,2.55,0.96,"みずほ銀行","買収ファイナンス",{line:ROSE,lw:1});
box(s,4.45,3.06,4.40,0.96,"買収目的会社（SPC）","資本金10万円／借入41.4億円（ターム20.0＋ブリッジ21.4）",{fill:BERRY,tc:W,sc:"E3D2D7",ts:14});
box(s,10.05,3.06,2.66,0.96,"岸田 周三 氏","対象会社株式100%を保有",{line:ROSE,lw:1});

lab(s,3.19,3.10,1.24,"ターム 20.0億円\n＋ブリッジ 21.4億円",{c:RED});
hA(s,3.21,4.43,3.62,ROSE);
lab(s,8.85,3.12,1.20,"株式 100%",{h:0.20});
hA(s,10.03,8.87,3.36,ROSE);
hA(s,8.87,10.03,3.68,BERRY);
lab(s,8.82,3.74,1.26,"譲受代金\n50.0〜55.0億円",{fs:8});

vA(s,6.65,4.02,4.62);
lab(s,6.75,4.10,2.40,"100%取得 → クロージング後に合併",{h:0.22,c:MUTE});
box(s,4.45,4.62,4.40,0.90,"株式会社プティ・ボノム（カンテサンス）","現預金17.4億円／岸田氏は3年間 代表取締役として在任",{lw:1.5,ts:12});
s.addText("合併後、対象会社の余剰現金21.4億円\n（現預金17.4＋役員貸付金5.0−留保1.0）\nをもってブリッジローンを全額返済",
  {x:9.30,y:4.62,w:3.41,h:0.86,isTextBox:true,margin:0,fontFace:SANS,fontSize:9,color:INK,lineSpacing:12});

const chips=[["譲受価額","50.0〜55.0億円","レンジで提示"],
             ["みずほへの依頼","41.4億円","ターム20.0＋ブリッジ21.4",true],
             ["中野氏の実弾","700万円","留保現金1.0億円とした場合",true],
             ["合併後の有利子負債","20.0億円","初年度DSCR 1.36倍"]];
chips.forEach((c,i)=>{
  const x=M+i*3.05, hot=c[3];
  s.addShape(p.ShapeType.roundRect,{x,y:5.72,w:2.80,h:1.00,rectRadius:0.05,
    fill:{color:hot?BERRY:TINT},line:{color:hot?BERRY:LINE,width:0.75}});
  s.addText(c[0],{x:x+0.18,y:5.82,w:2.44,h:0.24,isTextBox:true,margin:0,fontFace:SANS,fontSize:9.5,bold:true,color:hot?"E8D6DB":GOLD});
  s.addText(c[1],{x:x+0.18,y:6.04,w:2.50,h:0.40,isTextBox:true,margin:0,fontFace:SERIF,fontSize:i===0?17:20,bold:true,color:hot?W:BERRY});
  s.addText(c[2],{x:x+0.18,y:6.44,w:2.50,h:0.22,isTextBox:true,margin:0,fontFace:SANS,fontSize:8.5,color:hot?"C9AEB6":MUTE});
});
footer(s);
}

/* ===== p.17  資金の流れ ===== */
{
const s=p.addSlide();
header(s,"CASH FLOW","資金の流れ ― クロージング時、合併直後、定常",
  "対象会社の現預金は買収した後にしか使えない。クロージング時の不足はブリッジローンで埋め、合併直後に対象会社の余剰現金で全額返済する。");

s.addText("① クロージング時",{x:M,y:1.66,w:5.0,h:0.28,isTextBox:true,margin:0,fontFace:SERIF,fontSize:13.5,bold:true,color:INK});
s.addTable([
 [hd("資金使途"),hd("金額"),hd("調達"),hd("金額")],
 ["株式譲受代金",num("50.0億円"),"みずほ　タームローン",num("20.0億円")],
 ["取得関連費用",num("1.5億円"),{text:"みずほ　ブリッジローン",options:{color:RED}},num("21.4億円",{color:RED,bold:true})],
 ["",num(""),"榊原氏　出資",num("10.0億円")],
 ["",num(""),"中野氏　出資10万円＋株主貸付",num("0.1億円")],
 [{text:"合計",options:{bold:true,fill:{color:TINT}}},num("51.5億円",{bold:true,fill:{color:TINT}}),
  {text:"合計",options:{bold:true,fill:{color:TINT}}},num("51.5億円",{bold:true,fill:{color:TINT}})]
],tOpt({x:M,y:2.00,w:7.30,colW:[1.85,1.15,3.10,1.20],rowH:0.36,fontSize:10}));

s.addText("※ 譲受価額が55.0億円となる場合、差額5.0億円は追加投資家の第三者割当増資で調達する（p.19）。借入額および合併後の財務は変わらない。",{x:M,y:4.22,w:7.30,h:0.26,isTextBox:true,margin:0,fontFace:SANS,fontSize:9,color:MUTE});
s.addText("② 合併直後",{x:M,y:4.54,w:5.0,h:0.28,isTextBox:true,margin:0,fontFace:SERIF,fontSize:13.5,bold:true,color:INK});
s.addTable([
 [hd("対象会社の現預金"),hd("金額"),hd("充当先")],
 ["現預金",num("17.4億円"),{text:"うち1.0億円は運転資金として留保",options:{fontSize:9.5}}],
 ["役員貸付金の精算",num("5.0億円"),{text:"クロージング時に岸田氏が現金返済",options:{fontSize:9.5}}],
 [{text:"ブリッジ返済原資",options:{bold:true,fill:{color:TINT}}},num("21.4億円",{bold:true,fill:{color:TINT}}),
  {text:"ブリッジローンを全額返済",options:{bold:true,fontSize:9.5,fill:{color:TINT}}}]
],tOpt({x:M,y:4.88,w:7.30,colW:[2.10,1.20,4.00],rowH:0.34,fontSize:10}));

s.addShape(p.ShapeType.roundRect,{x:8.20,y:1.66,w:4.51,h:3.16,rectRadius:0.05,fill:{color:TINT},line:{color:LINE,width:0.75}});
s.addText("③ 定常状態（合併後）",{x:8.44,y:1.78,w:4.0,h:0.26,isTextBox:true,margin:0,fontFace:SANS,fontSize:10,bold:true,color:GOLD});
const fin=[["有利子負債","20.0億円","TLA14.0億（元金均等7年・毎月返済）＋TLB6.0億（期限一括）"],
           ["現預金","1.0億円","運転資金として留保"],
           ["ネットデット","19.0億円","EBITDA 3.6倍"],
           ["初年度DSCR","1.36倍","元利返済2.57億円 vs FCF 3.50億円"],
           ["2027年 最低現金残高","0.19億円","2月末。月次固定費の1.0か月分"]];
fin.forEach((f,i)=>{
  const y=2.14+i*0.54;
  s.addText(f[0],{x:8.44,y:y,w:1.75,h:0.26,isTextBox:true,margin:0,fontFace:SANS,fontSize:10,color:MUTE,valign:"middle"});
  s.addText(f[1],{x:10.16,y:y,w:1.30,h:0.26,isTextBox:true,margin:0,fontFace:SANS,fontSize:11.5,bold:true,
    color:(i===3||i===4)?GRN:INK,align:"right",valign:"middle"});
  s.addText(f[2],{x:8.44,y:y+0.24,w:4.0,h:0.24,isTextBox:true,margin:0,fontFace:SANS,fontSize:8.5,color:MUTE});
});

s.addShape(p.ShapeType.roundRect,{x:8.20,y:4.90,w:4.51,h:1.36,rectRadius:0.05,fill:{color:W},line:{color:LINE,width:0.75}});
s.addText("日程",{x:8.44,y:5.00,w:4.0,h:0.24,isTextBox:true,margin:0,fontFace:SANS,fontSize:10,bold:true,color:GOLD});
[["意向表明書提出","2026年9月30日"],["DD","10月上旬〜11月中旬"],["最終契約締結","2026年12月中旬"],["クロージング","2026年12月末（合意済）"]].forEach((c,i)=>{
  const y=5.24+i*0.245;
  s.addText(c[0],{x:8.44,y:y,w:2.1,h:0.26,isTextBox:true,margin:0,fontFace:SANS,fontSize:9.5,color:MUTE,valign:"middle"});
  s.addText(c[1],{x:10.50,y:y,w:1.97,h:0.26,isTextBox:true,margin:0,fontFace:SANS,fontSize:9.5,bold:true,color:INK,align:"right",valign:"middle"});
});

s.addShape(p.ShapeType.roundRect,{x:M,y:6.30,w:SW-2*M,h:0.56,rectRadius:0.04,fill:{color:BERRY}});
s.addText([{text:"みずほ銀行への依頼は20.0億円ではなく41.4億円　",options:{bold:true,fontSize:11,color:W}},
 {text:"タームローン20.0億円に加え、クロージング時の資金繰りを埋めるブリッジローン21.4億円が必要。ブリッジは合併直後に対象会社の余剰現金で全額返済し、残る有利子負債は20.0億円となる。",
  options:{fontSize:10,color:"EBDCE1"}}],
 {x:M+0.26,y:6.36,w:SW-2*M-0.52,h:0.44,isTextBox:true,margin:0,lineSpacing:15,valign:"middle"});
footer(s);
}

/* ===== p.18  留保現金の感応度 ===== */
{
const s=p.addSlide();
header(s,"SENSITIVITY","対象会社に留保する現金をいくらにするか",
  "留保額を1億円増やすと、中野氏の必要拠出額も1億円増え、2027年の最低現金残高も1億円増える。合併後の有利子負債20.0億円と初年度DSCR1.36倍は、いずれの場合も変わらない。");
s.addTable([
 [hd("留保する現金"),hd("ブリッジローン"),hd("中野氏の拠出"),hd("合併後の有利子負債"),hd("ネット/EBITDA"),hd("2027年の最低現金残高"),hd("判定")],
 [{text:"1.0億円",options:{bold:true,fill:{color:"EFE6E9"}}},num("21.43億円",{fill:{color:"EFE6E9"}}),num("0.07億円",{bold:true,fill:{color:"EFE6E9"}}),
  num("20.0億円",{fill:{color:"EFE6E9"}}),num("3.6倍",{fill:{color:"EFE6E9"}}),num("0.19億円",{bold:true,color:RED,fill:{color:"EFE6E9"}}),
  {text:"× 固定費1.0か月分",options:{bold:true,color:RED,fill:{color:"EFE6E9"},fontSize:10}}],
 [{text:"2.0億円",options:{bold:true}},num("20.43億円"),num("1.07億円"),num("20.0億円"),num("3.4倍"),num("1.19億円",{color:GRN}),
  {text:"○ 固定費6.2か月分",options:{color:GRN,fontSize:10}}],
 [{text:"3.0億円",options:{bold:true}},num("19.43億円"),num("2.07億円"),num("20.0億円"),num("3.2倍"),num("2.19億円",{color:GRN}),
  {text:"◎ 余裕あり",options:{color:GRN,fontSize:10}}],
 [{text:"6.0億円",options:{bold:true}},num("16.43億円"),num("5.07億円"),num("20.0億円"),num("2.6倍"),num("5.19億円",{color:GRN}),
  {text:"◎ ご相談案（p.24）",options:{color:GRN,fontSize:10}}]
],tOpt({x:M,y:2.10,w:12.09,colW:[1.55,1.75,1.55,2.00,1.35,2.10,1.79],rowH:0.44,fontSize:10}));
s.addText("※ 最低現金残高は2月末。2月に2026年12月期の未払税金1.14億円を納付する一方、借入の元利返済は毎月発生するため、年間で最も薄くなる。",
  {x:M,y:4.30,w:12.09,h:0.26,isTextBox:true,margin:0,fontFace:SANS,fontSize:9,color:MUTE});

const pts=[
 ["① 1.0億円では2月末に1,900万円まで落ちる",
  "借入の返済が毎月であるため、2026年12月期の未払税金1.14億円を納付する2月に底が来る。残高1,900万円は月次固定費の1.0か月分にすぎず、ワインの一次価格アロケーションがまとまって入荷する月や突発的な修繕が重なれば、一時的な借入が避けられない。留保を2.0億円とすれば底は1.19億円（6.2か月分）となる。"],
 ["② 留保を厚くしても総ご相談額は増えない",
  "ブリッジローンは対象会社の現預金を買収後にしか使えないために生じる立替えであり、留保額を増やした分だけブリッジは減る。留保を1.0億円から6.0億円へ引き上げ、恒久タームローンを20.0億円から25.0億円へ振り替えれば、みずほ銀行様への総ご相談額41.4億円は変わらないまま、初年度末の残高は0.66億円から5.81億円になる。詳細は24ページに記載した。"],
 ["③ 中野氏の拠出が700万円になることの副作用",
  "榊原氏が10.0億円を払い込むのに対し、中野氏の拠出は資本金10万円と株主貸付700万円のみとなる。67%／33%という配分は合意によるものだが、その根拠を株主間契約でより丁寧に定める必要が生じる。"]
];
pts.forEach((t,i)=>{
  const x=M+i*4.08;
  s.addShape(p.ShapeType.roundRect,{x,y:4.68,w:3.85,h:2.18,rectRadius:0.05,fill:{color:TINT},line:{color:LINE,width:0.75}});
  s.addText(t[0],{x:x+0.22,y:4.80,w:3.42,h:0.46,isTextBox:true,margin:0,fontFace:SANS,fontSize:10.5,bold:true,color:BERRY,lineSpacing:14});
  s.addText(t[1],{x:x+0.22,y:5.30,w:3.42,h:1.46,isTextBox:true,margin:0,fontFace:SANS,fontSize:8.5,color:INK,lineSpacing:12});
});
footer(s);
}

/* ===== p.19  株主構成 ===== */
{
const s=p.addSlide();
header(s,"SHAREHOLDERS","株主構成 ― 譲受価額50.0億円の場合と55.0億円の場合",
  "上限で決着した場合、差額5.0億円は第三者割当増資により、外部の追加投資家から同一のバリュエーションで調達する。");

function panel(px, title, segs, rows){
  s.addShape(p.ShapeType.roundRect,{x:px,y:1.70,w:5.90,h:3.30,rectRadius:0.05,fill:{color:W},line:{color:LINE,width:0.75}});
  s.addText(title,{x:px+0.24,y:1.82,w:5.4,h:0.28,isTextBox:true,margin:0,fontFace:SERIF,fontSize:15,bold:true,color:INK});
  let bx=px+0.12, BW=5.66;
  segs.forEach(g=>{
    const w=g[1]*BW;
    s.addShape(p.ShapeType.rect,{x:bx,y:2.22,w:w,h:0.50,fill:{color:g[2]}});
    s.addText(g[3],{x:bx,y:2.22,w:w,h:0.50,isTextBox:true,margin:0,align:"center",valign:"middle",
      fontFace:SANS,fontSize:g[1]>0.2?11.5:9,bold:true,color:W});
    bx+=w;
  });
  s.addTable(rows,tOpt({x:px+0.12,y:2.92,w:5.66,colW:[1.70,2.76,1.20],rowH:0.40,fontSize:9.5}));
}
const NK="出資10万円＋株主貸付5.07億円";
panel(M,"① 譲受価額 50.0億円",
 [["中野",0.6667,BERRY,"中野 66.7%"],["榊原",0.3333,ROSE,"榊原 33.3%"]],
 [[hd("株主"),hd("拠出額"),hd("持分")],
  [{text:"中野 邦人 氏",options:{bold:true}},{text:NK,options:{fontSize:9}},num("66.7%",{bold:true})],
  [{text:"榊原 氏",options:{bold:true}},"10.00億円",num("33.3%",{bold:true,color:BERRY})],
  [{text:"合計",options:{bold:true,fill:{color:TINT}}},{text:"15.07億円",options:{fill:{color:TINT}}},num("100%",{bold:true,fill:{color:TINT}})]]);
panel(6.81,"② 譲受価額 55.0億円",
 [["中野",0.5714,BERRY,"中野 57.1%"],["榊原",0.2857,ROSE,"榊原 28.6%"],["追加",0.1429,GOLD,"14.3%"]],
 [[hd("株主"),hd("拠出額"),hd("持分")],
  [{text:"中野 邦人 氏",options:{bold:true}},{text:NK,options:{fontSize:9}},num("57.1%",{bold:true})],
  [{text:"榊原 氏",options:{bold:true}},"10.00億円",num("28.6%",{bold:true,color:AMB})],
  [{text:"追加投資家",options:{bold:true}},{text:"5.00億円（第三者割当増資）",options:{fontSize:9}},num("14.3%",{bold:true,color:GOLD})],
  [{text:"合計",options:{bold:true,fill:{color:TINT}}},{text:"20.07億円",options:{fill:{color:TINT}}},num("100%",{bold:true,fill:{color:TINT}})]]);

const cards=[
 ["銀行から見た財務は、どちらでも変わらない",
  "差額5.0億円を全額エクイティで吸収するため、みずほ銀行への依頼額41.4億円、合併後の有利子負債20.0億円、初年度DSCR1.36倍は、いずれのケースでも同一となる。"],
 ["同一バリュエーションでの追加調達",
  "榊原氏の10.0億円＝33.3%が示すポストマネー30.0億円を基準とし、追加投資家は同じ条件で5.0億円を引き受ける。既存株主は一律に希薄化する（30.0億円 → 35.0億円）。"]
];
cards.forEach((c,i)=>{
  const x=M+i*6.19;
  s.addShape(p.ShapeType.roundRect,{x,y:5.14,w:5.90,h:1.08,rectRadius:0.05,fill:{color:TINT},line:{color:LINE,width:0.75}});
  s.addText(c[0],{x:x+0.22,y:5.24,w:5.46,h:0.26,isTextBox:true,margin:0,fontFace:SANS,fontSize:10.5,bold:true,color:BERRY});
  s.addText(c[1],{x:x+0.22,y:5.50,w:5.46,h:0.62,isTextBox:true,margin:0,fontFace:SANS,fontSize:9,color:INK,lineSpacing:12.5});
});
s.addShape(p.ShapeType.roundRect,{x:M,y:6.32,w:SW-2*M,h:0.56,rectRadius:0.04,fill:{color:BERRY}});
s.addText([{text:"先に握っておくこと　",options:{bold:true,fontSize:11,color:W}},
 {text:"55.0億円ケースでは榊原氏の持分が28.6%となり、会社法上の特別決議に対する拒否権（1/3超）を失う。中野氏も57.1%となり単独での2/3可決ができなくなる。追加投資家を受け入れる際の優先引受権の扱いを、株主間契約に先に定めておく必要がある。",
  options:{fontSize:10,color:"EBDCE1"}}],
 {x:M+0.26,y:6.38,w:SW-2*M-0.52,h:0.44,isTextBox:true,margin:0,lineSpacing:15,valign:"middle"});
footer(s);
}

/* ===== p.20  返済プロファイル ===== */
{
const s = p.addSlide();
header(s, "CHECK B ①　返済プロファイル", "初年度からDSCR 1.36倍を確保する返済設計",
  "合併後の有利子負債20.0億円を、タームローンA 14.0億円（7年・元金均等・毎月返済）とタームローンB 6.0億円（期限一括）に分ける。返済は毎月、元本16.7百万円と前月末残高に対する利息。");
const tiles=[["初年度DSCR","1.36倍","元利返済2.57億円 vs FCF 3.50億円"],
             ["7年間の累積余剰CF","7.75億円","期限一括6.00億円を上回る"],
             ["ネット Debt/EBITDA","3.6倍","有利子負債20.0億円−留保現金1.0億円"]];
tiles.forEach((t,i)=>{
  const x = M + i*4.08;
  card(s, x, 1.95, 3.85, 1.12, "FFFFFF");
  s.addText(t[0], {x:x+0.24, y:2.07, w:3.4, h:0.24, isTextBox:true, margin:0, fontFace:SANS, fontSize:9.5, bold:true, color:GOLD});
  s.addText(t[1], {x:x+0.24, y:2.32, w:3.4, h:0.44, isTextBox:true, margin:0, fontFace:SERIF, fontSize:24, bold:true, color:BERRY});
  s.addText(t[2], {x:x+0.24, y:2.76, w:3.5, h:0.26, isTextBox:true, margin:0, fontFace:SANS, fontSize:9, color:MUTE});
});
s.addText("返済方式別の比較（借入20.00億円・7年・金利3%・毎月返済）", {x:M, y:3.22, w:6.2, h:0.28, isTextBox:true, margin:0,
  fontFace:SERIF, fontSize:13, bold:true, color:INK});
s.addTable([
 [hd("返済方式"), hd("初年度返済"), hd("初年度DSCR"), hd("7年後残高")],
 [{text:"① 元金均等（20億を全額償却）",options:{fontSize:9}}, num("3.43億",{fontSize:9}), num("1.02",{color:RED,bold:true,fontSize:9}), num("0",{fontSize:9})],
 [{text:"② 元利均等（20億を全額償却）",options:{fontSize:9}}, num("3.17億",{fontSize:9}), num("1.10",{color:AMB,fontSize:9}), num("0",{fontSize:9})],
 [{text:"③ TLA 14億＋TLB 6億（期限一括）",options:{fontSize:9,bold:true,fill:{color:TINT}}}, num("2.57億",{fontSize:9,fill:{color:TINT}}), num("1.36",{color:GRN,bold:true,fontSize:9,fill:{color:TINT}}), num("6.00億",{fontSize:9,fill:{color:TINT}})],
 [{text:"④ TLA 12億＋TLB 8億（期限一括）",options:{fontSize:9}}, num("2.29億",{fontSize:9}), num("1.53",{color:GRN,fontSize:9}), num("8.00億",{fontSize:9})]
], tOpt({x:M, y:3.56, w:6.2, colW:[2.9,1.0,1.15,1.15], rowH:0.40, fontSize:9}));
card(s, M, 5.70, 6.2, 0.95);
s.addText("③を推奨する理由", {x:M+0.22, y:5.82, w:3.0, h:0.24, isTextBox:true, margin:0, fontFace:SANS, fontSize:9.5, bold:true, color:GOLD});
s.addText("元本を14.0億円に絞ることで年間の元本負担が2.00億円に下がり、DSCRは7年間を通じて1.36倍から1.58倍で推移する。残る6.00億円は7年間の余剰キャッシュフローで返済でき、リファイナンスを前提としない。",
  {x:M+0.22, y:6.06, w:5.8, h:0.55, isTextBox:true, margin:0, fontFace:SANS, fontSize:9.5, color:INK, lineSpacing:13.5});
s.addText("推奨ストラクチャー③の7年返済計画（億円）", {x:7.02, y:3.22, w:5.7, h:0.28, isTextBox:true, margin:0,
  fontFace:SERIF, fontSize:13, bold:true, color:INK});
const sc=[[1,20.00,2.00,0.57,2.57,1.36,0.93],[2,18.00,2.00,0.51,2.51,1.39,1.91],[3,16.00,2.00,0.45,2.45,1.43,2.96],
          [4,14.00,2.00,0.39,2.39,1.46,4.07],[5,12.00,2.00,0.33,2.33,1.50,5.24],[6,10.00,2.00,0.27,2.27,1.54,6.47],
          [7, 8.00,2.00,0.21,2.21,1.58,7.75]];
const amo=[[hd("年度"), hd("期首残高"), hd("元本"), hd("利息"), hd("返済計"), hd("DSCR"), hd("累積余剰CF")]].concat(
  sc.map(r=>[{text:String(r[0])+"年目",options:{fontSize:9}}, num(r[1].toFixed(2),{fontSize:9}), num(r[2].toFixed(2),{fontSize:9}),
             num(r[3].toFixed(2),{fontSize:9}), num(r[4].toFixed(2),{fontSize:9}),
             num(r[5].toFixed(2),{fontSize:9,bold:true,color:GRN}), num("+"+r[6].toFixed(2),{fontSize:9})]),
  [[{text:"累計",options:{bold:true,fill:{color:TINT},fontSize:9}}, num("—",{fill:{color:TINT},fontSize:9}), num("14.00",{bold:true,fill:{color:TINT},fontSize:9}),
    num("2.75",{fill:{color:TINT},fontSize:9}), num("16.75",{bold:true,fill:{color:TINT},fontSize:9}), num("—",{fill:{color:TINT},fontSize:9}),
    num("+7.75",{bold:true,color:GRN,fill:{color:TINT},fontSize:9})]]);
s.addTable(amo, tOpt({x:7.02, y:3.56, w:5.7, colW:[0.78,0.86,0.72,0.72,0.82,0.7,1.1], rowH:0.33, fontSize:9}));
s.addText("7年間の累積余剰キャッシュフロー7.75億円が、期限一括のタームローンB 6.00億円を上回る。リファイナンスを前提とせず、7年で20.00億円を完済できる。",
  {x:7.02, y:6.56, w:5.7, h:0.4, isTextBox:true, margin:0, fontFace:SANS, fontSize:9, color:MUTE, lineSpacing:12.5});
footer(s);
}

/* ===== p.21  月次CF ===== */
{
const s = p.addSlide();
header(s, "CHECK B ②　初年度の資金繰り", "2027年の月次キャッシュフロー ― 底は2月末の0.19億円",
  "計画どおりに推移した場合の初年度の資金繰り。借入の元利返済は毎月発生し、2026年12月期の未払税金1.14億円を2月に納付するため、2月末が年間で最も薄くなる。");
const tiles=[["最低現金残高","0.19億円","2月末。月次固定費の1.0か月分"],
             ["年間の営業キャッシュフロー","5.28億円","元利返済2.57億円"],
             ["期末現金残高","1.65億円","期首1.00億円から+0.65億円"]];
tiles.forEach((t,i)=>{
  const x = M + i*4.08;
  const hot=(i===0);
  s.addShape(p.ShapeType.roundRect,{x, y:1.95, w:3.85, h:1.12, rectRadius:0.05,
    fill:{color:hot?BERRY:"FFFFFF"}, line:{color:hot?BERRY:LINE, width:0.75}});
  s.addText(t[0], {x:x+0.24, y:2.07, w:3.4, h:0.24, isTextBox:true, margin:0, fontFace:SANS, fontSize:9.5, bold:true, color:hot?"E8D6DB":GOLD});
  s.addText(t[1], {x:x+0.24, y:2.32, w:3.4, h:0.44, isTextBox:true, margin:0, fontFace:SERIF, fontSize:24, bold:true, color:hot?W:BERRY});
  s.addText(t[2], {x:x+0.24, y:2.76, w:3.5, h:0.26, isTextBox:true, margin:0, fontFace:SANS, fontSize:9, color:hot?"C9AEB6":MUTE});
});
const MO=["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"];
const R=[["営業利益",[35,41,47,44,44,47,47,32,44,47,44,56],"528"],
         ["法人税等の納付",[0,-114,0,0,0,0,0,-92,0,0,0,0],"▲206"],
         ["元利返済（毎月）",[-22,-22,-22,-22,-22,-21,-21,-21,-21,-21,-21,-21],"▲257"],
         ["当月収支",[13,-95,25,22,23,26,26,-81,23,26,23,35],"+65"],
         ["現金 期末残高",[113,19,44,67,89,115,140,59,82,107,130,165],"165"]];
const rows=[[hd("百万円")].concat(MO.map(m=>hd(m)),[hd("合計")])].concat(
  R.map((r,ri)=>[{text:r[0],options:{bold:ri>=3,fontSize:9.5}}].concat(
    r[1].map(v=>num(v===0?"—":(v<0?"▲"+Math.abs(v):String(v)),
      {fontSize:9, bold:ri>=3, color: ri===4?(v<25?RED:INK) : (v<0?RED:INK),
       fill: ri===4?{color:TINT}:undefined})),
    [num(r[2],{fontSize:9,bold:true,fill:{color:TINT}})])));
s.addTable(rows, tOpt({x:M, y:3.26, w:12.09, colW:[1.66].concat(new Array(12).fill(0.77),[1.19]), rowH:0.40, fontSize:9}));
s.addText("※ 端数処理のため、内訳の合計と合計欄が一致しない場合がある。消費税は預り金の性質を持つため計上していない。",
  {x:M, y:5.78, w:12.09, h:0.24, isTextBox:true, margin:0, fontFace:SANS, fontSize:8.5, color:MUTE});
const cards=[["2月に底が来る理由",
  "2026年12月期の未払法人税等・未払消費税1.14億円を2月に納付する一方、借入の元利返済0.22億円は毎月発生する。対象会社に留保する運転資金を1.00億円としているため、2月末の残高は0.19億円となる。留保を2.00億円とすれば底は1.19億円となる。"],
 ["税務上ののれんは織り込んでいない",
  "譲受代金と時価純資産の差額26.85億円は、事業譲渡型であれば5年で損金算入できるが、本件は適格合併に該当するため計上されない。当社は保守的に、合併による支払利息の損金算入のみを織り込んでいる。詳細は23ページに記載した。"]];
cards.forEach((c,i)=>{
  const x=M+i*6.19;
  s.addShape(p.ShapeType.roundRect,{x, y:6.06, w:5.90, h:0.86, rectRadius:0.05, fill:{color:TINT}, line:{color:LINE, width:0.75}});
  s.addText(c[0], {x:x+0.22, y:6.14, w:5.46, h:0.24, isTextBox:true, margin:0, fontFace:SANS, fontSize:10, bold:true, color:BERRY});
  s.addText(c[1], {x:x+0.22, y:6.38, w:5.46, h:0.50, isTextBox:true, margin:0, fontFace:SANS, fontSize:8.5, color:INK, lineSpacing:11.5});
});
footer(s);
}


/* ===== NEW A  キャッシュフロー計算書 ===== */
{
const s=p.addSlide();
header(s,"CASH FLOW ②","キャッシュフロー計算書 ― 借入返済後も毎期プラスを確保する",
  "合併後の対象会社の年次資金収支。維持更新投資を年0.30億円、支払利息の損金算入を織り込んだ推奨案（借入25.0億円・10年）ベース。");
const R=[["営業利益","5.28","5.28","5.28","5.28","5.28","5.28","5.28"],
 ["減価償却費","0.01","0.01","0.01","0.01","0.01","0.01","0.01"],
 ["支払利息","△0.75","△0.70","△0.65","△0.59","△0.54","△0.49","△0.43"],
 ["法人税等の支払","△2.60","△1.55","△1.57","△1.59","△1.61","△1.62","△1.64"],
 ["営業キャッシュフロー","1.94","3.04","3.07","3.11","3.14","3.18","3.22"],
 ["設備投資","△0.30","△0.30","△0.30","△0.30","△0.30","△0.30","△0.30"],
 ["フリーキャッシュフロー","1.64","2.74","2.77","2.81","2.84","2.88","2.92"],
 ["借入元本の返済","△1.75","△1.75","△1.75","△1.75","△1.75","△1.75","△1.75"],
 ["現金の増減","△0.11","0.99","1.02","1.06","1.09","1.13","1.17"],
 ["期末現金残高","5.81","6.79","7.81","8.87","9.96","11.08","12.24"]];
const EM=new Set([4,6,9]);
const rows=[[hd(""),hd("2027"),hd("2028"),hd("2029"),hd("2030"),hd("2031"),hd("2032"),hd("2033")]]
 .concat(R.map((r,ri)=>[{text:r[0],options:{bold:EM.has(ri),fontSize:10,
     fill:EM.has(ri)?{color:TINT}:undefined}}].concat(r.slice(1).map(v=>num(v,{
     bold:EM.has(ri),fontSize:10,color:ri===9?BERRY:(v.startsWith("△")?INK:INK),
     fill:EM.has(ri)?{color:TINT}:undefined})))));
s.addTable(rows,tOpt({x:M,y:1.72,w:12.09,colW:[3.09,1.29,1.29,1.29,1.29,1.29,1.29,1.26],rowH:0.335,fontSize:10}));
s.addText("※ 単位：億円。2027年の法人税等には2026年12月期の未払法人税1.14億円の納付を含む。2034年〜2036年も同水準で推移し、期限一括返済分7.50億円は2036年末の現金残高で返済可能（返済後8.42億円）。",
  {x:M,y:5.50,w:12.09,h:0.40,isTextBox:true,margin:0,fontFace:SANS,fontSize:9,color:MUTE,lineSpacing:12});
[["借入返済後も毎期プラス","2027年のみ前期未払税金1.14億円の納付により△0.11億円となるが、2028年以降は年約1.0億円ずつ現金が積み上がる。"],
 ["10年間の利息総額 5.36億円","元本25.00億円に対する支払利息の総額。金利3%・元金均等（期限一括分7.50億円を含む）を前提としている。"],
 ["最終年度末の手元 8.42億円","期限一括返済分7.50億円を自己資金で完済したうえで、なお8.42億円が残る。借換えを前提としない設計。"]
].forEach((t,i)=>{
  const x=M+i*4.08;
  s.addShape(p.ShapeType.roundRect,{x,y:6.00,w:3.85,h:0.90,rectRadius:0.05,fill:{color:TINT},line:{color:LINE,width:0.75}});
  s.addText(t[0],{x:x+0.22,y:6.10,w:3.42,h:0.24,isTextBox:true,margin:0,fontFace:SANS,fontSize:10.5,bold:true,color:BERRY});
  s.addText(t[1],{x:x+0.22,y:6.36,w:3.42,h:0.48,isTextBox:true,margin:0,fontFace:SANS,fontSize:8.5,color:INK,lineSpacing:11.5});
});
footer(s);
}

/* ===== NEW B  税務ストラクチャー ===== */
{
const s=p.addSlide();
header(s,"TAX","税効果の整理 ― 取れるものと、取れないもの",
  "本件のキャッシュフローに影響する税務論点を2つに切り分けた。当社は保守的に、確実に取れるものだけを織り込んでいる。");

card(s,M,1.68,5.95,2.35,"FFFFFF");
s.addShape(p.ShapeType.rect,{x:M,y:1.68,w:5.95,h:0.05,fill:{color:GRN}});
badge(s,M+0.24,1.90,"○",GRN);
s.addText("取れる：支払利息の損金算入",{x:M+0.66,y:1.90,w:5.0,h:0.30,isTextBox:true,margin:0,
  fontFace:SERIF,fontSize:15,bold:true,color:INK});
s.addText("SPCが借り入れ、対象会社が利益を稼ぐ状態では、両者の損益は通算できない。クロージング後にSPCと対象会社を合併することで、支払利息が対象会社の営業利益と相殺され、損金算入が可能となる（デット・プッシュダウン）。",
  {x:M+0.24,y:2.34,w:5.50,h:0.86,isTextBox:true,margin:0,fontFace:SANS,fontSize:10,color:INK,lineSpacing:14});
s.addText([{text:"効果　",options:{fontSize:10,color:MUTE}},
 {text:"初年度0.21億円・10年間で1.82億円。DSCRは1.31倍から1.38倍へ改善する。",options:{fontSize:10,bold:true,color:GRN}}],
 {x:M+0.24,y:3.28,w:5.50,h:0.50,isTextBox:true,margin:0,fontFace:SANS,lineSpacing:14});

card(s,6.95,1.68,5.76,2.35,"FFFFFF");
s.addShape(p.ShapeType.rect,{x:6.95,y:1.68,w:5.76,h:0.05,fill:{color:AMB}});
badge(s,7.19,1.90,"×",AMB);
s.addText("取れない：資産調整勘定（税務上ののれん）",{x:7.61,y:1.90,w:5.0,h:0.30,isTextBox:true,margin:0,
  fontFace:SERIF,fontSize:15,bold:true,color:INK});
s.addText("譲受代金50.0億円と時価純資産23.15億円の差額26.85億円は、税務上ののれんとして5年で損金算入できれば年5.37億円の効果を持つ。しかし資産調整勘定は非適格の組織再編または事業の譲受けにおいてのみ生じる（法人税法62条の8）。",
  {x:7.19,y:2.34,w:5.30,h:0.86,isTextBox:true,margin:0,fontFace:SANS,fontSize:10,color:INK,lineSpacing:14});
s.addText([{text:"本件は　",options:{fontSize:10,color:MUTE}},
 {text:"SPCが100%子会社化したうえでの合併＝適格合併に該当し、資産は帳簿価額で引き継がれる。したがって生じない。",
  options:{fontSize:10,bold:true,color:AMB}}],
 {x:7.19,y:3.28,w:5.30,h:0.50,isTextBox:true,margin:0,fontFace:SANS,lineSpacing:14});

s.addText("DSCRの内訳",{x:M,y:4.24,w:6,h:0.28,isTextBox:true,margin:0,fontFace:SERIF,fontSize:13.5,bold:true,color:INK});
s.addTable([
 [hd("項目"),hd("初年度DSCR"),hd("内容")],
 [{text:"当初モデル",options:{fontSize:10}},num("1.34倍",{fontSize:10}),
  {text:"FCF 3.50億円（営業利益×(1−実効税率34%)）を返済原資とし、税効果も設備投資も織り込まない",options:{fontSize:10}}],
 [{text:"＋ 支払利息の損金算入",options:{fontSize:10,color:GRN}},num("＋0.08",{fontSize:10,color:GRN}),
  {text:"合併により支払利息0.75億円が損金となり、法人税が年0.21億円減少する",options:{fontSize:10}}],
 [{text:"△ 維持更新投資の計上",options:{fontSize:10,color:AMB}},num("△0.11",{fontSize:10,color:AMB}),
  {text:"開示資料は設備投資ゼロだが、店舗の経年を踏まえ年0.30億円を保守的に見込んだ",options:{fontSize:10}}],
 [{text:"当社が採用する前提",options:{bold:true,fontSize:10,fill:{color:TINT}}},
  num("1.38倍",{bold:true,fontSize:10,color:BERRY,fill:{color:TINT}}),
  {text:"借入25.0億円・10年・金利3%。資産調整勘定は織り込まない",options:{bold:true,fontSize:10,fill:{color:TINT}}}]
],tOpt({x:M,y:4.58,w:12.09,colW:[2.90,1.75,7.44],rowH:0.42,fontSize:10}));
s.addText("※ 事業譲渡型とすれば資産調整勘定を計上できるが、売主に多額の譲渡益課税が生じ、飲食店営業許可の再取得と全取引契約の再締結を要するため、本件では採用しない。仮に計上できた場合、初年度DSCRは2.03倍となる。",
  {x:M,y:6.76,w:12.09,h:0.30,isTextBox:true,margin:0,fontFace:SANS,fontSize:9,color:MUTE,lineSpacing:12});
footer(s);
}

/* ===== NEW C  ご融資条件のご相談 ===== */
{
const s=p.addSlide();
header(s,"FUNDING PROPOSAL","ご相談 ― 総額を変えずに、ブリッジを恒久ローンへ",
  "みずほ銀行様への総ご相談額41.4億円は案1と案2で変わらない。内訳を組み替えるだけで、DSCRと対象会社の手元資金がともに改善する。");
s.addTable([
 [hd(""),hd("案1　当初案"),hd("案2　ご相談したい案"),hd("案3　55億円で決着した場合")],
 [{text:"恒久タームローン",options:{bold:true,fontSize:10}},num("20.0億円",{fontSize:10}),
  num("25.0億円",{fontSize:10,bold:true,color:BERRY}),num("30.0億円",{fontSize:10})],
 [{text:"　返済期間",options:{fontSize:10}},num("7年",{fontSize:10}),
  num("10年",{fontSize:10,bold:true,color:BERRY}),num("10年",{fontSize:10})],
 [{text:"　内訳",options:{fontSize:10}},num("TLA14.0／TLB6.0",{fontSize:9.5}),
  num("TLA17.5／TLB7.5",{fontSize:9.5}),num("TLA19.5／TLB10.5",{fontSize:9.5})],
 [{text:"ブリッジローン",options:{bold:true,fontSize:10}},num("21.4億円",{fontSize:10}),
  num("16.4億円",{fontSize:10}),num("16.4億円",{fontSize:10})],
 [{text:"総ご相談額",options:{bold:true,fontSize:10,fill:{color:TINT}}},
  num("41.4億円",{bold:true,fontSize:10,fill:{color:TINT}}),
  num("41.4億円",{bold:true,fontSize:10,color:BERRY,fill:{color:TINT}}),
  num("46.4億円",{bold:true,fontSize:10,fill:{color:TINT}})],
 [{text:"初年度DSCR",options:{bold:true,fontSize:10}},num("1.31倍",{fontSize:10}),
  num("1.38倍",{fontSize:10,bold:true,color:GRN}),num("1.23倍",{fontSize:10})],
 [{text:"Debt／EBITDA",options:{fontSize:10}},num("3.78倍",{fontSize:10}),
  num("4.73倍",{fontSize:10}),num("5.67倍",{fontSize:10})],
 [{text:"対象会社に留保する現金",options:{bold:true,fontSize:10}},num("1.0億円",{fontSize:10,color:AMB}),
  num("6.0億円",{fontSize:10,bold:true,color:GRN}),num("6.0億円",{fontSize:10,color:GRN})],
 [{text:"初年度末の現金残高",options:{fontSize:10}},num("0.66億円",{fontSize:10,color:AMB}),
  num("5.81億円",{fontSize:10,color:GRN}),num("5.81億円",{fontSize:10,color:GRN})],
 [{text:"完済時の現金残高",options:{fontSize:10}},num("0.28億円",{fontSize:10,color:AMB}),
  num("8.42億円",{fontSize:10,color:GRN}),num("2.61億円",{fontSize:10})],
 [{text:"中野氏の拠出",options:{fontSize:10}},num("0.07億円",{fontSize:10}),
  num("0.07億円",{fontSize:10}),num("0.07億円",{fontSize:10})],
 [{text:"追加投資家の要否",options:{fontSize:10}},{text:"―",options:{fontSize:10,align:"right"}},
  {text:"―",options:{fontSize:10,align:"right"}},
  {text:"不要（案2＋5.0億円で対応）",options:{fontSize:9.5,align:"right",bold:true,color:GRN}}]
],tOpt({x:M,y:1.78,w:12.09,colW:[3.45,2.88,2.88,2.88],rowH:0.30,fontSize:10}));
[["なぜ総額が変わらないのか",
  "ブリッジローンは、対象会社の現預金を買収後にしか使えないために生じる一時的な立替えである。恒久ローンを5.0億円増やせば、その分ブリッジが5.0億円減る。みずほ銀行様のエクスポージャーは41.4億円のまま変わらない。"],
 ["なぜDSCRが上がるのか",
  "借入額は5.0億円増えるが、返済期間が7年から10年に延びるため、年間の元本返済は2.00億円から1.75億円へ減少する。増加する利息0.15億円を差し引いても、返済負担は年0.10億円軽くなる。"],
 ["なぜ対象会社の手元が厚くなるのか",
  "案1では買収時に対象会社の現金をほぼ全額引き上げるため、初年度2月末の残高は0.19億円（固定費1.0か月分）まで落ちる。案2では6.0億円を残せるため、突発的な修繕やワインの一括仕入にも対応できる。"]
].forEach((t,i)=>{
  const x=M+i*4.08;
  s.addShape(p.ShapeType.roundRect,{x,y:5.84,w:3.85,h:0.98,rectRadius:0.05,fill:{color:TINT},line:{color:LINE,width:0.75}});
  s.addText(t[0],{x:x+0.22,y:5.93,w:3.42,h:0.24,isTextBox:true,margin:0,fontFace:SANS,fontSize:10.5,bold:true,color:BERRY});
  s.addText(t[1],{x:x+0.22,y:6.19,w:3.42,h:0.58,isTextBox:true,margin:0,fontFace:SANS,fontSize:8,color:INK,lineSpacing:10.5});
});
footer(s);
}

/* ===== p.22  ストレス耐性 ===== */
{
const s = p.addSlide();
header(s, "CHECK B ③　ストレス耐性と保全", "収益が悪化した場合の返済可能性と、ご提案できる保全",
  "推奨ストラクチャー（TLA 14.0億円＋TLB 6.0億円／7年・金利3%・毎月返済）に対し、4つのシナリオで返済可能性を検証した。");
s.addTable([
 [hd("シナリオ"), hd("FCF"), hd("DSCR"), hd("7年間の返済可能性")],
 [{text:"平常時",options:{bold:true}}, num("3.50億"), num("1.36〜1.58",{color:GRN,bold:true}),
  {text:"全期間で1.36以上。累積余剰7.75億円で期限一括6.00億円も完済できる",options:{fontSize:10}}],
 [{text:"営業利益▲21%（p.15 ブレークイーブン）",options:{bold:true}}, num("2.76億"), num("1.07〜1.25",{color:GRN,bold:true}),
  {text:"元利返済は全期間で継続できる。累積余剰2.57億円のため、期限一括6.00億円はリファイナンスを要する",options:{fontSize:10}}],
 [{text:"二つ星降格（4年目以降）",options:{bold:true}}, num("2.00億"), num("0.84〜1.43",{color:AMB,bold:true}),
  {text:"4〜7年の累積不足1.21億円は、3年目末までの累積余剰2.96億円で吸収できる。期限一括分はリファイナンスを要する",options:{fontSize:10}}],
 [{text:"星喪失（4年目以降）",options:{bold:true}}, num("1.00億"), num("0.42〜1.43",{color:RED,bold:true}),
  {text:"累積不足5.21億円。3年目末の余剰2.96億円と留保現金1.00億円では不足し、追加の支援を要する",options:{fontSize:10}}]
], tOpt({x:M, y:1.95, w:12.09, colW:[3.1,1.2,1.5,6.29], rowH:0.46, fontSize:10}));
card(s, M, 4.52, 5.95, 1.58);
s.addText("ネットレバレッジ", {x:M+0.24, y:4.64, w:3.0, h:0.24, isTextBox:true, margin:0, fontFace:SANS, fontSize:9.5, bold:true, color:GOLD});
const nl=[["有利子負債（合併後）","20.00億円"],["− 対象会社に留保する現預金","1.00億円"],["＝ 連結ネットデット","19.00億円（3.6倍）"]];
nl.forEach((n,i)=>{
  const y=4.90+i*0.30;
  s.addText(n[0], {x:M+0.24, y:y, w:3.3, h:0.26, isTextBox:true, margin:0, fontFace:SANS, fontSize:i===2?11:10, bold:i===2, color:i===2?BERRY:INK, valign:"middle"});
  s.addText(n[1], {x:M+3.55, y:y, w:2.2, h:0.26, isTextBox:true, margin:0, fontFace:SANS, fontSize:i===2?11:10, bold:i===2, color:i===2?BERRY:INK, align:"right", valign:"middle"});
});
s.addText("ブリッジローン21.43億円は合併直後に全額返済される。",
  {x:M+0.24, y:5.82, w:5.45, h:0.24, isTextBox:true, margin:0, fontFace:SANS, fontSize:9.5, color:MUTE});
card(s, 6.78, 4.52, 5.93, 1.58, "FFFFFF");
s.addText("保全・コベナンツ案（ご提案）", {x:7.02, y:4.64, w:4.0, h:0.24, isTextBox:true, margin:0, fontFace:SANS, fontSize:9.5, bold:true, color:GOLD});
s.addText("① 対象会社株式100%への質権設定　② ワイン在庫（簿価1.19億円）への担保設定　③ DSCR 1.1倍以上の維持　④ タームローンB完済までの配当・自己株取得の制限　⑤ 超過キャッシュフローの50%をタームローンBへ充当（キャッシュスイープ）　⑥ 岸田氏の退任・料理長交代・ミシュラン評価変動の報告義務　⑦ サントリー・ファインズとの取引条件変更時の報告義務　⑧ 中野氏の株主貸付の劣後化",
  {x:7.02, y:4.90, w:5.45, h:1.16, isTextBox:true, margin:0, fontFace:SANS, fontSize:9, color:INK, lineSpacing:12.5});
s.addShape(p.ShapeType.roundRect,{x:M, y:6.26, w:SW-2*M, h:0.60, rectRadius:0.04, fill:{color:BERRY}});
s.addText([{text:"実質的な論点は金額ではなく期間　",options:{bold:true, fontSize:11, color:W}},
 {text:"貴行のスタートアップM&A融資が5年目線の場合、TLA 11.0億円＋TLB 9.0億円で初年度DSCR 1.26倍を確保できるものの、5年後に9.00億円のリファイナンスが必要になる。7年を許容いただけるかが、20.00億円を自力返済で完結させられるかの分岐点となる。",
  options:{fontSize:10, color:"EBDCE1"}}],
 {x:M+0.26, y:6.32, w:SW-2*M-0.52, h:0.48, isTextBox:true, margin:0, lineSpacing:15, valign:"middle"});
footer(s);
}

/* ===== p.23  価格を毀損しうる論点 ===== */
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

/* ===== p.24  参考アピシウス ===== */
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

/* ===== p.25  結論 ===== */
{
const s = p.addSlide(); s.background={color:DARK};
s.addShape(p.ShapeType.ellipse,{x:10.2,y:4.6,w:5.6,h:5.6,fill:{color:BERRY},transparency:66});
s.addText("CONCLUSION", {x:M, y:0.55, w:8, h:0.3, isTextBox:true, margin:0,
  fontFace:SANS, fontSize:11, bold:true, color:GOLD, charSpacing:1.4});
s.addText("結論", {x:M, y:0.85, w:8, h:0.55, isTextBox:true, margin:0,
  fontFace:SERIF, fontSize:32, bold:true, color:W});
const con=[
 ["01","株式譲渡価格50億円は妥当","2026年12月期末の想定財務を前提とすれば、EV/EBITDA 5.2倍、年買法で営業利益5.09年分、DCF加重期待値50.67億円。4手法すべてで説明可能な水準にある。"],
 ["02","許容上限は55億円、理論上限は57.4億円","55億円は三つ星維持確率78%、57.4億円は100%を前提とする。60億円は説明できない。譲受価額は50〜55億円のレンジで提示する。"],
 ["03","価格の45%はキャッシュで裏付けられている","50億円のうち22.43億円は非事業用資産。事業リスクにさらされるのは27.57億円のみで、営業利益が恒久的に21%落ちてもこの水準は正当化される。"],
 ["04","貴行にお願いしたいこと","クロージング時のタームローン20.00億円とブリッジローン21.43億円、計41.43億円。ブリッジは合併直後に対象会社の余剰現金で全額返済され、以後の有利子負債は20.00億円・初年度DSCR1.36倍となります。"]
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
 {text:"・買収ファイナンスは、クロージング時にタームローン20.00億円＋ブリッジローン21.43億円の計41.43億円。ブリッジは合併直後に対象会社の余剰現金で全額返済し、以後の有利子負債は20.00億円。\n",options:{}},
 {text:"・返済はタームローンA 14.00億円を7年・金利3%・元金均等で毎月、タームローンB 6.00億円は期限一括。対象会社に留保する運転資金は1.00億円。\n",options:{}},
 {text:"・本資料は対象会社の事業価値および提示価格の妥当性を検証したもの。買収ストラクチャーおよびエクイティの調達計画は別途。\n",options:{}},
 {text:"・p.24の株式会社アピシウスに関する計数は、同社の取得時（2024年6月）と2026年時点との比較。売上高・営業利益はいずれも取得前比。",options:{}}
], {x:9.09, y:2.2, w:3.4, h:3.9, isTextBox:true, margin:0, valign:"top", fontFace:SANS, fontSize:8.6, color:"B4A0A6", lineSpacing:12.5});
footer(s, true);
}

p.writeFile({fileName:"カンテサンス_銀行ご提出用資料.pptx"}).then(f=>console.log("WROTE",f));
