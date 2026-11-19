# カンテサンス（㈱プティ・ボノム）5か年計画：年度まとめ＋月次推移表（2027〜2031年）
# 2025年実績・2026年実績（1〜9月）を土台に、前年同月×（客数の増減）×（コース単価の値上げ）で積み上げる。
# 使い方: python3 build_plan_monthly_5y.py <出力.xlsx>
import sys, datetime as dt
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter as L

OUT = sys.argv[1]
F = "Arial"
BLUE = Font(name=F, size=10, color="0000FF"); BLK = Font(name=F, size=10); B = Font(name=F, size=10, bold=True)
GRN = Font(name=F, size=10, color="008000")
H = Font(name=F, size=10, bold=True, color="FFFFFF"); T = Font(name=F, size=14, bold=True, color="6D2E46")
NOTE = Font(name=F, size=9, color="6E6368"); SEC = Font(name=F, size=10, bold=True, color="6D2E46")
HF = PatternFill("solid", fgColor="6D2E46"); YF = PatternFill("solid", fgColor="FFF2CC")
TF = PatternFill("solid", fgColor="F7F3F4"); AF = PatternFill("solid", fgColor="EAF1FB")
NUM = '#,##0;(#,##0);"-"'; PCT = '0.0%;(0.0%);"-"'; YEN = '#,##0"円"'; X = '0.000'
THIN = Side(style="thin", color="E4DADD")

MONTHS = [f"{m}月" for m in range(1, 13)]
MC = [L(2 + i) for i in range(12)]          # B..M
YEARS = [2025, 2026, 2027, 2028, 2029, 2030, 2031]
PLAN = [2027, 2028, 2029, 2030, 2031]
SN = {2025: "2025実績", 2026: "2026実績見込", 2027: "2027年月次", 2028: "2028年月次", 2029: "2029年月次", 2030: "2030年月次", 2031: "2031年月次"}
def q(y): return f"'{SN[y]}'!"

