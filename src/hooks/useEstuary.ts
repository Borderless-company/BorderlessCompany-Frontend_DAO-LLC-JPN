import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tables, TablesInsert, TablesUpdate } from "@/types/schema";

export type EstuaryInsert = TablesInsert<"ESTUARY">;
export type EstuaryUpdate = TablesUpdate<"ESTUARY">;

export type EstuaryWithRelations = Tables<"ESTUARY"> & {
  token: Tables<"TOKEN">;
  company:
    | (Tables<"COMPANY"> & {
        COMPANY_NAME: Tables<"COMPANY_NAME"> | null;
      })
    | null;
};

// Estuary操作のレスポンス型
type EstuaryApiResponse = {
  data: Tables<"ESTUARY">;
};

type EstuaryListApiResponse = {
  data: EstuaryWithRelations[];
};

type EstuaryDetailApiResponse = {
  data: EstuaryWithRelations;
};

// API呼び出し関数
const fetchEstuary = async (id: string): Promise<EstuaryWithRelations> => {
  const response = await fetch(`/api/estuary?id=${id}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.error || "Estuaryの取得に失敗しました");
  }

  return json.data;
};

const fetchEstuariesByCompanyId = async (
  companyId: string
): Promise<EstuaryWithRelations[]> => {
  const response = await fetch(`/api/estuary?company_id=${companyId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  const json = await response.json();
  console.log(json);
  if (!response.ok) {
    throw new Error(json.error || "Estuary一覧の取得に失敗しました");
  }

  return json.data || [];
};

const fetchEstuariesByDaoId = async (
  daoId: string
): Promise<EstuaryWithRelations[]> => {
  const response = await fetch(`/api/estuary?dao_id=${daoId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.error || "Estuary一覧の取得に失敗しました");
  }

  return json.data || [];
};

// メインのEstuaryフック
export const useEstuary = (id?: string) => {
  const queryClient = useQueryClient();

  // 単体取得
  const {
    data: estuary,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<EstuaryWithRelations | undefined, Error>({
    queryKey: ["estuary", id],
    queryFn: () => (id ? fetchEstuary(id) : Promise.resolve(undefined)),
    enabled: !!id,
  });
  console.log(estuary);

  // 作成
  const {
    mutateAsync: createEstuary,
    isPending: isCreating,
    isSuccess: isCreateSuccess,
  } = useMutation<Tables<"ESTUARY">, Error, EstuaryInsert>({
    mutationFn: async (data: EstuaryInsert) => {
      const response = await fetch("/api/estuary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || "Estuaryの作成に失敗しました");
      }
      return json.data;
    },
    onSuccess: (data) => {
      // 新しく作成されたEstuaryのキャッシュを無効化
      queryClient.invalidateQueries({ queryKey: ["estuary", data.id] });
      // 一覧のキャッシュも無効化
      queryClient.invalidateQueries({ queryKey: ["estuaries"] });
    },
  });

  // 更新
  const {
    mutateAsync: updateEstuary,
    isPending: isUpdating,
    isSuccess: isUpdateSuccess,
  } = useMutation<Tables<"ESTUARY">, Error, EstuaryUpdate>({
    mutationFn: async (data: EstuaryUpdate) => {
      if (!id) {
        throw new Error("更新にはIDが必要です");
      }

      const response = await fetch(`/api/estuary?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || "Estuaryの更新に失敗しました");
      }
      return json.data;
    },
    onSuccess: () => {
      // 該当Estuaryのキャッシュを無効化
      queryClient.invalidateQueries({ queryKey: ["estuary", id] });
      // 一覧のキャッシュも無効化
      queryClient.invalidateQueries({ queryKey: ["estuaries"] });
    },
  });

  // 削除
  const {
    mutateAsync: deleteEstuary,
    isPending: isDeleting,
    isSuccess: isDeleteSuccess,
  } = useMutation<void, Error, void>({
    mutationFn: async () => {
      if (!id) {
        throw new Error("削除にはIDが必要です");
      }

      const response = await fetch(`/api/estuary?id=${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const json = await response.json();
        throw new Error(json.error || "Estuaryの削除に失敗しました");
      }
    },
    onSuccess: () => {
      // 該当Estuaryのキャッシュを削除
      queryClient.removeQueries({ queryKey: ["estuary", id] });
      // 一覧のキャッシュも無効化
      queryClient.invalidateQueries({ queryKey: ["estuaries"] });
    },
  });

  return {
    estuary,
    isLoading,
    isError,
    error,
    refetch,
    createEstuary,
    updateEstuary,
    deleteEstuary,
    isCreating,
    isUpdating,
    isDeleting,
    isCreateSuccess,
    isUpdateSuccess,
    isDeleteSuccess,
  };
};

// 会社IDによるEstuary一覧取得フック
export const useEstuariesByCompanyId = (companyId?: string) => {
  const {
    data: estuaries,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<EstuaryWithRelations[], Error>({
    queryKey: ["estuaries", "company", companyId],
    queryFn: () =>
      companyId ? fetchEstuariesByCompanyId(companyId) : Promise.resolve([]),
    enabled: !!companyId,
  });

  return {
    estuaries: estuaries || [],
    isLoading,
    isError,
    error,
    refetch,
  };
};

// DAO IDによるEstuary一覧取得フック
export const useEstuariesByDaoId = (daoId?: string) => {
  const {
    data: estuaries,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<EstuaryWithRelations[], Error>({
    queryKey: ["estuaries", "dao", daoId],
    queryFn: () => (daoId ? fetchEstuariesByDaoId(daoId) : Promise.resolve([])),
    enabled: !!daoId,
  });

  return {
    estuaries: estuaries || [],
    isLoading,
    isError,
    error,
    refetch,
  };
};

// 後方互換性のため（廃止予定）
export const useEstuaryByCompanyId = useEstuariesByCompanyId;
