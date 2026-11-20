# -*- coding: utf-8 -*-
"""稲葉さん修正案（11/20）と事業計画の差・課題一覧（11/20 15:00 MTG投影用）"""
import os, openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.formatting.rule import CellIsRule
OUT=os.path.join(os.path.dirname(os.path.abspath(__file__)),"人件費・売上_課題一覧_稲葉さんMTG_20261120.xlsx")
F="Meiryo"; NAVY="1F3864"; SUB="D9E2F3"; INP="EAF1FB"; KEY="FFF2CC"; GREY="F2F2F2"
thin=Side(style="thin",color="BFBFBF"); BOX=Border(left=thin,right=thin,top=thin,bottom=thin)
def st(c,size=12,bold=False,color="000000",fill=None,wrap=True,al="left",fmt=None):
    c.font=Font(name=F,size=size,bold=bold,color=color); c.border=BOX
    c.alignment=Alignment(horizontal=al,vertical="center",wrap_text=wrap)
    if fill: c.fill=PatternFill("solid",fgColor=fill)
    if fmt: c.number_format=fmt
def title(ws,text,sub,last):
    ws.merge_cells(f"A1:{last}1"); c=ws["A1"]; c.value=text
    c.font=Font(name=F,size=16,bold=True,color="FFFFFF"); c.fill=PatternFill("solid",fgColor=NAVY)
    c.alignment=Alignment(vertical="center"); ws.row_dimensions[1].height=30
    ws.merge_cells(f"A2:{last}2"); c=ws["A2"]; c.value=sub
    c.font=Font(name=F,size=10,color="595959"); c.alignment=Alignment(wrap_text=True,vertical="center"); ws.row_dimensions[2].height=30
def setup(ws):
    ws.sheet_view.showGridLines=False; ws.sheet_view.zoomScale=110
    ws.page_setup.orientation="landscape"; ws.page_setup.paperSize=ws.PAPERSIZE_A4
    ws.sheet_properties.pageSetUpPr.fitToPage=True; ws.page_setup.fitToWidth=1; ws.page_setup.fitToHeight=0
wb=openpyxl.Workbook()

# ───────── 1. 課題一覧 ─────────
ws=wb.active; ws.title="課題一覧"; setup(ws)
title(ws,"BRASSERIE Thierry Marx 六本木　人件費・売上の課題一覧（11/20 15:00 MTG）",
      "稲葉さん修正版（事業収支20261120・モデルシフト1119・平日/土日売上）と事業計画（11/9版）の比較。右の「MTGでの決定事項」「担当」「期限」「状態」をその場で埋めていきます。","K")
H=["No","区分","論点","稲葉さん案（現状）","事業計画／懸念点","影響額\n（年・百万円）","MTGで確認したいこと","MTGでの決定事項","担当","期限","状態"]
W=[5,9,20,30,32,11,34,34,9,10,9]
for i,(h,w) in enumerate(zip(H,W)):
    col=openpyxl.utils.get_column_letter(i+1); ws.column_dimensions[col].width=w
    st(ws[f"{col}4"],11,True,"FFFFFF",NAVY,al="center")
    ws[f"{col}4"].value=h
