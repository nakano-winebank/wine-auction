const P=require('pptxgenjs');
const p=new P(); p.layout='LAYOUT_WIDE';           // 13.333 x 7.5
const W=13.333,H=7.5;
const INK='1E2A38', INK2='3D4E60', MUT='7C8A99', LINE='D9E0E7',
      PAPER='F5F7F9', WHITE='FFFFFF', ACC='6E2639', ACC2='A85C6E',
      POS='2C6A4E', NEG='8A2E26', WARN='8F5510', GOLD='B08D57';
const F='Meiryo';
const notes=[];

// ---------- helpers ----------
const dark=(s)=>s.background={color:INK};
const light=(s)=>s.background={color:PAPER};
function head(s,kicker,title,onDark){
  s.addText(kicker,{x:0.7,y:0.45,w:11.9,h:0.28,fontFace:F,fontSize:11,bold:true,
    charSpacing:2,color:onDark?ACC2:ACC,margin:0});
  s.addText(title,{x:0.7,y:0.78,w:11.9,h:0.72,fontFace:F,fontSize:29,bold:true,
    color:onDark?WHITE:INK,margin:0});
}
function card(s,x,y,w,h,fill,line){
  s.addShape(p.ShapeType.roundRect,{x,y,w,h,rectRadius:0.06,fill:{color:fill||WHITE},
    line:{color:line||LINE,width:1},shadow:{type:'outer',blur:8,offset:1,angle:90,color:'AAB4BE',opacity:0.18}});
}
function stat(s,x,y,w,label,val,unit,sub,col){
  s.addText(label,{x,y,w,h:0.26,fontFace:F,fontSize:11,color:MUT,margin:0});
  s.addText([{text:val,options:{fontSize:31,bold:true,color:col||INK}},
             {text:unit||'',options:{fontSize:14,bold:true,color:col||INK}}],
    {x,y:y+0.26,w,h:0.55,fontFace:F,margin:0});
  if(sub) s.addText(sub,{x,y:y+0.83,w,h:0.26,fontFace:F,fontSize:10,color:MUT,margin:0});
}
const TH={fill:INK,color:WHITE,bold:true,fontSize:11};
function table(s,rows,opts){
  s.addTable(rows,Object.assign({fontFace:F,fontSize:11.5,color:INK2,
    border:{type:'solid',color:LINE,pt:0.5},valign:'middle'},opts));
}

/* ===== 1 表紙 ===== */
let s=p.addSlide(); dark(s);
s.addText('株式会社あどばる',{x:0.9,y:1.75,w:11.5,h:0.4,fontFace:F,fontSize:14,bold:true,color:ACC2,charSpacing:3,margin:0});
s.addText('資本再編（MBO）のご提案',{x:0.9,y:2.2,w:11.5,h:1.0,fontFace:F,fontSize:42,bold:true,color:WHITE,margin:0});
s.addText('債務超過の解消と、ビジョン社からの独立に向けた資金計画',
  {x:0.9,y:3.3,w:10.5,h:0.45,fontFace:F,fontSize:16,color:'B9C4CF',margin:0});
s.addText('2026年8月26日',{x:0.9,y:3.72,w:10.5,h:0.3,fontFace:F,fontSize:13,color:ACC2,margin:0});
s.addShape(p.ShapeType.line,{x:0.9,y:4.18,w:3.2,h:0,line:{color:ACC,width:2}});
[['ご提示先','株式会社みずほ銀行 御中'],['作成','株式会社あどばる 代表取締役 中野 邦人'],
 ['クロージング想定','2027年5月31日'],
 ['基準','第10期（2026年5月期）計算書類']].forEach((r,i)=>{
  s.addText(r[0],{x:0.9,y:4.5+i*0.40,w:1.5,h:0.3,fontFace:F,fontSize:10,color:MUT,margin:0});
  s.addText(r[1],{x:2.5,y:4.5+i*0.40,w:8.5,h:0.3,fontFace:F,fontSize:12,color:'D5DDE5',margin:0});
});
s.addText('本資料は検討段階の想定値であり、法務・税務・会計上の助言ではありません',
  {x:0.9,y:6.75,w:11.5,h:0.3,fontFace:F,fontSize:9,color:'6D7A87',margin:0});
