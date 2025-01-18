import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/utils/supabase";
import { Tables } from "@/types/schema";

export type UpdateMemberProps = Partial<Tables<"MEMBER">>;
export type UseMemberProps = {
  userId?: string;
  daoId?: string;
};

export const useMember = ({ userId, daoId }: UseMemberProps) => {
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["member", userId, daoId] });
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
        queryKey: ["member", props.user_id, props.company_id],
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
  });

  const { data: member } = useQuery<
    (Tables<"MEMBER"> & { token: Tables<"TOKEN"> }) | undefined,
    Error
  >({
    queryKey: ["member", userId, daoId],
    queryFn: async () => {
      if (!userId || !daoId) return undefined;
      const { data: member, error: memberError } = await supabase
        .from("MEMBER")
        .select()
        .eq("user_id", userId)
        .eq("dao_id", daoId)
        .single();
      if (memberError) {
        throw new Error(memberError.message);
      }

      const { data: token, error: tokenError } = await supabase
        .from("TOKEN")
        .select()
        .eq("id", member?.token_id!)
        .single();
      if (tokenError) {
        throw new Error(tokenError.message);
      }
      return { ...member, token };
    },
  });

  const getMembers = ({
    daoId,
    userId,
  }: {
    daoId?: string;
    userId?: string;
  }) => {
    if (daoId) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      return useQuery({
        queryKey: ["members", daoId],
        queryFn: async () => {
          const { data, error } = await supabase
            .from("MEMBER")
            .select(`*, USER (*), TOKEN (*)`)
            .eq("dao_id", daoId);
          if (error) {
            throw new Error(error.message);
          }
          return data;
        },
      });
    } else if (userId) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      return useQuery({
        queryKey: ["members", userId],
        queryFn: async () => {
          const { data, error } = await supabase
            .from("MEMBER")
            .select(`*, USER (*), TOKEN (*)`)
            .eq("user_id", userId);
          if (error) {
            throw new Error(error.message);
          }
          return data;
        },
      });
    } else if (userId && daoId) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      return useQuery({
        queryKey: ["members", userId, daoId],
        queryFn: async () => {
          const { data, error } = await supabase
            .from("MEMBER")
            .select(`*, USER (*), TOKEN (*)`)
            .eq("user_id", userId)
            .eq("dao_id", daoId);
          if (error) {
            throw new Error(error.message);
          }
          return data;
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
        const { data, error } = await supabase
          .from("MEMBER")
          .select(`*, USER (*), TOKEN (*)`)
          .eq("dao_id", daoId);
        if (error) {
          throw new Error(error.message);
        }
        return data;
      },
    });

  return {
    updateMember,
    createMember,
    deleteMember,
    member,
    getMembers,
    getMembersByDaoId,
  };
};

export const useMembersByCompanyId = (companyId?: string) => {
  const {
    data: members,
    isLoading: isLoadingMembers,
    error: membersError,
  } = useQuery({
    queryKey: ["members", companyId],
    queryFn: async () => {
      if (!companyId) return undefined;
      const { data, error } = await supabase
        .from("MEMBER")
        .select(`*, USER (*), TOKEN (*)`)
        .eq("company_id", companyId);
      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
  });

  return { members, isLoadingMembers, membersError };
};
