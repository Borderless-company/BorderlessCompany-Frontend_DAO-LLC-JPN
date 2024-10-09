import { estuaryPageAtom } from "@/atoms";
import { Button } from "@nextui-org/react";
import { FC } from "react";
import {
  PiArrowRight,
  PiArrowLeft,
  PiIdentificationCardFill,
  PiCheckCircleFill,
} from "react-icons/pi";
import Image from "next/image";
import { useAtom } from "jotai";
import { estuarySample } from "@/types";
import { useEstuaryContext } from "./EstuaryContext";
import { useEstuary } from "@/hooks/useEstuary";
import { useRouter } from "next/router";

// TODO: Context ではなくDBからToken情報取ってくる
const ReceivedPage: FC = () => {
  const [estuaryPage, setEstuaryPage] = useAtom(estuaryPageAtom);
  const { token } = useEstuaryContext();
  const router = useRouter();
  const { estId } = router.query;
  const { estuary } = useEstuary(estId as string);

  const onClickBack = () => {
    setEstuaryPage(estuaryPage - 1);
  };

  const onClickNext = () => {
    setEstuaryPage(0);
  };

  return (
    <>
      {/* Content */}
      <div className="flex flex-col gap-4 flex-1 py-6 justify-center items-center">
        <Image
          src={token?.image || "/estuary_logo_sample.png"}
          alt="check"
          width={112}
          height={112}
          className="rounded-2xl object-cover w-56 h-56"
        />
        <div className="flex flex-col gap-1 items-center">
          <div className="flex gap-1 items-center">
            <PiCheckCircleFill size={32} className="text-success-600" />
            <p className=" text-success-600 text-2xl text-center font-semibold">
              メンバー登録が完了しました。
            </p>
          </div>
          <p className="text-slate-500 text-base text-center font-medium">
            今日から{estuary?.org_name}の一員です
          </p>
        </div>
        {/* <div className="flex gap-2">
          <Image src={"/etherscan.png"} alt="org logo" width={32} height={32} />
          <Image src={"/opensea.png"} alt="org logo" width={32} height={32} />
        </div> */}
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-4 p-6 pt-0 pb-4">
        <div className="flex flex-col">
          <Button
            className="w-full bg-yellow-700 text-white text-base font-semibold"
            endContent={<PiArrowRight color="white" />}
            onClick={onClickNext}
            size="lg"
            isDisabled
          >
            社員専用ページ (Coming Soon...)
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

export default ReceivedPage;
