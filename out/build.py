# -*- coding: utf-8 -*-
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

A='Arial'
BLACK=Font(name=A); BLUE=Font(name=A,color='0000FF'); GREEN=Font(name=A,color='008000')
SUB=Font(name=A,bold=True); H=Font(name=A,bold=True,color='FFFFFF')
SM=Font(name=A,size=9,color='595959'); RED=Font(name=A,size=9,color='C00000')
HF=PatternFill('solid',fgColor='1F3864'); SUBF=PatternFill('solid',fgColor='D9E2F3')
YEL=PatternFill('solid',fgColor='FFFF00'); TOT=PatternFill('solid',fgColor='F2F2F2')
OPF=PatternFill('solid',fgColor='FFF2CC'); ORF=PatternFill('solid',fgColor='C6E0B4')
TB=Border(top=Side(style='thin',color='000000'))
YEN='¥#,##0;(¥#,##0);-'; PCT='0.0%'

wb=Workbook(); wb.remove(wb.active)

# ================= ②前提 =================
p=wb.create_sheet('②前提')
p.column_dimensions['A'].width=3; p.column_dimensions['B'].width=40
for c in 'CDE': p.column_dimensions[c].width=17
p.column_dimensions['F'].width=70
def bar(r,t):
    p.cell(r,2,t).font=H
    for c in range(2,7): p.cell(r,c).fill=HF
    p.cell(r,2).font=H
p['B1']='株式会社WineBank　FY2027（2027年9月期）利益予測モデル　－　前提条件'
p['B1'].font=Font(name=A,bold=True,size=14)
p['B2']='青字＝入力セル／黄色＝主要前提／黒字＝計算式　　単位：円（税別）'; p['B2'].font=SM
p['B3']='作成日 2026/08/21　出典：事業計画202608（銀行様）全社シート月次、決算報告書 第54期'; p['B3'].font=SM

def block(r0,title,rows,note,noteFont=SM):
    bar(r0,title)
    for j,t in enumerate(['月','売上','売上総利益','販管費']):
        c=p.cell(r0+1,2+j,t); c.font=SUB; c.fill=SUBF; c.alignment=Alignment(horizontal='center')
    for i,(m,s,g,sg) in enumerate(rows):
        rr=r0+2+i
        p.cell(rr,2,m).font=BLACK
        for j,v in enumerate((s,g,sg)):
            c=p.cell(rr,3+j,v); c.font=BLUE; c.number_format=YEN
    rs,re_=r0+2,r0+2+len(rows)-1
    rt=re_+1; rm=re_+2; rp=re_+3
    p.cell(rt,2,'3か月合計').font=SUB
    p.cell(rm,2,'月平均（＝横ばい前提の月次ベース）').font=SUB
    for j,col in enumerate('CDE'):
        c=p.cell(rt,3+j,f'=SUM({col}{rs}:{col}{re_})'); c.number_format=YEN; c.font=SUB; c.fill=TOT
        c=p.cell(rm,3+j,f'={col}{rt}/3'); c.number_format=YEN; c.font=SUB; c.fill=TOT
    p.cell(rp,2,'売上総利益率').font=BLACK
    c=p.cell(rp,3,f'=D{rm}/C{rm}'); c.number_format=PCT; c.font=BLACK
    p.cell(rp,6,note).font=noteFont
    return rm,rp

B1_ROWS=[('2026/04',31863679,15679441,25883967),
         ('2026/05',33917025,18139193,24529013),
         ('2026/06',31504488,16331848,24627286)]
B2_ROWS=[('2026/05',33917025,18139193,24529013),
         ('2026/06',31504488,16331848,24627286),
         ('2026/07',60489854,22093448,21021015)]
m1,_=block(5,'【1】ベース候補①：直近3か月の「実績」（2026/04-06）　★推奨',B1_ROWS,
  '事業計画の月次のうち、実績として確定しているのは2026/06まで。2026/07以降は同一値が並ぶ見込値。')
m2,_=block(14,'【2】ベース候補②：2026/05-07（※2026/07は「見込」。計画上のコスト削減が実現した場合）',B2_ROWS,
  '2026/07は地代家賃3.97百万→1.30百万、業務委託費3.08百万→1.14百万など未実現の削減が織り込まれた見込値。',RED)

