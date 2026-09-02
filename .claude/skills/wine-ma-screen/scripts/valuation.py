#!/usr/bin/env python3
"""WineBank基準の買収価格上限を計算する。

上限A = 純資産 + 営業利益 x 3年       (収益型)
上限B = 純資産 + EBITDA   x 4年       (設備型)
赤字  = 純資産以下

総投資額 = 譲渡価格 + 仲介手数料(レーマン方式) で判定する。
"""
import argparse


def lehman_fee(price, min_fee=5_000_000):
    """レーマン方式の仲介手数料。price は取引対価(円)。"""
    # 1億円以下は最低報酬、超過分を各バンドの料率で加算
    if price <= 100_000_000:
        return min_fee
    remaining = price - 100_000_000
    fee = min_fee
    for cap, rate in [(400_000_000, 0.05), (500_000_000, 0.04),
                      (4_000_000_000, 0.03), (float("inf"), 0.02)]:
        take = min(remaining, cap)
        fee += take * rate
        remaining -= take
        if remaining <= 0:
            break
    return fee


def man(v):
    """円 -> 万円表記"""
    return f"{v / 10_000:,.0f}万円"


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--name", default="対象会社")
    p.add_argument("--net-assets", type=float, required=True, help="純資産(円)")
    p.add_argument("--op-income", type=float, required=True, help="直近営業利益(円)")
    p.add_argument("--op-income-avg", type=float,
                   help="3期平均営業利益(円)。指定時はこちらで上限Aを計算")
    p.add_argument("--depreciation", type=float, default=0.0, help="減価償却費(円)")
    p.add_argument("--maintenance-capex", type=float, default=0.0,
                   help="維持更新capex(円)。設備型で必ず入れる")
    p.add_argument("--cash", type=float, default=0.0, help="現預金(円)")
    p.add_argument("--debt", type=float, default=0.0, help="有利子負債(円)")
    p.add_argument("--asking-price", type=float, help="提示されている譲渡価格(円)")
    p.add_argument("--min-fee", type=float, default=5_000_000,
                   help="仲介の最低報酬(円)。150万〜500万でばらつく")
    a = p.parse_args()

    op = a.op_income_avg if a.op_income_avg is not None else a.op_income
    ebitda = a.op_income + a.depreciation
    ebitda_adj = ebitda - a.maintenance_capex

    cap_a = a.net_assets + op * 3
    cap_b = a.net_assets + ebitda * 4
    cap_b_adj = a.net_assets + ebitda_adj * 4

    print(f"=== {a.name} ===")
    print(f"純資産            : {man(a.net_assets)}")
    print(f"営業利益(採用値)  : {man(op)}")
    print(f"減価償却費        : {man(a.depreciation)}")
    print(f"EBITDA            : {man(ebitda)}")
    if a.maintenance_capex:
        print(f"EBITDA-維持capex  : {man(ebitda_adj)}")
    print(f"ネットデット      : {man(a.debt - a.cash)}")
    print()
    if op <= 0:
        print("営業赤字 → 上限は純資産以下: " + man(a.net_assets))
    print(f"上限A 純資産+営業利益x3 : {man(cap_a)}")
    print(f"上限B 純資産+EBITDAx4   : {man(cap_b)}")
    if a.maintenance_capex:
        print(f"上限B' capex調整後      : {man(cap_b_adj)}")
    if ebitda > 0 and a.depreciation / ebitda >= 0.7:
        print("  !! 減価償却がEBITDAの7割超。上限Bは償却に値段を払う形になる。"
              "維持capexを引いた上限B'で判断すること。")
    print(f"譲渡価格上限(社内) : {man(1_000_000_000)}")

    if a.asking_price:
        fee = lehman_fee(a.asking_price, a.min_fee)
        total = a.asking_price + fee
        print()
        print(f"提示価格          : {man(a.asking_price)}")
        print(f"仲介手数料(概算)  : {man(fee)}")
        print(f"総投資額          : {man(total)}")
        best = max(cap_a, cap_b_adj if a.maintenance_capex else cap_b)
        verdict = "上限内" if total <= best else "上限超過"
        print(f"判定              : {verdict}（対 上限 {man(best)}、"
              f"差 {man(best - total)}）")


if __name__ == "__main__":
    main()
