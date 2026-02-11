# folder-organizer
<!-- このファイルはダウンロードフォルダなどの整理を自動化するためのスキルです -->

## 概要
散らかったフォルダ内のファイルを種類別に自動で整理するスキルです。

---

## WHEN（いつ使うか）
- ダウンロードフォルダにファイルが溜まって整理したいとき
- 複数の種類のファイルが混在しているフォルダを整理したいとき
- ユーザーが「フォルダを整理して」「ファイルを分類して」と依頼したとき
- プロジェクト終了後にファイルを種類別にまとめたいとき

## WHEN NOT（いつ使わないか）
- すでに整理されているフォルダ（サブフォルダで分類済み）
- 特定のファイルだけを移動したい場合（個別対応が適切）
- システムフォルダや重要なフォルダ（/Applications, /System など）
- ファイル名でのリネームや日付別整理が必要な場合（別の方法が適切）

---

## 整理のルール

### 分類フォルダ（5種類）
| フォルダ名 | 対象ファイル | 拡張子の例 |
|-----------|-------------|-----------|
| **images/** | 画像ファイル | .jpg, .jpeg, .png, .gif, .bmp, .svg, .webp |
| **documents/** | 文書・資料ファイル | .pdf, .docx, .doc, .xlsx, .xls, .pptx, .ppt, .txt |
| **archives/** | 圧縮ファイル | .zip, .rar, .tar.gz, .7z, .tar |
| **code/** | プログラムファイル | .js, .py, .html, .php, .java, .c, .cpp, .swift |
| **others/** | 上記以外のファイル | .json, .md, .css, .tmp, .log など |

### 注意事項
- 隠しファイル（.で始まるファイル）は移動しない
- サブフォルダ内のファイルは対象外（ルート直下のファイルのみ）
- 同名ファイルがある場合は上書きに注意（事前確認推奨）

---

## 実行手順

### 1. 事前確認
```bash
# 対象フォルダの現在の状態を確認
ls -la "対象フォルダのパス"
```
- ファイル数と種類を把握する
- すでにサブフォルダがないか確認する

### 2. 分類フォルダの作成
```bash
cd "対象フォルダのパス"
mkdir -p images documents archives code others
```

### 3. ファイルの移動
```bash
# 画像ファイル
mv *.jpg *.jpeg *.png *.gif *.bmp *.svg *.webp images/ 2>/dev/null

# 文書ファイル
mv *.pdf *.docx *.doc *.xlsx *.xls *.pptx *.ppt *.txt documents/ 2>/dev/null

# 圧縮ファイル
mv *.zip *.rar *.tar.gz *.7z archives/ 2>/dev/null

# コードファイル
mv *.js *.py *.html *.php *.java *.c *.cpp *.swift code/ 2>/dev/null

# その他のファイル
mv *.json *.md *.css *.tmp *.log others/ 2>/dev/null
```
※ `2>/dev/null` は該当ファイルがない場合のエラーを非表示にする

### 4. 結果確認
```bash
# 各フォルダの内容を確認
echo "【images/】" && ls images/
echo "【documents/】" && ls documents/
echo "【archives/】" && ls archives/
echo "【code/】" && ls code/
echo "【others/】" && ls others/
```

### 5. Finderで確認（オプション）
```bash
open "対象フォルダのパス"
```

---

## カスタマイズ例

### 日付フォルダを追加したい場合
```bash
mkdir -p "$(date +%Y-%m)"
```

### 動画フォルダを追加したい場合
```bash
mkdir -p videos
mv *.mp4 *.mov *.avi *.mkv videos/ 2>/dev/null
```

### 音声フォルダを追加したい場合
```bash
mkdir -p audio
mv *.mp3 *.wav *.aac *.flac audio/ 2>/dev/null
```
