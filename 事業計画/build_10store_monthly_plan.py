# -*- coding: utf-8 -*-
"""ティエリーマルクス・ブラッスリー 10店舗＋余市オーベルジュ 月次事業計画（FY2027-FY2031・60か月）
   ※余市は新構想（20室・坪1,000万分譲・業績連動配当）。旧Cプラン（余市川ワイナリー）は削除

基準：
  ・ブラッスリー単店モデル … 事業計画/build_5year_plan.py（六本木ミッドタウン 2026/8/3提出P&L準拠）と同一前提
  ・余市オーベルジュ     … Cプラン（1棟集約RC・10室：ベース20坪×7／スイート30坪×2／PS40坪×1、坪1,500万で分譲＋リースバック）
全ての前提は青字セル。シート間の参照は行番号を直書きせず、ラベル→セル番地の辞書で解決する。
"""
import datetime as dt
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter as CL

OUT = "/home/user/wine-auction/事業計画/ティエリーマルクス_10店舗＋余市オーベルジュ_月次事業計画_FY2027-2031.xlsx"
JP = "Meiryo"
N = 60                       # 月数（2027年4月〜2032年3月）
C0 = 3                       # 月次の先頭列（C列）
LASTC = CL(C0 + N - 1)       # BJ
FY = ["FY2027", "FY2028", "FY2029", "FY2030", "FY2031"]

F_IN = Font(name=JP, size=10, color="0000FF")
F_BK = Font(name=JP, size=10)
F_GR = Font(name=JP, size=10, color="008000")
F_BD = Font(name=JP, size=10, bold=True)
F_H1 = Font(name=JP, size=13, bold=True, color="FFFFFF")
F_H2 = Font(name=JP, size=10, bold=True)
F_NT = Font(name=JP, size=9, color="7F7F7F")
F_RD = Font(name=JP, size=10, bold=True, color="C00000")
F_TH = Font(name=JP, size=9, bold=True)
FL_H = PatternFill("solid", fgColor="1F3864")
FL_S = PatternFill("solid", fgColor="D9E2F3")
FL_T = PatternFill("solid", fgColor="F2F2F2")
FL_K = PatternFill("solid", fgColor="FFFF00")
FL_Y = PatternFill("solid", fgColor="FFF2CC")
thin = Side(style="thin", color="BFBFBF")
BOX = Border(left=thin, right=thin, top=thin, bottom=thin)
MM = '#,##0.0;(#,##0.0);-'
M0 = '#,##0;(#,##0);-'
PC = '0.0%;(0.0%);-'
DT = 'yyyy/m'

wb = openpyxl.Workbook()
wb.remove(wb.active)


def band(ws, row, text, last=8):
    for c in range(1, last + 1):
        ws.cell(row=row, column=c).fill = FL_H
    ws.cell(row=row, column=1, value=text).font = F_H1


def sec(ws, row, text, last=8):
    for c in range(1, last + 1):
        ws.cell(row=row, column=c).fill = FL_S
    ws.cell(row=row, column=1, value=text).font = F_H2


class Inputs:
    """前提入力を縦に積み、ラベル→絶対参照を返す。"""
    def __init__(self, ws, row, vcol=3, ncol=4):
        self.ws, self.r, self.vc, self.nc = ws, row, vcol, ncol
        self.ref = {}

    def add(self, key, label, value, fmt=MM, note="", formula=False):
        ws = self.ws
        ws.cell(row=self.r, column=1, value=label).font = F_BK
        c = ws.cell(row=self.r, column=self.vc, value=value)
        c.font = F_BK if formula else F_IN
        if not formula:
            c.fill = FL_Y
        c.number_format = fmt
        c.border = BOX
        c.alignment = Alignment(horizontal="right")
        if note:
            ws.cell(row=self.r, column=self.nc, value=note).font = F_NT
        self.ref[key] = f"'{ws.title}'!${CL(self.vc)}${self.r}"
        self.local = f"${CL(self.vc)}${self.r}"
        self.r += 1
        return self.ref[key]

    def head(self, text):
        self.r += 1
        sec(self.ws, self.r, text, 6)
        self.r += 1


def month_header(ws, row0, start_ref, label_col_text="項　目"):
    """row0: 年月, row0+1: FY, row0+2: 月番号。各シート同一構造。"""
    ws.cell(row=row0, column=1, value=label_col_text).font = F_TH
    ws.cell(row=row0 + 1, column=1, value="会計年度").font = F_NT
    ws.cell(row=row0 + 2, column=1, value="月番号").font = F_NT
    for m in range(1, N + 1):
        c = C0 + m - 1
        a = CL(c)
        d = ws.cell(row=row0, column=c, value=f"={start_ref}" if m == 1 else f"=EDATE({CL(c-1)}{row0},1)")
        d.number_format = DT; d.font = F_TH; d.fill = FL_T; d.border = BOX
        d.alignment = Alignment(horizontal="center")
        f = ws.cell(row=row0 + 1, column=c,
                    value=f'="FY"&IF(MONTH({a}{row0})>=4,YEAR({a}{row0}),YEAR({a}{row0})-1)')
        f.font = F_NT; f.alignment = Alignment(horizontal="center")
        k = ws.cell(row=row0 + 2, column=c, value=m)
        k.font = F_NT; k.alignment = Alignment(horizontal="center")
        ws.column_dimensions[a].width = 8.5
    ws.cell(row=row0, column=2, value="単位").font = F_TH


def mrow(ws, r, label, ftext, fmt=MM, bold=False, fill=None, note=None, font=None):
    """ftext は月列のテンプレート。{c}=当月列, {p}=前月列, {m}=月番号セル。"""
    ws.cell(row=r, column=1, value=label).font = F_BD if bold else F_BK
    if note is not None:
        ws.cell(row=r, column=2, value=note).font = F_NT
    for m in range(1, N + 1):
        c = CL(C0 + m - 1)
        p = CL(C0 + m - 2) if m > 1 else None
        val = ftext(c, p, m) if callable(ftext) else ftext.format(c=c, p=p)
        cell = ws.cell(row=r, column=C0 + m - 1, value=val)
        cell.number_format = fmt
        cell.font = font or (F_BD if bold else F_BK)
        if fill:
            cell.fill = fill
    if fill:
        ws.cell(row=r, column=1).fill = fill
        ws.cell(row=r, column=2).fill = fill
    return r


def rng(sheet, r):
    return f"'{sheet}'!${CL(C0)}${r}:${LASTC}${r}"


# =====================================================================
# 前提条件（ブラッスリー・連結）
# =====================================================================
ws = wb.create_sheet("前提条件")
ws.sheet_view.showGridLines = False
ws.column_dimensions["A"].width = 40
ws.column_dimensions["B"].width = 2
for c in "CDE": ws.column_dimensions[c].width = 12
ws.column_dimensions["F"].width = 2
ws.column_dimensions["G"].width = 70
band(ws, 1, "前提条件（ブラッスリー単店モデル・連結）　単位：百万円", 7)
ws["A2"] = "青字＝入力値。変更すると全シートが再計算されます。単店モデルは旧5か年計画（build_5year_plan.py）と同一前提。"
ws["A2"].font = F_NT
I = Inputs(ws, 3, vcol=3, ncol=7)
I.head("■ 計画期間")
START = I.add("start", "計画開始月（月次表の初月）", dt.date(2027, 4, 1), DT, "FY2027〜FY2031の60か月")
I.head("■ ブラッスリー 売上（六本木ミッドタウン＝標準店）")
P_REV_FULL = I.add("rev_full", "満年度 売上高（年）", 460.0, MM, "183.59㎡(55.5坪)・123席・年363日営業・稼働率80%（2026/8/3提出P&L）")
RAMP0 = I.r
I.add("ramp1", "立上り率　運営1年目（開業1〜12か月目）", 0.90, PC, "旧計画は会計年度単位、本計画は開業月起算の12か月単位で判定")
I.add("ramp2", "立上り率　運営2年目（13〜24か月目）", 0.98, PC)
I.add("ramp3", "立上り率　運営3年目以降（25か月目〜）", 1.00, PC)
RAMP = f"'前提条件'!$C${RAMP0}:$C${RAMP0+2}"
I.head("■ ブラッスリー 季節変動（4月＝100の指数）")
I.add("seas_norm", "年額を満年度に合わせる（1=正規化する／0=しない）", 1, M0,
      "1：月の山谷だけを付け、年額は満年度のまま（指数÷年平均）。0：4月＝満年度÷12とし、年額は指数の平均だけ増減（テラス有−8.3%、無−4.2%）")
NORM = I.ref["seas_norm"]
ws.column_dimensions["F"].width = 12
for j, t in enumerate(["テラス有\n指数", "テラス無\n指数", "テラス有\n係数", "テラス無\n係数"]):
    c = ws.cell(row=I.r, column=3 + j, value=t); c.font = F_TH; c.fill = FL_T; c.border = BOX
    c.alignment = Alignment(horizontal="center", wrap_text=True)
