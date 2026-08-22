"""倉持案 v3 — 固定リターン型（保有期間だけで投資家の取り分を決める）

2026年8月21日の倉持氏からの提案。v2（利益配分型）から再度の全面変更。

  v2：販売価格 → 販売費 → 人件費 → 税前利益 → 在庫回転期間に応じたティア配分
      「共同事業みたいな感じだともろもろ数字がわかりにくい」

  v3：**保有期間だけで投資家の取り分を固定する。**
      WineBankの実際の販売利益や人件費は投資家のリターンに影響しない。
      簿価に対して +7.5% / +12.5% / +30%（2年目は25%案もあり）。
      WineBankがそれ以上で売れた部分はWineBankの収益となる。

基本構造：
  ・投資額 1億円。投資家がワイン現物を直接所有
  ・契約期間は最長2年
  ・**倉庫費・保険料は投資家が負担**し、投資家が倉庫と直接契約する
    （所有権に関わる権利を完全に保有し、WineBankの他の資産と混ざることを避ける）
  ・WineBankが調達・保管管理・販売実務を担当
  ・投資家は営業・価格交渉・受注・請求・回収を行わない
  ・自己利用は想定しない（倉持氏「こっちで飲むことは想定しなくて良い」）

販売方法は2案あり、経済条件はどちらも同じ。免許の整理がついたほうを採用する。
  A 委託販売型   … 投資家が所有したまま、WineBankが自己名義で顧客へ販売
  B 再買取型     … WineBankが投資家から簿価＋所定率で再取得し、自社商品として販売

投資家の指標は **IRR**（月次キャッシュフローから算出し年率換算）。
v1・v2で用いた「定常年間利回り」とは別物であるため、両者を混ぜないこと。
"""

# ───────────────────────────────────────────────── 前提
CAPITAL = 100_000_000          # 投資額（＝投資家の取得簿価）

# 保有期間に応じた投資家の取り分（簿価に対する上乗せ率）
TIERS_30 = ((6, 0.075), (12, 0.125), (24, 0.30))   # 2年目30%案
TIERS_25 = ((6, 0.075), (12, 0.125), (24, 0.25))   # 2年目25%案


def inv_rate(month, tiers=TIERS_30):
    """取得からの保有月数に対する投資家の上乗せ率。"""
    for lim, r in tiers:
        if month <= lim:
            return r
    return tiers[-1][1]


# 倉庫費・保険料（投資家負担）。倉持氏の提示前提。
CARRY_Y1 = 1_600_000           # 1年目 160万円
CARRY_Y2 =   800_000           # 2年目  80万円

# ─────────────────────────── WineBank側の販売前提（model.py と同じ置き方）
INVESTOR_COST_RATIO = 0.525    # 投資家の取得原価（定価比）＝市中原価50.0 × 1.05
SELL_RATIO          = 0.75     # 売値（定価比）＝ B2B70 と B2C80 の半々
VAR_RATE            = 0.0644   # 変動販売費（売上比）
LABOR_RATE          = 0.075    # 人件費（売上比）
APPRECIATION        = 0.06     # ワイン価格の年間上昇率
ACQ_MARKUP          = 0.05     # 取得時にWineBankが得るマージン


# ───────────────────────────────────────────────── 売却ペース
def pace(y1, y2=None, months=24):
    """月次の売却割合（簿価ベース）を返す。y1・y2は各年の売却比率。"""
    y2 = (1 - y1) if y2 is None else y2
    s = [0.0] * (months + 1)
    for m in range(1, 13):
        s[m] += y1 / 12.0
    for m in range(13, 25):
        s[m] += y2 / 12.0
    return s


PACES = {
    "1年以内に100%売却":      pace(1.00, 0.00),
    "1年目80%・2年目20%":     pace(0.80, 0.20),
    "1年目50%・2年目50%":     pace(0.50, 0.50),
    "1年目30%・2年目70%":     pace(0.30, 0.70),
}


# ───────────────────────────────────────────────── IRR
def irr_monthly(flows, lo=-0.5, hi=0.5, iters=300):
    """月次キャッシュフローの内部収益率（月次）。flows[0] が初期投資。"""
    def npv(r):
        return sum(f / (1 + r) ** i for i, f in enumerate(flows))
    if npv(lo) * npv(hi) > 0:
        return float("nan")
    for _ in range(iters):
        mid = (lo + hi) / 2
        if npv(lo) * npv(mid) <= 0:
            hi = mid
        else:
            lo = mid
    return (lo + hi) / 2


