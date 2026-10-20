const D=require('./design.js')();
const {p,C,F,T,dark,light,head,card,dcard,stat,badge,num,dot,TH,THR,THC,tbl,cover,slide}=D;
let s;

/* 1 表紙 */
s=slide();
cover(s,'株式会社あどばる','合併候補の再評価 ─ 上位3社',
 'あどばる評価15億円・中野は筆頭または第2位・各社の貸借対照表を加味',
 '2026年10月20日',
 [['作成','株式会社あどばる 代表取締役 中野 邦人'],
  ['前提','あどばるEquity 15.0億円（上限）／ 正常化営業利益 2.00億円'],
  ['出所','各社の公開情報（2025年9月期〜2026年10月時点、基準日は各社で異なる）']],
 '公開情報にもとづく試算です。会計処理および数値は監査法人・一次資料の確認を要します');
s.addNotes('15億に下げ、支配権の条件も緩めた版。結論はスマサポ・アディッシュ・CINC。');

/* 2 前提変更の影響 */
s=slide(); light(s);
head(s,'前提の変更','2つの条件が変わり、評価軸が入れ替わりました');
[['評価額','20億円 → 15億円','あどばる側の持分が全社で下がり、過半数を取れるのはログリー・ピクセラ・アディッシュの3社だけになりました。',C.ACC],
 ['中野の地位','過半数 → 筆頭または第2位','この条件なら7社すべてで満たせます。中野は5社で筆頭、クックビズとスマサポで第2位です。',C.POS]]
.forEach((r,i)=>{
  const x=0.7+i*6.05;
  card(s,x,1.66,5.85,1.6,i?C.TINT_P:C.TINT_A,i?C.TINT_PL:C.TINT_AL);
  T(s,r[0],{x:x+0.35,y:1.86,w:5.15,h:0.26,fontSize:10.5,color:C.MUT});
  T(s,r[1],{x:x+0.35,y:2.14,w:5.15,h:0.34,fontSize:17,bold:true,color:r[3]});
  T(s,r[2],{x:x+0.35,y:2.56,w:5.15,h:0.6,fontSize:10.5,color:C.INK2,lineSpacingMultiple:1.2});
});
card(s,0.7,3.5,11.9,1.5,C.TINT_B,C.TINT_BL);
T(s,'結果として、順位を決めるのは「シナジー」と「相手の財務」になりました',
  {x:1.05,y:3.7,w:9,h:0.32,fontSize:14,bold:true,color:C.BLUE});
T(s,'支配権がほぼ全社で確保できる以上、差がつくのは ①合算後にいくら利益が残るか ②ビジョン社への借入7.90億円を返す原資が相手にあるか ③のれん償却に耐えられるか、の3点です。前回シナジー最上位としたCaSyは、この3点で沈みました。',
  {x:1.05,y:4.08,w:11.2,h:0.75,fontSize:11.5,color:C.INK2,lineSpacingMultiple:1.2});
[['中野が筆頭','5社','ログリー・ピクセラ・アディッシュ・CINC・CaSy',C.POS],
 ['中野が第2位','2社','クックビズ・スマサポ（いずれも許容範囲）',C.POS],
 ['のれん償却後も黒字','4社','スマサポ・アディッシュ・CINC・ログリー',C.ACC],
 ['7.90億を自己資金で返済可','1社','CINC（ネット現金8.30億）',C.ACC]]
.forEach((r,i)=>{
  const x=0.7+i*3.02;
  card(s,x,5.2,2.85,1.3);
  T(s,r[0],{x:x+0.25,y:5.38,w:2.4,h:0.26,fontSize:10,color:C.MUT});
  T(s,r[1],{x:x+0.25,y:5.62,w:2.4,h:0.38,fontSize:22,bold:true,color:r[3]});
  T(s,r[2],{x:x+0.25,y:6.02,w:2.4,h:0.4,fontSize:9,color:C.INK2,lineSpacingMultiple:1.1});
});
s.addNotes('条件が緩んだので、支配権では差がつかない。財務とシナジーの勝負になった。');

