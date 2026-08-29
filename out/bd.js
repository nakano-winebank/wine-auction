const pptxgen = require('pptxgenjs');
const fs = require('fs');
const D = JSON.parse(fs.readFileSync('bd_data.json','utf8'));
const p = new pptxgen();
p.layout = 'LAYOUT_WIDE';
p.author = '株式会社WineBank';
p.title  = 'WineBank 新規販売チャネル計画';

const W=13.3, H=7.5;
// WineBank ハウススタイル：白基調 ＋ 黒 ＋ ゴールド ／ メイリオ
const BERRY='1A1A1A', ROSE='6E6E6E', CREAM='FAF3E2', SAND='FFFFFF';
const INK='1A1A1A', MUT='8C8C8C', WHT='FFFFFF', GOLD='A98442', LINE='E2E0DC', RED='6E6E6E';
const HF='メイリオ', BF='メイリオ';
const sh=()=>({type:'outer',color:'000000',blur:9,offset:2,angle:90,opacity:0.08});
const M=v=>(v<0?'▲':'')+(Math.abs(v)/1e6).toFixed(1);
const yen=v=>(v<0?'▲':'')+Math.abs(v).toLocaleString('en-US');

function base(t,sub){
  const s=p.addSlide(); s.background={color:SAND};
  s.addText(t,{x:0.65,y:0.42,w:W-1.3,h:0.62,fontFace:HF,fontSize:29,bold:true,color:BERRY,margin:0});
  if(sub) s.addText(sub,{x:0.65,y:1.06,w:W-1.3,h:0.34,fontFace:BF,fontSize:12.5,color:MUT,margin:0});
  return s;
}
const foot=(s,t)=>s.addText(t,{x:0.65,y:H-0.52,w:W-1.3,h:0.3,fontFace:BF,fontSize:8.5,color:MUT,margin:0});
const card=(s,x,y,w,h,fill)=>s.addShape(p.ShapeType.roundRect,{x,y,w,h,fill:{color:fill||WHT},rectRadius:0.05,line:{color:LINE,width:0.75},shadow:sh()});
function numDot(s,x,y,n){
  s.addShape(p.ShapeType.ellipse,{x,y,w:0.34,h:0.34,fill:{color:BERRY}});
  s.addText(String(n),{x,y,w:0.34,h:0.34,fontFace:BF,fontSize:13,bold:true,color:WHT,align:'center',valign:'middle',margin:0});
}
function table(s,x0,y0,cols,rows,opt){
  const o=opt||{}, rh=o.rh||0.46, hh=o.hh||0.42;
  const tw=cols.reduce((a,c)=>a+c.w,0);
  s.addShape(p.ShapeType.rect,{x:x0,y:y0,w:tw,h:hh,fill:{color:BERRY}});
  let cx=x0;
  cols.forEach(c=>{ s.addText(c.t,{x:cx+0.12,y:y0,w:c.w-0.24,h:hh,fontFace:BF,fontSize:o.hs||9.5,bold:true,color:WHT,align:c.a||'left',valign:'middle',margin:0}); cx+=c.w; });
  rows.forEach((r,i)=>{
    const y=y0+hh+i*rh, hl=o.hi&&o.hi.includes(i);
    s.addShape(p.ShapeType.rect,{x:x0,y,w:tw,h:rh,fill:{color:hl?CREAM:(i%2?'FBFAF8':WHT)},line:{color:LINE,width:0.5}});
    let x=x0;
    cols.forEach((c,j)=>{
      const v=r[j], neg=String(v).startsWith('▲');
      s.addText(String(v),{x:x+0.12,y,w:c.w-0.24,h:rh,fontFace:BF,fontSize:o.fs||10.5,bold:hl||j===0&&o.b0,
        color: neg?RED:(hl?BERRY:INK),align:c.a||'left',valign:'middle',margin:0});
      x+=c.w;
    });
  });
  return y0+hh+rows.length*rh;
}


const Y=['Y1','Y2','Y3'], YL_=['Y1\nFY2027','Y2\nFY2028','Y3\nFY2029'];
const m=v=>(v<0?'▲':'')+(Math.abs(v)/1e6).toFixed(1);

