"""WineBank ワインファンドSPC 収益モデル

販売チャネルをB2B（酒販店卸）とB2C（自社EC・オークション）に分け、
チャネルごとに売値と変動販売費を持たせる。

  B2B 酒販店卸        売値 定価比70  変動販売費 売上の 1.0%（掛売・ケース単位出荷）
  B2C ネット最安値     売値 定価比80  変動販売費 売上の11.2%（決済・モール手数料・個口配送）

主線は両者を半々とし、加重平均で売値75・変動販売費6.44%となる。
"""

# ---------------------------------------------------------------- 基本前提
CAPITAL      = 500_000_000  # 投資枠
UTIL         = 0.95         # 稼働率（現金は5%。残り95%をワイン購入に充当）
RAMP_MONTHS  = 6            # 仕入展開期間
MARKUP       = 0.01         # WineBank -> SPC 現物譲渡時の付加率
TERM_YEARS   = 5            # 運用期間
LOT_RRP      = 1_000_000    # 1ロット = 定価100万円相当（平均定価25,000円なら約40本）

# ワイン価格の年間上昇率。保有期間中に価格帯全体（希望小売・ネット最安・卸値）が
# 連動して上昇するため、取得原価は据え置きのまま売値だけが上がる。
# 会社資料ではFine Wineのリセールバリューを年率10%程度としているが、
# 保守的に6%を主線とする。
APPRECIATION = 0.06


def appr(hold_months, rate=None):
    """保有期間ぶんの価格上昇倍率。"""
    r = APPRECIATION if rate is None else rate
    return (1 + r) ** (hold_months / 12.0)

# --- 共通費用 -------------------------------------------------------------
STORAGE_PER_LOT_YEAR = 7_500    # 定温倉庫 保管料 円/ロット/年（月約16円/本）
INSURANCE_RATE       = 0.0015   # 動産総合保険 平均在庫簿価に対する年率
INBOUND_PER_LOT      = 320      # 入庫・検品 円/ロット

SPC_MAINTENANCE = 2_000_000     # SPC維持費（税務・事務受託・法務／監査費用を除く）
SPC_PERSONNEL   = 3_600_000     # SPC運営に係るWineBank側の実務人件費
SPC_FIXED_TOTAL = SPC_MAINTENANCE + SPC_PERSONNEL

# --- チャネル別 変動販売費（売上比） -------------------------------------
#   B2B : 出庫・配送 0.6% ＋ 決済・与信（貸倒引当）0.4%
#   B2C : 出庫・梱包・クール便 2.5% ＋ カード決済 3.2% ＋ モール／出品手数料 5.5%
RATE_B2B = 0.010
RATE_B2C = 0.112

# 滞留・破損ロスは動産総合保険で全量カバーするため、費用として別途計上しない。

SCENARIOS = {
    # name: 市中仕入原価, B2B売値, B2C売値, B2B構成比
    "ニュートラル": dict(mkt_cost=50.0, p_b2b=70.00, p_b2c=80.00, mix_b2b=0.50),
    "ポジティブ":   dict(mkt_cost=40.0, p_b2b=70.00, p_b2c=80.00, mix_b2b=0.00),
    "ネガティブ":   dict(mkt_cost=50.0, p_b2b=66.50, p_b2c=76.00, mix_b2b=0.50),
}


def unit(mkt_cost, p_b2b, p_b2c, mix_b2b, markup=MARKUP,
         rate_b2b=None, rate_b2c=None):
    """定価100あたりの単位経済。"""
    rb, rc = (RATE_B2B if rate_b2b is None else rate_b2b,
              RATE_B2C if rate_b2c is None else rate_b2c)
    mix_c = 1 - mix_b2b
    spc_cost = mkt_cost * (1 + markup)
    price = mix_b2b * p_b2b + mix_c * p_b2c            # 加重平均売値
    var   = mix_b2b * p_b2b * rb + mix_c * p_b2c * rc  # 加重平均 変動販売費
    net   = price - var                                # 手取り
    return dict(
        mkt_cost=mkt_cost, spc_cost=spc_cost, transfer=spc_cost - mkt_cost,
        p_b2b=p_b2b, p_b2c=p_b2c, mix_b2b=mix_b2b,
        net_b2b=p_b2b * (1 - rb), net_b2c=p_b2c * (1 - rc),
        price=price, var=var, var_rate=var / price, net=net,
        gross=net - spc_cost, gm=(net - spc_cost) / price,
        roic=(net - spc_cost) / spc_cost,
        mult=price / spc_cost,               # 売上 / SPC取得原価
        lot_cost=spc_cost / 100 * LOT_RRP,
    )


