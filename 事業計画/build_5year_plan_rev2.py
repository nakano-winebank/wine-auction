# -*- coding: utf-8 -*-
"""ティエリーマルクス・ブラッスリー 5か年事業計画 rev2（FY2027-FY2031）
   六本木店 事業収支 rev2（2026年10月改定）の単店economicsに基づく。"""
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side

OUT = "/home/user/wine-auction/事業計画/ティエリーマルクス・ブラッスリー_5か年事業計画_FY2027-2031_rev2.xlsx"
JP="Meiryo"; BLUE,BLACK,GREEN,RED="0000FF","000000","008000","C00000"
HDR=PatternFill("solid",fgColor="1F3864"); SUB=PatternFill("solid",fgColor="D9E2F3")
TOT=PatternFill("solid",fgColor="F2F2F2"); KEY=PatternFill("solid",fgColor="FFFF00")
INP=PatternFill("solid",fgColor="EAF1FB")
thin=Side(style="thin",color="BFBFBF"); BOX=Border(left=thin,right=thin,top=thin,bottom=thin)
MM='#,##0.0;(#,##0.0);-'; MM0='#,##0;(#,##0);-'; PCT='0.0%;(0.0%);-'; NUM='#,##0.0;(#,##0.0);-'

YEARS=["FY2027","FY2028","FY2029","FY2030","FY2031"]
YC=["C","D","E","F","G"]; PC=["B","C","D","E","F"]
VAR=[("売上原価",0.300,0.300,0.300,"料理30.0%・飲料30.0%（2026年10月改定。原価改善は織り込まず）"),
     ("人件費",0.345,0.335,0.325,"本部集中化・多能工化"),
     ("業務委託費・消耗品他",0.024,0.022,0.020,"本部集中購買・規格統一"),
     ("広告宣伝費・販売促進費",0.014,0.014,0.014,"据置"),
     ("その他経費",0.005,0.005,0.005,"据置"),
     ("水道光熱費",0.040,0.038,0.036,"高効率厨房機器・営業時間最適化"),
     ("ロイヤリティ",0.040,0.040,0.040,"契約条件（ブラッスリー4.0%）"),
     ("保険・租税公課",0.007,0.007,0.007,"据置"),
     ("修繕維持費（FFE）",0.025,0.025,0.025,"据置")]
V_TOP=19; V_BTM=V_TOP+len(VAR)-1          # 19..27
R_VSUM=V_BTM+1                            # 28
R_REV_BASE,R_R1,R_R2,R_R3,R_MON_NEW,R_MON_TKY = 5,6,7,8,9,10
R_RENT,R_PCTR,R_THR = 13,14,15
R_INV0=32; R_INVTOT,R_DEPBASE,R_DEPYR,R_DEPRE = 37,38,39,40
R_DEF,R_CASH,R_PAY = 43,44,45
R_OPEN,R_STORES,R_HQ = 49,50,51
PL_ORDER=[("売上原価","var",0),("人件費","var",1),("業務委託費・消耗品他","var",2),
          ("部門利益","sub_dept",None),("広告宣伝費・販売促進費","var",3),("その他経費","var",4),
          ("水道光熱費","var",5),("GOP（店舗営業総利益）","sub_gop",None),
          ("ロイヤリティ","var",6),("保険・租税公課","var",7),
          ("地代家賃（固定）","rent_fix",None),("歩合家賃","rent_pct",None),
          ("修繕維持費（FFE）","var",8)]

wb=openpyxl.Workbook()
def S(ws,cell,*,bold=False,color=BLACK,fmt=None,fill=None,align=None,size=10,border=False,wrap=False):
    c=ws[cell]; c.font=Font(name=JP,bold=bold,color=color,size=size)
    if fmt: c.number_format=fmt
    if fill: c.fill=fill
    if align or wrap: c.alignment=Alignment(horizontal=align,vertical="center",wrap_text=wrap)
    if border: c.border=BOX
    return c
def band(ws,row,text,last,fill=HDR,color="FFFFFF",size=11):
    ws.cell(row=row,column=1,value=text)
    for col in range(1,openpyxl.utils.column_index_from_string(last)+1):
        c=ws.cell(row=row,column=col); c.fill=fill
        c.font=Font(name=JP,bold=True,color=color,size=size)
def sec(ws,row,text,last): band(ws,row,text,last,fill=SUB,color="000000",size=10)

# ───── 前提条件 ─────
ws=wb.create_sheet("前提条件"); ws.sheet_view.showGridLines=False
ws.column_dimensions["A"].width=34
for c in "BCDEF": ws.column_dimensions[c].width=14
ws.column_dimensions["G"].width=3; ws.column_dimensions["H"].width=52
band(ws,1,"前提条件　／　六本木店 事業収支 rev2（2026年10月改定）に基づく","F")
S(ws,"A2",size=9,color="7F7F7F")
ws["A2"]="青字＝入力値。標準店の経済性は六本木モデルrev2（115席・店内席効率75%・ディナー回転率0.90）と同一。"
sec(ws,4,"■ 事業前提（標準店モデル）","F")
for i,(lab,v,f,note) in enumerate([
    ("標準店　満年度 売上高",428.63,NUM,"六本木モデルrev2の満年度年商。旧計画は460.0"),
    ("立上り率　1年目",0.90,PCT,""),("立上り率　2年目",0.98,PCT,""),
    ("立上り率　3年目以降",1.00,PCT,"満年度水準"),
    ("新店の開業年度 稼働月数",7.5,NUM,"年2店を上期・下期に分散出店する前提の平均値"),
    ("東京1号店の稼働月数（FY2027）",12.0,NUM,"2027年4月開業＝FY2027は通年稼働")]):
    r=5+i
    S(ws,f"A{r}"); ws[f"A{r}"]=lab
    S(ws,f"B{r}",color=BLUE,fmt=f,border=True,align="center",fill=INP); ws[f"B{r}"]=v
    S(ws,f"H{r}",size=9,color="7F7F7F"); ws[f"H{r}"]=note
