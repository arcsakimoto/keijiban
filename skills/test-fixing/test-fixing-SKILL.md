name: test-fixing
description: 失敗したテストの自動検出、原因分析、修正案の提示を行う。テストコードとプロダクションコードの両方を診断し、根本原因を特定して最適な修正方法を提案。
allowed-tools: bash_tool, view, str_replace, create_file

## スキルの概要
テストの失敗を自動的に検出・分析し、失敗の原因を特定して修正案を提示します。テストコード自体の問題か、プロダクションコードの問題かを判別し、適切な修正方法を提案します。

## いつ使うか（WHEN）
- テストが失敗した時に原因を調査する
- CI/CDパイプラインでテストが落ちた時
- リファクタリング後にテストが壊れた時
- 新機能追加でリグレッションが発生した時
- テストの信頼性を向上させたい時（Flaky testの修正）
- テストカバレッジを改善したい時
- テストコードの品質を向上させたい時

## いつ使わないか（WHEN NOT）
- テストフレームワーク自体のセットアップ問題（環境構築が先）
- プロダクションコードが全く存在しない初期段階
- テスト戦略の根本的な見直しが必要な場合（テスト設計の相談）
- パフォーマンステストの分析（専用のプロファイリングツールが必要）

## 前提条件の確認

### 1. テストフレームワークの確認
```bash
# Node.js系
ls -la package.json
cat package.json | grep -E "jest|mocha|vitest|playwright"

# Python系
ls -la requirements.txt pytest.ini setup.py
pip list | grep pytest

# その他
ls -la *test* *spec*
```

### 2. テストの実行方法を特定
```bash
# package.jsonのscriptsを確認
cat package.json | grep -A 5 '"scripts"'

# または直接実行
npm test
pytest
cargo test
go test ./...
```

## 失敗テストの検出手順

### 1. テストを実行して失敗を確認
```bash
# 全テストを実行
npm test

# より詳細な出力
npm test -- --verbose

# 特定のテストファイルのみ
npm test -- path/to/test.spec.js

# 失敗したテストのみ再実行
npm test -- --onlyFailures
```

### 2. 失敗情報の収集

#### 出力から以下を抽出:
- **テスト名**: どのテストが失敗したか
- **エラーメッセージ**: 何が問題だったか
- **スタックトレース**: どこで失敗したか
- **期待値 vs 実際の値**: assertion の内容

#### 例: Jest出力の解析
```
FAIL  src/calculator.test.js
  ● Calculator › should add two numbers

    expect(received).toBe(expected) // Object.is equality

    Expected: 5
    Received: 4

      10 | test('should add two numbers', () => {
      11 |   const result = add(2, 2);
    > 12 |   expect(result).toBe(5);
         |                  ^
      13 | });

    at Object.<anonymous> (src/calculator.test.js:12:18)
```

### 3. 失敗パターンの分類

#### A. Assertion エラー（期待値と実際の値の不一致）
- プロダクションコードのバグ
- テストの期待値が間違っている
- テストデータの不備

#### B. Timeout エラー
- 非同期処理の未完了
- 無限ループ
- APIレスポンスの遅延

#### C. Reference エラー（変数未定義等）
- import/require の問題
- 変数のスコープ問題
- タイポ

#### D. Type エラー
- null/undefined へのアクセス
- 型の不一致
- メソッドの不存在

#### E. Setup/Teardown エラー
- テスト環境の初期化失敗
- データベース接続エラー
- モックの設定ミス

## 原因分析の手順

### 1. テストコードの確認
```bash
# 失敗しているテストファイルを表示
view src/calculator.test.js
```

#### チェックポイント:
- [ ] テストの期待値は正しいか？
- [ ] テストのセットアップは適切か？
- [ ] 非同期処理を正しく待っているか？
- [ ] モックやスタブは正しく設定されているか？
- [ ] テストの独立性は保たれているか？

### 2. プロダクションコードの確認
```bash
# 対応するプロダクションコードを表示
view src/calculator.js
```

#### チェックポイント:
- [ ] 関数の実装は仕様通りか？
- [ ] エッジケースを処理しているか？
- [ ] 型や引数の扱いは正しいか？
- [ ] 副作用が発生していないか？

### 3. 最近の変更を確認
```bash
# 関連ファイルの変更履歴
git log --oneline -10 -- src/calculator.js src/calculator.test.js

# 特定コミットでの変更内容
git show <commit-hash>

# 直前の動作していた状態との差分
git diff HEAD~1 -- src/calculator.js
```

