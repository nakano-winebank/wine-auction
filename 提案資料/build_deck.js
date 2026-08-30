const pptxgen = require("pptxgenjs");
const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.author = "WineBank";
pres.title  = "WineBank ビジネスポイント経済圏構想";

const BG="1A0E14", PANEL="2A1620", PANEL2="38202C", BURG="7B1E3A",
      GOLD="C9A227", GOLD_L="E8CE78", TEXT="F2EDE6", MUTE="A2908C",
      MINT="7FD1AE", AMBER="E0A458", RED="D96A6A", JP="Meiryo";
const W=13.3, H=7.5, M=0.62, CW=W-M*2;

const t  = (o) => Object.assign({ isTextBox:true, fontFace:JP, color:TEXT, margin:0 }, o);
const sh = () => ({ type:"outer", color:"000000", blur:10, offset:2, angle:90, opacity:0.35 });

function base(kicker, title, sub){
  const s = pres.addSlide(); s.background = { color: BG };
  if(kicker) s.addText(kicker, t({x:M,y:0.34,w:CW,h:0.26,fontFace:"Arial",fontSize:10.5,
    bold:true,color:GOLD,charSpacing:3}));
  s.addText(title, t({x:M,y:0.62,w:CW,h:0.62,fontSize:29,bold:true}));
  if(sub) s.addText(sub, t({x:M,y:1.28,w:CW,h:0.34,fontSize:13.5,color:MUTE}));
  s.addText("WineBank CONFIDENTIAL", t({x:M,y:H-0.46,w:5,h:0.24,fontFace:"Arial",
    fontSize:8.5,color:"6B5A5F"}));
  return s;
}
function card(s,x,y,w,h,fill){
  s.addShape(pres.ShapeType.roundRect,{x,y,w,h,rectRadius:0.06,
    fill:{color:fill||PANEL}, line:{color:fill||PANEL,width:0}, shadow:sh()});
}
function badge(s,x,y,n,col){
  const d=0.38;
  s.addShape(pres.ShapeType.ellipse,{x,y,w:d,h:d,fill:{color:col||GOLD},line:{color:col||GOLD,width:0}});
  s.addText(String(n), t({x,y,w:d,h:d,fontFace:"Arial",fontSize:14,bold:true,color:BG,
    align:"center",valign:"middle"}));
}
const tb  = () => ({fontFace:JP,fontSize:12,color:TEXT,valign:"middle",
  border:{type:"solid",color:"4A3038",pt:0.75},autoPage:false});
const hdr = (x) => ({text:x,options:{fill:{color:BURG},bold:true,color:TEXT,fontSize:11.5,align:"center"}});
const cel = (x,o) => ({text:x,options:Object.assign({fill:{color:PANEL},fontSize:11.5,align:"center"},o||{})});

/* 1 TITLE ------------------------------------------------------------- */{
  const s=pres.addSlide(); s.background={color:BG};
  s.addShape(pres.ShapeType.rect,{x:0,y:0,w:W,h:H,fill:{color:BURG,transparency:88},line:{width:0}});
  s.addText("WINEBANK GROWTH STRATEGY 2026", t({x:M,y:1.42,w:CW,h:0.3,fontFace:"Arial",
    fontSize:11,bold:true,color:GOLD,charSpacing:4}));
  s.addText("ビジネスポイント経済圏構想", t({x:M,y:1.9,w:CW,h:0.95,fontSize:44,bold:true}));
  s.addText("「ワイン貯金」", t({x:M,y:2.86,w:CW,h:0.8,fontSize:40,bold:true,color:GOLD_L}));
  s.addText("不確実な含み益を、確実なビジネスポイントに換える。価格リスクは、WineBankが取る。",
    t({x:M,y:3.86,w:CW,h:0.4,fontSize:16,color:MUTE}));
  [["確実な","5%","会員は不確実な値上がりを確定ポイントに換える"],
   ["実原価","1.5%","原価率30%。5万ptの当社負担は1.5万円"],
   ["1pt","0.5円","グランメゾンは権威性を値付けする"]].forEach((v,i)=>{
    const x=M+i*4.14; card(s,x,4.7,3.86,1.32,PANEL);
    s.addText([{text:v[0]+" ",options:{fontSize:15,color:MUTE}},
               {text:v[1],options:{fontSize:25,bold:true,color:GOLD}}],
      t({x:x+0.3,y:4.9,w:3.3,h:0.45}));
    s.addText(v[2], t({x:x+0.3,y:5.41,w:3.3,h:0.55,fontSize:10.5,color:MUTE,lineSpacing:15}));
  });
  s.addText("2026年8月｜株式会社WineBank｜社外秘", t({x:M,y:H-0.55,w:CW,h:0.3,
    fontFace:"Arial",fontSize:10,color:"6B5A5F"}));
  s.addNotes("核心はサブリース構造。含み益と引き換えに価格リスクを当社が取り、会員には確定ポイントを渡す。");
}

/* 2 PROBLEM ----------------------------------------------------------- */{
  const s=base("PROBLEM","なぜ、ワイン投資は売れないのか",
    "商品が悪いのではない。買ったあとに「何も起きない」ことが問題です。");
  [["買った後、何も起きない","1,000万円を払う。あとはマイページで時価を見るだけ。接点が年に数回しかなく、熱量が続かない。"],
   ["比較で負ける","「年率◯%」を語った瞬間、S&P500や債券と同じ土俵に立つ。金融商品の実績と規模では証券会社に勝てない。"],
   ["属人化する","リターンの説得はトップ営業の話術と人脈に依存する。再現性がなく、広告に載せられない。"]
  ].forEach((v,i)=>{
    const x=M+i*4.14; card(s,x,1.95,3.86,2.5); badge(s,x+0.32,2.24,i+1);
    s.addText(v[0], t({x:x+0.85,y:2.26,w:2.75,h:0.36,fontSize:15,bold:true,color:GOLD_L}));
    s.addText(v[1], t({x:x+0.32,y:2.86,w:3.24,h:1.4,fontSize:12,color:MUTE,lineSpacing:19}));
  });
  card(s,M,4.78,CW,1.72,PANEL2);
  s.addText("いまのワイン投資には「コンテンツ」しかない。",
    t({x:M+0.45,y:5.05,w:CW-0.9,h:0.5,fontSize:24,bold:true}));
  s.addText("パッケージ化され、完結し、コミュニケーションが存在しない。だから熱量が続かず、紹介も生まれない。",
    t({x:M+0.45,y:5.66,w:CW-0.9,h:0.5,fontSize:14,color:MUTE}));
}

