const D=require('./design.js')();
const {p,C,F,T,dark,light,head,card,dcard,stat,badge,num,dot,TH,THR,THC,tbl,cover,slide}=D;
let s;

/* 1 表紙 */
s=slide();
cover(s,'株式会社あどばる','2案の必要資金と実行確度',
 'ビジョン社の市場売却・重松氏側との同数確保を前提とした再算定',
 '2026年9月24日',
 [['ご説明先','株式会社あどばる 中村 新社長 ／ みずほ銀行 御中'],
  ['作成','株式会社あどばる 代表取締役 中野 邦人'],
  ['基準','第10期計算書類・会社四季報2026年9月号・株価229円']],
 '本資料は検討段階の想定値であり、法務・税務・会計上の助言ではありません');
s.addNotes('前提が固まった版。結論は「パートナー次第」。判断の分岐を明示する。');

/* 2 確定した前提 */
s=slide(); light(s);
head(s,'前提','今回、確定した4つの条件');
[['①','中野はダブルパインズを含めて同数','重松氏個人14.77%＋ダブルパインズ8.36%＝23.14%。この水準まで中野が取得する。',C.ACC],
 ['②','パートナーは未定','東京建物等の芙蓉グループに可能性はあるが定かではない。合併のほうが成立確度は高い。',C.WARN],
 ['③','ビジョン社の株式は市場で売却','中野が相対で買い取るのではなく、ビジョン社に市場で売却していただく。',C.BLUE],
 ['④','MBOは50.0%のまま','パートナーと同数でも、登録上は筆頭株主であることに変わりはない。',C.POS]]
.forEach((r,i)=>{
  const x=0.7+(i%2)*6.05, y=1.66+Math.floor(i/2)*1.55;
  card(s,x,y,5.85,1.4);
  T(s,r[0],{x:x+0.3,y:y+0.24,w:0.5,h:0.36,fontSize:20,bold:true,color:r[3]});
  T(s,r[1],{x:x+0.9,y:y+0.28,w:4.7,h:0.32,fontSize:14,bold:true,color:C.INK});
  T(s,r[2],{x:x+0.3,y:y+0.74,w:5.25,h:0.52,fontSize:10.5,color:C.INK2,lineSpacingMultiple:1.15});
});
card(s,0.7,4.85,11.9,1.5,C.TINT_A,C.TINT_AL);
T(s,'借入7.90億円の全額返済は、どちらの案でも必要です',{x:1.05,y:5.05,w:7,h:0.32,fontSize:13.5,bold:true,color:C.ACC});
T(s,'子会社でなくなる時点で返済義務が生じます。MBOでは増資4.90億＋みずほ様3.00億で返済し、有利子負債は6.07億まで減ります。合併では増資が入らないため7.90億全額をリファイナンスで手当てすることになり、あどばる由来の有利子負債は10.97億のまま残ります。この可否をみずほ様に打診します。',
  {x:1.05,y:5.42,w:11.2,h:0.75,fontSize:11.5,color:C.INK2,lineSpacingMultiple:1.2});
s.addNotes('②が今回の最大の変数。パートナーが立つかどうかで答えが変わる。');

/* 3 必要資金と到達点 */
s=slide(); light(s);
head(s,'比較','中野の必要資金と、到達する持分');
[['A','MBO（非上場で独立）',C.ACC,'6.10','億円','50.000%','中野陣営＝パートナーと同数',
  'パートナー 13.47億円','みずほ様 3.00億円（リファイ）'],
 ['B','合併（ビジョン株は市場売却）',C.BLUE,'3.97','億円','23.14%','重松氏側と同数・登録上の筆頭',
  '市場（売出し）4.45億円','みずほ様 7.90億円（リファイ）']]
