const pptxgen = require("pptxgenjs");
const path = require("path");
const SKILL = "/root/.claude/skills/synced/843eb632-0f1a-4cd1-8ff6-9c7a1257936c_e08a8281-da6b-45f5-9158-3c38a60baabf/pptx";
const { applyTheme } = require(path.join(SKILL, "scripts/apply_theme.js"));

const THEME = {
  name: "Brasserie Thierry Marx",
  headFontFace: "Cambria",
  bodyFontFace: "Calibri",
  colors: {
    dk1: "1A1416", lt1: "FFFFFF", dk2: "4A3A40", lt2: "F4F1F2",
    accent1: "6D2E46", accent2: "A78450", accent3: "8C6B7A",
    accent4: "2E5E4E", accent5: "B4495F", accent6: "6E6166",
    hlink: "6D2E46", folHlink: "8C6B7A",
  },
};
const BORDEAUX = "6D2E46", GOLD = "A78450", INK = "1A1416",
      MUTED = "6E6166", TINT = "F4F1F2", LINE = "DCD2D6",
      GREEN = "2E5E4E", RED = "B4495F";

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";            // 13.33 x 7.5
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
pres.author = "株式会社WineBank";
pres.title  = "BRASSERIE Thierry Marx 事業収支";

pres.defineSlideMaster({
  title: "CONTENT",
  background: { color: "FFFFFF" },
  objects: [
    { text: { text: "CONFIDENTIAL",
      options: { x: 0.55, y: 7.02, w: 3, h: 0.28, fontSize: 9, color: MUTED,
                 fontFace: "Calibri", isTextBox: true, margin: 0 } } },
    { placeholder: { options: { name: "title", type: "title", x: 0.55, y: 0.38, w: 12.2, h: 0.52,
        fontSize: 28, bold: true, color: INK, fontFace: "Cambria", margin: 0,
        align: "left", valign: "middle" }, text: " " } },
    { placeholder: { options: { name: "sub", type: "body", x: 0.55, y: 0.93, w: 12.2, h: 0.34,
        fontSize: 11.5, color: BORDEAUX, fontFace: "Calibri", margin: 0,
        align: "left", valign: "middle" }, text: " " } },
  ],
  slideNumber: { x: 12.6, y: 7.02, w: 0.5, h: 0.28, fontSize: 9, color: MUTED,
                 fontFace: "Calibri", align: "right" },
});

const f1 = (v) => v.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const pc = (v) => v.toFixed(1) + "%";

function tHead(cells, opts = {}) {
  return cells.map((t, i) => ({ text: t, options: Object.assign({
    bold: true, color: "FFFFFF", fill: { color: BORDEAUX }, fontSize: opts.fs || 10,
    align: i === 0 ? "left" : "center", valign: "middle", fontFace: "Calibri" }, opts.extra || {}) }));
}
function tRow(label, vals, o = {}) {
  const fs = o.fs || 10;
  const base = { fontSize: fs, valign: "middle", fontFace: "Calibri",
                 color: o.hl ? "FFFFFF" : (o.sub ? BORDEAUX : INK),
                 bold: !!(o.hl || o.sub), fill: o.hl ? { color: BORDEAUX } : (o.sub ? { color: TINT } : undefined) };
  const out = [{ text: label, options: Object.assign({}, base, { align: "left", indent: o.ind ? 1 : 0 }) }];
  vals.forEach((v) => out.push({ text: v, options: Object.assign({}, base, { align: "right" }) }));
  return out;
}

