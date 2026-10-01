# -*- coding: utf-8 -*-
"""FY2027(2027年9月期) 事業計画
ベース: 2026/04-07 実績の月平均 / FY2026着地: WineBank_FY2026_着地予想.xlsx"""
import sys; sys.path.insert(0,'.')
from data import *
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

F='メイリオ'
BK=Font(name=F); BL=Font(name=F,color='8A6A24',bold=True); GR=Font(name=F,color='595959')
SB=Font(name=F,bold=True); HD=Font(name=F,bold=True,color='FFFFFF')
SM=Font(name=F,size=9,color='8C8C8C'); RD=Font(name=F,size=9,color='333333')
HF=PatternFill('solid',fgColor='1A1A1A'); SF=PatternFill('solid',fgColor='F2F1EE')
YL=PatternFill('solid',fgColor='FAF3E2'); TF=PatternFill('solid',fgColor='F7F6F3')
OR_=PatternFill('solid',fgColor='F4EDDC'); GRP=PatternFill('solid',fgColor='EFEEEA')
TB=Border(top=Side(style='thin',color='1A1A1A'))
YEN='¥#,##0;(¥#,##0);-'; PCT='0.0%'
wb=Workbook(); wb.remove(wb.active)
def bar(ws,r,t,span=6):
    ws.cell(r,2,t).font=HD
    for c in range(2,2+span): ws.cell(r,c).fill=HF
    ws.cell(r,2).font=HD
b=slice(6,10)
BS=sum(SALES[b])/4; BG=sum(GP[b])/4; BP=sum(SGA[b])/4
MO27=['2026/10','2026/11','2026/12','2027/01','2027/02','2027/03',
      '2027/04','2027/05','2027/06','2027/07','2027/08','2027/09']

# ============== ②前提 ==============
p=wb.create_sheet('②前提')
for col,w in zip('ABCDEFG',[3,40,18,16,62,2,2]): p.column_dimensions[col].width=w
p['B1']='FY2027（2027年9月期）事業計画　前提条件'; p['B1'].font=Font(name=F,bold=True,size=15)
p['B2']='黄色＝入力セル。ベースは2026年4-7月の実績月平均（不採算3店舗の撤退後）。単位：円（税別）'; p['B2'].font=SM
bar(p,4,'【1】ベース：再編後の実力値（2026/04-07 実績の月平均）',4)
for j,t in enumerate(['項目','月次平均','年換算']):
    c=p.cell(5,2+j,t); c.font=HD; c.fill=HF; c.alignment=Alignment(horizontal='center')
bs=[('売上',BS,'4月32.5／5月35.5／6月32.9／7月63.1百万円の平均'),
    ('売上総利益',BG,'同4か月の平均。粗利率46.3%'),
    ('販管費',BP,'同4か月の平均。2026/03以前は撤退3店舗を含むため除外')]
for i,(t,v,nt) in enumerate(bs):
    r=6+i; p.cell(r,2,t).font=BK
    c=p.cell(r,3,round(v)); c.number_format=YEN; c.font=BL; c.fill=YL
    c=p.cell(r,4,f'=C{r}*12'); c.number_format=YEN; c.font=SB; c.fill=TF
    p.cell(r,5,nt).font=SM
B_S,B_G,B_P=6,7,8
p.cell(9,2,'売上総利益率').font=BK
c=p.cell(9,3,f'=C{B_G}/C{B_S}'); c.number_format=PCT; c.font=BK
p.cell(10,2,'横ばい延伸時の営業利益（年）').font=SB
c=p.cell(10,4,f'=D{B_G}-D{B_P}'); c.number_format=YEN; c.font=SB; c.fill=OR_
p.cell(10,5,'何もしなければこの水準。ここからの積み上げが計画です。').font=RD
n=12
bar(p,n,'【2】上乗せ案件（FY2027）',4)
for j,t in enumerate(['案件','金額','計上月']):
    c=p.cell(n+1,2+j,t); c.font=HD; c.fill=HF; c.alignment=Alignment(horizontal='center')
adv=[('コンサルティング料　間接グループ5社',80000000,0,'12か月按分。中野出資のグループ会社5社'),
     ('コンサルティング料　Thierry Marx',2500000,0,'12か月按分。2026年4月開業'),
     ('クルーザー×ワイン事業　1回目',10000000,6,'6＝2027年3月'),
     ('クルーザー×ワイン事業　2回目',10000000,12,'12＝2027年9月')]
