# -*- coding: utf-8 -*-
"""株式会社Brasserie Thierry Marx 株主名簿（現時点）と資本政策（実績＋予定）。
出所: 履歴事項全部証明書（2026/11/18）、株主リスト（11/6臨時株主総会）、11/6臨時株主総会議事録（Land＆Company 134株）、
      総数引受契約書（Land＆Company・池上様・城戸様）、司法書士メール（DES 3,602万1,416円、11/20登記申請）。
"""
import os
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "BTM_株主名簿・資本政策_20261122.xlsx")
F = "Meiryo UI"; NAVY = "1F3864"; SUB = "D9E1F2"; GREY = "F2F2F2"; KEY = "FFF2CC"; PLAN = "E2EFDA"; RED = "C00000"
thin = Side(style="thin", color="BFBFBF"); BD = Border(top=thin, bottom=thin, left=thin, right=thin)
N = '#,##0;▲#,##0;-'; P = '0.0%'

def st(c, size=10, bold=False, color="000000", fill=None, al="left", fmt=None, wrap=False):
    c.font = Font(name=F, size=size, bold=bold, color=color)
    if fill: c.fill = PatternFill("solid", fgColor=fill)
    c.alignment = Alignment(horizontal=al, vertical="center", wrap_text=wrap)
    c.border = BD
    if fmt: c.number_format = fmt

def title(ws, text, sub, width):
    ws["A1"].value = text; ws["A1"].font = Font(name=F, size=14, bold=True, color="FFFFFF")
    ws["A1"].fill = PatternFill("solid", fgColor=NAVY); ws.merge_cells(start_row=1, start_column=1, end_row=1, end_column=width)
    ws["A2"].value = sub; ws["A2"].font = Font(name=F, size=9, color="595959")
    ws.merge_cells(start_row=2, start_column=1, end_row=2, end_column=width)
    ws.row_dimensions[1].height = 26

def hdr(ws, r, labels):
    for i, l in enumerate(labels, 1):
        c = ws.cell(r, i, l); st(c, 10, True, "FFFFFF", NAVY, "center", wrap=True)
    ws.row_dimensions[r].height = 30

wb = Workbook()

# ───────── 1. 株主名簿（現時点で払込済み） ─────────
S = wb.active; S.title = "株主名簿（現時点）"
title(S, "株式会社Brasserie Thierry Marx　株主名簿（2026年11月22日現在・払込済み分）",
      "11/13払込のLand＆Company 134株まで。12/1払込予定の個人投資家は「資本政策」シートに予定として記載。", 9)
hdr(S, 4, ["No", "株主名", "区分", "株式数", "持株比率", "取得日", "取得の方法", "払込金額（円）", "登記"])
ROWS = [
    (1, "中野 邦人", "甲側（代表取締役）", 1300, "2026/10/1・10/30", "設立時10株（1株1万円）→10/30株式分割（1:130）", 100_000, "済（11/18登記完了）"),
    (2, "合同会社WineBank P3", "甲側", 550, "2026/10/30", "第三者割当 1株10万円（現金2,000万円＋DES 3,500万円）", 55_000_000, "済（11/18登記完了）"),
    (3, "株式会社Land＆Company（田角様）", "外部投資家", 134, "2026/11/13", "第三者割当 1株15万円", 20_100_000, "11/20申請・12/4〜8頃完了見込み"),
]
r = 5
for no, nm, kb, sh, dt, how, amt, reg in ROWS:
    vals = [no, nm, kb, sh, f"=D{r}/$D$8", dt, how, amt, reg]
    for i, v in enumerate(vals, 1):
        c = S.cell(r, i, v)
        st(c, 10, al=("center" if i in (1, 4, 5, 6) else "left"), fmt=(N if i in (4, 8) else P if i == 5 else None), wrap=(i == 7))
    S.row_dimensions[r].height = 30; r += 1
