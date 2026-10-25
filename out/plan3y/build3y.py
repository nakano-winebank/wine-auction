# -*- coding: utf-8 -*-
"""WineBank 3か年計画 FY2027-FY2029（10/20指示ベース・試算表実績から積み上げ）"""
import sys; sys.path.insert(0,'.')
from data import *
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter as CL

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
    for c in range(2,2+span): ws.cell(r,c).fill=HF
    ws.cell(r,2,t).font=HD
def hdr(ws,r,labels,c0=2):
    for j,t in enumerate(labels):
        c=ws.cell(r,c0+j,t); c.font=HD; c.fill=HF
        c.alignment=Alignment(horizontal='center',vertical='center',wrap_text=True)
def inp(ws,r,c,v,fmt=YEN):
    x=ws.cell(r,c,v); x.number_format=fmt; x.font=BL; x.fill=YL; return x
def fml(ws,r,c,v,fmt=YEN,bold=False,fill=None):
    x=ws.cell(r,c,v); x.number_format=fmt; x.font=SB if bold else BK
    if fill: x.fill=fill
    return x
DEPTS=['本部','EC/酒販店卸','ワインテック','その他']
YRS=['FY2027','FY2028','FY2029']

# ======================= ③前提 =======================
p=wb.create_sheet('③前提')
for col,w in zip('ABCDEFGHI',[3,44,17,17,17,17,14,10,60]): p.column_dimensions[col].width=w
p['B1']='3か年計画 FY2027〜FY2029　前提条件'; p['B1'].font=Font(name=F,bold=True,size=15)
p['B2']='黄色＝入力セル（変えると全シートに反映）。2026年10月20日の中野指示ベース。単位：円（税別）'; p['B2'].font=SM
R={}
r=4; bar(p,r,'【1】FY2026着地の材料　※2025/10-2026/07は試算表実績、8-9月は想定',8)
f26=[('s10','10か月実績 売上高（2025/10-2026/07）',sum(SALES),'試算表 損益計算書（月次推移）合計欄'),
     ('g10','10か月実績 売上総利益',sum(GP),'同上'),
     ('p10','10か月実績 販管費',sum(SGA),'同上'),
     ('ni10','10か月実績 営業外収益',sum(NOI),'同上'),
     ('ne10','10か月実績 営業外費用',sum(NOE),'同上'),
     ('sl','特別損失（和解金）',900000,'同上。特別利益は0'),
     ('adj','7月末までの営業利益の戻し（販管費）',8000000,'中野指示（9/20）'),
     ('s89','2026/08-09 既存事業 売上',115000000,'中野指示：2か月で110〜120百万円の中央値'),
     ('p89','2026/08-09 販管費（＝粗利。営業利益トントン）',round(sum(SGA[6:10])/4*2),'2026/04-07実績の月平均×2。トントン前提のため粗利も同額'),
     ('ne89','2026/08-09 営業外費用',round(sum(NOE[6:10])/4*2),'2026/04-07実績の月平均×2'),
     ('pfs','私募ファンド 前期計上 売上',200000000,'★中野指示（10/20）「2億数千万」。確定値に差し替え'),
     ('pfr','私募ファンド 前期計上 粗利率',0.05,'★戸髙さん版と同じ5%。確定値に差し替え'),
     ('fee','経営指導料 前倒し計上（FY2027分から）',30000000,'中野指示（10/20）'),
     ('tl25','繰越欠損金 FY2025末残高',127364212,'決算報告書 第54期'),
     ('inv7','2026/07末 商品在庫',721162328,'試算表 貸借対照表'),
     ('buy89','2026/08-09 商品仕入',55000000,'中野指示：50〜60百万円の中央値')]
for k,lab,v,nt in f26:
    r+=1; R[k]=r; p.cell(r,2,lab).font=BK
    inp(p,r,3,v,PCT if k=='pfr' else YEN); p.cell(r,9,nt).font=RD if '★' in nt else SM
r+=2; bar(p,r,'【2】ベース：再編後の実力値（2026/04-07 試算表実績の月平均×12）',8)
b=slice(6,10)
pers=(2104000*4+2863712+2818448+2851646+2819528+203576+177120+213529+218577+1046339+1511149+1512582+271131)/4
base=[('bs','横ばい 売上（年）',round(sum(SALES[b])/4*12),'4月32.5／5月35.5／6月32.9／7月63.1百万円'),
      ('bg','横ばい 売上総利益（年）',round(sum(GP[b])/4*12),'粗利率46.3%'),
      ('bp','横ばい 販管費（年）',round(sum(SGA[b])/4*12),'撤退3店舗を含まない4か月'),
      ('bpp','　うち 人件費（年）',round(pers*12),'役員報酬・給与・雑給・法定福利費')]
for k,lab,v,nt in base:
    r+=1; R[k]=r; p.cell(r,2,lab).font=BK; inp(p,r,3,v); p.cell(r,9,nt).font=SM
