---
name: gmail-draft-with-files
description: 中野様のGmailに、資料（Excel・PowerPoint・PDF等）を付けたメールの下書きを作るときの手順。添付が大きくて送れない場合は、Driveの「クロードメール下書きファイル」フォルダに置いてリンクを本文に入れる。「メールの下書きを入れて」「Gmailに下書き」「資料を添付して下書き」などの依頼で使う。
---

# 資料付きのGmail下書きを作る

## 1. 宛先を確かめる
- 宛先のアドレスはGmailの過去のやり取りから探す（例：HIRAC岡田様はマネーフォワードのアドレス okada.kohji@moneyforward.co.jp）。
- 同じ相手でも複数アドレスがある場合は、ご指示のアドレス（「マネフォメール」など）を使う。見つからなければ確認する。

## 2. 添付の大きさを確かめる
- Gmail・Driveのコネクタは1回の呼び出しが4.2MBまでで、ファイルに使えるのは約3.1MB。超えると何も送られない。
- `ls -la` で合計サイズを確認する。3MB以下ならそのまま添付する（ファイル参照 `sha256:<hash>:<絶対パス>` を使い、base64は打たない）。

## 3. 大きいPowerPointは、まず埋め込みフォントを外す
- 会社紹介デックのマスター（9/30会社案内）から作ったpptxは、埋め込みフォント（ppt/fonts/*.fntdata、計4.6MB）でほぼ全体が占められている。
- 本文はメイリオで書いているので、埋め込みフォントを外しても見た目は変わらない。外すと5枚で約0.2MBになる。
- 手順：zipから `ppt/fonts/` を除き、`ppt/presentation.xml` の `<p:embeddedFontLst>` と、`ppt/_rels/presentation.xml.rels` のfonts宛てのRelationship、`[Content_Types].xml` の fntdata の Default を削除する。
  元ファイルは残し、軽量版はscratchpadに作る。LibreOfficeでPDFにして見た目を確認する。
- 画像の圧縮など、見た目が変わる軽量化はご了承を得てから行う。

## 4. 添付で送れないものは、Driveに置いてリンクにする
- 置き場所：マイドライブの「クロードメール下書きファイル」フォルダ
  （ID：1zJwRJVf-NRmgpKMkjjHSlPtBEMV52HLi、https://drive.google.com/drive/folders/1zJwRJVf-NRmgpKMkjjHSlPtBEMV52HLi）
  見つからない場合は同じ名前で作り直す。
- アップロードは `disableConversionToGoogleType: true` で、元の形式（pptx・xlsx等）のまま置く。
- 本文の【資料】欄に、添付したものとリンクのものを分けて書く。
- 共有設定（相手にアクセス権を付ける・リンクを公開する）は、外部に公開する操作なので、必ず中野様に確認してから行う。
  下書きを作った時点では、ファイルは中野様だけが見られる状態であることを伝える。

## 5. 下書きを作る
- 件名・本文はリポジトリ内の下書きファイル（例：`投資家資料/.../〇〇様_メール下書き_*.md`）と同じ内容にする。1行目の「件名：」は件名欄に入れ、本文からは除く。
- 本文はプレーンテキスト（Markdownの記号は使わない）。
- 送信はしない。下書きのURLを中野様に伝え、送る前の確認事項（共有設定、未確定の数字、守秘の範囲）を添える。
