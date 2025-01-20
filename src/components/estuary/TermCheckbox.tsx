import { FC } from "react";
import { Checkbox, CheckboxProps, cn } from "@heroui/react";
import { PiArrowSquareOutBold } from "react-icons/pi";
import { useTranslation } from "next-i18next";

export type TermCheckboxProps = CheckboxProps & {
  termName: string;
  href: string;
  isBorder?: boolean;
};

export const TermCheckbox: FC<TermCheckboxProps> = ({
  termName,
  href,
  isBorder = true,
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
        label: cn("flex-1 text-base md:text-lg"),
        wrapper: cn("hover:scale-125"),
      }}
      {...props}
    >
      <>
        <p>
          {i18n.language === "en" && t("Agree")}
          <a
            className=" text-primary inline-flex items-center gap-1 hover:scale-[1.04] transition-all"
            href={href}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t(termName)}
            <PiArrowSquareOutBold size={16} />
          </a>{" "}
          {i18n.language === "ja" && t("Agree")}
        </p>
      </>
    </Checkbox>
  );
};
