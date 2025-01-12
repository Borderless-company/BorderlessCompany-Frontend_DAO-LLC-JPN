import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/utils/supabase";
import { Tables, Enums } from "@/types/schema";

export const useWhitelist = () => {
  const useIsWhitelisted = (userId: string) =>
    useQuery({
      queryKey: ["whitelist", userId && userId],
      queryFn: async () => {
        if (!userId) return;
        const { data, error } = await supabase
          .from("WHITELIST")
          .select()
          .eq("user_id", userId);
        if (error) {
          console.error("Supabase error details:", error);
          throw new Error(error.message);
        }

        return data.length !== 0;
      },
    });

  return { useIsWhitelisted };
};
