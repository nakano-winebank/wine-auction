# -*- coding: utf-8 -*-
"""プランB（カンテサンス案件が無くなった場合）：ティエリーマルクス運営会社の51%をWineBankが取得して増資する場合の
試算と、プランA（WineBank＋カンテサンス）との比較（2026/11/25、社内検討用）。

使い方:
  python3 build_planb.py <テンプレートpptx> <出力xlsx> <出力pptx>
数値：WineBankは3か年予算v16（2029・2030年度は延長の仮置き）、プランAは ../20261115_シンプル版_WineBank＋カンテサンス/model_simple.json、
ティエリーマルクスは「THIERRY MARX × WineBank_投資家様20261027」の5か年事業計画（FY＝4月〜3月）。
"""
import copy
import json
import sys

from lxml import etree
from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_CONNECTOR, MSO_SHAPE
from pptx.enum.text import MSO_ANCHOR, PP_ALIGN
from pptx.util import Inches as I, Pt

NAVY, NAVY2, COPPER, CARD, SAND = "30373F", "36394B", "C68A65", "F6F6F6", "EAD5C7"
BLACK, WHITE, GREY, LINE, BEIGE = "000000", "FFFFFF", "595959", "E3E3E3", "F3EDE6"
F = "Meiryo"
A = "{http://schemas.openxmlformats.org/drawingml/2006/main}"
R = "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}"

TEMPLATE, XLSX, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
pr = Presentation(TEMPLATE)
N_ORIG = len(pr.slides)

# テンプレートから流用する部品（CONFIDENTIALバッジ・ページ番号）
BADGE = PAGENUM = None
for s in pr.slides:
    for sh in s.shapes:
        if BADGE is None and sh.has_text_frame and sh.text_frame.text.strip() == "CONFIDENTIAL":
            BADGE = copy.deepcopy(sh._element)
        if PAGENUM is None and sh.is_placeholder and sh.placeholder_format.type == 13:  # SLIDE_NUMBER
            PAGENUM = copy.deepcopy(sh._element)
# ロゴはマスター2にあるため、元資料の本文スライドと同じレイアウトを使う
BLANK = next(sl.slide_layout for sl in pr.slides
             if sl.slide_layout.name == "BLANK" and sl.slide_layout.slide_master is not pr.slide_masters[0])


# ───────── 描画ヘルパー ─────────
def _ea(run):
    rPr = run._r.get_or_add_rPr()
    for tag in ("ea", "cs", "sym"):
        el = rPr.find(A + tag)
        if el is None:
            el = etree.SubElement(rPr, A + tag)
        el.set("typeface", F)


def _fill_runs(tf, parts, size, bold, color, align, space):
    if isinstance(parts, str):
        parts = [[(parts, {})]]
    if parts and isinstance(parts[0], tuple):
        parts = [parts]
    split = []
    for line_ in parts:
        cur = []
        for t, o in line_:
            chunks = t.split("\n")
            for k, ch in enumerate(chunks):
                if k:
                    split.append(cur)
                    cur = []
                cur.append((ch, o))
        split.append(cur)
    parts = split
    first = True
    for line in parts:
        p = tf.paragraphs[0] if first else tf.add_paragraph()
        first = False
        p.alignment = align
        if space:
            p.line_spacing = space
        for t, o in line:
            r = p.add_run()
            r.text = t
            r.font.name = F
            _ea(r)
            r.font.size = Pt(o.get("sz", size))
            r.font.bold = o.get("b", bold)
            r.font.color.rgb = RGBColor.from_string(o.get("c", color))
        # 空セルは段落末の既定サイズ（18pt）で行が高くなるため、段落末にも同じサイズを入れる
        p._p.get_or_add_endParaRPr().set("sz", str(int(size * 100)))


def tb(sl, x, y, w, h, parts, size=10, bold=False, color=NAVY, align=PP_ALIGN.LEFT,
       anchor=MSO_ANCHOR.TOP, space=None):
    sp = sl.shapes.add_textbox(I(x), I(y), I(w), I(h))
    tf = sp.text_frame
    tf.word_wrap = True
    tf.vertical_anchor = anchor
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    _fill_runs(tf, parts, size, bold, color, align, space)
    return sp


def rect(sl, x, y, w, h, fill=None, line=None, lw=0.75, shape=MSO_SHAPE.RECTANGLE):
    sp = sl.shapes.add_shape(shape, I(x), I(y), I(w), I(h))
    if fill:
        sp.fill.solid()
        sp.fill.fore_color.rgb = RGBColor.from_string(fill)
    else:
        sp.fill.background()
    if line:
        sp.line.color.rgb = RGBColor.from_string(line)
        sp.line.width = Pt(lw)
    else:
        sp.line.fill.background()
    style = sp._element.find("{http://schemas.openxmlformats.org/presentationml/2006/main}style")
    if style is not None:
        sp._element.remove(style)
    return sp