notes.push('みずほ銀行役員との会食用。目的は融資の申込ではなく、①グループのエクイティ機能の紹介、②経営者保証の解除、③与信感の確認の3点を持ち帰ってもらうこと。');

/* ===== 2 サマリー ===== */
s=p.addSlide(); light(s);
head(s,'EXECUTIVE SUMMARY','ご提案の骨子');
const sum=[['01','債務超過を増資で解消','第三者割当増資19.57億により純資産は△2.59億から+3.90億へ。自己資本比率24.9%の会社になります。',POS],
           ['02','ビジョン社の借入を全額返済','7.90億を額面満額・全額現金で返済（増資4.90億＋みずほのリファイ3.00億）。資本・債権関係を完全に解消します。',ACC],
           ['03','中野とパートナーが50:50','既存株主7社の全株を会社が買い取り、株主は中野陣営とパートナーの2者のみになります。',INK]];
sum.forEach((r,i)=>{
  const y=1.75+i*1.42;
  card(s,0.7,y,11.9,1.24);
  s.addShape(p.ShapeType.roundRect,{x:1.0,y:y+0.3,w:0.62,h:0.62,rectRadius:0.5,fill:{color:r[3]}});
  s.addText(r[0],{x:1.0,y:y+0.3,w:0.62,h:0.62,fontFace:F,fontSize:15,bold:true,color:WHITE,align:'center',valign:'middle',margin:0});
  s.addText(r[1],{x:1.85,y:y+0.2,w:10.4,h:0.36,fontFace:F,fontSize:17,bold:true,color:INK,margin:0});
  s.addText(r[2],{x:1.85,y:y+0.6,w:10.4,h:0.5,fontFace:F,fontSize:12,color:INK2,margin:0});
});
s.addText('みずほ銀行様へのお願いは、買収ファイナンスではなく「既存借入の借換え」と「運転資金枠」です。',
  {x:0.7,y:6.35,w:11.9,h:0.35,fontFace:F,fontSize:13,bold:true,color:ACC,margin:0});
notes.push('この3点だけ覚えて帰ってもらう。特に3点目、依頼はLBOではなく借換えである点を強調する。');

/* ===== 3 現状 ===== */
s=p.addSlide(); light(s);
head(s,'現状','第10期の実績と、バランスシートの課題');
stat(s,0.7,1.7,2.6,'売上高','21.80','億円','前期比 +18.8%',POS);
stat(s,3.5,1.7,2.6,'営業利益','1.58','億円','前期1.77億から減益',INK);
stat(s,6.3,1.7,2.6,'純資産','△4.09','億円','債務超過',NEG);
stat(s,9.1,1.7,2.6,'現預金','0.40','億円','総資産13.16億に対し',NEG);
card(s,0.7,3.15,5.75,3.15);
s.addText('有利子負債 11.57億円の内訳',{x:1.0,y:3.35,w:5.2,h:0.32,fontFace:F,fontSize:14,bold:true,color:INK,margin:0});
table(s,[[{text:'借入先',options:TH},{text:'残高',options:Object.assign({align:'right'},TH)}],
  ['株式会社ビジョン','7.90億'],['日本政策金融公庫','2.24億'],['武蔵野銀行','1.36億'],['十六銀行・大垣共立銀行','0.07億'],
  [{text:'合計',options:{bold:true}},{text:'11.57億',options:{bold:true,align:'right'}}]],
  {x:1.0,y:3.78,w:5.15,colW:[3.55,1.6],rowH:0.34,align:'left'});
card(s,6.85,3.15,5.75,3.15,'FBF1F3','E3CBD1');
s.addText('ここが融資判断の壁になります',{x:7.15,y:3.35,w:5.2,h:0.32,fontFace:F,fontSize:14,bold:true,color:ACC,margin:0});
[['純資産が△4.09億の債務超過','この状態では新規融資の稟議が通りません'],
 ['ビジョン社への借入が7.90億','有利子負債の68%を親会社が占めています'],
 ['現預金が0.40億','月商1.8億に対し手元流動性が極端に薄い']].forEach((r,i)=>{
  const y=3.85+i*0.78;
  s.addShape(p.ShapeType.roundRect,{x:7.15,y:y+0.04,w:0.2,h:0.2,rectRadius:0.5,fill:{color:ACC}});
  s.addText(r[0],{x:7.5,y:y-0.02,w:4.9,h:0.3,fontFace:F,fontSize:12.5,bold:true,color:INK,margin:0});
  s.addText(r[1],{x:7.5,y:y+0.28,w:4.9,h:0.3,fontFace:F,fontSize:10.5,color:INK2,margin:0});
});
notes.push('債務超過は隠さず先に出す。隠すと信用を失う。次のスライドで正常収益力を示して反転させる。');

