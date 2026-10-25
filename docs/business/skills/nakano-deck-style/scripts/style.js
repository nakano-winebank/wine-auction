// 中野スタイル（WineBank / あどばる 講演・提案資料のトンマナ）
// 使い方:
//   const S = require("<skill>/scripts/style.js");
//   const pres = new (require("pptxgenjs"))();
//   const k = S.setup(pres);            // layout・テーマ・レイアウト定義
//   let s = k.cover({ kicker, title, sub, name, role });
//   s = k.content({ kicker: "OVERVIEW", title, sub });
//   k.card(s, x, y, w, h); k.stat(s, x, y, w, h, "25.2", "億円", "支払った買収総額");
//   k.bar(s, y, "結論の一文", "補足");  k.closing({ kicker, title, body, name });
//   await k.write("deck.pptx");         // 書き出し＋テーマ色の適用
const path = require("path");

const THEME = {
  name: "Nakano Espresso",
  headFontFace: "Meiryo",
  bodyFontFace: "Meiryo",
  colors: {
    dk1: "2B2622",   // エスプレッソ（本文・暗い面）
    lt1: "FFFFFF",
    dk2: "1C1714",   // さらに濃い黒茶
    lt2: "F5EFE4",   // クリーム（カード面）
    accent1: "A78450", // ブロンズ（キッカー・数字・強調）
    accent2: "6F665F", // グレージュ（サブ・説明文）
    accent3: "E6DCCB", // カード枠
    accent4: "C9AE7E", // 淡ブロンズ（暗い面の上の強調）
    accent5: "9A8F84", // 補助グレー
    accent6: "F3E9D6", // 淡クリーム
    hlink: "A78450", folHlink: "6F665F",
  },
};
const H = THEME.colors;
const W = 13.333, M = 0.75, CW = W - M * 2; // 余白0.75"、本文幅 11.83"