.forEach((r,i)=>{
  const x=0.7+i*6.05;
  card(s,x,1.68,5.85,2.9,i?C.WHITE:C.TINT_A,i?C.LINE:C.TINT_AL);
  badge(s,x+0.35,1.92,0.72,r[0],r[2],0.34);
  T(s,r[1],{x:x+1.25,y:1.92,w:4.3,h:0.34,fontSize:14,bold:true,color:C.INK,valign:'middle'});
  T(s,'中野の必要資金',{x:x+0.35,y:2.5,w:2.6,h:0.26,fontSize:10,color:C.MUT});
  T(s,[{text:r[3],options:{fontSize:38,bold:true,color:r[2]}},
       {text:r[4],options:{fontSize:15,bold:true,color:r[2]}}],{x:x+0.35,y:2.74,w:2.6,h:0.7});
  T(s,'到達する持分',{x:x+3.3,y:2.5,w:2.2,h:0.26,fontSize:10,color:C.MUT});
  T(s,r[5],{x:x+3.3,y:2.76,w:2.2,h:0.5,fontSize:26,bold:true,color:r[2]});
  T(s,r[6],{x:x+0.35,y:3.5,w:5.15,h:0.28,fontSize:11,bold:true,color:C.INK});
  T(s,'同時に必要な他者の資金',{x:x+0.35,y:3.86,w:5.15,h:0.26,fontSize:10,color:C.MUT});
  T(s,'・'+r[7],{x:x+0.35,y:4.12,w:5.15,h:0.26,fontSize:11,color:C.INK2});
  T(s,'・'+r[8],{x:x+0.35,y:4.36,w:5.15,h:0.26,fontSize:11,color:C.INK2});
});
card(s,0.7,4.82,11.9,1.6,C.TINT_P,C.TINT_PL);
T(s,'中野の持ち出しは、合併のほうが2.13億円少なくて済みます',{x:1.05,y:5.02,w:7,h:0.32,fontSize:13.5,bold:true,color:C.POS});
T(s,'ただし手に入るものが違います。6.10億で買えるのは過半数の支配権、3.97億で買えるのは重松氏側と並ぶ23.14%です。合併では意思決定は引き続き重松氏との合意に依存します。\n一方で合併は第三者のエクイティを必要としないため、パートナーが立たなくても成立します。',
  {x:1.05,y:5.4,w:11.2,h:0.85,fontSize:11.5,color:C.INK2,lineSpacingMultiple:1.2});
s.addNotes('金額だけ見れば合併が安い。買えるものが違う点を正直に。');

/* 4 ビジョン株の受け皿 */
s=slide(); dark(s);
head(s,'B案の要','ビジョン株 8.43億円を、誰が引き取るか',true);
dcard(s,0.7,1.8,11.9,1.05);
T(s,'ビジョン社の持分 3,680,307株（18.43%）＝ 8.43億円',
  {x:1.05,y:2.05,w:7.5,h:0.35,fontSize:17,bold:true,color:C.WHITE});
T(s,'これを市場で売却していただく',{x:1.05,y:2.42,w:7.5,h:0.3,fontSize:11.5,color:C.DKTXT});
T(s,'株価 229円',{x:9.3,y:2.12,w:3.0,h:0.4,fontSize:18,bold:true,color:C.ACC2,align:'right'});
[[0.7,'中野が引き受ける','1,735,014','株','3.97億円','売出しの 47.1%',C.ACC2,
  '重松氏側と同数の23.14%に到達するために必要な株数と一致します。'],
 [6.75,'市場が吸収する','1,945,293','株','4.45億円','売出しの 52.9%','8FB0CC',
  '中野が半分近くを引き受けるため、市場が捌くのは4.45億円で済みます。']]
.forEach(r=>{
  dcard(s,r[0],3.05,5.85,2.5,r[6]===C.ACC2?C.ACC:null);
  T(s,r[1],{x:r[0]+0.35,y:3.28,w:5.15,h:0.32,fontSize:14,bold:true,color:r[6]});
  T(s,[{text:r[2],options:{fontSize:26,bold:true,color:C.WHITE}},
       {text:r[3],options:{fontSize:13,bold:true,color:C.WHITE}}],{x:r[0]+0.35,y:3.68,w:5.15,h:0.6});
  T(s,r[4],{x:r[0]+0.35,y:4.34,w:2.5,h:0.36,fontSize:19,bold:true,color:r[6]});
  T(s,r[5],{x:r[0]+3.0,y:4.4,w:2.5,h:0.3,fontSize:12,color:C.DKTXT,align:'right'});
  T(s,r[7],{x:r[0]+0.35,y:4.86,w:5.15,h:0.6,fontSize:10.5,color:C.DKTXT,lineSpacingMultiple:1.2});
});
T(s,'この組み方の利点は、市場が消化すべき金額が8.43億から4.45億に半減することです。時価総額45.7億の会社にとって、これは現実的な規模です。',
  {x:0.7,y:5.78,w:11.9,h:0.35,fontSize:12.5,bold:true,color:C.ACC2});
