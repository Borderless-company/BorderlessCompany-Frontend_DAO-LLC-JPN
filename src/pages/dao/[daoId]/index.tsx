"use client";
import type { NextPage } from "next";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { Footer } from "@/components/Footer";
import { Button, Link } from "@heroui/react";
import { getBlockExplorerUrl } from "@/utils/contractAddress";
import { useChainId } from "wagmi";
import { supabase } from "@/utils/supabase";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import MemberList from "@/components/members/MemberList";

export const getServerSideProps = async ({ locale }: { locale: string }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
};

const Dashboard: NextPage = () => {
  const router = useRouter();
  const { daoId } = router.query;
  const [isReady, setIsReady] = useState(false);
  const [blockExplorerUrl, setBlockExplorerUrl] = useState<string>();
  const chainId = useChainId();
  const [companyInfo, setCompanyInfo] = useState<any>({});
  const { t, i18n } = useTranslation("common");

  useEffect(() => {
    setBlockExplorerUrl(getBlockExplorerUrl(chainId));
  }, [chainId]);

  useEffect(() => {
    setIsReady(router.isReady);
    if (!daoId) return;
  }, [router.isReady, daoId]);

  return (
    <>
      {!isReady || !companyInfo ? (
        <></>
      ) : (
        <DashboardLayout>
          <div className="h-full lg:px-6">
            <div className="flex flex-col justify-center gap-4 xl:gap-6 py-5 pt-3 px-4 lg:px-0 sm:pt-10 max-w-[90rem] mx-auto w-full">
              {/* Company */}
              <div className="flex flex-col justify-center w-full px-4 lg:px-0  max-w-[90rem] mx-auto gap-3">
                <div className="flex flex-col items-start">
                  <h3 className="text-center text-2xl font-bold">
                    {companyInfo.daoName}
                  </h3>
                  <Link
                    href={`${blockExplorerUrl}/address/${daoId as string}`}
                    target="_blank"
                    className="text-center text-sm text-default-600 font-semibold"
                    showAnchorIcon
                  >
                    {daoId as string}
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <Footer />
        </DashboardLayout>
      )}
    </>
  );
};

export default Dashboard;
