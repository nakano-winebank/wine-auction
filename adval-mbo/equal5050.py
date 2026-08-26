# -*- coding: utf-8 -*-
SH=192_616; NAK=65_000; SO=9_000
OTHERS={"株式会社ビジョン":94_500,"株式会社BOS":2_000,"株式会社エアトリ":16_116,
        "KUMAアセットマネジメント":6_300,"株式会社フィル・カンパニー":3_000,
        "株式会社ベクトル":3_000,"株式会社アンビション・ベンチャーズ":2_700}
OUT=sum(OTHERS.values())
VIS_LOAN=7.90; FEES=0.45
OP=2.00; DA=0.65; EB=OP+DA; ND=11.17

def run(PRE, repay, label, so=False):
    sh = SH+SO if so else SH
    nak = NAK+SO if so else NAK
    pre = PRE + (SO*1000/1e8 if so else 0)
    px = pre*1e8/sh
    buyout = OUT*px/1e8
    Z = buyout + repay + FEES                    # 必要な増資総額
    n_tot = round(Z*1e8/px)
    n_f = (n_tot-nak)//2                          # 中野ファンドの新株数
    n_p = n_tot-n_f                               # パートナーの新株数
    X, Y = n_f*px/1e8, n_p*px/1e8
    post = sh+n_tot
    vote = post-OUT
    cam, par = nak+n_f, n_p
    # 分配可能額（無償減資＋欠損填補後）
    dist = (1.68 + (0.10+Z/2-0.01) + (4.74+Z/2)) - 10.62
    val = pre+Z-buyout                            # 自社株買い後の株主価値
    print(f"\n{'='*98}\n■ {label}\n{'='*98}")
    print(f"  1株価格 {px:,.0f}円 ／ 中野様の既存持分 {nak:,}株 = {nak*px/1e8:.2f}億")
    print(f"  買取対象 {OUT:,}株（中野様以外の全株主）= {buyout:.2f}億")
    print(f"  ビジョン借入返済 {repay:.2f}億 ／ 諸費用 {FEES:.2f}億")
    print(f"  ―――――――――――――――――――――――――――――――――")
    print(f"  ★必要な増資総額 Z = {Z:.2f}億")
    print(f"    中野ファンド  {X:6.2f}億（{n_f:>7,}株）")
    print(f"    パートナー   {Y:6.2f}億（{n_p:>7,}株）")
    print(f"    差額       {Y-X:6.2f}億  ← 中野様の既存持分{nak*px/1e8:.2f}億と一致")
    print(f"  分配可能額（無償減資＋欠損填補後）{dist:.2f}億 vs 自社株買い{buyout:.2f}億 → "
          f"{'○ 実行可（余裕'+format(dist-buyout,'.2f')+'億）' if dist>=buyout else '× 不足'}")
    print(f"  発行済 {post:,}株（うち自己株式 {OUT:,}株）／議決権のある株式 {vote:,}株")
    print(f"    中野陣営 {cam:>7,}株 = {cam/vote*100:6.3f}%   パートナー {par:>7,}株 = {par/vote*100:6.3f}%")
    print(f"  自社株買い後の株主価値 {val:.2f}億 → 各50% = {val/2:.2f}億ずつ")
    return dict(px=px,buyout=buyout,Z=Z,X=X,Y=Y,n_f=n_f,n_p=n_p,post=post,vote=vote,
                cam=cam,par=par,dist=dist,val=val,nak=nak,pre=pre,repay=repay)

print("="*98)
print("【前提】中野様以外の既存株主が全員 20億評価で売却 → 中野様とパートナーで50:50")
print("="*98)
print(f"  買取対象株主 {len(OTHERS)}社・{OUT:,}株（発行済192,616株の{OUT/SH*100:.2f}%）")
print(f"  中野様は既存65,000株（33.75%）を保有したまま、中野ファンドが増資に参加")