sec(ws,12,"■ 家賃条件（全店共通）","F")
for i,(lab,v,f,note) in enumerate([
    ("地代家賃（固定）年額",26.64,NUM,"月222万円×12"),
    ("歩合家賃率",0.07,PCT,"閾値超過分に対して7%"),
    ("歩合家賃 閾値（年商）",331.4,NUM,"提出P&L時点の水準")]):
    r=13+i
    S(ws,f"A{r}"); ws[f"A{r}"]=lab
    S(ws,f"B{r}",color=BLUE,fmt=f,border=True,align="center",fill=INP); ws[f"B{r}"]=v
    S(ws,f"H{r}",size=9,color="7F7F7F"); ws[f"H{r}"]=note
sec(ws,17,"■ 経費率（対売上高）","F")
for c,t in zip(["A","B","C","D","H"],["費　目","1年目\n（提出P&L水準）","2年目","3年目以降","備考"]):
    S(ws,f"{c}18",bold=True,border=True,fill=TOT,align="center",size=9,wrap=True); ws[f"{c}18"]=t
ws.row_dimensions[18].height=32
for i,(lab,a,b,c_,note) in enumerate(VAR):
    r=V_TOP+i
    S(ws,f"A{r}",border=True); ws[f"A{r}"]=lab
    for col,v in zip("BCD",[a,b,c_]):
        S(ws,f"{col}{r}",color=BLUE,fmt=PCT,border=True,align="center",fill=INP); ws[f"{col}{r}"]=v
    S(ws,f"H{r}",size=9,color="7F7F7F"); ws[f"H{r}"]=note
S(ws,f"A{R_VSUM}",bold=True,border=True); ws[f"A{R_VSUM}"]="変動費　計（対売上）"
for col in "BCD":
    S(ws,f"{col}{R_VSUM}",bold=True,fmt=PCT,border=True,align="center",fill=TOT)
    ws[f"{col}{R_VSUM}"]=f"=SUM({col}{V_TOP}:{col}{V_BTM})"
sec(ws,30,"■ 初期投資（1店舗あたり・百万円）","F")
S(ws,"A31",bold=True,border=True,fill=TOT); ws["A31"]="項　目"
S(ws,"B31",bold=True,border=True,fill=TOT,align="center",size=9,wrap=True); ws["B31"]="1号店\n(六本木)"
S(ws,"C31",bold=True,border=True,fill=TOT,align="center",size=9,wrap=True); ws["C31"]="2〜3号店\n(札幌・大阪)"
S(ws,"D31",bold=True,border=True,fill=TOT,align="center",size=9,wrap=True); ws["D31"]="4号店以降"
ws.row_dimensions[31].height=28
for i,(lab,a,b,c3,note) in enumerate([
    ("契約金",10.0,10.0,5.0,"契約金 3店舗3,000万円／以下7店舗3,500万円"),
    ("事業費（設計・内装施工・OSE/FF&E）",194.25,194.25,194.25,"55.5坪×350万"),
    ("開業準備金（広告・採用等）",4.0,4.0,4.0,""),
    ("保証金",39.0,39.0,39.0,"非償却・退去時返還対象"),
    ("ワイン・美術品在庫",50.0,10.0,10.0,"1号店は美術品を含む。2号店以降はワイン1,000万円のみ（非償却）")]):
    r=R_INV0+i
    S(ws,f"A{r}",border=True); ws[f"A{r}"]=lab
    for col,v in zip("BCD",[a,b,c3]):
        S(ws,f"{col}{r}",color=BLUE,fmt=NUM,border=True,align="center",fill=INP); ws[f"{col}{r}"]=v
    S(ws,f"H{r}",size=9,color="7F7F7F"); ws[f"H{r}"]=note
S(ws,f"A{R_INVTOT}",bold=True,border=True); ws[f"A{R_INVTOT}"]="初期投資　合計"
S(ws,f"A{R_DEPBASE}",bold=True,border=True); ws[f"A{R_DEPBASE}"]="償却対象資産（＝合計－保証金－ワイン・美術品在庫）"
S(ws,f"A{R_DEPYR}",border=True); ws[f"A{R_DEPYR}"]="償却年数（年）"
S(ws,f"A{R_DEPRE}",bold=True,border=True); ws[f"A{R_DEPRE}"]="年間減価償却費／1店（通年）"
for col in "BCD":
    S(ws,f"{col}{R_INVTOT}",bold=True,fmt=NUM,border=True,align="center",fill=KEY)
    ws[f"{col}{R_INVTOT}"]=f"=SUM({col}{R_INV0}:{col}{R_INV0+4})"
    S(ws,f"{col}{R_DEPBASE}",bold=True,fmt=NUM,border=True,align="center",fill=TOT)
    ws[f"{col}{R_DEPBASE}"]=f"={col}{R_INVTOT}-{col}{R_INV0+3}-{col}{R_INV0+4}"
    S(ws,f"{col}{R_DEPYR}",color=BLUE,fmt=NUM,border=True,align="center",fill=INP); ws[f"{col}{R_DEPYR}"]=10.0
    S(ws,f"{col}{R_DEPRE}",bold=True,fmt=NUM,border=True,align="center",fill=TOT)
    ws[f"{col}{R_DEPRE}"]=f"={col}{R_DEPBASE}/{col}{R_DEPYR}"
