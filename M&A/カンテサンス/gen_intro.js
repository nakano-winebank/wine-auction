const pptxgen = require("pptxgenjs");
const p = new pptxgen();
p.layout = "LAYOUT_WIDE";
p.title = "カンテサンスとは";
p.author = "株式会社WineBank";

const DARK="2B1520", CARD="3B1E2B", EDGE="5A3240", BERRY="6D2E46",
      GOLD="C9A227", W="FFFFFF", TXT="D9CBCF", DIM="A28B92";
const SERIF="Cambria", SANS="Calibri";
const SW=13.33, M=0.62;

const s = p.addSlide();
s.background = {color:DARK};
s.addShape(p.ShapeType.ellipse,{x:10.4,y:-2.4,w:5.8,h:5.8,fill:{color:BERRY},transparency:66});

/* ---------- header ---------- */
s.addText("QUINTESSENCE　／　カンテサンス（東京・品川御殿山）", {x:M, y:0.34, w:10, h:0.26, isTextBox:true, margin:0,
  fontFace:SANS, fontSize:11, bold:true, color:GOLD, charSpacing:1.2});
s.addText("19年間、一度も星を落としていない", {x:M, y:0.62, w:SW-2*M, h:0.52, isTextBox:true, margin:0,
  fontFace:SERIF, fontSize:31, bold:true, color:W});
s.addText("『ミシュランガイド東京』は2007年の創刊から19版を数える。カンテサンスは、その創刊号から最新の2026年版まで、19版すべてで三つ星を保持している。",
  {x:M, y:1.22, w:SW-2*M, h:0.34, isTextBox:true, margin:0, fontFace:SANS, fontSize:12.5, color:TXT, lineSpacing:17});

/* ---------- stat tiles ---------- */
const tiles=[["ミシュラン三つ星","19年連続","東京版の創刊号から全19版"],
             ["客単価","7.2万円","フード4.6万＋ドリンク2.5万"],
             ["営業利益率","52.0%","2026年12月期 想定"],
             ["増収増益","20年連続","開業以来、無借金"]];
tiles.forEach((t,i)=>{
  const x = M + i*3.05;
  const hot = (i===0);
  s.addShape(p.ShapeType.roundRect, {x, y:1.70, w:2.80, h:1.12, rectRadius:0.05,
    fill:{color: hot ? GOLD : CARD}, line:{color: hot ? GOLD : EDGE, width:0.75}});
  s.addText(t[0], {x:x+0.20, y:1.81, w:2.4, h:0.24, isTextBox:true, margin:0,
    fontFace:SANS, fontSize:9.5, bold:true, color: hot ? "4A3B08" : GOLD});
  s.addText(t[1], {x:x+0.20, y:2.05, w:2.4, h:0.46, isTextBox:true, margin:0,
    fontFace:SERIF, fontSize:26, bold:true, color: hot ? "2B1520" : W});
  s.addText(t[2], {x:x+0.20, y:2.51, w:2.5, h:0.24, isTextBox:true, margin:0,
    fontFace:SANS, fontSize:8.5, color: hot ? "5C4A10" : DIM});
});

/* ---------- 3 columns ---------- */
const CW=3.83, CY=3.00, CH=2.96;
function col(i, title){
  const x = M + i*(CW+0.30);
  s.addShape(p.ShapeType.roundRect, {x, y:CY, w:CW, h:CH, rectRadius:0.05,
    fill:{color:CARD}, line:{color:EDGE, width:0.75}});
  s.addText(title, {x:x+0.24, y:CY+0.14, w:CW-0.48, h:0.26, isTextBox:true, margin:0,
    fontFace:SANS, fontSize:10, bold:true, color:GOLD});
  return x;
}

/* --- 1. 沿革 --- */
let x0 = col(0, "沿革");
const hist=[
 ["2006","白金台に開業。岸田周三氏32歳"],
 ["2007","『ミシュランガイド東京』創刊号で三つ星。当時33歳、最年少での獲得"],
 ["2011","岸田氏が独立し、オーナーシェフに"],
 ["2013","品川・御殿山へ移転（現在地）"],
 ["2026","19年連続三つ星。20年連続の増収増益"]
];
hist.forEach((h,i)=>{
  const y = CY + 0.46 + i*0.50;
  s.addText(h[0], {x:x0+0.24, y:y, w:0.62, h:0.22, isTextBox:true, margin:0,
    fontFace:SERIF, fontSize:12, bold:true, color:GOLD});
  s.addText(h[1], {x:x0+0.92, y:y-0.02, w:CW-1.16, h:0.46, isTextBox:true, margin:0,
    fontFace:SANS, fontSize:9.5, color:TXT, lineSpacing:13});
});

