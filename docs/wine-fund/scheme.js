// P5 スキーム図（1枚）：適格機関投資家向け説明用。提案資料と同じトンマナ（白地・チャコール×ゴールド・メイリオ）。
const pptxgen = require("pptxgenjs");
const DARK = "2B2622", GOLD = "A78450", GOLD_D = "C9AE7E", CARD = "F5EFE4", LINE = "E6DCCB", MUTED = "6F665F", DIM = "9A8F84", WHITE = "FFFFFF";
const F = "Meiryo";
const pres = new pptxgen(); pres.layout = "LAYOUT_WIDE";
pres.title = "合同会社WineBank P5 スキーム図";
const s = pres.addSlide(); s.background = { color: WHITE };

// 見出し
s.addShape(pres.ShapeType.ellipse, { x: 0.6, y: 0.43, w: 0.12, h: 0.12, fill: { color: GOLD }, line: { color: GOLD, width: 0 } });
s.addText("SCHEME", { x: 0.86, y: 0.32, w: 6, h: 0.34, margin: 0, fontFace: F, fontSize: 12, bold: true, color: GOLD, charSpacing: 2.4 });
s.addText("ワインファンド（合同会社WineBank P5）の仕組み", { x: 0.6, y: 0.66, w: 12, h: 0.55, margin: 0, fontFace: F, fontSize: 24, bold: true, color: DARK });
s.addText("匿名組合（GK-TK）・適格機関投資家等特例業務。投資家の出資でワインを割安に取得し、WineBankの販路で売却して利益を分配します。",
  { x: 0.6, y: 1.2, w: 12.2, h: 0.32, margin: 0, fontFace: F, fontSize: 11, color: MUTED });

function box(x, y, w, h, tag, title, lines, o = {}) {
  s.addShape(pres.ShapeType.roundRect, { x, y, w, h, rectRadius: 0.08, fill: { color: o.fill || CARD }, line: { color: o.line || LINE, width: o.lw || 0.75 },
    shadow: { type: "outer", color: "6F665F", opacity: 0.18, blur: 6, offset: 2, angle: 90 } });
  const dark = o.fill === DARK;
  if (tag) {
    s.addShape(pres.ShapeType.roundRect, { x: x + 0.18, y: y + 0.14, w: Math.max(0.9, tag.length * 0.13 + 0.3), h: 0.26, rectRadius: 0.13, fill: { color: GOLD }, line: { color: GOLD, width: 0 } });
    s.addText(tag, { x: x + 0.18, y: y + 0.14, w: Math.max(0.9, tag.length * 0.13 + 0.3), h: 0.26, margin: 0, align: "center", valign: "middle", fontFace: F, fontSize: 8.5, bold: true, color: WHITE });
  }
  s.addText(title, { x: x + 0.18, y: y + (tag ? 0.46 : 0.16), w: w - 0.36, h: 0.32, margin: 0, fontFace: F, fontSize: 12.5, bold: true, color: dark ? WHITE : DARK });
  s.addText(lines.map((t) => "・" + t).join("\n"), { x: x + 0.18, y: y + (tag ? 0.8 : 0.5), w: w - 0.36, h: h - (tag ? 0.9 : 0.6), margin: 0, valign: "top",
    fontFace: F, fontSize: 9, color: dark ? LINE : MUTED, lineSpacingMultiple: 1.2 });
}
function arrow(x1, y1, x2, y2, label, o = {}) {
  s.addShape(pres.ShapeType.line, { x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.abs(x2 - x1) || 0.001, h: Math.abs(y2 - y1) || 0.001,
    flipH: x2 < x1, flipV: y2 < y1, line: { color: o.color || GOLD, width: 1.75, endArrowType: "triangle", dashType: o.dash || "solid" } });
  if (label) s.addText(label, { x: o.lx, y: o.ly, w: o.lw || 2.2, h: o.lh || 0.42, margin: 0, align: o.align || "center", valign: "middle",
    fontFace: F, fontSize: 8.5, bold: true, color: o.color === DARK ? DARK : GOLD, fill: { color: WHITE } });
}

