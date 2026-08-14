"""資本構成：総額5億＝デット2億＋エクイティ3億

  ・デット2億の調達コスト（金利4%）はWineBankが負担する
  ・SPC税前利益のうち出資3億に帰属する分（5分の3）を投資家とWineBankで折半する
    → 折半＝「投資家が得た利益をWineBankと折半する成功報酬」
    → 投資家の取分 ＝ SPC税前利益 × 3/5 × 50% ＝ 30%
  ・デット2億に帰属する分（5分の2）は、金利と保証責任を負うWineBankが受け取る
  ・投資家の元本3億は満期に償還（デット2億はSPC資産から返済）
"""
import model as M
from model import unit, steady, pct

# 費用：SPC維持費200万＋人件費360万＋AUP50万＋予備費50万 ＝ 660万
M.SPC_MAINTENANCE = 2_000_000
M.SPC_FIXED_TOTAL = 2_000_000 + 3_600_000 + 500_000 + 500_000

TOTAL, DEBT, EQ = 5e8, 2e8, 3e8
RATE = 0.04
ATTR      = EQ / TOTAL      # 出資3億が総額5億に占める割合＝5分の3
SUCCESS   = 0.50            # 投資家帰属利益をWineBankと折半（成功報酬）
INV_SHARE = ATTR * SUCCESS  # 投資家の取分＝SPC税前利益の30%
DEBT_SHARE = DEBT / TOTAL   # デット2億に帰属する割合＝5分の2

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
    attr = r["pretax"] * ATTR                 # 投資家帰属分（5分の3）
    inv = attr * SUCCESS                      # 折半後の投資家取分
    fee = attr - inv                          # WineBankの成功報酬
    wb = fee + r["pretax"] * DEBT_SHARE - DEBT * RATE
    return dict(sales=r["sales"], cost=r["spc_cost_total"], gross=r["gross"],
                pretax=r["pretax"], attr=attr, inv=inv, fee=fee, wb=wb,
                inv_yld=inv / EQ)


def avg5(uu, hold, rate=None):
    """5年通算の年平均利回り（エクイティ3億ベース）。
    月次モデルは整数月でしか売却を刻めないため、保有期間は四捨五入する。"""
    m = M.monthly(uu, round(hold), capital=TOTAL, rate=rate)
    dist = m["total_distributed"] / 0.5 * INV_SHARE   # 50%配分→投資家取分比率へ置換
    return dist / EQ / 5


HOLDS = (9, 12, 15, 18)

print("=" * 100)
print("【1】在庫回転期間別（ニュートラル・上昇6%）　総額5億＝デット2億＋エクイティ3億")
print("=" * 100)
print(" 回転期間   年間販売   SPC税前   帰属(3/5)   投資家取分   投資家利回り   5年通算年平均   WineBank")
for h in HOLDS:
    x = split(u, h)
    tag = "（主線）" if h == 12 else "　　　"
    print(f" {h:2d}ヶ月{tag} {x['sales']/1e8:6.2f}億 {x['pretax']/1e8:7.2f}億 "
          f"{x['attr']/1e6:8.0f}百万 {x['inv']/1e6:9.0f}百万 {pct(x['inv_yld']):>12s} "
          f"{pct(avg5(u,h)):>13s} {x['wb']/1e6:9.0f}百万")

print()
print("=" * 100)
print("【2】主線（在庫回転12ヶ月）の内訳")
print("=" * 100)
h = 12
x = split(u, h)
r = steady(u, h, capital=TOTAL)
print(f"  在庫回転期間        {h}ヶ月")
print(f"  年間売上            {x['sales']/1e8:.2f}億円")
print(f"  年間粗利            {x['gross']/1e8:.2f}億円（変動販売費控除前）")
print(f"  SPC費用             {x['cost']/1e6:.0f}百万円")
for k, v in r["cost"].items():
    print(f"      {k:10s}      {v/1e6:7.2f}百万円")
print(f"  年間税前利益        {x['pretax']/1e8:.2f}億円")
print(f"  ├ 投資家帰属分(3/5) {x['attr']/1e6:.0f}百万円")
print(f"  │   ├ 投資家       {x['inv']/1e6:.0f}百万円  → 出資3億に対し {pct(x['inv_yld'])}")
print(f"  │   └ WineBank     {x['fee']/1e6:.0f}百万円  （成功報酬＝帰属利益の50%）")
print(f"  └ デット帰属分(2/5) {x['pretax']*DEBT_SHARE/1e6:.0f}百万円")
print(f"        金利負担      ▲{DEBT*RATE/1e6:.0f}百万円")
print(f"        WineBank受領   {x['pretax']*DEBT_SHARE/1e6 - DEBT*RATE/1e6:.0f}百万円")
print(f"  WineBank合計        {x['wb']/1e6:.0f}百万円（成功報酬＋デット分−金利）")

print()
print("=" * 100)
print("【3】3シナリオ（回転期間別・投資家利回り）")
print("=" * 100)
print("           " + "".join(f"{h:>10d}ヶ月" for h in HOLDS))
for name, uu, rate in (("ポジティブ", up, None), ("ニュートラル", u, None), ("ネガティブ", un, 0.0)):
    line = "".join(f"{pct(split(uu,h,rate=rate)['inv_yld']):>12s}" for h in HOLDS)
    print(f"  {name:10s}{line}")

print()
print("=" * 100)
print("【4】感応度（主線＝回転12ヶ月・21.0%）")
print("=" * 100)
b = split(u, 12)["inv_yld"]
print(f"  基準 {pct(b)}")
cases = [
    ("在庫回転 12 → 18ヶ月", split(u, 18)["inv_yld"]),
    ("ワイン価格上昇 6% → 0%", split(u, 12, rate=0.0)["inv_yld"]),
    ("売値 ▲5%", split(un, 12)["inv_yld"]),
    ("稼働率 95% → 85%",
     steady(u, 12, capital=TOTAL, util=0.85)["pretax"] * INV_SHARE / EQ),
    ("ワイン価格上昇 6% → 10%", split(u, 12, rate=0.10)["inv_yld"]),
    ("調達構成 定価比50→45",
     split(unit(mkt_cost=45, p_b2b=70, p_b2c=80, mix_b2b=0.5), 12)["inv_yld"]),
]
for n, v in cases:
    print(f"  {n:26s} {pct(v):>7s}  ({(v-b)*100:+.1f}pt)")

print()
print("=" * 100)
print("【5】20%を割り込む回転期間")
print("=" * 100)
def breakeven(uu, rate=None, target=0.20):
    lo, hi = 3.0, 60.0
    for _ in range(80):
        mid = (lo + hi) / 2
        if split(uu, mid, rate=rate)["inv_yld"] > target: lo = mid
        else: hi = mid
    return (lo + hi) / 2
print(f"  ニュートラル（上昇6%）      回転 {breakeven(u):5.1f}ヶ月  → 主線12ヶ月からの余裕 {breakeven(u)-12:.1f}ヶ月")
print(f"  上昇0%（横ばい）            回転 {breakeven(u, 0.0):5.1f}ヶ月")
print(f"  ネガティブ（値引き5%＋横ばい）回転 {breakeven(un, 0.0):5.1f}ヶ月")
