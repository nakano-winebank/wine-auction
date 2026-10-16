# -*- coding: utf-8 -*-
import sys,subprocess,re; sys.path.insert(0,'.')
from redline import *
D='/mnt/skills/public/docx/scripts'
C=[
('基本合意書','10/16の面談で、基本合意書は大項目にとどめ中・小項目は最終契約へ回す方向となりましたので、当社として外せない大項目（価格、実行時の支払、条件付きの追加支払、関与期間、役員貸付金、実行日までの運営、資金調達、秘密保持）を残す形で簡略化しました。削除した項目（旧第2条第5項、旧第8条第5項各号・第7項〜第9項の詳細）は、最終契約で協議させてください。'),
('支払方法（乙による役員退職慰労金としての支給その他の方法）','役員退職慰労金としてお支払いする場合、「将来3年分の役員報酬の前払い」と書面に残ると、過去の在任期間に対する退職給与であることが否定され、乙の損金算入と岸田様の退職所得課税の双方が認められないおそれがあります。双方の税負担を守るため、金額のみの記載としました（経済条件は変わりません）。'),
('各判定日の直前に発表されたミシュランガイド東京','ご質問⑤を踏まえ、判定の基準日と判定に用いるガイドの考え方を明記しました。判定に用いる年版と支払日は、最終契約で確定させてください。'),
('取締役（実行時に代表取締役を退任）','役員退職慰労金を損金とするには、実行時に代表取締役を退任し、経営上の主要な地位から外れること（分掌変更）が必要なため、実行時の退任を基礎としました（報酬は年2,000万円）。お客様・スタッフから見た岸田様のお立場（料理長としてのご在籍）は従前どおりとし、伝え方は第8条第6項のとおり段階的に進めます。'),
('本件提携の実行後の乙の経営は甲の責任において行う','旧第6項〜第9項を1項にまとめました。面談でのご懸念を踏まえ、実行後の経営は当社が責任を負い、三つ星の結果を岸田様が保証するものではない旨を明記しています。'),
('その企画及び立上げに関与するよう努める','新規事業への関与を義務付けない方針は尊重しつつ、承継と三つ星の維持に支障のない範囲での協力と、企画・立上げへのご関与（努力義務）をお願いしたく追記しました。面談でのお話のとおり、本格的な取組みは引継ぎの後を想定しています。'),
]
for needle,text in C:
    out=subprocess.run(['python3',D+'/comment.py','w/',text,'--author','株式会社WineBank','--initials','WB'],capture_output=True,text=True)
    m=re.search(r'Added comment id=(\d+)',out.stdout); assert m,(out.stdout,out.stderr)
    cid=m.group(1)
    d=Doc('w/word/document.xml')
    ps=[p for p in d.paras() if (vis_text(p).strip()==needle if needle=='基本合意書' else needle in vis_text(p))]
    assert len(ps)>=1,needle; p=ps[0]
    s=etree.Element(W+'commentRangeStart'); s.set(W+'id',cid)
    pPr=p.find(W+'pPr'); (pPr.addnext(s) if pPr is not None else p.insert(0,s))
    e=etree.SubElement(p,W+'commentRangeEnd'); e.set(W+'id',cid)
    r=etree.SubElement(p,W+'r'); rp=etree.SubElement(r,W+'rPr'); rs=etree.SubElement(rp,W+'rStyle'); rs.set(W+'val','CommentReference')
    cr=etree.SubElement(r,W+'commentReference'); cr.set(W+'id',cid)
    d.save(); print('comment',cid,len(ps))
