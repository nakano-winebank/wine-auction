# カンテサンス CF計画（2027〜2031年）みずほ15億円＋追加対価の追加借入5億円・投資家15億円。既存計画のみ／新規事業込み×業績4ケース
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
lab(21, "投資家への年間支払い（コンサルティング費用）"); inp("B21", 0.03, PCT, key=True); src(21, "ご指定：出資額の年3%（各シナリオのB11で設定）")
lab(22, "投資家の持分（純資産増加分の精算に使用）"); inp("B22", 0.49, PCT); src(22, "スキーム図：投資家49%・WineBank51%")
lab(23, "追加対価（最終契約の3年後）"); inp("B23", 500); src(23, "基本合意書 第2条第4項：2029年12月中旬までに5億円・無条件。株式の対価のため損金にならない")

lab(24, "■ 宇佐美氏（経営担当）", True)
lab(31, "宇佐美氏の役員報酬（基準額・年）"); inp("B31", 6, key=True); src(31, "ご指定：年600万円。営業利益の計画比に連動させる")
lab(32, "　連動の下限（計画比）"); inp("B32", 0.5, PCT); src(32, "計画比50%を下回っても基準額の50%は支給")
lab(33, "　連動の上限（計画比）"); inp("B33", 1.5, PCT); src(33, "計画比150%を上限")
lab(34, "成果報酬（投資家持分のキャピタルゲインに対する割合）"); inp("B34", 0.30, PCT, key=True); src(34, "吉村様向けスキームと同じ30%。投資家15億円の持分の純資産増加にのみ課す（WineBankの持分には課さない）。売却代金から精算し、会社のCFには影響しない")
lab(37, "　うち宇佐美氏の取り分"); inp("B37", 0.15, PCT, key=True); src(37, "ご指定：30%のうち15%。残り15%はWineBank（AM）")
lab(35, "■ 出資額による条件の差（アンカー投資家）", True)
lab(36, "5億円の区分の成果報酬率"); inp("B36", 0.30, PCT, key=True); src(36, "アンカー（5億円・最大2名）も成果報酬は30%で同じ。代わりに運営収益の分配・5年後の買取・WineBankの新株予約権を付ける")
lab(38, "アンカー投資家1名あたりの運営収益の分配率"); inp("B38", 0.10, PCT, key=True); src(38, "案：WineBankのAM報酬（毎年分＋後払い分）と成果報酬（WineBank分15%）の合計の10%を1名あたりに分配（2名で20%）")
lab(25, "■ 決済時（2026年12月末）の現金", True)
lab(26, "決済時に使える会社の資金（留保・税金を除く）"); inp("B26", 2070); src(26, "12月末の現預金見込み17.4億円−運転資金1.0−法人税1.1＋役員貸付金の返済5.0＋子会社0.4")
lab(27, "うち決済代金に使う額"); inp("B27", 2000, key=True); src(27, "12月の35億円＝みずほ15億円＋会社の資金20億円")
lab(28, "運転資金として残す現金"); inp("B28", 100)
lab(29, "2026年12月期の法人税（2027年に納付）"); inp("B29", 110)
lab(30, "2027年期首の現金"); inp("B30", "=B26-B27+B28+B29"); src(30, "計算：使わずに残る資金＋運転資金＋納税用の現金")
a.column_dimensions["A"].width = 46; a.column_dimensions["B"].width = 12; a.column_dimensions["H"].width = 70
for c in YC: a.column_dimensions[c].width = 10
a.freeze_panes = "B5"

# ---- 追加対価の追加借入（前提シート） ----
lab(39, "■ 追加対価5億円の追加借入（みずほ銀行）", True)
lab(40, "追加借入額"); inp("B40", "=B23"); src(40, "追加対価5億円を会社が支払い、同額をみずほ銀行から追加で借り入れる（中野さんご指示）")
lab(41, "実行年"); inp("B41", 2029, '0'); src(41, "追加対価の支払い（2029年12月中旬まで）に合わせる。実行年は利息なし（12月実行のため）")
lab(42, "元本の返済開始年"); inp("B42", 2032, '0', key=True); src(42, "仮定：当初の借入（2031年に完済）の後に返済開始。それまでは利息のみ。2030年開始にすると2030〜31年の現金がマイナスになる")
lab(43, "返済年数（元金均等）"); inp("B43", 5, '0'); src(43, "仮定")
lab(44, "金利"); inp("B44", "=B19", PCT); src(44, "当初の借入と同じ4%")
lab(46, "■ 第三者に売却する場合のシミュレーション（IRR算出用）", True)
lab(47, "取得時の事業価値（追加対価込み）"); inp("B47", 3260); src(47, "譲渡総額55億円（基礎50億＋追加対価5億）−ネットキャッシュ22.4億円")
lab(48, "2026年のEBITDA（会社計画）"); inp("B48", 529); src(48, "IM：2026年12月期の計画EBITDA 5.29億円")
lab(49, "取得時の倍率（EBITDA倍率）"); inp("B49", "=B47/B48", X); src(49, "第三者への売却価格は、売却時のEBITDA×取得時の倍率と仮定。WineBankが買い取る場合は純資産ベース（各シートの買取額）")

