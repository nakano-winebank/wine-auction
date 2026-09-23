const D=require('./design.js')();
const {p,C,F,T,dark,light,head,card,dcard,stat,badge,num,dot,TH,THR,THC,tbl,cover,slide}=D;
let s;

/* 1 表紙 */
s=slide();
cover(s,'株式会社あどばる','ビジョン社からの独立（MBO）',
 '第三者割当増資と自己株式取得による資本構成の再編、ならびに借換えのご相談',
 '2026年9月23日',
 [['ご説明先','株式会社みずほ銀行 御中'],
  ['作成','株式会社あどばる 代表取締役 中野 邦人'],
  ['基準','第10期（2026年5月期）計算書類']],
 '本資料は検討段階の想定値であり、法務・税務・会計上の助言ではありません');
s.addNotes('本日お願いしたいのはMBOの一件のみ。別途スペースマーケット社から合併提案を受けているが、当社としては本件を優先する方針。');

/* 2 結論 */
s=slide(); light(s);
head(s,'ご提案','当社がやりたいことは、この一つです');
card(s,0.7,1.62,11.9,1.74,C.TINT_A,C.TINT_AL);
T(s,'親会社ビジョン社との資本・債権関係をすべて解消し、中野とパートナーの2者で経営する会社にします。',
  {x:1.05,y:1.84,w:11.2,h:0.64,fontSize:20,bold:true,color:C.ACC});
T(s,'そのために第三者割当増資19.57億円を行い、うち12.72億円で中野以外の全株主から自己株式を取得、7.90億円でビジョン社借入を完済します。クロージングは2027年5月31日を想定しています。',
  {x:1.05,y:2.54,w:11.2,h:0.6,fontSize:12.5,color:C.INK2,lineSpacingMultiple:1.2});
[['何を','ビジョン社ほか既存株主7社の全株式','20億円評価・現金対価',C.INK],
 ['いくら','増資 19.57億円','中野ファンド6.10億＋パートナー13.47億',C.ACC],
 ['誰が','中野陣営 50.0% ／ パートナー 50.0%','取引後の株主は2者のみ',C.INK],
 ['いつ','2027年5月31日','減資→増資→自己株式取得→返済',C.INK]].forEach((r,i)=>{
  const x=0.7+i*3.02;
  card(s,x,3.52,2.85,1.78);
  T(s,r[0],{x:x+0.25,y:3.72,w:2.35,h:0.28,fontSize:11,color:C.MUT});
  T(s,r[1],{x:x+0.25,y:4.04,w:2.35,h:0.62,fontSize:15,bold:true,color:r[3]});
  T(s,r[2],{x:x+0.25,y:4.74,w:2.35,h:0.48,fontSize:10,color:C.INK2});
});
card(s,0.7,5.45,11.9,1.4,C.TINT_P,C.TINT_PL);
T(s,'みずほ銀行様へのお願い',{x:1.05,y:5.62,w:4,h:0.3,fontSize:13.5,bold:true,color:C.POS});
[['① エクイティ13.47億円の引受先のご紹介','みずほキャピタル様・グループファンドを含めて'],
 ['② 経営者保証の解除','取引後の財務内容を前提にガイドラインに沿って'],
 ['③ 借換え 6.07億円','既存3.07億の継続＋ビジョン借入のリファイ3.00億']].forEach((r,i)=>{
  const x=1.05+i*3.82;
  T(s,r[0],{x,y:5.97,w:3.6,h:0.28,fontSize:11.5,bold:true,color:C.INK});
  T(s,r[1],{x,y:6.28,w:3.6,h:0.42,fontSize:9.5,color:C.INK2});
});
s.addNotes('結論から。今日お願いしたいのは①のエクイティ紹介が本丸。②③はセットでお願いする。');

