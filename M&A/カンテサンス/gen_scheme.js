const pptxgen = require("pptxgenjs");
const p = new pptxgen();
p.layout = "LAYOUT_WIDE";
p.title = "カンテサンス M&Aスキーム";
p.author = "株式会社WineBank";

const DARK="2B1520", BERRY="6D2E46", ROSE="A26769", GOLD="B58B2A",
      INK="1F1A1C", MUTE="6E6368", TINT="F7F3F4", LINE="E4DADD", W="FFFFFF",
      GRN="2E6F4E", AMB="A8741A", RED="9B2C2C";
const SERIF="Cambria", SANS="Calibri";
const SW=13.33, M=0.62;
let pageNo=0;
function header(s, kicker, title, lead){
  s.addText(kicker, {x:M, y:0.34, w:10, h:0.26, isTextBox:true, margin:0,
    fontFace:SANS, fontSize:11, bold:true, color:GOLD, charSpacing:1.4});
  s.addText(title, {x:M, y:0.62, w:SW-2*M, h:0.52, isTextBox:true, margin:0,
    fontFace:SERIF, fontSize:29, bold:true, color:INK});
  if(lead) s.addText(lead, {x:M, y:1.19, w:SW-2*M, h:0.36, isTextBox:true, margin:0,
    fontFace:SANS, fontSize:12.5, color:MUTE, lineSpacing:17});
}
function footer(s){
  pageNo++;
  s.addText("カンテサンス（株式会社プティ・ボノム）M&Aスキーム ／ 2026年9月20日 株式会社WineBank",
    {x:M, y:7.02, w:9.5, h:0.25, isTextBox:true, margin:0, fontFace:SANS, fontSize:8, color:MUTE});
  s.addText(String(pageNo), {x:SW-M-0.9, y:7.02, w:0.9, h:0.25, isTextBox:true, margin:0,
    fontFace:SANS, fontSize:9, color:MUTE, align:"right"});
}
const tOpt = (x={}) => Object.assign({fontFace:SANS, fontSize:10.5, color:INK,
  border:{type:"solid", pt:0.5, color:LINE}, valign:"middle", autoPage:false}, x);
const hd = t => ({text:t, options:{bold:true, color:W, fill:{color:BERRY}, fontSize:10}});
const num = (t,o={}) => ({text:t, options:Object.assign({align:"right"}, o)});

/* helpers for the diagram */
function box(s, x,y,w,h, title, sub, opt={}){
  s.addShape(p.ShapeType.roundRect, {x,y,w,h, rectRadius:0.05,
    fill:{color: opt.fill || W}, line:{color: opt.line || BERRY, width: opt.lw || 1.25}});
  s.addText(title, {x:x+0.14, y:y+0.13, w:w-0.28, h:0.30, isTextBox:true, margin:0, align:"center",
    fontFace:SANS, fontSize: opt.ts || 12.5, bold:true, color: opt.tc || INK});
  if(sub) s.addText(sub, {x:x+0.12, y:y+0.43, w:w-0.24, h:h-0.52, isTextBox:true, margin:0, align:"center",
    fontFace:SANS, fontSize: opt.ss || 9.5, color: opt.sc || MUTE, lineSpacing:13});
}
function vArrow(s, x, y1, y2, col){
  s.addShape(p.ShapeType.line, {x, y:y1, w:0, h:y2-y1,
    line:{color: col||BERRY, width:1.5, endArrowType:"triangle"}});
}
function hArrow(s, x1, x2, y, col){
  s.addShape(p.ShapeType.line, {x:Math.min(x1,x2), y, w:Math.abs(x2-x1), h:0,
    line:{color: col||BERRY, width:1.5, endArrowType:"triangle", beginArrowType:"none"}});
}
function lab(s, x, y, w, t, o={}){
  s.addText(t, {x, y, w, h:o.h||0.34, isTextBox:true, margin:0, align:"center",
    fontFace:SANS, fontSize:o.fs||8.5, bold:true, color:o.c||BERRY, lineSpacing:11});
}

