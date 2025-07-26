import { CLayout } from "@/components/layout/CLayout";
import { FC, useState } from "react";
import { Button, Input, Spinner, Textarea } from "@heroui/react";
import { Stack } from "@/sphere/Stack";
import { useTranslation } from "next-i18next";
import { useActiveAccount } from "thirdweb/react";
import { useRouter } from "next/router";
import { useCompany } from "@/hooks/useCompany";
import { useCompanyName } from "@/hooks/useCompanyName";
import { motion } from "framer-motion";
import ImageUploader from "@/components/ImageUploader";
import { useAtom } from "jotai";
import { selectedFileAtom } from "@/atoms";
import { uploadFile } from "@/utils/supabase";
import { v4 as uuidv4 } from "uuid";
import { Enums, Tables } from "@/types/schema";

export const StatelessDaoCreationPage: FC = () => {
  const { t } = useTranslation(["company", "common"]);
  const [daoNameJa, setDaoNameJa] = useState("");
  const [daoNameEn, setDaoNameEn] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [selectedFile, setSelectedFile] = useAtom(selectedFileAtom);
  const [imgUrl, setImgUrl] = useState<string | undefined>(undefined);

  const smartAccount = useActiveAccount();
  const router = useRouter();
  const { createCompany } = useCompany();
  const { createCompanyName } = useCompanyName();

  const onCreateStatelessDao = async () => {
    console.log("🚀 Starting stateless DAO creation");
    if (!smartAccount) {
      console.error("❌ No smart account found");
      return;
    }

    console.log("📋 DAO Creation Parameters:", {
      daoNameJa,
      daoNameEn,
      smartAccountAddress: smartAccount.address,
    });

    setIsCreating(true);
    try {
      // 画像をアップロード
      let iconUrl = "";
      if (selectedFile) {
        console.log("📸 Uploading DAO icon...");
        const { publicUrl } = await uploadFile(
          "company-icon",
          `${uuidv4()}-company-icon`,
          selectedFile
        );
        iconUrl = publicUrl as string;
        setImgUrl(publicUrl);
        console.log("✅ DAO icon uploaded:", publicUrl);
      }

      // 会社名を作成
      console.log("📝 Creating company name...");
      const companyName = await createCompanyName({
        "ja-jp": daoNameJa,
        "en-us": daoNameEn,
      });
      console.log("✅ Company name created:", companyName);

      // 会社を作成（無国籍DAO）
      console.log("🏢 Creating stateless company...");
      const companyParams = {
        founder_id: smartAccount.address,
        jurisdiction: "stateless" as Enums<"Jurisdiction">,
        company_type: "dao" as Enums<"CompanyType">,
        company_name: companyName.id,
        display_name: daoNameJa,
        icon: iconUrl,
      } as Tables<"COMPANY">;
      console.log("📋 Company creation parameters:", companyParams);

      const company = await createCompany(companyParams);
      console.log("✅ Company created:", company);

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

  const isFormValid = daoNameJa && daoNameEn;

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
              無国籍DAOを作成しています...
            </h2>
            <Spinner />
          </motion.div>
        </div>
      </CLayout>
    );
  }

  return (
    <CLayout>
      <motion.div
        className="flex flex-col items-center justify-center min-h-screen p-8 w-[600px]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-full">
          <h1 className="text-3xl font-bold mb-8 text-center">
            無国籍DAOを作成
          </h1>

          <Stack className="gap-6">
            <ImageUploader label="アイコン" defaultImage={imgUrl} />

            <Input
              label="DAO名（日本語）"
              placeholder="例) ネクストコミュニティDAO"
              value={daoNameJa}
              onChange={(e) => setDaoNameJa(e.target.value)}
              required
            />

            <Input
              label="DAO名（英語）"
              placeholder="例) Next Community DAO"
              value={daoNameEn}
              onChange={(e) => setDaoNameEn(e.target.value)}
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
                作成する
              </Button>
            </Stack>
          </Stack>
        </div>
      </motion.div>
    </CLayout>
  );
};
