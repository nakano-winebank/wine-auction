# -*- coding: utf-8 -*-
TOTAL=192_616; NAK=65_000; VIS=94_500; BOS=2_000
def px(ev): return ev*1e8/TOTAL
V=20

print("="*92)
print("【レバー1】買う株数を絞る ─ 支配権に必要な最小限だけ取得（20億評価）")
print("="*92)
print(f"{'目的':<34}{'取得株数':>9}{'取得%':>7}{'金額':>8}{'中野持株':>9}{'V社残':>8}")
targets=[("中野50.1%超（過半・普通決議）", 0.501),("中野66.7%超（特別決議・単独）",0.667),
         ("V社を19.9%へ（持分法からも外す）",None),("V社を32.9%へ（拒否権も剥奪）",None),
         ("ビジョン+BOS 全部（＝ご提案①）",None)]
rows=[]
for name,tgt in targets:
    if tgt: need=int(TOTAL*tgt)-NAK+1
    elif "19.9" in name: need=VIS-int(TOTAL*0.199)
    elif "32.9" in name: need=VIS-int(TOTAL*0.329)
    else: need=VIS+BOS
    amt=need*px(V)/1e8; nk=(NAK+need)/TOTAL*100; vr=(VIS+BOS-need)/TOTAL*100
    print(f"{name:<34}{need:>8,}株{need/TOTAL*100:>6.1f}%{amt:>7.2f}億{nk:>8.1f}%{max(vr,0):>7.1f}%")

print()
print("="*92)
print("【レバー2】ビジョンにSPCへ再出資（ロールオーバー）してもらう")
print("="*92)
STOCK=(VIS+BOS)*px(V)/1e8; DBUY=7.90*0.70; FEES=0.45; WC=0.60
ROLL=NAK*px(V)/1e8
for vroll in [0.0,2.0,3.0,4.0]:
    uses=STOCK+DBUY+FEES+WC-vroll
    partner, tl, br = 6.0, 3.5, 1.5
    fund=max(uses-(partner+tl+br),0)
    eq=ROLL+partner+fund+vroll
    print(f"  V社再出資 {vroll:.1f}億 → Day1必要 {uses:5.2f}億 / ③ファンド {fund:5.2f}億 | "
          f"中野{ROLL/eq*100:4.1f}% ﾊﾟｰﾄﾅｰ{partner/eq*100:4.1f}% ﾌｧﾝﾄﾞ{fund/eq*100:4.1f}% V社{vroll/eq*100:4.1f}% "
          f"→ 中野陣営{(ROLL+fund)/eq*100:4.1f}%")

print()
print("="*92)
print("【レバー3】あどばる自身のBSから出せる金額（クロージング後にブリッジを返す原資）")
print("="*92)
items=[("差入保証金 2.20億の流動化(60-75%)",1.32,1.65),
       ("売掛金 1.72億のABL/ファクタリング(50-70%)",0.86,1.20),
       ("販売用不動産 1.13億の売却",0.90,1.13),
       ("建物附属設備のｾｰﾙ&ﾘｰｽﾊﾞｯｸ(簿価4.75億の30-50%)",1.43,2.38)]
lo=hi=0
for n,a,b in items:
    print(f"  {n:<46} {a:5.2f}〜{b:5.2f}億"); lo+=a; hi+=b
print(f"  {'合計':<46} {lo:5.2f}〜{hi:5.2f}億  ← ③の3-5億はここでも作れる")