ws.cell(row=I.r, column=1, value="月").font = F_TH
ws.row_dimensions[I.r].height = 28
I.r += 1
SEAS0 = I.r
TERR = [75, 75, 100, 100, 100, 90, 90, 90, 95, 95, 90, 100]      # 六本木（テラス有）
NOTERR = [80, 80, 110, 100, 100, 80, 80, 80, 100, 100, 110, 130] # テラス無
for mo in range(1, 13):
    rr = I.r
    ws.cell(row=rr, column=1, value=f"　{mo}月").font = F_BK
    for j, v in enumerate([TERR[mo-1], NOTERR[mo-1]]):
        x = ws.cell(row=rr, column=3 + j, value=v); x.font = F_IN; x.fill = FL_Y; x.number_format = M0; x.border = BOX
    for j, src in enumerate(["C", "D"]):
        x = ws.cell(row=rr, column=5 + j,
                    value=f"=IF({NORM}=1,{src}{rr}/AVERAGE(${src}${SEAS0}:${src}${SEAS0+11}),{src}{rr}/100)")
        x.number_format = '0.000'; x.border = BOX; x.font = F_BK
    if mo == 1:
        ws.cell(row=rr, column=7, value="六本木（テラス有）：1・2月75、3〜5月100、6〜8月90、9・10月95、11月90、12月100").font = F_NT
    if mo == 2:
        ws.cell(row=rr, column=7, value="テラス無：1・2月80、3月110、4・5月100、6〜8月80、9・10月100、11月110、12月130").font = F_NT
    I.r += 1
rr = I.r
ws.cell(row=rr, column=1, value="　年平均（係数は正規化時 1.000）").font = F_BD
for j, col in enumerate("CDEF"):
    x = ws.cell(row=rr, column=3 + j, value=f"=AVERAGE({col}{SEAS0}:{col}{SEAS0+11})")
    x.number_format = '0.000' if col in "EF" else '0.0'; x.border = BOX; x.font = F_BD; x.fill = FL_T
I.r += 1
TERR_F = f"'前提条件'!$E${SEAS0}:$E${SEAS0+11}"
NOTERR_F = f"'前提条件'!$F${SEAS0}:$F${SEAS0+11}"
I.r += 1
ws.cell(row=I.r, column=1, value="参考：満年度（運営3年目以降）の月別売上").font = F_H2
for j, t in enumerate(["テラス有", "テラス無"]):
    c = ws.cell(row=I.r, column=3 + j, value=t); c.font = F_TH; c.fill = FL_T; c.border = BOX
    c.alignment = Alignment(horizontal="center")
I.r += 1
MS0 = I.r
for mo in range(1, 13):
    rr = I.r
    ws.cell(row=rr, column=1, value=f"　{mo}月").font = F_BK
    for j, col in enumerate("EF"):
        x = ws.cell(row=rr, column=3 + j, value=f"={P_REV_FULL}/12*{col}{SEAS0+mo-1}")
        x.number_format = MM; x.border = BOX; x.font = F_BK
    I.r += 1
rr = I.r
ws.cell(row=rr, column=1, value="　年計").font = F_BD
for j, col in enumerate("CD"):
    x = ws.cell(row=rr, column=3 + j, value=f"=SUM({col}{MS0}:{col}{MS0+11})")
    x.number_format = MM; x.border = BOX; x.font = F_BD; x.fill = FL_T
I.r += 1
I.head("■ ブラッスリー 変動費率（対売上）")
ws.cell(row=I.r, column=1, value="費　目").font = F_TH
for j, t in enumerate(["1年目", "2年目", "3年目以降"]):
    c = ws.cell(row=I.r, column=3 + j, value=t); c.font = F_TH; c.fill = FL_T; c.border = BOX
    c.alignment = Alignment(horizontal="center")
I.r += 1
VAR = [
    ("cogs", "売上原価", 0.295, 0.290, 0.285, "直輸入ワイン・一括仕入"),
    ("labor", "人件費", 0.345, 0.335, 0.325, "本部集中化・多能工化"),
    ("outs", "業務委託費・消耗品他", 0.024, 0.022, 0.020, ""),
    ("adv", "広告宣伝費・販売促進費", 0.014, 0.014, 0.014, ""),
    ("oth", "その他経費", 0.005, 0.005, 0.005, ""),
    ("util", "水道光熱費", 0.040, 0.038, 0.036, ""),
    ("roy", "ロイヤリティ", 0.040, 0.040, 0.040, "ブラッスリー4.0%（契約条件）"),
    ("ins", "保険・租税公課", 0.007, 0.007, 0.007, ""),
    ("ffe", "修繕維持費（FFE）", 0.025, 0.025, 0.025, ""),
]
RATE = {}
for key, lab, a, b, c_, note in VAR:
    ws.cell(row=I.r, column=1, value=lab).font = F_BK
    for j, v in enumerate([a, b, c_]):
        x = ws.cell(row=I.r, column=3 + j, value=v)
        x.font = F_IN; x.fill = FL_Y; x.number_format = PC; x.border = BOX
    ws.cell(row=I.r, column=7, value=note).font = F_NT
    RATE[key] = [f"'前提条件'!${CL(3+j)}${I.r}" for j in range(3)]
    I.r += 1
I.head("■ ブラッスリー 家賃（契約条件どおり全店適用）")
I.add("rent_m", "地代家賃（固定）月額", 2.22, MM, "月222万円")
I.add("pct_rate", "歩合家賃率", 0.07, PC, "閾値超過分×7%")
I.add("pct_thr", "歩合家賃 閾値（年額売上）", 331.4, MM, "月額換算＝÷12")
I.head("■ ブラッスリー 初期投資・償却・分割払い（1店あたり）")
I.add("inv_body", "事業費（設計・内装施工・OSE/FF&E）", 194.0, MM)
I.add("inv_prep", "開業準備金（広告・採用等）", 4.0, MM)
I.add("inv_dep", "保証金（非償却・返還対象）", 39.0, MM)
I.add("dep_years", "平均償却年数（年）", 10.0, MM)
I.add("inst_int", "分割対象：内装工事費", 100.0, MM, "月833千円×120回")
I.add("inst_int_n", "　分割回数（内装）", 120, M0)
I.add("inst_dep", "分割対象：保証金", 38.9, MM, "月463千円×84回")
I.add("inst_dep_n", "　分割回数（保証金）", 84, M0)
I.head("■ 連結：本部費（年額）・資金")
HQ0 = I.r
for i, (f, v) in enumerate(zip(FY, [15.0, 28.0, 40.0, 48.0, 55.0])):
    I.add(f"hq{i}", f"本部費　{f}", v, MM, "旧計画どおり（管理・人事・購買・マーケ）。月次は÷12" if i == 0 else "")
HQ = f"'前提条件'!$C${HQ0}:$C${HQ0+4}"
I.add("cash0", "期首現金残高（2027年4月初）", 400.0, MM, "資本政策：2026/9設立 WineBank 2億＋2026/12第三者割当 2億")
I.add("eq_month", "追加増資（シリーズA）実行月", dt.date(2028, 10, 1), DT, "資本政策シート：FY2028下期にシリーズA")
I.add("eq_amt", "追加増資（シリーズA）金額", 500.0, MM, "Pre 15億円・5億円調達の想定")
P = I.ref

# =====================================================================
# 出店計画
# =====================================================================
wo = wb.create_sheet("出店計画")
wo.sheet_view.showGridLines = False
band(wo, 1, "出店計画（10店舗：ブラッスリー9店＋余市オーベルジュ1店）", 11)
wo["A2"] = "開業年月（青字）を変えると、月次PL・CFが全て連動します。店舗名の地名は旧計画の候補地（札幌・仙台・横浜・大宮・千葉・名古屋・京都・大阪・博多）からの仮置き。"
wo["A2"].font = F_NT
heads = ["No", "店舗名（仮）", "業態", "開業年月", "月番号", "会計年度", "契約金", "初期投資計", "償却対象", "分割対象", "開業時現金支出", "テラス"]
for j, h in enumerate(heads):
    c = wo.cell(row=4, column=1 + j, value=h); c.font = F_TH; c.fill = FL_T; c.border = BOX
    c.alignment = Alignment(horizontal="center", wrap_text=True)
STORES = [
    (1, "六本木ミッドタウン", "B", dt.date(2027, 4, 1), 10.0),
    (2, "札幌（仮）", "B", dt.date(2028, 10, 1), 10.0),
    (3, "大阪（仮）", "B", dt.date(2029, 7, 1), 10.0),
    (4, "首都圏（仮）", "B", dt.date(2029, 12, 1), 5.0),
    (5, "余市オーベルジュ", "A", dt.date(2030, 7, 1), None),
    (6, "名古屋（仮）", "B", dt.date(2030, 10, 1), 5.0),
    (7, "博多（仮）", "B", dt.date(2031, 4, 1), 5.0),
    (8, "京都（仮）", "B", dt.date(2031, 10, 1), 5.0),
    (9, "横浜（仮）", "B", dt.date(2032, 1, 1), 5.0),
    (10, "仙台（仮）", "B", dt.date(2032, 3, 1), 5.0),
]
BREF = []          # ブラッスリー各店の (月番号, 償却対象, 開業時現金) 参照
AUB_ROW = None
for i, (no, name, kind, d, fee) in enumerate(STORES):
    r = 5 + i
    wo.cell(row=r, column=1, value=no).font = F_BK
    wo.cell(row=r, column=2, value=name).font = F_BD if kind == "A" else F_BK
    wo.cell(row=r, column=3, value="オーベルジュ" if kind == "A" else "ブラッスリー").font = F_BK
    x = wo.cell(row=r, column=4, value=d); x.font = F_IN; x.fill = FL_Y; x.number_format = DT
    wo.cell(row=r, column=5, value=f"=(YEAR(D{r})-YEAR({P['start']}))*12+MONTH(D{r})-MONTH({P['start']})+1").font = F_BK
    wo.cell(row=r, column=6, value=f'="FY"&IF(MONTH(D{r})>=4,YEAR(D{r}),YEAR(D{r})-1)').font = F_BK
    if kind == "B":
        x = wo.cell(row=r, column=7, value=fee); x.font = F_IN; x.fill = FL_Y; x.number_format = MM
        wo.cell(row=r, column=8, value=f"=G{r}+{P['inv_body']}+{P['inv_prep']}+{P['inv_dep']}").number_format = MM
        wo.cell(row=r, column=9, value=f"=H{r}-{P['inv_dep']}").number_format = MM
        wo.cell(row=r, column=10, value=f"={P['inst_int']}+{P['inst_dep']}").number_format = MM
        wo.cell(row=r, column=11, value=f"=H{r}-J{r}").number_format = MM
        x = wo.cell(row=r, column=12, value="有" if no == 1 else "無"); x.font = F_IN; x.fill = FL_Y
        x.alignment = Alignment(horizontal="center")
        BREF.append((name, f"'出店計画'!$E${r}", f"'出店計画'!$I${r}", f"'出店計画'!$K${r}", f"'出店計画'!$L${r}"))
    else:
        AUB_ROW = r
        wo.cell(row=r, column=7, value="余市タブで別計算").font = F_NT
        wo.merge_cells(start_row=r, start_column=7, end_row=r, end_column=11)
        for cc in (1, 2, 3, 5, 6): wo.cell(row=r, column=cc).fill = FL_S
    for cc in range(1, 13): wo.cell(row=r, column=cc).border = BOX
