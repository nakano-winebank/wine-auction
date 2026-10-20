const D=require('./design.js')();
const {p,C,F,T,dark,light,head,card,dcard,stat,badge,num,dot,TH,THR,THC,tbl,cover,slide}=D;
let s;

/* 1 表紙 */
s=slide();
cover(s,'株式会社あどばる','合併候補7社の評価',
 '大櫃様よりご提示いただいたリストを、シナジーとマジョリティの観点で並べ替え',
 '2026年10月20日',
 [['作成','株式会社あどばる 代表取締役 中野 邦人'],
  ['前提','あどばるEquity 20億円（MBO前提のPre評価）'],
  ['出所','各社の公開情報（時価総額は2026年9月18日〜10月19日時点）']],
 '公開情報にもとづく試算です。基準日が各社で異なります。投資判断には一次情報の確認を要します');
s.addNotes('大櫃さんへの返信用。7社を順位づけし、上位3社に絞って返す。');

/* 2 結論 */
s=slide(); light(s);
head(s,'結論','7社の順位');
tbl(s,[
 [{text:'順位',options:THC},{text:'コード',options:THC},{text:'社名',options:TH},{text:'時価総額',options:THR},
  {text:'事業',options:TH},{text:'シナジー',options:THC},{text:'あどばる側',options:THR},{text:'中野個人',options:THR}],
 [{text:'1',options:{align:'center',bold:true,fill:'F3E7EA'}},{text:'9215',options:{align:'center',fill:'F3E7EA'}},
  {text:'CaSy',options:{bold:true,fill:'F3E7EA'}},{text:'18.8億',options:{align:'right',fill:'F3E7EA'}},
  {text:'家事代行マッチング',options:{fill:'F3E7EA'}},{text:'★★★',options:{align:'center',color:C.ACC,fill:'F3E7EA'}},
  {text:'51.6%',options:{align:'right',bold:true,color:C.POS,fill:'F3E7EA'}},{text:'18.9%',options:{align:'right',bold:true,fill:'F3E7EA'}}],
 [{text:'2',options:{align:'center',bold:true,fill:'F3E7EA'}},{text:'9342',options:{align:'center',fill:'F3E7EA'}},
  {text:'スマサポ',options:{bold:true,fill:'F3E7EA'}},{text:'20.5億',options:{align:'right',fill:'F3E7EA'}},
  {text:'賃貸管理会社向けDX',options:{fill:'F3E7EA'}},{text:'★★★',options:{align:'center',color:C.ACC,fill:'F3E7EA'}},
  {text:'49.4%',options:{align:'right',bold:true,color:C.NEG,fill:'F3E7EA'}},{text:'18.1%',options:{align:'right',bold:true,fill:'F3E7EA'}}],
 [{text:'3',options:{align:'center',bold:true,fill:'F3E7EA'}},{text:'4378',options:{align:'center',fill:'F3E7EA'}},
  {text:'CINC',options:{bold:true,fill:'F3E7EA'}},{text:'16.1億',options:{align:'right',fill:'F3E7EA'}},
  {text:'デジタルマーケSaaS',options:{fill:'F3E7EA'}},{text:'★★',options:{align:'center',color:C.ACC,fill:'F3E7EA'}},
  {text:'55.4%',options:{align:'right',bold:true,color:C.POS,fill:'F3E7EA'}},{text:'20.3%',options:{align:'right',bold:true,fill:'F3E7EA'}}],
 [{text:'4',options:{align:'center'}},{text:'7093',options:{align:'center'}},{text:'アディッシュ',options:{bold:true}},
  {text:'13.7億',options:{align:'right'}},'SNS監視・CS支援',{text:'★',options:{align:'center',color:C.MUT}},
  {text:'59.4%',options:{align:'right',color:C.POS}},{text:'21.8%',options:{align:'right'}}],
 [{text:'5',options:{align:'center'}},{text:'6579',options:{align:'center'}},{text:'ログリー',options:{bold:true}},
  {text:'12.9億',options:{align:'right'}},'ネイティブ広告配信',{text:'★',options:{align:'center',color:C.MUT}},
  {text:'60.9%',options:{align:'right',color:C.POS}},{text:'22.4%',options:{align:'right'}}],
 [{text:'6',options:{align:'center'}},{text:'6558',options:{align:'center'}},{text:'クックビズ',options:{bold:true}},
  {text:'18.2億',options:{align:'right'}},'飲食業界特化の人材',{text:'★★',options:{align:'center',color:C.MUT}},
  {text:'52.4%',options:{align:'right'}},{text:'19.2%',options:{align:'right'}}],
 [{text:'7',options:{align:'center'}},{text:'6731',options:{align:'center'}},{text:'ピクセラ',options:{bold:true}},
  {text:'13.2億',options:{align:'right'}},'映像機器・チューナー',{text:'―',options:{align:'center',color:C.MUT}},
  {text:'60.2%',options:{align:'right'}},{text:'22.1%',options:{align:'right'}}]],
 {x:0.7,y:1.7,w:11.9,colW:[0.7,0.9,1.7,1.2,3.1,1.1,1.6,1.6],rowH:0.44,fontSize:11});