r+=2; bar(p,r,'【3】既存事業 売上',8)
r+=1; hdr(p,r,['項目','','FY2027','FY2028','FY2029'])
r+=1; R['s25']=r; p.cell(r,2,'FY2025 売上高（実績）').font=BK; inp(p,r,3,752864901); p.cell(r,9,'決算報告書 第54期').font=SM
r+=1; R['g']=r; p.cell(r,2,'既存事業 前年比成長率').font=BK
fml(p,r,4,'—','@'); inp(p,r,5,0.0,PCT); inp(p,r,6,0.0,PCT)
p.cell(r,9,'FY2027は前期・前々期の売上平均。FY2028以降はFY2027水準からの成長率（初期値0%＝横ばい）').font=SM
r+=1; R['dgr']=r; p.cell(r,2,'差額売上の粗利率').font=BK; inp(p,r,3,0.30,PCT)
p.cell(r,9,'横ばい実力値から売上平均までの差額に適用。FY2025 26.8%・実績を踏まえ保守的に30%').font=SM
r+=2; bar(p,r,'【4】上乗せ案件（原価なし）',8)
r+=1; hdr(p,r,['案件','','FY2027','FY2028','FY2029','計上部門','計上月'])
p.cell(r,9,'計上月はFY2027月次用：0＝12か月按分／1〜12＝10月からの月番号').font=SM
adv=[('グループ経営指導料　間接グループ5社',80000000,110000000,110000000,'本部',0,
      '中野指示（10/20）：本来110百万円超、うち30百万円を前期に前倒しのため今期80百万円程度。FY2028以降は110百万円'),
     ('コンサルティング料　Thierry Marx',2500000,2500000,2500000,'本部',0,'契約更新が前提'),
     ('コンサルティング料　Apicius',10000000,10000000,10000000,'本部',0,'契約更新が前提'),
     ('M&A仲介',20000000,0,0,'本部',6,'一時収益。FY2028以降は案件化が未確定のため0'),
     ('クルーザー×ワイン事業',20000000,20000000,20000000,'その他',0,'年2回（3月・9月）各10百万円。月次は按分で表示')]
R['a0']=r+1
for lab,a,b2,c,dep,mm,nt in adv:
    r+=1; p.cell(r,2,lab).font=BK
    for j,v in enumerate((a,b2,c)): inp(p,r,4+j,v)
    x=p.cell(r,7,dep); x.font=BL; x.fill=YL
    inp(p,r,8,mm,'0'); p.cell(r,9,nt).font=SM
R['a1']=r
r+=1; R['at']=r; p.cell(r,2,'上乗せ案件 合計').font=SB
for j in range(3):
    L=CL(4+j); fml(p,r,4+j,f'=SUM({L}{R["a0"]}:{L}{R["a1"]})',bold=True,fill=OR_)
r+=2; bar(p,r,'【5】私募ファンド（プランEのみ）',8)
r+=1; hdr(p,r,['項目','','FY2027','FY2028','FY2029'])
r+=1; R['pe']=r; p.cell(r,2,'私募ファンド 売上').font=BK
for j,v in enumerate((700000000,1000000000,1000000000)): inp(p,r,4+j,v)
p.cell(r,9,'中野指示（10/20）：残り7億円程度を今期計上。FY2028以降は戸髙さん版の各10億円').font=SM
r+=1; R['per']=r; p.cell(r,2,'私募ファンド 粗利率').font=BK
for j in range(3): inp(p,r,4+j,0.05,PCT)
p.cell(r,9,'戸髙さん版と同じ5%。2026年9月の3号・4号の実績は12.5%（75百万円／600百万円）').font=SM
r+=2; bar(p,r,'【6】販管費・営業外・税',8)
r+=1; hdr(p,r,['項目','','FY2027','FY2028','FY2029'])
rows6=[('pr','人件費 前年比',(0.0,0.03,0.03),PCT,'昇給3%（FY2027はベースのまま）'),
       ('orr','その他販管費 前年比',(0.0,0.0,0.0),PCT,'撤退後の固定費水準を維持'),
       ('noe','営業外費用（支払利息等）',(12000000,10000000,8000000),YEN,'借入返済に合わせて逓減'),
       ('tr','法人実効税率',(0.34,0.34,0.34),PCT,'繰越欠損金を使い切った後の所得に適用'),
       ('kin','法人住民税 均等割',(0,70000,70000),YEN,'概算')]
for k,lab,vals,fmt,nt in rows6:
    r+=1; R[k]=r; p.cell(r,2,lab).font=BK
    for j,v in enumerate(vals): inp(p,r,4+j,v,fmt)
    p.cell(r,9,nt).font=SM
