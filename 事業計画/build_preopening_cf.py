# -*- coding: utf-8 -*-
"""株式会社Brasserie Thierry Marx　開業までの資金繰り（月次CF）2026年11月〜2027年6月（単位：万円）"""
import os, openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.formatting.rule import CellIsRule
from openpyxl.utils import get_column_letter as CL
OUT=os.path.join(os.path.dirname(os.path.abspath(__file__)),"BTM_開業までの資金繰り_20261121.xlsx")
F="Meiryo"; NAVY="1F3864"; SUB="D9E2F3"; INP="EAF1FB"; KEY="FFF2CC"; GREY="F2F2F2"; RED="C00000"
thin=Side(style="thin",color="BFBFBF"); BOX=Border(left=thin,right=thin,top=thin,bottom=thin)
N='#,##0;▲#,##0;-'
def st(c,size=11,bold=False,color="000000",fill=None,al="left",fmt=None,wrap=False):
    c.font=Font(name=F,size=size,bold=bold,color=color); c.border=BOX
    c.alignment=Alignment(horizontal=al,vertical="center",wrap_text=wrap)
    if fill: c.fill=PatternFill("solid",fgColor=fill)
    if fmt: c.number_format=fmt
def band(ws,r,text,last,fill=NAVY,color="FFFFFF",size=12):
    for col in range(1,last+1):
        c=ws.cell(r,col); c.fill=PatternFill("solid",fgColor=fill); c.font=Font(name=F,bold=True,color=color,size=size)
    ws.cell(r,1).value=text
def setup(ws):
    ws.sheet_view.showGridLines=False; ws.sheet_view.zoomScale=100
    ws.page_setup.orientation="landscape"; ws.page_setup.paperSize=ws.PAPERSIZE_A4
    ws.sheet_properties.pageSetUpPr.fitToPage=True; ws.page_setup.fitToWidth=1; ws.page_setup.fitToHeight=0
wb=openpyxl.Workbook()

# ═════ 前提 ═════
P=wb.active; P.title="前提"; setup(P)
P.column_dimensions["A"].width=40; P.column_dimensions["B"].width=12; P.column_dimensions["C"].width=70
band(P,1,"前提（水色＝入力値・単位：万円）",3)
P["A2"].value="ここを変えると「月次CF」「サマリー」が再計算されます。「要確認」は仮置きの数字です。"; P["A2"].font=Font(name=F,size=9,color="595959")
rows=[
 ("■ 資本・調達",None,None),
 ("10月末の預金残高（資本金10万＋P3払込2,000万）",2010,"通帳で要確認（10月中の支出・DES端数21,416円の返金があれば差し引き）"),
 ("田角様（Land＆Company）134株×15万円",2010,"11/13 着金済み"),
 ("個人投資家 1名あたり（66株×16万円）",1056,"池上様・城戸様ほか。12/1までに払込"),
 ("個人投資家 人数（名）",4,"4〜5名。サマリーで4名・5名の両方を表示"),
 ("WineBank P3 追加払込（2月末）",1500,"150株×10万円。アピシウスからの配当を充当"),
 ("参考：P3のDES（10/30・現金の動きなし）",3602,"契約金1回目1,650・敷金1,111・山本様550・渡航費等・内装管理費141・Notes Design 55"),
 ("■ 開業前の投資",None,None),
 ("事業費（設計・B工事・C工事・厨房機器・FF&E／税抜）",19425,"事業計画の55.5坪×350万円"),
 ("　うち 家主立替（開業後10年分割で返済）",10000,"開業時は支払わない"),
 ("　うち 支払済み（Notes Design 55＋内装管理費141）",196,"DESに含まれる"),
 ("契約金 2回目（税抜）",1500,"全2回のうち1回目1,500万円はDES済み。支払時期 要確認（仮：4月）"),
 ("消費税率",0.10,"事業費・契約金にかかる消費税。課税事業者を選択すれば翌期に還付（要届出）"),
 ("ワイン・美術品在庫",5000,"事業計画の1号店分。WineBankからの仕入れなら支払条件を調整可能（要確認）"),
 ("■ 開業後の運営（5月〜）",None,None),
 ("月商（1年目平均）",3073,"事業計画 1年目 3.69億円÷12"),
 ("売上の当月入金率",0.70,"カード等の残りは翌月入金"),
 ("原価率（翌月払い）",0.305,"料理28%・飲料35%"),
 ("その他変動費率（当月払い）",0.155,"消耗品・広告・水光熱・ロイヤリティ・保険・修繕"),
 ("人件費（開業後・月額）",1190,"稲葉さん案の人員（36名）での試算。予算は月1,060万円"),
 ("家賃（固定・月額）",222,"開始月 要確認（フリーレントの有無）。仮：5月から"),
 ("保証金の分割払い（月額）",46.3,"賃貸借契約の分割分。開始月 要確認。仮：5月から"),
 ("内装立替の返済（家主・月額）",83.3,"1億円÷120回。開始月 要確認。仮：5月から"),
 ("■ 人件費の計算",None,None),
 ("法定福利費率（社員）",0.155,"健康保険・厚生年金・雇用保険・労災など"),
 ("社会保険等（アルバイト）",0.05,"週30時間以上の加入者分の概算"),
]
NAME={}
r=3
for lab,v,note in rows:
    if v is None:
        band(P,r,lab,3,fill=SUB,color="000000",size=10); r+=1; continue
    st(P[f"A{r}"],11); P[f"A{r}"].value=lab
    fmt="0.0%" if isinstance(v,float) and v<1 else "#,##0.0" if isinstance(v,float) else "#,##0"
    st(P[f"B{r}"],11,al="center",fill=INP,fmt=fmt,color="0000FF"); P[f"B{r}"].value=v
    st(P[f"C{r}"],9,color=(RED if "要確認" in note else "595959")); P[f"C{r}"].value=note
    NAME[lab]=f"前提!$B${r}"; r+=1
