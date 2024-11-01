import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/utils/supabase";
import { Tables, Enums } from "@/types/schema";

export type UpdatePaymentProps = Partial<Tables<"PAYMENT">>;

export type UsePaymentProps = {
  userId?: string;
};

export const usePayment = (userId?: string) => {
  const queryClient = useQueryClient();

  const { mutateAsync: updatePayment } = useMutation<
    Tables<"PAYMENT">,
    Error,
    UpdatePaymentProps
  >({
    mutationFn: async (props: UpdatePaymentProps) => {
      const { data, error } = await supabase
        .from("PAYMENT")
        .update({
          estuary_id: props.estuary_id,
          payment_link: props.payment_link,
          payment_status: props.payment_status as Enums<"PaymentStatus">,
          price: props.price,
          user_id: props.user_id,
        })
        .eq("user_id", props.user_id!)
        .select();

      if (error) {
        throw new Error(error.message);
      }
      console.log("[SUCCESS] Payment updated: ", data);
      return data[0];
    },
    onError: (error) => {
      console.error("[ERROR] Failed to update payment: ", error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments", userId] });
    },
  });

  const { mutateAsync: createPayment } = useMutation<
    Tables<"PAYMENT">,
    Error,
    Partial<Tables<"PAYMENT">>
  >({
    mutationFn: async (props: Partial<Tables<"PAYMENT">>) => {
      const { data, error } = await supabase
        .from("PAYMENT")
        .upsert({
          estuary_id: props.estuary_id,
          payment_link: props.payment_link,
          payment_status: props.payment_status as Enums<"PaymentStatus">,
          price: props.price,
          user_id: props.user_id,
        })
        .eq("user_id", props.user_id!) 
        .eq("estuary_id", props.estuary_id!)
        .select();

      if (error) {
        throw new Error(error.message);
      }
      console.log("[SUCCESS] Payment created: ", data);
      return data[0];
    },
    onError: (error) => {
      console.error("[ERROR] Failed to create payment: ", error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments", userId] });
    },
  });

  const { data: payments } = useQuery<Tables<"PAYMENT">[] | undefined, Error>({
    queryKey: ["payments", userId],
    queryFn: async () => {
      if (!userId) return undefined;
      const { data, error } = await supabase
        .from("PAYMENT")
        .select()
        .eq("user_id", userId);
      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
  });

  return { updatePayment, createPayment, payments };
};
