"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Address } from "viem";
import useMembershipTokens from "@/components/hooks/useMembershipTokens";
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
import {
  getBlockExplorerUrl,
  getMembershipTokenFactoryStartBlockNumber,
} from "@/utils/contractAddress";
import { useMember } from "@/hooks/useMember";

const columns = [
  { name: "氏名", uid: "name" },
  { name: "住所", uid: "address" },
  { name: "ウォレットアドレス", uid: "walletAddress" },
  { name: "入社日", uid: "dateOfEmployment" },
  { name: "出資金", uid: "investedAmount" },
  // { name: "受領証", uid: "receipt" },
  // { name: "メールアドレス", uid: "email" },
];

type MemberRow = {
  name: string;
  address: string;
  walletAddress: string;
  dateOfEmployment: string;
  investedAmount: number;
};

interface Props {
  item: MemberRow;
  columnKey: string | React.Key;
}

export const RenderCell = ({ item, columnKey }: Props) => {
  useEffect(() => {
    console.log("item:", item);
    console.log("columnKey:", columnKey);
  }, [item, columnKey]);
  const cellValue = item[columnKey as keyof MemberRow];

  switch (columnKey) {
    case "name":
      return <span className="whitespace-nowrap">{cellValue}</span>;
    case "address":
      return <span className="whitespace-nowrap">{cellValue}</span>;
    case "walletAddress":
      return <span className="whitespace-nowrap">{cellValue}</span>;
    case "dateOfEmployment":
      return <span className="whitespace-nowrap">{cellValue}</span>;
    case "investedAmount":
      return <span className="whitespace-nowrap">{cellValue}</span>;
    default:
      return <span className="whitespace-nowrap">{cellValue}</span>;
  }
};

const MemberList = ({ contractAddress }: { contractAddress: Address }) => {
  const { getMembersByDaoId } = useMember({});
  const { data: members } = getMembersByDaoId({ daoId: contractAddress });

  const memberData = useMemo(() => {
    return members?.map((member) => {
      return {
        key: member.id,
        name: member.USER?.name ?? "",
        address: member.USER?.address ?? "",
        walletAddress: member.USER?.evm_address ?? "",
        dateOfEmployment: member.date_of_employment ?? "",
        investedAmount: 100,
        // receipt: member.receipt,
        // email: member.USER?.email,
      };
    });
  }, [members]);

  useEffect(() => {
    console.log("memberData:", memberData);
  }, [memberData]);

  return (
    <>
      {memberData?.length === 0 ? (
        <div className="w-full flex items-center justify-center min-h-[50px]">
          <Spinner />
        </div>
      ) : (
        <div className="w-full flex flex-col gap-4">
          {memberData && (
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
              <TableBody items={memberData ?? []}>
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
        </div>
      )}
    </>
  );
};

export default MemberList;
