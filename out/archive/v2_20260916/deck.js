const pptxgen = require('pptxgenjs');
const fs = require('fs');
const CF = JSON.parse(fs.readFileSync('cf_data.json','utf8'));
const p = new pptxgen();
p.layout = 'LAYOUT_WIDE';
p.author = '株式会社WineBank';
p.title  = 'WineBank 事業再生計画 FY2027';

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

/* 1 表紙 */
{
  const s=p.addSlide(); s.background={color:WHT};
  s.addShape(p.ShapeType.rect,{x:0,y:0,w:0.16,h:H,fill:{color:INK}});
  s.addText('株式会社WineBank',{x:0.9,y:1.7,w:9,h:0.4,fontFace:BF,fontSize:13,color:GOLD,charSpacing:3,margin:0});
  s.addText('事業再生計画',{x:0.9,y:2.2,w:10,h:0.95,fontFace:HF,fontSize:46,bold:true,color:INK,margin:0});
  s.addText('2027年9月期 － 未達の要因と回復の道筋',{x:0.9,y:3.25,w:10.5,h:0.6,fontFace:HF,fontSize:23,color:'4A4A4A',margin:0});
  s.addShape(p.ShapeType.rect,{x:0.9,y:4.25,w:1.6,h:0.025,fill:{color:GOLD}});
  s.addText('株式会社みずほ銀行 御中',{x:0.9,y:4.6,w:6,h:0.34,fontFace:BF,fontSize:13,color:INK,margin:0});
  s.addText('2026年8月',{x:0.9,y:5.0,w:6,h:0.34,fontFace:BF,fontSize:13,color:MUT,margin:0});
  s.addText('本資料は2026年6月までの月次実績にもとづく計画です。',{x:0.9,y:6.5,w:11,h:0.34,fontFace:BF,fontSize:9.5,color:MUT,margin:0});
  s.addNotes('FY2026の赤字の主因である不採算3店舗の撤退は2026年3月で完了。WineBankテラスはWineBank CLUBのフラッグシップ店として改善のうえ継続。4月以降が再編後の実力値。');
}

/* 2 エグゼクティブサマリー */
{
  const s=base('エグゼクティブサマリー','FY2026の未達は公募ファンドの遅延と構造改革の費用。改革は実行済みで、効果は2026年4月以降の実績に表れています。');
  const items=[
    ['未達の最大要因は公募ファンドの遅延','SBI証券との公募が大幅に遅延し、粗利200百万円超が当期に立ちませんでした。'],
    ['不採算3店舗の撤退は完了','2026年3月で完了。固定費は年103百万円削減済み。1店舗はフラッグシップ店として継続。'],
    ['来期は私募とオークションを主軸に','外部要因で動く公募を計画の柱から外します。'],
    ['プランDを本線、プランEを目指す','Dの既存事業730.5百万円は過去2期の売上平均そのものです。']
  ];
  items.forEach((it,i)=>{
    const y=1.62+i*1.22;
    card(s,0.65,y,7.35,1.06);
    numDot(s,0.92,y+0.36,i+1);
    s.addText(it[0],{x:1.42,y:y+0.16,w:6.4,h:0.36,fontFace:BF,fontSize:14.5,bold:true,color:BERRY,margin:0});
    s.addText(it[1],{x:1.42,y:y+0.55,w:6.4,h:0.42,fontFace:BF,fontSize:11,color:INK,margin:0});
  });
  card(s,8.35,1.62,4.3,4.66,BERRY);
  s.addText('FY2027 営業利益（プランD）',{x:8.6,y:1.9,w:3.8,h:0.3,fontFace:BF,fontSize:11,color:'D9D7D2',align:'center',margin:0});
  s.addText('＋135.4',{x:8.6,y:2.2,w:3.8,h:0.85,fontFace:HF,fontSize:42,bold:true,color:GOLD,align:'center',margin:0});
  s.addText('百万円',{x:8.6,y:3.03,w:3.8,h:0.3,fontFace:BF,fontSize:11,color:'D9D7D2',align:'center',margin:0});
  s.addText('経常利益は＋120.4百万円\nメインシナリオ',{x:8.6,y:3.42,w:3.8,h:0.62,fontFace:BF,fontSize:11.5,color:WHT,align:'center',margin:0});
  s.addShape(p.ShapeType.line,{x:8.85,y:4.24,w:3.3,h:0,line:{color:'6E6E6E',width:1}});
  s.addText('売上高（上乗せ含む）',{x:8.6,y:4.4,w:3.8,h:0.3,fontFace:BF,fontSize:11,color:'D9D7D2',align:'center',margin:0});
  s.addText('863.0百万円',{x:8.6,y:4.7,w:3.8,h:0.6,fontFace:HF,fontSize:26,bold:true,color:GOLD,align:'center',margin:0});
  s.addText('既存730.5（前期・今期の平均）\n＋上乗せ案件132.5百万円',{x:8.6,y:5.36,w:3.8,h:0.7,fontFace:BF,fontSize:11,color:WHT,align:'center',margin:0});
  foot(s,'出典：事業計画202608（銀行様）全社シート月次実績、決算報告書 第54期、2026年7月度 取締役会資料');
  s.addNotes('Dは既存事業を前期・今期の平均730.5百万円に置き、上乗せ案件132.5百万円を外数で加えたメインシナリオ。売上863.0百万円、経常＋120.4百万円。Eはさらに私募＋オークション300百万円を上積みした上振れ。');
}

