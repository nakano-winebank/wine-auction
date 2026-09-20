const pptxgen = require("pptxgenjs");
const p = new pptxgen();
p.layout = "LAYOUT_WIDE";
p.title = "カンテサンス M&Aスキーム";
p.author = "株式会社WineBank";

const BERRY="6D2E46", ROSE="A26769", GOLD="B58B2A", INK="1F1A1C", MUTE="6E6368",
      TINT="F7F3F4", LINE="E4DADD", W="FFFFFF", GRN="2E6F4E", AMB="A8741A", RED="9B2C2C";
const SERIF="Cambria", SANS="Calibri";
const SW=13.33, M=0.62;
let pageNo=0;
function header(s,k,t,l){
  s.addText(k,{x:M,y:0.34,w:10,h:0.26,isTextBox:true,margin:0,fontFace:SANS,fontSize:11,bold:true,color:GOLD,charSpacing:1.4});
  s.addText(t,{x:M,y:0.62,w:SW-2*M,h:0.52,isTextBox:true,margin:0,fontFace:SERIF,fontSize:29,bold:true,color:INK});
  if(l) s.addText(l,{x:M,y:1.19,w:SW-2*M,h:0.36,isTextBox:true,margin:0,fontFace:SANS,fontSize:12.5,color:MUTE,lineSpacing:17});
}
function footer(s){ pageNo++;
  s.addText("カンテサンス（株式会社プティ・ボノム）M&Aスキーム ／ 2026年9月20日 株式会社WineBank",
    {x:M,y:7.02,w:9.5,h:0.25,isTextBox:true,margin:0,fontFace:SANS,fontSize:8,color:MUTE});
  s.addText(String(pageNo),{x:SW-M-0.9,y:7.02,w:0.9,h:0.25,isTextBox:true,margin:0,fontFace:SANS,fontSize:9,color:MUTE,align:"right"});
}
const tOpt=(x={})=>Object.assign({fontFace:SANS,fontSize:10.5,color:INK,
  border:{type:"solid",pt:0.5,color:LINE},valign:"middle",autoPage:false},x);
const hd=t=>({text:t,options:{bold:true,color:W,fill:{color:BERRY},fontSize:10}});
const num=(t,o={})=>({text:t,options:Object.assign({align:"right"},o)});
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

/* ================= S1 スキーム図 ================= */
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
             ["合併後の有利子負債","20.0億円","DSCR 1.35倍"]];
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

/* ================= S2 資金の流れ ================= */
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

s.addText("※ 譲受価額が55.0億円となる場合、差額5.0億円は追加投資家の第三者割当増資で調達する（p.4）。借入額および合併後の財務は変わらない。",{x:M,y:4.22,w:7.30,h:0.26,isTextBox:true,margin:0,fontFace:SANS,fontSize:9,color:MUTE});
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
           ["初年度DSCR","1.35倍","返済2.60億円 vs FCF 3.50億円"],
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

/* ================= S3 留保現金の感応度 ================= */
{
const s=p.addSlide();
header(s,"SENSITIVITY","対象会社に留保する現金をいくらにするか",
  "留保額を1億円増やすと、中野氏の必要拠出額も1億円増え、2027年の最低現金残高も1億円増える。合併後の有利子負債20.0億円と初年度DSCR1.35倍は、いずれの場合も変わらない。");
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
  {text:"◎ 当初案",options:{color:GRN,fontSize:10}}]
],tOpt({x:M,y:2.10,w:12.09,colW:[1.55,1.75,1.55,2.00,1.35,2.10,1.79],rowH:0.44,fontSize:10}));
s.addText("※ 最低現金残高は2月末。2月に2026年12月期の未払税金1.14億円を納付する一方、借入の元利返済は毎月発生するため、年間で最も薄くなる。",
  {x:M,y:4.30,w:12.09,h:0.26,isTextBox:true,margin:0,fontFace:SANS,fontSize:9,color:MUTE});

const pts=[
 ["① 1.0億円では2月末に1,900万円まで落ちる",
  "借入の返済が毎月であるため、2026年12月期の未払税金1.14億円を納付する2月に底が来る。残高1,900万円は月次固定費の1.0か月分にすぎず、ワインの一次価格アロケーションがまとまって入荷する月や突発的な修繕が重なれば、一時的な借入が避けられない。留保を2.0億円とすれば底は1.19億円（6.2か月分）となる。"],
 ["② 資産調整勘定を織り込めば年1.8億円が浮く",
  "株式譲受代金50.0億円と時価純資産23.15億円の差額26.85億円が税務上ののれんとして5年で損金算入されれば、年5.37億円の損金となり課税所得はマイナスとなる。8月の中間納付0.92億円は仮決算により回避でき、期末残高は1.65億円から2.57億円へ、DSCRは1.25倍から1.61倍へ改善する。ただし2月の納付は2026年12月期に対応するものであり回避できない。"],
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

/* ================= S4 株主構成 ================= */
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
  "差額5.0億円を全額エクイティで吸収するため、みずほ銀行への依頼額36.4億円、合併後の有利子負債20.0億円、初年度DSCR1.35倍は、いずれのケースでも同一となる。"],
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

p.writeFile({fileName:"カンテサンス_M&Aスキーム図.pptx"}).then(f=>console.log("WROTE",f));
