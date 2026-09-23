const D=require('./design.js')();
const {p,C,F,T,dark,light,head,card,dcard,stat,badge,num,dot,TH,THR,THC,tbl,cover,slide}=D;
let s;

/* 1 表紙 */
s=slide();
cover(s,'株式会社あどばる','スペースマーケット社からの合併提案',
 '提案内容の整理と、当社としての対応方針のご相談',
 '2026年9月23日',
 [['ご説明先','株式会社あどばる 中村 新社長'],
  ['作成','株式会社あどばる 代表取締役 中野 邦人'],
  ['基準','会社四季報2026年9月号・株価2026年9月21日終値229円']],
 '本資料は公開情報にもとづく試算であり、法務・税務・会計上の助言ではありません');
s.addNotes('MBOとは別件として扱う。こちらは「受けるか否か」の検討資料。');

/* 2 結論 */
s=slide(); light(s);
head(s,'結論','現時点ではお受けせず、MBOを先に進めることをご提案します');
card(s,0.7,1.62,11.9,1.5,C.TINT_A,C.TINT_AL);
T(s,'合併そのものを否定するものではありません。ただし「いま受ける」のと「MBO完了後に受ける」のとでは、条件がまったく違います。',
  {x:1.05,y:1.82,w:11.2,h:0.64,fontSize:18,bold:true,color:C.ACC});
T(s,'いま受けると、当社が抱えている問題（ビジョン社との関係）は解消されないまま上場会社に持ち込まれ、中野の持分も13.25%まで希薄化します。',
  {x:1.05,y:2.52,w:11.2,h:0.45,fontSize:12,color:C.INK2});
[['01','解決したい問題が解決しない','合併してもビジョン社は19.26%を保有する筆頭株主として残ります。親会社との関係を清算したいという当初の目的が達成されません。',C.ACC],
 ['02','中野の持分が13.25%になる','SO行使後でも14.41%。重松氏側（重松氏＋ダブルパインズ）の23.18%に対し、経営の主導権を持てない構図になります。',C.ACC],
 ['03','のれん22.09億円が利益を消す','日本基準では定額償却が必要です。20年で年1.10億、10年なら年2.21億。合算営業利益（約2.6億）の大半が消えます。',C.ACC]]
.forEach((r,i)=>{
  const y=3.3+i*1.12;
  card(s,0.7,y,11.9,1.0);
  num(s,1.05,y+0.24,0.52,r[0],r[3]);
  T(s,r[1],{x:1.85,y:y+0.17,w:4.2,h:0.32,fontSize:14.5,bold:true,color:C.INK});
  T(s,r[2],{x:1.85,y:y+0.53,w:10.2,h:0.4,fontSize:10.5,color:C.INK2});
});
T(s,'一方、MBOを先に済ませれば、ビジョン社は名簿から消え、中野陣営の持分は24.55%まで上がります（7ページ）。',
  {x:0.7,y:6.72,w:11.9,h:0.32,fontSize:12.5,bold:true,color:C.POS});
s.addNotes('結論を一枚で。否定ではなく「順序」の話だと強調する。');

/* 3 提案内容と株主構成 */
s=slide(); light(s);
head(s,'提案の内容','いま合併した場合の株主構成');
stat(s,0.7,1.66,2.9,'合併比率','1 : 40.63','','あどばる1株にSM株40.63株',C.BLUE);
stat(s,3.8,1.66,2.9,'交付新株','782.6','万株','あどばるEquity 18億／SM 230円',C.INK);
stat(s,6.9,1.66,2.9,'合併後 発行済','1,993','万株','現状1,210万株＋交付分',C.INK);
stat(s,10.0,1.66,2.6,'合併後 時価総額','45.8','億円','SM単独 27.7億から拡大',C.INK);
p.addSlide; // noop
s.addChart(p.ChartType.bar,[{name:'持株比率',
  labels:['ダブルパインズ','TKP','中野 邦人','その他SM株主','重松 大輔','ビジョン'],
  values:[8.38,12.79,13.25,14.03,14.80,19.26]}],
 {x:0.7,y:3.15,w:7.0,h:3.35,barDir:'bar',chartColors:[C.BLUE],showTitle:true,
  title:'合併後の持株比率（％・中野はSO行使前）',titleFontSize:13,titleColor:C.INK,titleFontFace:F,
  showValue:true,dataLabelPosition:'outEnd',dataLabelFormatCode:'0.00"%"',dataLabelFontFace:F,
  dataLabelFontSize:9.5,dataLabelColor:C.INK,showLegend:false,barGapWidthPct:45,
  catAxisLabelFontFace:F,catAxisLabelFontSize:10.5,catAxisLabelColor:C.INK2,
  valAxisLabelFontFace:F,valAxisLabelFontSize:9,valAxisLabelColor:C.MUT,valAxisMaxVal:25,
  valGridLine:{color:C.LINE,size:0.5},catGridLine:{style:'none'}});
