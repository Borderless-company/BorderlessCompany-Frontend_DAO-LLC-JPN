import { Database, Tables } from "@/types/schema";
import { createClient } from "@supabase/supabase-js";
import type { NextApiRequest, NextApiResponse } from "next";
import { bypassAuthForGet } from "@/utils/bypassAuthForGet";

const serviveRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabase = createClient<Database>(supabaseUrl!, serviveRoleKey!);

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id, company_id, dao_id } = req.query as {
    id?: string;
    company_id?: string;
    dao_id?: string;
  };

  switch (req.method) {
    case "GET": {
      // 単体取得の場合
      if (id) {
        if (Array.isArray(id)) {
          return res.status(400).json({ error: "id is not an array" });
        }

        const { data: estuary, error } = await supabase
          .from("ESTUARY")
          .select(
            `
            *,
            tokens:TOKEN(*),
            company:COMPANY(
              *,
              COMPANY_NAME(*)
            )
          `
          )
          .eq("id", id)
          .single();

        if (error) {
          return res.status(400).json({ error: error.message });
        }

        return res.status(200).json({ data: estuary });
      }

      // 一覧取得の場合（company_idまたはdao_idでフィルタリング）
      let query = supabase.from("ESTUARY").select(
        `
          *,
          tokens:TOKEN(*),
          company:COMPANY(
            *,
            COMPANY_NAME(*)
          )
        `
      );

      if (company_id && typeof company_id === "string") {
        query = query.eq("company_id", company_id);
      }

      if (dao_id && typeof dao_id === "string") {
        query = query.eq("dao_id", dao_id);
      }

      const { data: estuaries, error } = await query.order("created_at", {
        ascending: false,
      });

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(200).json({ data: estuaries });
    }

    case "POST": {
      // POSTではidは必須ではない想定
      const {
        org_name,
        org_logo,
        estuary_link,
        is_public,
        start_date,
        end_date,
        payment_methods,
        dao_id,
      } = req.body;

      // 新規作成
      const { data, error } = await supabase
        .from("ESTUARY")
        .insert({
          org_name,
          org_logo,
          estuary_link,
          is_public,
          start_date,
          end_date,
          payment_methods,
          dao_id,
        })
        .select();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(201).json({ data: data[0] });
    }

    case "PUT": {
      // PUTの場合はidが必要
      if (!id) {
        return res
          .status(400)
          .json({ error: "Missing id in query parameters" });
      }

      const {
        org_name,
        org_logo,
        estuary_link,
        is_public,
        start_date,
        end_date,
        payment_methods,
        dao_id,
      } = req.body;

      const { data, error } = await supabase
        .from("ESTUARY")
        .update({
          org_name,
          org_logo,
          estuary_link,
          is_public,
          start_date,
          end_date,
          payment_methods,
          dao_id,
        })
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

export default bypassAuthForGet(handler);