A0=n+2
for i,(t,v,mm,nt) in enumerate(adv):
    r=A0+i; p.cell(r,2,t).font=BK
    c=p.cell(r,3,v); c.number_format=YEN; c.font=BL; c.fill=YL
    c=p.cell(r,4,mm); c.number_format='0'; c.font=BL; c.fill=YL
    p.cell(r,5,nt).font=SM
A1=A0+3; AT=A1+1
p.cell(AT,2,'合計').font=SB; p.cell(AT,2).border=TB
c=p.cell(AT,3,f'=SUM(C{A0}:C{A1})'); c.number_format=YEN; c.font=SB; c.fill=OR_; c.border=TB
p.cell(AT,5,'★アピシウスM&A仲介20.0とコンサルティング料10.0の計30.0百万円はFY2026に前倒し計上済みのため、今期は計上しません。').font=RD
p.cell(AT,5).alignment=Alignment(wrap_text=True,vertical='top'); p.row_dimensions[AT].height=30
p.cell(AT+1,2,'（参考）前回計画の上乗せ案件').font=BK
c=p.cell(AT+1,3,132500000); c.number_format=YEN; c.font=GR
p.cell(AT+1,5,'132.5 → 102.5百万円。差30.0百万円が前倒し分です。').font=SM
n=AT+3
bar(p,n,'【3】私募ファンド 現物出資分の追加計上',4)
p.cell(n+1,2,'追加計上する売上').font=BK
c=p.cell(n+1,3,0); c.number_format=YEN; c.font=BL; c.fill=YL
p.cell(n+1,5,'★FY2026と同じ建て付け（売上計上せず）とする場合は0。売上を計上する場合は300,000,000を入力してください。').font=RD
p.cell(n+1,5).alignment=Alignment(wrap_text=True,vertical='top'); p.row_dimensions[n+1].height=30
p.cell(n+2,2,'追加計上する粗利').font=BK
c=p.cell(n+2,3,15000000); c.number_format=YEN; c.font=BL; c.fill=YL
p.cell(n+2,5,'現物出資3億円に対する追加5%。FY2026の10%（30百万円）とあわせて計15%').font=SM
p.cell(n+3,2,'計上月（1〜12）').font=BK
c=p.cell(n+3,3,12); c.number_format='0'; c.font=BL; c.fill=YL
p.cell(n+3,5,'12＝2027年9月').font=SM
GK_S,GK_G,GK_M=n+1,n+2,n+3
n=n+5
bar(p,n,'【4】プランD・Eの前提',4)
pe=[('FY2025 売上高（実績）',752864901,'決算報告書 第54期'),
    ('FY2026 既存事業 売上高（着地）',559914185,'10か月実績444.9＋8-9月115.0百万円。私募600・前倒し30は一過性のため除外'),
    ('前期・今期の売上平均',None,'プランDの既存事業売上。新たな成長を前提にしていません'),
    ('差額売上（横ばいからの上積み）',None,'売上平均−横ばい年換算'),
    ('差額売上の粗利率',0.30,'FY2025 26.8%・FY2026実績を踏まえ保守的に30%'),
    ('プランE 追加売上（私募＋オークション）',300000000,'FY2026に私募で実際に組成した規模と同水準')]
P0=n+1
for i,(t,v,nt) in enumerate(pe):
    r=P0+i; p.cell(r,2,t).font=BK
    c=p.cell(r,3,v); c.number_format=PCT if '率' in t else YEN
    if v is not None: c.font=BL; c.fill=YL
    else: c.font=SB; c.fill=TF
    p.cell(r,5,nt).font=SM
    p.cell(r,5).alignment=Alignment(wrap_text=True,vertical='top')
