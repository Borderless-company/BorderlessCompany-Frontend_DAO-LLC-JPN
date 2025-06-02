import { FC } from "react";
import { Chip, ChipProps } from "@heroui/react";

type TokenTypeChipProps = {
  isExecutable: boolean;
} & Omit<ChipProps, "children" | "color">;

export const TokenTypeChip: FC<TokenTypeChipProps> = ({
  isExecutable,
  ...chipProps
}) => {
  return (
    <Chip color={isExecutable ? "primary" : "secondary"} {...chipProps}>
      {isExecutable ? "業務執行社員" : "非業務執行社員"}
    </Chip>
  );
};
