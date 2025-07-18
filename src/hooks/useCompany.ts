import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/utils/supabase";
import { Tables } from "@/types/schema";
import { hasCompany } from "@/utils/api/company";

export type UpdateCompanyProps = Partial<Tables<"COMPANY">>;

export type CompanyWithRelations = Tables<"COMPANY"> & {
  COMPANY_NAME: Tables<"COMPANY_NAME"> | null;
};

export const useCompany = (id?: string) => {
  const queryClient = useQueryClient();

  const { mutateAsync: createCompany, isSuccess: isCreateCompanySuccess } =
    useMutation<Tables<"COMPANY">, Error, Partial<Tables<"COMPANY">>>({
      mutationFn: async (props: Partial<Tables<"COMPANY">>) => {
        if (!props.founder_id) {
          throw new Error("founder_id is required");
        }
        const response = await fetch("/api/company", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(props),
        });
        const json = await response.json();
        if (!response.ok) {
          throw new Error(json.error);
        }
        console.log("[SUCCESS] Company created: ", json.data);
        return json.data;
      },
      onError: (error) => {
        console.error("[ERROR] Failed to create Company: ", error);
      },
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ["company", data.id] });
      },
    });

  const { mutateAsync: updateCompany, isSuccess: isCompanyUpdated } =
    useMutation<Tables<"COMPANY">, Error, UpdateCompanyProps>({
      mutationFn: async (props: UpdateCompanyProps) => {
        console.log("updateCompany props", props);
        const response = await fetch("/api/company", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...props }),
        });
        const json = await response.json();
        if (!response.ok) {
          throw new Error(json.error);
        }
        console.log("[SUCCESS] Company updated: ", json.data);
        return json.data;
      },
      onError: (error) => {
        console.error("[ERROR] Failed to update Company: ", error);
      },
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ["company", data.id] });
      },
    });

  const {
    data: company,
    isLoading,
    isError,
    refetch,
  } = useQuery<CompanyWithRelations | undefined, Error>({
    queryKey: ["company", id],
    queryFn: async () => {
      if (!id) return undefined;
      const response = await fetch(`/api/company?id=${id}`, {
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
    updateCompany,
    createCompany,
    isCreateCompanySuccess,
    isError,
    isCompanyUpdated,
    company,
    isLoading,
    refetch,
  };
};

export const useCompanybyFounderId = (founderId: string) => {
  const {
    data: company,
    isLoading,
    isError,
  } = useQuery<CompanyWithRelations | undefined, Error>({
    queryKey: ["companyByFounderId", founderId && founderId],
    queryFn: async () => {
      if (!founderId) return undefined;
      const response = await fetch(`/api/company?founder_id=${founderId}`, {
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
  return { company, isLoading, isError };
};
