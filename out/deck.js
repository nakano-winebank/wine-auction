const pptxgen = require('pptxgenjs');
const p = new pptxgen();
p.layout = 'LAYOUT_WIDE';           // 13.3 x 7.5
p.author = '株式会社WineBank';
p.title  = 'WineBank 事業再生計画 FY2027';

const W=13.3, H=7.5;
const BERRY='6D2E46', ROSE='A26769', CREAM='ECE2D0', SAND='F7F3EF';
const INK='2B2B2B', MUT='7A6A64', WHT='FFFFFF', GOLD='9A7B4F', LINE='DED5CE';
const HF='Cambria', BF='Arial';
const sh=()=>({type:'outer',color:'000000',blur:10,offset:2,angle:90,opacity:0.10});

const M=v=>(v<0?'▲':'')+(Math.abs(v)/1e6).toFixed(1);
const yen=v=>(v<0?'▲':'')+Math.abs(v).toLocaleString('en-US');

function base(t,sub){
  const s=p.addSlide();
  s.background={color:SAND};
  s.addText(t,{x:0.65,y:0.42,w:W-1.3,h:0.62,fontFace:HF,fontSize:30,bold:true,color:BERRY,margin:0});
  if(sub) s.addText(sub,{x:0.65,y:1.06,w:W-1.3,h:0.34,fontFace:BF,fontSize:12.5,color:MUT,margin:0});
  return s;
}
function foot(s,t){
  s.addText(t,{x:0.65,y:H-0.52,w:W-1.3,h:0.3,fontFace:BF,fontSize:8.5,color:MUT,margin:0});
}
function card(s,x,y,w,h,fill){
  s.addShape(p.ShapeType.roundRect,{x,y,w,h,fill:{color:fill||WHT},rectRadius:0.06,line:{color:LINE,width:0.75},shadow:sh()});
}
function stat(s,x,y,w,val,lab,col,vs){
  s.addText(val,{x,y,w,h:0.62,fontFace:HF,fontSize:vs||30,bold:true,color:col||BERRY,align:'center',margin:0});
  s.addText(lab,{x,y:y+0.66,w,h:0.5,fontFace:BF,fontSize:10.5,color:MUT,align:'center',margin:0});
}
function numDot(s,x,y,n){
  s.addShape(p.ShapeType.ellipse,{x,y,w:0.34,h:0.34,fill:{color:BERRY}});
  s.addText(String(n),{x,y,w:0.34,h:0.34,fontFace:BF,fontSize:13,bold:true,color:WHT,align:'center',valign:'middle',margin:0});
}

/* ---------- 1. 表紙 ---------- */
{
  const s=p.addSlide(); s.background={color:BERRY};
  s.addShape(p.ShapeType.ellipse,{x:10.4,y:-1.5,w:5.2,h:5.2,fill:{color:'7E3B54'}});
  s.addShape(p.ShapeType.ellipse,{x:11.6,y:4.6,w:3.4,h:3.4,fill:{color:'5C2439'}});
  s.addText('株式会社WineBank',{x:0.9,y:1.75,w:9,h:0.4,fontFace:BF,fontSize:14,color:CREAM,charSpacing:2,margin:0});
  s.addText('事業再生計画',{x:0.9,y:2.25,w:10,h:0.9,fontFace:HF,fontSize:46,bold:true,color:WHT,margin:0});
  s.addText('2027年9月期 － V字回復の根拠',{x:0.9,y:3.2,w:10,h:0.6,fontFace:HF,fontSize:25,color:CREAM,margin:0});
  s.addText('金融機関・株主各位',{x:0.9,y:4.5,w:6,h:0.34,fontFace:BF,fontSize:13,color:CREAM,margin:0});
  s.addText('2026年8月',{x:0.9,y:4.9,w:6,h:0.34,fontFace:BF,fontSize:13,color:CREAM,margin:0});
  s.addText('本資料は2026年6月までの月次実績にもとづく保守前提の計画です。',
    {x:0.9,y:6.5,w:11,h:0.34,fontFace:BF,fontSize:9.5,color:'C9A9B6',margin:0});
  s.addNotes('FY2026は大幅赤字だが、その主因である飲食事業の撤退は2026年3月で完了。4月以降が撤退後の実力値であり、ここを起点にFY2027を組み立てている。');
}

/* ---------- 2. エグゼクティブサマリー ---------- */
{
  const s=base('エグゼクティブサマリー','FY2026の赤字は構造改革の費用。改革はすでに実行済みで、効果は2026年4月以降の実績に表れている。');
  const items=[
    ['飲食事業の撤退は完了','2026年3月で撤退完了。4-6月が撤退後の実力値。'],
    ['固定費は年103百万円削減済み','月次販管費 38.7百万円（26/3）→ 24.6百万円（26/6）、▲36.4%。'],
    ['FY2027に132.5百万円の収益上乗せ','経営指導料を中心としたストック型収益。'],
    ['黒字化まで残り4,473万円','新規顧客売上計画1,066百万円の4.2%で損益分岐に到達。']
  ];
  items.forEach((it,i)=>{
    const y=1.62+i*1.22;
    card(s,0.65,y,7.35,1.06);
    numDot(s,0.92,y+0.36,i+1);
    s.addText(it[0],{x:1.42,y:y+0.16,w:6.4,h:0.36,fontFace:BF,fontSize:14.5,bold:true,color:BERRY,margin:0});
    s.addText(it[1],{x:1.42,y:y+0.55,w:6.4,h:0.42,fontFace:BF,fontSize:11,color:INK,margin:0});
  });
  card(s,8.35,1.62,4.3,4.66,BERRY);
  s.addText('FY2027 営業利益',{x:8.6,y:1.9,w:3.8,h:0.3,fontFace:BF,fontSize:11,color:CREAM,align:'center',margin:0});
  s.addText('▲23.1',{x:8.6,y:2.22,w:3.8,h:0.85,fontFace:HF,fontSize:44,bold:true,color:WHT,align:'center',margin:0});
  s.addText('百万円（保守シナリオ）',{x:8.6,y:3.05,w:3.8,h:0.3,fontFace:BF,fontSize:10.5,color:CREAM,align:'center',margin:0});
  s.addText('FY2026 ▲114.8百万円から\n＋91.7百万円の改善',{x:8.6,y:3.5,w:3.8,h:0.62,fontFace:BF,fontSize:11.5,color:WHT,align:'center',margin:0});
  s.addShape(p.ShapeType.line,{x:8.85,y:4.3,w:3.3,h:0,line:{color:'8E5470',width:1}});
  s.addText('損益分岐に必要な追加売上',{x:8.6,y:4.45,w:3.8,h:0.3,fontFace:BF,fontSize:11,color:CREAM,align:'center',margin:0});
  s.addText('4,473万円',{x:8.6,y:4.75,w:3.8,h:0.62,fontFace:HF,fontSize:30,bold:true,color:CREAM,align:'center',margin:0});
  s.addText('新規顧客売上計画の 4.2%\n（超富裕層 4〜5名相当）',{x:8.6,y:5.42,w:3.8,h:0.62,fontFace:BF,fontSize:11,color:WHT,align:'center',margin:0});
  foot(s,'出典：事業計画202608（銀行様）全社シート月次実績、決算報告書 第54期');
  s.addNotes('FY2027保守シナリオは営業利益▲23.1百万円。ただしFY2026比では+91.7百万円の改善であり、黒字化までの距離は追加売上4,473万円に過ぎない。');
}