/* 3 現状 */
s=slide(); light(s);
head(s,'現状','第10期の実績と、バランスシートの課題');
stat(s,0.7,1.68,2.6,'売上高','21.80','億円','前期比 +18.8%',C.POS);
stat(s,3.5,1.68,2.6,'営業利益','1.58','億円','前期1.77億から減益',C.INK);
stat(s,6.3,1.68,2.6,'純資産','△4.09','億円','債務超過',C.NEG);
stat(s,9.1,1.68,2.6,'有利子負債','11.57','億円','うちビジョン 7.90億',C.NEG);
card(s,0.7,3.12,5.75,3.2,C.TINT_A,C.TINT_AL);
T(s,'融資判断の壁になっている3点',{x:1.0,y:3.32,w:5.2,h:0.32,fontSize:14,bold:true,color:C.ACC});
[['純資産が△4.09億の債務超過','この状態では新規融資の稟議が通りません'],
 ['ビジョン社への借入が7.90億','有利子負債の68%を親会社が占めています'],
 ['現預金が0.40億','月商1.8億に対し手元流動性が極端に薄い']].forEach((r,i)=>{
  const y=3.82+i*0.8;
  dot(s,1.0,y+0.07,C.ACC,0.2);
  T(s,r[0],{x:1.35,y:y-0.02,w:4.95,h:0.3,fontSize:12.5,bold:true,color:C.INK});
  T(s,r[1],{x:1.35,y:y+0.29,w:4.95,h:0.3,fontSize:10.5,color:C.INK2});
});
card(s,6.85,3.12,5.75,3.2,C.TINT_P,C.TINT_PL);
T(s,'ただし、収益力は別の姿があります',{x:7.15,y:3.32,w:5.2,h:0.32,fontSize:14,bold:true,color:C.POS});
[['第10期 報告営業利益','1.58億',C.INK],['出向費 年0.72億の喪失','△0.72億',C.NEG],
 ['撤退店舗の損失解消・大型2施設の通年寄与','+1.14億',C.POS],['正常化営業利益','2.00億',C.ACC]]
.forEach((r,i)=>{
  const y=3.82+i*0.62;
  T(s,r[0],{x:7.15,y:y,w:3.9,h:0.3,fontSize:11,color:C.INK2});
  T(s,r[1],{x:11.15,y:y-0.03,w:1.2,h:0.34,fontSize:14,bold:true,color:r[2],align:'right'});
});
T(s,'正常化EBITDA 2.65億（営業利益2.00＋減価償却0.65）',{x:7.15,y:6.02,w:5.2,h:0.3,fontSize:11,bold:true,color:C.POS});
s.addNotes('債務超過は隠さず先に出す。そのうえで正常化営業利益2.00億で反転させる。1.14億の裏付けは店舗別PLで別途提出。');

/* 4 なぜMBOか */
s=slide(); dark(s);
head(s,'ご提案の理由','なぜ、いまMBOなのか',true);
[['01','出向費の負担が年0.72億','ビジョン社からの出向者にかかる費用は月600万円超。MBO成立と同時にゼロになり、そのまま営業利益に乗ります。','+0.72億/年'],
 ['02','親会社借入が調達の足かせ','有利子負債の68%が親会社向けです。この構造のままでは新規の設備投資資金も調達できません。','負債の68%'],
 ['03','既存株主7社に出口がない','非上場のまま10年が経過しました。20億円評価・現金対価で全株主に出口を提供できます。','7社が退出'],
 ['04','意思決定の速度','取引後の株主は中野陣営とパートナーの2者のみ。出店判断・撤退判断を現場の速度で決められます。','株主2者']]
.forEach((r,i)=>{
  const x=0.7+(i%2)*6.05, y=1.85+Math.floor(i/2)*2.35;
  dcard(s,x,y,5.85,2.1);
  T(s,r[0],{x:x+0.3,y:y+0.24,w:0.9,h:0.35,fontSize:15,bold:true,color:C.ACC2});
  T(s,r[1],{x:x+1.15,y:y+0.22,w:3.2,h:0.4,fontSize:14.5,bold:true,color:C.WHITE});
  T(s,r[3],{x:x+4.3,y:y+0.24,w:1.25,h:0.35,fontSize:13,bold:true,color:C.ACC2,align:'right'});
  T(s,r[2],{x:x+0.3,y:y+0.70,w:5.25,h:1.2,fontSize:10.5,color:C.DKTXT,lineSpacingMultiple:1.2});
});
T(s,'要するに、MBOは「支配権の移転」であると同時に「収益構造の正常化」です。営業利益は1.58億から2.00億へ回復します。',
  {x:0.7,y:6.7,w:11.9,h:0.32,fontSize:12.5,bold:true,color:C.ACC2});
s.addNotes('銀行には②③が効く。ただし本質は①の出向費と④の速度。');

/* 5 スキーム */
s=slide(); dark(s);
head(s,'スキーム','資金の流れ',true);
[{x:0.7,t:'① 第三者割当増資',a:'19.57億円',b:'中野ファンド 6.10億\nパートナー 13.47億',hi:1},
 {x:4.05,t:'② 自己株式取得',a:'12.72億円',b:'中野以外の全株主\n127,616株を会社が買取'},
 {x:7.40,t:'③ ビジョン借入の返済',a:'7.90億円',b:'増資4.90億＋みずほ3.00億\n資本・債権関係を完全解消'},
 {x:10.75,t:'④ 手元資金',a:'1.50億円',b:'運転資金として留保\n現預金は2.19億へ'}]