def nm(key): return [v for k,v in NAME.items() if k.startswith(key)][0]

# ═════ 人件費（開業前） ═════
L=wb.create_sheet("開業前人件費"); setup(L)
MONTHS=["2026年11月","12月","2027年1月","2月","3月","4月","5月","6月"]
MC=[CL(3+i) for i in range(8)]  # C..J
L.column_dimensions["A"].width=30; L.column_dimensions["B"].width=10
for c in MC: L.column_dimensions[c].width=11
L.column_dimensions["K"].width=11; L.column_dimensions["L"].width=48
band(L,1,"開業前の人件費（万円）　上段＝月額給与、下段＝在籍率（0〜1）",12)
L["A2"].value="稲葉さんの採用予定（役職者1月中・他の社員3月中・アルバイトは引き渡し前後）にもとづく仮置き。グループ店で勤務する期間の給与の負担先は要確認。"
L["A2"].font=Font(name=F,size=9,color=RED)
st(L["A4"],10,True,"FFFFFF",NAVY); L["A4"].value="区分"
st(L["B4"],10,True,"FFFFFF",NAVY,al="center"); L["B4"].value="月額給与"
for i,m in enumerate(MONTHS): st(L[f"{MC[i]}4"],10,True,"FFFFFF",NAVY,al="center"); L[f"{MC[i]}4"].value=m
st(L["K4"],10,True,"FFFFFF",NAVY,al="center"); L["K4"].value="11〜4月計"
st(L["L4"],10,True,"FFFFFF",NAVY); L["L4"].value="備考"
G=[("幹部3名（稲葉・上村・山田）",185,[1,1,1,1,1,1,0,0],"社員","上村さんは11/1入社（OTO・Terrace勤務）。稲葉さん・山田さんの入社日 要確認"),
   ("役職者3名（シェフパティシエ・スーシェフ・サービス）",135,[0,0,0,1,1,1,0,0],"社員","1月中に採用→2月入社と仮定"),
   ("一般社員11名",369,[0,0,0,0,.5,1,0,0],"社員","3月中に入社（3月は半月分）"),
   ("アルバイト19名",284,[0,0,0,0,0,.5,0,0],"アルバイト","引き渡し前後に入社（4月は半月分）")]
