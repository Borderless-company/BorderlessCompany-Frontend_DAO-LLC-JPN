import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/utils/supabase";
import { Enums, Tables } from "@/types/schema";

export type UpdateUserProps = Partial<Tables<"USER">>;

export type UseUserProps = {
  evmAddress?: string;
};

export const useUser = (evmAddress?: string) => {
  const queryClient = useQueryClient();

  const { mutateAsync: updateUser } = useMutation<
    Tables<"USER">,
    Error,
    UpdateUserProps
  >({
    mutationFn: async (props: UpdateUserProps) => {

      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...props, evm_address: evmAddress }),
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error);
      }
      console.log("[SUCCESS] User updated: ", json.data);
      return json.data;
    },
    onError: (error) => {
      console.error("[ERROR] Failed to update user: ", error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", evmAddress] });
    },
  });

  const { mutateAsync: createUser } = useMutation<
    Tables<"USER">,
    Error,
    Partial<Tables<"USER">>
  >({
    mutationFn: async (props: Partial<Tables<"USER">>) => {
      const response = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(props),
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error);
      }
      console.log("[SUCCESS] User created: ", json.data);
      return json.data;
    },
    onError: (error) => {
      console.error("[ERROR] Failed to create user: ", error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", evmAddress] });
    },
  });

  const { data: user} = useQuery<Tables<"USER"> | undefined, Error>({
    queryKey: ["user", evmAddress],
    queryFn: async () => {
      if (!evmAddress) return undefined;
      const { data, error } = await supabase
        .from("USER")
        .select()
        .eq("evm_address", evmAddress)
        .single();
      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
  });
  
  return { updateUser, createUser, user };
};