/* ===== 4 正常収益力 ===== */
s=p.addSlide(); light(s);
head(s,'収益力','ビジョン社への出向費がなくなった前提での正常収益力');
card(s,0.7,1.7,11.9,1.6);
const bridge=[['第10期 報告営業利益','1.58億',INK],['出向費 年0.72億の喪失','△0.72億',NEG],
              ['撤退店舗の損失解消・大型2施設の通年寄与等','+1.14億',POS],['正常化営業利益','2.00億',ACC]];
bridge.forEach((r,i)=>{
  const x=1.05+i*2.95;
  s.addText(r[0],{x,y:1.95,w:2.75,h:0.55,fontFace:F,fontSize:10.5,color:MUT,margin:0});
  s.addText(r[1],{x,y:2.5,w:2.75,h:0.5,fontFace:F,fontSize:23,bold:true,color:r[2],margin:0});
  if(i<3) s.addText('→',{x:x+2.6,y:2.55,w:0.35,h:0.4,fontFace:F,fontSize:16,color:MUT,align:'center',margin:0});
});
stat(s,0.7,3.55,3.0,'正常化EBITDA','2.65','億円','営業利益2.00＋減価償却0.65',INK);
stat(s,3.95,3.55,3.0,'ネットデット / EBITDA','4.2','倍','取引前',NEG);
stat(s,7.2,3.55,3.0,'返済前フリーCF','1.77','億円','設備投資0.75億控除後',INK);
stat(s,10.45,3.55,2.2,'売上成長','+18.8','%','第10期実績',POS);
card(s,0.7,4.85,11.9,1.5,'F0F4F1','C9DCD1');
s.addText('この1.14億の裏付けを、店舗別・部門別のPLでご提出します',
  {x:1.05,y:5.05,w:11.2,h:0.35,fontFace:F,fontSize:14,bold:true,color:POS,margin:0});
s.addText('第10期は「スキマレンタル」の戦略的撤退を実行した期であり、固定資産除却損4,081万円を計上しています。撤退した不採算店舗が営業段階で抱えていた損失、および前年度末に開業したグレイドパーク渋谷・表参道の立ち上げ期の低稼働が、報告値を押し下げています。',
  {x:1.05,y:5.42,w:11.2,h:0.8,fontFace:F,fontSize:11.5,color:INK2,margin:0});
notes.push('銀行は必ず「報告1.58億から2.00億にどう上がるのか」を聞く。店舗別PLを用意しておくこと。ここが崩れると案件全体が崩れる。');

/* ===== 5 スキーム ===== */
s=p.addSlide(); dark(s);
head(s,'SCHEME','取引の全体像',true);
const boxes=[
 {x:0.7,t:'① 第三者割当増資',a:'19.57億円',b:'中野ファンド 6.10億\nパートナー 13.47億',c:ACC},
 {x:4.05,t:'② ビジョン借入の返済',a:'7.90億円',b:'増資4.90億＋みずほ3.00億\n資本・債権関係を完全解消',c:INK2},
 {x:7.40,t:'③ 自己株式取得',a:'12.72億円',b:'既存株主7社127,616株\n1株9,964円で全株買取',c:INK2},
 {x:10.75,t:'④ 手元資金',a:'1.50億円',b:'運転資金として社内に留保\n現預金は2.19億へ',c:POS}];
