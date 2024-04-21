import React, { useState, useEffect, useCallback } from "react";
import { Address, hexToString, stringToHex } from "viem";
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
  Chip,
  Button,
} from "@nextui-org/react";
import Image from "next/image";

const columns = [
  { name: "トークンシンボル", uid: "symbol" },
  { name: "トークン名", uid: "name" },
  { name: "トークンアドレス", uid: "tokenAddress" },
  { name: "トークン種別", uid: "sbt" },
  { name: "ACTIONS", uid: "actions" },
];

type MembershipToken = {
  id: number;
  tokenAddress: Address;
  name: string;
  symbol: string;
  sbt: boolean;
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
      // TODO: Symbolがhex?で出てくるので修正する
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
    case "sbt":
      return (
        <Chip
          size="sm"
          variant="flat"
          color={cellValue ? "success" : "warning"}
        >
          <span className="text-xs font-semibold">
            {cellValue ? "業務執行社員トークン" : "非業務執行社員トークン"}
          </span>
        </Chip>
      );
    case "actions":
      return (
        <div className="relative flex items-center gap-2">
          <Button
            href={`/dao/${daoId}/membership-token/${item.tokenAddress}`}
            as={Link}
            color="primary"
            size="sm"
            className="text-sm"
          >
            詳細
          </Button>
          <Button
            href={`/dao/${daoId}/membership-token/${item.tokenAddress}/issue`}
            as={Link}
            color="secondary"
            size="sm"
            className="text-sm"
          >
            発行
          </Button>
        </div>
      );
    default:
      return <span>{cellValue}</span>;
  }
};

const ListMembershipTokensFromEvent = ({
  contractAddress,
}: {
  contractAddress: Address;
}) => {
  const router = useRouter();
  const { daoId } = router.query;
  const chainId = useChainId();
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [tokens, setTokens] = useState<any[]>([]);
  const [startBlockNumber, setStartBlockNumber] = useState<number>();

  // TODO: getServiceでTokenServiceを取得
  useEffect(() => {
    setStartBlockNumber(getMembershipTokenFactoryStartBlockNumber(chainId));
  }, [chainId]);

  const fetchLogs = useCallback(async () => {
    if (!publicClient) return;
    const logs = await publicClient.getLogs({
      address: contractAddress,
      // TODO: abiから取得
      event: {
        type: "event",
        name: "NewNonFungibleToken721",
        inputs: [
          {
            name: "token_",
            type: "address",
            indexed: true,
            internalType: "address",
          },
          {
            name: "symbol_",
            type: "string",
            indexed: true,
            internalType: "string",
          },
          {
            name: "name_",
            type: "string",
            indexed: false,
            internalType: "string",
          },
          {
            name: "sbt_",
            type: "bool",
            indexed: false,
            internalType: "bool",
          },
        ],
        anonymous: false,
      },
      fromBlock: startBlockNumber ? BigInt(startBlockNumber) : undefined,
      toBlock: "latest",
    });

    const tokens = logs.map((log, index) => ({
      id: index,
      tokenAddress: log.args.token_,
      name: log.args.name_,
      symbol: log.args.symbol_,
      sbt: log.args.sbt_,
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

export default ListMembershipTokensFromEvent;
