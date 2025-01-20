"use client";
import type { NextPage } from "next";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useRouter } from "next/router";
import Link from "next/link";
import { Button } from "@heroui/react";
import { Address } from "viem";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export const getServerSideProps = async ({ locale }: { locale: string }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
};

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
            {/* TODO: ホルダー一覧を作る */}
          </div>

          <div className="flex  flex-wrap justify-between">
            <h3 className="text-center text-xl font-semibold">移動履歴</h3>
          </div>
          <div className="w-full flex flex-col gap-4">
            {/* TODO: トークンの移転履歴などを作る */}
          </div>

          <div>
            <Button
              type="submit"
              color="primary"
              size="md"
              as={Link}
              href={`/dao/${daoId}/membership-token/${membershipTokenId}/issue`}
            >
              トークンを発行する →
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MembershipTokenDetail;
