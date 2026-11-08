# -*- coding: utf-8 -*-
"""BRASSERIE Thierry Marx Roppongi – Single-store P&L (English) for Thierry Marx.
   build_integrated_model_v8.py の単店部分（サマリー・売上前提・経費前提・人員計画・単店PL）だけを
   切り出し、英訳して出力する。店舗群別PL・連結PL・投資CF・感応度分析は含めない。"""
import re, os
HERE=os.path.dirname(os.path.abspath(__file__))
OUT=os.path.join(HERE,"BRASSERIE_Thierry_Marx_Roppongi_Single-Store_PL_EN_20261109.xlsx")
src=open(os.path.join(HERE,"build_integrated_model_v8.py"),encoding="utf-8").read().split("\n")
L=lambda a,b: src[a-1:b]
# 単店部分のみ（売上前提・経費前提〈出店計画を除く〉・単店PL・人員計画）
core="\n".join(L(1,282)+L(300,393)+L(789,877))
core=core.replace('JP="Meiryo"','JP="Arial"')
SUMMARY=r'''
ws1=wb.create_sheet("サマリー",0); ws1.sheet_view.showGridLines=False
ws1.column_dimensions["A"].width=46; ws1.column_dimensions["B"].width=16
for c in "CDE": ws1.column_dimensions[c].width=14
band(ws1,1,"BRASSERIE Thierry Marx Roppongi　単店事業収支","E")
S(ws1,"A2",size=9,color="7F7F7F")
ws1["A2"]="単位：百万円（客単価は円）。「売上前提」の席数・席効率・回転率・客単価を変えると、単店PLまで再計算されます。"
sec(ws1,4,"■ 主な前提","E")
for i,(lab,f_,fmt) in enumerate([
    ("総席数（店内＋テラス）",f"=売上前提!$B${R_ALL_SEATS}",MM0),
    ("　店内",f"=売上前提!$B${R_IN_SEATS}",MM0),("　テラス",f"=売上前提!$B${R_TE_SEATS}",MM0),
    ("店内 席効率",f"=売上前提!$D${R_G0}",PCT),
    ("ディナー 回転率（店内）",f"=売上前提!$E${R_G0+4}",NUM2),
    ("客単価 ランチ",f"=売上前提!$H${R_G0}",YEN),
    ("客単価 カフェ",f"=売上前提!$H${R_G0+2}",YEN),
    ("客単価 ディナー（店内）",f"=売上前提!$H${R_G0+4}",YEN),
    ("客単価 ディナー（テラス）",f"=売上前提!$H${R_G0+5}",YEN),
    ("営業日数（日／年）",f"=売上前提!$B${R_DAYS}",NUM),
    ("満年度 年商",f"=売上前提!$K${R_GT}",MM),
    ("人員（社員＋アルバイト）","=人員計画!$C$17",MM0)]):
    r=5+i; sub=lab.startswith("　")
    S(ws1,f"A{r}",border=True,size=9 if sub else 10,color="7F7F7F" if sub else BLACK,bold=("年商" in lab)); ws1[f"A{r}"]=lab
    S(ws1,f"B{r}",color=GREEN,fmt=fmt,border=True,align="center",bold=("年商" in lab),fill=KEY if "年商" in lab else None)
    ws1[f"B{r}"]=f_
sec(ws1,18,"■ 単店PL","E")
for c,t in zip("BCDE",["満年度","1年目","2年目","3年目以降"]):
    S(ws1,f"{c}19",bold=True,border=True,fill=TOT,align="center"); ws1[f"{c}19"]=t
S(ws1,"A19",bold=True,border=True,fill=TOT); ws1["A19"]="項　目"
r=20
for lab,src_,hl in [("売上高",R_REV,False),("GOP（店舗営業総利益）",R_GOP,False),
                   ("EBITDA",R_EBITDA,True),("減価償却費",R_DEP,False),("営業利益",R_OP,True)]:
    S(ws1,f"A{r}",bold=hl,border=True); ws1[f"A{r}"]=lab
    for c in "BCDE":
        S(ws1,f"{c}{r}",bold=hl,color=GREEN,fmt=MM,border=True,align="center",fill=KEY if hl else None)
        ws1[f"{c}{r}"]=f"=単店PL!{c}{src_}"
    r+=1
for lab,src_ in [("　EBITDA率",R_EBITDA),("　営業利益率",R_OP)]:
    S(ws1,f"A{r}",bold=True,border=True); ws1[f"A{r}"]=lab
    for c in "BCDE":
        S(ws1,f"{c}{r}",bold=True,fmt=PCT,border=True,align="center",fill=KEY)
        ws1[f"{c}{r}"]=f"=IF(単店PL!{c}{R_REV}=0,0,単店PL!{c}{src_}/単店PL!{c}{R_REV})"
    r+=1
r+=1
sec(ws1,r,"■ 初期投資","E"); r+=1
for lab,ref in [("初期投資 合計",f"=経費前提!$B${R_INVTOT}"),
                ("　うち 開業時に支払う現金",f"=経費前提!$B${R_CASH}"),
                ("　うち 分割払い（内装100＋保証金38.9）",f"=経費前提!$B${R_DEF}")]:
    sub=lab.startswith("　")
    S(ws1,f"A{r}",border=True,size=9 if sub else 10,color="7F7F7F" if sub else BLACK); ws1[f"A{r}"]=lab
    S(ws1,f"B{r}",color=GREEN,fmt=MM,border=True,align="center"); ws1[f"B{r}"]=ref
    r+=1
if "Sheet" in wb.sheetnames: del wb["Sheet"]
wb._sheets=[wb[n] for n in ["サマリー","売上前提","経費前提","人員計画","単店PL"]]
'''
ns={}
exec(core+SUMMARY,ns)
wb=ns["wb"]

