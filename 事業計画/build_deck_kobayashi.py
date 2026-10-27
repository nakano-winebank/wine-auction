# -*- coding: utf-8 -*-
"""小林様向け（プレシード特例・ポスト4.5億）最終デック生成。
投資家向けデック（THIERRY MARX × WineBank）の事業収支スライドを、
統合モデルの最新値で元資料のトンマナ（Meiryo・銅色バー・ベージュ表）のまま差し替える。

使い方:
  python3 merge_deck_slides.py <統合モデル.xlsx> <展開済みデックdir>
  展開済みデックの slide12 / slide13 を書き換え、slide24 / slide25（slide13を複製済み）を新規作成。
"""
import sys, re
from decimal import Decimal, ROUND_HALF_UP
from xml.sax.saxutils import escape
import openpyxl

MODEL, DECK, IMG = sys.argv[1], sys.argv[2], sys.argv[3]
wv = openpyxl.load_workbook(MODEL, data_only=True)

EMU = 914400
COPPER, TAN, BEIGE, WHITE, BLACK, GRAY = "C68A65", "D5AA8F", "E3C5B2", "FFFFFF", "000000", "888888"
FONT = '<a:latin typeface="Meiryo"/><a:ea typeface="Meiryo"/><a:cs typeface="Meiryo"/><a:sym typeface="Meiryo"/>'
END = ('<a:endParaRPr sz="1400" b="0" i="0" u="none" strike="noStrike" cap="none"><a:solidFill>'
       '<a:srgbClr val="000000"/></a:solidFill><a:latin typeface="Arial"/><a:ea typeface="Arial"/>'
       '<a:cs typeface="Arial"/><a:sym typeface="Arial"/></a:endParaRPr>')


# ───────── 数値整形 ─────────
def hu(v, nd):
    q = Decimal(1).scaleb(-nd)
    return Decimal(str(round(v, 9))).quantize(q, rounding=ROUND_HALF_UP)

def mm(v, nd=0, plus=False):
    """百万円。マイナスは▲。"""
    d = hu(v, nd)
    if d == 0: d = abs(d)
    s = f"{abs(d):,.{nd}f}"
    return ("▲" + s) if d < 0 else (("＋" + s) if plus and d > 0 else s)

def man(v, plus=False):
    """百万円 → 万円（整数）。"""
    return mm(v * 100, 0, plus)

def pct(v, nd=1):
    return f"{hu(v * 100, nd):.{nd}f}%"


# ───────── モデルの値 ─────────
def rows_by_label(sh, c0=1, c1=8):
    d = {}
    for row in wv[sh].iter_rows():
        lab = row[0].value
        if isinstance(lab, str):
            d.setdefault(lab.strip().replace("　", " "), [c.value for c in row[c0:c1]])
    return d

U = rows_by_label("単店PL", 1, 5)       # 満年度,1年目,2年目,3年目以降
C = rows_by_label("連結PL", 2, 8)       # FY2027..FY2031, 5年累計
I = rows_by_label("投資・CF", 1, 8)
K = wv["経費前提"]; S = wv["売上前提"]; SEN = wv["感応度分析"]

def u(lab): return U[lab]
def c(lab): return C[lab][:5]

seats = {k: S[f"B{r}"].value for k, r in
         [("cnt", 13), ("din", 14), ("pri", 15), ("in", 16), ("ter", 17), ("all", 18)]}
day_sales = S["B36"].value; mon_sales = S["B37"].value; yr_sales = S["B38"].value
turn_all = S["B41"].value
eff_in, eff_te = S["D22"].value, S["D23"].value
lunch, cafe, din_in, din_te = S["H22"].value, S["H24"].value, S["H26"].value, S["H27"].value
din_food, din_bev = S["F26"].value, S["G26"].value

# 初期投資（1店あたり） 経費前提 B/C/D 列
inv_rows = {}
for row in K.iter_rows(min_row=30, max_row=50):
    lab = row[0].value
    if isinstance(lab, str):
        inv_rows[lab.strip().replace("　", " ")] = [x.value for x in row[1:4]]

def inv(lab_prefix):
    for k, v in inv_rows.items():
        if k.startswith(lab_prefix): return v
    raise KeyError(lab_prefix)


# ───────── XML 部品 ─────────
_id = [5000]
def nid():
    _id[0] += 1; return _id[0]

def E(x): return int(round(x * EMU))

def run(text, sz, color, b=False):
    return (f'<a:r><a:rPr lang="ja-JP" sz="{sz}" b="{1 if b else 0}" i="0" u="none" strike="noStrike" cap="none">'
            f'<a:solidFill><a:srgbClr val="{color}"/></a:solidFill>{FONT}</a:rPr><a:t>{escape(text)}</a:t></a:r>')

def para(runs, algn="l", ln=115000, bu_sz=700):
    return (f'<a:p><a:pPr marL="0" marR="0" lvl="0" indent="0" algn="{algn}" rtl="0"><a:lnSpc><a:spcPct val="{ln}"/></a:lnSpc>'
            f'<a:spcBef><a:spcPts val="0"/></a:spcBef><a:spcAft><a:spcPts val="0"/></a:spcAft>'
            f'<a:buClr><a:srgbClr val="000000"/></a:buClr><a:buSzPts val="{bu_sz}"/><a:buFont typeface="Arial"/><a:buNone/></a:pPr>'
            f'{runs}{END}</a:p>')

def textbox(x, y, w, h, paras, autofit=True, anchor="t"):
    i = nid()
    fit = "<a:spAutoFit/>" if autofit else "<a:noAutofit/>"
    return (f'<p:sp><p:nvSpPr><p:cNvPr id="{i}" name="TextBox {i}"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr>'
            f'<p:spPr><a:xfrm><a:off x="{E(x)}" y="{E(y)}"/><a:ext cx="{E(w)}" cy="{E(h)}"/></a:xfrm>'
            f'<a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:noFill/><a:ln><a:noFill/></a:ln></p:spPr>'
            f'<p:txBody><a:bodyPr spcFirstLastPara="1" wrap="square" lIns="0" tIns="0" rIns="0" bIns="0" anchor="{anchor}" anchorCtr="0">{fit}</a:bodyPr>'
            f'<a:lstStyle/>{"".join(paras)}</p:txBody></p:sp>')

