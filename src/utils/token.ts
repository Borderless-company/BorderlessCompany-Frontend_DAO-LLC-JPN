import type { NFTMetadata } from "@/pages/api/token/metadata";

interface UploadMetadataResponse {
  success: boolean;
  url: string;
}

interface UploadMetadataError {
  error: string;
}

/**
 * NFTメタデータをアップロードする関数
 * @param tokenId - トークンID
 * @param tokenUUID - トークンのUUID
 * @param metadata - NFTメタデータ
 * @returns アップロードされたメタデータの公開URL
 * @throws エラーメッセージを含むError
 */
export const uploadTokenMetadata = async (
  tokenId: string,
  tokenUUID: string,
  metadata: NFTMetadata
): Promise<string> => {
  const response = await fetch("/api/token/metadata", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tokenId,
      tokenUUID,
      metadata,
    }),
  });

  const data = (await response.json()) as
    | UploadMetadataResponse
    | UploadMetadataError;

  if (!response.ok || "error" in data) {
    throw new Error(
      "error" in data ? data.error : "メタデータのアップロードに失敗しました"
    );
  }

  return data.url;
};

/**
 * NFTメタデータを作成するヘルパー関数
 * @param name - NFTの名前
 * @param description - NFTの説明
 * @param image - NFTの画像URL
 * @param externalUrl - 外部リンク（オプション）
 */
export const createNFTMetadata = (
  name: string,
  description: string,
  image: string,
  externalUrl?: string
): NFTMetadata => {
  return {
    name,
    description,
    image,
    ...(externalUrl ? { external_url: externalUrl } : {}),
  };
};
