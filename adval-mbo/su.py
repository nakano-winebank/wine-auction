# -*- coding: utf-8 -*-
TOTAL=192_616; BLOC=96_500; NAKANO=65_000
EBITDA=2.23; EBITDA_N=1.23   # 実績 / 正常化(出向付替え1.0億戻し)
VISION_LOAN=7.90; BANK_LOAN=3.67; CASH=0.40; NA=-4.09

def px(ev): return ev*1e8/TOTAL

print("="*78)
print("【シナリオA】ユーザー案そのまま：20億評価・ビジョン借入全額現金返済")
print("="*78)
uses_a=[("ビジョン+BOS株式 96,500株 @10,383円", BLOC*px(20)/1e8),
        ("ビジョン借入 全額返済", VISION_LOAN),
        ("諸費用(DD/法務/税務/登録免許/アレンジ)", 0.45),
        ("運転資金バッファ", 0.60)]
src_a=[("② パートナー：ビジョン株買取資金", 6.00),
       ("② パートナー：第三者割当増資", 5.00),
       ("③ みずほ融資 or 中野ファンド", 4.00)]
tu=sum(v for _,v in uses_a); ts=sum(v for _,v in src_a)
for n,v in uses_a: print(f"  Uses  {n:<40} {v:6.2f}億")
print(f"  {'Uses 合計':<47} {tu:6.2f}億")
for n,v in src_a: print(f"  Src   {n:<40} {v:6.2f}億")
print(f"  {'Sources 合計':<47} {ts:6.2f}億")
print(f"  >>> 資金不足 {tu-ts:.2f}億  ／ 中野氏の現物出資を使っていないのが最大の損")

print()
print("="*78)
print("【シナリオB】推奨：20億評価を維持したまま資金需要を圧縮")
print("="*78)
STOCK=BLOC*px(20)/1e8; CASH_PART=6.52; NOTE=STOCK-CASH_PART
DEBT_BUY=VISION_LOAN*0.70
uses_b=[(f"株式 現金部分", CASH_PART),
        (f"ビジョン債権 {VISION_LOAN:.2f}億を額面70%で譲受", DEBT_BUY),
        ("諸費用", 0.45), ("運転資金バッファ", 0.60)]
src_b=[("② パートナー現金出資 (ヒューリック等)", 6.00),
       ("③-a 中野ファンド", 2.10),
       ("③-b みずほ LBOタームローン", 3.50),
       ("③-c みずほ ブリッジ(資産流動化で返済)", 1.50)]
tub=sum(v for _,v in uses_b); tsb=sum(v for _,v in src_b)
for n,v in uses_b: print(f"  Uses  {n:<40} {v:6.2f}億")
print(f"  {'Day1 Uses 合計':<47} {tub:6.2f}億")
print(f"  (別枠) ビジョンへのセラーズノート 3年・金利2%      {NOTE:6.2f}億 ← Day1現金不要")
for n,v in src_b: print(f"  Src   {n:<40} {v:6.2f}億")
print(f"  {'Day1 Sources 合計':<47} {tsb:6.2f}億   差引 {tsb-tub:+.2f}億")
print(f"  ビジョン受取総額 = 株式{STOCK:.2f}(現金{CASH_PART:.2f}+ノート{NOTE:.2f}) + 債権{DEBT_BUY:.2f} = {STOCK+DEBT_BUY:.2f}億")
print(f"  ビジョン Day1現金 = {CASH_PART+DEBT_BUY:.2f}億")

print("\n  --- SPC 出資比率 ---")
eq=[("中野邦人：あどばる65,000株を現物出資", NAKANO*px(20)/1e8),
    ("パートナー(ヒューリック/東京建物等)", 6.00),
    ("中野ファンド", 2.10)]
te=sum(v for _,v in eq)
for n,v in eq: print(f"    {n:<40} {v:5.2f}億  {v/te*100:5.1f}%")
print(f"    {'計':<40} {te:5.2f}億  100.0%")
print(f"    >>> 中野+中野ファンド = {(eq[0][1]+eq[2][1])/te*100:.1f}%  ／ パートナー {eq[1][1]/te*100:.1f}%")
print(f"    >>> ご希望(中野45-55%, パートナー40%程度)にほぼ一致")

