# -*- coding: utf-8 -*-
"""3案比較（①現状／②カンテサンス案＝これまでの増資案／③新計画＝ワイナート＋新CLUB＋TMを直営）2026/11/27
使い方: python3 build_3hikaku.py <会社案内テンプレートpptx> <出力pptx> <出力xlsx>
②は11/15に岡田様へお送りしたシンプル版（model_simple.json）、①③は戸髙さん5か年月次計画v2.8を土台。"""
import json, os, sys
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment
HERE = os.path.dirname(os.path.abspath(__file__))
SIMPLE = os.path.join(HERE, "..", "20261115_シンプル版_WineBank＋カンテサンス")
TPL, OUT, XLS = sys.argv[1], sys.argv[2], sys.argv[3]
import build_chokuei as C

# ── スライド部品（シンプル版の描画ヘルパーを流用）
src = open(os.path.join(SIMPLE, "build_slides_simple.py"), encoding="utf-8").read()
header = src[:src.index("\nNY = 5")]
argv0 = sys.argv
sys.argv = ["x", TPL, os.path.join(SIMPLE, "model_simple.json"), OUT]
exec(header)
sys.argv = argv0
MA = M  # model_simple.json

Y3 = [2027, 2028, 2029]
# ── ① 現状（WineBank単体：v2.8＝予算v16）
S0 = dict(rev=[C.WB[y][0] for y in C.YRS], op=[C.WB[y][1] for y in C.YRS])
S0["ni"] = [(S0["op"][i] - C.WB_NONOP[y]) * (1 - C.TAX) for i, y in enumerate(C.YRS)]
# ── ② カンテサンス案（シンプル版：WineBank＋カンテサンス、12か月プロフォーマ）
p2 = MA["p2"]
SA = dict(rev=p2["rev"], op=p2["op"], ni5=MA["scn"]["r5"]["p2"]["attrib_ni"], ni10=MA["scn"]["r10"]["p2"]["attrib_ni"])
def caseA(raise_, sh):
    post = 57 * (5790 + sh) / 1e4; ni = (SA["ni5"] if raise_ == 5 else SA["ni10"])[4] / 100
    own = sh / (5790 + sh); mc = ni * 20
    return dict(post=post, mc=mc, mult=mc * own / raise_, own=own)
A5, A10 = caseA(5, 877), caseA(10, 1754)
# ── ③ 新計画
P = C.P
SN = {k: [P[y][k] for y in C.YRS] for k in P[2027]}
N5 = C.R[("現金", 5.0)]
mc0 = S0["ni"][4] / 100 * 20

# v2.8 単体の部門別売上（百万円）
EC = [210.60, 232.53, 242.95, 253.90, 265.40]
TECH = [212.96 + 500, 275.00 + 675, 314.96 + 990, 366.57 + 1335, 415.05 + 1775]
OTH = [112.5 - 2.5 + 163.89, 92.5 - 2.5 + 163.89, 92.5 - 2.5 + 163.89, 92.5 - 2.5 + 163.89, 92.5 - 2.5 + 163.89]
CLUB_MEM = [137, 453, 923]

o = lambda v: oku(v)
def rng(a, b): return f"{o(a)}→{o(b)}億円"

# ───────── スライド1：3案の比較
s = new_slide("事業計画と増資案の比較（①現状／②カンテサンス案／③新計画）",
              "③ 新計画：ワイナート＋新WineBank CLUB＋ティエリーマルクスをWineBankの直営に")