def title(t):   return textbox(0.26, 0.23, 8.0, 0.31, [para(run(t, 1400, BLACK, True), ln=115000, bu_sz=1400)])
def subtitle(t): return textbox(0.28, 0.56, 9.2, 0.18, [para(run(t, 750, GRAY), bu_sz=750)])
def footnote(t, y=5.10): return textbox(0.48, y, 9.0, 0.16, [para(run(t, 600, GRAY), bu_sz=600)])
def confidential(): return textbox(0.06, 5.33, 0.9, 0.14, [para(run("CONFIDENTIAL", 600, GRAY), bu_sz=600)])

def slidenum():
    i = nid()
    return (f'<p:sp><p:nvSpPr><p:cNvPr id="{i}" name="Slide Number {i}"/><p:cNvSpPr txBox="1"><a:spLocks noGrp="1"/></p:cNvSpPr>'
            f'<p:nvPr><p:ph type="sldNum" idx="12"/></p:nvPr></p:nvSpPr><p:spPr><a:xfrm><a:off x="8898878" y="4847099"/>'
            f'<a:ext cx="264900" cy="183600"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:noFill/><a:ln><a:noFill/></a:ln></p:spPr>'
            f'<p:txBody><a:bodyPr spcFirstLastPara="1" wrap="square" lIns="68575" tIns="34275" rIns="68575" bIns="34275" anchor="ctr" anchorCtr="0"><a:noAutofit/></a:bodyPr>'
            f'<a:lstStyle/><a:p><a:pPr marL="0" lvl="0" indent="0" algn="r" rtl="0"><a:lnSpc><a:spcPct val="100000"/></a:lnSpc>'
            f'<a:spcBef><a:spcPts val="0"/></a:spcBef><a:spcAft><a:spcPts val="0"/></a:spcAft><a:buClr><a:srgbClr val="000000"/></a:buClr>'
            f'<a:buSzPts val="900"/><a:buFont typeface="Arial"/><a:buNone/></a:pPr><a:fld id="{{00000000-1234-1234-1234-123412341234}}" type="slidenum">'
            f'<a:rPr lang="en-US" altLang="ja-JP" sz="700"/><a:t>‹#›</a:t></a:fld><a:endParaRPr sz="700"/></a:p></p:txBody></p:sp>')

def bar(x, y, w, t, h=0.24):
    i = nid()
    return (f'<p:sp><p:nvSpPr><p:cNvPr id="{i}" name="Header {i}"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>'
            f'<p:spPr><a:xfrm><a:off x="{E(x)}" y="{E(y)}"/><a:ext cx="{E(w)}" cy="{E(h)}"/></a:xfrm>'
            f'<a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:solidFill><a:srgbClr val="{COPPER}"/></a:solidFill><a:ln><a:noFill/></a:ln></p:spPr>'
            f'<p:txBody><a:bodyPr spcFirstLastPara="1" wrap="square" lIns="0" tIns="0" rIns="0" bIns="0" anchor="ctr" anchorCtr="0"><a:noAutofit/></a:bodyPr>'
            f'<a:lstStyle/>{para(run(t, 800, WHITE, True), algn="ctr", ln=100000, bu_sz=800)}</p:txBody></p:sp>')

def bullets(x, y, w, h, lines, sz=750, ln=145000):
    ps = []
    for ln_ in lines:
        if isinstance(ln_, tuple):           # (text, color, bold)
            t, col, b = ln_
        else:
            t, col, b = ln_, BLACK, False
        ps.append(para(run(t, sz, col, b), ln=ln, bu_sz=sz))
    return textbox(x, y, w, h, ps)

# kind: h=見出し行, b=太字行(ベージュ), n=通常行(ラベル茶・値白), k=強調行(銅色・白字)
def cell(text, kind, first, algn, sz=700, color=None):
    if kind == "h":   fill, fc, b = COPPER, WHITE, True
    elif kind == "b": fill, fc, b = BEIGE, BLACK, True
    elif kind == "k": fill, fc, b = COPPER, WHITE, True
    elif kind == "s": fill, fc, b = (TAN, WHITE, False) if first else (WHITE, BLACK, False)  # 小見出し的な通常行
    else:             fill, fc, b = (TAN, WHITE, False) if first else (WHITE, BLACK, False)
    if color: fc = color
    return (f'<a:tc><a:txBody><a:bodyPr/><a:lstStyle/>{para(run(text, sz, fc, b), algn=algn, ln=100000, bu_sz=sz)}</a:txBody>'
            f'<a:tcPr marL="45725" marR="45725" marT="0" marB="0" anchor="ctr"><a:solidFill><a:srgbClr val="{fill}"/></a:solidFill></a:tcPr></a:tc>')

def table(x, y, colw, rows, rh=0.213, sz=700, first_algn="l", rest_algn="r"):
    """rows: [(kind, [cells...]) or (kind, [cells...], {col: color})]"""
    i = nid()
    grid = "".join(
        f'<a:gridCol w="{E(cw)}"><a:extLst><a:ext uri="{{9D8B030D-6E8A-4147-A177-3AD203B41FA5}}">'
        f'<a16:colId xmlns:a16="http://schemas.microsoft.com/office/drawing/2014/main" val="{20000 + j}"/></a:ext></a:extLst></a:gridCol>'
        for j, cw in enumerate(colw))
    trs = []
    for ri, r in enumerate(rows):
        kind, vals = r[0], r[1]
        colors = r[2] if len(r) > 2 else {}
        tcs = "".join(cell(str(v), kind, j == 0,
                           (first_algn if j == 0 else ("ctr" if kind == "h" else rest_algn)), sz, colors.get(j))
                      for j, v in enumerate(vals))
        trs.append(f'<a:tr h="{E(rh)}">{tcs}<a:extLst><a:ext uri="{{0D108BD9-81ED-4DB2-BD59-A6C34878D82A}}">'
                   f'<a16:rowId xmlns:a16="http://schemas.microsoft.com/office/drawing/2014/main" val="{10000 + ri}"/></a:ext></a:extLst></a:tr>')
    W, H = sum(colw), rh * len(rows)
    return (f'<p:graphicFrame><p:nvGraphicFramePr><p:cNvPr id="{i}" name="Table {i}"/><p:cNvGraphicFramePr/><p:nvPr/></p:nvGraphicFramePr>'
            f'<p:xfrm><a:off x="{E(x)}" y="{E(y)}"/><a:ext cx="{E(W)}" cy="{E(H)}"/></p:xfrm>'
            f'<a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/table"><a:tbl>'
            f'<a:tblPr><a:noFill/><a:tableStyleId>{{23FF2375-F9B8-41A6-9E25-2D63B5D407DD}}</a:tableStyleId></a:tblPr>'
            f'<a:tblGrid>{grid}</a:tblGrid>{"".join(trs)}</a:tbl></a:graphicData></a:graphic></p:graphicFrame>')