/* 3 FY2026未達の理由 */
{
  const s=base('FY2026が計画に届かなかった理由','いずれも一過性または期ズレの要因で、既存事業の収益力そのものの毀損ではありません。');
  const rs=[
    ['SBI証券との公募ファンドが大幅に遅延','＋200.0','計画では売上約700百万円・粗利200百万円超を見込んでいましたが、審査・制度対応の長期化により当期中の組成に至りませんでした。組成時期の主導権が当社側にありません。'],
    ['私募ファンドの期ズレ（原価先行）','＋30.0','特殊な契約形態のため当期は原価が先に立ち、粗利率は約5%にとどまります。来期の販売実績に応じ、販売手数料を含め30百万円前後の粗利を来期計上します。'],
    ['不採算飲食3店舗の営業赤字','確定値','前期合併により引き継いだ3店舗。2026年3月に撤退完了。撤退により消滅した固定費は年103百万円（勘定科目レベルで検証済み）。']
  ];
  rs.forEach((r,i)=>{
    const y=1.6+i*1.56;
    card(s,0.65,y,7.75,1.42);
    numDot(s,0.95,y+0.52,i+1);
    s.addText(r[0],{x:1.45,y:y+0.18,w:5.0,h:0.42,fontFace:BF,fontSize:13,bold:true,color:INK,margin:0});
    s.addText(r[2],{x:1.45,y:y+0.62,w:5.0,h:0.7,fontFace:BF,fontSize:9.5,color:'4A4A4A',valign:'top',margin:0});
    s.addText(r[1],{x:6.55,y:y+0.42,w:1.7,h:0.55,fontFace:HF,fontSize:r[1]==='確定値'?13:21,bold:true,
      color:r[1]==='確定値'?MUT:GOLD,align:'right',valign:'middle',margin:0});
  });
  card(s,8.75,1.6,3.9,4.7,BERRY);
  s.addText('経常利益への影響',{x:9.0,y:1.85,w:3.4,h:0.3,fontFace:BF,fontSize:10.5,color:'D9D7D2',align:'center',margin:0});
  const wf=[['FY2026 着地見込','▲124.8'],['① 公募ファンド遅延','＋200.0'],['② 私募の期ズレ','＋30.0'],['③ 飲食3店舗の赤字','＋確定値']];
  wf.forEach((w,i)=>{
    const y=2.3+i*0.62;
    s.addText(w[0],{x:9.0,y,w:2.3,h:0.42,fontFace:BF,fontSize:10.5,color:WHT,valign:'middle',margin:0});
    s.addText(w[1],{x:11.15,y,w:1.25,h:0.42,fontFace:BF,fontSize:11.5,bold:true,
      color:w[1].startsWith('▲')?'D9D7D2':GOLD,align:'right',valign:'middle',margin:0});
  });
  s.addShape(p.ShapeType.line,{x:9.0,y:4.86,w:3.4,h:0,line:{color:'6E6E6E',width:1}});
  s.addText('計画どおりであれば',{x:9.0,y:5.0,w:3.4,h:0.3,fontFace:BF,fontSize:10.5,color:'D9D7D2',align:'center',margin:0});
  s.addText('＋105.2百万円以上',{x:9.0,y:5.32,w:3.4,h:0.55,fontFace:HF,fontSize:21,bold:true,color:GOLD,align:'center',margin:0});
  s.addText('（③の確定値を加える前）',{x:9.0,y:5.9,w:3.4,h:0.3,fontFace:BF,fontSize:9.5,color:'D9D7D2',align:'center',margin:0});
  foot(s,'出典：事業計画202608（銀行様）全社シート、決算報告書 第54期。①の売上約700百万円・粗利200百万円超は公募ファンド組成時の見込額。');
  s.addNotes('最大の未達要因はSBI証券との公募ファンドの遅延。これだけで粗利200百万円超。次に私募ファンドの期ズレ。飲食3店舗の赤字額は店舗別確定値を反映予定。');
}

/* 3.5 今期の反省と来期の方針 */
{
  const s=base('今期の反省と来期の方針','数字が悪かった原因を切り分け、来期の打ち手に落としています。');
  s.addText('今期（FY2026）の反省',{x:0.65,y:1.6,w:5.85,h:0.36,fontFace:HF,fontSize:17,bold:true,color:INK,margin:0});
  s.addShape(p.ShapeType.rect,{x:0.65,y:2.02,w:1.4,h:0.025,fill:{color:GOLD}});
  const han=[
    ['SBI証券との公募ファンドが大幅に遅延','最大の未達要因。売上約700百万円・粗利200百万円超が当期に立たなかった。組成の主導権が当社側になかった。'],
    ['私募ファンドの特殊契約により原価が先行','当期は粗利率約5%にとどまり、30百万円前後の粗利が来期にずれ込む。'],
    ['挽回策が後手に回った','私募ファンドで3億円程度を巻き返すにとどまり、遅延分を吸収できなかった。']
  ];
  han.forEach((t,i)=>{
    const y=2.28+i*1.38;
    card(s,0.65,y,5.85,1.22);
    numDot(s,0.95,y+0.42,i+1);
    s.addText(t[0],{x:1.45,y:y+0.18,w:4.85,h:0.4,fontFace:BF,fontSize:12.5,bold:true,color:INK,margin:0});
    s.addText(t[1],{x:1.45,y:y+0.6,w:4.85,h:0.52,fontFace:BF,fontSize:10.5,color:'4A4A4A',margin:0});
  });
  s.addText('来期（FY2027）の方針',{x:6.8,y:1.6,w:5.85,h:0.36,fontFace:HF,fontSize:17,bold:true,color:INK,margin:0});
  s.addShape(p.ShapeType.rect,{x:6.8,y:2.02,w:1.4,h:0.025,fill:{color:GOLD}});
  card(s,6.8,2.28,5.85,2.05,INK);
  s.addText('公募ファンドは優先しない',{x:7.15,y:2.5,w:5.15,h:0.4,fontFace:HF,fontSize:19,bold:true,color:GOLD,margin:0});
  s.addText('外部要因で組成時期が動く公募は、当期の収益計画の柱に置きません。遅延が全体計画を崩す構造から離れます。',
    {x:7.15,y:2.98,w:5.15,h:1.1,fontFace:BF,fontSize:11.5,color:WHT,valign:'top',margin:0});
  card(s,6.8,4.5,5.85,2.05,CREAM);
  s.addText('私募とオークションを毎年回す',{x:7.15,y:4.72,w:5.15,h:0.4,fontFace:HF,fontSize:19,bold:true,color:INK,margin:0});
  s.addText('自社で時期をコントロールでき実績もある私募を主軸に切り替え、毎年の定例組成として体制化します。オークションを並行する販売チャネルとして立ち上げ、単年度の振れを抑えます。',
    {x:7.15,y:5.2,w:5.15,h:1.15,fontFace:BF,fontSize:11,color:INK,valign:'top',margin:0});
  foot(s,'私募ファンドはFY2026に約3億円の実績。公募の遅延を補う位置づけから、来期は主軸へ転換します。');
  s.addNotes('公募の遅延という外部要因を、来期は計画の柱から外す。自社でコントロールできる私募とオークションを毎年回す体制に変える、という方針転換を明示する。プランEの300百万円がこれに当たる。');
}

