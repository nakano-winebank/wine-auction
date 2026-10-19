"""投資家優先回収（キャッシュ・スイープ）の試算。販売不振時に売却代金をまず投資家の元本＋年10%に充て、
WineBankの現物出資分は劣後させた場合の回収期間と必要売上を求める。"""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import model as M, structure as S
U = S.U; VAR = U["var_rate"]; RATIO = S.JIKA / S.BOOK      # 時価/簿価
STOR = M.STORAGE_PER_LOT_YEAR / U["lot_cost"]             # 簿価1円あたり年保管料
INS = M.INSURANCE_RATE; FIX = S.FIXED_BASE
def sweep(total, S_year, pref=0.10, appr=M.APPRECIATION, mgmt_on=True, months=120):
    inv_cap = total*S.INV_RATIO; wb_cap = total*S.WB_RATIO
    book = total*M.UTIL; cash = total*(1-M.UTIL); prin = inv_cap; acc = 0.0; paid = 0.0; t_done=None
    for m in range(1, months+1):
        price_ratio = RATIO*(1+appr)**(m/12)
        sale = min(S_year/12, book*price_ratio)
        book -= sale/price_ratio
        cost = sale*VAR + book*(STOR+INS)/12 + FIX/12 + (mgmt_on and (prin+wb_cap)*S.MGMT_RATE/12 or 0)
        cash += sale - cost
        acc += prin*pref/12
        pay = min(cash, acc); cash -= pay; acc -= pay; paid += pay
        pay = min(cash, prin); cash -= pay; prin -= pay; paid += pay
        if prin <= 1 and acc <= 1 and t_done is None:
            t_done = m; left_book = book; left_cash = cash; break
    if t_done is None: return dict(done=None, paid=paid, prin=prin)
    return dict(done=t_done, paid=paid, left_book=left_book, left_val=left_book*RATIO*(1+appr)**(t_done/12)*(1-VAR), left_cash=left_cash)
def solve_S(total, months, **kw):
    lo, hi = 1e7, 3e9
    for _ in range(60):
        mid=(lo+hi)/2; r=sweep(total, mid, **kw)
        if r["done"] is not None and r["done"] <= months: hi=mid
        else: lo=mid
    return hi
for total in (5e8, 10e8):
    r = sweep(total, 3e8)
    print(f"総額{total/1e8:.0f}億 売上3億/年: 投資家元本+10%回収完了 {r['done']}ヶ月 支払{r['paid']/1e6:.0f}百万 残在庫簿価{r.get('left_book',0)/1e6:.0f}百万 (売却手取{r.get('left_val',0)/1e6:.0f}百万) WB出資{total*0.6/1e6:.0f}")
    for mo in (12, 18, 24):
        s=solve_S(total, mo); r=sweep(total,s)
        print(f"   {mo}ヶ月で完済に必要な年間売上 {s/1e8:.2f}億（{mo}ヶ月累計 {s*mo/12/1e8:.2f}億） 支払{r['paid']/1e6:.0f}百万 WB残(手取){(r['left_val']+r['left_cash'])/1e6:.0f}百万")
    s=solve_S(total,24,mgmt_on=False); print(f"   [管理報酬劣後時] 24ヶ月完済の年売上 {s/1e8:.2f}億")
# 通常（プロラタ）で年3億しか売れない場合
for total in (5e8,10e8):
    lo,hi=12,120
    for _ in range(50):
        mid=(lo+hi)/2
        if S.split(total,mid)["sales"]>3e8: lo=mid
        else: hi=mid
    h=(lo+hi)/2
    print(f"総額{total/1e8:.0f}億: 年売上3億＝回転{h:.0f}ヶ月相当 定常{S.split(total,h)['inv_yld']:.1%} 5年{S.avg5(total,min(h,59)):.1%}")