# ---------------- 実績データ（千円） ----------------
A25 = {
 "店舗売上": [a + b for a, b in zip([3060.5, 4062.8, 4462.9, 5227.0, 4523.2, 4213.1, 2651.8, 3449.8, 4048.0, 4701.4, 3370.1, 3242.7],
                                    [69235.2, 62428.2, 67503.7, 69402.7, 80916.9, 69086.1, 70018.0, 65693.3, 72444.1, 76657.8, 72944.1, 77737.7])],
 "ガトー売上": [7954.5, 8330.7, 4905.6, 4149.4, 3269.1, 3641.2, 4749.7, 5856.0, 6871.4, 6132.3, 5576.0, 4890.9],
 "その他売上": [1000.0] * 9 + [0.0] * 3,
 "原価（食材）": [7938.8, 7433.9, 8383.0, 10637.4, 8966.4, 7540.4, 7859.4, 7686.1, 9802.0, 9092.1, 8706.5, 10067.1],
 "売上原価": [17986.9, 16177.8, 18285.2, 18067.2, 21645.3, 15422.0, 16342.0, 15155.6, 18375.8, 17660.0, 17022.4, 20234.9],
 "役員報酬": [50.0] * 12, "役員賞与": [0, 0, 0, 0, 0, 0, 95400.0, 0, 0, 0, 0, 0],
 "給料手当": [4536.4, 4536.4, 4690.9, 4966.6, 4998.5, 4371.6, 4030.8, 4083.7, 4469.0, 4821.6, 5324.0, 5465.6],
 "法定福利費": [699.5, 684.1, 683.8, 718.4, 756.5, 705.5, 1032.5, 613.8, 596.2, 712.2, 849.5, 903.9],
 "福利厚生費": [324.9, 143.0, 92.7, 188.3, 139.8, 50.6, 183.6, 154.8, 106.0, 250.0, 591.3, 189.1],
 "採用教育費": [0, 0, 190.0, 0, 0, 120.0, 120.0, 95.0, 0, 0, 0, 0],
 "荷造運賃": [1.0, 500.6, 534.0, 574.7, 559.6, 642.8, 550.1, 620.4, 526.3, 645.7, 767.7, 554.2],
 "広告宣伝費": [0, 0, 0, 0, 0, 0, 272.7, 0, 0, 0, 0, 0],
 "会議費": [20.0, 23.8, 2.9, 1.9, 15.7, 38.1, 11.2, 14.6, 10.0, 0, 17.1, 0],
 "交際費": [398.1, 631.5, 571.6, 648.5, 560.4, 377.0, 540.1, 482.3, 588.7, 343.7, 580.3, 534.4],
 "旅費交通費": [289.4, 159.1, 222.1, 198.8, 216.9, 204.1, 125.2, 243.6, 134.5, 113.2, 147.9, 134.6],
 "通信費": [34.4, 34.9, 37.8, 42.2, 37.6, 37.3, 35.7, 36.5, 35.9, 37.1, 41.9, 41.1],
 "消耗品費": [342.8, 335.1, 349.9, 288.4, 507.1, 509.1, 407.0, 454.2, 327.0, 458.7, 879.9, 384.5],
 "修繕費": [16.2, 116.2, 369.6, 86.8, 0, 0, 0, 22.1, 0, 28.7, 59.0, 179.3],
 "水道光熱費": [718.1, 711.4, 765.7, 779.2, 842.4, 930.2, 1062.6, 1141.1, 1156.4, 1135.7, 952.3, 693.9],
 "新聞図書費": [0, 3.3, 0, 0, 0, 3.2, 0, 0, 0, 0, 1.6, 0],
 "支払手数料": [2146.9, 2588.4, 2191.1, 2034.1, 2280.4, 2405.8, 2271.8, 1933.8, 2419.9, 2429.9, 2417.8, 2202.0],
 "賃借料": [1606.3, 1606.3, 1606.3, 1606.3, 1606.3, 1606.3, 1606.3, 951.3, 2261.3, 1606.3, 1606.3, 1606.3],
 "租税公課": [0, 0, 10.0, 40.0, 10.0, 65.3, 0, 4.0, 0, 10.0, 10.0, 10.0],
 "支払報酬料": [135.0, 374.7, 538.2, 194.0, 200.0, 195.0, 197.2, 218.2, 193.4, 206.2, 201.8, 315.6],
 "保険料": [0, 0, 0, 0, 0, 0, 0, 197.9, 0, 0, 0, 0],
 "減価償却費": [56.9] * 10 + [119.3, 119.3],
 "雑費": [77.1, 73.8, 174.5, 50.0, 127.6, 219.2, 87.3, 53.4, 125.9, 85.1, 95.8, 45.9],
 "外注費": [0, 0, 132.0, 0, 0, 0, 0, 0, 0, 0, 0, 47.5],
 "販売促進費": [717.2, 82.7, 909.9, 88.9, 37.2, 793.2, 702.7, 207.1, 740.9, 64.8, 814.6, 215.3],
 "衛生管理費": [293.3, 296.8, 310.1, 327.9, 312.3, 310.2, 300.3, 328.0, 363.4, 337.2, 323.9, 306.1],
 "諸会費": [6.6, 0.6, 0.6, 0.6, 0.6, 6.0, 0.6, 0.6, 27.7, 0.6, 75.6, 0.6],
 "長期前払費用償却": [27.3] * 12,
}
GUESTS25 = [1038.2, 1076.7, 1114.5, 1216.5, 1250.0, 1077.5, 1103.8, 1103.5, 1135.8, 1262.8, 1144.6, 1141.5]
DAYS = [19, 20, 21, 22, 23, 20, 20, 20, 21, 23, 22, 21]
# 2026年1〜9月（第16期試算表、千円）
A26 = {
 "店舗売上": [a + b for a, b in zip([4464, 2780, 4492, 3260, 5376, 2715, 3148, 6382, 4981], [69422, 74561, 74519, 74120, 77982, 79315, 72430, 69813, 78925])],
 "ガトー売上": [4646, 5125, 3368, 3814, 9143, 5763, 7134, 4736, 4686], "その他売上": [0] * 9,
 "原価（食材）": [9199, 8540, 9812, 11109, 10688, 11344, 9320, 9741, 10584],
 "売上原価": [18177, 16663, 18724, 19256, 21089, 22204, 19248, 18646, 19517],
 "役員報酬": [50] * 9, "役員賞与": [0, 0, 0, 0, 0, 0, 95400, 0, 0],
 "給料手当": [5361, 5192, 5239, 5887, 5612, 5502, 5502, 5502, 5810], "法定福利費": [834, 820, 834, 865, 814, 851, 1304, 820, 905],
 "福利厚生費": [203, 231, 192, 78, 148, 175, 186, 244, 119], "採用教育費": [0, 0, 190, 0, 0, 0, 0, 0, 0],
 "荷造運賃": [0, 472, 450, 549, 560, 588, 687, 542, 569], "広告宣伝費": [0] * 9,
 "会議費": [18, 11, 3, 0, 32, 29, 3, 1, 0], "交際費": [538, 432, 477, 608, 434, 541, 1081, 697, 805],
 "旅費交通費": [97, 149, 114, 115, 135, 105, 142, 126, 426], "通信費": [38, 38, 42, 43, 39, 36, 65, 43, 42],
 "消耗品費": [348, 188, 643, 275, 401, 181, 367, 400, 431], "修繕費": [659, 473, 194, 25, 0, 99, 106, 0, 483],
 "水道光熱費": [752, 738, 675, 698, 688, 817, 893, 1036, 1147], "新聞図書費": [0, 0, 3, 0, 0, 0, 0, 0, 0],
 "支払手数料": [2086, 2314, 2169, 2259, 2434, 2351, 2381, 2193, 2246], "賃借料": [1606, 1606, 1621, 1621, 1598, 1613, 1613, 1613, 1613],
 "租税公課": [0, 0, 0, 10, 0, 45, 0, 0, 6], "支払報酬料": [303, 329, 746, 191, 211, 195, 317, 344, 424], "保険料": [0] * 9,
 "減価償却費": [45, 45, 45, 45, 45, 45, 100, 152, 152], "雑費": [44, 143, 84, 52, 124, 81, 78, 82, 55],
 "外注費": [0, 83, 0, 12, 0, 0, 0, 0, 0], "販売促進費": [774, 54, 831, 94, 860, 209, 758, 113, 774],
 "衛生管理費": [320, 289, 380, 334, 324, 319, 267, 303, 331], "諸会費": [6, 0, 0, 0, 0, 6, 0, 0, 28],
 "長期前払費用償却": [2, 2, 30, 30, 30, 30, 30, 30, 30],
}
# 販管費の科目と、計画での増減の考え方
SGA = [("役員報酬", "kishida"), ("役員賞与", "kishida"), ("給料手当", "wage"), ("法定福利費", "wage"), ("福利厚生費", "wage"),
       ("採用教育費", "infl"), ("荷造運賃", "gateau"), ("広告宣伝費", "infl"), ("会議費", "infl"), ("交際費", "infl"),
       ("旅費交通費", "infl"), ("通信費", "infl"), ("消耗品費", "infl"), ("修繕費", "infl"), ("水道光熱費", "infl"),
       ("新聞図書費", "infl"), ("支払手数料", "store"), ("賃借料", "fixed"), ("租税公課", "infl"), ("支払報酬料", "infl"),
       ("保険料", "infl"), ("減価償却費", "fixed"), ("雑費", "infl"), ("外注費", "infl"), ("販売促進費", "store"),
       ("衛生管理費", "infl"), ("諸会費", "infl"), ("長期前払費用償却", "fixed")]
