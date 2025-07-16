import type { NextApiRequest, NextApiResponse } from "next";
import { serialize } from "cookie";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // クッキーを無効化するために、空の値と過去の有効期限を設定
  const cookie = serialize("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: -1,
    sameSite: "none",
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
}
