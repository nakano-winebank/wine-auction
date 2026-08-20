"""倉持案 v2 — 直接所有・買戻し型（単独投資家・1億円）

2026年8月のMTGでスキームが全面的に入れ替わった。

  旧（v1）：GK-TKのSPCを組成し、投資家は匿名組合出資5億円。WineBankは現物を
            市中原価+1%でSPCへ譲渡。SPC税前利益を投資家とWineBankで折半。

  新（v2）：SPCを組成しない。WineBankが市中原価+5%で倉持氏の資産管理会社へ
            現物を売却し、投資家が自ら直接所有する（名義移転）。WineBankが
            顧客に販売する都度、投資家から買い戻す。売買差益は保有期間に応じた
            ティアでWineBankと投資家が配分する。

主な差分：
  ・出資 5億円 → 1億円（単独投資家）
  ・匿名組合出資 → 現物の直接所有（TKなし・SPCなし）
  ・譲渡マージン 1% → 売却マージン 5%（WineBankが取得時点で先取り）
  ・SPC関連費用（維持費200万・人件費360万・AUP50万・予備費50万＝計660万）は消滅
  ・代わりに販売経費として年1,000万円を計上（人件費を適正に反映させる趣旨）
  ・折半（50:50）固定 → 保有期間に応じたティア配分

費用の単価（保管・保険・入庫）と価格前提（定価比・値上がり6%）は model.py を流用する。
model.py 自体は山本案と共有のため変更しない。
"""
import model as M
from model import unit, appr

# ───────────────────────────────────────────────────── v2 の前提
CAPITAL          = 100_000_000   # 投資家の拠出額（単独）
MARKUP_SALE      = 0.05          # WineBank → 投資家資産管理会社への売却マージン
SELLING_EXPENSE  = 10_000_000    # 販売経費（年額・人件費込みの一括計上）
UTIL             = 0.95          # 稼働率。直接所有のため100%も選択肢（後段で併記）

# 保有期間に応じた WineBank の取り分。早期売却のインセンティブを持たせる設計。
#   〜6ヶ月 70% ／ 〜12ヶ月 60% ／ 18ヶ月未満 50% ／ 24ヶ月未満 40% ／ 24ヶ月〜 30%
TIERS = ((6, "以内", 0.70), (12, "以内", 0.60),
         (18, "未満", 0.50), (24, "未満", 0.40), (None, "〜", 0.30))


def wb_share(hold):
    """保有期間（月）に対する WineBank の取り分。"""
    if hold <= 6:  return 0.70
    if hold <= 12: return 0.60
    if hold < 18:  return 0.50
    if hold < 24:  return 0.40
    return 0.30


def tier_label(hold):
    if hold <= 6:  return "6ヶ月以内"
    if hold <= 12: return "12ヶ月以内"
    if hold < 18:  return "18ヶ月未満"
    if hold < 24:  return "24ヶ月未満"
    return "24ヶ月〜"


# ───────────────────────────────── 単位経済（定価100あたり・投資家の目線）
def unit_v2(scenario="ニュートラル", markup=MARKUP_SALE):
    """model.unit を流用しつつ、取得原価を市中原価+5%に置き換える。"""
    u = unit(**M.SCENARIOS[scenario], markup=markup)
    return u          # u["spc_cost"] が投資家の取得原価（市中原価×1.05）となる


def unit_v2_held(u, hold, rate=None):
    """保有期間ぶんの値上がりを織り込んだ、定価100あたりの売却時点の姿。"""
    k     = appr(hold, rate)
    price = u["price"] * k          # 売却時の売値（B2B70/B2C80の加重平均×上昇）
    var   = u["var"]   * k          # 変動販売費（売上比 6.44%）
    return dict(k=k, price=price, var=var, net=price - var,
                cost=u["spc_cost"],
                gross_gross=price - u["spc_cost"],   # 変動販売費 控除前
                gross_net=price - var - u["spc_cost"])  # 変動販売費 控除後