METHOD_NOTE = {"kishida": "基本合意書：岸田氏の役員報酬は3年間現状維持（毎年7月に賞与）。2030年以降は前提の継続フラグ",
               "wage": "前年同月×（1＋昇給率）", "infl": "前年同月×（1＋物価上昇率）", "gateau": "前年同月×ガトー売上（既存）の伸び",
               "store": "前年同月×店舗売上の伸び（カード手数料・予約手数料）", "fixed": "前年同月と同額（賃貸借契約・償却）"}

wb = Workbook()
def header(ws, r, labels, start=1):
    for i, h in enumerate(labels):
        c = ws.cell(row=r, column=start + i, value=h); c.font = H; c.fill = HF; c.alignment = Alignment(horizontal="center", wrap_text=True)

# ================= 前提 =================
P = wb.active; P.title = "前提"
P["A1"] = "カンテサンス 5か年計画（2027〜2031年）前提条件"; P["A1"].font = T
P["A2"] = "単位：千円（単価は円）。青字＝入力値（変更可）、黒字＝計算式。黄色は主要なレバー。"; P["A2"].font = NOTE
def pin(cell, v, fmt=NUM, key=False, note=None, note_col="J"):
    c = P[cell]; c.value = v; c.number_format = fmt
    c.font = BLK if isinstance(v, str) and v.startswith("=") else BLUE
    if key: c.fill = YF
    if note: P[f"{note_col}{c.row}"] = note; P[f"{note_col}{c.row}"].font = NOTE
def plab(r, t, bold=False): P.cell(row=r, column=1, value=t).font = SEC if bold else BLK

plab(4, "■ 1. コース単価（円・税抜）：値上げのスケジュール", True)
header(P, 5, ["年"] + MONTHS + ["年平均"])
PRICE = {2025: [33000] * 5 + [35000] * 7, 2026: [35000] * 6 + [37500] * 6, 2027: [37500] * 12,
         2028: [37500] * 6 + [40000] * 6, 2029: [40000] * 12, 2030: [40000] * 6 + [42500] * 6, 2031: [42500] * 12}
PR_ROW = {}
for i, y in enumerate(YEARS):
    r = 6 + i; PR_ROW[y] = r
    P.cell(row=r, column=1, value=y).font = B
    for k, col in enumerate(MC):
        pin(f"{col}{r}", PRICE[y][k], '#,##0', key=(y >= 2027))
    P[f"N{r}"] = f"=AVERAGE(B{r}:M{r})"; P[f"N{r}"].number_format = '#,##0'
P["A13"] = ("2025・2026年は実績（2025年6月に33,000→35,000円、2026年7月に37,500円。売上の前年比と整合）。2027〜2029年は売主の数値計画（中央値）どおり"
            "（2028年7月に40,000円）。2030年7月の42,500円は同じ2年ごとの値上げを延長した仮定。ドリンク・サービス料もコース単価と同じ率で上がる前提（売主の計画と同じ）。")
P["A13"].font = NOTE; P["A13"].alignment = Alignment(wrap_text=True, vertical="top"); P.merge_cells("A13:N13"); P.row_dimensions[13].height = 40

plab(15, "■ 2. 年ごとの増減率", True)
header(P, 16, ["項目", "2026"] + [str(y) for y in PLAN] + ["", "", "考え方"])
RATE = {}
rates = [("客数の増減率", "guest", [0, 0, 0, 0, 0, 0], "三つ星で満席のため客数は横ばい（2026年は2025年と同数と仮定）"),
         ("ガトー売上（既存）の増減率", "gateau", [None, 0, 0, 0, 0, 0], "既存のガトーは横ばい（拡大分は新規事業①で計上）。2026年10〜12月は1〜9月の前年比"),
         ("食材原価：1人あたりの上昇率", "food", [None, 0.03, 0.03, 0.03, 0.03, 0.03], "食材の物価上昇。値上げ分は原価率の改善につながる"),
         ("人件費の昇給率", "wage", [None, 0.03, 0.03, 0.03, 0.03, 0.03], "給料手当・法定福利費・福利厚生費"),
         ("その他経費の物価上昇率", "infl", [None, 0.02, 0.02, 0.02, 0.02, 0.02], "交際費・水道光熱費・消耗品費など")]
