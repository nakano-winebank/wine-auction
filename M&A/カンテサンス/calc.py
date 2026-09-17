# -*- coding: utf-8 -*-
# 単位: 百万円
NI   = 350.0   # 2026/12期 当期純利益(=FCF)
OP   = 528.0   # 営業利益
EBITDA = 529.0
CASH = 1743.0  # 現預金
LOAN = 500.0   # 役員貸付
LIAB = 141.0   # 負債計(未払法人税・消費税・仕入債務)
NA   = 2315.0  # 純資産

def f(x): return round(x/100.0, 2)  # 億円

print("=== EVブリッジ ===")
for name, nonop in [("ケース1 仲介前提(現預金+役員貸付)", CASH+LOAN),
                    ("ケース2 税金等を負債類似控除", CASH+LOAN-LIAB),
                    ("ケース3 役員貸付は非算入+運転資金200留保", CASH-200.0)]:
    ev = 5000.0 - nonop
    print(f"{name:42s} 非事業用{f(nonop):6.2f}億 EV{f(ev):6.2f}億 EV/EBITDA {ev/EBITDA:.2f}x  回収{ev/NI:.1f}年")

print()
print("=== 年買法 ===")
for n in (3,4,5,6):
    print(f" 純資産+営業利益{n}年 = {f(NA+OP*n):.2f}億    純資産+EBITDA{n}年 = {f(NA+EBITDA*n):.2f}億")
print(f" 50億に必要な年数(営業利益) = {(5000-NA)/OP:.2f}年 / (EBITDA) = {(5000-NA)/EBITDA:.2f}年")

print()
print("=== DCF (3年間は岸田氏在任=350、4年目以降シナリオ別、永続g=0) ===")
def dcf(r, tail):
    af3 = sum(1/(1+r)**t for t in (1,2,3))
    pv_exp = NI*af3
    pv_term = (tail/r)/(1+r)**3
    return pv_exp+pv_term
tails = {"A 3つ星維持 (350)":350.0, "B 2つ星降格 (200)":200.0, "C 星喪失 (100)":100.0}
rows={}
for lab, t in tails.items():
    rows[lab] = {r: dcf(r,t) for r in (0.08,0.10,0.12)}
    print(f"{lab:22s} r=8%:{f(rows[lab][0.08]):6.2f}億  r=10%:{f(rows[lab][0.10]):6.2f}億  r=12%:{f(rows[lab][0.12]):6.2f}億")

A=rows["A 3つ星維持 (350)"][0.10]; B=rows["B 2つ星降格 (200)"][0.10]; C=rows["C 星喪失 (100)"][0.10]
print()
print("=== 価格別 含意(r=10%) ===")
for p in (4500,5000,5500,5740,6000):
    ev = p - (CASH+LOAN)
    prob = (ev-B)/(A-B)
    print(f" 価格{f(p):5.2f}億 EV{f(ev):6.2f}億 {ev/EBITDA:4.2f}x  星維持に必要な確率 {prob*100:5.1f}%")
print()
w=(0.50,0.35,0.15)
exp = A*w[0]+B*w[1]+C*w[2]
print(f"期待値(維持50%/降格35%/喪失15%) = {f(exp):.2f}億 → 株式価値 {f(exp+CASH+LOAN):.2f}億")
w2=(1/3,1/3,1/3); exp2=A*w2[0]+B*w2[1]+C*w2[2]
print(f"期待値(均等1/3)               = {f(exp2):.2f}億 → 株式価値 {f(exp2+CASH+LOAN):.2f}億")

print()
print("=== ブレークイーブン(EV2757, r=10%) ===")
ev=5000-(CASH+LOAN)
req_fcf = ev*0.10
req_op = req_fcf/0.655 - 6.0
print(f" 必要な恒久FCF {req_fcf:.0f}百万 (現状{NI:.0f} 比 {req_fcf/NI-1:+.1%})")
print(f" 必要な恒久営業利益 {req_op:.0f}百万 (現状{OP:.0f} 比 {req_op/OP-1:+.1%}) 営業利益率 {req_op/1015:.1%}")

print()
print("=== IRR (EV27.57億で取得, 10年保有, Exit EV/EBITDA 5.0x, レバなし, 星維持前提) ===")
def npv(r):
    v=-ev
    for t in range(1,11): v += NI/(1+r)**t
    v += EBITDA*5.0/(1+r)**10
    return v
lo,hi=0.01,0.40
for _ in range(80):
    mid=(lo+hi)/2
    if npv(mid)>0: lo=mid
    else: hi=mid
print(f" IRR = {lo:.1%}")

print()
print("=== 対象会社の債務許容量 (元金均等・初年度, 金利3%, FCF350) ===")
for d in (1200,1500,1700,1800,2000):
    for yrs in (7,):
        pay = d/yrs + d*0.03
        print(f" 借入{f(d):5.2f}億 {yrs}年 初年度返済{f(pay):.2f}億 DSCR {NI/pay:.2f}  Debt/EBITDA {d/EBITDA:.1f}x")
