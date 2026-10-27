# -*- coding: utf-8 -*-
"""WineBank redline of F&B業務委託契約書 (2026-09-22 version) on top of existing TWW-side revisions.
usage: python3 redline.py <unpacked_dir> <external|internal>
"""
import sys, copy, subprocess, re
from lxml import etree

SK = "/root/.claude/skills/synced/843eb632-0f1a-4cd1-8ff6-9c7a1257936c_e08a8281-da6b-45f5-9158-3c38a60baabf/docx"
W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
NS = {"w": W}
def q(t): return "{%s}%s" % (W, t)
XMLSPACE = "{http://www.w3.org/XML/1998/namespace}space"

AUTHOR = "WineBank"
DATE = "2026-10-27T09:00:00Z"
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

# =================================================================== EDITS (2026-10-27 版)
# 10/27 中野邦人様の方針：①②原価利益載せ方式／③人数別のスタッフ帯同と最低売上
# あわせて、メールで訂正された事実（電源9kW、セラーM58本、コールドテーブル1,500mm、パナソニック製オーブン、
# 食器は改装費、10分は桟橋利用申請上の制約）を反映する。
MAIL = "10/27付メール"

# ---- 別紙 → 別紙１
ins_after(P[4], "甲が別紙", "１")
ins_after(P[6], "甲は、別紙", "１")
ins_after(P[89], "（別紙", "１")

# ---- 第1条3項: 提携先は乙の常設在庫・備品を使わない
e_p5 = ins_after(P[5], "原状回復を遵守させる",
    "とともに、乙の在庫（ワインセラー内の飲料を含む。）及び乙が持ち込んだ備品を使用させない")
C(EXT, "常設セラーは58本と限られるため、提携先による当社在庫の誤使用を防ぐ趣旨です。", lambda: (e_p5, e_p5))

# ---- 第1条4項: 提携プランでも飲料は乙から
e_p6 = ins_after(P[6], "乙に通知して協議する。",
    "なお、提携プランにおいても、酒類その他の飲料は、甲乙が別途合意する場合を除き、乙から調達するものとする。")
C(EXT, MAIL + "7.のとおり、SUSHI-BAR-CRUISE等とのメニュー・顧客の棲み分けには賛同いたします。"
       "そのうえで、BARクルーズ等の提携プランで提供される酒類は当社から供給させていただければと存じます。", lambda: (e_p6, e_p6))
C(INT, "第1条2〜4項（古橋さん追記）で提携プランは本件業務の対象外になり、4項は「通知して協議」のみで甲が提携プランを追加できます。"
       "原価利益載せ方式では当社が卸さない飲食から収益は生じないため、提携プランの飲料供給（今回追記）が収益確保の要です。",
  lambda: (find_run(P[4], "２．前項に"),)*2)

# ---- 第2条1項④: 食器・グラスは改装費で調達
e_p12 = ins_after(P[12], "にあたるものとする）",
    "。なお、食器、カトラリー及びグラスは本船舶の改装費により調達するものとし、陸上での洗浄・保管の分担は甲乙協議の上運用細則において定める。"
    "航行中の揺れに起因するこれらの破損は通常の損耗として取り扱う")
C(EXT, "9/25に、船内備品（調理器具・食器類）は改装費の中で手配いただけると伺いましたので、その前提で記載しました。"
       "船内に洗浄スペースがないため、船内での片付けと陸上での洗浄の分担は運用細則で定めさせてください（" + MAIL + "5.）。",
  lambda: (e_p12, e_p12))

# ---- 第2条1項⑦: ライトプラン（ケータリング）
p7 = new_para_after(P[14], "   ⑦ ライトプラン（ケータリング事業者が調理した料理を船内に搬入し提供するプランをいう。以下同じ。）に係るケータリング事業者の選定、手配及び品質管理")
C(EXT, "10/1にご確認いただいた「ライトプラン」をケータリングとして業務範囲に明記しました。", lambda: (p7.find(q("ins")),)*2)