/* ---------- 3. 2期の赤字は性質が違う ---------- */
{
  const s=base('FY2025・FY2026 － 性質の異なる2期の赤字','いずれも一過性・構造改革に起因するもので、本業の継続的な採算悪化ではない。');
  const cols=[
    ['FY2025（2025年9月期）実績','当期純損失 ▲127.8百万円','経常損失は▲5.8百万円にとどまる。損失の大半は組織再編に伴う特別損失。',
      [['事業譲渡損','59.8百万円'],['固定資産除却損','18.1百万円'],['抱合せ株式消滅差損','45.4百万円'],['特別損失 計','123.4百万円']]],
    ['FY2026（2026年9月期）見込','経常損失 ▲124.8百万円','飲食事業の撤退と、撤退に伴う一時費用・先行投資が主因。撤退は2026年3月で完了。',
      [['上期(10-3月) 販管費 月平均','33.6百万円'],['下期(4-6月) 販管費 月平均','25.0百万円'],['削減額','月 ▲8.6百万円'],['年換算','▲103百万円']]]
  ];
  cols.forEach((c,i)=>{
    const x=0.65+i*6.35;
    card(s,x,1.6,6.0,4.75);
    s.addText(c[0],{x:x+0.35,y:1.85,w:5.3,h:0.32,fontFace:BF,fontSize:11.5,bold:true,color:MUT,margin:0});
    s.addText(c[1],{x:x+0.35,y:2.2,w:5.3,h:0.5,fontFace:HF,fontSize:22,bold:true,color:BERRY,margin:0});
    s.addText(c[2],{x:x+0.35,y:2.75,w:5.3,h:0.68,fontFace:BF,fontSize:11,color:INK,margin:0});
    c[3].forEach((rw,j)=>{
      const y=3.55+j*0.6, last=j===c[3].length-1;
      s.addShape(p.ShapeType.rect,{x:x+0.35,y,w:5.3,h:0.5,fill:{color:last?CREAM:'FBF9F7'},line:{color:LINE,width:0.5}});
      s.addText(rw[0],{x:x+0.5,y,w:3.3,h:0.5,fontFace:BF,fontSize:10.5,bold:last,color:INK,valign:'middle',margin:0});
      s.addText(rw[1],{x:x+3.6,y,w:1.9,h:0.5,fontFace:BF,fontSize:11.5,bold:true,color:last?BERRY:INK,align:'right',valign:'middle',margin:0});
    });
  });
  foot(s,'出典：決算報告書 第54期（2025年9月期）、事業計画202608（銀行様）全社シート');
  s.addNotes('FY2025は経常段階ではほぼ均衡しており、損失は組織再編の特別損失。FY2026は飲食撤退という構造改革の費用。どちらも継続的な収益力の毀損ではない。');
}

/* ---------- 4. 転換点：飲食撤退 ---------- */
{
  const s=base('転換点 － 飲食事業の撤退による固定費削減','撤退に紐づく費用科目が実際に減少している。削減は計画ではなく実績。');
  const rows=[
    ['雑給（店舗人件費）',1976720,198075],
    ['従業員給与',4877779,2844602],
    ['倉庫＆保管・移設代',2578077,272484],
    ['地代家賃（店舗賃料）',5000985,3721703],
    ['支払手数料',4121789,3258950],
    ['水道光熱費',974234,687496],
    ['清掃費',182516,0]
  ];
  const y0=1.72, rh=0.5;
  s.addShape(p.ShapeType.rect,{x:0.65,y:y0,w:8.4,h:0.44,fill:{color:BERRY}});
  [['勘定科目（単位：円）',0.85,3.2,'left'],['① 25/10-26/3 月平均',4.05,1.8,'right'],['② 26/4-6 月平均',5.95,1.55,'right'],['差 ②-①',7.55,1.35,'right']]
    .forEach(hd=>s.addText(hd[0],{x:hd[1],y:y0,w:hd[2],h:0.44,fontFace:BF,fontSize:9.5,bold:true,color:WHT,align:hd[3],valign:'middle',margin:0}));
  let tot=0;
  rows.forEach((r,i)=>{
    const y=y0+0.44+i*rh, d=r[2]-r[1]; tot+=d;
    s.addShape(p.ShapeType.rect,{x:0.65,y,w:8.4,h:rh,fill:{color:i%2?'FBF9F7':WHT},line:{color:LINE,width:0.5}});
    s.addText(r[0],{x:0.85,y,w:3.2,h:rh,fontFace:BF,fontSize:10.5,color:INK,valign:'middle',margin:0});
    s.addText(yen(r[1]),{x:4.05,y,w:1.8,h:rh,fontFace:BF,fontSize:10.5,color:MUT,align:'right',valign:'middle',margin:0});
    s.addText(yen(r[2]),{x:5.95,y,w:1.55,h:rh,fontFace:BF,fontSize:10.5,color:INK,align:'right',valign:'middle',margin:0});
    s.addText(yen(d),{x:7.55,y,w:1.35,h:rh,fontFace:BF,fontSize:10.5,bold:true,color:BERRY,align:'right',valign:'middle',margin:0});
  });
  const yt=y0+0.44+rows.length*rh;
  s.addShape(p.ShapeType.rect,{x:0.65,y:yt,w:8.4,h:0.52,fill:{color:CREAM},line:{color:BERRY,width:1}});
  s.addText('全23科目 合計',{x:0.85,y:yt,w:3.2,h:0.52,fontFace:BF,fontSize:11,bold:true,color:INK,valign:'middle',margin:0});
  s.addText(yen(33590696),{x:4.05,y:yt,w:1.8,h:0.52,fontFace:BF,fontSize:11,bold:true,color:MUT,align:'right',valign:'middle',margin:0});
  s.addText(yen(25013422),{x:5.95,y:yt,w:1.55,h:0.52,fontFace:BF,fontSize:11,bold:true,color:INK,align:'right',valign:'middle',margin:0});
  s.addText(yen(-8577274),{x:7.55,y:yt,w:1.35,h:0.52,fontFace:BF,fontSize:11,bold:true,color:BERRY,align:'right',valign:'middle',margin:0});
  card(s,9.45,1.72,3.2,2.35,BERRY);
  s.addText('年間削減額',{x:9.65,y:2.0,w:2.8,h:0.3,fontFace:BF,fontSize:11,color:CREAM,align:'center',margin:0});
  s.addText('▲103',{x:9.65,y:2.32,w:2.8,h:0.8,fontFace:HF,fontSize:40,bold:true,color:WHT,align:'center',margin:0});
  s.addText('百万円',{x:9.65,y:3.12,w:2.8,h:0.3,fontFace:BF,fontSize:12,color:CREAM,align:'center',margin:0});
  s.addText('月▲8.58百万円 × 12か月',{x:9.65,y:3.5,w:2.8,h:0.3,fontFace:BF,fontSize:9.5,color:CREAM,align:'center',margin:0});
  card(s,9.45,4.25,3.2,2.1);
  s.addText('撤退が確認できる点',{x:9.65,y:4.45,w:2.8,h:0.3,fontFace:BF,fontSize:11,bold:true,color:BERRY,margin:0});
  s.addText([{text:'清掃費が完全にゼロ',options:{bullet:true,breakLine:true}},
             {text:'雑給が90%減',options:{bullet:true,breakLine:true}},
             {text:'店舗賃料の減少',options:{bullet:true,breakLine:true}},
             {text:'倉庫移設の完了',options:{bullet:true}}],
    {x:9.65,y:4.78,w:2.8,h:1.4,fontFace:BF,fontSize:10.5,color:INK,paraSpaceAfter:4,margin:0});
  foot(s,'出典：事業計画202608（銀行様）全社シート 販管費内訳（全23科目の月次実績）');
  s.addNotes('清掃費がゼロ、雑給が90%減という点が、飲食店舗の撤退が実際に完了したことの裏付けになる。');
}

