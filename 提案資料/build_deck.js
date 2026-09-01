const pptxgen = require("pptxgenjs");
const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.author = "WineBank";
pres.title  = "ワインマイル経済圏構想";

const BG="1A0E14", PANEL="2A1620", PANEL2="38202C", BURG="7B1E3A",
      GOLD="C9A227", GOLD_L="E8CE78", TEXT="F2EDE6", MUTE="A2908C",
      MINT="7FD1AE", AMBER="E0A458", RED="D96A6A", JP="Meiryo";
const W=13.3, H=7.5, M=0.62, CW=W-M*2;

const t  = (o) => Object.assign({ isTextBox:true, fontFace:JP, color:TEXT, margin:0 }, o);
const sh = () => ({ type:"outer", color:"000000", blur:10, offset:2, angle:90, opacity:0.35 });
function base(k,ti,sub){
  const s=pres.addSlide(); s.background={color:BG};
  if(k) s.addText(k, t({x:M,y:0.34,w:CW,h:0.26,fontFace:"Arial",fontSize:10.5,bold:true,color:GOLD,charSpacing:3}));
  s.addText(ti, t({x:M,y:0.62,w:CW,h:0.6,fontSize:29,bold:true}));
  if(sub) s.addText(sub, t({x:M,y:1.26,w:CW,h:0.34,fontSize:13,color:MUTE}));
  s.addText("WineBank CONFIDENTIAL", t({x:M,y:H-0.46,w:5,h:0.24,fontFace:"Arial",fontSize:8.5,color:"6B5A5F"}));
  return s;
}
function card(s,x,y,w,h,f){ s.addShape(pres.ShapeType.roundRect,{x,y,w,h,rectRadius:0.06,
  fill:{color:f||PANEL},line:{color:f||PANEL,width:0},shadow:sh()}); }
function badge(s,x,y,n,c){ const d=0.36;
  s.addShape(pres.ShapeType.ellipse,{x,y,w:d,h:d,fill:{color:c||GOLD},line:{color:c||GOLD,width:0}});
  s.addText(String(n), t({x,y,w:d,h:d,fontFace:"Arial",fontSize:13,bold:true,color:BG,align:"center",valign:"middle"})); }
const tb=()=>({fontFace:JP,fontSize:11.5,color:TEXT,valign:"middle",
  border:{type:"solid",color:"4A3038",pt:0.75},autoPage:false});
const hdr=x=>({text:x,options:{fill:{color:BURG},bold:true,color:TEXT,fontSize:11,align:"center"}});
const cel=(x,o)=>({text:x,options:Object.assign({fill:{color:PANEL},fontSize:11,align:"center"},o||{})});
const lft=(x,o)=>cel(x,Object.assign({align:"left"},o||{}));

/* 1 TITLE */{
  const s=pres.addSlide(); s.background={color:BG};
  s.addShape(pres.ShapeType.rect,{x:0,y:0,w:W,h:H,fill:{color:BURG,transparency:88},line:{width:0}});
  s.addText("WINEBANK GROWTH STRATEGY 2026", t({x:M,y:1.3,w:CW,h:0.3,fontFace:"Arial",fontSize:11,bold:true,color:GOLD,charSpacing:4}));
  s.addText("ワインで、ライフスタイルを豊かにする。", t({x:M,y:1.78,w:CW,h:0.85,fontSize:40,bold:true}));
  s.addText("ワインマイル経済圏構想 ／「ワイン貯金」", t({x:M,y:2.72,w:CW,h:0.7,fontSize:31,bold:true,color:GOLD_L}));
  s.addText("持つ・貯める・開ける・贈る・譲る。ワインにまつわるすべてを、ひとつの通貨でつなぐ。",
    t({x:M,y:3.66,w:CW,h:0.4,fontSize:15.5,color:MUTE}));
  [["貯まる","ワインマイル","持っていても、動かしても貯まる"],
   ["使える","WineBank経済圏","会食・贈答・イベント・オークション・ワイナート"],
   ["育つ","値上がりの75%","キャピタルゲインは会員のもの"]].forEach((v,i)=>{
    const x=M+i*4.14; card(s,x,4.6,3.86,1.4,PANEL);
    s.addText(v[0], t({x:x+0.3,y:4.78,w:3.3,h:0.26,fontSize:11,color:MUTE}));
    s.addText(v[1], t({x:x+0.3,y:5.06,w:3.3,h:0.4,fontSize:20,bold:true,color:GOLD}));
    s.addText(v[2], t({x:x+0.3,y:5.5,w:3.3,h:0.42,fontSize:10,color:MUTE,lineSpacing:14}));
  });
  s.addText("2026年8月｜株式会社WineBank｜社外秘", t({x:M,y:H-0.55,w:CW,h:0.3,fontFace:"Arial",fontSize:10,color:"6B5A5F"}));
  s.addNotes("新ビジョン「ワインでライフスタイルを豊かにする」を掲げ、その手段としてワインマイル経済圏を置く。");
}

/* 2 PROBLEM — 3段階 */{
  const s=base("PROBLEM","ワイン投資は、まだ「買うだけ」で終わっている",
    "商品が悪いのではありません。買ったあとに起きることが、設計されてこなかっただけです。");
  [["ワイン投資 1.0","これまで","買うだけ",["買って、預けて、終わり","接点は年に数回の時価確認","コンテンツもコミュニケーションもない"],AMBER,PANEL],
   ["ワイン投資 2.1","リニューアル後","コンテンツを載せた",["ファンド実績・指数・銘柄情報","マイページで時価が見える","情報は届く。ただ、それだけ"],MUTE,PANEL],
   ["ワイン投資 3.0","本提案","コミュニケーションを足す",["ワインマイルが貯まり、使われる","会食・贈答・オークションが動く","他の会員の一本が見える"],MINT,PANEL2]
  ].forEach((v,i)=>{
    const x=M+i*4.14; card(s,x,1.82,3.86,3.5,v[5]);
    s.addText(v[1], t({x:x+0.32,y:2.02,w:3.24,h:0.24,fontFace:"Arial",fontSize:9.5,bold:true,color:GOLD,charSpacing:2}));
    s.addText(v[0], t({x:x+0.32,y:2.3,w:3.24,h:0.36,fontSize:17,bold:true,color:v[4]===MUTE?TEXT:v[4]}));
    s.addText(v[2], t({x:x+0.32,y:2.74,w:3.24,h:0.34,fontSize:14,bold:true,color:GOLD_L}));
    s.addText(v[3].map((b,j)=>({text:b,options:{bullet:{indent:12},breakLine:j<v[3].length-1}})),
      t({x:x+0.32,y:3.24,w:3.24,h:1.9,fontSize:11.5,color:MUTE,valign:"top",paraSpaceAfter:11,lineSpacing:17}));
  });
  card(s,M,5.56,CW,1.06,BURG);
  s.addText("足りないのは商品ではなく、買ったあとに起きる「出来事」でした。",
    t({x:M+0.45,y:5.78,w:CW-0.9,h:0.42,fontSize:19,bold:true,color:GOLD_L}));
  s.addText("2.1は情報を届けるところまで。3.0は、会員が動き、他の会員とつながるところまでを設計します。",
    t({x:M+0.45,y:6.22,w:CW-0.9,h:0.32,fontSize:12,color:TEXT}));
}

/* 2b WHY ★ ------------------------------------------------------------ */{
  const s=base("WHY","「WineBankは、損をしていませんか？」",
    "いちばん多くいただく質問です。正直にお答えします。");
  s.addText("いいえ。先に、出しているだけです。",
    t({x:M,y:1.66,w:CW,h:0.62,fontSize:31,bold:true,color:GOLD_L}));
  [["ワイン投資だけでは、広がらなかった",
    "持っているだけでは、ワインは資産のまま。飲む相手も、語る相手もいない。豊かにするには、コミュニティが要る。そこに気づきました。"],
   ["だから去年、WineBank CLUBをつくった",
    "そこで会員の皆さまから聞いた声が、すべての出発点でした。「もっと、ワインを通じて人と繋がりたい」。この一言です。"],
   ["だから、先に渡すことにした",
    "価値は、体験しないと分かりません。だから一定数ご購入いただいた方に、まずマイルをお渡しします。使って、集まって、また誰かを連れてきてもらう。"],
   ["原資は、ワインの未来です",
    "ワインは値上がりする。私たちはそう信じています。その未来を先読みして、私たちもお客様と一緒にリスクを取り、先にお渡しする。"]
  ].forEach((v,i)=>{
    const x=M+i*3.07;
    card(s,x,2.5,2.85,2.62,i===3?PANEL2:PANEL);
    badge(s,x+0.28,2.74,i+1);
    s.addText(v[0], t({x:x+0.28,y:3.2,w:2.29,h:0.6,fontSize:13.5,bold:true,color:GOLD_L,lineSpacing:19}));
    s.addText(v[1], t({x:x+0.28,y:3.88,w:2.29,h:1.16,fontSize:10.5,color:MUTE,lineSpacing:16}));
  });
  card(s,M,5.34,CW,1.28,BURG);
  s.addText("損をしているのではありません。先に出して、一緒に賭けているだけです。",
    t({x:M+0.45,y:5.56,w:CW-0.9,h:0.44,fontSize:21,bold:true,color:GOLD_L}));
  s.addText("だから管理費の一部と、将来の利益の一部を——お客様の取り分を優先したうえで——分けていただく。増えたら、分け合う。それだけのことです。",
    t({x:M+0.45,y:6.06,w:CW-0.9,h:0.42,fontSize:13,color:TEXT}));
  s.addNotes("この頁は説得ではなく告白として読ませる。WineBankが先にリスクを取っていることが伝われば、以降の数字はすべて素直に入る。");
}

