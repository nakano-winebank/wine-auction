const D=require('./design.js')();
const {p,C,F,T,dark,light,head,card,dcard,stat,badge,num,dot,TH,THR,THC,tbl,cover,slide}=D;
let s;

/* 1 表紙 */
s=slide();
cover(s,'株式会社あどばる','必須条件を固定した資金比較',
 'ビジョン社の出口・借入の同時返済・中野の筆頭株主化を、すべて前提とした場合',
 '2026年9月24日',
 [['ご説明先','株式会社あどばる 中村 新社長 ／ みずほ銀行 御中'],
  ['作成','株式会社あどばる 代表取締役 中野 邦人'],
  ['基準','第10期計算書類・会社四季報2026年9月号・株価229円']],
 '本資料は検討段階の想定値であり、法務・税務・会計上の助言ではありません');
s.addNotes('3つの条件を外せないものとして固定したうえで、必要資金だけを比べる資料。');

/* 2 前提 */
s=slide(); light(s);
head(s,'前提','外せない3つの条件');
[['①','ビジョン社の株式の出口','どちらの道を選んでも、最終的にビジョン社には株主から抜けていただく。保有を残したまま終わる選択肢はない。',C.ACC],
 ['②','借入7.90億円の全額返済','子会社でなくなった時点と同時に全額返済する。分割・据置・一部残置はしない。',C.ACC],
 ['③','中野が筆頭株主','少なくとも重松氏と同数。合併する場合も、MBOの場合も、名簿の一番上に立つ。',C.ACC]]
.forEach((r,i)=>{
  const x=0.7+i*4.0;
  card(s,x,1.66,3.85,1.95,C.TINT_A,C.TINT_AL);
  T(s,r[0],{x:x+0.3,y:1.86,w:0.6,h:0.4,fontSize:22,bold:true,color:r[3]});
  T(s,r[1],{x:x+0.95,y:1.9,w:2.65,h:0.35,fontSize:14.5,bold:true,color:C.INK});
  T(s,r[2],{x:x+0.3,y:2.42,w:3.25,h:1.05,fontSize:10.5,color:C.INK2,lineSpacingMultiple:1.2});
});
T(s,'この3つを固定すると、選択肢は次の3つに絞られます',{x:0.7,y:3.85,w:11.9,h:0.32,fontSize:14,bold:true,color:C.INK});
[['A','MBO','非上場のまま独立。増資19.57億で全株主を整理し、ビジョン借入も同時に完済する。',C.ACC],
 ['B-1','合併 ＋ 中野がビジョン株を買取','合併後、ビジョン社の持分18.43%を中野が丸ごと引き取って筆頭になる。',C.BLUE],
 ['B-2','合併 ＋ ビジョン株を市場へ売出し','ビジョン社の持分は市場に放出。中野は重松氏と同数まで買い増すだけにとどめる。',C.MUT]]
.forEach((r,i)=>{
  const y=4.3+i*0.78;
  card(s,0.7,y,11.9,0.68);
  badge(s,1.0,y+0.16,0.75,r[0],r[3],0.36);
  T(s,r[1],{x:1.95,y:y+0.18,w:3.5,h:0.32,fontSize:13.5,bold:true,color:C.INK});
  T(s,r[2],{x:5.6,y:y+0.2,w:6.7,h:0.3,fontSize:10.5,color:C.INK2});
});
s.addNotes('条件を外せないものとして固定したのがこの資料の出発点。');