/* ---------- 5. 販管費 月次推移 ---------- */
{
  const s=base('販管費の月次推移 － 削減は実行済み','2026年3月をピークに、2026年6月は▲36.4%。以降はこの水準を横ばいで計画している。');
  const lab=['25/10','25/11','25/12','26/01','26/02','26/03','26/04','26/05','26/06'];
  const val=[25374892,30963282,38572456,33761779,34133901,38737868,25883967,24529013,24627286].map(v=>v/1e6);
  s.addChart(p.ChartType.bar,[{name:'販管費（百万円）',labels:lab,values:val}],{
    x:0.65,y:1.62,w:8.5,h:4.5,barDir:'col',
    chartColors:[ROSE,ROSE,ROSE,ROSE,ROSE,BERRY,'C4A79B','C4A79B','C4A79B'],
    varyColors:true,
    showTitle:false, showLegend:false,
    showValue:true, dataLabelPosition:'outEnd', dataLabelFormatCode:'0.0',
    dataLabelFontSize:9.5, dataLabelColor:INK, dataLabelFontFace:BF,
    catAxisLabelColor:MUT, catAxisLabelFontSize:10, catAxisLabelFontFace:BF,
    valAxisLabelColor:MUT, valAxisLabelFontSize:9.5, valAxisLabelFontFace:BF,
    valAxisMaxVal:45, valAxisMinVal:0,
    valGridLine:{color:'E8E0DA',size:1}, catGridLine:{style:'none'},
    plotArea:{fill:{color:WHT}}
  });
  card(s,9.5,1.62,3.15,2.1,BERRY);
  s.addText('ピーク → 直近',{x:9.7,y:1.85,w:2.75,h:0.3,fontFace:BF,fontSize:11,color:CREAM,align:'center',margin:0});
  s.addText('▲36.4%',{x:9.7,y:2.15,w:2.75,h:0.75,fontFace:HF,fontSize:36,bold:true,color:WHT,align:'center',margin:0});
  s.addText('38.7百万円（26/3）\n→ 24.6百万円（26/6）',{x:9.7,y:2.92,w:2.75,h:0.6,fontFace:BF,fontSize:10.5,color:CREAM,align:'center',margin:0});
  card(s,9.5,3.9,3.15,2.22);
  s.addText('計画の前提',{x:9.7,y:4.1,w:2.75,h:0.3,fontFace:BF,fontSize:11,bold:true,color:BERRY,margin:0});
  s.addText('FY2027の販管費は、2026年4-6月の実績平均 25.0百万円/月をそのまま横ばいで置いています。さらなる削減は織り込んでいません。',
    {x:9.7,y:4.42,w:2.75,h:1.5,fontFace:BF,fontSize:10.5,color:INK,valign:'top',margin:0});
  foot(s,'出典：事業計画202608（銀行様）全社シート。2026/07以降は見込値のため本グラフから除外。');
  s.addNotes('2026年7月以降の数値は事業計画上の見込値であり、同一値が並ぶプラグのため、実績としては使わずグラフからも除いている。');
}

/* ---------- 6. 撤退後の実力値 ---------- */
{
  const s=base('撤退後の実力値 － 2026年4-6月の月次平均','この3か月が、飲食撤退後のWineBank単体の実力です。FY2027はここを起点にしています。（単位：円）');
  const rows=[['売上',32428397,''],['売上原価',-15711570,''],['売上総利益',16716827,'粗利率 51.5%'],
              ['販管費',-25013422,'全23科目'],['営業利益',-8296595,'月次']];
  rows.forEach((r,i)=>{
    const y=1.7+i*0.86, isT=(i===2||i===4);
    s.addShape(p.ShapeType.roundRect,{x:0.65,y,w:6.5,h:0.74,rectRadius:0.05,
      fill:{color:isT?(i===4?BERRY:CREAM):WHT},line:{color:isT?BERRY:LINE,width:isT?1:0.75},shadow:sh()});
    s.addText(r[0],{x:0.95,y,w:2.4,h:0.74,fontFace:BF,fontSize:13,bold:isT,color:i===4?WHT:INK,valign:'middle',margin:0});
    s.addText(yen(r[1]),{x:3.35,y,w:2.4,h:0.74,fontFace:HF,fontSize:16,bold:true,color:i===4?WHT:BERRY,align:'right',valign:'middle',margin:0});
    s.addText(r[2],{x:5.85,y,w:1.1,h:0.74,fontFace:BF,fontSize:9.5,color:i===4?CREAM:MUT,align:'right',valign:'middle',margin:0});
  });
  card(s,7.5,1.7,5.15,4.6);
  s.addText('なぜ4月以降なのか',{x:7.85,y:1.95,w:4.45,h:0.36,fontFace:HF,fontSize:17,bold:true,color:BERRY,margin:0});
  s.addText([
    {text:'2025年10月〜2026年3月の数値には、撤退した飲食店舗の売上と費用が含まれています。',options:{breakLine:true}},
    {text:'',options:{breakLine:true}},
    {text:'このため同期間を基準にすると、すでに存在しない事業の損益を将来計画に持ち込むことになります。',options:{breakLine:true}},
    {text:'',options:{breakLine:true}},
    {text:'撤退が完了した2026年4月以降の3か月を基準とすることで、現在の事業構造をそのまま反映した計画になります。',options:{breakLine:true}},
    {text:'',options:{breakLine:true}},
    {text:'成長・季節変動はいっさい織り込まず、この3か月をそのまま12か月に横ばいで延伸しています。',options:{}}
  ],{x:7.85,y:2.45,w:4.45,h:3.5,fontFace:BF,fontSize:11.5,color:INK,lineSpacing:17,margin:0});
  foot(s,'出典：事業計画202608（銀行様）全社シート 2026/04・05・06 実績の単純平均');
  s.addNotes('4月起点とする理由は、飲食撤退店舗の損益を除くため。貴社からのご指摘に基づく。');
}