st(S.cell(8, 1), fill=GREY); st(S.cell(8, 2, "合計"), bold=True, fill=GREY); st(S.cell(8, 3), fill=GREY)
st(S.cell(8, 4, "=SUM(D5:D7)"), bold=True, fill=GREY, al="center", fmt=N)
st(S.cell(8, 5, "=SUM(E5:E7)"), bold=True, fill=GREY, al="center", fmt=P)
for col in (6, 7): st(S.cell(8, col), fill=GREY)
st(S.cell(8, 8, "=SUM(H5:H7)"), bold=True, fill=GREY, fmt=N); st(S.cell(8, 9), fill=GREY)
st(S.cell(9, 2, "うち甲側（中野＋P3）"), bold=True, fill=KEY); st(S.cell(9, 4, "=D5+D6"), bold=True, fill=KEY, al="center", fmt=N)
st(S.cell(9, 5, "=E5+E6"), bold=True, fill=KEY, al="center", fmt=P)

S["A11"].value = "■ 資本金・資本準備金（11/13増資後）"; S["A11"].font = Font(name=F, size=11, bold=True)
CAP = [("資本金", 37_650_000, "設立10万円＋10/30 2,750万円＋11/13 1,005万円（登記上は現在2,760万円、11/13分は登記中）"),
       ("資本準備金", 37_550_000, "10/30 2,750万円＋11/13 1,005万円（払込額の1/2）"),
       ("払込資本 計", "=B12+B13", "")]
for i, (k, v, note) in enumerate(CAP):
    rr = 12 + i
    st(S.cell(rr, 1, k), bold=(i == 2)); S.merge_cells(start_row=rr, start_column=1, end_row=rr, end_column=1)
    st(S.cell(rr, 2, v), bold=(i == 2), al="center", fmt=N); st(S.cell(rr, 3, note), 9, color="595959")
    S.merge_cells(start_row=rr, start_column=3, end_row=rr, end_column=9)

S["A16"].value = "■ 補足"; S["A16"].font = Font(name=F, size=11, bold=True)
NOTES = ["DESの対象債権は3,602万1,416円。550株×10万円＝5,500万円のうち現金2,000万円を除いた3,500万円を株式に振替え、残り約102万円はWineBankへの返金（債権のまま）。",
         "発行可能株式総数10万株。株式の譲渡には株主総会の承認が必要（譲渡制限株式）。新株予約権（SO）の発行なし。",
         "株主名簿には住所の記載も必要。中野様・P3の住所は株主リスト（司法書士作成）に記載済み。Land＆Companyの本店所在地は要記入。"]
for i, t in enumerate(NOTES):
    c = S.cell(17 + i, 1, f"・{t}"); c.font = Font(name=F, size=9, color="404040"); c.alignment = Alignment(wrap_text=True, vertical="top")
    S.merge_cells(start_row=17 + i, start_column=1, end_row=17 + i, end_column=9); S.row_dimensions[17 + i].height = 28
for col, w in zip("ABCDEFGHI", [5, 30, 18, 10, 10, 16, 40, 15, 26]): S.column_dimensions[col].width = w

# ───────── 2. 資本政策（実績＋予定） ─────────
C = wb.create_sheet("資本政策")
title(C, "株式会社Brasserie Thierry Marx　資本政策（実績＋予定）",
      "白＝登記・払込済み、緑＝予定（12/1個人投資家・2月末P3）。個人投資家の人数（4名／5名）は黄色セルで変更可。", 16)
C["A3"].value = "個人投資家の人数"; C["A3"].font = Font(name=F, size=10, bold=True)
st(C["C3"], 11, True, "0000FF", KEY, "center"); C["C3"].value = 4
C["D3"].value = "← 4 または 5（エンジェル税制の依頼は4名・最大5名）"; C["D3"].font = Font(name=F, size=9, color="595959")
hdr(C, 5, ["株主", "区分",
           "①設立\n10/1", "②10/30\n分割・増資", "比率",
           "③11/13\nL&C", "比率",
           "④12/1\n個人(予定)", "比率",
           "⑤2月末\nP3(予定)", "比率",
           "1株価格\n（円）", "払込額\n（万円）", "払込日", "状況", "備考"])