S(ws,f"H{R_DEPBASE}",size=9,color=RED)
ws[f"H{R_DEPBASE}"]="ワイン在庫は棚卸資産、美術品は取得価額100万円以上なら原則非償却のため除外"
sec(ws,42,"■ 分割払いスキーム（百万円）","F")
S(ws,f"A{R_DEF}"); ws[f"A{R_DEF}"]="分割対象額（内装100＋保証金38.9）"
S(ws,f"B{R_DEF}",color=BLUE,fmt=NUM,border=True,align="center",fill=INP); ws[f"B{R_DEF}"]=138.9
S(ws,f"A{R_CASH}",bold=True); ws[f"A{R_CASH}"]="開業時 現金支出／1店"
for col in "BCD":
    S(ws,f"{col}{R_CASH}",bold=True,fmt=NUM,border=True,align="center",fill=TOT)
    ws[f"{col}{R_CASH}"]=f"={col}{R_INVTOT}-$B${R_DEF}"
S(ws,f"A{R_PAY}"); ws[f"A{R_PAY}"]="年間分割弁済額／1店"
S(ws,f"B{R_PAY}",color=BLUE,fmt=NUM,border=True,align="center",fill=INP); ws[f"B{R_PAY}"]=15.6
sec(ws,47,"■ 出店計画・本部費（連結）","F")
S(ws,"A48",bold=True,border=True,fill=TOT); ws["A48"]="項　目"
for i,y in enumerate(YEARS):
    S(ws,f"{PC[i]}48",bold=True,border=True,fill=TOT,align="center"); ws[f"{PC[i]}48"]=y
S(ws,f"A{R_OPEN}"); ws[f"A{R_OPEN}"]="期中出店数（店）"
S(ws,f"A{R_STORES}",bold=True); ws[f"A{R_STORES}"]="期末店舗数（店）"
S(ws,f"A{R_HQ}"); ws[f"A{R_HQ}"]="本部費（管理・人事・購買・マーケ）"
for i,cl in enumerate(PC):
    S(ws,f"{cl}{R_OPEN}",color=BLUE,fmt=MM0,border=True,align="center",fill=INP)
    ws[f"{cl}{R_OPEN}"]=[1,2,2,2,2][i]
    S(ws,f"{cl}{R_STORES}",bold=True,fmt=MM0,border=True,align="center",fill=TOT)
    ws[f"{cl}{R_STORES}"]=f"={cl}{R_OPEN}" if i==0 else f"={PC[i-1]}{R_STORES}+{cl}{R_OPEN}"
    S(ws,f"{cl}{R_HQ}",color=BLUE,fmt=NUM,border=True,align="center",fill=INP)
    ws[f"{cl}{R_HQ}"]=[15.0,28.0,40.0,48.0,55.0][i]
S(ws,f"H{R_OPEN}",size=9,color="7F7F7F")
ws[f"H{R_OPEN}"]="FY2027 六本木／FY2028 札幌・大阪／FY2029 首都圏・他政令指定都市／FY2030以降 リゾート含め年2店"
print("前提条件 OK")

# ───── 店舗群別PL ─────
ws2=wb.create_sheet("店舗群別PL"); ws2.sheet_view.showGridLines=False
ws2.column_dimensions["A"].width=30; ws2.column_dimensions["B"].width=11
for c in YC: ws2.column_dimensions[c].width=13
band(ws2,1,"店舗群（出店年度コホート）別PL（百万円）","G")
S(ws2,"A2",size=9,color="7F7F7F")
ws2["A2"]="年次（1/2/3）に応じて前提条件の立上り率・経費率を自動参照。地代家賃と歩合家賃の閾値は稼働月数で按分。"
S(ws2,"A3",bold=True,border=True,fill=TOT); ws2["A3"]="店舗群"
S(ws2,"B3",bold=True,border=True,fill=TOT,align="center"); ws2["B3"]="店舗数"
for i,y in enumerate(YEARS):
    S(ws2,f"{YC[i]}3",bold=True,border=True,fill=TOT,align="center"); ws2[f"{YC[i]}3"]=y
COHORTS=[("① 東京（六本木ミッドタウン）",1,f"$B${R_MON_TKY}","B",[1,2,3,3,3]),
         ("② 札幌・大阪",2,f"$B${R_MON_NEW}","C",[0,1,2,3,3]),
         ("③ 首都圏・他政令指定都市",2,f"$B${R_MON_NEW}","D",[0,0,1,2,3]),
         ("④ FY2030出店（リゾート含む）",2,f"$B${R_MON_NEW}","D",[0,0,0,1,2]),
         ("⑤ FY2031出店（リゾート含む）",2,f"$B${R_MON_NEW}","D",[0,0,0,0,1])]
