import React, { useState, useEffect, useCallback } from "react";
import { Address, formatUnits } from "viem";
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
import { UtilityTokenAbi } from "@/utils/abi/UtilityToken";

const columns = [
  { name: "HOLDER ADDRESS", uid: "holderAddress" },
  { name: "BALANCE", uid: "balance" },
];

type MembershipTokenHolder = {
  id: number;
  holderAddress: Address;
  balance: string;
};

interface Props {
  item: MembershipTokenHolder;
  columnKey: string | React.Key;
}

export const RenderCell = ({ item, columnKey }: Props) => {
  const cellValue = item[columnKey as keyof MembershipTokenHolder];
  switch (columnKey) {
    case "id":
      return <span>{cellValue}</span>;
    case "holderAddress":
      return <span>{cellValue}</span>;
    case "balance":
      return <span>{cellValue}</span>;
    default:
      return <span>{cellValue}</span>;
  }
};

const ListUtilityTokenHolders = () => {
  const router = useRouter();
  const { daoId, utilityTokenId } = router.query;
  const chainId = useChainId();
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [tokenHolders, setTokenHolders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [contractAddress, setContractAddress] = useState<Address>();
  const [startBlockNumber, setStartBlockNumber] = useState<number>();

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    if (!publicClient) {
      setIsLoading(false);
      return;
    }
    const logs = await publicClient.getLogs({
      address: contractAddress,
      // TODO: abiから取得
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
            name: "value",
            type: "uint256",
            indexed: false,
            internalType: "uint256",
          },
        ],
        anonymous: false,
      },
      fromBlock: startBlockNumber ? BigInt(startBlockNumber) : BigInt(5700000),
      toBlock: "latest",
    });

    const tokenHoldersSet = new Set();
    logs.forEach(async (log, index) => {
      tokenHoldersSet.add(log.args.to);
    });

    const tokenHolders: {
      id: number;
      holderAddress: Address;
      balance: string;
    }[] = [];

    const decimals = await publicClient.readContract({
      address: contractAddress as Address,
      abi: UtilityTokenAbi,
      functionName: "decimals",
    });

    const holderAddresses = Array.from(tokenHoldersSet);
    for (let index = 0; index < holderAddresses.length; index++) {
      const holderAddress = holderAddresses[index];
      const balance = await publicClient.readContract({
        address: contractAddress as Address,
        abi: UtilityTokenAbi,
        functionName: "balanceOf",
        args: [holderAddress as Address],
      });
      console.log("balance", balance);
      tokenHolders.push({
        id: index,
        holderAddress: holderAddress as Address,
        balance: formatUnits(balance, decimals),
      });
      console.log("tokenHolders", formatUnits(balance, decimals));
    }

    setTokenHolders(tokenHolders);
    setIsLoading(false);
  }, [contractAddress, publicClient, startBlockNumber]);

  useEffect(() => {
    setStartBlockNumber(getMembershipTokenFactoryStartBlockNumber(chainId));
  }, [chainId]);

  useEffect(() => {
    setContractAddress(utilityTokenId as Address);
  }, [utilityTokenId]);

  useEffect(() => {
    if (utilityTokenId && contractAddress && startBlockNumber) {
      console.log("start fetch");
      fetchLogs();
    }
  }, [fetchLogs, utilityTokenId, contractAddress, startBlockNumber]);

  return (
    <>
      {isLoading ? (
        <div className="flex justify-center min-h-[100px]">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="w-full flex flex-col gap-4">
          <Table aria-label="Example table with custom cells">
            <TableHeader columns={columns}>
              {(column) => (
                <TableColumn
                  key={column.uid}
                  hideHeader={column.uid === "actions"}
                  align={column.uid === "actions" ? "center" : "start"}
                >
                  {column.name}
                </TableColumn>
              )}
            </TableHeader>
            <TableBody items={tokenHolders}>
              {(item) => (
                <TableRow>
                  {(columnKey) => (
                    <TableCell>
                      <RenderCell item={item} columnKey={columnKey} />
                    </TableCell>
                  )}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
};

export default ListUtilityTokenHolders;
