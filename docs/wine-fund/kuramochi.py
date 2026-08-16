"""倉持案：総額5億をすべてエクイティ（投資家出資）で構成。デットなし。

  ・投資家帰属分＝SPC税前利益の全額（5分の5）
  ・その50%をWineBankが成功報酬として受領、残り50%が投資家取分
  ・投資家取分 ＝ SPC税前利益 × 50% ÷ 出資5億
"""
import model as M
from model import unit, steady, pct

M.SPC_MAINTENANCE = 2_000_000
M.SPC_FIXED_TOTAL = 2_000_000 + 3_600_000 + 500_000 + 500_000

TOTAL = 5e8
EQ_K  = 5e8          # 倉持案：エクイティ5億
EQ_Y, DEBT_Y, RATE = 3e8, 2e8, 0.04   # 山本案：エクイティ3億＋デット2億

u  = unit(**M.SCENARIOS["ニュートラル"])
up = unit(**M.SCENARIOS["ポジティブ"])
un = unit(**M.SCENARIOS["ネガティブ"])
HOLDS = (9, 12, 15, 18)


def kura(uu, h, rate=None):
    r = steady(uu, h, capital=TOTAL, rate=rate)
    inv = r["pretax"] * 0.50          # 帰属100% × 折半50%
    m = M.monthly(uu, h, capital=TOTAL, rate=rate, share=0.50)
    return dict(sales=r["sales"], gross=r["gross"], pretax=r["pretax"],
                attr=r["pretax"], inv=inv, wb=inv, yld=inv / EQ_K,
                cum=m["total_distributed"], avg5=m["total_distributed"] / EQ_K / 5)


def yama(uu, h, rate=None):
    r = steady(uu, h, capital=TOTAL, rate=rate)
    attr = r["pretax"] * 0.60
    inv = attr * 0.50
    m = M.monthly(uu, h, capital=TOTAL, rate=rate, share=0.30)
    return dict(sales=r["sales"], pretax=r["pretax"], attr=attr, inv=inv,
                wb=inv + r["pretax"] * 0.40 - DEBT_Y * RATE, yld=inv / EQ_Y,
                cum=m["total_distributed"], avg5=m["total_distributed"] / EQ_Y / 5)


print("=" * 104)
print("【1】倉持案（エクイティ5億のみ）　ニュートラル・上昇6%")
print("=" * 104)
print(" 回転期間   年間販売   SPC税前   投資家取分(折半後)  投資家利回り  5年累計分配  年平均利回り  WineBank")
for h in HOLDS:
    x = kura(u, h)
    tag = "（主線）" if h == 12 else "　　　"
    print(f" {h:2d}ヶ月{tag} {x['sales']/1e8:6.2f}億 {x['pretax']/1e8:7.2f}億 "
          f"{x['inv']/1e6:13.0f}百万 {pct(x['yld']):>12s} {x['cum']/1e6:10.0f}百万 "
          f"{pct(x['avg5']):>12s} {x['wb']/1e6:8.0f}百万")

print()
print("=" * 104)
print("【2】両案の比較（回転12ヶ月・ニュートラル）")
print("=" * 104)
k, y = kura(u, 12), yama(u, 12)
print(f"{'':24s}{'倉持案（E5億）':>22s}{'山本案（D2億＋E3億）':>26s}")
rows = [
    ("投資家の出資（リスク資本）", f"{EQ_K/1e8:.0f}億円", f"{EQ_Y/1e8:.0f}億円"),
    ("投資家の貸付（デット）", "なし", f"{DEBT_Y/1e8:.0f}億円（金利4%・WB保証）"),
    ("SPC年間税前利益", f"{k['pretax']/1e8:.2f}億円", f"{y['pretax']/1e8:.2f}億円"),
    ("投資家帰属分", f"{k['attr']/1e6:.0f}百万円（5分の5）", f"{y['attr']/1e6:.0f}百万円（5分の3）"),
    ("投資家取分（折半後）", f"{k['inv']/1e6:.0f}百万円", f"{y['inv']/1e6:.0f}百万円"),
    ("受取利息", "—", f"{DEBT_Y*RATE/1e6:.0f}百万円"),
    ("投資家 年間受取合計", f"{k['inv']/1e6:.0f}百万円", f"{y['inv']/1e6 + DEBT_Y*RATE/1e6:.0f}百万円"),
    ("投資家利回り（出資ベース）", pct(k['yld']), pct(y['yld'])),
    ("投資家利回り（拠出5億ベース）", pct(k['inv']/5e8), pct((y['inv']+DEBT_Y*RATE)/5e8)),
    ("WineBank取分", f"{k['wb']/1e6:.0f}百万円", f"{y['wb']/1e6:.0f}百万円"),
]
for a, b, c in rows:
    print(f"  {a:26s}{b:>22s}{c:>28s}")