AUB_OPEN_M = f"'出店計画'!$E${AUB_ROW}"
AUB_OPEN_D = f"'出店計画'!$D${AUB_ROW}"
wo["A16"] = "契約金：1〜3号店（ブラッスリー）各1,000万円、4号店以降各500万円（TMライセンス契約条件）。初期投資＝契約金＋事業費194＋開業準備金4＋保証金39。"
wo["A16"].font = F_NT
wo["A17"] = "※ 2032年の2店舗（1月・3月開業）は計画最終年度FY2031の期末に入るため、稼働は数か月分のみ計上される。満年度効果はFY2032以降。"
wo["A17"].font = F_RD
wo["A18"] = "テラス：有＝六本木型の季節変動（夏も強い）、無＝テラス無し店の季節変動（12月・3月・11月が山、夏が谷）。前提条件シートで指数を変更可能。"
wo["A18"].font = F_NT
for c, w in zip("ABCDEFGHIJKL", [5, 22, 12, 10, 8, 9, 9, 11, 10, 10, 13, 7]):
    wo.column_dimensions[c].width = w

# =====================================================================
# 余市オーベルジュ（新構想：ヴィラ10＋ホテル10＝20室／ホテルコンド分譲＋業績連動配当）
# =====================================================================
wy = wb.create_sheet("余市オーベルジュ")
wy.sheet_view.showGridLines = False
wy.column_dimensions["A"].width = 46
wy.column_dimensions["B"].width = 8
band(wy, 1, "余市オーベルジュ構想（ヴィラ30坪×10＋レストラン棟〈ホテル20坪×10〉＝20室・延床900坪／ホテルコンド分譲＋業績連動配当）　単位：百万円", 10)
wy["A2"] = "上段＝前提と満年度の試算、下段＝60か月の月次展開（連結PL・CFはこの月次行を参照）。旧案（余市川ワイナリー取得・10室）は案件終了のため削除。"
wy["A2"].font = F_NT
Y = Inputs(wy, 3, vcol=3, ncol=4)
Y.head("■ スケジュール")
Y.add("acq_d", "土地取得月", dt.date(2027, 10, 1), DT, "敷地約2,500坪。許認可（林地開発・開発許可等）の前に取得")
Y.add("acq_m", "　取得月番号", f"=(YEAR(C{Y.r-1})-YEAR({P['start']}))*12+MONTH(C{Y.r-1})-MONTH({P['start']})+1", M0, formula=True)
Y.add("con_d", "着工月", dt.date(2028, 7, 1), DT)
Y.add("con_m", "　着工月番号", f"=(YEAR(C{Y.r-1})-YEAR({P['start']}))*12+MONTH(C{Y.r-1})-MONTH({P['start']})+1", M0, formula=True)
Y.add("con_n", "工期（か月）", 24, M0, "北海道は11〜4月の土工事が困難。実質2シーズン")
Y.add("cmp_m", "　竣工・引渡月番号", f"={Y.ref['con_m']}+{Y.ref['con_n']}-1", M0, "分譲住戸の引渡＝竣工月", formula=True)
Y.add("opn_m", "　開業月番号（出店計画シートより）", f"={AUB_OPEN_M}", M0, "出店計画シートの開業年月を変更", formula=True)
Y.head("■ 客室構成（料金は2名・食事付き）")
wy.cell(row=Y.r, column=1, value="タイプ").font = F_TH
for j, t in enumerate(["面積(坪/室)", "室数", "1泊料金(円)", "FF&E(/室)"]):
    c = wy.cell(row=Y.r, column=3 + j, value=t); c.font = F_TH; c.fill = FL_T; c.border = BOX
    c.alignment = Alignment(horizontal="center")
Y.r += 1
RT0 = Y.r
for name, a, n, adr, ff, note in [("ヴィラ（独立棟）", 30, 10, 175000, 15, "15〜20万円の中央値"),
                                  ("ホテル客室（レストラン棟内）", 20, 10, 100000, 10, "10万円前後")]:
    wy.cell(row=Y.r, column=1, value=name).font = F_BK
    for j, v in enumerate([a, n, adr, ff]):
        x = wy.cell(row=Y.r, column=3 + j, value=v)
        x.font = F_IN; x.fill = FL_Y; x.border = BOX; x.number_format = '#,##0'
    wy.cell(row=Y.r, column=8, value=note).font = F_NT
    Y.r += 1
RT1 = Y.r - 1
Y.add("rooms", "総室数", f"=SUM(D{RT0}:D{RT1})", M0, formula=True)
Y.add("sen", "客室 専有面積 計（坪）＝分譲対象", f"=SUMPRODUCT(C{RT0}:C{RT1},D{RT0}:D{RT1})", MM, formula=True)
Y.add("adr_sum", "全室満室時の宿泊売上（円/泊）", f"=SUMPRODUCT(D{RT0}:D{RT1},E{RT0}:E{RT1})", M0, formula=True)
Y.add("ffe_room", "FF&E 客室 計", f"=SUMPRODUCT(D{RT0}:D{RT1},F{RT0}:F{RT1})", MM, formula=True)
Y.add("own_n", "オーナー利用泊数（室・年）", 12, M0, "オーナー利用分は宿泊売上ゼロで計算")
Y.add("sell_r", "販売可能泊数の比率", f"=(365-{Y.ref['own_n']})/365", PC, "353泊÷365泊", formula=True)
Y.head("■ 建物・総事業費")
Y.add("rest_t", "レストラン（50坪×2）", 100, MM)
Y.add("com_t", "共用部（レストラン棟100坪＋200坪）", 300, MM)
Y.add("gross", "延床面積（坪）", f"={Y.ref['sen']}+{Y.ref['rest_t']}+{Y.ref['com_t']}", MM, "ヴィラ300＋ホテル客室200＋レストラン100＋共用部300＝900坪", formula=True)
Y.add("unit", "建築費 坪単価（万円/坪）", 200, M0)
Y.add("c_build", "建築費（本体）", f"={Y.ref['gross']}*{Y.ref['unit']}/100", MM, "900坪×坪200万＝1,800", formula=True)
Y.add("des_r", "設計監理料率", 0.07, PC, "以下、ご指示の建築費18億に含まれない項目。前回試算と同じ置き方（不要なら0に）")
Y.add("c_des", "設計監理料", f"={Y.ref['c_build']}*{Y.ref['des_r']}", MM, formula=True)
Y.add("c_ons", "温泉工事（源泉掘削＋ポンプ）", 100.0, MM, "成功率40〜60%")
Y.add("c_civ", "造成・外構", 250.0, MM, "敷地約2,500坪")
Y.add("c_inf", "インフラ引込", 150.0, MM)
Y.add("c_ffe_r", "FF&E 客室", f"={Y.ref['ffe_room']}", MM, formula=True)
Y.add("c_ffe_c", "FF&E 共用・レストラン", 100.0, MM)
Y.add("c_pre", "開業前費用", 150.0, MM, "採用・研修・PR")
Y.add("cont_r", "予備費率", 0.05, PC)
Y.add("c_land", "土地取得", 50.0, MM, "【仮置き・要確認】約2,500坪×2万円/坪")
Y.add("c_buildsum", "建設関連（本体＋設計＋温泉＋造成＋インフラ）予備費込", f"=({Y.ref['c_build']}+{Y.ref['c_des']}+{Y.ref['c_ons']}+{Y.ref['c_civ']}+{Y.ref['c_inf']})*(1+{Y.ref['cont_r']})", MM, "工期中に均等支出", formula=True)
Y.add("c_ffesum", "FF&E 予備費込", f"=({Y.ref['c_ffe_r']}+{Y.ref['c_ffe_c']})*(1+{Y.ref['cont_r']})", MM, "竣工前2か月で支出", formula=True)
Y.add("c_presum", "開業前費用 予備費込", f"={Y.ref['c_pre']}*(1+{Y.ref['cont_r']})", MM, "開業前6か月で支出", formula=True)
Y.add("tpc", "総事業費", f"={Y.ref['c_buildsum']}+{Y.ref['c_ffesum']}+{Y.ref['c_presum']}+{Y.ref['c_land']}", MM, formula=True)
wy[Y.ref['tpc'].split('!')[1].replace('$', '')].fill = FL_K
Y.head("■ ホテルコンド分譲")
Y.add("s_unit", "分譲 坪単価（万円/坪）", 1000, M0, "ヴィラ30坪＝3億、ホテル客室20坪＝2億")
Y.add("s_total", "分譲総額", f"={Y.ref['sen']}*{Y.ref['s_unit']}/100", MM, "500坪×坪1,000万＝5,000", formula=True)
Y.add("s_cost", "分譲原価（引渡時に計上）", f"={Y.ref['tpc']}", MM, "総事業費の全額（レストラン・共用部を含む保守的な扱い）", formula=True)
Y.add("s_fee", "販売経費率", 0.06, PC, "引渡時に計上・支払")
Y.add("s_dep", "契約時手付金率", 0.20, PC, "残金は引渡時")
Y.add("s_start_d", "販売開始月", dt.date(2028, 7, 1), DT, "着工と同時")
Y.add("s_start", "　販売開始月番号", f"=(YEAR(C{Y.r-1})-YEAR({P['start']}))*12+MONTH(C{Y.r-1})-MONTH({P['start']})+1", M0, formula=True)
Y.add("s_period", "販売期間（か月）", 18, M0, "手付金をこの期間に均等受領")
Y.head("■ オーナー配当（賃料）＝MAX（営業利益×1/3、販売価格×1%）")
Y.add("div_share", "営業利益に対する配当割合", 1/3, PC, "宿泊部門の営業利益（配当前）×1/3")
Y.add("div_floor", "最低保証（販売価格に対する率）", 0.01, PC, "毎月1/12を支払い、年度末（3月）に1/3との差額を精算")
Y.add("div_rest", "配当原資に外来レストランの利益を含めるか（1=含める／0=含めない）", 0, M0, "「客室に連動」のご指示どおり初期値は0（客室のみ）")
Y.head("■ 建設資金借入")
Y.add("ln_r", "借入比率（各支出に対して）", 0.65, PC, "土地取得を含む全開発支出の65%")
Y.add("ln_i", "金利（年）", 0.020, PC, "引渡時に一括返済")
Y.head("■ 宿泊部門（料金は食事込み）")
Y.add("occ", "客室稼働率（販売可能泊数に対して・通年）", 0.60, PC)
Y.add("v_rate", "変動費率", 0.27, PC, "料理・飲料原価12%＋販売手数料10%＋消耗品・リネン5%")
FX0 = Y.r
for k, lab, v, note in [("f_lab", "固定費：人件費（年）", 186.0, "約37名×年500万円。稼働に関わらず発生"),
                        ("f_utl", "固定費：水道光熱費（年）", 41.0, "温泉・暖房・融雪"),
                        ("f_rep", "固定費：修繕費（年）", 18.0, ""),
                        ("f_tax", "固定費：保険・租税公課（年）", 12.0, ""),
                        ("f_ga", "固定費：一般管理費（年）", 29.0, "固定費計286＝稼働60%時の売上の49%（前回試算の経費率と整合）")]:
    Y.add(k, lab, v, MM, note)