hd = ["", "① 現状\n（WineBank単体）", "② カンテサンス案\n（これまでの増資案）", "③ 新計画\n（直営3事業＋新増資案）"]
rows = [hd,
    ["事業の組み合わせ", "ワイン販売・WineTech\n（3か年予算）", "①＋カンテサンス（三つ星）\n持分51%→64〜77%",
     "①＋ワイナート（事業譲受）\n＋新CLUB＋TM（100%・直営）"],
    ["売上高（27/9期→29/9期）", rng(S0["rev"][0], S0["rev"][2]), rng(SA["rev"][0], SA["rev"][2]), rng(SN["rev"][0], SN["rev"][2])],
    ["営業利益（27/9期→29/9期）", rng(S0["op"][0], S0["op"][2]), rng(SA["op"][0], SA["op"][2]), rng(SN["op"][0], SN["op"][2])],
    ["2030年度（31/9期）売上／営業利益", f"{o(S0['rev'][4])}／{o(S0['op'][4])}億円", f"{o(SA['rev'][4])}／{o(SA['op'][4])}億円",
     f"{o(SN['rev'][4])}／{o(SN['op'][4])}億円"],
    ["2030年度 純利益（WineBank帰属）", f"{o(S0['ni'][4])}億円", f"{o(SA['ni5'][4])}億円（10億調達 {o(SA['ni10'][4])}）", f"{o(SN['ni'][4])}億円"],
    ["今回の増資額", "―", "5億円（または10億円）", "5億円"],
    ["借入・保証・追加支払", "既存の借入のみ", "みずほLBO 15億円（WineBank連帯保証）\nアーンアウト最大6.8億円", "新たな借入なし\n（TM出店は家主の分割払い＋増資）"],
    ["1株価格／プレ", "45万円／26.1億円（前回ポスト）", "57万円／33.0億円", f"{C.px}万円／{C.pre_cash:.1f}億円"],
    ["ポスト（5億円調達）", "―", f"{A5['post']:.1f}億円（10億 {A10['post']:.1f}）", f"{N5['post']:.1f}億円"],
    ["上場時の時価総額（PER20倍）", f"{mc0:.0f}億円", f"{A5['mc']:.0f}億円（{A10['mc']:.0f}）", f"{N5['mc']:.0f}億円"],
    ["今回ラウンドの投資倍率", "―", f"{A5['mult']:.1f}倍（{A10['mult']:.1f}倍）", f"{N5['mult']:.1f}倍"],
    ["主なリスク", "規模と成長の説明力", "シェフ個人への依存・借入と保証\n12月末の決済期限・みずほの姿勢", "TM1号店の実績（2027年4月開業）\n出店の実行・ブランド契約の期間"],
]
rh = [0.36, 0.36, 0.22, 0.22, 0.22, 0.22, 0.20, 0.34, 0.22, 0.22, 0.22, 0.22, 0.34]
st = {(i, 3): dict(fill=BEIGE, bold=True) for i in range(1, len(rows))}
st.update({(0, 3): dict(fill=COPPER, color=WHITE, bold=True, align=PP_ALIGN.CENTER)})
for i in range(1, len(rows)):
    for j in (1, 2, 3):
        st.setdefault((i, j), {}).update(align=PP_ALIGN.CENTER)
table(s, 0.30, 1.20, [2.05, 2.10, 2.55, 2.70], rh, rows, size=6.8, styles=st)
tb(s, 0.30, 5.03, 9.40, 0.40,
   "年度＝WineBank決算期（10月〜翌9月）。①③は戸髙 5か年月次計画v2.8（予算v16と一致）が土台。②は11/15にお送りしたシンプル版の数字"
   "（カンテサンスは期初から12か月のプロフォーマ。会計上の連結では27/9期 売上19.9億円・営業利益4.4億円）。純利益は税34%。"
   "③のプレは、WineBank単体26.1億円＋TM運営会社100%の評価4.0億円−取得対価2.3億円（中野・P3分を株式交換にする場合はポスト34.8億円）。",
   size=6.0, color=GREY, space=1.12)
s.notes_slide.notes_text_frame.text = "2026/11/27 岡田様ご相談用。3案の比較。"

# ───────── スライド2：新計画の3か年
s = new_slide("新計画の3か年（2026〜2028年度）",
              "「読む（ワイナート）→ 飲む（TM・CLUB）→ 持つ・預ける（WineTech）」を自社でつなぐ")
yl = ["27/9期", "28/9期", "29/9期", "30/9期", "31/9期"]
def r5(lab, vals, f=mil): return [lab] + [f(v) for v in vals]
rows = [["百万円", "2026年度\n27/9期", "2027年度\n28/9期", "2028年度\n29/9期", "参考\n30/9期", "参考\n31/9期"],
    r5("ワイン販売（EC・卸）", EC), r5("WineTech（私募ファンド含む）", TECH), r5("その他（テラス・賃貸・経営指導料）", OTH),
    r5("メディア：ワイナート", SN["wi_r"]), r5("会員：新WineBank CLUB", SN["cl_r"]), r5("レストラン：TM直営店", SN["tm_r"]),
    r5("連結 売上高", SN["rev"]),
    r5("WineBank本体（既存3部門）", SN["wb_o"]), r5("ワイナート", SN["wi_o"]), r5("新WineBank CLUB", SN["cl_o"]),
    r5("TM直営店", SN["tm_o"]), r5("直営シナジー（本部共通化・直輸入ワイン）", SN["syn"]),
    r5("連結 営業利益", SN["op"]), r5("当期純利益", SN["ni"]),
    ["TM店舗数（期末）", "1店", "3店", "5店", "7店", "9店"],
    ["CLUB有料会員（増分・期末）", "137人", "453人", "923人", "―", "―"]]
