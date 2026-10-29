const D=require('./design.js')();
const {p,C,F,T,dark,light,head,card,dcard,stat,badge,num,dot,TH,THR,THC,tbl,cover,slide}=D;
let s;

/* 1 表紙 */
s=slide();
cover(s,'株式会社あどばる','夢展望（3185）の買収検討',
 'RIZAP社の保有株取得・7億円の債権放棄・あどばるとの合併の採算とシナジー',
 '2026年10月29日',
 [['作成','株式会社あどばる 代表取締役 中野 邦人'],
  ['前提','あどばる15億円評価／夢展望は株価80円（2026年10月28日）'],
  ['出所','夢展望社の公開情報（2026年3月期決算・2026年6月末・適時開示・大量保有報告書）']],
 '公開情報にもとづく試算です。稲田様との協議内容は反映していません');
s.addNotes('RIZAPから出てきた案件。スマサポ案（PlanD）と並べて評価する。');

/* 2 結論 */
s=slide(); light(s);
head(s,'結論','夢展望は「シナジー案件」ではなく「器の案件」です');
card(s,0.7,1.62,11.9,1.45,C.TINT_A,C.TINT_AL);
T(s,'安く持分を取れる一方、合併後の利益はスマサポ案の半分以下です',
  {x:1.05,y:1.84,w:11.2,h:0.4,fontSize:19,bold:true,color:C.ACC});
T(s,'RIZAP社の44.68%を1株純資産相当（35〜40円）で取得できれば、中野の負担は2.9〜3.3億円で合併後40.7%を握れます。ただし合算の営業利益は1.70億円にとどまり、夢展望を時価総額15億円のまま合併比率に使うと、あどばる株主にとっては価値の目減りになります。',
  {x:1.05,y:2.3,w:11.2,h:0.65,fontSize:11.5,color:C.INK2,lineSpacingMultiple:1.2});
tbl(s,[
 [{text:'',options:TH},{text:'夢展望案',options:Object.assign({align:'center'},TH,{fill:C.ACC})},{text:'スマサポ案（PlanD）',options:THC}],
 [{text:'中野の負担',options:{bold:true}},{text:'2.9〜6.7億円（RIZAP株の取得単価次第）',options:{align:'center',bold:true,color:C.POS}},{text:'0〜6.2億円',options:{align:'center'}}],
 [{text:'中野の持分',options:{bold:true}},{text:'40.7%（3分の1超）',options:{align:'center',bold:true,color:C.POS}},{text:'15.7〜33.3%',options:{align:'center'}}],
 [{text:'合算の営業利益',options:{bold:true}},{text:'1.70億円（のれん償却なし）',options:{align:'center',color:C.NEG}},{text:'3.42億円（のれん償却後）',options:{align:'center',bold:true,color:C.POS}}],
 [{text:'事業シナジー',options:{bold:true}},{text:'限定的（ブライダル・女性顧客）',options:{align:'center',color:C.NEG}},{text:'強い（物件の仕入れ）',options:{align:'center',bold:true,color:C.POS}}],
 [{text:'有利子負債/EBITDA',options:{bold:true}},{text:'約5.4倍',options:{align:'center',color:C.NEG}},{text:'約2.2倍',options:{align:'center',bold:true,color:C.POS}}],
 [{text:'固有のリスク',options:{bold:true}},{text:'実質的存続性の審査・MSワラント',options:{align:'center',color:C.NEG}},{text:'スマサポの通期未達',options:{align:'center'}}]],
 {x:0.7,y:3.3,w:11.9,colW:[2.9,4.5,4.5],rowH:0.4,fontSize:11});
T(s,'結論：PlanDを置き換える案ではなく、RIZAP株を安く取れる場合に限って並走させる候補です。',
  {x:0.7,y:6.3,w:11.9,h:0.4,fontSize:13,bold:true,color:C.ACC});
s.addNotes('値段次第。純資産相当で取れるなら面白い。時価なら見送り。');