boxes.forEach(o=>{
  s.addShape(p.ShapeType.roundRect,{x:o.x,y:1.85,w:2.0,h:2.5,rectRadius:0.06,
    fill:{color:'26333F'},line:{color:o.c===ACC?ACC:'3A4854',width:o.c===ACC?2:1}});
  s.addText(o.t,{x:o.x+0.18,y:2.05,w:1.65,h:0.5,fontFace:F,fontSize:11.5,bold:true,color:o.c===ACC?ACC2:'C3CDD6',margin:0});
  s.addText(o.a,{x:o.x+0.18,y:2.6,w:1.65,h:0.42,fontFace:F,fontSize:18,bold:true,color:WHITE,margin:0});
  s.addText(o.b,{x:o.x+0.18,y:3.08,w:1.65,h:1.1,fontFace:F,fontSize:9.5,color:'93A2AF',margin:0});
});
[2.75,6.10,9.45].forEach(x=>s.addText('▶',{x,y:2.95,w:0.5,h:0.4,fontFace:F,fontSize:13,color:ACC,align:'center',margin:0}));
s.addShape(p.ShapeType.roundRect,{x:0.7,y:4.65,w:11.9,h:1.75,rectRadius:0.06,fill:{color:'26333F'},line:{color:'3A4854',width:1}});
s.addText('取引後の株主は2者のみ',{x:1.0,y:4.85,w:5.0,h:0.35,fontFace:F,fontSize:15,bold:true,color:WHITE,margin:0});
[['中野陣営','50.000%','中野邦人 74,000株（SO行使後）＋ 中野ファンド 61,180株',ACC2],
 ['パートナー','50.000%','135,180株（ヒューリック／東京建物等）','8FB0CC']].forEach((r,i)=>{
  const x=1.0+i*5.85;
  s.addText(r[0],{x,y:5.35,w:2.4,h:0.3,fontFace:F,fontSize:12,color:'93A2AF',margin:0});
  s.addText(r[1],{x,y:5.58,w:5.5,h:0.44,fontFace:F,fontSize:24,bold:true,color:r[3],margin:0});
  s.addText(r[2],{x,y:6.0,w:5.5,h:0.3,fontFace:F,fontSize:10,color:'93A2AF',margin:0});
});
s.addText('既存株主7社（ビジョン・BOS・エアトリ・KUMA・フィル・ベクトル・アンビション）は全株を売却し、株主名簿から外れます',
  {x:0.7,y:6.62,w:11.9,h:0.3,fontFace:F,fontSize:10.5,color:'7F8E9B',margin:0});
notes.push('4ステップと、結果として株主が2者だけになることを説明。少数株主が消えるので意思決定が速くなる点も触れる。');

/* ===== 6 資金の流れ ===== */
s=p.addSlide(); light(s);
head(s,'資金の流れ','誰が、いくら、どこへ');
card(s,0.7,1.7,5.9,4.6);
s.addText('資金の出し手',{x:1.0,y:1.9,w:5.3,h:0.32,fontFace:F,fontSize:14,bold:true,color:INK,margin:0});
table(s,[[{text:'出し手',options:TH},{text:'金額',options:Object.assign({align:'right'},TH)},{text:'方法',options:TH}],
 ['中野 邦人','0.09億','SO 9,000株の行使'],
 ['中野ファンド','6.10億','第三者割当増資'],['パートナー','13.47億','第三者割当増資'],
 [{text:'増資 合計',options:{bold:true}},{text:'19.57億',options:{bold:true,align:'right'}},{text:'',options:{}}],
 ['みずほ銀行','3.00億','ビジョン借入のリファイ'],['みずほ銀行','（継続）','既存借入3.07億']],
 {x:1.0,y:2.35,w:5.3,colW:[1.85,1.25,2.2],rowH:0.38});
s.addText('中野様は既存74,000株（7.37億相当）を保有したまま参加するため、パートナーより7.37億少ない拠出で50%になります',
 {x:1.0,y:5.35,w:5.3,h:0.75,fontFace:F,fontSize:10.5,color:ACC,margin:0});
card(s,6.85,1.7,5.75,4.6);
s.addText('資金の使いみち',{x:7.15,y:1.9,w:5.2,h:0.32,fontFace:F,fontSize:14,bold:true,color:INK,margin:0});
table(s,[[{text:'使途',options:TH},{text:'金額',options:Object.assign({align:'right'},TH)},{text:'支払先',options:TH}],
 ['既存株主7社の全株買取','12.72億','各株主'],['ビジョン借入の返済','7.90億','ビジョン'],
 ['諸費用（DD・法務・税務等）','0.45億','専門家'],['手元運転資金として留保','1.50億','社内'],
 [{text:'合計',options:{bold:true}},{text:'22.57億',options:{bold:true,align:'right'}},{text:'',options:{}}]],
 {x:7.15,y:2.35,w:5.2,colW:[2.35,1.05,1.8],rowH:0.42});
