# -*- coding: utf-8 -*-
"""宇佐美さん向け：Brasserie Thierry Marx 取締役就任とインセンティブのご相談資料（docx → PDF）。
アピシウスと同条件（月額50万円＋利益の10%）でWineBank直営のBTMに就任いただく場合の試算。
数値は 事業収支統合モデル v8（20261109）の単店PLを基準に、運営受託の報酬案と感応度を計算する。
"""
import os
from docx import Document
from docx.shared import Pt, RGBColor, Mm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "BTM_取締役就任_ご相談資料_宇佐美様_20261126.docx")
JP = "游ゴシック"

# ───────── 数値（百万円） ─────────
YRS = ["1年目", "2年目", "3年目以降"]
S = [368.7, 401.5, 409.7]           # 売上
COGS = [112.4, 122.4, 124.9]
LAB = [127.2, 134.5, 133.1]
GOP = [98.5, 112.9, 120.9]
ROY = [14.7, 16.1, 16.4]
RENT = [26.6 + 2.6, 26.6 + 4.9, 26.6 + 5.5]   # 固定＋歩合
EBITDA = [42.7, 52.4, 59.3]
DEP = 20.8
VAR = 0.3048 + 0.0239 + 0.0141 + 0.0049 + 0.0399      # GOPまでの変動費率（原価・委託・広告・その他・光熱）
VAR2 = 0.04 + 0.0071 + 0.0249                         # GOP以降の変動費率（ロイヤリティ・保険・FFE）

def ebitda_calc(s, l):
    return s * (1 - VAR - VAR2) - l - 26.6 - max(0, (s - 331.4) * 0.07)
def gop_calc(s, l):
    return s * (1 - VAR) - l
LAB_HIGH = 150.0   # 稲葉・上村案 月1,250万円×12
CASES = [("計画どおり", lambda i: (S[i], LAB[i])),
         ("人件費 月1,250万円（稲葉・上村案）", lambda i: (S[i], LAB_HIGH)),
         ("売上 計画比▲10%", lambda i: (S[i] * 0.9, LAB[i])),
         ("人件費1,250万円＋売上▲10%", lambda i: (S[i] * 0.9, LAB_HIGH))]
def case_vals(i, c):
    s, l = CASES[c][1](i)
    if c == 0: return S[i], GOP[i], EBITDA[i]
    d_e = ebitda_calc(s, l) - ebitda_calc(S[i], LAB[i]); d_g = gop_calc(s, l) - gop_calc(S[i], LAB[i])
    return s, GOP[i] + d_g, EBITDA[i] + d_e

HQ = 6.0          # 運営会社の本部費（SV・経理・労務の工数、仮置き）
A_SALES, A_GOP = 0.03, 0.10   # A案：売上3%＋GOP10%
B_FIX = 30.0      # B案：運営会社がBTMに払う設備・ブランド使用料（年3,000万円）
DEBT = 15.6       # BTMの分割返済（内装立替10.0＋保証金5.6）

def f1(x): return f"{x:,.1f}"

# ───────── docx helpers ─────────
doc = Document()
sec = doc.sections[0]
sec.page_width, sec.page_height = Mm(210), Mm(297)
for m in ("left_margin", "right_margin"): setattr(sec, m, Mm(18))
sec.top_margin, sec.bottom_margin = Mm(16), Mm(16)
st = doc.styles["Normal"]; st.font.name = JP; st.font.size = Pt(9.5)
st.element.rPr.rFonts.set(qn("w:eastAsia"), JP)
st.paragraph_format.space_after = Pt(2); st.paragraph_format.line_spacing = 1.15

def run(p, t, bold=False, size=None, color=None):
    r = p.add_run(t); r.bold = bold; r.font.name = JP
    r._element.get_or_add_rPr().get_or_add_rFonts().set(qn("w:eastAsia"), JP)
    if size: r.font.size = Pt(size)
    if color: r.font.color.rgb = RGBColor.from_string(color)
    return r
def para(t="", bold=False, size=None, color=None, align=None, before=0, after=2, indent=0):
    p = doc.add_paragraph(); p.paragraph_format.space_before = Pt(before); p.paragraph_format.space_after = Pt(after)
    if indent: p.paragraph_format.left_indent = Mm(indent)
    if align: p.alignment = align
    if t: run(p, t, bold, size, color)
    return p
