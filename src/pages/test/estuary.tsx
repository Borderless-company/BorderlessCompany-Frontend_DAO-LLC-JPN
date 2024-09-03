"use client";
import type { NextPage } from "next";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { IssueToken } from "@/components/web3/MembershipToken/IssueToken";
import { useRouter } from "next/router";
import { Address } from "viem";
import WalletLogin from "@/components/wallet/WalletLogin";
import { useAccount } from "wagmi";
const EstuaryTest: NextPage = () => {
  const { daoId, membershipTokenId } = useRouter().query;
  const { address } = useAccount();
  
  return (
      <div className="w-full h-[640px] max-w-[520px] rounded-[32px] bg-white shadow-xl">
        <div className="w-14 h-14 rounded-lg bg-gray-300"/>
          <WalletLogin />
          {address || "No address here"}
      </div>
  );
};

export default EstuaryTest;
