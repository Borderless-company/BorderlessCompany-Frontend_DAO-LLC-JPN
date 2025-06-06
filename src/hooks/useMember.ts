import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/utils/supabase";
import { Tables } from "@/types/schema";

export type UpdateMemberProps = Partial<Tables<"MEMBER">>;
export type UseMemberProps = {
  userId?: string;
  daoId?: string;
};

// MemberWithRelationsの型を定義
export type MemberWithRelations = Tables<"MEMBER"> & {
  USER: Tables<"USER">;
  TOKEN: Tables<"TOKEN"> | null;
};

export const useMember = () => {
  const queryClient = useQueryClient();

  const { mutateAsync: updateMember } = useMutation<
    Tables<"MEMBER">,
    Error,
    UpdateMemberProps
  >({
    mutationFn: async (props: UpdateMemberProps) => {
      const response = await fetch("/api/member", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(props),
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error);
      }
      console.log("[SUCCESS] Member updated: ", json.data);
      return json.data;
    },
    onError: (error) => {
      console.error("[ERROR] Failed to update member: ", error);
    },
    onSuccess: (data, props) => {
      queryClient.invalidateQueries({ queryKey: ["member", props.user_id] });
      queryClient.invalidateQueries({
        queryKey: ["members", props.company_id],
      });
    },
  });

  const { mutateAsync: createMember } = useMutation<
    Tables<"MEMBER">,
    Error,
    Partial<Tables<"MEMBER">>
  >({
    mutationFn: async (props: Partial<Tables<"MEMBER">>) => {
      const response = await fetch("/api/member", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(props),
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error);
      }
      console.log("[SUCCESS] Member created: ", json.data);
      return json.data;
    },
    onError: (error) => {
      console.error("[ERROR] Failed to create member: ", error);
    },
    onSuccess: (_, props) => {
      queryClient.invalidateQueries({
        queryKey: ["member", props.user_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["members", props.company_id],
      });
    },
  });

  const { mutateAsync: deleteMember } = useMutation<
    void,
    Error,
    { user_id: string; company_id: string }
  >({
    mutationFn: async ({ user_id, company_id }) => {
      const response = await fetch(
        `/api/member?user_id=${user_id}&company_id=${company_id}`,
        {
          method: "DELETE",
        }
      );
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error);
      }
      console.log("[SUCCESS] Member deleted");
    },
    onError: (error) => {
      console.error("[ERROR] Failed to delete member: ", error);
    },
    onSuccess: (_, props) => {
      queryClient.invalidateQueries({
        queryKey: ["members", props.company_id],
      });
    },
  });

  const getMembers = ({
    daoId,
    userId,
  }: {
    daoId?: string;
    userId?: string;
  }) => {
    if (daoId && !userId) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      return useQuery({
        queryKey: ["members", daoId],
        queryFn: async () => {
          const response = await fetch(`/api/member?companyId=${daoId}`, {
            method: "GET",
          });
          const json = await response.json();
          if (!response.ok) {
            throw new Error(json.error);
          }
          return json.data;
        },
      });
    } else if (userId && !daoId) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      return useQuery({
        queryKey: ["members", userId],
        queryFn: async () => {
          const response = await fetch(`/api/member?userId=${userId}`, {
            method: "GET",
          });
          const json = await response.json();
          if (!response.ok) {
            throw new Error(json.error);
          }
          return json.data;
        },
      });
    } else if (userId && daoId) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      return useQuery({
        queryKey: ["members", userId, daoId],
        queryFn: async () => {
          const response = await fetch(
            `/api/member?userId=${userId}&companyId=${daoId}`,
            {
              method: "GET",
            }
          );
          const json = await response.json();
          if (!response.ok) {
            throw new Error(json.error);
          }
          return json.data;
        },
      });
    } else {
      return undefined;
    }
  };

  const getMembersByDaoId = ({ daoId }: { daoId: string }) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useQuery({
      queryKey: ["members", daoId],
      queryFn: async () => {
        const response = await fetch(`/api/member?companyId=${daoId}`, {
          method: "GET",
        });
        const json = await response.json();
        if (!response.ok) {
          throw new Error(json.error);
        }
        return json.data;
      },
    });

  return {
    updateMember,
    createMember,
    deleteMember,
    getMembers,
    getMembersByDaoId,
  };
};

export const useMembersByCompanyId = (companyId?: string) => {
  const {
    data: members,
    isLoading: isLoadingMembers,
    error: membersError,
    refetch,
  } = useQuery<MemberWithRelations[], Error>({
    queryKey: ["members", companyId],
    queryFn: async () => {
      if (!companyId) return [];

      const response = await fetch(`/api/member?companyId=${companyId}`, {
        method: "GET",
      });
      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error);
      }

      return json.data;
    },
    enabled: !!companyId,
  });

  return { members, isLoadingMembers, membersError, refetch };
};

export const useIsCompanyMember = (companyId?: string, userId?: string) => {
  const {
    data: isMember,
    isLoading,
    error,
  } = useQuery<boolean, Error>({
    queryKey: ["isMember", companyId, userId],
    queryFn: async () => {
      if (!companyId || !userId) return false;

      const response = await fetch(
        `/api/member?userId=${userId}&companyId=${companyId}`,
        {
          method: "GET",
        }
      );
      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error);
      }

      console.log("[SUCCESS] isMember: ", json.data);
      return Array.isArray(json.data) ? json.data.length > 0 : !!json.data;
    },
    enabled: !!companyId && !!userId,
  });

  return { isMember: isMember ?? false, isLoading, error };
};
