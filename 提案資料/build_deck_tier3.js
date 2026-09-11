/**
 * ワインマイル 新レートカード 3枚組
 *   100万 : 管理料2.75% / マイル4%   / プロフィットシェア30%
 *   500万 : 管理料2.60% / マイル5%   / 同27.5%
 *   1000万: 管理料2.50% / マイル6%   / 同25%
 *
 * 1 顧客の年間収支（値上がり6%のとき / 起きないとき）
 * 2 WineBank 単体の支払いコスト
 * 3 1億円販売時のまとめ
 */
const D = require("../.claude/skills/winebank-deck/scripts/deck_lib.js");
const { pres, C, G, t, base, card, badge, tb, hdr, cel, lft, tableEnd, save } =
  D.init("WineBank ワインマイル 新レートカード");

const yen = (n) => (n < 0 ? "▲" : "") + Math.abs(Math.round(n)).toLocaleString("en-US");
const sgn = (n) => (n >= 0 ? "+" : "▲") + Math.abs(Math.round(n)).toLocaleString("en-US");
const pct = (x, d = 2) => (x >= 0 ? "+" : "▲") + (Math.abs(x) * 100).toFixed(d) + "%";
const man = (n) => (n < 0 ? "▲" : "") + Math.round(Math.abs(n) / 10000).toLocaleString("en-US");

/** 締めのバナー。deck_lib の banner() より本文位置を詰め、カード内に収める。 */
function strip(s, y, h, headline, detail) {
  card(s, G.M, y, G.CW, h, C.BURG);
  s.addText(headline, t({ x: G.M + 0.45, y: y + 0.16, w: G.CW - 0.9, h: 0.38,
    fontSize: 17, bold: true, color: C.GOLD_L }));
  if (detail) s.addText(detail, t({ x: G.M + 0.45, y: y + h - 0.32, w: G.CW - 0.9, h: 0.28,
    fontSize: 11.5, color: C.TEXT }));
}

// ───────────────────────────── 前提
const GROWTH = 0.06, STORAGE = 0.0105, AUCTION = 0.005, USE = 0.90;

// 交換先ミックス: [名称, 利用マイル内構成比, 交換レート, 当社原価率]
const MIX = [
  ["グループ直営飲食",   0.278, 1.0, 0.90],
  ["グランメゾン",       0.200, 0.5, 0.90],
  ["WineBank CLUB 会費", 0.133, 1.0, 0.10],
  ["オークション参加",   0.133, 1.0, 0.30],
  ["ワインスクール",     0.100, 1.0, 0.80],
  ["会員交流イベント",   0.070, 1.0, 0.50],
  ["ワイナート年間購読", 0.030, 1.0, 0.50],
  ["ワイン追加購入",     0.056, 1.0, 0.80],
];
const COST_USED = MIX.reduce((a, m) => a + m[1] * m[2] * m[3], 0); // 利用1マイルの当社原価
const VAL_USED  = MIX.reduce((a, m) => a + m[1] * m[2], 0);        // 利用1マイルの会員価値
const MC = USE * COST_USED;   // 発行1マイルあたり 当社原価
const MV = USE * VAL_USED;    // 発行1マイルあたり 会員価値

// ティア: [表示名, 預かり額, 人数, 管理料率, マイル還元率, プロフィットシェア]
const TIERS = [
  ["100万",   1_000_000, 55, 0.0275, 0.040, 0.300],
  ["500万",   5_000_000,  5, 0.0260, 0.050, 0.275],
  ["1000万", 10_000_000,  2, 0.0250, 0.060, 0.250],
];

const calc = ([lab, amt, n, f, m, s]) => {
  const fee = f * amt, face = m * amt, real = face * MV;
  const upside = GROWTH * amt * (1 - s);          // 値上がりの会員取分
  const mile = face * MC;                          // 当社のマイル費用
  const cash = (f - STORAGE + AUCTION) * amt - mile;
  const ps = GROWTH * s * amt;                     // 当社のプロフィットシェア（発生）
  return { lab, amt, n, f, m, s, fee, face, real, upside, mile, cash, ps,
    econ: cash + ps,
    net6: face + upside - fee, net6r: real + upside - fee,
    net0: face - fee,          net0r: real - fee };
};
const R = TIERS.map(calc);
const sum = (k) => R.reduce((a, r) => a + r[k] * r.n, 0);
const AUM = 100_000_000;

