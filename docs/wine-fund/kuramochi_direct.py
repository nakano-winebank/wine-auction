"""倉持案 v2 — 直接所有・委託販売型（単独投資家・1億円）

2026年8月のMTGでスキームが全面的に入れ替わった。

  旧（v1）：GK-TKのSPCを組成し、投資家は匿名組合出資5億円。WineBankは現物を
            市中原価+1%でSPCへ譲渡。SPC税前利益を投資家とWineBankで折半。

  新（v2）：SPCを組成しない。WineBankが市中原価+5%で倉持氏の資産管理会社へ
            現物を売却し、投資家が自ら直接所有する（名義移転）。以後の顧客への
            販売は WineBank を受託者とする委託販売とし、所有権は投資家から
            顧客へ直接移転する。投資家が酒類の販売当事者にならないよう、
            買戻しではなく委託販売の建て付けとする（問屋型）。
            販売差益は在庫回転期間に応じたティアでWineBankと投資家が配分する。

主な差分：
  ・出資 5億円 → 1億円（単独投資家）
  ・匿名組合出資 → 現物の直接所有（TKなし・SPCなし）
  ・譲渡マージン 1% → 売却マージン 5%（WineBankが取得時点で先取り）
  ・SPC関連費用（維持費200万・人件費360万・AUP50万・予備費50万＝計660万）は消滅
  ・折半（50:50）固定 → 在庫回転期間に応じたティア配分
  ・投資家は自己利用が可能。WineBankの逸失利益を補償して引き取る

配分ティアは「保有期間」ではなく**在庫回転期間**で決まる。投資家利回りは
すべて**年率換算**（年間の投資家取分 ÷ 拠出額1億円）で表示する。

費用の構成：
  固定経費   保管・保険・入庫。拠出額1億円をフルにワイン現物へ充当した前提で計上
  変動販売費 売上の6.44%（モール・出品5.5% ／ カード決済3.2% ／ 出庫・梱包・
             クール便2.5% をB2B/B2Cの構成比で加重。model.py 由来）
  人件費     売上の7.5%。WineBank側の実務人件費として別途計上する
  → 変動販売費と人件費の合計は 13.94%

価格前提（定価比・値上がり6%）と保管・保険・入庫の単価は model.py を流用する。
model.py 自体は山本案と共有のため変更しない。
"""
import model as M
from model import unit, appr

# ───────────────────────────────────────────────────── v2 の前提
CAPITAL      = 100_000_000   # 投資家の拠出額（単独）。全額をワイン現物に充当する
MARKUP_SALE  = 0.05          # WineBank → 投資家資産管理会社への売却マージン
LABOR_RATE   = 0.075         # 人件費（WineBank側の実務人件費）。売上に対する率
BOTTLE_RRP   = 25_000        # 平均定価（円/本）。1ロット＝定価100万円相当＝約40本

# 在庫回転期間に応じた WineBank の取り分。早期売却のインセンティブを持たせる設計。
#   〜6ヶ月 70% ／ 〜12ヶ月 60% ／ 18ヶ月未満 50% ／ 24ヶ月未満 40% ／ 24ヶ月〜 30%
def wb_share(turn):
    if turn <= 6:  return 0.70
    if turn <= 12: return 0.60
    if turn < 18:  return 0.50
    if turn < 24:  return 0.40
    return 0.30


def tier_label(turn):
    if turn <= 6:  return "6ヶ月以内"
    if turn <= 12: return "12ヶ月以内"
    if turn < 18:  return "18ヶ月未満"
    if turn < 24:  return "24ヶ月未満"
    return "24ヶ月〜"


def unit_v2(scenario="ニュートラル", markup=MARKUP_SALE):
    """定価100あたりの単位経済。u["spc_cost"] が投資家の取得原価（市中原価×1.05）。"""
    return unit(**M.SCENARIOS[scenario], markup=markup)


