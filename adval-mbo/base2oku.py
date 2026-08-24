# -*- coding: utf-8 -*-
SH=192_616; BLOC=96_500; NAK=65_000
ND=11.17; BANK=3.67; VIS_LOAN=7.90; FEES=0.45; WC=0.60
DA=0.65                       # 第10期の減価償却
OP_N=2.00                     # ★2026年5月期 出向費ゼロベースの正常化営業利益
EB_N=OP_N+DA
SHUKKOU=0.72
REPORTED=1.58

print("="*96)
print("【基準の確定】2026年5月期・出向費ゼロベース 営業利益 2.00億")
print("="*96)
print(f"  正常化営業利益 {OP_N:.2f}億 ＋ 減価償却 {DA:.2f}億 = 正常化EBITDA {EB_N:.2f}億")
print(f"  ネットデット {ND:.2f}億 → Net Debt/EBITDA {ND/EB_N:.1f}倍（前回試算 9.1倍から大幅改善）")
print()
print("  ■ 銀行に必ず聞かれるブリッジ（第10期の報告値からの差）")
print(f"    第10期 報告営業利益            {REPORTED:+6.2f}億")
print(f"    出向費0.72億の喪失            {-SHUKKOU:+6.2f}億")
print(f"    小計（機械的に正常化した値）        {REPORTED-SHUKKOU:+6.2f}億")
print(f"    ★ 差額（要説明）              {OP_N-(REPORTED-SHUKKOU):+6.2f}億")
print(f"    正常化営業利益                {OP_N:+6.2f}億")
print("    → この1.14億を『撤退店舗の営業損失解消』『大型2施設の通年寄与』等で")
print("      数字で示せるかが、この案件の生命線です")

print()
print("="*96)
print("【適正株式価値】正常化EBITDA 2.65億ベース")
print("="*96)
print(f"{'倍率':>6}{'EV':>10}{'株式価値':>10}{'1株':>11}{'ﾋﾞｼﾞｮﾝ+BOS':>12}{'中野65,000株':>13}")
print("-"*96)
for m in [4,5,6,7,8,9,10,12]:
    ev=EB_N*m; e=ev-ND
    px=e*1e8/SH if e>0 else 0
    mark=" ←適正ゾーン" if 6<=m<=8 else ""
    print(f"{m:>5}倍{ev:>9.2f}億{e:>9.2f}億{px:>10,.0f}円{e*BLOC/SH:>11.2f}億{e*NAK/SH:>12.2f}億{mark}")
print(f"\n  株式価値がゼロになる倍率 = {ND/EB_N:.1f}倍")
print(f"  適正レンジ（6〜8倍）= 株式価値 {EB_N*6-ND:.2f}〜{EB_N*8-ND:.2f}億（中心 {EB_N*7-ND:.2f}億）")

print()
print("="*96)
print("【逆算】15億・20億を正当化するのに必要な営業利益")
print("="*96)
for eq in [15,20]:
    ev=eq+ND
    print(f"  株式価値{eq}億 → EV {ev:.2f}億")
    for m in [7,8,9]:
        eb=ev/m; op=eb-0.70
        print(f"    {m}倍で見るなら 必要EBITDA {eb:.2f}億 → 必要営業利益 {op:.2f}億"
              f"（現状2.00億から {op/OP_N-1:+.0%}）")
    print(f"    現状2.00億(EBITDA2.65億)での実際の倍率 = {ev/EB_N:.1f}倍")
    print()

print("="*96)
print("【みずほの融資余力】正常化EBITDA 2.65億")
print("="*96)
def ads(tl): return tl/7 + tl*0.03*0.6 + BANK/6
fcf=EB_N*0.95-0.75
print(f"  返済前FCF = EBITDA{EB_N:.2f}×0.95 － 設備投資0.75 = {fcf:.2f}億")
for m in [3.0,3.5,4.0]:
    print(f"  レバレッジ{m:.1f}倍基準 → 総デット{EB_N*m:5.2f}億 － 既存{BANK:.2f}億 = 新規余力 {EB_N*m-BANK:5.2f}億")
allow=fcf/1.2
tl_cap=(allow-BANK/6)/(1/7+0.03*0.6)
print(f"  DSCR1.2倍基準  → 許容年間元利 {allow:.2f}億 → タームローン上限 {tl_cap:5.2f}億")
print(f"  ★実際の天井 = {min(EB_N*3.5-BANK, tl_cap):.2f}億 → みずほへの申込は 5.0億が妥当")

print()
print("="*96)
print("【MBO成立性】TL 5.0億で組む（前回の3.5億から増額可能）")
print("="*96)
TL=5.0; DEBT=BANK+TL
A=ads(TL); f2=fcf
print(f"  Post-MBO 有利子負債 {DEBT:.2f}億 ／ Debt/EBITDA {DEBT/EB_N:.1f}倍")
print(f"  年間元利返済 {A:.2f}億 ／ 返済前FCF {f2:.2f}億 → DSCR {f2/A:.2f}倍  "
      f"{'○ 成立' if f2/A>=1.2 else '× 不足'}")
