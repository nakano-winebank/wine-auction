const pptxgen = require("pptxgenjs");
const p = new pptxgen();
p.defineLayout({name:"A4P", width:8.27, height:11.69});
p.layout = "A4P";
p.title = "承継後に増える仕事と、成長・報酬へのつながり（ノンネーム）";
p.author = "株式会社WineBank";

const BERRY="6D2E46", GOLD="B58B2A", INK="1F1A1C", MUTE="6E6368", TINT="F7F3F4", LINE="E4DADD", W="FFFFFF";
const SERIF="Cambria", SANS="Calibri";
const PW=8.27, M=0.5, CW=PW-2*M;

const s=p.addSlide();
s.background={color:W};
s.addText("事業承継を行う場合の想定",{x:M,y:0.36,w:CW,h:0.24,isTextBox:true,margin:0,fontFace:SANS,fontSize:10,bold:true,color:GOLD,charSpacing:1.2});
s.addText("増える仕事と、それが成長と報酬にどうつながるか",{x:M,y:0.62,w:CW,h:0.42,isTextBox:true,margin:0,fontFace:SERIF,fontSize:19,bold:true,color:INK});
s.addText("料理、サービス、お客様への向き合い方は変えません。増えるのは「自分たちの数字で振り返る」、スキルアップを含めた業務です。過去に承継した老舗レストランで、毎月実際に運用している内容をもとにまとめました。",
  {x:M,y:1.08,w:CW,h:0.5,isTextBox:true,margin:0,fontFace:SANS,fontSize:10,color:MUTE,lineSpacing:14});

/* 変わらないこと */
s.addShape(p.ShapeType.roundRect,{x:M,y:1.68,w:CW,h:0.42,rectRadius:0.04,fill:{color:TINT},line:{color:LINE,width:0.75}});
s.addText([{text:"変わらないこと　",options:{bold:true,color:BERRY}},
           {text:"店名・料理・サービス・予約の仕組み／雇用と給与（下がることはありません）／シェフはこれまで通り厨房に立つ",options:{color:INK}}],
  {x:M+0.15,y:1.68,w:CW-0.3,h:0.42,isTextBox:true,margin:0,valign:"middle",fontFace:SANS,fontSize:9.5});

/* 1. 増える仕事 */
const sub=(y,t)=>s.addText(t,{x:M,y,w:CW,h:0.26,isTextBox:true,margin:0,fontFace:SANS,fontSize:11.5,bold:true,color:GOLD});
sub(2.24,"1．増える仕事（頻度と時間は目安）");
const hd=(t)=>({text:t,options:{bold:true,color:W,fill:{color:BERRY},fontSize:9,valign:"middle"}});
const c=(t,o={})=>({text:t,options:Object.assign({valign:"middle"},o)});
const who=(t)=>c(t,{bold:true,color:BERRY,fill:{color:TINT}});
const rows=[
 [hd("誰が"),hd("増える仕事"),hd("頻度・時間"),hd("身につくこと")],
 [who("全員"),c("閉店後の日報：売上、客数、客単価、ワインを注文したお客様の割合"),c("毎日10分前後\n（今の閉店後の集計に追加）"),c("自分の店の数字を毎日つかむ習慣")],
 [who("料理長・\nスーシェフ"),c("・コースの理論原価表（食材ごとの原価）を作り、メニュー変更時に更新\n・月末の棚卸と、実際の原価率と理論原価率のズレの確認\n・食材ロス（廃棄）の金額の記録"),
   c("原価表：初回は数日、以降はメニュー変更ごとに数時間\n棚卸：月1回数時間\nロス記録：毎日"),c("原価の設計とロスの管理。独立したときに利益を出す力そのもの")],
 [who("支配人・\nサービス"),c("・シフトと労働時間・残業時間の管理（部門別）\n・アルバイト人件費の確認\n・予約の埋まり方（3か月先までの空席）の共有"),c("週1回30〜60分程度"),c("人件費と労務の管理")],
 [who("ソムリエ"),c("・ワイン・飲料の原価率（実際と理論の差）の確認と在庫の棚卸\n・料理／ワイン／飲料の売上比率の把握"),c("月1回数時間（在庫次第）"),c("仕入れと在庫を数字で判断する力")],
 [who("役職者\n（6名程度）"),c("・週1回の短い会議（営業前の空き時間）：売上の進み具合を予算と比べ、トラブルを報告する\n・月1回の月次会議：計画と実績の差を各担当が自分の数字で説明し、翌月以降の行動計画を立てる"),c("週30〜45分\n月2〜3時間\n※慣れてきたら減ります"),c("計画→実行→振り返りという、経営の回し方")],
];
s.addTable(rows,{x:M,y:2.54,w:CW,colW:[1.05,3.25,1.62,1.35],fontFace:SANS,fontSize:8.8,color:INK,
  border:{type:"solid",pt:0.5,color:LINE},autoPage:false,margin:[3,5,3,5],rowH:[0.3,0.5,0.98,0.72,0.6,0.92]});

