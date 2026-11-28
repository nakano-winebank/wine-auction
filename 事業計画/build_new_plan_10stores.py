# -*- coding: utf-8 -*-
"""BTM 新事業計画（10店舗：ブラッスリー9店＋余市オーベルジュ1）月次PL・CF

- 期間：2026年11月〜2032年9月（9月決算 FY2027〜FY2032）
- ブラッスリーの単店収支は統合モデル v8（20261109）準拠
- 六本木の開業前は「開業までの資金繰り_20261121」の月次実額（万円→百万円）
- 余市オーベルジュは別タブ。前提値は「オーベルジュスレッド」の数値を入力（未入力＝0で連結に反映）
単位：百万円
"""
import datetime as dt
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter as CL

OUT = "BTM_新事業計画_10店舗_余市オーベルジュ_月次PLCF_20261128.xlsx"

# ── 期間 ──
START = dt.date(2026, 11, 1)
N = 71  # 2026/11〜2032/9
def mdate(j):
    y, m = START.year, START.month + j
    y += (m - 1) // 12
    m = (m - 1) % 12 + 1
    return dt.date(y, m, 1)
DATES = [mdate(j) for j in range(N)]
FC = 4  # 月次の先頭列（D）
def col(j): return CL(FC + j)
FYS = list(range(2027, 2033))
def fy_of(d): return d.year + (1 if d.month >= 10 else 0)
FYCOLS = {fy: [j for j, d in enumerate(DATES) if fy_of(d) == fy] for fy in FYS}
def fy_range(fy, row, sheet=None):
    js = FYCOLS[fy]
    p = f"'{sheet}'!" if sheet else ""
    return f"SUM({p}{col(js[0])}{row}:{col(js[-1])}{row})"
def sep_col(fy): return col(FYCOLS[fy][-1])

# ── スタイル ──
NAVY = "1F2A44"
F_T = Font(name="Meiryo UI", size=14, bold=True, color=NAVY)
F_B = Font(name="Meiryo UI", size=9, bold=True)
F_N = Font(name="Meiryo UI", size=9)
F_S = Font(name="Meiryo UI", size=8, color="666666")
F_IN = Font(name="Meiryo UI", size=9, color="0000CC")
F_H = Font(name="Meiryo UI", size=9, bold=True, color="FFFFFF")
FILL_H = PatternFill("solid", fgColor=NAVY)
FILL_IN = PatternFill("solid", fgColor="DDEBF7")
FILL_WAIT = PatternFill("solid", fgColor="FFF2CC")
FILL_SUB = PatternFill("solid", fgColor="F2F2F2")
FILL_KEY = PatternFill("solid", fgColor="E2EFDA")
THIN = Side(style="thin", color="BFBFBF")
B_TOP = Border(top=Side(style="thin", color="000000"))
NUM = '#,##0.0;[Red]-#,##0.0;"-"'
PCT = '0.0%'

wb = Workbook()

def title(ws, t, sub):
    ws["A1"] = t; ws["A1"].font = F_T
    ws["A2"] = sub; ws["A2"].font = F_S

def month_header(ws, r=3):
    ws.cell(r, 1, "年月").font = F_H
    ws.cell(r + 1, 1, "決算期").font = F_H
    ws.cell(r + 2, 1, "月").font = F_H
    for c in range(1, FC + N):
        for rr in (r, r + 1, r + 2):
            ws.cell(rr, c).fill = FILL_H
            ws.cell(rr, c).font = F_H
            ws.cell(rr, c).alignment = Alignment(horizontal="center")
    for j, d in enumerate(DATES):
        c = ws.cell(r, FC + j, d); c.number_format = "yyyy/m"
        ws.cell(r + 1, FC + j, f"=YEAR({col(j)}{r})+IF(MONTH({col(j)}{r})>=10,1,0)").number_format = '"FY"0'
        ws.cell(r + 2, FC + j, f"=MONTH({col(j)}{r})")
    ws.column_dimensions["A"].width = 34
    ws.column_dimensions["B"].width = 12
    ws.column_dimensions["C"].width = 10
    for j in range(N):
        ws.column_dimensions[col(j)].width = 8.2
    ws.freeze_panes = ws.cell(r + 3, FC)

def put_row(ws, r, label, fn, bold=False, fill=None, note=None, fmt=NUM, border=False):
    a = ws.cell(r, 1, label); a.font = F_B if bold else F_N
    if note: ws.cell(r, 2, note).font = F_S
    for j in range(N):
        v = fn(j)
        c = ws.cell(r, FC + j, v)
        c.number_format = fmt
        c.font = F_B if bold else F_N
        if fill: c.fill = fill
        if border: c.border = B_TOP
    if fill: ws.cell(r, 1).fill = fill
    if border: ws.cell(r, 1).border = B_TOP

def section(ws, r, label):
    ws.cell(r, 1, label).font = Font(name="Meiryo UI", size=9, bold=True, color=NAVY)

# ════════════════════════ 前提 ════════════════════════
P = wb.active; P.title = "前提"
title(P, "前提（水色＝入力値・単位：百万円）", "ブラッスリーの単店収支は統合モデルv8（2026/11/09）準拠。ここを変えると店舗別・月次PL・月次CF・サマリーが再計算されます。")
P.column_dimensions["A"].width = 42
for c in "BCDE": P.column_dimensions[c].width = 12
P.column_dimensions["F"].width = 70
A = {}
r = 4
def inp(label, key, val, note="", fmt=NUM, cols=None):
    global r
    P.cell(r, 1, label).font = F_N
    vals = val if isinstance(val, list) else [val]
    for k, v in enumerate(vals):
        c = P.cell(r, 3 + k, v); c.font = F_IN; c.fill = FILL_IN; c.number_format = fmt
    if note: P.cell(r, 6, note).font = F_S
    A[key] = f"前提!$C${r}"
    if len(vals) > 1:
        A[key + "_2"] = f"前提!$D${r}"; A[key + "_3"] = f"前提!$E${r}"
    r += 1

def hdr(label, cols=None):
    global r
    P.cell(r, 1, label).font = Font(name="Meiryo UI", size=10, bold=True, color=NAVY)
    if cols:
        for k, t in enumerate(cols):
            P.cell(r, 3 + k, t).font = F_B
    r += 1

hdr("■ 売上（ブラッスリー1店舗）")
inp("満年度売上（年・百万円）", "base", 409.68, "v8：108席・日商112.9万円×363日。全店同規模と仮定")
inp("立上り率 1年目（開業1〜12か月）", "r1", 0.9, fmt=PCT)
inp("立上り率 2年目（13〜24か月）", "r2", 0.98, fmt=PCT)
inp("立上り率 3年目以降", "r3", 1.0, fmt=PCT)
hdr("■ 季節指数（月別・12か月平均＝1.00）")
SEASON = [0.88, 0.88, 1.00, 1.00, 1.02, 0.95, 1.00, 0.92, 0.95, 1.03, 1.05, 1.32]
season_top = r
for m in range(12):
    inp(f"{m+1}月", f"s{m+1}", SEASON[m], "12月はクリスマス・忘年会、1〜2月は閑散" if m == 11 else "", fmt="0.00")
A["season"] = f"前提!$C${season_top}:$C${season_top+11}"
P.cell(r, 1, "平均（1.00であること）").font = F_S
P.cell(r, 3, f"=AVERAGE(C{season_top}:C{season_top+11})").number_format = "0.000"
r += 1

