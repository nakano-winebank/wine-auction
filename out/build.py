# -*- coding: utf-8 -*-
"""FY2027(2027年9月期)利益予測モデル生成スクリプト
出典: 事業計画202608(銀行様) 全社シート月次 / 決算報告書 第54期"""
import json
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

F='Arial'
BK=Font(name=F); BL=Font(name=F,color='0000FF'); GR=Font(name=F,color='008000')
SB=Font(name=F,bold=True); HD=Font(name=F,bold=True,color='FFFFFF')
SM=Font(name=F,size=9,color='595959'); RD=Font(name=F,size=9,color='C00000')
GY=Font(name=F,color='808080',italic=True)
HF=PatternFill('solid',fgColor='1F3864'); SF=PatternFill('solid',fgColor='D9E2F3')
YL=PatternFill('solid',fgColor='FFFF00'); TF=PatternFill('solid',fgColor='F2F2F2')
OP=PatternFill('solid',fgColor='FFF2CC'); OR_=PatternFill('solid',fgColor='C6E0B4')
GRP=PatternFill('solid',fgColor='E7E6E6')
CREAMFILL=PatternFill('solid',fgColor='FDF6E3')
TB=Border(top=Side(style='thin',color='000000'))
YEN='¥#,##0;(¥#,##0);-'; PCT='0.0%'
SGA=json.load(open('sga_monthly.json'))
FM=['2025/10','2025/11','2025/12','2026/01','2026/02','2026/03','2026/04','2026/05','2026/06','2026/07','2026/08','2026/09']
SALES=[32789307,96919229,43039844,32477958,41290432,33033585,31863679,33917025,31504488,60489854,37962048,232918371]
COGS =[18502877,69212121,21085289,16521949,21070367,18454664,16184238,15777832,15172640,38396406,23721353,204966678]
GP   =[14286430,27707108,21954555,15956009,20220065,14578921,15679441,18139193,16331848,22093448,14240695,27951692]
ACC=list(SGA.keys())
wb=Workbook(); wb.remove(wb.active)

def bar(ws,r,t,span=6):
    ws.cell(r,2,t).font=HD
    for c in range(2,2+span): ws.cell(r,c).fill=HF
    ws.cell(r,2).font=HD

# ============ ④FY2026月次実績 ============
h=wb.create_sheet('④FY2026月次実績')
h.column_dimensions['A'].width=3; h.column_dimensions['B'].width=26
for i in range(12): h.column_dimensions[get_column_letter(3+i)].width=13
h.column_dimensions['O'].width=15; h.column_dimensions['P'].width=15
h.column_dimensions['Q'].width=15; h.column_dimensions['R'].width=14
h['B1']='FY2026（2025年10月-2026年9月）月次　実績／見込'; h['B1'].font=Font(name=F,bold=True,size=13)
h['B2']='青字＝実績（2026/06まで）　灰字斜体＝見込（2026/07以降・同一値が並ぶプラグ）　出典：事業計画202608（銀行様）全社シート'; h['B2'].font=SM
h['B3']='飲食事業の撤退により、2026/04以降が撤退後の実力値。2025/10-2026/03には撤退店舗の費用が含まれる。'; h['B3'].font=RD
r=5
h.cell(r,2,'科目').font=SB; h.cell(r,2).fill=SF
for i,m in enumerate(FM):
    c=h.cell(r,3+i,m); c.font=SB; c.fill=SF; c.alignment=Alignment(horizontal='center')
for j,t in enumerate(['通期','①10-3月\n平均','②4-6月\n平均','差 ②-①']):
    c=h.cell(r,15+j,t); c.font=SB; c.fill=SF; c.alignment=Alignment(horizontal='center',wrap_text=True)
h.row_dimensions[r].height=30
def hrow(rr,label,vals,bold=False,fill=None,avg=True):
    c=h.cell(rr,2,label); c.font=SB if bold else BK
    if fill: c.fill=fill
    for i,v in enumerate(vals):
        cc=h.cell(rr,3+i,v); cc.number_format=YEN; cc.font=(SB if bold else (BL if i<9 else GY))
        if fill: cc.fill=fill
    for j,f in enumerate([f'=SUM(C{rr}:N{rr})',f'=AVERAGE(C{rr}:H{rr})',f'=AVERAGE(I{rr}:K{rr})',f'=Q{rr}-P{rr}']):
        cc=h.cell(rr,15+j,f if (avg or j==0) else None); cc.number_format=YEN; cc.font=SB; cc.fill=fill or TF
SR,CR,GR_=6,7,8
hrow(6,'売上',SALES); hrow(7,'売上原価',COGS); hrow(8,'売上総利益',GP,bold=True,fill=TF)
h.cell(10,2,'【販売費及び一般管理費 内訳】').font=SB; h.cell(10,2).fill=GRP
SG0=11
for k,acc in enumerate(ACC): hrow(SG0+k,acc,SGA[acc])
SG1=SG0+len(ACC)-1
SGT=SG1+1
h.cell(SGT,2,'販管費 合計').font=SB; h.cell(SGT,2).border=TB
for i in range(12):
    col=get_column_letter(3+i)
    c=h.cell(SGT,3+i,f'=SUM({col}{SG0}:{col}{SG1})'); c.number_format=YEN; c.font=SB; c.fill=TF; c.border=TB
for j,f in enumerate([f'=SUM(C{SGT}:N{SGT})',f'=AVERAGE(C{SGT}:H{SGT})',f'=AVERAGE(I{SGT}:K{SGT})',f'=Q{SGT}-P{SGT}']):
    c=h.cell(SGT,15+j,f); c.number_format=YEN; c.font=SB; c.fill=TF; c.border=TB
OPR=SGT+1
h.cell(OPR,2,'営業利益').font=SB; h.cell(OPR,2).fill=OP; h.cell(OPR,2).border=TB
for i in range(12):
    col=get_column_letter(3+i)
    c=h.cell(OPR,3+i,f'={col}{GR_}-{col}{SGT}'); c.number_format=YEN; c.font=SB; c.fill=OP; c.border=TB
