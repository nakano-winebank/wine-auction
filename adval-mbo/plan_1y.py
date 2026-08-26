# -*- coding: utf-8 -*-
# クロージング 2027/5/31（1年後）／1年間で純資産+1.50億改善の前提
SH=192_616; NAK0=65_000; SO=9_000; E_SO=1000; ALL_OUT=127_616
PRE=20.0
so_in=SO*E_SO/1e8; sh=SH+SO; nak=NAK0+SO
px=(PRE+so_in)*1e8/sh
BUY=ALL_OUT*px/1e8
BASE_CAP=6.51                      # 減資でその他資本剰余金へ振替えられる既存資本
RET0=-10.62; GAIN=1.50             # 1年間の利益で繰越欠損金が1.50億改善
RET=RET0+GAIN
EB=2.65; FEES=0.45; VIS=7.90

# クロージング直前BS（千円）: 純資産 △4.09 → △2.59億、既存銀行借入 3.67→3.07億、現預金 0.40→0.60億
TA0=1_406_028; BANK0=307_000; OTHER_L=566_409; NA0=-259_432
print("="*104)
print("【前提】クロージング 2027年5月31日／1年間で純資産 △4.09億 → △2.59億（+1.50億）")
print("="*104)
print(f"  1株 {px:,.0f}円（Pre{PRE:.0f}億・SO行使後201,616株）／ 全株買取 {ALL_OUT:,}株 = {BUY:.2f}億")
print(f"  繰越利益剰余金 {RET:.2f}億 → 分配可能額の穴 {max(-(BASE_CAP+so_in+RET),0):.2f}億")

def build(R, C):
    """R=ビジョン借入のうち増資で返す額 / C=増資による手元積み増し"""
    Z   = BUY + R + FEES + C
    nf  = (ALL_OUT-nak)/2 + (Z-BUY)*1e8/(2*px)
    npp = nf+nak
    X,Y = nf*px/1e8, npp*px/1e8
    dist= BASE_CAP + so_in + Z + RET
    debt_new = VIS-R                                   # デットで返す分（みずほ＋パートナー劣後）
    cash_d   = Z + so_in + debt_new - BUY - VIS - FEES
    ta  = TA0 + cash_d*1e5
    debt= BANK0 + debt_new*1e5
    tl  = debt + OTHER_L
    te  = ta - tl
    na_chk = NA0 + (Z+so_in-BUY-FEES)*1e5
    fcf = EB*0.95-0.75
    ads = debt/1e5/6 + debt/1e5*0.03*0.6
    return dict(R=R,C=C,Z=Z,X=X,Y=Y,nf=round(nf),npp=round(npp),dist=dist,ok=dist>=BUY,
                ta=ta,debt=debt,tl=tl,te=te,er=te/ta*100,lev=debt/1e5/EB,dscr=fcf/ads,
                cash=TA0*0+ (600_000/1000 if False else 60_000)+cash_d*1e5, na_chk=na_chk)

print("\n"+"="*104)
print("【重要】自己株式取得12.72億は純資産から控除されます ─ 増資を絞ると債務超過が解消しません")
print("="*104)
print(f"  {'増資総額':>9}{'中野ﾌｧﾝﾄﾞ':>10}{'ﾊﾟｰﾄﾅｰ':>9}{'純資産':>9}{'自己資本比率':>11}{'有利子負債':>10}{'D/EBITDA':>10}{'DSCR':>8}{'分配可能額':>10}")
print("  "+"-"*88)
for R,C in [(0.0,0.0),(0.0,1.0),(2.0,1.0),(4.0,1.5),(5.5,2.0),(7.90,2.0),(7.90,3.5)]:
    r=build(R,C)
    flag="" if r['ok'] else "  ×分配可能額不足"
    print(f"  {r['Z']:>8.2f}億{r['X']:>9.2f}億{r['Y']:>8.2f}億{r['te']/1e5:>8.2f}億{r['er']:>10.1f}%"
          f"{r['debt']/1e5:>9.2f}億{r['lev']:>9.1f}倍{r['dscr']:>7.2f}倍{r['dist']:>9.2f}億{flag}")
print("\n  R=ビジョン借入のうち増資で返す額／C=手元積み増し。残りのビジョン借入はみずほ＋パートナー劣後ローンで手当て")

print("\n"+"="*104)
print("【判定】みずほが融資できるBSの条件から逆算")
print("="*104)
print("  条件：自己資本比率25%以上／有利子負債‑EBITDA 3.0倍以下／DSCR 1.5倍以上")
best=None
for i in range(0,80):
    R=min(i*0.1,VIS)
    for j in range(0,60):
        C=j*0.1
        r=build(R,C)
        if r['ok'] and r['er']>=25 and r['lev']<=3.0 and r['dscr']>=1.5:
            if best is None or r['X']<best['X']: best=r
print(f"  中野ファンドを最小化する解 → 中野ファンド {best['X']:.2f}億")
print(f"    増資総額 {best['Z']:.2f}億（買取{BUY:.2f} ＋ ビジョン返済{best['R']:.2f} ＋ 費用{FEES:.2f} ＋ 手元{best['C']:.2f}）")
print(f"    パートナー {best['Y']:.2f}億 ／ 中野ファンド {best['X']:.2f}億")
print(f"    純資産 {best['te']/1e5:.2f}億（自己資本比率 {best['er']:.1f}%）")
print(f"    有利子負債 {best['debt']/1e5:.2f}億（{best['lev']:.1f}倍）／DSCR {best['dscr']:.2f}倍")
print(f"    ビジョン借入のうち {VIS-best['R']:.2f}億はみずほ＋パートナー劣後ローンで手当て")

