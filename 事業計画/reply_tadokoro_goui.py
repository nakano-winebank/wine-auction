# -*- coding: utf-8 -*-
"""田角様（株式会社Land＆Company）側の合意書修正案（20261030 PB）への当社回答版を作る。

先方の変更履歴はすべて承諾した状態にし、その上に当社（株式会社WineBank）の修正と
【WB：…】の回答を変更履歴で入れる。

使い方:
  python3 reply_tadokoro_goui.py <unpacked>/word/document.xml
  （事前に unzip → merge_runs.py を実行しておく）
"""
import re, sys

PATH = sys.argv[1]
AUTHOR = "株式会社WineBank"
DATE = "2026-10-31T00:00:00Z"
xml = open(PATH, encoding="utf-8").read()
counter = [8000]
done, missing = [], []

def esc(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

def _locate(old):
    """old を含む <w:t> を探し、その run の開始・終了と text 内位置を返す。"""
    for m in re.finditer(r"<w:t(?:\s[^>]*)?>((?:(?!</w:t>).)*)</w:t>", xml, re.S):
        if old in m.group(1):
            rs = max(xml.rfind("<w:r>", 0, m.start()), xml.rfind("<w:r ", 0, m.start()))
            re_ = xml.find("</w:r>", m.end()) + len("</w:r>")
            return m, rs, re_
    return None

def _split(m, rs, re_, old, repl_parts):
    """run を old の前後で分割し、old を repl_parts（XML 断片）に置き換える。"""
    global xml
    run = xml[rs:re_]
    rtag = re.match(r"<w:r(?:\s[^>]*)?>", run).group(0)
    pm = re.search(r"<w:rPr>.*?</w:rPr>", run, re.S)
    rpr = pm.group(0) if pm else ""
    text = m.group(1)
    i = text.index(old)
    before, after = text[:i], text[i + len(old):]
    pre_inner = run[len(rtag):m.start() - rs]
    post_inner = run[m.end() - rs:len(run) - len("</w:r>")]
    parts = []
    head = pre_inner + (f'<w:t xml:space="preserve">{before}</w:t>' if before else "")
    if head.strip() and (before or "<w:t" in pre_inner):
        parts.append(f"{rtag}{head}</w:r>")
    parts.extend(p.format(rtag=rtag, rpr=rpr) for p in repl_parts)
    tail = (f'<w:t xml:space="preserve">{after}</w:t>' if after else "") + post_inner
    if after or "<w:t" in post_inner:
        parts.append(f"{rtag}{rpr}{tail}</w:r>")
    xml = xml[:rs] + "".join(parts) + xml[re_:]

def ins_xml(text):
    counter[0] += 1
    return (f'<w:ins w:id="{counter[0]}" w:author="{AUTHOR}" w:date="{DATE}">'
            f'{{rtag}}{{rpr}}<w:t xml:space="preserve">{esc(text)}</w:t></w:r></w:ins>')

def del_xml(text):
    counter[0] += 1
    return (f'<w:del w:id="{counter[0]}" w:author="{AUTHOR}" w:date="{DATE}">'
            f'{{rtag}}{{rpr}}<w:delText xml:space="preserve">{esc(text)}</w:delText></w:r></w:del>')

def keep_xml(text):
    return f'{{rtag}}{{rpr}}<w:t xml:space="preserve">{esc(text)}</w:t></w:r>'

def replace(old, new, label):
    loc = _locate(old)
    if not loc: missing.append(label); return
    _split(*loc, old, [del_xml(old), ins_xml(new)])
    done.append(label)

def insert_after(anchor, text, label):
    loc = _locate(anchor)
    if not loc: missing.append(label); return
    _split(*loc, anchor, [keep_xml(anchor), ins_xml(text)])
    done.append(label)

# ── 前文：引受主体が法人であることに伴う確認 ─────────────────────────
insert_after("と株式会社Land＆Company",
    "【WB：乙を株式会社Land＆Company様とすることで承知しました。総数引受契約書の引受人も同社に変更いたします。"
    "なお、エンジェル税制は個人投資家を対象とする制度のため、法人でのご出資の場合は適用対象外となりますので、念のためご確認ください。】",
    "前文：法人での出資・エンジェル税制")

# ── 第1条 ──────────────────────────────────────────────
insert_after("どのようなご予定か伺わせていただきたくお願いいたします。】",
    "【WB：募集総額が1.5億円に満たない場合でも、本件出資の条件（1株150,000円・134株）は変わりません。"
    "不足額は甲からの貸付け又は金融機関からの借入れにより対象会社が確保し、開業スケジュールに影響が出ないようにいたします。】",
    "1条1項：募集未達時の対処")
insert_after("PB：形式面の修正です。】", "【WB：承知しました。】", "1条1項：形式面")
insert_after("させてください。】",
    "なお、乙は、本件出資を除き、甲又は対象会社に対し、追加の出資、貸付け、債務保証その他の資金提供を行う義務を負わないものとする。"
    "【WB：ご認識のとおりです。本文に明記しました。】",
    "1条1項：追加出資義務なし")

# ── 第2条1項 ────────────────────────────────────────────
replace("が予め指定する者（乙の代表者又は株主を含む。以下「指定利用者」という。）",
        "が予め甲に書面で通知した者（乙の代表者又は株主を含み、2名以内とする。以下「指定利用者」という。）",
        "2条1項1号：指定利用者")
insert_after("本件サービスを受けることを前提にした記載ぶりの修正です。】",
    "【WB：法人でのご利用を前提に承知しました。運用上、指定利用者は事前に書面でご通知いただいた2名以内とさせてください。】",
    "2条1項1号：WB回答")
insert_after("その都度）、乙に開示すること",
    "、並びに各事業年度の上半期終了後2か月以内に、当該上半期の試算表、予算実績比較表及び資金繰り表を乙に開示すること",
    "2条1項4号：半期の試算表・予実・資金繰り")
insert_after("及び予実管理資料も含めることとしていただくことを希望いたします。】",
    "【WB：決算期の財務諸表に加え、半期ごとに試算表・予算実績比較表・資金繰り表を開示する形でいかがでしょうか。】",
    "2条1項4号：WB回答")
replace("Thierry Marxが本件店舗の運営への関与を終了し、又はその関与の程度が著しく低下することが見込まれるときは、"
        "速やかに乙に通知し、本件店舗の運営体制",
        "Thierry Marx氏の名称・商標等の使用に関する契約が終了し、又は終了することが明らかになったときは、"
        "速やかに乙に通知し、本件店舗の運営体制",
        "2条1項6号：キーマン条項（事由）")
replace("および甲による乙が保有する対象会社株式の買い取り", "及び乙が保有する本件株式の取扱い",
        "2条1項6号：キーマン条項（協議事項）")
replace("分配可能額の範囲内における剰余金の配当の可否及び額について乙と協議すること",
        "乙の意見を聴取すること",
        "2条1項7号：配当方針")
insert_after("前者につきましてはどの範囲までご検討可能かお聞かせいただけますと幸いです。】",
    "【WB：（キーマン）「関与の程度が著しく低下」は判断基準が曖昧なため、ブランド使用契約の終了という客観的な事由とさせてください。"
    "なお、同契約上、総料理長等の主要スタッフの任免はThierry Marx氏の事前承認事項で、氏による年2回の来日指導も定められています。"
    "株式の買取りをお約束することは難しいため、本件株式の取扱いを含めた協議とさせてください。"
    "（配当）剰余金の配当は株主総会の決議事項のため、配当方針のご説明と意見の聴取とさせてください。"
    "なお、事業計画上、9店舗の出店期間中は利益を出店資金に充てる前提です。】",
    "2条1項6・7号：WB回答")

# ── 第2条2項3号（タグアロング） ─────────────────────────────────
replace("甲が対象会社の株式の全部又は一部を第三者に譲渡しようとするときは、甲は、乙に対し、当該譲渡と同一の条件で本件株式を当該第三者に譲渡する機会を与えるもの",
        "甲の関係者（対象会社の株主である合同会社WineBank P3、合同会社WineBank P4その他甲又は中野邦人が支配する者をいう。）が、"
        "その保有する対象会社の株式を第三者に譲渡することにより、当該第三者が対象会社の議決権の過半数を有することとなるときは、"
        "甲は、甲の関係者をして、乙に対し、当該譲渡と同一の条件で本件株式を当該第三者に譲渡する機会を与えさせるもの",
        "2条2項3号：タグアロング（対象・要件）")
replace("とし、当該第三者が乙の保有する本件株式を同時に買い受けることを、甲による株式譲渡の条件とする",
        "とし、当該第三者が乙の保有する本件株式を同一の条件で同時に買い受けることを、当該譲渡の条件とさせる",
        "2条2項3号：タグアロング（条件）")
insert_after("PB:タグアロングの機会を希望いたします。】",
    "【WB：タグアロングは承知しました。甲（WineBank）自身は対象会社の株主ではないため、株主である関係者を対象とし、"
    "対象会社の支配権が移る譲渡の場合とさせてください（関係者間の株式移動や一部の譲渡まで対象とすると、追加調達等の資本政策が取りにくくなるため）。】",
    "2条2項3号：WB回答")

# ── 第2条3項4号（競業） ─────────────────────────────────────
replace("対象会社以外の法人又は個人をして、Thierry Marxの監修若しくは名称を用いた飲食店、又は本件店舗と同種の業態の飲食店を運営させること。",
        "対象会社以外の法人又は個人をして、日本国内において、Thierry Marx氏の名称又は商標を用いたブラッスリー又はビストロ業態の飲食店を運営させること。",
        "2条3項4号：競業の範囲")
insert_after("を前提に投資させていただくものであることを踏まえて追加させていただきました。】",
    "【WB：多店舗展開を対象会社で行うことは承知しました。ただし「本件店舗と同種の業態」はWineBankグループが既に運営するレストラン・ワインバー等も含み得るため、"
    "ブランド使用契約の許諾範囲（Thierry Marx氏の名称を用いたブラッスリー・ビストロ業態）に限定させてください。"
    "オーベルジュ等の別業態を実施する場合は、実施主体を含めて事前に乙にご説明いたします。】",
    "2条3項4号：WB回答")

# ── 第3条以降（承諾） ──────────────────────────────────────
for anchor, label in [
    ("記載ぶりとさせていただきました。】", "3条1項7号"),
    ("アドバイザー等への開示を許容する一般的な例外規定を追記いたしました。】", "5条2項"),
    ("出資額を上限とするキャップ規定を設けさせていただきました。】", "7条"),
    ("【PB:法人株主としての記載に改めさせていただきました。】", "8条1項3号"),
]:
    insert_after(anchor, "【WB：承知しました。】", label + "：承諾")
insert_after("親族内での承継のための資本構成変更可能性を許容いただきたいものでございます。", "】【WB：承知しました。",
             "3条1項5号：承諾")

open(PATH, "w", encoding="utf-8").write(xml)
print("=== 反映 ===")
for l in done: print("  ", l)
if missing:
    print("=== 未反映（要確認） ===")
    for l in missing: print("  ", l)