/* 1 表紙 */
{
  const s=p.addSlide(); s.background={color:WHT};
  s.addShape(p.ShapeType.rect,{x:0,y:0,w:0.16,h:H,fill:{color:INK}});
  s.addText('株式会社WineBank',{x:0.9,y:1.7,w:9,h:0.4,fontFace:BF,fontSize:13,color:GOLD,charSpacing:3,margin:0});
  s.addText('新規販売チャネル計画',{x:0.9,y:2.2,w:11,h:0.95,fontFace:HF,fontSize:44,bold:true,color:INK,margin:0});
  s.addText('ホテル ／ ブランドレジデンス ／ 金融機関 ／ 日本ワイン輸出',
    {x:0.9,y:3.3,w:11,h:0.6,fontFace:HF,fontSize:20,color:'4A4A4A',margin:0});
  s.addText('FY2027 － FY2029　3か年',{x:0.9,y:4.5,w:6,h:0.34,fontFace:BF,fontSize:13,color:INK,margin:0});
  s.addText('2026年8月',{x:0.9,y:4.9,w:6,h:0.34,fontFace:BF,fontSize:13,color:MUT,margin:0});
  s.addText('本資料の数値は積み上げの試算であり、確定した受注ではありません。前提は各ページに明記しています。',
    {x:0.9,y:6.5,w:11,h:0.34,fontFace:BF,fontSize:9.5,color:MUT,margin:0});
  s.addNotes('レッドオーシャンを避け、在庫を手放さずに稼ぐチャネルを軸に据えた4本立て。');
}

/* 2 全体像 */
{
  const s=base('4つのチャネル － 3か年の姿','いずれも既存の富裕層直販とは競合せず、相手の顧客基盤・販促予算の上に乗せます。');
  const rows=Object.keys(D.ch).map(k=>{
    const c=D.ch[k];
    return [k+'. '+c.name, m(c.rev.Y1), m(c.rev.Y2), m(c.rev.Y3), m(c.gp.Y3)];
  });
  rows.push(['売上 合計', m(D.tot.Y1.rev), m(D.tot.Y2.rev), m(D.tot.Y3.rev), m(D.tot.Y3.gp)]);
  table(s,0.65,1.62,[{t:'チャネル',w:4.0},{t:'Y1 FY2027',w:1.85,a:'right'},{t:'Y2 FY2028',w:1.85,a:'right'},
    {t:'Y3 FY2029',w:1.85,a:'right'},{t:'Y3 粗利',w:1.85,a:'right'}],rows,{rh:0.44,hi:[4],hs:9,fs:11});
  const kp=[['Y3 売上','490.4百万円'],['Y3 粗利','139.7百万円（28.5%）'],['Y3 営業利益 貢献','＋59.7百万円']];
  kp.forEach((k,i)=>{
    const x=0.65+i*4.0;
    card(s,x,4.62,3.75,1.05,i===2?CREAM:WHT);
    s.addText(k[0],{x:x+0.3,y:4.76,w:3.2,h:0.28,fontFace:BF,fontSize:10,color:MUT,margin:0});
    s.addText(k[1],{x:x+0.3,y:5.04,w:3.2,h:0.44,fontFace:HF,fontSize:17,bold:true,color:BERRY,margin:0});
  });
  card(s,0.65,5.88,11.99,0.82,BERRY);
  s.addText('Y1は立ち上げ期で営業利益はほぼ均衡（▲1.0百万円）。FY2027のプランEを埋めるのは私募とオークションで、この4チャネルはFY2028以降の柱です。',
    {x:1.0,y:5.88,w:11.3,h:0.82,fontFace:BF,fontSize:11.5,bold:true,color:WHT,valign:'middle',margin:0});
  foot(s,'追加販管費（専任人員 Y1 1.5名→Y3 6名）を控除後の営業利益貢献。単位：百万円');
  s.addNotes('Y1で数字は出ない。ここを正直に言うことが信用になる。効いてくるのはY2以降。');
}

