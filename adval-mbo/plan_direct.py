# -*- coding: utf-8 -*-
SH=192_616; BLOC=96_500; NAK=65_000; SO=9_000; MINOR=31_116
EQ=15.0; E_SO=1000
OP_N=2.00; DA=0.65; EB=OP_N+DA
NA0=-4.09; BANK=3.67; VIS=7.90; REPAY=5.00; REST=VIS-REPAY
FEES=0.45; WC=0.60; ZOSHI=5.00

# --- SO行使後の1株価格 ---
INFL=SO*E_SO/1e8
SH1=SH+SO
PX=(EQ+INFL)*1e8/SH1
NEW=ZOSHI*1e8/PX
TOT=SH1+NEW
print("="*100)
print("【SPCなし・直接投資】株価と株数")
print("="*100)
print(f"  ①あどばる株式価値 {EQ:.0f}億（192,616株ベース）→ 1株 {EQ*1e8/SH:,.0f}円")
print(f"  中野様SO 9,000株を行使（@{E_SO:,}円・払込{INFL:.2f}億）→ {SH1:,}株・1株 {PX:,.0f}円")
print(f"  第三者割当増資 {ZOSHI:.0f}億 @{PX:,.0f}円 → 新株 {NEW:,.0f}株")
print(f"  最終 発行済株式数 {TOT:,.0f}株")
print()
print(f"  ビジョン+BOS 96,500株の代金 = {BLOC*PX/1e8:.2f}億  （ご提示の7.5億とほぼ一致）")
need=0.501*TOT
print(f"  中野陣営50.1%に必要な株数 = {need:,.0f}株 → 中野様74,000株との差 {need-74_000:,.0f}株 = {(need-74_000)*PX/1e8:.2f}億")

def show(name, p_bloc, f_bloc, p_new, f_new, note=""):
    """p_=パートナー f_=中野側(ファンド等) bloc=ビジョン株 new=増資新株（いずれも株数）"""
    nak=74_000
    cam=nak+f_bloc+f_new
    par=p_bloc+p_new
    print(f"\n  ▼ {name}")
    print(f"    {'':<16}{'ビジョン株':>11}{'増資新株':>11}{'投資額':>10}{'持分':>9}")
    print(f"    {'中野 邦人':<16}{'—':>11}{'—':>11}{'—':>10}{nak/TOT*100:>8.2f}%")
    if f_bloc or f_new:
        print(f"    {'中野側(ファンド)':<14}{f_bloc:>11,.0f}{f_new:>11,.0f}{(f_bloc+f_new)*PX/1e8:>9.2f}億{(f_bloc+f_new)/TOT*100:>8.2f}%")
    print(f"    {'パートナー':<16}{p_bloc:>11,.0f}{p_new:>11,.0f}{par*PX/1e8:>9.2f}億{par/TOT*100:>8.2f}%")
    print(f"    {'少数株主':<16}{'—':>11}{'—':>11}{'—':>10}{MINOR/TOT*100:>8.2f}%")
    ok="○ 達成" if cam/TOT>=0.501 else "× 未達"
    print(f"    ★中野陣営（中野＋ファンド） {cam:>8,.0f}株  {cam/TOT*100:>5.2f}%  {ok}")
    if note: print(f"    {note}")

print()
print("="*100)
print("【配分パターン】ビジョン株96,500株と増資新株66,805株を誰が取るか")
print("="*100)
show("案A　パートナーが両方（ビジョン株7.22億＋増資5億＝12.22億）",
     BLOC,0,NEW,0,"→ ご提示の読み方その1。パートナーが60.8%を握り、中野陣営は27.6%。目的を達成できません")
show("案B　パートナーがビジョン株／中野側が増資を引受",
     BLOC,0,0,NEW,"→ ご提示の読み方その2。中野陣営52.5%。中野側の必要資金は5.00億")
f=int(need-74_000)+1
show("案C　増資はパートナー／ビジョン株を分け合う（50.1%ちょうど）",
     BLOC-f,f,NEW,0,"→ 中野側の必要資金は最小の4.53億。パートナーは38.3%")

print()
print("="*100)
print("【SPCあり vs なし】中野側が用意すべき資金の差")
print("="*100)
print(f"  SPCあり（前章）  中野ファンド 2.56億 … SPCがLBOローン2.04億を使えるため少なくて済む")
print(f"  SPCなし（本案）  中野側      {(need-74_000)*PX/1e8:.2f}億 … 買収借入を置く器がないため全額エクイティ")
print(f"  差             {(need-74_000)*PX/1e8-2.56:+.2f}億  ← これがSPCをやめる代償")

print()
print("="*100)
print("【あどばるの財務】SPCの有無で変わりません")
print("="*100)
print(f"  純資産      {NA0:+.2f} ＋ 増資{ZOSHI:.2f} = {NA0+ZOSHI:+.2f}億（債務超過解消）")
print(f"  有利子負債   11.57 － ビジョン返済{REPAY:.2f} = {11.57-REPAY:.2f}億")
print(f"             うちビジョン残{REST:.2f}億はみずほがリファイ → ビジョン借入は全額消滅")
print(f"  Post-MBO   銀行3.67 ＋ みずほリファイ{REST:.2f} = {BANK+REST:.2f}億 / EBITDA{EB:.2f}億 = {(BANK+REST)/EB:.1f}倍")
fcf=EB*0.95-0.75
adsv=BANK/6+BANK*0.03*0.6 + REST/7+REST*0.03*0.6
print(f"  返済前FCF {fcf:.2f}億 ／ 年間元利 {adsv:.2f}億 → DSCR {fcf/adsv:.2f}倍  ○ 余裕あり")
print(f"\n  ★SPCなしだと みずほへの依頼が『LBOローン』から『事業会社への通常リファイナンス{REST:.2f}億＋運転枠{WC:.2f}億』")
print(f"    に変わります。審査は格段に通りやすく、DSCRも{fcf/adsv:.2f}倍と余裕が出ます")

print()
print("="*100)
print("【ビジョンの受取】いずれの案でも同じ")
print("="*100)
print(f"  株式 96,500株 {BLOC*PX/1e8:.2f}億 ＋ 借入返済 {VIS:.2f}億（額面満額）= {BLOC*PX/1e8+VIS:.2f}億 全額現金")
