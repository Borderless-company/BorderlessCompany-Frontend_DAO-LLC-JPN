import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/utils/supabase";
import { Tables, Enums } from "@/types/schema";

export const useWhitelist = () => {
  const queryClient = useQueryClient();

  const useIsWhitelisted = (userId: string) =>
    useQuery({
      queryKey: ["whitelist", userId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from("WHITELIST")
          .select()
          .eq("user_id", userId);
        if (error) {
          throw new Error(error.message);
        }
        return data;
      },
    });

  return { useIsWhitelisted };
};
