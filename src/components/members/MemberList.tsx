"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Address } from "viem";
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
import { useMember } from "@/hooks/useMember";
import { downloadCsv } from "@/utils/csv";
import { shortenAddress } from "@/utils/web3";
import { useRouter } from "next/router";
const columns = [
  { name: "氏名", uid: "name" },
  { name: "住所", uid: "address" },
  { name: "ウォレットアドレス", uid: "walletAddress" },
  { name: "入社日", uid: "dateOfEmployment" },
  { name: "出資金", uid: "investedAmount" },
  { name: "ステータス", uid: "status" },
  { name: "アクション", uid: "actions" },
  // { name: "受領証", uid: "receipt" },
  // { name: "メールアドレス", uid: "email" },
];

type MemberRow = {
  name: string;
  address: string;
  walletAddress: string;
  dateOfEmployment: string;
  investedAmount: string;
  status: string;
  actions: {
    daoId: string;
    contractAddress: string;
    mintTo: string;
    isMinted: boolean;
  };
};

interface Props {
  item: MemberRow;
  columnKey: string | React.Key;
}

export const RenderCell = ({ item, columnKey }: Props) => {
  const router = useRouter();
  useEffect(() => {
    console.log("item:", item);
    console.log("columnKey:", columnKey);
  }, [item, columnKey]);
  const cellValue = item[columnKey as keyof MemberRow];

  switch (columnKey) {
    case "name":
      return <span className="whitespace-nowrap">{cellValue as string}</span>;
    case "address":
      return <span className="whitespace-nowrap">{cellValue as string}</span>;
    case "walletAddress":
      return (
        <span className="whitespace-nowrap">
          {shortenAddress(cellValue as string)}
        </span>
      );
    case "dateOfEmployment":
      return <span className="whitespace-nowrap">{cellValue as string}</span>;
    case "investedAmount":
      return <span className="whitespace-nowrap">{cellValue as string}</span>;
    case "status":
      return (
        <Chip
          size="sm"
          variant="flat"
          color={item.status === "発行済" ? "success" : "warning"}
        >
          <span className="text-xs font-semibold">{item.status}</span>
        </Chip>
      );
    case "actions":
      return (
        <Button
          size="sm"
          variant="solid"
          color="primary"
          radius="sm"
          className="h-6 w-fit"
          isDisabled={item.actions.isMinted}
          onPress={() => {
            router.push(
              `/dao/${item.actions.daoId}/membership-token/${item.actions.contractAddress}/issue?mintTo=${item.actions.mintTo}`
            );
          }}
        >
          <span className="text-xs font-semibold">発行</span>
        </Button>
      );
    default:
      return <span className="whitespace-nowrap">{cellValue as string}</span>;
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
        dateOfEmployment: new Date(
          member.date_of_employment ?? ""
        ).toLocaleDateString("ja-JP"),
        investedAmount: member.invested_amount?.toString() ?? "",
        status: member.is_minted ? "発行済" : "未発行",
        actions: {
          daoId: contractAddress,
          contractAddress: member.TOKEN?.contract_address ?? "",
          mintTo: member.USER?.evm_address ?? "",
          isMinted: member.is_minted,
        },
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
            <>
              <Button
                onClick={() => {
                  const dataWithoutActions = memberData?.map(
                    ({ actions, ...rest }) => rest
                  );
                  downloadCsv(columns.slice(0, -1), dataWithoutActions);
                }}
              >
                CSVダウンロード
              </Button>
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
            </>
          )}
        </div>
      )}
    </>
  );
};

export default MemberList;
