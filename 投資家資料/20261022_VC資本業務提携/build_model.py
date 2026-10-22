# -*- coding: utf-8 -*-
"""組織再編後（外部投資家以外の持分をWineBankへ集約）の連結損益計画を作る。

年度 ＝ WineBankの決算期（10月〜翌9月）。2026年度＝2027年9月期。
決算期が異なる子会社は、各社の事業年度の数値を月数で按分して組み替える
（例：12月決算の2026年度 ＝ 2026年12月期×3/12 ＋ 2027年12月期×9/12）。

出力: 組織再編_連結PL_2026-2029.xlsx（入力シート＋数式で組み替えた連結シート）
      model.json（スライド生成用に同じ計算をPythonでも行った結果）
"""
import json
import openpyxl
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter

YEARS = ["2026年度", "2027年度", "2028年度", "2029年度"]
PERIOD = ["2026/10-2027/9", "2027/10-2028/9", "2028/10-2029/9", "2029/10-2030/9"]

# ───────── 各社の自社決算期ベースの計画（百万円） ─────────
# fy: 決算月。series: {決算年: (売上, 営業利益)}。src: 出所。
ENT = [
    dict(key="wb_base", seg="ワイン・WineTech", name="WineBank 既存ワイン事業", fy=9, own=1.0,
         series={2027: (750.5, 22.9), 2028: (788.0, 34.2), 2029: (827.4, 46.0), 2030: (868.8, 58.4)},
         src="2026年度＝銀行提出 FY2027プランD（売上833.0・営業利益105.4）からグループ内コンサル料82.5を消去。"
             "2027年度以降は年5%成長・増分粗利率30%・販管費据置の仮置き"),
    dict(key="wb_fund", seg="ワイン・WineTech", name="WineBank 私募ファンド・オークション", fy=9, own=1.0,
         series={2027: (0.0, 0.0), 2028: (300.0, 90.0), 2029: (300.0, 90.0), 2030: (300.0, 90.0)},
         src="銀行提出 FY2027プランE（上振れ）の上積み300（粗利率30%）を2027年度から据置で計上"),
    dict(key="wb_mile", seg="ワイン・WineTech", name="WineBank ワインマイル", fy=9, own=1.0,
         series={2027: (0.0, 0.0), 2028: (77.4, 19.0), 2029: (138.7, 34.6), 2030: (208.1, 52.0)},
         src="ワインマイル3か年PL（9/2版）を最新レートカード（管理料2.75%・還元率4/5/6%・成功報酬30%・GOLD500万〜、9/29）で再計算した1〜3年目。"
             "2027年度を1年目とし、人件費・システム費は既存体制で吸収"),
    dict(key="apicius", seg="グランメゾン", name="アピシウス", fy=12, own=0.7,
         series={2026: (700.0, 130.0), 2027: (721.0, 134.1), 2028: (742.6, 138.1), 2029: (764.9, 142.2),
                 2030: (787.9, 146.5)},
         src="2026年12月期＝グループ管理表の着地予想。2027年以降は売上年3%成長・営業利益率18.6%据置の仮置き"),
    dict(key="quint", seg="グランメゾン", name="カンテサンス（プティ・ボノム）", fy=12, own=0.51,
         series={2026: (1015.0, 528.0), 2027: (1062.0, 556.0), 2028: (1095.0, 576.0), 2029: (1129.0, 598.0),
                 2030: (1169.8, 623.3)},
         src="IM（2026年9月）42頁 監修後・売上横ばいケース。2030年はIMの年平均成長率で延長（CF計画2027-2032）。"
             "岸田氏報酬見直し等の取得後改善（年約0.8億）と一時費用（役員退職金2.25億）は含めない"),
    dict(key="tm", seg="ブラッスリー", name="Brasserie Thierry Marx", fy=3, own=0.667,
         series={2027: (0.0, 0.0), 2028: (381.0, 10.3), 2029: (891.2, 39.1), 2030: (1729.4, 105.8),
                 2031: (2576.1, 184.0)},
         src="事業収支統合モデル 2026/10/16 v4 連結PL（FY＝4月〜3月）。2027年3月期は開業前のため0"),
    dict(key="vk", seg="レストラン運営", name="バリューキッチン", fy=6, own=0.6,
         series={2027: (700.0, 100.0), 2028: (721.0, 103.0), 2029: (742.6, 106.1), 2030: (764.9, 109.3),
                 2031: (787.9, 112.6)},
         src="グループ管理表の着地予想（売上700・営業利益100）を2027年6月期に充当（2026年6月期実績：売上645・"
             "店舗営業利益75）。以降は年3%成長の仮置き"),
    dict(key="others", seg="レストラン運営", name="その他グループ会社（バリューテーブル・エルネット等）", fy=9, own=0.7,
         series={2027: (800.0, 30.0), 2028: (800.0, 30.0), 2029: (800.0, 30.0), 2030: (800.0, 30.0)},
         src="グループ管理表の着地予想：バリューテーブル600/20・エルネット100/5・摩耶100/5の合計を据置"),
]
SEGMENTS = ["ワイン・WineTech", "グランメゾン", "ブラッスリー", "レストラン運営"]
# 2026/10/22 中野様がデックp.41で修正したセグメント営業利益（百万円）。経営判断としてモデル値を上書きする
SEG_OP_OVERRIDE = {
    "ワイン・WineTech": [10.0, 100.0, 150.0, 200.0],
    "レストラン運営": [130.0, 100.0, 100.0, 100.0],
}
EXCLUDE_KEY = "quint"   # 時価総額を「含む／除く」で分けるため、カンテサンスを別掲する

