import { FC, useEffect } from "react";
import { useRouter } from "next/router";
import { useMe } from "@/hooks/useMe";
import { useSignOut } from "@/hooks/useSignOut";
import { useActiveAccount } from "thirdweb/react";
import { useUser } from "@/hooks/useUser";

const initialPages = ["/login", "/estuary/[estId]"];

export const RootLayout: FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const smartAccount = useActiveAccount();
  const { me, isLoading: isMeLoading } = useMe();
  const { signOut } = useSignOut();
  const { user, isLoading: isLoadingUser } = useUser(
    smartAccount?.address || ""
  );

  useEffect(() => {
    if (initialPages.includes(router.pathname)) {
      return;
    }
    if (user?.status === "preSignUp" || !user?.status) {
      router.push(`/login`);
    }
    console.log("smartAccount: ", smartAccount);
    if (!isMeLoading && !me) {
      console.log("logout-me: ", me);
      console.log("logout-address: ", smartAccount);
      signOut();
    }
  }, [me, smartAccount, router, isMeLoading, user, isLoadingUser]);

  return <>{children}</>;
};
