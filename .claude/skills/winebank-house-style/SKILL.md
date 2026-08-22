---
name: winebank-house-style
description: WineBank（株式会社WineBank／中野邦人）の資料ハウススタイル。森ビル様業務提携ご提案パワポのトンマナ（コッパー×ダークスレート×クールグレー）を、あらゆる成果物の既定デザインとして適用する。Artifact・HTML資料・提案書・レポート・メモ・一覧表・スライド・pptx/docx/xlsx など、WineBank関連で「資料」「提案書」「一覧表」「レポート」「まとめ」を作る場面すべてで、色・フォント・レイアウトを決める前に必ず読み込むこと。ユーザーが別のトンマナを明示した場合のみ、そちらを優先する。
---

# WineBank ハウススタイル

出典：`森ビル様_業務提携ご提案_WineBank_20260811.pptx`（全37枚）から抽出した実使用値。
**これがWineBank資料の既定トンマナ。** ボルドー／ワインレッド系や、明朝体を主役にした装飾的なデザインは使わない。

## 基本思想

事業会社の実務提案資料。**静かで、情報密度が高く、装飾がない。**
色を使うのは「ここが提案の核だ」と示す一点のみ。それ以外はグレースケールで組む。
ヒーローセクション、グラデーション、大きな余白の演出、絵文字での見出し装飾は**使わない**。

## カラートークン

| 役割 | 値 | 用途 |
|---|---|---|
| `--ink` | `#1A1A1A` | 本文・見出し。純黒ではなくわずかに沈めた黒 |
| `--ink-2` | `#333333` | 副次テキスト |
| `--ink-3` | `#6E7378` | 補足・キャプション・ラベル（クールグレー） |
| `--slate` | `#2F3941` | 表ヘッダー、強調パネル、フッターバー |
| `--copper` | `#C68A65` | **唯一のアクセント。** 章番号チップ、強調列ヘッダー、タイトル下の短いルール |
| `--copper-dp` | `#A06D4C` | コッパーの濃色（テキストとして使う場合／ホバー） |
| `--copper-tint` | `#EFDCCE` | 補足ボックスの地色 |
| `--copper-tint-2` | `#F5EFEB` | さらに淡いコッパー地 |
| `--fill` | `#DDE0E2` | カード地色（クールグレー） |
| `--rule` | `#C7CACC` | 罫線 |
| `--surface` | `#FFFFFF` | 基本地色 |
| `--surface-2` | `#F6F6F6` | オフホワイト |

補助色（比較対象・第2系統を出す必要があるときだけ）：`#2F5496`（ブルー）。
コッパーとブルーを同一図中で対置させるのは、森ビル資料の「テナント向け／レジデンス向け」のような**対比が意味を持つ場合に限る**。

## タイポグラフィ

- **明朝体は使わない。** 元資料は Arial + Calibri、和文はゴシック。
- Google Fonts で組む場合：和文 `Noto Sans JP`、欧文・数字 `Inter`。
  ```html
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+JP:wght@400;500;700&display=swap">
  ```
  fallback: `"Noto Sans JP", -apple-system, "Hiragino Kaku Gothic ProN", "Yu Gothic", Meiryo, sans-serif`
- スライドタイトルは**ウェイトを上げず、字間をやや開ける**（`letter-spacing:.04em`）。太字は語句単位で差す。
- 数値は必ず `font-variant-numeric: tabular-nums`。
- ラベル・目次番号など小さい英字は `letter-spacing:.1em; text-transform:uppercase; font-size:10–11px; color:var(--ink-3)`。

## コンポーネント規約

**章番号チップ**（`PROGRAM 01` 形式）
左上に置くコッパーの矩形ブロック。上段に小さい英字ラベル、下段に大きい番号。白抜き。
角丸なし〜2px。見出しはチップの右に、同じベースラインで並べる。

**表**
- ヘッダー行：`--slate` 地に白文字。**提案・強調したい列のヘッダーだけ `--copper` 地**にする。
- 本文行：白地。横罫（`1px solid var(--rule)`）のみ。**縦罫は引かない。**
- 1列目は左揃えのラベル列、数値列は右揃え。
- 表の下に注記を1行、`--ink-3` の小さい文字で置く。

**カード**
`--fill` 地、影なし、枠線なし、角丸2–4px。
最重要カード1枚だけ `--slate` 地＋白文字に反転させて主従をつける。
枠線で組む場合は `1px solid var(--copper)` とし、ヘッダー帯をコッパーで塗る。

**補足ボックス**
`--copper-tint` 地。見出しは `--copper-dp`。本文は `--ink-2`。枠線なし。

**結論バー**
セクションの最後に、`--slate` 地・白文字・中央揃えの横長バーで結論を1行置く。多用しない。

**フッター**
左下に `CONFIDENTIAL`（`--ink-3`、10px、`letter-spacing:.1em`）。
ページ最下部に `--slate` の細い帯（高さ 24–40px）。

## Artifact（HTML）で使うとき

3テーマ状態すべてを必ず組む。ライトが基本。

```css
:root{
  --surface:#FFFFFF; --surface-2:#F6F6F6; --fill:#DDE0E2;
  --ink:#1A1A1A; --ink-2:#333333; --ink-3:#6E7378;
  --slate:#2F3941; --rule:#C7CACC;
  --copper:#C68A65; --copper-dp:#A06D4C;
  --copper-tint:#EFDCCE; --copper-tint-2:#F5EFEB;
}
@media (prefers-color-scheme:dark){ :root:not([data-theme="light"]){ /* 下記ダーク値 */ } }
:root[data-theme="dark"]{ /* 同じダーク値 */ }
```

ダーク時の対応値（コッパーは彩度を保ったまま明るく寄せる）：
```
--surface:#1C2024; --surface-2:#232830; --fill:#2F3941;
--ink:#ECEEF0; --ink-2:#C7CACC; --ink-3:#9AA1A7;
--slate:#0F1317; --rule:#3C444C;
--copper:#D9A183; --copper-dp:#EFDCCE;
--copper-tint:#3A2C24; --copper-tint-2:#2A211C;
```

`body` には必ずトークン由来の `background` を明示すること。

## やらないこと

- ボルドー／ワインレッド（`#6E2233` 等）をアクセントにする
- 見出しに明朝体（Shippori Mincho / Yu Mincho 等）を使う
- カードに影を落とす、角を大きく丸める
- アクセント色を2色以上ばらまく
- 絵文字を見出しやセクションマーカーに使う
- 意味のない連番（01/02/03）を装飾として振る（実際に順序・段階があるときだけ使う）
