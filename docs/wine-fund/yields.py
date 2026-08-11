"""IRRを使わず、利回りベースの指標に置き換えるための算出。

  定常年間利回り      = 軌道に乗った後の 投資家配当 / 出資額
  年平均利回り(通算)  = 通算の累計分配額 / 出資額 / 運用年数
  累計分配額          = 運用期間中に投資家が受け取る分配の合計
"""
import model as M
from model import unit, steady, monthly, pct, CAPITAL

def avg_yield(u, hold, years):
    r = monthly(u, hold, years)
    return r["total_distributed"] / CAPITAL / years, r["total_distributed"]

def run(label, markup, personnel):
    M.SPC_FIXED_TOTAL = M.SPC_FIXED + (M.SPC_PERSONNEL if personnel else 0)
    out = {}
    for name, sc in M.SCENARIOS.items():
        u = unit(markup=markup, **sc)
        rows = []
        for h in (9, 12, 15, 18):
            st = steady(u, h)
            y3, d3 = avg_yield(u, h, 3)
            y5, d5 = avg_yield(u, h, 5)
            rows.append((h, st, y3, d3, y5, d5))
        out[name] = rows
    return out

new = run("今回版", 0.01, True)
old = run("8/5版", 0.0, False)
M.SPC_FIXED_TOTAL = M.SPC_FIXED + M.SPC_PERSONNEL

print("=" * 96)
print("【利回りベース指標】投資枠5億円・稼働率85%")
print("=" * 96)
for name, rows in new.items():
    print(f"\n--- {name} ---")
    print(" 回転  年間売上   年間粗利  SPC費用  年間税前  投資家配当/年  定常利回り  "
          "3年累計分配 年平均(3年)  5年累計分配 年平均(5年)")
    for h, st, y3, d3, y5, d5 in rows:
        print(f"{h:3d}ヶ月 {st['sales']/1e8:8.2f}億 {st['gross']/1e8:8.2f}億 "
              f"{st['spc_cost_total']/1e6:6.0f}百万 {st['pretax']/1e8:7.2f}億 "
              f"{st['investor']/1e6:9.0f}百万 {pct(st['yld']):>9s}  "
              f"{d3/1e6:9.0f}百万 {pct(y3):>9s}  {d5/1e6:9.0f}百万 {pct(y5):>9s}")

print()
print("=" * 96)
print("【改訂インパクト】ニュートラル：8/5版前提 → 今回版")
print("=" * 96)
print(" 回転    旧定常  新定常   差     旧年平均(3年) 新年平均(3年)  差")
for i, h in enumerate((9, 12, 15, 18)):
    so = old["ニュートラル"][i][1]["yld"]; sn = new["ニュートラル"][i][1]["yld"]
    yo = old["ニュートラル"][i][2];        yn = new["ニュートラル"][i][2]
    print(f"{h:3d}ヶ月  {pct(so):>6s} {pct(sn):>6s} {(sn-so)*100:+5.1f}pt   "
          f"{pct(yo):>9s} {pct(yn):>10s} {(yn-yo)*100:+6.1f}pt")

print()
print("=" * 96)
print("【感応度】ニュートラル・回転12ヶ月（定常利回り基準）")
print("=" * 96)
u0 = unit(**M.SCENARIOS["ニュートラル"])
b = steady(u0, 12)["yld"]
print(f"  基準 {pct(b)}")
rows = [("在庫回転期間 12→18ヶ月", steady(u0, 18)["yld"]),
        ("売却価格 75→71.25（▲5%）", steady(unit(mkt_cost=50, price=71.25), 12)["yld"])]
M.LOSS_RATE = 0.08
rows.append(("滞留・ロス率 2%→8%", steady(u0, 12)["yld"]))
M.LOSS_RATE = 0.02
rows.append(("稼働率 85%→70%", steady(u0, 12, util=0.70)["yld"]))
rows.append(("仕入原価 50→45", steady(unit(mkt_cost=45, price=75), 12)["yld"]))
rows.append(("譲渡マージン 1%→2%", steady(unit(mkt_cost=50, price=75, markup=0.02), 12)["yld"]))
M.SPC_FIXED_TOTAL = M.SPC_FIXED + 7_200_000
rows.append(("SPC人件費 360万→720万", steady(u0, 12)["yld"]))
M.SPC_FIXED_TOTAL = M.SPC_FIXED + M.SPC_PERSONNEL
for n, v in rows:
    print(f"  {n:28s} {pct(v):>7s}  ({(v-b)*100:+.1f}pt)")

print()
print("  稼働率別（回転12ヶ月）：")
for util in (0.85, 0.80, 0.75, 0.70):
    st = steady(u0, 12, util=util)
    y3, _ = avg_yield(u0, 12, 3)
    r = monthly(u0, 12, 3, util=util)
    print(f"    稼働率{util:.0%}  定常利回り {pct(st['yld']):>6s}   "
          f"年平均利回り(3年) {pct(r['total_distributed']/CAPITAL/3):>6s}")

print()
print("=" * 96)
print("【先方基準20%に到達する回転期間】ニュートラル")
print("=" * 96)
lo, hi = 6.0, 18.0
for _ in range(80):
    mid = (lo + hi) / 2
    if steady(u0, mid)["yld"] > 0.20: lo = mid
    else: hi = mid
print(f"  定常利回り20%となる在庫回転期間： {(lo+hi)/2:.1f}ヶ月")
for h in (9, 10, 10.5, 11, 12):
    print(f"    回転{h:4.1f}ヶ月 → 定常利回り {pct(steady(u0, h)['yld'])}")
