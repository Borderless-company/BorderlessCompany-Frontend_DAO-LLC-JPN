import { estuaryPageAtom } from "@/atoms";
import { Button, CheckboxGroup } from "@nextui-org/react";
import { FC, useState, useMemo } from "react";
import {
  PiArrowLeft,
  PiCheckCircleFill,
  PiCreditCardFill,
  PiArrowSquareOutBold,
} from "react-icons/pi";
import Image from "next/image";
import { useAtom } from "jotai";
import { estuarySample } from "@/types";
import { Checkbox, cn } from "@nextui-org/react";
import { TermCheckbox } from "./TermCheckbox";

const AgreementPage: FC = () => {
  const [estuaryPage, setEstuaryPage] = useAtom(estuaryPageAtom);
  const [termChecked, setTermChecked] = useState<string[]>([]);

  const onClickBack = () => {
    setEstuaryPage(estuaryPage - 1);
  };
  const onClickKYCSucceeded = () => {
    setEstuaryPage(estuaryPage + 1);
  };

  const isAllChecked = useMemo(() => {
    return termChecked.length === estuarySample.termSheet.length;
  }, [termChecked]);

  return (
    <>
      {/* Header */}
      <div className="flex flex-col gap-2 p-6 pb-0">
        <PiCheckCircleFill size={48} className="text-sky-600" />
        <h1 className="text-[28px] leading-8 font-bold text-slate-800">
          同意と確認
        </h1>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-4 flex-1 p-6 justify-start items-center overflow-y-scroll">
        <div className="flex flex-col gap-0 w-full">
          <div className="flex justify-between items-center w-full h-14 px-3 text-base font-semibold border-b-1 border-slate-200">
            <p>{estuarySample.token[0].name}</p>
            <p>¥{estuarySample.token[0].minPrice?.toLocaleString()}</p>
          </div>
          <div className="flex justify-between items-center w-full h-14 px-3 text-base font-semibold border-b-0 border-slate-200">
            <p>本人確認</p>
            <div className="flex items-center gap-1">
              <PiCheckCircleFill size={20} className="text-success-600" />
              <p className="text-success-600">確認済み</p>
            </div>
          </div>
        </div>
        <CheckboxGroup
          className="flex flex-col gap-2 w-full h-fit bg-stone-100 rounded-2xl px-4 py-1"
          value={termChecked}
          onValueChange={setTermChecked}
        >
          {estuarySample.termSheet.map((term, index) => (
            <TermCheckbox
              key={term.id}
              value={term.id}
              termName={term.name}
              href={term.url}
              isBorder={index !== estuarySample.termSheet.length - 1}
            />
          ))}
        </CheckboxGroup>
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-4 p-6 pt-0 pb-4">
        <div className="flex gap-2">
          <Button
            className="w-fit text-base font-semibold"
            startContent={
              <PiArrowLeft color="blue" className="flex-shrink-0" />
            }
            onClick={onClickBack}
            variant="bordered"
            color="primary"
            size="lg"
          >
            戻る
          </Button>
          <Button
            variant="solid"
            color="primary"
            size="lg"
            fullWidth
            startContent={<PiCreditCardFill size={24} />}
            onClick={onClickKYCSucceeded}
            isDisabled={!isAllChecked}
          >
            決済へ進む
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

export default AgreementPage;
