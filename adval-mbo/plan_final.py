# -*- coding: utf-8 -*-
SH=192_616; BLOC=96_500; NAK=65_000; SO=9_000; MINOR=31_116
EQ=15.0                      # ①あどばる株式価値(pre-money, 192,616株ベース)
OP_N=2.00; DA=0.65; EB=OP_N+DA
NA0=-4.09                    # 第10期末 純資産
BANK=3.67; VIS=7.90
REPAY=5.00                   # ★増資5億でビジョンへ返済
REST=VIS-REPAY               # 残 2.90億
FEES=0.45; WC=0.60
ZOSHI=5.00                   # ★第三者割当増資

def ads(p,yrs,rate=0.03): return p/yrs + p*rate*0.6

print("="*98)
print("【ご指示の反映】増資5億 → ビジョン5億返済を計画に組込み。SO込みで中野陣営50.1%を確保")
print("="*98)

# ---- SO行使価額の感応度 ----
print("\n■ ステップ0：中野様のSO 9,000株を行使（行使価額が未確定のため感応度を表示）")
print(f"  {'行使価額':>10}{'払込額':>10}{'増資後1株':>11}{'中野74,000株':>13}{'65,000株のみ':>13}{'SO効果':>9}")
for E in [500,1000,3000,5000]:
    infl=SO*E/1e8
    px=(EQ+infl)*1e8/(SH+SO)
    r74=74_000*px/1e8; r65=NAK*(EQ*1e8/SH)/1e8
    print(f"  {E:>9,}円{infl:>9.2f}億{px:>10,.0f}円{r74:>12.2f}億{r65:>12.2f}億{r74-r65-infl:>8.2f}億")

E=1000                       # 以降は行使価額1,000円で試算
INFL=SO*E/1e8
PX=(EQ+INFL)*1e8/(SH+SO)
SHARES=SH+SO
roll=74_000*PX/1e8
stock=BLOC*PX/1e8
newsh=ZOSHI*1e8/PX

print(f"\n■ 前提：行使価額1,000円 → 払込{INFL:.2f}億／増資後1株 {PX:,.0f}円")
print(f"  中野様の現物出資(74,000株)  {roll:5.2f}億   ← SOなし5.06億から +{roll-5.06:.2f}億")
print(f"  ビジョン+BOS 96,500株の代金 {stock:5.2f}億")
print(f"  第三者割当増資5億の新株数    {newsh:,.0f}株 @{PX:,.0f}円")

print()
print("="*98)
print("【資金の流れ】SPC階層と あどばる階層を分ける")
print("="*98)
spc_uses=stock+ZOSHI+FEES
print(f"  ◆SPC階層")
print(f"    Uses  ビジョン+BOS株式取得              {stock:5.2f}億")
print(f"    Uses  あどばるへの第三者割当増資 引受      {ZOSHI:5.2f}億  ★SPC経由で入れる(後述)")
print(f"    Uses  諸費用                        {FEES:5.2f}億")
print(f"    ---------------------------------------------")
print(f"    SPC Day1所要                        {spc_uses:5.2f}億")
print(f"\n  ◆あどばる階層")
print(f"    In    第三者割当増資                   {ZOSHI:5.2f}億")
print(f"    Out   ビジョン借入 返済               △{REPAY:5.2f}億  ★ご指示どおり")
print(f"    Out   ビジョン借入 残 {REST:.2f}億の処理     → 下記2案")
print(f"    In    みずほ 運転資金枠                 {WC:5.2f}億")

print()
print("="*98)
print("【債務超過の解消】ここがみずほを動かす核心")
print("="*98)
print(f"  現状 純資産            {NA0:+6.2f}億")
print(f"  第三者割当増資          {ZOSHI:+6.2f}億")
print(f"  ------------------------------")
print(f"  増資のみの場合          {NA0+ZOSHI:+6.2f}億  ← 解消はするが厚みが薄い")
buy=REST*0.70
print(f"\n  【上乗せ案】残債権{REST:.2f}億を額面70%＝{buy:.2f}億で譲受しDES")
print(f"    純資産            {NA0+ZOSHI:+6.2f} + {buy:5.2f} = {NA0+ZOSHI+buy:+6.2f}億")
print(f"    債務消滅益          {REST-buy:+6.2f}億（繰越欠損金10.62億で吸収）")
print(f"    → 実質 純資産 {NA0+ZOSHI+buy+(REST-buy):+.2f}億まで積み上がる")

