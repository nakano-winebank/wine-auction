// 岸田様とのお打ち合わせ用 1枚資料：本日ご確認したいこと（論点と当社の考え）2026年11月18日
const pptxgen = require("pptxgenjs");
const p = new pptxgen();
p.layout = "LAYOUT_WIDE"; // 13.33 x 7.5
p.title = "本日ご確認したいこと";
p.author = "株式会社WineBank";

const BERRY="6D2E46", GOLD="B58B2A", INK="1F1A1C", MUTE="6E6368", TINT="F7F3F4", LINE="E4DADD", W="FFFFFF";
const SERIF="Cambria", SANS="Calibri";
const SW=13.33, M=0.55, CW=SW-2*M;

const s = p.addSlide();
s.background = {color:W};

s.addText("岸田様とのお打ち合わせ資料｜2026年11月18日", {x:M,y:0.28,w:9,h:0.26,isTextBox:true,margin:0,
  fontFace:SANS,fontSize:11,bold:true,color:GOLD,charSpacing:1.2});
s.addText("本日ご確認したいこと", {x:M,y:0.56,w:CW,h:0.48,isTextBox:true,margin:0,
  fontFace:SERIF,fontSize:24,bold:true,color:INK});
s.addText("事業価値35億円＋12月のネットキャッシュ（NC）で、最終契約に向けて進めるための確認事項です。",
  {x:M,y:1.06,w:CW,h:0.28,isTextBox:true,margin:0,fontFace:SANS,fontSize:12,color:MUTE});

const rows = [
  ["価格の考え方","事業価値35億円＋12月のネットキャッシュ（NC）の実額"],
  ["預金が増えた場合","基準22.4億円との差額を、増減とも上限なしで3月末に精算します。増えた分はそのままお受取りになります"],
  ["57.1億円について","上限ではありません。NCが22.4億円のときの金額です"],
  ["NCの基準額","22.4億円（12月末の現預金見込み17.4億円＋役員貸付金5.0億円）。デロイト様の手数料ご減額0.3億円と合わせて、実質「35億円＋NC」です"],
  ["決済前の現預金","価格に反映されるため、お使いいただく必要はありません。賞与・配当・退職金は事前にご相談ください（基本合意書第9条第3項）。お支払いの分はNCから差し引きます"],
  ["役員貸付金5億円","ご返済ではなく、12月の35億円と相殺します（お振込みは30億円）"],
  ["追加対価5億円","2029年12月。勤務や業績に関係なく、無条件でお支払いします"],
  ["退職慰労金2.1億円","3年後のご退任時に、業績に関係なく対象会社からお支払いします。お支払方法は税理士の先生方と協議します"],
  ["3年間のご関与","追加対価とは別の契約で、厨房、後継の料理長の育成、移転のご相談を定めます"],
  ["店舗の賃貸借","代表者の変更などに貸主（積水ハウス）の承諾が必要です。お手続きへのご協力をお願いします"],
  ["追加のご要望","ほかにご希望の条件があれば、本日すべてお聞かせください"],
  ["DDと日程","本日から再開させてください（税理士の先生方の打ち合わせ、実地調査）。決済日は12月25日〜30日を予定しています"],
];
const cell = (t,o={}) => ({text:t,options:Object.assign({fontFace:SANS,fontSize:11,color:INK,valign:"middle"},o)});
const head = t => cell(t,{bold:true,color:W,fill:{color:BERRY},align:"center",fontSize:11});
const data = [[head("#"), head("論点"), head("当社の考え")]];
rows.forEach((r,i)=>{
  const f = i%2 ? {fill:{color:TINT}} : {};
  data.push([
    cell(String(i+1),Object.assign({align:"center",bold:true,color:BERRY},f)),
    cell(r[0],Object.assign({bold:true},f)),
    cell(r[1],f),
  ]);
});
s.addTable(data,{x:M,y:1.5,w:CW,colW:[0.45,2.15,CW-2.6],rowH:0.41,margin:[2,8,2,8],
  border:{type:"solid",pt:0.5,color:LINE}});

s.addShape(p.ShapeType.line,{x:M,y:7.08,w:CW,h:0,line:{color:LINE,width:0.75}});
s.addText("株式会社WineBank　2026年11月18日",{x:M,y:7.13,w:CW,h:0.22,isTextBox:true,margin:0,fontFace:SANS,fontSize:8,color:MUTE});

p.writeFile({fileName: process.argv[2] || "岸田様_本日の確認事項_1枚_20261118.pptx"}).then(f=>console.log("WROTE",f));