/* 3 INSIGHT ----------------------------------------------------------- */{
  const s=base("INSIGHT","SNSが証明したこと",
    "SNSの本質は、本来別々だった二つの要素を一体化させたことにあります。");
  [["従来のプロコンテンツ","映画・本・ドラマ",["制作されたパッケージである","物語は必ず完結する","「面白かった」で日常に戻る"],"「終わり」がある",AMBER,PANEL],
   ["SNS","コンテンツ × コミュニケーション",["情報とつながりが一体化","タイムラインは完結しない","つながりを求めて再び開く"],"「終わり」がない",MINT,PANEL2]
  ].forEach((c,i)=>{
    const x=M+i*6.32; card(s,x,1.95,5.98,3.35,c[5]);
    s.addText(c[0], t({x:x+0.4,y:2.2,w:5.2,h:0.38,fontSize:18,bold:true,color:GOLD_L}));
    s.addText(c[1], t({x:x+0.4,y:2.62,w:5.2,h:0.3,fontSize:12,color:MUTE}));
    s.addText(c[2].map((b,j)=>({text:b,options:{bullet:true,breakLine:j<c[2].length-1}})),
      t({x:x+0.4,y:3.08,w:5.2,h:1.25,fontSize:12.5,paraSpaceAfter:7}));
    s.addText(c[3], t({x:x+0.4,y:4.5,w:5.2,h:0.5,fontSize:22,bold:true,color:c[4]}));
  });
  card(s,M,5.6,CW,1.02,PANEL2);
  s.addText([{text:"ワイン＝コンテンツ。",options:{color:GOLD_L,bold:true}},
             {text:"  ビジネスポイント＋会食＋BYO＋オークション＝コミュニケーション。",options:{color:TEXT}},
             {text:"  一体化して初めて「終わり」がなくなる。",options:{color:GOLD_L,bold:true}}],
    t({x:M+0.45,y:5.92,w:CW-0.9,h:0.42,fontSize:15.5}));
}

/* 4 COMPARISON -------------------------------------------------------- */{
  const s=base("COMPARISON","「終わり」があるか、ないか",
    "会員権の優劣は、利用日数ではなく「終わるかどうか」で決まります。");
  s.addTable([[hdr(""),hdr("NOT A HOTEL ／ 会員制リゾート"),hdr("WineBank Signature")],
    [cel("体験の構造",{fill:{color:PANEL2},bold:true,align:"left"}),cel("非日常。チェックアウトで完結する",{align:"left"}),cel("日常。次の会食が必ず来る",{align:"left",color:MINT})],
    [cel("接点の頻度",{fill:{color:PANEL2},bold:true,align:"left"}),cel("年10泊。使い切れば終わり",{align:"left"}),cel("週次。ポイントが貯まり続ける",{align:"left",color:MINT})],
    [cel("使わない年",{fill:{color:PANEL2},bold:true,align:"left"}),cel("権利が消化されず費用だけ残る",{align:"left"}),cel("資産が残り、育つ",{align:"left",color:MINT})],
    [cel("出口",{fill:{color:PANEL2},bold:true,align:"left"}),cel("共有持分。流動性は限定的",{align:"left"}),cel("現物。売る／飲む／贈るの3経路",{align:"left",color:MINT})]],
    Object.assign(tb(),{x:M,y:1.92,w:CW,colW:[2.3,4.88,4.88],rowH:[0.44,0.62,0.62,0.62,0.62]}));
  card(s,M,5.28,CW,1.28,PANEL2);
  s.addText("NOT A HOTELには「終わり」がある。WineBank Signatureには「終わり」がない。",
    t({x:M+0.45,y:5.52,w:CW-0.9,h:0.45,fontSize:20,bold:true,color:GOLD_L}));
  s.addText("比較表の1行として、これ以上に強い差別化はありません。",
    t({x:M+0.45,y:6.05,w:CW-0.9,h:0.32,fontSize:12.5,color:MUTE}));
}

/* 5 STRUCTURE — サブリース ★ ----------------------------------------- */{
  const s=base("STRUCTURE","構造：ワインのサブリース",
    "不動産のサブリースと同じ。所有者に確定収益を渡し、運営者が市況リスクを取る。");
  [["会員（法人）が得るもの","確実な 5%","不確実な値上がり（実績年6%）を手放す代わりに、毎年必ず入るビジネスポイントを受け取る。",MINT,PANEL2],
   ["WineBank が得るもの","含み益 ＋ 2.5%","価格リスクを引き受ける代わりに、ワインの値上がり分と管理手数料を得る。実原価は1.5%のみ。",GOLD,PANEL2]
  ].forEach((c,i)=>{
    const x=M+i*6.32; card(s,x,1.9,5.98,2.2,c[4]);
    s.addText(c[0], t({x:x+0.4,y:2.12,w:5.2,h:0.34,fontSize:14,bold:true,color:MUTE}));
    s.addText(c[1], t({x:x+0.4,y:2.5,w:5.2,h:0.58,fontSize:30,bold:true,color:c[3]}));
    s.addText(c[2], t({x:x+0.4,y:3.16,w:5.2,h:0.8,fontSize:12,color:MUTE,lineSpacing:19}));
  });
  card(s,M,4.32,CW,1.15,PANEL);
  s.addText("契約の形：セール・アンド・リースバック（動産賃貸借）",
    t({x:M+0.45,y:4.52,w:CW-0.9,h:0.36,fontSize:16,bold:true,color:GOLD_L}));
  s.addText("会員がワインを購入し所有権を持つ。そのワインをWineBankに賃貸し、賃料をビジネスポイントで受け取る。既存の「展示用高級ワイン節税商品」と同じ枠組みです。",
    t({x:M+0.45,y:4.94,w:CW-0.9,h:0.42,fontSize:12,color:MUTE}));
  card(s,M,5.68,CW,0.95,BURG);
  s.addText("この形なら「5%」は利回りではなく賃料率になる。出資法・金商法の議論から外れます。",
    t({x:M+0.45,y:5.92,w:CW-0.9,h:0.44,fontSize:15.5,bold:true,color:GOLD_L}));
  s.addNotes("サブリース＝賃貸借契約。預り金でも集団投資スキームでもない。ここが法務上の最大の利点。");
}

