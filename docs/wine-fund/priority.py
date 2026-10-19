"""投資家元本の優先回収（キャッシュ・スイープ）の試算。販売不振時に売却代金をまず投資家の元本に充て、
WineBankの現物出資分は劣後させた場合の回収期間と必要売上、最終分配の配分を求める。利回りの優先はない。"""
import sys, os, json; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import model as M, structure as S
U = S.U; VAR = U["var_rate"]; RATIO = S.JIKA / S.BOOK      # 時価/簿価
STOR = M.STORAGE_PER_LOT_YEAR / U["lot_cost"]             # 簿価1円あたり年保管料
INS = M.INSURANCE_RATE; FIX = S.FIXED_BASE
PAY_EVERY = 6     # 優先回収の分配は半期ごと（報告対象期間の末日）


def sweep(total, S_year, pref=0.0, appr=M.APPRECIATION, mgmt_on=True, months=120, pay_every=PAY_EVERY):
    inv_cap = total*S.INV_RATIO; wb_cap = total*S.WB_RATIO
    book = total*M.UTIL; cash = total*(1-M.UTIL); prin = inv_cap; acc = 0.0; paid = 0.0; t_done=None
    for m in range(1, months+1):
        price_ratio = RATIO*(1+appr)**(m/12)
        sale = min(S_year/12, book*price_ratio)
        book -= sale/price_ratio
        cost = sale*VAR + book*(STOR+INS)/12 + FIX/12 + (mgmt_on and (prin+wb_cap)*S.MGMT_RATE/12 or 0)
        cash += sale - cost
        acc += prin*pref/12
        if m % pay_every: continue
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

TRIGGER = 0.6     # 優先回収事由：直近12ヶ月の売上 ＜ 総額 × 0.6（1st 3億円／2nd 6億円）


def waterfall(total, proceeds):
    """最終の手取り proceeds を、投資家元本 → WineBank元本 → 残余を当初出資比率 の順で配分する。"""
    inv_cap, wb_cap = total * S.INV_RATIO, total * S.WB_RATIO
    inv = min(inv_cap, proceeds); wb = min(wb_cap, max(0.0, proceeds - inv_cap))
    rest = max(0.0, proceeds - total)
    return dict(proceeds=proceeds, inv=inv + rest * S.INV_RATIO, wb=wb + rest * S.WB_RATIO)


def export():
    out = dict(trigger=TRIGGER, pref=0.0, closes={})
    for key, total in (("first", 5e8), ("second", 10e8)):
        r3 = sweep(total, 3e8)
        out["closes"][key] = dict(
            total=total, inv=total * S.INV_RATIO, wb=total * S.WB_RATIO, trigger_sales=total * TRIGGER,
            s3=dict(months=r3["done"], paid=r3["paid"], left_val=r3["left_val"] + r3["left_cash"]),
            need={str(m): solve_S(total, m) for m in (12, 18, 24)},
            wf={str(k): waterfall(total, total * k) for k in (0.6, 1.0, 1.1)},
        )
    with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "priority.json"), "w", encoding="utf-8") as fp:
        json.dump(out, fp, ensure_ascii=False, indent=1)
    return out


if __name__ == "__main__":
    o = export()
    for k, c in o["closes"].items():
        print(f"{k}: 売上3億/年 → 投資家元本の回収 {c['s3']['months']}ヶ月（{c['s3']['paid']/1e6:.0f}百万）")
        for m, v in c["need"].items():
            print(f"   {m}ヶ月で元本回収に必要な年間売上 {v/1e8:.2f}億")
        for r, w in c["wf"].items():
            print(f"   手取り 総額×{r}: 投資家 {w['inv']/1e8:.2f}億 ／ WineBank {w['wb']/1e8:.2f}億")
