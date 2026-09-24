# -*- coding: utf-8 -*-
"""確定前提での再計算
 ①中野は重松側(重松+ダブルパインズ)と同数まで ②パートナーは未定 
 ③ビジョン株は市場売却・借入7.90億はみずほリファイ ④MBOは50.0%のまま"""
PX=229.0; OK=1e8
SM=12_105_900
SHIGE, DP, TKP = 2_950_000, 1_670_000, 2_550_000
MAYNAVI, TATEMONO, SASAKI = 330_000, 170_000, 120_000
SM_FLOAT_BASE = 2_795_900+690_000+530_000+170_000+130_000   # その他/CA/鈴木/XTech/吉岡
ADV={'ビジョン':94_400,'中野 邦人':74_000,'BOS':10_000,'エアトリ':8_000,'KUMA':6_000,
     'フィル・カンパニー':4_000,'ベクトル':3_216,'アンビション':2_000}
ADV_TOT=201_616; EQ=18.0e8
new=round(EQ/PX); TOT=SM+new; per=new/ADV_TOT
nak=round(ADV['中野 邦人']*per); viz=round(ADV['ビジョン']*per)
adv_corp=sum(round(v*per) for k,v in ADV.items() if k not in('中野 邦人','ビジョン'))
TARGET=SHIGE+DP                              # 重松側と同数

print('='*78); print('【B案】合併 ─ ビジョン株は市場売却、中野は重松側と同数まで取得')
print('='*78)
buy=TARGET-nak
print('合併後発行済 {:,}株 / 株価{:.0f}円 / 時価総額 {:.1f}億'.format(TOT,PX,TOT*PX/OK))
print('  合併直後の中野 {:,}株 ({:.2f}%)'.format(nak,nak/TOT*100))
print('  重松側(重松{:,}＋DP{:,}) = {:,}株 ({:.2f}%)'.format(SHIGE,DP,TARGET,TARGET/TOT*100))
print('  → 中野の追加取得 {:,}株 = {:.2f}億円'.format(buy,buy*PX/OK))
print('  → 取得後の中野 {:,}株 = {:.2f}%  ★登録上の単独筆頭・重松側と同数'
      .format(TARGET,TARGET/TOT*100))
print('  1/3(33.33%)まで {:.2f}pt の余裕 → TOB不要'.format(100/3-TARGET/TOT*100))

print('\n■ ビジョン株 {:,}株（{:.2f}億円）の受け皿'.format(viz,viz*PX/OK))
rest=viz-buy
print('  中野が引き受け  {:>10,}株  {:>5.2f}億円  （売出しの{:.1f}%）'.format(buy,buy*PX/OK,buy/viz*100))
print('  市場が吸収      {:>10,}株  {:>5.2f}億円  （売出しの{:.1f}%）'.format(rest,rest*PX/OK,rest/viz*100))
print('  → 市場が捌く額は8.43億→{:.2f}億に圧縮される'.format(rest*PX/OK))

excl = SHIGE+DP+TKP+MAYNAVI+TATEMONO+SASAKI+adv_corp+TARGET   # 中野は取得後TARGET株
fl=(TOT-excl)/TOT*100
print('\n■ 流通株式比率  {:.2f}%  （東証グロース基準25%）{}'.format(fl,'○ クリア' if fl>=25 else '× 抵触'))
print('   内訳: 流通 {:,}株 = 既存流通{:,} ＋ 市場が吸収した{:,}'
      .format(TOT-excl,SM_FLOAT_BASE,rest))

print('\n■ 合併後の株主（上位）')
rows=[('中野 邦人',TARGET),('重松 大輔',SHIGE),('TKP',TKP),('ダブルパインズ',DP),
      ('その他SM株主＋市場吸収分',SM_FLOAT_BASE+rest),('旧あどばる法人6社',adv_corp),
      ('マイナビ',MAYNAVI),('東京建物',TATEMONO),('佐々木 正将',SASAKI)]
for n,sh in sorted(rows,key=lambda r:-r[1]):
    print('   {:<26}{:>11,}株 {:>7.2f}%'.format(n,sh,sh/TOT*100))
print('   合計 {:,}株'.format(sum(r[1] for r in rows)))

print('\n'+'='*78); print('【A案】MBO ─ 50.0%（据え置き）')
print('='*78)
print('  中野ファンド 61,180株 = 6.10億 / パートナー 135,180株 = 13.47億')
print('  中野陣営 135,180株 = 50.000%（パートナーと同数・登録上は筆頭）')
print('\n■ パートナー金額の感度（中野6.10億は固定、H=手元資金）')
print('  {:<8}{:<10}{:>9}{:>9}{:>9}{:>10}{:>9}'.format(
      'みずほ','パートナー','増資計','純資産','総資産','自己資本比率','手元'))
for R in (3.00,5.00,7.90):
    for P in (13.47,12.00,10.00,8.57):
        E=6.10+P; NA=E-15.764; TA=14.04+E+R-21.07; H=E+R-21.07+0.60
        mark='' if NA>0 and NA/TA>=0.15 else ('  ← 債務超過' if NA<=0 else '  ← 自己資本比率が薄い')
        print('  {:<8.2f}{:<10.2f}{:>9.2f}{:>9.2f}{:>9.2f}{:>9.1f}%{:>9.2f}{}'
              .format(R,P,E,NA,TA,NA/TA*100,H,mark))
    print()
print('='*78)
print('中野の必要資金:  A案 6.10億  /  B案 {:.2f}億   差 {:.2f}億'.format(buy*PX/OK,6.10-buy*PX/OK))
print('='*78)
