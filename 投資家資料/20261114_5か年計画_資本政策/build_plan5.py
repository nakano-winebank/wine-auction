# -*- coding: utf-8 -*-
"""5か年計画（2026年度〜2030年度）と資本政策を作る（HIRAC岡田様のご依頼、2026/11/14）。

- 各社計画は ../20261022_VC資本業務提携/build_model.py の前提を引き継ぎ、2030年度まで延長する。
- カンテサンスは、榊原様に提出した計画（2026/11/12メール）の【B】新規事業込み＝IM計画（【A】）＋新規事業
  （ガトー・オ・コンテ拡大・一品スイーツ店・ワインショップ／バー）で統合する。
- 集計パターン
    ① グループ全体：WineBank＋カンテサンス＋アピシウス＋ブラッスリー（ティエリーマルクス）＋レストラン運営
    ② WineBank＋カンテサンス：アピシウス以下（組織再編で集約する持分）を除く
    ③ 持分按分：①・②それぞれを各社の持分で按分
- 年度＝WineBank決算期（10月〜翌9月）。2026年度＝2026/10〜2027/9。各社は月割りで組み替える。

使い方: python3 build_plan5.py <出力json> <出力xlsx>
"""
import json
import sys

import openpyxl
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter as CL

N = 5
YEARS = [f"{2026 + i}年度" for i in range(N)]
PERIOD = [f"{2026 + i}/10-{2027 + i}/9" for i in range(N)]
TAX = 0.34

# ───────── 各社の自社決算期ベースの計画（百万円）。2026/10/22モデルに2031年（TMは2032年）を追加 ─────────
ENT = [
    dict(key="wb_base", seg="ワイン・WineTech", name="WineBank 既存ワイン事業", fy=9, own=1.0, grp=2,
         series={2027: (750.5, 22.9), 2028: (788.0, 34.2), 2029: (827.4, 46.0), 2030: (868.8, 58.4),
                 2031: (912.2, 71.4)},
         src="2026/10/22モデル。2031年9月期は年5%成長・増分粗利率30%で延長"),
    dict(key="wb_fund", seg="ワイン・WineTech", name="WineBank 私募ファンド・オークション", fy=9, own=1.0, grp=2,
         series={2027: (0.0, 0.0), 2028: (300.0, 90.0), 2029: (300.0, 90.0), 2030: (300.0, 90.0),
                 2031: (300.0, 90.0)},
         src="2026/10/22モデル（300・粗利率30%据置）"),
    dict(key="wb_mile", seg="ワイン・WineTech", name="WineBank ワインマイル", fy=9, own=1.0, grp=2,
         series={2027: (0.0, 0.0), 2028: (77.4, 19.0), 2029: (138.7, 34.6), 2030: (208.1, 52.0),
                 2031: (277.5, 69.4)},
         src="ワインマイル3か年PL（最新レートカード）。4年目は3年目と同じ増加幅で延長"),
    dict(key="quint", seg="カンテサンス", name="カンテサンス 既存（本店・IM計画）", fy=12, own=0.51, grp=2,
         series={2026: (1015.0, 528.0), 2027: (1062.0, 556.0), 2028: (1095.0, 576.0), 2029: (1129.0, 598.0),
                 2030: (1169.8, 623.3), 2031: (1211.9, 650.0)},
         src="IM計画（榊原様提出の【A】既存計画のみ：営業利益5.56/5.76/5.98/6.23/6.50億円）。"
             "2031年の売上はIMの成長率3.6%で延長"),
    dict(key="quint_new", seg="カンテサンス", name="カンテサンス 新規事業", fy=12, own=0.51, grp=2,
         series={2026: (0.0, 0.0), 2027: (11.0, 3.0), 2028: (255.0, 77.0), 2029: (489.0, 147.0),
                 2030: (753.0, 207.0), 2031: (933.0, 261.0)},
         src="榊原様提出の【B】新規事業：ガトー・オ・コンテ拡大（2027/11〜2倍、2028/11〜3倍）、"
             "一品スイーツ店（2028年1月から毎年1店舗、投資5,000万円/店）、ワインショップ・バー（2030年1月〜）"),
    dict(key="apicius", seg="アピシウス", name="アピシウス", fy=12, own=0.7, grp=1,
         series={2026: (700.0, 130.0), 2027: (721.0, 134.1), 2028: (742.6, 138.1), 2029: (764.9, 142.2),
                 2030: (787.9, 146.5), 2031: (811.5, 150.9)},
         src="2026年12月期 着地予想。以降売上年3%・営業利益率18.6%の仮置き"),
    dict(key="tm", seg="ブラッスリー", name="Brasserie Thierry Marx", fy=3, own=0.667, grp=1,
         series={2027: (0.0, 0.0), 2028: (381.0, 10.3), 2029: (891.2, 39.1), 2030: (1729.4, 105.8),
                 2031: (2576.1, 184.0), 2032: (3426.0, 257.0)},
         src="事業収支統合モデルv4（4月〜3月期）。2032年3月期は前年と同じ増加幅・営業利益率7.5%で延長（仮置き）"),
    dict(key="rest", seg="レストラン運営", name="レストラン運営（グループ各社）", fy=9, own=0.6, grp=1,
         series={2027: (1505.2, 100.0), 2028: (1526.4, 100.0), 2029: (1548.2, 100.0), 2030: (1570.7, 100.0),
                 2031: (1593.8, 100.0)},
         src="グループのレストラン運営会社をひとくくりで計上（社名は非開示）。営業利益は年1億円で5年横ばい、持分60%で統一。"
             "売上は各社の着地予想の合計（WineBank年度に組替え済み）"),
]
SEGMENTS = ["ワイン・WineTech", "カンテサンス", "アピシウス", "ブラッスリー", "レストラン運営"]
# 経営判断によるセグメント営業利益の上書き（2026/10/22 デックp.41）。2030年度はモデル値を使う
SEG_OP_OVERRIDE = {"ワイン・WineTech": [10.0, 100.0, 150.0, 200.0, None]}
APICIUS_NAV = 5.18   # アピシウスの純資産（億円）：2025年12月期 決算報告書（ワイン在庫は簿価3.76億円で、含み益は含まない）
# カンテサンス（合併後の会社）の当期純利益：金利・投資家への年3%・AM報酬・特典費用・後継料理長・税を控除後
# 榊原様提出【B】（暦年）
QUINT_NI_B0 = {2027: 281.0, 2028: 340.0, 2029: 409.0, 2030: 459.0, 2031: 520.0}
QUINT_NI_A0 = {2027: 279.0, 2028: 290.0, 2029: 312.0, 2030: 324.0, 2031: 349.0}
# 成長対価（2026/11/13 礒田様宛て最終提案）：2.4億円−仲介手数料の減額0.6億円＝実質1.8億円。
# 追加対価5億円と同じく、3年後（2029年末）に業績達成を前提として支払い、同額を追加借入（金利4%）で手当てする
EARNOUT_BASE = 5.0
EARNOUT_GROWTH = 1.8
LOAN_RATE = 0.04
_int_after_tax = EARNOUT_GROWTH * 100 * LOAN_RATE * (1 - 0.34)      # 百万円／年（2030年以降）
QUINT_NI_B = {y: v - (_int_after_tax if y >= 2030 else 0.0) for y, v in QUINT_NI_B0.items()}
QUINT_NI_A = {y: v - (_int_after_tax if y >= 2030 else 0.0) for y, v in QUINT_NI_A0.items()}
# 本ラウンドの調達ケース（億円）。調達額の80%で、買収SPCの外部投資家の持分（出資15億円＝49%）を同じ条件で取得する
ROUNDS = [("r5", 5.0), ("r10", 10.0)]
ALLOC = 0.80
SPC_INV = 15.0
BASE_OWN = 0.51
INV_FEE = 0.03       # 外部投資家への年3%（取得した分は支払いがなくなる）