/* 6 SOLUTION ---------------------------------------------------------- */{
  const s=base("SOLUTION","設計：ワイン貯金の3ステップ",
    "所有権は会員に。管理手数料を払う代わりに、その倍のポイントを受け取る。");
  [["ワインを購入し、預ける","100万円","所有権は会員。定温セラーで保管・動産保険付帯。WineBankに賃貸する"],
   ["管理手数料を払う","▲25,000円","年率2.5%。保管料・保険料を含む"],
   ["ビジネスポイントを得る","50,000pt","年率5%相当。会食・贈答・追加購入・オークションに使える"]
  ].forEach((v,i)=>{
    const x=M+i*4.32; card(s,x,2.05,3.9,2.35); badge(s,x+0.32,2.32,i+1);
    s.addText(v[0], t({x:x+0.85,y:2.34,w:2.8,h:0.34,fontSize:13.5,bold:true}));
    s.addText(v[1], t({x:x+0.32,y:2.88,w:3.26,h:0.6,fontSize:30,bold:true,color:i===1?AMBER:GOLD}));
    s.addText(v[2], t({x:x+0.32,y:3.55,w:3.26,h:0.75,fontSize:11,color:MUTE,lineSpacing:17}));
    if(i<2) s.addText("▶", t({x:x+3.94,y:3.02,w:0.36,h:0.4,fontSize:17,color:GOLD,align:"center"}));
  });
  card(s,M,4.72,CW,1.8,PANEL2);
  s.addText("会員は2.5万円払って、5万円分を受け取る。差額の2.5万円を「貯金」していると考える。",
    t({x:M+0.45,y:4.98,w:CW-0.9,h:0.45,fontSize:19,bold:true,color:GOLD_L}));
  s.addText("この「貯金」の感覚が、日本人にとって最も強い購買トリガーです。しかもWineBank側は、この交換で損をしません（次頁）。",
    t({x:M+0.45,y:5.55,w:CW-0.9,h:0.75,fontSize:13,color:MUTE,lineSpacing:20}));
}

/* 7 UNIT ECONOMICS ★ -------------------------------------------------- */{
  const s=base("UNIT ECONOMICS","どの交換経路を通っても黒字",
    "ワイン100万円・会員1名・年間。飲食原価率30%で算定。");
  s.addTable([[hdr("ポイント交換先"),hdr("レート"),hdr("額面価値"),hdr("当社実原価"),hdr("手数料収入"),hdr("ネット")],
    [cel("系列店（テラス・oto 等）",{align:"left"}),cel("1円"),cel("50,000"),cel("15,000"),cel("25,000"),cel("+10,000",{bold:true,color:MINT})],
    [cel("アピシウス／T.マルクス",{align:"left",fill:{color:PANEL2}}),cel("0.5円",{fill:{color:PANEL2},bold:true,color:GOLD}),
     cel("25,000",{fill:{color:PANEL2}}),cel("7,500",{fill:{color:PANEL2}}),cel("25,000",{fill:{color:PANEL2}}),
     cel("+17,500",{bold:true,color:MINT,fill:{color:PANEL2}})],
    [cel("WineBank CLUB 年会費充当",{align:"left"}),cel("1円"),cel("50,000"),cel("ほぼ 0"),cel("25,000"),cel("+25,000",{bold:true,color:MINT})],
    [cel("オークション成約手数料",{align:"left"}),cel("1円"),cel("50,000"),cel("0"),cel("25,000"),cel("+25,000",{bold:true,color:MINT})],
    [cel("失効（期間限定ポイント）",{align:"left"}),cel("—"),cel("0"),cel("0"),cel("25,000"),cel("+25,000",{bold:true,color:MINT})]],
    Object.assign(tb(),{x:M,y:1.9,w:CW,colW:[3.5,1.1,1.5,2.1,1.6,2.26],rowH:[0.44,0.5,0.5,0.5,0.5,0.5]}));
  card(s,M,5.05,6.0,1.5,PANEL2);
  s.addText("最悪ケースでも +10,000円", t({x:M+0.4,y:5.3,w:5.2,h:0.42,fontSize:21,bold:true,color:MINT}));
  s.addText("負ける交換経路が一つもない。保管料・保険料は管理手数料の内数（実数は別途確定済み）。",
    t({x:M+0.4,y:5.82,w:5.2,h:0.5,fontSize:11.5,color:MUTE,lineSpacing:17}));
  card(s,M+6.32,5.05,5.76,1.5,PANEL);
  s.addText("これは「賃料」部分の収支にすぎない", t({x:M+6.7,y:5.3,w:5.0,h:0.36,fontSize:14,bold:true,color:GOLD_L}));
  s.addText("本当の収益は、当社が引き受ける価格リスクの対価＝含み益にあります（次頁）。",
    t({x:M+6.7,y:5.74,w:5.0,h:0.62,fontSize:11.5,color:MUTE,lineSpacing:17}));
}