/* 3 考え方 */
{
  const s=base('「売先」ではなく「置き場所」を増やす','仕入を落とさない方針と、在庫を持ったまま収益が立つチャネルは同じ方向を向いています。');
  const pts=[['仕入を落とせない','絞ると生産者からの割当が戻らず、2〜3年先の成長を失う。プランDも仕入419.1百万円の維持が前提。'],
             ['しかし在庫は資金を固定する','420百万円の在庫は、売れるまで一円も生まない。ここが今までの構造的な弱点。'],
             ['置き場所を増やせば両立する','所有権を手放さずに設置し、レンタル料と販売手数料を取る。在庫が「稼働資産」に変わる。']];
  pts.forEach((t,i)=>{
    const y=1.62+i*1.5;
    card(s,0.65,y,7.5,1.34);
    numDot(s,0.95,y+0.5,i+1);
    s.addText(t[0],{x:1.45,y:y+0.2,w:6.4,h:0.4,fontFace:BF,fontSize:14,bold:true,color:INK,margin:0});
    s.addText(t[1],{x:1.45,y:y+0.64,w:6.4,h:0.6,fontFace:BF,fontSize:10.5,color:'4A4A4A',valign:'top',margin:0});
  });
  card(s,8.5,1.62,4.15,4.5,BERRY);
  s.addText('Y3末の稼働在庫',{x:8.8,y:1.92,w:3.55,h:0.3,fontFace:BF,fontSize:11,color:'D9D7D2',align:'center',margin:0});
  s.addText('240.0',{x:8.8,y:2.24,w:3.55,h:0.85,fontFace:HF,fontSize:42,bold:true,color:GOLD,align:'center',margin:0});
  s.addText('百万円',{x:8.8,y:3.08,w:3.55,h:0.3,fontFace:BF,fontSize:11,color:'D9D7D2',align:'center',margin:0});
  s.addShape(p.ShapeType.line,{x:9.0,y:3.55,w:3.15,h:0,line:{color:'6E6E6E',width:1}});
  s.addText('自社在庫420百万円のうち\n57%がホテル・クラブ60施設に\n設置され、レンタル料を生みます。',
    {x:8.8,y:3.78,w:3.55,h:1.1,fontFace:BF,fontSize:11,color:WHT,align:'center',lineSpacing:19,margin:0});
  s.addText('在庫は減らないため、\n仕入を維持したままで成立します。',
    {x:8.8,y:5.1,w:3.55,h:0.8,fontFace:BF,fontSize:10.5,color:GOLD,align:'center',lineSpacing:17,margin:0});
  foot(s,'設置在庫は1施設あたり時価4百万円（グラン・ヴァン50〜80本相当）を標準とした試算。');
  s.addNotes('銀行にもパートナーにも効く一枚。在庫が遊んでいないことを示す。');
}

/* チャネル詳細の共通レンダラ */
function chSlide(s, approach, first, econ, ramp, risk, footNote){
  s.addText('アプローチ',{x:0.65,y:1.52,w:5.9,h:0.3,fontFace:BF,fontSize:11.5,bold:true,color:GOLD,margin:0});
  approach.forEach((a,i)=>{
    const y=1.84+i*0.92;
    card(s,0.65,y,5.9,0.82);
    s.addText(a[0],{x:0.95,y:y+0.09,w:5.3,h:0.28,fontFace:BF,fontSize:10.5,bold:true,color:INK,margin:0});
    s.addText(a[1],{x:0.95,y:y+0.37,w:5.3,h:0.40,fontFace:BF,fontSize:9,color:'4A4A4A',valign:'top',margin:0});
  });
  card(s,0.65,4.62,5.9,0.72,CREAM);
  s.addText('初弾の相手',{x:0.95,y:4.7,w:5.3,h:0.24,fontFace:BF,fontSize:9,bold:true,color:GOLD,margin:0});
  s.addText(first,{x:0.95,y:4.93,w:5.3,h:0.36,fontFace:BF,fontSize:9,color:INK,valign:'top',margin:0});
  s.addText('ユニット経済',{x:6.75,y:1.52,w:5.9,h:0.3,fontFace:BF,fontSize:11.5,bold:true,color:GOLD,margin:0});
  card(s,6.75,1.84,5.9,0.28+econ.length*0.30,CREAM);
  econ.forEach((e,i)=>{
    const y=1.98+i*0.30;
    s.addText(e[0],{x:7.05,y,w:3.6,h:0.28,fontFace:BF,fontSize:10,color:INK,valign:'middle',margin:0});
    s.addText(e[1],{x:10.45,y,w:1.9,h:0.28,fontFace:BF,fontSize:10,bold:true,color:BERRY,align:'right',valign:'middle',margin:0});
  });
  const ry=1.84+0.28+econ.length*0.30+0.16;
  s.addText('3か年の積み上げ',{x:6.75,y:ry,w:5.9,h:0.3,fontFace:BF,fontSize:11.5,bold:true,color:GOLD,margin:0});
  table(s,6.75,ry+0.32,[{t:'',w:2.0},{t:'Y1 FY2027',w:1.3,a:'right'},{t:'Y2 FY2028',w:1.3,a:'right'},{t:'Y3 FY2029',w:1.3,a:'right'}],
    ramp,{rh:0.32,hh:0.32,hs:8.5,fs:9.5,hi:[0]});
  card(s,0.65,5.90,11.99,0.78,BERRY);
  s.addText(risk,{x:1.0,y:5.90,w:11.3,h:0.78,fontFace:BF,fontSize:10.5,color:WHT,valign:'middle',margin:0});
  foot(s,footNote);
}

