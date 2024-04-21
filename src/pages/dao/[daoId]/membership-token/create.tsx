"use client";
import type { NextPage } from "next";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

import { useRouter } from "next/router";
import { CreateMembershipToken } from "@/components/web3/MembershipTokenFactory/CreateMembershipToken";
import ListMembershipTokens from "@/components/web3/MembershipTokenFactory/ListMembershipTokens";
import { Address } from "viem";

const MembershipTokenCreate: NextPage = () => {
  const router = useRouter();
  const { daoId } = router.query;
  return (
    <DashboardLayout>
      <div className="h-full lg:px-6">
        <div className="flex flex-col justify-center w-full py-5 px-4 lg:px-0  max-w-[90rem] mx-auto gap-3">
          <div className="flex  flex-wrap justify-between">
            <h3 className="text-center text-xl font-semibold">
              メンバーシップトークン作成
            </h3>
          </div>
          <div className="w-full flex flex-col gap-4">
            <CreateMembershipToken contractAddress={daoId as Address} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MembershipTokenCreate;