# ================= 新規事業シート =================
import datetime as dt
from openpyxl.utils import get_column_letter as L
n = wb.create_sheet("新規事業")
n["A1"] = "新規事業の収支（2027〜2031年・月次）"; n["A1"].font = T
n["A2"] = "単位：百万円。青字＝入力値（変更可）。既存のカンテサンス本店の計画には含めていない増加分のみを計上。"; n["A2"].font = NOTE
def ni(r, label, v, fmt=NUM, note=""):
    n.cell(row=r, column=1, value=label).font = BLK
    c = n.cell(row=r, column=2, value=v); c.number_format = fmt
    c.font = BLK if isinstance(v, str) and v.startswith("=") else BLUE; c.fill = YF
    if note: n.cell(row=r, column=3, value=note).font = NOTE
n["A4"] = "■ ① ガトー・オ・コンテの拡大（投資なし）"; n["A4"].font = B
ni(5, "2026年のガトー売上（月平均）", "=48.416/9", '#,##0.00', "第16期試算表 1〜9月のガトー売上48.4百万円÷9か月")
ni(6, "第1段階の開始月", dt.datetime(2027, 11, 1), 'yyyy/mm', "ご指定：2027年11月から既存売上を倍増")
ni(7, "第1段階の売上倍率（2026年比）", 2, '0.0"倍"')
ni(8, "第2段階の開始月", dt.datetime(2028, 11, 1), 'yyyy/mm', "ご指定：2028年11月から2026年比3倍")
ni(9, "第2段階の売上倍率（2026年比）", 3, '0.0"倍"')
ni(10, "増加分の営業利益率", 0.30, PCT, "仮定：外部での製造委託・配送費を見込み30%（スイーツ店と同水準）")
n["A12"] = "■ ② 一品スイーツ店（ドルチェ・タクボの高級版）"; n["A12"].font = B
ni(13, "1店舗の月商", 15, NUM, "ご指定：月1,500万円")
ni(14, "1店舗の月の営業利益", 4.5, '#,##0.0', "ご指定：月450万円")
ni(15, "1店舗の投資額", 50, NUM, "ご指定：5,000万円（開業月に支出）")
ni(16, "最初の出店月", dt.datetime(2028, 1, 1), 'yyyy/mm', "ご指定：2028年1月から毎年1月に出店")
ni(17, "年間の出店数", 1, '0', "ご指定：年1店舗")
n["A19"] = "■ ③ ワインショップ・バー（投資なし）"; n["A19"].font = B
ni(20, "月商", 7, NUM, "ご指定：月700万円")
ni(21, "月の営業利益", 0.5, '#,##0.0', "ご指定：月50万円")
ni(22, "開始月", dt.datetime(2030, 1, 1), 'yyyy/mm', "ご指定：2030年1月から")

