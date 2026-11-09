# -*- coding: utf-8 -*-
"""BRASSERIE THIERRY MARX 六本木　コンセプト修正案（11/10 マルクスシェフ打合せ用・日英仏）"""
from docx import Document
from docx.shared import Pt, RGBColor, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
import os
OUT=os.path.join(os.path.dirname(os.path.abspath(__file__)),"BRASSERIE_THIERRY_MARX_コンセプト修正案_20261110.docx")
WINE=RGBColor(0x8C,0x27,0x40); GREY=RGBColor(0x6E,0x68,0x66); INK=RGBColor(0x1B,0x1A,0x19)
d=Document()
for s in d.sections:
    s.top_margin=s.bottom_margin=Cm(1.6); s.left_margin=s.right_margin=Cm(1.9)
st=d.styles["Normal"]; st.font.name="Yu Gothic"; st.font.size=Pt(10)
st.element.rPr.rFonts.set(qn("w:eastAsia"),"Yu Gothic")
def P(text="",size=10,bold=False,color=INK,space=4,align=None,italic=False):
    p=d.add_paragraph(); p.paragraph_format.space_after=Pt(space); p.paragraph_format.space_before=Pt(0)
    if align: p.alignment=align
    r=p.add_run(text); r.font.size=Pt(size); r.bold=bold; r.italic=italic; r.font.color.rgb=color
    r.font.name="Yu Gothic"; r._element.rPr.rFonts.set(qn("w:eastAsia"),"Yu Gothic")
    return p
def H(text): P(text,12,True,WINE,3); 
def B(text,size=10,color=INK): 
    p=P("・"+text,size,False,color,2); p.paragraph_format.left_indent=Cm(0.4); return p

P("BRASSERIE THIERRY MARX　六本木",9,True,WINE,0)
P("コンセプト修正案（11/10 打合せ用）",18,True,INK,2)
P("Concept — revised draft for discussion / Concept — proposition révisée",10,False,GREY,10)

H("修正の前提（11/9 打合せでのご指摘）")
for t in ["「新しい」「19世紀」は使わない。",
          "「日本へのリスペクト」「日本への敬意」は、お客様から見ると説明的に響くため、言葉ではなく中身（日本の生産者・旬の食材・日本酒・お茶・器）で表す。",
          "国内の「顔の見える生産者」を前面に出す。外国産は無理に使わず、使うときは生産者と組んだ期間限定に絞る。",
          "WineBankのワインを言葉に入れる。",
          "TBS骨子の「伝統を、自由に。」「気軽さの中に、本物の技術と上質さがある」を生かす。"]:
    B(t,9.5)
P("",4)

H("1．コンセプト（タグライン）")
P("伝統を、自由に。",20,True,INK,1)
P("Tradition, in freedom.　／　La tradition, en liberté.",11,False,GREY,6)
P("パリのブラッスリーが守ってきた「人が集い、食べ、語り合う」伝統を土台に、ティエリー・マルクスの技と自由な発想で、日本の食材と出会わせる。「新しい」と言わずに、伝統を固めずに動かす姿勢を一語で表しています。",9.5,False,GREY,8)
P("代案",10,True,INK,2)
for jp,en,fr in [("フランスの伝統に、日本の旬を。","French tradition, Japanese seasons.","La tradition française, les saisons du Japon."),
                 ("パリのブラッスリーを、六本木の日常に。","A Parisian brasserie for everyday Roppongi.","L’esprit d’une brasserie parisienne, au quotidien à Roppongi."),
                 ("気軽さの中に、本物を。","Easygoing, and the real thing.","La simplicité, avec l’exigence du vrai.")]:
    B(f"{jp}　—　{en}　／　{fr}",9.5)
P("",4)

H("2．メッセージ（説明文）")
P("ブラッスリーは、時代に固定された様式ではなく、人をもてなす“あり方”です。"
  "パリの街角で人々が集い、食べ、語り合ってきたその伝統を、ティエリー・マルクスは六本木で受け継ぎます。"
  "皿の上には、顔の見える日本の生産者が育てた旬の食材と、確かなフランスの技術。"
  "グラスには、WineBankが産地から届けるワインと、日本酒やお茶。"
  "昼のひと皿から夜の会食まで、気軽さの中に本物がある——ブラッスリー ティエリー・マルクス 六本木。",10.5,False,INK,4)
P("A brasserie is not a style fixed in time; it is a way of welcoming people. Thierry Marx carries the tradition of the Parisian brasserie — where people gather, eat and talk — to Roppongi. "
  "On the plate: seasonal produce from Japanese growers we know by name, and true French technique. In the glass: wines brought directly from the vineyards by WineBank, alongside sake and Japanese tea. "
  "From a quick lunch to a dinner with friends — easygoing, and the real thing.",9,False,GREY,8,italic=True)

H("3．コンセプトを支える3つの柱")
for t,b in [("01　ブラッスリーの伝統","ステーキ・フリット、オニオングラタンスープ、魚介など、フランスの食文化に根ざした親しみやすい定番を、確かな技術と丁寧な仕事で。"),
            ("02　ティエリー・マルクスの技","素材の力を引き出す技術と自由な発想。オープンキッチンの臨場感と、シャリオ・ゲリドンを使った目の前のサービス（店内・テラスとも）。"),
            ("03　日本の生産者とワイン","顔の見える国内生産者の旬の食材が主役。WineBankのワインに、日本酒・お茶も同じ熱量で合わせる。外国産は生産者と組んだ期間限定（クリスマス等）に限る。")]:
    P(t,10.5,True,WINE,1); P(b,9.5,False,INK,5)

H("4．SNS・看板のキャッチ")
B("メイン：伝統を、自由に。／ Tradition, in freedom. ／ La tradition, en liberté.",9.5)
B("サブ（日常使い）：パリのブラッスリーを、六本木の日常に。",9.5)
B("ハッシュタグ候補：#ブラッスリーティエリーマルクス　#BrasserieThierryMarx　#六本木ランチ　#顔の見える生産者",9.5)
P("",4)

H("5．使わない言葉（表記ルール）")
for t in ["「新しい」「19世紀」→ 使わない（TBS骨子の「ティエリー・マルクスが創る、新しいブラッスリー」も「ティエリー・マルクスが創るブラッスリー」に）",
          "「日本へのリスペクト／敬意」→ 生産者・食材・日本酒・お茶など具体で書く",
          "「和フレンチ」「フュージョン」→ 使わない（フランス料理が軸）",
          "表記：ブラッスリー（ブラッセリーは不可）、ティエリー・マルクス（中黒あり・「シェフ」は付けない）"]:
    B(t,9.5)
P("",4)
P("※ 英語・フランス語はたたき台です。最終表現はファブリスさんとマルクスシェフに確認します。",8.5,False,GREY,0)
d.save(OUT); print("saved",OUT)
