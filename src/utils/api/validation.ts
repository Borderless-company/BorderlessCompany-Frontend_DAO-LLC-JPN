// src/utils/api/validation.ts
import { ProxyRequest, HttpMethod } from "@/types/api-proxy";

export function validateProxyRequest(request: ProxyRequest): void {
  // エンドポイントの検証
  if (!request.endpoint || typeof request.endpoint !== "string") {
    throw new Error("Endpoint is required and must be a string");
  }

  if (!request.endpoint.startsWith("/")) {
    throw new Error('Endpoint must start with "/"');
  }

  // メソッドの検証
  if (!request.method || !isValidHttpMethod(request.method)) {
    throw new Error(
      "Invalid HTTP method. Must be one of: GET, POST, PUT, DELETE, PATCH"
    );
  }

  // ヘッダーの検証
  if (request.headers && typeof request.headers !== "object") {
    throw new Error("Headers must be an object");
  }

  // 危険なヘッダーの除外
  const dangerousHeaders = ["authorization", "cookie", "host"];
  if (request.headers) {
    for (const header of dangerousHeaders) {
      if (request.headers[header.toLowerCase()]) {
        throw new Error(`Dangerous header "${header}" is not allowed`);
      }
    }
  }
}

function isValidHttpMethod(method: string): method is HttpMethod {
  return ["GET", "POST", "PUT", "DELETE", "PATCH"].includes(method);
}
