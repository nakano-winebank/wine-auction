# 榊原様向け（前回の宿題）：資本構成・資金調達の図とCF計画（4枚）
# 会社紹介資料の差し替えスライドを雛形に、同じタイトル・帯・フッターで作る。数字はCF計画（2026/11/19版、退職慰労金込み）。
# 使い方: python3 build_investor_pack_sakakibara.py <雛形.pptx> <出力.pptx>
import sys, copy
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

TPL, OUT = sys.argv[1:3]
NAVY = RGBColor(0x36, 0x39, 0x4B); COPPER = RGBColor(0xC6, 0x8A, 0x65); GRAY = RGBColor(0x59, 0x59, 0x59)
LIGHT = RGBColor(0xF4, 0xF1, 0xEE); LINE = RGBColor(0xD9, 0xD9, 0xD9); BLACK = RGBColor(0, 0, 0); WHITE = RGBColor(0xFF, 0xFF, 0xFF)
TINT = RGBColor(0xEC, 0xED, 0xF2); FONT = "Meiryo"

prs = Presentation(TPL)
lst = prs.slides._sldIdLst
ORIG = list(lst)
base = prs.slides[1]
KEEP = []
for sh in list(base.shapes):
    t = sh.text_frame.text if sh.has_text_frame else ""
    if t.startswith("カンテサンス取得のスキーム"): KEEP.append(("title", sh)); continue
    if t.startswith("2026年12月末に株式100%"): KEEP.append(("band", sh)); continue
    if sh.name == "Rectangle 1" or t == "CONFIDENTIAL" or sh.is_placeholder: KEEP.append(("fix", sh)); continue
    sh._element.getparent().remove(sh._element)
TEMPLATE = [(k, copy.deepcopy(sh._element)) for k, sh in KEEP]

def set_text(shape, text):
    p = shape.text_frame.paragraphs[0]; p.runs[0].text = text
    for r in p.runs[1:]: r._r.getparent().remove(r._r)
    for x in shape.text_frame.paragraphs[1:]: x._p.getparent().remove(x._p)

def new_slide(title, band, first=False):
    if first: s = base
    else:
        s = prs.slides.add_slide(base.slide_layout)
        for ph in list(s.placeholders): ph._element.getparent().remove(ph._element)
        for _, el in TEMPLATE: s.shapes._spTree.append(copy.deepcopy(el))
    for sh in s.shapes:
        t = sh.text_frame.text if sh.has_text_frame else ""
        if t.startswith("カンテサンス取得のスキーム") or getattr(sh, "_is_title", False): set_text(sh, title)
        elif t.startswith("2026年12月末に株式100%"): set_text(sh, band)
    return s

def tb(s, x, y, w, h, paras, size=8, align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP, after=0):
    box = s.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h)); tf = box.text_frame
    tf.word_wrap = True; tf.vertical_anchor = anchor
    tf.margin_left = tf.margin_right = Inches(0.03); tf.margin_top = tf.margin_bottom = Inches(0.02)
    for i, para in enumerate(paras):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph(); p.alignment = align
        if after: p.space_after = Pt(after)
        for text, o in para:
            r = p.add_run(); r.text = text; f = r.font; f.name = FONT
            f.size = Pt(o.get("size", size)); f.bold = o.get("bold", False); f.color.rgb = o.get("color", BLACK)
    return box

def rect(s, x, y, w, h, fill, line=None, shape=MSO_SHAPE.RECTANGLE):
    r = s.shapes.add_shape(shape, Inches(x), Inches(y), Inches(w), Inches(h))
    r.fill.solid(); r.fill.fore_color.rgb = fill
    if line: r.line.color.rgb = line; r.line.width = Pt(0.75)
    else: r.line.fill.background()
    r.shadow.inherit = False
    return r

def head(s, x, y, w, text): tb(s, x, y, w, 0.22, [[(text, {"bold": True, "color": NAVY, "size": 9})]])

