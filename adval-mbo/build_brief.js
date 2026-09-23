const P=require('pptxgenjs');
const p=new P(); p.layout='LAYOUT_WIDE';
const W=13.333;
const INK='1E2A38', INK2='3D4E60', MUT='7C8A99', LINE='D9E0E7', PAPER='F5F7F9',
      WHITE='FFFFFF', ACC='6E2639', ACC2='A85C6E', POS='2C6A4E', NEG='8A2E26', WARN='8F5510',
      BLUE='2E5C8A';
const F='Meiryo';
const T=(s,t,o)=>s.addText(t,Object.assign({fontFace:F,isTextBox:true,margin:0},o));
const dark=s=>s.background={color:INK}, light=s=>s.background={color:PAPER};
function head(s,k,t,d){
  T(s,k,{x:0.7,y:0.42,w:11.9,h:0.28,fontSize:11,bold:true,charSpacing:2,color:d?ACC2:ACC});
  T(s,t,{x:0.7,y:0.74,w:11.9,h:0.72,fontSize:28,bold:true,color:d?WHITE:INK});
}
function card(s,x,y,w,h,fill,line){
  s.addShape(p.ShapeType.roundRect,{x,y,w,h,rectRadius:0.06,fill:{color:fill||WHITE},
    line:{color:line||LINE,width:1},shadow:{type:'outer',blur:8,offset:1,angle:90,color:'AAB4BE',opacity:0.18}});
}
function stat(s,x,y,w,l,v,u,sub,col){
  T(s,l,{x,y,w,h:0.26,fontSize:11,color:MUT});
  T(s,[{text:v,options:{fontSize:30,bold:true,color:col||INK}},{text:u||'',options:{fontSize:13,bold:true,color:col||INK}}],
    {x,y:y+0.26,w,h:0.55});
  if(sub) T(s,sub,{x,y:y+0.82,w,h:0.26,fontSize:10,color:MUT});
}
const TH={fill:INK,color:WHITE,bold:true,fontSize:11};
const tbl=(s,r,o)=>s.addTable(r,Object.assign({fontFace:F,fontSize:11.5,color:INK2,
  border:{type:'solid',color:LINE,pt:0.5},valign:'middle'},o));
function badge(s,x,y,w,txt,col){
  s.addShape(p.ShapeType.roundRect,{x,y,w,h:0.34,rectRadius:0.17,fill:{color:col}});
  T(s,txt,{x,y,w,h:0.34,fontSize:11.5,bold:true,color:WHITE,align:'center',valign:'middle'});
}

/* 1 表紙 */
let s=p.addSlide(); dark(s);
T(s,'株式会社あどばる',{x:0.9,y:1.8,w:11.5,h:0.4,fontSize:14,bold:true,color:ACC2,charSpacing:3});
T(s,'資本政策の現在地',{x:0.9,y:2.25,w:11.5,h:0.95,fontSize:42,bold:true,color:WHITE});
T(s,'MBOによる独立と、スペースマーケット社からの合併提案',{x:0.9,y:3.3,w:11,h:0.45,fontSize:17,color:'B9C4CF'});
T(s,'2026年9月23日',{x:0.9,y:3.78,w:11,h:0.3,fontSize:13,color:ACC2});
s.addShape(p.ShapeType.line,{x:0.9,y:4.22,w:3.2,h:0,line:{color:ACC,width:2}});
[['ご説明先','株式会社みずほ銀行 御中 ／ あどばる 中村 新社長'],
 ['作成','株式会社あどばる 代表取締役 中野 邦人'],
 ['基準','第10期（2026年5月期）計算書類・会社四季報2026年9月']].forEach((r,i)=>{
  T(s,r[0],{x:0.9,y:4.55+i*0.42,w:1.7,h:0.3,fontSize:10,color:MUT});
  T(s,r[1],{x:2.7,y:4.55+i*0.42,w:9.5,h:0.3,fontSize:12,color:'D5DDE5'});
});
T(s,'本資料は検討段階の想定値であり、法務・税務・会計上の助言ではありません',{x:0.9,y:6.8,w:11.5,h:0.3,fontSize:9,color:'6D7A87'});
s.addNotes('2つの話を同時に扱う。①ビジョンからの独立（MBO）②スペースマーケットからの合併提案。みずほには①、中村社長には両方。');

