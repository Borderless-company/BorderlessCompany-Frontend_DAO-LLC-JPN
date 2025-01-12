import { useDAO } from "@/hooks/useDAO";
import { FC, useEffect } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { Tables } from "@/types/schema";
import { useMe } from "@/hooks/useMe";
import { useSignOut } from "@/hooks/useSignOut";

const initialPages = ["/login"];

export const RootLayout: FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const { address } = useAccount();
  const { me } = useMe();
  const { signOut } = useSignOut();
  // const { getDAObyWalletAddress } = useDAO();
  // const { data: establishedDAO } = getDAObyWalletAddress(address as string);
  // const establishedDAO = undefined;

  useEffect(() => {
    if (initialPages.includes(router.pathname)) {
      return;
    }
    if (!address) {
      console.log("me: ", me);
      console.log("address: ", address);
      signOut();
    }
  }, [me, address]);

  // useEffect(() => {
  //   console.log("address: ", address);
  //   console.log("establishedDAO: ", establishedDAO);
  //   if (process.env.NEXT_PUBLIC_ENV === "test") {
  //     return;
  //   }
  //   if (router.pathname.startsWith("/estuary")) {
  //     return;
  //   }
  //   if (!address) {
  //     router.push("/");
  //   }
  //   if (establishedDAO && initialPages.includes(router.pathname)) {
  //     router.push(`/dao/${establishedDAO.address}`);
  //   } else if (
  //     address &&
  //     !establishedDAO &&
  //     initialPages.includes(router.pathname)
  //   ) {
  //     router.push("/dao/register");
  //   }
  // }, [address, establishedDAO]);
  return <>{children}</>;
};
