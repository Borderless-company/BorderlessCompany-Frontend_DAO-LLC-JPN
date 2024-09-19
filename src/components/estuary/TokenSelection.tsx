import { FC, useState } from "react";
import { RadioGroup } from "@nextui-org/react";
import { cn } from "@nextui-org/react";
import Image from "next/image";
import { Button } from "@nextui-org/react";
import { PiArrowRight } from "react-icons/pi";
import { TokenCard } from "./TokenCard";
import { estuarySample } from "@/types";
import { estuaryPageAtom } from "@/atoms";
import { useAtom } from "jotai";

export const TokenSelection: FC = () => {
  const [estuaryPage, setEstuaryPage] = useAtom(estuaryPageAtom);
  const onClickNext = () => {
    setEstuaryPage(1);
  };

  const [selectedTokenId, setSelectedTokenId] = useState<string>("");
  return (
    <>
      {/* Header */}
      <div className="flex flex-col gap-2 p-6 pb-0">
        <Image
          src={estuarySample.orgLogo}
          alt="DAO LLC Logo"
          width={48}
          height={48}
          style={{
            objectFit: "cover",
            width: "48px",
            height: "48px",
            flexShrink: 0,
          }}
        />
        <h1 className="text-[28px] leading-8 font-bold text-slate-800">
          {estuarySample.orgName} に出資する
        </h1>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-4 flex-1 py-6">
        <p className="text-slate-800 text-lg font-semibold pl-6">
          種類を選択してください。
        </p>
        <RadioGroup
          value={selectedTokenId}
          onValueChange={setSelectedTokenId}
          orientation="horizontal"
          classNames={{
            wrapper: cn(
              "flex gap-3 px-6 pt-0 pb-6 overflow-x-scroll flex-nowrap"
            ),
          }}
        >
          {estuarySample.token.map((token) => {
            return (
              <TokenCard
                key={token.id}
                name={token.name}
                value={token.id}
                imageSrc={token.image || ""}
                minPrice={token.minPrice || 0}
                maxPrice={token.maxPrice || 0}
              />
            );
          })}
        </RadioGroup>
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-4 p-6 pt-0 pb-4">
        <div className="flex flex-col">
          <div className="flex justify-between items-center h-14 px-2">
            <p className="text-slate-600 font-semibold text-2xl">金額</p>
            <p className="text-slate-700 font-semibold text-3xl">
              ¥
              {estuarySample.token
                .find((token) => token.id === selectedTokenId)
                ?.minPrice?.toLocaleString()}
            </p>
          </div>
          <Button
            className="w-full bg-yellow-700 text-white text-base font-semibold"
            endContent={<PiArrowRight color="white" />}
            onClick={onClickNext}
            size="lg"
          >
            次に進む
          </Button>
        </div>
        <div className="w-full flex justify-end items-center gap-2 px-2">
          <div className="w-fit text-slate-600 text-xs leading-3 font-normal font-mono pt-[2px]">
            powered by
          </div>
          <Image
            src={"/borderless_logotype.png"}
            alt="borderless logo"
            width={87}
            height={14}
          />
        </div>
      </div>
    </>
  );
};
