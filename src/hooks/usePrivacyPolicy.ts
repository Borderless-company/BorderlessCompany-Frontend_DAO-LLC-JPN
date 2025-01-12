import { supabase } from "@/utils/supabase";
import { useQuery } from "@tanstack/react-query";

export const usePrivacyPolicy = () => {
  const { data: latest, error } = useQuery({
    queryKey: ["privacy-policy", "latest"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("PRIVACY_POLICY")
        .select()
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      if (error) {
        throw new Error(error.message);
      }
      console.log("Privacy Policy: ", data);
      return data;
    },
  });

  return { latest, error };
};