/* 2 論点は2つ */
s=p.addSlide(); light(s);
head(s,'AGENDA','いま、選択肢が2つあります');
[[ '1','MBO ─ ビジョン社からの独立','自己株式取得で既存株主を整理し、中野とパートナーが50:50で経営する。クロージングは2027年5月末を想定。',ACC,'みずほ銀行様にご相談したいのはこちら'],
 ['2','スペースマーケット社との合併','先方からの提案。上場会社となり全株主が流動性を得る一方、競合TKPが株主として残る。',BLUE,'中村社長と論点を共有したいのはこちら']].forEach((r,i)=>{
  const y=1.85+i*2.35;
  card(s,0.7,y,11.9,2.05);
  s.addShape(p.ShapeType.roundRect,{x:1.05,y:y+0.35,w:0.68,h:0.68,rectRadius:0.5,fill:{color:r[3]}});
  T(s,r[0],{x:1.05,y:y+0.35,w:0.68,h:0.68,fontSize:20,bold:true,color:WHITE,align:'center',valign:'middle'});
  T(s,r[1],{x:2.0,y:y+0.28,w:10.3,h:0.4,fontSize:19,bold:true,color:INK});
  T(s,r[2],{x:2.0,y:y+0.76,w:10.3,h:0.6,fontSize:12.5,color:INK2});
  T(s,'▶ '+r[4],{x:2.0,y:y+1.42,w:10.3,h:0.3,fontSize:12,bold:true,color:r[3]});
});
T(s,'両者は二者択一ではありません。MBOでビジョンを整理してから合併に臨むのが、持分・交渉力の両面で最も有利です。',
  {x:0.7,y:6.6,w:11.9,h:0.35,fontSize:13,bold:true,color:ACC});
s.addNotes('まず全体像。2つあることと、順序の話をする。');

/* 3 現状 */
s=p.addSlide(); light(s);
head(s,'現状','第10期の実績と、バランスシートの課題');
stat(s,0.7,1.68,2.6,'売上高','21.80','億円','前期比 +18.8%',POS);
stat(s,3.5,1.68,2.6,'営業利益','1.58','億円','前期1.77億から減益',INK);
stat(s,6.3,1.68,2.6,'純資産','△4.09','億円','債務超過',NEG);
stat(s,9.1,1.68,2.6,'有利子負債','11.57','億円','うちビジョン 7.90億',NEG);
card(s,0.7,3.12,5.75,3.2,'FBF1F3','E3CBD1');
T(s,'融資判断の壁になっている3点',{x:1.0,y:3.32,w:5.2,h:0.32,fontSize:14,bold:true,color:ACC});
[['純資産が△4.09億の債務超過','この状態では新規融資の稟議が通りません'],
 ['ビジョン社への借入が7.90億','有利子負債の68%を親会社が占めています'],
 ['現預金が0.40億','月商1.8億に対し手元流動性が極端に薄い']].forEach((r,i)=>{
  const y=3.82+i*0.8;
  s.addShape(p.ShapeType.roundRect,{x:1.0,y:y+0.05,w:0.2,h:0.2,rectRadius:0.5,fill:{color:ACC}});
  T(s,r[0],{x:1.35,y:y-0.02,w:4.95,h:0.3,fontSize:12.5,bold:true,color:INK});
  T(s,r[1],{x:1.35,y:y+0.29,w:4.95,h:0.3,fontSize:10.5,color:INK2});
});
card(s,6.85,3.12,5.75,3.2,'F0F4F1','C9DCD1');
T(s,'ただし、収益力は別の姿があります',{x:7.15,y:3.32,w:5.2,h:0.32,fontSize:14,bold:true,color:POS});
const br=[['第10期 報告営業利益','1.58億',INK],['出向費 年0.72億の喪失','△0.72億',NEG],
          ['撤退店舗の損失解消・大型2施設の通年寄与','+1.14億',POS],['正常化営業利益','2.00億',ACC]];
br.forEach((r,i)=>{
  const y=3.82+i*0.62;
  T(s,r[0],{x:7.15,y:y,w:3.9,h:0.3,fontSize:11,color:INK2});
  T(s,r[1],{x:11.15,y:y-0.03,w:1.2,h:0.34,fontSize:14,bold:true,color:r[2],align:'right'});
});
T(s,'正常化EBITDA 2.65億（営業利益2.00＋減価償却0.65）',{x:7.15,y:6.0,w:5.2,h:0.3,fontSize:11,bold:true,color:POS});
s.addNotes('債務超過は隠さず先に出す。そのうえで正常化営業利益2.00億で反転させる。1.14億の裏付けは店舗別PLで別途提出。');