T(s,'中野は取締役のため、売出しへの応募は合併その他の重要事実が公表された後に限られます。売出しに応じる取得が公開買付規制の適用除外となるか、証券会社および弁護士の確認を要します。',
  {x:0.7,y:6.35,w:11.9,h:0.45,fontSize:9.5,color:'7F8E9B',lineSpacingMultiple:1.15});
s.addNotes('中野が売出しの47%を取る。これで市場の消化負担が半分になる。一石二鳥の構造。');

/* 5 合併後の株主構成 */
s=slide(); light(s);
head(s,'B案','取得後の株主構成と流通株式比率');
tbl(s,[
 [{text:'株主',options:TH},{text:'株数',options:THR},{text:'比率',options:THR},{text:'流通株式',options:THC}],
 [{text:'中野 邦人',options:{bold:true,fill:'F3E7EA'}},{text:'4,620,000 株',options:{align:'right',bold:true,fill:'F3E7EA'}},
  {text:'23.14%',options:{align:'right',bold:true,color:C.ACC,fill:'F3E7EA'}},{text:'除外（役員）',options:{align:'center',color:C.MUT,fill:'F3E7EA'}}],
 [{text:'重松 大輔',options:{bold:true}},{text:'2,950,000 株',options:{align:'right'}},{text:'14.77%',options:{align:'right'}},{text:'除外（役員）',options:{align:'center',color:C.MUT}}],
 [{text:'TKP',options:{bold:true}},{text:'2,550,000 株',options:{align:'right'}},{text:'12.77%',options:{align:'right'}},{text:'除外（事業法人）',options:{align:'center',color:C.MUT}}],
 [{text:'ダブルパインズ',options:{bold:true}},{text:'1,670,000 株',options:{align:'right'}},{text:'8.36%',options:{align:'right'}},{text:'除外',options:{align:'center',color:C.MUT}}],
 [{text:'旧あどばる法人6社',options:{bold:true}},{text:'1,294,969 株',options:{align:'right'}},{text:'6.49%',options:{align:'right'}},{text:'除外（事業法人）',options:{align:'center',color:C.MUT}}],
 [{text:'マイナビ・東京建物・佐々木氏',options:{bold:true}},{text:'620,000 株',options:{align:'right'}},{text:'3.11%',options:{align:'right'}},{text:'除外',options:{align:'center',color:C.MUT}}],
 [{text:'一般株主（市場吸収分を含む）',options:{bold:true,fill:'E8F0E9'}},{text:'6,261,193 株',options:{align:'right',bold:true,fill:'E8F0E9'}},
  {text:'31.36%',options:{align:'right',bold:true,color:C.POS,fill:'E8F0E9'}},{text:'流通株式',options:{align:'center',bold:true,color:C.POS,fill:'E8F0E9'}}],
 [{text:'合計',options:{bold:true,fill:'E8EDF2'}},{text:'19,966,162 株',options:{align:'right',bold:true,fill:'E8EDF2'}},
  {text:'100.00%',options:{align:'right',bold:true,fill:'E8EDF2'}},{text:'',options:{fill:'E8EDF2'}}]],
 {x:0.7,y:1.68,w:7.5,colW:[3.0,1.7,1.3,1.5],rowH:0.42,fontSize:11});