s.addText('ビジョン社の受取総額は 株式9.41億 ＋ BOS 0.20億 ＋ 借入返済7.90億 ＝ 17.51億円。すべて現金、借入は額面満額です',
 {x:7.15,y:5.35,w:5.2,h:0.75,fontFace:F,fontSize:10.5,color:ACC,margin:0});
notes.push('左右で出し手と使い道が対応。増資23.6億が全部使われ、2億だけ手元に残る構造。');

/* ===== 7 想定BS ===== */
s=p.addSlide(); light(s);
head(s,'想定バランスシート','取引前後の比較');
table(s,[
 [{text:'科目',options:TH},{text:'第10期末 実績',options:Object.assign({align:'right'},TH)},
  {text:'クロージング直前',options:Object.assign({align:'right'},TH)},
  {text:'取引後（想定）',options:Object.assign({align:'right'},TH)}],
 [{text:'現金及び預金',options:{bold:true}},{text:'40,414',options:{align:'right'}},{text:'60,000',options:{align:'right'}},{text:'219,000',options:{align:'right',bold:true}}],
 ['その他流動資産',{text:'395,416',options:{align:'right'}},{text:'463,779',options:{align:'right'}},{text:'463,779',options:{align:'right'}}],
 ['固定資産',{text:'880,198',options:{align:'right'}},{text:'880,198',options:{align:'right'}},{text:'880,198',options:{align:'right'}}],
 [{text:'資産合計',options:{bold:true,fill:'E8EDF2'}},{text:'1,316,028',options:{align:'right',bold:true,fill:'E8EDF2'}},{text:'1,403,977',options:{align:'right',bold:true,fill:'E8EDF2'}},{text:'1,562,977',options:{align:'right',bold:true,fill:'E8EDF2'}}],
 [{text:'有利子負債',options:{bold:true}},{text:'1,159,051',options:{align:'right'}},{text:'1,097,000',options:{align:'right'}},{text:'607,000',options:{align:'right',bold:true}}],
 ['その他負債',{text:'566,409',options:{align:'right'}},{text:'566,409',options:{align:'right'}},{text:'566,409',options:{align:'right'}}],
 [{text:'負債合計',options:{bold:true,fill:'E8EDF2'}},{text:'1,725,460',options:{align:'right',bold:true,fill:'E8EDF2'}},{text:'1,663,409',options:{align:'right',bold:true,fill:'E8EDF2'}},{text:'1,173,409',options:{align:'right',bold:true,fill:'E8EDF2'}}],
 ['資本金',{text:'10,000',options:{align:'right'}},{text:'10,000',options:{align:'right'}},{text:'1,000',options:{align:'right'}}],
 ['資本剰余金',{text:'642,160',options:{align:'right'}},{text:'642,160',options:{align:'right'}},{text:'1,705,568',options:{align:'right'}}],
 ['利益剰余金',{text:'△1,061,592',options:{align:'right',color:NEG}},{text:'△911,592',options:{align:'right',color:NEG}},{text:'△45,000',options:{align:'right'}}],
 ['自己株式',{text:'―',options:{align:'right',color:MUT}},{text:'―',options:{align:'right',color:MUT}},{text:'△1,272,000',options:{align:'right'}}],
 [{text:'純資産合計',options:{bold:true,fill:'F3E7EA'}},{text:'△409,432',options:{align:'right',bold:true,color:NEG,fill:'F3E7EA'}},{text:'△259,432',options:{align:'right',bold:true,color:NEG,fill:'F3E7EA'}},{text:'389,568',options:{align:'right',bold:true,color:POS,fill:'F3E7EA'}}],
 [{text:'自己資本比率',options:{bold:true}},{text:'△31.1%',options:{align:'right',bold:true,color:NEG}},{text:'△18.5%',options:{align:'right',bold:true,color:NEG}},{text:'24.9%',options:{align:'right',bold:true,color:POS}}]],
 {x:0.7,y:1.72,w:11.9,colW:[3.8,2.7,2.7,2.7],rowH:0.325,fontSize:11});
