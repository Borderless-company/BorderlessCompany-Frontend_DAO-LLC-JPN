import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tables } from "@/types/schema";

export type UpdateCompanyNameProps = Partial<Tables<"COMPANY_NAME">>;

export const useCompanyName = (id?: string) => {
  const queryClient = useQueryClient();

  const {
    mutateAsync: createCompanyName,
    isSuccess: isCreateCompanyNameSuccess,
  } = useMutation<
    Tables<"COMPANY_NAME">,
    Error,
    Partial<Tables<"COMPANY_NAME">>
  >({
    mutationFn: async (props: Partial<Tables<"COMPANY_NAME">>) => {
      const response = await fetch("/api/company-name", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(props),
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error);
      }
      console.log("[SUCCESS] Company name created: ", json.data);
      return json.data;
    },
    onError: (error) => {
      console.error("[ERROR] Failed to create Company name: ", error);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["companyName", data.id] });
    },
  });

  const { mutateAsync: updateCompanyName, isSuccess: isCompanyNameUpdated } =
    useMutation<Tables<"COMPANY_NAME">, Error, UpdateCompanyNameProps>({
      mutationFn: async (props: UpdateCompanyNameProps) => {
        const response = await fetch("/api/company-name", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...props }),
        });
        const json = await response.json();
        if (!response.ok) {
          throw new Error(json.error);
        }
        console.log("[SUCCESS] Company name updated: ", json.data);
        return json.data;
      },
      onError: (error) => {
        console.error("[ERROR] Failed to update Company name: ", error);
      },
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ["companyName", data.id] });
      },
    });

  const {
    data: companyName,
    isLoading,
    isError,
  } = useQuery<Tables<"COMPANY_NAME"> | undefined, Error>({
    queryKey: ["companyName", id],
    queryFn: async () => {
      if (!id) return undefined;
      const response = await fetch(`/api/company-name?id=${id}`, {
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
    updateCompanyName,
    createCompanyName,
    isCreateCompanyNameSuccess,
    isError,
    isCompanyNameUpdated,
    companyName,
    isLoading,
  };
};
