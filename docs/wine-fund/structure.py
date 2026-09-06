"""山本案（現物出資型）：WineBank現物出資60% ＋ 投資家出資40%

2026年8月の協議を経て、資本構成をデット型から現物出資型に変更した。

  ・WineBankが自己勘定のワイン現物を出資し、総額の60%を負担する（現金拠出ではない）
  ・投資家は現金で総額の40%を出資する（1口5,000万円以上）
  ・SPC税前利益のうち投資家出資分に帰属する分（40%）を投資家とWineBankで折半する
    → 折半＝「投資家が得た利益をWineBankと折半する成功報酬」（定義は従来から不変）
    → 投資家の取分 ＝ SPC税前利益 × 40% × 50% ＝ 20%
  ・WineBank出資分に帰属する分（60%）は、出資者であるWineBankがそのまま受け取る
  ・管理報酬として総額の年2%をSPC費用に計上する。うち投資家帰属分（40%）が
    WineBankの実質的な収入となる。従来のSPC人件費360万円はこれに置き換える
  ・段階クローズ：ファーストクローズ5億円 → 年度内のセカンドクローズ10億円

現物出資するワインの評価方法（取得原価にどれだけ付加するか）は組成時の別途協議事項と
するため、本試算ではSPC取得原価を従来と同じ定価比50.5（市中原価50.0＋現物譲渡1%）に
置いている。評価方法が決まり次第 MARKUP を変更すれば全数値がそれに追随する。
"""
import json
import model as M
from model import unit, steady, pct

# ── 費用：SPC人件費360万円は管理報酬に置き換えたため固定費から除く
FIXED_BASE = 2_000_000 + 500_000 + 500_000      # 維持費200万＋AUP50万＋予備費50万

WB_RATIO   = 0.60      # WineBank現物出資の比率
INV_RATIO  = 0.40      # 投資家出資の比率
SUCCESS    = 0.50      # 投資家帰属利益をWineBankと折半（成功報酬）
MGMT_RATE  = 0.02      # 管理報酬（総額に対する年率）
TARGET     = 0.20      # 先方の投資基準

CLOSES = [("ファーストクローズ", 5e8), ("セカンドクローズ", 10e8)]
HOLDS  = (9, 12, 15, 18)

u  = unit(**M.SCENARIOS["ニュートラル"])
un = unit(**M.SCENARIOS["ネガティブ"])
up = unit(**M.SCENARIOS["ポジティブ"])


def fixed_for(total):
    """総額に応じたSPC固定費（管理報酬を含む）。"""
    return FIXED_BASE + total * MGMT_RATE


def split(total, hold, uu=u, rate=None, util=0.95):
    """ある総額・回転期間における損益の配分。"""
    M.SPC_FIXED_TOTAL = fixed_for(total)
    r = steady(uu, hold, capital=total, rate=rate, util=util)
    mgmt = total * MGMT_RATE
    pretax = r["pretax"]                       # 管理報酬控除後（費用に含めて計算済み）
    attr = pretax * INV_RATIO                  # 投資家出資分に帰属する利益
    inv  = attr * SUCCESS                      # 折半後の投資家取分
    fee  = attr - inv                          # WineBankの成功報酬
    wb_equity = pretax * WB_RATIO              # WineBank出資分（60%）の帰属利益
    # 管理報酬はWineBankが全額を受領する。ただしその60%は自己の出資分に対応する
    # 自己負担分の還流であり、さらに投資家帰属分は折半されるため、課さない場合と
    # 比べた純増は「管理報酬 × 投資家比率40% × 折半50%」に留まる。
    wb_mgmt     = mgmt                                  # 受領額
    wb_mgmt_net = mgmt * INV_RATIO * SUCCESS            # 課さない場合との純増
    return dict(
        total=total, hold=hold,
        wb_capital=total * WB_RATIO, inv_capital=total * INV_RATIO,
        sales=r["sales"], gross=r["gross"], cost=r["spc_cost_total"],
        mgmt=mgmt, pretax=pretax, attr=attr, inv=inv, fee=fee,
        wb_equity=wb_equity, wb_mgmt=wb_mgmt, wb_mgmt_net=wb_mgmt_net,
        wb_total=wb_equity + fee + wb_mgmt,
        inv_yld=inv / (total * INV_RATIO),
        cost_detail=r["cost"],
    )