/* 2c BUSINESS CASE ★ -------------------------------------------------- */{
  const s=base("BUSINESS CASE","数字で見ると：同じキャッシュで、ワインは2.5倍",
    "WineBank単体ベース。ワイン1億円／値上がり6%・金利3%・保管料1.5%・粗利30%・管理手数料2.5%");
  s.addText("販売ミックス：100万×52名 ＋ 400万×7名 ＋ 1,000万×2名 ＝ 1億円　／　マイル発行 368万円（原価率44.5%＝想定交換ミックス）　※単位：万円",
    t({x:M,y:1.64,w:CW,h:0.28,fontSize:10.5,color:GOLD}));
  s.addTable([[hdr(""),hdr("① 1億を保有し続ける"),hdr("② 1億を販売＋1.2億を新規買付"),hdr("差")],
    [lft("PL（営業損益）",{fill:{color:PANEL2},bold:true}),cel("▲450",{color:RED}),
     cel("+2,351",{color:MINT,bold:true}),cel("+2,801",{color:MINT,bold:true})],
    [lft("新規買付前のCF",{fill:{color:PANEL2},bold:true}),cel("▲450",{color:RED}),
     cel("+9,351",{color:MINT,bold:true}),cel("+9,801",{color:MINT,bold:true})],
    [lft("純CF",{fill:{color:PANEL2},bold:true}),cel("▲450"),cel("▲649"),
     cel("▲199",{color:AMBER,bold:true})],
    [lft("ワイン在庫（簿価）",{fill:{color:PANEL2},bold:true}),cel("10,000"),cel("15,000"),cel("+5,000",{color:MINT})],
    [lft("預かり資産（会員所有）",{fill:{color:PANEL2},bold:true}),cel("0"),
     cel("10,000",{color:GOLD,bold:true}),cel("+10,000",{color:MINT,bold:true})],
    [lft("支配下のワイン総額",{fill:{color:BURG},bold:true}),cel("10,000",{fill:{color:BURG}}),
     cel("25,000",{fill:{color:BURG},bold:true,color:GOLD_L}),
     cel("2.50倍",{fill:{color:BURG},bold:true,color:GOLD_L})]],
    Object.assign(tb(),{x:M,y:1.98,w:CW,colW:[3.3,2.7,3.5,2.56],
      rowH:[0.42,0.42,0.42,0.42,0.42,0.42,0.46]}));
  card(s,M,5.14,5.9,1.48,BURG);
  s.addText("純CFはほぼ同じ。なのに、ワインは2.5倍。",
    t({x:M+0.4,y:5.3,w:5.1,h:0.32,fontSize:15,bold:true,color:GOLD_L}));
  s.addText("▲450万と▲649万。差は199万円です。同じだけ現金を使って、セラーのワインは1億から2億5,000万へ。しかもうち1億は、会員のお金で買われたワインです。",
    t({x:M+0.4,y:5.66,w:5.1,h:0.86,fontSize:10.5,color:TEXT,lineSpacing:15}));
  card(s,M+6.16,5.14,5.9,1.48,PANEL);
  s.addText("同じ1億が、コストから収益に変わる。",
    t({x:M+6.56,y:5.3,w:5.1,h:0.32,fontSize:15,bold:true,color:GOLD_L}));
  s.addText("自社で持つと 年▲450万（金利300＋保管150）。会員に持たせて預かると 年+86万（手数料250−マイル164）。同じワインで、年536万ひっくり返ります。加えて成功報酬が5年後846万。",
    t({x:M+6.56,y:5.66,w:5.1,h:0.86,fontSize:10.5,color:MUTE,lineSpacing:15}));
  s.addNotes("すべて単体ベース。連結（マイル原価17.5%）ならPLは+2,451万、継続は+186万/年。保管料1.5%と粗利30%が最大の変数。");
}

/* 2d ACCUMULATION ★ --------------------------------------------------- */{
  const s=base("ACCUMULATION","「手出しは、増え続けないか」",
    "単発の試算で黒字でも、マイルの支払いが年々膨らんで食い潰すのではないか——ご指摘への回答です。");
  s.addText("毎年1億円ずつ販売を続けた場合。単体ベース、マイル原価率44.5%。　※単位：万円",
    t({x:M,y:1.64,w:CW,h:0.28,fontSize:10.5,color:GOLD}));
  s.addTable([[hdr("年"),hdr("預かり資産"),hdr("粗利"),hdr("管理手数料"),hdr("マイル費用"),hdr("年間計"),hdr("累計マイル"),hdr("累計利益")],
    [lft("1年",{fill:{color:PANEL2},bold:true}),cel("10,000"),cel("3,000"),cel("250"),cel("▲164",{color:AMBER}),
     cel("+3,086",{color:MINT,bold:true}),cel("164"),cel("3,086",{color:GOLD})],
    [lft("3年",{fill:{color:PANEL2},bold:true}),cel("30,000"),cel("3,000"),cel("750"),cel("▲491",{color:AMBER}),
     cel("+3,259",{color:MINT,bold:true}),cel("983"),cel("9,517",{color:GOLD})],
    [lft("5年",{fill:{color:PANEL2},bold:true}),cel("50,000"),cel("3,000"),cel("1,250"),cel("▲819",{color:AMBER}),
     cel("+3,431",{color:MINT,bold:true}),cel("2,456"),cel("16,294",{color:GOLD})],
    [lft("10年",{fill:{color:BURG},bold:true}),cel("100,000",{fill:{color:BURG}}),cel("3,000",{fill:{color:BURG}}),
     cel("2,500",{fill:{color:BURG}}),cel("▲1,638",{fill:{color:BURG},color:AMBER}),
     cel("+3,862",{fill:{color:BURG},color:MINT,bold:true}),cel("9,007",{fill:{color:BURG}}),
     cel("34,743",{fill:{color:BURG},color:GOLD_L,bold:true})]],
    Object.assign(tb(),{x:M,y:1.98,w:CW,colW:[1.1,1.9,1.4,1.8,1.8,1.6,1.5,0.96],
      rowH:[0.48,0.44,0.44,0.44,0.48]}));
  card(s,M,4.5,5.9,1.24,BURG);
  s.addText("マイルも手数料も、同じ預かり資産に比例します。",
    t({x:M+0.4,y:4.64,w:5.1,h:0.32,fontSize:15,bold:true,color:GOLD_L}));
  s.addText("マイル費用は預かり資産の1.64%、管理手数料は2.5%。どちらも定率なので、規模がどれだけ大きくなっても比は変わりません。手出しが収入を追い越す構造になっていない、というのが答えです。",
    t({x:M+0.4,y:4.98,w:5.1,h:0.7,fontSize:10.5,color:TEXT,lineSpacing:15}));
  card(s,M+6.16,4.5,5.9,1.24,PANEL);
  s.addText("販売を止めても、ストックだけで回ります。",
    t({x:M+6.56,y:4.64,w:5.1,h:0.32,fontSize:15,bold:true,color:GOLD_L}));
  s.addText("新規販売がゼロでも、預かり資産1億あたり年+86万。5億で+431万、10億で+862万。赤字になるのはマイル原価率が67.9%を超えたときだけです。",
    t({x:M+6.56,y:4.98,w:5.1,h:0.7,fontSize:10.5,color:MUTE,lineSpacing:15}));
  card(s,M,5.9,CW,0.72,PANEL2);
  s.addText("10年で累計マイル支払 9,007万に対し、累計利益 3億4,743万。マイルが利益を食い潰す局面は訪れません。",
    t({x:M+0.45,y:6.08,w:CW-0.9,h:0.4,fontSize:14,bold:true,color:GOLD_L}));
  s.addNotes("中谷氏のご指摘への回答スライド。要点は「両方ともAUMに比例するので比率が固定される」という構造の話。");
}

/* 3 INSIGHT */{
  const s=base("INSIGHT","ワイン＝コンテンツ。ワインマイル＝コミュニケーション。",
    "SNSの本質は、本来別々だった二つを一体化させたこと。ワインでも同じことが起きます。");
  card(s,M,1.78,3.3,3.3,PANEL2);
  s.addText("ワイン", t({x:M+0.32,y:2.0,w:2.66,h:0.44,fontSize:24,bold:true,color:GOLD_L}));
  s.addText("＝ コンテンツ", t({x:M+0.32,y:2.48,w:2.66,h:0.3,fontSize:13,color:MUTE}));
  s.addText("現物資産。時価が動き、飲み頃が来て、いつか開けられる。ここまでは2.1で作れました。",
    t({x:M+0.32,y:2.92,w:2.66,h:1.1,fontSize:11.5,color:MUTE,lineSpacing:18}));
  s.addText("＋", t({x:M+3.4,y:3.1,w:0.4,h:0.4,fontSize:22,bold:true,color:GOLD,align:"center"}));
  card(s,M+3.9,1.78,8.16,3.3,PANEL);
  s.addText("ワインマイル", t({x:M+4.22,y:2.0,w:7.5,h:0.44,fontSize:24,bold:true,color:GOLD}));
  s.addText("＝ コミュニケーション　　交換先はすべて「人と会う」「人に贈る」に繋がる",
    t({x:M+4.22,y:2.48,w:7.5,h:0.3,fontSize:13,color:MUTE}));
  const dest=["WineBank会員イベント","WineBank CLUB","系列店での会食","ワインの贈答",
              "マーケットプレイス／オークション","BYO（持ち込み）","配送","ワイナート年間購読"];
  dest.forEach((d,i)=>{
    const x=M+4.22+(i%4)*1.9, y=2.94+Math.floor(i/4)*0.56;
    card(s,x,y,1.76,0.44,PANEL2);
    s.addText(d, t({x:x+0.06,y:y,w:1.64,h:0.44,fontSize:9.5,color:TEXT,align:"center",valign:"middle"}));
  });
  s.addText("※今後、WineBankが提供するサービス（ワイナリー・オーベルジュ等）へ順次拡大",
    t({x:M+4.22,y:4.16,w:7.5,h:0.3,fontSize:10.5,color:MUTE}));
  card(s,M,5.3,CW,1.3,BURG);
  s.addText("ワインは、一人では飲みません。だからマイルは、必ず誰かと過ごす時間に変わります。",
    t({x:M+0.45,y:5.52,w:CW-0.9,h:0.42,fontSize:19,bold:true,color:GOLD_L}));
  s.addText("現金の還元は口座で終わります。マイルの還元は、食卓か、贈り先か、次の一本に必ず着地します。",
    t({x:M+0.45,y:6.02,w:CW-0.9,h:0.4,fontSize:12.5,color:TEXT}));
}

