// src/utils/api/client.ts
import axios, { AxiosError } from "axios";
import { HttpMethod } from "@/types/api-proxy";

export async function callExternalApi(
  service: string,
  endpoint: string,
  method: HttpMethod = "GET",
  body: unknown = null,
  headers: Record<string, string> = {}
): Promise<unknown> {
  try {
    const response = await axios({
      method: "POST",
      url: `/api/proxy/${service}`,
      data: {
        endpoint,
        method,
        body,
        headers,
      },
    });

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      if (error.response?.status === 400) {
        throw new Error(`Invalid request: ${error.response.data.error}`);
      }
    }

    console.error(`Error calling ${service} API:`, error);
    throw error;
  }
}

// 型安全なAPI呼び出し関数
export const apiClient = {
  get: (service: string, endpoint: string, headers?: Record<string, string>) =>
    callExternalApi(service, endpoint, "GET", null, headers),

  post: (
    service: string,
    endpoint: string,
    body: unknown,
    headers?: Record<string, string>
  ) => callExternalApi(service, endpoint, "POST", body, headers),

  put: (
    service: string,
    endpoint: string,
    body: unknown,
    headers?: Record<string, string>
  ) => callExternalApi(service, endpoint, "PUT", body, headers),

  delete: (
    service: string,
    endpoint: string,
    headers?: Record<string, string>
  ) => callExternalApi(service, endpoint, "DELETE", null, headers),

  patch: (
    service: string,
    endpoint: string,
    body: unknown,
    headers?: Record<string, string>
  ) => callExternalApi(service, endpoint, "PATCH", body, headers),
};
