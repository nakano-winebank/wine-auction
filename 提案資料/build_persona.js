// ペルソナ1枚（中谷さんと話した世界観）を単体のpptxとして生成する。
// 社長が手修正したデッキに append_persona.py で末尾追加する前提なので、
// build_deck.js と同じヘルパー・配色をそのまま使う。
const pptxgen = require("pptxgenjs");
const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.author = "WineBank";
pres.title  = "ペルソナ";

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

// ---- 前提（デッキ本体と同じ） ----
const BOTTLES=100, PRICE=20000, BOOK=BOTTLES*PRICE;      // 200万円
const FEE=0.0275, MILE=0.04, PS=0.30, APP=0.06;           // 100万円コース
const OPENED=3;                                           // BYO 2本＋贈答 1本
const LEFT=BOTTLES-OPENED, BAL=LEFT*PRICE;                // 月末残高 194万円
const mMile=Math.round(BAL*MILE/12), mFee=Math.round(BAL*FEE/12);
const gain=BAL*APP, gainMember=gain*(1-PS);
const n=v=>v.toLocaleString("ja-JP");
const man=v=>(v/10000).toLocaleString("ja-JP",{maximumFractionDigits:1});

/* PERSONA */{
  const s=base("PERSONA","ワインのある1か月を、ひとつの口座で",
    `100本・${man(BOOK)}万円を預けた会員の1か月。買う・届ける・贈る・育てる・貯まる・食べるが、一本の線でつながります。`);

  // 左：ペルソナ
  const px=M, py=1.82, pw=3.2, ph=4.2;
  card(s,px,py,pw,ph,PANEL2);
  s.addText("K様", t({x:px+0.3,y:py+0.24,w:pw-0.6,h:0.5,fontSize:26,bold:true,color:GOLD_L}));
  s.addText("48歳・IT企業経営者／東京都", t({x:px+0.3,y:py+0.8,w:pw-0.6,h:0.28,fontSize:11.5,color:MUTE}));
  s.addText("月に数回は会食。ワインは好きだが、自宅のセラーはもう満杯。良い一本を良い場面で開けたい。",
    t({x:px+0.3,y:py+1.16,w:pw-0.6,h:0.9,fontSize:11,lineSpacing:16}));
  [["保有",`${BOTTLES}本・${man(BOOK)}万円`],
   ["コース","100万円コース"],
   ["管理料",`年${(FEE*100).toFixed(2)}%（月割）`],
   ["マイル",`年${MILE*100}%（月末付与）`],
   ["成功報酬",`値上がり益の${PS*100}%`]].forEach((r,i)=>{
    const y=py+2.2+i*0.37;
    s.addText(r[0], t({x:px+0.3,y,w:0.95,h:0.3,fontSize:10.5,color:MUTE}));
    s.addText(r[1], t({x:px+1.25,y,w:pw-1.55,h:0.3,fontSize:11.5,bold:true}));
  });

  // 右：6ステップ（2段×3列）
  const fx=px+pw+0.2, fw=(M+CW-fx-0.32)/3, fh=2.0;
  const steps=[
    ["9/1","100本を購入して預ける",`平均2万円×${BOTTLES}本。定温倉庫で保管し、1本ずつ時価で管理する。`,GOLD],
    ["9/6","会食先へBYOで無料配送","取引先との会食に2本。当日、お店へ直接届く。配送料は0円。",GOLD],
    ["9/14","友人の誕生日に贈る","生まれ年の1本を、メッセージカードを添えて友人宅へ配送する。",GOLD],
    ["9/20","マイページで資産を確認",`残り${LEFT}本の時価と飲み頃を確認。年6%の値上がりなら年+${man(gain)}万円。`,GOLD],
    ["9/30","月末残高でマイル付与",`${man(BAL)}万円×4%÷12で${n(mMile)}マイル。管理料も月割で${n(mFee)}円。`,MINT],
    ["12月","系列レストランで食事",`3か月で約${man(mMile*3)}万マイル。直営店で2名のディナーに使う。`,GOLD],
  ];
  steps.forEach((v,i)=>{
    const col=i%3, row=Math.floor(i/3);
    const x=fx+col*(fw+0.16), y=py+row*(fh+0.2);
    card(s,x,y,fw,fh,i===4?PANEL2:PANEL);
    badge(s,x+0.24,y+0.22,i+1,v[3]);
    s.addText(v[0], t({x:x+0.7,y:y+0.24,w:fw-0.9,h:0.3,fontFace:"Arial",fontSize:12,bold:true,color:GOLD}));
    s.addText(v[1], t({x:x+0.24,y:y+0.7,w:fw-0.44,h:0.34,fontSize:13.5,bold:true,color:GOLD_L}));
    s.addText(v[2], t({x:x+0.24,y:y+1.1,w:fw-0.44,h:0.8,fontSize:10.5,lineSpacing:15,color:TEXT,valign:"top"}));
    if(col<2) s.addText("›", t({x:x+fw,y:y+fh/2-0.2,w:0.16,h:0.4,fontFace:"Arial",fontSize:16,bold:true,color:GOLD,align:"center",valign:"middle"}));
  });

  // 締めのバナー
  card(s,M,6.14,CW,0.48,BURG);
  s.addText(`飲んでも贈っても、残った本数の分だけ毎月マイルが貯まる。今月は管理料${n(mFee)}円に対して${n(mMile)}マイル。`,
    t({x:M+0.3,y:6.14,w:CW-0.6,h:0.48,fontSize:13,bold:true,color:GOLD_L,valign:"middle"}));

  s.addNotes([
    "中谷さんと話した世界観を、1人の会員の1か月で見せるスライド。",
    `前提：平均単価2万円×${BOTTLES}本＝${n(BOOK)}円、100万円コース（管理料2.75%・マイル4%・成功報酬30%）。`,
    `BYOで2本、贈答で1本を出庫し、月末残高は${LEFT}本・${n(BAL)}円。`,
    `マイルは月末残高×4%÷12＝${n(mMile)}マイル、管理料は月末残高×2.75%÷12＝${n(mFee)}円（いずれも月割後付与・月割課金）。`,
    `値上がりは単利6%想定で年${n(gain)}円、うち会員取り分70%＝${n(gainMember)}円。`,
    "系列（グループ直営）レストランは1マイル＝1円。提携グランメゾンは0.5円のため、ここでは直営店で表示している（有利誤認の回避）。",
    "BYO配送無料は会員特典（配送代行：佐川）。贈答配送の送料の扱いは未確定のため、スライドでは無料と書いていない。",
  ].join("\n"));
}

pres.writeFile({ fileName: process.argv[2] || "persona.pptx" });
