/**
 * WineBank ガントチャート描画モジュール（pptxgenjs用）
 *
 * 日付から座標を計算してバー・マイルストーン・月グリッドを描く。
 * 手で left/width を計算するとバーが1〜2日ずれるので、必ずこれを通す。
 *
 * 使い方:
 *
 *   const { addGantt, D } = require("./gantt.js");
 *
 *   addGantt(slide, pptx, {
 *     x: 0.5, y: 1.2, w: 12.33, h: 5.3,   // チャート全体の矩形（インチ）
 *     labelW: 2.8,                         // 左の項目名カラム幅
 *     start: D(2026, 8, 1),                // 時間軸の左端
 *     end:   D(2027, 5, 31),               // 時間軸の右端
 *     today: D(2026, 8, 18),               // 「現在」の破線。不要なら省略
 *     rows: [
 *       { type: "group", name: "契約・法務", color: "2C4A6E" },
 *       { type: "task",  name: "契約条件精査", s: D(2026,8,1), e: D(2026,8,31), color: "2C4A6E", live: true },
 *       { type: "ms",    name: "契約締結",     date: D(2026,9,1),               color: "2C4A6E" },
 *     ],
 *   });
 *
 * 行の高さは h から自動で割る。行数が多いと文字が潰れるので、
 * 1スライド18行くらいを上限にしてフェーズごとにスライドを分けること。
 */

const INK = "1B1A19";
const GREY = "6E6866";
const LINE = "DCD7D2";
const BAND = "F5F3F1";

/** new Date(y, m, d) の月を1始まりで書けるようにしただけのもの */
function D(y, m, d) {
  return new Date(y, m - 1, d);
}

const DAY = 86400000;

