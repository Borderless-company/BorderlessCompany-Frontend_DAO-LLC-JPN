import { NextApiRequest, NextApiResponse } from "next";
import stripe from "@/utils/stripe";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const { amount, title, description, email } = req.body;

      // Create a PaymentIntent with the order amount and currency
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "jpy",
        metadata: { title },
        payment_method_types: ["card"],
        description: description || undefined,
        receipt_email: email || undefined,
      });

      res.status(200).json({
        clientSecret: paymentIntent.client_secret,
      });
    } catch (err: any) {
      console.error("Error creating payment intent", err);
      res.status(500).json({ statusCode: 500, message: err.message });
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}