def quint_own(rnd):
    return BASE_OWN + (1 - BASE_OWN) * min(ALLOC * rnd, SPC_INV) / SPC_INV


def months_in(fy_end_month, wb_year):
    out = {}
    y, m = wb_year, 10
    for _ in range(12):
        fy_year = y if m <= fy_end_month else y + 1
        out[fy_year] = out.get(fy_year, 0) + 1
        m += 1
        if m == 13:
            y, m = y + 1, 1
    return sorted(out.items())


def to_wb(series, fy_end):
    rev, op = [], []
    for i in range(N):
        r = o = 0.0
        for fy, n in months_in(fy_end, 2026 + i):
            rr, oo = series[fy] if isinstance(series[fy], tuple) else (series[fy], 0.0)
            r += rr * n / 12
            o += oo * n / 12
        rev.append(r)
        op.append(o)
    return rev, op


def quint_ni_wb(ni):
    # 2026年10〜12月は取得前（期初取得を仮定するプロフォーマのため、2027年の純利益の月割りを当てる）
    s = dict(ni)
    s[2026] = ni[2027]
    return to_wb({k: (v, 0.0) for k, v in s.items()}, 12)[0]


def build():
    ents = []
    for e in ENT:
        rev, op = to_wb(e["series"], e["fy"])
        ents.append(dict(key=e["key"], seg=e["seg"], name=e["name"], own=e["own"], grp=e["grp"], fy=e["fy"],
                         rev=rev, op=op, src=e["src"]))
    segs = []
    for sg in SEGMENTS:
        mem = [e for e in ents if e["seg"] == sg]
        rev = [sum(e["rev"][i] for e in mem) for i in range(N)]
        opm = [sum(e["op"][i] for e in mem) for i in range(N)]
        ov = SEG_OP_OVERRIDE.get(sg, [None] * N)
        op = [ov[i] if ov[i] is not None else opm[i] for i in range(N)]
        att = [op[i] * sum(e["op"][i] * e["own"] for e in mem) / opm[i] if opm[i] else 0 for i in range(N)]
        segs.append(dict(name=sg, rev=rev, op=op, op_model=opm, attrib=att, grp=mem[0]["grp"],
                         own=mem[0]["own"], overridden=[ov[i] is not None for i in range(N)]))

    def agg(names):
        ss = [s for s in segs if s["name"] in names]
        return dict(rev=[sum(s["rev"][i] for s in ss) for i in range(N)],
                    op=[sum(s["op"][i] for s in ss) for i in range(N)],
                    attrib_op=[sum(s["attrib"][i] for s in ss) for i in range(N)])

    p1 = agg(SEGMENTS)
    p2 = agg(["ワイン・WineTech", "カンテサンス"])
    # 持分按分後の当期純利益（目安）：カンテサンスは合併後の会社の純利益×51%、それ以外は営業利益×(1−34%)
    q_ni = quint_ni_wb(QUINT_NI_B)
    q_ni_a = quint_ni_wb(QUINT_NI_A)
    other1 = [p1["attrib_op"][i] - segs[1]["attrib"][i] for i in range(N)]
    other2 = [p2["attrib_op"][i] - segs[1]["attrib"][i] for i in range(N)]
    p1["attrib_ni"] = [other1[i] * (1 - TAX) + q_ni[i] * 0.51 for i in range(N)]
    p2["attrib_ni"] = [other2[i] * (1 - TAX) + q_ni[i] * 0.51 for i in range(N)]
    # 調達ケースごとの持分按分（カンテサンスの持分が増える。外部投資家への年3%が減る分を純利益に加える）
    qop = segs[1]["op"]
    oth1 = [other1[i] * (1 - TAX) for i in range(N)]
    oth2 = [other2[i] * (1 - TAX) for i in range(N)]
    scn = {}
    for key, rnd in ROUNDS:
        own = quint_own(rnd)
        fee = INV_FEE * min(ALLOC * rnd, SPC_INV) * 100 * (1 - TAX)   # 百万円
        qni = [q_ni[i] + fee for i in range(N)]
        scn[key] = dict(round=rnd, own=own, buy=min(ALLOC * rnd, SPC_INV), fee_saved=fee,
                        p1=dict(attrib_op=[other1[i] + qop[i] * own for i in range(N)],
                                attrib_ni=[oth1[i] + qni[i] * own for i in range(N)]),
                        p2=dict(attrib_op=[other2[i] + qop[i] * own for i in range(N)],
                                attrib_ni=[oth2[i] + qni[i] * own for i in range(N)]))
    qa = [e for e in ents if e["key"] == "quint"][0]
    qn = [e for e in ents if e["key"] == "quint_new"][0]
    return dict(years=YEARS, period=PERIOD, entities=ents, segments=segs, p1=p1, p2=p2, scn=scn,
                other_op=dict(p1=other1, p2=other2),
                quint=dict(rev_a=qa["rev"], op_a=qa["op"], rev_new=qn["rev"], op_new=qn["op"],
                           ni_b=q_ni, ni_a=q_ni_a),
                tax=TAX)


