// pages/api/user.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { Enums } from '@/types/schema';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/schema';

const serviveRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabase = createClient<Database>(supabaseUrl!, serviveRoleKey!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {

    case 'POST': {

      const {
        evm_address,
        name,
        furigana,
        address,
        kyc_status,
        email
      } = req.body;

      const { data, error } = await supabase
        .from("USER")
        .upsert({
          evm_address,
          name,
          furigana,
          address,
          kyc_status: kyc_status as Enums<"KycStatus">,
          email,
        })
        .select();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(201).json({ data: data[0] });
    }

    case 'PUT': {
      // USER更新 (evm_addressで指定)
      const {
        evm_address,
        name,
        furigana,
        address,
        kyc_status,
        email
      } = req.body;

      if (!evm_address) {
        return res.status(400).json({ error: 'evm_address is required for update' });
      }

      const { data, error } = await supabase
        .from("USER")
        .update({
          name,
          furigana,
          address,
          kyc_status: kyc_status as Enums<"KycStatus">,
          email,
        })
        .eq("evm_address", evm_address)
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
