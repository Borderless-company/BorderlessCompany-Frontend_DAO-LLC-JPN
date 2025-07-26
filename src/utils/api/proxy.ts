// src/utils/api/proxy.ts
import axios, { AxiosRequestConfig, Method } from "axios";
import { logApiRequest, logApiResponse, logApiError } from "@/utils/logging";
import { ServiceConfig, ProxyResponse } from "@/types/api-proxy";

const serviceConfigs: Record<string, ServiceConfig> = {
  kyosoDao: {
    baseUrl: process.env.KYOSO_API_BASE_URL || "",
    apiKey: process.env.KYOSO_API_KEY || "",
    apiKeyHeader: "X-API-Key",
    timeout: 10000, // 10秒
  },
};

export async function proxyRequest(
  service: string,
  endpoint: string,
  method: string,
  body: unknown,
  clientHeaders: Record<string, string> = {},
  user?: { address: string }
): Promise<ProxyResponse> {
  // サービス設定の取得
  const config = serviceConfigs[service];
  if (!config) {
    throw new Error(`Unknown service: ${service}`);
  }

  // リクエストの構築
  const url = `${config.baseUrl}${endpoint}`;
  const headers: Record<string, string> = {
    ...clientHeaders,
    [config.apiKeyHeader]: config.apiKey,
  };

  // リクエストのログ記録
  const requestId = logApiRequest(service, url, method, body, user?.address);

  try {
    // APIリクエストの実行
    const axiosConfig: AxiosRequestConfig = {
      method: method as Method,
      url,
      headers,
      data: body,
      timeout: config.timeout || 10000,
    };

    const response = await axios(axiosConfig);

    // レスポンスのログ記録
    logApiResponse(requestId, response.status, response.data);

    return {
      status: response.status,
      data: response.data,
    };
  } catch (error) {
    // エラーのログ記録
    logApiError(requestId, error);
    throw error;
  }
}
