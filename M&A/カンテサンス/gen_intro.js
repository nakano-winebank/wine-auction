const pptxgen = require("pptxgenjs");
const p = new pptxgen();
p.layout = "LAYOUT_WIDE";
p.title = "カンテサンスとは";
p.author = "株式会社WineBank";

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
s.addText("出所：『ミシュランガイド東京2026』（2025年9月発表。東京の三つ星は12軒、星付き160軒で19年連続世界最多）ほか公開情報。創刊号の三つ星8軒のうち、2018年版時点で11年連続は4軒。うち「すきやばし次郎」は2020年版より掲載対象外。",
  {x:M, y:6.78, w:12.09, h:0.4, isTextBox:true, margin:0, fontFace:SANS, fontSize:8, color:"7E666D", lineSpacing:12});

s.addNotes("『ミシュランガイド東京』は2007年創刊、2026年版で19版目。創刊号から19年連続で三つ星を維持しているのは、かんだ／ガストロノミー ジョエル・ロブション／カンテサンスの3軒のみ（2018年版時点で11年連続は4軒、うちすきやばし次郎は2020年版より掲載対象外）。岸田周三氏は創刊号で33歳、当時最年少での三つ星獲得。開業以来おまかせ一コースのみ。2021年ミシュラン グリーンスター獲得。東京は19年連続で星付き店数世界一（三つ星12軒、パリ10軒、ニューヨーク5軒）。");

p.writeFile({fileName:"カンテサンスとは_1枚.pptx"}).then(f=>console.log("WROTE", f));
