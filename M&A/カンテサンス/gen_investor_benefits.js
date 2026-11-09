// SPC投資家向け 出資額に応じた会員特典（1億・3億・5億）1枚
const pptxgen = require("pptxgenjs");
const p = new pptxgen();
p.layout = "LAYOUT_WIDE"; // 13.33 x 7.5
p.title = "出資額に応じた投資家特典";
p.author = "株式会社WineBank";

const BERRY="6D2E46", GOLD="B58B2A", INK="1F1A1C", MUTE="6E6368", TINT="F7F3F4", LINE="E4DADD", W="FFFFFF";
const SERIF="Cambria", SANS="Calibri";
const SW=13.33, M=0.55, CW=SW-2*M;

const s = p.addSlide();
s.background = {color:W};

s.addText("投資家様へのご案内｜カンテサンス買収SPC", {x:M,y:0.28,w:9,h:0.26,isTextBox:true,margin:0,
  fontFace:SANS,fontSize:11,bold:true,color:GOLD,charSpacing:1.2});
s.addText("出資額に応じた投資家特典", {x:M,y:0.55,w:CW,h:0.50,isTextBox:true,margin:0,
  fontFace:SERIF,fontSize:25,bold:true,color:INK});
s.addText("SPCへのご出資（投資家様の合計15億円・SPCの49%）に対し、出資額に応じて3つの区分で特典をご用意します。同じ区分の投資家様には、同じ特典をお付けします。",
  {x:M,y:1.07,w:CW,h:0.30,isTextBox:true,margin:0,fontFace:SANS,fontSize:11.5,color:MUTE});

// ---- 表 ----
const hd = (t,sub,fill) => ({text:[
  {text:t,options:{bold:true,fontSize:13,color:W,breakLine:true}},
  {text:sub,options:{fontSize:9.5,color:"F1E6EA"}}],
  options:{fill:{color:fill},align:"center",valign:"middle",fontFace:SANS}});
const lab = t => ({text:t,options:{bold:true,fontSize:10.5,color:INK,fill:{color:TINT},valign:"middle",fontFace:SANS}});
const c = (t,o={}) => ({text:t,options:Object.assign({fontSize:10,color:INK,valign:"middle",fontFace:SANS},o)});
const rows = [
  [{text:"",options:{fill:{color:W}}},
   hd("Village｜1億円","SPCの約3.3%",  "8C5A6E"),
   hd("Premier Cru｜3億円","SPCの約9.8%","6D2E46"),
   hd("Grand Cru｜5億円","SPCの約16.3%","4A1C30")],
  [lab("カンテサンスの優先予約\n（お支払いはご自身）"), c("年2回（各回4名様まで）"), c("年6回（各回4名様まで）"), c("毎月1回（各回6名様まで）\n＋個室の貸切 年1回")],
  [lab("ご招待ディナー\n（ペアリング込み）"), c("年1回・2名様"), c("年2回・各4名様"), c("年4回・各4名様")],
  [lab("岸田シェフとの機会"), c("年1回の投資家ディナー\n（岸田シェフ・有井支配人）"), c("左記に加え\nシェフズテーブル（厨房見学）"), c("左記に加え\nプライベートディナー 年1回\n（出張・費用は実費）")],
  [lab("ガトー・オ・コンテ"), c("年4本（季節ごと）"), c("年12本（毎月）"), c("年24本\n＋贈答用の優先枠")],
  [lab("ワイン（WineBank）"), c("会員価格でのご購入\nセラー保管 50本まで無料"), c("左記に加え 保管150本まで\n生産者来日ディナーへのご招待"), c("左記に加え 保管300本まで\n希少銘柄の優先ご案内")],
  [lab("グループ店舗\n（アピシウス等）"), c("優先予約"), c("優先予約＋会員価格"), c("優先予約＋会員価格\n＋個室 年1回")],
  [lab("経営情報"), c("四半期の業績報告\n年1回の報告会"), c("左記に加え\n半期ごとの経営報告会"), c("左記に加え\n取締役会へのオブザーバー参加")],
];
const lw=2.25, tw=(CW-lw)/3;
s.addTable(rows,{x:M,y:1.55,w:CW,colW:[lw,tw,tw,tw],rowH:[0.62,0.56,0.44,0.66,0.48,0.62,0.52,0.56],
  margin:[3,7,3,7],border:{type:"solid",pt:0.6,color:LINE},align:"center"});

// ---- 前提 ----
const notes = [
  "特典は出資額の区分ごとに一律に設定し、同じ区分の投資家様には同じ内容をお付けします。",
  "優先予約・ご招待は、投資家様全体で月ごとの上限席数を設け、一般のお客様のご予約を圧迫しない範囲で運用します。",
  "ご予約枠・岸田シェフとの機会・ガトー・オ・コンテは、品質と希少性の維持を前提に、岸田シェフおよび店舗と協議のうえ最終確定します。",
  "特典の費用は対象会社が負担し、事業計画に織り込みます。税務上の取扱いは、投資家様ごとに税理士にご確認ください。",
];
s.addText(notes.map((t,k)=>({text:t,options:{bullet:{indent:10},breakLine:k<notes.length-1}})),
  {x:M,y:6.08,w:CW,h:0.86,isTextBox:true,margin:0,valign:"top",fontFace:SANS,fontSize:9,color:MUTE,paraSpaceAfter:1});
s.addShape(p.ShapeType.line,{x:M,y:7.02,w:CW,h:0,line:{color:LINE,width:0.75}});
s.addText("株式会社WineBank　2026年11月　※本資料の特典は案であり、最終的な内容は投資契約で定めます。",
  {x:M,y:7.08,w:CW,h:0.22,isTextBox:true,margin:0,fontFace:SANS,fontSize:8,color:MUTE});

p.writeFile({fileName: process.argv[2] || "投資家特典_1億3億5億_20261109.pptx"}).then(f=>console.log("WROTE",f));
