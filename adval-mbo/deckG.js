const D=require('./design.js')();
const {p,C,F,T,dark,light,head,card,dcard,stat,badge,num,dot,TH,THR,THC,tbl,cover,slide}=D;
let s;

/* 1 表紙 */
s=slide();
cover(s,'株式会社あどばる','資金調達と、合併後の企業価値',
 '中野の取得資金をどう作るか／合併で本当に価値は上がるのか',
 '2026年10月23日',
 [['作成','株式会社あどばる 代表取締役 中野 邦人'],
  ['前提','スマサポ20億円・あどばる15億円評価／旧あどばる株主は全社売却'],
  ['出所','スマサポ社の公開情報。会計・税務の取扱いは監査法人および税理士の確認を要します']],
 '公開情報にもとづく試算です。法務・税務・会計上の助言ではありません');
s.addNotes('2つの問いに答える資料。結論は「業績連動の有償SOで両方を同時に解く」。');

/* 2 サマリー */
s=slide(); light(s);
head(s,'結論','2つの問いは、1つの設計で同時に解けます');
card(s,0.7,1.62,11.9,1.45,C.TINT_A,C.TINT_AL);
T(s,'現金で株を買うのではなく、シナジーを実現した対価として持分を得る',
  {x:1.05,y:1.84,w:11.2,h:0.4,fontSize:20,bold:true,color:C.ACC});
T(s,'業績条件付きの有償ストックオプションであれば、中野の初期負担は0.5〜1.6億円に収まります。太田氏側から見ても「成果が出たら渡す」形なので、現金で買い増されるより受け入れやすいはずです。価値向上のコミットメントと持分の取得が、同じ仕組みの中で結びつきます。',
  {x:1.05,y:2.3,w:11.2,h:0.65,fontSize:11.5,color:C.INK2,lineSpacingMultiple:1.2});
[['① 資金調達','現金購入なら5.27億円','有償SOなら0.53〜1.58億円','初期負担は3〜10分の1',C.ACC],
 ['② 企業価値','合併だけでは上がらない','営業利益+1.0億のシナジーが必要','実現すればPER17倍で52.6億',C.BLUE]]
.forEach((r,i)=>{
  const x=0.7+i*6.05;
  card(s,x,3.35,5.85,1.75);
  T(s,r[0],{x:x+0.35,y:3.55,w:5.15,h:0.3,fontSize:13.5,bold:true,color:r[4]});
  T(s,r[1],{x:x+0.35,y:3.92,w:5.15,h:0.28,fontSize:11,color:C.MUT});
  T(s,r[2],{x:x+0.35,y:4.2,w:5.15,h:0.34,fontSize:16,bold:true,color:C.INK});
  T(s,r[3],{x:x+0.35,y:4.6,w:5.15,h:0.3,fontSize:11.5,bold:true,color:r[4]});
});
card(s,0.7,5.35,11.9,1.15,C.TINT_P,C.TINT_PL);
T(s,'ただし、順序を間違えないこと',{x:1.05,y:5.52,w:6,h:0.3,fontSize:13,bold:true,color:C.POS});
T(s,'価値が上がらない会社の持分を、借入をしてまで増やす意味はありません。まず②（シナジーが本当に立つか）を確かめ、立つと判断できてから①（どう取得するか）に進むのが正しい順序です。',
  {x:1.05,y:5.86,w:11.2,h:0.5,fontSize:11.5,color:C.INK2});
s.addNotes('順序が大事。②が立たないなら①は不要。15.73%の第2位で十分という選択もある。');

/* 3 資金調達の3層 */
s=slide(); light(s);
head(s,'① 資金調達','3つの手段を組み合わせます');
[['1','業績連動の有償ストックオプション','0.53〜1.58','億円',C.ACC,
  '合併後の会社から、シナジー目標の達成を条件に発行を受けます。公正価値（株価の10〜30%）を払って取得するため報酬課税が生じず、行使時も課税されません。売却時の譲渡所得20.315%のみです。',
  '業績条件を厳しくするほど公正価値は下がります。会社法361条の報酬規制により株主総会決議が必要です。'],
 ['2','中野ファンド（上場株版）','必要額に応じて','',C.BLUE,
  'MBOで構想したファンドを転用します。保有するのが上場株になるため、非上場株を持つMBO版よりも格段に組成しやすくなります。中野がGPとして議決権を集約すれば、大量保有報告書上も共同保有者として扱われます。',
  '金商法63条の適格機関投資家等特例業務の届出が必要です。'],
 ['3','株式担保ローン','2.7','億円程度',C.MUT,
  '合併後に中野が保有する662,093株（5.51億円相当）を担保に入れます。LTV50%で2.7億円程度が目安です。',
  '株価下落時に追加担保を求められます。主軸ではなく補完として使う前提です。']]