/* 3 現状 */
s=slide(); light(s);
head(s,'現状','夢展望の姿');
stat(s,0.7,1.68,2.9,'売上（2026年3月期）','35.34','億円','前期比 △21.4%',C.NEG);
stat(s,3.8,1.68,2.9,'営業損益','△3.85','億円','今期予想は△0.30億',C.NEG);
stat(s,6.9,1.68,2.9,'純資産（2026年6月末）','△0.47','億円','債務超過',C.NEG);
stat(s,10.0,1.68,2.6,'時価総額','14.9','億円','株価80円・年初来高値280円',C.INK);
card(s,0.7,3.1,5.85,3.4);
T(s,'事業の内訳（2026年3月期）',{x:1.0,y:3.3,w:5.2,h:0.3,fontSize:13,bold:true,color:C.INK});
[['アパレル（10〜30代女性向けEC）','24.34億','68%'],
 ['ジュエリー（トレセンテ・婚約／結婚指輪）','約6.75億','19%'],
 ['トイ（IPコラボ商品）','4.25億','12%']].forEach((r,i)=>{
  const y=3.75+i*0.48;
  T(s,r[0],{x:1.0,y:y,w:3.3,h:0.3,fontSize:10.5,color:C.INK2});
  T(s,r[1],{x:4.3,y:y,w:1.1,h:0.3,fontSize:11.5,bold:true,color:C.INK,align:'right'});
  T(s,r[2],{x:5.45,y:y,w:0.8,h:0.3,fontSize:10.5,color:C.MUT,align:'right'});
});
T(s,'上期はトイが営業利益0.45億円で唯一の黒字、ジュエリーは営業損失0.36億円。アパレルの縮小が赤字の主因です。会計基準はIFRSです。',
  {x:1.0,y:5.25,w:5.25,h:1.05,fontSize:10,color:C.INK2,lineSpacingMultiple:1.2});
card(s,6.75,3.1,5.85,3.4,C.TINT_W,C.TINT_WL);
T(s,'資本の状況',{x:7.05,y:3.3,w:5.2,h:0.3,fontSize:13,bold:true,color:C.WARN});
[['RIZAPグループ','8,330,400株','44.68%'],
 ['Long Corridor（MSワラント）','普通株250,000株','潜在192万株'],
 ['発行済株式数','18,642,500株','']].forEach((r,i)=>{
  const y=3.75+i*0.44;
  T(s,r[0],{x:7.05,y:y,w:2.6,h:0.3,fontSize:10.5,color:C.INK2});
  T(s,r[1],{x:9.55,y:y,w:1.6,h:0.3,fontSize:10.5,bold:true,color:C.INK,align:'right'});
  T(s,r[2],{x:11.15,y:y,w:1.25,h:0.3,fontSize:10,color:C.MUT,align:'right'});
});
T(s,'2026年9月に第12回新株予約権（行使価額修正条項付・下限73円・217万株）を発行。株価は280円から80円まで下落し、下限に近づいています。\n\n2026年8月に資本金を10.3億円から5,000万円へ減資しています。',
  {x:7.05,y:5.1,w:5.25,h:1.3,fontSize:10,color:C.INK2,lineSpacingMultiple:1.2});
s.addNotes('債務超過・赤字・MSワラント。RIZAPが手放したい理由がそろっている。');

/* 4 債権放棄の効果 */
s=slide(); dark(s);
head(s,'7億円の債権放棄','何が変わり、何が変わらないか',true);
[['BS','債務超過が解消する','純資産は△0.47億円から6.53億円へ。1株純資産は35.0円になります。グロース市場の債務超過による上場廃止の懸念も消えます。','○'],
 ['税務','課税はほぼ生じない見込み','債務免除益は課税所得になりますが、8月の減資で資本金5,000万円の中小法人となったため、繰越欠損金で100%相殺できます。減資はこの放棄の準備だったと読めます。','○'],
 ['会計','PLには利益として出ない可能性','IFRSでは、株主が株主の立場で行う債権放棄は資本取引として扱われます。連結PLに7億円の特別利益は立たず、資本剰余金が増える形になる見込みです。','△'],
 ['収益力','利益体質は変わらない','放棄で消えるのは支払利息（年0.2億円程度）だけです。アパレルの赤字という本業の問題は残ります。','×']]
