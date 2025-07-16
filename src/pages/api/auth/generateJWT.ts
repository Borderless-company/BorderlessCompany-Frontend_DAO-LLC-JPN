// pages/api/auth/verify.ts
import { createClient } from "@supabase/supabase-js";
import { serialize } from "cookie";
import { ethers } from "ethers";
import jwt from "jsonwebtoken";
import type { NextApiRequest, NextApiResponse } from "next";

// 環境変数からSupabaseクライアントの初期化
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

const contractABI = [
  {
    constant: true,
    inputs: [
      {
        name: "_hash",
        type: "bytes32",
      },
      {
        name: "_signature",
        type: "bytes",
      },
    ],
    name: "isValidSignature",
    outputs: [
      {
        name: "",
        type: "bytes4",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
];

// JWTシークレット（必須）
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required for security");
}
// TypeScript用の型アサーション
const jwtSecret: string = JWT_SECRET;

// JWT有効期限設定（環境変数で設定可能）
const getJWTExpiry = () => {
  const customExpiry = process.env.JWT_EXPIRY_HOURS;
  const isProduction = process.env.NODE_ENV === "production";

  // 環境変数が設定されている場合はそれを使用
  if (customExpiry) {
    const hours = parseInt(customExpiry, 10);
    if (!isNaN(hours) && hours > 0 && hours <= 168) {
      // 最大7日間
      return hours;
    }
  }

  // デフォルト値: 本番環境では8時間、開発環境では24時間
  return isProduction ? 8 : 24;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { address, signature, nonce, message } = req.body as {
    address?: string;
    signature?: string;
    nonce?: string;
    message?: string;
  };

  if (!address || !signature || !nonce || !message) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  const nonceNumber = parseInt(nonce, 10);
  if (isNaN(nonceNumber)) {
    return res.status(400).json({ error: "Invalid nonce" });
  }

  // Supabaseからnonceを取得
  const { data: nonceData, error: nonceError } = await supabase
    .from("NONCE")
    .select("*")
    .eq("evmAddress", address)
    .single();

  console.log("nonceData", nonceData);
  if (nonceError || !nonceData) {
    return res.status(401).json({ error: "Nonce not found for this address" });
  }

  const expectedNonce = nonceData.nonce;
  console.log("expectedNonce", expectedNonce);
  console.log("nonceNumber", nonceNumber);
  if (expectedNonce === undefined || expectedNonce !== nonceNumber) {
    return res.status(401).json({ error: "Invalid nonce or address" });
  }

  // SIWEメッセージの検証
  try {
    // メッセージの解析とバリデーション
    const siweMessageLines = message.split("\n");

    // 基本的な検証 - アドレスの確認
    const messageDomain = siweMessageLines[0].split(
      " wants you to sign in with your Ethereum account:"
    )[0];
    const messageAddress = siweMessageLines[1].trim();

    if (messageAddress.toLowerCase() !== address.toLowerCase()) {
      return res
        .status(401)
        .json({ error: "Message address does not match signing address" });
    }

    // ナンスの確認 - メッセージ内のナンスが正しいことを確認
    const nonceMatch = message.match(/Nonce: (\d+)/);
    if (!nonceMatch || parseInt(nonceMatch[1], 10) !== nonceNumber) {
      return res
        .status(401)
        .json({ error: "Message nonce does not match expected nonce" });
    }

    // EIP-1271を使用して署名検証
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const contract = new ethers.Contract(address, contractABI, provider);

    const messageHash = ethers.hashMessage(message);
    const hashBytes = ethers.getBytes(messageHash);
    const magicNumber = await contract.isValidSignature(hashBytes, signature);

    if (magicNumber !== "0x1626ba7e") {
      return res.status(401).json({ error: "Signature verification failed" });
    }

    // nonceをインクリメント
    const { error: updateError } = await supabase
      .from("NONCE")
      .update({ nonce: nonceNumber + 1 })
      .eq("evmAddress", address);

    if (updateError) {
      console.error(updateError);
      return res.status(500).json({ error: "Failed to update nonce" });
    }

    // JWTとCookieの有効期限を統一（セキュリティ強化）
    const TOKEN_EXPIRY_HOURS = getJWTExpiry();
    const TOKEN_EXPIRY_SECONDS = TOKEN_EXPIRY_HOURS * 60 * 60;

    const token = jwt.sign({ address: address }, jwtSecret, {
      expiresIn: `${TOKEN_EXPIRY_HOURS}h`,
    });

    // セキュアなCookie設定
    const isProduction = process.env.NODE_ENV === "production";
    const cookie = serialize("token", token, {
      httpOnly: true, // XSS攻撃を防ぐ
      secure: isProduction, // 本番環境ではHTTPS必須
      path: "/", // アプリ全体でアクセス可能
      maxAge: TOKEN_EXPIRY_SECONDS, // JWTと同じ有効期限
      sameSite: isProduction ? "none" : "lax", // CSRF攻撃を防ぐ
    });

    // セキュリティヘッダーの設定
    res.setHeader("Set-Cookie", cookie);
    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
