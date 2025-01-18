// pages/api/member.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { Database, Tables } from "@/types/schema";
import { createClient } from "@supabase/supabase-js";
import { authMiddleware } from "@/utils/verifyJWT";

const serviveRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabase = createClient<Database>(supabaseUrl!, serviveRoleKey!);

async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case "POST": {
      // メンバー新規作成
      const {
        user_id,
        company_id,
        date_of_employment,
        is_admin,
        is_executive,
        token_id,
        invested_amount,
        is_minted,
        is_representative,
      }: Tables<"MEMBER"> = req.body;

      const { data, error } = await supabase
        .from("MEMBER")
        .upsert(
          {
            user_id,
            company_id,
            date_of_employment,
            is_admin,
            is_executive,
            token_id,
            invested_amount,
            is_minted,
            is_representative,
          },
          {
            onConflict: "user_id,company_id",
          }
        )
        .select();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(201).json({ data: data[0] });
    }

    case "PUT": {
      // メンバー更新
      const {
        user_id,
        company_id,
        date_of_employment,
        is_admin,
        is_executive,
        token_id,
        invested_amount,
        is_minted,
        is_representative,
      }: Tables<"MEMBER"> = req.body;

      if (!user_id || !company_id) {
        return res
          .status(400)
          .json({ error: "user_id and company_id are required" });
      }

      const { data, error } = await supabase
        .from("MEMBER")
        .update({
          company_id,
          date_of_employment,
          is_admin,
          is_executive,
          token_id,
          invested_amount,
          is_minted,
          is_representative,
        })
        .eq("user_id", user_id)
        .eq("company_id", company_id)
        .select();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(200).json({ data: data[0] });
    }

    case "DELETE": {
      // メンバー削除
      const { user_id, company_id } = req.query;

      if (!user_id || !company_id) {
        return res
          .status(400)
          .json({ error: "user_id and company_id are required" });
      }

      const { error } = await supabase
        .from("MEMBER")
        .delete()
        .eq("user_id", Array.isArray(user_id) ? user_id[0] : user_id)
        .eq(
          "company_id",
          Array.isArray(company_id) ? company_id[0] : company_id
        );

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res
        .status(200)
        .json({ message: "メンバーが正常に削除されました" });
    }

    default:
      return res.status(405).json({ error: "Method not allowed" });
  }
}
export default authMiddleware(handler);
