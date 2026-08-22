const pptxgen = require('pptxgenjs');
const fs = require('fs');
const CF = JSON.parse(fs.readFileSync('cf_data.json','utf8'));
const p = new pptxgen();
p.layout = 'LAYOUT_WIDE';
p.author = '株式会社WineBank';
p.title  = 'WineBank 事業再生計画 FY2027';

const W=13.3, H=7.5;
const BERRY='6D2E46', ROSE='A26769', CREAM='ECE2D0', SAND='F7F3EF';
const INK='2B2B2B', MUT='7A6A64', WHT='FFFFFF', GOLD='9A7B4F', LINE='DED5CE', RED='C0392B';
const HF='Cambria', BF='Arial';
const sh=()=>({type:'outer',color:'000000',blur:10,offset:2,angle:90,opacity:0.10});
const M=v=>(v<0?'▲':'')+(Math.abs(v)/1e6).toFixed(1);
const yen=v=>(v<0?'▲':'')+Math.abs(v).toLocaleString('en-US');

function base(t,sub){
  const s=p.addSlide(); s.background={color:SAND};
  s.addText(t,{x:0.65,y:0.42,w:W-1.3,h:0.62,fontFace:HF,fontSize:29,bold:true,color:BERRY,margin:0});
  if(sub) s.addText(sub,{x:0.65,y:1.06,w:W-1.3,h:0.34,fontFace:BF,fontSize:12.5,color:MUT,margin:0});
  return s;
}
const foot=(s,t)=>s.addText(t,{x:0.65,y:H-0.52,w:W-1.3,h:0.3,fontFace:BF,fontSize:8.5,color:MUT,margin:0});
const card=(s,x,y,w,h,fill)=>s.addShape(p.ShapeType.roundRect,{x,y,w,h,fill:{color:fill||WHT},rectRadius:0.06,line:{color:LINE,width:0.75},shadow:sh()});
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
    s.addShape(p.ShapeType.rect,{x:x0,y,w:tw,h:rh,fill:{color:hl?CREAM:(i%2?'FBF9F7':WHT)},line:{color:LINE,width:0.5}});
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

/* 1 表紙 */
{
  const s=p.addSlide(); s.background={color:BERRY};
  s.addShape(p.ShapeType.ellipse,{x:10.4,y:-1.5,w:5.2,h:5.2,fill:{color:'7E3B54'}});
  s.addShape(p.ShapeType.ellipse,{x:11.6,y:4.6,w:3.4,h:3.4,fill:{color:'5C2439'}});
  s.addText('株式会社WineBank',{x:0.9,y:1.75,w:9,h:0.4,fontFace:BF,fontSize:14,color:CREAM,charSpacing:2,margin:0});
  s.addText('事業再生計画',{x:0.9,y:2.25,w:10,h:0.9,fontFace:HF,fontSize:46,bold:true,color:WHT,margin:0});
  s.addText('2027年9月期 － V字回復の根拠と資金計画',{x:0.9,y:3.2,w:10.5,h:0.6,fontFace:HF,fontSize:24,color:CREAM,margin:0});
  s.addText('金融機関・株主各位',{x:0.9,y:4.5,w:6,h:0.34,fontFace:BF,fontSize:13,color:CREAM,margin:0});
  s.addText('2026年8月',{x:0.9,y:4.9,w:6,h:0.34,fontFace:BF,fontSize:13,color:CREAM,margin:0});
  s.addText('本資料は2026年6月までの月次実績にもとづく計画です。',{x:0.9,y:6.5,w:11,h:0.34,fontFace:BF,fontSize:9.5,color:'C9A9B6',margin:0});
  s.addNotes('FY2026の赤字の主因である飲食事業の撤退は2026年3月で完了。4月以降が撤退後の実力値であり、ここを起点に組み立てている。');
}

/* 2 エグゼクティブサマリー */
{
  const s=base('エグゼクティブサマリー','FY2026の赤字は構造改革の費用。改革は実行済みで、効果は2026年4月以降の実績に表れています。');
  const items=[
    ['飲食事業の撤退は完了','2026年3月で撤退完了。4-6月が撤退後の実力値。'],
    ['固定費は年103百万円削減済み','月次販管費 38.7百万円（26/3）→ 24.6百万円（26/6）。'],
    ['FY2027に132.5百万円の収益上乗せ','経営指導料を中心としたストック型収益。'],
    ['ワイン仕入は落とさない','仕入を絞ると割当が戻らず2〜3年先の成長を削るため。']
  ];
  items.forEach((it,i)=>{
    const y=1.62+i*1.22;
    card(s,0.65,y,7.35,1.06);
    numDot(s,0.92,y+0.36,i+1);
    s.addText(it[0],{x:1.42,y:y+0.16,w:6.4,h:0.36,fontFace:BF,fontSize:14.5,bold:true,color:BERRY,margin:0});
    s.addText(it[1],{x:1.42,y:y+0.55,w:6.4,h:0.42,fontFace:BF,fontSize:11,color:INK,margin:0});
  });
  card(s,8.35,1.62,4.3,4.66,BERRY);
  s.addText('FY2027 経常利益（Dプラン）',{x:8.6,y:1.9,w:3.8,h:0.3,fontFace:BF,fontSize:11,color:CREAM,align:'center',margin:0});
  s.addText('＋137.5',{x:8.6,y:2.2,w:3.8,h:0.85,fontFace:HF,fontSize:42,bold:true,color:WHT,align:'center',margin:0});
  s.addText('百万円',{x:8.6,y:3.03,w:3.8,h:0.3,fontFace:BF,fontSize:11,color:CREAM,align:'center',margin:0});
  s.addText('FY2026 ▲124.8百万円から\n＋262.3百万円の改善',{x:8.6,y:3.42,w:3.8,h:0.62,fontFace:BF,fontSize:11.5,color:WHT,align:'center',margin:0});
  s.addShape(p.ShapeType.line,{x:8.85,y:4.24,w:3.3,h:0,line:{color:'8E5470',width:1}});
  s.addText('必要な売上高',{x:8.6,y:4.4,w:3.8,h:0.3,fontFace:BF,fontSize:11,color:CREAM,align:'center',margin:0});
  s.addText('621.1百万円',{x:8.6,y:4.7,w:3.8,h:0.6,fontFace:HF,fontSize:28,bold:true,color:CREAM,align:'center',margin:0});
  s.addText('FY2025実績752.9百万円の82.5%\nFY2026見込708.2百万円の87.7%',{x:8.6,y:5.36,w:3.8,h:0.7,fontFace:BF,fontSize:11,color:WHT,align:'center',margin:0});
  foot(s,'出典：事業計画202608（銀行様）全社シート月次実績、決算報告書 第54期、2026年7月度 取締役会資料');
  s.addNotes('Dプランは、ワイン仕入を落とさずに資金繰りが回る売上水準。必要売上621.1百万円は過去2期の実績を下回る。');
}