R_SEL=23
bar(R_SEL,'【3】採用ベース')
p.cell(R_SEL+1,2,'採用ベース（1＝①実績2026/04-06　／　2＝②2026/05-07）').font=BLACK
c=p.cell(R_SEL+1,3,1); c.font=BLUE; c.fill=YEL; c.number_format='0'
lbls=[('採用：月次 売上',f'=IF($C${R_SEL+1}=1,C{m1},C{m2})',YEN),
      ('採用：月次 売上総利益',f'=IF($C${R_SEL+1}=1,D{m1},D{m2})',YEN),
      ('採用：月次 販管費',f'=IF($C${R_SEL+1}=1,E{m1},E{m2})',YEN),
      ('採用：売上総利益率',f'=C{R_SEL+3}/C{R_SEL+2}',PCT)]
for i,(t,f,fmt) in enumerate(lbls):
    rr=R_SEL+2+i
    p.cell(rr,2,t).font=SUB
    c=p.cell(rr,3,f); c.number_format=fmt; c.font=SUB; c.fill=TOT
S_M,G_M,P_M,GM_R=R_SEL+2,R_SEL+3,R_SEL+4,R_SEL+5

R_IT=30
bar(R_IT,'【4】上乗せ案件（2026/09-2027/08）　※ご提供の一覧')
for j,t in enumerate(['区分','金額','','損益計上区分']):
    c=p.cell(R_IT+1,2+j,t); c.font=SUB; c.fill=SUBF
items=[('経営指導料　Value table',10000000,'営業収益（原価なし）'),
       ('経営指導料　Prime',60000000,'営業収益（原価なし）'),
       ('経営指導料　Apicius',10000000,'営業収益（原価なし）'),
       ('経営指導料　Thierry Marx',2500000,'営業収益（原価なし）'),
       ('経営指導料　ito＋Aqua＋Hokkaido',10000000,'営業収益（原価なし）'),
       ('インセンティブ　Apicius2 shot',20000000,'営業収益（成功報酬・一時）'),
       ('投資売買益　Cruiser shot',20000000,'営業外収益（一時）')]
for i,(n,v,k) in enumerate(items):
    rr=R_IT+2+i
    p.cell(rr,2,n).font=BLACK
    c=p.cell(rr,3,v); c.font=BLUE; c.number_format=YEN; c.fill=YEL
    p.cell(rr,5,k).font=BLACK
IT0=R_IT+2; IT1=R_IT+8              # 34..40
R_TOT=R_IT+9
p.cell(R_TOT,2,'合計').font=SUB
c=p.cell(R_TOT,3,f'=SUM(C{IT0}:C{IT1})'); c.number_format=YEN; c.font=SUB; c.fill=TOT
p.cell(R_TOT+1,2,'　うち 営業収益に計上').font=BLACK
c=p.cell(R_TOT+1,3,f'=SUM(C{IT0}:C{IT1-1})'); c.number_format=YEN; c.font=BLACK
p.cell(R_TOT+2,2,'　うち 営業外収益に計上').font=BLACK
c=p.cell(R_TOT+2,3,f'=C{IT1}'); c.number_format=YEN; c.font=BLACK
ADV,INV=R_TOT+1,R_TOT+2
p.cell(R_TOT,6,'※一覧の期間表記は2026/09-2027/08。当社決算期(2026/10-2027/09)と1か月ズレるため全額FY2027帰属で試算。').font=RED
p.cell(R_TOT+1,6,'※うち約100百万円（Value table・Prime・Apicius・Apicius2）はグループ内取引。銀行は正常化調整で控除する可能性が高い。').font=RED

R_O=R_TOT+4
bar(R_O,'【5】その他前提')
oth=[('上場関連コスト（年額）',36000000,YEN,'事業計画FY2027計画値。計上しない場合は0を入力。'),
     ('営業外費用（支払利息等・年額）',15000000,YEN,'事業計画FY2027計画値'),
     ('インセンティブ 計上月（1〜12）',6,'0','FY2027の何か月目に計上するか（6＝2027年3月）'),
     ('投資売買益 計上月（1〜12）',6,'0','FY2027の何か月目に計上するか（6＝2027年3月）'),
     ('目標営業利益',100000000,YEN,'シナリオDの目標値')]
for i,(t,v,fmt,nt) in enumerate(oth):
    rr=R_O+1+i
    p.cell(rr,2,t).font=BLACK
    c=p.cell(rr,3,v); c.font=BLUE; c.number_format=fmt; c.fill=YEL
    p.cell(rr,6,nt).font=SM
