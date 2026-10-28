# -*- coding: utf-8 -*-
"""実践会ご紹介の投資家様（池上様・城戸様）向け 合意書＋総数引受契約書 を生成する。

・合意書　　　：田角様と締結した合意書（20260904版）の docx をそのまま使い、投資家固有の箇所と参照ずれだけ差し替える。
・総数引受契約書：定款・謄本照合済み（20261023 反映済）の条文をベースに、1株160,000円・12月1日払込で作り直す。
               書式は田角様ドラフトの docx（游明朝・A4）を流用する。

使い方:
  python3 build_investor_documents.py <合意書20260904.docx> <総数引受契約書_田角様ドラフト.docx> <出力フォルダ>
"""
import sys, re, zipfile, os
from xml.sax.saxutils import escape

GOUI_SRC, SOUSU_SRC, OUTDIR = sys.argv[1], sys.argv[2], sys.argv[3]

# ───────── 条件（ここを変えれば金額・株数がすべて連動） ─────────
PRICE = 160_000                 # 実践会ご案内価格（田角様は150,000円）
SHARES = 66                     # 約1,000万円
SHARES_PRE = 2_134              # 10/30 増資後2,000株＋田角様134株（11/10払込）
PAY_DATE = "2026年12月1日"
TOTAL = PRICE * SHARES          # 10,560,000円
CAPITAL = TOTAL // 2
RESERVE = TOTAL - CAPITAL
PRE_MONEY = PRICE * SHARES_PRE  # 341,440,000円
INVESTORS = [                   # (ファイル名用, 本文の氏名, 署名欄の氏名)
    ("池上様", "池上貴樹", "池上　貴樹"),
    ("城戸様", "城戸【　　】", "城戸　【　　】"),
]

def yen(n): return f"{n:,}"

# ═════════ 1. 合意書：原本 docx の該当テキストのみ差し替え ═════════
GOUI_EDITS = [
    ("１　乙は、甲による対象会社の開業資金のためPreバリュー300,000,000円にて総額150,000,000円（以下「本件出資総額」という。）"
     "の募集に対し、2026年10月末日（以下「本件実行日」という。）迄に、金20,000,000円の出資（以下「本件出資」という。）をすることを約束する（以下「本件約束」という）。",
     "１　乙は、甲による対象会社の開業資金のため総額約150,000,000円（以下「本件出資総額」という。）の募集に対し、"
     f"{PAY_DATE}（以下「本件実行日」という。）迄に、1株当たり金{yen(PRICE)}円にて対象会社の普通株式{SHARES}株を引き受け、"
     f"金{yen(TOTAL)}円の出資（以下「本件出資」といい、本件出資により乙が取得する対象会社の株式を「本件株式」という。）"
     "をすることを約束する（以下「本件約束」という）。"),
    # 「本件買収」は定義規定が削除済みのため
    ("２　本件買収及び本件出資の回収に関して", "２　対象会社の株式の譲渡及び本件出資の回収に関して"),
    # 起算点が締結時点で既に過去
    ("甲は、2026年4月以降、5年～10年以内に", "甲は、本件実行日以降、5年～10年以内に"),
    # 第２条第１項は第５号（善管注意義務）まで
    ("第２条第１項第６号の違反", "第２条第１項第５号の違反"),
]

def build_goui(name, sign):
    zin = zipfile.ZipFile(GOUI_SRC)
    x = zin.read("word/document.xml").decode("utf8")
    for old, new in GOUI_EDITS + [("と〇〇", f"と{name}")]:
        assert x.count(old) == 1, old[:30]
        x = x.replace(old, new)
    # 締結日：2026年9月　日 → 2026年11月　日
    date_pat = r"(<w:t>年</w:t></w:r>(?:(?!</w:p>).)*?<w:t>)9(</w:t></w:r>(?:(?!</w:p>).)*?<w:t>月</w:t>)"
    x, n = re.subn(date_pat, r"\g<1>11\g<2>", x, count=1, flags=re.S)
    assert n == 1
    # 乙の署名欄：「乙：」の段落に住所、直後の空段落に氏名
    m = re.search(r'(<w:p w14:paraId="6E8B48C4".*?<w:t>：)(</w:t></w:r></w:p>)', x, re.S)
    assert m
    x = x[:m.start()] + m.group(1) + "【住所】" + m.group(2) + x[m.end():]
    m = re.search(r'<w:p w14:paraId="0BEE9812"[^>]*><w:pPr>(.*?)</w:pPr></w:p>', x, re.S)
    assert m
    rpr = '<w:rPr><w:rFonts w:ascii="游明朝" w:eastAsia="游明朝" w:hAnsi="游明朝" w:hint="eastAsia"/></w:rPr>'
    para = (m.group(0)[:m.group(0).index("</w:pPr>")]
            .replace('<w:ind w:leftChars="1687" w:left="3543"/>',
                     '<w:ind w:leftChars="1687" w:left="3543" w:firstLineChars="200" w:firstLine="420"/>')
            + f'</w:pPr><w:r>{rpr}<w:t xml:space="preserve">{sign}　　　　　　　　　　　　　印</w:t></w:r></w:p>')
    x = x[:m.start()] + para + x[m.end():]
    return zin, x

