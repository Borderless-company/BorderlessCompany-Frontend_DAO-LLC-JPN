
import { Database } from '@/types/schema';
import { withAuthGSSP } from '@/utils/isLogin';
import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';
const serviveRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabase = createClient<Database>(supabaseUrl!, serviveRoleKey!);


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'POST': {
      // CREATE / UPSERT DAO
      const {
        address,
        company_id,
        company_name,
        dao_name,
        dao_icon,
        establishment_date,
        established_by,
      } = req.body;

      if (!address) {
        return res.status(400).json({ error: 'address is required' });
      }

      const { data, error } = await supabase
        .from("DAO")
        .upsert({
          address,
          company_id,
          company_name,
          dao_name,
          dao_icon,
          establishment_date,
          established_by,
        })
        .select();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(201).json({ data: data[0] });
    }

    case 'PUT': {
      // UPDATE DAO
      const {
        address,
        company_id,
        company_name,
        dao_name,
        dao_icon,
        establishment_date,
      } = req.body;

      if (!address) {
        return res.status(400).json({ error: 'address is required' });
      }

      const { data, error } = await supabase
        .from("DAO")
        .update({
          company_id,
          company_name,
          dao_name,
          dao_icon,
          establishment_date,
        })
        .eq("address", address)
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


export const getServerSideProps = withAuthGSSP(async (ctx) => {
  return { props: {} }
})