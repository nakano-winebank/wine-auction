const pptxgen = require("pptxgenjs");
const p = new pptxgen();
p.layout = "LAYOUT_WIDE";
p.title = "お支払い設計のご提案（税負担の最適化）";
p.author = "株式会社WineBank";

const BERRY="6D2E46", GOLD="B58B2A", INK="1F1A1C", MUTE="6E6368", TINT="F7F3F4", LINE="E4DADD",
      W="FFFFFF", GRN="2E6F4E", RED="9B2C2C", PGRN="EAF2ED";
const SERIF="Cambria", SANS="Calibri";
const SW=13.33, M=0.62, CW=SW-2*M;

const hd=(t,o={})=>({text:t,options:Object.assign({bold:true,color:W,fill:{color:BERRY},fontSize:9.5,valign:"middle"},o)});
const c=(t,o={})=>({text:t,options:Object.assign({valign:"middle"},o)});
const tOpt=(x)=>Object.assign({fontFace:SANS,fontSize:9.5,color:INK,border:{type:"solid",pt:0.5,color:LINE},
  valign:"middle",autoPage:false,margin:[3,5,3,5]},x);
const sub=(s,x,y,w,t)=>s.addText(t,{x,y,w,h:0.28,isTextBox:true,margin:0,fontFace:SANS,fontSize:11.5,bold:true,color:GOLD});

const s=p.addSlide();
s.background={color:W};
s.addText("ご提案",{x:M,y:0.34,w:10,h:0.26,isTextBox:true,margin:0,fontFace:SANS,fontSize:11,bold:true,color:GOLD,charSpacing:1.4});
s.addText("お支払い総額は変えずに、双方の税負担を抑える設計",{x:M,y:0.62,w:CW,h:0.52,isTextBox:true,margin:0,fontFace:SERIF,fontSize:24,bold:true,color:INK});
s.addText("岸田様の手取りを守ることを前提に、会社側で損金にできる部分を「役員退職金」として設計させていただきたいと考えております。",
  {x:M,y:1.17,w:CW,h:0.30,isTextBox:true,margin:0,fontFace:SANS,fontSize:11.5,color:MUTE});

/* 3つの原則 */
const pr=[["1","お支払い総額は変えません","10/9にお伝えした総額・条件の枠組みのままです"],
          ["2","岸田様の手取りは減らしません","株式対価でお受け取りの場合と同水準を確保"],
          ["3","損金にできる部分を退職金に","金額・時期は双方の税理士の確認のうえ決定"]];
const pw=(CW-0.3)/3;
pr.forEach((q,i)=>{
  const x=M+i*(pw+0.15), y=1.62;
  s.addShape(p.ShapeType.roundRect,{x,y,w:pw,h:0.82,rectRadius:0.05,fill:{color:i===1?BERRY:TINT},line:{color:i===1?BERRY:LINE,width:0.75}});
  s.addShape(p.ShapeType.ellipse,{x:x+0.16,y:y+0.21,w:0.4,h:0.4,fill:{color:i===1?W:BERRY},line:{color:i===1?W:BERRY}});
  s.addText(q[0],{x:x+0.16,y:y+0.21,w:0.4,h:0.4,isTextBox:true,margin:0,align:"center",valign:"middle",fontFace:SANS,fontSize:12,bold:true,color:i===1?BERRY:W});
  s.addText(q[1],{x:x+0.7,y:y+0.1,w:pw-0.85,h:0.34,isTextBox:true,margin:0,valign:"middle",fontFace:SANS,fontSize:12.5,bold:true,color:i===1?W:BERRY});
  s.addText(q[2],{x:x+0.7,y:y+0.44,w:pw-0.85,h:0.3,isTextBox:true,margin:0,valign:"middle",fontFace:SANS,fontSize:9,color:i===1?"E3D2D7":MUTE});
});