# ------------------------------ 保有期間を織り込んだ単位経済（定価100あたり）
def unit_held(u, hold_months, rate=None):
    """取得時の定価を100としたときの、売却時点の売値・手取り・粗利。"""
    k = appr(hold_months, rate)
    price = u["price"] * k
    var   = u["var"] * k
    net   = price - var
    return dict(k=k, price=price, var=var, net=net,
                gross=net - u["spc_cost"], gm=(net - u["spc_cost"]) / price,
                spc_cost=u["spc_cost"])


# ------------------------------------------------------ 定常（年間）実力値
def steady(u, hold_months, capital=CAPITAL, util=UTIL, rate=None):
    book  = capital * util
    turns = 12.0 / hold_months
    cogs  = book * turns
    sales = cogs * u["mult"] * appr(hold_months, rate)
    lots_held = book / u["lot_cost"]
    lots_year = cogs / u["lot_cost"]
    cost = dict(
        storage   = lots_held * STORAGE_PER_LOT_YEAR,
        insurance = book * INSURANCE_RATE,
        inbound   = lots_year * INBOUND_PER_LOT,
        selling   = sales * u["var_rate"],
        fixed     = SPC_FIXED_TOTAL,
    )
    total  = sum(cost.values())
    pretax = (sales - cogs) - total
    return dict(turns=turns, sales=sales, cogs=cogs, gross=sales - cogs,
                cost=cost, spc_cost_total=total, pretax=pretax,
                investor=pretax / 2, yld=(pretax / 2) / capital,
                transfer_margin=cogs / u["spc_cost"] * u["transfer"])


# ------------------------------------------------ 月次キャッシュフローモデル
def monthly(u, hold_months, years=TERM_YEARS, capital=CAPITAL, util=UTIL,
            ramp=RAMP_MONTHS, rate=None):
    T = int(years * 12)
    book  = capital * util
    batch = book / ramp
    mult  = u["mult"] * appr(hold_months, rate)   # 保有期間ぶんの値上がりを含む

    open_batches = []
    sales_m = [0.0] * (T + 1)
    cogs_m  = [0.0] * (T + 1)
    cost_m  = [0.0] * (T + 1)
    inventory = 0.0

    for m in range(1, T + 1):
        for sell_m, amt in [b for b in open_batches if b[0] == m]:
            open_batches.remove((sell_m, amt))
            sales_m[m] += amt * mult
            cogs_m[m]  += amt
            inventory  -= amt

        buy = (batch if m <= ramp else 0.0) + cogs_m[m]
        if buy > 0 and m + hold_months <= T:
            open_batches.append((m + hold_months, buy))
            inventory += buy
            cost_m[m] += (buy / u["lot_cost"]) * INBOUND_PER_LOT

        cost_m[m] += (inventory / u["lot_cost"]) * STORAGE_PER_LOT_YEAR / 12
        cost_m[m] += inventory * INSURANCE_RATE / 12
        cost_m[m] += sales_m[m] * u["var_rate"]
        cost_m[m] += SPC_FIXED_TOTAL / 12

    # 半期ごとの税前利益を折半して分配
    flows, carry = [-capital], 0.0
    for h in range(1, int(years * 2) + 1):
        a, b = (h - 1) * 6 + 1, h * 6
        carry += sum(sales_m[a:b + 1]) - sum(cogs_m[a:b + 1]) - sum(cost_m[a:b + 1])
        payout = max(carry, 0.0) / 2
        carry -= payout * 2
        flows.append(payout)
    flows[-1] += capital

    dist = sum(flows[1:]) - capital
    return dict(flows=flows, total_sales=sum(sales_m), total_cogs=sum(cogs_m),
                total_cost=sum(cost_m), total_distributed=dist,
                avg_yield=dist / capital / years,
                turns_realized=sum(cogs_m) / book)


