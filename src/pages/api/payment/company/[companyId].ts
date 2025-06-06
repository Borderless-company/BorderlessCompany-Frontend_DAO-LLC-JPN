import type { NextApiRequest, NextApiResponse } from "next";
import { Database } from "@/types/schema";
import { createClient } from "@supabase/supabase-js";
import { authMiddleware, AuthenticatedRequest } from "@/utils/verifyJWT";

const serviveRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabase = createClient<Database>(supabaseUrl!, serviveRoleKey!);

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const userAddress = req.user?.address;

  if (!userAddress) {
    return res.status(401).json({ error: "認証が必要です" });
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { companyId } = req.query;

  if (!companyId || typeof companyId !== "string") {
    return res.status(400).json({ error: "companyId is required" });
  }

  try {
    // companyIdに紐づいたEstuary経由でPaymentを取得
    const { data, error } = await supabase
      .from("PAYMENT")
      .select(
        `
        *,
        estuary:ESTUARY(
          *,
          company:COMPANY(*)
        )
      `
      )
      .eq("estuary.company_id", companyId);

    if (error) {
      console.error("[ERROR] Payment取得エラー:", error);
      return res.status(500).json({ error: "Paymentの取得に失敗しました" });
    }

    return res.status(200).json({ data: data || [] });
  } catch (error) {
    console.error("[ERROR] API処理エラー:", error);
    return res.status(500).json({ error: "内部サーバーエラーが発生しました" });
  }
}

export default authMiddleware(handler);
