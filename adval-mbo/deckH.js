const D=require('./design.js')();
const {p,C,F,T,dark,light,head,card,dcard,stat,badge,num,dot,TH,THR,THC,tbl,cover,slide}=D;
let s;

/* 1 表紙 */
s=slide();
cover(s,'株式会社あどばる','夢展望（3185）の買収検討',
 '面談結果を反映した改訂版 ─ RIZAP社保有株30%の取得と、あどばるとの関係',
 '2026年10月29日',
 [['作成','株式会社あどばる 代表取締役 中野 邦人'],
  ['前提','面談で出た条件（30%を約3億円・8億円の債権放棄）と夢展望社の公開情報'],
  ['注記','面談記録は音声の文字起こしのため、数字の一部は聞き取りの解釈を含みます']],
 '試算であり、法務・税務・会計上の助言ではありません');
s.addNotes('面談で条件が具体化した。前回の「44.68%をTOBで」から「30%を3億で」に変わった。');

/* 2 面談で分かったこと */
s=slide(); light(s);
head(s,'面談結果','前回の想定から、ここが変わりました');
tbl(s,[
 [{text:'項目',options:TH},{text:'前回の想定',options:THC},{text:'面談で出た内容',options:Object.assign({align:'center'},TH,{fill:C.ACC})},{text:'影響',options:THC}],
 [{text:'RIZAP株の売り方',options:{bold:true}},{text:'44.68%全部（TOBが必要）',options:{align:'center',color:C.MUT}},{text:'30%ブロックを約3億円',options:{align:'center',bold:true}},{text:'3分の1未満のためTOB不要',options:{align:'center',color:C.POS}}],
 [{text:'取得の時期',options:{bold:true}},{text:'すぐに',options:{align:'center',color:C.MUT}},{text:'新株予約権の行使後（12月以降）',options:{align:'center',bold:true}},{text:'時価総額10億円前後を想定',options:{align:'center'}}],
 [{text:'借入金',options:{bold:true}},{text:'13.5億円（推定）',options:{align:'center',color:C.MUT}},{text:'17億円（銀行9億＋RIZAP 8億）',options:{align:'center',bold:true}},{text:'総資産18億円に対し過大',options:{align:'center',color:C.NEG}}],
 [{text:'債権放棄',options:{bold:true}},{text:'7億円',options:{align:'center',color:C.MUT}},{text:'RIZAP分の8億円',options:{align:'center',bold:true}},{text:'要確認（7億か8億か）',options:{align:'center',color:C.WARN}}],
 [{text:'今期の業績',options:{bold:true}},{text:'会社予想 営業△0.30億円',options:{align:'center',color:C.MUT}},{text:'今期の黒字化は難しい',options:{align:'center',bold:true}},{text:'販管費0.5〜1億削減でトントン',options:{align:'center'}}],
 [{text:'現預金',options:{bold:true}},{text:'6.29億円',options:{align:'center',color:C.MUT}},{text:'約6億円',options:{align:'center',bold:true}},{text:'資金繰りは当面回る',options:{align:'center',color:C.POS}}]],
 {x:0.7,y:1.68,w:11.9,colW:[2.2,3.0,3.5,3.2],rowH:0.44,fontSize:11});
card(s,0.7,4.95,5.85,1.55,C.TINT_B,C.TINT_BL);
T(s,'面談で出た再建の打ち手',{x:1.0,y:5.12,w:5.2,h:0.3,fontSize:13,bold:true,color:C.BLUE});
T(s,'・各地の店舗の解約・集約（第三者が入ったほうが進めやすい）\n・VTuberやアイドルとのIPコラボ、海外展開\n・RIZAP社による8億円の放棄を前提に、みずほ銀行の融資で回す',
  {x:1.0,y:5.48,w:5.25,h:0.95,fontSize:10.5,color:C.INK2,lineSpacingMultiple:1.2});
