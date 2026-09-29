#!/usr/bin/env python3
"""上場企業の買収候補スクリーニング。

EDINET API v2 から有価証券報告書の「大株主の状況」を取得し、
JPX の上場銘柄一覧と株価データに結合して、支配権を取れる候補を絞る。

  1) filings : 期間内の有報一覧を取得（証券コード + docID）
  2) holders : 各有報から大株主の状況を抽出
  3) merge   : 業種・市場区分・株価と結合して条件で絞る

EDINET API v2 は Subscription-Key が必須（無料）。
  https://api.edinet-fsa.go.jp/ で取得し EDINET_API_KEY に設定する。

注意: Claude Code on the web の環境では egress ポリシーで EDINET/JPX が
ブロックされる。クライアント側の環境で実行すること。
"""
import argparse
import csv
import io
import os
import re
import sys
import time
import zipfile
from datetime import date, timedelta
from html.parser import HTMLParser
from urllib.parse import urlencode
from urllib.request import Request, urlopen

API = "https://api.edinet-fsa.go.jp/api/v2"
DOCTYPE_ANNUAL = "120"          # 有価証券報告書
UA = "listed-ma-screen/1.0"


def _key():
    k = os.environ.get("EDINET_API_KEY", "").strip()
    if not k:
        sys.exit("EDINET_API_KEY が未設定です。https://api.edinet-fsa.go.jp/ で無料取得してください。")
    return k


def _get(path, params=None, binary=False, retries=3):
    q = dict(params or {})
    q["Subscription-Key"] = _key()
    url = f"{API}/{path}?{urlencode(q)}"
    for attempt in range(retries):
        try:
            with urlopen(Request(url, headers={"User-Agent": UA}), timeout=60) as r:
                return r.read() if binary else r.read().decode("utf-8")
        except Exception as e:                                  # noqa: BLE001
            if attempt == retries - 1:
                raise
            time.sleep(2 ** attempt)
            print(f"  retry {attempt + 1}: {e}", file=sys.stderr)
    return None


# ---------------------------------------------------------------- 1) filings

def cmd_filings(a):
    import json
    d0 = date.fromisoformat(a.date_from)
    d1 = date.fromisoformat(a.date_to)
    rows, day = [], d0
    while day <= d1:
        try:
            meta = json.loads(_get("documents.json", {"date": day.isoformat(), "type": "2"}))
        except Exception as e:                                  # noqa: BLE001
            print(f"{day}: 取得失敗 {e}", file=sys.stderr)
            day += timedelta(days=1)
            continue
        for r in meta.get("results", []):
            if r.get("docTypeCode") != DOCTYPE_ANNUAL:
                continue
            if not r.get("secCode"):                            # 上場会社のみ
                continue
            rows.append({
                "secCode": r["secCode"][:4],                    # 5桁→4桁コード
                "edinetCode": r.get("edinetCode", ""),
                "filerName": r.get("filerName", ""),
                "docID": r.get("docID", ""),
                "periodEnd": r.get("periodEnd", ""),
                "submitDate": r.get("submitDateTime", "")[:10],
            })
        print(f"{day}: 累計 {len(rows)} 件", file=sys.stderr)
        day += timedelta(days=1)
        time.sleep(0.3)

    # 同一銘柄は提出日が新しいものを残す
    latest = {}
    for r in sorted(rows, key=lambda x: x["submitDate"]):
        latest[r["secCode"]] = r
    _write_csv(a.out, sorted(latest.values(), key=lambda x: x["secCode"]))
    print(f"→ {a.out} に {len(latest)} 銘柄", file=sys.stderr)


# ---------------------------------------------------------------- 2) holders

class _Table(HTMLParser):
    """最初に現れる表を行×セルの2次元配列として取り出す。"""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.rows, self._row, self._cell, self._in = [], None, None, False

    def handle_starttag(self, tag, attrs):
        if tag == "tr":
            self._row = []
        elif tag in ("td", "th"):
            self._cell, self._in = [], True

    def handle_endtag(self, tag):
        if tag == "tr" and self._row is not None:
            if any(c.strip() for c in self._row):
                self.rows.append(self._row)
            self._row = None
        elif tag in ("td", "th") and self._in:
            text = re.sub(r"\s+", " ", "".join(self._cell)).strip()
            if self._row is not None:
                self._row.append(text)
            self._cell, self._in = None, False

    def handle_data(self, data):
        if self._in and self._cell is not None:
            self._cell.append(data)


_PCT = re.compile(r"(\d+(?:\.\d+)?)\s*%?$")


def _to_pct(s):
    s = s.replace(",", "").replace("△", "-").strip()
    m = _PCT.search(s)
    if not m:
        return None
    v = float(m.group(1))
    return v if 0 <= v <= 100 else None