def boxtext(sp, parts, size=9, bold=False, color=WHITE, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE,
            space=None, margin=0.04):
    tf = sp.text_frame
    tf.word_wrap = True
    tf.vertical_anchor = anchor
    tf.margin_left = tf.margin_right = I(margin)
    tf.margin_top = tf.margin_bottom = I(0.02)
    _fill_runs(tf, parts, size, bold, color, align, space)


def line(sl, x1, y1, x2, y2, color=GREY, w=1.0):
    c = sl.shapes.add_connector(MSO_CONNECTOR.STRAIGHT, I(x1), I(y1), I(x2), I(y2))
    c.line.color.rgb = RGBColor.from_string(color)
    c.line.width = Pt(w)
    return c


def new_slide(title, band, band_size=13):
    s = pr.slides.add_slide(BLANK)
    for ph in list(s.placeholders):
        ph._element.getparent().remove(ph._element)
    rect(s, 0, 5.482, 10, 0.143, fill=NAVY)
    if BADGE is not None:
        s.shapes._spTree.append(copy.deepcopy(BADGE))
    if PAGENUM is not None:
        s.shapes._spTree.append(copy.deepcopy(PAGENUM))
    tb(s, 0.262, 0.314, 9.4, 0.30, title, size=14, bold=True, color=BLACK)
    b = rect(s, 0, 0.737, 10, 0.359, fill=NAVY2)
    boxtext(b, band, size=band_size, bold=True, color=WHITE)
    return s


def table(sl, x, y, col_w, row_h, rows, size=8, header_rows=1, merges=(), styles=None):
    """rows: セル文字列の2次元配列。styles[(r,c)] = dict(fill,color,bold,align,size)。"""
    nr, nc = len(rows), len(col_w)
    gt = sl.shapes.add_table(nr, nc, I(x), I(y), I(sum(col_w)), I(sum(row_h)))
    t = gt.table
    tblPr = t._tbl.tblPr
    for attr in ("firstRow", "bandRow"):
        tblPr.set(attr, "0")
    style_id = tblPr.find(A + "tableStyleId")
    if style_id is not None:
        style_id.text = "{5940675A-B579-460E-94D1-54222C63F5DA}"  # No Style, Table Grid
    for j, w in enumerate(col_w):
        t.columns[j].width = I(w)
    for i, h in enumerate(row_h):
        t.rows[i].height = I(h)
    for (r0, c0, r1, c1) in merges:
        t.cell(r0, c0).merge(t.cell(r1, c1))
    styles = styles or {}
    for i in range(nr):
        for j in range(nc):
            cell = t.cell(i, j)
            if cell.is_spanned:
                # 結合で隠れたセルも既定18ptの空段落が行高を押し上げるため、文字サイズを揃えておく
                cell.text_frame.paragraphs[0].text = ""
                _fill_runs(cell.text_frame, [[("", {})]], size, False, NAVY, PP_ALIGN.LEFT, None)
                continue
            st = dict(fill=WHITE, color=NAVY, bold=False, align=PP_ALIGN.RIGHT if j > 0 else PP_ALIGN.LEFT,
                      size=size)
            if i < header_rows:
                st.update(fill=NAVY2, color=WHITE, bold=True, align=PP_ALIGN.CENTER)
            st.update(styles.get((i, None), {}))
            st.update(styles.get((i, j), {}))
            cell.fill.solid()
            cell.fill.fore_color.rgb = RGBColor.from_string(st["fill"])
            cell.margin_left = cell.margin_right = I(0.05)
            cell.margin_top = cell.margin_bottom = I(0.01)
            cell.vertical_anchor = MSO_ANCHOR.MIDDLE
            tf = cell.text_frame
            tf.word_wrap = True
            tf.paragraphs[0].text = ""
            _fill_runs(tf, [[(rows[i][j], {})]], st["size"], st["bold"], st["color"], st["align"], None)
            _borders(cell)
    return gt


def _borders(cell, color=LINE, w=6350):
    tcPr = cell._tc.get_or_add_tcPr()
    for tag in ("a:lnL", "a:lnR", "a:lnT", "a:lnB"):
        ln = tcPr.find(A + tag[2:])
        if ln is not None:
            tcPr.remove(ln)
        ln = etree.SubElement(tcPr, A + tag[2:], w=str(w), cap="flat", cmpd="sng", algn="ctr")
        sf = etree.SubElement(ln, A + "solidFill")
        etree.SubElement(sf, A + "srgbClr", val=color)
        etree.SubElement(ln, A + "prstDash", val="solid")
    # lnL..lnB must precede the cell fill in tcPr
    fill = tcPr.find(A + "solidFill")
    if fill is not None:
        tcPr.remove(fill)
        tcPr.append(fill)


def oku(v, nd=1):
    s = f"{abs(v) / 100:,.{nd}f}"
    return ("▲" + s) if v < -0.05 else s


def mil(v):
    s = f"{abs(v):,.0f}"
    return ("▲" + s) if v < -0.5 else s


def pct(v):
    return f"{v * 100:.1f}%"



