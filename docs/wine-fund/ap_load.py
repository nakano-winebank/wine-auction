import openpyxl,sys,re,statistics as st
nk=lambda t: re.sub(r'[^a-z0-9]','',str(t).lower())
wb=openpyxl.load_workbook(sys.argv[1],data_only=True,read_only=True)
def sheet(name,cols):
    out={}
    for r in wb[name].iter_rows(min_row=3,values_only=True):
        code=r[3]
        if not code: continue
        out[str(code).strip()]=r
    return out
names=wb.sheetnames
cur=sheet(names[0],None); old=sheet('【過去版】WINETECH棚卸明細(202503)',None); ins=sheet('WINETECH棚卸明細(202503) 保険金額計算用',None)
rows=[]
for code,r in cur.items():
    q=r[7]; 
    if not isinstance(q,(int,float)) or q<=0: continue
    o=old.get(code); i=ins.get(code)
    rows.append(dict(code=code,dept=r[1],name=r[5] or r[4],vint=str(r[10]).strip(),sell=r[6],q=q,cost=(o[6] if o else None),ins=(i[6] if i else None)))
print(len(rows), sum(x['q'] for x in rows))
print('cost total',sum((x['cost'] or 0)*x['q'] for x in rows), 'sell total', sum((x['sell'] or 0)*x['q'] for x in rows), 'ins total', sum((x['ins'] or 0)*x['q'] for x in rows))
import collections; print(collections.Counter(str(x['dept']) for x in rows).most_common(12))
# calibration vs P2 price sheet
wb2=openpyxl.load_workbook(sys.argv[2],data_only=True,read_only=True)
rk={}
for n in ['P2 2025-10 (20261027Rev.)','P2 202509追加分','P2 2025-09']:
    for r in wb2[n].iter_rows(min_row=12,values_only=True):
        nm,p=r[32],r[54]
        if nm and isinstance(p,(int,float)) and p>0: rk.setdefault(nk(nm),p)
m=[(x,rk[nk(x['name'])]) for x in rows if nk(x['name']) in rk and x['ins']]
print('matched',len(m))
rat=[x['ins']/p for x,p in m]; 
if rat: print('ins/楽天税込 median',st.median(rat), 'quartiles',st.quantiles(rat,n=4))
for x,p in m[:12]: print(x['name'][:50], x['ins'], p, round(x['ins']/p,2), x['cost'])
import json; json.dump(rows,open(sys.argv[3],'w'),ensure_ascii=False,default=str)