stat(s,8.5,1.75,4.1,'流通株式比率','31.36','%','東証グロース基準25%をクリア',C.POS);
stat(s,8.5,3.0,4.1,'中野の持分','23.14','%','重松氏側と同数・登録上の単独筆頭',C.ACC);
stat(s,8.5,4.25,4.1,'1/3までの余裕','10.19','pt','TOBは不要',C.INK);
card(s,8.5,5.4,4.1,1.0,C.TINT_P,C.TINT_PL);
T(s,'ビジョン株が市場に出るため、流通株式比率はむしろ改善します（21.62%→31.36%）。',
  {x:8.8,y:5.58,w:3.55,h:0.7,fontSize:10.5,color:C.INK2,lineSpacingMultiple:1.2});
T(s,'流通株式は、役員・10%以上保有者・事業法人の保有分を除いた試算値です。実際の算定は東証の定義によります。',
  {x:0.7,y:6.7,w:11.9,h:0.3,fontSize:9,color:C.MUT});
s.addNotes('中野が筆頭、重松側と同数、流通も基準クリア。条件は満たせている。');

/* 6 パートナー感度 */
s=slide(); light(s);
head(s,'A案の急所','パートナーの金額は、ほとんど削れません');
T(s,'中野6.10億円は固定、みずほ様のリファイを3.00億円とした場合',{x:0.7,y:1.66,w:11.9,h:0.3,fontSize:12,color:C.INK2});
tbl(s,[
 [{text:'パートナー',options:THR},{text:'増資 合計',options:THR},{text:'取引後 純資産',options:THR},
  {text:'自己資本比率',options:THR},{text:'判定',options:TH}],
 [{text:'13.47 億円',options:{align:'right',bold:true,fill:'F3E7EA'}},{text:'19.57 億円',options:{align:'right',fill:'F3E7EA'}},
  {text:'3.81 億円',options:{align:'right',bold:true,color:C.POS,fill:'F3E7EA'}},{text:'24.5%',options:{align:'right',bold:true,color:C.POS,fill:'F3E7EA'}},
  {text:'当初計画。銀行融資に耐える水準',options:{bold:true,color:C.POS,fill:'F3E7EA'}}],
 [{text:'12.60 億円',options:{align:'right',bold:true}},{text:'18.70 億円',options:{align:'right'}},
  {text:'2.94 億円',options:{align:'right'}},{text:'20.0%',options:{align:'right',bold:true}},'自己資本比率20%の下限'],
 [{text:'11.73 億円',options:{align:'right'}},{text:'17.83 億円',options:{align:'right'}},
  {text:'2.07 億円',options:{align:'right'}},{text:'15.0%',options:{align:'right',color:C.WARN}},{text:'ここが実務上の限界',options:{color:C.WARN}}],
 [{text:'10.00 億円',options:{align:'right'}},{text:'16.10 億円',options:{align:'right'}},
  {text:'0.34 億円',options:{align:'right',color:C.NEG}},{text:'2.8%',options:{align:'right',color:C.NEG}},{text:'債務超過は免れるが融資は不可',options:{color:C.NEG}}],
 [{text:'9.66 億円',options:{align:'right'}},{text:'15.76 億円',options:{align:'right'}},
  {text:'0.00 億円',options:{align:'right',color:C.NEG}},{text:'0.0%',options:{align:'right',color:C.NEG}},{text:'これ未満は債務超過のまま',options:{color:C.NEG}}]],
 {x:0.7,y:2.05,w:11.9,colW:[2.2,2.0,2.2,2.0,3.5],rowH:0.44,fontSize:11.5});
card(s,0.7,4.95,5.85,1.45,C.TINT_A,C.TINT_AL);
T(s,'なぜ削れないのか',{x:1.0,y:5.13,w:5.2,h:0.3,fontSize:13,bold:true,color:C.ACC});
T(s,'自己株式取得12.72億円は純資産から直接引かれます。増資を1億減らせば、純資産もそのまま1億減ります。借入を厚くしても現金と負債が同額増えるだけで、純資産は1円も改善しません。',
  {x:1.0,y:5.48,w:5.25,h:0.8,fontSize:10.5,color:C.INK2,lineSpacingMultiple:1.2});
