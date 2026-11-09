# カンテサンス CF計画（2027〜2031年）みずほ 15億円・5年・4% ＋ 投資家15億円（年5%＋純資産増加分を売却時精算）
# 使い方: python3 build_cf_spc_2027_2031.py <出力.xlsx>
import sys
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment

OUT = sys.argv[1]
wb = Workbook()
F = "Arial"
BLUE = Font(name=F, size=10, color="0000FF"); BLK = Font(name=F, size=10); GRN = Font(name=F, size=10, color="008000")
B = Font(name=F, size=10, bold=True); H = Font(name=F, size=10, bold=True, color="FFFFFF"); T = Font(name=F, size=14, bold=True)
NOTE = Font(name=F, size=9, color="6E6368"); RED = Font(name=F, size=10, bold=True, color="C00000")
HF = PatternFill("solid", fgColor="6D2E46"); YF = PatternFill("solid", fgColor="FFF2CC"); TF = PatternFill("solid", fgColor="F7F3F4")
NUM = '#,##0;(#,##0);"-"'; PCT = '0.0%;(0.0%);"-"'; X = '0.00"x";(0.00"x");"-"'
YRS = ["2027", "2028", "2029", "2030", "2031"]; YC = ["C", "D", "E", "F", "G"]

def header(ws, r, labels):
    for i, h in enumerate(labels):
        c = ws.cell(row=r, column=i + 1, value=h); c.font = H; c.fill = HF; c.alignment = Alignment(horizontal="center")

# ================= 前提 =================
a = wb.active; a.title = "前提"
a["A1"] = "カンテサンス CF計画（2027〜2031年）共通の前提"; a["A1"].font = T
a["A2"] = "単位：百万円。青字＝入力値（変更可）、黒字＝計算式。シナリオごとの条件は各CFシートの上部で設定します。"; a["A2"].font = NOTE
header(a, 4, ["項目", "値／2026"] + YRS + ["出所・根拠"])
def lab(r, t, bold=False): a.cell(row=r, column=1, value=t).font = B if bold else BLK
def src(r, t): a.cell(row=r, column=8, value=t).font = NOTE
def inp(cell, v, fmt=NUM, key=False):
    c = a[cell]; c.value = v; c.number_format = fmt
    c.font = BLK if isinstance(v, str) and v.startswith("=") else BLUE
    if key: c.fill = YF

lab(5, "■ 営業利益（岸田シェフの現行の役員報酬を控除後）", True)
lab(6, "IM計画の営業利益（2030年以降は年平均成長率で延長）")
inp("B6", 528); [inp(f"{c}6", v) for c, v in zip(YC[:3], [556, 576, 598])]
inp("F6", "=E6*(1+$B$7)"); inp("G6", "=F6*(1+$B$7)")
src(6, "IM（2026年9月）42ページ。2026年は計画528（9月までの実績からの着地予想は約520）")
lab(7, "IM計画の営業利益の年平均成長率（2026→2029）"); inp("B7", "=(E6/B6)^(1/3)-1", PCT); src(7, "2030・2031年の延長に使用")
lab(8, "業績横ばいケースの営業利益（毎年）"); inp("B8", 520, key=True); src(8, "2026年12月期の着地予想（9月までの実績＋前期の10〜12月に今期の伸びを反映）")

lab(10, "■ 取得後の費用", True)
lab(11, "後継料理長の追加人件費")
[inp(f"{c}11", v) for c, v in zip(YC, [0, 15, 15, 15, 15])]
src(11, "仮定：2028年から年15百万円。岸田シェフの報酬は基本合意書どおり3年間現状維持（IMの営業利益に含まれる）。4年目以降の削減効果は保守的に見込まない")
lab(12, "投資家特典の費用（年）"); inp("B12", 5, key=True); src(12, "投資家特典案（ご招待ディナー年44名×約8万円ほか）。5名・15億円の想定")
lab(13, "SPCの出資総額（AM報酬の算定基礎）"); inp("B13", 3000); src(13, "吉村様向けスキーム図：WineBank 15億円＋投資家15億円")
lab(14, "設備投資（年）"); inp("B14", 30); src(14, "仮定（移転・大規模改装は含まない）")
lab(15, "実効税率"); inp("B15", 0.344, PCT); src(15, "2025年実績")