/* 4 NEVER ENDS */{
  const s=base("WHY IT NEVER ENDS","「マイルも使い切ったら終わり」——終わるのは残高だけです",
    "終わらないのは、マイルが"+"貯まる理由"+"のほうです。イベント案内やメルマガのことではありません。");
  [["行動に対して、毎回貯まる","落札した。出品した。会食した。贈った。イベントに出た。そのたびに限定マイルが入ります。残高は減っても、翌週にはまた増えている。保有への年次付与だけなら終わりますが、行動への都度付与は終わりません。"],
   ["他の会員の一本が、見える","誰がどのヴィンテージを開けたか。何がいくらで落札されたか。相場がどう動いたか。ニコニコ動画が発明したのは「一人で見ているのに、一人じゃない」体験でした。日本の文化は、共有して初めて完成します。"],
   ["自分のセラーが、動いている","時価が動く。マイルが貯まる。飲み頃が近づく。落札通知が来る。毎日ひらく理由があること自体が、他のどんな会員権にもない性質です。"]
  ].forEach((v,i)=>{
    const x=M+i*4.14; card(s,x,1.85,3.86,2.85,i===1?PANEL2:PANEL);
    badge(s,x+0.3,2.08,i+1);
    s.addText(v[0], t({x:x+0.78,y:2.1,w:2.82,h:0.34,fontSize:14,bold:true,color:GOLD_L}));
    s.addText(v[1], t({x:x+0.3,y:2.66,w:3.28,h:1.85,fontSize:11.5,color:MUTE,lineSpacing:19}));
  });
  card(s,M,4.98,CW,1.62,BURG);
  s.addText("ロイヤリティの高さは、機能ではなく「つながりの濃さ」で決まります。",
    t({x:M+0.45,y:5.2,w:CW-0.9,h:0.42,fontSize:19,bold:true,color:GOLD_L}));
  s.addText("ワインは、日本人にとって最もエモい商材のひとつです。誰と、いつ、何を開けたかを人は覚えている。そこにマイルという共通言語を通せば、会員は「取引先」ではなく「同じ村の住人」になります。",
    t({x:M+0.45,y:5.72,w:CW-0.9,h:0.7,fontSize:12.5,color:TEXT,lineSpacing:19}));
  s.addNotes("メルマガ・イベント案内のような一方通行の接点ではなく、行動への都度付与とUGC（他人が見える）が「終わらない」の正体。");
}

/* 4b COMMUNITY ★ ------------------------------------------------------ */{
  const s=base("COMMUNITY","コミュニティは、通貨だけでは育たない",
    "8/31 MTGでの決定事項。マイルに「集まる理由」と「貯める楽しさ」を足します。");
  [["交流イベントを標準装備","オークション開催に合わせて交流会を開く。クレジットカードの特典と同じ発想です。ワイン関連企業を巻き込めば低コストで回り、会員同士の横のつながりが継続率を押し上げます。"],
   ["ワインスクールにも使える","買う・飲むだけでなく、学ぶにも使える。使い道が増えるほど経済圏に留まる理由が増え、入会のハードルは下がります。"],
   ["貯めるプロセス自体を楽しませる","使うたびに貯まり、ランクが上がる。「上位にいることが賢い選択だ」と会員自身が感じる設計にします。修行のように貯める行為そのものが体験になります。"],
   ["期限が、次の行動を呼ぶ","限定マイルは3〜6ヶ月。消費とオークション参加を継続的に促します。残高が減っても、行動すればまた増える。"]
  ].forEach((v,i)=>{
    const x=M+(i%2)*6.16, y=1.82+Math.floor(i/2)*1.84;
    card(s,x,y,5.9,1.62,i===2?PANEL2:PANEL);
    badge(s,x+0.32,y+0.24,i+1);
    s.addText(v[0], t({x:x+0.8,y:y+0.26,w:4.8,h:0.32,fontSize:14.5,bold:true,color:GOLD_L}));
    s.addText(v[1], t({x:x+0.32,y:y+0.72,w:5.26,h:0.8,fontSize:11,color:MUTE,lineSpacing:16}));
  });
  card(s,M,5.56,CW,1.06,BURG);
  s.addText("投資の話をやめて、ワインのある暮らしの話をする。",
    t({x:M+0.45,y:5.76,w:CW-0.9,h:0.4,fontSize:19,bold:true,color:GOLD_L}));
  s.addText("「夢のある見せ方」が、入会のハードルを下げ、長期の関係をつくります。マイルはその共通言語にすぎません。",
    t({x:M+0.45,y:6.2,w:CW-0.9,h:0.34,fontSize:12.5,color:TEXT}));
  s.addNotes("8/31 MTG決定事項：①コミュニティ通貨モデルの採用 ②3〜6ヶ月の有効期限 ③会員向け交流イベントの追加。");
}

/* 5 STRUCTURE — 2契約 */{
  const s=base("STRUCTURE","契約は2本立て：マスターリース ＋ アセットマネジメント",
    "純粋なサブリースなら値上がり分は全額こちらのもの。ただしそれには買戻し義務が必要で、売上が立たなくなります。");
  [["① マスターリース（動産賃貸借）","賃料：ワインマイル 年5%",
    ["会員が所有するワインをWineBankが賃借する","賃料は現金ではなくワインマイルで支払う","「5%」は利回りではなく賃料率"],GOLD_L],
   ["② アセットマネジメント（役務提供）","成功報酬：値上がり分の25%",
    ["保管・真正性管理・市場形成の対価","契約終了時に評価額の差分で精算","仲介手数料はWineBank経由で売れた場合のみ"],GOLD]
  ].forEach((c,i)=>{
    const x=M+i*6.16; card(s,x,1.78,5.9,2.72,i===1?PANEL2:PANEL);
    s.addText(c[0], t({x:x+0.4,y:1.98,w:5.1,h:0.34,fontSize:15,bold:true,color:c[3]}));
    s.addText(c[1], t({x:x+0.4,y:2.4,w:5.1,h:0.4,fontSize:20,bold:true,color:TEXT}));
    s.addText(c[2].map((b,j)=>({text:b,options:{bullet:{indent:12},breakLine:j<c[2].length-1}})),
      t({x:x+0.4,y:2.94,w:5.1,h:1.4,fontSize:11.5,color:MUTE,valign:"top",paraSpaceAfter:9,lineSpacing:17}));
  });
  card(s,M,4.66,CW,0.98,PANEL);
  s.addText("不動産のファンドと同じ形です。マスターリース会社が保証賃料を払い、AM会社が運用報酬とディスポジションフィーを取る。",
    t({x:M+0.45,y:4.86,w:CW-0.9,h:0.36,fontSize:13.5,bold:true,color:TEXT}));
  s.addText("1本の「サブリース」に押し込むと、値上がり分を取るために買戻し義務が要る＝100万円を売上計上できなくなります。2本に分けることが、法務と会計の両方を通す唯一の形です。",
    t({x:M+0.45,y:5.24,w:CW-0.9,h:0.32,fontSize:11.5,color:MUTE}));
  card(s,M,5.78,CW,0.84,BURG);
  s.addText("賃料5%は当社が払う。値上がりの75%は会員のもの。当社の取り分は25%だけ。",
    t({x:M+0.45,y:5.98,w:CW-0.9,h:0.42,fontSize:17,bold:true,color:GOLD_L}));
  s.addNotes("純粋サブリース（値上がり全取り）は買戻し義務を伴い収益認識で詰む。2契約に分けることで、法務・会計・マーケの3つが同時に立つ。");
}

/* 6 SOLUTION */{
  const s=base("SOLUTION","設計：ワイン貯金の3ステップ","所有権は会員に。管理手数料を払う代わりに、その倍のマイルを受け取る。");
  [["ワインを購入し、預ける","100万円","所有権は会員。定温セラーで保管・動産保険付帯。WineBankに賃貸する"],
   ["管理手数料を払う","▲25,000円","年率2.5%。保管料・保険料を含む"],
   ["ワインマイルを得る","50,000マイル","年率5%相当。会食・贈答・イベント・オークション・ワイナートに使える"]
  ].forEach((v,i)=>{
    const x=M+i*4.32; card(s,x,1.9,3.9,2.4); badge(s,x+0.32,2.16,i+1);
    s.addText(v[0], t({x:x+0.8,y:2.18,w:2.82,h:0.32,fontSize:13.5,bold:true}));
    s.addText(v[1], t({x:x+0.32,y:2.72,w:3.26,h:0.58,fontSize:28,bold:true,color:i===1?AMBER:GOLD}));
    s.addText(v[2], t({x:x+0.32,y:3.4,w:3.26,h:0.8,fontSize:11,color:MUTE,lineSpacing:17}));
    if(i<2) s.addText("▶", t({x:x+3.94,y:2.88,w:0.36,h:0.4,fontSize:17,color:GOLD,align:"center"}));
  });
  card(s,M,4.6,CW,1.0,PANEL2);
  s.addText("会員は2.5万円払って、5万円分を受け取る。差額の2.5万円を「貯金」していると考える。",
    t({x:M+0.45,y:4.82,w:CW-0.9,h:0.42,fontSize:19,bold:true,color:GOLD_L}));
  s.addText("さらに、値上がり分の75%も会員のものとして残ります。",
    t({x:M+0.45,y:5.26,w:CW-0.9,h:0.3,fontSize:12.5,color:TEXT}));
  card(s,M,5.76,CW,0.86,BURG);
  s.addText("加えて、落札・出品・会食・贈答・イベント参加のたびに限定マイルが貯まります。",
    t({x:M+0.45,y:5.98,w:CW-0.9,h:0.4,fontSize:15,bold:true,color:GOLD_L}));
}

