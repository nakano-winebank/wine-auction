# -*- coding: utf-8 -*-
import openpyxl
from openpyxl.chart import LineChart, BarChart, Reference
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

wb = openpyxl.Workbook()
F="Arial"
BLUE=Font(name=F,size=10,color="0000FF")
BLK=Font(name=F,size=10)
BLD=Font(name=F,size=10,bold=True)
TTL=Font(name=F,size=13,bold=True,color="6D2E46")
SEC=Font(name=F,size=10,bold=True,color="FFFFFF")
GRY=Font(name=F,size=9,color="808080")
GRN=Font(name=F,size=10,color="008000")
SECF=PatternFill("solid",fgColor="6D2E46")
YEL=PatternFill("solid",fgColor="FFFF00")
TINT=PatternFill("solid",fgColor="F7F3F4")
NUM='#,##0;(#,##0);-'
PCT='0.0%'
thin=Side(style="thin",color="BFBFBF")
BOX=Border(top=thin,bottom=thin,left=thin,right=thin)

def sec(ws,row,text,span):
    c=ws.cell(row=row,column=1,value=text); c.font=SEC; c.fill=SECF
    for i in range(2,span+1):
        ws.cell(row=row,column=i).fill=SECF

# ============================ 前提 ============================
ws=wb.active; ws.title="前提"
ws["A1"]="カンテサンス 2027年 月次キャッシュフロー計画 ― 前提条件"; ws["A1"].font=TTL
ws["A2"]="単位：百万円。青字＝入力値、黒字＝計算式、黄色＝感応度を見るための主要レバー。"; ws["A2"].font=GRY

sec(ws,4,"1. 損益前提（2026年12月期の会社計画と同水準で横ばい）",4)
rows=[("売上高（年間）",1015,None,"IM p.40 の2026年12月期 会社計画"),
      ("営業利益（年間）",528,None,"同上。役員報酬・賞与を控除した後の金額"),
      ("変動費率（食材・ドリンク原価）",0.254,PCT,"ドリンク原価0.9万円/人×1.4万人＋食材原価から逆算"),
      ("月次固定費",None,None,"＝（売上高×(1−変動費率)−営業利益）÷12。人件費・役員報酬・賃料等")]
for i,(lab,val,fmt,note) in enumerate(rows):
    r=5+i
    ws.cell(row=r,column=1,value=lab).font=BLK
    c=ws.cell(row=r,column=2)
    if val is None: c.value="=(B5*(1-B7)-B6)/12"; c.font=BLK
    else: c.value=val; c.font=BLUE
    c.number_format = fmt or NUM
    ws.cell(row=r,column=4,value=note).font=GRY

sec(ws,10,"2. 月次の営業日数（年間252日）",14)
ws.cell(row=11,column=1,value="月").font=BLD
ws.cell(row=12,column=1,value="営業日数").font=BLD
DAYS=[18,20,22,21,21,22,22,17,21,22,21,25]
for i,d in enumerate(DAYS):
    ws.cell(row=11,column=2+i,value=f"{i+1}月").font=BLD
    c=ws.cell(row=12,column=2+i,value=d); c.font=BLUE; c.number_format=NUM
ws.cell(row=11,column=14,value="合計").font=BLD
c=ws.cell(row=12,column=14,value="=SUM(B12:M12)"); c.font=BLD; c.number_format=NUM
ws.cell(row=13,column=1,value="※ 1月は年始休業、8月は夏季休業、12月は繁忙期のため営業日数を増やす前提。月次売上は営業日数に比例させている。").font=GRY

sec(ws,15,"3. 税金",4)
tax=[("2026年12月期の未払法人税等・未払消費税（2027年2月納付）",114,"2026年12月期末BSの負債に計上されている金額。取得後の会社が納付する"),
     ("法人税等 2027年度 中間納付（2027年8月）",92,"前事業年度の確定法人税額の2分の1"),
     ("（期中の消費税）",0,"売上高は税抜表示であり、消費税は預り金の性質を持つ。顧客からの預りと税務署への納付が年間を通じて相殺されるため、本モデルでは計上していない")]
