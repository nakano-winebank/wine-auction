const pptxgen = require("pptxgenjs");
const p = new pptxgen();
p.layout = "LAYOUT_WIDE";
p.title = "条件合意とLOIの比較（投資家様向け）";
p.author = "株式会社WineBank";

const BERRY="6D2E46", ROSE="A26769", GOLD="B58B2A", INK="1F1A1C", MUTE="6E6368",
      TINT="F7F3F4", LINE="E4DADD", W="FFFFFF", GRN="2E6F4E", RED="9B2C2C", PGRN="EAF2ED", PRED="F6E9E9";
const SERIF="Cambria", SANS="Calibri";
const SW=13.33, M=0.62, CW=SW-2*M;
let pageNo=0;

function header(s,k,t,l){
  s.background={color:W};
  s.addText(k,{x:M,y:0.34,w:10,h:0.26,isTextBox:true,margin:0,fontFace:SANS,fontSize:11,bold:true,color:GOLD,charSpacing:1.4});
  s.addText(t,{x:M,y:0.62,w:CW,h:0.52,isTextBox:true,margin:0,fontFace:SERIF,fontSize:24,bold:true,color:INK});
  if(l) s.addText(l,{x:M,y:1.17,w:CW,h:0.30,isTextBox:true,margin:0,fontFace:SANS,fontSize:11.5,color:MUTE});
}
function footer(s){ pageNo++;
  s.addText("社外秘 ／ 検討中の条件を含み、最終契約により変更となる可能性があります ／ 2026年10月 株式会社WineBank",
    {x:M,y:7.08,w:10.5,h:0.22,isTextBox:true,margin:0,fontFace:SANS,fontSize:8,color:MUTE});
  s.addText(String(pageNo),{x:SW-M-0.6,y:7.08,w:0.6,h:0.22,isTextBox:true,margin:0,fontFace:SANS,fontSize:9,color:MUTE,align:"right"});
}
const hd=(t,o={})=>({text:t,options:Object.assign({bold:true,color:W,fill:{color:BERRY},fontSize:9.5,valign:"middle"},o)});
const c=(t,o={})=>({text:t,options:Object.assign({valign:"middle"},o)});
const num=(t,o={})=>c(t,Object.assign({align:"right"},o));
const tOpt=(x)=>Object.assign({fontFace:SANS,fontSize:9,color:INK,border:{type:"solid",pt:0.5,color:LINE},
  valign:"middle",autoPage:false,margin:[3,5,3,5]},x);
function card(s,x,y,w,h,no,title,body,o={}){
  s.addShape(p.ShapeType.roundRect,{x,y,w,h,rectRadius:0.05,fill:{color:o.fill||TINT},line:{color:o.line||LINE,width:0.75}});
  s.addShape(p.ShapeType.ellipse,{x:x+0.18,y:y+0.18,w:0.36,h:0.36,fill:{color:o.dot||BERRY},line:{color:o.dot||BERRY}});
  s.addText(String(no),{x:x+0.18,y:y+0.18,w:0.36,h:0.36,isTextBox:true,margin:0,align:"center",valign:"middle",
    fontFace:SANS,fontSize:11,bold:true,color:W});
  s.addText(title,{x:x+0.66,y:y+0.16,w:w-0.82,h:0.42,isTextBox:true,margin:0,valign:"middle",
    fontFace:SANS,fontSize:o.ts||12,bold:true,color:o.tc||BERRY});
  s.addText(body,{x:x+0.20,y:y+0.66,w:w-0.40,h:h-0.78,isTextBox:true,margin:0,valign:"top",
    fontFace:SANS,fontSize:o.bs||9.5,color:INK,lineSpacing:o.ls||13});
}