r+=2; bar(p,r,'【7】資金・在庫（年次の簡易資金繰り）',8)
r+=1; hdr(p,r,['項目','','FY2027','FY2028','FY2029'])
r+=1; R['cash0']=r; p.cell(r,2,'期首 現預金（2026/09末）').font=BK; inp(p,r,3,30000000)
p.cell(r,9,'★みずほ銀行への返済後。中野指示（8月）の30百万円。着地値に差し替え').font=RD
r+=1; R['dep']=r; p.cell(r,2,'減価償却費（年）').font=BK; inp(p,r,3,3637873*12)
p.cell(r,9,'試算表 2026/03以降の月額3,637,873円×12。非資金費用').font=SM
r+=1; R['rep']=r; p.cell(r,2,'長期借入金 約定返済').font=BK
for j in range(3): inp(p,r,4+j,49000000)
p.cell(r,9,'★試算表 2026/07の約定返済4,093,000円×12≒49百万円。返済予定表で差し替え').font=RD
r+=1; R['buy']=r; p.cell(r,2,'ワイン仕入（プランD）').font=BK
for j in range(3): inp(p,r,4+j,400000000)
p.cell(r,9,'割当維持のための最低水準。プランEは私募の原価分を上乗せ').font=SM
r+=2; bar(p,r,'【8】部門比率　出典：戸髙さん作成「⑧3年計画_前提【6】」2026/04〜08の部門別実績',8)
r+=1; hdr(p,r,['区分']+DEPTS+['合計'])
ratios=[('rs','売上（横ばい分）',[0,79647537,64631058,68288405]),
        ('rg','売上総利益（横ばい分）',[0,19991541,15566548,60509067]),
        ('rpp','人件費',[13814161,5595031,10625755,2858053]),
        ('rop','その他販管費（人件費以外）',[31983440-13814161,18713767-5595031,34297726-10625755,51437067-2858053])]
for k,lab,v in ratios:
    r+=1; R[k]=r; p.cell(r,2,lab).font=BK
    t=sum(v)
    for j,x in enumerate(v): inp(p,r,3+j,x/t,PCT)
    fml(p,r,7,f'=SUM(C{r}:F{r})',PCT,bold=True)
p.cell(r+1,2,'※本部の粗利（原価調整▲0.7百万円）は0とし、残り3部門で按分（戸髙さん版と同じ）。差額売上・私募はワインテック、上乗せ案件は【4】の計上部門。').font=SM
Q=lambda k,c='C': f"'③前提'!${c}${R[k]}"
YC={0:'D',1:'E',2:'F'}

# ======================= ④FY2026着地 =======================
z=wb.create_sheet('④FY2026着地')
for col,w in zip('ABCDEF',[3,46,20,20,20,48]): z.column_dimensions[col].width=w
z['B1']='FY2026（2026年9月期）着地見込み'; z['B1'].font=Font(name=F,bold=True,size=15)
z['B2']='試算表の10か月実績に、8-9月の想定と9月末までの計上を積み上げ。2026年10月20日の中野指示ベース。単位：円'; z['B2'].font=SM
bar(z,4,'【1】損益',5); hdr(z,5,['科目','10か月実績','8月・9月','通期 着地','内容'])
pl=[('売上高',f'={Q("s10")}',f'={Q("s89")}+{Q("pfs")}+{Q("fee")}','8-9月：既存115＋私募＋経営指導料の前倒し'),
    ('売上総利益',f'={Q("g10")}',f'={Q("p89")}+{Q("pfs")}*{Q("pfr")}+{Q("fee")}','8-9月の既存事業はトントン（粗利＝販管費）'),
    ('販管費',f'={Q("p10")}-{Q("adj")}',f'={Q("p89")}','10か月実績から7月末までの戻し8百万円を控除'),
    ('営業利益',None,None,''),
    ('営業外収益',f'={Q("ni10")}',0,''),
    ('営業外費用',f'={Q("ne10")}',f'={Q("ne89")}',''),
    ('経常利益',None,None,''),
    ('特別損失',0,0,'和解金'),
    ('税引前当期純利益',None,None,'')]
Z={}
for i,(lab,a,b2,nt) in enumerate(pl):
    r=6+i; Z[lab]=r; bold=lab in ('売上総利益','営業利益','経常利益','税引前当期純利益')
    z.cell(r,2,lab).font=SB if bold else BK
    if a is not None: fml(z,r,3,a,bold=bold)
    if b2 is not None: fml(z,r,4,b2,bold=bold)
    fml(z,r,5,f'=C{r}+D{r}',bold=True,fill=OR_ if bold else TF)
    z.cell(r,6,nt).font=SM
for col in 'CD':
    z[f'{col}{Z["営業利益"]}']=f'={col}{Z["売上総利益"]}-{col}{Z["販管費"]}'
    z[f'{col}{Z["経常利益"]}']=f'={col}{Z["営業利益"]}+{col}{Z["営業外収益"]}-{col}{Z["営業外費用"]}'
    z[f'{col}{Z["税引前当期純利益"]}']=f'={col}{Z["経常利益"]}-{col}{Z["特別損失"]}'
    for k in ('営業利益','経常利益','税引前当期純利益'):
        z[f'{col}{Z[k]}'].number_format=YEN; z[f'{col}{Z[k]}'].font=SB
