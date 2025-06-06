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

      const response = await fetch('/api/payment', {
        method: "PUT",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(props),
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error);
      }
      console.log("[SUCCESS] Payment updated: ", json.data);
      return json.data;
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

      const response = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(props),
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error);
      }
      console.log("[SUCCESS] Payment created: ", json.data);
      return json.data;
    },
    onError: (error) => {
      console.error("[ERROR] Failed to create payment: ", error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments", userId] });
    },
  });


  const getPayments = ({ userId, estId }: { userId: string; estId: string }) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useQuery<Tables<"PAYMENT">[] | undefined, Error>({
      queryKey: ["payments", userId, estId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from("PAYMENT")
          .select()
          .eq("user_id", userId)
          .eq("estuary_id", estId);
        if (error) {
          throw new Error(error.message);
        }
        return data;
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

  return { updatePayment, createPayment, payments, getPayments };
};

// Company IDによるPayment一覧取得フック
export const usePaymentByCompanyId = (companyId?: string) => {
  const {
    data: payments,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<
    (Tables<"PAYMENT"> & {
      estuary: Tables<"ESTUARY"> & {
        company: Tables<"COMPANY">;
      };
    })[]
  >({
    queryKey: ["payments", "company", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      
      const response = await fetch(`/api/payment/company/${companyId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || "Paymentの取得に失敗しました");
      }

      return json.data;
    },
    enabled: !!companyId,
  });

  return {
    payments: payments || [],
    isLoading,
    isError,
    error,
    refetch,
  };
};