/* 3 上位3社 */
s=slide(); light(s);
head(s,'結論','上位3社');
[['1','9342 スマサポ','賃貸管理会社向けDXアプリ','20.5億',C.ACC,C.TINT_A,C.TINT_AL,
  '合算営業利益が最も大きく、シナジーも最強です。賃貸管理会社のネットワークは、当社がスペースを仕入れる源泉そのものです。',
  [['合算営業利益（償却後）','3.42億円',C.POS],['中野の持分','15.51%（第2位）',C.INK],
   ['自己資本比率','68.8%',C.POS]],
  '注意：第3四半期累計は営業1.24億（前年比△36.4%）。通期2.30億の予想は進捗54.3%で未達リスクがあります。'],
 ['2','7093 アディッシュ','SNS運用監視・カスタマーサクセス','13.7億',C.ACC2,C.WHITE,C.LINE,
  '中野が19.18%で圧倒的な筆頭になり、あどばる側も52.26%と過半数です。逆取得となればのれんが8.27億に収まります。',
  [['合算営業利益（償却後）','2.29億円',C.POS],['中野の持分','19.18%（筆頭）',C.POS],
   ['自己資本比率','40.8%',C.INK]],
  '注意：事業シナジーは予約対応のBPO程度で、上位3社では最も薄いです。'],
 ['3','4378 CINC','デジタルマーケ支援SaaS','16.1億',C.BLUE,C.WHITE,C.LINE,
  '現金8.47億・実質無借金。ビジョン社への借入7.90億を、相手の手元資金だけで返せる唯一の会社です。',
  [['合算営業利益（償却後）','1.19億円',C.INK],['中野の持分','17.70%（筆頭）',C.POS],
   ['自己資本比率','76.5%',C.POS]],
  '注意：石松氏25.93%＋CZ22.92%が結束すると合併後25.3%で中野を上回ります。']]
.forEach((r,i)=>{
  const x=0.7+i*4.0;
  card(s,x,1.66,3.85,4.9,r[5],r[6]);
  badge(s,x+0.3,1.88,0.5,r[0],r[4],0.32);
  T(s,r[1],{x:x+0.95,y:1.88,w:2.7,h:0.32,fontSize:13.5,bold:true,color:C.INK,valign:'middle'});
  T(s,r[2],{x:x+0.3,y:2.32,w:3.25,h:0.26,fontSize:9.5,color:C.MUT});
  T(s,[{text:'時価総額 ',options:{fontSize:10,color:C.MUT}},
       {text:r[3],options:{fontSize:15,bold:true,color:r[4]}}],{x:x+0.3,y:2.58,w:3.25,h:0.32});
  T(s,r[7],{x:x+0.3,y:2.98,w:3.25,h:1.0,fontSize:10,color:C.INK2,lineSpacingMultiple:1.2});
  r[8].forEach((t,j)=>{
    const y=4.1+j*0.52;
    T(s,t[0],{x:x+0.3,y:y,w:1.65,h:0.26,fontSize:9.5,color:C.MUT});
    T(s,t[1],{x:x+1.8,y:y-0.04,w:1.75,h:0.32,fontSize:11.5,bold:true,color:t[2],align:'right'});
  });
  T(s,r[9],{x:x+0.3,y:5.78,w:3.25,h:0.62,fontSize:9,color:C.NEG,lineSpacingMultiple:1.15});
});
s.addNotes('1位は利益、2位は持分、3位は現金。それぞれ違う強みで選んでいる。');