/* 8 SPREAD ★ ---------------------------------------------------------- */{
  const s=base("SPREAD","サブリースの本当の収益",
    "1.5%の実コストで、年6%の期待値を買う取引です。");
  const rows=[["会員が受け取る","+5.0%","ポイント額面",MINT],
              ["会員が払う","▲2.5%","管理手数料",MUTE],
              ["会員の確定純益","+2.5%","含み益を手放す対価",MINT]];
  const rows2=[["当社の実コスト","▲1.5%","5万pt × 原価率30%",AMBER],
               ["管理手数料収入","+2.5%","保管・保険を含む",MINT],
               ["引き受ける含み益","+6.0%","P1実績・経費控除後",GOLD]];
  [["会員（法人）から見た取引",rows,PANEL],["WineBankから見た取引",rows2,PANEL2]].forEach((blk,i)=>{
    const x=M+i*6.32; card(s,x,1.9,5.98,2.92,blk[2]);
    s.addText(blk[0], t({x:x+0.4,y:2.12,w:5.2,h:0.34,fontSize:15,bold:true,color:GOLD_L}));
    blk[1].forEach((r,j)=>{
      const y=2.62+j*0.74;
      s.addText(r[0], t({x:x+0.4,y:y,w:2.3,h:0.3,fontSize:12,color:MUTE}));
      s.addText(r[1], t({x:x+2.6,y:y-0.08,w:1.3,h:0.42,fontSize:20,bold:true,color:r[3],align:"right"}));
      s.addText(r[2], t({x:x+4.05,y:y+0.02,w:1.55,h:0.5,fontSize:9.5,color:MUTE,lineSpacing:13}));
    });
  });
  card(s,M,5.2,CW,1.42,BURG);
  s.addText("期待値：当社 +7.0%／年（2.5% + 6.0% − 1.5%）。会員は確定 +2.5%。",
    t({x:M+0.45,y:5.42,w:CW-0.9,h:0.44,fontSize:19,bold:true,color:GOLD_L}));
  s.addText("損益分岐点はワイン価格が年▲7%を超えて下落した場合。Liv-ex 1000は過去20年で約4倍（年率約7%）、P1は指数下落局面でも年率6%を確保。ただしこれは、レバレッジのかかったワイン市況への賭けでもあります（次頁）。",
    t({x:M+0.45,y:5.9,w:CW-0.9,h:0.6,fontSize:12,color:TEXT,lineSpacing:18}));
  s.addNotes("この頁が事業の収益構造そのもの。ただし次頁のリスク管理とセットで説明すること。");
}

/* 9 RISK SIZING ★ CRITICAL -------------------------------------------- */{
  const s=base("RISK SIZING","買戻し設計：ここだけは慎重に",
    "サブリースは、規模に比例して膨らむショート・ボラティリティのポジションです。");
  s.addTable([[hdr("プログラム規模"),hdr("買戻し債務"),hdr("ワイン▲20%時の損失"),hdr("資本金4.37億円に対して")],
    [cel("100名（1億円）"),cel("1.0億円"),cel("▲2,000万円",{color:AMBER}),cel("吸収可能",{color:MINT})],
    [cel("500名（5億円）"),cel("5.0億円"),cel("▲1.0億円",{color:AMBER}),cel("資本の約1/4が毀損",{color:AMBER})],
    [cel("2,000名（20億円）",{fill:{color:PANEL2}}),cel("20.0億円",{fill:{color:PANEL2}}),
     cel("▲4.0億円",{color:RED,bold:true,fill:{color:PANEL2}}),cel("債務超過の水準",{color:RED,bold:true,fill:{color:PANEL2}})]],
    Object.assign(tb(),{x:M,y:1.88,w:CW,colW:[3.0,2.7,3.2,3.16],rowH:[0.42,0.46,0.46,0.46]}));
  card(s,M,4.0,CW,1.02,PANEL2);
  s.addText("⚠  買戻しを「契約上の保証」にすると、会計上は売上ではなく借入金になります。",
    t({x:M+0.45,y:4.2,w:CW-0.9,h:0.36,fontSize:16,bold:true,color:AMBER}));
  s.addText("リスクと経済価値が移転していないため、収益認識会計基準上、100万円を売上計上できない可能性がある。P/LもB/Sの物語も崩れ、SBIのDDで必ず論点になります。",
    t({x:M+0.45,y:4.6,w:CW-0.9,h:0.34,fontSize:11.5,color:MUTE}));
  s.addText("推奨する4つの歯止め", t({x:M,y:5.2,w:CW,h:0.3,fontSize:14,bold:true,color:GOLD}));
  [["「保証」でなく「価格表」","Liv-ex連動の買取価格表を毎月公表。契約上の保証にはしない"],
   ["買戻し価格に掛目を置く","取得価額の80%等。当社の損失を20%でキャップする"],
   ["買戻し総額に上限を設ける","プログラム全体の◯%まで。青天井の債務を作らない"],
   ["含み益の一部を引当に回す","毎期、買戻引当金として留保。好況時に備えを積む"]
  ].forEach((v,i)=>{
    const x=M+i*3.11; card(s,x,5.5,2.87,1.15,PANEL);
    s.addText(v[0], t({x:x+0.22,y:5.66,w:2.5,h:0.3,fontSize:11.5,bold:true,color:GOLD_L}));
    s.addText(v[1], t({x:x+0.22,y:6.02,w:2.5,h:0.5,fontSize:9.5,color:MUTE,lineSpacing:13}));
  });
  s.addNotes("かぼちゃの馬車・レオパレスのサブリース破綻と同じ失敗様式。規模が小さいうちに歯止めを設計しておく。");
}

