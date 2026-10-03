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
DATE = "2026-10-03T09:00:00Z"
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

# =================================================================== EDITS
# ---- 別紙 → 別紙１ (a second and third schedule are added at the end)
ins_after(P[4], "甲が別紙", "１")
ins_after(P[6], "甲は、別紙", "１")
ins_after(P[89], "（別紙", "１")

# ---- 第1条3項: 提携先は乙の在庫・備品を使わない
e_p5 = ins_after(P[5], "原状回復を遵守させる",
    "とともに、乙の在庫（ワインセラー内の飲料を含む。）及び乙が持ち込んだ備品を使用させない")
C(EXT, "ワインセラーの容量が限られ、連続運航時は90分で最大12本程度を消費する想定です（10/1お打合せ）。"
       "提携先による当社在庫の誤使用を防ぐため、明記させてください。", lambda: (e_p5, e_p5))

# ---- 第1条4項: 提携プランでも飲料は乙から
e_p6 = ins_after(P[6], "乙に通知して協議する。",
    "なお、提携プランにおいても、酒類その他の飲料は、甲乙が別途合意する場合を除き、乙から調達するものとする。")
C(EXT, "10/1のお打合せで「ライトプランを採用し、飲み物で単価を取る」方針を確認しました。"
       "提携プラン（別紙１）でも酒類・飲料は当社から供給させていただければと思います。"
       "アマン東京様など既存の取決めで飲料の調達先が決まっているものがあれば、ご教示ください。", lambda: (e_p6, e_p6))
C(INT, "第1条2〜4項（古橋さん追記）で提携プランが本件業務・フィーの対象外になり、4項は「通知して協議」のみで"
       "甲が提携プランを追加できます。別紙１の乗合プラン（週1回程度＝年約50運航）だけでも、フィー基礎から外れます。"
       "最低限、①飲料は当社供給（今回追記）、②新規提携プランは乙の同意事項、のいずれかは確保したいところです。"
       "②は実務の範囲を超えるため、今回は①のみ修正履歴に入れています。", lambda: (find_run(P[4], "２．前項に"),)*2)

# ---- 第2条1項④: 食器・グラス
e_p12 = ins_after(P[12], "にあたるものとする）",
    "。なお、食器、カトラリー及びグラスの調達・費用負担並びに陸上での洗浄・保管の方法は料金表において定めるものとし、"
    "航行中の揺れに起因するこれらの破損は通常の損耗として取り扱う")
C(EXT, "10/1確認事項：20名×5皿で100枚、2回転分として160枚程度を用意し、船内に洗浄・保管スペースがないため外部保管とする運用。"
       "グラス40〜50脚は揺れによる破損対策（樹脂製・専用箱）を検討中です。調達負担と洗浄・保管は料金表で定めたいと考えます。",
  lambda: (e_p12, e_p12))

# ---- 第2条1項⑦: ライトプラン（ケータリング）
p7 = new_para_after(P[14], "   ⑦ ライトプラン（ケータリング事業者が調理した料理を船内で盛付・提供するプランをいう。以下同じ。）に係るケータリング事業者の選定、手配及び品質管理")
C(EXT, "10/1合意事項「お皿問題を解消するためにライトプランを採用」を反映しました。人気ケータリング上位3社を当社でリストアップ中です。",
  lambda: (p7.find(q("ins")),)*2)

# ---- 第2条5項: 再委託の包括同意・現場責任者
e19a = ins_after(P[19], "再委託はできないものとする。",
    "但し、乙が事前に甲に通知した出張シェフ及びケータリング事業者（以下「登録事業者」という。）への再委託については、甲の書面による同意があったものとみなす。")
ins_after(P[19], "なお、出張シェフ", "及びケータリング事業者")
ins_after(P[19], "当該シェフ", "等")
e19b = ins_after(P[19], "乙が指定する現場責任者に対して行う。",
    "乙は、出張シェフが乗船する運航ごとに現場責任者（出張シェフ本人が兼ねることができる。）を指名し、事前に甲に通知する。")
C(EXT, "出張シェフ・ケータリング事業者は運航ごとに入れ替わるため、事前にお知らせした事業者については包括同意とさせてください。",
  lambda: (e19a, e19a))
