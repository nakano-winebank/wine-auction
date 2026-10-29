# -*- coding: utf-8 -*-
"""夢展望(3185)：RIZAP株取得＋7億債権放棄＋あどばる合併の採算とBS/PL"""
OK=1e8
# --- 夢展望（公開情報） ---
YT_SH   = 18_642_500     # 発行済（第12回の行使25万株を含む／LCAM大量保有報告の分母から逆算）
WAR_REM = 1_920_000      # 第12回新株予約権の残り（下限73円）
RIZ_SH  = 8_330_400      # RIZAP保有
PX      = 80.0           # 株価 2026/10/28
YT_NA0  = -0.47*OK       # 2026/6末 純資産（債務超過）
FORGIVE = 7.00*OK        # RIZAP貸付の放棄
YT_TA   = 19.25*OK       # 総資産（2026/3末）
YT_DEBT = 13.5*OK        # 有利子負債（2025/9末、リース負債含む見込み）
YT_CASH = 6.29*OK
YT_OP   = -0.30*OK       # 2027/3期 会社予想 営業損益
YT_SALES= 34.0*OK
# --- あどばる ---
ADV_VAL = 15.0*OK; ADV_SH=201_616; NAK_R=74_000/ADV_SH; VIZ_R=94_400/ADV_SH
ADV_NA  = -2.59*OK; ADV_TA=14.04*OK; ADV_OP=2.00*OK; ADV_DEBT=10.97*OK; ADV_CASH=0.40*OK; ADV_SALES=21.8*OK

YT_NA1 = YT_NA0+FORGIVE
print('='*86); print('① 7億放棄後の夢展望'); print('='*86)
print('  純資産 {:.2f}億 → {:.2f}億（債務超過を解消）'.format(YT_NA0/OK,YT_NA1/OK))
print('  1株純資産 {:.1f}円 ／ 株価{:.0f}円 → PBR {:.2f}倍'.format(YT_NA1/YT_SH,PX,PX/(YT_NA1/YT_SH)))
print('  時価総額 {:.2f}億（RIZAP保有 {:.2f}%）'.format(YT_SH*PX/OK,RIZ_SH/YT_SH*100))
print('  有利子負債 {:.1f}億 → {:.1f}億（推定）'.format(YT_DEBT/OK,(YT_DEBT-FORGIVE)/OK))

print('\n'+'='*86); print('② RIZAP株の取得価格と中野の持分（あどばる15億・夢展望を市場株価で合併）'); print('='*86)
new=round(ADV_VAL/PX); tot=YT_SH+new; dil=tot+WAR_REM
nak_m=round(NAK_R*new); viz_m=round(VIZ_R*new); corp_m=new-nak_m-viz_m
print('  合併で交付する新株 {:,}株 ／ 合併後発行済 {:,}株（新株予約権の行使後 {:,}株）'.format(new,tot,dil))
print('  あどばる側 {:.2f}%  中野(あどばる分) {:.2f}%  ビジョン {:.2f}%  旧あどばる6社 {:.2f}%'
      .format(new/tot*100,nak_m/tot*100,viz_m/tot*100,corp_m/tot*100))
print()
print('  {:<22}{:>10}{:>14}{:>14}'.format('RIZAP株の取得単価','中野の負担','中野の持分','完全希薄化後'))
for p,lab in ((80,'市場株価'),(60,''),(40,''),(35,'1株純資産相当')):
    cost=RIZ_SH*p
    print('  {:>4}円 {:<14}{:>8.2f}億{:>13.2f}%{:>13.2f}%'
          .format(p,lab,cost/OK,(nak_m+RIZ_SH)/tot*100,(nak_m+RIZ_SH)/dil*100))
print('\n  ※ RIZAPから3分の1超を相対で取得するには公開買付け（ディスカウントTOB）が必要')
print('  ※ スマサポ案：5.27億で30.80%／6.16億で33.34%')

print('\n'+'='*86); print('③ 合併比率の感度（夢展望の評価額）'); print('='*86)
for v in (10,15,20):
    side=ADV_VAL/(ADV_VAL+v*OK)
    print('  夢展望{:>2}億 → あどばる側 {:>5.1f}%  中野(RIZAP株込み) 約{:>5.1f}%  {}'
          .format(v,side*100,(NAK_R*side+ (RIZ_SH/YT_SH)*(1-side))*100,
                  '← 50%超で実質的存続性の審査リスク' if side>0.5 else ''))

print('\n'+'='*86); print('④ 合算PL（2027年3月期ベース）'); print('='*86)
op=YT_OP+ADV_OP; intsave=FORGIVE*0.025
print('  売上   夢展望{:.1f}億 ＋ あどばる{:.1f}億 = {:.1f}億'.format(YT_SALES/OK,ADV_SALES/OK,(YT_SALES+ADV_SALES)/OK))
print('  営業益 夢展望{:.2f}億 ＋ あどばる{:.2f}億 = {:.2f}億（IFRSのためのれん償却なし）'.format(YT_OP/OK,ADV_OP/OK,op/OK))
print('  支払利息の削減（7億×2.5%想定） +{:.2f}億'.format(intsave/OK))
ni=(op+intsave)*0.7
print('  税引後（30%） {:.2f}億 → PER17倍で {:.1f}億   単純合算 {:.0f}億'.format(ni/OK,ni*17/OK,(ADV_VAL+YT_SH*PX)/OK))
print('  ※ 繰越欠損金で税負担がなければ税引後 {:.2f}億 → PER17倍 {:.1f}億'.format((op+intsave)/OK,(op+intsave)*17/OK))
print('  ※ スマサポ案：合算営業益4.30億、のれん償却後3.42億')

print('\n'+'='*86); print('⑤ 合算BS（7億放棄後・夢展望15億/あどばる15億）'); print('='*86)
gw=ADV_VAL-ADV_NA
ta=YT_TA+ADV_TA+gw; na=YT_NA1+ADV_VAL; tl=ta-na
print('  のれん {:.2f}億（夢展望が取得企業の場合。IFRSでは償却せず減損テスト）'.format(gw/OK))
print('  総資産 {:.2f}億 ／ 純資産 {:.2f}億 ／ 自己資本比率 {:.1f}%'.format(ta/OK,na/OK,na/ta*100))
print('  のれん控除後 {:.2f}億 / {:.2f}億 = {:.1f}%'.format((na-gw)/OK,(ta-gw)/OK,(na-gw)/(ta-gw)*100))
debt=(YT_DEBT-FORGIVE)+ADV_DEBT; ebitda=2.65*OK+YT_OP+0.9*OK
print('  有利子負債 {:.1f}億（夢展望{:.1f}＋あどばる{:.1f}）／ 現預金 {:.2f}億'.format(debt/OK,(YT_DEBT-FORGIVE)/OK,ADV_DEBT/OK,(YT_CASH+ADV_CASH)/OK))
print('  有利子負債/EBITDA 約{:.1f}倍（夢展望の償却費0.9億を仮定）  ※スマサポ案 約2.2倍'.format(debt/ebitda))
print('  市場への売却圧力：ビジョン{:.1f}%＋6社{:.1f}% = {:.1f}% ≒ {:.1f}億'
      .format(viz_m/tot*100,corp_m/tot*100,(viz_m+corp_m)/tot*100,(viz_m+corp_m)*PX/OK))