z[f'C{Z["特別損失"]}']=f'={Q("sl")}'; z[f'C{Z["特別損失"]}'].number_format=YEN
r=Z['税引前当期純利益']+2
z.cell(r,2,'既存事業 売上（私募・経営指導料を除く）').font=SB; Z['ex26']=r
fml(z,r,5,f'={Q("s10")}+{Q("s89")}',bold=True,fill=TF)
z.cell(r,6,'FY2027の2期平均の算定に使用。私募と経営指導料は一過性・別建てのため除外').font=SM
r+=1; z.cell(r,2,'繰越欠損金 FY2026末残高').font=SB; Z['tl']=r
fml(z,r,5,f'={Q("tl25")}+MAX(0,-E{Z["税引前当期純利益"]})',bold=True,fill=OR_)
r+=1; z.cell(r,2,'商品在庫 2026/09末').font=SB; Z['inv']=r
fml(z,r,5,f'={Q("inv7")}+{Q("buy89")}-({Q("s89")}-{Q("p89")})-{Q("pfs")}*(1-{Q("pfr")})',bold=True,fill=OR_)
z.cell(r,6,'7月末＋8-9月仕入−既存事業の原価−私募の原価').font=SM
r+=2; bar(z,r,'【2】10/1版との違い',5)
for t in ['10/1版では、私募を「売上計上300百万円（粗利45）＋現物出資300百万円（粗利30）」、前倒しを「M&A仲介20＋コンサル料10」として',
          '営業利益＋1.0百万円としていました。10/20の指示（私募は2億数千万を前期計上、前倒しは経営指導料30百万円）に統一したため、',
          '私募の粗利が75→10百万円となり、営業利益は▲64.0百万円になります。私募の前期計上額と粗利率が確定したら③前提【1】を差し替えてください。']:
    r+=1; z.cell(r,2,t).font=RD
Zr=lambda k: f"'④FY2026着地'!$E${Z[k]}"

# ======================= ②シナリオ比較（計算エンジン） =======================
e=wb.create_sheet('②シナリオ比較')
e.column_dimensions['A'].width=3; e.column_dimensions['B'].width=34
for j in range(9): e.column_dimensions[CL(3+j)].width=15
e.column_dimensions['L'].width=40
e['B1']='3か年シナリオ比較（横ばい実力値／プランD／プランE）'; e['B1'].font=Font(name=F,bold=True,size=15)
e['B2']='3シナリオを同時に計算。前提はすべて③前提。単位：円（税別）'; e['B2'].font=SM
for k,(lab,c0) in enumerate([('横ばい実力値（参考）',3),('プランD　メイン',6),('プランE　上振れ',9)]):
    e.merge_cells(start_row=4,start_column=c0,end_row=4,end_column=c0+2)
    x=e.cell(4,c0,lab); x.font=HD; x.fill=HF; x.alignment=Alignment(horizontal='center')
    for j,y in enumerate(YRS):
        x=e.cell(5,c0+j,y); x.font=SB; x.fill=SF; x.alignment=Alignment(horizontal='center')
e.cell(5,2,'科目').font=SB; e.cell(5,2).fill=SF
labels=['既存事業 売上','　うち 差額売上','私募ファンド','上乗せ案件','売上高 合計','売上総利益','　売上総利益率',
        '人件費','その他販管費','販管費 合計','営業利益','営業外費用','経常利益',
        '繰越欠損金 期首','繰越欠損金 当期使用','繰越欠損金 期末','法人税等','当期純利益','売上原価（参考）']
E={lab:6+i for i,lab in enumerate(labels)}
for lab,r in E.items():
    e.cell(r,2,lab).font=SB if lab in ('売上高 合計','売上総利益','営業利益','経常利益','当期純利益') else BK
