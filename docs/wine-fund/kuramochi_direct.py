"""倉持案 v2 — 直接所有・委託販売型（単独投資家・1億円）

2026年8月のMTGでスキームが全面的に入れ替わった。

  旧（v1）：GK-TKのSPCを組成し、投資家は匿名組合出資5億円。WineBankは現物を
            市中原価+1%でSPCへ譲渡。SPC税前利益を投資家とWineBankで折半。

  新（v2）：SPCを組成しない。WineBankが市中原価+5%で倉持氏の資産管理会社へ
            現物を売却し、投資家が自ら直接所有する（名義移転）。以後の顧客への
            販売は WineBank を受託者とする委託販売とし、所有権は投資家から
            顧客へ直接移転する。投資家が酒類の販売当事者にならないよう、
            買戻しではなく委託販売の建て付けとする（問屋型）。
            販売差益は保有期間に応じたティアでWineBankと投資家が配分する。

主な差分：
  ・出資 5億円 → 1億円（単独投資家）
  ・匿名組合出資 → 現物の直接所有（TKなし・SPCなし）
  ・譲渡マージン 1% → 売却マージン 5%（WineBankが取得時点で先取り）
  ・SPC関連費用（維持費200万・人件費360万・AUP50万・予備費50万＝計660万）は消滅
  ・費用は「固定経費＝保管・保険・入庫を1億円フル計上」＋「変動経費＝売上の7.5%
    （人件費・モール手数料・決済手数料・出庫配送を一括）」の2本立て
  ・折半（50:50）固定 → 保有期間に応じたティア配分
  ・投資家は自己利用が可能。WineBankの逸失利益を補償して引き取る

価格前提（定価比・値上がり6%）と保管・保険・入庫の単価は model.py を流用する。
model.py 自体は山本案と共有のため変更しない。
"""
import model as M
from model import unit, appr

# ───────────────────────────────────────────────────── v2 の前提
CAPITAL      = 100_000_000   # 投資家の拠出額（単独）。全額をワイン現物に充当する
MARKUP_SALE  = 0.05          # WineBank → 投資家資産管理会社への売却マージン
VAR_RATE     = 0.075         # 変動経費（人件費等）＝ 売上の7.5%
BOTTLE_RRP   = 25_000        # 平均定価（円/本）。1ロット＝定価100万円相当＝約40本

# 保有期間に応じた WineBank の取り分。早期売却のインセンティブを持たせる設計。
#   〜6ヶ月 70% ／ 〜12ヶ月 60% ／ 18ヶ月未満 50% ／ 24ヶ月未満 40% ／ 24ヶ月〜 30%
def wb_share(hold):
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


def unit_v2(scenario="ニュートラル", markup=MARKUP_SALE):
    """定価100あたりの単位経済。u["spc_cost"] が投資家の取得原価（市中原価×1.05）。"""
    return unit(**M.SCENARIOS[scenario], markup=markup)


# ───────────────────────────────────────── 年間の定常実力値
def steady_v2(u, hold, capital=CAPITAL, rate=None, var_rate=VAR_RATE):
    """委託販売スキームの年間損益。

    固定経費（保管・保険・入庫）は拠出額1億円をフルにワイン現物へ充当した
    前提で計上する。変動経費は売上に対する率で計上する。
    """
    book     = capital                              # 在庫簿価＝拠出額フル
    lot_cost = u["spc_cost"] / 100 * M.LOT_RRP      # 1ロットの投資家簿価
    turns    = 12.0 / hold
    cogs     = book * turns
    sales    = cogs * u["mult"] * appr(hold, rate)

    cost = dict(
        storage   = book / lot_cost * M.STORAGE_PER_LOT_YEAR,
        insurance = book * M.INSURANCE_RATE,
        inbound   = cogs / lot_cost * M.INBOUND_PER_LOT,
        variable  = sales * var_rate,
    )
    total    = sum(cost.values())
    pretax   = (sales - cogs) - total
    ws       = wb_share(hold)
    investor = pretax * (1 - ws)
    margin   = cogs / u["spc_cost"] * u["transfer"]   # 5%マージン（回転ごとに発生）

    return dict(turns=turns, sales=sales, cogs=cogs, gross=sales - cogs,
                cost=cost, cost_total=total, pretax=pretax,
                wb_share=ws, investor=investor, yld=investor / capital,
                wb_tier=pretax * ws, wb_margin=margin,
                wb_total=pretax * ws + margin,
                lots=book / lot_cost)