for j, (t, key, vals, note) in enumerate(rates):
    r = 17 + j; RATE[key] = r
    P.cell(row=r, column=1, value=t).font = BLK
    for k, v in enumerate(vals):
        col = L(2 + k)
        if v is None: P[f"{col}{r}"] = "1〜9月比"; P[f"{col}{r}"].font = NOTE
        else: pin(f"{col}{r}", v, PCT, key=(k > 0))
    P[f"J{r}"] = note; P[f"J{r}"].font = NOTE
def rate(key, y):  # 年の増減率セル
    return f"前提!${L(2 + (y - 2026))}${RATE[key]}"
plab(23, "ワイン・飲料の原価は、ドリンク売上（客数×単価）と同じ率で増える前提（原価率は一定。保守的）。", False); P["A23"].font = NOTE

plab(25, "■ 3. 岸田氏の役員報酬（2030年以降）", True)
pin("B26", 1, '0', key=True, note="1＝退任後も同額を計上（保守的。投資家・銀行向けの計画と同じ）、0＝計上しない（年約95百万円の利益増）")
plab(26, "退任後（2030年〜）も役員報酬・賞与を計上")

plab(28, "■ 4. 新規事業（ご指定の前提。CF計画「新規事業」シートと同じ）", True)
NBP = [("① ガトー：2026年の月平均売上（千円）", "=48416/9", NUM, "第16期試算表 1〜9月のガトー売上48,416千円÷9"),
       ("① 第1段階の開始月", dt.datetime(2027, 11, 1), 'yyyy/mm', "2027年11月から2026年比2倍"),
       ("① 第1段階の倍率", 2, '0.0"倍"', ""), ("① 第2段階の開始月", dt.datetime(2028, 11, 1), 'yyyy/mm', "2028年11月から3倍"),
       ("① 第2段階の倍率", 3, '0.0"倍"', ""), ("① 増加分の営業利益率", 0.30, PCT, "仮定"),
       ("② スイーツ店：1店舗の月商（千円）", 15000, NUM, "月1,500万円"), ("② 1店舗の月の営業利益（千円）", 4500, NUM, "月450万円"),
       ("② 最初の出店月", dt.datetime(2028, 1, 1), 'yyyy/mm', "毎年1月に出店"), ("② 年間の出店数", 1, '0', ""),
       ("③ ワインショップ・バー：月商（千円）", 7000, NUM, "月700万円"), ("③ 月の営業利益（千円）", 500, NUM, "月50万円"),
       ("③ 開始月", dt.datetime(2030, 1, 1), 'yyyy/mm', "")]
NBR = {}
for j, (t, v, fmt, note) in enumerate(NBP):
    r = 29 + j; NBR[j] = f"前提!$B${r}"
    plab(r, t); pin(f"B{r}", v, fmt, key=True, note=note, note_col="D")

plab(43, "■ 5. 取得後に増える費用（年額・千円。CF計画と同じ）", True)
ACQ = [("AM報酬（WineBank、毎年分）", 15000, dt.datetime(2027, 1, 1), "SPCの出資総額15億円×1%"),
       ("投資家へのコンサルティング費用（年3%）", 45000, dt.datetime(2027, 4, 1), "投資家の出資15億円×3%。払込み（2027年3月）の翌月から"),
       ("投資家特典の費用", 5000, dt.datetime(2027, 4, 1), "記念日ディナーへのご招待など"),
       ("宇佐美氏の役員報酬", 6000, dt.datetime(2027, 1, 1), "基準額（業績連動は簡略化）"),
       ("後継料理長の追加人件費", 15000, dt.datetime(2028, 1, 1), "2028年から")]
header(P, 44, ["項目", "年額", "開始月", "考え方"])
ACR = {}
for j, (t, v, d, note) in enumerate(ACQ):
    r = 45 + j; ACR[j] = r
    plab(r, t); pin(f"B{r}", v, NUM, key=True); pin(f"C{r}", d, 'yyyy/mm'); P[f"D{r}"] = note; P[f"D{r}"].font = NOTE

plab(51, "■ 6. 借入・退職慰労金・税金", True)
pin("B52", 1500000, NUM, note="みずほ銀行LBOローン（2026年12月実行）。5年元金均等・年1回返済", note_col="D"); plab(52, "LBOローン（千円）")
pin("B53", 0.04, PCT, note="", note_col="D"); plab(53, "金利")
pin("B54", 710000, NUM, note="追加対価5億円＋退職慰労金2.1億円。2029年12月実行、2031年までは利息のみ", note_col="D"); plab(54, "追加借入（千円）")
pin("B55", 210000, NUM, note="岸田氏の退任時（2029年12月）。特別損失として計上（損金算入は税理士確認前提）", note_col="D"); plab(55, "退職慰労金（千円）")
pin("B56", 0.344, PCT, note="2025年の実効税率。月次は税引前×税率で概算", note_col="D"); plab(56, "実効税率")
header(P, 58, ["年", "LBO 期首残高", "追加借入 期首残高", "年間の支払利息"])
LOANR = {}
for i, y in enumerate(PLAN):
    r = 59 + i; LOANR[y] = r
    P.cell(row=r, column=1, value=y).font = B
    P[f"B{r}"] = f"=MAX(0,$B$52-$B$52/5*{i})"; P[f"C{r}"] = "=$B$54" if y >= 2030 else 0
    P[f"D{r}"] = f"=(B{r}+C{r})*$B$53"
    for c in "BCD": P[f"{c}{r}"].number_format = NUM
