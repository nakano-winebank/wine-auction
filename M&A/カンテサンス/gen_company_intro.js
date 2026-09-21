const pptxgen=require("pptxgenjs");
const p=new pptxgen();
p.layout="LAYOUT_WIDE";
p.title="株式会社WineBank 会社紹介";
p.author="株式会社WineBank";

const DARK="2B1520", CARD="3B1E2B", EDGE="5A3240", BERRY="6D2E46", ROSE="A26769",
      GOLD="B58B2A", GOLDL="E0B94A", INK="1F1A1C", MUTE="6E6368", TINT="F7F3F4",
      LINE="E4DADD", W="FFFFFF", GRN="2E6F4E";
const SERIF="Cambria", SANS="Calibri";
const SW=13.33, M=0.62;
let pg=0;

function footer(s,dark){
  pg++;
  const c=dark?"8A7278":MUTE;
  s.addText("株式会社WineBank　会社紹介　／　CONFIDENTIAL",
    {x:M,y:7.02,w:8,h:0.25,isTextBox:true,margin:0,fontFace:SANS,fontSize:8,color:c});
  s.addText(String(pg),{x:SW-M-0.9,y:7.02,w:0.9,h:0.25,isTextBox:true,margin:0,
    fontFace:SANS,fontSize:9,color:c,align:"right"});
}
function header(s,k,t,l){
  s.addText(k,{x:M,y:0.34,w:10,h:0.26,isTextBox:true,margin:0,fontFace:SANS,fontSize:11,bold:true,color:GOLD,charSpacing:1.4});
  s.addText(t,{x:M,y:0.62,w:SW-2*M,h:0.52,isTextBox:true,margin:0,fontFace:SERIF,fontSize:29,bold:true,color:INK});
  if(l) s.addText(l,{x:M,y:1.24,w:SW-2*M,h:0.58,isTextBox:true,margin:0,valign:"top",fontFace:SANS,fontSize:12.5,color:MUTE,lineSpacing:17});
}
function divider(s,en,jp,sub){
  s.background={color:DARK};
  s.addShape(p.ShapeType.ellipse,{x:9.8,y:-3.0,w:7.2,h:7.2,fill:{color:BERRY},transparency:78});
  s.addText(en,{x:M,y:2.72,w:11,h:0.32,isTextBox:true,margin:0,fontFace:SANS,fontSize:12,bold:true,color:GOLDL,charSpacing:2.4});
  s.addText(jp,{x:M,y:3.10,w:11,h:0.80,isTextBox:true,margin:0,fontFace:SERIF,fontSize:40,bold:true,color:W});
  if(sub) s.addText(sub,{x:M,y:4.00,w:10,h:0.36,isTextBox:true,margin:0,fontFace:SANS,fontSize:13,color:"C9B6BC"});
  footer(s,true);
}
function card(s,x,y,w,h,fill,line){
  s.addShape(p.ShapeType.roundRect,{x,y,w,h,rectRadius:0.05,fill:{color:fill||TINT},line:{color:line||LINE,width:0.75}});
}
const tOpt=(x={})=>Object.assign({fontFace:SANS,fontSize:10.5,color:INK,
  border:{type:"solid",pt:0.5,color:LINE},valign:"middle",autoPage:false},x);
const hd=t=>({text:t,options:{bold:true,color:W,fill:{color:BERRY},fontSize:10}});
const num=(t,o={})=>({text:t,options:Object.assign({align:"right"},o)});

/* ===== p.1 表紙 ===== */
{
const s=p.addSlide(); s.background={color:DARK};
s.addShape(p.ShapeType.ellipse,{x:9.4,y:-1.6,w:6.4,h:6.4,fill:{color:BERRY},transparency:62});
s.addText("会社紹介",{x:M,y:1.15,w:8,h:0.3,isTextBox:true,margin:0,fontFace:SANS,fontSize:12,bold:true,color:GOLDL,charSpacing:2.4});
s.addText("株式会社WineBank",{x:M,y:1.58,w:9,h:1.0,isTextBox:true,margin:0,fontFace:SERIF,fontSize:46,bold:true,color:W});
s.addText("ワインと、ファインダイニング。",{x:M,y:2.72,w:9,h:0.5,isTextBox:true,margin:0,fontFace:SERIF,fontSize:22,color:"E3D2D7"});
const st=[["創業","1970年","北海道札幌・有限会社中村"],
          ["グループ売上","70億円超","2026年12月期 見込"],
          ["ワイン在庫","32億円","管理在庫を含む"]];
st.forEach((v,i)=>{
  const x=M+i*3.05;
  s.addShape(p.ShapeType.roundRect,{x,y:4.10,w:2.80,h:1.24,rectRadius:0.05,fill:{color:CARD},line:{color:EDGE,width:0.75}});
  s.addText(v[0],{x:x+0.20,y:4.22,w:2.4,h:0.24,isTextBox:true,margin:0,fontFace:SANS,fontSize:9.5,bold:true,color:GOLDL});
  s.addText(v[1],{x:x+0.20,y:4.46,w:2.4,h:0.50,isTextBox:true,margin:0,fontFace:SERIF,fontSize:25,bold:true,color:W});
  s.addText(v[2],{x:x+0.20,y:4.98,w:2.5,h:0.24,isTextBox:true,margin:0,fontFace:SANS,fontSize:9,color:"AC969C"});
});
s.addText("2026年9月",{x:M,y:6.10,w:6,h:0.3,isTextBox:true,margin:0,fontFace:SANS,fontSize:11,color:"9C858B"});
footer(s,true);
}

