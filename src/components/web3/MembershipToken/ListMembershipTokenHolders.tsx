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
  Input,
  Button,
} from "@nextui-org/react";
import Image from "next/image";
import useMembershipTokenHolders from "@/components/hooks/useMembershipTokenHolders";

const columns = [
  { name: "TOKEN ID", uid: "id" },
  { name: "HOLDER ADDRESS", uid: "holderAddress" },
  { name: "NAME", uid: "name" },
];

type MembershipTokenHolder = {
  id: number;
  holderAddress: Address;
  name: string;
};

interface Props {
  item: MembershipTokenHolder;
  columnKey: string | React.Key;
}

export const RenderCell = ({ item, columnKey }: Props) => {
  const cellValue = item[columnKey as keyof MembershipTokenHolder];

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

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      await handleSave();
    }
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
      return <span>{cellValue}</span>;
    case "name":
      return isEditing ? (
        <div>
          <Input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            // onBlur={handleSave}
            // onKeyDown={handleKeyDown}
            autoFocus
            label="お名前"
            placeholder="名前を入力"
          />
          <Button size="sm" onClick={handleSave}>
            確定
          </Button>
          <Button size="sm" onClick={handleCancel}>
            キャンセル
          </Button>
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
    default:
      return <span>{cellValue}</span>;
  }
};

const ListMembershipTokenHolders = ({
  contractAddress,
}: {
  contractAddress: Address;
}) => {
  const [tableData, setTableData] = useState<any[]>([]);
  const { tokenHolders, isPending } = useMembershipTokenHolders({
    contractAddress,
    showAll: false,
  });

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
        <div className="flex justify-center min-h-[100px]">
          <Spinner size="lg" />
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

export default ListMembershipTokenHolders;