E25,E26,EAV,EDF,EGM,EAD=P0,P0+1,P0+2,P0+3,P0+4,P0+5
p.cell(EAV,3,f'=(C{E25}+C{E26})/2').number_format=YEN
p.cell(EDF,3,f'=C{EAV}-D{B_S}').number_format=YEN
p.cell(EAV,3).fill=OR_; p.cell(EDF,3).fill=OR_
n=EAD+2
bar(p,n,'【5】その他',4)
ot=[('営業外費用（年額）',12000000,'FY2026着地13.0百万円。みずほ銀行への返済により支払利息が減少'),
    ('繰越欠損金 残高（期首）',139865685,'FY2025 127.4＋FY2026 12.5百万円。FY2026着地予想より'),
    ('法人実効税率',0.34,'繰越欠損金を使い切った後の課税所得に適用'),
    ('期首 現預金',30000000,'★2026/09末の着地値に差し替えてください。私募3億の入金時期とみずほ返済の実行で変動します'),
    ('期首 商品在庫',187411335,'FY2026着地予想より。従来モデルの420百万円から大きく下がっています'),
    ('年間 ワイン仕入',450000000,'★仕入方針。割当維持のため落とさない前提')]
O0=n+1
for i,(t,v,nt) in enumerate(ot):
    r=O0+i; p.cell(r,2,t).font=BK
    c=p.cell(r,3,v); c.number_format=PCT if '率' in t else YEN; c.font=BL; c.fill=YL
    p.cell(r,5,nt).font=RD if '★' in nt else SM
    p.cell(r,5).alignment=Alignment(wrap_text=True,vertical='top')
NOE,TLOSS,TRATE,CASH0,INV0,BUY27=O0,O0+1,O0+2,O0+3,O0+4,O0+5
Q=lambda r: f"'②前提'!$C${r}"
QD=lambda r: f"'②前提'!$D${r}"

# ============== ③月次推移表（プランD）==============
m=wb.create_sheet('③月次推移表')
m.column_dimensions['A'].width=3; m.column_dimensions['B'].width=32
for i in range(12): m.column_dimensions[get_column_letter(3+i)].width=13
m.column_dimensions['O'].width=16
m['B1']='FY2027 月次推移表　－　プランD'; m['B1'].font=Font(name=F,bold=True,size=14)
m['B2']='既存事業は均等按分。上乗せ案件は②前提で指定した月に計上（計上月0＝12か月按分）。単位：円（税別）'; m['B2'].font=SM
R=4
m.cell(R,2,'科目').font=SB; m.cell(R,2).fill=SF
for i,mm in enumerate(MO27):
    c=m.cell(R,3+i,mm); c.font=SB; c.fill=SF; c.alignment=Alignment(horizontal='center')
c=m.cell(R,15,'通期'); c.font=SB; c.fill=SF; c.alignment=Alignment(horizontal='center')
def row(rr,label,fn,bold=False,fill=None,top=False,ind=0):
    c=m.cell(rr,2,('　'*ind)+label); c.font=SB if bold else BK
    if fill: c.fill=fill
    if top: c.border=TB
    for i in range(12):
        cc=m.cell(rr,3+i,fn(i,get_column_letter(3+i)))
        cc.number_format=YEN; cc.font=SB if bold else BK
        if fill: cc.fill=fill
        if top: cc.border=TB
    t=m.cell(rr,15,f'=SUM(C{rr}:N{rr})'); t.number_format=YEN; t.font=SB; t.fill=fill or TF
    if top: t.border=TB
def adv_m(i):
    return '+'.join(f'IF({Q(A0+k)}=0,0,IF({QD(A0+k)}=0,{Q(A0+k)}/12,IF({QD(A0+k)}={i+1},{Q(A0+k)},0)))'
                    for k in range(4))