# ───────── プレバリュー（①・②）と資本政策 ─────────
CAP = [  # 2026年1月ラウンド後（資本政策20260131）。株数
    ("中野邦人", 3413, 170), ("小田垣栄司", 200, 0), ("株式会社PrivateBANK", 375, 0),
    ("マネーフォワードベンチャーズ（HIRAC FUND 2号）", 749, 0), ("株式会社ベクトル", 157, 0), ("寺田倉庫株式会社", 52, 0),
    ("株式会社スペースバンク", 45, 46), ("個人投資家様", 90, 0), ("Clown Jewel box LLC（SO）", 0, 287),
    ("戸高薫（SO）", 0, 200), ("執行役員・従業員等（SO）", 0, 6),
]
LAST_PRICE = 450_000          # 2026年1月ラウンドの1株価格


def valuation(m):
    """プレバリューの目安（億円）。①と②の差は、組織再編で集約する持分の価値。"""
    q = m["quint"]
    v = {}
    # (a) WineBank単体（WineTech）：前回ポスト26.1億円と同水準に置く（WineTech単体の利益はまだ小さいため、
    #     評価の上げ幅はカンテサンス取得分で説明する）
    v["wb"] = 26.1
    # (b) カンテサンス持分：SPCの株式価値の増加のうちWineBank帰属分（51%＋成果報酬15%）の現在価値
    #     榊原様提出の【B】第三者売却（2031年末・EBITDA×6.2倍）：株式価値53.1億円−投資家出資15億円＝38.1億円から、
    #     成長対価1.8億円の追加借入（2031年末に残る）を差し引く
    gain = 38.1 - EARNOUT_GROWTH
    wb_take = gain * 0.51 + gain * 0.49 * 0.15
    v["quint_exit"] = wb_take
    v["quint_pv"] = {r: wb_take / (1 + r) ** 5 for r in (0.20, 0.25, 0.30)}
    v["quint"] = round(v["quint_pv"][0.25], 1)
    # (c) 組織再編で集約する持分（①のみ）：2026年度の営業利益×倍率、TMは直近の第三者割当の株価
    ap = [e for e in m["entities"] if e["key"] == "apicius"][0]["op"][0] / 100
    rs = [e for e in m["entities"] if e["key"] == "rest"][0]["op"][0] / 100
    v["apicius_op"] = ap * 6.2 * 0.7
    v["apicius_nav"] = APICIUS_NAV * 0.7
    v["reorg"] = dict(apicius=v["apicius_op"] + v["apicius_nav"], tm=3.52 * 0.667, rest=rs * 4.0 * 0.6)
    v["reorg_sum"] = sum(v["reorg"].values())
    v["pre2"] = v["wb"] + v["quint"]
    v["pre1"] = v["pre2"] + v["reorg_sum"]
    # (d) VC方式の検証：2030年度の持分按分後純利益（調達ケース別）×PER÷(1+目標IRR)^4.5 − 調達額
    v["vc"] = {}
    for sk, rnd in ROUNDS:
        for key in ("p1", "p2"):
            ni = m["scn"][sk][key]["attrib_ni"][4] / 100
            v["vc"][f"{sk}_{key}"] = {f"{per}_{int(irr * 100)}": ni * per / (1 + irr) ** 4.5 - rnd
                                      for per in (15, 20) for irr in (0.25, 0.30)}
    return v


def cap_table(pre2):
    fd = sum(a + b for _, a, b in CAP)
    price = round(pre2 * 1e8 / fd / 10_000) * 10_000
    return dict(fd=fd, price=price)


# ───────── Excel ─────────
NAVY, COPPER, SAND, BEIGE = "36394B", "C68A65", "F3EDE6", "EAD5C7"
thin = Side(style="thin", color="D9D9D9")
BD = Border(left=thin, right=thin, top=thin, bottom=thin)
FONT = "Meiryo"
NUM1 = '#,##0.0;"▲"#,##0.0;"-"'
NUM0 = '#,##0;"▲"#,##0;"-"'


def hdr(c):
    c.font = Font(name=FONT, bold=True, color="FFFFFF", size=10)
    c.fill = PatternFill("solid", fgColor=NAVY)
    c.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
    c.border = BD


def body(c, bold=False, fmt=None, blue=False, fill=None, color=None):
    c.font = Font(name=FONT, bold=bold, size=10, color="0000FF" if blue else (color or "000000"))
    c.border = BD
    c.alignment = Alignment(horizontal="right" if fmt else "left", vertical="center", wrap_text=not fmt)
    if fmt:
        c.number_format = fmt
    if fill:
        c.fill = PatternFill("solid", fgColor=fill)