def avg5(total, hold, uu=u, rate=None):
    """5年通算の年平均利回り（投資家出資額ベース・年1回分配）。"""
    M.SPC_FIXED_TOTAL = fixed_for(total)
    m = M.monthly(uu, hold, capital=total, rate=rate,
                  share=INV_RATIO * SUCCESS, period_days=360)
    return m["total_distributed"] / (total * INV_RATIO) / 5


def breakeven(total, uu=u, rate=None, target=TARGET):
    """投資家利回りが目標を割り込む回転期間。"""
    lo, hi = 3.0, 60.0
    for _ in range(90):
        mid = (lo + hi) / 2
        if split(total, mid, uu, rate)["inv_yld"] > target: lo = mid
        else: hi = mid
    return (lo + hi) / 2


# ───────────────────────────────────── 旧スキーム（デット2億＋エクイティ3億）
def legacy(hold, uu=u, rate=None):
    """変更点資料の対照用。旧山本案＝デット2億円＋エクイティ3億円・折半。"""
    M.SPC_FIXED_TOTAL = 2_000_000 + 3_600_000 + 500_000 + 500_000
    r = steady(uu, hold, capital=5e8, rate=rate)
    attr = r["pretax"] * 0.6
    inv  = attr * 0.5
    wb   = (attr - inv) + r["pretax"] * 0.4 - 2e8 * 0.04
    return dict(pretax=r["pretax"], sales=r["sales"], attr=attr, inv=inv,
                wb=wb, inv_yld=inv / 3e8, interest=2e8 * 0.04)


def legacy_avg5(hold):
    M.SPC_FIXED_TOTAL = 2_000_000 + 3_600_000 + 500_000 + 500_000
    m = M.monthly(u, hold, capital=5e8, share=0.5)
    return m["total_distributed"] / 0.5 * 0.3 / 3e8 / 5


def legacy_breakeven(target=TARGET):
    lo, hi = 3.0, 60.0
    for _ in range(90):
        mid = (lo + hi) / 2
        if legacy(mid)["inv_yld"] > target: lo = mid
        else: hi = mid
    return (lo + hi) / 2


