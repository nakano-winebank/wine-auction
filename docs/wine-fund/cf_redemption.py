"""解約・優先回収のキャッシュフロー試算（ファーストクローズ・半期単位）。
例：1年目1億・2年目3億・3年目2.5億（投資家A 1億解約）・4年目2億（投資家B 1億解約）。
ケース1：優先回収が発動しない前提で解約の仕組みを見る。ケース2：契約どおり2029/3判定で優先回収が発動。"""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import structure as S, model as M
R0 = S.JIKA/S.BOOK; VAR = S.U["var_rate"]; TR = (S.BOOK-50.0)/S.BOOK
STOR = M.STORAGE_PER_LOT_YEAR/S.U["lot_cost"]; INS = M.INSURANCE_RATE; FIX = S.FIXED_BASE; APPR=0.06; HAIR=0.13
BUF = 0.25e8
def mv(lots,h): return sum(b*R0*(1+APPR)**((h-t)/2) for b,t in lots)
def sell(lots, P, h):
    need, cogs = P, 0.0
    while need > 1 and lots:
        b,t = lots[0]; price = b*R0*(1+APPR)**((h-t)/2)
        if price <= need: cogs += b; need -= price; lots.pop(0)
        else: f=need/price; cogs += b*f; lots[0][0]=b*(1-f); need=0
    return cogs
def scenario(sales, exits=(), trigger_h=None, final_sale_factor=1-VAR):
    init = {"WB":3e8,"A":1e8,"B":1e8}; cap=dict(init); out={k:0.0 for k in init}
    lots=[[4.75e8,0]]; cash=BUF; mk=4.75e8*TR; mgmt_tot=0; yp=0.0; rows=[]
    prin = {"A":1e8,"B":1e8,"WB":3e8}   # 優先回収用の未返還元本
    trig=False
    for h in range(1, 2*len(sales)+1):
        y=(h+1)//2; P=sales[y-1]/2
        mgmt=0.01*sum(cap.values()); mgmt_tot+=mgmt
        cost=mgmt+FIX/2+sum(l[0] for l in lots)*(STOR+INS)/2
        cogs=sell(lots,P,h); V=P*VAR; profit=P-V-cogs-cost
        cash += P-V-cost
        rec=dict(h=h,P=P,profit=profit,mgmt=mgmt)
        if trig:
            # 優先回収：再購入せず、半期ごとに 投資家元本→WB元本→残余（当初比率）
            avail=max(0.0,cash-BUF); rec["avail"]=avail
            for k in ("A","B"):
                pass
            inv_need=prin["A"]+prin["B"]
            pay=min(avail,inv_need)
            for k in ("A","B"):
                if inv_need>0:
                    x=pay*prin[k]/inv_need; prin[k]-=x; out[k]+=x
            avail-=pay; w=min(avail,prin["WB"]); prin["WB"]-=w; out["WB"]+=w; avail-=w
            for k in init: out[k]+=avail*init[k]/5e8
            cash=BUF; rec["paid"]=pay; rec["wb"]=w
            # 管理報酬の基準＝出資金の残高（返還後）
            for k in cap: cap[k]=prin[k]
        else:
            # 平時：原価相当を再購入（解約年度は支払見込み額まで留保）
            hold=0.0
            for (yy,who) in exits:
                if y==yy and who in cap:
                    share=cap[who]/sum(cap.values())
                    est=share*(mv(lots,h)*(1-HAIR)+cash)   # 想定支払額（現金を含めて評価）
                    hold=max(0.0, est-(cash-BUF))
            reinv=max(0.0,cogs-hold); cash-=reinv
            if reinv>0: lots.append([reinv,h]); mk+=reinv*TR
            yp+=profit
            if h%2==0:
                d=max(yp,0); tot=sum(cap.values())
                for k in cap: out[k]+=d*cap[k]/tot
                cash-=d; yp=min(yp,0); rec["dist"]=d
                for (yy,who) in exits:
                    if y==yy and who in cap:
                        share=cap[who]/sum(cap.values())
                        pay=share*(mv(lots,h)*(1-HAIR)+cash-BUF)
                        cash-=pay; out[who]+=pay; rec["redeem_"+who]=pay; prin[who]=0; del cap[who]
                        if cash<BUF:   # 支払資金の不足分は在庫を時価▲13%で追加売却して手当て
                            need=(BUF-cash)/(1-HAIR); got=0.0
                            while need>1 and lots:
                                b,t=lots[0]; price=b*R0*(1+APPR)**((h-t)/2)
                                if price<=need: need-=price; got+=price; lots.pop(0)
                                else: fr=need/price; lots[0][0]=b*(1-fr); got+=need; need=0
                            cash+=got*(1-HAIR); rec["extra"]=got
            if trigger_h and h==trigger_h: trig=True
        rec["inv"]=mv(lots,h); rec["cash"]=cash; rows.append(rec)
    return rows,out,mk,mgmt_tot,lots,cash,prin,init,cap
def final(lots,cash,prin,init,h,factor):
    """残在庫を売却して最終分配（投資家元本→WB元本→残余を当初比率）"""
    T=mv(lots,h)*factor+cash; res={k:0.0 for k in init}
    for k in ("A","B"):
        x=min(T,prin[k]); res[k]+=x; T-=x
    w=min(T,prin["WB"]); res["WB"]+=w; T-=w
    for k in init: res[k]+=T*init[k]/5e8
    return res

f=lambda v:f"{v/1e8:.2f}"
rows,out,mk,mg,lots,cash,prin,init,cap=scenario([1e8,3e8,2.5e8,2e8],exits=[(3,"A"),(4,"B")])
print("ケース1")
for r in rows: print(r["h"], "売上",f(r["P"]),"利益",f(r["profit"]),"分配",f(r.get("dist",0)),"解約払",f(r.get("redeem_A",r.get("redeem_B",0))),"追加売却(時価)",f(r.get("extra",0)),"在庫時価",f(r["inv"]),"現金",f(r["cash"]))
print({k:f(v) for k,v in out.items()}, "値入れ",f(mk),"管理",f(mg),"残在庫",f(mv(lots,8)),"現金",f(cash))
for fac,lab in ((1-VAR,"通常売却"),(0.87*(1-VAR),"▲13%")):
    print(lab,"WB最終", f(out["WB"]+mv(lots,8)*fac+cash))
