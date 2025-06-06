import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tables } from "@/types/schema";

export type UpdateUserProps = Partial<Tables<"USER">>;

export type UseUserProps = {
  evmAddress?: string;
};

export const useUser = (evmAddress?: string) => {
  const queryClient = useQueryClient();

  const { mutateAsync: updateUser } = useMutation<
    Tables<"USER">,
    Error,
    UpdateUserProps
  >({
    mutationFn: async (props: UpdateUserProps) => {
      const response = await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...props,
          evm_address: evmAddress || props.evm_address,
        }),
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error);
      }
      console.log("[SUCCESS] User updated: ", json.data);
      return json.data;
    },
    onError: (error) => {
      console.error("[ERROR] Failed to update user: ", error);
    },
    onSuccess: (_, props) => {
      queryClient.invalidateQueries({
        queryKey: ["user", props.evm_address],
      });
    },
  });

  const { mutateAsync: createUser } = useMutation<
    Tables<"USER">,
    Error,
    Partial<Tables<"USER">>
  >({
    mutationFn: async (props: Partial<Tables<"USER">>) => {
      const response = await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(props),
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error);
      }
      console.log("[SUCCESS] User created: ", json.data);
      return json.data;
    },
    onError: (error) => {
      console.error("[ERROR] Failed to create user: ", error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", evmAddress] });
    },
  });

  const { data: user, isLoading } = useQuery<Tables<"USER"> | undefined, Error>(
    {
      queryKey: ["user", evmAddress],
      queryFn: async () => {
        if (!evmAddress) return undefined;

        // evmAddressが指定されている場合はクエリパラメータとして追加
        const url = evmAddress
          ? `/api/user?evm_address=${evmAddress}`
          : "/api/user";

        const response = await fetch(url, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (!response.ok) {
          if (response.status === 404) {
            return undefined; // ユーザーが見つからない場合はundefinedを返す
          }
          const json = await response.json();
          throw new Error(json.error);
        }

        const json = await response.json();
        return json.data;
      },
      enabled: !!evmAddress,
    }
  );

  const deleteUser = async (evmAddress: string) => {
    const response = await fetch("/api/user", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        evm_address: evmAddress,
      }),
    });

    if (!response.ok) {
      throw new Error("ユーザーの削除に失敗しました");
    }

    const data = await response.json();
    return data;
  };

  // 他のユーザーの情報を取得する関数（非同期）
  const getUserByAddress = async (
    targetEvmAddress: string
  ): Promise<Tables<"USER"> | null> => {
    try {
      const response = await fetch(
        `/api/user?evm_address=${targetEvmAddress}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          return null; // ユーザーが見つからない場合はnullを返す
        }
        const json = await response.json();
        throw new Error(json.error);
      }

      const json = await response.json();
      return json.data;
    } catch (error) {
      console.error("Failed to get user by address:", error);
      return null;
    }
  };

  return {
    updateUser,
    createUser,
    user,
    isLoading,
    deleteUser,
    getUserByAddress,
  };
};