def callout(s, x, y, w, h, head, body):
    rect(s, x, y, w, h, fill=CARD)
    rect(s, x, y, 0.05, h, fill=COPPER)
    tb(s, x + 0.17, y + 0.06, w - 0.27, h - 0.10,
       [[(head, {"sz": 10.5, "b": True, "c": BLACK})], [(body, {"sz": 7.8, "c": NAVY})]], space=1.2)


# ═══════════════════════════ モデル ═══════════════════════════
import os
import openpyxl
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side

HERE = os.path.dirname(os.path.abspath(__file__))
SIMPLE = os.path.join(HERE, "..", "20261115_シンプル版_WineBank＋カンテサンス")
sys.path.insert(0, os.path.join(HERE, "..", "20261114_5か年計画_資本政策"))
import build_plan5 as bp  # noqa: E402

PA = json.load(open(os.path.join(SIMPLE, "model_simple.json"), encoding="utf-8"))   # プランA
NY = 5
YL = ["2026年度\n（予算）", "2027年度", "2028年度", "2029年度", "2030年度"]
WB = PA["segments"][0]                      # WineBank単体（3か年予算＋延長）
TAX = 0.34
FD = PA["cap"]["fd"]                        # WineBankの潜在株込み株数 5,790株
WB_PRE = 26.1                              # WineBank単体（前回ポストと同評価）
RATE = 0.25                                # 割戻しの年率（カンテサンスと同じ）

# ── ティエリーマルクス運営会社（株式会社Brasserie Thierry Marx）──
# 5か年計画（20261027投資家資料 p.13、FY＝4月〜3月、決算年＝3月の年）：売上・営業利益（百万円）
TM_PL = {2027: (0, 0), 2028: (374, 9), 2029: (875, 37), 2030: (1698, 101), 2031: (2529, 177), 2032: (3360, 254)}
TM_EBITDA_2031 = 4.23        # FY2031 連結EBITDA（億円）
TM_EBITDA_RUN = 5.16         # 9店舗が成熟した平常時（ランレート）
TM_LANDLORD = 9.1            # 家主への分割払い残高（2031年）
TM_ADD_DEBT = 3.4            # 追加調達（計画は借入）
TM_DEPOSIT = 3.5             # 差入保証金
TM_MULT = 5.0                # EBITDA倍率（投資家資料と同じ）
# 株主（今回ラウンド完了時の想定 3,000株）
TM_SH = dict(nakano=1300, p3=700, ext=1000)
TM_TOTAL = sum(TM_SH.values())
BUY_SH = round(TM_TOTAL * 0.51)            # 51% = 1,530株
BUY_PX = 100_000                           # 1株10万円（WineBank P3の出資価格：7,000万円÷700株）
ROUND_PX = 160_000                         # 直近の第三者割当（池上様等）
INJ = 3.4                                  # 運営会社への増資（出店資金の不足分。計画では借入）
INJ_PX = 160_000

buy_cost = BUY_SH * BUY_PX / 1e8           # 1.53億円
inj_sh = round(INJ * 1e8 / INJ_PX)
own_after = (BUY_SH + inj_sh) / (TM_TOTAL + inj_sh)


def tm_equity(ebitda, equity_funded):
    """2031年の株式価値（億円）＝EBITDA×倍率−家主分割残＋保証金−追加借入（増資で賄えば借入なし）"""
    return ebitda * TM_MULT - TM_LANDLORD + TM_DEPOSIT - (0 if equity_funded else TM_ADD_DEBT)


val = {}
val["round"] = BUY_SH * ROUND_PX / 1e8
val["pv_base"] = tm_equity(TM_EBITDA_2031, False) * 0.51 / (1 + RATE) ** 5
val["pv_run"] = tm_equity(TM_EBITDA_RUN, False) * 0.51 / (1 + RATE) ** 5
for k in list(val):
    val[k + "_net"] = val[k] - buy_cost
PRE_B_RAW = WB_PRE + val["round_net"]
PRICE_B = round(PRE_B_RAW * 1e8 / FD / 10_000) * 10_000          # 1万円単位
PRE_B = PRICE_B * FD / 1e8

tm_rev, tm_op = bp.to_wb(TM_PL, 3)
B = dict(rev=[WB["rev"][i] + tm_rev[i] for i in range(NY)], op=[WB["op"][i] + tm_op[i] for i in range(NY)])
B["attrib_op"] = [WB["op"][i] + tm_op[i] * own_after for i in range(NY)]
B["attrib_ni"] = [(WB["op"][i] + tm_op[i] * own_after) * (1 - TAX) for i in range(NY)]

ROUNDS = [5.0, 10.0]


def round_case(pre, price, rnd, ni):
    sh = round(rnd * 1e8 / price)
    post = pre + rnd
    mc = ni * 20
    return dict(shares=sh, post=post, ratio=sh / (FD + sh), mc15=ni * 15, mc20=mc, mc25=ni * 25, mult=mc / post,
                vc=ni * 20 / (1.25 ** 4.5) - rnd)


