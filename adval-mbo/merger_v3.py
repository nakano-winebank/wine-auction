# -*- coding: utf-8 -*-
"""株価229円で統一した合併後株主名簿 + 同額投下比較（v3）"""
PX=229.0; SM=12_105_900
SMH={'重松 大輔':2_950_000,'TKP':2_550_000,'ダブルパインズ':1_670_000,
     'CA・Startups2号':690_000,'鈴木 真一郎':530_000,'マイナビ':330_000,
     '東京建物':170_000,'XTech1号':170_000,'その他':3_045_900}
assert sum(SMH.values())==SM
# あどばる（SO行使後 201,616株）
ADV={'ビジョン':94_400,'中野 邦人':74_000,'BOS':10_000,'エアトリ':8_000,
     'KUMA':6_000,'フィル・カンパニー':4_000,'ベクトル':3_216,'アンビション':2_000}
ADV_TOT=201_616
assert sum(ADV.values())==ADV_TOT, sum(ADV.values())
EQ=18.0e8
new=round(EQ/PX); tot=SM+new; per=new/ADV_TOT
print('【合併後株主名簿】あどばるEquity 18.0億 / SM株価 {:.0f}円 / SO行使後'.format(PX))
print('  交付新株 {:,}株  合併比率 1:{:.2f}  合併後発行済 {:,}株  時価総額 {:.1f}億'
      .format(new,per,tot,tot*PX/1e8))
rows=[(k+'（旧あどばる）',round(v*per)) for k,v in ADV.items()]+list(SMH.items())
rows.sort(key=lambda r:-r[1])
print('  {:<28}{:>12}{:>9}'.format('株主','株数','比率'))
for n,sh in rows: print('  {:<28}{:>12,}{:>8.2f}%'.format(n,sh,sh/tot*100))
nak=round(ADV['中野 邦人']*per); viz=round(ADV['ビジョン']*per)
print('\n  中野 {:.2f}% / ビジョン {:.2f}% / 重松側 {:.2f}%'
      .format(nak/tot*100,viz/tot*100,(SMH['重松 大輔']+SMH['ダブルパインズ'])/tot*100))

CASH=6.10e8; buy=CASH/PX
print('\n【B】合併後、6.10億で相対取得した場合')
print('  取得 {:,.0f}株({:.2f}pt) → 中野 {:,.0f}株 = {:.2f}%'
      .format(buy,buy/tot*100,nak+buy,(nak+buy)/tot*100))
print('  1/3超まで あと {:.2f}億 / 50%まで あと {:.2f}億'
      .format((tot/3-nak-buy)*PX/1e8,(tot*0.5-nak-buy)*PX/1e8))
print('  ※1/3超の市場外買付は相手1名でもTOB必須（金商法27条の2）')
ns=CASH/PX; t2=tot+ns
print("\n【B'】合併後、6.10億を第三者割当増資で引き受けた場合")
print('  中野 {:.2f}%（Bより{:.2f}pt低い）／ 希薄化 {:.1f}% ／ 会社の純資産 +6.10億'
      .format((nak+ns)/t2*100,(nak+buy)/tot*100-(nak+ns)/t2*100,ns/tot*100))
print('\n【A】MBO: 中野陣営 50.000% / 会社の純資産 +6.10億 / ビジョン借入7.90億は完済')
