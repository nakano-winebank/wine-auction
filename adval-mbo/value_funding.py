# -*- coding: utf-8 -*-
"""①中野の取得水準と資金 ②合併後に価値が上がるかの検証"""
SM_SH=2_405_200; SM_VAL=20.0e8; SM_NA=5.71e8; SM_OP=2.30e8
ADV_SH=201_616;  ADV_NA=-2.59e8; ADV_OP=2.00e8
NAK_R=74_000/201_616
FLOAT0=839_725; ADV_CORP=297_190

def build(adv_val):
    px=SM_VAL/SM_SH
    new=round(adv_val/SM_VAL*SM_SH); tot=SM_SH+new
    side=adv_val/(adv_val+SM_VAL)
    nak=round(NAK_R*new); viz=round(94_400/ADV_SH*new)
    rev = side>0.5
    gw = (SM_VAL-SM_NA) if rev else (adv_val-ADV_NA)
    return dict(px=px,new=new,tot=tot,side=side,nak=nak,viz=viz,rev=rev,gw=gw)

print('='*84); print('① 中野の取得水準と必要資金（あどばる15億前提）'); print('='*84)
b=build(15.0e8); tot=b['tot']; px=b['px']; nak0=b['nak']; viz=b['viz']
OTA=1_296_316
for lab,target in (('現状（取得なし）',nak0),
                   ('太田氏側と同数 30.80%',OTA),
                   ('1/3ちょうど',int(tot/3)),
                   ('1/3超＝特別決議の拒否権',int(tot/3)+1)):
    need=target-nak0
    fl=FLOAT0+(viz-need)+ADV_CORP
    print('  {:<26} 中野{:>6.2f}%  追加{:>9,}株 {:>5.2f}億  流通{:>6.2f}% {}'
          .format(lab,target/tot*100,max(need,0),max(need,0)*px/1e8,fl/tot*100,
                  '○' if fl/tot>=0.25 else '×'))
print('\n  ※ 1/3を超える市場外（相対）取得はTOBが必須。売出しへの応募なら適用除外となる見込み')
print('  ※ 合併後の中野の持株 {:,}株 = {:.2f}億円（担保余力の原資）'.format(nak0,nak0*px/1e8))

print('\n'+'='*84); print('② 合併後に価値は上がるか'); print('='*84)
op=SM_OP+ADV_OP
print('  合算営業利益  スマサポ{:.2f}億 ＋ あどばる{:.2f}億 = {:.2f}億'.format(SM_OP/1e8,ADV_OP/1e8,op/1e8))
print('\n  {:<22}{:>10}{:>11}{:>12}{:>13}'.format('あどばる評価','あどばる側','会計処理','のれん','20年償却'))
for v in (15,18,20,21,23):
    d=build(v*1e8)
    print('  {:<22}{:>9.2f}%{:>11}{:>11.2f}億{:>12.2f}億'
          .format('{}億'.format(v),d['side']*100,'逆取得' if d['rev'] else '通常取得',d['gw']/1e8,d['gw']/20/1e8))
print('\n  → あどばる側が50%を超えると逆取得となり、のれんは「スマサポ時価総額−スマサポ純資産」で計算される')
print('    あどばるの債務超過がのれんに乗らなくなるため、評価を上げるほどのれんが減る（逆説）')

print('\n■ 理論時価総額（のれん償却後・税率30%・PER別）')
for v in (15,21):
    d=build(v*1e8); after=op-d['gw']/20; ni=after*0.7
    print('  あどばる{}億: 償却後営業益{:.2f}億 → 税引後{:.2f}億'.format(v,after/1e8,ni/1e8))
    print('     PER15倍 {:.1f}億 / 17倍 {:.1f}億 / 20倍 {:.1f}億   （単純合算 {:.0f}億）'
          .format(ni*15/1e8,ni*17/1e8,ni*20/1e8,v+20))
    print('     中野の持分 {:.2f}%'.format(NAK_R*d['side']*100))

print('\n■ シナジーが乗った場合（あどばる15億・のれん17.59億前提）')
d=build(15.0e8); base=op-d['gw']/20
for syn in (0,0.5,1.0,1.5,2.0):
    ni=(base+syn*1e8)*0.7
    print('  営業利益シナジー +{:.1f}億 → 償却後{:.2f}億 → 税引後{:.2f}億 → PER17倍で{:.1f}億'
          .format(syn,(base+syn*1e8)/1e8,ni/1e8,ni*17/1e8))
print('\n  → 単純合算35億を上回るには、営業利益ベースで約+1.0億のシナジーが要る')

print('\n'+'='*84); print('③ スマサポの通期着地が外れた場合の感度'); print('='*84)
d=build(15.0e8); gw20=d['gw']/20
print('  通期予想2.30億（進捗54.3%・Q3累計1.24億）が未達だと合算が崩れる\n')
for sm in (2.30,2.00,1.80,1.60):
    o=(sm+2.00)*1e8; a=o-gw20; ni=a*0.7
    print('  スマサポ営業益 {:.2f}億 → 合算{:.2f}億 → 償却後{:.2f}億 → 税引後{:.2f}億 → PER17倍 {:.1f}億 {}'
          .format(sm,o/1e8,a/1e8,ni/1e8,ni*17/1e8,'' if ni*17/1e8>=35 else '← 単純合算35億を下回る'))

print('\n'+'='*84); print('④ 有償ストックオプションで取得する場合の初期負担'); print('='*84)
need=634_223; px=d['px']
print('  取得したい株数 {:,}株（太田氏側と同数30.80%）／ 現金で買えば {:.2f}億円'.format(need,need*px/1e8))
print('  有償SOなら、初期負担は公正価値のみ（行使価額は行使時に払う）\n')
for r in (0.10,0.15,0.20,0.30):
    print('  公正価値が株価の{:>3.0f}% → 初期負担 {:>5.2f}億円   （現金購入比 {:.0f}分の1）'
          .format(r*100,need*px*r/1e8,1/r))
print('\n  ※ 業績条件を厳しくするほど公正価値は下がる（行使確率が織り込まれるため）')
print('  ※ 税務: 有償SOは付与・行使時に課税なし、売却時に譲渡所得20.315%のみ')
print('     譲渡制限付株式(RS)なら給与所得課税（最高55%）が発生し、{:.2f}億の納税が生じうる'
      .format(need*px*0.55/1e8))
