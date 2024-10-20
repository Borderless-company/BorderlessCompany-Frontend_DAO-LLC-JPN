import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/utils/supabase";
import { Tables, Enums } from "@/types/schema";

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
      const { data, error } = await supabase
        .from("MEMBER")
        .update({
          dao_id: props.dao_id,
          date_of_employment: props.date_of_employment,
          is_admin: props.is_admin,
          is_executive: props.is_executive,
          "token_id": props.token_id
        })
        .eq("user_id", userId!)
        .eq("dao_id", daoId!)
        .select();

      if (error) {
        throw new Error(error.message);
      }
      console.log("[SUCCESS] Member updated: ", data);
      return data[0];
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
      const { data, error } = await supabase
        .from("MEMBER")
        .insert({
          user_id: props.user_id,
          dao_id: props.dao_id,
          date_of_employment: props.date_of_employment,
          is_admin: props.is_admin,
          is_executive: props.is_executive,
          token_id: props.token_id
        })
        .select();

      if (error) {
        throw new Error(error.message);
      }
      console.log("[SUCCESS] Member created: ", data);
      return data[0];
    },
    onError: (error) => {
      console.error("[ERROR] Failed to create member: ", error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["member", userId, daoId] });
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

  return { updateMember, createMember, member };
};
