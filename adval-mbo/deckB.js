const D=require('./design.js')();
const {p,C,F,T,dark,light,head,card,dcard,stat,badge,num,dot,TH,THR,THC,tbl,cover,slide}=D;
let s;

/* 1 表紙 */
s=slide();
cover(s,'株式会社あどばる','スペースマーケット社からの合併提案',
 '重松氏の会長就任を前提としたストラクチャーの比較検討',
 '2026年9月23日',
 [['ご説明先','株式会社あどばる 中村 新社長'],
  ['作成','株式会社あどばる 代表取締役 中野 邦人'],
  ['基準','会社四季報2026年9月号・株価229円（2026年9月21日終値）']],
 '本資料は公開情報にもとづく試算であり、法務・税務・会計上の助言ではありません');
s.addNotes('重松氏がオーナーシップを手放し会長に退く（1〜2年内）という前提を織り込んだ版。');

/* 2 前提の更新 */
s=slide(); light(s);
head(s,'前提の確認','重松氏の意向を織り込むと、論点はこう変わります');
card(s,0.7,1.62,5.85,2.0,C.TINT_B,C.TINT_BL);
T(s,'新しく置いた前提',{x:1.0,y:1.82,w:5.2,h:0.3,fontSize:13.5,bold:true,color:C.BLUE});
T(s,'重松大輔氏は今回オーナーシップを手放し、会長に退く意向。時期は来年〜再来年でも構わない。',
  {x:1.0,y:2.2,w:5.25,h:0.6,fontSize:13,bold:true,color:C.INK,lineSpacingMultiple:1.2});
T(s,'つまり「重松氏と持分を争う」前提ではなく、「重松氏から持分を譲り受ける」前提で組めます。',
  {x:1.0,y:2.9,w:5.25,h:0.5,fontSize:10.5,color:C.INK2});
card(s,6.75,1.62,5.85,2.0,C.TINT_A,C.TINT_AL);
T(s,'そこで本当に比べたいこと',{x:7.05,y:1.82,w:5.2,h:0.3,fontSize:13.5,bold:true,color:C.ACC});
T(s,'中野の自己資金を同じ6.10億円だけ使うとして、MBOと合併のどちらが金融機関から見て有利か。',
  {x:7.05,y:2.2,w:5.25,h:0.6,fontSize:13,bold:true,color:C.INK,lineSpacingMultiple:1.2});
T(s,'合併ルートでは、その6.10億を合併後に重松氏・ビジョン社の持分取得に充てる想定とします。',
  {x:7.05,y:2.9,w:5.25,h:0.5,fontSize:10.5,color:C.INK2});
T(s,'この前提で変わること／変わらないこと',{x:0.7,y:3.85,w:11.9,h:0.32,fontSize:14,bold:true,color:C.INK});
[['変わる','持分を争う必要がない','重松氏側23.14%との対立構図ではなくなり、相対での譲受け交渉になります。',C.POS],
 ['変わる','支配権への道筋ができる','時間をかければ合併後でも過半数に近づけます。急ぐ必要がなくなります。',C.POS],
 ['変わらない','ビジョン社の借入7.90億','合併では返済されません。貸主が株主のまま上場会社に残ります。',C.NEG],
 ['変わらない','のれん22.09億円の償却','年1.10〜2.21億。合算営業利益の大半が消える構造は前提が変わっても同じです。',C.NEG]]
.forEach((r,i)=>{
  const x=0.7+i*3.02;
  card(s,x,4.3,2.85,2.1,r[0]==='変わる'?C.TINT_P:C.TINT_A,r[0]==='変わる'?C.TINT_PL:C.TINT_AL);
  badge(s,x+0.22,4.5,1.0,r[0],r[3],0.3);
  T(s,r[1],{x:x+0.22,y:4.95,w:2.45,h:0.6,fontSize:13,bold:true,color:C.INK});
  T(s,r[2],{x:x+0.22,y:5.58,w:2.45,h:0.7,fontSize:9.5,color:C.INK2,lineSpacingMultiple:1.15});
});
s.addNotes('前提が変わっても、ビジョン借入とのれんの2つは消えない。ここが結論を決める。');

