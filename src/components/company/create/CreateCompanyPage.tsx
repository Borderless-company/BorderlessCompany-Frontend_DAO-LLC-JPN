import { CLayout } from "@/components/layout/CLayout";
import { FC, useEffect, useState } from "react";
import { CountrySelection } from "./CountrySelection";
import { AnimatePresence } from "framer-motion";
import { CompanyTypeSelection } from "./CompanyTypeSelection";
import { SettingUp } from "./SettingUp";
import { AccountChip } from "@/components/AccountChip";
import { useCompany, useCompanybyFounderId } from "@/hooks/useCompany";
import { useActiveAccount } from "thirdweb/react";
import { useRouter } from "next/router";
import { useTaskStatus } from "@/hooks/useTaskStatus";
import { useAOI } from "@/hooks/useAOI";
import { useCompanyName } from "@/hooks/useCompanyName";
import { useGovAgreement } from "@/hooks/useGovAgreement";
import { useToken } from "@/hooks/useToken";
import { useTranslation } from "next-i18next";

export const CreateCompanyPage: FC = () => {
  const [page, setPage] = useState<number>(0);
  const [isGoingBack, setIsGoingBack] = useState<boolean>(false);
  const { createCompany, isCreateCompanySuccess } = useCompany();
  const smartAccount = useActiveAccount();
  const router = useRouter();
  const { createTaskStatus } = useTaskStatus();
  const { createAOI, updateAOI } = useAOI();
  const { createGovAgreement } = useGovAgreement();
  const { createCompanyName } = useCompanyName();
  const { createToken } = useToken();
  const { t } = useTranslation(["company", "common"]);
  
  // 既存の会社をチェック
  const {
    company: existingCompany,
    isLoading: isLoadingExistingCompany,
  } = useCompanybyFounderId(smartAccount?.address || "");

  const onBack = () => {
    setPage((prev) => prev - 1);
  };

  const onNext = () => {
    setPage((prev) => prev + 1);
  };

  const onCreateCompany = async () => {
    setPage(2);
    try {
      const companyName = await createCompanyName({});

      // 定款の箱だけ作成
      const aoi = await createAOI({});

      const company = await createCompany({
        founder_id: smartAccount?.address,
        jurisdiction: "jp",
        company_type: "llc",
        company_name: companyName.id,
        aoi: aoi.id,
      });

      // 定款の箱に定款を設定
      await updateAOI({
        id: aoi.id,
        company_id: company.id,
      });

      // 総会規定の箱だけ作成
      const govAgreement = await createGovAgreement({
        company_id: company.id,
      });

      // 業務執行社員トークンの箱だけ作成
      await createToken({
        company_id: company.id,
        is_executable: true,
      });

      // 非業務執行社員トークンの箱だけ作成
      await createToken({
        company_id: company.id,
        is_executable: false,
      });

      if (company.id) {
        await createTaskStatus({
          company_id: company.id,
          task_id: "create-aoi",
          status: "todo",
        });
        await createTaskStatus({
          company_id: company.id,
          task_id: "enter-company-profile",
          status: "todo",
        });
        await createTaskStatus({
          company_id: company.id,
          task_id: "enter-executive-token-info",
          status: "todo",
        });
        await createTaskStatus({
          company_id: company.id,
          task_id: "enter-non-executive-token-info",
          status: "todo",
        });
        await createTaskStatus({
          company_id: company.id,
          task_id: "create-gov-agreement",
          status: "todo",
        });

        setTimeout(() => {
          router.push(`/company/${company.id}`);
        }, 3000);
      }
    } catch (error) {
      console.error(error);
      setPage(1);
    }
  };

  // 既存の会社がある場合はリダイレクト
  useEffect(() => {
    if (existingCompany && !isLoadingExistingCompany) {
      console.log("Existing company found, redirecting to:", existingCompany.id);
      router.push(`/company/${existingCompany.id}`);
    }
  }, [existingCompany, isLoadingExistingCompany, router]);

  // ローディング中は何も表示しない
  if (isLoadingExistingCompany) {
    return null;
  }

  // 既存の会社がある場合は何も表示しない（リダイレクト処理中）
  if (existingCompany) {
    return null;
  }

  return (
    <CLayout className="z-0">
      {/* AccountChipを右上に配置 */}
      {smartAccount && (
        <div className="absolute top-6 right-6 z-50 w-40">
          <AccountChip size="sm" />
        </div>
      )}

      {page === 0 && (
        <CountrySelection
          key="country-selection"
          isGoingBack={isGoingBack}
          onNext={onNext}
        />
      )}
      {page === 1 && (
        <CompanyTypeSelection
          isGoingBack={isGoingBack}
          onBack={onBack}
          onNext={onCreateCompany}
          key="company-type-selection"
        />
      )}
      {page === 2 && <SettingUp />}
    </CLayout>
  );
};
