import { Stack } from "@/sphere/Stack";
import { Button } from "@nextui-org/react";
import { motion } from "framer-motion";
import { FC, useState } from "react";
import { Button as RACButton } from "react-aria-components";

type CompanyTypeSelectionProps = {
  isGoingBack: boolean;
  onBack: () => void;
  onNext: () => void;
};

export const CompanyTypeSelection: FC<CompanyTypeSelectionProps> = ({
  isGoingBack,
  onBack,
  onNext,
}) => {
  return (
    <motion.div
      className="flex flex-col items-start justify-center gap-4 w-full max-w-3xl p-8"
      initial={{ opacity: 0, x: 0 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.3,
        ease: "easeInOut",
      }}
    >
      <h2 className="text-2xl font-bold w-full text-start">
        作成する法人の種類を選択してください
      </h2>
      <Stack h className="gap-2">
        <CompanyTypeSelectionItem />
        <CompanyTypeSelectionItem />
        <CompanyTypeSelectionItem />
      </Stack>
      <Stack h className="gap-2 justify-end">
        <Button color="primary" variant="bordered" onPress={onBack}>
          戻る
        </Button>
        <Button color="primary" variant="solid" onPress={onNext}>
          作成する
        </Button>
      </Stack>
    </motion.div>
  );
};

const CompanyTypeSelectionItem: FC = () => {
  return (
    <motion.div>
      <RACButton className="appearance-none bg-primary-foreground flex flex-col p-4 gap-2 rounded-xl border-1 border-primary-outline">
        <h3 className="text-xl font-semibold text-primary text-start">
          合同会社型DAO
        </h3>
        <p className="font-medium text-sm text-neutral text-start">
          合同会社型DAOは、デジタル社員権を活用した社員募集が行えます。
        </p>
      </RACButton>
    </motion.div>
  );
};
