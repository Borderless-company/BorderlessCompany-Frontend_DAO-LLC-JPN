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
      const response = await fetch('/api/dao', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...props, address }),
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error);
      }
      console.log("[SUCCESS] DAO updated: ", json.data);
      return json.data;
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
      const response = await fetch('/api/dao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(props),
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error);
      }
      console.log("[SUCCESS] DAO created: ", json.data);
      return json.data;
    },
    onError: (error) => {
      console.error("[ERROR] Failed to create DAO: ", error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dao", address] });
    },
  });

  // リード系は直接Supabase
  const { data: dao } = useQuery<Tables<"DAO"> | undefined, Error>({
    queryKey: ["dao", address],
    queryFn: async () => {
      if (!address) return undefined;
      // TODO: read supabase
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

  const _getDAObyWalletAddress = async (address: string) => {
    const { data, error } = await supabase
      .from("DAO")
      .select()
      .eq("established_by", address)
      .single();
    if (error) {
      throw new Error(error.message);
    }
    return data;
  };
  
  const getDAObyWalletAddress = (address: string) =>
    useQuery<Tables<"DAO"> | undefined, Error>({
      queryKey: ["daoByWallet", address],
      queryFn: () => _getDAObyWalletAddress(address),
    });

  return { updateDAO, createDAO, dao, getDAObyWalletAddress };
};
