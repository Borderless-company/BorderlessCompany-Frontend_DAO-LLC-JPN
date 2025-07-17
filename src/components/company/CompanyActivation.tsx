import { act, FC, useEffect, useMemo, useState } from "react";
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
import {
  scrProxyContract,
  useCreateSmartCompany,
  useSmartCompanyId,
  useInitialMintExeToken,
  useMintExeToken,
  useSetContractURI,
} from "@/hooks/useContract";
import { ethers } from "ethers";
import { useActiveAccount } from "thirdweb/react";
import { readContract, waitForReceipt } from "thirdweb";
import {
  GOVERNANCE_BEACON_ADDRESS,
  LETS_JP_LLC_EXE_BEACON_ADDRESS,
  SCT_BEACON_ADDRESS,
  LETS_JP_LLC_NON_EXE_BEACON_ADDRESS,
  KIBOTCHA_LETS_JP_LLC_NON_EXE_BEACON_ADDRESS,
} from "@/constants";
import { client } from "@/utils/client";
import { defineChain } from "thirdweb/chains";
import { useToken, useTokenByCompanyId } from "@/hooks/useToken";
import { useAOIByCompanyId } from "@/hooks/useAOI";
import { useMember, useMembersByCompanyId } from "@/hooks/useMember";
import { useTranslation } from "next-i18next";
import { uploadJSON } from "@/utils/supabase";
import SERVICE_FACTORY_ABI from "@/utils/abi/ServiceFactory.json";
import SCR_ABI from "@/utils/abi/SCR_V2.json";
import { CompanyInfo } from "@/types/contract";

type CompanyActivationProps = {
  company?: CompanyWithRelations;
} & Omit<ModalProps, "children">;

