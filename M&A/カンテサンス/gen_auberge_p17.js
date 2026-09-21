const P=require("pptxgenjs"); const p=new P(); p.layout="LAYOUT_WIDE";

const BERRY="6D2E46", ROSE="A26769", GOLD="B58B2A",
      INK="1F1A1C", MUTE="6E6368", TINT="F8F4F5", LINE="E2D7DA", W="FFFFFF";
const F="Meiryo";
const SW=13.333, M=0.55, U=SW-2*M;

const s=p.addSlide();

/* ---- header ---- */
s.addText("成長戦略 PhaseⅡ",{x:M,y:0.34,w:6,h:0.26,isTextBox:true,margin:0,valign:"top",
  fontFace:F,fontSize:11,bold:true,color:BERRY,charSpacing:1});
s.addText("国内オーベルジュ構想",{x:M,y:0.58,w:U,h:0.52,isTextBox:true,margin:0,valign:"top",
  fontFace:F,fontSize:28,bold:true,color:INK});
s.addText("日本のワイン産地に、ファインダイニングを主役とした小規模な滞在施設を。ティエリー・マルクスの出店計画の先に、当社が最終的に目指す姿です。",
  {x:M,y:1.16,w:U,h:0.30,isTextBox:true,margin:0,valign:"top",fontFace:F,fontSize:11.5,color:MUTE});
s.addShape(p.ShapeType.line,{x:M,y:1.50,w:U,h:0,line:{color:LINE,width:1}});

/* ---- 3 pillars ---- */
const CW=3.90, GAP=(U-CW*3)/2;
[["料理","ファインダイニング","その土地の生産者と同じテーブルにつける距離で、一日十数名だけをお迎えする。"],
 ["ワイン","産地とセラー","ワイン産地に置くことで、造り手と客が直接つながる場をつくる。当社のセラー機能を併設する。"],
 ["滞在","小規模宿泊","客室は10室前後。夜を跨いでいただくことで、ワインリストの幅が一気に広がる。"]
].forEach((t,i)=>{
  const x=M+i*(CW+GAP);
  s.addShape(p.ShapeType.roundRect,{x,y:1.62,w:CW,h:1.46,rectRadius:0.03,
    fill:{color:W},line:{color:LINE,width:1}});
  s.addShape(p.ShapeType.rect,{x,y:1.62,w:CW,h:0.05,fill:{color:BERRY}});
  s.addShape(p.ShapeType.roundRect,{x:x+0.24,y:1.82,w:0.94,h:0.30,rectRadius:0.03,fill:{color:BERRY}});
  s.addText(t[0],{x:x+0.24,y:1.82,w:0.94,h:0.30,isTextBox:true,margin:0,align:"center",valign:"middle",
    fontFace:F,fontSize:10.5,bold:true,color:W});
  s.addText(t[1],{x:x+0.24,y:2.22,w:CW-0.48,h:0.30,isTextBox:true,margin:0,valign:"top",
    fontFace:F,fontSize:15,bold:true,color:INK});
  s.addText(t[2],{x:x+0.24,y:2.58,w:CW-0.44,h:0.44,isTextBox:true,margin:0,valign:"top",
    fontFace:F,fontSize:9.5,color:MUTE,lineSpacing:13.5});
});

/* ---- roadmap ---- */
s.addText("出店ロードマップ　―　ブラッスリーから、オーベルジュへ",
  {x:M,y:3.22,w:8,h:0.26,isTextBox:true,margin:0,valign:"top",fontFace:F,fontSize:12,bold:true,color:INK});
