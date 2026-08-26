# -*- coding: utf-8 -*-
SH=192_616; NAK0=65_000; SO=9_000; E_SO=1000
ALL_OUT=127_616                 # 中野以外 全株
VIS_BOS=96_500                  # ビジョン+BOS のみ
CAP,CAPR,OCS,RET=0.10,4.74,1.68,-10.62   # 億円
KEEP=0.01
BASE_CAP=CAP+CAPR+OCS-KEEP      # 減資でその他資本剰余金に振替えられる既存資本 = 6.51億

def solve(pre, buy_shares, other, use_so, ret=RET, label=""):
    """other = 増資のうち自己株式取得以外に充てる額（億）。ret = 繰越利益剰余金（億・負）"""
    so_in = SO*E_SO/1e8 if use_so else 0.0
    sh    = SH+SO if use_so else SH
    nak   = NAK0+SO if use_so else NAK0
    px    = (pre+so_in)*1e8/sh
    buy   = buy_shares*px/1e8
    Z     = buy+other
    # 50:50 条件から中野ファンドの株数
    nf = (buy_shares-nak)/2 + other*1e8/(2*px)
    npp= nf+nak
    X  = nf*px/1e8; Y=npp*px/1e8
    # 分配可能額（増資→無償減資→欠損填補 の後）
    dist = BASE_CAP + Z + so_in + ret
    post = sh + round(nf) + round(npp)
    vote = post - buy_shares
    cam  = nak + round(nf)
    return dict(label=label,px=px,buy=buy,Z=Z,X=X,Y=Y,nf=round(nf),npp=round(npp),
                dist=dist,ok=dist>=buy, post=post,vote=vote,cam=cam,
                minor=(ALL_OUT-buy_shares), other=other)

def show(r):
    m=" ○" if r['ok'] else " ×不足"
    print(f"  {r['label']:<46}中野ﾌｧﾝﾄﾞ {r['X']:5.2f}億  ﾊﾟｰﾄﾅｰ {r['Y']:6.2f}億  増資計 {r['Z']:6.2f}億  "
          f"分配可能額 {r['dist']:6.2f}億 vs 買取 {r['buy']:5.2f}億{m}")

print("="*118)
print("【基本式】中野ファンド ＝（買取株数 － 中野様の株数）÷2 × 株価 ＋（増資のうち自己株式取得以外に使う額）÷2")
print("="*118)
print("  第1項＝中野様が持っていない分の半分を買うコスト（不可避）／第2項＝削れる部分")

print("\n"+"="*118)
print("【現行案】Pre20億・全員買取・借入返済も手元資金もすべて増資で賄う")
print("="*118)
base=solve(20.0, ALL_OUT, 7.90+0.45+2.00, False, label="現行案（第08章の推奨）")
show(base)

print("\n"+"="*118)
print("【レバー1】ビジョン借入返済・手元資金・諸費用を「増資」ではなく「デット」で賄う")
print("="*118)
print("  みずほのリファイナンスやパートナーの劣後ローンに寄せる。ただし分配可能額を満たす最低限は増資で入れる必要あり")
for o in [10.35,6.00,4.11,2.00]:
    show(solve(20.0, ALL_OUT, o, False, label=f"増資の非買取部分 {o:5.2f}億"))
print("  ★分配可能額の下限：既存資本6.51億に対し繰越欠損金10.62億 → 4.11億の穴。増資の非買取部分は4.11億以上が必要")

print("\n"+"="*118)
print("【レバー2】ストックオプション9,000株を行使して中野様の株数を74,000株にする")
print("="*118)
show(solve(20.0, ALL_OUT, 4.11, False, label="SO未行使（65,000株）"))
show(solve(20.0, ALL_OUT, 4.11, True,  label="SO行使（74,000株）"))

print("\n"+"="*118)
print("【レバー3】買取対象をビジョン+BOSの96,500株に絞る（少数株主31,116株は残す）")
print("="*118)
show(solve(20.0, VIS_BOS, 4.11, True, label="ビジョン+BOSのみ買取・SO行使"))
print(f"  ※少数株主31,116株が残りますが、中野陣営とパートナーの50:50は保てます")

print("\n"+"="*118)
print("【レバー4】クロージングを後ろ倒しし、利益で繰越欠損金を圧縮する")
print("="*118)
print("  正常化営業利益2億なら税引後およそ1.8億/年。繰越欠損金があるため当面ほぼ無税")
for yrs,r in [(0,-10.62),(1,-8.82),(2,-7.02),(3,-5.22)]:
    gap=max(BASE_CAP*-1 - r,0) if False else max(-(BASE_CAP+r),0)
    print(f"    {yrs}年後 繰越利益剰余金 {r:6.2f}億 → 分配可能額の穴 {gap:5.2f}億（増資の非買取部分の下限）")

print("\n"+"="*118)
print("【組み合わせ】4つのレバーを重ねる")
print("="*118)
combos=[
 ("① 現行案", 20.0, ALL_OUT, 10.35, False, -10.62),
 ("② ＋非買取部分をデットへ", 20.0, ALL_OUT, 4.11, False, -10.62),
 ("③ ＋SO行使", 20.0, ALL_OUT, 4.11, True, -10.62),
 ("④ ＋買取をビジョン+BOSに絞る", 20.0, VIS_BOS, 4.11, True, -10.62),
 ("⑤ ＋2年後にクロージング", 20.0, VIS_BOS, 0.51, True, -7.02),
 ("⑥ ＋Pre15億に下げる", 15.0, VIS_BOS, 0.51, True, -7.02),
]
for lab,pre,bs,o,so,ret in combos:
    r=solve(pre,bs,o,so,ret,label=lab)
    print(f"  {lab:<32}Pre{pre:4.0f}億  買取{bs:>7,}株  中野ﾌｧﾝﾄﾞ {r['X']:5.2f}億  ﾊﾟｰﾄﾅｰ {r['Y']:6.2f}億  "
          f"増資計 {r['Z']:6.2f}億  {'○' if r['ok'] else '×'}")

