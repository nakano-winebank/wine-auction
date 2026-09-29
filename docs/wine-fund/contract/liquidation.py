# 第16条10項（受託者買取）の代替：保証・買取・現物償還なしの換価手続
import re, html, subprocess, sys
SRC="un/word/document.xml"; AUTHOR="株式会社WineBank"; DATE="2026-09-30T00:00:00Z"
CM="/root/.claude/skills/synced/843eb632-0f1a-4cd1-8ff6-9c7a1257936c_e08a8281-da6b-45f5-9158-3c38a60baabf/docx/scripts/comment.py"
x=open(SRC,encoding="utf-8").read()
_id=[20000]
def nid(): _id[0]+=1; return _id[0]
esc=lambda t: html.escape(t, quote=False)
RPR='<w:rPr><w:rFonts w:ascii="ＭＳ 明朝" w:hAnsi="ＭＳ 明朝" w:hint="eastAsia"/></w:rPr>'
def mark(): return f'<w:rPr><w:ins w:id="{nid()}" w:author="{AUTHOR}" w:date="{DATE}"/><w:rFonts w:ascii="ＭＳ 明朝" w:hAnsi="ＭＳ 明朝"/></w:rPr>'
PPR={"item":'<w:pPr><w:tabs><w:tab w:val="left" w:pos="518"/></w:tabs><w:ind w:left="518" w:hanging="518"/>{r}</w:pPr>',
     "sub":'<w:pPr><w:tabs><w:tab w:val="left" w:pos="1260"/></w:tabs><w:ind w:left="1260" w:hanging="742"/>{r}</w:pPr>'}
def P(kind,text,num):
    return (f'<w:p>{PPR[kind].format(r=mark())}<w:ins w:id="{nid()}" w:author="{AUTHOR}" w:date="{DATE}"><w:r>{RPR}'
            f'<w:t xml:space="preserve">{esc(num)}</w:t><w:tab/><w:t xml:space="preserve">{esc(text)}</w:t></w:r></w:ins></w:p>')
def paras(): return [(m.start(),m.end()) for m in re.finditer(r'<w:p[ >].*?</w:p>',x,re.S)]
def alltext(p): return ''.join(re.findall(r'<w:(?:t|delText)[^>]*>([^<]*)</w:(?:t|delText)>',p))
def find(needle):
    h=[(a,b) for a,b in paras() if needle in alltext(x[a:b])]; assert h,needle; return h[0]

blocks=[
 P("item","有効期間の満了日（第15条に基づき延長された場合は延長後の満了日をいう。以下同じ。）において本財産たるワインその他の酒類が残存する場合（以下、当該残存するものを「残存在庫」という。）、営業者は、満了日の翌日から●ヶ月間（以下「清算期間」という。）、次の各号に定める順序により残存在庫を金銭に換価する。","10"),
 P("sub","清算期間の開始から●ヶ月間は、本事業における通常の販売経路（酒販店向け卸売及び一般消費者向け販売）により、別紙2に定める時価の●%を下限として売却する。","（1）"),
 P("sub","前号の期間の経過後なお残存する在庫は、受託者及びその関係者から独立した国内外の酒類オークションへの出品、又は受託者及びその関係者以外の3社以上の酒類事業者から見積りを取得する入札の方法により、最も有利な条件を提示した者に売却する。オークションに出品する場合の最低落札価格は、別紙2に定める時価の●%を上限として営業者が設定する。","（2）"),
 P("item","前項第2号のオークション又は入札には、受託者又はその関係者も他の参加者と同一の条件により参加することができる。この場合において、受託者又はその関係者が落札したときは、第9項の規定は適用しない。但し、受託者及びその関係者は、残存在庫を買い取る義務を一切負わないものとする。","11"),
 P("item","清算期間の満了時になお残存在庫がある場合、営業者は、受託者及びその関係者を除く本件匿名組合員の出資割合の過半の書面による同意を得て、次の各号のいずれかを選択する。同意が得られないときは、第2号によるものとする。","12"),
 P("sub","清算期間を●ヶ月を限度として延長し、第10項第2号の方法による売却を継続する。","（1）"),
 P("sub","最低落札価格を設けずに、受託者及びその関係者から独立した酒類オークションに出品して売却する。","（2）"),
 P("item","換価に要する費用（オークション手数料、輸送費、保険料、保管料その他の費用を含む。）は本事業の費用とし、換価代金から控除する。営業者は、残存在庫の換価の経過（売却方法、売却先の区分、数量及び価格を含む。）を本出資者に毎月報告する。","13"),
 P("item","営業者及び受託者は、本財産の売却価額、出資金の返還額その他本出資者の収益について何ら保証するものではない。本契約の終了に伴う分配は、本条に基づく換価の完了後、第9条に準じて本損益を確定したうえで、出資割合に応じて金銭により行うものとし、本財産の現物による分配は行わない。第4項に定める出資の価額の返還は、清算期間（前項により延長された場合は延長後の期間）の終了後速やかに行う。","14"),
]
a,b=find("これを買い取るものとする")
x=x[:b]+''.join(blocks)+x[b:]
open(SRC,"w",encoding="utf-8").write(x)

def comment(needle,text):
    global x
    r=subprocess.run([sys.executable,CM,"un",text,"--author",AUTHOR,"--initials","WB"],check=True,capture_output=True,text=True)
    cid=re.search(r'w:id="(\d+)"',r.stdout).group(1)
    x=open(SRC,encoding="utf-8").read()
    a,b=find(needle); p=x[a:b]; k=p.index('</w:pPr>')+8
    p=(p[:k]+f'<w:commentRangeStart w:id="{cid}"/>'+p[k:-6]+f'<w:commentRangeEnd w:id="{cid}"/><w:r><w:rPr><w:rStyle w:val="CommentReference"/></w:rPr><w:commentReference w:id="{cid}"/></w:r></w:p>')
    x=x[:a]+p+x[b:]; open(SRC,"w",encoding="utf-8").write(x)

comment("残存在庫を金銭に換価する",
 "受託者買取（削除済みの旧第10項）に代わる換価手続です。考え方は次のとおりです。(1)通常販路→独立オークション／3社以上の入札→なお残れば出資者（WineBankを除く）が延長か最低価格なしの売却かを選ぶ、という市場価格に委ねる段階的な手続とし、WineBankは保証も買取義務も負いません（第11項・第14項）。(2)分配はすべて金銭とし、現物償還は行いません（第14項）。(3)WineBankも出資割合60%で同じ売却価格の結果を負うため、安売りの動機はなく、投資家にとってもフェアです。(4)延長・投げ売りの選択権はWineBank以外の出資者に置き、利益相反を避けています。●の期間・下限率は事業判断です。")
comment("他の参加者と同一の条件により参加することができる",
 "【会計確認事項】WineBankに買取の義務や権利（コール・オプション）はなく、独立オークション等で他者と同条件で入札できるだけなので、買戻条件付の取引には当たらず、SPCへの譲渡は売却として扱える整理です。ただし最終判断は監査法人・会計士にご確認ください。懸念が残る場合は、本項前段（WineBankの入札参加）を削除し「受託者及びその関係者は入札に参加しない」とすれば、より保守的になります。")
