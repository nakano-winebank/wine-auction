# v4（中野加筆）への法務文言修正：管理報酬A案（本事業負担・第11条第2項）、第1条(4)、第12条5項（AUP）、
# 第15条、第16条2項・4項、「本営業者」の統一。v4 を unzip → merge_runs した un/ で実行する。
import re, html, subprocess, sys
SRC = "un/word/document.xml"; AUTHOR = "株式会社WineBank"; DATE = "2026-09-30T12:00:00Z"
CM = "/root/.claude/skills/synced/843eb632-0f1a-4cd1-8ff6-9c7a1257936c_e08a8281-da6b-45f5-9158-3c38a60baabf/docx/scripts/comment.py"
x = open(SRC, encoding="utf-8").read()
_id = [30000]
def nid(): _id[0] += 1; return _id[0]
esc = lambda t: html.escape(t, quote=False)
RPR = '<w:rPr><w:rFonts w:ascii="ＭＳ 明朝" w:hAnsi="ＭＳ 明朝" w:hint="eastAsia"/></w:rPr>'
TAG = lambda k: f'<w:{k} w:id="{nid()}" w:author="{AUTHOR}" w:date="{DATE}">'

def paras(): return [(m.start(), m.end()) for m in re.finditer(r'<w:p[ >].*?</w:p>', x, re.S)]
def ptext(p): return ''.join(html.unescape(s) for s in re.findall(r'<w:t(?: [^>]*)?>([^<]*)</w:t>', p))
def find(needle):
    h = [(a, b) for a, b in paras() if needle in ptext(x[a:b])]
    assert h, f"段落なし: {needle}"; return h[0]

RUN = re.compile(r'(<w:ins [^>]*>)?(<w:r(?: [^>]*)?>)((?:(?!</w:r>).)*)</w:r>(</w:ins>)?', re.S)
def edit(para, target, new=None, after=False):
    """段落 para 内の target を削除して new を挿入（after=True なら target の後に new を挿入のみ）。
    他者の挿入（w:ins）内の文字列も、その w:ins を分割して入れ子の削除として扱う。"""
    global x
    a, b = find(para); p = x[a:b]
    for m in RUN.finditer(p):
        wrap, ropen, body, close = m.group(1), m.group(2), m.group(3), m.group(4)
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
            def outer(inner):  # 元の w:ins（他者の挿入）で包み直す
                return re.sub(r'w:id="\d+"', f'w:id="{nid()}"', wrap, 1) + inner + '</w:ins>' if wrap else inner
            out = ""
            if pre or before: out += outer(f'{ropen}{rpr}{before}<w:t xml:space="preserve">{esc(pre)}</w:t></w:r>')
            if cut: out += outer(f'{TAG("del")}{ropen}{rpr}<w:delText xml:space="preserve">{esc(cut)}</w:delText></w:r></w:del>')
            if new: out += f'{TAG("ins")}{ropen}{rpr}<w:t xml:space="preserve">{esc(new)}</w:t></w:r></w:ins>'
            if post or after_x: out += outer(f'{ropen}{rpr}<w:t xml:space="preserve">{esc(post)}</w:t>{after_x}</w:r>')
            x = x[:a] + p[:m.start()] + out + p[m.end():] + x[b:]
            return
    raise AssertionError(f"文字列なし: {target} / {para}")

def mark(): return f'<w:rPr>{TAG("ins")[:-1]}/><w:rFonts w:ascii="ＭＳ 明朝" w:hAnsi="ＭＳ 明朝"/></w:rPr>'
def item(num, text):
    return (f'<w:p><w:pPr><w:tabs><w:tab w:val="left" w:pos="518"/></w:tabs><w:ind w:left="518" w:hanging="518"/>{mark()}</w:pPr>'
            f'{TAG("ins")}<w:r>{RPR}<w:t xml:space="preserve">{esc(num)}</w:t><w:tab/><w:t xml:space="preserve">{esc(text)}</w:t></w:r></w:ins></w:p>')

# ── 1. 第1条(4) 管理委託契約の定義
D4 = "「管理委託契約」とは"
edit(D4, "別紙１に定める")
edit(D4, "〇月〇日付にて", "●月●日付で")
edit(D4, "含む。", "含み、その写しを別紙1として本契約に添付する。")

# ── 2. 第9条1項②a 管理報酬（A案：本事業が負担）
A9 = "営業者の支払のうち、本契約で定められるもの"
edit(A9, "は全本件匿名組合出資金の残額の合計額に2.0%を乗じ")
edit(A9, "て算出し")
edit(A9, "、営業者がその固有財産により負担し、本事業においてはこれを負担しない",
     "は、第11条第2項に定める管理報酬として本事業がこれを負担する")

# ── 3. 第11条 営業者報酬は30万円のまま、管理報酬を第2項に明記
edit("第11条（営業者報酬）", "営業者報酬", "及び管理報酬", after=True)
edit("各計算期間あたり金3", "", "1　", after=True)
a, b = find("各計算期間あたり金3")
x = x[:b] + item("2",
    "営業者は、管理委託契約第4条第2項に定める受託者の報酬（以下「管理報酬」という。）として、"
    "各計算期間の初日における全ての本件匿名組合員の出資金の残高の合計額に年2.0%を乗じた額"
    "（1年を365日とする当該計算期間の日数による日割計算とする。）を、各計算期間の末日に"
    "本事業の費用として本財産から受託者に支払う。") + x[b:]

