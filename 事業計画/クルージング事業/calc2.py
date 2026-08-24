# -*- coding: utf-8 -*-
def npv(r,cfs): return sum(c/((1+r)**i) for i,c in enumerate(cfs))
def irr(cfs):
    lo=None
    r=-0.95
    prev=npv(r,cfs)
    while r<20:
        r2=r+0.005; cur=npv(r2,cfs)
        if prev==0: return r
        if prev*cur<0: lo,hi=r,r2; break
        prev=cur; r=r2
    if lo is None: return None
    for _ in range(200):
        mid=(lo+hi)/2
        if npv(lo,cfs)*npv(mid,cfs)<=0: hi=mid
        else: lo=mid
    return (lo+hi)/2

TAX=0.34
print("="*72); print("【2】投資リターン Case B : 会員権発行TK（TK②）への出資  ※修正版"); print("="*72)
BUY=40000; NET_IN=60000; MAINT=800; REPAIR_IN=600; N_Y=20
rows=[]
for label,sellout,frac in [("完売まで1年",1,1.0),("完売まで2年",2,1.0),("完売まで3年",3,1.0),
                           ("70口止まり",2,0.7),("50口止まり",2,0.5)]:
    cf=[0.0]*(N_Y+1); cf[0]-=BUY
    for t in range(1,sellout+1): cf[t]+=NET_IN*frac/sellout
    for t in range(1,N_Y+1): cf[t]+=REPAIR_IN-MAINT
    tot=sum(cf); r=irr(cf)
    rows.append((label,tot,(tot+BUY)/BUY,r))
    print(f"  ◆ {label:12s} 20年累計CF={tot:>8,.0f}万  出資倍率={(tot+BUY)/BUY:>5.2f}x  "
          f"IRR={'算定不能(全期間赤字)' if r is None else f'{r*100:>5.1f}%'}")
print(f"\n  ※ 前提: 船4億取得 / 会員権ネット6億 / 年間維持費{MAINT}万(★資料に記載なし・推計) /")
print(f"          一般売り修繕積立 2万×年300回={REPAIR_IN}万")
print(f"  ※ 維持費の感応度（完売2年ケース）:")
for m in [0,400,800,1200,1600]:
    cf=[0.0]*(N_Y+1); cf[0]-=BUY
    for t in [1,2]: cf[t]+=NET_IN/2
    for t in range(1,N_Y+1): cf[t]+=REPAIR_IN-m
    r=irr(cf); print(f"      維持費{m:>5,}万/年 → 20年累計CF {sum(cf):>8,.0f}万, IRR {r*100:>5.1f}%")

print()
print("="*72); print("【3】営業リターン WineBank F&B  ※1運航あたり損益分岐を明示"); print("="*72)
COST=0.33; LABOR=8.0; LOGI=1.5; COORD=0.10; FIXED=2100; INIT=1500
be_s = (LABOR+LOGI)/(1-COST+COORD)
print(f"  1運航あたり貢献利益 = 売上×(1−原価率{COST:.0%}+フィー{COORD:.0%}) − 人件費{LABOR}万 − 物流{LOGI}万")
print(f"                     = 売上×{1-COST+COORD:.2f} − {LABOR+LOGI}万")
print(f"  → 1運航あたり損益分岐売上 = {be_s:.2f}万円  (10名なら客単価 {be_s*10000/10:,.0f}円 / 8名なら {be_s*10000/8:,.0f}円)")
print()
print("  【損益分岐マトリクス】年間営業利益（万円）  縦=F&B実施運航回数 / 横=1運航あたりF&B売上")
cols=[10,15,20,25,30,35,40,45]
print("        " + "".join(f"{c:>3}万円" for c in cols))
for n in [150,250,350,480,600,750]:
    line=f"  {n:>4}回 "
    for c in cols:
        op = n*(c*(1-COST+COORD)-LABOR-LOGI)-FIXED
        line += f"{op:>6,.0f}"
    print(line)
print("  ※ 太字境界＝ゼロ。1運航売上30万円(10名×3万円)なら年154回で黒字化。")

print()
scen=[("保守",360,0.70, 8,2.0),("基本",600,0.80,10,3.0),("強気",900,0.90,12,4.0)]
print("  【シナリオ別 P/L】")
print(f"  {'':6s}{'F&B運航':>8s}{'F&B売上':>10s}{'変動費':>10s}{'限界利益':>10s}{'ﾌｨｰ10%':>9s}{'固定費':>8s}{'営業利益':>10s}{'税後':>9s}{'ROI':>8s}")
for name,N,rf,P,U in scen:
    n=N*rf; s=n*P*U; var=s*COST+n*LABOR+n*LOGI; mgn=s-var; co=s*COORD; op=mgn+co-FIXED
    print(f"  {name:6s}{n:>8,.0f}{s:>10,.0f}{var:>10,.0f}{mgn:>10,.0f}{co:>9,.0f}{FIXED:>8,.0f}{op:>10,.0f}"
          f"{op*(1-TAX):>9,.0f}{op/INIT*100:>7,.0f}%")
print(f"  （単位: 回 / 万円。ROI＝営業利益÷WineBank初期投資{INIT:,}万円）")
print()
print("  ★保守ケースが赤字になる理由: 招聘シェフ+サービスの人件費8万円/運航が運航回数に比例して")
print("    かかる一方、8名×2万円=16万円/運航では貢献利益が2.8万円/運航しか出ず固定費2,100万を賄えない。")
print(f"    → 保守単価で黒字化するには年{FIXED/(16*(1-COST+COORD)-LABOR-LOGI):,.0f}回必要（供給上限1,500枠に対し非現実的）。")
print("    → 低単価帯に落ちる場合は『招聘シェフ体制』ではなく『常駐1名+仕込み集中』へ体制変更が必須。")
