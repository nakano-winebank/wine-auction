# -*- coding: utf-8 -*-
"""スマサポ(9342) × あどばる 合併後の株主名簿
   前提: スマサポ20億 / あどばる15億"""
import csv
SM_SHARES = 2_405_200          # スマサポ発行済（会社IR）
SM_VAL    = 20.0e8
ADV_VAL   = 15.0e8
ADV_TOT   = 201_616            # あどばる発行済（SO行使後）

SM_PX  = SM_VAL/SM_SHARES                     # 831.52円
NEW    = round(ADV_VAL/SM_VAL*SM_SHARES)      # 交付新株 1,803,900株
RATIO  = NEW/ADV_TOT                          # あどばる1株あたりの交付株数
TOT    = SM_SHARES+NEW

# あどばる株主
ADV=[('ビジョン','旧あどばる',94_400),('中野 邦人','旧あどばる',74_000),
     ('BOS','旧あどばる',10_000),('エアトリ','旧あどばる',8_000),
     ('KUMA','旧あどばる',6_000),('フィル・カンパニー','旧あどばる',4_000),
     ('ベクトル','旧あどばる',3_216),('アンビション','旧あどばる',2_000)]
assert sum(x[2] for x in ADV)==ADV_TOT
# スマサポ株主（2025年9月期末〜2026年3月末の公表比率から株数換算）
SM=[('CABO DA ROCA（太田氏資産管理会社）','旧スマサポ',790_000),
    ('太田 卓利','旧スマサポ',443_300),
    ('大東建託パートナーズ','旧スマサポ',140_000),
    ('Hamagin DG Innovation投資事業有限責任組合','旧スマサポ',116_652),
    ('太田 玲','旧スマサポ',63_016),
    ('三好不動産','旧スマサポ',50_028),
    ('ENECHANGE','旧スマサポ',46_901),
    ('小田 慎三（代表取締役社長）','旧スマサポ',32_230),
    ('衣笠 賢二','旧スマサポ',30_065),
    ('地域とトモニ1号投資事業有限責任組合','旧スマサポ',25_014)]
SM.append(('その他株主','旧スマサポ',SM_SHARES-sum(x[2] for x in SM)))

rows=[]
for n,src,sh in ADV:
    rows.append([n,src,sh,round(sh*RATIO)])
adj=NEW-sum(r[3] for r in rows)
if adj: rows[0][3]+=adj      # 端数は最大株主で調整
for n,src,sh in SM:
    rows.append([n,src,'—',sh])
rows.sort(key=lambda r:-r[3])

print('='*92)
print('スマサポ(9342) × あどばる 合併後 株主名簿')
print('='*92)
print('  スマサポ評価 {:.0f}億 / 発行済 {:,}株 → 1株 {:,.2f}円'.format(SM_VAL/1e8,SM_SHARES,SM_PX))
print('  あどばる評価 {:.0f}億 / 発行済 {:,}株 → 1株 {:,.2f}円'.format(ADV_VAL/1e8,ADV_TOT,ADV_VAL/ADV_TOT))
print('  合併比率  あどばる1株 : スマサポ {:.4f}株'.format(RATIO))
print('  交付新株  {:,}株   合併後発行済 {:,}株   合併後時価総額 {:.0f}億'
      .format(NEW,TOT,(SM_VAL+ADV_VAL)/1e8))
print('-'*92)
print('  {:<42}{:<10}{:>12}{:>9}'.format('株主','出身','株数','比率'))
for n,src,orig,sh in rows:
    print('  {:<42}{:<10}{:>12,}{:>8.2f}%'.format(n,src,sh,sh/TOT*100))
print('-'*92)
print('  {:<52}{:>12,}{:>8.2f}%'.format('合計',sum(r[3] for r in rows),100.0))

g=lambda names: sum(r[3] for r in rows if r[0] in names)
ota=g({'CABO DA ROCA（太田氏資産管理会社）','太田 卓利','太田 玲'})
nak=g({'中野 邦人'}); viz=g({'ビジョン'})
print('\n■ 陣営別')
print('  太田氏側（資産管理会社＋本人＋太田玲氏） {:>10,}株 {:>6.2f}%'.format(ota,ota/TOT*100))
print('  ビジョン                              {:>10,}株 {:>6.2f}%  ← 合併後の筆頭株主'.format(viz,viz/TOT*100))
print('  中野 邦人                             {:>10,}株 {:>6.2f}%'.format(nak,nak/TOT*100))

print('\n■ ビジョンが退出した場合の中野の立ち位置')
print('  (a) ビジョン株を市場へ放出 → 中野 {:.2f}% で第2位（CABO DA ROCA {:.2f}% が筆頭）'
      .format(nak/TOT*100, g({'CABO DA ROCA（太田氏資産管理会社）'})/TOT*100))
for lab,target in (('太田氏側と同数',ota),('ビジョン株を全部取得',nak+viz)):
    need=target-nak if lab=='太田氏側と同数' else viz
    print('  (b) {:<18} 追加 {:>9,}株 = {:>5.2f}億円 → 中野 {:>6.2f}%'
          .format(lab,need,need*SM_PX/1e8,(nak+need)/TOT*100))

with open('株主名簿_スマサポ合併後.csv','w',newline='',encoding='utf-8-sig') as f:
    w=csv.writer(f)
    w.writerow(['株主','出身','合併前株数(あどばる)','合併後株数','比率'])
    for n,src,orig,sh in rows:
        w.writerow([n,src,orig,sh,'{:.2f}%'.format(sh/TOT*100)])
    w.writerow(['合計','','',sum(r[3] for r in rows),'100.00%'])
    w.writerow([])
    w.writerow(['前提','スマサポ20億/あどばる15億','合併比率','あどばる1株:スマサポ{:.4f}株'.format(RATIO),''])
    w.writerow(['','交付新株',NEW,'合併後発行済',TOT])
print('\n→ 株主名簿_スマサポ合併後.csv を出力しました')

# --- 流通株式比率 ---
EXCL={'ビジョン','CABO DA ROCA（太田氏資産管理会社）','中野 邦人','太田 卓利','大東建託パートナーズ',
      '太田 玲','三好不動産','ENECHANGE','小田 慎三（代表取締役社長）',
      'BOS','エアトリ','KUMA','フィル・カンパニー','ベクトル','アンビション'}
ex=sum(r[3] for r in rows if r[0] in EXCL)
fl=TOT-ex
print('\n■ 流通株式比率（東証グロース基準 25%）')
print('  除外（役員・10%以上保有者・事業法人） {:>10,}株'.format(ex))
print('  流通株式                            {:>10,}株 = {:.2f}%  {}'
      .format(fl,fl/TOT*100,'○' if fl/TOT>=0.25 else '× 基準に抵触'))
print('  ビジョン株 {:,}株が市場に出た場合 → {:.2f}%  ○'
      .format(viz,(fl+viz)/TOT*100))