/* ===== p.2 全体像 ===== */
{
const s=p.addSlide();
header(s,"OVERVIEW","ワインを売る会社から、ワインが生きる場所をつくる会社へ",
  "私たちは創業55年の酒販業を母体に、ワインの仕入・流通と、ファインダイニングの運営を、ひとつの会社の中で行っています。");
const cols=[
 ["ワイン",["自社EC（楽天・Yahoo・寺田ワインマーケット）","所有ワインのクラウド管理とマーケットプレイス","ワインファンド（SBI証券と提携）","会員制ワインサロン WineBank CLUB"],BERRY],
 ["ファインダイニング",["アピシウス（銀座・グランメゾン）　2024年6月 取得","ブラッスリー ティエリー・マルクス　2027年4月 開業予定","国内オーベルジュ構想　2030年以降","Bistro & Bar WineBank terrace（六本木）"],ROSE]];
cols.forEach((c,i)=>{
  const x=M+i*6.19;
  card(s,x,1.78,5.90,2.90,"FFFFFF");
  s.addShape(p.ShapeType.roundRect,{x:x+0.24,y:1.98,w:2.0,h:0.36,rectRadius:0.04,fill:{color:c[2]}});
  s.addText(c[0],{x:x+0.24,y:1.98,w:2.0,h:0.36,isTextBox:true,margin:0,align:"center",valign:"middle",
    fontFace:SANS,fontSize:12.5,bold:true,color:W});
  c[1].forEach((t,j)=>{
    s.addText("・"+t,{x:x+0.28,y:2.52+j*0.50,w:5.4,h:0.44,isTextBox:true,margin:0,
      fontFace:SANS,fontSize:11,color:INK,lineSpacing:15});
  });
});
s.addShape(p.ShapeType.roundRect,{x:M,y:4.92,w:SW-2*M,h:1.00,rectRadius:0.04,fill:{color:BERRY}});
s.addText([{text:"この二つが、同じ会社の中にあります。\n",options:{fontSize:14,bold:true,color:W}},
 {text:"仕入れたワインが、自分たちの店で生きる。店で選ばれたワインが、次の仕入れを決める。ワインの会社がレストランを持つのではなく、レストランを持つからワインが強くなる――私たちが作ろうとしているのは、その循環です。",
  options:{fontSize:11,color:"EBDCE1"}}],
 {x:M+0.30,y:5.02,w:SW-2*M-0.60,h:0.80,isTextBox:true,margin:0,lineSpacing:18,valign:"middle"});
s.addText("グループ売上：2025年12月期 65億円　→　2026年12月期 70億円超（見込）",
  {x:M,y:6.12,w:SW-2*M,h:0.3,isTextBox:true,margin:0,fontFace:SANS,fontSize:11,bold:true,color:INK});
footer(s);
}

/* ===== p.3 会社情報 扉 ===== */
{ const s=p.addSlide(); divider(s,"COMPANY INFORMATION","会社概要"); }

/* ===== p.4 会社概要 ===== */
{
const s=p.addSlide();
header(s,"COMPANY","会社概要");
const rows=[["会社名","株式会社WineBank（旧社名：有限会社中村）"],
 ["代表取締役","中野 邦人（Nakano Kunihito）"],
 ["資本金","437,169千円（資本準備金を含む）"],
 ["本社","東京都港区六本木4-12-8　第6DMJビル 2階"],
 ["創業","1970年10月（北海道札幌）"],
 ["事業概要","ワインを中心とした酒類販売／レストラン事業／Wine × Technology事業（WineTech事業）／その他上記に付随する事業"],
 ["主要株主","マネーフォワードベンチャーパートナーズ株式会社／株式会社ベクトル／寺田倉庫株式会社／株式会社PrivateBANK"]];
s.addTable(rows.map(r=>[{text:r[0],options:{bold:true,fill:{color:TINT},fontSize:11}},{text:r[1],options:{fontSize:11}}]),
  tOpt({x:M,y:1.70,w:12.09,colW:[2.30,9.79],rowH:0.56,fontSize:11}));
s.addText("創業から55年。ワインの販売に注力して30年になります。2020年に現経営陣が承継し、ワインの流通とファインダイニングの二軸で事業を再構築しています。",
  {x:M,y:5.80,w:12.09,h:0.4,isTextBox:true,margin:0,fontFace:SANS,fontSize:11,color:MUTE,lineSpacing:16});
footer(s);
}

/* ===== p.5 Mission / Vision ===== */
{
const s=p.addSlide();
header(s,"MISSION & VISION","私たちが目指していること");
const mv=[["Mission","既存のワイン流通をアップデートする"],["Vision","全ての人にファインワインを"]];
mv.forEach((v,i)=>{
  const x=M+i*6.19;
  s.addShape(p.ShapeType.roundRect,{x,y:1.72,w:5.90,h:1.30,rectRadius:0.05,fill:{color:i?TINT:BERRY},line:{color:i?LINE:BERRY,width:0.75}});
  s.addText(v[0],{x:x+0.28,y:1.86,w:3.0,h:0.28,isTextBox:true,margin:0,fontFace:SANS,fontSize:10.5,bold:true,color:i?GOLD:"E8D6DB"});
  s.addText(v[1],{x:x+0.28,y:2.16,w:5.3,h:0.60,isTextBox:true,margin:0,fontFace:SERIF,fontSize:20,bold:true,color:i?INK:W,lineSpacing:26});
});
s.addText("「Cloud Cave」― 5年以内に100億円相当のワインをクラウドワインリストへ",
  {x:M,y:3.28,w:12.09,h:0.32,isTextBox:true,margin:0,fontFace:SERIF,fontSize:15,bold:true,color:INK});
const pts=[["個人のお客様","時価（インターネット最安値）でワインを入手でき、大手ECやオークションの中間マージンが不要になります。自己利用も贈答も、50万本の在庫にアクセスできます。"],
 ["飲食店のお客様","高額なワインを店内に在庫しなくてもワインリストが華やぎます。購入した分だけのお支払いとなるため、キャッシュフローの面でも負担が軽くなります。"],
 ["保管","ご自身のセラー代わりにお使いいただけます。いつでも、どこでも、安心・安全なファインワインを。"]];
pts.forEach((t,i)=>{
  const x=M+i*4.08;
  card(s,x,3.72,3.85,1.70,"FFFFFF");
  s.addText(t[0],{x:x+0.24,y:3.86,w:3.4,h:0.28,isTextBox:true,margin:0,fontFace:SANS,fontSize:11.5,bold:true,color:BERRY});
  s.addText(t[1],{x:x+0.24,y:4.18,w:3.42,h:1.10,isTextBox:true,margin:0,fontFace:SANS,fontSize:10,color:INK,lineSpacing:14});
});
s.addShape(p.ShapeType.roundRect,{x:M,y:5.62,w:SW-2*M,h:0.72,rectRadius:0.04,fill:{color:TINT}});
s.addText("ワインは、買って終わりのものではありません。預け、選び、分かち合い、そしてまた手放す。その一連の流れを、ひとつの仕組みの上に載せたいと考えています。",
  {x:M+0.30,y:5.70,w:SW-2*M-0.60,h:0.56,isTextBox:true,margin:0,fontFace:SANS,fontSize:11.5,color:INK,valign:"middle"});
footer(s);
}