INV = [  # 名称, 区分, ①, ②, ③, ④, ⑤, 価格, 払込日, 状況, 備考, 個人番号(人数判定)
    ("中野 邦人", "甲側", 10, 1300, 1300, 1300, 1300, 10_000, "2026/10/1", "登記済", "設立10株を10/30に1:130で分割", 0),
    ("合同会社WineBank P3", "甲側", 0, 550, 550, 550, 700, 100_000, "10/30・2月末", "550株 登記済／150株 予定", "10/30：現金2,000＋DES 3,500。2月末：150株×10万円＝1,500万円", 0),
    ("株式会社Land＆Company（田角様）", "外部", 0, 0, 134, 134, 134, 150_000, "2026/11/13", "着金済・登記申請中", "総数引受契約 締結済（MFクラウド契約）", 0),
    ("池上 貴樹 様", "外部（個人）", 0, 0, 0, 66, 66, 160_000, "2026/12/1", "出資意向あり・契約内容了承（10/31）", "クラウドサイン締結の完了は要確認", 1),
    ("城戸 直義 様", "外部（個人）", 0, 0, 0, 66, 66, 160_000, "2026/12/1", "契約書作成済（10/30最終版）", "締結状況 要確認", 2),
    ("個人投資家 3人目", "外部（個人）", 0, 0, 0, 66, 66, 160_000, "2026/12/1", "氏名 要記入", "", 3),
    ("個人投資家 4人目", "外部（個人）", 0, 0, 0, 66, 66, 160_000, "2026/12/1", "氏名 要記入", "", 4),
    ("個人投資家 5人目（5名の場合）", "外部（個人）", 0, 0, 0, 66, 66, 160_000, "2026/12/1", "未定", "人数=5のときだけ計上", 5),
]
r0 = 6; rN = r0 + len(INV) - 1; TOT = rN + 1
for i, (nm, kb, a, b, c3, d, e, px, dt, stt, note, k) in enumerate(INV):
    r = r0 + i
    def g(v):  # 個人投資家は人数に応じて計上
        return v if k == 0 else (f"=IF($C$3>={k},{v},0)" if v else 0)
    vals = [nm, kb, a, b, f"=D{r}/D${TOT}", c3, f"=F{r}/F${TOT}", g(d), f"=H{r}/H${TOT}", g(e), f"=J{r}/J${TOT}", px]
    plan = k > 0
    for j, v in enumerate(vals, 1):
        cc = C.cell(r, j, v)
        fill = PLAN if (plan and j >= 8) or (j in (10, 11) and nm.startswith("合同")) else None
        st(cc, 10, al=("left" if j <= 2 else "center"), fmt=(P if j in (5, 7, 9, 11) else N if j >= 3 else None), fill=fill)
    # 払込額（万円）
    if k == 0 and nm.startswith("中野"): amt = 10
    elif nm.startswith("合同"): amt = "=(J{0}-0)*L{0}/10000".format(r)
    elif nm.startswith("株式会社Land"): amt = f"=F{r}*L{r}/10000"
    else: amt = f"=J{r}*L{r}/10000"
    st(C.cell(r, 13, amt), 10, al="center", fmt=N)
    st(C.cell(r, 14, dt), 9, al="center"); st(C.cell(r, 15, stt), 9, color=(RED if "要" in stt or "未定" in stt else "000000"), wrap=True)
    st(C.cell(r, 16, note), 9, color="595959", wrap=True); C.row_dimensions[r].height = 30
st(C.cell(TOT, 1, "合計（発行済株式数）"), bold=True, fill=GREY); st(C.cell(TOT, 2), fill=GREY)
for j, col in [(3, "C"), (4, "D"), (6, "F"), (8, "H"), (10, "J"), (13, "M")]:
    st(C.cell(TOT, j, f"=SUM({col}{r0}:{col}{rN})"), bold=True, fill=GREY, al="center", fmt=N)
for j, col in [(5, "E"), (7, "G"), (9, "I"), (11, "K")]:
    st(C.cell(TOT, j, f"=SUM({col}{r0}:{col}{rN})"), bold=True, fill=GREY, al="center", fmt=P)
for j in (12, 14, 15, 16): st(C.cell(TOT, j), fill=GREY)
KR = TOT + 1
st(C.cell(KR, 1, "うち甲側（中野＋P3）"), bold=True, fill=KEY); st(C.cell(KR, 2), fill=KEY)
for j, col in [(4, "D"), (6, "F"), (8, "H"), (10, "J")]:
    st(C.cell(KR, j, f"={col}{r0}+{col}{r0+1}"), bold=True, fill=KEY, al="center", fmt=N)
