# カンテサンス ワイン在庫 時価評価表（2026年10月末棚卸しベース）
# 時価 = 楽天最安値（税抜）。WineBankの価格比較シート3点から突合した結果（match.json）を使う。
# 使い方: python3 build_wine_valuation.py <棚卸し.xlsm> <match.json> <出力.xlsx>
#   match.json は scripts_wine_valuation/build_ref.py → match.py で作る
import sys, json
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.formatting.rule import FormulaRule

SRC, MATCH, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
TOP_N = 100
items = json.load(open(MATCH, encoding="utf-8"))
items.sort(key=lambda x: -x["q"] * x["cost"])

F = "Arial"
H = Font(name=F, size=10, bold=True, color="FFFFFF"); HF = PatternFill("solid", fgColor="6D2E46")
B = Font(name=F, size=10, bold=True); N = Font(name=F, size=10); BLUE = Font(name=F, size=10, color="0000FF")
NOTE = Font(name=F, size=9, color="6E6368"); T = Font(name=F, size=14, bold=True)
YF = PatternFill("solid", fgColor="FFF2CC"); TF = PatternFill("solid", fgColor="F7F3F4")
YEN = '#,##0;(#,##0);"-"'; PCT = '0.0%;(0.0%);"-"'; X = '0.00"x";(0.00"x");"-"'
TIER = {"A": "A 楽天・同年", "B": "B 楽天・近接年", "C": "C 生産者倍率で推定", "XC": "C 生産者倍率で推定", "X": "", "": ""}

wb = Workbook()
sm = wb.active; sm.title = "サマリー"
pr = wb.create_sheet("前提")
ls = wb.create_sheet("評価明細")

# ---------- 前提 ----------
pr["A1"] = "時価の前提"; pr["A1"].font = T
for j, h in enumerate(["項目", "値", "説明"], 1):
    c = pr.cell(row=3, column=j, value=h); c.font = H; c.fill = HF
pr["A4"] = "消費税（税込→税抜）"; pr["B4"] = 1.1; pr["B4"].number_format = '0.00'
pr["C4"] = "楽天最安値は税込のため1.1で割って税抜にする（棚卸の原価は税抜）。"
pr["A5"] = "掛率（楽天最安値に対する時価の水準）"; pr["B5"] = 1.0; pr["B5"].number_format = '0%'
pr["C5"] = "100%＝楽天最安値（税抜）そのまま。売却手取りの水準で見る場合は下げる（例：業者買取・オークション手取りなら70〜80%）。"
for c in ("B4", "B5"): pr[c].font = BLUE; pr[c].fill = YF
for c in ("A4", "A5"): pr[c].font = N
notes = [
    "【参照データ】WineBankの価格比較シート3点から楽天最安値（税込）を抜き出し、年代・生産者・銘柄で棚卸と突合した。",
    "　①検討中ワイン価格比較・ファンド発注リスト　②P2-202509-10（20261027Rev.を優先）　③P1提案ワイン時価比較v2.3（2610、採用価格を含む）。同じ銘柄が複数ある場合は新しいシートの最安値を使う。",
    "【区分】A＝同じ年代の楽天最安値。B＝同じ銘柄の近い年代（±3年以内）の楽天最安値。C＝楽天で見つからない品目に、同じ生産者のA・Bの倍率（楽天最安値÷原価）の下位25%点を原価に掛けて推定（3件以上ある生産者のみ、下限1.0倍）。",
    "【除外】楽天最安値が原価の8倍を超えるものは、容量違いや別商品の可能性があるため使わず、Cで推定した（評価明細の根拠欄に記載）。",
    "【未評価】A・B・Cのいずれもない品目は原価で評価する（保守的）。",
]
for i, t in enumerate(notes):
    c = pr.cell(row=7 + i, column=1, value=t); c.font = NOTE; c.alignment = Alignment(wrap_text=True, vertical="top")
    pr.merge_cells(start_row=7 + i, start_column=1, end_row=7 + i, end_column=3); pr.row_dimensions[7 + i].height = 40
pr.row_dimensions[5].height = 36
for c in ("C4", "C5"): pr[c].font = NOTE; pr[c].alignment = Alignment(wrap_text=True, vertical="top")
pr.column_dimensions["A"].width = 36; pr.column_dimensions["B"].width = 10; pr.column_dimensions["C"].width = 80

# ---------- 評価明細 ----------
cols = ["No.", "優先評価", "分類", "年代", "銘柄", "生産者／地域", "本数", "仕入単価", "原価合計",
        "区分", "楽天最安値（税込）", "推定倍率", "時価単価（税抜）", "評価額", "含み益", "時価÷原価",
        "評価根拠（楽天の商品名・出所）", "採用価格（P1時価比較・参考）", "TOPLOT落札額（参考）"]
ls["A1"] = "カンテサンス ワイン在庫 時価評価明細（2026年10月末棚卸し）"; ls["A1"].font = T
ls["A2"] = "原価の大きい順。時価単価＝楽天最安値÷1.1×掛率（区分A・B）、または原価×生産者倍率×掛率（区分C）。黄色セルは上書き可。時価のない行は原価で評価。"; ls["A2"].font = NOTE
HR = 4
for j, c in enumerate(cols, 1):
    cell = ls.cell(row=HR, column=j, value=c); cell.font = H; cell.fill = HF
    cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