# ---- 第2条3項: 人数別の帯同ルールと最低売上（中野邦人様 10/27 方針）
p3a = new_para_after(P[17], "　前段にかかわらず、乙による出張シェフ及びサービススタッフの帯同は、次の各号のとおりとする。", ppr_from=P[17], rpr_from=P[17])
p3b = new_para_after(p3a, "⑴　乗船人数が１０名未満の場合、乙はケータリングの搬入のみを行い、サービススタッフを帯同しない。但し、甲乙協議の上、ワイン等の注文見込みに応じて、乙はサービススタッフを帯同させることができる。", ppr_from=P[22], rpr_from=P[22])
p3c = new_para_after(p3b, "⑵　乗船人数が１０名以上の場合、甲は、出張シェフ１名及びサービススタッフ１名が帯同するプラン、又はケータリングの搬入のみを行いサービススタッフ１名以内が帯同するプランのいずれかを選択する。", ppr_from=P[22], rpr_from=P[22])
p3d = new_para_after(p3c, "⑶　前二号により出張シェフ又はサービススタッフ（以下「帯同者」という。）が帯同する場合、当該運航に係る乙の甲に対する税抜売上（第４条に基づき乙が甲に請求する金額をいう。）は、帯同者１名につき１２万５千円（２名の場合は２５万円）を下限とし、これに満たない場合、乙はその差額を最低料金として甲に請求することができる。", ppr_from=P[22], rpr_from=P[22])
C(EXT, MAIL + "3.の内容を反映しました。", lambda: (p3a.find(q("ins")), p3d.find(q("ins"))))
C(INT, "⑶の下限は出張シェフを含む帯同者1名あたりで数えます（中野さん確認済み。シェフ＋サービス＝25万円、ケータリング＋サービス1名＝12.5万円）。"
       "⑶の「差額を最低料金として請求」は、中野さんの方針（1名あたり最低売上12.5万円）を条文にするための当方の書き方です。"
       "メールでは「帯同人数の調整または最低料金の設定についてご相談」と柔らかく書いています。差額請求まで求めるか、帯同人数の調整にとどめるかご判断ください。"
       "なお当社スタッフが給仕する回は、第6条1項但書（甲の給仕上の過失は甲の責任）の前提が変わり、給仕に起因する事故は当社責任になり得ます。",
  lambda: (p3d.find(q("ins")),)*2)

# ---- 第2条5項: 再委託の包括同意・現場責任者
e19a = ins_after(P[19], "再委託はできないものとする。",
    "但し、乙が事前に甲に通知した出張シェフ及びケータリング事業者（以下「登録事業者」という。）への再委託については、甲の書面による同意があったものとみなす。")
ins_after(P[19], "なお、出張シェフ", "及びケータリング事業者")
ins_after(P[19], "当該シェフ", "等")
ins_after(P[19], "乙が指定する現場責任者に対して行う。",
    "乙は、出張シェフ又はサービススタッフが乗船する運航ごとに現場責任者（出張シェフ又はサービススタッフが兼ねることができる。）を指名し、事前に甲に通知する。")
C(EXT, "出張シェフ・ケータリング事業者は運航ごとに入れ替わるため、事前にお知らせした事業者は包括同意とさせてください。", lambda: (e19a, e19a))
C(EXT, "ご指摘のとおりと考えます。運航ごとの現場責任者の指名・事前通知を追記しました。", None, parent=45)
C(INT, "偽装請負の整理（甲はシェフに直接指揮命令しない）は当社にもプラスなので受け入れでよいと考えます。"
       "個人の出張シェフ・サービススタッフとの取引はフリーランス保護法の対象（取引条件の書面明示、受領後60日以内の支払等）です。",
  lambda: (find_run(P[19], "出張シェフに対し直接の指揮命令"),)*2)

