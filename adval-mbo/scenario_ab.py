# -*- coding: utf-8 -*-
SH=192_616; BLOC=96_500; NAK=65_000; MINOR=31_116
SHUKKOU=0.72                     # 出向費 月600万 → 年0.72億
VIS_LOAN=7.90; BANK=3.67; FEES=0.45; WC=0.60; DA=0.70
TL=3.5                           # みずほ タームローン
DEBT_POST=BANK+TL                # Post-MBO 有利子負債（債権はDESで消滅）
ADS=TL/7 + TL*0.03*0.6 + BANK/6  # 年間元利返済額

SCEN=[("④",2.0),("⑤",3.0)]

def run(EVQ,label):
    px=EVQ*1e8/SH
    stock=BLOC*px/1e8; roll=NAK*px/1e8; minor=MINOR*px/1e8
    dbuy=VIS_LOAN*0.70
    uses=stock+dbuy+FEES+WC
    uses_par=stock+VIS_LOAN+FEES+WC
    print("\n"+"="*94)
    print(f"■■ {label}：①={EVQ:.0f}億評価　1株 {px:,.0f}円")
    print("="*94)
    print(f"  ビジョン+BOS 96,500株 {stock:6.2f}億 ／ 中野65,000株(現物出資) {roll:6.2f}億 ／ 少数株主31,116株 {minor:5.2f}億")
    print()
    print("  【Sources & Uses】")
    print(f"    株式代金 {stock:5.2f} + 債権70%取得 {dbuy:5.2f} + 諸費用 {FEES:.2f} + 運転 {WC:.2f} = Day1所要 {uses:6.2f}億")
    print(f"    (債権を額面100%返済する場合は {uses_par:.2f}億)")
    print(f"    ②③満額15.00億（ﾊﾟｰﾄﾅｰ11.00 + ③4.00）に対して {15.00-uses:+.2f}億"
          f"{'（成立）' if 15.00>=uses else '（不足）'}")
    print()
    print("  【持分】②③の配分を変えたときの中野陣営比率")
    def own(P,F,D,lab):
        eqt=roll+P+F
        print(f"    {lab:<26} みずほ{D:4.1f} ﾊﾟｰﾄﾅｰ{P:5.2f} ﾌｧﾝﾄﾞ{F:5.2f} → "
              f"中野{roll/eqt*100:5.1f}%  ﾊﾟｰﾄﾅｰ{P/eqt*100:5.1f}%  中野陣営{(roll+F)/eqt*100:5.1f}%")
    own(11.00, max(uses-11.00-TL,0), TL, "②満額11億＋みずほ3.5億")
    own(uses-TL, 0.0, TL, "③をみずほ融資で埋める")
    for t in [0.45,0.50,0.55]:
        rem=uses-TL; F=t*(roll+rem)-roll; P=rem-F
        own(P,F,TL,f"★中野陣営{t*100:.0f}%にする配分")
    print()
    print("  【Post-MBO 収益力と返済】")
    print(f"    純資産 △4.09 + DES {dbuy:.2f} = {-4.09+dbuy:+.2f}億（債務超過解消）／ 有利子負債 {DEBT_POST:.2f}億")
    print(f"    {'シナリオ':<40}{'EBITDA':>8}{'D/EBITDA':>10}{'FCF':>8}{'DSCR':>8}  判定")
    print("    "+"-"*84)
    for tag,op in SCEN:
        for mode,nop in [("報告ベース(出向費恩恵込み)",op-SHUKKOU),("正常化後(出向費ゼロ後)",op)]:
            eb=nop+DA; fcf=eb*0.95-0.75; dscr=fcf/ADS; lev=DEBT_POST/eb
            ok="○ 成立" if dscr>=1.2 and lev<=4.0 else ("△ ぎりぎり" if dscr>=1.0 else "× 返済不能")
            print(f"    {tag+' 営業利益'+format(op,'.0f')+'億が'+mode:<40}{eb:>7.2f}億{lev:>9.1f}倍{fcf:>7.2f}億{dscr:>7.2f}倍  {ok}")
    print()
    print("  【ビジョンの受取額】")
    print(f"    株式{stock:5.2f}億 + 債権70%{dbuy:5.2f}億 = {stock+dbuy:6.2f}億"
          f"　／　債権額面なら {stock+VIS_LOAN:6.2f}億")
    return dict(px=px,stock=stock,roll=roll,uses=uses,vis=stock+dbuy)

