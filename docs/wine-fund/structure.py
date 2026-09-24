"""山本案（時価−α卸・プロラタ配分型）

2026年9月の協議を経て、WineBankの取り分を「出口の折半」から「SPCへ卸す時点の値入れ」へ
移した。成功報酬（折半）は廃止する。

  ・WineBankは自己勘定のワイン現物を拠出して総額の60%を出資し、投資家が現金で40%を出資する
  ・SPCへ入れるワインの価格は「時価 − α」とする。時価＝取得時点の加重平均売値（定価比75）、
    α＝20.8%。したがってSPCの簿価は定価比 59.40（市中原価50.00に対し＋18.8%）
  ・WineBankはこの値入れ（譲渡益）を卸した時点で取る。出口では成功報酬を取らない
  ・SPCの費用は保管・保険・入庫・変動販売費に加え、維持費・AUP・予備費と管理報酬（総額の年2%）
  ・SPC税前利益は出資比率どおり 60:40 でプロラタ配分する
  ・段階クローズ：ファーストクローズ5億円 → 年度内のセカンドクローズ10億円

配分がプロラタであるため、投資家利回りは「SPC税前利益 ÷ 総額」に等しく、出資比率によらない。
"""
import json
import model as M
from model import unit, steady, pct

FIXED_BASE = 2_000_000 + 500_000 + 500_000   # 維持費200万＋AUP50万＋予備費50万

WB_RATIO  = 0.60      # WineBank現物出資の比率
INV_RATIO = 0.40      # 投資家出資の比率
MGMT_RATE = 0.02      # 管理報酬（総額に対する年率）
ALPHA     = 0.2083    # 時価からの控除率。SPC簿価 ＝ 時価 ×（1−α）
TARGET    = 0.20      # 先方の投資基準

CLOSES = [("ファーストクローズ", 5e8), ("セカンドクローズ", 10e8)]
HOLDS  = (9, 12, 15, 18)
APPR   = [("positive", 0.10, "ポジティブ"), ("neutral", None, "ニュートラル"),
          ("negative", 0.0, "ネガティブ")]

BASE = M.SCENARIOS["ニュートラル"]          # 仕入・売却チャネルの前提は主線で固定
JIKA = unit(**BASE)["price"]                # 時価＝取得時点の加重平均売値
BOOK = JIKA * (1 - ALPHA)                   # SPC簿価


def spc_unit(book=BOOK, sc=BASE):
    """SPC簿価を book とした単位経済。"""
    return unit(**dict(sc, markup=book / sc["mkt_cost"] - 1))


U = spc_unit()


def fixed_for(total):
    return FIXED_BASE + total * MGMT_RATE


def split(total, hold, rate=None, util=0.95, uu=None, book=None):
    """損益の配分。成功報酬はなく、税前利益を出資比率でプロラタ配分する。"""
    M.SPC_FIXED_TOTAL = fixed_for(total)
    u = uu or (spc_unit(book) if book else U)
    r = steady(u, hold, capital=total, rate=rate, util=util)
    mgmt = total * MGMT_RATE
    pretax = r["pretax"]                       # 管理報酬控除後
    inv = pretax * INV_RATIO                   # 投資家（プロラタ）
    wb_equity = pretax * WB_RATIO              # WineBank持分（プロラタ）
    transfer = r["transfer_margin"]            # WineBankが卸した時点で取る値入れ
    return dict(
        total=total, hold=hold,
        wb_capital=total * WB_RATIO, inv_capital=total * INV_RATIO,
        sales=r["sales"], gross=r["gross"], cost=r["spc_cost_total"],
        selling=r["cost"]["selling"], mgmt=mgmt, pretax=pretax,
        inv=inv, wb_equity=wb_equity, transfer=transfer,
        wb_total=wb_equity + transfer + mgmt,
        inv_yld=inv / (total * INV_RATIO),      # ＝ pretax / total
        cost_detail=r["cost"],
    )


def avg5(total, hold, rate=None):
    """5年通算の年平均利回り（投資家出資額ベース・年1回分配）。"""
    M.SPC_FIXED_TOTAL = fixed_for(total)
    m = M.monthly(U, hold, capital=total, rate=rate,
                  share=INV_RATIO, period_days=360)
    return m["total_distributed"] / (total * INV_RATIO) / 5


def breakeven(total, rate=None, target=TARGET):
    lo, hi = 3.0, 60.0
    for _ in range(90):
        mid = (lo + hi) / 2
        if split(total, mid, rate)["inv_yld"] > target: lo = mid
        else: hi = mid
    return (lo + hi) / 2