def _parse_major_holders(html):
    """大株主の状況のHTMLから [(株主名, 所有割合%)] を返す。"""
    p = _Table()
    p.feed(html)
    out = []
    for row in p.rows:
        if len(row) < 2:
            continue
        name = row[0].strip()
        if not name or name in ("氏名又は名称", "計", "合計"):
            continue
        if re.fullmatch(r"[-－—\s]*", name):
            continue
        # 右端から順に「割合らしい数値」を探す（列構成は会社ごとに違う）
        pct = None
        for cell in reversed(row[1:]):
            pct = _to_pct(cell)
            if pct is not None:
                break
        if pct is not None:
            out.append((name, pct))
    return out[:10]


def cmd_holders(a):
    filings = list(_read_csv(a.filings))
    rows = []
    for i, f in enumerate(filings, 1):
        code, did = f["secCode"], f["docID"]
        print(f"[{i}/{len(filings)}] {code} {f['filerName']}", file=sys.stderr)
        try:
            blob = _get(f"documents/{did}", {"type": "5"}, binary=True)
            html = _extract_shareholder_block(blob)
        except Exception as e:                                  # noqa: BLE001
            print(f"  失敗: {e}", file=sys.stderr)
            html = None
        holders = _parse_major_holders(html) if html else []
        rec = {
            "secCode": code, "filerName": f["filerName"],
            "periodEnd": f.get("periodEnd", ""), "docID": did,
            "top1_name": "", "top1_pct": "", "top10_pct": "",
            "holders": " / ".join(f"{n} {p}%" for n, p in holders),
        }
        if holders:
            rec["top1_name"] = holders[0][0]
            rec["top1_pct"] = f"{holders[0][1]:.2f}"
            rec["top10_pct"] = f"{sum(p for _, p in holders):.2f}"
        rows.append(rec)
        time.sleep(0.4)
    _write_csv(a.out, rows)
    got = sum(1 for r in rows if r["top1_pct"])
    print(f"→ {a.out}（{got}/{len(rows)} 件で大株主を取得）", file=sys.stderr)


def _extract_shareholder_block(zip_bytes):
    """type=5 の CSV ZIP から MajorShareholdersTextBlock の値を取り出す。"""
    with zipfile.ZipFile(io.BytesIO(zip_bytes)) as z:
        for name in z.namelist():
            if not name.lower().endswith(".csv"):
                continue
            raw = z.read(name)
            for enc in ("utf-16", "utf-16-le", "utf-8-sig", "cp932"):
                try:
                    text = raw.decode(enc)
                    break
                except UnicodeDecodeError:
                    continue
            else:
                continue
            for row in csv.reader(io.StringIO(text), delimiter="\t"):
                if row and "MajorShareholders" in row[0] and len(row) > 8:
                    return row[-1]
            for row in csv.reader(io.StringIO(text)):
                if row and "MajorShareholders" in row[0] and len(row) > 8:
                    return row[-1]
    return None


# ------------------------------------------------------------------ 3) merge

def _load_jpx(path):
    """JPX 上場銘柄一覧（data_j.xls / 変換した csv）→ {code: (市場区分, 33業種)}。"""
    out = {}
    if path.lower().endswith((".xls", ".xlsx")):
        try:
            import pandas as pd
        except ImportError:
            sys.exit("xls を読むには pandas と xlrd/openpyxl が必要です。CSV に変換して渡してください。")
        df = pd.read_excel(path, dtype=str)
        cols = {c: c for c in df.columns}
        code_c = next(c for c in cols if "コード" in c)
        mkt_c = next(c for c in cols if "市場" in c)
        sec_c = next(c for c in cols if "33業種区分" in c)
        for _, r in df.iterrows():
            out[str(r[code_c]).strip()[:4]] = (str(r[mkt_c]).strip(), str(r[sec_c]).strip())
        return out
    for r in _read_csv(path):
        code = (r.get("コード") or r.get("code") or "").strip()[:4]
        if code:
            out[code] = ((r.get("市場・商品区分") or r.get("market") or "").strip(),
                         (r.get("33業種区分") or r.get("sector") or "").strip())
    return out


def _f(v):
    try:
        return float(str(v).replace(",", "").strip())
    except (TypeError, ValueError):
        return None


