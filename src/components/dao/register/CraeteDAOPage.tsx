import { CLayout } from "@/components/layout/CLayout";
import { FC, useEffect, useState } from "react";
import { ContrySelection } from "./ContrySelection";
import { AnimatePresence } from "framer-motion";
import { CompanyTypeSelection } from "./CompanyTypeSelection";
import { SettingUp } from "./SettingUp";

export const CreateDAOPage: FC = () => {
  const [page, setPage] = useState<number>(0);
  const [isGoingBack, setIsGoingBack] = useState<boolean>(false);

  const onBack = () => {
    // setIsGoingBack(true);
    setPage((prev) => prev - 1);
  };

  const onNext = () => {
    // setIsGoingBack(false);
    setPage((prev) => prev + 1);
  };

  return (
    <CLayout className="z-0">
      {/* <AnimatePresence> */}
      {page === 0 && (
        <ContrySelection
          key="country-selection"
          isGoingBack={isGoingBack}
          onNext={onNext}
        />
      )}
      {page === 1 && (
        <CompanyTypeSelection
          isGoingBack={isGoingBack}
          onBack={onBack}
          onNext={onNext}
          key="company-type-selection"
        />
      )}
      {page === 2 && <SettingUp />}
      {/* </AnimatePresence> */}
    </CLayout>
  );
};