card(s,6.75,4.95,5.85,1.55,C.TINT_W,C.TINT_WL);
T(s,'面談での評価',{x:7.05,y:5.12,w:5.2,h:0.3,fontSize:13,bold:true,color:C.WARN});
T(s,'「RIZAP社からのお土産（放棄）がないと厳しい」「株価が下がり、現金も入り、トントンまで持っていけるなら可能性はある」という見立てでした。',
  {x:7.05,y:5.48,w:5.25,h:0.95,fontSize:10.5,color:C.INK2,lineSpacingMultiple:1.2});
s.addNotes('放棄額は7億と8億で食い違い。文字起こしの聞き違いの可能性もあるので確認する。');

/* 3 結論 */
s=slide(); light(s);
head(s,'結論','3億円で30%は「買える値段」です');
card(s,0.7,1.62,11.9,1.45,C.TINT_A,C.TINT_AL);
T(s,'30%ブロックならTOBが不要で、放棄後の純資産に対してPBR1.1〜1.3倍です',
  {x:1.05,y:1.84,w:11.2,h:0.4,fontSize:18,bold:true,color:C.ACC});
T(s,'8億円の放棄後、1株純資産は40〜43円。時価総額10億円で30%を取得すれば約3億円で、純資産に近い水準です。中野は単独の筆頭株主（30%）となり、RIZAP社の残りは10〜15%に下がります。ただし利益は出ていないため、この3億円が報われるかは、中野が再建を担えるかで決まります。',
  {x:1.05,y:2.3,w:11.2,h:0.65,fontSize:11.5,color:C.INK2,lineSpacingMultiple:1.2});
tbl(s,[
 [{text:'',options:TH},{text:'夢展望 30%取得',options:Object.assign({align:'center'},TH,{fill:C.ACC})},{text:'スマサポ案（PlanD）',options:THC}],
 [{text:'中野の負担',options:{bold:true}},{text:'約3.0億円（時価総額10億円の場合）',options:{align:'center',bold:true,color:C.POS}},{text:'0〜6.2億円',options:{align:'center'}}],
 [{text:'中野の持分',options:{bold:true}},{text:'30%（単独の筆頭）',options:{align:'center',bold:true,color:C.POS}},{text:'15.7〜33.3%',options:{align:'center'}}],
 [{text:'公開買付け',options:{bold:true}},{text:'不要（3分の1未満）',options:{align:'center',bold:true,color:C.POS}},{text:'33%超を狙う場合は売出し応募等の工夫が必要',options:{align:'center'}}],
 [{text:'相手の利益',options:{bold:true}},{text:'営業△0.3億〜＋0.7億円（コスト削減次第）',options:{align:'center',color:C.NEG}},{text:'営業2.30億円（会社予想）',options:{align:'center',bold:true,color:C.POS}}],
 [{text:'事業シナジー',options:{bold:true}},{text:'限定的（IPコラボ・店舗の知見）',options:{align:'center',color:C.NEG}},{text:'強い（物件の仕入れ）',options:{align:'center',bold:true,color:C.POS}}]],
 {x:0.7,y:3.3,w:11.9,colW:[2.6,4.65,4.65],rowH:0.42,fontSize:11});
T(s,'両方を同時に進めるには資金が足りません。夢展望は「再建して売る」投資、スマサポは「一緒に伸ばす」合併。どちらを本筋にするかを先に決める必要があります。',
  {x:0.7,y:5.95,w:11.9,h:0.6,fontSize:12,bold:true,color:C.ACC,lineSpacingMultiple:1.15});
s.addNotes('値段は悪くない。問題は再建の手間と、スマサポ案との資金の取り合い。');

/* 4 放棄後の姿 */
s=slide(); dark(s);
head(s,'8億円の債権放棄','放棄後の夢展望',true);
[['純資産','7.53','億円','△0.47億円から回復',C.ACC2],['1株純資産','40〜43','円','新株予約権の行使前〜後','8FB0CC'],
 ['借入金','9','億円','17億円からRIZAP分8億円が消える','8FB0CC'],['ネット有利子負債','約3','億円','現預金約6億円を差し引き',C.ACC2]]