def cmd_merge(a):
    jpx = _load_jpx(a.jpx) if a.jpx else {}
    prices = {}
    if a.prices:
        for r in _read_csv(a.prices):
            code = (r.get("secCode") or r.get("code") or "").strip()[:4]
            if code:
                prices[code] = r

    rows = []
    for h in _read_csv(a.holders):
        code = h["secCode"]
        market, sector = jpx.get(code, ("", ""))
        if a.sector and sector not in a.sector:
            continue
        if a.market and market not in a.market:
            continue
        p = prices.get(code, {})
        mcap = _f(p.get("mcap"))          # 時価総額（百万円）
        pbr = _f(p.get("pbr"))
        cash = _f(p.get("net_cash"))      # 現預金+有価証券-有利子負債（百万円）
        top1 = _f(h.get("top1_pct"))

        if a.max_mcap is not None and (mcap is None or mcap > a.max_mcap):
            continue
        if a.max_pbr is not None and (pbr is None or pbr > a.max_pbr):
            continue
        if a.max_top1 is not None and (top1 is None or top1 > a.max_top1):
            continue

        ncr = round(cash / mcap * 100, 1) if (cash is not None and mcap) else None
        if a.min_netcash_ratio is not None and (ncr is None or ncr < a.min_netcash_ratio):
            continue

        rows.append({
            "secCode": code, "会社名": h["filerName"], "市場区分": market, "33業種": sector,
            "時価総額_百万円": mcap if mcap is not None else "",
            "PBR": pbr if pbr is not None else "",
            "ネットキャッシュ_百万円": cash if cash is not None else "",
            "ネットキャッシュ比率_%": ncr if ncr is not None else "",
            "筆頭株主": h.get("top1_name", ""),
            "筆頭株主比率_%": h.get("top1_pct", ""),
            "上位10合計_%": h.get("top10_pct", ""),
            "支配権ルート": _route(top1),
            "大株主明細": h.get("holders", ""),
            "有報期末": h.get("periodEnd", ""),
            "docID": h.get("docID", ""),
        })

    def sort_key(r):
        return (_f(r["PBR"]) if r["PBR"] != "" else 9e9,
                _f(r["筆頭株主比率_%"]) if r["筆頭株主比率_%"] else 9e9)

    rows.sort(key=sort_key)
    _write_csv(a.out, rows)
    print(f"→ {a.out} に {len(rows)} 銘柄", file=sys.stderr)
    for r in rows[:25]:
        print(f"  {r['secCode']} {r['会社名'][:16]:16} PBR{r['PBR']} "
              f"時価{r['時価総額_百万円']} 筆頭{r['筆頭株主比率_%']}% "
              f"({r['支配権ルート']})", file=sys.stderr)


def _route(top1):
    """筆頭株主比率から支配権の取り方を判定する。"""
    if top1 is None:
        return "要確認"
    if top1 >= 50:
        return "オーナー相対のみ（市場では不可）"
    if top1 >= 30:
        return "オーナー相対＋TOB"
    if top1 >= 20:
        return "オーナー相対が現実的"
    return "市場＋TOB が成立しうる"


# ------------------------------------------------------------------- helpers

def _read_csv(path):
    with open(path, encoding="utf-8-sig", newline="") as fh:
        yield from csv.DictReader(fh)


def _write_csv(path, rows):
    if not rows:
        print("該当なし（空のCSVを出力します）", file=sys.stderr)
    fields = list(rows[0].keys()) if rows else ["secCode"]
    with open(path, "w", encoding="utf-8-sig", newline="") as fh:
        w = csv.DictWriter(fh, fieldnames=fields)
        w.writeheader()
        w.writerows(rows)


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)

    f = sub.add_parser("filings", help="期間内の有価証券報告書一覧を取得")
    f.add_argument("--from", dest="date_from", required=True, help="YYYY-MM-DD")
    f.add_argument("--to", dest="date_to", required=True, help="YYYY-MM-DD")
    f.add_argument("-o", "--out", default="filings.csv")
    f.set_defaults(func=cmd_filings)

    h = sub.add_parser("holders", help="各有報から大株主の状況を抽出")
    h.add_argument("--filings", required=True)
    h.add_argument("-o", "--out", default="holders.csv")
    h.set_defaults(func=cmd_holders)

    m = sub.add_parser("merge", help="業種・株価と結合して条件で絞る")
    m.add_argument("--holders", required=True)
    m.add_argument("--jpx", help="JPX 上場銘柄一覧（data_j.xls または CSV）")
    m.add_argument("--prices", help="secCode,mcap,pbr,net_cash の CSV（単位:百万円）")
    m.add_argument("--sector", action="append", help="33業種区分（複数指定可）")
    m.add_argument("--market", action="append", help="市場区分（複数指定可）")
    m.add_argument("--max-mcap", type=float, help="時価総額の上限（百万円）")
    m.add_argument("--max-pbr", type=float, default=0.6)
    m.add_argument("--max-top1", type=float, help="筆頭株主比率の上限（%%）")
    m.add_argument("--min-netcash-ratio", type=float, help="ネットキャッシュ比率の下限（%%）")
    m.add_argument("-o", "--out", default="candidates.csv")
    m.set_defaults(func=cmd_merge)

    a = ap.parse_args()
    a.func(a)


if __name__ == "__main__":
    main()
