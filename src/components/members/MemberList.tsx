"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useMembersByCompanyId, useMember } from "@/hooks/useMember";
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
} from "@heroui/react";
import { downloadCsv } from "@/utils/csv";
import { shortenAddress } from "@/utils/web3";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import {
  useCreateProposal,
  useMintExeToken,
  useNftContract,
  useVote,
  useVoteContract,
} from "@/hooks/useContract";
import { useActiveAccount } from "thirdweb/react";
import { ethers } from "ethers"

const columns = [
  { name: "Name", uid: "name" },
  { name: "Address", uid: "address" },
  { name: "Wallet Address", uid: "walletAddress" },
  { name: "Date of Employment", uid: "dateOfEmployment" },
  { name: "Invested Amount", uid: "investedAmount" },
  { name: "Type", uid: "isExecutive" },
  { name: "Status", uid: "status" },
  { name: "Actions", uid: "actions" },
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
  const { data: nftContract } = useNftContract(smartAccount?.address ?? "");
  const [isMinting, setIsMinting] = useState(false);

  const handleMintExeToken = async (memberAddress: string) => {
    setIsMinting(true);
    console.log("smartAccount?.address:", smartAccount?.address);
    console.log("nftContract:", nftContract);
    console.log("memberAddress:", memberAddress);
    if (!nftContract) {
      console.error("NFT contract is undefined");
      return;
    }
    console.log("run sendMintExeTokenTx");
    await sendMintExeTokenTx(nftContract, memberAddress);
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
  const { sendTx: sendCreateProposalTx } = useCreateProposal();
  const { data: voteContract } = useVoteContract(smartAccount?.address ?? "");
  const { sendTx: sendVoteTx } = useVote();
  const { sendTx: sendMintExeTokenTx, txData: mintExeTokenTxData } = useMintExeToken();
  const { data: nftContract } = useNftContract(smartAccount?.address ?? "");
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

  const handleCreateProposal = async () => {
    console.log("run sendCreateProposalTx");
    console.log("voteContract:", voteContract);
    if (!voteContract) {
      console.error("Vote contract is undefined");
      return;
    }
    await sendCreateProposalTx(voteContract, smartAccount?.address ?? "");
    console.log("sendCreateProposalTx done");
  };

  const handleVote = async () => {
    console.log("run sendVoteTx");
    console.log("voteContract:", voteContract);
    if (!voteContract) {
      console.error("Vote contract is undefined");
      return;
    }
    await sendVoteTx("1", voteContract, 0);
    console.log("sendVoteTx done");
  };

  const handleBulkMintExeToken = async (addresses: string[]) => {
    if (!nftContract) {
      console.error("NFT contract is undefined");
      return;
    }
    console.log("smartAccount?.address:", smartAccount?.address);
    console.log("nftContract:", nftContract);
    console.log("run sendMintExeTokenTx");
    for (const address of addresses) {
      sendMintExeTokenTx(nftContract, address);
    }
    console.log("sendMintExeTokenTx done");
  };

  const handleBulkCreateMembers = async () => {
    const addresses = Array.from(
      { length: 50 },
      () => ethers.Wallet.createRandom().address
    );
    console.log("addresses:", addresses);

    if (!nftContract) {
      console.error("NFT contract is undefined");
      return;
    }

    // for (const randomAddress of addresses) {
    //   await createUser({
    //     evm_address: randomAddress,
    //     address: randomAddress,
    //     name: randomAddress,
    //   });

    //   await createMember({
    //     dao_id: token?.dao_id,
    //     user_id: randomAddress,
    //     company_id: companyId,
    //     is_minted: true,
    //     invested_amount: 0,
    //   });
    // }

    await handleBulkMintExeToken(addresses);
  };

  useEffect(() => {
    console.log("mintExeTokenTxData:", mintExeTokenTxData);
  }, [mintExeTokenTxData]);

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
                {t("Download as CSV")}
              </Button>
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
          <Button onPress={() => handleBulkCreateMembers()}>
            Bulk Mint NFTs
          </Button>
        </div>
      )}
    </>
  );
};

export default MemberList;
