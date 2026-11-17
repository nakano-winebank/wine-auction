// 岸田様とのお打ち合わせ用 1枚資料：譲渡条件の確認（2026年11月18日）
const pptxgen = require("pptxgenjs");
const p = new pptxgen();
p.layout = "LAYOUT_WIDE"; // 13.33 x 7.5
p.title = "譲渡条件の確認";
p.author = "株式会社WineBank";

const BERRY="6D2E46", DEEP="4A1C30", GOLD="B58B2A", INK="1F1A1C", MUTE="6E6368", TINT="F7F3F4", LINE="E4DADD", W="FFFFFF";
const SERIF="Cambria", SANS="Calibri";
const SW=13.33, M=0.55, CW=SW-2*M;

const s = p.addSlide();
s.background = {color:W};

/* ---- 見出し ---- */
s.addText("岸田様とのお打ち合わせ資料｜2026年11月18日", {x:M,y:0.28,w:9,h:0.26,isTextBox:true,margin:0,
  fontFace:SANS,fontSize:11,bold:true,color:GOLD,charSpacing:1.2});
s.addText("譲渡条件の確認：事業価値35億円＋12月のネットキャッシュ", {x:M,y:0.56,w:CW,h:0.48,isTextBox:true,margin:0,
  fontFace:SERIF,fontSize:24,bold:true,color:INK});
s.addText("ネットキャッシュ（NC）は12月の実額で、増えても減っても上限なく精算します。現預金が増えれば、その分お受取りが増えます。",
  {x:M,y:1.06,w:CW,h:0.28,isTextBox:true,margin:0,fontFace:SANS,fontSize:12,color:MUTE});

const cell = (t,o={}) => ({text:t,options:Object.assign({fontFace:SANS,fontSize:11,color:INK,valign:"middle"},o)});
const head = t => cell(t,{bold:true,color:W,fill:{color:BERRY},align:"center",fontSize:10.5});
function secHead(x,y,w,num,title){
  s.addShape(p.ShapeType.ellipse,{x,y,w:0.30,h:0.30,fill:{color:BERRY},line:{color:BERRY}});
  s.addText(num,{x,y,w:0.30,h:0.30,isTextBox:true,margin:0,align:"center",valign:"middle",fontFace:SANS,fontSize:11,bold:true,color:W});
  s.addText(title,{x:x+0.40,y:y-0.01,w:w-0.4,h:0.32,isTextBox:true,margin:0,valign:"middle",fontFace:SANS,fontSize:13.5,bold:true,color:INK});
  s.addShape(p.ShapeType.line,{x,y:y+0.40,w,h:0,line:{color:BERRY,width:1}});
}

/* ---- 1. お支払いの時期と金額 ---- */
const lx=M, lw=6.55, ty=1.58;
secHead(lx,ty,lw,"1","お支払いの時期と金額（NCが22.4億円の場合）");
const strong = {bold:true,fill:{color:TINT}};
s.addTable([
  [head("時期"), head("内容"), head("金額")],
  [cell("2026年12月（決済日）"), cell("株式対価35億円から役員貸付金5億円を相殺"), cell("30.0億円",{align:"right"})],
  [cell("2027年3月末"), cell("株式対価の残金（NCとの差額をここで精算）"), cell("15.0億円",{align:"right"})],
  [cell("2029年12月"), cell("追加対価（勤務・業績に関係なく無条件）"), cell("5.0億円",{align:"right"})],
  [cell("3年後のご退任時"), cell("退職慰労金（対象会社から。業績に関係なく）"), cell("2.1億円",{align:"right"})],
  [cell("合計",strong), cell("役員貸付金5億円の相殺分を含む",Object.assign({},strong,{bold:false})), cell("57.1億円",Object.assign({align:"right",color:BERRY},strong))],
],{x:lx,y:ty+0.52,w:lw,colW:[1.95,3.5,1.1],rowH:0.34,margin:[2,6,2,6],border:{type:"solid",pt:0.5,color:LINE}});
s.addText("株式対価は基礎金額50億円（12月決済35億円＋3月末15億円）＋追加対価5億円。",
  {x:lx,y:ty+2.68,w:lw,h:0.24,isTextBox:true,margin:0,fontFace:SANS,fontSize:9.5,color:MUTE});

