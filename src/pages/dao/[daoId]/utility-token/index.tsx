"use client";
import type { NextPage } from "next";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CreateUtilityToken } from "@/components/web3/MembershipTokenFactory/CreateUtilityToken";
import ListUtilityTokens from "@/components/web3/MembershipTokenFactory/ListUtilityTokens";

const UtilityToken: NextPage = () => {
  return (
    <DashboardLayout>
      <div className="h-full lg:px-6">
        <div className="flex flex-col justify-center w-full py-5 px-4 lg:px-0  max-w-[90rem] mx-auto gap-3">
          <div className="flex  flex-wrap justify-between">
            <h3 className="text-center text-xl font-semibold">
              ユーティリティトークン
            </h3>
          </div>
          <div className="w-full flex flex-col gap-4">
            <CreateUtilityToken />
          </div>
          <div className="w-full flex flex-col gap-4">
            <ListUtilityTokens />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UtilityToken;
