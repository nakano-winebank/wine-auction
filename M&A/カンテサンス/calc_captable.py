FEE=1.5; CASH=17.43; LOAN=5.00; KEEP=6.00; EBITDA=5.29; FCF=3.50
BRIDGE=CASH+LOAN-KEEP; TERM=20.0; SAKAKI=10.0; NAKANO=5.07
print("ブリッジ = %.2f億（価額によらず一定）\n" % BRIDGE)
for price, extra in ((50.0,0.0),(55.0,5.0)):
    uses=price+FEE; src=TERM+BRIDGE+SAKAKI+NAKANO+extra
    print("【%.1f億ケース】所要 %.2f ／ 調達 ターム%.1f＋ブリッジ%.2f＋榊原%.1f＋中野%.2f＋追加%.1f = %.2f  %s"
          % (price, uses, TERM, BRIDGE, SAKAKI, NAKANO, extra, src, "OK" if abs(uses-src)<0.01 else "NG"))
    ev=price-(CASH+LOAN)
    print("   EV %.2f億 = EV/EBITDA %.2f倍 ／ 合併後 有利子負債%.1f億・現預金%.1f億・DSCR1.35" % (ev, ev/EBITDA, TERM, KEEP))
print()
# 持分：榊原10億=33.3% → ポストマネー30.0億。同一バリュエーションで5億追加
POST1=SAKAKI/(1/3.0)
print("榊原ラウンドのポストマネー = %.1f億（中野%.1f億／榊原%.1f億）" % (POST1, POST1*2/3, SAKAKI))
POST2=POST1+5.0
for nm,v in (("中野氏",POST1*2/3),("榊原氏",SAKAKI),("追加投資家",5.0)):
    print("  %-6s 50億ケース %5.1f%% → 55億ケース %5.1f%%" %
          (nm, (v/POST1*100 if nm!="追加投資家" else 0.0), v/POST2*100))
print("  合計 55億ケース = %.1f%%" % ((POST1*2/3+SAKAKI+5.0)/POST2*100))
print("\n※ 榊原氏は33.3%→28.6%となり、特別決議の拒否権（1/3超）を失う")
print("※ 中野氏は66.7%→57.1%となり、2/3の単独可決権を失う（過半数は維持）")