ls.row_dimensions[HR].height = 30
P = "'前提'!"
for i, x in enumerate(items):
    r = HR + 1 + i
    tier = x.get("tier", "")
    vals = [i + 1, "★" if i < TOP_N else "", x["cat"], x["vt"] if x["vt"] is not None else "", x["name"], x["prod"], x["q"], x["cost"]]
    for j, v in enumerate(vals, 1): ls.cell(row=r, column=j, value=v).font = N
    ls.cell(row=r, column=9, value=f"=G{r}*H{r}")
    ls.cell(row=r, column=10, value=TIER[tier] or None).font = N
    o = ls.cell(row=r, column=13); o.fill = YF; o.font = BLUE
    basis = ""
    if tier in ("A", "B"):
        price = x["rk"] or x["adopt"]
        ls.cell(row=r, column=11, value=price).font = N
        o.value = f"=ROUND(K{r}/{P}$B$4*{P}$B$5,-2)"; o.font = N
        basis = (x["rk_name"] or "P1時価比較（採用価格）") + "｜" + (x["rk_src"] or "r3:時価比較(2610)").replace("r1:", "①").replace("r2:", "②").replace("r3:", "③")
        if tier == "B": basis = f"[{x['how']}] " + basis
    elif tier in ("C", "XC"):
        ls.cell(row=r, column=12, value=x["est_ratio"]).font = N
        o.value = f"=ROUND(H{r}*L{r}*{P}$B$5,-2)"; o.font = N
        basis = f"同じ生産者の楽天最安値÷原価（{x['est_n']}件）の下位25%点 {x['est_ratio']}倍"
        if tier == "XC":
            basis += f"。楽天 {int(x['rk'] or x['adopt']):,}円（{x['rk_name'][:40] or '③'}）は原価の{x['ratio']:.1f}倍で要確認のため不使用"
    ls.cell(row=r, column=14, value=f"=G{r}*IF(M{r}=\"\",H{r},M{r})")
    ls.cell(row=r, column=15, value=f"=N{r}-I{r}")
    ls.cell(row=r, column=16, value=f"=IF(I{r}=0,\"\",N{r}/I{r})").number_format = X
    ls.cell(row=r, column=17, value=basis or None).font = NOTE
    if x.get("adopt"): ls.cell(row=r, column=18, value=x["adopt"]).font = N
    if x.get("toplot"): ls.cell(row=r, column=19, value=x["toplot"]).font = N
    for j in (8, 9, 11, 13, 14, 15, 18, 19): ls.cell(row=r, column=j).number_format = YEN
    ls.cell(row=r, column=12).number_format = '0.00"x"'
LAST = HR + len(items)
widths = [5, 6, 9, 7, 42, 18, 6, 11, 12, 16, 13, 8, 13, 13, 12, 9, 60, 14, 14]
for j, w in enumerate(widths, 1):
    ls.column_dimensions[ls.cell(row=HR, column=j).column_letter].width = w
ls.freeze_panes = f"F{HR+1}"
ls.auto_filter.ref = f"A{HR}:S{LAST}"
ls.conditional_formatting.add(f"A{HR+1}:S{LAST}", FormulaRule(formula=[f'$B{HR+1}="★"'], fill=TF))

# ---------- サマリー ----------
R = "'評価明細'!"
rng = lambda col: f"{R}${col}${HR+1}:${col}${LAST}"
sm["A1"] = "カンテサンス ワイン在庫 時価評価サマリー"; sm["A1"].font = T
sm["A2"] = "出所：カンテサンスワイン棚卸し2610月末.xlsm（月間在庫管理表、ソフトドリンク・分類なしを除く）。時価は楽天最安値（税抜）ベース。金額は円・税抜。"; sm["A2"].font = NOTE
rows = [
    ("■ 全体", None, None, True),
    ("品目数", f"=COUNTA({rng('E')})", '#,##0', False),
    ("本数", f"=SUM({rng('G')})", '#,##0', False),
    ("原価合計", f"=SUM({rng('I')})", YEN, False),
    ("評価額（時価のない品目は原価）", f"=SUM({rng('N')})", YEN, True),
    ("含み益（評価額−原価）", "=B8-B7", YEN, True),
    ("評価額÷原価", "=B8/B7", X, False),
    ("掛率（『前提』シート）", f"={P}B5", '0%', False),
]
for i, (lab, f, fmt, bold) in enumerate(rows):
    r = 4 + i
    if lab: sm.cell(row=r, column=1, value=lab).font = B if bold else N
    if f:
        c = sm.cell(row=r, column=2, value=f); c.number_format = fmt; c.font = B if bold else N
        if bold: c.fill = TF

r0 = 13
sm.cell(row=r0, column=1, value="■ 時価の根拠別").font = B
for j, h in enumerate(["区分", "品目数", "本数", "原価合計", "評価額", "含み益", "評価額÷原価"], 1):
    c = sm.cell(row=r0 + 1, column=j, value=h); c.font = H; c.fill = HF
