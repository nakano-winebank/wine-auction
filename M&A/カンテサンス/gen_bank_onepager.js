// みずほ銀行向け 1枚資料：プティ・ボノムの直近業績（2026年1〜9月試算表）とワイン在庫（10月末棚卸し）
const pptxgen = require("pptxgenjs");
const p = new pptxgen();
p.layout = "LAYOUT_WIDE"; // 13.33 x 7.5
p.title = "プティ・ボノムの直近業績と資産の状況";
p.author = "株式会社WineBank";

const BERRY="6D2E46", GOLD="B58B2A", INK="1F1A1C", MUTE="6E6368", TINT="F7F3F4", LINE="E4DADD", W="FFFFFF";
const SERIF="Cambria", SANS="Calibri";
const SW=13.33, M=0.62, CW=SW-2*M;

const s = p.addSlide();
s.background = {color:W};

/* ---- 見出し ---- */
s.addText("みずほ銀行ご説明資料｜対象会社の直近の状況", {x:M,y:0.30,w:9,h:0.26,isTextBox:true,margin:0,
  fontFace:SANS,fontSize:11,bold:true,color:GOLD,charSpacing:1.2});
s.addText("プティ・ボノムの直近業績と資産の状況", {x:M,y:0.58,w:CW,h:0.50,isTextBox:true,margin:0,
  fontFace:SERIF,fontSize:25,bold:true,color:INK});
s.addText("業績は計画並みで借入金なし。決済時に対象会社の資金 約20.7億円を活用でき、ワイン在庫には約0.9億円の含み益があります。",
  {x:M,y:1.10,w:CW,h:0.30,isTextBox:true,margin:0,fontFace:SANS,fontSize:12,color:MUTE});

/* ---- 主要指標 ---- */
const kpis = [
  ["売上高（2026年1〜9月）", "7.57億円", "年換算 約10.1億円（計画 10.15億円）"],
  ["営業利益（1〜9月・役員賞与除く）", "4.52億円", "月平均 約5,000万円で安定"],
  ["純資産（9月末）", "22.42億円", "自己資本比率 95.7%・有利子負債なし"],
  ["決済時に活用できる資金", "約20.7億円", "12月末の現預金見込みから算出（②）"],
];
const kg=0.22, kw=(CW-kg*3)/4, ky=1.58, kh=1.02;
kpis.forEach((k,i)=>{
  const x=M+i*(kw+kg);
  s.addShape(p.ShapeType.rect,{x,y:ky,w:kw,h:kh,fill:{color:TINT},line:{color:TINT}});
  s.addShape(p.ShapeType.rect,{x,y:ky,w:0.06,h:kh,fill:{color:BERRY},line:{color:BERRY}});
  s.addText(k[0],{x:x+0.2,y:ky+0.10,w:kw-0.3,h:0.24,isTextBox:true,margin:0,fontFace:SANS,fontSize:10,color:MUTE});
  s.addText(k[1],{x:x+0.2,y:ky+0.34,w:kw-0.3,h:0.40,isTextBox:true,margin:0,fontFace:SERIF,fontSize:22,bold:true,color:BERRY});
  s.addText(k[2],{x:x+0.2,y:ky+0.74,w:kw-0.3,h:0.22,isTextBox:true,margin:0,fontFace:SANS,fontSize:9.5,color:INK});
});

/* ---- 3つの欄 ---- */
const cg=0.3, cw=(CW-cg*2)/3, cy=2.85;
const colX = i => M+i*(cw+cg);
function colHead(i, num, title){
  const x=colX(i);
  s.addShape(p.ShapeType.ellipse,{x,y:cy,w:0.30,h:0.30,fill:{color:BERRY},line:{color:BERRY}});
  s.addText(num,{x,y:cy,w:0.30,h:0.30,isTextBox:true,margin:0,align:"center",valign:"middle",fontFace:SANS,fontSize:11,bold:true,color:W});
  s.addText(title,{x:x+0.40,y:cy-0.01,w:cw-0.4,h:0.32,isTextBox:true,margin:0,valign:"middle",fontFace:SANS,fontSize:13,bold:true,color:INK});
  s.addShape(p.ShapeType.line,{x,y:cy+0.42,w:cw,h:0,line:{color:BERRY,width:1}});
}
const cell = (t,o={}) => ({text:t,options:Object.assign({fontFace:SANS,fontSize:10.5,color:INK,valign:"middle"},o)});
function table(i, y, rows, wl){
  const data = rows.map(r=>{
    const strong = r[2]==="b";
    return [cell(r[0],{bold:strong}), cell(r[1],{align:"right",bold:strong,color:strong?BERRY:INK,fill:strong?{color:TINT}:undefined})];
  });
  data.forEach(r=>{ if(rows[data.indexOf(r)][2]==="b") r[0].options.fill={color:TINT}; });
  s.addTable(data,{x:colX(i),y,w:cw,colW:[cw*wl,cw*(1-wl)],rowH:0.31,margin:[2,6,2,6],
    border:{type:"solid",pt:0.5,color:LINE}});
}
function notes(i, y, h, lines){
  s.addText(lines.map((t,k)=>({text:t,options:{bullet:{indent:10},breakLine:k<lines.length-1}})),
    {x:colX(i),y,w:cw,h,isTextBox:true,margin:0,valign:"top",fontFace:SANS,fontSize:9.5,color:INK,paraSpaceAfter:3,lineSpacingMultiple:1.05});
}