/* 10 0.5円 ------------------------------------------------------------ */{
  const s=base("DESIGN","1ポイント＝0.5円という発明",
    "グランメゾンでレートを半分にすることは、制約ではなく「権威性の値付け」です。");
  [["原価の非対称性を吸収する","グランメゾンは食材原価だけでなく席の機会費用が高い。定価で埋まる席を1:1で割り引くとイールドが壊れる。0.5円なら当社利益が1.75倍になる。"],
   ["権威性がフックになる","マイルと同じ構造。ファーストクラスの交換レートが割高でも誰も文句を言わない。「憧れの席に交換できる」こと自体が商品。"],
   ["ランク差別化に使える","BLACK 0.7円／PLATINUM 0.6円／STANDARD 0.5円。年500円の手数料差は伝わらないが、「1.4倍使える」は伝わる。"],
   ["席のイールド管理になる","平日ランチ1円／平日ディナー0.7円／週末0.5円／12月は不可。ポイントが満席を食うのではなく、空席を埋めるようになる。"]
  ].forEach((v,i)=>{
    const x=M+(i%2)*6.32, y=1.95+Math.floor(i/2)*1.95;
    card(s,x,y,5.98,1.72); badge(s,x+0.32,y+0.26,i+1);
    s.addText(v[0], t({x:x+0.85,y:y+0.28,w:4.85,h:0.34,fontSize:15,bold:true,color:GOLD_L}));
    s.addText(v[1], t({x:x+0.32,y:y+0.76,w:5.34,h:0.85,fontSize:11.5,color:MUTE,lineSpacing:18}));
  });
  card(s,M,5.9,CW,0.72,PANEL2);
  s.addText("安く交換できたら、ブランドが安く見える。0.5円はブランドを守るための価格です。",
    t({x:M+0.45,y:6.08,w:CW-0.9,h:0.38,fontSize:15,bold:true,color:GOLD_L}));
}

/* 11 ビジネスポイント ★ ------------------------------------------------ */{
  const s=base("B2B DESIGN","「ビジネスポイント」として設計する",
    "個人向けのポイ活ではありません。法人に付与し、法人の接待・会食・贈答に使う取引条件です。");
  [["役員賞与認定を回避できる","個人に付与して個人が飲めば「実質的に役員個人の消費」と認定され、損金不算入＋個人課税の往復ビンタになる。法人付与・法人の接待利用なら正常な事業経費。"],
   ["接待交際費として処理できる","現金支出部分は接待交際費。ポイント充当部分は値引き。消費の都度、確実に経費化できる足の速い設計。"],
   ["議論の枠組みが変わる","消費者向けポイントプログラムではなく、法人間の取引条件。景表法・特商法の消費者保護の文脈から距離が取れる。"],
   ["6ヶ月ルールの検討余地","資金決済法は発行から6ヶ月以内に限り使用できる前払式支払手段を適用除外としている。四半期付与・6ヶ月有効なら届出・供託を回避できる可能性（要弁護士確認）。"]
  ].forEach((v,i)=>{
    const x=M+(i%2)*6.32, y=1.95+Math.floor(i/2)*1.95;
    card(s,x,y,5.98,1.72,i===3?PANEL2:PANEL); badge(s,x+0.32,y+0.26,i+1);
    s.addText(v[0], t({x:x+0.85,y:y+0.28,w:4.85,h:0.34,fontSize:15,bold:true,color:GOLD_L}));
    s.addText(v[1], t({x:x+0.32,y:y+0.76,w:5.34,h:0.85,fontSize:11.5,color:MUTE,lineSpacing:18}));
  });
  card(s,M,5.9,CW,0.72,BURG);
  s.addText("名称：WineBank Business Points ／ ブランド名としての「ワイン貯金」は維持する",
    t({x:M+0.45,y:6.08,w:CW-0.9,h:0.38,fontSize:15,bold:true,color:GOLD_L}));
  s.addNotes("法人付与にすることで役員賞与リスクを断ち切れる。これは前回の議論で最大の税務リスクだった論点。");
}

/* 12 楽天 ------------------------------------------------------------- */{
  const s=base("BENCHMARK","楽天に学ぶ：村を1つにしない",
    "楽天の凄さはポイントを作ったことではなく、楽天市場という1つの村に閉じ込めなかったことです。");
  s.addText("交換先が「CLUB年会費と系列飲食店」の2つだけなら、それはポイントではなくクーポンです。WineBankには、すでに村が7つあります。",
    t({x:M,y:1.78,w:CW,h:0.34,fontSize:12.5,color:MUTE}));
  s.addTable([[hdr("WineBank の村"),hdr("ポイントの使い道"),hdr("当社の実コスト"),hdr("判定")],
    [cel("系列レストラン（26→100店）",{align:"left"}),cel("会食・接待",{align:"left"}),cel("原価 30%"),cel("○")],
    [cel("WineBank CLUB",{align:"left"}),cel("年会費充当",{align:"left"}),cel("ほぼゼロ"),cel("◎",{color:MINT,bold:true})],
    [cel("ワイン追加購入・贈答",{align:"left"}),cel("購入代金",{align:"left"}),cel("原価 75〜85%"),cel("要上限",{color:AMBER})],
    [cel("マーケットプレイス／オークション",{align:"left",fill:{color:PANEL2}}),cel("入札・成約手数料",{align:"left",fill:{color:PANEL2}}),
     cel("ほぼゼロ",{fill:{color:PANEL2}}),cel("◎",{color:MINT,bold:true,fill:{color:PANEL2}})],
    [cel("WineGO",{align:"left"}),cel("配送料",{align:"left"}),cel("実費"),cel("要上限",{color:AMBER})],
    [cel("管理手数料",{align:"left"}),cel("翌年の手数料に充当",{align:"left"}),cel("ほぼゼロ"),cel("◎",{color:MINT,bold:true})],
    [cel("P1ファンド／ST",{align:"left"}),cel("出資への充当",{align:"left"}),cel("—"),cel("要法務確認",{color:AMBER})]],
    Object.assign(tb(),{x:M,y:2.28,w:CW,colW:[4.3,3.4,2.6,1.76],rowH:[0.42,0.44,0.44,0.44,0.44,0.44,0.44,0.44]}));
  card(s,M,5.92,CW,0.72,PANEL2);
  s.addText("方針：自社の7つの村すべてに開く。外部提携は会員数200名を超えてから検討する。",
    t({x:M+0.45,y:6.1,w:CW-0.9,h:0.4,fontSize:15,bold:true,color:GOLD_L}));
}

