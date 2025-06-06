// pages/api/payment.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { Database, Enums } from "@/types/schema";
import { createClient } from "@supabase/supabase-js";
import { authMiddleware, AuthenticatedRequest } from "@/utils/verifyJWT";

const serviveRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabase = createClient<Database>(supabaseUrl!, serviveRoleKey!);

async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  const userAddress = req.user?.address;
  
  if (!userAddress) {
    return res.status(401).json({ error: "認証が必要です" });
  }
  switch (req.method) {
    case "POST": {
      // Create(Upsert) Payment - 認証されたユーザーのaddressと一致するuser_idのみ操作可能
      const { id, estuary_id, payment_link, payment_status, price } = req.body;

      // user_idは認証されたユーザーのaddressに固定
      const user_id = userAddress;

      const { data, error } = await supabase
        .from("PAYMENT")
        .upsert(
          {
            id,
            estuary_id,
            payment_status: payment_status as Enums<"PaymentStatus">,
            price,
            user_id,
          },
          {
            onConflict: "estuary_id,user_id",
          }
        )
        .select();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(201).json({ data: data[0] });
    }

    case "PUT": {
      // Update Payment - 認証されたユーザーのaddressと一致するuser_idの行のみ更新可能
      const { estuary_id, payment_status, price } = req.body;

      const { data, error } = await supabase
        .from("PAYMENT")
        .update({
          estuary_id,
          payment_status: payment_status as Enums<"PaymentStatus">,
          price,
        })
        .eq("user_id", userAddress) // 認証されたユーザーのaddressと一致する行のみ更新
        .select();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      if (!data || data.length === 0) {
        return res.status(404).json({ error: "更新対象のペイメントが見つかりません" });
      }

      return res.status(200).json({ data: data[0] });
    }

    case "GET": {
      // Get Payment - 認証されたユーザーのaddressと一致するuser_idの行のみ取得可能
      const { estuary_id } = req.query;

      let query = supabase
        .from("PAYMENT")
        .select("*")
        .eq("user_id", userAddress); // 認証されたユーザーのaddressと一致する行のみ取得

      if (estuary_id && typeof estuary_id === "string") {
        query = query.eq("estuary_id", estuary_id);
      }

      const { data, error } = await query;

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(200).json({ data });
    }

    case "DELETE": {
      // Delete Payment - 認証されたユーザーのaddressと一致するuser_idの行のみ削除可能
      const { estuary_id } = req.body;

      if (!estuary_id) {
        return res.status(400).json({ error: "estuary_id is required" });
      }

      const { data, error } = await supabase
        .from("PAYMENT")
        .delete()
        .eq("user_id", userAddress) // 認証されたユーザーのaddressと一致する行のみ削除
        .eq("estuary_id", estuary_id)
        .select();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      if (!data || data.length === 0) {
        return res.status(404).json({ error: "削除対象のペイメントが見つかりません" });
      }

      return res.status(200).json({ data: data[0] });
    }

    default:
      return res.status(405).json({ error: "Method not allowed" });
  }
}

export default authMiddleware(handler);