s.addText("グルメサイトの運用は求めません。一方で、PR・広報にはご協力をお願いします。",
  {x:M,y:6.62,w:CW,h:0.24,isTextBox:true,margin:0,fontFace:SANS,fontSize:8.8,color:MUTE});

/* 2. 報酬への結び付き */
sub(6.86,"2．成長が報酬にどう結びつくか");
const pay=[
 ["役職給・能力給","上の役割を担う方には、役職と能力に応じた手当を上乗せします"],
 ["半年に1回の評価","昇給・昇格の機会。原価のズレ、ロス率、予約の埋まり方など、自分の担当の数字が評価の材料になります"],
 ["業績に応じた賞与","数字の改善で生まれた利益を、賞与として還元します（これまで賞与がない方は、半年ごとの評価面談の中で決めます）"],
 ["承継時の昇給","3年間の承継を支えてくださった方は、新体制での新しい役職に応じて昇給・昇格します"],
 ["独立の支援","独立を目指す方には、一定の審査と貢献度に応じて、出店などを支援します"],
];
pay.forEach((t,i)=>{
  const y=7.18+i*0.4;
  s.addShape(p.ShapeType.rect,{x:M,y:y+0.06,w:0.06,h:0.26,fill:{color:BERRY},line:{color:BERRY}});
  s.addText(t[0],{x:M+0.16,y,w:1.5,h:0.38,isTextBox:true,margin:0,valign:"middle",fontFace:SANS,fontSize:10,bold:true,color:BERRY});
  s.addText(t[1],{x:M+1.7,y,w:CW-1.7,h:0.38,isTextBox:true,margin:0,valign:"middle",fontFace:SANS,fontSize:9.3,color:INK,lineSpacing:12});
});

/* 3. 過去の承継事例 */
const by=9.3;
s.addShape(p.ShapeType.roundRect,{x:M,y:by,w:CW,h:1.62,rectRadius:0.05,fill:{color:BERRY},line:{color:BERRY}});
s.addText("過去の承継事例（都内の老舗レストラン）では",{x:M+0.22,y:by+0.1,w:CW-0.44,h:0.28,isTextBox:true,margin:0,fontFace:SANS,fontSize:11,bold:true,color:W});
s.addText([
  "人は入れ替えず、まずサービス残業の解消など、働く環境を整えることから始めました",
  "毎月の会議で原価・ロス・人件費を見える化した結果、利益が大きく伸び、給与も上がりました",
  "最初の半年は週1回の会議に経営陣も出席し、その後は月1回の会議と年2回の行事のみです",
  "社員全員と個別面談を行い、時期を空けて2巡目も実施しました"].map(t=>({text:t,options:{bullet:{indent:12},paraSpaceAfter:3}})),
  {x:M+0.22,y:by+0.42,w:CW-0.44,h:1.12,isTextBox:true,margin:0,valign:"top",fontFace:SANS,fontSize:9.3,color:"F3E9EC",lineSpacing:13});

s.addText("※ 頻度・時間は目安です。具体的な進め方は現場と相談して決めるため、上記より前後する可能性があります。",
  {x:M,y:11.1,w:CW,h:0.22,isTextBox:true,margin:0,fontFace:SANS,fontSize:8.5,bold:true,color:"9B2C2C"});

p.writeFile({fileName:"承継後に増える仕事と報酬_ノンネーム_20261025.pptx"}).then(f=>console.log("WROTE",f));
