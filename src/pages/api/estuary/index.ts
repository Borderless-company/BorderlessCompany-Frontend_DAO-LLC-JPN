import { Database } from '@/types/schema';
import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';
const serviveRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabase = createClient<Database>(supabaseUrl!, serviveRoleKey!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query as { id?: string };

  switch (req.method) {
    case 'POST': {
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
          dao_id
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
        return res.status(400).json({ error: 'Missing id in query parameters' });
      }

      const {
        org_name,
        org_logo,
        estuary_link,
        is_public,
        start_date,
        end_date,
        payment_methods,
        dao_id
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
          dao_id
        })
        .eq("id", id)
        .select();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      const result = data[0];
      return res.status(200).json({ result });
    }

    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}
