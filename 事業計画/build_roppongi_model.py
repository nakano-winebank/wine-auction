# -*- coding: utf-8 -*-
"""六本木ミッドタウン店 事業収支（可変モデル）
   売上を 席数 × 席効率 × 回転率 × 客単価 から積み上げ、
   2026年8月3日提出P&Lの全項目をそのまま維持する。"""
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side

OUT = "/home/user/wine-auction/事業計画/六本木ミッドタウン店_事業収支_可変モデル_202610.xlsx"
JP = "Meiryo"
BLUE, BLACK, GREEN, RED = "0000FF", "000000", "008000", "C00000"
HDR = PatternFill("solid", fgColor="1F3864")
SUB = PatternFill("solid", fgColor="D9E2F3")
TOT = PatternFill("solid", fgColor="F2F2F2")
KEY = PatternFill("solid", fgColor="FFFF00")
INP = PatternFill("solid", fgColor="EAF1FB")
thin = Side(style="thin", color="BFBFBF")
BOX = Border(left=thin, right=thin, top=thin, bottom=thin)

MM   = '#,##0.0;(#,##0.0);-'      # 百万円
YEN  = '#,##0;(#,##0);-'          # 円
NUM1 = '#,##0.0;(#,##0.0);-'
NUM2 = '0.00;(0.00);-'
PCT  = '0.0%;(0.0%);-'
PCT2 = '0.00%;(0.00%);-'
INT  = '#,##0;(#,##0);-'

wb = openpyxl.Workbook()

def S(ws, cell, *, bold=False, color=BLACK, fmt=None, fill=None, align=None,
      size=10, border=False, wrap=False):
    c = ws[cell]
    c.font = Font(name=JP, bold=bold, color=color, size=size)
    if fmt: c.number_format = fmt
    if fill: c.fill = fill
    if align or wrap: c.alignment = Alignment(horizontal=align, vertical="center", wrap_text=wrap)
    if border: c.border = BOX
    return c

def band(ws, row, text, last, fill=HDR, color="FFFFFF", size=11):
    ws.cell(row=row, column=1, value=text)
    for col in range(1, openpyxl.utils.column_index_from_string(last) + 1):
        c = ws.cell(row=row, column=col)
        c.fill = fill
        c.font = Font(name=JP, bold=True, color=color, size=size)

def sec(ws, row, text, last):
    band(ws, row, text, last, fill=SUB, color="000000", size=10)

# ══════════════════════════════════════════════════════════
# 2. 売上前提
# ══════════════════════════════════════════════════════════
ws2 = wb.create_sheet("売上前提")
ws2.sheet_view.showGridLines = False
ws2.column_dimensions["A"].width = 22
ws2.column_dimensions["B"].width = 10
for c in ["C","D","E","F","G","H","I","J","K","L"]:
    ws2.column_dimensions[c].width = 12
ws2.column_dimensions["M"].width = 3
ws2.column_dimensions["N"].width = 48

band(ws2, 1, "売上前提　／　席数 × 席効率 × 回転率 × 客単価 からの積上げ", "L")
S(ws2, "A2", size=9, color="7F7F7F")
ws2["A2"] = "水色セル＝入力値。ここを変えると全シートが自動再計算されます。単位：売上は百万円、客単価は円。"

# ── 基本条件 ──
sec(ws2, 4, "■ 基本条件", "L")
basics = [
    ("営業日数（日／年）",        363.0, NUM1, "年363日営業（提出P&L準拠）"),
    ("立上り率　1年目",           0.90,  PCT,  "新店初年度は保守的に90%"),
    ("立上り率　2年目",           0.98,  PCT,  ""),
    ("立上り率　3年目以降（成熟）", 1.00,  PCT,  "満年度＝この水準"),
]
r = 5
for lab, v, f, note in basics:
    S(ws2, f"A{r}"); ws2[f"A{r}"] = lab
    S(ws2, f"B{r}", color=BLUE, fmt=f, border=True, align="center", fill=INP); ws2[f"B{r}"] = v
    S(ws2, f"N{r}", size=9, color="7F7F7F"); ws2[f"N{r}"] = note
    r += 1
# B5 営業日数 / B6 1年目 / B7 2年目 / B8 3年目以降

# ── 席数 ──
sec(ws2, 10, "■ 席数（席）", "L")
seats = [("カウンター", 14), ("ダイニング", 30), ("個室", 27)]
r = 11
for lab, v in seats:
    S(ws2, f"A{r}"); ws2[f"A{r}"] = lab
    S(ws2, f"B{r}", color=BLUE, fmt=INT, border=True, align="center", fill=INP); ws2[f"B{r}"] = v
    r += 1
S(ws2, "A14", bold=True); ws2["A14"] = "店内　小計"
S(ws2, "B14", bold=True, fmt=INT, border=True, align="center", fill=TOT); ws2["B14"] = "=SUM(B11:B13)"
S(ws2, "A15"); ws2["A15"] = "テラス"
S(ws2, "B15", color=BLUE, fmt=INT, border=True, align="center", fill=INP); ws2["B15"] = 52
S(ws2, "A16", bold=True); ws2["A16"] = "合　計"
S(ws2, "B16", bold=True, fmt=INT, border=True, align="center", fill=KEY); ws2["B16"] = "=B14+B15"
S(ws2, "N11", size=9, color="7F7F7F")
ws2["N11"] = "提出P&L：123席（カウンター14・ダイニング30・個室27・テラス52）／183.59㎡＝55.5坪"
# B14 店内計 / B15 テラス / B16 合計

# ── 時間帯 × エリア 別 ──
sec(ws2, 18, "■ 時間帯 × エリア 別の売上前提", "L")
HD = [("A","時間帯"),("B","エリア"),("C","席数"),("D","席効率"),("E","回転率\n(回/日)"),
      ("F","客単価\n料理(円)"),("G","客単価\n飲料(円)"),("H","客単価\n計(円)"),
      ("I","1日\n客数(人)"),("J","日商(円)"),("K","年間売上\n(百万円)"),("L","構成比")]