def annualize(rm):
    """月次利率を年率に換算する。"""
    return (1 + rm) ** 12 - 1


# ───────────────────────────────────────── 投資家サイド
def investor(sale, tiers=TIERS_30, capital=CAPITAL,
             carry_y1=CARRY_Y1, carry_y2=CARRY_Y2, carry_actual=False):
    """投資家の月次キャッシュフローとIRR。

    carry_actual=True のときは、倉庫費・保険料を「その月の残存在庫に比例」で
    計上する（倉持氏提示の年額固定ではなく、実態に即した置き方）。
    """
    months = len(sale) - 1
    flows = [-float(capital)]
    remain = 1.0
    recv_total = carry_total = 0.0
    detail = []

    for m in range(1, months + 1):
        book = capital * sale[m]                 # その月に売却される簿価
        r    = inv_rate(m, tiers)
        recv = book * (1 + r)                    # 投資家が受け取る精算額

        base = carry_y1 if m <= 12 else carry_y2
        if remain <= 1e-9:
            carry = 0.0                          # 在庫が無くなれば発生しない
        elif carry_actual:
            # 平均在庫（月初と月末の平均）に対して年率で按分
            carry = base / 12.0 * (remain - sale[m] / 2)
        else:
            carry = base / 12.0

        remain -= sale[m]
        flows.append(recv - carry)
        recv_total += recv
        carry_total += carry
        detail.append(dict(m=m, book=book, rate=r, recv=recv, carry=carry))

    rm = irr_monthly(flows)
    return dict(flows=flows, irr=annualize(rm), irr_m=rm,
                recv=recv_total, carry=carry_total,
                profit=recv_total - capital - carry_total,
                detail=detail,
                avg_hold=sum(m * sale[m] for m in range(1, months + 1)))


# ───────────────────────────────────────── WineBankサイド
def winebank(sale, tiers=TIERS_30, capital=CAPITAL, appreciation=APPRECIATION,
             discount=0.0, var_rate=VAR_RATE, labor_rate=LABOR_RATE):
    """WineBank側の損益。投資家への支払を差し引いた後の粗利。"""
    months = len(sale) - 1
    rrp_total = capital / INVESTOR_COST_RATIO      # 簿価1億円の定価換算額
    sales = pay = var = labor = 0.0

    for m in range(1, months + 1):
        if sale[m] == 0:
            continue
        rrp   = rrp_total * sale[m]
        price = rrp * SELL_RATIO * (1 + appreciation) ** (m / 12.0) * (1 - discount)
        sales += price
        var   += price * var_rate
        labor += price * labor_rate
        pay   += capital * sale[m] * (1 + inv_rate(m, tiers))

    margin = capital / (1 + ACQ_MARKUP) * ACQ_MARKUP   # 取得時マージン（初回のみ）
    gross  = sales - pay - var - labor
    return dict(sales=sales, pay=pay, var=var, labor=labor,
                gross=gross, margin=margin, total=gross + margin)


def oku(x):  return f"{x/100_000_000:,.2f}億"
def man(x):  return f"{x/10_000:,.0f}万"
def pct(x):  return f"{x*100:,.1f}%"


W = 100

