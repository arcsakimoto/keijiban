<!-- skills/docx/SKILL.md - Word文書(.docx)生成・編集用スキル -->
---
name: docx-generator
description: Word文書(.docx)の生成・編集。議事録、契約書、報告書などの定型文書作成
allowed-tools: Read, Write, Bash
---

# Word文書生成スキル

## いつ使うか（WHEN）
- Word文書やdocxファイルを作成する時
- 議事録、報告書、契約書などの定型文書を作る時

## いつ使わないか（WHEN NOT）
- PDFで出力する場合は pdf スキルを使用
- スプレッドシートの場合は xlsx スキルを使用

## 手順
1. python-docxライブラリを使用
2. 日本語フォントはMS明朝またはMSゴシックを指定
3. ファイル名は日本語OK
4. 完成後ファイルの内容をコメントで説明