r=5
GROWS=[]
for lab,amt,occ,kb,note in G:
    st(L[f"A{r}"],11,True); L[f"A{r}"].value=lab
    st(L[f"B{r}"],11,al="center",fill=INP,fmt="#,##0",color="0000FF"); L[f"B{r}"].value=amt
    for i,c in enumerate(MC):
        st(L[f"{c}{r}"],11,al="center",fmt=N); L[f"{c}{r}"].value=f"=$B{r}*{c}{r+1}"
        st(L[f"{c}{r+1}"],9,al="center",fill=INP,fmt="0%",color="0000FF"); L[f"{c}{r+1}"].value=occ[i]
    st(L[f"K{r}"],11,True,al="center",fmt=N); L[f"K{r}"].value=f"=SUM(C{r}:H{r})"
    st(L[f"A{r+1}"],9,color="595959"); L[f"A{r+1}"].value="　在籍率"
    st(L[f"L{r}"],9,color="595959"); L[f"L{r}"].value=note
    GROWS.append((r,kb)); r+=2
shain="+".join(f"{{c}}{rr}" for rr,kb in GROWS if kb=="社員"); arb="+".join(f"{{c}}{rr}" for rr,kb in GROWS if kb!="社員")
st(L[f"A{r}"],11); L[f"A{r}"].value="法定福利費・社会保険等"
for c in MC:
    st(L[f"{c}{r}"],11,al="center",fmt=N); L[f"{c}{r}"].value=f"=({shain.format(c=c)})*{nm('法定福利費率')}+({arb.format(c=c)})*{nm('社会保険等')}"
st(L[f"K{r}"],11,True,al="center",fmt=N); L[f"K{r}"].value=f"=SUM(C{r}:H{r})"; r+=1
st(L[f"A{r}"],12,True,fill=KEY); L[f"A{r}"].value="開業前人件費　合計"
st(L[f"B{r}"],11,fill=KEY)
for c in MC+["K"]:
    st(L[f"{c}{r}"],12,True,al="center",fmt=N,fill=KEY)
    L[f"{c}{r}"].value=(f"=SUM(C{r}:H{r})" if c=="K" else f"=SUM({c}5,{c}7,{c}9,{c}11,{c}{r-1})")
LTOT=r
for c in ["I","J"]: L[f"{c}{LTOT}"].value=0  # 5月以降は「月次CF」の開業後人件費で計上

# ═════ 月次CF ═════
C=wb.create_sheet("月次CF",0); setup(C)
C.column_dimensions["A"].width=40
for c in MC: C.column_dimensions[c].width=11
C.column_dimensions["B"].width=3; C.column_dimensions["K"].width=12; C.column_dimensions["L"].width=50
band(C,1,"株式会社Brasserie Thierry Marx　開業までの資金繰り（月次・万円）",12)
C["A2"].value="開業：2027年4月下旬（引き渡し4/15）。5・6月は開業後の運転資金の確認用。水色＝入力（月ごとの金額を直接変更可）、灰色＝前提シート・人件費シートから計算。"
C["A2"].font=Font(name=F,size=9,color="595959")
st(C["A4"],10,True,"FFFFFF",NAVY); C["A4"].value="項目"
st(C["B4"],10,True,"FFFFFF",NAVY)
for i,m in enumerate(MONTHS): st(C[f"{MC[i]}4"],10,True,"FFFFFF",NAVY,al="center"); C[f"{MC[i]}4"].value=m
st(C["K4"],10,True,"FFFFFF",NAVY,al="center"); C["K4"].value="11〜4月計"
st(C["L4"],10,True,"FFFFFF",NAVY); C["L4"].value="根拠・要確認事項"
C.row_dimensions[4].height=22
R={}
def sec(r,t): band(C,r,t,12,fill=SUB,color="000000",size=10)
def line(r,key,label,vals,note="",inp=False,bold=False,fill=None):
    st(C[f"A{r}"],11,bold); C[f"A{r}"].value=label; st(C[f"B{r}"],11)
    for i,c in enumerate(MC):
        v=vals[i] if isinstance(vals,list) else vals.format(c=c,p=(MC[i-1] if i else None),i=i)
        st(C[f"{c}{r}"],11,bold,al="center",fmt=N,fill=(INP if inp else fill),color=("0000FF" if inp else "000000"))
        C[f"{c}{r}"].value=v
    st(C[f"K{r}"],11,True,al="center",fmt=N,fill=fill); C[f"K{r}"].value=f"=SUM(C{r}:H{r})"
    st(C[f"L{r}"],9,color=(RED if "要確認" in note else "595959")); C[f"L{r}"].value=note
    R[key]=r