/* 3 必要資金 */
s=slide(); light(s);
head(s,'必要資金','誰が、いくら出すことになるか');
tbl(s,[
 [{text:'資金の出し手',options:TH},{text:'A：MBO',options:Object.assign({align:'center'},TH,{fill:C.ACC})},
  {text:'B-1：中野が買取',options:THC},{text:'B-2：市場へ売出し',options:THC}],
 [{text:'中野（自己資金）',options:{bold:true}},{text:'6.12億円',options:{align:'center',bold:true,color:C.ACC}},
  {text:'8.43億円',options:{align:'center',bold:true,color:C.NEG}},{text:'0.15億円',options:{align:'center',bold:true,color:C.POS}}],
 [{text:'パートナー（増資引受）',options:{bold:true}},{text:'13.44億円',options:{align:'center'}},{text:'―',options:{align:'center'}},{text:'―',options:{align:'center'}}],
 [{text:'市場（売出しの引受先）',options:{bold:true}},{text:'―',options:{align:'center'}},{text:'―',options:{align:'center'}},{text:'8.43億円',options:{align:'center',color:C.WARN}}],
 [{text:'銀行（借入）',options:{bold:true}},{text:'3.00億円',options:{align:'center'}},{text:'7.90億円',options:{align:'center',color:C.NEG}},{text:'7.90億円',options:{align:'center',color:C.NEG}}],
 [{text:'調達 合計',options:{bold:true,fill:'E8EDF2'}},{text:'22.56億円',options:{align:'center',bold:true,fill:'E8EDF2'}},
  {text:'16.33億円',options:{align:'center',bold:true,fill:'E8EDF2'}},{text:'16.48億円',options:{align:'center',bold:true,fill:'E8EDF2'}}],
 [{text:'　うち ビジョン株式の取得',options:{}},{text:'12.72億（全株主分）',options:{align:'center'}},{text:'8.43億',options:{align:'center'}},{text:'8.43億',options:{align:'center'}}],
 [{text:'　うち ビジョン借入の返済',options:{}},{text:'7.90億',options:{align:'center'}},{text:'7.90億',options:{align:'center'}},{text:'7.90億',options:{align:'center'}}],
 [{text:'　うち その他',options:{}},{text:'1.95億（費用・手元）',options:{align:'center'}},{text:'―',options:{align:'center'}},{text:'0.15億（重松氏から）',options:{align:'center'}}]],
 {x:0.7,y:1.68,w:11.9,colW:[3.5,2.9,2.75,2.75],rowH:0.40,fontSize:11});
card(s,0.7,5.5,11.9,1.0,C.TINT_P,C.TINT_PL);
T(s,'②の条件が効くのはここです',{x:1.05,y:5.66,w:4,h:0.3,fontSize:13,bold:true,color:C.POS});
T(s,'借入7.90億をクロージング当日に全額返す以上、その現金はどこかから来ます。MBOでは4.90億を増資でまかない、銀行からは3.00億だけ。合併では増資がないため7.90億すべてが新規借入になり、貸し手が替わるだけで負債は減りません。',
  {x:1.05,y:5.98,w:11.2,h:0.45,fontSize:11.5,color:C.INK2});
T(s,'A欄の「ビジョン株式の取得12.72億」はビジョン社を含む既存株主7社全員分です（ビジョン社分は9.41億）。B欄はビジョン社分のみ。',
  {x:0.7,y:6.7,w:11.9,h:0.3,fontSize:9,color:C.MUT});
s.addNotes('中野の負担はB-2が一番軽い。だが調達合計を見ると、Bは借入が7.90億に膨らむ。');

/* 4 到達点とメリデメ */
s=slide(); light(s);
head(s,'比較','到達点と、それぞれのメリット・デメリット');
[['A','MBO',C.ACC,'6.12','億円','50.1%','過半数の支配権あり',
  ['3条件をすべて確実に満たせる','ビジョン借入が6.07億まで減る','自己資本比率24.9%で銀行に通る'],
  ['パートナー13.44億を集めきる必要','非上場のため株式の換金性は低い']],
 ['B-1','合併＋中野が買取',C.BLUE,'8.43','億円','32.88%','筆頭だが過半数なし',
  ['第三者の資金に頼らず単独で実行できる','上場株なので換金性がある','ビジョン社を一度で整理できる'],
  ['流通株式比率21.62%で上場維持基準割れ','1/3まで0.45ptしか余裕がない','借入が10.97億のまま残る']],
 ['B-2','合併＋市場へ売出し',C.MUT,'0.15','億円','14.77%','筆頭だが支配力なし',
  ['中野の持ち出しが最も少ない','流通株式比率39.7%で基準を満たす'],
  ['8.43億の売出しを消化できる保証がない','重松氏と同率で、差がつけば即座に崩れる','借入が10.97億のまま残る']]]
