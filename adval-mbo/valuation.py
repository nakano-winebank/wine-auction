# -*- coding: utf-8 -*-
OKU=1e8
SH=192_616; SH_FD=201_616          # 顕在 / 潜在込
ND=11.17                            # ネットデット(有利子負債11.57 - 現預金0.40)
DA=0.65                             # 減価償却

def eq(ev): return ev-ND
def ps(e,fd=False): return e*OKU/(SH_FD if fd else SH)

print("="*96)
print("【前提】EBITDAの3つの水準")
print("="*96)
cases={
 "A 現状水準 FY2026実績(付替え継続)":      (1.58, 1.58+DA),
 "B 正常化 出向付替え1.0億を戻す":          (0.58, 0.58+DA),
 "C 進行期FY2027 保守(営利2.5億)":         (2.50, 2.50+0.70),
 "D 進行期FY2027 会社計画(営利3.89億)":     (3.89, 3.89+0.70),
}
for k,(op,eb) in cases.items(): print(f"  {k:<38} 営業利益{op:5.2f}億  EBITDA{eb:5.2f}億")

print()
print("="*96)
print("【EV/EBITDA法】 株式価値 = EV － ネットデット11.17億")
print("="*96)
mults=[5,6,7,8,9,10,12]
print(f"{'ケース':<34}" + "".join(f"{m:>8.0f}x" for m in mults))
print("-"*96)
for k,(op,eb) in cases.items():
    row=f"{k:<34}"
    for m in mults:
        e=eq(eb*m)
        row+=f"{e:>8.1f}" if e>0 else f"{'△'+format(-e,'.1f'):>9}"
    print(row)
print("\n  ※単位:億円。マルチプル1倍の変動で株式価値は EBITDA分(約2.2億@ケースA)動く")

print()
print("="*96)
print("【感応度の正体】ネットデットが厚いため株式価値は薄皮")
print("="*96)
for k,(op,eb) in cases.items():
    be=ND/eb
    print(f"  {k:<38} 株式価値がゼロになる倍率 = {be:5.1f}x")

print()
print("="*96)
print("【EV/売上法】売上21.80億(FY2026実績)")
print("="*96)
for r in [0.6,0.8,1.0,1.2,1.5]:
    ev=21.80*r; print(f"  {r:.1f}x → EV {ev:5.2f}億 → 株式価値 {eq(ev):6.2f}億")

print()
print("="*96)
print("【時価純資産＋営業権法(年買法)】純資産△4.09億")
print("="*96)
for name,op in [("実績営業利益1.58億",1.58),("正常化営業利益0.58億",0.58)]:
    for yr in [3,5]:
        print(f"  {name:<22} 営業権{yr}年分 {op*yr:5.2f}億 → 株式価値 {-4.09+op*yr:6.2f}億")

print()
print("="*96)
print("【簡易DCF】WACC 11% / 永久成長1% / 実効税率30%(繰越欠損金で当初3年は5%)")
print("="*96)
import itertools
def dcf(op0, growth, wacc=0.11, g=0.01, years=5):
    fcfs=[]; op=op0
    for t in range(1,years+1):
        op*= (1+growth)
        tax = 0.05 if t<=3 else 0.30
        da_t=0.70; capex=0.75; wc=0.05
        fcf = op*(1-tax)+da_t-capex-wc
        fcfs.append(fcf/((1+wacc)**t))
    tv = (op*(1-0.30)+0.70-0.75-0.05)*(1+g)/(wacc-g)
    return sum(fcfs)+tv/((1+wacc)**years)
for label,op0,gr in [("現状水準から年5%成長",1.58,0.05),
                     ("現状水準から年12%成長",1.58,0.12),
                     ("正常化から年12%成長",0.58,0.12),
                     ("進行期2.5億から年8%成長",2.50,0.08)]:
    ev=dcf(op0,gr); print(f"  {label:<26} EV {ev:6.2f}億 → 株式価値 {eq(ev):6.2f}億")

print()
print("="*96)
print("【まとめ】適正株式価値レンジと1株価格")
print("="*96)
ranges=[("現状水準(FY2026実績)ベース", 3.0, 7.0, 5.0),
        ("進行期(FY2027)の改善を織込み", 8.0, 14.0, 11.0),
        ("FY2028計画達成を前提",       16.0, 22.0, 19.0)]
for n,lo,hi,mid in ranges:
    print(f"\n  {n}")
    print(f"    レンジ {lo:.0f}〜{hi:.0f}億 (中心{mid:.0f}億)  EV換算 {lo+ND:.1f}〜{hi+ND:.1f}億")
    print(f"    1株 {ps(lo):>7,.0f}〜{ps(hi):>7,.0f}円 (顕在192,616株) / {ps(lo,1):>7,.0f}〜{ps(hi,1):>7,.0f}円 (潜在込201,616株)")
    print(f"    ビジョン+BOS 96,500株 = {mid*96_500/SH:5.2f}億  ／  中野65,000株 = {mid*65_000/SH:5.2f}億")

print()
print("="*96)
print("【重要】『18億』が何を指すかで結論が真逆になる")
print("="*96)
for v in [15,18,20]:
    print(f"  提示額{v}億が…")
    print(f"    株式価値(Equity)なら → EV {v+ND:5.2f}億 = 実績EBITDA {(v+ND)/2.23:5.1f}倍  ビジョン持分50.1%の受取 {v*96_500/SH:5.2f}億")
    print(f"    事業価値(EV)なら     → 株式価値 {v-ND:5.2f}億 = 実績EBITDA {v/2.23:5.1f}倍  ビジョン持分50.1%の受取 {(v-ND)*96_500/SH:5.2f}億")
