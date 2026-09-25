# -*- coding: utf-8 -*-
OP=528.0; DEP=1.0; TAX=0.34; CAPEX=30.0
TLA=1400.0; TLB=600.0; RATE=0.03; YRS=7; AMO=TLA/YRS
START=100.0          # クロージング時に対象会社へ留保する現金 1.0億円
UNPAID=114.0         # 2026/12期の未払法人税（2027年2月納付）

print("年度  営業利益 減価償却 支払利息 法人税等 営業CF 設備投資  FCF  元本返済 バルーン 現金増減 期末現金")
cash=START
for y in range(1,YRS+1):
    bal=(TLA-AMO*(y-1))+TLB
    i=bal*RATE
    tax=max(0.0,(OP-i))*TAX
    paid = tax + (UNPAID if y==1 else 0.0)   # 初年度は前期未払分も納付
    ocf = OP+DEP-i-paid
    fcf = ocf-CAPEX
    bull = TLB if y==YRS else 0.0
    d = fcf-AMO-bull
    cash += d
    print(f"{2026+y}  {OP/100:7.2f} {DEP/100:7.2f} {i/100:7.2f} {paid/100:7.2f}"
          f" {ocf/100:6.2f} {CAPEX/100:7.2f} {fcf/100:6.2f} {AMO/100:7.2f} {bull/100:7.2f}"
          f" {d/100:8.2f} {cash/100:8.2f}")
print()
print(f"7年間の元本返済合計 {(TLA+TLB)/100:.2f}億円 / 支払利息合計 "
      f"{sum(((TLA-AMO*(y-1))+TLB)*RATE for y in range(1,8))/100:.2f}億円")
print(f"※ 2027年のみ2026/12期の未払法人税 {UNPAID/100:.2f}億円の納付を含む")
print()
print("【留保6.0億円とした場合の期末現金】")
cash=600.0
for y in range(1,YRS+1):
    bal=(TLA-AMO*(y-1))+TLB; i=bal*RATE
    tax=max(0.0,(OP-i))*TAX; paid=tax+(UNPAID if y==1 else 0)
    d=OP+DEP-i-paid-CAPEX-AMO-(TLB if y==YRS else 0); cash+=d
    print(f"  {2026+y} {cash/100:6.2f}億円")