P.column_dimensions["A"].width = 40
for c in MC + ["N"]: P.column_dimensions[c].width = 9.5
P.column_dimensions["J"].width = 12

# ================= 月次シート =================
ROWS = {}
order = [("sec", "[主要指標]"), ("days", "営業日数（日）"), ("guest", "客数（人）"), ("price", "コース単価（円・税抜）"),
         ("pf", "単価の前年同月比"), ("aov", "客単価（店舗売上÷客数・円）"),
         ("sec", "[売上高]"), ("store", "店舗売上（料理・飲料・サービス料）"), ("gateau", "ガトー売上（既存）"), ("other", "その他売上"),
         ("ex_sales", "既存事業 売上高合計"), ("nb1", "新規① ガトー・オ・コンテ拡大（増加分）"), ("nb2", "新規② 一品スイーツ店"),
         ("nb3", "新規③ ワインショップ・バー"), ("nb_sales", "新規事業 売上高合計"), ("sales", "売上高合計"),
         ("sec", "[売上原価（既存事業）]"), ("food", "原価（食材）"), ("wine", "原価（ワイン・飲料）"), ("cogs", "売上原価"),
         ("gp", "売上総損益（既存事業）"), ("sec", "[販売管理費（既存事業）]")]
order += [(f"sga_{k}", k) for k, _ in SGA]
order += [("sga", "販売管理費計"), ("op_ex", "営業損益（既存事業）"), ("nb_op", "新規事業 営業損益"), ("op_pre", "営業損益（既存＋新規）"),
          ("sec", "[取得後に増える費用]")] + [(f"acq{j}", ACQ[j][0]) for j in range(5)] + [
          ("acq", "取得後の費用 計"), ("op", "営業損益（取得後）"), ("int", "支払利息（LBOローン・追加借入）"), ("ord", "経常損益"),
          ("spl", "特別損失（退職慰労金）"), ("pre", "税引前当期純損益"), ("tax", "法人税等（概算）"), ("ni", "当期純損益")]
r = 5
for key, label in order:
    if key == "sec": r += 0
    ROWS.setdefault(key if key != "sec" else f"sec{r}", r); r += 1
R = ROWS
BOLD = {"ex_sales", "nb_sales", "sales", "cogs", "gp", "sga", "op_ex", "op_pre", "acq", "op", "ord", "pre", "ni"}
TOTAL = {"sales", "op_ex", "op", "ni"}

def note_for(key, y):
    if key == "store": return "前年同月×単価の前年同月比×（1＋客数の増減率）"
    if key == "gateau": return "前年同月×（1＋ガトーの増減率）"
    if key == "food": return "前年同月×（1＋客数の増減率）×（1＋食材の上昇率）"
    if key == "wine": return "前年同月×ドリンク売上の伸び（原価率一定）"
    if key.startswith("sga_"): return METHOD_NOTE[dict(SGA)[key[4:]]]
    if key.startswith("nb"): return "前提4（新規事業）"
    if key.startswith("acq"): return "前提5（年額÷12、開始月から）"
    if key == "int": return "前提6（期首残高×金利÷12）"
    if key == "spl": return "2029年12月に2.1億円"
    if key == "tax": return "税引前×実効税率（概算）"
    return ""

