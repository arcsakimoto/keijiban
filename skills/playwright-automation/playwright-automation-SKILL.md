name: playwright-automation
description: Playwrightを使用したWebアプリのブラウザテスト自動化、E2Eテストの作成・実行・デバッグを行う。UI操作の自動化、スクリーンショット取得、テストレポート生成に使用。
allowed-tools: bash_tool, view, str_replace, create_file

## スキルの概要
Playwrightを使用してWebアプリケーションの自動テストを作成・実行・保守します。ブラウザ操作の自動化、要素の検証、スクリーンショット取得、テストレポート生成を包括的にサポートします。

## いつ使うか（WHEN）
- Webアプリケーションの自動テストを作成・実行する時
- ブラウザ操作（クリック、入力、ナビゲーション）を自動化する時
- E2Eテストシナリオを実装する時
- UI要素の存在確認や表示検証を行う時
- クロスブラウザテスト（Chromium, Firefox, WebKit）を実行する時
- スクリーンショットやビデオ録画でテスト結果を記録する時
- 既存のPlaywrightテストコードをデバッグ・修正する時
- CIパイプラインにテスト自動化を組み込む時

## いつ使わないか（WHEN NOT）
- APIテストのみを行う場合（curlやaxiosで十分）
- 単純なHTMLスクレイピング（Cheerioやbeautifulsoupが適切）
- パフォーマンステストが主目的の場合（専用ツールを使用）
- モバイルアプリのネイティブテスト（Appiumなどを使用）
- バックエンドのユニットテスト（Jestやpytestを使用）

## 前提条件の確認

### 1. Playwrightのインストール状態を確認
```bash
# Node.js環境の場合
npx playwright --version

# Python環境の場合
playwright --version
```

### 2. 必要に応じてインストール
```bash
# Node.js (推奨)
npm init playwright@latest

# または既存プロジェクトに追加
npm install -D @playwright/test
npx playwright install

# Python
pip install playwright --break-system-packages
playwright install
```

### 3. プロジェクト構造を確認
```bash
view /home/claude
```

## テスト作成の手順

### 1. テスト要件の分析
- テスト対象のURL、ユーザーフロー、期待される動作を確認
- 必要なブラウザ（chromium/firefox/webkit）を特定
- テストデータや認証情報の要否を確認

### 2. テストファイルの作成
```javascript
// tests/example.spec.js
import { test, expect } from '@playwright/test';

test('基本的なナビゲーションテスト', async ({ page }) => {
  // ページに移動
  await page.goto('https://example.com');
  
  // タイトル検証
  await expect(page).toHaveTitle(/Example/);
  
  // 要素のクリック
  await page.click('text=Get Started');
  
  // URL検証
  await expect(page).toHaveURL(/.*getting-started/);
});
```

### 3. ベストプラクティスの適用

#### セレクター戦略（優先順位順）
1. **Role/Accessible name** - 推奨
```javascript
await page.getByRole('button', { name: '送信' }).click();
await page.getByRole('textbox', { name: 'メールアドレス' }).fill('test@example.com');
```

2. **Label/Placeholder**
```javascript
await page.getByLabel('パスワード').fill('secret');
await page.getByPlaceholder('検索...').fill('Playwright');
```

3. **Test ID** - 安定性が必要な場合
```javascript
await page.getByTestId('submit-button').click();
```

4. **CSS/XPath** - 最終手段
```javascript
await page.locator('.submit-btn').click();
```

#### 待機処理の適切な使用
```javascript
// 自動待機（推奨） - Playwrightが自動的に待つ
await page.click('button');

// 明示的な待機（特定条件の場合のみ）
await page.waitForSelector('.dynamic-content');
await page.waitForLoadState('networkidle');

// タイムアウト調整
await page.click('button', { timeout: 10000 });
```

### 4. テストの実行

#### 基本的な実行
```bash
# すべてのテストを実行
npx playwright test

# 特定のファイルを実行
npx playwright test tests/login.spec.js

# ヘッドフルモード（ブラウザ表示）
npx playwright test --headed

# デバッグモード
npx playwright test --debug

# 特定のブラウザのみ
npx playwright test --project=chromium
```

#### レポート確認
```bash
# HTMLレポート生成・表示
npx playwright show-report
```

### 5. スクリーンショット・トレース取得

#### テストコード内での取得
```javascript
test('スクリーンショット例', async ({ page }) => {
  await page.goto('https://example.com');
  
  // フルページスクリーンショット
  await page.screenshot({ path: 'screenshot.png', fullPage: true });
  
  // 特定要素のスクリーンショット
  await page.locator('.header').screenshot({ path: 'header.png' });
});
```

#### トレース記録（デバッグ用）
```javascript
// playwright.config.js
export default {
  use: {
    trace: 'on-first-retry', // 初回失敗時のみ記録
  },
};
```

```bash
# トレース表示
npx playwright show-trace trace.zip
```

## 失敗テストのデバッグ手順

### 1. エラーメッセージの確認
```bash
# 詳細出力で実行
npx playwright test --reporter=list
```

### 2. 一般的な失敗原因と対処法

