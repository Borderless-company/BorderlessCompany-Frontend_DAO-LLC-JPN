import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tables } from "@/types/schema";

// 型定義
export type VotingLevelWithParticipants = Tables<"VOTING_LEVEL"> & {
  participants: (Tables<"VOTING_PARTCIPANT"> & {
    token: Tables<"TOKEN">;
  })[];
};

export type CreateVotingLevelProps = Partial<Tables<"VOTING_LEVEL">> & {
  participants?: string[];
};

export type UpdateVotingLevelProps = Partial<Tables<"VOTING_LEVEL">> & {
  participants?: string[];
};

/**
 * 特定のIDの投票レベルを操作するためのフック
 * @param id 投票レベルID
 */
export const useVotingLevel = (id?: string) => {
  const queryClient = useQueryClient();

  // 投票レベル作成
  const {
    mutateAsync: createVotingLevel,
    isPending: isCreating,
    isSuccess: isCreateSuccess,
    isError: isCreateError,
    error: createError,
  } = useMutation<VotingLevelWithParticipants, Error, CreateVotingLevelProps>({
    mutationFn: async (props: CreateVotingLevelProps) => {
      if (!props.company_id) {
        throw new Error("company_id は必須です");
      }
      const response = await fetch("/api/voting-level", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(props),
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error);
      }
      console.log("[SUCCESS] VotingLevel created: ", json.data);
      return json.data;
    },
    onError: (error) => {
      console.error("[ERROR] Failed to create VotingLevel: ", error);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["votingLevel", data.id] });
      queryClient.invalidateQueries({
        queryKey: ["votingLevels", data.company_id],
      });
    },
  });

  // 投票レベル更新
  const {
    mutateAsync: updateVotingLevel,
    isPending: isUpdating,
    isSuccess: isUpdateSuccess,
    isError: isUpdateError,
    error: updateError,
  } = useMutation<
    VotingLevelWithParticipants,
    Error,
    UpdateVotingLevelProps & { id: string }
  >({
    mutationFn: async (props: UpdateVotingLevelProps & { id: string }) => {
      const { id, ...rest } = props;
      const response = await fetch(`/api/voting-level/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rest),
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error);
      }
      console.log("[SUCCESS] VotingLevel updated: ", json.data);
      return json.data;
    },
    onError: (error) => {
      console.error("[ERROR] Failed to update VotingLevel: ", error);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["votingLevel", data.id] });
      queryClient.invalidateQueries({
        queryKey: ["votingLevels", data.company_id],
      });
    },
  });

  // 投票レベル削除
  const {
    mutateAsync: deleteVotingLevel,
    isPending: isDeleting,
    isSuccess: isDeleteSuccess,
    isError: isDeleteError,
    error: deleteError,
  } = useMutation<void, Error, string>({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/voting-level/${id}`, {
        method: "DELETE",
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error);
      }
      console.log("[SUCCESS] VotingLevel deleted: ", json.data);
    },
    onError: (error) => {
      console.error("[ERROR] Failed to delete VotingLevel: ", error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["votingLevel"] });
      queryClient.invalidateQueries({ queryKey: ["votingLevels"] });
    },
  });

  // 投票レベル取得
  const {
    data: votingLevel,
    isLoading: isFetching,
    isError: isFetchError,
    error: fetchError,
    refetch,
  } = useQuery<VotingLevelWithParticipants | undefined, Error>({
    queryKey: ["votingLevel", id],
    queryFn: async () => {
      if (!id) return undefined;
      const response = await fetch(`/api/voting-level/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error);
      }
      return json.data;
    },
    enabled: !!id,
  });

  return {
    // 投票レベル作成
    createVotingLevel,
    isCreating,
    isCreateSuccess,
    isCreateError,
    createError,

    // 投票レベル更新
    updateVotingLevel,
    isUpdating,
    isUpdateSuccess,
    isUpdateError,
    updateError,

    // 投票レベル削除
    deleteVotingLevel,
    isDeleting,
    isDeleteSuccess,
    isDeleteError,
    deleteError,

    // 投票レベル取得
    votingLevel,
    isFetching,
    isFetchError,
    fetchError,
    refetch,

    // 全体ステータス
    isLoading: isCreating || isUpdating || isDeleting || isFetching,
    isError: isCreateError || isUpdateError || isDeleteError || isFetchError,
  };
};

/**
 * 会社IDに基づいた投票レベル一覧を取得するフック
 * @param companyId 会社ID
 */
export const useVotingLevelsByCompany = (companyId?: string) => {
  const {
    data: votingLevels,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<VotingLevelWithParticipants[], Error>({
    queryKey: ["votingLevels", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const response = await fetch(`/api/voting-level/company/${companyId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error);
      }
      return json.data;
    },
    enabled: !!companyId,
  });

  return { votingLevels, isLoading, isError, error, refetch };
};

/**
 * すべての投票レベルを取得するフック
 */
export const useAllVotingLevels = () => {
  const {
    data: votingLevels,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<VotingLevelWithParticipants[], Error>({
    queryKey: ["votingLevels"],
    queryFn: async () => {
      const response = await fetch("/api/voting-level", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error);
      }
      return json.data;
    },
  });

  return { votingLevels, isLoading, isError, error, refetch };
};
