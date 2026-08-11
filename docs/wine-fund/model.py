"""WineBank ワインファンドSPC 収益モデル（2026/08/11 改訂版）

改訂点:
  1) SPC維持費に WineBank人件費 年360万円 を付加（年800万 -> 年1,160万）
  2) WineBank -> SPC への現物譲渡時に 1% を付加
     （SPCの取得原価 = 市中仕入原価 x 1.01。5億の払込に対し実商品原価4.95億）
"""

# ---------------------------------------------------------------- 基本前提
CAPITAL      = 500_000_000   # 投資枠
UTIL         = 0.85          # 稼働率（残りは運転資金・解約準備の現金）
RAMP_MONTHS  = 6             # 仕入展開期間
MARKUP       = 0.01          # WineBank -> SPC 譲渡時の付加率
LOT_RRP      = 1_000_000     # 1ロット = 定価100万円相当

STORAGE_PER_LOT_YEAR = 7_500 # 保管・保険 円/ロット/年
LOGI_PER_LOT         = 640   # 物流・入出庫・検品 円/ロット（往復）
FEE_RATE             = 0.010 # 決済・出品手数料・送料（売上比）
LOSS_RATE            = 0.020 # 滞留・値引き・破損ロス（売上比）
SPC_FIXED            = 8_000_000    # SPC維持費（監査・税務・事務・法務）
SPC_PERSONNEL        = 3_600_000    # ★追加：WineBank人件費（SPC負担分）
SPC_FIXED_TOTAL      = SPC_FIXED + SPC_PERSONNEL

SCENARIOS = {
    "ニュートラル": dict(mkt_cost=50.0, price=75.00),
    "ポジティブ":   dict(mkt_cost=40.0, price=80.00),
    "ネガティブ":   dict(mkt_cost=50.0, price=71.25),
}


def unit(mkt_cost, price, markup=MARKUP):
    """定価100あたりの単位経済。"""
    spc_cost = mkt_cost * (1 + markup)      # SPCの取得原価
    return dict(
        mkt_cost=mkt_cost,
        spc_cost=spc_cost,
        transfer=spc_cost - mkt_cost,       # WineBankの譲渡マージン
        price=price,
        gross=price - spc_cost,
        gm=(price - spc_cost) / price,
        roic=(price - spc_cost) / spc_cost,
        mult=price / spc_cost,              # 売上 / SPC原価
        lot_cost=spc_cost / 100 * LOT_RRP,  # 1ロットあたりSPC取得原価(円)
    )


# ------------------------------------------------------ 定常（年間）実力値
def steady(u, hold_months, capital=CAPITAL, util=UTIL):
    book = capital * util                       # 常時在庫（SPC取得原価ベース）
    turns = 12.0 / hold_months
    cogs  = book * turns                        # 年間売上原価
    sales = cogs * u["mult"]
    gross = sales - cogs
    lots_held = book / u["lot_cost"]            # 平均在庫ロット数
    lots_year = cogs / u["lot_cost"]            # 年間取扱ロット数
    cost = dict(
        storage = lots_held * STORAGE_PER_LOT_YEAR,
        logi    = lots_year * LOGI_PER_LOT,
        fee     = sales * FEE_RATE,
        loss    = sales * LOSS_RATE,
        fixed   = SPC_FIXED_TOTAL,
    )
    total = sum(cost.values())
    pretax = gross - total
    return dict(turns=turns, sales=sales, cogs=cogs, gross=gross,
                cost=cost, spc_cost_total=total, pretax=pretax,
                investor=pretax / 2, yld=(pretax / 2) / capital,
                transfer_margin=cogs / u["spc_cost"] * u["transfer"])