/* --- 2. 岸田周三 --- */
let x1 = col(1, "岸田 周三 — オーナーシェフ");
const bio=[
 ["1974年生","愛知県出身。2026年で52歳",1],
 ["修業","志摩観光ホテル「ラ・メール」でキャリアを開始。東京「カーエム」で約4年",2],
 ["渡仏","2000年、26歳で渡仏。パリ「アストランス」でパスカル・バルボ氏に師事し、スーシェフを務める",3],
 ["独立","2006年に帰国し、カンテサンスを開業",1],
 ["門下","卒業生から12名以上が独立し、ミシュランの星を獲得",2]
];
const LH=0.185, GAP=0.20;
let by = CY + 0.46;
bio.forEach(b=>{
  const h = b[2]*LH;
  s.addText(b[0], {x:x1+0.24, y:by, w:0.74, h:0.22, isTextBox:true, margin:0,
    fontFace:SANS, fontSize:9.5, bold:true, color:GOLD});
  s.addText(b[1], {x:x1+1.02, y:by-0.03, w:CW-1.26, h:h+0.08, isTextBox:true, margin:0,
    fontFace:SANS, fontSize:9.5, color:TXT, lineSpacing:13});
  by += h + GAP;
});

/* --- 3. 店の数字 --- */
let x2 = col(2, "店の数字（2026年12月期 想定）");
const num=[["席数","54席"],["回転","1日 1.6回転"],["営業日数","年 252日"],["年間来店","約1.4万人"],
           ["客単価","7.2万円／人"],["売上高","10億1,500万円"],["営業利益","5億2,800万円（52.0%）"]];
num.forEach((n,i)=>{
  const y = CY + 0.46 + i*0.335;
  s.addText(n[0], {x:x2+0.24, y:y, w:1.4, h:0.26, isTextBox:true, margin:0,
    fontFace:SANS, fontSize:10, color:DIM, valign:"middle"});
  s.addText(n[1], {x:x2+1.30, y:y, w:CW-1.54, h:0.26, isTextBox:true, margin:0,
    fontFace:SANS, fontSize:i>=5?11:10.5, bold:i>=5, color:W, align:"right", valign:"middle"});
});

/* ---------- bottom bar ---------- */
s.addShape(p.ShapeType.roundRect,{x:M, y:6.18, w:SW-2*M, h:0.72, rectRadius:0.04,
  fill:{color:"FFFFFF"}, line:{color:"FFFFFF", width:0}});
s.addText([{text:"東京は19年連続で「世界一星の多い都市」— 星付き160軒、三つ星12軒（パリ10軒、ニューヨーク5軒）。\n",
  options:{fontSize:11.5, bold:true, color:"2B1520"}},
 {text:"その19年間、カンテサンスは一度も三つ星を手放していません。日本の飲食業において、これに並ぶ収益性と継続性を備えた企業は確認されていません。",
  options:{fontSize:10.5, color:"5A4A50"}}],
 {x:M+0.28, y:6.26, w:SW-2*M-0.56, h:0.56, isTextBox:true, margin:0, lineSpacing:16, valign:"middle"});

s.addText("出所：『ミシュランガイド東京2026』（2025年9月発表）、公開されている岸田氏の経歴、および初期開示資料に記載の計数。",
  {x:M, y:7.02, w:11, h:0.25, isTextBox:true, margin:0, fontFace:SANS, fontSize:8, color:"8A7278"});

s.addNotes("カンテサンス：2006年白金台開業、2013年品川御殿山へ移転。『ミシュランガイド東京』創刊号（2008年版）から2026年版まで19版連続で三つ星。岸田周三氏は1974年愛知県生まれ、パリ「アストランス」でパスカル・バルボに師事。創刊号で33歳・当時最年少の三つ星獲得。東京の三つ星は2026年版で12軒、星付き160軒で19年連続世界最多。");

p.writeFile({fileName:"カンテサンスとは_1枚.pptx"}).then(f=>console.log("WROTE", f));
