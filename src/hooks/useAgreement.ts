import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tables } from "@/types/schema";

export type CreateAgreementProps = Partial<Tables<"AGREEMENT">>;
export type UseAgreementProps = {
  userId?: string;
};

export const useAgreement = (userId?: string) => {
  const queryClient = useQueryClient();

  const { data: agreements, isLoading: isLoadingAgreements } = useQuery<Tables<"AGREEMENT">[]>({
    queryKey: ["agreements", userId],
    queryFn: async () => {
      if (!userId) return [];
      const response = await fetch(`/api/agreement?user_id=${userId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error);
      }
      return json.data;
    },
    enabled: !!userId,
  });

  const { mutateAsync: createAgreement } = useMutation<
    Tables<"AGREEMENT">,
    Error,
    CreateAgreementProps
  >({
    mutationFn: async (props: CreateAgreementProps) => {
      const response = await fetch("/api/agreement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...props }),
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error);
      }
      console.log("[SUCCESS] Agreement created: ", json.data);
      return json.data;
    },
    onError: (error) => {
      console.error("[ERROR] Failed to create agreement: ", error);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["agreements", data.user_id] });
    },
  });

  return {
    agreements,
    isLoadingAgreements,
    createAgreement,
  };
};
