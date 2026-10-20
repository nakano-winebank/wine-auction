# -*- coding: utf-8 -*-
"""合併候補7社 × あどばる  シナジー／マジョリティ評価"""
OK=1e8
ADV=20.0            # あどばるEquity（MBO前提のPre20億）
ADV_LOW=18.0        # SM LOI水準
NAK=74_000/201_616              # 中野個人（SO行使後）
NAK_VIZ=(74_000+94_400)/201_616 # 中野＋ビジョン分を取得した場合

# code, name, 時価総額(億), 筆頭株主, 筆頭%, 上位集中%, 事業, シナジー点
C=[
 (6579,'ログリー',      12.85,'吉永浩和',24.01,40.62,'ネイティブ広告配信',2),
 (6731,'ピクセラ',      13.22,'エボ・ファンド',21.10,26.80,'映像機器・チューナー',1),
 (7093,'アディッシュ',  13.70,'江戸浩樹',10.95,17.65,'SNS運用監視・カスタマーサクセス',2),
 (4378,'CINC',         16.10,'石松友典',25.93,48.85,'デジタルマーケ支援SaaS',3),
 (9215,'CaSy',         18.77,'ワタキューセイモア',19.20,53.50,'家事代行マッチング',5),
 (6558,'クックビズ',    18.20,'藪ノ賢次',32.49,44.23,'飲食業界特化の人材',4),
 (9342,'スマサポ',      20.50,'CABO DA ROCA',32.85,57.10,'賃貸管理会社向けDXアプリ',5),
]
print('='*104)
print('あどばるEquity {:.0f}億として、合併後の持分（あどばる側＝旧あどばる株主の合計）'.format(ADV))
print('='*104)
print('{:<6}{:<12}{:>7}{:>8}{:>9}{:>9}{:>10}{:>11}{:>8}'.format(
      'コード','社名','時価総額','合併後','あどばる側','中野個人','中野+ビジョン','相手筆頭','50.1%まで'))
print('{:<6}{:<12}{:>7}{:>8}{:>9}{:>9}{:>10}{:>11}{:>8}'.format(
      '','','(億)','時価(億)','(%)','(%)','(%)','合併後(%)','追加(億)'))
print('-'*104)
rows=[]
for code,nm,mc,h1,h1p,top,biz,syn in C:
    tot=ADV+mc
    side=ADV/tot*100
    nak=NAK*side
    nakviz=NAK_VIZ*side
    opp=h1p*(100-side)/100
    gap=max(0.0,50.1-nak)
    cost=gap/100*tot
    rows.append((code,nm,mc,tot,side,nak,nakviz,opp,cost,syn,h1,top,biz))
    print('{:<6}{:<12}{:>7.2f}{:>8.2f}{:>9.2f}{:>9.2f}{:>10.2f}{:>11.2f}{:>8.2f}'
          .format(code,nm,mc,tot,side,nak,nakviz,opp,cost))
print()
print('■ 「あどばる側が過半数」になる条件 = 相手の時価総額 < あどばるEquity')
for code,nm,mc,tot,side,nak,nakviz,opp,cost,syn,h1,top,biz in rows:
    j='○' if side>50 else '×'
    j2='○' if nakviz>50 else '×'
    print('   {:<12} あどばる側 {:>6.2f}% {}   中野＋ビジョン分 {:>6.2f}% {}'.format(nm,side,j,nakviz,j2))

print('\n■ あどばるを18億で評価した場合（SMのLOI水準）')
for code,nm,mc,*_ in rows:
    side=ADV_LOW/(ADV_LOW+mc)*100
    print('   {:<12} あどばる側 {:>6.2f}% {}  中野＋ビジョン分 {:>6.2f}%'
          .format(nm,side,'○' if side>50 else '×',NAK_VIZ*side))

print('\n'+'='*104)
print('■ 総合スコア（シナジー5点満点 ＋ マジョリティ5点満点）')
print('='*104)
def maj_score(side,opp,nakviz):
    s=0
    s+=2.5 if side>=60 else (2.0 if side>=55 else (1.5 if side>50 else 0.5))
    s+=1.5 if opp<10 else (1.0 if opp<15 else 0.5)
    s+=1.0 if nakviz>50 else (0.5 if nakviz>45 else 0.0)
    return s
out=[]
for code,nm,mc,tot,side,nak,nakviz,opp,cost,syn,h1,top,biz in rows:
    m=maj_score(side,opp,nakviz)
    out.append((syn+m,syn,m,code,nm,mc,side,nak,nakviz,opp,h1,biz))
for i,(tot_s,syn,m,code,nm,mc,side,nak,nakviz,opp,h1,biz) in enumerate(sorted(out,reverse=True),1):
    print('{}位 {:<12}({}) 合計{:>4.1f} = シナジー{} ＋ マジョリティ{:.1f}  / あどばる側{:.1f}% 相手筆頭{}{:.1f}%'
          .format(i,nm,code,tot_s,syn,m,side,h1,opp))
    print('     {}'.format(biz))