def solve_alpha(total, target=TARGET):
    """投資家利回りが目標ちょうどになるα。利回りはαについて増加する。"""
    lo, hi = 0.0, 0.5
    for _ in range(90):
        mid = (lo + hi) / 2
        if split(total, 12, book=JIKA * (1 - mid))["inv_yld"] > target: hi = mid
        else: lo = mid
    return (lo + hi) / 2


# ───────────────────────────── 旧スキーム（原価卸＋折半）＝ 変更点資料の対照用
def legacy(hold=12, rate=None):
    """前回資料。SPC簿価50.50・投資家帰属分（40%）を折半・管理報酬2%。"""
    M.SPC_FIXED_TOTAL = fixed_for(5e8)
    u = unit(**BASE)                           # markup は既定の1%
    r = steady(u, hold, capital=5e8, rate=rate)
    pretax = r["pretax"]
    attr = pretax * INV_RATIO
    inv = attr * 0.5
    return dict(pretax=pretax, sales=r["sales"], attr=attr, inv=inv,
                fee=attr - inv, wb_equity=pretax * WB_RATIO,
                transfer=r["transfer_margin"], spc_cost=u["spc_cost"],
                wb_total=pretax * WB_RATIO + (attr - inv) + 5e8 * MGMT_RATE + r["transfer_margin"],
                inv_yld=inv / (5e8 * INV_RATIO))