def write_slide(n, shapes):
    p = f"{DECK}/ppt/slides/slide{n}.xml"
    s = open(p, encoding="utf8").read()
    a = s.index("</p:grpSpPr>") + len("</p:grpSpPr>")
    b = s.rindex("</p:spTree>")
    s = s[:a] + "".join(shapes) + s[b:]
    open(p, "w", encoding="utf8").write(s)
    print(f"slide{n}.xml written ({len(shapes)} shapes)")


# ═════════ slide12：六本木ミッドタウン店 単体事業収支 ═════════
sales = u("売上高")[0]
def pl_row(lab, key=None, kind="n"):
    v = u(key or lab)[0]
    return (kind, [lab, mm(v), pct(v / sales)])

left = [("h", ["項目", "金額", "対売上比"]),
        pl_row("売上高", kind="b"), pl_row("売上原価"), pl_row("人件費"), pl_row("業務委託費・消耗品他"),
        pl_row("部門利益", kind="b"), pl_row("広告宣伝費・販売促進費"), pl_row("その他経費"), pl_row("水道光熱費"),
        pl_row("GOP（店舗営業総利益）", kind="b"), pl_row("ロイヤリティ"), pl_row("保険・租税公課"),
        pl_row("地代家賃（固定）"), pl_row("歩合家賃"), pl_row("修繕維持費（FFE）"),
        pl_row("EBITDA", kind="b"), pl_row("減価償却費"), pl_row("営業利益", kind="b")]
yr = lambda lab: u(lab)[1:4]
eb, op, sl = yr("EBITDA"), yr("営業利益"), yr("売上高")
right = [("h", ["項目", "1年目", "2年目", "3年目以降"]),
         ("n", ["売上立上り率"] + [pct(x, 0) for x in u("立上り率")[1:4]]),
         ("n", ["売上高"] + [mm(x) for x in sl]),
         ("n", ["人件費率"] + [pct(a / b) for a, b in zip(yr("人件費"), sl)]),
         ("b", ["EBITDA"] + [mm(x) for x in eb]),
         ("b", ["EBITDA率"] + [pct(a / b) for a, b in zip(eb, sl)]),
         ("b", ["営業利益"] + [mm(x) for x in op]),
         ("b", ["営業利益率"] + [pct(a / b) for a, b in zip(op, sl)])]
lab_ratio = u("人件費")
pts12 = [
    f"● 席数{seats['all']}席（店内{seats['in']}：カウンター{seats['cnt']}・ダイニング{seats['din']}・個室{seats['pri']}／テラス{seats['ter']}）",
    f"● 客単価　ランチ {lunch:,.0f}円／カフェ {cafe:,.0f}円",
    f"　　　　　ディナー{din_in:,.0f}円（料理{din_food:,.0f}＋飲料{din_bev:,.0f}）・テラス{din_te:,.0f}円",
    f"● 席効率 店内{pct(eff_in, 0)}・テラス{pct(eff_te, 0)}／延べ席回転率 {turn_all:.2f}回/日",
    f"● 日商 約{day_sales / 10000:,.0f}万円／月商 約{mon_sales * 100:,.0f}万円／年商 {yr_sales / 100:.2f}億円",
    f"● 人員26名。売上原価{pct(u('売上原価')[0] / sales)}・人件費{pct(lab_ratio[0] / sales)}",
    "● ロイヤリティ4.0%・歩合家賃7%（閾値超過分）・地代家賃 月222万円",
    f"● 人件費は2年目{pct(lab_ratio[2] / u('売上高')[2])}→3年目{pct(lab_ratio[3] / u('売上高')[3])}へ段階改善（本部集中・多能工化）",
    ("● 内装1億円は家主立替・10年分割返済（資産計上・減価償却は自社）", "C00000", False),
]
write_slide(12, [
    title("六本木ミッドタウン店　単体事業収支"),
    subtitle(f"2026年10月 事業収支統合モデル準拠（最新平面図反映）　｜　183.59㎡(55.5坪)・{seats['all']}席・年間363日営業"),
    bar(0.48, 0.86, 4.35, "立上げ期間後100%ベース 損益計算（コスト改善前・百万円）"),
    table(0.48, 1.16, [2.15, 1.1, 1.1], left, rh=0.213),
    bar(5.27, 0.86, 4.25, "立上り・コスト改善を織り込んだ年次推移（百万円）"),
    table(5.27, 1.16, [1.45, 0.93, 0.93, 0.94], right, rh=0.215),
    bar(5.27, 3.00, 4.25, "主要前提"),
    bullets(5.35, 3.32, 4.15, 1.70, pts12, sz=700, ln=135000),
    footnote(f"※ 左表は売上100%（店内席効率{pct(eff_in, 0)}・ディナー回転率{S['E26'].value:.2f}回）に到達後も開業当初のコスト構造のままとした保守的な水準。"
             f"右表の3年目以降は人件費{pct(u('人件費')[0] / sales)}→{pct(u('人件費')[3] / u('売上高')[3])}・水道光熱{pct(u('水道光熱費')[0] / sales)}→{pct(u('水道光熱費')[3] / u('売上高')[3])}・"
             f"業務委託{pct(u('業務委託費・消耗品他')[0] / sales)}→{pct(u('業務委託費・消耗品他')[3] / u('売上高')[3])}の改善を織り込むため、売上は同額でもEBITDAが約{mm(u('EBITDA')[3] - u('EBITDA')[0])}百万円高い。金利・税金は含まない。", y=5.03),
    confidential(), slidenum()])