r=5
m.cell(r,2,'【売上高】').font=SB; m.cell(r,2).fill=GRP
for c in range(3,16): m.cell(r,c).fill=GRP
R_SE=r+1; row(R_SE,'既存事業 売上',lambda i,c:f'={Q(EAV)}/12')
R_AD=r+2; row(R_AD,'＋上乗せ案件',lambda i,c:'='+adv_m(i),ind=1)
R_GK=r+3; row(R_GK,'＋現物出資 追加分',lambda i,c:f'=IF({Q(GK_M)}={i+1},{Q(GK_S)},0)',ind=1)
R_ST=r+4
row(R_ST,'売上高 合計',lambda i,c:f'=SUM({c}{R_SE}:{c}{R_GK})',bold=True,fill=TF,top=True)
r=R_ST+1
m.cell(r,2,'【売上総利益】').font=SB; m.cell(r,2).fill=GRP
for c in range(3,16): m.cell(r,c).fill=GRP
R_GB=r+1; row(R_GB,'既存事業 粗利（横ばい分）',lambda i,c:f'={Q(B_G)}')
R_GD=r+2; row(R_GD,'＋差額売上の粗利',lambda i,c:f'={Q(EDF)}*{Q(EGM)}/12',ind=1)
R_GA=r+3; row(R_GA,'＋上乗せ案件（原価なし）',lambda i,c:f'={c}{R_AD}',ind=1)
R_GG=r+4; row(R_GG,'＋現物出資 追加粗利',lambda i,c:f'=IF({Q(GK_M)}={i+1},{Q(GK_G)},0)',ind=1)
R_GT=r+5
row(R_GT,'売上総利益 合計',lambda i,c:f'=SUM({c}{R_GB}:{c}{R_GG})',bold=True,fill=OR_,top=True)
R_CG=r+6
row(R_CG,'（参考）売上原価',lambda i,c:f'={c}{R_ST}-{c}{R_GT}',ind=1)
r=R_CG+1
m.cell(r,2,'【販管費・損益】').font=SB; m.cell(r,2).fill=GRP
for c in range(3,16): m.cell(r,c).fill=GRP
R_SG=r+1; row(R_SG,'販管費',lambda i,c:f'={Q(B_P)}')
R_OP=r+2; row(R_OP,'営業利益',lambda i,c:f'={c}{R_GT}-{c}{R_SG}',bold=True,fill=OR_,top=True)
R_NE=r+3; row(R_NE,'営業外費用',lambda i,c:f'={Q(NOE)}/12')
R_OR=r+4; row(R_OR,'経常利益',lambda i,c:f'={c}{R_OP}-{c}{R_NE}',bold=True,fill=OR_,top=True)
R_CM=r+6
for k,(lab,src) in enumerate([('営業利益 累計',R_OP),('経常利益 累計',R_OR)]):
    rr=R_CM+k
    m.cell(rr,2,lab).font=SB
    for i in range(12):
        L=get_column_letter(3+i); Lp=get_column_letter(2+i)
        f_=f'={L}{src}' if i==0 else f'={Lp}{rr}+{L}{src}'
        c=m.cell(rr,3+i,f_); c.number_format=YEN; c.font=SB; c.fill=PatternFill('solid',fgColor='EDEDED')
for k,t in enumerate(['※既存事業の売上は前期・今期の売上平均を12か月で均等按分。季節変動は織り込んでいません。',
    '※差額売上の粗利は、横ばい実力値から売上平均までの差額164.2百万円に粗利率30%を乗じたもの。',
    '※上乗せ案件は原価なし。アピシウスM&A仲介20.0とコンサルティング料10.0はFY2026に前倒し計上済みです。',
    '※現物出資の追加計上は、②前提で売上0・粗利15.0百万円としています（FY2026と同じ建て付け）。']):
    m.cell(R_CM+3+k,2,t).font=RD
m.freeze_panes='C5'

# ============== ①サマリー ==============
s=wb.create_sheet('①サマリー',0)
for col,w in zip('ABCDEFG',[3,34,19,19,19,48,2]): s.column_dimensions[col].width=w
s['B1']='FY2027（2027年9月期）事業計画'; s['B1'].font=Font(name=F,bold=True,size=15)
s['B2']='ベース：2026年4-7月の実績月平均（不採算3店舗の撤退後）。単位：円（税別）'; s['B2'].font=SM
for j,t in enumerate(['科目','横ばい実力値\n（参考）','プランD\nメインシナリオ','プランE\n上振れシナリオ','コメント']):
    c=s.cell(4,2+j,t); c.font=HD; c.fill=HF; c.alignment=Alignment(horizontal='center',wrap_text=True,vertical='center')