card(s,8.0,3.15,4.6,3.35,C.TINT_B,C.TINT_BL);
T(s,'この名簿が意味すること',{x:8.3,y:3.35,w:4.0,h:0.32,fontSize:14,bold:true,color:C.BLUE});
[['筆頭株主はビジョン社のまま','19.26%。MBOを先行させない限り、親会社との関係は上場会社に持ち込まれます。'],
 ['中野の持分は13.25%','SO行使後で14.41%。単独では経営の意思決定権を持てません。'],
 ['重松氏側は合計23.18%','重松氏14.80%＋ダブルパインズ8.38%。実質的な筆頭は先方です。']]
.forEach((r,i)=>{
  const y=3.78+i*0.92;
  T(s,'0'+(i+1),{x:8.3,y:y,w:0.5,h:0.28,fontSize:11,bold:true,color:C.ACC2});
  T(s,r[0],{x:8.85,y:y,w:3.45,h:0.28,fontSize:12,bold:true,color:C.INK});
  T(s,r[1],{x:8.85,y:y+0.3,w:3.45,h:0.6,fontSize:9.5,color:C.INK2});
});
T(s,'出所：会社四季報2026年9月号（単元株主2,428名・発行済12,105,900株）、株価229円（2026年9月21日終値）。あどばるの評価額はスペースマーケット社からのLOI 18億円を使用。',
  {x:0.7,y:6.68,w:11.9,h:0.3,fontSize:9,color:C.MUT});
s.addNotes('中野の持分が13%台になる、という一点が最大の論点。');

/* 4 論点 */
s=slide(); dark(s);
head(s,'論点','条件面で確認すべき4点',true);
[['01','第2位株主が競合TKP社','TKPは21.06%を保有する第2位株主です。合併後も12.79%で残ります。貸会議室・レンタルスペース領域で競合する会社が、当社の株主総会で議決権を持つ形になります。'],
 ['02','ビジョン社が合併後の筆頭株主','19.26%。MBOを先行させずに合併すると、ビジョンとの関係は解消されないまま上場会社の筆頭株主として残ります。'],
 ['03','のれん22.09億円の償却','日本基準では定額償却が必要です。20年償却でも年1.10億、10年なら年2.21億。合算営業利益（約2.6億）の大半が消えます。'],
 ['04','流通株式比率25%基準','合併後の流通株式比率は21.62〜30.59%と試算され、東証グロースの上場維持基準に抵触する可能性があります（改善期間1年）。']]
.forEach((r,i)=>{
  const x=0.7+(i%2)*6.05, y=1.85+Math.floor(i/2)*2.35;
  dcard(s,x,y,5.85,2.1);
  T(s,r[0],{x:x+0.3,y:y+0.24,w:0.9,h:0.35,fontSize:15,bold:true,color:C.ACC2});
  T(s,r[1],{x:x+1.15,y:y+0.22,w:4.5,h:0.4,fontSize:14.5,bold:true,color:C.WHITE});
  T(s,r[2],{x:x+0.3,y:y+0.70,w:5.25,h:1.2,fontSize:10.5,color:C.DKTXT,lineSpacingMultiple:1.2});
});
T(s,'③のれんは合併比率そのものに跳ね返る論点です。利益が消えるなら、その分を比率で調整すべきという交渉材料になります。',
  {x:0.7,y:6.7,w:11.9,h:0.32,fontSize:12.5,bold:true,color:C.ACC2});
