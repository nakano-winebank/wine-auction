# -*- coding: utf-8 -*-
"""B案との差額を市場放出するハイブリッド案の検証"""
TOT=4_209_100; PX=831.53
NAK0=662_093          # 合併直後の中野
VIZ =844_617          # ビジョン保有
OTA =1_296_316        # 太田氏側（CABO DA ROCA＋太田卓利＋太田玲）
FLOAT0=839_725        # ビジョン処理前の流通株式
ADV_CORP=297_190      # 旧あどばる法人6社（BOS/エアトリ/KUMA/フィル/ベクトル/アンビション）
NEED_B=OTA-NAK0       # B案で中野が取得する株数

print('='*86)
print('【D案】中野が太田氏側と同数まで買い、残りを市場に放出')
print('='*86)
to_mkt=VIZ-NEED_B
fl=FLOAT0+to_mkt
print('  ビジョン保有        {:>9,}株'.format(VIZ))
print('  中野が取得（B案）    {:>9,}株 = {:.2f}億円 → 中野 {:,}株 {:.2f}%'
      .format(NEED_B,NEED_B*PX/1e8,NAK0+NEED_B,(NAK0+NEED_B)/TOT*100))
print('  市場へ放出          {:>9,}株 = {:.2f}億円'.format(to_mkt,to_mkt*PX/1e8))
print('  → 流通株式比率      {:>9,}株 = {:.3f}%  {}'
      .format(fl,fl/TOT*100,'○' if fl/TOT>=0.25 else '× 25%にわずかに届かない'))
gap=TOT*0.25-fl
print('  → 25%まであと       {:>9,.0f}株（{:.3f}pt）'.format(gap,gap/TOT*100))

print('\n■ 流通株式比率25%ちょうどを満たす上限')
need_mkt=TOT*0.25-FLOAT0
cap=VIZ-need_mkt
print('  市場へ必要な株数    {:>9,.0f}株'.format(need_mkt))
print('  中野の取得上限      {:>9,.0f}株 = {:.2f}億円'.format(cap,cap*PX/1e8))
print('  → 中野 {:,.0f}株 = {:.2f}%   太田氏側 {:,}株 = {:.2f}%'
      .format(NAK0+cap,(NAK0+cap)/TOT*100,OTA,OTA/TOT*100))
print('  → 差 {:,.0f}株（{:.3f}pt）で、中野は第2位にとどまる'
      .format(OTA-(NAK0+cap),(OTA-(NAK0+cap))/TOT*100))

print('\n'+'='*86)
print('【E案】旧あどばる法人6社（{:,}株）も市場で売却する場合'.format(ADV_CORP))
print('='*86)
print('  この6社は事業法人のため流通株式から除外されています。市場で売れば流通が増えます。\n')
print('  {:<34}{:>12}{:>12}{:>10}'.format('中野の取得','中野の持分','流通株式比率','必要資金'))
for lab,x in (('0株（全部market）',0),('B案と同数',NEED_B),('ビジョン株を全部取得',VIZ)):
    fl2=FLOAT0+(VIZ-x)+ADV_CORP
    print('  {:<34}{:>11.2f}%{:>11.2f}%{:>9.2f}億'
          .format(lab,(NAK0+x)/TOT*100,fl2/TOT*100,x*PX/1e8))
print('\n  → 6社が売れば制約が外れ、B案フル（太田氏側と同数30.80%）でも32.01%を確保できる')