/* 4 MBOスキーム */
s=p.addSlide(); dark(s);
head(s,'選択肢 1 ─ MBO','スキームと資金の流れ',true);
const bx=[{x:0.7,t:'① 第三者割当増資',a:'19.57億円',b:'中野ファンド 6.10億\nパートナー 13.47億',c:ACC},
 {x:4.05,t:'② 自己株式取得',a:'12.72億円',b:'中野以外の全株主\n127,616株を会社が買取',c:INK2},
 {x:7.40,t:'③ ビジョン借入の返済',a:'7.90億円',b:'増資4.90億＋みずほ3.00億\n資本・債権関係を完全解消',c:INK2},
 {x:10.75,t:'④ 手元資金',a:'1.50億円',b:'運転資金として留保\n現預金は2.19億へ',c:POS}];
bx.forEach(o=>{
  s.addShape(p.ShapeType.roundRect,{x:o.x,y:1.85,w:2.0,h:2.45,rectRadius:0.06,
    fill:{color:'26333F'},line:{color:o.c===ACC?ACC:'3A4854',width:o.c===ACC?2:1}});
  T(s,o.t,{x:o.x+0.18,y:2.03,w:1.66,h:0.5,fontSize:11.5,bold:true,color:o.c===ACC?ACC2:'C3CDD6'});
  T(s,o.a,{x:o.x+0.18,y:2.58,w:1.66,h:0.42,fontSize:18,bold:true,color:WHITE});
  T(s,o.b,{x:o.x+0.18,y:3.06,w:1.66,h:1.1,fontSize:9.5,color:'93A2AF'});
});
[2.75,6.10,9.45].forEach(x=>T(s,'▶',{x,y:2.92,w:0.5,h:0.4,fontSize:13,color:ACC,align:'center'}));
s.addShape(p.ShapeType.roundRect,{x:0.7,y:4.6,w:11.9,h:1.85,rectRadius:0.06,fill:{color:'26333F'},line:{color:'3A4854',width:1}});
T(s,'取引後の株主は2者のみ',{x:1.0,y:4.8,w:6,h:0.35,fontSize:15,bold:true,color:WHITE});
[['中野陣営','50.000%','中野邦人 74,000株（SO行使後）＋ 中野ファンド 61,180株',ACC2],
 ['パートナー','50.000%','135,180株（ヒューリック／東京建物等）','8FB0CC']].forEach((r,i)=>{
  const x=1.0+i*5.85;
  T(s,r[0],{x,y:5.3,w:5.5,h:0.3,fontSize:12,color:'93A2AF'});
  T(s,r[1],{x,y:5.56,w:5.5,h:0.44,fontSize:24,bold:true,color:r[3]});
  T(s,r[2],{x,y:5.99,w:5.5,h:0.3,fontSize:9.5,color:'93A2AF'});
});
T(s,'既存株主7社（ビジョン・BOS・エアトリ・KUMA・フィル・ベクトル・アンビション）は全株を売却し、株主名簿から外れます',
  {x:0.7,y:6.65,w:11.9,h:0.3,fontSize:10.5,color:'7F8E9B'});
s.addNotes('クロージングは2027年5月31日想定。ビジョン社の受取は株式9.41億＋借入返済7.90億＝17.31億。全額現金・借入は額面満額。');