# ═════════ 2. 総数引受契約書：条文を組み立てて書式テンプレートに流し込む ═════════
FONT = '<w:rFonts w:ascii="游明朝" w:eastAsia="游明朝" w:hAnsi="游明朝" w:hint="eastAsia"/>'

def runs(text, bold=False, size=None):
    """【 】で囲んだ箇所は黄色ハイライト（要記入・要確認）。"""
    out = []
    for part in re.split(r"(【[^】]*】)", text):
        if not part: continue
        rpr = FONT + ("<w:b/><w:bCs/>" if bold else "")
        if size: rpr += f'<w:sz w:val="{size}"/><w:szCs w:val="{size}"/>'
        if part.startswith("【"): rpr += '<w:highlight w:val="yellow"/>'
        out.append(f'<w:r><w:rPr>{rpr}</w:rPr><w:t xml:space="preserve">{escape(part)}</w:t></w:r>')
    return "".join(out)

def P(text="", bold=False, jc=None, left=0, hanging=0, first=0, size=None, before=0, after=0, keep=False):
    ppr = ""
    if keep: ppr += "<w:keepNext/>"
    if before or after: ppr += f'<w:spacing w:before="{before}" w:after="{after}"/>'
    if left or hanging or first:
        ppr += (f'<w:ind w:left="{left}" w:hanging="{hanging}"/>' if hanging
                else f'<w:ind w:left="{left}" w:firstLine="{first}"/>')
    if jc: ppr += f'<w:jc w:val="{jc}"/>'
    return f'<w:p><w:pPr>{ppr}<w:rPr>{FONT}</w:rPr></w:pPr>{runs(text, bold, size)}</w:p>'

def table(body, rows, widths=(3400, 5780)):
    tw = sum(widths)
    bd = ''.join(f'<w:{s} w:val="single" w:sz="4" w:space="0" w:color="000000"/>'
                 for s in ("top", "left", "bottom", "right", "insideH", "insideV"))
    trs = []
    for a, b in rows:
        cells = []
        for txt, w in ((a, widths[0]), (b, widths[1])):
            cells.append(f'<w:tc><w:tcPr><w:tcW w:w="{w}" w:type="dxa"/><w:vAlign w:val="center"/></w:tcPr>'
                         f'<w:p><w:pPr><w:spacing w:before="40" w:after="40"/><w:rPr>{FONT}</w:rPr></w:pPr>{runs(txt)}</w:p></w:tc>')
        trs.append(f'<w:tr>{"".join(cells)}</w:tr>')
    grid = "".join(f'<w:gridCol w:w="{w}"/>' for w in widths)
    body.append(f'<w:tbl><w:tblPr><w:tblW w:w="{tw}" w:type="dxa"/><w:tblInd w:w="420" w:type="dxa"/>'
                f'<w:tblBorders>{bd}</w:tblBorders><w:tblLayout w:type="fixed"/>'
                f'<w:tblCellMar><w:left w:w="100" w:type="dxa"/><w:right w:w="100" w:type="dxa"/></w:tblCellMar></w:tblPr>'
                f'<w:tblGrid>{grid}</w:tblGrid>{"".join(trs)}</w:tbl>')