# ───────────────────────────────────────── 自己利用（現物引き取り）
def self_use(u, hold, rate=None, var_rate=VAR_RATE):
    """投資家が現物を自己利用する場合の実質取得価格（定価100あたり）。

    投資家はすでに取得原価（定価比52.50）を支払っている。委託販売に回していれば
    WineBankが得たはずのティア配分ぶんを「逸失利益」として補償し、現物を引き取る。
    引き取る1本については販売が発生しないため、変動経費はWineBank側でも生じない。
    保管・保険などの共通固定費は在庫全体に対して発生済みのため配賦しない。
    """
    k        = appr(hold, rate)
    price    = u["price"] * k                 # 売却時の売値（B2B70/B2C80の加重平均）
    net      = price * (1 - var_rate)         # 変動経費控除後の手取り
    cost     = u["spc_cost"]                  # 投資家の取得原価（定価比52.50）
    profit   = net - cost                     # 委託販売していれば生じた利益
    ws       = wb_share(hold)
    wb_lost  = profit * ws                    # WineBankの逸失利益＝補償額
    inv_lost = profit * (1 - ws)              # 投資家が放棄する自らの取分
    effective = cost + wb_lost                # 投資家の実質取得価格

    rrp_now  = 100.0 * k                      # その時点の希望小売
    b2c_now  = u["p_b2c"] * k                 # その時点のネット最安
    b2b_now  = u["p_b2b"] * k                 # その時点の酒販店卸
    return dict(k=k, price=price, net=net, cost=cost, profit=profit,
                wb_share=ws, wb_lost=wb_lost, inv_lost=inv_lost,
                effective=effective,
                rrp_now=rrp_now, b2c_now=b2c_now, b2b_now=b2b_now,
                off_rrp=1 - effective / rrp_now,
                off_b2c=1 - effective / b2c_now,
                off_b2b=1 - effective / b2b_now)


def oku(x):   return f"{x/100_000_000:,.2f}億"
def man(x):   return f"{x/10_000:,.0f}万"
def yen(x):   return f"{x:,.0f}円"
def pct(x):   return f"{x*100:,.1f}%"


HOLDS = (6, 9, 12, 15, 18, 24, 30, 36)
W = 100


