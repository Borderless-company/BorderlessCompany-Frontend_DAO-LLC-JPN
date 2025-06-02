import { Database, Tables, TablesInsert, TablesUpdate } from "@/types/schema";
import { createClient } from "@supabase/supabase-js";
import type { NextApiRequest, NextApiResponse } from "next";
import { bypassAuthForGet } from "@/utils/bypassAuthForGet";

const serviveRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

if (!serviveRoleKey || !supabaseUrl) {
  throw new Error("Missing required environment variables");
}

const supabase = createClient<Database>(supabaseUrl, serviveRoleKey);

type EstuaryInsert = TablesInsert<"ESTUARY">;
type EstuaryUpdate = TablesUpdate<"ESTUARY">;

/**
 * Estuary API Handler
 * - GET: 認証不要（公開データの取得）
 * - POST/PUT/DELETE: 認証必須（データの変更操作）
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id, company_id, dao_id } = req.query as {
      id?: string;
      company_id?: string;
      dao_id?: string;
    };

    switch (req.method) {
      case "GET": {
        // 単体取得の場合
        if (id) {
          if (Array.isArray(id)) {
            return res.status(400).json({ error: "idは配列にできません" });
          }

          const { data: estuary, error } = await supabase
            .from("ESTUARY")
            .select(
              `
              *,
              token:TOKEN(*),
              company:COMPANY(
                *,
                COMPANY_NAME(*)
              )
            `
            )
            .eq("id", id)
            .single();

          if (error) {
            console.error("[ERROR] Estuary取得エラー:", error);
            return res.status(404).json({ error: "Estuaryが見つかりません" });
          }

          return res.status(200).json({ data: estuary });
        }

        // 一覧取得の場合（company_idまたはdao_idでフィルタリング）
        let query = supabase.from("ESTUARY").select(
          `
            *,
            token:TOKEN(*),
            company:COMPANY(
              *,
              COMPANY_NAME(*)
            )
          `
        );

        if (company_id && typeof company_id === "string") {
          query = query.eq("company_id", company_id);
        }

        if (dao_id && typeof dao_id === "string") {
          query = query.eq("dao_id", dao_id);
        }

        const { data: estuaries, error } = await query.order("created_at", {
          ascending: false,
        });

        if (error) {
          console.error("[ERROR] Estuary一覧取得エラー:", error);
          return res
            .status(500)
            .json({ error: "Estuary一覧の取得に失敗しました" });
        }

        return res.status(200).json({ data: estuaries || [] });
      }

      case "POST": {
        // 認証必須: Estuaryの作成
        const {
          sale_name,
          org_logo,
          estuary_link,
          is_public,
          start_date,
          end_date,
          payment_methods,
          dao_id,
          company_id,
          fixed_price,
          max_price,
          min_price,
          token_id,
        } = req.body;

        // 必須フィールドの検証
        if (!sale_name) {
          return res.status(400).json({ error: "組織名は必須です" });
        }

        const insertData: EstuaryInsert = {
          sale_name,
          org_logo,
          estuary_link,
          is_public,
          start_date,
          end_date,
          payment_methods,
          dao_id,
          company_id,
          fixed_price,
          max_price,
          min_price,
          token_id,
        };

        const { data, error } = await supabase
          .from("ESTUARY")
          .insert(insertData)
          .select()
          .single();

        if (error) {
          console.error("[ERROR] Estuary作成エラー:", error);
          return res.status(500).json({ error: "Estuaryの作成に失敗しました" });
        }

        return res.status(201).json({ data });
      }

      case "PUT": {
        // 認証必須: Estuaryの更新
        if (!id) {
          return res.status(400).json({ error: "IDが必要です" });
        }

        if (Array.isArray(id)) {
          return res.status(400).json({ error: "IDは配列にできません" });
        }

        const {
          sale_name,
          org_logo,
          estuary_link,
          is_public,
          start_date,
          end_date,
          payment_methods,
          dao_id,
          company_id,
          fixed_price,
          max_price,
          min_price,
          token_id,
        } = req.body;

        const updateData: EstuaryUpdate = {
          sale_name,
          org_logo,
          estuary_link,
          is_public,
          start_date,
          end_date,
          payment_methods,
          dao_id,
          company_id,
          fixed_price,
          max_price,
          min_price,
          token_id,
        };

        const { data, error } = await supabase
          .from("ESTUARY")
          .update(updateData)
          .eq("id", id)
          .select()
          .single();

        if (error) {
          console.error("[ERROR] Estuary更新エラー:", error);
          return res.status(500).json({ error: "Estuaryの更新に失敗しました" });
        }

        return res.status(200).json({ data });
      }

      case "DELETE": {
        // 認証必須: Estuaryの削除
        if (!id) {
          return res.status(400).json({ error: "IDが必要です" });
        }

        if (Array.isArray(id)) {
          return res.status(400).json({ error: "IDは配列にできません" });
        }

        const { error } = await supabase.from("ESTUARY").delete().eq("id", id);

        if (error) {
          console.error("[ERROR] Estuary削除エラー:", error);
          return res.status(500).json({ error: "Estuaryの削除に失敗しました" });
        }

        return res.status(204).end();
      }

      default:
        return res.status(405).json({ error: "許可されていないメソッドです" });
    }
  } catch (error) {
    console.error("[ERROR] API処理エラー:", error);
    return res.status(500).json({ error: "内部サーバーエラーが発生しました" });
  }
}

// GETリクエストのみ認証をバイパス、POST/PUT/DELETEには認証を適用
export default bypassAuthForGet(handler);
