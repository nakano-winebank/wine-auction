# -*- coding: utf-8 -*-
# 単位: 千円（第10期末 2026年5月31日 実績BSをベースにしたプロフォーマ）
A={"現金及び預金":40_414,"売掛金":171_870,"販売用不動産":113_446,"未収入金":8_017,
   "未収消費税等":17_414,"前払費用":64_956,"流動その他":19_713,
   "建物附属設備":475_295,"機械及び装置":14_464,"工具器具備品":50_071,"建設仮勘定":21_615,
   "のれん":31_618,"ソフトウェア":48_549,"ソフトウェア仮勘定":18_150,
   "差入保証金":219_967,"投資その他":25_937,"貸倒引当金":-25_473,"端数調整":5}
L={"借入金":1_159_051,"未払金":180_843,"前受金":86_811,"預り金":34_593,"流動その他":47,
   "預り保証金":161_458,"資産除去債務":52_119,"固定その他":50_535,"端数調整":3}
E={"資本金":10_000,"資本準備金":474_160,"その他資本剰余金":168_000,"繰越利益剰余金":-1_061_592}
VIS=790_000; BUYOUT=1_325_000; FEES=45_000; CAP_KEEP=1_000
TA=sum(A.values()); TL=sum(L.values()); TE=sum(E.values())
print(f"検算  資産{TA:,} = 負債{TL:,} + 純資産{TE:,} → {TL+TE:,}  {'OK' if TA==TL+TE else 'NG'}")

def case(name, raise_, repay, refi_rest=True):
    cash_d = raise_ - repay - BUYOUT - FEES
    a=dict(A); a["現金及び預金"] += cash_d
    l=dict(L); l["借入金"] -= repay          # 返済分だけ減る（リファイは同額置換で不変）
    # 純資産：増資 → 無償減資 → 欠損填補 → 自己株式取得 → 費用
    ocs = E["その他資本剰余金"] + E["資本準備金"] + (E["資本金"]-CAP_KEEP) + raise_
    ocs += E["繰越利益剰余金"]               # 欠損填補
    dist_before = ocs                        # 自己株式取得直前の分配可能額
    e={"資本金":CAP_KEEP,"その他資本剰余金":ocs,"繰越利益剰余金":-FEES,"自己株式":-BUYOUT}
    ta=sum(a.values()); tl=sum(l.values()); te=sum(e.values())
    return dict(name=name,raise_=raise_,repay=repay,a=a,l=l,e=e,ta=ta,tl=tl,te=te,
                cash=a["現金及び預金"],debt=l["借入金"],dist=dist_before,
                equity_ratio=te/ta*100)

EB=265_000   # 正常化EBITDA 2.65億
def ratios(c):
    nd=c["debt"]-c["cash"]
    ads=c["debt"]/6 + c["debt"]*0.03*0.6
    fcf=EB*0.95-75_000
    return nd, c["debt"]/EB, nd/EB, fcf/ads if ads else 0

cases=[case("ケースA　増資18.70億・ビジョン5億返済",1_870_000,500_000),
       case("ケースB　増資21.60億・ビジョン全額返済",2_160_000,VIS),
       case("ケースB'　増資23.60億・全額返済＋手元2億",2_360_000,VIS)]

print("\n"+"="*104)
print("【想定BS比較】単位：千円（第10期末 実績BSをベースにしたプロフォーマ）")
print("="*104)
print(f"{'項目':<22}{'第10期末 実績':>16}"+"".join(f"{c['name'][:6]:>18}" for c in cases))
print("-"*104)
rows=[("現金及び預金",lambda c:c['a']['現金及び預金'],A['現金及び預金']),
      ("その他流動資産",lambda c:sum(v for k,v in c['a'].items() if k in['売掛金','販売用不動産','未収入金','未収消費税等','前払費用','流動その他']),
       sum(v for k,v in A.items() if k in['売掛金','販売用不動産','未収入金','未収消費税等','前払費用','流動その他'])),
      ("固定資産",lambda c:sum(v for k,v in c['a'].items() if k not in['現金及び預金','売掛金','販売用不動産','未収入金','未収消費税等','前払費用','流動その他']),
       sum(v for k,v in A.items() if k not in['現金及び預金','売掛金','販売用不動産','未収入金','未収消費税等','前払費用','流動その他'])),
      ("資産合計",lambda c:c['ta'],TA),
      ("有利子負債",lambda c:c['l']['借入金'],L['借入金']),
      ("その他負債",lambda c:c['tl']-c['l']['借入金'],TL-L['借入金']),
      ("負債合計",lambda c:c['tl'],TL),
      ("資本金",lambda c:c['e']['資本金'],E['資本金']),
      ("その他資本剰余金",lambda c:c['e']['その他資本剰余金'],E['その他資本剰余金']+E['資本準備金']),
      ("繰越利益剰余金",lambda c:c['e']['繰越利益剰余金'],E['繰越利益剰余金']),
      ("自己株式",lambda c:c['e']['自己株式'],0),
      ("純資産合計",lambda c:c['te'],TE)]