/* ---- 2. NCの精算 ---- */
const rx=M+lw+0.35, rw=CW-lw-0.35;
secHead(rx,ty,rw,"2","ネットキャッシュ（NC）の精算");
s.addText([
  {text:"基礎金額50億円 ＝ NC 22.4億円を前提。",options:{bold:true,breakLine:true}},
  {text:"12月の実額との差額を、3月末のお支払いで増減とも精算します（上限なし）。",options:{}},
],{x:rx,y:ty+0.52,w:rw,h:0.55,isTextBox:true,margin:0,fontFace:SANS,fontSize:11,color:INK,valign:"top"});
s.addTable([
  [head("12月のNC実額"), head("基礎金額（精算後）"), head("お支払い総額"), head("事業価値35億円＋NC")],
  [cell("22.1億円",{align:"center"}), cell("49.7億円",{align:"right"}), cell("56.8億円",{align:"right"}), cell("57.1億円",{align:"right"})],
  [cell("22.4億円",Object.assign({align:"center"},strong)), cell("50.0億円",Object.assign({align:"right"},strong)), cell("57.1億円",Object.assign({align:"right"},strong)), cell("57.4億円",Object.assign({align:"right",color:BERRY},strong))],
  [cell("24.0億円",{align:"center"}), cell("51.6億円",{align:"right"}), cell("58.7億円",{align:"right"}), cell("59.0億円",{align:"right"})],
],{x:rx,y:ty+1.12,w:rw,colW:[1.13,1.35,1.3,1.55],rowH:0.36,margin:[2,6,2,6],border:{type:"solid",pt:0.5,color:LINE}});
s.addText("お支払い総額と「事業価値35億円＋NC」の差0.3億円は、デロイト様の手数料ご減額分です。",
  {x:rx,y:ty+2.65,w:rw,h:0.42,isTextBox:true,margin:0,fontFace:SANS,fontSize:9.5,color:MUTE,valign:"top"});

/* ---- 3. 決済までのお願い ---- */
const by=4.62;
secHead(M,by,CW,"3","決済までにお願い・ご確認したいこと");
const items=[
  ["決済前のお支払い","役員賞与・配当・退職金は事前にご相談ください（基本合意書第9条第3項）。お支払いの場合はNCから差し引きます。現預金が増えれば価格に反映されるため、決済前にお使いいただく必要はありません。"],
  ["3年間のご関与","厨房、後継の料理長の育成、移転のご相談は、追加対価とは別の契約で定めます。追加対価は無条件のままです。"],
  ["店舗の賃貸借","代表者の変更などに貸主（積水ハウス）の承諾が必要です。手続きへのご協力をお願いします。"],
  ["追加のご要望","ほかにご希望の条件があれば、本日すべてお聞かせください。"],
  ["DDの再開と日程","本日から再開させてください（税理士の先生方の打ち合わせ、実地調査）。決済日は12月25日〜30日を予定しています。"],
];
const colW=(CW-0.35)/2;
items.forEach((it,i)=>{
  const col = i<3?0:1, row = i<3?i:i-3;
  const x=M+col*(colW+0.35), y=by+0.52+row*0.52;
  s.addShape(p.ShapeType.rect,{x,y:y+0.03,w:0.06,h:0.42,fill:{color:BERRY},line:{color:BERRY}});
  s.addText([
    {text:it[0]+"　",options:{bold:true,color:BERRY}},
    {text:it[1],options:{color:INK}},
  ],{x:x+0.16,y,w:colW-0.16,h:0.48,isTextBox:true,margin:0,fontFace:SANS,fontSize:10,valign:"middle"});
});

/* ---- 注記・フッター ---- */
s.addText("※ NC＝現預金＋役員貸付金−有利子負債。基準の22.4億円は2026年12月末の現預金見込み17.4億円＋役員貸付金5.0億円。基準日と計算方法の詳細、退職慰労金の支払方法は、税理士の先生方と協議のうえ最終契約で定めます。",
  {x:M,y:6.72,w:CW,h:0.34,isTextBox:true,margin:0,fontFace:SANS,fontSize:8.5,color:MUTE,valign:"top"});
s.addShape(p.ShapeType.line,{x:M,y:7.08,w:CW,h:0,line:{color:LINE,width:0.75}});
s.addText("株式会社WineBank　2026年11月18日",{x:M,y:7.13,w:CW,h:0.22,isTextBox:true,margin:0,fontFace:SANS,fontSize:8,color:MUTE});

p.writeFile({fileName: process.argv[2] || "岸田様_譲渡条件の確認_1枚_20261118.pptx"}).then(f=>console.log("WROTE",f));
