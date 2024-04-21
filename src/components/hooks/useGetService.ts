import { useAccount, usePublicClient, useReadContract } from "wagmi";
import { BorderlessCompanyAbi } from "@/utils/abi/BorderlessCompany.sol/BorderlessCompany";
import { Address } from "viem";
import { useState, useEffect } from "react";

// TODO: 今は管理者しか触らないのでOnlyAdminだけ実行できる
export function useGetService(contractAddress: Address, serviceIndex: number) {
  const { address } = useAccount();
  const { data, error, isPending } = useReadContract({
    address: contractAddress as Address,
    abi: BorderlessCompanyAbi,
    functionName: "getService",
    args: [BigInt(serviceIndex)],
    account: address,
  });

  return { data, error, isPending };
}
