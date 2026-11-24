import json,sys,collections,openpyxl
from openpyxl.styles import Font,PatternFill,Alignment
c=json.load(open(sys.argv[1])); out=sys.argv[2]; TOT=1.0e8
tgt=[('シャンパーニュ',0.06,1.05),('ボルドー',0.38,0.95),('ブルゴーニュ',0.52,0.95),('その他',0.04,0.95)]
def val(x): return x['price']*x['q']*1.1
key=lambda x:(x['q']<2, x['src'].startswith('保険'), x['rate'])
sel=[]; tot=collections.Counter()
for g,share,mx in tgt:
    xs=sorted([x for x in c if x['reg']==g and x['rate']<=mx],key=key)
    for x in xs:
        if tot[g]>=TOT*share: break
        sel.append(x); tot[g]+=val(x)
s=sum(tot.values())
rest=sorted([x for x in c if x not in sel and x['rate']<=0.95],key=key)
for x in rest:
    if s>=TOT: break
    sel.append(x); tot[x['reg']]+=val(x); s+=val(x)
order={'ブルゴーニュ':0,'ボルドー':1,'シャンパーニュ':2,'その他':3}
sel.sort(key=lambda x:(order[x['reg']],x['name']))
wb=openpyxl.Workbook(); ws=wb.active; ws.title='P5卸1億（案）'
ws.append(['P5への卸値 税込1億円 選定案（アピシウス在庫・P2）']); ws['A1'].font=Font(bold=True,size=13)
ws.append(['卸値＝楽天最安値（税込）÷1.1×0.9516×0.755（評価額）。価格根拠が「他VT」「保険金額から推計」の行は、楽天で同一ヴィンテージの最安値を確認し黄色欄に入力してください（入力すると卸値が置き換わります）。'])
ws.append([])
cols=['地域','商品コード','銘柄','VT','本数','P2原価(税抜/本)','価格根拠','参照楽天価格(税込/本)','楽天最安値(税込)←確認','卸値(税抜/本)','卸値合計(税込)','P2原価合計(税抜)','WB粗利(税抜)','原価率']
ws.append(cols)
for cc in ws[4]: cc.font=Font(bold=True,color='FFFFFF'); cc.fill=PatternFill('solid',fgColor='2B2622'); cc.alignment=Alignment(wrap_text=True)
yel=PatternFill('solid',fgColor='FFF2CC')
for i,x in enumerate(sel):
    n=5+i
    ws.append([x['reg'],x['code'],x['name'],x['v'],x['q'],x['p2'],x['src'],round(x['rk']),None,
      f'=ROUND(IF(I{n}="",H{n},I{n})/1.1*0.9516129*0.755,0)',f'=ROUND(J{n}*E{n}*1.1,0)',f'=F{n}*E{n}',f'=(J{n}-F{n})*E{n}',f'=F{n}/J{n}'])
    ws[f'I{n}'].fill=yel; ws[f'N{n}'].number_format='0.0%'
    for col in 'FHJKLM': ws[f'{col}{n}'].number_format='#,##0'
last=4+len(sel); t=last+2
ws.append([]); ws.append(['合計','','','',f'=SUM(E5:E{last})','','','','','',f'=SUM(K5:K{last})',f'=SUM(L5:L{last})',f'=SUM(M5:M{last})',f'=L{t}/(K{t}/1.1)'])
ws[f'N{t}'].number_format='0.0%'
for col in 'KLM': ws[f'{col}{t}'].number_format='#,##0'
for col,w in zip('ABCDEFGHIJKLMN',[11,16,56,6,6,12,20,13,14,11,13,13,12,8]): ws.column_dimensions[col].width=w
ws.freeze_panes='D5'
s2=wb.create_sheet('地域別')
s2.append(['地域','行数','本数','1本のみの行','卸値合計(税込)','P2原価(税抜)','WB粗利(税抜)','原価率'])
for g in order:
    xs=[x for x in sel if x['reg']==g]
    if not xs: continue
    pr=sum(x['price']*x['q'] for x in xs); p2=sum(x['p2']*x['q'] for x in xs)
    s2.append([g,len(xs),sum(x['q'] for x in xs),sum(1 for x in xs if x['q']==1),round(pr*1.1),round(p2),round(pr-p2),round(p2/pr,3)])
wb.save(out)
pr=sum(x['price']*x['q'] for x in sel); p2=sum(x['p2']*x['q'] for x in sel)
print('行',len(sel),'本',sum(x['q'] for x in sel),'卸値税込',round(pr*1.1/1e6,1),'P2原価',round(p2/1e6,1),'WB粗利',round((pr-p2)/1e6,1),f'原価率{p2/pr:.1%}','1本行',sum(1 for x in sel if x['q']==1))
for r in s2.iter_rows(min_row=2,values_only=True): print(r)
print(collections.Counter('同一' if '同一' in x['src'] else ('他VT' if '他VT' in x['src'] else '保険') for x in sel))
vt=collections.Counter((x['v']//5)*5 for x in sel); print(sorted(vt.items()))
