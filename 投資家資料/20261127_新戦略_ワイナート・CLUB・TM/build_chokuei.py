# ティエリーマルクスを直営（運営会社100%）にした場合の事業計画・プレ／ポスト（2026/11/27 社内検討用）
# 単位：百万円（WB期＝10月〜翌9月）。バリュエーションは億円。
import openpyxl
from openpyxl.styles import Font, PatternFill
import build_upside as U

YRS = U.YRS
TAX = 0.34
# ── WineBank単体：戸髙さん 5か年月次計画 v2.8（11/26）。予算v16と一致
WB = {2027: (1199.95, 54.90), 2028: (1438.92, 88.10), 2029: (1804.30, 149.43), 2030: (2211.86, 200.01), 2031: (2711.84, 240.03)}
WB_NONOP = {2027: 15, 2028: 20, 2029: 25, 2030: 25, 2031: 25}
TM_CONSULT = 2.5          # v2.8「上乗せ案件」のTMコンサル料。直営では社内取引で消去

# ── TM店舗（10/27投資家資料の5か年計画、3月決算）→ WB期
TM = U.TM
HQ_FY3 = {2027: 0, 2028: 15, 2029: 28, 2030: 40, 2031: 48, 2032: 55}     # 事業収支統合モデル（10/10）の本部費
HQ = {y: 0.5 * HQ_FY3[y] + 0.5 * HQ_FY3[y + 1] for y in YRS}
HQ_SAVE = 0.30            # 直営で管理・人事・購買をWB本部と共通化
WINE_SYN = 0.011          # 直輸入ワインの原価改善：ワイン売上比22%×原価率5pt（30%→25%）
STORES = {2027: 1, 2028: 3, 2029: 5, 2030: 7, 2031: 9}                     # WB期末に近い店舗数（概算）
# 家主の分割払い（内装・保証金）の残高に金利3%（モデルでは未考慮）
INST_BAL = {2027: 62, 2028: 245, 2029: 472, 2030: 668, 2031: 832}
TM_INT = {y: INST_BAL[y] * 0.03 for y in YRS}

# ── 直営後の連結
def row(y):
    wb_r, wb_o = WB[y][0] - TM_CONSULT, WB[y][1] - TM_CONSULT
    cl_r, cl_o = U.CLUB_R[y], U.CLUB_O[y]
    wi_r, wi_o = U.WIN[y][0] + U.SYN_R[y], U.WIN[y][1] + U.SYN_O[y]
    tm_r, tm_o = TM[y]
    syn = HQ[y] * HQ_SAVE + tm_r * WINE_SYN
    rev = wb_r + cl_r + wi_r + tm_r
    op = wb_o + cl_o + wi_o + tm_o + syn
    pre = op - WB_NONOP[y] - TM_INT[y]
    ni = pre * (1 - TAX)
    return dict(wb_r=wb_r, wb_o=wb_o, cl_r=cl_r, cl_o=cl_o, wi_r=wi_r, wi_o=wi_o, tm_r=tm_r, tm_o=tm_o,
                syn=syn, rev=rev, op=op, pre=pre, ni=ni)
P = {y: row(y) for y in YRS}

# ── バリュエーション（億円）
WB_PRE = 26.1; SH0 = 5790; RATE = 0.25
TM_SH = dict(nakano=1300, p3=700, ext=200)          # 11/24 1,984株＋12/1池上様66株＋P3残150株（2027/2）
TM_TOTAL = sum(TM_SH.values())
PX_COST, PX_LAST = 0.10, 0.16                        # 億円/100株ではなく「百万円/株」→ 10万円・16万円（億円換算は下で）
buy = (TM_SH["nakano"] + TM_SH["p3"]) * 10 / 1e4 + TM_SH["ext"] * 16 / 1e4   # 億円
EBITDA31, EBITDA_RUN, MULT, LANDLORD, DEPOSIT, ADD_DEBT = 4.23, 5.16, 5.0, 9.1, 3.5, 3.4
eq = lambda e: e * MULT - LANDLORD + DEPOSIT - ADD_DEBT
TM_VAL = dict(last=TM_TOTAL * 16 / 1e4, pv=eq(EBITDA31) / (1 + RATE) ** 5, run=eq(EBITDA_RUN) / (1 + RATE) ** 5)
TM_V = TM_VAL["pv"]
px = round((WB_PRE + TM_V - buy) / SH0 * 1e4)        # 万円/株
pre_cash = px * SH0 / 1e4
xch_sh = round((TM_SH["nakano"] + TM_SH["p3"]) * 10 / px)   # 中野・P3分を株式交換
pre_xch = px * (SH0 + xch_sh) / 1e4
def rnd(raise_, sh_pre):
    new = round(raise_ * 1e4 / px); post = px * (sh_pre + new) / 1e4
    ni30 = P[2031]["ni"] / 100; mc = ni30 * 20
    own = new / (sh_pre + new)
    return dict(new=new, post=post, own=own, mc=mc, mult=mc * own / raise_, vc=mc / (1 + RATE) ** 4.5 - raise_)