/* 左：退職金の支給時期の比較 */
const lw=7.05;
sub(s,M,2.66,lw,"役員退職金：支給時期による違い（目安）");
s.addTable([
  [hd("支給時期"),hd("計算の目安"),hd("退職金の目安",{align:"right"}),hd("会社の節税",{align:"right"}),hd("岸田様の税負担\n（株式対価比）",{align:"center"})],
  [c("決済時\n（2026年12月）",{bold:true,fontSize:9}),c("月額報酬60万円×在任20年×功績倍率3.0",{fontSize:9}),c("約0.36億円",{align:"right"}),
   c("約0.12億円",{align:"right"}),c("約280万円\n軽くなる",{align:"center",color:GRN,bold:true})],
  [c("最終ご退任時\n（4〜5年目）",{bold:true,fontSize:9,fill:{color:PGRN}}),c("月額報酬約167万円×在任24〜25年×功績倍率2.0〜3.0",{fontSize:9,fill:{color:PGRN}}),
   c("約0.8〜\n1.25億円",{align:"right",bold:true,fill:{color:PGRN}}),c("約0.28〜\n0.43億円",{align:"right",bold:true,color:GRN,fill:{color:PGRN}}),
   c("ほぼ同水準\n（±150万円程度）",{align:"center",fill:{color:PGRN}})]
],tOpt({x:M,y:2.98,w:lw,colW:[1.35,2.05,1.2,1.15,1.3],rowH:[0.5,0.6,0.6]}));
s.addText("※ 最終ご退任時の月額報酬は、決済後の固定報酬（年2,000万円）を前提としています。最終ご退任時に支給する場合は、ご退任まで取締役を継続していただき、決済時には退職金を支給しないことが前提となります（決済時に支給すると在任期間が区切られるため）。財源は、前払い分またはアーンアウトの一部を振り替える形とし、総額は変えません。",
  {x:M,y:4.75,w:lw,h:0.75,isTextBox:true,margin:0,fontFace:SANS,fontSize:8.5,color:MUTE,lineSpacing:11.5});

/* 右：アーンアウトを報酬で払う場合との比較 */
const rx=M+lw+0.3, rw=CW-lw-0.3;
sub(s,rx,2.66,rw,"ご参考：アーンアウト1回4億円の払い方");
s.addTable([
  [hd("払い方"),hd("岸田様の手取り",{align:"right"}),hd("会社の節税",{align:"right"})],
  [c("株式対価\n（10/9の枠組み）",{bold:true}),c("約3.19億円\n（税率20.3%）",{align:"right"}),c("なし",{align:"right"})],
  [c("役員報酬（賞与）",{bold:true}),c("約1.82億円\n（税率約54%）",{align:"right",color:RED,bold:true}),c("約1.38億円",{align:"right"})]
],tOpt({x:rx,y:2.98,w:rw,colW:[1.75,1.6,1.39],rowH:[0.4,0.62,0.62]}));
s.addShape(p.ShapeType.roundRect,{x:rx,y:4.75,w:rw,h:0.75,rectRadius:0.04,fill:{color:TINT},line:{color:LINE,width:0.75}});
s.addText("報酬で払うと、会社の節税分とほぼ同じだけ岸田様の税金が増え、双方合計では得になりません。アーンアウトは株式対価を基本とし、退職金に振り替えられる部分だけを設計します。",
  {x:rx+0.15,y:4.8,w:rw-0.3,h:0.65,isTextBox:true,margin:0,valign:"middle",fontFace:SANS,fontSize:9,color:INK,lineSpacing:12});

/* 下：ご相談したいこと */
s.addShape(p.ShapeType.roundRect,{x:M,y:5.72,w:CW,h:1.18,rectRadius:0.05,fill:{color:W},line:{color:BERRY,width:1}});
s.addText("本日ご相談したいこと",{x:M+0.25,y:5.8,w:5,h:0.28,isTextBox:true,margin:0,fontFace:SANS,fontSize:11.5,bold:true,color:BERRY});
const asks=["役員退職金を活用する方向性について、ご賛同いただけるか",
            "支給時期（決済時か、最終ご退任時か）と、財源とする部分（前払い分またはアーンアウトの一部）",
            "双方の税理士による確認の進め方と、最終契約書への反映時期"];
asks.forEach((t,i)=>s.addText(`${i+1}．${t}`,{x:M+0.25,y:6.12+i*0.24,w:CW-0.5,h:0.24,isTextBox:true,margin:0,valign:"middle",fontFace:SANS,fontSize:10,color:INK}));

s.addText("たたき台 ／ 金額はいずれも概算です。税務上の取扱いは双方の税理士の確認を前提とします ／ 2026年10月11日 株式会社WineBank",
  {x:M,y:7.08,w:CW,h:0.22,isTextBox:true,margin:0,fontFace:SANS,fontSize:8,color:MUTE});

p.writeFile({fileName:"お支払い設計のご提案_税負担の最適化_20261011.pptx"}).then(f=>console.log("WROTE",f));
