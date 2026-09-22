# -*- coding: utf-8 -*-
SM=12_105_900; AD_SH=192_616; SO=9_000; AD_EQ=18.0
SHIGE_I=2_950_000; DP=1_670_000; TKP=2_550_000; SASAKI=120_000
AD={"株式会社ビジョン":94_500,"中野 邦人":65_000,"株式会社エアトリ":16_116,
    "KUMAアセットマネジメント":6_300,"株式会社フィル・カンパニー":3_000,
    "株式会社ベクトル":3_000,"株式会社アンビション・ベンチャーズ":2_700,"株式会社BOS":2_000}

print("="*94); print("【収集できた株価データ点】2026年"); print("="*94)
for d,p,src in [("1月20日",328,"年初来高値"),("5月27日",243,"検索"),("6月10日",230,"松井証券"),
                ("6月中旬",229.5,"検索"),("年初来安値",205,"時期不詳・6月前後"),
                ("8月13日",231,"時価総額28億から逆算"),("9月18日",229,"時価総額2,772百万から逆算"),
                ("9月21日",229,"四季報画面（終値）")]:
    print(f"  {d:<10}{p:>7.1f}円   {src}")

print("\n"+"="*94); print("【平均株価の推定】"); print("="*94)
print("  3ヶ月平均（2026/6/22〜9/21）")
print("    観測点が229〜231円に集中。6月の安値圏を脱してからほぼ横ばい")
print("    → 推定 229円（レンジ 225〜235円）  確度：比較的高い")
print("  6ヶ月平均（2026/3/23〜9/21）")
print("    3〜5月は243円以上（5/27＝243円）、6月に205〜230円へ下落、以降229円前後")
print("    → 推定 240円（レンジ 235〜250円）  確度：低い（3〜5月の実データなし）")

def deal(px,label):
    sh=AD_SH+SO; hold=dict(AD); hold["中野 邦人"]+=SO
    ratio=(AD_EQ*1e8/sh)/px; issue=round(AD_EQ*1e8/px); post=SM+issue
    nak=round(hold["中野 邦人"]*ratio); vis=round(hold["株式会社ビジョン"]*ratio)
    print(f"\n  ▼ {label}　SM株価 {px}円 ／ SM時価総額 {SM*px/1e8:.2f}億")
    print(f"    合併比率 あどばる1株:SM {ratio:.2f}株 ／ 交付新株 {issue:,}株 ／ 合併後 {post:,}株")
    print(f"    あどばる株主の持分 {issue/post*100:5.2f}%　SM既存 {SM/post*100:5.2f}%")
    print(f"    中野様 {nak:,}株 {nak/post*100:5.2f}%　ビジョン {vis:,}株 {vis/post*100:5.2f}%")
    print(f"    重松個人 {SHIGE_I/post*100:5.2f}%　重松陣営 {(SHIGE_I+DP)/post*100:5.2f}%　TKP {TKP/post*100:5.2f}%")
    g1=max(SHIGE_I-nak,0); g2=max(SHIGE_I+DP-nak,0)
    print(f"    対等化（個人のみ）相対 {g1/2*px/1e8:.2f}億／（＋DP）相対 {g2/2*px/1e8:.2f}億")
    return dict(px=px,issue=issue,post=post,nak=nak,vis=vis,ratio=ratio,hold=hold)

print("\n"+"="*94); print("【株価基準による違い】あどばる18億は固定なので、SM株価が低いほど中野様に有利"); print("="*94)
a=deal(229,"3ヶ月平均 229円（推定）")
b=deal(240,"6ヶ月平均 240円（推定）")
c=deal(255,"12ヶ月平均 255円（参考・1月の328円を含む想定）")
print(f"\n  ★3ヶ月平均を採ると、6ヶ月平均より中野様の持分が {a['nak']/a['post']*100-b['nak']/b['post']*100:+.2f}pt 高い")
print(f"    SM側は株価が高いほど希薄化が小さく有利。3ヶ月平均の提案はこちらに不利ではありません")

