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

# ---------- 市場参考価格（海外市場の平均的な小売価格・USD／本、税抜。当社推計） ----------
# (銘柄, 生産者, 対象ヴィンテージ, USD, 国内実績メモ)  対象: "R"=2010年以降, 数値の集合=その年のみ, None=年代なし
J_RC="国内落札：2022年 200.3万円（ヤフオク）"
PRICES = [
    ("Romanée-Conti", "D.R.C.", "R", 20000, J_RC),
    ("Romanée-Conti", "D.R.C.", {2005}, 28000, J_RC),
    ("Montrachet", "D.R.C.", "R", 7500, "国内落札：2014年 56.5万円、2005年 105.2万円"),
    ("La Tâche", "D.R.C.", "R", 6000, ""),
    ("La Tâche (B)", "D.R.C.", "R", 6000, ""),
    ("Richebourg", "D.R.C.", "R", 3800, ""),
    ("Richebourg (B)", "D.R.C.", "R", 3800, ""),
    ("Romanée-Saint-Vivan", "D.R.C.", "R", 3500, ""),
    ("Romanée-Saint-Vivant", "D.R.C.", "R", 3500, ""),
    ("Corton-Charlemagne", "D.R.C.", "R", 3200, ""),
    ("Montrachet", "Leflaive", {2010}, 12000, "国内落札：2005年 115.2万円"),
    ("Montrachet", "Leflaive", {1999}, 9000, "国内落札：2005年 115.2万円"),
    ("Chevalier-Montrachet", "Leflaive", "R", 1300, ""),
    ("Bâtard-Montrachet", "Leflaive", "R", 1000, ""),
    ("La Romanée Grand Cru Monopole", "Comte Liger-Belair", "R", 6000, ""),
    ("Chambertin", "Armand Rousseau", "R", 3200, "国内買取：2023年 27.5万円、2013〜15年 31〜36.5万円"),
    ("Chambertin-Clos de Bèze", "Armand Rousseau", "R", 2800, ""),
    ("Gevrey-Chambertin Clos Saint-Jacques", "Armand Rousseau", "R", 1400, ""),
    ("Charmes-Chambertin", "Armand Rousseau", "R", 600, ""),
    ("Échézeaux", "Bizot", "R", 3000, ""),
    ("Vosne-Romanée 1er Cru", "Bizot", "R", 1800, ""),
    ("Vosne-Romanée Les Jachées", "Bizot", "R", 1400, ""),
    ("Morey-Saint-Denis Clos de la Bidaude", "Bizot", "R", 1200, ""),
    ("Musigny", "Georges Roumier", "R", 22000, ""),
    ("Chambolle-Musigny Les Amoureuses", "Georges Roumier", "R", 5000, ""),
    ("Bonnes-Mares", "Georges Roumier", "R", 3000, ""),
    ("Ruchottes-Chambertin", "Christophe Roumier", "R", 3500, ""),
    ("Charmes-Chambertin Aux Mazoyeres", "Christophe Roumier", "R", 1500, ""),
    ("Musigny", "Jacques-Frédéric Mugnier", "R", 2000, ""),
    ("Chambolle-Musigny Les Amoureuses", "Jacques-Frédéric Mugnier", "R", 1500, ""),
    ("Musigny", "Faiveley", "R", 1200, ""),
    ("Vosne-Romanée Au Cros-Parantoux", "Méo-Camuzet", "R", 2200, ""),
    ("Vosne-Romanée Les Grands Suchots", "Arnoux-Lachaux", "R", 1500, ""),
    ("Échézeaux Les Rouges", "Arnoux-Lachaux", "R", 1600, ""),
    ("Nuits-Saint-Georges Clos des Corvées Pagets", "Arnoux-Lachaux", "R", 600, ""),
    ("Montrachet Marquis de Laguiche", "Joseph Drouhin", "R", 900, ""),
    ("Montrachet", "Comtes Lafon", "R", 3500, ""),
    ("Montrachet", "Ramonet", "R", 3000, ""),
    ("Montrachet", "Baron Thenard", "R", 700, ""),
    ("Meursault", "Coche-Dury", "R", 1000, ""),
    ("Meursault Genevrières", "Coche-Dury", "R", 3000, ""),
    ("Clos des Lambrays", "Lambrays", "R", 450, ""),
    ("Chapelle-Chambertin", "Trapet(Jean Louis Trapet)", "R", 350, ""),
    ("Saumur Champigny Les Poyeux", "Clos Rougeard", {2009}, 500, ""),
    ("Châteauneuf-du-Pape Blanc Réservé*", "Chateau Rayas", {1998}, 800, ""),
    ("Jacques Sélosse Substance*", "Avize", None, 700, ""),
    ("Louis Roederer Cristal Rosé Vinothèque*", "Reims", {2004}, 1800, ""),
    ("Salon*", "Le Mesnil-sur-Oger", {2012}, 1300, ""),
    ("Château Ducru Beaucaillou*", "St-Julien", {2017}, 140, ""),
]
# 円で直接入れる品目（国内買取の実績が取れたもの）
YEN = [("山崎 25y*", "山崎蒸溜所", None, 850000, "国内買取査定 82〜89万円（2026年2〜6月、uridoki.net）")]
nm = lambda t: " ".join(str(t).split())
def _hit(x, key, prod, vts):
    n = nm(x["name"])
    ok = n.startswith(key[:-1]) if key.endswith("*") else n == key
    if not ok or x["reg"] != prod: return False
    vt = x["vt"] if isinstance(x["vt"], int) else None
    if vts is None: return True
    if vts == "R": return vt is not None and vt >= 2010
    return vt in vts