# ═════════ slide13：5か年事業計画 事業収支（連結） ═════════
def crow(lab, keys, kind="n"):
    vals = [sum(C[k][i] for k in keys) for i in range(5)]
    return (kind, [lab] + [mm(v) for v in vals])
sales5 = c("売上高")
ebr, opr = c("連結EBITDA"), c("営業利益")
cons = [("h", ["項目", "FY2027", "FY2028", "FY2029", "FY2030", "FY2031"]),
        ("b", ["期末店舗数"] + [str(x) for x in c("期末店舗数（店）")]),
        crow("売上高", ["売上高"], "b"), crow("売上原価", ["売上原価"]), crow("人件費", ["人件費"]),
        crow("業務委託費・消耗品他", ["業務委託費・消耗品他"]), crow("部門利益", ["部門利益"], "b"),
        crow("販促費・水道光熱費等", ["広告宣伝費・販売促進費", "その他経費", "水道光熱費"]),
        crow("GOP（店舗営業総利益）", ["GOP（店舗営業総利益）"], "b"),
        crow("ロイヤリティ", ["ロイヤリティ"]),
        crow("地代家賃・歩合家賃", ["地代家賃（固定）", "歩合家賃"]),
        crow("保険・租税公課・修繕費", ["保険・租税公課", "修繕維持費（FFE）"]),
        crow("店舗EBITDA計", ["店舗EBITDA 計"]), crow("本部費", ["本部費"]),
        crow("連結EBITDA", ["連結EBITDA"], "b"),
        ("b", ["EBITDA率"] + [pct(a / b) for a, b in zip(ebr, sales5)]),
        crow("減価償却費", ["減価償却費"]), crow("営業利益", ["営業利益"], "b"),
        ("b", ["営業利益率"] + [pct(a / b) for a, b in zip(opr, sales5)])]
FY = ["FY2027", "FY2028", "FY2029", "FY2030", "FY2031"]
def first_fy(series, th):
    for fy, a, b in zip(FY, series, sales5):
        if a / b > th: return fy, a / b
fy_e, r_e = first_fy(ebr, 0.10); fy_o, r_o = first_fy(opr, 0.05)
m_eb = u("EBITDA")[3] / u("売上高")[3]; m_op = u("営業利益")[3] / u("売上高")[3]
util = [u("水道光熱費")[i] / u("売上高")[i] for i in (0, 3)]
outs = [u("業務委託費・消耗品他")[i] / u("売上高")[i] for i in (0, 3)]
labr = [u("人件費")[i] / u("売上高")[i] for i in (0, 3)]
pts13 = [f"● 1号店はFY2027（開業初年度）から", "　 売上立上り90%で保守的に計上", "",
         f"● {fy_e}に連結EBITDA率10%超（{pct(r_e)}）", "",
         f"● {fy_o}に営業利益率5%超（{pct(r_o)}）", "",
         f"● FY2031はEBITDA率{pct(ebr[4] / sales5[4])}", f"　 営業利益率{pct(opr[4] / sales5[4])}", "",
         f"● 成熟単店はEBITDA率{pct(m_eb)}", f"　 営業利益率{pct(m_op)}"]
lev13 = [f"● 人件費 {pct(labr[0])} → {pct(labr[1])}", "　 本部集中化・多能工化",
         f"● 水道光熱 {pct(util[0])} → {pct(util[1])}", "　 設備運用の標準化",
         f"● 業務委託・消耗品 {pct(outs[0])} → {pct(outs[1])}"]
write_slide(13, [
    title("5か年事業計画　事業収支（連結）"),
    subtitle("2027年4月 六本木開業 → 2028年 札幌・大阪 → 2029年 首都圏・政令指定都市 → 2030年以降 リゾート含め年2店舗"),
    bar(0.48, 0.90, 6.15, "連結損益計画（百万円）"),
    table(0.48, 1.20, [1.95, 0.84, 0.84, 0.84, 0.84, 0.84], cons, rh=0.198),
    bar(6.90, 0.90, 2.62, "計画のポイント"),
    bullets(6.98, 1.22, 2.50, 2.40, pts13, sz=750, ln=120000),
    bar(6.90, 3.75, 2.62, "経費改善レバー"),
    bullets(6.98, 4.07, 2.50, 1.00, lev13, sz=750, ln=120000),
    footnote("※ FY＝4月〜3月。新店初年度は売上90%・開業7.5か月で保守的に計上。ロイヤリティ4%・歩合家賃7%・地代家賃は契約条件どおり全店適用。金利・税金は含まない。"),
    confidential(), slidenum()])


# ═════════ 画像（デザイナー資料）の埋め込み ═════════
import os, shutil
from PIL import Image, ImageChops

def trim(path):
    im = Image.open(path).convert("RGB")
    bg = Image.new("RGB", im.size, (255, 255, 255))
    diff = ImageChops.difference(im, bg).convert("L").point(lambda v: 255 if v > 18 else 0)
    box = diff.getbbox()
    if box:
        pad = 10
        box = (max(0, box[0] - pad), max(0, box[1] - pad), min(im.width, box[2] + pad), min(im.height, box[3] + pad))
        im = im.crop(box)
    return im