NI_B = B["attrib_ni"][4] / 100
caseB = {r: round_case(PRE_B, PRICE_B, r, NI_B) for r in ROUNDS}
VA = PA["valuation"]
caseA = {}
for r, k in ((5.0, "r5"), (10.0, "r10")):
    ni = PA["scn"][k]["p2"]["attrib_ni"][4] / 100
    caseA[r] = round_case(VA["pre2"], PA["cap"]["price"], r, ni)
    caseA[r]["ni"] = ni
    caseA[r]["own"] = PA["scn"][k]["own"]
# プランBで投資倍率をプランA並み（約2.6倍）にするプレバリュー
target = caseA[5.0]["mult"]
pre_for_target = {r: NI_B * 20 / target - r for r in ROUNDS}
if 0: print("buy", buy_cost, "own_after", own_after, "val", {k: round(v, 2) for k, v in val.items()})
if 0: print("PRE_B", PRE_B_RAW, PRE_B, PRICE_B, "NI_B", NI_B, caseB, pre_for_target)
if 0: print("B rev", [round(x / 100, 1) for x in B["rev"]], "op", [round(x / 100, 2) for x in B["op"]])

# ═══════════════════════════ Excel ═══════════════════════════
XN, XC, XS = "36394B", "C68A65", "F3EDE6"
_t = Side(style="thin", color="D9D9D9")
_B = Border(left=_t, right=_t, top=_t, bottom=_t)
N1 = '#,##0.0;"▲"#,##0.0;"-"'
N2 = '#,##0.00;"▲"#,##0.00;"-"'
N0 = '#,##0;"▲"#,##0;"-"'


def xh(c):
    c.font = Font(name="Meiryo", bold=True, color="FFFFFF", size=10)
    c.fill = PatternFill("solid", fgColor=XN)
    c.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
    c.border = _B


def xb(c, fmt=None, bold=False, fill=None, blue=False):
    c.font = Font(name="Meiryo", size=10, bold=bold, color="0000FF" if blue else "000000")
    c.border = _B
    c.alignment = Alignment(horizontal="right" if fmt else "left", vertical="center", wrap_text=not fmt)
    if fmt:
        c.number_format = fmt
    if fill:
        c.fill = PatternFill("solid", fgColor=fill)


def xt(ws, a, b=None):
    ws["A1"] = a
    ws["A1"].font = Font(name="Meiryo", bold=True, size=13)
    if b:
        ws["A2"] = b
        ws["A2"].font = Font(name="Meiryo", size=9, color="595959")


wbk = openpyxl.Workbook()
# ── 1. 前提とプレバリュー（数式） ──
ws = wbk.active
ws.title = "プランB_プレバリュー"
xt(ws, "プランB：ティエリーマルクス運営会社の51%を取得する場合のプレバリュー（社内検討用）",
   "青字＝入力値。変えると下の評価額・プレバリューが再計算される。単位：億円（株数・株価を除く）")
rows = [
    ("【運営会社（株式会社Brasserie Thierry Marx）の株主：今回ラウンド完了時の想定】", None, None),
    ("中野（ワイン・ラ・ターブル等）", TM_SH["nakano"], N0),
    ("合同会社WineBank P3（550株払込済、残り150株は2027年2月末まで）", TM_SH["p3"], N0),
    ("外部投資家（1株15〜16万円。11/13法人134株・12/1池上様66株ほか）", TM_SH["ext"], N0),
    ("発行済株式数", "=SUM(B4:B6)", N0),
    ("WineBankが譲り受ける株数（51%）", "=ROUND(B7*0.51,0)", N0),
    ("譲受価格（1株・円）＝WineBank P3の出資価格（7,000万円÷700株）", BUY_PX, N0),
    ("取得対価（億円）", "=B8*B9/1E8", N2),
    ("", None, None),
    ("【51%の評価額】", None, None),
    ("① 直近の第三者割当の株価（1株・円）", ROUND_PX, N0),
    ("　 51%の評価額", "=B8*B13/1E8", N2),
    ("② 2031年の売却価値の割戻し：EBITDA（FY2031・億円）", TM_EBITDA_2031, N2),
    ("　 EBITDA倍率", TM_MULT, N1),
    ("　 家主への分割払い残高", TM_LANDLORD, N1),
    ("　 追加調達の借入（計画）", TM_ADD_DEBT, N1),
    ("　 差入保証金", TM_DEPOSIT, N1),
    ("　 2031年の株式価値", "=B15*B16-B17-B18+B19", N2),
    ("　 割戻しの年率（カンテサンスと同じ）", RATE, "0%"),
    ("　 51%の現在価値（5年）", "=B20*0.51/(1+B21)^5", N2),
    ("③ ランレート（9店舗成熟時）EBITDA", TM_EBITDA_RUN, N2),
    ("　 51%の現在価値（5年）", "=(B23*B16-B17-B18+B19)*0.51/(1+B21)^5", N2),
    ("", None, None),
    ("【プレバリュー】", None, None),
    ("WineBank単体（前回ポストと同評価）", WB_PRE, N1),
    ("＋ ティエリーマルクス51%の評価額（①を採用）", "=B14", N2),
    ("− 取得対価（WineBankが中野・P3に支払う）", "=-B10", N2),
    ("プレバリュー（計算値）", "=B27+B28+B29", N2),
    ("WineBankの潜在株込み株数", FD, N0),
    ("1株価格（1万円単位に丸め・円）", "=ROUND(B30*1E8/B31,-4)", N0),
    ("プレバリュー（1株価格×株数）", "=B32*B31/1E8", N2),
    ("参考：②を採用した場合のプレバリュー", "=B27+B22-B10", N2),
    ("参考：③を採用した場合のプレバリュー", "=B27+B24-B10", N2),
]
r = 2
for lab, v, fmt in rows:
    r += 1
    xb(ws.cell(row=r, column=1, value=lab), bold=(v is None and lab != ""))
    if v is not None:
        isin = not (isinstance(v, str) and v.startswith("="))
        xb(ws.cell(row=r, column=2, value=v), fmt=fmt, blue=isin, bold=r in (30, 33),
           fill=XS if r in (30, 32, 33) else None)
