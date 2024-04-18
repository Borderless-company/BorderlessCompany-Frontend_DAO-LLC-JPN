"use client";
import type { NextPage } from "next";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

import dynamic from "next/dynamic";
import { TableWrapper } from "@/components/table/table";
import { CardBalance } from "@/components/home/CardBalance";
import { CardTransactions } from "@/components/home/CardTransactions";
import { useRouter } from "next/router";
import { CurrentAddressCallAdmin } from "@/components/web3/BorderlessCompany/CurrentAddressCallAdmin";
import { Address } from "viem";

const Chart = dynamic(
  () => import("@/components/charts/pie").then((mod) => mod.Pie),
  {
    ssr: false,
  }
);

const Members: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  return (
    <DashboardLayout>
      <div className="h-full lg:px-6">
        {/* Table */}
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