_media = [0]
def add_image(slide_no, src, out_name):
    """画像を ppt/media に置き、slideN.xml.rels に関係を追加して (rId, 幅/高さ比) を返す。"""
    im = trim(src)
    ext = os.path.splitext(out_name)[1].lower()
    dst = f"{DECK}/ppt/media/{out_name}"
    im.save(dst, quality=88) if ext == ".jpg" else im.save(dst)
    rels = f"{DECK}/ppt/slides/_rels/slide{slide_no}.xml.rels"
    r = open(rels, encoding="utf8").read()
    _media[0] += 1
    rid = f"rIdImg{_media[0]}"
    r = r.replace("</Relationships>",
                  f'<Relationship Id="{rid}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" '
                  f'Target="../media/{out_name}"/></Relationships>')
    open(rels, "w", encoding="utf8").write(r)
    ct = f"{DECK}/[Content_Types].xml"
    c_ = open(ct, encoding="utf8").read()
    mime = {".jpg": "image/jpeg", ".png": "image/png"}[ext]
    if f'Extension="{ext[1:]}"' not in c_:
        c_ = c_.replace("<Types ", "<Types ", 1).replace(
            "<Default ", f'<Default Extension="{ext[1:]}" ContentType="{mime}"/><Default ', 1)
        open(ct, "w", encoding="utf8").write(c_)
    return rid, im.width / im.height

def pic(rid, x, y, w, h, name="Picture"):
    i = nid()
    return (f'<p:pic><p:nvPicPr><p:cNvPr id="{i}" name="{name} {i}" descr="{name}"/><p:cNvPicPr><a:picLocks noChangeAspect="1"/></p:cNvPicPr><p:nvPr/></p:nvPicPr>'
            f'<p:blipFill><a:blip r:embed="{rid}"/><a:stretch><a:fillRect/></a:stretch></p:blipFill>'
            f'<p:spPr><a:xfrm><a:off x="{E(x)}" y="{E(y)}"/><a:ext cx="{E(w)}" cy="{E(h)}"/></a:xfrm>'
            f'<a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:ln w="6350"><a:solidFill><a:srgbClr val="E3C5B2"/></a:solidFill></a:ln></p:spPr></p:pic>')

def fit(ratio, max_w, max_h):
    w = max_w; h = w / ratio
    if h > max_h: h = max_h; w = h * ratio
    return w, h


# ═════════ slide26：店舗デザイン｜ロゴ・フロアプラン ═════════
rid_logo, r_logo = add_image(26, f"{IMG}/tm_logo.png", "tm_logo.png")
rid_plan, r_plan = add_image(26, f"{IMG}/tm_plan.jpg", "tm_plan.jpg")
pw, ph = fit(r_plan, 6.40, 4.12)
lw, lh = fit(r_logo, 1.70, 1.45)
seat_rows = [("h", ["エリア", "席数"]),
             ("n", ["カウンター（6）・ワインバー（3）", f"{seats['cnt']}席"]),
             ("n", ["ダイニング", f"{seats['din']}席"]),
             ("n", ["個室・半個室（12＋6＋4）", f"{seats['pri']}席"]),
             ("b", ["店内 計", f"{seats['in']}席"]),
             ("n", ["テラス", f"{seats['ter']}席"]),
             ("k", ["合計", f"{seats['all']}席"])]
write_slide(26, [
    title("店舗デザイン｜ブランドロゴ・フロアプラン"),
    subtitle(f"Notes Design Office 最新プラン（2026年10月22日）　｜　店内{seats['in']}席＋テラス{seats['ter']}席＝{seats['all']}席"),
    bar(0.48, 0.86, 2.45, "ブランドロゴ"),
    pic(rid_logo, 0.48 + (2.45 - lw) / 2, 1.20, lw, lh, "Brand logo"),
    bar(0.48, 2.85, 2.45, "席数構成（平面図より）"),
    table(0.48, 3.15, [1.80, 0.65], seat_rows, rh=0.215, sz=650),
    pic(rid_plan, 9.52 - pw, 0.86, pw, ph, "Floor plan"),
    footnote("※ 個室はオープン使用時6卓まで拡張可。平面図は実施設計前の計画図であり、変更となる可能性があります。事業収支は本平面図の席数で試算。", y=5.10),
    confidential(), slidenum()])


# ═════════ slide27：店舗イメージ（パース） ═════════
imgs = [("tm_sk_terrace.jpg", "テラス"), ("tm_sk_counter.jpg", "オープンキッチン・カウンター"), ("tm_sketch2.jpg", "ワインセラー・ダイニング")]
placed = [add_image(27, f"{IMG}/{f}", f) for f, _ in imgs]
gap = 0.15; avail = 9.04 - gap * 2
hh = min(avail / sum(r for _, r in placed), 2.45)
x = 0.48 + (9.04 - (hh * sum(r for _, r in placed) + gap * 2)) / 2
shapes27 = [title("店舗イメージ（パース）"),
            subtitle("「伝統と革新の共存」— パリのエスプリと日本の伝統が調和した cozy modern な空間"),
            ]
for (rid, r), (_, cap) in zip(placed, imgs):
    w = hh * r
    shapes27.append(pic(rid, x, 0.95, w, hh, cap))
    shapes27.append(textbox(x, 0.95 + hh + 0.05, w, 0.18, [para(run(cap, 700, GRAY), algn="ctr", bu_sz=700)]))
    x += w + gap
concept = [("● カラー：ニュートラル（ホワイト・グレー・ベージュ）に、真鍮・タイル・アートワークをアクセント", BLACK, False),
           ("● 素材：木・石・ラタン・真鍮など、職人の技術を感じる自然素材で温かみと上質さを両立", BLACK, False),
           ("● 家具：シンプル＆モダン　／　エレメント：アーチとグリーン（テラスのシンボルツリー）", BLACK, False)]
shapes27 += [bar(0.48, 3.78, 9.04, "デザインコンセプト｜cozy modern"),
             bullets(0.56, 4.10, 8.90, 0.90, concept, sz=750, ln=140000),
             footnote("※ Notes Design Office によるイメージスケッチ。実際の内装とは異なる場合があります。", y=5.10),
             confidential(), slidenum()]
write_slide(27, shapes27)