for c, t in HD:
    S(ws2, f"{c}19", bold=True, border=True, fill=TOT, align="center", size=9, wrap=True)
    ws2[f"{c}19"] = t
ws2.row_dimensions[19].height = 34

GRID = [
    ("ランチ",                "店内",   "$B$14", 0.80, 1.15, 3000, 1000),
    ("ランチ",                "テラス", "$B$15", 0.50, 1.00, 3000, 1000),
    ("カフェ（アイドルタイム）", "店内",   "$B$14", 0.80, 0.50, 1000,  500),
    ("カフェ（アイドルタイム）", "テラス", "$B$15", 0.50, 0.60, 1000,  500),
    ("ディナー",              "店内",   "$B$14", 0.80, 0.80, 9000, 6000),
    ("ディナー",              "テラス", "$B$15", 0.50, 0.40, 9000, 6000),
]
R_G0 = 20
r = R_G0
for jikan, area, sref, eff, turn, ryori, inryo in GRID:
    S(ws2, f"A{r}", border=True, size=9); ws2[f"A{r}"] = jikan
    S(ws2, f"B{r}", border=True, size=9, align="center"); ws2[f"B{r}"] = area
    S(ws2, f"C{r}", color=GREEN, fmt=INT, border=True, align="center"); ws2[f"C{r}"] = f"={sref}"
    S(ws2, f"D{r}", color=BLUE, fmt=PCT, border=True, align="center", fill=INP); ws2[f"D{r}"] = eff
    S(ws2, f"E{r}", color=BLUE, fmt=NUM2, border=True, align="center", fill=INP); ws2[f"E{r}"] = turn
    S(ws2, f"F{r}", color=BLUE, fmt=YEN, border=True, align="center", fill=INP); ws2[f"F{r}"] = ryori
    S(ws2, f"G{r}", color=BLUE, fmt=YEN, border=True, align="center", fill=INP); ws2[f"G{r}"] = inryo
    S(ws2, f"H{r}", fmt=YEN, border=True, align="center"); ws2[f"H{r}"] = f"=F{r}+G{r}"
    S(ws2, f"I{r}", fmt=NUM1, border=True, align="center"); ws2[f"I{r}"] = f"=C{r}*D{r}*E{r}"
    S(ws2, f"J{r}", fmt=YEN, border=True); ws2[f"J{r}"] = f"=I{r}*H{r}"
    S(ws2, f"K{r}", fmt=MM, border=True); ws2[f"K{r}"] = f"=J{r}*$B$5/1000000"
    S(ws2, f"L{r}", fmt=PCT, border=True, align="center"); ws2[f"L{r}"] = f"=IF($K$26=0,0,K{r}/$K$26)"
    r += 1
R_G1 = r - 1          # 25
R_GT = r              # 26
S(ws2, f"A{R_GT}", bold=True, border=True); ws2[f"A{R_GT}"] = "合　計"
S(ws2, f"B{R_GT}", border=True, fill=TOT)
for c in ["C","D","E","F","G","H"]:
    S(ws2, f"{c}{R_GT}", border=True, fill=TOT)
S(ws2, f"I{R_GT}", bold=True, fmt=NUM1, border=True, align="center", fill=TOT)
ws2[f"I{R_GT}"] = f"=SUM(I{R_G0}:I{R_G1})"
S(ws2, f"J{R_GT}", bold=True, fmt=YEN, border=True, fill=TOT)
ws2[f"J{R_GT}"] = f"=SUM(J{R_G0}:J{R_G1})"
S(ws2, f"K{R_GT}", bold=True, fmt=MM, border=True, fill=KEY)
ws2[f"K{R_GT}"] = f"=SUM(K{R_G0}:K{R_G1})"
S(ws2, f"L{R_GT}", bold=True, fmt=PCT, border=True, align="center", fill=TOT)
ws2[f"L{R_GT}"] = f"=SUM(L{R_G0}:L{R_G1})"
S(ws2, f"N{R_G0}", size=9, color="7F7F7F")
ws2[f"N{R_G0}"] = "客単価は提出P&L準拠（ランチ4,000円＝料理3,000＋飲料1,000／ディナー15,000円＝料理9,000＋飲料6,000）"
S(ws2, f"N{R_G0+2}", size=9, color="7F7F7F")
ws2[f"N{R_G0+2}"] = "カフェ（アイドルタイム）はブーランジェリー併設を前提に1,500円で設定"
S(ws2, f"N{R_G0+4}", size=9, color="7F7F7F")
ws2[f"N{R_G0+4}"] = "テラスは天候・季節の影響を見て席効率50%。店内は提出P&Lの稼働率80%"

# ── 料理・飲料別 ──
sec(ws2, 28, "■ 料理・飲料別の年間売上（原価計算用）", "L")
S(ws2, "A29"); ws2["A29"] = "料理売上"
S(ws2, "B29", fmt=MM, border=True, align="center")
ws2["B29"] = f"=SUMPRODUCT(I{R_G0}:I{R_G1},F{R_G0}:F{R_G1})*$B$5/1000000"
S(ws2, "A30"); ws2["A30"] = "飲料売上"
S(ws2, "B30", fmt=MM, border=True, align="center")
ws2["B30"] = f"=SUMPRODUCT(I{R_G0}:I{R_G1},G{R_G0}:G{R_G1})*$B$5/1000000"
S(ws2, "A31", bold=True); ws2["A31"] = "合　計"
S(ws2, "B31", bold=True, fmt=MM, border=True, align="center", fill=TOT); ws2["B31"] = "=B29+B30"
S(ws2, "A32"); ws2["A32"] = "料理 構成比"
S(ws2, "B32", fmt=PCT, border=True, align="center"); ws2["B32"] = "=IF($B$31=0,0,B29/$B$31)"
S(ws2, "A33"); ws2["A33"] = "飲料 構成比"
S(ws2, "B33", fmt=PCT, border=True, align="center"); ws2["B33"] = "=IF($B$31=0,0,B30/$B$31)"
# B32 料理比 / B33 飲料比