/* 13 ECOSYSTEM -------------------------------------------------------- */{
  const s=base("ECOSYSTEM","第3の原資は、オークションにある",
    "楽天のポイント原資は加盟店手数料。自腹を切っていません。");
  card(s,M,1.9,CW,0.86,PANEL2);
  s.addText([{text:"現状のポイント原資は「管理手数料＋含み益」だけ。",options:{color:TEXT}},
             {text:"  市況に依存しすぎている。",options:{color:AMBER,bold:true}}],
    t({x:M+0.45,y:2.14,w:CW-0.9,h:0.4,fontSize:14.5}));
  const nodes=["ワインを買う","限定ポイントが貯まる","会食・入札に使う","在庫が回転する","成約手数料が入る"];
  const nw=2.15, gap=0.32, total=nodes.length*nw+(nodes.length-1)*gap, x0=(W-total)/2;
  nodes.forEach((n,i)=>{
    const x=x0+i*(nw+gap); card(s,x,3.1,nw,1.28,i===4?BURG:PANEL);
    s.addText(n, t({x:x+0.14,y:3.32,w:nw-0.28,h:0.85,fontSize:13,bold:true,
      color:i===4?GOLD_L:TEXT,align:"center",valign:"middle"}));
    if(i<nodes.length-1) s.addText("▶", t({x:x+nw,y:3.6,w:gap,h:0.3,fontSize:13,color:GOLD,align:"center"}));
  });
  s.addShape(pres.ShapeType.leftArrow,{x:x0+0.5,y:4.68,w:total-1.0,h:0.42,fill:{color:GOLD},line:{width:0}});
  s.addText("その成約手数料が、次のポイント原資になる", t({x:x0+0.5,y:4.68,w:total-1.0,h:0.42,
    fontSize:12.5,bold:true,color:BG,align:"center",valign:"middle"}));
  card(s,M,5.4,CW,1.2,PANEL2);
  s.addText("「出口が課題」と「原資が市況に依存する」が、同じ一手で同時に解けます。",
    t({x:M+0.45,y:5.62,w:CW-0.9,h:0.42,fontSize:17,bold:true,color:GOLD_L}));
  s.addText("成約手数料をポイントで支払わせれば当社の実コストはゼロ。自社オークション基盤は既に開発中です。",
    t({x:M+0.45,y:6.1,w:CW-0.9,h:0.34,fontSize:12,color:MUTE}));
}

/* 14 期間限定 --------------------------------------------------------- */{
  const s=base("MECHANICS","期間限定ポイントは「来店装置」",
    "期限の本質は失効益ではありません。会員を店に向かわせる装置です。");
  [["通常ポイント","無期限・譲渡不可",["ワインの追加購入・贈答","翌年の管理手数料に充当"],"資産として積み上がる",PANEL,GOLD_L,MUTE],
   ["期間限定ポイント","四半期付与・6ヶ月有効",["系列店での会食・接待・BYO","オークション成約手数料"],"年次の5%還元はこちら",PANEL2,GOLD,MINT]
  ].forEach((c,i)=>{
    const x=M+i*6.32; card(s,x,1.95,5.98,2.55,c[4]);
    s.addText(c[0], t({x:x+0.4,y:2.2,w:5.2,h:0.38,fontSize:19,bold:true,color:c[5]}));
    s.addText(c[1], t({x:x+0.4,y:2.63,w:5.2,h:0.3,fontSize:12,color:MUTE}));
    s.addText(c[2].map((b,j)=>({text:b,options:{bullet:true,breakLine:j<c[2].length-1}})),
      t({x:x+0.4,y:3.05,w:5.2,h:0.8,fontSize:12.5,paraSpaceAfter:7}));
    s.addText(c[3], t({x:x+0.4,y:3.98,w:5.2,h:0.36,fontSize:13.5,bold:true,color:c[6]}));
  });
  card(s,M,4.78,CW,1.78,PANEL2);
  s.addText("無期限ポイントは、一度も卓に変わりません。",
    t({x:M+0.45,y:5.02,w:CW-0.9,h:0.42,fontSize:19,bold:true,color:GOLD_L}));
  s.addText("貸借対照表に積み上がるだけです。期限に追われた会員が店に行けば、同伴者が現金を落とす。失効前通知をWineGOの予約導線に直結させれば、そのまま送客オペレーションになります。",
    t({x:M+0.45,y:5.56,w:CW-0.9,h:0.8,fontSize:13,color:MUTE,lineSpacing:21}));
}

/* 15 会員制度 --------------------------------------------------------- */{
  const s=base("MEMBERSHIP","新・会員制度（差し替え案）",
    "手数料はフラットに。ランク差はポイント還元率とレートだけに寄せる。");
  s.addTable([[hdr(""),hdr("PRESTIGE  100万〜"),hdr("GOLD  400万〜"),hdr("SIGNATURE  1,000万〜")],
    [cel("管理手数料（年）",{align:"left",fill:{color:PANEL2},bold:true}),cel("2.5%"),cel("2.5%"),cel("2.5%")],
    [cel("ポイント還元率",{align:"left",fill:{color:PANEL2},bold:true}),cel("3%",{bold:true,color:GOLD}),cel("4%",{bold:true,color:GOLD}),cel("5%",{bold:true,color:GOLD})],
    [cel("実質",{align:"left",fill:{color:PANEL2},bold:true}),cel("+0.5%",{color:MINT}),cel("+1.5%",{color:MINT}),cel("+2.5%",{color:MINT,bold:true})],
    [cel("グランメゾン交換レート",{align:"left",fill:{color:PANEL2},bold:true}),cel("0.5円"),cel("0.6円"),cel("0.7円",{bold:true,color:GOLD})],
    [cel("WineBank CLUB",{align:"left",fill:{color:PANEL2},bold:true}),cel("ポイントで充当可"),cel("半額"),cel("無料付与")]],
    Object.assign(tb(),{x:M,y:1.92,w:CW,colW:[3.3,2.92,2.92,2.92],rowH:[0.46,0.5,0.5,0.5,0.5,0.5]}));
  [["廃止するもの","9行×5ランクの特典マトリクス。「乾杯ドリンク×2回」「BYOチケット3本」は営業が覚えられず、顧客が比較できない。",AMBER],
   ["やめる理由","手数料を2.75%→2.7%と刻んでも、100万円あたり年500円。体感はゼロ。刻むなら還元率を刻む。",AMBER]
  ].forEach((v,i)=>{
    const x=M+i*6.32; card(s,x,5.05,5.98,1.5,PANEL);
    s.addText(v[0], t({x:x+0.4,y:5.28,w:5.2,h:0.34,fontSize:14,bold:true,color:v[2]}));
    s.addText(v[1], t({x:x+0.4,y:5.7,w:5.2,h:0.72,fontSize:11.5,color:MUTE,lineSpacing:18}));
  });
}