def table(s, x, y, w, rows, colw, rowh=0.22, size=7.5, head_fill=NAVY, bold_rows=(), shade_rows=(), first_left=True):
    nr, nc = len(rows), len(rows[0])
    gt = s.shapes.add_table(nr, nc, Inches(x), Inches(y), Inches(w), Inches(rowh * nr)).table
    for j, cw in enumerate(colw): gt.columns[j].width = Inches(cw)
    for i in range(nr):
        gt.rows[i].height = Inches(rowh)
        for j in range(nc):
            c = gt.cell(i, j); c.margin_left = c.margin_right = Inches(0.04); c.margin_top = c.margin_bottom = Inches(0.01)
            c.vertical_anchor = MSO_ANCHOR.MIDDLE
            tf = c.text_frame; tf.word_wrap = True; p = tf.paragraphs[0]
            p.alignment = PP_ALIGN.LEFT if (j == 0 and first_left) else PP_ALIGN.CENTER
            r = p.add_run(); r.text = str(rows[i][j]); f = r.font; f.name = FONT; f.size = Pt(size)
            c.fill.solid()
            if i == 0: c.fill.fore_color.rgb = head_fill; f.color.rgb = WHITE; f.bold = True
            else:
                c.fill.fore_color.rgb = TINT if i in shade_rows else WHITE
                f.color.rgb = BLACK; f.bold = i in bold_rows
    return gt

# ================= 1. 資金調達の流れ =================
s = new_slide("資本構成・資金調達の図（1）資金の流れ", "12月の決済はみずほ銀行のLBOローンと対象会社の現預金、3月末の残金は投資家の皆様のご出資で支払います", first=True)
steps = [
 ("① 2026年12月", "決済・株式100%を取得", [("譲渡代金 35億円", True), ("みずほ銀行のLBOローン 15億円", False), ("（借入人：SPC）", False), ("対象会社の現預金 約15億円", False), ("（決済日に対象会社からSPCへ貸付）", False), ("岸田様への役員貸付金 5億円", False), ("（譲渡代金と相殺）", False)]),
 ("② 2027年3月末", "残金のお支払い", [("残金 15億円", True), ("投資家の皆様のご出資 15億円", False), ("【A】SPCへの直接出資", False), ("【B】WineBank経由（増資）", False), ("12月末のネットキャッシュとの差額は、", False), ("ここで増減とも精算", False)]),
 ("③ 2027年中", "SPCと対象会社が合併", [("対象会社が存続会社", True), ("店舗の賃貸借契約を維持するため", False), ("決済日の貸付は合併で相殺", False), ("借入の返済・投資家への年3%は", False), ("合併後の会社の事業CFから", False)]),
 ("④ 2029年12月", "追加対価・退職慰労金", [("合計 7.1億円", True), ("追加対価 5億円（無条件）", False), ("退職慰労金 2.1億円（会社負担）", False), ("みずほ銀行から同額を追加借入", False), ("2031年まで利息のみ、2032年から返済", False)]),
]
X0, W, GAP, Y = 0.4, 2.12, 0.24, 1.3
for k, (when, what, lines) in enumerate(steps):
    x = X0 + k * (W + GAP)
    rect(s, x, Y, W, 0.5, NAVY if k != 1 else COPPER)
    tb(s, x, Y + 0.03, W, 0.46, [[(when, {"bold": True, "color": WHITE, "size": 9.5})], [(what, {"color": WHITE, "size": 8})]], align=PP_ALIGN.CENTER)
    rect(s, x, Y + 0.5, W, 1.85, WHITE, LINE)
    tb(s, x + 0.06, Y + 0.58, W - 0.12, 1.75, [[(t, {"bold": b, "size": 8.5 if b else 7.5, "color": NAVY if b else BLACK})] for t, b in lines], after=1)
    if k < 3:
        a = s.shapes.add_shape(MSO_SHAPE.RIGHT_ARROW, Inches(x + W + 0.03), Inches(Y + 1.2), Inches(GAP - 0.06), Inches(0.28))
        a.fill.solid(); a.fill.fore_color.rgb = COPPER; a.line.fill.background(); a.shadow.inherit = False