hdr("■ 経費率（対売上）", ["1年目", "2年目", "3年目以降"])
COSTS = [
    ("cogs", "売上原価", [0.305, 0.305, 0.305], "料理28%・飲料35%（料理65:飲料35）"),
    ("labor", "人件費", [0.345, 0.335, 0.325], "v8：人件費改善レバー"),
    ("outs", "業務委託費・消耗品他", [0.024, 0.022, 0.020], ""),
    ("adv", "広告宣伝費・販売促進費", [0.014, 0.014, 0.014], ""),
    ("oth", "その他経費", [0.005, 0.005, 0.005], ""),
    ("util", "水道光熱費", [0.040, 0.038, 0.036], ""),
    ("roy", "ロイヤリティ", [0.04, 0.04, 0.04], "ブランド使用契約 4.0%"),
    ("ins", "保険・租税公課", [0.007, 0.007, 0.007], ""),
    ("ffe", "修繕維持費（FFE）", [0.025, 0.025, 0.025], ""),
]
for k, lab, v, note in COSTS:
    inp(lab, k, v, note, fmt=PCT)
hdr("■ 家賃（1店舗）")
inp("地代家賃（固定・月額）", "rent", 2.22, "六本木：月222万円。新店も同水準と仮定")
inp("歩合家賃率", "ovr", 0.07, "年商の閾値超過分に対して", fmt=PCT)
inp("歩合家賃 閾値（年商）", "ovr_th", 331.4, "月次では1/12で判定")

hdr("■ 新店の投資（2号店以降・1店舗あたり）")
inp("事業費（設計・内装・OSE/FF&E）総額", "capex", 194.25, "55.5坪×350万円")
inp("　うち 家主立替（開業後120回返済）", "ll_int", 100.0, "")
inp("　自己負担の前払割合（開業3か月前）", "pre_pct", 0.3, "残り70%は開業月に支払", fmt=PCT)
inp("保証金", "dep", 39.0, "")
inp("　うち 分割（開業後84回）", "dep_split", 38.9, "残り0.1は開業月に支払")
inp("内装立替の返済（月額）", "ll_m", 0.833, "1億円÷120回")
inp("保証金の分割払い（月額）", "dep_m", 0.463, "38.9÷84回")
inp("開業前費用（採用・研修・広告・レセプション）", "preop", 15.0, "開業3か月前〜前月に1/3ずつ費用計上。六本木は実額（約49百万円）")
inp("ワイン在庫（開業前月）", "wine", 10.0, "棚卸資産（費用にしない）")
inp("契約金（4号店以降・1店舗）", "fee4", 5.0, "契約金：3店舗3,000万円（六本木で支払済）／以下7店舗3,500万円")
inp("償却年数（月）", "dep_life", 120, "事業費＋契約金を10年で償却", fmt="0")

hdr("■ 本部費（決算期ごとの年額・2027年5月から月割）", ["年額"])
hq_top = r
for fy, v in zip(FYS, [15, 28, 40, 48, 55, 60]):
    inp(f"FY{fy}（{fy-1}/10〜{fy}/9）", f"hq{fy}", v, "v8の本部費（FY2032は仮置き60）" if fy == 2032 else ("開業月から計上" if fy == 2027 else ""))
A["hq_range"] = f"前提!$C${hq_top}:$C${hq_top+5}"
inp("本部費の計上開始月", "hq_start", dt.date(2027, 5, 1), "", fmt="yyyy/m")

hdr("■ 資金・税金")
inp("期首現金（2026年10月末）", "cash0", 20.1, "資本金10万＋P3払込2,000万")
inp("売上の当月入金率", "coll", 0.7, "カード等の残りは翌月入金", fmt=PCT)
inp("最低手元資金", "buffer", 30.0, "これを下回る月に「追加資金調達（要手当）」を自動計上")
inp("追加資金調達の金利（年）", "rate", 0.02, "借入と仮定した場合の金利。返済は織り込まない", fmt=PCT)
inp("法人税等 実効税率", "tax", 0.34, "繰越欠損金を控除。9月決算・11月納付", fmt=PCT)

# ════════════════════════ 出店計画 ════════════════════════
S = wb.create_sheet("出店計画")
title(S, "出店計画（10店舗：ブラッスリー9店＋余市オーベルジュ1）", "開業月＝営業開始月。六本木は2027年4月下旬オープン（4月は開業前扱い・売上は5月から）。水色＝入力。")
heads = ["No", "店舗", "区分・候補", "開業月", "事業費\n総額", "うち\n家主立替", "自己負担", "保証金", "うち分割", "契約金", "ワイン在庫", "開業前費用", "初期投資\n計", "新店\nフラグ", "月間償却"]
widths = [5, 26, 30, 10, 9, 9, 9, 9, 9, 9, 9, 9, 9, 7, 9]
for k, (h, w) in enumerate(zip(heads, widths)):
    c = S.cell(4, 1 + k, h); c.font = F_H; c.fill = FILL_H
    c.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
    S.column_dimensions[CL(1 + k)].width = w
S.row_dimensions[4].height = 30
STORES = [  # (No, 名称, 区分, 開業月, 契約金)
    (1, "1号店 六本木ミッドタウン", "ブラッスリー（2027年4月下旬オープン）", dt.date(2027, 5, 1)),
    (2, "2号店", "ブラッスリー（2028年秋）候補：札幌／大阪", dt.date(2028, 10, 1)),
    (3, "3号店", "ブラッスリー（2029年夏）", dt.date(2029, 7, 1)),
    (4, "4号店", "ブラッスリー（2029年冬）", dt.date(2029, 12, 1)),
    (6, "6号店", "ブラッスリー（2030年秋）", dt.date(2030, 10, 1)),
    (7, "7号店", "ブラッスリー（2031年春）", dt.date(2031, 4, 1)),
    (8, "8号店", "ブラッスリー（2031年秋）", dt.date(2031, 10, 1)),
    (9, "9号店", "ブラッスリー（2032年春）", dt.date(2032, 4, 1)),
    (10, "10号店", "ブラッスリー（2032年夏）", dt.date(2032, 7, 1)),
]
NS = len(STORES)
S_TOP = 5
for i, (no, name, kind, od) in enumerate(STORES):
    rr = S_TOP + i
    S.cell(rr, 1, no); S.cell(rr, 2, name); S.cell(rr, 3, kind)
    c = S.cell(rr, 4, od); c.number_format = "yyyy/m"; c.font = F_IN; c.fill = FILL_IN
    for cc in range(5, 16):
        S.cell(rr, cc).number_format = NUM
    if i == 0:
        for cc, v in [(5, 194.25), (6, 100), (8, 39), (9, 38.9), (10, 30), (11, 50)]:
            c = S.cell(rr, cc, v); c.font = F_IN; c.fill = FILL_IN
        S.cell(rr, 14, 0)
    else:
        S.cell(rr, 5, f"={A['capex']}"); S.cell(rr, 6, f"={A['ll_int']}")
        S.cell(rr, 8, f"={A['dep']}"); S.cell(rr, 9, f"={A['dep_split']}")
        S.cell(rr, 10, 0 if no <= 3 else f"={A['fee4']}")
        S.cell(rr, 11, f"={A['wine']}"); S.cell(rr, 12, f"={A['preop']}")
        S.cell(rr, 14, 1)
    S.cell(rr, 7, f"=E{rr}-F{rr}")
    S.cell(rr, 13, f"=E{rr}+H{rr}+J{rr}+K{rr}+L{rr}")
    S.cell(rr, 15, f"=(E{rr}+J{rr})/{A['dep_life']}")
    for cc in range(1, 16):
        if not (cc == 4 or (i == 0 and cc in (5, 6, 8, 9, 10, 11))):
            S.cell(rr, cc).font = F_N