/* ---------- 7. 上乗せ案件 132.5百万円 ---------- */
{
  const s=base('FY2027の収益上乗せ － 132.5百万円','経営指導料を中心としたストック型収益。契約ベースで積み上げています。');
  const rows=[['経営指導料','Value table',10000000,'グループ'],
              ['経営指導料','Prime',60000000,'グループ'],
              ['経営指導料','Apicius',10000000,'グループ'],
              ['経営指導料','Thierry Marx',2500000,'外部'],
              ['経営指導料','ito＋Aqua＋Hokkaido',10000000,'外部'],
              ['インセンティブ','Apicius2 shot',20000000,'グループ'],
              ['投資売買益','Cruiser shot',20000000,'外部']];
  const y0=1.66, rh=0.53;
  s.addShape(p.ShapeType.rect,{x:0.65,y:y0,w:7.9,h:0.44,fill:{color:BERRY}});
  [['区分',0.85,1.6,'left'],['案件',2.45,2.8,'left'],['金額',5.35,1.6,'right'],['取引先',7.05,1.3,'center']]
    .forEach(hd=>s.addText(hd[0],{x:hd[1],y:y0,w:hd[2],h:0.44,fontFace:BF,fontSize:9.5,bold:true,color:WHT,align:hd[3],valign:'middle',margin:0}));
  rows.forEach((r,i)=>{
    const y=y0+0.44+i*rh;
    s.addShape(p.ShapeType.rect,{x:0.65,y,w:7.9,h:rh,fill:{color:i%2?'FBF9F7':WHT},line:{color:LINE,width:0.5}});
    s.addText(r[0],{x:0.85,y,w:1.6,h:rh,fontFace:BF,fontSize:10,color:MUT,valign:'middle',margin:0});
    s.addText(r[1],{x:2.45,y,w:2.8,h:rh,fontFace:BF,fontSize:11,bold:true,color:INK,valign:'middle',margin:0});
    s.addText('¥'+yen(r[2]),{x:5.35,y,w:1.6,h:rh,fontFace:BF,fontSize:11.5,bold:true,color:BERRY,align:'right',valign:'middle',margin:0});
    s.addShape(p.ShapeType.roundRect,{x:7.25,y:y+0.13,w:1.0,h:0.28,rectRadius:0.12,
      fill:{color:r[3]==='グループ'?CREAM:'E4EAE6'},line:{color:r[3]==='グループ'?ROSE:'8FA89B',width:0.5}});
    s.addText(r[3],{x:7.25,y:y+0.13,w:1.0,h:0.28,fontFace:BF,fontSize:8.5,color:INK,align:'center',valign:'middle',margin:0});
  });
  const yt=y0+0.44+rows.length*rh;
  s.addShape(p.ShapeType.rect,{x:0.65,y:yt,w:7.9,h:0.52,fill:{color:CREAM},line:{color:BERRY,width:1}});
  s.addText('合計',{x:0.85,y:yt,w:2,h:0.52,fontFace:BF,fontSize:11.5,bold:true,color:INK,valign:'middle',margin:0});
  s.addText('¥'+yen(132500000),{x:5.35,y:yt,w:1.6,h:0.52,fontFace:BF,fontSize:12.5,bold:true,color:BERRY,align:'right',valign:'middle',margin:0});
  card(s,8.95,1.66,3.7,1.55);
  s.addText('損益計上区分',{x:9.2,y:1.82,w:3.2,h:0.3,fontFace:BF,fontSize:10.5,bold:true,color:BERRY,margin:0});
  s.addText('営業収益　112.5百万円\n営業外収益　20.0百万円',{x:9.2,y:2.16,w:3.2,h:0.8,fontFace:BF,fontSize:11.5,color:INK,lineSpacing:18,margin:0});
  card(s,8.95,3.35,3.7,1.55);
  s.addText('取引先の内訳',{x:9.2,y:3.51,w:3.2,h:0.3,fontFace:BF,fontSize:10.5,bold:true,color:BERRY,margin:0});
  s.addText('グループ内　100.0百万円\n外部　32.5百万円',{x:9.2,y:3.85,w:3.2,h:0.8,fontFace:BF,fontSize:11.5,color:INK,lineSpacing:18,margin:0});
  card(s,8.95,5.04,3.7,1.26,CREAM);
  s.addText('グループ内取引については、支払側の支払能力と対価の算定根拠を整備のうえご説明します。',
    {x:9.2,y:5.2,w:3.2,h:0.95,fontFace:BF,fontSize:10,color:INK,margin:0});
  foot(s,'期間表記は2026/09-2027/08。決算期（2026/10-2027/09）と1か月ズレるため、全額をFY2027帰属として試算。');
  s.addNotes('グループ内取引が100百万円ある点は先に開示する。銀行の正常化調整で控除される可能性を織り込んでおく。');
}

