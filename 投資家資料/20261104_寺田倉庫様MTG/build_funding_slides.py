# -*- coding: utf-8 -*-
"""寺田倉庫様MTG（2026/11/4）用：資金調達のご説明（VC面談でのご指摘①〜③への回答を反映）。

会社紹介デックと同じマスター（9/30会社案内）に、追加・差替用のスライドを作る。
数値は ../20261022_VC資本業務提携/model.json（p.41で修正したセグメント営業利益を反映済み）から取る。

使い方:
  python3 build_funding_slides.py <テンプレートpptx> <model.json> <出力pptx>
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



SEGS = {sg["name"]: sg for sg in M["segments"]}
TOT, EX, Q = M["total"], M["total_ex"], M["quint"]
API = next(e for e in M["entities"] if e["key"] == "apicius")
TAX = 0.34                    # 実効税率（カンテサンスCF計画と同じ）
PERS = (15, 20, 25)           # 上場時の評価倍率の仮置き


def margin(sg, i):
    return SEGS[sg]["op"][i] / SEGS[sg]["rev"][i]


def callout(s, x, y, w, h, head, body):
    rect(s, x, y, w, h, fill=CARD)
    rect(s, x, y, 0.05, h, fill=COPPER)
    tb(s, x + 0.17, y + 0.06, w - 0.27, h - 0.10,
       [[(head, {"sz": 10.5, "b": True, "c": BLACK})], [(body, {"sz": 7.8, "c": NAVY})]], space=1.2)


# ═══════════ 1. VC面談でのご指摘と当社の考え ═══════════
s = new_slide("VC面談でいただいたご指摘と当社の考え",
              "戦略は評価いただいた。論点は「ロールアップの見え方」と「飲食の利益率が上場時の評価にどう効くか」",
              band_size=11)
rows = [["ご指摘", "当社の考え", "根拠となる数字"],
        ["① 川上〜川下・オンライン〜オフラインは、ワインの販売・認知を含め戦略的に面白い",
         "同意。飲食店はワインの出口であり、ワインマイルの使い先。ワインの回転と会員の継続を支える仕組みとして、数字で示していく",
         f"ワイン・WineTechの営業利益 {oku(SEGS['ワイン・WineTech']['op'][0])}億円（2026年度）→ "
         f"{oku(SEGS['ワイン・WineTech']['op'][3])}億円（2029年度）\nワインマイル預かり資産 4.0億円（2029年度末）"],
        ["② ロールアップと位置付けると、時代のあだ花／旬とも見える",
         "倍率の差を狙う数集めではない。自前でつくれない名店だけを選び、ワイン流通の出口を押さえる垂直統合",
         f"カンテサンスを除く売上 {oku(EX['rev'][0])}億円→{oku(EX['rev'][3])}億円の増加は、すべて既存事業と新規出店\n"
         "アピシウスは承継2年で営業利益2.5倍超"],
        ["③ 飲食の利益率が低い。PERは悪くないが、上場時の株価への影響は未知数",
         "飲食を一括りにせず事業別に評価いただく。上場時は「需要側を自社で持つファインワインのプラットフォーム」として開示する",
         f"グランメゾンの営業利益率 {pct(margin('グランメゾン', 0))}\n連結営業利益率 "
         f"{pct(TOT['op'][0] / TOT['rev'][0])}（カンテサンス含む）／{pct(EX['op'][0] / EX['rev'][0])}（除く）"]]
styles = {}
for i in range(1, 4):
    styles[(i, 0)] = dict(bold=True, color=NAVY2, align=PP_ALIGN.LEFT, fill=CARD)
    styles[(i, 1)] = dict(align=PP_ALIGN.LEFT)
    styles[(i, 2)] = dict(align=PP_ALIGN.LEFT, color=COPPER, bold=True)
table(s, 0.40, 1.30, [2.55, 3.55, 3.10], [0.30, 0.95, 0.95, 0.95], rows, size=8, styles=styles)
tb(s, 0.40, 4.62, 9.20, 0.50,
   "数値は組織再編後の連結計画（2026年度予算〜2029年度、年度＝WineBank決算期 10月〜翌9月）。"
   "ワイン・WineTechとレストラン運営の営業利益は経営判断による修正値。",
   size=6.5, color=GREY, space=1.1)

# ═══════════ 2. ②への回答：垂直統合 ═══════════
s = new_slide("② ロールアップではなく、垂直統合",
              "ワイン流通の出口となる名店だけを選んで取得し、成長の主役は既存事業と新規出店")
rows = [["", "一般的なロールアップ", "当社"],
        ["目的", "同業を束ね、評価倍率の差で企業価値を上げる", "ワインの出口とブランドの核を持つ"],
        ["対象", "同業を数多く取得", "星や歴史など、自前でつくれない名店に限る"],
        ["成長の源泉", "買収の積み上げ", "既存事業と新規出店（ティエリーマルクス・WineTech）"],
        ["取得後", "本部集約・コスト削減", "人を入れ替えず、ワインの仕入と経営管理で伸ばす"],
        ["全国展開", "買収で拠点を増やす", "提携・運営支援・外部在庫を活用し、すべてを自社で持たない"]]
styles = {(i, 0): dict(bold=True, color=NAVY2, fill=CARD) for i in range(1, 6)}
for i in range(1, 6):
    styles[(i, 1)] = dict(align=PP_ALIGN.LEFT, color=GREY)
    styles[(i, 2)] = dict(align=PP_ALIGN.LEFT, color=COPPER, bold=True)
table(s, 0.40, 1.30, [0.85, 2.05, 2.55], [0.28] + [0.42] * 5, rows, size=7.8, styles=styles)

# 右：カンテサンスを除いた売上の増加の内訳
tb(s, 6.05, 1.30, 3.55, 0.20, "カンテサンスを除く売上の増加（億円）", size=9, bold=True, color=NAVY2)
inc = [("ブラッスリー（新規出店）", SEGS["ブラッスリー"]["rev"]),
       ("ワイン・WineTech", SEGS["ワイン・WineTech"]["rev"]),
       ("アピシウス", API["rev"]),
       ("レストラン運営", SEGS["レストラン運営"]["rev"])]
rows = [["", "2026年度", "2029年度", "増加"]]
for nm, v in inc:
    rows.append([nm, oku(v[0]), oku(v[3]), "+" + oku(v[3] - v[0])])
rows.append(["合計", oku(EX["rev"][0]), oku(EX["rev"][3]), "+" + oku(EX["rev"][3] - EX["rev"][0])])
styles = {(i, 0): dict(bold=True, color=NAVY2, size=7.3) for i in range(1, 5)}
for i in range(1, 5):
    styles[(i, 3)] = dict(bold=True, color=COPPER)
styles[(5, None)] = dict(fill=NAVY2, color=WHITE, bold=True)
table(s, 6.05, 1.52, [1.55, 0.66, 0.66, 0.68], [0.26] + [0.26] * 5, rows, size=7.8, styles=styles)
tb(s, 6.05, 3.12, 3.55, 0.40,
   f"年率 約{((EX['rev'][3] / EX['rev'][0]) ** (1 / 3) - 1) * 100:.0f}%。カンテサンス以外に新たな買収を織り込まない計画で、"
   "増加はすべて既存事業と新規出店によるもの。", size=7, color=GREY, space=1.15)

callout(s, 0.40, 3.98, 4.50, 0.80, "取得後に伸ばした実績",
        "アピシウスは承継から2年で売上+30%・営業利益2.5倍超。人を入れ替えず、労働環境を整えたうえで伸ばした。")
callout(s, 5.10, 3.98, 4.50, 0.80, "「旬」ではなく構造的な課題",
        "オーナーシェフの高齢化で、名店の承継は今後も続く。カンテサンスも承継の案件。買い手として選ばれる体制が強みになる。")

# ═══════════ 3. ③への回答：事業別の利益率 ═══════════
s = new_slide("③ 飲食の利益率と、上場時の評価の考え方",
              "飲食を一括りにせず、事業ごとの利益構造でご評価いただきたい")
AXIS = {"ワイン・WineTech": "預かり資産・継続収益（管理料2.75%・成功報酬30%）",
        "グランメゾン": "星・歴史による唯一性。カンテサンス約52%、アピシウス約19%",
        "ブラッスリー": "出店数×店舗利益。出店初期のため率は低い",
        "レストラン運営": "安定したキャッシュとワインの消費の場"}
rows = [["セグメント", "2026年度 売上", "営業利益", "利益率", "2029年度 売上", "営業利益", "利益率", "評価の軸"]]
for nm in ("ワイン・WineTech", "グランメゾン", "ブラッスリー", "レストラン運営"):
    sg = SEGS[nm]
    rows.append([nm, oku(sg["rev"][0]), oku(sg["op"][0]), pct(margin(nm, 0)),
                 oku(sg["rev"][3]), oku(sg["op"][3]), pct(margin(nm, 3)), AXIS[nm]])
for lab, t in (("連結（カンテサンス含む）", TOT), ("連結（カンテサンス除く）", EX)):
    rows.append([lab, oku(t["rev"][0]), oku(t["op"][0]), pct(t["op"][0] / t["rev"][0]),
                 oku(t["rev"][3]), oku(t["op"][3]), pct(t["op"][3] / t["rev"][3]), ""])
styles = {(i, 0): dict(bold=True, color=NAVY2, size=7.5) for i in range(1, 5)}
for i in range(1, 5):
    for j in (3, 6):
        styles[(i, j)] = dict(bold=True, color=COPPER)
    styles[(i, 7)] = dict(align=PP_ALIGN.LEFT, size=6.5, color=GREY)
styles[(5, None)] = dict(fill=NAVY2, color=WHITE, bold=True)
styles[(5, 0)] = dict(fill=NAVY2, color=WHITE, bold=True, size=7.2, align=PP_ALIGN.LEFT)
styles[(6, None)] = dict(fill=COPPER, color=WHITE, bold=True)
styles[(6, 0)] = dict(fill=COPPER, color=WHITE, bold=True, size=7.2, align=PP_ALIGN.LEFT)
table(s, 0.40, 1.30, [1.55, 0.78, 0.68, 0.66, 0.78, 0.68, 0.66, 3.41], [0.30] + [0.36] * 6, rows,
      size=8, styles=styles)
tb(s, 0.40, 3.82, 9.20, 0.18, "単位：億円。億円未満を四捨五入。", size=6.5, color=GREY)
callout(s, 0.40, 4.08, 4.50, 0.88, "連結の利益率は一般的な外食より高い",
        f"カンテサンスを含むと{pct(TOT['op'][3] / TOT['rev'][3])}〜{pct(TOT['op'][0] / TOT['rev'][0])}、"
        f"除いても{pct(EX['op'][0] / EX['rev'][0])}〜{pct(EX['op'][3] / EX['rev'][3])}。利益率の低い飲食は運営会社に分け、"
        "数字を見える形にする。")
callout(s, 5.10, 4.08, 4.50, 0.88, "上場時はワインのプラットフォームとして開示",
        "預かり資産・継続収益の比率・ワイン在庫（管理含む32億円）を主要指標にし、外食の倍率で一律に評価されることを避ける。")

# ═══════════ 4. 上場後の時価総額の目安 ═══════════
s = new_slide("上場後の時価総額の目安（当社試算）",
              "グロース市場の上場維持基準（上場5年後に時価総額100億円以上）を見据えて")
rows = [["ケース（2029年度）", "持分按分後\n営業利益", "税引後利益\n（目安）"] + [f"PER {p}倍" for p in PERS]]
for lab, t in (("カンテサンス含む", TOT), ("カンテサンス除く", EX)):
    ni = t["attrib_op"][3] * (1 - TAX)
    rows.append([lab, oku(t["attrib_op"][3]), oku(ni)] + [f"{ni * p / 100:,.0f}億円" for p in PERS])
styles = {(1, None): dict(bold=True), (2, None): dict(bold=True)}
styles[(1, 0)] = dict(fill=NAVY2, color=WHITE, bold=True, align=PP_ALIGN.LEFT)
styles[(2, 0)] = dict(fill=COPPER, color=WHITE, bold=True, align=PP_ALIGN.LEFT)
for i in (1, 2):
    for j, p in enumerate(PERS, 3):
        ni = (TOT if i == 1 else EX)["attrib_op"][3] * (1 - TAX)
        styles[(i, j)] = dict(bold=True, color=COPPER if ni * p >= 10000 else NAVY,
                              fill=BEIGE if ni * p >= 10000 else WHITE, align=PP_ALIGN.CENTER)
table(s, 0.40, 1.35, [2.10, 1.30, 1.30, 1.50, 1.50, 1.50], [0.42, 0.40, 0.40], rows, size=9, styles=styles)
tb(s, 0.40, 2.62, 9.20, 0.40,
   "単位：億円。税引後利益は持分按分後営業利益×（1−実効税率34%）の概算で、支払利息とのれん償却は含まない。"
   "日本基準ではカンテサンス取得ののれん償却が純利益を押し下げるため、実際の水準は表より低くなる。PERは仮置き。"
   "網掛けは100億円以上。",
   size=6.5, color=GREY, space=1.15)
callout(s, 0.40, 3.20, 2.95, 1.00, "読み取れること",
        "100億円には、カンテサンスの取得と、PER20倍前後の評価の両方が要る。カンテサンスを除くと、PER25倍でも届かない。")
callout(s, 3.52, 3.20, 2.95, 1.00, "評価倍率を上げる手段",
        "WineTechの継続収益（管理料・成功報酬・会費・マイル）を積み上げ、外食ではなくプラットフォームの倍率で見てもらう。")
callout(s, 6.64, 3.20, 2.96, 1.00, "時価総額の提示",
        "カンテサンスの有無で時価総額（株価）を分けて提示する。取得の確定を条件に、評価を引き上げる設計とする。")

# ═══════════ 5. 資金調達の考え方 ═══════════
s = new_slide("今回の資金調達の考え方",
              "株式で集める資金は共通基盤と成長投資へ。在庫・店舗・買収は、資金の出し手を分ける")
rows = [["資金の使い道", "調達の方法", "状況"],
        ["共通基盤（ワインマイル・オークション・マーケットプレイスのシステム）、顧客獲得、ワインの供給網、取得後の統合（PMI）体制",
         "本ラウンド（株式）", "条件を協議中"],
        ["カンテサンスの取得", "SPC：投資家出資＋銀行借入（WineBank・アピシウス分を含む）", "基本合意に向けて協議中"],
        ["ブラッスリー（ティエリーマルクス）の出店", "運営会社で外部投資家から個別に調達", "1号店 2027年4月 六本木開業予定"],
        ["ワイン在庫の拡大", "私募ファンド、ワインマイル（会員の資産として預かる）", "私募ファンド3号・4号を2026年9月に組成"]]
styles = {(i, 0): dict(align=PP_ALIGN.LEFT, bold=True, color=NAVY2) for i in range(1, 5)}
for i in range(1, 5):
    styles[(i, 1)] = dict(align=PP_ALIGN.LEFT)
    styles[(i, 2)] = dict(align=PP_ALIGN.LEFT, color=COPPER, bold=True)
styles[(1, None)] = dict(fill=BEIGE)
styles[(1, 0)] = dict(fill=BEIGE, align=PP_ALIGN.LEFT, bold=True, color=NAVY2)
styles[(1, 1)] = dict(fill=BEIGE, align=PP_ALIGN.LEFT, bold=True, color=NAVY2)
styles[(1, 2)] = dict(fill=BEIGE, align=PP_ALIGN.LEFT, bold=True, color=COPPER)
table(s, 0.40, 1.30, [4.30, 3.10, 1.80], [0.30, 0.55, 0.42, 0.42, 0.42], rows, size=8, styles=styles)
callout(s, 0.40, 3.62, 4.50, 1.10, "VC様のご指摘を踏まえた設計",
        "株式の資金を買収や在庫に回さないことで、「ロールアップのための調達」と見られることを避ける。"
        "買収・店舗・在庫は、それぞれの事業の収益で返せる形で個別に調達する。")
callout(s, 5.10, 3.62, 4.50, 1.10, "直近の資本政策",
        "2026年1月に第三者割当増資で1.6億円を調達（プレ・マネー24.4億円）。"
        "本ラウンドの調達額・評価額は、カンテサンスを含む／除くの2ケースで協議したい。")

# ═══════════ 6. 寺田倉庫様とご一緒したいこと ═══════════
s = new_slide("寺田倉庫様とご一緒したいこと（案）",
              "ワインの保管・販売・流通で、株主様との連携を深めたい")
CX = [0.40, 3.52, 6.64]
CWD = 2.96
cards = [("保管", "会員の預かりワイン", "ワインマイルで会員の資産として預かるワインの保管・保険・コンディション管理。"
          "預かり資産は2029年度末に4.0億円を計画"),
         ("販売", "Terrada Wine Market", "出店中のTerrada Wine Marketで、オークションや限定品を展開し、"
          "WineBankの会員と貴社のお客様をつなぐ"),
         ("流通", "オークション・二次流通", "マーケットプレイス・WEBオークションの出品から保管・配送までを、"
          "貴社の倉庫で一体運用できないかご相談したい")]
for x, (lab, val, note) in zip(CX, cards):
    rect(s, x, 1.30, CWD, 1.85, fill=CARD)
    tb(s, x + 0.20, 1.42, CWD - 0.40, 0.22, lab, size=9.5, bold=True, color=COPPER)
    tb(s, x + 0.20, 1.66, CWD - 0.40, 0.40, val, size=14, bold=True, color=NAVY2)
    tb(s, x + 0.20, 2.18, CWD - 0.40, 1.10, note, size=8, color=NAVY, space=1.25)
callout(s, 0.40, 3.40, 9.20, 0.80, "本日ご相談したいこと",
        "① 今回の資金調達へのご参加の可否と、条件についてのご意見　② 上記の保管・販売・流通での取り組みの進め方　"
        "③ VC様のご指摘（ロールアップの見え方・飲食の利益率）について、株主様としてのお考え")

# ───────── 元スライドを削除して保存 ─────────
lst = pr.slides._sldIdLst
for el in list(lst)[:N_ORIG]:
    pr.part.drop_rel(el.get(R + "id"))
    lst.remove(el)
pr.save(OUT)
print("saved", OUT, len(pr.slides))
