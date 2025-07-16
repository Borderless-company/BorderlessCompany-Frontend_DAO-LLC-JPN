import { useRouter } from "next/router";
import { useActiveWallet, useDisconnect } from "thirdweb/react";
import { useQueryClient } from "@tanstack/react-query";
import { useMe } from "./useMe";

export const useSignOut = () => {
  const router = useRouter();
  const smartWallet = useActiveWallet();
  const { disconnect } = useDisconnect();
  const { refetch } = useMe();
  const queryClient = useQueryClient();

  const signOut = async () => {
    try {
      if (smartWallet) {
        disconnect(smartWallet);
      }
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      // TanStack Queryのキャッシュを無効化
      queryClient.invalidateQueries({ queryKey: ["me"] });
      queryClient.clear();
      await refetch();
      // estuaryページの場合は/loginに遷移しない
      if (!router.pathname.includes("/estuary")) {
        router.push("/login");
      }
    } catch (e) {
      throw new Error("Failed to sign out");
    }
  };

  return { signOut };
};