s.addNotes('のれん22.09億は最重要。利益が消えるなら比率を見直す、という交渉に使える。');

/* 5 評価額 */
s=slide(); light(s);
head(s,'論点','評価額と、支払通貨としての株価');
card(s,0.7,1.7,5.85,2.72);
T(s,'あどばるの評価額',{x:1.0,y:1.92,w:5.2,h:0.3,fontSize:13.5,bold:true,color:C.INK});
[['スペースマーケット社LOI','18.0億円',C.NEG],['MBOの前提評価（Pre）','20.0億円',C.INK],
 ['MBO取引後の株主価値','26.85億円',C.POS]].forEach((r,i)=>{
  const y=2.38+i*0.55;
  T(s,r[0],{x:1.0,y:y+0.04,w:3.6,h:0.3,fontSize:11.5,color:C.INK2});
  T(s,r[1],{x:4.6,y:y,w:1.6,h:0.36,fontSize:16,bold:true,color:r[2],align:'right'});
});
T(s,'LOIの18億円は、MBOの前提である20億円を下回ります。まず評価額そのものが交渉の対象です。',
  {x:1.0,y:3.96,w:5.25,h:0.45,fontSize:10.5,color:C.INK2});
card(s,6.75,1.7,5.85,2.72);
T(s,'受け取る通貨（SM株価）の状況',{x:7.05,y:1.92,w:5.2,h:0.3,fontSize:13.5,bold:true,color:C.INK});
[['年初来高値（1月20日）','328円',C.MUT],['6ヶ月平均（推定）','約240円',C.INK2],
 ['3ヶ月平均（推定）','約229円',C.ACC]].forEach((r,i)=>{
  const y=2.38+i*0.55;
  T(s,r[0],{x:7.05,y:y+0.04,w:3.6,h:0.3,fontSize:11.5,color:C.INK2});
  T(s,r[1],{x:10.65,y:y,w:1.6,h:0.36,fontSize:16,bold:true,color:r[2],align:'right'});
});
T(s,'対価は現金ではなく、この株式です。年初来で3割下落しており、今の水準で固定してよいかという論点があります。',
  {x:7.05,y:3.96,w:5.25,h:0.45,fontSize:10.5,color:C.INK2});
card(s,0.7,4.58,11.9,1.95,C.TINT_W,C.TINT_WL);
T(s,'交渉上、押さえておきたい点',{x:1.0,y:4.76,w:6,h:0.32,fontSize:13.5,bold:true,color:C.WARN});
[['基準株価は3ヶ月平均を','3ヶ月平均229円は6ヶ月平均240円より低く、同じ評価額でも交付される株数が増えます。当社に有利な側です。書面で先に合意すべきです。'],
 ['評価額は20億円を下限に','MBOで既存株主に20億円評価で退出いただく前提と整合しません。18億円では社内説明が立ちません。'],
 ['のれん償却の負担を比率に反映','年1.10〜2.21億の償却負担は合併後の全株主が負います。負担の配分を比率で調整する余地があります。']]
.forEach((r,i)=>{
  const x=1.0+i*3.92;
  dot(s,x,5.22,C.WARN,0.16);
  T(s,r[0],{x:x+0.3,y:5.13,w:3.4,h:0.3,fontSize:11.5,bold:true,color:C.INK});
  T(s,r[1],{x:x+0.3,y:5.47,w:3.4,h:1.0,fontSize:9.5,color:C.INK2,lineSpacingMultiple:1.15});
});
T(s,'3ヶ月・6ヶ月平均株価は公開情報からの推定値です（3ヶ月レンジ225〜235円、6ヶ月レンジ235〜250円）。確定値は証券会社経由でご確認ください。',
  {x:0.7,y:6.68,w:11.9,h:0.3,fontSize:9,color:C.MUT});
s.addNotes('18億は安い。かつ支払通貨が下落中の株。この2点は必ず先方に返す。');