/* 5 想定BS */
s=p.addSlide(); light(s);
head(s,'選択肢 1 ─ MBO','想定バランスシート');
tbl(s,[
 [{text:'科目',options:TH},{text:'第10期末 実績',options:Object.assign({align:'right'},TH)},
  {text:'クロージング直前',options:Object.assign({align:'right'},TH)},{text:'取引後（想定）',options:Object.assign({align:'right'},TH)}],
 [{text:'現金及び預金',options:{bold:true}},{text:'40,414',options:{align:'right'}},{text:'60,000',options:{align:'right'}},{text:'219,000',options:{align:'right',bold:true}}],
 ['その他流動資産',{text:'395,416',options:{align:'right'}},{text:'463,779',options:{align:'right'}},{text:'463,779',options:{align:'right'}}],
 ['固定資産',{text:'880,198',options:{align:'right'}},{text:'880,198',options:{align:'right'}},{text:'880,198',options:{align:'right'}}],
 [{text:'資産合計',options:{bold:true,fill:'E8EDF2'}},{text:'1,316,028',options:{align:'right',bold:true,fill:'E8EDF2'}},{text:'1,403,977',options:{align:'right',bold:true,fill:'E8EDF2'}},{text:'1,562,977',options:{align:'right',bold:true,fill:'E8EDF2'}}],
 [{text:'有利子負債',options:{bold:true}},{text:'1,159,051',options:{align:'right'}},{text:'1,097,000',options:{align:'right'}},{text:'607,000',options:{align:'right',bold:true}}],
 ['その他負債',{text:'566,409',options:{align:'right'}},{text:'566,409',options:{align:'right'}},{text:'566,409',options:{align:'right'}}],
 [{text:'負債合計',options:{bold:true,fill:'E8EDF2'}},{text:'1,725,460',options:{align:'right',bold:true,fill:'E8EDF2'}},{text:'1,663,409',options:{align:'right',bold:true,fill:'E8EDF2'}},{text:'1,173,409',options:{align:'right',bold:true,fill:'E8EDF2'}}],
 ['資本剰余金等',{text:'△409,432',options:{align:'right',color:NEG}},{text:'△259,432',options:{align:'right',color:NEG}},{text:'389,568',options:{align:'right'}}],
 [{text:'純資産合計',options:{bold:true,fill:'F3E7EA'}},{text:'△409,432',options:{align:'right',bold:true,color:NEG,fill:'F3E7EA'}},{text:'△259,432',options:{align:'right',bold:true,color:NEG,fill:'F3E7EA'}},{text:'389,568',options:{align:'right',bold:true,color:POS,fill:'F3E7EA'}}],
 [{text:'自己資本比率',options:{bold:true}},{text:'△31.1%',options:{align:'right',bold:true,color:NEG}},{text:'△18.5%',options:{align:'right',bold:true,color:NEG}},{text:'24.9%',options:{align:'right',bold:true,color:POS}}]],
 {x:0.7,y:1.72,w:11.9,colW:[3.8,2.7,2.7,2.7],rowH:0.36,fontSize:11.5});
T(s,'単位：千円　／　クロージング直前は第10期末から1年間で純資産+1.50億の改善を見込んだ想定値　／　繰越欠損金は無償減資により資本剰余金で填補します',
  {x:0.7,y:6.55,w:11.9,h:0.3,fontSize:10,color:MUT});
s.addNotes('本日の主役。債務超過△4.09億が+3.90億に、自己資本比率24.9%になる。単位は千円。');

/* 6 財務指標 */
s=p.addSlide(); light(s);
head(s,'選択肢 1 ─ MBO','取引後の信用力');
[['自己資本比率','△18.5%','24.9%'],['有利子負債','10.97億','6.07億'],
 ['有利子負債 / EBITDA','4.1倍','2.3倍'],['DSCR','―','1.58倍']].forEach((r,i)=>{
  const x=0.7+i*3.02;
  card(s,x,1.7,2.85,2.1);
  T(s,r[0],{x:x+0.22,y:1.9,w:2.4,h:0.5,fontSize:11.5,bold:true,color:MUT});
  T(s,r[1],{x:x+0.22,y:2.4,w:2.4,h:0.32,fontSize:13,color:NEG});
  T(s,'▼',{x:x+0.22,y:2.72,w:2.4,h:0.22,fontSize:9,color:MUT});
  T(s,r[2],{x:x+0.22,y:2.94,w:2.4,h:0.6,fontSize:26,bold:true,color:POS});
});
s.addChart(p.ChartType.bar,[
 {name:'取引前',labels:['純資産','有利子負債'],values:[-2.59,10.97]},
 {name:'取引後',labels:['純資産','有利子負債'],values:[3.90,6.07]}],
 {x:0.7,y:4.0,w:6.2,h:2.5,barDir:'col',chartColors:[MUT,ACC],showTitle:true,
  title:'純資産と有利子負債の変化（億円）',titleFontSize:13,titleColor:INK,titleFontFace:F,
  showValue:true,dataLabelPosition:'outEnd',dataLabelFormatCode:'0.00',dataLabelFontFace:F,
  dataLabelFontSize:9,dataLabelColor:INK,showLegend:true,legendPos:'b',legendFontFace:F,legendFontSize:9,
  catAxisLabelFontFace:F,catAxisLabelFontSize:10,catAxisLabelColor:INK2,valAxisLabelFontFace:F,
  valAxisLabelFontSize:9,valAxisLabelColor:MUT,valGridLine:{color:LINE,size:0.5},catGridLine:{style:'none'}});
