# -*- coding: utf-8 -*-
OKU = 100_000_000

# ---- 株主構成（潜在前, 2023/12/1名簿 = 第10期末も同数 192,616株）----
holders = {
    "ビジョン(佐野健一)": 94_500,
    "中野邦人":            65_000,
    "エアトリ":            16_116,
    "KUMAアセットM":        6_300,
    "フィル・カンパニー":    3_000,
    "ベクトル":             3_000,
    "アンビション・V":       2_700,
    "BOS":                 2_000,
}
TOTAL = sum(holders.values())
print(f"発行済株式総数: {TOTAL:,}株")
for k, v in holders.items():
    print(f"  {k:<18} {v:>7,}株  {v/TOTAL*100:5.2f}%")

# 50.1% の内訳検証
vision_bloc = holders["ビジョン(佐野健一)"] + holders["BOS"]
print(f"\nビジョン+BOS = {vision_bloc:,}株 = {vision_bloc/TOTAL*100:.2f}%  ← 「50.1%」の正体")

# ---- 株価 ----
print("\n=== 評価額別 1株価格・50.1%取得額 ===")
for ev in [13, 15, 18, 20]:
    ps = ev*OKU/TOTAL
    print(f"  株式価値{ev}億 → {ps:8,.0f}円/株 | 50.1%(96,500株)={ps*vision_bloc/OKU:5.2f}億 | 中野65,000株={ps*65_000/OKU:5.2f}億")

# ---- 第10期(FY2026/5期)実績 ----
sales, op, ord_, ni = 2_180_206, 158_109, 136_590, 61_690       # 千円
ta, na, cash = 1_316_028, -409_432, 40_414
debt = {"日本政策金融公庫":224_000, "十六銀行":6_000, "武蔵野銀行":136_000,
        "大垣共立銀行":1_000, "ビジョン":790_000}
gross_debt = sum(debt.values())
net_debt = gross_debt - cash
da = 65_000  # 減価償却費 約0.6-0.7億/年（2026/3 MBO資料）
ebitda = op + da

print(f"\n=== 第10期(2026年5月期)実績 ===")
print(f"  売上高      {sales/1e5:6.2f}億 (前期18.35億, +18.8%)")
print(f"  営業利益    {op/1e5:6.2f}億 (前期1.77億 → 減益)")
print(f"  経常利益    {ord_/1e5:6.2f}億")
print(f"  当期純利益  {ni/1e5:6.2f}億")
print(f"  EBITDA     {ebitda/1e5:6.2f}億 (営業利益+減価償却{da/1e5:.2f}億)")
print(f"  総資産      {ta/1e5:6.2f}億 / 純資産 {na/1e5:6.2f}億 ← 債務超過")
print(f"  現預金      {cash/1e5:6.2f}億")
print(f"  有利子負債  {gross_debt/1e5:6.2f}億 (うちビジョン {debt['ビジョン']/1e5:.2f}億)")
print(f"  ネットデット {net_debt/1e5:6.2f}億")
print(f"  Net Debt/EBITDA = {net_debt/ebitda:.1f}倍  ← 既に過剰債務")

print(f"\n=== 対計画（2026年3月MBO資料 FY2026計画）===")
print(f"  売上  計画24.10億 → 実績{sales/1e5:.2f}億  ({(sales/1e5/24.1-1)*100:+.1f}%)")
print(f"  営利  計画 2.18億 → 実績{op/1e5:.2f}億  ({(op/1e5/2.18-1)*100:+.1f}%)")

# ---- 正常収益力 ----
print(f"\n=== 正常収益力（ビジョン出向コスト付替え解消後）===")
for shift in [1.0, 1.25, 1.5]:
    n_op = op/1e5 - shift
    n_eb = ebitda/1e5 - shift
    print(f"  付替え{shift:.2f}億戻し → 営業利益{n_op:5.2f}億 / EBITDA{n_eb:5.2f}億 | ND/EBITDA={net_debt/1e5/n_eb:5.1f}倍")

# ---- EV倍率 ----
print(f"\n=== 株式価値20億の含意 ===")
ev20 = 20 + net_debt/1e5
print(f"  EV = 20億 + ネットデット{net_debt/1e5:.2f}億 = {ev20:.2f}億")
print(f"  EV/EBITDA(実績{ebitda/1e5:.2f}億)     = {ev20/(ebitda/1e5):5.1f}倍")
for shift in [1.0, 1.5]:
    print(f"  EV/EBITDA(正常化{ebitda/1e5-shift:.2f}億) = {ev20/(ebitda/1e5-shift):5.1f}倍")
