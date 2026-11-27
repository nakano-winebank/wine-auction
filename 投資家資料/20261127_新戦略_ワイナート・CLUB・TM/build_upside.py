# 新戦略（ワイナート＋新WineBank CLUB＋ティエリーマルクス）の上乗せ試算
# 単位：百万円、WineBank決算期（10月〜翌9月）。27/9期＝2026年度。
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment
YRS = [2027, 2028, 2029, 2030, 2031]

# ① 既存予算 v16（プランE）＋予算の伸びで延長
BUD = {2027: (1200.000, 54.905), 2028: (1438.750, 88.117), 2029: (1803.375, 149.446)}
G = (1803.375 / 1200) ** 0.5; D = (149.446 - 54.905) / 2
BUD[2030] = (BUD[2029][0] * G, BUD[2029][1] + D)
BUD[2031] = (BUD[2030][0] * G, BUD[2030][1] + D)

# ② 新CLUB（新モデル収支試算：本部増分、1〜3年目＝27/9〜29/9期）。4年目以降は会員+15%/年、利益率は3年目並み
CLUB_R = {2027: 5.61, 2028: 28.38, 2029: 66.88}
CLUB_O = {2027: 1.10, 2028: 14.14, 2029: 34.16}
for y in (2030, 2031):
    CLUB_R[y] = CLUB_R[y - 1] * 1.15; CLUB_O[y] = CLUB_R[y] * CLUB_O[2029] / CLUB_R[2029]

# ③ ワイナート（2027/3承継、取締役会報告）。1年目OP▲1,080万・2年目±0・3年目以降は新規事業で+500万/年
#   売上は25年実績3,402万＋新規事業粗利の約2倍を売上と仮定
WIN_FY = {1: (34.0 + 15.0, -10.8), 2: (34.0 + 28.0, 0.0), 3: (34.0 + 36.0, 5.0), 4: (34.0 + 42.0, 10.0), 5: (34.0 + 46.0, 15.0)}
def win(y):  # 承継年度1年目＝27/3〜28/2。WB期への按分
    m = {2027: [(1, 7)], 2028: [(1, 5), (2, 7)], 2029: [(2, 5), (3, 7)], 2030: [(3, 5), (4, 7)], 2031: [(4, 5), (5, 7)]}[y]
    return tuple(sum(WIN_FY[k][i] * n / 12 for k, n in m) for i in (0, 1))
WIN = {y: win(y) for y in YRS}
# ワイナート読者→WineBank自社販売（報告書のシナジー：自社販売寄与108/365/423万、粗利30%）
SYN_R = {2027: 0.6, 2028: 2.6, 2029: 4.0, 2030: 4.5, 2031: 5.0}
SYN_O = {y: SYN_R[y] * 0.30 for y in YRS}

# ④ ティエリーマルクス（プランB：連結、WB持分71.3%）
TM_FY3 = {2027: (0, 0), 2028: (374, 9), 2029: (875, 37), 2030: (1698, 101), 2031: (2529, 177), 2032: (3360, 254)}
# TMは3月決算：WB期（Y年9月期）＝TMのY年3月期の後半6か月＋Y+1年3月期の前半6か月
TM = {y: tuple(0.5 * TM_FY3[y][i] + 0.5 * TM_FY3[y + 1][i] for i in (0, 1)) for y in YRS}
# TM店舗へのワイン卸：TM売上×ワイン仕入8%をWB経由、WBマージン20%（連結では売上消去・マージンのみ残る）
TMW_O = {y: TM[y][0] * 0.08 * 0.20 for y in YRS}

rows = []
def add(name, d, kind):
    rows.append((name, [d[y] for y in YRS], kind))
add("①既存予算v16（延長含む）売上", {y: BUD[y][0] for y in YRS}, "r")
add("①既存予算v16 営業利益", {y: BUD[y][1] for y in YRS}, "o")
add("②新CLUB 売上（増分）", CLUB_R, "r")
add("②新CLUB 営業利益（増分）", CLUB_O, "o")
add("③ワイナート 売上", {y: WIN[y][0] for y in YRS}, "r")
add("③ワイナート 営業利益", {y: WIN[y][1] for y in YRS}, "o")
add("③'読者→自社販売 売上", SYN_R, "r")
add("③'読者→自社販売 営業利益", SYN_O, "o")
add("④TM 売上（連結）", {y: TM[y][0] for y in YRS}, "r")
add("④TM 営業利益（連結）", {y: TM[y][1] for y in YRS}, "o")
add("④'TM向けワイン卸マージン", TMW_O, "o")

def tot(kind, names=None):
    return [sum(v[i] for n, v, k in rows if k == kind and (names is None or any(n.startswith(p) for p in names))) for i in range(5)]
sumrow = {
    "WB単体＋CLUB＋ワイナート 売上": tot("r", ["①", "②", "③"]),
    "WB単体＋CLUB＋ワイナート 営業利益": tot("o", ["①", "②", "③"]),
    "上方修正幅（②＋③）営業利益": tot("o", ["②", "③"]),
    "連結（＋TM）売上": tot("r"),
    "連結（＋TM）営業利益": tot("o"),
}
if __name__ == "__main__":
    for n, v, k in rows: print(f"{n:28s}", " ".join(f"{x:8.1f}" for x in v))
    for n, v in sumrow.items(): print(f"{n:28s}", " ".join(f"{x:8.1f}" for x in v))
    wb = openpyxl.Workbook(); ws = wb.active; ws.title = "上乗せ試算"
    ws.append(["新戦略（ワイナート＋新CLUB＋TM）上乗せ試算　単位：百万円　WineBank決算期"])
    ws.append(["項目"] + [f"{y%100}/9期" for y in YRS] + ["根拠"])
    src = {"①": "3か年予算v16（プランE）、29/9期以降は予算の伸び率で延長",
           "②": "WineBank_CLUB_新モデル収支試算（本部増分）。30/9期以降+15%/年",
           "③ワ": "ワイナート取締役会報告（1年目▲1,080万→2年目±0）。売上は25年実績＋新規事業",
           "③'": "同報告のシナジー（自社販売寄与108/365/423万）×粗利30%",
           "④T": "10/27 TM投資家資料の5か年計画（3月決算）をWB期（9月決算）へ月割り換算",
           "④'": "仮定：TM売上×ワイン8%×WBマージン20%（連結では売上消去）"}
    for n, v, k in rows:
        ws.append([n] + [round(x, 1) for x in v] + [next((s for p, s in src.items() if n.startswith(p)), "")])
    ws.append([])
    for n, v in sumrow.items():
        ws.append([n] + [round(x, 1) for x in v]); ws.cell(ws.max_row, 1).font = Font(bold=True)
    ws.column_dimensions["A"].width = 34; ws.column_dimensions["G"].width = 60
    ws["A1"].font = Font(bold=True, size=12)
    for c in ws[2]: c.font = Font(bold=True); c.fill = PatternFill("solid", fgColor="DDE4EE")
    wb.save("新戦略_上乗せ試算_20261127.xlsx")