a=run(20.0,5.00,"ケースA　Pre20億・ビジョン借入は5億返済＋残2.90億はみずほリファイ")
b=run(20.0,VIS_LOAN,"ケースB　Pre20億・ビジョン借入7.90億を全額返済（完全なクリーンブレイク）")

print("\n"+"="*98)
print("【逆算の構造】なぜパートナーは6.75億多く出すのか")
print("="*98)
px=20.0*1e8/SH
print(f"  50:50の条件 → 中野様の既存{NAK:,}株 ＋ 中野ファンドの新株 ＝ パートナーの新株")
print(f"  よって パートナー出資 － 中野ファンド出資 ＝ {NAK:,}株 × {px:,.0f}円 = {NAK*px/1e8:.2f}億")
print(f"  中野様は既に{NAK*px/1e8:.2f}億分を『現物で持ち込んでいる』ため、その分だけ現金拠出が少なくて済みます")
print(f"\n  中野ファンドの必要額 = (買取対象{OUT:,}株 － 中野様{NAK:,}株)×株価 ÷2 ＋ その他資金需要÷2")
print(f"                    = ({OUT-NAK:,}株 × {px:,.0f}円)÷2 ＋ (5.00+0.45)÷2")
print(f"                    = {(OUT-NAK)*px/1e8/2:.2f}億 ＋ {5.45/2:.2f}億 = {(OUT-NAK)*px/1e8/2+5.45/2:.2f}億")

print("\n"+"="*98)
print("【Pre評価額別】中野ファンドが用意すべき金額")
print("="*98)
print(f"  {'Pre':>5}{'1株':>9}{'買取総額':>10}{'増資総額':>10}{'中野ﾌｧﾝﾄﾞ':>11}{'ﾊﾟｰﾄﾅｰ':>10}{'分配可能額':>11}{'判定':>8}")
print("  "+"-"*76)
for P in [15,18,20,22,25]:
    q=P*1e8/SH; bo=OUT*q/1e8; Z=bo+5.00+FEES
    nt=round(Z*1e8/q); nf=(nt-NAK)//2; npp=nt-nf
    d=(1.68+(0.10+Z/2-0.01)+(4.74+Z/2))-10.62
    print(f"  {P:>4}億{q:>8,.0f}円{bo:>9.2f}億{Z:>9.2f}億{nf*q/1e8:>10.2f}億{npp*q/1e8:>9.2f}億{d:>10.2f}億"
          f"{'  ○' if d>=bo else '  ×':>8}")

print("\n"+"="*98)
print("【各株主の受取額】Pre20億・1株10,383円")
print("="*98)
tot=0
for n,s in OTHERS.items():
    amt=s*px/1e8; tot+=amt
    extra="  ＋借入返済 7.90億" if n=="株式会社ビジョン" else ""
    print(f"  {n:<28}{s:>8,}株  {amt:>6.2f}億{extra}")
print(f"  {'合計':<28}{OUT:>8,}株  {tot:>6.2f}億")
print(f"  ビジョングループ合計（株式9.81＋BOS0.21＋借入7.90）= {94_500*px/1e8+2_000*px/1e8+VIS_LOAN:.2f}億")

print("\n"+"="*98)
print("【株主名簿】ケースA・取引完了後")
print("="*98)
r=a
rows=[("中野 邦人","普通株式",NAK,"○","本人"),
      ("中野ファンド（仮称）","普通株式",r['n_f'],"○",f"増資 {r['X']:.2f}億"),
      ("パートナー","普通株式" ,r['n_p'],"○",f"増資 {r['Y']:.2f}億"),
      ("株式会社あどばる（自己株式）","普通株式",OUT,"×",f"自己株式取得 {r['buyout']:.2f}億")]
print(f"  {'株主名':<30}{'種類':<12}{'株数':>10}{'発行済比':>10}{'議決権':>8}{'議決権比':>10}")
print("  "+"-"*82)
for n,k,s,v,note in rows:
    vr=f"{s/r['vote']*100:9.3f}%" if v!="×" else "        ―"
    print(f"  {n:<30}{k:<12}{s:>10,}{s/r['post']*100:>9.2f}%{v:>7}{vr}")
