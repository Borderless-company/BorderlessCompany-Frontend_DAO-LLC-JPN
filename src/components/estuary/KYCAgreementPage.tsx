import { estuaryPageAtom } from "@/atoms";
import { Button, CheckboxGroup, Input } from "@nextui-org/react";
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
import { useForm, Controller } from "react-hook-form";

type InputType = {
  name: string;
  furigana: string;
  address: string;
};

const KYCAgreementPage: FC = () => {
  const [estuaryPage, setEstuaryPage] = useAtom(estuaryPageAtom);
  const [termChecked, setTermChecked] = useState<string[]>([]);
  const { register, handleSubmit, control } = useForm<InputType>();
  const onClickBack = () => {
    setEstuaryPage(estuaryPage - 1);
  };

  const onClickNext = () => {
    setEstuaryPage(estuaryPage + 1);
  };

  const isAllChecked = useMemo(() => {
    return PRODUCT_TERMS.every((term) => termChecked.includes(term.id));
  }, [termChecked]);

  const onSubmit = (data: InputType) => {
    console.log(data);
  };

  return (
    <>
      {/* Header */}
      <div className="flex flex-col gap-2 p-6 pb-0">
        <PiIdentificationCardFill size={48} className="text-purple-600" />
        <h1 className="text-[28px] leading-8 font-bold text-slate-800">
          ユーザー情報を入力してください
        </h1>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-4 flex-1 py-6 justify-start items-center px-6">
        <form
          id="user-info-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4 w-full"
        >
          <div className="flex gap-4">
            <Input
              label="氏名"
              labelPlacement="outside"
              placeholder="田中太郎"
              size="lg"
              isRequired
              {...register("name", { required: "氏名を入力してください" })}
            />
            <Input
              label="ふりがな"
              labelPlacement="outside"
              placeholder="タナカタロウ"
              size="lg"
              isRequired
              {...register("furigana", {
                required: "ふりがなを入力してください",
              })}
            />
          </div>
          <Input
            label="住所"
            labelPlacement="outside"
            placeholder="東京都千代田区千代田1-1-1"
            size="lg"
            isRequired
            {...register("address", { required: "住所を入力してください" })}
          />
        </form>
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-4 p-6 pt-0 pb-4">
        <div className="flex flex-col gap-4">
          <CheckboxGroup
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
          </CheckboxGroup>
          <Button
            className="w-full bg-yellow-700 text-white text-base font-semibold"
            endContent={<PiArrowRight color="white" />}
            onClick={onClickNext}
            size="lg"
            type="submit"
            form="user-info-form"
            isDisabled={!isAllChecked}
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

export default KYCAgreementPage;