for s in range(3):
    for j in range(3):
        c=3+s*3+j; L=CL(c); Lp=CL(c-1); yc=YC[j]
        def put(lab,f,fmt=YEN):
            bold=lab in ('売上高 合計','売上総利益','営業利益','経常利益','当期純利益')
            fml(e,E[lab],c,f,fmt,bold=bold,fill=OR_ if lab in ('営業利益','経常利益') else (TF if bold else None))
        if s==0: put('既存事業 売上',f'={Q("bs")}')
        elif j==0: put('既存事業 売上',f'=({Q("s25")}+{Zr("ex26")})/2')
        else: put('既存事業 売上',f'={Lp}{E["既存事業 売上"]}*(1+{Q("g",yc)})')
        put('　うち 差額売上',f'={L}{E["既存事業 売上"]}-{Q("bs")}')
        put('私募ファンド',f'={Q("pe",yc)}' if s==2 else 0)
        put('上乗せ案件',f'={Q("at",yc)}' if s>0 else 0)
        put('売上高 合計',f'={L}{E["既存事業 売上"]}+{L}{E["私募ファンド"]}+{L}{E["上乗せ案件"]}')
        put('売上総利益',f'={Q("bg")}+{L}{E["　うち 差額売上"]}*{Q("dgr")}+{L}{E["私募ファンド"]}*{Q("per",yc)}+{L}{E["上乗せ案件"]}')
        put('　売上総利益率',f'={L}{E["売上総利益"]}/{L}{E["売上高 合計"]}',PCT)
        if j==0:
            put('人件費',f'={Q("bpp")}*(1+{Q("pr",yc)})')
            put('その他販管費',f'=({Q("bp")}-{Q("bpp")})*(1+{Q("orr",yc)})')
        else:
            put('人件費',f'={Lp}{E["人件費"]}*(1+{Q("pr",yc)})')
            put('その他販管費',f'={Lp}{E["その他販管費"]}*(1+{Q("orr",yc)})')
        put('販管費 合計',f'={L}{E["人件費"]}+{L}{E["その他販管費"]}')
        put('営業利益',f'={L}{E["売上総利益"]}-{L}{E["販管費 合計"]}')
        put('営業外費用',f'={Q("noe",yc)}')
        put('経常利益',f'={L}{E["営業利益"]}-{L}{E["営業外費用"]}')
        put('繰越欠損金 期首',f'={Zr("tl")}' if j==0 else f'={Lp}{E["繰越欠損金 期末"]}')
        put('繰越欠損金 当期使用',f'=MIN({L}{E["繰越欠損金 期首"]},MAX(0,{L}{E["経常利益"]}))')
        put('繰越欠損金 期末',f'={L}{E["繰越欠損金 期首"]}-{L}{E["繰越欠損金 当期使用"]}+MAX(0,-{L}{E["経常利益"]})')
        put('法人税等',f'=MAX(0,{L}{E["経常利益"]}-{L}{E["繰越欠損金 当期使用"]})*{Q("tr",yc)}+{Q("kin",yc)}')
        put('当期純利益',f'={L}{E["経常利益"]}-{L}{E["法人税等"]}')
        put('売上原価（参考）',f'={L}{E["売上高 合計"]}-{L}{E["売上総利益"]}')
r=E['売上原価（参考）']+2
for t in ['※横ばい実力値は上乗せ案件を含めない参考値（2026/04-07の実績をそのまま延ばした場合）。',
          '※プランDの既存事業：FY2027は前期・前々期の売上平均。FY2028以降は「直前2期平均」ではなく、FY2027水準からの成長率で置いています。',
          '　（実績の弱いFY2026が平均に入ると、計画が年々目減りするため）',
          '※プランEはDに私募ファンドを上乗せ。私募の粗利率は③前提【5】。']:
    e.cell(r,2,t).font=RD; r+=1
EC=lambda lab,s,j: f"'②シナリオ比較'!${CL(3+s*3+j)}${E[lab]}"

# ======================= ⑤部門別損益（プランD・年次） =======================
d=wb.create_sheet('⑤部門別損益')
d.column_dimensions['A'].width=3; d.column_dimensions['B'].width=34
for j in range(5): d.column_dimensions[CL(3+j)].width=16
d.column_dimensions['H'].width=44
d['B1']='部門別損益（プランD・年次）'; d['B1'].font=Font(name=F,bold=True,size=15)
d['B2']='部門比率は③前提【8】、上乗せ案件の計上部門は③前提【4】。単位：円'; d['B2'].font=SM
DR={}; r=3
dl=['売上（横ばい分）','差額売上','上乗せ案件','売上 計','粗利（横ばい分）','差額売上の粗利','上乗せ案件の粗利','粗利 計',
    '人件費','その他販管費','販管費 計','部門利益（配賦前）','本部費の配賦（粗利比）','部門利益（配賦後）']