# ---- 第2条7項⑵: 10分ルールは維持し、係留地での事前積込みを追加
e23 = ins_after(P[23], "終えること。",
    "なお、甲は、可能な限り係留地において出航前に食材・飲料等を積み込む機会を乙に提供し、連続運航時の搬入手順は甲乙協議の上定める。")
C(EXT, "桟橋利用申請上の制約である旨承知しました。10分以内の搬入を前提とし、係留地（夢の島マリーナ）での事前積込みの可否と、"
       "連続運航時の手順をご相談させてください（" + MAIL + "5.）。", lambda: (e23, e23))

# ---- 第2条8項（設備・電力）・9項（提供形式）
p8 = new_para_after(P[24],
    "８　甲は、本船舶に設置される厨房設備（電源設備、給排水設備、冷蔵・冷凍設備及びワインセラーを含み、その仕様は別紙２に定める。以下「本件設備」という。）"
    "を提供し、その維持・修繕を行う。乙は、本件設備の電源容量（既存約９ｋＷ。重負荷時の最大想定需要は約１２ｋＷ）を前提としてメニュー及び調理工程を設計し、"
    "甲は、乙の調理時における空調その他の電力使用の調整に協力する。本件設備の故障、電源容量の不足又は電源の遮断に起因する飲食の提供不能又は品質の低下について乙は責任を負わず、"
    "これらに起因して船内に常設する乙の在庫に生じた損害は甲が負担する。", ppr_from=P[21])
p9 = new_para_after(p8,
    "９　乗船人数が１０名以上の場合、料理は大皿により提供することを原則とする。乙が飲食を提供する乗船人数の上限は、"
    "立食形式の場合を含め原則として２０名とし、これを超える場合は甲乙協議の上定める。", ppr_from=P[21])
C(EXT, "9/9のご連絡のとおり既存の電気容量は約9kW、スチームオーブン使用時の最大想定は約12kWのため、その前提を記載しました。"
       "高級・希少ワインは都度搬入とするため（" + MAIL + "6.）、在庫損害の負担は船内に常設する分に限定しています。",
  lambda: (p8.find(q("ins")),)*2)
C(EXT, "10/1の合意事項（10名以上は大皿提供、スタンディングで最大20名）を反映しました。", lambda: (p9.find(q("ins")),)*2)

# ---- 第4条（見出し）: コーディネーションフィーを削除
delete(P[29], "、コーディネーションフィー")

# ---- 第4条1項: 料金表添付・予約システム・発注期限
e30a = ins_after(P[30], "定める「料金表」", "（本契約締結時に別紙３として添付する。）")
e30b = ins_after(P[30], "個別の契約が成立するものとする。",
    "なお、甲乙丙が合意する予約システム上で行われる注文の確定は、個別発注書の交付とみなす。個別発注書の交付期限は、"
    "ライトプランについては乗船日の７日前、出張シェフが船内で調理を行うプランについては乗船日の１４日前とする。"
    "乙は、期限経過後の発注については、受託を拒否し、又はライトプランへの変更を提案することができる。")
C(EXT, "10月下旬の金額確定にあわせ、料金表を締結時に添付できればと存じます。", lambda: (e30a, e30a))
C(EXT, "10/1に整理した「船は3日前、料理は1週間前または2週間前」に沿って記載しました（" + MAIL + "4.）。", lambda: (e30b, e30b))

# ---- 第4条2項: キャンセル・不可抗力
replace(P[31], "発生した実費の処理については甲乙協議により決定するものとする。",
    "顧客の都合による場合は、乙に既に発生した実費（他に転用できない食材及びケータリングの仕入費用、出張シェフ等に対するキャンセル費用その他料金表に定める費用をいい、"
    "酒類その他転用可能な飲料を除く。）を甲が負担する。天候不順・自然災害等の不可抗力による場合は、前項の交付期限前の中止については双方負担なしとし、"
    "交付期限後の中止により乙に発生した実費は甲乙が折半して負担する。なお、行政機関の甲に対する処分又は事故に起因する運航停止は、甲の責めに帰すべき事由によるものとみなす。")