const RW=2.92, RG=(U-RW*4)/3;
[["2027年 4月","ブラッスリー ティエリー・マルクス","東京ミッドタウン六本木・123席\n標準店モデルとなる1号店",false],
 ["2028年","札幌・大阪","2店舗。当社の創業地である\n札幌を含む",false],
 ["2029年","首都圏・政令指定都市","標準店モデルの横展開",false],
 ["2030年 〜","リゾート含め 年2店舗","ここから、オーベルジュ構想に\nつながります",true]
].forEach((r,i)=>{
  const x=M+i*(RW+RG), on=r[3];
  s.addShape(p.ShapeType.roundRect,{x,y:3.54,w:RW,h:0.94,rectRadius:0.03,
    fill:{color:on?BERRY:TINT},line:{color:on?BERRY:LINE,width:1}});
  s.addText(r[0],{x:x+0.18,y:3.64,w:RW-0.36,h:0.22,isTextBox:true,margin:0,valign:"top",
    fontFace:F,fontSize:9.5,bold:true,color:on?"E8D6DB":GOLD});
  s.addText(r[1],{x:x+0.18,y:3.86,w:RW-0.32,h:0.26,isTextBox:true,margin:0,valign:"top",
    fontFace:F,fontSize:11,bold:true,color:on?W:INK});
  s.addText(r[2],{x:x+0.18,y:4.12,w:RW-0.32,h:0.32,isTextBox:true,margin:0,valign:"top",
    fontFace:F,fontSize:8.5,color:on?"D9C4C9":MUTE,lineSpacing:11.5});
  if(i<3) s.addText("▶",{x:x+RW+0.01,y:3.88,w:RG-0.02,h:0.24,isTextBox:true,margin:0,align:"center",
    valign:"middle",fontFace:F,fontSize:10,color:ROSE});
});

/* ---- why us ---- */
s.addText("なぜ、当社が担えるのか",
  {x:M,y:4.58,w:8,h:0.26,isTextBox:true,margin:0,valign:"top",fontFace:F,fontSize:12,bold:true,color:INK});
[["ワインの仕入と保管","インポーターとしての仕入力と、寺田倉庫との保管体制。他にない厚みのワインリストをつくれます。"],
 ["グランメゾンの運営実績","アピシウスで、店を壊さずに引き継いで運営できることを実証しました。"],
 ["シェフとのネットワーク","ティエリー・マルクス氏をはじめ、国内外の料理人とつながっています。"],
 ["創業地との縁","当社の創業地は北海道札幌。日本のワイン産地とは、もともと近い場所にいます。"]
].forEach((t,i)=>{
  const x=M+(i%2)*(U/2+0.14), y=4.90+Math.floor(i/2)*0.58;
  s.addShape(p.ShapeType.ellipse,{x:x,y:y+0.02,w:0.24,h:0.24,fill:{color:ROSE}});
  s.addText(String(i+1),{x:x,y:y+0.02,w:0.24,h:0.24,isTextBox:true,margin:0,align:"center",valign:"middle",
    fontFace:F,fontSize:9,bold:true,color:W});
  s.addText(t[0],{x:x+0.34,y:y,w:U/2-0.48,h:0.22,isTextBox:true,margin:0,valign:"top",
    fontFace:F,fontSize:10.5,bold:true,color:BERRY});
  s.addText(t[1],{x:x+0.34,y:y+0.22,w:U/2-0.34,h:0.28,isTextBox:true,margin:0,valign:"top",
    fontFace:F,fontSize:8.5,color:MUTE,lineSpacing:11.5});
});

/* ---- closing band ---- */
s.addShape(p.ShapeType.roundRect,{x:M,y:6.12,w:U,h:0.78,rectRadius:0.03,fill:{color:TINT},
  line:{color:LINE,width:1}});
s.addShape(p.ShapeType.rect,{x:M,y:6.12,w:0.06,h:0.78,fill:{color:BERRY}});
s.addText([{text:"ワインの仕入れも、保管も、お客様も、すべてこのために使えます。\n",
   options:{fontSize:11.5,bold:true,color:INK}},
  {text:"ただ一つ、私たちだけでは決して作れないものがあります。それは、長い時間をかけて一人の料理人が積み上げた、日本の頂点にあるガストロノミーです。",
   options:{fontSize:10,color:MUTE}}],
  {x:M+0.30,y:6.20,w:U-0.60,h:0.62,isTextBox:true,margin:0,valign:"middle",fontFace:F,lineSpacing:16});

/* ---- footer ---- */
s.addText("CONFIDENTIAL",{x:M,y:7.04,w:4,h:0.22,isTextBox:true,margin:0,valign:"top",
  fontFace:F,fontSize:8.5,color:"A99CA1"});
s.addText("17",{x:SW-M-1,y:7.04,w:1,h:0.22,isTextBox:true,margin:0,align:"right",valign:"top",
  fontFace:F,fontSize:9,color:"A99CA1"});

p.writeFile({fileName:"国内オーベルジュ構想_p17.pptx"}).then(f=>console.log("WROTE",f));
