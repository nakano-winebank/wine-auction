"""デット導入・費用積み増しの影響（高山社長・高岡先生の論点への回答用）"""
import model as M
from model import unit, steady, monthly, pct

u = unit(**M.SCENARIOS["ニュートラル"])
MULT = u["mult"] * 1.06 * 0.95     # 出資1億あたりの年間売上（回転12ヶ月）


def levered(total, debt, hold, rate=0.04, util=0.95, split=0.5):
    """SPC総資金 total（デット debt ＋ エクイティ）でのエクイティ投資家利回り。
    利息はSPCの費用として控除し、残りを折半する。"""
    eq = total - debt
    r = steady(u, hold, capital=total, util=util)
    interest = debt * rate
    pretax_after = r["pretax"] - interest
    inv = pretax_after * split
    return dict(sales=r["sales"], pretax=r["pretax"], interest=interest,
                pretax_after=pretax_after, investor=inv, eq=eq,
                yld=inv / eq, wb=pretax_after * (1 - split))


print("=" * 92)
print("【A】費用を正直に積み増した場合の影響（5億・回転12ヶ月・デットなし）")
print("=" * 92)
base = steady(u, 12)["yld"]
print(f"  現行前提（SPC維持費200万＋人件費360万＝560万）      定常年間利回り {pct(base)}")
for add, lbl in ((1_000_000, "＋AUP 100万"),
                 (1_500_000, "＋AUP 100万＋特例業務まわり 50万"),
                 (3_000_000, "＋監査 300万"),
                 (4_000_000, "＋監査 300万＋特例業務・法務 100万")):
    M.SPC_FIXED_TOTAL = 2_000_000 + 3_600_000 + add
    y = steady(u, 12)["yld"]
    print(f"  {lbl:34s} 定常年間利回り {pct(y)}  ({(y-base)*100:+.2f}pt)")
M.SPC_FIXED_TOTAL = 2_000_000 + 3_600_000

print()
print("=" * 92)
print("【B】デット導入：総額5億（デット2億＋エクイティ3億・金利4%）")
print("=" * 92)
print(" 回転  年間売上  SPC税前  利息   利息後   投資家取分  エクイティ利回り  （参考）デットなし")
for h in (12, 15, 18, 21, 24):
    x = levered(5e8, 2e8, h)
    n = steady(u, h, capital=5e8)
    print(f"{h:3d}ヶ月 {x['sales']/1e8:7.2f}億 {x['pretax']/1e8:6.2f}億 "
          f"{x['interest']/1e6:4.0f}百万 {x['pretax_after']/1e8:6.2f}億 "
          f"{x['investor']/1e6:8.0f}百万 {pct(x['yld']):>12s}      {pct(n['yld']):>7s}")

print()
print("=" * 92)
print("【C】デット比率別（総額5億・回転12ヶ月／販売キャパ制約時の回転20ヶ月）")
print("=" * 92)
for h in (12, 20):
    print(f"\n  ―― 回転{h}ヶ月（年間売上 {steady(u,h,capital=5e8)['sales']/1e8:.2f}億）――")
    print("   デット  エクイティ  利息   投資家取分  エクイティ利回り  WineBank取分")
    for d in (0, 1e8, 1.5e8, 2e8, 2.5e8, 3e8):
        x = levered(5e8, d, h)
        print(f"   {d/1e8:4.1f}億   {x['eq']/1e8:5.1f}億  {x['interest']/1e6:4.0f}百万 "
              f"{x['investor']/1e6:8.0f}百万 {pct(x['yld']):>12s}   {x['wb']/1e6:7.0f}百万")

print()
print("=" * 92)
print("【D】販売キャパ別：総額5億・デット2億で20%を確保できるか")
print("=" * 92)
print("  年間売上キャパ  対応する回転  エクイティ利回り  デットなしの場合")
for sales in (4.0e8, 4.5e8, 5.0e8, 5.5e8, 6.0e8, 7.0e8, 7.5e8):
    lo, hi = 6.0, 60.0
    for _ in range(80):
        mid = (lo + hi) / 2
        if steady(u, mid, capital=5e8)["sales"] > sales: lo = mid
        else: hi = mid
    h = (lo + hi) / 2
    x = levered(5e8, 2e8, h)
    n = steady(u, h, capital=5e8)
    print(f"  {sales/1e8:9.1f}億  {h:9.1f}ヶ月  {pct(x['yld']):>14s}  {pct(n['yld']):>14s}")

print()
print("=" * 92)
print("【E】金利感応度（総額5億・デット2億・回転12ヶ月／20ヶ月）")
print("=" * 92)
for h in (12, 20):
    row = "  ".join(f"{r*100:.0f}%→{pct(levered(5e8,2e8,h,rate=r)['yld'])}" for r in (0.02,0.03,0.04,0.05,0.06))
    print(f"  回転{h:2d}ヶ月： {row}")

print()
print("=" * 92)
print("【F】下振れ耐性：デットは両刃。ネガティブ（値引き5%＋価格横ばい）")
print("=" * 92)
un = unit(**M.SCENARIOS["ネガティブ"])
print("  回転   デットなし(5億)   デット2億・エクイティ3億")
for h in (12, 15, 18, 20, 24):
    r0 = steady(un, h, capital=5e8, rate=0.0)
    inv0 = r0["pretax"] * 0.5
    inv1 = (r0["pretax"] - 2e8 * 0.04) * 0.5
    print(f"  {h:3d}ヶ月  {pct(inv0/5e8):>12s}   {pct(inv1/3e8):>12s}")
lo, hi = 6.0, 120.0
for _ in range(90):
    mid = (lo + hi) / 2
    if steady(un, mid, capital=5e8, rate=0.0)["pretax"] > 2e8 * 0.04: lo = mid
    else: hi = mid
print(f"\n  ネガティブ前提で利息800万を賄えなくなる回転期間： {(lo+hi)/2:.0f}ヶ月")
