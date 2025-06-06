import { Stack } from "@/sphere/Stack";
import { Button, RadioGroup, Radio, RadioProps, cn, Chip } from "@heroui/react";
import { motion } from "framer-motion";
import { useTranslation } from "next-i18next";
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
  const { t } = useTranslation(["company", "common"]);
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
        {t("Select a company type")}
      </h2>
      <RadioGroup
        orientation="horizontal"
        defaultValue="llc"
        classNames={{
          wrapper: cn("w-full gap-2 flex-nowrap"),
        }}
      >
        <CompanyTypeSelectionItem
          value="llc"
          title={t("LLC")}
          description={t(
            "LLC is a limited liability company that allows for the use of digital employee rights."
          )}
        />
        <CompanyTypeSelectionItem
          value="inc"
          title={t("Inc")}
          isComingSoon={true}
          isDisabled={true}
        />
        <CompanyTypeSelectionItem
          value="gia"
          title={t("GIA")}
          isComingSoon={true}
          isDisabled={true}
        />
      </RadioGroup>
      <Stack h className="gap-2 justify-end">
        <Button color="primary" variant="bordered" onPress={onBack}>
          {t("Back", { ns: "common" })}
        </Button>
        <Button color="primary" variant="solid" onPress={onNext}>
          {t("Create")}
        </Button>
      </Stack>
    </motion.div>
  );
};

type CompanyTypeSelectionItemProps = {
  title: string;
  description?: string;
  isComingSoon?: boolean;
} & RadioProps;

const CompanyTypeSelectionItem: FC<CompanyTypeSelectionItemProps> = ({
  value,
  title,
  description,
  isComingSoon,
  ...props
}) => {
  return (
    <motion.div className="relative flex flex-1">
      {isComingSoon && (
        <Chip
          color="primary"
          variant="solid"
          className="absolute right-2 bottom-2 z-10"
        >
          Coming Soon
        </Chip>
      )}
      <Radio
        value={value}
        classNames={{
          base: cn(
            "max-w-full flex items-start justify-start transition-all flex-1 bg-primary-foreground p-4 m-0 rounded-xl border-1 border-primary-outline data-[selected]:bg-primary-backing data-[selected]:border-primary"
          ),
          wrapper: cn("hidden m-0"),
          labelWrapper: cn("flex-1 flex flex-col gap-2 m-0"),
          label: cn("m-0"),
          control: cn(""),
        }}
        {...props}
      >
        <div className="flex flex-col gap-1 w-full">
          <h3 className="text-xl font-semibold text-primary text-start">
            {title}
          </h3>
          <p className="font-medium text-sm text-neutral text-start w-auto">
            {description}
          </p>
        </div>
      </Radio>
    </motion.div>
  );
};