#### タイムアウトエラー
```javascript
// 問題: 要素が見つからない
await page.click('button'); // TimeoutError

// 解決策1: セレクターを確認
await page.click('button.submit'); // より具体的に

// 解決策2: 待機条件を追加
await page.waitForSelector('button', { state: 'visible' });
await page.click('button');

// 解決策3: タイムアウトを延長
await page.click('button', { timeout: 30000 });
```

#### 要素が見つからない
```javascript
// デバッグ用にページのHTMLを出力
const content = await page.content();
console.log(content);

// 要素の存在確認
const exists = await page.locator('button').count() > 0;
console.log('Button exists:', exists);

// Codegen で正しいセレクターを取得
// npx playwright codegen https://example.com
```

#### フレーム・iframe内の要素
```javascript
// iframe内の要素にアクセス
const frame = page.frameLocator('iframe[title="My Frame"]');
await frame.locator('button').click();
```

#### 動的コンテンツの待機
```javascript
// ネットワーク静止を待つ
await page.waitForLoadState('networkidle');

// 特定のレスポンスを待つ
await page.waitForResponse(resp => 
  resp.url().includes('/api/data') && resp.status() === 200
);
```

### 3. デバッグモードの活用
```bash
# ステップ実行でデバッグ
npx playwright test --debug

# 特定の行で一時停止
# テストコード内に追加:
await page.pause();
```

### 4. UIモード（インタラクティブデバッグ）
```bash
npx playwright test --ui
```

## 高度なテストパターン

### ページオブジェクトモデル（POM）
```javascript
// pages/LoginPage.js
export class LoginPage {
  constructor(page) {
    this.page = page;
    this.emailInput = page.getByLabel('メールアドレス');
    this.passwordInput = page.getByLabel('パスワード');
    this.submitButton = page.getByRole('button', { name: 'ログイン' });
  }

  async login(email, password) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}

// tests/login.spec.js
import { LoginPage } from '../pages/LoginPage';

test('ログインテスト', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await page.goto('/login');
  await loginPage.login('user@example.com', 'password');
  await expect(page).toHaveURL('/dashboard');
});
```

### API Mocking
```javascript
test('APIレスポンスのモック', async ({ page }) => {
  // APIリクエストをインターセプト
  await page.route('**/api/users', route => {
    route.fulfill({
      status: 200,
      body: JSON.stringify([
        { id: 1, name: 'テストユーザー' }
      ]),
    });
  });

  await page.goto('/users');
  await expect(page.locator('text=テストユーザー')).toBeVisible();
});
```

### 並列実行設定
```javascript
// playwright.config.js
export default {
  workers: 4, // 4並列で実行
  fullyParallel: true,
};
```

## CI/CD統合

### GitHub Actions例
```yaml
# .github/workflows/playwright.yml
name: Playwright Tests
on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
      with:
        node-version: 18
    - name: Install dependencies
      run: npm ci
    - name: Install Playwright Browsers
      run: npx playwright install --with-deps
    - name: Run Playwright tests
      run: npx playwright test
    - uses: actions/upload-artifact@v3
      if: always()
      with:
        name: playwright-report
        path: playwright-report/
```

## 出力ファイルの整理

### 1. テスト完了後の確認
```bash
# レポートディレクトリを確認
view playwright-report
view test-results
```

### 2. 成果物を outputs に移動
```bash
# HTMLレポートとスクリーンショットを移動
cp -r playwright-report /mnt/user-data/outputs/
cp -r test-results/screenshots /mnt/user-data/outputs/
```

### 3. ユーザーに提供
- テスト結果HTMLレポート
- 失敗時のスクリーンショット
- トレースファイル（必要な場合）
- 修正済みテストコード

## チェックリスト

実行前:
- [ ] Playwrightがインストールされているか確認
- [ ] テスト対象URLが明確か
- [ ] 必要なブラウザがインストールされているか

テスト作成時:
- [ ] 適切なセレクター戦略を使用しているか
- [ ] 不要な待機処理（sleep）を使っていないか
- [ ] テストが独立しているか（他のテストに依存していないか）
- [ ] エラー時のスクリーンショットが取得されるか

テスト実行後:
- [ ] すべてのテストがパスしたか
- [ ] 失敗テストのエラーメッセージを確認したか
- [ ] レポートが生成されたか
- [ ] 必要なファイルをoutputsに移動したか

## トラブルシューティング

### ブラウザが起動しない
```bash
# ブラウザを再インストール
npx playwright install --with-deps chromium
```

### ヘッドレスモードでのみ失敗する
```javascript
// ビューポートサイズを明示的に設定
use: {
  viewport: { width: 1280, height: 720 },
}
```

### 認証が必要なページ
```javascript
// ストレージステートを保存
test('認証状態を保存', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[name="username"]', 'user');
  await page.fill('[name="password"]', 'pass');
  await page.click('button[type="submit"]');
  
  // 認証状態を保存
  await page.context().storageState({ path: 'auth.json' });
});

// 保存した認証状態を使用
test.use({ storageState: 'auth.json' });
```

## 参考リソース
- 公式ドキュメント: https://playwright.dev/
- ベストプラクティス: https://playwright.dev/docs/best-practices
- API リファレンス: https://playwright.dev/docs/api/class-playwright