/* 7 NARRATIVE */{
  const s=base("NARRATIVE","「相殺してよ」と言われたら",
    "差額をください——ごもっともです。ただ、相殺した世界には、次の1年で何も起きません。");
  card(s,M,1.72,3.5,2.72,PANEL);
  s.addText("相殺した世界", t({x:M+0.32,y:1.9,w:2.86,h:0.3,fontSize:13,bold:true,color:MUTE}));
  s.addText("3月。口座に25,000円。", t({x:M+0.32,y:2.24,w:2.86,h:0.36,fontSize:15,bold:true,color:TEXT}));
  s.addText("明細に一行増える。それだけ。\n誰にも会わず、何も残らない。\n来年また、同じ一行が増える。",
    t({x:M+0.32,y:2.72,w:2.86,h:1.3,fontSize:11.5,color:MUTE,lineSpacing:20}));
  card(s,M+3.66,1.72,8.4,2.72,PANEL2);
  s.addText("相殺しない世界", t({x:M+3.98,y:1.9,w:7.76,h:0.3,fontSize:13,bold:true,color:GOLD}));
  [["5月","取引先と、グランメゾンで。"],["8月","義父の誕生日に、生まれ年を一本。"],
   ["11月","ブルゴーニュワイン樽を共同落札。"],["1月","会員限定の生産者イベントへ。"],
   ["3月","オークションで落札。マイルがまた入る。"],["通年","ワイナートが毎号届く。"]
  ].forEach((v,i)=>{
    const x=M+3.98+(i%2)*3.9, y=2.26+Math.floor(i/2)*0.6;
    s.addText(v[0], t({x:x,y:y,w:0.62,h:0.28,fontSize:11,bold:true,color:GOLD}));
    s.addText(v[1], t({x:x+0.68,y:y,w:3.1,h:0.28,fontSize:11.5,color:TEXT}));
  });
  s.addText("※ その他、ボルドーマラソン・5大シャトー訪問企画、国内ワイナリーツアー等の年間ワインイベント盛りだくさん",
    t({x:M+3.98,y:3.78,w:7.76,h:0.4,fontSize:10,color:GOLD,lineSpacing:14}));
  card(s,M,4.58,CW,0.8,BURG);
  s.addText("25,000円は貯金になりません。50,000マイルは、ワインのある一年になります。",
    t({x:M+0.45,y:4.75,w:CW-0.9,h:0.42,fontSize:18,bold:true,color:GOLD_L,align:"center"}));
  [["税務はカードのマイルと同じ","AMEX等のマイレージ還元は法人・個人とも課税されません。ワインマイルも同じ「利用に応じた還元」として設計します。※顧問税理士の確認を前提"],
   ["一般サービスへの交換は 0.5","ワイン関連の一般サービスへは0.5で交換可能。比べたうえで「ワインならWineBank経済圏が一番得だ」と分かる設計にします。"],
   ["手間は、ゼロ","手数料は年1回の自動引落。マイルは自動付与。使うときは、お店で名前を言うだけです。"]
  ].forEach((v,i)=>{
    const x=M+i*4.14; card(s,x,5.5,3.86,1.16,PANEL);
    s.addText(v[0], t({x:x+0.3,y:5.64,w:3.26,h:0.3,fontSize:12.5,bold:true,color:GOLD_L}));
    s.addText(v[1], t({x:x+0.3,y:5.96,w:3.26,h:0.62,fontSize:9.5,color:MUTE,lineSpacing:13}));
  });
}

/* 8 UNIT ECONOMICS */{
  const s=base("UNIT ECONOMICS","マイル原価は「どこで使われるか」で決まる",
    "WineBank単体ベース。系列店へはマイル額面×レート×90%を保証。額面100に対する当社コストで表示。");
  s.addTable([[hdr("交換先"),hdr("レート"),hdr("単体コスト"),hdr("連結コスト（参考）"),hdr("方針")],
    [lft("系列レストラン"),cel("1.0円"),cel("90",{color:RED,bold:true}),cel("30"),cel("要誘導",{color:AMBER})],
    [lft("グランメゾン",{fill:{color:PANEL2}}),cel("0.5円",{fill:{color:PANEL2},bold:true,color:GOLD}),
     cel("45",{fill:{color:PANEL2}}),cel("15",{fill:{color:PANEL2}}),cel("◎",{color:MINT,bold:true,fill:{color:PANEL2}})],
    [lft("WineBank CLUB 充当"),cel("1.0円"),cel("0",{color:MINT,bold:true}),cel("0"),cel("◎",{color:MINT,bold:true})],
    [lft("オークション成約手数料"),cel("1.0円"),cel("0",{color:MINT,bold:true}),cel("0"),cel("◎ 最優先で誘導",{color:MINT,bold:true})],
    [lft("ワイン追加購入"),cel("1.0円"),cel("80",{color:RED}),cel("80"),cel("上限20%",{color:AMBER})],
    [lft("系列店外の飲食"),cel("0.75円"),cel("75",{color:RED}),cel("75"),cel("上限必須",{color:AMBER})],
    [lft("失効"),cel("—"),cel("0",{color:MINT,bold:true}),cel("0"),cel("◎",{color:MINT,bold:true})]],
    Object.assign(tb(),{x:M,y:1.86,w:CW,colW:[3.7,1.5,2.2,2.9,1.76],
      rowH:[0.4,0.36,0.36,0.36,0.36,0.36,0.36,0.36]}));
  s.addText("想定ミックス：系列店35% ／ グランメゾン20% ／ CLUB充当15% ／ オークション10% ／ 追加購入5% ／ 失効15%　→　加重平均 単体44.5%",
    t({x:M,y:4.9,w:CW,h:0.28,fontSize:10.5,color:GOLD}));
  card(s,M,5.28,5.9,1.34,BURG);
  s.addText("損益分岐は 67.9%", t({x:M+0.4,y:5.42,w:5.1,h:0.34,fontSize:17,bold:true,color:GOLD_L}));
  s.addText("管理手数料250万 ÷ マイル発行368万。加重平均の原価率がこれを下回れば、単体でも継続収支は黒字です。想定ミックスは44.5%で、23ポイントの余裕があります。",
    t({x:M+0.4,y:5.8,w:5.1,h:0.74,fontSize:10.5,color:TEXT,lineSpacing:15}));
  card(s,M+6.16,5.28,5.9,1.34,PANEL);
  s.addText("赤字になるのは、たった一つの場合だけ", t({x:M+6.56,y:5.42,w:5.1,h:0.34,fontSize:15,bold:true,color:AMBER}));
  s.addText("全額を系列店の1.0円で使われた場合のみ90%となり、継続▲81万/年。逆に言えば、どこで使わせるかの設計が、そのまま収支になります。",
    t({x:M+6.56,y:5.8,w:5.1,h:0.74,fontSize:10.5,color:MUTE,lineSpacing:15}));
  s.addNotes("継続収支：基本ケース+86万/年、良好ケース（オークション誘導強化）+128万/年、最悪ケース▲81万/年。90%保証は系列店への送客投資であり、連結では相殺される。");
}

/* 9 SPREAD */{
  const s=base("RETURN","3年・5年・10年で、双方いくらになるか",
    "ワイン100万円・年6%成長・成功報酬25%・仲介手数料なし。連結ベース。");
  s.addTable([[hdr(""),hdr("ワイン時価"),hdr("値上がり益"),hdr("成功報酬25%"),hdr("会員の累計利益"),hdr("会員 単純年率"),hdr("会員 CAGR"),hdr("当社の累計"),hdr("当社 年率")],
    [lft("3年",{bold:true,fill:{color:PANEL2}}),cel("1,191,016"),cel("191,016"),cel("47,754"),
     cel("218,262",{bold:true,color:MINT}),cel("7.3%",{color:MINT}),cel("6.80%"),cel("77,754",{bold:true,color:GOLD}),cel("2.59%")],
    [lft("5年",{bold:true,fill:{color:PANEL2}}),cel("1,338,226"),cel("338,226"),cel("84,556"),
     cel("378,669",{bold:true,color:MINT}),cel("7.6%",{color:MINT}),cel("6.63%"),cel("134,556",{bold:true,color:GOLD}),cel("2.69%")],
    [lft("10年",{bold:true,fill:{color:PANEL2}}),cel("1,790,848"),cel("790,848"),cel("197,712"),
     cel("843,136",{bold:true,color:MINT}),cel("8.4%",{color:MINT}),cel("6.31%"),cel("297,712",{bold:true,color:GOLD}),cel("2.98%")]],
    Object.assign(tb(),{x:M,y:1.8,w:CW,colW:[0.85,1.5,1.4,1.45,1.65,1.3,1.15,1.5,1.26],
      rowH:[0.56,0.5,0.5,0.5]}));
  s.addText("※会員＝（マイル額面累計 − 手数料累計）＋（値上がり益 − 成功報酬）。当社＝（手数料2.5% − マイル連結原価1.5%）×年数 ＋ 成功報酬",
    t({x:M,y:3.9,w:CW,h:0.28,fontSize:10,color:MUTE}));
  [["成長率が上がるほど、当社も伸びる","年5%なら当社2.38%／年6%で2.69%／年10%で4.05%（いずれも5年）。会員と当社が完全に同じ方向を向きます。"],
   ["長く持つほど、当社が有利になる","成功報酬25%と媒介10%の損益分岐は8.8年（6%成長時）。10%成長なら5.4年。長期保有を促す動機が当社側に働きます。"],
   ["だからセラーが増える方向に働く","媒介モデルは回転させたくなり、セラーが減ります。成功報酬は寝かせたくなる。Cloud Cave構想と同じ向きです。"]
  ].forEach((v,i)=>{
    const x=M+i*4.14; card(s,x,4.32,3.86,1.5,i===2?PANEL2:PANEL);
    badge(s,x+0.3,4.5,i+1);
    s.addText(v[0], t({x:x+0.76,y:4.52,w:2.84,h:0.3,fontSize:12.5,bold:true,color:GOLD_L}));
    s.addText(v[1], t({x:x+0.3,y:4.98,w:3.26,h:0.76,fontSize:10.5,color:MUTE,lineSpacing:15}));
  });
  card(s,M,5.98,CW,0.64,BURG);
  s.addText("会員は年7〜8%、当社は年2.6〜3.0%。値上がりの75%を会員に残しても、事業は成立します。",
    t({x:M+0.45,y:6.14,w:CW-0.9,h:0.36,fontSize:15,bold:true,color:GOLD_L,align:"center"}));
}

