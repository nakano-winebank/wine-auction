"""Reject all WineBank tracked changes and remove WineBank comments -> reconstruct counterparty base.
usage: python3 reject_wb.py <unpacked_dir>"""
import sys, re
from lxml import etree
W="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
W14="http://schemas.microsoft.com/office/word/2010/wordml"
def q(t): return "{%s}%s"%(W,t)
D=sys.argv[1]
dp=D+"/word/document.xml"; t=etree.parse(dp); root=t.getroot()
AU=q("author")
# 1) paragraphs whose mark was inserted by WineBank -> drop whole paragraph
for p in list(root.iter(q("p"))):
    m=p.find(q("pPr")+"/"+q("rPr")+"/"+q("ins"))
    if m is not None and m.get(AU)=="WineBank":
        p.getparent().remove(p)
# 2) WineBank insertions
for e in list(root.iter(q("ins"))):
    if e.get(AU)=="WineBank" and e.getparent() is not None:
        e.getparent().remove(e)
# 3) WineBank deletions -> unwrap
for e in list(root.iter(q("del"))):
    if e.get(AU)=="WineBank":
        for dt in e.iter(q("delText")): dt.tag=q("t")
        par=e.getparent(); i=par.index(e)
        for k,c in enumerate(list(e)): par.insert(i+k,c)
        par.remove(e)
# 4) WineBank comment markers (ids >= 900)
ids=set()
for tag in ("commentRangeStart","commentRangeEnd"):
    for e in list(root.iter(q(tag))):
        if int(e.get(q("id")))>=900: ids.add(e.get(q("id"))); e.getparent().remove(e)
for cr in list(root.iter(q("commentReference"))):
    if int(cr.get(q("id")))>=900:
        r=cr.getparent(); r.getparent().remove(r)
t.write(dp,xml_declaration=True,encoding="UTF-8",standalone=True)
# 5) comments parts
cp=D+"/word/comments.xml"; ct=etree.parse(cp); paraids=set()
for c in list(ct.getroot()):
    if c.get(AU)=="WineBank":
        for p in c.iter(q("p")):
            v=p.get("{%s}paraId"%W14)
            if v: paraids.add(v)
        ct.getroot().remove(c)
ct.write(cp,xml_declaration=True,encoding="UTF-8",standalone=True)
for fn in ("commentsExtended.xml","commentsIds.xml","commentsExtensible.xml"):
    fp=D+"/word/"+fn
    try: x=etree.parse(fp)
    except OSError: continue
    n=0
    for e in list(x.getroot()):
        vals=set(e.attrib.values())
        if vals & paraids: x.getroot().remove(e); n+=1
    x.write(fp,xml_declaration=True,encoding="UTF-8",standalone=True)
    print(fn,"removed",n)
# leftover check
s=open(dp,encoding="utf-8").read()
print("WineBank left in document:", s.count('w:author="WineBank"'), "paras:", len(list(root.iter(q("p")))))