.forEach((r,i)=>{
  const x=0.7+(i%2)*6.05, y=1.85+Math.floor(i/2)*2.3;
  dcard(s,x,y,5.85,2.05);
  badge(s,x+0.3,y+0.24,0.8,r[0],C.ACC,0.32);
  T(s,r[1],{x:x+1.3,y:y+0.22,w:3.8,h:0.36,fontSize:14,bold:true,color:C.WHITE});
  T(s,r[3],{x:x+5.05,y:y+0.2,w:0.5,h:0.4,fontSize:18,bold:true,color:r[3]==='○'?'7FD1A4':(r[3]==='△'?'E8B96B':'E89B8F'),align:'center'});
  T(s,r[2],{x:x+0.3,y:y+0.72,w:5.25,h:1.2,fontSize:10.5,color:C.DKTXT,lineSpacingMultiple:1.2});
});
T(s,'放棄はBSを直すが、稼ぐ力は直さない。買収価格は「放棄後の純資産6.53億円」を基準に考えるべきです。',
  {x:0.7,y:6.6,w:11.9,h:0.35,fontSize:12.5,bold:true,color:C.ACC2});
s.addNotes('債務免除益は会計上は資本取引の可能性。税務は減資で中小法人化して欠損金100%控除。');

/* 5 ストラクチャーと採算 */
s=slide(); light(s);
head(s,'買収の採算','RIZAP株をいくらで取れるかが、すべてです');
T(s,'手順：①RIZAP株をディスカウントTOBで取得 → ②7億円の放棄 → ③あどばると合併 → ④ビジョン社・旧あどばる6社は市場で売却',
  {x:0.7,y:1.62,w:11.9,h:0.3,fontSize:11.5,bold:true,color:C.INK});
tbl(s,[
 [{text:'RIZAP株の取得単価',options:TH},{text:'中野の負担',options:THR},{text:'合併後の中野の持分',options:THR},{text:'完全希薄化後',options:THR},{text:'評価',options:TH}],
 [{text:'80円（市場株価）',options:{bold:true}},{text:'6.66億円',options:{align:'right'}},{text:'40.68%',options:{align:'right'}},{text:'38.70%',options:{align:'right'}},{text:'スマサポ案の33%取得とほぼ同額',options:{color:C.MUT}}],
 [{text:'60円',options:{bold:true}},{text:'5.00億円',options:{align:'right'}},{text:'40.68%',options:{align:'right'}},{text:'38.70%',options:{align:'right'}},{text:'',options:{}}],
 [{text:'40円',options:{bold:true,fill:'F3E7EA'}},{text:'3.33億円',options:{align:'right',bold:true,fill:'F3E7EA'}},{text:'40.68%',options:{align:'right',bold:true,fill:'F3E7EA'}},{text:'38.70%',options:{align:'right',fill:'F3E7EA'}},{text:'ここなら採算が合う',options:{bold:true,color:C.POS,fill:'F3E7EA'}}],
 [{text:'35円（1株純資産相当）',options:{bold:true,fill:'F3E7EA'}},{text:'2.92億円',options:{align:'right',bold:true,fill:'F3E7EA'}},{text:'40.68%',options:{align:'right',bold:true,fill:'F3E7EA'}},{text:'38.70%',options:{align:'right',fill:'F3E7EA'}},{text:'RIZAP社が説明しやすい下限',options:{bold:true,color:C.POS,fill:'F3E7EA'}}]],
 {x:0.7,y:2.05,w:11.9,colW:[2.7,1.8,2.2,1.8,3.4],rowH:0.42,fontSize:11});
card(s,0.7,4.75,5.85,1.75,C.TINT_P,C.TINT_PL);
T(s,'なぜ安く取れる可能性があるか',{x:1.0,y:4.93,w:5.2,h:0.3,fontSize:13,bold:true,color:C.POS});
T(s,'RIZAP社は7億円を放棄してでも出ていきたい売り手です。放棄後の1株純資産は35円で、赤字会社の株を純資産相当で手放すのは取締役会でも説明がつきます。',
  {x:1.0,y:5.27,w:5.25,h:1.1,fontSize:10.5,color:C.INK2,lineSpacingMultiple:1.2});