def build_month_sheet(y):
    ws = wb.create_sheet(SN[y])
    kind = "実績" if y == 2025 else ("実績＋見込み" if y == 2026 else "計画")
    ws["A1"] = f"カンテサンス 月次損益推移表 {y}年（{kind}）"; ws["A1"].font = T
    sub = {2025: "第15期 残高試算表（年間推移）より。単位：千円（単価・客数を除く）。客数は売主の単価構造分解（2025年）。",
           2026: "1〜9月は第16期試算表の実績（青字）。10〜12月は見込み＝2025年同月×1〜9月の前年比（店舗売上は単価の前年同月比）。単位：千円。"}.get(
           y, f"前年（{y-1}年）の同月を土台に、客数の増減と値上げ（単価の前年同月比）を掛けて作成。新規事業と取得後の費用は前提シート。単位：千円。")
    ws["A2"] = sub; ws["A2"].font = NOTE
    header(ws, 4, ["勘定科目"] + MONTHS + ["年間合計", "前年合計", "前年比", "計画の考え方"])
    prev = q(y - 1) if y > 2025 else None
    for key, label in order:
        pass
    rr = 5
    for key, label in order:
        row = rr; rr += 1
        c0 = ws.cell(row=row, column=1, value=label)
        if key == "sec":
            c0.font = SEC; continue
        c0.font = B if key in BOLD else BLK
        for k, col in enumerate(MC):
            m = k + 1; f = None; actual = None
            ym = f"DATE({y},{m},1)"
            # ---- 実績値 ----
            if y == 2025:
                src = {"store": "店舗売上", "gateau": "ガトー売上", "other": "その他売上", "food": "原価（食材）"}.get(key)
                if key.startswith("sga_"): src = key[4:]
                if src: actual = A25[src][k]
                if key == "wine": actual = round(A25["売上原価"][k] - A25["原価（食材）"][k], 1)
                if key == "guest": actual = GUESTS25[k]
            elif y == 2026 and m <= 9:
                src = {"store": "店舗売上", "gateau": "ガトー売上", "other": "その他売上", "food": "原価（食材）"}.get(key)
                if key.startswith("sga_"): src = key[4:]
                if src: actual = A26[src][k]
                if key == "wine": actual = A26["売上原価"][k] - A26["原価（食材）"][k]
            if actual is not None:
                c = ws[f"{col}{row}"]; c.value = actual; c.font = BLUE; c.number_format = NUM if key != "guest" else '#,##0'
                continue
            # ---- 計算式 ----
            pc = f"{prev}{col}{row}" if prev else None
            g = rate("guest", y) if y >= 2026 else "0"
            if key == "days": f = DAYS[k]
            elif key == "guest": f = f"={pc}*(1+{g})" if y > 2025 else GUESTS25[k]
            elif key == "price": f = f"=前提!{col}{PR_ROW[y]}"
            elif key == "pf": f = f"=IF({prev}{col}{R['price']}=0,1,{col}{R['price']}/{prev}{col}{R['price']})" if prev else "=1"
            elif key == "aov": f = f"=IF({col}{R['guest']}=0,0,{col}{R['store']}*1000/{col}{R['guest']})"
            elif key == "store": f = f"={pc}*{col}{R['pf']}*(1+{g})"
            elif key == "gateau":
                f = f"={pc}*$R${row}" if y == 2026 else f"={pc}*(1+{rate('gateau', y)})"
            elif key == "other": f = 0 if y >= 2026 else None
            elif key == "ex_sales": f = f"={col}{R['store']}+{col}{R['gateau']}+{col}{R['other']}"
            elif key == "nb1":
                f = 0 if y < 2027 else f"={NBR[0]}*(IF({ym}>={NBR[3]},{NBR[4]},IF({ym}>={NBR[1]},{NBR[2]},1))-1)"
            elif key == "nb2":
                f = 0 if y < 2027 else f"=IF({ym}<{NBR[8]},0,(YEAR({ym})-YEAR({NBR[8]})+1)*{NBR[9]})*{NBR[6]}"
            elif key == "nb3": f = 0 if y < 2027 else f"=IF({ym}>={NBR[12]},{NBR[10]},0)"
            elif key == "nb_sales": f = f"={col}{R['nb1']}+{col}{R['nb2']}+{col}{R['nb3']}"
            elif key == "sales": f = f"={col}{R['ex_sales']}+{col}{R['nb_sales']}"
            elif key == "food":
                f = f"={pc}*$R${row}" if y == 2026 else f"={pc}*(1+{g})*(1+{rate('food', y)})"
            elif key == "wine":
                f = f"={pc}*$R${row}" if y == 2026 else f"={pc}*{col}{R['pf']}*(1+{g})"
            elif key == "cogs": f = f"={col}{R['food']}+{col}{R['wine']}"
            elif key == "gp": f = f"={col}{R['ex_sales']}-{col}{R['cogs']}"
            elif key.startswith("sga_"):
                acct = key[4:]; meth = dict(SGA)[acct]
                if y == 2026:
                    f = f"={pc}*$R${row}" if meth != "kishida" else f"={pc}"
                elif meth == "kishida": f = f"={pc}" if y <= 2029 else (f"={q(2029)}{col}{row}*前提!$B$26")
                elif meth == "wage": f = f"={pc}*(1+{rate('wage', y)})"
                elif meth == "infl": f = f"={pc}*(1+{rate('infl', y)})"
                elif meth == "store": f = f"=IF({prev}{col}{R['store']}=0,{pc},{pc}*{col}{R['store']}/{prev}{col}{R['store']})"
                elif meth == "gateau": f = f"=IF({prev}{col}{R['gateau']}=0,{pc},{pc}*{col}{R['gateau']}/{prev}{col}{R['gateau']})"
                else: f = f"={pc}"
            elif key == "sga": f = f"=SUM({col}{R['sga_役員報酬']}:{col}{R['sga_長期前払費用償却']})"
            elif key == "op_ex": f = f"={col}{R['gp']}-{col}{R['sga']}"
            elif key == "nb_op":
                f = 0 if y < 2027 else (f"={col}{R['nb1']}*{NBR[5]}+IF({ym}<{NBR[8]},0,(YEAR({ym})-YEAR({NBR[8]})+1)*{NBR[9]})*{NBR[7]}"
                                        f"+IF({ym}>={NBR[12]},{NBR[11]},0)")
            elif key == "op_pre": f = f"={col}{R['op_ex']}+{col}{R['nb_op']}"
            elif key.startswith("acq") and key != "acq":
                j = int(key[3:]); f = 0 if y < 2027 else f"=IF({ym}>=前提!$C${ACR[j]},前提!$B${ACR[j]}/12,0)"
            elif key == "acq": f = f"=SUM({col}{R['acq0']}:{col}{R['acq4']})"
            elif key == "op": f = f"={col}{R['op_pre']}-{col}{R['acq']}"
            elif key == "int": f = 0 if y < 2027 else f"=前提!$D${LOANR[y]}/12"
            elif key == "ord": f = f"={col}{R['op']}-{col}{R['int']}"
            elif key == "spl": f = f"=IF(AND({y}=2029,{m}=12),前提!$B$55,0)"
            elif key == "pre": f = f"={col}{R['ord']}-{col}{R['spl']}"
            elif key == "tax": f = f"={col}{R['pre']}*前提!$B$56"
            elif key == "ni": f = f"={col}{R['pre']}-{col}{R['tax']}"
            c = ws[f"{col}{row}"]; c.value = f
            c.number_format = {"days": '0', "guest": '#,##0', "price": '#,##0', "aov": '#,##0', "pf": X}.get(key, NUM)
            c.font = B if key in BOLD else BLK
            if y == 2026 and m >= 10 and key not in ("days", "price", "pf", "aov"): c.fill = AF
        # 年間合計・前年・前年比
        if key in ("price", "aov"):
            ws[f"N{row}"] = (f"=AVERAGE(B{row}:M{row})" if key == "price" else f"=IF(N{R['guest']}=0,0,N{R['store']}*1000/N{R['guest']})")
            ws[f"N{row}"].number_format = '#,##0'
        elif key == "pf":
            pass
        else:
            ws[f"N{row}"] = f"=SUM(B{row}:M{row})"; ws[f"N{row}"].number_format = '0' if key == "days" else ('#,##0' if key == "guest" else NUM)
        if prev and key != "pf":
            ws[f"O{row}"] = f"={prev}N{row}"; ws[f"O{row}"].number_format = ws[f"N{row}"].number_format
            ws[f"P{row}"] = f"=IF(O{row}=0,\"-\",N{row}/O{row}-1)"; ws[f"P{row}"].number_format = PCT
        ws[f"N{row}"].font = B
        ws[f"Q{row}"] = note_for(key, y) if y >= 2027 else ""
        ws[f"Q{row}"].font = NOTE
        if key in TOTAL:
            for col in MC + ["A", "N", "O", "P"]: ws[f"{col}{row}"].fill = TF
        # 2026年：10〜12月の見込みに使う1〜9月の前年比
        if y == 2026 and (key in ("gateau", "food", "wine") or key.startswith("sga_")):
            ws[f"R{row}"] = f"=IF(SUM({q(2025)}B{row}:J{row})=0,1,SUM(B{row}:J{row})/SUM({q(2025)}B{row}:J{row}))"
            ws[f"R{row}"].number_format = X; ws[f"R{row}"].font = GRN
    if y == 2026:
        ws["R4"] = "1〜9月の前年比"; ws["R4"].font = H; ws["R4"].fill = HF
        ws["A" + str(rr + 1)] = ("水色の10〜12月は見込み。店舗売上は2025年同月×単価の前年同月比（7月の値上げで+7.1%）、その他は2025年同月×R列（1〜9月の前年比）。"
                                 "役員賞与・役員報酬は2025年と同額。1〜9月の前年比で増えた科目（2025年が0円）は前年同月の0円のままとなるため、必要に応じて上書きしてください。")
        ws["A" + str(rr + 1)].font = NOTE
    ws.column_dimensions["A"].width = 38
    for col in MC: ws.column_dimensions[col].width = 9.5
    for col in "NO": ws.column_dimensions[col].width = 11
    ws.column_dimensions["P"].width = 8; ws.column_dimensions["Q"].width = 46; ws.column_dimensions["R"].width = 10
    ws.freeze_panes = "B5"
    return ws

