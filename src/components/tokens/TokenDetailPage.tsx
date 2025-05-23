import { Stack } from "@/sphere/Stack";
import { Tables } from "@/types/schema";
import { Button, Chip, Tab, Tabs } from "@heroui/react";
import Image from "next/image";
import { FC } from "react";
import { PiPencil } from "react-icons/pi";
import MemberList from "../members/MemberList";
import { useToken } from "@/hooks/useToken";
import { TokenSales } from "./TokenSales";

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
  const getPriceDisplay = () => {
    if (token?.fixed_price) {
      return formatPrice(token.fixed_price);
    }
    if (token?.min_price && token?.max_price) {
      return `${formatPrice(token.min_price)} - ${formatPrice(
        token.max_price
      )}`;
    }
    return "価格未設定";
  };

  return (
    <main className="w-full h-full overflow-scroll px-6 py-4 flex gap-4">
      {/* left column */}
      <div className="w-60 h-fit flex-shrink-0 flex flex-col gap-4">
        <Image
          src={token?.image || "/globe.png"}
          width={240}
          height={240}
          alt="logo"
          className="rounded-lg object-cover"
        />
        <Stack className="gap-0">
          <p className="font-label-lg text-neutral ">{token?.symbol}</p>
          <h2 className="font-title-lg text-foreground ">{token?.name}</h2>
        </Stack>
        <Button
          color="primary"
          size="sm"
          startContent={<PiPencil />}
          className="w-full rounded-lg"
        >
          編集する
        </Button>
        <Stack className="gap-1">
          <p className="font-label-md text-neutral">説明文</p>
          <p className="font-body-md text-foreground">{token?.description}</p>
        </Stack>
        <Stack className="gap-1">
          <p className="font-label-md text-neutral">販売価格</p>
          <p className="font-body-md text-foreground">{getPriceDisplay()}</p>
        </Stack>
        <Stack className="gap-1">
          <p className="font-label-md text-neutral">コントラクトアドレス</p>
          <p className="font-body-md text-foreground">
            {token?.contract_address}
          </p>
        </Stack>
      </div>
      {/* right column */}
      <div className="flex-1 h-full overflow-hidden">
        <Tabs
          aria-label="Token Tabs"
          color="primary"
          variant="bordered"
          className="w-full"
          size="lg"
        >
          <Tab key="holders" title="保有者一覧" className="overflow-auto">
            <MemberList companyId={companyId} />
          </Tab>
          <Tab key="token-sales" title="トークン販売">
            <TokenSales companyId={companyId} tokenId={tokenId} />
          </Tab>
        </Tabs>
      </div>
    </main>
  );
};
