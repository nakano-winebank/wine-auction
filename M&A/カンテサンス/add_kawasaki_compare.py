# カンテサンス ワイン在庫 時価評価表に、川﨑の簡易査定（ダブルチェック）を並べて比較する
# 使い方: python3 add_kawasaki_compare.py <時価評価表.xlsx（build_wine_valuation.pyの出力）> <川﨑査定.xlsx> <出力.xlsx>
#   川﨑査定.xlsx … Drive「ワイン在庫_時価評価表_202610川﨑査定.xlsx」（2026/11/12 川﨑更新）。No.で突合し、銘柄名の一致も確認する。
import sys, re
from openpyxl import load_workbook
from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.formatting.rule import CellIsRule, FormulaRule

BASE, KW, OUT = sys.argv[1:4]
kv = load_workbook(KW, data_only=True)["評価明細"]
kf = load_workbook(KW)["評価明細"]

F = "Arial"
H = Font(name=F, size=10, bold=True, color="FFFFFF"); HF = PatternFill("solid", fgColor="6D2E46")
KH = PatternFill("solid", fgColor="2F5D50")  # 川﨑の列は緑の見出しで区別
B = Font(name=F, size=10, bold=True); N = Font(name=F, size=10); NOTE = Font(name=F, size=9, color="6E6368")
RED = Font(name=F, size=9, color="C00000"); T = Font(name=F, size=14, bold=True)
TF = PatternFill("solid", fgColor="F7F3F4"); KF = PatternFill("solid", fgColor="EAF2EE")
YEN = '#,##0;(#,##0);"-"'; PCT = '+0%;-0%;0%'; X = '0.00"x";(0.00"x");"-"'

# ---- 川﨑の査定を読む（No.→値） ----
kw = {}
for r in range(5, kv.max_row + 1):
    no = kv.cell(row=r, column=1).value
    if no is None: continue
    q = kv.cell(row=r, column=7).value or 0
    unit = kv.cell(row=r, column=21).value          # U：査定額 税抜/本（TOPLOTがあればTOPLOT×1.15、なければ想定）
    wform = kf.cell(row=r, column=23).value         # W：想定 税抜（式または手入力）
    toplot = kv.cell(row=r, column=25).value        # Y：TOPLOT価格
    rnd = kv.cell(row=r, column=26).value           # Z：TOPLOT出品回
    basis, flag, fixed = "", "", unit
    if isinstance(toplot, (int, float)) and toplot > 0:
        when = f"{rnd.year}年{rnd.month}月" if hasattr(rnd, "year") else (str(rnd) if rnd else "")
        basis = f"TOPLOT落札 {toplot:,.0f}円×1.15（手数料込）" + (f"／{when}出品" if when else "")
    elif isinstance(wform, str) and wform.startswith("="):
        m = re.match(r"=([HIN])(\d+)(?:\*([\d.]+)|/([\d.]+))?$", wform.replace(" ", ""))
        if m:
            col, k = m.group(1), m.group(3) or (f"1/{m.group(4)}" if m.group(4) else "1")
            if col == "H": basis = f"仕入単価×{k}"
            elif col == "I":
                basis = f"原価合計×{k}"
                if q > 1:
                    fixed = unit / q
                    flag = f"本数分の二重計上を補正（原本 {unit:,.0f}円/本 → {fixed:,.0f}円/本）"
            else:
                basis = f"当方の評価額×{k}"
                if q > 1:
                    fixed = unit / q
                    flag = f"本数分の二重計上を補正（当方の評価額は{q:.0f}本分の合計。原本 {unit:,.0f}円/本 → {fixed:,.0f}円/本）"
        else:
            basis = f"式 {wform}"
    elif isinstance(wform, (int, float)):
        basis = "個別査定（手入力）"
    kw[int(no)] = dict(name=(kv.cell(row=r, column=5).value or "").strip(), unit=unit, fixed=fixed, basis=basis, flag=flag)

