import { Database } from "@/types/schema";
import { bypassAuthForGet } from "@/utils/bypassAuthForGet";
import { createClient } from "@supabase/supabase-js";
import type { NextApiRequest, NextApiResponse } from "next";

const serviveRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabase = createClient<Database>(supabaseUrl!, serviveRoleKey!);

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: "有効なIDを指定してください" });
  }

  switch (req.method) {
    case "GET": {
      // 特定のガバナンス合意を取得
      const { data, error } = await supabase
        .from("GOVERNANCE_AGREEMENT")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      if (!data) {
        return res
          .status(404)
          .json({ error: "ガバナンス合意が見つかりません" });
      }

      return res.status(200).json({ data });
    }

    case "PUT": {
      const body = req.body;

      if (!body) {
        return res.status(400).json({ error: "リクエストボディが必要です" });
      }

      // ガバナンス合意を更新
      const { data, error } = await supabase
        .from("GOVERNANCE_AGREEMENT")
        .update(body)
        .eq("id", id)
        .select();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      if (!data || data.length === 0) {
        return res
          .status(404)
          .json({ error: "ガバナンス合意が見つかりません" });
      }

      return res.status(200).json({ data });
    }

    case "DELETE": {
      // ガバナンス合意を削除
      const { error } = await supabase
        .from("GOVERNANCE_AGREEMENT")
        .delete()
        .eq("id", id);

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res
        .status(200)
        .json({ data: { message: "ガバナンス合意が正常に削除されました" } });
    }

    default:
      return res.status(405).json({ error: "Method not allowed" });
  }
}

// GET操作はパブリックにアクセス可能
export default bypassAuthForGet(handler);