C(EXT, "ご指摘のとおりと考えます。運航ごとの現場責任者の指名・事前通知を追記しました。"
       "少人数のライトプランでシェフが乗船しない回は、甲の従業員による提供のみとなる想定です。", None, parent=45)
C(INT, "偽装請負の整理（甲はシェフに直接指揮命令しない）は当社にもプラスなので受け入れでよいと考えます。"
       "あわせて、個人の出張シェフとの取引はフリーランス保護法の対象（取引条件の書面明示、受領後60日以内の支払等）です。"
       "甲からの入金が翌月末のため、シェフへの支払サイトとの資金繰りをご確認ください。",
  lambda: (find_run(P[19], "出張シェフに対し直接の指揮命令"),)*2)

# ---- 第2条7項⑵: 搬入時間 10分 → 出航前30分
replace(P[23], "１０分とする", "出航前［３０］分間を確保するものとし、連続運航時の入替えを含め具体的な時間は甲乙協議の上定める")
C(EXT, "2時間間隔・各90分のダイヤでは、運航間の入替え時間は30分です。連続運航時はワイン最大12本程度、"
       "20名×5皿分の食器の入替えが生じるため（10/1確認）、10分での搬入は難しいと考えます。［ ］内は協議事項です。",
  lambda: (find_run(P[23], "出航前［３０］分間"),)*2)

# ---- 第2条8項（設備・電力）・9項（提供形式）
p8 = new_para_after(P[24],
    "８　甲は、本船舶に設置される厨房設備（電源設備、給排水設備、冷蔵・冷凍設備及びワインセラーを含み、その仕様は別紙２に定める。以下「本件設備」という。）"
    "を提供し、その維持・修繕を行う。乙は、本件設備の電源容量（最大約１２ｋＷ）を前提としてメニュー及び調理工程を設計し、甲は、乙の調理時における"
    "空調その他の電力使用の調整に協力する。本件設備の故障、電源容量の不足又は電源の遮断に起因する飲食の提供不能又は品質の低下について乙は責任を負わず、"
    "これらに起因して乙の在庫に生じた損害は甲が負担する。", ppr_from=P[21])
p9 = new_para_after(p8,
    "９　乗船人数が１０名を超える場合、料理は大皿（シェアスタイル）により提供することを原則とする。乙が飲食を提供する乗船人数の上限は、"
    "立食形式の場合を含め原則として２０名とし、これを超える場合は甲乙協議の上定める。", ppr_from=P[21])
C(EXT, "10/1確認事項：発電機容量は最大12kW超で、重負荷の機器使用時はエアコンを切る等の運用が必要です。"
       "厨房機器はプランA（業務用IH）／プランB（家庭用IH・100V）をシェフのフィードバック後1週間以内に決定し、別紙２に記載します。"
       "第2条1項④で食材・飲料の保管・温度管理が当社業務となったため、設備起因の場合の責任分界を明確にさせてください。",
  lambda: (p8.find(q("ins")),)*2)
C(EXT, "10/1合意事項（10名超は大皿提供、スタンディングで最大20名）を反映しました。",
  lambda: (p9.find(q("ins")),)*2)
C(INT, "8項後段（設備起因の在庫損害は甲負担）は、古橋さん追記の第2条1項④（保管・温度管理は乙）と第6条1項但書の除外"
       "（乙の本件業務の範疇は甲の責任から除く）の組み合わせで、セラー故障や電源遮断時のワイン毀損が当社負担になる穴を塞ぐ趣旨です。"
       "後段の削除を求められた場合の落としどころは「甲の帰責事由による場合は甲負担」です。",
  lambda: (p8.find(q("ins")),)*2)

# ---- 第4条1項: 料金表添付・予約システム・リードタイム
e30a = ins_after(P[30], "定める「料金表」", "（本契約締結時に別紙３として添付する。）")
e30b = ins_after(P[30], "個別の契約が成立するものとする。",
    "なお、甲乙丙が合意する予約システム上で行われる注文の確定は、個別発注書の交付とみなす。個別発注書の交付期限は料金表に定めるところによるものとし、"
    "出張シェフが船内で調理を行うプランについては乗船日の［１４］日前、ライトプランについては乗船日の３日前を原則とする。"
    "乙は、期限経過後の発注については、受託を拒否し、又はライトプランへの変更を提案することができる。")