print("="*94)
print("共通前提：出向費 月600万＝年0.72億 ／ クロージング 2027年11月末（FY2028期央）")
print(f"　　　　　債権70%取得＋DES ／ みずほTL3.5億 ／ 年間元利返済 {ADS:.2f}億")
print("　　　　　コベナンツ想定 Debt/EBITDA 4.0倍以下・DSCR 1.2倍以上")
print("="*94)
print("\n【出向費0.72億が消えるタイミング】決算期5月末・クロージング2027/11/30")
print("  FY2027 (2026/6-2027/5)  MBO前・満額享受            影響 +0.00億")
print("  FY2028 (2027/6-2028/5)  6〜11月の6か月のみ享受       影響 -0.36億")
print("  FY2029 (2028/6-2029/5)  通年で消滅                影響 -0.72億")

a=run(15.0,"ケース① 15億")
b=run(20.0,"ケース①' 20億")

print("\n"+"="*94)
print("■■ 15億 vs 20億 サマリー")
print("="*94)
print(f"{'':22}{'15億':>14}{'20億':>14}{'差':>12}")
for k,lab in [("px","1株価格(円)"),("stock","①取得代金"),("roll","中野の現物出資"),("uses","Day1所要"),("vis","ビジョン受取総額")]:
    f="{:>14,.0f}" if k=="px" else "{:>13.2f}億"
    print(f"  {lab:<20}"+f.format(a[k])+f.format(b[k])+f"{b[k]-a[k]:>11,.2f}"+("円" if k=="px" else "億"))

print("\n"+"="*94)
print("■■ 損益分岐 ─ 営業利益はいくら必要か（DSCR 1.2倍を満たす最低水準）")
print("="*94)
TARGET=1.2
need_eb=(ADS*TARGET+0.75)/0.95
need_op=need_eb-DA
print(f"  必要EBITDA  {need_eb:.2f}億  → 必要な正常化営業利益 {need_op:.2f}億")
print(f"  これを報告ベース（出向費0.72億の恩恵込み）に直すと {need_op+SHUKKOU:.2f}億")
print(f"  ＝ 第10期実績1.58億に対して {(need_op+SHUKKOU)/1.58-1:+.0%} の改善が必要")
print()
print("  【みずほが出せる新規デットの上限】既存3.67億控除後")
print(f"  {'正常化営業利益':<16}{'EBITDA':>9}{'3.0倍':>9}{'3.5倍':>9}{'4.0倍':>9}{'DSCR1.2倍':>11}")
print("  "+"-"*66)
for nop in [1.00,1.28,1.57,2.00,2.28,3.00]:
    eb=nop+DA
    caps=[max(eb*m-BANK,0) for m in (3.0,3.5,4.0)]
    # DSCR基準の上限：FCF/1.2 = 年間元利 → 逆算でTL元本
    fcf=eb*0.95-0.75
    allow_ads=fcf/1.2
    tl_cap=max((allow_ads-BANK/6)/(1/7+0.03*0.6),0)
    print(f"  {nop:>13.2f}億{eb:>8.2f}億{caps[0]:>8.2f}億{caps[1]:>8.2f}億{caps[2]:>8.2f}億{tl_cap:>10.2f}億")
print("\n  ※右端がDSCR1.2倍から逆算したタームローンの上限。左3列(レバレッジ基準)より厳しい方が実際の天井")