r=5
line(r,"open","期首残高",["="+nm("10月末の預金残高")]+[f"={MC[i-1]}{{close}}" for i in range(1,8)],"10月末の通帳残高から開始",bold=True); r+=1
sec(r,"■ 収入"); r+=1
line(r,"p3","出資　WineBank P3（追加払込）",[0,0,0,"="+nm("WineBank P3 追加払込"),0,0,0,0],"2月末までに150株",inp=False); r+=1
line(r,"tasumi","出資　田角様（Land＆Company）",["="+nm("田角様"),0,0,0,0,0,0,0],"11/13 着金済み"); r+=1
line(r,"inv","出資　個人投資家（66株×16万円×人数）",[0,f"={nm('個人投資家 1名あたり')}*{nm('個人投資家 人数')}",0,0,0,0,0,0],"12/1までに払込。人数は前提シート"); r+=1
line(r,"loan","借入（融資）",[0]*8,"検討用（日本政策金融公庫・制度融資など）。金額を入れると残高に反映",inp=True); r+=1
line(r,"sales","営業収入（開業後）",[0]*6+[f"={nm('月商')}*{nm('売上の当月入金率')}",f"={nm('月商')}*{nm('売上の当月入金率')}+{nm('月商')}*(1-{nm('売上の当月入金率')})"],"当月70%・翌月30%入金"); r+=1
line(r,"in","収入　計",f"=SUM({{c}}{R['p3']}:{{c}}{r-1})",bold=True,fill=GREY); r+=1
sec(r,"■ 支出（開業前の投資）"); r+=1
JP=[0,.05,.15,.25,.15,.40,0,0]
JIG=f"({nm('事業費（設計')}-{nm('　うち 家主立替')}-{nm('　うち 支払済み')})"
line(r,"jigyo","事業費（自己負担分・税抜）",[f"={JIG}*{p}" if p else 0 for p in JP],"1億9,425万−家主立替1億−支払済み196万＝9,229万。月の配分は仮置き（要確認：Notes Design・ホシザキ・TMMの支払条件）",inp=True); r+=1
line(r,"keiyaku","契約金 2回目（税抜）",[0,0,0,0,0,"="+nm("契約金 2回目"),0,0],"支払時期 要確認（仮：4月）",inp=True); r+=1
line(r,"tax","消費税（事業費・契約金）",f"=({{c}}{R['jigyo']}+{{c}}{R['keiyaku']})*{nm('消費税率')}","課税事業者を選択すれば2027年9月期の申告で還付（届出 要確認）"); r+=1
line(r,"wine","ワイン・美術品在庫",[0,0,0,0,0,"="+nm("ワイン・美術品在庫"),0,0],"支払条件 要確認（WineBankからの仕入れなら開業後の分割も可能）",inp=True); r+=1
sec(r,"■ 支出（開業前の費用）"); r+=1
line(r,"lab0","開業前人件費",[f"='開業前人件費'!{c}{LTOT}" for c in MC[:6]]+[0,0],"「開業前人件費」シート。グループ店勤務期間の負担先 要確認"); r+=1
line(r,"prep","開業準備金（広告・採用）",[0,0,100,100,100,100,0,0],"事業計画の400万円",inp=True); r+=1
line(r,"web","HP・SNS制作",[0,50,50,50,0,0,0,0],"仮置き（年内に骨子、2/1公開）",inp=True); r+=1
line(r,"france","フランス研修（1週間）",[0,0,0,300,0,0,0,0],"仮置き。渡航・滞在費の負担先 要確認",inp=True); r+=1
line(r,"stock","初期在庫（食材・飲料・消耗品）",[0,0,0,0,0,600,0,0],"仮置き（ワインは上の在庫に含む）",inp=True); r+=1
line(r,"recep","レセプション（3日）",[0,0,0,0,0,300,0,0],"仮置き（メディア・パートナー・高級ブランド）",inp=True); r+=1
line(r,"util","水道光熱・保険・通信（引き渡し後）",[0,0,0,0,30,80,0,0],"仮置き",inp=True); r+=1
line(r,"fee","登記・専門家報酬",[0,30,10,10,0,0,0,0],"増資登記（11月・12月・2月）など",inp=True); r+=1
line(r,"res","予備費",[0,0,0,0,0,500,0,0],"仮置き",inp=True); r+=1
sec(r,"■ 支出（開業後の運営）"); r+=1
line(r,"cogs","原価（翌月払い）",[0]*7+[f"={nm('月商')}*{nm('原価率')}"],"5月分を6月に支払"); r+=1
line(r,"lab1","人件費（開業後）",[0]*6+[f"={nm('人件費（開業後')}"]*2,"稲葉さん案の人員で試算（予算は月1,060万円）"); r+=1
line(r,"var","その他経費（変動費）",[0]*6+[f"={nm('月商')}*{nm('その他変動費率')}"]*2,""); r+=1
line(r,"rent","家賃（固定）",[0]*6+[f"={nm('家賃（固定')}"]*2,"開始月 要確認（フリーレントの有無）",inp=True); r+=1
line(r,"depo","保証金の分割払い",[0]*6+[f"={nm('保証金の分割払い')}"]*2,"開始月 要確認",inp=True); r+=1
line(r,"repay","内装立替の返済（家主）",[0]*6+[f"={nm('内装立替の返済')}"]*2,"開始月 要確認",inp=True); r+=1
line(r,"out","支出　計",f"=SUM({{c}}{R['jigyo']}:{{c}}{r-1})",bold=True,fill=GREY); r+=1
line(r,"net","収支",f"={{c}}{R['in']}-{{c}}{R['out']}",bold=True); r+=1
line(r,"close","期末残高",f"={{c}}{R['open']}+{{c}}{R['net']}",bold=True,fill=KEY); r+=1
# 期首残高のプレースホルダーを置換
for i,c in enumerate(MC):
    if i: C[f"{c}{R['open']}"].value=f"={MC[i-1]}{R['close']}"
