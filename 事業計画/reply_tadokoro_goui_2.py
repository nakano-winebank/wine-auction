# 田角様（Land＆Company）合意書 第2回PB（20261104）への回答：第1条1項の不足額確保を甲の義務として記載する修正を変更履歴で入れる。
# 使い方: python3 reply_tadokoro_goui_2.py <先方修正を承諾・merge_runs済みの unpacked>/word/document.xml
import re,sys
P=sys.argv[1]; AUTH="株式会社WineBank"; DATE="2026-11-04T00:00:00Z"
x=open(P,encoding='utf8').read()
cid=[9000]
def esc(s): return s.replace("&","&amp;").replace("<","&lt;").replace(">","&gt;")
def nid(): cid[0]+=1; return cid[0]
paras=list(re.finditer(r"<w:p[ >].*?</w:p>",x,re.S))
tgt=[m for m in paras if "本件約束" in "".join(re.findall(r"<w:t[^>]*>([^<]*)</w:t>",m.group(0))) and "本件出資総額" in m.group(0)]
assert len(tgt)==1; m=tgt[0]; p=m.group(0)
runs=list(re.finditer(r"<w:r(?:\s[^>]*)?>(<w:rPr>.*?</w:rPr>)?<w:t(?:\s[^>]*)?>([^<]*)</w:t></w:r>",p,re.S))
texts=[r.group(2) for r in runs]
assert texts[1].startswith("【WB：募集総額") and texts[3]=="PB：承知いたしました。" and texts[11]=="これを" and texts[12]=="確保", texts
def R(rpr,t): return f'<w:r>{rpr}<w:t xml:space="preserve">{esc(t)}</w:t></w:r>'
def D(rpr,t): return f'<w:del w:id="{nid()}" w:author="{AUTH}" w:date="{DATE}"><w:r>{rpr}<w:delText xml:space="preserve">{esc(t)}</w:delText></w:r></w:del>'
def I(rpr,t): return f'<w:ins w:id="{nid()}" w:author="{AUTH}" w:date="{DATE}"><w:r>{rpr}<w:t xml:space="preserve">{esc(t)}</w:t></w:r></w:ins>'
new={}
for i,r in enumerate(runs):
    rpr=r.group(1) or ""; t=r.group(2)
    if i in (1,2,3,4,11): new[i]=D(rpr,t)
    elif i==9:
        old="とし、対象会社は本件出資総額が1.5億円に満たない場合は、"; assert t.endswith(old)
        new[i]=R(rpr,t[:-len(old)])+D(rpr,old)+I(rpr,"とする。また、甲は、本件出資総額が150,000,000円に満たない場合には、六本木ミッドタウンにおける店舗の開業に必要な資金のうち当該不足額について、")
    elif i==10: new[i]=D(rpr,t)+I(rpr,"甲からの貸付け、金融機関からの借入れその他の方法により対象会社が")
    elif i==13: new[i]=D(rpr,t)+I(rpr,"できるよう、必要な措置を講じ、又は対象会社をして講じさせるものとする。")
    elif i==len(runs)-1:
        new[i]=r.group(0)+I(rpr,"【WB：ご提案ありがとうございます。記載の趣旨は承知しました。対象会社は本合意書の当事者ではないため、合意書の当事者である甲（WineBank）の義務として記載させてください。あわせて、対象を六本木ミッドタウン店の開業に必要な資金の不足額とし、確保の方法には追加の第三者割当等も含められるよう「その他の方法」を加えております。】")
out=p; 
for i in sorted(new,reverse=True):
    r=runs[i]; out=out[:r.start()]+new[i]+out[r.end():]
x=x[:m.start()]+out+x[m.end():]
open(P,'w',encoding='utf8').write(x); print("ok", cid[0]-9000, "revisions")
