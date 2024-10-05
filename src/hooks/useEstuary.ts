import { Estuary, Token } from "@/types";
import { camelizeDeeply, supabase } from "@/utils/supabase";
import { useQuery } from "@tanstack/react-query";

export const useEstuary = (id: string) => {
  const fetchTokens = async () => {
    const { data: estuaryRaw, error } = await supabase
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

    const { data: tokensRaw, error: tokensError } = await supabase
      .from("TOKEN")
      .select()
      .in(
        "id",
        estuaryTokenIds.map((idObject) => idObject.token_id)
      );
    if (tokensError) {
      throw tokensError;
    }
    // console.log("tokensRaw", tokensRaw);
    const tokens = camelizeDeeply(tokensRaw) as Token[];
    const estuary = camelizeDeeply(estuaryRaw) as Estuary;
    estuary.tokens = tokens;
    // console.log("estuary", estuary);
    return estuary;
  };

  const { data: estuary } = useQuery<Estuary, Error>({
    queryKey: ["estuary", id],
    queryFn: fetchTokens,
  });

  return estuary;
};
