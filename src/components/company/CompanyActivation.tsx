import { FC, useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  ModalProps,
  Spinner,
  cn,
} from "@heroui/react";
import { Tables } from "@/types/schema";
import { useCompany, CompanyWithRelations } from "@/hooks/useCompany";
import { Stack } from "@/sphere/Stack";
import { useTaskStatus } from "@/hooks/useTaskStatus";
import { motion } from "framer-motion";
import { useCreateSmartCompany, useSetContractURI } from "@/hooks/useContract";
import { ethers } from "ethers";
type CompanyActivationProps = {
  company?: CompanyWithRelations;
} & Omit<ModalProps, "children">;
import { useActiveAccount } from "thirdweb/react";
import { waitForReceipt } from "thirdweb";
import {
  GOVERNANCE_BEACON_ADDRESS,
  LETS_JP_LLC_EXE_BEACON_ADDRESS,
  SCT_BEACON_ADDRESS,
  LETS_JP_LLC_NON_EXE_BEACON_ADDRESS,
} from "@/constants";
import { client } from "@/utils/client";
import { defineChain } from "thirdweb/chains";
import { useTokenByCompanyId } from "@/hooks/useToken";
import { useAOIByCompanyId } from "@/hooks/useAOI";
import { useMember, useMembersByCompanyId } from "@/hooks/useMember";
import { useTranslation } from "next-i18next";
import { uploadJSON } from "@/utils/supabase";