if __name__ == "__main__":
    print("=" * W)
    print("【倉持案 v3】固定リターン型　投資額1億円・契約期間 最長2年")
    print("=" * W)
    print(f"  投資家の取り分   6ヶ月以内 +7.5% ／ 7〜12ヶ月 +12.5% ／ 13〜24ヶ月 +30%（25%案あり）")
    print(f"  倉庫費・保険料   投資家負担。1年目 {CARRY_Y1/1e4:,.0f}万円 ／ 2年目 {CARRY_Y2/1e4:,.0f}万円")
    print(f"  投資家の指標     IRR（月次キャッシュフローから算出・年率換算）")

    for label, tiers in (("2年目30%案", TIERS_30), ("2年目25%案", TIERS_25)):
        print()
        print("=" * W)
        print(f"【投資家IRR】{label}　倉庫費は倉持氏提示の年額固定")
        print("=" * W)
        print(" 売却ペース                 平均保有  受取総額    倉庫費   純利益     IRR（年率）")
        for name, s in PACES.items():
            v = investor(s, tiers)
            print(f" {name:24s} {v['avg_hold']:5.1f}ヶ月 {man(v['recv']):>9s}円 "
                  f"{man(v['carry']):>7s}円 {man(v['profit']):>8s}円 {pct(v['irr']):>10s}")

    print()
    print("=" * W)
    print("【投資家IRR】倉庫費を残存在庫に比例させた場合（2年目30%案）")
    print("=" * W)
    print(" 売却ペース                 倉庫費（実態）  純利益     IRR（年率）  年額固定との差")
    for name, s in PACES.items():
        a = investor(s, TIERS_30, carry_actual=True)
        b = investor(s, TIERS_30)
        print(f" {name:24s} {man(a['carry']):>11s}円 {man(a['profit']):>8s}円 "
              f"{pct(a['irr']):>10s} {(a['irr']-b['irr'])*100:+9.2f}pt")

    print()
    print("=" * W)
    print("【WineBank側の損益】2年目30%案・ニュートラル（上昇6%・値引きなし）")
    print("=" * W)
    print(" 売却ペース                 顧客への売上  投資家への支払  変動販売費   人件費   "
          "WB粗利   取得マージン  WB合計")
    for name, s in PACES.items():
        w = winebank(s, TIERS_30)
        print(f" {name:24s} {oku(w['sales']):>9s}円 {oku(w['pay']):>11s}円 "
              f"{man(w['var']):>9s}円 {man(w['labor']):>7s}円 {man(w['gross']):>8s}円 "
              f"{man(w['margin']):>9s}円 {man(w['total']):>8s}円")

    print()
    print("=" * W)
    print("【WineBank側の下振れ耐性】2年目30%案・WB合計（取得マージン込み）")
    print("=" * W)
    cases = [("上昇6%・値引きなし", 0.06, 0.00),
             ("上昇0%・値引きなし", 0.00, 0.00),
             ("上昇6%・値引き5%",   0.06, 0.05),
             ("上昇0%・値引き5%",   0.00, 0.05)]
    print(" 売却ペース              " + "".join(f"{c[0]:>20s}" for c in cases))
    for name, s in PACES.items():
        row = "".join(f"{man(winebank(s, TIERS_30, appreciation=a, discount=d)['total'])+'円':>20s}"
                      for _, a, d in cases)
        print(f" {name:22s}{row}")

    print()
    print("=" * W)
    print("【WineBank側の下振れ耐性】2年目25%案・WB合計（取得マージン込み）")
    print("=" * W)
    print(" 売却ペース              " + "".join(f"{c[0]:>20s}" for c in cases))
    for name, s in PACES.items():
        row = "".join(f"{man(winebank(s, TIERS_25, appreciation=a, discount=d)['total'])+'円':>20s}"
                      for _, a, d in cases)
        print(f" {name:22s}{row}")

    print()
    print("=" * W)
    print("【投資家とWineBankの取り分】2年目30%案・ニュートラル")
    print("=" * W)
    print(" 売却ペース                 投資家 純利益   WineBank 合計   投資家:WB")
    for name, s in PACES.items():
        v = investor(s, TIERS_30)
        w = winebank(s, TIERS_30)
        tot = v["profit"] + w["total"]
        print(f" {name:24s} {man(v['profit']):>9s}円 {man(w['total']):>11s}円 "
              f"{v['profit']/tot*100:>7.0f}:{w['total']/tot*100:.0f}")

    print()
    print("=" * W)
    print("【参考】v2（利益配分型・在庫回転12ヶ月）との比較")
    print("=" * W)
    v = investor(PACES["1年以内に100%売却"], TIERS_30)
    w = winebank(PACES["1年以内に100%売却"], TIERS_30)
    print(f"  v3 1年以内に100%売却  投資家 純利益 {man(v['profit'])}円（IRR {pct(v['irr'])}）"
          f"  WineBank {man(w['total'])}円")
    print(f"  v2 在庫回転12ヶ月      投資家 取分   1,434万円（年率 14.3%）  WineBank 3,046万円")
    print(f"  ※ v2は1億円が通年で拘束される前提の定常利回り。v3のIRRは資金が毎月戻る前提の")
    print(f"     内部収益率であり、同じ土俵の数字ではない。絶対額では v3 のほうが小さい。")


