const d=require("docx");
const {Document,Packer,Paragraph,TextRun,AlignmentType,Table,TableRow,TableCell,WidthType,ShadingType,BorderStyle,Footer,PageNumber}=d;
const F={ascii:"Century",eastAsia:"ＭＳ 明朝",hAnsi:"Century"};
const FG={ascii:"Arial",eastAsia:"ＭＳ ゴシック",hAnsi:"Arial"};
const GREY="595959",LINE="BFBFBF",BERRY="6D2E46",RED="9B2C2C",TINT="F7F3F4";

const P=(t,o={})=>new Paragraph({alignment:o.align,spacing:{before:o.before??0,after:o.after??100,line:o.line??280},
  indent:o.indent,children:[new TextRun({text:t,font:o.g?FG:F,size:o.size??20,bold:o.b,color:o.c})]});
const Rich=(runs,o={})=>new Paragraph({alignment:o.align,spacing:{before:o.before??0,after:o.after??100,line:o.line??280},
  indent:o.indent,children:runs.map(r=>new TextRun({text:r.t,font:r.g?FG:F,size:r.size??20,bold:r.b,color:r.c}))});
const H1=t=>new Paragraph({spacing:{before:320,after:150,line:280},
  border:{bottom:{style:BorderStyle.SINGLE,size:8,color:BERRY,space:4}},
  children:[new TextRun({text:t,font:FG,size:23,bold:true,color:BERRY})]});
const H2=(t,time)=>new Paragraph({spacing:{before:200,after:90,line:280},
  children:[new TextRun({text:t,font:FG,size:20,bold:true})].concat(
    time?[new TextRun({text:"　"+time,font:FG,size:17,color:GREY})]:[])});
const Q=(n,t,note)=>new Paragraph({spacing:{after:80,line:290},indent:{left:440,hanging:440},
  children:[new TextRun({text:"□ "+n+"　",font:FG,size:19,bold:true,color:BERRY}),
            new TextRun({text:t,font:F,size:20})].concat(
    note?[new TextRun({text:"　― "+note,font:F,size:18,color:GREY})]:[])});
const BUL=(t,o={})=>new Paragraph({spacing:{after:60,line:280},indent:{left:o.l??360,hanging:200},
  children:[new TextRun({text:"・"+t,font:F,size:o.size??20,color:o.c})]});
const GAP=(h=100)=>new Paragraph({spacing:{after:h},children:[]});
function callout(text,fill){
  return new Table({columnWidths:[9200],width:{size:9200,type:WidthType.DXA},
   borders:{top:{style:BorderStyle.SINGLE,size:4,color:LINE},left:{style:BorderStyle.SINGLE,size:4,color:LINE},
            bottom:{style:BorderStyle.SINGLE,size:4,color:LINE},right:{style:BorderStyle.SINGLE,size:4,color:LINE},
            insideHorizontal:{style:BorderStyle.NONE},insideVertical:{style:BorderStyle.NONE}},
   rows:[new TableRow({cantSplit:true,children:[new TableCell({width:{size:9200,type:WidthType.DXA},
     shading:{type:ShadingType.CLEAR,fill:fill||TINT,color:"auto"},margins:{top:110,left:150,bottom:110,right:150},
     children:[new Paragraph({spacing:{after:0,line:290},
       children:[new TextRun({text:text,font:F,size:20})]})]})]})]});
}
const b=[];

/* ============ 表題 ============ */
b.push(P("2026年9月22日（火）11:00〜12:00",{align:AlignmentType.RIGHT,size:19,c:GREY,after:60}));
b.push(new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:60,line:360},
  children:[new TextRun({text:"岸田 周三 氏 面談　進行メモ",font:FG,size:30,bold:true})]}));
b.push(P("10分 当社よりご説明　→　10分 岸田氏よりご説明　→　40分 フリーディスカッション",
  {align:AlignmentType.CENTER,size:19,c:GREY,after:260}));