Y.add("f_tot", "固定費 計（年）", f"=SUM(C{FX0}:C{Y.r-1})", MM, formula=True)
Y.add("snow", "除雪費（年・12〜3月に計上）", 5.0, MM)
Y.head("■ 外来レストラン（50坪×2）")
Y.add("r_dn", "外来ディナー（名/日）", 15, M0, "札幌1時間・小樽30分圏、ワインツーリズム客")
Y.add("r_dpx", "外来ディナー客単価（円）", 15000, M0)
Y.add("r_ln", "外来ランチ（名/日）", 30, M0)
Y.add("r_lpx", "外来ランチ客単価（円）", 6000, M0)
Y.add("r_days", "年間営業日数", 300, M0)
Y.add("r_eb", "外来レストランEBITDA率", 0.18, PC, "宿泊客の朝夕食は宿泊料金に含まれ宿泊部門で計上。厨房共用のため実際の限界利益はこれより高い")
Y.head("■ 立上り・季節")
Y.add("a_ramp1", "運営1年目 立上り率", 0.90, PC, "稼働率と外来客数に適用")
Y.add("a_ramp2", "運営2年目 立上り率", 0.98, PC)
Y.add("a_ramp3", "運営3年目以降 立上り率", 1.00, PC)
ARAMP = f"'余市オーベルジュ'!$C${Y.r-3}:$C${Y.r-1}"
AS0 = Y.r
for mo, v in zip(range(1, 13), [1.05, 1.05, 0.80, 0.70, 0.85, 1.00, 1.25, 1.30, 1.20, 1.15, 0.70, 0.95]):
    Y.add(f"as{mo}", f"季節指数　{mo}月", v, '0.00', "冬＝キロロ30分・ニセコ1時間のスキー需要、夏〜秋＝収穫期が繁忙。11月・4〜5月が端境期（平均1.00）" if mo == 1 else "")
ASEAS = f"'余市オーベルジュ'!$C${AS0}:$C${AS0+11}"
Y.add("as_avg", "　季節指数 平均（確認用）", f"=AVERAGE(C{AS0}:C{AS0+11})", '0.000', "1.000であること", formula=True)
YR = Y.ref

# ---- 満年度（3年目以降・季節平準）の試算 ----
Y.head("■ 満年度の試算（運営3年目以降・年額）")
Y.add("fy_hrev", "宿泊売上（食事込み）", f"={YR['adr_sum']}*365*{YR['sell_r']}*{YR['occ']}/1000000", MM, formula=True)
Y.add("fy_hop", "宿泊部門 営業利益（配当前）", f"={YR['fy_hrev']}*(1-{YR['v_rate']})-{YR['f_tot']}-{YR['snow']}", MM, formula=True)
Y.add("fy_rrev", "外来レストラン売上", f"=({YR['r_dn']}*{YR['r_dpx']}+{YR['r_ln']}*{YR['r_lpx']})*{YR['r_days']}/1000000", MM, formula=True)
Y.add("fy_reb", "外来レストランEBITDA", f"={YR['fy_rrev']}*{YR['r_eb']}", MM, formula=True)
Y.add("fy_d13", "　配当案A：営業利益×1/3", f"=MAX(0,{YR['fy_hop']}+IF({YR['div_rest']}=1,{YR['fy_reb']},0))*{YR['div_share']}", MM, formula=True)
Y.add("fy_d1", "　配当案B：販売価格×1%", f"={YR['s_total']}*{YR['div_floor']}", MM, formula=True)
Y.add("fy_div", "オーナー配当（A・Bの高い方）", f"=MAX({YR['fy_d13']},{YR['fy_d1']})", MM, formula=True)
Y.add("fy_ops", "余市 運営EBITDA（配当後・レストラン含む）", f"={YR['fy_hop']}-{YR['fy_div']}+{YR['fy_reb']}", MM, formula=True)
wy[YR['fy_ops'].split('!')[1].replace('$', '')].fill = FL_K
Y.add("fy_opm", "　同 利益率（対 宿泊＋レストラン売上）", f"={YR['fy_ops']}/({YR['fy_hrev']}+{YR['fy_rrev']})", PC, formula=True)
Y.add("fy_be", "損益分岐の稼働率（配当＝最低保証1%のとき）",
      f"=({YR['f_tot']}+{YR['snow']}+{YR['fy_d1']}-{YR['fy_reb']})/(({YR['adr_sum']}*365*{YR['sell_r']}/1000000)*(1-{YR['v_rate']}))", PC,
      "稼働率がこれを上回れば余市の運営は黒字", formula=True)
Y.add("fy_sw", "1/3配当が1%保証を上回り始める稼働率",
      f"=(3*{YR['fy_d1']}/IF({YR['div_share']}=0,1,{YR['div_share']}*3)+{YR['f_tot']}+{YR['snow']}-IF({YR['div_rest']}=1,{YR['fy_reb']},0))/(({YR['adr_sum']}*365*{YR['sell_r']}/1000000)*(1-{YR['v_rate']}))", PC,
      "これを超えるとオーナーの取り分が1%を超える", formula=True)
Y.add("fy_pl", "分譲損益（引渡時・一括）", f"={YR['s_total']}*(1-{YR['s_fee']})-{YR['s_cost']}", MM, formula=True)
wy[YR['fy_pl'].split('!')[1].replace('$', '')].fill = FL_K
Y.add("fy_yield_v", "（参考）オーナー利回り：ヴィラ1室（配当のみ）", f"={YR['fy_div']}/{YR['sen']}*C{RT0}/(C{RT0}*{YR['s_unit']}/100)", PC, "配当総額を専有面積で按分", formula=True)
for c in "CDEFG": wy.column_dimensions[c].width = 12

# ---- 月次展開 ----
YM = Y.r + 2
band(wy, YM, "余市　月次展開（百万円）", 10)
month_header(wy, YM + 1, P['start'])
H = YM + 1
K = YM + 3
r = YM + 5
YROW = {}

def yrow(key, label, f, fmt=MM, bold=False, fill=None, note=None):
    global r
    mrow(wy, r, label, f, fmt, bold, fill, note)
    YROW[key] = r
    r += 1