# ── 参考指標 ──
sec(ws2, 35, "■ 参考指標", "L")
refs = [
    ("日商（円）",            f"=J{R_GT}",            YEN,  ""),
    ("月商（百万円）",        f"=K{R_GT}/12",         MM,   ""),
    ("年商（百万円・満年度）", f"=K{R_GT}",            MM,   "提出P&L：4.60億円"),
    ("1日あたり総客数（人）",  f"=I{R_GT}",            NUM1, ""),
    ("平均客単価（円）",      f"=IF(I{R_GT}=0,0,J{R_GT}/I{R_GT})", YEN, ""),
    ("延べ席回転率（回/日）",  f"=IF($B$16=0,0,I{R_GT}/$B$16)",     NUM2, "総客数 ÷ 総席数"),
    ("坪数（坪）",            55.5,                   NUM1, "183.59㎡"),
    ("坪売上（百万円/坪・年）", f"=IF(B42=0,0,K{R_GT}/B42)",        MM,   ""),
]
r = 36
for lab, f_, fmt, note in refs:
    S(ws2, f"A{r}"); ws2[f"A{r}"] = lab
    is_input = not isinstance(f_, str)
    S(ws2, f"B{r}", color=BLUE if is_input else BLACK, fmt=fmt, border=True,
      align="center", fill=INP if is_input else None)
    ws2[f"B{r}"] = f_
    S(ws2, f"N{r}", size=9, color="7F7F7F"); ws2[f"N{r}"] = note
    r += 1
# B42 坪数 / B43 坪売上

# ── 立上り別 年間売上 ──
sec(ws2, 45, "■ 立上りを織り込んだ年間売上（百万円）", "L")
for c, t in zip(["B","C","D","E"], ["満年度", "1年目", "2年目", "3年目以降"]):
    S(ws2, f"{c}46", bold=True, border=True, fill=TOT, align="center"); ws2[f"{c}46"] = t
S(ws2, "A46", bold=True, border=True, fill=TOT); ws2["A46"] = "項　目"
S(ws2, "A47"); ws2["A47"] = "立上り率"
S(ws2, "A48", bold=True); ws2["A48"] = "年間売上高"
RAMP = ["$B$8", "$B$6", "$B$7", "$B$8"]
for c, ramp in zip(["B","C","D","E"], RAMP):
    S(ws2, f"{c}47", fmt=PCT, border=True, align="center"); ws2[f"{c}47"] = f"={ramp}"
    S(ws2, f"{c}48", bold=True, fmt=MM, border=True, align="center", fill=KEY)
    ws2[f"{c}48"] = f"=$K${R_GT}*{c}47"
R_SALES = 48   # 売上前提!B48..E48

# ══════════════════════════════════════════════════════════
# 3. 経費前提
# ══════════════════════════════════════════════════════════
ws3 = wb.create_sheet("経費前提")
ws3.sheet_view.showGridLines = False
ws3.column_dimensions["A"].width = 32
for c in ["B","C","D"]: ws3.column_dimensions[c].width = 15
ws3.column_dimensions["E"].width = 3
ws3.column_dimensions["F"].width = 56

band(ws3, 1, "経費前提（水色セル＝入力値）", "F")
S(ws3, "A2", size=9, color="7F7F7F")
ws3["A2"] = "経費率は2026年8月3日提出P&L準拠。2年目以降は一括仕入・本部集中による改善を織り込む。"

sec(ws3, 4, "■ 売上原価の計算方法", "F")
S(ws3, "A5"); ws3["A5"] = "計算方法（1＝売上比一括／2＝料理・飲料別）"
S(ws3, "B5", color=BLUE, fmt=INT, border=True, align="center", fill=INP); ws3["B5"] = 1
S(ws3, "F5", size=9, color="7F7F7F")
ws3["F5"] = "1＝提出P&Lどおり売上高に原価率を乗じる。2＝料理・飲料それぞれの原価率で計算（直輸入ワインの効果を分けて見たい場合）"
R_METHOD = 5

sec(ws3, 7, "■ 経費率（対売上高）", "F")
for c, t in zip(["A","B","C","D"],
                ["費　目", "提出P&L水準\n（満年度・1年目）", "2年目", "3年目以降"]):
    S(ws3, f"{c}8", bold=True, border=True, fill=TOT, align="center", size=9, wrap=True)
    ws3[f"{c}8"] = t
ws3.row_dimensions[8].height = 32

RATES = [
    ("売上原価（方法1：売上比一括）", 0.295, 0.290, 0.285, "直輸入ワイン活用・複数店一括仕入"),
    ("　料理原価率（方法2）",        0.320, 0.319, 0.318, "方法2を選んだ場合のみ使用"),
    ("　飲料原価率（方法2）",        0.248, 0.2365, 0.225, "WineBank直輸入による低減余地が大きい"),
    ("人件費",                     0.345, 0.335, 0.325, "本部集中化・多能工化。人員26名"),
    ("業務委託費・消耗品他",         0.024, 0.022, 0.020, "本部集中購買・規格統一"),
    ("広告宣伝費・販売促進費",       0.014, 0.014, 0.014, "据置"),
    ("その他経費",                 0.005, 0.005, 0.005, "据置"),
    ("水道光熱費",                 0.040, 0.038, 0.036, "高効率厨房機器・営業時間最適化"),
    ("ロイヤリティ",               0.040, 0.040, 0.040, "契約条件（ブラッスリー4.0%）"),
    ("保険・租税公課",             0.007, 0.007, 0.007, "据置"),
    ("修繕維持費（FFE）",          0.025, 0.025, 0.025, "据置"),
]
R_R0 = 9
r = R_R0
for lab, a, b, c_, note in RATES:
    sub = lab.startswith("　")
    S(ws3, f"A{r}", border=True, size=9 if sub else 10,
      color="7F7F7F" if sub else BLACK); ws3[f"A{r}"] = lab
    for col, v in zip(["B","C","D"], [a, b, c_]):
        S(ws3, f"{col}{r}", color=BLUE, fmt=PCT2 if sub else PCT, border=True,
          align="center", fill=INP); ws3[f"{col}{r}"] = v
    S(ws3, f"F{r}", size=9, color="7F7F7F"); ws3[f"F{r}"] = note
    r += 1