/* 3 2期の赤字の性質 */
{
  const s=base('FY2025・FY2026 － 性質の異なる2期の赤字','いずれも一過性・構造改革に起因するもので、本業の継続的な採算悪化ではありません。');
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
  s.addNotes('FY2025は経常段階ではほぼ均衡。損失は組織再編の特別損失。FY2026は飲食撤退という構造改革の費用。');
}

/* 4 飲食撤退による固定費削減 */
{
  const s=base('転換点 － 飲食事業の撤退による固定費削減','撤退に紐づく費用科目が実際に減少しています。削減は計画ではなく実績です。');
  const rows=[['雑給（店舗人件費）',1976720,198075],['従業員給与',4877779,2844602],['倉庫＆保管・移設代',2578077,272484],
              ['地代家賃（店舗賃料）',5000985,3721703],['支払手数料',4121789,3258950],['水道光熱費',974234,687496],['清掃費',182516,0]];
  const data=rows.map(r=>[r[0],yen(r[1]),yen(r[2]),yen(r[2]-r[1])]);
  data.push(['全23科目 合計',yen(33590696),yen(25013422),yen(-8577274)]);
  table(s,0.65,1.72,[{t:'勘定科目（単位：円）',w:3.4},{t:'① 25/10-26/3 月平均',w:1.85,a:'right'},
    {t:'② 26/4-6 月平均',w:1.65,a:'right'},{t:'差 ②-①',w:1.5,a:'right'}],data,{rh:0.5,hi:[7]});
  card(s,9.45,1.72,3.2,2.35,BERRY);
  s.addText('年間削減額',{x:9.65,y:2.0,w:2.8,h:0.3,fontFace:BF,fontSize:11,color:CREAM,align:'center',margin:0});
  s.addText('▲103',{x:9.65,y:2.32,w:2.8,h:0.8,fontFace:HF,fontSize:40,bold:true,color:WHT,align:'center',margin:0});
  s.addText('百万円',{x:9.65,y:3.12,w:2.8,h:0.3,fontFace:BF,fontSize:12,color:CREAM,align:'center',margin:0});
  s.addText('月▲8.58百万円 × 12か月',{x:9.65,y:3.5,w:2.8,h:0.3,fontFace:BF,fontSize:9.5,color:CREAM,align:'center',margin:0});
  card(s,9.45,4.25,3.2,2.1);
  s.addText('撤退が確認できる点',{x:9.65,y:4.45,w:2.8,h:0.3,fontFace:BF,fontSize:11,bold:true,color:BERRY,margin:0});
  s.addText([{text:'清掃費が完全にゼロ',options:{bullet:true,breakLine:true}},{text:'雑給が90%減',options:{bullet:true,breakLine:true}},
             {text:'店舗賃料の減少',options:{bullet:true,breakLine:true}},{text:'倉庫移設の完了',options:{bullet:true}}],
    {x:9.65,y:4.78,w:2.8,h:1.4,fontFace:BF,fontSize:10.5,color:INK,paraSpaceAfter:4,margin:0});
  foot(s,'出典：事業計画202608（銀行様）全社シート 販管費内訳（全23科目の月次実績）');
  s.addNotes('清掃費ゼロ・雑給90%減が、飲食店舗の撤退が実際に完了したことの裏付け。');
}

