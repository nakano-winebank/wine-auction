"""資本構成：総額5億＝デット2億＋エクイティ3億

  ・デット2億の調達コスト（金利4%）はWineBankが負担する
  ・その見返りにWineBankはエクイティ2億相当の持分としてカウントされる
  ・SPCの税前利益は出資比率按分：WineBank 2億 : 投資家 3億 ＝ 40 : 60
  ・投資家の元本3億は満期に償還（デット2億はSPC資産から返済）
"""
import model as M
from model import unit, steady, pct

# 費用：SPC維持費200万＋人件費360万＋AUP50万＋予備費50万 ＝ 660万
M.SPC_MAINTENANCE = 2_000_000
M.SPC_FIXED_TOTAL = 2_000_000 + 3_600_000 + 500_000 + 500_000

TOTAL, DEBT, EQ = 5e8, 2e8, 3e8
RATE = 0.04
WB_SHARE, INV_SHARE = DEBT / TOTAL, EQ / TOTAL   # 40% : 60%

u = unit(**M.SCENARIOS["ニュートラル"])
un = unit(**M.SCENARIOS["ネガティブ"])
up = unit(**M.SCENARIOS["ポジティブ"])


def hold_for_sales(uu, sales, rate=None):
    lo, hi = 5.0, 120.0
    for _ in range(90):
        mid = (lo + hi) / 2
        if steady(uu, mid, capital=TOTAL, rate=rate)["sales"] > sales: lo = mid
        else: hi = mid
    return (lo + hi) / 2


def split(uu, hold, rate=None):
    r = steady(uu, hold, capital=TOTAL, rate=rate)
    inv = r["pretax"] * INV_SHARE
    wb = r["pretax"] * WB_SHARE - DEBT * RATE
    return dict(sales=r["sales"], cost=r["spc_cost_total"], gross=r["gross"],
                pretax=r["pretax"], inv=inv, wb=wb,
                inv_yld=inv / EQ, wb_yld=wb / DEBT,
                blended=(inv + DEBT * RATE) / TOTAL)


def avg5(uu, hold, rate=None):
    """5年通算の年平均利回り（エクイティ3億ベース）。
    月次モデルは整数月でしか売却を刻めないため、保有期間は四捨五入する。"""
    m = M.monthly(uu, round(hold), capital=TOTAL, rate=rate)
    dist = m["total_distributed"] / 0.5 * INV_SHARE   # 50%配分→按分比率へ置換
    return dist / EQ / 5


print("=" * 100)
print("【1】年間販売実績別（ニュートラル・上昇6%）　総額5億＝デット2億＋エクイティ3億")
print("=" * 100)
print(" 年間販売  在庫回転   SPC税前   投資家60%   エクイティ利回り  5年通算年平均  WineBank取分")
for sales in (4.0e8, 4.5e8, 5.0e8, 5.5e8, 6.0e8, 7.0e8, 7.5e8):
    h = hold_for_sales(u, sales)
    x = split(u, h)
    print(f" {sales/1e8:5.1f}億  {h:6.1f}ヶ月  {x['pretax']/1e8:6.2f}億  "
          f"{x['inv']/1e6:8.0f}百万  {pct(x['inv_yld']):>13s}  {pct(avg5(u,h)):>12s}  "
          f"{x['wb']/1e6:8.0f}百万")

print()
print("=" * 100)
print("【2】主線（年間販売5.0億）の内訳")
print("=" * 100)
h = hold_for_sales(u, 5.0e8)
x = split(u, h)
r = steady(u, h, capital=TOTAL)
print(f"  在庫回転期間        {h:.1f}ヶ月")
print(f"  年間売上            {x['sales']/1e8:.2f}億円")
print(f"  年間粗利            {x['gross']/1e8:.2f}億円")
print(f"  SPC費用             {x['cost']/1e6:.0f}百万円")
for k, v in r["cost"].items():
    print(f"      {k:10s}      {v/1e6:7.2f}百万円")
