<!-- skills/xlsx/SKILL.md - Excelスプレッドシート(.xlsx)生成・編集用スキル -->
---
name: xlsx-generator
description: Excelスプレッドシート(.xlsx)の生成・編集。数式・集計・データ分析用
allowed-tools: Read, Write, Bash
---

# スプレッドシート生成スキル

## いつ使うか（WHEN）
- Excelファイルを作成・編集する時
- 数値データの集計やグラフを作る時

## いつ使わないか（WHEN NOT）
- Word文書の場合は docx スキルを使用
- プレゼン資料の場合は pptx スキルを使用

## 手順
1. openpyxlライブラリを使用
2. 数値は3桁カンマ区切りフォーマット
3. 日本語ヘッダー対応
4. 完成後ファイルの内容をコメントで説明
