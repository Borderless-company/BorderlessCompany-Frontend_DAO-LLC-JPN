// Pimentの決済完了通知用 Webhook API

import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    // APIキーの検証
    const apiKey = req.headers["x-api-key"] as string;
    const validApiKey = process.env.PIEMENT_WEBHOOK_API_KEY;

    if (!validApiKey) {
      console.error("WEBHOOK_API_KEY environment variable is not set");
      res.status(500).json({
        error: "Server configuration error",
      });
      return;
    }

    if (!apiKey) {
      console.log("API key missing in request headers");
      res.status(401).json({
        error: "API key is required. Please include X-API-Key header.",
      });
      return;
    }

    if (apiKey !== validApiKey) {
      console.log("Invalid API key provided:", apiKey);
      res.status(403).json({
        error: "Invalid API key",
      });
      return;
    }

    // APIキー認証成功 - POSTで送信されたJSONをconsole.logで出力
    console.log("✅ Authenticated webhook request received:", {
      timestamp: new Date().toISOString(),
      headers: {
        "user-agent": req.headers["user-agent"],
        "content-type": req.headers["content-type"],
      },
      body: req.body,
    });

    // 成功レスポンスを返す
    res.status(200).json({
      success: true,
      message: "Webhook processed successfully",
      timestamp: new Date().toISOString(),
    });
  } else {
    // POST以外のメソッドの場合は405エラーを返す
    res.setHeader("Allow", ["POST"]);
    res.status(405).json({
      error: `Method ${req.method} Not Allowed. Only POST requests are accepted.`,
    });
  }
}