/* 10 STRUCTURE CHOICE */{
  const s=base("STRUCTURE CHOICE","構造の選択：なぜ買戻しではなく成功報酬か",
    "検討した3案を、法務・会計・利益相反の3面で評価しました。");
  const g=(x,c)=>cel(x,{color:c,bold:true,fontSize:10.5});
  s.addTable([[hdr(""),hdr("① 買戻し保証"),hdr("② 成功報酬25%（採用）"),hdr("③ 専属専任媒介 10%")],
    [lft("出資法（預り金）",{fill:{color:PANEL2},bold:true}),g("✗ 元本保証と読まれる",RED),g("◎ 該当しない",MINT),g("◎ 該当しない",MINT)],
    [lft("金商法（集団投資）",{fill:{color:PANEL2},bold:true}),g("△",AMBER),g("◎ 会員が払う手数料。分配ではない",MINT),g("◎ 媒介手数料",MINT)],
    [lft("売上計上（収益認識）",{fill:{color:PANEL2},bold:true}),g("✗ 借入金になる",RED),g("◎ 完全な売却",MINT),g("◎ 完全な売却",MINT)],
    [lft("B/Sリスク",{fill:{color:PANEL2},bold:true}),g("✗ 規模に比例",RED),g("◎ なし",MINT),g("◎ なし",MINT)],
    [lft("利益相反",{fill:{color:PANEL2},bold:true}),g("✗ 当社が買主",RED),g("◎ 値上がりだけを共に願う",MINT),g("△ 当社は早く売りたい",AMBER)],
    [lft("顧客の自由度",{fill:{color:PANEL2},bold:true}),g("△",AMBER),g("◎ 縛らない",MINT),g("✗ 専属専任で縛る",RED)],
    [lft("当社の年率（5年）",{fill:{color:PANEL2},bold:true}),cel("約7.0%",{fontSize:11}),
     cel("約2.7%",{fontSize:11,bold:true,color:GOLD}),cel("約3.7%",{fontSize:11})]],
    Object.assign(tb(),{x:M,y:1.8,w:CW,colW:[2.66,2.8,3.8,2.8],rowH:[0.44,0.42,0.42,0.42,0.42,0.42,0.42,0.42]}));
  card(s,M,5.32,5.9,1.3,PANEL);
  s.addText("25%なら「手数料」であって「分配」ではない", t({x:M+0.4,y:5.46,w:5.1,h:0.3,fontSize:14,bold:true,color:GOLD_L}));
  s.addText("会員が当社に払う役務の成功報酬であり、会員への利益分配ではありません。P1ファンドの成功報酬25%と同じ水準なので、既に通っている説明が使えます。",
    t({x:M+0.4,y:5.78,w:5.1,h:0.74,fontSize:10.5,color:MUTE,lineSpacing:15}));
  card(s,M+6.16,5.32,5.9,1.3,BURG);
  s.addText("縛らないために、精算は「契約終了時」に", t({x:M+6.56,y:5.46,w:5.1,h:0.3,fontSize:14,bold:true,color:GOLD_L}));
  s.addText("売却時精算だと、拘束がない限り会員は当社を通さず売ります。契約終了時にLiv-ex連動評価額の差分で精算すれば、どこで売っても飲んでも同じ。専属専任も媒介手数料も不要です。",
    t({x:M+6.56,y:5.78,w:5.1,h:0.74,fontSize:10.5,color:TEXT,lineSpacing:15}));
  s.addNotes("仲介手数料はWineBank経由で成約した場合のみ収受。会員に当社経由を強制しない。");
}

/* 11 TWO TRACKS + 年次精算 */{
  const s=base("TWO TRACKS","運用型を基本に。ただし「飲みたい」も、無理なく受け止める。",
    "飲むつもりの人に賃貸借は不要です。そして運用型の人も、途中で飲みたくなります。");
  [["運用型（推奨・基本）","賃貸借 ＋ 成功報酬25%",["ワインは当社が賃借し、マイルが賃料として入る","値上がりの75%は会員のもの","出口は自由。縛りなし"],PANEL2,GOLD],
   ["消費型（自己利用・贈答）","売買 ＋ 寄託のみ",["賃貸借も成功報酬もかからない","マイルは購入時の還元として付与","規制の表面積はほぼゼロ"],PANEL,MINT]
  ].forEach((c,i)=>{
    const x=M+i*6.16; card(s,x,1.78,5.9,2.16,c[3]);
    s.addText(c[0], t({x:x+0.4,y:1.96,w:5.1,h:0.36,fontSize:18,bold:true,color:c[4]}));
    s.addText(c[1], t({x:x+0.4,y:2.36,w:5.1,h:0.3,fontSize:12,color:MUTE}));
    s.addText(c[2].map((b,j)=>({text:b,options:{bullet:{indent:12},breakLine:j<c[2].length-1}})),
      t({x:x+0.4,y:2.76,w:5.1,h:1.1,fontSize:11.5,valign:"top",paraSpaceAfter:8,lineSpacing:17}));
  });
  card(s,M,4.1,CW,1.5,PANEL2);
  s.addText("途中で飲みたくなったら —— 年に1度、まとめて精算します（年次リバランス）",
    t({x:M+0.45,y:4.3,w:CW-0.9,h:0.34,fontSize:16,bold:true,color:GOLD_L}));
  [["1","引き出して飲んだ分は、引出時の評価額で運用資産から控除"],
   ["2","翌年の管理手数料とマイル付与は、控除後の残高で計算"],
   ["3","都度精算はしない。手数料の請求とマイルの付与を、同じ日に一度だけ行う"]
  ].forEach((v,i)=>{
    const x=M+0.45+i*3.85;
    s.addText(v[0]+".", t({x:x,y:4.76,w:0.26,h:0.28,fontSize:12,bold:true,color:GOLD}));
    s.addText(v[1], t({x:x+0.3,y:4.76,w:3.3,h:0.72,fontSize:11,color:MUTE,lineSpacing:16}));
  });
  card(s,M,5.76,CW,0.86,BURG);
  s.addText("会員は手続きを意識しません。年1回、手数料が引き落とされ、同じ日に翌年分のマイルが入るだけです。",
    t({x:M+0.45,y:5.98,w:CW-0.9,h:0.4,fontSize:15,bold:true,color:GOLD_L}));
  s.addNotes("都度時価精算は運用負荷が高すぎる。年次リバランスなら双方に不利益がなく、オペレーションも年1回で済む。");
}

/* 12 MILE STRUCTURE */{
  const s=base("MILE DESIGN","マイルは2階建て。貯まり方も2通り。",
    "保有に対する年次付与と、行動に対する都度付与。後者が「終わらない」の正体です。");
  [["通常マイル","有効期限 1年",["保有資産に比例した年次付与（保有残高×5%）","年会費の考え方と同じく、1年サイクル"],
    ["会食・贈答","WineBank CLUB充当","ワイナート年間購読","ワイン追加購入（上限あり）","オークション成約手数料"],PANEL,GOLD_L],
   ["限定マイル","有効期限 3〜6ヶ月",["行動に対する都度付与（落札・出品・会食・イベント・スクール受講）","短い期限が、次の行動を呼ぶ"],
    ["オークション・マーケットプレイス","ワインスクール受講料","ワイン関連の購入","※飲食は会計を追えないため対象外"],PANEL2,GOLD]
  ].forEach((c,i)=>{
    const x=M+i*6.16; card(s,x,1.78,5.9,3.66,c[4]);
    s.addText(c[0], t({x:x+0.4,y:1.96,w:5.1,h:0.38,fontSize:19,bold:true,color:c[5]}));
    s.addText(c[1], t({x:x+0.4,y:2.38,w:5.1,h:0.3,fontSize:12.5,bold:true,color:MUTE}));
    s.addText(c[2].map((b,j)=>({text:b,options:{bullet:{indent:12},breakLine:j<c[2].length-1}})),
      t({x:x+0.4,y:2.76,w:5.1,h:0.85,fontSize:11,color:MUTE,valign:"top",paraSpaceAfter:7,lineSpacing:16}));
    s.addText("使える先", t({x:x+0.4,y:3.66,w:5.1,h:0.26,fontSize:11,bold:true,color:GOLD}));
    s.addText(c[3].map((b,j)=>({text:b,options:{bullet:{indent:12},breakLine:j<c[3].length-1}})),
      t({x:x+0.4,y:3.98,w:5.1,h:1.4,fontSize:11,valign:"top",paraSpaceAfter:5,lineSpacing:15}));
  });
  card(s,M,5.6,CW,1.02,BURG);
  s.addText("落札しても、出品しても、会食しても、イベントに出ても、マイルが入る。",
    t({x:M+0.45,y:5.8,w:CW-0.9,h:0.4,fontSize:17,bold:true,color:GOLD_L}));
  s.addText("だから残高を使い切っても、翌週にはまた増えている。これが「終わらない」の仕組みです。",
    t({x:M+0.45,y:6.22,w:CW-0.9,h:0.34,fontSize:12.5,color:TEXT}));
  s.addNotes("マイルの有効期限は無償付与であれば自由に設定できる（資金決済法の前払式支払手段に該当しないため）。JALマイル36ヶ月・楽天1年と同様。");
}

