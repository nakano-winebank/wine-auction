# 投資家ピッチ p.41 差し込み用：「カンテサンスとは」1枚（店内写真・グランメゾン東京・過去5年の売上と営業利益）
# 会社紹介資料の差し替えスライド（シンプル版）を雛形に、同じタイトル・帯・フッターの体裁で作る。
# 使い方: python3 build_pitch_p41_quintessence.py <雛形.pptx> <店内写真.jpg> <グランメゾン東京.jpg> <出力.pptx>
import sys, copy
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.chart.data import CategoryChartData
from pptx.enum.chart import XL_CHART_TYPE, XL_LEGEND_POSITION, XL_LABEL_POSITION
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

TPL, IMG_ROOM, IMG_GM, OUT = sys.argv[1:5]
NAVY = RGBColor(0x36, 0x39, 0x4B); COPPER = RGBColor(0xC6, 0x8A, 0x65); GRAY = RGBColor(0x59, 0x59, 0x59)
LIGHT = RGBColor(0xF4, 0xF1, 0xEE); LINE = RGBColor(0xE3, 0xE3, 0xE3); BLACK = RGBColor(0, 0, 0); WHITE = RGBColor(0xFF, 0xFF, 0xFF)
FONT = "Meiryo"

prs = Presentation(TPL)
# 雛形の2枚目（タイトル＋帯＋フッターの体裁）だけを残す
keep = 1
sldIdLst = prs.slides._sldIdLst
ids = list(sldIdLst)
for i, sid in enumerate(ids):
    if i != keep:
        prs.part.drop_rel(sid.rId); sldIdLst.remove(sid)
s = prs.slides[0]
title = band = None
for sh in list(s.shapes):
    if sh.has_text_frame and sh.text_frame.text.startswith("カンテサンス取得のスキーム"): title = sh; continue
    if sh.has_text_frame and sh.text_frame.text.startswith("2026年12月末に株式100%"): band = sh; continue
    if sh.name in ("Rectangle 1",) or (sh.has_text_frame and sh.text_frame.text == "CONFIDENTIAL") or sh.is_placeholder: continue
    sh._element.getparent().remove(sh._element)

def set_text(shape, text):
    p = shape.text_frame.paragraphs[0]; r = p.runs[0]; r.text = text
    for extra in p.runs[1:]: extra._r.getparent().remove(extra._r)
    for extra in shape.text_frame.paragraphs[1:]: extra._p.getparent().remove(extra._p)
set_text(title, "カンテサンスとは：19年連続ミシュラン三つ星のグランメゾン")
set_text(band, "19年以上連続の三つ星は日本に3店・世界に23店だけ。ブランドは成長を続け、5年で売上1.4倍・営業利益1.6倍に")

def tb(x, y, w, h, runs, size=8, align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP, spacing=None):
    box = s.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h)); tf = box.text_frame
    tf.word_wrap = True; tf.margin_left = tf.margin_right = Inches(0.02); tf.margin_top = tf.margin_bottom = Inches(0.01)
    tf.vertical_anchor = anchor
    first = True
    for para in runs:
        p = tf.paragraphs[0] if first else tf.add_paragraph(); first = False
        p.alignment = align
        if spacing: p.space_after = Pt(spacing)
        for text, opt in para:
            r = p.add_run(); r.text = text; f = r.font; f.name = FONT
            f.size = Pt(opt.get("size", size)); f.bold = opt.get("bold", False); f.color.rgb = opt.get("color", BLACK)
    return box

def rect(x, y, w, h, fill, line=None):
    r = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(x), Inches(y), Inches(w), Inches(h))
    r.fill.solid(); r.fill.fore_color.rgb = fill
    if line: r.line.color.rgb = line; r.line.width = Pt(0.5)
    else: r.line.fill.background()
    r.shadow.inherit = False
    return r

def head(x, y, w, text):
    tb(x, y, w, 0.2, [[(text, {"bold": True, "color": NAVY, "size": 9})]])

# ---------- 左：写真2枚 ----------
LX, LW = 0.4, 2.78
head(LX, 1.2, LW, "店内（北品川・御殿山）")
def pic(path, x, y, w, h, nat_ratio, top_share=0.5):
    """幅wに合わせ、高さhに収まるよう上下を切り取って配置（nat_ratio＝元画像の高さ÷幅）"""
    p = s.shapes.add_picture(path, Inches(x), Inches(y), Inches(w), Inches(h))
    cut = max(0.0, 1 - h / (w * nat_ratio))
    p.crop_top = cut * top_share; p.crop_bottom = cut * (1 - top_share)
    return p
h_room = 1.6
pic(IMG_ROOM, LX, 1.42, LW, h_room, 428 / 640)
y_gm = 1.42 + h_room + 0.08
head(LX, y_gm, LW, "ドラマ「グランメゾン東京」料理監修")
h_gm = 1.45
pic(IMG_GM, LX, y_gm + 0.22, LW, h_gm, 407 / 710, top_share=0.0)
tb(LX, y_gm + 0.22 + h_gm + 0.02, LW, 0.18, [[("TBS日曜劇場（2019年）。最終回で岸田シェフも出演。画像：IM（出所 TBSスパークル）", {"size": 5.5, "color": GRAY})]])