sec(wy, r, "■ 開発（土地取得・建設・FF&E・開業前）", 2); r += 1
yrow("d_land", "土地取得", lambda c, p, m: f"=IF({c}${K}={YR['acq_m']},{YR['c_land']},0)")
yrow("d_build", "建設関連支出（工期中均等）", lambda c, p, m: f"=IF(AND({c}${K}>={YR['con_m']},{c}${K}<={YR['cmp_m']}),{YR['c_buildsum']}/{YR['con_n']},0)")
yrow("d_ffe", "FF&E支出（竣工前2か月）", lambda c, p, m: f"=IF(AND({c}${K}>{YR['cmp_m']}-2,{c}${K}<={YR['cmp_m']}),{YR['c_ffesum']}/2,0)")
yrow("d_pre", "開業前費用支出（開業前6か月）", lambda c, p, m: f"=IF(AND({c}${K}>={YR['opn_m']}-6,{c}${K}<{YR['opn_m']}),{YR['c_presum']}/6,0)")
yrow("d_dev", "開発支出 計（土地除く）", lambda c, p, m: f"={c}{YROW['d_build']}+{c}{YROW['d_ffe']}+{c}{YROW['d_pre']}", bold=True)
yrow("d_cum", "累計 開発支出（土地含む）", lambda c, p, m: (f"={c}{YROW['d_land']}+{c}{YROW['d_dev']}" if m == 1 else f"={p}{r}+{c}{YROW['d_land']}+{c}{YROW['d_dev']}"))
r += 1
sec(wy, r, "■ 建設資金借入", 2); r += 1
yrow("l_draw", "借入実行", lambda c, p, m: f"=({c}{YROW['d_land']}+{c}{YROW['d_dev']})*{YR['ln_r']}")
LB = r + 1   # 残高行（＝返済行の次の行）
yrow("l_rep", "借入返済（引渡月に一括）", lambda c, p, m: (f"=IF({c}${K}={YR['cmp_m']},{c}{YROW['l_draw']},0)" if m == 1 else f"=IF({c}${K}={YR['cmp_m']},{p}{LB}+{c}{YROW['l_draw']},0)"))
yrow("l_bal", "借入残高（月末）", lambda c, p, m: (f"={c}{YROW['l_draw']}-{c}{YROW['l_rep']}" if m == 1 else f"={p}{LB}+{c}{YROW['l_draw']}-{c}{YROW['l_rep']}"))
yrow("l_int", "支払利息", lambda c, p, m: ("=0" if m == 1 else f"={p}{YROW['l_bal']}*{YR['ln_i']}/12"))
r += 1
sec(wy, r, "■ ホテルコンド分譲", 2); r += 1
yrow("s_depcash", "手付金受領（CF）", lambda c, p, m: f"=IF(AND({c}${K}>={YR['s_start']},{c}${K}<{YR['s_start']}+{YR['s_period']}),{YR['s_total']}*{YR['s_dep']}/{YR['s_period']},0)")
yrow("s_balcash", "残金受領（CF・引渡月）", lambda c, p, m: f"=IF({c}${K}={YR['cmp_m']},{YR['s_total']}*(1-{YR['s_dep']}),0)")
yrow("s_rev", "分譲売上（PL・引渡月）", lambda c, p, m: f"=IF({c}${K}={YR['cmp_m']},{YR['s_total']},0)")
yrow("s_cogs", "分譲原価（PL・引渡月）", lambda c, p, m: f"=IF({c}${K}={YR['cmp_m']},{YR['s_cost']},0)")
yrow("s_fee", "販売経費（PL・CFとも引渡月）", lambda c, p, m: f"=IF({c}${K}={YR['cmp_m']},{YR['s_total']}*{YR['s_fee']},0)")
yrow("s_pl", "分譲損益", lambda c, p, m: f"={c}{YROW['s_rev']}-{c}{YROW['s_cogs']}-{c}{YROW['s_fee']}", bold=True)
r += 1
sec(wy, r, "■ 宿泊部門（開業月から）", 2); r += 1
yrow("a_n", "営業月数", lambda c, p, m: f"=IF({c}${K}>={YR['opn_m']},{c}${K}-{YR['opn_m']}+1,0)", M0)
yrow("a_y", "運営年次", lambda c, p, m: f"=IF({c}{YROW['a_n']}=0,0,IF({c}{YROW['a_n']}<=12,1,IF({c}{YROW['a_n']}<=24,2,3)))", M0)
yrow("a_k", "立上り×季節 係数", lambda c, p, m: f"=IF({c}{YROW['a_y']}=0,0,INDEX({ARAMP},{c}{YROW['a_y']})*INDEX({ASEAS},MONTH({c}${H})))", '0.00')
yrow("a_d", "当月日数", lambda c, p, m: f"=DAY(EOMONTH({c}${H},0))", M0)
yrow("a_occ", "実効稼働率", lambda c, p, m: f"=MIN(0.95,{YR['occ']}*{c}{YROW['a_k']})", PC)
yrow("h_rev", "宿泊売上（食事込み）", lambda c, p, m: f"={YR['adr_sum']}*{c}{YROW['a_occ']}*{c}{YROW['a_d']}*{YR['sell_r']}/1000000", bold=True)
yrow("h_var", "変動費（料理原価・手数料・消耗品）", lambda c, p, m: f"={c}{YROW['h_rev']}*{YR['v_rate']}")
yrow("h_fix", "固定費（人件費・光熱・修繕・保険租税・一般管理）", lambda c, p, m: f"=IF({c}{YROW['a_n']}>0,{YR['f_tot']}/12,0)")
yrow("h_snow", "除雪費", lambda c, p, m: f"=IF(AND({c}{YROW['a_n']}>0,OR(MONTH({c}${H})>=12,MONTH({c}${H})<=3)),{YR['snow']}/4,0)")
yrow("h_op", "宿泊部門 営業利益（配当前）", lambda c, p, m: f"={c}{YROW['h_rev']}-{c}{YROW['h_var']}-{c}{YROW['h_fix']}-{c}{YROW['h_snow']}", bold=True, fill=FL_T)
r += 1
sec(wy, r, "■ 外来レストラン（開業月から）", 2); r += 1
yrow("r_rev", "外来レストラン売上", lambda c, p, m: f"=IF({c}{YROW['a_n']}=0,0,({YR['r_dn']}*{YR['r_dpx']}+{YR['r_ln']}*{YR['r_lpx']})*{YR['r_days']}/12/1000000*{c}{YROW['a_k']})", bold=True)
yrow("r_eb", "外来レストランEBITDA", lambda c, p, m: f"={c}{YROW['r_rev']}*{YR['r_eb']}")
r += 1
sec(wy, r, "■ オーナー配当（毎月1%保証を支払い、3月に1/3との差額を精算）", 2); r += 1
yrow("o_base", "配当原資となる営業利益", lambda c, p, m: f"={c}{YROW['h_op']}+IF({YR['div_rest']}=1,{c}{YROW['r_eb']},0)")
yrow("o_floor", "最低保証分（販売価格×1%÷12）", lambda c, p, m: f"=IF({c}{YROW['a_n']}>0,{YR['s_total']}*{YR['div_floor']}/12,0)")
CB = r
yrow("o_cbase", "年度累計 配当原資（4月で初期化）", lambda c, p, m: (f"={c}{YROW['o_base']}" if m == 1 else f"=IF(MONTH({c}${H})=4,0,{p}{CB})+{c}{YROW['o_base']}"))
CF_ = r
yrow("o_cfloor", "年度累計 最低保証分", lambda c, p, m: (f"={c}{YROW['o_floor']}" if m == 1 else f"=IF(MONTH({c}${H})=4,0,{p}{CF_})+{c}{YROW['o_floor']}"))
yrow("o_true", "年度末精算（1/3が保証を上回った差額）", lambda c, p, m: f"=IF(AND(MONTH({c}${H})=3,{c}{YROW['a_n']}>0),MAX(0,{c}{YROW['o_cbase']}*{YR['div_share']}-{c}{YROW['o_cfloor']}),0)")
yrow("o_pay", "オーナー配当 計", lambda c, p, m: f"={c}{YROW['o_floor']}+{c}{YROW['o_true']}", bold=True, fill=FL_T)
r += 1
sec(wy, r, "■ 余市 合計", 2); r += 1
yrow("y_rev", "余市 運営売上（宿泊＋外来レストラン）", lambda c, p, m: f"={c}{YROW['h_rev']}+{c}{YROW['r_rev']}", bold=True, fill=FL_T)
yrow("y_eb", "余市 運営EBITDA（配当後）", lambda c, p, m: f"={c}{YROW['h_op']}-{c}{YROW['o_pay']}+{c}{YROW['r_eb']}", bold=True, fill=FL_T)
wy.freeze_panes = wy.cell(row=K + 1, column=C0)

# =====================================================================
# ブラッスリー店舗別（月次）
# =====================================================================
wb_ = wb.create_sheet("ブラッスリー店舗別")
wb_.sheet_view.showGridLines = False
wb_.column_dimensions["A"].width = 30
wb_.column_dimensions["B"].width = 6
band(wb_, 1, "ブラッスリー 店舗別 月次（百万円）　※運営年次は開業月起算の12か月単位", 10)
month_header(wb_, 3, P['start'])
BK = 5
r = 7
BLK = {}

def block(key, title, fn, fmt=MM):
    global r
    sec(wb_, r, title, 2); r += 1
    BLK[key] = (r, r + len(BREF) - 1)
    for i, (name, om, dep, cash, ter) in enumerate(BREF):
        mrow(wb_, r, name, (lambda i=i, om=om, dep=dep, cash=cash, ter=ter: (lambda c, p, m: fn(c, p, m, i, om, dep, cash, ter)))(), fmt)
        r += 1
    r += 1

def rowof(key, i):
    return BLK[key][0] + i