/* ---------- 8. 営業利益ブリッジ ---------- */
{
  const s=base('FY2026 → FY2027 営業利益ブリッジ','保守シナリオでも＋91.7百万円の改善。上乗せ案件と固定費削減が寄与します。');
  const steps=[
    {l:'FY2026\n営業利益',v:-114793431,type:'total'},
    {l:'① 既存事業\n粗利の減少',v:-28537477,type:'dn'},
    {l:'② 販管費\nの削減',v:43771772,type:'up'},
    {l:'③ 上乗せ案件\n（営業収益）',v:112500000,type:'up'},
    {l:'④ 上場関連\nコスト',v:-36000000,type:'dn'},
    {l:'FY2027\n営業利益',v:-23059136,type:'total'}
  ];
  const cx=0.9, cw=1.72, gap=0.32, top=1.72, ph=3.18;
  const lo=-160e6, hi=40e6, span=hi-lo;
  const yOf=v=>top+ph*(hi-v)/span;
  s.addShape(p.ShapeType.line,{x:cx,y:yOf(0),w:11.6,h:0,line:{color:'C9BDB5',width:1}});
  s.addText('0',{x:cx-0.42,y:yOf(0)-0.13,w:0.36,h:0.26,fontFace:BF,fontSize:9,color:MUT,align:'right',margin:0});
  let cum=0;
  steps.forEach((st,i)=>{
    const x=cx+i*(cw+gap);
    let y,h,col;
    if(st.type==='total'){
      const t=st.v; y=Math.min(yOf(0),yOf(t)); h=Math.abs(yOf(t)-yOf(0)); col='4A4A4A'; cum=t;
    }else{
      const from=cum, to=cum+st.v;
      y=Math.min(yOf(from),yOf(to)); h=Math.abs(yOf(to)-yOf(from));
      col= st.type==='up' ? BERRY : ROSE; cum=to;
    }
    if(h<0.06) h=0.06;
    s.addShape(p.ShapeType.rect,{x,y,w:cw,h,fill:{color:col}});
    const above = st.v>=0;
    s.addText((st.v>0?'+':'')+M(st.v),{x,y: above? y-0.36 : y+h+0.04, w:cw,h:0.32,
      fontFace:HF,fontSize:13,bold:true,color:col==='4A4A4A'?'4A4A4A':col,align:'center',margin:0});
    s.addText(st.l,{x:x-0.12,y:top+ph+0.30,w:cw+0.24,h:0.70,fontFace:BF,fontSize:10,color:INK,align:'center',margin:0});
  });
  s.addText('単位：百万円',{x:0.65,y:1.42,w:2,h:0.26,fontFace:BF,fontSize:9,color:MUT,margin:0});
  card(s,0.9,6.16,11.6,0.68,CREAM);
  s.addText('FY2026 ▲114.8百万円　→　FY2027 ▲23.1百万円　　改善額 ＋91.7百万円。黒字化まで残り23.1百万円（追加売上4,473万円）。',
    {x:1.15,y:6.16,w:11.1,h:0.68,fontFace:BF,fontSize:12.2,bold:true,color:BERRY,valign:'middle',margin:0});
  foot(s,'①はFY2026に含まれる大口案件（2025/11・2026/09）を保守的にゼロと置いたことによる減少。');
  s.addNotes('①の粗利減少は、FY2026の大口スポット案件を来期はゼロと置いた保守性の表れ。事業が縮小したわけではない。');
}

/* ---------- 9. FY2027 月次推移表 ---------- */
{
  const s=base('FY2027 月次推移表 － 保守シナリオ','2026年4-6月の実力値を横ばいで延伸し、上乗せ案件を計上したもの。');
  const MO=['26/10','26/11','26/12','27/01','27/02','27/03','27/04','27/05','27/06','27/07','27/08','27/09'];
  const g=16716827, adv=92500000/12, sg=25013422, ipo=3000000, noe=1250000;
  const inc=i=>i===5?20000000:0, inv=i=>i===5?20000000:0;
  const rowdefs=[
    ['既存事業 売上',i=>32428397,false],
    ['既存事業 売上総利益',i=>g,false],
    ['＋経営指導料',i=>adv,false],
    ['＋インセンティブ',inc,false],
    ['売上総利益 合計',i=>g+adv+inc(i),true],
    ['販管費',i=>-sg,false],
    ['上場関連コスト',i=>-ipo,false],
    ['営業利益',i=>g+adv+inc(i)-sg-ipo,true],
    ['営業外収益',inv,false],
    ['営業外費用',i=>-noe,false],
    ['経常利益',i=>g+adv+inc(i)-sg-ipo+inv(i)-noe,true]
  ];
  const x0=0.65, lw=2.05, cw=0.79, y0=1.55, rh=0.35;
  s.addShape(p.ShapeType.rect,{x:x0,y:y0,w:lw+cw*12+0.95,h:0.4,fill:{color:BERRY}});
  s.addText('科目（百万円）',{x:x0+0.12,y:y0,w:lw,h:0.4,fontFace:BF,fontSize:9,bold:true,color:WHT,valign:'middle',margin:0});
  MO.forEach((m,i)=>s.addText(m,{x:x0+lw+i*cw,y:y0,w:cw,h:0.4,fontFace:BF,fontSize:8.5,color:WHT,align:'center',valign:'middle',margin:0}));
  s.addText('通期',{x:x0+lw+12*cw,y:y0,w:0.95,h:0.4,fontFace:BF,fontSize:9,bold:true,color:WHT,align:'center',valign:'middle',margin:0});
  rowdefs.forEach((rd,r)=>{
    const y=y0+0.4+r*rh, tot=[...Array(12)].reduce((a,_,i)=>a+rd[1](i),0);
    const bg = rd[2] ? (rd[0]==='経常利益'?CREAM:'F3EDE9') : (r%2?'FBF9F7':WHT);
    s.addShape(p.ShapeType.rect,{x:x0,y,w:lw+cw*12+0.95,h:rh,fill:{color:bg},line:{color:LINE,width:0.5}});
    s.addText(rd[0],{x:x0+0.12,y,w:lw,h:rh,fontFace:BF,fontSize:9,bold:rd[2],color:INK,valign:'middle',margin:0});
    for(let i=0;i<12;i++){
      const v=rd[1](i);
      s.addText(M(v),{x:x0+lw+i*cw,y,w:cw,h:rh,fontFace:BF,fontSize:8.5,bold:rd[2],
        color: v<0?ROSE:(rd[2]?BERRY:INK),align:'center',valign:'middle',margin:0});
    }
    s.addText(M(tot),{x:x0+lw+12*cw,y,w:0.95,h:rh,fontFace:BF,fontSize:9,bold:true,
      color: tot<0?ROSE:BERRY,align:'center',valign:'middle',margin:0});
  });
  const yb=y0+0.4+rowdefs.length*rh+0.26;
  card(s,0.65,yb,11.99,0.78,CREAM);
  const cards=[['通期 営業利益','▲23.1百万円'],['通期 経常利益','▲18.1百万円'],['2027年3月 経常利益','＋35.2百万円（単月黒字）']];
  cards.forEach((c,i)=>{
    const x=1.0+i*3.95;
    s.addText(c[0],{x,y:yb+0.10,w:3.6,h:0.28,fontFace:BF,fontSize:10,color:MUT,margin:0});
    s.addText(c[1],{x,y:yb+0.36,w:3.6,h:0.34,fontFace:HF,fontSize:16,bold:true,color:BERRY,margin:0});
  });
  foot(s,'経営指導料は12か月按分。インセンティブ（Apicius2）および投資売買益（Cruiser）は2027年3月に一括計上と仮定。');
  s.addNotes('単月では2027年3月にインセンティブと投資売買益が乗り、経常+35.2百万円の黒字月となる。それ以外の月は月▲4.8百万円。');
}