# ───────────────────────────────────────── 年間の定常実力値
def steady_v2(u, hold, capital=CAPITAL, util=UTIL, rate=None,
              selling_expense=SELLING_EXPENSE, var_in_expense=True):
    """直接所有スキームの年間損益。

    var_in_expense=True  … 「販売経費1,000万」に変動販売費が含まれる解釈（解釈A）
    var_in_expense=False … 変動販売費を売上比6.44%で別途計上する解釈（解釈B）
    """
    book      = capital * util                     # 在庫簿価（投資家の取得原価ベース）
    lot_cost  = u["spc_cost"] / 100 * M.LOT_RRP    # 1ロットの投資家簿価
    turns     = 12.0 / hold
    cogs      = book * turns
    sales     = cogs * u["mult"] * appr(hold, rate)

    cost = dict(
        storage   = book / lot_cost * M.STORAGE_PER_LOT_YEAR,
        insurance = book * M.INSURANCE_RATE,
        inbound   = cogs / lot_cost * M.INBOUND_PER_LOT,
        selling   = selling_expense,
    )
    if not var_in_expense:
        cost["variable"] = sales * u["var_rate"]

    total   = sum(cost.values())
    pretax  = (sales - cogs) - total
    ws      = wb_share(hold)
    investor = pretax * (1 - ws)
    # WineBankは①ティア配分ぶん と ②取得時に先取りした5%マージン を受け取る
    margin  = cogs / u["spc_cost"] * u["transfer"]

    return dict(turns=turns, sales=sales, cogs=cogs, gross=sales - cogs,
                cost=cost, cost_total=total, pretax=pretax,
                wb_share=ws, investor=investor, yld=investor / capital,
                wb_tier=pretax * ws, wb_margin=margin,
                wb_total=pretax * ws + margin,
                lots=book / lot_cost)


def oku(x):   return f"{x/100_000_000:,.2f}億"
def man(x):   return f"{x/10_000:,.0f}万"
def pct(x):   return f"{x*100:,.1f}%"


HOLDS = (6, 9, 12, 15, 18, 24, 30, 36)