/* 5 販管費 月次推移 */
{
  const s=base('販管費の月次推移 － 削減は実行済み','2026年3月をピークに、2026年6月は▲36.4%。以降はこの水準を横ばいで計画しています。');
  const lab=['25/10','25/11','25/12','26/01','26/02','26/03','26/04','26/05','26/06'];
  const val=[25374892,30963282,38572456,33761779,34133901,38737868,25883967,24529013,24627286].map(v=>v/1e6);
  s.addChart(p.ChartType.bar,[{name:'販管費（百万円）',labels:lab,values:val}],{
    x:0.65,y:1.62,w:8.5,h:4.5,barDir:'col',
    chartColors:[ROSE,ROSE,ROSE,ROSE,ROSE,BERRY,'C4A79B','C4A79B','C4A79B'],varyColors:true,
    showTitle:false,showLegend:false,showValue:true,dataLabelPosition:'outEnd',dataLabelFormatCode:'0.0',
    dataLabelFontSize:9.5,dataLabelColor:INK,dataLabelFontFace:BF,
    catAxisLabelColor:MUT,catAxisLabelFontSize:10,catAxisLabelFontFace:BF,
    valAxisLabelColor:MUT,valAxisLabelFontSize:9.5,valAxisLabelFontFace:BF,
    valAxisMaxVal:45,valAxisMinVal:0,valGridLine:{color:'E8E0DA',size:1},catGridLine:{style:'none'},
    plotArea:{fill:{color:WHT}}});
  card(s,9.5,1.62,3.15,2.1,BERRY);
  s.addText('ピーク → 直近',{x:9.7,y:1.85,w:2.75,h:0.3,fontFace:BF,fontSize:11,color:CREAM,align:'center',margin:0});
  s.addText('▲36.4%',{x:9.7,y:2.15,w:2.75,h:0.75,fontFace:HF,fontSize:36,bold:true,color:WHT,align:'center',margin:0});
  s.addText('38.7百万円（26/3）\n→ 24.6百万円（26/6）',{x:9.7,y:2.92,w:2.75,h:0.6,fontFace:BF,fontSize:10.5,color:CREAM,align:'center',margin:0});
  card(s,9.5,3.9,3.15,2.22);
  s.addText('計画の前提',{x:9.7,y:4.1,w:2.75,h:0.3,fontFace:BF,fontSize:11,bold:true,color:BERRY,margin:0});
  s.addText('FY2027の販管費は、2026年4-6月の実績平均 25.0百万円/月をそのまま横ばいで置いています。さらなる削減は織り込んでいません。',
    {x:9.7,y:4.42,w:2.75,h:1.5,fontFace:BF,fontSize:10.5,color:INK,valign:'top',margin:0});
  foot(s,'出典：事業計画202608（銀行様）全社シート。2026/07以降は見込値のため本グラフから除外。');
  s.addNotes('2026年7月以降は事業計画上の見込値（同一値が並ぶプラグ）のため、実績としては使わずグラフからも除いている。');
}

/* 6 撤退後の実力値 */
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
    {text:'2025年10月〜2026年3月の数値には、撤退した飲食店舗の売上と費用が含まれています。',options:{breakLine:true}},{text:'',options:{breakLine:true}},
    {text:'このため同期間を基準にすると、すでに存在しない事業の損益を将来計画に持ち込むことになります。',options:{breakLine:true}},{text:'',options:{breakLine:true}},
    {text:'撤退が完了した2026年4月以降の3か月を基準とすることで、現在の事業構造をそのまま反映した計画になります。',options:{breakLine:true}},{text:'',options:{breakLine:true}},
    {text:'粗利率が51.5%と高いのは、低採算の飲食が抜け、ワイン投資販売中心の構成になったためです。',options:{}}
  ],{x:7.85,y:2.45,w:4.45,h:3.5,fontFace:BF,fontSize:11.5,color:INK,lineSpacing:17,margin:0});
  foot(s,'出典：事業計画202608（銀行様）全社シート 2026/04・05・06 実績の単純平均');
  s.addNotes('4月起点とする理由は飲食撤退店舗の損益を除くため。粗利率51.5%は事業構成の変化による。');
}

/* 7 上乗せ案件 */
{
  const s=base('FY2027の収益上乗せ － 132.5百万円','経営指導料を中心としたストック型収益。全額を営業収益に計上します。');
  const rows=[['経営指導料','Value table',10000000,'グループ'],['経営指導料','Prime',60000000,'グループ'],
              ['経営指導料','Apicius',10000000,'グループ'],['経営指導料','Thierry Marx',2500000,'外部'],
              ['経営指導料','ito＋Aqua＋Hokkaido',10000000,'外部'],['インセンティブ','Apicius2 shot',20000000,'グループ'],
              ['クルーザー事業利益','2027/03・09に各10百万円',20000000,'外部']];
  const y0=1.66, rh=0.53;
  s.addShape(p.ShapeType.rect,{x:0.65,y:y0,w:7.9,h:0.44,fill:{color:BERRY}});
  [['区分',0.85,1.9,'left'],['案件',2.75,2.5,'left'],['金額',5.35,1.6,'right'],['取引先',7.05,1.3,'center']]
    .forEach(hd=>s.addText(hd[0],{x:hd[1],y:y0,w:hd[2],h:0.44,fontFace:BF,fontSize:9.5,bold:true,color:WHT,align:hd[3],valign:'middle',margin:0}));
  rows.forEach((r,i)=>{
    const y=y0+0.44+i*rh;
    s.addShape(p.ShapeType.rect,{x:0.65,y,w:7.9,h:rh,fill:{color:i%2?'FBF9F7':WHT},line:{color:LINE,width:0.5}});
    s.addText(r[0],{x:0.85,y,w:1.9,h:rh,fontFace:BF,fontSize:9.5,color:MUT,valign:'middle',margin:0});
    s.addText(r[1],{x:2.75,y,w:2.5,h:rh,fontFace:BF,fontSize:10.5,bold:true,color:INK,valign:'middle',margin:0});
    s.addText('¥'+yen(r[2]),{x:5.35,y,w:1.6,h:rh,fontFace:BF,fontSize:11.5,bold:true,color:BERRY,align:'right',valign:'middle',margin:0});
    s.addShape(p.ShapeType.roundRect,{x:7.25,y:y+0.13,w:1.0,h:0.28,rectRadius:0.12,
      fill:{color:r[3]==='グループ'?CREAM:'E4EAE6'},line:{color:r[3]==='グループ'?ROSE:'8FA89B',width:0.5}});
    s.addText(r[3],{x:7.25,y:y+0.13,w:1.0,h:0.28,fontFace:BF,fontSize:8.5,color:INK,align:'center',valign:'middle',margin:0});
  });
  const yt=y0+0.44+rows.length*rh;
  s.addShape(p.ShapeType.rect,{x:0.65,y:yt,w:7.9,h:0.52,fill:{color:CREAM},line:{color:BERRY,width:1}});
  s.addText('合計',{x:0.85,y:yt,w:2,h:0.52,fontFace:BF,fontSize:11.5,bold:true,color:INK,valign:'middle',margin:0});
  s.addText('¥'+yen(132500000),{x:5.35,y:yt,w:1.6,h:0.52,fontFace:BF,fontSize:12.5,bold:true,color:BERRY,align:'right',valign:'middle',margin:0});
  card(s,8.95,1.66,3.7,1.7);
  s.addText('全額を営業収益に計上',{x:9.2,y:1.84,w:3.2,h:0.3,fontFace:BF,fontSize:10.5,bold:true,color:BERRY,margin:0});
  s.addText('クルーザー事業利益は投資損益ではなく事業利益のため、営業外収益ではなく営業収益として計上しています。',
    {x:9.2,y:2.18,w:3.2,h:1.0,fontFace:BF,fontSize:10.5,color:INK,valign:'top',margin:0});
  card(s,8.95,3.5,3.7,1.4);
  s.addText('取引先の内訳',{x:9.2,y:3.66,w:3.2,h:0.3,fontFace:BF,fontSize:10.5,bold:true,color:BERRY,margin:0});
  s.addText('グループ内　100.0百万円\n外部　32.5百万円',{x:9.2,y:4.0,w:3.2,h:0.8,fontFace:BF,fontSize:11.5,color:INK,lineSpacing:18,margin:0});
  card(s,8.95,5.04,3.7,1.26,CREAM);
  s.addText('グループ内取引については、支払側の支払能力と対価の算定根拠を整備のうえご説明します。',
    {x:9.2,y:5.2,w:3.2,h:0.95,fontFace:BF,fontSize:10,color:INK,margin:0});
  foot(s,'期間表記は2026/09-2027/08。決算期（2026/10-2027/09）と1か月ズレるため、全額をFY2027帰属として試算。');
  s.addNotes('グループ内取引100百万円は先に開示する。銀行の正常化調整で控除される可能性を織り込んでおく。');
}

