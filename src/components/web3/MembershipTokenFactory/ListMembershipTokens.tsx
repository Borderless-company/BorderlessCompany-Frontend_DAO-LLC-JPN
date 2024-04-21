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
} from "@nextui-org/react";
import Image from "next/image";

const columns = [
  { name: "SYMBOL", uid: "symbol" },
  { name: "NAME", uid: "name" },
  { name: "TOKEN ADDRESS", uid: "tokenAddress" },
  { name: "ACTIONS", uid: "actions" },
];

type MembershipToken = {
  id: number;
  tokenAddress: Address;
  name: string;
  symbol: string;
};

interface Props {
  item: MembershipToken;
  columnKey: string | React.Key;
}

export const RenderCell = ({ item, columnKey }: Props) => {
  const router = useRouter();
  const { daoId } = router.query;
  const chainId = useChainId();
  const [blockExplorerUrl, setBlockExplorerUrl] = useState<string>();
  useEffect(() => {
    setBlockExplorerUrl(getBlockExplorerUrl(chainId));
  }, [chainId]);
  const cellValue = item[columnKey as keyof MembershipToken];
  switch (columnKey) {
    case "name":
      return <span>{cellValue}</span>;
    case "symbol":
      return <span>{cellValue}</span>;
    case "tokenAddress":
      return (
        <div>
          <Link
            href={`${blockExplorerUrl}/address/${cellValue}`}
            target="_blank"
            className="text-sm"
          >
            {cellValue}
          </Link>
        </div>
      );
    case "actions":
      return (
        <div className="relative flex items-center gap-2">
          <Link
            href={`/dao/${daoId}/membership-token/${item.tokenAddress}`}
            className="text-sm"
          >
            詳細
          </Link>
          <Link
            href={`/dao/${daoId}/membership-token/${item.tokenAddress}/issue`}
            className="text-sm"
          >
            発行
          </Link>
        </div>
      );
    default:
      return <span>{cellValue}</span>;
  }
};

const ListMembershipTokens = () => {
  const router = useRouter();
  const { daoId } = router.query;
  const chainId = useChainId();
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [tokens, setTokens] = useState<any[]>([]);
  const [contractAddress, setContractAddress] = useState<Address>();
  const [startBlockNumber, setStartBlockNumber] = useState<number>();

  // TODO: getServiceでTokenServiceを取得
  useEffect(() => {
    setContractAddress(getMembershipTokenFactoryContractAddress(chainId));
    setStartBlockNumber(getMembershipTokenFactoryStartBlockNumber(chainId));
  }, [chainId]);

  const fetchLogs = useCallback(async () => {
    if (!publicClient) return;
    const logs = await publicClient.getLogs({
      address: contractAddress,
      // TODO: abiから取得
      event: {
        type: "event",
        name: "TokenCreated",
        inputs: [
          {
            name: "tokenAddress_",
            type: "address",
            indexed: true,
            internalType: "address",
          },
          {
            name: "name_",
            type: "string",
            indexed: false,
            internalType: "string",
          },
          {
            name: "symbol_",
            type: "string",
            indexed: false,
            internalType: "string",
          },
        ],
        anonymous: false,
      },
      fromBlock: startBlockNumber ? BigInt(startBlockNumber) : undefined,
      toBlock: "latest",
    });
    const tokens = logs.map((log, index) => ({
      id: index,
      tokenAddress: log.args.tokenAddress_,
      name: log.args.name_,
      symbol: log.args.symbol_,
    }));
    setTokens(tokens);
  }, [contractAddress, publicClient, startBlockNumber]);

  useEffect(() => {
    if (daoId && contractAddress && startBlockNumber) {
      fetchLogs();
    }
  }, [fetchLogs, daoId, contractAddress, startBlockNumber]);

  return (
    <div className=" w-full flex flex-col gap-4">
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
        <TableBody items={tokens}>
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
  );
};

export default ListMembershipTokens;