head(s, 0.4, 3.78, 4.6, "決済に使う対象会社の資金（2026年12月末の見込み）")
table(s, 0.4, 4.0, 4.6, [["項目", "金額"], ["現預金（12月末見込み）", "17.4億円"], ["＋ 役員貸付金（譲渡代金と相殺）", "5.0億円"],
                          ["＋ 子会社の現預金", "0.4億円"], ["− 運転資金・2026年分の法人税として残す額", "▲2.1億円"], ["決済に使える額（うち20.0億円を充当）", "20.7億円"]],
      [3.0, 1.6], rowh=0.18, size=7, bold_rows=(5,), shade_rows=(5,))
tb(s, 5.2, 3.78, 4.4, 1.3, [[("ポイント", {"bold": True, "color": NAVY, "size": 9})],
    [("・投資家の皆様のご出資は、残金15億円のお支払いにのみ充てます。", {"size": 7.5})],
    [("・12月の決済と3月末の残金の間は、株式100%をSPCが保有し、みずほ銀行の融資で取得した状態です。", {"size": 7.5})],
    [("・対象会社の現預金の充当方法（貸付・合併）は、銀行・税理士と協議のうえ最終契約までに確定します。", {"size": 7.5})],
    [("・2027年期首の会社の手元資金は約2.8億円（運転資金1.0億円、2026年分の法人税1.1億円を含む）。", {"size": 7.5})]], after=2)

# ================= 2. 資本構成 =================
s = new_slide("資本構成・資金調達の図（2）株主と借入", "議決権はWineBank 51%・投資家の皆様49%（普通株式）。売却代金は残債の返済後、持株比率どおりに分配")
head(s, 0.4, 1.2, 4.5, "株主構成（合併後の会社）")
table(s, 0.4, 1.42, 4.5, [["株主", "株式", "議決権", "出資・役割"],
                          ["WineBank", "普通株式", "51%", "LBOローンの連帯保証（協議中）・案件の組成・運営（AM）"],
                          ["投資家の皆様", "普通株式", "49%", "出資15億円（3億円・5億円の区分）"]],
      [0.95, 0.7, 0.55, 2.3], rowh=0.36, size=7.5)
tb(s, 0.4, 2.55, 4.5, 0.9, [[("【B】WineBank経由を選ばれた場合", {"bold": True, "color": COPPER, "size": 8})],
    [("その分はWineBankが同じ条件で49%の持分を取得します。WineBankの増資額の8割をカンテサンスの持分取得に充てるため、"
      "WineBankの持分は51%から、増資5億円で約64%、10億円で約77%に上がります。", {"size": 7.5})]])
head(s, 0.4, 3.45, 4.5, "分配のルール")
tb(s, 0.4, 3.67, 4.5, 1.4, [
    [("毎年：", {"bold": True, "size": 7.5}), ("出資額の3%（顧問契約。銀行との契約で払えない年は翌年以降に繰越）", {"size": 7.5})],
    [("売却時：", {"bold": True, "size": 7.5}), ("売却代金から銀行の残債を返済した後、持株比率どおり（49%／51%）に分配。元本の優先返還はありません。", {"size": 7.5})],
    [("成果報酬：", {"bold": True, "size": 7.5}), ("投資家様の受取りが出資額を上回る部分にのみ30%（経営担当15%・WineBank 15%）。", {"size": 7.5})],
    [("5億円の方：", {"bold": True, "size": 7.5}), ("売却先が決まらない場合、5年後にWineBankが純資産ベースで買取（出資額＋純資産の増加×持分×70%）。", {"size": 7.5})]], after=3)
head(s, 5.2, 1.2, 4.4, "借入（みずほ銀行）")
table(s, 5.2, 1.42, 4.4, [["", "LBOローン", "追加借入"], ["金額", "15億円", "7.1億円"], ["実行", "2026年12月（決済日）", "2029年12月"],
                          ["返済", "5年・元金均等（年3億円）", "2031年まで利息のみ、2032年から5年"], ["金利", "4%（想定）", "4%（想定）"],
                          ["使い道", "株式の取得代金", "追加対価5億円・退職慰労金2.1億円"], ["借入人・保証", "SPC（合併後の会社）・WineBankの連帯保証（協議中）", "同左"]],
      [0.85, 1.85, 1.7], rowh=0.25, size=7)