/* ===== p.6 経営陣 ===== */
{
const s=p.addSlide();
header(s,"MANAGEMENT","経営陣紹介");
card(s,M,1.70,4.30,4.50);
s.addText("中野 邦人",{x:M+0.30,y:1.92,w:3.7,h:0.44,isTextBox:true,margin:0,fontFace:SERIF,fontSize:24,bold:true,color:INK});
s.addText("Kunihito Nakano",{x:M+0.30,y:2.36,w:3.7,h:0.26,isTextBox:true,margin:0,fontFace:SANS,fontSize:11,color:GOLD});
s.addText("代表取締役",{x:M+0.30,y:2.62,w:3.7,h:0.26,isTextBox:true,margin:0,fontFace:SANS,fontSize:11,color:MUTE});
s.addText("1979年3月13日生　東洋大学 工学部卒業",{x:M+0.30,y:3.00,w:3.7,h:0.5,isTextBox:true,margin:0,fontFace:SANS,fontSize:10.5,color:INK,lineSpacing:15});
const hl=["不動産投資・証券化、富裕層向け資産コンサルティングを経て、2008年に株式会社あどばるを設立。",
 "スペースシェアリング事業として、飲食・宿泊・会議の時間貸しを事業化。",
 "あどばるを含め4社を上場企業グループ入りさせ、現在はWineBank Groupを拡大中。"];
hl.forEach((t,i)=>{
  s.addText("・"+t,{x:M+0.30,y:3.56+i*0.82,w:3.72,h:0.78,isTextBox:true,margin:0,fontFace:SANS,fontSize:10,color:MUTE,lineSpacing:13.5});
});
const car=[["2001-2008","不動産投資・証券化（株式会社モリモト）、富裕層向け資産コンサルティング（株式会社LEXINGTON）を経験"],
 ["2006","株式会社Seven Signatures 取締役。ハワイのTrump Tower Waikikiプロジェクトに関わり、1日あたりの売上高でギネス記録を樹立"],
 ["2008","株式会社あどばる 設立、代表取締役社長"],
 ["2020","株式会社WineBankをM&Aにて100%取得、代表取締役に就任"],
 ["2021","株式会社あどばるが東証プライム上場・ビジョングループ入り（50.1%）"],
 ["2024","株式会社アピシウスをM&Aにて100%取得、代表取締役に就任"]];
s.addText("経歴",{x:5.20,y:1.76,w:3.0,h:0.28,isTextBox:true,margin:0,fontFace:SANS,fontSize:10,bold:true,color:GOLD});
car.forEach((c,i)=>{
  const y=2.10+i*0.70;
  s.addText(c[0],{x:5.20,y:y,w:1.20,h:0.26,isTextBox:true,margin:0,valign:"top",fontFace:SERIF,fontSize:13,bold:true,color:BERRY});
  s.addText(c[1],{x:6.50,y:y+0.02,w:6.20,h:0.62,isTextBox:true,margin:0,valign:"top",fontFace:SANS,fontSize:10.5,color:INK,lineSpacing:14});
});
footer(s);
}

/* ===== p.7 沿革 ===== */
{
const s=p.addSlide();
header(s,"HISTORY","会社沿革","1970年に北海道札幌で創業。1996年からワイン販売に注力し、2020年の承継を経て、ワインとファインダイニングの二軸へ。");
const hist=[["1970","北海道札幌で有限会社中村 開業","ワイン"],
 ["1996","ワイン販売に注力","ワイン"],
 ["2007","楽天市場に出店（現在はYahooショッピング、Terrada Wine Marketにも出店）","ワインEC"],
 ["2011","ラ・ブリック（レストラン）、カーヴ・ド・ブリック（ワインショップ）オープン","飲食"],
 ["2020","有限会社中村をM&A。現経営陣が承継","―"],
 ["2022","Wine Cave Roppongi オープン／ワインファンド1号 開始／株式会社WineBankに社名変更","飲食・WineTech"],
 ["2023","ワイン投資プラットフォーム「WineBank」リリース／所有ワイン登録サービス リリース","WineTech"],
 ["2024","株式会社アピシウスを100%取得","飲食"],
 ["2025","Bistro & Bar WineBank terrace（ミッドタウン六本木）オープン","飲食"],
 ["2027","ブラッスリー ティエリー・マルクス 開業予定","飲食"]];
const rows=[[hd("年"),hd("できごと"),hd("領域")]].concat(hist.map(h=>[
  {text:h[0],options:{bold:true,fontSize:10.5,color:BERRY}},
  {text:h[1],options:{fontSize:10.5}},
  {text:h[2],options:{fontSize:9.5,color:MUTE}}]));
s.addTable(rows,tOpt({x:M,y:1.78,w:12.09,colW:[1.10,8.79,2.20],rowH:0.42,fontSize:10.5}));
s.addText("※ 2021年・2022年・2023年に第三者割当増資を実施。累計調達額は9.5億円。",
  {x:M,y:6.44,w:12.09,h:0.26,isTextBox:true,margin:0,fontFace:SANS,fontSize:9.5,color:MUTE});
footer(s);
}