// ═══════════════════════════════ 1 顧客の年間収支
{
  const s = base("CUSTOMER P/L", "値上がりが起きても、起きなくても",
    "プロフィットシェアは値上がり益からしか発生しません。値上がりがなければ、会員が払うのは管理料だけです。");

  const colW = [1.60, 1.90, 1.90, 2.20, 2.23, 2.23];
  const rowH = [0.50, 0.62, 0.62, 0.62];
  const rows = [[
    hdr("ティア"), hdr("管理料を払う"), hdr("マイルをもらう"),
    hdr("値上がり益の取分"), hdr("年間差引【6%上昇】"), hdr("年間差引【上昇ゼロ】"),
  ]];
  R.forEach((r, i) => {
    const fill = i === 0 ? C.PANEL2 : C.PANEL;   // 構成比が最大の100万を強調
    rows.push([
      cel(r.lab, { fill: { color: fill }, bold: true, color: C.GOLD_L, fontSize: 13 }),
      cel(`▲${yen(r.fee)}\n(${(r.f * 100).toFixed(2)}%)`, { fill: { color: fill } }),
      cel(`+${yen(r.face)}\n(${(r.m * 100).toFixed(0)}%)`, { fill: { color: fill }, color: C.GOLD_L }),
      cel(`+${yen(r.upside)}\n(会員${((1 - r.s) * 100).toFixed(1)}%)`, { fill: { color: fill } }),
      cel(`${sgn(r.net6)}\n${pct(r.net6 / r.amt)}`, { fill: { color: fill }, bold: true, color: C.MINT, fontSize: 12 }),
      cel(`${sgn(r.net0)}\n${pct(r.net0 / r.amt)}`, { fill: { color: fill }, bold: true, color: C.MINT, fontSize: 12 }),
    ]);
  });
  s.addTable(rows, Object.assign(tb(), { x: G.M, y: G.BODY_TOP, w: G.CW, colW, rowH, fontSize: 10.5 }));

  const y2 = tableEnd(G.BODY_TOP, rowH) + 0.15;   // 4.29
  [["ワインが年6%上がったら", C.PANEL2, C.GOLD_L,
    "値上がり益の70〜75%は会員のものです。100万円なら年42,000円。マイル40,000円と合わせ、管理料27,500円を引いても年54,500円のプラス。"],
   ["ワインが上がらなかったら", C.PANEL, C.TEXT,
    "値上がり益がゼロなら、プロフィットシェアもゼロ円です。会員が払うのは管理料27,500円だけ。マイル40,000円が残り、年12,500円のプラス。"],
  ].forEach((c, i) => {
    const x = G.M + i * G.G2;
    card(s, x, y2, G.C2, 1.28, c[1]);
    s.addText(c[0], t({ x: x + 0.4, y: y2 + 0.2, w: G.C2 - 0.8, h: 0.34, fontSize: 16, bold: true, color: c[2] }));
    s.addText(c[3], t({ x: x + 0.4, y: y2 + 0.62, w: G.C2 - 0.8, h: 0.56, fontSize: 11.5, color: C.MUTE, lineSpacing: 17 }));
  });

  strip(s, y2 + 1.43, 0.90, "プロフィットシェアは「損をしたら払わない」設計です。",
    `実利用ベースでも、100万は ${sgn(R[0].net6r)}円（6%上昇）／ ${sgn(R[0].net0r)}円（上昇ゼロ）といずれもプラスです。`);

  s.addNotes(`発行1マイルあたりの会員価値 ${MV.toFixed(4)}円（利用率${(USE * 100).toFixed(0)}% × 交換先加重平均${VAL_USED.toFixed(3)}）。`
    + `顧客が「マイル − 管理料 − 6%×PS」と引き算した場合、100万は${pct(R[0].m - R[0].f - GROWTH * R[0].s)}、500万は${pct(R[1].m - R[1].f - GROWTH * R[1].s)}、1000万は${pct(R[2].m - R[2].f - GROWTH * R[2].s)}。`
    + `100万だけマイナスになるため、この引き算をさせない見せ方（＝値上がりの有無で場合分けする本スライドの構成）が必要。`);
}