card(s,7.2,4.0,5.4,2.5,'F0F4F1','C9DCD1');
T(s,'みずほ銀行様へのご依頼は借換えです',{x:7.5,y:4.2,w:4.85,h:0.32,fontSize:14,bold:true,color:POS});
T(s,'取引後のあどばるは、自己資本比率24.9%・有利子負債2.3倍・DSCR1.58倍の会社になります。買収ファイナンス（LBOローン）ではなく、債務超過を解消した事業会社に対する通常のご融資としてご検討いただけます。\n\n・既存借入 3.07億円の継続\n・ビジョン借入のリファイ 3.00億円',
  {x:7.5,y:4.57,w:4.85,h:1.8,fontSize:11,color:INK2,lineSpacingMultiple:1.15});
s.addNotes('LBOではなく借換えである、という一点を必ず伝える。審査の重さがまったく違う。');


/* 7 SM合併後の株主構成 */
s=p.addSlide(); light(s);
head(s,'選択肢 2 ─ 合併','スペースマーケット社と合併した場合の株主構成');
stat(s,0.7,1.66,2.9,'合併比率','1 : 40.63','','あどばる1株にSM株40.63株',BLUE);
stat(s,3.8,1.66,2.9,'交付新株','782.6','万株','あどばるEquity 18億／SM 230円',INK);
stat(s,6.9,1.66,2.9,'合併後 発行済','1,993','万株','現状1,210万株＋交付分',INK);
stat(s,10.0,1.66,2.6,'合併後 時価総額','45.8','億円','SM単独 27.7億から拡大',POS);
s.addChart(p.ChartType.bar,[{name:'持株比率',
  labels:['ビジョン','重松 大輔','その他SM株主','中野 邦人','TKP','ダブルパインズ'],
  values:[19.26,14.80,14.03,13.25,12.79,8.38]}],
 {x:0.7,y:3.15,w:7.0,h:3.35,barDir:'bar',chartColors:[BLUE],showTitle:true,
  title:'合併後の持株比率（％・中野はSO行使前）',titleFontSize:13,titleColor:INK,titleFontFace:F,
  showValue:true,dataLabelPosition:'outEnd',dataLabelFormatCode:'0.00"%"',dataLabelFontFace:F,
  dataLabelFontSize:9.5,dataLabelColor:INK,showLegend:false,barGapWidthPct:45,
  catAxisLabelFontFace:F,catAxisLabelFontSize:10.5,catAxisLabelColor:INK2,
  valAxisLabelFontFace:F,valAxisLabelFontSize:9,valAxisLabelColor:MUT,valAxisMaxVal:25,
  valGridLine:{color:LINE,size:0.5},catGridLine:{style:'none'}});
card(s,8.0,3.15,4.6,3.35,'EEF3F8','C6D6E5');
T(s,'この名簿が意味すること',{x:8.3,y:3.35,w:4.0,h:0.32,fontSize:14,bold:true,color:BLUE});
[['筆頭株主はビジョン社のまま','合併してもビジョン19.26%が残ります。MBOで先に整理するかどうかが最初の分岐点です。'],
 ['中野の持分は13.25%','SO行使後で14.41%。単独では経営の意思決定権を持てません。'],
 ['重松氏側は合計23.18%','重松氏14.80%＋ダブルパインズ8.38%。実質的な筆頭は先方です。']].forEach((r,i)=>{
  const y=3.78+i*0.92;
  T(s,'0'+(i+1),{x:8.3,y:y,w:0.5,h:0.28,fontSize:11,bold:true,color:ACC2});
  T(s,r[0],{x:8.85,y:y,w:3.45,h:0.28,fontSize:12,bold:true,color:INK});
  T(s,r[1],{x:8.85,y:y+0.3,w:3.45,h:0.6,fontSize:9.5,color:INK2});
});
T(s,'出所：会社四季報2026年9月号（単元株主2,428名・発行済12,105,900株）、株価229円（2026年9月21日終値）。あどばるの評価額はスペースマーケット社からのLOI 18億円を使用。',
  {x:0.7,y:6.68,w:11.9,h:0.3,fontSize:9,color:MUT});
s.addNotes('中野の持分が13%台になる、という一点が最大の論点。MBO後に合併すれば数字は変わる。');

