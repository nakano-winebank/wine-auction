# -*- coding: utf-8 -*-
# 四季報(2026年9月・単元株主2,428名)の実データで再計算
SM_SHARES=12_105_900; PX=230; PX_LAST=229
SM_TOP=[("重松 大輔","SM・社長",2_950_000),("TKP","SM",2_550_000),
        ("株式会社ダブルパインズ","SM・重松氏資産管理会社",1_670_000),
        ("CA・StartupsInternet2号投資組合","SM",690_000),("鈴木 真一郎","SM",530_000),
        ("マイナビ","SM",330_000),("東京建物","SM",170_000),
        ("XTech1号投資事業組合","SM",170_000),("吉岡 裕之","SM",130_000),
        ("佐々木 正将","SM・副社長",120_000)]
SM_OTH=SM_SHARES-sum(s for _,_,s in SM_TOP)
print("="*92); print("【検算】四季報の比率と発行済株式数12,105,900株の整合"); print("="*92)
for n,_,s in SM_TOP: print(f"  {n:<32}{s/1e4:>6.0f}万株  {s/SM_SHARES*100:5.2f}%")
print(f"  {'その他（単元株主2,428名）':<31}{SM_OTH/1e4:>6.1f}万株  {SM_OTH/SM_SHARES*100:5.2f}%")
print(f"  {'合計':<32}{SM_SHARES/1e4:>6.1f}万株  100.00%")
SHIGE=2_950_000+1_670_000
print(f"\n  ★重松氏 個人{2_950_000/1e4:.0f}万株(24.37%) ＋ ダブルパインズ{1_670_000/1e4:.0f}万株(13.79%) = {SHIGE/1e4:.0f}万株 {SHIGE/SM_SHARES*100:.2f}%")
print(f"  ★TKP {2_550_000/1e4:.0f}万株 {2_550_000/SM_SHARES*100:.2f}% ← 貸会議室最大手・あどばるの直接競合")

AD={"株式会社ビジョン":94_500,"中野 邦人":65_000,"株式会社エアトリ":16_116,
    "KUMAアセットマネジメント":6_300,"株式会社フィル・カンパニー":3_000,
    "株式会社ベクトル":3_000,"株式会社アンビション・ベンチャーズ":2_700,"株式会社BOS":2_000}
AD_SH=192_616; SO=9_000; AD_EQ=18.0

def run(so,label):
    sh=AD_SH+SO if so else AD_SH
    hold=dict(AD)
    if so: hold["中野 邦人"]+=SO
    ratio=(AD_EQ*1e8/sh)/PX
    issue=round(AD_EQ*1e8/PX); post=SM_SHARES+issue
    rows=[(n,src,s) for n,src,s in SM_TOP]
    rows+= [(n,"あどばる",round(s*ratio)) for n,s in hold.items()]
    rows+= [("その他のSM株主（2,428名）","SM",SM_OTH)]
    rows.sort(key=lambda r:-r[2])
    print("\n"+"="*92); print(f"■ {label}　合併比率 あどばる1株 : SM {ratio:.2f}株"); print("="*92)
    print(f"  交付新株 {issue:,}株 ／ 合併後発行済 {post:,}株 ／ 時価総額 {(SM_SHARES*PX+AD_EQ*1e8)/1e8:.2f}億")
    print(f"  {'株主':<34}{'出身':<8}{'合併後株数':>11}{'持分':>8}{'時価':>9}")
    print("  "+"-"*72)
    tot=0
    for n,src,s in rows:
        tot+=s
        m=" ★" if n.startswith(("重松","中野","TKP","株式会社ビジョン","株式会社ダブル")) else ""
        print(f"  {n:<34}{src.split('・')[0]:<8}{s:>11,}{s/post*100:>7.2f}%{s*PX/1e8:>8.2f}億{m}")
    print(f"  {'合計':<34}{'':<8}{tot:>11,}{tot/post*100:>7.2f}%   検算 {'OK' if tot==post else 'NG'}")
    nak=round(hold["中野 邦人"]*ratio)
    print(f"\n  【対等化に必要な買付】")
    for lbl,tgt in [("重松氏 個人のみ（295万株）",2_950_000),("重松氏＋ダブルパインズ（462万株）",SHIGE)]:
        gap=tgt-nak
        if gap<=0: print(f"    {lbl:<34} 既に上回る（中野 {nak:,}株）"); continue
        print(f"    {lbl:<34} 差{gap:>9,}株 ／ 相対取得 {gap/2:>9,.0f}株 {gap/2*PX/1e8:5.2f}億 ／ 市場買付 {gap:>9,}株 {gap*PX/1e8:5.2f}億")
    return nak,post,ratio,issue

n1,post,_,_=run(False,"ケース1　中野様SO未行使")
n2,_,_,_=run(True,"ケース2　中野様SO 9,000株 行使")

print("\n"+"="*92); print("【前回試算からの訂正】"); print("="*92)
print(f"  前回: 重松氏24.54%（ダブルパインズ含むと想定）= 2,970,788株 → 合併後14.90%")
print(f"  今回: 重松氏個人24.37% ＋ ダブルパインズ13.79% = {SHIGE:,}株 → 合併後 {SHIGE/post*100:.2f}%")
print(f"  対等化コスト（SO行使済・相対取得）  前回 0.11億 → 今回 {(SHIGE-n2)/2*PX/1e8:.2f}億")
