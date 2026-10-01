# 修正履歴（w:ins / w:del）とコメントを document.xml に入れる共通関数。
# 使い方: import redline_lib as R; R.load("un"); R.edit(...); R.save(); R.comment(...)
import re, html, subprocess, sys
AUTHOR = "株式会社WineBank"; DATE = "2026-10-01T00:00:00Z"
CM = "/root/.claude/skills/synced/843eb632-0f1a-4cd1-8ff6-9c7a1257936c_e08a8281-da6b-45f5-9158-3c38a60baabf/docx/scripts/comment.py"
D = None; x = ""
_id = [40000]
def nid(): _id[0] += 1; return _id[0]
esc = lambda t: html.escape(t, quote=False)
TAG = lambda k: f'<w:{k} w:id="{nid()}" w:author="{AUTHOR}" w:date="{DATE}">'

def load(d):
    global D, x
    D = d; x = open(f"{d}/word/document.xml", encoding="utf-8").read()
def save(): open(f"{D}/word/document.xml", "w", encoding="utf-8").write(x)

def paras(): return [(m.start(), m.end()) for m in re.finditer(r'<w:p[ >].*?</w:p>', x, re.S)]
def ptext(p): return ''.join(html.unescape(s) for s in re.findall(r'<w:t(?: [^>]*)?>([^<]*)</w:t>', p))
def find(needle):
    h = [(a, b) for a, b in paras() if needle in ptext(x[a:b])]
    assert h, f"段落なし: {needle}"; return h[0]

RUN = re.compile(r'(<w:ins [^>]*>)?(<w:r(?: [^>]*)?>)((?:(?!</w:r>).)*)</w:r>(</w:ins>)?', re.S)
def edit(para, target, new=None, after=False):
    """段落 para 内の target を削除して new を挿入（after=True なら target の直後に new を挿入のみ）。
    他者の挿入（w:ins）内の文字列は、その w:ins を分割して入れ子の削除とする。"""
    global x
    a, b = find(para); p = x[a:b]
    for m in RUN.finditer(p):
        wrap, ropen, body, close = m.groups()
        if bool(wrap) != bool(close): continue
        rpr = re.match(r'(<w:rPr>.*?</w:rPr>)?', body, re.S).group(0)
        rest = body[len(rpr):]
        for tm in re.finditer(r'<w:t(?: [^>]*)?>([^<]*)</w:t>', rest):
            txt = html.unescape(tm.group(1))
            if target not in txt: continue
            i = txt.index(target)
            if not wrap:
                pre_p = p[:m.start()]
                assert len(re.findall(r'<w:ins [^>]*[^/]>', pre_p)) == pre_p.count('</w:ins>'), "入れ子の run は未対応"
            before, after_x = rest[:tm.start()], rest[tm.end():]
            if after: pre, cut, post = txt[:i + len(target)], "", txt[i + len(target):]
            else:     pre, cut, post = txt[:i], target, txt[i + len(target):]
            def outer(inner):
                return re.sub(r'w:id="\d+"', f'w:id="{nid()}"', wrap, 1) + inner + '</w:ins>' if wrap else inner
            out = ""
            if pre or before: out += outer(f'{ropen}{rpr}{before}<w:t xml:space="preserve">{esc(pre)}</w:t></w:r>')
            if cut: out += outer(f'{TAG("del")}{ropen}{rpr}<w:delText xml:space="preserve">{esc(cut)}</w:delText></w:r></w:del>')
            if new: out += f'{TAG("ins")}{ropen}{rpr}<w:t xml:space="preserve">{esc(new)}</w:t></w:r></w:ins>'
            if post or after_x: out += outer(f'{ropen}{rpr}<w:t xml:space="preserve">{esc(post)}</w:t>{after_x}</w:r>')
            x = x[:a] + p[:m.start()] + out + p[m.end():] + x[b:]
            return
    raise AssertionError(f"文字列なし: {target} / {para}")

def para_like(model_needle, text):
    """model_needle を含む段落と同じ段落書式・文字書式で、挿入扱いの新段落 XML を作る。"""
    a, b = find(model_needle); p = x[a:b]
    ppr = re.search(r'<w:pPr>(.*?)</w:pPr>', p, re.S); ppr = ppr.group(1) if ppr else ""
    ppr = re.sub(r'<w:rPr>.*?</w:rPr>', '', ppr, flags=re.S)
    rpr = re.search(r'<w:r(?: [^>]*)?>(<w:rPr>.*?</w:rPr>)', p, re.S); rpr = rpr.group(1) if rpr else ""
    mark = f'<w:rPr>{TAG("ins")[:-1]}/></w:rPr>'
    return (f'<w:p><w:pPr>{ppr}{mark}</w:pPr>{TAG("ins")}<w:r>{rpr}'
            f'<w:t xml:space="preserve">{esc(text)}</w:t></w:r></w:ins></w:p>')

def insert_after(needle, xml):
    global x
    a, b = find(needle); x = x[:b] + xml + x[b:]

def comment(needle, text):
    global x
    save()
    r = subprocess.run([sys.executable, CM, D, text, "--author", AUTHOR, "--initials", "WB"], check=True, capture_output=True, text=True)
    cid = re.search(r'w:id="(\d+)"', r.stdout).group(1)
    x = open(f"{D}/word/document.xml", encoding="utf-8").read()
    a, b = find(needle); p = x[a:b]
    k = p.index('</w:pPr>') + 8 if '</w:pPr>' in p else p.index('>') + 1
    p = (p[:k] + f'<w:commentRangeStart w:id="{cid}"/>' + p[k:-6] + f'<w:commentRangeEnd w:id="{cid}"/>'
         f'<w:r><w:rPr><w:rStyle w:val="CommentReference"/></w:rPr><w:commentReference w:id="{cid}"/></w:r></w:p>')
    x = x[:a] + p + x[b:]; save()
