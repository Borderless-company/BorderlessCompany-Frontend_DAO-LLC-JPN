import { FC } from "react";
import { PiCardholderFill } from "react-icons/pi";
import Image from "next/image";
import { useEstuaryContext } from "./EstuaryContext";
import { useTranslation } from "next-i18next";

const PaymentPage: FC = () => {
  const { t } = useTranslation("estuary");

  const { token, price } = useEstuaryContext();

  return (
    <>
      {/* Header */}
      <div className="flex flex-col gap-2 p-6 pb-0 relative">
        <PiCardholderFill size={48} className="text-sky-600" />
        <h1 className="text-[28px] leading-8 font-bold text-slate-800">
          {t("Payment")}
        </h1>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2 flex-1 p-6 justify-start items-center overflow-y-scroll">
        <div className="flex justify-between items-center w-full h-14  text-base font-semibold  border-slate-200">
          <p className="text-foreground font-title-lg">{token?.name}</p>
          <p className="text-foreground font-headline-sm">
            ¥{price?.toLocaleString()}
          </p>
        </div>
        <div className="flex flex-col gap-2 font-label-lg w-full">
          <p className="text-foreground font-label-lg">銀行口座振込で支払う</p>
          <div className="w-full p-4 rounded-lg bg-[#F5F5F4] border-1 border-[#D6D3D1]">
            <p className="text-foreground font-body-md mb-4">
              カ) ボーダレスジャパン
              <br />
              みずほ銀行 ◯◯支店
              <br />
              普通 12345678
            </p>
            <p className="text-foreground font-body-md">
              ※ 支払い手数料はご負担いただきますようお願いいたします。
              <br />※ お振込の確認が取れ次第メールにてご連絡いたします。
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-4 p-6 pt-0 pb-4">
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

export default PaymentPage;