def h1(t): para(t, True, 12, "1F3864", before=8, after=3)
def bullet(t, lvl=0):
    p = para(indent=4 + lvl * 4); p.paragraph_format.first_line_indent = Mm(-3); run(p, "・" + t); return p
def shade(cell, hexcolor):
    tcPr = cell._element.get_or_add_tcPr(); s = OxmlElement("w:shd")
    s.set(qn("w:val"), "clear"); s.set(qn("w:color"), "auto"); s.set(qn("w:fill"), hexcolor); tcPr.append(s)
def table(rows, widths, header_fill="1F3864", bold_rows=(), num_cols=(), fills=None):
    t = doc.add_table(rows=len(rows), cols=len(rows[0])); t.style = "Table Grid"; t.alignment = WD_TABLE_ALIGNMENT.CENTER
    t.autofit = False
    for j, gc in enumerate(t._tbl.tblGrid.findall(qn("w:gridCol"))): gc.set(qn("w:w"), str(int(widths[j] * 56.7)))
    for j, col in enumerate(t.columns): col.width = Mm(widths[j])
    for i, row in enumerate(rows):
        for j, v in enumerate(row):
            c = t.cell(i, j); c.width = Mm(widths[j]); c.text = ""
            p = c.paragraphs[0]; p.paragraph_format.space_after = Pt(0)
            if j in num_cols and i > 0: p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
            if i == 0: p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            run(p, str(v), bold=(i == 0 or i in bold_rows), size=8.5, color=("FFFFFF" if i == 0 else None))
            if i == 0: shade(c, header_fill)
            elif fills and (i, j) in fills: shade(c, fills[(i, j)])
            elif i in bold_rows: shade(c, "F2F2F2")
    doc.add_paragraph().paragraph_format.space_after = Pt(2)
    return t

# ───────── 本文 ─────────
FIX = 6.0          # 月額50万円×12
RATE = 0.10        # 利益の10%
CONS_YRS = ["FY2027", "FY2028", "FY2029", "FY2030", "FY2031"]
CONS_SHOPS = [1, 3, 5, 7, 9]
CONS_OP = [6.9, 30.9, 89.7, 159.6, 230.6]       # 連結営業利益（本部費・減価償却後）
OP1 = [e - DEP for e in EBITDA]                   # 1号店の営業利益

para("Brasserie Thierry Marx　取締役ご就任とインセンティブのご相談", True, 15, "1F3864", WD_ALIGN_PARAGRAPH.CENTER, after=2)
para("2026年11月26日　株式会社WineBank　中野邦人　（社外秘・ご検討用）", size=8.5, color="595959", align=WD_ALIGN_PARAGRAPH.CENTER, after=6)

h1("1. ご相談の内容")
para("ティエリーマルクスのブラッスリー事業を運営する株式会社Brasserie Thierry Marx（以下BTM）は、WineBankグループの直営として運営します。"
     "宇佐美さんに、アピシウスと同じ形でBTMの取締役にご就任いただき、店舗運営の責任者をお願いしたいと考えています。")
table([["項目", "ご提案（アピシウスと同条件）"],
       ["役職", "株式会社Brasserie Thierry Marx 取締役（運営担当）。代表取締役は中野"],
       ["固定報酬", "月額50万円（年600万円）"],
       ["インセンティブ", "利益の10%（対象とする利益の定義は下記4.で2案。明日ご相談）"],
       ["主な役割", "六本木店の運営全般の統括（稲葉GM・上村料理長の管掌、採用・人件費管理、原価・品質、月次の数値管理）、2号店以降の出店・運営体制づくり"],
       ["時期", "2026年12月〜（開業準備：採用・研修・レセプションから）。就任は株主総会で決議・登記"]],
      [32, 142])

h1("2. 体制")
table([["", "BTM（WineBank直営）", "宇佐美さん（取締役・運営担当）", "WineBank"],
       ["役割", "賃借人（三井不動産・定借10年）、ブランド再許諾の契約者、内装・設備・ワイン在庫の保有、資金調達",
        "店舗運営の責任者。GM・料理長・幹部の管掌、オペレーション・人件費・原価の管理",
        "ブランド窓口（TBS・マルクス氏）、ワイン供給、マーケティング（WineBank CLUB）、経理・資金"],
       ["負担", "初期投資約2.97億円、家賃、ブランド使用料、従業員の雇用", "投資負担なし", "―"]],
      [18, 52, 60, 44])