ws.row_dimensions[4].height=34
ISSUES=[
 ("売上","年商の前提",
  "満年度 4.64億円（1年目 4.18億円）",
  "事業計画は満年度 4.10億円（1年目 3.69億円）。差 +5,430万円（+13%）",
  "+54.3",
  "この売上を目標として約束できるか。根拠（類似店・平日/土日の客数）を確認"),
 ("売上","資料間の不整合",
  "事業収支は 4.64億円",
  "稲葉さんの平日・土日売上表から計算すると約 4.52億円（土日祝118日）。カフェ・テラスディナーの回転率が平日/土日の平均より高い",
  "▲11.6",
  "どちらの数字を正とするか。事業収支を平日/土日表に合わせるか"),
 ("売上","ランチ客単価",
  "5,500円（料理4,000円＋飲料1,500円）。回転率は店内 1.15→1.0 に下げた",
  "事業計画は 4,000円（料理3,000円＋飲料1,000円）。コンセプトの「日常使い・気軽さ」と合うか。平日のビジネスランチで飲料1,500円（ワイン1杯以上）が取れるか",
  "+27.7",
  "ランチのメニュー構成（何皿・価格帯）。平日と土日で単価を分けるか"),
 ("売上","カフェ（15〜17時）",
  "客単価 3,500円、回転率 0.6",
  "事業計画は 3,000円・0.5。パティシエ3名配置と17時のアペリティフ提案とはつながっている",
  "+15.2",
  "アフタヌーンの商品（ケーキ・セット・アペロ）と価格。平日 0.4〜0.5 との差"),
 ("売上","テラスのディナー",
  "回転率 0.7（年間平均）",
  "事業計画は 0.5。冬（12〜2月）・梅雨の稼働をどう見るか。ヒーター等の設備は未定",
  "+11.4",
  "季節ごとの稼働想定。冬季の運用（ヒーター・ブランケット）と設備費"),
 ("人件費","人件費の総額",
  "社員17名（キッチン11・サービス6）＋アルバイト19名＝36名。月約1,130〜1,200万円",
  "予算は 1年目 月1,060万円・3年目以降 月1,110万円（売上比 34.5%／32.5%）。人件費は人数×給与で決まり、売上が届かなくても下がらない",
  "▲15.6",
  "通常期の上限額（例：月1,100万円）を決める。売上が計画どおりの場合の1年目EBITDAは 42.6→27.0百万円"),
 ("人件費","スーシェフの勤務時間",
  "料理長・スーシェフとも毎日 9:00〜23:00（実働12時間）",
  "週5日で週60時間、月の残業約87時間。36協定の上限（月45時間）超。残業代 1人 月約28万円が未計上",
  "▲6.7",
  "スーシェフ2名の交代制（早番・遅番）にできるか。料理長（管理監督者）の休み確保"),
 ("人件費","アイドルタイムの人数",
  "15〜17時もサービス 7〜8名・キッチン 8〜9名が在店（シフトの重なり）",
  "メールでは「アフタヌーンは基本2名＋土日1名」。カフェ売上は全体の約11%",
  "要試算",
  "中抜け・休憩の取り方で在店人数を減らせるか"),
 ("人件費","キッチンとサービスの比率",
  "社員 キッチン11：サービス6。1日の労働時間 91.5h：74h",
  "飲料客単価（ディナー6,000円）を出すには、ワインを売れるサービス体制が必要",
  "－",
  "ソムリエのフリー配置とアルバイト補強で、ワイン販売とサービス品質を担保できるか"),
 ("人件費","アルバイトの社会保険",
  "キッチンアルバイト 週4日×8時間（週32時間）",
  "週30時間以上は社会保険の加入対象。会社負担 約15%が金額に入っているか",
  "▲1.6",
  "シフト時間の調整（週30時間未満）か、加入前提で計上するか"),
 ("人件費","管理監督者3名の労働時間",
  "稲葉さん・上村さん・山田さん",
  "管理監督者でも22時以降の深夜割増と労働時間の記録は必要",
  "－",
  "勤怠の記録方法（打刻）を決める"),
 ("開業前","開業前の人件費",
  "役職者は1月中、他の社員は3月中、アルバイトは引き渡し前後に入社。4月からグループ店研修",
  "全額を当社負担とすると開業までに約2,000万円。事業計画の開業準備金は 400万円（広告・採用込み）のみ",
  "▲16〜20",
  "月別の入社人数と、グループ店勤務期間の給与の負担先（BTM／各店）"),
 ("開業前","開業期の人件費",
  "開業期（〜1・2か月）は土日シフトでトレーニング。社員の金額は変わらず、アルバイトのみ増",
  "開業期の上限額と期間を決めておきたい（1年目の年間予算 1.27億円の中で）",
  "要試算",
  "開業期の月額上限（例：月1,200万円×2か月）"),
 ("採用","採用人数と時期",
  "役職者（シェフパティシエ・スーシェフ・サービス）1月、社員3月、アルバイト引き渡し前後",
  "1月に採用告知。開業時の人数を年内に確定する必要",
  "－",
  "開業時の確定人数（社員◯名・アルバイト◯名）と募集開始日"),
 ("資料","事業収支ファイルの作り",
  "10/29版をもとに前提を修正。注記は「人員26名」のまま、人件費は売上比で計算",
  "人数を増やしても人件費が変わらない作り。人数×給与の積み上げに切り替える",
  "－",
  "今日の合意内容で、当社がモデルを作り替える"),
]
for i,(kb,ron,ina,con,imp,ask) in enumerate(ISSUES):
    r=5+i
    vals=[i+1,kb,ron,ina,con,imp,ask,"","","","未"]
    for j,v in enumerate(vals):
        col=openpyxl.utils.get_column_letter(j+1); c=ws[f"{col}{r}"]; c.value=v
        st(c,11,bold=(j==2),al="center" if j in (0,1,5,8,9,10) else "left",
           fill=(KEY if j in (7,8,9,10) else None),color=("C00000" if j==5 and isinstance(v,str) and v.startswith("▲") else "000000"))
    ws.row_dimensions[r].height=78
