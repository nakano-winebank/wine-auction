# -*- coding: utf-8 -*-
"""開業工程デッキ（2026/8/28版）と同じデザインで「マーケティング・採用」ガントを作成（日本語・英語）。
   python3 build_marketing_gantt.py <開業工程.pptx> <出力フォルダ>"""
import sys, copy, datetime as dt
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE, MSO_CONNECTOR
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR

SRC, OUTDIR = sys.argv[1], sys.argv[2]
INK, GREY, LINE, BAND = "1B1A19", "6E6866", "DCD7D2", "F5F3F1"
WINE, GREEN, PURPLE, SLATE, PALE = "8C2740", "4E6B54", "6B4A72", "3E5873", "C9C3BD"
D=lambda m,d,y=None: dt.date(y or (2026 if m>=11 else 2027),m,d)
T0, T1 = D(11,1), D(5,16)
X0, X1 = 3.85, 12.83
def X(d): return X0+(X1-X0)*((d-T0).days/(T1-T0).days)
TODAY=D(11,9)

# 行定義：(区分キー, JP, EN, 種類, 開始, 終了, 色, ラベルJP, ラベルEN)
SEC={"brand":("コンセプト・ブランド","Concept & brand",WINE),
     "pr":("PR・集客","PR & customer acquisition",PURPLE),
     "hr":("採用・研修","Recruitment & training",GREEN),
     "open":("開業準備","Opening",SLATE)}
ROWS=[
 ("brand","コンセプト確定（ティエリー氏承認）","Concept sign-off (Thierry Marx)","bar",D(11,9),D(11,30),WINE,"〜11/30","by 30 Nov"),
 ("brand","HP 骨子（仮サイト）","Website — outline / holding page","bar",D(12,1),D(12,28),WINE,"12月","Dec"),
 ("brand","制作物（メニュー・ツール・サイン）＋承認","Print & signage (menus, cards) + approval","bar",D(1,5),D(3,31),WINE,"1/5 – 3/31","5 Jan – 31 Mar"),
 ("brand","撮影（シェフ素材／料理・空間）","Photo & video (chef / dishes, venue)","bar",D(3,1),D(3,20),WINE,"料理 3月","Dishes: Mar"),
 ("pr","TBS主催 リリース（フランス大使館）","Launch event by TBS (French Embassy)","ms",D(2,1),None,PURPLE,"2/1","1 Feb"),
 ("pr","HP 本公開・プレスリリース配信","Website go-live & press release","ms",D(2,1),None,PURPLE,"2/1","1 Feb"),
 ("pr","Instagram・Google 先行開設→本格始動","Instagram & Google — teaser → full launch","bar",D(12,15),D(4,30),PURPLE,"ティザー 12月〜／本格 2月〜","Teaser Dec → full Feb"),
 ("pr","Web予約受付（TableCheck：HP・食べログ・一休）","Online booking via TableCheck (web, Tabelog, Ikyu)","bar",D(2,1),D(4,30),PURPLE,"2/1〜","from 1 Feb"),
 ("pr","レセプション立案（メディア・関係者）","Reception planning (media / partners)","bar",D(2,1),D(3,31),PURPLE,"2月・3月","Feb – Mar"),
 ("hr","幹部社員 追加4名 採用","Hire 4 additional managers","bar",D(11,9),D(1,31),GREEN,"〜1/31","by 31 Jan"),
 ("hr","一般社員・アルバイト募集〜採用","Hire full-time & part-time staff","bar",D(1,5),D(3,31),GREEN,"1月・2月 募集開始","Ads from Jan – Feb"),
 ("hr","雇用契約・就業規則・社保手続き","Contracts, work rules, social insurance","bar",D(12,1),D(3,31),GREEN,"12/1 – 3/31","1 Dec – 31 Mar"),
 ("hr","事前研修（グループ店・試作・ワイン）","Pre-opening training at group venues","bar",D(3,15),D(4,14),GREEN,"3/15 – 4/14","15 Mar – 14 Apr"),
 ("open","許認可（衛生責任者・防火管理者・営業許可）","Licences (hygiene, fire safety, permit)","bar",D(2,1),D(4,22),SLATE,"申請〜保健所検査","Apply → inspection"),
 ("open","引渡し（4月中旬）＋予備日1週間","Handover (mid-April) + 1-week buffer","handover",D(4,15),D(4,22),SLATE,"4/15","15 Apr"),
 ("open","搬入・トレーニング（3日）","Move-in & on-site training (3 days)","bar",D(4,23),D(4,25),SLATE,"4/23 – 4/25","23 – 25 Apr"),
 ("open","レセプション（メディア／関係者 各1日）","Receptions (media / partners, 1 day each)","bar",D(4,26),D(4,27),PURPLE,"4/26・4/27","26 – 27 Apr"),
 ("open","グランドオープン（4月下旬〜末）","Grand opening (late April)","open",D(4,28),D(4,30),WINE,"4/28 – 4/30","28 – 30 Apr"),
]
TXT={
 "jp":dict(kick="2026年11月 – 2027年4月末",
   title="フェーズ④ マーケティング・採用 ─ 2/1のリリースから逆算する",
   sub="11月末コンセプト確定 → 年内HP骨子 → 2/1 大使館リリース・Web予約開始 → 2〜3月 SNS本格始動・レセプション立案 → 4月中旬引渡し＋予備日1週間 → 搬入・トレーニング3日 → 4月下旬〜末 開業",
   months=["11月","12月","1月","2月","3月","4月","5月"], now="現在",
   foot="※ 下線のない項目（制作物・撮影・HP本公開・労務・事前研修・許認可）は抜け漏れ防止のため追加。現場トレーニングは3日のため、3/15〜4/14にグループ店で事前研修を行う。引渡し日の確定後、レセプション日と開業日の予約枠を確定する。",
   font="Yu Gothic"),
 "en":dict(kick="November 2026 – end of April 2027",
   title="Phase 4: Marketing & recruitment — working back from the 1 Feb launch",
   sub="Concept sign-off end Nov → website outline by year-end → 1 Feb launch at the French Embassy & online booking → Feb–Mar social media & reception planning → mid-April handover + 1-week buffer → 3 days move-in & training → opening late April",
   months=["Nov","Dec","Jan","Feb","Mar","Apr","May"], now="Today",
   foot="Items added for completeness: print & signage, photography, website go-live, HR set-up, pre-opening training and licences. On-site training is only 3 days, so staff train at WineBank group venues from 15 Mar to 14 Apr. Reception dates and the first bookable day are fixed once the handover date is confirmed.",
   font="Arial"),
}
USER_ITEMS={0,1,4,7,8,9,10,14,15,16,17}   # ご指示いただいた項目（それ以外は追加分）

