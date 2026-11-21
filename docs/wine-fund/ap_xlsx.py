import json,sys,re,openpyxl
from openpyxl.styles import Font,PatternFill,Alignment
rows=json.load(open(sys.argv[1])); out=sys.argv[2]
K=0.951612903225807*0.755
def v4(v):
    m=re.match(r'(\d{4})',str(v)); return int(m.group(1)) if m else None
A=[];B=[]
for x in rows:
    try: cost=float(x['cost']); ins=float(x['ins']); sell=float(x['sell'])
    except: continue
    v=v4(x['vint'])
    if cost<=0 or ins<=0 or not v or v>2016: continue
    mult=ins/cost
    est_ev=ins/0.88/1.1*K
    r=dict(code=x['code'],name=x['name'],v=v,q=int(x['q']),cost=cost,sell=sell,ins=ins,est=est_ev,rate=cost/est_ev)
    if 2.1<=mult<=2.4: B.append(r)       # 保険金額＝原価×約2.24（市場価格の裏付けなし）
    elif r['rate']<=0.45: A.append(r)
A.sort(key=lambda r:r['rate']); B.sort(key=lambda r:-r['ins']*r['q'])
wb=openpyxl.Workbook(); hdr=Font(bold=True,color='FFFFFF'); fill=PatternFill('solid',fgColor='2B2622'); yel=PatternFill('solid',fgColor='FFF2CC')
def sheet(ws,data,title,note):
    ws.append([title]); ws['A1'].font=Font(bold=True,size=13)
    ws.append([note]); ws.append([])
    cols=['商品コード','銘柄','VT','本数','P2原価(税抜)','P2→WB売価(税抜)','保険金額(参考)','推計評価額(税抜)','推計原価率','楽天最安値(税込)←記入','評価額(税抜)','評価額合計(税抜)','原価率(P2原価)','原価率(売価)','採否']
    ws.append(cols)
    for c in ws[4]: c.font=hdr; c.fill=fill; c.alignment=Alignment(wrap_text=True)
    for i,r in enumerate(data):
        n=5+i
        ws.append([r['code'],r['name'],r['v'],r['q'],r['cost'],r['sell'],r['ins'],round(r['est']),r['rate'],None,
          f'=IF(J{n}="","",ROUND(J{n}/1.1*0.9516129*0.755,0))',f'=IF(K{n}="","",K{n}*D{n})',f'=IF(K{n}="","",E{n}/K{n})',f'=IF(K{n}="","",F{n}/K{n})',None])
        ws[f'J{n}'].fill=yel
        for col in 'IMN': ws[f'{col}{n}'].number_format='0.0%'
        for col in 'EFGHKL': ws[f'{col}{n}'].number_format='#,##0'
    last=4+len(data)
    ws.append([]); ws.append(['合計','', '', f'=SUM(D5:D{last})', f'=SUMPRODUCT(D5:D{last},E5:E{last})', f'=SUMPRODUCT(D5:D{last},F5:F{last})','', f'=SUMPRODUCT(D5:D{last},H5:H{last})','', '', '', f'=SUM(L5:L{last})'])
    for col,w in zip('ABCDEFGHIJKLMNO',[16,58,6,6,12,13,12,13,9,15,12,14,11,11,8]): ws.column_dimensions[col].width=w
    ws.freeze_panes='C5'
ws=wb.active; ws.title='A_市場価格あり'
sheet(ws,A,'A：保険金額に市場価格の裏付けがある銘柄（VT2016以前・推計原価率45%以下）','推計評価額＝保険金額÷0.88（楽天比の中央値）÷1.1×0.718。楽天最安値を記入すると確定値の評価額・原価率に置き換わります。')
sheet(wb.create_sheet('B_要楽天確認'),B,'B：保険金額が原価×約2.24で市場価格の裏付けがない銘柄（VT2016以前）','保険金額の大きい順。楽天最安値（当社・関係者の出品を除く）を記入し、原価率の低いものから採用してください。推計値は参考になりません。')
wb.save(out)
sa=sum(r['est']*r['q'] for r in A); ca=sum(r['cost']*r['q'] for r in A)
print('A',len(A),sum(r['q'] for r in A),round(sa*1.1/1e6,1),round(ca/1e6,1),f"{ca/sa:.1%}")
print('B',len(B),sum(r['q'] for r in B),'原価計',round(sum(r['cost']*r['q'] for r in B)/1e6,1),'保険計',round(sum(r['ins']*r['q'] for r in B)/1e6,1))