/* 8 営業利益ブリッジ */
{
  const s=base('FY2026 → FY2027 営業利益ブリッジ','固定費削減と上乗せ案件だけで、既に営業損益は黒字転換します。');
  const steps=[{l:'FY2026\n営業利益',v:-114793431,t:'total'},{l:'① 既存事業\n粗利の減少',v:-28537477,t:'dn'},
               {l:'② 販管費\nの削減',v:43771772,t:'up'},{l:'③ 上乗せ案件\n（営業収益）',v:132500000,t:'up'},
               {l:'FY2027 営業利益\n（プランB）',v:32940864,t:'total'}];
  const cx=1.35, cw=1.95, gap=0.5, top=1.72, ph=3.18;
  const lo=-160e6, hi=60e6, span=hi-lo, yOf=v=>top+ph*(hi-v)/span;
  s.addShape(p.ShapeType.line,{x:cx,y:yOf(0),w:10.6,h:0,line:{color:'C9BDB5',width:1}});
  s.addText('0',{x:cx-0.42,y:yOf(0)-0.13,w:0.36,h:0.26,fontFace:BF,fontSize:9,color:MUT,align:'right',margin:0});
  let cum=0;
  steps.forEach((st,i)=>{
    const x=cx+i*(cw+gap); let y,h,col;
    if(st.t==='total'){ y=Math.min(yOf(0),yOf(st.v)); h=Math.abs(yOf(st.v)-yOf(0)); col='4A4A4A'; cum=st.v; }
    else { const f=cum,t2=cum+st.v; y=Math.min(yOf(f),yOf(t2)); h=Math.abs(yOf(t2)-yOf(f)); col=st.t==='up'?BERRY:ROSE; cum=t2; }
    if(h<0.06) h=0.06;
    s.addShape(p.ShapeType.rect,{x,y,w:cw,h,fill:{color:col}});
    s.addText((st.v>0?'+':'')+M(st.v),{x,y:st.v>=0?y-0.36:y+h+0.04,w:cw,h:0.32,fontFace:HF,fontSize:13,bold:true,
      color:col==='4A4A4A'?'4A4A4A':col,align:'center',margin:0});
    s.addText(st.l,{x:x-0.15,y:top+ph+0.3,w:cw+0.3,h:0.7,fontFace:BF,fontSize:10,color:INK,align:'center',margin:0});
  });
  s.addText('単位：百万円',{x:0.65,y:1.42,w:2,h:0.26,fontFace:BF,fontSize:9,color:MUT,margin:0});
  card(s,0.9,6.16,11.6,0.68,CREAM);
  s.addText('FY2026 ▲114.8百万円　→　FY2027 ＋32.9百万円。上乗せ案件と固定費削減だけで、営業損益は147.7百万円改善します。',
    {x:1.15,y:6.16,w:11.1,h:0.68,fontFace:BF,fontSize:12.2,bold:true,color:BERRY,valign:'middle',margin:0});
  foot(s,'①はFY2026に含まれる大口案件（2025/11・2026/09）を保守的にゼロと置いたことによる減少。');
  s.addNotes('①の粗利減少は、FY2026の大口スポット案件を来期はゼロと置いた保守性の表れ。事業が縮小したわけではない。');
}