for i,(lab,val,note) in enumerate(tax):
    r=16+i
    ws.cell(row=r,column=1,value=lab).font=BLK
    c=ws.cell(row=r,column=2,value=val); c.font=BLUE; c.number_format=NUM
    ws.cell(row=r,column=4,value=note).font=GRY
ws.cell(row=19,column=1,value="※ 2026年12月期の未払税金は、譲受価額の算定において控除していない（事業価値の算定は現預金と役員貸付金のみを非事業用資産として扱っている）。\n※ 合併に伴う資産調整勘定（税務上ののれん）の損金算入は、保守的に織り込んでいない。認められる場合、2027年度の法人税はほぼ発生しない。").font=GRY

sec(ws,21,"4. 買収ファイナンスと期首現金",4)
fin=[("有利子負債（2027年1月1日、ブリッジ返済後）",2000,"タームローンA 14.0億円＋タームローンB 6.0億円"),
     ("金利",0.03,"みずほ銀行との協議前提"),
     ("四半期の元本返済額",50,"タームローンA 14.0億円を7年元金均等＝年2.0億円。3月・6月・9月・12月に返済"),
     ("期首現金（対象会社に留保する運転資金）",100,"★ 本モデルの主要レバー。ここを増減させると買収時に必要な中野氏の拠出額が同額だけ変動する")]
for i,(lab,val,note) in enumerate(fin):
    r=22+i
    ws.cell(row=r,column=1,value=lab).font=BLK
    c=ws.cell(row=r,column=2,value=val); c.font=BLUE
    c.number_format = PCT if lab=="金利" else NUM
    if i==3: c.fill=YEL; c.font=Font(name=F,size=10,color="0000FF",bold=True)
    ws.cell(row=r,column=4,value=note).font=GRY

ws.column_dimensions["A"].width=44; ws.column_dimensions["B"].width=12
ws.column_dimensions["C"].width=2;  ws.column_dimensions["D"].width=90
for i in range(3,14): ws.column_dimensions[get_column_letter(i)].width=8

# ============================ 月次CF ============================
cf=wb.create_sheet("月次CF")
cf["A1"]="2027年 月次キャッシュフロー計画（百万円）"; cf["A1"].font=TTL
cf["A2"]="計画どおり（2026年12月期の会社計画と同水準）に推移した場合。すべて『前提』シートを参照している。"; cf["A2"].font=GRY

LAB=[(4,"月番号"),(5,"月"),(6,"営業日数"),(7,"売上高"),(8,"変動費"),(9,"固定費"),(10,"営業利益"),
     (12,"営業キャッシュフロー"),(13,"法人税等の納付"),(14,"支払利息"),(15,"借入元本の返済"),
     (16,"当月収支"),(18,"現金 期首残高"),(19,"現金 期末残高"),(21,"借入残高（期末）")]
for r,t in LAB:
    c=cf.cell(row=r,column=1,value=t)
    c.font = BLD if r in (10,12,17,20,22) else BLK
sec(cf,3,"2027年",15)
for i in range(12):
    col=2+i; L=get_column_letter(col); P=get_column_letter(col+1)
    pl=get_column_letter(col-1)
    cf.cell(row=3,column=col,value=f"{i+1}月").font=SEC; cf.cell(row=3,column=col).fill=SECF
    cf.cell(row=4,column=col,value=i+1).font=GRY
    cf.cell(row=5,column=col,value=f"{i+1}月").font=BLK
    cf[f"{L}6"]=f"=前提!{L}12"
    cf[f"{L}7"]=f"=前提!$B$5*{L}6/前提!$N$12"
    cf[f"{L}8"]=f"=-{L}7*前提!$B$7"
    cf[f"{L}9"]="=-前提!$B$8"
    cf[f"{L}10"]=f"=SUM({L}7:{L}9)"
    cf[f"{L}12"]=f"={L}10"
    cf[f"{L}13"]=f"=IF({L}4=2,-前提!$B$16,IF({L}4=8,-前提!$B$17,0))"
    if i==0:
        cf[f"{L}14"]=f"=IF(MOD({L}4,3)=0,-前提!$B$22*前提!$B$23/4,0)"
        cf[f"{L}15"]=f"=IF(MOD({L}4,3)=0,-前提!$B$24,0)"
        cf[f"{L}18"]="=前提!$B$25"
        cf[f"{L}21"]=f"=前提!$B$22+{L}15"
    else:
        cf[f"{L}14"]=f"=IF(MOD({L}4,3)=0,-{pl}21*前提!$B$23/4,0)"
        cf[f"{L}15"]=f"=IF(MOD({L}4,3)=0,-前提!$B$24,0)"
        cf[f"{L}18"]=f"={pl}19"
        cf[f"{L}21"]=f"={pl}21+{L}15"
    cf[f"{L}16"]=f"=SUM({L}12:{L}15)"
    cf[f"{L}19"]=f"={L}18+{L}16"