blocks=[]; r=5
for name,n,mref,invcol,yidx in COHORTS:
    sec(ws2,r,f"　{name}","G")
    r_n,r_m,r_y,r_rev=r+1,r+2,r+3,r+4
    S(ws2,f"A{r_n}",size=9); ws2[f"A{r_n}"]="店舗数（店）"
    S(ws2,f"B{r_n}",color=BLUE,fmt=MM0,border=True,align="center",fill=INP); ws2[f"B{r_n}"]=n
    S(ws2,f"A{r_m}",size=9); ws2[f"A{r_m}"]="開業年度の稼働月数"
    S(ws2,f"B{r_m}",color=GREEN,fmt=NUM,border=True,align="center"); ws2[f"B{r_m}"]=f"=前提条件!{mref}"
    S(ws2,f"A{r_y}",size=9); ws2[f"A{r_y}"]="年次（0=未開業/1/2/3）"
    for i,cl in enumerate(YC):
        S(ws2,f"{cl}{r_y}",color=BLUE,fmt=MM0,border=True,align="center",fill=INP); ws2[f"{cl}{r_y}"]=yidx[i]
    S(ws2,f"A{r_rev}",bold=True,border=True); ws2[f"A{r_rev}"]="売上高"
    for cl in YC:
        S(ws2,f"{cl}{r_rev}",bold=True,fmt=MM,border=True)
        ws2[f"{cl}{r_rev}"]=(f"=IF({cl}{r_y}=0,0,前提条件!$B${R_REV_BASE}"
                             f"*INDEX(前提条件!$B${R_R1}:$B${R_R3},{cl}{r_y})"
                             f"*$B${r_n}*IF({cl}{r_y}=1,$B${r_m}/12,1))")
    rr=r_rev+1; rowmap={}
    for lab,kind,idx in PL_ORDER:
        S(ws2,f"A{rr}",size=9,bold=kind.startswith("sub"),border=True); ws2[f"A{rr}"]=lab
        for cl in YC:
            if kind=="var":
                S(ws2,f"{cl}{rr}",fmt=MM,border=True)
                ws2[f"{cl}{rr}"]=(f"=IF({cl}${r_y}=0,0,{cl}${r_rev}*"
                                  f"INDEX(前提条件!$B${V_TOP+idx}:$D${V_TOP+idx},1,{cl}${r_y}))")
            elif kind=="sub_dept":
                S(ws2,f"{cl}{rr}",bold=True,fmt=MM,border=True,fill=TOT)
                ws2[f"{cl}{rr}"]=f"={cl}{r_rev}-SUM({cl}{r_rev+1}:{cl}{rr-1})"
            elif kind=="sub_gop":
                S(ws2,f"{cl}{rr}",bold=True,fmt=MM,border=True,fill=TOT)
                dr=rowmap["部門利益"]; ws2[f"{cl}{rr}"]=f"={cl}{dr}-SUM({cl}{dr+1}:{cl}{rr-1})"
            elif kind=="rent_fix":
                S(ws2,f"{cl}{rr}",fmt=MM,border=True)
                ws2[f"{cl}{rr}"]=(f"=IF({cl}{r_y}=0,0,前提条件!$B${R_RENT}*$B${r_n}"
                                  f"*IF({cl}{r_y}=1,$B${r_m}/12,1))")
            elif kind=="rent_pct":
                S(ws2,f"{cl}{rr}",fmt=MM,border=True)
                ws2[f"{cl}{rr}"]=(f"=IF({cl}{r_y}=0,0,MAX(0,{cl}{r_rev}/$B${r_n}-前提条件!$B${R_THR}"
                                  f"*IF({cl}{r_y}=1,$B${r_m}/12,1))*前提条件!$B${R_PCTR}*$B${r_n})")
        rowmap[lab]=rr; rr+=1
    r_eb,r_dep,r_op=rr,rr+1,rr+2
    S(ws2,f"A{r_eb}",bold=True,border=True); ws2[f"A{r_eb}"]="店舗EBITDA"
    S(ws2,f"A{r_dep}",border=True); ws2[f"A{r_dep}"]="減価償却費"
    S(ws2,f"A{r_op}",bold=True,border=True); ws2[f"A{r_op}"]="店舗営業利益"
    gr=rowmap["GOP（店舗営業総利益）"]
    for cl in YC:
        S(ws2,f"{cl}{r_eb}",bold=True,fmt=MM,border=True,fill=TOT)
        ws2[f"{cl}{r_eb}"]=f"={cl}{gr}-SUM({cl}{gr+1}:{cl}{r_eb-1})"
        S(ws2,f"{cl}{r_dep}",fmt=MM,border=True)
        ws2[f"{cl}{r_dep}"]=(f"=IF({cl}{r_y}=0,0,前提条件!${invcol}${R_DEPRE}*$B${r_n}"
                             f"*IF({cl}{r_y}=1,$B${r_m}/12,1))")
        S(ws2,f"{cl}{r_op}",bold=True,fmt=MM,border=True,fill=TOT)
        ws2[f"{cl}{r_op}"]=f"={cl}{r_eb}-{cl}{r_dep}"
    blocks.append(dict(rev=r_rev,rows=rowmap,eb=r_eb,dep=r_dep,op=r_op,n=r_n,m=r_m,y=r_y,invcol=invcol))
    r=r_op+2

