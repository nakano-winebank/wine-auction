# -*- coding: utf-8 -*-
"""WineBank redline (2026-11-13) on the TWW return of 2026-11-05 (古橋弁護士加筆版).
古橋先生の11/5修正（著者「将 古橋」）は残したまま、著者 WineBank で修正履歴とコメント（返信）を追加する。
usage: python3 redline_20261113.py <unpacked 11/5 docx dir> <external|internal>
"""
import sys, copy, subprocess, re
from lxml import etree

SK = "/root/.claude/skills/synced/843eb632-0f1a-4cd1-8ff6-9c7a1257936c_e08a8281-da6b-45f5-9158-3c38a60baabf/docx"
W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
NS = {"w": W}
def q(t): return "{%s}%s" % (W, t)
XMLSPACE = "{http://www.w3.org/XML/1998/namespace}space"

AUTHOR = "WineBank"
DATE = "2026-11-13T09:00:00Z"
DIR, VARIANT = sys.argv[1], sys.argv[2]
DOCPATH = DIR + "/word/document.xml"

tree = etree.parse(DOCPATH)
root = tree.getroot()
body = root.find(q("body"))
PARAS = list(body.iter(q("p")))          # fixed index snapshot (matches render.py P#)
_id = [5000]
def nid():
    _id[0] += 1
    return str(_id[0])

def mark(tag):
    e = etree.Element(q(tag))
    e.set(q("id"), nid()); e.set(q("author"), AUTHOR); e.set(q("date"), DATE)
    return e

def run_text(r):
    return "".join(t.text or "" for t in r.findall(q("t")))

def in_del(el):
    a = el.getparent()
    while a is not None:
        if a.tag == q("del"): return True
        a = a.getparent()
    return False

def find_run(p, text, occ=0, exact=False):
    hits = []
    for r in p.iter(q("r")):
        if in_del(r): continue
        s = run_text(r)
        if (s == text) if exact else (text in s):
            hits.append(r)
    if len(hits) <= occ:
        raise SystemExit("ANCHOR NOT FOUND in para: %r\n  para text: %s" % (text, "".join(x.text or "" for x in p.iter(q("t")))[:200]))
    return hits[occ]

def make_run(rpr, text, deleted=False):
    r = etree.Element(q("r"))
    if rpr is not None:
        rp = copy.deepcopy(rpr)
        for bad in rp.findall(q("rStyle")): rp.remove(bad)
        r.append(rp)
    t = etree.SubElement(r, q("delText" if deleted else "t"))
    t.text = text
    t.set(XMLSPACE, "preserve")
    return r

def split(r, start, end):
    """Split run r into [0:start] [start:end] [end:] ; returns middle run (in place)."""
    s = run_text(r)
    rpr = r.find(q("rPr"))
    parts = [(s[:start], False), (s[start:end], True), (s[end:], False)]
    parent = r.getparent(); idx = parent.index(r)
    # keep non-text children (e.g. lastRenderedPageBreak) on the first piece only
    extras = [c for c in r if c.tag not in (q("rPr"), q("t"))]
    new = []
    for i, (txt, is_mid) in enumerate(parts):
        if not txt: continue
        nr = make_run(rpr, txt)
        if i == 0 and extras:
            for e in extras: nr.insert(1, copy.deepcopy(e))
        new.append((nr, is_mid))
    parent.remove(r)
    mid = None
    for k, (nr, is_mid) in enumerate(new):
        parent.insert(idx + k, nr)
        if is_mid: mid = nr
    return mid

def isolate(p, text, occ=0, exact=False):
    r = find_run(p, text, occ, exact)
    s = run_text(r); i = s.index(text)
    if i == 0 and len(text) == len(s): return r
    return split(r, i, i + len(text))

def foreign_ins(el):
    par = el.getparent()
    return par if par.tag == q("ins") else None

def split_container_after(r):
    """r sits inside someone else's <w:ins>. Split that container so r is its last child.
    Returns (container) — new content can be placed right after it."""
    cont = r.getparent()
    after = list(cont)[cont.index(r) + 1:]
    if after:
        clone = etree.Element(cont.tag, dict(cont.attrib))
        clone.set(q("id"), nid())
        for a in after: clone.append(a)
        cont.addnext(clone)
    return cont