head(s, 5.2, 3.3, 4.4, "借入残高（年末・億円）")
table(s, 5.2, 3.52, 4.4, [["", "2027", "2028", "2029", "2030", "2031"], ["LBOローン", "12.0", "9.0", "6.0", "3.0", "0"],
                          ["追加借入", "0", "0", "7.1", "7.1", "7.1"], ["合計", "12.0", "9.0", "13.1", "10.1", "7.1"]],
      [1.15, 0.65, 0.65, 0.65, 0.65, 0.65], rowh=0.22, size=7.5, bold_rows=(3,), shade_rows=(3,))
tb(s, 5.2, 4.5, 4.4, 0.5, [[("担保・財務制限条項（DSCRの下限・配当制限など）は、みずほ銀行と協議中です。条件が固まり次第ご報告します。", {"size": 7, "color": GRAY})]])

# ================= 3. CF計画 =================
s = new_slide("CF計画（2027〜2031年）合併後の会社", "既存計画のみでも借入を返しながら現金はマイナスにならず、新規事業込みでは2031年末に3.9億円の現金が残ります")
yrs = ["2027", "2028", "2029", "2030", "2031"]
A = {"営業利益": [5.56, 5.76, 5.98, 6.23, 6.50], "当期純利益": [2.79, 2.90, 1.74, 3.18, 3.43], "期末の現金": [1.19, 0.79, 1.33, 1.21, 1.35],
     "DSCR（倍）": [0.86, 0.88, 1.16, 0.97, 1.04], "純資産の増加（累計）": [2.79, 5.69, 7.43, 10.61, 14.05]}
Bn = {"営業利益": [5.59, 6.53, 7.45, 8.30, 9.10], "当期純利益": [2.81, 3.40, 2.71, 4.54, 5.14], "期末の現金": [1.21, 0.81, 1.82, 2.56, 3.90],
      "DSCR（倍）": [0.86, 0.89, 1.30, 1.21, 1.39], "純資産の増加（累計）": [2.81, 6.21, 8.92, 13.46, 18.60]}
for k, (lab, d) in enumerate([("【A】既存計画のみ（本店1店舗・売主の事業計画どおり）", A), ("【B】新規事業込み（Aに新規事業3つを追加）", Bn)]):
    x = 0.4 + k * 4.7
    head(s, x, 1.2, 4.5, lab)
    rows = [["億円"] + yrs] + [[key] + [f"{v:.2f}" for v in vals] for key, vals in d.items()]
    table(s, x, 1.44, 4.5, rows, [1.45, 0.61, 0.61, 0.61, 0.61, 0.61], rowh=0.22, size=7.5, bold_rows=(3,), shade_rows=(3,))
head(s, 0.4, 2.95, 4.5, "新規事業の前提（Bのみ）")
table(s, 0.4, 3.17, 4.5, [["事業", "内容", "2031年 売上／営業利益"], ["ガトー・オ・コンテの拡大", "2027年11月から2026年比2倍、2028年11月から3倍（投資なし）", "1.3億／0.4億"],
                          ["一品スイーツ店", "2028年1月から毎年1店舗（1店舗の投資5,000万円、月商1,500万円）", "7.2億／2.2億"],
                          ["ワインショップ・バー", "2030年1月から（月商700万円、投資なし）", "0.8億／0.1億"]],
      [1.25, 2.25, 1.0], rowh=0.3, size=7)
tb(s, 5.1, 2.95, 4.5, 2.1, [[("数字の見方", {"bold": True, "color": NAVY, "size": 9})],
    [("・当期純利益は、金利、投資家の皆様への年3%、AM報酬（年1%）、特典の費用、後継の料理長の人件費、経営担当の報酬、法人税を差し引いた後。", {"size": 7})],
    [("・2029年は退職慰労金2.1億円を費用に計上（追加借入でまかなう）。損金になる分、税負担が軽くなりDSCRが一時的に上がります。", {"size": 7})],
    [("・Aは2027・2028・2030年にDSCRが1.0倍を下回り、手元資金を取り崩しながら年3億円を返済します。Bは2029年以降1.0倍を上回ります。", {"size": 7})],
    [("・岸田シェフの退任後に役員報酬（年約1億円）がなくなる効果は、保守的に見込んでいません。", {"size": 7})],
    [("・DSCR＝返済前のCF÷元利返済額。純資産の増加は決済直後からの当期純利益の累計（のれん償却前）。", {"size": 7, "color": GRAY})]], after=2)

