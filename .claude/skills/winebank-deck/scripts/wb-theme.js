/**
 * WineBank 提案書テーマ（pptxgenjs）
 * 会社紹介資料（2026年6月版）から実測した値を固定してある。
 *
 * 使い方:
 *   const { init, slide, cover, card, band, stats, tableHeader, chip,
 *           programTab, num, bullets, head, rule, T } = require("./wb-theme");
 *   const pres = init();
 *   const s = slide(pres, "OVERVIEW", "タイトル", "リード文");
 *   card(pres, s, T.M, 1.60, 3.9, 2.0);
 *   pres.writeFile({ fileName: "out.pptx" });
 *
 * ロゴは同ディレクトリの wine-bank-logo.png を読む。別の場所に置く場合は
 * init({ logo: "path/to/logo.png" }) で渡す。
 */

const fs = require("fs");
const path = require("path");
const pptxgen = require("pptxgenjs");

/* ============================ トークン ============================ */

const T = {
  // キャンバス
  W: 13.333,
  H: 7.5,
  M: 0.62,        // 左右余白
  BAR_H: 0.30,    // フッターバーの高さ
  BODY_TOP: 1.52, // 本文開始
  BODY_BOT: 7.02, // 本文下限

  // 色
  PAPER: "FFFFFF",
  INK: "1A1A1A",
  GREY: "6E7378",
  GREY_LT: "A6ABAF",
  NAVY: "2F3941",
  TAN: "C68A65",       // アクセント①：供給側・商業側
  TAN_DEEP: "B97246",  // カードヘッダーの塗り
  TAN_LT: "EFDCCE",    // 濃紺の上に置く文字
  BLUE: "2E5495",      // アクセント②：利用者側
  BLUE_LT: "D6E2F5",
  MIST: "F6F6F6",      // 無彩のカード地
  MIST_WARM: "F3EFEC", // タン側のカード地
  MIST_COOL: "F0F4FA", // ブルー側のカード地
  LINE: "DDE0E2",
  ON_NAVY: "DDE1E4",   // 濃紺上の本文

  // フォント
  FJP: "Yu Gothic",
  FEN: "Calibri",
};

let _logoData = null;
let _pageNo = 0;

/* ============================ 初期化 ============================ */

function init(opts = {}) {
  const logoPath = opts.logo || path.join(__dirname, "wine-bank-logo.png");
  if (fs.existsSync(logoPath)) {
    _logoData = "image/png;base64," + fs.readFileSync(logoPath).toString("base64");
  }
  _pageNo = 0;

  const pres = new pptxgen();
  pres.defineLayout({ name: "WB16x9", width: T.W, height: T.H });
  pres.layout = "WB16x9";
  pres.author = opts.author || "株式会社WineBank";
  pres.company = "株式会社WineBank";
  if (opts.title) pres.title = opts.title;
  return pres;
}

function resetPageNo(n = 0) { _pageNo = n; }

/* ============================ 共通クローム ============================ */

/** 濃紺フッターバー。showPage=false で表紙用（ページ番号なし） */
function bar(pres, s, showPage = true) {
  s.addShape(pres.ShapeType.rect, {
    x: 0, y: T.H - T.BAR_H, w: T.W, h: T.BAR_H,
    fill: { color: T.NAVY }, line: { width: 0 },
  });
  s.addText("CONFIDENTIAL", {
    x: T.M, y: T.H - T.BAR_H - 0.34, w: 3.2, h: 0.28, margin: 0,
    fontFace: T.FEN, fontSize: 8.5, color: "C7CACC", charSpacing: 1.2,
  });
  if (showPage) {
    s.addText(String(_pageNo), {
      x: T.W - T.M - 0.8, y: T.H - T.BAR_H - 0.34, w: 0.8, h: 0.28,
      margin: 0, align: "right",
      fontFace: T.FEN, fontSize: 10, color: T.GREY_LT,
    });
  }
}

