# 書面（レター）

## ファイル名の規則

納品用PDFは `YYYYMMDD_宛先_内容.pdf`（日付＝書面の発信日）で保存する。
改訂したら新しい日付で書き出し、同日中の作り直しは `_r2` を付ける。
編集用のHTML原稿は日付なしの固定名のままとし、版は git 履歴で管理する。
詳細は `.claude/skills/deliverable-naming/SKILL.md` を参照。

## 納品物と原稿の対応

| 納品PDF | 原稿HTML | 内容 |
| --- | --- | --- |
| `20260825_三井不動産商業マネジメント様_赤れんがテラス_地位承継依頼書.pdf` | `succession-letter-akarenga-ptitsale.html` | 赤れんが テラス「P'tit sale'」の営業と出店に関する契約について、賃借人たる地位をワイン・ラ・ターブル → バリューキッチンへ承継する申入れ |
| `20260825_北海道エアポート様_新千歳空港_店舗運営承継依頼書.pdf` | `operation-change-letter-shinchitose-gears.html` | 新千歳空港「ジアス ルーク＆タリー」について、賃借人はWineBankのまま、店舗運営会社をワイン・ラ・ターブル → バリューキッチンへ承継する報告・承認依頼（2026年6月1日以降の委託の遡及承認を含む） |
| `20260825_大江戸ホールディングス様_日本橋大江戸ビル_地位承継依頼書.pdf` | `succession-letter-ohedo-chronos.html` | 日本橋大江戸ビル屋上の賃貸借契約について、賃借人たる地位をクロノス → エルネットへ承継する承諾依頼 |

いずれもA4 1枚、下部にグループ関係図（中野邦人を主要株主とする兄弟会社の関係）を掲載。

## PDFの再生成

```
chromium --headless --disable-gpu --no-sandbox --no-pdf-header-footer \
  --print-to-pdf="20260825_宛先_内容.pdf" 原稿ファイル.html
```

このリポジトリでは `/opt/pw-browsers/chromium-1194/chrome-linux/chrome` を使用。