/* 8 合併の論点 */
s=p.addSlide(); dark(s);
head(s,'選択肢 2 ─ 合併','先に確認すべき4つの論点',true);
[['01','第2位株主が競合TKP社','TKPは21.06%を保有する第2位株主です。合併後も12.79%で残ります。貸会議室・レンタルスペース領域で競合する会社が、当社の株主総会で議決権を持つ形になります。',ACC2],
 ['02','ビジョン社が合併後の筆頭株主','19.26%。MBOを先行させずに合併すると、ビジョンとの関係は解消されないまま上場会社の筆頭株主として残ります。',ACC2],
 ['03','のれん22.09億円の償却','日本基準では定額償却が必要です。20年償却でも年1.10億、10年なら年2.21億。合算営業利益（約2.6億）の大半が消えます。',ACC2],
 ['04','流通株式比率25%基準','合併後の流通株式比率は21.62〜30.59%と試算され、東証グロースの上場維持基準に抵触する可能性があります（改善期間1年）。',ACC2]
].forEach((r,i)=>{
  const x=0.7+(i%2)*6.05, y=1.85+Math.floor(i/2)*2.35;
  s.addShape(p.ShapeType.roundRect,{x,y,w:5.85,h:2.1,rectRadius:0.06,fill:{color:'26333F'},line:{color:'3A4854',width:1}});
  T(s,r[0],{x:x+0.3,y:y+0.24,w:0.9,h:0.35,fontSize:15,bold:true,color:r[3]});
  T(s,r[1],{x:x+1.15,y:y+0.22,w:4.5,h:0.4,fontSize:14.5,bold:true,color:WHITE});
  T(s,r[2],{x:x+0.3,y:y+0.70,w:5.25,h:1.2,fontSize:10.5,color:'A8B5C0',lineSpacingMultiple:1.2});
});
T(s,'いずれも「合併しない理由」ではなく、合併条件の交渉材料です。特に③のれんは、合併比率そのものに跳ね返る論点です。',
  {x:0.7,y:6.7,w:11.9,h:0.32,fontSize:12.5,bold:true,color:ACC2});
s.addNotes('のれん22.09億は最重要。利益が消えるなら比率を見直す、という交渉に使える。');

/* 9 対等化コスト */
s=p.addSlide(); light(s);
head(s,'選択肢 2 ─ 合併','重松氏と対等になるために必要な取得コスト');
[['A','重松氏 個人分のみと並ぶ','14.80% vs 13.25%','0.09','億円','差分 1.55pt = 約4万株を相対取得','市場で買う場合は 0.18億円',POS],
 ['B','ダブルパインズを含めて並ぶ','23.18% vs 13.25%','2.01','億円','差分 9.93pt = 約88万株を相対取得','市場で買う場合は 4.02億円',ACC]
].forEach((r,i)=>{
  const x=0.7+i*6.05;
  card(s,x,1.7,5.85,3.1,i?'FBF1F3':WHITE,i?'E3CBD1':LINE);
  badge(s,x+0.35,1.95,1.6,'ケース '+r[0],r[7]);
  T(s,r[1],{x:x+0.35,y:2.45,w:5.15,h:0.35,fontSize:16,bold:true,color:INK});
  T(s,r[2],{x:x+0.35,y:2.82,w:5.15,h:0.3,fontSize:11,color:MUT});
  T(s,[{text:r[3],options:{fontSize:40,bold:true,color:r[7]}},{text:r[4],options:{fontSize:15,bold:true,color:r[7]}}],
    {x:x+0.35,y:3.2,w:5.15,h:0.75});
  T(s,r[5],{x:x+0.35,y:4.0,w:5.15,h:0.3,fontSize:10.5,color:INK2});
  T(s,r[6],{x:x+0.35,y:4.32,w:5.15,h:0.3,fontSize:10.5,color:MUT});
});
card(s,0.7,5.0,11.9,1.5,'F7F3EC','E0D3BE');
T(s,'ただし、実行方法には制約があります',{x:1.0,y:5.2,w:6,h:0.3,fontSize:13.5,bold:true,color:WARN});
[['特定株比率 80.5%','市場に流通する株が少なく、まとまった株数を市場で買うと株価が跳ねます。相対取得が前提です。'],
 ['5%ルール','5%を超えて取得した時点で大量保有報告書の提出義務が生じ、意図が公開されます。'],
 ['株価は3ヶ月平均で固定','3ヶ月平均229円は6ヶ月平均240円より低く、交付株数が増えるため当社に有利です。書面で先に合意すべきです。']
].forEach((r,i)=>{
  const x=1.0+i*3.92;
  T(s,r[0],{x,y:5.58,w:3.7,h:0.28,fontSize:11.5,bold:true,color:INK});
  T(s,r[1],{x,y:5.88,w:3.7,h:0.55,fontSize:9.5,color:INK2});
});
T(s,'3ヶ月平均株価は公開情報からの推定値（約229円、レンジ225〜235円）です。確定値は証券会社経由でご確認ください。',
  {x:0.7,y:6.68,w:11.9,h:0.3,fontSize:9,color:MUT});