lab(17, "■ 借入・投資家・追加対価", True)
lab(18, "みずほ銀行の借入額"); inp("B18", 1500, key=True); src(18, "ご指定：15億円")
lab(19, "金利"); inp("B19", 0.04, PCT, key=True); src(19, "ご指定：4%")
lab(20, "投資家の出資額"); inp("B20", 1500); src(20, "1億・3億・5億円の区分で5名、合計15億円（2027年3月の残金15億円の支払いに充当）")
lab(21, "投資家への年間支払い（コンサルティング費用）"); inp("B21", 0.05, PCT, key=True); src(21, "ご指定：出資額の年5%")
lab(22, "投資家の持分（純資産増加分の精算に使用）"); inp("B22", 0.49, PCT); src(22, "スキーム図：投資家49%・WineBank51%")
lab(23, "追加対価（最終契約の3年後）"); inp("B23", 500); src(23, "基本合意書 第2条第4項：2029年12月中旬までに5億円・無条件。株式の対価のため損金にならない")

lab(25, "■ 決済時（2026年12月末）の現金", True)
lab(26, "決済時に使える会社の資金（留保・税金を除く）"); inp("B26", 2070); src(26, "12月末の現預金見込み17.4億円−運転資金1.0−法人税1.1＋役員貸付金の返済5.0＋子会社0.4")
lab(27, "うち決済代金に使う額"); inp("B27", 2000, key=True); src(27, "12月の35億円＝みずほ15億円＋会社の資金20億円")
lab(28, "運転資金として残す現金"); inp("B28", 100)
lab(29, "2026年12月期の法人税（2027年に納付）"); inp("B29", 110)
lab(30, "2027年期首の現金"); inp("B30", "=B26-B27+B28+B29"); src(30, "計算：使わずに残る資金＋運転資金＋納税用の現金")
a.column_dimensions["A"].width = 46; a.column_dimensions["B"].width = 12; a.column_dimensions["H"].width = 70
for c in YC: a.column_dimensions[c].width = 10
a.freeze_panes = "B5"

