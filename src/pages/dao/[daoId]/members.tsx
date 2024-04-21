"use client";
import type { NextPage } from "next";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

import dynamic from "next/dynamic";
import { TableWrapper } from "@/components/table/table";
import { CardBalance } from "@/components/home/CardBalance";
import { CardTransactions } from "@/components/home/CardTransactions";
import { useRouter } from "next/router";
import { Address } from "viem";
import useMembershipTokens from "@/components/hooks/useMembershipTokens";

const Members: NextPage = () => {
  const router = useRouter();
  const { daoId } = router.query;
  const { data, isPending, error } = useMembershipTokens({
    daoContractAddress: daoId as Address,
  });
  return (
    <DashboardLayout>
      <div className="h-full lg:px-6">
        <div className="flex flex-col justify-center w-full py-5 px-4 lg:px-0  max-w-[90rem] mx-auto gap-3">
          <div className="flex  flex-wrap justify-between">
            <h3 className="text-center text-xl font-semibold">メンバー一覧</h3>
          </div>
          <TableWrapper />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Members;