if __name__ == "__main__":
    u = unit_v2()
    W = 100

    print("=" * W)
    print("【倉持案 v2】直接所有・買戻し型　単独投資家 1億円")
    print("=" * W)
    print(f"  取得       市中原価 {u['mkt_cost']:.2f} × (1+{MARKUP_SALE:.0%})"
          f" = 投資家取得原価 {u['spc_cost']:.2f}（定価比）")
    print(f"  WineBank先取り  売却マージン {u['transfer']:.2f}（定価100あたり）")
    print(f"  売却       B2B {u['p_b2b']:.0f} ／ B2C {u['p_b2c']:.0f} を半々"
          f" → 取得時の売値 {u['price']:.2f}／変動販売費率 {pct(u['var_rate'])}")
    print(f"  販売経費   年 {SELLING_EXPENSE/10_000:,.0f}万円（人件費込み・一括計上）")
    print(f"  稼働率     {UTIL:.0%}")

    print()
    print("=" * W)
    print("【単位経済】定価100あたり・保有12ヶ月")
    print("=" * W)
    h = unit_v2_held(u, 12)
    print(f"  投資家取得原価           {h['cost']:6.2f}")
    print(f"  取得時の売値             {u['price']:6.2f}")
    print(f"  保有12ヶ月の上昇         ×{h['k']:.3f}")
    print(f"  売却時の売値             {h['price']:6.2f}")
    print(f"  変動販売費               ▲{h['var']:5.2f}")
    print(f"  手取り                   {h['net']:6.2f}")
    print(f"  単位粗利（変動費控除後） {h['gross_net']:6.2f}"
          f"   投下原価利益率 {pct(h['gross_net']/h['cost'])}")
    print(f"  （参考）v1のSPC取得原価 50.50 に対し、v2は {h['cost']:.2f}。"
          f"取得原価が {h['cost']-50.50:+.2f} 上がるぶん投資家の利益は薄くなる。")

    for var_in, tag in ((True,  "解釈A：販売経費1,000万に変動販売費を含む"),
                        (False, "解釈B：変動販売費6.44%を別途計上する")):
        print()
        print("=" * W)
        print(f"【回転期間別の年間損益とティア配分】{tag}")
        print("=" * W)
        print(" 保有   ティア    WB率   年間売上   年間粗利   費用計   "
              "税前利益   投資家取分  投資家利回り  WB取分計")
        for hold in HOLDS:
            r = steady_v2(u, hold, var_in_expense=var_in)
            print(f"{hold:3d}ヶ月 {tier_label(hold):>10s} {r['wb_share']:5.0%} "
                  f"{oku(r['sales']):>9s} {oku(r['gross']):>9s} {man(r['cost_total']):>8s} "
                  f"{man(r['pretax']):>9s} {man(r['investor']):>10s} "
                  f"{pct(r['yld']):>11s} {man(r['wb_total']):>9s}")

    print()
    print("=" * W)
    print("【費用の内訳】主線・回転12ヶ月")
    print("=" * W)
    for var_in, tag in ((True, "解釈A"), (False, "解釈B")):
        r = steady_v2(u, 12, var_in_expense=var_in)
        names = {"storage": "保管（定温倉庫）", "insurance": "動産総合保険",
                 "inbound": "入庫・検品", "selling": "販売経費（人件費込み）",
                 "variable": "変動販売費（別途計上）"}
        print(f"  --- {tag} ---  在庫 {r['lots']:.0f}ロット")
        for k, v in r["cost"].items():
            print(f"    {names[k]:26s} {v/10_000:>8,.0f}万円 （売上比 {v/r['sales']*100:5.2f}%）")
        print(f"    {'合計':26s} {r['cost_total']/10_000:>8,.0f}万円 "
              f"（売上比 {r['cost_total']/r['sales']*100:5.2f}%）")

    print()
    print("=" * W)
    print("【ティア境界の不連続性】解釈A・境界の前後0.1ヶ月で比較")
    print("=" * W)
    print("  保有      WB率   税前利益   投資家取分  投資家利回り")
    for hold in (5.9, 6.1, 11.9, 12.1, 17.9, 18.1, 23.9, 24.1):
        r = steady_v2(u, hold)
        print(f" {hold:5.1f}ヶ月 {r['wb_share']:5.0%} {man(r['pretax']):>9s} "
              f"{man(r['investor']):>10s} {pct(r['yld']):>11s}")

    print()
    print("=" * W)
    print("【固定配分との比較】解釈A・投資家取分の比率を固定した場合の投資家利回り")
    print("=" * W)
    print(" 保有     ティア配分   投資家50%   投資家60%   投資家70%   投資家100%（配分なし）")
    for hold in HOLDS:
        r = steady_v2(u, hold)
        p = r["pretax"]
        print(f"{hold:3d}ヶ月 {pct(r['yld']):>11s} {pct(p*0.5/CAPITAL):>11s} "
              f"{pct(p*0.6/CAPITAL):>11s} {pct(p*0.7/CAPITAL):>11s} {pct(p/CAPITAL):>13s}")

    print()
    print("=" * W)
    print("【WineBankの取り分】解釈A・内訳")
    print("=" * W)
    print(" 保有   ティア配分ぶん   5%マージン   合計      うちマージン比率")
    for hold in HOLDS:
        r = steady_v2(u, hold)
        print(f"{hold:3d}ヶ月 {man(r['wb_tier']):>13s} {man(r['wb_margin']):>12s} "
              f"{man(r['wb_total']):>9s} {r['wb_margin']/r['wb_total']*100:>13.0f}%")

    print()
    print("=" * W)
    print("【稼働率の影響】解釈A・回転12ヶ月")
    print("=" * W)
    for util in (0.95, 1.00):
        r = steady_v2(u, 12, util=util)
        print(f"  稼働率 {util:.0%}  税前利益 {man(r['pretax'])}円  "
              f"投資家取分 {man(r['investor'])}円  投資家利回り {pct(r['yld'])}")

    print()
    print("=" * W)
    print("【3シナリオ】解釈A・回転12ヶ月")
    print("=" * W)
    for name in ("ネガティブ", "ニュートラル", "ポジティブ"):
        uu = unit_v2(name)
        r  = steady_v2(uu, 12)
        print(f"  {name:8s} 取得原価 {uu['spc_cost']:5.2f}  税前利益 {man(r['pretax']):>8s}円  "
              f"投資家利回り {pct(r['yld']):>7s}")

    print()
    print("=" * W)
    print("【値上がり率の影響】解釈A・回転12ヶ月")
    print("=" * W)
    for rate in (0.0, 0.06, 0.10):
        r = steady_v2(u, 12, rate=rate)
        print(f"  年{rate:.0%}  税前利益 {man(r['pretax']):>8s}円  "
              f"投資家利回り {pct(r['yld']):>7s}")

    print()
    print("=" * W)
    print("【自己利用特典の経済価値】")
    print("=" * W)
    lot_cost = u["spc_cost"] / 100 * M.LOT_RRP
    lots     = CAPITAL / lot_cost
    print(f"  拠出1億円 ＝ 定価換算 {CAPITAL/u['spc_cost']*100/1e8:.2f}億円相当"
          f"（{lots:.0f}ロット）")
    print(f"  平均定価25,000円/本とすると 約{CAPITAL/u['spc_cost']*100/25_000:,.0f}本")
    print(f"  取得原価は定価比 {u['spc_cost']:.2f} ＝ 希望小売100に対し {100-u['spc_cost']:.1f}%引き")
    print(f"  ネット最安 {u['p_b2c']:.0f} に対し {(1-u['spc_cost']/u['p_b2c'])*100:.1f}%引き")
    print(f"  酒販店卸 {u['p_b2b']:.0f} に対し {(1-u['spc_cost']/u['p_b2b'])*100:.1f}%引き")

    print()
    print("=" * W)
    print("【投資家利回り10% / 20% の分岐点】解釈A・ティア配分")
    print("=" * W)
    prev = None
    for i in range(30, 601):
        hold = i / 10
        y = steady_v2(u, hold)["yld"]
        if prev is not None:
            for target in (0.20, 0.10):
                if (prev[1] - target) * (y - target) < 0:
                    print(f"  {pct(target)} を跨ぐのは 保有 {prev[0]:.1f}〜{hold:.1f}ヶ月 "
                          f"（{pct(prev[1])} → {pct(y)}）")
        prev = (hold, y)


