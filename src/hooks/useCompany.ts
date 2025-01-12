import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/utils/supabase";
import { Tables } from "@/types/schema";
import { hasCompany } from "@/utils/api/company";

export type UpdateCompanyProps = Partial<Tables<"COMPANY">>;

export type UseCompanyProps = {
  id?: string;
};

export const useCompany = () => {
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

  const { mutateAsync: updateCompany } = useMutation<
    Tables<"COMPANY">,
    Error,
    UpdateCompanyProps
  >({
    mutationFn: async (props: UpdateCompanyProps) => {
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
  // const { data: company } = useQuery<Tables<"COMPANY"> | undefined, Error>({
  //   queryKey: ["company", id],
  //   queryFn: async () => {
  //     if (!id) return undefined;
  //     const response = await fetch(`/api/company?id=${id}`, {
  //       method: "GET",
  //       headers: { "Content-Type": "application/json" },
  //     });
  //     const json = await response.json();
  //     if (!response.ok) {
  //       throw new Error(json.error);
  //     }
  //     return json.data;
  //   },
  // });

  return { updateCompany, createCompany, isCreateCompanySuccess };
};

export const useCompanybyFounderId = (founderId: string) => {
  const { data: company, isLoading } = useQuery<
    Tables<"COMPANY"> | undefined,
    Error
  >({
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
  return { company, isLoading };
};