def place_after(el, new):
    """Insert `new` after run `el`, hopping out of a foreign <w:ins> if needed."""
    if foreign_ins(el) is not None:
        cont = split_container_after(el)
        cont.addnext(new)
    else:
        el.addnext(new)

def ins_after(p, anchor, text, occ=0, exact=False, skip_comment_tail=False):
    r = isolate(p, anchor, occ, exact)
    rpr = r.find(q("rPr"))
    ins = mark("ins"); ins.append(make_run(rpr, text))
    target = r
    if skip_comment_tail:
        # hop over a following commentRangeEnd + reference run
        nxt = target.getnext() if foreign_ins(target) is None else None
        while nxt is not None and (nxt.tag == q("commentRangeEnd") or
                                   (nxt.tag == q("r") and nxt.find(q("commentReference")) is not None)):
            target = nxt; nxt = nxt.getnext()
        target.addnext(ins)
    else:
        place_after(target, ins)
    return ins

def delete(p, text, occ=0):
    r = isolate(p, text, occ)
    for t in r.findall(q("t")):
        t.tag = q("delText"); t.set(XMLSPACE, "preserve")
    d = mark("del")
    r.addprevious(d); d.append(r)      # nesting <w:del> inside a foreign <w:ins> is valid OOXML
    return d

def delete_exact(p, text, occ=0):
    r = find_run(p, text, occ, exact=True)
    for t in r.findall(q("t")):
        t.tag = q("delText"); t.set(XMLSPACE, "preserve")
    d = mark("del"); r.addprevious(d); d.append(r)
    return d

def delete_live(p):
    """track-delete every visible run in paragraph p (runs inside foreign <w:ins> get a nested <w:del>)"""
    runs = [r for r in p.iter(q("r")) if not in_del(r) and r.findall(q("t"))]
    for r in runs:
        for t in r.findall(q("t")):
            t.tag = q("delText"); t.set(XMLSPACE, "preserve")
        d = mark("del"); r.addprevious(d); d.append(r)
    return runs

def append_ins(p, text, rpr_src=None):
    base = None
    for r in (rpr_src if rpr_src is not None else p).iter(q("r")):
        if r.find(q("rPr")) is not None and r.find(q("commentReference")) is None:
            base = r.find(q("rPr")); break
    ins = mark("ins"); ins.append(make_run(base, text)); p.append(ins)
    return ins

def replace(p, old, new, occ=0):
    d = delete(p, old, occ)
    r = d[0]; rpr = r.find(q("rPr"))
    ins = mark("ins"); ins.append(make_run(rpr, new))
    if d.getparent().tag == q("ins"):          # deleting inside someone else's insertion
        cont = split_container_after(d)
        cont.addnext(ins)
    else:
        d.addnext(ins)
    return ins

def new_para_after(ref, text, ppr_from=None, rpr_from=None):
    src = ppr_from if ppr_from is not None else ref
    p = etree.Element(q("p"))
    ppr = copy.deepcopy(src.find(q("pPr"))) if src.find(q("pPr")) is not None else etree.Element(q("pPr"))
    rp = ppr.find(q("rPr"))
    if rp is None:
        rp = etree.SubElement(ppr, q("rPr"))
    for c in list(rp):
        if c.tag in (q("ins"), q("del")): rp.remove(c)
    rp.insert(0, mark("ins"))
    p.append(ppr)
    rsrc = rpr_from if rpr_from is not None else src
    base = None
    for r in rsrc.iter(q("r")):
        if r.find(q("rPr")) is not None and r.find(q("commentReference")) is None:
            base = r.find(q("rPr")); break
    ins = mark("ins"); ins.append(make_run(base, text)); p.append(ins)
    ref.addnext(p)
    return p

# ----------------------------------------------------------------- comments
COMMENTS = []   # (cid, text, anchor_fn, parent)
_cid = [900]
def comment(text, where, parent=None):
    _cid[0] += 1
    COMMENTS.append((_cid[0], text, where, parent))

def top(el):
    """climb to the child of the paragraph (or of ins container) that holds el"""
    while el.getparent().tag not in (q("p"),):
        el = el.getparent()
    return el