C(EXT, "顧客都合の実費はお客様からのキャンセル料でご回収いただく前提です。不可抗力は締切前なら双方負担なし、締切後の実費は折半とご提案します。"
       "お客様向けのキャンセルポリシー（天候欠航時の扱い）があればご教示ください（" + MAIL + "4.）。", None, parent=150)
C(INT, "吉田さんご指摘の4条2項（雨天等の負担割合）は、締切前＝負担なし、締切後＝折半、で文言化しました。"
       "10/22にTWWが他船接触で行政の「警告」を受けているため、行政処分・事故による停止は甲の帰責と明記しています。",
  lambda: (find_run(P[31], "行政機関の指示による場合"),)*2)

# ---- 第4条3項: コーディネーションフィー → 原価利益載せ方式（全文差し替え）
delete_live(P[32])
e32 = append_ins(P[32],
    "3. 乙が甲に対して卸売販売を行う料理（ケータリングを含む。）の卸売価格は、乙の利益を含めて料金表に定める。"
    "乙が甲に対して卸売販売を行うワインその他の酒類及び飲料の卸売価格は、乙の仕入原価に乙の利益を加えた卸値に、"
    "甲乙協議の上銘柄又はプランごとに料金表に定める販売想定額（消費税等を除く。）の10％に相当する金額を加算した額とする。"
    "販売想定額は、甲乙協議の上、原則として６か月ごとに見直す。卸売価格には別途消費税等を加算する。", rpr_src=P[30])
C(EXT, MAIL + "1.2.のとおり、原価利益載せ方式に変更しました。これに伴い、売上の10%のコーディネーションフィーと、そのための売上のご報告は不要になります。",
  lambda: (e32, e32))
C(EXT, "原価利益載せ方式への変更により、売上の10%の計算は不要となりました。卸売価格は料金表に基づき月次で請求いたします。", None, parent=163)
C(EXT, "卸売価格は税抜で定め、別途消費税を加算いたします（本文末尾に追記）。", None, parent=170)
C(INT, "原価利益載せ方式の留意点：①販売想定額が実売価格に近ければ経済性は従来の「売上の10%」と同等ですが、甲が想定より高く売った分の上乗せは取れません（6か月見直しで補正）。"
       "②当社が卸さない飲食からは収益ゼロ（提携プランの飲料供給が重要）。③会員利用時に当社がUMITOへ払う予定だった「10%の半分（5%）」（9/21中野陽一郎様）の計算基礎が変わるため、UMITOとの別途合意の見直しが必要です。"
       "④第4条3項の書き換えは他契約との整合確認（UMITO・TMI）が必要と村松様・陽一郎様が言っています。",
  lambda: (e32, e32))

# ---- 第4条4項: 請求期限・コーディネーションフィー削除
delete_exact(P[33], "及び", occ=1)
delete(P[33], "コーディネーションフィー")
replace(P[33], "［●］", "５")
replace(P[33], "翌月３営業日までに", "請求と同時に")
C(EXT, "月次締めの事務を考慮し、5営業日とさせてください。", lambda: (find_run(P[33], "５", exact=True),)*2)
C(INT, "支払遅延時の遅延損害金の定めがありません。年14.6%程度の追加を求めるかご判断ください。",
  lambda: (find_run(P[33], "翌月末日までに"),)*2)

# ---- 第5条4項: 持込禁止
p54 = new_para_after(P[38],
    "4.　甲は、乗客による飲食物（酒類を含む。）の持込みを原則として認めないものとする。甲が例外的に持込みを認める場合は、"
    "料金表に定める持込料を収受するものとし、その甲乙間の分配は料金表に定める。", ppr_from=P[37], rpr_from=P[37])
