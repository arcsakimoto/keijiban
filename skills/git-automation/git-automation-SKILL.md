name: git-automation
description: Gitの高度な自動化操作。コミットメッセージの自動生成、変更の自動ステージング、リモートへのプッシュ、ブランチ管理、コンフリクト解決をサポート。
allowed-tools: bash_tool, view, str_replace

## スキルの概要
Gitの煩雑な操作を自動化し、開発者の生産性を向上させます。変更内容を分析してコミットメッセージを自動生成し、適切なステージング、コミット、プッシュまでの一連の流れを効率化します。

## いつ使うか（WHEN）
- コミットメッセージを自動生成したい時
- 大量の変更を適切に分割してコミットしたい時
- Gitの基本操作（add, commit, push）を自動化したい時
- コミット履歴を整理・修正したい時
- ブランチ作成・切り替え・マージを行う時
- リモートリポジトリとの同期を自動化したい時
- `.gitignore` の設定や更新を行う時
- コンフリクトの検出と解決支援が必要な時

## いつ使わないか（WHEN NOT）
- Gitリポジトリが初期化されていない新規プロジェクト（まず `git init` が必要）
- GitHubのIssue、Pull Request、Actions等のプラットフォーム固有機能（GitHub CLI推奨）
- 複雑なリベースやチェリーピック（手動での慎重な操作が必要）
- 機密情報を含むコミットの完全削除（専門的な履歴書き換えツールが必要）
- 複数人が同時編集中の緊急コンフリクト（直接コミュニケーションが必要）

## 前提条件の確認

### 1. Gitリポジトリの存在確認
```bash
# 現在のディレクトリがGitリポジトリか確認
git rev-parse --git-dir 2>/dev/null && echo "Gitリポジトリです" || echo "Gitリポジトリではありません"

# リポジトリのルートディレクトリを確認
git rev-parse --show-toplevel
```

### 2. Git設定の確認
```bash
# ユーザー名とメールアドレスが設定されているか
git config user.name
git config user.email

# 未設定の場合は設定を促す
# git config --global user.name "Your Name"
# git config --global user.email "your@email.com"
```

### 3. 現在の状態確認
```bash
# ブランチと変更状況を確認
git status
git branch -a
```

## コミットメッセージ自動生成の手順

### 1. 変更内容の分析
```bash
# ステージされていない変更を確認
git diff

# ステージ済みの変更を確認
git diff --cached

# 変更されたファイル一覧
git status --short
```

### 2. 変更内容から意図を読み取る
以下の情報を総合的に分析:
- **変更されたファイル名**: どの機能・モジュールか
- **追加・削除・変更の内容**: 何をしたか
- **変更のパターン**: 
  - 新規ファイル追加 → feat, docs, test等
  - バグ修正パターン → fix
  - リファクタリング → refactor
  - ドキュメント更新 → docs
  - テスト追加 → test

### 3. Conventional Commits形式でメッセージ生成

#### 基本フォーマット
```
<type>(<scope>): <subject>

<body>

<footer>
```

#### Type一覧
- `feat`: 新機能追加
- `fix`: バグ修正
- `docs`: ドキュメントのみの変更
- `style`: コードの意味に影響しない変更（フォーマット、セミコロン等）
- `refactor`: バグ修正や機能追加を含まないコード改善
- `perf`: パフォーマンス改善
- `test`: テストの追加・修正
- `chore`: ビルドプロセスやツールの変更
- `ci`: CI設定ファイルやスクリプトの変更

#### 良いコミットメッセージの例
```bash
# 例1: 新機能追加
feat(auth): ユーザー登録機能を実装

- メールアドレスとパスワードでの登録
- メール認証フロー
- 既存ユーザーの重複チェック

Closes #123

# 例2: バグ修正
fix(payment): 決済処理での金額計算エラーを修正

消費税計算時の丸め誤差により、1円のズレが発生していた問題を修正

# 例3: リファクタリング
refactor(database): クエリビルダーをより型安全な実装に変更

# 例4: ドキュメント
docs(README): インストール手順を更新
```