# ═════════ slide24：投資回収と資金計画（甲側7,000万円＋外部1.5億円） ═════════
contract, biz, prep, dep, wine = inv("契約金"), inv("事業費"), inv("開業準備金"), inv("保証金"), inv("ワイン")
total = [a + b + c_ + d + e for a, b, c_, d, e in zip(contract, biz, prep, dep, wine)]
def_in, def_ho = inv("分割対象：内装"), inv("分割対象：保証金")
split = [a + b for a, b in zip(def_in, def_ho)]
cash = [a - b for a, b in zip(total, split)]
f1 = lambda xs: [mm(x, 1) for x in xs]
invt = [("h", ["項目", "1号店", "2〜3号店", "4号店〜"]),
        ("n", ["契約金"] + f1(contract)),
        ("n", ["事業費（設計・内装施工・OSE/FF&E）"] + f1(biz)),
        ("n", ["　うち 内装 家主立替（10年分割返済）"] + f1([-x for x in def_in])),
        ("n", ["開業準備金（広告・採用等）"] + f1(prep)),
        ("n", ["保証金（非償却・返還対象）"] + f1(dep)),
        ("n", ["ワイン・美術品在庫（非償却）"] + f1(wine)),
        ("b", ["初期投資 合計"] + f1(total)),
        ("n", [f"分割対象額（内装{mm(def_in[0])}＋保証金{mm(def_ho[0], 1)}）"] + f1(split)),
        ("k", ["開業時 現金支出"] + f1(cash))]
cf = {k: I[k][:6] for k in ["EBITDA", "開業時 現金支出", "分割弁済", "単店FCF", "累計FCF"]}
dash = lambda v: "—" if abs(v) < 1e-9 else mm(v, 1)
cft = [("h", ["項目", "開業時", "1年目", "2年目", "3年目", "4年目", "5年目"]),
       ("n", ["EBITDA"] + [dash(x) for x in cf["EBITDA"]]),
       ("n", ["開業時 現金支出"] + [dash(x) for x in cf["開業時 現金支出"]]),
       ("n", ["分割弁済（内装＋保証金）"] + [dash(x) for x in cf["分割弁済"]]),
       ("b", ["単店FCF"] + [mm(x, 1) for x in cf["単店FCF"]]),
       ("b", ["累計FCF"] + [mm(x, 1) for x in cf["累計FCF"]])]
payback = I["投資回収年数（年）"][0]; turn_yr = I["累計FCFの黒字転換"][0]
ccf = [("h", ["項目"] + FY)]
for lab, key in [("投資キャッシュアウト", "投資キャッシュアウト 計"), ("連結EBITDA", "連結EBITDA"),
                 ("法人税等（推計）", "法人税等（推計）"), ("簡易フリーCF", "簡易フリーキャッシュフロー")]:
    ccf.append(("n", [lab] + [mm(x, 1) for x in I[key][1:6]]))
ccf.append(("b", ["累計フリーCF"] + [mm(x, 1) for x in I["累計フリーキャッシュフロー"][1:6]]))
need_open = I["開業時に必要な現金 小計"][0]; need_fy = I["FY2027末までに必要な資金 累計"][0]
need_5 = I["最大資金需要（累計FCFの最小値）"][0]
closed = I["確定分（甲側7,000万円＋田角様2,010万円）"][0]; pending = I["募集中（外部投資家の残額）"][0]
raise_t = I["調達額 計（ラウンド完了時）"][0]
gap_now = I["過不足（開業時点・確定分のみ）"][0]; gap_open = I["過不足（開業時点・ラウンド完了後）"][0]
gap_fy = I["過不足（FY2027末・ラウンド完了後）"][0]; gap_5 = I["過不足（5年・9店舗展開ベース）"][0]
assert abs(closed - need_open - gap_now) < 1e-6 and abs(raise_t - need_open - gap_open) < 1e-6
RED = "C00000"
fund = [("h", ["項目", "金額（万円）"]),
        ("n", ["① 1号店 開業時に必要な現金", man(need_open)]),
        ("n", ["② FY2027末までに必要な資金", man(need_fy)]),
        ("n", ["③ 5年・9店舗の最大資金需要", man(need_5)]),
        ("n", ["甲側出資（WineBank P3）", man(70)]),
        ("n", ["外部投資家（1,000株・ポスト4.5億円）", man(150)]),
        ("b", ["調達額 計", man(raise_t)]),
        ("n", ["　うち確定分（甲側7,000＋外部2,010）", man(closed)]),
        ("k", ["過不足　①開業時", man(gap_open, plus=True)]),
        ("n", ["過不足　②FY2027末", man(gap_fy, plus=True)]),
        ("b", ["過不足　③5年・9店舗（追加調達で対応）", man(gap_5)], {1: RED})]
write_slide(24, [
    title("投資回収と資金計画"),
    subtitle(f"開業時に必要な現金{man(need_open)}万円に対し、甲側7,000万円＋外部投資家1.5億円（ポスト4.5億円）の計{man(raise_t)}万円で調達"),
    bar(0.48, 0.86, 4.40, "初期投資（1店あたり・百万円）"),
    table(0.48, 1.16, [2.05, 0.78, 0.78, 0.79], invt, rh=0.19, sz=650),
    bar(0.48, 3.20, 4.40, "1号店 キャッシュフロー（百万円）"),
    table(0.48, 3.50, [1.36, 0.50, 0.50, 0.51, 0.51, 0.51, 0.51], cft, rh=0.19, sz=650),
    bullets(0.48, 4.70, 4.40, 0.20, [(f"● 開業{turn_yr}に累計FCFが黒字転換　／　投資回収 約{payback:.1f}年　／　定常期FCF {mm(cf['単店FCF'][5], 1)}百万円", BLACK, True)], sz=700, ln=115000),
    bar(5.12, 0.86, 4.40, "連結キャッシュフロー（百万円）"),
    table(5.12, 1.16, [1.40, 0.60, 0.60, 0.60, 0.60, 0.60], ccf, rh=0.19, sz=650),
    bar(5.12, 2.45, 4.40, "必要資金と調達"),
    table(5.12, 2.75, [3.25, 1.15], fund, rh=0.19, sz=650),
    footnote("※ 内装100百万円は家主立替（月833千円×120回）、保証金のうち38.9百万円は月463千円×84回の分割（賃貸借契約）。資産計上・減価償却は自社で継続。"
             "甲側出資は10月末5,500万円（立替経費のDESを含む）＋2月末までに1,500万円。運転資金は含まない。", y=4.98),
    confidential(), slidenum()])


