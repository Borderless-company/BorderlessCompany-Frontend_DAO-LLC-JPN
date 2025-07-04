import { NextApiRequest, NextApiResponse, NextApiHandler } from "next";
import jwt from "jsonwebtoken";
import { AuthenticatedRequest, authMiddleware } from "./verifyJWT";

export function bypassAuthForGet(handler: NextApiHandler) {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    // GETリクエストの場合は認証をバイパス
    if (req.method === "GET") {
      return handler(req, res);
    }

    // GET以外のリクエストは通常の認証を適用
    return authMiddleware(handler)(req, res);
  };
}
