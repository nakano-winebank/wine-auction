FCF=3.50
def sched(tla, tlb, yrs, rate=0.03):
    bal=tla+tlb; amo=tla/yrs; rows=[]; cum=0; ti=0
    for y in range(1,yrs+1):
        i=bal*rate; pay=amo+i; cum+= FCF-pay; ti+=i
        rows.append((y,bal,amo,i,pay,FCF/pay,cum)); bal-=amo
    return rows, ti, bal
print("=== 返済方式別 初年度 (借入20億/7年/3%) ===")
print(" ① 元金均等 :", round(20/7+0.6,4), "DSCR", round(FCF/(20/7+0.6),3))
af=0.03/(1-1.03**-7); print(" ② 元利均等 :", round(20*af,4), "DSCR", round(FCF/(20*af),3))
for tla,tlb in ((14,6),(12,8)):
    p=tla/7+0.6; print(f" TLA{tla}+TLB{tlb}:", round(p,4), "DSCR", round(FCF/p,3))
print()
rows,ti,end=sched(14,6,7)
print("=== 推奨 TLA14+TLB6 / 7年 ===")
for r in rows: print(f" Y{r[0]} 期首{r[1]:5.2f} 元本{r[2]:4.2f} 利息{r[3]:4.2f} 計{r[4]:4.2f} DSCR{r[5]:5.2f} 累積余剰{r[6]:5.2f}")
print(f" 元本計14.00 利息計{ti:.2f} 返済計{14+ti:.2f} 7年後残高{end+14/7*0:.2f}(TLB6.00)")
print()
print("=== ストレス: 4年目以降 FCF2.00 ===")
cum=0; sh=0
for r in rows:
    f = 3.50 if r[0]<=3 else 2.00
    cum += f-r[4]
    if f-r[4]<0: sh += r[4]-f
    print(f" Y{r[0]} FCF{f:.2f} 返済{r[4]:.2f} DSCR{f/r[4]:.2f} 累積{cum:+.2f}")
print(f" 4-7年の累積不足 {sh:.2f}億 / 3年目末の累積余剰 {rows[2][6]:.2f}億")
print()
print("=== 平常時▲21% FCF2.76 ===")
print(" Y1 DSCR", round(2.76/rows[0][4],3))
print()
print("=== 5年の場合 (みずほ5年目線) ===")
for tla in (11,):
    p=tla/5+0.6; print(f" TLA{tla}+TLB{20-tla} 初年度{p:.2f} DSCR {FCF/p:.2f}")
    r5,ti5,_=sched(tla,20-tla,5); print(f"  5年累積余剰 {r5[-1][6]:.2f}億 / 5年後残高 TLB{20-tla}.00億")