C[f"K{R['open']}"].value=None; C[f"K{R['close']}"].value=f"=H{R['close']}"
C[f"L{R['close']}"].value="Kは4月末（開業時点）の残高"
r+=1
# 4名・5名の比較
for n in (4,5):
    st(C[f"A{r}"],11,True); C[f"A{r}"].value=f"期末残高（個人投資家 {n}名の場合）"; st(C[f"B{r}"],11)
    for i,c in enumerate(MC):
        adj=f"+({n}-{nm('個人投資家 人数')})*{nm('個人投資家 1名あたり')}" if i>=1 else ""
        st(C[f"{c}{r}"],11,True,al="center",fmt=N); C[f"{c}{r}"].value=f"={c}{R['close']}{adj}"
    st(C[f"K{r}"],11,True,al="center",fmt=N); C[f"K{r}"].value=f"=H{r}"
    R[f"n{n}"]=r; r+=1
r+=1
st(C[f"A{r}"],12,True,fill=KEY); C[f"A{r}"].value="最低残高（11月〜6月）"
st(C[f"C{r}"],12,True,al="center",fmt=N,fill=KEY); C[f"C{r}"].value=f"=MIN(C{R['close']}:J{R['close']})"
st(C[f"D{r}"],10,al="center"); C[f"D{r}"].value="4名"; st(C[f"E{r}"],12,True,al="center",fmt=N); C[f"E{r}"].value=f"=MIN(C{R['n4']}:J{R['n4']})"
st(C[f"F{r}"],10,al="center"); C[f"F{r}"].value="5名"; st(C[f"G{r}"],12,True,al="center",fmt=N); C[f"G{r}"].value=f"=MIN(C{R['n5']}:J{R['n5']})"
R["min"]=r
for key in ("close","n4","n5"):
    C.conditional_formatting.add(f"C{R[key]}:K{R[key]}",CellIsRule(operator="lessThan",formula=["0"],font=Font(name=F,bold=True,color=RED),fill=PatternFill("solid",fgColor="FFC7CE")))