print("\n"+"="*104)
print("【Pre評価額を下げた場合】中野ファンドはさらに減ります")
print("="*104)
print(f"  {'Pre':>5}{'1株':>9}{'買取総額':>10}{'増資総額':>10}{'中野ﾌｧﾝﾄﾞ':>10}{'ﾊﾟｰﾄﾅｰ':>9}{'純資産':>9}{'自己資本比率':>11}")
for P in [20,18,15,12]:
    q=(P+so_in)*1e8/sh; b=ALL_OUT*q/1e8; nkv=nak*q/1e8
    # 自己資本比率25%を満たす最小Z（近似）
    lo=None
    for k in range(1,400):
        Z=b+k*0.1
        dist=BASE_CAP+so_in+Z+RET
        if dist<b: continue
        R=min(Z-b-FEES,VIS); R=max(R,0); C=max(Z-b-FEES-R,0)
        cash_d=Z+so_in+(VIS-R)-b-VIS-FEES
        ta=TA0+cash_d*1e5; debt=BANK0+(VIS-R)*1e5; te=ta-(debt+OTHER_L)
        if te/ta*100>=25 and debt/1e5/EB<=3.0:
            lo=(Z,(Z-nkv)/2,(Z+nkv)/2,te/1e5,te/ta*100); break
    if lo: print(f"  {P:>4}億{q:>8,.0f}円{b:>9.2f}億{lo[0]:>9.2f}億{lo[1]:>9.2f}億{lo[2]:>8.2f}億{lo[3]:>8.2f}億{lo[4]:>10.1f}%")

print("\n"+"="*104)
print("【推奨案】現預金2億確保・自己資本比率25%以上・DSCR1.5倍以上を満たす最小構成")
print("="*104)
best2=None
for i in range(0,80):
    R=min(i*0.1,VIS)
    for j in range(0,80):
        C=j*0.1
        r=build(R,C)
        cash=(60_000+ (r['Z']+so_in+(VIS-R)-BUY-VIS-FEES)*1e5)
        if r['ok'] and r['er']>=25 and r['lev']<=3.0 and r['dscr']>=1.5 and cash>=200_000:
            if best2 is None or r['X']<best2[0]['X']: best2=(r,cash)
r,cash=best2
print(f"  増資総額        {r['Z']:6.2f}億")
print(f"    ├ 全株買取（自己株式取得）        {BUY:6.2f}億")
print(f"    ├ ビジョン借入の返済（増資分）      {r['R']:6.2f}億")
print(f"    ├ 諸費用                   {FEES:6.2f}億")
print(f"    └ 手元運転資金               {r['C']:6.2f}億")
print(f"  中野ファンド     {r['X']:6.2f}億（{r['nf']:,}株）")
print(f"  パートナー      {r['Y']:6.2f}億（{r['npp']:,}株）")
print(f"  ビジョン借入の残 {VIS-r['R']:.2f}億はみずほのリファイで手当て")
print()
print(f"  【取引後BS】")
print(f"    現預金        {cash/1e5:6.2f}億")
print(f"    資産合計       {r['ta']/1e5:6.2f}億")
print(f"    有利子負債      {r['debt']/1e5:6.2f}億（既存3.07 ＋ みずほ追加{VIS-r['R']:.2f}）")
print(f"    負債合計       {r['tl']/1e5:6.2f}億")
print(f"    純資産        {r['te']/1e5:6.2f}億  自己資本比率 {r['er']:.1f}%")
print(f"    有利子負債/EBITDA {r['lev']:.1f}倍 ／ DSCR {r['dscr']:.2f}倍 ／ 分配可能額 {r['dist']:.2f}億")
vote=sh+r['nf']+r['npp']-ALL_OUT
print()
print(f"  【議決権】発行済 {sh+r['nf']+r['npp']:,}株（うち自己株式{ALL_OUT:,}株）／議決権 {vote:,}株")
print(f"    中野 邦人    {nak:>8,}株  {nak/vote*100:6.3f}%")
print(f"    中野ファンド  {r['nf']:>8,}株  {r['nf']/vote*100:6.3f}%")
print(f"    中野陣営 小計 {nak+r['nf']:>8,}株  {(nak+r['nf'])/vote*100:6.3f}%")
print(f"    パートナー   {r['npp']:>8,}株  {r['npp']/vote*100:6.3f}%")
import json
json.dump({"px":px,"buy":BUY,"Z":r['Z'],"R":r['R'],"C":r['C'],"X":r['X'],"Y":r['Y'],
           "nf":r['nf'],"npp":r['npp'],"nak":nak,"vote":vote,"post":sh+r['nf']+r['npp'],
           "cash":cash,"ta":r['ta'],"debt":r['debt'],"tl":r['tl'],"te":r['te'],"er":r['er'],
           "lev":r['lev'],"dscr":r['dscr'],"dist":r['dist'],"refi":VIS-r['R']},
          open('plan_1y.json','w'),ensure_ascii=False,indent=1)
print("\n  → plan_1y.json に出力")