.forEach((r,i)=>{
  const x=0.7+i*4.0;
  card(s,x,1.66,3.85,5.0,i?C.WHITE:C.TINT_A,i?C.LINE:C.TINT_AL);
  badge(s,x+0.3,1.82,0.72,r[0],r[2],0.32);
  T(s,r[1],{x:x+1.15,y:1.82,w:2.5,h:0.32,fontSize:12.5,bold:true,color:C.INK,valign:'middle'});
  T(s,'中野の必要資金',{x:x+0.3,y:2.20,w:3.25,h:0.24,fontSize:9.5,color:C.MUT});
  T(s,[{text:r[3],options:{fontSize:30,bold:true,color:r[2]}},
       {text:r[4],options:{fontSize:13,bold:true,color:r[2]}}],{x:x+0.3,y:2.40,w:3.25,h:0.56});
  T(s,'最終持分 '+r[5],{x:x+0.3,y:2.98,w:3.25,h:0.26,fontSize:12,bold:true,color:C.INK});
  T(s,r[6],{x:x+0.3,y:3.24,w:3.25,h:0.26,fontSize:10,color:C.MUT});
  T(s,'メリット',{x:x+0.3,y:3.56,w:3.25,h:0.24,fontSize:10.5,bold:true,color:C.POS});
  r[7].forEach((t,j)=>{
    dot(s,x+0.3,3.90+j*0.40,C.POS,0.13);
    T(s,t,{x:x+0.56,y:3.84+j*0.40,w:2.99,h:0.38,fontSize:9.2,color:C.INK2});
  });
  const yy=3.84+r[7].length*0.40+0.06;
  T(s,'デメリット',{x:x+0.3,y:yy,w:3.25,h:0.24,fontSize:10.5,bold:true,color:C.NEG});
  r[8].forEach((t,j)=>{
    dot(s,x+0.3,yy+0.34+j*0.40,C.NEG,0.13);
    T(s,t,{x:x+0.56,y:yy+0.28+j*0.40,w:2.99,h:0.38,fontSize:9.2,color:C.INK2});
  });
});
s.addNotes('B-1は上場維持基準、B-2は支配力。どちらも条件③を実質的には満たしきれない。');

/* 5 B-1の落とし穴 */
s=slide(); dark(s);
head(s,'B-1 の問題','筆頭株主になった瞬間、上場維持基準に触れます',true);
[['21.62%','合併後の流通株式比率','東証グロースの上場維持基準は25%です。ビジョン社の18.43%が中野に移るだけなので、どちらも除外対象の保有者であり、流通株式は1株も増えません。'],
 ['0.45pt','1/3ルールまでの余裕','取得後32.88%。3分の1を超える市場外買付はTOBが義務になるため、追加で買えるのは残り90,094株だけです。'],
 ['10.97億','あどばる由来の有利子負債','増資がないため、ビジョン社への7.90億は新規借入で置き換えるしかなく、負債は1円も減りません。'],
 ['8.43億','中野の持ち出し','MBOの6.12億より2.31億多く、しかも得られるのは過半数ではなく32.88%です。']]
.forEach((r,i)=>{
  const x=0.7+(i%2)*6.05, y=1.85+Math.floor(i/2)*2.1;
  dcard(s,x,y,5.85,1.85);
  T(s,r[0],{x:x+0.3,y:y+0.22,w:1.8,h:0.42,fontSize:21,bold:true,color:C.ACC2});
  T(s,r[1],{x:x+2.25,y:y+0.3,w:3.35,h:0.32,fontSize:13,bold:true,color:C.WHITE});
  T(s,r[2],{x:x+0.3,y:y+0.76,w:5.25,h:0.95,fontSize:10.5,color:C.DKTXT,lineSpacingMultiple:1.2});
});
T(s,'上場維持基準に触れると1年の改善期間に入ります。その間に流通株式を増やす＝中野か誰かが売る必要があり、筆頭株主でいることと両立しません。',
  {x:0.7,y:6.16,w:11.9,h:0.55,fontSize:12.5,bold:true,color:C.ACC2});
T(s,'流通株式比率は、役員・10%以上保有者・事業法人の保有分を除いた試算値です。実際の算定は東証の定義によります。',
  {x:0.7,y:6.82,w:11.9,h:0.3,fontSize:9,color:'7F8E9B'});
s.addNotes('条件③（筆頭）と上場維持が真正面からぶつかる。ここがB-1の致命傷。');

/* 6 B-2の落とし穴 */
s=slide(); light(s);
head(s,'B-2 の問題','持ち出しは最小ですが、筆頭の座が紙一重です');
card(s,0.7,1.7,5.85,2.5,C.TINT_W,C.TINT_WL);
T(s,'8.43億円の売出しを、誰が引き取るのか',{x:1.0,y:1.9,w:5.2,h:0.3,fontSize:13.5,bold:true,color:C.WARN});
T(s,'スペースマーケット社の時価総額は28億円です。そこへ発行済の18.43%にあたる8.43億円分を放出することになります。\n\n引受証券会社によるディスカウントは避けられず、株価そのものが下押しされる可能性があります。ビジョン社の手取りも額面どおりにはなりません。',
  {x:1.0,y:2.3,w:5.25,h:1.7,fontSize:11,color:C.INK2,lineSpacingMultiple:1.2});