C.freeze_panes="C5"

# ═════ サマリー ═════
S=wb.create_sheet("サマリー",0); setup(S)
S.column_dimensions["A"].width=44; S.column_dimensions["B"].width=13; S.column_dimensions["C"].width=13; S.column_dimensions["D"].width=56
band(S,1,"開業までの資金繰り　サマリー（万円）",4)
S["A2"].value="2026年11月〜2027年4月末（開業時点）の資金の出入り。詳細は「月次CF」。仮置きの数字は「要確認」として赤字で表示。"
S["A2"].font=Font(name=F,size=9,color="595959")
def hdr(r,cols):
    for j,t in enumerate(cols):
        c=S.cell(r,j+1); c.value=t; st(c,10,True,"FFFFFF",NAVY,al="center" if j else "left")
hdr(4,["調達（現金）","投資家4名","投資家5名","備考"])
def row(r,lab,f4,f5,note="",bold=False,fill=None,color="000000"):
    st(S[f"A{r}"],11,bold,fill=fill); S[f"A{r}"].value=lab
    for col,f in (("B",f4),("C",f5)):
        st(S[f"{col}{r}"],11,bold,al="center",fmt=N,fill=fill,color=color); S[f"{col}{r}"].value=f
    st(S[f"D{r}"],9,color=(RED if "要確認" in note else "595959"),fill=fill); S[f"D{r}"].value=note
CF="'月次CF'!"
row(5,"10月末残高（P3払込2,000万＋資本金10万）",f"={CF}C{R['open']}",f"={CF}C{R['open']}","")
row(6,"田角様（Land＆Company）",f"={CF}K{R['tasumi']}",f"={CF}K{R['tasumi']}","着金済み")
row(7,"個人投資家（66株×16万円）",f"=4*{nm('個人投資家 1名あたり')}",f"=5*{nm('個人投資家 1名あたり')}","12/1までに払込")
row(8,"WineBank P3 追加払込（2月末）",f"={CF}K{R['p3']}",f"={CF}K{R['p3']}","")
row(9,"借入（融資）",f"={CF}K{R['loan']}",f"={CF}K{R['loan']}","月次CFで入力")
row(10,"調達　計",f"=SUM(B5:B9)",f"=SUM(C5:C9)","",bold=True,fill=GREY)
row(11,"参考：P3のDES（支払済みの経費を株式に振替・現金なし）",f"={nm('参考：P3のDES')}",f"={nm('参考：P3のDES')}","契約金1回目・敷金・設計費など")
hdr(13,["使途（11月〜4月）","投資家4名","投資家5名","備考"])
U=[("事業費（自己負担分）","jigyo"),("契約金 2回目","keiyaku"),("消費税（事業費・契約金）","tax"),("ワイン・美術品在庫","wine"),
   ("開業前人件費","lab0"),("開業準備金（広告・採用）","prep"),("HP・SNS・フランス研修・初期在庫・レセプション等","web")]
rr=14
for lab,key in U:
    if key=="web":
        f=f"={CF}K{R['web']}+{CF}K{R['france']}+{CF}K{R['stock']}+{CF}K{R['recep']}+{CF}K{R['util']}+{CF}K{R['fee']}+{CF}K{R['res']}"
    else: f=f"={CF}K{R[key]}"
    note=C[f"L{R[key]}"].value or ""
    row(rr,lab,f,f,note); rr+=1
row(rr,"使途　計",f"=SUM(B14:B{rr-1})",f"=SUM(C14:C{rr-1})","",bold=True,fill=GREY); UT=rr; rr+=2
row(rr,"4月末（開業時点）の過不足",f"=B10-B{UT}",f"=C10-C{UT}","マイナスが不足額",bold=True,fill=KEY); GAP=rr; rr+=1
row(rr,"11月〜6月の最低残高",f"={CF}E{R['min']}",f"={CF}G{R['min']}","開業後2か月の運転資金を含む",bold=True,fill=KEY); rr+=1
for rr2 in (GAP,rr-1):
    S.conditional_formatting.add(f"B{rr2}:C{rr2}",CellIsRule(operator="lessThan",formula=["0"],font=Font(name=F,bold=True,color=RED)))