/* 3 結論 */
s=slide(); light(s);
head(s,'結論','同じ6.10億円を使うなら、MBOのほうが金融機関には通ります');
card(s,0.7,1.62,11.9,1.5,C.TINT_A,C.TINT_AL);
T(s,'理由は単純です。MBOでは6.10億が「会社」に入り、合併ルートでは6.10億が「売り手」に出ていきます。',
  {x:1.05,y:1.82,w:11.2,h:0.64,fontSize:19,bold:true,color:C.ACC});
T(s,'銀行が見るのは株主名簿ではなく貸借対照表です。同じ金額でも、純資産が6.10億増えるか、まったく動かないかの差になります。',
  {x:1.05,y:2.52,w:11.2,h:0.45,fontSize:12,color:C.INK2});
[['01','MBOは6.10億で支配権と財務改善の両方が手に入る','中野陣営50.0%を確保しつつ、自己資本比率は△18.5%から24.9%へ。合併ルートで同額を投じても27.79%どまりで、会社の財務は1円も改善しません。',C.ACC],
 ['02','合併ではビジョン社の借入7.90億が残る','合併は株式交換なので、借入は返済されません。貸主であるビジョン社が株主として上場会社に残り、関連当事者取引として開示対象になります。',C.ACC],
 ['03','中野の借入の性格がまったく違う','MBOは事業会社への増資（返済原資は配当）。合併ルートは上場株を担保にした個人の株式取得資金で、株価下落時に追加担保を求められます。',C.ACC]]
.forEach((r,i)=>{
  const y=3.3+i*1.12;
  card(s,0.7,y,11.9,1.0);
  num(s,1.05,y+0.24,0.52,r[0],r[3]);
  T(s,r[1],{x:1.85,y:y+0.17,w:6.0,h:0.32,fontSize:14.5,bold:true,color:C.INK});
  T(s,r[2],{x:1.85,y:y+0.53,w:10.2,h:0.4,fontSize:10.5,color:C.INK2});
});
T(s,'ただし合併ルートには「実行に現金が要らない」という明確な利点があります。6.10億は後から、自分のペースで入れられます（5ページ）。',
  {x:0.7,y:6.72,w:11.9,h:0.32,fontSize:12,bold:true,color:C.POS});
s.addNotes('結論はMBO。ただし合併の利点（現金不要・任意のタイミング）は正直に認める。');

/* 4 同額比較：到達点 */
s=slide(); light(s);
head(s,'比較 ①','6.10億円を投じた後、どこに立っているか');
[['A','MBO',C.ACC,'50.000','%','中野陣営（中野＋中野ファンド）','非上場・支配権あり','会社の純資産 +6.10億'],
 ['B','合併 → 相対取得',C.BLUE,'27.79','%','中野個人（14.45%＋13.34pt取得）','上場・筆頭だが支配権なし','会社の純資産 ±0'],
 ["B'",'合併 → 第三者割当増資',C.MUT,'24.52','%','中野個人（希薄化13.3%を伴う）','上場・支配権なし','会社の純資産 +6.10億']]