s.row_dimensions[4].height=42
EX_D=f'{Q(EAV)}'; EX_E=f'({Q(EAV)}+{Q(EAD)})'
GPD=f'({QD(B_G)}+{Q(EDF)}*{Q(EGM)}+{Q(AT)}+{Q(GK_G)})'
GPE=f'({QD(B_G)}+{Q(EDF)}*{Q(EGM)}+{Q(AT)}+{Q(GK_G)}+{Q(EAD)}*{Q(EGM)})'
SLD=f'({Q(EAV)}+{Q(AT)}+{Q(GK_S)})'
SLE=f'({Q(EAV)}+{Q(EAD)}+{Q(AT)}+{Q(GK_S)})'
spec=[('既存事業 売上',f'={QD(B_S)}',f'={EX_D}',f'={EX_E}','Dは前期・今期の売上平均。Eは私募＋オークション300を上積み'),
      ('＋上乗せ案件',0,f'={Q(AT)}',f'={Q(AT)}','コンサルティング料82.5＋クルーザー×ワイン事業20.0'),
      ('＋現物出資 追加計上',0,f'={Q(GK_S)}',f'={Q(GK_S)}','売上計上しない前提のため0。粗利15.0のみ計上'),
      ('売上高 合計',f'={QD(B_S)}',f'={SLD}',f'={SLE}',''),
      ('売上総利益',f'={QD(B_G)}',f'={GPD}',f'={GPE}','差額売上・追加売上の粗利率は保守的に30%'),
      ('　総合粗利率',None,None,None,''),
      ('販管費',f'={QD(B_P)}',f'={QD(B_P)}',f'={QD(B_P)}','2026/04-07実績の月平均×12'),
      ('営業利益',None,None,None,''),
      ('営業外費用',f'={Q(NOE)}',f'={Q(NOE)}',f'={Q(NOE)}','みずほ銀行への返済により支払利息が減少'),
      ('経常利益',None,None,None,''),
      ('法人税等',0,None,None,'繰越欠損金139.9百万円を超える所得に課税'),
      ('当期純利益',None,None,None,'')]
S0=5
bold={'売上高 合計','売上総利益','営業利益','経常利益','当期純利益'}
for i,(lab,a,bb,cc,note) in enumerate(spec):
    r=S0+i; isb=lab in bold
    s.cell(r,2,lab).font=SB if isb else BK
    for j,v in enumerate((a,bb,cc)):
        if v is not None:
            x=s.cell(r,3+j,v); x.number_format=YEN; x.font=SB if isb else BK
    s.cell(r,6,note).font=SM
    if isb:
        for c2 in range(2,7): s.cell(r,c2).fill=TF; s.cell(r,c2).border=TB
L_EX,L_AD,L_GK,L_ST,L_GP,L_GM,L_SG,L_OP,L_NE,L_OR,L_TX,L_NI=[S0+i for i in range(12)]
for col in 'CDE':
    s[f'{col}{L_GM}']=f'={col}{L_GP}/{col}{L_ST}'; s[f'{col}{L_GM}'].number_format=PCT; s[f'{col}{L_GM}'].font=BK
    s[f'{col}{L_OP}']=f'={col}{L_GP}-{col}{L_SG}'; s[f'{col}{L_OP}'].number_format=YEN; s[f'{col}{L_OP}'].font=SB
    s[f'{col}{L_OR}']=f'={col}{L_OP}-{col}{L_NE}'; s[f'{col}{L_OR}'].number_format=YEN; s[f'{col}{L_OR}'].font=SB
    s[f'{col}{L_NI}']=f'={col}{L_OR}-{col}{L_TX}'; s[f'{col}{L_NI}'].number_format=YEN; s[f'{col}{L_NI}'].font=SB
for col in 'DE':
    s[f'{col}{L_TX}']=f'=MAX(0,{col}{L_OR}-{Q(TLOSS)})*{Q(TRATE)}'
    s[f'{col}{L_TX}'].number_format=YEN; s[f'{col}{L_TX}'].font=BK
for r in (L_OP,L_OR):
    for c2 in range(2,7): s.cell(r,c2).fill=OR_