.forEach(o=>{
  dcard(s,o.x,1.85,2.0,2.45,o.hi?C.ACC:null);
  T(s,o.t,{x:o.x+0.18,y:2.03,w:1.66,h:0.5,fontSize:11.5,bold:true,color:o.hi?C.ACC2:'C3CDD6'});
  T(s,o.a,{x:o.x+0.18,y:2.58,w:1.66,h:0.42,fontSize:18,bold:true,color:C.WHITE});
  T(s,o.b,{x:o.x+0.18,y:3.06,w:1.66,h:1.1,fontSize:9.5,color:'93A2AF'});
});
[2.75,6.10,9.45].forEach(x=>T(s,'▶',{x,y:2.92,w:0.5,h:0.4,fontSize:13,color:C.ACC,align:'center'}));
dcard(s,0.7,4.6,11.9,1.85);
T(s,'取引後の株主は2者のみ',{x:1.0,y:4.8,w:6,h:0.35,fontSize:15,bold:true,color:C.WHITE});
[['中野陣営','50.000%','中野邦人 74,000株（SO行使後）＋ 中野ファンド 61,180株',C.ACC2],
 ['パートナー','50.000%','135,180株（ヒューリック／東京建物等を想定）','8FB0CC']]
.forEach((r,i)=>{
  const x=1.0+i*5.85;
  T(s,r[0],{x,y:5.3,w:5.5,h:0.3,fontSize:12,color:'93A2AF'});
  T(s,r[1],{x,y:5.56,w:5.5,h:0.44,fontSize:24,bold:true,color:r[3]});
  T(s,r[2],{x,y:5.99,w:5.5,h:0.3,fontSize:9.5,color:'93A2AF'});
});
T(s,'既存株主7社（ビジョン・BOS・エアトリ・KUMA・フィル・ベクトル・アンビション）は全株を売却し、株主名簿から外れます',
  {x:0.7,y:6.65,w:11.9,h:0.3,fontSize:10.5,color:'7F8E9B'});
s.addNotes('ビジョン社の受取は株式9.41億＋借入返済7.90億＝17.31億。全額現金、借入は額面満額。');

/* 6 発行済株式と議決権 */
s=slide(); light(s);
head(s,'スキーム','取引後の株主構成と1株あたりの条件');
tbl(s,[
 [{text:'区分',options:TH},{text:'株数',options:THR},{text:'議決権比率',options:THR},
  {text:'払込額',options:THR},{text:'備考',options:TH}],
 [{text:'中野 邦人',options:{bold:true}},{text:'74,000 株',options:{align:'right'}},
  {text:'27.371%',options:{align:'right',bold:true}},{text:'―',options:{align:'right'}},'既存65,000株＋SO行使9,000株'],
 [{text:'中野ファンド',options:{bold:true}},{text:'61,180 株',options:{align:'right'}},
  {text:'22.629%',options:{align:'right',bold:true}},{text:'6.10 億円',options:{align:'right',bold:true}},'新規設立・中野がGP'],
 [{text:'　中野陣営 計',options:{bold:true,fill:'F3E7EA'}},{text:'135,180 株',options:{align:'right',bold:true,fill:'F3E7EA'}},
  {text:'50.000%',options:{align:'right',bold:true,color:C.ACC,fill:'F3E7EA'}},
  {text:'6.10 億円',options:{align:'right',bold:true,fill:'F3E7EA'}},{text:'',options:{fill:'F3E7EA'}}],
 [{text:'パートナー',options:{bold:true}},{text:'135,180 株',options:{align:'right'}},
  {text:'50.000%',options:{align:'right',bold:true,color:C.BLUE}},{text:'13.47 億円',options:{align:'right',bold:true}},'ヒューリック／東京建物等を想定'],
 [{text:'議決権株式 合計',options:{bold:true,fill:'E8EDF2'}},{text:'270,360 株',options:{align:'right',bold:true,fill:'E8EDF2'}},
  {text:'100.000%',options:{align:'right',bold:true,fill:'E8EDF2'}},{text:'19.57 億円',options:{align:'right',bold:true,fill:'E8EDF2'}},
  {text:'',options:{fill:'E8EDF2'}}],
 ['自己株式（議決権なし）',{text:'127,616 株',options:{align:'right',color:C.MUT}},{text:'―',options:{align:'right',color:C.MUT}},
  {text:'―',options:{align:'right',color:C.MUT}},{text:'会社が取得・保有',options:{color:C.MUT}}],
 [{text:'発行済株式 総数',options:{bold:true}},{text:'397,976 株',options:{align:'right',bold:true}},
  {text:'―',options:{align:'right'}},{text:'―',options:{align:'right'}},'']],
 {x:0.7,y:1.72,w:11.9,colW:[2.8,2.0,1.9,1.9,3.3],rowH:0.42,fontSize:11.5});