.forEach((r,i)=>{
  const x=0.7+i*4.0;
  card(s,x,1.7,3.85,3.0,i?C.WHITE:C.TINT_A,i?C.LINE:C.TINT_AL);
  badge(s,x+0.3,1.95,0.62,r[0],r[2],0.32);
  T(s,r[1],{x:x+1.05,y:1.95,w:2.6,h:0.32,fontSize:13.5,bold:true,color:C.INK,valign:'middle'});
  T(s,[{text:r[3],options:{fontSize:40,bold:true,color:r[2]}},
       {text:r[4],options:{fontSize:16,bold:true,color:r[2]}}],{x:x+0.3,y:2.45,w:3.25,h:0.75});
  T(s,r[5],{x:x+0.3,y:3.25,w:3.25,h:0.3,fontSize:10,color:C.MUT});
  T(s,r[6],{x:x+0.3,y:3.62,w:3.25,h:0.3,fontSize:11.5,bold:true,color:C.INK});
  T(s,r[7],{x:x+0.3,y:3.96,w:3.25,h:0.3,fontSize:11,bold:true,color:i===1?C.NEG:C.POS});
});
card(s,0.7,4.95,11.9,1.55,C.TINT_W,C.TINT_WL);
T(s,'合併ルートで過半数まで行くには、さらにいくら要るか',{x:1.0,y:5.15,w:7,h:0.3,fontSize:13.5,bold:true,color:C.WARN});
[['1/3（33.33%）まで','追加 2.53億円','累計 8.63億円'],
 ['50%まで','追加 10.15億円','累計 16.25億円（市場価格ベース）'],
 ['TOBになった場合','プレミアム20〜40%','累計 18〜21億円の想定']].forEach((r,i)=>{
  const x=1.0+i*3.92;
  T(s,r[0],{x,y:5.52,w:3.7,h:0.28,fontSize:11,color:C.MUT});
  T(s,r[1],{x,y:5.80,w:3.7,h:0.32,fontSize:15,bold:true,color:C.INK});
  T(s,r[2],{x,y:6.13,w:3.7,h:0.28,fontSize:10,color:C.INK2});
});
T(s,'合併後発行済19,966,162株・株価229円・あどばるEquity 18億・ストックオプション9,000株は行使済みを前提とした試算です。',
  {x:0.7,y:6.7,w:11.9,h:0.3,fontSize:9,color:C.MUT});
s.addNotes('同じ6.10億で50%か27.79%か。過半数まで行くなら結局16億超が要る。');

/* 5 金融機関から見た違い */
s=slide(); light(s);
head(s,'比較 ②','金融機関から見た、決定的な違い');
tbl(s,[
 [{text:'銀行が見る項目',options:TH},{text:'A：MBO',options:Object.assign({align:'center'},TH,{fill:C.ACC})},
  {text:'B：合併 → 相対取得',options:THC}],
 [{text:'6.10億円の行き先',options:{bold:true}},{text:'会社（第三者割当増資）',options:{align:'center',bold:true,color:C.POS}},{text:'売り手（重松氏・ビジョン社）',options:{align:'center',color:C.NEG}}],
 [{text:'会社の純資産への効果',options:{bold:true}},{text:'+6.10億円',options:{align:'center',bold:true,color:C.POS}},{text:'±0',options:{align:'center',color:C.NEG}}],
 [{text:'自己資本比率',options:{bold:true}},{text:'△18.5% → 24.9%',options:{align:'center',bold:true,color:C.POS}},{text:'合算次第（個社は未解消）',options:{align:'center'}}],
 [{text:'ビジョン社借入 7.90億',options:{bold:true}},{text:'全額返済・関係終了',options:{align:'center',bold:true,color:C.POS}},{text:'残存（貸主が株主のまま）',options:{align:'center',color:C.NEG}}],
 [{text:'中野の借入の名目',options:{bold:true}},{text:'事業会社への出資',options:{align:'center'}},{text:'個人の株式取得資金',options:{align:'center',color:C.NEG}}],
 [{text:'その担保',options:{bold:true}},{text:'非上場株（時価変動なし）',options:{align:'center'}},{text:'上場株（追加担保リスクあり）',options:{align:'center',color:C.NEG}}],
 [{text:'返済原資',options:{bold:true}},{text:'配当（分配可能額 17.06億）',options:{align:'center',bold:true,color:C.POS}},{text:'配当（のれん償却後の利益）',options:{align:'center',color:C.NEG}}],
 [{text:'経営者保証',options:{bold:true}},{text:'解除を交渉できる',options:{align:'center',bold:true,color:C.POS}},{text:'既存保証は継続',options:{align:'center',color:C.NEG}}],
 [{text:'銀行の稟議区分',options:{bold:true}},{text:'事業性融資（借換え）',options:{align:'center',bold:true,color:C.POS}},{text:'有価証券担保・個人向け',options:{align:'center',color:C.NEG}}]],
 {x:0.7,y:1.68,w:11.9,colW:[3.5,4.2,4.2],rowH:0.41,fontSize:11.5});