# ---------- 中央：過去5年の売上・営業利益 ----------
CX, CW = 3.4, 3.3
head(CX, 1.2, CW, "売上高と営業利益の推移（億円・12月決算）")
cd = CategoryChartData()
cd.categories = ["2021", "2022", "2023", "2024", "2025", "2026\n見込"]
SALES = [7.03, 7.65, 8.32, 8.91, 9.76, 10.29]; OP = [3.16, 3.48, 3.93, 4.43, 5.05, 5.19]
cd.add_series("売上高", SALES); cd.add_series("営業利益", OP)
gf = s.shapes.add_chart(XL_CHART_TYPE.COLUMN_CLUSTERED, Inches(CX), Inches(1.4), Inches(CW), Inches(2.25), cd)
ch = gf.chart
ch.has_legend = True; ch.legend.position = XL_LEGEND_POSITION.TOP; ch.legend.include_in_layout = False
ch.legend.font.size = Pt(7); ch.legend.font.name = FONT
ch.font.name = FONT; ch.font.size = Pt(7)
va = ch.value_axis; va.visible = False; va.has_major_gridlines = False; va.maximum_scale = 12; va.minimum_scale = 0
ca = ch.category_axis; ca.tick_labels.font.size = Pt(7); ca.format.line.color.rgb = LINE; ca.has_major_gridlines = False
plot = ch.plots[0]; plot.gap_width = 60; plot.overlap = -10
for ser, color in zip(plot.series, (NAVY, COPPER)):
    ser.format.fill.solid(); ser.format.fill.fore_color.rgb = color
    ser.data_labels.show_value = True; ser.data_labels.number_format = '0.0'; ser.data_labels.number_format_is_linked = False
    ser.data_labels.font.size = Pt(6.5); ser.data_labels.font.name = FONT; ser.data_labels.position = XL_LABEL_POSITION.OUTSIDE_END
    # 2026年（見込み）は薄く
    pt = ser.points[5]; pt.format.fill.solid()
    pt.format.fill.fore_color.rgb = RGBColor(0xA9, 0xAB, 0xB8) if color == NAVY else RGBColor(0xE6, 0xC9, 0xB7)

# 伸び率のボックス
by = 3.72
for i, (lab, big, sub) in enumerate([("売上高（2021→2025年）", "1.4倍", "7.0→9.8億円・年率+8.6%"),
                                       ("営業利益（2021→2025年）", "1.6倍", "3.2→5.1億円・年率+12.4%")]):
    bx = CX + i * (CW / 2 + 0.03); bw = CW / 2 - 0.03
    rect(bx, by, bw, 0.72, LIGHT)
    tb(bx + 0.05, by + 0.04, bw - 0.1, 0.66, [[(lab, {"size": 6.5, "color": GRAY})],
                                             [(big, {"size": 15, "bold": True, "color": COPPER if i else NAVY})],
                                             [(sub, {"size": 6.5, "color": BLACK})]], align=PP_ALIGN.CENTER)
tb(CX, 4.5, CW, 0.62, [[("営業利益率 52%（2025年）。営業利益は、岸田シェフの役員報酬・賞与（2025年 約0.96億円）を差し引いた後の数字。"
                         "2021〜2025年は試算表の実績、2026年は1〜9月の実績＋10〜12月の見込み。満席が続くなか、コース単価の改定で伸びている。", {"size": 6, "color": GRAY})]])

# ---------- 右：すごさのポイント ----------
RX, RW = 6.9, 2.7
head(RX, 1.2, RW, "唯一無二である理由")
facts = [("ミシュラン三つ星 19年連続", "東京版の初版（2007年発表）から毎年。開業翌年の獲得は当時の現役最年少。19年以上連続は日本3店・世界23店のみ"),
         ("世界に届いたブランド", "「グランメゾン東京」はNetflixで190以上の国と地域に配信。放映後、海外からの予約・問い合わせが増加"),
         ("三つ星の登竜門", "出身者のミシュラン獲得は12名以上。年間約1.4万人が来店し、常に満席"),
         ("受賞・監修", "ASIA'S 50 BEST 16位（2013年）、ゴ・エ・ミヨ「今年のシェフ賞」（2020年）、JAL国際線ファーストクラスの機内食監修")]
fy = 1.42; fh = 0.88
for k, (h1, body) in enumerate(facts):
    y = fy + k * (fh + 0.05)
    rect(RX, y, RW, fh, WHITE, LINE); rect(RX, y, 0.05, fh, COPPER)
    tb(RX + 0.12, y + 0.05, RW - 0.17, fh - 0.08, [[(h1, {"size": 9, "bold": True, "color": NAVY})], [(body, {"size": 7.3, "color": BLACK})]], spacing=3)

tb(0.4, 5.12, 6.3, 0.14, [[("出所：同社試算表（第11〜16期）、IM（2026年9月）、ミシュランガイド公式HP。写真はIMより。", {"size": 5.5, "color": GRAY})]])

# ノート
s.notes_slide.notes_text_frame.text = ("差し込み位置：p.41（「カンテサンス取得のスキームと資金計画」の前）。"
                                       "売上・営業利益は試算表の当期残高（2021年7.03億/3.16億、2022年7.65/3.48、2023年8.32/3.93、2024年8.91/4.43、2025年9.76/5.05）。"
                                       "2026年見込は5か年計画（1〜9月実績＋10〜12月見込）の10.29/5.19。")
prs.save(OUT); print("saved", OUT)
