import { FC } from "react";
import { Checkbox, CheckboxProps, cn, useDisclosure } from "@nextui-org/react";
import { PiArrowSquareOutBold } from "react-icons/pi";
import { TermModal } from "./TermModal";

export type TermCheckboxProps = CheckboxProps & {
  termName: string;
  isExternal?: boolean;
  href: string;
  isBorder?: boolean;
};

export const TermCheckbox: FC<TermCheckboxProps> = ({
  termName,
  href,
  isExternal = true,
  isBorder = true,
  ...props
}) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

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
      onClick={!isExternal ? onOpen : undefined}
      {...props}
    >
      <>
        <p>
          <a
            className=" text-primary inline-flex items-center gap-1 hover:scale-[1.04] transition-all"
            href={href}
            target="_blank"
            rel="noopener noreferrer"
          >
            {termName}
            <PiArrowSquareOutBold size={16} />
          </a>{" "}
          に同意する
        </p>
      </>
      <TermModal isOpen={isOpen} onOpenChange={onOpenChange} />
    </Checkbox>
  );
};
