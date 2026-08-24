# -*- coding: utf-8 -*-
SH=192_616; BLOC=96_500; NAK=65_000; ND=11.17
VIS_LOAN=7.90; FEES=0.45; WC=0.60
def px(ev): return ev*1e8/SH

print("="*92)
print("評価額を下げるとMBOの資金と持分がどう動くか（債権70%取得＋DES、ノートなし）")
print("="*92)
print(f"{'評価':>5}{'1株':>9}{'50.1%代金':>10}{'Day1所要':>10}{'中野現物':>9}  |{'ﾊﾟｰﾄﾅｰ':>7}{'③ﾌｧﾝﾄﾞ':>8}{'中野':>7}{'ﾊﾟｰﾄﾅｰ%':>8}{'中野陣営':>8}")
print("-"*92)
for ev in [20,18,15,12,10]:
    for partner in [6.0,4.0]:
        stock=BLOC*px(ev)/1e8; dbuy=VIS_LOAN*0.70
        uses=stock+dbuy+FEES+WC
        tl,br=3.5,1.5
        fund=max(uses-(partner+tl+br),0)
        roll=NAK*px(ev)/1e8
        eqt=roll+partner+fund
        tag="" if partner==6.0 else "  ←ﾊﾟｰﾄﾅｰ縮小"
        print(f"{ev:>4}億{px(ev):>8,.0f}円{stock:>9.2f}億{uses:>9.2f}億{roll:>8.2f}億  |"
              f"{partner:>6.1f}億{fund:>7.2f}億{roll/eqt*100:>6.1f}%{partner/eqt*100:>7.1f}%{(roll+fund)/eqt*100:>7.1f}%{tag}")
    print()

print("="*92)
print("ビジョンの受取総額（株式代金 + 債権回収）")
print("="*92)
for ev in [20,18,15,12,10,5]:
    stock=BLOC*px(ev)/1e8
    print(f"  評価{ev:>2}億 → 株式{stock:5.2f}億 + 債権(額面100%){VIS_LOAN:5.2f}億 = {stock+VIS_LOAN:5.2f}億"
          f"  ／ 債権70%なら {stock+VIS_LOAN*0.7:5.2f}億")
print(f"\n  参考: ビジョン取得時評価13億 → 当時の持分49.06%相当 {13*94_500/SH:5.2f}億")