card(s,0.7,5.6,11.9,0.95,C.TINT_P,C.TINT_PL);
T(s,'どの相手でも、中野は合併後の筆頭株主になります',{x:1.05,y:5.76,w:6,h:0.3,fontSize:13,bold:true,color:C.POS});
T(s,'中野個人18.1〜22.4%に対し、相手方の筆頭株主は合併後4.5〜16.6%に薄まります。論点は「筆頭を取れるか」ではなく「過半数に届くか」です。',
  {x:1.05,y:6.08,w:11.2,h:0.35,fontSize:11.5,color:C.INK2});
T(s,'CINCの証券コードはリストの4379ではなく4378です。時価総額はいただいたリストとほぼ一致していました。',
  {x:0.7,y:6.72,w:11.9,h:0.3,fontSize:9,color:C.MUT});
s.addNotes('順位の根拠はシナジーと過半数の両方。筆頭は全社で取れる、が重要。');

/* 3 持分の構造 */
s=slide(); dark(s);
head(s,'構造','過半数を分けるのは、相手の時価総額です',true);
dcard(s,0.7,1.75,11.9,1.0);
T(s,'あどばる側の持分 ＝ あどばるEquity ÷（あどばるEquity ＋ 相手の時価総額）',
  {x:1.05,y:2.0,w:11.2,h:0.4,fontSize:19,bold:true,color:C.WHITE});
T(s,'つまり、相手の時価総額が20億円を下回れば、旧あどばる株主の合計が自動的に過半数になります。',
  {x:1.05,y:2.42,w:11.2,h:0.3,fontSize:11.5,color:'B9C4CF'});
s.addChart(p.ChartType.bar,[{name:'あどばる側の持分',
  labels:['スマサポ 20.5億','CaSy 18.8億','クックビズ 18.2億','CINC 16.1億','アディッシュ 13.7億','ピクセラ 13.2億','ログリー 12.9億'],
  values:[49.38,51.59,52.36,55.40,59.35,60.20,60.88]}],
 {x:0.7,y:3.0,w:7.3,h:3.3,barDir:'bar',chartColors:[C.ACC2],showTitle:false,
  showValue:true,dataLabelPosition:'outEnd',dataLabelFormatCode:'0.0"%"',dataLabelFontFace:F,
  dataLabelFontSize:10,dataLabelColor:'D5DDE5',showLegend:false,barGapWidthPct:45,
  catAxisLabelFontFace:F,catAxisLabelFontSize:10,catAxisLabelColor:'B9C4CF',
  valAxisLabelFontFace:F,valAxisLabelFontSize:9,valAxisLabelColor:'7F8E9B',valAxisMaxVal:70,
  valGridLine:{color:'3A4854',size:0.5},catGridLine:{style:'none'}});
dcard(s,8.3,3.0,4.3,3.3);
T(s,'3つの水準で見ています',{x:8.6,y:3.2,w:3.8,h:0.3,fontSize:13.5,bold:true,color:C.ACC2});
[['中野が筆頭株主','18.1〜22.4%','7社すべてで達成できます',C.POS],
 ['あどばる側が過半数','49.4〜60.9%','スマサポ以外の6社で達成',C.POS],
 ['中野個人で過半数','41.3〜50.9%','ビジョン株（約9.4億）を中野が取得してもログリー・ピクセラのみ',C.NEG]]
.forEach((r,i)=>{
  const y=3.62+i*0.92;
  dot(s,8.6,y+0.08,r[3],0.14);
  T(s,r[0],{x:8.88,y:y,w:3.5,h:0.28,fontSize:12,bold:true,color:C.WHITE});
  T(s,r[1],{x:8.88,y:y+0.27,w:3.5,h:0.26,fontSize:11,bold:true,color:r[3]});
  T(s,r[2],{x:8.88,y:y+0.53,w:3.5,h:0.42,fontSize:9,color:C.DKTXT,lineSpacingMultiple:1.1});
});
T(s,'あどばるを18億円で評価すると、過半数を取れるのはCINC・アディッシュ・ピクセラ・ログリーの4社に減ります。評価額の交渉が持分に直結します。',
  {x:0.7,y:6.5,w:11.9,h:0.35,fontSize:11.5,bold:true,color:C.ACC2});