# ═════════ slide28：出資リターン試算（1,000万円・ポスト4.5億円） ═════════
INVEST, PRICE, POST_SHARES = 1000, 15, 3000            # 万円, 万円/株, 株
share = INVEST / PRICE / POST_SHARES                     # 持分
NET = INVEST * 0.85                                      # 実質投資額（WINE GO資料と同じ基準）
e31 = c("連結EBITDA")[4]; op31 = c("営業利益")[4]; hq31 = c("本部費")[4]
run_eb = 9 * u("EBITDA")[3] - hq31; run_op = 9 * u("営業利益")[3] - hq31
landlord = I["うち 分割対象額"][6] + I["分割弁済額"][6]           # 家主分割払い残高
add_fund = -gap_5                                                 # 追加調達（借入想定）
debt = landlord + add_fund
deposits = dep[0] * 1 + dep[1] * 2 + dep[2] * 6                    # 差入保証金（1号店・2〜3号店・4号店〜6店）
ni_cum = C["営業利益"][5] + I["法人税等（推計）"][6]
book = raise_t + ni_cum                                           # 2031年度末 純資産（簿価）
def proceeds(eq): return max(0, eq) * share * 100                 # 百万円→万円
def cellv(p): return f"{man(p / 100)}（{p / INVEST:.1f}倍）"
ev5 = e31 * 5; eq5 = ev5 - debt + deposits; p5 = proceeds(eq5)
tax5 = max(0, p5 - INVEST) * 0.20315
bridge = [("h", ["項目（2031年・EBITDA 5倍）", "金額（億円）"]),
          ("n", [f"事業価値（EBITDA {e31 / 100:.2f}億円 × 5倍）", f"{ev5 / 100:.1f}"]),
          ("n", ["差引　家主への分割払い残高", f"▲{landlord / 100:.1f}"]),
          ("n", ["差引　追加調達（借入で調達した場合）", f"▲{add_fund / 100:.1f}"]),
          ("n", ["加算　差入保証金（退去時に返還）", f"＋{deposits / 100:.1f}"]),
          ("b", ["株式価値", f"{eq5 / 100:.1f}"]),
          ("k", [f"ご持分 {share * 100:.2f}% の売却金額", f"{man(p5 / 100)}万円"])]
m1 = [("h", ["① EBITDA倍率法", "4倍", "5倍", "6倍"]),
      ("n", ["2031年EBITDA基準"] + [cellv(proceeds(e31 * m - debt + deposits)) for m in (4, 5, 6)]),
      ("n", ["ランレート基準"] + [cellv(proceeds(run_eb * m - debt + deposits)) for m in (4, 5, 6)])]
m2 = [("h", ["② 年買法（純資産＋営業権）", "3年分", "4年分", "5年分"]),
      ("n", ["2031年営業利益基準"] + [cellv(proceeds(book + op31 * n)) for n in (3, 4, 5)]),
      ("n", ["ランレート基準"] + [cellv(proceeds(book + run_op * n)) for n in (3, 4, 5)])]
tax_pts = [(f"● プレシード・シード特例（優遇措置B）：出資額をその年の他の株式等の売却益から控除（税率約20%）。実質投資額は約{man(NET / 100)}万円（出資額の85%で試算）", BLACK, False),
           ("● 控除分は株式の取得価額から差し引かれず、実質非課税。売却益（売却額−出資額）には通常どおり約20%課税", BLACK, False),
           (f"● 上振れ余地：ランレート基準・6倍では約{man(proceeds(run_eb * 6 - debt + deposits) / 100)}万円、年買法・ランレート5年分では約{man(proceeds(book + run_op * 5) / 100)}万円", BLACK, False),
           (f"● 5倍・2031年基準：売却金額 約{man(p5 / 100)}万円 → 実質投資額に対し約{p5 / NET:.1f}倍、税引後手取り 約{man((p5 - tax5) / 100)}万円（年率 約{((p5 - tax5) / NET) ** 0.2 - 1:.0%}）", "6D3B1F", True)]
write_slide(28, [
    title("出資リターン試算（1,000万円ご出資の場合）"),
    subtitle(f"1株150,000円・ポスト4.5億円（発行済3,000株）　｜　ご持分 約{share * 100:.1f}%　｜　事業計画に基づく2031年売却時の試算"),
    bar(0.48, 0.86, 3.70, "株式価値の算出（方法①・基準ケース）"),
    table(0.48, 1.16, [2.75, 0.95], bridge, rh=0.215, sz=650),
    bar(4.42, 0.86, 5.10, "売却金額の試算（万円・括弧内は出資額に対する倍率）"),
    table(4.42, 1.16, [1.80, 1.10, 1.10, 1.10], m1, rh=0.235, sz=650),
    table(4.42, 1.98, [1.80, 1.10, 1.10, 1.10], m2, rh=0.235, sz=650),
    bullets(4.46, 2.78, 5.05, 0.40,
            [("ランレート：9店舗が出揃い全店が成熟した平常時の利益水準（Run Rate）。年買法：2031年度末の純資産（簿価）に営業利益の数年分を加算。", GRAY, False)],
            sz=600, ln=120000),
    bar(0.48, 3.30, 9.04, "プレシード・シード特例（優遇措置B）を活用した場合"),
    bullets(0.56, 3.62, 8.90, 1.30, tax_pts, sz=700, ln=150000),
    footnote("※ 計画値に基づく試算であり、将来のリターンを保証するものではありません。追加調達を増資で行う場合は持分が希薄化します。"
             "税制の適用可否・金額は税理士にご確認ください。", y=5.10),
    confidential(), slidenum()])
print(f"returns: share {share:.4%} EV5 {ev5:.1f} debt {debt:.1f} dep {deposits:.1f} eq5 {eq5:.1f} p5 {p5:.0f}万 book {book:.1f}")


