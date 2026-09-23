# -*- coding: utf-8 -*-
"""合併後の統合BS（スペースマーケット社の公開情報を取得して計算）"""
OK=1e8
# --- SM: 2025年12月期末（決算短信ベース／検索結果経由で取得） ---
SM_TA, SM_NA, SM_ER = 37.39, 10.07, 0.246
SM_TL = SM_TA-SM_NA
SM_FIXED_LIAB, SM_CASH = 7.91, 11.56
SM_SALES, SM_OP, SM_ORD = 25.67, 2.47, 2.30
SM_SALES_E, SM_OP_E = 32.44, 2.90          # 2026年12月期 会社予想
# --- あどばる ---
AD = {'第10期末':      dict(ta=13.16, tl=17.25, na=-4.09, op=1.58, opn=2.00, debt=11.57, cash=0.40),
      'MBO取引後':     dict(ta=15.63, tl=11.73, na= 3.90, op=2.00, opn=2.00, debt=6.07, cash=2.19)}

def merge(tag, ad, price):
    gw = price - ad['na']                     # のれん = 対価 − 時価純資産
    ta = SM_TA + ad['ta'] + gw
    tl = SM_TL + ad['tl']
    na = ta - tl
    er = na/ta
    # のれんを自己資本から控除した実質ベース
    rna, rta = na-gw, ta-gw
    print('\n【{}】あどばる評価額 {:.2f}億'.format(tag, price))
    print('  のれん            {:>7.2f}億  （償却 20年={:.2f}億/年・10年={:.2f}億/年）'
          .format(gw, gw/20, gw/10))
    print('  合算 総資産       {:>7.2f}億   負債 {:.2f}億   純資産 {:.2f}億'.format(ta, tl, na))
    print('  合算 自己資本比率  {:>6.1f}%'.format(er*100))
    print('  のれん控除後      自己資本 {:.2f}億 / 総資産 {:.2f}億 = {:.1f}%  ★銀行の実質評価'
          .format(rna, rta, rna/rta*100))
    op = SM_OP_E + ad['opn']
    print('  合算 営業利益     {:>7.2f}億  （SM 2.90億 + あどばる {:.2f}億）'.format(op, ad['opn']))
    print('  のれん償却後      20年 {:>5.2f}億（{:.0f}%減）  10年 {:.2f}億（{:.0f}%減）'
          .format(op-gw/20, gw/20/op*100, op-gw/10, gw/10/op*100))
    print('  合算 現預金       {:>7.2f}億'.format(SM_CASH + ad['cash']))
    return dict(gw=gw, ta=ta, na=na, er=er, rer=rna/rta, op=op)

print('='*76)
print('スペースマーケット社 2025年12月期末（2025/12/31）')
print('  総資産 {:.2f}億 / 純資産 {:.2f}億 / 自己資本比率 {:.1f}%（自己資本 {:.2f}億）'
      .format(SM_TA, SM_NA, SM_ER*100, SM_TA*SM_ER))
print('  固定負債 {:.2f}億 / 現金及び現金同等物 {:.2f}億'.format(SM_FIXED_LIAB, SM_CASH))
print('  売上 {:.2f}億（+30.3%）/ 営業利益 {:.2f}億（+39.6%）/ 経常 {:.2f}億'
      .format(SM_SALES, SM_OP, SM_ORD))
print('  2026年12月期 会社予想: 売上 {:.2f}億 / 営業利益 {:.2f}億'.format(SM_SALES_E, SM_OP_E))
print('='*76)
a=merge('いま合併する場合', AD['第10期末'], 18.00)
b=merge('MBO完了後に合併する場合', AD['MBO取引後'], 26.85)
print('\n'+'='*76)
print('比較: 合算自己資本比率  いま {:.1f}%  →  MBO後 {:.1f}%'.format(a['er']*100, b['er']*100))
print('      のれん控除後     いま {:.1f}%  →  MBO後 {:.1f}%   ← 差 {:.1f}pt'
      .format(a['rer']*100, b['rer']*100, (b['rer']-a['rer'])*100))
print('='*76)
