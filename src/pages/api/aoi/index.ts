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
      // CREATE / UPSERT AOI
      const {
        id,
        company_id,
        branch_location,
        business_end_date,
        business_purpose,
        business_start_date,
        capital,
        currency,
        establishment_date,
        location,
      }: Tables<"AOI"> = req.body;

      const { data, error } = await supabase
        .from("AOI")
        .upsert({
          id,
          company_id,
          branch_location,
          business_end_date,
          business_purpose,
          business_start_date,
          capital,
          currency,
          establishment_date,
          location,
        })
        .select();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(201).json({ data: data[0] });
    }

    case "PUT": {
      // UPDATE AOI
      const {
        id,
        branch_location,
        business_end_date,
        business_purpose,
        business_start_date,
        capital,
        currency,
        establishment_date,
        location,
      }: Tables<"AOI"> = req.body;

      if (!id) {
        return res.status(400).json({ error: "id is required" });
      }

      const { data, error } = await supabase
        .from("AOI")
        .update({
          branch_location,
          business_end_date,
          business_purpose,
          business_start_date,
          capital,
          currency,
          establishment_date,
          location,
          status,
        })
        .eq("id", id)
        .select();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(200).json({ data: data[0] });
    }

    case "GET": {
      // GET AOI BY ID OR COMPANY_ID
      const { id, company_id } = req.query;

      if (!id && !company_id) {
        return res.status(400).json({ error: "id or company_id is required" });
      }

      if (Array.isArray(id)) {
        return res.status(400).json({ error: "id is not an array" });
      }

      if (Array.isArray(company_id)) {
        return res.status(400).json({ error: "company_id is not an array" });
      }

      if (id) {
        const { data, error } = await supabase
          .from("AOI")
          .select()
          .eq("id", id as string)
          .single();

        if (error) {
          return res.status(400).json({ error: error.message });
        }
        return res.status(200).json({ data });
      } else if (company_id) {
        const { data, error } = await supabase
          .from("AOI")
          .select()
          .eq("company_id", company_id as string)
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