/* 9 4プラン比較 */
{
  const s=base('4つのプラン － 資金繰りが成立するのはDのみ','ワイン仕入を落とさない前提では、経常利益1億円（プランC）でも資金が回りません。');
  const data=[
    ['売上高','389.1','389.1','548.3','621.1'],
    ['売上総利益 合計','200.6','333.1','415.2','452.7'],
    ['販管費','300.2','300.2','300.2','300.2'],
    ['営業利益','▲99.6','＋32.9','＋115.0','＋152.5'],
    ['経常利益','▲114.6','＋17.9','＋100.0','＋137.5'],
    ['期中 最低現預金','－','－','▲43.3','0.0']
  ];
  table(s,0.65,1.66,[{t:'（百万円）',w:3.3},{t:'A. 横ばいのみ',w:2.15,a:'right'},{t:'B. ＋上乗せ132.5',w:2.15,a:'right'},
    {t:'C. 経常利益1億円',w:2.15,a:'right'},{t:'D. CFが回る水準',w:2.25,a:'right'}],data,{rh:0.56,hi:[3,4,5],hs:9.5});
  card(s,0.65,5.5,5.85,1.4,BERRY);
  s.addText('プランC の問題',{x:0.95,y:5.68,w:5.25,h:0.3,fontFace:BF,fontSize:11,bold:true,color:CREAM,margin:0});
  s.addText('経常利益1億円を達成しても、ワイン仕入を維持すると2026年11月に資金ショート。期末▲38.7百万円。',
    {x:0.95,y:6.0,w:5.25,h:0.8,fontFace:BF,fontSize:11,color:WHT,valign:'top',margin:0});
  card(s,6.8,5.5,5.85,1.4,CREAM);
  s.addText('プランD が本線',{x:7.1,y:5.68,w:5.25,h:0.3,fontFace:BF,fontSize:11,bold:true,color:BERRY,margin:0});
  s.addText('売上621.1百万円で、仕入を落とさずに期中一度も現預金がマイナスにならない水準。',
    {x:7.1,y:6.0,w:5.25,h:0.8,fontFace:BF,fontSize:11,color:INK,valign:'top',margin:0});
  foot(s,'いずれも上場関連コストは計上せず、期首現預金30百万円（2026/09末のみずほ銀行200百万円返済後）を前提。');
  s.addNotes('Cは損益だけ見れば十分だが資金が回らない。損益と資金は別物であることを明示する。');
}

/* 10 ワイン在庫戦略 */
{
  const s=base('ワイン在庫は成長の源泉 － 仕入は落としません','仕入を絞ると生産者からの割当が戻らず、2〜3年先の成長を失います。');
  card(s,0.65,1.62,5.85,2.6);
  s.addText('自社在庫（簿価）の推移',{x:1.0,y:1.82,w:4.0,h:0.34,fontFace:BF,fontSize:12,bold:true,color:BERRY,margin:0});
  s.addText('単位：億円',{x:5.0,y:1.84,w:1.3,h:0.26,fontFace:BF,fontSize:8.5,color:MUT,align:'right',margin:0});
  const hist=[['24/12末',5.6],['25/07末',4.7],['25/09末',4.8],['25/12末',5.3],['26/03末',6.2]];
  const byBase=3.82, bmax=1.42;
  hist.forEach((h,i)=>{
    const hh=bmax*h[1]/6.5, x=1.0+i*1.05;
    s.addShape(p.ShapeType.rect,{x,y:byBase-hh,w:0.68,h:hh,fill:{color:i>=2?BERRY:'C9AEB8'}});
    s.addText(h[1].toFixed(1),{x:x-0.1,y:byBase-hh-0.3,w:0.88,h:0.28,fontFace:BF,fontSize:10,bold:true,color:BERRY,align:'center',margin:0});
    s.addText(h[0],{x:x-0.14,y:byBase+0.04,w:0.96,h:0.26,fontFace:BF,fontSize:8.5,color:MUT,align:'center',margin:0});
  });
  card(s,6.8,1.62,5.85,2.6,BERRY);
  s.addText('FY2027の仕入方針',{x:7.15,y:1.85,w:5.15,h:0.3,fontFace:BF,fontSize:11,color:CREAM,margin:0});
  s.addText('419.1百万円',{x:7.15,y:2.15,w:5.15,h:0.7,fontFace:HF,fontSize:36,bold:true,color:WHT,margin:0});
  s.addText('FY2026と同水準を維持。仕入を絞ると優良銘柄の割当が減り、一度失った枠を戻すには数年を要します。目先の資金のために将来の成長を削らない、という判断です。',
    {x:7.15,y:2.9,w:5.15,h:1.15,fontFace:BF,fontSize:11.5,color:CREAM,valign:'top',margin:0});
  const cards=[['期首在庫（2026/09末）','420.0百万円',INK],['FY2027 仕入','419.1百万円',BERRY],
               ['FY2027 売上原価（出庫）','300.9百万円',INK],['期末在庫','538.2百万円',GOLD]];
  cards.forEach((c,i)=>{
    const x=0.65+i*3.09;
    card(s,x,4.45,2.85,1.15);
    s.addText(c[0],{x:x+0.2,y:4.6,w:2.45,h:0.3,fontFace:BF,fontSize:9.5,color:MUT,margin:0});
    s.addText(c[1],{x:x+0.2,y:4.92,w:2.45,h:0.5,fontFace:HF,fontSize:18,bold:true,color:c[2],margin:0});
  });
  card(s,0.65,5.85,11.99,0.8,CREAM);
  s.addText('在庫は118.2百万円積み上がりますが、時価1.37倍の換価可能資産です。運転資金としてのご理解をお願いしたい部分です。',
    {x:1.0,y:5.85,w:11.3,h:0.8,fontFace:BF,fontSize:12,bold:true,color:BERRY,valign:'middle',margin:0});
  foot(s,'出典：2026年7月度 取締役会資料「ワイン預かり残高推移KPI」（税抜・簿価）。FY2026仕入額は売上原価479.1百万円＋在庫増減▲60.0百万円から逆算。');
  s.addNotes('在庫積み増しは資金を食うが、それは成長投資であり担保余力でもある、という整理。');
}

