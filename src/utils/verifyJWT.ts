import { NextApiRequest, NextApiResponse, NextApiHandler } from "next";
import jwt from "jsonwebtoken";

// JWTシークレット（発行時と同じキーを使用）
const JWT_SECRET = process.env.JWT_SECRET || "FAKE_JWT_SECRET";

export interface AuthenticatedRequest extends NextApiRequest {
  user?: {
    address: string;
    // 必要に応じて他のカスタム情報
  }
}

export function authMiddleware(handler: NextApiHandler) {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    try {
      const cookieHeader = req.headers.cookie || "";
      const cookies = parseCookies(cookieHeader);
      const token = cookies["token"];
      if (!token) {
        return res.status(401).json({ error: "No token provided" });
      }

      const decoded = jwt.verify(token, JWT_SECRET) as { address: string; iat: number; exp: number; };
      // JWTが有効であればreq.userにユーザー情報を追加
      req.user = { address: decoded.address };

      // 元のハンドラーを呼び出す
      return handler(req, res);
    } catch (error) {
      console.error("JWT verification failed:", error);
      return res.status(401).json({ error: "Invalid token" });
    }
  };
}

// シンプルなCookieパーサー
function parseCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  cookieHeader.split(";").forEach(cookie => {
    const parts = cookie.trim().split("=");
    const key = parts.shift();
    if (key) {
      const value = parts.join("=");
      cookies[key] = value;
    }
  });
  return cookies;
}
