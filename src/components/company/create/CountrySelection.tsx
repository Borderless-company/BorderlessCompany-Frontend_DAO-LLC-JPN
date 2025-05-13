import { FC } from "react";
import { PiPlusCircleDuotone, PiArrowRight } from "react-icons/pi";
import ReactCountryFlag from "react-country-flag";
import { Button, ButtonProps, Chip, Divider } from "@heroui/react";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "next-i18next";

type CountrySelectionProps = {
  isGoingBack: boolean;
  onNext: () => void;
};

export const CountrySelection: FC<CountrySelectionProps> = ({
  isGoingBack,
  onNext,
}) => {
  const { t } = useTranslation(["company", "common"]);
  return (
    <motion.div
      className="flex flex-col items-start justify-center gap-4 w-full max-w-lg p-8"
      initial={{ opacity: 0, x: 0 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.3,
        ease: "easeInOut",
      }}
    >
      <h2 className="text-2xl font-bold w-full text-center">
        Welcome to Borderless
      </h2>
      <div className="flex flex-col items-start justify-start gap-2 w-full">
        <div className="flex items-center justify-start gap-1">
          <PiPlusCircleDuotone className="text-primary text-medium" size={24} />
          <h3 className="text-primary text-medium font-bold pt-[1.5px]">
            {t("Create a new company")}
          </h3>
        </div>
        <div className="flex flex-col items-start justify-start gap-0 w-full h-auto overflow-hidden bg-primary-foreground rounded-xl border-1 border-primary-outline">
          <CountrySelectionItem countryCode="JP" onPress={onNext}>
            {t("Japan")}
          </CountrySelectionItem>
          <Divider className="w-full bg-transparent bg-gradient-to-l from-primary-outline to-primary-outline/0 border-none" />
          <CountrySelectionItem countryCode="CH" isWIP>
            {t("Switzerland")}
          </CountrySelectionItem>
          <Divider className="w-full bg-transparent bg-gradient-to-l from-primary-outline to-primary-outline/0 border-none" />
          <CountrySelectionItem countryCode="US" isWIP>
            {t("United States")}
          </CountrySelectionItem>
          <Divider className="w-full bg-transparent bg-gradient-to-l from-primary-outline to-primary-outline/0 border-none" />
          <CountrySelectionItem countryCode="AE" isWIP>
            {t("United Arab Emirates (UAE)")}
          </CountrySelectionItem>
        </div>
      </div>
    </motion.div>
  );
};

type CountrySelectionItemProps = {
  countryCode: string;
  children: React.ReactNode;
  isWIP?: boolean;
} & ButtonProps;

const CountrySelectionItem: FC<CountrySelectionItemProps> = ({
  countryCode,
  children,
  isWIP = false,
  ...props
}) => {
  return (
    <Button
      disableRipple
      isDisabled={isWIP}
      {...props}
      startContent={
        <ReactCountryFlag
          countryCode={countryCode}
          svg
          style={{
            width: "28px",
            height: "28px",
          }}
        />
      }
      className="bg-transparent font-semibold text-primary w-full justify-start rounded-none data-[hover]:bg-primary-backing data-[disabled]:opacity-80 "
    >
      <div className="flex items-center justify-between w-full">
        {children}
        {isWIP ? (
          <Chip
            color="primary"
            size="sm"
            variant="flat"
            classNames={{
              base: "rounded-md",
              content: "font-semibold",
            }}
          >
            Coming soon
          </Chip>
        ) : (
          <PiArrowRight
            id="arrow-right"
            className={clsx("text-primary text-medium animate-bounce-right")}
            size={20}
          />
        )}
      </div>
    </Button>
  );
};
