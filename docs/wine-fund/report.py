import model as M
from model import (unit, unit_held, steady, monthly, appr, pct,
                   CAPITAL, UTIL, LOT_RRP, APPRECIATION)

N = M.SCENARIOS["ニュートラル"]
u0 = unit(**N)
HOLDS = (9, 12, 15, 18)

print("=" * 96)
print(f"【値上がりの織り込み】年間上昇率 {APPRECIATION:.0%}／保有期間別・定価100あたり")
print("=" * 96)
print(" 保有   上昇倍率  売値    変動販売費  手取り  SPC取得原価  単位粗利  粗利率")
for h in HOLDS:
    x = unit_held(u0, h)
    print(f"{h:3d}ヶ月  {x['k']:6.4f}  {x['price']:6.2f}  ▲{x['var']:5.2f}    "
          f"{x['net']:6.2f}   {x['spc_cost']:6.2f}     {x['gross']:6.2f}   {pct(x['gm']):>6s}")

print()
print("=" * 96)
print("【回転効果と値上がり効果の綱引き】ニュートラル・定常年間利回り")
print("=" * 96)
print(" 保有  上昇なし(0%)  上昇6%   差（値上がり効果）  回転効果（12ヶ月比）")
b0 = steady(u0, 12, rate=0.0)["yld"]
b6 = steady(u0, 12)["yld"]
for h in HOLDS:
    y0 = steady(u0, h, rate=0.0)["yld"]
    y6 = steady(u0, h)["yld"]
    print(f"{h:3d}ヶ月  {pct(y0):>9s}  {pct(y6):>7s}   {(y6-y0)*100:+6.1f}pt        "
          f"{(y0-b0)*100:+6.1f}pt")

print()
print("=" * 96)
print("【上昇率別】ニュートラル・定常年間利回り")
print("=" * 96)
print(" 保有   0%（未織込）   6%（主線）  10%（会社資料水準）")
for h in HOLDS:
    print(f"{h:3d}ヶ月  {pct(steady(u0,h,rate=0.0)['yld']):>9s}  "
          f"{pct(steady(u0,h)['yld']):>10s}  {pct(steady(u0,h,rate=0.10)['yld']):>12s}")

print()
print("=" * 96)
print(f"【定常年間実力値】上昇率{APPRECIATION:.0%}・投資枠5億・稼働率{UTIL:.0%}")
print("=" * 96)
for name, sc in M.SCENARIOS.items():
    u = unit(**sc)
    print(f"\n--- {name} ---")
    print(" 保有  年間売上   年間粗利  SPC費用  年間税前  投資家配当  定常利回り  "
          "5年累計分配  年平均利回り(5年)")
    for h in HOLDS:
        r = steady(u, h)
        m = monthly(u, h)
        print(f"{h:3d}ヶ月 {r['sales']/1e8:7.2f}億 {r['gross']/1e8:7.2f}億 "
              f"{r['spc_cost_total']/1e6:5.0f}百万 {r['pretax']/1e8:6.2f}億 "
              f"{r['investor']/1e6:8.0f}百万 {pct(r['yld']):>9s} "
              f"{m['total_distributed']/1e6:9.0f}百万 {pct(m['avg_yield']):>12s}")

print()
print("=" * 96)
print("【感応度】ニュートラル・回転12ヶ月（定常年間利回り基準）")
print("=" * 96)
base = steady(u0, 12)["yld"]
print(f"  基準  {pct(base)}\n")
rows = [
    ("在庫回転期間 12→18ヶ月", steady(u0, 18)["yld"]),
    ("ワイン価格上昇率 6%→0%（横ばい）", steady(u0, 12, rate=0.0)["yld"]),
    ("ワイン価格上昇率 6%→10%（会社資料水準）", steady(u0, 12, rate=0.10)["yld"]),
    ("売却価格 ▲5%（70/80→66.5/76）",
     steady(unit(mkt_cost=50, p_b2b=66.5, p_b2c=76, mix_b2b=0.5), 12)["yld"]),
    ("稼働率 95%→85%", steady(u0, 12, util=0.85)["yld"]),
    ("B2Cモール手数料 5.5%→8.0%",
     steady(unit(mkt_cost=50, p_b2b=70, p_b2c=80, mix_b2b=0.5, rate_b2c=0.137), 12)["yld"]),
    ("販売チャネル構成 50:50→B2C100%",
     steady(unit(mkt_cost=50, p_b2b=70, p_b2c=80, mix_b2b=0.0), 12)["yld"]),
    ("調達構成 定価比50→45",
     steady(unit(mkt_cost=45, p_b2b=70, p_b2c=80, mix_b2b=0.5), 12)["yld"]),
]
for n, v in rows:
    print(f"  {n:40s} {pct(v):>7s}  ({(v-base)*100:+.1f}pt)")

print()
print("=" * 96)
print("【定常年間利回り20%に到達する在庫回転期間】ニュートラル")
print("=" * 96)
for rate, lbl in ((0.06, "上昇6%（主線）"), (0.0, "上昇0%"), (0.10, "上昇10%")):
    lo, hi = 4.0, 24.0
    for _ in range(90):
        mid = (lo + hi) / 2
        if steady(u0, mid, rate=rate)["yld"] > 0.20: lo = mid
        else: hi = mid
    print(f"  {lbl:16s} → 在庫回転 {(lo+hi)/2:.1f}ヶ月")

print()
print("=" * 96)
print("【値引き5%を回転短縮で取り戻すには】ニュートラル・上昇6%")
print("=" * 96)
un = unit(mkt_cost=50, p_b2b=66.5, p_b2c=76, mix_b2b=0.5)
lo, hi = 4.0, 24.0
for _ in range(90):
    mid = (lo + hi) / 2
    if steady(un, mid)["yld"] > base: lo = mid
    else: hi = mid
print(f"  基準17.1%を値引き後に回復するのに必要な回転期間： {(lo+hi)/2:.1f}ヶ月")

print()
print("=" * 96)
print("【ネガティブの再定義】値引きに加え価格横ばい（上昇0%）")
print("=" * 96)
for h in HOLDS:
    r = steady(un, h, rate=0.0); m = monthly(un, h, rate=0.0)
    print(f"{h:3d}ヶ月 売上{r['sales']/1e8:6.2f}億 税前{r['pretax']/1e8:5.2f}億 "
          f"定常{pct(r['yld']):>7s} 年平均5年{pct(m['avg_yield']):>7s}")
