# -*- coding: utf-8 -*-
"""シンプル版のモデル：WineBank単体を最新の3か年予算（プランE）に置き換える。

出所：Drive「261028_取締役会資料」フォルダの
      WineBank_3か年計画_FY2027-2029_v16_FY26試算表1030版.xlsx（①3年サマリー）
      売上高・営業利益の合計だけを使う（内訳は作成中のため使わない）。
2029・2030年度は予算に無いため、予算期間（2026→2028年度）の伸びで延長した仮置き：
      売上高は年率（2年の平均成長率）、営業利益は年あたりの増加額（2年の平均）。
カンテサンス・資本政策・プレバリューは ../20261114_5か年計画_資本政策/build_plan5.py をそのまま使う。

使い方:  python3 wb_budget.py model_simple.json   （スライド用のJSONを書き出す）
"""
import json
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "20261114_5か年計画_資本政策"))
import build_plan5 as bp  # noqa: E402

# 3か年予算（プランE）：決算年（9月期）→（売上高, 営業利益）百万円
BUDGET = {2027: (1200.000, 54.905), 2028: (1438.750, 88.117), 2029: (1803.375, 149.446)}
BUDGET_SRC = "3か年予算 v16（FY26試算表1030版・プランE）"
G_REV = (BUDGET[2029][0] / BUDGET[2027][0]) ** 0.5          # 売上高の年率（約1.226）
D_OP = (BUDGET[2029][1] - BUDGET[2027][1]) / 2               # 営業利益の年あたり増加額（約47百万円）


def wb_series():
    s = dict(BUDGET)
    for y in (2030, 2031):
        r0, o0 = s[y - 1]
        s[y] = (r0 * G_REV, o0 + D_OP)
    return s


def patch():
    wb = dict(key="wb", seg="ワイン・WineTech", name="WineBank（単体）", fy=9, own=1.0, grp=2, series=wb_series(),
              src=f"2026〜2028年度＝{BUDGET_SRC}の売上高・営業利益。2029・2030年度は予算期間の伸び"
                  f"（売上高 年{(G_REV - 1) * 100:.1f}%、営業利益 年+{D_OP:.0f}百万円）で延長した仮置き")
    bp.ENT = [wb] + [e for e in bp.ENT if not e["key"].startswith("wb_")]
    bp.SEG_OP_OVERRIDE = {}


def model():
    patch()
    m = bp.build()
    v = bp.valuation(m)
    c = bp.cap_table(v["pre2"])
    m["valuation"] = v
    m["cap"] = dict(c, last_price=bp.LAST_PRICE, holders=bp.CAP,
                    rounds={k: dict(round=r_, shares=round(r_ * 1e8 / c["price"])) for k, r_ in bp.ROUNDS},
                    reorg_shares=round(sum(round(x, 1) for x in v["reorg"].values()) * 1e8 / c["price"]))
    m["wb_budget"] = dict(src=BUDGET_SRC, g_rev=G_REV, d_op=D_OP, budget_years=3)
    return m


if __name__ == "__main__":
    M = model()
    json.dump(M, open(sys.argv[1], "w", encoding="utf-8"), ensure_ascii=False, indent=1, default=str)
    p = M["p2"]
    print("WB", [round(x / 100, 2) for x in M["segments"][0]["rev"]], [round(x / 100, 2) for x in M["segments"][0]["op"]])
    print("連結", [round(x / 100, 1) for x in p["rev"]], [round(x / 100, 1) for x in p["op"]])
    for k in ("r5", "r10"):
        print(k, [round(x / 100, 1) for x in M["scn"][k]["p2"]["attrib_op"]], round(M["scn"][k]["p2"]["attrib_ni"][4] / 100, 2))
    print("pre2", M["valuation"]["pre2"])