### 4. 自動生成の実装例
```bash
# 変更内容を取得
CHANGES=$(git diff --cached --stat)
DIFF_SUMMARY=$(git diff --cached --shortstat)

# 簡易的な自動判定ロジック
if echo "$CHANGES" | grep -q "test"; then
  TYPE="test"
elif echo "$CHANGES" | grep -q "README\|docs/"; then
  TYPE="docs"
elif echo "$CHANGES" | grep -q "fix\|bug"; then
  TYPE="fix"
else
  TYPE="feat"
fi

# メッセージ生成（実際にはより高度な分析を行う）
echo "$TYPE: 変更内容の要約"
```

## ステージング〜プッシュの自動化手順

### 1. 変更のステージング

#### パターンA: 全ファイルをステージング
```bash
git add .
```

#### パターンB: 特定のファイルのみステージング
```bash
# 変更の種類ごとに分割
git add src/          # ソースコード
git add tests/        # テストファイル
git add docs/         # ドキュメント
```

#### パターンC: 対話的ステージング（部分的な変更）
```bash
# ファイルの一部だけをステージング
git add -p

# 特定ファイルの部分ステージング
git add -p src/main.js
```

### 2. コミットの実行
```bash
# 生成されたメッセージでコミット
git commit -m "feat(api): ユーザー検索APIを追加"

# 複数行メッセージの場合
git commit -F - <<EOF
feat(api): ユーザー検索APIを追加

- 名前、メールアドレスでの検索
- ページネーション対応
- 検索結果のソート機能

Closes #456
EOF
```

### 3. リモートへのプッシュ

#### 事前チェック
```bash
# リモートの設定確認
git remote -v

# 現在のブランチ確認
CURRENT_BRANCH=$(git branch --show-current)
echo "Current branch: $CURRENT_BRANCH"

# リモートブランチとの差分確認
git fetch origin
git status
```

#### プッシュの実行
```bash
# 通常のプッシュ
git push origin $CURRENT_BRANCH

# 初回プッシュ（upstream設定）
git push -u origin $CURRENT_BRANCH

# 強制プッシュ（要注意！）
# git push --force-with-lease origin $CURRENT_BRANCH
```

### 4. 自動化スクリプト例
```bash
#!/bin/bash
# auto-commit-push.sh

set -e  # エラー時に停止

# 1. 状態確認
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "変更が検出されました"
else
  echo "コミットする変更がありません"
  exit 0
fi

# 2. 変更をステージング
echo "変更をステージング中..."
git add .

# 3. コミットメッセージ生成（ここでは簡略版）
COMMIT_MSG="chore: 自動コミット $(date '+%Y-%m-%d %H:%M:%S')"

# 4. コミット
echo "コミット中: $COMMIT_MSG"
git commit -m "$COMMIT_MSG"

# 5. プッシュ
BRANCH=$(git branch --show-current)
echo "プッシュ中: origin/$BRANCH"
git push origin "$BRANCH"

echo "完了しました！"
```

## ブランチ管理

### 1. ブランチの作成と切り替え
```bash
# 新しいブランチを作成して切り替え
git checkout -b feature/new-feature

# または（Git 2.23以降）
git switch -c feature/new-feature

# リモートブランチから作成
git checkout -b feature/new-feature origin/develop
```

### 2. ブランチのマージ
```bash
# developブランチに戻る
git checkout develop

# 変更を取り込む
git merge feature/new-feature

# コンフリクトがある場合は解決後
git add .
git commit
```

### 3. ブランチの削除
```bash
# ローカルブランチ削除
git branch -d feature/new-feature

# リモートブランチ削除
git push origin --delete feature/new-feature
```

## 高度な操作

### コミットの修正
```bash
# 直前のコミットメッセージを修正
git commit --amend -m "fix(auth): typo修正"

# 直前のコミットに変更を追加
git add forgotten-file.js
git commit --amend --no-edit
```

### コミット履歴の整理
```bash
# 最新3件のコミットを対話的にリベース
git rebase -i HEAD~3

# コミットをまとめる（squash）
# エディタで pick を squash に変更
```

### 一時退避
```bash
# 作業を一時退避
git stash save "作業途中のログイン機能"

# 退避リスト確認
git stash list

# 復元
git stash pop

# 特定の退避を適用
git stash apply stash@{1}
```

