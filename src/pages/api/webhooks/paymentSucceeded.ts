import { NextApiRequest, NextApiResponse } from "next";
import stripe from "@/utils/stripe";
import Stripe from "stripe";
import { supabase } from "@/utils/supabase";

const endpointSecret = process.env.NEXT_PUBLIC_STRIPE_WEBHOOK_SECRET!;

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const buf = await buffer(req);
    const sig = req.headers["stripe-signature"] as string;

    console.log("whsec:", endpointSecret);

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(buf, sig, endpointSecret);
    } catch (err: any) {
      console.log(`⚠️  Webhook signature verification failed.`, err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // イベントの処理
    let resJson: { sessionCompleted?: string } = {};
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log("session:", session);
      if (session.payment_status === "paid") {
        await supabase
          .from("USER")
          .update({
            payment_status: "paid",
          })
          .eq("payment_link", session.payment_link as string);
        resJson.sessionCompleted = session.payment_link as string;
        console.log(resJson);
      }
    }

    res.json(resJson);
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}

// raw bodyを取得するためのヘルパー関数
async function buffer(req: NextApiRequest) {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}
