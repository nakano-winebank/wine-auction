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
def build(name, title, opcase, years, am_base, am_cash_rate, am_exit_rate, inv_amt, inv_cash_rate, inv_exit_rate, earn_co):
    s = wb.create_sheet(name)
    s["A1"] = f"カンテサンス CF計画（2027〜2031年）｜{title}"; s["A1"].font = T
    s["A2"] = "単位：百万円。黄色の青字はこのシナリオの条件（変更可）。合併後の会社が借入を返済し、投資家・AMへの支払いを負担する前提。"; s["A2"].font = NOTE
    conf = [(3, "営業利益の前提（1＝IM計画、2＝業績横ばい）", opcase, '0'),
            (4, "借入の返済年数（元金均等）", years, '0'),
            (5, "AM報酬の算定基礎", am_base, NUM),
            (6, "AM報酬：毎年支払う率", am_cash_rate, PCT),
            (7, "AM報酬：売却時に精算する率", am_exit_rate, PCT),
            (8, "投資家の出資額（15億円超の部分は追加対価用に2029年まで留保）", inv_amt, NUM),
            (9, "投資家への支払い：毎年（コンサルティング費用）の率", inv_cash_rate, PCT),
            (10, "投資家への支払い：売却時に精算する率", inv_exit_rate, PCT),
            (11, "追加対価5億円を会社の現金で払う（1＝はい、0＝会社外で手当て）", earn_co, '0')]
    for r, t, v, fmt in conf:
        s.cell(row=r, column=1, value=t).font = BLK
        c = s.cell(row=r, column=2, value=v); c.font = BLUE; c.fill = YF; c.number_format = fmt
    O = 3  # 以降の行のずらし
    header(s, 10 + O, ["項目", "決済時"] + YRS + ["5年計"])
    R = lambda n: n + O

    def put(r, label, form, bform=None, fmt=NUM, bold=False, fill=False, total=False):
        r = R(r)
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

    s[f"A{R(11)}"] = "■ 損益"; s[f"A{R(11)}"].font = B
    put(12, "営業利益（岸田シェフの現行報酬控除後）", lambda c, p, i: f"=IF($B$3=1,{P}{c}6,{P}$B$8)", bold=True, total=True)
    put(13, "− 後継料理長の追加人件費", lambda c, p, i: f"=-{P}{c}11", total=True)
    put(14, "− AM管理報酬（毎年支払う分）", lambda c, p, i: "=-$B$5*$B$6", total=True)
    put(15, "− 投資家へのコンサルティング費用（毎年）", lambda c, p, i: "=-$B$8*$B$9", total=True)
    put(16, "− 投資家特典の費用", lambda c, p, i: f"=-{P}$B$12", total=True)
    put(17, "EBITDA（上記控除後）", lambda c, p, i: f"=SUM({c}{R(12)}:{c}{R(16)})", bold=True, fill=True, total=True)
    put(18, "− 支払利息", lambda c, p, i: f"=-{c}{R(42)}*{P}$B$19", total=True)
    put(19, "税引前利益", lambda c, p, i: f"={c}{R(17)}+{c}{R(18)}", total=True)
    put(20, "− 法人税等", lambda c, p, i: f"=-MAX(0,{c}{R(19)})*{P}$B$15", total=True)
    put(21, "当期純利益", lambda c, p, i: f"={c}{R(19)}+{c}{R(20)}", bold=True, fill=True, total=True)

    s[f"A{R(23)}"] = "■ キャッシュフロー"; s[f"A{R(23)}"].font = B
    put(24, "当期純利益", lambda c, p, i: f"={c}{R(21)}", total=True)
    put(25, "＋ 投資家の追加出資（15億円超の部分）", lambda c, p, i: f"=MAX(0,$B$8-{P}$B$20)" if i == 0 else "=0", total=True)
    put(26, "（予備）", lambda c, p, i: "=0")
    s[f"A{R(26)}"].value = None
    put(27, "− 設備投資", lambda c, p, i: f"=-{P}$B$14", total=True)
    put(28, "− 2026年12月期の法人税の納付", lambda c, p, i: f"=-{P}$B$29" if i == 0 else "=0", total=True)
    put(29, "返済前のCF", lambda c, p, i: f"=SUM({c}{R(24)}:{c}{R(28)})", bold=True, total=True)
    put(30, "− 借入元本の返済", lambda c, p, i: f"=-{c}{R(43)}", total=True)
    put(31, "− 追加対価（会社の現金で払う場合）", lambda c, p, i: f"=IF($B$11=1,-{P}$B$23,0)" if i == 2 else "=0", total=True)
    put(32, "当期のCF", lambda c, p, i: f"={c}{R(29)}+{c}{R(30)}+{c}{R(31)}", bold=True, fill=True, total=True)
    put(33, "期末の現金残高", lambda c, p, i: f"={p}{R(33)}+{c}{R(32)}", bform=f"={P}B30", bold=True)
    for col in YC: s[f"{col}{R(33)}"].font = RED
    put(34, "（参考）2027年3月：投資家の出資15億円 → 残金15億円の支払い", lambda c, p, i: "=0")
    s[f"H{R(34)}"] = "入出金が同額のため影響なし"; s[f"H{R(34)}"].font = NOTE

    s[f"A{R(36)}"] = "■ 返済余力"; s[f"A{R(36)}"].font = B
    put(37, "返済原資（EBITDA−法人税−設備投資）", lambda c, p, i: f"={c}{R(17)}+{c}{R(20)}-{P}$B$14", total=True)
    put(38, "元利返済額", lambda c, p, i: f"=-{c}{R(18)}+{c}{R(43)}", total=True)
    put(39, "DSCR（返済余力）", lambda c, p, i: f"=IF({c}{R(38)}=0,0,{c}{R(37)}/{c}{R(38)})", fmt=X, bold=True, fill=True)
    s[f"A{R(40)}"] = "DSCR＝返済原資÷元利返済額。1.0倍未満の年は返済が手元資金の取り崩しになる。銀行の目安は1.2倍以上。"; s[f"A{R(40)}"].font = NOTE

    s[f"A{R(41)}"] = "■ 借入（元金均等）"; s[f"A{R(41)}"].font = B
    put(42, "期首残高", lambda c, p, i: f"={P}$B$18" if i == 0 else f"={p}{R(44)}")
    put(43, "元本返済", lambda c, p, i: f"=MIN({c}{R(42)},{P}$B$18/$B$4)", total=True)
    put(44, "期末残高", lambda c, p, i: f"={c}{R(42)}-{c}{R(43)}", bold=True)

    s[f"A{R(46)}"] = "■ 売却時に精算する分（会社のCFには含めない）"; s[f"A{R(46)}"].font = B
    put(47, "AM報酬の後払い分（累計）", lambda c, p, i: (f"=$B$5*$B$7" if i == 0 else f"={p}{R(47)}+$B$5*$B$7"))
    put(48, "純資産の増加（当期純利益の累計）", lambda c, p, i: (f"={c}{R(21)}" if i == 0 else f"={p}{R(48)}+{c}{R(21)}"))
    s[f"A{R(49)}"] = "■ 投資家のリターン（合計）"; s[f"A{R(49)}"].font = B
    put(50, "投資家のCF（出資・毎年のコンサルティング費用）", lambda c, p, i: f"=-{c}{R(15)}", bform="=-$B$8", total=True)
    put(51, "売却時の精算（5年目末）＝出資額＋純資産増加×49%＋後払い分", lambda c, p, i: (f"=$B$8+{P}$B$22*{c}{R(48)}+$B$8*$B$10*5" if i == 4 else "=0"), total=True)
    put(52, "投資家のCF 合計", lambda c, p, i: f"={c}{R(50)}+{c}{R(51)}", bform=f"=B{R(50)}", bold=True)
    s[f"A{R(53)}"] = "投資家のIRR（5年）"; s[f"A{R(53)}"].font = B
    c = s[f"B{R(53)}"]; c.value = f"=IRR(B{R(52)}:G{R(52)})"; c.number_format = PCT; c.font = B; c.fill = TF
    s[f"A{R(54)}"] = "売却時の精算は売却代金から行う前提（会社のCFには含めない）。純資産の増加は帳簿ベースで、売却時の上乗せ（のれん）は含めない。AM報酬の後払い分は、投資家への精算と同じく売却代金から支払う。"; s[f"A{R(54)}"].font = NOTE

    s.column_dimensions["A"].width = 56; s.column_dimensions["B"].width = 11
    for col in YC + ["H"]: s.column_dimensions[col].width = 10
    s.freeze_panes = f"B{R(11)}"
    s.sheet_properties.tabColor = None
    return s