/** 右上ロゴ。scale で表紙用に大きくできる */
function logo(s, scale = 1) {
  if (!_logoData) return;
  const w = 1.36 * scale;
  s.addImage({ data: _logoData, x: T.W - T.M - w, y: 0.32, w, h: 0.199 * scale * 1.36 });
}

/** タンのセクションチップ。英字大文字・12文字以内に収める */
function chip(pres, s, label, x = T.M, y = 0.32, color = T.TAN) {
  const w = 0.32 + label.length * 0.090;
  s.addShape(pres.ShapeType.roundRect, {
    x, y, w, h: 0.26, rectRadius: 0.03,
    fill: { color }, line: { width: 0 },
  });
  s.addText(label, {
    x, y, w, h: 0.26, margin: 0, align: "center", valign: "middle",
    fontFace: T.FJP, fontSize: 8.5, bold: true, color: T.PAPER,
  });
  return w;
}

/** プログラム説明ページ用の左上タブ（PROGRAM / 01 の2行） */
function programTab(pres, s, no, x = T.M, y = 0.30, color = T.TAN) {
  s.addShape(pres.ShapeType.rect, {
    x, y, w: 0.92, h: 0.62, fill: { color }, line: { width: 0 },
  });
  s.addText("PROGRAM", {
    x, y: y + 0.06, w: 0.92, h: 0.20, margin: 0, align: "center",
    fontFace: T.FEN, fontSize: 8, bold: true, color: T.PAPER, charSpacing: 0.6,
  });
  s.addText(String(no), {
    x, y: y + 0.24, w: 0.92, h: 0.32, margin: 0, align: "center",
    fontFace: T.FEN, fontSize: 17, bold: true, color: T.PAPER,
  });
}

/* ============================ ページ ============================ */

/**
 * 標準コンテンツページ。
 *   slide(pres, "OVERVIEW", "タイトル", "リード文")
 *   slide(pres, { program: "01" }, "タイトル", "リード文")   // チップの代わりにタブ
 *   slide(pres, null, "タイトル")                            // チップなし
 * 本文は y = T.BODY_TOP (1.52) から T.BODY_BOT (7.02) の間に置く。
 */
function slide(pres, label, title, lead) {
  _pageNo++;
  const s = pres.addSlide();
  s.background = { color: T.PAPER };
  logo(s);

  let titleX = T.M;
  if (label && typeof label === "object" && label.program) {
    programTab(pres, s, label.program, T.M, 0.30, label.color || T.TAN);
    titleX = T.M + 1.16;
  } else if (label) {
    chip(pres, s, label);
  }

  s.addText(title, {
    x: titleX, y: 0.64, w: T.W - titleX - 1.9, h: 0.46, margin: 0, valign: "middle",
    fontFace: T.FJP, fontSize: 23, bold: true, color: T.INK,
  });
  if (lead) {
    s.addText(lead, {
      x: T.M, y: 1.12, w: T.W - T.M * 2, h: 0.34, margin: 0,
      fontFace: T.FJP, fontSize: 11.5, color: T.GREY, lineSpacing: 17,
    });
  }
  bar(pres, s, true);
  return s;
}

/**
 * 表紙。stats は [["55年","酒販事業の実績"], ...] を4つまで。
 *   cover(pres, { kicker, addressee, title, sub, stats, footer })
 */