/* 6 対等化コスト */
s=slide(); light(s);
head(s,'論点','重松氏と対等になるために必要な取得コスト');
[['A','重松氏 個人分のみと並ぶ','14.80% vs 13.25%','0.09','億円','差分 1.55pt = 約4万株を相対取得','市場で買う場合は 0.18億円',C.POS],
 ['B','ダブルパインズを含めて並ぶ','23.18% vs 13.25%','2.01','億円','差分 9.93pt = 約88万株を相対取得','市場で買う場合は 4.02億円',C.ACC]]
.forEach((r,i)=>{
  const x=0.7+i*6.05;
  card(s,x,1.7,5.85,3.1,i?C.TINT_A:C.WHITE,i?C.TINT_AL:C.LINE);
  badge(s,x+0.35,1.95,1.6,'ケース '+r[0],r[7]);
  T(s,r[1],{x:x+0.35,y:2.45,w:5.15,h:0.35,fontSize:16,bold:true,color:C.INK});
  T(s,r[2],{x:x+0.35,y:2.82,w:5.15,h:0.3,fontSize:11,color:C.MUT});
  T(s,[{text:r[3],options:{fontSize:40,bold:true,color:r[7]}},
       {text:r[4],options:{fontSize:15,bold:true,color:r[7]}}],{x:x+0.35,y:3.2,w:5.15,h:0.75});
  T(s,r[5],{x:x+0.35,y:4.0,w:5.15,h:0.3,fontSize:10.5,color:C.INK2});
  T(s,r[6],{x:x+0.35,y:4.32,w:5.15,h:0.3,fontSize:10.5,color:C.MUT});
});
card(s,0.7,5.0,11.9,1.5,C.TINT_W,C.TINT_WL);
T(s,'ただし、実行方法には制約があります',{x:1.0,y:5.2,w:6,h:0.3,fontSize:13.5,bold:true,color:C.WARN});
[['特定株比率 80.5%','市場に流通する株が少なく、まとまった株数を市場で買うと株価が跳ねます。相対取得が前提です。'],
 ['5%ルール','5%を超えて取得した時点で大量保有報告書の提出義務が生じ、意図が公開されます。'],
 ['そもそも売っていただけるか','重松氏側は創業者です。持分を譲る動機があるかを、合併協議の前に確かめる必要があります。']]
.forEach((r,i)=>{
  const x=1.0+i*3.92;
  T(s,r[0],{x,y:5.58,w:3.7,h:0.28,fontSize:11.5,bold:true,color:C.INK});
  T(s,r[1],{x,y:5.88,w:3.7,h:0.55,fontSize:9.5,color:C.INK2});
});
T(s,'合併後の発行済株式19,931,987株・株価229円を前提とした試算です。',
  {x:0.7,y:6.68,w:11.9,h:0.3,fontSize:9,color:C.MUT});
s.addNotes('ケースBの2.01億が現実的な数字。四季報で重松氏とダブルパインズが別記載と確認済み。');

/* 7 MBO後ならどう変わるか */
s=slide(); light(s);
head(s,'提案','MBO完了後に合併すれば、条件は変わります');
tbl(s,[
 [{text:'',options:TH},{text:'いま合併する場合',options:THC},
  {text:'MBO完了後に合併する場合',options:Object.assign({align:'center'},TH,{fill:C.ACC})}],
 [{text:'あどばるの評価額',options:{bold:true}},{text:'18.0億円（LOI）',options:{align:'center'}},{text:'26.85億円（取引後株主価値）',options:{align:'center',bold:true}}],
 [{text:'中野 個人',options:{bold:true}},{text:'13.25%',options:{align:'center'}},{text:'13.44%',options:{align:'center',bold:true}}],
 [{text:'中野ファンド',options:{bold:true}},{text:'―',options:{align:'center'}},{text:'11.11%',options:{align:'center',bold:true}}],
 [{text:'　中野陣営 計',options:{bold:true,fill:'F3E7EA'}},{text:'13.25%',options:{align:'center',bold:true,color:C.NEG,fill:'F3E7EA'}},{text:'24.55%',options:{align:'center',bold:true,color:C.ACC,fill:'F3E7EA'}}],
 [{text:'パートナー',options:{bold:true}},{text:'―',options:{align:'center'}},{text:'24.55%',options:{align:'center'}}],
 [{text:'　あどばる側 計',options:{bold:true,fill:'E8EDF2'}},{text:'32.51%（中野＋ビジョン）',options:{align:'center',fill:'E8EDF2'}},{text:'49.09%',options:{align:'center',bold:true,color:C.POS,fill:'E8EDF2'}}],
 [{text:'ビジョン社',options:{bold:true}},{text:'19.26%（筆頭株主）',options:{align:'center',color:C.NEG}},{text:'0%（名簿から消滅）',options:{align:'center',bold:true,color:C.POS}}],
 [{text:'重松氏側（重松＋DP）',options:{bold:true}},{text:'23.18%',options:{align:'center',color:C.NEG}},{text:'19.43%',options:{align:'center'}}],
 [{text:'TKP',options:{bold:true}},{text:'12.79%',options:{align:'center'}},{text:'10.72%',options:{align:'center'}}],
 [{text:'合併後 時価総額',options:{bold:true}},{text:'45.8億円',options:{align:'center'}},{text:'54.7億円',options:{align:'center',bold:true}}]],
 {x:0.7,y:1.66,w:11.9,colW:[3.7,4.1,4.1],rowH:0.375,fontSize:11});