/* 4 7社一覧 */
s=slide(); light(s);
head(s,'一覧','7社の比較');
tbl(s,[
 [{text:'社名',options:TH},{text:'時価総額',options:THR},{text:'あどばる側',options:THR},{text:'中野',options:THR},
  {text:'順位',options:THC},{text:'純資産',options:THR},{text:'自己資本比率',options:THR},{text:'有利子負債',options:THR},
  {text:'合算営業益',options:THR},{text:'償却後',options:THR}],
 [{text:'スマサポ',options:{bold:true,fill:'F3E7EA'}},{text:'20.5億',options:{align:'right',fill:'F3E7EA'}},
  {text:'42.3%',options:{align:'right',fill:'F3E7EA'}},{text:'15.5%',options:{align:'right',fill:'F3E7EA'}},
  {text:'第2位',options:{align:'center',fill:'F3E7EA'}},{text:'5.71億',options:{align:'right',fill:'F3E7EA'}},
  {text:'68.8%',options:{align:'right',color:C.POS,fill:'F3E7EA'}},{text:'―',options:{align:'right',fill:'F3E7EA'}},
  {text:'4.30億',options:{align:'right',bold:true,fill:'F3E7EA'}},{text:'3.42億',options:{align:'right',bold:true,color:C.POS,fill:'F3E7EA'}}],
 [{text:'アディッシュ',options:{bold:true,fill:'F3E7EA'}},{text:'13.7億',options:{align:'right',fill:'F3E7EA'}},
  {text:'52.3%',options:{align:'right',color:C.POS,fill:'F3E7EA'}},{text:'19.2%',options:{align:'right',fill:'F3E7EA'}},
  {text:'筆頭',options:{align:'center',bold:true,fill:'F3E7EA'}},{text:'5.43億',options:{align:'right',fill:'F3E7EA'}},
  {text:'40.8%',options:{align:'right',fill:'F3E7EA'}},{text:'―',options:{align:'right',fill:'F3E7EA'}},
  {text:'2.70億',options:{align:'right',fill:'F3E7EA'}},{text:'2.29億',options:{align:'right',bold:true,color:C.POS,fill:'F3E7EA'}}],
 [{text:'CINC',options:{bold:true,fill:'F3E7EA'}},{text:'16.1億',options:{align:'right',fill:'F3E7EA'}},
  {text:'48.2%',options:{align:'right',fill:'F3E7EA'}},{text:'17.7%',options:{align:'right',fill:'F3E7EA'}},
  {text:'筆頭',options:{align:'center',bold:true,fill:'F3E7EA'}},{text:'10.55億',options:{align:'right',color:C.POS,fill:'F3E7EA'}},
  {text:'76.5%',options:{align:'right',color:C.POS,fill:'F3E7EA'}},{text:'0.17億',options:{align:'right',color:C.POS,fill:'F3E7EA'}},
  {text:'2.07億',options:{align:'right',fill:'F3E7EA'}},{text:'1.19億',options:{align:'right',bold:true,fill:'F3E7EA'}}],
 [{text:'ログリー',options:{bold:true}},{text:'12.9億',options:{align:'right'}},{text:'53.9%',options:{align:'right',color:C.POS}},
  {text:'19.8%',options:{align:'right'}},{text:'筆頭',options:{align:'center'}},{text:'4.15億',options:{align:'right'}},
  {text:'45.5%',options:{align:'right'}},{text:'1.03億',options:{align:'right'}},{text:'1.50億',options:{align:'right'}},
  {text:'1.06億',options:{align:'right'}}],
 [{text:'CaSy',options:{bold:true}},{text:'18.8億',options:{align:'right'}},{text:'44.4%',options:{align:'right'}},
  {text:'16.3%',options:{align:'right'}},{text:'筆頭',options:{align:'center'}},{text:'2.74億',options:{align:'right',color:C.NEG}},
  {text:'39.0%',options:{align:'right'}},{text:'2.12億',options:{align:'right'}},{text:'0.67億',options:{align:'right'}},
  {text:'△0.21億',options:{align:'right',color:C.NEG}}],
 [{text:'クックビズ',options:{bold:true}},{text:'18.2億',options:{align:'right'}},{text:'45.2%',options:{align:'right'}},
  {text:'16.6%',options:{align:'right'}},{text:'第2位',options:{align:'center'}},{text:'10.98億',options:{align:'right'}},
  {text:'28.8%',options:{align:'right',color:C.NEG}},{text:'20.30億',options:{align:'right',color:C.NEG}},
  {text:'△1.74億',options:{align:'right',color:C.NEG}},{text:'△2.62億',options:{align:'right',color:C.NEG}}],
 [{text:'ピクセラ',options:{bold:true}},{text:'13.2億',options:{align:'right'}},{text:'53.2%',options:{align:'right'}},
  {text:'19.5%',options:{align:'right'}},{text:'筆頭',options:{align:'center'}},{text:'9.85億',options:{align:'right'}},
  {text:'―',options:{align:'right'}},{text:'―',options:{align:'right'}},
  {text:'△9.85億',options:{align:'right',color:C.NEG}},{text:'△10.02億',options:{align:'right',color:C.NEG}}]],
 {x:0.7,y:1.7,w:11.9,colW:[1.6,1.1,1.2,1.0,0.9,1.2,1.4,1.3,1.1,1.1],rowH:0.44,fontSize:10.5});