def wrap_markers(first, last, cid):
    s = etree.Element(q("commentRangeStart")); s.set(q("id"), str(cid))
    e = etree.Element(q("commentRangeEnd")); e.set(q("id"), str(cid))
    ref = etree.Element(q("r"))
    rpr = etree.SubElement(ref, q("rPr")); st = etree.SubElement(rpr, q("rStyle")); st.set(q("val"), "aff0")
    cr = etree.SubElement(ref, q("commentReference")); cr.set(q("id"), str(cid))
    top(first).addprevious(s)
    t = top(last); t.addnext(e); e.addnext(ref)

def reply_markers(parent_id, cid):
    s0 = root.find(".//w:commentRangeStart[@w:id='%s']" % parent_id, NS)
    e0 = root.find(".//w:commentRangeEnd[@w:id='%s']" % parent_id, NS)
    r0 = root.find(".//w:commentReference[@w:id='%s']" % parent_id, NS).getparent()
    s = etree.Element(q("commentRangeStart")); s.set(q("id"), str(cid)); s0.addnext(s)
    e = etree.Element(q("commentRangeEnd")); e.set(q("id"), str(cid)); e0.addnext(e)
    ref = etree.Element(q("r"))
    rpr = etree.SubElement(ref, q("rPr")); st = etree.SubElement(rpr, q("rStyle")); st.set(q("val"), "aff0")
    cr = etree.SubElement(ref, q("commentReference")); cr.set(q("id"), str(cid))
    r0.addnext(ref)

P = PARAS
EXT, INT = "ext", "int"
def C(kind, text, where=None, parent=None):
    if kind == INT and VARIANT != "internal": return
    if kind == INT: text = "【社内・吉田さん確認】" + text
    comment(text, where, parent)

# =================================================================== EDITS (2026-11-13 版)
# 古橋先生11/5修正への対応。大半は受け入れ、以下のみ当社修正：
#  ①2条1項④ 食器・カトラリー・グラス等の消耗品は乙負担（11/4 中野陽一郎様ご連絡）
#  ②2条10項 高級・希少ワインの金額基準 ●→3万円
#  ③別紙1 アマン東京：酒類はアマン提供を受け入れつつ、三者合意時は乙が供給できる余地
#  ④別紙1 SUSHI-BAR-CRUISE等の提携期間を「通年（実施頻度は週1回程度）」に
# 古橋先生のコメントID: 3船名 60(1条4項) 105(改装費) 296(2条8項) 317(希少ワイン) 417(4条2項整理)
#                     741(アマン) 757(提携期間) 797/798(別紙の説明文)
YS = "11/4の中野社長のご連絡"

# ---- ① 2条1項④
delete(P[12], "、食器、カトラリー及びグラス")
e12 = ins_after(P[12], "、", occ=1, exact=True,
    text="食器、カトラリー及びグラスその他の消耗品は乙の費用により調達するものとし（乙は、その費用を料金表に定める卸売価格に含めることができる。）、")
C(EXT, "承知しました。" + YS + "のとおり、厨房設備・ワインセラーは改装工事でご対応いただき、食器・カトラリー・グラス等の消耗品は"
       "弊社のF&B収支の中で手配いたしますので、その旨に修正しました。調理器具はご修正のとおりとさせてください。", None, parent=105)
C(INT, "陽一郎さんの11/4メールで、グラス・カトラリー等は造船TKの範囲外（F&B収支で負担）と明言されたため、当社負担と明記しました。"
       "当社の試算（初期投資1,500万円＝什器・食器・グラス・初期ワイン在庫）はこの前提で組んでおり、収支計画との齟齬はありません。"
       "所有権は当社に残るため、契約終了時は引き揚げられます。費用は料金表の卸売価格で回収する建付けにしています。",
  lambda: (e12, e12))

# ---- ② 2条10項
replace(P[32], "●", "３")
C(EXT, "ご提案のとおり価格で定めることとし、3万円としました。", None, parent=317)
C(INT, "3万円は仮置きです。セラー（58本又は36本）の容量と、都度搬入の手間（当日搬入は当社負担）のバランスで決めてください。"
       "古橋先生の加筆で「甲が都度搬入を希望するもの」も当社が当日搬入することになり、搬入の手間が増える点にご留意ください。",
  lambda: (find_run(P[32], "３", exact=True),)*2)