for j,y in enumerate(YRS):
    yc=YC[j]; r+=2; bar(d,r,f'【{y}】',6); r+=1; hdr(d,r,['科目']+DEPTS+['合計'])
    DR[y]={}
    for lab in dl:
        r+=1; DR[y][lab]=r
        bold=lab in ('売上 計','粗利 計','販管費 計','部門利益（配賦前）','部門利益（配賦後）')
        d.cell(r,2,lab).font=SB if bold else BK
        for k,dep in enumerate(DEPTS):
            c=3+k; Lr=CL(c)
            ratio=lambda key: f"'③前提'!{Lr}${R[key]}"
            sumif=f"SUMIF('③前提'!$G${R['a0']}:$G${R['a1']},\"{dep}\",'③前提'!{yc}${R['a0']}:{yc}${R['a1']})"
            if lab=='売上（横ばい分）': f=f'={Q("bs")}*{ratio("rs")}'
            elif lab=='差額売上': f=f'={EC("　うち 差額売上",1,j)}' if dep=='ワインテック' else '=0'
            elif lab=='上乗せ案件': f='='+sumif
            elif lab=='売上 計': f=f'=SUM({Lr}{DR[y]["売上（横ばい分）"]}:{Lr}{DR[y]["上乗せ案件"]})'
            elif lab=='粗利（横ばい分）': f=f'={Q("bg")}*{ratio("rg")}'
            elif lab=='差額売上の粗利': f=f'={Lr}{DR[y]["差額売上"]}*{Q("dgr")}'
            elif lab=='上乗せ案件の粗利': f=f'={Lr}{DR[y]["上乗せ案件"]}'
            elif lab=='粗利 計': f=f'=SUM({Lr}{DR[y]["粗利（横ばい分）"]}:{Lr}{DR[y]["上乗せ案件の粗利"]})'
            elif lab=='人件費': f=f'={EC("人件費",1,j)}*{ratio("rpp")}'
            elif lab=='その他販管費': f=f'={EC("その他販管費",1,j)}*{ratio("rop")}'
            elif lab=='販管費 計': f=f'={Lr}{DR[y]["人件費"]}+{Lr}{DR[y]["その他販管費"]}'
            elif lab=='部門利益（配賦前）': f=f'={Lr}{DR[y]["粗利 計"]}-{Lr}{DR[y]["販管費 計"]}'
            elif lab=='本部費の配賦（粗利比）':
                gsum=f'SUM($D{DR[y]["粗利 計"]}:$F{DR[y]["粗利 計"]})'
                f=(f'=$C{DR[y]["販管費 計"]}' if dep=='本部'
                   else f'=-$C{DR[y]["販管費 計"]}*{Lr}{DR[y]["粗利 計"]}/{gsum}')
            elif lab=='部門利益（配賦後）': f=f'={Lr}{DR[y]["部門利益（配賦前）"]}+{Lr}{DR[y]["本部費の配賦（粗利比）"]}'
            fml(d,r,c,f,bold=bold,fill=OR_ if '部門利益' in lab else (TF if bold else None))
        fml(d,r,7,f'=SUM(C{r}:F{r})',bold=True,fill=TF)
    r+=1; d.cell(r,2,'チェック：部門合計−全社営業利益').font=SM
    fml(d,r,7,f'=G{DR[y]["部門利益（配賦前）"]}-{EC("営業利益",1,j)}')
r+=2
for t in ['※主表は「部門利益（配賦前）」。本部は経営指導料等の上乗せ案件で自らの販管費を賄っており、本部単体で黒字です。',
          '※「配賦後」は参考。本部の販管費を事業3部門に粗利比で配賦（本部の収益は本部に残す）。売上比だとEC・酒販店卸に過大に乗るため粗利比としています。']:
    d.cell(r,2,t).font=RD; r+=1

# ======================= ⑥部門別月次 FY2027 =======================
mo=wb.create_sheet('⑥部門別月次_FY2027')
mo.column_dimensions['A'].width=3; mo.column_dimensions['B'].width=30
for j in range(13): mo.column_dimensions[CL(3+j)].width=13
mo['B1']='部門別月次予算 FY2027（プランD）'; mo['B1'].font=Font(name=F,bold=True,size=15)
mo['B2']='経常的な項目は12か月均等。上乗せ案件は③前提【4】の計上月（0＝按分）。単位：円'; mo['B2'].font=SM
MON=['10月','11月','12月','1月','2月','3月','4月','5月','6月','7月','8月','9月']
r=3; y='FY2027'; prev={}
for k,dep in enumerate(DEPTS+['全社']):
    r+=2; bar(mo,r,f'【{dep}】',14); r+=1; hdr(mo,r,['科目']+MON+['通期'])
    rows={}
    for lab in ['売上','粗利','販管費','部門利益（配賦前）']:
        r+=1; rows[lab]=r; mo.cell(r,2,lab).font=SB if '利益' in lab else BK
        for m in range(12):
            c=3+m
            if dep=='全社':
                f='='+'+'.join(f'{CL(c)}{prev[d2][lab]}' for d2 in DEPTS)
            else:
                Ld=CL(3+k)
                adv_m='+'.join(f"IF('③前提'!$G${ar}=\"{dep}\",IF('③前提'!$H${ar}=0,'③前提'!$D${ar}/12,IF('③前提'!$H${ar}={m+1},'③前提'!$D${ar},0)),0)"
                               for ar in range(R['a0'],R['a1']+1))
                if lab=='売上':
                    f=f"=('⑤部門別損益'!{Ld}{DR[y]['売上（横ばい分）']}+'⑤部門別損益'!{Ld}{DR[y]['差額売上']})/12+{adv_m}"
                elif lab=='粗利':
                    f=f"=('⑤部門別損益'!{Ld}{DR[y]['粗利（横ばい分）']}+'⑤部門別損益'!{Ld}{DR[y]['差額売上の粗利']})/12+{adv_m}"
                elif lab=='販管費':
                    f=f"='⑤部門別損益'!{Ld}{DR[y]['販管費 計']}/12"
                else:
                    f=f'={CL(c)}{rows["粗利"]}-{CL(c)}{rows["販管費"]}'
            fml(mo,r,c,f,bold='利益' in lab,fill=OR_ if '利益' in lab else None)
        fml(mo,r,15,f'=SUM(C{r}:N{r})',bold=True,fill=TF)
    if dep!='全社':
        prev[dep]=rows
