import { NextApiRequest, NextApiResponse, NextApiHandler } from "next";
import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "";

export interface AuthenticatedRequest extends NextApiRequest {
  user?: {
    address: string;
  };
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

      try {
        const decoded = jwt.verify(token, JWT_SECRET) as {
          address: string;
          iat: number;
          exp: number;
        };
        console.log("decoded: ", decoded);
        req.user = { address: decoded.address };
      } catch (e) {
        req.user = { address: "" };
      }

      return handler(req, res);
    } catch (error) {
      console.error("JWT verification failed:", error);
      return res.status(401).json({ error: "Invalid token" });
    }
  };
}

function parseCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  console.log("cookieHeader: ", cookieHeader);
  cookieHeader.split(";").forEach((cookie) => {
    const parts = cookie.trim().split("=");
    const key = parts.shift();
    if (key) {
      const value = parts.join("=");
      cookies[key] = value;
    }
  });

  return cookies;
}