AUB_ROW = S_TOP + NS
S.cell(AUB_ROW, 1, 5); S.cell(AUB_ROW, 2, "5号店 余市オーベルジュ"); S.cell(AUB_ROW, 3, "オーベルジュ（2030年）ホテル分譲。数値は「余市オーベルジュ」タブ")
c = S.cell(AUB_ROW, 4, "='余市オーベルジュ'!C5"); c.number_format = "yyyy/m"
for cc in range(1, 16): S.cell(AUB_ROW, cc).fill = FILL_WAIT
TOT = AUB_ROW + 1
S.cell(TOT, 2, "ブラッスリー9店 計").font = F_B
for cc in range(5, 14):
    if cc == 14: continue
    c = S.cell(TOT, cc, f"=SUM({CL(cc)}{S_TOP}:{CL(cc)}{S_TOP+NS-1})"); c.number_format = NUM; c.font = F_B; c.border = B_TOP
notes = [
    "※ 六本木：事業費1億9,425万円のうち家主立替1億円（月83.3万円×120回）、保証金3,890万円は月46.3万円×84回。契約金30百万円（1回目15はDES済・2回目15は2027年5月）。",
    "※ 六本木の開業前費用は開業前人件費・開業準備・HP・フランス研修・初期在庫・レセプション・予備費等の実額（「月次PL」の入力行）。",
    "※ 新店：家主立替・保証金分割は六本木と同条件と仮定（物件ごとに要交渉）。自己負担94.25のうち30%を開業3か月前、70%を開業月に支払。",
    "※ 契約金：ブランド使用契約は10店舗分。最初の3店舗分3,000万円は六本木で支払済のため2・3号店は0、4号店以降は1店舗500万円。オーベルジュは契約金の対象外と仮定（要確認）。",
    "※ 店舗No.5（余市オーベルジュ）は出店順で5番目。ブラッスリーの店名は出店順の通し番号。",
]
for k, t in enumerate(notes):
    S.cell(TOT + 2 + k, 1, t).font = F_S

# ════════════════════════ 余市オーベルジュ（前提＋月次） ════════════════════════
Y = wb.create_sheet("余市オーベルジュ")
Y["A1"] = "余市オーベルジュ（ホテル分譲）"; Y["A1"].font = F_T
Y["A2"] = ("黄色＝オーベルジュスレッド（「裏口上場と余市オーベルジュ構想」）のシミュレーション数値を入力する欄。"
           "未入力のあいだは0として連結に反映されます（数値を入れると月次PL・月次CF・サマリーに自動反映）。")
Y["A2"].font = Font(name="Meiryo UI", size=9, bold=True, color="C00000")
Y.column_dimensions["A"].width = 34; Y.column_dimensions["B"].width = 12; Y.column_dimensions["C"].width = 12
YA = {}
yr = 4
def yinp(label, key, val=None, note="", fmt=NUM):
    global yr
    Y.cell(yr, 1, label).font = F_N
    c = Y.cell(yr, 3, val); c.fill = FILL_WAIT; c.font = F_IN; c.number_format = fmt
    if note: Y.cell(yr, 4, note).font = F_S
    YA[key] = f"'余市オーベルジュ'!$C${yr}"
    yr += 1
Y.cell(yr, 1, "■ 前提（入力待ち）").font = Font(name="Meiryo UI", size=10, bold=True, color=NAVY); yr += 1
yinp("開業月（引渡し・営業開始）", "open", dt.date(2030, 7, 1), "2030年（月は要確認・仮に7月）", fmt="yyyy/m")
yinp("客室数（室）", "rooms", None, "", fmt="0")
yinp("うち 分譲する室数（室）", "sold", None, "", fmt="0")
yinp("分譲価格（1室あたり・百万円）", "price", None, "")
yinp("手付金の割合", "dep_pct", None, "残金は引渡し（開業月）に受領", fmt=PCT)
yinp("手付金の受領時期（開業の何か月前）", "dep_lead", None, "", fmt="0")
yinp("土地取得費（百万円）", "land", None, "")
yinp("土地の支払時期（開業の何か月前）", "land_lead", None, "", fmt="0")
yinp("建築費（百万円）", "build", None, "")
yinp("工期（月）", "period", None, "開業前月までの工期中に均等払い", fmt="0")
yinp("FF&E・備品（百万円）", "ffe", None, "開業前月に支払")
yinp("土地・建築のうち分譲室に配賦する割合", "alloc", None, "分譲原価＝（土地＋建築）×この割合", fmt=PCT)
yinp("自社保有分（共用部・レストラン等）の償却年数", "life", None, "", fmt="0")
yinp("開業前費用（百万円）", "preop", None, "開業3か月前〜前月に1/3ずつ")
yinp("ADR（客室単価・円）", "adr", None, "", fmt="#,##0")
yinp("客室稼働率", "occ", None, "", fmt=PCT)
yinp("客室売上のオーナー配分率（分譲室分）", "owner", None, "分譲室の客室売上×この率をオーナーへ配分", fmt=PCT)
yinp("レストラン 1日の客数（人）", "fb_pax", None, "宿泊客＋外来", fmt="0")
yinp("レストラン 客単価（円）", "fb_avg", None, "", fmt="#,##0")
yinp("飲食原価率", "fb_cogs", None, "", fmt=PCT)
yinp("人件費（月額・百万円）", "labor", None, "")
yinp("その他経費率（対売上）", "oth", None, "水光熱・消耗品・広告・OTA手数料等", fmt=PCT)
yinp("管理費・運営受託料（オーナーから・月額・百万円）", "mgmt", None, "")
yinp("営業日数（日／年）", "days", 365, "", fmt="0")
yr += 1
Y.cell(yr, 1, "分譲総額（百万円）").font = F_B
Y.cell(yr, 3, f"=N({YA['sold']})*N({YA['price']})").number_format = NUM
YA["sales_total"] = f"'余市オーベルジュ'!$C${yr}"; yr += 1
Y.cell(yr, 1, "総事業費（土地＋建築＋FF&E＋開業前）").font = F_B
Y.cell(yr, 3, f"=N({YA['land']})+N({YA['build']})+N({YA['ffe']})+N({YA['preop']})").number_format = NUM; yr += 1
yr += 1
YM = yr  # 月次ヘッダー行
month_header(Y, YM)
Y.column_dimensions["A"].width = 34
YR = {}
Y.freeze_panes = None
yrow = YM + 3
def yrowput(key, label, fn, bold=False, fill=None, border=False, note=None):
    global yrow
    put_row(Y, yrow, label, fn, bold=bold, fill=fill, border=border, note=note)
    YR[key] = yrow; yrow += 1
def V(k): return f"N({YA[k]})"
def cK(j): return f"{col(j)}${YR['k']}"
yrowput("k", "開業からの月数（1＝開業月）",
        lambda j: f"=(YEAR({col(j)}${YM})-YEAR({YA['open']}))*12+MONTH({col(j)}${YM})-MONTH({YA['open']})+1", note="")