def title(ws, text, sub=None):
    ws["A1"] = text
    ws["A1"].font = Font(name=FONT, bold=True, size=13)
    if sub:
        ws["A2"] = sub
        ws["A2"].font = Font(name=FONT, size=9, color="595959")


def build_xlsx(m, v, path):
    wb = openpyxl.Workbook()

    # ── 5か年計画（①②③） ──
    ws = wb.active
    ws.title = "5か年計画"
    title(ws, "5か年計画（2026年度〜2030年度）　単位：百万円",
          "年度＝WineBank決算期（10月〜翌9月）。カンテサンスは期初取得を仮定したプロフォーマで、榊原様提出の【B】新規事業込みを統合。"
          "①グループ全体／②WineBank＋カンテサンス（アピシウス以下を除く）／③持分按分。")
    r = 4
    heads = ["区分", "項目"] + [f"{y}\n{p}" for y, p in zip(YEARS, PERIOD)] + ["持分"]
    for j, h in enumerate(heads, 1):
        hdr(ws.cell(row=r, column=j, value=h))
    ws.row_dimensions[r].height = 32
    r += 1
    seg_rows = {}
    for sg in m["segments"]:
        for kind, lab in (("rev", "売上高"), ("op", "営業利益")):
            body(ws.cell(row=r, column=1, value=sg["name"]), bold=True)
            body(ws.cell(row=r, column=2, value=lab))
            for i in range(N):
                body(ws.cell(row=r, column=3 + i, value=round(sg[kind][i], 1)), fmt=NUM1,
                     blue=kind == "op" and sg["overridden"][i], fill=SAND if kind == "op" else None)
            body(ws.cell(row=r, column=8, value=sg["own"]), fmt="0.0%")
            seg_rows[(sg["name"], kind)] = r
            r += 1
        # 持分按分後の営業利益（セグメント）
        body(ws.cell(row=r, column=1, value=sg["name"]))
        body(ws.cell(row=r, column=2, value="持分按分後 営業利益"), color="595959")
        for i in range(N):
            body(ws.cell(row=r, column=3 + i, value=round(sg["attrib"][i], 1)), fmt=NUM1, color="595959")
        seg_rows[(sg["name"], "att")] = r
        r += 1
    r += 1
    # 本ラウンドの調達とカンテサンス持分（青字＝入力）
    body(ws.cell(row=r, column=1, value="本ラウンドとカンテサンス持分"), bold=True, fill=SAND)
    body(ws.cell(row=r, column=2, value="（調達額の一部で、買収SPCの外部投資家の持分を取得）"), fill=SAND)
    for j, h in ((3, "調達前（参考）"), (4, "調達5億円"), (5, "調達10億円")):
        hdr(ws.cell(row=r, column=j, value=h))
    r += 1
    prm = {}
    for lab, key in (("充当率（調達額のうちSPC持分の取得に充てる割合）", "alloc"), ("SPCの外部投資家の出資（億円）", "inv"),
                     ("取得前のWineBank持分", "base")):
        body(ws.cell(row=r, column=1, value=lab))
        val = {"alloc": ALLOC, "inv": SPC_INV, "base": BASE_OWN}[key]
        body(ws.cell(row=r, column=3, value=val), fmt="0%" if key != "inv" else NUM1, blue=True)
        prm[key] = f"$C${r}"
        r += 1
    body(ws.cell(row=r, column=1, value="本ラウンドの調達額（億円）"), bold=True)
    body(ws.cell(row=r, column=3, value=0), fmt=NUM1)
    for j, (_, rnd) in zip((4, 5), ROUNDS):
        body(ws.cell(row=r, column=j, value=rnd), fmt=NUM1, blue=True, bold=True)
    prm["round_row"] = r
    r += 1
    body(ws.cell(row=r, column=1, value="SPC持分の取得額（億円）"))
    for j in (3, 4, 5):
        body(ws.cell(row=r, column=j, value=f"=MIN({CL(j)}{prm['round_row']}*{prm['alloc']},{prm['inv']})"), fmt=NUM1)
    buy_row = r
    r += 1
    body(ws.cell(row=r, column=1, value="増資後のカンテサンス持分（WineBank）"), bold=True)
    for j in (3, 4, 5):
        body(ws.cell(row=r, column=j, value=f"={prm['base']}+(1-{prm['base']})*{CL(j)}{buy_row}/{prm['inv']}"),
             fmt="0.0%", bold=True, fill=BEIGE)
    own_row = r
    r += 2
    grp1 = SEGMENTS
    grp2 = ["ワイン・WineTech", "カンテサンス"]
    lines = [
        ("① グループ全体", "売上高", grp1, "rev", NAVY), ("① グループ全体", "営業利益", grp1, "op", NAVY),
        ("② WineBank＋カンテサンス", "売上高", grp2, "rev", COPPER),
        ("② WineBank＋カンテサンス", "営業利益", grp2, "op", COPPER),
    ]
    for lab, item, names, kind, fill in lines:
        body(ws.cell(row=r, column=1, value=lab), bold=True, fill=fill, color="FFFFFF")
        body(ws.cell(row=r, column=2, value=item), bold=True, fill=fill, color="FFFFFF")
        for i in range(N):
            col = CL(3 + i)
            f = "=" + "+".join(f"{col}{seg_rows[(n, kind)]}" for n in names)
            body(ws.cell(row=r, column=3 + i, value=f), fmt=NUM1, bold=True, fill=fill, color="FFFFFF")
        r += 1
    qop = seg_rows[("カンテサンス", "op")]
    for scol, slab, skey in (("C", "調達前（51%・参考）", None), ("D", "調達5億円", "r5"), ("E", "調達10億円", "r10")):
        for plab, names, pk in (("③ 持分按分（①）", grp1, "p1"), ("③ 持分按分（②）", grp2, "p2")):
            body(ws.cell(row=r, column=1, value=f"{plab} {slab}"), bold=True, fill=BEIGE)
            body(ws.cell(row=r, column=2, value="営業利益"), bold=True, fill=BEIGE)
            for i in range(N):
                col = CL(3 + i)
                oth = "+".join(f"{col}{seg_rows[(n, 'att')]}" for n in names if n != "カンテサンス")
                body(ws.cell(row=r, column=3 + i, value=f"={oth}+{col}{qop}*${scol}${own_row}"), fmt=NUM1, bold=True,
                     fill=BEIGE)
            r += 1
    for slab, skey in (("調達前（51%・参考）", None), ("調達5億円", "r5"), ("調達10億円", "r10")):
        for plab, pk in (("③ 持分按分（①）", "p1"), ("③ 持分按分（②）", "p2")):
            src = m[pk]["attrib_ni"] if skey is None else m["scn"][skey][pk]["attrib_ni"]
            body(ws.cell(row=r, column=1, value=f"{plab} {slab}"), fill=BEIGE)
            body(ws.cell(row=r, column=2, value="当期純利益（目安）"), fill=BEIGE)
            for i in range(N):
                body(ws.cell(row=r, column=3 + i, value=round(src[i], 1)), fmt=NUM1, fill=BEIGE)
            r += 1
    r += 1
    notes = [
        "青字：経営判断による修正値（ワイン・WineTech 2026〜2029年度、レストラン運営）。2030年度のワイン・WineTechはモデル値。",
        "持分：WineBank100%、カンテサンス51%（SPC経由。外部投資家49%）、アピシウス70%、Brasserie Thierry Marx66.7%、"
        "レストラン運営60%。本ラウンドの調達額の80%で外部投資家の持分を同じ条件（出資15億円＝49%）で取得すると、"
        "カンテサンス持分は調達5億円で64.1%、10億円で77.1%になる。",
        "当期純利益（目安）：カンテサンスは合併後の会社の純利益（金利・投資家への年3%・AM報酬・特典費用・後継料理長・法人税の控除後、"
        "榊原様提出【B】）×持分。取得した分は外部投資家への年3%がなくなるため、その税引後額を加える。"
        "それ以外は持分按分後営業利益×(1−34%)。WineBank本体の支払利息・のれん償却は含まない。",
        "グループ内取引（AM報酬・ワイン卸）の消去は未反映。",
    ]
    for t in notes:
        ws.cell(row=r, column=1, value=t).font = Font(name=FONT, size=9, color="595959")
        r += 1
    ws.column_dimensions["A"].width = 26
    ws.column_dimensions["B"].width = 20
    for j in range(3, 9):
        ws.column_dimensions[CL(j)].width = 15
    ws.freeze_panes = "C5"

    # ── 各社（WineBank年度に組替え後） ──
    ws = wb.create_sheet("各社_年度組替え")
    title(ws, "各社の計画（WineBank年度に月割りで組替え）　単位：百万円")
    r = 4
    heads = ["事業", "セグメント", "持分", "決算月"] + [f"{y} 売上" for y in YEARS] + [f"{y} 営業利益" for y in YEARS] + \
            ["前提・出所"]
    for j, h in enumerate(heads, 1):
        hdr(ws.cell(row=r, column=j, value=h))
    ws.row_dimensions[r].height = 30
    for e in m["entities"]:
        r += 1
        body(ws.cell(row=r, column=1, value=e["name"]), bold=True)
        body(ws.cell(row=r, column=2, value=e["seg"]))
        body(ws.cell(row=r, column=3, value=e["own"]), fmt="0.0%")
        body(ws.cell(row=r, column=4, value=f"{e['fy']}月"))
        for i in range(N):
            body(ws.cell(row=r, column=5 + i, value=round(e["rev"][i], 1)), fmt=NUM1)
            body(ws.cell(row=r, column=10 + i, value=round(e["op"][i], 1)), fmt=NUM1, fill=SAND)
        body(ws.cell(row=r, column=15, value=e["src"]))
    ws.column_dimensions["A"].width = 34
    ws.column_dimensions["B"].width = 16
    for j in range(3, 15):
        ws.column_dimensions[CL(j)].width = 11
    ws.column_dimensions["O"].width = 70

    # ── カンテサンス（榊原様提出計画との対応） ──
    ws = wb.create_sheet("カンテサンス_A_B")
    title(ws, "カンテサンス：榊原様提出の計画（暦年・億円）",
          "【A】既存計画のみ（本店1店舗のIM計画）／【B】新規事業込み。2026/11/12 榊原様宛メールの数値。")
    r = 4
    heads = ["項目", "2027年", "2028年", "2029年", "2030年", "2031年"]
    for j, h in enumerate(heads, 1):
        hdr(ws.cell(row=r, column=j, value=h))
    data = [
        ("【A】営業利益", [5.56, 5.76, 5.98, 6.23, 6.50]),
        ("【A】当期純利益", [2.79, 2.90, 3.12, 3.24, 3.49]),
        ("【A】DSCR", [0.86, 0.88, 0.95, 0.98, 1.06]),
        ("新規事業 売上", [0.11, 2.55, 4.89, 7.53, 9.33]),
        ("新規事業 営業利益", [0.03, 0.77, 1.47, 2.07, 2.61]),
        ("新規事業 投資", [0, 0.50, 0.50, 0.50, 0.50]),
        ("【B】営業利益", [5.59, 6.53, 7.45, 8.30, 9.10]),
        ("【B】当期純利益", [2.81, 3.40, 4.09, 4.59, 5.20]),
        ("【B】当期純利益（成長対価の金利控除後）", [round(QUINT_NI_B[y] / 100, 2) for y in range(2027, 2032)]),
        ("【B】期末現金", [1.21, 0.81, 1.10, 1.89, 3.29]),
        ("【B】DSCR", [0.86, 0.89, 1.08, 1.23, 1.42]),
        ("借入残高（A・B共通、成長対価を含む）", [12.0, 9.0, 12.8, 9.8, 6.8]),
        ("アーンアウト（2029年末）", [0, 0, EARNOUT_BASE + EARNOUT_GROWTH, 0, 0]),
    ]
    for lab, vals in data:
        r += 1
        body(ws.cell(row=r, column=1, value=lab), bold=lab.startswith("【B】"))
        for j, x in enumerate(vals):
            body(ws.cell(row=r, column=2 + j, value=x), fmt='0.00')
    r += 2
    for t in ["SPCの資本：WineBank 15億円（みずほ銀行のLBOローン、議決権51%）、投資家5名様 15億円（49%）。"
              "取得価格50億円＝LBOローン15億円＋投資家出資15億円＋対象会社の現預金20億円。",
              "アーンアウト：追加対価5億円＋成長対価1.8億円（2.4億円から仲介手数料の減額0.6億円を差し引いた実質負担）を、"
              "3年後（2029年末）に業績達成を前提として支払う。会社資金で支払い、同額を2029年に追加借入（金利4%）。",
              "成長対価の条件（2026/11/13 礒田様宛て最終提案）：2029年12月期の営業利益が既存事業のみでIM計画（5.98億円）以上。",
              "当期純利益は、成長対価分の追加借入の金利（税引後 年0.05億円、2030年以降）を榊原様提出の値から差し引いた。",
              "第三者売却（2031年末・EBITDA×6.2倍）の想定株式価値：【A】32.7億円／【B】51.3億円（成長対価の借入1.8億円を控除）。"]:
        ws.cell(row=r, column=1, value=t).font = Font(name=FONT, size=9, color="595959")
        r += 1
    ws.column_dimensions["A"].width = 28
    for j in range(2, 7):
        ws.column_dimensions[CL(j)].width = 11

    # ── プレバリュー ──
    ws = wb.create_sheet("プレバリュー")
    title(ws, "プレバリューの目安（億円）　①と②の差＝組織再編で集約する持分の価値",
          "青字は仮置き。中野様の判断で変更してください。")
    r = 4
    for j, h in enumerate(["項目", "金額（億円）", "考え方"], 1):
        hdr(ws.cell(row=r, column=j, value=h))
    rows = [
        ("(a) WineBank単体（WineTech）", v["wb"], True,
         "2026年1月ラウンドのポスト26.1億円（1株45万円）と同じ評価。WineTech単体の利益はまだ小さいため、上げ幅はカンテサンス取得分で説明する"),
        ("(b) カンテサンス持分（WineBank帰属）", v["quint"], True,
         f"【B】の2031年末売却でWineBankに帰属する株式価値の増加 {v['quint_exit']:.1f}億円（増加36.3億円＝38.1億円−成長対価の借入1.8億円、×51%＋投資家分の成果報酬15%）"
         f"を割引率25%・5年で現在価値化（20%なら{v['quint_pv'][0.20]:.1f}、30%なら{v['quint_pv'][0.30]:.1f}）"),
        ("② プレバリュー（a＋b）", None, False, "WineBank＋カンテサンス"),
        ("(c-1) アピシウス 70%", v["reorg"]["apicius"], True,
         f"収益価値 {v['apicius_op']:.1f}億円（2026年度営業利益1.3億円×6.2倍＝カンテサンスの取得倍率×70%）＋"
         f"純資産 {v['apicius_nav']:.1f}億円（2025年12月期の純資産5.18億円×70%。うちワイン在庫は簿価3.76億円で、"
         "高級ワインの含み益は含まない）"),
        ("(c-2) Brasserie Thierry Marx 66.7%", v["reorg"]["tm"], True,
         "2026年11月の第三者割当（1株16万円・ポスト約3.5億円）×66.7%"),
        ("(c-3) レストラン運営 60%", v["reorg"]["rest"], True, "営業利益1億円（5年横ばい）×4倍×60%"),
        ("① プレバリュー（②＋c）", None, False, "グループ全体。cは組織再編で中野様等に新株を発行する分"),
    ]
    rr = {}
    for lab, val, blue, note in rows:
        r += 1
        body(ws.cell(row=r, column=1, value=lab), bold=val is None)
        if val is None:
            f = f"=B{rr['a']}+B{rr['b']}" if lab.startswith("②") else \
                f"=B{rr['p2']}+SUM(B{rr['c1']}:B{rr['c3']})"
            body(ws.cell(row=r, column=2, value=f), fmt=NUM1, bold=True,
                 fill=COPPER if lab.startswith("②") else NAVY, color="FFFFFF")
        else:
            body(ws.cell(row=r, column=2, value=round(val, 1)), fmt=NUM1, blue=blue)
        body(ws.cell(row=r, column=3, value=note))
        key = {"(a)": "a", "(b)": "b", "②": "p2", "(c-1)": "c1", "(c-3)": "c3", "①": "p1"}
        for k, kk in key.items():
            if lab.startswith(k):
                rr[kk] = r
    r += 2
    ws.cell(row=r, column=1, value="検証：VC方式（2030年度の持分按分後純利益×PER÷(1+目標IRR)^4.5−調達額）").font = \
        Font(name=FONT, bold=True, size=10)
    r += 1
    vch = [("15_25", "PER15倍・IRR25%"), ("20_25", "PER20倍・IRR25%"), ("15_30", "PER15倍・IRR30%"),
           ("20_30", "PER20倍・IRR30%")]
    for j, h in enumerate(["パターン", "2030年度 純利益"] + [h for _, h in vch], 1):
        hdr(ws.cell(row=r, column=j, value=h))
    for sk, rnd in ROUNDS:
        for lab, key in (("① グループ全体", "p1"), ("② WineBank＋カンテサンス", "p2")):
            r += 1
            body(ws.cell(row=r, column=1, value=f"{lab}（調達{rnd:.0f}億円）"), bold=True)
            body(ws.cell(row=r, column=2, value=round(m["scn"][sk][key]["attrib_ni"][4] / 100, 2)), fmt='0.00')
            for j, (k, _) in enumerate(vch):
                body(ws.cell(row=r, column=3 + j, value=round(v["vc"][f"{sk}_{key}"][k], 1)), fmt=NUM1)
    r += 1
    ws.cell(row=r, column=1, value="上場までの期間を4.5年と置いた場合のプレバリュー。IRR25%は投資倍率約2.7倍、30%は約3.3倍。"
            "純利益は、調達資金の80%でカンテサンス持分を取得した後の持分で按分。").font = Font(name=FONT, size=9, color="595959")
    ws.column_dimensions["A"].width = 34
    ws.column_dimensions["B"].width = 14
    ws.column_dimensions["C"].width = 100
    for j in (4, 5, 6):
        ws.column_dimensions[CL(j)].width = 16
    pv_sheet = ws.title
    pre_rows = rr

    # ── 資本政策 ──
    plan = "5か年計画"
    ws = wb.create_sheet("資本政策")
    title(ws, "資本政策（案）　①グループ全体／②WineBank＋カンテサンス × 調達5億円／10億円",
          "現状は2026年1月ラウンド後（資本政策20260131）。1株価格は②のプレバリュー÷潜在株式込み株数。"
          "①は、組織再編で集約する持分の対価として、同じ株価で中野様等に新株を発行する（既存株主の持分の価値は①②で同じ）。"
          "調達額の80%は、買収SPCの外部投資家の持分の取得に充てる。")
    r = 4
    ws.cell(row=r, column=1, value="前提").font = Font(name=FONT, bold=True)
    params = [
        ("② プレバリュー（億円）", f"='{pv_sheet}'!B{pre_rows['p2']}", "price"),
        ("① 組織再編で集約する持分の価値（億円）", f"='{pv_sheet}'!B{pre_rows['p1']}-'{pv_sheet}'!B{pre_rows['p2']}",
         "reorg"),
        ("調達額 ケース1（億円）", f"='{plan}'!D{prm['round_row']}", "r5"),
        ("調達額 ケース2（億円）", f"='{plan}'!E{prm['round_row']}", "r10"),
        ("前回ラウンドの1株価格（円）", LAST_PRICE, "last"),
        ("上場時のPER（倍）", 20, "per"),
    ]
    prow = {}
    for lab, val, key in params:
        r += 1
        body(ws.cell(row=r, column=1, value=lab))
        c = ws.cell(row=r, column=2, value=val)
        body(c, fmt=NUM1 if "億円" in lab else NUM0, blue=not str(val).startswith("="))
        prow[key] = r
    fd0 = sum(a_ + b_ for _, a_, b_ in CAP)
    r += 1
    body(ws.cell(row=r, column=1, value="1株価格（円、1万円単位）"), bold=True)
    body(ws.cell(row=r, column=2, value=f"=ROUND(B{prow['price']}*100000000/{fd0}/10000,0)*10000"), fmt=NUM0,
         bold=True, fill=BEIGE)
    prow["pps"] = r
    r += 1
    body(ws.cell(row=r, column=1, value="前回比"))
    body(ws.cell(row=r, column=2, value=f"=B{prow['pps']}/B{prow['last']}"), fmt='0.00"倍"')
    r += 2

    # 列：A株主 B発行済 C潜在込み D比率 | ② E 5億後 F比率 G 10億後 H比率 | ① I組織再編 J 5億後 K比率 L 10億後 M比率
    heads = ["株主", "現状 発行済", "現状 潜在込み", "比率",
             "② 調達5億 後", "比率", "② 調達10億 後", "比率",
             "① 組織再編", "① 調達5億 後", "比率", "① 調達10億 後", "比率"]
    for j, h in enumerate(heads, 1):
        hdr(ws.cell(row=r, column=j, value=h))
    ws.row_dimensions[r].height = 30
    hr = r
    first = r + 1
    holders = list(CAP) + [("本ラウンドの投資家（HIRAC・ニッセイ・千島土地・愛知キャピタル等）", 0, 0)]
    for k, (nm, sh, so) in enumerate(holders):
        r += 1
        new = k == len(holders) - 1
        body(ws.cell(row=r, column=1, value=nm), bold=new)
        body(ws.cell(row=r, column=2, value=sh), fmt=NUM0, blue=True)
        body(ws.cell(row=r, column=3, value=f"=B{r}+{so}"), fmt=NUM0)
        n5 = f"ROUND(B{prow['r5']}*100000000/B{prow['pps']},0)"
        n10 = f"ROUND(B{prow['r10']}*100000000/B{prow['pps']},0)"
        reorg = f"=ROUND(B{prow['reorg']}*100000000/B{prow['pps']},0)" if nm == "中野邦人" else 0
        body(ws.cell(row=r, column=5, value=f"=C{r}+{n5}" if new else f"=C{r}"), fmt=NUM0)
        body(ws.cell(row=r, column=7, value=f"=C{r}+{n10}" if new else f"=C{r}"), fmt=NUM0)
        body(ws.cell(row=r, column=9, value=reorg), fmt=NUM0)
        body(ws.cell(row=r, column=10, value=f"=E{r}+I{r}"), fmt=NUM0)
        body(ws.cell(row=r, column=12, value=f"=G{r}+I{r}"), fmt=NUM0)
    last = r
    r += 1
    body(ws.cell(row=r, column=1, value="合計"), bold=True, fill=SAND)
    for j in (2, 3, 5, 7, 9, 10, 12):
        body(ws.cell(row=r, column=j, value=f"=SUM({CL(j)}{first}:{CL(j)}{last})"), fmt=NUM0, bold=True, fill=SAND)
    tot = r
    for rr_ in range(first, last + 1):
        for src_c, dst_c in ((3, 4), (5, 6), (7, 8), (10, 11), (12, 13)):
            body(ws.cell(row=rr_, column=dst_c, value=f"={CL(src_c)}{rr_}/{CL(src_c)}{tot}"), fmt="0.0%")
    r += 2
    ws.cell(row=r, column=1, value="評価額と上場時の見通し").font = Font(name=FONT, bold=True)
    r += 1
    cols = [(5, "② 調達5億", "r5", "p2"), (7, "② 調達10億", "r10", "p2"), (10, "① 調達5億", "r5", "p1"),
            (12, "① 調達10億", "r10", "p1")]
    for c_, lab, _, _ in cols:
        hdr(ws.cell(row=r, column=c_, value=lab))
    r += 1
    body(ws.cell(row=r, column=1, value="プレバリュー（億円）"))
    for c_, lab, sk, pk in cols:
        f = f"=C{tot}*B{prow['pps']}/100000000" if pk == "p2" else f"=(C{tot}+I{tot})*B{prow['pps']}/100000000"
        body(ws.cell(row=r, column=c_, value=f), fmt=NUM1, bold=True)
    r += 1
    body(ws.cell(row=r, column=1, value="ポストバリュー（億円）"))
    for c_, lab, sk, pk in cols:
        body(ws.cell(row=r, column=c_, value=f"={CL(c_)}{tot}*B{prow['pps']}/100000000"), fmt=NUM1, bold=True)
    post_r = r
    r += 1
    body(ws.cell(row=r, column=1, value="増資後のカンテサンス持分"))
    for c_, lab, sk, pk in cols:
        body(ws.cell(row=r, column=c_, value=f"='{plan}'!{'D' if sk == 'r5' else 'E'}{own_row}"), fmt="0.0%", bold=True)
    r += 1
    body(ws.cell(row=r, column=1, value="2030年度 持分按分後 当期純利益（億円）"))
    for c_, lab, sk, pk in cols:
        body(ws.cell(row=r, column=c_, value=round(m["scn"][sk][pk]["attrib_ni"][4] / 100, 2)), fmt='0.00')
    ni_r = r
    r += 1
    body(ws.cell(row=r, column=1, value="上場時の時価総額（億円）＝純利益×PER"))
    for c_, lab, sk, pk in cols:
        body(ws.cell(row=r, column=c_, value=f"={CL(c_)}{ni_r}*B{prow['per']}"), fmt=NUM1, bold=True)
    mc_r = r
    r += 1
    body(ws.cell(row=r, column=1, value="本ラウンドの投資倍率"))
    for c_, lab, sk, pk in cols:
        body(ws.cell(row=r, column=c_, value=f"={CL(c_)}{mc_r}/{CL(c_)}{post_r}"), fmt='0.00"倍"', bold=True,
             fill=BEIGE)
    r += 2
    for t in ["上場時の時価総額は、公募増資・SOの追加付与による希薄化を含まない概算。純利益は値（5か年計画シートの③）。",
              "調達額は「5か年計画」シートの青字（調達5億円・10億円）を変えると、株数・持株比率・持分が再計算される。",
              "SO（潜在株）は2026年1月時点の付与分。上場までに追加のSOプール（潜在株10%程度）の設定を検討。"]:
        ws.cell(row=r, column=1, value=t).font = Font(name=FONT, size=9, color="595959")
        r += 1
    ws.column_dimensions["A"].width = 46
    for j in range(2, 14):
        ws.column_dimensions[CL(j)].width = 12
    ws.freeze_panes = ws.cell(row=hr + 1, column=2)
    wb.save(path)