s.addNotes('評価額が20億か18億かで、過半数の可否が変わる。ここも交渉。');

/* 4 上位3社 */
s=slide(); light(s);
head(s,'上位3社','なぜこの3社か');
[['1','9215 CaSy','家事代行マッチング','18.8億',C.ACC,
  '清掃はレンタルスペース運営の最大の原価・品質課題です。CaSyのキャスト網をそのまま当社の現場に使えます。逆にCaSyは稼働の平準化先を得ます。',
  ['筆頭はワタキューセイモア19.2%（寝具リネン大手）→合併後9.3%','あどばる側51.6%で過半数、中野18.9%で筆頭',
   '課題：2026年11月期は営業損失1.33億の予想'],C.TINT_A,C.TINT_AL],
 ['2','9342 スマサポ','賃貸管理会社向けDXアプリ','20.5億',C.ACC,
  '賃貸管理会社のネットワークは、当社がスペースを仕入れる源泉そのものです。大東建託パートナーズが株主にいることも効きます。',
  ['あどばる側49.4%で過半数に届かない（唯一）','あどばる評価を21億以上にできれば逆転する',
   '課題：CABO DA ROCA 32.85%→合併後16.63%が重い'],C.WHITE,C.LINE],
 ['3','4378 CINC','デジタルマーケ支援SaaS','16.1億',C.BLUE,
  'レンタルスペースは検索流入が生命線です。Keywordmap等の集客基盤を内製化でき、外販も続けられます。',
  ['あどばる側55.4%、中野20.3%で筆頭','自己株16.15%を消却すれば持分がさらに上がる',
   '課題：石松25.93%＋CZ22.92%が結束すると合併後21.8%'],C.WHITE,C.LINE]]
.forEach((r,i)=>{
  const x=0.7+i*4.0;
  card(s,x,1.68,3.85,4.85,r[7],r[8]);
  badge(s,x+0.3,1.9,0.5,r[0],r[4],0.32);
  T(s,r[1],{x:x+0.95,y:1.9,w:2.7,h:0.32,fontSize:13.5,bold:true,color:C.INK,valign:'middle'});
  T(s,r[2],{x:x+0.3,y:2.34,w:3.25,h:0.26,fontSize:10,color:C.MUT});
  T(s,[{text:'時価総額 ',options:{fontSize:10,color:C.MUT}},
       {text:r[3],options:{fontSize:16,bold:true,color:r[4]}}],{x:x+0.3,y:2.62,w:3.25,h:0.34});
  T(s,r[5],{x:x+0.3,y:3.06,w:3.25,h:1.25,fontSize:10,color:C.INK2,lineSpacingMultiple:1.2});
  r[6].forEach((t,j)=>{
    dot(s,x+0.3,4.42+j*0.72,j===2?C.NEG:C.POS,0.13);
    T(s,t,{x:x+0.58,y:4.36+j*0.72,w:2.92,h:0.68,fontSize:9.2,color:C.INK2,lineSpacingMultiple:1.15});
  });
});
s.addNotes('CaSyは清掃、スマサポは物件、CINCは集客。どれも当社の現場に直結する。');

/* 5 推奨しない2社 */
s=slide(); light(s);
head(s,'注意','この2社は、いまは見送りをお勧めします');
[['6558','クックビズ','18.2億','飲食業界特化の人材サービス',C.WARN,
  ['事業シナジーはあります。アピシウスやパーティースペースの人材調達に直結します。'],
  ['2025年11月期は営業損失3.74億円','2026年11月期は第3四半期累計で営業損失2.31億円、通期予想を下方修正し希望退職を募集',
   'あどばるの正常化営業利益2.00億と合算しても赤字が残ります','藪ノ賢次氏32.49%→合併後15.5%']],
 ['6731','ピクセラ','13.2億','映像機器・チューナー',C.NEG,
  ['事業シナジーは見当たりません。時価総額が小さく持分は取りやすい、という点のみです。'],
  ['2026年9月期は第3四半期累計で営業損失11.85億円、純損失12.93億円','筆頭はエボ・ファンド（ケイマン）21.10%',
   '新株予約権による希薄化が続いており、発行済株式数が動くため合併比率を固定できません','10月15日に年初来安値を更新']]]