for c in range(FC, FC + N): Y.cell(YR["k"], c).number_format = "0"
section(Y, yrow, "■ 運営（宿泊・レストラン）"); yrow += 1
yrowput("room", "客室売上", lambda j: f"=IF({cK(j)}>=1,{V('rooms')}*{V('occ')}*{V('adr')}*{V('days')}/12/1000000,0)")
yrowput("fb", "レストラン売上", lambda j: f"=IF({cK(j)}>=1,{V('fb_pax')}*{V('fb_avg')}*{V('days')}/12/1000000,0)")
yrowput("mg", "管理費・運営受託料", lambda j: f"=IF({cK(j)}>=1,{V('mgmt')},0)")
yrowput("rev", "運営売上 計", lambda j: f"=SUM({col(j)}{YR['room']}:{col(j)}{YR['mg']})", bold=True, border=True)
yrowput("own", "オーナー配分", lambda j: f"=IF({V('rooms')}=0,0,{col(j)}{YR['room']}*{V('sold')}/{V('rooms')}*{V('owner')})")
yrowput("fbc", "飲食原価", lambda j: f"={col(j)}{YR['fb']}*{V('fb_cogs')}")
yrowput("lab", "人件費", lambda j: f"=IF({cK(j)}>=1,{V('labor')},0)")
yrowput("oth", "その他経費", lambda j: f"={col(j)}{YR['rev']}*{V('oth')}")
yrowput("pre", "開業前費用", lambda j: f"=IF(AND({cK(j)}>=-2,{cK(j)}<=0),{V('preop')}/3,0)")
yrowput("opex", "営業費用 計", lambda j: f"=SUM({col(j)}{YR['own']}:{col(j)}{YR['pre']})", bold=True, border=True)
yrowput("ebitda", "運営EBITDA", lambda j: f"={col(j)}{YR['rev']}-{col(j)}{YR['opex']}", bold=True, fill=FILL_KEY)
section(Y, yrow, "■ 分譲"); yrow += 1
yrowput("ssale", "分譲売上（引渡し時に計上）", lambda j: f"=IF({cK(j)}=1,{YA['sales_total']},0)")
yrowput("scost", "分譲原価", lambda j: f"=IF({cK(j)}=1,({V('land')}+{V('build')})*{V('alloc')},0)")
yrowput("sprof", "分譲利益", lambda j: f"={col(j)}{YR['ssale']}-{col(j)}{YR['scost']}", bold=True, fill=FILL_KEY)
yrowput("dep", "減価償却費（自社保有分）",
        lambda j: f"=IF(AND({cK(j)}>=1,{V('life')}>0),({V('build')}*(1-{V('alloc')})+{V('ffe')})/({V('life')}*12),0)")
section(Y, yrow, "■ キャッシュフロー"); yrow += 1
yrowput("c_land", "土地の支払", lambda j: f"=IF({cK(j)}=1-{V('land_lead')},{V('land')},0)")
yrowput("c_build", "建築費の支払", lambda j: f"=IF(AND({V('period')}>0,{cK(j)}>=1-{V('period')},{cK(j)}<=0),{V('build')}/{V('period')},0)")
yrowput("c_ffe", "FF&Eの支払", lambda j: f"=IF({cK(j)}=0,{V('ffe')},0)")
yrowput("c_dep", "分譲代金 手付金の受領", lambda j: f"=IF({cK(j)}=1-{V('dep_lead')},{YA['sales_total']}*{V('dep_pct')},0)")
yrowput("c_bal", "分譲代金 残金の受領", lambda j: f"=IF({cK(j)}=1,{YA['sales_total']}*(1-{V('dep_pct')}),0)")
yrowput("c_net", "オーベルジュ CF（運営EBITDA＋分譲代金－建設支出）",
        lambda j: f"={col(j)}{YR['ebitda']}+{col(j)}{YR['c_dep']}+{col(j)}{YR['c_bal']}-{col(j)}{YR['c_land']}-{col(j)}{YR['c_build']}-{col(j)}{YR['c_ffe']}",
        bold=True, border=True)
yrowput("c_cum", "累計", lambda j: f"={col(j)}{YR['c_net']}" if j == 0 else f"={col(j-1)}{yrow}+{col(j)}{YR['c_net']}")
# 年次（右端）
YC0 = FC + N + 1
for k, fy in enumerate(FYS):
    c = Y.cell(YM, YC0 + k, f"FY{fy}"); c.font = F_H; c.fill = FILL_H
    Y.column_dimensions[CL(YC0 + k)].width = 9
    for key in ["room", "fb", "mg", "rev", "own", "fbc", "lab", "oth", "pre", "opex", "ebitda", "ssale", "scost", "sprof", "dep", "c_land", "c_build", "c_ffe", "c_dep", "c_bal", "c_net"]:
        cc = Y.cell(YR[key], YC0 + k, "=" + fy_range(fy, YR[key])); cc.number_format = NUM; cc.font = F_B
Y.cell(YM + 1, YC0, "年次合計").font = F_B

# ════════════════════════ 店舗別（ブラッスリー） ════════════════════════
T = wb.create_sheet("店舗別売上")
title(T, "店舗別（ブラッスリー9店）：開業からの月数・売上・歩合家賃", "売上＝満年度売上÷12×季節指数×立上り率（開業1〜12か月90%・13〜24か月98%・以降100%）")
month_header(T, 3)
TR = {}
trow = 7
section(T, trow, "■ 開業からの月数（1＝開業月。マイナス＝開業前）"); trow += 1
K0 = trow
for i, st in enumerate(STORES):
    rr = K0 + i
    T.cell(rr, 1, st[1]).font = F_N
    c = T.cell(rr, 2, f"='出店計画'!D{S_TOP+i}"); c.number_format = "yyyy/m"
    for j in range(N):
        cc = T.cell(rr, FC + j, f"=(YEAR({col(j)}$3)-YEAR($B{rr}))*12+MONTH({col(j)}$3)-MONTH($B{rr})+1")
        cc.number_format = "0"; cc.font = F_S
K1 = K0 + NS - 1
trow = K1 + 2
section(T, trow, "■ 売上高"); trow += 1
SL0 = trow
for i, st in enumerate(STORES):
    rr = SL0 + i
    T.cell(rr, 1, st[1]).font = F_N
    kr = K0 + i
    for j in range(N):
        k = f"{col(j)}{kr}"
        f = (f"=IF({k}>=1,{A['base']}/12*INDEX({A['season']},{col(j)}$5)"
             f"*IF({k}<=12,{A['r1']},IF({k}<=24,{A['r2']},{A['r3']})),0)")
        cc = T.cell(rr, FC + j, f); cc.number_format = NUM; cc.font = F_N
SL1 = SL0 + NS - 1
trow = SL1 + 2
section(T, trow, "■ 歩合家賃（閾値の1/12を超えた分×7%）"); trow += 1
OV0 = trow
for i, st in enumerate(STORES):
    rr = OV0 + i
    T.cell(rr, 1, st[1]).font = F_N
    for j in range(N):
        cc = T.cell(rr, FC + j, f"=IF({col(j)}{K0+i}>=1,MAX(0,{col(j)}{SL0+i}-{A['ovr_th']}/12)*{A['ovr']},0)")
        cc.number_format = NUM; cc.font = F_N
