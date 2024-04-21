import React, { useState, useEffect, useCallback } from "react";
import { Address } from "viem";
import { useAccount, useChainId, usePublicClient } from "wagmi";
import router, { useRouter } from "next/router";
import {
  getBlockExplorerUrl,
  getMembershipTokenFactoryContractAddress,
  getMembershipTokenFactoryStartBlockNumber,
} from "@/utils/contractAddress";
import {
  Card,
  CardHeader,
  CardBody,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Link,
  Tooltip,
  Spinner,
} from "@nextui-org/react";
import Image from "next/image";

const useMembershipTokenHolders = ({
  contractAddress,
}: {
  contractAddress: Address;
}) => {
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const [tokenHolders, setTokenHolders] = useState<any[]>([]);
  const [isPending, setIsPending] = useState<boolean>(true);
  const [startBlockNumber, setStartBlockNumber] = useState<number>();

  const fetchLogs = useCallback(async () => {
    setIsPending(true);
    if (!publicClient) {
      return;
    }
    const logs = await publicClient.getLogs({
      address: contractAddress,
      event: {
        type: "event",
        name: "Transfer",
        inputs: [
          {
            name: "from",
            type: "address",
            indexed: true,
            internalType: "address",
          },
          {
            name: "to",
            type: "address",
            indexed: true,
            internalType: "address",
          },
          {
            name: "tokenId",
            type: "uint256",
            indexed: true,
            internalType: "uint256",
          },
        ],
        anonymous: false,
      },
      fromBlock: startBlockNumber ? BigInt(startBlockNumber) : BigInt(5700000),
      toBlock: "latest",
    });

    const tokenHolders = new Set();
    logs.forEach((log, index) => {
      console.log("log", log);
      tokenHolders.add({
        id: Number(log.args.tokenId),
        holderAddress: log.args.to,
      });
    });

    setTokenHolders(Array.from(tokenHolders));
    setIsPending(false);
  }, [contractAddress, publicClient, startBlockNumber]);

  useEffect(() => {
    setStartBlockNumber(getMembershipTokenFactoryStartBlockNumber(chainId));
  }, [chainId]);

  useEffect(() => {
    if (contractAddress && startBlockNumber) {
      fetchLogs();
    }
  }, [fetchLogs, contractAddress, startBlockNumber]);

  return { tokenHolders, isPending };
};

export default useMembershipTokenHolders;