function cover(pres, o = {}) {
  const s = pres.addSlide();
  s.background = { color: T.PAPER };
  logo(s, 1.37);

  if (o.kicker) {
    s.addText(o.kicker, {
      x: T.M, y: 2.06, w: 9.0, h: 0.34, margin: 0,
      fontFace: T.FJP, fontSize: 13, color: T.GREY,
    });
  }
  if (o.addressee) {
    s.addText(o.addressee, {
      x: T.M, y: 2.46, w: 9.0, h: 0.34, margin: 0,
      fontFace: T.FJP, fontSize: 13.5, bold: true, color: T.TAN,
    });
  }
  s.addText(o.title || "", {
    x: T.M, y: 2.94, w: 11.0, h: 0.76, margin: 0,
    fontFace: T.FJP, fontSize: 36, bold: true, color: T.INK,
  });
  rule(pres, s, T.M, 3.86);
  if (o.sub) {
    s.addText(o.sub, {
      x: T.M, y: 4.10, w: 9.4, h: 0.76, margin: 0,
      fontFace: T.FJP, fontSize: 13, color: "44494D", lineSpacing: 22,
    });
  }
  if (o.stats) stats(s, o.stats, 5.42);
  if (o.footer) {
    s.addText(o.footer, {
      x: T.M, y: 6.56, w: 6.0, h: 0.28, margin: 0,
      fontFace: T.FJP, fontSize: 10.5, color: T.GREY,
    });
  }
  bar(pres, s, false);
  return s;
}

/* ============================ 部品 ============================ */

/** 標準カード。影なし・枠なしが既定。tone: "warm" | "cool" | "navy" | "white" */
function card(pres, s, x, y, w, h, opts = {}) {
  const map = {
    warm: T.MIST_WARM, cool: T.MIST_COOL, navy: T.NAVY, white: T.PAPER,
  };
  const fill = opts.fill || map[opts.tone] || T.MIST;
  s.addShape(pres.ShapeType.roundRect, {
    x, y, w, h, rectRadius: opts.radius === undefined ? 0.05 : opts.radius,
    fill: { color: fill },
    line: opts.line || (fill === T.PAPER ? { color: T.LINE, width: 1 } : { width: 0 }),
  });
}

/** タンのカードヘッダー（カード上端に重ねる） */
function cardHeader(pres, s, x, y, w, label, opts = {}) {
  const h = opts.h || 0.44;
  s.addShape(pres.ShapeType.rect, {
    x, y, w, h, fill: { color: opts.color || T.TAN_DEEP }, line: { width: 0 },
  });
  s.addText(label, {
    x, y, w, h, margin: 0, align: "center", valign: "middle",
    fontFace: T.FJP, fontSize: opts.size || 13, bold: true, color: T.PAPER,
  });
}

/** 全幅の濃紺バンド。そのページの結論を1文で。1枚に1本まで */
function band(pres, s, y, text, opts = {}) {
  const h = opts.h || 0.48;
  s.addShape(pres.ShapeType.rect, {
    x: T.M, y, w: T.W - T.M * 2, h,
    fill: { color: opts.fill || T.NAVY }, line: { width: 0 },
  });
  s.addText(text, {
    x: T.M + 0.2, y, w: T.W - T.M * 2 - 0.4, h, margin: 0,
    align: opts.align || "center", valign: "middle",
    fontFace: T.FJP, fontSize: opts.size || 13.5, bold: true,
    color: opts.color || T.PAPER,
  });
}

/** 統計タイル（数字＋ラベル）を横並び。4つまでが収まりよい */
function stats(s, items, y, opts = {}) {
  const gap = opts.gap === undefined ? 0.22 : opts.gap;
  const total = opts.w || (T.W - T.M * 2);
  const w = (total - gap * (items.length - 1)) / items.length;
  items.forEach((it, i) => {
    const x = (opts.x === undefined ? T.M : opts.x) + i * (w + gap);
    s.addText(it[0], {
      x, y, w, h: 0.50, margin: 0,
      fontFace: T.FJP, fontSize: opts.size || 26, bold: true, color: opts.color || T.TAN,
    });
    s.addText(it[1], {
      x, y: y + 0.52, w, h: 0.28, margin: 0,
      fontFace: T.FJP, fontSize: 9.5, color: T.GREY,
    });
  });
}

