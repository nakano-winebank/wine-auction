const pptxgen = require("pptxgenjs");
const p = new pptxgen();
p.layout = "LAYOUT_WIDE";
p.title = "カンテサンス SPCスキーム（AM型）";
p.author = "株式会社WineBank";

const BERRY="6D2E46", ROSE="A26769", GOLD="B58B2A", INK="1F1A1C", MUTE="6E6368",
      TINT="F7F3F4", LINE="E4DADD", W="FFFFFF", GRN="2E6F4E";
const SERIF="Cambria", SANS="Calibri";
const SW=13.33, M=0.62;

function box(s,x,y,w,h,title,sub,o={}){
  s.addShape(p.ShapeType.roundRect,{x,y,w,h,rectRadius:0.05,fill:{color:o.fill||W},line:{color:o.line||BERRY,width:o.lw||1.25}});
  s.addText(title,{x:x+0.12,y:y+0.12,w:w-0.24,h:0.30,isTextBox:true,margin:0,align:"center",
    fontFace:SANS,fontSize:o.ts||12.5,bold:true,color:o.tc||INK});
  if(sub) s.addText(sub,{x:x+0.10,y:y+0.44,w:w-0.20,h:h-0.52,isTextBox:true,margin:0,align:"center",
    fontFace:SANS,fontSize:o.ss||9,color:o.sc||MUTE,lineSpacing:12});
}
const vA=(s,x,y1,y2,c)=>s.addShape(p.ShapeType.line,{x,y:y1,w:0,h:y2-y1,line:{color:c||BERRY,width:1.5,endArrowType:"triangle"}});
const hA=(s,x1,x2,y,c)=>s.addShape(p.ShapeType.line,{x:Math.min(x1,x2),y,w:Math.abs(x2-x1),h:0,
  line:Object.assign({color:c||BERRY,width:1.5},x2<x1?{beginArrowType:"triangle"}:{endArrowType:"triangle"})});
const lab=(s,x,y,w,t,o={})=>s.addText(t,{x,y,w,h:o.h||0.36,isTextBox:true,margin:0,align:o.al||"center",
  fontFace:SANS,fontSize:o.fs||8.5,bold:o.b!==false,color:o.c||BERRY,lineSpacing:11});

const s=p.addSlide();
s.background={color:W};
s.addText("SCHEME",{x:M,y:0.34,w:10,h:0.26,isTextBox:true,margin:0,fontFace:SANS,fontSize:11,bold:true,color:GOLD,charSpacing:1.4});
s.addText("SPCスキーム ― WineBankがAMとして価値向上を担う",{x:M,y:0.62,w:SW-2*M,h:0.52,isTextBox:true,margin:0,fontFace:SERIF,fontSize:26,bold:true,color:INK});
s.addText("みずほ銀行の借入を原資とするWineBank・アピシウスの出資と、投資家様の出資により、SPCが約30億円（EV相当）を用意し全株式を取得。",
  {x:M,y:1.17,w:SW-2*M,h:0.30,isTextBox:true,margin:0,fontFace:SANS,fontSize:12,color:MUTE});

/* 列：左 0.62〜3.32 / 中央 4.45〜8.45 / 右 10.00〜12.71 */
const CX=4.45, CW=4.00, RX=10.00, RW=2.71;

/* 上段：投資家 */
box(s,CX,1.62,CW,0.78,"投資家様","SPCへ出資",{fill:TINT});
vA(s,CX+CW/2,2.40,2.92);
lab(s,CX+CW/2+0.10,2.46,2.20,"出資 10〜15億円\n（シェア 33.3〜50%）",{al:"left"});

/* 中段：みずほ ― SPC ― 売主 */
box(s,M,1.62,2.70,0.78,"みずほ銀行","LBOローン",{line:ROSE,lw:1});
vA(s,M+1.35,2.40,2.92,ROSE);
lab(s,M+1.45,2.44,1.80,"借入 15〜20億円",{al:"left",h:0.22});
box(s,M,2.92,2.70,1.00,"WineBank ⇒ アピシウス","借入資金をSPCへ出資",{fill:TINT,ts:12});
box(s,CX,2.92,CW,1.00,"買収目的会社（SPC）","資金 約30億円（EV相当・取得関連費用込み）",{fill:BERRY,tc:W,sc:"E3D2D7",ts:14,ss:9.5});
box(s,RX,2.92,RW,1.00,"岸田 周三 氏","売主（対象会社株式100%）",{line:ROSE,lw:1});

hA(s,M+2.70,CX,3.42,ROSE);
lab(s,M+2.72,2.98,1.10,"出資\n15〜20億円",{c:BERRY});
lab(s,M+2.72,3.48,1.10,"シェア\n50〜66.7%",{c:MUTE});

hA(s,RX,CX+CW,3.20,ROSE);
lab(s,CX+CW+0.02,2.92,RX-CX-CW-0.04,"株式 100%",{h:0.24});
hA(s,CX+CW,RX,3.66,BERRY);
lab(s,CX+CW+0.02,3.70,RX-CX-CW-0.04,"譲受代金\n約50億円",{fs:8});