block("n", "■ 営業月数", lambda c, p, m, i, om, dep, cash, ter=None: f"=IF({c}${BK}>={om},{c}${BK}-{om}+1,0)", M0)
block("y", "■ 運営年次（0=未開業／1／2／3=3年目以降）", lambda c, p, m, i, om, dep, cash, ter=None: f"=IF({c}{rowof('n',i)}=0,0,IF({c}{rowof('n',i)}<=12,1,IF({c}{rowof('n',i)}<=24,2,3)))", M0)
block("rev", "■ 売上高（満年度÷12×立上り率×季節係数）", lambda c, p, m, i, om, dep, cash, ter=None: (f"=IF({c}{rowof('y',i)}=0,0,{P['rev_full']}/12*INDEX({RAMP},{c}{rowof('y',i)})"
       f"*IF({ter}=\"有\",INDEX({TERR_F},MONTH({c}$3)),INDEX({NOTERR_F},MONTH({c}$3))))"))
block("pct", "■ 歩合家賃", lambda c, p, m, i, om, dep, cash, ter=None: f"=IF({c}{rowof('y',i)}=0,0,MAX(0,{c}{rowof('rev',i)}-{P['pct_thr']}/12)*{P['pct_rate']})")
block("dep", "■ 減価償却費", lambda c, p, m, i, om, dep, cash, ter=None: f"=IF({c}{rowof('y',i)}=0,0,{dep}/{P['dep_years']}/12)")
block("cash", "■ 開業時現金支出（開業月）", lambda c, p, m, i, om, dep, cash, ter=None: f"=IF({c}{rowof('n',i)}=1,{cash},0)")
block("inst", "■ 分割弁済（内装120回＋保証金84回）", lambda c, p, m, i, om, dep, cash, ter=None: (f"=IF(AND({c}{rowof('n',i)}>=1,{c}{rowof('n',i)}<={P['inst_int_n']}),{P['inst_int']}/{P['inst_int_n']},0)"
                                                                                       f"+IF(AND({c}{rowof('n',i)}>=1,{c}{rowof('n',i)}<={P['inst_dep_n']}),{P['inst_dep']}/{P['inst_dep_n']},0)"))
sec(wb_, r, "■ 集計", 2); r += 1
AG = {}
def agg(key, label, f, fmt=MM, bold=True):
    global r
    mrow(wb_, r, label, f, fmt, bold, FL_T)
    AG[key] = r; r += 1
def R(key, c):
    a, b = BLK[key]; return f"{c}{a}:{c}{b}"
agg("open", "営業店舗数", lambda c, p, m: f"=COUNTIF({R('y',c)},\">0\")", M0)
agg("rev", "売上高 計", lambda c, p, m: f"=SUM({R('rev',c)})")
agg("rev1", "　うち運営1年目店", lambda c, p, m: f"=SUMIF({R('y',c)},1,{R('rev',c)})", bold=False)
agg("rev2", "　うち運営2年目店", lambda c, p, m: f"=SUMIF({R('y',c)},2,{R('rev',c)})", bold=False)
agg("rev3", "　うち運営3年目以降店", lambda c, p, m: f"=SUMIF({R('y',c)},3,{R('rev',c)})", bold=False)
agg("pct", "歩合家賃 計", lambda c, p, m: f"=SUM({R('pct',c)})")
agg("dep", "減価償却費 計", lambda c, p, m: f"=SUM({R('dep',c)})")
agg("cash", "開業時現金支出 計", lambda c, p, m: f"=SUM({R('cash',c)})")
agg("inst", "分割弁済 計", lambda c, p, m: f"=SUM({R('inst',c)})")
wb_.freeze_panes = wb_.cell(row=6, column=C0)
BS = "ブラッスリー店舗別"

# =====================================================================
# 月次PL（連結）
# =====================================================================
wp = wb.create_sheet("月次PL")
wp.sheet_view.showGridLines = False
wp.column_dimensions["A"].width = 36
wp.column_dimensions["B"].width = 6
band(wp, 1, "連結 月次損益計算書（FY2027〜FY2031・60か月・百万円）", 10)
month_header(wp, 3, P['start'])
r = 7
PLR = {}
def pl(key, label, f, fmt=MM, bold=False, fill=None):
    global r
    mrow(wp, r, label, f, fmt, bold, fill)
    PLR[key] = r; r += 1
def AGc(key, c): return f"'{BS}'!{c}{AG[key]}"
def YRc(key, c): return f"'余市オーベルジュ'!{c}{YROW[key]}"
def var(key):
    return lambda c, p, m: (f"={AGc('rev1',c)}*{RATE[key][0]}+{AGc('rev2',c)}*{RATE[key][1]}+{AGc('rev3',c)}*{RATE[key][2]}")

sec(wp, r, "■ 店舗数", 2); r += 1
pl("n_b", "ブラッスリー 営業店舗数", lambda c, p, m: f"={AGc('open',c)}", M0)
pl("n_a", "オーベルジュ 営業店舗数", lambda c, p, m: f"=IF({YRc('a_n',c)}>0,1,0)", M0)
pl("n_t", "営業店舗数 計", lambda c, p, m: f"={c}{PLR['n_b']}+{c}{PLR['n_a']}", M0, True)
r += 1
sec(wp, r, "■ ブラッスリー事業", 2); r += 1
pl("b_rev", "売上高", lambda c, p, m: f"={AGc('rev',c)}", bold=True)
pl("b_cogs", "売上原価", var("cogs"))
pl("b_lab", "人件費", var("labor"))
pl("b_out", "業務委託費・消耗品他", var("outs"))
pl("b_dept", "部門利益", lambda c, p, m: f"={c}{PLR['b_rev']}-{c}{PLR['b_cogs']}-{c}{PLR['b_lab']}-{c}{PLR['b_out']}", bold=True, fill=FL_T)
pl("b_adv", "広告宣伝費・販売促進費", var("adv"))
pl("b_oth", "その他経費", var("oth"))
pl("b_utl", "水道光熱費", var("util"))
pl("b_gop", "GOP（店舗営業総利益）", lambda c, p, m: f"={c}{PLR['b_dept']}-{c}{PLR['b_adv']}-{c}{PLR['b_oth']}-{c}{PLR['b_utl']}", bold=True, fill=FL_T)
pl("b_roy", "ロイヤリティ", var("roy"))
pl("b_ins", "保険・租税公課", var("ins"))
pl("b_rnt", "地代家賃（固定）", lambda c, p, m: f"={c}{PLR['n_b']}*{P['rent_m']}")
pl("b_pct", "歩合家賃", lambda c, p, m: f"={AGc('pct',c)}")
pl("b_ffe", "修繕維持費（FFE）", var("ffe"))
pl("b_eb", "店舗EBITDA", lambda c, p, m: f"={c}{PLR['b_gop']}-{c}{PLR['b_roy']}-{c}{PLR['b_ins']}-{c}{PLR['b_rnt']}-{c}{PLR['b_pct']}-{c}{PLR['b_ffe']}", bold=True, fill=FL_T)
r += 1
sec(wp, r, "■ 余市事業（詳細は『余市オーベルジュ』タブ）", 2); r += 1
pl("h_rev", "宿泊売上（食事込み）", lambda c, p, m: f"={YRc('h_rev',c)}")
pl("h_op", "宿泊部門 営業利益（オーナー配当前）", lambda c, p, m: f"={YRc('h_op',c)}")
pl("o_pay", "オーナー配当（営業利益1/3と販売価格1%の高い方）", lambda c, p, m: f"={YRc('o_pay',c)}")
pl("r_rev", "外来レストラン売上", lambda c, p, m: f"={YRc('r_rev',c)}")
pl("r_eb", "外来レストランEBITDA", lambda c, p, m: f"={YRc('r_eb',c)}")
pl("y_eb", "余市 運営EBITDA（配当後）", lambda c, p, m: f"={c}{PLR['h_op']}-{c}{PLR['o_pay']}+{c}{PLR['r_eb']}", bold=True, fill=FL_T)
pl("s_rev", "分譲売上（ホテルコンド）", lambda c, p, m: f"={YRc('s_rev',c)}")
pl("s_cogs", "分譲原価", lambda c, p, m: f"={YRc('s_cogs',c)}")
pl("s_fee", "販売経費", lambda c, p, m: f"={YRc('s_fee',c)}")
pl("s_pl", "分譲損益", lambda c, p, m: f"={c}{PLR['s_rev']}-{c}{PLR['s_cogs']}-{c}{PLR['s_fee']}", bold=True, fill=FL_T)
r += 1
sec(wp, r, "■ 連結", 2); r += 1
pl("rev_ops", "売上高（経常：分譲除く）", lambda c, p, m: f"={c}{PLR['b_rev']}+{c}{PLR['h_rev']}+{c}{PLR['r_rev']}", bold=True)
pl("rev_all", "売上高（分譲含む）", lambda c, p, m: f"={c}{PLR['rev_ops']}+{c}{PLR['s_rev']}", bold=True)
pl("hq", "本部費", lambda c, p, m: f"=INDEX({HQ},VALUE(RIGHT({c}$4,4))-2026)/12")
pl("eb_ops", "連結EBITDA（経常：分譲除く）", lambda c, p, m: f"={c}{PLR['b_eb']}+{c}{PLR['y_eb']}-{c}{PLR['hq']}", bold=True, fill=FL_T)
pl("eb_all", "連結EBITDA（分譲含む）", lambda c, p, m: f"={c}{PLR['eb_ops']}+{c}{PLR['s_pl']}", bold=True, fill=FL_T)
pl("dep", "減価償却費", lambda c, p, m: f"={AGc('dep',c)}")
pl("op", "営業利益", lambda c, p, m: f"={c}{PLR['eb_all']}-{c}{PLR['dep']}", bold=True, fill=FL_Y)
pl("int", "支払利息（建設資金借入）", lambda c, p, m: f"={YRc('l_int',c)}")
pl("ord", "経常利益（税引前）", lambda c, p, m: f"={c}{PLR['op']}-{c}{PLR['int']}", bold=True, fill=FL_Y)
pl("ord_ops", "（参考）経常利益　分譲除く", lambda c, p, m: f"={c}{PLR['ord']}-{c}{PLR['s_pl']}")
wp.cell(row=r + 1, column=1, value="※ 法人税等は含まない。分譲損益（引渡月に一括計上）が単月に集中するため、経常ベース（分譲除く）を並記している。").font = F_NT
wp.freeze_panes = wp.cell(row=6, column=C0)

