import sys,re
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.comments import Comment
from openpyxl.utils import get_column_letter as L

OUT=sys.argv[1]
wb=Workbook()
F="Arial"
BLUE=Font(name=F,size=10,color="0000FF"); BLK=Font(name=F,size=10); GRN=Font(name=F,size=10,color="008000")
B=Font(name=F,size=10,bold=True); H=Font(name=F,size=10,bold=True,color="FFFFFF"); T=Font(name=F,size=14,bold=True)
HF=PatternFill("solid",fgColor="6D2E46"); YF=PatternFill("solid",fgColor="FFFF00"); TF=PatternFill("solid",fgColor="F7F3F4")
thin=Side(style="thin",color="E4DADD"); BOX=Border(bottom=thin)
NUM='#,##0;(#,##0);"-"'; NUM1='#,##0.0;(#,##0.0);"-"'; PCT='0.0%;(0.0%);"-"'; X='0.00"x";(0.00"x");"-"'
YRS=["2027","2028","2029","2030","2031","2032"]; YC=["C","D","E","F","G","H"]

# ---------------- 前提条件 ----------------
a=wb.active; a.title="前提条件"
a["A1"]="カンテサンス CF計画（2027〜2032年・三つ星維持ケース）前提条件"; a["A1"].font=T
a["A2"]="単位：百万円。青字＝入力値（変更可）、黒字＝計算式。黄色セルは主要な仮定です。"; a["A2"].font=Font(name=F,size=9,color="6E6368")
hdr=["項目","FY2026／固定値"]+YRS+["出所・根拠"]
for i,h in enumerate(hdr):
    c=a.cell(row=4,column=i+1,value=h); c.font=H; c.fill=HF; c.alignment=Alignment(horizontal="center")
def inp(r,label,val,fmt=NUM,src="",key=False):
    a.cell(row=r,column=1,value=label).font=BLK
    c=a.cell(row=r,column=2,value=val); c.font=BLUE if not isinstance(val,str) or not val.startswith("=") else BLK
    c.number_format=fmt
    if key: c.fill=YF
    a.cell(row=r,column=9,value=src).font=Font(name=F,size=9,color="6E6368")
def row(r,label,vals,fmt=PCT,src="",key=False):
    a.cell(row=r,column=1,value=label).font=BLK
    for col,v in zip(YC,vals):
        c=a[f"{col}{r}"]; c.value=v; c.font=BLUE; c.number_format=fmt
        if key: c.fill=YF
    a.cell(row=r,column=9,value=src).font=Font(name=F,size=9,color="6E6368")

