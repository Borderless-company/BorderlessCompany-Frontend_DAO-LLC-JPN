import { estuaryPageAtom } from "@/atoms";
import { Button } from "@heroui/react";
import { FC, useEffect } from "react";
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
import { useActiveAccount } from "thirdweb/react";
import { useUser } from "@/hooks/useUser";
import { useTranslation } from "next-i18next";
// TODO: Context ではなくDBからToken情報取ってくる
const ReceivedPage: FC = () => {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { estId } = router.query;
  const { estuary } = useEstuary(estId as string);
  const account = useActiveAccount();

  // useEffect(() => {
  //   const sendEmail = async () => {
  //     try {
  //       await fetch("/api/mail/paymentSucceeded", {
  //         method: "POST",
  //         body: JSON.stringify({
  //           orgName: estuary?.sale_name,
  //           tokenName: token?.name,
  //           symbol: token?.symbol,
  //           tokenType: token?.is_executable ? "業務執行社員" : "非業務執行社員",
  //           price: price,
  //           to: user?.email,
  //           replyTo: "info@borderless.company",
  //         }),
  //       });
  //     } catch (error) {
  //       console.error(error);
  //     }
  //   };
  //   sendEmail();
  // }, []);

  const onClickNext = () => {
    window.open("https://kabadao.gitbook.io/kaba-dao", "_blank");
  };

  return (
    <>
      {/* Content */}
      <div className="flex flex-col gap-4 flex-1 py-6 justify-center items-center">
        <Image
          src={estuary?.token?.image || "/token_image_fallback.png"}
          alt="check"
          width={112}
          height={112}
          className="rounded-2xl object-cover w-56 h-56"
        />
        <div className="flex flex-col gap-1 items-center">
          <div className="flex gap-1 items-center">
            <PiCheckCircleFill size={32} className="text-success-600" />
            <p className=" text-success-600 text-2xl text-center font-semibold">
              {t("Registered as a Member")}
            </p>
          </div>
          <p className="text-slate-500 text-base text-center font-medium">
            {i18n.language === "ja"
              ? `今日から${estuary?.company?.COMPANY_NAME?.["ja-jp"]}の一員です`
              : `Now, you are a member of ${estuary?.company?.COMPANY_NAME?.["en-us"]}`}
          </p>
        </div>
        {/* <div className="flex gap-2">
          <Image src={"/etherscan.png"} alt="org logo" width={32} height={32} />
          <Image src={"/opensea.png"} alt="org logo" width={32} height={32} />
        </div> */}
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-4 p-6 pt-0 pb-4">
        {/* <div className="flex flex-col">
          <Button
            className="w-full bg-yellow-700 text-white text-base font-semibold"
            endContent={<PiArrowRight color="white" />}
            onClick={onClickNext}
            size="lg"
            // isDisabled
          >
            {t("Dive into the member's page")}
          </Button>
        </div> */}
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