# ── 4. 第12条5項「簡易監査」→ 合意された手続（AUP）
A12 = "独立した公認会計士又は監査法人による"
edit(A12, "簡易")
edit(A12, "監査又は")
edit(A12, "合意された手続", "（以下「AUP」という。）", after=True)
edit(A12, "合意された手続の対象", "AUPの対象")

# ── 5. 第15条 延長（文法＋延長の決定権者）
A15 = "本契約の有効期間は、本契約締結日から"
edit(A15, "受託者の申し出により",
     "営業者は、受託者及びその関係者を除く本件匿名組合員の出資割合の過半の書面による同意を得て、これを")
edit(A15, "可能")
edit(A15, "する", "ことができる", after=True)

# ── 6. 第16条2項（支払の向き）・4項（相殺規定の整理）・「本営業者」→「営業者」
A162 = "本出資者は、本営業者に書面で通知することにより"
edit(A162, "また、本出資者は、本項に基づき本契約を解除する場合、営業者に対し、",
     "また、本出資者が本項に基づき本契約を解除する場合、営業者は、本出資者に対し、")
edit(A162, "を差し引いた")
edit(A162, "想定売却額")
edit(A162, "月末日までに、", "以下に定める想定売却額から", after=True)
edit(A162, "以下に定める解約手数料", "を控除した金額", after=True)
edit(A162, "を支払う", "ことにより、出資の価額の返還を行う", after=True)
A164 = "本契約が終了した場合には、第9条に準じて"
edit(A164, "前三項", "第1項又は第3項")
edit(A164, "なお、本出資者が第2項に基づき解約手数料の支払義務を負う場合であって、営業者が本出資者に対して返還すべき出資の価額が当該解約手数料の金額を上回る場合、第2項の定めにかかわらず、本営業者は、何らの通知等を要することなく、当該解約手数料の請求権と出資の価額の返還債務とを対当額にて相殺した上で、残余の出資の価額を本出資者に返還することができる。")
while True:
    hit = [(a, b) for a, b in paras() if "本営業者" in ptext(x[a:b])]
    if not hit: break
    t = ptext(x[hit[0][0]:hit[0][1]])
    edit(t[:40], "本営業者", "営業者")

open(SRC, "w", encoding="utf-8").write(x)

def comment(needle, text):
    global x
    r = subprocess.run([sys.executable, CM, "un", text, "--author", AUTHOR, "--initials", "WB"], check=True, capture_output=True, text=True)
    cid = re.search(r'w:id="(\d+)"', r.stdout).group(1)
    x = open(SRC, encoding="utf-8").read()
    a, b = find(needle); p = x[a:b]; k = p.index('</w:pPr>') + 8
    p = (p[:k] + f'<w:commentRangeStart w:id="{cid}"/>' + p[k:-6] + f'<w:commentRangeEnd w:id="{cid}"/>'
         f'<w:r><w:rPr><w:rStyle w:val="CommentReference"/></w:rPr><w:commentReference w:id="{cid}"/></w:r></w:p>')
    x = x[:a] + p + x[b:]; open(SRC, "w", encoding="utf-8").write(x)

comment("「管理委託契約」とは",
 "「別紙１に定める」の位置では、別紙が契約の内容や日付を定めているように読めるため、添付の旨を括弧内に戻しました。日付の空欄は他条項に合わせて「●」に統一しています。別紙1には締結後に管理委託契約書の写しを添付してください（管理報酬の根拠条項である同契約第4条第2項を本契約から確認できるようにするため）。")
comment("第11条第2項に定める管理報酬として本事業がこれを負担する",
 "【A案】管理報酬2%は本事業（ファンド）の費用とし、第11条第2項に明記しました（高山社長ご指摘どおり）。v4の「営業者がその固有財産により負担」は、営業者の収入が年120万円（30万円×4期）しかないため年1,000〜2,000万円の2%を払えず、営業者が債務超過となるため削除しています。提案資料の投資家利回り20.0%は、この2%を費用として差し引いた後の数字であり、本条項と一致します。")
comment("管理報酬」という。）として",
 "基準額は第1条・第12条の用語に合わせ「全ての本件匿名組合員の出資金の残高の合計額」としました（受託者の現物出資分を含む総額）。年率・基準日（各計算期間の初日）・日割計算・支払時期を明記しています。営業者報酬（第1項）は30万円のまま据え置きです。")
comment("これを最長3年延長することができる",
 "「延長可能する」を「延長することができる」に修正しました。また、受託者（WineBank）はこの契約の当事者ではなく、出資者兼在庫の売り先として利害が対立するため、延長は営業者がWineBank以外の出資者の過半の同意を得て行う形にしました（第16条第12項と同じ決め方です）。")
comment("想定売却額から以下に定める解約手数料を控除した金額",
 "v4では「本出資者が営業者に支払う」となっており、支払の向きが逆でした。営業者が出資者に「想定売却額−解約手数料」を支払う形に改め、第4項の出資返還・相殺と二重にならないよう、第4項は第1項又は第3項による終了の場合に限り、同項の相殺規定は不要となるため削除しました。")
