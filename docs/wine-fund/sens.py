import model as M
from model import unit, steady, monthly, pct, oku, hyaku, CAPITAL

N = M.SCENARIOS["ニュートラル"]

print("=" * 74)
print("【改訂インパクト】8/5版 → 今回版（ニュートラル）")
print("=" * 74)
print(" 回転   旧定常  新定常   差    旧IRR3  新IRR3   差")
for h in (9, 12, 15, 18):
    # 旧：譲渡マージンなし・人件費なし
    M.SPC_FIXED_TOTAL = M.SPC_FIXED
    uo = unit(markup=0.0, **N)
    so, io = steady(uo, h)["yld"], monthly(uo, h, 3)["irr"]
    # 新
    M.SPC_FIXED_TOTAL = M.SPC_FIXED + M.SPC_PERSONNEL
    un = unit(**N)
    sn, iN = steady(un, h)["yld"], monthly(un, h, 3)["irr"]
    print(f"{h:3d}ヶ月  {pct(so):>6s} {pct(sn):>6s} {(sn-so)*100:+5.1f}pt  "
          f"{pct(io):>6s} {pct(iN):>6s} {(iN-io)*100:+5.1f}pt")

# 要因分解（回転12ヶ月・定常利回り）
M.SPC_FIXED_TOTAL = M.SPC_FIXED
base = steady(unit(markup=0.0, **N), 12)["yld"]
step1 = steady(unit(markup=0.01, **N), 12)["yld"]          # 1%譲渡のみ
M.SPC_FIXED_TOTAL = M.SPC_FIXED + M.SPC_PERSONNEL
step2 = steady(unit(markup=0.01, **N), 12)["yld"]          # ＋人件費
print(f"\n要因分解（回転12ヶ月・定常利回り）")
print(f"  8/5版                    {pct(base)}")
print(f"  ＋1%譲渡マージン          {pct(step1)}  ({(step1-base)*100:+.2f}pt)")
print(f"  ＋人件費360万             {pct(step2)}  ({(step2-step1)*100:+.2f}pt)")

print()
print("=" * 74)
print("【感応度】ニュートラル・回転12ヶ月（定常利回り基準）")
print("=" * 74)
u0 = unit(**N)
b = steady(u0, 12)["yld"]
print(f"  基準                                       {pct(b)}")

rows = []
rows.append(("在庫回転期間 12→18ヶ月", steady(u0, 18)["yld"]))
rows.append(("売却価格 75→71.25（▲5%）", steady(unit(mkt_cost=50, price=71.25), 12)["yld"]))
M.LOSS_RATE = 0.08
rows.append(("滞留・ロス率 2%→8%", steady(u0, 12)["yld"]))
M.LOSS_RATE = 0.02
rows.append(("稼働率 85%→70%", steady(u0, 12, util=0.70)["yld"]))
rows.append(("仕入原価 50→45", steady(unit(mkt_cost=45, price=75), 12)["yld"]))
rows.append(("譲渡マージン 1%→2%", steady(unit(mkt_cost=50, price=75, markup=0.02), 12)["yld"]))
rows.append(("譲渡マージン 1%→0%（参考）", steady(unit(mkt_cost=50, price=75, markup=0.0), 12)["yld"]))
for name, v in rows:
    print(f"  {name:30s} {pct(v):>7s}  ({(v-b)*100:+.1f}pt)")

print()
print("=" * 74)
print("【稼働率と解約自由度】ニュートラル・回転12ヶ月")
print("=" * 74)
for util in (0.85, 0.80, 0.75, 0.70):
    r = steady(u0, 12, util=util)
    m = monthly(u0, 12, 3, util=util)
    print(f"  稼働率{util:.0%}  定常利回り {pct(r['yld']):>6s}   IRR(3年) {pct(m['irr']):>6s}")

print()
print("=" * 74)
print("【1%譲渡の金額イメージ】")
print("=" * 74)
for h in (9, 12, 15, 18):
    r = steady(u0, h)
    print(f"  回転{h:2d}ヶ月  年間SPC仕入 {oku(r['cogs']):>8s}  "
          f"うち実商品原価 {oku(r['cogs']/1.01):>8s}  "
          f"WineBank譲渡マージン {hyaku(r['transfer_margin']):>8s}")
print(f"\n  初回組成時：SPC払込5.00億 → 実商品原価 4.95億 ＋ 譲渡マージン 500万")
print(f"  （稼働率85%ベースでは 4.25億の仕入枠 → 実商品原価 {oku(4.25e8/1.01)} ＋ マージン {hyaku(4.25e8-4.25e8/1.01)}）")
