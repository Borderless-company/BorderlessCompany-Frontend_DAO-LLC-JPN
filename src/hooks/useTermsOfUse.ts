import { supabase } from "@/utils/supabase";
import { useQuery } from "@tanstack/react-query";

export const useTermsOfUse = () => {
  const { data: latest, error } = useQuery({
    queryKey: ["terms-of-use", "latest"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("TERMS_OF_USE")
        .select()
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      if (error) {
        throw new Error(error.message);
      }
      console.log("Terms of Use: ", data);
      return data;
    },
  });

  return { latest, error };
};