/* 16 マイル方式 ------------------------------------------------------- */{
  const s=base("COMMUNICATION","「円」で表示しない",
    "レートを公表せず、必要ポイント数で見せる。マイルと同じ方式です。");
  const box=(x,label,txt,col,fill)=>{
    card(s,x,1.98,5.98,1.55,fill);
    s.addText(label, t({x:x+0.4,y:2.2,w:5.2,h:0.32,fontSize:12,bold:true,color:col}));
    s.addText(txt, t({x:x+0.4,y:2.62,w:5.2,h:0.7,fontSize:17,bold:true}));
  };
  box(M,"✕  レート表記","「アピシウスは 1pt＝0.5円」",AMBER,PANEL);
  box(M+6.32,"◯  必要ポイント表記","「アピシウス ディナー（1名）\n＝ 30,000pt」",MINT,PANEL2);
  [["レートの議論が消える","会員は「0.5円は損だ」ではなく「3万ptで行ける」と考える。マイルもディズニーもこの方式。"],
   ["有利誤認リスクが消える","「1pt＝1円」と大書して特定店だけ0.5円という運用は景表法上グレー。円換算を出さなければ争点にならない。"],
   ["法務・税務が軽くなる","前払式支払手段（資金決済法）も課税区分も、「円建ての金銭的価値が明示されているか」が効く。明確に安全側。"]
  ].forEach((v,i)=>{
    const x=M+i*4.14; card(s,x,3.78,3.86,2.05); badge(s,x+0.3,4.04,i+1);
    s.addText(v[0], t({x:x+0.8,y:4.06,w:2.8,h:0.34,fontSize:13.5,bold:true,color:GOLD_L}));
    s.addText(v[1], t({x:x+0.3,y:4.58,w:3.26,h:1.1,fontSize:11.5,color:MUTE,lineSpacing:18}));
  });
  card(s,M,6.05,CW,0.6,PANEL2);
  s.addText("会員には「5%還元」とだけ伝え、交換表は「◯◯ptで何ができるか」で見せる。同じ経済実態で、リスクだけが減ります。",
    t({x:M+0.45,y:6.19,w:CW-0.9,h:0.34,fontSize:13,bold:true,color:GOLD_L}));
}

/* 17 EXIT ------------------------------------------------------------- */{
  const s=base("EXIT","出口設計：4つの経路","元本保証は使わない。それでも下値は作れます。");
  [["P2P・オークション","会員が自身のボトルを売却。当社は成約手数料を収受。法的に最もクリーンで、経済圏の原資にもなる。",GOLD_L,PANEL],
   ["当社買取（価格表方式）","Liv-ex連動の買取価格表を毎月公表。掛目◯%。「保証」ではなく「可視性」を提供する。",GOLD_L,PANEL],
   ["ポイント転換（飲んで出る）","保有ワインを当社評価額でポイントに転換し消費できる。保証の一言も使わずに心理的な下値が生まれる。",MINT,PANEL2],
   ["贈答・承継","取引先への贈答、次世代への引き継ぎ。換金ではないため規制論点が生じない。",GOLD_L,PANEL]
  ].forEach((v,i)=>{
    const x=M+(i%2)*6.32, y=1.95+Math.floor(i/2)*1.72;
    card(s,x,y,5.98,1.5,v[3]); badge(s,x+0.32,y+0.24,i+1);
    s.addText(v[0], t({x:x+0.85,y:y+0.26,w:4.85,h:0.34,fontSize:15,bold:true,color:v[2]}));
    s.addText(v[1], t({x:x+0.32,y:y+0.72,w:5.34,h:0.68,fontSize:11.5,color:MUTE,lineSpacing:18}));
  });
  card(s,M,5.5,CW,1.1,PANEL2);
  s.addText("値下がりしても、飲めば取り戻せる。消費効用が下値になる資産は、ワインだけです。",
    t({x:M+0.45,y:5.72,w:CW-0.9,h:0.42,fontSize:17,bold:true,color:GOLD_L}));
  s.addText("実コストは額面の30%。NOT A HOTELは泊まっても資産は戻らない。金もアートも同じです。",
    t({x:M+0.45,y:6.19,w:CW-0.9,h:0.32,fontSize:12,color:MUTE}));
}

/* 18 RISK ------------------------------------------------------------- */{
  const s=base("RISK CONTROL","先に塞ぐ：4つのリスク",
    "攻める前に、法務・税務・会計を設計に織り込みます。");
  [["出資法・景表法","「年率5%」と言わない","「預ける＋年率＋貯金」の組合せは預り金と読まれる。サブリース（動産賃貸借）の建て付けにし、5%は『賃料率』として説明する。商標『ワイン貯金』は競合を止めるが、法規制は止めない。"],
   ["資金決済法","6ヶ月ルールか、届出か","自家型前払式支払手段は基準日の未使用残高1,000万円超で届出＋供託（残高の半額）。1人5万ptなら約200名で到達。四半期付与・6ヶ月有効なら適用除外の余地（要確認）。"],
   ["課税・役員賞与","法人付与・値引き構成にする","個人付与＋個人消費は役員賞与認定の往復ビンタ。法人に付与し、接待交際費の値引きとして構成する。ローンチ前に顧問税理士の一筆を。"],
   ["会計（最重要）","買戻し保証は売上を消す","契約上の買戻し保証があるとリスクと経済価値が移転せず、収益認識基準上、売上計上できない可能性。ポイントも履行義務として繰延が必要。SBIのDDで必ず出る。"]
  ].forEach((v,i)=>{
    const x=M+(i%2)*6.32, y=1.95+Math.floor(i/2)*2.32;
    card(s,x,y,5.98,2.1,i===3?PANEL2:PANEL); badge(s,x+0.32,y+0.26,i+1,i===3?AMBER:GOLD);
    s.addText(v[0], t({x:x+0.85,y:y+0.26,w:2.9,h:0.34,fontSize:14,bold:true}));
    s.addText(v[1], t({x:x+0.32,y:y+0.74,w:5.34,h:0.32,fontSize:13,bold:true,color:AMBER}));
    s.addText(v[2], t({x:x+0.32,y:y+1.12,w:5.34,h:0.88,fontSize:10.5,color:MUTE,lineSpacing:16}));
  });
  s.addNotes("弁護士確認は3点セット：①サブリース＝賃貸借の建て付けが金商法・出資法外にあること ②ポイントの前払式支払手段該当性と6ヶ月ルール ③買戻し条項の会計上の帰結。");
}

