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
  Spinner,
} from "@nextui-org/react";
import Image from "next/image";
import { NonFungibleTokenTYPE721Abi } from "@/utils/abi/NonFungibleTokenTYPE721.sol/NonFungibleTokenTYPE721";
import { TokenServiceAbi } from "@/utils/abi/TokenService.sol/TokenService";
import useMembershipTokens from "@/components/hooks/useMembershipTokens";

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

const ListMembershipTokens = ({
  contractAddress,
}: {
  contractAddress: Address;
}) => {
  const { data, isPending, error } = useMembershipTokens({
    daoContractAddress: contractAddress,
  });

  return (
    <>
      {isPending ? (
        <div className="flex justify-center min-h-[100px]">
          <Spinner size="lg" />
        </div>
      ) : (
        <Table aria-label="ListMembershipTokens">
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
          <TableBody items={data}>
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
      )}
    </>
  );
};

export default ListMembershipTokens;