/* ===== S1 サマリー ===== */
{
const s=p.addSlide();
header(s,"SUMMARY","LOI（9/30提出）から条件合意（10/9）へ ― 何が変わったか",
  "確定で払う部分を50〜51億円に抑え、上振れ分は「星評価の維持」を条件とする後払い（アーンアウト）に切り替えました。");
const y=1.72, h=2.05, w=(CW-0.3)/3;
card(s,M,y,w,h,1,"追加の支払いは「星評価の維持」が条件",
  "4年後・5年後に各4億円。評価を失えば支払いは不要です。\n\nLOIでは最大5.3億円の上乗せを決済前の確認事項で決める設計でしたが、今回は最大のリスクと支払いが直接連動します。");
card(s,M+w+0.15,y,w,h,2,"決済時の支払いは約2〜3億円増",
  "固定の株式譲渡対価50〜51億円に、役員報酬の前払い2.25億円と上乗せ約0.5億円（調整中）が加わります。\n\nSPCで用意する資金は約30.5億円から約32.5〜33.5億円に増えます。");
card(s,M+2*(w+0.15),y,w,h,3,"売主の関与は2〜3年＋成果連動",
  "ロックアップ（在任義務）は2年または3年で、その後の出勤義務はありません。\n\n代わりに、後継料理長の育成と星評価の維持に対して、合計8億円の強い動機付けが働きます。");

s.addText("支払いの比較（単位：億円）",{x:M,y:4.02,w:6,h:0.26,isTextBox:true,margin:0,fontFace:SANS,fontSize:11,bold:true,color:GOLD});
s.addTable([
  [hd(""),hd("LOI（9/30提出）",{align:"center"}),hd("条件合意（10/9）",{align:"center"}),hd("差",{align:"center"})],
  [c("決済時に払う対価"),num("50.2〜55.3"),num("52.75〜53.75"),num("確定部分は上限が下がる",{color:MUTE,fontSize:8.5})],
  [c("条件付きの後払い"),num("―"),num("0〜8.0"),num("星評価の維持が条件",{color:MUTE,fontSize:8.5})],
  [c("仲介手数料"),num("1.68"),num("約1.12"),num("▲約0.55",{color:GRN,bold:true})],
  [c("最大の総額（手数料除く）",{bold:true,fill:{color:TINT}}),num("55.3",{bold:true,fill:{color:TINT}}),
   num("61.75",{bold:true,fill:{color:TINT}}),num("星評価を維持できた場合のみ",{color:MUTE,fontSize:8.5,fill:{color:TINT}})]
],tOpt({x:M,y:4.32,w:CW,colW:[3.4,2.6,2.6,3.49],rowH:0.36,fontSize:10}));
s.addText("※ LOIの決済時対価は、事業価値27.8億円＋決済日のネットキャッシュ実額（下限50億円、12月末決済で約50.2億円）。上限55.3億円はDDでの確認事項に応じた上乗せ。条件合意の決済時対価は、株式譲渡対価50億円（今期計画を約1,000万円上回れば51億円）＋役員報酬の前払い2.25億円＋上乗せ約0.5億円（仲介手数料の減額分。調整中）。",
  {x:M,y:6.25,w:CW,h:0.6,isTextBox:true,margin:0,fontFace:SANS,fontSize:8.5,color:MUTE,lineSpacing:12});
footer(s);
}

/* ===== S2 条件比較 ===== */
{
const s=p.addSlide();
header(s,"COMPARISON","主要条件の比較",
  "評価欄は、当社と投資家様から見た有利・不利です。");
const good=t=>c(t,{color:GRN,bold:true,align:"center"});
const bad=t=>c(t,{color:RED,bold:true,align:"center"});
const neu=t=>c(t,{color:GOLD,bold:true,align:"center"});
s.addTable([
  [hd("項目"),hd("LOI（9/30提出）"),hd("条件合意（10/9）"),hd("評価",{align:"center"})],
  [c("株式譲渡対価",{bold:true}),c("事業価値27.8億円＋決済日のネットキャッシュ実額（下限50億円）"),
   c("固定50億円（今期計画を約1,000万円上回れば51億円）"),bad("不利\nネットキャッシュ連動なし")],
  [c("上乗せ",{bold:true}),c("DDでの確認事項に応じて最大＋5.3億円（上限55.3億円）を決済時に支払い"),
   c("なし（上振れ分はアーンアウトに一本化）"),good("有利")],
  [c("役員報酬",{bold:true}),c("協議（現行：月60万円＋事前確定届出の賞与 年約9,540万円）"),
   c("年9,500万円のうち7,500万円×3年＝2.25億円を株式対価として決済時に前払い。残る年2,000万円は報酬として支給"),bad("不利\n税効果を失う")],
  [c("アーンアウト",{bold:true}),c("なし"),
   c("4年後・5年後に各4億円（星評価の維持が条件。勤務条件なし。報酬込み）"),neu("リスク連動は有利\n資金負担に留意")],
  [c("仲介手数料",{bold:true}),c("1.678億円"),
   c("約1.12億円（差額約0.5億円は対価への上乗せで調整中）"),good("有利")],
  [c("在任・ロックアップ",{bold:true}),c("3年間の在任（役割・報酬は協議）"),
   c("A案：2年（後継料理長が決まり、双方が合意した場合）／B案：3年"),neu("中立\nA案は当社の合意が条件")],
  [c("ロックアップ後",{bold:true}),c("監修として関与（週1〜2回程度のイメージ）"),
   c("出勤義務なし（監修の日数・方法は売主の裁量）"),bad("不利\n競業避止で補う")],
  [c("決済時の支払い（手数料込み）",{bold:true}),c("約51.9〜57.0億円"),
   c("約53.9〜54.9億円"),neu("下限比＋2〜3億円")],
  [c("最大の総額（手数料除く）",{bold:true}),c("55.3億円"),
   c("61.75億円（星評価を維持できた場合）"),neu("成果が出た場合のみ")]
],tOpt({x:M,y:1.62,w:CW,colW:[2.0,3.9,4.4,1.79],rowH:0.48,fontSize:9.5}));
footer(s);
}

