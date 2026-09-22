# -*- coding: utf-8 -*-
# スペースマーケット(4487)との合併シミュレーション
SM_SHARES = 12_105_900          # 発行済株式数（公開情報ベース）
SM_PX     = 230                 # 3ヶ月平均株価（推定）
SHIGE_PCT = 0.2454              # 重松大輔氏（ダブルパインズ含む）持株比率
SHIGE = round(SM_SHARES*SHIGE_PCT)

AD = {"株式会社ビジョン":94_500,"中野 邦人":65_000,"株式会社エアトリ":16_116,
      "KUMAアセットマネジメント":6_300,"株式会社フィル・カンパニー":3_000,
      "株式会社ベクトル":3_000,"株式会社アンビション・ベンチャーズ":2_700,"株式会社BOS":2_000}
AD_SH = sum(AD.values())         # 192,616
SO_NAK = 9_000
AD_ND  = 11.17                   # あどばるのネットデット（億）

def run(ad_eq, label, so=False):
    sh  = AD_SH+SO_NAK if so else AD_SH
    hold= dict(AD)
    if so: hold["中野 邦人"] += SO_NAK
    ad_px = ad_eq*1e8/sh
    ratio = ad_px/SM_PX                       # あどばる1株にSM何株
    issue = round(ad_eq*1e8/SM_PX)            # 交付新株総数
    post  = SM_SHARES+issue
    smcap = SM_SHARES*SM_PX/1e8
    print(f"\n{'='*96}\n■ {label}\n{'='*96}")
    print(f"  SM時価総額 {smcap:.2f}億（{SM_SHARES:,}株 × {SM_PX}円）／ あどばる評価 {ad_eq:.2f}億（1株 {ad_px:,.0f}円）")
    print(f"  合併比率  あどばる1株 : SM {ratio:.2f}株　／　交付新株 {issue:,}株")
    print(f"  合併後 発行済 {post:,}株 ／ 時価総額 {smcap+ad_eq:.2f}億")
    print(f"  持分  SM既存株主 {SM_SHARES/post*100:5.2f}%  ／  あどばる株主 {issue/post*100:5.2f}%")
    print(f"\n  {'株主':<28}{'合併後株数':>12}{'比率':>8}")
    print("  "+"-"*50)
    rows=[("重松 大輔（ダブルパインズ含む）",SHIGE,"SM")]
    for n,s in hold.items():
        rows.append((n,round(s*ratio),"AD"))
    rows.append(("その他のSM既存株主",SM_SHARES-SHIGE,"SM"))
    rows.sort(key=lambda r:-r[1])
    for n,s,src in rows:
        mark=" ★" if n.startswith(("重松","中野")) else ""
        print(f"  {n:<28}{s:>12,}{s/post*100:>7.2f}%{mark}")
    print(f"  {'合計':<28}{post:>12,}{100.0:>7.2f}%")
    nak=round(hold["中野 邦人"]*ratio)
    gap=SHIGE-nak
    buy=gap/2 if gap>0 else 0
    print(f"\n  【重松氏と対等になるには】")
    print(f"    重松氏 {SHIGE:,}株（{SHIGE/post*100:.2f}%）　中野様 {nak:,}株（{nak/post*100:.2f}%）　差 {gap:,}株")
    if gap>0:
        print(f"    重松氏から {buy:,.0f}株 を買い取れば両者 {(nak+buy):,.0f}株 で対等")
        print(f"    取得金額 {buy*SM_PX/1e8:.3f}億円（@{SM_PX}円）＝ {buy*SM_PX/1e4:,.0f}万円")
        print(f"    ※市場で買い増す場合も必要株数は同じ{buy:,.0f}株ではなく{gap:,.0f}株（重松氏の株数は減らないため）")
        print(f"      市場買付なら {gap*SM_PX/1e8:.3f}億円（{gap*SM_PX/1e4:,.0f}万円）")
    else:
        print(f"    買い増し不要。中野様が既に上回ります")
    return dict(nak=nak,gap=gap,buy=buy,post=post,ratio=ratio,issue=issue)

print("="*96)
print("【前提】公開情報（2026年9月時点）")
print("="*96)
print(f"  スペースマーケット(4487)  発行済 {SM_SHARES:,}株 ／ 3ヶ月平均株価 {SM_PX}円（推定）")
print(f"  重松大輔氏（資産管理会社ダブルパインズ含む） {SHIGE_PCT*100:.2f}% = {SHIGE:,}株")
print(f"  あどばる  発行済 {AD_SH:,}株（顕在）／ 中野様SO 9,000株")

a=run(18.0,"ケース1　LOIの18億を『株式価値（Equity）』として評価　※中野様SO未行使")
b=run(18.0,"ケース2　同上・中野様がSO 9,000株を行使",so=True)
c=run(18.0-AD_ND,f"ケース3　LOIの18億が『事業価値（EV）』だった場合 → 株式価値 {18.0-AD_ND:.2f}億")

print("\n"+"="*96)
print("【感応度】SM株価と重松氏持分を動かした場合の『対等化に必要な市場買付額』")
print("="*96)
print(f"  {'SM株価':>7}{'重松23%':>14}{'重松24.54%':>14}{'重松26%':>14}   （あどばる18億=Equity・SO行使済）")
for px in [210,220,230,240,250,260]:
    line=f"  {px:>6}円"
    for pct in [0.23,0.2454,0.26]:
        shg=round(SM_SHARES*pct)
        ratio=18.0*1e8/(AD_SH+SO_NAK)/px
        nak=round(74_000*ratio)
        gap=max(shg-nak,0)
        line+=f"{gap*px/1e8:>12.2f}億"
    print(line)