R_COST1, R_RYORI, R_INRYO = R_R0, R_R0 + 1, R_R0 + 2          # 9,10,11
R_JIN, R_ITAKU, R_KOKOKU = R_R0 + 3, R_R0 + 4, R_R0 + 5        # 12,13,14
R_SONOTA, R_SUIDO, R_ROY = R_R0 + 6, R_R0 + 7, R_R0 + 8        # 15,16,17
R_HOKEN, R_SHUZEN = R_R0 + 9, R_R0 + 10                        # 18,19

r = R_SHUZEN + 1
S(ws3, f"A{r}", bold=True, border=True); ws3[f"A{r}"] = "変動費計（方法1ベース・対売上）"
for col in ["B","C","D"]:
    S(ws3, f"{col}{r}", bold=True, fmt=PCT, border=True, align="center", fill=TOT)
    ws3[f"{col}{r}"] = (f"={col}{R_COST1}+SUM({col}{R_JIN}:{col}{R_SHUZEN})")
R_VSUM = r   # 20

sec(ws3, 22, "■ 固定費・家賃条件", "F")
fixed = [
    ("地代家賃（固定）月額", 2.22, MM, "月222万円（提出P&L）"),
    ("地代家賃（固定）年額", None, MM, "＝月額×12"),
    ("歩合家賃率",          0.07, PCT, "閾値超過分に対して7%"),
    ("歩合家賃 閾値（年商）", 331.4, MM, "満年度の歩合家賃9百万円（対売上1.9%）から逆算"),
    ("人員数（名・参考）",   26,   INT, "提出P&L。人件費は売上比で計算"),
]
r = 23
for lab, v, f_, note in fixed:
    S(ws3, f"A{r}"); ws3[f"A{r}"] = lab
    is_input = v is not None
    S(ws3, f"B{r}", color=BLUE if is_input else BLACK, fmt=f_, border=True,
      align="center", fill=INP if is_input else None)
    ws3[f"B{r}"] = v if is_input else "=B23*12"
    S(ws3, f"F{r}", size=9, color="7F7F7F"); ws3[f"F{r}"] = note
    r += 1
R_RENT_M, R_RENT_Y, R_PCTRENT, R_THRESH, R_STAFF = 23, 24, 25, 26, 27

sec(ws3, 29, "■ 初期投資・減価償却（百万円）", "F")
inv = [
    ("契約金",                            10.0, "契約金3,000万円÷3店舗"),
    ("事業費（設計・内装施工・OSE/FF&E）", 194.0, ""),
    ("開業準備金（広告・採用等）",          4.0,  ""),
    ("保証金",                            39.0, "非償却・退去時返還対象"),
]
r = 30
for lab, v, note in inv:
    S(ws3, f"A{r}"); ws3[f"A{r}"] = lab
    S(ws3, f"B{r}", color=BLUE, fmt=MM, border=True, align="center", fill=INP); ws3[f"B{r}"] = v
    S(ws3, f"F{r}", size=9, color="7F7F7F"); ws3[f"F{r}"] = note
    r += 1
S(ws3, "A34", bold=True); ws3["A34"] = "初期投資　合計"
S(ws3, "B34", bold=True, fmt=MM, border=True, align="center", fill=KEY); ws3["B34"] = "=SUM(B30:B33)"
S(ws3, "A35", bold=True); ws3["A35"] = "償却対象資産（＝合計－保証金）"
S(ws3, "B35", bold=True, fmt=MM, border=True, align="center", fill=TOT); ws3["B35"] = "=B34-B33"
S(ws3, "A36"); ws3["A36"] = "償却年数（年）"
S(ws3, "B36", color=BLUE, fmt=NUM1, border=True, align="center", fill=INP); ws3["B36"] = 10.0
S(ws3, "A37", bold=True); ws3["A37"] = "年間減価償却費"
S(ws3, "B37", bold=True, fmt=MM, border=True, align="center", fill=TOT); ws3["B37"] = "=B35/B36"
R_INVTOT, R_DEPRE = 34, 37

sec(ws3, 39, "■ 分割払いスキーム（百万円）", "F")
sp = [("分割対象：内装工事費", 100.0, "月833千円 × 120回（10年）"),
      ("分割対象：保証金",      38.9, "月463千円 × 84回（7年）"),
      ("分割対象額　計",        None, ""),
      ("開業時 現金支出",       None, "＝初期投資合計 － 分割対象額"),
      ("年間分割弁済額",        15.6, "月額合計1,296千円 × 12か月")]
r = 40
for lab, v, note in sp:
    S(ws3, f"A{r}", bold=(v is None)); ws3[f"A{r}"] = lab
    is_input = v is not None
    S(ws3, f"B{r}", color=BLUE if is_input else BLACK, bold=(v is None), fmt=MM,
      border=True, align="center", fill=INP if is_input else TOT)
    if lab == "分割対象額　計":   ws3[f"B{r}"] = "=B40+B41"
    elif lab == "開業時 現金支出": ws3[f"B{r}"] = "=B34-B42"
    else:                        ws3[f"B{r}"] = v
    S(ws3, f"F{r}", size=9, color="7F7F7F"); ws3[f"F{r}"] = note
    r += 1
R_DEF, R_CASH, R_PAY = 42, 43, 44

# ══════════════════════════════════════════════════════════
# 4. 単店PL
# ══════════════════════════════════════════════════════════
ws4 = wb.create_sheet("単店PL")
ws4.sheet_view.showGridLines = False
ws4.column_dimensions["A"].width = 30
for c in ["B","C","D","E"]: ws4.column_dimensions[c].width = 14
ws4.column_dimensions["F"].width = 3
ws4.column_dimensions["G"].width = 44

band(ws4, 1, "六本木ミッドタウン店　単店PL（百万円）", "E")
S(ws4, "A2", size=9, color="7F7F7F")
ws4["A2"] = "科目は2026年8月3日提出P&Lのまま。売上は「売上前提」、経費率は「経費前提」に連動。金利・税金は含まない。"