OV1 = OV0 + NS - 1
trow = OV1 + 2
section(T, trow, "■ 集計（月次PL・月次CFが参照）"); trow += 1
def kr(j): return f"{col(j)}${K0}:{col(j)}${K1}"
def sr(j): return f"{col(j)}${SL0}:{col(j)}${SL1}"
FLAG = f"'出店計画'!$N${S_TOP}:$N${S_TOP+NS-1}"
FEE = f"'出店計画'!$J${S_TOP}:$J${S_TOP+NS-1}"
DEPM = f"'出店計画'!$O${S_TOP}:$O${S_TOP+NS-1}"
AGG = [
    ("sales", "売上高 計", lambda j: f"=SUM({sr(j)})"),
    ("y1", "　うち 開業1年目の店舗", lambda j: f"=SUMPRODUCT(({kr(j)}>=1)*({kr(j)}<=12)*{sr(j)})"),
    ("y2", "　うち 開業2年目の店舗", lambda j: f"=SUMPRODUCT(({kr(j)}>=13)*({kr(j)}<=24)*{sr(j)})"),
    ("y3", "　うち 開業3年目以降の店舗", lambda j: f"=SUMPRODUCT(({kr(j)}>=25)*{sr(j)})"),
    ("ovr", "歩合家賃 計", lambda j: f"=SUM({col(j)}{OV0}:{col(j)}{OV1})"),
    ("n", "営業店舗数", lambda j: f"=COUNTIF({kr(j)},\">=1\")"),
    ("capex", "新店 事業費（自己負担）", lambda j: f"=SUMPRODUCT(({kr(j)}=-2)*{FLAG})*({A['capex']}-{A['ll_int']})*{A['pre_pct']}+SUMPRODUCT(({kr(j)}=1)*{FLAG})*({A['capex']}-{A['ll_int']})*(1-{A['pre_pct']})"),
    ("preop", "新店 開業前費用", lambda j: f"=SUMPRODUCT(({kr(j)}>=-2)*({kr(j)}<=0)*{FLAG})*{A['preop']}/3"),
    ("wine", "新店 ワイン在庫", lambda j: f"=SUMPRODUCT(({kr(j)}=0)*{FLAG})*{A['wine']}"),
    ("fee", "新店 契約金", lambda j: f"=SUMPRODUCT(({kr(j)}=1)*{FLAG}*{FEE})"),
    ("depo", "新店 保証金（開業時支払分）", lambda j: f"=SUMPRODUCT(({kr(j)}=1)*{FLAG})*({A['dep']}-{A['dep_split']})"),
    ("llrep", "内装立替の返済（全店）", lambda j: f"=SUMPRODUCT(({kr(j)}>=1)*({kr(j)}<=120))*{A['ll_m']}"),
    ("deprep", "保証金の分割払い（全店）", lambda j: f"=SUMPRODUCT(({kr(j)}>=1)*({kr(j)}<=84))*{A['dep_m']}"),
    ("da", "減価償却費（全店）", lambda j: f"=SUMPRODUCT(({kr(j)}>=1)*({kr(j)}<={A['dep_life']})*{DEPM})"),
]
for key, lab, fn in AGG:
    put_row(T, trow, lab, fn, bold=(key in ("sales", "n")))
    if key == "n":
        for c in range(FC, FC + N): T.cell(trow, c).number_format = "0"
    TR[key] = trow; trow += 1
def TA(key, j): return f"'店舗別売上'!{col(j)}{TR[key]}"

# 六本木の開業前（万円→百万円）
RPP_PREOP = [2.137, 2.937, 3.737, 8.296, 7.127, 25.249]  # 11月〜4月
RPP_CAPEX = [0, 4.614, 13.843, 23.072, 13.843, 36.916]
RPP_VAT = [0, 0.461, 1.384, 2.307, 1.384, 3.692, 1.5]     # 11月〜5月
VAT_REFUND_J = 12  # 2027年11月（FY2027申告）
def arr(lst, j): return lst[j] if j < len(lst) else 0

# ════════════════════════ 月次PL ════════════════════════
L = wb.create_sheet("月次PL")
title(L, "月次損益計算書（連結・百万円）", "ブラッスリー9店＋余市オーベルジュ。9月決算（FY2027＝2026/10〜2027/9）。税抜。")
month_header(L, 3)
LR = {}
lrow = 7
def lput(key, label, fn, **kw):
    global lrow
    put_row(L, lrow, label, fn, **kw); LR[key] = lrow; lrow += 1
def Lc(key, j): return f"{col(j)}{LR[key]}"
def ratio3(key, j):
    return f"={TA('y1',j)}*{A[key]}+{TA('y2',j)}*{A[key+'_2']}+{TA('y3',j)}*{A[key+'_3']}"
lput("n", "営業店舗数（ブラッスリー）", lambda j: f"={TA('n',j)}", note="店")
lput("na", "営業店舗数（オーベルジュ）", lambda j: f"=IF('余市オーベルジュ'!{col(j)}{YR['k']}>=1,1,0)", note="店")
for k in ("n", "na"):
    for c in range(FC, FC + N): L.cell(LR[k], c).number_format = "0"
section(L, lrow, "■ 売上"); lrow += 1
lput("s_b", "売上高 ブラッスリー", lambda j: f"={TA('sales',j)}")
lput("s_a", "売上高 オーベルジュ（宿泊・レストラン・管理費）", lambda j: f"='余市オーベルジュ'!{col(j)}{YR['rev']}")
lput("s_s", "分譲売上（オーベルジュ）", lambda j: f"='余市オーベルジュ'!{col(j)}{YR['ssale']}")
lput("sales", "売上高 計", lambda j: f"=SUM({Lc('s_b',j)}:{Lc('s_s',j)})", bold=True, border=True, fill=FILL_SUB)
section(L, lrow, "■ ブラッスリー 店舗経費"); lrow += 1
labels = {"cogs": "売上原価", "labor": "人件費", "outs": "業務委託費・消耗品他", "adv": "広告宣伝費・販売促進費",
          "oth": "その他経費", "util": "水道光熱費", "roy": "ロイヤリティ", "ins": "保険・租税公課", "ffe": "修繕維持費（FFE）"}
for key in ["cogs", "labor", "outs", "adv", "oth", "util", "roy", "ins", "ffe"]:
    lput(key, labels[key], lambda j, key=key: ratio3(key, j))
lput("rent", "地代家賃（固定）", lambda j: f"={TA('n',j)}*{A['rent']}")
lput("ovr", "歩合家賃", lambda j: f"={TA('ovr',j)}")
lput("e_b", "店舗EBITDA ブラッスリー", lambda j: f"={Lc('s_b',j)}-SUM({Lc('cogs',j)}:{Lc('ovr',j)})", bold=True, border=True, fill=FILL_KEY)
section(L, lrow, "■ オーベルジュ"); lrow += 1
lput("a_opex", "オーベルジュ 営業費用（開業前費用含む）", lambda j: f"='余市オーベルジュ'!{col(j)}{YR['opex']}")
lput("e_a", "オーベルジュ 運営EBITDA", lambda j: f"={Lc('s_a',j)}-{Lc('a_opex',j)}", bold=True)
lput("a_scost", "分譲原価", lambda j: f"='余市オーベルジュ'!{col(j)}{YR['scost']}")
lput("e_s", "分譲利益", lambda j: f"={Lc('s_s',j)}-{Lc('a_scost',j)}", bold=True)
section(L, lrow, "■ 本部・開業前"); lrow += 1
lput("pre_r", "開業前費用 六本木（実額）", lambda j: arr(RPP_PREOP, j), note="資金繰り表")
for j in range(len(RPP_PREOP)):
    L.cell(LR["pre_r"], FC + j).font = F_IN; L.cell(LR["pre_r"], FC + j).fill = FILL_IN
