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
      // CREATE / UPSERT COMPANY
      const { id, ...rest }: Tables<"COMPANY"> = req.body;

      const { data, error } = await supabase
        .from("COMPANY")
        .upsert({
          id,
          ...rest,
        })
        .select();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(201).json({ data: data[0] });
    }

    case "PUT": {
      // UPDATE COMPANY
      const { id, ...rest }: Tables<"COMPANY"> = req.body;

      if (!id) {
        return res.status(400).json({ error: "id is required" });
      }

      const { data, error } = await supabase
        .from("COMPANY")
        .update(rest)
        .eq("id", id)
        .select();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(200).json({ data: data[0] });
    }

    case "GET": {
      // GET COMPANY BY ID
      const { id, founder_id } = req.query;

      if (!id && !founder_id) {
        return res.status(400).json({ error: "id or founder_id is required" });
      }

      if (Array.isArray(id)) {
        return res.status(400).json({ error: "id is not an array" });
      }

      if (Array.isArray(founder_id)) {
        return res.status(400).json({ error: "founder_id is not an array" });
      }

      if (id) {
        const { data, error } = await supabase
          .from("COMPANY")
          .select(`*, COMPANY_NAME (*)`)
          .eq("id", id as string)
          .single();

        if (error) {
          return res.status(400).json({ error: error.message });
        }
        return res.status(200).json({ data });
      } else if (founder_id) {
        console.log("fetching company by founder_id: ", founder_id);
        const { data, error } = await supabase
          .from("COMPANY")
          .select(`*, COMPANY_NAME (*)`)
          .eq("founder_id", founder_id as string)
          .single();

        if (error) {
          return res.status(400).json({ error: error.message });
        }
        return res.status(200).json({ data });
      }
    }

    default:
      return res.status(405).json({ error: "Method not allowed" });
  }
}

export default authMiddleware(handler);