card(s,6.75,4.75,5.85,1.75,C.TINT_W,C.TINT_WL);
T(s,'ディスカウントTOBが必要です',{x:7.05,y:4.93,w:5.2,h:0.3,fontSize:13,bold:true,color:C.WARN});
T(s,'3分の1を超える相対取得は公開買付けが義務です。市場株価より低い価格でTOBをかければ、応募するのは実質RIZAP社だけになります。手続き費用は0.3〜0.5億円を見込みます。',
  {x:7.05,y:5.27,w:5.25,h:1.1,fontSize:10.5,color:C.INK2,lineSpacingMultiple:1.2});
T(s,'中野の持分は取得単価に関係なく40.68%です（あどばる分18.40%＋RIZAP株22.28%）。単価が変えるのは負担額だけです。',
  {x:0.7,y:6.68,w:11.9,h:0.3,fontSize:9.5,color:C.MUT});
s.addNotes('40円以下で取れれば、スマサポ案より少ない負担で多くの持分。');

/* 6 合算PL・BS */
s=slide(); light(s);
head(s,'合算のPL・BS','スマサポ案と並べると');
tbl(s,[
 [{text:'',options:TH},{text:'夢展望＋あどばる',options:Object.assign({align:'center'},TH,{fill:C.ACC})},{text:'スマサポ＋あどばる',options:THC},{text:'差',options:THC}],
 [{text:'合算 売上',options:{bold:true}},{text:'55.8億円',options:{align:'center',bold:true}},{text:'約53億円',options:{align:'center'}},{text:'ほぼ同規模',options:{align:'center',color:C.MUT}}],
 [{text:'合算 営業利益',options:{bold:true}},{text:'1.70億円',options:{align:'center',color:C.NEG}},{text:'4.30億円',options:{align:'center',bold:true}},{text:'△2.60億円',options:{align:'center',color:C.NEG}}],
 [{text:'のれん償却',options:{bold:true}},{text:'なし（IFRS）',options:{align:'center',bold:true,color:C.POS}},{text:'△0.88億円（日本基準）',options:{align:'center'}},{text:'＋0.88億円',options:{align:'center',color:C.POS}}],
 [{text:'償却後 営業利益',options:{bold:true,fill:'F3E7EA'}},{text:'1.70億円',options:{align:'center',bold:true,color:C.NEG,fill:'F3E7EA'}},{text:'3.42億円',options:{align:'center',bold:true,fill:'F3E7EA'}},{text:'△1.72億円',options:{align:'center',bold:true,color:C.NEG,fill:'F3E7EA'}}],
 [{text:'のれん控除後の自己資本比率',options:{bold:true}},{text:'11.8%',options:{align:'center'}},{text:'11.8%',options:{align:'center'}},{text:'同水準',options:{align:'center',color:C.MUT}}],
 [{text:'有利子負債',options:{bold:true}},{text:'約17.5億円',options:{align:'center',color:C.NEG}},{text:'約11億円',options:{align:'center'}},{text:'＋6.5億円',options:{align:'center',color:C.NEG}}],
 [{text:'有利子負債/EBITDA',options:{bold:true}},{text:'約5.4倍',options:{align:'center',color:C.NEG}},{text:'約2.2倍',options:{align:'center',bold:true}},{text:'',options:{}}],
 [{text:'現預金',options:{bold:true}},{text:'6.69億円',options:{align:'center',bold:true,color:C.POS}},{text:'スマサポ分は未入手',options:{align:'center',color:C.MUT}},{text:'',options:{}}]],
 {x:0.7,y:1.68,w:11.9,colW:[3.3,3.2,3.2,2.2],rowH:0.39,fontSize:11});