mo.freeze_panes='C4'

# ======================= ⑦資金繰り・在庫（年次） =======================
cfw=wb.create_sheet('⑦資金繰り・在庫')
cfw.column_dimensions['A'].width=3; cfw.column_dimensions['B'].width=34
for j in range(6): cfw.column_dimensions[CL(3+j)].width=16
cfw.column_dimensions['I'].width=40
cfw['B1']='年次 資金繰り・在庫（簡易版）'; cfw['B1'].font=Font(name=F,bold=True,size=15)
cfw['B2']='利益＋減価償却−在庫増加−税−約定返済。売掛・買掛・消費税の期ズレは含みません。単位：円'; cfw['B2'].font=SM
for k,(lab,c0) in enumerate([('プランD',3),('プランE',6)]):
    cfw.merge_cells(start_row=4,start_column=c0,end_row=4,end_column=c0+2)
    x=cfw.cell(4,c0,lab); x.font=HD; x.fill=HF; x.alignment=Alignment(horizontal='center')
    for j,yy in enumerate(YRS):
        x=cfw.cell(5,c0+j,yy); x.font=SB; x.fill=SF; x.alignment=Alignment(horizontal='center')
cl=['在庫 期首','＋仕入','−売上原価','在庫 期末','','現預金 期首','＋経常利益','＋減価償却費','−法人税等','−在庫の増加','−長期借入金 約定返済','現預金 期末']
C={lab:6+i for i,lab in enumerate(cl)}
for lab,r in C.items():
    if lab: cfw.cell(r,2,lab).font=SB if lab in ('在庫 期末','現預金 期末') else BK
for s in range(2):
    sc=s+1
    for j in range(3):
        c=3+s*3+j; L=CL(c); Lp=CL(c-1); yc=YC[j]
        def put(lab,f):
            bold=lab in ('在庫 期末','現預金 期末')
            fml(cfw,C[lab],c,f,bold=bold,fill=OR_ if bold else None)
        put('在庫 期首',f'={Zr("inv")}' if j==0 else f'={Lp}{C["在庫 期末"]}')
        put('＋仕入',f'={Q("buy",yc)}' if s==0 else f'={Q("buy",yc)}+{Q("pe",yc)}*(1-{Q("per",yc)})')
        put('−売上原価',f'=-{EC("売上原価（参考）",sc,j)}')
        put('在庫 期末',f'=SUM({L}{C["在庫 期首"]}:{L}{C["−売上原価"]})')
        put('現預金 期首',f'={Q("cash0")}' if j==0 else f'={Lp}{C["現預金 期末"]}')
        put('＋経常利益',f'={EC("経常利益",sc,j)}')
        put('＋減価償却費',f'={Q("dep")}')
        put('−法人税等',f'=-{EC("法人税等",sc,j)}')
        put('−在庫の増加',f'=-({L}{C["在庫 期末"]}-{L}{C["在庫 期首"]})')
        put('−長期借入金 約定返済',f'=-{Q("rep",yc)}')
        put('現預金 期末',f'=SUM({L}{C["現預金 期首"]}:{L}{C["−長期借入金 約定返済"]})')
r=C['現預金 期末']+2
for t in ['※プランEの仕入は、プランDの仕入に私募ファンドの原価（売上×（1−粗利率））を上乗せ。私募のワインを当期に調達する前提です。',
          '※期首現預金30百万円と約定返済49百万円/年は暫定値。返済予定表・9月末の残高で差し替えてください。',
          '※月次の資金繰りはFY2027のみ別途作成（銀行提出版⑦）。2・3年目は年次で十分と考えます。']:
    cfw.cell(r,2,t).font=RD; r+=1

