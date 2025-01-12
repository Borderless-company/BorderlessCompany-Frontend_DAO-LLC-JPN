import { useRouter } from "next/router";
import { useDisconnect } from "wagmi";
import { useMe } from "./useMe";

export const useSignOut = () => {
  const router = useRouter();
  const { disconnect } = useDisconnect();
  const { refetch } = useMe();

  const signOut = async () => {
    try {
      await disconnect();
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