for y in YEARS: build_month_sheet(y)

# ================= 年度まとめ =================
S = wb.create_sheet("年度まとめ", 0)
S["A1"] = "カンテサンス 5か年計画 年度まとめ（既存事業＋新規事業）"; S["A1"].font = T
S["A2"] = "単位：千円（単価・客数を除く）。暦年（1〜12月、対象会社の決算期）。数値は各月次シートの年間合計を参照。"; S["A2"].font = NOTE
cols = ["B", "C", "D", "E", "F", "G", "H"]
header(S, 4, ["項目", "2025実績", "2026実績見込"] + [f"{y}計画" for y in PLAN] + ["5年計（2027-31）"])
lines = [("sec", "■ 主要指標"), ("guest", "客数（人）"), ("price", "コース単価の年平均（円）"), ("aov", "客単価（店舗売上÷客数・円）"),
         ("sec", "■ 売上高"), ("store", "店舗売上"), ("gateau", "ガトー売上（既存）"), ("other", "その他売上"), ("ex_sales", "既存事業 売上高"),
         ("nb1", "新規① ガトー拡大"), ("nb2", "新規② 一品スイーツ店"), ("nb3", "新規③ ワインショップ・バー"), ("nb_sales", "新規事業 売上高"),
         ("sales", "売上高合計"), ("sec", "■ 損益"), ("cogs", "売上原価（既存）"), ("gp", "売上総利益（既存）"),
         ("sga_役員報酬", "役員報酬（岸田氏）"), ("sga_役員賞与", "役員賞与（岸田氏）"), ("sga", "販売管理費計（既存）"),
         ("op_ex", "営業利益（既存事業）"), ("nb_op", "新規事業 営業利益"), ("op_pre", "営業利益（既存＋新規）"),
         ("acq", "取得後に増える費用"), ("op", "営業利益（取得後）"), ("int", "支払利息"), ("spl", "特別損失（退職慰労金）"),
         ("pre", "税引前当期純利益"), ("tax", "法人税等（概算）"), ("ni", "当期純利益")]