# =====================================================================
# 月次CF（連結）
# =====================================================================
wc = wb.create_sheet("月次CF")
wc.sheet_view.showGridLines = False
wc.column_dimensions["A"].width = 38
wc.column_dimensions["B"].width = 6
band(wc, 1, "連結 月次キャッシュフロー（FY2027〜FY2031・60か月・百万円）", 10)
month_header(wc, 3, P['start'])
r = 7
CFR = {}
def cf(key, label, f, fmt=MM, bold=False, fill=None):
    global r
    mrow(wc, r, label, f, fmt, bold, fill)
    CFR[key] = r; r += 1
def PLc(key, c): return f"'月次PL'!{c}{PLR[key]}"

sec(wc, r, "■ 営業活動", 2); r += 1
cf("eb", "連結EBITDA（経常：分譲除く）", lambda c, p, m: f"={PLc('eb_ops',c)}")
cf("dep_in", "分譲 手付金受領", lambda c, p, m: f"={YRc('s_depcash',c)}")
cf("bal_in", "分譲 残金受領（引渡）", lambda c, p, m: f"={YRc('s_balcash',c)}")
cf("fee", "分譲 販売経費支払", lambda c, p, m: f"=-{YRc('s_fee',c)}")
cf("int", "支払利息", lambda c, p, m: f"=-{YRc('l_int',c)}")
cf("ocf", "営業CF 計", lambda c, p, m: f"=SUM({c}{CFR['eb']}:{c}{CFR['int']})", bold=True, fill=FL_T)
r += 1
sec(wc, r, "■ 投資活動", 2); r += 1
cf("b_cash", "ブラッスリー 開業時現金支出", lambda c, p, m: f"=-{AGc('cash',c)}")
cf("b_inst", "ブラッスリー 分割弁済（内装・保証金）", lambda c, p, m: f"=-{AGc('inst',c)}")
cf("y_land", "余市 土地取得", lambda c, p, m: f"=-{YRc('d_land',c)}")
cf("y_dev", "余市 開発支出（建設・FF&E・開業前）", lambda c, p, m: f"=-{YRc('d_dev',c)}")
cf("icf", "投資CF 計", lambda c, p, m: f"=SUM({c}{CFR['b_cash']}:{c}{CFR['y_dev']})", bold=True, fill=FL_T)
r += 1
sec(wc, r, "■ 財務活動", 2); r += 1
cf("eq", "増資（シリーズA）", lambda c, p, m: f"=IF(AND(YEAR({c}$3)=YEAR({P['eq_month']}),MONTH({c}$3)=MONTH({P['eq_month']})),{P['eq_amt']},0)")
cf("ln_in", "建設資金借入 実行", lambda c, p, m: f"={YRc('l_draw',c)}")
cf("ln_out", "建設資金借入 返済", lambda c, p, m: f"=-{YRc('l_rep',c)}")
cf("fcf_", "財務CF 計", lambda c, p, m: f"=SUM({c}{CFR['eq']}:{c}{CFR['ln_out']})", bold=True, fill=FL_T)
r += 1
cf("net", "現金増減", lambda c, p, m: f"={c}{CFR['ocf']}+{c}{CFR['icf']}+{c}{CFR['fcf_']}", bold=True)
cf("beg", "月初現金残高", lambda c, p, m: (f"={P['cash0']}" if m == 1 else f"={p}{r+1}"))
cf("end", "月末現金残高", lambda c, p, m: f"={c}{CFR['beg']}+{c}{CFR['net']}", bold=True, fill=FL_Y)
r += 1
cf("loan", "（参考）建設資金借入 残高", lambda c, p, m: f"={YRc('l_bal',c)}")
cf("fcf", "（参考）簡易FCF＝営業CF＋投資CF", lambda c, p, m: f"={c}{CFR['ocf']}+{c}{CFR['icf']}")
cf("cumfcf", "（参考）累計 簡易FCF", lambda c, p, m: (f"={c}{CFR['fcf']}" if m == 1 else f"={p}{r}+{c}{CFR['fcf']}"))
wc.cell(row=r + 1, column=1, value="※ 法人税等・運転資本の増減・分割払いの金利相当は含まない。手付金は引渡まで前受金（負債）としてCFのみに計上。").font = F_NT
wc.freeze_panes = wc.cell(row=6, column=C0)

# =====================================================================
# 年次集計（FY）
# =====================================================================
wa = wb.create_sheet("年次集計")
wa.sheet_view.showGridLines = False
wa.column_dimensions["A"].width = 38
for c in "BCDEFG": wa.column_dimensions[c].width = 12
band(wa, 1, "年次集計（月次PL・CFのFY合計）　単位：百万円", 7)
for j, t in enumerate(FY + ["5年累計"]):
    x = wa.cell(row=3, column=2 + j, value=t); x.font = F_TH; x.fill = FL_T; x.border = BOX
    x.alignment = Alignment(horizontal="center")
wa.cell(row=3, column=1, value="項　目").font = F_TH
AR = {}
r = 4
def ann(key, label, sheet, srow, kind="sum", bold=False, fill=None, fmt=MM):
    """kind: sum=FY合計 / end=FY末値 / min=FY内最小"""
    global r
    wa.cell(row=r, column=1, value=label).font = F_BD if bold else F_BK
    for j in range(5):
        col = CL(2 + j)
        if kind == "sum":
            f = f"=SUMIF('{sheet}'!$C$4:${LASTC}$4,{col}$3,'{sheet}'!$C${srow}:${LASTC}${srow})"
        elif kind == "end":
            f = f"=INDEX('{sheet}'!$C${srow}:${LASTC}${srow},{12*(j+1)})"
        else:
            f = f"=MIN(INDEX('{sheet}'!$C${srow}:${LASTC}${srow},{12*j+1}):INDEX('{sheet}'!$C${srow}:${LASTC}${srow},{12*(j+1)}))"
        x = wa.cell(row=r, column=2 + j, value=f); x.number_format = fmt
        x.font = F_BD if bold else F_BK; x.border = BOX
        if fill: x.fill = fill
    if kind == "sum":
        x = wa.cell(row=r, column=7, value=f"=SUM(B{r}:F{r})"); x.number_format = fmt; x.border = BOX
        x.font = F_BD if bold else F_BK
        if fill: x.fill = fill
    if fill: wa.cell(row=r, column=1).fill = fill
    AR[key] = r; r += 1

sec(wa, r, "■ 店舗数（期末）", 7); r += 1
ann("nb", "ブラッスリー", "月次PL", PLR['n_b'], "end", fmt=M0)
ann("na", "オーベルジュ", "月次PL", PLR['n_a'], "end", fmt=M0)
ann("nt", "合計", "月次PL", PLR['n_t'], "end", bold=True, fmt=M0)
r += 1
sec(wa, r, "■ 損益計算書", 7); r += 1
ann("b_rev", "ブラッスリー 売上高", "月次PL", PLR['b_rev'])
ann("b_eb", "ブラッスリー 店舗EBITDA", "月次PL", PLR['b_eb'])
ann("h_rev", "余市 宿泊売上（食事込み）", "月次PL", PLR['h_rev'])
ann("h_op", "余市 宿泊部門 営業利益（配当前）", "月次PL", PLR['h_op'])
ann("o_pay", "余市 オーナー配当", "月次PL", PLR['o_pay'])
ann("r_rev", "余市 外来レストラン売上", "月次PL", PLR['r_rev'])
ann("y_eb", "余市 運営EBITDA（配当後）", "月次PL", PLR['y_eb'])
ann("rev_ops", "売上高（経常：分譲除く）", "月次PL", PLR['rev_ops'], bold=True, fill=FL_T)
ann("hq", "本部費", "月次PL", PLR['hq'])
ann("eb_ops", "連結EBITDA（経常：分譲除く）", "月次PL", PLR['eb_ops'], bold=True, fill=FL_T)
ann("s_rev", "分譲売上", "月次PL", PLR['s_rev'])
ann("s_pl", "分譲損益", "月次PL", PLR['s_pl'])
ann("rev_all", "売上高（分譲含む）", "月次PL", PLR['rev_all'], bold=True)
ann("eb_all", "連結EBITDA（分譲含む）", "月次PL", PLR['eb_all'], bold=True)
ann("dep", "減価償却費", "月次PL", PLR['dep'])
ann("op", "営業利益", "月次PL", PLR['op'], bold=True, fill=FL_Y)
ann("int", "支払利息", "月次PL", PLR['int'])
ann("ord", "経常利益（税引前）", "月次PL", PLR['ord'], bold=True, fill=FL_Y)
ann("ord_ops", "（参考）経常利益　分譲除く", "月次PL", PLR['ord_ops'])
r += 1
sec(wa, r, "■ キャッシュフロー", 7); r += 1
ann("ocf", "営業CF", "月次CF", CFR['ocf'], bold=True)
ann("icf", "投資CF", "月次CF", CFR['icf'], bold=True)
ann("fcf_", "財務CF", "月次CF", CFR['fcf_'], bold=True)
ann("net", "現金増減", "月次CF", CFR['net'])
ann("end", "期末現金残高", "月次CF", CFR['end'], "end", bold=True, fill=FL_Y)
ann("min", "期中の最低月末現金残高", "月次CF", CFR['end'], "min", fill=FL_K)
ann("loan", "期末 建設資金借入残高", "月次CF", CFR['loan'], "end")
ann("cumfcf", "期末 累計簡易FCF", "月次CF", CFR['cumfcf'], "end")
for k in ("ebm", "opm"):
    pass
