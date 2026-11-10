// SPC投資家向け 出資額に応じた特典（3億円・5億円）1枚
const pptxgen = require("pptxgenjs");
const p = new pptxgen();
p.layout = "LAYOUT_WIDE"; // 13.33 x 7.5
p.title = "投資家特典（3億円・5億円）";
p.author = "株式会社WineBank";

const BERRY="6D2E46", DEEP="4A1C30", GOLD="B58B2A", INK="1F1A1C", MUTE="6E6368", TINT="F7F3F4", LINE="E4DADD", W="FFFFFF";
const SERIF="Cambria", SANS="Calibri";
const SW=13.33, M=0.6, CW=SW-2*M;

const s = p.addSlide();
s.background = {color:W};
s.addText("投資家様へのご案内｜カンテサンス買収SPC", {x:M,y:0.30,w:9,h:0.26,isTextBox:true,margin:0,
  fontFace:SANS,fontSize:11,bold:true,color:GOLD,charSpacing:1.2});
s.addText("投資家特典", {x:M,y:0.58,w:CW,h:0.50,isTextBox:true,margin:0,fontFace:SERIF,fontSize:26,bold:true,color:INK});
s.addText("ご出資額に応じて、カンテサンスとWineBankグループの特典をご用意します。",
  {x:M,y:1.10,w:CW,h:0.30,isTextBox:true,margin:0,fontFace:SANS,fontSize:12,color:MUTE});

const gap=0.35, cw=(CW-gap)/2, cy=1.62, ch=4.95;
function card(x, title, sub, fill, items){
  s.addShape(p.ShapeType.rect,{x,y:cy,w:cw,h:ch,fill:{color:W},line:{color:LINE,width:1}});
  s.addShape(p.ShapeType.rect,{x,y:cy,w:cw,h:0.78,fill:{color:fill},line:{color:fill}});
  s.addText(title,{x:x+0.3,y:cy+0.10,w:cw-0.6,h:0.38,isTextBox:true,margin:0,fontFace:SERIF,fontSize:20,bold:true,color:W});
  s.addText(sub,{x:x+0.3,y:cy+0.47,w:cw-0.6,h:0.24,isTextBox:true,margin:0,fontFace:SANS,fontSize:10.5,color:"F1E6EA"});
  let y=cy+0.92;
  items.forEach(it=>{
    if(it.sec){
      s.addText(it.sec,{x:x+0.3,y,w:cw-0.6,h:0.26,isTextBox:true,margin:0,fontFace:SANS,fontSize:10.5,bold:true,color:GOLD});
      y+=0.28; return;
    }
    s.addShape(p.ShapeType.ellipse,{x:x+0.32,y:y+0.09,w:0.10,h:0.10,fill:{color:fill},line:{color:fill}});
    s.addText(it.t,{x:x+0.52,y,w:cw-0.85,h:0.27,isTextBox:true,margin:0,fontFace:SANS,fontSize:12.5,bold:true,color:INK});
    s.addText(it.d,{x:x+0.52,y:y+0.27,w:cw-0.85,h:0.25,isTextBox:true,margin:0,fontFace:SANS,fontSize:10,color:MUTE});
    y+=0.555;
  });
}
card(M,"3億円","カンテサンスの特典",BERRY,[
  {t:"記念日ディナーへのご招待", d:"2名様・年1回（コース代金のみ）"},
  {t:"3か月先以降の優先予約", d:"通常の予約受付（3か月先まで）より前にご予約いただけます"},
  {t:"お食事とグラスワインを半額", d:"ご来店時、4名様まで"},
  {t:"名物の手土産「ガトー・オ・コンテ」", d:"四半期に一度、ご指定先にお届け"},
]);
card(M+cw+gap,"5億円（アンカー投資家・最大2名様）","3億円の特典に加えて",DEEP,[
  {sec:"アンカー投資家特典"},
  {t:"WineBankの運営収益の分配", d:"AM報酬と成果報酬（WineBank分）の10%をお1人様に"},
  {t:"5年後の買取のお約束", d:"売却先が決まらない場合、WineBankが評価額で買い取ります"},
  {t:"WineBank株式の新株予約権", d:"WineBankグループの成長にもご参加いただけます"},
  {sec:"さらに"},
  {t:"店内に「マイセラー」", d:"6本分を確保。抜栓料なしで1日2本までご利用いただけます"},
  {t:"WineBank系列店でのご優待", d:"グループの店舗でご優待をご用意します"},
  {t:"WineBank Club ブラック会員相当", d:"年間60万円相当の特典"},
]);

s.addText("※ ご予約は空席状況によります。特典の詳細と条件は投資契約で定めます。投資家特典の内容は、品質と希少性の維持を前提に岸田シェフおよび店舗と協議のうえ確定します。",
  {x:M,y:6.70,w:CW,h:0.26,isTextBox:true,margin:0,fontFace:SANS,fontSize:9,color:MUTE});
s.addShape(p.ShapeType.line,{x:M,y:7.02,w:CW,h:0,line:{color:LINE,width:0.75}});
s.addText("株式会社WineBank　2026年11月",{x:M,y:7.08,w:CW,h:0.22,isTextBox:true,margin:0,fontFace:SANS,fontSize:8,color:MUTE});

p.writeFile({fileName: process.argv[2] || "投資家特典_3億5億_20261110.pptx"}).then(f=>console.log("WROTE",f));