b.push(callout("この面談の目的は、価格交渉でも情報収集でもありません。岸田氏が「この人たちに託せるか」を判断する場です。3社が最終候補に残っており、価格は各社ほぼ同じ水準に収れんします。決め手は誰に託すかであり、それは40分のフリーディスカッションで決まります。聞く7割、話す3割で臨んでください。"));

/* ============ 1. 冒頭10分 ============ */
b.push(H1("1.　冒頭10分のご説明"));
b.push(P("結論から入り、シナジーの前に「後継」を置きます。岸田氏が最も知りたいのは、店の将来と働く人たちのことです。ワインの話から入ると、自社の都合を語っているように聞こえます。",{c:GREY,size:19,after:160}));

b.push(H2("(1) 当社について","2分"));
b.push(BUL("高級ワインの保管・売買・オークション運営、ワインEC、会員向けセラーサービス。ワインを軸に富裕層のお客様と向き合ってきた会社です。"));
b.push(BUL("2024年6月、東京・銀座で創業40年を超えるグランメゾン「アピシウス」を取得し、現在まで運営しています。"));
b.push(BUL("2027年4月、ティエリー・マルクス氏監修のレストランを開業予定です。"));
b.push(GAP(80));
b.push(callout("アピシウスの2年間を、数字で一度だけ言い切る。　39年間赤字が続き40年目にようやく黒字化した店を引き継ぎ、2年で売上30%増・営業利益250%超の増加。幹部メンバーは全員継続。サービス残業を撤廃し、12月を除き残業が発生しない体制にした。店内は一部改装したが、業態も客層も変えていない。"));

b.push(H2("(2) なぜカンテサンスなのか","2分"));
b.push(BUL("19年連続で三つ星を保持されている店は、東京に3軒しかありません。その事実の重みを理解しているつもりです。"));
b.push(BUL("当社にとってカンテサンスは、収益のために取得する事業であると同時に、日本の食文化として残すべきものだと考えています。"));
b.push(BUL("20年間、一度も減収減益なく、無借金でここまで来られた経営に敬意を持っています。"));

b.push(H2("(3) 想定しているシナジー","4分"));
b.push(P("この順番で話す。①が岸田氏にとって最大の関心事であり、当社が他社に対して唯一明確に優位な点です。",{c:GREY,size:19,after:120}));

b.push(Rich([{t:"① 後継料理長の招聘　",g:true,b:true,size:20,c:BERRY},
  {t:"当社はティエリー・マルクス氏およびフランス本国のシェフネットワークを持ち、アピシウスで現にグランメゾンを運営しています。料理人の世界のネットワークを、実務として持っている会社です。ただし候補者の適否は岸田さんのご判断を最優先にします。",size:20}],{indent:{left:360},after:120}));

b.push(Rich([{t:"② 働く方々の環境　",g:true,b:true,size:20,c:BERRY},
  {t:"22名の皆さまの雇用と処遇はそのまま承継し、譲受を理由とする不利益な変更は行いません。アピシウスでサービス残業を撤廃した経験を、こちらでも同じように活かします。方針ではなく実績としてお話しできます。",size:20}],{indent:{left:360},after:120}));

b.push(Rich([{t:"③ ワイン　",g:true,b:true,size:20,c:BERRY},
  {t:"サントリー様・ファインズ様との直接のお取引はそのまま維持していただきます。当社が仕入の中間に入って原価を上げることは一切考えていません。当社が補えるのは、正規ルートでは手に入らないバックヴィンテージや、二次流通・オークションで出てくる希少銘柄です。リストを厚くする方向でのみお手伝いします。",size:20}],{indent:{left:360},after:120}));

b.push(Rich([{t:"④ お客様の情報　",g:true,b:true,size:20,c:BERRY},
  {t:"現在は紙の伝票で管理されているご来店・ご注文の記録を、デジタル化して店の資産にします。記念日や好みに応じたご提案ができるようになります。現場のオペレーションは変えません。",size:20}],{indent:{left:360},after:120}));

