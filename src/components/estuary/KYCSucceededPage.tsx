import { Button, CheckboxGroup } from "@nextui-org/react";
import { FC, useState, useMemo } from "react";
import {
  PiArrowRight,
  PiArrowLeft,
  PiIdentificationCardFill,
  PiCheckCircleFill,
} from "react-icons/pi";
import Image from "next/image";
import { useAtom } from "jotai";
import { TermCheckbox } from "./TermCheckbox";
import { PRODUCT_TERMS } from "@/constants";
import { useEstuaryContext } from "./EstuaryContext";
import { useTranslation } from "next-i18next";

const KYCSucceededPage: FC = () => {
  const { page, setPage } = useEstuaryContext();
  const [termChecked, setTermChecked] = useState<string[]>([]);
  const { t } = useTranslation("estuary");
  const onClickBack = () => {
    setPage((page) => page - 1);
  };

  const onClickNext = async () => {
    setPage((page) => page + 1);
  };

  const isAllChecked = useMemo(() => {
    return PRODUCT_TERMS.every((term) => termChecked.includes(term.id));
  }, [termChecked]);

  return (
    <>
      {/* Header */}
      <div className="flex flex-col gap-2 p-6 pb-0">
        <PiIdentificationCardFill size={48} className="text-purple-600" />
        <h1 className="text-[28px] leading-8 font-bold text-slate-800">
          {t("Verify Your Identity")}
        </h1>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-4 flex-1 py-6 justify-center items-center">
        <PiCheckCircleFill size={112} className="text-success-600" />
        <div className="flex flex-col gap-2 items-center">
          <p className=" text-success-600 text-2xl text-center font-semibold">
            {t("Verification Succeeded")}
          </p>
          <p className="text-slate-500 text-base text-center font-medium">
            {t("Go to the token purchase confirmation page")}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-4 p-6 pt-0 pb-4">
        <div className="flex flex-col gap-4">
          {/* <CheckboxGroup
            className="flex flex-col gap-2 w-full h-fit bg-stone-100 rounded-2xl px-4 py-1"
            value={termChecked}
            onValueChange={setTermChecked}
          >
            {PRODUCT_TERMS.map((term, index) => (
              <TermCheckbox
                key={term.id}
                value={term.id}
                termName={term.name}
                href={term.url}
                isBorder={index !== PRODUCT_TERMS.length - 1}
              />
            ))}
          </CheckboxGroup> */}
          <Button
            className="w-full bg-yellow-700 text-white text-base font-semibold"
            endContent={<PiArrowRight color="white" />}
            onClick={onClickNext}
            size="lg"
            // isDisabled={!isAllChecked}
          >
            {t("Next")}
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

export default KYCSucceededPage;
