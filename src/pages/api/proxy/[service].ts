// src/pages/api/proxy/[service].ts
import { NextApiRequest, NextApiResponse } from "next";
import { AuthenticatedRequest, authMiddleware } from "@/utils/verifyJWT";
import { proxyRequest } from "@/utils/api/proxy";
import { validateProxyRequest } from "@/utils/api/validation";

const handler = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { service } = req.query;
  const { endpoint, method, body, headers } = req.body;

  try {
    // リクエストの検証
    validateProxyRequest({ endpoint, method, body, headers });

    // プロキシリクエストの実行
    const response = await proxyRequest(
      service as string,
      endpoint as string,
      method as string,
      body,
      headers,
      req.user
    );

    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error(`Proxy error for ${service}:`, error);

    if (error instanceof Error) {
      if (error.message.includes("validation")) {
        return res.status(400).json({ error: error.message });
      }
    }

    return res.status(500).json({ error: "External API request failed" });
  }
};

export default authMiddleware(handler);