/* 4 ①ホテル・会員制クラブ */
{
  const s=base('① ホテル・会員制クラブ － セラーのディスプレイ・レンタル','買わずに置ける提案。所有権はWineBankのままなので、先方に在庫リスクがありません。');
  chSlide(s,
    [['窓口は総支配人ではなくF&Bディレクター／シェフソムリエ','ワインリストの原価と在庫回転に責任を持つ人。「買わずに置ける」は彼らのP&Lを直接助ける提案です。'],
     ['最短ルートはApiciusのシェフソムリエ経由の紹介','日本ソムリエ協会の横のつながりが効きます。飛び込みではなく紹介で入る。'],
     ['購入ではないので稟議が軽い','資産計上を伴わないため、多くの施設でF&B部門長の決裁で通ります。初回商談から設置まで2〜3か月。']],
    '星のや／虹夕諾雅、アマン、ブルガリ、パレスホテル、東京アメリカンクラブ、リゾートトラスト（会員14.5万人・20.5万口）',
    [['1施設あたり設置在庫（時価）','4.0百万円'],['レンタル料率（年）','8% ＝ 0.32百万円'],
     ['年間販売転換率','30% ＝ 1.20百万円'],['販売の粗利率（RS控除後）','25%'],
     ['1施設あたり 年間売上／粗利','1.52 ／ 0.62百万円']],
    [['施設数（期末）','10','30','60'],['売上（百万円）',m(D.ch['1'].rev.Y1),m(D.ch['1'].rev.Y2),m(D.ch['1'].rev.Y3)],
     ['粗利（百万円）',m(D.ch['1'].gp.Y1),m(D.ch['1'].gp.Y2),m(D.ch['1'].gp.Y3)],['稼働在庫（百万円）','40','120','240']],
    'リスク：什器の初期調達と、破損・盗難の保険設計。開栓・提供が発生すると実質は販売にあたるため、契約形態を国税局の酒類指導官に事前確認します。',
    '販売転換率30%は設置在庫の時価に対する年間回転。レンタル料率はアートのレンタル相場を参照点に置いた仮値で、パイロット3施設で検証します。');
  s.addNotes('最大の利点は稟議の軽さ。購入ではないので部門長決裁で通る。まず3施設のパイロットで料率と回転率を検証する。');
}

