# -*- coding: utf-8 -*-
# 修正履歴（w:ins / w:del）を既存のdocxに書き込むための最小エンジン
import copy
from lxml import etree
WNS='http://schemas.openxmlformats.org/wordprocessingml/2006/main'
W='{%s}'%WNS
XMLNS='{http://www.w3.org/XML/1998/namespace}'
AUTHOR='株式会社WineBank'; DATE='2026-10-30T09:00:00Z'
_id=[200000]
def nid():
    _id[0]+=1; return str(_id[0])
def mk(tag):
    e=etree.Element(W+tag); e.set(W+'id',nid()); e.set(W+'author',AUTHOR); e.set(W+'date',DATE); return e

class Doc:
    def __init__(s,path):
        s.path=path; s.tree=etree.parse(path); s.body=s.tree.getroot().find(W+'body')
    def save(s): s.tree.write(s.path,xml_declaration=True,encoding='UTF-8',standalone=True)
    def paras(s): return list(s.body.iter(W+'p'))

def in_del(el):
    a=el.getparent()
    while a is not None:
        if a.tag==W+'del': return True
        a=a.getparent()
    return False

def vis_runs(p):
    return [(t,t.getparent()) for t in p.iter(W+'t') if not in_del(t)]
def vis_text(p): return ''.join((t.text or '') for t,_ in vis_runs(p))

def find_para(doc,needle,exact=False):
    hits=[p for p in doc.paras() if (vis_text(p).strip()==needle if exact else needle in vis_text(p))]
    assert len(hits)==1,(needle,len(hits))
    return hits[0]

def split_run(r, off):
    ts=r.findall(W+'t'); assert len(ts)==1, etree.tostring(r)[:200]
    t=ts[0]; txt=t.text or ''
    if off<=0 or off>=len(txt): return
    r2=copy.deepcopy(r)
    t.text=txt[:off]; t.set(XMLNS+'space','preserve')
    t2=r2.find(W+'t'); t2.text=txt[off:]; t2.set(XMLNS+'space','preserve')
    r.addnext(r2)

def to_del(r):
    d=mk('del'); r.addprevious(d); d.append(r)
    for t in r.findall(W+'t'):
        t.tag=W+'delText'; t.set(XMLNS+'space','preserve')

def run_after_point(r):
    par=r.getparent()
    if par.tag==W+'del': r=par; par=r.getparent()
    if par.tag==W+'p': return r
    if par.tag==W+'ins':
        sibs=list(par); i=sibs.index(r); rest=sibs[i+1:]
        if rest:
            n=copy.deepcopy(par)
            for c in list(n): n.remove(c)
            n.set(W+'id',nid())
            for c in rest: n.append(c)
            par.addnext(n)
        return par
    raise Exception('unexpected parent '+par.tag)

def new_run(text, like):
    r=etree.Element(W+'r')
    rp=like.find(W+'rPr') if like is not None else None
    if rp is not None:
        rp=copy.deepcopy(rp)
        for x in rp.findall(W+'ins')+rp.findall(W+'del'): rp.remove(x)
        r.append(rp)
    t=etree.SubElement(r,W+'t'); t.text=text; t.set(XMLNS+'space','preserve')
    return r

def _cut(p,cut):
    pos=0
    for t,r in vis_runs(p):
        L=len(t.text or '')
        if pos<cut<pos+L: split_run(r,cut-pos); return
        pos+=L

def replace(doc, para_needle, old, new, exact=False):
    p=find_para(doc,para_needle,exact)
    full=vis_text(p); k=full.find(old)
    assert k>=0 and full.count(old)==1,(old,full.count(old))
    end=k+len(old)
    _cut(p,end); _cut(p,k)
    pos=0; affected=[]; before=None
    for t,r in vis_runs(p):
        L=len(t.text or '')
        if pos>=k and pos+L<=end and L>0: affected.append(r)
        if pos+L<=k and L>0: before=r
        pos+=L
    like = affected[0] if affected else before
    for r in affected: to_del(r)
    if new:
        ins=mk('ins'); ins.append(new_run(new,like))
        anchor=run_after_point(affected[-1] if affected else before)
        anchor.addnext(ins)
    return p

def insert_after_text(doc, para_needle, anchor_text, new, exact=False):
    p=find_para(doc,para_needle,exact)
    full=vis_text(p); k=full.find(anchor_text); assert k>=0 and full.count(anchor_text)==1,(anchor_text,full.count(anchor_text))
    cut=k+len(anchor_text); _cut(p,cut)
    pos=0; before=None
    for t,r in vis_runs(p):
        L=len(t.text or '')
        if pos+L<=cut and L>0: before=r
        pos+=L
    ins=mk('ins'); ins.append(new_run(new,before)); run_after_point(before).addnext(ins)
    return p

def mark_para(p, kind):
    pPr=p.find(W+'pPr')
    if pPr is None: pPr=etree.Element(W+'pPr'); p.insert(0,pPr)
    rPr=pPr.find(W+'rPr')
    if rPr is None: rPr=etree.SubElement(pPr,W+'rPr')
    idx=0
    if kind=='del' and rPr.find(W+'ins') is not None: idx=list(rPr).index(rPr.find(W+'ins'))+1
    rPr.insert(idx,mk(kind))

def delete_para(doc, para_needle=None, p=None):
    if p is None: p=find_para(doc,para_needle)
    for t,r in vis_runs(p):
        if (t.text or '')!='': to_del(r)
    mark_para(p,'del')
    return p

def insert_para_after(ref_p, text):
    np=etree.Element(W+'p')
    pPr=ref_p.find(W+'pPr')
    if pPr is not None:
        np2=copy.deepcopy(pPr)
        rp=np2.find(W+'rPr')
        if rp is not None:
            for x in rp.findall(W+'ins')+rp.findall(W+'del'): rp.remove(x)
        np.append(np2)
    mark_para(np,'ins')
    like=None
    for t,r in vis_runs(ref_p): like=r; break
    ins=mk('ins'); ins.append(new_run(text,like)); np.append(ins)
    ref_p.addnext(np)
    return np