T(s,'MBOを先に済ませると、中野陣営は24.55%で単独筆頭株主になり、パートナーと合わせたあどばる側は49.09%となります。ビジョン社は名簿から消えます。',
  {x:0.7,y:5.98,w:11.9,h:0.5,fontSize:12.5,bold:true,color:C.ACC});
T(s,'いずれもSM株価230円・あどばる自己株式127,616株は無対価消却を前提とした試算です。評価額26.85億円はMBOの増資19.57億・自己株式取得12.72億から算出した取引後株主価値であり、先方との合意価格ではありません。',
  {x:0.7,y:6.62,w:11.9,h:0.4,fontSize:9,color:C.MUT});
s.addNotes('この一枚が「順序」の根拠。13.25%が24.55%になる。ビジョンが消える。');

/* 8 対応方針 */
s=slide(); light(s);
head(s,'対応方針','先方にどうお返しするか');
[['01','提案への感謝と、継続協議の意思は明確に伝える','合併そのものに反対ではないこと、事業面のシナジーは理解していることを先に伝えます。関係を閉じないことが前提です。',C.POS],
 ['02','現在、資本構成の再編を進行中であると伝える','親会社との資本・債権関係の整理（MBO）を優先しており、その完了を待って条件協議を再開したい旨をお伝えします。時期は2027年5月末を目処とします。',C.ACC],
 ['03','条件面の論点は、いまのうちに投げておく','評価額18億円の根拠、基準株価を3ヶ月平均とすること、のれん償却の負担配分。この3点は早い段階で先方の考えを聞いておきます。',C.ACC]]
.forEach((r,i)=>{
  const y=1.72+i*1.35;
  card(s,0.7,y,11.9,1.2);
  num(s,1.05,y+0.3,0.6,r[0],r[3]);
  T(s,r[1],{x:1.9,y:y+0.22,w:10.3,h:0.32,fontSize:15,bold:true,color:C.INK});
  T(s,r[2],{x:1.9,y:y+0.6,w:10.3,h:0.5,fontSize:10.5,color:C.INK2,lineSpacingMultiple:1.15});
});
card(s,0.7,5.85,11.9,1.05,C.TINT_P,C.TINT_PL);
T(s,'再検討の条件',{x:1.05,y:6.02,w:2.5,h:0.3,fontSize:12.5,bold:true,color:C.POS});
T(s,'MBOが完了し、① ビジョン社が名簿から外れ ② 評価額が20億円以上で合意でき ③ のれん償却の負担配分に決着がついた段階で、あらためて前向きに協議します。',
  {x:1.05,y:6.35,w:11.2,h:0.4,fontSize:11.5,color:C.INK2});
s.addNotes('断るのではなく「順番を変えさせてください」という返し方。関係は維持する。');

p.writeFile({fileName:'スペースマーケット社合併提案_検討_20260923.pptx'}).then(()=>console.log('deckB written'));