/* 11 FY2027 月次推移表 */
{
  const s=base('FY2027 月次推移表 － プランD','2026年4-6月の実力値をベースに、追加売上と上乗せ案件を計上したもの。単位：百万円');
  const MO=['26/10','26/11','26/12','27/01','27/02','27/03','27/04','27/05','27/06','27/07','27/08','27/09'];
  const gEx=16716827, gAdd=231928458*0.5155029/12, adv=92500000/12, sga=25013422, noe=1250000;
  const inc=i=>i===5?20000000:0, cr=i=>(i===5||i===11)?10000000:0;
  const defs=[
    ['売上高',i=>621069226/12],['売上総利益（事業）',i=>gEx+gAdd],['＋経営指導料',i=>adv],
    ['＋インセンティブ',inc],['＋クルーザー事業利益',cr],
    ['売上総利益 合計',i=>gEx+gAdd+adv+inc(i)+cr(i),true],['販管費',i=>-sga],
    ['営業利益',i=>gEx+gAdd+adv+inc(i)+cr(i)-sga,true],['営業外費用',i=>-noe],
    ['経常利益',i=>gEx+gAdd+adv+inc(i)+cr(i)-sga-noe,true]];
  const x0=0.65, lw=2.2, cwd=0.8, y0=1.62, rh=0.40;
  s.addShape(p.ShapeType.rect,{x:x0,y:y0,w:lw+cwd*12+0.95,h:0.42,fill:{color:BERRY}});
  s.addText('科目',{x:x0+0.12,y:y0,w:lw,h:0.42,fontFace:BF,fontSize:9,bold:true,color:WHT,valign:'middle',margin:0});
  MO.forEach((m,i)=>s.addText(m,{x:x0+lw+i*cwd,y:y0,w:cwd,h:0.42,fontFace:BF,fontSize:8.5,color:WHT,align:'center',valign:'middle',margin:0}));
  s.addText('通期',{x:x0+lw+12*cwd,y:y0,w:0.95,h:0.42,fontFace:BF,fontSize:9,bold:true,color:WHT,align:'center',valign:'middle',margin:0});
  defs.forEach((d,r)=>{
    const y=y0+0.42+r*rh, tot=[...Array(12)].reduce((a,_,i)=>a+d[1](i),0), b=d[2];
    s.addShape(p.ShapeType.rect,{x:x0,y,w:lw+cwd*12+0.95,h:rh,
      fill:{color:d[0]==='経常利益'?CREAM:(b?'F3EDE9':(r%2?'FBF9F7':WHT))},line:{color:LINE,width:0.5}});
    s.addText(d[0],{x:x0+0.12,y,w:lw,h:rh,fontFace:BF,fontSize:9,bold:b,color:INK,valign:'middle',margin:0});
    for(let i=0;i<12;i++){ const v=d[1](i);
      s.addText(M(v),{x:x0+lw+i*cwd,y,w:cwd,h:rh,fontFace:BF,fontSize:8.5,bold:b,color:v<0?RED:(b?BERRY:INK),align:'center',valign:'middle',margin:0}); }
    s.addText(M(tot),{x:x0+lw+12*cwd,y,w:0.95,h:rh,fontFace:BF,fontSize:9,bold:true,color:tot<0?RED:BERRY,align:'center',valign:'middle',margin:0});
  });
  const yb=y0+0.42+defs.length*rh+0.24;
  card(s,0.65,yb,11.99,0.92,CREAM);
  [['通期 売上高','621.1百万円'],['通期 営業利益','＋152.5百万円'],['通期 経常利益','＋137.5百万円']].forEach((c,i)=>{
    const x=1.0+i*3.95;
    s.addText(c[0],{x,y:yb+0.08,w:3.6,h:0.26,fontFace:BF,fontSize:9.5,color:MUT,margin:0});
    s.addText(c[1],{x,y:yb+0.30,w:3.6,h:0.34,fontFace:HF,fontSize:16,bold:true,color:BERRY,margin:0});
  });
  s.addText('経営指導料は12か月按分。インセンティブは2027/03、クルーザー事業利益は2027/03と2027/09に各10百万円を計上。',
    {x:1.0,y:yb+0.64,w:11.3,h:0.24,fontFace:BF,fontSize:8.5,color:MUT,margin:0});
  s.addNotes('2027年3月はインセンティブとクルーザーが重なり単月経常利益が大きく出る。');
}