C(EXT, "10月下旬の金額確定にあわせ、料金表を締結時に添付できればと思います。", lambda: (e30a, e30a))
C(EXT, "10/1確認事項：船の予約は3日前まで、料理の注文は1週間前または2週間前とし、予約システム（UMITO様と共同開発中）に組み込む方針。"
       "［１４］は7日との選択が未確定のためブラケットとしています。予約システム上の注文確定をもって発注とみなしたいと考えます。",
  lambda: (e30b, e30b))

# ---- 第4条2項: キャンセル時の実費
replace(P[31], "発生した実費の処理については甲乙協議により決定するものとする。",
    "この場合（顧客の都合による場合を含む。）、乙に既に発生した実費（他に転用できない食材・飲料の仕入費用、出張シェフ等に対するキャンセル費用その他料金表に定める費用をいう。）"
    "は甲が負担するものとし、天候不順・自然災害等による場合の負担割合その他の取扱いは甲乙協議により決定するものとする。")
C(EXT, "クルーズ船の性質上、天候等の例外を設けることに異論はありません。他方、シェフ調理プランは乗船日の［14］日前に食材手配・シェフ確保を行うため、"
       "転用できない実費は甲にご負担いただき、顧客からのキャンセル料で回収いただく形をご提案します。天候等の場合の負担割合は協議としました。",
  None, parent=150)

# ---- 第4条3項: 決済フロー・消費税
e32a = ins_after(P[32], "飲食部分の金額とする。",
    "会員利用において丙又は株式会社UMITOが会員から飲食代金を収受する場合も、当該飲食に係る売上は甲が計上したものとみなす。")
ins_after(P[32], "金額", "（消費税等別途）", exact=True, skip_comment_tail=True)
C(EXT, "10/1のお打合せで、会員利用時にUMITO様が顧客に請求し手数料控除後に支払う方式も話題に上がりました。"
       "決済フローがどうなっても、フィーの基礎となる売上が変わらないようにさせてください。", lambda: (e32a, e32a))
C(EXT, "月次で、甲の当月計上F&B売上（税抜）×10%を、個別発注ごとの明細とあわせて請求する想定です。", None, parent=163)
C(EXT, "税抜売上の10%に、別途消費税を加算する想定です（本文に「消費税等別途」を追記しました）。", None, parent=170)
C(INT, "フィー基礎が古橋さん追記で「乙が調達又は手配に関与した飲食に限る」「チャータープランは料金表の飲食部分」に絞られました。"
       "持込禁止（第5条4項）と提携プランの飲料供給（第1条4項）を入れないと、フィーが空洞化します。"
       "なおCF表『一般販売チャーター価格』シートでは同じ10%が投資家配分になっており、CF表側の修正が未確認です。",
  lambda: (find_run(P[32], "乙が調達"),)*2)

# ---- 第4条4項: 請求期限
replace(P[33], "［●］", "５")
C(EXT, "月次締めの事務を考慮し、5営業日とさせてください。", lambda: (find_run(P[33], "５", exact=True),)*2)
C(INT, "支払遅延時の遅延損害金の定めがありません。年14.6%程度の追加を求めるかご判断ください（実務上は無くても回る範囲）。",
  lambda: (find_run(P[33], "翌月末日までに"),)*2)

# ---- 第5条4項: 持込禁止（P37の段落記号は古橋さんが削除済みのため、空行P38の後に入れる）
p54 = new_para_after(P[38],
    "4.　甲は、乗客による飲食物（酒類を含む。）の持込みを原則として認めないものとする。甲が例外的に持込みを認める場合は、"
    "料金表に定める持込料を収受するものとし、当該持込料は前条第3項のF&B関連の売上に含まれるものとする。", ppr_from=P[37], rpr_from=P[37])
C(EXT, "10/1確認事項「持ち込みなしを基本」を反映しました。", lambda: (p54.find(q("ins")),)*2)
C(INT, "第5条の独禁法の整理（最終販売価格は甲が決定）は、当社が甲への卸売業者である以上、法的には古橋さんの指摘が妥当で、"
       "受け入れてよいと考えます。商業的には、甲が値引きするとフィー（売上の10%）が目減りするため、持込禁止と最低保証額で補う方針です。",
  lambda: (find_run(P[36], "最終的な販売価格は甲が決定"),)*2)