/* 4 飲食撤退による固定費削減 */
{
  const s=base('転換点 － 飲食事業の再編による固定費削減','不採算3店舗を撤退。撤退に紐づく費用科目が実際に減少しています。削減は計画ではなく実績です。');
  const rows=[['雑給（店舗人件費）',1976720,198075],['従業員給与',4877779,2844602],['倉庫＆保管・移設代',2578077,272484],
              ['地代家賃（店舗賃料）',5000985,3721703],['支払手数料',4121789,3258950],['水道光熱費',974234,687496],['清掃費',182516,0]];
  const data=rows.map(r=>[r[0],yen(r[1]),yen(r[2]),yen(r[2]-r[1])]);
  data.push(['全23科目 合計',yen(33590696),yen(25013422),yen(-8577274)]);
  table(s,0.65,1.72,[{t:'勘定科目（単位：円）',w:3.4},{t:'① 25/10-26/3 月平均',w:1.85,a:'right'},
    {t:'② 26/4-6 月平均',w:1.65,a:'right'},{t:'差 ②-①',w:1.5,a:'right'}],data,{rh:0.5,hi:[7]});
  card(s,9.45,1.72,3.2,2.35,BERRY);
  s.addText('年間削減額',{x:9.65,y:2.0,w:2.8,h:0.3,fontFace:BF,fontSize:11,color:CREAM,align:'center',margin:0});
  s.addText('▲103',{x:9.65,y:2.32,w:2.8,h:0.8,fontFace:HF,fontSize:40,bold:true,color:GOLD,align:'center',margin:0});
  s.addText('百万円',{x:9.65,y:3.12,w:2.8,h:0.3,fontFace:BF,fontSize:12,color:CREAM,align:'center',margin:0});
  s.addText('月▲8.58百万円 × 12か月',{x:9.65,y:3.5,w:2.8,h:0.3,fontFace:BF,fontSize:9.5,color:CREAM,align:'center',margin:0});
  card(s,9.45,4.25,3.2,2.1);
  s.addText('飲食事業の再編',{x:9.65,y:4.45,w:2.8,h:0.3,fontFace:BF,fontSize:11,bold:true,color:BERRY,margin:0});
  s.addText([{text:'不採算3店舗を撤退',options:{bullet:true,breakLine:true}},
             {text:'WineBankテラスは改善のうえ継続',options:{bullet:true,breakLine:true}},
             {text:'　→ WineBank CLUBのフラッグシップ店',options:{breakLine:true}},
             {text:'清掃費ゼロ・雑給90%減が撤退完了の裏付け',options:{bullet:true}}],
    {x:9.65,y:4.75,w:2.8,h:1.5,fontFace:BF,fontSize:10,color:INK,paraSpaceAfter:3,margin:0});
  foot(s,'出典：事業計画202608（銀行様）全社シート 販管費内訳（全23科目の月次実績）');
  s.addNotes('主題は不採算店の撤退。WineBankテラスは残してフラッグシップ化しており、飲食から全面撤退したわけではない点を補足する。');
}

/* 5 販管費 月次推移 */
{
  const s=base('販管費の月次推移 － 削減は実行済み','2026年3月をピークに、2026年6月は▲36.4%。以降はこの水準を横ばいで計画しています。');
  const lab=['25/10','25/11','25/12','26/01','26/02','26/03','26/04','26/05','26/06'];
  const val=[25374892,30963282,38572456,33761779,34133901,38737868,25883967,24529013,24627286].map(v=>v/1e6);
  s.addChart(p.ChartType.bar,[{name:'販管費（百万円）',labels:lab,values:val}],{
    x:0.65,y:1.62,w:8.5,h:4.5,barDir:'col',
    chartColors:['B8B5AF','B8B5AF','B8B5AF','B8B5AF','B8B5AF','1A1A1A','A98442','A98442','A98442'],varyColors:true,
    showTitle:false,showLegend:false,showValue:true,dataLabelPosition:'outEnd',dataLabelFormatCode:'0.0',
    dataLabelFontSize:9.5,dataLabelColor:INK,dataLabelFontFace:BF,
    catAxisLabelColor:MUT,catAxisLabelFontSize:10,catAxisLabelFontFace:BF,
    valAxisLabelColor:MUT,valAxisLabelFontSize:9.5,valAxisLabelFontFace:BF,
    valAxisMaxVal:45,valAxisMinVal:0,valGridLine:{color:'ECEAE5',size:1},catGridLine:{style:'none'},
    plotArea:{fill:{color:WHT}}});
  card(s,9.5,1.62,3.15,2.1,BERRY);
  s.addText('ピーク → 直近',{x:9.7,y:1.85,w:2.75,h:0.3,fontFace:BF,fontSize:11,color:CREAM,align:'center',margin:0});
  s.addText('▲36.4%',{x:9.7,y:2.15,w:2.75,h:0.75,fontFace:HF,fontSize:36,bold:true,color:GOLD,align:'center',margin:0});
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
  const s=base('撤退後の実力値 － 2026年4-6月の月次平均','この3か月が、再編後のWineBank単体の実力です。FY2027はここを起点にしています。（単位：円）');
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
    {text:'2025年10月〜2026年3月の数値には、撤退した不採算3店舗の売上と費用が含まれています。',options:{breakLine:true}},{text:'',options:{breakLine:true}},
    {text:'このため同期間を基準にすると、すでに存在しない事業の損益を将来計画に持ち込むことになります。',options:{breakLine:true}},{text:'',options:{breakLine:true}},
    {text:'撤退が完了した2026年4月以降の3か月を基準とすることで、現在の事業構造をそのまま反映した計画になります。',options:{breakLine:true}},{text:'',options:{breakLine:true}},
    {text:'粗利率が51.5%と高いのは、低採算店が抜け、ワイン投資販売中心の構成になったためです。',options:{}}
  ],{x:7.85,y:2.45,w:4.45,h:3.5,fontFace:BF,fontSize:11.5,color:INK,lineSpacing:17,margin:0});
  foot(s,'出典：事業計画202608（銀行様）全社シート 2026/04・05・06 実績の単純平均');
  s.addNotes('4月起点とする理由は飲食撤退店舗の損益を除くため。粗利率51.5%は事業構成の変化による。');
}