.forEach((r,i)=>{
  const x=0.7+i*3.02;
  dcard(s,x,1.75,2.85,1.7);
  T(s,r[0],{x:x+0.25,y:1.92,w:2.4,h:0.26,fontSize:10.5,color:C.DKTXT});
  T(s,[{text:r[1],options:{fontSize:30,bold:true,color:r[4]}},{text:r[2],options:{fontSize:13,bold:true,color:r[4]}}],{x:x+0.25,y:2.2,w:2.4,h:0.6});
  T(s,r[3],{x:x+0.25,y:2.9,w:2.4,h:0.45,fontSize:9.5,color:C.DKTXT,lineSpacingMultiple:1.1});
});
[['税務','債務免除益への課税はほぼ生じない見込み','8月の減資で資本金5,000万円の中小法人となったため、繰越欠損金で全額相殺できる見込みです。欠損金の残高は要確認です。'],
 ['会計','連結PLの利益にはならない可能性','IFRSでは、株主の立場で行う債権放棄は資本取引として扱われます。面談では「特別利益が立つ」との話でしたが、連結では資本剰余金の増加になる見込みです。'],
 ['収益力','本業の赤字は残る','消えるのは借入8億円分の利息（年0.2億円程度）だけです。トントンにするには販管費を0.5〜1億円削る必要があります。']]
.forEach((r,i)=>{
  const x=0.7+i*4.0;
  dcard(s,x,3.7,3.85,2.75);
  badge(s,x+0.25,3.9,0.8,r[0],C.ACC,0.3);
  T(s,r[1],{x:x+0.25,y:4.32,w:3.35,h:0.6,fontSize:12.5,bold:true,color:C.WHITE,lineSpacingMultiple:1.1});
  T(s,r[2],{x:x+0.25,y:5.0,w:3.35,h:1.35,fontSize:9.8,color:C.DKTXT,lineSpacingMultiple:1.2});
});
T(s,'借入17億円は総資産18億円とほぼ同額です。放棄がなければ、この会社は買えません。',
  {x:0.7,y:6.65,w:11.9,h:0.32,fontSize:12,bold:true,color:C.ACC2});
s.addNotes('放棄はBSの前提条件。8億か7億かで純資産が1億違う。');

/* 5 30%ブロックの採算 */
s=slide(); light(s);
head(s,'30%ブロックの採算','時価総額がいくらで取得するか');
tbl(s,[
 [{text:'取得時の時価総額',options:TH},{text:'1株',options:THR},{text:'30%の取得額',options:THR},{text:'PBR（放棄後）',options:THR},{text:'RIZAP社の残り',options:THR}],
 [{text:'10億円',options:{bold:true,fill:'F3E7EA'}},{text:'48.6円',options:{align:'right',fill:'F3E7EA'}},{text:'3.00億円',options:{align:'right',bold:true,color:C.POS,fill:'F3E7EA'}},{text:'1.12倍',options:{align:'right',bold:true,fill:'F3E7EA'}},{text:'10.5%',options:{align:'right',fill:'F3E7EA'}}],
 [{text:'12億円',options:{bold:true}},{text:'58.4円',options:{align:'right'}},{text:'3.60億円',options:{align:'right'}},{text:'1.34倍',options:{align:'right'}},{text:'10.5%',options:{align:'right'}}],
 [{text:'15億円（現在の水準）',options:{bold:true}},{text:'72.9円',options:{align:'right'}},{text:'4.50億円',options:{align:'right',color:C.NEG}},{text:'1.68倍',options:{align:'right',color:C.NEG}},{text:'10.5%',options:{align:'right'}}]],
 {x:0.7,y:1.68,w:11.9,colW:[3.1,1.8,2.4,2.3,2.3],rowH:0.44,fontSize:11.5});
T(s,'新株予約権が全部行使された後（発行済20,562,500株）で計算。30%は6,168,750株です。',
  {x:0.7,y:3.5,w:11.9,h:0.3,fontSize:9.5,color:C.MUT});