SHEETS={"サマリー":"Summary","売上前提":"Revenue Assumptions","経費前提":"Cost Assumptions",
        "人員計画":"Staffing Plan","単店PL":"Store P&L"}
T={
# Summary
"BRASSERIE Thierry Marx Roppongi　単店事業収支":"BRASSERIE Thierry Marx Roppongi — Store P&L",
"単位：百万円（客単価は円）。「売上前提」の席数・席効率・回転率・客単価を変えると、単店PLまで再計算されます。":
 "Unit: JPY million (average spend in JPY). Changing seats, occupancy, turnover or average spend in 'Revenue Assumptions' recalculates the whole P&L.",
"■ 主な前提":"■ Key assumptions","総席数（店内＋テラス）":"Total seats (indoor + terrace)",
"　店内":"　Indoor","　テラス":"　Terrace","店内 席効率":"Indoor seat occupancy",
"ディナー 回転率（店内）":"Dinner turnover (indoor)","客単価 ランチ":"Average spend – Lunch (JPY)",
"客単価 カフェ":"Average spend – Café (JPY)","客単価 ディナー（店内）":"Average spend – Dinner, indoor (JPY)",
"客単価 ディナー（テラス）":"Average spend – Dinner, terrace (JPY)","営業日数（日／年）":"Trading days per year",
"満年度 年商":"Annual sales (full year)","人員（社員＋アルバイト）":"Headcount (full-time + part-time)",
"■ 単店PL":"■ Store P&L","項　目":"Item","満年度":"Full year","1年目":"Year 1","2年目":"Year 2","3年目以降":"Year 3+",
"売上高":"Net sales","GOP（店舗営業総利益）":"GOP (gross operating profit)","減価償却費":"Depreciation",
"営業利益":"Operating profit","　EBITDA率":"　EBITDA margin","　営業利益率":"　Operating margin",
"■ 初期投資":"■ Initial investment","初期投資 合計":"Total initial investment",
"　うち 開業時に支払う現金":"　of which paid in cash at opening",
"　うち 分割払い（内装100＋保証金38.9）":"　of which paid in instalments (fit-out 100 + deposit 38.9)",
# Revenue
"売上前提　／　席数 × 席効率 × 回転率 × 客単価 からの積上げ":"Revenue assumptions — built up from seats × occupancy × turnover × average spend",
"水色セル＝入力値。ここを変えると単店PLだけでなく5か年連結・資金計画まで全て再計算されます。":"Light-blue cells are inputs. Changing them recalculates the Store P&L.",
"■ 基本条件":"■ Basic conditions","年363日営業":"Open 363 days a year (closed 2 days at New Year)",
"立上り率　1年目":"Ramp-up — Year 1","新店初年度は保守的に90%":"Conservative 90% in the first year",
"立上り率　2年目":"Ramp-up — Year 2","立上り率　3年目以降（成熟）":"Ramp-up — Year 3+ (mature)",
"満年度＝この水準":"Full year = this level","新店の開業年度 稼働月数":"Months of trading in opening year (future stores)",
"2号店以降。年2店を上期・下期に分散する前提の平均":"Stores 2+: average assuming 2 openings a year spread over H1/H2",
"1号店の稼働月数（FY2027）":"Months of trading – Roppongi (FY2027)",
"2027年4月開業＝FY2027は通年稼働":"Opening April 2027 = full year of trading in FY2027",
"■ 席数（席）":"■ Seats","カウンター（ワインバー含む）":"Counter (incl. wine bar)",
"Notes Design平面図（2026.10.22）：店内63席（カウンター6＋ワインバー3／ダイニング32／半個室A6・B4・個室12）＋テラス45席＝108席。面積55.5坪":
 "Notes Design floor plan (22 Oct 2026): 63 indoor seats (counter 6 + wine bar 3 / dining 32 / semi-private A6, B4, private room 12) + 45 terrace seats = 108 seats. Area 55.5 tsubo (183.59 m²)",
"ダイニング":"Dining","個室・半個室":"Private / semi-private rooms","店内　小計":"Indoor subtotal",
"テラス":"Terrace","合　計":"Total","■ 時間帯 × エリア 別の売上前提":"■ Revenue by daypart × area",
"時間帯":"Daypart","エリア":"Area","席数":"Seats","席効率":"Occupancy","回転率\n(回/日)":"Turnover\n(per day)",
"客単価\n料理(円)":"Spend\nfood (JPY)","客単価\n飲料(円)":"Spend\ndrinks (JPY)","客単価\n計(円)":"Spend\ntotal (JPY)",
"1日\n客数(人)":"Covers\nper day","日商(円)":"Daily sales (JPY)","年間売上\n(百万円)":"Annual sales\n(JPY m)","構成比":"Share",
"ランチ":"Lunch","店内":"Indoor","★ この表の年間売上合計が、5か年計画の『標準店 満年度売上』になります":"★ The total of this table is the full-year sales of the store",
"カフェ（アイドルタイム）":"Café (afternoon)","ディナー":"Dinner",
"■ 料理・飲料別の年間売上（原価計算用）":"■ Annual sales by food / drinks (for cost of sales)",
"料理売上":"Food sales","飲料売上":"Drinks sales","料理 構成比":"Food share","飲料 構成比":"Drinks share",
"■ 参考指標":"■ Reference KPIs","日商（円）":"Daily sales (JPY)","月商（百万円）":"Monthly sales (JPY m)",
"年商（百万円・満年度）":"Annual sales (JPY m, full year)","＝標準店 満年度売上":"(= full-year sales)",
"1日あたり総客数（人）":"Total covers per day","平均客単価（円）":"Average spend (JPY)",
"延べ席回転率（回/日）":"Overall seat turnover (per day)","坪数（坪）":"Area (tsubo)","183.59㎡":"183.59 m²",
"坪売上（百万円/坪・年）":"Sales per tsubo (JPY m / year)","1席あたり年間売上（百万円）":"Annual sales per seat (JPY m)",
"席数変更の効果":"Effect of seat changes","■ 立上りを織り込んだ年間売上（百万円）":"■ Annual sales incl. ramp-up (JPY m)",
"立上り率":"Ramp-up","年間売上高":"Annual net sales",
# Costs
"経費前提・投資前提（水色セル＝入力値）":"Cost & investment assumptions (light-blue cells are inputs)",
"単店PLと5か年連結の両方がこのシートを参照します。経費率は2026年8月3日提出P&L準拠。":"The Store P&L refers to this sheet. Cost ratios follow the P&L submitted on 3 Aug 2026.",
"■ 売上原価の計算方法":"■ Cost of sales method","計算方法（1＝売上比一括／2＝料理・飲料別）":"Method (1 = single ratio / 2 = food & drinks separately)",
"2を選ぶと料理・飲料それぞれの原価率で計算（直輸入ワインの効果を分けて見る場合）":"2 = separate food and drinks cost ratios (shows the effect of directly imported wine)",
"■ 経費率（対売上高）":"■ Cost ratios (% of sales)","費　目":"Cost item","提出P&L水準\n（満年度・1年目）":"Submitted P&L\n(full year / Y1)",
"売上原価（方法1：売上比一括）":"Cost of sales (method 1: single ratio)","方法1のときに使用":"Used with method 1",
"　料理原価率（方法2）":"　Food cost ratio (method 2)","方法2のときに使用":"Used with method 2",
"　飲料原価率（方法2）":"　Drinks cost ratio (method 2)","WineBankCLUB会費未計上":"WineBank CLUB membership income not included",
"実効売上原価率（方法に連動）":"Effective cost of sales ratio","計算結果。以降のPLはこの率を使用":"Calculated; used in the P&L",
"人件費":"Labour cost","事業計画予算（売上比）。人員構成は「人員計画」シート（稲葉案40名）":"Budget (% of sales). Staffing structure in 'Staffing Plan' (40 staff)",
"業務委託費・消耗品他":"Outsourcing & consumables","本部集中購買・規格統一":"Central purchasing & standardisation",
"広告宣伝費・販売促進費":"Advertising & promotion","据置":"Unchanged","その他経費":"Other expenses",
"水道光熱費":"Utilities","高効率厨房機器・営業時間最適化":"High-efficiency kitchen equipment, optimised hours",
"ロイヤリティ":"Royalty","契約条件（ブラッスリー4.0%）":"Per licence agreement (Brasserie 4.0%)",
"保険・租税公課":"Insurance & taxes","修繕維持費（FFE）":"Maintenance (FF&E reserve)",
"変動費　計（対売上）":"Variable costs total (% of sales)","■ 固定費・家賃条件（全店共通）":"■ Fixed costs & rent",
"地代家賃（固定）月額":"Fixed rent – monthly","月222万円。席数を変えても面積は同じため不変":"JPY 2.22m per month; unchanged by seat count",
"地代家賃（固定）年額":"Fixed rent – annual","＝月額×12":"(= monthly × 12)","歩合家賃率":"Turnover rent rate",
"閾値超過分に対して7%":"7% of sales above the threshold","歩合家賃 閾値（年商）":"Turnover rent threshold (annual sales)",
"提出P&L時点の水準から逆算":"Derived from the submitted P&L","人員数（名・参考）":"Headcount (reference)",
"「人員計画」シートに連動（稲葉案）。人件費は売上比で計算":"Linked to 'Staffing Plan'. Labour cost is calculated as % of sales",
"■ 初期投資（1店舗あたり・百万円）":"■ Initial investment per store (JPY m)","1号店\n(六本木)":"Store 1\n(Roppongi)",
"2〜3号店\n(札幌・大阪)":"Stores 2–3\n(Sapporo, Osaka)","4号店以降":"Store 4+","契約金":"Contract fee",
"契約金 3店舗3,000万円／以下7店舗3,500万円":"Contract fee: JPY 30m for the first 3 stores / JPY 35m for the next 7 stores",
"事業費（設計・内装施工・OSE/FF&E）":"Project cost (design, fit-out, OS&E / FF&E)","55.5坪×350万":"55.5 tsubo × JPY 3.5m",
"　うち 資産計上対象外（補助金等）":"　of which not capitalised (subsidies etc.)",
"家主立替分は自社資産として計上するため0。ここは純粋な資産控除がある場合のみ使用":"0: landlord-funded fit-out is still capitalised by the company",
"　資産計上額":"　Capitalised amount","＝事業費 － 資産計上対象外":"(= project cost − not capitalised)",
"開業準備金（広告・採用等）":"Pre-opening costs (advertising, recruitment)","保証金":"Rental deposit",
"非償却・退去時返還対象":"Not depreciated; refundable on exit","ワイン・美術品在庫":"Wine & artwork inventory",
"1号店は美術品含む。2号店以降はワイン1,000万円のみ（非償却）":"Store 1 includes artwork; stores 2+ wine only JPY 10m (not depreciated)",
"初期投資　合計":"Total initial investment","償却対象資産（＝合計－保証金－ワイン・美術品）":"Depreciable assets (= total − deposit − wine & artwork)",
"ワイン在庫は棚卸資産、美術品は取得価額100万円以上なら原則非償却のため除外":"Wine is inventory; artwork ≥ JPY 1m is generally not depreciated",
"償却年数（年）":"Depreciation period (years)","年間減価償却費／1店（通年）":"Annual depreciation per store",
"■ 分割払いスキーム（百万円）":"■ Instalment scheme (JPY m)","分割対象：内装工事費（家主立替）":"Instalments: fit-out (landlord-funded)",
"家主が立替え、月833千円×120回（10年）で返済。資産計上・減価償却は自社で継続":"Funded by the landlord, repaid JPY 833k × 120 months (10 years); capitalised and depreciated by the company",
"分割対象：保証金":"Instalments: rental deposit","賃貸借契約：月463千円×84回（7年）＝38.9。残り0.1は開業時に支払":"Lease: JPY 463k × 84 months (7 years) = 38.9; remaining 0.1 paid at opening",
"分割対象額　計":"Total paid in instalments","開業時 現金支出／1店":"Cash paid at opening per store",
"＝初期投資合計 － 分割対象額":"(= total initial investment − instalments)","年間分割弁済額／1店":"Annual instalment repayment per store",
"＝内装分÷10年 ＋ 保証金分÷7年":"(= fit-out ÷ 10 years + deposit ÷ 7 years)",
# Staffing
"六本木ミッドタウン店（1号店）　人員計画":"Roppongi Midtown — Staffing Plan",
"人員構成は稲葉案（2026年11月1日）。人件費は事業計画の予算（売上比 1年目34.5%／2年目33.5%／3年目以降32.5%）で計上。":
 "Staffing structure prepared by the operations team (1 Nov 2026). Labour cost is the budget: 34.5% of sales in Year 1, 33.5% in Year 2, 32.5% from Year 3.",
"■ 人員構成（名）":"■ Staffing structure (headcount)","部　門":"Department","区　分":"Category","人数":"Headcount",
"週労働\n時間計(h)":"Weekly\nhours","FTE換算\n(週40h)":"FTE\n(40h/week)","サービス":"Service","役職者（社員）":"Managers (full-time)",
"ダイニングマネージャー、シェフソムリエ（ブランド契約上の必須職）ほか2名":"Dining Manager, Head Sommelier (required by the brand agreement) + 2",
"社員":"Full-time staff","週40h×6名":"6 × 40h/week","アルバイト":"Part-time staff",
"朝番3・通し3・夕番4・ディナー2（時給1,700円）":"Morning 3, all-day 3, evening 4, dinner 2",
"調理":"Kitchen","シフト作成中":"Rota in progress",
"総料理長、パティスリーシェフ（ブランド契約上の必須職）ほか2名":"Executive Chef, Pastry Chef (required by the brand agreement) + 2",
"サービスと同様の配置":"Same structure as service","アルバイト（洗い場含む）":"Part-time staff (incl. dishwashing)",
"6〜8名の上限で計上":"Upper end of 6–8","サービス　計":"Service total","調理　計":"Kitchen total",
"役職者　計":"Managers total","一般社員　計":"Full-time staff total","アルバイト　計":"Part-time total",
"社員20名（役職者8名＋一般社員12名）＋アルバイト20名＝40名。退職を見込み、社員は多めに募集":
 "20 full-time (8 managers + 12 staff) + 20 part-time = 40. Recruitment will allow for turnover.",
"■ サービス　週間モデルシフト（稲葉案・抜粋）":"■ Service — model weekly rota (extract)",
"平日":"Weekday","土曜":"Saturday","日祝":"Sun / holiday","週計":"Week total",
"出勤人数（名）":"Staff on duty","労働時間（h）":"Hours worked",
"営業時間 11:00〜23:00（年末年始2日休・年363日）。シフトは10:30〜23:00の早番・通し・遅番で構成。調理のモデルシフトは作成中。":
 "Opening hours 11:00–23:00 (closed 2 days at New Year, 363 days). Shifts between 10:30 and 23:00 (early / all-day / late). Kitchen rota in progress.",
"■ 人件費（事業計画予算）":"■ Labour cost (budget)","売上高（百万円）":"Net sales (JPY m)","人件費率":"Labour cost ratio",
"経費前提シートの人件費率（予算）":"Budget ratio from 'Cost Assumptions'","人件費　年額（百万円）":"Labour cost — annual (JPY m)",
"人件費　月額（百万円）":"Labour cost — monthly (JPY m)","社会保険・交通費・残業代込み。開業前の採用・研修費は開業準備金に含む":
 "Incl. social insurance, commuting and overtime. Pre-opening recruitment & training in pre-opening costs",
"人員数（名）":"Headcount","※ 人件費は予算額で計上。役職別給与・調理シフトの確定後、人員×給与の積上げに切り替えて再計算する。":
 "* Labour cost is shown at budget. It will be rebuilt bottom-up (headcount × salary) once salaries and the kitchen rota are finalised.",
# Store P&L
"六本木ミッドタウン店（1号店）　単店PL（百万円）":"Roppongi Midtown — Store P&L (JPY m)",
"売上は「売上前提」、経費率・減価償却は「経費前提」に連動。科目は2026年8月3日提出P&Lのまま。":
 "Sales from 'Revenue Assumptions'; cost ratios and depreciation from 'Cost Assumptions'. Line items as in the P&L submitted on 3 Aug 2026.",
"科　目":"Line item","満年度\n（提出P&L水準）":"Full year\n(submitted P&L)","　うち 料理売上":"　of which food",
"　うち 飲料売上":"　of which drinks","売上原価":"Cost of sales","部門利益":"Departmental profit",
"地代家賃（固定）":"Fixed rent","歩合家賃":"Turnover rent","■ 対売上比":"■ % of sales",
}
pat=re.compile("|".join(re.escape(k) for k in sorted(SHEETS,key=len,reverse=True)))
missing=set()
for ws in wb:
    for row in ws.iter_rows():
        for c in row:
            v=c.value
            if not isinstance(v,str): continue
            if v.startswith("="):
                c.value=pat.sub(lambda m:SHEETS[m.group(0)],v)
                c.value=re.sub(r"(?<!')\b(Summary|Revenue Assumptions|Cost Assumptions|Staffing Plan|Store P&L)!",r"'\1'!",c.value)
            elif re.search(r"[^\x00-\x7f]",v):
                if v in T: c.value=T[v]
                elif not re.search(r"[぀-ヿ一-鿿]",v): pass
                else: missing.add(v)
for ws in wb: ws.title=SHEETS[ws.title]
# 英語ラベル用に列幅を調整
wb["Revenue Assumptions"].column_dimensions["A"].width=34
wb["Cost Assumptions"].column_dimensions["A"].width=48
wb["Staffing Plan"].column_dimensions["A"].width=16; wb["Staffing Plan"].column_dimensions["B"].width=34
wb["Store P&L"].column_dimensions["A"].width=34
assert not missing, missing
for ws in wb:
    ws.page_setup.orientation="landscape"; ws.page_setup.paperSize=ws.PAPERSIZE_A4
    ws.sheet_properties.pageSetUpPr.fitToPage=True
    ws.page_setup.fitToWidth=1; ws.page_setup.fitToHeight=1
    ws.print_options.horizontalCentered=True
wb.calculation.fullCalcOnLoad=True
wb.save(OUT); print("saved:",OUT)