last=4+len(ISSUES)
dv=DataValidation(type="list",formula1='"未,済,持ち帰り"',allow_blank=True); ws.add_data_validation(dv); dv.add(f"K5:K{last}")
ws.conditional_formatting.add(f"K5:K{last}",CellIsRule(operator="equal",formula=['"済"'],fill=PatternFill("solid",fgColor="C6EFCE")))
ws.conditional_formatting.add(f"K5:K{last}",CellIsRule(operator="equal",formula=['"持ち帰り"'],fill=PatternFill("solid",fgColor="FFEB9C")))
ws.freeze_panes="D5"
ws[f"A{last+2}"].value="※ 影響額は事業計画（11/9版）に対する年間の増減の目安（＋は売上増、▲は利益の減少）。人件費は稲葉さんの給与額に法定福利費（約15.5%）・交通費を加えた当社試算。"
ws[f"A{last+2}"].font=Font(name=F,size=9,color="595959")

# ───────── 2. 売上前提の比較（合意案を入力） ─────────
w2=wb.create_sheet("売上前提の比較"); setup(w2)
title(w2,"売上前提の比較（満年度・年363日）","水色の「合意案」欄を変えると、年商と右の損益シナリオ（合意案）が再計算されます。","N")
hdr=["時間帯","席数","事業計画\n席効率","事業計画\n回転率","事業計画\n客単価","事業計画\n年間売上","稲葉案\n席効率","稲葉案\n回転率","稲葉案\n客単価","稲葉案\n年間売上","合意案\n席効率","合意案\n回転率","合意案\n客単価","合意案\n年間売上"]
for j,h in enumerate(hdr):
    col=openpyxl.utils.get_column_letter(j+1); c=w2[f"{col}4"]; c.value=h
    st(c,11,True,"FFFFFF",NAVY,al="center"); w2.column_dimensions[col].width=12 if j else 22
w2.row_dimensions[4].height=36
ROWS=[("ランチ（店内）",63,.75,1.15,4000,.75,1.0,5500),("ランチ（テラス）",45,.5,1.0,4000,.5,1.0,5500),
      ("カフェ（店内）",63,.75,.5,3000,.75,.6,3500),("カフェ（テラス）",45,.5,.5,3000,.5,.6,3500),
      ("ディナー（店内）",63,.75,.9,15000,.75,.9,15000),("ディナー（テラス）",45,.5,.5,7000,.5,.7,7000)]