# ---- ③ 別紙1 アマン東京
e111 = ins_after(P[111], "しない", exact=True,
    text="。但し、甲、乙及びアマン東京が合意した場合は、乙は当該提携プランにおいて酒類を供給することができる")
C(EXT, "アマン東京様のプランでは酒類もアマン様がご提供される点、承知しました。ペアリング企画等で弊社のワインをご用意できる場面もあるかと存じますので、"
       "三者で合意した場合に弊社から供給できる余地を残させていただけますと幸いです。", None, parent=741)
C(INT, "古橋先生の加筆で、アマン東京のプランは第1条4項（提携プランの酒類は当社から）の対象外になりました。"
       "原田様の11/3回答はSUSHI-BAR・BOAT-BARの酒類供給にのみ触れており、アマンは当初から想定外だった可能性があります。"
       "酒類の販売機会としては最大の提携先が外れるため、但し書きで合意時の供給余地だけ残しました。受け入れか、さらに押すかご判断ください。",
  lambda: (e111, e111))

# ---- ④ 別紙1 提携期間
ins_after(P[114], "（提携期間）", "通年（実施頻度は")
e114 = ins_after(P[114], "1回程度", "）")
C(EXT, "ご指摘を踏まえ、期間は「通年」、頻度は「週1回程度」と書き分ける案としました。原田様にご確認いただけますと幸いです。", None, parent=757)

# ---- 返信のみ
C(EXT, "承知しました。", None, parent=60)
C(EXT, "承知しました。", None, parent=296)
C(EXT, "承知しました。説明文は契約の別紙とは別に、別途の資料で策定いただく形で異存ございません。", None, parent=798)

# =================================================================== INTERNAL
C(INT, "本ファイルは社内確認用です。相手方への送付には【社内】コメントのない「送付版」をお使いください。"
       "11/5古橋先生版の修正（条番号の全角化、2条7項②の「合理的な理由」「可能な範囲で」、2条8項の当社無責条件・仕入価格上限、"
       "4条2項の号立て、6条の「合理的な弁護士費用」・帰責割合など）は受け入れ、当社修正は4点（2条1項④、2条10項、別紙1×2）に絞りました。"
       "前回までに挙げた法務上の論点は先方修正でも手当てされていません：賠償上限なし（6条2項）、保険証書の交付が当社のみ（6条3項）、"
       "終了時の在庫買取義務なし（8条8項）、成果物の終了後使用（8条の2）、契約期間1年、遅延損害金の定めなし、丙【AM】未特定、印紙（第7号文書）。"
       "送るかどうかは吉田さんのご判断でお願いします。",
  lambda: (find_run(P[0], "F&B業務委託契約書"),)*2)
C(INT, "2条3項③（帯同1名あたり税抜12.5万円の下限・差額請求）は、古橋先生のレビューでも修正が入っていません。この内容で受け入れられた形です。",
  lambda: (find_run(P[22], "差額を最低料金"),)*2)
C(INT, "古橋先生の加筆（当社に帰責事由がある場合は免責しない、在庫損害は仕入価格が上限）は、相当な範囲で受け入れてよいと考えます。",
  lambda: (find_run(P[30], "乙の仕入価格を上限とする。", exact=True),)*2)

# =================================================================== write + comments
for cid, text, where, parent in COMMENTS:
    if parent is not None:
        reply_markers(parent, cid)
    else:
        first, last = where()
        wrap_markers(first, last, cid)
tree.write(DOCPATH, xml_declaration=True, encoding="UTF-8", standalone=True)
for cid, text, where, parent in COMMENTS:
    args = ["python3", SK + "/scripts/comment.py", DIR, text, "--id", str(cid), "--author", AUTHOR, "--initials", "WB"]
    if parent is not None: args += ["--parent", str(parent)]
    out = subprocess.run(args, capture_output=True, text=True)
    if out.returncode != 0:
        raise SystemExit(out.stderr or out.stdout)
# stamp our comment dates consistently
cp = DIR + "/word/comments.xml"
cx = open(cp, encoding="utf-8").read()
cx = re.sub(r'(<w:comment w:id="9\d\d" w:author="WineBank" w:date=")[^"]*', r'\g<1>' + DATE, cx)
open(cp, "w", encoding="utf-8").write(cx)
print(VARIANT, "edits ok; comments:", len(COMMENTS), "last ins/del id:", _id[0])