print(f"  DES後 純資産 △4.09 + {VIS_LOAN*0.7:.2f} = {-4.09+VIS_LOAN*0.7:+.2f}億（債務超過解消）")

print()
print("="*96)
print("【資金と持分】①15億 / ①'20億　債権70%取得＋DES ／ みずほTL 5.0億")
print("="*96)
for EQ in [15.0,20.0]:
    px=EQ*1e8/SH; stock=BLOC*px/1e8; roll=NAK*px/1e8
    uses=stock+VIS_LOAN*0.7+FEES+WC
    cash_eq=uses-TL
    print(f"\n  ▼ ①={EQ:.0f}億（1株{px:,.0f}円）")
    print(f"    Day1所要 {uses:5.2f}億 ＝ 株式{stock:5.2f} + 債権{VIS_LOAN*0.7:5.2f} + 費用{FEES:.2f} + 運転{WC:.2f}")
    print(f"    みずほTL {TL:.2f}億を引くと、エクイティで用意する現金 {cash_eq:5.2f}億")
    print(f"    中野様の現物出資 {roll:5.2f}億")
    tot=roll+cash_eq
    print(f"    {'配分':<22}{'ﾊﾟｰﾄﾅｰ':>9}{'中野ﾌｧﾝﾄﾞ':>11}{'中野単独':>9}{'ﾊﾟｰﾄﾅｰ':>9}{'中野陣営':>9}")
    for t in [0.45,0.50,0.55,0.60]:
        F=t*tot-roll; P=cash_eq-F
        if F<0: F=0.0; P=cash_eq
        print(f"    中野陣営{t*100:.0f}%{'':<13}{P:>8.2f}億{F:>10.2f}億"
              f"{roll/tot*100:>8.1f}%{P/tot*100:>8.1f}%{(roll+F)/tot*100:>8.1f}%")
    print(f"    ②③満額15.00億との対比: {15.00-uses:+.2f}億")
    print(f"    ビジョン受取総額 {stock+VIS_LOAN*0.7:5.2f}億（株式{stock:.2f}＋債権{VIS_LOAN*0.7:.2f}）")

print()
print("="*96)
print("【成長パス】2026年5月期 正常化営業利益2.00億を起点とした場合")
print("="*96)
print(f"{'年度':<26}{'+10%':>9}{'+20%':>9}{'+30%':>9}   イベント")
ev_note={0:"2026年5月期（起点・実績を正常化）",1:"2027年5月期（進行期）",
         2:"2028年5月期（★クロージング2027/11・出向費6か月分△0.36）",
         3:"2029年5月期（出向費 通年ゼロ・MBO後 初のフル年度）"}
for t in range(4):
    vals=[OP_N*(1+g)**t for g in (0.10,0.20,0.30)]
    print(f"  {('FY'+str(2026+t)):<24}"+"".join(f"{v:>8.2f}億" for v in vals)+f"   {ev_note[t]}")
print("\n  ※出向費はすでに控除済みの正常化ベース。FY2028の△0.36億は報告値に出る段差であり、")
print("    正常化ベースの上表には影響しません")

print()
print("="*96)
print("【いつ15億／20億が『適正』になるか】EV/EBITDA 8倍で評価した場合")
print("="*96)
print(f"{'年度':<12}{'+10%':>22}{'+20%':>22}{'+30%':>22}")
print("  "+"-"*76)
for t in range(4):
    row=f"  {('FY'+str(2026+t)):<10}"
    for g in (0.10,0.20,0.30):
        op=OP_N*(1+g)**t; eb=op+(DA if t==0 else 0.70); e=eb*8-ND
        tag="◎20億超" if e>=20 else ("○15億超" if e>=15 else ("△10億超" if e>=10 else ""))
        row+=f"{('株式'+format(e,'.1f')+'億 '+tag):>22}"
    print(row)
print("\n  ※FY2026は減価償却0.65億、FY2027以降は投資継続を見込み0.70億で算定")
print("  15億が適正になる = 正常化営業利益 2.57億（8倍前提）")
print("  20億が適正になる = 正常化営業利益 3.20億（8倍前提）")

print()
print("="*96)
print("【結論表】現時点で提示すべき価格")
print("="*96)
rows=[("理論適正（6〜8倍・現状2.00億）", EB_N*6-ND, EB_N*8-ND, EB_N*7-ND),
      ("進行期FY2027を+20%で織込み(8倍)", (OP_N*1.2+0.70)*7-ND, (OP_N*1.2+0.70)*9-ND, (OP_N*1.2+0.70)*8-ND)]
for n,lo,hi,mid in rows:
    print(f"  {n:<34} {lo:5.2f}〜{hi:5.2f}億（中心 {mid:5.2f}億）")
print(f"\n  ①15億 = EV/EBITDA {(15+ND)/EB_N:.1f}倍  → ビジョンには十分に厚い。交渉の落とし所として妥当")
print(f"  ①'20億 = EV/EBITDA {(20+ND)/EB_N:.1f}倍 → 現状水準では説明困難。アーンアウトで届かせる領域")
