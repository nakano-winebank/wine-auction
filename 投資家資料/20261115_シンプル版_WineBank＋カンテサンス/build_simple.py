# -*- coding: utf-8 -*-
"""シンプル版の5か年計画・資本政策（2026/11/15）。

HIRAC岡田様のご指摘（2026/11/14）を受け、事業計画を「WineBank＋カンテサンス」だけに絞る。
アピシウス・ティエリーマルクス・レストラン運営（WineBankと資本関係のない関連会社）は Appendix の「将来の合流シナリオ」に回す（今回のプレバリューには加えない）。
モデルは ../20261114_5か年計画_資本政策/build_plan5.py をそのまま使い、見せ方だけを変える。

使い方: python3 build_simple.py <出力xlsx>
"""
import os
import sys

import openpyxl
from openpyxl.styles import Font
from openpyxl.utils import get_column_letter as CL

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "20261114_5か年計画_資本政策"))
import build_plan5 as bp  # noqa: E402

N = bp.N
hdr, body, title = bp.hdr, bp.body, bp.title
NAVY, COPPER, SAND, BEIGE, FONT, NUM1, NUM0 = bp.NAVY, bp.COPPER, bp.SAND, bp.BEIGE, bp.FONT, bp.NUM1, bp.NUM0
GREY = "595959"


def note(ws, r, text):
    ws.cell(row=r, column=1, value=text).font = Font(name=FONT, size=9, color=GREY)