/* 19 ROADMAP ---------------------------------------------------------- */{
  const s=base("ROADMAP","ロードマップ","法務確認と買戻し設計を終えてから、ポイントを走らせます。");
  [["PHASE 0","〜2ヶ月","土台を固める",["店舗原価率30%の検証","弁護士意見書（3点）","買戻し条項と引当方針","会員・ポイント規約の整備"]],
   ["PHASE 1","3〜6ヶ月","100万プランで開始",["ポイント台帳をマイページに実装","四半期付与・失効通知の運用","店舗別レート表の運用開始"]],
   ["PHASE 2","6〜12ヶ月","経済圏に広げる",["Signature（1,000万）展開","オークション手数料との接続","曜日・時間帯の動的レート"]],
   ["PHASE 3","Year 2〜","ST公募へ",["会員数と在庫回転率を実績に","SBI証券へ再提案","100億円のCloud Cave構想"]]
  ].forEach((p,i)=>{
    const x=M+i*3.11, w=2.87;
    card(s,x,1.95,w,3.92,i===3?BURG:PANEL);
    s.addText(p[0], t({x:x+0.28,y:2.18,w:w-0.56,h:0.28,fontFace:"Arial",fontSize:10.5,
      bold:true,color:GOLD,charSpacing:2}));
    s.addText(p[1], t({x:x+0.28,y:2.5,w:w-0.56,h:0.4,fontSize:20,bold:true}));
    s.addText(p[2], t({x:x+0.28,y:2.98,w:w-0.56,h:0.34,fontSize:13.5,bold:true,color:GOLD_L}));
    s.addText(p[3].map((b,j)=>({text:b,options:{bullet:{indent:12},breakLine:j<p[3].length-1}})),
      t({x:x+0.28,y:3.42,w:w-0.56,h:2.35,fontSize:12,color:MUTE,valign:"top",
        paraSpaceAfter:15,lineSpacing:20}));
  });
  card(s,M,6.1,CW,0.55,PANEL2);
  s.addText("規模が小さいうちに歯止めを設計する。サブリースは、後から縮められません。",
    t({x:M+0.45,y:6.22,w:CW-0.9,h:0.32,fontSize:12.5,bold:true,color:GOLD_L}));
}

/* 20 NEXT ------------------------------------------------------------- */{
  const s=base("NEXT ACTION","次に決めるべきこと",
    "サブリースの歯止めが決まれば、レート表とランク設計は利益から逆算して確定できます。");
  s.addText("経営判断が必要な3点", t({x:M,y:1.85,w:5.98,h:0.34,fontSize:15,bold:true,color:GOLD}));
  [["買戻しの形","「保証」か「価格表オプション」か。売上計上の可否がここで決まる。最優先。"],
   ["還元率の構造","フラット5% か、ランク別 3/4/5% か。コストはどちらでも成立する。判断軸は「上位ランクに上がる理由を作りたいか」。"],
   ["社内精算レート","系列レストランへの補填率（例：額面の70%）。後から決めると必ず揉める。"]
  ].forEach((v,i)=>{
    const y=2.24+i*1.30; card(s,M,y,5.98,1.16,PANEL2); badge(s,M+0.3,y+0.2,i+1);
    s.addText(v[0], t({x:M+0.82,y:y+0.22,w:4.9,h:0.32,fontSize:14,bold:true,color:GOLD_L}));
    s.addText(v[1], t({x:M+0.3,y:y+0.62,w:5.38,h:0.46,fontSize:10.5,color:MUTE,lineSpacing:15}));
  });
  s.addText("弁護士に投げる3点セット", t({x:M+6.32,y:1.85,w:5.98,h:0.34,fontSize:15,bold:true,color:GOLD}));
  [["サブリースの建て付け","動産賃貸借として、出資法・金商法の枠外にあることの確認。5%＝賃料率という整理の妥当性。"],
   ["ポイントの法的性質","前払式支払手段への該当性。四半期付与・6ヶ月有効による適用除外の可否。"],
   ["買戻し条項の帰結","買戻しの形ごとの収益認識・リース会計・出資法上の評価。会計士と合同で。"]
  ].forEach((v,i)=>{
    const y=2.24+i*1.30; card(s,M+6.32,y,5.98,1.16,PANEL); badge(s,M+6.62,y+0.2,i+1);
    s.addText(v[0], t({x:M+7.14,y:y+0.22,w:4.9,h:0.32,fontSize:14,bold:true,color:GOLD_L}));
    s.addText(v[1], t({x:M+6.62,y:y+0.62,w:5.38,h:0.46,fontSize:10.5,color:MUTE,lineSpacing:15}));
  });
  card(s,M,6.22,CW,0.6,BURG);
  s.addText("資産と体験を、ひとつの通貨でつなぐ。ワインは、終わらない資産になる。",
    t({x:M+0.45,y:6.35,w:CW-0.9,h:0.36,fontSize:15,bold:true,color:GOLD_L,align:"center"}));
}

pres.writeFile({ fileName:"/home/user/wine-auction/提案資料/WineBank_ビジネスポイント経済圏構想.pptx" })
  .then(f=>console.log("WROTE",f));