/* ---------- 10. 黒字化までの距離 ---------- */
{
  const s=base('黒字化まで、あと4,473万円','新規顧客売上計画に対する達成率で見ると、到達点は現実的な水準にあります。');
  const items=[
    ['損益分岐（営業利益 0）','44,731,623','4.2%','超富裕層 4〜5名 相当',BERRY],
    ['営業利益 1億円','238,718,178','22.4%','超富裕層 24名 相当',GOLD]
  ];
  items.forEach((it,i)=>{
    const y=1.7+i*2.35;
    card(s,0.65,y,11.99,2.05);
    s.addText(it[0],{x:1.0,y:y+0.22,w:3.5,h:0.4,fontFace:HF,fontSize:19,bold:true,color:INK,margin:0});
    s.addText('必要な追加売上',{x:1.0,y:y+0.72,w:3.5,h:0.3,fontFace:BF,fontSize:10,color:MUT,margin:0});
    s.addText('¥'+it[1],{x:1.0,y:y+1.0,w:3.5,h:0.62,fontFace:HF,fontSize:29,bold:true,color:it[4],margin:0});
    s.addShape(p.ShapeType.line,{x:5.0,y:y+0.3,w:0,h:1.45,line:{color:LINE,width:1}});
    s.addText('新規顧客売上計画（1,066百万円）に対する比率',{x:5.4,y:y+0.32,w:4.4,h:0.3,fontFace:BF,fontSize:10,color:MUT,margin:0});
    s.addText(it[2],{x:5.4,y:y+0.62,w:2.2,h:0.85,fontFace:HF,fontSize:44,bold:true,color:it[4],margin:0});
    const bw=4.4, fw=bw*parseFloat(it[2])/100;
    s.addShape(p.ShapeType.rect,{x:5.4,y:y+1.55,w:bw,h:0.2,fill:{color:'E8E0DA'}});
    s.addShape(p.ShapeType.rect,{x:5.4,y:y+1.55,w:fw,h:0.2,fill:{color:it[4]}});
    s.addShape(p.ShapeType.line,{x:10.15,y:y+0.3,w:0,h:1.45,line:{color:LINE,width:1}});
    s.addText('顧客数換算',{x:10.5,y:y+0.42,w:2.3,h:0.3,fontFace:BF,fontSize:10,color:MUT,margin:0});
    s.addText(it[3],{x:10.5,y:y+0.75,w:2.3,h:0.7,fontFace:BF,fontSize:14,bold:true,color:INK,margin:0});
  });
  card(s,0.65,6.28,11.99,0.6,CREAM);
  s.addText('事業計画上のFY2027新規顧客計画は超富裕層43名・富裕層55名・準富裕層71名ほか、計1,066百万円。損益分岐はその4.2%で到達します。',
    {x:1.0,y:6.28,w:11.3,h:0.6,fontFace:BF,fontSize:11.2,bold:true,color:BERRY,valign:'middle',margin:0});
  foot(s,'超富裕層の単価は計画上10百万円/名（430百万円÷43名）。');
  s.addNotes('V字回復の説得力はここ。1,066百万円の計画を全部達成する必要はなく、4.2%で黒字化、22.4%で営業利益1億円に届く。');
}

/* ---------- 11. 財務基盤 ---------- */
{
  const s=base('財務基盤 － 簿価より実態が厚い','ワイン現物という換価可能な資産があり、実態純資産は簿価を上回ります。（単位：円）');
  const rows=[['簿価純資産（2025/9末）',211755689,INK],
              ['▲ ソフトウェア（換価性を保守評価）',-129822924,ROSE],
              ['＋ 商品の含み益（時価1.37倍）',186716373,BERRY]];
  rows.forEach((r,i)=>{
    const y=1.72+i*0.8;
    s.addShape(p.ShapeType.rect,{x:0.65,y,w:7.0,h:0.68,fill:{color:i%2?'FBF9F7':WHT},line:{color:LINE,width:0.5}});
    s.addText(r[0],{x:0.9,y,w:4.3,h:0.68,fontFace:BF,fontSize:11.5,color:INK,valign:'middle',margin:0});
    s.addText(yen(r[1]),{x:5.2,y,w:2.2,h:0.68,fontFace:BF,fontSize:13,bold:true,color:r[2],align:'right',valign:'middle',margin:0});
  });
  const yt=1.72+3*0.8;
  s.addShape(p.ShapeType.rect,{x:0.65,y:yt,w:7.0,h:0.8,fill:{color:BERRY}});
  s.addText('実態純資産',{x:0.9,y:yt,w:4.3,h:0.8,fontFace:BF,fontSize:13,bold:true,color:WHT,valign:'middle',margin:0});
  s.addText(yen(268649138),{x:5.2,y:yt,w:2.2,h:0.8,fontFace:HF,fontSize:17,bold:true,color:WHT,align:'right',valign:'middle',margin:0});
  s.addText('簿価純資産を＋56.9百万円上回る',{x:0.9,y:yt+0.92,w:6.5,h:0.3,fontFace:BF,fontSize:10.5,color:MUT,margin:0});
  const side=[['繰越欠損金','約252百万円','FY2025 ▲127.4 ＋ FY2026 ▲124.8。資本金1,000万円の中小法人は所得の100%控除が可能。FY2027の黒字に法人税は実質発生せず、税引前＝税引後でキャッシュに残ります。'],
              ['有利子負債','586百万円','短期162.4＋長期423.6＋役員0.1（2025/9末）。'],
              ['現金及び預金','24.4百万円','手元流動性は薄く、月次資金繰り表を別途ご提出します。']];
  side.forEach((c,i)=>{
    const y=1.72+i*1.62;
    card(s,7.95,y,4.7,1.45);
    s.addText(c[0],{x:8.2,y:y+0.14,w:2.2,h:0.3,fontFace:BF,fontSize:10.5,color:MUT,margin:0});
    s.addText(c[1],{x:8.2,y:y+0.4,w:4.2,h:0.42,fontFace:HF,fontSize:20,bold:true,color:BERRY,margin:0});
    s.addText(c[2],{x:8.2,y:y+0.85,w:4.2,h:0.52,fontFace:BF,fontSize:9.5,color:INK,margin:0});
  });
  foot(s,'出典：決算報告書 第54期（2025年9月30日現在）。商品の時価倍率1.37は事業計画202608（銀行様）の自社販売在庫 簿価/時価比率による。');
  s.addNotes('ソフトウェア129.8百万円は保守的に全額control。それでも在庫含み益186.7百万円で実態純資産は簿価を上回る。');
}

