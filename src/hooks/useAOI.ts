import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tables } from "@/types/schema";

export type UpdateAOIProps = Partial<Tables<"AOI">>;

export const useAOI = (id?: string) => {
  const queryClient = useQueryClient();

  const { mutateAsync: createAOI, isSuccess: isCreateAOISuccess } = useMutation<
    Tables<"AOI">,
    Error,
    Partial<Tables<"AOI">>
  >({
    mutationFn: async (props: Partial<Tables<"AOI">>) => {
      const response = await fetch("/api/aoi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(props),
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error);
      }
      console.log("[SUCCESS] AOI created: ", json.data);
      return json.data;
    },
    onError: (error) => {
      console.error("[ERROR] Failed to create AOI: ", error);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["aoi", data.id] });
      if (data.company_id) {
        queryClient.invalidateQueries({
          queryKey: ["aoi", "company", data.company_id],
        });
      }
    },
  });

  const { mutateAsync: updateAOI, isSuccess: isAOIUpdated } = useMutation<
    Tables<"AOI">,
    Error,
    UpdateAOIProps
  >({
    mutationFn: async (props: UpdateAOIProps) => {
      const response = await fetch("/api/aoi", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...props }),
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error);
      }
      console.log("[SUCCESS] AOI updated: ", json.data);
      return json.data;
    },
    onError: (error) => {
      console.error("[ERROR] Failed to update AOI: ", error);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["aoi", data.id] });
      if (data.company_id) {
        queryClient.invalidateQueries({
          queryKey: ["aoi", "company", data.company_id],
        });
      }
    },
  });

  const {
    data: aoi,
    isLoading,
    isError,
  } = useQuery<Tables<"AOI"> | undefined, Error>({
    queryKey: ["aoi", id],
    queryFn: async () => {
      if (!id) return undefined;
      const response = await fetch(`/api/aoi?id=${id}`, {
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

  return {
    updateAOI,
    createAOI,
    isCreateAOISuccess,
    isError,
    isAOIUpdated,
    aoi,
    isLoading,
  };
};

// 会社IDによるAOI取得用のカスタムフック
export const useAOIByCompanyId = (companyId?: string) => {
  const {
    data: aoi,
    isLoading,
    isError,
  } = useQuery<Tables<"AOI"> | undefined, Error>({
    queryKey: ["aoi", "company", companyId],
    queryFn: async () => {
      if (!companyId) return undefined;
      const response = await fetch(`/api/aoi?company_id=${companyId}`, {
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

  return { aoi, isLoading, isError };
};
