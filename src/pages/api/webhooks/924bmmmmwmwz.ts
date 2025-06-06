// Pimentの決済完了通知用 Webhook API

import { NextApiRequest, NextApiResponse } from "next";

import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/schema";

interface WebhookPayload {
  tokenId: number;
  chainId: number;
  walletAddress: string;
  txHash: string;
}
const serviveRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabase = createClient<Database>(supabaseUrl!, serviveRoleKey!);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
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

    try {
      const payload: WebhookPayload = req.body;
      const { walletAddress } = payload;

      console.log("✅ Authenticated webhook request received:", {
        timestamp: new Date().toISOString(),
        payload,
      });

      // 1. walletAddressからpending状態のpaymentを取得
      const { data: payments, error: paymentError } = await supabase
        .from("PAYMENT")
        .select("*, ESTUARY(*)")
        .eq("user_id", walletAddress)
        .eq("payment_status", "pending");

      if (paymentError) {
        console.error("Payment query error:", paymentError);
        throw new Error("Failed to fetch payment data");
      }

      if (!payments || payments.length === 0) {
        console.error("No pending payment found for wallet:", walletAddress);
        res.status(404).json({
          error: "No pending payment found for this wallet address",
        });
        return;
      }

      const payment = payments[0];
      const estuary = payment.ESTUARY;

      // 2. paymentをdoneに更新
      const { error: updateError } = await supabase
        .from("PAYMENT")
        .update({ payment_status: "done" })
        .eq("id", payment.id);

      if (updateError) {
        console.error("Payment update error:", updateError);
        throw new Error("Failed to update payment status");
      }

      // 3. estuaryからcompany情報を取得してmemberを作成
      if (estuary && estuary.company_id && estuary.token_id) {
        // すでにmemberが存在するかチェック
        const { data: existingMember } = await supabase
          .from("MEMBER")
          .select("id")
          .eq("user_id", walletAddress)
          .eq("company_id", estuary.company_id)
          .single();

        if (!existingMember) {
          // memberを作成
          const { error: memberError } = await supabase.from("MEMBER").insert({
            user_id: walletAddress,
            company_id: estuary.company_id,
            token_id: estuary.token_id,
            invested_amount: payment.price,
            is_minted: false,
            is_executive: false,
            is_admin: false,
            is_representative: false,
            is_initial_member: false,
          });

          if (memberError) {
            console.error("Member creation error:", memberError);
            throw new Error("Failed to create member");
          }

          console.log(
            "✅ Member created successfully for wallet:",
            walletAddress
          );
        } else {
          console.log("Member already exists for wallet:", walletAddress);
        }
      }

      console.log("✅ Webhook processed successfully");

      res.status(200).json({
        success: true,
        message: "Payment processed and member created successfully",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Webhook processing error:", error);
      res.status(500).json({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  } else {
    // POST以外のメソッドの場合は405エラーを返す
    res.setHeader("Allow", ["POST"]);
    res.status(405).json({
      error: `Method ${req.method} Not Allowed. Only POST requests are accepted.`,
    });
  }
}