lput("pre_n", "開業前費用 新店", lambda j: f"={TA('preop',j)}")
lput("hq", "本部費", lambda j: f"=IF({col(j)}$3>={A['hq_start']},INDEX({A['hq_range']},{col(j)}$4-2026)/12,0)")
lput("ebitda", "連結EBITDA", lambda j: f"={Lc('e_b',j)}+{Lc('e_a',j)}+{Lc('e_s',j)}-{Lc('pre_r',j)}-{Lc('pre_n',j)}-{Lc('hq',j)}",
     bold=True, border=True, fill=FILL_KEY)
lput("da_b", "減価償却費 ブラッスリー（契約金償却含む）", lambda j: f"={TA('da',j)}")
lput("da_a", "減価償却費 オーベルジュ", lambda j: f"='余市オーベルジュ'!{col(j)}{YR['dep']}")
lput("op", "営業利益", lambda j: f"={Lc('ebitda',j)}-{Lc('da_b',j)}-{Lc('da_a',j)}", bold=True, border=True, fill=FILL_SUB)
lput("int", "支払利息（追加資金調達分）", lambda j: "=0" if j == 0 else f"='月次CF'!{col(j-1)}{{FUNDBAL}}*{A['rate']}/12")
lput("pbt", "税引前利益", lambda j: f"={Lc('op',j)}-{Lc('int',j)}", bold=True)
lput("tax", "法人税等（9月に計上）", lambda j: (f"='サマリー'!{{TAXCOL{fy_of(DATES[j])}}}" if DATES[j].month == 9 else "=0"))
lput("ni", "当期純利益", lambda j: f"={Lc('pbt',j)}-{Lc('tax',j)}", bold=True, border=True, fill=FILL_KEY)
lput("ni_cum", "純利益 累計", lambda j: f"={Lc('ni',j)}" if j == 0 else f"={col(j-1)}{LR['ni_cum'] if 'ni_cum' in LR else lrow}+{Lc('ni',j)}")
# fix ni_cum self reference
for j in range(1, N):
    L.cell(LR["ni_cum"], FC + j, f"={col(j-1)}{LR['ni_cum']}+{Lc('ni',j)}")
lput("ebitda_pct", "EBITDA率（対売上）", lambda j: f"=IF({Lc('sales',j)}=0,0,{Lc('ebitda',j)}/{Lc('sales',j)})", fmt=PCT)

# ════════════════════════ 月次CF ════════════════════════
C = wb.create_sheet("月次CF")
title(C, "月次キャッシュフロー（連結・百万円）", "売上は当月70%・翌月30%入金、原価は翌月払い、その他経費は当月払い。手元資金が最低水準を下回る月に「追加資金調達（要手当）」を自動計上。")
month_header(C, 3)
CR = {}
crow = 7
def cput(key, label, fn, **kw):
    global crow
    put_row(C, crow, label, fn, **kw); CR[key] = crow; crow += 1
def Cc(key, j): return f"{col(j)}{CR[key]}"
def PL(key, j): return f"'月次PL'!{col(j)}{LR[key]}"
cput("open", "期首現金", lambda j: f"={A['cash0']}" if j == 0 else "=0", bold=True)
section(C, crow, "■ 営業活動"); crow += 1
cput("in_b", "売上入金 ブラッスリー", lambda j: f"={PL('s_b',j)}*{A['coll']}" + ("" if j == 0 else f"+'月次PL'!{col(j-1)}{LR['s_b']}*(1-{A['coll']})"))
cput("in_a", "売上入金 オーベルジュ運営", lambda j: f"={PL('s_a',j)}")
cput("o_cogs", "原価の支払（翌月）", lambda j: "=0" if j == 0 else f"=-'月次PL'!{col(j-1)}{LR['cogs']}")
cput("o_opex", "店舗経費の支払（人件費・家賃・ロイヤリティ等）", lambda j: f"=-SUM({PL('labor',j)}:{PL('ovr',j)})")
cput("o_a", "オーベルジュ 営業費用の支払", lambda j: f"=-{PL('a_opex',j)}")
cput("o_pre", "開業前費用の支払", lambda j: f"=-{PL('pre_r',j)}-{PL('pre_n',j)}")
cput("o_hq", "本部費の支払", lambda j: f"=-{PL('hq',j)}")
cput("o_int", "支払利息", lambda j: f"=-{PL('int',j)}")
cput("o_tax", "法人税等の納付（11月）",
     lambda j: (f"=-'サマリー'!{{TAXCOL{fy_of(DATES[j])-1}}}" if DATES[j].month == 11 and fy_of(DATES[j]) - 1 >= 2027 else "=0"))
cput("o_vat", "消費税（六本木の投資分）支払・還付",
     lambda j: (-arr(RPP_VAT, j) if j < len(RPP_VAT) else (sum(RPP_VAT) if j == VAT_REFUND_J else 0)),
     note="還付は課税事業者選択が前提")
for j in list(range(len(RPP_VAT))) + [VAT_REFUND_J]:
    C.cell(CR["o_vat"], FC + j).font = F_IN; C.cell(CR["o_vat"], FC + j).fill = FILL_IN
cput("cfo", "営業CF 計", lambda j: f"=SUM({Cc('in_b',j)}:{Cc('o_vat',j)})", bold=True, border=True, fill=FILL_SUB)
section(C, crow, "■ 投資活動（ブラッスリー）"); crow += 1
cput("i_rcap", "六本木 事業費（自己負担）", lambda j: -arr(RPP_CAPEX, j), note="資金繰り表")
for j in range(len(RPP_CAPEX)):
    C.cell(CR["i_rcap"], FC + j).font = F_IN; C.cell(CR["i_rcap"], FC + j).fill = FILL_IN
cput("i_ncap", "新店 事業費（自己負担）", lambda j: f"=-{TA('capex',j)}")
cput("i_fee", "契約金（六本木2回目・新店）", lambda j: (-15 if DATES[j] == dt.date(2027, 5, 1) else 0), note="")
for j in range(N):
    C.cell(CR["i_fee"], FC + j, (f"=-15-{TA('fee',j)}" if DATES[j] == dt.date(2027, 5, 1) else f"=-{TA('fee',j)}"))
    C.cell(CR["i_fee"], FC + j).number_format = NUM