# ---- 評価明細に列を追加 ----
wb = load_workbook(BASE)
ls = wb["評価明細"]; HR = 4
LAST = HR
while ls.cell(row=LAST + 1, column=1).value is not None: LAST += 1
add = [("T", "川﨑査定\n単価（税抜）", 12), ("U", "川﨑査定額\n（計）", 13), ("V", "差額\n（川﨑−当方）", 13), ("W", "差率\n（川﨑÷当方−1）", 9),
       ("X", "川﨑の査定根拠", 34), ("Y", "確認事項", 40), ("Z", "川﨑査定 単価\n（原本のまま）", 12)]
for col, h, w in add:
    c = ls[f"{col}{HR}"]; c.value = h; c.font = H; c.fill = KH; c.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
    ls.column_dimensions[col].width = w
miss = mism = 0
for r in range(HR + 1, LAST + 1):
    no = int(ls.cell(row=r, column=1).value); k = kw.get(no)
    if not k: miss += 1; continue
    if k["name"] != str(ls.cell(row=r, column=5).value).strip(): mism += 1
    ls[f"T{r}"] = round(k["fixed"]) if isinstance(k["fixed"], (int, float)) else None
    ls[f"U{r}"] = f"=IF(T{r}=\"\",\"\",G{r}*T{r})"
    ls[f"V{r}"] = f"=IF(U{r}=\"\",\"\",U{r}-N{r})"
    ls[f"W{r}"] = f"=IF(OR(U{r}=\"\",N{r}=0),\"\",U{r}/N{r}-1)"
    ls[f"X{r}"] = k["basis"] or None
    ls[f"Y{r}"] = k["flag"] or None
    ls[f"Z{r}"] = k["unit"]
    for col in "TUVZ": ls[f"{col}{r}"].number_format = YEN
    ls[f"W{r}"].number_format = PCT
    for col in "TUVWZ": ls[f"{col}{r}"].font = N; ls[f"{col}{r}"].fill = KF
    ls[f"X{r}"].font = NOTE; ls[f"Y{r}"].font = RED
assert miss == 0 and mism == 0, (miss, mism)
ls["A2"] = (ls["A2"].value or "") + "　T〜Z列＝川﨑の簡易査定（2026/11/12）との比較（緑の見出し）。"
ls.auto_filter.ref = f"A{HR}:Z{LAST}"
# 差が大きい行（±50%超）を色付け
ls.conditional_formatting.add(f"W{HR+1}:W{LAST}", CellIsRule(operator="greaterThan", formula=["0.5"], font=Font(name=F, size=10, bold=True, color="1F6F43")))
ls.conditional_formatting.add(f"W{HR+1}:W{LAST}", CellIsRule(operator="lessThan", formula=["-0.33"], font=Font(name=F, size=10, bold=True, color="C00000")))

# ---- 比較シート ----
cs = wb.create_sheet("川﨑査定との比較", 1)
R = "'評価明細'!"
rg = lambda col: f"{R}${col}${HR+1}:${col}${LAST}"
cs["A1"] = "当方の時価評価と川﨑の簡易査定の比較"; cs["A1"].font = T
cs["A2"] = ("当方＝楽天最安値（税抜）ベース（掛率は『前提』B5、現在100%）。川﨑＝TOPLOT落札実績×1.15（手数料込）と、プロの感覚での想定価格（税抜）。"
            "金額は円・税抜、2026年10月末棚卸し（1,944品目・2,667本）。"); cs["A2"].font = NOTE

def hdr(r, labels, kcols=()):
    for j, h in enumerate(labels, 1):
        c = cs.cell(row=r, column=j, value=h); c.font = H; c.fill = KH if j in kcols else HF
        c.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
    cs.row_dimensions[r].height = 30

