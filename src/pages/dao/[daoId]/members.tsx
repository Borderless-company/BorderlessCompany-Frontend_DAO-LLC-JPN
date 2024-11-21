"use client";
import type { GetServerSideProps, NextPage } from "next";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

import { useRouter } from "next/router";
import { CreateMembershipToken } from "@/components/web3/MembershipTokenFactory/CreateMembershipToken";
import ListMembershipTokens from "@/components/web3/MembershipTokenFactory/ListMembershipTokens";
import { GetService } from "@/components/web3/BorderlessCompany/GetService";
import { useEffect, useState } from "react";
import { Address } from "viem";

import MemberList from "@/components/members/MemberList";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "ja", ["common"])),
    },
  };
};

const MembersPage: NextPage = () => {
  const router = useRouter();
  const { daoId } = router.query;
  const [isReady, setIsReady] = useState<boolean>(false);
  const { t } = useTranslation("common");

  useEffect(() => {
    setIsReady(router.isReady);
  }, [router.isReady]);

  return (
    <>
      <DashboardLayout>
        <div className="h-full lg:px-6">
          <div className="flex flex-col justify-center w-full py-5 px-4 lg:px-0 max-w-[90rem] mx-auto gap-8">
            <div className="flex flex-col justify-center w-full mx-auto gap-4">
              <div className="flex flex-wrap justify-between">
                <h3 className="text-center text-xl font-semibold">
                  {t("Members")}
                </h3>
              </div>
              <div className="w-full flex flex-col gap-4">
                <MemberList contractAddress={daoId as Address} />
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
};

export default MembersPage;