def rgb(h): return RGBColor.from_string(h)
def box(sl,x,y,w,h,text,size,color=INK,bold=False,font="Arial",align=PP_ALIGN.LEFT,anchor=MSO_ANCHOR.MIDDLE):
    tb=sl.shapes.add_textbox(Inches(x),Inches(y),Inches(w),Inches(h)); tf=tb.text_frame
    tf.margin_left=tf.margin_right=tf.margin_top=tf.margin_bottom=0; tf.word_wrap=True; tf.vertical_anchor=anchor
    p=tf.paragraphs[0]; p.alignment=align; r=p.add_run(); r.text=text
    f=r.font; f.size=Pt(size); f.bold=bold; f.color.rgb=rgb(color); f.name=font
    rPr=r._r.get_or_add_rPr()
    for tag in ("a:ea","a:cs"):
        el=rPr.makeelement("{http://schemas.openxmlformats.org/drawingml/2006/main}"+tag.split(":")[1],{"typeface":font}); rPr.append(el)
    return tb
def shp(sl,kind,x,y,w,h,fill,line=None,lw=1.0,dash=False):
    s=sl.shapes.add_shape(kind,Inches(x),Inches(y),Inches(w),Inches(h))
    if fill: s.fill.solid(); s.fill.fore_color.rgb=rgb(fill)
    else: s.fill.background()
    if line: s.line.color.rgb=rgb(line); s.line.width=Pt(lw)
    else: s.line.fill.background()
    if dash:
        from pptx.enum.dml import MSO_LINE_DASH_STYLE; s.line.dash_style=MSO_LINE_DASH_STYLE.DASH
    s.shadow.inherit=False
    return s
def vline(sl,x,y0,y1,color,lw=0.75,dash=False):
    c=sl.shapes.add_connector(MSO_CONNECTOR.STRAIGHT,Inches(x),Inches(y0),Inches(x),Inches(y1))
    c.line.color.rgb=rgb(color); c.line.width=Pt(lw)
    if dash:
        from pptx.enum.dml import MSO_LINE_DASH_STYLE; c.line.dash_style=MSO_LINE_DASH_STYLE.DASH
def hline(sl,x0,x1,y,color,lw=0.75):
    c=sl.shapes.add_connector(MSO_CONNECTOR.STRAIGHT,Inches(x0),Inches(y),Inches(x1),Inches(y))
    c.line.color.rgb=rgb(color); c.line.width=Pt(lw)