# 1. 全体
cs["A4"] = "■ 全体"; cs["A4"].font = B
hdr(5, ["項目", "金額", "原価に対する倍率", "当方との差"], ())
tot = [("原価合計（棚卸の仕入単価×本数）", f"=SUM({rg('I')})"),
       ("当方の評価額（楽天最安値ベース）", f"=SUM({rg('N')})"),
       ("川﨑の査定額（補正後）", f"=SUM({rg('U')})"),
       ("川﨑の査定額（原本のまま）", f"=SUMPRODUCT({rg('G')},{rg('Z')})")]
for i, (lab, f) in enumerate(tot):
    r = 6 + i
    cs.cell(row=r, column=1, value=lab).font = B if i in (1, 2) else N
    c = cs.cell(row=r, column=2, value=f); c.number_format = YEN; c.font = B if i in (1, 2) else N
    c = cs.cell(row=r, column=3, value=f"=B{r}/$B$6"); c.number_format = X
    if i >= 2:
        c = cs.cell(row=r, column=4, value=f"=B{r}-$B$7"); c.number_format = YEN
    if i in (1, 2):
        for j in range(1, 5): cs.cell(row=r, column=j).fill = TF if i == 1 else KF
cs["A10"] = "含み益（評価額−原価）：当方"; cs["B10"] = "=B7-B6"; cs["B10"].number_format = YEN
cs["A11"] = "含み益（評価額−原価）：川﨑（補正後）"; cs["B11"] = "=B8-B6"; cs["B11"].number_format = YEN
cs["A12"] = "2人の平均（参考）"; cs["B12"] = "=AVERAGE(B7,B8)"; cs["B12"].number_format = YEN; cs["C12"] = "=B12/$B$6"; cs["C12"].number_format = X
for a in ("A10", "A11", "A12"): cs[a].font = N

# 2. 当方の時価の根拠別
r0 = 14
cs.cell(row=r0, column=1, value="■ 当方の時価の根拠別（どこで差が出ているか）").font = B
hdr(r0 + 1, ["当方の区分", "品目数", "原価合計", "当方の評価額", "川﨑の査定額", "差（川﨑−当方）", "当方÷原価", "川﨑÷原価"], (5, 8))
tiers = ["A 楽天・同年", "B 楽天・近接年", "C 生産者倍率で推定"]
for i, t in enumerate(tiers + ["時価なし（当方は原価で評価）"]):
    r = r0 + 2 + i
    cs.cell(row=r, column=1, value=t).font = N
    if i < 3:
        cs.cell(row=r, column=2, value=f"=COUNTIF({rg('J')},$A{r})")
        for j, col in ((3, "I"), (4, "N"), (5, "U")):
            cs.cell(row=r, column=j, value=f"=SUMIF({rg('J')},$A{r},{rg(col)})")
    else:
        cs.cell(row=r, column=2, value=f"=COUNTBLANK({rg('J')})")
        for j, col in ((3, "I"), (4, "N"), (5, "U")):
            cs.cell(row=r, column=j, value=f"=SUMIF({rg('J')},\"\",{rg(col)})")
    cs.cell(row=r, column=6, value=f"=E{r}-D{r}")
    cs.cell(row=r, column=7, value=f"=IF(C{r}=0,\"\",D{r}/C{r})"); cs.cell(row=r, column=8, value=f"=IF(C{r}=0,\"\",E{r}/C{r})")
r = r0 + 6
cs.cell(row=r, column=1, value="合計").font = B
for j, col in ((2, "B"), (3, "C"), (4, "D"), (5, "E"), (6, "F")):
    cs.cell(row=r, column=j, value=f"=SUM({col}{r0+2}:{col}{r0+5})").font = B
cs.cell(row=r, column=7, value=f"=D{r}/C{r}"); cs.cell(row=r, column=8, value=f"=E{r}/C{r}")
for rr in range(r0 + 2, r0 + 7):
    cs.cell(row=rr, column=2).number_format = '#,##0'
    for j in (3, 4, 5, 6): cs.cell(row=rr, column=j).number_format = YEN
    for j in (7, 8): cs.cell(row=rr, column=j).number_format = X