card(s,0.7,3.95,5.85,2.55,C.TINT_W,C.TINT_WL);
T(s,'「時価総額10億円」と「全部行使」は両立しません',{x:1.0,y:4.13,w:5.2,h:0.3,fontSize:13,bold:true,color:C.WARN});
T(s,'Long Corridor社の新株予約権は下限が73円です。全部行使されるなら株価は73円以上で、時価総額は15億円前後になります。株価が下がって10億円（約49円）になれば行使は止まり、未行使分が売り圧力として残ります。\n\nまた開示上のコミットは「12月末までに10,000個（100万株）」で、217万株全部ではありません。',
  {x:1.0,y:4.5,w:5.25,h:1.9,fontSize:10.2,color:C.INK2,lineSpacingMultiple:1.2});
card(s,6.75,3.95,5.85,2.55,C.TINT_P,C.TINT_PL);
T(s,'交渉のポイント',{x:7.05,y:4.13,w:5.2,h:0.3,fontSize:13,bold:true,color:C.POS});
T(s,'・価格は「時価総額」ではなく「1株あたり約50円」で固定する\n・8億円の放棄をクロージングの前提条件にする\n・未行使の新株予約権の取得・消却を求める\n・取得は3分の1未満（30%）にとどめ、TOBを避ける\n・RIZAP社の残り10〜15%の売却方法（市場か相対か）を決めておく',
  {x:7.05,y:4.5,w:5.25,h:1.9,fontSize:10.2,color:C.INK2,lineSpacingMultiple:1.25});
s.addNotes('時価総額で決めると株価次第で変わる。1株単価で握るべき。');

/* 6 単体で持つか、合併するか */
s=slide(); light(s);
head(s,'出口の考え方','単体で再建して売るか、あどばると合併するか');
card(s,0.7,1.66,5.85,4.85);
badge(s,1.0,1.88,2.2,'A　単体で再建',C.BLUE,0.34);
T(s,'中野が30%を持ち、夢展望単体の再建で株価を上げる',{x:1.0,y:2.35,w:5.25,h:0.55,fontSize:12.5,bold:true,color:C.INK,lineSpacingMultiple:1.1});
tbl(s,[
 [{text:'営業利益',options:TH},{text:'時価総額（PER17倍）',options:THR},{text:'30%の価値',options:THR},{text:'取得比',options:THR}],
 [{text:'0.5億円',options:{bold:true}},{text:'5.9億円',options:{align:'right'}},{text:'1.78億円',options:{align:'right',color:C.NEG}},{text:'0.6倍',options:{align:'right',color:C.NEG}}],
 [{text:'1.0億円',options:{bold:true}},{text:'11.9億円',options:{align:'right'}},{text:'3.57億円',options:{align:'right'}},{text:'1.2倍',options:{align:'right'}}],
 [{text:'2.5億円',options:{bold:true}},{text:'29.8億円',options:{align:'right'}},{text:'8.92億円',options:{align:'right',color:C.POS}},{text:'3.0倍',options:{align:'right',bold:true,color:C.POS}}]],
 {x:1.0,y:3.05,w:5.25,colW:[1.2,1.65,1.35,1.05],rowH:0.38,fontSize:10.5});
T(s,'営業利益1億円で元が取れ、2.5億円まで伸ばせれば3倍。再建の手腕がそのまま投資成果になります。',
  {x:1.0,y:4.75,w:5.25,h:0.7,fontSize:10.5,color:C.INK2,lineSpacingMultiple:1.2});
