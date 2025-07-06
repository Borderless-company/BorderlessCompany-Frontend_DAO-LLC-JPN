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

    try {
      // 画像をアップロード
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
      }

      // ERC721コントラクトをデプロイ
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

      // トークンを作成
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
