"use client";
import type { NextPage } from "next";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MintToken } from "@/components/web3/UtilityToken/MintToken";

const UtilityTokenMint: NextPage = () => {
  return (
    <DashboardLayout>
      <div className="h-full lg:px-6">
        <div className="flex flex-col justify-center w-full py-5 px-4 lg:px-0  max-w-[90rem] mx-auto gap-3">
          <div className="flex  flex-wrap justify-between">
            <h3 className="text-center text-xl font-semibold">
              ユーティリティトークン生成
            </h3>
          </div>
          <div className="w-full flex flex-col gap-4">
            <MintToken />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UtilityTokenMint;