OUT_OF_SCOPE = "対象外：あどばる（37%・ビジョングループ）、KINKA（20%）、バーガーレボリューション（49%）は持分法または対象外。" \
               "ワイン・ラ・ターブルは店舗をバリューキッチンへ移管済のため除外"


def months_in(fy_end_month, wb_year):
    """WineBank年度（wb_year年10月〜翌9月）に各社の事業年度が何か月ずつ含まれるか。

    戻り値: [(各社の決算年, 月数), ...]"""
    out = {}
    y, m = wb_year, 10
    for _ in range(12):
        fy_year = y if m <= fy_end_month else y + 1
        out[fy_year] = out.get(fy_year, 0) + 1
        m += 1
        if m == 13:
            y, m = y + 1, 1
    return sorted(out.items())


def convert(ent):
    rows = []
    for i, _ in enumerate(YEARS):
        wb_year = 2026 + i
        rev = op = 0.0
        for fy, n in months_in(ent["fy"], wb_year):
            r, o = ent["series"][fy]
            rev += r * n / 12
            op += o * n / 12
        rows.append((rev, op))
    return rows


def build_json():
    res = {"years": YEARS, "period": PERIOD, "entities": [], "out_of_scope": OUT_OF_SCOPE}
    for e in ENT:
        conv = convert(e)
        res["entities"].append(dict(key=e["key"], seg=e["seg"], name=e["name"], own=e["own"], fy=e["fy"],
                                    rev=[c[0] for c in conv], op=[c[1] for c in conv], src=e["src"]))
    ents = res["entities"]
    segs = []
    for seg in SEGMENTS:
        members = [e for e in ents if e["seg"] == seg]
        rev = [sum(e["rev"][i] for e in members) for i in range(4)]
        op_model = [sum(e["op"][i] for e in members) for i in range(4)]
        op = SEG_OP_OVERRIDE.get(seg, op_model)
        # 上書きしたセグメントは、モデル上の各社の利益構成比で按分してから持分を掛ける
        attrib = [op[i] * sum(e["op"][i] * e["own"] for e in members) / op_model[i] for i in range(4)]
        segs.append(dict(name=seg, rev=rev, op=list(op), op_model=op_model, attrib=attrib,
                         overridden=seg in SEG_OP_OVERRIDE))
    res["segments"] = segs
    q = next(e for e in ents if e["key"] == EXCLUDE_KEY)
    tot_r = [sum(sg["rev"][i] for sg in segs) for i in range(4)]
    tot_o = [sum(sg["op"][i] for sg in segs) for i in range(4)]
    att_o = [sum(sg["attrib"][i] for sg in segs) for i in range(4)]
    res["total"] = dict(rev=tot_r, op=tot_o, attrib_op=att_o)
    res["quint"] = dict(rev=q["rev"], op=q["op"], attrib_op=[o * q["own"] for o in q["op"]])
    res["total_ex"] = dict(rev=[tot_r[i] - q["rev"][i] for i in range(4)],
                           op=[tot_o[i] - q["op"][i] for i in range(4)],
                           attrib_op=[att_o[i] - q["op"][i] * q["own"] for i in range(4)])
    return res