export const CompanyActivation: FC<CompanyActivationProps> = ({
  company,
  ...props
}) => {
  const { t } = useTranslation(["company", "common"]);
  const [activationStatus, setActivationStatus] = useState<
    | "idle"
    | "uploadingMetadata"
    | "deploying"
    | "gettingTokenAddress"
    | "mintingExeToken"
    | "chore"
    | "activated"
  >("idle");

  const smartAccount = useActiveAccount();
  const { updateCompany } = useCompany(company?.id);
  const { tokens, isLoadingTokens, isErrorTokens, refetchTokens } =
    useTokenByCompanyId(company?.id);
  const { updateToken } = useToken();
  const { updateMember } = useMember();
  const { members } = useMembersByCompanyId(company?.id);
  const { aoi } = useAOIByCompanyId(company?.id);
  const { sendTx: sendCreateCompanyTx } = useCreateSmartCompany();
  const [formData, setFormData] = useState<Partial<Tables<"COMPANY">>>({
    company_number: company?.company_number || "",
    is_active: company?.is_active || false,
  });

  const { sendTx: sendMintExeTokenTx } = useInitialMintExeToken();

  const subText = useMemo(() => {
    switch (activationStatus) {
      case "uploadingMetadata":
        return "メタデータをアップロード中...";
      case "deploying":
        return `会社をデプロイ中...`;
      case "gettingTokenAddress":
        return "トークンコントラクトを取得中...";
      case "mintingExeToken":
        return "業務執行社員トークンを発行中...";
      case "chore":
        return "もう少しです！";
      case "activated":
        return "会社を有効化しました。";
    }
  }, [activationStatus, company?.display_name]);

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

    // 会社の起動開始
    try {
      // トークンメタデータを生成してアップロード
      setActivationStatus("uploadingMetadata");

      const exeToken = tokens?.filter(
        (token) => token.is_executable === true
      )?.[0];
      const nonExeToken = tokens?.filter(
        (token) => token.is_executable === false
      )?.[0];
      if (!exeToken || !nonExeToken) {
        throw new Error("Token not found");
      }

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

      // Smart Companyデプロイ開始
      setActivationStatus("deploying");
      const abiCoder = new ethers.AbiCoder();

      const executiveTokenParams = [
        exeToken.name,
        exeToken.symbol,
        `${process.env.NEXT_PUBLIC_TOKEN_METADATA_BASE_URL}/${exeToken.id}`,
        ".json",
        true,
        0,
      ];

      console.log(
        "executiveTokenExtraParams (before encode):",
        executiveTokenParams
      );

      const executiveTokenExtraParams = abiCoder.encode(
        ["string", "string", "string", "string", "bool", "uint256"],
        executiveTokenParams
      );

      let nonExecutiveTokenExtraParams: string;

      // KIBOTCHA の場合は非実行社員トークンのメタデータを変更する
      if (company.id == process.env.NEXT_PUBLIC_KIBOTCHA_COMPANY_ID) {
        console.log("KIBOTCHA");
        const nonExecutiveTokenParams = [
          nonExeToken.name,
          nonExeToken.symbol,
          `${process.env.NEXT_PUBLIC_TOKEN_METADATA_BASE_URL}/kibotcha/non-exe/`,
          ".json",
          false,
          2000,
          863, // magic number
        ];

        console.log(
          "nonExecutiveTokenExtraParams (KIBOTCHA, before encode):",
          nonExecutiveTokenParams
        );

        try {
          nonExecutiveTokenExtraParams = abiCoder.encode(
            [
              "string",
              "string",
              "string",
              "string",
              "bool",
              "uint256",
              "uint256",
            ],
            nonExecutiveTokenParams
          );
        } catch (encodingError) {
          console.error("KIBOTCHA encoding failed:", encodingError);
          throw encodingError;
        }
      } else {
        const nonExecutiveTokenParams = [
          nonExeToken.name,
          nonExeToken.symbol,
          `${process.env.NEXT_PUBLIC_TOKEN_METADATA_BASE_URL}/${nonExeToken.id}`,
          ".json",
          true,
          0,
        ];

        console.log(
          "nonExecutiveTokenExtraParams (before encode):",
          nonExecutiveTokenParams
        );

        nonExecutiveTokenExtraParams = abiCoder.encode(
          ["string", "string", "string", "string", "bool", "uint256"],
          nonExecutiveTokenParams
        );
      }

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

      // KIBOTCHAの場合はbeaconの状態をデバッグ
      if (company.id === process.env.NEXT_PUBLIC_KIBOTCHA_COMPANY_ID) {
        // デバッグ: beacon addressesの配列を確認
        const beaconAddresses = [
          GOVERNANCE_BEACON_ADDRESS,
          LETS_JP_LLC_EXE_BEACON_ADDRESS,
          KIBOTCHA_LETS_JP_LLC_NON_EXE_BEACON_ADDRESS,
        ];

        // スマートコントラクトからbeaconの状態を確認
        try {
          const contract = scrProxyContract();

          // KIBOTCHA beacon の状態を確認
          const kibotchaBeaconInfo = await readContract({
            contract,
            method: "getServiceFactoryBeacon",
            params: [KIBOTCHA_LETS_JP_LLC_NON_EXE_BEACON_ADDRESS],
          });

          // 通常のbeaconの状態と比較
          const normalBeaconInfo = await readContract({
            contract,
            method: "getServiceFactoryBeacon",
            params: [LETS_JP_LLC_NON_EXE_BEACON_ADDRESS],
          });

          // Service type も確認
          const kibotchaServiceType = await readContract({
            contract,
            method: "getServiceType",
            params: [KIBOTCHA_LETS_JP_LLC_NON_EXE_BEACON_ADDRESS],
          });
        } catch (error) {
          console.error("Error checking beacon status:", error);
        }
      }

      // トランザクションを送信してハッシュを取得
      const scsBeaconProxy = [
        GOVERNANCE_BEACON_ADDRESS,
        LETS_JP_LLC_EXE_BEACON_ADDRESS,
        company.id === process.env.NEXT_PUBLIC_KIBOTCHA_COMPANY_ID
          ? KIBOTCHA_LETS_JP_LLC_NON_EXE_BEACON_ADDRESS
          : LETS_JP_LLC_NON_EXE_BEACON_ADDRESS,
      ];

      const scsDeployParams = [
        "0x",
        executiveTokenExtraParams,
        nonExecutiveTokenExtraParams,
      ] as `0x${string}`[];

      const transactionHash = await sendCreateCompanyTx({
        scId: formData?.company_number,
        scBeaconProxy: SCT_BEACON_ADDRESS,
        legalEntityCode: "SC_JP_DAO_LLC",
        companyName: actualCompanyName, // 実際の会社名を使用
        establishmentDate: aoi?.establishment_date,
        jurisdiction: company?.jurisdiction.toUpperCase(),
        entityType: company?.company_type.toUpperCase(),
        scDeployParams: "0x" as `0x${string}`,
        companyInfo: ["Temp", "Temp", "Temp", "Temp"],
        scsBeaconProxy,
        scsDeployParams,
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

      // トークンのアドレスを取得
      setActivationStatus("gettingTokenAddress");
      const exeTokenAddress = (await readContract({
        contract: scrProxyContract(),
        method: SERVICE_FACTORY_ABI.abi.find(
          (item) => item.name === "getFounderService"
        ) as any,
        params: [smartAccount?.address, 3],
      })) as string;

      const nonExeTokenAddress = (await readContract({
        contract: scrProxyContract(),
        method: SERVICE_FACTORY_ABI.abi.find(
          (item) => item.name === "getFounderService"
        ) as any,
        params: [smartAccount?.address, 4],
      })) as string;

      await updateToken({
        id: exeToken.id,
        contract_address: exeTokenAddress,
      });
      await updateToken({
        id: nonExeToken.id,
        contract_address: nonExeTokenAddress,
      });

      console.log("exeTokenAddress", exeTokenAddress);
      console.log("nonExeTokenAddress", nonExeTokenAddress);

      // Executive Token をメンバーにミント
      setActivationStatus("mintingExeToken");

      if (members?.length) {
        const memberAddresses = members
          .map((member) => member.user_id)
          .filter((address) => address !== null);
        console.log("memberAddresses", memberAddresses);
        const tx = await sendMintExeTokenTx(exeTokenAddress, memberAddresses);
        console.log("tx", tx);
        const receipt = await waitForReceipt({
          client,
          chain,
          transactionHash: tx,
        });
        console.log("receipt", receipt);
      }

      // メンバーを追加
      if (members?.length) {
        await Promise.all(
          members.map(async (member, index) => {
            await updateMember({
              user_id: member.user_id,
              company_id: company.id,
              token_id: exeToken.id,
              is_minted: true,
              token_number: index,
              date_of_employment: new Date().toISOString(),
            });
          })
        );
      }

      // 雑用
      setActivationStatus("chore");

      const companyInfo = (await readContract({
        contract: scrProxyContract(),
        method: SCR_ABI.abi.find(
          (item) => item.name === "getCompanyBaseInfo"
        ) as any,
        params: [formData?.company_number],
      })) as CompanyInfo;

      console.log("companyInfo", companyInfo);

      await updateCompany({
        id: company.id,
        ...formData,
        contract_address: companyInfo.companyAddress,
        is_active: true,
        deployment_date: new Date().toISOString(),
      });

      setActivationStatus("activated");
      setTimeout(() => {
        props.onClose?.();
        props.onOpenChange?.(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to activate company:", error);
      setActivationStatus("idle");

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
      hideCloseButton={activationStatus !== "idle"}
      isDismissable={activationStatus === "idle"}
    >
      <ModalContent>
        {(onClose) => (
          <>
            {activationStatus === "idle" && (
              <ModalHeader className="flex flex-col gap-1">
                <h2 className="font-headline-sm text-primary">
                  {t("Company Activation")}
                </h2>
                <p className="font-body-md text-neutral">
                  {t("Enter your corporate number to activate your company.")}
                </p>
              </ModalHeader>
            )}
            {activationStatus === "idle" && (
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
            {activationStatus !== "idle" &&
              activationStatus !== "activated" && (
                <ModalBody className={cn("p-8")}>
                  <motion.div
                    className="flex flex-col items-center justify-center h-full gap-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Spinner />
                    <Stack className="gap-1 items-center">
                      <p className="font-body-lg text-primary font-mono">
                        {`${company?.display_name}を起動しています`}
                      </p>
                      <p className="font-body-sm text-primary font-mono">
                        {subText}
                      </p>
                    </Stack>
                  </motion.div>
                </ModalBody>
              )}
            {activationStatus === "activated" && (
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