// ═══════════════════════════════ 2 WineBank の支払いコスト
{
  const s = base("COST STRUCTURE", "マイル1円につき、当社はいくら払うか",
    `交換先によって当社の原価はまったく違います。加重平均すると、額面1円あたりの当社負担は${MC.toFixed(3)}円です。`);

  // 左：交換先別の原価
  const lw = [2.35, 1.15, 1.15, 1.25];
  const lh = [0.38, ...MIX.map(() => 0.345), 0.40];
  const left = [[hdr("交換先"), hdr("構成比"), hdr("当社原価率"), hdr("1マイル原価")]];
  MIX.forEach(([name, w, rate, cost]) => {
    const unit = rate * cost;
    const tone = unit <= 0.3 ? C.MINT : unit >= 0.8 ? C.AMBER : C.TEXT;
    left.push([
      lft(name, { fontSize: 10.5 }),
      cel((w * 100).toFixed(1) + "%", { fontSize: 10.5, color: C.MUTE }),
      cel(rate === 1 ? (cost * 100).toFixed(0) + "%" : `${(cost * 100).toFixed(0)}%×${rate}`,
        { fontSize: 10.5, color: C.MUTE }),
      cel(unit.toFixed(3) + "円", { fontSize: 11, bold: true, color: tone }),
    ]);
  });
  left.push([
    lft("加重平均（利用時）", { bold: true, fontSize: 10.5, fill: { color: C.PANEL2 } }),
    cel("100%", { bold: true, fontSize: 10.5, fill: { color: C.PANEL2 } }),
    cel("—", { fontSize: 10.5, fill: { color: C.PANEL2 }, color: C.MUTE }),
    cel(COST_USED.toFixed(3) + "円", { bold: true, fontSize: 11.5, color: C.GOLD_L, fill: { color: C.PANEL2 } }),
  ]);
  s.addTable(left, Object.assign(tb(), { x: G.M, y: G.BODY_TOP, w: G.C2, colW: lw, rowH: lh }));

  const lEnd = tableEnd(G.BODY_TOP, lh);          // 5.60
  card(s, G.M, lEnd + 0.12, G.C2, 0.72, C.BURG);
  s.addText(`利用率${(USE * 100).toFixed(0)}%を掛けて、発行1マイル原価は ${MC.toFixed(3)}円`,
    t({ x: G.M + 0.4, y: lEnd + 0.2, w: G.C2 - 0.8, h: 0.3, fontSize: 13.5, bold: true, color: C.GOLD_L }));
  s.addText("残る10%は有効期限切れ。失効益はあてにしない保守的な置き方です。",
    t({ x: G.M + 0.4, y: lEnd + 0.5, w: G.C2 - 0.8, h: 0.24, fontSize: 10, color: C.TEXT }));

  // 右：ティア別の当社収支（保管・オークションは下のカードで明示）
  const X = G.M + G.G2;
  const rw = [1.05, 1.15, 1.25, 1.20, 1.25];
  const rh = [0.42, 0.46, 0.46, 0.46];
  const right = [[hdr("ティア"), hdr("管理料"), hdr("マイル費用"), hdr("現金収支"), hdr("経済収支")]];
  R.forEach((r) => {
    right.push([
      cel(r.lab, { bold: true, color: C.GOLD_L, fontSize: 11 }),
      cel(yen(r.fee), { fontSize: 10.5 }),
      cel("▲" + yen(r.mile), { fontSize: 10.5, color: C.AMBER }),
      cel(sgn(r.cash), { fontSize: 10.5, bold: true, color: r.cash >= 0 ? C.MINT : C.RED }),
      cel(sgn(r.econ), { fontSize: 10.5, bold: true, color: C.MINT }),
    ]);
  });
  s.addTable(right, Object.assign(tb(), { x: X, y: G.BODY_TOP, w: G.C2, colW: rw, rowH: rh }));

  // 1億合計
  const yA = tableEnd(G.BODY_TOP, rh) + 0.14;     // 3.72
  card(s, X, yA, G.C2, 1.10, C.PANEL2);
  s.addText("預かり資産1億円の合計（55名・5名・2名）",
    t({ x: X + 0.35, y: yA + 0.16, w: G.C2 - 0.7, h: 0.28, fontSize: 11.5, bold: true, color: C.GOLD_L }));
  [["管理手数料", sum("fee"), C.TEXT], ["保管・保険", -STORAGE * AUM, C.AMBER],
   ["オークション", AUCTION * AUM, C.MINT], ["マイル費用", -sum("mile"), C.AMBER],
   ["経済収支", sum("econ"), C.MINT],
  ].forEach((v, i) => {
    const x = X + 0.3 + i * 1.06;
    s.addText(v[0], t({ x, y: yA + 0.52, w: 1.02, h: 0.24, fontSize: 9, color: C.MUTE, align: "center" }));
    s.addText(man(v[1]), t({ x, y: yA + 0.74, w: 1.02, h: 0.3, fontSize: 14, bold: true, color: v[2], align: "center" }));
  });

  // 解説
  const yB = yA + 1.22;                            // 4.94
  card(s, X, yB, G.C2, 1.24, C.PANEL);
  s.addText("上位ほど、当社の現金収支は薄くなります",
    t({ x: X + 0.4, y: yB + 0.18, w: G.C2 - 0.8, h: 0.3, fontSize: 14, bold: true, color: C.GOLD_L }));
  const top = R[2], beMC = (top.f - STORAGE + AUCTION) / top.m;   // 現金がゼロになる1マイル原価
  s.addText(`管理料は2.50〜2.75%とほぼ一定なのに、マイル還元は4%→6%へ上がるためです。`
    + `1000万は現金で年${yen(-top.cash)}円の持ち出しとなり、プロフィットシェア${yen(top.ps)}円で回収する設計です。`,
    t({ x: X + 0.4, y: yB + 0.52, w: G.C2 - 0.8, h: 0.62, fontSize: 10.5, color: C.MUTE, lineSpacing: 15 }));

  s.addText(
    `※ 現金収支 ＝ 管理手数料 − 保管・保険料（預かり資産×${(STORAGE * 100).toFixed(2)}%・鈴与実額210円/本）`
    + ` ＋ オークション手数料（同×${(AUCTION * 100).toFixed(1)}%＝回転10%×当社ルート50%×買い手10%）`
    + ` − マイル費用（マイル額面×${MC.toFixed(3)}円）\n`
    + `　 経済収支 ＝ 現金収支 ＋ プロフィットシェア（預かり資産×値上がり${(GROWTH * 100).toFixed(0)}%×当社シェア率）。`
    + `PSは契約終了時に精算する発生額で、現金化していません。`,
    t({ x: G.M, y: 6.26, w: G.CW, h: 0.36, fontSize: 8.5, color: C.FOOT, lineSpacing: 12 }));

  s.addNotes(`1000万ティアの現金がゼロになる発行1マイル原価は ${beMC.toFixed(3)}円（現状 ${MC.toFixed(3)}円）。` + "原価率の根拠：グループ直営飲食90%、ワインスクール80%、会員交流イベント・ワイナート年間購読50%、ワイン追加購入80%、"
    + "WineBank CLUB年会費充当10%、オークション参加30%。グランメゾンは交換レート0.5円×原価率90%。"
    + `利用時の加重平均${COST_USED.toFixed(3)}円に利用率${(USE * 100).toFixed(0)}%を掛けて発行1マイル原価${MC.toFixed(3)}円。`
    + "現金収支には保管・保険▲1.05%とオークション手数料+0.5%を織り込み済み。");
}