T(s,'合併ルートで6.10億を投じても、あどばるの決算書は何も変わりません。銀行の稟議が動くのはAだけです。',
  {x:0.7,y:6.0,w:11.9,h:0.35,fontSize:13,bold:true,color:C.ACC});
T(s,'合併後の合算自己資本比率の試算には、スペースマーケット社の直近の純資産・有利子負債が必要です。同社の決算短信を入手のうえ確定させます。',
  {x:0.7,y:6.5,w:11.9,h:0.4,fontSize:9.5,color:C.MUT});
s.addNotes('この一枚が「金融機関的にどちらが良いか」への回答。資金の行き先が全て。');

/* 6 規制 */
s=slide(); dark(s);
head(s,'比較 ③','合併後に買い増す場合の法規制',true);
[['5%','大量保有報告書','合併時点で中野は14.45%。追加取得のつど5営業日以内に変更報告書の提出が必要で、買い増しの意図が市場に開示されます。'],
 ['1/3','公開買付（TOB）の強制','市場外での相対取得で所有割合が3分の1を超える場合、相手が1名でもTOBが義務づけられます（金商法27条の2）。'],
 ['80.5%','特定株比率','市場に出回る株が少なく、まとまった株数を市場で買うと株価が跳ねます。相対取得が前提にならざるを得ません。'],
 ['2/3','全部買付義務','TOBで3分の2以上を取得する場合、応募株式の全部を買い付ける義務が生じます。所要額が読めなくなります。']]
.forEach((r,i)=>{
  const x=0.7+(i%2)*6.05, y=1.85+Math.floor(i/2)*2.1;
  dcard(s,x,y,5.85,1.85);
  T(s,r[0],{x:x+0.3,y:y+0.22,w:1.3,h:0.4,fontSize:20,bold:true,color:C.ACC2});
  T(s,r[1],{x:x+1.7,y:y+0.28,w:3.9,h:0.32,fontSize:14.5,bold:true,color:C.WHITE});
  T(s,r[2],{x:x+0.3,y:y+0.76,w:5.25,h:0.95,fontSize:10.5,color:C.DKTXT,lineSpacingMultiple:1.2});
});
T(s,'6.10億で到達する27.79%までは相対取得で済みます（1/3以下・10名以下からの取得）。そこから先は公開の手続きになり、プレミアムも乗ります。',
  {x:0.7,y:6.16,w:11.9,h:0.55,fontSize:12.5,bold:true,color:C.ACC2});
T(s,'金商法の適用関係は取得の態様・人数・期間により異なります。実行前に証券会社および弁護士の確認を要します。',
  {x:0.7,y:6.82,w:11.9,h:0.3,fontSize:9,color:'7F8E9B'});
s.addNotes('27.79%までは静かに買える。過半数を狙うとTOBになる、という段差を理解してもらう。');