# ═══════════════════════════════════════ 追加検証（設計上の勘所）
def residual_pace(y1, y2, months=24):
    """1年目y1・2年目y2を売り切り、残り(1-y1-y2)が24ヶ月時点で売れ残るペース。"""
    s = [0.0] * (months + 1)
    for m in range(1, 13):
        s[m] += y1 / 12.0
    for m in range(13, 25):
        s[m] += y2 / 12.0
    return s, 1.0 - y1 - y2


def wb_breakeven_y2(tiers=TIERS_30, appreciation=APPRECIATION, discount=0.0):
    """1年目の売却比率を振り、WineBank合計がゼロになる2年目の比率を探す。
    （1年目 + 2年目 = 100% を前提とする）"""
    out = []
    for y1 in (1.0, 0.8, 0.6, 0.5, 0.4, 0.3, 0.2, 0.0):
        w = winebank(pace(y1, 1 - y1), tiers, appreciation=appreciation, discount=discount)
        out.append((y1, w["total"]))
    return out


def _extra():
    print()
    print("=" * W)
    print("【投資家から見たIRRと実額の対比】2年目30%案・ニュートラル")
    print("=" * W)
    print("  IRRは「戻った資金を同じ利回りで再投資できる」前提の指標。契約期間は最長2年で")
    print("  再投資先が用意されないため、実際の手取りは下の純利益の欄になる。")
    print()
    print(" 売却ペース                 平均保有  IRR（年率）  純利益（2年通算）  1億円に対する単純利回り")
    for name, s in PACES.items():
        v = investor(s, TIERS_30)
        yrs = max(v["avg_hold"] / 12.0, 1e-9)
        print(f" {name:24s} {v['avg_hold']:5.1f}ヶ月 {pct(v['irr']):>10s} "
              f"{man(v['profit']):>14s}円 {pct(v['profit']/CAPITAL):>18s}")

    print()
    print("=" * W)
    print("【WineBankの損益分岐点】2年目の売却比率をどこまで許容できるか（WB合計＝0）")
    print("=" * W)
    for label, tiers in (("2年目30%案", TIERS_30), ("2年目25%案", TIERS_25)):
        print(f"\n  --- {label} ---")
        for cname, a, d in (("上昇6%・値引きなし", 0.06, 0.0),
                            ("上昇0%・値引きなし", 0.00, 0.0),
                            ("上昇0%・値引き5%",   0.00, 0.05)):
            rows = wb_breakeven_y2(tiers, appreciation=a, discount=d)
            neg = [f"{y1:.0%}" for y1, t in rows if t < 0]
            edge = next((f"1年目{y1:.0%}" for y1, t in rows if t < 0), "なし")
            print(f"    {cname:20s} WB赤字となる1年目売却比率: "
                  f"{('・'.join(neg) if neg else 'なし（全域で黒字）')}")

    print()
    print("=" * W)
    print("【24ヶ月時点で売れ残った場合】WineBankが簿価＋所定率で引き取る義務を負う場合の負担")
    print("=" * W)
    print("  残存比率  簿価         WineBankの支払（＋30%）  同（＋25%）   引き取る在庫の想定売値")
    rrp_total = CAPITAL / INVESTOR_COST_RATIO
    for res in (0.05, 0.10, 0.20, 0.30):
        book = CAPITAL * res
        price = rrp_total * res * SELL_RATIO * (1 + APPRECIATION) ** 2
        print(f"    {res:5.0%}  {man(book):>9s}円 {man(book*1.30):>18s}円 "
              f"{man(book*1.25):>11s}円 {man(price):>15s}円")
    print()
    print("  ※ 引き取った在庫はWineBankの資産として残るため即時の損失ではない。ただし")
    print("     取得原価が押し上がるため、その後に売り切れるかは価格前提次第となる。")
    print()
    print("   引き取り率   取得原価(定価比)   2年後の売値   手取り(費用13.94%控除後)   単位粗利")
    for rate in (0.30, 0.25):
        cost = INVESTOR_COST_RATIO * 100 * (1 + rate)
        for appr_r, tag in ((APPRECIATION, "上昇6%"), (0.0, "上昇0%")):
            price = SELL_RATIO * 100 * (1 + appr_r) ** 2
            net   = price * (1 - VAR_RATE - LABOR_RATE)
            g     = net - cost
            mark  = "  ★逆ざや" if g < 0 else ""
            print(f"     ＋{rate:.0%} {tag:>8s} {cost:>12.2f} {price:>14.2f} "
                  f"{net:>20.2f} {g:>+11.2f}{mark}")
    print()
    print("     上昇6%が続けば薄いながら黒字だが、横ばいだと引き取った時点で逆ざやとなる。")