h1("3. 店舗の概要")
for t in ["場所：東京ミッドタウン（六本木）　店内55.5坪＋テラス約50坪、108席（店内63・テラス45）",
          "営業：11:00〜23:00（ランチ・カフェ・ディナー）、年363日。客単価 ランチ4,000円／カフェ3,000円／ディナー店内15,000円・テラス7,000円",
          "日程：引渡し4/15 → 搬入・トレーニング4/23〜25 → レセプション4/26〜27 → 開業4/28〜30（2027年）",
          "ブランド：パリ「Thierry Marx」初の日本ブラッスリー。使用料は売上の4%（5年の最低使用料8,000万円）",
          "家賃：固定 月222万円＋歩合（年商3.31億円超の部分の7%）。内装1億円は家主立替（月83万円×10年返済）",
          "人員（稲葉GM案）：40名（役職者8・社員12・アルバイト20）。幹部は稲葉GM・上村料理長・山田氏を採用済み"]:
    bullet(t)

h1("4. 店舗の事業収支（単店・百万円）")
rows = [["科目"] + YRS, ["売上高"] + [f1(x) for x in S], ["売上原価（30.5%）"] + [f1(x) for x in COGS],
        ["人件費（34.5%→32.5%）"] + [f1(x) for x in LAB], ["GOP（店舗営業総利益）"] + [f1(x) for x in GOP],
        ["ブランド使用料（4%）"] + [f1(x) for x in ROY], ["家賃（固定＋歩合）"] + [f1(x) for x in RENT],
        ["EBITDA"] + [f1(x) for x in EBITDA], ["減価償却費"] + [f1(DEP)] * 3,
        ["営業利益"] + [f1(e - DEP) for e in EBITDA]]
table(rows, [74, 32, 32, 32], bold_rows=(4, 7, 9), num_cols=(1, 2, 3))
para("出所：事業収支統合モデル（2026/11/09、添付）。1年目は立上り90%。EBITDA以外の経費（業務委託・広告・水道光熱・保険・修繕）は表から省略。", size=8, color="595959")


h1("5. 報酬の試算（百万円・年）")
para("インセンティブの対象とする利益は、次の2案を考えています。", after=3)
para("① 1号店（六本木）の営業利益の10%　―　開業直後から成果が報酬に反映される形", True, 10)
rows = [["項目"] + YRS,
        ["1号店の営業利益（減価償却後）"] + [f1(x) for x in OP1],
        ["固定報酬（月50万円）"] + [f1(FIX)] * 3,
        ["インセンティブ（10%）"] + [f1(max(x, 0) * RATE) for x in OP1],
        ["報酬 合計"] + [f1(FIX + max(x, 0) * RATE) for x in OP1]]
table(rows, [74, 32, 32, 32], bold_rows=(4,), num_cols=(1, 2, 3))
para("② 会社全体（多店舗展開後）の営業利益の10%　―　出店が進むほど大きくなる形", True, 10)
rows = [["項目"] + CONS_YRS,
        ["期末店舗数（店）"] + [str(x) for x in CONS_SHOPS],
        ["会社全体の営業利益（本部費・減価償却後）"] + [f1(x) for x in CONS_OP],
        ["固定報酬（月50万円）"] + [f1(FIX)] * 5,
        ["インセンティブ（10%）"] + [f1(x * RATE) for x in CONS_OP],
        ["報酬 合計"] + [f1(FIX + x * RATE) for x in CONS_OP]]
table(rows, [58, 23, 23, 23, 23, 23], bold_rows=(5,), num_cols=(1, 2, 3, 4, 5))
para("下振れした場合（1年目・1号店基準）", True, 10)
rows = [["ケース", "売上", "営業利益", "インセンティブ", "報酬 合計"]]
for c in range(4):
    s_, g_, e_ = case_vals(0, c); op = e_ - DEP
    rows.append([CASES[c][0], f1(s_), f1(op), f1(max(op, 0) * RATE), f1(FIX + max(op, 0) * RATE)])
