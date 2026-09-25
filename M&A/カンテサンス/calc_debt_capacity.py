# -*- coding: utf-8 -*-
OP=528.0; DEP=1.0; TAX=0.34; GW=2685.0

def model(tla, tlb, mode='B', capex=0.0, yrs=7, rate=0.03, amort_yrs=5):
    amo=tla/yrs; carry=0.0; rows=[]; cum=0.0
    for y in range(1,yrs+1):
        bal=(tla-amo*(y-1))+tlb; i=bal*rate
        if mode=='A': tax=OP*TAX
        else:
            ded=i+(GW/amort_yrs if (mode=='C' and y<=amort_yrs) else 0.0)
            ti=OP-ded
            if ti<0: carry+= -ti; ti=0.0
            elif carry>0:
                u=min(carry,ti*0.5); ti-=u; carry-=u
            tax=ti*TAX
        cfads=OP+DEP-tax-capex
        ds=amo+i                      # 経常返済（バルーン除く）
        cum+=cfads-ds
        rows.append(dict(y=y,bal=bal,amo=amo,i=i,ds=ds,tax=tax,cfads=cfads,dscr=cfads/ds,cum=cum))
    return rows

def summary(tag,tla,tlb,mode,capex=0.0):
    r=model(tla,tlb,mode,capex)
    mn=min(x['dscr'] for x in r); cum=r[-1]['cum']
    ok = (cum>=tlb)
    print(f"{tag:46s} 借入{(tla+tlb)/100:5.2f}億 (TLA{tla/100:.1f}/TLB{tlb/100:.1f})"
          f" 初年度DSCR {r[0]['dscr']:.2f} 最低 {mn:.2f}"
          f" 7年累積余剰 {cum/100:5.2f}億 {'○' if ok else '×'} バルーン{tlb/100:.1f}億")
    return r

print("="*100); print("【1】税務前提ごとの返済能力（経常返済ベース／バルーンは累積余剰で判定）"); print("="*100)
for m,lab in (('A','ケースA 現行モデル（税効果なし）'),
              ('B','ケースB 合併後・支払利息の損金算入'),
              ('C','ケースC 参考：資産調整勘定を5年償却')):
    r=summary(lab,1400,600,m)
    print("      年次DSCR: "+"  ".join(f"Y{x['y']}:{x['dscr']:.2f}" for x in r))
    print("      年次CFADS: "+" ".join(f"{x['cfads']/100:.2f}" for x in r))

print("\n"+"="*100); print("【2】維持更新投資を織り込む（ケースB）"); print("="*100)
for cx in (0,30,50):
    summary(f"  設備投資 年{cx/100:.2f}億円",1400,600,'B',capex=cx)

print("\n"+"="*100); print("【3】借入可能額の上限（ケースB・設備投資0.30億/年・DSCR下限1.20）"); print("="*100)
best=None
for D in range(1800,3200,100):
    for tlb_ratio in (0.30,0.35,0.40,0.45,0.50):
        tlb=D*tlb_ratio; tla=D-tlb
        r=model(tla,tlb,'B',capex=30.0)
        mn=min(x['dscr'] for x in r); cum=r[-1]['cum']
        if mn>=1.20 and cum>=tlb:
            if best is None or D>best[0]: best=(D,tla,tlb,mn,cum)
if best:
    D,tla,tlb,mn,cum=best
    print(f"  上限 {D/100:.1f}億円 (TLA{tla/100:.1f}億 + TLB{tlb/100:.1f}億) 最低DSCR {mn:.2f} 累積余剰 {cum/100:.2f}億")
for D in (2000,2200,2500):
    tlb=D*0.35; tla=D-tlb
    r=model(tla,tlb,'B',capex=30.0)
    print(f"  借入{D/100:5.1f}億 TLA{tla/100:.1f}/TLB{tlb/100:.1f} 初年度DSCR {r[0]['dscr']:.2f}"
          f" 最低{min(x['dscr'] for x in r):.2f} 累積余剰{r[-1]['cum']/100:.2f}億"
          f" {'→ 成立' if min(x['dscr'] for x in r)>=1.2 and r[-1]['cum']>=tlb else '→ 不成立'}")

print("\n"+"="*100); print("【4】Debt/EBITDA と 総調達額"); print("="*100)
for D in (2000,2200,2500):
    print(f"  借入{D/100:5.1f}億 → Debt/EBITDA {D/529:.2f}倍")
print(f"\n  クロージング所要額 51.50億 = 株式50.00 + 取得関連費用1.50")
for D,ret in ((2000,100),(2200,100),(2000,600)):
    bridge = 1743+500-ret
    print(f"  恒久TL{D/100:5.1f}億 + 投資家10.00 + ブリッジ{bridge/100:5.2f}億(留保{ret/100:.1f}億) "
          f"= {(D+1000+bridge)/100:6.2f}億 → 中野氏拠出 {(5150-D-1000-bridge)/100:+.2f}億")