for j, col in [(5, "E"), (7, "G"), (9, "I"), (11, "K")]:
    st(C.cell(KR, j, f"={col}{r0}+{col}{r0+1}"), bold=True, fill=KEY, al="center", fmt=P)
st(C.cell(KR, 3), fill=KEY)
for j in range(12, 17): st(C.cell(KR, j), fill=KEY)
C.cell(KR, 16).value = "合意書の甲側66%以上を維持"

# 資本金の推移
R2 = KR + 2
C.cell(R2, 1, "■ 資本金・資本準備金の推移（万円）").font = Font(name=F, size=11, bold=True)
hdr(C, R2 + 1, ["項目", "", "①設立", "②10/30", "", "③11/13", "", "④12/1", "", "⑤2月末", "", "", "", "", "", "備考"])
NI = f"$C$3"
cap = [("増資額（払込総額）", ["10", "5500", "", "2010", "", f"=66*16*{NI}", "", "1500"]),
       ("資本金（累計）", ["10", "=C{a}+D{b}/2", "", "=D{c}+F{b}/2", "", "=F{c}+H{b}/2", "", "=H{c}+J{b}/2"]),
       ("資本準備金（累計）", ["0", "=D{b}/2", "", "=D{d}+F{b}/2", "", "=F{d}+H{b}/2", "", "=H{d}+J{b}/2"])]
b = R2 + 2; cR = b + 1; dR = b + 2
cols = ["C", "D", "E", "F", "G", "H", "I", "J"]
for i, (lab, vals) in enumerate(cap):
    rr = b + i
    st(C.cell(rr, 1, lab), bold=(i == 1)); st(C.cell(rr, 2))
    for col, v in zip(cols, vals):
        v = v.format(a=cR, b=b, c=cR, d=dR) if v else None
        if v and not v.startswith("="): v = float(v)
        cc = C[f"{col}{rr}"]; cc.value = v; st(cc, 10, al="center", fmt=N, fill=(PLAN if col in "HJ" and v is not None else None))
    for j in range(11, 17): st(C.cell(rr, j))
C.cell(b, 16).value = "10/30：現金2,000＋DES 3,500（DES対象債権3,602のうち102は返金）"
C.cell(cR, 16).value = "登記上は現在2,760万円（11/13分は12/4〜8頃に3,765万円へ）"

# 株価の推移
R3 = dR + 2
C.cell(R3, 1, "■ 1株価格とバリュエーション").font = Font(name=F, size=11, bold=True)
hdr(C, R3 + 1, ["ラウンド", "", "1株価格（円）", "株数", "", "プレ（万円）", "", "ポスト（万円）", "", "", "", "", "", "", "", "備考"])
VAL = [("10/30 P3（甲側）", 100000, 550, "=1300*C{r}/10000", "=(1300+D{r})*C{r}/10000", "創業時の甲側出資（合意書の甲側7,000万円＝700株の一部）"),
       ("11/13 Land＆Company", 150000, 134, "=2000*C{r}/10000", "=(2000+D{r})*C{r}/10000", "契約書のプレ＝2,000株×15万円＝3億円（P3の未払込150株を含む）"),
       ("12/1 個人投資家", 160000, f"=66*{NI}", "=2000*C{r}/10000", "=(2134+D{r})*C{r}/10000", "契約書のプレ＝2,000株×16万円＝3.2億円（実践会ご案内価格）"),
       ("2月末 P3（甲側）", 100000, 150, "", "", "当初約束の残り150株。直近の第三者価格16万円より低い（確認事項参照）")]
for i, (lab, px, sh, pre, post, note) in enumerate(VAL):
    rr = R3 + 2 + i
    st(C.cell(rr, 1, lab)); st(C.cell(rr, 2))
    st(C.cell(rr, 3, px), al="center", fmt=N); st(C.cell(rr, 4, sh), al="center", fmt=N); st(C.cell(rr, 5))
    st(C.cell(rr, 6, pre.format(r=rr) if pre else "-"), al="center", fmt=N); st(C.cell(rr, 7))
    st(C.cell(rr, 8, post.format(r=rr) if post else "-"), al="center", fmt=N)
    for j in range(9, 16): st(C.cell(rr, j))
    st(C.cell(rr, 16, note), 9, color="595959", wrap=True); C.row_dimensions[rr].height = 28
