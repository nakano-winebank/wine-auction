# -*- coding: utf-8 -*-
"""合意書に変更履歴（tracked changes）付きで修正を適用する。"""
import re, sys, html

PATH = "unpacked/word/document.xml"
AUTHOR = "レビュー案"
DATE = "2026-09-03T00:00:00Z"

xml = open(PATH, encoding="utf-8").read()
counter = [9000]
applied, missing = [], []

def esc(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

def redline(old, new, label, count=1, before_anchor=None):
    """<w:t> 内の old を、削除(w:del)＋挿入(w:ins) に置き換える。
       1つの <w:r> に複数の <w:t> がある場合も、対象外のテキストを保持する。"""
    global xml
    done = 0
    while done < count:
        limit = xml.find(before_anchor) if before_anchor else None
        if before_anchor and limit is not None and limit < 0:
            break
        pos = -1; tm = None
        for m in re.finditer(r"<w:t(?:\s[^>]*)?>((?:(?!</w:t>).)*)</w:t>", xml, re.S):
            if old not in m.group(1):
                continue
            if limit is None:
                pos = m.start(); tm = m; break
            if m.start() < limit:
                pos = m.start(); tm = m       # アンカー直前のものを採用
            else:
                break
        if pos < 0 or tm is None:
            break

        rs = max(xml.rfind("<w:r>", 0, pos), xml.rfind("<w:r ", 0, pos))
        rclose = xml.find("</w:r>", tm.end())
        if rs < 0 or rclose < 0:
            break
        rend = rclose + len("</w:r>")
        run = xml[rs:rend]
        rtag = re.match(r"<w:r(?:\s[^>]*)?>", run).group(0)
        pm = re.search(r"<w:rPr>.*?</w:rPr>", run, re.S)
        rpr = pm.group(0) if pm else ""

        # ラン内での対象 <w:t> の位置
        off_s = tm.start() - rs
        off_e = tm.end() - rs
        pre_inner = run[len(rtag):off_s]                 # rPr や先行する w:t 等
        post_inner = run[off_e:len(run) - len("</w:r>")]  # 後続の w:t 等
        text = tm.group(1)
        i = text.index(old)
        before, after = text[:i], text[i + len(old):]

        parts = []
        head = pre_inner + (f'<w:t xml:space="preserve">{before}</w:t>' if before else "")
        if head.strip():
            parts.append(f"{rtag}{head}</w:r>")
        counter[0] += 1
        parts.append(
            f'<w:del w:id="{counter[0]}" w:author="{AUTHOR}" w:date="{DATE}">'
            f'{rtag}{rpr}<w:delText xml:space="preserve">{esc(old)}</w:delText></w:r></w:del>')
        counter[0] += 1
        parts.append(
            f'<w:ins w:id="{counter[0]}" w:author="{AUTHOR}" w:date="{DATE}">'
            f'{rtag}{rpr}<w:t xml:space="preserve">{esc(new)}</w:t></w:r></w:ins>')
        tail = (f'<w:t xml:space="preserve">{after}</w:t>' if after else "") + post_inner
        if tail.strip():
            parts.append(f"{rtag}{rpr}{tail}</w:r>")

        xml = xml[:rs] + "".join(parts) + xml[rend:]
        done += 1
    if done:
        applied.append((label, done))
    else:
        missing.append(label)

# ── A. 用語の統一（株式会社の用語へ。原文は持分会社の用語） ────────────
redline("本件出資持分", "本件株式", "A1 本件出資持分→本件株式", count=8)
redline("同請求時点における出資持分の時価を算定基礎として各出資者の出資比率に応じて案分した金額",
        "同請求時点における株式の時価を算定基礎として各株主の持株比率に応じて案分した金額",
        "A2 出資持分の時価/出資者の出資比率→株式の時価/株主の持株比率", count=2)
redline("出資持分譲渡契約", "株式譲渡契約", "A3 出資持分譲渡契約→株式譲渡契約", count=2)
redline("本件取得株式", "本件株式", "A4 本件取得株式→本件株式")
redline("贈与若しくは遺贈により退社する場合", "贈与若しくは遺贈により株主でなくなる場合",
        "A5 退社→株主でなくなる")

# ── B. 条番号（第3条が欠落しているため繰上げ） ──────────────────
for old, new in [("第４条（解除）", "第３条（解除）"),
                 ("第５条（買取請求権・売渡請求権）", "第４条（買取請求権・売渡請求権）"),
                 ("第６条（秘密保持）", "第５条（秘密保持）"),
                 ("第７条（反社会的勢力の排除に関する確約事項等）", "第６条（反社会的勢力の排除に関する確約事項等）"),
                 ("第8条（損害賠償）", "第７条（損害賠償）"),
                 ("第9条（合意の終了）", "第８条（合意の終了）")]:
    redline(old, new, f"B 条番号 {old}→{new}")
redline("10", "９", "B 条番号 第10条→第９条（見出しの数字ラン）",
        before_anchor="条（準拠法及び裁判管轄）")

# ── C. 相互参照の誤り ─────────────────────────────────
redline("第２条第１項第７号の違反", "第２条第１項第６号の違反",
        "C1 存在しない第2条1項7号→第6号（同項は6号まで）")
redline("３　前二条の場合において", "３　前二項の場合において", "C2 前二条→前二項")
redline("については、第５条の規定を準用する", "については、第４条の規定を準用する",
        "C3 準用先 第5条→第4条（条番号繰上げに伴う）")

# ── D. 実質的な修正 ──────────────────────────────────
redline("対象会社又はWBP3の買収",
        "対象会社又は合同会社WineBank P3（以下「WBP3」という。）の買収",
        "D1 WBP3の定義規定を追加（本文に定義がなかった）")
redline("甲は、2026年4月以降、5年～10年以内に",
        "甲は、本件実行日以降、5年～10年以内に",
        "D2 起算点 2026年4月（締結時点で既に過去）→本件実行日")
redline("対象会社の株式について、WBP3の持株比率を66％未満に希釈化させること",
        "対象会社の株式について、中野邦人及びWBP3の合計持株比率（発行済株式総数を基準とし、"
        "新株予約権その他の潜在株式は算入しない。）を66％未満に希釈化させること",
        "D3 WBP3単独(23.3%)→中野邦人との合計(66.7%)＋発行済ベースであることを明記")
redline("WBP3と本件34％投資家との間で、",
        "WBP3と本件ラウンドにおける外部投資家（本合意締結日現在の合計持株比率33.3％。"
        "以下「本件外部投資家」という。）との間で、",
        "D4 未定義の「本件34％投資家」→定義付きの「本件外部投資家」")
redline("本件34％投資家との間で、対象会社の配当可能利益の34％を超える利益を本件34％投資家に配当",
        "本件外部投資家との間で、対象会社の配当可能利益のうち本件外部投資家の合計持株比率"
        "（33.3％）を超える割合の利益を本件外部投資家に配当",
        "D5 34%→33.3%（実際の外部投資家合計比率）")
redline("本件出資総額が著しく増額した場合、対象会社の六本木ミッドタウン開業スケジュールが著しく遅延が生じた場合",
        "本件ラウンドにおける本件出資総額が金【　　　　　　】円を超えて増額した場合、又は"
        "対象会社の六本木ミッドタウンにおける開業が【　　】か月を超えて遅延した場合",
        "D6 「著しく」の基準を数値化（要協議）＋本件ラウンドに限定")
redline("対象会社の株式について、種類株式を発行すること",
        "対象会社の株式について、乙の事前の書面による同意なく種類株式を発行すること",
        "D7 種類株式の全面禁止→乙の同意があれば可（将来の資金調達余地の確保）")

open(PATH, "w", encoding="utf-8").write(xml)
print("=== 適用 ===")
for l, n in applied:
    print(f"  [{n}件] {l}")
if missing:
    print("=== 未適用（要確認） ===")
    for l in missing:
        print("  ", l)
