// pages/api/user.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { Enums } from "@/types/schema";
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/schema";
import { authMiddleware, AuthenticatedRequest } from "@/utils/verifyJWT";

const serviveRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabase = createClient<Database>(supabaseUrl!, serviveRoleKey!);

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  switch (req.method) {
    case "GET": {
      // 認証されたユーザーの情報を取得
      const userAddress = req.user?.address;

      if (!userAddress) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const { data, error } = await supabase
        .from("USER")
        .select()
        .eq("evm_address", userAddress)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // ユーザーが見つからない場合
          return res.status(404).json({ error: "User not found" });
        }
        return res.status(400).json({ error: error.message });
      }

      return res.status(200).json({ data });
    }

    case "POST": {
      const {
        evm_address,
        name,
        furigana,
        address,
        kyc_status,
        email,
        status,
      } = req.body;

      console.log("req.user?.address: ", req.user?.address);
      console.log("evm_address: ", evm_address);
      console.log("req.body: ", req.body);
      // 認証されたユーザーのアドレスと作成するユーザーのアドレスが一致することを確認
      if (req.user?.address?.toLowerCase() !== evm_address?.toLowerCase()) {
        return res
          .status(403)
          .json({ error: "You can only create your own user record" });
      }

      const { data, error } = await supabase
        .from("USER")
        .upsert({
          evm_address,
          name,
          furigana,
          address,
          kyc_status: kyc_status as Enums<"KycStatus">,
          email,
          status: status as Enums<"UserStatus">,
        })
        .select();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(201).json({ data: data[0] });
    }

    case "PUT": {
      // USER更新 (evm_addressで指定)
      const {
        evm_address,
        name,
        furigana,
        address,
        kyc_status,
        email,
        status,
      } = req.body;

      if (!evm_address) {
        return res
          .status(400)
          .json({ error: "evm_address is required for update" });
      }

      // 認証されたユーザーのアドレスと更新するユーザーのアドレスが一致することを確認
      if (req.user?.address?.toLowerCase() !== evm_address?.toLowerCase()) {
        return res
          .status(403)
          .json({ error: "You can only update your own user record" });
      }

      const { data, error } = await supabase
        .from("USER")
        .update({
          name,
          furigana,
          address,
          kyc_status: kyc_status as Enums<"KycStatus">,
          email,
          status: status as Enums<"UserStatus">,
        })
        .eq("evm_address", evm_address)
        .select();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(200).json({ data: data[0] });
    }

    case "DELETE": {
      const { evm_address } = req.body;

      if (!evm_address) {
        return res
          .status(400)
          .json({ error: "evm_address is required for deletion" });
      }

      // 認証されたユーザーのアドレスと削除するユーザーのアドレスが一致することを確認
      if (req.user?.address?.toLowerCase() !== evm_address?.toLowerCase()) {
        return res
          .status(403)
          .json({ error: "You can only delete your own user record" });
      }

      const { data, error } = await supabase
        .from("USER")
        .delete()
        .eq("evm_address", evm_address)
        .select();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(200).json({ data: data[0] });
    }

    default:
      return res.status(405).json({ error: "Method not allowed" });
  }
}

export default authMiddleware(handler);