# ================= CFシート =================
P = "前提!"
def build(name, title, opcase, years, am_rate, inv_cash, am_cash, earn_co):
    s = wb.create_sheet(name)
    s["A1"] = f"カンテサンス CF計画（2027〜2031年）｜{title}"; s["A1"].font = T
    s["A2"] = "単位：百万円。黄色の青字はこのシナリオの条件（変更可）。合併後の会社が借入を返済し、投資家への支払いを負担する前提。"; s["A2"].font = NOTE
    conf = [(3, "営業利益の前提（1＝IM計画、2＝業績横ばい）", opcase, '0'),
            (4, "借入の返済年数（元金均等）", years, '0'),
            (5, "AM管理報酬（SPC出資総額に対する年率）", am_rate, PCT),
            (6, "AM報酬の支払い（1＝毎年、0＝売却時に精算）", am_cash, '0'),
            (7, "投資家への年5%の支払い（1＝毎年、0＝売却時に精算）", inv_cash, '0'),
            (8, "追加対価5億円の資金（1＝会社の資金、0＝外部の資金）", earn_co, '0')]
    for r, t, v, fmt in conf:
        s.cell(row=r, column=1, value=t).font = BLK
        c = s.cell(row=r, column=2, value=v); c.font = BLUE; c.fill = YF; c.number_format = fmt
    header(s, 10, ["項目", "決済時"] + YRS + ["5年計"])

    def put(r, label, form, bform=None, fmt=NUM, bold=False, fill=False, total=False):
        s.cell(row=r, column=1, value=label).font = B if bold else BLK
        if bform is not None:
            c = s.cell(row=r, column=2, value=bform); c.number_format = fmt; c.font = B if bold else BLK
        for i, col in enumerate(YC):
            prev = "B" if i == 0 else YC[i - 1]
            c = s[f"{col}{r}"]; c.value = form(col, prev, i); c.number_format = fmt
            c.font = Font(name=F, size=10, bold=bold)
            if fill: c.fill = TF
        if total:
            c = s[f"H{r}"]; c.value = f"=SUM(C{r}:G{r})"; c.number_format = fmt; c.font = B
        if fill: s[f"A{r}"].fill = TF

    s["A11"] = "■ 損益"; s["A11"].font = B
    put(12, "営業利益（岸田シェフの現行報酬控除後）", lambda c, p, i: f"=IF($B$3=1,{P}{c}6,{P}$B$8)", bold=True, total=True)
    put(13, "− 後継料理長の追加人件費", lambda c, p, i: f"=-{P}{c}11", total=True)
    put(14, "− AM管理報酬（WineBank）", lambda c, p, i: f"=-{P}$B$13*$B$5", total=True)
    put(15, "− 投資家への年5%（コンサルティング費用）", lambda c, p, i: f"=-{P}$B$20*{P}$B$21", total=True)
    put(16, "− 投資家特典の費用", lambda c, p, i: f"=-{P}$B$12", total=True)
    put(17, "EBITDA（上記控除後）", lambda c, p, i: f"=SUM({c}12:{c}16)", bold=True, fill=True, total=True)
    put(18, "− 支払利息", lambda c, p, i: f"=-{c}42*{P}$B$19", total=True)
    put(19, "税引前利益", lambda c, p, i: f"={c}17+{c}18", total=True)
    put(20, "− 法人税等", lambda c, p, i: f"=-MAX(0,{c}19)*{P}$B$15", total=True)
    put(21, "当期純利益", lambda c, p, i: f"={c}19+{c}20", bold=True, fill=True, total=True)

    s["A23"] = "■ キャッシュフロー"; s["A23"].font = B
    put(24, "当期純利益", lambda c, p, i: f"={c}21", total=True)
    put(25, "＋ AM報酬の未払計上（売却時精算の場合）", lambda c, p, i: f"=IF($B$6=0,-{c}14,0)", total=True)
    put(26, "＋ 投資家5%の未払計上（売却時精算の場合）", lambda c, p, i: f"=IF($B$7=0,-{c}15,0)", total=True)
    put(27, "− 設備投資", lambda c, p, i: f"=-{P}$B$14", total=True)
    put(28, "− 2026年12月期の法人税の納付", lambda c, p, i: f"=-{P}$B$29" if i == 0 else "=0", total=True)
    put(29, "返済前のCF", lambda c, p, i: f"=SUM({c}24:{c}28)", bold=True, total=True)
    put(30, "− 借入元本の返済", lambda c, p, i: f"=-{c}43", total=True)
    put(31, "− 追加対価（会社の資金で払う場合）", lambda c, p, i: f"=IF($B$8=1,-{P}$B$23,0)" if i == 2 else "=0", total=True)
    put(32, "当期のCF", lambda c, p, i: f"={c}29+{c}30+{c}31", bold=True, fill=True, total=True)
    put(33, "期末の現金残高", lambda c, p, i: f"={p}33+{c}32", bform=f"={P}B30", bold=True)
    for col in YC:
        s[f"{col}33"].font = RED  # 色は条件付きにせず赤太字で目立たせる
    put(34, "（参考）2027年3月：投資家の出資15億円 → 残金15億円の支払い", lambda c, p, i: "=0" if i else "=0")
    s["H34"] = "入出金が同額のため影響なし"; s["H34"].font = NOTE

    s["A36"] = "■ 返済余力"; s["A36"].font = B
    put(37, "返済原資（EBITDA−法人税−設備投資＋未払計上）", lambda c, p, i: f"={c}17+{c}20+{c}25+{c}26-{P}$B$14", total=True)
    put(38, "元利返済額", lambda c, p, i: f"=-{c}18+{c}43", total=True)
    put(39, "DSCR（返済余力）", lambda c, p, i: f"=IF({c}38=0,0,{c}37/{c}38)", fmt=X, bold=True, fill=True)
    s["A40"] = "DSCR＝返済原資÷元利返済額。1.0倍未満の年は返済が手元資金の取り崩しになる。銀行の目安は1.2倍以上。"; s["A40"].font = NOTE

    s["A41"] = "■ 借入（元金均等）"; s["A41"].font = B
    put(42, "期首残高", lambda c, p, i: f"={P}$B$18" if i == 0 else f"={p}44")
    put(43, "元本返済", lambda c, p, i: f"=MIN({c}42,{P}$B$18/$B$4)", total=True)
    put(44, "期末残高", lambda c, p, i: f"={c}42-{c}43", bold=True)

    s["A46"] = "■ 投資家のリターン（5名・15億円の合計）"; s["A46"].font = B
    put(47, "未払の累計（AM報酬・投資家5%を売却時精算とした場合）", lambda c, p, i: (f"={c}25+{c}26" if i == 0 else f"={p}47+{c}25+{c}26"))
    put(48, "純資産の増加（当期純利益の累計）", lambda c, p, i: (f"={c}21" if i == 0 else f"={p}48+{c}21"))
    put(49, "投資家の受取り（毎年の5%）", lambda c, p, i: f"=IF($B$7=1,-{c}15,0)", bform=f"=-{P}B20", total=True)
    s["A49"].value = "投資家のCF（出資・毎年の5%）"
    put(50, "投資家の受取り（売却時精算＝5年目末）", lambda c, p, i: (f"={P}$B$20+{P}$B$22*{c}48+IF($B$7=0,-SUM($C$15:$G$15),0)" if i == 4 else "=0"), total=True)
    put(51, "投資家のCF 合計", lambda c, p, i: f"={c}49+{c}50", bform="=B49", bold=True)
    s["A52"] = "投資家のIRR（5年）"; s["A52"].font = B
    c = s["B52"]; c.value = "=IRR(B51:G51)"; c.number_format = PCT; c.font = B; c.fill = TF
    s["A53"] = "売却時の精算額は、出資額＋純資産増加分×49%（＋未払の5%）。売却価格の上乗せ（のれん）は含めない。精算資金は売却代金から出る前提で、会社のCFには含めていない。"; s["A53"].font = NOTE

    s.column_dimensions["A"].width = 52; s.column_dimensions["B"].width = 11
    for col in YC + ["H"]: s.column_dimensions[col].width = 10
    s.freeze_panes = "B11"
    return s