b.push(Rich([{t:"⑤ カンテサンスプラス　",g:true,b:true,size:20,c:BERRY},
  {t:"高級スイーツECについて、当社のEC運営基盤と顧客基盤を活用した販路拡大が可能です。",size:20}],{indent:{left:360},after:160}));

b.push(Rich([{t:"当社側の利点も、隠さずに言う。　",g:true,b:true,size:20},
  {t:"「当社にとっても、高級ワインの確かな出口と、富裕層のお客様との接点が得られます。一方的にお願いする話ではなく、双方に意味がある組み合わせだと考えています」。自社の利益を隠す相手は信用されません。",size:20}],{indent:{left:360},after:160}));

b.push(H2("(4) やらないこと","2分"));
b.push(P("ここが最も効きます。他2社は「横展開でリターンを出す」と話すはずです。岸田氏が最も恐れているのはそれです。",{c:GREY,size:19,after:120}));
b.push(BUL("多店舗展開はしません。カジュアル業態への展開も、岸田さんが納得される形でしか検討しません。"));
b.push(BUL("業態と客層を変えません。"));
b.push(BUL("原価と人件費を削って利益を作ることはしません。"));
b.push(BUL("仕入先を変えません。"));
b.push(BUL("人を入れ替えません。厨房とサービスの現場に、当社から人を送り込むことはしません。"));
b.push(GAP(60));
b.push(P("締め方：「アピシウスで、そのいずれも実際にやっていません。だから方針ではなく、実績としてお約束できます。」",{c:BERRY,b:true,size:20,indent:{left:360}}));

/* ============ 2. フリーディスカッション ============ */
b.push(new Paragraph({children:[new d.PageBreak()]}));
b.push(H1("2.　フリーディスカッション40分で聞くこと"));
b.push(callout("仲介経由で既にご回答いただいている事項（譲渡理由、3年間毎日厨房に立たれること、3年後は新店舗を考えていないこと、在籍5名は料理長を任せられるタイプではないこと、選定基準）は、繰り返し聞かない。「伺っております」と前置きして、その先を聞く。同じことを聞くと、話を聞いていない相手だと思われます。",TINT));

b.push(H2("A.　後継","15分／最重要"));
b.push(Q("A-1","卒業生に戻っていただく前提と伺いました。具体的にどなたを想定されていますか。","名前が出るかどうかで、この案件の確度が変わる"));
b.push(Q("A-2","その方には、もうお声がけされていますか。","未接触なら、3年は決して長くない"));
b.push(Q("A-3","その方が戻るとしたら、何が条件になるとお考えですか。","報酬・裁量・資本参加・時期。ここが買主の宿題になる"));
b.push(Q("A-4","後継の方を、岸田さんご自身が口説いてくださいますか。","この面談で最も重要な質問。岸田氏が口説けば来る、買主が口説いても来ない"));
b.push(Q("A-5","3年のうちに後継の方が決まらなかった場合、岸田さんはどうなさるおつもりですか。","延長の余地があるのか、店を閉じる選択肢を持っているのか"));
b.push(Q("A-6","「カンテサンス」という名前は、後継の方が引き継ぐべきものですか。それとも岸田さんとともに終えるべきものだとお考えですか。","最も重い質問。会話が温まってから。答え方で3年後が見える"));

b.push(H2("B.　3年間の関わり方","8分"));
b.push(Q("B-1","3年間、経営のどの部分を引き受けてほしいとお考えですか。逆に、触ってほしくないのはどこですか。","線引きを岸田氏の言葉で定義してもらう"));
b.push(Q("B-2","採用・評価・給与の決定は、どちらが持つのが良いとお考えですか。","人事権の所在。後継招聘にも直結する"));
b.push(Q("B-3","3年が経った後のご関与について、今の時点でのご希望はありますか。","仲介回答では「他店の監修はあり得る」。その先の本音"));