/* 7 合併後の株主構成 */
s=slide(); light(s);
head(s,'参考','いま合併した場合の株主構成');
stat(s,0.7,1.66,2.9,'合併比率','1 : 38.99','','あどばる1株にSM株38.99株',C.BLUE);
stat(s,3.8,1.66,2.9,'交付新株','786.0','万株','あどばるEquity 18億／SM 229円',C.INK);
stat(s,6.9,1.66,2.9,'合併後 発行済','1,997','万株','現状1,210万株＋交付分',C.INK);
stat(s,10.0,1.66,2.6,'合併後 時価総額','45.7','億円','SM単独 27.7億から拡大',C.INK);
s.addChart(p.ChartType.bar,[{name:'持株比率',
  labels:['ダブルパインズ','TKP','中野 邦人','重松 大輔','その他SM株主','ビジョン'],
  values:[8.36,12.77,14.45,14.77,15.26,18.43]}],
 {x:0.7,y:3.15,w:7.0,h:3.35,barDir:'bar',chartColors:[C.BLUE],showTitle:true,
  title:'合併後の持株比率（％・ストックオプション行使後）',titleFontSize:13,titleColor:C.INK,titleFontFace:F,
  showValue:true,dataLabelPosition:'outEnd',dataLabelFormatCode:'0.00"%"',dataLabelFontFace:F,
  dataLabelFontSize:9.5,dataLabelColor:C.INK,showLegend:false,barGapWidthPct:45,
  catAxisLabelFontFace:F,catAxisLabelFontSize:10.5,catAxisLabelColor:C.INK2,
  valAxisLabelFontFace:F,valAxisLabelFontSize:9,valAxisLabelColor:C.MUT,valAxisMaxVal:25,
  valGridLine:{color:C.LINE,size:0.5},catGridLine:{style:'none'}});
card(s,8.0,3.15,4.6,3.35,C.TINT_B,C.TINT_BL);
T(s,'この名簿の読みどころ',{x:8.3,y:3.35,w:4.0,h:0.32,fontSize:14,bold:true,color:C.BLUE});
[['筆頭株主はビジョン社','18.43%。合併しても親会社は名簿から消えず、借入7.90億の貸主のまま残ります。'],
 ['重松氏側は合計23.14%','重松氏14.77%＋ダブルパインズ8.36%。会長就任後にこの持分をどう扱うかが交渉の中心です。'],
 ['中野は14.45%','この時点では第4位。ここから6.10億で27.79%まで買い増す、というのが合併ルートの姿です。']]
.forEach((r,i)=>{
  const y=3.78+i*0.92;
  T(s,'0'+(i+1),{x:8.3,y:y,w:0.5,h:0.28,fontSize:11,bold:true,color:C.ACC2});
  T(s,r[0],{x:8.85,y:y,w:3.45,h:0.28,fontSize:12,bold:true,color:C.INK});
  T(s,r[1],{x:8.85,y:y+0.3,w:3.45,h:0.6,fontSize:9.5,color:C.INK2});
});
T(s,'出所：会社四季報2026年9月号（発行済12,105,900株）、株価229円（2026年9月21日終値）。あどばるの評価額はLOIの18億円、ストックオプション9,000株は行使済みを前提としています。',
  {x:0.7,y:6.68,w:11.9,h:0.3,fontSize:9,color:C.MUT});
s.addNotes('229円基準に統一した版。前回230円で作った数値から小数点以下が動いている。');

/* 8 論点 */
s=slide(); dark(s);
head(s,'論点','前提が変わっても残る4点',true);
[['01','のれん22.09億円の償却','日本基準では定額償却が必要です。20年償却でも年1.10億、10年なら年2.21億。合算営業利益（約2.6億）の大半が消え、配当原資にも影響します。'],
 ['02','ビジョン社の借入7.90億が残る','合併は株式交換であり、借入は返済されません。貸主が株主として残るため、関連当事者取引の開示対象になります。'],
 ['03','第2位株主が競合TKP社','TKPは現在21.06%の第2位株主。合併後も12.77%で残ります。競合が株主総会で議決権を持つ形になります。'],
 ['04','流通株式比率25%基準','合併後の流通株式比率は東証グロースの上場維持基準に抵触する可能性があります（改善期間1年）。中野が買い増すほど比率は下がります。']]
