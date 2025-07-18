// src/types/api-proxy.ts
export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export interface ProxyRequest {
  endpoint: string;
  method: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
}

export interface ProxyResponse {
  status: number;
  data: unknown;
}

export interface ServiceConfig {
  baseUrl: string;
  apiKey: string;
  apiKeyHeader: string;
  timeout?: number;
}

export interface ApiLog {
  id: string;
  timestamp: string;
  service: string;
  url: string;
  method: HttpMethod;
  userAddress?: string;
  requestBody?: unknown;
  status?: number;
  responseBody?: unknown;
  error?: unknown;
}