for i,(n,s,e1,t1,p1,e2,t2,p2) in enumerate(ROWS):
    r=5+i
    data=[n,s,e1,t1,p1,f"=B{r}*C{r}*D{r}*E{r}*363/1000000",e2,t2,p2,f"=B{r}*G{r}*H{r}*I{r}*363/1000000",
          f"=C{r}",f"=D{r}",f"=E{r}",f"=B{r}*K{r}*L{r}*M{r}*363/1000000"]
    for j,v in enumerate(data):
        col=openpyxl.utils.get_column_letter(j+1); c=w2[f"{col}{r}"]; c.value=v
        fmt={2:"0%",3:"0.00",4:"#,##0",5:"#,##0.0",6:"0%",7:"0.00",8:"#,##0",9:"#,##0.0",10:"0%",11:"0.00",12:"#,##0",13:"#,##0.0"}.get(j)
        st(c,12,al="left" if j==0 else "center",fmt=fmt,fill=(INP if j in (10,11,12) else None),bold=(j in (5,9,13)))
    w2.row_dimensions[r].height=24
r=11
st(w2[f"A{r}"],12,True,fill=GREY); w2[f"A{r}"].value="年商（満年度）"
for col in "BCDEGHIKLM": st(w2[f"{col}{r}"],12,fill=GREY)
for col in "FJN":
    st(w2[f"{col}{r}"],13,True,fill=KEY,al="center",fmt="#,##0.0"); w2[f"{col}{r}"].value=f"=SUM({col}5:{col}10)"
r=12
st(w2[f"A{r}"],11); w2[f"A{r}"].value="事業計画との差"
for col in "FJN":
    st(w2[f"{col}{r}"],11,al="center",fmt='+#,##0.0;▲#,##0.0;0'); w2[f"{col}{r}"].value=f"={col}11-$F$11"
w2["A14"].value="参考：稲葉さんの平日・土日売上表（平日 日商1,167,413円／土日祝 日商1,409,906円）から計算した年商"
w2["A14"].font=Font(name=F,size=11)
for col,lab,v in [("A","土日祝の日数",118),("B","",None)]:
    pass
w2["A15"].value="土日祝の日数"; st(w2["A15"],11)
w2["B15"].value=118; st(w2["B15"],11,al="center",fill=INP)
w2["A16"].value="年商（百万円）"; st(w2["A16"],11,True)
w2["B16"].value="=((363-B15)*1167412.5+B15*1409906.25)/1000000"; st(w2["B16"],12,True,al="center",fmt="#,##0.0",fill=KEY)
w2.freeze_panes="B5"

# ───────── 3. 人件費の試算（人数×給与） ─────────
w3=wb.create_sheet("人件費の試算"); setup(w3)
title(w3,"人件費の試算（通常期・月額・万円）","稲葉さんメール（11/14）の給与と、モデルシフト1119の人数で試算。水色の人数・月額を変えると合計が変わります。","G")
for j,(h,wd) in enumerate(zip(["部門","役割","雇用区分","人数","月額／人","月額計","備考"],[10,22,10,8,10,10,46])):
    col=openpyxl.utils.get_column_letter(j+1); c=w3[f"{col}4"]; c.value=h
    st(c,11,True,"FFFFFF",NAVY,al="center"); w3.column_dimensions[col].width=wd
L=[("キッチン","料理長（上村さん）","社員",1,65,"管理監督者"),
   ("キッチン","スーシェフ","社員",2,45,"毎日 9:00〜23:00 の想定 → 課題No.7"),
   ("キッチン","部門シェフ","社員",2,35,""),
   ("キッチン","スタッフ","社員",3,30,"シフト上のキッチン1〜5（部門シェフ含む）"),
   ("キッチン","シェフパティシエ","社員",1,45,""),
   ("キッチン","パティシエ","社員",2,32.5,"35万・30万"),
   ("サービス","支配人（稲葉さん）","社員",1,60,"管理監督者。黒字化後 70万"),
   ("サービス","シェフソムリエ（山田さん）","社員",1,60,"管理監督者"),
   ("サービス","アシスタントマネージャー","社員",1,45,""),
   ("サービス","スタッフ","社員",3,33,""),
   ("キッチン","キッチンアルバイト","アルバイト",4,21,"8時間×週4日（週32時間 → 社会保険対象）"),
   ("キッチン","洗い場・調理補助","アルバイト",4,15,"5〜6時間×週3〜4日"),
   ("サービス","早番","アルバイト",4,10,"5時間×週2〜3日"),
   ("サービス","ロング","アルバイト",3,20,"8時間×週3〜4日"),
   ("サービス","遅番","アルバイト",4,10,"5時間×週2〜3日")]