if __name__ == "__main__":
    out_json, out_xlsx = sys.argv[1], sys.argv[2]
    M = build()
    V = valuation(M)
    C = cap_table(V["pre2"])
    M["valuation"] = V
    M["cap"] = dict(C, last_price=LAST_PRICE, holders=CAP,
                    rounds={k: dict(round=r_, shares=round(r_ * 1e8 / C["price"])) for k, r_ in ROUNDS},
                    reorg_shares=round(sum(round(x, 1) for x in V["reorg"].values()) * 1e8 / C["price"]))
    json.dump(M, open(out_json, "w", encoding="utf-8"), ensure_ascii=False, indent=1, default=str)
    build_xlsx(M, V, out_xlsx)
    for key, lab in (("p1", "①全体"), ("p2", "②WB+Q")):
        p = M[key]
        print(lab, "売上", [round(x / 100, 1) for x in p["rev"]], "営利", [round(x / 100, 1) for x in p["op"]],
              "持分営利", [round(x / 100, 1) for x in p["attrib_op"]], "持分NI", [round(x / 100, 2) for x in p["attrib_ni"]])
    for sg in M["segments"]:
        print(sg["name"], [round(x / 100, 1) for x in sg["rev"]], [round(x / 100, 1) for x in sg["op"]])
    print("valuation", {k: v for k, v in V.items() if k not in ("reorg",)}, V["reorg"])
    print("cap", M["cap"]["rounds"], M["cap"]["reorg_shares"], C)
    for k, sc in M["scn"].items():
        print(k, "own", round(sc["own"], 3), "fee", round(sc["fee_saved"], 1),
              "①持分営利", [round(x / 100, 1) for x in sc["p1"]["attrib_op"]],
              "②持分営利", [round(x / 100, 1) for x in sc["p2"]["attrib_op"]],
              "①NI", [round(x / 100, 2) for x in sc["p1"]["attrib_ni"]], "②NI", [round(x / 100, 2) for x in sc["p2"]["attrib_ni"]])