C(EXT, "10/1確認事項「持ち込みなしを基本」を反映しました。", lambda: (p54.find(q("ins")),)*2)
C(INT, "第5条の独禁法の整理（最終販売価格は甲が決定）は、当社が卸売業者である以上妥当で、受け入れてよいと考えます。"
       "原価利益載せ方式でも販売想定額は卸売価格の算定基礎にすぎず、甲の販売価格を拘束しないため整合します。",
  lambda: (find_run(P[36], "最終的な販売価格は甲が決定"),)*2)

# ---- 第8条3項: 解約予告期間
replace(P[50], "●", "３")
C(EXT, "原田社長のご意見に合わせて3か月としました。UMITO様との再裸傭船契約の解約予告期間をご教示いただければ整合を確認します。", None, parent=250)
C(INT, "固定費（年約2,100万円）と初期投資の観点では6か月が望ましいですが、相手方意見に合わせ3か月で実務案としています。"
       "第8条2項（補償なし自動終了）と在庫買取義務なし（下記）が重なる点にご留意ください。",
  lambda: (find_run(P[50], "３", exact=True),)*2)

# ---- 別紙２・別紙３（10/8付厨房図・メールで確定した仕様）
last = PARAS[-1]
heading_src = P[89]; item_src = P[92]
sp1 = new_para_after(last, "", ppr_from=item_src, rpr_from=item_src)
a = new_para_after(sp1, "（別紙２）", ppr_from=heading_src, rpr_from=heading_src)
b = new_para_after(a, "厨房設備一覧", ppr_from=P[91], rpr_from=P[91])
c = new_para_after(b, "１　ワインセラー（ユーロカーブ インスピレーション Mサイズ／ビルトイン・58本収容）", ppr_from=item_src, rpr_from=item_src)
d = new_para_after(c, "２　コールドテーブル（2枚扉／幅1,500mm）", ppr_from=item_src, rpr_from=item_src)
e = new_para_after(d, "３　コンベクションオーブン（パナソニック製）", ppr_from=item_src, rpr_from=item_src)
f = new_para_after(e, "４　その他シンク、冷凍ストッカー等", ppr_from=item_src, rpr_from=item_src)
g = new_para_after(f, "５　電源容量：既存約9kW（重負荷時の最大想定需要は約12kW。オーブン使用時は空調等の同時使用を抑制する。）", ppr_from=item_src, rpr_from=item_src)
h = new_para_after(g, "※ 各機器の仕様・寸法は、2026年10月8日付厨房図（ヨシザトデザイン作成）による。", ppr_from=item_src, rpr_from=item_src)
sp2 = new_para_after(h, "", ppr_from=item_src, rpr_from=item_src)
i_ = new_para_after(sp2, "（別紙３）", ppr_from=heading_src, rpr_from=heading_src)
j = new_para_after(i_, "料金表", ppr_from=P[91], rpr_from=P[91])
k = new_para_after(j, "※ 10月下旬の金額確定後に添付する（料理の卸売価格、ワイン等の卸値及び販売想定額、サービススタッフの帯同に係る取扱い、持込料、キャンセル費用を含む。）。", ppr_from=item_src, rpr_from=item_src)
C(EXT, "10/1のご提案資料（吉里様）と10/8の厨房図更新（コールドテーブル幅1,500mm・2枚扉、オーブンはパナソニック製で進行）に基づき記載しました。",
  lambda: (a.find(q("ins")), h.find(q("ins"))))

# ---- 別紙１（原田社長追記）: 乗合BARクルーズ
C(EXT, "乗合による販売促進の趣旨には賛同します。BARクルーズで提供する酒類は当社から供給させていただけないでしょうか（第1条4項に追記）。"
       "また「等」の範囲を特定いただけると助かります。", lambda: (find_run(P[103], "やBARクルーズ"),)*2)

# ---- その他
C(EXT, "一般配置図上の船名は「WATERWAYSⅢ」です。表記統一をお願いいたします。", None, parent=2)