/* ===== p.8 株主・提携先 ===== */
{
const s=p.addSlide();
header(s,"SHAREHOLDERS","株主および主要提携先","大手事業会社や投資家の皆様にご支援いただいています。");
const sh=[["マネーフォワード\nベンチャーパートナーズ","東証プライム上場・マネーフォワードグループ"],
 ["株式会社ベクトル","東証プライム上場"],
 ["寺田倉庫株式会社","独立系最大の倉庫会社"],
 ["株式会社PrivateBANK","超富裕層向けファミリーオフィス"]];
sh.forEach((v,i)=>{
  const x=M+i*3.05;
  card(s,x,1.78,2.80,1.50,"FFFFFF");
  s.addText(v[0],{x:x+0.22,y:1.94,w:2.40,h:0.60,isTextBox:true,margin:0,fontFace:SANS,fontSize:11.5,bold:true,color:INK,lineSpacing:15});
  s.addText(v[1],{x:x+0.22,y:2.62,w:2.44,h:0.54,isTextBox:true,margin:0,fontFace:SANS,fontSize:9.5,color:MUTE,lineSpacing:13});
});
const st=[["累計調達額","9.5億円",""],["ワイン在庫","32億円","管理在庫を含む"],["提携飲食店","26店舗","ワイン関連レストラン多数"]];
st.forEach((v,i)=>{
  const x=M+i*4.08;
  s.addShape(p.ShapeType.roundRect,{x,y:3.56,w:3.85,h:1.24,rectRadius:0.05,fill:{color:i===1?BERRY:TINT},line:{color:i===1?BERRY:LINE,width:0.75}});
  s.addText(v[0],{x:x+0.24,y:3.70,w:3.4,h:0.24,isTextBox:true,margin:0,fontFace:SANS,fontSize:10,bold:true,color:i===1?"E8D6DB":GOLD});
  s.addText(v[1],{x:x+0.24,y:3.94,w:3.4,h:0.50,isTextBox:true,margin:0,fontFace:SERIF,fontSize:26,bold:true,color:i===1?W:BERRY});
  if(v[2]) s.addText(v[2],{x:x+0.24,y:4.44,w:3.5,h:0.24,isTextBox:true,margin:0,fontFace:SANS,fontSize:9,color:i===1?"C9AEB6":MUTE});
});
s.addShape(p.ShapeType.roundRect,{x:M,y:5.06,w:SW-2*M,h:0.90,rectRadius:0.04,fill:{color:TINT}});
s.addText("寺田倉庫とは、ワインの保管でお取引をいただいています。日本でワインを「預かる」ことの意味を最も理解している会社と組めていることは、当社の事業の前提になっています。",
  {x:M+0.30,y:5.16,w:SW-2*M-0.60,h:0.70,isTextBox:true,margin:0,fontFace:SANS,fontSize:11.5,color:INK,valign:"middle",lineSpacing:16});
footer(s);
}

/* ===== p.9 事業紹介 扉 ===== */
{ const s=p.addSlide(); divider(s,"BUSINESS INTRODUCTION","事業紹介"); }

/* ===== p.10 事業の強み ===== */
{
const s=p.addSlide();
header(s,"STRENGTH","事業の強み","ワインを安く、正規に、たくさん仕入れられること。私たちの事業は、すべてここから始まっています。");
const str=[["01","創業55年の酒販業実績","昭和から続く酒販店として積み上げてきた取引と信用。新規参入では代替できません。"],
 ["02","大手インポーターからの直接取引","国内大手有名インポーターから、特価かつ正規品で仕入れています。並行輸入に頼りません。"],
 ["03","海外輸出入ライセンス","自社でライセンスを保有し、海外のネットワークから情報と商品を直接取りにいけます。"],
 ["04","数千名の会員基盤","ワイン愛好家と富裕層のお客様。仕入れたワインが確実に行き先を持っています。"]];
str.forEach((t,i)=>{
  const x=M+(i%2)*6.19, y=1.80+Math.floor(i/2)*1.72;
  card(s,x,y,5.90,1.56,"FFFFFF");
  s.addText(t[0],{x:x+0.26,y:y+0.20,w:0.8,h:0.36,isTextBox:true,margin:0,fontFace:SERIF,fontSize:20,bold:true,color:GOLD});
  s.addText(t[1],{x:x+1.06,y:y+0.22,w:4.6,h:0.32,isTextBox:true,margin:0,fontFace:SERIF,fontSize:16,bold:true,color:INK});
  s.addText(t[2],{x:x+1.06,y:y+0.62,w:4.62,h:0.80,isTextBox:true,margin:0,fontFace:SANS,fontSize:10.5,color:MUTE,lineSpacing:14.5});
});
s.addShape(p.ShapeType.roundRect,{x:M,y:5.28,w:SW-2*M,h:0.92,rectRadius:0.04,fill:{color:BERRY}});
s.addText("ファインワインのリセールバリューは、年率10%程度で成長しています。良質なワインを正規品かつ大量に仕入れられるかどうかが、この事業の鍵です。",
  {x:M+0.30,y:5.38,w:SW-2*M-0.60,h:0.72,isTextBox:true,margin:0,fontFace:SANS,fontSize:12,color:W,valign:"middle"});
footer(s);
}