function addGantt(slide, pptx, o) {
  const {
    x, y, w, h, labelW,
    start, end, rows,
    today = null,
    rowFont = 9,
    labelFont = "Yu Gothic",
    numFont = "Arial",
  } = o;

  const tlX = x + labelW;              // タイムライン領域の左端
  const tlW = w - labelW;
  const headH = 0.34;                  // 月ヘッダーの高さ
  const bodyY = y + headH;
  const bodyH = h - headH;
  const rowH = bodyH / rows.length;
  const span = (end - start) / DAY;

  // 日付 → タイムライン内のX座標（インチ）
  const px = (dt) => tlX + ((dt - start) / DAY / span) * tlW;

  // ---- 月ヘッダーと縦グリッド -------------------------------------------
  const months = [];
  let cur = new Date(start.getFullYear(), start.getMonth(), 1);
  while (cur <= end) {
    const next = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
    months.push({ from: cur, to: next });
    cur = next;
  }

  for (const m of months) {
    const mx = Math.max(px(m.from), tlX);
    const mw = Math.min(px(m.to), tlX + tlW) - mx;
    if (mw <= 0) continue;

    const isJan = m.from.getMonth() === 0;
    slide.addShape(pptx.ShapeType.line, {
      x: mx, y: y, w: 0, h: h,
      line: { color: isJan ? GREY : LINE, width: isJan ? 1 : 0.75 },
    });
    slide.addText(`${m.from.getMonth() + 1}月`, {
      x: mx + 0.04, y: y + 0.02, w: Math.max(mw - 0.06, 0.3), h: 0.19,
      fontSize: 9, fontFace: numFont, color: INK, margin: 0, valign: "middle",
    });
    // 年は1月と初月だけ添える。毎月書くとノイズになる
    if (isJan || m.from.getTime() === months[0].from.getTime()) {
      slide.addText(String(m.from.getFullYear()), {
        x: mx + 0.04, y: y + 0.18, w: Math.max(mw - 0.06, 0.3), h: 0.15,
        fontSize: 7, fontFace: numFont, color: GREY, margin: 0, valign: "middle",
      });
    }
  }

  // ヘッダー下の区切り線とラベル列の縦罫
  slide.addShape(pptx.ShapeType.line, {
    x: x, y: bodyY, w: w, h: 0, line: { color: GREY, width: 0.75 },
  });
  slide.addShape(pptx.ShapeType.line, {
    x: tlX, y: y, w: 0, h: h, line: { color: GREY, width: 0.75 },
  });
  // 右端も閉じる。閉じないと右端まで伸びたバーが枠外に流れて見える
  slide.addShape(pptx.ShapeType.line, {
    x: x + w, y: y, w: 0, h: h, line: { color: GREY, width: 0.75 },
  });

  // ---- 行 ---------------------------------------------------------------
  rows.forEach((r, i) => {
    const ry = bodyY + i * rowH;
    const color = r.color || INK;

    if (r.type === "group") {
      slide.addShape(pptx.ShapeType.rect, {
        x: x, y: ry, w: w, h: rowH, fill: { color: BAND }, line: { color: BAND },
      });
      slide.addShape(pptx.ShapeType.rect, {
        x: x + 0.08, y: ry + rowH / 2 - 0.045, w: 0.09, h: 0.09,
        fill: { color }, line: { color },
      });
      slide.addText(r.name, {
        x: x + 0.24, y: ry, w: labelW - 0.3, h: rowH,
        fontSize: rowFont + 0.5, bold: true, fontFace: labelFont,
        color: INK, margin: 0, valign: "middle",
      });
      return;
    }

    // 項目名
    slide.addText(r.name, {
      x: x + 0.1, y: ry, w: labelW - 0.18, h: rowH,
      fontSize: rowFont, fontFace: labelFont, color: INK,
      margin: 0, valign: "middle",
    });

    if (r.type === "ms") {
      const mx = px(r.date);
      const sz = Math.min(0.13, rowH * 0.55);
      slide.addShape(pptx.ShapeType.diamond, {
        x: mx - sz / 2, y: ry + rowH / 2 - sz / 2, w: sz, h: sz,
        fill: { color }, line: { color },
      });
      // ラベルは右に置くが、右端に近いと切れるので左に逃がす
      const lab = fmt(r.date);
      const nearEnd = mx > tlX + tlW * 0.72;
      slide.addText(lab, {
        x: nearEnd ? mx - 1.0 : mx + sz / 2 + 0.05,
        y: ry, w: 0.86, h: rowH,
        fontSize: rowFont - 0.5, bold: true, fontFace: numFont, color,
        align: nearEnd ? "right" : "left", margin: 0, valign: "middle",
      });
      return;
    }

    // バー
    const bx = px(r.s);
    const bw = Math.max(px(r.e) - bx, 0.045);
    const bh = Math.min(0.15, rowH * 0.52);
    slide.addShape(pptx.ShapeType.roundRect, {
      x: bx, y: ry + rowH / 2 - bh / 2, w: bw, h: bh,
      fill: { color }, line: { color }, rectRadius: 0.02,
    });
    // 進行中の項目は輪郭を足して現在地を目立たせる
    if (r.live) {
      slide.addShape(pptx.ShapeType.roundRect, {
        x: bx - 0.035, y: ry + rowH / 2 - bh / 2 - 0.035,
        w: bw + 0.07, h: bh + 0.07,
        fill: { color: "FFFFFF", transparency: 100 },
        line: { color, width: 1 }, rectRadius: 0.02,
      });
    }

    const range = `${fmt(r.s)} – ${fmt(r.e)}`;
    if (bw >= 1.05) {
      // バーの中に入る幅があるなら中に置く
      slide.addText(range, {
        x: bx + 0.06, y: ry, w: bw - 0.12, h: rowH,
        fontSize: rowFont - 1.5, fontFace: numFont, color: "FFFFFF",
        margin: 0, valign: "middle",
      });
    } else {
      // 入らないときは外に出す。右端に近ければ左側へ
      const nearEnd = bx + bw > tlX + tlW * 0.8;
      slide.addText(range, {
        x: nearEnd ? bx - 1.02 : bx + bw + 0.05,
        y: ry, w: 0.98, h: rowH,
        fontSize: rowFont - 1.5, fontFace: numFont, color: GREY,
        align: nearEnd ? "right" : "left", margin: 0, valign: "middle",
      });
    }
  });

  // ---- 現在地の破線 -------------------------------------------------------
  if (today && today >= start && today <= end) {
    const tx = px(today);
    slide.addShape(pptx.ShapeType.line, {
      x: tx, y: y, w: 0, h: h,
      line: { color: INK, width: 1, dashType: "dash" },
    });
    slide.addText("現在", {
      x: tx + 0.05, y: bodyY + 0.02, w: 0.5, h: 0.17,
      fontSize: 7.5, fontFace: labelFont, color: INK, margin: 0, valign: "middle",
    });
  }
}

/** 凡例。ガントの下に置く */
function addLegend(slide, pptx, o) {
  const { x, y, items, gap = 1.5, font = "Yu Gothic", fontSize = 8.5 } = o;
  items.forEach((it, i) => {
    const ix = x + i * gap;
    if (it.shape === "diamond") {
      slide.addShape(pptx.ShapeType.diamond, {
        x: ix, y: y + 0.035, w: 0.1, h: 0.1,
        fill: { color: it.color || INK }, line: { color: it.color || INK },
      });
    } else {
      slide.addShape(pptx.ShapeType.rect, {
        x: ix, y: y + 0.055, w: 0.16, h: 0.075,
        fill: { color: it.color }, line: { color: it.color },
      });
    }
    slide.addText(it.label, {
      x: ix + 0.22, y: y, w: gap - 0.28, h: 0.18,
      fontSize, fontFace: font, color: GREY, margin: 0, valign: "middle",
    });
  });
}

function fmt(dt) {
  return `${dt.getMonth() + 1}/${dt.getDate()}`;
}

module.exports = { addGantt, addLegend, D, INK, GREY, LINE, BAND };
