import { FC } from "react";
import { NextPage } from "next";
import { useParams } from "next/navigation";
import Image from "next/image";
import { PiArrowRight } from "react-icons/pi";
import { Button, Radio, cn } from "@nextui-org/react";
import { TokenCard } from "@/components/estuary/TokenCard";
import { RadioGroup } from "@nextui-org/react";

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
  return (
    <div className="w-full h-svh grid place-items-center">
      <div className="w-full max-w-[35rem] h-fit bg-white rounded-3xl shadow-xl p-6 gap-6 flex flex-col">
        <Image
          src={sampleEstuaryProps.logoSrc}
          alt="DAO LLC Logo"
          width={56}
          height={56}
        />
        <div className="flex flex-col gap-2 ">
          <h1 className="text-3xl font-bold text-slate-800">
            {sampleEstuaryProps.orgName}の社員になる
          </h1>
          <p className="text-slate-800 text-lg font-semibold">
            種類を選択してください。
          </p>
          <RadioGroup
            orientation="horizontal"
            classNames={{
              wrapper: cn("flex gap-3 p-2 pb-6 overflow-x-scroll flex-nowrap"),
            }}
          >
            <TokenCard
              name="Sample Token"
              value="1"
              imageSrc="https://i.seadn.io/s/raw/files/6d531a9a8cd4f6245cc9896a83c9e09b.png?auto=format&dpr=1&w=1000"
              minPrice={1000}
              maxPrice={10000}
            />
            <TokenCard
              value="2"
              name="Sample Token"
              imageSrc="https://i.seadn.io/s/raw/files/c3f7b3d790c8eff1ce82af91234155ed.png?auto=format&dpr=1&w=1000"
              minPrice={1000}
              maxPrice={10000}
            />
            <TokenCard
              value="3"
              name="Sample Token"
              imageSrc="https://i.seadn.io/s/raw/files/6d531a9a8cd4f6245cc9896a83c9e09b.png?auto=format&dpr=1&w=1000"
              minPrice={1000}
              maxPrice={10000}
            />
          </RadioGroup>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between">
            <p className="text-slate-600 font-semibold text-xl">金額</p>
            <p className="text-slate-800 font-semibold text-xl">¥10,000</p>
          </div>
          <Button
            className="w-full h-14 bg-teal-700 text-white text-base font-semibold"
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