s.addText('単位：千円　／　クロージング直前は第10期末から1年間で純資産+1.50億の改善を見込んだ想定値　／　繰越欠損金は無償減資により資本剰余金で填補します',
 {x:0.7,y:6.75,w:11.9,h:0.3,fontFace:F,fontSize:10,color:MUT,margin:0});
notes.push('本日の主役。債務超過△4.09億が+5.81億に、自己資本比率38.3%になることを示す。単位は千円。');

/* ===== 8 財務指標 ===== */
s=p.addSlide(); light(s);
head(s,'財務指標','取引後の信用力');
const met=[['自己資本比率','△18.5%','24.9%',POS],['有利子負債','10.97億','6.07億',POS],
           ['有利子負債 / EBITDA','4.1倍','2.3倍',POS],['DSCR','―','1.58倍',POS]];
met.forEach((r,i)=>{
  const x=0.7+i*3.02;
  card(s,x,1.72,2.85,2.15);
  s.addText(r[0],{x:x+0.22,y:1.92,w:2.4,h:0.5,fontFace:F,fontSize:11.5,bold:true,color:MUT,margin:0});
  s.addText(r[1],{x:x+0.22,y:2.42,w:2.4,h:0.32,fontFace:F,fontSize:13,color:NEG,margin:0});
  s.addText('▼',{x:x+0.22,y:2.74,w:2.4,h:0.22,fontFace:F,fontSize:9,color:MUT,margin:0});
  s.addText(r[2],{x:x+0.22,y:2.98,w:2.4,h:0.6,fontFace:F,fontSize:26,bold:true,color:r[3],margin:0});
});
s.addChart(p.ChartType.bar,[
 {name:'取引前',labels:['純資産','有利子負債'],values:[-2.59,10.97]},
 {name:'取引後',labels:['純資産','有利子負債'],values:[3.90,6.07]}],
 {x:0.7,y:4.05,w:6.2,h:2.5,barDir:'col',chartColors:[MUT,ACC],showTitle:true,
  title:'純資産と有利子負債の変化（億円）',
  titleFontSize:13,titleColor:INK,titleFontFace:F,showValue:true,dataLabelPosition:'outEnd',
  dataLabelFormatCode:'0.00',dataLabelFontFace:F,dataLabelFontSize:9,dataLabelColor:INK,
  showLegend:true,legendPos:'b',legendFontFace:F,legendFontSize:9,
  catAxisLabelFontFace:F,catAxisLabelFontSize:10,catAxisLabelColor:INK2,
  valAxisLabelFontFace:F,valAxisLabelFontSize:9,valAxisLabelColor:MUT,
  valGridLine:{color:LINE,size:0.5},catGridLine:{style:'none'}});
card(s,7.2,4.05,5.4,2.5,'F0F4F1','C9DCD1');
s.addText('みずほ銀行様へのご依頼は借換えです',{x:7.5,y:4.25,w:4.85,h:0.32,fontFace:F,fontSize:14,bold:true,color:POS,margin:0});
s.addText('取引後のあどばるは、自己資本比率24.9%・有利子負債2.3倍・DSCR1.58倍の会社になります。買収ファイナンス（LBOローン）ではなく、債務超過を解消した事業会社に対する通常のご融資としてご検討いただけます。\n\n・既存借入 3.07億円の継続\n・ビジョン借入のリファイ 3.00億円',
  {x:7.5,y:4.62,w:4.85,h:1.8,fontFace:F,fontSize:11,color:INK2,margin:0,lineSpacingMultiple:1.15});
notes.push('LBOではなく借換えである、という一点を必ず伝える。審査の重さがまったく違う。');