print("\n"+"="*94); print("【上場維持基準の判定】東証グロース市場（3ヶ月平均229円ケース）"); print("="*94)
r=a; post=r['post']; px=r['px']
# 流通株式の除外対象
main=[("株式会社ビジョン",r['vis']),("重松 大輔",SHIGE_I),("中野 邦人",r['nak']),("TKP",TKP)]
print("  ■ 流通株式から除外されるもの（東証の定義）")
print("    ① 主要株主（10%以上）の所有株式")
ex=0
for n,s in main:
    print(f"       {n:<16}{s:>10,}株  {s/post*100:5.2f}%")
    ex+=s
print("    ② 役員等の所有株式（資産管理会社を含む）")
for n,s in [("株式会社ダブルパインズ（重松氏資産管理会社）",DP),("佐々木 正将（副社長）",SASAKI)]:
    print(f"       {n:<16}{s:>10,}株  {s/post*100:5.2f}%"); ex+=s
print(f"    小計 {ex:,}株 {ex/post*100:.2f}%　→ 流通株式 {(post-ex)/post*100:.2f}%")
print("\n    ③ 事業法人等の固定的保有（所有目的が純投資以外の場合に除外）")
biz=[("株式会社エアトリ",round(r['hold']['株式会社エアトリ']*r['ratio'])),("マイナビ",330_000),
     ("KUMAアセットマネジメント",round(r['hold']['KUMAアセットマネジメント']*r['ratio'])),
     ("東京建物",170_000),("株式会社フィル・カンパニー",round(r['hold']['株式会社フィル・カンパニー']*r['ratio'])),
     ("株式会社ベクトル",round(r['hold']['株式会社ベクトル']*r['ratio'])),
     ("株式会社アンビション・ベンチャーズ",round(r['hold']['株式会社アンビション・ベンチャーズ']*r['ratio'])),
     ("株式会社BOS",round(r['hold']['株式会社BOS']*r['ratio']))]
b2=sum(s for _,s in biz)
for n,s in biz: print(f"       {n:<26}{s:>9,}株  {s/post*100:5.2f}%")
print(f"    小計 {b2:,}株 {b2/post*100:.2f}%")
fl_hi=(post-ex)/post*100; fl_lo=(post-ex-b2)/post*100
flmv_lo=(post-ex-b2)*px/1e8
print(f"\n  ■ 判定")
print(f"    流通株式比率  {fl_lo:.2f}% 〜 {fl_hi:.2f}%（事業法人を固定と見るか否かで変動）")
print(f"    基準は 25%以上 → {'×抵触の可能性' if fl_lo<25 else '○'}（下限ケース）／{'○適合' if fl_hi>=25 else '×'}（上限ケース）")
print(f"    流通株式時価総額 {flmv_lo:.2f}億〜{(post-ex)*px/1e8:.2f}億　基準5億円以上 → ○適合")
print(f"    時価総額 {post*px/1e8:.2f}億　基準40億円以上（上場10年経過後＝2029年12月〜）→ {'○' if post*px/1e8>=40 else '×'}")
print(f"    ※現在のSM単独時価総額は {SM*px/1e8:.2f}億で40億に未達。合併すれば {post*px/1e8:.2f}億でクリアします")

print("\n"+"="*94); print("【のれんの試算】"); print("="*94)
for na in [-4.09,-2.59]:
    g=AD_EQ-na
    print(f"  あどばるの純資産{na:+.2f}億 → のれん {g:.2f}億　償却20年 年{g/20:.2f}億／10年 年{g/10:.2f}億")
print("  SMの営業利益は2026年9月期中間で0.46億。あどばる1.58億を足しても年間2.6億程度")
print("  → 20年償却なら年1.1億、10年償却なら年2.2億が利益から消えます")
