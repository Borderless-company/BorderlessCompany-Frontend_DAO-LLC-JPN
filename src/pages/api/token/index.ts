// pages/api/token.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { Enums, Tables } from "@/types/schema";
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/schema";

const serviveRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabase = createClient<Database>(supabaseUrl!, serviveRoleKey!);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case "GET": {
      const { id, companyId, daoId } = req.query;

      let query = supabase.from("TOKEN").select("*");

      if (id && typeof id === "string") {
        query = query.eq("id", id);
      }
      if (companyId && typeof companyId === "string") {
        console.log("company_id >>>: ", companyId);
        query = query.eq("company_id", companyId);
      }
      if (daoId && typeof daoId === "string") {
        query = query.eq("dao_id", daoId);
      }

      const { data, error } = await query;

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(200).json({ data: id ? data[0] : data });
    }

    case "POST": {
      // Create Token
      const {
        id,
        name,
        symbol,
        is_executable,
        image,
        min_price,
        max_price,
        fixed_price,
        contract_address,
        dao_id,
        company_id,
        description,
        token_metadata,
        is_recommender,
      }: Tables<"TOKEN"> = req.body;

      const { data, error } = await supabase
        .from("TOKEN")
        .upsert({
          id,
          name,
          symbol,
          is_executable,
          image,
          min_price,
          max_price,
          fixed_price,
          contract_address,
          dao_id,
          company_id,
          description,
          token_metadata,
          is_recommender,
        })
        .select();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(201).json({ data: data[0] });
    }

    case "PUT": {
      // Update Token
      const { id, ...updateProps } = req.body;

      if (!id) {
        return res
          .status(400)
          .json({ error: "Token ID is required for update" });
      }

      const { data, error } = await supabase
        .from("TOKEN")
        .update(updateProps)
        .eq("id", id)
        .select();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(200).json({ data: data[0] });
    }

    default:
      return res.status(405).json({ error: "Method not allowed" });
  }
}