table(rows, [66, 24, 26, 27, 27], num_cols=(1, 2, 3, 4))
for t in ["固定報酬があるため、開業初年度に利益が出なくても年600万円は確保されます。",
          "インセンティブは人件費と売上の管理次第です。人件費を計画（売上の34.5%）に収めると、1号店だけで年200〜390万円、5年後に9店舗になれば会社全体で年2,300万円程度になります。",
          "アピシウスの取締役と兼務いただく形を想定しています（時間配分は明日ご相談）。"]:
    bullet(t)

h1("6. ご就任いただく場合のメリット")
for t in ["ブランド：フランスを代表するシェフ、ティエリー・マルクス氏の日本初のブラッスリー。ミッドタウンの立地で、立ち上げから関われます。",
          "投資負担なし：内装・保証金・契約金・ワイン在庫はBTMが負担。報酬は固定＋成果連動で、下振れ時も固定部分は確保。",
          "成長：5年で9店舗（札幌・大阪・首都圏・リゾート）の計画。出店が進むほどインセンティブ（②案）が大きくなります。",
          "ノウハウ：キースタッフはパリ・日本で各10日間マルクス氏の研修を受け、氏が年2回来日して直接指導します。",
          "シナジー：アピシウス・OTOなどとの人材の行き来、仕入れ・ワインの共同化。"]:
    bullet(t)

h1("7. 課題・リスク（ご就任前に知っておいていただきたいこと）")
ISSUES = [
    ("人件費", "稲葉GM・上村料理長の最新案は月1,250万円（キッチン社員8・アルバイト4・パティシエ3、サービス社員6・アルバイト11以上）で、目標1,100万円・事業計画（売上比34.5%）を上回ります。開業後2か月は教育のため40%の見込み。スーシェフの長時間労働（残業月約87時間の試算）も是正が必要です。宇佐美さんに最初にお願いしたい論点です。"),
    ("売上前提", "稲葉さん案（年452〜464百万円）とモデル（409.7）に差があります。ランチ単価、冬季のテラス、カフェ時間帯の集客、料理の平均単価（未確定）が論点です。"),
    ("ブランド契約上の制約", "キースタッフ4職（総料理長・パティスリーシェフ・ダイニングマネージャー・シェフソムリエ）の任免はマルクス氏の承認が必要。メニュー・内装・サービスは三者協議、価格変更は事後承諾です。"),
    ("スケジュール", "設計が遅れており、ミッドタウンから11月中の基本図修正・実施図提出を求められています。引渡し4/15から開業まで約2週間と短く、開業前研修（3/15〜4/14）・採用（2〜3月）の段取りが重要です。"),
    ("開業前の資金", "BTMは開業時点の資金を追加出資・融資で手当てしている段階です（資金繰り表を添付）。"),
    ("役員報酬の税務", "非上場会社のため、利益連動の役員報酬は原則として損金にならない点を税理士と整理します（アピシウスと同じ扱いにそろえます）。")]
table([["項目", "内容"]] + [[a, b] for a, b in ISSUES], [32, 142])

h1("8. 明日伺いたいこと")
for i, t in enumerate(["ご就任のご意向",
                       "インセンティブの対象とする利益（①1号店／②会社全体／組み合わせ）",
                       "アピシウスとの兼務の時間配分と、開始時期（12月から開業準備に入れるか）",
                       "人件費・人員体制（稲葉GM・上村料理長の案）についてのお考え",
                       "月次の報告・KPI（売上・原価率・人件費率）の持ち方"], 1):
    bullet(f"{i}. {t}")

h1("9. 添付資料")
for t in ["本資料（PDF）", "事業収支統合モデル（20261109、Excel）", "開業までの資金繰り（20261121、Excel）",
          "人件費・売上の課題一覧（稲葉さんMTG 11/20、Excel）", "人件費予算と人員構成（Fabrice氏 11/23、Excel）",
          "開業工程とマーケティング・採用計画（PowerPoint・PDF）", "コンセプト修正案（PDF）",
          "平面図・展開図（Notes Design 11/09版、PDF・圧縮版）", "イメージパース（11/12版）はファイルが大きいためGoogleドライブのリンクで共有"]:
    bullet(t)
para("本資料の数値は事業計画に基づく試算です。", size=8, color="595959", before=4)

doc.save(OUT); print("saved", OUT)