card(s,0.7,5.35,11.9,1.15,C.TINT_A,C.TINT_AL);
T(s,'合併比率に要注意',{x:1.05,y:5.52,w:6,h:0.3,fontSize:13,bold:true,color:C.ACC});
T(s,'合算の税引後利益1.31億円をPER17倍で評価すると22.3億円で、単純合算30億円を下回ります。夢展望の繰越欠損金で税負担が消えれば31.9億円です。夢展望を時価15億円のまま比率に使うと、赤字会社を黒字会社と同じ値段で数えることになります。',
  {x:1.05,y:5.86,w:11.2,h:0.55,fontSize:10.5,color:C.INK2,lineSpacingMultiple:1.15});
T(s,'夢展望の有利子負債は2025年9月末の13.5億円（リース負債を含む見込み）から7億円を引いた推定値です。EBITDAは夢展望の償却費を0.9億円と仮定しています。',
  {x:0.7,y:6.68,w:11.9,h:0.3,fontSize:9,color:C.MUT});
s.addNotes('IFRSでのれん非償却は効くが、利益の差が大きすぎる。欠損金の残高が鍵。');

/* 7 シナジー */
s=slide(); dark(s);
head(s,'あどばるとのシナジー','事業面は限定的、財務・税務面に妙味があります',true);
[['事業','トレセンテ × パーティースペース','婚約・結婚指輪の購入者に、プロポーズ・前撮り・二次会の会場を案内できます。顧客の動線は自然ですが、規模は数千万円にとどまる見込みです。','小'],
 ['事業','女性向けEC × レンタルスペース','10〜30代女性という顧客層は、女子会や撮影でスペースを使う層と重なります。EC会員への送客は低コストでできます。','小'],
 ['事業','トイ（IPコラボ） × スペース','IPコラボのポップアップや物販イベントを自社スペースで開けます。唯一黒字のトイ事業の販路が広がります。','小〜中'],
 ['税務','夢展望の繰越欠損金','合併後のあどばる事業の利益を、夢展望に残る繰越欠損金で相殺できる可能性があります。欠損金1億円あたり約0.3億円の節税です。','大'],
 ['会計','のれんを償却しない','合併後もIFRSを使えば、のれんは償却されず減損テストのみです。スマサポ案の年0.88億円の償却負担がありません。','中'],
 ['財務','上場の器と現預金6.29億円','債務超過が解消された上場会社と、ビジョン社への返済の一部に充てうる手元資金が手に入ります。','中']]
.forEach((r,i)=>{
  const x=0.7+(i%3)*4.0, y=1.8+Math.floor(i/3)*2.45;
  dcard(s,x,y,3.85,2.25,r[0]==='事業'?null:C.ACC);
  T(s,r[0],{x:x+0.25,y:y+0.2,w:1.0,h:0.26,fontSize:10,bold:true,color:C.ACC2});
  T(s,'効果 '+r[3],{x:x+2.2,y:y+0.2,w:1.4,h:0.26,fontSize:10,bold:true,color:r[3]==='大'?'7FD1A4':(r[3]==='小'?'B9C4CF':'E8B96B'),align:'right'});
  T(s,r[1],{x:x+0.25,y:y+0.5,w:3.35,h:0.34,fontSize:12.5,bold:true,color:C.WHITE});
  T(s,r[2],{x:x+0.25,y:y+0.92,w:3.35,h:1.25,fontSize:9.5,color:C.DKTXT,lineSpacingMultiple:1.2});
});
s.addNotes('事業シナジーは弱い。税務と会計の妙味で買う案件。');