/* 5 ③ブランドレジデンス */
{
  const s=base('③ ブランドレジデンス － 引渡し時のオプション商材','ワイン会社は不動産の販売チャネルを持たず、デベロッパーはワインの目利きを持たない。だから空いています。');
  chSlide(s,
    [['窓口は商品企画部と販売推進部','仕様を決めるのが商品企画部、オプションを売るのが販売推進部。両方に同時に当てる。'],
     ['新築は仕様確定が竣工の18〜24か月前','今から入って新築で売上になるのは2年後。Y1に数字を出すなら別ルートが要ります。'],
     ['最短ルートはモデルルームへの実物設置','①と同じレンタル契約でモデルルームに置き、販促協力の実績を作ってからオプション化を提案する。3〜6か月。']],
    '三菱地所レジデンス（ザ・パークハウス グラン）、三井不動産レジデンシャル、野村不動産、住友不動産、森ビル。ホテルブランデッドレジデンスは特に相性が良い',
    [['1棟あたり採用戸数','4戸'],['1戸あたり単価','4.0百万円'],
     ['　内訳（セラー／ワイン100本）','1.5 ／ 2.5百万円'],
     ['1戸あたり粗利（15%／30%）','0.98百万円（24.4%）'],
     ['1棟あたり 売上／粗利','16.0 ／ 3.9百万円']],
    [['棟数','1','5','12'],['売上（百万円）',m(D.ch['3'].rev.Y1),m(D.ch['3'].rev.Y2),m(D.ch['3'].rev.Y3)],
     ['粗利（百万円）',m(D.ch['3'].gp.Y1),m(D.ch['3'].gp.Y2),m(D.ch['3'].gp.Y3)],
     ['新規CLUB会員（名）','4','20','48']],
    '本当の価値は売上ではなく顧客獲得です。3年で72名の富裕層が、デベロッパーの販促費で獲得できてWineBank CLUBの会員になります。',
    'Y1の1棟はモデルルーム経由での先行案件を想定。新築の本格化はY2以降。採用率は総戸数50戸の物件で8%を仮置き。');
  s.addNotes('顧客獲得コストが相手の販促費で賄われるのが本質。売上より会員数72名のほうが効く。');
}

/* 6 ⑤金融機関 */
{
  const s=base('⑤ 金融機関 － 富裕層顧客への贈答プログラム','相手の販促予算で買ってもらい、相手の顧客リストがそのままWineBankの接点になります。');
  chSlide(s,
    [['窓口は富裕層営業部／プライベートバンキング部の販促担当','地銀は他行と被らない差別化コンテンツを常に探しています。ワインは競合が薄い。'],
     ['予算編成期を外すと1年待ち','地銀の販促予算は12月〜2月に固まります。ここに当てるのが鉄則。初回接触から発注まで6〜12か月。'],
     ['贈答単体では売らず、セミナーとセットにする','「ワイン投資と相続・現物資産」のセミナーを提供。銀行は顧客接点イベントを欲しがります。']],
    'FPGは第一地方銀行グループ61行すべてとビジネスマッチング契約を締結済み。資本提携の議論とこのチャネルは、ここで接続できます',
    [['1行あたり 年間件数','200件'],['1件あたり単価','5万円'],['1行あたり 年間売上','10.0百万円'],
     ['粗利率（法人一括）','25%'],['1行あたり 年間粗利','2.5百万円']],
    [['提携行数','2','8','18'],['売上（百万円）',m(D.ch['5'].rev.Y1),m(D.ch['5'].rev.Y2),m(D.ch['5'].rev.Y3)],
     ['粗利（百万円）',m(D.ch['5'].gp.Y1),m(D.ch['5'].gp.Y2),m(D.ch['5'].gp.Y3)],
     ['富裕層への接点（名/年）','400','1,600','3,600']],
    '狙いは贈答の粗利ではありません。Y3で年3,600名の富裕層に、銀行の信用を借りて接触できることです。ここから保管とファンドへの送客が起きます。',
    '1行あたり200件は預かり資産上位層への贈答を想定した仮値。実際の件数は各行の富裕層顧客数に依存します。');
  s.addNotes('贈答は入り口。本業への送客が目的。FPGの61行チャネルが使えれば一気に加速する。');
}