/* 7 営業利益ブリッジ */
{
  const s=base('FY2026 → FY2027 営業利益ブリッジ（プランD）','固定費削減・売上回復・上乗せ案件の3つで、営業損益は250.2百万円改善します。');
  const steps=[{l:'FY2026\n営業利益',v:-114793431,t:'total'},{l:'① 既存事業\n粗利の減少',v:-28537477,t:'dn'},
               {l:'② 販管費\nの削減',v:43771772,t:'up'},{l:'③ 差額売上の粗利\n（売上平均へ回復）',v:102418378,t:'up'},
               {l:'④ 上乗せ案件\n（営業収益）',v:132500000,t:'up'},{l:'FY2027 営業利益\n（プランD）',v:135359242,t:'total'}];
  const cx=1.15, cw=1.62, gap=0.42, top=1.72, ph=3.18;
  const lo=-160e6, hi=160e6, span=hi-lo, yOf=v=>top+ph*(hi-v)/span;
  s.addShape(p.ShapeType.line,{x:cx,y:yOf(0),w:11.0,h:0,line:{color:'C9BDB5',width:1}});
  s.addText('0',{x:cx-0.42,y:yOf(0)-0.13,w:0.36,h:0.26,fontFace:BF,fontSize:9,color:MUT,align:'right',margin:0});
  let cum=0;
  steps.forEach((st,i)=>{
    const x=cx+i*(cw+gap); let y,h,col;
    if(st.t==='total'){ y=Math.min(yOf(0),yOf(st.v)); h=Math.abs(yOf(st.v)-yOf(0)); col='6E6E6E'; cum=st.v; }
    else { const f=cum,t2=cum+st.v; y=Math.min(yOf(f),yOf(t2)); h=Math.abs(yOf(t2)-yOf(f)); col=st.t==='up'?BERRY:ROSE; cum=t2; }
    if(h<0.06) h=0.06;
    s.addShape(p.ShapeType.rect,{x,y,w:cw,h,fill:{color:col}});
    s.addText((st.v>0?'+':'')+M(st.v),{x:x-0.12,y:st.v>=0?y-0.36:y+h+0.04,w:cw+0.24,h:0.32,fontFace:HF,fontSize:12,bold:true,
      color:col==='6E6E6E'?'6E6E6E':col,align:'center',margin:0});
    s.addText(st.l,{x:x-0.2,y:top+ph+0.28,w:cw+0.4,h:0.78,fontFace:BF,fontSize:9,color:INK,align:'center',margin:0});
  });
  s.addText('単位：百万円',{x:0.65,y:1.42,w:2,h:0.26,fontFace:BF,fontSize:9,color:MUT,margin:0});
  card(s,0.9,6.16,11.6,0.68,CREAM);
  s.addText('FY2026 ▲114.8百万円　→　FY2027 ＋135.4百万円。③は既存事業を前期・今期の売上平均730.5百万円に戻すだけの回復です。',
    {x:1.15,y:6.16,w:11.1,h:0.68,fontFace:BF,fontSize:11.5,bold:true,color:BERRY,valign:'middle',margin:0});
  foot(s,'①はFY2026に含まれる大口案件（2025/11・2026/09）を保守的にゼロと置いたことによる減少。③の差額売上341.4百万円の粗利率は保守的に30%。');
  s.addNotes('①の粗利減少は、FY2026の大口スポット案件を来期はゼロと置いた保守性の表れ。③は新規開拓ではなく過去2期平均への復元。');
}

