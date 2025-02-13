// pages/api/auth/verify.ts
import { createClient } from "@supabase/supabase-js";
import { serialize } from "cookie";
import { ethers } from "ethers";
import jwt from "jsonwebtoken";
import type { NextApiRequest, NextApiResponse } from "next";
import { ADMIN_CONTRACT_ACCOUNT } from "@/constants";
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

// JWTシークレット（なければデフォルト値）
const JWT_SECRET = process.env.JWT_SECRET || "";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { address, signature, nonce } = req.body as {
    address?: string;
    signature?: string;
    nonce?: string;
  };

  if (!address || !signature || !nonce) {
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

  const message = nonceNumber.toString();
  console.log("message", message);
  console.log("signature", signature);
  console.log("address", address);
  try {
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const contract = new ethers.Contract(ADMIN_CONTRACT_ACCOUNT, contractABI, provider);

    const messageHash = ethers.hashMessage(message);
    const hashBytes = ethers.getBytes(messageHash);
    const magicNumber = await contract.isValidSignature(hashBytes, signature);

    if (magicNumber !== "0x1626ba7e") {
      return res.status(401).json({ error: "Signature verification failed" });
    }

    const { error: updateError } = await supabase
      .from("NONCE")
      .update({ nonce: nonceNumber + 1 })
      .eq("evmAddress", address);

    if (updateError) {
      console.error(updateError);
      return res.status(500).json({ error: "Failed to update nonce" });
    }

    const token = jwt.sign({ address: address.toLowerCase() }, JWT_SECRET, {
      expiresIn: "24h",
    });

    const cookie = serialize("token", token, {
      httpOnly: true,
      secure: false,
      path: "/",
      maxAge: 60 * 60 * 24 * 10,
      sameSite: "strict",
    });

    res.setHeader("Set-Cookie", cookie);
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