# ───────────────────────────────────────── 年間の定常実力値（年率）
def steady_v2(u, turn, capital=CAPITAL, rate=None, labor_rate=LABOR_RATE):
    """委託販売スキームの年間損益。turn は在庫回転期間（月）。

    固定経費（保管・保険・入庫）は拠出額をフルにワイン現物へ充当した前提で計上。
    変動販売費は売上比6.44%、人件費は売上比7.5%を別建てで計上する。
    """
    book     = capital                              # 在庫簿価＝拠出額フル
    lot_cost = u["spc_cost"] / 100 * M.LOT_RRP      # 1ロットの投資家簿価
    turns    = 12.0 / turn                          # 年間回転数
    cogs     = book * turns
    sales    = cogs * u["mult"] * appr(turn, rate)

    cost = dict(
        storage   = book / lot_cost * M.STORAGE_PER_LOT_YEAR,
        insurance = book * M.INSURANCE_RATE,
        inbound   = cogs / lot_cost * M.INBOUND_PER_LOT,
        selling   = sales * u["var_rate"],          # 変動販売費 6.44%
        labor     = sales * labor_rate,             # 人件費 7.5%
    )
    total    = sum(cost.values())
    pretax   = (sales - cogs) - total
    ws       = wb_share(turn)
    investor = pretax * (1 - ws)
    margin   = cogs / u["spc_cost"] * u["transfer"]   # 5%マージン（回転ごとに発生）

    return dict(turn=turn, turns=turns, sales=sales, cogs=cogs, gross=sales - cogs,
                cost=cost, cost_total=total, cost_rate=total / sales, pretax=pretax,
                wb_share=ws, investor=investor,
                yld=investor / capital,               # 年率
                yld_per_turn=investor / capital / turns,   # 1回転あたり
                wb_tier=pretax * ws, wb_margin=margin, wb_labor=cost["labor"],
                wb_total=pretax * ws + margin + cost["labor"],
                lots=book / lot_cost)


# ───────────────────────────────────────── 自己利用（現物引き取り）
def self_use(u, turn, rate=None, labor_rate=LABOR_RATE):
    """投資家が現物を自己利用する場合の実質取得価格（定価100あたり）。

    投資家はすでに取得原価（定価比52.50）を支払っている。委託販売に回していれば
    WineBankが得たはずのティア配分ぶんを「逸失利益」として補償し、現物を引き取る。
    逸失利益は通常の売却と同じ基準（変動販売費・人件費を控除した後の利益に
    ティア率を乗じたもの）で算定する。保管・保険は在庫全体に対して発生済みの
    ため配賦しない。
    """
    k        = appr(turn, rate)
    price    = u["price"] * k                          # 売却時の売値
    net      = price * (1 - u["var_rate"] - labor_rate)  # 変動販売費・人件費 控除後
    cost     = u["spc_cost"]                           # 投資家の取得原価
    profit   = net - cost                              # 委託販売なら生じた利益
    ws       = wb_share(turn)
    wb_lost  = profit * ws                             # WineBankの逸失利益＝補償額
    effective = cost + wb_lost                         # 投資家の実質取得価格

    rrp_now  = 100.0 * k
    b2c_now  = u["p_b2c"] * k
    b2b_now  = u["p_b2b"] * k
    return dict(k=k, price=price, net=net, cost=cost, profit=profit,
                wb_share=ws, wb_lost=wb_lost, inv_lost=profit * (1 - ws),
                effective=effective,
                rrp_now=rrp_now, b2c_now=b2c_now, b2b_now=b2b_now,
                off_rrp=1 - effective / rrp_now,
                off_b2c=1 - effective / b2c_now,
                off_b2b=1 - effective / b2b_now)


def oku(x):   return f"{x/100_000_000:,.2f}億"
def man(x):   return f"{x/10_000:,.0f}万"
def yen(x):   return f"{x:,.0f}円"
def pct(x):   return f"{x*100:,.1f}%"