/* 13 REDEMPTION MAP */{
  const s=base("REDEMPTION","交換先マップ：村を1つにしない",
    "楽天の凄さは、ポイントを楽天市場という1つの村に閉じ込めなかったことでした。");
  s.addTable([[hdr("交換先"),hdr("レート"),hdr("上限"),hdr("当社の連結コスト"),hdr("判定")],
    [lft("系列レストランでの会食"),cel("1.0円"),cel("—"),cel("実原価 30%"),cel("○")],
    [lft("グランメゾン（全ランク共通）",{fill:{color:PANEL2}}),cel("0.5円",{fill:{color:PANEL2},bold:true,color:GOLD}),
     cel("—",{fill:{color:PANEL2}}),cel("実原価 30%",{fill:{color:PANEL2}}),cel("◎",{color:MINT,bold:true,fill:{color:PANEL2}})],
    [lft("WineBank CLUB 会費充当"),cel("1.0円"),cel("下記※"),cel("ほぼゼロ"),cel("◎",{color:MINT,bold:true})],
    [lft("ワイナート 年間購読"),cel("1.0円"),cel("—"),cel("購読実費"),cel("○")],
    [lft("ワインスクール受講料"),cel("1.0円"),cel("—"),cel("講師・会場費"),cel("◎",{color:MINT,bold:true})],
    [lft("会員交流イベント参加費"),cel("1.0円"),cel("—"),cel("ほぼゼロ"),cel("◎",{color:MINT,bold:true})],
    [lft("マーケットプレイス／オークション"),cel("1.0円"),cel("—"),cel("ゼロ"),cel("◎",{color:MINT,bold:true})],
    [lft("ワインの追加購入・贈答"),cel("1.0円"),cel("年間付与の20%",{color:AMBER}),cel("原価 75〜85%"),cel("上限必須",{color:AMBER})],
    [lft("配送料"),cel("1.0円"),cel("要設定"),cel("実費"),cel("上限必須",{color:AMBER})],
    [lft("ワイン関連の一般サービス"),cel("0.5円",{color:AMBER}),cel("要設定"),cel("真水（現金）"),cel("要検討",{color:AMBER})]],
    Object.assign(tb(),{x:M,y:1.78,w:CW,colW:[4.5,1.4,2.3,2.3,1.56],
      rowH:[0.36,0.32,0.32,0.32,0.32,0.32,0.32,0.32,0.32,0.32,0.32]}));
  card(s,M,5.46,5.9,1.16,PANEL);
  s.addText("WineBank CLUB への充当ルール", t({x:M+0.4,y:5.58,w:5.1,h:0.28,fontSize:13,bold:true,color:GOLD_L}));
  s.addText("100万・400万会員はマイル充当による単月利用のみ可。未利用時の特典をワイン購入代金へ振り替えることはできません。",
    t({x:M+0.4,y:5.88,w:5.1,h:0.64,fontSize:10,color:MUTE,lineSpacing:14}));
  card(s,M+6.16,5.46,5.9,1.16,BURG);
  s.addText("一般サービス 0.5円は、比較させるための設計です", t({x:M+6.56,y:5.58,w:5.1,h:0.28,fontSize:13,bold:true,color:GOLD_L}));
  s.addText("外に出せば必ず不利になる。会員は一度比べたうえで「ワインのことなら、WineBankの中が一番得だ」と自分で気づきます。",
    t({x:M+6.56,y:5.88,w:5.1,h:0.64,fontSize:10,color:TEXT,lineSpacing:14}));
  s.addNotes("P1ファンド・STへの充当は削除（法務論点が重いうえ、投資勧誘と受け取られる）。");
}

/* 14 RATE POLICY */{
  const s=base("RATE POLICY","レート設計：シンプルに、そして繁忙期は守る",
    "グランメゾンは全ランク共通の0.5円。ランクで差をつけるのは、レートではなく情報です。");
  [["グランメゾンは 0.5円で固定","ランクによる差はつけません。席の機会費用が高く、定価で埋まる枠を1:1で割り引くとイールドが壊れるためです。「憧れの席に交換できる」こと自体が商品であり、マイルと同じ構造です。"],
   ["ランチとディナーは同一レート","時間帯で刻む運用は現場が混乱します。オペレーションを優先し、同一に揃えます。"],
   ["イベント時期は利用不可","クリスマス、バレンタイン、およびそれに準ずる週末。満席が確実に見込める日にマイル利用枠を空けておく必要はありません。"],
   ["系列店外は 0.75円（要検討）","真水の現金流出になるため、レートを割り引いたうえで年間上限を設けます。楽天やマイレージの外部提携レートを参照して確定します。"]
  ].forEach((v,i)=>{
    const x=M+(i%2)*6.16, y=1.82+Math.floor(i/2)*1.86;
    card(s,x,y,5.9,1.64,i===3?PANEL2:PANEL);
    badge(s,x+0.32,y+0.24,i+1);
    s.addText(v[0], t({x:x+0.8,y:y+0.26,w:4.8,h:0.32,fontSize:14.5,bold:true,color:GOLD_L}));
    s.addText(v[1], t({x:x+0.32,y:y+0.72,w:5.26,h:0.82,fontSize:11,color:MUTE,lineSpacing:16}));
  });
  card(s,M,5.6,CW,1.02,BURG);
  s.addText("ランクで差をつけるのは、レートではなく「未公開ワインの情報」です。",
    t({x:M+0.45,y:5.8,w:CW-0.9,h:0.38,fontSize:17,bold:true,color:GOLD_L}));
  s.addText("上位会員には、市場に出る前の割当情報を先に届ける。原価はかからず、しかも交換レートを刻むより遥かに効きます。",
    t({x:M+0.45,y:6.22,w:CW-0.9,h:0.32,fontSize:12,color:TEXT}));
}

/* 15 MEMBERSHIP */{
  const s=base("MEMBERSHIP","新・会員制度（差し替え案）","手数料はフラットに。ランク差は還元率と、届く情報に寄せる。");
  s.addTable([[hdr(""),hdr("PRESTIGE  100万〜"),hdr("GOLD  400万〜"),hdr("SIGNATURE  1,000万〜")],
    [lft("管理手数料（年）",{fill:{color:PANEL2},bold:true}),cel("2.5%"),cel("2.5%"),cel("2.5%")],
    [lft("ワインマイル還元率",{fill:{color:PANEL2},bold:true}),cel("3%",{bold:true,color:GOLD}),cel("4%",{bold:true,color:GOLD}),cel("5%",{bold:true,color:GOLD})],
    [lft("実質",{fill:{color:PANEL2},bold:true}),cel("+0.5%",{color:MINT}),cel("+1.5%",{color:MINT}),cel("+2.5%",{color:MINT,bold:true})],
    [lft("成功報酬（値上がり分）",{fill:{color:PANEL2},bold:true}),cel("25%"),cel("25%"),cel("25%")],
    [lft("グランメゾン交換レート",{fill:{color:PANEL2},bold:true}),cel("0.5円"),cel("0.5円"),cel("0.5円")],
    [lft("未公開ワインの情報",{fill:{color:PANEL2},bold:true}),cel("—"),cel("先行案内"),cel("優先割当",{bold:true,color:GOLD})],
    [lft("WineBank CLUB",{fill:{color:PANEL2},bold:true}),cel("マイル充当・単月のみ"),cel("マイル充当・単月のみ"),cel("STANDARD 無料付与",{bold:true,color:GOLD})]],
    Object.assign(tb(),{x:M,y:1.8,w:CW,colW:[3.3,2.92,2.92,2.92],rowH:[0.44,0.42,0.42,0.42,0.42,0.42,0.42,0.42]}));
  card(s,M,5.32,5.9,1.3,PANEL);
  s.addText("廃止するもの", t({x:M+0.4,y:5.46,w:5.1,h:0.3,fontSize:14,bold:true,color:AMBER}));
  s.addText("9行×5ランクの特典マトリクス。営業が覚えられず、顧客も比較できません。手数料を2.75%→2.7%と刻んでも100万円あたり年500円で、体感はゼロです。",
    t({x:M+0.4,y:5.78,w:5.1,h:0.74,fontSize:10.5,color:MUTE,lineSpacing:15}));
  card(s,M+6.16,5.32,5.9,1.3,BURG);
  s.addText("刻むなら、還元率と情報を刻む", t({x:M+6.56,y:5.46,w:5.1,h:0.3,fontSize:14,bold:true,color:GOLD_L}));
  s.addText("「上のランクだと還元が1.7倍」「未公開ワインが先に届く」は伝わります。レートを刻むのはやめ、体感できる2軸だけに集約します。",
    t({x:M+6.56,y:5.78,w:5.1,h:0.74,fontSize:10.5,color:TEXT,lineSpacing:15}));
}