/* ===== p.11 事業概要 ===== */
{
const s=p.addSlide();
header(s,"BUSINESS","事業概要","ワインの仕入れを強みに、オンラインとオフラインの両方で事業を展開しています。");
const biz=[["自社EC事業","オンライン","楽天・Yahoo・寺田ワインマーケットでのEC。長年の販売実績をもとに売上を維持。","来期売上 100%を維持"],
 ["WineTech事業","オンライン","所有ワインのクラウド管理、マーケットプレイスの運営、ワインファンド事業。SBI証券との提携により安定収益を確保。","来期売上 200%に拡大"],
 ["レストラン／ワイン卸事業","オフライン","グランメゾンを含む、ワインを中心としたレストラン事業。ティエリー・マルクスの出店により安定収益を見込む。","来期売上 200%に拡大"],
 ["会員制ワインサロン事業","オフライン","月額会費制で、ワインの購入やレストランをお得にご利用いただくサービス。","来期 売上拡大見込み"]];
const rows=[[hd("事業"),hd("区分"),hd("内容"),hd("来期")]].concat(biz.map(b=>[
  {text:b[0],options:{bold:true,fontSize:10.5}},{text:b[1],options:{fontSize:10,color:MUTE}},
  {text:b[2],options:{fontSize:10}},{text:b[3],options:{fontSize:10,bold:true,color:BERRY}}]));
s.addTable(rows,tOpt({x:M,y:1.80,w:12.09,colW:[2.60,1.10,6.19,2.20],rowH:0.74,fontSize:10.5}));
s.addShape(p.ShapeType.roundRect,{x:M,y:5.72,w:SW-2*M,h:0.80,rectRadius:0.04,fill:{color:TINT}});
s.addText([{text:"グループ売上　",options:{fontSize:12,bold:true,color:INK}},
 {text:"2025年12月期 65億円　→　2026年12月期 70億円超（見込）",options:{fontSize:14,bold:true,color:BERRY}}],
 {x:M+0.30,y:5.82,w:SW-2*M-0.60,h:0.60,isTextBox:true,margin:0,valign:"middle"});
footer(s);
}


/* ===== p.12 アピシウス ===== */
{
const s=p.addSlide();
header(s,"RESTAURANT　／　株式会社アピシウス（東京・銀座）","グランメゾンを引き継いで、2年が経ちました",
  "2024年6月、創業40年を超えるグランメゾンを100%取得しました。39年間にわたり赤字が続き、40年目にようやく黒字化した店です。");
const tl=[["売上高","＋30%","取得前比（2年間）"],["営業利益","＋250%超","取得前比（2年間）"],["幹部メンバー継続率","100%","一人も欠けていません"]];
tl.forEach((t,i)=>{
  const x=M+i*4.08, hot=(i===2);
  s.addShape(p.ShapeType.roundRect,{x,y:1.92,w:3.85,h:1.18,rectRadius:0.05,
    fill:{color:hot?BERRY:TINT},line:{color:hot?BERRY:LINE,width:0.75}});
  s.addText(t[0],{x:x+0.24,y:2.04,w:3.4,h:0.24,isTextBox:true,margin:0,fontFace:SANS,fontSize:10,bold:true,color:hot?"E8D6DB":GOLD});
  s.addText(t[1],{x:x+0.24,y:2.28,w:3.4,h:0.50,isTextBox:true,margin:0,fontFace:SERIF,fontSize:29,bold:true,color:hot?W:BERRY});
  s.addText(t[2],{x:x+0.24,y:2.78,w:3.5,h:0.24,isTextBox:true,margin:0,fontFace:SANS,fontSize:9,color:hot?"C9AEB6":MUTE});
});
s.addText("取得前と、取得から2年後",{x:M,y:3.26,w:5.0,h:0.28,isTextBox:true,margin:0,fontFace:SERIF,fontSize:13.5,bold:true,color:INK});
s.addTable([
 [hd(""),hd("取得前（〜2024年5月）"),hd("取得後2年（2026年）")],
 [{text:"業績",options:{bold:true,fontSize:10}},{text:"39年間にわたり赤字。40年目にようやく黒字化",options:{fontSize:10}},
  {text:"売上 ＋30%／営業利益 ＋250%超",options:{fontSize:10,bold:true,color:GRN}}],
 [{text:"人員",options:{bold:true,fontSize:10}},{text:"―",options:{fontSize:10,color:MUTE}},
  {text:"幹部メンバーは全員が継続。経営陣の入替えなし",options:{fontSize:10}}],
 [{text:"労働環境",options:{bold:true,fontSize:10}},{text:"サービス残業が常態化",options:{fontSize:10}},
  {text:"サービス残業を撤廃。12月を除き残業自体が発生しない体制へ",options:{fontSize:10,bold:true,color:GRN}}],
 [{text:"店舗",options:{bold:true,fontSize:10}},{text:"―",options:{fontSize:10,color:MUTE}},
  {text:"店内の一部改装・修繕を実施。業態・客層は変更せず",options:{fontSize:10}}]
],tOpt({x:M,y:3.60,w:7.2,colW:[0.95,2.55,3.70],rowH:0.46,fontSize:10}));
card(s,8.02,3.26,4.69,2.66,"FFFFFF");
s.addText("ワインの面でも、この2年で強くなりました",{x:8.26,y:3.38,w:4.2,h:0.26,isTextBox:true,margin:0,
  fontFace:SANS,fontSize:10,bold:true,color:GOLD});
[["日本トップクラスのワイン在庫","グランメゾンとしての蓄積を、そのまま受け継ぎました"],
 ["ソムリエと仕入ルート","インポーターである当社と組み合わさることで、双方の仕入力が上がりました"],
 ["World of Fine Wine 三つ星","5年連続で選出されています"]].forEach((k,i)=>{
  const y=3.72+i*0.68;
  s.addShape(p.ShapeType.ellipse,{x:8.26,y:y+0.03,w:0.26,h:0.26,fill:{color:ROSE}});
  s.addText(String(i+1),{x:8.26,y:y+0.03,w:0.26,h:0.26,isTextBox:true,margin:0,align:"center",valign:"middle",
    fontFace:SANS,fontSize:10,bold:true,color:W});
  s.addText(k[0],{x:8.60,y:y,w:3.9,h:0.24,isTextBox:true,margin:0,fontFace:SANS,fontSize:10.5,bold:true,color:BERRY});
  s.addText(k[1],{x:8.60,y:y+0.23,w:3.9,h:0.42,isTextBox:true,margin:0,fontFace:SANS,fontSize:9,color:MUTE,lineSpacing:12});
});
s.addShape(p.ShapeType.roundRect,{x:M,y:6.06,w:SW-2*M,h:0.84,rectRadius:0.04,fill:{color:BERRY}});
s.addText([{text:"グランメゾンは、引き継いでも壊れない。\n",options:{fontSize:13,bold:true,color:W}},
 {text:"私たちが学んだのは、収益改善の手法ではありません。人を入れ替えず、労働環境をむしろ良くしたうえで、店は伸ばせるということです。",
  options:{fontSize:10.5,color:"EBDCE1"}}],
 {x:M+0.30,y:6.14,w:SW-2*M-0.60,h:0.68,isTextBox:true,margin:0,lineSpacing:17,valign:"middle"});
footer(s);
}

