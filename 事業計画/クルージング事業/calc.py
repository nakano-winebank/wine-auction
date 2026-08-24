# -*- coding: utf-8 -*-

def irr(cfs, lo=-0.99, hi=10.0):
    def npv(r): return sum(c/((1+r)**i) for i,c in enumerate(cfs))
    if npv(lo)*npv(hi) > 0: return None
    for _ in range(300):
        mid=(lo+hi)/2
        if npv(lo)*npv(mid) <= 0: hi=mid
        else: lo=mid
    return (lo+hi)/2

M = 10000  # 万円単位で扱う
TAX = 0.34  # 法人実効税率

print("="*70)
print("【0】デッキ記載値の検算（算術チェック）")
print("="*70)
checks = []
checks.append(("会員権総額 100口×1,000万", 100*1000, 100000, "10億"))
checks.append(("UMITO手数料 40%", 100000*0.40, 40000, "4億"))
checks.append(("TK②ネット入金 60%", 100000*0.60, 60000, "6億"))
checks.append(("年間売上振替 6億÷20年", 60000/20, 3000, "3,000万"))
checks.append(("1年あたり償却額 1,000万÷20年", 1000/20, 50, "50万"))
checks.append(("1回あたり償却額 50万÷10回", 50/10, 5, "5万"))
checks.append(("運航原価小計 5+3+0.3+1.7万", 5.0+3.0+0.3+1.7, 10.0, "10万"))
checks.append(("都度利用料 10万+TWW利益3万", 10.0+3.0, 13.0, "13万"))
checks.append(("燃料費 15L/h×5h×230円", 15*5*230/10000, 1.7, "1.7万"))
checks.append(("中古簡便法 (4-2)+2×20%", (4-2)+2*0.2, 2.4, "2.4年→2年"))
checks.append(("造船TK譲渡益 4億-2億", 40000-20000, 20000, "2億"))
checks.append(("年会費比率 150万/1,000万", 150/1000*100, 15.0, "15%"))
checks.append(("年会費比率 100万/2,000万", 100/2000*100, 5.0, "5%"))
for name, calc, doc, label in checks:
    ok = "OK " if abs(calc-doc) < 0.011*max(1,abs(doc)) else "差異"
    print(f"  [{ok}] {name:34s} 計算={calc:>12,.4f}  資料={label}")

print()
print("  200%定率法(耐用4年, 償却率0.500, 保証率0.12499)の検証:")
base=400000000.0; rem=base; sched=[]
for y in range(1,5):
    reg = rem*0.5
    guarantee = base*0.12499
    if reg < guarantee:
        amt = rem  # 改定償却率1.000
    else:
        amt = reg
    sched.append(amt); rem -= amt
print("   ", [f"{a/base*100:.1f}%" for a in sched], "→ 資料記載 50%/25%/12.5%/12.5% と一致")

print()
print("="*70)
print("【1】投資リターン  Case A : 造船匿名組合（TK①）への出資")
print("="*70)
SHIP_COST = 20000   # 万円 造船・改装原価
SHIP_SALE = 40000   # 万円 TK②への売却価格
GAIN = SHIP_SALE - SHIP_COST
AM_FEE = 1500       # 万円 ★仮置き(未開示): AM報酬/GK維持/リーガル等 = 出資額の7.5%
YEARS_A = 2         # 造船24か月

for label, share in [("按分なし(投資家100%)",1.00), ("p16準拠 50:50按分",0.50)]:
    dist_gain = (GAIN - AM_FEE) * share
    pre = [-SHIP_COST, 0, SHIP_COST + dist_gain]
    post= [-SHIP_COST, 0, SHIP_COST + dist_gain*(1-TAX)]
    print(f"\n  ◆ {label}")
    print(f"    譲渡益 {GAIN:,}万 − 費用(仮){AM_FEE:,}万 = {GAIN-AM_FEE:,}万 → 投資家取分 {dist_gain:,.0f}万")
    print(f"    税前: 出資{SHIP_COST:,}万 → 回収{SHIP_COST+dist_gain:,.0f}万 "
          f"倍率{(SHIP_COST+dist_gain)/SHIP_COST:.3f}x  IRR(2年)={irr(pre)*100:.1f}%")
    print(f"    税後: 回収{SHIP_COST+dist_gain*(1-TAX):,.0f}万 "
          f"倍率{(SHIP_COST+dist_gain*(1-TAX))/SHIP_COST:.3f}x  IRR(2年)={irr(post)*100:.1f}%")

print()
print("="*70)
print("【2】投資リターン  Case B : 会員権発行匿名組合（TK②）への出資")
print("="*70)
BUY = 40000       # 船取得 4億
NET_IN = 60000    # 会員権ネット入金 6億
MAINT = 800       # ★未計上(推計): 係留/保険/JCI船検/整備/GK維持 年800万
REPAIR_IN = 600   # 一般売り修繕積立 2万×年300回
N_Y = 20

for label, sellout in [("完売まで1年", 1), ("完売まで3年", 3), ("50口止まり(20年)", 0)]:
    cf=[0.0]*(N_Y+1)
    cf[0] -= BUY
    if sellout>0:
        for t in range(1, sellout+1): cf[t] += NET_IN/sellout
    else:
        cf[1] += NET_IN*0.5
    for t in range(1, N_Y+1):
        cf[t] += REPAIR_IN - MAINT
    tot = sum(cf); r = irr(cf)
    print(f"  ◆ {label:18s} 20年累計CF={tot:>8,.0f}万  倍率={(tot+BUY)/BUY:.2f}x  "
          f"IRR={'n/a' if r is None else f'{r*100:.1f}%'}")

