#!/usr/bin/env python3
"""再計算後のフォント復元。
LibreOffice は未インストールのフォント（メイリオ）を保存時に置換してしまうため、
xl/styles.xml のフォント名を直接書き戻す。セルのキャッシュ値は保持される。"""
import sys, re, zipfile, shutil, os
TARGET='メイリオ'
SUBS=['WenQuanYi Zen Hei','Arial','Calibri','Liberation Sans','DejaVu Sans','Noto Sans CJK JP']
def fix(path):
    tmp=path+'.tmp'
    with zipfile.ZipFile(path) as zin, zipfile.ZipFile(tmp,'w',zipfile.ZIP_DEFLATED) as zout:
        n=0
        for item in zin.infolist():
            data=zin.read(item.filename)
            if item.filename=='xl/styles.xml':
                s=data.decode('utf-8')
                for sub in SUBS:
                    s,c=re.subn(r'(<name val=")'+re.escape(sub)+r'("/>)', r'\g<1>'+TARGET+r'\g<2>', s)
                    n+=c
                data=s.encode('utf-8')
            zout.writestr(item, data)
    shutil.move(tmp,path)
    return n
if __name__=='__main__':
    for f in sys.argv[1:]:
        print(f'{f}: フォント定義 {fix(f)} 件を「{TARGET}」に復元')
