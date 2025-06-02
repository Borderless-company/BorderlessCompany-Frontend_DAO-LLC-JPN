"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useMembersByCompanyId } from "@/hooks/useMember";
import {
  Button,
  Chip,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  useDisclosure,
} from "@heroui/react";
import { useMember } from "@/hooks/useMember";
import { downloadCsv } from "@/utils/csv";
import { shortenAddress } from "@/utils/web3";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { Address } from "thirdweb";
import { useCreateProposal, useMintExeToken } from "@/hooks/useContract";
import { useActiveAccount } from "thirdweb/react";
import { useTokenByCompanyId } from "@/hooks/useToken";
import { Stack } from "@/sphere/Stack";
import { PiPlus } from "react-icons/pi";
import AddMemberModal from "./AddMemberModal";
import { useCompanybyFounderId } from "@/hooks/useCompany";

const columns = [
  { name: "Name", uid: "name" },
  { name: "Address", uid: "address" },
  { name: "Wallet Address", uid: "walletAddress" },
  { name: "Date of Employment", uid: "dateOfEmployment" },
  { name: "Invested Amount", uid: "investedAmount" },
  { name: "Type", uid: "isExecutive" },
  { name: "Status", uid: "status" },
  // { name: "Actions", uid: "actions" },
  // { name: "Receipt", uid: "receipt" },
  // { name: "Email", uid: "email" },
];

type MemberRow = {
  name: string;
  address: string;
  walletAddress: string;
  dateOfEmployment: string;
  investedAmount: string;
  status: string;
  isExecutive: string;
  actions: {
    companyId: string;
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
  const { updateMember } = useMember();
  useEffect(() => {
    console.log("item:", item);
    console.log("columnKey:", columnKey);
  }, [item, columnKey]);
  const cellValue = item[columnKey as keyof MemberRow];
  const { t } = useTranslation("common");

  const smartAccount = useActiveAccount();
  const { sendTx: sendMintExeTokenTx } = useMintExeToken();
  const [isMinting, setIsMinting] = useState(false);

  const handleMintExeToken = async (memberAddress: string) => {
    setIsMinting(true);
    console.log("smartAccount?.address:", smartAccount?.address);
    console.log("memberAddress:", memberAddress);
    console.log("run sendMintExeTokenTx");
    await sendMintExeTokenTx(item.actions.contractAddress, memberAddress);
    console.log("sendMintExeTokenTx done");
    await updateMember({
      user_id: memberAddress,
      company_id: item.actions.companyId,
      is_minted: true,
      date_of_employment: new Date().toISOString(),
    });
    setIsMinting(false);
  };

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
      return (
        <span className="whitespace-nowrap">
          {cellValue ? (cellValue as string) : "Not issued"}
        </span>
      );
    case "investedAmount":
      return <span className="whitespace-nowrap">{cellValue as string}</span>;
    case "status":
      return (
        <Chip
          size="sm"
          variant="flat"
          color={item.status === t("Issued") ? "success" : "warning"}
        >
          <span className="text-xs font-semibold">{item.status}</span>
        </Chip>
      );
    case "isExecutive":
      return (
        <Chip
          size="sm"
          variant="flat"
          color={item.isExecutive === "true" ? "primary" : "secondary"}
        >
          <span className="text-xs font-semibold">
            {item.isExecutive === "true" ? t("Executive") : t("Non Executive")}
          </span>
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
          isLoading={isMinting}
          isDisabled={item.actions.isMinted}
          onPress={() => handleMintExeToken(item.actions.mintTo)}
        >
          <span className="text-xs font-semibold">{t("Issue")}</span>
        </Button>
      );
    default:
      return <span className="whitespace-nowrap">{cellValue as string}</span>;
  }
};

const MemberList = ({ companyId }: { companyId: string }) => {
  const { members } = useMembersByCompanyId(companyId);
  const { t, i18n } = useTranslation("common");
  const smartAccount = useActiveAccount();
  const {
    isOpen: isOpenAddMember,
    onOpen: onOpenAddMember,
    onOpenChange: onOpenChangeAddMember,
  } = useDisclosure();
  const {
    company,
    isLoading: isLoadingCompany,
    isError,
  } = useCompanybyFounderId(smartAccount?.address || "");

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
        status: member.is_minted ? t("Issued") : t("Not issued"),
        isExecutive: member.is_executive?.toString() ?? "false",
        actions: {
          contractAddress: member.TOKEN?.contract_address ?? "",
          mintTo: member.USER?.evm_address ?? "",
          companyId: member.company_id ?? "",
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
              <Stack h className="justify-between w-full">
                <Button
                  onPress={() => {
                    const dataWithoutActions = memberData?.map(
                      ({ actions, ...rest }) => rest
                    );
                    downloadCsv(columns.slice(0, -1), dataWithoutActions);
                  }}
                >
                  {t("Download as CSV")}
                </Button>
              </Stack>
              <Table aria-label="MembershipTokenHolders">
                <TableHeader columns={columns}>
                  {(column) => (
                    <TableColumn
                      key={column.uid}
                      hideHeader={column.uid === "actions"}
                      align={column.uid === "actions" ? "center" : "start"}
                    >
                      {t(column.name)}
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
          {/* <Button onPress={handleCreateProposal}>Create Proposal</Button>
          <Button onPress={handleVote}>Vote</Button> */}
        </div>
      )}
      <AddMemberModal
        isOpen={isOpenAddMember}
        onOpenChange={onOpenChangeAddMember}
        company={company}
      />
    </>
  );
};

export default MemberList;
