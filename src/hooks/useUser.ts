import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, camelizeDeeply } from "@/utils/supabase";
import { User } from "@/types";

export type UpdateUserProps = Partial<User>;

export type UseUserProps = {
  evmAddress?: string;
};

export const useUser = (evmAddress?: string) => {
  const queryClient = useQueryClient();

  const { mutateAsync: updateUser } = useMutation<User, Error, UpdateUserProps>(
    {
      mutationFn: async (props: UpdateUserProps) => {
        const { data, error } = await supabase
          .from("USER")
          .update({
            id: props.id,
            evm_address: props.evmAddress,
            name: props.name,
            furigana: props.furigana,
            address: props.address,
            kyc_status: props.kycStatus,
            payment_link: props.paymentLink,
            payment_status: props.paymentStatus,
            price: props.price,
            date_of_employment: props.dateOfEmployment,
          })
          .eq("evm_address", evmAddress)
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
    }
  );

  const { mutateAsync: createUser } = useMutation<User, Error, Partial<User>>({
    mutationFn: async (props: Partial<User>) => {
      const { data, error } = await supabase
        .from("USER")
        .insert({
          evm_address: props.evmAddress,
          name: props.name,
          furigana: props.furigana,
          address: props.address,
          kyc_status: props.kycStatus,
          payment_link: props.paymentLink,
          payment_status: props.paymentStatus,
          price: props.price,
          date_of_employment: props.dateOfEmployment,
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

  const { data: userData } = useQuery<any, Error>({
    queryKey: ["user", evmAddress],
    queryFn: async () => {
      if (!evmAddress) return;
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

  const user = camelizeDeeply(userData) as User;
  return { updateUser, createUser, user };
};
