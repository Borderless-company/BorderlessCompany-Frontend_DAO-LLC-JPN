import { Database } from "@/types/schema";
import { bypassAuthForGet } from "@/utils/bypassAuthForGet";
import { createClient } from "@supabase/supabase-js";
import type { NextApiRequest, NextApiResponse } from "next";

const serviveRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabase = createClient<Database>(supabaseUrl!, serviveRoleKey!);

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { company_id } = req.query;

  if (!company_id || Array.isArray(company_id)) {
    return res.status(400).json({ error: "有効な会社IDを指定してください" });
  }

  console.log("company_id", company_id);

  switch (req.method) {
    case "GET": {
      // 特定の会社のガバナンス合意をすべて取得
      const { data, error } = await supabase
        .from("GOVERNANCE_AGREEMENT")
        .select("*")
        .eq("company_id", company_id)
        .single();

      if (error) {
        return res.status(400).json({ error: error.message });
      }
      console.log("data", data);

      return res.status(200).json({ data });
    }

    default:
      return res.status(405).json({ error: "Method not allowed" });
  }
}

// GET操作はパブリックにアクセス可能
export default bypassAuthForGet(handler);
