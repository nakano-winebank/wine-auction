# -*- coding: utf-8 -*-
"""WineBank redline (2026-11-20) on the TWW final review of 2026-11-18 (古橋修正).
11/18の古橋修正は第2条1項④（補充費用の負担）の1か所のみ。これに対称の一文を加え、
今回の当社修正箇所は先方が見つけやすいよう水色でハイライトする。
usage: python3 redline_20261120.py <unpacked 11/18 docx dir> <external|internal>
"""
import sys, copy, subprocess, re
from lxml import etree

SK = "/root/.claude/skills/synced/843eb632-0f1a-4cd1-8ff6-9c7a1257936c_e08a8281-da6b-45f5-9158-3c38a60baabf/docx"
W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
NS = {"w": W}
def q(t): return "{%s}%s" % (W, t)
XMLSPACE = "{http://www.w3.org/XML/1998/namespace}space"

AUTHOR = "WineBank"
DATE = "2026-11-20T09:00:00Z"
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

# =================================================================== EDITS (2026-11-20 版)
RPR_ORDER_AFTER_HIGHLIGHT = ("u", "effect", "bdr", "shd", "fitText", "vertAlign", "rtl", "cs", "em",
                             "lang", "eastAsianLayout", "specVanish", "oMath", "rPrChange")
def highlight(ins, color="cyan"):
    """mark every run inside our insertion with a highlight so the counterparty can spot it"""
    for r in ins.iter(q("r")):
        rpr = r.find(q("rPr"))
        if rpr is None:
            rpr = etree.Element(q("rPr")); r.insert(0, rpr)
        for h in rpr.findall(q("highlight")): rpr.remove(h)
        h = etree.Element(q("highlight")); h.set(q("val"), color)
        nxt = next((c for c in rpr if c.tag in [q(t) for t in RPR_ORDER_AFTER_HIGHLIGHT]), None)
        if nxt is not None: nxt.addprevious(h)
        else: rpr.append(h)

# ---- 2条1項④：甲側の責めに帰すべき破損・紛失は甲負担（乙側と対にする）
e12 = ins_after(P[12], "乙の負担と", "し、甲又は甲の従業員の責めに帰すべき破損・紛失は甲の負担と")
highlight(e12)
C(EXT, "承知しました。補充費用の負担割合を料金表で定め、定めがない間は折半とする整理に異存ございません。"
       "乗客への給仕は原則として貴社の従業員にご担当いただくため（第2条3項）、貴社側の責めに帰すべき破損・紛失は貴社のご負担とする旨を、"
       "弊社側の定めと対にして追記させていただきました（水色ハイライト部分）。", None, parent=131)
C(INT, "古橋先生の11/18修正で、補充費用は「料金表で定める割合、定めがない間は折半、当社側の責めによるものは当社負担」となりました。"
       "中野邦人さんの「F&B事業損益から負担」は、分かりにくいとの理由で書き換えられています。折半を初期値とすることは、原価利益載せ方式で先方も小売の利益を得る以上、妥当と考えます。"
       "ただし先方案は当社側の責任だけを定めた片務的な書き方で、給仕は先方従業員が主体（第2条3項）のため破損の多くは先方側で起こり得ます。そこで甲側の責任を対にして追記しました。",
  lambda: (e12, e12))
C(INT, "11/18版で先方が修正したのは第2条1項④の1か所のみで、11/14に当社が送った修正（1条4項の許認可・トラブル、2条10項の3万円、別紙1の2点）は"
       "先方から異論なく残っています。前回までに挙げた法務上の論点（賠償上限なし、保険証書の交付が当社のみ、在庫買取義務なし、成果物の終了後使用、契約期間1年、"
       "遅延損害金なし、丙【AM】未特定、印紙）は引き続き手当てされていません。先方は合意後すぐUMITO様へ展開する予定のため、最終確認の機会は今回が実質最後です。",
  lambda: (find_run(P[0], "F&B業務委託契約書"),)*2)

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