/* ───────── Slide 1 : 単体事業収支 ───────── */
{
  const s = pres.addSlide({ masterName: "CONTENT" });
  s.addText("六本木ミッドタウン店 単体事業収支", { placeholder: "title" });
  s.addText("2026年10月 事業収支統合モデル準拠 ｜ 183.59㎡(55.5坪)・114席・年間363日営業",
            { placeholder: "sub" });

  const pl = [
    ["売上高", 423.4, 100.0, "hl"], ["売上原価", 127.0, 30.0], ["人件費", 146.1, 34.5],
    ["業務委託費・消耗品他", 10.2, 2.4], ["部門利益", 140.1, 33.1, "sub"],
    ["広告宣伝費・販売促進費", 5.9, 1.4], ["その他経費", 2.1, 0.5], ["水道光熱費", 16.9, 4.0],
    ["GOP（店舗営業総利益）", 115.2, 27.2, "sub"], ["ロイヤリティ", 16.9, 4.0],
    ["保険・租税公課", 3.0, 0.7], ["地代家賃（固定）", 26.6, 6.3], ["歩合家賃", 6.4, 1.5],
    ["修繕維持費（FFE）", 10.6, 2.5], ["EBITDA", 51.6, 12.2, "hl"],
    ["減価償却費", 20.8, 4.9], ["営業利益", 30.8, 7.3, "hl"],
  ];
  const rows = [tHead(["満年度ベース 損益計算（百万円）", "金額", "対売上比"], { fs: 10 })];
  pl.forEach(([l, a, b, k]) => rows.push(tRow(l, [f1(a), pc(b)], { fs: 9.5, hl: k === "hl", sub: k === "sub" })));
  s.addTable(rows, { x: 0.55, y: 1.42, w: 5.55, colW: [3.05, 1.25, 1.25], rowH: 0.248,
    border: { type: "solid", color: LINE, pt: 0.5 }, autoPage: false });

  const yr = [
    ["売上立上り率", "90%", "98%", "100%"],
    ["売上高", "381.0", "414.9", "423.4"],
    ["EBITDA", "46.1", "56.3", "63.4"],
    ["EBITDA率", "12.1%", "13.6%", "15.0%"],
    ["営業利益", "25.3", "35.5", "42.6"],
    ["営業利益率", "6.6%", "8.6%", "10.1%"],
  ];
  const r2 = [tHead(["年次推移（百万円）", "1年目", "2年目", "3年目以降"], { fs: 10 })];
  yr.forEach(([l, a, b, c]) => r2.push(tRow(l, [a, b, c],
    { fs: 10, hl: l === "EBITDA" || l === "営業利益" })));
  s.addTable(r2, { x: 6.45, y: 1.42, w: 6.3, colW: [2.55, 1.25, 1.25, 1.25], rowH: 0.3,
    border: { type: "solid", color: LINE, pt: 0.5 }, autoPage: false });

  s.addShape(pres.ShapeType.roundRect, { x: 6.45, y: 3.72, w: 6.3, h: 2.9,
    fill: { color: TINT }, line: { color: TINT }, rectRadius: 0.06, shadow: { type: "none" } });
  s.addText("主要前提", { x: 6.72, y: 3.86, w: 5.8, h: 0.3, fontSize: 12, bold: true,
    color: BORDEAUX, fontFace: "Cambria", isTextBox: true, margin: 0 });
  s.addText([
    { text: "席数114席（カウンター14・ダイニング23・個室25・テラス52）", options: { bullet: true, breakLine: true } },
    { text: "席効率 店内75%・テラス50%／延べ席回転率 1.50回/日", options: { bullet: true, breakLine: true } },
    { text: "客単価 ランチ4,000円・カフェ2,500円・ディナー15,000円（テラス10,000円）", options: { bullet: true, breakLine: true } },
    { text: "日商 約117万円／月商 約3,530万円／年商 4.23億円", options: { bullet: true, breakLine: true } },
    { text: "売上原価30.0%（料理・飲料とも30.0%）・人件費34.5%／人員26名", options: { bullet: true, breakLine: true } },
    { text: "ロイヤリティ4.0%・歩合家賃7%（閾値超過分）・地代家賃 月222万円", options: { bullet: true, breakLine: true } },
    { text: "2年目以降は人件費33.5%→32.5%等へ段階改善（本部集中・多能工化）", options: { bullet: true, breakLine: true } },
    { text: "内装1億円は家主が立替え、10年分割で返済（資産計上・減価償却は自社）", options: { bullet: true, bold: true, color: BORDEAUX } },
  ], { x: 6.72, y: 4.2, w: 5.78, h: 2.3, fontSize: 10, color: INK, fontFace: "Calibri",
       isTextBox: true, margin: 0, paraSpaceAfter: 4, lineSpacingMultiple: 1.05 });

  s.addText("※ 稼働率・回転率は保守的に設定。新店初年度は売上90%で計画。金利・税金は含まない。",
    { x: 0.55, y: 6.72, w: 12.2, h: 0.26, fontSize: 9, color: MUTED, fontFace: "Calibri",
      isTextBox: true, margin: 0 });
  s.addNotes("満年度でEBITDA 51.6百万円（12.2%）、営業利益 30.8百万円（7.3%）。3年目以降はEBITDA率15.0%・営業利益率10.1%。");
}