n=L_NI+2
bar(s,n,'【判定】',5)
jd=['横ばい実力値：2026年4-7月の実績をそのまま延ばすと営業利益▲79.5・経常利益▲91.5百万円。',
    'プランD：既存事業を前期・今期の売上平均656.4百万円に戻し、契約ベースの上乗せ案件102.5百万円と',
    '　　現物出資の追加粗利15.0百万円を加算。売上758.9・営業＋87.2・経常＋75.2百万円。',
    'プランE：Dに私募ファンド＋オークションで300百万円（粗利率30%）を上積み。',
    '　　売上1,058.9・営業＋177.2・経常＋165.2百万円。繰越欠損金超過分に法人税8.6百万円。',
    '',
    '※FY2026の着地は営業利益＋1.0・経常▲11.6百万円。ここからの改善幅はDで＋86.2百万円。',
    '※アピシウスM&A仲介20.0とコンサルティング料10.0の計30.0百万円はFY2026に前倒し計上済みのため、',
    '　　今期の上乗せ案件は132.5→102.5百万円に減っています。',
    '※期首の商品在庫は187.4百万円（従来モデルの420百万円から大幅減）。仕入計画は④をご参照ください。',
    '※期首現預金は仮に30百万円。2026/09末の着地値への差し替えが必要です。']
for i,t in enumerate(jd):
    c=s.cell(n+1+i,2,t); c.font=Font(name=F,size=10)
    s.merge_cells(start_row=n+1+i,start_column=2,end_row=n+1+i,end_column=6)

# ============== ④ワイン仕入・在庫計画 ==============
iv=wb.create_sheet('④仕入・在庫計画')
for col,w in zip('ABCDEF',[3,38,20,20,58,2]): iv.column_dimensions[col].width=w
iv['B1']='ワイン仕入・在庫計画（FY2027）'; iv['B1'].font=Font(name=F,bold=True,size=15)
iv['B2']='期首在庫が187.4百万円まで下がるため、売上を作るには仕入が必要です。単位：円'; iv['B2'].font=RD
bar(iv,4,'【1】在庫の推移',4)
for j,t in enumerate(['項目','プランD','プランE']):
    c=iv.cell(5,2+j,t); c.font=HD; c.fill=HF; c.alignment=Alignment(horizontal='center')
I0=6
rows=[('期首在庫（2026/09末）',f'={Q(INV0)}',f'={Q(INV0)}','FY2026着地予想より'),
      ('＋ 年間仕入',f'={Q(BUY27)}',f'={Q(BUY27)}','②前提の入力値。割当維持のため落とさない前提'),
      ('− 売上原価（出庫）',None,None,'売上高−売上総利益。上乗せ案件・現物出資は原価なし'),
      ('期末在庫',None,None,'')]
for i,(t,d,e,nt) in enumerate(rows):
    r=I0+i; isb=(i==3)
    iv.cell(r,2,t).font=SB if isb else BK
    for j,v in enumerate((d,e)):
        if v is not None:
            c=iv.cell(r,3+j,v); c.number_format=YEN; c.font=BK
    iv.cell(r,5,nt).font=SM
    if isb:
        for c2 in range(2,5): iv.cell(r,c2).fill=OR_; iv.cell(r,c2).border=TB
I_B,I_BUY,I_OUT,I_END=I0,I0+1,I0+2,I0+3
iv[f'C{I_OUT}']=f"=-('①サマリー'!D{L_ST}-'①サマリー'!D{L_GP})"
iv[f'D{I_OUT}']=f"=-('①サマリー'!E{L_ST}-'①サマリー'!E{L_GP})"
for col in 'CD':
    iv[f'{col}{I_OUT}'].number_format=YEN; iv[f'{col}{I_OUT}'].font=BK
    iv[f'{col}{I_END}']=f'=SUM({col}{I_B}:{col}{I_OUT})'
    iv[f'{col}{I_END}'].number_format=YEN; iv[f'{col}{I_END}'].font=SB
n=I_END+2
bar(iv,n,'【2】留意点',4)
for i,t in enumerate([
    '※期首在庫は、2026/09に私募ファンドの売上計上分（原価255百万円）と現物出資分（簿価270百万円）が抜けた後の残高です。',
    '※プランEは売上原価が589.2百万円に増えるため、仕入450百万円では期末在庫が48.3百万円まで枯渇します。',
    '　　上振れを取りにいく場合は仕入も積み増す必要があり、その分の運転資金が追加で要ります。',
    '※在庫を一定水準（例：期末300百万円）に保つなら、プランDで約491.7百万円、プランEで約701.7百万円の仕入が必要です。']):
    iv.cell(n+1+i,2,t).font=RD
for ws in wb: ws.sheet_view.showGridLines=False
wb.save('WineBank_FY2027_事業計画.xlsx'); print('saved')
