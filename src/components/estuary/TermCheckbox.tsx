import { FC } from "react";
import { Checkbox, CheckboxProps, cn } from "@nextui-org/react";
import { PiArrowSquareOutBold } from "react-icons/pi";

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
  return (
    <Checkbox
      size="lg"
      classNames={{
        base: cn(
          "w-full max-w-full h-14 flex-0 m-0 font-semibold flex-row-reverse justify-between",
          isBorder ? "border-b border-stone-200" : ""
          // "hover:bg-stone-200"
        ),
        label: cn("flex-1"),
        wrapper: cn("hover:scale-125"),
      }}
      {...props}
    >
      <>
        <p>
          <a
            className=" text-primary inline-flex items-center gap-1 hover:scale-[1.04] transition-all"
            href={href}
          >
            {termName}
            <PiArrowSquareOutBold size={16} />
          </a>{" "}
          に同意する
        </p>
      </>
    </Checkbox>
  );
};