/* ===== S3 メリット・デメリット ===== */
{
const s=p.addSlide();
header(s,"PROS & CONS","当社と投資家様から見たメリット・デメリット",
  "最大のリスク（星評価の喪失）と支払いが連動した一方、決済時の資金負担と契約で手当てすべき点が増えました。");
const colW=(CW-0.3)/2, y0=1.62;
s.addShape(p.ShapeType.roundRect,{x:M,y:y0,w:colW,h:0.42,rectRadius:0.04,fill:{color:GRN},line:{color:GRN}});
s.addText("メリット",{x:M,y:y0,w:colW,h:0.42,isTextBox:true,margin:0,align:"center",valign:"middle",fontFace:SANS,fontSize:13,bold:true,color:W});
s.addShape(p.ShapeType.roundRect,{x:M+colW+0.3,y:y0,w:colW,h:0.42,rectRadius:0.04,fill:{color:RED},line:{color:RED}});
s.addText("デメリット・留意点",{x:M+colW+0.3,y:y0,w:colW,h:0.42,isTextBox:true,margin:0,align:"center",valign:"middle",fontFace:SANS,fontSize:13,bold:true,color:W});
const pros=[
 ["追加8億円は星評価の維持が条件","評価を失えば支払い不要。払えるときにだけ払う設計で、LOIの上乗せ（決済前の確認事項で最大5.3億円）より健全です。"],
 ["確定で払う価格の上限が下がった","株式譲渡対価は50〜51億円で確定。LOIの上限55.3億円より低く、上振れ分は成果が出た場合のみ支払います。"],
 ["売主に強い動機付け","後継料理長の育成と評価の維持に、合計8億円のインセンティブが働きます。"],
 ["決済後3年間の利益が改善","役員報酬が年約1.0億円から2,000万円に下がり、営業利益が年約0.8億円改善。返済余力（DSCR）にも効きます。"],
 ["手数料の減額と競合での合意","仲介手数料は約▲0.55億円。3社競合の中で売主の了承を得て、トップ面談に進みました。"]];
const cons=[
 ["決済時の資金が約2〜3億円増","SPCで用意する資金は約30.5億円から約32.5〜33.5億円へ。出資または借入の増額が必要です。"],
 ["前払い2.25億円の税効果を失う","株式対価は損金になりません。従来どおり賞与で払えば損金になるため、差額の約0.77億円を当社が負担します。"],
 ["ネットキャッシュ連動がなくなった","価格が固定のため、決済までの配当・賞与・退職金などの資金流出を契約で防ぐ必要があります。"],
 ["51億円の判定が一段階","計画を約1,000万円上回るだけで1億円増える設計。判定する利益の定義を詰める必要があります。"],
 ["アーンアウトの資金負担","4年目・5年目に各4億円は単年のキャッシュフロー（約3.5億円）を超え、借入の返済期間とも重なります。"],
 ["ロックアップ後の関与","出勤義務がなくなります。競業避止と名称の使用許諾で補います。A案では在任2年で3年分を前払いします。"]];
function list(items,x,col){
  const ih=(6.95-(y0+0.55))/items.length;
  items.forEach((it,i)=>{
    const yy=y0+0.55+i*ih;
    s.addShape(p.ShapeType.rect,{x,y:yy+0.06,w:0.07,h:ih-0.16,fill:{color:col},line:{color:col}});
    s.addText(it[0],{x:x+0.2,y:yy+0.02,w:colW-0.25,h:0.3,isTextBox:true,margin:0,fontFace:SANS,fontSize:11,bold:true,color:INK});
    s.addText(it[1],{x:x+0.2,y:yy+0.32,w:colW-0.25,h:ih-0.38,isTextBox:true,margin:0,valign:"top",fontFace:SANS,fontSize:9.5,color:MUTE,lineSpacing:12.5});
  });
}
list(pros,M,GRN); list(cons,M+colW+0.3,RED);
footer(s);
}

