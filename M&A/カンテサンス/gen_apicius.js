const pptxgen = require("pptxgenjs");
const p = new pptxgen();
p.layout = "LAYOUT_WIDE";
p.title = "株式会社アピシウス 承継実績";
p.author = "株式会社WineBank";

const DARK="2B1520", BERRY="6D2E46", ROSE="A26769", GOLD="B58B2A",
      INK="1F1A1C", MUTE="6E6368", TINT="F7F3F4", LINE="E4DADD", W="FFFFFF", GRN="2E6F4E";
const SERIF="Cambria", SANS="Calibri";
const SW=13.33, M=0.62;

const s = p.addSlide();

/* ---------- header ---------- */
s.addText("TRACK RECORD　／　株式会社アピシウス（東京・有楽町）", {x:M, y:0.34, w:10, h:0.26, isTextBox:true, margin:0,
  fontFace:SANS, fontSize:11, bold:true, color:GOLD, charSpacing:1.2});
s.addText("同じことを、すでに一度やっています", {x:M, y:0.62, w:SW-2*M, h:0.52, isTextBox:true, margin:0,
  fontFace:SERIF, fontSize:29, bold:true, color:INK});
s.addText("2024年6月、創業40年を超え、39年間にわたり赤字が続いた老舗フレンチレストランを取得。2年間で売上30%増・利益250%超の増加を実現し、幹部メンバーは全員が継続しています。",
  {x:M, y:1.19, w:SW-2*M, h:0.36, isTextBox:true, margin:0, fontFace:SANS, fontSize:12.5, color:MUTE, lineSpacing:17});

/* ---------- stat tiles ---------- */
const tiles=[["売上高","＋30%","取得前比（2年間）"],
             ["利益","＋250%超","取得前比（2年間）"],
             ["幹部メンバー継続率","100%","一人も欠けていません"]];
tiles.forEach((t,i)=>{
  const x = M + i*4.08;
  s.addShape(p.ShapeType.roundRect, {x, y:1.92, w:3.85, h:1.20, rectRadius:0.05,
    fill:{color: i===2 ? BERRY : TINT}, line:{color: i===2 ? BERRY : LINE, width:0.75}});
  s.addText(t[0], {x:x+0.24, y:2.04, w:3.4, h:0.26, isTextBox:true, margin:0,
    fontFace:SANS, fontSize:10, bold:true, color: i===2 ? "E8D6DB" : GOLD});
  s.addText(t[1], {x:x+0.24, y:2.30, w:3.4, h:0.52, isTextBox:true, margin:0,
    fontFace:SERIF, fontSize:30, bold:true, color: i===2 ? W : BERRY});
  s.addText(t[2], {x:x+0.24, y:2.82, w:3.4, h:0.24, isTextBox:true, margin:0,
    fontFace:SANS, fontSize:9, color: i===2 ? "C9AEB6" : MUTE});
});

/* ---------- 左：取得前後の対比 ---------- */
s.addText("取得前と、取得から2年後", {x:M, y:3.30, w:5.0, h:0.28, isTextBox:true, margin:0,
  fontFace:SERIF, fontSize:14, bold:true, color:INK});
const hd = t => ({text:t, options:{bold:true, color:W, fill:{color:BERRY}, fontSize:10}});
const rows=[
 [hd(""), hd("取得前（〜2024年5月）"), hd("取得後2年（2026年）")],
 [{text:"業績",options:{bold:true,fontSize:10}},
  {text:"39年間にわたり赤字。40年目にようやく黒字化",options:{fontSize:10}},
  {text:"売上 ＋30%／利益 ＋250%超",options:{fontSize:10,bold:true,color:GRN}}],
 [{text:"人員",options:{bold:true,fontSize:10}},
  {text:"―",options:{fontSize:10,color:MUTE}},
  {text:"幹部メンバーは全員が継続。経営陣の入替えを行っていません",options:{fontSize:10}}],
 [{text:"労働環境",options:{bold:true,fontSize:10}},
  {text:"サービス残業が常態化",options:{fontSize:10}},
  {text:"サービス残業を撤廃。12月を除き残業自体が発生しない体制へ",options:{fontSize:10,bold:true,color:GRN}}],
 [{text:"店舗",options:{bold:true,fontSize:10}},
  {text:"―",options:{fontSize:10,color:MUTE}},
  {text:"店内の一部改装・修繕を実施。業態・客層は変更せず",options:{fontSize:10}}]
];
s.addTable(rows, {x:M, y:3.64, w:7.2, colW:[0.95,2.55,3.70], rowH:0.46, fontSize:10,
  fontFace:SANS, color:INK, valign:"middle", border:{type:"solid", pt:0.5, color:LINE}, autoPage:false});