/* 7 ⑨日本ワイン */
{
  const s=base('⑨ 日本ワイン 高級帯の輸出 － 収益源ではなく布石','ジャパニーズウイスキーは混んでいますが、日本ワインの高級帯はまだ空いています。');
  chSlide(s,
    [['生産者の課題は「海外での価格形成と真贋」','WineBankの保管・時価評価・所有権管理がそのまま刺さります。数を絞ってトップ生産者と組む。'],
     ['輸出酒類卸売業免許の取得が先','申請から3〜6か月。Y1はここと生産者契約で終わります。'],
     ['売り先は①③⑤で作った接点に載せる','香港・シンガポール・台湾のファインワイン商社と、プライベートバンクの顧客イベント。新規開拓はしない。']],
    '山梨・長野のトップ生産者に数を絞って打診。規模は追わず、独占的な取扱い銘柄を持つことを目的とします',
    [['粗利率','40%'],['Y1の位置づけ','免許取得・生産者契約'],['Y2 ／ Y3 の生産者数','5社 ／ 10社']],
    [['売上（百万円）',m(D.ch['9'].rev.Y1),m(D.ch['9'].rev.Y2),m(D.ch['9'].rev.Y3)],
     ['粗利（百万円）',m(D.ch['9'].gp.Y1),m(D.ch['9'].gp.Y2),m(D.ch['9'].gp.Y3)]],
    '4チャネルのなかで最も小さく、最も遅い。それでも入れるのは、他の3つが「他社の商品を運ぶ」話なのに対し、これだけがWineBank固有の資産になるからです。',
    '日本ワインの輸出は国全体でも小規模な市場です。ここでの数字は規模ではなく、独占的な取扱い銘柄を持つことを目的としています。');
  s.addNotes('正直に、小さいと言う。価値は独自商材とIPOストーリー。');
}

/* 8 3か年の積み上げ */
{
  const s=base('3か年の積み上げ','単位：百万円。追加販管費は専任人員（Y1 1.5名 → Y3 6名）の人件費です。');
  const rows=[];
  Object.keys(D.ch).forEach(k=>{
    const c=D.ch[k];
    rows.push(['　'+k+'. '+c.name, m(c.rev.Y1), m(c.rev.Y2), m(c.rev.Y3)]);
  });
  rows.push(['売上 合計', m(D.tot.Y1.rev), m(D.tot.Y2.rev), m(D.tot.Y3.rev)]);
  rows.push(['粗利 合計', m(D.tot.Y1.gp), m(D.tot.Y2.gp), m(D.tot.Y3.gp)]);
  rows.push(['粗利率', (D.tot.Y1.gmr*100).toFixed(1)+'%', (D.tot.Y2.gmr*100).toFixed(1)+'%', (D.tot.Y3.gmr*100).toFixed(1)+'%']);
  rows.push(['追加販管費（専任人員）', '▲'+m(D.tot.Y1.sga), '▲'+m(D.tot.Y2.sga), '▲'+m(D.tot.Y3.sga)]);
  rows.push(['営業利益 貢献', m(D.tot.Y1.op), m(D.tot.Y2.op), m(D.tot.Y3.op)]);
  table(s,0.65,1.62,[{t:'',w:5.0},{t:'Y1 FY2027',w:2.33,a:'right'},{t:'Y2 FY2028',w:2.33,a:'right'},{t:'Y3 FY2029',w:2.33,a:'right'}],
    rows,{rh:0.37,hi:[4,5,8],fs:10.5});
  card(s,0.65,5.52,5.85,1.15,BERRY);
  s.addText('プランEとの関係',{x:0.95,y:5.68,w:5.25,h:0.3,fontFace:BF,fontSize:11,bold:true,color:GOLD,margin:0});
  s.addText('FY2027のプランE（私募＋オークション300百万円）を埋めるのは、この4チャネルではありません。Y1の貢献は48.6百万円です。',
    {x:0.95,y:5.98,w:5.25,h:0.62,fontFace:BF,fontSize:10,color:WHT,valign:'top',margin:0});
  card(s,6.8,5.52,5.85,1.15,CREAM);
  s.addText('上場計画との関係',{x:7.1,y:5.68,w:5.25,h:0.3,fontFace:BF,fontSize:11,bold:true,color:INK,margin:0});
  s.addText('資本政策が想定する上場時（FY2029）の純利益439百万円に対し、Y3の粗利139.7百万円が積み上がります。',
    {x:7.1,y:5.98,w:5.25,h:0.62,fontFace:BF,fontSize:10,color:INK,valign:'top',margin:0});
  foot(s,'粗利率28.5%はプランD・Eで用いた差額売上の粗利率30%とほぼ整合します。');
  s.addNotes('Y1は均衡。Y2から効く。上場時の利益目標への寄与で締める。');
}

