import { Stack } from "@/sphere/Stack";
import { Tables } from "@/types/schema";
import { Button, Chip, Tab, Tabs } from "@heroui/react";
import Image from "next/image";
import { FC } from "react";
import { PiPencil } from "react-icons/pi";
import MemberList from "../members/MemberList";

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
  }).format(price);
};

export type TokensPageProps = {
  companyId: string;
};

const dummyToken: Partial<Tables<"TOKEN">> = {
  symbol: "EXT",
  name: "Exective Token",
  image: "/globe.png",
  min_price: 100000,
  max_price: 500000,
  description:
    "業務執行社員トークンです。業務執行社員トークンです。業務執行社員トークンです。業務執行社員トークンです。業務執行社員トークンです。",
  contract_address: "0xaaa",
};

export const TokensPage: FC<TokensPageProps> = ({ companyId }) => {
  const getPriceDisplay = () => {
    if (dummyToken.fixed_price) {
      return formatPrice(dummyToken.fixed_price);
    }
    if (dummyToken.min_price && dummyToken.max_price) {
      return `${formatPrice(dummyToken.min_price)} - ${formatPrice(
        dummyToken.max_price
      )}`;
    }
    return "価格未設定";
  };

  return (
    <main className="w-full h-full overflow-scroll px-6 py-4 flex gap-4">
      {/* left column */}
      <div className="w-60 h-fit flex-shrink-0 flex flex-col gap-4">
        <Image
          src="/globe.png"
          width={240}
          height={240}
          alt="logo"
          className="rounded-lg object-cover"
        />
        <Stack className="gap-0">
          <p className="font-label-lg text-neutral ">{dummyToken.symbol}</p>
          <h2 className="font-title-lg text-foreground ">{dummyToken.name}</h2>
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
          <p className="font-body-md text-foreground">
            {dummyToken.description}
          </p>
        </Stack>
        <Stack className="gap-1">
          <p className="font-label-md text-neutral">販売価格</p>
          <p className="font-body-md text-foreground">{getPriceDisplay()}</p>
        </Stack>
        <Stack className="gap-1">
          <p className="font-label-md text-neutral">コントラクトアドレス</p>
          <p className="font-body-md text-foreground">
            {dummyToken.contract_address}
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
            <div className="h-full overflow-auto">token-sales</div>
          </Tab>
        </Tabs>
      </div>
    </main>
  );
};