.forEach((r,i)=>{
  const x=0.7+(i%2)*6.05, y=1.85+Math.floor(i/2)*2.35;
  dcard(s,x,y,5.85,2.1);
  T(s,r[0],{x:x+0.3,y:y+0.24,w:0.9,h:0.35,fontSize:15,bold:true,color:C.ACC2});
  T(s,r[1],{x:x+1.15,y:y+0.22,w:4.5,h:0.4,fontSize:14.5,bold:true,color:C.WHITE});
  T(s,r[2],{x:x+0.3,y:y+0.70,w:5.25,h:1.2,fontSize:10.5,color:C.DKTXT,lineSpacingMultiple:1.2});
});
T(s,'④は見落としやすい点です。中野が持分を買い増すほど流通株式比率は下がり、上場維持基準に近づきます。支配権の確保と上場維持は、この一点で相反します。',
  {x:0.7,y:6.7,w:11.9,h:0.32,fontSize:12.5,bold:true,color:C.ACC2});
s.addNotes('④の相反関係は重要。買い増すほど上場が危うくなるというジレンマ。');

/* 9 評価額 */
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
T(s,'対価は現金ではなく、この株式です。年初来で3割下落しており、買い増しの原資を借りる際の担保価値にも直結します。',
  {x:7.05,y:3.96,w:5.25,h:0.45,fontSize:10.5,color:C.INK2});
card(s,0.7,4.58,11.9,1.95,C.TINT_W,C.TINT_WL);
T(s,'交渉上、押さえておきたい点',{x:1.0,y:4.76,w:6,h:0.32,fontSize:13.5,bold:true,color:C.WARN});
[['基準株価は3ヶ月平均を','3ヶ月平均229円は6ヶ月平均240円より低く、同じ評価額でも交付される株数が増えます。当社に有利な側です。'],
 ['評価額は20億円を下限に','MBOで既存株主に20億円評価で退出いただく前提と整合しません。18億円では社内説明が立ちません。'],
 ['重松氏の譲渡は書面で','会長就任と持分譲渡の意向は、時期・価格・数量を含めて覚書にしておく必要があります。口頭の前提のままでは資金計画が組めません。']]
.forEach((r,i)=>{
  const x=1.0+i*3.92;
  dot(s,x,5.22,C.WARN,0.16);
  T(s,r[0],{x:x+0.3,y:5.13,w:3.4,h:0.3,fontSize:11.5,bold:true,color:C.INK});
  T(s,r[1],{x:x+0.3,y:5.47,w:3.4,h:1.0,fontSize:9.5,color:C.INK2,lineSpacingMultiple:1.15});
});
T(s,'3ヶ月・6ヶ月平均株価は公開情報からの推定値です（3ヶ月レンジ225〜235円、6ヶ月レンジ235〜250円）。確定値は証券会社経由でご確認ください。',
  {x:0.7,y:6.68,w:11.9,h:0.3,fontSize:9,color:C.MUT});
s.addNotes('重松氏の意向を覚書にする、が今回の追加論点。口頭前提では銀行に持ち込めない。');

/* 10 MBO後に合併 */
s=slide(); light(s);
head(s,'提案','MBO完了後に合併すれば、条件は変わります');
tbl(s,[
 [{text:'',options:TH},{text:'いま合併し、6.10億で買い増す',options:THC},
  {text:'MBO完了後に合併する',options:Object.assign({align:'center'},TH,{fill:C.ACC})}],
 [{text:'あどばるの評価額',options:{bold:true}},{text:'18.0億円（LOI）',options:{align:'center'}},{text:'26.85億円（取引後株主価値）',options:{align:'center',bold:true}}],
 [{text:'中野 個人',options:{bold:true}},{text:'27.79%',options:{align:'center'}},{text:'13.44%',options:{align:'center'}}],
 [{text:'中野ファンド',options:{bold:true}},{text:'―',options:{align:'center'}},{text:'11.11%',options:{align:'center'}}],
 [{text:'　中野陣営 計',options:{bold:true,fill:'F3E7EA'}},{text:'27.79%',options:{align:'center',bold:true,fill:'F3E7EA'}},{text:'24.55%',options:{align:'center',bold:true,fill:'F3E7EA'}}],
 [{text:'パートナー',options:{bold:true}},{text:'―',options:{align:'center'}},{text:'24.55%',options:{align:'center'}}],
 [{text:'　あどばる側 計',options:{bold:true,fill:'E8EDF2'}},{text:'27.79%',options:{align:'center',color:C.NEG,fill:'E8EDF2'}},{text:'49.09%',options:{align:'center',bold:true,color:C.POS,fill:'E8EDF2'}}],
 [{text:'ビジョン社',options:{bold:true}},{text:'18.43%（筆頭株主）',options:{align:'center',color:C.NEG}},{text:'0%（名簿から消滅）',options:{align:'center',bold:true,color:C.POS}}],
 [{text:'ビジョン社借入 7.90億',options:{bold:true}},{text:'残存',options:{align:'center',color:C.NEG}},{text:'完済済み',options:{align:'center',bold:true,color:C.POS}}],
 [{text:'中野の自己資金',options:{bold:true}},{text:'6.10億円',options:{align:'center'}},{text:'6.10億円（同額）',options:{align:'center'}}]],
 {x:0.7,y:1.66,w:11.9,colW:[3.7,4.1,4.1],rowH:0.415,fontSize:11});