st = {}
for i in (7, 13):
    st[(i, None)] = dict(fill=BEIGE, bold=True)
st[(14, None)] = dict(bold=True)
for i in range(1, len(rows)):
    for j in (4, 5):
        st.setdefault((i, j), {}).update(color=GREY)
st[(0, 4)] = st[(0, 5)] = dict(fill="8A8D99", color=WHITE, bold=True, align=PP_ALIGN.CENTER)
rh = [0.34] + [0.195] * 16
gt = table(s, 0.30, 1.20, [2.30, 0.66, 0.66, 0.66, 0.60, 0.60], rh, rows, size=6.8, styles=st)
tb(s, 0.30, 1.20 + sum(rh) + 0.03, 5.5, 0.2, "上段：売上高、下段：営業利益（百万円）。30/9・31/9期は参考の延長値。", size=6.0, color=GREY)
cx = 6.05
callout(s, cx, 1.20, 3.65, 1.12, "なぜ「直営」か",
        "少数株主に利益が流れず、本部・人事・購買とワイン調達をWineBankと一体で運営できる。"
        "直営店で使われたマイルの実質負担は料理原価分（約3割）で済み、CLUB会員の来店先にもなる。")
callout(s, cx, 2.40, 3.65, 1.20, "3事業の前提",
        "ワイナート：2027年3月に事業譲受（対価150万円）、1年目▲1,080万円→2年目±0（取締役会報告）。"
        "新CLUB：提携店紹介型、3年で12店・有料923人（新モデル収支試算）。"
        "TM：2027年4月 六本木（114席）→ 札幌・大阪 → 年2店で9店（10/27計画）。")
callout(s, cx, 3.68, 3.65, 1.20, "今回の増資5億円の使い道（案）",
        "TM出店資金の不足分 約1.9億円、外部株主分の取得 0.3億円、中野・P3分の取得 2.0億円"
        "（株式交換にすれば現金不要）、CLUB・ワイナートの立上げ 約0.5億円。LBOや保証は不要。")
s.notes_slide.notes_text_frame.text = "2026/11/27 新計画の3か年。数値は build_chokuei.py。"

# ───────── スライド3：3案の推移とねらい
s = new_slide("3案の推移と、新計画のねらい", "規模はカンテサンス案を上回り、借入・属人性のリスクを外す。利益の厚みは出店の積上げで作る")
rows = [["億円", "27/9期", "28/9期", "29/9期", "30/9期", "31/9期"]]
for name, d, nik in (("① 現状", S0, "ni"), ("② カンテサンス案", SA, "ni5"), ("③ 新計画", SN, "ni")):
    rows.append([f"{name}　売上高"] + [o(v) for v in d["rev"]])
    rows.append([f"{name}　営業利益"] + [o(v) for v in d["op"]])
    rows.append([f"{name}　純利益（帰属）"] + [o(v) for v in d[nik]])
st = {(i, None): dict(fill=BEIGE, bold=(i % 3 == 2)) for i in (7, 8, 9)}
table(s, 0.30, 1.20, [2.10, 0.62, 0.62, 0.62, 0.62, 0.62], [0.24] + [0.22] * 9, rows, size=7.0, styles=st)
cx = 5.85
callout(s, cx, 1.20, 3.85, 1.05, "規模：31/9期 売上58億円（②は48億円）",
        "TMの出店（9店で約34億円）とWineTechの成長で、カンテサンス案を上回る規模になる。VCの足切りに対しても説明しやすい。")
callout(s, cx, 2.33, 3.85, 1.05, "リスク：借入と属人性を外す",
        "LBO・連帯保証・アーンアウト・12月末の決済期限がなくなる。TMは標準化された業態のブランド展開で、シェフ個人に依存しない。")
callout(s, cx, 3.46, 3.85, 1.05, "課題：利益の厚み",
        "31/9期の営業利益は5.6億円（②は11.3億円）。TMの店舗営業利益率は7〜10%。1号店の実績、出店の上積み、直輸入ワインとCLUB送客で利益率を上げる。")
