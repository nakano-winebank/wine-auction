# -*- coding: utf-8 -*-
# MBO完了後にスペースマーケット社と合併した場合の持分試算
SM_SHARES = 12_105_900
PX = 230.0
SM = {'重松 大輔':2_950_000,'TKP':2_550_000,'ダブルパインズ':1_670_000,
      'CA・Startups2号':690_000,'鈴木 真一郎':530_000,'マイナビ':330_000,
      '東京建物':170_000,'XTech1号':170_000,'その他':2_795_900+130_000+120_000}
assert sum(SM.values())==SM_SHARES, sum(SM.values())

NAKANO = 0.27371   # 中野個人 / あどばる議決権
FUND   = 0.22629   # 中野ファンド
PARTNER= 0.50000   # パートナー

print('【MBO完了後に合併した場合】SM株価230円・あどばる自己株式127,616株は無対価消却')
print()
for eq in (18e8, 20e8, 26.85e8):
    new = round(eq/PX)
    tot = SM_SHARES + new
    adv = new/tot
    print('あどばるEquity {:>5.2f}億 → 交付{:>10,}株 / 合併後{:>10,}株 / 時価総額{:>5.1f}億'
          .format(eq/1e8, new, tot, tot*PX/1e8))
    rows = [('中野 邦人', NAKANO*adv), ('中野ファンド', FUND*adv),
            ('  └ 中野陣営 計', (NAKANO+FUND)*adv), ('パートナー', PARTNER*adv),
            ('  └ あどばる側 計', adv),
            ('重松 大輔', SM['重松 大輔']/tot), ('ダブルパインズ', SM['ダブルパインズ']/tot),
            ('  └ 重松側 計', (SM['重松 大輔']+SM['ダブルパインズ'])/tot),
            ('TKP', SM['TKP']/tot)]
    for n,v in rows:
        print('    {:<18}{:>7.2f}%'.format(n, v*100))
    print()
print('【比較】MBOをせずに今合併した場合: 中野13.25%(SO行使後14.41%) / ビジョン19.26%が筆頭')