c=h.cell(OPR,15,f'=SUM(C{OPR}:N{OPR})'); c.number_format=YEN; c.font=SB; c.fill=OP; c.border=TB
h.cell(OPR+2,2,'※「差 ②-①」がマイナスの科目＝飲食撤退および固定費削減により減少した費用。合計で月▲8.58百万円（年▲103百万円）。').font=RD
h.freeze_panes='C6'

# ============ ②前提 ============
p=wb.create_sheet('②前提')
p.column_dimensions['A'].width=3; p.column_dimensions['B'].width=38
for c in 'CDE': p.column_dimensions[c].width=17
p.column_dimensions['F'].width=66
p['B1']='FY2027（2027年9月期）利益予測モデル　－　前提条件'; p['B1'].font=Font(name=F,bold=True,size=14)
p['B2']='青字＝入力セル／黄色＝主要前提／黒字＝計算式　単位：円（税別）　作成日 2026/08/21'; p['B2'].font=SM
bar(p,4,'【1】ベース：飲食撤退後の実力値（2026/04-06 実績3か月平均）')
p.cell(5,2,'項目').font=SB; p.cell(5,3,'月次平均').font=SB; p.cell(5,3).alignment=Alignment(horizontal='center')
for c in (2,3): p.cell(5,c).fill=SF
base=[('売上',f"=AVERAGE('④FY2026月次実績'!I{SR}:K{SR})"),
      ('売上総利益',f"=AVERAGE('④FY2026月次実績'!I{GR_}:K{GR_})"),
      ('販管費',f"=AVERAGE('④FY2026月次実績'!I{SGT}:K{SGT})")]
for i,(t,f_) in enumerate(base):
    p.cell(6+i,2,t).font=BK
    c=p.cell(6+i,3,f_); c.number_format=YEN; c.font=GR; c.fill=TF
p.cell(9,2,'売上総利益率').font=BK
c=p.cell(9,3,'=C7/C6'); c.number_format=PCT; c.font=BK
p.cell(6,6,'2026/03以前は飲食撤退店舗の売上・費用を含むため基準から除外（貴社ご指摘）。').font=RD
S_M,G_M,P_M,GM=6,7,8,9
bar(p,11,'【2】上乗せ案件（2026/09-2027/08）')
for j,t in enumerate(['区分','金額','','損益計上区分']):
    c=p.cell(12,2+j,t); c.font=SB; c.fill=SF
items=[('経営指導料　Value table',10000000,'営業収益（原価なし）'),
       ('経営指導料　Prime',60000000,'営業収益（原価なし）'),
       ('経営指導料　Apicius',10000000,'営業収益（原価なし）'),
       ('経営指導料　Thierry Marx',2500000,'営業収益（原価なし）'),
       ('経営指導料　ito＋Aqua＋Hokkaido',10000000,'営業収益（原価なし）'),
       ('インセンティブ　Apicius2 shot',20000000,'営業収益（成功報酬・一時）'),
       ('投資売買益　Cruiser shot',20000000,'営業外収益（一時）')]
I0=13
for i,(n,v,k) in enumerate(items):
    p.cell(I0+i,2,n).font=BK
    c=p.cell(I0+i,3,v); c.font=BL; c.number_format=YEN; c.fill=YL
    p.cell(I0+i,5,k).font=BK
I1=I0+6; TT=I1+1
for lab,f_,rr in [('合計',f'=SUM(C{I0}:C{I1})',TT),('　うち 営業収益',f'=SUM(C{I0}:C{I1-1})',TT+1),('　うち 営業外収益',f'=C{I1}',TT+2)]:
    p.cell(rr,2,lab).font=SB if rr==TT else BK
    c=p.cell(rr,3,f_); c.number_format=YEN; c.font=SB if rr==TT else BK
    if rr==TT: c.fill=TF
ADV,INV=TT+1,TT+2
p.cell(TT,6,'※期間表記は2026/09-2027/08。決算期(2026/10-2027/09)と1か月ズレるため全額FY2027帰属で試算。').font=RD
p.cell(TT+1,6,'※うち約100百万円はグループ内取引（Value table・Prime・Apicius・Apicius2）。').font=RD
O0=TT+4
bar(p,O0,'【3】その他前提')
oth=[('上場関連コスト（年額）',0,YEN,'FY2027は計上しない方針のため0。計上する場合は年額を入力。'),
     ('営業外費用（支払利息等・年額）',15000000,YEN,'事業計画FY2027計画値'),
     ('インセンティブ 計上月（1〜12）',6,'0','6＝2027年3月'),
     ('投資売買益 計上月（1〜12）',6,'0','6＝2027年3月'),
     ('目標営業利益',100000000,YEN,'シナリオDの目標'),
     ('新規顧客売上 計画額（FY2027）',1066000000,YEN,'事業計画のワイン投資 新規顧客計画 合計')]
for i,(t,v,fmt,nt) in enumerate(oth):
    p.cell(O0+1+i,2,t).font=BK
    c=p.cell(O0+1+i,3,v); c.font=BL; c.number_format=fmt; c.fill=YL
    p.cell(O0+1+i,6,nt).font=SM
IPO,NOE,MI,MV,TGT,PLAN=O0+1,O0+2,O0+3,O0+4,O0+5,O0+6
rr=O0+7
p.cell(rr,2,'法人税等').font=BK; p.cell(rr,3,'均等割のみ').font=BL
p.cell(rr,6,'繰越欠損金 約252百万円（FY2025▲127.4＋FY2026▲124.8）。資本金1,000万円の中小法人は所得の100%控除可。').font=SM
p.cell(rr,6).alignment=Alignment(wrap_text=True,vertical='top'); p.row_dimensions[rr].height=32
Q=lambda r: f"'②前提'!$C${r}"

