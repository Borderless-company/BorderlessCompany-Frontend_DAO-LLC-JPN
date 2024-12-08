// pages/api/member.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/utils/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'POST': {
      // メンバー新規作成
      const {
        user_id,
        dao_id,
        date_of_employment,
        is_admin,
        is_executive,
        token_id,
        invested_amount,
        is_minted,
      } = req.body;

      const { data, error } = await supabase
        .from("MEMBER")
        .insert({
          user_id,
          dao_id,
          date_of_employment,
          is_admin,
          is_executive,
          token_id,
          invested_amount,
          is_minted,
        })
        .select();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(201).json({ data: data[0] });
    }

    case 'PUT': {
      // メンバー更新
      const {
        user_id,
        dao_id,
        date_of_employment,
        is_admin,
        is_executive,
        token_id,
        invested_amount,
        is_minted,
      } = req.body;

      if (!user_id || !dao_id) {
        return res.status(400).json({ error: 'user_id and dao_id are required' });
      }

      const { data, error } = await supabase
        .from("MEMBER")
        .update({
          dao_id,
          date_of_employment,
          is_admin,
          is_executive,
          token_id,
          invested_amount,
          is_minted,
        })
        .eq("user_id", user_id)
        .eq("dao_id", dao_id)
        .select();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(200).json({ data: data[0] });
    }

    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}