r += 1
wa.cell(row=r, column=1, value="連結EBITDA率（経常）").font = F_BK
for j in range(5):
    col = CL(2 + j)
    x = wa.cell(row=r, column=2 + j, value=f"=IF({col}{AR['rev_ops']}=0,0,{col}{AR['eb_ops']}/{col}{AR['rev_ops']})"); x.number_format = PC; x.border = BOX
AR["ebm"] = r; r += 1
wa.cell(row=r, column=1, value="営業利益率（分譲除く）").font = F_BK
for j in range(5):
    col = CL(2 + j)
    x = wa.cell(row=r, column=2 + j, value=f"=IF({col}{AR['rev_ops']}=0,0,({col}{AR['op']}-{col}{AR['s_pl']})/{col}{AR['rev_ops']})"); x.number_format = PC; x.border = BOX
AR["opm"] = r; r += 1
wa.freeze_panes = "B4"

# =====================================================================
# サマリー
# =====================================================================
wsu = wb.create_sheet("サマリー", 0)
wsu.sheet_view.showGridLines = False
wsu.column_dimensions["A"].width = 40
for c in "BCDEFG": wsu.column_dimensions[c].width = 12
wsu.column_dimensions["H"].width = 3
wsu.column_dimensions["I"].width = 60
band(wsu, 1, "ティエリーマルクス 10店舗＋余市オーベルジュ　事業計画サマリー（FY2027〜FY2031）", 9)
wsu["A2"] = "2027年4月 六本木 → 2028年秋 → 2029年夏・冬 → 2030年 2店（うち余市オーベルジュ）→ 2031年 2店 → 2032年 2店　計10店舗。FY＝4月〜翌3月、単位：百万円"
wsu["A2"].font = F_NT
for j, t in enumerate(FY + ["5年累計"]):
    x = wsu.cell(row=4, column=2 + j, value=t); x.font = F_TH; x.fill = FL_T; x.border = BOX
    x.alignment = Alignment(horizontal="center")
wsu.cell(row=4, column=1, value="主要指標").font = F_TH
r = 5
SR = {}
def sm(key, label, bold=False, fill=None, fmt=MM, total=True):
    global r
    wsu.cell(row=r, column=1, value=label).font = F_BD if bold else F_BK
    for j in range(5):
        col = CL(2 + j)
        x = wsu.cell(row=r, column=2 + j, value=f"='年次集計'!{col}{AR[key]}")
        x.number_format = fmt; x.border = BOX; x.font = F_BD if bold else F_GR
        if fill: x.fill = fill
    if total:
        x = wsu.cell(row=r, column=7, value=f"='年次集計'!G{AR[key]}"); x.number_format = fmt; x.border = BOX
        x.font = F_BD if bold else F_GR
        if fill: x.fill = fill
    SR[key] = r; r += 1
sm("nt", "期末店舗数（ブラッスリー＋オーベルジュ）", True, fmt=M0, total=False)
sm("rev_ops", "売上高（経常：分譲除く）", True)
sm("b_rev", "　うちブラッスリー")
sm("h_rev", "　うち余市 宿泊（食事込み）")
sm("r_rev", "　うち余市 外来レストラン")
sm("y_eb", "余市 運営EBITDA（オーナー配当後）")
sm("eb_ops", "連結EBITDA（経常：分譲除く）", True, FL_T)
sm("ebm", "　連結EBITDA率（経常）", fmt=PC, total=False)
sm("s_pl", "分譲損益（ホテルコンド・引渡時一括）", True)
sm("op", "営業利益（分譲含む）", True, FL_Y)
sm("ord", "経常利益（税引前・分譲含む）", True, FL_Y)
sm("ord_ops", "（参考）経常利益　分譲除く")
sm("end", "期末現金残高", True)
sm("min", "期中の最低月末現金残高", True, FL_K, total=False)
r += 1
sec(wsu, r, "■ 旧計画（9店舗・余市なし）との比較", 9); r += 1
OLD = {"店舗数": [1, 3, 5, 7, 9], "売上高": [414.0, 968.3, 1879.1, 2799.1, 3719.1],
       "連結EBITDA": [37.4, 103.5, 233.7, 377.9, 523.2], "営業利益": [16.6, 56.7, 145.9, 249.6, 354.2]}
for lab, key, fmt in [("旧計画 期末店舗数", "店舗数", M0), ("旧計画 売上高", "売上高", MM), ("旧計画 連結EBITDA", "連結EBITDA", MM), ("旧計画 営業利益", "営業利益", MM)]:
    wsu.cell(row=r, column=1, value=lab).font = F_BK
    for j, v in enumerate(OLD[key]):
        x = wsu.cell(row=r, column=2 + j, value=v); x.number_format = fmt; x.border = BOX; x.font = F_IN
    if key != "店舗数":
        x = wsu.cell(row=r, column=7, value=f"=SUM(B{r}:F{r})"); x.number_format = fmt; x.border = BOX
    r += 1
wsu.cell(row=r, column=1, value="差異：売上高（経常）").font = F_BD
for j in range(6):
    col = CL(2 + j)
    x = wsu.cell(row=r, column=2 + j, value=f"={col}{SR['rev_ops']}-{col}{r-3}"); x.number_format = MM; x.border = BOX
r += 1
wsu.cell(row=r, column=1, value="差異：連結EBITDA（経常）").font = F_BD
for j in range(6):
    col = CL(2 + j)
    x = wsu.cell(row=r, column=2 + j, value=f"={col}{SR['eb_ops']}-{col}{r-3}"); x.number_format = MM; x.border = BOX
r += 1
wsu.cell(row=r, column=1, value="※ 旧計画の値は『ティエリーマルクス・ブラッスリー_5か年事業計画_FY2027-2031.xlsx』（5カ年連結PL）からの転記。").font = F_NT
r += 2
sec(wsu, r, "■ 余市オーベルジュ（新構想）主要数値・満年度", 9); r += 1
for lab, ref, fmt in [("総事業費", YR['tpc'], MM), ("分譲総額（500坪×坪1,000万）", YR['s_total'], MM),
                      ("分譲損益（引渡時）", YR['fy_pl'], MM), ("宿泊売上（食事込み）", YR['fy_hrev'], MM),
                      ("宿泊部門 営業利益（配当前）", YR['fy_hop'], MM), ("オーナー配当（1/3と1%の高い方）", YR['fy_div'], MM),
                      ("外来レストラン売上", YR['fy_rrev'], MM), ("余市 運営EBITDA（配当後）", YR['fy_ops'], MM),
                      ("損益分岐の稼働率", YR['fy_be'], PC), ("1/3配当が1%を上回る稼働率", YR['fy_sw'], PC)]:
    wsu.cell(row=r, column=1, value=lab).font = F_BK
    x = wsu.cell(row=r, column=2, value=f"={ref}"); x.number_format = fmt; x.font = F_GR; x.border = BOX
    r += 1
r += 1
notes = [
    "■ 前提の出所",
    "　・ブラッスリー：旧5か年計画と同一（六本木ミッドタウン2026/8/3提出P&L、立上り90/98/100%、経費率の年次改善、分割払いスキーム、契約金1〜3号店1,000万・4号店以降500万）",
    "　・余市：新構想（ヴィラ30坪×10＋ホテル客室20坪×10、延床900坪×坪200万、坪1,000万で分譲、オーナー配当＝営業利益1/3と販売価格1%の高い方、外来レストラン）。余市川ワイナリー案件は終了のため削除",
    "■ 主な変更点（旧計画比）",
    "　・出店時期を月単位で指定。運営年次（立上り・経費改善）も開業月起算の12か月単位で判定",
    "　・季節変動：六本木（テラス有）と他店（テラス無）で別の月別指数を適用。初期設定は年額を満年度に合わせる正規化方式（前提条件シートで切替）",
    "　・5店舗目を余市オーベルジュとし、土地取得（2027年10月）・建設（2028年7月着工・24か月）・分譲（2030年6月引渡）・開業（2030年7月）を月次で反映",
    "■ 留意事項",
    "　・分譲損益は引渡月（2030年6月＝FY2030）に一括計上される。経常的な収益力は『分譲除く』の行で見ること",
    "　・法人税等・運転資本の増減は含まない。分譲損益（約15.8億円）に係る法人税は概算で約4.7億円（実効税率30%）がFY2030〜31に発生しうる",
    "　・2032年1月・3月開業の2店はFY2031末の数か月のみ計上。満年度効果はFY2032以降",
    "　・余市の前提リスク（土地価格は仮置き、温泉の湧出、保安林・農振・急傾斜地の指定、坪1,000万での分譲の売れ行き、宿泊運営ブランド）は未解消",
]
for n in notes:
    wsu.cell(row=r, column=1, value=n).font = F_H2 if n.startswith("■") else F_BK
    r += 1

# シート順
order = ["サマリー", "年次集計", "月次PL", "月次CF", "余市オーベルジュ", "ブラッスリー店舗別", "出店計画", "前提条件"]
wb._sheets.sort(key=lambda s: order.index(s.title))
wb.save(OUT)
print("saved", OUT)