card(s,6.75,1.7,5.85,2.5,C.TINT_A,C.TINT_AL);
T(s,'重松氏と「同数」では、筆頭は守れません',{x:7.05,y:1.9,w:5.2,h:0.3,fontSize:13.5,bold:true,color:C.ACC});
T(s,'中野14.77% ＝ 重松氏14.77%。これは同率首位であって、単独の筆頭ではありません。\n\nさらにダブルパインズ社の8.36%を合わせると重松氏側は23.14%です。実質で並ぶには1,735,014株・3.97億円が必要になります。',
  {x:7.05,y:2.3,w:5.25,h:1.7,fontSize:11,color:C.INK2,lineSpacingMultiple:1.2});
T(s,'「重松氏と同数」をどう定義するかで、必要額は26倍変わります',{x:0.7,y:4.45,w:11.9,h:0.32,fontSize:14,bold:true,color:C.INK});
[['重松氏 個人分と同数','65,014株','0.15億円','中野 14.77%（同率首位）',C.POS],
 ['ダブルパインズを含めて同数','1,735,014株','3.97億円','中野 23.14%（単独首位）',C.ACC],
 ['ビジョン株も引き取る（＝B-1）','3,745,321株','8.58億円','中野 33.20%　※TOB必要',C.NEG]]
.forEach((r,i)=>{
  const x=0.7+i*4.0;
  card(s,x,4.88,3.85,1.5);
  T(s,r[0],{x:x+0.28,y:5.06,w:3.3,h:0.28,fontSize:11.5,bold:true,color:C.INK});
  T(s,r[1],{x:x+0.28,y:5.38,w:3.3,h:0.26,fontSize:10,color:C.MUT});
  T(s,r[2],{x:x+0.28,y:5.66,w:3.3,h:0.38,fontSize:17,bold:true,color:r[4]});
  T(s,r[3],{x:x+0.28,y:6.06,w:3.3,h:0.26,fontSize:10,color:C.INK2});
});
T(s,'3列目は参考値です。ビジョン株と重松氏個人分の両方を取得すると33.20%となり3分の1を超えるため、市場外取得ではTOBが必要になります。',
  {x:0.7,y:6.6,w:11.9,h:0.3,fontSize:9,color:C.MUT});
s.addNotes('「同数」の定義で必要額が0.15億から3.97億まで動く。ここは先に決めておく。');

/* 7 ビジョン視点 */
s=slide(); light(s);
head(s,'ビジョン社から見ると','どの案が受け入れられやすいか');
[['A','MBO','17.31','億円','株式 9.41億 ＋ 借入返済 7.90億','現金一括・同時決済。価格は20億円評価で確定。',C.ACC,'最も高く、最も確実'],
 ['B-1','合併＋中野が買取','16.33','億円','株式 8.43億 ＋ 借入返済 7.90億','中野個人との相対取引。価格は市場株価229円に連動。',C.BLUE,'Aより0.98億円低い'],
 ['B-2','合併＋市場へ売出し','16.33','億円','売出し 8.43億 ＋ 借入返済 7.90億','手取りはディスカウントと引受手数料の分だけ目減りする。',C.MUT,'実際の手取りは最も低い']]
.forEach((r,i)=>{
  const y=1.7+i*1.62;
  card(s,0.7,y,11.9,1.45,i?C.WHITE:C.TINT_A,i?C.LINE:C.TINT_AL);
  badge(s,1.05,y+0.24,0.8,r[0],r[6],0.34);
  T(s,r[1],{x:1.05,y:y+0.72,w:2.3,h:0.3,fontSize:12,bold:true,color:C.INK});
  T(s,[{text:r[2],options:{fontSize:30,bold:true,color:r[6]}},
       {text:r[3],options:{fontSize:13,bold:true,color:r[6]}}],{x:3.6,y:y+0.35,w:2.5,h:0.6});
  T(s,r[4],{x:3.6,y:y+0.98,w:2.9,h:0.28,fontSize:9.5,color:C.MUT});
  T(s,r[5],{x:6.7,y:y+0.38,w:3.6,h:0.7,fontSize:10.5,color:C.INK2,lineSpacingMultiple:1.15});
  T(s,r[7],{x:10.5,y:y+0.55,w:1.9,h:0.36,fontSize:12,bold:true,color:r[6],align:'right'});
});
T(s,'交渉上、これは使えます。ビジョン社にとってMBOが最も条件が良いということは、MBOのほうが合意を取りやすいということです。',
  {x:0.7,y:6.6,w:11.9,h:0.35,fontSize:12.5,bold:true,color:C.ACC});