# ═══════════════════════════════════════════════ 追加検証（MTG論点の裏取り）
def v1_equivalent(hold, capital=CAPITAL, util=UTIL):
    """比較用：v1（SPC・譲渡1%・折半50%・SPC固定費660万）を同じ拠出額に縮小した場合。"""
    u1 = unit(**M.SCENARIOS["ニュートラル"], markup=0.01)
    book = capital * util
    lot  = u1["spc_cost"] / 100 * M.LOT_RRP
    cogs = book * 12.0 / hold
    sales = cogs * u1["mult"] * appr(hold)
    cost = (book / lot * M.STORAGE_PER_LOT_YEAR + book * M.INSURANCE_RATE
            + cogs / lot * M.INBOUND_PER_LOT + sales * u1["var_rate"]
            + 2_000_000 + 3_600_000 + 500_000 + 500_000)
    pretax = (sales - cogs) - cost
    return dict(pretax=pretax, investor=pretax * 0.5, yld=pretax * 0.5 / capital,
                cost=cost)


def solve_share(hold, target, capital=CAPITAL, **kw):
    """目標利回りを満たす投資家の配分率。"""
    p = steady_v2(unit_v2(), hold, capital=capital, **kw)["pretax"]
    return target * capital / p if p > 0 else float("nan")


def floor_cap(hold, floor=0.10, cap=0.20, capital=CAPITAL, **kw):
    """優先配当（フロア）＋上限（キャップ）型。
    税前利益から投資家にまず floor を配当し、残りをティア配分。
    投資家の利回りが cap を超える分は WineBank に回す。"""
    r  = steady_v2(unit_v2(), hold, capital=capital, **kw)
    p  = r["pretax"]
    pref = min(p, floor * capital)              # 優先配当（利益の範囲内）
    rest = max(p - pref, 0.0)
    inv  = pref + rest * (1 - r["wb_share"])
    inv  = min(inv, cap * capital)              # キャップ
    return dict(pretax=p, investor=inv, yld=inv / capital,
                wb=p - inv, pref_short=max(floor * capital - p, 0.0))