for x in items:
    x["usd"] = x["yen"] = None; x["src"] = ""
    for key, prod, vts, usd, memo in PRICES:
        if _hit(x, key, prod, vts):
            x["usd"] = usd
            x["src"] = "海外市場の平均小売価格（当社推計）×為替×掛率" + ("。" + memo if memo else "")
            break
    for key, prod, vts, yen, memo in YEN:
        if _hit(x, key, prod, vts):
            x["yen"] = yen; x["src"] = memo

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
        "仕入単価", "原価合計", "リスト価格（税抜）", "リスト合計", "時価単価（入力）", "評価額", "含み益", "評価根拠・出典", "海外市場参考価格（USD）"]
ls["A1"] = "カンテサンス ワイン在庫 時価評価明細（2026年10月末棚卸し）"; ls["A1"].font = T
ls["A2"] = "原価の大きい順。時価単価＝海外市場参考価格（S列・USD）×為替×掛率（『前提』シート）。上書き入力も可。時価のない行は原価で評価（保守的）。"; ls["A2"].font = NOTE
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
    if x["usd"]:
        c.value = f"=ROUND(S{r}*'前提'!$B$4*'前提'!$B$5,-3)"; c.font = N
        u = ls.cell(row=r, column=19, value=x["usd"]); u.font = BLUE; u.number_format = '"$"#,##0'
    elif x["yen"]:
        c.value = x["yen"]
    ls.cell(row=r, column=18, value=x["src"] or None)
    ls.cell(row=r, column=16, value=f"=J{r}*IF(O{r}=\"\",K{r},O{r})")
    ls.cell(row=r, column=17, value=f"=P{r}-L{r}")
    ls.cell(row=r, column=18).font = BLUE
    for j in (11, 12, 13, 14, 15, 16, 17):
        ls.cell(row=r, column=j).number_format = YEN
LAST = HR + len(items)
widths = [5, 6, 9, 7, 46, 16, 14, 14, 11, 6, 11, 12, 12, 13, 13, 13, 12, 44, 12]
for j, w in enumerate(widths, 1):
    ls.column_dimensions[ls.cell(row=HR, column=j).column_letter].width = w
ls.freeze_panes = f"F{HR+1}"
ls.auto_filter.ref = f"A{HR}:S{LAST}"
ls.conditional_formatting.add(f"A{HR+1}:R{LAST}", FormulaRule(formula=[f'$B{HR+1}="★"'], fill=TF))
for rr in range(HR+1, LAST+1): ls.cell(row=rr, column=18).font = NOTE

# ---------- 前提 ----------
pr = wb.create_sheet("前提", 1)
pr["A1"] = "時価の前提"; pr["A1"].font = T
pr["A3"] = "項目"; pr["B3"] = "値"; pr["C3"] = "説明"
for c in ("A3","B3","C3"): pr[c].font = H; pr[c].fill = HF
pr["A4"] = "為替（円／USD）"; pr["B4"] = 150; pr["B4"].number_format = '#,##0'
pr["C4"] = "海外市場の参考価格（USD）を円に換算するレート。"
pr["A5"] = "掛率（市場小売価格 → 売却手取り）"; pr["B5"] = 0.6; pr["B5"].number_format = '0%'
pr["C5"] = "小売価格から、国内の業者買取・オークション手取りの水準へ引き直す率。国内の落札・買取実績（R列）と整合する水準として60%を置く。"
for c in ("B4","B5"): pr[c].font = BLUE; pr[c].fill = YF
for c in ("A4","A5"): pr[c].font = N
for c in ("C4","C5"): pr[c].font = NOTE; pr[c].alignment = Alignment(wrap_text=True, vertical="top")
pr["A7"] = "海外市場参考価格（USD）は、主要な海外ワイン市場での平均的な小売価格（税抜）を銘柄ごとに当社が推計したもの。ヴィンテージ差は反映していない（2005年ロマネ・コンティ等の一部を除く）。銀行提出前に当社で再確認する。"
pr["A7"].font = NOTE; pr["A7"].alignment = Alignment(wrap_text=True, vertical="top"); pr.merge_cells("A7:C7"); pr.row_dimensions[7].height = 48
pr.row_dimensions[5].height = 48
pr.column_dimensions["A"].width = 34; pr.column_dimensions["B"].width = 10; pr.column_dimensions["C"].width = 70

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
    "【時価の付け方】主要銘柄は、海外市場の参考価格（USD）×為替×掛率（『前提』シート）で計算。山崎25年は国内買取査定。各行の根拠はR列。個別に分かる時価があれば黄色セルを上書きする。",
    "【評価の考え方】時価のない行は原価で評価する。時価は売却手取りの水準（小売価格の60%）で置いているため、原価を下回る銘柄もある。評価額は保守的な水準。",
    "【注意】リスト価格はレストランでの提供価格（サービス込み）であり、時価ではない。銀行・投資家向けには、時価の根拠を明示した数字のみを使う。",
]
for i, t in enumerate(notes):
    c = sm.cell(row=nr + i, column=1, value=t); c.font = NOTE; c.alignment = Alignment(wrap_text=True, vertical="top")
    sm.merge_cells(start_row=nr + i, start_column=1, end_row=nr + i, end_column=6); sm.row_dimensions[nr + i].height = 36
sm.column_dimensions["A"].width = 38
for col in "BCDEF": sm.column_dimensions[col].width = 16

wb.save(OUT); print("saved", len(items), "items")