# (名前, タイトル, 業績, 返済年数, AM基礎, AM毎年, AM後払い, 投資家出資, 投資家毎年, 投資家後払い, 追加対価を会社が払う)
SC = [("A決定案_IM計画", "決定案・IM計画（追加対価は会社外、AM 15億×1%＋後払い1%、投資家3%）", 1, 5, 1500, 0.01, 0.01, 1500, 0.03, 0, 0),
      ("B決定案_横ばい", "決定案・業績横ばい（年5.2億円）", 2, 5, 1500, 0.01, 0.01, 1500, 0.03, 0, 0),
      ("C投資家20億で手当て", "決定案・追加対価を投資家の出資20億円（5億円を2029年まで留保）で手当て・IM計画", 1, 5, 1500, 0.01, 0.01, 2000, 0.03, 0, 1),
      ("D投資家20億_横ばい", "Cと同じ・業績横ばい", 2, 5, 1500, 0.01, 0.01, 2000, 0.03, 0, 1),
      ("参考_当初条件", "参考：当初の条件（AM 30億×2%、投資家5%、追加対価を会社が負担）", 1, 5, 3000, 0.02, 0, 1500, 0.05, 0, 1)]
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
    c = m.cell(row=r, column=3, value=f"=MIN({q}C36:G36)"); c.number_format = NUM; c.font = B
    c = m.cell(row=r, column=4, value=f"=INDEX({q}C13:G13,MATCH(C{r},{q}C36:G36,0))"); c.font = BLK
    c = m.cell(row=r, column=5, value=f"={q}G36"); c.number_format = NUM; c.font = BLK
    c = m.cell(row=r, column=6, value=f"=MIN({q}C42:G42)"); c.number_format = X; c.font = BLK
    c = m.cell(row=r, column=7, value=f"={q}B56"); c.number_format = PCT; c.font = BLK
    c = m.cell(row=r, column=8, value=f"=IF(C{r}<0,\"資金不足\",IF(F{r}<1,\"現金は回るが返済余力不足\",IF(F{r}<1.2,\"回る（返済余力は薄い）\",\"回る\")))"); c.font = B