def _extra_report():
    u = unit_v2()
    W = 100
    print()
    print("=" * W)
    print("【v1（SPC・折半）を同じ1億円に縮小した場合との比較】解釈A")
    print("=" * W)
    print(" 保有   v1 費用計   v1 税前  v1 投資家利回り |  v2 費用計   v2 税前  v2 投資家利回り     差")
    for hold in (6, 9, 12, 15, 18, 24):
        a = v1_equivalent(hold)
        b = steady_v2(u, hold)
        print(f"{hold:3d}ヶ月 {man(a['cost']):>9s} {man(a['pretax']):>9s} {pct(a['yld']):>13s} "
              f"| {man(b['cost_total']):>9s} {man(b['pretax']):>9s} {pct(b['yld']):>13s} "
              f"{(b['yld']-a['yld'])*100:+7.1f}pt")

    print()
    print("=" * W)
    print("【投資額別】解釈A・回転12ヶ月・販売経費1,000万は固定")
    print("=" * W)
    print("  拠出額   税前利益   投資家取分  投資家利回り   販売経費の売上比")
    for cap in (50_000_000, 100_000_000, 200_000_000, 300_000_000, 500_000_000):
        r = steady_v2(u, 12, capital=cap)
        print(f"  {cap/1e8:.1f}億  {man(r['pretax']):>9s} {man(r['investor']):>10s} "
              f"{pct(r['yld']):>11s} {SELLING_EXPENSE/r['sales']*100:>13.2f}%")

    print()
    print("=" * W)
    print("【WineBankと投資家の受取比率】解釈A（販売経費1,000万もWineBankの受取に含める）")
    print("=" * W)
    print(" 保有   投資家取分   WBティア分   5%マージン   販売経費   WB合計    投資家:WB")
    for hold in (6, 9, 12, 18, 24):
        r  = steady_v2(u, hold)
        wb = r["wb_tier"] + r["wb_margin"] + SELLING_EXPENSE
        tot = r["investor"] + wb
        print(f"{hold:3d}ヶ月 {man(r['investor']):>10s} {man(r['wb_tier']):>11s} "
              f"{man(r['wb_margin']):>11s} {man(SELLING_EXPENSE):>9s} {man(wb):>9s} "
              f"{r['investor']/tot*100:>6.0f}:{wb/tot*100:.0f}")

    print()
    print("=" * W)
    print("【目標レンジ 10〜20% に収めるために必要な投資家の配分率】解釈A")
    print("=" * W)
    print(" 保有  現行ティアの投資家率 →  利回り  |  10%に必要   15%に必要   20%に必要")
    for hold in HOLDS:
        r = steady_v2(u, hold)
        s10, s15, s20 = (solve_share(hold, t) for t in (0.10, 0.15, 0.20))
        f = lambda s: (f"{s*100:5.1f}%" if s <= 1.0 else " 不能")
        print(f"{hold:3d}ヶ月 {1-r['wb_share']:>17.0%} → {pct(r['yld']):>7s}  |"
              f" {f(s10):>10s} {f(s15):>11s} {f(s20):>11s}")

    print()
    print("=" * W)
    print("【優先配当10%＋キャップ20%型】解釈A・超過分は現行ティアで配分")
    print("=" * W)
    print(" 保有   税前利益   投資家取分  投資家利回り   WB取分（ティア分）  優先配当の不足")
    for hold in HOLDS:
        fc = floor_cap(hold)
        print(f"{hold:3d}ヶ月 {man(fc['pretax']):>9s} {man(fc['investor']):>10s} "
              f"{pct(fc['yld']):>11s} {man(fc['wb']):>17s} "
              f"{((man(fc['pref_short'])+'円') if fc['pref_short'] else '—'):>14s}")

    print()
    print("=" * W)
    print("【ティア境界の値引きインセンティブ】12ヶ月の崖を跨がないための値引きは割に合うか")
    print("=" * W)
    base = steady_v2(u, 12.1)                      # 崖を越えた場合（WB50%）
    base_wb = base["pretax"] * 0.5 + base["wb_margin"]
    print(f"  12.1ヶ月で満額売却  → 税前 {man(base['pretax'])}円  "
          f"WB {man(base_wb)}円  投資家 {man(base['investor'])}円（{pct(base['yld'])}）")
    for disc in (0.03, 0.05, 0.08, 0.10):
        uu = unit(mkt_cost=50.0, p_b2b=70.0 * (1 - disc), p_b2c=80.0 * (1 - disc),
                  mix_b2b=0.5, markup=MARKUP_SALE)
        r = steady_v2(uu, 11.9)
        wb = r["pretax"] * 0.6 + r["wb_margin"]
        print(f"  11.9ヶ月・{disc:.0%}値引き → 税前 {man(r['pretax'])}円  "
              f"WB {man(wb)}円  投資家 {man(r['investor'])}円（{pct(r['yld'])}）"
              f"  WB差 {(wb-base_wb)/1e4:+,.0f}万／投資家差 {(r['investor']-base['investor'])/1e4:+,.0f}万")

    print()
    print("=" * W)
    print("【5%マージンを毎回転取るか初回のみか】解釈A・回転12ヶ月・5年累計")
    print("=" * W)
    r = steady_v2(u, 12)
    print(f"  毎回転取る   5年で {man(r['wb_margin']*5)}円（年 {man(r['wb_margin'])}円）")
    print(f"  初回のみ     5年で {man(r['wb_margin'])}円")
    print(f"  差           {man(r['wb_margin']*4)}円 ＝ 投資家利回りに換算して "
          f"年 {r['wb_margin']*4/5/CAPITAL*100:.1f}pt 相当")


if __name__ == "__main__":
    _extra_report()