# ============ ③FY2027月次推移 ============
m=wb.create_sheet('③FY2027月次推移')
m.column_dimensions['A'].width=3; m.column_dimensions['B'].width=30
m.column_dimensions['C'].width=15
for i in range(12): m.column_dimensions[get_column_letter(4+i)].width=13
m.column_dimensions['P'].width=16
MO=['2026/10','2026/11','2026/12','2027/01','2027/02','2027/03','2027/04','2027/05','2027/06','2027/07','2027/08','2027/09']
m['B1']='FY2027（2026年10月-2027年9月）月次推移表　【保守シナリオ】撤退後実力値の横ばい ＋ 上乗せ案件132.5百万円'
m['B1'].font=Font(name=F,bold=True,size=13)
m['B2']='C列＝月次ベース（2026/04-06実績平均、④シートから自動リンク）。D列以降は同額で横ばい。緑字＝他シートからのリンク'; m['B2'].font=SM
m.cell(4,2,'科目').font=SB; m.cell(4,2).fill=SF
c=m.cell(4,3,'月次ベース\n(26/4-6平均)'); c.font=SB; c.fill=SF; c.alignment=Alignment(horizontal='center',wrap_text=True)
for i,mo in enumerate(MO):
    c=m.cell(4,4+i,mo); c.font=SB; c.fill=SF; c.alignment=Alignment(horizontal='center')
c=m.cell(4,16,'通期合計'); c.font=SB; c.fill=SF; c.alignment=Alignment(horizontal='center')
m.row_dimensions[4].height=30
def mrow(rr,label,basef,monf=None,bold=False,fill=None,font=BK,top=False,indent=0):
    c=m.cell(rr,2,('　'*indent)+label); c.font=SB if bold else font
    if fill: c.fill=fill
    if top: c.border=TB
    if basef is not None:
        cb=m.cell(rr,3,basef); cb.number_format=YEN; cb.font=SB if bold else GR
        if fill: cb.fill=fill
        if top: cb.border=TB
    for i in range(12):
        col=get_column_letter(4+i)
        cc=m.cell(rr,4+i, monf(i,col) if monf else f'=$C${rr}')
        cc.number_format=YEN; cc.font=SB if bold else font
        if fill: cc.fill=fill
        if top: cc.border=TB
    t=m.cell(rr,16,f'=SUM(D{rr}:O{rr})'); t.number_format=YEN; t.font=SB; t.fill=fill or TF
    if top: t.border=TB
r=5
m.cell(r,2,'【収益】').font=SB; m.cell(r,2).fill=GRP
for c in range(3,17): m.cell(r,c).fill=GRP
R_S=r+1; mrow(R_S,'既存事業 売上',f'={Q(S_M)}')
R_C=r+2; mrow(R_C,'　売上原価',f'=C{R_S}-C{R_S+2}',lambda i,c:f'={c}{R_S}-{c}{R_S+2}',font=BK)
R_G=r+3; mrow(R_G,'既存事業 売上総利益',f'={Q(G_M)}')
R_A0=r+4
adv_lbl=['経営指導料 Value table','経営指導料 Prime','経営指導料 Apicius','経営指導料 Thierry Marx','経営指導料 ito＋Aqua＋Hokkaido']
for k,lab in enumerate(adv_lbl):
    mrow(R_A0+k,'＋'+lab,f'={Q(I0+k)}/12')
R_INC=R_A0+5
mrow(R_INC,'＋インセンティブ Apicius2 shot',None,lambda i,c:f'=IF({i+1}={Q(MI)},{Q(I1-1)},0)')
R_GT=R_INC+1
mrow(R_GT,'売上総利益 合計',f'=C{R_G}+SUM(C{R_A0}:C{R_A0+4})',
     lambda i,c:f'={c}{R_G}+SUM({c}{R_A0}:{c}{R_INC})',bold=True,fill=TF,top=True)
r=R_GT+2
m.cell(r,2,'【販売費及び一般管理費】').font=SB; m.cell(r,2).fill=GRP
for c in range(3,17): m.cell(r,c).fill=GRP
G0=r+1
for k,acc in enumerate(ACC):
    mrow(G0+k,acc,f"=AVERAGE('④FY2026月次実績'!I{SG0+k}:K{SG0+k})")
G1=G0+len(ACC)-1
R_SGS=G1+1
mrow(R_SGS,'販管費 小計',f'=SUM(C{G0}:C{G1})',lambda i,c:f'=SUM({c}{G0}:{c}{G1})',bold=True,fill=TF,top=True)
R_IPO=R_SGS+1; mrow(R_IPO,'上場関連コスト',f'={Q(IPO)}/12')
R_SGT=R_IPO+1
mrow(R_SGT,'販管費 合計',f'=C{R_SGS}+C{R_IPO}',lambda i,c:f'={c}{R_SGS}+{c}{R_IPO}',bold=True,fill=TF,top=True)
r=R_SGT+2
m.cell(r,2,'【損益】').font=SB; m.cell(r,2).fill=GRP
for c in range(3,17): m.cell(r,c).fill=GRP
R_OP=r+1
mrow(R_OP,'営業利益',f'=C{R_GT}-C{R_SGT}',lambda i,c:f'={c}{R_GT}-{c}{R_SGT}',bold=True,fill=OP,top=True)
R_NOI=R_OP+1; mrow(R_NOI,'営業外収益（投資売買益）',None,lambda i,c:f'=IF({i+1}={Q(MV)},{Q(I1)},0)')
R_NOE=R_NOI+1; mrow(R_NOE,'営業外費用（支払利息等）',f'={Q(NOE)}/12')
R_ORD=R_NOE+1
mrow(R_ORD,'経常利益',f'=C{R_OP}+C{R_NOI}-C{R_NOE}',lambda i,c:f'={c}{R_OP}+{c}{R_NOI}-{c}{R_NOE}',bold=True,fill=OR_,top=True)
R_CUM=R_ORD+1
m.cell(R_CUM,2,'経常利益 累計').font=SB
for i in range(12):
    col=get_column_letter(4+i)
    f_=f'=D{R_ORD}' if i==0 else f'={get_column_letter(3+i)}{R_CUM}+{col}{R_ORD}'
    c=m.cell(R_CUM,4+i,f_); c.number_format=YEN; c.font=SB; c.fill=OR_
m.cell(R_CUM+2,2,'※既存事業の売上・粗利・販管費は2026/04-06実績の月平均を横ばい。成長・季節変動は織り込んでいない保守前提。').font=SM
m.cell(R_CUM+3,2,'※経営指導料は12か月按分。インセンティブ・投資売買益は②前提で指定した月に一括計上。').font=SM
m.freeze_panes='D5'