card(s,6.75,1.66,5.85,4.85,C.TINT_A,C.TINT_AL);
badge(s,7.05,1.88,2.6,'B　あどばると合併',C.ACC,0.34);
T(s,'30%取得の後に、あどばるを合併させる',{x:7.05,y:2.35,w:5.25,h:0.55,fontSize:12.5,bold:true,color:C.INK});
tbl(s,[
 [{text:'夢展望の評価',options:TH},{text:'あどばる側',options:THR},{text:'中野の持分',options:THR}],
 [{text:'10億円',options:{bold:true}},{text:'60.0%',options:{align:'right',color:C.NEG}},{text:'34.0%',options:{align:'right',bold:true}}],
 [{text:'12億円',options:{bold:true}},{text:'55.6%',options:{align:'right',color:C.NEG}},{text:'33.7%',options:{align:'right',bold:true}}],
 [{text:'15億円',options:{bold:true}},{text:'50.0%',options:{align:'right'}},{text:'33.4%',options:{align:'right',bold:true}}]],
 {x:7.05,y:3.05,w:5.25,colW:[1.95,1.65,1.65],rowH:0.38,fontSize:10.5});
T(s,'中野は3分の1超を確保できますが、夢展望が安いほどあどばる側が50%を超え、東証の実質的存続性の審査（裏口上場の扱い）にかかる可能性が高まります。合算の営業利益は1.7〜2.7億円で、スマサポ案の4.3億円に届きません。',
  {x:7.05,y:4.75,w:5.25,h:1.65,fontSize:10.2,color:C.INK2,lineSpacingMultiple:1.2});
s.addNotes('Aは純投資、Bは事業統合。Bは裏口上場の審査が論点。');

/* 7 シナジー */
s=slide(); dark(s);
head(s,'シナジー','面談で出た打ち手と、あどばるが持ち込めるもの',true);
[['再建','店舗の解約・集約','各地の店舗に地域ごとの費用がかかっています。創業以来のしがらみがない第三者のほうが、解約や集約を進めやすいとの指摘でした。','販管費0.5〜1億円'],
 ['事業','IPコラボの拡大','10〜30代女性の顧客層に、VTuberやアイドルとのコラボ商品を当てる。唯一黒字のトイ事業と同じ型です。海外にも販路があります。','売上の上積み'],
 ['事業','あどばるのスペースでの体験','コラボカフェやポップアップを自社スペースで開けます。トレセンテの顧客にはプロポーズや二次会の会場を案内できます。','小〜中'],
 ['税務','繰越欠損金','8億円の放棄で使った後に残る欠損金で、再建後の利益や合併後のあどばる事業の利益を相殺できる可能性があります。','残高次第'],
 ['会計','IFRS','のれんを償却しないため、合併した場合もスマサポ案のような年0.88億円の償却負担がありません。','中'],
 ['財務','みずほ銀行との関係','放棄後は借入9億円・現預金6億円。面談でも、みずほ銀行の融資で回しながら再建する形が想定されていました。','中']]
.forEach((r,i)=>{
  const x=0.7+(i%3)*4.0, y=1.8+Math.floor(i/3)*2.45;
  dcard(s,x,y,3.85,2.25,i<2?C.ACC:null);
  T(s,r[0],{x:x+0.25,y:y+0.2,w:1.0,h:0.26,fontSize:10,bold:true,color:C.ACC2});
  T(s,r[3],{x:x+1.4,y:y+0.2,w:2.2,h:0.26,fontSize:9.5,bold:true,color:'E8B96B',align:'right'});
  T(s,r[1],{x:x+0.25,y:y+0.5,w:3.35,h:0.34,fontSize:12.5,bold:true,color:C.WHITE});
  T(s,r[2],{x:x+0.25,y:y+0.92,w:3.35,h:1.25,fontSize:9.5,color:C.DKTXT,lineSpacingMultiple:1.2});
});
s.addNotes('本命は上段の2つ（店舗の集約とIPコラボ）。あどばるとの直接のシナジーは小さい。');

