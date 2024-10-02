import { NextApiRequest, NextApiResponse } from "next";
import stripe from "@/utils/stripe";
import { supabase } from "@/utils/supabase";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const { name, description, image } = req.body;

      const product = await stripe.products.create({
        name: name,
        description: description || undefined,
      });

      // TokenテーブルにproductIdを書き込む
      const { data, error } = await supabase
        .from("Token")
        .update({ product_id: product.id })
        .eq("id", req.body.tokenId); // tokenIdはリクエストボディから取得する必要があります

      if (error) {
        console.error("Supabaseエラー:", error);
        throw new Error("製品IDの保存中にエラーが発生しました");
      }

      console.log("製品IDが正常に保存されました:", data);

      res.status(200).json({
        productId: product.id,
      });
    } catch (err: any) {
      console.error("Error creating product ID", err);
      res.status(500).json({ statusCode: 500, message: err.message });
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}