print("\n  --- Post-MBO あどばるBS ---")
des=DEBT_BUY
print(f"    DES {des:.2f}億 → 純資産 {NA:.2f} + {des:.2f} = {NA+des:+.2f}億（債務超過解消）")
print(f"    債務消滅益 {VISION_LOAN-DEBT_BUY:.2f}億 → 繰越欠損金10.62億で吸収（課税なし・要税理士確認）")
tot_debt=BANK_LOAN+3.50
print(f"    有利子負債 既存{BANK_LOAN:.2f} + みずほTL{3.50:.2f} = {tot_debt:.2f}億 (ビジョン借入7.90億は消滅)")
print(f"      Debt/EBITDA 実績{EBITDA:.2f}億 → {tot_debt/EBITDA:.1f}倍 ／ 正常化{EBITDA_N:.2f}億 → {tot_debt/EBITDA_N:.1f}倍")
print(f"    +セラーズノート{NOTE:.2f}億を含む総有利子負債 {tot_debt+NOTE:.2f}億")
print(f"      Debt/EBITDA 実績 → {(tot_debt+NOTE)/EBITDA:.1f}倍 ／ 正常化 → {(tot_debt+NOTE)/EBITDA_N:.1f}倍  ← ここが審査の壁")

print()
print("="*78)
print("【シナリオC】現実解：前渡し15億評価 + アーンアウトで20億に届かせる")
print("="*78)
up=BLOC*px(15)/1e8; earn=BLOC*(px(20)-px(15))/1e8
print(f"  前渡し(15億評価) 96,500株 @{px(15):,.0f}円 = {up:.2f}億")
print(f"  アーンアウト(FY2029 営業利益3.5億達成で20億評価まで) = 最大 +{earn:.2f}億")
uses_c=[("株式 前渡し", up), ("ビジョン債権 額面70%で譲受", DEBT_BUY), ("諸費用",0.40), ("運転資金",0.60)]
src_c=[("② パートナー現金出資", 5.00), ("③-a 中野ファンド", 1.00), ("③-b みずほ LBOタームローン", 3.00), ("③-c みずほ ブリッジ", 1.00)]
tuc=sum(v for _,v in uses_c); tsc=sum(v for _,v in src_c)
for n,v in uses_c: print(f"  Uses  {n:<40} {v:6.2f}億")
print(f"  {'Day1 Uses 合計':<47} {tuc:6.2f}億")
for n,v in src_c: print(f"  Src   {n:<40} {v:6.2f}億")
print(f"  {'Day1 Sources 合計':<47} {tsc:6.2f}億   差引 {tsc-tuc:+.2f}億")
tdc=BANK_LOAN+3.00
print(f"  Post-MBO 有利子負債 {tdc:.2f}億 → Debt/EBITDA 実績{tdc/EBITDA:.1f}倍 / 正常化{tdc/EBITDA_N:.1f}倍  ← 審査を通る水準")
eqc=[("中野 現物出資(15億評価)", NAKANO*px(15)/1e8), ("パートナー",5.00), ("中野ファンド",1.00)]
tec=sum(v for _,v in eqc)
print("  --- SPC 出資比率 ---")
for n,v in eqc: print(f"    {n:<40} {v:5.2f}億  {v/tec*100:5.1f}%")
print(f"    >>> 中野+ファンド {(eqc[0][1]+eqc[2][1])/tec*100:.1f}% ／ パートナー {eqc[1][1]/tec*100:.1f}%")

print()
print("="*78)
print("【デット調達余力の上限】みずほが出せる金額の天井")
print("="*78)
for name,e in [("実績EBITDA",EBITDA),("正常化EBITDA(1.0億戻し)",EBITDA_N),("正常化EBITDA(1.5億戻し)",0.73)]:
    for mult in [3.0,3.5,4.0]:
        cap=e*mult
        print(f"  {name:<24} {e:4.2f}億 × {mult:.1f}倍 = 総デット上限 {cap:5.2f}億 → 既存{BANK_LOAN:.2f}億控除後の新規余力 {max(cap-BANK_LOAN,0):5.2f}億")
    print()