/* ---------- 右：カンテサンスへの踏襲 ---------- */
s.addShape(p.ShapeType.roundRect, {x:8.02, y:3.30, w:4.69, h:2.64, rectRadius:0.05,
  fill:{color:"FFFFFF"}, line:{color:LINE, width:0.75}});
s.addText("カンテサンスにおいて踏襲すること", {x:8.26, y:3.42, w:4.2, h:0.26, isTextBox:true, margin:0,
  fontFace:SANS, fontSize:10, bold:true, color:GOLD});
const keep=[
 ["人を入れ替えない","幹部・従業員の雇用と処遇をそのまま承継する"],
 ["労働環境を先に整える","サービス残業の撤廃と、残業が発生しない体制の構築"],
 ["手を入れるのは最小限","改装・修繕は必要な範囲にとどめ、業態と客層は変えない"],
 ["収益はコスト削減で作らない","原価・人件費の圧縮ではなく、店の価値を高めて伸ばす"]
];
keep.forEach((k,i)=>{
  const y = 3.76 + i*0.54;
  s.addShape(p.ShapeType.ellipse, {x:8.26, y:y+0.03, w:0.26, h:0.26, fill:{color:ROSE}});
  s.addText(String(i+1), {x:8.26, y:y+0.03, w:0.26, h:0.26, isTextBox:true, margin:0, align:"center",
    valign:"middle", fontFace:SANS, fontSize:10, bold:true, color:W});
  s.addText(k[0], {x:8.60, y:y, w:3.9, h:0.24, isTextBox:true, margin:0,
    fontFace:SANS, fontSize:10.5, bold:true, color:BERRY});
  s.addText(k[1], {x:8.60, y:y+0.23, w:3.9, h:0.34, isTextBox:true, margin:0,
    fontFace:SANS, fontSize:9, color:MUTE, lineSpacing:12});
});

/* ---------- 結論バー ---------- */
s.addShape(p.ShapeType.roundRect, {x:M, y:6.14, w:SW-2*M, h:0.80, rectRadius:0.04, fill:{color:BERRY}});
s.addText([{text:"アピシウスで実証されたのは、収益改善の手法ではありません。「高級レストランは、引き継いでも壊れない」ということです。\n",
  options:{fontSize:12.5, bold:true, color:W}},
 {text:"カンテサンスに必要なのは再建ではなく承継です。当社は、高級レストランを実際に承継し、人を残し、労働環境を改善したうえで収益を伸ばした実績をもって、本件に臨みます。",
  options:{fontSize:10.5, color:"EBDCE1"}}],
 {x:M+0.28, y:6.22, w:SW-2*M-0.56, h:0.64, isTextBox:true, margin:0, lineSpacing:17, valign:"middle"});

s.addText("株式会社WineBank", {x:M, y:7.02, w:6, h:0.25, isTextBox:true, margin:0, fontFace:SANS, fontSize:8, color:MUTE});

s.addNotes("アピシウス：2024年6月取得。創業40年超、39年間赤字が継続し40年目に黒字化した老舗フレンチ。取得後2年で売上+30%、利益+250%超。幹部メンバーは全員継続。サービス残業を撤廃し、12月を除き残業が発生しない体制を構築。店内の一部改装・修繕を実施。");

p.writeFile({fileName:"アピシウス承継実績_1枚.pptx"}).then(f=>console.log("WROTE", f));
