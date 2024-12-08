// pages/api/token.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/utils/supabase';
import { Enums } from '@/types/schema';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'POST': {
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
        dao_id
      } = req.body;

      const { data, error } = await supabase
        .from("TOKEN")
        .insert({
          id,
          name,
          symbol,
          is_executable,
          image,
          min_price,
          max_price,
          fixed_price,
          contract_address,
          dao_id
        })
        .select();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(201).json({ data: data[0] });
    }

    case 'PUT': {
      // Update Token
      const { id, ...updateProps } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'Token ID is required for update' });
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
      return res.status(405).json({ error: 'Method not allowed' });
  }
}