print("\n  ─ 課税の繰延効果（中古船・耐用2年・初年度100%償却/期首取得を仮定）─")
dep1 = BUY
loss1 = 3000 - dep1 - MAINT
print(f"    初年度TK②損益 = 売上振替3,000万 − 減価償却{dep1:,}万 − 維持費{MAINT}万 = {loss1:,}万")
print(f"    出資者(法人)の当期タックスシールド = {abs(loss1):,}万 × {TAX:.0%} = {abs(loss1)*TAX:,.0f}万")
print(f"    ただし2年目以降 3,000万×19年 = {3000*19:,}万 が益金として戻る")
print(f"    → 20年通算の課税所得 = ネット6億 − 船4億 − 維持費{MAINT*20:,}万 + 積立{REPAIR_IN*20:,}万 "
      f"= {NET_IN-BUY-MAINT*20+REPAIR_IN*20:,}万（＝節税ではなく繰延）")

print()
print("="*70)
print("【3】営業リターン : WineBank F&B事業")
print("="*70)
def fb(N, r_fb, P, U, cost_rate, labor, logi, coord_rate, fixed):
    n = N*r_fb
    sales = n*P*U
    cogs = sales*cost_rate
    lab = n*labor
    log = n*logi
    var = cogs+lab+log
    mgn = sales-var
    coord = sales*coord_rate
    contrib = mgn+coord
    op = contrib-fixed
    return dict(n=n, sales=sales, cogs=cogs, lab=lab, log=log, var=var, mgn=mgn,
                coord=coord, contrib=contrib, op=op, total_rev=sales+coord)

FIXED = 2100  # 万円: 統括MGR900 + 事務按分300 + 什器償却300 + 在庫金利100 + 保険/許認可200 + 本部按分300
P_BASE = dict(cost_rate=0.33, labor=8.0, logi=1.5, coord_rate=0.10, fixed=FIXED)  # 万円/運航

scen = [("保守 (360運航/実施率70%/8名/2.0万円)", 360,0.70, 8,2.0),
        ("基本 (600運航/実施率80%/10名/3.0万円)",600,0.80,10,3.0),
        ("強気 (900運航/実施率90%/12名/4.0万円)",900,0.90,12,4.0)]
res={}
for name,N,rf,P,U in scen:
    d = fb(N,rf,P,U,**P_BASE); res[name]=d
    print(f"\n  ◆ {name}")
    print(f"    F&B実施運航 {d['n']:>6,.0f}回   F&B売上 {d['sales']:>9,.0f}万円")
    print(f"    食材・飲料原価(33%) {d['cogs']:>9,.0f}万 / 調理・サービス人件費 {d['lab']:>8,.0f}万 / 物流・消耗品 {d['log']:>7,.0f}万")
    print(f"    限界利益 {d['mgn']:>9,.0f}万 ({d['mgn']/d['sales']*100:>4.1f}%)  + コーディネーションフィー10% {d['coord']:>7,.0f}万")
    print(f"    貢献利益 {d['contrib']:>9,.0f}万  − 固定費 {P_BASE['fixed']:,}万")
    print(f"    営業利益 {d['op']:>9,.0f}万  (対総収益 {d['op']/d['total_rev']*100:.1f}%)")

INIT = 1500  # 什器・食器・グラス・初期ワイン在庫
print(f"\n  ─ WineBank初期投資 {INIT:,}万円（什器・食器・グラス・初期ワイン在庫）に対して ─")
for name,d in res.items():
    print(f"    {name[:4]}: 営業利益{d['op']:>7,.0f}万 → ROI {d['op']/INIT*100:>6.0f}%/年, "
          f"回収 {INIT/d['op']*12:>4.1f}か月, 税後利益 {d['op']*(1-TAX):>7,.0f}万")

print()
print("  ─ 損益分岐（基本ケースの単価・原価前提）─")
d=res["基本 (600運航/実施率80%/10名/3.0万円)"]
cm_per = (d['mgn']+d['coord'])/d['n']
print(f"    1運航あたり貢献利益 = {cm_per:,.2f}万円")
print(f"    損益分岐運航回数 = 固定費{FIXED:,}万 ÷ {cm_per:,.2f}万 = {FIXED/cm_per:,.0f}回/年 "
      f"（= 稼働300日で1日{FIXED/cm_per/300:.2f}枠）")

print()
print("="*70)
print("【4】供給キャパシティ検証")
print("="*70)
for days in [365, 330, 300, 260]:
    cap = days*5
    print(f"  稼働{days}日 × 5枠/日 = {cap:,}枠/年   会員需要(100口×10回)=1,000回 → 占有率 {1000/cap*100:.0f}%  "
          f"一般売り可能枠 {cap-1000:,}枠")
print("  ※ 需要は花火7イベント・桜・週末夜に集中 → ピーク日の予約充足は構造的に不可能")

print()
print("  ─ 東京ウォータウェイズのインセンティブ ─")
print(f"    会員運航: 収入13万 − 原価10万 = 利益 3万/運航")
print(f"    一般売り: 収入30万 − 原価10万 − 修繕積立2万 = 利益18万/運航  → 一般売りが6倍有利")