print(f"  年間税前利益        {x['pretax']/1e8:.2f}億円")
print(f"  ├ 投資家 60%       {x['inv']/1e6:.0f}百万円  → エクイティ3億に対し {pct(x['inv_yld'])}")
print(f"  └ WineBank 40%     {x['pretax']*WB_SHARE/1e6:.0f}百万円")
print(f"       デット金利負担 ▲{DEBT*RATE/1e6:.0f}百万円")
print(f"       WineBank手取り  {x['wb']/1e6:.0f}百万円")
print(f"  デット提供者（2億） 金利4% ＝ {DEBT*RATE/1e6:.0f}百万円／年")
print(f"  ※同一投資家が5億全額を出す場合の合成利回り： {pct(x['blended'])}")

print()
print("=" * 100)
print("【3】配分方式の比較（主線・年間販売5.0億）")
print("=" * 100)
for lbl, sh in (("従来の折半 50:50", 0.50), ("出資比率按分 40:60", 0.60)):
    inv = x["pretax"] * sh
    print(f"  {lbl:22s} 投資家取分 {inv/1e6:6.0f}百万円 → エクイティ3億に対し {pct(inv/EQ)}")

print()
print("=" * 100)
print("【4】3シナリオ（主線の回転18.5ヶ月で固定）")
print("=" * 100)
for name, uu, rate in (("ポジティブ", up, None), ("ニュートラル", u, None), ("ネガティブ", un, 0.0)):
    y = split(uu, h, rate=rate)
    print(f"  {name:8s} 売上{y['sales']/1e8:5.2f}億 税前{y['pretax']/1e8:5.2f}億 "
          f"投資家{y['inv']/1e6:6.0f}百万 → {pct(y['inv_yld']):>7s}  "
          f"5年通算 {pct(avg5(uu,h,rate=rate)):>7s}")

print()
print("=" * 100)
print("【5】下振れ耐性：ネガティブ（値引き5%＋価格横ばい）を販売実績別に")
print("=" * 100)
print(" 年間販売  在庫回転  SPC税前  エクイティ利回り  WineBank取分（金利負担後）")
for sales in (4.0e8, 4.5e8, 5.0e8, 6.0e8):
    hh = hold_for_sales(un, sales, rate=0.0)
    y = split(un, hh, rate=0.0)
    print(f" {sales/1e8:5.1f}億  {hh:6.1f}ヶ月 {y['pretax']/1e8:6.2f}億  {pct(y['inv_yld']):>13s}  "
          f"{y['wb']/1e6:8.0f}百万")

print()
print("=" * 100)
print("【6】感応度（主線＝年間販売5.0億・回転18.5ヶ月）")
print("=" * 100)
b = x["inv_yld"]
print(f"  基準 {pct(b)}")
cases = [
    ("年間販売 5.0億 → 4.0億", split(u, hold_for_sales(u, 4.0e8))["inv_yld"]),
    ("ワイン価格上昇 6% → 0%", split(u, h, rate=0.0)["inv_yld"]),
    ("売値 ▲5%", split(un, h)["inv_yld"]),
    ("ワイン価格上昇 6% → 10%", split(u, h, rate=0.10)["inv_yld"]),
    ("年間販売 5.0億 → 6.0億", split(u, hold_for_sales(u, 6.0e8))["inv_yld"]),
    ("調達構成 定価比50→45",
     split(unit(mkt_cost=45, p_b2b=70, p_b2c=80, mix_b2b=0.5), h)["inv_yld"]),
]
for n, v in cases:
    print(f"  {n:26s} {pct(v):>7s}  ({(v-b)*100:+.1f}pt)")

print()
print("=" * 100)
print("【7】20%を割り込む条件")
print("=" * 100)
lo, hi = 1.0e8, 12e8
for _ in range(90):
    mid = (lo + hi) / 2
    if split(u, hold_for_sales(u, mid))["inv_yld"] < 0.20: lo = mid
    else: hi = mid
print(f"  ニュートラル：年間販売が {(lo+hi)/2/1e8:.2f}億円 を下回るとエクイティ利回り20%割れ")
lo, hi = 1.0e8, 12e8
for _ in range(90):
    mid = (lo + hi) / 2
    if split(un, hold_for_sales(un, mid, rate=0.0), rate=0.0)["inv_yld"] < 0.20: lo = mid
    else: hi = mid
print(f"  ネガティブ：　年間販売が {(lo+hi)/2/1e8:.2f}億円 を下回るとエクイティ利回り20%割れ")
