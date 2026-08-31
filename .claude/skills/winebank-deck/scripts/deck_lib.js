/**
 * WineBank deck library — palette + slide helpers for pptxgenjs.
 *
 * Usage:
 *   const D = require("./deck_lib");
 *   const { pres, C, G, base, card, badge, tb, hdr, cel, lft, t } = D.init("デッキ名");
 *   const s = base("KICKER", "スライドタイトル", "サブタイトル");
 *   card(s, G.M, 1.8, G.C3, 2.5);
 *   D.save("/abs/path/out.pptx");
 */
const pptxgen = require("pptxgenjs");

// ---- palette -------------------------------------------------------------
const C = {
  BG:     "1A0E14",  // wine-black — slide background, dominant
  PANEL:  "2A1620",  // default card
  PANEL2: "38202C",  // emphasised card (one per slide, no more)
  BURG:   "7B1E3A",  // burgundy — table headers, closing banners
  GOLD:   "C9A227",  // primary accent — numbers, badges, kickers
  GOLD_L: "E8CE78",  // light gold — card titles, banner text
  TEXT:   "F2EDE6",  // body text on dark
  MUTE:   "A2908C",  // secondary text
  MINT:   "7FD1AE",  // positive figures only
  AMBER:  "E0A458",  // caution
  RED:    "D96A6A",  // negative figures / blockers
  RULE:   "4A3038",  // table gridlines
  FOOT:   "6B5A5F",  // footer
};

// ---- geometry (LAYOUT_WIDE = 13.3 x 7.5 in) ------------------------------
const G = {
  W: 13.3, H: 7.5, M: 0.62,
  get CW() { return this.W - this.M * 2; },   // 12.06 content width
  BODY_TOP: 1.78,      // first content row under kicker/title/subtitle
  BODY_BOTTOM: 6.62,   // hard floor — footer sits at 7.04
  C2: 5.90, G2: 6.16,  // 2 columns: width, x-step
  C3: 3.86, G3: 4.14,  // 3 columns
  C4: 2.85, G4: 3.07,  // 4 columns
  JP: "Meiryo",        // Japanese face; Arial for latin kickers/labels
};

let pres = null;

function init(title, author) {
  pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE";
  pres.author = author || "WineBank";
  pres.title = title || "WineBank";
  return api();
}

const t = (o) => Object.assign(
  { isTextBox: true, fontFace: G.JP, color: C.TEXT, margin: 0 }, o);

const shadow = () => ({ type: "outer", color: "000000", blur: 10,
  offset: 2, angle: 90, opacity: 0.35 });

/** Standard slide chrome: kicker, title, subtitle, confidential footer. */
function base(kicker, title, sub, footer) {
  const s = pres.addSlide();
  s.background = { color: C.BG };
  if (kicker) s.addText(kicker, t({ x: G.M, y: 0.34, w: G.CW, h: 0.26,
    fontFace: "Arial", fontSize: 10.5, bold: true, color: C.GOLD, charSpacing: 3 }));
  s.addText(title, t({ x: G.M, y: 0.62, w: G.CW, h: 0.6, fontSize: 29, bold: true }));
  if (sub) s.addText(sub, t({ x: G.M, y: 1.26, w: G.CW, h: 0.34,
    fontSize: 13, color: C.MUTE }));
  s.addText(footer || "WineBank CONFIDENTIAL", t({ x: G.M, y: G.H - 0.46, w: 5,
    h: 0.24, fontFace: "Arial", fontSize: 8.5, color: C.FOOT }));
  return s;
}

/** Rounded panel. Build a fresh options object every call — pptxgenjs mutates. */
function card(s, x, y, w, h, fill) {
  s.addShape(pres.ShapeType.roundRect, { x, y, w, h, rectRadius: 0.06,
    fill: { color: fill || C.PANEL },
    line: { color: fill || C.PANEL, width: 0 }, shadow: shadow() });
}

/** Gold numbered circle — the deck's one repeated motif. */
function badge(s, x, y, n, color) {
  const d = 0.36;
  s.addShape(pres.ShapeType.ellipse, { x, y, w: d, h: d,
    fill: { color: color || C.GOLD }, line: { color: color || C.GOLD, width: 0 } });
  s.addText(String(n), t({ x, y, w: d, h: d, fontFace: "Arial", fontSize: 13,
    bold: true, color: C.BG, align: "center", valign: "middle" }));
}

/** Full-width closing statement. Keep to one line of GOLD_L plus optional detail. */
function banner(s, y, h, headline, detail, fill) {
  card(s, G.M, y, G.CW, h, fill || C.BURG);
  s.addText(headline, t({ x: G.M + 0.45, y: y + 0.2, w: G.CW - 0.9, h: 0.4,
    fontSize: 17, bold: true, color: C.GOLD_L }));
  if (detail) s.addText(detail, t({ x: G.M + 0.45, y: y + 0.64, w: G.CW - 0.9,
    h: 0.34, fontSize: 12, color: C.TEXT }));
}

// ---- tables --------------------------------------------------------------
const tb = () => ({ fontFace: G.JP, fontSize: 11.5, color: C.TEXT,
  valign: "middle", border: { type: "solid", color: C.RULE, pt: 0.75 },
  autoPage: false });
const hdr = (x) => ({ text: x, options: { fill: { color: C.BURG }, bold: true,
  color: C.TEXT, fontSize: 11, align: "center" } });
const cel = (x, o) => ({ text: x, options: Object.assign(
  { fill: { color: C.PANEL }, fontSize: 11, align: "center" }, o || {}) });
const lft = (x, o) => cel(x, Object.assign({ align: "left" }, o || {}));

/** Bottom edge of a table. Anything placed below must start at least 0.12 lower. */
const tableEnd = (y, rowH) => y + rowH.reduce((a, b) => a + b, 0);

/** Rough height of Japanese text. Overestimates slightly, which is what you want. */
function textHeight(text, boxWidth, fontSize, lineSpacing) {
  const perLine = Math.max(1, Math.floor(boxWidth / (fontSize / 72)));
  const lines = Math.ceil([...text].length / perLine);
  return lines * ((lineSpacing || fontSize * 1.35) / 72);
}

function save(path) {
  return pres.writeFile({ fileName: path }).then((f) => { console.log("WROTE", f); return f; });
}

function api() {
  return { pres, C, G, t, base, card, badge, banner, tb, hdr, cel, lft,
           tableEnd, textHeight, save, shadow };
}

module.exports = { init, C, G, tableEnd, textHeight };