# ───────── Excel（入力＋数式） ─────────
NAVY, COPPER, SAND = "36394B", "C68A65", "F3EDE6"
thin = Side(style="thin", color="D9D9D9")
B = Border(left=thin, right=thin, top=thin, bottom=thin)
FONT = "Meiryo"


def hdr(c):
    c.font = Font(name=FONT, bold=True, color="FFFFFF", size=10)
    c.fill = PatternFill("solid", fgColor=NAVY)
    c.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
    c.border = B


def body(c, bold=False, num=False, blue=False, fill=None):
    c.font = Font(name=FONT, bold=bold, size=10, color="0000FF" if blue else "000000")
    c.border = B
    c.alignment = Alignment(horizontal="right" if num else "left", vertical="center", wrap_text=not num)
    if num:
        c.number_format = '#,##0.0;"▲"#,##0.0;"-"'
    if fill:
        c.fill = PatternFill("solid", fgColor=fill)


def build_xlsx(path):
    wb = openpyxl.Workbook()

    # 入力シート：各社の自社決算期ベース
    si = wb.active
    si.title = "入力_各社決算期ベース"
    si["A1"] = "各社の自社決算期ベースの計画（百万円）　青字＝入力値"
    si["A1"].font = Font(name=FONT, bold=True, size=12)
    fy_years = list(range(2026, 2032))
    heads = ["事業", "決算月", "WineBank持分"] + [f"{y}年 売上" for y in fy_years] + \
            [f"{y}年 営業利益" for y in fy_years] + ["出所・前提"]
    for j, h in enumerate(heads, 1):
        hdr(si.cell(row=3, column=j, value=h))
    in_row = {}
    for i, e in enumerate(ENT):
        r = 4 + i
        in_row[e["key"]] = r
        body(si.cell(row=r, column=1, value=e["name"]), bold=True)
        body(si.cell(row=r, column=2, value=e["fy"]), num=True, blue=True)
        si.cell(row=r, column=2).number_format = '0"月"'
        body(si.cell(row=r, column=3, value=e["own"]), num=True, blue=True)
        si.cell(row=r, column=3).number_format = "0.0%"
        for k, y in enumerate(fy_years):
            rv, op = e["series"].get(y, (None, None))
            c1 = si.cell(row=r, column=4 + k, value=rv)
            c2 = si.cell(row=r, column=4 + len(fy_years) + k, value=op)
            body(c1, num=True, blue=rv is not None)
            body(c2, num=True, blue=op is not None)
        body(si.cell(row=r, column=4 + 2 * len(fy_years), value=e["src"]))
    si.column_dimensions["A"].width = 34
    for j in range(2, 4 + 2 * len(fy_years)):
        si.column_dimensions[get_column_letter(j)].width = 11
    si.column_dimensions[get_column_letter(4 + 2 * len(fy_years))].width = 90
    si.row_dimensions[3].height = 30
    note_r = 5 + len(ENT)
    si.cell(row=note_r, column=1, value=OUT_OF_SCOPE).font = Font(name=FONT, size=9)
    si.cell(row=note_r + 1, column=1,
            value="WineBank持分：再編後の想定。カンテサンスはSPCでWineBank・アピシウス50〜66.7%（下限50%で記載）、"
                  "Brasserie Thierry Marxは外部投資家33.3%、その他はグループ管理表の保有比率").font = Font(name=FONT, size=9)

    def ref(key, fy_year, kind):
        k = fy_years.index(fy_year)
        col = 4 + k if kind == "rev" else 4 + len(fy_years) + k
        return f"'入力_各社決算期ベース'!{get_column_letter(col)}{in_row[key]}"

    # 連結シート：WineBank年度へ組替え（数式）
    sc = wb.create_sheet("連結PL_WineBank年度")
    sc["A1"] = "組織再編後 連結損益計画（百万円）　年度＝WineBank決算期（10月〜翌9月）"
    sc["A1"].font = Font(name=FONT, bold=True, size=12)
    sc["A2"] = "決算期が異なる子会社は月数按分で組替え。グループ内取引の消去は未反映（WineBank側のグループ内コンサル料は消去済）"
    sc["A2"].font = Font(name=FONT, size=9)
    for j, h in enumerate(["事業", "区分"] + [f"{y}\n{p}" for y, p in zip(YEARS, PERIOD)], 1):
        hdr(sc.cell(row=4, column=j, value=h))
    sc.row_dimensions[4].height = 32
    r = 5
    rev_rows, op_rows = [], []
    for e in ENT:
        for kind, label in (("rev", "売上高"), ("op", "営業利益")):
            body(sc.cell(row=r, column=1, value=e["name"]), bold=(kind == "rev"))
            body(sc.cell(row=r, column=2, value=label))
            for i in range(4):
                parts = [f"{ref(e['key'], fy, kind)}*{n}/12" for fy, n in months_in(e["fy"], 2026 + i)]
                c = sc.cell(row=r, column=3 + i, value="=" + "+".join(parts))
                body(c, num=True)
            (rev_rows if kind == "rev" else op_rows).append(r)
            r += 1
    for label, rows, bold in (("連結売上高", rev_rows, True), ("連結営業利益（モデル値・p.41修正前）", op_rows, True)):
        body(sc.cell(row=r, column=1, value=label), bold=True, fill=SAND)
        body(sc.cell(row=r, column=2, value=""), fill=SAND)
        for i in range(4):
            col = get_column_letter(3 + i)
            c = sc.cell(row=r, column=3 + i, value="=" + "+".join(f"{col}{x}" for x in rows))
            body(c, num=True, bold=bold, fill=SAND)
        if label == "連結売上高":
            tr = r
        else:
            to = r
        r += 1
    body(sc.cell(row=r, column=1, value="営業利益率"), bold=True)
    body(sc.cell(row=r, column=2, value=""))
    for i in range(4):
        col = get_column_letter(3 + i)
        c = sc.cell(row=r, column=3 + i, value=f"={col}{to}/{col}{tr}")
        body(c, num=True)
        c.number_format = "0.0%"
    r += 1
    body(sc.cell(row=r, column=1, value="（参考）持分按分後 営業利益（モデル値・修正前）"), bold=True)
    body(sc.cell(row=r, column=2, value="親会社帰属の目安"))
    for i in range(4):
        col = get_column_letter(3 + i)
        terms = [f"{col}{op_rows[k]}*'入力_各社決算期ベース'!C{in_row[e['key']]}" for k, e in enumerate(ENT)]
        body(sc.cell(row=r, column=3 + i, value="=" + "+".join(terms)), num=True, bold=True)
    sc.column_dimensions["A"].width = 46
    sc.column_dimensions["B"].width = 14
    for j in range(3, 7):
        sc.column_dimensions[get_column_letter(j)].width = 16
    sc.freeze_panes = "C5"
    wb.move_sheet("連結PL_WineBank年度", offset=-1)

    # セグメント集計（p.41の修正を反映）とカンテサンス含む／除く
    ss = wb.create_sheet("セグメント集計_含む除く", 0)
    ss["A1"] = "セグメント別 連結業績（百万円）　営業利益の青字＝2026/10/22 デックp.41での修正値（経営判断）"
    ss["A1"].font = Font(name=FONT, bold=True, size=12)
    for j, h in enumerate(["セグメント", "区分"] + [f"{y}\n{p}" for y, p in zip(YEARS, PERIOD)], 1):
        hdr(ss.cell(row=3, column=j, value=h))
    ss.row_dimensions[3].height = 32
    CS = "'連結PL_WineBank年度'!"
    r = 4
    seg_rev, seg_op, seg_att = [], [], []
    for seg in SEGMENTS:
        idx = [k for k, e in enumerate(ENT) if e["seg"] == seg]
        rows_def = [("売上高", "rev"), ("営業利益（モデル）", "model"), ("営業利益", "op"), ("持分按分後 営業利益", "att")]
        base = r
        for label, kind in rows_def:
            body(ss.cell(row=r, column=1, value=seg), bold=(kind == "rev"))
            body(ss.cell(row=r, column=2, value=label))
            for i in range(4):
                col = get_column_letter(3 + i)
                if kind == "rev":
                    f = "=" + "+".join(f"{CS}{col}{rev_rows[k]}" for k in idx)
                    c = ss.cell(row=r, column=3 + i, value=f)
                    body(c, num=True)
                elif kind == "model":
                    f = "=" + "+".join(f"{CS}{col}{op_rows[k]}" for k in idx)
                    body(ss.cell(row=r, column=3 + i, value=f), num=True)
                elif kind == "op":
                    if seg in SEG_OP_OVERRIDE:
                        c = ss.cell(row=r, column=3 + i, value=SEG_OP_OVERRIDE[seg][i])
                        body(c, num=True, blue=True, bold=True)
                    else:
                        body(ss.cell(row=r, column=3 + i, value=f"={col}{base + 1}"), num=True, bold=True)
                else:
                    num = "+".join(f"{CS}{col}{op_rows[k]}*'入力_各社決算期ベース'!C{in_row[ENT[k]['key']]}"
                                   for k in idx)
                    body(ss.cell(row=r, column=3 + i, value=f"={col}{base + 2}*({num})/{col}{base + 1}"), num=True)
            r += 1
        seg_rev.append(base)
        seg_op.append(base + 2)
        seg_att.append(base + 3)
    qk = next(k for k, e in enumerate(ENT) if e["key"] == EXCLUDE_KEY)
    qown = f"'入力_各社決算期ベース'!C{in_row[EXCLUDE_KEY]}"
    lines = [
        ("連結売上高（カンテサンス含む）", lambda c: "=" + "+".join(f"{c}{x}" for x in seg_rev), True),
        ("連結営業利益（カンテサンス含む）", lambda c: "=" + "+".join(f"{c}{x}" for x in seg_op), True),
        ("持分按分後 営業利益（カンテサンス含む）", lambda c: "=" + "+".join(f"{c}{x}" for x in seg_att), False),
        ("連結売上高（カンテサンス除く）", lambda c: f"={c}{r}-{CS}{c}{rev_rows[qk]}", True),
        ("連結営業利益（カンテサンス除く）", lambda c: f"={c}{r + 1}-{CS}{c}{op_rows[qk]}", True),
        ("持分按分後 営業利益（カンテサンス除く）", lambda c: f"={c}{r + 2}-{CS}{c}{op_rows[qk]}*{qown}", False),
    ]
    start = r
    for k, (label, fn, bold) in enumerate(lines):
        rr = start + k
        body(ss.cell(row=rr, column=1, value=label), bold=True, fill=SAND)
        body(ss.cell(row=rr, column=2, value=""), fill=SAND)
        for i in range(4):
            col = get_column_letter(3 + i)
            f = fn(col)
            if k >= 3:   # 除くの行は「含む」の行を参照
                f = f.replace(f"{col}{r}-", f"{col}{start}-").replace(f"{col}{r + 1}-", f"{col}{start + 1}-") \
                     .replace(f"{col}{r + 2}-", f"{col}{start + 2}-")
            body(ss.cell(row=rr, column=3 + i, value=f), num=True, bold=bold, fill=SAND)
    ss.column_dimensions["A"].width = 40
    ss.column_dimensions["B"].width = 20
    for j in range(3, 7):
        ss.column_dimensions[get_column_letter(j)].width = 16
    ss.freeze_panes = "C4"
    wb.active = 0
    wb.save(path)


if __name__ == "__main__":
    import sys
    out = sys.argv[1] if len(sys.argv) > 1 else "."
    build_xlsx(f"{out}/組織再編_連結PL_2026-2029.xlsx")
    res = build_json()
    with open(f"{out}/model.json", "w", encoding="utf-8") as f:
        json.dump(res, f, ensure_ascii=False, indent=1)
    for sg in res["segments"]:
        print(f"{sg['name']:16s}", " ".join(f"{r:8.1f}/{o:6.1f}" for r, o in zip(sg["rev"], sg["op"])))
    for lab, t in (("含む", res["total"]), ("除く", res["total_ex"])):
        print(lab, " ".join(f"{r:8.1f}/{o:6.1f}/持分{a:6.1f}" for r, o, a in zip(t["rev"], t["op"], t["attrib_op"])))