b.push(H2("C.　店のこと","10分"));
b.push(Q("C-1","22名の皆さまには、いつ、どのようにお伝えになるおつもりですか。","実務上きわめて重要。発表の瞬間に辞める人が出るのがこの業界"));
b.push(Q("C-2","サントリー様やファインズ様からの配分は、お店に対してのものですか、岸田さんに対してのものですか。","当社にしか聞けない質問。専門性を示せる"));
b.push(Q("C-3","ワインリストで、本当はやりたいけれど今はできていないことはありますか。","当社が具体的に貢献できる点を引き出す"));
b.push(Q("C-4","設備で手を入れたいと思っておられるところはありますか。","投資余力があることを示せる。アピシウスでも改装した"));
b.push(Q("C-5","予約が取りにくい状態について、どうお感じですか。席数や回転を増やすお考えはありますか。","収益改善の余地を岸田氏側から語ってもらう。こちらから言うと減点"));

b.push(H2("D.　子会社・関連","4分"));
b.push(Q("D-1","カンテサンスプラスの高級スイーツECは、今後どうしていきたいとお考えですか。"));
b.push(Q("D-2","株式会社BISが今回の対象外となっている背景を伺えますか。名古屋の監修は続けられますか。","競業避止の設計に直結する"));

b.push(H2("E.　締め","3分"));
b.push(Q("E-1","本日伺ったことを意向表明書に反映します。提出後、もう一度お時間をいただけますか。","次につなげる。これを言わずに終わらない"));

/* ============ 3. 聞いてはいけないこと ============ */
b.push(H1("3.　この場で聞いてはいけないこと"));
b.push(BUL("価格の交渉　―　仲介経由で行う。この場で価格に触れた瞬間に、話の性質が変わる。",{c:RED}));
b.push(BUL("他の2社のこと　―　聞いても答えは得られず、気にしている印象だけが残る。",{c:RED}));
b.push(BUL("原価率・人件費の改善余地　―　コストカットの匂いを出した時点で負ける。",{c:RED}));
b.push(BUL("「星が落ちたら」の繰り返し　―　一度も言わないのが正解。",{c:RED}));
b.push(BUL("役員貸付金5億円の精算、賃貸借契約、株主名簿　―　事務。仲介経由で処理する。",{c:RED}));
b.push(BUL("相続・税金の話　―　岸田氏から出てこない限り触れない。",{c:RED}));

/* ============ 4. 40分に足りない場合 ============ */
b.push(H1("4.　時間が足りない場合、この6問だけは必ず"));
b.push(P("A-1　卒業生の中で、具体的にどなたを想定されていますか",{size:20,indent:{left:360}}));
b.push(P("A-4　後継の方を、岸田さんご自身が口説いてくださいますか",{size:20,b:true,indent:{left:360}}));
b.push(P("A-6　「カンテサンス」の名前は、引き継ぐべきものですか",{size:20,indent:{left:360}}));
b.push(P("B-1　経営のどこを引き受けてほしく、どこを触ってほしくないですか",{size:20,indent:{left:360}}));
b.push(P("C-1　22名の皆さまには、いつ、どうお伝えになりますか",{size:20,indent:{left:360}}));
b.push(P("C-2　仕入先からの配分は、お店に対してですか、岸田さんに対してですか",{size:20,indent:{left:360},after:200}));
b.push(callout("面談の成果は「印象」ではなく「A-4に岸田氏が何と答えたか」で測る。ここが前向きなら、後継リスクの見積もりが大きく変わり、価格レンジの上限を使う判断ができます。"));

const doc=new Document({
  styles:{default:{document:{run:{font:F,size:20,color:"000000"}}}},
  sections:[{properties:{page:{margin:{top:1300,right:1250,bottom:1300,left:1250}}},
    footers:{default:new Footer({children:[new Paragraph({alignment:AlignmentType.CENTER,
      children:[new TextRun({children:["－ ",PageNumber.CURRENT," －"],font:F,size:17,color:GREY})]})]})},
    children:b}]
});
Packer.toBuffer(doc).then(x=>require("fs").writeFileSync("岸田周三氏_面談進行メモ.docx",x)).then(()=>console.log("WROTE"));