# ============ ①サマリー ============
s=wb.create_sheet('①サマリー',0)
s.column_dimensions['A'].width=3; s.column_dimensions['B'].width=38
for col in 'CDEF': s.column_dimensions[col].width=19
s.column_dimensions['G'].width=46
s['B1']='FY2027（2027年9月期）利益予測　シナリオ比較'; s['B1'].font=Font(name=F,bold=True,size=15)
s['B2']='ベース：飲食撤退後の実力値（2026/04-06 実績3か月平均）を横ばい延伸'; s['B2'].font=Font(name=F,size=10,color='595959')
s['B3']='単位：円（税別）　出典：事業計画202608（銀行様）月次／決算報告書 第54期'; s['B3'].font=SM
heads=['科目','FY2026 見込','A. 撤退後実力値\n横ばいのみ','B. A＋上乗せ\n132.5百万円','C. 営業利益\n1億円','コメント']
for j,t in enumerate(heads):
    c=s.cell(5,2+j,t); c.font=HD; c.fill=HF; c.alignment=Alignment(horizontal='center',wrap_text=True,vertical='center')
s.row_dimensions[5].height=44
b=lambda rr: f"{Q(rr)}*12"
spec=[
 ('既存事業 売上',      708205820, f'={b(S_M)}', f'={b(S_M)}', f'=E6+F9/{Q(GM)}',''),
 ('売上総利益（既存事業）', 229139405, f'={b(G_M)}', f'={b(G_M)}', '=E7',''),
 ('＋上乗せ案件（営業収益）',0,        0,            f'={Q(ADV)}',  f'={Q(ADV)}','経営指導料92.5百万＋インセンティブ20百万'),
 ('＋追加で必要な粗利',    None,      None,         None,          f'={Q(TGT)}-E14','目標達成に必要な粗利の上積み'),
 ('売上総利益 合計',       229139405, '=D7+D8',     '=E7+E8',      '=F7+F8+F9',''),
 ('販管費 小計',          343932836, f'={b(P_M)}', f'={b(P_M)}',  '=E11','2026/04-06実績の月平均×12'),
 ('上場関連コスト',        0,         f'={Q(IPO)}', f'={Q(IPO)}',  f'={Q(IPO)}','FY2027は計上しない方針'),
 ('販管費 合計',          343932836, '=D11+D12',   '=E11+E12',    '=F11+F12',''),
 ('営業利益',             -114793431,'=D10-D13',   '=E10-E13',    f'={Q(TGT)}','Cは目標営業利益を固定して逆算'),
 ('営業外収益（投資売買益）',0,        0,            f'={Q(INV)}',  f'={Q(INV)}',''),
 ('営業外費用',           10000000,  f'={Q(NOE)}', f'={Q(NOE)}',  f'={Q(NOE)}',''),
 ('経常利益',             -124793431,'=D14+D15-D16','=E14+E15-E16','=F14+F15-F16',''),
 ('法人税等',             0,0,0,0,'繰越欠損金 約252百万円により実質非課税'),
 ('当期純利益',           -124793431,'=D17-D18',   '=E17-E18',    '=F17-F18',''),
]
bold={10,13,14,17,19}
for i,(lab,*v) in enumerate(spec):
    rr=6+i; note=v[-1]
    c=s.cell(rr,2,lab); c.font=SB if rr in bold else BK
    for j,val in enumerate(v[:-1]):
        cc=s.cell(rr,3+j,val); cc.number_format=YEN
        cc.font=SB if rr in bold else (BL if j==0 and isinstance(val,int) else BK)
    s.cell(rr,7,note).font=SM
    if rr in bold:
        for c2 in range(2,8): s.cell(rr,c2).fill=TF; s.cell(rr,c2).border=TB
    if rr==14:
        for c2 in range(2,8): s.cell(rr,c2).fill=OP
    if rr==17:
        for c2 in range(2,8): s.cell(rr,c2).fill=OR_
    if rr==9:
        s.cell(rr,6).fill=YL; s.cell(rr,7).fill=YL
r=21
s.cell(r,2,'【V字回復に必要な追加売上】').font=Font(name=F,bold=True,size=12)
add=[('営業利益1億円に必要な追加売上','=F9/'+Q(GM),'=C23/'+Q(PLAN))]
s.cell(22,3,'追加売上').font=SB; s.cell(22,4,'新規顧客売上計画\n1,066百万円に対する比率').font=SB
s.cell(22,4).alignment=Alignment(wrap_text=True,horizontal='center'); s.row_dimensions[22].height=30
for c2 in (3,4): s.cell(22,c2).fill=SF
for i,(lab,f1,f2) in enumerate(add):
    rr=23+i
    s.cell(rr,2,lab).font=BK
    c=s.cell(rr,3,f1); c.number_format=YEN; c.font=SB; c.fill=YL
    c=s.cell(rr,4,f2); c.number_format=PCT; c.font=SB; c.fill=YL
notes=['','【判定】',
 'A：撤退後の実力値を横ばいで延ばすだけでは営業利益▲99.6百万円。上乗せなしでは黒字化しない。',
 'B：上乗せ案件132.5百万円を計上すると営業利益＋12.9百万円・経常利益＋17.9百万円で黒字化する。',
 'C：営業利益1億円には、Bからさらに粗利87.1百万円の上積みが必要。追加売上は1億6,888万円。',
 '　　これは新規顧客売上計画（1,066百万円）の15.8%にあたる。',
 '',
 '※上場関連コストはFY2027は計上しない前提（②前提シートで年額を入力すれば再計算されます）。',
 '※上乗せ案件のうち約100百万円はグループ内取引。銀行は正常化調整で控除する可能性が高い。',
 '※FY2026見込には2026/09単月に売上232.9百万円（通期の33%）を織り込み。粗利率12%のため営業利益寄与は＋5.5百万円のみ。']
for i,n in enumerate(notes):
    c=s.cell(26+i,2,n); c.font=Font(name=F,bold=True,size=12) if n=='【判定】' else Font(name=F,size=10)
    s.merge_cells(start_row=26+i,start_column=2,end_row=26+i,end_column=7)

# ============ ⑤利益ブリッジ ============
br=wb.create_sheet('⑤利益ブリッジ')
br.column_dimensions['A'].width=3; br.column_dimensions['B'].width=48
br.column_dimensions['C'].width=20; br.column_dimensions['D'].width=20; br.column_dimensions['E'].width=58
br['B1']='FY2026 → FY2027 営業利益ブリッジ（保守シナリオB）'; br['B1'].font=Font(name=F,bold=True,size=14)
br['B2']='単位：円（税別）'; br['B2'].font=SM
for j,t in enumerate(['項目','増減','累計','内容']):
    c=br.cell(4,2+j,t); c.font=HD; c.fill=HF