T(s,'持分の数字だけを見れば27.79%のほうが高く見えます。しかし中身は、ビジョン社を抱えたままの27.79%と、ビジョン社を清算しパートナーを伴った49.09%の違いです。',
  {x:0.7,y:6.02,w:11.9,h:0.5,fontSize:12.5,bold:true,color:C.ACC});
T(s,'MBO完了後の合併はSM株価230円・あどばる自己株式127,616株の無対価消却を前提とした試算です。評価額26.85億円は先方との合意価格ではありません。',
  {x:0.7,y:6.66,w:11.9,h:0.4,fontSize:9,color:C.MUT});
s.addNotes('27.79%のほうが数字は大きい。だが質が違う、と正直に説明する。');

/* 11 対応方針 */
s=slide(); light(s);
head(s,'対応方針','先方にどうお返しするか');
[['01','重松氏の意向を、まず書面にする','会長就任の時期、譲渡する株数、価格の考え方。この3点を覚書にしていただきます。口頭の前提のままでは、銀行に資金計画として持ち込めません。',C.ACC],
 ['02','合併の意思はあると伝え、順序だけ相談する','反対ではないこと、事業面のシナジーは理解していることを明確に伝えたうえで、親会社との資本整理（MBO）を先に済ませたい旨をお伝えします。',C.POS],
 ['03','条件面の論点は、いまのうちに投げておく','評価額18億円の根拠、基準株価を3ヶ月平均とすること、のれん償却の負担配分。あわせてスペースマーケット社の直近の純資産・有利子負債の開示を求めます。',C.ACC]]
.forEach((r,i)=>{
  const y=1.72+i*1.35;
  card(s,0.7,y,11.9,1.2);
  num(s,1.05,y+0.3,0.6,r[0],r[3]);
  T(s,r[1],{x:1.9,y:y+0.22,w:10.3,h:0.32,fontSize:15,bold:true,color:C.INK});
  T(s,r[2],{x:1.9,y:y+0.6,w:10.3,h:0.5,fontSize:10.5,color:C.INK2,lineSpacingMultiple:1.15});
});
card(s,0.7,5.85,11.9,1.05,C.TINT_P,C.TINT_PL);
T(s,'仮に合併を先行させる場合の条件',{x:1.05,y:6.02,w:4,h:0.3,fontSize:12.5,bold:true,color:C.POS});
T(s,'6.10億円は相対取得ではなく第三者割当増資で入れます。持分は27.79%から24.52%に下がりますが、資金が会社に入り、金融機関に説明できる形になります。',
  {x:1.05,y:6.35,w:11.2,h:0.4,fontSize:11.5,color:C.INK2});
s.addNotes('もし合併を選ぶなら増資で入れる、という代替案を必ず置いておく。');

p.writeFile({fileName:'スペースマーケット社合併提案_検討_20260923.pptx'}).then(()=>console.log('deckB v3 written'));