COLS = ["B","C","D","E"]
RATECOL = ["B","B","C","D"]     # 満年度/1年目は提出P&L水準、2年目はC、3年目以降はD
for c, t in zip(COLS, ["満年度\n（提出P&L）", "1年目", "2年目", "3年目以降"]):
    S(ws4, f"{c}4", bold=True, border=True, fill=TOT, align="center", size=9, wrap=True)
    ws4[f"{c}4"] = t
S(ws4, "A4", bold=True, border=True, fill=TOT); ws4["A4"] = "科　目"
ws4.row_dimensions[4].height = 30

r = 5
S(ws4, f"A{r}"); ws4[f"A{r}"] = "立上り率"
for i, c in enumerate(COLS):
    S(ws4, f"{c}{r}", color=GREEN, fmt=PCT, border=True, align="center")
    ws4[f"{c}{r}"] = f"=売上前提!{c}47"
R_RAMP = r; r += 1

S(ws4, f"A{r}", bold=True, border=True); ws4[f"A{r}"] = "売上高"
for c in COLS:
    S(ws4, f"{c}{r}", bold=True, color=GREEN, fmt=MM, border=True)
    ws4[f"{c}{r}"] = f"=売上前提!{c}${R_SALES}"
R_REV = r; r += 1

for lab, ref in [("　うち 料理売上", "$B$32"), ("　うち 飲料売上", "$B$33")]:
    S(ws4, f"A{r}", size=9, color="7F7F7F", border=True); ws4[f"A{r}"] = lab
    for c in COLS:
        S(ws4, f"{c}{r}", size=9, color="7F7F7F", fmt=MM, border=True)
        ws4[f"{c}{r}"] = f"={c}${R_REV}*売上前提!{ref}"
    r += 1
R_RYORI_S, R_INRYO_S = R_REV + 1, R_REV + 2

PL = []
# 売上原価（方法切替）
S(ws4, f"A{r}", border=True); ws4[f"A{r}"] = "売上原価"
for c, rc in zip(COLS, RATECOL):
    S(ws4, f"{c}{r}", fmt=MM, border=True)
    ws4[f"{c}{r}"] = (f"=IF(経費前提!$B${R_METHOD}=1,{c}${R_REV}*経費前提!${rc}${R_COST1},"
                      f"{c}${R_RYORI_S}*経費前提!${rc}${R_RYORI}+{c}${R_INRYO_S}*経費前提!${rc}${R_INRYO})")
R_CGS = r; PL.append(("売上原価", r)); r += 1

def var_row(label, rate_row, size=10):
    global r
    S(ws4, f"A{r}", border=True, size=size); ws4[f"A{r}"] = label
    for c, rc in zip(COLS, RATECOL):
        S(ws4, f"{c}{r}", fmt=MM, border=True)
        ws4[f"{c}{r}"] = f"={c}${R_REV}*経費前提!${rc}${rate_row}"
    PL.append((label, r))
    r += 1
    return r - 1

R_JINK = var_row("人件費", R_JIN)
R_ITK  = var_row("業務委託費・消耗品他", R_ITAKU)

S(ws4, f"A{r}", bold=True, border=True); ws4[f"A{r}"] = "部門利益"
for c in COLS:
    S(ws4, f"{c}{r}", bold=True, fmt=MM, border=True, fill=TOT)
    ws4[f"{c}{r}"] = f"={c}{R_REV}-{c}{R_CGS}-{c}{R_JINK}-{c}{R_ITK}"
R_BUMON = r; PL.append(("部門利益", r)); r += 1

R_KOK = var_row("広告宣伝費・販売促進費", R_KOKOKU)
R_SON = var_row("その他経費", R_SONOTA)
R_SUI = var_row("水道光熱費", R_SUIDO)

S(ws4, f"A{r}", bold=True, border=True); ws4[f"A{r}"] = "GOP（店舗営業総利益）"
for c in COLS:
    S(ws4, f"{c}{r}", bold=True, fmt=MM, border=True, fill=TOT)
    ws4[f"{c}{r}"] = f"={c}{R_BUMON}-{c}{R_KOK}-{c}{R_SON}-{c}{R_SUI}"
R_GOP = r; PL.append(("GOP（店舗営業総利益）", r)); r += 1

R_ROYA = var_row("ロイヤリティ", R_ROY)
R_HOK  = var_row("保険・租税公課", R_HOKEN)

S(ws4, f"A{r}", border=True); ws4[f"A{r}"] = "地代家賃（固定）"
for c in COLS:
    S(ws4, f"{c}{r}", color=GREEN, fmt=MM, border=True)
    ws4[f"{c}{r}"] = f"=経費前提!$B${R_RENT_Y}"
R_RENT = r; PL.append(("地代家賃（固定）", r)); r += 1

S(ws4, f"A{r}", border=True); ws4[f"A{r}"] = "歩合家賃"
for c in COLS:
    S(ws4, f"{c}{r}", fmt=MM, border=True)
    ws4[f"{c}{r}"] = (f"=MAX(0,{c}{R_REV}-経費前提!$B${R_THRESH})*経費前提!$B${R_PCTRENT}")
R_PRENT = r; PL.append(("歩合家賃", r)); r += 1

R_SHU = var_row("修繕維持費（FFE）", R_SHUZEN)

S(ws4, f"A{r}", bold=True, border=True); ws4[f"A{r}"] = "EBITDA"
for c in COLS:
    S(ws4, f"{c}{r}", bold=True, fmt=MM, border=True, fill=KEY)
    ws4[f"{c}{r}"] = (f"={c}{R_GOP}-{c}{R_ROYA}-{c}{R_HOK}-{c}{R_RENT}-{c}{R_PRENT}-{c}{R_SHU}")
R_EBITDA = r; PL.append(("EBITDA", r)); r += 1

S(ws4, f"A{r}", border=True); ws4[f"A{r}"] = "減価償却費"
for c in COLS:
    S(ws4, f"{c}{r}", color=GREEN, fmt=MM, border=True)
    ws4[f"{c}{r}"] = f"=経費前提!$B${R_DEPRE}"
