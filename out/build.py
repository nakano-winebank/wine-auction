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
oth=[('上場関連コスト（年額）',36000000,YEN,'事業計画FY2027計画値。計上しない場合は0。'),
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
for col in 'CDEFG': s.column_dimensions[col].width=18
s.column_dimensions['H'].width=44
s['B1']='FY2027（2027年9月期）利益予測　シナリオ比較'; s['B1'].font=Font(name=F,bold=True,size=15)
s['B2']='ベース：飲食撤退後の実力値（2026/04-06 実績3か月平均）を横ばい延伸'; s['B2'].font=Font(name=F,size=10,color='595959')
s['B3']='単位：円（税別）　出典：事業計画202608（銀行様）月次／決算報告書 第54期'; s['B3'].font=SM
heads=['科目','FY2026 見込','A. 撤退後実力値\n横ばいのみ','B. A＋上乗せ\n132.5百万円','C. 損益分岐\n（営業利益0）','D. 営業利益\n1億円','コメント']
for j,t in enumerate(heads):
    c=s.cell(5,2+j,t); c.font=HD; c.fill=HF; c.alignment=Alignment(horizontal='center',wrap_text=True,vertical='center')
s.row_dimensions[5].height=44
b=lambda rr: f"{Q(rr)}*12"
spec=[
 ('既存事業 売上',      708205820, f'={b(S_M)}', f'={b(S_M)}', f'=E6+F9/{Q(GM)}', f'=E6+G9/{Q(GM)}',''),
 ('既存事業 売上総利益', 229139405, f'={b(G_M)}', f'={b(G_M)}', '=E7',            '=E7',''),
 ('＋上乗せ案件（営業収益）',0,      0,            f'={Q(ADV)}', f'={Q(ADV)}',     f'={Q(ADV)}','経営指導料92.5百万＋インセンティブ20百万'),
 ('＋追加で必要な粗利',  None,      None,         None,          '=-E14',          f'={Q(TGT)}-E14','C・Dの達成に必要な粗利の上積み'),
 ('売上総利益 合計',     229139405, '=D7+D8',     '=E7+E8',      '=F7+F8+F9',      '=G7+G8+G9',''),
 ('販管費 小計',        343932836, f'={b(P_M)}', f'={b(P_M)}',  '=E11',           '=E11','2026/04-06実績の月平均×12'),
 ('上場関連コスト',      0,         f'={Q(IPO)}', f'={Q(IPO)}',  f'={Q(IPO)}',     f'={Q(IPO)}',''),
 ('販管費 合計',        343932836, '=D11+D12',   '=E11+E12',    '=F11+F12',       '=G11+G12',''),
 ('営業利益',           -114793431,'=D10-D13',   '=E10-E13',    '=F10-F13',       '=G10-G13',''),
 ('営業外収益（投資売買益）',0,      0,            f'={Q(INV)}',  f'={Q(INV)}',     f'={Q(INV)}',''),
 ('営業外費用',          10000000,  f'={Q(NOE)}', f'={Q(NOE)}',  f'={Q(NOE)}',     f'={Q(NOE)}',''),
 ('経常利益',           -124793431,'=D14+D15-D16','=E14+E15-E16','=F14+F15-F16',  '=G14+G15-G16',''),
 ('法人税等',           0,0,0,0,0,'繰越欠損金 約252百万円により実質非課税'),
 ('当期純利益',         -124793431,'=D17-D18',   '=E17-E18',    '=F17-F18',       '=G17-G18',''),
]
bold={10,13,14,17,19}
for i,(lab,*v) in enumerate(spec):
    rr=6+i; note=v[-1]
    c=s.cell(rr,2,lab); c.font=SB if rr in bold else BK
    for j,val in enumerate(v[:-1]):
        cc=s.cell(rr,3+j,val); cc.number_format=YEN
        cc.font=SB if rr in bold else (BL if j==0 and isinstance(val,int) else BK)
    s.cell(rr,8,note).font=SM
    if rr in bold:
        for c2 in range(2,9): s.cell(rr,c2).fill=TF; s.cell(rr,c2).border=TB
    if rr==14:
        for c2 in range(2,9): s.cell(rr,c2).fill=OP
    if rr==17:
        for c2 in range(2,9): s.cell(rr,c2).fill=OR_
    if rr==9:
        s.cell(rr,7).fill=YL; s.cell(rr,8).fill=YL
r=21
s.cell(r,2,'【V字回復に必要な追加売上】').font=Font(name=F,bold=True,size=12)
add=[('損益分岐（営業利益0）に必要な追加売上','=F9/'+Q(GM),'=C23/'+Q(PLAN)),
     ('営業利益1億円に必要な追加売上','=G9/'+Q(GM),'=C24/'+Q(PLAN))]
s.cell(22,3,'追加売上').font=SB; s.cell(22,4,'新規顧客売上計画\n1,066百万円に対する比率').font=SB
s.cell(22,4).alignment=Alignment(wrap_text=True,horizontal='center'); s.row_dimensions[22].height=30
for c2 in (3,4): s.cell(22,c2).fill=SF
for i,(lab,f1,f2) in enumerate(add):
    rr=23+i
    s.cell(rr,2,lab).font=BK
    c=s.cell(rr,3,f1); c.number_format=YEN; c.font=SB; c.fill=YL
    c=s.cell(rr,4,f2); c.number_format=PCT; c.font=SB; c.fill=YL
notes=['','【判定】',
 'A：撤退後の実力値を横ばいで延ばすだけでは営業利益▲135.6百万円。上乗せなしでは黒字化しない。',
 'B：上乗せ案件132.5百万円を全額計上しても、上場関連コスト36百万円を計上すると営業利益は▲23.1百万円。',
 'C：損益分岐までの距離は追加売上4,473万円。新規顧客売上計画（1,066百万円）の4.2%で到達する。',
 'D：営業利益1億円には追加売上2億3,872万円。同計画の22.4%で到達する。',
 '',
 '※上乗せ案件のうち約100百万円はグループ内取引。銀行は正常化調整で控除する可能性が高い。',
 '※FY2026見込には2026/09単月に売上232.9百万円（通期の33%）を織り込み。粗利率12%のため営業利益寄与は＋5.5百万円のみ。']
for i,n in enumerate(notes):
    c=s.cell(26+i,2,n); c.font=Font(name=F,bold=True,size=12) if n=='【判定】' else Font(name=F,size=10)
    s.merge_cells(start_row=26+i,start_column=2,end_row=26+i,end_column=8)

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
br.cell(12,2,'【V字回復に必要な追加売上】').font=Font(name=F,bold=True,size=12)
br.cell(13,2,'損益分岐（営業利益0）').font=BK
br.cell(13,3,"='①サマリー'!C23").number_format=YEN; br.cell(13,3).font=SB; br.cell(13,3).fill=YL
br.cell(13,5,'新規顧客売上計画1,066百万円の4.2%').font=SM
br.cell(14,2,'営業利益 1億円').font=BK
br.cell(14,3,"='①サマリー'!C24").number_format=YEN; br.cell(14,3).font=SB; br.cell(14,3).fill=YL
br.cell(14,5,'同 22.4%').font=SM
wb.save('WineBank_FY2027_forecast.xlsx'); print('saved')
