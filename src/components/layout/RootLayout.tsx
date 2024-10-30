import { useDAO } from "@/hooks/useDAO";
import { FC, useEffect } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { Tables } from "@/types/schema";

export const RootLayout: FC<{ children: React.ReactNode }> = ({ children }) => {
  const { address } = useAccount();
  const { getDAObyWalletAddress } = useDAO();
  const router = useRouter();
  const { data: establishedDAO } = getDAObyWalletAddress(address as string);

  useEffect(() => {
    console.log("address: ", address);
    console.log("establishedDAO: ", establishedDAO);
    if (router.pathname.startsWith("/estuary")) {
      return;
    }
    if (!address) {
      router.push("/");
    }
    if (establishedDAO && router.pathname === "/") {
      router.push(`/dao/${establishedDAO.address}`);
    } else if (address && !establishedDAO && router.pathname === "/") {
      router.push("/dao/register");
    }
  }, [address, establishedDAO, router]);
  return <>{children}</>;
};