def build_sousu(name, sign):
    body = []
    def title(t):  body.append(P(t, bold=True, jc="center", size=28, after=120))
    def art(t):    body.append(P(t, bold=True, before=200, keep=True))
    def para(t):   body.append(P(t, left=420, hanging=420))
    def item(t):   body.append(P(t, left=840, hanging=420))
    def single(t): body.append(P(t, first=210))
    def blank():   body.append(P())

    title("総数引受契約書")
    blank()
    single(f"株式会社Brasserie Thierry Marx（以下「甲」という。）と{name}（以下「乙」という。）とは、"
           "甲が第三者割当の方法により発行する募集株式の総数を乙が引き受けることに関し、会社法第205条第1項に基づき、"
           "以下のとおり契約（以下「本契約」という。）を締結する。")

    art("第１条（募集株式の発行）")
    para("１　甲は、【2026年11月　日】付の甲の株主総会の特別決議（会社法第319条第1項により決議があったものとみなされる場合を含む。）"
         "に基づき、次の要領により募集株式（以下「本株式」という。）を発行する。")
    table(body, [
        ("（１）募集株式の種類及び数", f"普通株式　{SHARES:,}株"),
        ("（２）募集株式の払込金額", f"１株につき金{yen(PRICE)}円"),
        ("（３）払込金額の総額", f"金{yen(TOTAL)}円"),
        ("（４）払込期日", PAY_DATE),
        ("（５）増加する資本金の額", f"金{yen(CAPITAL)}円"),
        ("（６）増加する資本準備金の額", f"金{yen(RESERVE)}円"),
        ("（７）募集の方法", "第三者割当の方法により、本株式の全部を乙に割り当てる"),
        ("（８）払込取扱場所", "別紙記載の甲の預金口座"),
    ])
    para(f"２　前項第２号の払込金額は、甲の発行済株式総数{SHARES_PRE:,}株（本株式と同時に第三者割当の方法により発行する"
         f"募集株式を除く。）に対する株式価値（プレ・マネー評価額）を金{yen(PRE_MONEY)}円として算定したものである。")

    art("第２条（総数の引受け）")
    para("１　乙は、本株式の総数を引き受け、甲は、本株式の総数を乙に割り当てる。")
    para("２　甲及び乙は、本契約が会社法第205条第1項に定める募集株式の総数の引受けを行う契約であり、"
         "本株式の発行について同法第203条及び第204条の規定が適用されないことを確認する。")

    art("第３条（払込み）")
    para("１　乙は、払込期日までに、払込金額の総額を別紙記載の甲の預金口座に振り込む方法により払い込む。"
         "なお、振込手数料は乙の負担とする。")
    para("２　乙が払込期日までに前項の払込みをしないときは、乙は、本株式の株主となる権利を失う（会社法第208条第5項）。")

    art("第４条（株主となる時期等）")
    para("１　乙は、払込期日に本株式の株主となる。")
    para("２　甲は、払込期日後遅滞なく、乙を本株式の株主として株主名簿に記載し、発行済株式の総数及び資本金の額の変更登記を行う。")
    para("３　甲は、本株式に係る株券を発行しない。")

    art("第５条（前提条件）")
    para("１　甲が本株式を発行する義務は、次の各号の条件がすべて充足されていることを条件とする。")
    item("（１）甲の株主総会の特別決議により、本株式の募集事項の決定（会社法第199条第2項）及び本契約の承認"
         "（同法第205条第2項）が適法に行われていること")
    item("（２）第７条第２項に定める乙の表明及び保証が、本契約締結日及び払込期日において真実かつ正確であること")
    para("２　乙が払込みを行う義務は、次の各号の条件がすべて充足されていることを条件とする。")
    item("（１）前項第１号の決議が行われていること")
    item("（２）第７条第１項に定める甲の表明及び保証が、本契約締結日及び払込期日において真実かつ正確であること")
    item("（３）株式会社WineBank（以下「丙」という。）と乙との間の【2026年11月　日】付合意書（以下「本合意書」という。）"
         "第１条第２項各号に定める事由が生じていないこと")

    art("第６条（資金使途）")
    single("甲は、本株式の払込金を、六本木ミッドタウンに出店する甲の運営店舗の開業資金及び運転資金に充当する。")

    art("第７条（表明及び保証）")
    para("１　甲は、乙に対し、本契約締結日及び払込期日において、次の各号の事項が真実かつ正確であることを表明し、保証する。")
    item("（１）甲は、日本法に基づき適法に設立され、有効に存続する株式会社であること")
    item(f"（２）甲の発行済株式総数は普通株式{SHARES_PRE:,}株（2026年11月10日を払込期日とする第三者割当による134株の発行後の株式数）であり、"
         "本株式及び本株式と同時に第三者割当の方法により発行する募集株式を除き、甲の株式、新株予約権その他甲の株式を取得し得る権利は"
         "発行されていないこと")
    item("（３）本契約の締結及び履行は甲の目的の範囲内の行為であり、甲は、本契約の締結及び履行に必要な法令及び定款上の手続を"
         "履践していること")
    item("（４）甲並びにその役員及び主要な株主は、反社会的勢力（第１２条第１項に定義する。）に該当しないこと")
    para("２　乙は、甲に対し、本契約締結日及び払込期日において、次の各号の事項が真実かつ正確であることを表明し、保証する。")
    item("（１）乙は、本契約を締結し、履行するために必要な権利能力及び行為能力を有していること")
    item("（２）乙は、反社会的勢力に該当せず、本株式の払込みに充てる資金は、反社会的勢力に由来するものではなく、"
         "犯罪による収益の移転防止に関する法律その他の法令に違反して取得したものではないこと")
    item("（３）乙は、甲の事業計画その他甲から提供を受けた資料を自ら検討し、本株式への投資に伴うリスク"
         "（元本の毀損及び株式の流動性が乏しいことを含む。）を理解したうえで、自己の判断と責任において本契約を締結すること")

    art("第８条（株式の譲渡制限）")
    single("乙は、本株式が譲渡制限株式であり、その譲渡には甲の定款の定めに従い甲の株主総会の承認を要することを確認する。")

    art("第９条（本合意書との関係）")
    para("１　本契約は、本株式の引受け及び払込みに関する事項を定めるものとし、株主優待、情報開示、株式の譲渡その他本合意書に"
         "定める事項については、引き続き本合意書の定めに従う。")
    para(f"２　甲、乙及び丙は、乙が本契約第１条第１項に定める払込金額の総額（金{yen(TOTAL)}円）を払込期日までに払い込むことをもって、"
         "本合意書に定める本件約束が履行されたものとみなすことを確認する。")
    para("３　本株式の引受け及び払込みに関し、本契約の定めと本合意書の定めが抵触する場合には、本契約の定めが優先する。")

    art("第１０条（解除）")
    para("１　甲及び乙は、払込期日の前日までに限り、相手方が次の各号のいずれかに該当したときは、催告を要することなく直ちに、"
         "本契約を解除することができる。")
    item("（１）本契約上の重要な義務に違反したとき")
    item("（２）第７条に定める表明及び保証が重要な点において真実又は正確でなかったとき")
    item("（３）差押、仮差押、仮処分、強制執行若しくは競売の申立てを受け、又は破産、民事再生、会社更生若しくは特別清算の"
         "手続開始の申立てを受け、若しくは自ら申し立てたとき")
    item("（４）第１２条第１項又は第２項に違反したとき")
    para("２　払込期日以降は、本契約を解除することはできない。")

    art("第１１条（費用）")
    single("本株式の発行に要する登録免許税その他の費用は甲の負担とし、本契約の締結に要する費用は各自の負担とする。")

    art("第１２条（反社会的勢力の排除）")
    para("１　甲及び乙は、それぞれ、自ら又はその役員が、暴力団、暴力団員、暴力団員でなくなった時から５年を経過しない者、"
         "暴力団準構成員、暴力団関係企業、総会屋等、社会運動等標ぼうゴロ又は特殊知能暴力集団等その他これらに準ずる者"
         "（以下「反社会的勢力」という。）に該当しないこと、及び反社会的勢力と社会的に非難されるべき関係を有しないことを"
         "表明し、将来にわたっても該当しないことを確約する。")
    para("２　甲及び乙は、それぞれ、自ら又は第三者を利用して、暴力的な要求行為、法的な責任を超えた不当な要求行為、"
         "脅迫的な言動若しくは暴力を用いる行為、風説の流布、偽計若しくは威力を用いて相手方の信用を毀損し若しくは業務を"
         "妨害する行為その他これらに準ずる行為を行わないことを確約する。")

    art("第１３条（秘密保持）")
    single("甲及び乙は、本契約の内容及び本契約に関連して知り得た相手方の秘密情報を、相手方の事前の書面による承諾なく第三者に"
           "開示してはならない。ただし、法令又は公的機関の命令に基づき開示する場合、守秘義務を負う弁護士、税理士その他の専門家に"
           "開示する場合、及び甲が丙又は甲の他の株主に開示する場合はこの限りでない。")

    art("第１４条（エンジェル税制に関する協力）")
    para("１　甲は、乙が本株式の取得についていわゆるエンジェル税制（プレシード・シード特例を含む。）の適用を受けることができるよう、"
         "払込期日後遅滞なく、都道府県知事に対する確認の申請その他必要な手続を行い、確認書その他乙の確定申告に必要な書類を乙に交付する。")
    para("２　甲は、乙に対し、毎事業年度終了後３か月以内に、当該事業年度の事業報告及び計算書類を提供する。")
    para("３　甲は、エンジェル税制の適用を保証するものではなく、同税制の適用を受けられなかったことを理由として本契約を解除し、"
         "又は損害賠償を請求することはできない。")

    art("第１５条（協議）")
    single("本契約に定めのない事項又は本契約の解釈について疑義が生じた事項については、甲及び乙は、誠実に協議のうえ解決する。")

    art("第１６条（準拠法及び裁判管轄）")
    para("１　本契約は、日本国の法律に準拠し、これに従って解釈される。")
    para("２　本契約に関する一切の紛争については、東京地方裁判所を第一審の専属的合意管轄裁判所とする。")
    blank()
    body.append(P("（以下、余白）", jc="right"))
    blank()
    single("本契約の成立を証するため本書３通を作成し、甲、乙及び丙が記名押印のうえ、各１通を保有する。")
    blank()
    body.append(P("2026年【11】月　　日", left=420))
    blank()
    for lab, lines in [
        ("甲：", ["東京都港区六本木四丁目12番8号", "株式会社Brasserie Thierry Marx", "代表取締役　中野邦人　　　　　　　　印"]),
        ("乙：", ["【住所】", f"{sign}　　　　　　　　　　　　　印"]),
        ("丙：", ["東京都港区六本木4丁目12番8号", "株式会社WineBank", "代表取締役　中野 邦人　　　　　　　　　印"]),
    ]:
        body.append(P(lab + lines[0], left=3780))
        for ln in lines[1:]:
            body.append(P(ln, left=3780 + 420))
        blank()

    body.append('<w:p><w:r><w:br w:type="page"/></w:r></w:p>')
    body.append(P("別紙　払込取扱場所（甲の預金口座）", bold=True, after=120))
    table(body, [("金融機関名", "【　　】銀行"), ("支店名", "【　　】支店"), ("預金種別", "【普通預金】"),
                 ("口座番号", "【　　　　　】"), ("口座名義", "株式会社Brasserie Thierry Marx　代表取締役　中野邦人")])

    zin = zipfile.ZipFile(SOUSU_SRC)
    doc = zin.read("word/document.xml").decode("utf8")
    head = doc[:doc.index("<w:body>") + len("<w:body>")]
    sect = doc[doc.rindex("<w:sectPr"):doc.rindex("</w:body>")]
    return zin, head + "".join(body) + sect + "</w:body></w:document>"

def save(zin, xml, out):
    with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as zout:
        for it in zin.infolist():
            data = xml.encode("utf8") if it.filename == "word/document.xml" else zin.read(it.filename)
            zout.writestr(it, data)
    print("saved:", out)

for tag, name, sign in INVESTORS:
    save(*build_goui(name, sign), os.path.join(OUTDIR, f"合意書_{tag}_BrasserieThierryMarx_20261028.docx"))
    save(*build_sousu(name, sign), os.path.join(OUTDIR, f"総数引受契約書_{tag}_BrasserieThierryMarx_20261028.docx"))
print(f"{SHARES}株 × @{PRICE:,}円 = {TOTAL:,}円／資本金{CAPITAL:,}・準備金{RESERVE:,}／プレ{PRE_MONEY:,}円（{SHARES_PRE:,}株）")
