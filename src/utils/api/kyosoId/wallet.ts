/**
 * 共創ID - ウォレット連携API関連のユーティリティ関数
 */

import { apiClient } from "@/utils/api/client";

export interface KyosoIdWalletRequest {
  walletAddress: string;
}

export interface KyosoIdWalletResponse {
  success: boolean;
}

export interface KyosoIdWalletError {
  error: string;
}

/**
 * 共創ID認証後に共創DAO側のAPIにウォレットアドレスを送信する
 * @param walletAddress ウォレットアドレス
 * @param firebaseIdToken Firebase ID token（共創ID認証で取得）
 * @returns API呼び出し結果
 */
export const syncWalletToKyosoId = async (
  walletAddress: string,
  firebaseIdToken: string
): Promise<KyosoIdWalletResponse> => {
  // ウォレットアドレスの検証
  if (!walletAddress || !walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
    throw new Error("無効なウォレットアドレスです");
  }

  const endpoint = "/api/nft-wallets";

  try {
    console.log("🚀 共創DAO API呼び出し開始:", endpoint);

    const response = (await apiClient.post(
      "kyosoDao",
      endpoint,
      {
        walletAddress,
      },
      {
        Authorization: `Bearer ${firebaseIdToken}`,
      }
    )) as KyosoIdWalletResponse;

    console.log("✅ 共創DAO ウォレット同期成功");

    return response;
  } catch (error) {
    console.error("❌ 共創DAO API呼び出しエラー:", error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("共創DAO APIの呼び出し中に予期しないエラーが発生しました");
  }
};
