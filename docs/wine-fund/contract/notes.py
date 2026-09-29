import re, subprocess, sys
SRC="un/word/document.xml"; AUTHOR="株式会社WineBank"
CM="/root/.claude/skills/synced/843eb632-0f1a-4cd1-8ff6-9c7a1257936c_e08a8281-da6b-45f5-9158-3c38a60baabf/docx/scripts/comment.py"
def alltext(p): return ''.join(re.findall(r'<w:(?:t|delText)[^>]*>([^<]*)</w:(?:t|delText)>',p))
def comment(needle,text):
    r=subprocess.run([sys.executable,CM,"un",text,"--author",AUTHOR,"--initials","WB"],check=True,capture_output=True,text=True)
    cid=re.search(r'w:id="(\d+)"',r.stdout).group(1)
    x=open(SRC,encoding="utf-8").read()
    ps=[(m.start(),m.end()) for m in re.finditer(r'<w:p[ >].*?</w:p>',x,re.S)]
    a,b=[(a,b) for a,b in ps if needle in alltext(x[a:b])][0]; p=x[a:b]; k=p.index('</w:pPr>')+8
    p=(p[:k]+f'<w:commentRangeStart w:id="{cid}"/>'+p[k:-6]+f'<w:commentRangeEnd w:id="{cid}"/><w:r><w:rPr><w:rStyle w:val="CommentReference"/></w:rPr><w:commentReference w:id="{cid}"/></w:r></w:p>')
    open(SRC,"w",encoding="utf-8").write(x[:a]+p+x[b:])
comment("を差し引いた","【要確認】加筆後の文は「本出資者は、営業者に対し…解約手数料を差し引いた想定売却額を支払う」となり、支払の向きが逆（出資者が払う）に読めます。意図が「営業者が本出資者に想定売却額から解約手数料を差し引いた額を返還する」であれば主語の入れ替えが必要です。なお相殺は第4項後段にも定めがあるため、第2項は「解約手数料を支払う」のままとし、第4項の相殺で処理する方法もあります。")
comment("受託者の申し出により最長","延長を受託者（WineBank）の申し出のみで決められる形は、出資者から見て一方的と受け取られる可能性があります。例えば「受託者の申し出により、受託者及びその関係者を除く本件匿名組合員の出資割合の過半の同意を得て、最長3年延長できる」とすると、第16条第12項の清算期間延長と同じ考え方で揃います。")
comment("簡易監査","「簡易監査」は法定の用語ではなく範囲が曖昧なため、「レビュー」（公認会計士によるレビュー業務）又は「合意された手続」と表記するのが一般的です。費用と保証水準のバランスから、合意された手続が現実的と考えます。")
print("ok")