R_DEP = r; PL.append(("減価償却費", r)); r += 1

S(ws4, f"A{r}", bold=True, border=True); ws4[f"A{r}"] = "営業利益"
for c in COLS:
    S(ws4, f"{c}{r}", bold=True, fmt=MM, border=True, fill=KEY)
    ws4[f"{c}{r}"] = f"={c}{R_EBITDA}-{c}{R_DEP}"
R_OP = r; PL.append(("営業利益", r)); r += 2

# ── 対売上比 ──
sec(ws4, r, "■ 対売上比", "E")
r += 1
for c, t in zip(COLS, ["満年度", "1年目", "2年目", "3年目以降"]):
    S(ws4, f"{c}{r}", bold=True, border=True, fill=TOT, align="center"); ws4[f"{c}{r}"] = t
S(ws4, f"A{r}", bold=True, border=True, fill=TOT); ws4[f"A{r}"] = "科　目"
r += 1
for lab, src in [("売上高", R_REV)] + PL:
    hl = lab in ("EBITDA", "営業利益", "部門利益", "GOP（店舗営業総利益）")
    S(ws4, f"A{r}", border=True, bold=hl, size=10); ws4[f"A{r}"] = lab
    for c in COLS:
        S(ws4, f"{c}{r}", fmt=PCT, border=True, align="center", bold=hl,
          fill=KEY if lab in ("EBITDA", "営業利益") else (TOT if hl else None))
        ws4[f"{c}{r}"] = f"=IF({c}${R_REV}=0,0,{c}{src}/{c}${R_REV})"
    r += 1

S(ws4, f"G{R_EBITDA}", size=9, color=RED, bold=True)
ws4[f"G{R_EBITDA}"] = "提出P&L：満年度EBITDA 59百万円（12.8%）"
S(ws4, f"G{R_OP}", size=9, color=RED, bold=True)
ws4[f"G{R_OP}"] = "提出P&L：満年度 営業利益 38百万円（8.3%）"

# ══════════════════════════════════════════════════════════
# 5. 投資・CF
# ══════════════════════════════════════════════════════════
ws5 = wb.create_sheet("投資・CF")
ws5.sheet_view.showGridLines = False
ws5.column_dimensions["A"].width = 32
for c in ["B","C","D","E","F","G"]: ws5.column_dimensions[c].width = 13
ws5.column_dimensions["H"].width = 3
ws5.column_dimensions["I"].width = 50

band(ws5, 1, "初期投資・キャッシュフロー（百万円）", "G")
S(ws5, "A2", size=9, color="7F7F7F")
ws5["A2"] = "分割払いスキーム活用により、開業時の現金支出を247百万円 → 108百万円に圧縮。"

sec(ws5, 4, "■ 初期投資", "G")
r = 5
for lab, ref in [("契約金", 30), ("事業費（設計・内装施工・OSE/FF&E）", 31),
                 ("開業準備金（広告・採用等）", 32), ("保証金", 33)]:
    S(ws5, f"A{r}", border=True); ws5[f"A{r}"] = lab
    S(ws5, f"B{r}", color=GREEN, fmt=MM, border=True, align="center")
    ws5[f"B{r}"] = f"=経費前提!$B${ref}"
    r += 1
for lab, ref, hl in [("初期投資　合計", R_INVTOT, True), ("分割対象額", R_DEF, False),
                     ("開業時 現金支出", R_CASH, True), ("年間分割弁済額", R_PAY, False)]:
    S(ws5, f"A{r}", bold=hl, border=True); ws5[f"A{r}"] = lab
    S(ws5, f"B{r}", bold=hl, color=GREEN, fmt=MM, border=True, align="center",
      fill=KEY if hl else None)
    ws5[f"B{r}"] = f"=経費前提!$B${ref}"
    r += 1

sec(ws5, 14, "■ 単店キャッシュフロー推移", "G")
for c, t in zip(["B","C","D","E","F","G"], ["開業時", "1年目", "2年目", "3年目", "4年目", "5年目"]):
    S(ws5, f"{c}15", bold=True, border=True, fill=TOT, align="center"); ws5[f"{c}15"] = t
S(ws5, "A15", bold=True, border=True, fill=TOT); ws5["A15"] = "項　目"

EBCOL = [None, "C", "D", "E", "E", "E"]   # 単店PL の参照列（3年目以降は E）
YC = ["B","C","D","E","F","G"]
S(ws5, "A16", border=True); ws5["A16"] = "EBITDA"
for c, src in zip(YC, EBCOL):
    S(ws5, f"{c}16", color=GREEN if src else BLACK, fmt=MM, border=True, align="center")
    ws5[f"{c}16"] = (f"=単店PL!{src}{R_EBITDA}" if src else 0)
S(ws5, "A17", border=True); ws5["A17"] = "開業時 現金支出"
for i, c in enumerate(YC):
    S(ws5, f"{c}17", fmt=MM, border=True, align="center")
    ws5[f"{c}17"] = (f"=-経費前提!$B${R_CASH}" if i == 0 else 0)
S(ws5, "A18", border=True); ws5["A18"] = "分割弁済"
for i, c in enumerate(YC):
    S(ws5, f"{c}18", fmt=MM, border=True, align="center")
    ws5[f"{c}18"] = (0 if i == 0 else f"=-経費前提!$B${R_PAY}")
S(ws5, "A19", bold=True, border=True); ws5["A19"] = "単店FCF"
for c in YC:
    S(ws5, f"{c}19", bold=True, fmt=MM, border=True, align="center", fill=TOT)
    ws5[f"{c}19"] = f"={c}16+{c}17+{c}18"
S(ws5, "A20", bold=True, border=True); ws5["A20"] = "累計FCF"
for i, c in enumerate(YC):
    S(ws5, f"{c}20", bold=True, fmt=MM, border=True, align="center", fill=KEY)
    ws5[f"{c}20"] = f"={c}19" if i == 0 else f"={YC[i-1]}20+{c}19"

