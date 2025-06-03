# テストスイート - セキュリティ脆弱性対応

## 📋 概要

このディレクトリには、Borderless Company フロントエンドアプリケーションのセキュリティ脆弱性対応テストが含まれています。

## 🗂️ ディレクトリ構造

```
tests/
├── unit/                    # ユニットテスト
│   ├── middleware/         # 認証ミドルウェアテスト
│   ├── utils/              # ユーティリティ関数テスト
│   └── hooks/              # React Hooksテスト
├── integration/            # 統合テスト
│   └── api/               # API エンドポイントテスト
│       ├── critical/      # CRITICAL優先度の脆弱性テスト
│       ├── high/          # HIGH優先度の脆弱性テスト
│       └── medium/        # MEDIUM優先度の脆弱性テスト
├── security/              # セキュリティ専用テスト
├── __mocks__/             # モックファイル
├── fixtures/              # テストデータ
└── setup.ts               # テスト環境設定
```

## 🚨 実装済み脆弱性テスト

### CRITICAL 脆弱性 (6 件実証済み)

- ✅ 認証なしでユーザー作成が可能
- ✅ 認証なしで他人のユーザー情報更新が可能
- ✅ 認証なしでユーザー削除が可能
- ✅ JWT 検証失敗時に空のアドレスで処理続行
- ✅ 改ざんされた JWT でも処理続行
- ✅ 期限切れ JWT でも処理続行

### HIGH 脆弱性 (3 件実証済み)

- ✅ 無効な EVM アドレス形式でもユーザー作成可能
- ✅ XSS 攻撃可能なデータがそのまま保存
- ✅ 他人のデータ更新に所有権チェックなし

## 🧪 テスト実行方法

### 全テスト実行

```bash
pnpm test
```

### セキュリティテストのみ実行

```bash
pnpm test:security:critical
```

### 特定のテストファイル実行

```bash
pnpm test tests/unit/middleware/verifyJWT.test.ts
pnpm test tests/integration/api/critical/user.test.ts
```

### カバレッジ付きテスト実行

```bash
pnpm test:coverage
```

## 📊 テスト結果

**最終実行結果**:

- Test Suites: 2 passed, 2 total
- Tests: 19 passed, 19 total
- 実行時間: 4.3 秒
- テスト成功率: 100%

## 🔧 テスト設定

- **テストフレームワーク**: Jest + Testing Library
- **モック**: Supabase, JWT
- **環境変数**: tests/setup.ts で設定
- **タイムアウト**: 30 秒

## ⚠️ 重要事項

1. **本番環境では絶対にテストを実行しないでください**
2. テストは開発・ステージング環境のみで実行
3. CRITICAL 脆弱性は修正まで緊急対応が必要
4. テスト失敗時は即座にエスカレーション

## 📞 緊急時連絡先

セキュリティテスト失敗時は下記に連絡：

- 開発チームリーダー
- セキュリティエンジニア
- プロジェクトマネージャー