# ───── 連結PL ─────
ws3=wb.create_sheet("連結PL"); ws3.sheet_view.showGridLines=False
ws3.column_dimensions["A"].width=30; ws3.column_dimensions["B"].width=10
for c in YC: ws3.column_dimensions[c].width=14
ws3.column_dimensions["H"].width=14
band(ws3,1,"5か年事業計画　連結損益計画（FY2027-FY2031・百万円）","H")
S(ws3,"A2",size=9,color="7F7F7F")
ws3["A2"]="2027年4月 六本木開業 → 2028年 札幌・大阪 → 2029年 首都圏・政令指定都市 → 2030年以降 リゾート含め年2店舗"
S(ws3,"A3",bold=True,border=True,fill=TOT); ws3["A3"]="科　目"
S(ws3,"B3",bold=True,border=True,fill=TOT,align="center",wrap=True); ws3["B3"]="対売上比\n(FY2031)"
for i,y in enumerate(YEARS):
    S(ws3,f"{YC[i]}3",bold=True,border=True,fill=TOT,align="center"); ws3[f"{YC[i]}3"]=y
S(ws3,"H3",bold=True,border=True,fill=TOT,align="center"); ws3["H3"]="5年累計"
def agg(key,cl): return "+".join(f"店舗群別PL!{cl}{b[key]}" for b in blocks)
def agg_row(lab,cl): return "+".join(f"店舗群別PL!{cl}{b['rows'][lab]}" for b in blocks)
R4={}; row=4
S(ws3,f"A{row}",bold=True,border=True); ws3[f"A{row}"]="期末店舗数（店）"
for i,cl in enumerate(YC):
    S(ws3,f"{cl}{row}",bold=True,color=GREEN,fmt=MM0,border=True,align="center")
    ws3[f"{cl}{row}"]=f"=前提条件!{PC[i]}{R_STORES}"
R4["stores"]=row; row+=1
S(ws3,f"A{row}",bold=True,border=True); ws3[f"A{row}"]="売上高"
for cl in YC:
    S(ws3,f"{cl}{row}",bold=True,color=GREEN,fmt=MM,border=True); ws3[f"{cl}{row}"]="="+agg("rev",cl)
R4["rev"]=row; row+=1
for lab,kind,idx in PL_ORDER:
    S(ws3,f"A{row}",size=9,bold=kind.startswith("sub"),border=True); ws3[f"A{row}"]=lab
    for cl in YC:
        S(ws3,f"{cl}{row}",bold=kind.startswith("sub"),color=GREEN,fmt=MM,border=True,
          fill=TOT if kind.startswith("sub") else None)
        ws3[f"{cl}{row}"]="="+agg_row(lab,cl)
    R4[lab]=row; row+=1
S(ws3,f"A{row}",bold=True,border=True); ws3[f"A{row}"]="店舗EBITDA　計"
for cl in YC:
    S(ws3,f"{cl}{row}",bold=True,color=GREEN,fmt=MM,border=True,fill=TOT); ws3[f"{cl}{row}"]="="+agg("eb",cl)
R4["st_eb"]=row; row+=1
S(ws3,f"A{row}",border=True); ws3[f"A{row}"]="本部費"
for i,cl in enumerate(YC):
    S(ws3,f"{cl}{row}",color=GREEN,fmt=MM,border=True); ws3[f"{cl}{row}"]=f"=前提条件!{PC[i]}{R_HQ}"
R4["hq"]=row; row+=1
S(ws3,f"A{row}",bold=True,border=True); ws3[f"A{row}"]="連結EBITDA"
for cl in YC:
    S(ws3,f"{cl}{row}",bold=True,fmt=MM,border=True,fill=KEY)
    ws3[f"{cl}{row}"]=f"={cl}{R4['st_eb']}-{cl}{R4['hq']}"
R4["eb"]=row; row+=1
S(ws3,f"A{row}",bold=True,border=True); ws3[f"A{row}"]="　EBITDA率"
for cl in YC:
    S(ws3,f"{cl}{row}",bold=True,fmt=PCT,border=True,align="center",fill=KEY)
    ws3[f"{cl}{row}"]=f"=IF({cl}{R4['rev']}=0,0,{cl}{R4['eb']}/{cl}{R4['rev']})"
R4["ebm"]=row; row+=1
S(ws3,f"A{row}",border=True); ws3[f"A{row}"]="減価償却費"
for cl in YC:
    S(ws3,f"{cl}{row}",color=GREEN,fmt=MM,border=True); ws3[f"{cl}{row}"]="="+agg("dep",cl)
R4["dep"]=row; row+=1
S(ws3,f"A{row}",bold=True,border=True); ws3[f"A{row}"]="営業利益"
for cl in YC:
    S(ws3,f"{cl}{row}",bold=True,fmt=MM,border=True,fill=KEY)
    ws3[f"{cl}{row}"]=f"={cl}{R4['eb']}-{cl}{R4['dep']}"
R4["op"]=row; row+=1
S(ws3,f"A{row}",bold=True,border=True); ws3[f"A{row}"]="　営業利益率"
for cl in YC:
    S(ws3,f"{cl}{row}",bold=True,fmt=PCT,border=True,align="center",fill=KEY)
    ws3[f"{cl}{row}"]=f"=IF({cl}{R4['rev']}=0,0,{cl}{R4['op']}/{cl}{R4['rev']})"
