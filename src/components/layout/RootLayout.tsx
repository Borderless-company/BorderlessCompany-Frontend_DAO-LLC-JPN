import { FC, useEffect } from "react";
import { useRouter } from "next/router";
import { useMe } from "@/hooks/useMe";
import { useSignOut } from "@/hooks/useSignOut";
import { useActiveAccount } from "thirdweb/react";

const initialPages = ["/login", "/estuary/[estId]"];

export const RootLayout: FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const smartAccount = useActiveAccount();
  const { me, isLoading: isMeLoading } = useMe();
  const { signOut } = useSignOut();

  useEffect(() => {
    if (initialPages.includes(router.pathname)) {
      return;
    }
    console.log("smartAccount: ", smartAccount);
    if (!isMeLoading && !me) {
      console.log("logout-me: ", me);
      console.log("logout-address: ", smartAccount);
      signOut();
    }
  }, [me, smartAccount, router, isMeLoading]);

  return <>{children}</>;
};