/* ───────── Slide 2 : 5か年連結 ───────── */
{
  const s = pres.addSlide({ masterName: "CONTENT" });
  s.addText("5か年事業計画 事業収支（連結）", { placeholder: "title" });
  s.addText("2027年4月 六本木開業 → 2028年 札幌・大阪 → 2029年 首都圏・政令指定都市 → 2030年以降 リゾート含め年2店舗",
            { placeholder: "sub" });

  const C = [
    ["期末店舗数", ["1", "3", "5", "7", "9"], "sub"],
    ["売上高", ["381.0", "891.2", "1,729.4", "2,576.1", "3,422.8"], "hl"],
    ["売上原価", ["114.3", "267.4", "518.8", "772.8", "1,026.9"]],
    ["人件費", ["131.5", "303.3", "579.9", "855.1", "1,130.2"]],
    ["業務委託費・消耗品他", ["9.1", "20.6", "38.2", "55.1", "72.0"]],
    ["部門利益", ["126.1", "300.0", "592.6", "893.1", "1,193.7"], "sub"],
    ["販促費・水道光熱費等", ["22.4", "51.8", "98.6", "145.3", "191.8"]],
    ["GOP（店舗営業総利益）", ["103.6", "248.2", "493.9", "747.9", "1,001.9"], "sub"],
    ["ロイヤリティ", ["15.2", "35.6", "69.2", "103.0", "136.9"]],
    ["地代家賃・歩合家賃", ["30.1", "70.1", "135.7", "201.8", "268.0"]],
    ["保険・租税公課・修繕費", ["12.2", "28.5", "55.3", "82.4", "109.6"]],
    ["店舗EBITDA 計", ["46.1", "113.9", "233.7", "360.6", "487.5"], "sub"],
    ["本部費", ["15.0", "28.0", "40.0", "48.0", "55.0"]],
    ["連結EBITDA", ["31.1", "85.9", "193.7", "312.6", "432.5"], "hl"],
    ["　EBITDA率", ["8.2%", "9.6%", "11.2%", "12.1%", "12.6%"], "sub"],
    ["減価償却費", ["20.8", "46.9", "87.9", "128.5", "169.2"]],
    ["営業利益", ["10.3", "39.1", "105.8", "184.0", "263.3"], "hl"],
    ["　営業利益率", ["2.7%", "4.4%", "6.1%", "7.1%", "7.7%"], "sub"],
  ];
  const rows = [tHead(["連結損益計画（百万円）", "FY2027", "FY2028", "FY2029", "FY2030", "FY2031"], { fs: 9.5 })];
  C.forEach(([l, v, k]) => rows.push(tRow(l, v, { fs: 9, hl: k === "hl", sub: k === "sub" })));
  s.addTable(rows, { x: 0.55, y: 1.42, w: 9.05, colW: [2.45, 1.32, 1.32, 1.32, 1.32, 1.32],
    rowH: 0.258, border: { type: "solid", color: LINE, pt: 0.5 }, autoPage: false });

  s.addShape(pres.ShapeType.roundRect, { x: 9.9, y: 1.42, w: 2.88, h: 2.42,
    fill: { color: TINT }, line: { color: TINT }, rectRadius: 0.06, shadow: { type: "none" } });
  s.addText("計画のポイント", { x: 10.12, y: 1.56, w: 2.5, h: 0.28, fontSize: 11.5, bold: true,
    color: BORDEAUX, fontFace: "Cambria", isTextBox: true, margin: 0 });
  s.addText([
    { text: "FY2029に連結EBITDA率10%超", options: { bullet: true, breakLine: true } },
    { text: "FY2029に営業利益率5%超", options: { bullet: true, breakLine: true } },
    { text: "FY2031はEBITDA率12.6%・営業利益率7.7%", options: { bullet: true, breakLine: true } },
    { text: "成熟単店はEBITDA率15.0%・営業利益率10.1%", options: { bullet: true } },
  ], { x: 10.12, y: 1.88, w: 2.46, h: 1.86, fontSize: 9.5, color: INK, fontFace: "Calibri",
       isTextBox: true, margin: 0, paraSpaceAfter: 5, lineSpacingMultiple: 1.05 });

  s.addShape(pres.ShapeType.roundRect, { x: 9.9, y: 3.98, w: 2.88, h: 2.64,
    fill: { color: TINT }, line: { color: TINT }, rectRadius: 0.06, shadow: { type: "none" } });
  s.addText("5年累計", { x: 10.12, y: 4.12, w: 2.5, h: 0.28, fontSize: 11.5, bold: true,
    color: BORDEAUX, fontFace: "Cambria", isTextBox: true, margin: 0 });
  [["売上高", "9,000.6"], ["連結EBITDA", "1,055.7"], ["営業利益", "602.4"]].forEach((d, i) => {
    s.addText(d[0], { x: 10.12, y: 4.5 + i * 0.72, w: 2.46, h: 0.22, fontSize: 9,
      color: MUTED, fontFace: "Calibri", isTextBox: true, margin: 0 });
    s.addText(d[1] + " 百万円", { x: 10.12, y: 4.7 + i * 0.72, w: 2.46, h: 0.4, fontSize: 17,
      bold: true, color: i === 0 ? INK : BORDEAUX, fontFace: "Cambria", isTextBox: true, margin: 0 });
  });

  s.addText("※ FY＝4月〜3月。新店初年度は売上90%・開業7.5か月で保守的に計上。ロイヤリティ4%・歩合家賃7%・地代家賃は契約条件どおり全店適用。金利・税金は含まない。",
    { x: 0.55, y: 6.72, w: 12.2, h: 0.26, fontSize: 9, color: MUTED, fontFace: "Calibri",
      isTextBox: true, margin: 0 });
  s.addNotes("FY2031で売上34.2億円、連結EBITDA 4.3億円（12.6%）、営業利益 2.6億円（7.7%）。5年累計の売上は90億円。");
}
module.exports = { pres, THEME, pptxgen, BORDEAUX, GOLD, INK, MUTED, TINT, LINE, GREEN, RED, tHead, tRow };