cput("i_dep", "保証金（開業時支払分）", lambda j: f"=-{TA('depo',j)}")
cput("i_wine", "ワイン・美術品在庫", lambda j: (f"=-50-{TA('wine',j)}" if DATES[j] == dt.date(2027, 4, 1) else f"=-{TA('wine',j)}"))
cput("cfi", "投資CF 計（ブラッスリー）", lambda j: f"=SUM({Cc('i_rcap',j)}:{Cc('i_wine',j)})", bold=True, border=True, fill=FILL_SUB)
section(C, crow, "■ 余市オーベルジュ 分譲事業"); crow += 1
cput("a_land", "土地・建築・FF&Eの支払", lambda j: f"=-('余市オーベルジュ'!{col(j)}{YR['c_land']}+'余市オーベルジュ'!{col(j)}{YR['c_build']}+'余市オーベルジュ'!{col(j)}{YR['c_ffe']})")
cput("a_in", "分譲代金の受領（手付金・残金）", lambda j: f"='余市オーベルジュ'!{col(j)}{YR['c_dep']}+'余市オーベルジュ'!{col(j)}{YR['c_bal']}")
cput("cfa", "分譲事業CF 計", lambda j: f"={Cc('a_land',j)}+{Cc('a_in',j)}", bold=True, border=True, fill=FILL_SUB)
section(C, crow, "■ 財務活動"); crow += 1
EQ = [("eq_lc", "出資 Land＆Company（134株×15万円）", {0: 20.1}, "11/13着金済"),
      ("eq_1201", "出資 12/1ラウンド（66株×16万円×2名）", {1: 21.12}, "池上様・城戸様"),
      ("eq_1215", "出資 12/15ラウンド（67株×15万円×3名＋33株）", {1: 35.1}, "小林様・見原様・新規1名・中野"),
      ("eq_p3", "出資 WineBank P3（150株×10万円）", {3: 15.0}, "2月末")]
for key, lab, vals, note in EQ:
    cput(key, lab, lambda j, vals=vals: vals.get(j, 0), note=note)
    for j in vals:
        C.cell(CR[key], FC + j).font = F_IN; C.cell(CR[key], FC + j).fill = FILL_IN
cput("f_ll", "内装立替の返済（家主）", lambda j: f"=-{TA('llrep',j)}")
cput("f_dep", "保証金の分割払い", lambda j: f"=-{TA('deprep',j)}")
cput("pre", "調達前の現金残高", lambda j: f"={Cc('open',j)}+{Cc('cfo',j)}+{Cc('cfi',j)}+{Cc('cfa',j)}+SUM({Cc('eq_lc',j)}:{Cc('f_dep',j)})", fill=FILL_SUB)
cput("fund", "追加資金調達（要手当：借入・増資）", lambda j: f"=MAX(0,{A['buffer']}-{Cc('pre',j)})", bold=True, fill=FILL_WAIT)
cput("cff", "財務CF 計", lambda j: f"=SUM({Cc('eq_lc',j)}:{Cc('f_dep',j)})+{Cc('fund',j)}", bold=True, border=True, fill=FILL_SUB)
cput("close", "期末現金", lambda j: f"={Cc('pre',j)}+{Cc('fund',j)}", bold=True, border=True, fill=FILL_KEY)
cput("fundbal", "追加資金調達 累計残高", lambda j: f"={Cc('fund',j)}" if j == 0 else "=0", bold=True)
for j in range(1, N):
    C.cell(CR["fundbal"], FC + j, f"={col(j-1)}{CR['fundbal']}+{Cc('fund',j)}")
    C.cell(CR["open"], FC + j, f"={col(j-1)}{CR['close']}")
cput("net", "参考：当月の資金収支（調達前）", lambda j: f"={Cc('pre',j)}-{Cc('open',j)}")

# 支払利息の参照先を埋める
for j in range(1, N):
    L.cell(LR["int"], FC + j, f"='月次CF'!{col(j-1)}{CR['fundbal']}*{A['rate']}/12")

# ════════════════════════ サマリー ════════════════════════
M = wb.create_sheet("サマリー", 0)
title(M, "BTM 新事業計画（10店舗）年次サマリー（百万円）",
      "2027年4月 六本木 → 2028年秋 2号店 → 2029年夏・冬 → 2030年 2店（うち1店 余市オーベルジュ）→ 2031年 2店 → 2032年 2店。9月決算。")
M.column_dimensions["A"].width = 40; M.column_dimensions["B"].width = 4
hdrs = [f"FY{fy}" for fy in FYS] + ["6期累計"]
for k, h in enumerate(hdrs):
    c = M.cell(4, 3 + k, h); c.font = F_H; c.fill = FILL_H; c.alignment = Alignment(horizontal="center")
    M.column_dimensions[CL(3 + k)].width = 11
c = M.cell(4, 1, "科目"); c.font = F_H; c.fill = FILL_H; M.cell(4, 2).fill = FILL_H
M.cell(5, 1, "期間").font = F_S
for k, fy in enumerate(FYS):
    M.cell(5, 3 + k, f"{'2026/11' if fy == 2027 else str(fy-1)+'/10'}〜{fy}/9").font = F_S
    M.cell(5, 3 + k).alignment = Alignment(horizontal="center")
MR = {}
mrow = 6
def mput(key, label, fn, bold=False, fill=None, fmt=NUM, total=True, border=False):
    global mrow
    M.cell(mrow, 1, label).font = F_B if bold else F_N
    for k, fy in enumerate(FYS):
        c = M.cell(mrow, 3 + k, fn(fy)); c.number_format = fmt; c.font = F_B if bold else F_N
        if fill: c.fill = fill
        if border: c.border = B_TOP
    if total:
        c = M.cell(mrow, 3 + len(FYS), f"=SUM(C{mrow}:{CL(2+len(FYS))}{mrow})"); c.number_format = fmt; c.font = F_B
        if fill: c.fill = fill
    if fill: M.cell(mrow, 1).fill = fill
    MR[key] = mrow; mrow += 1
def msec(t):
    global mrow
    M.cell(mrow, 1, t).font = Font(name="Meiryo UI", size=10, bold=True, color=NAVY); mrow += 1
def LS(key, fy): return "=" + fy_range(fy, LR[key], "月次PL")
def CS(key, fy): return "=" + fy_range(fy, CR[key], "月次CF")

msec("■ 店舗数（期末）")
mput("n_b", "ブラッスリー", lambda fy: f"='月次PL'!{sep_col(fy)}{LR['n']}", fmt="0", total=False)
mput("n_a", "余市オーベルジュ", lambda fy: f"='月次PL'!{sep_col(fy)}{LR['na']}", fmt="0", total=False)
mput("n", "合計", lambda fy: f"={CL(3+FYS.index(fy))}{MR['n_b']}+{CL(3+FYS.index(fy))}{MR['n_a']}", bold=True, fmt="0", total=False)
msec("■ 損益")
for key, lab, b, fill in [("s_b", "売上高 ブラッスリー", False, None), ("s_a", "売上高 オーベルジュ運営", False, None),
                          ("s_s", "分譲売上（オーベルジュ）", False, None), ("sales", "売上高 計", True, FILL_SUB),
                          ("e_b", "店舗EBITDA ブラッスリー", False, None), ("e_a", "オーベルジュ 運営EBITDA", False, None),
                          ("e_s", "分譲利益", False, None), ("pre_r", "開業前費用 六本木", False, None),
                          ("pre_n", "開業前費用 新店", False, None), ("hq", "本部費", False, None),
                          ("ebitda", "連結EBITDA", True, FILL_KEY), ("da_b", "減価償却費 ブラッスリー", False, None),
                          ("da_a", "減価償却費 オーベルジュ", False, None), ("op", "営業利益", True, FILL_SUB),
                          ("int", "支払利息", False, None), ("pbt", "税引前利益", True, None)]:
    mput(key, lab, lambda fy, key=key: LS(key, fy), bold=b, fill=fill)