# 3. 川﨑の査定根拠別
r1 = r0 + 9
cs.cell(row=r1, column=1, value="■ 川﨑の査定根拠別").font = B
hdr(r1 + 1, ["川﨑の根拠", "品目数", "原価合計", "当方の評価額", "川﨑の査定額", "差（川﨑−当方）", "当方÷原価", "川﨑÷原価"], (5, 8))
kinds = [("TOPLOT落札実績×1.15", "TOPLOT*"), ("個別査定（手入力）", "個別査定*"), ("仕入単価×倍率", "仕入単価*"),
         ("原価合計×倍率", "原価合計*"), ("当方の評価額を参照", "当方*")]
for i, (lab, pat) in enumerate(kinds):
    r = r1 + 2 + i
    cs.cell(row=r, column=1, value=lab).font = N
    cs.cell(row=r, column=2, value=f"=COUNTIF({rg('X')},\"{pat}\")").number_format = '#,##0'
    for j, col in ((3, "I"), (4, "N"), (5, "U")):
        cs.cell(row=r, column=j, value=f"=SUMIF({rg('X')},\"{pat}\",{rg(col)})").number_format = YEN
    cs.cell(row=r, column=6, value=f"=E{r}-D{r}").number_format = YEN
    cs.cell(row=r, column=7, value=f"=IF(C{r}=0,\"\",D{r}/C{r})").number_format = X
    cs.cell(row=r, column=8, value=f"=IF(C{r}=0,\"\",E{r}/C{r})").number_format = X

# 4. 分類別
r2 = r1 + 9
cs.cell(row=r2, column=1, value="■ 分類別").font = B
hdr(r2 + 1, ["分類", "本数", "原価合計", "当方の評価額", "川﨑の査定額", "差（川﨑−当方）", "当方÷原価", "川﨑÷原価"], (5, 8))
sm = wb["サマリー"]
cats = []
for rr in range(1, sm.max_row + 1):
    if sm.cell(row=rr, column=1).value == "分類":
        k = rr + 1
        while sm.cell(row=k, column=1).value and not str(sm.cell(row=k, column=1).value).startswith("【"):
            cats.append(sm.cell(row=k, column=1).value); k += 1
for i, cat in enumerate(cats):
    r = r2 + 2 + i
    cs.cell(row=r, column=1, value=cat).font = N
    cs.cell(row=r, column=2, value=f"=SUMIF({rg('C')},$A{r},{rg('G')})").number_format = '#,##0'
    for j, col in ((3, "I"), (4, "N"), (5, "U")):
        cs.cell(row=r, column=j, value=f"=SUMIF({rg('C')},$A{r},{rg(col)})").number_format = YEN
    cs.cell(row=r, column=6, value=f"=E{r}-D{r}").number_format = YEN
    cs.cell(row=r, column=7, value=f"=IF(C{r}=0,\"\",D{r}/C{r})").number_format = X
    cs.cell(row=r, column=8, value=f"=IF(C{r}=0,\"\",E{r}/C{r})").number_format = X

# 5. 差の大きい品目（金額の差の絶対値 上位30）
r3 = r2 + 3 + len(cats)
cs.cell(row=r3, column=1, value="■ 差の大きい品目（差額の大きい順・上位30）— 2人で目線を合わせる対象").font = B
hdr(r3 + 1, ["No.", "銘柄", "年代", "本数", "当方の評価額", "川﨑の査定額", "差（川﨑−当方）", "差率", "当方の根拠", "川﨑の根拠"], (6,))
diffs = []
for r in range(HR + 1, LAST + 1):
    no = int(ls.cell(row=r, column=1).value); k = kw[no]
    q = ls.cell(row=r, column=7).value; cost = ls.cell(row=r, column=8).value or 0
    diffs.append((r, no))