SC = [("①提示条件_IM計画", "ご提示の条件・IM計画", 1, 5, 0.02, 1, 1, 1),
      ("②提示条件_横ばい", "ご提示の条件・業績横ばい", 2, 5, 0.02, 1, 1, 1),
      ("③5年_追加対価外部", "5年返済のまま・追加対価は外部資金・AM報酬は売却時精算", 1, 5, 0.02, 1, 0, 0),
      ("④7年_追加対価外部", "7年返済・追加対価は外部資金（AM・5%は毎年）", 1, 7, 0.02, 1, 1, 0),
      ("⑤7年_横ばい", "7年返済・追加対価は外部資金・業績横ばい", 2, 7, 0.02, 1, 1, 0)]
for args in SC: build(*args)

# ================= サマリー =================
m = wb.create_sheet("サマリー", 0)
m["A1"] = "カンテサンス CF計画 サマリー（みずほ15億円・4% ＋ 投資家15億円）"; m["A1"].font = T
m["A2"] = "単位：百万円。数値はすべて各シナリオのシートからの参照です。"; m["A2"].font = NOTE
header(m, 4, ["シナリオ", "返済年数", "最低の現金残高", "その年", "5年後の現金", "最低DSCR", "投資家IRR", "判定"])
for i, (sh, title, *_r) in enumerate(SC):
    r = 5 + i; q = f"'{sh}'!"
    m.cell(row=r, column=1, value=title).font = BLK
    m.cell(row=r, column=2, value=f"={q}B4").font = GRN
    c = m.cell(row=r, column=3, value=f"=MIN({q}C33:G33)"); c.number_format = NUM; c.font = B
    c = m.cell(row=r, column=4, value=f"=INDEX({q}C10:G10,MATCH(C{r},{q}C33:G33,0))"); c.font = BLK
    c = m.cell(row=r, column=5, value=f"={q}G33"); c.number_format = NUM; c.font = BLK
    c = m.cell(row=r, column=6, value=f"=MIN({q}C39:G39)"); c.number_format = X; c.font = BLK
    c = m.cell(row=r, column=7, value=f"={q}B52"); c.number_format = PCT; c.font = BLK
    c = m.cell(row=r, column=8, value=f"=IF(C{r}<0,\"資金不足\",IF(F{r}<1.2,\"綱渡り（DSCR不足）\",\"回る\"))"); c.font = B
m.column_dimensions["A"].width = 58
for col in "BCDEFGH": m.column_dimensions[col].width = 13
m.column_dimensions["H"].width = 20
notes = [
    "【前提】営業利益はIM計画（岸田シェフの役員報酬を3年間現状維持した後の数字）。業績横ばいケースは2026年の着地予想約5.2億円が続く場合。",
    "【会社が負担する費用】AM管理報酬（SPC出資30億円×2%＝年0.6億円）、投資家への年5%（年0.75億円）、投資家特典（年0.05億円）、後継料理長の人件費。",
    "【追加対価】基本合意書で2029年12月中旬までに5億円を無条件で支払う。会社の資金で払うと、その年に5億円の現金が出ていく。",
    "【税務】投資家への年5%は、実質が配当とみなされると損金にならない（毎年約0.26億円の税負担増）。役務提供の実態が必要。追加対価は株式の対価のため損金にならない。",
    "【簡略化】運転資本の増減、移転・大規模改装、役員退職金、12月の賞与は含めない。岸田シェフの4年目以降の報酬削減効果も見込まない（上振れ要因）。",
]
for i, t in enumerate(notes):
    c = m.cell(row=12 + i, column=1, value=t); c.font = Font(name=F, size=9); c.alignment = Alignment(wrap_text=True, vertical="top")
    m.merge_cells(start_row=12 + i, start_column=1, end_row=12 + i, end_column=8); m.row_dimensions[12 + i].height = 30

wb.save(OUT); print("saved")