/* 12 月次資金繰り */
{
  const s=base('FY2027 月次資金繰り － プランD','ワイン仕入419.1百万円を維持したまま、期中に一度も現預金がマイナスになりません。単位：百万円（税込）');
  const MO=['26/10','26/11','26/12','27/01','27/02','27/03','27/04','27/05','27/06','27/07','27/08','27/09'];
  const defs=[['営業収入 計',CF['in'],false],['営業支出 計',CF.out,false],['経常収支',CF.ord,true],
              ['財務収支 計',CF.fin,false],['当月収支',CF.net,true],['月末 現預金残高',CF.bal,true]];
  const x0=0.65, lw=2.3, cwd=0.85, y0=1.66, rh=0.48;
  s.addShape(p.ShapeType.rect,{x:x0,y:y0,w:lw+cwd*12,h:0.42,fill:{color:BERRY}});
  s.addText('科目',{x:x0+0.12,y:y0,w:lw,h:0.42,fontFace:BF,fontSize:9.5,bold:true,color:WHT,valign:'middle',margin:0});
  MO.forEach((m,i)=>s.addText(m,{x:x0+lw+i*cwd,y:y0,w:cwd,h:0.42,fontFace:BF,fontSize:8.5,color:WHT,align:'center',valign:'middle',margin:0}));
  defs.forEach((d,r)=>{
    const y=y0+0.42+r*rh, isBal=d[0]==='月末 現預金残高';
    s.addShape(p.ShapeType.rect,{x:x0,y,w:lw+cwd*12,h:rh,
      fill:{color:isBal?CREAM:(d[2]?'F3EDE9':(r%2?'FBF9F7':WHT))},line:{color:LINE,width:0.5}});
    s.addText(d[0],{x:x0+0.12,y,w:lw,h:rh,fontFace:BF,fontSize:9.5,bold:d[2],color:INK,valign:'middle',margin:0});
    d[1].forEach((v,i)=>s.addText(M(v),{x:x0+lw+i*cwd,y,w:cwd,h:rh,fontFace:BF,fontSize:9,bold:d[2]||isBal,
      color:v<0?RED:(d[2]||isBal?BERRY:INK),align:'center',valign:'middle',margin:0}));
  });
  const yb=y0+0.42+defs.length*rh+0.28;
  card(s,0.65,yb,5.85,1.5,BERRY);
  s.addText('ボトルネックは2026年11月',{x:0.95,y:yb+0.18,w:5.25,h:0.32,fontFace:BF,fontSize:12,bold:true,color:CREAM,margin:0});
  s.addText('FY2026分の消費税30百万円（うち20百万円は9月の在庫販売200百万円に係るもの）の納付月。売上が2か月分しか回収できていない時期に重なるため、ここが必要売上高を決めています。',
    {x:0.95,y:yb+0.55,w:5.25,h:0.9,fontFace:BF,fontSize:10.5,color:WHT,valign:'top',margin:0});
  const cs=[['A. プランD（本線）','＋41.3','0.0'],['B. 仕入を在庫横ばいにした場合','＋171.3','＋130.0'],
            ['C. 一時収益44百万円が未入金','▲2.7','▲44.0'],['D. 追加売上が未達','▲213.8','▲255.1']];
  s.addShape(p.ShapeType.rect,{x:6.8,y:yb,w:5.85,h:0.36,fill:{color:BERRY}});
  [['感応度',6.95,2.6,'left'],['期末残高',9.55,1.4,'right'],['期中最低',11.05,1.45,'right']]
    .forEach(h=>s.addText(h[0],{x:h[1],y:yb,w:h[2],h:0.36,fontFace:BF,fontSize:9,bold:true,color:WHT,align:h[3],valign:'middle',margin:0}));
  cs.forEach((c,i)=>{
    const y=yb+0.36+i*0.285;
    s.addShape(p.ShapeType.rect,{x:6.8,y,w:5.85,h:0.285,fill:{color:i===0?CREAM:(i%2?'FBF9F7':WHT)},line:{color:LINE,width:0.5}});
    s.addText(c[0],{x:6.95,y,w:2.6,h:0.285,fontFace:BF,fontSize:8.5,bold:i===0,color:INK,valign:'middle',margin:0});
    [[c[1],9.55,1.4],[c[2],11.05,1.45]].forEach(v=>s.addText(v[0],{x:v[1],y,w:v[2],h:0.285,fontFace:BF,fontSize:8.5,bold:i===0,
      color:String(v[0]).startsWith('▲')?RED:BERRY,align:'right',valign:'middle',margin:0}));
  });
  foot(s,'期首現預金30百万円（2026/09末にみずほ銀行へ200百万円返済後）。長期借入223.6百万円を7年均等返済と仮定。');
  s.addNotes('11月の消費税だけを短期でつなげば、必要売上のハードルは大きく下がる。銀行への具体的な依頼事項になる。');
}

/* 13 財務基盤 */
{
  const s=base('財務基盤 － 簿価より実態が厚い','ワイン現物という換価可能な資産があり、実態純資産は簿価を上回ります。（単位：円）');
  const rows=[['簿価純資産（2025/9末）',211755689,INK],['▲ ソフトウェア（換価性を保守評価）',-129822924,ROSE],
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
              ['有利子負債','386百万円','2025/9末586百万円から、2026/09末のみずほ銀行200百万円返済で減少。'],
              ['期首 現預金','30百万円','2026/09末時点。手元流動性は薄く、月次資金繰り表を別途ご提出します。']];
  side.forEach((c,i)=>{
    const y=1.72+i*1.62;
    card(s,7.95,y,4.7,1.45);
    s.addText(c[0],{x:8.2,y:y+0.14,w:2.2,h:0.3,fontFace:BF,fontSize:10.5,color:MUT,margin:0});
    s.addText(c[1],{x:8.2,y:y+0.4,w:4.2,h:0.42,fontFace:HF,fontSize:20,bold:true,color:BERRY,margin:0});
    s.addText(c[2],{x:8.2,y:y+0.85,w:4.2,h:0.52,fontFace:BF,fontSize:9.5,color:INK,margin:0});
  });
  foot(s,'出典：決算報告書 第54期（2025年9月30日現在）。商品の時価倍率1.37は事業計画202608（銀行様）の自社販売在庫 簿価/時価比率による。');
  s.addNotes('ソフトウェアは保守的に全額控除。それでも在庫含み益で実態純資産は簿価を上回る。');
}