for n,f,base in rows:
    line=f"{n:<22}{base:>16,}"+"".join(f"{f(c):>18,}" for c in cases)
    print(line)
print("-"*104)
print(f"{'自己資本比率':<22}{TE/TA*100:>15.1f}%"+"".join(f"{c['equity_ratio']:>17.1f}%" for c in cases))
print(f"{'分配可能額(取得直前)':<20}{'―':>16}"+"".join(f"{c['dist']:>18,}" for c in cases))
print(f"{'自己株式取得の可否':<21}{'―':>16}"+"".join(f"{('○ 余裕'+format((c['dist']-BUYOUT)/1e5,'.2f')+'億'):>18}" for c in cases))

print("\n"+"="*104)
print("【財務指標】正常化EBITDA 2.65億／返済前FCF 1.77億")
print("="*104)
print(f"{'指標':<24}{'第10期末':>14}"+"".join(f"{c['name'][:6]:>18}" for c in cases))
print("-"*104)
nd0=L['借入金']-A['現金及び預金']
print(f"{'現預金':<24}{A['現金及び預金']/1e5:>13.2f}億"+"".join(f"{c['cash']/1e5:>17.2f}億" for c in cases))
print(f"{'有利子負債':<24}{L['借入金']/1e5:>13.2f}億"+"".join(f"{c['debt']/1e5:>17.2f}億" for c in cases))
print(f"{'ネットデット':<23}{nd0/1e5:>13.2f}億"+"".join(f"{ratios(c)[0]/1e5:>17.2f}億" for c in cases))
print(f"{'有利子負債/EBITDA':<21}{L['借入金']/EB:>13.1f}倍"+"".join(f"{ratios(c)[1]:>17.1f}倍" for c in cases))
print(f"{'ネットデット/EBITDA':<20}{nd0/EB:>13.1f}倍"+"".join(f"{ratios(c)[2]:>17.1f}倍" for c in cases))
print(f"{'DSCR':<24}{'―':>14}"+"".join(f"{ratios(c)[3]:>17.2f}倍" for c in cases))

print("\n"+"="*104)
print("【重要】ケースA・Bは現預金が増えません")
print("="*104)
for c in cases:
    d=c['raise_']-c['repay']-BUYOUT-FEES
    print(f"  {c['name']:<34} 増資{c['raise_']/1e5:5.2f} －返済{c['repay']/1e5:5.2f} －自己株{BUYOUT/1e5:5.2f} －費用{FEES/1e5:.2f} = {d/1e5:+5.2f}億 → 現預金 {c['cash']/1e5:.2f}億")
print("\n  ★みずほは必ず『21.6億も増資して現金が4,000万？』と聞きます。")
print("    ケースB'（増資23.60億）にして手元に2億残すことを強く推奨します。")
print("    追加2億の負担は 中野ファンド +0.85億 / パートナー +1.15億 です。")

# ケースB' の出資額を再計算
SH=192_616; NAK=65_000; OUT=127_616; px=20.0*1e8/SH
for Z in [18.70,21.60,23.60]:
    nt=round(Z*1e8/px); nf=(nt-NAK)//2; npp=nt-nf
    print(f"    増資{Z:5.2f}億 → 中野ファンド {nf*px/1e8:5.2f}億({nf:,}株) / パートナー {npp*px/1e8:5.2f}億({npp:,}株)"
          f" / 議決権 各50.000%")