tb(s, 0.30, 3.50, 5.3, 1.2,
   [[("読み方", {"b": True, "sz": 7.5, "c": BLACK})],
    [("・②は三つ星1店の高い利益率（約50%）で、利益は大きいがシェフ個人と借入に依存。", {})],
    [("・③は27/9期の利益は①並みだが、28/9期から店舗とCLUBが積み上がる。", {})],
    [("・③の純利益は少数株主がいないためWineBankにすべて帰属（②は持分按分後）。", {})],
    [("・②の純利益は5億円調達時。10億円調達なら31/9期 5.6億円。", {})]], size=7.0, color=NAVY, space=1.2)
s.notes_slide.notes_text_frame.text = "2026/11/27 3案の推移。"

lst = pr.slides._sldIdLst
for el in list(lst)[:N_ORIG]:
    pr.part.drop_rel(el.get(R + "id")); lst.remove(el)
pr.save(OUT); print("saved", OUT, len(pr.slides))

# ───────── Excel
wb = openpyxl.Workbook(); B = Font(bold=True); HF = PatternFill("solid", fgColor="DDE4EE")
ws = wb.active; ws.title = "3案比較_推移"
ws.append(["3案比較（億円、WineBank決算期）"]); ws["A1"].font = Font(bold=True, size=12)
ws.append(["案・項目"] + yl)
for c in ws[2]: c.font = B; c.fill = HF
for name, d, nik in (("①現状", S0, "ni"), ("②カンテサンス案（シンプル版・12か月プロフォーマ）", SA, "ni5"), ("③新計画（直営）", SN, "ni")):
    for lab, k in (("売上高", "rev"), ("営業利益", "op"), ("純利益（帰属）", nik)):
        ws.append([f"{name} {lab}"] + [round(v / 100, 2) for v in d[k]])
ws.append([]); ws.append(["バリュエーション", "①現状", "②カンテサンス 5億", "②カンテサンス 10億", "③新計画 5億（現金取得）", "③新計画 5億（株式交換）"])
for c in ws[ws.max_row]: c.font = B; c.fill = HF
NX = C.R[("交換", 5.0)]
for lab, vals in (("1株価格（万円）", [45, 57, 57, C.px, C.px]), ("プレ", [26.1, 33.0, 33.0, round(C.pre_cash, 1), round(C.pre_xch, 1)]),
                  ("ポスト", ["", round(A5["post"], 1), round(A10["post"], 1), round(N5["post"], 1), round(NX["post"], 1)]),
                  ("上場時時価総額（PER20）", [round(mc0, 1), round(A5["mc"], 1), round(A10["mc"], 1), round(N5["mc"], 1), round(NX["mc"], 1)]),
                  ("投資倍率", ["", round(A5["mult"], 2), round(A10["mult"], 2), round(N5["mult"], 2), round(NX["mult"], 2)]),
                  ("借入", ["既存のみ", "みずほLBO15億＋連帯保証", "同左", "新規借入なし", "新規借入なし"])):
    ws.append([lab] + vals)
ws.column_dimensions["A"].width = 52
for col in "BCDEF": ws.column_dimensions[col].width = 22
w2 = wb.create_sheet("新計画_3か年")
w2.append(["新計画（直営）セグメント別（億円）"]); w2["A1"].font = Font(bold=True, size=12)
w2.append(["項目"] + yl)
for c in w2[2]: c.font = B; c.fill = HF
for r in rows_new if False else []: pass
for lab, vals in (("ワイン販売（EC・卸）", EC), ("WineTech（私募ファンド含む）", TECH), ("その他（テラス・賃貸・経営指導料）", OTH),
                  ("ワイナート 売上", SN["wi_r"]), ("新CLUB 売上", SN["cl_r"]), ("TM直営店 売上", SN["tm_r"]), ("連結 売上高", SN["rev"]),
                  ("WineBank本体 営業利益", SN["wb_o"]), ("ワイナート 営業利益", SN["wi_o"]), ("新CLUB 営業利益", SN["cl_o"]),
                  ("TM直営店 営業利益", SN["tm_o"]), ("直営シナジー", SN["syn"]), ("連結 営業利益", SN["op"]), ("当期純利益", SN["ni"])):
    w2.append([lab] + [round(v / 100, 2) for v in vals])
    if lab.startswith(("連結", "当期")): w2.cell(w2.max_row, 1).font = B
w2.column_dimensions["A"].width = 40
wb.save(XLS); print("saved", XLS)