/* ===== S4 税務の整理 ===== */
{
const s=p.addSlide();
header(s,"TAX","支払項目ごとの税務上の整理",
  "当社と売主を合わせた税負担が最も小さくなる形で整理しています（当社の実効税率34.4%で試算）。");
s.addTable([
  [hd("支払項目"),hd("当社側の扱い"),hd("売主側の扱い"),hd("方針")],
  [c("株式譲渡対価\n50〜51億円",{bold:true}),c("株式の取得価額（損金にならない）"),c("譲渡所得 20.315%"),c("LOIと同じ")],
  [c("役員報酬の前払い\n2.25億円",{bold:true}),
   c("株式対価のため損金にならない。従来どおり賞与で払えば損金になるため、税効果は約▲7,740万円",{color:RED}),
   c("給与（最高税率 約56%）から譲渡所得（20.315%）に変わり、約6,700万円の節税"),
   c("両者合計の税負担はほぼ同じで、効果が当社から売主へ移る。総額55億円の内数として交渉材料にする")],
  [c("アーンアウト\n4億円×2回",{bold:true}),
   c("株式対価（損金にならない）"),
   c("譲渡所得 20.315%（手取り 1回3.19億円）"),
   c("株式対価で支払う。報酬に振り替えると売主の税率が約54%になり、同じ手取りには約7.1億円の支給が必要（当社の税引後負担4.66億円）で不利")],
  [c("役員退職金\n約3,600万円",{bold:true}),
   c("損金（月額報酬60万円×在任20年×功績倍率3.0）。節税 約1,240万円",{color:GRN}),
   c("退職所得で税負担 約455万円（株式対価なら約731万円）",{color:GRN}),
   c("決済前に支給し、同額を対価から控除。売主の代表取締役退任が要件")]
],tOpt({x:M,y:1.62,w:CW,colW:[2.0,3.4,3.1,3.59],rowH:[0.4,0.7,0.95,0.95,0.95],fontSize:9.5}));
s.addShape(p.ShapeType.roundRect,{x:M,y:5.95,w:CW,h:0.88,rectRadius:0.04,fill:{color:TINT},line:{color:LINE,width:0.75}});
s.addText([
  {text:"ポイント　",options:{bold:true,color:GOLD}},
  {text:"アーンアウトは株式対価のまま支払うのが、両者合計の税負担が最も小さい形です。役員退職金は当社・売主の双方に得があるため活用します。前払いの税効果（約0.77億円）は当社の実質負担として認識し、総額の交渉で考慮を求めます。最終的な税務処理は、当社の税理士の確認を経て確定します。",options:{color:INK}}],
  {x:M+0.25,y:6.0,w:CW-0.5,h:0.78,isTextBox:true,margin:0,valign:"middle",fontFace:SANS,fontSize:10,lineSpacing:14});
footer(s);
}