def legacy_avg5(hold=12):
    """前回スキームの5年通算年平均利回り（投資家出資額ベース）。"""
    M.SPC_FIXED_TOTAL = fixed_for(5e8)
    m = M.monthly(unit(**BASE), hold, capital=5e8,
                  share=INV_RATIO * 0.5, period_days=360)
    return m["total_distributed"] / (5e8 * INV_RATIO) / 5


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
    print("【0】卸値の決め方")
    print("=" * 104)
    print(f"  時価（取得時点の加重平均売値）      定価比 {JIKA:.2f}")
    print(f"  α（時価からの控除率）              {ALPHA:.1%}")
    print(f"  SPC簿価 ＝ 時価 ×（1−α）           定価比 {BOOK:.2f}"
          f"　（市中原価{BASE['mkt_cost']:.2f}に対し ＋{(BOOK/BASE['mkt_cost']-1)*100:.1f}%）")
    print(f"  WineBankの値入れ（簿価比）          {(BOOK-BASE['mkt_cost'])/BOOK*100:.1f}%")
    print(f"  参考：投資家{TARGET:.0%}ちょうどとなるα  {solve_alpha(5e8):.2%}")

    print()
    print("=" * 104)
    print("【1】在庫回転期間別（ニュートラル・上昇6%）　WineBank現物出資60%＋投資家出資40%")
    print("=" * 104)
    for label, total in CLOSES:
        print(f"\n--- {label}　総額{total/1e8:.0f}億円"
              f"（WineBank現物{total*WB_RATIO/1e8:.0f}億＋投資家{total*INV_RATIO/1e8:.0f}億）---")
        print(" 回転期間   年間販売   SPC税前   投資家取分   投資家利回り   5年通算年平均   WB値入れ   WineBank計")
        for h in HOLDS:
            x = split(total, h)
            tag = "（主線）" if h == 12 else "　　　"
            print(f" {h:2d}ヶ月{tag} {x['sales']/1e8:6.2f}億 {x['pretax']/1e8:7.2f}億 "
                  f"{x['inv']/1e6:9.0f}百万 {pct(x['inv_yld']):>12s} {pct(avg5(total,h)):>13s} "
                  f"{x['transfer']/1e6:8.0f}百万 {x['wb_total']/1e6:9.0f}百万")

    print()
    print("=" * 104)
    print("【2】主線（在庫回転12ヶ月）の内訳")
    print("=" * 104)
    for label, total in CLOSES:
        x = split(total, 12)
        print(f"\n--- {label}　総額{total/1e8:.0f}億円 ---")
        print(f"  出資          WineBank現物 {x['wb_capital']/1e8:.0f}億円 ／ 投資家現金 {x['inv_capital']/1e8:.0f}億円")
        print(f"  年間売上      {x['sales']/1e8:.2f}億円")
        print(f"  SPC費用       {x['cost']/1e6:.0f}百万円（うち管理報酬 {x['mgmt']/1e6:.0f}百万円）")
        print(f"  年間税前利益  {x['pretax']/1e8:.2f}億円　→ 出資比率どおり 60:40 で配分")
        print(f"  ├ 投資家(40%)   {x['inv']/1e6:.0f}百万円  → 出資{x['inv_capital']/1e8:.0f}億に対し {pct(x['inv_yld'])}")
        print(f"  └ WineBank(60%) {x['wb_equity']/1e6:.0f}百万円")
        print(f"  WineBank合計  {x['wb_total']/1e6:.0f}百万円"
              f"（持分{x['wb_equity']/1e6:.0f}＋値入れ{x['transfer']/1e6:.0f}＋管理報酬{x['mgmt']/1e6:.0f}）")
        fixed = x['transfer'] + x['mgmt']
        print(f"      ※うち固定的な収入は {fixed/1e6:.0f}百万円（{fixed/x['wb_total']*100:.0f}%）")

    print()
    print("=" * 104)
    print("【3】3シナリオ（ワイン価格上昇率別・投資家利回り）")
    print("=" * 104)
    for label, total in CLOSES:
        print(f"\n--- {label} ---")
        print("                 " + "".join(f"{h:>10d}ヶ月" for h in HOLDS))
        for key, rate, name in APPR:
            r = f"年{int(rate*100)}%" if rate is not None else "年6%"
            line = "".join(f"{pct(split(total,h,rate)['inv_yld']):>12s}" for h in HOLDS)
            print(f"  {name:10s}{r:>6s}{line}")

    print()
    print("=" * 104)
    print("【4】感応度（主線＝回転12ヶ月）")
    print("=" * 104)
    for label, total in CLOSES:
        b = split(total, 12)["inv_yld"]
        print(f"\n--- {label}　基準 {pct(b)} ---")
        cases = [
            ("在庫回転 12 → 18ヶ月",      split(total, 18)["inv_yld"]),
            ("ワイン価格上昇 6% → 0%",    split(total, 12, rate=0.0)["inv_yld"]),
            ("稼働率 95% → 85%",          split(total, 12, util=0.85)["inv_yld"]),
            ("B2Cのモール手数料 5.5→8.0%",
             split(total, 12, uu=spc_unit(sc=dict(BASE, rate_b2c=0.137)))["inv_yld"]),
            ("ワイン価格上昇 6% → 10%",   split(total, 12, rate=0.10)["inv_yld"]),
            ("αを1pt下げる（20.8→19.8%）",
             split(total, 12, book=JIKA*(1-ALPHA+0.01))["inv_yld"]),
            ("【遮断】市中仕入 50 → 45",
             split(total, 12, uu=spc_unit(sc=dict(BASE, mkt_cost=45)))["inv_yld"]),
            ("【遮断】売値 ▲5%",
             split(total, 12, uu=spc_unit(book=unit(**M.SCENARIOS["ネガティブ"])["price"]*(1-ALPHA),
                                          sc=M.SCENARIOS["ネガティブ"]))["inv_yld"]),
        ]
        for n, v in cases:
            print(f"  {n:28s} {pct(v):>7s}  ({(v-b)*100:+.1f}pt)")

    print()
    print("=" * 104)
    print(f"【5】{TARGET:.0%}を割り込む回転期間")
    print("=" * 104)
    for label, total in CLOSES:
        b = breakeven(total)
        print(f"  {label:16s} ニュートラル 回転 {b:5.1f}ヶ月（余裕 {b-12:+.1f}ヶ月）"
              f"／ 上昇0% 回転 {breakeven(total, 0.0):5.1f}ヶ月")

    print()
    print("=" * 104)
    print("【6】前回（原価卸＋折半）との対照　回転12ヶ月・総額5億")
    print("=" * 104)
    L, Nw = legacy(), split(5e8, 12)
    rows = [
        ("SPC簿価（定価比）", f"{L['spc_cost']:.2f}", f"{BOOK:.2f}"),
        ("SPC年間税前利益", f"{L['pretax']/1e8:.2f}億円", f"{Nw['pretax']/1e8:.2f}億円"),
        ("投資家取分", f"{L['inv']/1e6:.0f}百万円", f"{Nw['inv']/1e6:.0f}百万円"),
        ("投資家利回り", pct(L['inv_yld']), pct(Nw['inv_yld'])),
        ("WineBank値入れ（前取り）", f"{L['transfer']/1e6:.0f}百万円", f"{Nw['transfer']/1e6:.0f}百万円"),
        ("WineBank成功報酬", f"{L['fee']/1e6:.0f}百万円", "なし"),
        ("WineBank合計", f"{L['wb_total']/1e6:.0f}百万円", f"{Nw['wb_total']/1e6:.0f}百万円"),
        ("両者合計（パイ）", f"{(L['inv']+L['wb_total'])/1e6:.0f}百万円",
         f"{(Nw['inv']+Nw['wb_total'])/1e6:.0f}百万円"),
        ("年間販売額", f"{L['sales']/1e8:.2f}億円", f"{Nw['sales']/1e8:.2f}億円"),
        (f"{TARGET:.0%}の分岐点", f"回転{legacy_breakeven():.1f}ヶ月", f"回転{breakeven(5e8):.1f}ヶ月"),
    ]
    print(f"  {'':26s}{'前回（原価卸＋折半）':>24s}{'今回（時価−α卸）':>22s}")
    for r in rows:
        print(f"  {r[0]:26s}{r[1]:>24s}{r[2]:>22s}")

    # ─────────────────────────────────────────────── figures.json 出力
    def close_block(total):
        x12 = split(total, 12)
        def hold_row(h):
            d = split(total, h)
            return dict(sales=d["sales"], pretax=d["pretax"], inv=d["inv"],
                        wb_equity=d["wb_equity"], transfer=d["transfer"],
                        wb_total=d["wb_total"], inv_yld=d["inv_yld"],
                        gross=d["gross"], selling=d["selling"], cost=d["cost"],
                        avg5=avg5(total, h), appr0=split(total, h, 0.0)["inv_yld"],
                        k=M.appr(h))
        return dict(
            total=total, wb_capital=total*WB_RATIO, inv_capital=total*INV_RATIO,
            mgmt=total*MGMT_RATE,
            holds={str(h): hold_row(h) for h in HOLDS},
            scenarios={key: {str(h): dict(
                        sales=split(total, h, rate)["sales"],
                        pretax=split(total, h, rate)["pretax"],
                        inv=split(total, h, rate)["inv"],
                        inv_yld=split(total, h, rate)["inv_yld"]) for h in HOLDS}
                       for key, rate, _ in APPR},
            sensitivity=dict(
                base=x12["inv_yld"],
                hold18=split(total, 18)["inv_yld"],
                appr0=split(total, 12, rate=0.0)["inv_yld"],
                appr10=split(total, 12, rate=0.10)["inv_yld"],
                util85=split(total, 12, util=0.85)["inv_yld"],
                mall8=split(total, 12, uu=spc_unit(sc=dict(BASE, rate_b2c=0.137)))["inv_yld"],
                alpha1=split(total, 12, book=JIKA*(1-ALPHA+0.01))["inv_yld"],
                cost45=split(total, 12, uu=spc_unit(sc=dict(BASE, mkt_cost=45)))["inv_yld"],
                price5=split(total, 12,
                             uu=spc_unit(book=unit(**M.SCENARIOS["ネガティブ"])["price"]*(1-ALPHA),
                                         sc=M.SCENARIOS["ネガティブ"]))["inv_yld"],
            ),
            breakeven=dict(neutral=breakeven(total), appr0=breakeven(total, 0.0),
                           appr10=breakeven(total, 0.10)),
            cost_detail={k: v for k, v in x12["cost_detail"].items()},
        )

    held = {key: {k: v for k, v in M.unit_held(U, 12, rate).items()}
            for key, rate, _ in APPR}

    figures = dict(
        scheme="時価−α卸・プロラタ配分型（WineBank現物出資60%＋投資家出資40%）",
        params=dict(wb_ratio=WB_RATIO, inv_ratio=INV_RATIO, mgmt_rate=MGMT_RATE,
                    alpha=ALPHA, jika=JIKA, book=BOOK, target=TARGET,
                    mkt_cost=BASE["mkt_cost"], util=M.UTIL,
                    appreciation=M.APPRECIATION, term_years=M.TERM_YEARS,
                    ramp_months=M.RAMP_MONTHS, fixed_base=FIXED_BASE,
                    transfer_rate=(BOOK-BASE["mkt_cost"])/BOOK),
        unit={k: v for k, v in U.items()}, unit_held=held,
        first=close_block(5e8), second=close_block(10e8),
        legacy=dict(**{k: v for k, v in legacy().items()},
                    avg5=legacy_avg5(), breakeven=legacy_breakeven()),
    )
    with open("figures.json", "w", encoding="utf-8") as f:
        json.dump(figures, f, ensure_ascii=False, indent=1)
    print("\nwritten: figures.json")