# ═════════ slide11：店舗概要（文言の更新） ═════════
p11 = f"{DECK}/ppt/slides/slide11.xml"
s11 = open(p11, encoding="utf8").read()
for old, new in [
    ("<a:t>- ブーランジェリー：1,000-2,000円 -</a:t>", "<a:t>- アフタヌーンティー：3,000円前後 -</a:t>"),
    ("<a:t>総額3.5-4.0億円（2億調達済み）</a:t>", "<a:t>総額3.0-3.5億円</a:t>"),
    ("<a:t> 内装/設計/設備　   ：坪300万×80坪＝24,000万</a:t>", "<a:t> 内装/設計/設備　   ：坪350万×55坪＝約20,000万</a:t>"),
    ("<a:t> 物件保証金　　　   ：坪4万×80坪×12か月＝約4,000万</a:t>", "<a:t> 物件保証金　　　   ：約4,000万</a:t>"),
    ("<a:t> 備品/開業費ﾗｲｾﾝｽ等：約7,000万</a:t>", "<a:t> 備品/開業費ﾗｲｾﾝｽ等：約3,000万</a:t>"),
    ("<a:t>：1.8</a:t>", "<a:t>：1.5</a:t>"),
    ("<a:t>億円（外部投資家ポスト4.8億)</a:t>", "<a:t>億円（外部投資家ポスト4.5億）</a:t>"),
    ("<a:t>5年自動更新（10年以上想定）</a:t>", "<a:t>1号店開業から5年（合意により5年毎に延長可）</a:t>"),
    ("<a:t>80坪前後・賃料320万円/月以下 ※B・C工事負担相談</a:t>", f"<a:t>55-80坪前後（六本木：店内55.5坪・{seats['all']}席） ※B・C工事負担相談</a:t>"),
]:
    assert s11.count(old) == 1, old
    s11 = s11.replace(old, new)
open(p11, "w", encoding="utf8").write(s11)
print("slide11 updated")


# ═════════ slide29：その先へ… 国内オーベルジュ構想（事業計画には未反映） ═════════
def box(x, y, w, h, fill=None, line=None, lw=9525, paras=None, anchor="ctr", ins=0.06):
    i = nid()
    f = f'<a:solidFill><a:srgbClr val="{fill}"/></a:solidFill>' if fill else "<a:noFill/>"
    l = f'<a:ln w="{lw}"><a:solidFill><a:srgbClr val="{line}"/></a:solidFill></a:ln>' if line else "<a:ln><a:noFill/></a:ln>"
    tx = (f'<p:txBody><a:bodyPr wrap="square" lIns="{E(ins)}" tIns="{E(ins)}" rIns="{E(ins)}" bIns="{E(ins)}" anchor="{anchor}" anchorCtr="0"><a:noAutofit/></a:bodyPr>'
          f'<a:lstStyle/>{"".join(paras or [para("")])}</p:txBody>')
    return (f'<p:sp><p:nvSpPr><p:cNvPr id="{i}" name="Box {i}"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>'
            f'<p:spPr><a:xfrm><a:off x="{E(x)}" y="{E(y)}"/><a:ext cx="{E(w)}" cy="{E(h)}"/></a:xfrm>'
            f'<a:prstGeom prst="rect"><a:avLst/></a:prstGeom>{f}{l}</p:spPr>{tx}</p:sp>')

LIGHT = "F6EEE9"
pillars = [("料理", "一日十数名だけ", "その土地の生産者と、同じテーブルに"),
           ("ワイン", "ワイナリー隣接", "造り手の畑が、窓の外にある"),
           ("滞在", "温泉＋10室", "食後に、移動しなくていい")]
shapes29 = [title("その先へ… 滞在型体験｜国内オーベルジュ構想"),
            subtitle("ワイナリーに隣接し、温泉を持つ。日本にまだ無いオーベルジュをつくります"),
            box(6.55, 0.20, 2.97, 0.30, fill=None, line="C00000", lw=12700,
                paras=[para(run("本事業計画（5か年・9店舗）には未反映のアップサイド", 700, "C00000", True), algn="ctr", ln=100000)], ins=0.03)]
pw_ = (9.04 - 0.24) / 3
for k, (h1, big, sub) in enumerate(pillars):
    x = 0.48 + k * (pw_ + 0.12)
    shapes29 += [bar(x, 0.86, pw_, h1),
                 box(x, 1.10, pw_, 0.72, fill=LIGHT,
                     paras=[para(run(big, 1100, "6D3B1F", True), algn="ctr", ln=110000, bu_sz=1100),
                            para(run(sub, 750, BLACK), algn="ctr", ln=120000, bu_sz=750)])]
core = [("h", ["項目", "一般的なオーベルジュ", "当社が考えるオーベルジュ"]),
        ("n", ["立地", "景勝地・観光地に単独で建つ", "ワイナリーに隣接。造り手が徒歩圏にいる"]),
        ("n", ["ワイン", "地元ワインが中心", "グループ在庫（管理含む32億円）から、世界のファインワインを産地価格で"]),
        ("n", ["滞在", "宿泊機能のみ", "温泉を併設。地下に大型カーヴとワインバーも備える"]),
        ("n", ["運営", "オーナーシェフの個人事業", "グランメゾン「アピシウス」を擁する当社グループが担う"]),
        ("n", ["集客", "開業後に一から集める", "ワインマイルの交換先・会員イベントの舞台として、開業前から送客できる"])]
shapes29 += [bar(0.48, 2.00, 9.04, "構想の骨子"),
             table(0.48, 2.30, [1.00, 2.70, 5.34], core, rh=0.27, sz=700, rest_algn="l"),
             bullets(0.56, 4.08, 8.90, 0.80, [
                 ("● ブラッスリー出店計画（2027年4月 六本木 → 2028年 札幌・大阪 → 2030年〜 リゾート含め年2店舗）の先に着手。候補地：北海道", BLACK, False),
                 ("● 料理人が、一日の終わりまでお客様と過ごせる場所を。長い時間をかけて積み上げられたものを、更に発展させ次の世代へ渡す", "6D3B1F", True)],
                 sz=750, ln=150000),
             footnote("※ 構想段階のため、本資料の事業収支・資金計画・出資リターン試算には含めていません。WineBank会社紹介資料（2026年10月）より転載。", y=5.10),
             confidential(), slidenum()]
write_slide(29, shapes29)