[['1株あたり取得価額','9,964','円','Pre 20億 ÷ SO行使後201,616株',C.INK],
 ['既存株主の受取総額','12.72','億円','7社・127,616株を現金で',C.ACC],
 ['ビジョン社への支払総額','17.31','億円','株式9.41億＋借入返済7.90億',C.ACC],
 ['分配可能額（取得後）','17.06','億円','無償減資による欠損填補後',C.POS]]
.forEach((r,i)=>stat(s,0.7+i*3.02,5.35,2.85,r[0],r[1],r[2],r[3],r[4]));
T(s,'自己株式の取得には分配可能額が必要なため、増資に先立ち資本金・資本準備金を取り崩して繰越欠損金△10.62億を填補します（会社法447条・448条・452条）。',
  {x:0.7,y:6.68,w:11.9,h:0.3,fontSize:9.5,color:C.MUT});
s.addNotes('銀行は1株単価と分配可能額を必ず聞く。先に出しておく。');

/* 7 想定BS */
s=slide(); light(s);
head(s,'財務','想定バランスシート');
tbl(s,[
 [{text:'科目',options:TH},{text:'第10期末 実績',options:THR},
  {text:'クロージング直前',options:THR},{text:'取引後（想定）',options:THR}],
 [{text:'現金及び預金',options:{bold:true}},{text:'40,414',options:{align:'right'}},{text:'60,000',options:{align:'right'}},{text:'219,000',options:{align:'right',bold:true}}],
 ['その他流動資産',{text:'395,416',options:{align:'right'}},{text:'463,779',options:{align:'right'}},{text:'463,779',options:{align:'right'}}],
 ['固定資産',{text:'880,198',options:{align:'right'}},{text:'880,198',options:{align:'right'}},{text:'880,198',options:{align:'right'}}],
 [{text:'資産合計',options:{bold:true,fill:'E8EDF2'}},{text:'1,316,028',options:{align:'right',bold:true,fill:'E8EDF2'}},{text:'1,403,977',options:{align:'right',bold:true,fill:'E8EDF2'}},{text:'1,562,977',options:{align:'right',bold:true,fill:'E8EDF2'}}],
 [{text:'有利子負債',options:{bold:true}},{text:'1,159,051',options:{align:'right'}},{text:'1,097,000',options:{align:'right'}},{text:'607,000',options:{align:'right',bold:true}}],
 ['その他負債',{text:'566,409',options:{align:'right'}},{text:'566,409',options:{align:'right'}},{text:'566,409',options:{align:'right'}}],
 [{text:'負債合計',options:{bold:true,fill:'E8EDF2'}},{text:'1,725,460',options:{align:'right',bold:true,fill:'E8EDF2'}},{text:'1,663,409',options:{align:'right',bold:true,fill:'E8EDF2'}},{text:'1,173,409',options:{align:'right',bold:true,fill:'E8EDF2'}}],
 ['資本剰余金等',{text:'△409,432',options:{align:'right',color:C.NEG}},{text:'△259,432',options:{align:'right',color:C.NEG}},{text:'389,568',options:{align:'right'}}],
 [{text:'純資産合計',options:{bold:true,fill:'F3E7EA'}},{text:'△409,432',options:{align:'right',bold:true,color:C.NEG,fill:'F3E7EA'}},{text:'△259,432',options:{align:'right',bold:true,color:C.NEG,fill:'F3E7EA'}},{text:'389,568',options:{align:'right',bold:true,color:C.POS,fill:'F3E7EA'}}],
 [{text:'自己資本比率',options:{bold:true}},{text:'△31.1%',options:{align:'right',bold:true,color:C.NEG}},{text:'△18.5%',options:{align:'right',bold:true,color:C.NEG}},{text:'24.9%',options:{align:'right',bold:true,color:C.POS}}]],
 {x:0.7,y:1.72,w:11.9,colW:[3.8,2.7,2.7,2.7],rowH:0.36,fontSize:11.5});
