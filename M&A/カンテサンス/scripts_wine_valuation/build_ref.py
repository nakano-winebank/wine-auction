# 3つのスプレッドシートから楽天最安値などの参照価格を集める
import sys, os, json, re, datetime
from openpyxl import load_workbook
D = sys.argv[1]; OUT = sys.argv[2]
num = lambda v: float(v) if isinstance(v, (int, float)) and v > 0 else None
refs = []
def vint(v, name):
    if isinstance(v, (int, float)) and 1900 < v < 2100: return int(v)
    if isinstance(v, str) and v.strip()[:4].isdigit(): return int(v.strip()[:4])
    m = re.match(r"\s*(\d{4})\s", name or "")
    if m: return int(m.group(1))
    if re.match(r"\s*NV\b", name or "", re.I) or (isinstance(v, str) and v.strip().upper() == "NV"): return "NV"
    return None
# r1 / r2: 標準レイアウト
for f, hdr in (("r1.xlsx", 1), ("r2.xlsx", 8)):
    wb = load_workbook(os.path.join(D, f), read_only=True, data_only=True)
    for ws in wb.worksheets:
        rows = ws.iter_rows(values_only=True)
        h = None
        for i, r in enumerate(rows):
            if i == hdr:
                h = [str(x).replace("\n", "") if x is not None else "" for x in r]; break
        if not h or "ワイン名" not in h: continue
        ci = lambda key: next((j for j, x in enumerate(h) if x.startswith(key)), None)
        cn, cr, crx, ctl, cdt = h.index("ワイン名"), ci("楽天最安（税込）"), ci("楽天最安（税抜）"), ci("TOPLOT落札額") or ci("落札価格"), ci("データ取得日")
        for r in rows:
            r = list(r) + [None] * 80
            name = r[cn]
            if not isinstance(name, str) or len(name) < 6: continue
            rk = num(r[cr]) if cr is not None else None
            if rk is None and num(r[6]) and "楽天" in h[6]: rk = num(r[6])
            tl = num(r[ctl]) if ctl is not None else None
            if not rk and not tl: continue
            dt = r[cdt] if cdt is not None else None
            dt = dt.strftime("%Y-%m-%d") if isinstance(dt, (datetime.date, datetime.datetime)) else None
            refs.append(dict(src=f"{f[:2]}:{ws.title}", name=name.strip(), vt=vint(r[cn + 1], name), rk=rk, tl=tl, adopt=None, adopt_src=None, dt=dt))
# r3: 時価比較
wb = load_workbook(os.path.join(D, "r3.xlsx"), read_only=True, data_only=True)
for i, r in enumerate(wb["時価比較"].iter_rows(values_only=True)):
    if i == 0: continue
    name = r[0]
    if not isinstance(name, str): continue
    refs.append(dict(src="r3:時価比較(2610)", name=name.strip(), vt=vint(None, name), rk=num(r[6]), tl=None, adopt=num(r[13]), adopt_src=r[14], dt="2026-10"))
json.dump(refs, open(OUT, "w"), ensure_ascii=False)
from collections import Counter
print(len(refs), Counter(x["src"] for x in refs).most_common(50))
