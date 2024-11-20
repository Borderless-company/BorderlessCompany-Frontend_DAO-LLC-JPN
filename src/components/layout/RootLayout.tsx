import { useDAO } from "@/hooks/useDAO";
import { FC, useEffect } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { Tables } from "@/types/schema";
import { useActiveAccount } from "thirdweb/react";

const initialPages = ["/dao/register", "/login"];

export const RootLayout: FC<{ children: React.ReactNode }> = ({ children }) => {
  // const { address } = useAccount();
  const account = useActiveAccount();
  const { getDAObyWalletAddress } = useDAO();
  const router = useRouter();
  const { data: establishedDAO } = getDAObyWalletAddress(
    account?.address as string
  );
  useEffect(() => {
    console.log("address: ", account?.address);
    console.log("establishedDAO: ", establishedDAO);
    if (router.pathname.startsWith("/estuary")) {
      return;
    }
    console.log("account?.address: ", account?.address);
    if (!account?.address) {
      router.push("/login");
    }
    if (establishedDAO && initialPages.includes(router.pathname)) {
      router.push(`/dao/${establishedDAO.address}`);
    } else if (
      account?.address &&
      !establishedDAO &&
      initialPages.includes(router.pathname)
    ) {
      router.push("/dao/register");
    }
  }, [account?.address, establishedDAO]);
  return <>{children}</>;
};