/* 下段：対象会社 ― WineBank */
vA(s,CX+CW/2,3.92,4.58);
lab(s,CX+CW/2+0.10,4.06,2.60,"100%取得 → クロージング後に合併",{al:"left",c:MUTE,h:0.22});
box(s,CX,4.58,CW,0.92,"株式会社プティ・ボノム（カンテサンス）","みずほへの返済は合併後の事業キャッシュフローが原資",{lw:1.5,ts:12});
box(s,RX,4.58,RW,0.92,"株式会社WineBank","アセットマネージャー（AM）",{fill:TINT,lw:1.5});

hA(s,RX,CX+CW,4.86,BERRY);
lab(s,CX+CW+0.02,4.46,RX-CX-CW-0.04,"AM業務\n経営管理・改善",{fs:8,h:0.36});
hA(s,CX+CW,RX,5.24,GOLD);
lab(s,CX+CW+0.02,5.28,RX-CX-CW-0.04,"AM報酬",{fs:8,c:GOLD,h:0.20});

/* AM報酬の内訳（WineBankの下） */
s.addShape(p.ShapeType.roundRect,{x:RX,y:5.58,w:RW,h:0.42,rectRadius:0.04,fill:{color:W},line:{color:GOLD,width:0.75}});
s.addText([{text:"管理報酬 ",options:{bold:true,color:GOLD}},{text:"残高×年2%（運営経費込み）\n",options:{color:INK}},
           {text:"成果報酬 ",options:{bold:true,color:GOLD}},{text:"30%",options:{color:INK,bold:true}}],
  {x:RX+0.10,y:5.60,w:RW-0.20,h:0.38,isTextBox:true,margin:0,fontFace:SANS,fontSize:8.5,lineSpacing:11,valign:"middle"});

/* 左下：SPCの資金構成 */
s.addText("SPCの資金構成",{x:M,y:4.22,w:3.3,h:0.24,isTextBox:true,margin:0,fontFace:SANS,fontSize:10,bold:true,color:GOLD});
const hd=t=>({text:t,options:{bold:true,color:W,fill:{color:BERRY},fontSize:9}});
const num=(t,o={})=>({text:t,options:Object.assign({align:"right"},o)});
s.addTable([
  [hd("出資者"),hd("出資額"),hd("シェア")],
  ["WineBank・アピシウス",num("15〜20億円"),num("50〜66.7%")],
  ["投資家様",num("10〜15億円"),num("33.3〜50%")],
  [{text:"合計",options:{bold:true,fill:{color:TINT}}},num("約30億円",{bold:true,fill:{color:TINT}}),num("100%",{bold:true,fill:{color:TINT}})]
],{x:M,y:4.48,w:3.60,colW:[1.60,1.00,1.00],rowH:0.26,fontFace:SANS,fontSize:8.5,color:INK,
   border:{type:"solid",pt:0.5,color:LINE},valign:"middle",autoPage:false});

/* 最下段：バリューアップと改善 */
s.addText("WineBankが進めるバリューアップと改善",{x:M,y:6.08,w:6,h:0.22,isTextBox:true,margin:0,fontFace:SANS,fontSize:10,bold:true,color:GOLD});
const vu=[["三ツ星の維持","後継料理長候補の育成を最優先"],
          ["物販の拡大","チーズケーキの製造拠点・EC"],
          ["ワインの仕入","当社の仕入網とセラーを活用"],
          ["管理体制の整備","月次PL・経営会議・労務"],
          ["新業態","ワインバー・スイーツ等の1品業態"]];
const cw=(SW-2*M-4*0.12)/5;
vu.forEach((c,i)=>{
  const x=M+i*(cw+0.12);
  s.addShape(p.ShapeType.roundRect,{x,y:6.32,w:cw,h:0.52,rectRadius:0.04,fill:{color:i===0?BERRY:TINT},line:{color:i===0?BERRY:LINE,width:0.75}});
  s.addText(c[0],{x:x+0.12,y:6.35,w:cw-0.24,h:0.24,isTextBox:true,margin:0,fontFace:SANS,fontSize:10,bold:true,color:i===0?W:BERRY});
  s.addText(c[1],{x:x+0.12,y:6.58,w:cw-0.24,h:0.22,isTextBox:true,margin:0,fontFace:SANS,fontSize:8.5,color:i===0?"E3D2D7":MUTE});
});

s.addText("※ 株式価値（約50億円）とSPC資金（約30億円）の差額は対象会社の余剰現預金に相当し、ブリッジローンで手当てのうえ合併直後に対象会社の現預金で返済。AM報酬の算定基準（残高の定義、成果報酬の対象）はAM契約で定める。",
  {x:M,y:6.88,w:SW-2*M,h:0.20,isTextBox:true,margin:0,fontFace:SANS,fontSize:7.5,color:MUTE});
s.addText("カンテサンス（株式会社プティ・ボノム）SPCスキーム ／ 2026年10月1日 株式会社WineBank",
  {x:M,y:7.12,w:9.5,h:0.22,isTextBox:true,margin:0,fontFace:SANS,fontSize:8,color:MUTE});

p.writeFile({fileName:"カンテサンス_SPCスキーム図_AM型.pptx"}).then(f=>console.log("WROTE",f));
