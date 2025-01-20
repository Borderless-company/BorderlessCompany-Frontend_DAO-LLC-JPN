import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export type NFTMetadata = {
  name: string;
  description: string;
  image: string;
  external_url?: string;
  // attributes: {
  //   trait_type: string;
  //   value: string | number;
  // }[];
  // properties?: {
  //   files?: {
  //     uri: string;
  //     type: string;
  //   }[];
  //   category?: string;
  // };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { tokenId, tokenUUID, metadata } = req.body as {
      tokenId: string;
      tokenUUID: string;
      metadata: NFTMetadata;
    };

    if (!tokenId || !tokenUUID || !metadata) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const filePath = `${tokenUUID}/${tokenId}.json`;

    // 既存ファイルの確認
    const { data: existingFiles } = await supabase.storage
      .from("token-metadata")
      .list(tokenUUID, {
        search: `${tokenId}.json`,
      });

    if (existingFiles && existingFiles.length > 0) {
      // ファイルが既に存在する場合の処理
      console.log("File already exists, updating...");
    }

    const { error } = await supabase.storage
      .from("token-metadata")
      .upload(filePath, JSON.stringify(metadata, null, 2), {
        contentType: "application/json",
        upsert: true,
      });

    if (error) {
      console.error("Storage upload error:", error);
      return res.status(500).json({ error: "Failed to upload metadata" });
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("token-metadata").getPublicUrl(filePath);

    return res.status(200).json({
      success: true,
      url: publicUrl,
    });
  } catch (error) {
    console.error("API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
