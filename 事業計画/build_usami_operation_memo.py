# -*- coding: utf-8 -*-
"""宇佐美さん向け：Brasserie Thierry Marx 六本木店の運営受託 検討資料（docx → PDF）。
数値は 事業収支統合モデル v8（20261109）の単店PLを基準に、運営受託の報酬案と感応度を計算する。
"""
import os
from docx import Document
from docx.shared import Pt, RGBColor, Mm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "BTM_運営受託_検討資料_宇佐美様_20261126.docx")
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
para("Brasserie Thierry Marx 六本木店　運営受託のご検討資料", True, 15, "1F3864", WD_ALIGN_PARAGRAPH.CENTER, after=2)
para("2026年11月26日　株式会社WineBank　中野邦人　（社外秘・ご検討用）", size=8.5, color="595959", align=WD_ALIGN_PARAGRAPH.CENTER, after=6)

h1("1. 前提（今回のご相談の仮定）")
para("資本業務提携案でお示しした形で、株式会社Brasserie Thierry Marx（以下BTM・店舗オーナー）が、六本木店の運営を宇佐美さんの運営会社に委託すると仮定しています。")
table([["", "BTM（オーナー）", "運営会社（宇佐美さん）", "WineBank"],
       ["役割", "賃借人（三井不動産・定借10年）／ブランド再許諾の契約者／内装・設備・ワイン在庫の保有／資金調達",
        "店舗運営全般：採用・労務・シフト、オペレーション、仕入・原価管理、品質・衛生、予約・接客、日次・月次の数値管理",
        "ブランド窓口（TBS・マルクス氏）、ワイン供給、マーケティング（WineBank CLUB・会員送客）"],
       ["負担", "内装・保証金・契約金などの初期投資（約2.97億円）、家賃、ブランド使用料",
        "本部の管理工数（運営委託料で回収）", "―"]],
      [18, 52, 60, 44])

h1("2. 店舗の概要")
for t in ["場所：東京ミッドタウン（六本木）　店内55.5坪＋テラス約50坪、108席（店内63・テラス45）",
          "営業：11:00〜23:00（ランチ・カフェ・ディナー）、年363日。客単価 ランチ4,000円／カフェ3,000円／ディナー店内15,000円・テラス7,000円",
          "日程：引渡し4/15 → 搬入・トレーニング4/23〜25 → レセプション4/26〜27 → 開業4/28〜30（2027年）",
          "ブランド：パリ「Thierry Marx」初の日本ブラッスリー。使用料は売上の4%（5年の最低使用料8,000万円）",
          "家賃：固定 月222万円＋歩合（年商3.31億円超の部分の7%）。内装1億円は家主立替（月83万円×10年返済）",
          "人員（稲葉GM案）：40名（役職者8・社員12・アルバイト20）。幹部は稲葉GM・上村料理長・山田氏を採用済み"]:
    bullet(t)

h1("3. 店舗の事業収支（単店・百万円）")
rows = [["科目"] + YRS, ["売上高"] + [f1(x) for x in S], ["売上原価（30.5%）"] + [f1(x) for x in COGS],
        ["人件費（34.5%→32.5%）"] + [f1(x) for x in LAB], ["GOP（店舗営業総利益）"] + [f1(x) for x in GOP],
        ["ブランド使用料（4%）"] + [f1(x) for x in ROY], ["家賃（固定＋歩合）"] + [f1(x) for x in RENT],
        ["EBITDA"] + [f1(x) for x in EBITDA], ["減価償却費"] + [f1(DEP)] * 3,
        ["営業利益"] + [f1(e - DEP) for e in EBITDA]]
table(rows, [74, 32, 32, 32], bold_rows=(4, 7, 9), num_cols=(1, 2, 3))
para("出所：事業収支統合モデル（2026/11/09、添付）。1年目は立上り90%。EBITDA以外の経費（業務委託・広告・水道光熱・保険・修繕）は表から省略。", size=8, color="595959")