.forEach((r,i)=>{
  const x=0.7+i*4.0;
  card(s,x,1.66,3.85,4.9,i===0?C.TINT_A:C.WHITE,i===0?C.TINT_AL:C.LINE);
  num(s,x+0.3,1.88,0.5,r[0],r[4]);
  T(s,r[1],{x:x+0.98,y:1.88,w:2.65,h:0.5,fontSize:12.5,bold:true,color:C.INK});
  T(s,'初期負担',{x:x+0.3,y:2.56,w:3.25,h:0.24,fontSize:9.5,color:C.MUT});
  T(s,[{text:r[2],options:{fontSize:r[2].length>6?15:26,bold:true,color:r[4]}},
       {text:r[3],options:{fontSize:12,bold:true,color:r[4]}}],{x:x+0.3,y:2.78,w:3.25,h:0.55});
  T(s,r[5],{x:x+0.3,y:3.45,w:3.25,h:1.9,fontSize:9.5,color:C.INK2,lineSpacingMultiple:1.25});
  T(s,r[6],{x:x+0.3,y:5.5,w:3.25,h:0.85,fontSize:9,color:C.MUT,lineSpacingMultiple:1.2});
});
T(s,'譲渡制限付株式（RS）での付与は、譲渡制限解除時に給与所得課税が生じ、最高税率なら2.90億円の納税になります。有償SOが税務上は有利です。',
  {x:0.7,y:6.7,w:11.9,h:0.3,fontSize:9,color:C.MUT});
s.addNotes('有償SOが主軸。RSは税金で潰れる。ファンドは上場株だから組みやすい。');

/* 4 取得水準 */
s=slide(); dark(s);
head(s,'① 取得水準','30.80%より、33.34%のほうが意味があります',true);
tbl(s,[
 [{text:'到達水準',options:TH},{text:'中野の持分',options:THR},{text:'追加取得',options:THR},
  {text:'現金なら',options:THR},{text:'流通株式比率',options:THR},{text:'意味',options:TH}],
 [{text:'取得なし',options:{bold:true,color:C.WHITE,fill:'26333F'}},{text:'15.73%',options:{align:'right',color:'B9C4CF',fill:'26333F'}},
  {text:'―',options:{align:'right',color:'B9C4CF',fill:'26333F'}},{text:'0億円',options:{align:'right',color:'B9C4CF',fill:'26333F'}},
  {text:'47.08%',options:{align:'right',color:'7FD1A4',fill:'26333F'}},{text:'第2位。条件は満たす',options:{color:'B9C4CF',fill:'26333F'}}],
 [{text:'太田氏側と同数',options:{bold:true,color:C.WHITE,fill:'26333F'}},{text:'30.80%',options:{align:'right',bold:true,color:C.WHITE,fill:'26333F'}},
  {text:'634,223株',options:{align:'right',color:'B9C4CF',fill:'26333F'}},{text:'5.27億円',options:{align:'right',color:'B9C4CF',fill:'26333F'}},
  {text:'32.01%',options:{align:'right',color:'7FD1A4',fill:'26333F'}},{text:'同率首位。だが権利は増えない',options:{color:'B9C4CF',fill:'26333F'}}],
 [{text:'3分の1超',options:{bold:true,color:C.WHITE,fill:C.ACC}},{text:'33.34%',options:{align:'right',bold:true,color:C.WHITE,fill:C.ACC}},
  {text:'740,941株',options:{align:'right',color:C.WHITE,fill:C.ACC}},{text:'6.16億円',options:{align:'right',bold:true,color:C.WHITE,fill:C.ACC}},
  {text:'29.47%',options:{align:'right',bold:true,color:C.WHITE,fill:C.ACC}},{text:'特別決議の拒否権を持てる',options:{bold:true,color:C.WHITE,fill:C.ACC}}]],
 {x:0.7,y:1.75,w:11.9,colW:[2.3,1.7,1.7,1.5,1.8,2.9],rowH:0.46,fontSize:11,
  border:{type:'solid',color:C.DKLINE,pt:0.5}});