if __name__ == "__main__":
    _extra()


# ═══════════════════════════════════════ 提案資料（PPTX）向けのJSON書き出し
def export_json(path="kuramochi_fixed.json"):
    """build_kuramochi3.js が読み込む数値一式を書き出す。"""
    import json

    def pace_block(name, y1, y2, tiers):
        s = pace(y1, y2)
        v = investor(s, tiers)
        w = winebank(s, tiers)
        return dict(name=name, y1=y1, y2=y2,
                    avg_hold=v["avg_hold"], recv=v["recv"], carry=v["carry"],
                    profit=v["profit"], irr=v["irr"],
                    simple=v["profit"] / CAPITAL,
                    wb_sales=w["sales"], wb_pay=w["pay"], wb_var=w["var"],
                    wb_labor=w["labor"], wb_gross=w["gross"],
                    wb_margin=w["margin"], wb_total=w["total"])

    SET = (("1年以内に100%売却", 1.00, 0.00),
           ("1年目80%・2年目20%", 0.80, 0.20),
           ("1年目50%・2年目50%", 0.50, 0.50),
           ("1年目30%・2年目70%", 0.30, 0.70))

    s_main = pace(0.80, 0.20)
    v_main = investor(s_main, TIERS_30)
    sched = [dict(m=d["m"], book=d["book"], rate=d["rate"],
                  recv=d["recv"], carry=d["carry"])
             for d in v_main["detail"] if d["book"] > 0]

    cases = (("上昇6%・値引きなし", 0.06, 0.00),
             ("上昇0%・値引きなし", 0.00, 0.00),
             ("上昇6%・値引き5%",   0.06, 0.05),
             ("上昇0%・値引き5%",   0.00, 0.05))

    def residual(rate):
        cost = INVESTOR_COST_RATIO * 100 * (1 + rate)
        out = []
        for a, tag in ((APPRECIATION, "上昇6%"), (0.0, "上昇0%")):
            price = SELL_RATIO * 100 * (1 + a) ** 2
            net = price * (1 - VAR_RATE - LABOR_RATE)
            out.append(dict(tag=tag, cost=cost, price=price, net=net, gross=net - cost))
        return out

    data = dict(
        capital=CAPITAL, carry_y1=CARRY_Y1, carry_y2=CARRY_Y2, term_months=24,
        tiers30=[dict(lim=l, rate=r) for l, r in TIERS_30],
        tiers25=[dict(lim=l, rate=r) for l, r in TIERS_25],
        acq_markup=ACQ_MARKUP, appreciation=APPRECIATION,
        var_rate=VAR_RATE, labor_rate=LABOR_RATE,
        cost_ratio=INVESTOR_COST_RATIO * 100, sell_ratio=SELL_RATIO * 100,
        rrp_total=CAPITAL / INVESTOR_COST_RATIO,
        paces30=[pace_block(n, a, b, TIERS_30) for n, a, b in SET],
        paces25=[pace_block(n, a, b, TIERS_25) for n, a, b in SET],
        schedule=sched,
        carry_actual=[dict(name=n,
                           carry=investor(pace(a, b), TIERS_30, carry_actual=True)["carry"],
                           irr=investor(pace(a, b), TIERS_30, carry_actual=True)["irr"])
                      for n, a, b in SET],
        downside30=[dict(name=n, vals=[winebank(pace(a, b), TIERS_30,
                                                appreciation=ap, discount=di)["total"]
                                       for _, ap, di in cases]) for n, a, b in SET],
        downside25=[dict(name=n, vals=[winebank(pace(a, b), TIERS_25,
                                                appreciation=ap, discount=di)["total"]
                                       for _, ap, di in cases]) for n, a, b in SET],
        case_labels=[c[0] for c in cases],
        residual30=residual(0.30), residual25=residual(0.25),
        residual_cost=[dict(res=r, book=CAPITAL * r,
                            pay30=CAPITAL * r * 1.30, pay25=CAPITAL * r * 1.25)
                       for r in (0.05, 0.10, 0.20)],
        v2=dict(investor=14_340_000, yld=0.143, wb=30_460_000),
    )
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=1)
    print(f"written: {path}")
