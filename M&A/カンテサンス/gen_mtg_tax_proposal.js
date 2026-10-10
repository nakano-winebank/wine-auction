const pptxgen = require("pptxgenjs");
const p = new pptxgen();
p.layout = "LAYOUT_WIDE";
p.title = "お支払い設計のご提案（双方合計の税負担を下げる）";
p.author = "株式会社WineBank";

const BERRY="6D2E46", GOLD="B58B2A", INK="1F1A1C", MUTE="6E6368", TINT="F7F3F4", LINE="E4DADD",
      W="FFFFFF", GRN="2E6F4E", RED="9B2C2C", PGRN="EAF2ED";
const SERIF="Cambria", SANS="Calibri";
const SW=13.33, M=0.62, CW=SW-2*M;

const hd=(t,o={})=>({text:t,options:Object.assign({bold:true,color:W,fill:{color:BERRY},fontSize:9.5,valign:"middle"},o)});
const c=(t,o={})=>({text:t,options:Object.assign({valign:"middle"},o)});
const r=(t,o={})=>c(t,Object.assign({align:"right"},o));
const tOpt=(x)=>Object.assign({fontFace:SANS,fontSize:9.5,color:INK,border:{type:"solid",pt:0.5,color:LINE},
  valign:"middle",autoPage:false,margin:[3,6,3,6]},x);
const sub=(s,x,y,w,t)=>s.addText(t,{x,y,w,h:0.28,isTextBox:true,margin:0,fontFace:SANS,fontSize:11.5,bold:true,color:GOLD});

const s=p.addSlide();
s.background={color:W};
s.addText("ご提案",{x:M,y:0.34,w:10,h:0.26,isTextBox:true,margin:0,fontFace:SANS,fontSize:11,bold:true,color:GOLD,charSpacing:1.4});
s.addText("お支払い総額は変えずに、双方合計の税負担を下げる設計",{x:M,y:0.62,w:CW,h:0.52,isTextBox:true,margin:0,fontFace:SERIF,fontSize:24,bold:true,color:INK});
s.addText("報酬の前払い2.25億円を、株式対価ではなく決済時の役員退職金としてお支払いすることで、双方合計の税負担を約6,700万円下げられます。",
  {x:M,y:1.17,w:CW,h:0.30,isTextBox:true,margin:0,fontFace:SANS,fontSize:11.5,color:MUTE});

/* 3つの原則 */
const pr=[["1","お支払い総額は変えません","10/9の総額・条件の枠組みのままです"],
          ["2","双方合計の税負担を下げます","退職所得（課税は2分の1）の仕組みを活用"],
          ["3","効果とリスクを分け合います","税務上のリスクも双方で負担します"]];
const pw=(CW-0.3)/3;
pr.forEach((q,i)=>{
  const x=M+i*(pw+0.15), y=1.62;
  s.addShape(p.ShapeType.roundRect,{x,y,w:pw,h:0.78,rectRadius:0.05,fill:{color:i===1?BERRY:TINT},line:{color:i===1?BERRY:LINE,width:0.75}});
  s.addShape(p.ShapeType.ellipse,{x:x+0.16,y:y+0.19,w:0.4,h:0.4,fill:{color:i===1?W:BERRY},line:{color:i===1?W:BERRY}});
  s.addText(q[0],{x:x+0.16,y:y+0.19,w:0.4,h:0.4,isTextBox:true,margin:0,align:"center",valign:"middle",fontFace:SANS,fontSize:12,bold:true,color:i===1?BERRY:W});
  s.addText(q[1],{x:x+0.7,y:y+0.08,w:pw-0.85,h:0.34,isTextBox:true,margin:0,valign:"middle",fontFace:SANS,fontSize:12.5,bold:true,color:i===1?W:BERRY});
  s.addText(q[2],{x:x+0.7,y:y+0.42,w:pw-0.85,h:0.28,isTextBox:true,margin:0,valign:"middle",fontFace:SANS,fontSize:9,color:i===1?"E3D2D7":MUTE});
});