for i,(dep,role,kb,n,amt,note) in enumerate(L):
    r=5+i
    for j,v in enumerate([dep,role,kb,n,amt,f"=D{r}*E{r}",note]):
        col=openpyxl.utils.get_column_letter(j+1); c=w3[f"{col}{r}"]; c.value=v
        st(c,11,al="center" if j in (0,2,3,4,5) else "left",fill=(INP if j in (3,4) else None),fmt=("#,##0.0" if j in (4,5) else None))
r0,r1=5,4+len(L); r=r1+1
SUMS=[("社員 給与計",f'=SUMIF(C{r0}:C{r1},"社員",F{r0}:F{r1})',"社員数",f'=SUMIF(C{r0}:C{r1},"社員",D{r0}:D{r1})'),
      ("アルバイト 給与計",f'=SUMIF(C{r0}:C{r1},"アルバイト",F{r0}:F{r1})',"アルバイト数",f'=SUMIF(C{r0}:C{r1},"アルバイト",D{r0}:D{r1})')]
for k,(lab,f,lab2,f2) in enumerate(SUMS):
    rr=r+k
    w3[f"B{rr}"].value=lab; st(w3[f"B{rr}"],11,True,fill=GREY)
    w3[f"F{rr}"].value=f; st(w3[f"F{rr}"],11,True,al="center",fmt="#,##0.0",fill=GREY)
    w3[f"C{rr}"].value=lab2; st(w3[f"C{rr}"],10,fill=GREY); w3[f"D{rr}"].value=f2; st(w3[f"D{rr}"],11,al="center",fill=GREY)
rs,rp=r,r+1
ADD=[("法定福利費（社員給与×）",0.155,f"=F{rs}*E{{r}}","健康保険・厚生年金・雇用保険・労災など"),
     ("社会保険（週30h以上のアルバイト）",0.155,f"=F{r0+10}*E{{r}}","キッチンアルバイト分"),
     ("交通費（社員1人あたり）",1.5,f"=D{rs}*E{{r}}","万円／月"),
     ("交通費（アルバイト1人あたり）",0.8,f"=D{rp}*E{{r}}","万円／月"),
     ("スーシェフの残業代（人数×）",28.2,f"=D{r0+1}*E{{r}}","月87時間×時給換算×1.25（交代制にすれば0）")]
for k,(lab,rate,f,note) in enumerate(ADD):
    rr=rp+1+k
    w3[f"B{rr}"].value=lab; st(w3[f"B{rr}"],11)
    w3[f"E{rr}"].value=rate; st(w3[f"E{rr}"],11,al="center",fill=INP,fmt=("0.0%" if rate<1 else "#,##0.0"))
    w3[f"F{rr}"].value=f.format(r=rr); st(w3[f"F{rr}"],11,al="center",fmt="#,##0.0")
    w3[f"G{rr}"].value=note; st(w3[f"G{rr}"],10)
