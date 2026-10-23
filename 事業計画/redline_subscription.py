# -*- coding: utf-8 -*-
"""総数引受契約書（ご記入版 20261023）に、定款・履歴事項全部証明書との照合結果を変更履歴付きで反映する。
使い方: python3 redline_subscription.py <unpacked>/word/document.xml"""
import re, sys, html

PATH = sys.argv[1]
AUTHOR = "Claude（定款・謄本照合）"
DATE = "2026-10-23T00:00:00Z"

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

# ── A. 契約書内の計算・記載ミス ─────────────────────────
redline("金9,975,000円", "金10,050,000円",
        "A1 資本金・資本準備金：134株×150,000円＝20,100,000円の1/2ずつ", count=2)
redline("本契約締結日現在のに対する", "本契約締結日現在の甲の発行済株式総数2,000株に対する",
        "A2 第1条2項：株式数の記載が欠落")
redline("（金21,100,000円）", "（金20,100,000円）", "A3 第9条2項：払込総額の誤記")

# ── B. 定款・登記簿との整合 ───────────────────────────
redline("普通株式2000株であり",
        "普通株式2,000株（2026年10月【30】日を払込期日とする第三者割当による1,990株の発行後の株式数）であり",
        "B1 第7条1項2号：登記簿上は現在10株。月末増資後の数であることを明記")
redline("資本金の額の変更登記", "発行済株式の総数及び資本金の額の変更登記",
        "B2 第4条2項：登記事項（発行済株式の総数も変更）")
redline("開催の甲の臨時株主総会の特別決議に基づき",
        "付の甲の株主総会の特別決議（会社法第319条第1項により決議があったものとみなされる場合を含む。）に基づき",
        "B3 第1条1項：定款第20条の書面決議でも足りるように")
redline("東京都港区六本木4丁目12番8号", "東京都港区六本木四丁目12番8号",
        "B4 甲の本店：登記簿の表記に統一（丙は対象外）")

# ── C. 合意書との整合 ───────────────────────────────
redline("本合意書に定める本件約束が履行されたものとみなすことを確認する。",
        "本合意書に定める本件約束が履行されたものとみなすこと、及び本合意書第１条第１項に定める本件実行日"
        "（2026年10月末日）を本契約の払込期日（2026年11月10日）に読み替えることを確認する。",
        "C1 第9条2項：払込が11/10のため、合意書の実行日（10月末）経過による終了を回避")
redline("2026年10月　　日", "2026年【11】月　　日",
        "C2 締結日：月末増資（2,000株）の後に締結しないと第7条1項2号の表明が不正確になる")

open(PATH, "w", encoding="utf-8").write(xml)
print("=== 適用 ===")
for l, n in applied:
    print(f"  [{n}件] {l}")
if missing:
    print("=== 未適用（要確認） ===")
    for l in missing:
        print("  ", l)
