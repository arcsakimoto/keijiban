# お知らせ掲示板

Next.js 15 (App Router) + Supabase + Tailwind CSS で構築した社内お知らせ掲示板です。

## 技術スタック

- **Next.js 15** (App Router) + TypeScript
- **Supabase**（認証・データベース）
- **Tailwind CSS**（ダークモード対応）
- 日本語UI・レスポンシブ対応

## セットアップ

```bash
cd "/Users/motomaroyasu/Claude Code/システム開発/keijiban"
npm install
```

`.env.local` は既に設定済みです。

## 開発サーバー

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## 機能

- **認証**: メール+パスワードでログイン・新規登録
- **お知らせ一覧**: 検索、カテゴリ・重要度フィルター
- **投稿・編集・削除**: ログイン済みユーザーが投稿可能。投稿者のみ編集・削除可（RLSで制御）
- **重要度の色分け**: 緊急=赤、重要=黄、通常=緑
- **ダークモード**: ヘッダーのトグルで切り替え

## Supabase テーブル

- **profiles**: id, email, display_name, company, role
- **posts**: id, author_id, title, body, category, priority
  - カテゴリ: general, safety, site, admin_hr, other
  - 重要度: normal, important, urgent
  - RLS 有効・投稿者のみ編集・削除可
  - （任意）表示順・日時表示用に `created_at` (timestamptz) を追加すると便利です）

## ビルド

```bash
npm run build
npm start
```