a["A5"]="■ 基準値（2026年12月期 会社計画）"; a["A5"].font=B
inp(6,"売上高",1015,src="IM記載の2026年12月期会社計画")
inp(7,"うち物販売上",70,src="売主QA回答：チーズケーキ年商約7,000万円")
inp(8,"売上原価",233,src="1〜7月実績の粗利率77.0%を通期に適用（1,015×23%）")
inp(9,"物販の原価率",0.35,PCT,src="仮定（洋菓子製造の一般的水準）",key=True)
inp(10,"営業利益",528,src="IM記載の2026年12月期会社計画（岸田氏報酬控除後）")
inp(11,"岸田氏の役員報酬（現行）",102.6,NUM1,src="月額60万円×12＋事前確定届出給与95.4百万円")
inp(12,"人件費・経費（岸田氏報酬を除く）","=B6-B8-B10-B11",NUM1,src="計算：売上高−売上原価−営業利益−岸田氏報酬")
a["A14"]="■ 税・投資・資金"; a["A14"].font=B
inp(15,"実効税率",0.344,PCT,src="2025年実績（銀行提出資料と同じ）")
inp(16,"減価償却費（年）",10,src="仮定（設備投資に応じて増加）")
inp(17,"設備投資（年）",30,src="仮定（銀行提出資料と同じ保守的な水準）")
inp(18,"決済時の留保現金",100,src="銀行提出資料：運転資金として1.0億円を留保")
inp(19,"FY2026 未払法人税等（退職金控除前）",114,src="銀行提出資料：2026年12月期の未払税金1.14億円")
inp(20,"決済時の役員退職金（対象会社が支給）",225,src="条件合意：前払い2.25億円を退職金に振替（ユーザー指定）",key=True)
inp(21,"AM管理報酬（年）",61,src="SPC出資総額30.6億円×2%（AM契約で確定）")
a["A23"]="■ 買収借入（対象会社と合併後の会社が返済する前提）"; a["A23"].font=B
inp(24,"借入額",2000,src="仮定：タームローン20億円（7年元利均等）",key=True)
inp(25,"金利",0.03,PCT,src="仮定")
inp(26,"返済年数",7,'0',src="仮定（みずほ銀行と協議中）")
a["A28"]="■ 年次の仮定（2027〜2032年）"; a["A28"].font=B
row(29,"客単価の値上げ率",[0.05,0.05,0.03,0.03,0.03,0.03],src="仮定：2年間5%、以降3%（ユーザー指定：値上げ効果を織り込む）",key=True)
row(30,"客数の増減率",[0,0,0,0,0,0],src="仮定：席数・営業日数は据置（予約は約3か月先まで満席）")
row(31,"物販の成长率".replace("长","長"),[0.10,0.20,0.20,0.10,0.10,0.10],src="仮定：製造拠点の確保で2028〜2029年に拡大",key=True)
row(32,"食材・ワインの単価上昇率",[0.03]*6,src="仮定")
row(33,"人件費・経費の上昇率",[0.03]*6,src="仮定（賃上げ）")
row(34,"後継料理長の追加人件費",[0,15,15,15,15,15],NUM,src="仮定：2028年から年15百万円")
row(35,"岸田氏の役員報酬",[20,20,20,0,0,0],NUM,src="条件合意：ロックアップ3年（B案）は年2,000万円、以降は出勤義務なし",key=True)
row(36,"岸田氏法人へのコンサルティング費（アーンアウト）",[0,0,0,400,400,0],NUM,src="ユーザー指定：4年目・5年目に三つ星維持で各4億円、対象会社の費用として支払う",key=True)
a.column_dimensions["A"].width=44; a.column_dimensions["B"].width=16; a.column_dimensions["I"].width=62
for col in YC: a.column_dimensions[col].width=10
a.freeze_panes="B5"

# ---------------- CF計画 ----------------
s=wb.create_sheet("CF計画")
s["A1"]="カンテサンス CF計画（2027〜2032年・三つ星維持ケース）"; s["A1"].font=T
s["A2"]="単位：百万円。前提条件シートの値を参照して計算しています（緑字＝他シート参照）。"; s["A2"].font=Font(name=F,size=9,color="6E6368")
heads=["項目","FY2026（参考）"]+YRS
for i,h in enumerate(heads):
    c=s.cell(row=4,column=i+1,value=h); c.font=H; c.fill=HF; c.alignment=Alignment(horizontal="center")
P="前提条件!"
def put(r,label,bform,form,fmt=NUM,bold=False,fill=False):
    s.cell(row=r,column=1,value=label).font=B if bold else BLK
    cells=[("B",bform)]+[(col,form(col,prev)) for col,prev in zip(YC,["B"]+YC[:-1])]
    for col,f in cells:
        if f is None: continue
        c=s[f"{col}{r}"]; c.value=f; c.number_format=fmt
        direct=isinstance(f,str) and re.fullmatch(r"=前提条件!\$?[A-Z]+\$?\d+",f) is not None
        c.font=Font(name=F,size=10,bold=bold,color="008000" if direct else "000000")
        if fill: c.fill=TF
    if fill: s[f"A{r}"].fill=TF

