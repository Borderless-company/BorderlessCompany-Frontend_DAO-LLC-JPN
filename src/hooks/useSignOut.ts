import { useRouter } from "next/router";
import { useActiveWallet, useDisconnect } from "thirdweb/react";
import { useMe } from "./useMe";

export const useSignOut = () => {
  const router = useRouter();
  const smartWallet = useActiveWallet();
  const { disconnect } = useDisconnect();
  const { refetch } = useMe();

  const signOut = async () => {
    try {
      if (smartWallet) {
        disconnect(smartWallet);
      }
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      await refetch();
      router.push("/login");
    } catch (e) {
      throw new Error("Failed to sign out");
    }
  };

  return { signOut };
};
