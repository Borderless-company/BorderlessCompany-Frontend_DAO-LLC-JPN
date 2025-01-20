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
} from "@heroui/react";
import Image from "next/image";

// const columns = [
//   { name: "TOKEN ID", uid: "id" },
//   { name: "HOLDER ADDRESS", uid: "holderAddress" },
// ];

const columns = [
  { name: "INDEX", uid: "id" },
  { name: "FROM", uid: "from" },
  { name: "TO", uid: "to" },
  { name: "AMOUNT", uid: "value" },
];

type MembershipTokenHolder = {
  id: number;
  from: Address;
  to: Address;
  value: number;
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
    case "from":
      return <span>{cellValue}</span>;
    case "to":
      return <span>{cellValue}</span>;
    case "value":
      return <span>{cellValue}</span>;
    default:
      return <span>{cellValue}</span>;
  }
};

const ListUtilityTokenHistory = () => {
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

    console.log("logs:", logs);

    // TODO: 同じオーナーが複数のNFTを持てるので、一個だけ表示すべきか、全て表示すべきか決めたい.
    // const tokenHolders = new Set();
    // logs.forEach((log, index) => {
    //   console.log("log", log);
    //   tokenHolders.add({
    //     id: Number(log.args.tokenId),
    //     holderAddress: log.args.to,
    //   });
    // });
    // setTokenHolders(Array.from(tokenHolders));
    const tokens = logs.map((log, index) => ({
      id: index,
      from: log.args.from,
      to: log.args.to,
      value: Number(log.args.value),
    }));

    setTokenHolders(tokens);
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

export default ListUtilityTokenHistory;