steps=[('FY2026 営業利益（見込）',-114793431,'現行計画の今期着地見込'),
       ('① 既存事業 粗利の減少',f'={Q(G_M)}*12-229139405','FY2026は2025/11・2026/09の大口を含む。撤退後実力値ベースでは減少'),
       ('② 販管費の削減',f'=343932836-{Q(P_M)}*12','飲食撤退＋固定費削減。10-3月平均比で月▲8.58百万円'),
       ('③ 上乗せ案件（営業収益）',f'={Q(ADV)}','経営指導料92.5百万＋インセンティブ20百万'),
       ('④ 上場関連コスト',f'=-{Q(IPO)}','FY2027計画値'),
       ('FY2027 営業利益（保守シナリオB）',None,'①〜④の合計')]
for i,(lab,val,note) in enumerate(steps):
    rr=5+i
    c=br.cell(rr,2,lab); c.font=SB if val is None or i==0 else BK
    if val is not None:
        c=br.cell(rr,3,val); c.number_format=YEN; c.font=SB if i==0 else BK
    br.cell(rr,5,note).font=SM
    if i==0:
        c=br.cell(rr,4,'=C5'); c.number_format=YEN; c.font=SB; c.fill=TF
    elif val is not None:
        c=br.cell(rr,4,f'=D{rr-1}+C{rr}'); c.number_format=YEN; c.font=SB; c.fill=TF
    else:
        c=br.cell(rr,4,f'=D{rr-1}'); c.number_format=YEN; c.font=SB; c.fill=OP
        br.cell(rr,2).fill=OP; br.cell(rr,4).border=TB
br.cell(12,2,'【営業利益1億円に必要な追加売上】').font=Font(name=F,bold=True,size=12)
br.cell(13,2,'営業利益 1億円').font=BK
br.cell(13,3,"='①サマリー'!C23").number_format=YEN; br.cell(13,3).font=SB; br.cell(13,3).fill=YL
c=br.cell(13,5,"='①サマリー'!D23"); c.number_format=PCT; c.font=SB
br.cell(13,6,'新規顧客売上計画1,066百万円に対する比率').font=SM

# ============ ⑥ワイン仕入・在庫計画 ============
iv=wb.create_sheet('⑥ワイン仕入・在庫計画')
iv.column_dimensions['A'].width=3; iv.column_dimensions['B'].width=30
iv.column_dimensions['C'].width=15
for i in range(12): iv.column_dimensions[get_column_letter(4+i)].width=13
iv.column_dimensions['P'].width=16; iv.column_dimensions['Q'].width=52
MO=['2026/10','2026/11','2026/12','2027/01','2027/02','2027/03','2027/04','2027/05','2027/06','2027/07','2027/08','2027/09']
iv['B1']='ワイン仕入・自社在庫計画（FY2027）'; iv['B1'].font=Font(name=F,bold=True,size=14)
iv['B2']='ワイン仕入は「売上原価（出庫）＋在庫増減」がキャッシュアウト。PLに現れない在庫積み増しが資金繰りの最大論点。'; iv['B2'].font=RD
bar(iv,4,'【1】自社在庫（簿価）の実績推移　単位：百万円',7)
hist=[('2024/12末',560),('2025/07末',470),('2025/09末',480),('2025/12末',530),('2026/03末',620)]
for j,(m,v) in enumerate(hist):
    c=iv.cell(5,3+j,m); c.font=SB; c.fill=SF; c.alignment=Alignment(horizontal='center')
    c=iv.cell(6,3+j,v); c.number_format='#,##0'; c.font=BL; c.alignment=Alignment(horizontal='center')
iv.cell(5,2,'時点').font=SB; iv.cell(5,2).fill=SF
iv.cell(6,2,'自社在庫 簿価').font=BK
iv.cell(7,2,'2025/09末→2026/03末の増加').font=SB
c=iv.cell(7,3,'=C6*0-(E6-G6)'); c.value='=G6-E6'; c.number_format='#,##0'; c.font=SB; c.fill=YL
iv.cell(7,4,'百万円 / 6か月').font=SM
c=iv.cell(7,5,'=C7/6'); c.number_format='#,##0.0'; c.font=SB; c.fill=YL
iv.cell(7,6,'百万円/月のキャッシュアウト').font=RD
iv.cell(8,2,'出典：2026年7月度 取締役会資料「ワイン預かり残高推移KPI」（税抜・簿価）').font=SM

bar(iv,10,'【2】FY2027 仕入・在庫計画（税抜）',16)
iv.cell(11,2,'科目').font=SB; iv.cell(11,2).fill=SF
c=iv.cell(11,3,'月次ベース'); c.font=SB; c.fill=SF; c.alignment=Alignment(horizontal='center')
for i,m in enumerate(MO):
    c=iv.cell(11,4+i,m); c.font=SB; c.fill=SF; c.alignment=Alignment(horizontal='center')
c=iv.cell(11,16,'通期'); c.font=SB; c.fill=SF; c.alignment=Alignment(horizontal='center')
IV_OPEN=12; IV_POL=13; IV_SPOT=14; IV_PRIM=15; IV_BUY=16; IV_OUT=17; IV_END=18
iv.cell(IV_OPEN,2,'期首在庫').font=BK
c=iv.cell(IV_OPEN,3,420000000); c.font=BL; c.number_format=YEN; c.fill=YL
iv.cell(IV_OPEN,17,'2026/03末実績620百万円 −2026/09の在庫販売200百万円＝420百万円。2026/04-08の増減は横ばいと仮定。').font=RD
iv.cell(IV_POL,2,'在庫方針（月次 増減額）').font=BK
c=iv.cell(IV_POL,3,0); c.font=BL; c.number_format=YEN; c.fill=YL
iv.cell(IV_POL,17,'0＝在庫横ばい（仕入＝売上原価）。積み増す場合は月額を入力。').font=SM
iv.cell(IV_SPOT,2,'スポット大口仕入').font=BK
iv.cell(IV_SPOT,17,'野村ユニソン等のロット仕入。発生月に入力。').font=SM
iv.cell(IV_PRIM,2,'プリムール等 前払仕入').font=BK
iv.cell(IV_PRIM,17,'引渡し前の前払。発生月に入力。').font=SM
for i in range(12):
    for r in (IV_SPOT,IV_PRIM):
        c=iv.cell(r,4+i,0); c.font=BL; c.number_format=YEN; c.fill=YL