### 4. 依存関係の確認
```bash
# パッケージバージョンの確認
npm list
pip list

# 最近のパッケージ更新
git diff HEAD~1 -- package.json requirements.txt
```

## 修正案の提示方法

### パターン1: テストの期待値が間違っている場合

#### 問題の診断
```javascript
// calculator.test.js
test('should add two numbers', () => {
  const result = add(2, 2);
  expect(result).toBe(5);  // ❌ 間違った期待値
});
```

#### 修正案
```javascript
// calculator.test.js
test('should add two numbers', () => {
  const result = add(2, 2);
  expect(result).toBe(4);  // ✅ 正しい期待値
});
```

**説明**: 2 + 2 = 4 が正しい結果です。テストの期待値を修正します。

---

### パターン2: プロダクションコードにバグがある場合

#### 問題の診断
```javascript
// calculator.js
export function add(a, b) {
  return a - b;  // ❌ 減算になっている
}
```

#### 修正案
```javascript
// calculator.js
export function add(a, b) {
  return a + b;  // ✅ 加算に修正
}
```

**説明**: 関数名は `add` なのに減算を行っていました。加算に修正します。

---

### パターン3: 非同期処理の待機不足

#### 問題の診断
```javascript
// api.test.js
test('should fetch user data', () => {
  const data = fetchUser(1);  // ❌ Promiseを待っていない
  expect(data.name).toBe('Alice');
});
```

#### 修正案
```javascript
// api.test.js
test('should fetch user data', async () => {
  const data = await fetchUser(1);  // ✅ awaitで待機
  expect(data.name).toBe('Alice');
});
```

**説明**: `fetchUser` は非同期関数です。`async/await` を使って結果を待つ必要があります。

---

### パターン4: モックの設定不足

#### 問題の診断
```javascript
// service.test.js
test('should process payment', () => {
  const result = processPayment(100);  // ❌ 外部APIが呼ばれてしまう
  expect(result.success).toBe(true);
});
```

#### 修正案
```javascript
// service.test.js
import { processPayment } from './service';
import { paymentApi } from './api';

jest.mock('./api');

test('should process payment', () => {
  // ✅ APIをモック化
  paymentApi.charge.mockResolvedValue({ success: true });
  
  const result = processPayment(100);
  expect(result.success).toBe(true);
});
```

**説明**: 外部APIへの依存をモック化して、テストを独立させます。

---

### パターン5: テストの独立性の問題

#### 問題の診断
```javascript
// state.test.js
let counter = 0;

test('increment should increase counter', () => {
  counter = increment(counter);
  expect(counter).toBe(1);
});

test('increment twice should be 2', () => {
  counter = increment(counter);
  counter = increment(counter);
  expect(counter).toBe(2);  // ❌ 前のテストの影響で失敗
});
```

#### 修正案
```javascript
// state.test.js
test('increment should increase counter', () => {
  let counter = 0;  // ✅ テスト内で初期化
  counter = increment(counter);
  expect(counter).toBe(1);
});

test('increment twice should be 2', () => {
  let counter = 0;  // ✅ 独立して初期化
  counter = increment(counter);
  counter = increment(counter);
  expect(counter).toBe(2);
});
```

**説明**: テストはそれぞれ独立して実行できる必要があります。共有状態を避けます。

---

### パターン6: エッジケースの未処理

#### 問題の診断
```javascript
// calculator.js
export function divide(a, b) {
  return a / b;  // ❌ ゼロ除算を処理していない
}

// calculator.test.js
test('should handle division by zero', () => {
  expect(() => divide(10, 0)).toThrow();  // ❌ エラーが投げられない
});
```

#### 修正案
```javascript
// calculator.js
export function divide(a, b) {
  if (b === 0) {
    throw new Error('Division by zero');  // ✅ エラーを投げる
  }
  return a / b;
}

// calculator.test.js
test('should handle division by zero', () => {
  expect(() => divide(10, 0)).toThrow('Division by zero');  // ✅ パス
});
```

**説明**: ゼロ除算のエッジケースを適切に処理するようにしました。

## 自動修正の実装

### 1. 修正内容の適用
```bash
# str_replaceツールを使用
str_replace \
  --path src/calculator.js \
  --old_str "return a - b;" \
  --new_str "return a + b;" \
  --description "加算の実装を修正"
```