T(s,'単位：千円　／　クロージング直前は第10期末から1年間で純資産+1.50億の改善を見込んだ想定値　／　繰越欠損金は無償減資により資本剰余金で填補します',
  {x:0.7,y:6.55,w:11.9,h:0.3,fontSize:10,color:C.MUT});
s.addNotes('本日の主役。債務超過△4.09億が+3.90億に、自己資本比率24.9%になる。単位は千円。');

/* 8 信用力 */
s=slide(); light(s);
head(s,'財務','取引後の信用力');
[['自己資本比率','△18.5%','24.9%'],['有利子負債','10.97億','6.07億'],
 ['有利子負債 / EBITDA','4.1倍','2.3倍'],['DSCR','―','1.58倍']].forEach((r,i)=>{
  const x=0.7+i*3.02;
  card(s,x,1.7,2.85,2.1);
  T(s,r[0],{x:x+0.22,y:1.9,w:2.4,h:0.5,fontSize:11.5,bold:true,color:C.MUT});
  T(s,r[1],{x:x+0.22,y:2.4,w:2.4,h:0.32,fontSize:13,color:C.NEG});
  T(s,'▼',{x:x+0.22,y:2.72,w:2.4,h:0.22,fontSize:9,color:C.MUT});
  T(s,r[2],{x:x+0.22,y:2.94,w:2.4,h:0.6,fontSize:26,bold:true,color:C.POS});
});
s.addChart(p.ChartType.bar,[
 {name:'取引前',labels:['純資産','有利子負債'],values:[-2.59,10.97]},
 {name:'取引後',labels:['純資産','有利子負債'],values:[3.90,6.07]}],
 {x:0.7,y:4.0,w:6.2,h:2.5,barDir:'col',chartColors:[C.MUT,C.ACC],showTitle:true,
  title:'純資産と有利子負債の変化（億円）',titleFontSize:13,titleColor:C.INK,titleFontFace:F,
  showValue:true,dataLabelPosition:'outEnd',dataLabelFormatCode:'0.00',dataLabelFontFace:F,
  dataLabelFontSize:9,dataLabelColor:C.INK,showLegend:true,legendPos:'b',legendFontFace:F,legendFontSize:9,
  catAxisLabelFontFace:F,catAxisLabelFontSize:10,catAxisLabelColor:C.INK2,valAxisLabelFontFace:F,
  valAxisLabelFontSize:9,valAxisLabelColor:C.MUT,valGridLine:{color:C.LINE,size:0.5},catGridLine:{style:'none'}});
card(s,7.2,4.0,5.4,2.5,C.TINT_P,C.TINT_PL);
T(s,'ご依頼は買収ファイナンスではなく借換えです',{x:7.5,y:4.2,w:4.85,h:0.32,fontSize:13.5,bold:true,color:C.POS});
T(s,'取引後のあどばるは、自己資本比率24.9%・有利子負債2.3倍・DSCR1.58倍の会社になります。株式取得資金はすべてエクイティで賄うため、LBOローンは発生しません。\n\n・既存借入 3.07億円の継続\n・ビジョン借入のリファイ 3.00億円\n・返済原資は正常化EBITDA 2.65億円',
  {x:7.5,y:4.57,w:4.85,h:1.8,fontSize:11,color:C.INK2,lineSpacingMultiple:1.15});
s.addNotes('LBOではなく借換えである、という一点を必ず伝える。審査の重さがまったく違う。');

/* 9 お願い */
s=slide(); dark(s);
head(s,'ご相談','みずほ銀行様にお願いしたい3点',true);
[['01','グループのエクイティ機能のご紹介','パートナー13.47億円の引受先として、ヒューリック・東京建物に加え、みずほキャピタル様やみずほグループのファンドをご紹介いただけないでしょうか。本件で最もお願いしたい点です。','13.47億円'],
 ['02','経営者保証の解除','自己資本比率24.9%・DSCR1.58倍となる取引後の財務内容を前提に、経営者保証ガイドラインに沿った解除をご検討いただきたく存じます。','ガイドライン適用'],
 ['03','既存借入の継続とビジョン借入のリファイ','既存3.07億円の継続に加え、ビジョン社借入のうち3.00億円のリファイナンスをお願いしたく存じます。LBOローンではなく、通常の事業性融資としてのご検討です。','合計 6.07億円']]
