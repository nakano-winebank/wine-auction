# カンテサンス在庫と参照価格（楽天最安値ほか）の突合
import sys, json, re, unicodedata
from openpyxl import load_workbook
REFS, SRC, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
refs = json.load(open(REFS))
def n(s):
    s = unicodedata.normalize("NFKD", str(s)).encode("ascii", "ignore").decode().lower()
    s = s.replace("st-", "saint ").replace("st ", "saint ").replace("ste-", "sainte ")
    s = re.sub(r"\bvivan\b", "vivant", s)
    s = re.sub(r"montachet", "montrachet", s); s = re.sub(r"piligny", "puligny", s)
    s = re.sub(r"mazoyeres?", "mazoyeres", s); s = re.sub(r"\bmazy\b", "mazis", s)
    return re.sub(r"[^a-z0-9]+", " ", s).strip()
NOISE = set("""domaine dom de la le les du des d l et grand cru 1er premier rouge blanc monopole ml 750 aoc gc pc
 vin wine maison b red white brut chateau ch cl 75cl bottle""".split())
FIRST = set("armand georges christophe jacques frederic thibault comte comtes joseph jean louis henri emmanuel".split())
SPECIAL = {"D.R.C.": r"domaine de la romanee conti|\bdrc\b|\bd r c\b|romanee conti domaine",
           "Comte Liger-Belair": r"comte liger belair|comte liger|\bcomte de liger",
           "Georges Roumier": r"\broumier\b", "Christophe Roumier": r"\broumier\b",
           "Trapet(Jean Louis Trapet)": r"\btrapet\b", "Lambrays": r"lambrays",
           "Joseph Drouhin": r"drouhin", "Comtes Lafon": r"\blafon\b", "Baron Thenard": r"thenard"}
def prod_re(p):
    if p in SPECIAL: return SPECIAL[p]
    toks = [t for t in n(p).split() if t not in NOISE and t not in FIRST and len(t) > 1]
    if not toks: return None
    return r"\b" + r"\b.*\b".join(map(re.escape, toks)) + r"\b"
# 参照を年代ごとに索引
idx = {}
for r in refs:
    r["nn"] = n(r["name"]); idx.setdefault(r["vt"], []).append(r)
def cuvee_tokens(name): return {t for t in n(name).split() if t not in NOISE and not re.fullmatch(r"\d{4}", t)}
def rank(r):  # 新しい情報ほど優先
    s = r["src"]
    if s.startswith("r3"): return 0
    if "20261027" in s: return 1
    if s.startswith("r2"): return 2
    return 3
def match_one(name, prod, vt):
    ct = cuvee_tokens(name)
    pre = prod_re(prod)
    out = []
    for r in idx.get(vt, []):
        t = r["nn"]
        if pre:
            m = re.search(pre, t)
            if not m: continue
            rest = (t[:m.start()] + " " + t[m.end():])
        else:
            rest = t
        rt = {x for x in rest.split() if x not in NOISE and not re.fullmatch(r"\d{4}", x) and x not in FIRST}
        if not ct or not ct <= rt: continue
        extra = rt - ct - set(n(prod).split())
        if extra: continue
        out.append(r)
    return out
src = load_workbook(SRC, data_only=True, read_only=True)["月間在庫管理表"]
num = lambda v: v if isinstance(v, (int, float)) else 0
items = []
for r in src.iter_rows(min_row=26, values_only=True):
    name, cat = r[9], r[5]
    q = num(r[11]) + num(r[12])
    if not isinstance(name, str) or not name.strip() or cat in (None, "ソフトドリンク") or q <= 0: continue
    vt = r[8] if isinstance(r[8], int) else ("NV" if str(r[8]).strip().upper() in ("S.A.", "NV", "N.V.") else None)
    items.append(dict(name=name.strip(), prod=str(r[10] or ""), vt=vt, cat=cat, q=q, cost=num(r[15])))
res = []
for x in items:
    hit = match_one(x["name"], x["prod"], x["vt"]) if x["vt"] else []
    how = "同年" 
    if not hit and isinstance(x["vt"], int):
        for d in (1, -1, 2, -2, 3, -3):
            hit = match_one(x["name"], x["prod"], x["vt"] + d)
            if hit: how = f"近接年{x['vt']+d}"; break
    rk = [h for h in hit if h["rk"]]
    best = None
    if rk:
        top = min(rank(h) for h in rk)
        cand = [h for h in rk if rank(h) == top]
        best = min(cand, key=lambda h: h["rk"])
    ad = [h["adopt"] for h in hit if h.get("adopt")]
    tl = [h["tl"] for h in hit if h.get("tl")]
    res.append(dict(x, how=how if hit else "", rk=best["rk"] if best else None, rk_src=best["src"] if best else "",
                    rk_name=best["name"] if best else "", rk_dt=best.get("dt") if best else None,
                    adopt=min(ad) if ad else None, toplot=max(tl) if tl else None, nhit=len(hit)))
json.dump(res, open(OUT, "w"), ensure_ascii=False)
tot = sum(r["q"] * r["cost"] for r in res)
m = [r for r in res if r["rk"] or r["adopt"]]
print("items", len(res), "matched", len(m), "cost cover", round(sum(r["q"] * r["cost"] for r in m) / tot, 3))
print("same-year", sum(1 for r in m if r["how"] == "同年"), "near", sum(1 for r in m if r["how"].startswith("近接")))

# ---- 外れ値の除外と、生産者倍率による推定 ----
import statistics as st
CAP = 8.0
for r in res:
    p = r["rk"] or r["adopt"]
    r["ratio"] = (p / 1.1 / r["cost"]) if (p and r["cost"]) else None
    r["tier"] = ("A" if r["how"] == "同年" else "B") if r["ratio"] else ""
    if r["ratio"] and r["ratio"] > CAP: r["tier"] = "X"   # 要確認：使わない
by = {}
for r in res:
    if r["tier"] in ("A", "B"): by.setdefault(r["prod"], []).append(r["ratio"])
pq = {k: (st.quantiles(v, n=4)[0] if len(v) >= 4 else min(v), len(v)) for k, v in by.items() if len(v) >= 3}
for r in res:
    if r["tier"] in ("", "X") and r["prod"] in pq and r["cost"]:
        r["est_ratio"], r["est_n"] = round(max(1.0, pq[r["prod"]][0]), 2), pq[r["prod"]][1]
        r["tier"] = "C" if r["tier"] == "" else "XC"
json.dump(res, open(OUT, "w"), ensure_ascii=False)
from collections import Counter
print(Counter(r["tier"] for r in res))
print({k: round(v[0], 2) for k, v in sorted(pq.items(), key=lambda kv: -kv[1][1])[:15]})
