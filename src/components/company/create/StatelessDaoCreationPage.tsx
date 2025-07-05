import { CLayout } from "@/components/layout/CLayout";
import { FC, useState } from "react";
import { Button, Input, Textarea } from "@heroui/react";
import { Stack } from "@/sphere/Stack";
import { useTranslation } from "next-i18next";
import { useActiveAccount } from "thirdweb/react";
import { useRouter } from "next/router";
import { useCompany } from "@/hooks/useCompany";
import { useToken } from "@/hooks/useToken";
import { useCompanyName } from "@/hooks/useCompanyName";
import { deployERC721Contract } from "thirdweb/deploys";
import { defineChain } from "thirdweb/chains";
import { client } from "@/utils/client";
import { motion } from "framer-motion";
import ImageUploader from "@/components/ImageUploader";
import { useAtom } from "jotai";
import { selectedFileAtom } from "@/atoms";
import { uploadFile } from "@/utils/supabase";
import { v4 as uuidv4 } from "uuid";
import { Enums } from "@/types/schema";

export const StatelessDaoCreationPage: FC = () => {
  const { t } = useTranslation(["company", "common"]);
  const [daoName, setDaoName] = useState("");
  const [daoDescription, setDaoDescription] = useState("");
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [selectedFile, setSelectedFile] = useAtom(selectedFileAtom);
  const [imgUrl, setImgUrl] = useState<string | undefined>(undefined);

  const smartAccount = useActiveAccount();
  const router = useRouter();
  const { createCompany } = useCompany();
  const { createToken } = useToken();
  const { createCompanyName } = useCompanyName();

  const onCreateStatelessDao = async () => {
    console.log("🚀 Starting stateless DAO creation");
    if (!smartAccount) {
      console.error("❌ No smart account found");
      return;
    }

    console.log("📋 DAO Creation Parameters:", {
      daoName,
      daoDescription,
      tokenName,
      tokenSymbol,
      smartAccountAddress: smartAccount.address,
    });

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
          name: tokenName,
          symbol: tokenSymbol,
          description: daoDescription,
          image: imageUrl,
          defaultAdmin: smartAccount.address,
        },
      });
      console.log("✅ ERC721 contract deployed at:", contractAddress);

      // 会社名を作成
      console.log("📝 Creating company name...");
      const companyName = await createCompanyName({
        "ja-jp": daoName,
        "en-us": daoName,
      });
      console.log("✅ Company name created:", companyName);

      // 会社を作成（無国籍DAO）
      console.log("🏢 Creating stateless company...");
      const companyParams = {
        founder_id: smartAccount.address,
        jurisdiction: "stateless" as Enums<"Jurisdiction">,
        company_type: "dao" as Enums<"CompanyType">,
        company_name: companyName.id,
        contract_address: contractAddress,
      };
      console.log("📋 Company creation parameters:", companyParams);

      const company = await createCompany(companyParams);
      console.log("✅ Company created:", company);

      // トークンを作成
      console.log("🪙 Creating token...");
      const tokenParams = {
        company_id: company.id,
        contract_address: contractAddress,
        name: tokenName,
        symbol: tokenSymbol,
        image: imageUrl,
        description: daoDescription,
        is_executable: true,
      };
      console.log("📋 Token creation parameters:", tokenParams);

      await createToken(tokenParams);
      console.log("✅ Token created successfully");

      // 成功時に会社ページにリダイレクト
      console.log(
        "🎉 Stateless DAO creation completed! Redirecting to company page..."
      );
      setTimeout(() => {
        router.push(`/company/${company.id}`);
      }, 2000);
    } catch (error) {
      console.error("❌ Error creating stateless DAO:", error);
      if (error instanceof Error) {
        console.error("📊 Error details:", {
          message: error.message,
          stack: error.stack,
          name: error.name,
        });
      }
      setIsCreating(false);
    }
  };

  const isFormValid = daoName && daoDescription && tokenName && tokenSymbol;

  if (isCreating) {
    return (
      <CLayout>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold mb-4">
              {t("Creating Stateless DAO...")}
            </h2>
            <p className="text-neutral mb-8">
              {t("Deploying ERC721 contract and setting up your DAO...")}
            </p>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
          </motion.div>
        </div>
      </CLayout>
    );
  }

  return (
    <CLayout>
      <motion.div
        className="flex flex-col items-center justify-center min-h-screen p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-2xl w-full">
          <h1 className="text-3xl font-bold mb-8 text-center">
            {t("Create Stateless DAO")}
          </h1>

          <Stack className="gap-6">
            <Input
              label={t("DAO Name")}
              placeholder={t("Enter your DAO name")}
              value={daoName}
              onChange={(e) => setDaoName(e.target.value)}
              required
            />

            <Textarea
              label={t("DAO Description")}
              placeholder={t("Describe your DAO's purpose and goals")}
              value={daoDescription}
              onChange={(e) => setDaoDescription(e.target.value)}
              required
              minRows={3}
            />

            <ImageUploader
              label={t("Token Image")}
              defaultImage={imgUrl}
            />

            <Input
              label={t("Token Name")}
              placeholder={t("Enter ERC721 token name")}
              value={tokenName}
              onChange={(e) => setTokenName(e.target.value)}
              required
            />

            <Input
              label={t("Token Symbol")}
              placeholder={t("Enter ERC721 token symbol")}
              value={tokenSymbol}
              onChange={(e) => setTokenSymbol(e.target.value)}
              required
            />

            <Stack h className="gap-4 justify-between mt-8">
              <Button
                color="primary"
                variant="bordered"
                onPress={() => router.back()}
              >
                {t("Back", { ns: "common" })}
              </Button>

              <Button
                color="primary"
                variant="solid"
                onPress={onCreateStatelessDao}
                isDisabled={!isFormValid || !smartAccount}
              >
                {t("Create Stateless DAO")}
              </Button>
            </Stack>
          </Stack>
        </div>
      </motion.div>
    </CLayout>
  );
};
