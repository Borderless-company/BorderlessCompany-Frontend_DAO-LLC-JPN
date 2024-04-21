"use client";
import type { NextPage } from "next";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

import { useRouter } from "next/router";
import { CreateMembershipToken } from "@/components/web3/MembershipTokenFactory/CreateMembershipToken";
import ListMembershipTokens from "@/components/web3/MembershipTokenFactory/ListMembershipTokens";
import { GetService } from "@/components/web3/BorderlessCompany/GetService";
import { useCallback, useEffect, useState } from "react";
import { Address } from "viem";
import { useGetService } from "@/components/hooks/useGetService";
import useMembershipTokens from "@/components/hooks/useMembershipTokens";
import ListMembershipTokenHolders from "@/components/web3/MembershipToken/ListMembershipTokenHolders";
import {
  Button,
  Chip,
  Input,
  Link,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";
import { useChainId, usePublicClient } from "wagmi";
import { getBlockExplorerUrl } from "@/utils/contractAddress";

const columns = [
  { name: "お名前", uid: "name" },
  // { name: "トークン名", uid: "tokenName" },
  { name: "トークンシンボル", uid: "symbol" },
  { name: "社員種別", uid: "sbt" },
  { name: "トークンID", uid: "id" },
  { name: "アカウント", uid: "holderAddress" },
];

type MembershipTokenHolder = {
  id: number;
  holderAddress: Address;
  name: string;
  tokenName: string;
  symbol: string;
  sbt: boolean;
};

interface Props {
  item: MembershipTokenHolder;
  columnKey: string | React.Key;
}

export const RenderCell = ({ item, columnKey }: Props) => {
  const [blockExplorerUrl, setBlockExplorerUrl] = useState<string>();
  const chainId = useChainId();
  const cellValue = item[columnKey as keyof MembershipTokenHolder];
  useEffect(() => {
    setBlockExplorerUrl(getBlockExplorerUrl(chainId));
  }, [chainId]);

  const [isEditing, setIsEditing] = useState(false);
  const [currentName, setCurrentName] = useState<string>(item.name);
  const [newName, setNewName] = useState<string>(item.name);

  const handleEdit = () => {
    setCurrentName(currentName);
    setIsEditing(true);
  };

  const handleSave = async () => {
    await changeMemberName(item.holderAddress, newName);
    setCurrentName(newName);
    setIsEditing(false);
  };
  const handleCancel = async () => {
    setNewName(currentName);
    setIsEditing(false);
  };

  const changeMemberName = async (holderAddress: Address, name: string) => {
    const res = await fetch(`/api/members/${holderAddress}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    return data.name;
  };

  switch (columnKey) {
    case "id":
      return <span>{cellValue}</span>;
    case "holderAddress":
      return (
        <div>
          <Link
            href={`${blockExplorerUrl}/address/${cellValue}`}
            target="_blank"
            className="text-sm"
            showAnchorIcon
          >
            {cellValue}
          </Link>
        </div>
      );
    case "symbol":
      return <span>{cellValue}</span>;
    case "tokenName":
      return <span>{cellValue}</span>;
    case "name":
      return isEditing ? (
        <div className="flex flex-col gap-2">
          <Input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            autoFocus
            label="お名前"
            placeholder="名前を入力"
          />
          <div className="flex gap-2">
            <Button size="sm" color="primary" onClick={handleSave}>
              確定
            </Button>
            <Button size="sm" onClick={handleCancel}>
              キャンセル
            </Button>
          </div>
        </div>
      ) : (
        <div className="px-2 min-w-[20px] cursor-pointer">
          <span>{currentName}</span>
          <Link
            onClick={handleEdit}
            isExternal
            showAnchorIcon
            className="text-xs"
          ></Link>
        </div>
      );
    case "sbt":
      return (
        <Chip size="sm" variant="flat" color={item.sbt ? "success" : "warning"}>
          <span className="text-xs font-semibold">
            {item.sbt ? "業務執行社員" : "非業務執行社員"}
          </span>
        </Chip>
      );
    default:
      return <span>{cellValue}</span>;
  }
};

const Members = ({ contractAddress }: { contractAddress: Address }) => {
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const [tokenHolders, setTokenHolders] = useState<any[]>([]);
  const [isPending, setIsPending] = useState<boolean>(true);
  const [startBlockNumber, setStartBlockNumber] = useState<number>();
  const [tableData, setTableData] = useState<any[]>([]);
  const {
    data: membershipTokenContractAddresses,
    isPending: isPendingMembershipTokens,
    error,
  } = useMembershipTokens({
    daoContractAddress: contractAddress,
  });

  const fetchLogs = useCallback(
    async (contracts: any[]) => {
      if (!isPending) return;
      if (!publicClient) {
        return;
      }
      let allTokenHolders: any[] = [];
      for (const contract of contracts) {
        const logs = await publicClient.getLogs({
          address: contract.tokenAddress,
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
          fromBlock: startBlockNumber
            ? BigInt(startBlockNumber)
            : BigInt(5700000),
          toBlock: "latest",
        });
        const _tokenHolders = new Set();
        logs.forEach((log, index) => {
          _tokenHolders.add({
            id: Number(log.args.tokenId),
            holderAddress: log.args.to,
            tokenName: contract.name,
            symbol: contract.symbol,
            sbt: contract.sbt,
          });
        });
        allTokenHolders = [...allTokenHolders, ...Array.from(_tokenHolders)];
      }
      setTokenHolders([...allTokenHolders]);
      setIsPending(false);
    },
    [isPending, publicClient, startBlockNumber]
  );

  useEffect(() => {
    if (isPendingMembershipTokens) return;
    fetchLogs(membershipTokenContractAddresses);
  }, [fetchLogs, isPendingMembershipTokens, membershipTokenContractAddresses]);

  useEffect(() => {
    console.log("token holders:", tokenHolders);
  }, [tokenHolders]);

  const getMemberInfo = async (holderAddress: Address) => {
    const res = await fetch(`/api/members/${holderAddress}`);
    const data = await res.json();
    return data;
  };

  useEffect(() => {
    if (isPending) return;
    const fetchData = async () => {
      let _tableData: any[] = [];
      for (const tokenHolder of tokenHolders) {
        const res = await getMemberInfo(tokenHolder.holderAddress);
        console.log(res);
        tokenHolder.name = res.name;
        _tableData.push(tokenHolder);
      }
      setTableData(_tableData);
      console.log(_tableData);
    };

    fetchData();
  }, [tokenHolders, isPending]);

  return (
    <>
      {isPending ? (
        <div className="w-full flex items-center justify-center min-h-[50px]">
          <Spinner />
        </div>
      ) : (
        <div className="w-full flex flex-col gap-4">
          <Table aria-label="MembershipTokenHolders">
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
            <TableBody items={tableData}>
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

export default Members;
