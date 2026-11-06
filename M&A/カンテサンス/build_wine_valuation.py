# カンテサンス ワイン在庫 時価評価表（2026年10月末棚卸しベース）
# 使い方: python3 build_wine_valuation.py <棚卸し.xlsm> <出力.xlsx>
import sys
from openpyxl import Workbook, load_workbook
from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.formatting.rule import FormulaRule

SRC, OUT = sys.argv[1], sys.argv[2]
EXCLUDE = {None, "ソフトドリンク"}
TOP_N = 100

src = load_workbook(SRC, data_only=True, read_only=True)["月間在庫管理表"]
num = lambda v: v if isinstance(v, (int, float)) else 0
items = []
for r in src.iter_rows(min_row=26, values_only=True):
    name, cat = r[9], r[5]
    q = num(r[11]) + num(r[12])
    if not isinstance(name, str) or not name.strip() or cat in EXCLUDE or q <= 0:
        continue
    items.append(dict(cat=cat, vt=r[8], name=name.strip(), reg=r[10], imp=r[3], sup=r[4],
                      st=r[7] if isinstance(r[7], str) else "", q=q, cost=num(r[15]), price=num(r[13])))
items.sort(key=lambda x: -x["q"] * x["cost"])

F = "Arial"
H = Font(name=F, size=10, bold=True, color="FFFFFF"); HF = PatternFill("solid", fgColor="6D2E46")
B = Font(name=F, size=10, bold=True); N = Font(name=F, size=10); BLUE = Font(name=F, size=10, color="0000FF")
NOTE = Font(name=F, size=9, color="6E6368"); T = Font(name=F, size=14, bold=True)
YF = PatternFill("solid", fgColor="FFF2CC"); TF = PatternFill("solid", fgColor="F7F3F4")
YEN = '#,##0;(#,##0);"-"'; PCT = '0.0%;(0.0%);"-"'; X = '0.00"x";(0.00"x");"-"'

wb = Workbook()
sm = wb.active; sm.title = "サマリー"
ls = wb.create_sheet("評価明細")

# ---------- 評価明細 ----------
cols = ["No.", "優先評価", "分類", "年代", "銘柄", "生産者／地域", "輸入元", "仕入先", "状態", "本数",
        "仕入単価", "原価合計", "リスト価格（税抜）", "リスト合計", "時価単価（入力）", "評価額", "含み益", "評価根拠・出典"]
ls["A1"] = "カンテサンス ワイン在庫 時価評価明細（2026年10月末棚卸し）"; ls["A1"].font = T
ls["A2"] = "原価の大きい順。黄色の「時価単価」に当社の時価を入力してください。未入力の行は原価で評価します（保守的）。"; ls["A2"].font = NOTE
HR = 4
for j, c in enumerate(cols, 1):
    cell = ls.cell(row=HR, column=j, value=c); cell.font = H; cell.fill = HF
    cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
ls.row_dimensions[HR].height = 30
for i, x in enumerate(items):
    r = HR + 1 + i
    vals = [i + 1, "★" if i < TOP_N else "", x["cat"], x["vt"], x["name"], x["reg"], x["imp"], x["sup"], x["st"], x["q"], x["cost"]]
    for j, v in enumerate(vals, 1):
        ls.cell(row=r, column=j, value=v).font = N
    ls.cell(row=r, column=12, value=f"=J{r}*K{r}")
    ls.cell(row=r, column=13, value=x["price"]).font = N
    ls.cell(row=r, column=14, value=f"=J{r}*M{r}")
    c = ls.cell(row=r, column=15); c.font = BLUE; c.fill = YF
    ls.cell(row=r, column=16, value=f"=J{r}*IF(O{r}=\"\",K{r},O{r})")
    ls.cell(row=r, column=17, value=f"=P{r}-L{r}")
    ls.cell(row=r, column=18).font = BLUE
    for j in (11, 12, 13, 14, 15, 16, 17):
        ls.cell(row=r, column=j).number_format = YEN
LAST = HR + len(items)
widths = [5, 6, 9, 7, 46, 16, 14, 14, 11, 6, 11, 12, 12, 13, 13, 13, 12, 30]
for j, w in enumerate(widths, 1):
    ls.column_dimensions[ls.cell(row=HR, column=j).column_letter].width = w
ls.freeze_panes = f"F{HR+1}"
ls.auto_filter.ref = f"A{HR}:R{LAST}"
ls.conditional_formatting.add(f"A{HR+1}:R{LAST}", FormulaRule(formula=[f'$B{HR+1}="★"'], fill=TF))