def report():
    u = unit_v2()

    print("=" * W)
    print("【倉持案 v2】直接所有・委託販売型　単独投資家 1億円")
    print("=" * W)
    print(f"  取得       市中原価 {u['mkt_cost']:.2f} × (1+{MARKUP_SALE:.0%})"
          f" = 投資家取得原価 {u['spc_cost']:.2f}（定価比）")
    print(f"  販売       B2B {u['p_b2b']:.0f} ／ B2C {u['p_b2c']:.0f} を半々"
          f" → 取得時の売値 {u['price']:.2f}")
    print(f"  固定経費   保管・保険・入庫を拠出額 {CAPITAL/1e8:.0f}億円フルで計上")
    print(f"  変動経費   売上の {VAR_RATE:.1%}（人件費・モール手数料・決済・出庫配送を一括）")
    print(f"  配分       保有期間に応じたティア（6ヶ月70% / 12ヶ月60% / 18ヶ月未満50% "
          f"/ 24ヶ月未満40% / 24ヶ月〜30%）")

    print()
    print("=" * W)
    print("【回転期間別の年間損益とティア配分】")
    print("=" * W)
    print(" 保有   ティア    WB率   年間売上   年間粗利   費用計   "
          "税前利益   投資家取分  投資家利回り  WB取分計")
    for hold in HOLDS:
        r = steady_v2(u, hold)
        print(f"{hold:3d}ヶ月 {tier_label(hold):>10s} {r['wb_share']:5.0%} "
              f"{oku(r['sales']):>9s} {oku(r['gross']):>9s} {man(r['cost_total']):>8s} "
              f"{man(r['pretax']):>9s} {man(r['investor']):>10s} "
              f"{pct(r['yld']):>11s} {man(r['wb_total']):>9s}")

    print()
    print("=" * W)
    print("【費用の内訳】主線・回転12ヶ月")
    print("=" * W)
    r = steady_v2(u, 12)
    names = {"storage": "保管（定温倉庫）", "insurance": "動産総合保険",
             "inbound": "入庫・検品", "variable": "変動経費（売上の7.5%）"}
    print(f"  在庫 {r['lots']:.0f}ロット（定価換算 {r['lots']*M.LOT_RRP/1e8:.2f}億円）"
          f"／年間売上 {oku(r['sales'])}円")
    for k, v in r["cost"].items():
        print(f"    {names[k]:26s} {v/10_000:>8,.0f}万円 （売上比 {v/r['sales']*100:5.2f}%）")
    print(f"    {'合計':26s} {r['cost_total']/10_000:>8,.0f}万円 "
          f"（売上比 {r['cost_total']/r['sales']*100:5.2f}%）")

    print()
    print("=" * W)
    print("【投資家とWineBankの受取】")
    print("=" * W)
    print(" 保有   投資家取分  投資家利回り |  WBティア分   5%マージン   変動経費のうち人件費相当"
          "   WB合計")
    for hold in HOLDS:
        r = steady_v2(u, hold)
        # 変動経費7.5%のうち、旧モデルの実費（モール・決済・出庫＝6.44%）を超える分を人件費相当とみなす
        labor = r["sales"] * (VAR_RATE - 0.0644)
        print(f"{hold:3d}ヶ月 {man(r['investor']):>10s} {pct(r['yld']):>11s} | "
              f"{man(r['wb_tier']):>11s} {man(r['wb_margin']):>11s} "
              f"{man(labor):>20s} {man(r['wb_total']+labor):>10s}")

    print()
    print("=" * W)
    print("【自己利用（現物引き取り）】投資家が飲む場合の実質取得価格　定価100あたり")
    print("=" * W)
    print(" 保有  WB率   売却時売値  手取り  取得原価  WB逸失利益  投資家の実質取得価格"
          "   希望小売比  ネット最安比")
    for hold in HOLDS:
        s = self_use(u, hold)
        print(f"{hold:3d}ヶ月 {s['wb_share']:4.0%} {s['price']:11.2f} {s['net']:7.2f} "
              f"{s['cost']:9.2f} {s['wb_lost']:11.2f} {s['effective']:20.2f} "
              f"{pct(s['off_rrp']):>11s}引 {pct(s['off_b2c']):>10s}引")

    print()
    print("=" * W)
    print(f"【自己利用】実額イメージ　平均定価 {BOTTLE_RRP:,}円/本")
    print("=" * W)
    print(" 保有   WineBankへ支払う補償   投資家の実質取得価格   その時点のネット最安   差額")
    for hold in HOLDS:
        s = self_use(u, hold)
        b = BOTTLE_RRP / 100.0
        print(f"{hold:3d}ヶ月 {yen(s['wb_lost']*b):>18s} {yen(s['effective']*b):>21s} "
              f"{yen(s['b2c_now']*b):>21s} {yen(s['b2c_now']*b-s['effective']*b):>10s}安")

    print()
    print("=" * W)
    print("【3シナリオ】回転12ヶ月")
    print("=" * W)
    for name in ("ネガティブ", "ニュートラル", "ポジティブ"):
        uu = unit_v2(name)
        rr = steady_v2(uu, 12)
        print(f"  {name:8s} 取得原価 {uu['spc_cost']:5.2f}  税前利益 {man(rr['pretax']):>8s}円  "
              f"投資家利回り {pct(rr['yld']):>7s}")

    print()
    print("=" * W)
    print("【値上がり率の影響】回転12ヶ月")
    print("=" * W)
    for rate in (0.0, 0.06, 0.10):
        rr = steady_v2(u, 12, rate=rate)
        print(f"  年{rate:.0%}  税前利益 {man(rr['pretax']):>8s}円  "
              f"投資家利回り {pct(rr['yld']):>7s}")

    print()
    print("=" * W)
    print("【変動経費率の感応度】回転12ヶ月")
    print("=" * W)
    for vr in (0.0644, 0.075, 0.10, 0.1394):
        rr = steady_v2(u, 12, var_rate=vr)
        note = ""
        if abs(vr - 0.0644) < 1e-9: note = "（旧モデルの実費のみ・人件費なし）"
        if abs(vr - 0.075)  < 1e-9: note = "← 主線"
        if abs(vr - 0.1394) < 1e-9: note = "（実費6.44%に人件費7.5%を上乗せした場合）"
        print(f"  {vr:6.2%}  税前利益 {man(rr['pretax']):>8s}円  "
              f"投資家利回り {pct(rr['yld']):>7s}  {note}")

    print()
    print("=" * W)
    print("【投資家利回り 10% / 20% の分岐点】")
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


if __name__ == "__main__":
    report()