rt=rp+1+len(ADD)
w3[f"B{rt}"].value="人件費 月額合計"; st(w3[f"B{rt}"],13,True,fill=KEY)
w3[f"F{rt}"].value=f"=SUM(F{rs}:F{rt-1})"; st(w3[f"F{rt}"],14,True,al="center",fmt="#,##0",fill=KEY)
w3[f"C{rt}"].value="人数計"; st(w3[f"C{rt}"],10,fill=KEY); w3[f"D{rt}"].value=f"=D{rs}+D{rp}"; st(w3[f"D{rt}"],12,True,al="center",fill=KEY)
for k,(lab,v) in enumerate([("予算 1年目（月額）",1060),("予算 3年目以降（月額）",1110)]):
    rr=rt+2+k
    w3[f"B{rr}"].value=lab; st(w3[f"B{rr}"],11)
    w3[f"F{rr}"].value=v; st(w3[f"F{rr}"],11,al="center",fmt="#,##0")
    w3[f"G{rr}"].value=f'=IF(F{rt}>F{rr},"予算超過 月"&TEXT(F{rt}-F{rr},"#,##0")&"万円","予算内")'; st(w3[f"G{rr}"],11,True,color="C00000")
LAB_ROW=rt

# ───────── 4. 損益シナリオ ─────────
w4=wb.create_sheet("損益シナリオ"); setup(w4)
title(w4,"損益シナリオ（百万円）","人件費以外の経費率は事業計画どおり。EBITDA＝売上×(1−変動費率)−人件費−固定家賃26.6−歩合家賃（年商3.314億円超の7%）。","I")
for j,(h,wd) in enumerate(zip(["ケース","売上\n1年目","売上\n3年目以降","人件費\n1年目","人件費\n3年目以降","人件費率\n1年目","EBITDA\n1年目","EBITDA\n3年目以降","営業利益\n1年目"],[40,11,11,11,11,11,11,11,11])):
    col=openpyxl.utils.get_column_letter(j+1); c=w4[f"{col}4"]; c.value=h
    st(c,11,True,"FFFFFF",NAVY,al="center"); w4.column_dimensions[col].width=wd
w4.row_dimensions[4].height=36
LABM=f"'人件費の試算'!F{LAB_ROW}*12/100"
CASES=[("A. 事業計画（人件費は売上比 34.5%／32.5%）","='売上前提の比較'!F11*0.9","='売上前提の比較'!F11","=B{r}*0.345","=C{r}*0.325"),
       ("B. 稲葉案（人件費は売上比のまま）","='売上前提の比較'!J11*0.9","='売上前提の比較'!J11","=B{r}*0.345","=C{r}*0.325"),
       ("C. 事業計画の売上 × 稲葉さんの人員","='売上前提の比較'!F11*0.9","='売上前提の比較'!F11","="+LABM,"="+LABM),
       ("D. 平日・土日表の売上 × 稲葉さんの人員","='売上前提の比較'!B16*0.9","='売上前提の比較'!B16","="+LABM,"="+LABM),
       ("E. 合意案（売上前提の比較の水色欄 × 人件費の試算）","='売上前提の比較'!N11*0.9","='売上前提の比較'!N11","="+LABM,"="+LABM)]
for i,(n,s1,s3,l1,l3) in enumerate(CASES):
    r=5+i
    vals=[n,s1,s3,l1.format(r=r),l3.format(r=r),f"=IF(B{r}=0,0,D{r}/B{r})",
          f"=B{r}*(1-0.460)-D{r}-26.64-MAX(0,B{r}-331.4)*0.07",
          f"=C{r}*(1-0.452)-E{r}-26.64-MAX(0,C{r}-331.4)*0.07",f"=G{r}-20.825"]
    for j,v in enumerate(vals):
        col=openpyxl.utils.get_column_letter(j+1); c=w4[f"{col}{r}"]; c.value=v
        st(c,12,bold=(j in (0,6,7)),al="left" if j==0 else "center",fmt=("0.0%" if j==5 else "#,##0.0"),
           fill=(KEY if (i==4 or j in (6,7)) else None))
    w4.row_dimensions[r].height=30
w4["A11"].value="※ 1年目の売上は満年度×立上り率90%。稲葉さんの人員の人件費は「人件費の試算」シートの月額合計×12。"
w4["A11"].font=Font(name=F,size=9,color="595959")

wb.calculation.fullCalcOnLoad=True
wb.save(OUT); print("saved",OUT)
