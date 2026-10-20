# -*- coding: utf-8 -*-
"""あどばる15億・中野は筆頭or第2位でOK・BSを加味した再評価"""
ADV=15.0
NAK=74_000/201_616
ADV_NA=-2.59   # クロージング直前の時価純資産
# name, code, 時価総額, 純資産, 自己資本比率, 有利子負債, 現金, 営業利益(直近/予), 筆頭%, 第2位%
C=[
 ('ログリー',6579,12.85, 4.15,45.5,1.03,4.49,-0.50,24.01,10.00),
 ('ピクセラ',6731,13.22, 9.85,None,None,None,-11.85,21.10,5.70),
 ('アディッシュ',7093,13.70, 5.43,40.8,None,None,0.70,10.95,6.70),
 ('CINC',4378,16.10,10.55,76.5,0.17,8.47,0.07,25.93,22.92),
 ('クックビズ',6558,18.20,10.98,28.8,20.30,18.04,-3.74,32.49,11.74),
 ('CaSy',9215,18.77, 2.74,39.0,2.12,None,-1.33,19.20,16.27),
 ('スマサポ',9342,20.50, 5.71,68.8,None,None,2.30,32.85,18.43),
]
print('='*112)
print('あどばるEquity 15.0億 ／ 中野は合併後に筆頭または第2位であればよい')
print('='*112)
print('{:<11}{:>6}{:>8}{:>8}{:>8}{:>9}{:>9}{:>9}{:>8}{:>10}'.format(
  '社名','コード','時価総額','あどばる側','中野','相手筆頭','中野の順位','合算営業益','ネット現金','のれん'))
rows=[]
for nm,cd,mc,na,er,debt,cash,op,h1,h2 in C:
    side=ADV/(ADV+mc)*100
    nak=NAK*side
    opp1=h1*(100-side)/100
    opp2=h2*(100-side)/100
    rank='筆頭' if nak>opp1 else ('第2位' if nak>opp2 else '第3位以下')
    combo=2.00+op
    net=(cash-debt) if (cash is not None and debt is not None) else None
    rev = side>50          # 逆取得の可能性
    gw  = (mc-na) if rev else (ADV-ADV_NA)
    rows.append((nm,cd,mc,side,nak,opp1,rank,combo,net,gw,rev,na,er,debt,cash,op))
    print('{:<11}{:>6}{:>8.2f}{:>8.2f}%{:>8.2f}%{:>8.2f}%{:>9}{:>9.2f}{:>8}{:>10.2f}{}'.format(
      nm,cd,mc,side,nak,opp1,rank,combo,('—' if net is None else '{:+.2f}'.format(net)),gw,
      ' 逆取得' if rev else ' 通常'))
print('\n※ のれん＝逆取得なら「相手の時価総額−相手の純資産」、通常取得なら「15億−あどばる時価純資産△2.59億＝17.59億」')

print('\n■ ビジョン借入7.90億を、相手の手元資金で返せるか')
for nm,cd,mc,side,nak,opp1,rank,combo,net,gw,rev,na,er,debt,cash,op in rows:
    if net is None: print('   {:<11} 現金または有利子負債が未入手'.format(nm)); continue
    print('   {:<11} ネット現金 {:+.2f}億 → {}'.format(nm,net,'自己資金で返済可能 ○' if net>=7.90 else '不足 ×（差 {:.2f}億）'.format(7.90-net)))

print('\n■ のれん償却後の合算営業利益（20年償却）')
for nm,cd,mc,side,nak,opp1,rank,combo,net,gw,rev,na,er,debt,cash,op in sorted(rows,key=lambda r:-(r[7]-r[9]/20)):
    print('   {:<11} 合算{:>6.2f}億 − 償却{:.2f}億 = {:>6.2f}億 {}'.format(nm,combo,gw/20,combo-gw/20,
          '' if combo-gw/20>0 else '← 赤字'))

print('\n■ 財務の健全性（①）')
print('   {:<11}{:>9}{:>12}{:>12}{:>10}'.format('社名','純資産','自己資本比率','有利子負債','営業利益'))
for nm,cd,mc,side,nak,opp1,rank,combo,net,gw,rev,na,er,debt,cash,op in rows:
    print('   {:<11}{:>8.2f}億{:>11}{:>11}{:>9.2f}億'.format(nm,na,
      ('—' if er is None else '{:.1f}%'.format(er)),
      ('—' if debt is None else '{:.2f}億'.format(debt)), op))