/* ===== S5 資金計画と今後 ===== */
{
const s=p.addSlide();
header(s,"FUNDING & NEXT","資金計画への影響と、最終契約で手当てする事項",
  "決済時の資金は約2〜3億円増えます。アーンアウトの支払いに備え、資金の手当てと契約条件を先に固めます。");
s.addText("決済時にSPCで用意する資金（単位：億円）",{x:M,y:1.6,w:6,h:0.26,isTextBox:true,margin:0,fontFace:SANS,fontSize:11,bold:true,color:GOLD});
s.addTable([
  [hd("項目"),hd("LOI",{align:"right"}),hd("条件合意",{align:"right"})],
  [c("株式譲渡対価"),num("50.2"),num("50.0〜51.0")],
  [c("役員報酬の前払い"),num("―"),num("2.25")],
  [c("対価の上乗せ（調整中）"),num("―"),num("約0.5")],
  [c("仲介手数料"),num("1.68"),num("約1.12")],
  [c("（控除）対象会社の余剰現預金",{color:MUTE}),num("▲21.4",{color:MUTE}),num("▲21.4",{color:MUTE})],
  [c("SPCで用意する資金（出資＋借入）",{bold:true,fill:{color:TINT}}),num("約30.5",{bold:true,fill:{color:TINT}}),num("約32.5〜33.5",{bold:true,fill:{color:TINT},color:RED})]
],tOpt({x:M,y:1.9,w:5.9,colW:[3.3,1.2,1.4],rowH:0.36,fontSize:10}));
s.addText("※ 対象会社の余剰現預金（現預金＋役員貸付金の精算−運転資金の留保）は、ブリッジローンで立て替え、合併直後に返済します。役員退職金は対価と現預金が同額減るため、必要資金は変わりません。",
  {x:M,y:4.5,w:5.9,h:0.6,isTextBox:true,margin:0,fontFace:SANS,fontSize:8.5,color:MUTE,lineSpacing:12});

const rx=M+6.3, rw=CW-6.3;
s.addText("アーンアウト（4年目・5年目 各4億円）の資金",{x:rx,y:1.6,w:rw,h:0.26,isTextBox:true,margin:0,fontFace:SANS,fontSize:11,bold:true,color:GOLD});
s.addShape(p.ShapeType.roundRect,{x:rx,y:1.9,w:rw,h:1.55,rectRadius:0.04,fill:{color:TINT},line:{color:LINE,width:0.75}});
["1〜3年目の配当の一部を積み立てる","支払時点で借換えを行う","一部を株式で支払う（手元資金を温存）","銀行借入の返済より後回し（劣後）とし、分割払いも可能とする"].forEach((t,i)=>
  s.addText("・"+t,{x:rx+0.2,y:2.03+i*0.33,w:rw-0.4,h:0.3,isTextBox:true,margin:0,valign:"middle",fontFace:SANS,fontSize:10,color:INK}));

s.addText("最終契約（SPA）で手当てする事項",{x:rx,y:3.62,w:rw,h:0.26,isTextBox:true,margin:0,fontFace:SANS,fontSize:11,bold:true,color:GOLD});
const items=[
 ["資金流出の防止","決済までの配当・賞与・退職金等を禁止し、出た分は対価から控除"],
 ["51億円の判定基準","対象とする利益、一時的な収入の除外、支払時期"],
 ["前払いの返還条項","自己都合の退任・解任時の返還、不測の事態の扱い"],
 ["アーンアウトの定義","判定するガイドの年版、移転時・休刊時の扱い、劣後"],
 ["競業避止と名称使用","少なくともアーンアウト期間（5年）まで有効に"],
 ["売主の代表退任","役員退職金を損金にするための要件"]];
items.forEach((it,i)=>{
  const yy=3.92+i*0.5;
  s.addShape(p.ShapeType.ellipse,{x:rx,y:yy+0.07,w:0.28,h:0.28,fill:{color:BERRY},line:{color:BERRY}});
  s.addText(String(i+1),{x:rx,y:yy+0.07,w:0.28,h:0.28,isTextBox:true,margin:0,align:"center",valign:"middle",fontFace:SANS,fontSize:9,bold:true,color:W});
  s.addText(it[0],{x:rx+0.4,y:yy,w:1.75,h:0.42,isTextBox:true,margin:0,valign:"middle",fontFace:SANS,fontSize:10,bold:true,color:INK});
  s.addText(it[1],{x:rx+2.15,y:yy,w:rw-2.15,h:0.42,isTextBox:true,margin:0,valign:"middle",fontFace:SANS,fontSize:9,color:MUTE,lineSpacing:11});
});

s.addText("今後の日程",{x:M,y:5.25,w:5.9,h:0.26,isTextBox:true,margin:0,fontFace:SANS,fontSize:11,bold:true,color:GOLD});
const steps=[["10/11","売主とのトップ面談"],["10月","独占交渉・DD開始"],["12月中旬","最終契約の締結"],["12月末","決済"]];
const sw=(5.9-0.3)/4;
steps.forEach((st,i)=>{
  const x=M+i*(sw+0.1);
  s.addShape(p.ShapeType.roundRect,{x,y:5.55,w:sw,h:1.2,rectRadius:0.04,fill:{color:i===0?BERRY:TINT},line:{color:i===0?BERRY:LINE,width:0.75}});
  s.addText(st[0],{x:x+0.08,y:5.65,w:sw-0.16,h:0.4,isTextBox:true,margin:0,align:"center",fontFace:SERIF,fontSize:15,bold:true,color:i===0?W:BERRY});
  s.addText(st[1],{x:x+0.08,y:6.1,w:sw-0.16,h:0.55,isTextBox:true,margin:0,align:"center",valign:"top",fontFace:SANS,fontSize:9.5,color:i===0?"E3D2D7":INK,lineSpacing:12});
});
footer(s);
}

p.writeFile({fileName:"条件合意とLOIの比較_投資家様向け_20261010.pptx"}).then(f=>console.log("WROTE",f));