dcard(s,0.7,4.0,5.85,2.35);
T(s,'3分の1超で何ができるか',{x:1.0,y:4.2,w:5.2,h:0.3,fontSize:13.5,bold:true,color:C.ACC2});
T(s,'定款変更、合併・会社分割、事業譲渡、有利発行による第三者割当。これらは特別決議（出席株主の3分の2以上）が必要で、3分の1超を持てば単独で否決できます。\n\n「太田氏側と同数の30.80%」は見た目は対等ですが、会社法上の権利は15.73%のときと何も変わりません。0.89億円の差で、意味のある一線を越えられます。',
  {x:1.0,y:4.56,w:5.25,h:1.6,fontSize:10.5,color:C.DKTXT,lineSpacingMultiple:1.25});
dcard(s,6.75,4.0,5.85,2.35);
T(s,'取得は「売出しへの応募」で行う',{x:7.05,y:4.2,w:5.2,h:0.3,fontSize:13.5,bold:true,color:C.ACC2});
T(s,'3分の1を超える市場外（相対）取得は公開買付けが義務になります。一方、ビジョン社と旧あどばる法人6社の株式を売出しとして市場に出し、中野がそれに応募する形であれば、公開買付規制の適用除外に該当する見込みです。\n\n同じ売出しで残りが市場に配分されるため、流通株式比率も同時に解決します。',
  {x:7.05,y:4.56,w:5.25,h:1.6,fontSize:10.5,color:C.DKTXT,lineSpacingMultiple:1.25});
T(s,'公開買付規制の適用除外の可否は、取得の態様により判断が分かれます。証券会社および弁護士の確認を要します。有償ストックオプションの行使による取得であれば、そもそも公開買付規制の対象外です。',
  {x:0.7,y:6.55,w:11.9,h:0.45,fontSize:9,color:'7F8E9B',lineSpacingMultiple:1.15});
s.addNotes('30.80%に意味はない。33.34%の拒否権が本丸。差は0.89億。');

/* 5 価値は上がるか */
s=slide(); light(s);
head(s,'② 企業価値','合併それ自体では、価値は上がりません');
card(s,0.7,1.66,5.85,2.25,C.TINT_W,C.TINT_WL);
T(s,'単純合算35億円が意味すること',{x:1.0,y:1.86,w:5.2,h:0.3,fontSize:13,bold:true,color:C.WARN});
[['合算営業利益','4.30億円'],['のれん償却（20年）','△0.88億円'],['償却後 営業利益','3.42億円'],
 ['税引後利益（税率30%）','2.39億円'],['35億円が示すPER','14.6倍']].forEach((r,i)=>{
  const y=2.20+i*0.27;
  T(s,r[0],{x:1.0,y:y,w:3.4,h:0.24,fontSize:10.5,color:C.INK2});
  T(s,r[1],{x:4.4,y:y-0.02,w:1.85,h:0.26,fontSize:11.5,bold:true,color:i===1?C.NEG:C.INK,align:'right'});
});
T(s,'のれん償却0.88億円は、確定的なマイナスです。',{x:1.0,y:3.56,w:5.25,h:0.3,fontSize:11,bold:true,color:C.NEG});
card(s,6.75,1.66,5.85,2.25,C.TINT_B,C.TINT_BL);
T(s,'再評価の余地はある',{x:7.05,y:1.86,w:5.2,h:0.3,fontSize:13,bold:true,color:C.BLUE});
[['PER15倍','35.9億円'],['PER17倍','40.7億円'],['PER20倍','47.9億円']].forEach((r,i)=>{
  const x=7.05+i*1.78;
  T(s,r[0],{x,y:2.3,w:1.65,h:0.26,fontSize:10.5,color:C.MUT});
  T(s,r[1],{x,y:2.56,w:1.65,h:0.36,fontSize:16,bold:true,color:C.BLUE});
});
T(s,'グロース市場の小型株としてPER17倍で評価されれば40.7億円。単純合算との差5.7億円は、のれん償却を負ってもなお残る再評価の余地です。ただし市場が評価してくれればの話です。',
  {x:7.05,y:3.04,w:5.25,h:0.55,fontSize:10,color:C.INK2,lineSpacingMultiple:1.2});
