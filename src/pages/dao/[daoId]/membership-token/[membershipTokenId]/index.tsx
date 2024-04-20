"use client";
import type { NextPage } from "next";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useRouter } from "next/router";
import Link from "next/link";
import ListMembershipTokenHolders from "@/components/web3/MembershipToken/ListMembershipTokenHolders";
import ListMembershipTokenHistory from "@/components/web3/MembershipToken/ListMembershipTokenHistory";
import { Button } from "@nextui-org/react";

const MembershipTokenDetail: NextPage = () => {
  const { daoId, membershipTokenId } = useRouter().query;
  return (
    <DashboardLayout>
      <div className="h-full lg:px-6">
        <div className="flex flex-col justify-center w-full py-5 px-4 lg:px-0  max-w-[90rem] mx-auto gap-3">
          <div className="flex  flex-wrap justify-between">
            <h3 className="text-center text-xl font-semibold">所有者一覧</h3>
          </div>
          <div className="w-full flex flex-col gap-4">
            <ListMembershipTokenHolders />
          </div>

          <div className="flex  flex-wrap justify-between">
            <h3 className="text-center text-xl font-semibold">移動履歴</h3>
          </div>
          <div className="w-full flex flex-col gap-4">
            <ListMembershipTokenHistory />
          </div>

          <div>
            <Button>
              <Link
                href={`/dao/${daoId}/membership-token/${membershipTokenId}/issue`}
              >
                トークンを発行する
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MembershipTokenDetail;