/* ---------- 12. FY2027 月次資金繰り ---------- */
{
  const CF=JSON.parse(require('fs').readFileSync('cf_data.json','utf8'));
  const s=base('FY2027 月次資金繰り','2026年9月の在庫販売200百万円とみずほ銀行への返済200百万円を反映。単位：百万円（税込）');
  const MO=['26/10','26/11','26/12','27/01','27/02','27/03','27/04','27/05','27/06','27/07','27/08','27/09'];
  const defs=[['営業収入 計',CF['in'],false],['営業支出 計',CF.out,false],['経常収支',CF.ord,true],
              ['財務・投資収支 計',CF.fin,false],['当月収支',CF.net,true],['月末 現預金残高',CF.bal,true]];
  const x0=0.65, lw=2.4, cwd=0.86, y0=1.66, rh=0.48;
  s.addShape(p.ShapeType.rect,{x:x0,y:y0,w:lw+cwd*12,h:0.44,fill:{color:BERRY}});
  s.addText('科目',{x:x0+0.15,y:y0,w:lw,h:0.44,fontFace:BF,fontSize:9.5,bold:true,color:WHT,valign:'middle',margin:0});
  MO.forEach((m,i)=>s.addText(m,{x:x0+lw+i*cwd,y:y0,w:cwd,h:0.44,fontFace:BF,fontSize:8.5,color:WHT,align:'center',valign:'middle',margin:0}));
  defs.forEach((d,r)=>{
    const y=y0+0.44+r*rh, isBal=d[0]==='月末 現預金残高';
    s.addShape(p.ShapeType.rect,{x:x0,y,w:lw+cwd*12,h:rh,
      fill:{color:isBal?CREAM:(d[2]?'F3EDE9':(r%2?'FBF9F7':WHT))},line:{color:LINE,width:0.5}});
    s.addText(d[0],{x:x0+0.15,y,w:lw,h:rh,fontFace:BF,fontSize:9.5,bold:d[2],color:INK,valign:'middle',margin:0});
    d[1].forEach((v,i)=>{
      s.addText(M(v),{x:x0+lw+i*cwd,y,w:cwd,h:rh,fontFace:BF,fontSize:9,bold:d[2]||isBal,
        color: v<0?'C0392B':(d[2]||isBal?BERRY:INK),align:'center',valign:'middle',margin:0});
    });
  });
  const yb=y0+0.44+defs.length*rh+0.3;
  const cards=[['期中 最低残高（2027年2月末）','▲2.1百万円',ROSE],['期末 現預金残高','＋12.6百万円',BERRY],['必要調達額（月商1か月のバッファ込）','37.7百万円',GOLD]];
  cards.forEach((c,i)=>{
    const x=0.65+i*4.22;
    card(s,x,yb,3.95,1.12);
    s.addText(c[0],{x:x+0.22,y:yb+0.16,w:3.5,h:0.34,fontFace:BF,fontSize:9.5,color:MUT,margin:0});
    s.addText(c[1],{x:x+0.22,y:yb+0.52,w:3.5,h:0.5,fontFace:HF,fontSize:22,bold:true,color:c[2],margin:0});
  });
  foot(s,'期首現預金24.4百万円（2025/09末実績を暫定使用）、長期借入は みずほ返済後223.6百万円を7年均等返済と仮定。');
  s.addNotes('在庫販売200百万円をみずほ返済に充てることで、長期借入の約定返済が月5.04百万円から2.66百万円へ軽くなる。これが資金繰りを支えている。');
}

/* ---------- 13. ワイン在庫と資金・感応度 ---------- */
{
  const s=base('ワイン在庫が資金繰りを決める','在庫の積み増しはPLに現れないが、そのまま資金流出になります。');
  card(s,0.65,1.62,5.85,2.5);
  s.addText('自社在庫（簿価）の推移',{x:1.0,y:1.82,w:5.2,h:0.34,fontFace:BF,fontSize:12,bold:true,color:BERRY,margin:0});
  const hist=[['24/12末',5.6],['25/07末',4.7],['25/09末',4.8],['25/12末',5.3],['26/03末',6.2]];
  const bx=1.0, bw=0.95, bmax=1.35, byBase=3.72;
  hist.forEach((h,i)=>{
    const hh=bmax*h[1]/6.5, x=bx+i*1.05;
    s.addShape(p.ShapeType.rect,{x,y:byBase-hh,w:bw*0.72,h:hh,fill:{color:i>=2?BERRY:'C9AEB8'}});
    s.addText(h[1].toFixed(1),{x:x-0.08,y:byBase-hh-0.32,w:bw*0.88,h:0.3,fontFace:BF,fontSize:10,bold:true,color:BERRY,align:'center',margin:0});
    s.addText(h[0],{x:x-0.12,y:byBase+0.04,w:bw*0.96,h:0.26,fontFace:BF,fontSize:8.5,color:MUT,align:'center',margin:0});
  });
  s.addText('単位：億円',{x:5.0,y:1.84,w:1.3,h:0.26,fontFace:BF,fontSize:8.5,color:MUT,align:'right',margin:0});
  card(s,6.8,1.62,5.85,2.5,BERRY);
  s.addText('2025/09末 → 2026/03末',{x:7.15,y:1.85,w:5.15,h:0.3,fontFace:BF,fontSize:11,color:CREAM,margin:0});
  s.addText('＋1.4億円',{x:7.15,y:2.15,w:5.15,h:0.75,fontFace:HF,fontSize:38,bold:true,color:WHT,margin:0});
  s.addText('6か月で在庫が1.4億円増加＝月23.3百万円の資金が在庫に固定されました。この分はPLの利益には一切現れません。',
    {x:7.15,y:2.95,w:5.15,h:0.95,fontFace:BF,fontSize:11.5,color:CREAM,valign:'top',margin:0});
  s.addText('感応度 － 4つのケースでの必要調達額',{x:0.65,y:4.32,w:8,h:0.36,fontFace:HF,fontSize:17,bold:true,color:BERRY,margin:0});
  const cs=[['A. 基本（在庫横ばい）','＋12.6','▲2.1','37.7',BERRY],
            ['B. 2027/03の一時収益42百万円が未入金','▲29.4','▲44.1','79.7',ROSE],
            ['C. 在庫をFY2026上期ペースで積み増し','▲295.4','▲310.1','345.7','C0392B'],
            ['D. 2026/09の在庫販売200百万円が不成立','▲16.0','▲30.6','66.3',ROSE]];
  const ty=4.78, trh=0.44;
  s.addShape(p.ShapeType.rect,{x:0.65,y:ty,w:11.99,h:0.4,fill:{color:BERRY}});
  [['ケース',0.9,5.6,'left'],['期末残高',6.7,1.7,'right'],['期中最低残高',8.6,1.9,'right'],['必要調達額',10.7,1.75,'right']]
    .forEach(h=>s.addText(h[0],{x:h[1],y:ty,w:h[2],h:0.4,fontFace:BF,fontSize:9.5,bold:true,color:WHT,align:h[3],valign:'middle',margin:0}));
  cs.forEach((c,i)=>{
    const y=ty+0.4+i*trh;
    s.addShape(p.ShapeType.rect,{x:0.65,y,w:11.99,h:trh,fill:{color:i===0?CREAM:(i%2?'FBF9F7':WHT)},line:{color:LINE,width:0.5}});
    s.addText(c[0],{x:0.9,y,w:5.6,h:trh,fontFace:BF,fontSize:10.5,bold:i===0,color:INK,valign:'middle',margin:0});
    [[c[1],6.7,1.7],[c[2],8.6,1.9],[c[3],10.7,1.75]].forEach((v,j)=>{
      s.addText(v[0]+'百万円',{x:v[1],y,w:v[2],h:trh,fontFace:BF,fontSize:10.5,bold:j===2,
        color:j===2?c[4]:(String(v[0]).startsWith('▲')?'C0392B':BERRY),align:'right',valign:'middle',margin:0});
    });
  });
  foot(s,'必要調達額＝期中最低残高をゼロに戻す額＋運転資金バッファ（月商1か月 35.7百万円）。出典：2026年7月度 取締役会資料、決算報告書 第54期。');
  s.addNotes('最も重要なのはケースC。在庫を積み増す方針を続けるなら3.5億円の調達が必要になる。在庫方針そのものが資金計画の変数であることを銀行に示す。');
}