T(s,'スマサポ社の通期着地が、この前提を左右します',{x:0.7,y:4.05,w:11.9,h:0.32,fontSize:14,bold:true,color:C.INK});
tbl(s,[
 [{text:'スマサポの営業利益',options:THR},{text:'合算',options:THR},{text:'のれん償却後',options:THR},
  {text:'税引後',options:THR},{text:'PER17倍の時価総額',options:THR},{text:'判定',options:TH}],
 [{text:'2.30億（会社予想）',options:{align:'right',bold:true}},{text:'4.30億',options:{align:'right'}},{text:'3.42億',options:{align:'right'}},
  {text:'2.39億',options:{align:'right'}},{text:'40.7億',options:{align:'right',bold:true,color:C.POS}},{text:'合算35億を上回る',options:{color:C.POS}}],
 [{text:'2.00億',options:{align:'right'}},{text:'4.00億',options:{align:'right'}},{text:'3.12億',options:{align:'right'}},
  {text:'2.18億',options:{align:'right'}},{text:'37.1億',options:{align:'right',color:C.POS}},{text:'上回る',options:{color:C.POS}}],
 [{text:'1.80億',options:{align:'right'}},{text:'3.80億',options:{align:'right'}},{text:'2.92億',options:{align:'right'}},
  {text:'2.04億',options:{align:'right'}},{text:'34.8億',options:{align:'right',color:C.NEG}},{text:'合算35億を下回る',options:{color:C.NEG}}],
 [{text:'1.60億',options:{align:'right'}},{text:'3.60億',options:{align:'right'}},{text:'2.72億',options:{align:'right'}},
  {text:'1.90億',options:{align:'right'}},{text:'32.4億',options:{align:'right',color:C.NEG}},{text:'下回る',options:{color:C.NEG}}]],
 {x:0.7,y:4.38,w:11.9,colW:[2.6,1.6,2.0,1.5,2.5,1.7],rowH:0.40,fontSize:11});
T(s,'第3四半期累計の営業利益は1.24億円（前年比△36.4%）、通期予想2.30億円に対する進捗は54.3%です。1.80億円を下回る着地なら、合併しても単純合算を割ります。11月中旬の本決算を待つ価値があります。',
  {x:0.7,y:6.48,w:11.9,h:0.5,fontSize:10.5,bold:true,color:C.ACC,lineSpacingMultiple:1.15});
s.addNotes('スマサポの着地が全ての前提。11月の本決算は必ず確認してから動く。');

/* 6 価値を上げる3つ */
s=slide(); dark(s);
head(s,'② 企業価値','価値を上げるのは、この3つだけです',true);
[['01','シナジーで営業利益を+1.0億円','管理会社ネットワークから空室・共用部・遊休区画の供給を受け、出店を年5〜10拠点加速する。1拠点あたり年商2,000〜3,000万円なら増収1〜3億円。営業利益+1.0億でPER17倍なら52.6億円まで届きます。','+17.6億円'],
 ['02','時価総額40億円を超える','東証グロースは上場10年経過後に時価総額40億円が必要です。スマサポ社は2032年12月が期限。合併後35億円ではまだ届きません。先方が合併を検討する動機はここにある可能性が高く、共同目標として掲げられます。','機関投資家の投資対象へ'],
 ['03','のれんの負担を抑える','あどばる側が50%を超えると逆取得となり、のれんは「スマサポの時価総額−純資産」で計算され14.29億円に下がります。年償却は0.88億から0.71億へ。ただし逆取得では あどばるの簿価を引き継ぐため連結純資産は薄くなります。','年0.17億円の改善'],
 ['04','やらないという選択','上の3つが立たないなら、中野は15.73%の第2位のまま持ち出しゼロで構いません。条件は満たしています。価値が上がらない会社の持分を、借入をしてまで増やす理由はありません。','持ち出し0円']]
