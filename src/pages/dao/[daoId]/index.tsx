"use client";
import type { NextPage } from "next";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

import dynamic from "next/dynamic";
import { TableWrapper } from "@/components/table/table";
import { CardBalance } from "@/components/home/CardBalance";
import { CardTransactions } from "@/components/home/CardTransactions";
import { useRouter } from "next/router";
import { Address } from "viem";
import Members from "@/components/Members";
import ListMembershipTokens from "@/components/web3/MembershipTokenFactory/ListMembershipTokens";
import { useCallback, useEffect, useState } from "react";
import { Footer } from "@/components/Footer";
import { Link } from "@nextui-org/react";
import { getBlockExplorerUrl } from "@/utils/contractAddress";
import { useChainId } from "wagmi";
import UpdateCompanyForm from "@/components/UpdateCompanyForm";

const Chart = dynamic(
  () => import("@/components/charts/pie").then((mod) => mod.Pie),
  {
    ssr: false,
  }
);

const Dashboard: NextPage = () => {
  const router = useRouter();
  const { daoId } = router.query;
  const [isReady, setIsReady] = useState(false);
  const [blockExplorerUrl, setBlockExplorerUrl] = useState<string>();
  const chainId = useChainId();
  const [companyInfo, setCompanyInfo] = useState<any>({});

  const getCompanyInfo = useCallback(async (contractAddress: string) => {
    const res = await fetch(`/api/companies/${contractAddress}`);
    const data = await res.json();
    setCompanyInfo(data);
  }, []);

  useEffect(() => {
    setBlockExplorerUrl(getBlockExplorerUrl(chainId));
  }, [chainId]);

  useEffect(() => {
    setIsReady(router.isReady);
    if (!daoId) return;
    getCompanyInfo(daoId as string);
  }, [getCompanyInfo, router.isReady, daoId]);

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
                  <div>
                    <UpdateCompanyForm daoId={daoId as string} />
                  </div>
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
              <div className="grid grid-flow-row-dense grid-cols-12 mt-6 gap-6 w-full">
                <div className="col-span-12 lg:col-span-7">
                  {/* Chart */}
                  <div className="flex flex-col h-full gap-2">
                    <h3 className="text-xl font-semibold"></h3>
                    <div className="w-full bg-default-50 shadow-lg rounded-2xl p-6">
                      <Chart />
                    </div>
                  </div>
                </div>
                <div className="col-span-12 lg:col-span-5">
                  {/* Card Section */}
                  <div className="flex flex-col gap-2">
                    <h3 className="text-xl font-semibold"></h3>
                    <div className="flex flex-col">
                      <CardBalance />
                    </div>
                  </div>
                </div>
              </div>

              {/* Members */}
              <div className="flex flex-col justify-center w-full py-5 px-4 lg:px-0  max-w-[90rem] mx-auto gap-3">
                <div className="flex  flex-wrap justify-between">
                  <h3 className="text-center text-xl font-semibold">
                    メンバーシップトークン
                  </h3>
                </div>
                <ListMembershipTokens contractAddress={daoId as Address} />
              </div>

              {/* Members */}
              <div className="flex flex-col justify-center w-full py-5 px-4 lg:px-0  max-w-[90rem] mx-auto gap-3">
                <div className="flex  flex-wrap justify-between">
                  <h3 className="text-center text-xl font-semibold">
                    メンバー
                  </h3>
                </div>
                <Members contractAddress={daoId as Address} />
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