/* 8 2プラン比較 */
{
  const s=base('2つのプラン － Dがメイン、Eが上振れ','Dは既存事業を過去2期の売上平均に戻すだけ。Eはそこに私募＋オークション300百万円を上積みします。');
  const data=[
    ['売上高（上乗せ含む）','389.1','863.0','1,163.0'],
    ['　うち 既存事業','389.1','730.5','1,030.5'],
    ['　うち 上乗せ案件','－','132.5','132.5'],
    ['売上総利益 合計','200.6','435.5','525.5'],
    ['総合粗利率','51.5%','50.5%','45.2%'],
    ['販管費','300.2','300.2','300.2'],
    ['営業利益','▲99.6','＋135.4','＋225.4'],
    ['経常利益','▲114.6','＋120.4','＋210.4'],
    ['期中 最低現預金','－','＋40.3','＋370.3']
  ];
  table(s,0.65,1.66,[{t:'（百万円）',w:4.0},{t:'横ばい実力値（参考）',w:2.6,a:'right'},
    {t:'プランD　メインシナリオ',w:2.7,a:'right'},{t:'プランE　上振れシナリオ',w:2.69,a:'right'}],
    data,{rh:0.37,hi:[6,7,8],hs:9});
  card(s,0.65,5.45,5.85,1.42,BERRY);
  s.addText('D は過去2期の実績そのもの',{x:0.95,y:5.62,w:5.25,h:0.3,fontFace:BF,fontSize:11,bold:true,color:GOLD,margin:0});
  s.addText('既存事業730.5百万円は前期・今期の売上平均で、新規の前提を置いていません。ここに契約ベースの上乗せ案件を外数で加算しています。',
    {x:0.95,y:5.93,w:5.25,h:0.85,fontFace:BF,fontSize:10.5,color:WHT,valign:'top',margin:0});
  card(s,6.8,5.45,5.85,1.42,CREAM);
  s.addText('E は私募＋オークションの上積み',{x:7.1,y:5.62,w:5.25,h:0.3,fontFace:BF,fontSize:11,bold:true,color:INK,margin:0});
  s.addText('追加売上300百万円・粗利率30%。FY2026に私募で約300百万円を巻き返した実績と同水準を、来期の主軸として置き直したものです。',
    {x:7.1,y:5.93,w:5.25,h:0.85,fontFace:BF,fontSize:10.5,color:INK,valign:'top',margin:0});
  foot(s,'上場関連コストは計上せず、期首現預金30百万円（2026/09末のみずほ銀行200百万円返済後）を前提。上乗せ案件132.5百万円は原価なしのため総合粗利率を押し上げます。');
  s.addNotes('プランは2本のみ。Dが銀行提出のメインシナリオ、Eが施策を打った場合の上振れ。横ばい実力値は積み上げの出発点として参考掲示。');
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
    s.addShape(p.ShapeType.rect,{x,y:byBase-hh,w:0.68,h:hh,fill:{color:i>=2?BERRY:'D6D4D0'}});
    s.addText(h[1].toFixed(1),{x:x-0.1,y:byBase-hh-0.3,w:0.88,h:0.28,fontFace:BF,fontSize:10,bold:true,color:BERRY,align:'center',margin:0});
    s.addText(h[0],{x:x-0.14,y:byBase+0.04,w:0.96,h:0.26,fontFace:BF,fontSize:8.5,color:MUT,align:'center',margin:0});
  });
  card(s,6.8,1.62,5.85,2.6,BERRY);
  s.addText('FY2027の仕入方針',{x:7.15,y:1.85,w:5.15,h:0.3,fontFace:BF,fontSize:11,color:CREAM,margin:0});
  s.addText('419.1百万円',{x:7.15,y:2.15,w:5.15,h:0.7,fontFace:HF,fontSize:36,bold:true,color:WHT,margin:0});
  s.addText('FY2026と同水準を維持。仕入を絞ると優良銘柄の割当が減り、一度失った枠を戻すには数年を要します。目先の資金のために将来の成長を削らない、という判断です。',
    {x:7.15,y:2.9,w:5.15,h:1.15,fontFace:BF,fontSize:11.5,color:CREAM,valign:'top',margin:0});
  const cards=[['期首在庫（2026/09末）','420.0百万円',INK],['FY2027 仕入','419.1百万円',BERRY],
               ['FY2027 売上原価（出庫）','427.5百万円',INK],['期末在庫','411.6百万円',GOLD]];
  cards.forEach((c,i)=>{
    const x=0.65+i*3.09;
    card(s,x,4.45,2.85,1.15);
    s.addText(c[0],{x:x+0.2,y:4.6,w:2.45,h:0.3,fontFace:BF,fontSize:9.5,color:MUT,margin:0});
    s.addText(c[1],{x:x+0.2,y:4.92,w:2.45,h:0.5,fontFace:HF,fontSize:18,bold:true,color:c[2],margin:0});
  });
  card(s,0.65,5.85,11.99,0.8,CREAM);
  s.addText('プランDでは売上原価427.5百万円が仕入419.1百万円とほぼ見合い、在庫は420.0→411.6百万円と横ばい。仕入を維持しても資金が固定されません。',
    {x:1.0,y:5.85,w:11.3,h:0.8,fontFace:BF,fontSize:12,bold:true,color:BERRY,valign:'middle',margin:0});
  foot(s,'出典：2026年7月度 取締役会資料「ワイン預かり残高推移KPI」（税抜・簿価）。FY2026仕入額は売上原価479.1百万円＋在庫増減▲60.0百万円から逆算。');
  s.addNotes('在庫積み増しは資金を食うが、それは成長投資であり担保余力でもある、という整理。');
}

