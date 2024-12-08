import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/utils/supabase";
import { Tables, Enums } from "@/types/schema";

export type UpdateEstuaryProps = Partial<Tables<"ESTUARY">>;

export const useEstuary = (id?: string) => {
  const queryClient = useQueryClient();

  const { mutateAsync: updateEstuary } = useMutation<
    Tables<"ESTUARY">,
    Error,
    UpdateEstuaryProps
  >({
    mutationFn: async (props: UpdateEstuaryProps) => {
      if (!id) {
        throw new Error("ID is required for update.");
      }
      const response = await fetch(`/api/estuary?id=${props.id}`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          org_name: props.org_name,
          org_logo: props.org_logo,
          estuary_link: props.estuary_link,
          is_public: props.is_public,
          start_date: props.start_date,
          end_date: props.end_date,
          payment_methods: props.payment_methods,
          dao_id: props.dao_id,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        console.error(data.error);
        throw new Error(data.error);
      } else {
        console.log("[SUCCESS] Estuary updated: ", data.data);
      }

      return data.data;
    },
    onError: (error) => {
      console.error("[ERROR] Failed to update estuary: ", error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["estuary", id] });
    },
  });

  const { mutateAsync: createEstuary } = useMutation<
    Tables<"ESTUARY">,
    Error,
    Partial<Tables<"ESTUARY">>
  >({
    mutationFn: async (props: Partial<Tables<"ESTUARY">>) => {
      const response = await fetch('/api/estuary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: props.id,
          org_name: props.org_name,
          org_logo: props.org_logo,
          estuary_link: props.estuary_link,
          is_public: props.is_public,
          start_date: props.start_date,
          end_date: props.end_date,
          payment_methods: props.payment_methods,
          dao_id: props.dao_id,
        }),
      });
      
      const data = await response.json();
      if (!response.ok) {
        console.error('[ERROR] Failed to create estuary: ', data.error);
        throw new Error(data.error);
      } else {
        console.log("[SUCCESS] Estuary created: ", data.data);
      }

      return data.data;
    },
    onError: (error) => {
      console.error("[ERROR] Failed to create estuary: ", error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["estuary"] });
    },
  });

  const { data: estuary } = useQuery<
    Tables<"ESTUARY"> & { tokens: Tables<"TOKEN">[] } | undefined, 
    Error
  >({
    queryKey: ["estuary", id],
    queryFn: async () => {
      if (!id) return undefined;
      // TODO: read supabase
      const { data: estuary, error } = await supabase
        .from("ESTUARY")
        .select()
        .eq("id", id)
        .single();

      if (error) {
        throw error;
        }
      // TODO: read supabase
      const { data: tokens, error: tokensError } = await supabase
        .from("TOKEN")
        .select()
        .eq("estuary_id", id);

      if (tokensError) {
        throw tokensError;
      }

      return { ...estuary, tokens };
    },
  });

  return { updateEstuary, createEstuary, estuary };
};