print()
print("="*98)
print("【みずほの融資枠】正常化EBITDA 2.65億／DSCR1.2倍・レバレッジ3.5倍")
print("="*98)
fcf=EB*0.95-0.75
allow=fcf/1.2
print(f"  返済前FCF {fcf:.2f}億 → 許容年間元利 {allow:.2f}億")
for name,rest_mode in [("案① 残2.90億をみずほでリファイ", "refi"),("案② 残2.90億を割引取得＋DES","des")]:
    used=ads(BANK,6)
    extra=ads(REST,7) if rest_mode=="refi" else 0.0
    used+=extra
    L=max((allow-used)/(1/7+0.03*0.6),0)
    total=BANK+(REST if rest_mode=="refi" else 0)+L
    print(f"\n  {name}")
    print(f"    既存3.67億の元利 {ads(BANK,6):.2f}億" + (f" ＋ リファイ{REST:.2f}億の元利 {extra:.2f}億" if extra else ""))
    print(f"    → SPC向けLBOローンの上限 {L:5.2f}億")
    print(f"    Post-MBO 総有利子負債 {total:5.2f}億 = EBITDA比 {total/EB:.1f}倍")
    print(f"    みずほ与信合計 {(REST if rest_mode=='refi' else 0)+L:5.2f}億")

print()
print("="*98)
print("【持分】SO込みで中野陣営50.1%を確保する配分")
print("="*98)
for name,rest_mode in [("案① リファイ","refi"),("案② 割引取得＋DES","des")]:
    used=ads(BANK,6)+(ads(REST,7) if rest_mode=="refi" else 0.0)
    L=max((allow-used)/(1/7+0.03*0.6),0)
    extra_use=0.0 if rest_mode=="refi" else buy   # DESなら債権取得代金がSPCのUsesに乗る
    uses=spc_uses+extra_use
    cash=uses-L
    tot=roll+cash
    F=0.501*tot-roll; P=cash-F
    print(f"\n  {name}  SPC Day1所要 {uses:5.2f}億（うちLBO {L:.2f}億）")
    print(f"    中野 現物出資(SO込74,000株) {roll:5.2f}億 → {roll/tot*100:5.1f}%")
    print(f"    パートナー                {P:5.2f}億 → {P/tot*100:5.1f}%")
    print(f"    中野ファンド               {F:5.2f}億 → {F/tot*100:5.1f}%")
    print(f"    SPC総エクイティ            {tot:5.2f}億")
    print(f"    ★中野陣営（中野＋ファンド）  {(roll+F)/tot*100:5.1f}%")
    print(f"    パートナー上限 = {P:.2f}億。②の『5〜7億＋増資5億＝10〜12億』は入れすぎ")

print()
print("="*98)
print("【②を満額10〜12億入れる場合】議決権制限付種類株が必須になる")
print("="*98)
used=ads(BANK,6)+ads(REST,7); L=max((allow-used)/(1/7+0.03*0.6),0)
cash=spc_uses-L; tot=roll+cash
print(f"  SPC総エクイティ {tot:.2f}億／中野現物 {roll:.2f}億")
for P in [10.0,11.0,12.0]:
    F=max(cash-P,0)
    ord_cap=(roll+F)/0.501-(roll+F)     # 中野陣営51%を保つための普通株上限
    pref=max(P-ord_cap,0)
    print(f"  パートナー{P:5.2f}億 → ファンド{F:5.2f}億 ／ 経済持分 中野陣営{(roll+F)/(roll+P+F)*100:5.1f}%")
    print(f"      議決権50.1%を保つには：普通株 {min(ord_cap,P):5.2f}億以下／議決権制限付優先株 {pref:5.2f}億以上")