for r in (IV_SPOT,IV_PRIM):
    c=iv.cell(r,16,f'=SUM(D{r}:O{r})'); c.number_format=YEN; c.font=SB; c.fill=TF
iv.cell(IV_BUY,2,'仕入 合計（入庫）').font=SB; iv.cell(IV_BUY,2).border=TB
iv.cell(IV_OUT,2,'売上原価（出庫）').font=BK
iv.cell(IV_END,2,'期末在庫').font=SB; iv.cell(IV_END,2).border=TB
for i in range(12):
    col=get_column_letter(4+i); pv=get_column_letter(3+i)
    c=iv.cell(IV_BUY,4+i,f'={col}{IV_OUT}+$C${IV_POL}+{col}{IV_SPOT}+{col}{IV_PRIM}')
    c.number_format=YEN; c.font=SB; c.fill=TF; c.border=TB
    c=iv.cell(IV_OUT,4+i,f"='③FY2027月次推移'!{col}{R_C}"); c.number_format=YEN; c.font=GR
    prev=f'$C${IV_OPEN}' if i==0 else f'{pv}{IV_END}'
    c=iv.cell(IV_END,4+i,f'={prev}+{col}{IV_BUY}-{col}{IV_OUT}')
    c.number_format=YEN; c.font=SB; c.fill=CREAMFILL; c.border=TB
for r,f_ in [(IV_BUY,f'=SUM(D{IV_BUY}:O{IV_BUY})'),(IV_OUT,f'=SUM(D{IV_OUT}:O{IV_OUT})')]:
    c=iv.cell(r,16,f_); c.number_format=YEN; c.font=SB; c.fill=TF
c=iv.cell(IV_END,16,f'=O{IV_END}'); c.number_format=YEN; c.font=SB; c.fill=CREAMFILL
iv.cell(20,2,'※在庫方針を0（横ばい）にしても、FY2026上期の実績ペース（月+23.3百万円）を続ける場合は年280百万円の追加資金needed。').font=RD
iv.cell(21,2,'※スポット大口仕入・プリムール前払は、売上計上より先に支払が発生するため、資金繰り上は最も注意を要する項目。').font=RD
iv.cell(22,2,'※2026/09に在庫200百万円を販売（削減）し、その代金をみずほ銀行への融資返済200百万円に充当する前提。期首在庫はその後の残高。').font=RD

# ============ ⑦FY2027資金繰り表 ============
cf=wb.create_sheet('⑦FY2027資金繰り表')
cf.column_dimensions['A'].width=3; cf.column_dimensions['B'].width=34
cf.column_dimensions['C'].width=14
for i in range(12): cf.column_dimensions[get_column_letter(4+i)].width=12.5
cf.column_dimensions['P'].width=15; cf.column_dimensions['Q'].width=46
cf['B1']='FY2027（2026年10月-2027年9月）月次資金繰り表'; cf['B1'].font=Font(name=F,bold=True,size=14)
cf['B2']='単位：円（税込ベース）　青字＝入力セル／黄色＝要確認の前提／緑字＝他シートからのリンク'; cf['B2'].font=SM
bar(cf,4,'【前提】',16)
pre=[('期首現預金（2026/09末 見込）',24390278,'★要差替え。2025/09末実績を暫定表示。FY2026着地の見込値を入力してください。',True),
     ('消費税率',0.10,'',False),
     ('売上 回収サイト（か月）',1.0,'売掛金回転32.2日（2025/09末BS）より1.06か月→1.0か月と設定。',False),
     ('仕入 支払サイト（か月）',1.0,'買掛金回転23.5日（2025/09末BS）より0.77か月→1.0か月と設定。',False),
     ('長期借入金 約定返済（月額）',2662179,'★要差替え。長期借入423,623,000円−みずほ一括返済200,000,000円＝223,623,000円を7年均等返済と仮定した暫定値。',True),
     ('短期借入金 純増減（月額）',0,'短期借入162,440,980円は同額借換（継続）を前提。',False)]
for i,(t,v,nt,warn) in enumerate(pre):
    r=5+i
    cf.cell(r,2,t).font=BK
    c=cf.cell(r,3,v); c.font=BL
    if warn: c.fill=YL
    c.number_format=PCT if t=='消費税率' else ('0.0' if 'サイト' in t else YEN)
    cf.cell(r,4,nt).font=RD if warn else SM
CF_CASH,CF_TAX,CF_AR,CF_AP,CF_LTR,CF_STN=5,6,7,8,9,10
V=lambda r: f"'⑦FY2027資金繰り表'!$C${r}"
Y=lambda r: f"$C${r}"

r0=12
cf.cell(r0,2,'科目').font=SB; cf.cell(r0,2).fill=SF
c=cf.cell(r0,3,'月次ベース'); c.font=SB; c.fill=SF; c.alignment=Alignment(horizontal='center')
for i,m in enumerate(MO):
    c=cf.cell(r0,4+i,m); c.font=SB; c.fill=SF; c.alignment=Alignment(horizontal='center')
c=cf.cell(r0,16,'通期'); c.font=SB; c.fill=SF; c.alignment=Alignment(horizontal='center')

def crow(r,label,monf,basef=None,bold=False,fill=None,font=BK,top=False,tot=True,inp=False):
    c=cf.cell(r,2,label); c.font=SB if bold else font
    if fill: c.fill=fill
    if top: c.border=TB
    if basef is not None:
        cb=cf.cell(r,3,basef); cb.number_format=YEN; cb.font=SB if bold else GR
        if fill: cb.fill=fill
    for i in range(12):
        col=get_column_letter(4+i)
        cc=cf.cell(r,4+i, monf(i,col))
        cc.number_format=YEN; cc.font=SB if bold else (BL if inp else font)
        if inp: cc.fill=YL
        elif fill: cc.fill=fill
        if top: cc.border=TB
    if tot:
        t=cf.cell(r,16,f'=SUM(D{r}:O{r})'); t.number_format=YEN; t.font=SB; t.fill=fill or TF
        if top: t.border=TB

