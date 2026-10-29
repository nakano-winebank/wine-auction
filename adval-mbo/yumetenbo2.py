# -*- coding: utf-8 -*-
"""面談結果反映：RIZAP株30%を約3億で取得（TOB不要）／借入17億＝銀行9億＋RIZAP8億、8億を免除"""
OK=1e8
SH_NOW=18_642_500; WAR=1_920_000; SH_FULL=SH_NOW+WAR
RIZ=8_330_400
NA_JUN=-0.47*OK; FORG=8.0*OK; FLOOR=73
NAK_R=74_000/201_616; ADV=15.0*OK

na=NA_JUN+FORG
print('■ 8億円放棄後  純資産 {:.2f}億  1株純資産 {:.1f}円（新株予約権行使前）'.format(na/OK,na/SH_NOW))
na_full=na+WAR*FLOOR
print('              新株予約権を下限73円で全部行使すると 純資産 {:.2f}億 / 1株 {:.1f}円'.format(na_full/OK,na_full/SH_FULL))
print('  借入 17億 → 9億（銀行分）／ 現金 約6億 → ネット有利子負債 約3億')

print('\n■ RIZAP保有比率  現在 {:.2f}%  → 全部行使後 {:.2f}%'.format(RIZ/SH_NOW*100,RIZ/SH_FULL*100))
print('  ※ 開示上のコミットは12月末までに10,000個（100万株）。全部（217万株）ではない')
print('  ※ 下限73円で全部行使された場合の時価総額 {:.1f}億 → 「時価総額10億」とは両立しない'.format(SH_FULL*FLOOR/OK))

print('\n■ 30%ブロック取得（3分の1未満なのでTOB不要）')
for lab,sh in (('全部行使後',SH_FULL),('行使が止まった場合',SH_NOW)):
    blk=round(sh*0.30)
    print('  [{}] 発行済 {:,}株 → 30% = {:,}株、RIZAPに残るのは {:,}株（{:.1f}%）'
          .format(lab,sh,blk,RIZ-blk,(RIZ-blk)/sh*100))
    for mc in (10,12,15):
        px=mc*OK/sh
        print('     時価総額{:>2}億（1株{:>5.1f}円） → 取得額 {:.2f}億  PBR {:.2f}倍'
              .format(mc,px,blk*px/OK,px/((na_full if sh==SH_FULL else na)/sh)))

print('\n■ その後あどばると合併する場合（中野＝30%ブロック＋あどばる持分）')
for mc in (10,12,15):
    side=ADV/(ADV+mc*OK)
    nak=0.30*(1-side)+NAK_R*side
    print('  夢展望{:>2}億 : あどばる側 {:>5.1f}%  中野 {:>5.1f}%  {}'
          .format(mc,side*100,nak*100,'← 50%超で実質的存続性の審査リスク' if side>0.5 else ''))

print('\n■ 夢展望単体の損益（面談：コストを0.5〜1億削ればトントン）')
for cut in (0,0.5,1.0):
    op=-0.30+cut  # 会社予想△0.30億を起点（面談では「今期黒字は無理」）
    print('  販管費削減 {:.1f}億 → 営業損益 {:+.2f}億  あどばると合算 {:.2f}億'.format(cut,op,op+2.00))
print('  ※ 第1四半期の実績は営業損失0.51億。会社予想△0.30億自体が楽観的な可能性')

print('\n■ 30%投資の回収イメージ（中野が単独で持つ場合）')
for op in (0.5,1.0,2.5):
    mc=op*0.7*17
    print('  営業利益{:.1f}億 → PER17倍で時価総額{:.1f}億 → 30%は{:.2f}億（取得3億比 {:.1f}倍）'.format(op,mc,mc*0.3,mc*0.3/3))