/* =========================================================
   S1  スキーム図
========================================================= */
{
const s = p.addSlide();
header(s, "STRUCTURE", "M&Aスキーム",
  "買収目的会社（SPC）を設立し、投資家およびWineBankの出資30.0億円とLBOローン20.0億円をもって、対象会社の全株式を50.0億円で取得する。");

/* Row A */
box(s, 4.30, 1.62, 2.45, 0.80, "投資家", "穐田 誉輝 氏\n榊原 氏", {fill:TINT});
box(s, 7.10, 1.62, 2.45, 0.80, "株式会社WineBank", "買収の実行主体", {fill:TINT});
vArrow(s, 5.525, 2.42, 3.10);
vArrow(s, 8.325, 2.42, 3.10);
lab(s, 5.62, 2.52, 1.50, "出資 10.0億円\n33.3%");
lab(s, 8.42, 2.52, 1.50, "出資 20.0億円\n66.7%");

/* Row B */
box(s, M, 3.10, 2.70, 0.92, "みずほ銀行", "買収ファイナンス", {fill:W, line:ROSE, lw:1});
box(s, 4.30, 3.10, 4.70, 0.92, "買収目的会社（SPC）", "資本金 30.0億円／借入 20.0億円", {fill:BERRY, tc:W, sc:"E3D2D7", ts:14});
box(s, 10.00, 3.10, 2.71, 0.92, "岸田 周三 氏", "対象会社 発行済株式100%を保有", {fill:W, line:ROSE, lw:1});

lab(s, 3.30, 3.16, 1.04, "LBOローン\n20.0億円");
hArrow(s, 3.34, 4.28, 3.66, ROSE);

lab(s, 8.98, 3.14, 1.04, "株式 100%", {h:0.20});
hArrow(s, 9.98, 9.02, 3.40, ROSE);
hArrow(s, 9.02, 9.98, 3.70, BERRY);
lab(s, 8.98, 3.76, 1.04, "譲受代金\n50.0億円");

/* Row C */
vArrow(s, 6.65, 4.02, 4.62);
lab(s, 6.75, 4.10, 2.30, "100%取得 → クロージング後に合併", {h:0.22, c:MUTE});
box(s, 4.30, 4.62, 4.70, 0.90, "株式会社プティ・ボノム（カンテサンス）",
  "岸田氏は3年間、代表取締役として在任", {fill:W, line:BERRY, lw:1.5, ts:12});

/* 役員貸付の精算メモ */
s.addText("※ クロージング時に役員貸付金5.0億円を現金精算", {x:10.00, y:4.62, w:2.71, h:0.44, isTextBox:true, margin:0,
  fontFace:SANS, fontSize:9, color:MUTE, lineSpacing:12});

/* 下部チップ */
const chips=[["株式譲受代金","50.0億円",""],["LBOローン","20.0億円","TLA14億＋TLB6億"],
             ["エクイティ","30.0億円","投資家10.0／WineBank20.0"],["合併後ネットキャッシュ","＋2.4億円","実質無借金を維持"]];
chips.forEach((c,i)=>{
  const x = M + i*3.05;
  const hot = (i===3);
  s.addShape(p.ShapeType.roundRect,{x, y:5.72, w:2.80, h:1.00, rectRadius:0.05,
    fill:{color: hot ? BERRY : TINT}, line:{color: hot ? BERRY : LINE, width:0.75}});
  s.addText(c[0], {x:x+0.20, y:5.82, w:2.4, h:0.24, isTextBox:true, margin:0,
    fontFace:SANS, fontSize:9.5, bold:true, color: hot ? "E8D6DB" : GOLD});
  s.addText(c[1], {x:x+0.20, y:6.04, w:2.4, h:0.40, isTextBox:true, margin:0,
    fontFace:SERIF, fontSize:21, bold:true, color: hot ? W : BERRY});
  if(c[2]) s.addText(c[2], {x:x+0.20, y:6.44, w:2.5, h:0.22, isTextBox:true, margin:0,
    fontFace:SANS, fontSize:8.5, color: hot ? "C9AEB6" : MUTE});
});
footer(s);
}

