// pages/api/payment.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/utils/supabase';
import { Enums } from '@/types/schema';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'POST': {
      // Create(Upsert) Payment
      const {
        id,
        estuary_id,
        payment_link,
        payment_status,
        price,
        user_id,
      } = req.body;

      const { data, error } = await supabase
        .from("PAYMENT")
        .upsert({
          id,
          estuary_id,
          payment_link,
          payment_status: payment_status as Enums<"PaymentStatus">,
          price,
          user_id,
        })
        .select();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(201).json({ data: data[0] });
    }

    case 'PUT': {
      // Update Payment
      const {
        estuary_id,
        payment_link,
        payment_status,
        price,
        user_id,
      } = req.body;

      if (!user_id) {
        return res.status(400).json({ error: 'user_id is required' });
      }

      const { data, error } = await supabase
        .from("PAYMENT")
        .update({
          estuary_id,
          payment_link,
          payment_status: payment_status as Enums<"PaymentStatus">,
          price,
        })
        .eq("user_id", user_id)
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