// ① 業績
colHead(0,"1","業績は計画並み（1〜9月・税抜）");
table(0,3.40,[
  ["売上高（うちガトー 0.48億円）","7.57億円"],
  ["売上総利益（粗利率 77.1%）","5.84億円"],
  ["販管費（うち役員賞与 0.95億円）","2.27億円"],
  ["営業利益","3.56億円","b"],
  ["営業利益（役員賞与を除く）","4.52億円","b"],
],0.66);
notes(0,5.08,1.55,[
  "役員賞与は事前確定届出給与で、毎年7月に一括計上。これを除く月次の営業利益は4,600万〜5,700万円で安定しています。",
  "通期の営業利益は、10〜12月が4〜9月並みなら約5.1億円（計画5.28億円）。12月の繁忙期の上振れは含めていません。",
]);

// ② 資金
colHead(1,"2","借入金なし・決済時に約20.7億円");
table(1,3.40,[
  ["現預金（9月末・実績）","15.76億円"],
  ["現預金（12月末・見込み）","17.4億円"],
  ["会社に残す運転資金","▲1.0億円"],
  ["2026年12月期の法人税","▲1.1億円"],
  ["役員貸付金の返済","＋5.0億円"],
  ["子会社（カンテサンスプラス）現預金","＋0.4億円"],
  ["決済時に活用できる資金","約20.7億円","b"],
],0.70);
notes(1,5.71,0.96,[
  "役員貸付金は基本合意書第2条第7項により決済日までに返済（未返済分は譲渡価額から控除）。",
  "役員退職金や12月の賞与を支払う場合は、その分減少します。",
]);

// ③ ワイン
colHead(2,"3","ワイン在庫の含み益 約0.9億円");
table(2,3.40,[
  ["本数（1,944品目）","2,667本"],
  ["原価（帳簿 9月末 1.15億円）","1.13億円"],
  ["時価（楽天最安値・税抜）","2.07億円","b"],
  ["含み益（時価−原価）","＋0.94億円","b"],
  ["時価×80%（買取・落札の水準）","1.76億円"],
],0.64);
notes(2,5.08,1.55,[
  "時価は国内の楽天最安値（税抜）。同じ・近い年代の価格を確認した355品目（原価0.27億円→時価0.72億円）と、同じ生産者の実勢倍率で推定した288品目の合計。残る1,301品目は原価のまま。",
  "含み益の約7割はDRCです。品目ごとの根拠を載せた評価表は別途ご提出できます。",
]);

/* ---- 出所・フッター ---- */
s.addText("出所：株式会社プティ・ボノム 第16期 残高試算表（2026年1〜9月、税抜）、ワイン棚卸し（2026年10月末）。12月末の現預金・決済時の資金・ワインの時価（楽天最安値）は当社推計。",
  {x:M,y:6.66,w:CW,h:0.24,isTextBox:true,margin:0,fontFace:SANS,fontSize:8.5,color:MUTE});
s.addShape(p.ShapeType.line,{x:M,y:6.98,w:CW,h:0,line:{color:LINE,width:0.75}});
s.addText("カンテサンス（株式会社プティ・ボノム）買収案件 ／ みずほ銀行ご説明用　2026年11月6日　株式会社WineBank",
  {x:M,y:7.06,w:CW,h:0.22,isTextBox:true,margin:0,fontFace:SANS,fontSize:8,color:MUTE});

p.writeFile({fileName: process.argv[2] || "銀行ご説明用_直近業績とワイン在庫_1枚_20261106.pptx"}).then(f=>console.log("WROTE",f));