s.addNotes('ビジョンにとってもMBOが一番得。これは交渉材料になる。');

/* 8 結論 */
s=slide(); dark(s);
head(s,'結論','3条件をすべて満たせるのはMBOだけです',true);
dcard(s,0.7,1.7,11.9,1.5,C.ACC);
T(s,'B-1は上場維持基準に触れ、B-2は筆頭の座を守れません。条件③を本当に外せないのであれば、合併ルートは条件を満たしきれません。',
  {x:1.05,y:1.95,w:11.2,h:0.6,fontSize:18,bold:true,color:C.WHITE,lineSpacingMultiple:1.2});
T(s,'しかも中野の持ち出しは、B-1の8.43億に対してMBOは6.12億。安いほうが条件を満たします。',
  {x:1.05,y:2.62,w:11.2,h:0.35,fontSize:12,color:'B9C4CF'});
tbl(s,[
 [{text:'必須条件',options:TH},{text:'A：MBO',options:Object.assign({align:'center'},TH,{fill:C.ACC})},
  {text:'B-1',options:THC},{text:'B-2',options:THC}],
 [{text:'① ビジョン株式の出口',options:{bold:true,color:C.WHITE,fill:'26333F'}},
  {text:'○ 完全に退出',options:{align:'center',bold:true,color:'7FD1A4',fill:'26333F'}},
  {text:'○ 完全に退出',options:{align:'center',color:'7FD1A4',fill:'26333F'}},
  {text:'○ 完全に退出',options:{align:'center',color:'7FD1A4',fill:'26333F'}}],
 [{text:'② 借入7.90億の同時全額返済',options:{bold:true,color:C.WHITE,fill:'26333F'}},
  {text:'○ 増資4.90＋銀行3.00',options:{align:'center',bold:true,color:'7FD1A4',fill:'26333F'}},
  {text:'△ 全額が新規借入',options:{align:'center',color:'E8B96B',fill:'26333F'}},
  {text:'△ 全額が新規借入',options:{align:'center',color:'E8B96B',fill:'26333F'}}],
 [{text:'③ 中野が筆頭株主',options:{bold:true,color:C.WHITE,fill:'26333F'}},
  {text:'○ 50.1%・過半数',options:{align:'center',bold:true,color:'7FD1A4',fill:'26333F'}},
  {text:'× 上場維持基準に抵触',options:{align:'center',color:'E89B8F',fill:'26333F'}},
  {text:'× 同率どまり',options:{align:'center',color:'E89B8F',fill:'26333F'}}],
 [{text:'中野の必要資金',options:{bold:true,color:C.WHITE,fill:'26333F'}},
  {text:'6.12億円',options:{align:'center',bold:true,color:C.WHITE,fill:'26333F'}},
  {text:'8.43億円',options:{align:'center',color:'B9C4CF',fill:'26333F'}},
  {text:'0.15〜3.97億円',options:{align:'center',color:'B9C4CF',fill:'26333F'}}]],
 {x:0.7,y:3.4,w:11.9,colW:[3.5,2.9,2.75,2.75],rowH:0.45,fontSize:11,
  border:{type:'solid',color:C.DKLINE,pt:0.5}});
T(s,'次に決めること：① 「重松氏と同数」の定義（個人分か、ダブルパインズを含むか）　② パートナー13.44億の引受先　③ ビジョン社への提示順序',
  {x:0.7,y:6.0,w:11.9,h:0.55,fontSize:12,bold:true,color:C.ACC2});
T(s,'本資料は検討段階の想定値です。流通株式比率・TOB規制の適用は、東証および証券会社・弁護士の確認を要します。',
  {x:0.7,y:6.75,w:11.9,h:0.3,fontSize:9,color:'7F8E9B'});
s.addNotes('条件を固定した瞬間、合併ルートは条件③で詰む。しかもMBOのほうが安い。');

p.writeFile({fileName:'あどばる資本政策_必須条件での資金比較_20260924.pptx'}).then(()=>console.log('deckC written'));