/* 8 リスク */
s=slide(); light(s);
head(s,'リスク','この案件に固有の論点');
[['01','再建が進まなければ、3億円は目減りする','10年連続の赤字で、第1四半期も営業損失0.51億円。会社予想の△0.30億円も楽観的な可能性があります。営業利益0.5億円どまりなら、30%の価値は1.8億円程度です。',C.NEG],
 ['02','新株予約権の売り圧力','Long Corridor社の未行使分が残る限り、株価は下限73円付近で重くなります。取得の前提条件として、取得・消却を求めます。',C.NEG],
 ['03','インサイダー取引規制','RIZAP社の放棄と売却の意向は、夢展望の未公表の重要事実にあたりえます。公表まで市場で夢展望株は買えません。RIZAP社との相対取引の扱いは弁護士の確認が要ります。',C.WARN],
 ['04','実質的存続性の審査（合併する場合）','夢展望の評価が15億円を下回ると、あどばる側が50%を超えます。合併を選ぶなら比率の設計と東証への事前相談が必要です。',C.WARN],
 ['05','資金と時間の取り合い','中野の手元資金と再建に割く時間は、スマサポ案と重なります。両方を同時に進めるのは現実的ではありません。',C.WARN]]
.forEach((r,i)=>{
  const y=1.66+i*0.98;
  card(s,0.7,y,11.9,0.9);
  num(s,1.0,y+0.22,0.46,r[0],r[3]);
  T(s,r[1],{x:1.65,y:y+0.08,w:10.7,h:0.28,fontSize:12.5,bold:true,color:C.INK});
  T(s,r[2],{x:1.65,y:y+0.38,w:10.7,h:0.46,fontSize:9.3,color:C.INK2,lineSpacingMultiple:1.05});
});
T(s,'01と05が判断の分かれ目です。03は着手の前に専門家の確認が必要です。',
  {x:0.7,y:6.68,w:11.9,h:0.3,fontSize:10.5,bold:true,color:C.ACC});
s.addNotes('最大のリスクは再建が進まないこと。資金と時間の取り合いも見落とせない。');

/* 9 次のステップ */
s=slide(); light(s);
head(s,'次のステップ','RIZAP社に確認すること');
[['01','放棄額は7億円か8億円か','借入17億円のうちRIZAP社分は8億円と聞いています。放棄は全額か、クロージングの前か後か。',C.ACC,'最優先'],
 ['02','価格を1株単価で','「時価総額10億円で30%を3億円」ではなく、1株約50円で固定できるか。',C.ACC,'最優先'],
 ['03','銀行借入9億円の条件','RIZAP社の連帯保証が外れた後も、借り換えなしで継続できるか。',C.BLUE,'要確認'],
 ['04','店舗の契約一覧と粗利・販管費','解約できる店舗と違約金。面談で出た「粗利4億円・販管費5億円」がどの期間の数字か。',C.BLUE,'要入手'],
 ['05','繰越欠損金の残高と期限','放棄で使った後にいくら残るか。再建後の利益をどこまで相殺できるか。',C.BLUE,'要入手']]
.forEach((r,i)=>{
  const y=1.7+i*0.92;
  card(s,0.7,y,11.9,0.8);
  num(s,1.05,y+0.18,0.44,r[0],r[3]);
  T(s,r[1],{x:1.72,y:y+0.12,w:6.0,h:0.28,fontSize:12.5,bold:true,color:C.INK});
  T(s,r[2],{x:1.72,y:y+0.42,w:9.0,h:0.32,fontSize:9.8,color:C.INK2});
  T(s,r[4],{x:10.9,y:y+0.26,w:1.4,h:0.28,fontSize:11,bold:true,color:r[3],align:'right'});
});
card(s,0.7,6.38,11.9,0.62,C.TINT_A,C.TINT_AL);
T(s,'あわせて、夢展望を「単体で再建する純投資」とするか「あどばるとの合併」とするかを、スマサポ案との優先順位とともに決めます。',
  {x:1.05,y:6.52,w:11.2,h:0.34,fontSize:11,bold:true,color:C.ACC});
s.addNotes('01と02を先に握る。そのうえでスマサポ案との優先順位を決める。');

p.writeFile({fileName:'あどばる_夢展望買収検討_20261029.pptx'}).then(()=>console.log('deckH v2 written'));