# ---------- サマリー ----------
R = f"'評価明細'!"
rng = lambda col: f"{R}${col}${HR+1}:${col}${LAST}"
sm["A1"] = "カンテサンス ワイン在庫 時価評価サマリー"; sm["A1"].font = T
sm["A2"] = "出所：カンテサンスワイン棚卸し2610月末.xlsm（月間在庫管理表）。ソフトドリンク・分類なしの行は除外。金額は円。"; sm["A2"].font = NOTE

rows = [
    ("■ 全体", None, None, True),
    ("品目数", f"=COUNTA({rng('E')})", '#,##0', False),
    ("本数", f"=SUM({rng('J')})", '#,##0', False),
    ("原価合計", f"=SUM({rng('L')})", YEN, False),
    ("リスト価格合計（税抜）", f"=SUM({rng('N')})", YEN, False),
    ("リスト価格÷原価", "=B8/B7", X, False),
    ("評価額（時価入力分＋未入力分は原価）", f"=SUM({rng('P')})", YEN, True),
    ("含み益（評価額−原価）", "=B10-B7", YEN, True),
    ("時価を入力した品目数", f"=COUNT({rng('O')})", '#,##0', False),
    ("時価入力済みの原価カバー率", f"=SUMIF({rng('O')},\"<>\",{rng('L')})/B7", PCT, False),
    (None, None, None, False),
    ("■ 優先評価（原価上位100品目）", None, None, True),
    ("原価合計", f"=SUMIF({rng('B')},\"★\",{rng('L')})", YEN, False),
    ("全体に占める割合", "=B16/B7", PCT, False),
    ("リスト価格合計（税抜）", f"=SUMIF({rng('B')},\"★\",{rng('N')})", YEN, False),
    ("評価額", f"=SUMIF({rng('B')},\"★\",{rng('P')})", YEN, False),
    ("含み益", "=B19-B16", YEN, False),
]
for i, (lab, f, fmt, bold) in enumerate(rows):
    r = 4 + i
    if lab: sm.cell(row=r, column=1, value=lab).font = B if bold else N
    if f:
        c = sm.cell(row=r, column=2, value=f); c.number_format = fmt; c.font = B if bold else N
        if bold: c.fill = TF

r0 = 23
sm.cell(row=r0, column=1, value="■ 分類別").font = B
for j, h in enumerate(["分類", "本数", "原価合計", "リスト合計", "評価額", "含み益"], 1):
    c = sm.cell(row=r0 + 1, column=j, value=h); c.font = H; c.fill = HF
cats = []
for x in items:
    if x["cat"] not in cats: cats.append(x["cat"])
cats.sort(key=lambda k: -sum(x["q"] * x["cost"] for x in items if x["cat"] == k))
for i, k in enumerate(cats):
    r = r0 + 2 + i
    sm.cell(row=r, column=1, value=k).font = N
    for j, col in ((2, "J"), (3, "L"), (4, "N"), (5, "P")):
        c = sm.cell(row=r, column=j, value=f"=SUMIF({rng('C')},$A{r},{rng(col)})"); c.number_format = YEN if j > 2 else '#,##0'
    c = sm.cell(row=r, column=6, value=f"=E{r}-C{r}"); c.number_format = YEN

nr = r0 + 3 + len(cats)
notes = [
    "【入力方法】『評価明細』の黄色セル（時価単価）に、1本あたりの時価（税抜・当社の買取または販売の実勢価格）を入力。根拠（オークション落札、業者相場、当社販売実績など）をR列に記入。",
    "【評価の考え方】未入力の行は原価で評価するため、評価額は保守的な下限になる。★の上位100品目は原価の約3割だが、DRC・ルフレーヴ等の希少銘柄が集中し、時価と原価の差が最も大きい層。まずここを入力する。それ以外は流通品が中心で、原価で評価しても差は小さい。",
    "【注意】リスト価格はレストランでの提供価格（サービス込み）であり、時価ではない。銀行・投資家向けには、時価の根拠を明示した数字のみを使う。",
]
for i, t in enumerate(notes):
    c = sm.cell(row=nr + i, column=1, value=t); c.font = NOTE; c.alignment = Alignment(wrap_text=True, vertical="top")
    sm.merge_cells(start_row=nr + i, start_column=1, end_row=nr + i, end_column=6); sm.row_dimensions[nr + i].height = 36
sm.column_dimensions["A"].width = 38
for col in "BCDEF": sm.column_dimensions[col].width = 16

wb.save(OUT); print("saved", len(items), "items")