### 2. テストの再実行
```bash
# 修正後のテスト実行
npm test -- src/calculator.test.js
```

### 3. 結果の確認
```bash
# すべてのテストが通ることを確認
npm test

# カバレッジ確認
npm test -- --coverage
```

## Flaky Test（不安定なテスト）の修正

### Flaky Testの特定
```bash
# テストを複数回実行して不安定性を確認
for i in {1..10}; do
  npm test -- src/flaky.test.js || echo "Run $i failed"
done
```

### よくある原因と修正

#### 1. タイミング問題
```javascript
// ❌ 悪い例
test('should update after delay', () => {
  setTimeout(() => updateValue(5), 100);
  expect(getValue()).toBe(5);  // まだ更新されていない
});

// ✅ 良い例
test('should update after delay', async () => {
  await new Promise(resolve => {
    setTimeout(() => {
      updateValue(5);
      resolve();
    }, 100);
  });
  expect(getValue()).toBe(5);
});
```

#### 2. 並列実行の競合
```javascript
// jest.config.js
module.exports = {
  maxWorkers: 1,  // シリアル実行に変更
  // または
  testSequencer: './customSequencer.js',
};
```

#### 3. 外部依存への依存
```javascript
// ❌ 実際のAPIに依存
test('should fetch data', async () => {
  const data = await fetch('https://api.example.com/data');
  expect(data).toBeDefined();
});

// ✅ モックを使用
test('should fetch data', async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve({ id: 1, name: 'Test' }),
    })
  );
  const data = await fetchData();
  expect(data).toEqual({ id: 1, name: 'Test' });
});
```

## テストカバレッジの改善

### 1. カバレッジレポートの確認
```bash
# カバレッジレポート生成
npm test -- --coverage

# HTMLレポート確認
view coverage/lcov-report/index.html
```

### 2. 未カバー箇所の特定
```bash
# 未カバーの行を表示
npm test -- --coverage --coverageReporters=text
```

### 3. テストケースの追加
```javascript
// 既存のテスト
test('should handle positive numbers', () => {
  expect(abs(5)).toBe(5);
});

// ✅ 追加すべきテストケース
test('should handle negative numbers', () => {
  expect(abs(-5)).toBe(5);
});

test('should handle zero', () => {
  expect(abs(0)).toBe(0);
});

test('should handle decimal numbers', () => {
  expect(abs(-3.14)).toBe(3.14);
});
```

## 修正レポートの生成

### テンプレート
```markdown
# テスト修正レポート

## 失敗したテスト
- `src/calculator.test.js` - "should add two numbers"

## 原因
プロダクションコードの `add` 関数が減算を行っていました。

## 修正内容
`src/calculator.js` の12行目を以下のように修正:
```javascript
- return a - b;
+ return a + b;
```

## テスト結果
✅ すべてのテストがパスしました (15/15)

## カバレッジ
- Statements: 95.2% (+2.1%)
- Branches: 87.5% (+5.0%)
- Functions: 100% (変更なし)
- Lines: 94.8% (+1.9%)
```

## チェックリスト

診断前:
- [ ] テストフレームワークが正しく設定されているか
- [ ] すべての依存関係がインストールされているか
- [ ] テストを実行できる環境か

分析時:
- [ ] エラーメッセージを正確に読み取ったか
- [ ] テストコードとプロダクションコードの両方を確認したか
- [ ] 最近の変更を調査したか
- [ ] 関連する他のテストも確認したか

修正後:
- [ ] 修正が失敗の根本原因に対処しているか
- [ ] 他のテストに影響を与えていないか
- [ ] カバレッジが低下していないか
- [ ] CI/CDでも成功するか確認

## トラブルシューティング

### テストがタイムアウトする
```javascript
// タイムアウトを延長
jest.setTimeout(10000);

test('long running test', async () => {
  // ...
}, 10000);  // このテストのみ10秒に設定
```

### モジュールが見つからない
```bash
# キャッシュクリア
npm test -- --clearCache

# node_modulesを再インストール
rm -rf node_modules package-lock.json
npm install
```

### スナップショットテストの更新
```bash
# スナップショットを更新
npm test -- -u
```

## 参考リソース
- Jest: https://jestjs.io/
- Pytest: https://docs.pytest.org/
- Testing Best Practices: https://github.com/goldbergyoni/javascript-testing-best-practices