for col, w in zip("ABCDEFGHIJKLMNOP", [30, 11, 9, 10, 8, 10, 8, 10, 8, 10, 8, 10, 10, 12, 22, 44]):
    C.column_dimensions[col].width = w
C.freeze_panes = "C6"

# ───────── 3. 確認事項 ─────────
K = wb.create_sheet("確認事項")
title(K, "確認事項（資本政策・株主名簿）", "優先度の高い順。", 4)
hdr(K, 4, ["No", "項目", "内容", "対応案"])
ITEMS = [
    ("発行済株式数の表明保証（L&C契約）",
     "L&Cの総数引受契約 第7条で「発行済2,000株（10/30に1,990株発行後）」と表明しているが、実際は1,850株（中野1,300＋P3 550）。P3の残り150株は2月末払込予定。",
     "プレ3億円の前提（2,000株）は「P3の150株を含む」と説明できる。田角様へ一言説明（または覚書）をしておくと安全。"),
    ("発行済株式数の表明保証（池上様・城戸様の契約）",
     "契約書では「発行済2,134株（11/13の134株発行後）」としているが、12/1時点の実数は1,984株。",
     "未締結なら「1,984株（ほか2月末にP3へ150株を発行予定）」に修正してから締結。締結済みなら覚書で補足。"),
    ("12/1増資の株主総会の日付",
     "池上様・城戸様の契約書は「2026年11月16日付の株主総会決議」と記載。司法書士への依頼は11/20時点で「これから情報を取りまとめる」段階。",
     "議事録の日付を契約書に合わせる（11/16付）か、契約書の日付を修正。司法書士（村上様）に人数・氏名・株数をまとめて連絡。"),
    ("2月末のP3払込価格（1株10万円）",
     "11/13に15万円、12/1に16万円で第三者に発行した後に、甲側へ10万円で発行すると有利発行に当たる可能性。P3（法人）に差額（6万円×150株＝900万円）の受贈益課税が生じるリスク。",
     "税理士に確認。代案：①P3の払込額1,500万円を16万円で発行（約93株）、②1,500万円を貸付金にする、③12/1と同日に10万円で発行（約束の履行として整理）。"),
    ("個人投資家の確定状況",
     "池上様は出資意向・契約内容了承（10/31）。城戸様は最終版の契約書を作成済み。3人目以降の氏名と、クラウドサインの締結状況はメールでは確認できず。",
     "疋田さんに締結済みの方の一覧を確認。エンジェル税制（プレシード特例）の対象者リストにも同じ一覧を使う。"),
    ("決算期の区切り（11/24までに回答）",
     "稲垣税理士より「11月末で決算を区切るなら11/24までに正式依頼を」との連絡（11/21）。",
     "11/30で第1期を締めると、12/1からの第2期は期首資本金1,000万円以上の新設法人として自動的に課税事業者になり、開業前の消費税（約1,070万円）の還付を受けやすい。税理士に確認のうえ回答。"),
    ("DESの差額（約102万円）",
     "DES対象債権3,602万円のうち3,500万円を株式に振替え、約102万円はBTMのWineBankへの未払として残っている。",
     "開業前の資金繰りで返金時期を決める（資金繰り表にはまだ入れていない）。"),
]
for i, (a, b2, c2) in enumerate(ITEMS):
    r = 5 + i
    for j, v in enumerate([i + 1, a, b2, c2], 1):
        cc = K.cell(r, j, v); st(cc, 10, bold=(j == 2), al=("center" if j == 1 else "left"), wrap=True)
    K.row_dimensions[r].height = 62
for col, w in zip("ABCD", [5, 28, 60, 60]): K.column_dimensions[col].width = w

for ws in wb:
    ws.sheet_view.showGridLines = False
    ws.page_setup.orientation = "landscape"; ws.page_setup.fitToWidth = 1; ws.page_setup.fitToHeight = 0
    ws.sheet_properties.pageSetUpPr.fitToPage = True
wb.calculation.fullCalcOnLoad = True
wb.save(OUT); print("saved", OUT)
