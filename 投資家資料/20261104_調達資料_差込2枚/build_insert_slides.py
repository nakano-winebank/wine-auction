# -*- coding: utf-8 -*-
"""会社紹介（投資家様）20261021版に差し込む2枚を、元資料と同じマスターで作る。

  1枚目：WineBank Auction ～実績と今後～（p.55「事業ロードマップ」の直後に差し込む）
  2枚目：まとめ（p.45「未来の施設・体験イメージ」の直後、Appendix の前に差し込む）

数値は ../20261022_VC資本業務提携/model.json と、Drive「オークション施策_全体」の事後MTGシートから取る。

使い方:
  python3 build_insert_slides.py <テンプレートpptx> <model.json> <出力pptx>
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



TOT, EX = M["total"], M["total_ex"]
SEGS = {sg["name"]: sg for sg in M["segments"]}


def card(s, x, y, w, h, head, value, unit, note=None, dark=False):
    rect(s, x, y, w, h, fill=NAVY2 if dark else CARD)
    tb(s, x + 0.15, y + 0.10, w - 0.30, 0.20, head, size=8, bold=True, color=SAND if dark else COPPER)
    tb(s, x + 0.15, y + 0.32, w - 0.30, 0.42,
       [[(value, {"sz": 22, "b": True, "c": WHITE if dark else NAVY2}),
         (" " + unit, {"sz": 8.5, "b": True, "c": SAND if dark else NAVY2})]])
    if note:
        tb(s, x + 0.15, y + h - 0.30, w - 0.30, 0.24, note, size=6.8, color="C9B6A8" if dark else GREY)


# ═══════════ 1. WineBank Auction ～実績と今後～ ═══════════
# 9/12 ローンチイベントの確定値（オークション施策_全体／26914事後MTG・ワイン管理）
AU = dict(lots_plan=134, lots_sold=133, hammer=34_678_000, sales_ex_tax=36_727_155, participants=78, winners=38)
s = new_slide("WineBank Auction ～実績と今後～",
              "9月のリアルオークションで133ロットが落札。10月からWEBで常設化し、会員の売買の場へ")
tb(s, 0.40, 1.22, 4.60, 0.22, "実績：2026年9月12日 リアルオークション（グレイドパーク新宿駅前）",
   size=9, bold=True, color=BLACK)
card(s, 0.40, 1.50, 2.22, 1.12, "落札ロット数", f"{AU['lots_sold']}", "ロット",
     f"出品{AU['lots_plan']}ロット・落札率{AU['lots_sold'] / AU['lots_plan'] * 100:.0f}%", dark=True)
card(s, 2.78, 1.50, 2.22, 1.12, "落札総額（ハンマープライス）", f"{AU['hammer'] / 1e4:,.0f}", "万円",
     "計画比 99.4%")
card(s, 0.40, 2.72, 2.22, 1.12, "売上（手数料込・税抜）", f"{AU['sales_ex_tax'] / 1e4:,.0f}", "万円",
     "参加費収入を除く")
card(s, 2.78, 2.72, 2.22, 1.12, "参加者／落札者", f"{AU['participants']}／{AU['winners']}", "名",
     "1人あたり平均 約3.5ロット")

# 右：今後の展開（事業ロードマップのPhase 3〜4の具体化）
tb(s, 5.25, 1.22, 4.35, 0.22, "今後：WEBで常設化し、二次流通の場へ", size=9, bold=True, color=BLACK)
steps = [("2026年10月〜", "WEBオークション開始", "2週間ごとにテーマを変えて約20ロットずつ出品\n（5大シャトー、シャンパーニュ、村名ブルゴーニュ ほか）"),
         ("随時", "希少ワインのリアル開催", "目玉の希少ワインはライブイベントで出品し、\nWEBへの送客と会員化の入口にする"),
         ("次の段階", "会員の在庫を出品（C2C）", "預かりワイン・マーケットプレイスと連動し、\n会員同士が売買できる場に。海外の買い手にも広げる")]
for k, (when, head, body) in enumerate(steps):
    y = 1.50 + k * 0.78
    rect(s, 5.25, y, 4.35, 0.70, fill=WHITE, line=LINE)
    rect(s, 5.25, y, 0.05, 0.70, fill=COPPER)
    tb(s, 5.40, y + 0.07, 1.05, 0.56, [[(when, {"sz": 7.5, "b": True, "c": COPPER})]], anchor=MSO_ANCHOR.TOP)
    tb(s, 6.45, y + 0.06, 3.05, 0.22, head, size=8.5, bold=True, color=NAVY2)
    tb(s, 6.45, y + 0.28, 3.05, 0.40, body, size=6.8, color=GREY, space=1.1)
rect(s, 0.40, 4.02, 9.20, 0.86, fill=CARD)
rect(s, 0.40, 4.02, 0.05, 0.86, fill=COPPER)
tb(s, 0.57, 4.08, 8.95, 0.76,
   [[("不落がほぼ出ないほど、ファインワインの需要は厚い。", {"sz": 10.5, "b": True, "c": BLACK})],
    [("次の課題は、当日の熱量をWEBの会員化と継続的な売買につなげること。ワインマイル（落札でもマイルが貯まる）と"
      "マーケットプレイスをつなぎ、出品・保管・配送までを一体で回すことで、オークションを二次流通の常設インフラにする。",
      {"sz": 7.8, "c": NAVY})]], space=1.2)
s.notes_slide.notes_text_frame.text = (
    "差し込み位置：p.55「事業ロードマップ」の直後。p.55のPhase 2（9/12開催予定）・Phase 3（9月以降WEB開始）の結果報告として使う。"
    "数値の出所：Drive「オークション施策_全体」の26914事後MTG（133ロット・計画比99.4%）とワイン管理シート（売上3,673万円）。"
    "シート13の確認済み合計は131ロット・3,447.8万円のため、確定値に合わせて要確認。")

# ═══════════ 2. まとめ ═══════════
s = new_slide("まとめ ～WineBankが目指す姿～",
              "ワインの川上から川下まで、オンラインとオフラインをひとつの経済圏に")
# 上段：バリューチェーン
chain = [("仕入", "インポーター・\nワイン在庫32億円"), ("体験", "グランメゾン・\nブラッスリー"),
         ("流通", "オークション・\nマーケットプレイス"), ("会員", "ワインマイル・\nWineBank CLUB")]
for k, (head, body) in enumerate(chain):
    x = 0.40 + k * 2.36
    b = rect(s, x, 1.25, 2.00, 0.66, fill=NAVY2)
    boxtext(b, [[(head, {"sz": 10, "b": True, "c": SAND})], [(body, {"sz": 7, "c": WHITE})]], space=1.05)
    if k < 3:
        tb(s, x + 2.00, 1.40, 0.36, 0.36, "▶", size=12, color=COPPER, align=PP_ALIGN.CENTER,
           anchor=MSO_ANCHOR.MIDDLE)
tb(s, 0.40, 1.96, 9.20, 0.20, "飲食の場でワインが開き、会員の売買とマイルが次の一本につながる。一社でこの循環を持つことが、他にない強み。",
   size=7.5, color=GREY, align=PP_ALIGN.CENTER)

# 中段：3つの柱（①一気通貫・②選んだ名店と自前の成長・③利益の質）
cols = [
    ("一気通貫の経済圏",
     [("ワイン・WineTechの営業利益", f"{oku(SEGS['ワイン・WineTech']['op'][0])}→{oku(SEGS['ワイン・WineTech']['op'][3])}", "億円")],
     "管理料・成功報酬・会費・マイルという、預かり資産に連動する継続収益を積み上げる。"),
    ("名店は「数」ではなく「核」",
     [("カンテサンスを除く売上", f"{oku(EX['rev'][0], 0)}→{oku(EX['rev'][3], 0)}", "億円")],
     "名店の取得は自前でつくれないブランドに限る。成長の主役は出店とWineTech。アピシウスは承継2年で営業利益2.5倍超。"),
    ("利益の質と資産の裏付け",
     [("連結営業利益（カンテサンス含む）", f"{oku(TOT['op'][0])}→{oku(TOT['op'][3])}", "億円")],
     f"カンテサンスを除いても{oku(EX['op'][0])}→{oku(EX['op'][3])}億円。ワイン在庫（管理含む32億円）が企業価値を下支えする。"),
]
for k, (head, kpis, body) in enumerate(cols):
    x = 0.40 + k * 3.10
    rect(s, x, 2.28, 2.96, 1.82, fill=CARD)
    tb(s, x + 0.18, 2.36, 2.60, 0.24, head, size=10, bold=True, color=NAVY2)
    for lab, val, unit in kpis:
        tb(s, x + 0.18, 2.66, 2.60, 0.18, lab, size=7, color=GREY)
        tb(s, x + 0.18, 2.84, 2.60, 0.40,
           [[(val, {"sz": 20, "b": True, "c": COPPER}), (" " + unit, {"sz": 8.5, "b": True, "c": NAVY2})]])
    tb(s, x + 0.18, 3.32, 2.60, 0.74, body, size=7.3, color=NAVY, space=1.2)
tb(s, 0.40, 4.12, 9.20, 0.18, "2026年度（予算）→2029年度。年度＝WineBank決算期（10月〜翌9月）。組織再編後の連結計画。",
   size=6.3, color=GREY)

# 下段：結び
rect(s, 0.40, 4.36, 9.20, 0.72, fill=NAVY2)
tb(s, 0.60, 4.43, 8.80, 0.60,
   [[("『高級ワインといえばWineBank』を、資産と体験の両面から。", {"sz": 13, "b": True, "c": WHITE})],
    [(f"連結売上 {oku(TOT['rev'][0], 0)}億円（2026年度予算）→ {oku(TOT['rev'][3], 0)}億円（2029年度）。"
      "上場を見据え、事業ごとの利益と継続収益を開示できる体制を整える。", {"sz": 8, "c": SAND})]],
   align=PP_ALIGN.CENTER, space=1.25)
s.notes_slide.notes_text_frame.text = (
    "差し込み位置：p.45「未来の施設・体験イメージ」の直後、Appendix（p.46）の前。本編の締めとして使う。"
    "3つの柱は、VC面談での論点（①一気通貫の評価、②ロールアップの見え方、③飲食の利益率と上場時評価）に、"
    "回答と見えない形で応える構成。")

# ───────── 元スライドを削除して保存 ─────────
lst = pr.slides._sldIdLst
for el in list(lst)[:N_ORIG]:
    pr.part.drop_rel(el.get(R + "id"))
    lst.remove(el)
pr.save(OUT)
print("saved", OUT, len(pr.slides))
