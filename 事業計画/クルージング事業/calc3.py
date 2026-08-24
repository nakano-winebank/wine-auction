# -*- coding: utf-8 -*-
def npv(r,cfs): return sum(c/((1+r)**i) for i,c in enumerate(cfs))
def irr(cfs,start=0.0):
    r=start; prev=npv(r,cfs); lo=None
    while r<30:
        r2=r+0.002; cur=npv(r2,cfs)
        if prev*cur<0: lo,hi=r,r2; break
        prev=cur; r=r2
    if lo is None: return None
    for _ in range(200):
        mid=(lo+hi)/2
        if npv(lo,cfs)*npv(mid,cfs)<=0: hi=mid
        else: lo=mid
    return (lo+hi)/2

BUY=40000; NET_IN=60000; REPAIR_IN=600; N_Y=20
def build(sellout,frac,maint):
    cf=[0.0]*(N_Y+1); cf[0]-=BUY
    for t in range(1,sellout+1): cf[t]+=NET_IN*frac/sellout
    for t in range(1,N_Y+1): cf[t]+=REPAIR_IN-maint
    return cf
print("="*74)
print("【2】投資リターン Case B : 会員権発行TK（TK②）への出資  ※IRR修正・確定版")
print("="*74)
print(f"  {'ケース':14s}{'20年累計CF':>11s}{'倍率':>7s}{'IRR':>9s}{'3年末累計':>11s}{'回収年':>8s}")
for label,so,fr in [("完売まで1年",1,1.0),("完売まで2年",2,1.0),("完売まで3年",3,1.0),
                    ("70口止まり(2年)",2,0.7),("50口止まり(2年)",2,0.5)]:
    cf=build(so,fr,800); tot=sum(cf); r=irr(cf)
    cum=0; pay=None
    for i,c in enumerate(cf):
        cum+=c
        if pay is None and cum>=0 and i>0: pay=i
    c3=sum(cf[:4])
    print(f"  {label:14s}{tot:>11,.0f}{(tot+BUY)/BUY:>6.2f}x"
          f"{('  n/a' if r is None else f'{r*100:>8.1f}%')}{c3:>11,.0f}{(str(pay)+'年' if pay else '未回収'):>9s}")
print("  （単位:万円。維持費800万/年・修繕積立600万/年を前提）")
print()
print("  ■ 維持費の感応度（完売2年ケース）★資料に一切記載がない項目")
print(f"  {'年間維持費':>10s}{'20年累計CF':>12s}{'倍率':>8s}{'IRR':>9s}")
for m in [0,400,800,1200,1600,2000]:
    cf=build(2,1.0,m); r=irr(cf)
    print(f"  {m:>8,}万{sum(cf):>12,.0f}{(sum(cf)+BUY)/BUY:>7.2f}x{('  n/a' if r is None else f'{r*100:>8.1f}%'):>9s}")
print()
print("  ■ 読み方：IRRが30%前後と高く見えるのは『4億払って1〜2年で6億回収』の前倒し構造による。")
print("     20年通算の絶対リターンは1.40倍（単純年率2.0%）に過ぎず、維持費が年1,600万を超えると")
print("     20年累計CFはゼロになる。IRRではなく累計CFで判断すべき案件。")
