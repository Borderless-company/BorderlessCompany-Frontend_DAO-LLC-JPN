import { Database, Tables } from "@/types/schema";
import { authMiddleware } from "@/utils/verifyJWT";
import { createClient } from "@supabase/supabase-js";
import type { NextApiRequest, NextApiResponse } from "next";

const serviveRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabase = createClient<Database>(supabaseUrl!, serviveRoleKey!);
const adminPrivateKey = process.env.ADMIN_PRIVATE_KEY;

async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case "POST": {
      // CREATE / UPSERT AOI
      const {
        id,
        company_id,
        company_name,
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
          company_name,
          branch_location,
          business_end_date,
          business_purpose,
          business_start_date,
          capital,
          currency,
          establishment_date,
          location,
        })
        .select(`*, COMPANY_NAME (*)`);

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
        company_name,
        company_id,
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
          company_name,
          company_id,
        })
        .eq("id", id)
        .select(`*, COMPANY_NAME (*)`);

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(200).json({ data: data[0] });
    }

    case "GET": {
      const { id, company_id } = req.query;

      if (!id && !company_id) {
        return res.status(400).json({ error: "id or company_id is required" });
      }

      if (id && Array.isArray(id)) {
        return res.status(400).json({ error: "id must be a string" });
      }

      if (company_id && Array.isArray(company_id)) {
        return res.status(400).json({ error: "company_id must be a string" });
      }

      let query = supabase.from("AOI").select(`*, COMPANY_NAME (*)`);

      if (id) {
        query = query.eq("id", id);
      }

      if (company_id) {
        query = query.eq("company_id", company_id);
      }

      const { data, error } = await query.single();

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
