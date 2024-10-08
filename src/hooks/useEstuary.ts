import { Estuary, Token } from "@/types";
import { camelizeDeeply, supabase } from "@/utils/supabase";
import { useQuery } from "@tanstack/react-query";
import { Tables } from "@/types/schema";

export const useEstuary = (id: string) => {
  const fetchTokens = async () => {
    const { data: estuary, error } = await supabase
      .from("ESTUARY")
      .select()
      .eq("id", id)
      .single();
    if (error) {
      throw error;
    }

    // console.log("estuaryRaw", estuaryRaw);

    const { data: estuaryTokenIds, error: estuaryTokenIdsError } =
      await supabase.from("ESTUARY_TOKENS").select().select("token_id");
    if (estuaryTokenIdsError) {
      throw estuaryTokenIdsError;
    }
    // console.log("estuaryTokenIds", estuaryTokenIds);

    const { data: tokens, error: tokensError } = await supabase
      .from("TOKEN")
      .select()
      .eq(
        "estuary_id",
        id
      );
    if (tokensError) {
      throw tokensError;
    }
    
    return {...estuary, tokens};
  };
  
  const { data: estuary } = useQuery<Tables<"ESTUARY"> & {tokens: Tables<"TOKEN">[]} | undefined, Error>({
    queryKey: ["estuary", id],
    queryFn: fetchTokens,
  });
  
  console.log("estuary DB:", estuary);
  return estuary;
};