/* ---------- 12. リスクと対応 ---------- */
{
  const s=base('想定されるご指摘と当社の対応','先に論点を開示し、対応方針をあわせてご説明します。');
  const items=[
    ['グループ内取引 100百万円','上乗せ案件132.5百万円のうち約100百万円はグループ会社からの経営指導料。','支払側各社の支払能力と、対価の算定根拠（業務内容・工数）を文書化してご提出します。'],
    ['手元流動性が1か月未満','現金及び預金24.4百万円に対し、月次販管費は25.0百万円。','月次および13週の資金繰り表を作成し、調達手段と実行時期を明示します。'],
    ['財務制限条項への抵触','純資産維持条項・連続赤字条項に抵触する可能性があります。','借入契約書を精査のうえ、抵触前に事前にご相談し、ウェーバーを申請します。'],
    ['上乗せ案件の契約化','経営指導料は契約書の締結時期により計上期が動きます。','各案件の契約締結スケジュールを一覧化し、進捗を月次でご報告します。']
  ];
  items.forEach((it,i)=>{
    const x=0.65+(i%2)*6.35, y=1.62+Math.floor(i/2)*2.42;
    card(s,x,y,6.0,2.22);
    numDot(s,x+0.3,y+0.26,i+1);
    s.addText(it[0],{x:x+0.78,y:y+0.24,w:4.9,h:0.36,fontFace:BF,fontSize:13.5,bold:true,color:BERRY,margin:0});
    s.addText(it[1],{x:x+0.32,y:y+0.7,w:5.4,h:0.6,fontFace:BF,fontSize:10.5,color:MUT,margin:0});
    s.addShape(p.ShapeType.roundRect,{x:x+0.32,y:y+1.3,w:5.4,h:0.76,rectRadius:0.05,fill:{color:CREAM}});
    s.addText(it[2],{x:x+0.5,y:y+1.3,w:5.05,h:0.76,fontFace:BF,fontSize:10.5,color:INK,valign:'middle',margin:0});
  });
  foot(s,'');
  s.addNotes('銀行に指摘される前に自分から出す。これが信頼確保の基本方針。');
}

/* ---------- 13. まとめ ---------- */
{
  const s=p.addSlide(); s.background={color:BERRY};
  s.addShape(p.ShapeType.ellipse,{x:-1.6,y:5.0,w:4.6,h:4.6,fill:{color:'5C2439'}});
  s.addText('まとめ',{x:0.9,y:0.75,w:8,h:0.7,fontFace:HF,fontSize:34,bold:true,color:WHT,margin:0});
  const pts=[
    ['FY2026の赤字は構造改革の費用','飲食事業の撤退は2026年3月に完了。継続的な採算悪化ではありません。'],
    ['固定費削減は実行済み','年103百万円の削減が、2026年4-6月の実績として表れています。'],
    ['FY2027は＋91.7百万円の改善','保守シナリオでも営業利益は▲114.8百万円から▲23.1百万円へ。'],
    ['黒字化まで追加売上4,473万円','新規顧客売上計画の4.2%。営業利益1億円でも22.4%です。']
  ];
  pts.forEach((t,i)=>{
    const y=1.75+i*1.12;
    s.addShape(p.ShapeType.ellipse,{x:0.9,y:y+0.06,w:0.4,h:0.4,fill:{color:CREAM}});
    s.addText(String(i+1),{x:0.9,y:y+0.06,w:0.4,h:0.4,fontFace:BF,fontSize:14,bold:true,color:BERRY,align:'center',valign:'middle',margin:0});
    s.addText(t[0],{x:1.55,y:y,w:7.4,h:0.4,fontFace:BF,fontSize:16,bold:true,color:WHT,margin:0});
    s.addText(t[1],{x:1.55,y:y+0.42,w:7.4,h:0.44,fontFace:BF,fontSize:11.5,color:'E4CBD6',margin:0});
  });
  card(s,9.4,1.75,3.25,4.25,'5C2439');
  s.addText('次のご提出資料',{x:9.65,y:2.0,w:2.75,h:0.34,fontFace:BF,fontSize:12,bold:true,color:CREAM,margin:0});
  s.addText([
    {text:'月次資金繰り表（13週）',options:{bullet:true,breakLine:true}},
    {text:'実態貸借対照表',options:{bullet:true,breakLine:true}},
    {text:'上乗せ案件の契約一覧',options:{bullet:true,breakLine:true}},
    {text:'グループ間取引の算定根拠',options:{bullet:true,breakLine:true}},
    {text:'新規顧客獲得の進捗管理表',options:{bullet:true}}
  ],{x:9.65,y:2.45,w:2.75,h:2.3,fontFace:BF,fontSize:11,color:WHT,paraSpaceAfter:9,margin:0});
  s.addText('株式会社WineBank',{x:0.9,y:6.55,w:6,h:0.34,fontFace:BF,fontSize:11,color:'C9A9B6',margin:0});
  s.addNotes('次回提出資料を明示することで、継続的な報告姿勢を示す。');
}

p.writeFile({fileName:'WineBank_FY2027_銀行提出.pptx'}).then(f=>console.log('written:',f));
