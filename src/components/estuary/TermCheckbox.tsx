import { FC } from "react";
import { Checkbox, CheckboxProps, cn, Link } from "@heroui/react";
import { PiArrowSquareOutBold } from "react-icons/pi";
import { useTranslation } from "next-i18next";

export type TermCheckboxProps = CheckboxProps & {
  termName: string;
  href?: string;
  isExternal?: boolean;
  isBorder?: boolean;
  onPressLink?: () => void;
};

export const TermCheckbox: FC<TermCheckboxProps> = ({
  termName,
  href,
  isBorder = true,
  isExternal = true,
  onPressLink,
  ...props
}) => {
  const { t, i18n } = useTranslation("estuary");
  return (
    <Checkbox
      size="lg"
      classNames={{
        base: cn(
          "w-full max-w-full h-fit py-2 flex-0 m-0 font-semibold flex-row-reverse justify-between gap-4",
          "sm:py-2",
          isBorder ? "border-b border-stone-200" : ""
          // "hover:bg-stone-200"
        ),
        label: cn("flex-1 text-base md:text-lg select-all"),
      }}
      {...props}
    >
      <p className="select-all">
        {i18n.language === "en" && t("Agree")}
        <Link
          className=" z-50 select-all text-primary inline-flex items-center gap-1 hover:scale-[1.04] transition-all"
          href={href}
          isExternal={isExternal}
          onPress={() => onPressLink?.()}
        >
          {t(termName)}
          {isExternal && <PiArrowSquareOutBold size={16} />}
        </Link>{" "}
        {i18n.language === "ja" && t("Agree")}
      </p>
    </Checkbox>
  );
};