hd=r0+1
cf.cell(hd,2,'【営業収入】').font=SB; cf.cell(hd,2).fill=GRP
for c in range(3,17): cf.cell(hd,c).fill=GRP
IN_S=hd+1; IN_A=hd+2; IN_I=hd+3; IN_T=hd+5
crow(IN_S,'売上入金（既存事業・税込）',lambda i,c:f"='③FY2027月次推移'!{c}{R_S}*(1+{Y(CF_TAX)})",font=GR)
crow(IN_A,'経営指導料 入金（税込）',lambda i,c:f"=SUM('③FY2027月次推移'!{c}{R_A0}:{c}{R_A0+4})*(1+{Y(CF_TAX)})",font=GR)
crow(IN_I,'インセンティブ 入金（税込）',lambda i,c:f"='③FY2027月次推移'!{c}{R_INC}*(1+{Y(CF_TAX)})",font=GR)
IN_R=IN_I+1
recv=[220000000,0,0,0,0,0,0,0,0,0,0,0]
crow(IN_R,'前期末売掛金 回収（2026/09 在庫販売）',lambda i,c:recv[i],inp=True)
cf.cell(IN_R,17,'2026/09に販売した在庫200百万円（税抜）の代金220百万円（税込）を、回収サイト1か月後の2026/10に入金と仮定。').font=RD
crow(IN_T,'営業収入 計',lambda i,c:f'=SUM({c}{IN_S}:{c}{IN_R})',bold=True,fill=TF,top=True)

hd2=IN_T+2
cf.cell(hd2,2,'【営業支出】').font=SB; cf.cell(hd2,2).fill=GRP
for c in range(3,17): cf.cell(hd2,c).fill=GRP
OUT_W=hd2+1; OUT_P=hd2+2; OUT_O=hd2+3; OUT_L=hd2+4; OUT_INT=hd2+5; OUT_CT=hd2+6; OUT_TX=hd2+7; OUT_T=hd2+8
crow(OUT_W,'ワイン仕入 支払（税込）',
     lambda i,c:(f"='⑥ワイン仕入・在庫計画'!D{IV_BUY}*(1+{Y(CF_TAX)})" if i==0
                 else f"='⑥ワイン仕入・在庫計画'!{get_column_letter(3+i)}{IV_BUY}*(1+{Y(CF_TAX)})"),font=GR)
HR=[SG0+ACC.index(a) for a in ['役員報酬','従業員給与','雑給','法定福利費']]
hexpr='+'.join([f"AVERAGE('④FY2026月次実績'!I{x}:K{x})" for x in HR])
crow(OUT_P,'人件費（役員報酬・給与・雑給・法定福利）',lambda i,c:f'={hexpr}',font=GR)
NTR=[SG0+ACC.index(a) for a in ['租税公課','保険料']]
ntexpr='+'.join([f"AVERAGE('④FY2026月次実績'!I{x}:K{x})" for x in NTR])
depr=SG0+ACC.index('減価償却費')
crow(OUT_O,'その他販管費（税込・減価償却除く）',
     lambda i,c:(f"=(('③FY2027月次推移'!{c}{R_SGS}-AVERAGE('④FY2026月次実績'!I{depr}:K{depr})-({hexpr})-({ntexpr}))*(1+{Y(CF_TAX)}))+({ntexpr})"),font=GR)
crow(OUT_L,'上場関連コスト（税込）',lambda i,c:f"='③FY2027月次推移'!{c}{R_IPO}*(1+{Y(CF_TAX)})",font=GR)
crow(OUT_INT,'支払利息',lambda i,c:f"='③FY2027月次推移'!{c}{R_NOE}",font=GR)
ct=[0,30000000,0,0,0,0,0,5000000,0,0,0,0]
crow(OUT_CT,'消費税 納付',lambda i,c:ct[i],inp=True)
cf.cell(OUT_CT,17,'2026/11はFY2026確定分。在庫販売200百万円に係る仮受消費税20百万円を含む（仕入時に仮払控除済のため純増）。').font=RD
tx=[0,463105,0,0,0,0,0,0,0,0,0,0]
crow(OUT_TX,'法人税等（均等割）',lambda i,c:tx[i],inp=True)
crow(OUT_T,'営業支出 計',lambda i,c:f'=SUM({c}{OUT_W}:{c}{OUT_TX})',bold=True,fill=TF,top=True)
CF_ORD=OUT_T+1
crow(CF_ORD,'経常収支',lambda i,c:f'={c}{IN_T}-{c}{OUT_T}',bold=True,fill=OP,top=True)

hd3=CF_ORD+2
cf.cell(hd3,2,'【財務・投資収支】').font=SB; cf.cell(hd3,2).fill=GRP
for c in range(3,17): cf.cell(hd3,c).fill=GRP
FI_R=hd3+1; FI_S=hd3+2; FI_N=hd3+3; FI_V=hd3+4; FI_T=hd3+6
crow(FI_R,'長期借入金 約定返済',lambda i,c:f'=-{Y(CF_LTR)}',font=GR)
crow(FI_S,'短期借入金 純増減',lambda i,c:f'={Y(CF_STN)}',font=GR)
crow(FI_N,'新規調達（借入・増資）',lambda i,c:0,inp=True)
crow(FI_V,'投資売買益 入金',lambda i,c:f"='③FY2027月次推移'!{c}{R_NOI}",font=GR)
FI_M=FI_V+1
miz=[-200000000,0,0,0,0,0,0,0,0,0,0,0]
crow(FI_M,'みずほ銀行 融資返済（在庫販売代金充当）',lambda i,c:miz[i],inp=True)
cf.cell(FI_M,17,'在庫販売代金の入金月に同額を一括返済する前提。').font=RD
crow(FI_T,'財務・投資収支 計',lambda i,c:f'=SUM({c}{FI_R}:{c}{FI_M})',bold=True,fill=TF,top=True)

