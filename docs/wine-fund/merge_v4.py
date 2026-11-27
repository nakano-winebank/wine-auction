import openpyxl,sys,warnings,re,json; warnings.filterwarnings('ignore')
from openpyxl.styles import PatternFill
cands=json.load(open(sys.argv[1])); selx=sys.argv[2]; v3=sys.argv[3]; ap=sys.argv[4]; out=sys.argv[5]
codes=[r[1] for r in openpyxl.load_workbook(selx).worksheets[0].iter_rows(min_row=5,values_only=True) if r[0] in ('ブルゴーニュ','ボルドー','シャンパーニュ','その他')]
cmap={c['code']:c for c in cands}; sel=[cmap[c] for c in codes]
# 生産者名・銘柄名はアピシウス在庫表から
aw=openpyxl.load_workbook(ap,data_only=True,read_only=True).worksheets[0]
pw={}
for r in aw.iter_rows(min_row=3,values_only=True):
    if r[3]: pw[str(r[3]).strip()]=(r[11],r[12])
nk=lambda t: re.sub(r'[^a-z0-9]','',str(t).lower())
wb=openpyxl.load_workbook(v3); ws=wb.worksheets[2]
have={nk(str(r[4]).strip()+str(r[2])+str(r[3])):r[0] for r in ws.iter_rows(min_row=2,values_only=True) if r[1]}
no=max(r[0] for r in ws.iter_rows(min_row=2,values_only=True) if isinstance(r[0],int))
gray=PatternFill('solid',fgColor='FFF2CC'); dup=0; ev=0
for c in sel:
    prod,wine=pw.get(c['code'],(None,None))
    prod=str(prod or '').strip(); wine=str(wine or c['name']).strip()
    key=nk(str(c['v'])+prod+wine)
    note='アピシウス在庫（P2）。'
    if '同一' in c['src']: note+='楽天価格は同一銘柄の参照値、URL・取得日の記入要'
    elif '他VT' in c['src']: note+='楽天価格は'+c['src']+'による仮置き。同一VTの最安値を要確認'
    else: note+='楽天価格は保険金額からの推計による仮置き。同一VTの最安値を要確認'
    if key in have: note+=f'。No.{have[key]}と重複の可能性（在庫数の確認要）'; dup+=1
    no+=1; rk=round(c['rk']); ex=rk/1.1
    w1=ex*0.903225806451613; ji=(w1+ex)/2; e=round(ji*0.755)
    ws.append([no,'リスト3（アピシウス）',prod,wine,str(c['v']),750,c['q'],rk,ex,None,None,w1,ji,e,e*c['q'],note])
    for col in 'HN': ws[f'{col}{ws.max_row}'].fill=gray
    ev+=e*c['q']
# 集計シートに行を追加
s=wb.worksheets[0]
rows=list(s.iter_rows(min_row=1,values_only=True))
for r in s.iter_rows(min_row=4):
    if r[0].value=='合計':
        tr=r[0].row; break
s.insert_rows(tr)
s.cell(tr,1,'リスト3（アピシウス）'); s.cell(tr,2,sum(c['q'] for c in sel)); s.cell(tr,3,ev); s.cell(tr,4,round(ev*0.1)); s.cell(tr,5,round(ev*1.1)); s.cell(tr,6,0); s.cell(tr,7,0)
t=tr+1
for col in range(2,8):
    L=openpyxl.utils.get_column_letter(col); s.cell(t,col,f'=SUM({L}4:{L}{tr})')
wb.save(out)
print('追加',len(sel),'行',sum(c['q'] for c in sel),'本 評価額税抜',ev,'税込',round(ev*1.1),'重複候補',dup)