put(5,"レストラン売上","="+P+"B6-"+P+"B7",lambda c,p:f"={p}5*(1+{P}{c}29)*(1+{P}{c}30)")
put(6,"物販売上","="+P+"B7",lambda c,p:f"={p}6*(1+{P}{c}31)")
put(7,"売上高",None,lambda c,p:f"={c}5+{c}6",bold=True,fill=True); s["B7"]="=B5+B6"; s["B7"].number_format=NUM; s["B7"].font=B; s["B7"].fill=TF
put(8,"売上原価（レストラン）","="+P+"B8-"+P+"B7*"+P+"B9",lambda c,p:f"={p}8*(1+{P}{c}32)*(1+{P}{c}30)")
put(9,"売上原価（物販）","=B6*"+P+"B9",lambda c,p:f"={c}6*{P}$B$9")
put(10,"売上総利益","=B7-B8-B9",lambda c,p:f"={c}7-{c}8-{c}9",bold=True)
put(11,"　粗利率","=IF(B7=0,0,B10/B7)",lambda c,p:f"=IF({c}7=0,0,{c}10/{c}7)",PCT)
put(12,"人件費・経費（岸田氏報酬を除く）","="+P+"B12",lambda c,p:f"={p}12*(1+{P}{c}33)",NUM1)
put(13,"後継料理長の追加人件費",0,lambda c,p:f"={P}{c}34")
put(14,"AM管理報酬",0,lambda c,p:f"={P}$B$21")
put(15,"岸田氏の役員報酬","="+P+"B11",lambda c,p:f"={P}{c}35",NUM1)
put(16,"岸田氏法人へのコンサルティング費",0,lambda c,p:f"={P}{c}36")
put(17,"販管費合計","=SUM(B12:B16)",lambda c,p:f"=SUM({c}12:{c}16)",NUM1,bold=True)
put(18,"EBITDA","=B10-B17",lambda c,p:f"={c}10-{c}17",bold=True,fill=True)
put(19,"減価償却費",0,lambda c,p:f"={P}$B$16")
put(20,"営業利益","=B18-B19",lambda c,p:f"={c}18-{c}19",bold=True)
put(21,"　営業利益率","=IF(B7=0,0,B20/B7)",lambda c,p:f"=IF({c}7=0,0,{c}20/{c}7)",PCT)
put(22,"支払利息",None,lambda c,p:f"={c}38*{P}$B$25")
put(23,"税引前利益",None,lambda c,p:f"={c}20-{c}22",bold=True)
put(24,"法人税等",None,lambda c,p:f"=MAX(0,{c}23)*{P}$B$15")
put(25,"当期純利益",None,lambda c,p:f"={c}23-{c}24",bold=True,fill=True)

s["A27"]="■ キャッシュフロー"; s["A27"].font=B
put(28,"当期純利益",None,lambda c,p:f"={c}25")
put(29,"減価償却費",None,lambda c,p:f"={c}19")
put(30,"設備投資",None,lambda c,p:f"=-{P}$B$17")
put(31,"FY2026分 法人税の納付（退職金の損金算入後）",None,lambda c,p:(f"=-({P}B19-{P}B20*{P}B15)" if c=="C" else 0),NUM1)
put(32,"営業CF（借入返済前）",None,lambda c,p:f"=SUM({c}28:{c}31)",NUM1,bold=True)
put(33,"借入元本の返済",None,lambda c,p:f"=-{c}41")
put(34,"借入返済後のCF",None,lambda c,p:f"={c}32+{c}33",NUM1,bold=True,fill=True)
put(35,"期末現金残高",None,lambda c,p:(f"={P}B18+{c}34" if c=="C" else f"={p}35+{c}34"),NUM1,bold=True)

s["A37"]="■ 買収借入（7年元利均等）"; s["A37"].font=B

put(38,"期首残高",None,lambda c,p:(f"={P}B24" if c=="C" else f"={p}42"))
put(39,"元利返済額",None,lambda c,p:f"=IF({c}38<=0.001,0,-PMT({P}$B$25,{P}$B$26,{P}$B$24))",NUM1)
put(40,"　うち利息",None,lambda c,p:f"={c}22",NUM1)
put(41,"　うち元本",None,lambda c,p:f"=MIN({c}38,{c}39-{c}40)",NUM1)
put(42,"期末残高",None,lambda c,p:f"={c}38-{c}41",NUM1,bold=True)
put(43,"DSCR（返済余力）",None,lambda c,p:f"=IF({c}39=0,0,({c}18-{c}24-{P}$B$17)/{c}39)",X,bold=True,fill=True)
s["A44"]="DSCR＝（EBITDA−法人税等−設備投資）÷元利返済額。1.0倍未満の年は、それまでに積み上がった現金で返済します。"
s["A44"].font=Font(name=F,size=9,color="6E6368")