def oku(x):   return f"{x/100_000_000:,.2f}億"
def hyaku(x): return f"{x/1_000_000:,.0f}百万"
def pct(x):   return f"{x*100:,.1f}%"


if __name__ == "__main__":
    print("=" * 92)
    print("【チャネル別 単位経済】定価100あたり")
    print("=" * 92)
    u = unit(**SCENARIOS["ニュートラル"])
    print(f"  B2B 酒販店卸    売値 {u['p_b2b']:5.2f}  変動販売費 {RATE_B2B*100:4.1f}%"
          f"  →  手取り {u['net_b2b']:5.2f}")
    print(f"  B2C ネット最安   売値 {u['p_b2c']:5.2f}  変動販売費 {RATE_B2C*100:4.1f}%"
          f"  →  手取り {u['net_b2c']:5.2f}")
    print(f"  半々の加重平均   売値 {u['price']:5.2f}  変動販売費 {pct(u['var_rate'])}"
          f"  →  手取り {u['net']:5.2f}")

    print()
    print("=" * 92)
    print("【単位経済】3シナリオ")
    print("=" * 92)
    for name, sc in SCENARIOS.items():
        u = unit(**sc)
        print(f"{name:8s} 市中{u['mkt_cost']:5.2f} +1%={u['spc_cost']:5.2f} "
              f"売値{u['price']:5.2f} 変動費{u['var']:5.2f}({pct(u['var_rate'])}) "
              f"手取り{u['net']:5.2f} 粗利{u['gross']:5.2f} 粗利率{pct(u['gm'])} "
              f"投下原価利益率{pct(u['roic'])}")

    print()
    print("=" * 92)
    print(f"【定常年間実力値】投資枠5億・稼働率{UTIL:.0%}")
    print("=" * 92)
    for name, sc in SCENARIOS.items():
        u = unit(**sc)
        print(f"\n--- {name} ---")
        print(" 回転  年間売上   年間粗利   SPC費用   税前利益   投資家配当  定常利回り")
        for h in (9, 12, 15, 18):
            r = steady(u, h)
            print(f"{h:3d}ヶ月 {oku(r['sales']):>9s} {oku(r['gross']):>9s} "
                  f"{hyaku(r['spc_cost_total']):>8s} {oku(r['pretax']):>9s} "
                  f"{hyaku(r['investor']):>10s} {pct(r['yld']):>9s}")

    print()
    print("=" * 92)
    print(f"【通算リターン】運用期間{TERM_YEARS}年")
    print("=" * 92)
    for name, sc in SCENARIOS.items():
        u = unit(**sc)
        print(f"\n--- {name} ---")
        for h in (9, 12, 15, 18):
            r = monthly(u, h)
            print(f"{h:3d}ヶ月  累計分配 {hyaku(r['total_distributed']):>9s}  "
                  f"年平均利回り {pct(r['avg_yield']):>7s}  "
                  f"実現回転 {r['turns_realized']:.2f}回")

    print()
    print("=" * 92)
    print("【SPC費用の内訳】ニュートラル・回転12ヶ月")
    print("=" * 92)
    u = unit(**SCENARIOS["ニュートラル"])
    r = steady(u, 12)
    names = {"storage": "保管（定温倉庫）", "insurance": "動産総合保険",
             "inbound": "入庫・検品", "selling": "変動販売費（B2B/B2C加重）",
             "fixed": "SPC固定費（維持費200万＋人件費360万）"}
    for k, v in r["cost"].items():
        print(f"  {names[k]:32s} {v:>13,.0f} 円  （売上比 {v/r['sales']*100:5.2f}%）")
    print(f"  {'合計':32s} {r['spc_cost_total']:>13,.0f} 円  "
          f"（売上比 {r['spc_cost_total']/r['sales']*100:5.2f}%）")
    print(f"\n  参考：WineBankが受け取る譲渡マージン（年） {r['transfer_margin']:>12,.0f} 円")
    print(f"  参考：平均在庫 {r['cogs']/12*0+CAPITAL*UTIL:,.0f} 円 "
          f"＝ 約{CAPITAL*UTIL/u['lot_cost']:,.0f}ロット（定価換算 約"
          f"{CAPITAL*UTIL/u['lot_cost']*LOT_RRP/1e8:.1f}億円）")