R4["opm"]=row; row+=1
pl_rows=[R4["rev"]]+[R4[l] for l,_,_ in PL_ORDER]+[R4["st_eb"],R4["hq"],R4["eb"],R4["dep"],R4["op"]]
for rr in pl_rows:
    S(ws3,f"H{rr}",bold=True,fmt=MM,border=True,fill=TOT); ws3[f"H{rr}"]=f"=SUM(C{rr}:G{rr})"
    S(ws3,f"B{rr}",size=9,fmt=PCT,border=True,align="center")
    ws3[f"B{rr}"]=f"=IF($G${R4['rev']}=0,0,G{rr}/$G${R4['rev']})"
for k in ["ebm","opm"]:
    rr=R4[k]
    S(ws3,f"H{rr}",bold=True,fmt=PCT,border=True,align="center",fill=TOT)
    ws3[f"H{rr}"]=f"=H{R4['eb' if k=='ebm' else 'op']}/H{R4['rev']}"
nr=row+1
S(ws3,f"A{nr}",bold=True,size=10,color=RED)
ws3[f"A{nr}"]="※ 到達時期は下表参照。FY＝4月〜3月。新店初年度は売上90%・開業7.5か月で計上。金利・税金は含まない。"
S(ws3,f"A{nr+1}",size=9,color="7F7F7F")
ws3[f"A{nr+1}"]="※ 売上原価は料理30.0%・飲料30.0%（2026年10月改定）。原価改善を織り込んでいないため、EBITDA率の伸びは旧計画より緩やかです。"
print("連結PL OK")

# ───── 投資・キャッシュフロー ─────
ws5=wb.create_sheet("投資・キャッシュフロー"); ws5.sheet_view.showGridLines=False
ws5.column_dimensions["A"].width=34
for c in YC+["H"]: ws5.column_dimensions[c].width=14
ws5.column_dimensions["I"].width=3; ws5.column_dimensions["J"].width=46
band(ws5,1,"5か年事業計画　連結キャッシュフロー（百万円）","H")
S(ws5,"A2",size=9,color="7F7F7F")
ws5["A2"]="分割払いスキーム反映。初期投資は1号店297.25／2〜3号店257.25／4号店以降252.25百万円。うち138.9百万円を分割。"
S(ws5,"A3",bold=True,border=True,fill=TOT); ws5["A3"]="項　目"
for i,y in enumerate(YEARS):
    S(ws5,f"{YC[i]}3",bold=True,border=True,fill=TOT,align="center"); ws5[f"{YC[i]}3"]=y
S(ws5,"H3",bold=True,border=True,fill=TOT,align="center"); ws5["H3"]="5年累計"
INV_MAP=["B","C","D","D","D"]
r=4
S(ws5,f"A{r}",border=True); ws5[f"A{r}"]="新規出店数（店）"
for i,cl in enumerate(YC):
    S(ws5,f"{cl}{r}",color=GREEN,fmt=MM0,border=True,align="center")
    ws5[f"{cl}{r}"]=f"=前提条件!{PC[i]}{R_OPEN}"
ROW_OPEN=r; r+=1
S(ws5,f"A{r}",border=True); ws5[f"A{r}"]="期末店舗数（店）"
for i,cl in enumerate(YC):
    S(ws5,f"{cl}{r}",color=GREEN,fmt=MM0,border=True,align="center")
    ws5[f"{cl}{r}"]=f"=前提条件!{PC[i]}{R_STORES}"
r+=1
S(ws5,f"A{r}",border=True); ws5[f"A{r}"]="初期投資（総額）"
for i,cl in enumerate(YC):
    S(ws5,f"{cl}{r}",fmt=MM,border=True)
    ws5[f"{cl}{r}"]=f"=-{cl}{ROW_OPEN}*前提条件!${INV_MAP[i]}${R_INVTOT}"
ROW_INV=r; r+=1
S(ws5,f"A{r}",border=True); ws5[f"A{r}"]="うち 分割対象額"
for cl in YC:
    S(ws5,f"{cl}{r}",fmt=MM,border=True); ws5[f"{cl}{r}"]=f"={cl}{ROW_OPEN}*前提条件!$B${R_DEF}"
ROW_DEF=r; r+=1
S(ws5,f"A{r}",bold=True,border=True); ws5[f"A{r}"]="開業時 現金支出"
for cl in YC:
    S(ws5,f"{cl}{r}",bold=True,fmt=MM,border=True,fill=TOT); ws5[f"{cl}{r}"]=f"={cl}{ROW_INV}+{cl}{ROW_DEF}"
ROW_CASH=r; r+=1
S(ws5,f"A{r}",border=True); ws5[f"A{r}"]="分割弁済額"
for cl in YC:
    S(ws5,f"{cl}{r}",fmt=MM,border=True)
    terms=[(f"IF(店舗群別PL!{cl}{b['y']}=0,0,前提条件!$B${R_PAY}*店舗群別PL!$B${b['n']}"
            f"*IF(店舗群別PL!{cl}{b['y']}=1,店舗群別PL!$B${b['m']}/12,1))") for b in blocks]
    ws5[f"{cl}{r}"]="=-("+"+".join(terms)+")"
ROW_PAY=r; r+=1
S(ws5,f"A{r}",bold=True,border=True); ws5[f"A{r}"]="投資キャッシュアウト　計"
for cl in YC:
    S(ws5,f"{cl}{r}",bold=True,fmt=MM,border=True,fill=TOT); ws5[f"{cl}{r}"]=f"={cl}{ROW_CASH}+{cl}{ROW_PAY}"