IPO,NOE,MI,MV,TGT=R_O+1,R_O+2,R_O+3,R_O+4,R_O+5
rr=R_O+6
p.cell(rr,2,'法人税等').font=BLACK; p.cell(rr,3,'均等割のみ').font=BLUE
p.cell(rr,6,'FY2025▲127.4百万円＋FY2026▲124.8百万円＝繰越欠損金 約252百万円。資本金1,000万円の中小法人は所得の100%控除可のため、FY2027の黒字に法人税は実質発生しない。').font=SM
p.cell(rr,6).alignment=Alignment(wrap_text=True,vertical='top'); p.row_dimensions[rr].height=42

Q=lambda r,c='C': f"'②前提'!${c}${r}"

# ================= ③FY2027月次 =================
m=wb.create_sheet('③FY2027月次')
m.column_dimensions['A'].width=3; m.column_dimensions['B'].width=36
months=['2026/10','2026/11','2026/12','2027/01','2027/02','2027/03','2027/04','2027/05','2027/06','2027/07','2027/08','2027/09']
for i in range(12): m.column_dimensions[get_column_letter(3+i)].width=14
m.column_dimensions['O'].width=17
m['B1']='FY2027（2026年10月-2027年9月）月次予測　＝　採用ベース横ばい ＋ 上乗せ案件132.5百万円'
m['B1'].font=Font(name=A,bold=True,size=13)
m['B2']='②前提シートの「採用ベース」セルで、実績ベース①／見込ベース②を切替えられます。緑字＝②前提からのリンク'; m['B2'].font=SM
m.cell(4,2,'科目').font=SUB; m.cell(4,2).fill=SUBF
for i,mo in enumerate(months):
    c=m.cell(4,3+i,mo); c.font=SUB; c.fill=SUBF; c.alignment=Alignment(horizontal='center')
c=m.cell(4,15,'通期合計'); c.font=SUB; c.fill=SUBF; c.alignment=Alignment(horizontal='center')

def mrow(r,label,fn,bold=False,fill=None,font=BLACK,top=False):
    cl=m.cell(r,2,label); cl.font=SUB if bold else font
    if fill: cl.fill=fill
    if top: cl.border=TB
    for i in range(12):
        col=get_column_letter(3+i)
        c=m.cell(r,3+i,fn(i,col)); c.number_format=YEN; c.font=SUB if bold else font
        if fill: c.fill=fill
        if top: c.border=TB
    t=m.cell(r,15,f'=SUM(C{r}:N{r})'); t.number_format=YEN; t.font=SUB; t.fill=fill or TOT
    if top: t.border=TB

mrow(5,'売上（既存事業・横ばい）',      lambda i,c:f'={Q(S_M)}', font=GREEN)
mrow(6,'売上原価',                    lambda i,c:f'={c}5-{c}7')
mrow(7,'売上総利益（既存事業）',        lambda i,c:f'={Q(G_M)}', font=GREEN)
mrow(8,'＋経営指導料（5社計）',         lambda i,c:f"=SUM({Q(IT0)}:{Q(IT0+4)})/12", font=GREEN)
mrow(9,'＋インセンティブ（Apicius2）',  lambda i,c:f"=IF({i+1}={Q(MI)},{Q(IT1-1)},0)", font=GREEN)
mrow(10,'売上総利益 合計',             lambda i,c:f'={c}7+{c}8+{c}9', bold=True, fill=TOT, top=True)
mrow(11,'販管費（既存・横ばい）',       lambda i,c:f'={Q(P_M)}', font=GREEN)
mrow(12,'上場関連コスト',              lambda i,c:f'={Q(IPO)}/12', font=GREEN)
mrow(13,'販管費 合計',                lambda i,c:f'={c}11+{c}12', bold=True, fill=TOT, top=True)
mrow(14,'営業利益',                   lambda i,c:f'={c}10-{c}13', bold=True, fill=OPF, top=True)
mrow(15,'営業外収益（投資売買益）',      lambda i,c:f"=IF({i+1}={Q(MV)},{Q(IT1)},0)", font=GREEN)
mrow(16,'営業外費用（支払利息等）',      lambda i,c:f'={Q(NOE)}/12', font=GREEN)
mrow(17,'経常利益',                   lambda i,c:f'={c}14+{c}15-{c}16', bold=True, fill=ORF, top=True)
m.cell(6,2).font=BLACK
m['B19']='※売上原価＝売上−売上総利益（採用ベースの実績粗利率をそのまま適用）。経営指導料・インセンティブ・投資売買益は原価ゼロで計上。'
m['B19'].font=SM
m.freeze_panes='C5'

