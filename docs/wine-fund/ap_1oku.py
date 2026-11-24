import json,sys,re,openpyxl
from openpyxl.styles import Font,PatternFill,Alignment
rows=json.load(open(sys.argv[1])); out=sys.argv[2]
K=0.951612903225807*0.755
def v4(v):
    m=re.match(r'(\d{4})',str(v)); return int(m.group(1)) if m else None
A=[];B=[]
for x in rows:
    try: cost=float(x['cost']); ins=float(x['ins']); p2=float(x['sell'])
    except: continue
    v=v4(x['vint'])
    if cost<=0 or ins<=0 or p2<=0 or not v or v>2016: continue
    est=ins/0.88/1.1*K
    r=dict(code=x['code'],name=x['name'],v=v,q=int(x['q']),p2=p2,ins=ins,est=est)
    if 2.1<=ins/cost<=2.4: r['grp']='B 楽天確認要'; B.append(r)
    elif p2/est<=0.6: r['grp']='A 市場価格あり'; A.append(r)
A.sort(key=lambda r:r['p2']/r['est'])
B.sort(key=lambda r:(-(r['p2']>=20000), r['v'], -r['p2']))   # 2万円以上・古いヴィンテージを優先
sel=list(A); estA=sum(r['est']*r['q'] for r in A)*1.1
need=1.0e8-estA; acc=0
for r in B:
    if acc>=need/1.35: break          # P5卸値≒P2原価×1.35と仮定して、確認対象をここまでに絞る
    sel.append(r); acc+=r['p2']*r['q']
wb=openpyxl.Workbook(); ws=wb.active; ws.title='1億候補'
ws.append(['P5への卸値 税込1億円の候補（アピシウス在庫・VT2016以前）']); ws['A1'].font=Font(bold=True,size=13)
ws.append(['卸値（評価額）＝楽天最安値（税込・当社/関係者の出品除く）÷1.1×0.9516×0.755。黄色欄に楽天価格を入れると確定。Aは保険金額からの推計値を仮置き、Bは未確認。WB粗利＝卸値−P2原価（WineBankがP2に売った価格）。'])
ws.append([])
cols=['区分','商品コード','銘柄','VT','本数','P2原価(税抜/本)','楽天最安値(税込)←記入','卸値(税抜/本)','卸値合計(税込)','P2原価合計(税抜)','WB粗利(税抜)','原価率','推計卸値(参考/本)','採否']
ws.append(cols)
for c in ws[4]: c.font=Font(bold=True,color='FFFFFF'); c.fill=PatternFill('solid',fgColor='2B2622'); c.alignment=Alignment(wrap_text=True)
yel=PatternFill('solid',fgColor='FFF2CC')
for i,r in enumerate(sel):
    n=5+i
    ws.append([r['grp'],r['code'],r['name'],r['v'],r['q'],r['p2'],None,
      f'=IF(G{n}="",IF(LEFT(A{n},1)="A",M{n},""),ROUND(G{n}/1.1*0.9516129*0.755,0))',
      f'=IF(H{n}="","",ROUND(H{n}*E{n}*1.1,0))', f'=F{n}*E{n}', f'=IF(H{n}="","",(H{n}-F{n})*E{n})', f'=IF(H{n}="","",F{n}/H{n})',
      round(r['est']) if r['grp'].startswith('A') else None, None])
    ws[f'G{n}'].fill=yel; ws[f'L{n}'].number_format='0.0%'
    for col in 'FHIJKM': ws[f'{col}{n}'].number_format='#,##0'
last=4+len(sel)
ws.append([]); ws.append(['合計','','','',f'=SUM(E5:E{last})','','','',f'=SUM(I5:I{last})',f'=SUM(J5:J{last})',f'=SUM(K5:K{last})',f'=IF(SUM(I5:I{last})=0,"",J{last+2}/(I{last+2}/1.1))'])
for col,w in zip('ABCDEFGHIJKLMN',[13,16,56,6,6,12,15,12,14,14,12,8,12,7]): ws.column_dimensions[col].width=w
ws.freeze_panes='D5'; wb.save(out)
p2A=sum(r['p2']*r['q'] for r in A)
print('A',len(A),sum(r['q'] for r in A),'推計卸値税込',round(estA/1e6,1),'P2原価',round(p2A/1e6,1),'WB粗利',round((estA/1.1-p2A)/1e6,1))
print('B確認対象',len(sel)-len(A),sum(r['q'] for r in sel[len(A):]),'P2原価',round(acc/1e6,1))