tiers = ["A 楽天・同年", "B 楽天・近接年", "C 生産者倍率で推定"]
for i, k in enumerate(tiers):
    r = r0 + 2 + i
    sm.cell(row=r, column=1, value=k).font = N
    sm.cell(row=r, column=2, value=f"=COUNTIF({rng('J')},$A{r})").number_format = '#,##0'
    for j, col in ((3, "G"), (4, "I"), (5, "N")):
        sm.cell(row=r, column=j, value=f"=SUMIF({rng('J')},$A{r},{rng(col)})").number_format = YEN if j > 3 else '#,##0'
    sm.cell(row=r, column=6, value=f"=E{r}-D{r}").number_format = YEN
    sm.cell(row=r, column=7, value=f"=IF(D{r}=0,\"\",E{r}/D{r})").number_format = X
r = r0 + 5
sm.cell(row=r, column=1, value="時価なし（原価で評価）").font = N
sm.cell(row=r, column=2, value=f"=B5-SUM(B{r0+2}:B{r0+4})").number_format = '#,##0'
sm.cell(row=r, column=3, value=f"=B6-SUM(C{r0+2}:C{r0+4})").number_format = '#,##0'
sm.cell(row=r, column=4, value=f"=B7-SUM(D{r0+2}:D{r0+4})").number_format = YEN
sm.cell(row=r, column=5, value=f"=B8-SUM(E{r0+2}:E{r0+4})").number_format = YEN
sm.cell(row=r, column=6, value=f"=E{r}-D{r}").number_format = YEN
r = r0 + 6
sm.cell(row=r, column=1, value="うち楽天で確認できた分（A＋B）").font = B
for j, col in ((2, "B"), (3, "C"), (4, "D"), (5, "E")):
    sm.cell(row=r, column=j, value=f"=SUM({col}{r0+2}:{col}{r0+3})").number_format = YEN if j > 3 else '#,##0'
sm.cell(row=r, column=6, value=f"=E{r}-D{r}").number_format = YEN
sm.cell(row=r, column=7, value=f"=IF(D{r}=0,\"\",E{r}/D{r})").number_format = X
for j in range(1, 8): sm.cell(row=r, column=j).fill = TF

r1 = r0 + 9
sm.cell(row=r1, column=1, value="■ 優先評価（原価上位100品目）").font = B
top = [("原価合計", f"=SUMIF({rng('B')},\"★\",{rng('I')})", YEN),
       ("全体に占める割合", f"=B{r1+1}/B7", PCT),
       ("評価額", f"=SUMIF({rng('B')},\"★\",{rng('N')})", YEN),
       ("含み益", f"=B{r1+3}-B{r1+1}", YEN)]
for i, (lab, f, fmt) in enumerate(top):
    sm.cell(row=r1 + 1 + i, column=1, value=lab).font = N
    c = sm.cell(row=r1 + 1 + i, column=2, value=f); c.number_format = fmt

r2 = r1 + 7
sm.cell(row=r2, column=1, value="■ 分類別").font = B
for j, h in enumerate(["分類", "本数", "原価合計", "評価額", "含み益", "評価額÷原価"], 1):
    c = sm.cell(row=r2 + 1, column=j, value=h); c.font = H; c.fill = HF
cats = []
for x in items:
    if x["cat"] not in cats: cats.append(x["cat"])
cats.sort(key=lambda k: -sum(x["q"] * x["cost"] for x in items if x["cat"] == k))
for i, k in enumerate(cats):
    r = r2 + 2 + i
    sm.cell(row=r, column=1, value=k).font = N
    for j, col in ((2, "G"), (3, "I"), (4, "N")):
        sm.cell(row=r, column=j, value=f"=SUMIF({rng('C')},$A{r},{rng(col)})").number_format = YEN if j > 2 else '#,##0'
    sm.cell(row=r, column=5, value=f"=D{r}-C{r}").number_format = YEN
    sm.cell(row=r, column=6, value=f"=IF(C{r}=0,\"\",D{r}/C{r})").number_format = X

nr = r2 + 3 + len(cats)
for i, t in enumerate([
    "【時価の考え方】楽天最安値（税抜）＝国内の市場で実際に買える最も安い価格。区分A・Bは実勢の確認値、Cは同じ生産者の実勢から推した値。根拠は『前提』『評価明細』に記載。",
    "【保守的に見る場合】『前提』の掛率を下げると全体が連動する（例：80%＝業者買取・オークション手取りの水準）。銀行向けには、A＋Bの確認分と掛率を明示した数字を使う。",
]):
    c = sm.cell(row=nr + i, column=1, value=t); c.font = NOTE; c.alignment = Alignment(wrap_text=True, vertical="top")
    sm.merge_cells(start_row=nr + i, start_column=1, end_row=nr + i, end_column=7); sm.row_dimensions[nr + i].height = 36
sm.column_dimensions["A"].width = 34
for col in "BCDEFG": sm.column_dimensions[col].width = 15

wb.save(OUT); print("saved", len(items), "items")
