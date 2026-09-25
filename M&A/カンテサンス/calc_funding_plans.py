# -*- coding: utf-8 -*-
OP=528.0; DEP=1.0; TAX=0.34; CAPEX=30.0; RATE=0.03
CASH_T=1743.0; LOANR=500.0; UNPAID=114.0

def prof(tla,tlb,yrs,start):
    amo=tla/yrs; cash=start; rows=[]
    for y in range(1,yrs+1):
        bal=(tla-amo*(y-1))+tlb; i=bal*RATE
        tax=max(0.0,OP-i)*TAX; paid=tax+(UNPAID if y==1 else 0.0)
        cfads=OP+DEP-tax-CAPEX
        cash += OP+DEP-i-paid-CAPEX-amo-(tlb if y==yrs else 0.0)
        rows.append((y,bal,amo,i,cfads/(amo+i),cash))
    return rows

def plan(name, D, tlb_r, yrs, R, price):
    tlb=D*tlb_r; tla=D-tlb
    r=prof(tla,tlb,yrs,R)
    bridge=CASH_T+LOANR-R
    src=D+1000+bridge; uses=price+150
    print(f"\n■ {name}")
    print(f"   恒久ターム {D/100:.1f}億 (TLA {tla/100:.2f}億/{yrs}年元金均等 ＋ TLB {tlb/100:.2f}億/期限一括)")
    print(f"   初年度DSCR {r[0][4]:.2f}  最低DSCR {min(x[4] for x in r):.2f}  Debt/EBITDA {D/529:.2f}倍")
    print(f"   最終年度末の現金 {r[-1][5]/100:.2f}億円（留保 {R/100:.1f}億スタート）")
    print(f"   資金: ターム{D/100:.1f} + 投資家10.0 + ブリッジ{bridge/100:.2f} = {src/100:.2f}億"
          f" / 所要 {uses/100:.2f}億 → 中野氏拠出 {(uses-src)/100:+.2f}億")
    print(f"   みずほ様への総ご相談額 {(D+bridge)/100:.1f}億円")
    return r

plan("案1【現行案】借入20.0億・7年・留保1.0億", 2000,0.30,7,100,5000)
plan("案2【推奨】借入25.0億・10年・留保6.0億", 2500,0.30,10,600,5000)
plan("案3【55億で決着した場合】借入30.0億・10年・留保6.0億", 3000,0.35,10,600,5500)
print()
print("="*72)
print("参考：案2の年次プロファイル（借入25億・10年・TLA17.5/TLB7.5）")
print("  年  期首残高  元本  利息  DSCR  期末現金")
for y,bal,amo,i,d,c in prof(1750,750,10,600):
    print(f"  Y{y:2d} {bal/100:7.2f} {amo/100:5.2f} {i/100:5.2f} {d:5.2f} {c/100:8.2f}")