m.column_dimensions["A"].width = 58
for col in "BCDEFGH": m.column_dimensions[col].width = 13
m.column_dimensions["H"].width = 20
notes = [
    "【決定案の条件】みずほ15億円・5年元金均等・金利4%。AM報酬は15億円×2%のうち1%（年0.15億円）を毎年、1%を売却時に精算。投資家（5名・15億円）には年3%（年0.45億円）のコンサルティング費用＋売却時に純資産増加分×49%を精算。追加対価5億円は会社の現金では払わない（A・B）、または投資家の出資を20億円にして5億円を2029年まで留保（C・D）。",
    "【営業利益】IM計画（岸田シェフの役員報酬を3年間現状維持した後の数字）。業績横ばいは2026年の着地予想約5.2億円が続く場合。",
    "【税務】投資家へのコンサルティング費用は、実質が配当とみなされると損金にならない（年3%なら毎年約0.15億円の税負担増）。役務提供の実態が必要。追加対価は株式の対価のため損金にならない。AM報酬の後払い分は損金に算入しない保守的な前提。",
    "【簡略化】運転資本の増減、移転・大規模改装、役員退職金、12月の賞与は含めない。岸田シェフの4年目以降の報酬削減効果も見込まない（上振れ要因）。",
]
for i, t in enumerate(notes):
    c = m.cell(row=12 + i, column=1, value=t); c.font = Font(name=F, size=9); c.alignment = Alignment(wrap_text=True, vertical="top")
    m.merge_cells(start_row=12 + i, start_column=1, end_row=12 + i, end_column=8); m.row_dimensions[12 + i].height = 30

wb.save(OUT); print("saved")