r += 2
for t in ["取得対価は今回の増資資金から中野・P3に支払う前提。WineBankの株式で支払う（株式交換・現物出資）場合は、プレは26.1億円のまま、"
          "中野に新株を発行する形になる（既存株主の持分価値は同じ）。",
          "中野からの譲受は関連当事者取引。取締役会（特別利害関係人を除く）の承認と、第三者の価格算定を取ることが望ましい。",
          "運営会社の外部投資家はプレシード特例（エンジェル税制）を前提に出資している。WineBankが過半数を持つと要件に影響しないか、税理士に要確認。",
          "外部投資家の株数（1,000株）は今回ラウンドの目標。実際の払込が少ない場合、51%に必要な株数と取得対価は下がる。"]:
    ws.cell(row=r, column=1, value=t).font = Font(name="Meiryo", size=9, color="595959")
    r += 1
ws.column_dimensions["A"].width = 70
ws.column_dimensions["B"].width = 16

# ── 2. 5か年比較 ──
ws = wbk.create_sheet("5か年_A対B")
xt(ws, "5か年計画の比較（億円）", "年度＝WineBank決算期（10月〜翌9月）。WineBankは2026〜2028年度が3か年予算v16、2029・2030年度は延長の仮置き。"
   "ティエリーマルクスはFY4月〜3月を月割りで組替え。")
r = 4
for j, h in enumerate(["区分", "項目"] + [y.replace("\n", "") for y in YL], 1):
    xh(ws.cell(row=r, column=j, value=h))
QA = PA["segments"][1]
lines = [
    ("共通", "WineBank 売上高", WB["rev"]), ("共通", "WineBank 営業利益", WB["op"]),
    ("プランA", "カンテサンス 売上高", QA["rev"]), ("プランA", "カンテサンス 営業利益", QA["op"]),
    ("プランA", "連結 売上高", PA["p2"]["rev"]), ("プランA", "連結 営業利益", PA["p2"]["op"]),
    ("プランA", "持分按分後 営業利益（調達5億円・64%）", PA["scn"]["r5"]["p2"]["attrib_op"]),
    ("プランA", "持分按分後 当期純利益（調達5億円）", PA["scn"]["r5"]["p2"]["attrib_ni"]),
    ("プランB", "ティエリーマルクス 売上高", tm_rev), ("プランB", "ティエリーマルクス 営業利益", tm_op),
    ("プランB", "連結 売上高", B["rev"]), ("プランB", "連結 営業利益", B["op"]),
    ("プランB", f"持分按分後 営業利益（持分{own_after * 100:.0f}%）", B["attrib_op"]),
    ("プランB", "持分按分後 当期純利益（目安）", B["attrib_ni"]),
]
for a_, b_, vals in lines:
    r += 1
    hl = "連結" in b_
    xb(ws.cell(row=r, column=1, value=a_), fill=XS if hl else None)
    xb(ws.cell(row=r, column=2, value=b_), bold=hl, fill=XS if hl else None)
    for i in range(NY):
        xb(ws.cell(row=r, column=3 + i, value=round(vals[i] / 100, 2)), fmt=N1, bold=hl, fill=XS if hl else None)
r += 2
for t in ["プランBの当期純利益（目安）＝（WineBankの営業利益＋ティエリーマルクスの営業利益×持分）×(1−34%)。金利・のれん償却は含まない。",
          f"プランBの持分{own_after * 100:.1f}%：51%（1,530株）を取得後、出店資金3.4億円を1株16万円で増資（{inj_sh:,}株）した場合。"]:
    ws.cell(row=r, column=1, value=t).font = Font(name="Meiryo", size=9, color="595959")
    r += 1