.forEach((r,i)=>{
  const y=1.85+i*1.58;
  dcard(s,0.7,y,11.9,1.4);
  num(s,1.0,y+0.36,0.68,r[0],C.ACC);
  T(s,r[1],{x:1.95,y:y+0.24,w:7.4,h:0.38,fontSize:16,bold:true,color:C.WHITE});
  T(s,r[2],{x:1.95,y:y+0.66,w:7.4,h:0.65,fontSize:10.5,color:C.DKTXT,lineSpacingMultiple:1.15});
  T(s,r[3],{x:9.6,y:y+0.5,w:2.7,h:0.42,fontSize:15,bold:true,color:C.ACC2,align:'right'});
});
T(s,'ご返済原資は正常化EBITDA 2.65億円です。年間元利返済1.68億円に対しDSCR 1.58倍を確保しています。',
  {x:0.7,y:6.7,w:11.9,h:0.32,fontSize:12.5,bold:true,color:C.ACC2});
s.addNotes('①が本丸。②③は同時に出しておく。返済原資の話を必ず添える。');

/* 10 手順 */
s=slide(); light(s);
head(s,'次のステップ','クロージングまでの手順と、先に固める論点');
T(s,'会社法上の手続き（クロージング 2027年5月31日を想定）',{x:0.7,y:1.68,w:11.9,h:0.32,fontSize:14,bold:true,color:C.INK});
[['STEP 1','無償減資・欠損填補','資本金・資本準備金を取り崩し、繰越欠損金△10.62億を填補。分配可能額をつくります。',C.ACC],
 ['STEP 2','第三者割当増資 19.57億円','中野ファンド6.10億・パートナー13.47億。払込により債務超過が解消します。',C.ACC],
 ['STEP 3','自己株式取得 12.72億円','中野以外の全株主から127,616株を取得。売主追加請求権・特別利害関係人の処理が必要です。',C.ACC],
 ['STEP 4','ビジョン借入の返済','7.90億円。増資4.90億＋みずほ様3.00億で、ビジョン社との債権債務を完全に解消します。',C.POS]]
.forEach((r,i)=>{
  const x=0.7+i*3.02;
  card(s,x,2.1,2.85,2.0);
  badge(s,x+0.22,2.3,1.15,r[0],r[3]);
  T(s,r[1],{x:x+0.22,y:2.78,w:2.45,h:0.6,fontSize:12.5,bold:true,color:C.INK});
  T(s,r[2],{x:x+0.22,y:3.4,w:2.45,h:0.62,fontSize:9.5,color:C.INK2,lineSpacingMultiple:1.1});
});
[[0.7,'当社で固める論点',C.ACC,C.TINT_A,C.TINT_AL,[
   '正常化営業利益2.00億円の店舗別PLによる裏付け',
   'パートナーとのデッドロック解消条項（50:50のため必須）',
   '中野ファンドのGP議決権集約と金商法63条の届出',
   'ストックオプション9,000株の行使方法と税制適格性']],
 [6.75,'ビジョン社との交渉事項',C.BLUE,C.TINT_B,C.TINT_BL,[
   '譲渡価格20億円評価の合意（第三者評価書の要否）',
   '借入7.90億円の額面満額・一括返済の確認',
   '出向者の引揚げ時期と引継ぎ（出向費は成立時にゼロ）',
   '取引先・許認可のチェンジオブコントロール条項']]
].forEach(g=>{
  card(s,g[0],4.32,5.85,2.2,g[3],g[4]);
  T(s,g[1],{x:g[0]+0.3,y:4.5,w:5.25,h:0.32,fontSize:13.5,bold:true,color:g[2]});
  g[5].forEach((t,i)=>{
    const y=4.92+i*0.37;
    dot(s,g[0]+0.32,y+0.09,g[2],0.14);
    T(s,t,{x:g[0]+0.62,y:y,w:4.95,h:0.32,fontSize:10.5,color:C.INK2});
  });
});
T(s,'本資料は検討段階の想定値です。数値は第10期計算書類にもとづく試算であり、実行にあたっては弁護士・会計士・税理士の確認を要します。',
  {x:0.7,y:6.72,w:11.9,h:0.3,fontSize:9,color:C.MUT});
s.addNotes('最後は宿題の確認。特に正常化営業利益の裏付けが融資審査の生命線。');

p.writeFile({fileName:'あどばるMBO_ご提案_20260923.pptx'}).then(()=>console.log('deckA written'));