# 税金計算
mput("nol_open", "繰越欠損金（期首）", lambda fy: "=0" if fy == 2027 else f"=MAX(0,{CL(2+FYS.index(fy))}{{NOLOPEN}}-{CL(2+FYS.index(fy))}{MR['pbt']})", total=False)
for k, fy in enumerate(FYS):
    if fy > 2027:
        M.cell(MR["nol_open"], 3 + k, f"=MAX(0,{CL(2+k)}{MR['nol_open']}-{CL(2+k)}{MR['pbt']})")
mput("taxable", "課税所得（繰越欠損金控除後）", lambda fy: f"=MAX(0,{CL(3+FYS.index(fy))}{MR['pbt']}-{CL(3+FYS.index(fy))}{MR['nol_open']})")
mput("tax", "法人税等", lambda fy: f"={CL(3+FYS.index(fy))}{MR['taxable']}*{A['tax']}")
mput("ni", "当期純利益", lambda fy: f"={CL(3+FYS.index(fy))}{MR['pbt']}-{CL(3+FYS.index(fy))}{MR['tax']}", bold=True, fill=FILL_KEY)
mput("ebitda_pct", "連結EBITDA率", lambda fy: f"=IF({CL(3+FYS.index(fy))}{MR['sales']}=0,0,{CL(3+FYS.index(fy))}{MR['ebitda']}/{CL(3+FYS.index(fy))}{MR['sales']})", fmt=PCT, total=False)
k6 = 3 + len(FYS)
M.cell(MR["ebitda_pct"], k6, f"=IF({CL(k6)}{MR['sales']}=0,0,{CL(k6)}{MR['ebitda']}/{CL(k6)}{MR['sales']})").number_format = PCT
msec("■ キャッシュフロー")
mput("cfo", "営業CF", lambda fy: CS("cfo", fy))
mput("cfi", "投資CF（ブラッスリー）", lambda fy: CS("cfi", fy))
mput("cfa", "分譲事業CF（オーベルジュ）", lambda fy: CS("cfa", fy))
mput("eq", "出資", lambda fy: "=" + "+".join(fy_range(fy, CR[k], "月次CF") for k in ("eq_lc", "eq_1201", "eq_1215", "eq_p3")))
mput("fl", "家主立替返済・保証金分割", lambda fy: "=" + fy_range(fy, CR["f_ll"], "月次CF") + "+" + fy_range(fy, CR["f_dep"], "月次CF"))
mput("fund", "追加資金調達（要手当）", lambda fy: CS("fund", fy), bold=True, fill=FILL_WAIT)
mput("close", "期末現金", lambda fy: f"='月次CF'!{sep_col(fy)}{CR['close']}", bold=True, fill=FILL_KEY, total=False)
mput("fundbal", "追加資金調達 累計残高（期末）", lambda fy: f"='月次CF'!{sep_col(fy)}{CR['fundbal']}", bold=True, total=False)
mrow += 1
M.cell(mrow, 1, "追加資金調達の合計（6期）").font = F_B
c = M.cell(mrow, 3, f"=MAX('月次CF'!{col(0)}{CR['fundbal']}:{col(N-1)}{CR['fundbal']})"); c.number_format = NUM; c.font = F_B; c.fill = FILL_WAIT
MR["fundmax"] = mrow; mrow += 1
M.cell(mrow, 1, "月次の最低現金残高（調達前）").font = F_N
c = M.cell(mrow, 3, f"=MIN('月次CF'!{col(0)}{CR['pre']}:{col(N-1)}{CR['pre']})"); c.number_format = NUM
mrow += 2
notes = [
    "【読み方】",
    "・追加資金調達（要手当）＝手元資金が最低水準（前提シート：30百万円）を下回らないために必要な額。借入・増資のどちらで手当てするかは未定（金利2%で支払利息を計上、返済は未織込み）。",
    "・余市オーベルジュは「余市オーベルジュ」タブの黄色欄（オーベルジュスレッドの数値）を入力すると、分譲売上・分譲代金・建設支出・運営収支が自動で連結に入ります。現在は未入力（0）。",
    "・六本木の開業前（2026/11〜2027/5）は「開業までの資金繰り_20261121」の月次実額。出資は確定分（L&C 2,010万・12/1 2,112万・12/15 3,510万・P3 1,500万）。",
    "・ブラッスリーの単店収支は統合モデルv8（満年度売上409.7・立上り90%/98%/100%）。季節指数で月別に配分。消費税は六本木の投資分のみ（還付は課税事業者選択が前提）。",
    "【要確認】",
    "1. 余市オーベルジュの前提（室数・分譲価格・分譲室数・土地・建築費・工期・ADR・稼働率・オーナー配分・開業月）",
    "2. オーベルジュの実施主体（BTM本体か別会社か）と、ブランド使用契約の契約金・ロイヤリティの対象になるか",
    "3. 新店の家主立替・保証金分割が六本木と同条件で取れるか（取れない場合は1店あたり約1.4億円の追加資金）",
    "4. 2号店以降の出店地と物件条件（売上規模を六本木と同じと仮定）",
]
for t in notes:
    M.cell(mrow, 1, t).font = F_B if t.startswith("【") else F_S; mrow += 1

# プレースホルダーの置換（税金セル・繰越欠損・利息）
TAXCOLS = {fy: f"{CL(3+FYS.index(fy))}{MR['tax']}" for fy in FYS}
for ws in (L, C):
    for row in ws.iter_rows():
        for c in row:
            if isinstance(c.value, str) and "{TAXCOL" in c.value:
                for fy, ref in TAXCOLS.items():
                    c.value = c.value.replace("{TAXCOL%d}" % fy, ref)
            if isinstance(c.value, str) and "{FUNDBAL}" in c.value:
                c.value = c.value.replace("{FUNDBAL}", str(CR["fundbal"]))

# 出店計画：六本木の開業前費用（実額合計）
S.cell(S_TOP, 12, f"=SUM('月次PL'!{col(0)}{LR['pre_r']}:{col(5)}{LR['pre_r']})")

# 年次合計（月次PL・月次CFの右端）
for ws, rows in ((L, LR), (C, CR)):
    c0 = FC + N + 1
    for k, fy in enumerate(FYS):
        h = ws.cell(3, c0 + k, f"FY{fy}"); h.font = F_H; h.fill = FILL_H; h.alignment = Alignment(horizontal="center")
        ws.column_dimensions[CL(c0 + k)].width = 9.5
        for key, rr in rows.items():
            if key in ("n", "na", "open", "close", "fundbal", "ni_cum", "pre", "ebitda_pct"):
                v = f"={sep_col(fy)}{rr}"
                if key == "open":
                    v = f"={col(FYCOLS[fy][0])}{rr}"
            else:
                v = "=" + fy_range(fy, rr)
            cc = ws.cell(rr, c0 + k, v); cc.font = F_B
            cc.number_format = "0" if key in ("n", "na") else (PCT if key == "ebitda_pct" else NUM)
    ws.cell(4, c0, "年次（右端）").font = F_H
    if ws is L:
        for k in range(len(FYS)):
            ws.cell(LR["ebitda_pct"], c0 + k, f"=IF({CL(c0+k)}{LR['sales']}=0,0,{CL(c0+k)}{LR['ebitda']}/{CL(c0+k)}{LR['sales']})")

wb.save(OUT)
print("saved", OUT)