.forEach((r,i)=>{
  const x=0.7+(i%2)*6.05, y=1.85+Math.floor(i/2)*2.35;
  dcard(s,x,y,5.85,2.1,i===3?C.ACC:null);
  T(s,r[0],{x:x+0.3,y:y+0.24,w:0.9,h:0.35,fontSize:15,bold:true,color:C.ACC2});
  T(s,r[1],{x:x+1.15,y:y+0.22,w:3.1,h:0.4,fontSize:13.5,bold:true,color:C.WHITE});
  T(s,r[3],{x:x+4.2,y:y+0.26,w:1.35,h:0.32,fontSize:11,bold:true,color:C.ACC2,align:'right'});
  T(s,r[2],{x:x+0.3,y:y+0.72,w:5.25,h:1.2,fontSize:10,color:C.DKTXT,lineSpacingMultiple:1.2});
});
T(s,'①は契約でKPI化しない限り実現しません。管理会社ネットワーク経由の物件供給数を、年次の数値目標として合併契約に書き込むことをお勧めします。',
  {x:0.7,y:6.7,w:11.9,h:0.32,fontSize:12,bold:true,color:C.ACC2});
s.addNotes('シナジーは契約に書かないと実現しない。④の選択肢も常に持っておく。');

/* 7 妙案 */
s=slide(); light(s);
head(s,'ご提案','①と②を、ひとつの仕組みで結びつける');
card(s,0.7,1.66,11.9,1.5,C.TINT_A,C.TINT_AL);
T(s,'シナジー目標の達成を条件とした有償ストックオプションを、中野に発行する',
  {x:1.05,y:1.88,w:11.2,h:0.4,fontSize:19,bold:true,color:C.ACC});
T(s,'中野は現金で株を買うのではなく、価値を上げた結果として持分を得ます。太田氏側にとっては「成果が出たら渡す」形になるため、現金で買い増されるよりも受け入れやすい提案になります。',
  {x:1.05,y:2.34,w:11.2,h:0.6,fontSize:11.5,color:C.INK2,lineSpacingMultiple:1.2});
[['対象株数','740,941株','3分の1超に届く水準',C.ACC],
 ['初期負担','0.62〜1.85億円','公正価値10〜30%の範囲',C.ACC],
 ['行使価額','831.53円','合併時の1株価値',C.INK],
 ['業績条件','営業利益 +1.0億円','管理会社経由の物件供給数も併記',C.BLUE]]
.forEach((r,i)=>{
  const x=0.7+i*3.02;
  card(s,x,3.35,2.85,1.5);
  T(s,r[0],{x:x+0.25,y:3.53,w:2.4,h:0.24,fontSize:10,color:C.MUT});
  T(s,r[1],{x:x+0.25,y:3.78,w:2.4,h:0.36,fontSize:15,bold:true,color:r[3]});
  T(s,r[2],{x:x+0.25,y:4.2,w:2.4,h:0.5,fontSize:9.5,color:C.INK2,lineSpacingMultiple:1.15});
});
[['この形の利点',C.POS,C.TINT_P,C.TINT_PL,
  ['中野の初期負担が現金購入の3〜10分の1で済む','付与時・行使時に課税されず、売却時の20.315%のみ',
   '公開買付規制の対象外（発行会社からの取得のため）','シナジーが立たなければ行使されず、誰も損をしない']],
 ['先に詰めるべきこと',C.WARN,C.TINT_W,C.TINT_WL,
  ['スマサポ社の11月本決算（通期2.30億の着地）','会社法361条に基づく株主総会決議と、太田氏側の同意',
   '公正価値の算定（業績条件の厳しさで大きく変わる）','のれんの会計処理を監査法人と事前に確認']]]
.forEach((g,i)=>{
  const x=0.7+i*6.05;
  card(s,x,5.05,5.85,1.45,g[2],g[3]);
  T(s,g[0],{x:x+0.35,y:5.22,w:5.15,h:0.28,fontSize:12.5,bold:true,color:g[1]});
  g[4].forEach((t,j)=>{
    const y=5.56+Math.floor(j/2)*0.42, xx=x+0.35+(j%2)*2.6;
    dot(s,xx,y+0.07,g[1],0.12);
    T(s,t,{x:xx+0.24,y:y,w:2.3,h:0.4,fontSize:8.5,color:C.INK2,lineSpacingMultiple:1.1});
  });
});
T(s,'有償ストックオプションの設計・公正価値算定・税務上の取扱いは、弁護士・税理士・評価機関の確認を要します。',
  {x:0.7,y:6.7,w:11.9,h:0.3,fontSize:9,color:C.MUT});
s.addNotes('これが答え。現金を出さずに、成果と引き換えに持分を取る。');

p.writeFile({fileName:'あどばる_資金調達と合併後の企業価値_20261023.pptx'}).then(()=>console.log('deckG written'));
