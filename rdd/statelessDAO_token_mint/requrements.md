# 要件定義

## 概要

Stateless DAO のトークン作成時のセットアップを完成させる。また、claimTo を実行できるロールを EOA のアドレスに付与できるボタンをトークン詳細ページに配置する。

## やって欲しいこと

1. src/pages/api/token/metadata/index.ts の API を用いて、トークン名、画像、シンボル、説明が入ったメタデータ(json)をアップロードする
2. src/components/tokens/StatelessDaoTokenCreate.tsx にて StatelessDAO のトークンを作成時に、ClaimCondition のセットアップも行う。この時、1 で生成されたメタデータの情報を用いて lazyMint する nft の設定を行う。
3. トークン詳細画面にて、claimTo を実行できるロールを特定の EOA に付与するためのボタンを用意する。