/* ===== p.13 PhaseI 扉 ===== */
{ const s=p.addSlide(); divider(s,"GROWTH STRATEGY　PHASE I","海外著名シェフとの協業","ティエリー・マルクス　―　パリでミシュラン累計7つ星"); }

/* ===== p.14 THIERRY MARX ===== */
{
const s=p.addSlide();
header(s,"THIERRY MARX","パリでミシュラン累計7つ星。「星請負人」とも呼ばれるシェフ",
  "1959年パリ20区生まれ。同世代のシェフのなかでも、著名でありかつ最も尊敬を集める一人です。");
const hist=[["1988","トゥール「ロック・アン・ヴァル」でミシュラン1つ星"],
 ["1991","ニーム「シュヴァル・ブラン」でミシュラン1つ星"],
 ["1999","メドックのルレ・エ・シャトー「コーディヤン・バージュ」でミシュラン2つ星"],
 ["2006","ゴー・エ・ミヨ シェフ・オブ・ザ・イヤー 受賞"],
 ["2010","マンダリン オリエンタル パリ「シュール・ムジュール」でミシュラン2つ星"],
 ["2013","フランス レジオン・ドヌール勲章 受章"],
 ["2022","ミシュランガイド 年間ベストメンターに選出"],
 ["2023","パリ8区サントノーレに「オノール」オープン"]];
hist.forEach((h,i)=>{
  const y=1.80+i*0.46;
  s.addText(h[0],{x:M,y:y,w:0.90,h:0.28,isTextBox:true,margin:0,fontFace:SERIF,fontSize:13,bold:true,color:GOLD});
  s.addText(h[1],{x:M+0.98,y:y,w:5.90,h:0.34,isTextBox:true,margin:0,fontFace:SANS,fontSize:10.5,color:INK,lineSpacing:14});
});
card(s,7.72,1.78,4.99,1.86,"FFFFFF");
s.addText("“",{x:7.94,y:1.80,w:0.6,h:0.5,isTextBox:true,margin:0,fontFace:SERIF,fontSize:40,color:ROSE});
s.addText("幸せな瞬間や自分へのご褒美、誰かと共有することで生まれる温かい気持ちは、私にとってすべてです。活気と刺激に満ちた雰囲気の中で、友人や家族との時間を最大限に楽しむことができる、それがレストランなのです。",
  {x:7.96,y:2.24,w:4.52,h:1.24,isTextBox:true,margin:0,fontFace:SERIF,fontSize:11.5,color:INK,lineSpacing:17});
card(s,7.72,3.78,4.99,2.36);
s.addText("現在の活動",{x:7.96,y:3.90,w:4.2,h:0.26,isTextBox:true,margin:0,fontFace:SANS,fontSize:10,bold:true,color:GOLD});
[["レストラン","マンダリン オリエンタル パリ、エッフェル塔1階「マダム・ブラッスリー」ほか"],
 ["ブーランジェリー","パリ市内5店舗。東京・渋谷にも「ティエリーマルクス ラ ブーランジェリー」"],
 ["教育・社会貢献","パリ市と「調理における職業訓練所」を設立。受刑者への料理教室と職業復帰支援"],
 ["研究","物理化学者とともに「フランス料理研究センター」を設立。国際宇宙ステーションのメニューも制作"]].forEach((k,i)=>{
  const y=4.20+i*0.48;
  s.addText(k[0],{x:7.96,y:y,w:1.35,h:0.24,isTextBox:true,margin:0,fontFace:SANS,fontSize:9.5,bold:true,color:BERRY});
  s.addText(k[1],{x:9.34,y:y-0.02,w:3.14,h:0.46,isTextBox:true,margin:0,fontFace:SANS,fontSize:8.5,color:MUTE,lineSpacing:11.5});
});
s.addText("日本再進出にあたり、当社が運営を担います。",{x:M,y:5.66,w:6.8,h:0.3,isTextBox:true,margin:0,
  fontFace:SERIF,fontSize:15,bold:true,color:BERRY});
s.addText("環境への配慮でも知られ、100%認証食品の使用、プラスチック製品の削減、ゼロ・ウェイスト宣言を実践しています。",
  {x:M,y:6.00,w:6.8,h:0.5,isTextBox:true,margin:0,fontFace:SANS,fontSize:10,color:MUTE,lineSpacing:14});
footer(s);
}

