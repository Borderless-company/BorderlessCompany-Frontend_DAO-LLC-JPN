# Borderless v0.1

## アーキテクチャ

- Frontend: Next.js Page Router
- Backend: Next.js API Routes
- Database: Supabase(PostgreSQL)

## ローカルでの起動

```bash
pnpm install
pnpm dev
```

## デプロイ

- NEXT_PUBLIC_CHAIN_ID を変更する
- NEXT_PUBLIC_BASE_URL を変更する
- Dev サーバー: metis-testnet.apps.borderless.company
- 本番サーバー: apps.borderless.company

## DB

- login supabase

```bash
npx supabase login
```

- generate types

```bash
pnpm supabase:type
```