/* 8 リスク */
s=slide(); light(s);
head(s,'リスク','この案件に固有の論点');
[['01','実質的存続性の審査（裏口上場）','夢展望を時価14.9億円で比率を組むと、あどばる側は50.14%になります。非上場会社の株主が過半数を握ると、東証の審査で新規上場に準じた審査を求められる可能性があります。あどばる側を50%未満に設計し、東証へ事前相談します。',C.NEG],
 ['02','MSワラントによる希薄化','Long Corridor社の第12回新株予約権が192万株残っています（下限73円）。株価は80円で下限に近く、売り圧力が続いています。取引の前提条件として、取得条項による取得・消却を求めます。',C.NEG],
 ['03','インサイダー取引規制','RIZAP社が放棄と売却を検討しているという情報は、夢展望の未公表の重要事実にあたりえます。中野は公表まで夢展望株を市場で買えません。RIZAP社との相対取引・TOBの扱いは弁護士の確認が要ります。',C.WARN],
 ['04','市場への売却圧力','合併後、ビジョン社23.5%と旧あどばる6社8.3%の計31.7%（約9.5億円）が市場に出ます。時価総額30億円の会社には重い量です。',C.WARN],
 ['05','繰越欠損金の使用制限','一人の株主が50%超を握ったうえで旧事業を縮小し大きな資金を入れると、法人税法57条の2で欠損金が使えなくなります。中野の持分を50%未満にとどめ、アパレルの急な撤退は避けます。',C.WARN]]
.forEach((r,i)=>{
  const y=1.66+i*0.98;
  card(s,0.7,y,11.9,0.9);
  num(s,1.0,y+0.22,0.46,r[0],r[3]);
  T(s,r[1],{x:1.65,y:y+0.08,w:10.7,h:0.28,fontSize:12.5,bold:true,color:C.INK});
  T(s,r[2],{x:1.65,y:y+0.38,w:10.7,h:0.46,fontSize:9.3,color:C.INK2,lineSpacingMultiple:1.05});
});
T(s,'いずれも事前の設計と前提条件で対処できる論点です。ただし01と03は、着手の前に専門家の確認が必要です。',
  {x:0.7,y:6.68,w:11.9,h:0.3,fontSize:10.5,bold:true,color:C.ACC});
s.addNotes('01と03が要注意。特にインサイダー。稲田さんの話の段階で中野はもう重要事実を知っている。');

/* 9 次のステップ */
s=slide(); light(s);
head(s,'次のステップ','判断に必要な5つの情報');
[['01','RIZAP社の希望価格と手順','保有株をいくらで、どの順番で手放したいのか。7億円の放棄は株式譲渡の前か後か。',C.ACC,'最優先'],
 ['02','夢展望の税務上の繰越欠損金','残高と期限。7億円の放棄で使った後にいくら残るかで、合併後の節税効果が決まります。',C.ACC,'要入手'],
 ['03','有利子負債の内訳','リース負債とRIZAP社からの借入、銀行借入の内訳。放棄後に残る借入の条件。',C.BLUE,'要入手'],
 ['04','RIZAPグループとの取引関係','グループへの経営指導料や共通費の負担があれば、離脱後に消える費用として利益の上振れ要因になります。',C.BLUE,'要確認'],
 ['05','第12回新株予約権の扱い','RIZAP社またはLong Corridor社が、取得・消却に応じるか。',C.BLUE,'要交渉']]
.forEach((r,i)=>{
  const y=1.7+i*0.92;
  card(s,0.7,y,11.9,0.8);
  num(s,1.05,y+0.18,0.44,r[0],r[3]);
  T(s,r[1],{x:1.72,y:y+0.12,w:6.0,h:0.28,fontSize:12.5,bold:true,color:C.INK});
  T(s,r[2],{x:1.72,y:y+0.42,w:9.0,h:0.32,fontSize:9.8,color:C.INK2});
  T(s,r[4],{x:10.9,y:y+0.26,w:1.4,h:0.28,fontSize:11,bold:true,color:r[3],align:'right'});
});
card(s,0.7,6.38,11.9,0.62,C.TINT_W,C.TINT_WL);
T(s,'稲田様との協議内容（希望価格・手順・時期）をいただければ、本資料の前提を差し替えて再計算します。',
  {x:1.05,y:6.52,w:11.2,h:0.34,fontSize:11.5,bold:true,color:C.WARN});
s.addNotes('稲田さんの録音の要点を共有してもらって数字を差し替える。');

p.writeFile({fileName:'あどばる_夢展望買収検討_20261029.pptx'}).then(()=>console.log('deckH written'));