CF_NET=FI_T+2; CF_BEG=CF_NET+1; CF_END=CF_NET+2; CF_SHORT=CF_NET+3
crow(CF_NET,'当月収支',lambda i,c:f'={c}{CF_ORD}+{c}{FI_T}',bold=True,fill=TF,top=True)
crow(CF_BEG,'前月繰越 現預金',lambda i,c:(f'={Y(CF_CASH)}' if i==0 else f'={get_column_letter(3+i)}{CF_END}'),tot=False)
crow(CF_END,'翌月繰越 現預金',lambda i,c:f'={c}{CF_BEG}+{c}{CF_NET}',bold=True,fill=OR_,top=True,tot=False)
crow(CF_SHORT,'資金不足額（マイナス時）',lambda i,c:f'=IF({c}{CF_END}<0,{c}{CF_END},0)',bold=True,fill=PatternFill('solid',fgColor='F8CBAD'),tot=False)
c=cf.cell(CF_END,16,f'=O{CF_END}'); c.number_format=YEN; c.font=SB; c.fill=OR_
c=cf.cell(CF_SHORT,16,f'=MIN(D{CF_SHORT}:O{CF_SHORT})'); c.number_format=YEN; c.font=SB; c.fill=PatternFill('solid',fgColor='F8CBAD')
cf.cell(CF_SHORT,17,'通期列＝最大不足額（必要調達額の下限）').font=RD

n=CF_SHORT+2
notes=['※売上・仕入とも回収／支払サイト1.0か月。既存事業の売上は横ばい前提のため、月ズレの影響は通期では相殺されます。',
 '※ワイン仕入の支払は前月仕入額を当月に支払う前提（⑥シートで仕入月を入力すると、翌月に資金流出として反映されます）。',
 '※減価償却費（月3.6百万円）は資金支出を伴わないため、営業支出から除外しています。',
 '※消費税納付・法人税等は暫定値です。税理士確定額に差し替えてください。',
 '※期首現預金と長期借入返済額（黄色セル）は必ず実際の数値に差し替えてください。この2つで結論が大きく変わります。']
for i,t in enumerate(notes):
    cf.cell(n+i,2,t).font=RD if i>=3 else SM
cf.freeze_panes='D13'

# 感応度分析
sr=CF_SHORT+8
bar(cf,sr,'【感応度】どこまで耐えられるか',16)
cf.cell(sr+1,2,'ケース').font=SB; cf.cell(sr+1,2).fill=SF
for j,t in enumerate(['期末 現預金残高','期中 最低残高','必要調達額']):
    c=cf.cell(sr+1,3+j,t); c.font=SB; c.fill=SF; c.alignment=Alignment(horizontal='center',wrap_text=True)
cf.cell(sr+1,6,'前提').font=SB; cf.cell(sr+1,6).fill=SF
BUF=sr+6
cases=[('A. 基本（在庫横ばい・調達なし）',f'=O{CF_END}',f'=MIN(D{CF_END}:O{CF_END})',
        '在庫を積み増さず、2027/03の一時収益42百万円が予定どおり入金する前提'),
       ('B. 2027/03の一時収益が入らない',f'=C{sr+2}-(P{IN_I}+P{FI_V})',f'=D{sr+2}-(P{IN_I}+P{FI_V})',
        'インセンティブ22.0百万円（税込）＋投資売買益20.0百万円が未入金の場合'),
       ('C. 在庫をFY2026上期ペースで積増',f'=C{sr+2}-23333333*(1+{Y(CF_TAX)})*12',f'=D{sr+2}-23333333*(1+{Y(CF_TAX)})*12',
        '月23.3百万円（2025/09末→2026/03末の実績ペース）で積み増した場合'),
       ('D. 2026/09の在庫販売200百万円が不成立',f'=C{sr+2}-(5043131-$C${CF_LTR})*12',f'=D{sr+2}-(5043131-$C${CF_LTR})*12',
        '入金220・返済200・消費税20は相殺されるが、長期借入が223.6→423.6百万円のままとなり約定返済が月5.04百万円に戻る')]
for i,(lab,fe,fm,nt) in enumerate(cases):
    r=sr+2+i
    cf.cell(r,2,lab).font=SB if i==0 else BK
    for j,f_ in enumerate([fe,fm]):
        c=cf.cell(r,3+j,f_); c.number_format=YEN; c.font=SB
        c.fill=TF if i==0 else PatternFill('solid',fgColor='F8CBAD')
    c=cf.cell(r,5,f'=IF(C{r+0}<0,-MIN(C{r},D{r})+$C${BUF},MAX(0,-D{r}+$C${BUF}))')
    c.number_format=YEN; c.font=SB; c.fill=YL
    cf.cell(r,6,nt).font=SM
cf.cell(BUF,2,'運転資金バッファ（月商1か月）').font=BK
c=cf.cell(BUF,3,f"='③FY2027月次推移'!$C${R_S}*(1+{Y(CF_TAX)})"); c.number_format=YEN; c.font=GR
cf.cell(BUF,6,'最低残高をゼロに戻すだけでは足りないため、月商1か月分を上乗せして必要調達額を算定。').font=SM
cf.cell(BUF+2,2,'※ケースCは在庫積み増しを継続した場合。PL上の利益は変わらないが、資金は年308百万円（税込）流出します。').font=RD
cf.cell(BUF+3,2,'※ケースBとCが同時に起きた場合、必要調達額は両者の合計に近い水準となります。').font=RD

# 現預金残高の推移グラフ
from openpyxl.chart import LineChart, Reference
ch=LineChart(); ch.title='月末 現預金残高の推移（ケースA：在庫横ばい・調達なし）'
ch.y_axis.title='円'; ch.x_axis.title=None; ch.height=7.6; ch.width=24
data=Reference(cf,min_col=4,max_col=15,min_row=CF_END,max_row=CF_END)
cats=Reference(cf,min_col=4,max_col=15,min_row=r0,max_row=r0)
ch.add_data(data,from_rows=True,titles_from_data=False)
ch.set_categories(cats)
ch.series[0].graphicalProperties.line.width=28000
ch.series[0].graphicalProperties.line.solidFill='6D2E46'
ch.legend=None
cf.add_chart(ch,f'B{BUF+5}')



wb.save('WineBank_FY2027_forecast.xlsx'); print('saved')