# ================= 4. 下振れと投資家の受取り =================
s = new_slide("下振れした場合の試算と、投資家の皆様の受取り", "本店の営業利益が下振れしても、資金不足は追加借入と役員報酬の削減で手当てします。受取りは1名様あたり・5年間の合計")
head(s, 0.4, 1.2, 4.5, "本店の営業利益が下振れした場合（Bは新規事業の利益を上乗せ）")
table(s, 0.4, 1.42, 4.5, [["ケース", "5年後の現金 A／B", "最低DSCR A／B"], ["計画どおり", "1.35／3.90億", "0.86／0.86倍"],
                          ["横ばい（年5.2億円のまま）", "▲1.27／1.28億", "0.78／0.78倍"], ["計画比3割減", "▲4.50／▲1.95億", "0.56／0.56倍"],
                          ["計画比5割減", "▲8.51／▲5.85億", "0.35／0.35倍"]], [1.8, 1.35, 1.35], rowh=0.25, size=7.5)
tb(s, 0.4, 2.75, 4.5, 1.2, [[("現金のマイナスは資金不足額です。手当ての方法：", {"size": 7.5})],
    [("・銀行返済分の追加借入", {"size": 7.5})], [("・岸田シェフの退任後の役員報酬（年約1億円、2030〜31年で約1.9億円）の削減", {"size": 7.5})],
    [("三つ星を維持し、岸田シェフが厨房に立つ3年間に、営業利益が急に3割以上落ちる可能性は低いと考えています。", {"size": 7.5})]], after=2)
head(s, 5.1, 1.2, 4.5, "投資家の皆様の受取り（計画どおりの場合・5年間）")
table(s, 5.1, 1.42, 4.5, [["出資額・出口", "【A】既存計画のみ", "【B】新規事業込み"],
                          ["5億円・第三者に売却", "約6.2億（IRR 4.6%）", "約8.5億（IRR 11.6%）"],
                          ["5億円・WineBankが買取", "約7.6億（IRR 9.2%）", "約8.2億（IRR 10.8%）"],
                          ["3億円・第三者に売却", "約3.6億（IRR 4.0%）", "約4.9億（IRR 10.7%）"],
                          ["3億円・純資産ベース（参考）", "約4.4億（IRR 8.4%）", "約4.7億（IRR 10.0%）"]],
      [1.5, 1.5, 1.5], rowh=0.25, size=7.5, shade_rows=(2,))
tb(s, 5.1, 2.75, 4.5, 2.3, [
    [("売却価格の想定（2031年末）：", {"bold": True, "size": 7.5}), ("売却時のEBITDA×取得時と同じ倍率（6.16倍）＋現金−借入残高。A 約33.0億円、B 約51.6億円。", {"size": 7.5})],
    [("第三者に売却：", {"bold": True, "size": 7.5}), ("売却価格×49%×（出資額÷15億円）。出資額を上回る部分から成果報酬30%を控除。", {"size": 7.5})],
    [("WineBankが買取：", {"bold": True, "size": 7.5}), ("出資額＋純資産の増加×49%×（出資額÷15億円）×70%。5億円の方の買取額はA 6.61億円、B 7.13億円。", {"size": 7.5})],
    [("受取りに含むもの：", {"bold": True, "size": 7.5}), ("年3%、元本相当、売却・買取時の受取り。5億円の方は運営収益の分配（AM報酬・成果報酬のWineBank分の10%）を含む。", {"size": 7.5})],
    [("第三者への売却価格は仮定です。実際の売却価格で精算します。", {"size": 7, "color": GRAY})]], after=3)

for i, sid in enumerate(ORIG):  # 雛形の他のスライドを最後に削除（部品名の重複を避けるため）
    if i != 1: prs.part.drop_rel(sid.rId); lst.remove(sid)
prs.save(OUT); print("saved", OUT)