h1("4. 運営受託の報酬案と、それぞれの収支（百万円・年）")
para("報酬の形は2案を用意しました。どちらが良いか、または別の形がよいかを明日伺いたいと考えています。", after=3)
para("A案　マネジメント型：運営委託料＝売上の3%＋GOPの10%（店舗のコスト・損益はBTM負担）", True, 10)
feeA = [S[i] * A_SALES + GOP[i] * A_GOP for i in range(3)]
rows = [["項目"] + YRS,
        ["運営委託料（売上3%）"] + [f1(S[i] * A_SALES) for i in range(3)],
        ["運営委託料（GOP10%・成功報酬）"] + [f1(GOP[i] * A_GOP) for i in range(3)],
        ["運営委託料 計（運営会社の収入）"] + [f1(x) for x in feeA],
        ["運営会社の本部費（仮置き）"] + [f1(-HQ)] * 3,
        ["運営会社の利益"] + [f1(x - HQ) for x in feeA],
        ["BTMのEBITDA（委託料控除後）"] + [f1(EBITDA[i] - feeA[i]) for i in range(3)],
        ["BTMの営業利益（減価償却後）"] + [f1(EBITDA[i] - feeA[i] - DEP) for i in range(3)]]
table(rows, [74, 32, 32, 32], bold_rows=(3, 5), num_cols=(1, 2, 3))
para("B案　損益責任型：運営会社が店舗の損益を持ち、BTMに設備・ブランド使用料として年3,000万円（月250万円）を支払う（家賃・ブランド使用料は実費で精算）", True, 10)
rows = [["項目"] + YRS,
        ["店舗EBITDA（運営会社に帰属）"] + [f1(x) for x in EBITDA],
        ["BTMへの設備・ブランド使用料"] + [f1(-B_FIX)] * 3,
        ["運営会社の本部費（仮置き）"] + [f1(-HQ)] * 3,
        ["運営会社の利益"] + [f1(EBITDA[i] - B_FIX - HQ) for i in range(3)],
        ["BTMの営業利益（使用料−減価償却）"] + [f1(B_FIX - DEP)] * 3,
        ["BTMの返済後キャッシュ（使用料−分割返済）"] + [f1(B_FIX - DEBT)] * 3]
table(rows, [74, 32, 32, 32], bold_rows=(4,), num_cols=(1, 2, 3))

para("下振れ時の運営会社の利益（1年目・百万円）", True, 10)
rows = [["ケース", "売上", "店舗EBITDA", "A案 運営会社", "B案 運営会社"]]
for c in range(4):
    s, g, e = case_vals(0, c)
    fa = s * A_SALES + max(g, 0) * A_GOP
    rows.append([CASES[c][0], f1(s), f1(e), f1(fa - HQ), f1(e - B_FIX - HQ)])
fills = {(r, 4): "FCE4D6" for r in range(1, 5) if float(rows[r][4].replace(",", "")) < 0}
table(rows, [66, 24, 26, 27, 27], num_cols=(1, 2, 3, 4), fills=fills)
for t in ["A案は売上・人件費が下振れても運営会社は赤字になりにくい一方、上振れの取り分は限られます。損失はBTM（＝株主）が負います。",
          "B案は上振れをすべて運営会社が取れますが、人件費が稲葉・上村案（月1,250万円）のままだと1年目は赤字になります。",
          "どちらの案でも、人件費を計画（売上の34.5%・月約1,060万円）に収められるかが最大の論点です。"]:
    bullet(t)

h1("5. 受託いただく場合のメリット")
for t in ["ブランド：フランスを代表するシェフ、ティエリー・マルクス氏の日本初のブラッスリー。ミッドタウンの立地で、運営会社としての実績と採用力が高まります。",
          "初期投資なし：内装・保証金・契約金・ワイン在庫はBTMが負担。運営会社は人と仕組みで参加できます。",
          "成長：5年で9店舗（札幌・大阪・首都圏・リゾート）の計画。1号店の運営が軌道に乗れば、2号店以降の運営受託も前提に協議します。",
          "ノウハウ：キースタッフはパリ・日本で各10日間、マルクス氏の研修を受け、氏が年2回来日して直接指導します。",
          "シナジー：アピシウス・OTOなど既存店との人材の行き来、仕入れ・ワイン（WineBank）の共同化、本部固定費の分散。"]:
    bullet(t)