ws.column_dimensions["A"].width = 10
ws.column_dimensions["B"].width = 40
for c in "CDEFG":
    ws.column_dimensions[c].width = 13

# ── 3. ラウンド比較 ──
ws = wbk.create_sheet("ラウンド_A対B")
xt(ws, "今回のラウンドの比較", "億円（株数・株価・倍率・比率を除く）。上場時の時価総額＝2030年度の持分按分後純利益×PER。")
hd = ["項目", "プランA 調達5億", "プランA 調達10億", "プランB 調達5億", "プランB 調達10億"]
r = 4
for j, h in enumerate(hd, 1):
    xh(ws.cell(row=r, column=j, value=h))
def four(f):
    return [f("A", 5.0), f("A", 10.0), f("B", 5.0), f("B", 10.0)]
def c_(p, r_):
    return caseA[r_] if p == "A" else caseB[r_]
tbl = [
    ("プレバリュー", four(lambda p, r_: VA["pre2"] if p == "A" else PRE_B), N1),
    ("1株価格（円）", four(lambda p, r_: PA["cap"]["price"] if p == "A" else PRICE_B), N0),
    ("発行株数", four(lambda p, r_: c_(p, r_)["shares"]), N0),
    ("ポストバリュー", four(lambda p, r_: c_(p, r_)["post"]), N1),
    ("新規投資家の持株比率（潜在株込み）", four(lambda p, r_: c_(p, r_)["ratio"]), "0.0%"),
    ("取得先の持分（増資後）", four(lambda p, r_: caseA[r_]["own"] if p == "A" else own_after), "0.0%"),
    ("2030年度 持分按分後 当期純利益", four(lambda p, r_: caseA[r_]["ni"] if p == "A" else NI_B), N2),
    ("時価総額 PER15倍", four(lambda p, r_: c_(p, r_)["mc15"]), N1),
    ("時価総額 PER20倍", four(lambda p, r_: c_(p, r_)["mc20"]), N1),
    ("時価総額 PER25倍", four(lambda p, r_: c_(p, r_)["mc25"]), N1),
    ("投資倍率（PER20倍）", four(lambda p, r_: c_(p, r_)["mult"]), '0.00"倍"'),
    ("検証：VC方式のプレ（PER20倍・年25%・4.5年）", four(lambda p, r_: c_(p, r_)["vc"]), N1),
    ("プランBで投資倍率をプランA並みにするプレ", ["", "", pre_for_target[5.0], pre_for_target[10.0]], N1),
]
for lab, vals, fmt in tbl:
    r += 1
    xb(ws.cell(row=r, column=1, value=lab), bold=lab in ("プレバリュー", "投資倍率（PER20倍）"))
    for j, v in enumerate(vals, 2):
        xb(ws.cell(row=r, column=j, value=v if v != "" else None), fmt=fmt,
           fill=XS if lab in ("プレバリュー", "投資倍率（PER20倍）") else None)
ws.column_dimensions["A"].width = 44
for c in "BCDE":
    ws.column_dimensions[c].width = 16
wbk.save(XLSX)
print("saved", XLSX)

# ═══════════════════════════ スライド ═══════════════════════════
# ── 1. プランBの仕組みと5か年計画 ──
s = new_slide("プランB：ティエリーマルクス運営会社をWineBankの子会社に",
              f"中野・P3の持分51%を1株10万円で譲り受け、出店資金を増資で入れる。連結売上 {oku(B['rev'][0])}→{oku(B['rev'][4])}億円",
              band_size=11.5)
tb(s, 0.30, 1.19, 4.40, 0.18, "社内検討用：カンテサンス案件が見送りになった場合の代替案", size=6.5, color=COPPER, bold=True)
b = rect(s, 0.30, 1.40, 4.40, 0.42, fill=NAVY2)
boxtext(b, [[("株式会社WineBank", {"sz": 10.5, "b": True})],
            [("TBS社とブランド使用契約（全店共通、2027年4月〜5年、合意で延長）を締結済み", {"sz": 6.3, "c": SAND})]], space=1.05)
steps = [
    ("① 51%の譲受", f"中野・P3から{BUY_SH:,}株を1株10万円で譲受\n取得対価 {buy_cost:.2f}億円（P3の出資価格と同じ）"),
    ("② 出店資金の増資", f"{INJ:.1f}億円を1株16万円で出資（{inj_sh:,}株）\n計画上は借入の出店資金を株式で賄う"),
    ("③ WineBankの持分", f"51% → {own_after * 100:.0f}%\n外部投資家（1株15〜16万円）は少数株主として残る"),
]
for k, (h, t) in enumerate(steps):
    y = 1.90 + k * 0.56
    bx = rect(s, 0.30, y, 4.40, 0.50, fill=CARD, line=LINE)
    tb(s, 0.40, y + 0.04, 1.30, 0.42, h, size=8, bold=True, color=COPPER, anchor=MSO_ANCHOR.MIDDLE)
    tb(s, 1.65, y + 0.03, 3.00, 0.44, t, size=6.8, color=NAVY, anchor=MSO_ANCHOR.MIDDLE, space=1.1)
