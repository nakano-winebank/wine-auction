const pptxgen = require("pptxgenjs");
const p = new pptxgen();
p.layout = "LAYOUT_WIDE";
p.title = "グループ会社の構成";
p.author = "株式会社WineBank";

const BERRY="6D2E46", GOLD="B58B2A", INK="1F1A1C", MUTE="6E6368", TINT="F7F3F4", LINE="E4DADD", W="FFFFFF";
const SERIF="Cambria", SANS="Calibri";
const SW=13.33, M=0.62, CW=SW-2*M;

const s=p.addSlide();
s.background={color:W};
s.addText("別紙（ご依頼事項（7））",{x:M,y:0.34,w:8,h:0.26,isTextBox:true,margin:0,fontFace:SANS,fontSize:11,bold:true,color:GOLD,charSpacing:1.2});
s.addText("グループ会社の構成",{x:M,y:0.62,w:CW,h:0.52,isTextBox:true,margin:0,fontFace:SERIF,fontSize:26,bold:true,color:INK});
s.addText("当社を含むグループ各社は、いずれも中野邦人を筆頭株主として構成しております。",
  {x:M,y:1.17,w:CW,h:0.30,isTextBox:true,margin:0,fontFace:SANS,fontSize:12,color:MUTE});

/* 株主 */
const tw=3.6, tx=(SW-tw)/2, ty=1.85;
s.addShape(p.ShapeType.roundRect,{x:tx,y:ty,w:tw,h:0.85,rectRadius:0.05,fill:{color:BERRY},line:{color:BERRY}});
s.addText("中野 邦人",{x:tx,y:ty+0.12,w:tw,h:0.38,isTextBox:true,margin:0,align:"center",valign:"middle",fontFace:SANS,fontSize:16,bold:true,color:W});
s.addText("筆頭株主",{x:tx,y:ty+0.5,w:tw,h:0.24,isTextBox:true,margin:0,align:"center",valign:"middle",fontFace:SANS,fontSize:10,color:"E3D2D7"});

/* 各社 */
const cos=[
 ["株式会社WineBank","70.0%","ワイン事業（グループ中核）",true],
 ["株式会社アピシウス","66.7%","レストラン（創業42年）",false],
 ["株式会社あどばる","33.75〜36.7%","スペースシェアリング（創業事業）",false],
 ["その他 7社","49〜100%","",false]];
const n=cos.length, gap=0.3, bw=(CW-gap*(n-1))/n, by=3.75, bh=1.75;
const busY=3.2;
s.addShape(p.ShapeType.line,{x:SW/2,y:ty+0.85,w:0,h:busY-(ty+0.85),line:{color:BERRY,width:1.5}});
s.addShape(p.ShapeType.line,{x:M+bw/2,y:busY,w:CW-bw,h:0,line:{color:BERRY,width:1.5}});
cos.forEach((c,i)=>{
  const x=M+i*(bw+gap), cx=x+bw/2;
  s.addShape(p.ShapeType.line,{x:cx,y:busY,w:0,h:by-busY,line:{color:BERRY,width:1.5,endArrowType:"triangle"}});
  s.addText(c[1],{x:cx+0.08,y:busY+0.08,w:bw/2,h:0.4,isTextBox:true,margin:0,fontFace:SANS,fontSize:11,bold:true,color:GOLD});
  s.addShape(p.ShapeType.roundRect,{x,y:by,w:bw,h:bh,rectRadius:0.05,fill:{color:c[3]?TINT:W},line:{color:c[3]?BERRY:LINE,width:c[3]?1.5:1}});
  s.addText(c[0],{x:x+0.15,y:by+0.25,w:bw-0.3,h:0.45,isTextBox:true,margin:0,align:"center",fontFace:SANS,fontSize:15,bold:true,color:c[3]?BERRY:INK});
  s.addText("出資比率 "+c[1],{x:x+0.15,y:by+0.78,w:bw-0.3,h:0.3,isTextBox:true,margin:0,align:"center",fontFace:SANS,fontSize:11,color:INK});
  if(c[2]) s.addText(c[2],{x:x+0.15,y:by+1.12,w:bw-0.3,h:0.3,isTextBox:true,margin:0,align:"center",fontFace:SANS,fontSize:10,color:MUTE});
  if(c[3]) s.addText("本件の譲受人",{x:x+0.15,y:by+1.4,w:bw-0.3,h:0.26,isTextBox:true,margin:0,align:"center",fontFace:SANS,fontSize:9.5,bold:true,color:BERRY});
});

s.addText("※ 出資比率は中野邦人による出資比率（2026年6月時点）。上場会社株式の少数保有（純投資）は記載しておりません。",
  {x:M,y:5.85,w:CW,h:0.26,isTextBox:true,margin:0,fontFace:SANS,fontSize:9,color:MUTE});
s.addText("株式会社WineBank　2026年11月1日",{x:M,y:7.08,w:CW,h:0.22,isTextBox:true,margin:0,fontFace:SANS,fontSize:8,color:MUTE});

p.writeFile({fileName:"別紙_グループ会社の構成_WineBank_20261101.pptx"}).then(f=>console.log("WROTE",f));
