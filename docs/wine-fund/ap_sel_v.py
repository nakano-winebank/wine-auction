import json,sys,re,openpyxl,warnings,collections,statistics as st
warnings.filterwarnings('ignore')
rows=json.load(open(sys.argv[1])); K=0.951612903225807*0.755
nk=lambda t: re.sub(r'[^a-z0-9]','',str(t).lower())
def strip_v(n): return nk(re.sub(r'^\s*[\*＊　 ]*\d{4}\s*','',str(n)))
# 楽天価格（税込）を名寄せ：WineTech1.5億シート＋P2価格チェック3シート
rk={}; rkw=collections.defaultdict(list)
def add(name,p):
    if name and isinstance(p,(int,float)) and p>0:
        rk.setdefault(nk(name),p)
        m=re.match(r'\D*(\d{4})',str(name)); 
        if m: rkw[strip_v(name)].append((int(m.group(1)),p))
wb=openpyxl.load_workbook(sys.argv[2],data_only=True,read_only=True)
for r in wb.worksheets[0].iter_rows(min_row=13,values_only=True): add(r[32],r[54])
wb=openpyxl.load_workbook(sys.argv[3],data_only=True,read_only=True)
for n in ['P2 2025-10 (20261027Rev.)','P2 202509追加分','P2 2025-09']:
    for r in wb[n].iter_rows(min_row=12,values_only=True): add(r[32],r[54])
def region(n):
    s=n.lower()
    if 'champagne' in s: return 'シャンパーニュ'
    if re.search(r'\bch\. |chateau|pauillac|margaux|pomerol|emilion|pessac|julien|estephe|sauternes|bordeaux',s): return 'ボルドー'
    if re.search(r'grand cru|1er cru|chambertin|vosne|musigny|nuits|meursault|montrachet|corton|romanee|beaune|volnay|pommard|chablis|bourgogne|morey|chambolle|vougeot|echezeaux|dujac|rousseau|drc|leroy|roumier',s): return 'ブルゴーニュ'
    return 'その他'
cands=[]
for x in rows:
    try: p2=float(x['sell']); cost=float(x['cost']); ins=float(x['ins']); q=int(float(x['q']))
    except: continue
    m=re.match(r'(\d{4})',str(x['vint']).strip()); 
    if not m or p2<=0: continue
    v=int(m.group(1))
    if v>int(sys.argv[5]): continue
    src=None
    if nk(x['name']) in rk: rp=rk[nk(x['name'])]; src='楽天（同一銘柄）'
    elif strip_v(x['name']) in rkw:
        lst=rkw[strip_v(x['name'])]; rp=st.median(p for _,p in lst); src=f'楽天（他VT {len(lst)}件の中央値）'
    elif ins>0 and not (2.1<=ins/cost<=2.4): rp=ins/0.88; src='保険金額から推計'
    else: continue
    price=rp/1.1*K
    cands.append(dict(code=x['code'],name=x['name'],v=v,q=q,p2=p2,rk=rp,src=src,price=price,rate=p2/price,reg=region(x['name'])))
print('候補',len(cands), collections.Counter(c['src'][:6] for c in cands))
for g in ['ブルゴーニュ','ボルドー','シャンパーニュ','その他']:
    cs=[c for c in cands if c['reg']==g and c['rate']<=0.85]
    print(g,len(cs),'q>=3:',sum(1 for c in cs if c['q']>=3),'卸値税込',round(sum(c['price']*c['q'] for c in cs)*1.1/1e6,1),'q>=2卸値', round(sum(c['price']*c['q'] for c in cs if c['q']>=2)*1.1/1e6,1))
json.dump(cands,open(sys.argv[4],'w'),ensure_ascii=False)