# =================================================================== INTERNAL (legal / risk)
C(INT, "本ファイルは社内確認用です。相手方への送付には、【社内】コメントを含まない「送付版」をお使いください。"
       "修正履歴（著者 WineBank）は両ファイルで同一です。なお10/3版の社内確認版は、10/3 16:28のメールで村松様・中野陽一郎様に送信されているため、"
       "当時の社内コメント（落としどころ等）は先方に伝わっている前提でお考えください。丙（AM）は引き続き【AM】のまま未特定で、3者契約の当事者が確定していません。"
       "また本契約は印紙税法上の第7号文書（継続的取引の基本となる契約書・4,000円）に該当する可能性があるため、要確認です。",
  lambda: (find_run(P[0], "F&B業務委託契約書"),)*2)
C(INT, "【最重要】賠償上限が依然ありません。古橋さん修正で補償対象が「甲側関係者（船主、UMITO等の関係各社）」と定義されましたが、"
       "「等」で開いたままです。前回の要望（上限＝直近12か月の受領対価総額またはPL保険填補限度額、間接損害・逸失利益の除外）は反映されていません。"
       "実務修正の範囲を超えるため履歴には入れていません。吉田さんの判断で文言を入れるかご検討ください。",
  lambda: (find_run(P[41], "これをすべて補償し"),)*2)
C(INT, "甲が加入すべき保険（船舶保険・船客賠償責任保険等）の証書提示が相互になっていません。当社にだけ証書交付義務があります。"
       "CF表ではGK②レベルで船舶保険等22年分4,400万円を計上済みなので、相互化を求めても相手の負担は小さいはずです。",
  lambda: (find_run(P[42], "保険証書の写しを甲に交付する"),)*2)
C(INT, "第8条2項（再裸傭船契約の終了で補償なく自動終了）は前回要望から変更なしです。"
       "さらに古橋さんが下段で「在庫の買取義務を負わない」を新設しており、終了時に当社が初期投資（約1,500万円）と船専用のワイン在庫を抱える構造が強まっています。",
  lambda: (find_run(P[49], "得べかりし利益の補填"),)*2)
C(INT, "在庫買取義務なし（古橋さん新設）への対案：「再裸傭船契約の終了又は甲の都合による解約（第3項）の場合、甲は乙の在庫のうち"
       "本船舶向けに調達したものを仕入価格で買い取る」。乙の債務不履行による解除の場合のみ買取義務なし、とするのが落としどころと考えます。",
  lambda: (find_run(P[64], "在庫の買取義務を負わない"),)*2)
C(INT, "知財：成果物の権利は当社帰属で良い一方、甲が「本契約終了後も」無償で使用できるため、終了後に別のF&B事業者が当社のメニュー・レシピで運営できる建て付けです"
       "（古橋さんコメント「メニューについては使用継続を許可いただきたく」）。写真・説明文の継続使用は許容しつつ、"
       "レシピ・メニュー構成の終了後使用は不可、とする線引きをご検討ください。返答は吉田さんの判断に委ねるため送付版には入れていません。",
  lambda: (find_run(P[66], "本契約終了後も"),)*2)
C(INT, "許認可の主体が未整理です。①乗客に販売するのは甲なので、船内での飲食提供に係る営業許可・食品衛生責任者は甲側で要確認。"
       "②当社は甲への酒類卸売の立場です。料飲店向け販売は一般酒類小売業免許で可能ですが、販売場の範囲と免許条件"
       "（通信販売酒類小売業免許のみでは不可）が当社の現免許で足りるかご確認ください。",
  lambda: (find_run(P[28], "必要な許認可を取得し"),)*2)
C(INT, "契約期間は1年のままです（前回は初回3年を要望）。料金表の確定とあわせて再度求めるかご判断ください。",
  lambda: (find_run(P[48], "本契約締結日から1年間とする"),)*2)

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