# 合計列
cf.cell(row=3,column=14,value="合計").font=SEC; cf.cell(row=3,column=14).fill=SECF
for r in (6,7,8,9,10,12,13,14,15,16):
    cf[f"N{r}"]=f"=SUM(B{r}:M{r})"
cf["N18"]="=B18"; cf["N19"]="=M19"; cf["N21"]="=M21"
for r in [6,7,8,9,10,12,13,14,15,16,18,19,21]:
    for col in range(2,15):
        c=cf.cell(row=r,column=col); c.number_format=NUM
        if r in (10,16,19,21): c.font=BLD
        if r==19: c.fill=TINT
# サマリー
cf["A24"]="最低現金残高"; cf["A24"].font=BLD
cf["B24"]="=MIN(B19:M19)"; cf["B24"].font=Font(name=F,size=10,bold=True,color="9B2C2C"); cf["B24"].number_format=NUM
cf["D24"]="＝ 月次固定費の"; cf["D24"].font=BLK
cf["E24"]="=B24/前提!$B$8"; cf["E24"].font=BLD; cf["E24"].number_format='0.0"か月分"'
cf["A25"]="年間の営業キャッシュフロー"; cf["A25"].font=BLK
cf["B25"]="=N12"; cf["B25"].number_format=NUM; cf["B25"].font=BLK
cf["A26"]="年間の元利返済額"; cf["A26"].font=BLK
cf["B26"]="=-N14-N15"; cf["B26"].number_format=NUM; cf["B26"].font=BLK
cf["A27"]="DSCR（法人税控除後のキャッシュフローベース）"; cf["A27"].font=BLD
cf["B27"]="=(N12+N13)/B26"; cf["B27"].number_format='0.00"倍"'; cf["B27"].font=Font(name=F,size=10,bold=True,color="008000")
cf["A29"]="※ 2月に2026年12月期の未払税金、8月に2027年度の中間納付が集中するため、3月末が年間で最も現金残高が薄くなる。"; cf["A29"].font=GRY
cf["A30"]="※ 減価償却費・設備投資・運転資本の増減はいずれも軽微なため、営業利益をそのまま営業キャッシュフローとみなしている。消費税は預り金の性質のため計上していない。"; cf["A30"].font=GRY
cf.column_dimensions["A"].width=30
for i in range(2,15): cf.column_dimensions[get_column_letter(i)].width=10

