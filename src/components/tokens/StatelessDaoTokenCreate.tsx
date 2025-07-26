import { FC, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  ModalProps,
  Textarea,
  Progress,
  Card,
  CardBody,
  Chip,
} from "@heroui/react";
import { Tables } from "@/types/schema";
import { Stack } from "@/sphere/Stack";
import ImageUploader from "@/components/ImageUploader";
import { useAtom } from "jotai";
import { selectedFileAtom } from "@/atoms";
import { uploadFile } from "@/utils/supabase";
import { v4 as uuidv4 } from "uuid";
import { useToken } from "@/hooks/useToken";
import { deployERC721Contract } from "thirdweb/deploys";
import { defineChain } from "thirdweb/chains";
import { client } from "@/utils/client";
import { useActiveAccount } from "thirdweb/react";
import { useTranslation } from "next-i18next";
import { getContract } from "thirdweb";
import { lazyMint, setClaimConditions } from "thirdweb/extensions/erc721";
import { useSendTransaction } from "thirdweb/react";
import type { NFTMetadata } from "@/pages/api/token/metadata/index";

type StatelessDaoTokenCreateProps = {
  company?: Tables<"COMPANY">;
  onSuccess?: () => void;
} & Omit<ModalProps, "children">;

export const StatelessDaoTokenCreate: FC<StatelessDaoTokenCreateProps> = ({
  company,
  onSuccess,
  ...props
}) => {
  const { t } = useTranslation(["token", "common"]);
  const { createToken } = useToken();
  const [selectedFile, setSelectedFile] = useAtom(selectedFileAtom);
  const [imgUrl, setImgUrl] = useState<string | undefined>(undefined);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    symbol: "",
    description: "",
  });
  const smartAccount = useActiveAccount();
  const { mutateAsync: sendTransaction } = useSendTransaction();

  // Progress tracking state
  const [currentStep, setCurrentStep] = useState(0);
  const [stepStatus, setStepStatus] = useState<
    Record<number, "pending" | "processing" | "completed" | "error">
  >({});
  const [stepMessages, setStepMessages] = useState<Record<number, string>>({});

  const steps = [
    {
      id: 0,
      name: "画像アップロード",
      description: "トークン画像をSupabaseストレージにアップロード中...",
      duration: "~10秒",
    },
    {
      id: 1,
      name: "コントラクトデプロイ",
      description: "ERC721コントラクトをSoneium Minatoにデプロイ中...",
      duration: "~30秒",
    },
    {
      id: 2,
      name: "メタデータ作成",
      description: "NFTメタデータJSONをアップロード中...",
      duration: "~5秒",
    },
    {
      id: 3,
      name: "LazyMint設定",
      description: "5000個のNFTメタデータを事前準備中...",
      duration: "~45秒",
    },
    {
      id: 4,
      name: "ClaimCondition設定",
      description: "クレーム条件（無料、1000個/ウォレット）を設定中...",
      duration: "~15秒",
    },
    {
      id: 5,
      name: "データベース登録",
      description: "トークン情報をデータベースに保存中...",
      duration: "~5秒",
    },
  ];

  const updateStepStatus = (
    stepId: number,
    status: "pending" | "processing" | "completed" | "error",
    message?: string
  ) => {
    setStepStatus((prev) => ({ ...prev, [stepId]: status }));
    if (message) {
      setStepMessages((prev) => ({ ...prev, [stepId]: message }));
    }
    if (status === "processing") {
      setCurrentStep(stepId);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!company?.id || !smartAccount) return;

    console.log("🚀 Starting stateless DAO token creation");
    setIsCreating(true);
    setCurrentStep(0);
    setStepStatus({});
    setStepMessages({});

    try {
      // Step 0: 画像をアップロード
      updateStepStatus(0, "processing");
      let imageUrl = imgUrl;
      if (selectedFile) {
        console.log("📸 Uploading token image...");
        const { publicUrl } = await uploadFile(
          "token-image",
          `${uuidv4()}-dao-token-image`,
          selectedFile
        );
        setImgUrl(publicUrl);
        imageUrl = publicUrl;
        console.log("✅ Token image uploaded:", publicUrl);
        updateStepStatus(
          0,
          "completed",
          `画像アップロード完了: ${publicUrl.slice(-20)}...`
        );
      } else {
        updateStepStatus(0, "completed", "画像なしで続行");
      }

      // Step 1: ERC721コントラクトをデプロイ
      updateStepStatus(1, "processing");
      console.log("⛓️ Starting ERC721 contract deployment...");
      const chain = defineChain(
        parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || "1946")
      );
      console.log("🔗 Chain ID:", chain.id);

      const contractAddress = await deployERC721Contract({
        client,
        chain,
        account: smartAccount,
        type: "DropERC721",
        params: {
          name: formData.name,
          symbol: formData.symbol,
          description: formData.description,
          image: imageUrl,
          defaultAdmin: smartAccount.address,
        },
      });
      console.log("✅ ERC721 contract deployed at:", contractAddress);
      updateStepStatus(
        1,
        "completed",
        `コントラクト: ${contractAddress.slice(0, 10)}...`
      );

      // Step 2: メタデータをアップロード
      updateStepStatus(2, "processing");
      console.log("📋 Uploading NFT metadata...");
      const metadata: NFTMetadata = {
        name: formData.name,
        description: formData.description,
        image: imageUrl || "",
        external_url: `${process.env.NEXT_PUBLIC_BASE_URL}/tokens/${contractAddress}`,
      };

      const metadataResponse = await fetch("/api/token/metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tokenId: "0", // 基本メタデータとして0を使用
          tokenUUID: contractAddress.toLowerCase(),
          metadata,
        }),
      });

      if (!metadataResponse.ok) {
        throw new Error("Failed to upload metadata");
      }

      const { url: metadataUrl } = await metadataResponse.json();
      console.log("✅ Metadata uploaded:", metadataUrl);
      updateStepStatus(2, "completed", "メタデータアップロード完了");

      // Setup contract for next steps
      console.log("⚙️ Setting up ClaimConditions and LazyMint...");
      const contract = getContract({
        client,
        chain,
        address: contractAddress,
      });

      // Step 3: LazyMint: 最初の5000個のNFTを設定
      updateStepStatus(3, "processing");
      const lazyMintTransaction = lazyMint({
        contract,
        nfts: Array(5000)
          .fill(null)
          .map((_, i) => ({
            name: `${formData.name} #${i + 1}`,
            description: formData.description,
            image: imageUrl,
            external_url: `${
              process.env.NEXT_PUBLIC_BASE_URL
            }/tokens/${contractAddress}/${i + 1}`,
          })),
      });

      await sendTransaction(lazyMintTransaction);
      console.log("✅ LazyMint completed");
      updateStepStatus(3, "completed", "5000個のNFTを事前準備完了");

      // Step 4: ClaimConditionsの設定
      updateStepStatus(4, "processing");
      const claimConditionsTransaction = setClaimConditions({
        contract,
        phases: [
          {
            maxClaimableSupply: BigInt("1000000"),
            maxClaimablePerWallet: BigInt("1000"),
            currencyAddress: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
            price: 0,
            startTime: new Date(),
          },
        ],
      });

      await sendTransaction(claimConditionsTransaction);
      console.log("✅ ClaimConditions set");
      updateStepStatus(4, "completed", "クレーム条件設定完了");

      // Step 5: トークンを作成
      updateStepStatus(5, "processing");
      console.log("🪙 Creating token record...");
      const tokenParams = {
        company_id: company.id,
        contract_address: contractAddress,
        name: formData.name,
        symbol: formData.symbol,
        image: imageUrl,
        description: formData.description,
      };
      console.log("📋 Token creation parameters:", tokenParams);

      await createToken(tokenParams);
      console.log("✅ Token created successfully");
      updateStepStatus(5, "completed", "データベース登録完了");

      // リセット
      setSelectedFile(undefined);
      setImgUrl(undefined);
      setFormData({
        name: "",
        symbol: "",
        description: "",
      });

      onSuccess?.();
      props.onClose?.();
      props.onOpenChange?.(false);
    } catch (error) {
      console.error("❌ Error creating stateless DAO token:", error);
      updateStepStatus(
        currentStep,
        "error",
        error instanceof Error ? error.message : "エラーが発生しました"
      );
      if (error instanceof Error) {
        console.error("📊 Error details:", {
          message: error.message,
          stack: error.stack,
          name: error.name,
        });
      }
    } finally {
      setIsCreating(false);
    }
  };

  const isFormValid = formData.name && formData.symbol && formData.description;

  return (
    <Modal
      {...props}
      isDismissable={!isCreating}
      hideCloseButton={isCreating}
      onClose={() => {
        setSelectedFile(undefined);
        setImgUrl(undefined);
        setFormData({
          name: "",
          symbol: "",
          description: "",
        });
        props.onClose?.();
      }}
      classNames={{
        base: "max-w-md",
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <h2 className="font-headline-sm text-primary">トークンを作成</h2>
              <p className="font-body-md text-neutral">
                ERC721トークンを作成するための情報を記入してください。
              </p>
            </ModalHeader>
            <form onSubmit={handleSubmit} id="stateless-dao-token-form">
              <ModalBody className="max-h-[70vh] overflow-y-auto">
                {isCreating ? (
                  <Stack className="gap-4 w-full justify-center items-center">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold mb-2">
                        トークン作成中...
                      </h3>
                      <Progress
                        value={((currentStep + 1) / steps.length) * 100}
                        className="mb-4 w-full"
                        color="primary"
                        size="lg"
                      />
                      <p className="text-sm text-neutral mb-2">
                        {currentStep + 1} / {steps.length} ステップ完了
                      </p>
                      <p className="text-xs text-neutral mb-4">
                        推定完了時間: 約2分10秒（ネットワーク状況により変動）
                      </p>
                    </div>

                    <Card>
                      <CardBody className="space-y-3">
                        {steps.map((step) => {
                          const status = stepStatus[step.id] || "pending";
                          const message = stepMessages[step.id];

                          return (
                            <div
                              key={step.id}
                              className="flex items-center gap-3"
                            >
                              <div className="flex-shrink-0">
                                {status === "completed" && (
                                  <Chip
                                    color="success"
                                    size="sm"
                                    variant="flat"
                                  >
                                    ✓
                                  </Chip>
                                )}
                                {status === "processing" && (
                                  <Chip
                                    color="primary"
                                    size="sm"
                                    variant="flat"
                                  >
                                    ⏳
                                  </Chip>
                                )}
                                {status === "error" && (
                                  <Chip color="danger" size="sm" variant="flat">
                                    ✗
                                  </Chip>
                                )}
                                {status === "pending" && (
                                  <Chip
                                    color="default"
                                    size="sm"
                                    variant="flat"
                                  >
                                    ⏸
                                  </Chip>
                                )}
                              </div>
                              <div className="flex-1">
                                <p
                                  className={`text-sm font-medium ${
                                    status === "completed"
                                      ? "text-success-600"
                                      : status === "processing"
                                      ? "text-primary-600"
                                      : status === "error"
                                      ? "text-danger-600"
                                      : "text-neutral-500"
                                  }`}
                                >
                                  {step.name}
                                </p>
                                <p className="text-xs text-neutral">
                                  {status === "processing"
                                    ? step.description
                                    : message || step.description}
                                </p>
                                {status === "processing" && (
                                  <p className="text-xs text-primary-500 font-medium">
                                    予想時間: {step.duration}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </CardBody>
                    </Card>

                    {Object.values(stepStatus).includes("error") && (
                      <Card>
                        <CardBody>
                          <div className="text-center text-danger-600">
                            <p className="font-medium">エラーが発生しました</p>
                            <p className="text-sm mt-1">
                              {stepMessages[currentStep] ||
                                "不明なエラーが発生しました"}
                            </p>
                          </div>
                        </CardBody>
                      </Card>
                    )}
                  </Stack>
                ) : (
                  <Stack className="gap-4">
                    <ImageUploader
                      label={t("Token Image")}
                      defaultImage={imgUrl}
                    />
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      label={t("Token Name")}
                      labelPlacement="outside"
                      placeholder={t("Enter token name")}
                      description={t(
                        "This will be the name of your ERC721 token"
                      )}
                      isRequired
                    />
                    <Input
                      name="symbol"
                      value={formData.symbol}
                      onChange={handleInputChange}
                      label={t("Token Symbol")}
                      labelPlacement="outside"
                      placeholder={t("e.g. SDAO")}
                      description={t("A short identifier for your token")}
                      isRequired
                    />
                    <Textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      label={t("Token Description")}
                      labelPlacement="outside"
                      placeholder={t("Enter token description")}
                      description={t(
                        "Describe the purpose and benefits of this token."
                      )}
                      isRequired
                    />
                  </Stack>
                )}
              </ModalBody>
              <ModalFooter>
                <Button
                  color="default"
                  variant="light"
                  onPress={onClose}
                  isDisabled={isCreating}
                >
                  {t("Cancel", { ns: "common" })}
                </Button>
                <Button
                  color="primary"
                  type="submit"
                  form="stateless-dao-token-form"
                  isLoading={isCreating}
                  isDisabled={!isFormValid || !smartAccount}
                >
                  {isCreating ? "作成中..." : "作成する"}
                </Button>
              </ModalFooter>
            </form>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