/* ───────── Slide 3 : 投資回収・資金計画 ───────── */
{
  const s = pres.addSlide({ masterName: "CONTENT" });
  s.addText("投資回収と資金計画", { placeholder: "title" });
  s.addText("内装1億円は家主立替（10年分割）、保証金3,900万円は7年分割。開業時に必要な現金は1.58億円", { placeholder: "sub" });

  const inv = [
    ["契約金", "10.0", "10.0", "5.0"],
    ["事業費（設計・内装施工・OSE/FF&E）", "194.3", "194.3", "194.3"],
    ["　うち 内装 家主立替（10年分割返済）", "▲100.0", "▲100.0", "▲100.0"],
    ["開業準備金（広告・採用等）", "4.0", "4.0", "4.0"],
    ["保証金（非償却・返還対象）", "39.0", "39.0", "39.0"],
    ["ワイン・美術品在庫（非償却）", "50.0", "10.0", "10.0"],
  ];
  const r1 = [tHead(["初期投資（1店あたり・百万円）", "1号店", "2〜3号店", "4号店〜"], { fs: 9.5 })];
  inv.forEach((d) => r1.push(tRow(d[0], d.slice(1), { fs: 9.5, sub: d[0].indexOf("家主") >= 0 })));
  r1.push(tRow("初期投資 合計", ["297.3", "257.3", "252.3"], { fs: 9.5, hl: true }));
  r1.push(tRow("分割対象額（内装100＋保証金39）", ["139.0", "139.0", "139.0"], { fs: 9.5 }));
  r1.push(tRow("開業時 現金支出", ["158.3", "118.3", "113.3"], { fs: 9.5, hl: true }));
  s.addTable(r1, { x: 0.55, y: 1.42, w: 6.35, colW: [3.05, 1.1, 1.1, 1.1], rowH: 0.288,
    border: { type: "solid", color: LINE, pt: 0.5 }, autoPage: false });

  const cf = [
    ["EBITDA", "—", "46.1", "56.3", "63.4", "63.4", "63.4"],
    ["開業時 現金支出", "▲158.3", "—", "—", "—", "—", "—"],
    ["分割弁済（内装＋保証金）", "—", "▲15.6", "▲15.6", "▲15.6", "▲15.6", "▲15.6"],
    ["単店FCF", "▲158.3", "30.5", "40.7", "47.9", "47.9", "47.9"],
  ];
  const r2 = [tHead(["1号店CF（百万円）", "開業時", "1年目", "2年目", "3年目", "4年目", "5年目"], { fs: 9 })];
  cf.forEach((d) => r2.push(tRow(d[0], d.slice(1), { fs: 9, sub: d[0] === "単店FCF" })));
  r2.push(tRow("累計FCF", ["▲158.3", "▲127.7", "▲87.0", "▲39.1", "8.8", "56.6"], { fs: 9, hl: true }));
  s.addTable(r2, { x: 0.55, y: 4.44, w: 6.35, colW: [1.7, 0.775, 0.775, 0.775, 0.775, 0.775, 0.775],
    rowH: 0.258, border: { type: "solid", color: LINE, pt: 0.5 }, autoPage: false });

  s.addShape(pres.ShapeType.roundRect, { x: 0.55, y: 6.0, w: 6.35, h: 0.5,
    fill: { color: TINT }, line: { color: TINT }, rectRadius: 0.06, shadow: { type: "none" } });
  s.addText([
    { text: "開業4年目に累計FCFが黒字転換", options: { bold: true, color: GREEN } },
    { text: "　／　投資回収 約3.8年　／　定常期FCF 47.9百万円", options: { color: INK } },
  ], { x: 0.78, y: 6.08, w: 5.95, h: 0.34, fontSize: 10, fontFace: "Calibri",
       isTextBox: true, margin: 0, valign: "middle" });

  const r3 = [tHead(["連結CF（百万円）", "FY2027", "FY2028", "FY2029", "FY2030", "FY2031"], { fs: 8.5 })];
  [["投資キャッシュアウト", ["▲173.8", "▲271.5", "▲292.7", "▲323.8", "▲355.0"]],
   ["連結EBITDA", ["31.1", "85.9", "193.7", "312.6", "432.5"]],
   ["法人税等（推計）", ["▲3.1", "▲11.7", "▲31.7", "▲55.2", "▲79.0"]],
   ["簡易フリーCF", ["▲145.8", "▲197.3", "▲130.7", "▲66.5", "▲1.5"]],
  ].forEach(([l, v]) => r3.push(tRow(l, v, { fs: 9 })));
  r3.push(tRow("累計フリーCF", ["▲145.8", "▲343.1", "▲473.9", "▲540.4", "▲541.9"], { fs: 9, hl: true }));
  s.addTable(r3, { x: 7.25, y: 1.42, w: 5.53, colW: [1.53, 0.8, 0.8, 0.8, 0.8, 0.8],
    rowH: 0.3, border: { type: "solid", color: LINE, pt: 0.5 }, autoPage: false });

  s.addShape(pres.ShapeType.roundRect, { x: 7.25, y: 3.38, w: 5.53, h: 3.24,
    fill: { color: TINT }, line: { color: TINT }, rectRadius: 0.06, shadow: { type: "none" } });
  s.addText("必要資金と調達", { x: 7.5, y: 3.56, w: 5.05, h: 0.3, fontSize: 12, bold: true,
    color: BORDEAUX, fontFace: "Cambria", isTextBox: true, margin: 0 });
  const fund = [["① 1号店 開業時に必要な現金", "158.3", INK, 0],
                ["② FY2027末までに必要な資金", "145.8", INK, 0],
                ["③ 5年・9店舗の最大資金需要", "541.9", INK, 0],
                ["調達 既存（従前）", "200.0", INK, 1],
                ["調達 今回ラウンド（うち90.0調達済）", "180.0", GREEN, 1],
                ["調達額 計", "380.0", INK, 0],
                ["過不足　①開業時 ＋221.8／②FY2027末 ＋234.2", "", INK, 2],
                ["過不足　③5年・9店舗", "▲161.9", RED, 0]];
  fund.forEach((d, i) => {
    const y = 3.78 + i * 0.300;
    const ind = d[3] === 1, wide = d[3] === 2;
    s.addText(d[0], { x: ind ? 7.66 : 7.5, y, w: wide ? 4.9 : (ind ? 3.34 : 3.5), h: 0.3,
      fontSize: wide ? 9 : (ind ? 8.8 : 10), color: i === 7 ? INK : MUTED,
      bold: i === 5 || i === 7, fontFace: "Calibri", isTextBox: true, margin: 0, valign: "middle" });
    if (d[1]) s.addText(d[1], { x: 11.0, y, w: 1.55, h: 0.3,
      fontSize: i === 7 ? 14 : (ind ? 10 : 11.5),
      bold: i === 5 || i === 7, color: d[2], fontFace: "Cambria", isTextBox: true, margin: 0,
      align: "right", valign: "middle" });
  });
  s.addText("※ 今回ラウンド1.8億円のうち9,000万円（アピシウス投資家7,000万・エニーカラー創業者2,000万）はクローズ済。",
    { x: 7.5, y: 6.25, w: 5.05, h: 0.32, fontSize: 8.5, color: MUTED, fontFace: "Calibri",
      isTextBox: true, margin: 0 });

  s.addText("※ 内装100百万円は家主が立替え月833千円×120回で返済、保証金39百万円は月464千円×84回。いずれも賃貸借契約どおりCFに反映。減価償却は自社で継続。",
    { x: 0.55, y: 6.72, w: 12.2, h: 0.26, fontSize: 9, color: MUTED, fontFace: "Calibri",
      isTextBox: true, margin: 0 });
  s.addNotes("内装1億円は家主立替で開業時の現金支出を圧縮するが、資産計上・減価償却は自社で継続。1号店の開業は調達3.8億で十分に賄える（開業時+2.22億、FY2027末+2.34億の余剰）。不足が出るのは9店舗展開ベースで1.62億円。");
}