# ======================= ①3年サマリー =======================
s=wb.create_sheet('①3年サマリー',0)
for col,w in zip('ABCDEFGH',[3,34,18,18,18,18,12,46]): s.column_dimensions[col].width=w
s['B1']='3か年計画 FY2027〜FY2029（プランD）'; s['B1'].font=Font(name=F,bold=True,size=15)
s['B2']='FY2026は試算表10か月実績からの着地見込み。2026年10月20日の中野指示ベース。単位：円（税別）'; s['B2'].font=SM
bar(s,4,'【全社損益】',7)
hdr(s,5,['科目','FY2026\n着地見込','FY2027','FY2028','FY2029','CAGR\n27→29','コメント']); s.row_dimensions[5].height=34
sm=[('売上高','売上高','売上高 合計','私募・経営指導料の前倒しを含む（FY2026）'),
    ('売上総利益','売上総利益','売上総利益',''),
    ('　売上総利益率',None,'　売上総利益率',''),
    ('販管費','販管費','販管費 合計','人件費のみ昇給3%（FY2028〜）'),
    ('営業利益','営業利益','営業利益',''),
    ('営業外費用','営業外費用','営業外費用','借入返済に合わせ逓減'),
    ('経常利益','経常利益','経常利益',''),
    ('法人税等',None,'法人税等','繰越欠損金の使い切り後に課税'),
    ('当期純利益','税引前当期純利益','当期純利益','FY2026は税引前'),
    ('繰越欠損金 期末残高','tl','繰越欠損金 期末','')]
for i,(lab,zk,ek,nt) in enumerate(sm):
    r=6+i; bold=lab in ('売上高','売上総利益','営業利益','経常利益','当期純利益')
    s.cell(r,2,lab).font=SB if bold else BK
    fmt=PCT if '率' in lab else YEN
    if zk=='tl': fml(s,r,3,f'={Zr("tl")}',fmt)
    elif zk and zk in Z: fml(s,r,3,f"='④FY2026着地'!E{Z[zk]}",fmt,bold=bold)
    elif lab=='　売上総利益率': fml(s,r,3,f'=C7/C6',PCT)
    for j in range(3): fml(s,r,4+j,f'={EC(ek,1,j)}',fmt,bold=bold)
    if lab in ('売上高','売上総利益','営業利益','経常利益'):
        fml(s,r,7,f'=IF(D{r}>0,(F{r}/D{r})^(1/2)-1,"")',PCT)
    s.cell(r,8,nt).font=SM
    if lab in ('営業利益','経常利益'):
        for c2 in range(2,8): s.cell(r,c2).fill=OR_
    elif bold:
        for c2 in range(2,8): s.cell(r,c2).fill=TF
r=6+len(sm)+1
bar(s,r,'【部門別】プランD',7); r+=1
hdr(s,r,['部門','','FY2027','FY2028','FY2029','',''])
for blk,lab in [('売上','売上 計'),('粗利','粗利 計'),('部門利益（配賦前）','部門利益（配賦前）')]:
    r+=1; s.cell(r,2,blk).font=SB; s.cell(r,2).fill=GRP
    for c2 in range(3,8): s.cell(r,c2).fill=GRP
    for k,dep in enumerate(DEPTS+['合計']):
        r+=1; s.cell(r,2,'　'+dep).font=BK
        for j,y in enumerate(YRS):
            fml(s,r,4+j,f"='⑤部門別損益'!{CL(3+k)}{DR[y][lab]}",bold=(dep=='合計'))
r+=2; bar(s,r,'【参考】プランE（私募ファンドを上乗せ）と資金',7); r+=1
hdr(s,r,['項目','','FY2027','FY2028','FY2029','',''])
for lab,src in [('プランE 売上高',('売上高 合計',2)),('プランE 経常利益',('経常利益',2)),
                ('プランD 期末現預金',None),('プランE 期末現預金',None)]:
    r+=1; s.cell(r,2,lab).font=BK
    for j in range(3):
        if src: f=f'={EC(src[0],src[1],j)}'
        else:
            col=CL(3+j) if 'D' in lab else CL(6+j)
            f=f"='⑦資金繰り・在庫'!{col}{C['現預金 期末']}"
        fml(s,r,4+j,f)
r+=2; bar(s,r,'【前提と要確認】',7)
for t in ['1. FY2026の私募ファンド：前期計上2億数千万（暫定200百万円・粗利率5%）。確定値で③前提【1】を差し替え。',
          '2. 経営指導料（間接グループ5社）：FY2027は80百万円（本来110百万円超のうち30百万円を前期に前倒し）、FY2028以降は110百万円。',
          '3. M&A仲介20百万円はFY2027のみ。FY2028以降は案件化が未確定のため0。',
          '4. 私募ファンド今期7億円程度・FY2028以降10億円はプランEのみに計上（メインのプランDには含めない）。',
          '5. ベースは2026/04-07の試算表実績（事業計画シートの4-6月ではなく、実績4か月）。',
          '6. 販管費は人件費のみ昇給3%、他は横ばい。営業外費用は12→10→8百万円に逓減。',
          '7. 期首現預金30百万円・約定返済49百万円/年は暫定。返済予定表で差し替え。']:
    r+=1; c=s.cell(r,2,t); c.font=Font(name=F,size=10)
    s.merge_cells(start_row=r,start_column=2,end_row=r,end_column=8)

for ws in wb: ws.sheet_view.showGridLines=False
wb.save('WineBank_3か年計画_FY2027-2029.xlsx'); print('saved')
