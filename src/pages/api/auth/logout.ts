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
    sameSite: "strict",
  });

  res.setHeader("Set-Cookie", cookie);
  return res.status(200).json({ success: true });
}
