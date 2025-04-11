import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tables } from "@/types/schema";

export type UpdateEstuaryProps = Partial<Tables<"ESTUARY">>;

export type EstuaryWithRelations = Tables<"ESTUARY"> & {
  tokens: Tables<"TOKEN">[];
  company: Tables<"COMPANY"> & {
    COMPANY_NAME: Tables<"COMPANY_NAME"> | null;
  };
};

export const useEstuary = (id?: string) => {
  const queryClient = useQueryClient();

  const { mutateAsync: updateEstuary, isSuccess: isEstuaryUpdated } =
    useMutation<Tables<"ESTUARY">, Error, UpdateEstuaryProps>({
      mutationFn: async (props: UpdateEstuaryProps) => {
        if (!id) {
          throw new Error("ID is required for update.");
        }
        const response = await fetch(`/api/estuary?id=${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
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

        const json = await response.json();
        if (!response.ok) {
          console.error(json.error);
          throw new Error(json.error);
        }
        console.log("[SUCCESS] Estuary updated: ", json.data);
        return json.data;
      },
      onError: (error) => {
        console.error("[ERROR] Failed to update estuary: ", error);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["estuary", id] });
      },
    });

  const { mutateAsync: createEstuary, isSuccess: isCreateEstuarySuccess } =
    useMutation<Tables<"ESTUARY">, Error, Partial<Tables<"ESTUARY">>>({
      mutationFn: async (props: Partial<Tables<"ESTUARY">>) => {
        const response = await fetch("/api/estuary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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

        const json = await response.json();
        if (!response.ok) {
          console.error("[ERROR] Failed to create estuary: ", json.error);
          throw new Error(json.error);
        }
        console.log("[SUCCESS] Estuary created: ", json.data);
        return json.data;
      },
      onError: (error) => {
        console.error("[ERROR] Failed to create estuary: ", error);
      },
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ["estuary", data.id] });
      },
    });

  const {
    data: estuary,
    isLoading,
    isError,
    refetch,
  } = useQuery<EstuaryWithRelations | undefined, Error>({
    queryKey: ["estuary", id],
    queryFn: async () => {
      if (!id) return undefined;

      const response = await fetch(`/api/estuary?id=${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error);
      }

      return json.data;
    },
  });

  return {
    updateEstuary,
    createEstuary,
    estuary,
    isEstuaryUpdated,
    isCreateEstuarySuccess,
    isLoading,
    isError,
    refetch,
  };
};