card(s,0.7,5.6,11.9,0.95,C.TINT_W,C.TINT_WL);
T(s,'前回1位としたCaSyは、ここで落ちました',{x:1.05,y:5.76,w:6,h:0.3,fontSize:13,bold:true,color:C.WARN});
T(s,'清掃のシナジーは依然として最上位です。ただし純資産2.74億・有利子負債2.12億で、2026年11月期は営業損失1.33億の予想。合算してのれんを償却すると営業赤字になり、借入7.90億の返済にも寄与しません。',
  {x:1.05,y:6.08,w:11.2,h:0.35,fontSize:11,color:C.INK2});
T(s,'合算営業利益＝あどばるの正常化営業利益2.00億＋各社の直近実績または会社予想。償却後はのれんを20年均等償却した場合。',
  {x:0.7,y:6.72,w:11.9,h:0.3,fontSize:9,color:C.MUT});
s.addNotes('BSを入れた瞬間にCaSyが沈む。シナジーだけでは選べない。');

/* 5 のれんと返済原資 */
s=slide(); dark(s);
head(s,'論点','のれんの金額が、相手によって2倍変わります',true);
dcard(s,0.7,1.75,11.9,1.35);
T(s,'あどばる側が過半数を取ると「逆取得」となり、のれんは相手会社について計算されます',
  {x:1.05,y:1.98,w:11.2,h:0.35,fontSize:17,bold:true,color:C.WHITE});
T(s,'あどばる側が過半数に満たない場合は通常の取得となり、のれん＝15億−あどばるの時価純資産△2.59億＝17.59億円。一方、逆取得ならのれん＝相手の時価総額−相手の純資産で、3〜9億円にとどまります。',
  {x:1.05,y:2.4,w:11.2,h:0.6,fontSize:11,color:'B9C4CF',lineSpacingMultiple:1.2});
[[0.7,'逆取得になる（あどばる側が過半数）',C.ACC2,
  [['ログリー','53.9%','のれん 8.70億'],['ピクセラ','53.2%','のれん 3.37億'],['アディッシュ','52.3%','のれん 8.27億']]],
 [6.75,'通常の取得（あどばる側が過半数未満）','8FB0CC',
  [['CINC','48.2%','のれん 17.59億'],['クックビズ','45.2%','のれん 17.59億'],['CaSy / スマサポ','44.4% / 42.3%','のれん 17.59億']]]]
