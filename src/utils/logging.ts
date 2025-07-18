// src/utils/logging.ts
import { v4 as uuidv4 } from "uuid";
import { ApiLog } from "@/types/api-proxy";

const apiLogs: ApiLog[] = [];

export function logApiRequest(
  service: string,
  url: string,
  method: string,
  requestBody: unknown,
  userAddress?: string
): string {
  const id = uuidv4();
  const log: ApiLog = {
    id,
    timestamp: new Date().toISOString(),
    service,
    url,
    method: method as any,
    userAddress,
    requestBody,
  };

  apiLogs.push(log);
  console.log(`API Request [${id}]:`, service, url, method);

  return id;
}

export function logApiResponse(
  id: string,
  status: number,
  responseBody: unknown
): void {
  const logIndex = apiLogs.findIndex((log) => log.id === id);
  if (logIndex !== -1) {
    apiLogs[logIndex].status = status;
    apiLogs[logIndex].responseBody = responseBody;
    console.log(`API Response [${id}]:`, status);
  }
}

export function logApiError(id: string, error: unknown): void {
  const logIndex = apiLogs.findIndex((log) => log.id === id);
  if (logIndex !== -1) {
    apiLogs[logIndex].error = error;
    console.error(`API Error [${id}]:`, error);
  }
}