h1("6. 課題・リスク（受託前に知っておいていただきたいこと）")
ISSUES = [
    ("人件費", "稲葉GM・上村料理長の最新案は月1,250万円（キッチン社員8・アルバイト4・パティシエ3、サービス社員6・アルバイト11以上）で、目標1,100万円・事業計画（売上比34.5%）を上回ります。開業後2か月は教育のため40%の見込み。スーシェフの長時間労働（残業月約87時間の試算）も是正が必要です。"),
    ("売上前提", "稲葉さん案（年452〜464百万円）とモデル（409.7）に差があります。ランチ単価、冬季のテラス、カフェ時間帯の集客、料理の平均単価（未確定）が論点です。"),
    ("ブランド契約上の制約", "キースタッフ4職（総料理長・パティスリーシェフ・ダイニングマネージャー・シェフソムリエ）の任免はマルクス氏の承認が必要。メニュー・内装・サービスは三者協議、価格変更は事後承諾。運営の裁量に一定の枠があります。"),
    ("運営を委託する場合の契約関係", "TBSとの契約では店舗運営の責任はWineBankが負う形です。運営会社への委託は、TBSへの説明・承諾と、BTMの株主との合意書（WineBankが運営を受託する想定）との整合を取る必要があります。"),
    ("幹部の雇用", "稲葉GM・上村料理長・山田氏はBTM採用で進めています（管理監督者）。運営会社への転籍・出向とするか、BTM雇用のまま運営会社が管理するかを決める必要があります。"),
    ("スケジュール", "設計が遅れており、ミッドタウンから11月中の基本図修正・実施図提出を求められています。引渡し4/15から開業まで約2週間と短く、開業前研修（3/15〜4/14）・採用（2〜3月）の段取りが重要です。"),
    ("開業前の資金", "BTMは開業時点で資金の手当て（追加出資・融資）を進めている段階です。運営委託料の支払いが滞らない設計（月次精算・預り金など）を契約で手当てします。"),
    ("期間・出口", "定借10年、ブランド契約は開業から5年（合意で5年ずつ延長）。運営委託契約の期間・解約条件・KPIをこれに合わせて設計します。")]
table([["項目", "内容"]] + [[a, b] for a, b in ISSUES], [32, 142])

h1("7. 明日伺いたいこと")
for i, t in enumerate(["受託のご意向（受ける／条件次第／見送り）",
                       "報酬の形（A案・B案・その他）と水準のお考え",
                       "雇用の形（BTM雇用＋運営会社が管理／運営会社雇用・転籍）",
                       "受託の範囲と開始時期（開業準備：採用・研修・レセプションから入るか。例：2027年1月〜）",
                       "本部の体制（ご担当・SV・経理労務）と、月次の報告・KPI（売上・原価率・人件費率）",
                       "契約期間・解約条件のお考え"], 1):
    bullet(f"{i}. {t}")

h1("8. 添付資料")
for t in ["本資料（PDF）", "事業収支統合モデル（20261109、Excel）", "開業までの資金繰り（20261121、Excel）",
          "人件費・売上の課題一覧（稲葉さんMTG 11/20、Excel）", "人件費予算と人員構成（Fabrice氏 11/23、Excel）",
          "開業工程とマーケティング・採用計画（PowerPoint・PDF）", "コンセプト修正案（PDF）",
          "平面図・展開図（Notes Design 11/09版、PDF）", "イメージパース（11/12版）はファイルが大きいためGoogleドライブのリンクで共有"]:
    bullet(t)
para("本資料の数値は事業計画に基づく試算で、運営会社の本部費・報酬水準は議論のための仮置きです。", size=8, color="595959", before=4)

doc.save(OUT); print("saved", OUT)
