import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/schema";

const serviveRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabase = createClient<Database>(supabaseUrl!, serviveRoleKey!);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { address } = req.query;

  if (!address || typeof address !== "string") {
    return res.status(400).json({ error: "Address parameter is required" });
  }

  try {
    const { data, error } = await supabase
      .from("USER")
      .select()
      .eq("evm_address", address);

    if (error) {
      console.error("hasAccount error: ", error);
      return res.status(500).json({ error: error.message });
    }

    const hasAccount = data.length > 0;
    return res.status(200).json({ hasAccount });
  } catch (error) {
    console.error("hasAccount error: ", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}