print("\n"+"="*118)
print("【3億以内を満たす案の詳細】④ ビジョン+BOSのみ買取・SO行使・非買取部分4.11億")
print("="*118)
r=solve(20.0, VIS_BOS, 4.11, True, label="")
print(f"  1株 {r['px']:,.0f}円 ／ 増資総額 {r['Z']:.2f}億（買取原資{r['buy']:.2f}億＋分配可能額確保{r['other']:.2f}億）")
print(f"  中野ファンド {r['X']:.2f}億（{r['nf']:,}株）／ パートナー {r['Y']:.2f}億（{r['npp']:,}株）")
print(f"  発行済 {r['post']:,}株（うち自己株式 {VIS_BOS:,}株）／議決権 {r['vote']:,}株")
mn=ALL_OUT-VIS_BOS
print(f"  {'中野 邦人':<22}{74_000:>8,}株  {74_000/r['vote']*100:6.2f}%")
print(f"  {'中野ファンド':<21}{r['nf']:>8,}株  {r['nf']/r['vote']*100:6.2f}%")
print(f"  {'　中野陣営 小計':<19}{r['cam']:>8,}株  {r['cam']/r['vote']*100:6.2f}%")
print(f"  {'パートナー':<22}{r['npp']:>8,}株  {r['npp']/r['vote']*100:6.2f}%")
print(f"  {'既存少数株主':<21}{mn:>8,}株  {mn/r['vote']*100:6.2f}%")
print(f"  ※ビジョン借入7.90億・手元資金・諸費用はみずほのリファイとパートナーの劣後ローンで手当てします")

print("\n"+"="*118)
print("【本命】全員買取のまま3億以内にする ─ SO行使＋非買取部分をデット＋2年後クロージング")
print("="*118)
for lab,ret,yrs in [("今すぐ実行",-10.62,0),("1年後",-8.82,1),("2年後",-7.02,2),("3年後",-5.22,3)]:
    o=max(-(BASE_CAP+ret),0)+0.00
    r=solve(20.0, ALL_OUT, max(o,0.0), True, ret=ret, label=lab)
    vote=r['vote']
    print(f"  {lab:<8}繰越欠損{ret:6.2f}億  非買取部分{r['other']:5.2f}億  中野ﾌｧﾝﾄﾞ {r['X']:5.2f}億  "
          f"ﾊﾟｰﾄﾅｰ {r['Y']:6.2f}億  中野陣営{r['cam']/vote*100:5.2f}%  {'○' if r['ok'] else '×'}")

print("\n  ▼ 2年後クロージング案の詳細（株主は中野陣営とパートナーの2者のみ）")
r=solve(20.0, ALL_OUT, 0.51, True, ret=-7.02)
print(f"    1株 {r['px']:,.0f}円 ／ 増資総額 {r['Z']:.2f}億（買取原資{r['buy']:.2f}億 ＋ 分配可能額の確保{r['other']:.2f}億）")
print(f"    中野ファンド {r['X']:.2f}億（{r['nf']:,}株）／ パートナー {r['Y']:.2f}億（{r['npp']:,}株）")
print(f"    分配可能額 {r['dist']:.2f}億 ≧ 自己株式取得 {r['buy']:.2f}億  {'○' if r['ok'] else '×'}")
print(f"    発行済 {r['post']:,}株（うち自己株式 {ALL_OUT:,}株）／議決権 {r['vote']:,}株")
print(f"      中野 邦人      {74_000:>8,}株  {74_000/r['vote']*100:6.3f}%")
print(f"      中野ファンド    {r['nf']:>8,}株  {r['nf']/r['vote']*100:6.3f}%")
print(f"      中野陣営 小計   {r['cam']:>8,}株  {r['cam']/r['vote']*100:6.3f}%")
print(f"      パートナー     {r['npp']:>8,}株  {r['npp']/r['vote']*100:6.3f}%")
print(f"    ビジョン借入7.90億・諸費用・手元資金は みずほのリファイ＋パートナーの劣後ローンで手当て")

print("\n"+"="*118)
print("【トレードオフ】中野ファンドを削ると何を失うか")
print("="*118)
r4=solve(20.0, VIS_BOS, 4.11, True); r5=solve(20.0, ALL_OUT, 0.51, True, ret=-7.02)
print(f"  {'案':<34}{'中野ﾌｧﾝﾄﾞ':>10}{'中野陣営':>10}{'株主構成':>16}{'実行時期':>10}")
print("  "+"-"*90)
b=solve(20.0, ALL_OUT, 10.35, False)
print(f"  {'現行案（第08章）':<32}{b['X']:>9.2f}億{b['cam']/b['vote']*100:>9.2f}%{'2者のみ':>16}{'すぐ':>10}")
print(f"  {'④ 少数株主を残す':<32}{r4['X']:>9.2f}億{r4['cam']/r4['vote']*100:>9.2f}%{'3者（少数12.8%）':>14}{'すぐ':>10}")
print(f"  {'★2年後クロージング':<31}{r5['X']:>9.2f}億{r5['cam']/r5['vote']*100:>9.2f}%{'2者のみ':>16}{'2年後':>10}")