qb = rect(s, 0.30, 3.62, 4.40, 0.66, fill=BEIGE, line=COPPER, lw=1.25)
boxtext(qb, [[("運営会社（株式会社Brasserie Thierry Marx）", {"sz": 8.5, "b": True, "c": NAVY2})],
             [("2027年4月 六本木（108席）→ 2028年 札幌・大阪 → 2031年度 9店舗", {"sz": 6.6, "c": NAVY})],
             [("FY2031 売上33.6億円・EBITDA 4.2億円・営業利益2.5億円（営業利益率7.6%）", {"sz": 6.6, "b": True, "c": COPPER})]],
        space=1.1)

tb(s, 4.85, 1.19, 4.85, 0.18, "5か年計画（億円）", size=8.5, bold=True, color=NAVY2)
rows = [["", *YL],
        ["WineBank 売上高", *[oku(v) for v in WB["rev"]]],
        ["WineBank 営業利益", *[oku(v) for v in WB["op"]]],
        ["ティエリーマルクス 売上高", *[oku(v) for v in tm_rev]],
        ["ティエリーマルクス 営業利益", *[oku(v) for v in tm_op]],
        ["連結 売上高", *[oku(v) for v in B["rev"]]],
        ["連結 営業利益", *[oku(v) for v in B["op"]]],
        ["営業利益率", *[pct(B["op"][i] / B["rev"][i]) for i in range(NY)]],
        [f"持分按分後 営業利益（{own_after * 100:.0f}%）", *[oku(v) for v in B["attrib_op"]]],
        ["（参考）プランAの連結営業利益", *[oku(v) for v in PA["p2"]["op"]]]]
st = {(i, 0): dict(bold=True, color=NAVY2, align=PP_ALIGN.LEFT, size=6.8) for i in range(1, 10)}
for i in (5, 6):
    st[(i, None)] = dict(fill=NAVY2, color=WHITE, bold=True)
    st[(i, 0)] = dict(fill=NAVY2, color=WHITE, bold=True, align=PP_ALIGN.LEFT, size=6.8)
st[(7, None)] = dict(color=GREY, size=6.6)
st[(8, None)] = dict(fill=BEIGE, bold=True)
st[(8, 0)] = dict(fill=BEIGE, bold=True, align=PP_ALIGN.LEFT, size=6.6, color=NAVY2)
st[(9, None)] = dict(color=GREY, size=6.6)
st[(9, 0)] = dict(color=GREY, size=6.4, align=PP_ALIGN.LEFT)
table(s, 4.85, 1.40, [1.85, 0.60, 0.60, 0.60, 0.60, 0.60], [0.30] + [0.235] * 9, rows, size=7.2, styles=st)
tb(s, 4.85, 3.88, 4.85, 0.40,
   "売上はプランAより大きいが、ブラッスリーは営業利益率が7%前後のため、利益はプランAの4割程度（2030年度 4.6億円 対 11.3億円）。",
   size=6.8, color=NAVY, space=1.15)
tb(s, 0.30, 4.40, 9.40, 0.80,
   [[("年度＝WineBank決算期（10月〜翌9月）。WineBankは2026〜2028年度が3か年予算v16、2029・2030年度は延長の仮置き。", {"b": True}),
     ("ティエリーマルクスは2026/10/27投資家資料の5か年計画（FY4月〜3月）を月割りで組替え。", {})],
    [(f"運営会社の株主は今回ラウンド完了時の想定（中野1,300株・P3 700株・外部1,000株、計3,000株）。"
      f"中野からの譲受は関連当事者取引のため、取締役会承認（特別利害関係人を除く）と第三者の価格算定が必要。"
      "外部投資家のプレシード特例（エンジェル税制）への影響は税理士に要確認。", {})]],
   size=5.9, color=GREY, space=1.1)
s.notes_slide.notes_text_frame.text = "2026/11/25 社内検討用。カンテサンス案件が見送りになった場合のプランB。"

# ── 2. プランAとプランBの比較 ──
s = new_slide("プランA（カンテサンス）とプランB（ティエリーマルクス）の比較",
              f"プランBのプレは約{PRE_B:.0f}億円（1株{PRICE_B / 1e4:.0f}万円）が妥当。ただし投資倍率はプランAの6割程度にとどまる", band_size=11)
