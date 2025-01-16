import { Database, Tables } from "@/types/schema";
import { authMiddleware } from "@/utils/verifyJWT";
import { createClient } from "@supabase/supabase-js";
import type { NextApiRequest, NextApiResponse } from "next";

const serviveRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabase = createClient<Database>(supabaseUrl!, serviveRoleKey!);

async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case "POST": {
      // CREATE / UPSERT COMPANY_NAME
      const {
        id,
        "en-us": enUs,
        "ja-jp": jaJp,
      }: Tables<"COMPANY_NAME"> = req.body;

      const { data, error } = await supabase
        .from("COMPANY_NAME")
        .upsert({
          id,
          "en-us": enUs,
          "ja-jp": jaJp,
        })
        .select();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(201).json({ data: data[0] });
    }

    case "PUT": {
      // UPDATE COMPANY_NAME
      const {
        id,
        "en-us": enUs,
        "ja-jp": jaJp,
      }: Tables<"COMPANY_NAME"> = req.body;

      if (!id) {
        return res.status(400).json({ error: "id is required" });
      }

      const { data, error } = await supabase
        .from("COMPANY_NAME")
        .update({
          "en-us": enUs,
          "ja-jp": jaJp,
        })
        .eq("id", id)
        .select();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(200).json({ data: data[0] });
    }

    case "GET": {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: "id is required" });
      }

      if (Array.isArray(id)) {
        return res.status(400).json({ error: "id must be a string" });
      }

      const { data, error } = await supabase
        .from("COMPANY_NAME")
        .select()
        .eq("id", id)
        .single();

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
