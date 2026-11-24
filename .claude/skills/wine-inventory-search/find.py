import openpyxl,sys,re
name=re.compile(sys.argv[1],re.I); year=re.compile(sys.argv[2])
for f in sys.argv[3:]:
    wb=openpyxl.load_workbook(f,read_only=True,data_only=True)
    for ws in wb.worksheets:
        for i,r in enumerate(ws.iter_rows(values_only=True),1):
            cells=[str(x) for x in r if x not in (None,'')]
            hit=[c for c in cells if name.search(c)]
            if hit and (any(year.search(c) for c in hit) or any(re.fullmatch(r'\s*'+sys.argv[2]+r'(\.0)?\s*',c) for c in cells)):
                print(f'{f.split("/")[-1]} [{ws.title}] r{i}: '+' | '.join(cells)[:260])
