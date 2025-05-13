import { Database, Tables } from "@/types/schema";
import { authMiddleware } from "@/utils/verifyJWT";
import { createClient } from "@supabase/supabase-js";
import type { NextApiRequest, NextApiResponse } from "next";

const serviveRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabase = createClient<Database>(supabaseUrl!, serviveRoleKey!);

async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case "POST": {
      // 投票レベル作成（参加者情報含む）
      const {
        participants, // 参加者ID配列
        ...rest
      } = req.body;

      if (!rest.company_id) {
        return res.status(400).json({ error: "company_id は必須です" });
      }

      // トランザクション的に処理するために、supabaseセッションを開始
      const { data: votingLevel, error: votingLevelError } = await supabase
        .from("VOTING_LEVEL")
        .upsert(
          {
            ...rest,
          },
          {
            onConflict: "company_id,level",
          }
        )
        .select();

      if (votingLevelError) {
        return res.status(400).json({ error: votingLevelError.message });
      }

      const votingLevelId = votingLevel[0].id;
      let participantsData: Tables<"VOTING_PARTCIPANT">[] = [];

      // 参加者がある場合は登録
      if (
        participants &&
        Array.isArray(participants) &&
        participants.length > 0
      ) {
        const participantsToInsert = participants.map((participantId) => ({
          participant: participantId,
          voting_level: votingLevelId,
        }));

        const { error: deleteError } = await supabase
          .from("VOTING_PARTCIPANT")
          .delete()
          .eq("voting_level", votingLevelId);

        if (deleteError) {
          return res.status(400).json({ error: deleteError.message });
        }

        const { data: insertedParticipants, error: participantsError } =
          await supabase
            .from("VOTING_PARTCIPANT")
            .upsert(participantsToInsert, {
              onConflict: "participant,voting_level",
            })
            .select();

        if (participantsError) {
          // 参加者の登録に失敗した場合は、作成した投票レベルも削除
          await supabase.from("VOTING_LEVEL").delete().eq("id", votingLevelId);
          return res.status(400).json({ error: participantsError.message });
        }

        participantsData = insertedParticipants;
      }

      // 投票レベルと参加者情報を一緒に返す
      return res.status(201).json({
        data: {
          ...votingLevel[0],
          participants: participantsData,
        },
      });
    }

    case "GET": {
      // 投票レベル取得
      const { id, company_id } = req.query;

      // 特定のIDで取得
      if (id) {
        if (Array.isArray(id)) {
          return res.status(400).json({ error: "id は配列ではありません" });
        }

        const { data, error } = await supabase
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

        if (error) {
          return res.status(400).json({ error: error.message });
        }

        return res.status(200).json({ data });
      }

      // 会社IDで取得
      if (company_id) {
        if (Array.isArray(company_id)) {
          return res
            .status(400)
            .json({ error: "company_id は配列ではありません" });
        }

        const { data, error } = await supabase
          .from("VOTING_LEVEL")
          .select(
            `
            *,
            participants:VOTING_PARTCIPANT(*)
          `
          )
          .eq("company_id", company_id);

        if (error) {
          return res.status(400).json({ error: error.message });
        }

        return res.status(200).json({ data });
      }

      // 全て取得
      const { data, error } = await supabase.from("VOTING_LEVEL").select(`
          *,
          participants:VOTING_PARTCIPANT(*)
        `);

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(200).json({ data });
    }

    case "PUT": {
      // 投票レベル更新（参加者情報含む）
      const {
        id,
        company_id,
        level,
        name,
        quorum,
        voting_threshold,
        participants, // 参加者ID配列（更新後の完全なリスト）
      } = req.body;

      if (!id) {
        return res.status(400).json({ error: "id は必須です" });
      }

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
        let participantsData: Tables<"VOTING_PARTCIPANT">[] = [];
        if (Array.isArray(participants) && participants.length > 0) {
          const participantsToInsert = participants.map((participantId) => ({
            participant: participantId,
            voting_level: id,
          }));

          const { data: insertedParticipants, error: insertError } =
            await supabase
              .from("VOTING_PARTCIPANT")
              .insert(participantsToInsert)
              .select();

          if (insertError) {
            return res.status(400).json({ error: insertError.message });
          }

          participantsData = insertedParticipants;
        }

        // 更新後の投票レベルと参加者情報を取得
        const { data: updatedData, error: fetchError } = await supabase
          .from("VOTING_LEVEL")
          .select(
            `
            *,
            participants:VOTING_PARTCIPANT(*)
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
      // 投票レベル削除（関連する参加者情報も削除）
      const { id } = req.body;

      if (!id) {
        return res.status(400).json({ error: "id は必須です" });
      }

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