/* ───────── Slide 4 : 感応度分析 ───────── */
{
  const s = pres.addSlide({ masterName: "CONTENT" });
  s.addText("前提の振れ幅に対する感応度", { placeholder: "title" });
  s.addText("1号店・満年度ベース ｜ 店内席効率 × ディナー店内回転率（網掛け＝計画前提）", { placeholder: "sub" });

  const TURNS = ["0.70", "0.80", "0.90", "1.00", "1.10"];
  const SALES = [["65%", "335.9", "357.9", "379.8", "401.8", "423.7"],
                 ["70%", "354.3", "378.0", "401.6", "425.2", "448.8"],
                 ["75%", "372.7", "398.0", "423.4", "448.7", "474.0"],
                 ["80%", "391.1", "418.1", "445.1", "472.1", "499.1"],
                 ["85%", "409.5", "438.2", "466.9", "495.6", "524.3"]];
  const OPM  = [["65%", "5.8%", "6.2%", "6.6%", "7.0%", "7.3%"],
                ["70%", "6.2%", "6.6%", "7.0%", "7.3%", "7.6%"],
                ["75%", "6.5%", "6.9%", "7.3%", "7.6%", "7.9%"],
                ["80%", "6.8%", "7.2%", "7.5%", "7.9%", "8.1%"],
                ["85%", "7.1%", "7.5%", "7.8%", "8.1%", "8.4%"]];

  function grid(data, x, y, title) {
    const rows = [tHead([title].concat(TURNS), { fs: 9.5 })];
    data.forEach((d) => {
      const isBase = d[0] === "75%";
      const cells = [{ text: d[0], options: { bold: true, fontSize: 9.5, align: "center",
        valign: "middle", fontFace: "Calibri", color: INK, fill: { color: TINT } } }];
      d.slice(1).forEach((v, j) => {
        const hit = isBase && j === 2;
        cells.push({ text: v, options: { fontSize: 9.5, align: "center", valign: "middle",
          fontFace: "Calibri", bold: hit, color: hit ? "FFFFFF" : INK,
          fill: hit ? { color: GOLD } : undefined } });
      });
      rows.push(cells);
    });
    s.addTable(rows, { x, y, w: 5.9, colW: [1.5, 0.88, 0.88, 0.88, 0.88, 0.88], rowH: 0.34,
      border: { type: "solid", color: LINE, pt: 0.5 }, autoPage: false });
  }
  grid(SALES, 0.55, 1.6, "年間売上高");
  grid(OPM, 6.88, 1.6, "営業利益率");

  s.addText("席効率 ＼ ディナー回転率（単位：百万円）", { x: 0.55, y: 1.3, w: 5.9, h: 0.24, fontSize: 9,
    color: MUTED, fontFace: "Calibri", isTextBox: true, margin: 0 });
  s.addText("席効率 ＼ ディナー回転率", { x: 6.88, y: 1.3, w: 5.9, h: 0.24, fontSize: 9,
    color: MUTED, fontFace: "Calibri", isTextBox: true, margin: 0 });

  const notes = [
    ["下振れ耐性", "最も保守的な前提（席効率65%・回転0.70）でも年商3.36億円・営業利益率5.8%を確保し、黒字を維持"],
    ["上振れ余地", "席効率85%・回転1.10では年商5.24億円・営業利益率8.4%。テラスの通年稼働が進めばさらに上振れ"],
    ["固定費の効き", "地代家賃と減価償却は売上に連動しないため、売上が伸びるほど利益率は加速的に改善"],
  ];
  s.addShape(pres.ShapeType.roundRect, { x: 0.55, y: 4.16, w: 12.23, h: 2.3,
    fill: { color: TINT }, line: { color: TINT }, rectRadius: 0.06, shadow: { type: "none" } });
  notes.forEach((n, i) => {
    const x = 0.85 + i * 4.06;
    s.addShape(pres.ShapeType.ellipse, { x, y: 4.34, w: 0.34, h: 0.34,
      fill: { color: BORDEAUX }, line: { color: BORDEAUX }, shadow: { type: "none" } });
    s.addText(String(i + 1), { x, y: 4.34, w: 0.34, h: 0.34, fontSize: 11, bold: true,
      color: "FFFFFF", fontFace: "Cambria", align: "center", valign: "middle",
      isTextBox: true, margin: 0 });
    s.addText(n[0], { x: x + 0.46, y: 4.36, w: 3.3, h: 0.3, fontSize: 12, bold: true,
      color: BORDEAUX, fontFace: "Cambria", isTextBox: true, margin: 0 });
    s.addText(n[1], { x, y: 4.8, w: 3.72, h: 1.5, fontSize: 10.5, color: INK, valign: "top",
      fontFace: "Calibri", isTextBox: true, margin: 0, lineSpacingMultiple: 1.15 });
  });

  s.addText("※ 計画前提は店内席効率75%・ディナー店内回転率0.90（網掛けセル）。ランチ・カフェ・テラスの前提は固定。",
    { x: 0.55, y: 6.72, w: 12.2, h: 0.26, fontSize: 9, color: MUTED, fontFace: "Calibri",
      isTextBox: true, margin: 0 });
  s.addNotes("計画前提は中央のセル。下振れしても黒字を確保し、上振れ余地も大きいことを示す。");
}

(async () => {
  const out = "/home/user/wine-auction/事業計画/BRASSERIE_Thierry_Marx_事業収支_差替スライド_20261016_v3.pptx";
  await pres.writeFile({ fileName: out });
  await applyTheme(out, THEME);
  console.log("saved:", out);
})();