ROW_ICF=r; r+=1
S(ws5,f"A{r}",bold=True,border=True); ws5[f"A{r}"]="連結EBITDA"
for cl in YC:
    S(ws5,f"{cl}{r}",bold=True,color=GREEN,fmt=MM,border=True); ws5[f"{cl}{r}"]=f"=連結PL!{cl}{R4['eb']}"
ROW_EB=r; r+=1
ROW_CUM0=r+2
S(ws5,f"A{r}",border=True); ws5[f"A{r}"]="法人税等（推計）"
for cl in YC:
    S(ws5,f"{cl}{r}",fmt=MM,border=True)
    ws5[f"{cl}{r}"]=f"=-MAX(0,連結PL!{cl}{R4['op']})*$B${ROW_CUM0+3}"
ROW_TAX=r; r+=1
S(ws5,f"A{r}",bold=True,border=True); ws5[f"A{r}"]="簡易フリーキャッシュフロー"
for cl in YC:
    S(ws5,f"{cl}{r}",bold=True,fmt=MM,border=True,fill=KEY)
    ws5[f"{cl}{r}"]=f"={cl}{ROW_EB}+{cl}{ROW_TAX}+{cl}{ROW_ICF}"
ROW_FCF=r; r+=1
S(ws5,f"A{r}",bold=True,border=True); ws5[f"A{r}"]="累計フリーキャッシュフロー"
for i,cl in enumerate(YC):
    S(ws5,f"{cl}{r}",bold=True,fmt=MM,border=True,fill=KEY)
    ws5[f"{cl}{r}"]=f"={cl}{ROW_FCF}" if i==0 else f"={YC[i-1]}{r}+{cl}{ROW_FCF}"
ROW_CUM=r
for rr in [ROW_OPEN,ROW_INV,ROW_DEF,ROW_CASH,ROW_PAY,ROW_ICF,ROW_EB,ROW_TAX,ROW_FCF]:
    S(ws5,f"H{rr}",bold=True,fmt=MM0 if rr==ROW_OPEN else MM,border=True,fill=TOT)
    ws5[f"H{rr}"]=f"=SUM(C{rr}:G{rr})"
r=ROW_CUM+2
sec(ws5,r,"■ 必要資金と調達","H"); r+=1
R_TAXRATE=ROW_CUM+3
for i,(lab,f_,fmt,note) in enumerate([
    ("法人税 実効税率",0.30,PCT,"簡易。繰越欠損金の控除は考慮せず"),
    ("最大資金需要（累計FCFの最小値）",f"=-MIN(C{ROW_CUM}:G{ROW_CUM})",MM,"税引後ベース"),
    ("既存調達額（エクイティ＋デット）",200.0,MM,"事業収支資料p11「2億調達済み」。内訳未確認"),
    ("第三者割当①（2026年10月）",150.0,MM,"Pre3億・Post4.5億"),
    ("調達額　計",None,MM,""),
    ("過不足（マイナスが不足）",None,MM,"デット元本返済・分割払い金利は未考慮")]):
    rr=r+i
    S(ws5,f"A{rr}",border=True,bold=(i>=4)); ws5[f"A{rr}"]=lab
    isin=not isinstance(f_,str) and f_ is not None
    S(ws5,f"B{rr}",color=BLUE if isin else BLACK,bold=(i>=4),fmt=fmt,border=True,align="center",
      fill=INP if isin else (KEY if i==5 else (TOT if i==4 else None)))
    if i==4: ws5[f"B{rr}"]=f"=B{r+2}+B{r+3}"
    elif i==5: ws5[f"B{rr}"]=f"=B{r+4}-B{r+1}"
    else: ws5[f"B{rr}"]=f_
    S(ws5,f"J{rr}",size=9,color="7F7F7F"); ws5[f"J{rr}"]=note
assert R_TAXRATE==r, f"tax rate row mismatch {R_TAXRATE} vs {r}"  # 17
r+=7
S(ws5,f"A{r}",size=9,color="7F7F7F")
ws5[f"A{r}"]="※ 簡易FCF＝連結EBITDA－法人税等－投資キャッシュアウト。運転資本増減・借入返済は含まない。"
S(ws5,f"A{r+1}",size=9,color=RED)
ws5[f"A{r+1}"]="※ ワイン・美術品在庫は1号店50百万円（美術品含む）、2号店以降はワインのみ10百万円。9店舗累計の初期投資は23.3億円。"

# ───── サマリー ─────
ws1=wb.create_sheet("サマリー",0); ws1.sheet_view.showGridLines=False
ws1.column_dimensions["A"].width=30; ws1.column_dimensions["B"].width=20
for c in YC: ws1.column_dimensions[c].width=14
ws1.column_dimensions["H"].width=14
band(ws1,1,"BRASSERIE Thierry Marx　5か年事業計画 rev2（FY2027-FY2031）","H")
S(ws1,"A2",size=9,color="7F7F7F")
ws1["A2"]="単位：百万円／FY＝4月〜翌3月／六本木店 事業収支 rev2（2026年10月改定）の単店economicsに基づく。"
sec(ws1,4,"■ 出店ロードマップ","H")
for i,(y,t,n) in enumerate([("FY2027","六本木ミッドタウン 1店（2027年4月開業）","1店"),
                            ("FY2028","札幌・大阪 2店","3店"),("FY2029","首都圏・他政令指定都市 2店","5店"),
                            ("FY2030","リゾート含め 年2店","7店"),("FY2031","リゾート含め 年2店","9店")]):
    r=5+i
    S(ws1,f"A{r}",bold=True); ws1[f"A{r}"]=y
    S(ws1,f"B{r}"); ws1[f"B{r}"]=t
    S(ws1,f"E{r}",bold=True,color=RED); ws1[f"E{r}"]=f"期末 {n}"