function setup(pres, opts = {}) {
  pres.layout = "LAYOUT_WIDE";
  pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
  const C = pres.SchemeColor;
  const footer = opts.footer || "";

  // 暗い面：右上に大きな円を切り落とすのがモチーフ
  // pptxgenjs のレイアウトは楕円を持てないので、円と点は各スライドに描く（下の deco）
  const darkObjs = [];
  pres.defineSlideMaster({
    title: "NK_COVER",
    background: { color: C.text1 },
    objects: [
      ...darkObjs,
      { placeholder: { options: { name: "kicker", type: "body", x: M + 0.25, y: 1.5, w: 10, h: 0.38, fontSize: 12, bold: true, color: C.accent4, charSpacing: 1, margin: 0 }, text: "" } },
      { placeholder: { options: { name: "title", type: "title", x: M, y: 2.0, w: 9.5, h: 1.9, fontSize: 40, bold: true, color: C.background1, valign: "top", align: "left", margin: 0 }, text: "" } },
      { placeholder: { options: { name: "sub", type: "body", x: M, y: 4.0, w: 9.5, h: 0.6, fontSize: 15, color: C.accent3, margin: 0 }, text: "" } },
      { rect: { x: M, y: 4.95, w: 2.4, h: 0.02, fill: { color: C.accent1 }, line: { color: C.accent1 } } },
      { placeholder: { options: { name: "name", type: "body", x: M, y: 5.2, w: 9, h: 0.45, fontSize: 18, bold: true, color: C.background1, margin: 0 }, text: "" } },
      { placeholder: { options: { name: "role", type: "body", x: M, y: 5.65, w: 9, h: 0.35, fontSize: 11, color: C.accent5, margin: 0 }, text: "" } },
    ],
  });
  pres.defineSlideMaster({
    title: "NK_CONTENT",
    background: { color: C.background1 },
    objects: [
      { placeholder: { options: { name: "kicker", type: "body", x: M + 0.26, y: 0.4, w: 10.5, h: 0.36, fontSize: 12, bold: true, color: C.accent1, charSpacing: 2.4, margin: 0, valign: "middle" }, text: "" } },
      { placeholder: { options: { name: "title", type: "title", x: M, y: 0.82, w: CW, h: 0.8, fontSize: 30, bold: true, color: C.text1, align: "left", valign: "middle", margin: 0 }, text: "" } },
      { placeholder: { options: { name: "sub", type: "body", x: M, y: 1.62, w: CW, h: 0.4, fontSize: 13.5, color: C.accent2, margin: 0, valign: "top" }, text: "" } },
      { text: { text: footer, options: { x: M, y: 7.05, w: 6, h: 0.28, fontSize: 9, color: C.accent5, margin: 0 } } },
    ],
    slideNumber: { x: W - M - 0.6, y: 7.05, w: 0.6, h: 0.28, fontSize: 9, color: C.accent5, align: "right" },
  });
  pres.defineSlideMaster({
    title: "NK_DARK",
    background: { color: C.text1 },
    objects: [
      ...darkObjs,
      { placeholder: { options: { name: "kicker", type: "body", x: M + 0.26, y: 1.2, w: 10, h: 0.38, fontSize: 12, bold: true, color: C.accent4, charSpacing: 4, margin: 0 }, text: "" } },
      { placeholder: { options: { name: "title", type: "title", x: M, y: 1.7, w: 9.8, h: 1.8, fontSize: 36, bold: true, color: C.background1, align: "left", valign: "top", margin: 0 }, text: "" } },
      { rect: { x: M, y: 3.65, w: 2.0, h: 0.02, fill: { color: C.accent1 }, line: { color: C.accent1 } } },
      { placeholder: { options: { name: "body", type: "body", x: M, y: 3.9, w: 10.5, h: 2.1, fontSize: 15, color: C.accent3, valign: "top", margin: 0 }, text: "" } },
      { placeholder: { options: { name: "name", type: "body", x: M, y: 6.25, w: 10, h: 0.4, fontSize: 13, bold: true, color: C.background1, margin: 0 }, text: "" } },
    ],
  });

  const T = (s, text, o) => s.addText(text, { isTextBox: true, margin: 0, fontSize: 13, color: C.text1, valign: "top", ...o });
  const shadow = () => ({ type: "outer", color: "6F665F", opacity: 0.12, blur: 6, offset: 2, angle: 90 });
  const dot = (s, y) => s.addShape(pres.shapes.OVAL, { x: M, y, w: 0.12, h: 0.12, fill: { color: C.accent1 }, line: { color: C.accent1 }, objectName: "kicker dot" });
  const circle = (s) => s.addShape(pres.shapes.OVAL, { x: 9.3, y: -2.2, w: 5.6, h: 5.6, fill: { color: C.text2 }, line: { color: C.text2 }, objectName: "motif circle" });
  const api = {
    THEME, H, C, M, CW, W, T,
    cover(o) {
      const s = pres.addSlide({ masterName: "NK_COVER", sectionTitle: o.section });
      circle(s); dot(s, 1.63);
      ["kicker", "title", "sub", "name", "role"].forEach((k) => o[k] && s.addText(o[k], { placeholder: k }));
      return s;
    },
    content(o) {
      const s = pres.addSlide({ masterName: "NK_CONTENT", sectionTitle: o.section });
      dot(s, 0.53);
      s.addText(o.kicker, { placeholder: "kicker" });
      s.addText(o.title, { placeholder: "title" });
      if (o.sub) s.addText(o.sub, { placeholder: "sub" });
      return s;
    },
    dark(o) {
      const s = pres.addSlide({ masterName: "NK_DARK", sectionTitle: o.section });
      circle(s); dot(s, 1.33);
      ["kicker", "title", "body", "name"].forEach((k) => o[k] && s.addText(o[k], { placeholder: k }));
      return s;
    },
    // クリーム地のカード（角丸・細枠・ごく薄い影）
    card(s, x, y, w, h, o = {}) {
      return s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.06, fill: { color: o.fill || C.background2 }, line: { color: o.line || C.accent3, width: o.lw || 0.75 }, shadow: o.noShadow ? undefined : shadow(), objectName: o.name });
    },
    // 暗い面のカード
    darkCard(s, x, y, w, h, o = {}) {
      return s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.06, fill: { color: "3A322C" }, line: { color: "4E443C", width: 0.75 }, objectName: o.name });
    },
    // 数字カード：ブロンズの短い罫＋大きな数字＋単位＋説明
    stat(s, x, y, w, h, num, unit, label, o = {}) {
      api.card(s, x, y, w, h, { name: "stat " + label });
      s.addShape(pres.shapes.RECTANGLE, { x: x + 0.28, y: y + 0.3, w: 0.4, h: 0.05, fill: { color: C.accent1 }, line: { color: C.accent1 } });
      T(s, num, { x: x + 0.26, y: y + 0.48, w: w - 0.5, h: 0.85, fontSize: o.size || 40, bold: true, color: C.accent1, valign: "middle" });
      T(s, unit, { x: x + 0.26, y: y + 1.33, w: w - 0.5, h: 0.3, fontSize: 13, bold: true });
      T(s, label, { x: x + 0.26, y: y + 1.63, w: w - 0.5, h: h - 1.75, fontSize: 10.5, color: C.accent2 });
    },
    // 丸数字バッジ
    badge(s, x, y, d, text, o = {}) {
      s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: o.fill || C.accent1 }, line: { color: o.fill || C.accent1 } });
      T(s, text, { x, y, w: d, h: d, fontSize: o.size || 13, bold: true, color: C.background1, align: "center", valign: "middle" });
    },
    // ピル型ラベル
    pill(s, x, y, w, text, o = {}) {
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h: 0.3, rectRadius: 0.15, fill: { color: o.fill || C.accent1 }, line: { color: o.line || o.fill || C.accent1 } });
      T(s, text, { x, y, w, h: 0.3, fontSize: 9.5, bold: true, color: o.color || C.background1, align: "center", valign: "middle" });
    },
    // 結論バー：暗い帯に白太字＋小さな補足
    bar(s, y, main, note, o = {}) {
      const h = o.h || (note ? 0.95 : 0.7);
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: o.x ?? M, y, w: o.w ?? CW, h, rectRadius: 0.04, fill: { color: C.text1 }, line: { color: C.text1 }, objectName: "conclusion bar" });
      const runs = [{ text: main, options: { fontSize: o.size || 16, bold: true, color: C.background1, breakLine: !!note } }];
      if (note) runs.push({ text: note, options: { fontSize: 11, color: C.accent3 } });
      T(s, runs, { x: (o.x ?? M) + 0.35, y, w: (o.w ?? CW) - 0.7, h, valign: "middle" });
    },
    // 斜体ブロンズの締めの一文
    note(s, y, text) { T(s, text, { x: M, y, w: CW, h: 0.35, fontSize: 12, bold: true, italic: true, color: C.accent1 }); },
    source(s, text) { T(s, text, { x: M, y: 6.72, w: CW, h: 0.28, fontSize: 9, color: C.accent5 }); },
    async write(file) {
      await pres.writeFile({ fileName: file });
      const { applyTheme } = require(path.join(opts.pptxSkill, "scripts/apply_theme.js"));
      await applyTheme(file, THEME);
      const fs = require("fs");
      const JSZip = require(require.resolve("jszip", { paths: [require.resolve("pptxgenjs")] }));
      const zip = await JSZip.loadAsync(fs.readFileSync(file));
      const p = "ppt/theme/theme1.xml";
      zip.file(p, (await zip.file(p).async("string")).replace(/<a:ea typeface="[^"]*"\/>/g, '<a:ea typeface="Meiryo"/>'));
      fs.writeFileSync(file, await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" }));
    },
  };
  return api;
}
module.exports = { setup, THEME };
