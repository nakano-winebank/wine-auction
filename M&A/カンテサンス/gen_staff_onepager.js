const pptxgen = require("pptxgenjs");
const p = new pptxgen();
p.layout = "LAYOUT_WIDE";
p.title = "カンテサンスを、次の世代へ（主要メンバーの皆さまへ）";
p.author = "株式会社WineBank";

const BERRY="6D2E46", GOLD="B58B2A", INK="1F1A1C", MUTE="6E6368", TINT="F7F3F4", LINE="E4DADD", W="FFFFFF";
const SERIF="Cambria", SANS="Calibri";
const SW=13.33, M=0.62, CW=SW-2*M;

const s=p.addSlide();
s.background={color:W};
s.addText("主要メンバーの皆さまへ",{x:M,y:0.32,w:8,h:0.26,isTextBox:true,margin:0,fontFace:SANS,fontSize:11,bold:true,color:GOLD,charSpacing:1.4});
s.addText("カンテサンスを、次の世代へ",{x:M,y:0.6,w:CW,h:0.52,isTextBox:true,margin:0,fontFace:SERIF,fontSize:26,bold:true,color:INK});
s.addText("岸田シェフが築いてきたカンテサンスをこの先も続けていくために、株式会社WineBankと一緒に歩むことを考えています。変わらないこと、新たにお願いすること、皆さまにとってのメリットを、正直にお伝えします。",
  {x:M,y:1.16,w:CW,h:0.5,isTextBox:true,margin:0,fontFace:SANS,fontSize:12,color:MUTE,lineSpacing:17});

/* 3つの柱 */
const cols=[
 ["変わらないこと",[
   "店名・料理・サービス・予約の仕組みはそのまま",
   "雇用は続き、給与が下がることはありません",
   "岸田シェフは3年間、これまで通り厨房に立ちます",
   "お客様・お取引先との関係もこれまで通り"]],
 ["新たにお願いすること",[
   "週1回の会議：売上（ランチ／ディナー別）、アルコールとフードの比率、原価とロスを一緒に確認",
   "そのための日報と、Excelへの入力",
   "後継の体制づくりへのご協力",
   "3年後の世代交代に向けた準備"]],
 ["皆さまにとってのメリット",[
   "役職給・能力給による給与の増額",
   "半年に1回の昇給・昇格の機会",
   "3年間、承継を支えてくださった方への承継ボーナス",
   "経営の数字を扱う経験（独立・管理職で役立ちます）",
   "独立を目指す方への支援（アピシウスでお店を用意した実績あり）",
   "ワインの仕入れ網と知識、新しい業態でのポスト"]]];
const cw=(CW-0.4)/3, top=1.86, ch=3.3;
cols.forEach((c,i)=>{
  const x=M+i*(cw+0.2), hi=(i===2);
  s.addShape(p.ShapeType.roundRect,{x,y:top,w:cw,h:ch,rectRadius:0.05,fill:{color:hi?TINT:W},line:{color:hi?BERRY:LINE,width:hi?1.25:0.75}});
  s.addShape(p.ShapeType.rect,{x,y:top,w:cw,h:0.46,fill:{color:i===1?GOLD:BERRY},line:{color:i===1?GOLD:BERRY}});
  s.addText(c[0],{x:x+0.2,y:top,w:cw-0.4,h:0.46,isTextBox:true,margin:0,valign:"middle",fontFace:SANS,fontSize:13.5,bold:true,color:W});
  s.addText(c[1].map(t=>({text:t,options:{bullet:{indent:13},paraSpaceAfter:5}})),
    {x:x+0.18,y:top+0.6,w:cw-0.36,h:ch-0.72,isTextBox:true,margin:0,valign:"top",fontFace:SANS,fontSize:11,color:INK,lineSpacing:15});
});

/* 3年間の流れ */
const fy=5.38;
s.addText("3年間の流れ",{x:M,y:fy,w:4,h:0.26,isTextBox:true,margin:0,fontFace:SANS,fontSize:11.5,bold:true,color:GOLD});
const steps=[["1年目","これまで通り。WineBankは皆さまのお話を伺うことから始めます"],
             ["2年目","次の料理長候補（2人体制）が入り、岸田シェフと並走します"],
             ["3年目","次の料理長へ引き継ぎ、岸田シェフは卒業します"]];
const fw=7.7, sw=(fw-0.24)/3;
steps.forEach((t,i)=>{
  const x=M+i*(sw+0.12);
  s.addShape(p.ShapeType.roundRect,{x,y:fy+0.32,w:sw,h:0.98,rectRadius:0.05,fill:{color:TINT},line:{color:LINE,width:0.75}});
  s.addText(t[0],{x:x+0.15,y:fy+0.38,w:sw-0.3,h:0.28,isTextBox:true,margin:0,fontFace:SANS,fontSize:11.5,bold:true,color:BERRY});
  s.addText(t[1],{x:x+0.15,y:fy+0.66,w:sw-0.3,h:0.58,isTextBox:true,margin:0,valign:"top",fontFace:SANS,fontSize:9.5,color:INK,lineSpacing:12.5});
});

/* 個別面談のご案内 */
const bx=M+fw+0.25, bw=CW-fw-0.25;
s.addShape(p.ShapeType.roundRect,{x:bx,y:fy+0.32,w:bw,h:0.98,rectRadius:0.05,fill:{color:BERRY},line:{color:BERRY}});
s.addText([{text:"このあと、お一人30分ずつお話を伺います\n",options:{bold:true,fontSize:12,color:W}},
           {text:"不安なこと、聞きたいことを何でもお聞かせください。参加するかどうかは、お話を聞いたうえでご判断ください。",options:{fontSize:9.5,color:"E3D2D7"}}],
  {x:bx+0.2,y:fy+0.36,w:bw-0.4,h:0.9,isTextBox:true,margin:0,valign:"middle",fontFace:SANS,lineSpacing:14});

s.addText("主要メンバー向け／社外秘　　株式会社プティ・ボノム 岸田周三　・　株式会社WineBank 中野邦人",
  {x:M,y:7.08,w:CW,h:0.22,isTextBox:true,margin:0,fontFace:SANS,fontSize:8,color:MUTE});

p.writeFile({fileName:"主要メンバー向け説明_カンテサンスを次の世代へ_20261025.pptx"}).then(f=>console.log("WROTE",f));
