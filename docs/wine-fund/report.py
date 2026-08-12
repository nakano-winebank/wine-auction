import model as M
from model import unit, steady, monthly, pct, CAPITAL, UTIL, LOT_RRP

N = M.SCENARIOS["ニュートラル"]
u0 = unit(**N)
base = steady(u0, 12)["yld"]

print("=" * 88)
print("【感応度】ニュートラル・回転12ヶ月（定常年間利回り基準）")
print("=" * 88)
print(f"  基準  {pct(base)}\n")

rows = []
rows.append(("在庫回転期間 12→18ヶ月", steady(u0, 18)["yld"]))
rows.append(("在庫回転期間 12→9ヶ月", steady(u0, 9)["yld"]))
rows.append(("チャネル構成 50:50→B2B100%（卸に全振り）",
             steady(unit(mkt_cost=50, p_b2b=70, p_b2c=80, mix_b2b=1.0), 12)["yld"]))
rows.append(("チャネル構成 50:50→B2C100%（EC・AUに全振り）",
             steady(unit(mkt_cost=50, p_b2b=70, p_b2c=80, mix_b2b=0.0), 12)["yld"]))
rows.append(("B2Cモール手数料 5.5%→8.0%（rate 11.2→13.7%）",
             steady(unit(mkt_cost=50, p_b2b=70, p_b2c=80, mix_b2b=0.5, rate_b2c=0.137), 12)["yld"]))
rows.append(("売却価格 ▲5%（70/80→66.5/76）",
             steady(unit(mkt_cost=50, p_b2b=66.5, p_b2c=76, mix_b2b=0.5), 12)["yld"]))
rows.append(("稼働率 95%→85%（解約対応で現金比率を上げた場合）",
             steady(u0, 12, util=0.85)["yld"]))
rows.append(("調達構成 定価比50→45（インポーター直比率の引き上げ）",
             steady(unit(mkt_cost=45, p_b2b=70, p_b2c=80, mix_b2b=0.5), 12)["yld"]))
for n, v in rows:
    print(f"  {n:44s} {pct(v):>7s}  ({(v-base)*100:+.1f}pt)")

print()
print("=" * 88)
print("【稼働率】ニュートラル・回転12ヶ月")
print("=" * 88)
for util in (0.95, 0.90, 0.85, 0.80):
    st = steady(u0, 12, util=util)
    mo = monthly(u0, 12, util=util)
    print(f"  稼働率{util:.0%}  定常年間利回り {pct(st['yld']):>6s}   "
          f"年平均利回り(5年通算) {pct(mo['avg_yield']):>6s}")

print()
print("=" * 88)
print("【定常年間利回り20%に到達する在庫回転期間】ニュートラル")
print("=" * 88)
lo, hi = 5.0, 18.0
for _ in range(90):
    mid = (lo + hi) / 2
    if steady(u0, mid)["yld"] > 0.20: lo = mid
    else: hi = mid
print(f"  20%到達ライン： 在庫回転 {(lo+hi)/2:.1f}ヶ月")
for h in (9, 10, 10.5, 11, 12):
    print(f"    回転{h:4.1f}ヶ月 → 定常年間利回り {pct(steady(u0, h)['yld'])}")

print()
print("=" * 88)
print("【保管料の実務水準チェック】")
print("=" * 88)
for avg_rrp in (15_000, 25_000, 40_000):
    bottles = LOT_RRP / avg_rrp
    per_bottle_month = M.STORAGE_PER_LOT_YEAR / bottles / 12
    print(f"  平均定価{avg_rrp:,}円 → 1ロット{bottles:4.1f}本 → "
          f"保管料 {per_bottle_month:5.1f}円/本/月")
print("  ※ 業務用パレット定温保管の一般水準は 月10〜20円/本。")
print("     個人向けセラー預かり（寺田倉庫等 月100〜150円/本）とは別の料金帯。")

st = steady(u0, 12)
bottles_total = CAPITAL * UTIL / u0["lot_cost"] * (LOT_RRP / 25_000)
print(f"\n  本ファンドの常時在庫： 約{CAPITAL*UTIL/u0['lot_cost']:,.0f}ロット "
      f"＝ 平均定価25,000円なら約{bottles_total:,.0f}本（定価換算 約"
      f"{CAPITAL*UTIL/u0['lot_cost']*LOT_RRP/1e8:.1f}億円）")

print()
print("=" * 88)
print("【チャネル別の手取り比較】定価100あたり")
print("=" * 88)
print(f"  B2B 酒販店卸    売値70.00 − 変動販売費 1.0%（0.70） = 手取り {u0['net_b2b']:5.2f}")
print(f"  B2C ネット最安   売値80.00 − 変動販売費11.2%（8.96） = 手取り {u0['net_b2c']:5.2f}")
print(f"  → 手数料が重くてもB2Cのほうが手取りは {u0['net_b2c']-u0['net_b2b']:.2f} 高い")
print(f"  加重平均（半々）  売値75.00 − 変動販売費 6.44%（4.83） = 手取り {u0['net']:5.2f}")
print(f"  SPC取得原価 50.50 → 単位粗利 {u0['gross']:5.2f}（粗利率 {pct(u0['gm'])}）")