S(ws5, "A22", bold=True, size=10, color=RED)
ws5["A22"] = "※ 税金・運転資本の増減・借入返済・分割払いに係る金利相当は含まない簡易ベース。"
S(ws5, "A23", size=9, color="7F7F7F")
ws5["A23"] = "※ 保証金39百万円は退去時返還対象のため、実質的な投資回収はさらに短期になる。"

# ══════════════════════════════════════════════════════════
# 6. 感応度分析
# ══════════════════════════════════════════════════════════
ws6 = wb.create_sheet("感応度分析")
ws6.sheet_view.showGridLines = False
ws6.column_dimensions["A"].width = 26
for c in ["B","C","D","E","F","G"]: ws6.column_dimensions[c].width = 13
ws6.column_dimensions["H"].width = 3
ws6.column_dimensions["I"].width = 46

band(ws6, 1, "感応度分析　店内席効率 × ディナー店内回転率", "G")
S(ws6, "A2", size=9, color="7F7F7F")
ws6["A2"] = "満年度・提出P&L水準の経費率ベース。テラスとランチ・カフェの前提は「売上前提」のまま固定。"

EFFS = [0.60, 0.70, 0.80, 0.90, 1.00]
TURNS = [0.60, 0.70, 0.80, 0.90, 1.00]

# 日商(x,y) = 店内ランチ + 店内カフェ + 店内ディナー(回転率y) + テラス3行の日商
IN_FIX = (f"売上前提!$C$20*{{x}}*売上前提!$E$20*売上前提!$H$20"
          f"+売上前提!$C$22*{{x}}*売上前提!$E$22*売上前提!$H$22"
          f"+売上前提!$C$24*{{x}}*{{y}}*売上前提!$H$24")
TE_FIX = "(売上前提!$J$21+売上前提!$J$23+売上前提!$J$25)"
VSUM = f"経費前提!$B${R_VSUM}"

def sales_expr(xc, yc):
    return f"(({IN_FIX.format(x=xc, y=yc)})+{TE_FIX})*売上前提!$B$5/1000000"

def build_grid(top, title, metric):
    sec(ws6, top, title, "G")
    S(ws6, f"A{top+1}", bold=True, border=True, fill=TOT, align="center", size=9, wrap=True)
    ws6[f"A{top+1}"] = "店内席効率 ＼ ディナー回転率"
    ws6.row_dimensions[top+1].height = 28
    for j, tv in enumerate(TURNS):
        c = chr(ord("B") + j)
        S(ws6, f"{c}{top+1}", bold=True, border=True, fill=TOT, align="center", fmt=NUM2)
        ws6[f"{c}{top+1}"] = tv
    for i, ev in enumerate(EFFS):
        rr = top + 2 + i
        S(ws6, f"A{rr}", bold=True, border=True, fill=TOT, align="center", fmt=PCT)
        ws6[f"A{rr}"] = ev
        for j in range(len(TURNS)):
            c = chr(ord("B") + j)
            xc = f"$A{rr}"; yc = f"{c}${top+1}"
            s = sales_expr(xc, yc)
            if metric == "sales":
                f_ = f"={s}"; fmt = MM
            elif metric == "op":
                f_ = (f"=(({s})*(1-{VSUM})-経費前提!$B${R_RENT_Y}"
                      f"-MAX(0,({s})-経費前提!$B${R_THRESH})*経費前提!$B${R_PCTRENT}"
                      f"-経費前提!$B${R_DEPRE})")
                fmt = MM
            else:  # opm
                f_ = (f"=IF(({s})=0,0,(({s})*(1-{VSUM})-経費前提!$B${R_RENT_Y}"
                      f"-MAX(0,({s})-経費前提!$B${R_THRESH})*経費前提!$B${R_PCTRENT}"
                      f"-経費前提!$B${R_DEPRE})/({s}))")
                fmt = PCT
            S(ws6, f"{c}{rr}", fmt=fmt, border=True, align="center",
              fill=KEY if (abs(ev - 0.80) < 1e-9 and abs(TURNS[j] - 0.80) < 1e-9) else None)
            ws6[f"{c}{rr}"] = f_
    return top + 2 + len(EFFS)

nxt = build_grid(4, "■ 年間売上高（百万円）", "sales")
nxt = build_grid(nxt + 1, "■ 営業利益（百万円）", "op")
nxt = build_grid(nxt + 1, "■ 営業利益率", "opm")
S(ws6, f"A{nxt+1}", size=9, color="7F7F7F")
ws6[f"A{nxt+1}"] = "黄色セル＝現在の前提（店内席効率80%・ディナー店内回転率0.80）。"
S(ws6, f"A{nxt+2}", size=9, color="7F7F7F")
ws6[f"A{nxt+2}"] = "※ 地代家賃（固定）と減価償却費は売上に連動しないため、売上が伸びるほど利益率が加速的に改善する。"

# ══════════════════════════════════════════════════════════
# 1. サマリー（先頭）
# ══════════════════════════════════════════════════════════
ws1 = wb.create_sheet("サマリー", 0)
ws1.sheet_view.showGridLines = False
ws1.column_dimensions["A"].width = 30
for c in ["B","C","D","E"]: ws1.column_dimensions[c].width = 15
ws1.column_dimensions["F"].width = 3
ws1.column_dimensions["G"].width = 40

band(ws1, 1, "BRASSERIE Thierry Marx　六本木ミッドタウン店　事業収支", "E")
S(ws1, "A2", size=9, color="7F7F7F")
ws1["A2"] = "単位：百万円／2026年8月3日提出P&L準拠。183.59㎡(55.5坪)・年363日営業。水色セルを変えると全体が再計算されます。"

