# -*- coding: utf-8 -*-
from datetime import date
def xnpv(r,c): 
    t0=c[0][0]; return sum(v/((1+r)**((d-t0).days/365.0)) for d,v in c)
def xirr(c):
    r=0.0; prev=xnpv(r,c); lo=None
    while r<60:
        r2=r+0.002; cur=xnpv(r2,c)
        if prev*cur<0: lo,hi=r,r2; break
        prev=cur; r=r2
    if lo is None: return None
    for _ in range(200):
        m=(lo+hi)/2
        if xnpv(lo,c)*xnpv(m,c)<=0: hi=m
        else: lo=m
    return (lo+hi)/2
M=1_000_000
def P(x): return f"{x/M:>8,.1f}"

print("="*80); print("【1】資料記載IRRの再現検証（消費税考慮版＝最新）"); print("="*80)
gk1=[(date(2026,9,1),-165*M),(date(2026,10,1),29*M),(date(2027,3,1),91*M),(date(2027,4,1),13*M),
     (date(2027,9,1),96*M),(date(2028,3,1),16.16*M),(date(2028,9,1),78.04*M)]
d2=[date(2026,9,1)]+[date(2027+i,3,1) for i in range(22)]
pre2=[-501*M,281.2*M,219.8*M,28.6*M,28.6*M,28.6*M,15.4*M]+[0]*15+[10*M]
tax2=[-501*M,288.5*M,362.0*M,18.6*M,18.6*M,18.6*M,5.4*M]+[-10*M]*14+[0,0]
pre2=pre2[:len(d2)]; tax2=tax2[:len(d2)]
c2p=list(zip(d2,pre2)); c2t=list(zip(d2,tax2))
rows=[("GK① 造船TK",195*M,353.2*M,xirr(gk1),1.137),
      ("GK② 会員権TK（税前）",611*M,722.2*M,xirr(c2p),0.150),
      ("GK② 会員権TK（税効果込）",611*M,722.2*M,xirr(c2t),0.333)]
print(f"  {'':26s}{'拠出':>10s}{'分配':>10s}{'ネット':>10s}{'Multiple':>10s}{'当方再計算':>10s}{'資料記載':>10s}")
for n,c,dd,r,doc in rows:
    print(f"  {n:26s}{P(c)}{P(dd)}{P(dd-c)}{(dd/c):>9.3f}x{r*100:>9.1f}%{doc*100:>9.1f}%  {'一致' if abs(r-doc)<0.01 else '差異'}")
print("  （単位：百万円）")

print("\n"+"="*80); print("【2】中野さん（WineBank）の枠 — GK①に既に配分済み"); print("="*80)
call=26*M; profit=158.2*M*(1/7.5)
print(f"  当初持分 10.0% → 割り戻し後 13.33%")
print(f"  キャピタルコール ①22百万 ＋ ②4百万 ＝ {P(call)}百万円")
print(f"  投資利益額 158.2百万 × 13.33% ＝ {P(profit)}百万円")
print(f"  回収 {P(call+profit)}百万円   Multiple {(call+profit)/call:.3f}x   IRR 113.7%（全投資家共通）")
share=26/195
mine=[(d,v*share) for d,v in gk1]
print(f"  按分後CF: "+" / ".join(f"{d.strftime('%y-%m')} {v/M:+.1f}" for d,v in mine))
print(f"  → 検算 XIRR {xirr(mine)*100:.1f}%（全体と同率＝按分は正しい）")

print("\n"+"="*80); print("【3】110%のIRRは何で出来ているか"); print("="*80)
ship=94.5*M; refit=50*M; cost=ship+refit
print(f"  中古船取得 {P(ship)} ＋ 改装 {P(refit)} ＝ 実原価 {P(cost)}百万円")
print(f"  GK②への売却価格 435.0百万 → 実原価の {435*M/cost:.2f}倍（マークアップ {(435*M/cost-1)*100:.0f}%）")
print(f"  GK①の総費用（AM報酬1.0億等込）276.8百万 に対しては {435*M/(276.8*M):.2f}倍")
print(f"\n  利益158.2百万の出どころ＝会員権10億円。GK①はその最初の取り分を、2年という短期で受け取る。")
print(f"  IRRが高いのは『利幅が大きい』からではなく『期間が短い』から：")
for yrs in [1,2,3,5]:
    print(f"     Multiple 1.811 を {yrs}年で実現 → 年率 {(1.811**(1/yrs)-1)*100:>6.1f}%")

print("\n"+"="*80); print("【4】GK①とGK②を合算した『事業全体』のリターン"); print("="*80)
comb={}
for d,v in gk1: comb[d]=comb.get(d,0)+v
for d,v in c2p: comb[d]=comb.get(d,0)+v
cc=sorted(comb.items()); tc=806*M; td=1075.4*M
print(f"  合計拠出 {P(tc)} / 合計分配 {P(td)} / ネット {P(td-tc)}百万円")
print(f"  合算 XIRR {xirr(cc)*100:.1f}%   Multiple {td/tc:.3f}x")
print(f"  → GK①の113.7%は総資金8.06億のうち{195/806*100:.0f}%だけを見た数字。事業全体では{xirr(cc)*100:.0f}%")