# ---- 第8条3項: 解約予告期間
replace(P[50], "●", "３")
C(EXT, "原田社長のご意見に合わせて3か月としました。UMITO様との再裸傭船契約の解約予告期間をご教示いただければ、整合を確認します。",
  None, parent=250)
C(INT, "前回レビューでは、統括マネージャー等の固定費（年約2,100万円）と初期投資から6か月を推奨しました。"
       "相手方の意見に合わせ3か月で実務案としていますが、第8条2項（再裸傭船契約終了で補償なしの自動終了）と、"
       "新設の在庫買取義務なし（下記）と合わさると、3か月予告で初期投資と在庫を抱えたまま終了しうる点にご留意ください。",
  lambda: (find_run(P[50], "３", exact=True),)*2)

# ---- 別紙２・別紙３
last = PARAS[-1]
heading_src = P[89]; item_src = P[92]
sp1 = new_para_after(last, "", ppr_from=item_src, rpr_from=item_src)
a = new_para_after(sp1, "（別紙２）", ppr_from=heading_src, rpr_from=heading_src)
b = new_para_after(a, "厨房設備一覧", ppr_from=P[91], rpr_from=P[91])
c = new_para_after(b, "１　ワインセラー（ユーロカーブ Sタイプ）", ppr_from=item_src, rpr_from=item_src)
d = new_para_after(c, "２　冷蔵庫（3枚扉／幅1,800×高さ1,100×奥行600mm）", ppr_from=item_src, rpr_from=item_src)
e = new_para_after(d, "３　IHクッキングヒーター（プランA：業務用・パナソニック製／プランB：家庭用・リンナイ製100V のいずれか）", ppr_from=item_src, rpr_from=item_src)
f = new_para_after(e, "４　その他シンク、冷凍ストッカー、コールドテーブル等（改装図面に基づき確定）", ppr_from=item_src, rpr_from=item_src)
g = new_para_after(f, "５　電源容量：発電機 最大約12kW", ppr_from=item_src, rpr_from=item_src)
h = new_para_after(g, "※ 厨房機器はシェフの確認を経て確定のうえ記載する。", ppr_from=item_src, rpr_from=item_src)
sp2 = new_para_after(h, "", ppr_from=item_src, rpr_from=item_src)
i_ = new_para_after(sp2, "（別紙３）", ppr_from=heading_src, rpr_from=heading_src)
j = new_para_after(i_, "料金表", ppr_from=P[91], rpr_from=P[91])
k = new_para_after(j, "※ 10月下旬の金額確定後に添付する（食材・飲料の卸売価格、シェフ人件費、ライトプラン単価、持込料、キャンセル費用、食器等の負担区分を含む。）。", ppr_from=item_src, rpr_from=item_src)
C(EXT, "10/1確認事項：厨房機器プランA/Bはシェフ側のフィードバックを得て1週間以内に決定、10月下旬に金額確定。確定次第差し替えます。",
  lambda: (a.find(q("ins")), h.find(q("ins"))))

# ---- 別紙１（原田社長追記）: 乗合BARクルーズ
C(EXT, "乗合による販売促進の趣旨には賛同します。週1回程度の乗合クルーズは本件業務の対象外となるため、"
       "BARクルーズで提供する酒類は当社から供給させていただけないでしょうか（第1条4項に追記）。"
       "また「等」の範囲を特定いただけると助かります。", lambda: (find_run(P[103], "やBARクルーズ"),)*2)

# ---- その他の実務コメント
C(EXT, "一般配置図上の船名は「WATERWAYSⅢ」です。表記統一をお願いいたします。", None, parent=2)
C(EXT, "10月24日の上級会員招待イベントは本契約の締結前となる見込みです。当日のF&Bは、個別発注書により本契約の条件を準用する形でよろしいでしょうか。",
  lambda: (find_run(P[84], "2026年"),)*2)

# =================================================================== INTERNAL (legal / risk)
C(INT, "本ファイルは社内確認用です。相手方への送付には、【社内】コメントを含まない「送付版」をお使いください。"
       "修正履歴（著者 WineBank）は両ファイルで同一です。丙（AM）は引き続き【AM】のまま未特定で、3者契約の当事者が確定していません。"
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