# ============================ 買収資金 ============================
fz=wb.create_sheet("買収資金")
fz["A1"]="買収資金の調達と使途（譲受価額50.0億円のケース）"; fz["A1"].font=TTL
fz["A2"]="『前提』シートの留保現金を変更すると、中野氏の必要拠出額が自動で再計算される。"; fz["A2"].font=GRY
sec(fz,4,"1. 資金使途（クロージング時）",3)
fz["A5"]="株式譲受代金"; fz["B5"]=5000; fz["B5"].font=BLUE
fz["A6"]="取得関連費用"; fz["B6"]=150; fz["B6"].font=BLUE
fz["A7"]="合計"; fz["A7"].font=BLD; fz["B7"]="=SUM(B5:B6)"; fz["B7"].font=BLD
sec(fz,9,"2. 対象会社の現預金（2026年12月期末）",3)
fz["A10"]="現預金"; fz["B10"]=1743; fz["B10"].font=BLUE
fz["A11"]="役員貸付金の回収（クロージング時に岸田氏が現金返済）"; fz["B11"]=500; fz["B11"].font=BLUE
fz["A12"]="運転資金として留保する現金"; fz["B12"]="=-前提!$B$25"; fz["B12"].font=GRN
fz["A13"]="ブリッジローンの返済原資"; fz["A13"].font=BLD; fz["B13"]="=SUM(B10:B12)"; fz["B13"].font=BLD
sec(fz,15,"3. 調達（クロージング時）",3)
fz["A16"]="みずほ銀行 タームローン"; fz["B16"]="=前提!$B$22"; fz["B16"].font=GRN
fz["A17"]="みずほ銀行 ブリッジローン"; fz["B17"]="=B13"; fz["B17"].font=BLK
fz["A18"]="榊原氏 出資"; fz["B18"]=1000; fz["B18"].font=BLUE
fz["A19"]="中野氏 出資（資本金10万円）＋株主貸付"; fz["B19"]="=B7-B16-B17-B18"; fz["B19"].font=Font(name=F,size=10,bold=True,color="9B2C2C")
fz["A20"]="合計"; fz["A20"].font=BLD; fz["B20"]="=SUM(B16:B19)"; fz["B20"].font=BLD
fz["A22"]="差引（ゼロであること）"; fz["B22"]="=B7-B20"; fz["B22"].font=BLD
fz["A24"]="合併後の有利子負債"; fz["A24"].font=BLD; fz["B24"]="=B16"; fz["B24"].font=BLD
fz["A25"]="合併後の現預金"; fz["A25"].font=BLD; fz["B25"]="=前提!$B$25"; fz["B25"].font=BLD
fz["A26"]="ネットデット"; fz["A26"].font=BLD; fz["B26"]="=B24-B25"; fz["B26"].font=BLD
fz["A27"]="ネットデット／EBITDA"; fz["B27"]="=B26/529"; fz["B27"].number_format='0.0"倍"'
for r in [5,6,7,10,11,12,13,16,17,18,19,20,22,24,25,26]:
    fz.cell(row=r,column=2).number_format=NUM
fz["A29"]="※ ブリッジローンはクロージング後、対象会社の余剰現預金をもって全額返済する。\n※ 留保する現金を1億円増やすと、中野氏の必要拠出額も1億円増え、2027年の最低現金残高も1億円増える（1対1の関係）。"; fz["A29"].font=GRY
fz["A30"]="※ EBITDAは2026年12月期計画の529百万円。"; fz["A30"].font=GRY
fz.column_dimensions["A"].width=48; fz.column_dimensions["B"].width=14

# --- 現金残高の推移グラフ ---
ch=LineChart(); ch.title="2027年 現金残高の推移（百万円）"; ch.style=2; ch.height=8.2; ch.width=20
ch.y_axis.title="現金残高"; ch.x_axis.title=None
data=Reference(cf,min_col=1,max_col=13,min_row=19,max_row=19)
cats=Reference(cf,min_col=2,max_col=13,min_row=5,max_row=5)
ch.add_data(data,titles_from_data=True,from_rows=True); ch.set_categories(cats)
ser=ch.series[0]; ser.graphicalProperties.line.solidFill="6D2E46"; ser.graphicalProperties.line.width=28000
ser.smooth=False
cf.add_chart(ch,"A34")

cb=BarChart(); cb.title="2027年 月次の当月収支（百万円）"; cb.style=2; cb.height=8.2; cb.width=20
d2=Reference(cf,min_col=1,max_col=13,min_row=16,max_row=16)
cb.add_data(d2,titles_from_data=True,from_rows=True); cb.set_categories(cats)
cb.series[0].graphicalProperties.solidFill="A26769"
cf.add_chart(cb,"A52")

wb.save("カンテサンス_2027年月次CF計画.xlsx")
print("saved")