SR = {}
r = 5
for key, label in lines:
    c0 = S.cell(row=r, column=1, value=label)
    if key == "sec":
        c0.font = SEC; r += 1; continue
    SR[key] = r
    c0.font = B if key in BOLD else BLK
    for col, y in zip(cols, YEARS):
        c = S[f"{col}{r}"]; c.value = f"={q(y)}N{R[key]}"
        c.number_format = '#,##0' if key in ("guest", "price", "aov") else NUM
        c.font = B if key in BOLD else BLK
        if key in TOTAL: c.fill = TF
    if key not in ("guest", "price", "aov"):
        S[f"I{r}"] = f"=SUM(D{r}:H{r})"; S[f"I{r}"].number_format = NUM; S[f"I{r}"].font = B
    if key in TOTAL: S[f"A{r}"].fill = TF
    r += 1
r += 1
S.cell(row=r, column=1, value="■ 前年比").font = SEC; r += 1
for key, label in [("store", "店舗売上"), ("ex_sales", "既存事業 売上高"), ("sales", "売上高合計"), ("op_ex", "営業利益（既存事業）"), ("op", "営業利益（取得後）")]:
    S.cell(row=r, column=1, value=label).font = BLK
    for i, col in enumerate(cols[1:]):
        pc = cols[i]; S[f"{col}{r}"] = f"=IF({pc}{SR[key]}=0,\"-\",{col}{SR[key]}/{pc}{SR[key]}-1)"; S[f"{col}{r}"].number_format = PCT
    r += 1
S.cell(row=r, column=1, value="営業利益率（既存事業）").font = BLK
for col in cols: S[f"{col}{r}"] = f"=IF({col}{SR['ex_sales']}=0,0,{col}{SR['op_ex']}/{col}{SR['ex_sales']})"; S[f"{col}{r}"].number_format = PCT
r += 2
S.cell(row=r, column=1, value="■ IM計画（売主）との比較：営業利益（既存事業）").font = SEC; r += 1
im = {2026: 528000, 2027: 556000, 2028: 576000, 2029: 598000, 2030: 623340, 2031: 649750}
S.cell(row=r, column=1, value="IM計画（2030年以降はCF計画の延長）").font = BLK
for col, y in zip(cols, YEARS):
    if y in im: S[f"{col}{r}"] = im[y]; S[f"{col}{r}"].font = BLUE; S[f"{col}{r}"].number_format = NUM
imr = r; r += 1
S.cell(row=r, column=1, value="本計画 − IM計画").font = BLK
for col, y in zip(cols, YEARS):
    if y in im: S[f"{col}{r}"] = f"={col}{SR['op_ex']}-{col}{imr}"; S[f"{col}{r}"].number_format = NUM
r += 2
S.cell(row=r, column=1, value="■ WineBankの決算期（10月〜翌9月）ベース：連結に取り込む金額").font = SEC; r += 1
header(S, r, ["項目", "FY2027（27/1-9）", "FY2028", "FY2029", "FY2030", "FY2031", "", "", "連結開始は2027年1月（決済日の翌月）。FY2027は9か月分"]); r += 1
fy = [(2027, None), (2028, 2027), (2029, 2028), (2030, 2029), (2031, 2030)]
for key, label in [("sales", "売上高合計"), ("op_ex", "営業利益（既存事業）"), ("nb_op", "新規事業 営業利益"), ("op", "営業利益（取得後）"), ("ni", "当期純利益")]:
    S.cell(row=r, column=1, value=label).font = B if key in BOLD else BLK
    for i, (y, py) in enumerate(fy):
        col = cols[i]
        f = f"=SUM({q(y)}B{R[key]}:J{R[key]})" + (f"+SUM({q(py)}K{R[key]}:M{R[key]})" if py else "")
        S[f"{col}{r}"] = f; S[f"{col}{r}"].number_format = NUM
    r += 1
r += 1
notes = [
    "【作り方】2025年の月次実績（第15期試算表）と2026年1〜9月の実績（第16期試算表）を土台に、各月を前年同月から積み上げています。店舗売上＝前年同月×単価の前年同月比×（1＋客数の増減率）。",
    "【値上げ】コース単価は2年ごとに7月に2,500円上げる（2026年7月37,500円は実績、2028年7月40,000円は売主の計画、2030年7月42,500円は延長の仮定）。値上げした月から12か月間、前年同月比で約6〜7%の増収になります。",
    "【原価】食材は客数×1人あたり原価（年3%上昇）で、値上げ分は原価率の改善になります。ワイン・飲料はドリンク売上と同率で増える（原価率一定）保守的な前提です。",
    "【岸田氏】役員報酬は月5万円、賞与は毎年7月に95,400千円（基本合意書：3年間現状維持）。2030年以降も同額を計上しています（前提3で0にすると年約95百万円の増益）。",
    "【取得後の費用・借入】AM報酬、投資家への年3%、特典、宇佐美氏の報酬、後継料理長の人件費、LBOローンの利息、2029年12月の退職慰労金2.1億円は、投資家・銀行向けのCF計画と同じ前提です。のれん償却は含めていません。",
]
for t in notes:
    c = S.cell(row=r, column=1, value=t); c.font = NOTE; c.alignment = Alignment(wrap_text=True, vertical="top")
    S.merge_cells(start_row=r, start_column=1, end_row=r, end_column=9); S.row_dimensions[r].height = 30; r += 1
S.column_dimensions["A"].width = 36
for col in cols + ["I"]: S.column_dimensions[col].width = 13
S.freeze_panes = "B5"

wb.save(OUT); print("saved", OUT)