print()
print("="*98)
print("【増資の入れ方】SPC経由 vs パートナー直接引受 ─ あどばるの株主構成が変わる")
print("="*98)
tot_sh=SHARES+newsh
spc_b=74_000+BLOC+newsh
print(f"  増資後の あどばる発行済株式数 {tot_sh:,.0f}株（{SH:,}＋SO{SO:,}＋新株{newsh:,.0f}）\n")
print("  ◆ルートB（推奨）SPCが増資を引受")
print(f"    SPC          {spc_b:>9,.0f}株  {spc_b/tot_sh*100:5.2f}%")
print(f"    少数株主       {MINOR:>9,}株  {MINOR/tot_sh*100:5.2f}%")
print(f"    → 中野陣営はSPCの50.1%を握れば足りる。SPCが88%を持つので支配の余裕が大きい")
spc_a=74_000+BLOC
print("\n  ◆ルートA　パートナーが あどばる新株を直接引受")
print(f"    SPC          {spc_a:>9,.0f}株  {spc_a/tot_sh*100:5.2f}%")
print(f"    パートナー直接   {newsh:>9,.0f}株  {newsh/tot_sh*100:5.2f}%")
print(f"    少数株主       {MINOR:>9,}株  {MINOR/tot_sh*100:5.2f}%")
print(f"    → SPCの持分が{spc_a/tot_sh*100:.1f}%まで下がり、支配の余裕が薄い。パートナーが")
print(f"       あどばるの直接株主にもなるため交渉と契約が二重になる。ルートBを推奨")

print()
print("="*98)
print("【最終形】案① 15億・増資5億・ビジョン5億返済・残2.90億みずほリファイ")
print("="*98)
used=ads(BANK,6)+ads(REST,7); L=max((allow-used)/(1/7+0.03*0.6),0)
cash=spc_uses-L; tot=roll+cash
F=0.501*tot-roll; P=cash-F
print(f"  ◆調達")
print(f"    中野様  あどばる74,000株(SO行使込)を現物出資     {roll:5.2f}億")
print(f"    パートナー  SPCへ現金出資                     {P:5.2f}億")
print(f"    中野ファンド  SPCへ現金出資                    {F:5.2f}億")
print(f"    みずほ  SPC向けLBOタームローン                {L:5.2f}億")
print(f"    みずほ  あどばる向けリファイナンス               {REST:5.2f}億")
print(f"    みずほ  運転資金枠                          {WC:5.2f}億")
print(f"    　　　　　　　　　　　　　みずほ与信合計          {L+REST+WC:5.2f}億")
print(f"  ◆使途")
print(f"    ビジョン+BOS 96,500株の取得                  {stock:5.2f}億")
print(f"    あどばるへの第三者割当増資 → ビジョン借入5億返済   {ZOSHI:5.2f}億")
print(f"    ビジョン借入残 2.90億の返済（リファイ原資）        {REST:5.2f}億")
print(f"    諸費用                                   {FEES:5.2f}億")
print(f"  ◆結果")
print(f"    純資産        {NA0:+.2f} → {NA0+ZOSHI:+.2f}億（債務超過解消）")
print(f"    有利子負債     11.57 → {BANK+REST+L:.2f}億（ビジョン借入は全額消滅）")
print(f"    Debt/EBITDA  {(BANK+REST+L)/EB:.1f}倍 ／ DSCR {fcf/(ads(BANK,6)+ads(REST,7)+ads(L,7)):.2f}倍")
print(f"    SPC持分      中野{roll/tot*100:.1f}% ﾊﾟｰﾄﾅｰ{P/tot*100:.1f}% ﾌｧﾝﾄﾞ{F/tot*100:.1f}% → 中野陣営 {(roll+F)/tot*100:.1f}%")
print(f"    あどばる      SPC {spc_b/tot_sh*100:.1f}%／少数株主 {MINOR/tot_sh*100:.1f}%")
print(f"    ビジョン受取   株式{stock:.2f} + 借入返済{VIS:.2f} = {stock+VIS:.2f}億（全額現金・額面満額）")
print(f"\n  ※パートナーへの依頼額は {P:.2f}億。②の『5〜7億＋増資5億』のうち、")
print(f"    SPCが必要とする現金は合計 {cash:.2f}億しかないため、11億以上を集めても余ります")