## エラーハンドリング

### コンフリクトの検出
```bash
# プル時のコンフリクト
git pull origin main
# CONFLICT が表示された場合

# コンフリクトファイルを確認
git status | grep "both modified"

# コンフリクト箇所を表示
git diff --name-only --diff-filter=U
```

### コンフリクトの解決支援
```bash
# コンフリクトマーカーを検索
grep -r "<<<<<<< HEAD" .

# マージツールを起動
git mergetool

# 解決後
git add .
git commit
```

### よくあるエラーと対処

#### エラー1: プッシュが拒否される
```bash
# リモートに新しいコミットがある場合
error: failed to push some refs to 'origin'

# 解決策: まずプル
git pull --rebase origin main
git push origin main
```

#### エラー2: コミット前にユーザー名が未設定
```bash
# エラー
Author identity unknown

# 解決策
git config user.name "Your Name"
git config user.email "your@email.com"
```

#### エラー3: 大きなファイルがプッシュできない
```bash
# Git LFSを使用
git lfs track "*.psd"
git add .gitattributes
git add large-file.psd
git commit -m "chore: 大きなファイルをLFSで管理"
```

## .gitignore の管理

### 基本的な設定
```bash
# .gitignoreファイルを作成
cat > .gitignore <<EOF
# 依存関係
node_modules/
venv/
__pycache__/

# ビルド成果物
dist/
build/
*.exe

# 環境設定
.env
.env.local

# IDE
.vscode/
.idea/
*.swp

# OS
.DS_Store
Thumbs.db
EOF

git add .gitignore
git commit -m "chore: .gitignoreを追加"
```

### 既に追跡中のファイルを除外
```bash
# キャッシュから削除（ファイル自体は残る）
git rm --cached config/secrets.yml
echo "config/secrets.yml" >> .gitignore
git commit -m "chore: secrets.ymlを追跡から除外"
```

## CI/CD連携

### GitHub Actionsとの連携例
```bash
# .github/workflows/auto-commit.yml
name: Auto Commit
on:
  schedule:
    - cron: '0 0 * * *'  # 毎日0時
jobs:
  commit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Auto commit
        run: |
          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"
          # 自動生成処理
          ./scripts/generate-report.sh
          git add reports/
          git commit -m "chore: 日次レポート自動生成 $(date +%Y-%m-%d)" || echo "No changes"
          git push
```

## チェックリスト

実行前:
- [ ] Gitリポジトリが初期化されているか
- [ ] user.name と user.email が設定されているか
- [ ] リモートリポジトリが設定されているか
- [ ] 現在のブランチが正しいか

コミット前:
- [ ] コミット対象のファイルが正しいか確認
- [ ] 機密情報が含まれていないか確認
- [ ] テストが通っているか（必要な場合）
- [ ] コミットメッセージが明確か

プッシュ前:
- [ ] リモートの最新状態を取得したか（git fetch）
- [ ] コンフリクトがないか確認
- [ ] プッシュ先ブランチが正しいか確認

実行後:
- [ ] プッシュが成功したか確認
- [ ] GitHub/GitLab等で変更が反映されているか確認
- [ ] CI/CDが正常に動作しているか確認

## トラブルシューティング

### 間違ってコミットした場合
```bash
# 直前のコミットを取り消し（変更は保持）
git reset --soft HEAD~1

# 直前のコミットを完全に取り消し
git reset --hard HEAD~1
```

### プッシュ済みコミットを取り消したい
```bash
# リバートコミットを作成（推奨）
git revert HEAD
git push origin main

# 強制的に履歴を書き換え（危険）
# git reset --hard HEAD~1
# git push --force origin main
```

### ファイルが大きすぎてプッシュできない
```bash
# BFG Repo-Cleanerで大きなファイルを履歴から削除
# https://rtyley.github.io/bfg-repo-cleaner/
```

## 参考リソース
- Conventional Commits: https://www.conventionalcommits.org/
- Git公式ドキュメント: https://git-scm.com/doc
- Git LFS: https://git-lfs.com/