s.addNotes('ケースBの2.01億が現実的な数字。当初「1,131万円」と試算したのは誤りで、四季報で重松氏とダブルパインズが別記載と確認して修正済み。');

/* 10 2案の比較 */
s=p.addSlide(); light(s);
head(s,'比較','2つの選択肢を並べると');
tbl(s,[
 [{text:'',options:TH},{text:'選択肢 1 ─ MBO',options:Object.assign({align:'center'},TH)},
  {text:'選択肢 2 ─ SM合併',options:Object.assign({align:'center'},TH)}],
 [{text:'中野の持分',options:{bold:true}},{text:'50.000%（中野＋中野ファンド）',options:{align:'center',bold:true,color:POS}},{text:'13.25%（SO行使後 14.41%）',options:{align:'center',color:NEG}}],
 [{text:'ビジョン社との関係',options:{bold:true}},{text:'完全に解消',options:{align:'center',color:POS}},{text:'筆頭株主として残る（19.26%）',options:{align:'center',color:NEG}}],
 [{text:'必要資金',options:{bold:true}},{text:'中野ファンド 6.10億円',options:{align:'center'}},{text:'不要（株式交換）',options:{align:'center',color:POS}}],
 [{text:'債務超過の解消',options:{bold:true}},{text:'解消（自己資本比率 24.9%）',options:{align:'center',color:POS}},{text:'合算では解消',options:{align:'center'}}],
 [{text:'既存株主の出口',options:{bold:true}},{text:'現金で全額（20億評価）',options:{align:'center',color:POS}},{text:'上場株式として流動性を獲得',options:{align:'center',color:POS}}],
 [{text:'利益への影響',options:{bold:true}},{text:'出向費 年0.72億が消滅（増益）',options:{align:'center',color:POS}},{text:'のれん償却 年1.10〜2.21億（減益）',options:{align:'center',color:NEG}}],
 [{text:'競合の株主参加',options:{bold:true}},{text:'なし',options:{align:'center',color:POS}},{text:'TKP 12.79%',options:{align:'center',color:NEG}}],
 [{text:'実行の難易度',options:{bold:true}},{text:'資金調達と会社法手続きが必要',options:{align:'center'}},{text:'先方提案のため交渉は進めやすい',options:{align:'center'}}]],
 {x:0.7,y:1.72,w:11.9,colW:[3.1,4.4,4.4],rowH:0.44,fontSize:11.5});
card(s,0.7,6.05,11.9,0.95,'FBF1F3','E3CBD1');
T(s,'結論：順序が効きます。MBOでビジョンを整理してから合併に臨めば、中野の持分は13.25%ではなく大きく改善し、のれん・流通株式比率の条件も交渉できる立場になります。',
  {x:1.0,y:6.25,w:11.3,h:0.6,fontSize:13,bold:true,color:ACC});
s.addNotes('比較表は中村社長向け。結論の一行が本日一番言いたいこと。');

/* 11 みずほへのお願い */
s=p.addSlide(); dark(s);
head(s,'ご相談','みずほ銀行様にお願いしたい3点',true);
[['01','グループのエクイティ機能のご紹介','パートナー13.47億円の引受先として、ヒューリック・東京建物に加え、みずほキャピタル様やみずほグループのファンドをご紹介いただけないでしょうか。','13.47億円'],
 ['02','経営者保証の解除','自己資本比率24.9%・DSCR1.58倍となる取引後の財務内容を前提に、経営者保証ガイドラインに沿った解除をご検討いただきたく存じます。','ガイドライン適用'],
 ['03','既存借入の継続とビジョン借入のリファイ','既存3.07億円の継続に加え、ビジョン社借入のうち3.00億円のリファイナンスをお願いしたく存じます。LBOローンではなく、通常の事業性融資としてのご検討です。','合計 6.07億円']
].forEach((r,i)=>{
  const y=1.85+i*1.58;
  s.addShape(p.ShapeType.roundRect,{x:0.7,y,w:11.9,h:1.4,rectRadius:0.06,fill:{color:'26333F'},line:{color:'3A4854',width:1}});
  s.addShape(p.ShapeType.roundRect,{x:1.0,y:y+0.36,w:0.68,h:0.68,rectRadius:0.5,fill:{color:ACC}});
  T(s,r[0],{x:1.0,y:y+0.36,w:0.68,h:0.68,fontSize:16,bold:true,color:WHITE,align:'center',valign:'middle'});
  T(s,r[1],{x:1.95,y:y+0.24,w:7.4,h:0.38,fontSize:16,bold:true,color:WHITE});
  T(s,r[2],{x:1.95,y:y+0.66,w:7.4,h:0.65,fontSize:10.5,color:'A8B5C0',lineSpacingMultiple:1.15});
  T(s,r[3],{x:9.6,y:y+0.5,w:2.7,h:0.42,fontSize:15,bold:true,color:ACC2,align:'right'});
});
T(s,'ご返済原資は正常化EBITDA 2.65億円です。年間元利返済1.68億円に対しDSCR 1.58倍を確保しています。',
  {x:0.7,y:6.7,w:11.9,h:0.32,fontSize:12.5,bold:true,color:ACC2});