print("  "+"-"*82)
print(f"  {'発行済株式総数':<30}{'':<12}{r['post']:>10,}{100.0:>9.2f}%")
print(f"  {'議決権のある株式':<30}{'':<12}{r['vote']:>10,}")

import csv
for tag,r in [("A",a),("B",b)]:
    fn=f'株主名簿_50-50_ケース{tag}.csv'
    rows=[("中野 邦人","普通株式",NAK,"○","本人（既存保有）","―"),
          ("中野ファンド（仮称）","普通株式",r['n_f'],"○","第三者割当増資",f"{r['X']:.2f}億円"),
          ("パートナー（ヒューリック／東京建物等）","普通株式",r['n_p'],"○","第三者割当増資",f"{r['Y']:.2f}億円"),
          ("株式会社あどばる（自己株式）","普通株式",OUT,"×","自己株式取得",f"{r['buyout']:.2f}億円")]
    with open(fn,'w',encoding='utf-8-sig',newline='') as f:
        w=csv.writer(f)
        w.writerow([f"株式会社あどばる 株主名簿（想定）─ 50:50イコールパートナー ケース{tag}"])
        w.writerow([f"前提：Pre {20.0:.0f}億／1株 {r['px']:,.0f}円／増資総額 {r['Z']:.2f}億／"
                    f"自己株式取得 {r['buyout']:.2f}億（{OUT:,}株）／ビジョン借入返済 {r['repay']:.2f}億"])
        w.writerow([])
        w.writerow(["No","株主名","株式の種類","株数","発行済比率","議決権の有無","議決権比率","取得事由","払込額／取得価額"])
        for i,(n,k,s,v,ev,amt) in enumerate(rows,1):
            vr=f"{s/r['vote']*100:.3f}%" if v!="×" else "―"
            w.writerow([i,n,k,f"{s:,}",f"{s/r['post']*100:.2f}%",v,vr,ev,amt])
        w.writerow([])
        w.writerow(["","発行済株式総数","",f"{r['post']:,}","100.00%"])
        w.writerow(["","うち自己株式","",f"{OUT:,}",f"{OUT/r['post']*100:.2f}%"])
        w.writerow(["","議決権のある株式","",f"{r['vote']:,}"])
        w.writerow(["","中野陣営（中野＋中野ファンド）","",f"{r['cam']:,}","",f"{r['cam']/r['vote']*100:.3f}%"])
        w.writerow(["","パートナー","",f"{r['par']:,}","",f"{r['par']/r['vote']*100:.3f}%"])
        w.writerow([])
        w.writerow(["【消滅した株主】20億円評価で全株を会社に売却"])
        w.writerow(["","株主名","株数","受取額"])
        for n,s in OTHERS.items():
            w.writerow(["",n,f"{s:,}",f"{s*r['px']/1e8:.2f}億円"])
        w.writerow(["","合計",f"{OUT:,}",f"{r['buyout']:.2f}億円"])
        w.writerow([])
        w.writerow(["注1","自己株式には議決権がありません（会社法308条2項）"])
        w.writerow(["注2","本スキームは設計上ちょうど50:50となるため、議決権制限付種類株は不要。全て普通株式"])
        w.writerow(["注3","自己株式取得には無償減資＋欠損填補による分配可能額の創出が前提（会社法447・448・452・461条）"])
        w.writerow(["注4","中野邦人氏のストックオプション9,000株は未行使前提"])
        w.writerow(["注5","議決権50:50のためデッドロック解消条項（第三者仲裁・買取請求権・Shotgun条項等）を株主間契約に必ず定めること"])
        w.writerow(["注6","中野ファンドはGP（中野氏の資産管理会社）に議決権を集約すること。LPが独立行動すると支配が崩れます"])
    print(f"  → {fn} を出力")
