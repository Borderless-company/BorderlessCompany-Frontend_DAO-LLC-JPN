import { FC, useState } from "react";
import { NextPage } from "next";
import { useParams } from "next/navigation";
import Image from "next/image";
import { PiArrowRight } from "react-icons/pi";
import { Button, Radio, cn } from "@nextui-org/react";
import { TokenCard } from "@/components/estuary/TokenCard";
import { RadioGroup } from "@nextui-org/react";
import { estuarySample } from "@/types";

type EstuaryProps = {
  logoSrc: string;
  orgName: string;
  // tokens: Token[];
};

const sampleEstuaryProps: EstuaryProps = {
  logoSrc:
    "https://framerusercontent.com/images/0yjp86nOsmTzkszAiMuWmpHU1Fg.png",
  orgName: "Sample DAO LLC",
};

const Estuary: NextPage<EstuaryProps> = () => {
  // const { estId } = useParams<{ estId: string }>();
  const [selectedTokenId, setSelectedTokenId] = useState<string>("");
  return (
    <div className="w-full h-svh grid place-items-center">
      <div className="w-full max-w-[35rem] h-fit bg-white rounded-3xl shadow-xl p-6 gap-6 flex flex-col border-1 border-slate-200">
        <Image
          src={estuarySample.orgLogo}
          alt="DAO LLC Logo"
          width={56}
          height={56}
          style={{
            objectFit: "cover",
            width: "56px",
            height: "56px",
          }}
        />
        <div className="flex flex-col gap-2 ">
          <h1 className="text-3xl font-bold text-slate-800">
            {estuarySample.orgName} に出資する
          </h1>
          <p className="text-slate-800 text-lg font-semibold">
            種類を選択してください。
          </p>
          <RadioGroup
            value={selectedTokenId}
            onValueChange={setSelectedTokenId}
            orientation="horizontal"
            classNames={{
              wrapper: cn("flex gap-3 p-2 pb-6 overflow-x-scroll flex-nowrap"),
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
        <div className="flex flex-col gap-2">
          <div className="flex justify-between">
            <p className="text-slate-600 font-semibold text-xl">金額</p>
            <p className="text-slate-800 font-semibold text-xl">
              ¥
              {estuarySample.token
                .find((token) => token.id === selectedTokenId)
                ?.minPrice?.toLocaleString()}
            </p>
          </div>
          <Button
            className="w-full h-14 bg-yellow-700 text-white text-base font-semibold"
            endContent={<PiArrowRight color="white" />}
          >
            次に進む
          </Button>
        </div>
        <div className="w-full flex justify-end items-center gap-3">
          <div className="w-fit text-slate-600 text-sm font-normal font-mono">
            powered by
          </div>
          <Image
            src={"/borderless_logo.png"}
            alt="borderless logo"
            width={105}
            height={16}
          />
        </div>
      </div>
    </div>
  );
};

export default Estuary;