sec(ws1,11,"■ 連結業績サマリー","H")
S(ws1,"A12",bold=True,border=True,fill=TOT); ws1["A12"]="項　目"
for i,y in enumerate(YEARS):
    S(ws1,f"{YC[i]}12",bold=True,border=True,fill=TOT,align="center"); ws1[f"{YC[i]}12"]=y
S(ws1,"H12",bold=True,border=True,fill=TOT,align="center"); ws1["H12"]="5年累計"
r=13
for lab,key,fmt,hl in [("期末店舗数（店）","stores",MM0,False),("売上高","rev",MM,False),
                       ("店舗EBITDA　計","st_eb",MM,False),("本部費","hq",MM,False),
                       ("連結EBITDA","eb",MM,True),("　EBITDA率","ebm",PCT,True),
                       ("減価償却費","dep",MM,False),("営業利益","op",MM,True),
                       ("　営業利益率","opm",PCT,True)]:
    S(ws1,f"A{r}",bold=hl,border=True); ws1[f"A{r}"]=lab
    for cl in YC:
        S(ws1,f"{cl}{r}",bold=hl,color=GREEN,fmt=fmt,border=True,
          align="center" if fmt in (PCT,MM0) else None,fill=KEY if hl else None)
        ws1[f"{cl}{r}"]=f"=連結PL!{cl}{R4[key]}"
    if key!="stores":
        S(ws1,f"H{r}",bold=True,color=GREEN,fmt=fmt,border=True,fill=TOT,
          align="center" if fmt==PCT else None)
        ws1[f"H{r}"]=f"=連結PL!H{R4[key]}"
    r+=1
sec(ws1,23,"■ 目標到達時期（自動判定）","H")
S(ws1,"A24",border=True); ws1["A24"]="連結EBITDA率 10%超"
S(ws1,"B24",bold=True,border=True,align="center",fill=KEY)
ws1["B24"]=(f'=IF(COUNTIF(連結PL!C{R4["ebm"]}:G{R4["ebm"]},">=0.1")=0,"5年内に未達",'
            f'INDEX({{"FY2027","FY2028","FY2029","FY2030","FY2031"}},'
            f'6-COUNTIF(連結PL!C{R4["ebm"]}:G{R4["ebm"]},">=0.1")))')
S(ws1,"A25",border=True); ws1["A25"]="営業利益率 5%超"
S(ws1,"B25",bold=True,border=True,align="center",fill=KEY)
ws1["B25"]=(f'=IF(COUNTIF(連結PL!C{R4["opm"]}:G{R4["opm"]},">=0.05")=0,"5年内に未達",'
            f'INDEX({{"FY2027","FY2028","FY2029","FY2030","FY2031"}},'
            f'6-COUNTIF(連結PL!C{R4["opm"]}:G{R4["opm"]},">=0.05")))')
S(ws1,"D24",size=9,color="7F7F7F"); ws1["D24"]="旧計画：FY2028"
S(ws1,"D25",size=9,color="7F7F7F"); ws1["D25"]="旧計画：FY2029"
sec(ws1,27,"■ 投資・資金サマリー","H")
r=28
for lab,ref,fmt in [("新規出店数（店）",f"=投資・キャッシュフロー!H{ROW_OPEN}",MM0),
                    ("初期投資（5年累計）",f"=投資・キャッシュフロー!H{ROW_INV}",MM),
                    ("開業時 現金支出（5年累計）",f"=投資・キャッシュフロー!H{ROW_CASH}",MM),
                    ("最大資金需要（税引後）",f"=投資・キャッシュフロー!B{R_TAXRATE+1}",MM),
                    ("調達額 計（既存2億＋今回1.5億）",f"=投資・キャッシュフロー!B{R_TAXRATE+4}",MM),
                    ("過不足（マイナスが不足）",f"=投資・キャッシュフロー!B{R_TAXRATE+5}",MM)]:
    S(ws1,f"A{r}",border=True,bold=("過不足" in lab)); ws1[f"A{r}"]=lab
    S(ws1,f"B{r}",color=GREEN,bold=("過不足" in lab),fmt=fmt,border=True,align="center",
      fill=KEY if "過不足" in lab else None)
    ws1[f"B{r}"]=ref
    r+=1
S(ws1,f"A{r+1}",size=9,color=RED,bold=True)
ws1[f"A{r+1}"]="※ 単店の売上460.6→428.6、EBITDA(3年目以降)76.2→64.3となったため、旧計画より各指標が低下しています。"

if "Sheet" in wb.sheetnames: del wb["Sheet"]
SHEETS=["サマリー","前提条件","店舗群別PL","連結PL","投資・キャッシュフロー"]
for sh in wb.worksheets:
    for row_ in sh.iter_rows():
        for c in row_:
            if isinstance(c.value,str) and c.value.startswith("="):
                f=c.value
                for nm in SHEETS: f=f.replace(f"'{nm}'!",f"{nm}!")
                for nm in SHEETS: f=f.replace(f"{nm}!",f"'{nm}'!")
                c.value=f
wb.calculation.fullCalcOnLoad=True
wb.save(OUT)
print("saved:",OUT)
