import { Database } from "@/types/schema";
import { authMiddleware } from "@/utils/verifyJWT";
import { createClient } from "@supabase/supabase-js";
import type { NextApiRequest, NextApiResponse } from "next";

const serviveRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabase = createClient<Database>(supabaseUrl!, serviveRoleKey!);

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: "有効なIDを指定してください" });
  }

  switch (req.method) {
    case "GET": {
      // 特定の投票レベルを取得（参加者情報含む）
      const { data, error } = await supabase
        .from("VOTING_LEVEL")
        .select(
          `
          *,
          participants:VOTING_PARTCIPANT(
            *,
            token:TOKEN(*)  
          )
        `
        )
        .eq("id", id)
        .single();

      if (error) {
        return res.status(error.code === "PGRST116" ? 404 : 400).json({
          error:
            error.code === "PGRST116"
              ? "指定されたIDの投票レベルが見つかりませんでした"
              : error.message,
        });
      }

      return res.status(200).json({ data });
    }

    case "PUT": {
      // 特定の投票レベルを更新（参加者情報含む）
      const {
        company_id,
        level,
        name,
        quorum,
        voting_threshold,
        participants, // 参加者ID配列
      } = req.body;

      // 投票レベルを更新
      const { data: votingLevel, error: votingLevelError } = await supabase
        .from("VOTING_LEVEL")
        .update({
          company_id,
          level,
          name,
          quorum,
          voting_threshold,
        })
        .eq("id", id)
        .select();

      if (votingLevelError) {
        return res.status(400).json({ error: votingLevelError.message });
      }

      if (votingLevel.length === 0) {
        return res
          .status(404)
          .json({ error: "指定されたIDの投票レベルが見つかりませんでした" });
      }

      // 参加者情報を更新する場合
      if (participants !== undefined) {
        // 現在の参加者を一旦すべて削除
        const { error: deleteError } = await supabase
          .from("VOTING_PARTCIPANT")
          .delete()
          .eq("voting_level", id);

        if (deleteError) {
          return res.status(400).json({ error: deleteError.message });
        }

        // 新しい参加者リストを登録
        if (Array.isArray(participants) && participants.length > 0) {
          const participantsToInsert = participants.map((participantId) => ({
            participant: participantId,
            voting_level: id,
          }));

          const { error: insertError } = await supabase
            .from("VOTING_PARTCIPANT")
            .insert(participantsToInsert);

          if (insertError) {
            return res.status(400).json({ error: insertError.message });
          }
        }

        // 更新後の投票レベルと参加者情報を取得
        const { data: updatedData, error: fetchError } = await supabase
          .from("VOTING_LEVEL")
          .select(
            `
            *,
            participants:VOTING_PARTCIPANT(
              *,
              token:TOKEN(
                *
              )
            )
          `
          )
          .eq("id", id)
          .single();

        if (fetchError) {
          return res.status(400).json({ error: fetchError.message });
        }

        return res.status(200).json({ data: updatedData });
      }

      // 参加者情報を更新しない場合は、投票レベル情報のみ返す
      return res.status(200).json({ data: votingLevel[0] });
    }

    case "DELETE": {
      // 特定の投票レベルを削除（関連する参加者情報も削除）

      // まず関連する参加者情報を削除
      await supabase.from("VOTING_PARTCIPANT").delete().eq("voting_level", id);

      // 投票レベルを削除
      const { data, error } = await supabase
        .from("VOTING_LEVEL")
        .delete()
        .eq("id", id)
        .select();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      if (data.length === 0) {
        return res
          .status(404)
          .json({ error: "指定されたIDの投票レベルが見つかりませんでした" });
      }

      return res.status(200).json({ data: data[0] });
    }

    default:
      return res.status(405).json({ error: "Method not allowed" });
  }
}

export default authMiddleware(handler);