R = {(k, r): rnd(r, sh) for k, sh in (("現金", SH0), ("交換", SH0 + xch_sh)) for r in (5.0, 7.0)}

if __name__ == "__main__":
    for y in YRS:
        p = P[y]; print(y, " ".join(f"{k}={v:7.1f}" for k, v in p.items()))
    print("buy", round(buy, 2), "TM_VAL", {k: round(v, 2) for k, v in TM_VAL.items()}, "px", px, "pre_cash", pre_cash, "xch_sh", xch_sh, "pre_xch", pre_xch)
    for k, v in R.items(): print(k, {a: round(b, 2) for a, b in v.items()})
    wb = openpyxl.Workbook()
    H = Font(bold=True); F = PatternFill("solid", fgColor="DDE4EE")
    ws = wb.active; ws.title = "直営_5か年"
    ws.append(["ティエリーマルクス直営ケース 5か年（百万円、WB期）"]); ws["A1"].font = Font(bold=True, size=12)
    ws.append(["項目"] + [f"{y%100}/9期" for y in YRS] + ["根拠"])
    for c in ws[2]: c.font = H; c.fill = F
    lines = [("WineBank単体 売上", "wb_r", "戸髙 5か年月次計画v2.8（TMコンサル料2.5百万円を消去）"),
             ("WineBank単体 営業利益", "wb_o", "同上"),
             ("新CLUB 売上（増分）", "cl_r", "新モデル収支試算"), ("新CLUB 営業利益", "cl_o", ""),
             ("ワイナート（読者シナジー込み）売上", "wi_r", "取締役会報告"), ("ワイナート 営業利益", "wi_o", ""),
             ("TM直営店 売上", "tm_r", "10/27 TM5か年（3月決算）をWB期へ換算"), ("TM直営店 営業利益（計画）", "tm_o", ""),
             ("直営シナジー（本部共通化30%＋直輸入ワイン1.1%）", "syn", "仮定"),
             ("連結 売上", "rev", ""), ("連結 営業利益", "op", ""),
             ("経常利益（WB営業外＋家主分割の金利3%）", "pre", ""), ("当期純利益（税34%、少数株主なし）", "ni", "")]
    for lab, k, src in lines:
        ws.append([lab] + [round(P[y][k], 1) for y in YRS] + [src])
        if k in ("rev", "op", "ni"): ws.cell(ws.max_row, 1).font = H
    ws.append(["TM店舗数（期末・概算）"] + [STORES[y] for y in YRS])
    ws.column_dimensions["A"].width = 44; ws.column_dimensions["G"].width = 48
    v = wb.create_sheet("プレ・ポスト")
    v.append(["直営（運営会社100%取得）のプレ・ポスト（億円）"]); v["A1"].font = Font(bold=True, size=12)
    rows = [("WineBank単体（前回ポスト）", WB_PRE),
            ("TM運営会社100%の評価：直近株価16万円×2,200株", TM_VAL["last"]),
            ("　　〃　：2031年の売却価値を年25%・5年で割戻し（採用）", TM_VAL["pv"]),
            ("　　〃　：ランレート（9店舗成熟）", TM_VAL["run"]),
            ("取得対価：中野1,300株・P3 700株は10万円、外部200株は16万円", buy),
            ("1株価格（万円）", px),
            ("プレ（現金で取得・5,790株）", pre_cash),
            (f"プレ（中野・P3分を株式交換：{xch_sh}株発行）", pre_xch)]
    for a, b in rows: v.append([a, round(b, 2)])
    v.append([]); v.append(["ラウンド", "取得方法", "新株", "ポスト", "投資家持分", "上場時時価総額(PER20)", "投資倍率", "VC方式のプレ"])
    for (k, r), d in R.items():
        v.append([f"{r:.0f}億円", k, d["new"], round(d["post"], 1), round(d["own"], 3), round(d["mc"], 1), round(d["mult"], 2), round(d["vc"], 1)])
    v.column_dimensions["A"].width = 58
    wb.save("TM直営ケース_事業計画とバリュエーション_20261127.xlsx")
