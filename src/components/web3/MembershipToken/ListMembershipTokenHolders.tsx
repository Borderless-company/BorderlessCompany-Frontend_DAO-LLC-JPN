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
import useMembershipTokenHolders from "@/components/hooks/useMembershipTokenHolders";

const columns = [
  { name: "TOKEN ID", uid: "id" },
  { name: "HOLDER ADDRESS", uid: "holderAddress" },
];

type MembershipTokenHolder = {
  id: number;
  holderAddress: Address;
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
    default:
      return <span>{cellValue}</span>;
  }
};

const ListMembershipTokenHolders = ({
  contractAddress,
}: {
  contractAddress: Address;
}) => {
  const { tokenHolders, isPending } = useMembershipTokenHolders({
    contractAddress,
    showAll: false,
  });

  return (
    <>
      {isPending ? (
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

export default ListMembershipTokenHolders;