card(s,6.75,4.95,5.85,1.45,C.TINT_W,C.TINT_WL);
T(s,'つまり、A案は「12億円以上か、ゼロか」',{x:7.05,y:5.13,w:5.2,h:0.3,fontSize:13,bold:true,color:C.WARN});
T(s,'パートナーの規模を小さくして実行する、という折衷案は成立しません。東京建物等から12億円以上を引き出せるかどうかが、A案の成否そのものです。',
  {x:7.05,y:5.48,w:5.25,h:0.8,fontSize:10.5,color:C.INK2,lineSpacingMultiple:1.2});
T(s,'純資産＝増資額−15.76億円（クロージング直前純資産△2.59億−自己株式取得12.72億−費用0.45億）として試算しています。',
  {x:0.7,y:6.7,w:11.9,h:0.3,fontSize:9,color:C.MUT});
s.addNotes('これが今日一番重要な発見。パートナーは減らせない。12億以上かゼロか。');

/* 7 メリデメ */
s=slide(); light(s);
head(s,'比較','それぞれのメリットとデメリット');
[['A','MBO',C.ACC,C.TINT_A,C.TINT_AL,
  ['過半数50.0%で意思決定を完全に握れる','有利子負債が6.07億まで減る（唯一の案）','自己資本比率24.9%で銀行の稟議に乗る',
   'ビジョン社の受取17.31億は合併案より約1億高い','のれんが発生せず利益が目減りしない'],
  ['パートナー12億円以上が絶対条件で、目処が立っていない','非上場のため株式の換金性がない','会社法の手続きが4段階必要で時間がかかる']],
 ['B','合併',C.BLUE,C.WHITE,C.LINE,
  ['第三者のエクイティが不要で、単独で成立する','中野の持ち出しが3.97億と2.13億少ない','上場株となり換金性がある',
   '流通株式比率31.36%で上場維持基準を満たす','先方からの提案のため交渉が進めやすい'],
  ['持分23.14%では意思決定を握れない','有利子負債10.97億がそのまま残る（リファイのみ）','のれん22.09億の償却で年1.10〜2.21億の減益',
   '競合TKPが12.77%の株主として残る','重松氏の会長退任は口頭の前提にとどまる']]]
.forEach((r,i)=>{
  const x=0.7+i*6.05;
  card(s,x,1.66,5.85,4.95,r[3],r[4]);
  badge(s,x+0.35,1.88,0.72,r[0],r[2],0.34);
  T(s,r[1],{x:x+1.25,y:1.88,w:4.3,h:0.34,fontSize:15,bold:true,color:C.INK,valign:'middle'});
  T(s,'メリット',{x:x+0.35,y:2.40,w:5.15,h:0.24,fontSize:11,bold:true,color:C.POS});
  r[5].forEach((t,j)=>{
    dot(s,x+0.35,2.77+j*0.33,C.POS,0.13);
    T(s,t,{x:x+0.62,y:2.72+j*0.33,w:4.88,h:0.32,fontSize:9.2,color:C.INK2});
  });
  const yy=2.72+r[5].length*0.33+0.08;
  T(s,'デメリット',{x:x+0.35,y:yy,w:5.15,h:0.24,fontSize:11,bold:true,color:C.NEG});
  r[6].forEach((t,j)=>{
    dot(s,x+0.35,yy+0.37+j*0.33,C.NEG,0.13);
    T(s,t,{x:x+0.62,y:yy+0.32+j*0.33,w:4.88,h:0.32,fontSize:9.2,color:C.INK2});
  });
});
s.addNotes('Aは「握れるが調達が立たない」、Bは「立つが握れない」。');

/* 8 判断の分岐 */
s=slide(); dark(s);
head(s,'判断','答えは、パートナー次第です',true);
dcard(s,0.7,1.7,11.9,1.3,C.ACC);
T(s,'東京建物等から12億円以上のエクイティを引き出せるか。この一点で結論が変わります。',
  {x:1.05,y:1.95,w:11.2,h:0.4,fontSize:19,bold:true,color:C.WHITE});
T(s,'金額の多寡ではなく、調達が成立するかどうかの問題です。折衷案がない以上、先に確かめるべきはここです。',
  {x:1.05,y:2.42,w:11.2,h:0.35,fontSize:12,color:'B9C4CF'});