# ═══════════════════════════════════════════════════════════════════ 出力
if __name__ == "__main__":
    print("=" * 104)
    print("【1】在庫回転期間別（ニュートラル・上昇6%）　WineBank現物出資60%＋投資家出資40%")
    print("=" * 104)
    for label, total in CLOSES:
        print(f"\n--- {label}　総額{total/1e8:.0f}億円"
              f"（WineBank現物{total*WB_RATIO/1e8:.0f}億＋投資家{total*INV_RATIO/1e8:.0f}億）---")
        print(" 回転期間   年間販売   SPC税前   帰属(40%)   投資家取分   投資家利回り   5年通算年平均   WineBank")
        for h in HOLDS:
            x = split(total, h)
            tag = "（主線）" if h == 12 else "　　　"
            print(f" {h:2d}ヶ月{tag} {x['sales']/1e8:6.2f}億 {x['pretax']/1e8:7.2f}億 "
                  f"{x['attr']/1e6:8.0f}百万 {x['inv']/1e6:9.0f}百万 {pct(x['inv_yld']):>12s} "
                  f"{pct(avg5(total,h)):>13s} {x['wb_total']/1e6:9.0f}百万")

    print()
    print("=" * 104)
    print("【2】主線（在庫回転12ヶ月）の内訳")
    print("=" * 104)
    for label, total in CLOSES:
        x = split(total, 12)
        print(f"\n--- {label}　総額{total/1e8:.0f}億円 ---")
        print(f"  出資      WineBank現物 {x['wb_capital']/1e8:.0f}億円 ／ "
              f"投資家現金 {x['inv_capital']/1e8:.0f}億円")
        print(f"  年間売上  {x['sales']/1e8:.2f}億円")
        print(f"  SPC費用   {x['cost']/1e6:.0f}百万円（うち管理報酬 {x['mgmt']/1e6:.0f}百万円）")
        for k, v in x["cost_detail"].items():
            print(f"      {k:10s} {v/1e6:8.2f}百万円")
        print(f"  年間税前利益          {x['pretax']/1e8:.2f}億円")
        print(f"  ├ 投資家帰属分(40%)   {x['attr']/1e6:.0f}百万円")
        print(f"  │   ├ 投資家         {x['inv']/1e6:.0f}百万円  → 出資{x['inv_capital']/1e8:.0f}億に対し {pct(x['inv_yld'])}")
        print(f"  │   └ WineBank       {x['fee']/1e6:.0f}百万円  （成功報酬＝帰属利益の50%）")
        print(f"  └ WineBank帰属分(60%) {x['wb_equity']/1e6:.0f}百万円  （現物出資{x['wb_capital']/1e8:.0f}億に対する持分）")
        print(f"  WineBank合計          {x['wb_total']/1e6:.0f}百万円"
              f"（持分{x['wb_equity']/1e6:.0f}＋成功報酬{x['fee']/1e6:.0f}＋管理報酬{x['wb_mgmt']/1e6:.0f}）")
        print(f"      ※管理報酬を課さない場合と比べた純増は {x['wb_mgmt_net']/1e6:.1f}百万円"
              f"（投資家利回りは {pct(x['inv_yld']+MGMT_RATE*SUCCESS)} → {pct(x['inv_yld'])}）")

    print()
    print("=" * 104)
    print("【3】3シナリオ（回転期間別・投資家利回り）※比率は総額によらずほぼ一定")
    print("=" * 104)
    for label, total in CLOSES:
        print(f"\n--- {label} ---")
        print("           " + "".join(f"{h:>10d}ヶ月" for h in HOLDS))
        for name, uu, rate in (("ポジティブ", up, None), ("ニュートラル", u, None),
                               ("ネガティブ", un, 0.0)):
            line = "".join(f"{pct(split(total,h,uu,rate)['inv_yld']):>12s}" for h in HOLDS)
            print(f"  {name:10s}{line}")

    print()
    print("=" * 104)
    print("【4】感応度（主線＝回転12ヶ月）")
    print("=" * 104)
    for label, total in CLOSES:
        b = split(total, 12)["inv_yld"]
        print(f"\n--- {label}　基準 {pct(b)} ---")
        cases = [
            ("在庫回転 12 → 18ヶ月",        split(total, 18)["inv_yld"]),
            ("ワイン価格上昇 6% → 0%",      split(total, 12, rate=0.0)["inv_yld"]),
            ("売値 ▲5%",                   split(total, 12, un)["inv_yld"]),
            ("稼働率 95% → 85%",            split(total, 12, util=0.85)["inv_yld"]),
            ("ワイン価格上昇 6% → 10%",     split(total, 12, rate=0.10)["inv_yld"]),
            ("調達構成 定価比50→45",
             split(total, 12, unit(mkt_cost=45, p_b2b=70, p_b2c=80, mix_b2b=0.5))["inv_yld"]),
        ]
        for n, v in cases:
            print(f"  {n:26s} {pct(v):>7s}  ({(v-b)*100:+.1f}pt)")

    print()
    print("=" * 104)
    print(f"【5】{TARGET:.0%}を割り込む回転期間")
    print("=" * 104)
    for label, total in CLOSES:
        b = breakeven(total)
        print(f"\n--- {label} ---")
        print(f"  ニュートラル（上昇6%）        回転 {b:5.1f}ヶ月  → 主線12ヶ月からの余裕 {b-12:+.1f}ヶ月")
        print(f"  上昇0%（横ばい）              回転 {breakeven(total, rate=0.0):5.1f}ヶ月")
        print(f"  ネガティブ（値引き5%＋横ばい） 回転 {breakeven(total, un, 0.0):5.1f}ヶ月")

    print()
    print("=" * 104)
    print("【6】旧スキーム（デット2億＋エクイティ3億）との対照　回転12ヶ月")
    print("=" * 104)
    L = legacy(12)
    N5, N10 = split(5e8, 12), split(10e8, 12)
    rows = [
        ("投資家の拠出", "3億円（別に貸付2億円）", "2億円", "4億円"),
        ("WineBankの拠出", "なし（保証のみ）", "現物3億円", "現物6億円"),
        ("SPC年間税前利益", f"{L['pretax']/1e8:.2f}億円",
         f"{N5['pretax']/1e8:.2f}億円", f"{N10['pretax']/1e8:.2f}億円"),
        ("投資家取分（折半後）", f"{L['inv']/1e6:.0f}百万円",
         f"{N5['inv']/1e6:.0f}百万円", f"{N10['inv']/1e6:.0f}百万円"),
        ("投資家利回り", pct(L['inv_yld']), pct(N5['inv_yld']), pct(N10['inv_yld'])),
        ("5年通算 年平均", pct(legacy_avg5(12)), pct(avg5(5e8,12)), pct(avg5(10e8,12))),
        ("WineBank取分", f"{L['wb']/1e6:.0f}百万円",
         f"{N5['wb_total']/1e6:.0f}百万円", f"{N10['wb_total']/1e6:.0f}百万円"),
        (f"{TARGET:.0%}の分岐点", f"回転{legacy_breakeven():.1f}ヶ月",
         f"回転{breakeven(5e8):.1f}ヶ月", f"回転{breakeven(10e8):.1f}ヶ月"),
    ]
    print(f"  {'':22s}{'旧・デット型':>22s}{'新・1stクローズ':>20s}{'新・2ndクローズ':>20s}")
    for r in rows:
        print(f"  {r[0]:22s}{r[1]:>22s}{r[2]:>20s}{r[3]:>20s}")

    # ─────────────────────────────────────────────── figures.json 出力
    def close_block(total):
        x12 = split(total, 12)
        def hold_row(h):
            d = split(total, h)
            return dict(sales=d["sales"], pretax=d["pretax"], attr=d["attr"],
                        inv=d["inv"], fee=d["fee"], wb_equity=d["wb_equity"],
                        wb_mgmt=d["wb_mgmt"], wb_mgmt_net=d["wb_mgmt_net"],
                        wb_total=d["wb_total"], inv_yld=d["inv_yld"],
                        gross=d["gross"], selling=d["cost_detail"]["selling"],
                        cost=d["cost"], avg5=avg5(total, h),
                        appr0=split(total, h, rate=0.0)["inv_yld"],
                        k=M.appr(h))
        def scen_row(uu, rate):
            return {str(h): dict(sales=split(total,h,uu,rate)["sales"],
                                 pretax=split(total,h,uu,rate)["pretax"],
                                 inv=split(total,h,uu,rate)["inv"],
                                 inv_yld=split(total,h,uu,rate)["inv_yld"])
                    for h in HOLDS}
        return dict(
            total=total, wb_capital=total*WB_RATIO, inv_capital=total*INV_RATIO,
            mgmt=total*MGMT_RATE, mgmt_net=total*MGMT_RATE*INV_RATIO*SUCCESS,
            holds={str(h): hold_row(h) for h in HOLDS},
            scenarios=dict(positive=scen_row(up, None), neutral=scen_row(u, None),
                           negative=scen_row(un, 0.0)),
            sensitivity=dict(
                base=x12["inv_yld"],
                hold18=split(total,18)["inv_yld"],
                appr0=split(total,12,rate=0.0)["inv_yld"],
                price5=split(total,12,un)["inv_yld"],
                util85=split(total,12,util=0.85)["inv_yld"],
                appr10=split(total,12,rate=0.10)["inv_yld"],
                mall8=split(total,12,unit(**M.SCENARIOS["ニュートラル"], rate_b2c=0.137))["inv_yld"],
                cost45=split(total,12,unit(mkt_cost=45,p_b2b=70,p_b2c=80,mix_b2b=0.5))["inv_yld"],
            ),
            breakeven=dict(neutral=breakeven(total), appr0=breakeven(total, rate=0.0),
                           negative=breakeven(total, un, 0.0)),
            cost_detail={k: v for k, v in x12["cost_detail"].items()},
        )

    unit_block = {name: {k: v for k, v in unit(**sc).items()}
                  for name, sc in M.SCENARIOS.items()}
    # ネガティブは価格横ばい（上昇0%）を前提とするため、保有後の単位経済も rate=0 で計算する
    HELD_RATE = {"ネガティブ": 0.0}
    held = {name: {k: v for k, v in
                   M.unit_held(unit(**sc), 12, HELD_RATE.get(name)).items()}
            for name, sc in M.SCENARIOS.items()}

    figures = dict(
        scheme="現物出資型（WineBank現物出資60%＋投資家出資40%）",
        params=dict(wb_ratio=WB_RATIO, inv_ratio=INV_RATIO, success=SUCCESS,
                    mgmt_rate=MGMT_RATE, target=TARGET, util=M.UTIL,
                    appreciation=M.APPRECIATION, markup=M.MARKUP,
                    term_years=M.TERM_YEARS, ramp_months=M.RAMP_MONTHS,
                    fixed_base=FIXED_BASE),
        unit=unit_block, unit_held=held,
        first=close_block(5e8), second=close_block(10e8),
        legacy=dict(pretax=L["pretax"], sales=L["sales"], attr=L["attr"],
                    inv=L["inv"], wb=L["wb"], inv_yld=L["inv_yld"],
                    interest=L["interest"], avg5=legacy_avg5(12),
                    breakeven=legacy_breakeven()),
    )
    with open("figures.json", "w", encoding="utf-8") as f:
        json.dump(figures, f, ensure_ascii=False, indent=1)
    print("\nwritten: figures.json")
