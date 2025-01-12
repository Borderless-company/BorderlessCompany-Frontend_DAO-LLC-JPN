import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/utils/supabase";
import { Tables } from "@/types/schema";

export type CreateAgreementProps = Partial<Tables<"AGREEMENT">>;
export type UseAgreementProps = {
  userId?: string;
};

export const useAgreement = () => {
  const queryClient = useQueryClient();

  const { mutateAsync: createAgreement, error } = useMutation<
    Tables<"AGREEMENT">,
    Error,
    CreateAgreementProps
  >({
    mutationFn: async (props: CreateAgreementProps) => {
      const response = await fetch("/api/agreement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      queryClient.invalidateQueries({ queryKey: [data.type, data.user_id] });
    },
  });

  return {
    createAgreement,
  };
};
