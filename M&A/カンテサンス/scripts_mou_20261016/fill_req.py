# -*- coding: utf-8 -*-
# ストライク「譲り受け側の調査に関するご依頼事項」に当社回答を修正履歴で記入する
import sys,copy
sys.path.insert(0,sys.argv[2])
import redline
from redline import *
redline.DATE='2026-11-01T09:00:00Z'
W14='{http://schemas.microsoft.com/office/word/2010/wordml}'
d=Doc(sys.argv[1])

def put(p,text):
    """空の段落に挿入履歴付きで文字を入れる"""
    like=None
    pPr=p.find(W+'pPr')
    rPr=pPr.find(W+'rPr') if pPr is not None else None
    r=etree.Element(W+'r')
    if rPr is not None:
        rp=copy.deepcopy(rPr); rp.tag=W+'rPr'
        for x in rp.findall(W+'ins')+rp.findall(W+'del'): rp.remove(x)
        r.append(rp)
    t=etree.SubElement(r,W+'t'); t.text=text; t.set(XMLNS+'space','preserve')
    ins=mk('ins'); ins.append(r); p.append(ins)

def fill(p,lines):
    put(p,lines[0]); cur=p
    for ln in lines[1:]: cur=insert_para_after(cur,ln)

def check(idx):
    s=list(d.body.iter(W+'sdt'))[idx]
    c=s.find('.//'+W14+'checked'); c.set(W14+'val','1')
    r=s.find(W+'sdtContent').find(W+'r')
    nr=copy.deepcopy(r); nr.find(W+'t').text='☑'
    to_del(r)
    ins=mk('ins'); ins.append(nr); s.find(W+'sdtContent').append(ins)

tbls=list(d.body.iter(W+'tbl'))
cell=lambda ti,ri=0,ci=0: tbls[ti].findall(W+'tr')[ri].findall(W+'tc')[ci].findall(W+'p')[0]

# (2) 背景
fill(cell(0),[
 '当社は、ワインの流通を通じて日本のガストロノミーに携わってきた会社であり、生産者（川上）とレストラン（川下）をつなぎ、日本の優れたレストランを次の世代に残すことをグループの方針としております。',
 '当社グループは、創業40年を超える老舗フレンチレストラン「アピシウス」を事業承継し、従業員を入れ替えることなく、働く環境の整備と経営管理の仕組みづくりを進めた結果、業績を大きく伸ばしてまいりました。',
 'カンテサンスは、日本を代表する三つ星レストランであり、岸田様が築かれたブランドとスタッフの皆様を次の世代へ引き継ぐことは、当社の方針と合致するものです。当社は、アピシウスでの経験を活かし、岸田様と共に段階的な承継を進め、カンテサンスが長く続くレストランとなるよう、責任をもって取り組んでまいります。'])

# (3) 資金調達：その他
check(3)
fill(cell(2),[
 '金融機関からの借入（LBOローン）と、株式取得後の対象会社の手元資金の活用を組み合わせます。',
 '・本件提携の実行時（2026年12月、35億円）：金融機関からの借入 約15億円、及び株式取得後に活用する対象会社の現預金 約20億円',
 '・基礎金額残金（2027年3月末まで、15億円）：金融機関からの借入（協議中）',
 '・追加対価（最終契約締結日から3年後、5億円）：対象会社の事業から生じる資金',
 'なお、取得関連費用は当社の自己資金で負担いたします。'])

# (4) 成約報酬の原資：自己資金
check(4)
# (5) 資金管理：親会社等で管理
check(7)
# (6) 過去1年間の買収件数
replace(d,'件）','　　　　件','　　2　件')
# (7) グループ会社の構成
insert_para_after(find_para(d,'貴社の子会社および関連会社についても'),'　　 （回答）別紙「グループ会社の構成」のとおりです。当社を含むグループ各社は、いずれも中野邦人を筆頭株主として構成しております。')
# (8) 役員
put(cell(5,1,0),'中野　邦人'); put(cell(5,1,1),'代表取締役'); put(cell(5,1,2),'1979年3月13日')
put(cell(5,2,0),'疋田　一久'); put(cell(5,2,1),'取締役')
put(cell(5,3,0),'戸高　薫'); put(cell(5,3,1),'取締役')
put(cell(5,4,0),'岩瀬　喜保'); put(cell(5,4,1),'監査役')
# (9) 主要株主
put(cell(6,1,0),'中野　邦人'); put(cell(6,1,1),'－')
# (10) 外国投資家：該当しない
check(9)
# (11) トラブル：なし
check(12)
# 回答日・回答者
replace(d,'回答日','　　　　　年　　　月　　　日','　2026年　11月　1日')
replace(d,'回答者','　　　　　　　　　　　　　　　　　（役職：　　　　　　　　　　　）','　株式会社WineBank　中野　邦人　（役職：代表取締役）')
d.save(); print('ok')
