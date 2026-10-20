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

def para_like(model_needle, text, num=None):
    """model_needle を含む段落と同じ段落書式・文字書式で、挿入扱いの新段落 XML を作る。
    num を渡すと「番号＋タブ＋本文」の形にする。"""
    a, b = find(model_needle); p = x[a:b]
    ppr = re.search(r'<w:pPr>(.*?)</w:pPr>', p, re.S); ppr = ppr.group(1) if ppr else ""
    ppr = re.sub(r'<w:rPr>.*?</w:rPr>|<w:rPr/>', '', ppr, flags=re.S)
    rpr = re.search(r'<w:r(?: [^>]*)?>(<w:rPr>.*?</w:rPr>)', p, re.S); rpr = rpr.group(1) if rpr else ""
    mark = f'<w:rPr>{TAG("ins")[:-1]}/></w:rPr>'
    return (f'<w:p><w:pPr>{ppr}{mark}</w:pPr>{TAG("ins")}<w:r>{rpr}'
            + (f'<w:t xml:space="preserve">{esc(num)}</w:t><w:tab/>' if num is not None else '')
            + f'<w:t xml:space="preserve">{esc(text)}</w:t></w:r></w:ins></w:p>')

def tidy():
    """描画キャッシュの改ページ印を除き、同一 run 内で分断された w:t を結合する（内容は不変）。"""
    global x
    x = x.replace('<w:lastRenderedPageBreak/>', '')
    x = re.sub(r'</w:t><w:t(?: xml:space="preserve")?>', '', x)
    x = x.replace('<w:t>', '<w:t xml:space="preserve">')

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


TOP_RUN = re.compile(r'<w:r(?: [^>]*)?>(?:(?!</w:r>).)*</w:r>', re.S)
def _top_runs(p):
    """段落 p の、w:ins / w:del の外にある run を (start, end) で返す。"""
    out = []
    for m in TOP_RUN.finditer(p):
        pre = p[:m.start()]
        if len(re.findall(r'<w:(?:ins|del) [^>]*[^/]>', pre)) != pre.count('</w:ins>') + pre.count('</w:del>'):
            continue
        out.append((m.start(), m.end()))
    return out

def _as_del(run):
    r = run.replace('<w:t>', '<w:delText xml:space="preserve">').replace('<w:t xml:space="preserve">', '<w:delText xml:space="preserve">').replace('</w:t>', '</w:delText>')
    return f'{TAG("del")}{r}</w:del>'

def delete_span(para, start, end, new=None):
    """段落 para の中で、文字列 start から end（を含む）までを、run をまたいで削除扱いにし、new を挿入する。"""
    global x
    a, b = find(para); p = x[a:b]
    runs = _top_runs(p)
    texts = [''.join(html.unescape(s) for s in re.findall(r'<w:t(?: [^>]*)?>([^<]*)</w:t>', p[s:e])) for s, e in runs]
    full = ''.join(texts)
    s0 = full.index(start); e0 = full.index(end, s0) + len(end)
    pos, pieces, last = 0, [], None
    for (rs, re_), t in zip(runs, texts):
        r0, r1 = pos, pos + len(t); pos = r1
        if r1 <= s0 or r0 >= e0 or not t:
            continue
        run = p[rs:re_]
        if r0 >= s0 and r1 <= e0:
            rep = _as_del(run)
        else:
            m = re.match(r'(<w:r(?: [^>]*)?>)(<w:rPr>.*?</w:rPr>)?(.*?)<w:t(?: [^>]*)?>([^<]*)</w:t>(.*)</w:r>$', run, re.S)
            assert m and m.group(4) is not None and html.unescape(m.group(4)) == t, "部分削除は単一の w:t の run のみ対応"
            ro, rpr, before, _, after = m.group(1), m.group(2) or "", m.group(3), m.group(4), m.group(5)
            i, j = max(s0 - r0, 0), min(e0 - r0, len(t))
            pre, cut, post = t[:i], t[i:j], t[j:]
            rep = ""
            if pre or before: rep += f'{ro}{rpr}{before}<w:t xml:space="preserve">{esc(pre)}</w:t></w:r>'
            rep += f'{TAG("del")}{ro}{rpr}<w:delText xml:space="preserve">{esc(cut)}</w:delText></w:r></w:del>'
            if post or after: rep += f'{ro}{rpr}<w:t xml:space="preserve">{esc(post)}</w:t>{after}</w:r>'
        pieces.append((rs, re_, rep))
    if new:
        rs, re_, rep = pieces[-1]
        m = re.match(r'<w:r(?: [^>]*)?>(<w:rPr>.*?</w:rPr>)?', p[rs:re_], re.S)
        ins = f'{TAG("ins")}<w:r>{m.group(1) or ""}<w:t xml:space="preserve">{esc(new)}</w:t></w:r></w:ins>'
        k = rep.rfind('</w:del>') + len('</w:del>')
        pieces[-1] = (rs, re_, rep[:k] + ins + rep[k:])
    for rs, re_, rep in reversed(pieces):
        p = p[:rs] + rep + p[re_:]
    x = x[:a] + p + x[b:]

def delete_para(needle):
    """needle を含む段落を、本文と段落記号ごと削除扱いにする。"""
    global x
    a, b = find(needle); p = x[a:b]
    for rs, re_ in reversed(_top_runs(p)):
        p = p[:rs] + _as_del(p[rs:re_]) + p[re_:]
    mark = f'{TAG("del")[:-1]}/>'
    if '<w:pPr>' in p:
        if re.search(r'<w:pPr>.*?<w:rPr>.*?</w:pPr>', p, re.S):
            p = re.sub(r'(<w:pPr>.*?<w:rPr>)', r'\1' + mark, p, count=1, flags=re.S)
        else:
            p = p.replace('</w:pPr>', f'<w:rPr>{mark}</w:rPr></w:pPr>', 1)
    else:
        p = re.sub(r'^(<w:p[^>]*>)', r'\1' + f'<w:pPr><w:rPr>{mark}</w:rPr></w:pPr>', p)
    x = x[:a] + p + x[b:]