/**
 * 表のヘッダー行を濃紺で塗る。pptxgenjsのaddTableは行ごとの塗りを持てないので、
 * addTableのあとに呼んで矩形とテキストを重ねる。
 *   tableHeader(pres, s, T.M, 1.60, [2.4, 2.1, 3.0], ["列1","列2","列3"])
 */
function tableHeader(pres, s, x, y, colW, labels, opts = {}) {
  const h = opts.h || 0.46;
  const tW = colW.reduce((a, b) => a + b, 0);
  s.addShape(pres.ShapeType.rect, {
    x, y, w: tW, h, fill: { color: opts.fill || T.NAVY }, line: { width: 0 },
  });
  let cx = x;
  labels.forEach((lab, i) => {
    s.addText(lab, {
      x: cx + 0.12, y, w: colW[i] - 0.24, h, margin: 0, valign: "middle",
      fontFace: T.FJP, fontSize: opts.size || 9.8, bold: true,
      color: opts.color || T.TAN_LT,
    });
    cx += colW[i];
  });
}

/** 表本体の既定オプション（addTableに展開して使う） */
function tableOpts(opts = {}) {
  return {
    border: { type: "solid", color: T.LINE, pt: 0.75 },
    fontFace: T.FJP, fontSize: opts.size || 9.6, color: T.INK,
    valign: "middle", rowH: opts.rowH || 0.46, autoPage: false,
  };
}

/** 円形の番号バッジ。順序に意味があるページだけで使う */
function num(pres, s, x, y, d, label, opts = {}) {
  s.addShape(pres.ShapeType.ellipse, {
    x, y, w: d, h: d, fill: { color: opts.fill || T.TAN }, line: { width: 0 },
  });
  s.addText(label, {
    x, y, w: d, h: d, margin: 0, align: "center", valign: "middle",
    fontFace: T.FEN, fontSize: opts.size || 11, bold: true, color: opts.color || T.PAPER,
  });
}

/** 短いタンの下線（表紙・締めページのタイトル直下のみ） */
function rule(pres, s, x, y, w = 1.30, color = T.TAN) {
  s.addShape(pres.ShapeType.rect, {
    x, y, w, h: 0.045, fill: { color }, line: { width: 0 },
  });
}

/** 小見出し */
function head(s, text, x, y, w, opts = {}) {
  s.addText(text, {
    x, y, w, h: 0.30, margin: 0,
    fontFace: T.FJP, fontSize: opts.size || 14, bold: true, color: opts.color || T.INK,
  });
}

/** 箇条書き。■の小さめ記号を使う（リテラルの「・」は入れない） */
function bullets(s, items, x, y, w, h, o = {}) {
  s.addText(
    items.map((t, i) => ({
      text: t,
      options: { bullet: { code: "25AA" }, breakLine: i !== items.length - 1 },
    })),
    {
      x, y, w, h, margin: 0,
      fontFace: T.FJP, fontSize: o.size || 11, color: o.color || T.INK,
      lineSpacing: o.lineSpacing || 16,
      paraSpaceAfter: o.gap === undefined ? 5 : o.gap,
    }
  );
}

/** 会社紹介などの既存ページを画像でそのまま挿入する（全面） */
function fullBleedImage(s, jpgPath) {
  const data = "image/jpeg;base64," + fs.readFileSync(jpgPath).toString("base64");
  s.addImage({ data, x: 0, y: 0, w: T.W, h: T.H });
}

/** 画像だけのページ（Appendixに原本を差し込む用） */
function imageSlide(pres, jpgPath) {
  _pageNo++;
  const s = pres.addSlide();
  s.background = { color: T.PAPER };
  fullBleedImage(s, jpgPath);
  return s;
}

module.exports = {
  T, init, resetPageNo,
  slide, cover, imageSlide,
  bar, logo, chip, programTab,
  card, cardHeader, band, stats,
  tableHeader, tableOpts, num, rule, head, bullets, fullBleedImage,
};
