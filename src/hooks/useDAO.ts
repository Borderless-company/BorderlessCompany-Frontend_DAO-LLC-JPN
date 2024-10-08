import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/utils/supabase";
import { Tables, Enums } from "@/types/schema";

export type UpdateDAOProps = Partial<Tables<"DAO">>;

export type UseDAOProps = {
  address?: string;
};

export const useDAO = (address?: string) => {
  const queryClient = useQueryClient();

  const { mutateAsync: updateDAO } = useMutation<
    Tables<"DAO">,
    Error,
    UpdateDAOProps
  >({
    mutationFn: async (props: UpdateDAOProps) => {
      const { data, error } = await supabase
        .from("DAO")
        .update({
          company_id: props.company_id,
          company_name: props.company_name,
          dao_name: props.dao_name,
          dao_icon: props.dao_icon,
          establishment_date: props.establishment_date,
        })
        .eq("address", address!)
        .select();

      if (error) {
        throw new Error(error.message);
      }
      console.log("[SUCCESS] DAO updated: ", data);
      return data[0];
    },
    onError: (error) => {
      console.error("[ERROR] Failed to update DAO: ", error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dao", address] });
    },
  });

  const { mutateAsync: createDAO } = useMutation<
    Tables<"DAO">,
    Error,
    Partial<Tables<"DAO">>
  >({
    mutationFn: async (props: Partial<Tables<"DAO">>) => {
      const { data, error } = await supabase
        .from("DAO")
        .upsert({
          address: props.address!,
          company_id: props.company_id,
          company_name: props.company_name,
          dao_name: props.dao_name,
          dao_icon: props.dao_icon,
          establishment_date: props.establishment_date,
        })
        .select();

      if (error) {
        throw new Error(error.message);
      }
      console.log("[SUCCESS] DAO created: ", data);
      return data[0];
    },
    onError: (error) => {
      console.error("[ERROR] Failed to create DAO: ", error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dao", address] });
    },
  });

  const { data: dao } = useQuery<Tables<"DAO"> | undefined, Error>({
    queryKey: ["dao", address],
    queryFn: async () => {
      if (!address) return undefined;
      const { data, error } = await supabase
        .from("DAO")
        .select()
        .eq("address", address)
        .single();
      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
  });

  return { updateDAO, createDAO, dao };
};