TURNS = (6, 9, 12, 15, 18, 24, 30, 36)
W = 104


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
    print(f"  変動販売費 売上の {u['var_rate']:.2%}（モール5.5%／カード決済3.2%／出庫・梱包2.5% の加重）")
    print(f"  人件費     売上の {LABOR_RATE:.1%}（WineBank側の実務人件費・別建て）")
    print(f"  合計       売上の {u['var_rate']+LABOR_RATE:.2%}")
    print(f"  配分       在庫回転期間に応じたティア"
          f"（6ヶ月70% / 12ヶ月60% / 18ヶ月未満50% / 24ヶ月未満40% / 24ヶ月〜30%）")
    print(f"  利回り     すべて年率換算（年間の投資家取分 ÷ 拠出額1億円）")

    print()
    print("=" * W)
    print("【在庫回転期間別の年間損益とティア配分】投資家利回りは年率")
    print("=" * W)
    print(" 回転期間  ティア   WB率  年間回転数  年間売上   年間粗利   費用計   "
          "税前利益   投資家取分  投資家利回り(年率)  1回転あたり")
    for turn in TURNS:
        r = steady_v2(u, turn)
        print(f"{turn:3d}ヶ月 {tier_label(turn):>10s} {r['wb_share']:5.0%} "
              f"{r['turns']:9.2f}回 {oku(r['sales']):>9s} {oku(r['gross']):>9s} "
              f"{man(r['cost_total']):>8s} {man(r['pretax']):>9s} {man(r['investor']):>10s} "
              f"{pct(r['yld']):>16s} {pct(r['yld_per_turn']):>11s}")

    print()
    print("=" * W)
    print("【費用の内訳】主線・在庫回転12ヶ月")
    print("=" * W)
    r = steady_v2(u, 12)
    names = {"storage": "保管（定温倉庫）", "insurance": "動産総合保険",
             "inbound": "入庫・検品", "selling": "変動販売費（売上の6.44%）",
             "labor": "人件費（売上の7.50%）"}
    print(f"  在庫 {r['lots']:.0f}ロット（定価換算 {r['lots']*M.LOT_RRP/1e8:.2f}億円）"
          f"／年間売上 {oku(r['sales'])}円")
    for k, v in r["cost"].items():
        print(f"    {names[k]:28s} {v/10_000:>8,.0f}万円 （売上比 {v/r['sales']*100:5.2f}%）")
    print(f"    {'合計':28s} {r['cost_total']/10_000:>8,.0f}万円 "
          f"（売上比 {r['cost_rate']*100:5.2f}%）")

    print()
    print("=" * W)
    print("【費用率の推移】在庫回転期間別（固定経費が薄まるため回転が速いほど率は下がる）")
    print("=" * W)
    print(" 回転期間   固定経費（保管・保険・入庫）   変動販売費   人件費    費用計    売上比")
    for turn in TURNS:
        r = steady_v2(u, turn)
        fixed = r["cost"]["storage"] + r["cost"]["insurance"] + r["cost"]["inbound"]
        print(f"{turn:3d}ヶ月 {man(fixed):>22s} {man(r['cost']['selling']):>13s} "
              f"{man(r['cost']['labor']):>9s} {man(r['cost_total']):>9s} "
              f"{pct(r['cost_rate']):>9s}")

    print()
    print("=" * W)
    print("【投資家とWineBankの受取】年額")
    print("=" * W)
    print(" 回転期間  投資家取分  投資家利回り |  WBティア分   5%マージン   人件費   WB合計   投資家:WB")
    for turn in TURNS:
        r = steady_v2(u, turn)
        tot = r["investor"] + r["wb_total"]
        print(f"{turn:3d}ヶ月 {man(r['investor']):>10s} {pct(r['yld']):>12s} | "
              f"{man(r['wb_tier']):>11s} {man(r['wb_margin']):>11s} "
              f"{man(r['wb_labor']):>9s} {man(r['wb_total']):>9s} "
              f"{r['investor']/tot*100:>7.0f}:{r['wb_total']/tot*100:.0f}")

    print()
    print("=" * W)
    print("【自己利用（現物引き取り）】投資家が飲む場合の実質取得価格　定価100あたり")
    print("=" * W)
    print(" 回転期間 WB率  売却時売値  控除後手取り  取得原価  WB逸失利益  実質取得価格"
          "   希望小売比  ネット最安比")
    for turn in TURNS:
        s = self_use(u, turn)
        print(f"{turn:3d}ヶ月 {s['wb_share']:5.0%} {s['price']:11.2f} {s['net']:13.2f} "
              f"{s['cost']:9.2f} {s['wb_lost']:11.2f} {s['effective']:13.2f} "
              f"{pct(s['off_rrp']):>11s}引 {pct(s['off_b2c']):>10s}引")

    print()
    print("=" * W)
    print(f"【自己利用】実額イメージ　平均定価 {BOTTLE_RRP:,}円/本")
    print("=" * W)
    print(" 回転期間  WineBankへ支払う補償   投資家の実質取得価格   その時点のネット最安   差額")
    for turn in TURNS:
        s = self_use(u, turn)
        b = BOTTLE_RRP / 100.0
        print(f"{turn:3d}ヶ月 {yen(s['wb_lost']*b):>18s} {yen(s['effective']*b):>21s} "
              f"{yen(s['b2c_now']*b):>21s} {yen(s['b2c_now']*b-s['effective']*b):>10s}安")

    print()
    print("=" * W)
    print("【3シナリオ】在庫回転12ヶ月")
    print("=" * W)
    for name in ("ネガティブ", "ニュートラル", "ポジティブ"):
        uu = unit_v2(name)
        rr = steady_v2(uu, 12)
        print(f"  {name:8s} 取得原価 {uu['spc_cost']:5.2f}  税前利益 {man(rr['pretax']):>8s}円  "
              f"投資家利回り（年率） {pct(rr['yld']):>7s}")

    print()
    print("=" * W)
    print("【値上がり率の影響】在庫回転12ヶ月")
    print("=" * W)
    for rate in (0.0, 0.06, 0.10):
        rr = steady_v2(u, 12, rate=rate)
        print(f"  年{rate:.0%}  税前利益 {man(rr['pretax']):>8s}円  "
              f"投資家利回り（年率） {pct(rr['yld']):>7s}")

    print()
    print("=" * W)
    print("【人件費率の感応度】在庫回転12ヶ月・変動販売費6.44%は据え置き")
    print("=" * W)
    for lr in (0.0, 0.05, 0.075, 0.10):
        rr = steady_v2(u, 12, labor_rate=lr)
        note = "← 主線" if abs(lr - LABOR_RATE) < 1e-9 else ""
        print(f"  人件費 {lr:5.1%}（合計 {(u['var_rate']+lr)*100:5.2f}%）  "
              f"人件費額 {man(rr['cost']['labor']):>7s}円  "
              f"税前利益 {man(rr['pretax']):>8s}円  "
              f"投資家利回り {pct(rr['yld']):>7s}  {note}")

    print()
    print("=" * W)
    print("【投資家利回り（年率）10% / 20% の分岐点】")
    print("=" * W)
    prev = None
    for i in range(30, 901):
        turn = i / 10
        y = steady_v2(u, turn)["yld"]
        if prev is not None:
            for target in (0.20, 0.10):
                if (prev[1] - target) * (y - target) < 0:
                    print(f"  {pct(target)} を跨ぐのは 在庫回転 {prev[0]:.1f}〜{turn:.1f}ヶ月 "
                          f"（{pct(prev[1])} → {pct(y)}）")
        prev = (turn, y)

    print()
    print("=" * W)
    print("【ティア境界の不連続】前後0.1ヶ月")
    print("=" * W)
    print("  回転期間   WB率   税前利益   投資家取分  投資家利回り   WB取分計")
    for turn in (5.9, 6.1, 11.9, 12.1, 17.9, 18.1, 23.9, 24.1):
        r = steady_v2(u, turn)
        print(f" {turn:5.1f}ヶ月 {r['wb_share']:5.0%} {man(r['pretax']):>9s} "
              f"{man(r['investor']):>10s} {pct(r['yld']):>11s} {man(r['wb_total']):>10s}")


if __name__ == "__main__":
    report()