/* 11 FY2027 月次推移表 */
{
  const s=base('FY2027 月次推移表 － プランD','既存389.1（51.5%）＋差額341.4（30%）＋上乗せ132.5（原価なし）。単位：百万円');
  const MO=['26/10','26/11','26/12','27/01','27/02','27/03','27/04','27/05','27/06','27/07','27/08','27/09'];
  const gEx=303020306/12, adv=92500000/12, sga=25013422, noe=1250000;
  const inc=i=>i===5?20000000:0, cr=i=>(i===5||i===11)?10000000:0;
  const defs=[
    ['売上高（既存事業）',i=>730535360/12],['売上原価',i=>-(730535360-303020306)/12],
    ['売上総利益（既存事業）',i=>gEx],['＋コンサルティング料',i=>adv],
    ['＋M&A仲介',inc],['＋クルーザー×ワイン事業',cr],
    ['売上総利益 合計',i=>gEx+adv+inc(i)+cr(i),true],['販管費',i=>-sga],
    ['営業利益',i=>gEx+adv+inc(i)+cr(i)-sga,true],['営業外費用',i=>-noe],
    ['経常利益',i=>gEx+adv+inc(i)+cr(i)-sga-noe,true]];
  const x0=0.65, lw=2.2, cwd=0.8, y0=1.58, rh=0.365;
  s.addShape(p.ShapeType.rect,{x:x0,y:y0,w:lw+cwd*12+0.95,h:0.42,fill:{color:BERRY}});
  s.addText('科目',{x:x0+0.12,y:y0,w:lw,h:0.42,fontFace:BF,fontSize:9,bold:true,color:WHT,valign:'middle',margin:0});
  MO.forEach((m,i)=>s.addText(m,{x:x0+lw+i*cwd,y:y0,w:cwd,h:0.42,fontFace:BF,fontSize:8.5,color:WHT,align:'center',valign:'middle',margin:0}));
  s.addText('通期',{x:x0+lw+12*cwd,y:y0,w:0.95,h:0.42,fontFace:BF,fontSize:9,bold:true,color:WHT,align:'center',valign:'middle',margin:0});
  defs.forEach((d,r)=>{
    const y=y0+0.42+r*rh, tot=[...Array(12)].reduce((a,_,i)=>a+d[1](i),0), b=d[2];
    s.addShape(p.ShapeType.rect,{x:x0,y,w:lw+cwd*12+0.95,h:rh,
      fill:{color:d[0]==='経常利益'?CREAM:(b?'F5F3EE':(r%2?'FBFAF8':WHT))},line:{color:LINE,width:0.5}});
    s.addText(d[0],{x:x0+0.12,y,w:lw,h:rh,fontFace:BF,fontSize:9,bold:b,color:INK,valign:'middle',margin:0});
    for(let i=0;i<12;i++){ const v=d[1](i);
      s.addText(M(v),{x:x0+lw+i*cwd,y,w:cwd,h:rh,fontFace:BF,fontSize:8.5,bold:b,color:v<0?RED:(b?BERRY:INK),align:'center',valign:'middle',margin:0}); }
    s.addText(M(tot),{x:x0+lw+12*cwd,y,w:0.95,h:rh,fontFace:BF,fontSize:9,bold:true,color:tot<0?RED:BERRY,align:'center',valign:'middle',margin:0});
  });
  const yb=y0+0.42+defs.length*rh+0.20;
  card(s,0.65,yb,11.99,0.92,CREAM);
  [['売上高 合計（上乗せ含む）','863.0百万円'],['通期 営業利益','＋135.4百万円'],['通期 経常利益','＋120.4百万円']].forEach((c,i)=>{
    const x=1.0+i*3.95;
    s.addText(c[0],{x,y:yb+0.08,w:3.6,h:0.26,fontFace:BF,fontSize:9.5,color:MUT,margin:0});
    s.addText(c[1],{x,y:yb+0.30,w:3.6,h:0.34,fontFace:HF,fontSize:16,bold:true,color:BERRY,margin:0});
  });
  s.addText('コンサルティング料は12か月按分。M&A仲介は2027/03、クルーザー×ワイン事業は2027/03と2027/09に各10百万円を計上。',
    {x:1.0,y:yb+0.64,w:11.3,h:0.24,fontFace:BF,fontSize:8.5,color:MUT,margin:0});
  s.addNotes('プランDの月次。通期経常＋120.4百万円。3月にM&A仲介と新規クルーザー事業30百万円が乗る。');
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
      fill:{color:isBal?CREAM:(d[2]?'F5F3EE':(r%2?'FBFAF8':WHT))},line:{color:LINE,width:0.5}});
    s.addText(d[0],{x:x0+0.12,y,w:lw,h:rh,fontFace:BF,fontSize:9.5,bold:d[2],color:INK,valign:'middle',margin:0});
    d[1].forEach((v,i)=>s.addText(M(v),{x:x0+lw+i*cwd,y,w:cwd,h:rh,fontFace:BF,fontSize:9,bold:d[2]||isBal,
      color:v<0?RED:(d[2]||isBal?BERRY:INK),align:'center',valign:'middle',margin:0}));
  });
  const yb=y0+0.42+defs.length*rh+0.28;
  card(s,0.65,yb,5.85,1.62,BERRY);
  s.addText('最も薄いのは期首直後',{x:0.95,y:yb+0.18,w:5.25,h:0.32,fontFace:BF,fontSize:12,bold:true,color:GOLD,margin:0});
  s.addText('期首30.0百万円に対し、期中最低は2026/10末の40.3百万円。11月にFY2026分の消費税確定納付3.6百万円、2・5・8月に中間納付2.0百万円を織り込んでも、以降は毎月プラスで積み上がり期末187.1百万円。',
    {x:0.95,y:yb+0.55,w:5.25,h:1.05,fontFace:BF,fontSize:10.5,color:WHT,valign:'top',margin:0});
  const cs=[['A. プランD（本線）','＋187.1','＋40.3'],['B. 仕入を売上原価に連動','＋177.8','＋31.0'],
            ['C. 一時収益44百万円が未入金','＋143.1','▲3.7'],['D. 差額売上341.4百万円が未達','▲188.4','▲335.3'],
            ['E. プランE（私募＋オークション）','＋517.1','＋370.3']];
  s.addShape(p.ShapeType.rect,{x:6.8,y:yb,w:5.85,h:0.32,fill:{color:BERRY}});
  [['感応度',6.95,2.6,'left'],['期末残高',9.55,1.4,'right'],['期中最低',11.05,1.45,'right']]
    .forEach(h=>s.addText(h[0],{x:h[1],y:yb,w:h[2],h:0.32,fontFace:BF,fontSize:9,bold:true,color:WHT,align:h[3],valign:'middle',margin:0}));
  cs.forEach((c,i)=>{
    const y=yb+0.32+i*0.25;
    s.addShape(p.ShapeType.rect,{x:6.8,y,w:5.85,h:0.25,fill:{color:i===0?CREAM:(i%2?'FBFAF8':WHT)},line:{color:LINE,width:0.5}});
    s.addText(c[0],{x:6.95,y,w:2.6,h:0.25,fontFace:BF,fontSize:8.5,bold:i===0,color:INK,valign:'middle',margin:0});
    [[c[1],9.55,1.4],[c[2],11.05,1.45]].forEach(v=>s.addText(v[0],{x:v[1],y,w:v[2],h:0.25,fontFace:BF,fontSize:8.5,bold:i===0,
      color:String(v[0]).startsWith('▲')?RED:BERRY,align:'right',valign:'middle',margin:0}));
  });
  foot(s,'期首現預金30百万円（2026/09末にみずほ銀行へ200百万円返済後）。消費税はFY2026実績から算定（確定3.6＋中間2.0×3回＝年9.6百万円）。');
  s.addNotes('プランDでは期中最低40.3百万円、期末187.1百万円。仕入を維持しても在庫が積み上がらないため、資金が固定されないことが効いている。ケースDは差額売上が未達の場合で、その差が本計画の意味。');
}