s["A46"]="■ 損金算入による節税効果（ご参考）"; s["A46"].font=B
put(47,"決済時の役員退職金（2026年度に損金算入）",None,lambda c,p:(f"={P}B20*{P}B15" if c=="C" else 0),NUM1)
put(48,"コンサルティング費（アーンアウト）",None,lambda c,p:f"={c}16*{P}$B$15",NUM1)
put(49,"節税効果 合計",None,lambda c,p:f"={c}47+{c}48",NUM1,bold=True)
put(50,"節税効果 累計",None,lambda c,p:(f"={c}49" if c=="C" else f"={p}50+{c}49"),NUM1,bold=True,fill=True)
s["A51"]="株式対価で支払った場合はいずれも損金にならず、この節税効果は生じません。退職金の効果は2026年度の税額減少として、2027年の納付時に現金化します。"
s["A51"].font=Font(name=F,size=9,color="6E6368")
s.column_dimensions["A"].width=46
for col in ["B"]+YC: s.column_dimensions[col].width=12
s.freeze_panes="B5"

# ---------------- サマリー ----------------
m=wb.create_sheet("サマリー",0)
m["A1"]="カンテサンス CF計画 サマリー（三つ星維持ケース）"; m["A1"].font=T
m["A2"]="単位：百万円。数値はすべてCF計画シートからの参照です。"; m["A2"].font=Font(name=F,size=9,color="6E6368")
for i,h in enumerate(["指標"]+YRS+["6年計"]):
    c=m.cell(row=4,column=i+1,value=h); c.font=H; c.fill=HF; c.alignment=Alignment(horizontal="center")
items=[("売上高",7,NUM),("EBITDA",18,NUM),("営業利益",20,NUM),("当期純利益",25,NUM),("借入返済後のCF",34,NUM),
       ("期末現金残高",35,NUM),("借入金期末残高",42,NUM),("DSCR",43,X),("節税効果（退職金・コンサル費）",49,NUM)]
for k,(lab,r,fmt) in enumerate(items):
    rr=5+k; m.cell(row=rr,column=1,value=lab).font=BLK
    for j,col in enumerate(YC):
        c=m.cell(row=rr,column=2+j,value=f"='CF計画'!{col}{r}"); c.font=GRN; c.number_format=fmt
    if lab in ("期末現金残高","借入金期末残高","DSCR"):
        tot=None
    else:
        tot=f"=SUM(B{rr}:G{rr})"
    if tot: c=m.cell(row=rr,column=8,value=tot); c.font=B; c.number_format=fmt
m["A15"]="最低DSCR"; m["B15"]="=MIN(B12:G12)"; m["B15"].number_format=X; m["B15"].font=B
m["A16"]="最低DSCRの年"; m["B16"]='=INDEX(B4:G4,MATCH(B15,B12:G12,0))'; m["B16"].font=B
m["A17"]="2032年末の現金残高"; m["B17"]="=G10"; m["B17"].number_format=NUM; m["B17"].font=B
notes=["【主な前提】三つ星を2027〜2032年に維持。客単価は2年間5%、以降3%の値上げ。物販は製造拠点の確保で拡大。費用は食材・ワイン3%、人件費・経費3%の上昇。",
 "【岸田様へのお支払い】決済時に役員退職金2.25億円（対象会社が支給・2026年度に損金算入）。2030年・2031年に岸田様の法人へコンサルティング費として各4億円（対象会社の費用）。",
 "【税務上の留意点】退職金は賞与を含む実質月額での算定となるため否認リスクあり。コンサルティング費は役務提供の実態と対価の相当性が必要で、実態が伴わない場合は寄附金・株式対価の後払いと認定され損金不算入となるリスクが高い。双方の税理士の確認が前提。",
 "【モデルの簡略化】運転資本の増減は無視。法人税は発生年度に納付（FY2026分のみ2027年に納付）。欠損金の繰越は考慮せず。消費税は除く（コンサル費の消費税は仕入税額控除の対象）。買収借入は合併後の会社が返済する前提（WineBankで借りる形の場合は、借入返済後のCFが配当原資になります）。"]
for i,t in enumerate(notes):
    c=m.cell(row=19+i,column=1,value=t); c.font=Font(name=F,size=9); c.alignment=Alignment(wrap_text=True,vertical="top")
    m.merge_cells(start_row=19+i,start_column=1,end_row=19+i,end_column=8); m.row_dimensions[19+i].height=40
m.column_dimensions["A"].width=34
for col in "BCDEFGH": m.column_dimensions[col].width=11
wb.save(OUT); print("saved")
