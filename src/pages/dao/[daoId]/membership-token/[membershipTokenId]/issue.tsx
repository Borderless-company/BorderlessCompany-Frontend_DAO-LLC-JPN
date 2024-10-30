import type { NextPage } from "next";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { IssueToken } from "@/components/web3/MembershipToken/IssueToken";
import { useRouter } from "next/router";
import { Address } from "viem";

const MembershipTokenIssue: NextPage = () => {
  const { daoId, membershipTokenId, mintTo } = useRouter().query;
  return (
    <DashboardLayout>
      <div className="h-full lg:px-6">
        <div className="flex flex-col justify-center w-full py-5 px-4 lg:px-0  max-w-[90rem] mx-auto gap-3">
          <div className="flex  flex-wrap justify-between">
            <h3 className="text-center text-xl font-semibold">
              メンバーシップトークン生成
            </h3>
          </div>
          <div className="w-full flex flex-col gap-4">
            <IssueToken
              daoId={daoId as string}
              contractAddress={membershipTokenId as Address}
              mintTo={mintTo as Address}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MembershipTokenIssue;