MR = 25  # 月次の見出し行
months = [dt.datetime(2027 + i // 12, i % 12 + 1, 1) for i in range(60)]
n.cell(row=MR, column=1, value="月").font = B
n.cell(row=MR + 1, column=1, value="年").font = NOTE
n.cell(row=MR + 2, column=1, value="月（数字）").font = NOTE
for k, d in enumerate(months):
    col = L(3 + k)
    c = n[f"{col}{MR}"]; c.value = d; c.number_format = 'yyyy/mm'; c.font = H; c.fill = HF
    n[f"{col}{MR+1}"] = f"=YEAR({col}{MR})"; n[f"{col}{MR+2}"] = f"=MONTH({col}{MR})"
    n[f"{col}{MR+1}"].font = NOTE; n[f"{col}{MR+2}"].font = NOTE
    n.column_dimensions[col].width = 8.5
rows = [
    ("① ガトー：売上倍率（2026年比）", lambda c: f"=IF({c}{MR}>=$B$8,$B$9,IF({c}{MR}>=$B$6,$B$7,1))", '0.0'),
    ("① ガトー：増加売上", lambda c: f"=$B$5*({c}{MR+3}-1)", '#,##0.0'),
    ("① ガトー：増加営業利益", lambda c: f"={c}{MR+4}*$B$10", '#,##0.0'),
    ("② スイーツ店：店舗数", lambda c: f"=IF({c}{MR}<$B$16,0,(YEAR({c}{MR})-YEAR($B$16)+1)*$B$17)", '0'),
    ("② スイーツ店：売上", lambda c: f"={c}{MR+6}*$B$13", '#,##0.0'),
    ("② スイーツ店：営業利益", lambda c: f"={c}{MR+6}*$B$14", '#,##0.0'),
    ("② スイーツ店：投資", lambda c: f"=IF(AND({c}{MR}>=$B$16,MONTH({c}{MR})=MONTH($B$16)),$B$17*$B$15,0)", '#,##0.0'),
    ("③ ワインショップ・バー：売上", lambda c: f"=IF({c}{MR}>=$B$22,$B$20,0)", '#,##0.0'),
    ("③ ワインショップ・バー：営業利益", lambda c: f"=IF({c}{MR}>=$B$22,$B$21,0)", '#,##0.0'),
    ("新規事業 売上合計", lambda c: f"={c}{MR+4}+{c}{MR+7}+{c}{MR+10}", '#,##0.0'),
    ("新規事業 営業利益合計", lambda c: f"={c}{MR+5}+{c}{MR+8}+{c}{MR+11}", '#,##0.0'),
    ("新規事業 投資合計", lambda c: f"={c}{MR+9}", '#,##0.0'),
]
for j, (label, f, fmt) in enumerate(rows):
    r = MR + 3 + j
    n.cell(row=r, column=1, value=label).font = B if "合計" in label else BLK
    for k in range(60):
        col = L(3 + k); c = n[f"{col}{r}"]; c.value = f(col); c.number_format = fmt
        if "合計" in label: c.font = B; c.fill = TF
LASTC = L(3 + 59)
AR = MR + 17  # 年次まとめ
n.cell(row=AR, column=1, value="■ 年次まとめ").font = B
header(n, AR + 1, ["項目", ""] + YRS + ["5年計"])
ann = [("① ガトー：増加売上", MR + 4, "sum"), ("① ガトー：増加営業利益", MR + 5, "sum"),
       ("② スイーツ店：店舗数（年末）", MR + 6, "dec"), ("② スイーツ店：売上", MR + 7, "sum"),
       ("② スイーツ店：営業利益", MR + 8, "sum"), ("② スイーツ店：投資", MR + 9, "sum"),
       ("③ ワインショップ・バー：売上", MR + 10, "sum"), ("③ ワインショップ・バー：営業利益", MR + 11, "sum"),
       ("新規事業 売上合計", MR + 12, "sum"), ("新規事業 営業利益合計", MR + 13, "sum"), ("新規事業 投資合計", MR + 14, "sum")]
NB = {}
for j, (label, src_r, how) in enumerate(ann):
    r = AR + 2 + j
    n.cell(row=r, column=1, value=label).font = B if "合計" in label else BLK
    for yc, y in zip(YC, YRS):
        if how == "sum":
            v = f"=SUMIF($C${MR+1}:${LASTC}${MR+1},{y},$C${src_r}:${LASTC}${src_r})"
        else:
            v = f"=SUMIFS($C${src_r}:${LASTC}${src_r},$C${MR+1}:${LASTC}${MR+1},{y},$C${MR+2}:${LASTC}${MR+2},12)"
        c = n[f"{yc}{r}"]; c.value = v; c.number_format = '#,##0' if how == "dec" else NUM
        if "合計" in label: c.font = B; c.fill = TF
    if how == "sum":
        c = n[f"H{r}"]; c.value = f"=SUM(C{r}:G{r})"; c.number_format = NUM; c.font = B
    NB[label] = r
NB_OP = NB["新規事業 営業利益合計"]; NB_CAPEX = NB["新規事業 投資合計"]
n.cell(row=AR + 14, column=1, value="新規事業の営業利益は、店舗の減価償却・本部費を含めたご指定の数字として扱う。開業前の費用、既存事業との共食いは見込まない。スイーツ店の投資は開業月に全額を現金支出として計上（減価償却費の足し戻しはしない保守的な扱い）。").font = NOTE
n.column_dimensions["A"].width = 34; n.column_dimensions["B"].width = 11
n.freeze_panes = f"C{MR+1}"

# ================= CFシート =================
P = "前提!"; NBS = "新規事業!"
ROW = dict(hdr=14, t_pl=15, op_ex=16, op_nb=17, op=18, succ=19, am=20, inv=21, perk=22, usa=23, ebitda=24, int=25, pre=26, tax=27, ni=28,
           t_cf=30, ni2=31, capex=32, capex_nb=33, tax26=34, precf=35, rep1=36, rep2=37, earn=38, eloan=39, cf=40, cash=41,
           t_ds=43, dsrc=44, ds=45, dscr=46, ds_note=47,
           t_ln=49, l1o=50, l1p=51, l1e=52, l2o=53, l2x=54, l2p=55, l2e=56,
           t_ex=58, amd=59, nav=60, t_iv=61, ivcf=62, ivex=63, ivt=64, irr=65, ex_note=66, rb=68)
def build(name, title, opcase, mult, newbiz, years, am_base, am_cash_rate, am_exit_rate, inv_amt, inv_cash_rate):
    s = wb.create_sheet(name)
    s["A1"] = f"カンテサンス CF計画（2027〜2031年）｜{title}"; s["A1"].font = T
    s["A2"] = "単位：百万円。黄色の青字はこのシナリオの条件（変更可）。合併後の会社が借入を返済し、投資家・AMへの支払いを負担する前提。"; s["A2"].font = NOTE
    conf = [(3, "既存事業の営業利益の前提（1＝IM計画、2＝業績横ばい）", opcase, '0'),
            (4, "既存事業の営業利益の増減（計画比）", mult, PCT),
            (5, "新規事業を含める（1＝含める、0＝含めない）", newbiz, '0'),
            (6, "当初の借入の返済年数（元金均等）", years, '0'),
            (7, "AM報酬の算定基礎", am_base, NUM),
            (8, "AM報酬：毎年支払う率", am_cash_rate, PCT),
            (9, "AM報酬：売却時に精算する率", am_exit_rate, PCT),
            (10, "投資家の出資額", inv_amt, NUM),
            (11, "投資家への支払い：毎年（コンサルティング費用）の率", inv_cash_rate, PCT)]
    for r, t, v, fmt in conf:
        s.cell(row=r, column=1, value=t).font = BLK
        c = s.cell(row=r, column=2, value=v); c.font = BLUE; c.fill = YF; c.number_format = fmt
    header(s, ROW["hdr"], ["項目", "決済時"] + YRS + ["5年計"])
    def put(key, label, form, bform=None, fmt=NUM, bold=False, fill=False, total=False):
        r = ROW[key]
        s.cell(row=r, column=1, value=label).font = B if bold else BLK
        if bform is not None:
            c = s.cell(row=r, column=2, value=bform); c.number_format = fmt; c.font = B if bold else BLK
        for i, col in enumerate(YC):
            prev = "B" if i == 0 else YC[i - 1]
            c = s[f"{col}{r}"]; c.value = form(col, prev, i, YRS[i]); c.number_format = fmt
            c.font = Font(name=F, size=10, bold=bold)
            if fill: c.fill = TF
        if total:
            c = s[f"H{r}"]; c.value = f"=SUM(C{r}:G{r})"; c.number_format = fmt; c.font = B
        if fill: s[f"A{r}"].fill = TF
    def title(key, t): s[f"A{ROW[key]}"] = t; s[f"A{ROW[key]}"].font = B
    R = ROW
    title("t_pl", "■ 損益")
    put("op_ex", "既存事業（本店）の営業利益（岸田シェフの現行報酬控除後）", lambda c, p, i, y: f"=IF($B$3=1,{P}{c}6,{P}$B$8)*(1+$B$4)", total=True)
    put("op_nb", "＋ 新規事業の営業利益（ガトー拡大・スイーツ店・ワインショップ）", lambda c, p, i, y: f"=$B$5*{NBS}{c}{NB_OP}", total=True)
    put("op", "営業利益 合計", lambda c, p, i, y: f"={c}{R['op_ex']}+{c}{R['op_nb']}", bold=True, total=True)
    put("succ", "− 後継料理長の追加人件費", lambda c, p, i, y: f"=-{P}{c}11", total=True)
    put("am", "− AM管理報酬（毎年支払う分）", lambda c, p, i, y: "=-$B$7*$B$8", total=True)
    put("inv", "− 投資家へのコンサルティング費用（毎年）", lambda c, p, i, y: "=-$B$10*$B$11", total=True)
    put("perk", "− 投資家特典の費用", lambda c, p, i, y: f"=-{P}$B$12", total=True)
    put("usa", "− 宇佐美氏の役員報酬（既存事業の営業利益の計画比に連動）", lambda c, p, i, y: f"=-{P}$B$31*MIN({P}$B$33,MAX({P}$B$32,{c}{R['op_ex']}/{P}{c}6))", total=True)
    put("ebitda", "EBITDA（上記控除後）", lambda c, p, i, y: f"=SUM({c}{R['op']}:{c}{R['usa']})", bold=True, fill=True, total=True)
    put("int", "− 支払利息（当初の借入＋追加借入）", lambda c, p, i, y: f"=-({c}{R['l1o']}*{P}$B$19+{c}{R['l2o']}*{P}$B$44)", total=True)
    put("pre", "税引前利益", lambda c, p, i, y: f"={c}{R['ebitda']}+{c}{R['int']}", total=True)
    put("tax", "− 法人税等", lambda c, p, i, y: f"=-MAX(0,{c}{R['pre']})*{P}$B$15", total=True)
    put("ni", "当期純利益", lambda c, p, i, y: f"={c}{R['pre']}+{c}{R['tax']}", bold=True, fill=True, total=True)
    title("t_cf", "■ キャッシュフロー")
    put("ni2", "当期純利益", lambda c, p, i, y: f"={c}{R['ni']}", total=True)
    put("capex", "− 設備投資（既存店）", lambda c, p, i, y: f"=-{P}$B$14", total=True)
    put("capex_nb", "− 新規事業の投資（スイーツ店）", lambda c, p, i, y: f"=-$B$5*{NBS}{c}{NB_CAPEX}", total=True)
    put("tax26", "− 2026年12月期の法人税の納付", lambda c, p, i, y: f"=-{P}$B$29" if i == 0 else "=0", total=True)
    put("precf", "返済前のCF", lambda c, p, i, y: f"=SUM({c}{R['ni2']}:{c}{R['tax26']})", bold=True, total=True)
    put("rep1", "− 当初の借入の元本返済", lambda c, p, i, y: f"=-{c}{R['l1p']}", total=True)
    put("rep2", "− 追加借入の元本返済", lambda c, p, i, y: f"=-{c}{R['l2p']}", total=True)
    put("earn", "− 追加対価の支払い", lambda c, p, i, y: f"=IF({y}={P}$B$41,-{P}$B$23,0)", total=True)
    put("eloan", "＋ 追加対価のための追加借入", lambda c, p, i, y: f"={c}{R['l2x']}", total=True)
    put("cf", "当期のCF", lambda c, p, i, y: f"={c}{R['precf']}+{c}{R['rep1']}+{c}{R['rep2']}+{c}{R['earn']}+{c}{R['eloan']}", bold=True, fill=True, total=True)
    put("cash", "期末の現金残高", lambda c, p, i, y: f"={p}{R['cash']}+{c}{R['cf']}", bform=f"={P}B30", bold=True)
    for col in YC: s[f"{col}{R['cash']}"].font = RED
    title("t_ds", "■ 返済余力")
    put("dsrc", "返済原資（EBITDA−法人税−設備投資−新規事業の投資）", lambda c, p, i, y: f"={c}{R['ebitda']}+{c}{R['tax']}+{c}{R['capex']}+{c}{R['capex_nb']}", total=True)
    put("ds", "元利返済額（追加借入を含む）", lambda c, p, i, y: f"=-{c}{R['int']}+{c}{R['l1p']}+{c}{R['l2p']}", total=True)
    put("dscr", "DSCR（返済余力）", lambda c, p, i, y: f"=IF({c}{R['ds']}=0,0,{c}{R['dsrc']}/{c}{R['ds']})", fmt=X, bold=True, fill=True)
    s[f"A{R['ds_note']}"] = "DSCR＝返済原資÷元利返済額。1.0倍未満の年は返済が手元資金の取り崩しになる。銀行の目安は1.2倍以上。"; s[f"A{R['ds_note']}"].font = NOTE
    title("t_ln", "■ 借入（当初：元金均等／追加：前提!B42の年から元金均等）")
    put("l1o", "当初の借入：期首残高", lambda c, p, i, y: f"={P}$B$18" if i == 0 else f"={p}{R['l1e']}")
    put("l1p", "当初の借入：元本返済", lambda c, p, i, y: f"=MIN({c}{R['l1o']},{P}$B$18/$B$6)", total=True)
    put("l1e", "当初の借入：期末残高", lambda c, p, i, y: f"={c}{R['l1o']}-{c}{R['l1p']}", bold=True)
    put("l2o", "追加借入：期首残高", lambda c, p, i, y: "=0" if i == 0 else f"={p}{R['l2e']}")
    put("l2x", "追加借入：実行", lambda c, p, i, y: f"=IF({y}={P}$B$41,{P}$B$40,0)", total=True)
    put("l2p", "追加借入：元本返済", lambda c, p, i, y: f"=IF({y}>={P}$B$42,MIN({c}{R['l2o']},{P}$B$40/{P}$B$43),0)", total=True)
    put("l2e", "追加借入：期末残高", lambda c, p, i, y: f"={c}{R['l2o']}+{c}{R['l2x']}-{c}{R['l2p']}", bold=True)
    title("t_ex", "■ 売却時に精算する分（会社のCFには含めない）")
    put("amd", "AM報酬の後払い分（累計）", lambda c, p, i, y: (f"=$B$7*$B$9" if i == 0 else f"={p}{R['amd']}+$B$7*$B$9"))
    put("nav", "純資産の増加（当期純利益の累計）", lambda c, p, i, y: (f"={c}{R['ni']}" if i == 0 else f"={p}{R['nav']}+{c}{R['ni']}"), bold=True)
    title("t_iv", "■ 投資家のリターン（合計）")
    put("ivcf", "投資家のCF（出資・毎年のコンサルティング費用）", lambda c, p, i, y: f"=-{c}{R['inv']}", bform="=-$B$10", total=True)
    put("ivex", "売却時の精算（5年目末）＝出資額＋純資産増加×49%×(1−成果報酬30%)", lambda c, p, i, y: (f"=$B$10+{P}$B$22*{c}{R['nav']}*(1-{P}$B$34)" if i == 4 else "=0"), total=True)
    put("ivt", "投資家のCF 合計", lambda c, p, i, y: f"={c}{R['ivcf']}+{c}{R['ivex']}", bform=f"=B{R['ivcf']}", bold=True)
    s[f"A{R['irr']}"] = "投資家のIRR（5年）"; s[f"A{R['irr']}"].font = B
    c = s[f"B{R['irr']}"]; c.value = f"=IRR(B{R['ivt']}:G{R['ivt']})"; c.number_format = PCT; c.font = B; c.fill = TF
    s[f"A{R['ex_note']}"] = "売却時の精算は売却代金から行う前提（会社のCFには含めない）。純資産の増加は帳簿ベースで、売却時の上乗せ（のれん）は含めない。"; s[f"A{R['ex_note']}"].font = NOTE
    rb = R["rb"]; G = f"G{R['nav']}"
    s[f"A{rb}"] = "■ WineBankが買い取る場合（純資産ベース）の出資額ごとのリターン（1名あたり）"; s[f"A{rb}"].font = B
    s[f"A{rb+1}"] = "成果報酬（5年目末・全員30%の場合）：うち宇佐美氏15%／うちWineBank15%"
    c = s[f"F{rb+1}"]; c.value = f"={P}$B$37*{P}$B$22*{G}"; c.number_format = NUM
    c = s[f"G{rb+1}"]; c.value = f"=({P}$B$34-{P}$B$37)*{P}$B$22*{G}"; c.number_format = NUM
    for r0, nm, amt in [(rb + 3, "3億円（標準）", 300), (rb + 9, "5億円（アンカー・最大2名）", 500)]:
        anchor = amt == 500
        s[f"A{r0}"] = f"【{nm}】"; s[f"A{r0}"].font = B
        s[f"A{r0+1}"] = "出資・毎年のコンサルティング費用" + ("＋運営収益の分配（AM毎年分）" if anchor else ""); s[f"B{r0+1}"] = -amt
        for col in YC: s[f"{col}{r0+1}"] = f"={amt}*$B$11" + (f"+{P}$B$38*$B$7*$B$8" if anchor else "")
        s[f"A{r0+2}"] = "売却時の精算（出資額＋純資産増加の持分" + ("＋運営収益の分配）" if anchor else "）")
        s[f"G{r0+2}"] = f"={amt}+{P}$B$22*({amt}/{P}$B$20)*{G}*(1-{P}$B$34)" + (f"+{P}$B$38*(G{rb+1}+$B$7*$B$9*5)" if anchor else "")
        s[f"A{r0+3}"] = "IRR（5年）"; s[f"A{r0+3}"].font = B
        s[f"A{r0+4}"] = "CF合計"
        for col in ["B"] + YC: s[f"{col}{r0+4}"] = f"={col}{r0+1}+{col}{r0+2}"
        c = s[f"B{r0+3}"]; c.value = f"=IFERROR(IRR(B{r0+4}:G{r0+4}),IRR(B{r0+4}:G{r0+4},-0.3))"; c.font = B; c.fill = TF
        s[f"A{r0+5}"] = "受取合計（出資額を除く支払いの合計）"; s[f"B{r0+5}"] = f"=SUM(C{r0+4}:G{r0+4})"; s[f"B{r0+5}"].font = B
        s[f"A{r0+6}"] = "5年後の買取額（出資額＋純資産増加の持分×70%）"; s[f"B{r0+6}"] = f"={amt}+{P}$B$22*({amt}/{P}$B$20)*{G}*(1-{P}$B$34)"
        for rr in range(r0 + 1, r0 + 7):
            for col in ["B"] + YC: s[f"{col}{rr}"].number_format = NUM
        s[f"B{r0+3}"].number_format = PCT
    # ---- 第三者に売却する場合（取得時の倍率ベース） ----
    t = rb + 18; GC = "G"
    s[f"A{t}"] = "■ 第三者に売却する場合のシミュレーション（2031年末・取得時の倍率ベース、IRR算出用）"; s[f"A{t}"].font = B
    items = [(1, "売却時のEBITDA（2031年の営業利益−後継料理長−宇佐美氏の報酬）", f"=G{R['op']}+G{R['succ']}+G{R['usa']}", NUM),
             (2, "取得時の倍率（前提!B49）", f"={P}$B$49", X),
             (3, "事業価値（EBITDA×倍率）", f"=B{t+1}*B{t+2}", NUM),
             (4, "＋ 2031年末の現金", f"=G{R['cash']}", NUM),
             (5, "− 2031年末の借入残高（追加借入を含む）", f"=-(G{R['l1e']}+G{R['l2e']})", NUM),
             (6, "株式価値（売却価格）", f"=SUM(B{t+3}:B{t+5})", NUM),
             (7, "投資家の出資額", "=$B$10", NUM),
             (8, "投資家分（株式価値×持株比率49%）", f"=B{t+6}*{P}$B$22", NUM),
             (9, "投資家分の増加（投資家分−出資額）", f"=B{t+8}-B{t+7}", NUM),
             (10, "投資家全体の受取（投資家分−増加分×成果報酬30%）", f"=B{t+8}-MAX(0,B{t+9})*{P}$B$34", NUM),
             (11, "WineBank分の成果報酬（15%）", f"=MAX(0,B{t+9})*({P}$B$34-{P}$B$37)", NUM)]
    for k, label, f, fmt in items:
        s[f"A{t+k}"] = label; c = s[f"B{t+k}"]; c.value = f; c.number_format = fmt
        if k in (6, 8, 10): s[f"A{t+k}"].font = B; c.font = B
    for r0, nm, amt in [(t + 12, "3億円（標準）・第三者売却", 300), (t + 18, "5億円（アンカー）・第三者売却", 500)]:
        anchor = amt == 500
        s[f"A{r0}"] = f"【{nm}】"; s[f"A{r0}"].font = B
        s[f"A{r0+1}"] = "出資・毎年の支払い"; s[f"B{r0+1}"] = -amt
        for col in YC: s[f"{col}{r0+1}"] = f"={amt}*$B$11" + (f"+{P}$B$38*$B$7*$B$8" if anchor else "")
        s[f"A{r0+2}"] = "売却時の受取（投資家全体の受取×出資比率" + ("＋運営収益の分配）" if anchor else "）")
        s[f"G{r0+2}"] = f"=B{t+10}*{amt}/$B$10" + (f"+{P}$B$38*(B{t+11}+$B$7*$B$9*5)" if anchor else "")
        s[f"A{r0+3}"] = "IRR（5年）"; s[f"A{r0+3}"].font = B
        s[f"A{r0+4}"] = "CF合計"
        for col in ["B"] + YC: s[f"{col}{r0+4}"] = f"={col}{r0+1}+{col}{r0+2}"
        c = s[f"B{r0+3}"]; c.value = f"=IFERROR(IRR(B{r0+4}:G{r0+4}),IRR(B{r0+4}:G{r0+4},-0.3))"; c.font = B; c.fill = TF
        s[f"A{r0+5}"] = "受取合計（出資額を除く支払いの合計）"; s[f"B{r0+5}"] = f"=SUM(C{r0+4}:G{r0+4})"; s[f"B{r0+5}"].font = B
        for rr in range(r0 + 1, r0 + 6):
            for col in ["B"] + YC: s[f"{col}{rr}"].number_format = NUM
        s[f"B{r0+3}"].number_format = PCT
    s[f"A{t+24}"] = "第三者への売却価格は仮定（売却時のEBITDA×取得時の倍率）。実際の売却価格で精算する。売却代金は銀行の残債を返済した後、持株比率どおり（投資家49%・WineBank51%）に分配（プロラタ。元本の優先返還なし）。投資家分が出資額を上回る部分にのみ成果報酬30%。"; s[f"A{t+24}"].font = NOTE
    s[f"A{rb+16}"] = "アンカー（5億円）は、WineBankの運営収益（AM報酬＋WineBank分の成果報酬）の前提!B38を上乗せ。5年後の買取の約束・WineBankの新株予約権の価値は含めない。"; s[f"A{rb+16}"].font = NOTE
    s.column_dimensions["A"].width = 58; s.column_dimensions["B"].width = 11
    for col in YC + ["H"]: s.column_dimensions[col].width = 10
    s.freeze_panes = f"B{ROW['t_pl']}"
    return s

# (シート名, タイトル, 既存の前提, 増減, 新規事業, 返済年数, AM基礎, AM毎年, AM後払い, 投資家出資, 投資家毎年)
COMMON = (5, 1500, 0.01, 0.01, 1500, 0.03)
SC = [("1既存_IM計画", "既存計画のみ・IM計画", 1, 0, 0),
      ("2新規込み_IM計画", "既存＋新規事業・IM計画", 1, 0, 1),
      ("3既存_横ばい", "既存計画のみ・業績横ばい（年5.2億円）", 2, 0, 0),
      ("4新規込み_横ばい", "既存＋新規事業・業績横ばい", 2, 0, 1),
      ("5既存_3割減", "既存計画のみ・既存事業の営業利益が計画比3割減", 1, -0.3, 0),
      ("6新規込み_3割減", "既存＋新規事業・既存事業が計画比3割減", 1, -0.3, 1),
      ("7既存_5割減", "既存計画のみ・既存事業の営業利益が計画比5割減", 1, -0.5, 0),
      ("8新規込み_5割減", "既存＋新規事業・既存事業が計画比5割減", 1, -0.5, 1)]
for sh, t, oc, mu, nb in SC: build(sh, t, oc, mu, nb, *COMMON)

# ================= サマリー =================
m = wb.create_sheet("サマリー", 0)
m["A1"] = "カンテサンス CF計画 サマリー（みずほ15億円・4%＋追加対価5億円の追加借入／投資家15億円）"; m["A1"].font = T
m["A2"] = "単位：百万円。数値はすべて各シナリオのシートからの参照です。"; m["A2"].font = NOTE
header(m, 4, ["シナリオ", "最低の現金残高", "その年", "5年後の現金", "最低DSCR", "純資産の増加（5年）", "売却価格（株式価値）", "第三者売却 3億円IRR", "第三者売却 5億円IRR", "第三者売却 5億円受取", "買取 3億円IRR", "買取 5億円IRR", "判定"])
rb = ROW["rb"]
for i, (sh, t, *_x) in enumerate(SC):
    r = 5 + i; q = f"'{sh}'!"; cr = ROW["cash"]; dr = ROW["dscr"]
    m.cell(row=r, column=1, value=t).font = BLK
    vals = [(2, f"=MIN({q}C{cr}:G{cr})", NUM), (3, f"=INDEX({q}C{ROW['hdr']}:G{ROW['hdr']},MATCH(B{r},{q}C{cr}:G{cr},0))", '@'),
            (4, f"={q}G{cr}", NUM), (5, f"=MIN({q}C{dr}:G{dr})", X), (6, f"={q}G{ROW['nav']}", NUM),
            (7, f"={q}B{rb+24}", NUM), (8, f"={q}B{rb+33}", PCT), (9, f"={q}B{rb+39}", PCT), (10, f"={q}B{rb+41}", NUM),
            (11, f"={q}B{rb+6}", PCT), (12, f"={q}B{rb+12}", PCT)]
    for col, f, fmt in vals:
        c = m.cell(row=r, column=col, value=f); c.number_format = fmt; c.font = B if col in (2, 5) else BLK
    m.cell(row=r, column=13, value=f'=IF(B{r}<0,"資金不足",IF(E{r}<1,"現金は回るが返済余力不足",IF(E{r}<1.2,"回る（返済余力は薄い）","回る")))').font = B
m.column_dimensions["A"].width = 46
for col in "BCDEFGHIJKLM": m.column_dimensions[col].width = 13
m.column_dimensions["M"].width = 22
notes = [
    "【条件】みずほ15億円・5年元金均等・金利4%。追加対価5億円は2029年に会社が支払い、同額をみずほ銀行から追加借入（2031年までは利息のみ、2032年から5年で返済する仮定：前提!B42）。AM報酬は15億円×1%を毎年、1%を売却時に精算。投資家（5名・15億円）には年3%＋売却時に純資産増加分×49%（成果報酬30%控除後）。",
    "【新規事業】①ガトー・オ・コンテ：2027年11月から2026年比2倍、2028年11月から3倍（投資なし、増加分の営業利益率30%は仮定）。②一品スイーツ店：2028年1月から毎年1店舗、1店舗の月商1,500万円・月の営業利益450万円・投資5,000万円。③ワインショップ・バー：2030年1月から月商700万円・月の営業利益50万円（投資なし）。詳細は「新規事業」シート。",
    "【減益ケース】3割減・5割減は既存事業（本店）の営業利益に掛ける。新規事業は減らさずに上乗せ。業績横ばいは2026年の着地予想約5.2億円が続く場合。",
    "【売却の前提】第三者に売却する場合は、売却時（2031年末）のEBITDA×取得時の倍率（6.2倍＝事業価値32.6億円÷2026年EBITDA 5.29億円）で売却価格を仮定し、持株比率どおり投資家49%に分配（増加分に成果報酬30%）してIRRを算出。WineBankが買い取る場合は純資産ベース（出資額＋純資産増加×49%×70%）。",
    "【簡略化】運転資本の増減、移転・大規模改装、役員退職金は含めない。岸田シェフの4年目以降の報酬削減効果も見込まない（上振れ要因）。投資家へのコンサルティング費用が配当とみなされると損金にならない点に注意。",
]
for i, t in enumerate(notes):
    c = m.cell(row=15 + i, column=1, value=t); c.font = Font(name=F, size=9); c.alignment = Alignment(wrap_text=True, vertical="top")
    m.merge_cells(start_row=15 + i, start_column=1, end_row=15 + i, end_column=13); m.row_dimensions[15 + i].height = 42

wb.save(OUT); print("saved")