# ================= ①サマリー =================
s=wb.create_sheet('①サマリー',0)
s.column_dimensions['A'].width=3; s.column_dimensions['B'].width=40
for col in 'CDEFG': s.column_dimensions[col].width=18
s.column_dimensions['H'].width=48
s['B1']='FY2027（2027年9月期）利益予測　シナリオ比較'; s['B1'].font=Font(name=A,bold=True,size=15)
s['B2']='直近3か月を横ばい延伸 ＋ 上乗せ案件132.5百万円'; s['B2'].font=Font(name=A,size=10,color='595959')
s['B3']='作成日 2026/08/21　単位：円（税別）　出典：事業計画202608（銀行様）月次／決算報告書 第54期'; s['B3'].font=SM

heads=['科目','FY2026 見込\n（現行計画）','A. 実績横ばい\n上乗せなし','B. 実績横ばい\n＋132.5百万円',
       'C. 見込横ばい\n＋132.5百万円','D. 営業利益1億円\n（Cから逆算）','コメント']
for j,t in enumerate(heads):
    c=s.cell(5,2+j,t); c.font=H; c.fill=HF
    c.alignment=Alignment(horizontal='center',wrap_text=True,vertical='center')
s.row_dimensions[5].height=44

b1S,b1G,b1P=f'{Q(m1)}*12',f'{Q(m1,"D")}*12',f'{Q(m1,"E")}*12'
b2S,b2G,b2P=f'{Q(m2)}*12',f'{Q(m2,"D")}*12',f'{Q(m2,"E")}*12'
adv,inv,ipo,noe,tgt=Q(ADV),Q(INV),Q(IPO),Q(NOE),Q(TGT)
gm2=f'{Q(m2,"D")}/{Q(m2,"C")}'

spec=[
 ('売上（既存事業）',      708205820, f'={b1S}',      f'={b1S}',      f'={b2S}',      f'=F6+G9/({gm2})', ''),
 ('売上総利益（既存事業）', 229139405, f'={b1G}',      f'={b1G}',      f'={b2G}',      '=F7',            ''),
 ('＋上乗せ案件（営業収益）',0,        0,              f'={adv}',      f'={adv}',      '=F8', '経営指導料92.5百万＋インセンティブ20百万'),
 ('　追加で必要な粗利',    None,      None,           None,           None,           '=G14+G13-F7-F8', 'シナリオD：目標達成に不足する粗利'),
 ('売上総利益 合計',       229139405, '=D7+D8',       '=E7+E8',       '=F7+F8',       '=G7+G8+G9', ''),
 ('販管費（既存）',        343932836, f'={b1P}',      f'={b1P}',      f'={b2P}',      '=F11', ''),
 ('上場関連コスト',        0,         f'={ipo}',      f'={ipo}',      f'={ipo}',      f'={ipo}', ''),
 ('販管費 合計',           343932836, '=D11+D12',     '=E11+E12',     '=F11+F12',     '=G11+G12', ''),
 ('営業利益',              -114793431,'=D10-D13',     '=E10-E13',     '=F10-F13',     f'={tgt}', 'Dは目標値を固定して逆算'),
 ('営業外収益（投資売買益）',0,        0,              f'={inv}',      f'={inv}',      f'={inv}', ''),
 ('営業外費用',            10000000,  f'={noe}',      f'={noe}',      f'={noe}',      f'={noe}', ''),
 ('経常利益',              -124793431,'=D14+D15-D16', '=E14+E15-E16', '=F14+F15-F16', '=G14+G15-G16', ''),
 ('法人税等',              0,         0,              0,              0,              0, '繰越欠損金 約252百万円により実質非課税'),
 ('当期純利益',            -124793431,'=D17-D18',     '=E17-E18',     '=F17-F18',     '=G17-G18', ''),
]
bold={10,13,14,17,19}
for i,(lab,*vals) in enumerate(spec):
    rr=6+i; note=vals[-1]; nums=vals[:-1]
    cl=s.cell(rr,2,lab); cl.font=SUB if rr in bold else BLACK
    for j,v in enumerate(nums):
        c=s.cell(rr,3+j,v); c.number_format=YEN
        c.font=SUB if rr in bold else (BLUE if j==0 and isinstance(v,int) else BLACK)
    s.cell(rr,8,note).font=SM
    if rr in bold:
        for c in range(2,8): s.cell(rr,c).fill=TOT; s.cell(rr,c).border=TB
    if rr==14:
        for c in range(2,8): s.cell(rr,c).fill=OPF
    if rr==17:
        for c in range(2,8): s.cell(rr,c).fill=ORF
    if rr==9: s.cell(rr,7).fill=YEL