/* ===== p.15 ブラッスリー ===== */
{
const s=p.addSlide();
header(s,"BRASSERIE THIERRY MARX","ブラッスリー ティエリー・マルクス　2027年4月 開業予定",
  "東京ミッドタウン六本木。日常のなかにあるファインダイニングとして、パリのブラッスリーをそのまま持ち込みます。");
const sp=[["開業","2027年4月","東京ミッドタウン六本木"],
          ["規模","123席","183.59㎡（55.5坪）"],
          ["営業","年363日","稼働率80%を想定"],
          ["満年度売上","4.60億円","日商 約127万円"]];
sp.forEach((t,i)=>{
  const x=M+i*3.05;
  s.addShape(p.ShapeType.roundRect,{x,y:1.92,w:2.80,h:1.18,rectRadius:0.05,
    fill:{color:i===3?BERRY:TINT},line:{color:i===3?BERRY:LINE,width:0.75}});
  s.addText(t[0],{x:x+0.20,y:2.04,w:2.4,h:0.24,isTextBox:true,margin:0,fontFace:SANS,fontSize:9.5,bold:true,color:i===3?"E8D6DB":GOLD});
  s.addText(t[1],{x:x+0.20,y:2.28,w:2.5,h:0.48,isTextBox:true,margin:0,fontFace:SERIF,fontSize:23,bold:true,color:i===3?W:BERRY});
  s.addText(t[2],{x:x+0.20,y:2.76,w:2.5,h:0.24,isTextBox:true,margin:0,fontFace:SANS,fontSize:9,color:i===3?"C9AEB6":MUTE});
});
s.addText("出店計画",{x:M,y:3.28,w:5.0,h:0.28,isTextBox:true,margin:0,fontFace:SERIF,fontSize:13.5,bold:true,color:INK});
s.addTable([
 [hd("年度"),hd("出店"),hd("内容")],
 [{text:"2027年4月",options:{bold:true,fontSize:10}},{text:"六本木",options:{fontSize:10}},
  {text:"東京ミッドタウン六本木。標準店モデルとなる1号店",options:{fontSize:10}}],
 [{text:"2028年",options:{bold:true,fontSize:10}},{text:"札幌・大阪",options:{fontSize:10}},
  {text:"2店舗。当社の創業地である札幌を含む",options:{fontSize:10}}],
 [{text:"2029年",options:{bold:true,fontSize:10}},{text:"首都圏・政令指定都市",options:{fontSize:10}},{text:"―",options:{fontSize:10,color:MUTE}}],
 [{text:"2030年〜",options:{bold:true,fontSize:10,fill:{color:TINT}}},{text:"リゾート含め年2店舗",options:{fontSize:10,bold:true,fill:{color:TINT}}},
  {text:"ここから、オーベルジュ構想につながります",options:{fontSize:10,bold:true,color:BERRY,fill:{color:TINT}}}]
],tOpt({x:M,y:3.62,w:7.2,colW:[1.40,2.20,3.60],rowH:0.44,fontSize:10}));
card(s,8.02,3.28,4.69,2.78,"FFFFFF");
s.addText("なぜブラッスリーなのか",{x:8.26,y:3.40,w:4.2,h:0.26,isTextBox:true,margin:0,fontFace:SANS,fontSize:10,bold:true,color:GOLD});
s.addText("ガストロノミーが「一生に何度か」の場所だとすれば、ブラッスリーは「月に一度」の場所です。パリでは、その両方が同じ料理人の手のなかにあります。",
  {x:8.26,y:3.68,w:4.22,h:0.72,isTextBox:true,margin:0,fontFace:SANS,fontSize:10.5,color:INK,lineSpacing:15});
s.addText("当社にとっての意味",{x:8.26,y:4.50,w:4.2,h:0.26,isTextBox:true,margin:0,fontFace:SANS,fontSize:10,bold:true,color:GOLD});
[["仕入","ティエリー・マルクス氏の信頼と権威により、海外からのワイン仕入をさらに強化できます。国内でも希少ワインの割当を増やせる可能性があります。"],
 ["販売","店舗での継続的なワイン売上が見込め、レストラン／ワイン卸事業は来期売上200%まで成長する見込みです。"],
 ["認知","出店による認知拡大は、運営会社である当社そのものの認知にも波及します。"]].forEach((k,i)=>{
  const y=4.80+i*0.38;
  s.addText(k[0],{x:8.26,y:y,w:0.60,h:0.22,isTextBox:true,margin:0,fontFace:SANS,fontSize:9,bold:true,color:BERRY});
  s.addText(k[1],{x:8.90,y:y-0.02,w:3.58,h:0.40,isTextBox:true,margin:0,fontFace:SANS,fontSize:8,color:MUTE,lineSpacing:10.5});
});
s.addText("※ 数値は2026年8月提出の六本木ミッドタウン店 損益計画に準拠。",
  {x:M,y:6.22,w:12.09,h:0.26,isTextBox:true,margin:0,fontFace:SANS,fontSize:9,color:MUTE});
footer(s);
}

/* ===== p.16 PhaseII 扉 ===== */
{ const s=p.addSlide(); divider(s,"GROWTH STRATEGY　PHASE II","国内オーベルジュ構想","料理と、ワインと、滞在。三つが同じ場所にある店を。"); }

/* ===== p.17 オーベルジュ構想 ===== */
{
const s=p.addSlide();
header(s,"AUBERGE","国内オーベルジュ構想",
  "日本のワイン産地に、レストランを主役とした小規模な滞在施設をつくる構想です。ブラッスリーの出店計画（2030年以降のリゾート展開）と接続させます。");
const el=[["料理","ファインダイニング","その土地の生産者と同じテーブルにつける距離で、一日十数名だけをお迎えする。"],
 ["ワイン","産地とセラー","日本のワイン産地に置くことで、造り手と客が直接つながる場をつくる。当社のセラー機能を併設する。"],
 ["滞在","小規模宿泊","客室は10室前後。夜を跨いでいただくことで、ワインリストの幅が一気に広がる。"]];
el.forEach((t,i)=>{
  const x=M+i*4.08;
  card(s,x,1.88,3.85,2.10,"FFFFFF");
  s.addShape(p.ShapeType.roundRect,{x:x+0.24,y:2.06,w:1.1,h:0.34,rectRadius:0.04,fill:{color:BERRY}});
  s.addText(t[0],{x:x+0.24,y:2.06,w:1.1,h:0.34,isTextBox:true,margin:0,align:"center",valign:"middle",
    fontFace:SANS,fontSize:11.5,bold:true,color:W});
  s.addText(t[1],{x:x+0.24,y:2.52,w:3.4,h:0.30,isTextBox:true,margin:0,fontFace:SERIF,fontSize:15,bold:true,color:INK});
  s.addText(t[2],{x:x+0.24,y:2.88,w:3.42,h:0.96,isTextBox:true,margin:0,fontFace:SANS,fontSize:10,color:MUTE,lineSpacing:14});
});
s.addText("なぜ、当社がやるのか",{x:M,y:4.16,w:6.0,h:0.28,isTextBox:true,margin:0,fontFace:SERIF,fontSize:13.5,bold:true,color:INK});
const why=[["ワインの仕入と保管","インポーターとしての仕入力と、寺田倉庫との保管体制。オーベルジュのワインリストを、他にない厚みにできます。"],
 ["レストランの運営実績","アピシウスで、グランメゾンを壊さずに運営できることを実証しました。"],
 ["シェフのネットワーク","ティエリー・マルクス氏をはじめ、国内外の料理人とつながっています。"],
 ["創業地との縁","当社の創業地は北海道札幌です。日本のワイン産地とは、もともと近い場所にいます。"]];
why.forEach((t,i)=>{
  const x=M+(i%2)*6.19, y=4.52+Math.floor(i/2)*0.82;
  s.addShape(p.ShapeType.ellipse,{x:x,y:y+0.04,w:0.26,h:0.26,fill:{color:ROSE}});
  s.addText(String(i+1),{x:x,y:y+0.04,w:0.26,h:0.26,isTextBox:true,margin:0,align:"center",valign:"middle",
    fontFace:SANS,fontSize:10,bold:true,color:W});
  s.addText(t[0],{x:x+0.36,y:y,w:5.5,h:0.24,isTextBox:true,margin:0,fontFace:SANS,fontSize:11,bold:true,color:BERRY});
  s.addText(t[1],{x:x+0.36,y:y+0.24,w:5.50,h:0.52,isTextBox:true,margin:0,fontFace:SANS,fontSize:9.5,color:MUTE,lineSpacing:13});
});
s.addShape(p.ShapeType.roundRect,{x:M,y:6.14,w:SW-2*M,h:0.72,rectRadius:0.04,fill:{color:TINT}});
s.addText("オーベルジュは、料理人が一日の終わりまでお客様と過ごせる、数少ない業態です。都心のレストランでは決して持てない時間を、そこでは持てます。",
  {x:M+0.30,y:6.22,w:SW-2*M-0.60,h:0.56,isTextBox:true,margin:0,fontFace:SANS,fontSize:11.5,color:INK,valign:"middle"});
footer(s);
}