.forEach(g=>{
  dcard(s,g[0],3.3,5.85,1.95,g[2]===C.ACC2?C.ACC:null);
  T(s,g[1],{x:g[0]+0.35,y:3.5,w:5.15,h:0.3,fontSize:13,bold:true,color:g[2]});
  g[3].forEach((r,j)=>{
    const y=3.9+j*0.42;
    T(s,r[0],{x:g[0]+0.35,y:y,w:2.2,h:0.3,fontSize:11,color:C.DKTXT});
    T(s,r[1],{x:g[0]+2.6,y:y,w:1.1,h:0.3,fontSize:11,color:C.DKTXT,align:'right'});
    T(s,r[2],{x:g[0]+3.8,y:y-0.02,w:1.7,h:0.32,fontSize:11.5,bold:true,color:g[2],align:'right'});
  });
});
dcard(s,0.7,5.5,11.9,1.0);
T(s,'ビジョン社への借入7.90億円を、相手の手元資金で返せるか',{x:1.05,y:5.66,w:6.5,h:0.3,fontSize:13,bold:true,color:C.ACC2});
T(s,'CINC：ネット現金 ＋8.30億円 → 自己資金で返済可能（7社で唯一）　／　ログリー：＋3.46億で不足　／　クックビズ：△2.26億　／　他4社は現金の内訳が未入手',
  {x:1.05,y:5.98,w:11.2,h:0.35,fontSize:11,color:C.DKTXT});
T(s,'逆取得の判定は議決権比率だけでなく、取締役の構成や相対的な規模も踏まえて行われます。実際の会計処理は監査法人の確認を要します。',
  {x:0.7,y:6.72,w:11.9,h:0.3,fontSize:9,color:'7F8E9B'});
s.addNotes('のれんが17.59億か8億かで年0.5億近く違う。逆取得は監査法人マター。');

/* 6 返信案 */
s=slide(); light(s);
head(s,'次のステップ','大櫃様への返信と、確認したいこと');
card(s,0.7,1.68,11.9,1.3,C.TINT_A,C.TINT_AL);
T(s,'ご返信の骨子',{x:1.05,y:1.86,w:4,h:0.26,fontSize:10.5,color:C.MUT});
T(s,'「スマサポ・アディッシュ・CINCの3社に関心があります。この順でお話を伺えますか。」',
  {x:1.05,y:2.14,w:11.2,h:0.4,fontSize:18,bold:true,color:C.ACC});
T(s,'CaSyは事業シナジーが魅力なので候補には残しますが、足元の収益と財務から優先度は下げます。クックビズとピクセラは見送ります。',
  {x:1.05,y:2.6,w:11.2,h:0.3,fontSize:11,color:C.INK2});
[['01','各社の現預金と有利子負債の内訳','スマサポ・アディッシュ・CaSyの3社が未入手です。ビジョン社への7.90億をどう返すかに直結します。',C.ACC],
 ['02','あどばる15億円で先方が応じるか','評価額が持分に直結します。15億が上限である以上、先方の目線を早めに確認したいところです。',C.ACC],
 ['03','逆取得になるかどうかの見立て','アディッシュなら52.3%で逆取得の可能性があり、のれんが17.59億から8.27億に下がります。監査法人の見解が要ります。',C.BLUE],
 ['04','スマサポの通期着地','第3四半期累計で営業1.24億（進捗54.3%）。通期2.30億の前提が崩れると1位の根拠が変わります。',C.BLUE]]
.forEach((r,i)=>{
  const y=3.18+i*0.9;
  card(s,0.7,y,11.9,0.78);
  num(s,1.05,y+0.17,0.44,r[0],r[3]);
  T(s,r[1],{x:1.72,y:y+0.13,w:4.0,h:0.28,fontSize:12.5,bold:true,color:C.INK});
  T(s,r[2],{x:1.72,y:y+0.42,w:10.3,h:0.3,fontSize:10,color:C.INK2});
});
T(s,'ビジョン社の出口と借入7.90億円の返済は、どの相手と組んでも必要です。CINCを選べば相手の現金で完結し、それ以外ならみずほ様のリファイナンスが前提になります。',
  {x:0.7,y:6.84,w:11.9,h:0.3,fontSize:10.5,bold:true,color:C.ACC});
s.addNotes('3社に絞って返信。CaSyは残す。①の現預金内訳が次の宿題。');

p.writeFile({fileName:'あどばる_合併候補の再評価_上位3社_20261020.pptx'}).then(()=>console.log('deckE written'));
