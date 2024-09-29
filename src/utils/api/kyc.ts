import axios, {
  InternalAxiosRequestConfig,
  AxiosInstance,
  AxiosRequestConfig,
} from "axios";
import crypto, { BinaryLike } from "crypto";
import FormData from "form-data";

// These parameters should be used for all requests
const SUMSUB_APP_TOKEN = process.env.NEXT_PUBLIC_SUMSUB_APP_TOKEN;
const SUMSUB_SECRET_KEY = process.env.NEXT_PUBLIC_SUMSUB_SECRET_KEY;
const SUMSUB_BASE_URL = "https://api.sumsub.com";

// Configure axios
export const sumsubApi: AxiosInstance = axios.create({
  baseURL: SUMSUB_BASE_URL,
});

// Axios request interceptor
sumsubApi.interceptors.request.use(createSignature, (error) =>
  Promise.reject(error)
);

// Create signature function
function createSignature(
  config: InternalAxiosRequestConfig
): InternalAxiosRequestConfig {
  const ts = Math.floor(Date.now() / 1000);
  const signature = crypto.createHmac(
    "sha256",
    SUMSUB_SECRET_KEY as BinaryLike
  );
  // console.log("🍅🍅🍅Config: ", config);
  // console.log(
  //   "🍅🍅🍅original text: ",
  //   ts + (config.method?.toUpperCase() || "") + (config.url || "")
  // );

  let url =
    config.url +
    "?" +
    "userId=" +
    encodeURIComponent(config.params.userId) +
    "&levelName=" +
    encodeURIComponent(config.params.levelName);

  if (config.params.externalActionId) {
    url +=
      "&externalActionId=" + encodeURIComponent(config.params.externalActionId);
  }
  if (config.params.ttlInSecs) {
    url += "&ttlInSecs=" + encodeURIComponent(config.params.ttlInSecs);
  }

  signature.update(ts + (config.method?.toUpperCase() || "") + url);

  if (config.data instanceof FormData) {
    signature.update(config.data.getBuffer());
  } else if (config.data) {
    signature.update(config.data);
  }

  config.headers["X-App-Access-Ts"] = ts;
  config.headers["X-App-Access-Sig"] = signature.digest("hex");

  return config;
}

// Create applicant function
export type GenerateAccessTokenRequest = {
  userId: string;
  levelName: string;
  externalActionId?: string;
  ttlInSecs?: number;
};
export type GenerateAccessTokenResponse = {
  accessToken: string;
  userId: string;
};

export async function generateAccessToken(
  req: GenerateAccessTokenRequest
): Promise<GenerateAccessTokenResponse> {
  console.log("req: ", req);
  const url = "/resources/accessTokens";
  const config: AxiosRequestConfig = {
    method: "POST",
    url,
    params: {
      userId: encodeURIComponent(req.userId),
      levelName: encodeURIComponent(req.levelName),
      externalActionId:
        req.externalActionId && encodeURIComponent(req?.externalActionId),
      ttlInSecs: req.ttlInSecs,
    },
    headers: {
      "X-App-Token": SUMSUB_APP_TOKEN,
      Accept: "application/json",
    },
  };

  try {
    const response = await sumsubApi(config);
    return response.data;
  } catch (error) {
    console.error("Error generating access token:", error);
    throw error;
  }
}