export const CompanyActivation: FC<CompanyActivationProps> = ({
  company,
  ...props
}) => {
  const { t } = useTranslation(["company", "common"]);
  const smartAccount = useActiveAccount();
  const [isDepoying, setIsDepoying] = useState(false);
  const [isDeployed, setIsDeployed] = useState(false);
  const { updateCompany } = useCompany(company?.id);
  const { tokens, isLoadingTokens, isErrorTokens, refetchTokens } =
    useTokenByCompanyId(company?.id);
  const { updateMember } = useMember();
  const { members } = useMembersByCompanyId(company?.id);
  const { aoi } = useAOIByCompanyId(company?.id);
  const { createTaskStatus, deleteTaskStatusByIds } = useTaskStatus();
  const { sendTx: sendCreateCompanyTx } = useCreateSmartCompany();
  const { sendTx: sendSetContractURI } = useSetContractURI();
  const [formData, setFormData] = useState<Partial<Tables<"COMPANY">>>({
    company_number: company?.company_number || "",
    is_active: company?.is_active || false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(`company?.id ${company?.id}`);
    if (!company?.id) return;

    try {
      // 会社を有効化
      setIsDepoying(true);

      // Create Company
      const exeToken = tokens?.filter(
        (token) => token.is_executable === true
      )?.[0];
      const nonExeToken = tokens?.filter(
        (token) => token.is_executable === false
      )?.[0];
      if (!exeToken || !nonExeToken) {
        throw new Error("Token not found");
      }

      // トークンメタデータを生成してアップロード
      console.log("Uploading token metadata...");

      // Executive Token メタデータ
      const exeTokenMetadata = {
        name: exeToken.name || "Executive Token",
        description: exeToken.description || "",
        image: exeToken.image || "",
      };

      // Non-Executive Token メタデータ
      const nonExeTokenMetadata = {
        name: nonExeToken.name || "Non-Executive Token",
        description: nonExeToken.description || "",
        image: nonExeToken.image || "",
      };

      // メタデータをアップロード
      const [exeMetadataResult, nonExeMetadataResult] = await Promise.all([
        uploadJSON("token-metadata", `${exeToken.id}.json`, exeTokenMetadata),
        uploadJSON(
          "token-metadata",
          `${nonExeToken.id}.json`,
          nonExeTokenMetadata
        ),
      ]);

      if (exeMetadataResult.error || nonExeMetadataResult.error) {
        throw new Error("Failed to upload token metadata");
      }

      console.log("Token metadata uploaded successfully");
      console.log("Executive token metadata URL:", exeMetadataResult.publicUrl);
      console.log(
        "Non-executive token metadata URL:",
        nonExeMetadataResult.publicUrl
      );

      const abiCoder = new ethers.AbiCoder();

      console.log(
        `token?.name ${
          tokens?.filter((token) => token.is_executable === true)?.[0]?.name
        }`
      );
      console.log(
        `token?.symbol ${
          tokens?.filter((token) => token.is_executable === true)?.[0]?.symbol
        }`
      );

      const executiveTokenExtraParams = abiCoder.encode(
        ["string", "string", "string", "string", "bool", "uint256"],
        [
          exeToken.name,
          exeToken.symbol,
          `${process.env.NEXT_PUBLIC_TOKEN_METADATA_BASE_URL}/${exeToken.id}`,
          ".json",
          true,
          0,
        ]
      );
      console.log(`executiveTokenExtraParams: ${executiveTokenExtraParams}`);
      const nonExecutiveTokenExtraParams = abiCoder.encode(
        ["string", "string", "string", "string", "bool", "uint256"],
        [
          nonExeToken.name,
          nonExeToken.symbol,
          `${process.env.NEXT_PUBLIC_TOKEN_METADATA_BASE_URL}/${nonExeToken.id}`,
          ".json",
          true,
          0,
        ]
      );
      console.log(
        `nonExecutiveTokenExtraParams: ${nonExecutiveTokenExtraParams}`
      );

      console.log(`formData?.company_number ${formData?.company_number}`);
      console.log(`company?.company_type ${company?.company_type}`);
      console.log(`company?.company_name ${company?.company_name}`);
      console.log(`aoi?.establishment_date ${aoi?.establishment_date}`);
      console.log(`company?.jurisdiction ${company?.jurisdiction}`);
      console.log(`aoi?.location ${aoi?.location}`);
      console.log(`smartAccount?.address ${smartAccount?.address}`);

      // 実際の会社名を取得
      const actualCompanyName =
        company?.COMPANY_NAME?.["ja-jp"] ||
        company?.COMPANY_NAME?.["en-us"] ||
        company?.COMPANY_NAME?.id; // フォールバックとしてIDを使用
      console.log(`actualCompanyName: ${actualCompanyName}`);
      console.log(`company?.COMPANY_NAME:`, company?.COMPANY_NAME);

      if (
        !formData?.company_number ||
        !company?.company_type ||
        !actualCompanyName ||
        actualCompanyName.trim() === "" ||
        !aoi?.establishment_date ||
        !company?.jurisdiction ||
        !aoi?.location ||
        !smartAccount?.address
      ) {
        throw new Error("Company data is missing or invalid");
      }

      // トランザクションを送信してハッシュを取得
      const transactionHash = await sendCreateCompanyTx({
        scId: formData?.company_number,
        beacon: SCT_BEACON_ADDRESS,
        legalEntityCode: "SC_JP_DAOLLC",
        companyName: actualCompanyName, // 実際の会社名を使用
        establishmentDate: aoi?.establishment_date,
        jurisdiction: company?.jurisdiction,
        entityType: company?.company_type,
        scDeployParam: "0x" as `0x${string}`,
        companyInfo: [
          aoi?.location,
          aoi?.location,
          aoi?.location,
          aoi?.location,
        ],
        scsBeaconProxy: [
          GOVERNANCE_BEACON_ADDRESS,
          LETS_JP_LLC_EXE_BEACON_ADDRESS,
          LETS_JP_LLC_NON_EXE_BEACON_ADDRESS,
        ],
        scsDeployParams: [
          "0x",
          executiveTokenExtraParams,
          nonExecutiveTokenExtraParams,
        ] as `0x${string}`[],
      });

      console.log("Transaction hash:", transactionHash);

      // thirdwebのwaitForReceiptを使用してトランザクションの完了を待機
      const chain = defineChain(Number(process.env.NEXT_PUBLIC_CHAIN_ID));

      const transactionReceipt = await waitForReceipt({
        client,
        chain,
        transactionHash,
      });

      console.log("Transaction confirmed:", transactionReceipt);

      // トランザクションが失敗した場合はエラーを投げる
      if (transactionReceipt.status === "reverted") {
        throw new Error("トランザクションが失敗しました");
      }

      //新しいタスクを追加;
      await createTaskStatus({
        company_id: company.id,
        task_id: "mint-exe-token",
        status: "todo",
      });

      // メンバーを追加
      if (members?.length) {
        await Promise.all(
          members.map(async (member) => {
            await updateMember({
              user_id: member.user_id,
              company_id: company.id,
              token_id: tokens?.[0]?.id,
              is_minted: member.user_id === smartAccount?.address,
              date_of_employment:
                member.user_id === smartAccount?.address
                  ? new Date().toISOString()
                  : null,
            });
          })
        );
      }

      // 成功時の処理
      setIsDepoying(false);
      setIsDeployed(true);

      // 2秒後にモーダルを閉じて会社を有効化
      setTimeout(async () => {
        setIsDeployed(false);
        await updateCompany({
          id: company.id,
          ...formData,
          is_active: true,
        });
        props.onClose?.();
        props.onOpenChange?.(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to activate company:", error);
      setIsDepoying(false);
      setIsDeployed(false);

      // エラーメッセージを表示（必要に応じてtoastやalertを使用）
      let errorMessage = "会社の有効化に失敗しました。";
      if (error instanceof Error) {
        errorMessage = `会社の有効化に失敗しました: ${error.message}`;
      }

      // TODO: より適切なエラー表示方法（toast等）に置き換える
      alert(errorMessage);
    }
  };

  return (
    <Modal
      {...props}
      classNames={{
        base: "max-w-md",
      }}
      hideCloseButton={isDepoying}
      isDismissable={!isDepoying}
    >
      <ModalContent>
        {(onClose) => (
          <>
            {!isDepoying && !isDeployed && (
              <ModalHeader className="flex flex-col gap-1">
                <h2 className="font-headline-sm text-primary">
                  {t("Company Activation")}
                </h2>
                <p className="font-body-md text-neutral">
                  {t("Enter your corporate number to activate your company.")}
                </p>
              </ModalHeader>
            )}
            {!isDepoying && !isDeployed && (
              <form onSubmit={handleSubmit} id="company-activation-form">
                <ModalBody>
                  <Stack className="gap-4">
                    <Input
                      name="company_number"
                      value={formData.company_number || ""}
                      onChange={handleInputChange}
                      label={t("Company Number")}
                      labelPlacement="outside"
                      placeholder={t("Enter your 13-digit company number")}
                      description={t(
                        "Enter the 13-digit company number issued by the National Tax Agency."
                      )}
                      pattern="[0-9]{13}"
                      required
                    />
                  </Stack>
                </ModalBody>
                <ModalFooter>
                  <Button color="default" variant="light" onPress={onClose}>
                    {t("Cancel", { ns: "common" })}
                  </Button>
                  <Button
                    color="primary"
                    type="submit"
                    form="company-activation-form"
                  >
                    {t("Activate Company")}
                  </Button>
                </ModalFooter>
              </form>
            )}
            {isDepoying && !isDeployed && (
              <ModalBody className={cn("p-8")}>
                <motion.div
                  className="flex flex-row items-center justify-center h-full gap-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Spinner />
                  <p className="font-body-md text-primary font-mono">
                    {t("Activating your company...")}
                  </p>
                </motion.div>
              </ModalBody>
            )}
            {isDeployed && (
              <ModalBody className={cn("p-8")}>
                <motion.div
                  className="flex flex-row items-center justify-center h-full gap-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="font-body-md text-primary font-mono">
                    {t("Activated")}
                  </p>
                </motion.div>
              </ModalBody>
            )}
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
