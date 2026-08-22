# -*- coding: utf-8 -*-
"""formulas で計算した結果を xlsx のキャッシュ値(<v>)として書き戻す。
   LibreOffice が使えない環境での recalc 代替。"""
import formulas, warnings, os, re, shutil, zipfile, sys
import xml.etree.ElementTree as ET
warnings.filterwarnings("ignore")

P = "/home/user/wine-auction/事業計画/ティエリーマルクス・ブラッスリー_5か年事業計画_FY2027-2031.xlsx"
BN = os.path.basename(P)
NS = "http://schemas.openxmlformats.org/spreadsheetml/2006/main"
ET.register_namespace("", NS)

sol = formulas.ExcelModel().loads(P).finish().calculate()

# (SHEET, COORD) -> value
vals, errors = {}, []
pat = re.compile(r"^'\[" + re.escape(BN) + r"\](.+?)'!([A-Z]+\d+)$")
for k, x in sol.items():
    m = pat.match(k)
    if not m:
        continue
    sheet, coord = m.group(1), m.group(2)
    try:
        raw = x.value[0, 0]
    except Exception:
        continue
    vals[(sheet, coord)] = raw
    if isinstance(raw, str) and raw.startswith("#"):
        errors.append((sheet, coord, raw))

# workbook.xml からシート順を取得
tmp = P + ".tmp"
with zipfile.ZipFile(P) as zin:
    names = zin.namelist()
    wbxml = ET.fromstring(zin.read("xl/workbook.xml"))
    order = [s.get("name") for s in wbxml.iter(f"{{{NS}}}sheet")]
    sheet_files = {}
    for i, nm in enumerate(order, start=1):
        sheet_files[f"xl/worksheets/sheet{i}.xml"] = nm

    patched = {}
    n_written = 0
    for fn, sheetname in sheet_files.items():
        if fn not in names:
            continue
        root = ET.fromstring(zin.read(fn))
        for c in root.iter(f"{{{NS}}}c"):
            f = c.find(f"{{{NS}}}f")
            if f is None:
                continue
            coord = c.get("r")
            if (sheetname, coord) not in vals:
                continue
            raw = vals[(sheetname, coord)]
            for old in c.findall(f"{{{NS}}}v"):
                c.remove(old)
            v = ET.SubElement(c, f"{{{NS}}}v")
            if isinstance(raw, bool):
                c.set("t", "b"); v.text = "1" if raw else "0"
            elif isinstance(raw, (int, float)):
                c.attrib.pop("t", None); v.text = repr(float(raw))
            else:
                c.set("t", "str"); v.text = str(raw)
            n_written += 1
        patched[fn] = ET.tostring(root, encoding="UTF-8", xml_declaration=True)

    with zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zout:
        for item in zin.infolist():
            data = patched.get(item.filename) or zin.read(item.filename)
            zout.writestr(item, data)

shutil.move(tmp, P)
print(f"formula cells cached : {n_written}")
print(f"formula errors       : {len(errors)}")
for e in errors[:20]:
    print("  ", e)
sys.exit(1 if errors else 0)
