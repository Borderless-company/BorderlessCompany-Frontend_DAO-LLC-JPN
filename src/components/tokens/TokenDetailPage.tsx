import { Stack } from "@/sphere/Stack";
import { Tables } from "@/types/schema";
import { Button, Chip, Link, Tab, Tabs, Spinner } from "@heroui/react";
import Image from "next/image";
import { FC } from "react";
import { PiPencil } from "react-icons/pi";
import MemberList from "../members/MemberList";
import { useToken } from "@/hooks/useToken";
import { TokenSales } from "./TokenSales";
import { TokenTypeChip } from "./TokenTypeChip";

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
  }).format(price);
};

export type TokenDetailPageProps = {
  companyId: string;
  tokenId: string;
};

export const TokenDetailPage: FC<TokenDetailPageProps> = ({
  companyId,
  tokenId,
}) => {
  const { token, isLoadingToken, isErrorToken } = useToken(tokenId);

  if (isLoadingToken) {
    return (
      <div className="w-full h-full flex items-start justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <main className="w-full h-full overflow-scroll px-6 pt-4 flex gap-4">
      {/* left column */}
      <div className="w-60 h-fit flex-shrink-0 flex flex-col gap-4">
        <Image
          src={token?.image || "/globe.png"}
          width={240}
          height={240}
          alt="logo"
          className="rounded-lg object-cover"
        />
        <Stack className="gap-1">
          <p className="font-label-lg text-neutral ">
            {token?.symbol || "未設定"}
          </p>
          <h2 className="font-title-lg text-foreground ">
            {token?.name || "未設定"}
          </h2>
          <TokenTypeChip
            isExecutable={token?.is_executable ?? false}
            size="sm"
            className="rounded-md z-20"
          />
        </Stack>

        <Stack className="gap-1">
          <p className="font-label-md text-neutral">説明文</p>
          <p className="font-body-md text-foreground">
            {token?.description || "未設定"}
          </p>
        </Stack>
        <Stack className="gap-1">
          <p className="font-label-md text-neutral">コントラクトアドレス</p>
          <Link
            color="primary"
            isExternal
            showAnchorIcon
            href={`${process.env.NEXT_PUBLIC_EXPLORER_URL}/address/${token?.contract_address}`}
            className="font-body-md w-full"
          >
            <span className="w-full text-ellipsis overflow-hidden ">
              {token?.contract_address || "未設定"}
            </span>
          </Link>
        </Stack>
      </div>
      {/* right column */}
      <div className="flex-1 h-full overflow-auto">
        <Tabs
          aria-label="Token Tabs"
          color="primary"
          variant="bordered"
          className="w-full"
          size="lg"
        >
          <Tab key="holders" title="保有者一覧" className="overflow-auto">
            <MemberList
              companyId={companyId}
              filter={token?.is_executable ? "executive" : "non-executive"}
            />
          </Tab>
          <Tab key="token-sales" title="トークン販売" className="overflow-auto">
            <TokenSales companyId={companyId} tokenId={tokenId} />
          </Tab>
        </Tabs>
      </div>
    </main>
  );
};