/* 14 想定されるご指摘と対応 */
{
  const s=base('想定されるご指摘と当社の対応','先に論点を開示し、対応方針をあわせてご説明します。');
  const items=[
    ['グループ内取引 100百万円','上乗せ案件132.5百万円のうち約100百万円はグループ会社からの経営指導料。','支払側各社の支払能力と、対価の算定根拠（業務内容・工数）を文書化してご提出します。'],
    ['在庫積み増し 118百万円','仕入を維持するため、在庫が420→538百万円に増加します。','時価1.37倍の換価可能資産です。在庫見合いの運転資金枠をご相談させてください。'],
    ['2026年11月の資金需要','消費税30百万円の納付が、売上回収が進む前の時期に重なります。','短期のつなぎ資金でこの一点を越えられれば、通期の資金繰りは成立します。'],
    ['追加売上の未達リスク','仕入を固定するため、売上未達時の資金影響が大きくなります。','月次で進捗をご報告し、未達が見込まれる場合は仕入計画を機動的に見直します。']
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

/* 15 蓋然性 ★ */
{
  const s=base('プランDの蓋然性 － 過去実績が裏付けています','必要売上621.1百万円は、直近2期の実績をいずれも下回る水準です。');
  const data=[
    ['FY2024 実績','512.5','203.7','39.8%','－'],
    ['FY2025 実績','752.9','201.9','26.8%','82.5%'],
    ['FY2026 見込','708.2','229.1','32.4%','87.7%'],
    ['プランD（FY2027）','621.1','320.2','51.5%','－']
  ];
  table(s,0.65,1.66,[{t:'期',w:2.9},{t:'売上高（百万円）',w:2.2,a:'right'},{t:'事業粗利（百万円）',w:2.3,a:'right'},
    {t:'粗利率',w:1.6,a:'right'},{t:'プランD/実績',w:2.0,a:'right'}],data,{rh:0.52,hi:[3]});
  card(s,0.65,4.15,5.85,1.55,BERRY);
  s.addText('売上のハードルは低い',{x:0.95,y:4.33,w:5.25,h:0.32,fontFace:BF,fontSize:12,bold:true,color:CREAM,margin:0});
  s.addText('プランDの621.1百万円は、FY2025実績の82.5%、FY2026見込の87.7%。2期平均730.5百万円に対しては85.0%です。過去に到達した売上規模を下回ります。',
    {x:0.95,y:4.7,w:5.25,h:0.95,fontFace:BF,fontSize:11,color:WHT,valign:'top',margin:0});
  card(s,6.8,4.15,5.85,1.55,CREAM);
  s.addText('鍵は粗利率の構造変化',{x:7.1,y:4.33,w:5.25,h:0.32,fontFace:BF,fontSize:12,bold:true,color:BERRY,margin:0});
  s.addText('低採算の飲食が抜けたことで、粗利率は26.8%（FY2025）→32.4%（FY2026）→51.5%（撤退後実績）へ改善。同じ売上でも残る利益が大きく変わります。',
    {x:7.1,y:4.7,w:5.25,h:0.95,fontFace:BF,fontSize:11,color:INK,valign:'top',margin:0});
  card(s,0.65,5.9,11.99,0.85,CREAM);
  s.addText('過去2期の売上水準（708〜753百万円）を撤退後の粗利率で回した場合、経常利益は182〜205百万円。プランDの137.5百万円は上振れ余地を残した保守的な計画です。',
    {x:1.0,y:5.9,w:11.3,h:0.85,fontFace:BF,fontSize:12,bold:true,color:BERRY,valign:'middle',margin:0});
  foot(s,'事業粗利＝売上総利益から上乗せ案件132.5百万円を除いた本業ベース。粗利率51.5%は2026年4-6月実績。出典：事業計画202608（銀行様）、決算報告書 第54期。');
  s.addNotes('売上7億円は過去2期の実績値。プランDはそれを下回る6.2億円で成立する。粗利率改善の分だけ上振れ余地がある。');
}

/* 16 まとめ */
{
  const s=p.addSlide(); s.background={color:BERRY};
  s.addShape(p.ShapeType.ellipse,{x:-1.6,y:5.0,w:4.6,h:4.6,fill:{color:'5C2439'}});
  s.addText('まとめ',{x:0.9,y:0.75,w:8,h:0.7,fontFace:HF,fontSize:34,bold:true,color:WHT,margin:0});
  const pts=[
    ['FY2026の赤字は構造改革の費用','飲食事業の撤退は2026年3月に完了。年103百万円の固定費削減は実績です。'],
    ['上乗せ案件だけで営業損益は黒字転換','132.5百万円の計上により、FY2026比147.7百万円の改善。'],
    ['ワイン仕入は落としません','割当を守り2〜3年先の成長を確保。在庫は時価1.37倍の換価可能資産です。'],
    ['必要売上621.1百万円は過去2期を下回る','FY2025の82.5%、FY2026見込の87.7%。経常利益137.5百万円は保守的な計画です。']
  ];
  pts.forEach((t,i)=>{
    const y=1.75+i*1.12;
    s.addShape(p.ShapeType.ellipse,{x:0.9,y:y+0.06,w:0.4,h:0.4,fill:{color:CREAM}});
    s.addText(String(i+1),{x:0.9,y:y+0.06,w:0.4,h:0.4,fontFace:BF,fontSize:14,bold:true,color:BERRY,align:'center',valign:'middle',margin:0});
    s.addText(t[0],{x:1.55,y,w:7.4,h:0.4,fontFace:BF,fontSize:15.5,bold:true,color:WHT,margin:0});
    s.addText(t[1],{x:1.55,y:y+0.42,w:7.4,h:0.44,fontFace:BF,fontSize:11.5,color:'E4CBD6',margin:0});
  });
  card(s,9.4,1.75,3.25,4.25,'5C2439');
  s.addText('ご相談事項',{x:9.65,y:2.0,w:2.75,h:0.34,fontFace:BF,fontSize:12,bold:true,color:CREAM,margin:0});
  s.addText([
    {text:'2026年11月のつなぎ資金',options:{bullet:true,breakLine:true}},
    {text:'在庫見合いの運転資金枠',options:{bullet:true,breakLine:true}},
    {text:'財務制限条項の事前確認',options:{bullet:true,breakLine:true}},
    {text:'月次資金繰り表のご報告',options:{bullet:true}}
  ],{x:9.65,y:2.45,w:2.75,h:2.0,fontFace:BF,fontSize:11,color:WHT,paraSpaceAfter:9,margin:0});
  s.addText('株式会社WineBank',{x:0.9,y:6.55,w:6,h:0.34,fontFace:BF,fontSize:11,color:'C9A9B6',margin:0});
  s.addNotes('依頼事項を明確にして締める。11月のつなぎと在庫見合い枠の2点が具体的な依頼。');
}

p.writeFile({fileName:'WineBank_FY2027_銀行提出.pptx'}).then(f=>console.log('written:',f));