s['B21']='【判定】'; s['B21'].font=Font(name=A,bold=True,size=12)
notes=[
 'A：直近3か月の実績（2026/04-06）をそのまま延ばすと、上乗せ案件なしでは営業利益は大幅赤字のまま。',
 'B：実績ベースに132.5百万円を全部足しても、上場関連コスト36百万円を計上すると営業利益はまだ赤字。ほぼトントン。',
 'C：2026/07以降に計画されているコスト削減（地代家賃・業務委託費等）が実現すれば黒字化する。',
 '　　→「何もしなくても4,000-5,000万円黒字」が成立するのは、このコスト削減が実現し、かつ上場関連コストを計上しない場合に限られる。',
 'D：営業利益1億円には、Cからさらに粗利の上積みが必要（G9セル）。これが「プラスのことをやる」の必要量。',
 '',
 '※FY2026見込（C列）には2026/09単月に売上232.9百万円（通期の33%）が織り込まれている。本モデルはこれを前提に置いていないため保守的。',
 '※上乗せ案件のうち約100百万円はグループ内取引。銀行は正常化調整で控除する可能性が高い。',
]
for i,n in enumerate(notes):
    c=s.cell(22+i,2,n); c.font=Font(name=A,size=10)
    s.merge_cells(start_row=22+i,start_column=2,end_row=22+i,end_column=8)

# ================= ④FY2026月次 =================
h=wb.create_sheet('④FY2026月次')
h.column_dimensions['A'].width=3; h.column_dimensions['B'].width=24
h['B1']='FY2026（2025年10月-2026年9月）月次　※出典：事業計画202608（銀行様）全社シート'; h['B1'].font=Font(name=A,bold=True,size=12)
h['B2']='青字＝実績（2026/06まで）　／　灰字斜体＝見込（2026/07以降）'; h['B2'].font=RED
fm=['2025/10','2025/11','2025/12','2026/01','2026/02','2026/03','2026/04','2026/05','2026/06','2026/07','2026/08','2026/09']
data={'売上':[32789307,96919229,43039844,32477958,41290432,33033585,31863679,33917025,31504488,60489854,37962048,232918371],
 '売上原価':[18502877,69212121,21085289,16521949,21070367,18454664,16184238,15777832,15172640,38396406,23721353,204966678],
 '売上総利益':[14286430,27707108,21954555,15956009,20220065,14578921,15679441,18139193,16331848,22093448,14240695,27951692],
 '販管費':[25374892,30963282,38572456,33761779,34133901,38737868,25883967,24529013,24627286,21021015,23912798,22414579]}
h.cell(4,2,'科目').font=SUB; h.cell(4,2).fill=SUBF
for i,mo in enumerate(fm):
    c=h.cell(4,3+i,mo); c.font=SUB; c.fill=SUBF; c.alignment=Alignment(horizontal='center')
    h.column_dimensions[get_column_letter(3+i)].width=14
h.cell(4,15,'通期').font=SUB; h.cell(4,15).fill=SUBF; h.column_dimensions['O'].width=17
rr=5
GREYI=Font(name=A,color='808080',italic=True)
for k,v in data.items():
    h.cell(rr,2,k).font=BLACK
    for i,x in enumerate(v):
        c=h.cell(rr,3+i,x); c.number_format=YEN; c.font=BLUE if i<9 else GREYI
    t=h.cell(rr,15,f'=SUM(C{rr}:N{rr})'); t.number_format=YEN; t.font=SUB; t.fill=TOT
    rr+=1
h.cell(rr,2,'営業利益').font=SUB; h.cell(rr,2).border=TB
for i in range(12):
    c=get_column_letter(3+i)
    cc=h.cell(rr,3+i,f'={c}7-{c}8'); cc.number_format=YEN; cc.font=SUB; cc.fill=TOT; cc.border=TB
t=h.cell(rr,15,f'=SUM(C{rr}:N{rr})'); t.number_format=YEN; t.font=SUB; t.fill=TOT; t.border=TB
h.cell(rr+2,2,'販管費：2026/03の38,737,868円/月をピークに2026/06は24,627,286円/月（▲36.4%）。コスト削減が実行段階にあることの根拠。').font=RED
h.cell(rr+3,2,'2026/07以降の販管費（21.0/23.9/22.4百万円）には、地代家賃3.97→1.30百万円、業務委託費3.08→1.14百万円など未実現の削減が織り込まれている。').font=RED
h.freeze_panes='C5'

wb.save('WineBank_FY2027_forecast.xlsx'); print('saved')
