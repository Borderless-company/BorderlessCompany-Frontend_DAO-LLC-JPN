/**
 * 共創ID - ウォレット連携API関連のユーティリティ関数
 */

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
  const apiKey = process.env.NEXT_PUBLIC_KYOSO_API_KEY;
  const apiUrl =
    process.env.NEXT_PUBLIC_KYOSO_API_URL ||
    process.env.NEXT_PUBLIC_KYOSO_API_BASE_URL;

  if (!apiKey) {
    throw new Error("共創DAO APIキーが設定されていません");
  }

  if (!apiUrl) {
    throw new Error("共創DAO API URLが設定されていません");
  }

  // ウォレットアドレスの検証
  if (!walletAddress || !walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
    throw new Error("無効なウォレットアドレスです");
  }

  const endpoint = `${apiUrl}/api/nft-wallets`;

  try {
    console.log("🚀 共創DAO API呼び出し開始:", endpoint);

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
        Authorization: `Bearer ${firebaseIdToken}`,
      },
      body: JSON.stringify({
        walletAddress,
      }),
    });

    console.log(
      "📡 共創DAO APIレスポンス:",
      response.status,
      response.statusText
    );

    if (response.status === 429) {
      // レート制限の場合
      const errorData = (await response.json()) as KyosoIdWalletError;
      throw new Error(`レート制限に達しました: ${errorData.error}`);
    }

    if (!response.ok) {
      const errorData = (await response.json()) as KyosoIdWalletError;
      throw new Error(
        `共創DAO API呼び出しが失敗しました (${response.status}): ${errorData.error}`
      );
    }

    const data = (await response.json()) as KyosoIdWalletResponse;

    console.log("✅ 共創DAO ウォレット同期成功");

    return data;
  } catch (error) {
    console.error("❌ 共創DAO API呼び出しエラー:", error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("共創DAO APIの呼び出し中に予期しないエラーが発生しました");
  }
};