/* 16 WINEBANK CLUB */{
  const s=base("WINEBANK CLUB","WineBank CLUB とは",
    "会員制度とは別の、飲むための会員制度。レストラン販売価格の半額（原価相当）でワインが楽しめます。");
  [["STANDARD","月 8,800円〜　マイル充当・単月利用可",
    ["提携店でのコルケージ無料","グループ飲食店の優待","会員向けワイン価格（半額）",
     "提携店向けワイン配送料無料","4名未満・ワイン価格 上限5万円"],PANEL,TEXT],
   ["GOLD","月 22,000円〜",
    ["上記に加え、生産者イベント招待","ザルト高級グラス使用",
     "個室優先利用・予約4名以上","ワイン価格の上限なし","コンシェルジュによる選定"],PANEL,GOLD_L],
   ["BLACK","年間5,000万以上、もしくは年会費60万円",
    ["未公開ワインの優先割当","ワイン樽買いの権利","ソムリエへの直接相談",
     "会員限定のクローズドな会","国内外ワイナリーツアー"],PANEL2,GOLD]
  ].forEach((c,i)=>{
    const x=M+i*4.14; card(s,x,1.82,3.86,3.32,c[3]);
    s.addText(c[0], t({x:x+0.32,y:2.02,w:3.24,h:0.4,fontSize:20,bold:true,color:c[4]}));
    s.addText(c[1], t({x:x+0.32,y:2.46,w:3.24,h:0.42,fontSize:10.5,color:MUTE,lineSpacing:14}));
    s.addText(c[2].map((b,j)=>({text:b,options:{bullet:{indent:12},breakLine:j<c[2].length-1}})),
      t({x:x+0.32,y:2.96,w:3.24,h:2.08,fontSize:11,valign:"top",paraSpaceAfter:8,lineSpacing:16}));
  });
  card(s,M,5.32,5.9,1.3,BURG);
  s.addText("「半額」が、すべてを説明します", t({x:M+0.4,y:5.46,w:5.1,h:0.3,fontSize:14,bold:true,color:GOLD_L}));
  s.addText("レストランで3倍の値がつくワインが、原価相当で飲める。これ以上わかりやすい入会理由はありません。ワイン好きにとっては、これ自体がキラーコンテンツです。",
    t({x:M+0.4,y:5.78,w:5.1,h:0.74,fontSize:10.5,color:TEXT,lineSpacing:15}));
  card(s,M+6.16,5.32,5.9,1.3,PANEL);
  s.addText("引き上げの動線は「人数」と「上限」", t({x:M+6.56,y:5.46,w:5.1,h:0.3,fontSize:14,bold:true,color:GOLD_L}));
  s.addText("STANDARDは4名未満・ワイン5万円まで。GOLDでその両方が外れます。SIGNATUREにはSTANDARDを無料付与し、まず半額を体験させてから上げる設計です。",
    t({x:M+6.56,y:5.78,w:5.1,h:0.74,fontSize:10.5,color:MUTE,lineSpacing:15}));
  s.addNotes("STANDARD 月8,800円＝年約10.6万円。GOLD 月22,000円＝年26.4万円。SIGNATUREへのSTANDARD無料付与は年10.6万円相当の原価。");
}

/* 17 NO YEN */{
  const s=base("COMMUNICATION","「円」で表示しない",
    "レートを公表せず、必要マイル数で見せる。航空会社のマイルと同じ方式です。");
  const box=(x,l,txt,col,f)=>{ card(s,x,1.88,5.9,1.5,f);
    s.addText(l, t({x:x+0.4,y:2.08,w:5.1,h:0.3,fontSize:12,bold:true,color:col}));
    s.addText(txt, t({x:x+0.4,y:2.46,w:5.1,h:0.7,fontSize:16,bold:true})); };
  box(M,"✕  レート表記","「グランメゾンは 1マイル＝0.5円」",AMBER,PANEL);
  box(M+6.16,"◯  必要マイル表記","「グランメゾン ディナー（1名）\n＝ 30,000マイル」",MINT,PANEL2);
  [["レートの議論が消える","会員は「0.5円は損だ」ではなく「3万マイルで行ける」と考えます。マイルもディズニーもこの方式です。"],
   ["有利誤認リスクが消える","「1マイル＝1円」と大書して特定店だけ0.5円という運用は景表法上グレーです。円換算を出さなければ争点になりません。"],
   ["税務の説明が軽くなる","円建ての金銭的価値を明示しないほうが、クレジットカードのマイレージ還元と同じ扱いで説明しやすくなります。"]
  ].forEach((v,i)=>{
    const x=M+i*4.14; card(s,x,3.64,3.86,2.1);
    badge(s,x+0.3,3.88,i+1);
    s.addText(v[0], t({x:x+0.76,y:3.9,w:2.86,h:0.32,fontSize:13.5,bold:true,color:GOLD_L}));
    s.addText(v[1], t({x:x+0.3,y:4.4,w:3.26,h:1.2,fontSize:11.5,color:MUTE,lineSpacing:18}));
  });
  card(s,M,5.96,CW,0.66,BURG);
  s.addText("会員には「5%還元」とだけ伝え、交換表は「◯◯マイルで何ができるか」で見せる。",
    t({x:M+0.45,y:6.12,w:CW-0.9,h:0.36,fontSize:14.5,bold:true,color:GOLD_L,align:"center"}));
}

/* 18 EXIT */{
  const s=base("EXIT","出口設計：縛らない。それでも取りこぼさない。",
    "専属専任で縛るのをやめ、成功報酬を契約終了時の精算に一本化します。");
  card(s,M,1.8,5.9,2.4,PANEL2);
  s.addText("精算のルール", t({x:M+0.4,y:2.0,w:5.1,h:0.32,fontSize:15,bold:true,color:GOLD_L}));
  [["基準","売却価格ではなく、当社のLiv-ex連動評価額"],
   ["時点","賃貸借契約の終了時（売却・引取・転換のいずれでも）"],
   ["料率","契約開始時と終了時の評価額の差分 × 25%"],
   ["仲介手数料","WineBank経由で成約した場合のみ収受。強制しない"]
  ].forEach((v,i)=>{
    const y=2.44+i*0.42;
    s.addText(v[0], t({x:M+0.4,y:y,w:1.15,h:0.3,fontSize:11,bold:true,color:GOLD}));
    s.addText(v[1], t({x:M+1.6,y:y,w:3.9,h:0.3,fontSize:11,color:MUTE}));
  });
  card(s,M+6.16,1.8,5.9,2.4,PANEL);
  s.addText("会員が得られる自由", t({x:M+6.56,y:2.0,w:5.1,h:0.32,fontSize:15,bold:true,color:GOLD_L}));
  [["どこで売ってもいい","他社でもヤフオクでも構いません。精算は変わりません"],
   ["市場より高く売れたら","超過分はすべて会員のものです"],
   ["飲んでもいい","年次リバランスで運用資産から控除するだけです"],
   ["現物で引き取ってもいい","売れなければ現物をお届けします。当社の負担はゼロ"]
  ].forEach((v,i)=>{
    const y=2.44+i*0.42;
    s.addText(v[0], t({x:M+6.56,y:y,w:1.85,h:0.3,fontSize:11,bold:true,color:GOLD}));
    s.addText(v[1], t({x:M+8.46,y:y,w:3.3,h:0.3,fontSize:10.5,color:MUTE}));
  });
  card(s,M,4.4,CW,1.1,BURG);
  s.addText("当社は会員の取引相手ではなく、値上がりを一緒に願う側にいます。",
    t({x:M+0.45,y:4.6,w:CW-0.9,h:0.4,fontSize:18,bold:true,color:GOLD_L}));
  s.addText("買戻しでは、会員は高く売りたく当社は安く買いたい。媒介では、当社は早く売りたい。成功報酬なら、当社が願うのは「値上がり」だけです。",
    t({x:M+0.45,y:5.04,w:CW-0.9,h:0.34,fontSize:12,color:TEXT}));
  card(s,M,5.66,CW,0.96,PANEL);
  s.addText("縛らないほうが、結果として当社を通ります。",
    t({x:M+0.45,y:5.84,w:CW-0.9,h:0.32,fontSize:14,bold:true,color:GOLD_L}));
  s.addText("精算が済んでいれば、会員が自社の板を使わない理由は「手間」だけになります。マーケットプレイスの使い勝手で勝てばよく、契約で縛る必要はありません。",
    t({x:M+0.45,y:6.2,w:CW-0.9,h:0.32,fontSize:11.5,color:MUTE}));
}

/* 19 RISK */{
  const s=base("RISK CONTROL","先に塞ぐ：4つのリスク","攻める前に、法務・税務・会計を設計に織り込みます。");
  [["出資法・景表法","「年率5%」と言わない","「預ける＋年率＋貯金」の組合せは預り金と読まれます。マスターリース（動産賃貸借）の建て付けにし、5%は『賃料率』として説明する。商標『ワイン貯金』は競合を止めますが、法規制は止めません。"],
   ["資金決済法","マイルを「売る」と性質が変わる","無償付与なら前払式支払手段に該当せず、期限も自由です。ただしマイルを購入できる設計にすると対価性が生じて該当し、届出＋供託（未使用残高の半額）が必要になります。購入導線は法務確認後に判断します。"],
   ["課税","マイレージ還元として構成","クレジットカードのマイル還元は法人・個人とも課税されないのが実務です。ただし本件は賃料としての性格も併存するため、規約の文言で決まります。ローンチ前に顧問税理士の一筆を。"],
   ["会計","買戻しを採らない理由","買戻し保証があるとリスクと経済価値が移転せず、100万円を売上計上できません。成功報酬方式ならこの論点自体が消えます。マイルは履行義務として繰延が必要です。"]
  ].forEach((v,i)=>{
    const x=M+(i%2)*6.16, y=1.82+Math.floor(i/2)*2.4;
    card(s,x,y,5.9,2.16,i===3?PANEL2:PANEL);
    badge(s,x+0.32,y+0.24,i+1,i===3?AMBER:GOLD);
    s.addText(v[0], t({x:x+0.8,y:y+0.26,w:2.9,h:0.32,fontSize:14,bold:true}));
    s.addText(v[1], t({x:x+0.32,y:y+0.72,w:5.26,h:0.32,fontSize:13,bold:true,color:AMBER}));
    s.addText(v[2], t({x:x+0.32,y:y+1.1,w:5.26,h:0.96,fontSize:10.5,color:MUTE,lineSpacing:16}));
  });
  s.addNotes("6ヶ月ルールは撤回。無償付与のマイルは前払式支払手段に該当しないため、期限は自由。");
}

