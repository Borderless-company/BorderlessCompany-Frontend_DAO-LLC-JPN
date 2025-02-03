import { CLayout } from "@/components/layout/CLayout";
import { FC, useEffect, useState } from "react";
import { CountrySelection } from "./CountrySelection";
import { AnimatePresence } from "framer-motion";
import { CompanyTypeSelection } from "./CompanyTypeSelection";
import { SettingUp } from "./SettingUp";
import { Button } from "@heroui/react";
import { useSignOut } from "@/hooks/useSignOut";
import { useCompany } from "@/hooks/useCompany";
import { useActiveAccount } from "thirdweb/react";
import { useRouter } from "next/router";
import { useTaskStatus } from "@/hooks/useTaskStatus";
import { useAOI } from "@/hooks/useAOI";
import { useCompanyName } from "@/hooks/useCompanyName";

export const CreateCompanyPage: FC = () => {
  const [page, setPage] = useState<number>(0);
  const [isGoingBack, setIsGoingBack] = useState<boolean>(false);
  const { signOut } = useSignOut();
  const { createCompany, isCreateCompanySuccess } = useCompany();
  const smartAccount = useActiveAccount();
  const router = useRouter();
  const { createTaskStatus } = useTaskStatus();
  const { createAOI } = useAOI();
  const { createCompanyName } = useCompanyName();

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
      const aoi = await createAOI({});
      const company = await createCompany({
        founder_id: smartAccount?.address,
        jurisdiction: "jp",
        company_type: "llc",
        company_name: companyName.id,
        aoi: aoi.id,
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
        setTimeout(() => {
          router.push(`/company/${company.id}`);
        }, 3000);
      }
    } catch (error) {
      console.error(error);
      setPage(1);
    }
  };

  return (
    <CLayout className="z-0">
      <Button onPress={signOut} className="absolute top-4 right-4 z-50">
        Sign Out
      </Button>

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