sec(ws1, 4, "■ よく変える前提（ここだけ変えれば全体が動きます）", "E")
S(ws1, "A5", size=9, color="7F7F7F")
ws1["A5"] = "詳細は「売上前提」シート。時間帯×エリアごとの席効率・回転率・客単価はそちらで個別に設定できます。"
quick = [
    ("総席数（店内＋テラス）", "=売上前提!$B$16", INT),
    ("　店内", "=売上前提!$B$14", INT),
    ("　テラス", "=売上前提!$B$15", INT),
    ("店内 席効率（ランチ）", "=売上前提!$D$20", PCT),
    ("ディナー 回転率（店内）", "=売上前提!$E$24", NUM2),
    ("客単価 ランチ", "=売上前提!$H$20", YEN),
    ("客単価 カフェ", "=売上前提!$H$22", YEN),
    ("客単価 ディナー", "=売上前提!$H$24", YEN),
    ("営業日数（日／年）", "=売上前提!$B$5", NUM1),
]
r = 6
for lab, f_, fmt in quick:
    S(ws1, f"A{r}", border=True, size=9 if lab.startswith("　") else 10,
      color="7F7F7F" if lab.startswith("　") else BLACK); ws1[f"A{r}"] = lab
    S(ws1, f"B{r}", color=GREEN, fmt=fmt, border=True, align="center"); ws1[f"B{r}"] = f_
    r += 1

sec(ws1, 16, "■ 単店PL サマリー", "E")
for c, t in zip(["B","C","D","E"], ["満年度", "1年目", "2年目", "3年目以降"]):
    S(ws1, f"{c}17", bold=True, border=True, fill=TOT, align="center"); ws1[f"{c}17"] = t
S(ws1, "A17", bold=True, border=True, fill=TOT); ws1["A17"] = "項　目"
summ = [("売上高", R_REV, MM, False), ("部門利益", R_BUMON, MM, False),
        ("GOP（店舗営業総利益）", R_GOP, MM, False),
        ("EBITDA", R_EBITDA, MM, True), ("営業利益", R_OP, MM, True)]
r = 18
for lab, src, fmt, hl in summ:
    S(ws1, f"A{r}", bold=hl, border=True); ws1[f"A{r}"] = lab
    for c in ["B","C","D","E"]:
        S(ws1, f"{c}{r}", bold=hl, color=GREEN, fmt=fmt, border=True, align="center",
          fill=KEY if hl else None)
        ws1[f"{c}{r}"] = f"=単店PL!{c}{src}"
    r += 1
for lab, src in [("　EBITDA率", R_EBITDA), ("　営業利益率", R_OP)]:
    S(ws1, f"A{r}", bold=True, border=True); ws1[f"A{r}"] = lab
    for c in ["B","C","D","E"]:
        S(ws1, f"{c}{r}", bold=True, fmt=PCT, border=True, align="center", fill=KEY)
        ws1[f"{c}{r}"] = f"=IF(単店PL!{c}{R_REV}=0,0,単店PL!{c}{src}/単店PL!{c}{R_REV})"
    r += 1

sec(ws1, 26, "■ 売上の内訳（満年度）", "E")
for c, t in zip(["B","C","D"], ["年間売上", "構成比", "1日客数"]):
    S(ws1, f"{c}27", bold=True, border=True, fill=TOT, align="center"); ws1[f"{c}27"] = t
S(ws1, "A27", bold=True, border=True, fill=TOT); ws1["A27"] = "時間帯 × エリア"
r = 28
for i in range(6):
    src = R_G0 + i
    S(ws1, f"A{r}", border=True, size=9)
    ws1[f"A{r}"] = f'=売上前提!A{src}&"　"&売上前提!B{src}'
    S(ws1, f"B{r}", color=GREEN, fmt=MM, border=True, align="center"); ws1[f"B{r}"] = f"=売上前提!K{src}"
    S(ws1, f"C{r}", fmt=PCT, border=True, align="center"); ws1[f"C{r}"] = f"=売上前提!L{src}"
    S(ws1, f"D{r}", fmt=NUM1, border=True, align="center"); ws1[f"D{r}"] = f"=売上前提!I{src}"
    r += 1
S(ws1, f"A{r}", bold=True, border=True); ws1[f"A{r}"] = "合　計"
S(ws1, f"B{r}", bold=True, color=GREEN, fmt=MM, border=True, align="center", fill=KEY)
ws1[f"B{r}"] = f"=売上前提!K{R_GT}"
S(ws1, f"C{r}", bold=True, fmt=PCT, border=True, align="center", fill=TOT)
ws1[f"C{r}"] = f"=売上前提!L{R_GT}"
S(ws1, f"D{r}", bold=True, fmt=NUM1, border=True, align="center", fill=TOT)
ws1[f"D{r}"] = f"=売上前提!I{R_GT}"
r += 2

sec(ws1, r, "■ 投資回収", "E")
r += 1
for lab, ref, fmt in [("初期投資 合計", f"=経費前提!$B${R_INVTOT}", MM),
                      ("開業時 現金支出（分割払い活用後）", f"=経費前提!$B${R_CASH}", MM),
                      ("定常期の年間FCF", "=投資・CF!E19", MM),
                      ("累計FCFの黒字転換", "=投資・CF!E20", MM)]:
    S(ws1, f"A{r}", border=True); ws1[f"A{r}"] = lab
    S(ws1, f"B{r}", color=GREEN, fmt=fmt, border=True, align="center"); ws1[f"B{r}"] = ref
    r += 1
S(ws1, f"A{r+1}", bold=True, size=10, color=RED)
ws1[f"A{r+1}"] = "→ 開業3年目に累計FCFが黒字転換（投資回収 約2.8年）。"

# ── 仕上げ ──
if "Sheet" in wb.sheetnames:
    del wb["Sheet"]
SHEETS = ["サマリー", "売上前提", "経費前提", "単店PL", "投資・CF", "感応度分析"]
for sh in wb.worksheets:
    for row in sh.iter_rows():
        for c in row:
            if isinstance(c.value, str) and c.value.startswith("="):
                f = c.value
                for nm in SHEETS:
                    f = f.replace(f"'{nm}'!", f"{nm}!")
                for nm in SHEETS:
                    f = f.replace(f"{nm}!", f"'{nm}'!")
                c.value = f
wb.calculation.fullCalcOnLoad = True
wb.save(OUT)
print("saved:", OUT)