/* 左：前払い2.25億円の払い方の比較 */
const lw=7.45;
sub(s,M,2.6,lw,"報酬の前払い2.25億円：払い方による違い");
const P={fill:{color:PGRN}};
s.addTable([
  [hd("払い方"),hd("岸田様の税負担",{align:"right"}),hd("会社の税負担軽減",{align:"right"}),hd("双方合計の税負担",{align:"right"})],
  [c("従来どおり賞与で支給",{bold:true}),r("約1億1,250万円\n（税率50%と仮定）"),r("約7,740万円"),r("約3,510万円")],
  [c("株式対価（10/9の枠組み）",{bold:true}),r("約4,570万円\n（税率20.3%）"),r("なし"),r("約4,570万円")],
  [c("役員退職金（決済時）\nご提案",Object.assign({bold:true,color:BERRY},P)),r("約5,630万円\n（実効 約25%）",P),
   r("約7,740万円",Object.assign({bold:true,color:GRN},P)),r("▲約2,110万円\n（合計で約6,700万円減）",Object.assign({bold:true,color:GRN},P))]
],tOpt({x:M,y:2.92,w:lw,colW:[2.05,1.85,1.65,1.9],rowH:[0.42,0.55,0.55,0.62]}));
s.addText("※ 双方合計の税負担＝岸田様の税負担−会社の税負担軽減。賞与の税率はデロイト様資料の仮定（50%）。会社の実効税率は34.4%。退職所得は在任20年の退職所得控除（800万円）を適用して試算。",
  {x:M,y:5.1,w:lw,h:0.45,isTextBox:true,margin:0,fontFace:SANS,fontSize:8.5,color:MUTE,lineSpacing:11.5});

/* 右：効果とリスクの分け方 */
const rx=M+lw+0.3, rw=CW-lw-0.3;
sub(s,rx,2.6,rw,"効果とリスクの分け方");
s.addShape(p.ShapeType.roundRect,{x:rx,y:2.92,w:rw,h:2.63,rectRadius:0.04,fill:{color:TINT},line:{color:LINE,width:0.75}});
const blocks=[
 ["岸田様","株式対価と比べ約1,050万円のご負担増。ただし賞与で受け取る場合と比べると約5,600万円の節税は維持されます。"],
 ["会社","前払い分が損金となり、約7,740万円の税負担が軽くなります。"],
 ["税務リスク","賞与を含めた月額で算定するため、否認された場合の追徴（約7,000〜7,500万円）は双方で折半し、最終契約に定めます。"]];
blocks.forEach((b,i)=>{
  const yy=3.02+i*0.84;
  s.addText(b[0],{x:rx+0.18,y:yy,w:rw-0.36,h:0.26,isTextBox:true,margin:0,fontFace:SANS,fontSize:10.5,bold:true,color:BERRY});
  s.addText(b[1],{x:rx+0.18,y:yy+0.26,w:rw-0.36,h:0.55,isTextBox:true,margin:0,valign:"top",fontFace:SANS,fontSize:9,color:INK,lineSpacing:11.5});
});

/* 下：前提条件と本日のご相談 */
s.addShape(p.ShapeType.roundRect,{x:M,y:5.72,w:CW,h:1.2,rectRadius:0.05,fill:{color:W},line:{color:BERRY,width:1}});
s.addText("前提となる条件",{x:M+0.25,y:5.8,w:5.6,h:0.26,isTextBox:true,margin:0,fontFace:SANS,fontSize:11,bold:true,color:BERRY});
["決済時に代表取締役を退任し、取締役・料理長としてご在任（報酬は年2,000万円）",
 "算定：賞与を含む実質月額 約855万円×在任20年×功績倍率 約1.3（社長の目安3.0の半分以下）",
 "アーンアウトは株式対価のまま（報酬で払っても双方合計では得にならないため）"]
 .forEach((t,i)=>s.addText("・"+t,{x:M+0.25,y:6.08+i*0.26,w:6.6,h:0.26,isTextBox:true,margin:0,valign:"middle",fontFace:SANS,fontSize:9,color:INK}));
const ax=M+7.05;
s.addText("本日ご相談したいこと",{x:ax,y:5.8,w:4.5,h:0.26,isTextBox:true,margin:0,fontFace:SANS,fontSize:11,bold:true,color:BERRY});
["前払い分を役員退職金に振り替える方向性","否認された場合の追徴を折半する考え方","双方の税理士による確認と、最終契約への反映"]
 .forEach((t,i)=>s.addText(`${i+1}．${t}`,{x:ax,y:6.08+i*0.26,w:CW-7.3,h:0.26,isTextBox:true,margin:0,valign:"middle",fontFace:SANS,fontSize:9.5,color:INK}));

s.addText("たたき台 ／ 金額はいずれも概算です。税務上の取扱いは双方の税理士の確認を前提とします ／ 2026年10月11日 株式会社WineBank",
  {x:M,y:7.08,w:CW,h:0.22,isTextBox:true,margin:0,fontFace:SANS,fontSize:8,color:MUTE});

p.writeFile({fileName:"お支払い設計のご提案_税負担の最適化_20261011.pptx"}).then(f=>console.log("WROTE",f));
