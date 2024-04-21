"use client";
import type { NextPage } from "next";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

import { useRouter } from "next/router";
import { CreateMembershipToken } from "@/components/web3/MembershipTokenFactory/CreateMembershipToken";
import ListMembershipTokens from "@/components/web3/MembershipTokenFactory/ListMembershipTokens";
import { GetService } from "@/components/web3/BorderlessCompany/GetService";
import { useEffect, useState } from "react";
import { Address } from "viem";
import { useGetService } from "@/components/hooks/useGetService";
import useMembershipTokens from "@/components/hooks/useMembershipTokens";
import ListMembershipTokenHolders from "@/components/web3/MembershipToken/ListMembershipTokenHolders";
import Members from "@/components/Members";

const MembersPage: NextPage = () => {
  const router = useRouter();
  const { daoId } = router.query;
  const [isReady, setIsReady] = useState<boolean>(false);
  const {
    data: membershipTokenContractAddresses,
    isPending,
    error,
  } = useMembershipTokens({
    daoContractAddress: daoId as Address,
  });

  useEffect(() => {
    setIsReady(router.isReady);
  }, [router.isReady]);

  return (
    <>
      {!isReady || isPending ? (
        <></>
      ) : (
        <DashboardLayout>
          <div className="h-full lg:px-6">
            <div className="flex flex-col justify-center w-full py-5 px-4 lg:px-0 max-w-[90rem] mx-auto gap-8">
              <div className="flex flex-col justify-center w-full mx-auto gap-4">
                <div className="flex flex-wrap justify-between">
                  <h3 className="text-center text-xl font-semibold">
                    メンバー一覧
                  </h3>
                </div>
                <div className="w-full flex flex-col gap-4">
                  <Members contractAddress={daoId as Address} />
                </div>
              </div>
            </div>
          </div>
        </DashboardLayout>
      )}
    </>
  );
};

export default MembersPage;