print()
print("=" * 104)
print("【3】倉持案 3シナリオ（投資家利回り）　※比率は山本案と完全に同一")
print("=" * 104)
print("           " + "".join(f"{h:>10d}ヶ月" for h in HOLDS))
for name, uu, rate in (("ポジティブ", up, None), ("ニュートラル", u, None), ("ネガティブ", un, 0.0)):
    print(f"  {name:10s}" + "".join(f"{pct(kura(uu,h,rate)['yld']):>12s}" for h in HOLDS))

print()
print("=" * 104)
print("【4】倉持案 金額表（ニュートラル・百万円）")
print("=" * 104)
for h in HOLDS:
    k2, y2 = kura(u, h), yama(u, h)
    print(f" {h:2d}ヶ月  倉持:投資家{k2['inv']/1e6:5.0f} WB{k2['wb']/1e6:5.0f} 5年累計{k2['cum']/1e6:5.0f}"
          f"   ｜ 山本:投資家{y2['inv']/1e6:5.0f} WB{y2['wb']/1e6:5.0f} 5年累計{y2['cum']/1e6:5.0f}")

print()
print("=" * 104)
print("【5】上振れ・下振れの金額（倉持案）")
print("=" * 104)
for name, uu, rate in (("ポジティブ", up, None), ("ネガティブ", un, 0.0)):
    print(f"  {name}")
    for h in HOLDS:
        x = kura(uu, h, rate)
        print(f"    {h:2d}ヶ月 売上{x['sales']/1e8:5.2f}億 税前{x['pretax']/1e8:5.2f}億 "
              f"投資家取分{x['inv']/1e6:5.0f}百万 利回り{x['yld']*100:5.1f}%")

print()
print("=" * 104)
print("【6】感応度・分岐点（倉持案＝山本案と同率）")
print("=" * 104)
b = kura(u, 12)["yld"]
cases = [
    ("在庫回転 12 → 18ヶ月", kura(u, 18)["yld"]),
    ("ワイン価格上昇 6% → 0%", kura(u, 12, rate=0.0)["yld"]),
    ("売値 ▲5%", kura(un, 12)["yld"]),
    ("稼働率 95% → 85%", steady(u, 12, capital=TOTAL, util=0.85)["pretax"] * 0.5 / EQ_K),
    ("ワイン価格上昇 6% → 10%", kura(u, 12, rate=0.10)["yld"]),
    ("調達構成 定価比50→45", kura(unit(mkt_cost=45, p_b2b=70, p_b2c=80, mix_b2b=0.5), 12)["yld"]),
]
print(f"  基準 {pct(b)}")
for n, v in cases:
    print(f"  {n:26s} {pct(v):>7s}  ({(v-b)*100:+.1f}pt)")


def breakeven(uu, rate=None, target=0.20):
    lo, hi = 3.0, 60.0
    for _ in range(80):
        mid = (lo + hi) / 2
        if kura(uu, mid, rate)["yld"] > target: lo = mid
        else: hi = mid
    return (lo + hi) / 2

print(f"  20%分岐点 ニュートラル {breakeven(u):.1f}ヶ月 ／ 上昇0% {breakeven(u,0.0):.1f}ヶ月 "
      f"／ ネガティブ {breakeven(un,0.0):.1f}ヶ月")
