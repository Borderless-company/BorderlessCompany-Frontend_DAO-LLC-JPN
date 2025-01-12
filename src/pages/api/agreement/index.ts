import { Database } from "@/types/schema";
import { authMiddleware } from "@/utils/verifyJWT";
import { createClient } from "@supabase/supabase-js";
import type { NextApiRequest, NextApiResponse } from "next";

const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabase = createClient<Database>(supabaseUrl!, serviceRoleKey!);

async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case "POST": {
      const { user_id, type, privacy_policy, terms_of_use, agreed_at } =
        req.body;

      if (!user_id) {
        return res.status(400).json({ error: "user_id is required" });
      }

      const { data, error } = await supabase
        .from("AGREEMENT")
        .insert({
          user_id,
          type,
          privacy_policy,
          terms_of_use,
          agreed_at: agreed_at || new Date().toISOString(),
        })
        .select();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(201).json({ data: data[0] });
    }

    case "GET": {
      const { user_id } = req.query;

      if (!user_id) {
        return res.status(400).json({ error: "user_id is required" });
      }

      const { data, error } = await supabase
        .from("AGREEMENT")
        .select()
        .eq("user_id", user_id);

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(200).json({ data });
    }

    default:
      return res.status(405).json({ error: "Method not allowed" });
  }
}

export default authMiddleware(handler);
