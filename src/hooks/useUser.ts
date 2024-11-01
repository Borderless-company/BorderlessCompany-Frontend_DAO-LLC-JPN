import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, camelizeDeeply } from "@/utils/supabase";
import { User } from "@/types";
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
        const { data, error } = await supabase
          .from("USER")
          .update({
            evm_address: props.evm_address,
            name: props.name,
            furigana: props.furigana,
            address: props.address,
            kyc_status: props.kyc_status as Enums<"KycStatus">,
            email: props.email,
          })
          .eq("evm_address", evmAddress!)
          .select();

        if (error) {
          throw new Error(error.message);
        }
        console.log("[SUCCESS] User updated: ", data);
        return data[0];
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
      const { data, error } = await supabase
        .from("USER")
        .upsert({
          evm_address: props.evm_address,
          name: props.name,
          furigana: props.furigana,
          address: props.address,
          kyc_status: props.kyc_status as Enums<"KycStatus">,
          email: props.email,
        })
        .select();

      if (error) {
        throw new Error(error.message);
      }
      console.log("[SUCCESS] User created: ", data);
      return data[0];
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