def main(path):
    m = bp.build()
    v = bp.valuation(m)
    cap = bp.cap_table(v["pre2"])
    E = {e["key"]: e for e in m["entities"]}
    SG = {s["name"]: s for s in m["segments"]}
    wb = openpyxl.Workbook()

    # ── 1. 5か年計画（WineBank＋カンテサンス） ──
    ws = wb.active
    ws.title = "5か年計画"
    title(ws, "5か年計画（WineBank＋カンテサンス）　単位：百万円",
          "年度＝WineBank決算期（10月〜翌9月）。カンテサンスは期初取得を仮定したプロフォーマ。青字＝入力値・経営判断による修正値。")
    r = 4
    for j, h in enumerate(["区分", "項目"] + [f"{y}\n{p}" for y, p in zip(m["years"], m["period"])], 1):
        hdr(ws.cell(row=r, column=j, value=h))
    ws.row_dimensions[r].height = 32
    rows = {}

    def line(key, a, b, vals=None, formula=None, bold=False, fill=None, color=None, blue=None, fmt=NUM1):
        nonlocal r
        r += 1
        body(ws.cell(row=r, column=1, value=a), bold=bold, fill=fill, color=color)
        body(ws.cell(row=r, column=2, value=b), bold=bold, fill=fill, color=color)
        for i in range(N):
            val = formula(CL(3 + i)) if formula else round(vals[i], 1)
            body(ws.cell(row=r, column=3 + i, value=val), fmt=fmt, bold=bold, fill=fill, color=color,
                 blue=bool(blue and blue[i]))
        rows[key] = r

    line("w1", "WineBank", "ワイン販売（卸・EC・店舗） 売上高", E["wb_base"]["rev"])
    line("w2", "WineBank", "私募ファンド・オークション 売上高", E["wb_fund"]["rev"])
    line("w3", "WineBank", "ワインマイル 売上高", E["wb_mile"]["rev"])
    line("wr", "WineBank", "売上高 計", formula=lambda c: f"=SUM({c}{rows['w1']}:{c}{rows['w3']})", bold=True, fill=SAND)
    line("wo", "WineBank", "営業利益", SG["ワイン・WineTech"]["op"], bold=True, fill=SAND,
         blue=SG["ワイン・WineTech"]["overridden"])
    line("q1", "カンテサンス", "既存本店 売上高", E["quint"]["rev"])
    line("q2", "カンテサンス", "新規事業 売上高", E["quint_new"]["rev"])
    line("qr", "カンテサンス", "売上高 計", formula=lambda c: f"={c}{rows['q1']}+{c}{rows['q2']}", bold=True, fill=SAND)
    line("q3", "カンテサンス", "既存本店 営業利益", E["quint"]["op"])
    line("q4", "カンテサンス", "新規事業 営業利益", E["quint_new"]["op"])
    line("qo", "カンテサンス", "営業利益 計", formula=lambda c: f"={c}{rows['q3']}+{c}{rows['q4']}", bold=True, fill=SAND)
    r += 1
    line("tr", "連結", "売上高", formula=lambda c: f"={c}{rows['wr']}+{c}{rows['qr']}", bold=True, fill=NAVY,
         color="FFFFFF")
    line("to", "連結", "営業利益", formula=lambda c: f"={c}{rows['wo']}+{c}{rows['qo']}", bold=True, fill=NAVY,
         color="FFFFFF")
    line("tm", "連結", "営業利益率", formula=lambda c: f"={c}{rows['to']}/{c}{rows['tr']}", fmt="0.0%")
    r += 2
    body(ws.cell(row=r, column=1, value="本ラウンドとカンテサンス持分"), bold=True, fill=SAND)
    body(ws.cell(row=r, column=2, value="調達額の一部を買収SPCに出資し、持分を高める"), fill=SAND)
    for j, h in ((3, "出資前"), (4, "調達5億円"), (5, "調達10億円")):
        hdr(ws.cell(row=r, column=j, value=h))
    prm = {}
    for lab, key, val, fmt in (("充当率（調達額のうちSPCへの出資に充てる割合）", "alloc", bp.ALLOC, "0%"),
                               ("SPCのエクイティ総額（億円）", "inv", bp.SPC_INV, NUM1),
                               ("出資前のWineBank持分（LBOローンの保証・組成・運営による）", "base", bp.BASE_OWN, "0%")):
        r += 1
        body(ws.cell(row=r, column=1, value=lab))
        body(ws.cell(row=r, column=3, value=val), fmt=fmt, blue=True)
        prm[key] = f"$C${r}"
    r += 1
    body(ws.cell(row=r, column=1, value="本ラウンドの調達額（億円）"), bold=True)
    body(ws.cell(row=r, column=3, value=0), fmt=NUM1)
    for j, (_, rnd) in zip((4, 5), bp.ROUNDS):
        body(ws.cell(row=r, column=j, value=rnd), fmt=NUM1, blue=True, bold=True)
    round_row = r
    r += 1
    body(ws.cell(row=r, column=1, value="WineBankのSPCへの出資（億円）"))
    for j in (3, 4, 5):
        body(ws.cell(row=r, column=j, value=f"=MIN({CL(j)}{round_row}*{prm['alloc']},{prm['inv']})"), fmt=NUM1)
    buy_row = r
    r += 1
    body(ws.cell(row=r, column=1, value="外部投資家様の出資（億円）"))
    for j in (3, 4, 5):
        body(ws.cell(row=r, column=j, value=f"={prm['inv']}-{CL(j)}{buy_row}"), fmt=NUM1)
    r += 1
    body(ws.cell(row=r, column=1, value="WineBankのカンテサンス持分"), bold=True)
    for j in (3, 4, 5):
        body(ws.cell(row=r, column=j, value=f"={prm['base']}+(1-{prm['base']})*{CL(j)}{buy_row}/{prm['inv']}"),
             fmt="0.0%", bold=True, fill=BEIGE)
    own_row = r
    r += 2
    for scol, slab in (("D", "調達5億円"), ("E", "調達10億円")):
        line(f"att_{scol}", f"持分按分後（{slab}）", "営業利益",
             formula=lambda c, s=scol: f"={c}{rows['wo']}+{c}{rows['qo']}*${s}${own_row}", bold=True, fill=BEIGE)
    for skey, slab in (("r5", "調達5億円"), ("r10", "調達10億円")):
        line(f"ni_{skey}", f"持分按分後（{slab}）", "当期純利益（目安）", m["scn"][skey]["p2"]["attrib_ni"], fill=BEIGE)
    r += 2
    for t in [
        "WineBankの営業利益：2026〜2029年度は経営判断による修正値（青字）、2030年度はモデル値。",
        "カンテサンス：既存本店はIM計画、新規事業はガトー・オ・コンテの拡大、一品スイーツ店（2028年1月から毎年1店舗）、"
        "ワインショップ・バー（2030年1月〜）。買収SPCの出資者様にお示ししている計画と同じ。",
        "当期純利益（目安）：カンテサンスは合併後の会社の純利益（LBOの金利・外部投資家様への年3%・AM報酬・後継料理長・法人税、"
        "成長対価分の追加借入の金利を控除後）×持分。WineBankは営業利益×(1−34%)。WineBank本体の支払利息・のれん償却は含まない。",
        "アピシウス・ティエリーマルクス・レストラン運営（WineBankと資本関係のない関連会社）は含まない。「Appendix_将来の合流シナリオ」を参照。",
        "月次の計画（WineBankの事業別とカンテサンス）は別途作成する。"]:
        note(ws, r, t)
        r += 1
    ws.column_dimensions["A"].width = 30
    ws.column_dimensions["B"].width = 34
    for j in range(3, 8):
        ws.column_dimensions[CL(j)].width = 15
    ws.freeze_panes = "C5"
    plan = ws.title

    # ── 2. 取得スキーム ──
    ws = wb.create_sheet("取得スキーム")
    title(ws, "カンテサンス取得のスキームと資金計画　単位：億円",
          "買収SPCが株式を取得する。WineBankの持分（51%→64%／77%）は、SPCに対する持分。")
    r = 4
    for j, h in enumerate(["時期", "支払い", "資金の出し手", "金額", "備考"], 1):
        hdr(ws.cell(row=r, column=j, value=h))
    data = [
        ("2026年12月末（決済）", 35, "みずほ銀行 LBOローン", 15, "借入人はSPC。5年・元金均等、金利4%（協議中）。WineBankが連帯保証"),
        ("", None, "対象会社の現預金", 20, "決済日に対象会社からSPCへ貸付、合併で相殺（銀行・税理士と協議中）"),
        ("2027年3月末（残金）", 15, "エクイティ：WineBankの出資", None, "本ラウンド調達額の80%（5億円なら4億円、10億円なら8億円）"),
        ("", None, "エクイティ：外部投資家様の出資", None, "15億円からWineBankの出資を引いた額（11億円／7億円）"),
        ("基礎金額 計", 50, "", 50, ""),
        ("2029年末（アーンアウト）", 5, "追加対価", 5, "勤務・業績に連動しない。会社資金で支払い、同額を追加借入"),
        ("", 2.4, "成長対価（売主様と調整中）", 1.8,
         "2029年12月期の既存事業の営業利益がIM計画5.98億円以上の場合。仲介手数料の減額0.6億円を引いた実質負担は1.8億円"),
    ]
    for a, pay, src, amt, memo in data:
        r += 1
        tot = a.startswith("基礎金額")
        body(ws.cell(row=r, column=1, value=a), bold=True, fill=SAND if tot else None)
        body(ws.cell(row=r, column=2, value=pay), fmt=NUM1, bold=tot, fill=SAND if tot else None)
        body(ws.cell(row=r, column=3, value=src), fill=SAND if tot else None)
        body(ws.cell(row=r, column=4, value=amt), fmt=NUM1, bold=tot, fill=SAND if tot else None)
        body(ws.cell(row=r, column=5, value=memo), fill=SAND if tot else None)
    r += 2
    for t in ["みずほ銀行の融資は総額15億円（LBOローン）。3月分のつなぎ融資は想定しない。",
              "みずほ銀行は、3月のエクイティ15億円の確度を重視している（エクイティファースト）。"
              "融資の実行は、エクイティと同時、またはエクイティの確度を審査で確認できることが前提（審査の時期は12月上旬〜中旬）。",
              "みずほ銀行は、WineBank側が過半（51%）を持つスキームを承諾済み。残り49%は外部投資家様の出資。",
              "岸田シェフは3年間在籍し、後継の料理長を育成する。決済後にSPCと対象会社を合併する（対象会社を存続会社とする方向で協議中）。"]:
        note(ws, r, t)
        r += 1
    for j, w in zip(range(1, 6), (24, 10, 32, 10, 90)):
        ws.column_dimensions[CL(j)].width = w

    # ── 3. プレバリュー・資本政策 ──
    ws = wb.create_sheet("プレバリュー・資本政策")
    title(ws, "プレバリューと資本政策（WineBank＋カンテサンス）", "プレバリュー33億円は目線。青字を変えると再計算される。")
    r = 4
    for j, h in enumerate(["項目", "金額（億円）", "考え方"], 1):
        hdr(ws.cell(row=r, column=j, value=h))
    r += 1
    body(ws.cell(row=r, column=1, value="WineBank単体"))
    body(ws.cell(row=r, column=2, value=v["wb"]), fmt=NUM1, blue=True)
    body(ws.cell(row=r, column=3, value="2026年1月ラウンドのポストバリュー26.1億円（1株45万円）と同じ評価"))
    ra = r
    r += 1
    body(ws.cell(row=r, column=1, value="カンテサンス持分"))
    body(ws.cell(row=r, column=2, value=v["quint"]), fmt=NUM1, blue=True)
    body(ws.cell(row=r, column=3,
                 value=f"出資前の持分51%で、2031年末に売却した場合にWineBankに帰属する株式価値の増加{v['quint_exit']:.1f}億円を、"
                       f"割引率25%・5年で現在価値にした額（20%なら{v['quint_pv'][0.20]:.1f}、30%なら{v['quint_pv'][0.30]:.1f}）"))
    rb = r
    r += 1
    body(ws.cell(row=r, column=1, value="プレバリュー"), bold=True, fill=COPPER, color="FFFFFF")
    body(ws.cell(row=r, column=2, value=f"=B{ra}+B{rb}"), fmt=NUM1, bold=True, fill=COPPER, color="FFFFFF")
    pre_r = r
    fd0 = cap["fd"]
    r += 1
    body(ws.cell(row=r, column=1, value="1株価格（円、1万円単位）"), bold=True)
    body(ws.cell(row=r, column=2, value=f"=ROUND(B{pre_r}*100000000/{fd0}/10000,0)*10000"), fmt=NUM0, bold=True,
         fill=BEIGE)
    body(ws.cell(row=r, column=3, value=f"プレバリュー÷潜在株式込み{fd0:,}株"))
    pps = r
    r += 1
    body(ws.cell(row=r, column=1, value="前回ラウンド（45万円）比"))
    body(ws.cell(row=r, column=2, value=f"=B{pps}/{bp.LAST_PRICE}"), fmt='0.00"倍"')
    r += 1
    body(ws.cell(row=r, column=1, value="上場時のPER（倍）"))
    body(ws.cell(row=r, column=2, value=20), fmt=NUM0, blue=True)
    per = r
    r += 2
    heads = ["株主", "現状 発行済", "現状 潜在込み", "比率", "調達5億 後", "比率", "調達10億 後", "比率"]
    for j, h in enumerate(heads, 1):
        hdr(ws.cell(row=r, column=j, value=h))
    hr = r
    first = r + 1
    holders = list(bp.CAP) + [("本ラウンドの投資家様", 0, 0)]
    for k, (nm, sh, so) in enumerate(holders):
        r += 1
        new = k == len(holders) - 1
        body(ws.cell(row=r, column=1, value=nm), bold=new)
        body(ws.cell(row=r, column=2, value=sh), fmt=NUM0, blue=True)
        body(ws.cell(row=r, column=3, value=f"=B{r}+{so}"), fmt=NUM0)
        for col, rc in ((5, "D"), (7, "E")):
            add = f"+ROUND('{plan}'!{rc}{round_row}*100000000/$B${pps},0)" if new else ""
            body(ws.cell(row=r, column=col, value=f"=C{r}{add}"), fmt=NUM0)
    last = r
    r += 1
    body(ws.cell(row=r, column=1, value="合計"), bold=True, fill=SAND)
    for j in (2, 3, 5, 7):
        body(ws.cell(row=r, column=j, value=f"=SUM({CL(j)}{first}:{CL(j)}{last})"), fmt=NUM0, bold=True, fill=SAND)
    tot = r
    for rr in range(first, last + 1):
        for s_, d_ in ((3, 4), (5, 6), (7, 8)):
            body(ws.cell(row=rr, column=d_, value=f"={CL(s_)}{rr}/{CL(s_)}{tot}"), fmt="0.0%")
    r += 2
    cols = [(5, "調達5億円", "r5", "D"), (7, "調達10億円", "r10", "E")]
    for c_, lab, _, _ in cols:
        hdr(ws.cell(row=r, column=c_, value=lab))
    r += 1
    body(ws.cell(row=r, column=1, value="ポストバリュー（億円）"))
    for c_, _, _, _ in cols:
        body(ws.cell(row=r, column=c_, value=f"={CL(c_)}{tot}*$B${pps}/100000000"), fmt=NUM1, bold=True)
    post = r
    r += 1
    body(ws.cell(row=r, column=1, value="WineBankのカンテサンス持分"))
    for c_, _, _, rc in cols:
        body(ws.cell(row=r, column=c_, value=f"='{plan}'!{rc}{own_row}"), fmt="0.0%")
    r += 1
    body(ws.cell(row=r, column=1, value="2030年度 持分按分後 当期純利益（億円）"))
    for c_, _, sk, _ in cols:
        body(ws.cell(row=r, column=c_, value=round(m["scn"][sk]["p2"]["attrib_ni"][4] / 100, 2)), fmt="0.00")
    ni = r
    r += 1
    body(ws.cell(row=r, column=1, value="上場時の時価総額（億円）＝純利益×PER"))
    for c_, _, _, _ in cols:
        body(ws.cell(row=r, column=c_, value=f"={CL(c_)}{ni}*$B${per}"), fmt=NUM1, bold=True)
    mc = r
    r += 1
    body(ws.cell(row=r, column=1, value="本ラウンドの投資倍率"))
    for c_, _, _, _ in cols:
        body(ws.cell(row=r, column=c_, value=f"={CL(c_)}{mc}/{CL(c_)}{post}"), fmt='0.00"倍"', bold=True, fill=BEIGE)
    r += 2
    ws.cell(row=r, column=1, value="検証：上場時の価値からの逆算（2030年度の持分按分後純利益×PER÷(1+目標利回り)^4.5−調達額）").font = \
        Font(name=FONT, bold=True, size=10)
    r += 1
    vch = [("15_25", "PER15倍・年25%"), ("20_25", "PER20倍・年25%"), ("15_30", "PER15倍・年30%"), ("20_30", "PER20倍・年30%")]
    for j, h in enumerate(["ケース", "2030年度 純利益"] + [h for _, h in vch], 1):
        hdr(ws.cell(row=r, column=j, value=h))
    for sk, rnd in bp.ROUNDS:
        r += 1
        body(ws.cell(row=r, column=1, value=f"調達{rnd:.0f}億円"), bold=True)
        body(ws.cell(row=r, column=2, value=round(m["scn"][sk]["p2"]["attrib_ni"][4] / 100, 2)), fmt="0.00")
        for j, (k, _) in enumerate(vch):
            body(ws.cell(row=r, column=3 + j, value=round(v["vc"][f"{sk}_p2"][k], 1)), fmt=NUM1)
    r += 2
    for t in ["上場時の時価総額は、公募増資・SOの追加付与による希薄化を含まない概算。",
              "調達額は「5か年計画」シートの青字（調達5億円・10億円）を変えると、株数・持株比率・持分が再計算される。純利益は値。",
              "SO（潜在株）は2026年1月時点の付与分。上場までに追加のSOプール（潜在株10%程度）の設定を検討。"]:
        note(ws, r, t)
        r += 1
    ws.column_dimensions["A"].width = 44
    ws.column_dimensions["B"].width = 16
    ws.column_dimensions["C"].width = 16
    for j in range(4, 9):
        ws.column_dimensions[CL(j)].width = 16
    ws.freeze_panes = ws.cell(row=hr + 1, column=2)
    cap_sheet = ws.title

    # ── 4. Appendix：統合オプション ──
    ws = wb.create_sheet("Appendix_将来の合流シナリオ")
    title(ws, "Appendix：関連会社の将来の合流シナリオ（今回の計画・プレバリューには含めていない）",
          "アピシウス・ティエリーマルクス・レストラン運営は、現在WineBankと資本関係がない。単位：百万円（評価額は億円）")
    r = 4
    for j, h in enumerate(["会社", "合流を想定する持分"] + [f"{y} 売上" for y in m["years"]] + [f"{y} 営業利益" for y in m["years"]]
                          + ["（参考）持分の評価額（億円）", "評価の考え方"], 1):
        hdr(ws.cell(row=r, column=j, value=h))
    ws.row_dimensions[r].height = 30
    items = [("アピシウス", "アピシウス", 0.7, v["reorg"]["apicius"],
              f"営業利益1.3億円×6.2倍×70%＝{v['apicius_op']:.1f}億円＋純資産5.18億円×70%＝{v['apicius_nav']:.1f}億円"
              "（ワイン在庫の含み益は含まない）"),
             ("Brasserie Thierry Marx", "ブラッスリー", 0.667, v["reorg"]["tm"], "2026年11月の第三者割当の株価（1株16万円）×66.7%"),
             ("レストラン運営（グループ各社）", "レストラン運営", 0.6, v["reorg"]["rest"], "営業利益1億円（5年横ばい）×4倍×60%")]
    f0 = r + 1
    for nm, sg, own, val, memo in items:
        r += 1
        body(ws.cell(row=r, column=1, value=nm), bold=True)
        body(ws.cell(row=r, column=2, value=own), fmt="0.0%")
        for i in range(N):
            body(ws.cell(row=r, column=3 + i, value=round(SG[sg]["rev"][i], 1)), fmt=NUM1)
            body(ws.cell(row=r, column=8 + i, value=round(SG[sg]["op"][i], 1)), fmt=NUM1, fill=SAND)
        body(ws.cell(row=r, column=13, value=round(val, 1)), fmt=NUM1, blue=True)
        body(ws.cell(row=r, column=14, value=memo))
    l0 = r
    r += 1
    body(ws.cell(row=r, column=1, value="関連会社 計"), bold=True, fill=SAND)
    for j in range(3, 14):
        body(ws.cell(row=r, column=j, value=f"=SUM({CL(j)}{f0}:{CL(j)}{l0})"), fmt=NUM1, bold=True, fill=SAND)
    sum_r = r
    r += 2
    body(ws.cell(row=r, column=1, value="合流した場合の連結 売上高"), bold=True)
    for i in range(N):
        body(ws.cell(row=r, column=3 + i, value=f"='{plan}'!{CL(3 + i)}{rows['tr']}+{CL(3 + i)}{sum_r}"), fmt=NUM1, bold=True)
    r += 1
    body(ws.cell(row=r, column=1, value="合流した場合の連結 営業利益"), bold=True)
    for i in range(N):
        body(ws.cell(row=r, column=3 + i, value=f"='{plan}'!{CL(3 + i)}{rows['to']}+{CL(8 + i)}{sum_r}"), fmt=NUM1, bold=True)
    r += 2
    body(ws.cell(row=r, column=1, value="（参考）現時点の評価で合流した場合のプレバリュー（億円）"), bold=True)
    body(ws.cell(row=r, column=3, value=f"='{cap_sheet}'!B{pre_r}+M{sum_r}"), fmt=NUM1, bold=True, fill=BEIGE)
    r += 1
    body(ws.cell(row=r, column=1, value="（参考）その場合に株式交換で発行する株式（株）"), bold=True)
    body(ws.cell(row=r, column=3, value=f"=ROUND(M{sum_r}*100000000/'{cap_sheet}'!B{pps},0)"), fmt=NUM0, bold=True, fill=BEIGE)
    r += 2
    for t in ["今回の増資は、WineBank＋カンテサンスの計画と評価（プレバリュー33億円）で行う。関連会社の評価は、今回のプレバリューに加えない。",
              "合流は株式交換を想定しており、追加の資金調達は不要。交換比率は、合流する時点の評価で決める（上の評価額は現時点の参考値）。",
              "合流の時期は、上場に向けて規模が必要な段階で、株主の皆様と協議のうえ判断する。"]:
        note(ws, r, t)
        r += 1
    ws.column_dimensions["A"].width = 34
    for j in range(2, 14):
        ws.column_dimensions[CL(j)].width = 12
    ws.column_dimensions["N"].width = 90

    # ── 5. 前提 ──
    ws = wb.create_sheet("前提・出所")
    title(ws, "各事業の前提と出所")
    r = 3
    for j, h in enumerate(["事業", "決算月", "前提・出所"], 1):
        hdr(ws.cell(row=r, column=j, value=h))
    for e in m["entities"]:
        r += 1
        body(ws.cell(row=r, column=1, value=e["name"]), bold=True)
        body(ws.cell(row=r, column=2, value=f"{e['fy']}月"))
        body(ws.cell(row=r, column=3, value=e["src"]))
    ws.column_dimensions["A"].width = 36
    ws.column_dimensions["B"].width = 8
    ws.column_dimensions["C"].width = 130
    wb.save(path)
    print("saved", path)


if __name__ == "__main__":
    main(sys.argv[1])
