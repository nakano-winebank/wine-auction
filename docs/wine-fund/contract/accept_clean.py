# 既存の修正履歴をすべて承諾し、既存コメントを削除して、次の版の修正履歴の土台を作る。
# 使い方: python3 accept_clean.py <unzip済みディレクトリ>
import re, sys
D = sys.argv[1]
p = f"{D}/word/document.xml"
x = open(p, encoding="utf-8").read()

x = re.sub(r'<w:del [^>]*[^/]>.*?</w:del>', '', x, flags=re.S)        # 削除を確定
x = re.sub(r'<w:ins [^>]*/>', '', x)                                  # 段落記号の挿入マーク
x = re.sub(r'<w:ins [^>]*[^/]>|</w:ins>', '', x)                      # 挿入を確定

def drop_deleted_marks(x):
    """段落記号の削除（<w:del/>）がある段落：本文が空なら段落ごと削除、残る場合は次段落に結合。"""
    out, pos = [], 0
    paras = list(re.finditer(r'<w:p[ >].*?</w:p>', x, re.S))
    i = 0
    while i < len(paras):
        m = paras[i]
        body = m.group(0)
        if re.search(r'<w:pPr>.*?<w:del [^>]*/>.*?</w:pPr>', body, re.S):
            text = ''.join(re.findall(r'<w:t[^>]*>([^<]*)</w:t>', body))
            out.append(x[pos:m.start()])
            if text.strip() and i + 1 < len(paras):
                runs = re.sub(r'^<w:p[^>]*>(<w:pPr>.*?</w:pPr>)?', '', body, flags=re.S)[:-len('</w:p>')]
                nxt = paras[i + 1]
                nb = nxt.group(0)
                k = nb.index('</w:pPr>') + 8 if '</w:pPr>' in nb else nb.index('>') + 1
                out.append(x[m.end():nxt.start()] + nb[:k] + runs + nb[k:])
                pos = nxt.end(); i += 2; continue
            pos = m.end()
        i += 1
    out.append(x[pos:])
    return ''.join(out)
x = drop_deleted_marks(x)

# 既存コメントの削除
x = re.sub(r'<w:commentRange(Start|End) [^>]*/>', '', x)
x = re.sub(r'<w:r(?: [^>]*)?>(?:<w:rPr>(?:(?!</w:rPr>).)*</w:rPr>)?<w:commentReference [^>]*/></w:r>', '', x, flags=re.S)
assert 'commentReference' not in x
open(p, "w", encoding="utf-8").write(x)
for f, tag in [("comments.xml", "w:comment"), ("commentsExtended.xml", "w15:commentEx"),
               ("commentsIds.xml", "w16cid:commentId"), ("commentsExtensible.xml", "w16cex:commentExtensible")]:
    try: c = open(f"{D}/word/{f}", encoding="utf-8").read()
    except FileNotFoundError: continue
    c = re.sub(rf'<{tag}[ >].*?</{tag}>|<{tag} [^>]*/>', '', c, flags=re.S)
    open(f"{D}/word/{f}", "w", encoding="utf-8").write(c)
