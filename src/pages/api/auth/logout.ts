import type { NextApiRequest, NextApiResponse } from "next";
import { serialize } from "cookie";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // クッキーを無効化するために、複数の方法でクッキーを削除
  const cookies = [
    serialize("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0,
      expires: new Date(0),
      sameSite: "none",
    }),
    serialize("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: -1,
      sameSite: "none",
    }),
    serialize("token", "", {
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    }),
  ];

  // セキュリティヘッダーの設定
  res.setHeader("Set-Cookie", cookies);
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  return res.status(200).json({ success: true });
}
