# -*- coding: utf-8 -*-
"""会社紹介（投資家様）のシンプル版 差し替えスライド（2026/11/15）。

HIRAC岡田様のご指摘（2026/11/14〜15）を受け、事業計画を「WineBank＋カンテサンス」だけに絞る。
  1 カンテサンスのグループ入りと5か年計画（p.41 組織再編の差し替え）
  2 カンテサンス取得のスキームと資金計画（新規）
  3 中長期ロードマップ（p.43の差し替え）
  4 まとめ（p.44の差し替え）
  5 今回のラウンドの考え方（p.52の差し替え）
  6 Appendix：関連会社の将来の合流シナリオ（p.49〜51の代わり。今回のプレバリューには加えない）
数値は ../20261114_5か年計画_資本政策/model5.json。

使い方:
  python3 build_slides_simple.py <テンプレートpptx> <model5.json> <出力pptx>
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

TEMPLATE, MODEL, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
M = json.load(open(MODEL, encoding="utf-8"))
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


NY = 5
SG = {s["name"]: s for s in M["segments"]}
E = {e["key"]: e for e in M["entities"]}
P1, P2 = M["p1"], M["p2"]
Q = M["quint"]
V = M["valuation"]
CAPM = M["cap"]
S5, S10 = M["scn"]["r5"], M["scn"]["r10"]
OWN5, OWN10 = S5["own"], S10["own"]
WT, QS = SG["ワイン・WineTech"], SG["カンテサンス"]
YL = ["2026年度\n（予算）", "2027年度", "2028年度", "2029年度", "2030年度"]
PPS = CAPM["price"]
FD = CAPM["fd"]
SH5, SH10 = CAPM["rounds"]["r5"]["shares"], CAPM["rounds"]["r10"]["shares"]
NI5, NI10 = S5["p2"]["attrib_ni"][4] / 100, S10["p2"]["attrib_ni"][4] / 100
POST5, POST10 = V["pre2"] + 5, V["pre2"] + 10


def two(a, b):
    return f"{oku(a)}／{oku(b)}"


# ═══════════ 1. カンテサンスのグループ入りと5か年計画 ═══════════
s = new_slide("カンテサンスのグループ入りと5か年計画",
              f"三つ星カンテサンスを加え、連結売上 {oku(P2['rev'][0], 0)}億円（2026年度予算）→ {oku(P2['rev'][4], 0)}億円（2030年度）、"
              f"営業利益 {oku(P2['op'][0])}→{oku(P2['op'][4])}億円", band_size=11.5)
tb(s, 0.30, 1.19, 4.30, 0.18, "株主：中野邦人／マネーフォワードVP（HIRAC FUND）／PrivateBANK／ベクトル／寺田倉庫 ほか",
   size=6.3, color=GREY)
wb = rect(s, 0.30, 1.40, 4.30, 0.46, fill=NAVY2)
boxtext(wb, [[("株式会社WineBank", {"sz": 11, "b": True})],
             [("ワインを「買う・預ける・飲む・売る」を一社で", {"sz": 6.5, "c": SAND})]], space=1.05)
BIZ = [("ワイン販売", "卸・EC・店舗", E["wb_base"]["rev"]), ("WineTech", "私募ファンド・オークション", E["wb_fund"]["rev"]),
       ("ワインマイル", "預かり資産・会員", E["wb_mile"]["rev"])]
for k, (nm, sub, rev) in enumerate(BIZ):
    x = 0.30 + k * 1.45
    b = rect(s, x, 1.92, 1.40, 0.62, fill=CARD, line=LINE)
    boxtext(b, [[(nm, {"sz": 7.5, "b": True, "c": NAVY2})], [(sub, {"sz": 5.8, "c": GREY})],
                [(f"売上 {oku(rev[0])}→{oku(rev[4])}億円", {"sz": 7, "b": True, "c": COPPER})]], space=1.05, margin=0.03)
line(s, 2.45, 2.54, 2.45, 2.70, color=GREY)
spc = rect(s, 0.30, 2.70, 4.30, 0.50, fill=COPPER)
boxtext(spc, [[("カンテサンスの持分", {"sz": 7, "c": WHITE}),
               (f"　WineBank 51% → {OWN5 * 100:.0f}%（調達5億円）／{OWN10 * 100:.0f}%（10億円）", {"sz": 8, "b": True})],
              [("LBOローン（みずほ銀行）で51%を確保し、今回の増資資金で持分を高める。残りは外部投資家様", {"sz": 6.3, "c": WHITE})]],
        space=1.1)
line(s, 2.45, 3.20, 2.45, 3.36, color=GREY)
qb = rect(s, 0.30, 3.36, 4.30, 0.62, fill=BEIGE, line=COPPER, lw=1.25)
boxtext(qb, [[("カンテサンス（株式会社プティ・ボノム）", {"sz": 9.5, "b": True, "c": NAVY2})],
             [("ミシュラン三つ星を19年連続で獲得。2026年12月に株式100%を取得予定", {"sz": 6.8, "c": NAVY})],
             [("2026年12月期（着地予想） 売上 約10.3億円・営業利益 約5.2億円、借入なし", {"sz": 6.8, "b": True, "c": COPPER})]],
        space=1.1)
nb = rect(s, 0.30, 4.08, 4.30, 0.42, fill=CARD)
boxtext(nb, [[("アピシウス・ティエリーマルクス等の関連会社", {"b": True, "c": NAVY2}),
              ("は、WineBankと資本関係がないため本計画に含めていません。", {})],
             [("将来の合流シナリオは Appendix をご参照ください。", {})]],
        size=6.5, color=NAVY, align=PP_ALIGN.LEFT, space=1.15, margin=0.10)

tb(s, 4.75, 1.19, 4.95, 0.18, "5か年計画（億円）", size=8.5, bold=True, color=NAVY2)
rows = [["事業", "", *YL],
        ["WineBank\n（ワイン・WineTech）", "売上高", *[oku(v) for v in WT["rev"]]],
        ["", "営業利益", *[oku(v) for v in WT["op"]]],
        ["カンテサンス", "売上高", *[oku(v) for v in QS["rev"]]],
        ["", "うち新規事業", *[oku(v) for v in Q["rev_new"]]],
        ["", "営業利益", *[oku(v) for v in QS["op"]]],
        ["連結売上高", "", *[oku(v) for v in P2["rev"]]],
        ["連結営業利益", "", *[oku(v) for v in P2["op"]]],
        ["営業利益率", "", *[pct(P2["op"][i] / P2["rev"][i]) for i in range(NY)]],
        [f"持分按分後 営業利益（調達5億円・{OWN5 * 100:.0f}%）", "", *[oku(v) for v in S5["p2"]["attrib_op"]]],
        [f"持分按分後 営業利益（調達10億円・{OWN10 * 100:.0f}%）", "", *[oku(v) for v in S10["p2"]["attrib_op"]]]]
merges = [(0, 0, 0, 1), (1, 0, 2, 0), (3, 0, 5, 0)] + [(i, 0, i, 1) for i in range(6, 11)]
styles = {(1, 0): dict(bold=True, color=NAVY2, align=PP_ALIGN.LEFT, size=6.8),
          (3, 0): dict(bold=True, color=NAVY2, align=PP_ALIGN.LEFT, size=7.3)}
for i in (1, 2, 3, 4, 5):
    styles[(i, 1)] = dict(align=PP_ALIGN.CENTER, size=6.5, color=GREY)
for i in (2, 5):
    styles[(i, None)] = dict(fill=CARD)
    styles[(i, 1)] = dict(fill=CARD, align=PP_ALIGN.CENTER, size=6.5, color=GREY)
    for j in range(2, 7):
        styles[(i, j)] = dict(fill=CARD, color=COPPER, bold=True)
for j in range(2, 7):
    styles[(4, j)] = dict(color=GREY, size=6.8)
for i in (6, 7):
    styles[(i, None)] = dict(fill=NAVY2, color=WHITE, bold=True)
    styles[(i, 0)] = dict(fill=NAVY2, color=WHITE, bold=True, align=PP_ALIGN.LEFT)
styles[(8, None)] = dict(color=GREY, size=6.8)
styles[(8, 0)] = dict(color=GREY, size=6.8, align=PP_ALIGN.LEFT)
for i in (9, 10):
    styles[(i, None)] = dict(fill=BEIGE, bold=True)
    styles[(i, 0)] = dict(fill=BEIGE, bold=True, align=PP_ALIGN.LEFT, size=6.3, color=NAVY2)
table(s, 4.75, 1.40, [1.38, 0.52, 0.60, 0.60, 0.60, 0.60, 0.60],
      [0.30] + [0.235] * 5 + [0.25, 0.25, 0.20, 0.25, 0.25], rows, size=7.4, merges=merges, styles=styles)
d_all = P2["rev"][4] - P2["rev"][0]
d_new = Q["rev_new"][4] - Q["rev_new"][0]
d_wt = WT["rev"][4] - WT["rev"][0]
tb(s, 4.75, 4.12, 4.90, 0.36,
   f"売上の増加{oku(d_all)}億円の内訳：カンテサンスの新規事業 +{oku(d_new)}億円、WineBank（WineTech・ワインマイル等）+{oku(d_wt)}億円、"
   f"カンテサンス本店 +{oku(d_all - d_new - d_wt)}億円。新たな買収は織り込んでいない。", size=6.8, color=NAVY, space=1.15)
tb(s, 0.30, 4.66, 9.40, 0.56,
   [[("年度＝WineBank決算期（10月〜翌9月）。2026年度＝2027年9月期の予算。", {"b": True}),
     ("カンテサンスは期初取得を仮定したプロフォーマ（決算期12月を月割りで組替え）。WineBankの営業利益（2026〜2029年度）は経営判断による修正値。", {})],
    [("カンテサンスの新規事業：ガトー・オ・コンテの拡大、一品スイーツ店（2028年1月から毎年1店舗）、ワインショップ・バー（2030年1月〜）。"
      "新規事業の進め方は、基本合意書に基づき岸田シェフのご意向を踏まえて個別に協議する。"
      "持分按分後は、WineBank 100%とカンテサンスの持分（増資後）で按分した営業利益。", {})]],
   size=5.9, color=GREY, space=1.1)
s.notes_slide.notes_text_frame.text = (
    "2026/11/15 シンプル版：事業計画をWineBank＋カンテサンスに絞る（HIRAC岡田様のご指摘）。p.41「組織再編」の差し替え。"
    "数値は 5か年計画_資本政策_シンプル版_20261115.xlsx（5か年計画）と一致。")

# ═══════════ 2. カンテサンス取得のスキームと資金計画 ═══════════
s = new_slide("カンテサンス取得のスキームと資金計画",
              "2026年12月末に株式100%を取得。WineBank側が過半（51%以上）を持ち、今回の増資で持分を高める", band_size=11.5)
tb(s, 0.40, 1.22, 5.70, 0.20, "支払いと資金の出し手（基礎金額50億円＋アーンアウト）", size=9, bold=True, color=NAVY2)
rows = [["時期", "支払い", "資金の出し手"],
        ["2026年12月末\n（決済・株式100%取得）", "35億円",
         "みずほ銀行のLBOローン 15億円（5年・元金均等）\n対象会社の現預金 20億円"],
        ["2027年3月末\n（残金）", "15億円",
         "エクイティ 15億円\n＝WineBankの出資（今回の調達額の80%）＋外部投資家様の出資"],
        ["2029年末\n（アーンアウト）", "5億円\n＋成長対価",
         "追加対価5億円。成長対価2.4億円は売主様と調整中\n（業績達成が条件。仲介手数料の減額後の実質負担は1.8億円）"]]
styles = {}
for i in range(1, 4):
    styles[(i, 0)] = dict(bold=True, color=NAVY2, fill=CARD, align=PP_ALIGN.LEFT, size=7.3)
    styles[(i, 1)] = dict(bold=True, color=COPPER, align=PP_ALIGN.CENTER, size=9)
    styles[(i, 2)] = dict(align=PP_ALIGN.LEFT, size=7.3)
table(s, 0.40, 1.44, [1.55, 0.95, 3.20], [0.26, 0.52, 0.52, 0.52], rows, size=7.5, styles=styles)

tb(s, 6.30, 1.22, 3.30, 0.20, "3月末のエクイティ15億円の内訳", size=9, bold=True, color=NAVY2)
rows = [["", "調達5億円", "調達10億円"],
        ["WineBankの出資", "4億円", "8億円"],
        ["外部投資家様の出資", "11億円", "7億円"],
        ["WineBankの\nカンテサンス持分", f"{OWN5 * 100:.1f}%", f"{OWN10 * 100:.1f}%"]]
styles = {(i, 0): dict(bold=True, color=NAVY2, fill=CARD, align=PP_ALIGN.LEFT, size=7.3) for i in range(1, 4)}
for i in range(1, 4):
    for j in (1, 2):
        styles[(i, j)] = dict(align=PP_ALIGN.CENTER, bold=i == 3, color=COPPER if i == 3 else NAVY,
                              fill=BEIGE if i == 3 else WHITE, size=10 if i == 3 else 8)
table(s, 6.30, 1.44, [1.30, 1.00, 1.00], [0.26, 0.36, 0.36, 0.52], rows, size=7.5, styles=styles)
tb(s, 6.30, 3.02, 3.30, 0.34, "WineBankは、LBOローンの保証と案件の組成・運営を担い、出資前の持分は51%。みずほ銀行は、WineBank側が過半を持つこのスキームを承諾済み。",
   size=6.3, color=GREY, space=1.15)

callout(s, 0.40, 3.46, 4.50, 1.02, "エクイティの確度（みずほ銀行の審査）",
        "みずほ銀行の融資は総額15億円で、つなぎ融資はない。融資の判断では、3月末のエクイティ15億円の確度が重視される。"
        "外部投資家様の出資の予約と、今回の増資のご検討状況を、審査の時期（12月上旬〜中旬）までにお示ししていく。")
callout(s, 5.10, 3.46, 4.50, 1.02, "取得後の運営と返済",
        "岸田シェフは3年間、代表取締役として関与を続け、後継の料理長を育成する（4年目以降は協議）。"
        "LBOローンは、カンテサンスの事業のキャッシュフロー（営業利益 年5億円超）で返済する。")
tb(s, 0.40, 4.62, 9.20, 0.50,
   "基本合意書（2026年11月2日締結）に基づく。最終的な金額・支払条件は、買収監査（DD）の結果を踏まえて最終契約で定める。"
   "追加対価5億円は勤務・業績に連動しない。アーンアウトは、計画上、同額の追加借入でまかなう想定。"
   "対象会社の現預金20億円の充当方法は、銀行・税理士と協議のうえ最終契約までに確定する。",
   size=6.2, color=GREY, space=1.15)
s.notes_slide.notes_text_frame.text = (
    "新規スライド。岡田様のご質問（買収の手順、みずほの融資額）への回答。みずほ銀行の融資は総額15億円（LBOローン）で、"
    "3月分のつなぎ融資は現時点で想定しない。エクイティは同時、または審査を通せる確度が必要（デットファーストはない）。")

# ═══════════ 3. 中長期ロードマップ ═══════════
s = new_slide("中長期ロードマップ",
              f"WineBank＋カンテサンスで、売上{oku(P2['rev'][4], 0)}億円・営業利益{oku(P2['op'][4], 0)}億円（2030年度）へ。"
              "IPOを見据えて体制を整備", band_size=12)
XS = [0.35 + k * 1.87 for k in range(NY)]
WW = 1.75
YT = ["2026年度（予算）", "2027年度", "2028年度", "2029年度", "2030年度"]
YP = ["2026/10〜2027/9", "2027/10〜2028/9", "2028/10〜2029/9", "2029/10〜2030/9", "2030/10〜2031/9"]
MS = [[("カンテサンス取得（12月）", 1), ("WineBank Auction\nWEBで常設化", 0), ("ワインマイル 開始", 0)],
      [("ガトー・オ・コンテ拡大\nスイーツ店1号（2028年1月）", 1), ("ワインマイル本格展開", 0), ("私募ファンド・オークション\n年3億円規模", 0)],
      [("スイーツ店2号（2029年1月）", 1), ("ワインマイル会員100名超", 0), ("オークション\nC2C・海外展開", 0)],
      [("ワインショップ・バー併設\n（2030年1月）", 1), ("シェフ在籍3年満了\n後任体制へ", 1), ("ワインマイル 預かり資産4億円", 0)],
      [("スイーツ店4店舗体制", 1), ("国内オーベルジュ着手", 0), ("IPOへ", 0)]]
PH = ["PhaseⅠ", "PhaseⅠ", "PhaseⅡ", "PhaseⅡ", "PhaseⅢ"]
rect(s, 0.35, 1.20, 9.23, 0.26, fill=BEIGE)
for k, x in enumerate(XS):
    tb(s, x, 1.24, WW, 0.20, f"成長戦略 {PH[k]}", size=7.3, bold=True, color=COPPER, align=PP_ALIGN.CENTER)
    h = rect(s, x, 1.52, WW, 0.40, fill=NAVY2)
    boxtext(h, [[(YT[k], {"sz": 9.5, "b": True})], [(YP[k], {"sz": 6.3, "c": SAND})]], space=1.0)
    rect(s, x, 1.96, WW, 1.50, fill=CARD)
    tb(s, x + 0.10, 2.01, WW - 0.20, 0.16, "連結売上高", size=6.5, color=GREY)
    tb(s, x + 0.10, 2.15, WW - 0.20, 0.34,
       [[(oku(P2["rev"][k]), {"sz": 18, "b": True, "c": COPPER}), (" 億円", {"sz": 8, "b": True, "c": NAVY2})]])
    tb(s, x + 0.10, 2.52, WW - 0.20, 0.16, "連結営業利益", size=6.5, color=GREY)
    tb(s, x + 0.10, 2.65, WW - 0.20, 0.26,
       [[(oku(P2["op"][k]), {"sz": 13, "b": True, "c": NAVY2}), (" 億円", {"sz": 7.5, "b": True, "c": NAVY2}),
         (f"（{pct(P2['op'][k] / P2['rev'][k])}）", {"sz": 6.5, "c": GREY})]])
    tb(s, x + 0.10, 2.98, WW - 0.20, 0.42,
       [[("持分按分後 営業利益", {"sz": 6.3, "c": GREY})],
        [(two(S5["p2"]["attrib_op"][k], S10["p2"]["attrib_op"][k]), {"sz": 9.5, "b": True, "c": COPPER}),
         (" 億円", {"sz": 6.5, "b": True, "c": COPPER})]], space=1.0)
    for m_, (txt, isq) in enumerate(MS[k]):
        yy = 3.54 + m_ * 0.38
        rect(s, x, yy, WW, 0.34, fill=WHITE, line=LINE)
        rect(s, x, yy, 0.05, 0.34, fill=COPPER if isq else NAVY2)
        tb(s, x + 0.11, yy + 0.01, WW - 0.15, 0.32, txt, size=6.6, bold=True, color=NAVY2,
           anchor=MSO_ANCHOR.MIDDLE, space=1.0)
for k in range(NY - 1):
    tb(s, XS[k] + WW, 2.40, XS[k + 1] - XS[k] - WW, 0.30, "▶", size=8, color=COPPER, align=PP_ALIGN.CENTER)
tb(s, 0.35, 4.74, 9.23, 0.45,
   "年度＝WineBank決算期（10月〜翌9月）。カンテサンスは期初取得を仮定したプロフォーマ。持分按分後は、今回の調達5億円／10億円の場合"
   f"（カンテサンス持分{OWN5 * 100:.0f}%／{OWN10 * 100:.0f}%）。銅色の線はカンテサンス関連、紺色の線はWineBankの施策。"
   "アピシウス・ティエリーマルクス等の関連会社は含まない。", size=6.2, color=GREY, space=1.1)
s.notes_slide.notes_text_frame.text = "2026/11/15 シンプル版：p.43の差し替え。WineBank＋カンテサンスのみ。"

# ═══════════ 4. まとめ ═══════════
s = new_slide("まとめ ～WineBankが目指す姿2030～",
              "ワインの川上から川下まで、オンラインとオフラインをひとつの経済圏に")
chain = [("仕入", "インポーター・\nワイン在庫32億円"), ("体験", "三つ星カンテサンス・\n提携レストラン"),
         ("流通", "オークション・\nマーケットプレイス"), ("会員", "ワインマイル・\nWineBank CLUB")]
for k, (head, body_) in enumerate(chain):
    x = 0.40 + k * 2.36
    b = rect(s, x, 1.25, 2.00, 0.66, fill=NAVY2)
    boxtext(b, [[(head, {"sz": 10, "b": True, "c": SAND})], [(body_, {"sz": 7, "c": WHITE})]], space=1.05)
    if k < 3:
        tb(s, x + 2.00, 1.40, 0.36, 0.36, "▶", size=12, color=COPPER, align=PP_ALIGN.CENTER,
           anchor=MSO_ANCHOR.MIDDLE)
tb(s, 0.40, 1.96, 9.20, 0.20, "飲食の場でワインが開き、会員の売買とマイルが次の一本につながる。一社でこの循環を持つことが、他にない強み。",
   size=7.5, color=GREY, align=PP_ALIGN.CENTER)
share = (d_new + d_wt) / d_all
cols = [
    ("一気通貫の経済圏", "WineBank（ワイン・WineTech）の営業利益", f"{oku(WT['op'][0])}→{oku(WT['op'][4])}",
     "管理料・成功報酬・会費・マイルという、預かり資産に連動する継続収益を積み上げる。"),
    ("ブランドの核は三つ星", "連結売上高", f"{oku(P2['rev'][0], 0)}→{oku(P2['rev'][4], 0)}",
     f"自前ではつくれない三つ星を核に、スイーツ・ワインショップへ広げる。売上の増加{oku(d_all, 0)}億円の"
     f"{share * 100:.0f}%は新規事業とWineTechで、新たな買収は織り込まない。"),
    ("利益の質と資産の裏付け", "連結営業利益", f"{oku(P2['op'][0])}→{oku(P2['op'][4])}",
     f"営業利益率は約{P2['op'][4] / P2['rev'][4] * 100:.0f}%。ワイン在庫（管理含む32億円）が企業価値を下支えする。"),
]
for k, (head, lab, val, body_) in enumerate(cols):
    x = 0.40 + k * 3.10
    rect(s, x, 2.28, 2.96, 1.82, fill=CARD)
    tb(s, x + 0.18, 2.36, 2.60, 0.24, head, size=10, bold=True, color=NAVY2)
    tb(s, x + 0.18, 2.66, 2.60, 0.18, lab, size=7, color=GREY)
    tb(s, x + 0.18, 2.84, 2.60, 0.40,
       [[(val, {"sz": 20, "b": True, "c": COPPER}), (" 億円", {"sz": 8.5, "b": True, "c": NAVY2})]])
    tb(s, x + 0.18, 3.32, 2.60, 0.74, body_, size=7.3, color=NAVY, space=1.2)
tb(s, 0.40, 4.12, 9.20, 0.18, "2026年度（予算）→2030年度。年度＝WineBank決算期（10月〜翌9月）。WineBank＋カンテサンスの連結計画。",
   size=6.3, color=GREY)
rect(s, 0.40, 4.36, 9.20, 0.72, fill=NAVY2)
tb(s, 0.60, 4.43, 8.80, 0.60,
   [[("『高級ワインといえばWineBank』を、資産と体験の両面から。", {"sz": 13, "b": True, "c": WHITE})],
    [("三つ星・ワイン在庫・会員の循環を一社で持ち、上場を見据えて、事業ごとの利益と継続収益を開示できる体制を整える。",
      {"sz": 8, "c": SAND})]],
   align=PP_ALIGN.CENTER, space=1.25)
s.notes_slide.notes_text_frame.text = "2026/11/15 シンプル版：p.44「まとめ」の差し替え。数字をWineBank＋カンテサンスの5か年計画に揃えた。"

# ═══════════ 5. 今回のラウンドの考え方 ═══════════
s = new_slide("今回のラウンドの考え方",
              f"プレバリュー{V['pre2']:.0f}億円を目線に、ご相談させてください", band_size=12)
BOX = [("WineBank単体", f"{V['wb']:.1f}", "前回（2026年1月）のポストバリューと同じ評価", CARD, NAVY2),
       ("カンテサンス持分", f"{V['quint']:.1f}", "5年後の売却価値のうちWineBank帰属分を年25%で割引", CARD, NAVY2),
       ("プレバリュー（目線）", f"{V['pre2']:.1f}", f"1株{PPS / 1e4:.0f}万円（前回45万円の{PPS / CAPM['last_price']:.2f}倍）", BEIGE, COPPER)]
for k, (lab, val, sub, fill, fc) in enumerate(BOX):
    x = 0.40 + k * 3.18
    rect(s, x, 1.22, 2.84, 0.74, fill=fill, line=COPPER if k == 2 else None, lw=1.25)
    tb(s, x + 0.15, 1.27, 1.40, 0.20, lab, size=8, bold=True, color=NAVY2)
    tb(s, x + 0.15, 1.46, 2.60, 0.30, [[(val, {"sz": 18, "b": True, "c": fc}), (" 億円", {"sz": 8, "b": True, "c": NAVY2})]])
    tb(s, x + 1.40, 1.52, 1.40, 0.40, sub, size=6.3, color=GREY, space=1.1)
    if k < 2:
        tb(s, x + 2.84, 1.40, 0.34, 0.36, "＋" if k == 0 else "＝", size=14, bold=True, color=COPPER, align=PP_ALIGN.CENTER,
           anchor=MSO_ANCHOR.MIDDLE)
rows = [["", "調達5億円", "調達10億円"],
        [f"発行株数（1株{PPS / 1e4:.0f}万円）", f"{SH5:,}株", f"{SH10:,}株"],
        ["ポストバリュー", f"{POST5:.0f}億円", f"{POST10:.0f}億円"],
        ["今回の投資家様の持株比率（潜在株込み）", pct(SH5 / (FD + SH5)), pct(SH10 / (FD + SH10))],
        ["資金の使い道", "カンテサンス持分の取得 4億円\n共通基盤（WineTech） 1億円", "カンテサンス持分の取得 8億円\n共通基盤（WineTech） 2億円"],
        ["増資後のカンテサンス持分", f"{OWN5 * 100:.1f}%", f"{OWN10 * 100:.1f}%"],
        ["2030年度 持分按分後 当期純利益（目安）", f"{NI5:.1f}億円", f"{NI10:.1f}億円"],
        ["上場時の時価総額（PER15／20／25倍）", "／".join(f"{NI5 * p:.0f}" for p in (15, 20, 25)) + "億円",
         "／".join(f"{NI10 * p:.0f}" for p in (15, 20, 25)) + "億円"],
        ["投資倍率（PER20倍で上場した場合）", f"{NI5 * 20 / POST5:.1f}倍", f"{NI10 * 20 / POST10:.1f}倍"]]
styles = {(i, 0): dict(bold=True, color=NAVY2, fill=CARD, align=PP_ALIGN.LEFT) for i in range(1, 9)}
for i in range(1, 9):
    for j in (1, 2):
        styles[(i, j)] = dict(align=PP_ALIGN.CENTER)
for j in (1, 2):
    styles[(4, j)] = dict(align=PP_ALIGN.CENTER, size=6.5)
    styles[(8, j)] = dict(align=PP_ALIGN.CENTER, bold=True, color=COPPER, fill=BEIGE, size=8)
styles[(8, 0)] = dict(bold=True, color=NAVY2, fill=BEIGE, align=PP_ALIGN.LEFT)
table(s, 0.40, 2.06, [3.40, 2.90, 2.90], [0.22] + [0.21] * 3 + [0.34] + [0.21] * 4, rows, size=7.0, styles=styles)
tb(s, 0.40, 4.33, 9.20, 0.16,
   "当期純利益（目安）は、カンテサンスの純利益（LBOの金利等を控除後）×持分＋WineBankの営業利益×(1−34%)。上場時の希薄化は含まない概算。PERは仮置き。",
   size=6.0, color=GREY)
callout(s, 0.40, 4.54, 4.50, 0.64, "調達額を増やしても投資倍率は下がらない",
        "調達額の80%でカンテサンスの持分を高めるため、三つ星の利益の取り分が増える。")
callout(s, 5.10, 4.54, 4.50, 0.64, "EXITの考え方",
        "2030年度の実績でのIPOを基本に、M&Aも視野に入れる。評価額と調達額は、投資家様のお考えを伺って調整したい。")
s.notes_slide.notes_text_frame.text = (
    "2026/11/15 シンプル版：p.52の差し替え。岡田様のご意見「Pre33億円を目線として、相談できる持って行き方」を反映。"
    "関連会社の統合はプレバリューに加えない。")

# ═══════════ 6. Appendix：関連会社の将来の合流シナリオ ═══════════
s = new_slide("Appendix：関連会社の将来の合流シナリオ",
              "アピシウス・ティエリーマルクス等は、今回の計画と評価には含めず、将来の合流を選択肢として持つ", band_size=11.5)
tb(s, 0.40, 1.22, 5.60, 0.20, "関連会社の計画（億円）", size=9, bold=True, color=NAVY2)
REL = [("アピシウス（銀座・創業41年のグランメゾン）", SG["アピシウス"]),
       ("Brasserie Thierry Marx（2027年4月 六本木開業）", SG["ブラッスリー"]),
       ("レストラン運営（グループ各社）", SG["レストラン運営"])]
rows = [["会社", "2026年度\n売上", "営業利益", "2030年度\n売上", "営業利益"]]
for nm, sg in REL:
    rows.append([nm, oku(sg["rev"][0]), oku(sg["op"][0]), oku(sg["rev"][4]), oku(sg["op"][4])])
rr = [sum(sg[k][i] for _, sg in REL) for k, i in (("rev", 0), ("op", 0), ("rev", 4), ("op", 4))]
rows.append(["関連会社 計", *[oku(x) for x in rr]])
styles = {(i, 0): dict(bold=True, color=NAVY2, align=PP_ALIGN.LEFT, size=7.0) for i in range(1, 4)}
for i in range(1, 4):
    for j in (2, 4):
        styles[(i, j)] = dict(bold=True, color=COPPER)
styles[(4, None)] = dict(fill=NAVY2, color=WHITE, bold=True)
styles[(4, 0)] = dict(fill=NAVY2, color=WHITE, bold=True, align=PP_ALIGN.LEFT)
table(s, 0.40, 1.44, [2.90, 0.68, 0.68, 0.68, 0.68], [0.36] + [0.30] * 4, rows, size=7.5, styles=styles)
tb(s, 0.40, 3.04, 5.62, 0.30,
   "いずれも中野個人等が保有し、現在WineBankとの資本関係はない。ティエリーマルクスはWineBankがサブライセンスで運営に関与。"
   "レストラン運営は営業利益1億円で横ばいと置いた。", size=6.3, color=GREY, space=1.15)

tb(s, 6.25, 1.22, 3.35, 0.20, "合流した場合の規模（億円）", size=9, bold=True, color=NAVY2)
rows = [["", "今回の計画", "合流した場合"],
        ["連結売上高\n（2026→2030年度）", f"{oku(P2['rev'][0], 0)}→{oku(P2['rev'][4], 0)}", f"{oku(P1['rev'][0], 0)}→{oku(P1['rev'][4], 0)}"],
        ["連結営業利益\n（2026→2030年度）", f"{oku(P2['op'][0])}→{oku(P2['op'][4])}", f"{oku(P1['op'][0])}→{oku(P1['op'][4])}"]]
styles = {(i, 0): dict(bold=True, color=NAVY2, fill=CARD, align=PP_ALIGN.LEFT, size=7.0) for i in (1, 2)}
for i in (1, 2):
    styles[(i, 1)] = dict(align=PP_ALIGN.CENTER, size=9)
    styles[(i, 2)] = dict(align=PP_ALIGN.CENTER, size=9, bold=True, color=COPPER, fill=BEIGE)
table(s, 6.25, 1.44, [1.35, 1.00, 1.00], [0.30, 0.48, 0.48], rows, size=7.5, styles=styles)
tb(s, 6.25, 2.76, 3.35, 0.50, "合流は株式交換を想定しており、追加の資金調達は不要。交換比率は、合流する時点の評価で決める。",
   size=6.5, color=NAVY, space=1.15)

callout(s, 0.40, 3.52, 4.50, 1.00, "今回のディールとは切り分ける",
        "今回の増資は、WineBank＋カンテサンスの計画と評価（プレバリュー33億円）で行う。"
        "関連会社の合流は、DDの負担とディールのリスクを増やさないよう、今回の評価には加えない。")
callout(s, 5.10, 3.52, 4.50, 1.00, "合流の時期は当社で決められる",
        "川上のファインワインと川下のファインダイニングを、ワインマイルでつなぐ構想の一部。"
        "上場に向けて規模が必要な段階で、株主の皆様と協議のうえ合流を判断する。")
tb(s, 0.40, 4.66, 9.20, 0.40,
   "年度＝WineBank決算期（10月〜翌9月）。各社の決算期を月割りで組替え。グループ内取引の消去は未反映。"
   "合流した場合の数字は、各社を100%連結した単純合算（持分はアピシウス70%・ティエリーマルクス66.7%・レストラン運営60%を想定）。",
   size=6.2, color=GREY, space=1.15)
s.notes_slide.notes_text_frame.text = (
    "2026/11/15 シンプル版：Appendix。岡田様のご意見「今回のディールとは切り分け、将来的に合流するシナリオとして追加。"
    "今回のPreValにはアドオンしない」を反映。旧p.49〜51（株主ご指摘への回答3枚）の代わりに使う。")

# ───────── 元スライドを削除して保存 ─────────
lst = pr.slides._sldIdLst
for el in list(lst)[:N_ORIG]:
    pr.part.drop_rel(el.get(R + "id"))
    lst.remove(el)
pr.save(OUT)
print("saved", OUT, len(pr.slides))
