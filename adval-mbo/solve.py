# -*- coding: utf-8 -*-
TOTAL=192_616; BLOC=96_500; NAKANO=65_000
VISION_LOAN=7.90; BANK_LOAN=3.67
FEES=0.45; WC=0.60
def px(ev): return ev*1e8/TOTAL

def case(ev, debt_pct, note_ratio, partner, mizuho_tl, bridge):
    """debt_pct: ビジョン債権の取得価格(額面比) / note_ratio: 株式代金のうちセラーズノート比率"""
    stock  = BLOC*px(ev)/1e8
    note   = stock*note_ratio
    cash_s = stock-note
    dbuy   = VISION_LOAN*debt_pct
    uses   = cash_s+dbuy+FEES+WC
    src_ex = partner+mizuho_tl+bridge          # 中野ファンド以外
    fund   = max(uses-src_ex, 0.0)
    roll   = NAKANO*px(ev)/1e8                 # 中野の現物出資評価
    eq     = roll+partner+fund
    post_d = BANK_LOAN+mizuho_tl+note          # Post-MBO 総有利子負債(ブリッジは資産流動化で返済)
    return dict(stock=stock,note=note,cash_s=cash_s,dbuy=dbuy,uses=uses,fund=fund,roll=roll,
                nak=roll/eq*100, prt=partner/eq*100, fnd=fund/eq*100,
                nak_tot=(roll+fund)/eq*100, post_d=post_d,
                lev=post_d/2.23, lev_n=post_d/1.23,
                vision_cash=cash_s+dbuy, vision_tot=stock+dbuy)

print("="*100)
print("中野ファンド(③)で埋めるべき金額 ─ パートナー6.0億 / みずほTL3.5億 / ブリッジ1.5億 を所与とした場合")
print("="*100)
print(f"{'評価':>4} {'債権':>5} {'ノート':>5} | {'Day1必要':>8} {'③ファンド':>8} | {'中野':>6} {'ﾊﾟｰﾄﾅｰ':>6} {'ﾌｧﾝﾄﾞ':>6} {'中野計':>7} | {'Post負債':>8} {'実績':>5} {'正常化':>6} | {'V社受取':>8}")
print("-"*100)
for ev in [20,18,15]:
    for dp,nr in [(1.00,0.00),(1.00,0.35),(0.70,0.35),(0.70,0.00)]:
        r=case(ev,dp,nr,6.0,3.5,1.5)
        print(f"{ev:>3}億 {dp*100:>4.0f}% {nr*100:>4.0f}% | {r['uses']:>7.2f}億 {r['fund']:>7.2f}億 | "
              f"{r['nak']:>5.1f}% {r['prt']:>5.1f}% {r['fnd']:>5.1f}% {r['nak_tot']:>6.1f}% | "
              f"{r['post_d']:>7.2f}億 {r['lev']:>4.1f}x {r['lev_n']:>5.1f}x | {r['vision_tot']:>7.2f}億")

print()
print("="*100)
print("推奨3案の詳細")
print("="*100)
plans=[("案① 20億評価・満額 / 債権も額面",      case(20,1.00,0.00,6.0,3.5,1.5)),
       ("案② 20億評価・ノート35%+債権70%",     case(20,0.70,0.35,6.0,3.5,1.5)),
       ("案③ 18億評価・ノート35%+債権70%",     case(18,0.70,0.35,6.0,3.5,1.5))]
for name,r in plans:
    print(f"\n▼ {name}")
    print(f"   Uses  株式現金 {r['cash_s']:5.2f}億 + 債権譲受 {r['dbuy']:5.2f}億 + 費用0.45 + 運転0.60 = Day1 {r['uses']:5.2f}億")
    print(f"         (別枠) セラーズノート {r['note']:5.2f}億")
    print(f"   Src   ﾊﾟｰﾄﾅｰ6.00 + みずほTL3.50 + ﾌﾞﾘｯｼﾞ1.50 + ③中野ﾌｧﾝﾄﾞ {r['fund']:5.2f}億")
    print(f"   持分  中野{r['nak']:.1f}% / ﾊﾟｰﾄﾅｰ{r['prt']:.1f}% / ﾌｧﾝﾄﾞ{r['fnd']:.1f}%  → 中野陣営計 {r['nak_tot']:.1f}%")
    print(f"   Post  有利子負債 {r['post_d']:.2f}億 = 実績EBITDA比 {r['lev']:.1f}倍 / 正常化比 {r['lev_n']:.1f}倍")
    print(f"   V社   総額 {r['vision_tot']:.2f}億 (Day1現金 {r['vision_cash']:.2f}億)")
