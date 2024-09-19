import { estuaryPageAtom } from "@/atoms";
import { Button } from "@nextui-org/react";
import { FC } from "react";
import {
  PiArrowRight,
  PiArrowLeft,
  PiIdentificationCardFill,
} from "react-icons/pi";
import Image from "next/image";
import { useAtom } from "jotai";

const KYCPage: FC = () => {
  const [estuaryPage, setEstuaryPage] = useAtom(estuaryPageAtom);

  const onClickBack = () => {
    setEstuaryPage(estuaryPage - 1);
  };
  const onClickKYCSucceeded = () => {
    setEstuaryPage(estuaryPage + 1);
  };

  return (
    <>
      {/* Header */}
      <div className="flex flex-col gap-2 p-6 pb-0">
        <PiIdentificationCardFill size={48} className="text-purple-600" />
        <h1 className="text-[28px] leading-8 font-bold text-slate-800">
          本人確認をしてください
        </h1>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-4 flex-1 py-6 justify-center items-center">
        <Image src={"/QR_sample.png"} alt="QR code" width={216} height={216} />
        <div className="flex flex-col gap-2 items-center">
          <p className="text-slate-700 text-xl text-center font-semibold">
            QRコードを携帯端末から読み取って、
            <br /> 本人確認を行ってください
          </p>
          <Button
            className="text-sm w-fit"
            size="sm"
            variant="light"
            color="primary"
            onClick={onClickKYCSucceeded}
          >
            読み取れない方はこちら
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-4 p-6 pt-0 pb-4">
        <div className="flex flex-col">
          <Button
            className="w-fit text-base font-semibold"
            startContent={<PiArrowLeft color="blue" />}
            onClick={onClickBack}
            variant="bordered"
            color="primary"
            size="lg"
          >
            戻る
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

export default KYCPage;