/* 20 EXISTING + ACQUISITION */{
  const s=base("MIGRATION & ACQUISITION","既存顧客と、まだ顧客でない人",
    "遡及付与はしません。代わりに「格」で報い、まったく別の入口を1つ開けます。");
  card(s,M,1.8,5.9,3.5,PANEL2);
  s.addText("既存顧客への移行", t({x:M+0.4,y:2.0,w:5.1,h:0.34,fontSize:16,bold:true,color:GOLD_L}));
  s.addText("マイレージ制度の導入時に過去搭乗分へ遡及した航空会社はありません。楽天もカード各社も同じで、開始日から全員同じ条件が業界の標準です。数百万円の遡及コストを負う必要はありません。",
    t({x:M+0.4,y:2.42,w:5.1,h:0.72,fontSize:11,color:MUTE,lineSpacing:16}));
  [["全員、同じ条件から","遡及付与はしない。説明が簡単で、完全に公平"],
   ["創業会員ボーナス","保有年数×一定マイル（例：1年5,000・上限3万）。連結原価30%なら呑める"],
   ["恒久ステータス","未公開ワインの優先案内、イベント優先招待。原価はゼロ"],
   ["条件は、つけない","見返りを求めると必ず伝わる。無条件のほうが結果的にアップセルされる"]
  ].forEach((v,i)=>{
    const y=3.22+i*0.5;
    badge(s,M+0.4,y,i+1);
    s.addText(v[0], t({x:M+0.86,y:y+0.03,w:1.62,h:0.3,fontSize:11,bold:true,color:GOLD}));
    s.addText(v[1], t({x:M+2.56,y:y,w:2.94,h:0.42,fontSize:9.5,color:MUTE,lineSpacing:13}));
  });
  card(s,M+6.16,1.8,5.9,3.5,PANEL);
  s.addText("新規獲得：VVIP限定 100本お預かりプラン", t({x:M+6.56,y:2.0,w:5.1,h:0.34,fontSize:16,bold:true,color:GOLD_L}));
  s.addText("買わなくていい。いま自宅にある100本を預けるだけ。購入資金ゼロで在庫が増え、これまでWineBankの顧客層でなかった愛好家層に入口が開きます。",
    t({x:M+6.56,y:2.42,w:5.1,h:0.72,fontSize:11,color:MUTE,lineSpacing:16}));
  [["摩擦が、ゼロ","購入も入会金も不要。「セラーが満杯」という最大のペインを直撃する"],
   ["即、経済圏に入る","時価評価→管理手数料→マイル付与。運用型にもそのまま乗せられる"],
   ["アップセルは自然に","マイルが貯まり、板を見て、会食に出る。売り込まなくても次を買う"],
   ["検品基準は必須","持込はプロヴナンス不明。液面・ラベル・コルク・保管履歴で受入可否を判断"]
  ].forEach((v,i)=>{
    const y=3.22+i*0.5;
    badge(s,M+6.56,y,i+1,i===3?AMBER:GOLD);
    s.addText(v[0], t({x:M+7.02,y:y+0.03,w:1.66,h:0.3,fontSize:11,bold:true,color:i===3?AMBER:GOLD}));
    s.addText(v[1], t({x:M+8.76,y:y,w:2.9,h:0.42,fontSize:9.5,color:MUTE,lineSpacing:13}));
  });
  card(s,M,5.5,CW,1.12,BURG);
  s.addText("既存顧客には恩を売らず、格を配る。新規には、買わせずにまず預けさせる。",
    t({x:M+0.45,y:5.72,w:CW-0.9,h:0.4,fontSize:18,bold:true,color:GOLD_L}));
  s.addText("どちらも「先にこちらが与える」設計です。ポイント経済圏は、入ってもらわないと何も始まりません。",
    t({x:M+0.45,y:6.16,w:CW-0.9,h:0.34,fontSize:12,color:TEXT}));
  s.addNotes("遡及付与は業界に前例なし。創業会員ボーナス＋恒久ステータスで感情面を満たすのが標準解。");
}

/* 21 ROADMAP */{
  const s=base("ROADMAP","ロードマップ","契約設計と法務確認を終えてから、マイルを走らせます。");
  [["PHASE 0","〜2ヶ月","土台を固める",["店舗原価率と90%精算の合意","弁護士・税理士の意見書（先行）","賃貸借＋AM契約の整備","交流イベントの年間計画"]],
   ["PHASE 1","3〜6ヶ月","100万プランで開始",["マイル台帳をマイページに実装","AI活用の内製で開発費を圧縮","年次リバランスの運用設計","既存顧客への移行案内"]],
   ["PHASE 2","6〜12ヶ月","経済圏に広げる",["SIGNATURE（1,000万）展開","オークションでの限定マイル付与","100本お預かりプラン開始"]],
   ["PHASE 3","Year 2〜","ST公募へ",["会員数と在庫回転率を実績に","SBI証券へ再提案","100億円のCloud Cave構想へ"]]
  ].forEach((p,i)=>{
    const x=M+i*3.11, w=2.87;
    card(s,x,1.85,w,3.95,i===3?BURG:PANEL);
    s.addText(p[0], t({x:x+0.28,y:2.08,w:w-0.56,h:0.28,fontFace:"Arial",fontSize:10.5,bold:true,color:GOLD,charSpacing:2}));
    s.addText(p[1], t({x:x+0.28,y:2.4,w:w-0.56,h:0.4,fontSize:20,bold:true}));
    s.addText(p[2], t({x:x+0.28,y:2.88,w:w-0.56,h:0.34,fontSize:13.5,bold:true,color:GOLD_L}));
    s.addText(p[3].map((b,j)=>({text:b,options:{bullet:{indent:12},breakLine:j<p[3].length-1}})),
      t({x:x+0.28,y:3.34,w:w-0.56,h:2.3,fontSize:12,color:MUTE,valign:"top",paraSpaceAfter:15,lineSpacing:20}));
  });
  card(s,M,5.98,CW,0.64,PANEL2);
  s.addText("先に決めるべきは、系列店との90%精算の合意です。ここが動くと、還元率もレートも全部動きます。",
    t({x:M+0.45,y:6.13,w:CW-0.9,h:0.34,fontSize:12.5,bold:true,color:GOLD_L}));
}

/* 22 NEXT */{
  const s=base("NEXT ACTION","次に決めるべきこと","この6つが決まれば、還元率とレート表は利益から逆算して確定できます。");
  s.addText("経営判断が必要な3点", t({x:M,y:1.8,w:5.9,h:0.32,fontSize:15,bold:true,color:GOLD}));
  [["系列店との90%精算の合意","単体では系列店1.0の経路が赤字になります。連結で見る前提を経営として固める必要があります。"],
   ["還元率の構造","フラット5%か、ランク別3/4/5%か。90%保証の前提では、レート0.56円以下でないと単体は黒字になりません。"],
   ["系列店外・一般サービスの上限","真水の現金流出です。レート0.5〜0.75に加え、年間付与マイルに対する上限が要ります。"]
  ].forEach((v,i)=>{
    const y=2.22+i*1.3; card(s,M,y,5.9,1.16,PANEL2); badge(s,M+0.3,y+0.2,i+1);
    s.addText(v[0], t({x:M+0.8,y:y+0.22,w:4.9,h:0.3,fontSize:13.5,bold:true,color:GOLD_L}));
    s.addText(v[1], t({x:M+0.3,y:y+0.6,w:5.3,h:0.48,fontSize:10.5,color:MUTE,lineSpacing:15}));
  });
  s.addText("確認・提供いただきたい3点", t({x:M+6.16,y:1.8,w:5.9,h:0.32,fontSize:15,bold:true,color:GOLD}));
  [["WineBank CLUBの実数","ランク別の年会費・特典・提携店数。BLACKの特典内容がSIGNATUREの購買動機を決めます。"],
   ["ワイナート年間購読の実額","交換先の原価計算に必要です。"],
   ["弁護士・税理士への確認","①賃貸借＋AM契約が出資法・金商法の枠外にあること ②マイルの無償付与としての整理と課税 ③古物競りあっせん業者の届出要否"]
  ].forEach((v,i)=>{
    const y=2.22+i*1.3; card(s,M+6.16,y,5.9,1.16,PANEL); badge(s,M+6.46,y+0.2,i+1);
    s.addText(v[0], t({x:M+6.96,y:y+0.22,w:4.9,h:0.3,fontSize:13.5,bold:true,color:GOLD_L}));
    s.addText(v[1], t({x:M+6.46,y:y+0.6,w:5.3,h:0.48,fontSize:10.5,color:MUTE,lineSpacing:15}));
  });
  card(s,M,6.14,CW,0.62,BURG);
  s.addText("ワインで、ライフスタイルを豊かにする。マイルは、その手段です。",
    t({x:M+0.45,y:6.28,w:CW-0.9,h:0.36,fontSize:15,bold:true,color:GOLD_L,align:"center"}));
}

pres.writeFile({fileName:"/home/user/wine-auction/提案資料/WineBank_ワインマイル経済圏構想.pptx"})
  .then(f=>console.log("WROTE",f));