// 投資家（左）
box(0.6, 1.75, 2.85, 1.45, "本日ご相談", "適格機関投資家", ["特例業務の要件として1名以上の出資が必要", "出資額：【●】（1口1,000万円）"], { line: GOLD, lw: 1.5 });
box(0.6, 3.45, 2.85, 1.45, "確定", "投資家（法人・個人）", ["GAキャピタル株式会社 1億円（11/30）", "上場企業オーナー等、49名以内"]);
// 営業者（中央）
box(5.07, 2.2, 3.2, 2.4, "営業者", "合同会社WineBank P5", ["匿名組合の営業者（ファンド本体）", "適格機関投資家等特例業務 届出", "ワインを保有・売却し、利益を出資比率で分配"], { fill: DARK, line: DARK });
// WineBank（右上）・販売先（右下）
box(9.9, 1.75, 2.85, 1.6, "受託者", "株式会社WineBank", ["インポーター・卸・EC・オークション", "ワインの供給と管理・販売を受託", "管理報酬 年2%（半期1%）"]);
box(9.9, 3.55, 2.85, 1.5, "販売先", "飲食店・酒販店・個人", ["卸売（B2B）、自社EC・オークション（B2C）", "在庫回転 約12ヶ月（9〜18ヶ月）"]);

function h(x1, x2, y, label, color) {
  arrow(x1, y, x2, y, "", { color });
  s.addText(label, { x: Math.min(x1, x2), y: y - 0.3, w: Math.abs(x2 - x1), h: 0.26, margin: 0, align: "center", valign: "bottom",
    fontFace: F, fontSize: 8, bold: true, color: color === DARK ? DARK : GOLD });
}
// 出資・分配
h(3.45, 5.07, 2.55, "匿名組合出資", GOLD);
h(3.45, 5.07, 3.85, "匿名組合出資", GOLD);
h(5.07, 3.45, 4.45, "利益分配（年1回）", DARK);
// ワインの取得
h(9.9, 8.27, 2.45, "ワイン売却（時価×75.5%）", GOLD);
h(8.27, 9.9, 3.05, "購入代金", DARK);
// 販売と売上
h(8.27, 9.9, 3.95, "販売（WineBankの販路）", GOLD);
h(9.9, 8.27, 4.5, "売上代金はP5へ入金", DARK);

// 下段：主な条件と投資家保護
s.addShape(pres.ShapeType.rect, { x: 0.6, y: 5.2, w: 12.15, h: 0.02, fill: { color: LINE }, line: { color: LINE, width: 0 } });
const cols = [
  ["主な条件", ["運用期間 5年（2031年12月末、同意で最長3年延長）", "分配 年1回（8月末締め・11月末まで）、元本相当は再投資", "解約 3年経過後、半期末（2月末・8月末）"]],
  ["収益の源泉", ["市場価格（卸値とEC最安値の平均）より24.5%安く取得", "WineBankの割当・輸入ルートで希少銘柄を組入れ", "目標利回り 5年平均 年20%程度（保証なし）"]],
  ["投資家保護", ["公認会計士による合意された手続（AUP）を毎年実施", "在庫・取引明細をデータルームで常時開示", "在庫配分方針・取得価格の算定方法を契約で固定"]],
];
cols.forEach(([h, ls], i) => {
  const x = 0.6 + i * 4.1;
  s.addShape(pres.ShapeType.rect, { x, y: 5.42, w: 0.4, h: 0.05, fill: { color: GOLD }, line: { color: GOLD, width: 0 } });
  s.addText(h, { x, y: 5.52, w: 3.9, h: 0.3, margin: 0, fontFace: F, fontSize: 11.5, bold: true, color: DARK });
  s.addText(ls.map((t) => "・" + t).join("\n"), { x, y: 5.85, w: 3.95, h: 0.95, margin: 0, valign: "top", fontFace: F, fontSize: 9, color: MUTED, lineSpacingMultiple: 1.2 });
});
s.addText("Confidential", { x: 0.6, y: 7.05, w: 4, h: 0.28, margin: 0, fontFace: F, fontSize: 9, color: DIM });
s.addText("株式会社WineBank", { x: 8.75, y: 7.05, w: 4, h: 0.28, margin: 0, align: "right", fontFace: F, fontSize: 9, color: DIM });

pres.writeFile({ fileName: "WineBank_P5_スキーム図_20261119.pptx" }).then((f) => console.log("written:", f));