/* =========================================================
   S2  資金・手順・日程
========================================================= */
{
const s = p.addSlide();
header(s, "STRUCTURE 詳細", "資金の調達と使途、実行手順",
  "対象会社が保有する現預金を買収資金に充当しないため、合併後も実質無借金の状態を維持できる。");

/* Sources & Uses */
s.addText("資金の使途と調達", {x:M, y:1.66, w:5.0, h:0.28, isTextBox:true, margin:0,
  fontFace:SERIF, fontSize:13.5, bold:true, color:INK});
s.addTable([
 [hd("資金使途"), hd("金額"), hd("調達"), hd("金額"), hd("持分")],
 ["株式譲受代金", num("50.0億円"), "LBOローン（みずほ銀行）", num("20.0億円"), num("―")],
 [{text:"",options:{}}, num(""), "投資家 出資", num("10.0億円"), num("33.3%",{bold:true,color:BERRY})],
 [{text:"",options:{}}, num(""), "WineBank 出資", num("20.0億円"), num("66.7%",{bold:true})],
 [{text:"合計",options:{bold:true,fill:{color:TINT}}}, num("50.0億円",{bold:true,fill:{color:TINT}}),
  {text:"合計",options:{bold:true,fill:{color:TINT}}}, num("50.0億円",{bold:true,fill:{color:TINT}}),
  num("100%",{bold:true,fill:{color:TINT}})]
], tOpt({x:M, y:2.00, w:7.30, colW:[1.90,1.15,2.30,1.15,0.80], rowH:0.40, fontSize:10}));
s.addText("※ 取得関連費用（1.5億円程度）はWineBankが自己資金にて別途負担し、持分比率には影響させない。",
  {x:M, y:4.06, w:7.30, h:0.28, isTextBox:true, margin:0, fontFace:SANS, fontSize:9, color:MUTE});

/* 効果 */
s.addText("合併後の財務", {x:M, y:4.38, w:5.0, h:0.28, isTextBox:true, margin:0,
  fontFace:SERIF, fontSize:13.5, bold:true, color:INK});
s.addTable([
 [hd("項目"), hd("金額"), hd("補足")],
 ["有利子負債", num("20.0億円"), {text:"TLA14.0億（元金均等7年）＋TLB6.0億（期限一括）",options:{fontSize:9.5}}],
 ["現預金", num("22.4億円"), {text:"対象会社の現預金17.4億＋役員貸付金5.0億の精算",options:{fontSize:9.5}}],
 [{text:"ネットキャッシュ",options:{bold:true,fill:{color:TINT}}}, num("＋2.4億円",{bold:true,color:GRN,fill:{color:TINT}}),
  {text:"買収後も実質無借金。初年度DSCR 1.35倍",options:{bold:true,fontSize:9.5,fill:{color:TINT}}}]
], tOpt({x:M, y:4.72, w:7.30, colW:[1.65,1.25,4.40], rowH:0.37, fontSize:10}));

/* 実行手順 */
s.addShape(p.ShapeType.roundRect,{x:8.20, y:1.66, w:4.51, h:3.10, rectRadius:0.05,
  fill:{color:TINT}, line:{color:LINE, width:0.75}});
s.addText("実行手順", {x:8.44, y:1.78, w:4.0, h:0.26, isTextBox:true, margin:0,
  fontFace:SANS, fontSize:10, bold:true, color:GOLD});
const steps=[
 ["STEP 1","SPCを設立し、投資家10.0億円・WineBank20.0億円を払込み"],
 ["STEP 2","みずほ銀行よりLBOローン20.0億円を実行"],
 ["STEP 3","株式譲渡実行。同時に役員貸付金5.0億円を現金精算"],
 ["STEP 4","SPCと対象会社を合併し、借入と事業を一体化"],
 ["STEP 5","岸田氏3年ロックアップのもとで運営。後継料理長を招聘"]
];
steps.forEach((t,i)=>{
  const y = 2.10 + i*0.52;
  s.addShape(p.ShapeType.ellipse,{x:8.44, y:y+0.03, w:0.28, h:0.28, fill:{color:BERRY}});
  s.addText(String(i+1), {x:8.44, y:y+0.03, w:0.28, h:0.28, isTextBox:true, margin:0, align:"center",
    valign:"middle", fontFace:SANS, fontSize:11, bold:true, color:W});
  s.addText(t[1], {x:8.82, y:y-0.02, w:3.65, h:0.48, isTextBox:true, margin:0,
    fontFace:SANS, fontSize:9.5, color:INK, lineSpacing:13});
});

/* 日程と論点 */
s.addShape(p.ShapeType.roundRect,{x:8.20, y:4.90, w:4.51, h:1.30, rectRadius:0.05,
  fill:{color:W}, line:{color:LINE, width:0.75}});
s.addText("日程", {x:8.44, y:5.00, w:4.0, h:0.24, isTextBox:true, margin:0,
  fontFace:SANS, fontSize:10, bold:true, color:GOLD});
const sch=[["意向表明書提出","2026年9月30日"],["DD","10月上旬〜11月中旬"],["クロージング","11月末（最短）〜年末"]];
sch.forEach((c,i)=>{
  const y=5.26+i*0.29;
  s.addText(c[0], {x:8.44, y:y, w:2.1, h:0.26, isTextBox:true, margin:0, fontFace:SANS, fontSize:9.5, color:MUTE, valign:"middle"});
  s.addText(c[1], {x:10.50, y:y, w:1.97, h:0.26, isTextBox:true, margin:0, fontFace:SANS, fontSize:9.5, bold:true, color:INK, align:"right", valign:"middle"});
});

/* 論点バー */
s.addShape(p.ShapeType.roundRect,{x:M, y:6.30, w:SW-2*M, h:0.58, rectRadius:0.04, fill:{color:BERRY}});
s.addText([{text:"残る論点　",options:{bold:true, fontSize:11, color:W}},
 {text:"① WineBank出資20.0億円の資金手当て　② 株主間契約（取締役指名・譲渡制限・出口）　③ 譲受価額が50.0億円を超える場合、投資家10.0億円の持分は33.3%を下回る（53.0億円なら30.3%）",
  options:{fontSize:10, color:"EBDCE1"}}],
 {x:M+0.26, y:6.36, w:SW-2*M-0.52, h:0.46, isTextBox:true, margin:0, lineSpacing:15, valign:"middle"});
footer(s);
}

p.writeFile({fileName:"カンテサンス_M&Aスキーム図.pptx"}).then(f=>console.log("WROTE", f));