[[0.7,'引き出せる場合','MBO（A案）を実行',C.ACC,
  ['過半数50.0%と、有利子負債6.07億を同時に取りにいく','ビジョン社にも最も良い条件を提示できる','合併の選択肢は、独立後にあらためて交渉できる']],
 [6.75,'引き出せない場合','合併（B案）で条件を取りにいく',C.BLUE,
  ['単独で成立し、ビジョン社の出口と筆頭株主化は達成できる','評価額20億以上・基準株価3ヶ月平均・のれん負担の3点を交渉','将来の持分拡大は重松氏との覚書で担保する']]]
.forEach(g=>{
  dcard(s,g[0],3.2,5.85,2.9,g[3]===C.ACC?C.ACC:null);
  T(s,g[1],{x:g[0]+0.35,y:3.42,w:5.15,h:0.3,fontSize:12,color:C.DKTXT});
  T(s,g[2],{x:g[0]+0.35,y:3.72,w:5.15,h:0.4,fontSize:18,bold:true,color:g[3]===C.ACC?C.ACC2:'8FB0CC'});
  g[4].forEach((t,j)=>{
    dot(s,g[0]+0.35,4.42+j*0.62,g[3]===C.ACC?C.ACC2:'8FB0CC',0.14);
    T(s,t,{x:g[0]+0.65,y:4.34+j*0.62,w:4.85,h:0.58,fontSize:10.5,color:C.DKTXT,lineSpacingMultiple:1.15});
  });
});
T(s,'合併の協議は止めずに並走させます。A案が立てばそちらを優先し、立たなければB案に進む、という順序です。',
  {x:0.7,y:6.4,w:11.9,h:0.35,fontSize:12.5,bold:true,color:C.ACC2});
s.addNotes('二者択一ではなく、パートナー調達の可否で決まる分岐。並走が正解。');

/* 9 次のアクション */
s=slide(); light(s);
head(s,'次のステップ','いま動かすべき4件');
[['01','東京建物等への打診','12億円以上のエクイティ引受が可能かどうかを、早い段階で確かめます。金額を下げた折衷案は成立しないため、規模を明示して打診します。',C.ACC,'期限を切る'],
 ['02','みずほ銀行様への打診','A案なら3.00億円、B案なら7.90億円のリファイナンス。案によって金額が変わるため、両方の前提でご相談します。',C.ACC,'両案で相談'],
 ['03','ビジョン社との合意','株式は市場売却、借入は持分希薄化と同時に全額返済。この2点を先に文書で確認します。',C.BLUE,'書面化'],
 ['04','重松氏との覚書','会長就任の時期、譲渡する株数、価格の考え方。口頭の前提のままでは資金計画として銀行に持ち込めません。',C.BLUE,'取得中']]
.forEach((r,i)=>{
  const y=1.7+i*1.22;
  card(s,0.7,y,11.9,1.08);
  num(s,1.05,y+0.24,0.6,r[0],r[3]);
  T(s,r[1],{x:1.9,y:y+0.2,w:4.2,h:0.32,fontSize:14.5,bold:true,color:C.INK});
  T(s,r[2],{x:1.9,y:y+0.56,w:8.6,h:0.44,fontSize:10.5,color:C.INK2,lineSpacingMultiple:1.15});
  T(s,r[4],{x:10.7,y:y+0.38,w:1.6,h:0.32,fontSize:12,bold:true,color:r[3],align:'right'});
});
card(s,0.7,6.62,11.9,0.0,C.WHITE,C.WHITE);
T(s,'本資料は検討段階の想定値です。流通株式比率・公開買付規制・インサイダー取引規制の適用は、東証および証券会社・弁護士の確認を要します。',
  {x:0.7,y:6.7,w:11.9,h:0.3,fontSize:9,color:C.MUT});
s.addNotes('①が最優先。ここが決まらないと他が動かない。期限を切って打診する。');

p.writeFile({fileName:'あどばる資本政策_2案の必要資金と実行確度_20260924.pptx'}).then(()=>console.log('deckC v2 written'));