.forEach((r,i)=>{
  const x=0.7+i*6.05;
  card(s,x,1.68,5.85,4.6,i?C.TINT_A:C.TINT_W,i?C.TINT_AL:C.TINT_WL);
  badge(s,x+0.35,1.9,0.9,r[0],r[4],0.32);
  T(s,r[1],{x:x+1.4,y:1.9,w:2.6,h:0.32,fontSize:15,bold:true,color:C.INK,valign:'middle'});
  T(s,r[2],{x:x+4.0,y:1.9,w:1.5,h:0.32,fontSize:15,bold:true,color:r[4],align:'right',valign:'middle'});
  T(s,r[3],{x:x+0.35,y:2.34,w:5.15,h:0.26,fontSize:10,color:C.MUT});
  T(s,r[5][0],{x:x+0.35,y:2.66,w:5.15,h:0.6,fontSize:10.5,color:C.INK2,lineSpacingMultiple:1.2});
  T(s,'見送りをお勧めする理由',{x:x+0.35,y:3.36,w:5.15,h:0.26,fontSize:11,bold:true,color:r[4]});
  r[6].forEach((t,j)=>{
    dot(s,x+0.35,3.78+j*0.66,r[4],0.13);
    T(s,t,{x:x+0.63,y:3.72+j*0.66,w:4.87,h:0.62,fontSize:9.5,color:C.INK2,lineSpacingMultiple:1.15});
  });
});
T(s,'いずれも「安く買える」案件ではありますが、合併後に当社の利益が消えます。当社は正常化営業利益2.00億を前提に銀行と話をしているため、ここは崩せません。',
  {x:0.7,y:6.5,w:11.9,h:0.35,fontSize:12,bold:true,color:C.ACC});
s.addNotes('安さに釣られない。利益が消えると銀行との話が全部やり直しになる。');

/* 6 返信案 */
s=slide(); dark(s);
head(s,'次のステップ','大櫃様への返信と、確認したいこと',true);
dcard(s,0.7,1.75,11.9,1.6,C.ACC);
T(s,'ご返信の骨子',{x:1.05,y:1.95,w:4,h:0.3,fontSize:12,color:C.ACC2});
T(s,'「CaSy・スマサポ・CINCの3社に関心があります。まずこの順でお話を伺えますか。」',
  {x:1.05,y:2.28,w:11.2,h:0.4,fontSize:18,bold:true,color:C.WHITE});
T(s,'クックビズとピクセラは業績面から今回は見送り、アディッシュとログリーは事業シナジーが薄いため優先度を下げる旨も添えます。',
  {x:1.05,y:2.76,w:11.2,h:0.35,fontSize:11.5,color:'B9C4CF'});
[['01','各社の直近の貸借対照表','純資産・有利子負債・現預金。のれんの発生額と、合算後の自己資本比率を出すために必要です。'],
 ['02','株主構成の最新値と、大株主の意向','特にCaSyのワタキューセイモア、スマサポのCABO DA ROCA、CINCの株式会社CZ。売却や協力の意向があるかどうかで持分が変わります。'],
 ['03','あどばるの評価額の目線','20億か18億かで過半数の可否が変わります。先方の目線を早めに確認したいところです。'],
 ['04','先方が合併を検討する動機','東証グロースの上場維持基準（時価総額）を意識しているのであれば、合併後の規模拡大は当社から提供できる価値です。']]
.forEach((r,i)=>{
  const x=0.7+(i%2)*6.05, y=3.55+Math.floor(i/2)*1.4;
  dcard(s,x,y,5.85,1.25);
  T(s,r[0],{x:x+0.3,y:y+0.2,w:0.6,h:0.3,fontSize:14,bold:true,color:C.ACC2});
  T(s,r[1],{x:x+0.95,y:y+0.2,w:4.65,h:0.3,fontSize:13,bold:true,color:C.WHITE});
  T(s,r[2],{x:x+0.3,y:y+0.58,w:5.25,h:0.6,fontSize:9.5,color:C.DKTXT,lineSpacingMultiple:1.15});
});
T(s,'ビジョン社の出口と借入7.90億の返済は、どの相手と組んでも必要です。合併の相手が決まり次第、みずほ様へのリファイナンスの打診を具体化します。',
  {x:0.7,y:6.5,w:11.9,h:0.35,fontSize:11.5,bold:true,color:C.ACC2});
s.addNotes('3社に絞って返す。断る2社も理由を添えると次のリストの質が上がる。');

p.writeFile({fileName:'あどばる_合併候補7社の評価_20261020.pptx'}).then(()=>console.log('deckD written'));