rr+=1
hdr(rr,["不足を埋める手段（案）","効果（万円）","時期","内容・確認先"]); rr+=1
M=[("ワイン・美術品の支払を開業後に分割","=" + nm("ワイン・美術品在庫"),"4月→開業後","WineBankからの仕入れ。グループ内で支払条件を調整（要確認）"),
   ("契約金 2回目を開業後の支払に","=" + nm("契約金 2回目") + "*(1+" + nm("消費税率") + ")","4月→開業後","WineBank→TBSの支払時期と、BTM→WineBankの精算時期（要確認）"),
   ("消費税の還付（課税事業者の選択）",f"={CF}K{R['tax']}","2027年秋以降","第1期（2026/10〜2027/9）中に「課税事業者選択届出書」の提出が必要。還付は申告後"),
   ("融資（日本政策金融公庫・制度融資）",0,"2〜3月","創業融資。WineBankグループの実績・出資で申込（金額は月次CFで入力）"),
   ("厨房機器・家具のリース",0,"4月","厨房機器（ホシザキ）をリースにすれば開業時の支出が減る"),
   ("フリーレント・内装立替返済の開始時期の交渉",0,"5月〜","賃料・保証金分割・立替返済の開始月（三井不動産と要確認）")]
for lab,f,t,note in M:
    st(S[f"A{rr}"],11); S[f"A{rr}"].value=lab
    st(S[f"B{rr}"],11,al="center",fmt=N,fill=(INP if f==0 else None),color=("0000FF" if f==0 else "000000")); S[f"B{rr}"].value=f
    st(S[f"C{rr}"],10,al="center"); S[f"C{rr}"].value=t
    st(S[f"D{rr}"],9,color=(RED if "要確認" in note else "595959"),wrap=True); S[f"D{rr}"].value=note
    S.row_dimensions[rr].height=30; rr+=1
MS=rr-len(M)
st(S[f"A{rr}"],11,True,fill=KEY); S[f"A{rr}"].value="上の1・2を実施した場合の4月末の過不足"
for col in "BC":
    st(S[f"{col}{rr}"],11,True,al="center",fmt=N,fill=KEY); S[f"{col}{rr}"].value=f"={col}{GAP}+$B${MS}+$B${MS+1}"
st(S[f"D{rr}"],9,color=RED,fill=KEY); S[f"D{rr}"].value="残る不足は融資・追加出資で手当てが必要。消費税の還付は開業後のため開業時点では使えない"
S.conditional_formatting.add(f"B{rr}:C{rr}",CellIsRule(operator="lessThan",formula=["0"],font=Font(name=F,bold=True,color=RED)))
rr+=2
hdr(rr,["事業計画（資金計画）との比較","事業計画","今回","備考"]); rr+=1
for lab,a,b,note in [("甲側（WineBank P3）","7000",f"={nm('参考：P3のDES')}+2000+{nm('WineBank P3 追加払込')}","DES3,602＋現金2,000＋2月1,500"),
                     ("外部投資家",15000,f"={nm('田角様')}+4*{nm('個人投資家 1名あたり')}","事業計画は外部1,000株・1.5億円。今回は田角様＋4名"),
                     ("合計",f"=B{rr}+B{rr+1}",f"=C{rr}+C{rr+1}","")]:
    st(S[f"A{rr}"],11,bold=(lab=="合計")); S[f"A{rr}"].value=lab
    st(S[f"B{rr}"],11,al="center",fmt=N); S[f"B{rr}"].value=(int(a) if isinstance(a,str) and a.isdigit() else a)
    st(S[f"C{rr}"],11,al="center",fmt=N); S[f"C{rr}"].value=b
    st(S[f"D{rr}"],9,color="595959"); S[f"D{rr}"].value=note; rr+=1
wb.calculation.fullCalcOnLoad=True
wb.save(OUT); print("saved",OUT)
