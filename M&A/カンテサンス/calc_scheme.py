PRICE=50.0; FEE=1.5; USES=PRICE+FEE
CASH=17.43; LOAN=5.00; KEEP=6.00; EBITDA=5.29; FCF=3.50; R=0.03; YRS=7
AVAIL=CASH+LOAN-KEEP                      # 合併後にブリッジ返済へ回せる額
SAKAKI=10.0
print("買収総額 %.2f億（株価%.1f＋費用%.1f）" % (USES,PRICE,FEE))
print("合併後の余剰現金（ブリッジ返済原資） = %.2f+%.2f-%.2f = %.2f億\n" % (CASH,LOAN,KEEP,AVAIL))

def case(nakano):
    borrow = USES - SAKAKI - nakano        # クロージング時の借入総額
    bridge = min(AVAIL, max(0.0, borrow-0.0))
    # ブリッジは「余剰現金で返せる分」まで。タームは残り
    bridge = min(AVAIL, borrow)
    term   = borrow - bridge
    debt   = term                          # 返済後に残る有利子負債
    tla, tlb = debt*0.7, debt*0.3
    amo = tla/YRS
    bal=debt; pay1=amo+bal*R; ints=0; pays=0
    for y in range(YRS):
        i=bal*R; ints+=i; pays+=amo+i; bal-=amo
    surplus = FCF*YRS - pays
    cashfin = CASH+LOAN-bridge             # 合併後に会社に残る現金
    return dict(nakano=nakano, borrow=borrow, bridge=bridge, debt=debt, tla=tla, tlb=tlb,
                pay1=pay1, dscr=FCF/pay1, lev=debt/EBITDA, surplus=surplus,
                net=debt-cashfin, cashfin=cashfin)

for n in (0.0, 5.07, 10.0, 21.5):
    c=case(n)
    ok = "OK" if (c['dscr']>=1.2 and c['surplus']>=c['tlb']) else ("△" if c['dscr']>=1.0 else "NG")
    print("中野拠出%5.2f億 → 借入%5.2f（ブリッジ%5.2f/ターム%5.2f） 定常債務%5.2f億 %4.1f倍 "
          "初年度返済%.2f DSCR %.2f 7年累積余剰%5.2f vs TLB%5.2f 現金%5.2f ネット%6.2f  %s"
          % (n, c['borrow'], c['bridge'], c['debt'], c['debt'], c['lev'], c['pay1'], c['dscr'],
             c['surplus'], c['tlb'], c['cashfin'], c['net'], ok))
print()
# 定常債務を20億に収める中野拠出額
need = USES - SAKAKI - (20.0 + AVAIL)
print("定常の有利子負債を20.0億に収めるために必要な中野拠出 = %.2f億" % need)
print("そのときのクロージング借入 = %.2f億（ターム20.0 ＋ ブリッジ%.2f）" % (USES-SAKAKI-need, AVAIL))
print("ブリッジ完済不要でネットキャッシュにする場合の中野拠出 = %.2f億" % (USES-SAKAKI-20.0))
