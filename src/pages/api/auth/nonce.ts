
import { Database } from '@/types/schema';
import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';
const serviveRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabase = createClient<Database>(supabaseUrl!, serviveRoleKey!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { address } = req.query;
  if(req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if(!address) {
    return res.status(400).json({ error: 'Address is required' });
  }
  // check nonce
  const { data, error } = await supabase.from("NONCE").select("*").eq("evmAddress", address);
  if(data?.length === 0) {
    const { data: insertData, error: insertError } = await supabase.from("NONCE").insert({
      evmAddress: address as string,
      nonce: 0,
    }).select();
    const nonce = insertData?.[0]?.nonce ?? 0;
    if(insertError) {
      return res.status(500).json({ error: 'Failed to insert nonce' });
    }

    return res.status(200).json({ nonce });
  }
  if(error) {
    return res.status(500).json({ error: 'Failed to fetch nonce' });
  }

  return res.status(200).json({ nonce: data[0].nonce });
}