# 並べ替え用に値を概算（当方の評価額はPythonで再計算：時価単価の式を再現）
pr = wb["前提"]; tax, rate = pr["B4"].value, pr["B5"].value
def ours(r):
    q = ls.cell(row=r, column=7).value; h = ls.cell(row=r, column=8).value or 0
    k = ls.cell(row=r, column=11).value; l = ls.cell(row=r, column=12).value
    if isinstance(k, (int, float)): return q * round(k / tax * rate, -2)
    if isinstance(l, (int, float)): return q * round(h * l * rate, -2)
    return q * h
kwtot = lambda r: ls.cell(row=r, column=7).value * (ls.cell(row=r, column=20).value or 0)
ranked = sorted(diffs, key=lambda x: -abs(kwtot(x[0]) - ours(x[0])))[:30]
for i, (sr, no) in enumerate(ranked):
    r = r3 + 2 + i
    vals = [f"={R}A{sr}", f"={R}E{sr}&\"（\"&{R}F{sr}&\"）\"", f"={R}D{sr}", f"={R}G{sr}", f"={R}N{sr}", f"={R}U{sr}",
            f"=F{r}-E{r}", f"=IF(E{r}=0,\"\",F{r}/E{r}-1)", f"={R}J{sr}&IF({R}Q{sr}=\"\",\"\",\"：\"&LEFT({R}Q{sr},40))", f"={R}X{sr}&IF({R}Y{sr}=\"\",\"\",\"／\"&{R}Y{sr})"]
    for j, v in enumerate(vals, 1):
        c = cs.cell(row=r, column=j, value=v); c.font = NOTE if j in (9, 10) else N
    for j in (5, 6, 7): cs.cell(row=r, column=j).number_format = YEN
    cs.cell(row=r, column=8).number_format = PCT
    cs.cell(row=r, column=4).number_format = '#,##0'

nr = r3 + 33
notes = [
    "【見方】当方は「国内で今買える最安値」、川﨑は「業者・オークションで実際に売れる水準＋プロの感覚」。銀行・投資家向けには低いほうか平均を使い、根拠（楽天最安値／TOPLOT実績）を添えるのが無難。",
    "【補正】川﨑の想定のうち「原価合計×倍率」で入力された行は、本数が2本以上だと1本あたりの価格に本数分が掛かっていたため、1本あたりに割り戻した（確認事項の列に原本の値を記載）。原本のままの合計も上の表に併記。",
    "【補正】「当方の評価額×倍率」で入力された行（David Duband 8品目）も、評価額は本数分の合計のため、2本以上の行は1本あたりに割り戻した。",
]
for i, t in enumerate(notes):
    c = cs.cell(row=nr + i, column=1, value=t); c.font = NOTE; c.alignment = Alignment(wrap_text=True, vertical="top")
    cs.merge_cells(start_row=nr + i, start_column=1, end_row=nr + i, end_column=10); cs.row_dimensions[nr + i].height = 30
widths = {"A": 34, "B": 40, "C": 14, "D": 14, "E": 14, "F": 14, "G": 14, "H": 10, "I": 34, "J": 40}
for k2, w in widths.items(): cs.column_dimensions[k2].width = w
cs.freeze_panes = "A4"

# サマリーにも1行
sm["D4"] = "川﨑の簡易査定（補正後）との比較 →『川﨑査定との比較』シート"; sm["D4"].font = B
sm["D5"] = "川﨑の査定額"; sm["E5"] = f"=SUM({rg('U')})"; sm["E5"].number_format = YEN
sm["D6"] = "当方との差"; sm["E6"] = "=E5-B8"; sm["E6"].number_format = YEN
sm["D7"] = "川﨑÷原価"; sm["E7"] = "=E5/B7"; sm["E7"].number_format = X
for a in ("D5", "D6", "D7"): sm[a].font = N
wb.save(OUT); print("saved", OUT, "rows", LAST - HR)
