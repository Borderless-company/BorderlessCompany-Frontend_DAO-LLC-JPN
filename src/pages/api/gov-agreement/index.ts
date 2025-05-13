import { Database } from "@/types/schema";
import { bypassAuthForGet } from "@/utils/bypassAuthForGet";
import { createClient } from "@supabase/supabase-js";
import type { NextApiRequest, NextApiResponse } from "next";

const serviveRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabase = createClient<Database>(supabaseUrl!, serviveRoleKey!);

async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case "GET": {
      // ガバナンス合意をすべて取得
      const { data, error } = await supabase
        .from("GOVERNANCE_AGREEMENT")
        .select("*");

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(200).json({ data });
    }

    case "POST": {
      const body = req.body;

      if (!body) {
        return res.status(400).json({ error: "リクエストボディが必要です" });
      }

      // 新しいガバナンス合意を作成
      const { data, error } = await supabase
        .from("GOVERNANCE_AGREEMENT")
        .insert(body)
        .select()
        .single();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(201).json({ data });
    }

    default:
      return res.status(405).json({ error: "Method not allowed" });
  }
}

// GET操作はパブリックにアクセス可能
export default bypassAuthForGet(handler);
