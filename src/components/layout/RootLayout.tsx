import { FC, useEffect } from "react";
import { useRouter } from "next/router";
import { useMe } from "@/hooks/useMe";
import { useSignOut } from "@/hooks/useSignOut";
import { useActiveAccount } from "thirdweb/react";

const initialPages = ["/login", "/estuary/[estId]"];

export const RootLayout: FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const smartAccount = useActiveAccount();
  const { me } = useMe();
  const { signOut } = useSignOut();

  useEffect(() => {
    console.log("initialPages: ", router.pathname);
    if (initialPages.includes(router.pathname)) {
      return;
    }
    if (!smartAccount) {
      console.log("me: ", me);
      console.log("address: ", smartAccount);
      signOut();
    }
  }, [me, smartAccount, router]);

  return <>{children}</>;
};