/* ===== p.18 締め ===== */
{
const s=p.addSlide(); s.background={color:DARK};
s.addShape(p.ShapeType.ellipse,{x:10.0,y:-3.4,w:7.6,h:7.6,fill:{color:BERRY},transparency:80});
s.addShape(p.ShapeType.ellipse,{x:-2.6,y:5.0,w:6.0,h:6.0,fill:{color:BERRY},transparency:88});
s.addText("OUR PICTURE",{x:M,y:0.42,w:10,h:0.28,isTextBox:true,margin:0,fontFace:SANS,fontSize:11,bold:true,color:GOLDL,charSpacing:2});
s.addText("点を、線にしたい。",{x:M,y:0.76,w:11,h:0.72,isTextBox:true,margin:0,fontFace:SERIF,fontSize:38,bold:true,color:W});
s.addText("日常に近いブラッスリーから、旅先のオーベルジュ、そして銀座のグランメゾンまで。私たちは、ファインダイニングを点ではなく面で支える会社になろうとしています。",
  {x:M,y:1.62,w:11.6,h:0.40,isTextBox:true,margin:0,fontFace:SANS,fontSize:13,color:"D9CBCF"});
const boxes=[["銀座","グランメゾン","アピシウス","2024年6月 〜",false],
             ["六本木","ブラッスリー","ティエリー・マルクス","2027年4月 〜",false],
             ["地方","オーベルジュ","ワイン産地","2030年 〜",false],
             ["日本の頂点","ガストロノミー","","",true]];
boxes.forEach((b,i)=>{
  const x=M+i*3.05;
  if(b[4]){
    s.addShape(p.ShapeType.roundRect,{x,y:2.32,w:2.80,h:2.00,rectRadius:0.05,
      fill:{color:DARK},line:{color:GOLDL,width:1.75,dashType:"dash"}});
  }else{
    s.addShape(p.ShapeType.roundRect,{x,y:2.32,w:2.80,h:2.00,rectRadius:0.05,
      fill:{color:CARD},line:{color:EDGE,width:0.75}});
  }
  s.addText(b[0],{x:x+0.22,y:2.48,w:2.4,h:0.24,isTextBox:true,margin:0,fontFace:SANS,fontSize:9.5,bold:true,color:GOLDL});
  s.addText(b[1],{x:x+0.22,y:2.76,w:2.4,h:0.44,isTextBox:true,margin:0,fontFace:SERIF,fontSize:19,bold:true,color:W});
  if(b[2]) s.addText(b[2],{x:x+0.22,y:3.26,w:2.4,h:0.26,isTextBox:true,margin:0,fontFace:SANS,fontSize:10.5,color:"D9CBCF"});
  if(b[3]) s.addText(b[3],{x:x+0.22,y:3.56,w:2.4,h:0.24,isTextBox:true,margin:0,fontFace:SANS,fontSize:9.5,color:"9C858B"});
  if(b[4]) s.addText("ここだけが、\nまだ埋まっていません。",{x:x+0.22,y:3.30,w:2.42,h:0.72,isTextBox:true,margin:0,
    fontFace:SANS,fontSize:11,bold:true,color:GOLDL,lineSpacing:16});
});
s.addShape(p.ShapeType.roundRect,{x:M,y:4.66,w:SW-2*M,h:1.56,rectRadius:0.05,fill:{color:CARD},line:{color:EDGE,width:0.75}});
s.addText([{text:"ワインの仕入れも、保管も、お客様も、すべてこのために使えます。\n",options:{fontSize:15,bold:true,color:W}},
 {text:"ただ一つ、私たちだけでは決して作れないものがあります。それは、長い時間をかけて一人の料理人が積み上げた、日本の頂点にあるガストロノミーです。私たちは、それを新しく作ろうとは思っていません。守り、次の世代へ渡すお手伝いがしたいと考えています。",
  options:{fontSize:11.5,color:"C9B6BC"}}],
 {x:M+0.34,y:4.80,w:SW-2*M-0.68,h:1.30,isTextBox:true,margin:0,lineSpacing:20,valign:"middle"});
footer(s,true);
}

p.writeFile({fileName:"株式会社WineBank_会社紹介_2026-09.pptx"}).then(f=>console.log("WROTE",f));
