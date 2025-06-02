import { FC } from "react";
import Image from "next/image";
import { Button, Chip } from "@heroui/react";
import { PiPencil } from "react-icons/pi";
import { Tables } from "@/types/schema";
import { Button as RACButton } from "react-aria-components";
import type { ButtonProps } from "react-aria-components";
import { Stack } from "@/sphere/Stack";
import { TokenTypeChip } from "./TokenTypeChip";

type TokenCardProps = {
  token: Tables<"TOKEN">;
} & ButtonProps;

export const TokenCard: FC<TokenCardProps> = ({ token, ...props }) => {
  return (
    <RACButton
      {...props}
      className="appearance-none relative transition-all h-fit bg-white rounded-lg border-1 border-divider/50 overflow-hidden shadow-md hover:shadow-lg"
    >
      <div className="relative w-full aspect-square bg-gray-50">
        {token.image && (
          <Image
            src={token.image}
            alt={token.name || ""}
            fill
            className="object-contain "
          />
        )}
      </div>
      <Stack className="p-4 pt-2 gap-2">
        <Stack>
          <h3 className="font-bold text-lg text-foreground">{token.name}</h3>
          <p className="font-label-md text-neutral">{token.symbol}</p>
        </Stack>
        <TokenTypeChip
          isExecutable={token.is_executable ?? false}
          size="sm"
          className="rounded-md z-20"
        />

        {/* <div className="flex flex-col gap-1 mb-4">
          <div className="flex justify-between">
            <span className="text-gray-500 text-sm">最低価格</span>
            <span className="font-medium">
              {token.min_price && formatPrice(token.min_price)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 text-sm">最高価格</span>
            <span className="font-medium">
              {token.max_price && formatPrice(token.max_price)}
            </span>
          </div>
        </div> */}
        {/* <div className="flex justify-end">
          <Button size="sm" variant="bordered" onClick={onEdit}>
            <PiPencil className="mr-1" /> 編集
          </Button>
        </div> */}
      </Stack>
    </RACButton>
  );
};