print("\n"+"="*80); print("【5】感応度：110%を壊しうる要因（GK①）"); print("="*80)
def s(label,cf,note=""):
    r=xirr(cf); tot=sum(v for _,v in cf)
    print(f"  {label:38s} IRR {(f'{r*100:>6.1f}%' if r else '  算定不能')}  ネット{P(tot)}  {note}")
s("ベース（資料どおり）",gk1)
# 移転価格否認: 売却価格が圧縮された場合、GK①の受取が減る
for price,lab in [(350,"3.50億"),(300,"3.00億"),(250,"2.50億"),(200,"2.00億")]:
    delta=(435-price)*M
    adj=[(d,v) for d,v in gk1]
    # 減額分を最終分配から順に削る
    rem=delta*1.1  # 税込
    out=[]
    for d,v in reversed(adj):
        if v>0 and rem>0:
            cut=min(v,rem); out.append((d,v-cut)); rem-=cut
        else: out.append((d,v))
    s(f"売買価格が{lab}に否認",sorted(out))
# 会員権が売れずGK②が支払不能→後半の分配が飛ぶ
part=[(d,v) for d,v in gk1 if d<=date(2027,9,1)]
s("2027/9以降の受取が停止（GK②資金不足）",part,"※後半94.2百万が未収")
s("AM報酬1.0億が無い場合",[(d,v+ (100*M if d==date(2027,3,1) else 0)) for d,v in gk1])

print("\n"+"="*80); print("【6】GK②の税効果33.3%を壊しうる要因"); print("="*80)
def gk2(dep_first, refund_ok=True, lab=""):
    plG=33.6*M-5*M-dep_first
    ref=round(-plG*0.35/1e5)*1e5 if (plG<0 and refund_ok) else 0
    base=[-501*M,288.5*M,219.8*M+ref]+[18.6*M]*3+[5.4*M]+[-10*M]*14+[0,0]
    cf=list(zip(d2,base[:len(d2)])); r=xirr(cf)
    print(f"  {lab:40s} 初年度還付 {ref/M:>6,.1f}百万 → IRR {r*100:>5.1f}%")
gk2(435*M,True,"耐用2年・初年度100%（資料の前提）")
gk2(174*M,True,"耐用5年・200%定率（FRP船=7年なら）")
gk2(435*M*0.583,True,"耐用2年だが月割（9月取得・3月決算）")
gk2(200*M,True,"売買価格が2.0億に否認された場合")
gk2(435*M,False,"投資家に相殺できる他の所得が無い場合")
print("  ※ 還付1.422億は『投資家が同一年度に4.06億円の他の課税所得を持つ』ことが前提")
print("  ※ 個人組合員は匿名組合損失を他の所得と通算できない（措法41の4の2）→ 還付ゼロ")

print("\n"+"="*80); print("【7】ブック内の突合ずれ"); print("="*80)
for a,va,b,vb in [
 ("GK①CF(税抜版) キャピタルコール",178.0,"GK①CF(消費税考慮)・原田さんシート",195.0),
 ("GK①CF(税抜版) 費目合計 D26",176.8,"同シート月次合計 E+K",178.0),
 ("GK①CF(税抜版) Multiple",1.889,"GK①CF(消費税考慮) Multiple",1.811),
 ("GK②CF(税抜版) キャピタルコール",561.0,"GK②CF(消費税考慮)",611.0),
 ("建造費シート 明細合計 C14",92.216,"同シート 建造費合計 F3",94.436),
 ("収益分配 r45 投資家G分配利益(50%)",267.8,"r82 ネット投資家G利益配分額",268.2),
 ("r80造船TK158.2＋r51会員権TK112.2",270.4,"r82 ネット投資家G利益配分額",268.2),
 ("船舶売買代金検証 旧案",435.0,"同シート 調整後",420.967),
 ("収益分配 r50 会員権TK出資額",560.0,"GK②CF(消費税考慮) キャピタルコール",611.0)]:
    print(f"  {a:40s}{va:>9,.3f}  vs  {b:36s}{vb:>9,.3f}   差 {va-vb:>+8,.3f}")

print("\n"+"="*80); print("【8】GK①とGK②で船舶代金の授受タイミングが噛み合っていない"); print("="*80)
print("  GK②（消費税考慮）: 船舶代金 478.5百万（税込）を 2026-09 に全額支払")
print("  GK①（消費税考慮）: 同額を 2026-10 / 2027-03 / 2027-09 / 2028-03 / 2028-09 の5回に分けて受取")
print("  → 2年間、478.5百万円がどちらの帳簿にも存在しない。GK①のキャッシュポジションは常時30百万程度")
print("  → どちらかが誤り。GK②が分割払なら同社の初期拠出611百万は過大（＝GK②のIRRは上振れ）")
print("     GK①が一括受取なら同社のIRRは113.7%より更に上振れ")
