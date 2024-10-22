import { Button } from "@nextui-org/react";
import { FC, useEffect, useState } from "react";
import {
  PiArrowRight,
  PiArrowLeft,
  PiIdentificationCardFill,
  PiCheckCircleFill,
} from "react-icons/pi";
import Image from "next/image";
import SumsubWebSdk from "@sumsub/websdk-react";
import { MessageHandler } from "@sumsub/websdk";
import { useEstuaryContext } from "./EstuaryContext";
import { v4 as uuidv4 } from "uuid";
import { EventPayload } from "@sumsub/websdk/types/types";
import { useActiveAccount } from "thirdweb/react";
import { useToken } from "@/hooks/useToken";

export type AlreadyMemberProps = {
  orgLogo?: string;
  orgName?: string;
};

const AlreadyMember: FC<AlreadyMemberProps> = ({ orgLogo, orgName }) => {
  const { page, setPage } = useEstuaryContext();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const account = useActiveAccount();

  return (
    <>
      {/* Content */}
      <div className="flex flex-col gap-4 flex-1 py-6 justify-center items-center">
        <Image
          src={orgLogo || "/estuary_logo_sample.png"}
          alt="check"
          width={112}
          height={112}
          className="rounded-2xl object-cover w-56 h-56"
        />
        <div className="flex flex-col gap-1 items-center">
          <div className="flex gap-1 items-center">
            <PiCheckCircleFill size={32} className="text-success-600" />
            <p className=" text-success-600 text-xl text-center font-semibold">
              すでに{orgName || "このDAO"}のメンバーです
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-4 p-6 pt-0 pb-4">
        <div className="flex flex-col">
          <Button
            className="w-full bg-yellow-700 text-white text-base font-semibold"
            endContent={<PiArrowRight color="white" />}
            size="lg"
            onPress={() => {
              window.open("https://kabadao.gitbook.io/kaba-dao", "_blank");
            }}
            // isDisabled
          >
            社員専用ページへ
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

export default AlreadyMember;