s.addNotes('①が本丸。②③は同時に出しておく。返済原資の話を必ず添える。');

/* 12 スケジュールと論点 */
s=p.addSlide(); light(s);
head(s,'次のステップ','クロージングまでの手順と、先に固める論点');
T(s,'会社法上の手続き（クロージング 2027年5月31日を想定）',{x:0.7,y:1.68,w:11.9,h:0.32,fontSize:14,bold:true,color:INK});
[['STEP 1','無償減資・欠損填補','資本金・資本準備金を取り崩し、繰越欠損金△10.62億を填補。分配可能額をつくります。'],
 ['STEP 2','第三者割当増資 19.57億円','中野ファンド6.10億・パートナー13.47億。払込により債務超過が解消します。'],
 ['STEP 3','自己株式取得 12.72億円','中野以外の全株主から127,616株を取得。売主追加請求権・特別利害関係人の処理が必要です。'],
 ['STEP 4','ビジョン借入の返済','7.90億円。増資4.90億＋みずほ様3.00億で、ビジョン社との債権債務を完全に解消します。']
].forEach((r,i)=>{
  const x=0.7+i*3.02;
  card(s,x,2.1,2.85,2.0);
  badge(s,x+0.22,2.3,1.15,r[0],i===3?POS:ACC);
  T(s,r[1],{x:x+0.22,y:2.78,w:2.45,h:0.6,fontSize:12.5,bold:true,color:INK});
  T(s,r[2],{x:x+0.22,y:3.4,w:2.45,h:0.62,fontSize:9.5,color:INK2,lineSpacingMultiple:1.1});
});
[[0.7,'先に固めるべき論点',ACC,[
   '正常化営業利益2.00億円の店舗別PLによる裏付け',
   'パートナーとのデッドロック解消条項（50:50のため必須）',
   '中野ファンドのGP議決権集約と金商法63条の届出',
   'ストックオプション9,000株の行使方法と税制適格性']],
 [6.75,'並行して確認すること',BLUE,[
   'スペースマーケット社LOI（18億円評価）の原文と有効期限',
   '3ヶ月平均株価の確定値（証券会社経由）',
   '流通株式比率について東証への事前相談',
   'のれん償却年数の取扱いに関する監査法人の見解']]
].forEach(g=>{
  card(s,g[0],4.32,5.85,2.2,g[2]===ACC?'FBF1F3':'EEF3F8',g[2]===ACC?'E3CBD1':'C6D6E5');
  T(s,g[1],{x:g[0]+0.3,y:4.5,w:5.25,h:0.32,fontSize:13.5,bold:true,color:g[2]});
  g[3].forEach((t,i)=>{
    const y=4.92+i*0.37;
    s.addShape(p.ShapeType.roundRect,{x:g[0]+0.32,y:y+0.09,w:0.14,h:0.14,rectRadius:0.5,fill:{color:g[2]}});
    T(s,t,{x:g[0]+0.62,y:y,w:4.95,h:0.32,fontSize:10.5,color:INK2});
  });
});
T(s,'本資料は検討段階の想定値です。数値は第10期計算書類および公開情報にもとづく試算であり、実行にあたっては弁護士・会計士・税理士の確認を要します。',
  {x:0.7,y:6.72,w:11.9,h:0.3,fontSize:9,color:MUT});
s.addNotes('最後は宿題の確認。特に正常化営業利益の裏付けが融資審査の生命線。');

p.writeFile({fileName:'あどばる資本政策_要点_20260923.pptx'}).then(()=>console.log('written'));
