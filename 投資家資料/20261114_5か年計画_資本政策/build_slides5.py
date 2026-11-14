# -*- coding: utf-8 -*-
"""会社紹介（投資家様）20261114版の差し替えスライド：p.40・42・49・50・51。

5か年計画（2026年度〜2030年度、model5.json）で作り直し、集計を次の3パターンに変える。
  ① グループ全体（カンテサンス・アピシウス・ティエリーマルクス・レストラン運営を含む。従来の「含む」）
  ② WineBank＋カンテサンス（アピシウス以下を除く）
  ③ 持分按分（①・②）
カンテサンスは榊原様提出の【B】新規事業込みで統合。会社紹介デックと同じマスター（9/30会社案内）を使う。

使い方:
  python3 build_slides5.py <テンプレートpptx> <model5.json> <出力pptx>
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
P1, P2 = M["p1"], M["p2"]
Q = M["quint"]
V = M["valuation"]
CAPM = M["cap"]
YL = ["2026年度\n（予算）", "2027年度", "2028年度", "2029年度", "2030年度"]
LAB1, LAB2 = "① グループ全体", "② WineBank＋カンテサンス"


def e_(key):
    return next(e for e in M["entities"] if e["key"] == key)


# ═══════════ p.40 ファインダイニング ～ビジネスモデルに伴う組織再編～ ═══════════
s = new_slide("ファインダイニング ～ビジネスモデルに伴う組織再編～",
              f"持分をWineBankへ集約し連結運営へ ― ①グループ連結売上 {oku(P1['rev'][0], 0)}億円（2026年度予算）→ "
              f"{oku(P1['rev'][4], 0)}億円（2030年度）", band_size=12)
tb(s, 0.30, 1.19, 4.30, 0.18,
   "株主：中野邦人／マネーフォワードVP（HIRAC FUND）／PrivateBANK／ベクトル／寺田倉庫 ほか",
   size=6.3, color=GREY)
wb = rect(s, 0.30, 1.40, 4.30, 0.56, fill=NAVY2)
boxtext(wb, [[("株式会社WineBank（親会社）", {"sz": 11, "b": True})],
             [("ワイン卸・EC ｜ WineTech（ファンド・ST・オークション）｜ ワインマイル ｜ WineBank CLUB",
               {"sz": 6.3, "c": SAND})]], space=1.1)
tb(s, 0.30, 2.01, 4.30, 0.18, "▼ 外部投資家以外の持分（中野個人保有分等）をWineBankへ譲渡・集約",
   size=7, bold=True, color=COPPER, align=PP_ALIGN.CENTER)
CXS = [0.30, 1.39, 2.48, 3.57]
CW = 1.03
line(s, CXS[0] + CW / 2, 2.29, CXS[3] + CW / 2, 2.29, color=GREY)
line(s, 2.45, 2.21, 2.45, 2.29, color=GREY)
cols = [
    ("グランメゾン", COPPER, [("カンテサンス", "51%", "SPC経由（外部49%）\n三つ星／12月取得予定", True),
                         ("アピシウス", "70%", "銀座・創業41年", False)]),
    ("ブラッスリー", COPPER, [("Brasserie\nThierry Marx", "66.7%", "外部投資家33.3%\n2027年4月 六本木開業", False),
                         ("ティエリーマルクス×TBS", "ライセンス", "サブライセンスで\nWineBankが運営", False)]),
    ("レストラン運営", COPPER, [("グループ各社", "60%", "首都圏の飲食店舗\n営業利益 年1億円", False)]),
    ("持分法等（連結外）", "9E9E9E", [("あどばる", "37%", "ビジョングループ\n（東証プライム）", False)]),
]
for (head, hc, items), x in zip(cols, CXS):
    line(s, x + CW / 2, 2.29, x + CW / 2, 2.36, color=GREY)
    h = rect(s, x, 2.36, CW, 0.24, fill=hc)
    boxtext(h, head, size=7.5, bold=True)
    for k, (nm, pc_, note, in2) in enumerate(items):
        yy = 2.66 + k * 0.70
        grey = hc != COPPER
        b = rect(s, x, yy, CW, 0.64, fill=BEIGE if in2 else CARD, line=COPPER if in2 else LINE,
                 lw=1.25 if in2 else 0.75)
        boxtext(b, [[(nm, {"sz": 6.5, "b": True, "c": GREY if grey else NAVY2})],
                    [(pc_, {"sz": 9, "b": True, "c": GREY if grey else COPPER})],
                    [(note, {"sz": 5.5, "c": GREY})]], space=1.0, margin=0.03)
flow = rect(s, 0.30, 4.08, 4.30, 0.44, fill=CARD)
boxtext(flow, [[("① グループ全体", {"b": True, "c": NAVY2}), ("＝WineBank＋グランメゾン2店＋ブラッスリー＋レストラン運営", {})],
               [("② WineBank＋カンテサンス", {"b": True, "c": COPPER}), ("＝網掛けの2社のみ（アピシウス以下を除く）", {})]],
        size=6.5, color=NAVY, align=PP_ALIGN.LEFT, space=1.15, margin=0.10)

tb(s, 4.75, 1.19, 4.95, 0.18, "連結業績計画（億円）", size=8.5, bold=True, color=NAVY2)
rows = [["セグメント", "", *YL]]
styles = {}
merges = [(0, 0, 0, 1)]
for nm in ("ワイン・WineTech", "カンテサンス", "アピシウス", "ブラッスリー", "レストラン運営"):
    sg = SG[nm]
    i0 = len(rows)
    lab = nm + ("\n（既存＋新規事業）" if nm == "カンテサンス" else "")
    rows.append([lab, "売上高", *[oku(v) for v in sg["rev"]]])
    rows.append(["", "営業利益", *[oku(v) for v in sg["op"]]])
    merges.append((i0, 0, i0 + 1, 0))
    in2 = nm in ("ワイン・WineTech", "カンテサンス")
    styles[(i0, 0)] = dict(bold=True, color=NAVY2, align=PP_ALIGN.LEFT, size=6.8, fill=BEIGE if in2 else WHITE)
    styles[(i0 + 1, None)] = dict(fill=CARD)
    for j in range(2, 2 + NY):
        styles[(i0 + 1, j)] = dict(fill=CARD, color=COPPER, bold=True)
TOTAL_ROWS = (
    ("① グループ全体 売上高", P1["rev"], NAVY2, WHITE),
    ("① グループ全体 営業利益", P1["op"], NAVY2, WHITE),
    ("② WB＋カンテサンス 売上高", P2["rev"], COPPER, WHITE),
    ("② WB＋カンテサンス 営業利益", P2["op"], COPPER, WHITE),
    ("③ 持分按分 営業利益（①）", P1["attrib_op"], BEIGE, NAVY),
    ("③ 持分按分 営業利益（②）", P2["attrib_op"], BEIGE, NAVY),
)
for lab, vals, fill, fc in TOTAL_ROWS:
    i0 = len(rows)
    rows.append([lab, "", *[oku(v) for v in vals]])
    merges.append((i0, 0, i0, 1))
    styles[(i0, None)] = dict(fill=fill, color=fc, bold=True)
    styles[(i0, 0)] = dict(fill=fill, color=fc, bold=True, align=PP_ALIGN.LEFT, size=6.3)
for i in range(1, 11):
    styles[(i, 1)] = dict(styles.get((i, 1), {}), align=PP_ALIGN.CENTER, size=6.5, color=GREY)
table(s, 4.75, 1.40, [1.38, 0.47, 0.61, 0.61, 0.61, 0.61, 0.61],
      [0.26] + [0.17] * 10 + [0.175] * 6, rows, size=7.0, merges=merges, styles=styles)
qn = "／".join(oku(v) for v in Q["rev_new"])
tb(s, 0.30, 4.66, 9.40, 0.58,
   [[("年度＝WineBank決算期（10月〜翌9月）。2026年度＝2027年9月期の予算。", {"b": True}),
     ("ワイン・WineTech（2026〜2029年度）とレストラン運営の営業利益は経営判断による修正値。億円未満を四捨五入。", {})],
    [(f"カンテサンスは期初取得を仮定したプロフォーマで、既存本店（IM計画）に新規事業（ガトー・オ・コンテ拡大・一品スイーツ店・"
      f"ワインショップ／バー。売上 {qn}億円）を加えた計画（買収SPCの出資者様に提出した計画と同じ）。"
      "決算期が異なる子会社は月割りで組替え。グループ内取引の消去は未反映。"
      "持分按分はカンテサンス51%・アピシウス70%・TM66.7%・レストラン運営60%。", {})]],
   size=5.9, color=GREY, space=1.1)
s.notes_slide.notes_text_frame.text = (
    "2026/11/14：5か年（2026〜2030年度）に延長。カンテサンスは榊原様提出の【B】新規事業込みで統合。"
    "集計を①グループ全体／②WineBank＋カンテサンス（アピシウス以下を除く）／③持分按分に変更。"
    "数値は 5か年計画_資本政策_20261114.xlsx（5か年計画）と一致。")

# ═══════════ p.42 中長期ロードマップ ═══════════
s = new_slide("中長期ロードマップ",
              f"①グループ連結で売上{oku(P1['rev'][4], 0)}億円・営業利益{oku(P1['op'][4], 0)}億円（2030年度）へ。"
              "IPOを見据えて体制を整備", band_size=12)
XS = [0.35 + k * 1.87 for k in range(NY)]
WW = 1.75
YT = ["2026年度（予算）", "2027年度", "2028年度", "2029年度", "2030年度"]
YP = ["2026/10〜2027/9", "2027/10〜2028/9", "2028/10〜2029/9", "2029/10〜2030/9", "2030/10〜2031/9"]
MS = [["持分集約による組織再編", "カンテサンス取得（12月）", "Thierry Marx 六本木\n開業（2027年4月）"],
      ["ワインマイル本格展開", "ガトー・オ・コンテ拡大\n一品スイーツ店1号（2028年1月）", "Thierry Marx\n札幌・大阪（2028年）"],
      ["Thierry Marx 首都圏・\n政令指定都市（2029年）", "ワインマイル会員100名超", "オークション\nC2C・海外展開"],
      ["Thierry Marx リゾート含め\n年2店舗（2030年〜）", "カンテサンス併設\nワインショップ・バー", "シェフ在籍3年満了\n後任体制へ"],
      ["一品スイーツ店 4店舗体制", "国内オーベルジュ着手", "IPOへ"]]
PH = ["PhaseⅠ", "PhaseⅠ", "PhaseⅡ", "PhaseⅡ", "PhaseⅢ"]
rect(s, 0.35, 1.20, 9.23, 0.26, fill=BEIGE)
for k, x in enumerate(XS):
    tb(s, x, 1.24, WW, 0.20, f"成長戦略 {PH[k]}", size=7.3, bold=True, color=COPPER, align=PP_ALIGN.CENTER)
    h = rect(s, x, 1.52, WW, 0.40, fill=NAVY2)
    boxtext(h, [[(YT[k], {"sz": 9.5, "b": True})], [(YP[k], {"sz": 6.3, "c": SAND})]], space=1.0)
    rect(s, x, 1.96, WW, 1.52, fill=CARD)
    tb(s, x + 0.10, 2.00, WW - 0.20, 0.16, "① 連結売上高", size=6.5, color=GREY)
    tb(s, x + 0.10, 2.14, WW - 0.20, 0.34,
       [[(oku(P1["rev"][k]), {"sz": 18, "b": True, "c": COPPER}), (" 億円", {"sz": 8, "b": True, "c": NAVY2})]])
    tb(s, x + 0.10, 2.50, WW - 0.20, 0.16, "① 連結営業利益", size=6.5, color=GREY)
    tb(s, x + 0.10, 2.63, WW - 0.20, 0.26,
       [[(oku(P1["op"][k]), {"sz": 13, "b": True, "c": NAVY2}), (" 億円", {"sz": 7.5, "b": True, "c": NAVY2}),
         (f"（{pct(P1['op'][k] / P1['rev'][k])}）", {"sz": 6.5, "c": GREY})]])
    tb(s, x + 0.10, 2.92, WW - 0.20, 0.18,
       [[("② WB＋カンテサンス ", {"sz": 6.3, "c": GREY}), (oku(P2["op"][k]), {"sz": 9.5, "b": True, "c": COPPER}),
         (" 億円", {"sz": 6.5, "b": True, "c": COPPER})]])
    tb(s, x + 0.10, 3.15, WW - 0.20, 0.30,
       [[("③ 持分按分 ①", {"sz": 6.3, "c": GREY}), (f"{oku(P1['attrib_op'][k])}", {"sz": 8.5, "b": True, "c": NAVY2}),
         (" ②", {"sz": 6.3, "c": GREY}), (f"{oku(P2['attrib_op'][k])}", {"sz": 8.5, "b": True, "c": NAVY2})]])
    for m_, txt in enumerate(MS[k]):
        yy = 3.56 + m_ * 0.38
        rect(s, x, yy, WW, 0.34, fill=WHITE, line=LINE)
        rect(s, x, yy, 0.05, 0.34, fill=COPPER if "カンテサンス" in txt or "スイーツ" in txt or "シェフ" in txt
             or "ガトー" in txt else NAVY2)
        tb(s, x + 0.11, yy + 0.01, WW - 0.15, 0.32, txt, size=6.6, bold=True, color=NAVY2,
           anchor=MSO_ANCHOR.MIDDLE, space=1.0)
for k in range(NY - 1):
    tb(s, XS[k] + WW, 2.40, XS[k + 1] - XS[k] - WW, 0.30, "▶", size=8, color=COPPER, align=PP_ALIGN.CENTER)
tb(s, 0.35, 4.75, 9.23, 0.45,
   "連結数値は組織再編後のプロフォーマ（ファインダイニング～組織再編～の頁を参照）。年度＝WineBank決算期（10月〜翌9月）。"
   "①グループ全体／②WineBank＋カンテサンス（アピシウス以下を除く）／③持分按分。銅色の線はカンテサンス関連の施策。",
   size=6.2, color=GREY, space=1.1)
s.notes_slide.notes_text_frame.text = "2026/11/14：5か年に延長し、①②③の3パターンを併記。"

# ═══════════ p.49 ② ロールアップではなく、垂直統合 ═══════════
s = new_slide("② ロールアップではなく、垂直統合",
              "ワイン流通の出口となる名店だけを選んで取得し、成長の主役は新規出店・新規事業とWineTech")
rows = [["", "一般的なロールアップ", "当社"],
        ["目的", "同業を束ね、評価倍率の差で企業価値を上げる", "ワインの出口とブランドの核を持つ"],
        ["対象", "同業を数多く取得", "星や歴史など、自前でつくれない名店に限る"],
        ["成長の源泉", "買収の積み上げ", "新規出店（ティエリーマルクス）・名店の新規事業・WineTech"],
        ["取得後", "本部集約・コスト削減", "人を入れ替えず、ワインの仕入と新規事業で伸ばす"],
        ["全国展開", "買収で拠点を増やす", "提携・運営支援・外部在庫を活用し、すべてを自社で持たない"]]
styles = {(i, 0): dict(bold=True, color=NAVY2, fill=CARD) for i in range(1, 6)}
for i in range(1, 6):
    styles[(i, 1)] = dict(align=PP_ALIGN.LEFT, color=GREY)
    styles[(i, 2)] = dict(align=PP_ALIGN.LEFT, color=COPPER, bold=True)
table(s, 0.40, 1.30, [0.85, 1.95, 2.45], [0.28] + [0.42] * 5, rows, size=7.8, styles=styles)
qa_r, qn_r = Q["rev_a"], Q["rev_new"]
inc = [("ブラッスリー（新規出店）", SG["ブラッスリー"]["rev"], True),
       ("カンテサンス 新規事業", qn_r, True),
       ("ワイン・WineTech", SG["ワイン・WineTech"]["rev"], True),
       ("カンテサンス 既存本店", qa_r, False),
       ("アピシウス", SG["アピシウス"]["rev"], False),
       ("レストラン運営", SG["レストラン運営"]["rev"], False)]
tb(s, 5.85, 1.24, 3.75, 0.20, "① グループ全体の売上の増加（億円）", size=9, bold=True, color=NAVY2)
rows = [["", "2026年度", "2030年度", "増加"]]
for nm, v, _ in inc:
    rows.append([nm, oku(v[0]), oku(v[4]), "+" + oku(v[4] - v[0])])
rows.append(["① 合計", oku(P1["rev"][0]), oku(P1["rev"][4]), "+" + oku(P1["rev"][4] - P1["rev"][0])])
styles = {(i, 0): dict(bold=True, color=NAVY2, size=7.0) for i in range(1, 7)}
for i, (_, _, grow) in enumerate(inc, 1):
    styles[(i, 3)] = dict(bold=True, color=COPPER if grow else GREY)
    if grow:
        styles[(i, None)] = dict(fill=BEIGE)
        styles[(i, 0)] = dict(bold=True, color=NAVY2, size=7.0, fill=BEIGE)
        styles[(i, 3)] = dict(bold=True, color=COPPER, fill=BEIGE)
styles[(7, None)] = dict(fill=NAVY2, color=WHITE, bold=True)
table(s, 5.85, 1.46, [1.60, 0.70, 0.70, 0.70], [0.26] + [0.24] * 7, rows, size=7.6, styles=styles)
d_all = P1["rev"][4] - P1["rev"][0]
d_new = sum(v[4] - v[0] for _, v, g in inc if g)
cagr = (P1["rev"][4] / P1["rev"][0]) ** 0.25 - 1
tb(s, 5.85, 3.66, 3.75, 0.36,
   f"増加{oku(d_all)}億円の{d_new / d_all * 100:.0f}%は新規出店・カンテサンスの新規事業・WineTech。年率約{cagr * 100:.0f}%。"
   "カンテサンス以外に新たな買収を織り込まない計画。", size=6.8, color=GREY, space=1.15)
callout(s, 0.40, 4.06, 4.50, 0.90, "取得後に伸ばした実績と計画",
        "アピシウスは承継から2年で売上+30%・営業利益2.5倍超。カンテサンスも、本店はそのままに"
        f"ガトー・オ・コンテとスイーツ店で売上を{oku(qn_r[4])}億円上乗せする（2030年度）。")
callout(s, 5.10, 4.06, 4.50, 0.90, "「旬」ではなく構造的な課題",
        "オーナーシェフの高齢化で、名店の承継は今後も続く。カンテサンスも承継の案件。買い手として選ばれる体制が強みになる。")

# ═══════════ p.50 ③ 飲食の利益率と、上場時の評価の考え方 ═══════════
s = new_slide("③ 飲食の利益率と、上場時の評価の考え方",
              "飲食を一括りにせず、事業ごとの利益構造でご評価いただきたい")
AXIS = {"ワイン・WineTech": "預かり資産・継続収益（管理料2.75%・成功報酬30%）",
        "カンテサンス": "三つ星19年の唯一性。本店＋スイーツ・ワインショップ",
        "アピシウス": "創業41年の歴史。承継後の改善余地",
        "ブラッスリー": "出店数×店舗利益。出店初期のため率は低い",
        "レストラン運営": "安定したキャッシュとワインの消費の場"}
rows = [["セグメント", "2026年度 売上", "営業利益", "利益率", "2030年度 売上", "営業利益", "利益率", "評価の軸"]]
for nm in AXIS:
    sg = SG[nm]
    rows.append([nm, oku(sg["rev"][0]), oku(sg["op"][0]), pct(sg["op"][0] / sg["rev"][0]),
                 oku(sg["rev"][4]), oku(sg["op"][4]), pct(sg["op"][4] / sg["rev"][4]), AXIS[nm]])
for lab, t in ((LAB1, P1), (LAB2, P2)):
    rows.append([lab, oku(t["rev"][0]), oku(t["op"][0]), pct(t["op"][0] / t["rev"][0]),
                 oku(t["rev"][4]), oku(t["op"][4]), pct(t["op"][4] / t["rev"][4]), ""])
for lab, t in (("③ 持分按分（①）", P1), ("③ 持分按分（②）", P2)):
    rows.append([lab, "", oku(t["attrib_op"][0]), "", "", oku(t["attrib_op"][4]), "", "親会社に帰属する営業利益の目安"])
styles = {(i, 0): dict(bold=True, color=NAVY2, size=7.3) for i in range(1, 6)}
for i in range(1, 6):
    for j in (3, 6):
        styles[(i, j)] = dict(bold=True, color=COPPER)
    styles[(i, 7)] = dict(align=PP_ALIGN.LEFT, size=6.4, color=GREY)
for i in (1, 2):
    styles[(i, 0)] = dict(bold=True, color=NAVY2, size=7.3, fill=BEIGE)
styles[(6, None)] = dict(fill=NAVY2, color=WHITE, bold=True)
styles[(6, 0)] = dict(fill=NAVY2, color=WHITE, bold=True, size=7.0, align=PP_ALIGN.LEFT)
styles[(7, None)] = dict(fill=COPPER, color=WHITE, bold=True)
styles[(7, 0)] = dict(fill=COPPER, color=WHITE, bold=True, size=6.6, align=PP_ALIGN.LEFT)
for i in (8, 9):
    styles[(i, None)] = dict(fill=BEIGE, bold=True)
    styles[(i, 0)] = dict(fill=BEIGE, bold=True, size=7.0, align=PP_ALIGN.LEFT, color=NAVY2)
    styles[(i, 7)] = dict(fill=BEIGE, size=6.4, align=PP_ALIGN.LEFT, color=GREY)
table(s, 0.40, 1.26, [1.60, 0.76, 0.66, 0.64, 0.76, 0.66, 0.64, 3.48], [0.30] + [0.26] * 9, rows,
      size=7.6, styles=styles)
tb(s, 0.40, 4.25, 9.20, 0.16, "単位：億円。億円未満を四捨五入。②はワイン・WineTechとカンテサンス（網掛け）の合計。",
   size=6.3, color=GREY)
callout(s, 0.40, 4.44, 4.50, 0.76, "利益率は一般的な外食より高い",
        f"①は{pct(min(P1['op'][i] / P1['rev'][i] for i in range(NY)))}〜{pct(max(P1['op'][i] / P1['rev'][i] for i in range(NY)))}、"
        f"②は{pct(min(P2['op'][i] / P2['rev'][i] for i in range(NY)))}〜{pct(max(P2['op'][i] / P2['rev'][i] for i in range(NY)))}。"
        "利益率の低い飲食は運営会社に分け、数字を見える形にする。")
callout(s, 5.10, 4.44, 4.50, 0.76, "上場時はワインのプラットフォームとして開示",
        "預かり資産・継続収益の比率・ワイン在庫（管理含む32億円）を主要指標にし、外食の倍率で一律に評価されることを避ける。")

# ═══════════ p.51 上場後の時価総額の目安 ═══════════
PERS = (15, 20, 25)
s = new_slide("上場後の時価総額の目安と、今回のプレバリュー（当社試算）",
              "グロース市場の上場維持基準（上場5年後に時価総額100億円以上）を見据えて", band_size=12)
rows = [["ケース（2030年度）", "③ 持分按分後\n営業利益", "当期純利益\n（目安）"] + [f"PER {p}倍" for p in PERS]]
for lab, t in ((LAB1, P1), (LAB2, P2)):
    ni = t["attrib_ni"][4]
    rows.append([lab, oku(t["attrib_op"][4]), oku(ni)] + [f"{ni * p / 100:,.0f}億円" for p in PERS])
styles = {(1, None): dict(bold=True), (2, None): dict(bold=True)}
styles[(1, 0)] = dict(fill=NAVY2, color=WHITE, bold=True, align=PP_ALIGN.LEFT)
styles[(2, 0)] = dict(fill=COPPER, color=WHITE, bold=True, align=PP_ALIGN.LEFT, size=8)
for i, t in ((1, P1), (2, P2)):
    for j, p in enumerate(PERS, 3):
        hit = t["attrib_ni"][4] * p >= 10000
        styles[(i, j)] = dict(bold=True, color=COPPER if hit else NAVY, fill=BEIGE if hit else WHITE,
                              align=PP_ALIGN.CENTER)
table(s, 0.40, 1.28, [2.10, 1.30, 1.30, 1.50, 1.50, 1.50], [0.42, 0.36, 0.36], rows, size=9, styles=styles)
tb(s, 0.40, 2.47, 9.20, 0.34,
   "当期純利益（目安）：カンテサンスは合併後の会社の純利益（LBOの金利・出資者様への年3%等を控除後）×51%、それ以外は持分按分後営業利益×"
   "(1−実効税率34%)。WineBank本体の支払利息とのれん償却は含まない。PERは仮置き。網掛けは100億円以上。",
   size=6.3, color=GREY, space=1.15)
# 今回のプレバリュー
pps = CAPM["price"]
rows = [["今回のプレバリュー（案）", "② WineBank＋カンテサンス", "① グループ全体"],
        ["プレバリュー", f"{V['pre2']:.0f}億円", f"{V['pre1']:.0f}億円"],
        ["内訳", f"WineBank単体{V['wb']:.0f}＋カンテサンス持分{V['quint']:.0f}",
         f"②＋集約する持分{V['reorg_sum']:.0f}（アピシウス{V['reorg']['apicius']:.1f}・TM{V['reorg']['tm']:.1f}・"
         f"レストラン{V['reorg']['rest']:.1f}）"],
        ["1株価格（前回45万円）", f"{pps / 1e4:.0f}万円（{pps / CAPM['last_price']:.2f}倍）", "同じ（集約する持分の対価として新株を発行）"]]
styles = {(i, 0): dict(bold=True, color=NAVY2, fill=CARD, align=PP_ALIGN.LEFT) for i in range(1, 4)}
for i in range(1, 4):
    styles[(i, 1)] = dict(align=PP_ALIGN.CENTER, bold=i == 1, color=COPPER if i == 1 else NAVY, size=9 if i == 1 else 7.5)
    styles[(i, 2)] = dict(align=PP_ALIGN.CENTER, bold=i == 1, color=COPPER if i == 1 else NAVY, size=9 if i == 1 else 7.5)
table(s, 0.40, 2.90, [2.10, 3.55, 3.55], [0.28, 0.30, 0.28, 0.28], rows, size=7.5, styles=styles)
callout(s, 0.40, 4.24, 4.50, 0.92, "①と②の考え方",
        "1株価格は②で決め、①はアピシウス以下の持分を同じ株価で集約する。既存株主の持分の価値は①②で変わらず、"
        "集約した事業の成長（ティエリーマルクスの出店等）は全株主に帰属する。")
callout(s, 5.10, 4.24, 4.50, 0.92, "評価倍率を上げる手段",
        "WineTechの継続収益（管理料・成功報酬・会費・マイル）を積み上げ、外食ではなくプラットフォームの倍率で見てもらう。"
        "カンテサンスの取得の確定を条件に、評価を引き上げる設計とする。")

# ───────── 元スライドを削除して保存 ─────────
lst = pr.slides._sldIdLst
for el in list(lst)[:N_ORIG]:
    pr.part.drop_rel(el.get(R + "id"))
    lst.remove(el)
pr.save(OUT)
print("saved", OUT, len(pr.slides))