rows = [["", "プランA：WineBank＋カンテサンス", "プランB：WineBank＋ティエリーマルクス"],
        ["取得するもの", "三つ星レストランの株式100%（WineBank側51%→64%／77%）", f"運営会社の51%（中野・P3から譲受）→増資後{own_after * 100:.0f}%"],
        ["必要な資金", "約55億円（LBOローン15億円＋対象会社の現預金＋エクイティ15億円）",
         f"約{buy_cost + INJ:.1f}億円（譲受{buy_cost:.2f}億円＋出店資金{INJ:.1f}億円）。借入不要"],
        ["プレバリューの内訳", f"WineBank単体{WB_PRE}＋カンテサンス持分{VA['quint']}＝{VA['pre2']:.1f}億円",
         f"WineBank単体{WB_PRE}＋51%の評価{val['round']:.2f}−取得対価{buy_cost:.2f}＝{PRE_B_RAW:.1f}億円"],
        ["1株価格（前回45万円）", f"{PA['cap']['price'] / 1e4:.0f}万円（{PA['cap']['price'] / 450000:.2f}倍）",
         f"{PRICE_B / 1e4:.0f}万円（{PRICE_B / 450000:.2f}倍）"],
        ["ポスト（調達5億／10億円）", f"{caseA[5.0]['post']:.0f}／{caseA[10.0]['post']:.0f}億円",
         f"{caseB[5.0]['post']:.0f}／{caseB[10.0]['post']:.0f}億円"],
        ["新規投資家の持株比率", f"{caseA[5.0]['ratio'] * 100:.1f}%／{caseA[10.0]['ratio'] * 100:.1f}%",
         f"{caseB[5.0]['ratio'] * 100:.1f}%／{caseB[10.0]['ratio'] * 100:.1f}%"],
        ["2030年度 連結売上高／営業利益", f"{oku(PA['p2']['rev'][4])}／{oku(PA['p2']['op'][4])}億円（{pct(PA['p2']['op'][4] / PA['p2']['rev'][4])}）",
         f"{oku(B['rev'][4])}／{oku(B['op'][4])}億円（{pct(B['op'][4] / B['rev'][4])}）"],
        ["2030年度 持分按分後 純利益", f"{caseA[5.0]['ni']:.1f}／{caseA[10.0]['ni']:.1f}億円", f"{NI_B:.1f}億円"],
        ["上場時の時価総額（PER20倍）", f"{caseA[5.0]['mc20']:.0f}／{caseA[10.0]['mc20']:.0f}億円", f"{caseB[5.0]['mc20']:.0f}億円"],
        ["投資倍率（PER20倍）", f"{caseA[5.0]['mult']:.1f}倍／{caseA[10.0]['mult']:.1f}倍",
         f"{caseB[5.0]['mult']:.1f}倍／{caseB[10.0]['mult']:.1f}倍"],
        ["主なリスク", "岸田シェフのロックアップ、エクイティ15億円の確度、LBOの返済",
         "1号店が未開業（2027年4月）、出店の実行、関連当事者取引、外部株主のエンジェル税制"]]
st = {(i, 0): dict(bold=True, color=NAVY2, fill=CARD, align=PP_ALIGN.LEFT, size=6.8) for i in range(1, 12)}
for i in range(1, 12):
    st[(i, 1)] = dict(align=PP_ALIGN.LEFT, size=6.6)
    st[(i, 2)] = dict(align=PP_ALIGN.LEFT, size=6.6)
for i in (3, 4, 10):
    st[(i, None)] = dict(fill=BEIGE, bold=True)
    st[(i, 0)] = dict(fill=BEIGE, bold=True, color=NAVY2, align=PP_ALIGN.LEFT, size=6.8)
    st[(i, 1)] = dict(fill=BEIGE, bold=True, align=PP_ALIGN.LEFT, size=6.6)
    st[(i, 2)] = dict(fill=BEIGE, bold=True, align=PP_ALIGN.LEFT, size=6.6, color=COPPER)
table(s, 0.30, 1.20, [1.85, 3.75, 3.80], [0.25] + [0.225] * 11, rows, size=7, styles=st)
callout(s, 0.30, 4.27, 4.62, 0.90, "プランBのプレの考え方",
        f"51%の価値（直近株価で{val['round']:.1f}億円、5年後の割戻しで{val['pv_base']:.1f}〜{val['pv_run']:.1f}億円）から"
        f"取得対価{buy_cost:.2f}億円を引いた{val['pv_base_net']:.1f}〜{val['pv_run_net']:.1f}億円が上乗せ分。"
        f"前回と同じ26.1億円に1億円前後を足した{PRE_B:.0f}億円が上限の目線。")
callout(s, 5.08, 4.27, 4.62, 0.90, "投資家からの見え方",
        f"利益がプランAの4割のため、PER20倍での投資倍率は{caseB[5.0]['mult']:.1f}倍。"
        f"プランA並み（{caseA[5.0]['mult']:.1f}倍）にするにはプレ約{pre_for_target[5.0]:.0f}億円が必要で、前回を下回る。"
        "プランBは「前回同額に近い価格で、規模ではなく実行力で評価してもらうラウンド」になる。")
s.notes_slide.notes_text_frame.text = "2026/11/25 社内検討用。プランAの数字は5か年計画_資本政策_シンプル版（WineBankは3か年予算v16）。"

lst = pr.slides._sldIdLst
for el in list(lst)[:N_ORIG]:
    pr.part.drop_rel(el.get(R + "id"))
    lst.remove(el)
pr.save(OUT)
print("saved", OUT, len(pr.slides))