/* ===== 9 株主名簿 ===== */
s=p.addSlide(); light(s);
head(s,'株主名簿','取引完了後の想定');
table(s,[
 [{text:'株主名',options:TH},{text:'種類',options:TH},{text:'株数',options:Object.assign({align:'right'},TH)},
  {text:'発行済比率',options:Object.assign({align:'right'},TH)},{text:'議決権',options:Object.assign({align:'center'},TH)},
  {text:'議決権比率',options:Object.assign({align:'right'},TH)}],
 [{text:'中野 邦人',options:{bold:true,fill:'F3E7EA'}},{text:'普通株式',options:{fill:'F3E7EA'}},{text:'74,000',options:{align:'right',fill:'F3E7EA'}},{text:'18.59%',options:{align:'right',fill:'F3E7EA'}},{text:'○',options:{align:'center',fill:'F3E7EA'}},{text:'27.371%',options:{align:'right',bold:true,fill:'F3E7EA'}}],
 [{text:'中野ファンド（仮称）',options:{bold:true,fill:'F3E7EA'}},{text:'普通株式',options:{fill:'F3E7EA'}},{text:'61,180',options:{align:'right',fill:'F3E7EA'}},{text:'15.37%',options:{align:'right',fill:'F3E7EA'}},{text:'○',options:{align:'center',fill:'F3E7EA'}},{text:'22.629%',options:{align:'right',bold:true,fill:'F3E7EA'}}],
 [{text:'　中野陣営 小計',options:{bold:true,color:ACC}},{text:'',options:{}},{text:'135,180',options:{align:'right',bold:true,color:ACC}},{text:'33.97%',options:{align:'right',bold:true,color:ACC}},{text:'',options:{}},{text:'50.000%',options:{align:'right',bold:true,color:ACC}}],
 ['パートナー（ヒューリック／東京建物等）','普通株式',{text:'135,180',options:{align:'right'}},{text:'33.97%',options:{align:'right'}},{text:'○',options:{align:'center'}},{text:'50.000%',options:{align:'right',bold:true}}],
 ['株式会社あどばる（自己株式）','普通株式',{text:'127,616',options:{align:'right'}},{text:'32.07%',options:{align:'right'}},{text:'×',options:{align:'center',color:MUT}},{text:'―',options:{align:'right',color:MUT}}],
 [{text:'発行済株式総数',options:{bold:true,fill:'E8EDF2'}},{text:'',options:{fill:'E8EDF2'}},{text:'397,976',options:{align:'right',bold:true,fill:'E8EDF2'}},{text:'100.00%',options:{align:'right',bold:true,fill:'E8EDF2'}},{text:'',options:{fill:'E8EDF2'}},{text:'270,360株',options:{align:'right',bold:true,fill:'E8EDF2'}}]],
 {x:0.7,y:1.72,w:11.9,colW:[4.0,1.7,1.75,1.75,1.1,1.6],rowH:0.44,fontSize:11.5});
card(s,0.7,5.15,5.85,1.5,'FBF1F3','E3CBD1');
s.addText('自己株式には議決権がありません（会社法308条2項）',{x:1.0,y:5.35,w:5.3,h:0.3,fontFace:F,fontSize:12,bold:true,color:ACC,margin:0});
s.addText('買い取った127,616株は自己株式となり議決権を失います。中野様はSO 9,000株を行使して74,000株とし、中野ファンドと合わせて50.000%を確保します。全て普通株式です。',
  {x:1.0,y:5.68,w:5.3,h:0.85,fontFace:F,fontSize:10.5,color:INK2,margin:0});
card(s,6.75,5.15,5.85,1.5);
s.addText('売却する既存株主7社の受取額',{x:7.05,y:5.35,w:5.3,h:0.3,fontFace:F,fontSize:12,bold:true,color:INK,margin:0});
s.addText('ビジョン 9.41億（＋借入返済7.90億）／BOS 0.20億／エアトリ 1.61億／KUMA 0.63億／フィル 0.30億／ベクトル 0.30億／アンビション 0.27億　＝ 合計12.72億円',
  {x:7.05,y:5.68,w:5.3,h:0.85,fontFace:F,fontSize:10.5,color:INK2,margin:0});
notes.push('中野陣営とパートナーがちょうど50:50。全て普通株式なので種類株の交渉が不要。');