/* 12.5 プランE 上振れシナリオ */
{
  const s=base('プランE － 上振れシナリオの中身','私募ファンドとオークションで300百万円。FY2026に私募で巻き返した実績と同水準です。');
  const rows=[['私募ファンド','自社で組成時期をコントロールできる主軸チャネル。FY2026に約300百万円の組成実績。'],
              ['オークション','私募と並ぶ販売チャネルとして立ち上げ。自社在庫の換価と新規顧客の獲得を兼ねる。']];
  rows.forEach((r,i)=>{
    const y=1.62+i*1.34;
    card(s,0.65,y,7.35,1.18);
    numDot(s,0.95,y+0.42,i+1);
    s.addText(r[0],{x:1.45,y:y+0.18,w:6.3,h:0.38,fontFace:BF,fontSize:13.5,bold:true,color:INK,margin:0});
    s.addText(r[1],{x:1.45,y:y+0.58,w:6.3,h:0.52,fontFace:BF,fontSize:10.5,color:'4A4A4A',valign:'top',margin:0});
  });
  const calc=[['追加売上','300.0百万円'],['粗利率','30%'],['追加粗利','＋90.0百万円'],['販管費の増加','なし（既存人員で対応）']];
  const cy=4.42;
  card(s,0.65,cy,7.35,1.9);
  s.addText('損益へのインパクト',{x:1.0,y:cy+0.16,w:4.0,h:0.3,fontFace:BF,fontSize:11,bold:true,color:BERRY,margin:0});
  calc.forEach((c,i)=>{
    const y=cy+0.52+i*0.33;
    s.addText(c[0],{x:1.0,y,w:3.4,h:0.3,fontFace:BF,fontSize:10.5,color:INK,valign:'middle',margin:0});
    s.addText(c[1],{x:4.4,y,w:3.3,h:0.3,fontFace:BF,fontSize:10.5,bold:i===2,color:i===2?BERRY:INK,align:'right',valign:'middle',margin:0});
  });
  card(s,8.35,1.62,4.3,4.7,BERRY);
  s.addText('プランE 経常利益',{x:8.6,y:1.9,w:3.8,h:0.3,fontFace:BF,fontSize:11,color:'D9D7D2',align:'center',margin:0});
  s.addText('＋210.4',{x:8.6,y:2.2,w:3.8,h:0.85,fontFace:HF,fontSize:42,bold:true,color:GOLD,align:'center',margin:0});
  s.addText('百万円',{x:8.6,y:3.03,w:3.8,h:0.3,fontFace:BF,fontSize:11,color:'D9D7D2',align:'center',margin:0});
  s.addShape(p.ShapeType.line,{x:8.85,y:3.5,w:3.3,h:0,line:{color:'6E6E6E',width:1}});
  const cmp=[['売上高','1,163.0'],['売上総利益','525.5'],['営業利益','＋225.4'],['期中 最低現預金','＋370.3']];
  cmp.forEach((c,i)=>{
    const y=3.72+i*0.5;
    s.addText(c[0],{x:8.85,y,w:2.2,h:0.4,fontFace:BF,fontSize:10.5,color:WHT,valign:'middle',margin:0});
    s.addText(c[1],{x:10.9,y,w:1.5,h:0.4,fontFace:BF,fontSize:11.5,bold:true,color:GOLD,align:'right',valign:'middle',margin:0});
  });
  s.addText('プランD比　経常＋90.0百万円',{x:8.6,y:5.85,w:3.8,h:0.3,fontFace:BF,fontSize:10,color:'D9D7D2',align:'center',margin:0});
  foot(s,'粗利率30%はFY2025 26.8%・FY2026 32.4%の実績水準。販管費はプランDと同額で据置き、既存人員で対応可能な範囲としています。');
  s.addNotes('プランEは施策を打った場合の上振れ。300百万円はFY2026に私募で巻き返した金額と同水準で、まったくの新規前提ではない。');
}