// ═══════════════════════════════ 3 まとめ
{
  const s = base("SUMMARY", "1億円を販売したら、どうなるか",
    "ワイン販売の粗利30%を含めた初年度と、販売が止まった2年目以降の両方で見ます。単位：万円");

  const cogs = AUM * 0.70;
  const fee = sum("fee"), auc = AUCTION * AUM, mile = sum("mile"),
        sto = STORAGE * AUM, ps = sum("ps");
  const rev = AUM + fee + auc;
  const gp = rev - cogs;
  const op = gp - mile - sto;

  const cw = [3.30, 2.60];
  const rh = [0.38, ...Array(11).fill(0.31)];      // 表の下端 = 1.78 + 3.79 = 5.57
  const PL = [[hdr("初年度 損益（1億円販売）"), hdr("金額")]];
  const line = (name, v, o = {}) => PL.push([
    lft(name, Object.assign({ fontSize: 10.5 }, o.l || {})),
    cel(man(v), Object.assign({ fontSize: 11, align: "right" }, o.r || {})),
  ]);
  line("ワイン販売売上", AUM);
  line("管理手数料収入", fee);
  line("オークション手数料", auc);
  line("売上高 計", rev, { l: { bold: true }, r: { bold: true, color: C.GOLD_L } });
  line("ワイン売上原価（粗利30%）", -cogs, { r: { color: C.MUTE } });
  line("売上総利益", gp, { l: { bold: true }, r: { bold: true, color: C.GOLD_L } });
  line("マイル費用", -mile, { r: { color: C.AMBER } });
  line("保管・保険料", -sto, { r: { color: C.AMBER } });
  line("営業利益", op, { l: { bold: true, fill: { color: C.PANEL2 } },
                         r: { bold: true, fontSize: 12.5, color: C.MINT, fill: { color: C.PANEL2 } } });
  line("プロフィットシェア（発生・未実現）", ps, { r: { color: C.MUTE } });
  line("経済利益", op + ps, { l: { bold: true, fill: { color: C.PANEL2 } },
                              r: { bold: true, fontSize: 12.5, color: C.MINT, fill: { color: C.PANEL2 } } });
  s.addTable(PL, Object.assign(tb(), { x: G.M, y: G.BODY_TOP, w: cw[0] + cw[1], colW: cw, rowH: rh }));

  // 右：2年目以降
  const X = G.M + 6.30, W = G.W - G.M - X;         // X=6.92, W=5.76
  card(s, X, G.BODY_TOP, W, 1.96, C.PANEL);
  s.addText("2年目以降（新規販売が止まっても）",
    t({ x: X + 0.4, y: G.BODY_TOP + 0.2, w: W - 0.8, h: 0.32, fontSize: 15, bold: true, color: C.GOLD_L }));
  [["管理手数料", fee], ["保管・保険", -sto], ["オークション", auc], ["マイル費用", -mile]].forEach((v, i) => {
    const y = G.BODY_TOP + 0.62 + i * 0.30;
    s.addText(v[0], t({ x: X + 0.4, y, w: 1.6, h: 0.26, fontSize: 11, color: C.MUTE }));
    s.addText(man(v[1]), t({ x: X + 2.0, y, w: 0.9, h: 0.26, fontSize: 11, align: "right",
      color: v[1] < 0 ? C.AMBER : C.TEXT }));
  });
  s.addText(`現金 ${man(sum("cash"))} 万円`,
    t({ x: X + 3.3, y: G.BODY_TOP + 0.66, w: W - 3.7, h: 0.32, fontSize: 14, bold: true, color: C.RED }));
  s.addText(`＋ PS ${man(ps)} 万円`,
    t({ x: X + 3.3, y: G.BODY_TOP + 1.04, w: W - 3.7, h: 0.28, fontSize: 11.5, color: C.MUTE }));
  s.addText(`経済 ${man(sum("econ"))} 万円`,
    t({ x: X + 3.3, y: G.BODY_TOP + 1.36, w: W - 3.7, h: 0.32, fontSize: 14, bold: true, color: C.MINT }));

  // 右：会員メリット
  const y2 = G.BODY_TOP + 2.10;                    // 3.88
  card(s, X, y2, W, 1.74, C.PANEL2);
  s.addText("会員が受け取る価値（62名・実利用ベース）",
    t({ x: X + 0.4, y: y2 + 0.2, w: W - 0.8, h: 0.32, fontSize: 15, bold: true, color: C.GOLD_L }));
  const cust6 = R.reduce((a, r) => a + r.net6r * r.n, 0);
  const cust0 = R.reduce((a, r) => a + r.net0r * r.n, 0);
  [["ワインが年6%上がった場合", cust6], ["ワインが上がらなかった場合", cust0]].forEach((v, i) => {
    const y = y2 + 0.72 + i * 0.52;
    s.addText(v[0], t({ x: X + 0.4, y: y + 0.04, w: 3.2, h: 0.3, fontSize: 11.5, color: C.MUTE }));
    s.addText(man(v[1]) + " 万円", t({ x: X + 3.5, y, w: W - 3.9, h: 0.36, fontSize: 17, bold: true,
      color: C.MINT, align: "right" }));
  });

  strip(s, 5.70, 0.90,
    `会員は年${man(cust0)}〜${man(cust6)}万円、当社は初年度${man(op + ps)}万円。両方が取れています。`,
    `ただし2年目以降の現金は${man(sum("cash"))}万円。利益はワイン販売の粗利とプロフィットシェアに乗っています。`);

  s.addNotes("人件費・システム費・支払利息・自社在庫の保管料は本表に含めていない（別途）。"
    + "プロフィットシェアは契約終了時に精算するため、初年度時点では現金化していない発生額。"
    + `会員メリットは交換先ミックスを反映した実利用ベース。額面ベースなら6%上昇時 ${man(R.reduce((a, r) => a + r.net6 * r.n, 0))}万円。`);
}

save(__dirname + "/WineBank_新レートカード_3枚.pptx");