# ------------------------------------------------ 月次キャッシュフローモデル
def monthly(u, hold_months, years, capital=CAPITAL, util=UTIL,
            ramp=RAMP_MONTHS):
    """在庫バッチを月次で追跡し、投資家の実キャッシュフローを組む。"""
    T = int(years * 12)
    book = capital * util
    batch = book / ramp                          # 各月の仕入額（SPC取得原価）
    lots_batch = batch / u["lot_cost"]

    inventory = 0.0                              # 在庫簿価
    lots = 0.0
    open_batches = []                            # (売却月, 原価)
    sales_m  = [0.0] * (T + 1)
    cogs_m   = [0.0] * (T + 1)
    cost_m   = [0.0] * (T + 1)
    buys_m   = [0.0] * (T + 1)

    def schedule_buy(m, amount):
        if amount <= 0:
            return
        sell_m = m + hold_months
        if sell_m > T:                           # 満期までに売り切れない仕入はしない
            return
        open_batches.append((sell_m, amount))
        buys_m[m] += amount

    for m in range(1, T + 1):
        # 売却
        due = [b for b in open_batches if b[0] == m]
        for sell_m, amt in due:
            open_batches.remove((sell_m, amt))
            sales_m[m] += amt * u["mult"]
            cogs_m[m]  += amt
            inventory  -= amt
            lots       -= amt / u["lot_cost"]
            cost_m[m]  += (amt / u["lot_cost"]) * LOGI_PER_LOT / 2   # 出庫分

        # 仕入（ランプアップ ＋ 売却代金の元本相当を再投資）
        buy = 0.0
        if m <= ramp:
            buy += batch
        buy += cogs_m[m]                         # 回収した元本を同額で再投下
        before = buys_m[m]
        schedule_buy(m, buy)
        actually = buys_m[m] - before
        if actually > 0:
            inventory += actually
            lots      += actually / u["lot_cost"]
            cost_m[m] += (actually / u["lot_cost"]) * LOGI_PER_LOT / 2  # 入庫分

        # 期中費用
        cost_m[m] += lots * STORAGE_PER_LOT_YEAR / 12
        cost_m[m] += sales_m[m] * (FEE_RATE + LOSS_RATE)
        cost_m[m] += SPC_FIXED_TOTAL / 12

    # 半期ごとの税前利益 -> 折半分配
    flows = [-capital]
    carry = 0.0
    for h in range(1, int(years * 2) + 1):
        a, b = (h - 1) * 6 + 1, h * 6
        profit = sum(sales_m[a:b + 1]) - sum(cogs_m[a:b + 1]) - sum(cost_m[a:b + 1])
        carry += profit
        payout = max(carry, 0.0) / 2             # 累損は繰越、黒字分のみ折半
        carry -= payout * 2
        flows.append(payout)
    flows[-1] += capital                          # 満期に元本償還

    tot_sales = sum(sales_m)
    tot_cogs  = sum(cogs_m)
    return dict(flows=flows, irr=irr(flows),
                total_sales=tot_sales, total_cogs=tot_cogs,
                total_cost=sum(cost_m),
                total_distributed=sum(flows[1:]) - capital,
                turns_realized=tot_cogs / book)


def irr(flows, period_per_year=2):
    """半期キャッシュフローから年率IRRを求める（二分法）。"""
    def npv(r):
        return sum(cf / (1 + r) ** i for i, cf in enumerate(flows))
    lo, hi = -0.9999, 10.0
    if npv(lo) * npv(hi) > 0:
        return float("nan")
    for _ in range(300):
        mid = (lo + hi) / 2
        if npv(lo) * npv(mid) <= 0:
            hi = mid
        else:
            lo = mid
    r = (lo + hi) / 2
    return (1 + r) ** period_per_year - 1


# --------------------------------------------------------------- 出力
def oku(x):  return f"{x/100_000_000:,.2f}億"
def hyaku(x): return f"{x/1_000_000:,.0f}百万"
def pct(x):  return f"{x*100:,.1f}%"

if __name__ == "__main__":
    print("=" * 78)
    print("【単位経済】定価100あたり（1%譲渡マージン反映後）")
    print("=" * 78)
    for name, s in SCENARIOS.items():
        u = unit(**s)
        print(f"{name:8s} 市中原価{u['mkt_cost']:5.2f} +1%={u['spc_cost']:5.2f} "
              f"売値{u['price']:5.2f} 粗利{u['gross']:5.2f} "
              f"粗利率{pct(u['gm'])} 投下原価利益率{pct(u['roic'])}")

    print()
    print("=" * 78)
    print("【定常年間実力値】投資枠5億・稼働率85%")
    print("=" * 78)
    for name, s in SCENARIOS.items():
        u = unit(**s)
        print(f"\n--- {name} ---")
        print(" 回転  年間売上   年間粗利   SPC費用   税前利益   投資家配当  定常利回り")
        for h in (9, 12, 15, 18):
            r = steady(u, h)
            print(f"{h:3d}ヶ月 {oku(r['sales']):>9s} {oku(r['gross']):>9s} "
                  f"{hyaku(r['spc_cost_total']):>8s} {oku(r['pretax']):>9s} "
                  f"{hyaku(r['investor']):>10s} {pct(r['yld']):>9s}")

    print()
    print("=" * 78)
    print("【投資家IRR】3年 / 5年")
    print("=" * 78)
    for name, s in SCENARIOS.items():
        u = unit(**s)
        print(f"\n--- {name} ---")
        for h in (9, 12, 15, 18):
            r3 = monthly(u, h, 3)
            r5 = monthly(u, h, 5)
            print(f"{h:3d}ヶ月  IRR(3年) {pct(r3['irr']):>7s}  IRR(5年) {pct(r5['irr']):>7s}"
                  f"   3年累計分配 {hyaku(r3['total_distributed']):>9s}"
                  f"  実現回転 {r3['turns_realized']:.2f}回")

    print()
    print("=" * 78)
    print("【SPC費用の内訳】ニュートラル・回転12ヶ月")
    print("=" * 78)
    u = unit(**SCENARIOS["ニュートラル"])
    r = steady(u, 12)
    for k, v in r["cost"].items():
        print(f"  {k:9s} {v:>14,.0f} 円")
    print(f"  {'合計':9s} {r['spc_cost_total']:>14,.0f} 円")
    print(f"  参考：WineBankが受け取る譲渡マージン（年） {r['transfer_margin']:>14,.0f} 円")