/* 9 90日アクションプラン */
{
  const s=base('最初の90日','いずれも先方の予算や仕様確定のサイクルに乗る必要があるため、入り口を間違えると1年遅れます。');
  const ph=[['Day 1–30　準備',[
      '① 委託販売契約とディスプレイ・レンタル契約のひな型を作成／酒類指導官へ契約形態を事前確認',
      '③ デベロッパー5社の商品企画部の窓口を特定／モデルルーム設置の提案書を1本',
      '⑤ 地銀3行を選定（FPG提携先から）／各行の予算編成期を確認',
      '⑨ 輸出酒類卸売業免許の申請書類を準備']],
    ['Day 31–60　初回接触',[
      '① Apiciusのシェフソムリエ経由で3施設に打診、1施設で設置合意',
      '③ デベロッパー2社と初回面談、モデルルーム設置を提案',
      '⑤ 2行に初回提案／「ワイン投資と相続」セミナーの企画書を提示',
      '⑨ 山梨・長野のトップ生産者3社に打診']],
    ['Day 61–90　着地',[
      '① 3施設の設置を完了、月次レポートの運用を開始（料率と回転率の検証開始）',
      '③ モデルルーム1件の設置合意',
      '⑤ 1行で次年度予算への計上の内諾',
      '⑨ 免許申請を提出']]];
  ph.forEach((t,i)=>{
    const y=1.62+i*1.66;
    card(s,0.65,y,11.99,1.5,i===0?CREAM:WHT);
    s.addText(t[0],{x:1.0,y:y+0.14,w:3.4,h:0.32,fontFace:BF,fontSize:12.5,bold:true,color:BERRY,margin:0});
    t[1].forEach((l,j)=>{
      s.addText('・'+l,{x:1.0,y:y+0.5+j*0.245,w:11.2,h:0.24,fontFace:BF,fontSize:9.5,color:INK,margin:0});
    });
  });
  foot(s,'90日で売上を作るのではなく、①で3施設の実データ、⑤で1行の予算内諾を取ることが目標です。');
  s.addNotes('90日のゴールは受注ではなく検証。①のパイロット3施設のデータが、他の全チャネルの提案根拠になる。');
}

/* 10 前提とリスク */
{
  const s=base('前提とリスク','数字はすべて積み上げの試算です。確定した受注ではありません。');
  const items=[
    ['酒類販売業免許の区分','飲食店・ホテルへの販売は小売免許の範囲。酒販店への卸には洋酒卸売業免許、輸出には輸出酒類卸売業免許が別途必要です。ディスプレイ・レンタルは形式上「販売」ではありませんが、現場で開栓・提供されれば実質は販売にあたるため、契約設計を国税局の酒類指導官に事前確認します。'],
    ['① 料率と回転率は未検証','レンタル年8%・販売転換30%はアートのレンタル相場を参照点に置いた仮値です。パイロット3施設の実データで置き換えます。'],
    ['③ 新築のリードタイム','仕様確定は竣工の18〜24か月前。Y1の1棟はモデルルーム経由の先行案件を前提としており、本格化はY2以降です。'],
    ['⑤ 予算サイクル','地銀の販促予算は12月〜2月に固まります。この時期を外すと丸1年遅れます。FPGとの関係構築が加速要因になります。'],
    ['⑨ 供給制約','日本ワインの高級帯は生産量が絶対的に少なく、規模は追えません。免許取得に3〜6か月かかります。'],
    ['共通：人員','Y3の6名体制が前提です。採用が遅れれば、そのまま立ち上がりが遅れます。']];
  items.forEach((it,i)=>{
    const y=1.58+i*0.85;
    s.addShape(p.ShapeType.rect,{x:0.65,y,w:11.99,h:0.78,fill:{color:i%2?'FBFAF8':WHT},line:{color:LINE,width:0.5}});
    s.addText(it[0],{x:0.95,y:y+0.06,w:2.9,h:0.66,fontFace:BF,fontSize:10.5,bold:true,color:BERRY,valign:'middle',margin:0});
    s.addText(it[1],{x:3.95,y:y+0.06,w:8.4,h:0.66,fontFace:BF,fontSize:9.5,color:INK,valign:'middle',margin:0});
  });
  foot(s,'株式会社WineBank');
  s.addNotes('前提を先に開示する。パイロットで置き換えると明言することが信用になる。');
}

p.writeFile({fileName:'WineBank_新規販売チャネル計画.pptx'}).then(f=>console.log('written:',f));