def build(prs,lang):
    t=TXT[lang]; F=t["font"]; jp=(lang=="jp")
    sl=prs.slides.add_slide(prs.slides[6].slide_layout)
    for ph in list(sl.placeholders): ph._element.getparent().remove(ph._element)
    box(sl,0.5,0.34,12.33,0.24,t["kick"],9.5,WINE,True,F)
    box(sl,0.5,0.6,12.33,0.55,t["title"],22 if jp else 21,INK,True,F)
    box(sl,0.5,1.16,12.33,0.34,t["sub"],9.5,GREY,False,F)
    top, bottom = 1.58, 6.78
    # 月グリッド
    ms=[D(11,1),D(12,1),D(1,1),D(2,1),D(3,1),D(4,1),D(5,1)]
    for i,m in enumerate(ms):
        x=X(m); vline(sl,x,top,bottom,LINE if i else GREY,0.75)
        nx=X(ms[i+1]) if i+1<len(ms) else X1
        box(sl,x+0.04,top+0.01,nx-x-0.05,0.18,t["months"][i],9,INK,False,F)
        if m.month in (11,1): box(sl,x+0.04,top+0.17,0.6,0.14,str(m.year),7,GREY,False,"Arial")
    vline(sl,X1,top,bottom,GREY,0.75)
    hline(sl,0.5,X1,top+0.33,GREY,0.75)
    # 現在線
    xn=X(TODAY); vline(sl,xn,top,bottom,INK,1.0,dash=True)
    box(sl,xn+0.04,top+0.35,0.6,0.15,t["now"],7,INK,False,F)
    y=top+0.36; RH=0.205; HH=0.235
    cur=None
    for idx,(sk,lj,le,kind,a,b,col,labj,labe) in enumerate(ROWS):
        if sk!=cur:
            cur=sk; nm=SEC[sk][0 if jp else 1]; c=SEC[sk][2]
            shp(sl,MSO_SHAPE.RECTANGLE,0.5,y,X1-0.5,HH,BAND)
            shp(sl,MSO_SHAPE.RECTANGLE,0.58,y+HH/2-0.045,0.09,0.09,c)
            box(sl,0.74,y,3.0,HH,nm,9.5,INK,True,F)
            y+=HH
        lab=labj if jp else labe
        name=lj if jp else le
        box(sl,0.6,y,3.2,RH,name,8.5 if jp else 8,INK,idx not in USER_ITEMS and False,F)
        if idx not in USER_ITEMS:   # 追加項目の目印
            box(sl,0.5,y,0.1,RH,"+",8,WINE,True,"Arial")
        cy=y+RH/2
        if kind in ("bar","open","handover"):
            if kind=="handover":
                xa=X(a); xb=X(b+dt.timedelta(days=1))
                s=shp(sl,MSO_SHAPE.ROUNDED_RECTANGLE,xa,cy-0.065,xb-xa,0.13,"E9E5E1",PALE,0.75,dash=True)
                shp(sl,MSO_SHAPE.DIAMOND,xa-0.07,cy-0.07,0.14,0.14,col)
                box(sl,xa-1.6,y,1.5,RH,lab,8,col,True,"Arial",PP_ALIGN.RIGHT)
                box(sl,xb+0.04,y,0.6,RH,"buffer" if not jp else "予備日",7,GREY,False,F)
            else:
                xa=X(a); xb=X(b+dt.timedelta(days=1)); w=max(xb-xa,0.06)
                s=shp(sl,MSO_SHAPE.ROUNDED_RECTANGLE,xa,cy-0.075,w,0.15,col)
                s.adjustments[0]=0.3
                est=len(lab)*(0.085 if jp else 0.055)
                if w>est+0.12:
                    box(sl,xa+0.06,y,w-0.08,RH,lab,7.5,"FFFFFF",False,"Arial" if not jp else F)
                else:
                    box(sl,xa-est-0.25,y,est+0.18,RH,lab,7.5,col,True,F,PP_ALIGN.RIGHT)
                if kind=="open":
                    shp(sl,MSO_SHAPE.DIAMOND,xb-0.02,cy-0.075,0.15,0.15,col)
        else:  # マイルストーン
            xa=X(a)+0.5*(X1-X0)/(T1-T0).days
            shp(sl,MSO_SHAPE.DIAMOND,xa-0.075,cy-0.075,0.15,0.15,col)
            box(sl,xa+0.12,y,0.9,RH,lab,8,col,True,"Arial")
        y+=RH
    box(sl,0.5,6.86,12.33,0.36,t["foot"].replace("下線のない項目","「＋」印の項目") if jp else t["foot"].replace("Items added","Items marked “+” added"),7.5,GREY,False,F,anchor=MSO_ANCHOR.TOP)
    return sl

def move(prs,sl,index):
    lst=prs.slides._sldIdLst; el=[e for e in lst if e.get("id")==str(sl.slide_id)][0]
    lst.remove(el); lst.insert(index,el)
def keep_only(prs,ids):
    lst=prs.slides._sldIdLst
    for e in list(lst):
        if int(e.get("id")) not in ids:
            prs.part.drop_rel(e.get("{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id")); lst.remove(e)

import os
# ① 開業工程デッキに日本語版を1枚挿入（フェーズ③の次）
p=Presentation(SRC); s=build(p,"jp"); move(p,s,7)
p.save(os.path.join(OUTDIR,"BRASSERIE THIERRY MARX開業工程_マーケ採用追加_20261109.pptx"))
# ② 説明用：日本語・英語の2枚
p=Presentation(SRC); a=build(p,"jp"); b=build(p,"en"); keep_only(p,{a.slide_id,b.slide_id})
p.save(os.path.join(OUTDIR,"Marketing_Recruitment_Plan_JP_EN_20261109.pptx"))
print("ok")