/* ===== 10 論点とスケジュール ===== */
s=p.addSlide(); light(s);
head(s,'論点とスケジュール','実行に向けて');
card(s,0.7,1.72,5.85,4.6);
s.addText('会社法上の手続き',{x:1.0,y:1.92,w:5.3,h:0.32,fontFace:F,fontSize:14,bold:true,color:INK,margin:0});
[['1','第三者割当増資 19.57億円','株主総会 特別決議'],
 ['2','無償減資・欠損填補','特別決議＋債権者保護手続（1か月以上）'],
 ['3','自己株式取得 12.72億円','特別決議。分配可能額17.06億で充足'],
 ['4','ビジョン借入 7.90億円の返済','増資と借換えを原資に全額現金で返済']].forEach((r,i)=>{
  const y=2.35+i*0.90;
  s.addShape(p.ShapeType.roundRect,{x:1.0,y:y,w:0.42,h:0.42,rectRadius:0.5,fill:{color:ACC}});
  s.addText(r[0],{x:1.0,y:y,w:0.42,h:0.42,fontFace:F,fontSize:12,bold:true,color:WHITE,align:'center',valign:'middle',margin:0});
  s.addText(r[1],{x:1.58,y:y-0.03,w:4.7,h:0.32,fontFace:F,fontSize:12.5,bold:true,color:INK,margin:0});
  s.addText(r[2],{x:1.58,y:y+0.29,w:4.7,h:0.5,fontFace:F,fontSize:10.5,color:INK2,margin:0});
});
s.addText('2027年5月31日のクロージングに向け、2027年初から着手します',
  {x:1.0,y:5.94,w:5.3,h:0.3,fontFace:F,fontSize:11,bold:true,color:ACC,margin:0});
card(s,6.75,1.72,5.85,4.6,'FBF1F3','E3CBD1');
s.addText('先に固めるべき論点',{x:7.05,y:1.92,w:5.3,h:0.32,fontFace:F,fontSize:14,bold:true,color:ACC,margin:0});
[['デッドロック解消条項','議決権50:50は、意見が割れると会社が止まります。第三者仲裁・買取請求権等を株主間契約に定めます'],
 ['中野ファンドのガバナンス','中野個人は27.4%。GP（資産管理会社）に議決権を集約することが前提です'],
 ['正常化営業利益2.00億の裏付け','店舗別・部門別PLで1.14億の内訳をご提出します'],
 ['連帯保証の解除','債務超過が解消するため、経営者保証ガイドラインの適用をお願いしたく存じます']].forEach((r,i)=>{
  const y=2.4+i*0.95;
  s.addText('■ '+r[0],{x:7.05,y:y,w:5.3,h:0.28,fontFace:F,fontSize:12,bold:true,color:INK,margin:0});
  s.addText(r[1],{x:7.28,y:y+0.28,w:5.05,h:0.6,fontFace:F,fontSize:10,color:INK2,margin:0});
});
notes.push('デッドロックと保証解除の2点が本音の論点。保証解除はこちらから必ず切り出す。');

/* ===== 11 クロージング ===== */
s=p.addSlide(); dark(s);
s.addText('みずほ銀行様にお願いしたいこと',{x:0.9,y:1.5,w:11.5,h:0.65,fontFace:F,fontSize:32,bold:true,color:WHITE,margin:0});
[['01','グループのエクイティ機能のご紹介','みずほキャピタルパートナーズ様、みずほ証券様のM&Aチームをご紹介いただけますでしょうか'],
 ['02','経営者保証の解除','債務超過が解消する本計画において、経営者保証ガイドラインに沿って個人保証を外していただきたく存じます'],
 ['03','借換えとリファイナンスのご検討','既存借入3.07億円の継続と、ビジョン借入のリファイ3.00億円をご検討いただけますでしょうか']].forEach((r,i)=>{
  const y=2.55+i*1.32;
  s.addShape(p.ShapeType.roundRect,{x:0.9,y:y,w:0.68,h:0.68,rectRadius:0.5,fill:{color:ACC}});
  s.addText(r[0],{x:0.9,y:y,w:0.68,h:0.68,fontFace:F,fontSize:15,bold:true,color:WHITE,align:'center',valign:'middle',margin:0});
  s.addText(r[1],{x:1.85,y:y-0.02,w:10.5,h:0.36,fontFace:F,fontSize:18,bold:true,color:WHITE,margin:0});
  s.addText(r[2],{x:1.85,y:y+0.4,w:10.5,h:0.55,fontFace:F,fontSize:12,color:'A9B6C2',margin:0});
});
s.addText('株式会社あどばる　代表取締役　中野 邦人　／　2026年8月26日',{x:0.9,y:6.75,w:11.5,h:0.3,fontFace:F,fontSize:11,color:'6D7A87',margin:0});
notes.push('この3点を持ち帰ってもらう。融資額を今日決める場ではない。');

p.writeFile({fileName:'あどばるMBO_みずほ銀行ご提案_20260826.pptx'}).then(()=>{
  const fs=require('fs');
  console.log('written');
});