/* 13 財務基盤 */
{
  const s=base('財務基盤 － 簿価より実態が厚い','ワイン現物という換価可能な資産があり、実態純資産は簿価を上回ります。（単位：円）');
  const rows=[['簿価純資産（2025/9末）',211755689,INK],['▲ ソフトウェア（換価性を保守評価）',-129822924,ROSE],
              ['＋ 商品の含み益（時価1.37倍）',186716373,BERRY]];
  rows.forEach((r,i)=>{
    const y=1.72+i*0.8;
    s.addShape(p.ShapeType.rect,{x:0.65,y,w:7.0,h:0.68,fill:{color:i%2?'FBFAF8':WHT},line:{color:LINE,width:0.5}});
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
    ['グループ内取引 92.5百万円','上乗せ案件132.5百万円のうち92.5百万円はグループ会社からのコンサルティング料。','支払側各社の支払能力と、対価の算定根拠（業務内容・工数）を文書化してご提出します。'],
    ['ワイン仕入を維持しても在庫は増えない','仕入419.1百万円に対し売上原価427.5百万円。在庫は420.0→411.6百万円とほぼ横ばいです。','割当を守りながら資金が在庫に固定されません。在庫見合いの運転資金枠はあわせてご相談させてください。'],
    ['期首現預金30百万円の薄さ','2026/09末のみずほ銀行200百万円返済後の手元は薄く、期首直後が最も緊張します。','短期借入162百万円の借換継続をお願いできれば、期中最低40.3百万円で通期の資金繰りは成立します。'],
    ['差額売上の未達リスク','仕入を固定するため、差額売上341.4百万円が未達の場合の資金影響が大きくなります。','月次で進捗をご報告し、未達が見込まれる場合は仕入計画を機動的に見直します。']
  ];
  items.forEach((it,i)=>{
    const x=0.65+(i%2)*6.35, y=1.62+Math.floor(i/2)*2.42;
    card(s,x,y,6.0,2.22);
    numDot(s,x+0.3,y+0.26,i+1);
    s.addText(it[0],{x:x+0.78,y:y+0.24,w:4.95,h:0.36,fontFace:BF,fontSize:12.5,bold:true,color:BERRY,margin:0});
    s.addText(it[1],{x:x+0.32,y:y+0.68,w:5.4,h:0.62,fontFace:BF,fontSize:10,color:MUT,valign:'top',margin:0});
    s.addShape(p.ShapeType.roundRect,{x:x+0.32,y:y+1.3,w:5.4,h:0.76,rectRadius:0.05,fill:{color:CREAM}});
    s.addText(it[2],{x:x+0.5,y:y+1.3,w:5.05,h:0.76,fontFace:BF,fontSize:10,color:INK,valign:'middle',margin:0});
  });
  foot(s,'');
  s.addNotes('銀行に指摘される前に自分から出す。これが信頼確保の基本方針。');
}

/* 15 蓋然性 ★ */
{
  const s=base('プランDは過去実績そのもの','Dの既存事業730.5百万円は前期・今期の売上平均で、新たな成長を一切前提にしていません。トラックレコードが裏付けます。');
  const data=[
    ['FY2024 実績','512.5','203.7','39.8%','70.2%'],
    ['FY2025 実績','752.9','201.9','26.8%','103.1%'],
    ['FY2026 見込','708.2','229.1','32.4%','96.9%'],
    ['プランD（既存730.5）','863.0','435.5','50.5%','100.0%'],
    ['プランE（既存1,030.5）','1,163.0','525.5','45.2%','141.1%']
  ];
  table(s,0.65,1.66,[{t:'期',w:3.1},{t:'売上高（百万円）',w:2.2,a:'right'},{t:'事業粗利（百万円）',w:2.3,a:'right'},
    {t:'粗利率',w:1.6,a:'right'},{t:'既存事業／2期平均',w:2.0,a:'right'}],data,{rh:0.42,hi:[3,4]});
  card(s,0.65,4.42,5.85,1.35,BERRY);
  s.addText('D は新規前提ゼロで届く水準',{x:0.95,y:4.58,w:5.25,h:0.32,fontFace:BF,fontSize:12,bold:true,color:GOLD,margin:0});
  s.addText('既存事業730.5百万円は過去2期の平均そのもの。FY2025は既にこれを上回る752.9百万円を計上しており、到達実績のある水準です。',
    {x:0.95,y:4.92,w:5.25,h:0.8,fontFace:BF,fontSize:10.5,color:WHT,valign:'top',margin:0});
  card(s,6.8,4.42,5.85,1.35,CREAM);
  s.addText('E の上積みも実績と同水準',{x:7.1,y:4.58,w:5.25,h:0.32,fontFace:BF,fontSize:12,bold:true,color:INK,margin:0});
  s.addText('追加300百万円は、FY2026に公募の遅延を私募で巻き返した金額と同水準。来期はこれを補完策ではなく主軸として計画に置きます。',
    {x:7.1,y:4.92,w:5.25,h:0.8,fontFace:BF,fontSize:10.5,color:INK,valign:'top',margin:0});
  card(s,0.65,5.95,11.99,0.85,CREAM);
  s.addText('プランD（経常＋120.4百万円）は過去実績の範囲内で届く水準。Dを本線とし、私募とオークションを回してE（＋210.4）を目指します。',
    {x:1.0,y:5.9,w:11.3,h:0.85,fontFace:BF,fontSize:11.5,bold:true,color:BERRY,valign:'middle',margin:0});
  foot(s,'「既存事業／2期平均」＝各期・各プランの既存事業売上が過去2期平均730.5百万円に占める比率。差額売上の粗利率は30%（FY2025 26.8%・FY2026 32.4%の水準）。');
  s.addNotes('プランDは過去2期の平均そのもので新規前提なし。プランEの300百万円もFY2026の私募実績と同水準。どちらも実績に裏付けがあることを強調する。');
}

/* 16 まとめ */
{
  const s=p.addSlide(); s.background={color:WHT};
  s.addShape(p.ShapeType.rect,{x:0,y:0,w:0.16,h:H,fill:{color:INK}});
  s.addText('まとめ',{x:0.9,y:0.75,w:8,h:0.7,fontFace:HF,fontSize:34,bold:true,color:INK,margin:0});
  const pts=[
    ['FY2026の未達は一過性と期ズレ','最大要因はSBI証券との公募ファンドの大幅遅延（粗利200百万円超）。飲食3店舗の撤退は2026年3月に完了済み。'],
    ['来期は私募とオークションを主軸に','外部要因で動く公募を計画の柱から外し、自社で時期を握れるチャネルへ転換します。'],
    ['ワイン仕入は落としません','割当を守り2〜3年先の成長を確保。在庫は時価1.37倍の換価可能資産です。'],
    ['プランDが本線、プランEを目指す','Dは売上863.0百万円・経常＋120.4百万円で過去2期平均そのもの。Eは＋210.4百万円。']
  ];
  pts.forEach((t,i)=>{
    const y=1.75+i*1.15;
    s.addShape(p.ShapeType.ellipse,{x:0.9,y:y+0.06,w:0.4,h:0.4,fill:{color:INK}});
    s.addText(String(i+1),{x:0.9,y:y+0.06,w:0.4,h:0.4,fontFace:BF,fontSize:14,bold:true,color:WHT,align:'center',valign:'middle',margin:0});
    s.addText(t[0],{x:1.55,y,w:7.4,h:0.4,fontFace:BF,fontSize:15.5,bold:true,color:INK,margin:0});
    s.addText(t[1],{x:1.55,y:y+0.42,w:7.4,h:0.5,fontFace:BF,fontSize:11,color:'6E6E6E',margin:0});
  });
  card(s,9.4,1.75,3.25,2.55,INK);
  s.addText('ご相談事項',{x:9.65,y:2.0,w:2.75,h:0.34,fontFace:BF,fontSize:12,bold:true,color:GOLD,margin:0});
  s.addText([
    {text:'短期借入162百万円の借換継続',options:{bullet:true,breakLine:true}},
    {text:'在庫見合いの運転資金枠',options:{bullet:true,breakLine:true}},
    {text:'財務制限条項の事前確認',options:{bullet:true,breakLine:true}},
    {text:'月次資金繰り表のご報告',options:{bullet:true}}
  ],{x:9.65,y:2.45,w:2.75,h:2.0,fontFace:BF,fontSize:11,color:WHT,paraSpaceAfter:9,margin:0});
  s.addText('株式会社WineBank',{x:0.9,y:6.55,w:6,h:0.34,fontFace:BF,fontSize:11,color:MUT,margin:0});
  s.addNotes('依頼事項を明確にして締める。短期の借換継続と在庫見合いの運転資金枠の2点が具体的な依頼。');
}

p.writeFile({fileName:'WineBank_FY2027_銀行提出.pptx'}).then(f=>console.log('written:',f));
