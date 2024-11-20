import React, { useState, useEffect, useCallback } from "react";
import { Address } from "viem";
import { usePublicClient } from "wagmi";
import { TokenServiceAbi } from "@/utils/abi/TokenService.sol/TokenService";
import { useGetService } from "@/components/hooks/useGetService";

const useMembershipTokens = ({
  daoContractAddress,
}: {
  daoContractAddress: Address;
}) => {
  const publicClient = usePublicClient();
  const [membershipTokenContracts, setMembershipTokenContracts] = useState<
    any[]
  >([]);
  const {
    data: tokenServiceContractAddress,
    error,
    isPending: isPendingUseService,
  } = useGetService(daoContractAddress, 3);
  const [isPending, setIsPending] = useState(true);

  const fetchLogs = useCallback(async () => {
    if (!publicClient) return;
    if (!tokenServiceContractAddress) return;
    const lastIndex = await publicClient.readContract({
      address: tokenServiceContractAddress,
      abi: TokenServiceAbi,
      functionName: "getLastIndexStandard721Token",
    });
    console.log("lastIndex: ", lastIndex);

    let logs: any[] = [];

    for (let i = 1; i <= lastIndex; i++) {
      const log = await publicClient.readContract({
        address: tokenServiceContractAddress,
        abi: TokenServiceAbi,
        functionName: "getInfoStandard721token",
        args: [BigInt(i)],
      });
      console.log("log: ", log);
      logs.push(log);
    }

    const tmp = logs.map((log, index) => ({
      id: index,
      tokenAddress: log[0],
      name: log[1],
      symbol: log[2],
      sbt: log[3],
    }));
    setMembershipTokenContracts(tmp);
    setIsPending(false);
    console.log("tmp: ", tmp);
    return tmp;
  }, [tokenServiceContractAddress, publicClient]);

  useEffect(() => {
    if (!isPendingUseService) {
      fetchLogs();
    }
  }, [fetchLogs, isPendingUseService]);

  return { data: membershipTokenContracts, error, isPending, fetchLogs };
};

export default useMembershipTokens;
