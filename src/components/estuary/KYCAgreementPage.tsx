import { Button, CheckboxGroup, Input, Spinner } from "@heroui/react";
import { FC, useState, useMemo, useEffect } from "react";
import {
  PiArrowRight,
  PiArrowLeft,
  PiIdentificationCardFill,
  PiCheckCircleFill,
} from "react-icons/pi";
import Image from "next/image";
import { TermCheckbox } from "./TermCheckbox";
import { PRODUCT_TERMS } from "@/constants";
import { useForm, Controller } from "react-hook-form";
import { supabase } from "@/utils/supabase";
import { useActiveAccount } from "thirdweb/react";
import { useEstuaryContext } from "./EstuaryContext";
import { useUser } from "@/hooks/useUser";
import { usePayment } from "@/hooks/usePayment";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";

type InputType = {
  name: string;
  furigana: string;
  address: string;
};

const KYCAgreementPage: FC = () => {
  const { t } = useTranslation("estuary");
  const { setPage, tokenId, price } = useEstuaryContext();
  const [termChecked, setTermChecked] = useState<string[]>([]);
  const { register, handleSubmit, setValue } = useForm<InputType>();
  const account = useActiveAccount();
  const { createUser, user } = useUser(account?.address);
  const { createPayment, getPayments } = usePayment();
  const router = useRouter();
  const { data: payments } = getPayments({
    userId: account?.address as string,
    estId: router.query.estId as string,
  });

  const isAllChecked = useMemo(() => {
    return PRODUCT_TERMS.every((term) => termChecked.includes(term.id));
  }, [termChecked]);

  // ユーザー情報が既に存在する場合はフォームに設定
  useEffect(() => {
    if (user) {
      if (user.name) setValue("name", user.name);
      if (user.furigana) setValue("furigana", user.furigana);
      if (user.address) setValue("address", user.address);

      // 全ての必要な情報が設定されていれば次のページに進む
      if (user.name && user.furigana && user.address) {
        console.log("User information already exists, skipping to next page");
        // 支払い情報がまだなければ作成
        if (!payments || payments.length === 0) {
          createPayment({
            user_id: user.evm_address,
            estuary_id: router.query.estId as string,
            price: price,
            payment_status: "yet",
          }).then(() => {
            setPage((page) => page + 1);
          });
        } else {
          setPage((page) => page + 1);
        }
      }
    }
  }, [
    user,
    setValue,
    payments,
    createPayment,
    router.query.estId,
    price,
    setPage,
  ]);

  const onSubmit = async (data: InputType) => {
    const user = await createUser({
      evm_address: account?.address,
      ...data,
    });
    console.log("user:", user);
    const payment = await createPayment({
      user_id: user.evm_address,
      estuary_id: router.query.estId as string,
      price: price,
      payment_status: "yet",
    });
    console.log("original payment:", payments);
    console.log("payment:", payment);
    setPage((page) => page + 1);
  };

  // ユーザー情報の読み込み中は読み込み表示
  if (user && user.name && user.furigana && user.address) {
    return (
      <div className="flex justify-center items-center p-4 h-full">
        <Spinner />
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="flex flex-col gap-1 md:gap-2 p-6 pb-0">
        <PiIdentificationCardFill size={48} className="text-purple-600" />
        <h1 className="text-xl md:text-[28px] leading-8 font-bold text-slate-800">
          {t("Enter Your Information")}
        </h1>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-4 flex-1 py-6 justify-start items-center px-6">
        <form
          id="user-info-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4 w-full"
        >
          <div className="w-full flex flex-wrap gap-4 ">
            <Input
              label={t("Name")}
              labelPlacement="outside"
              placeholder="田中太郎"
              size="lg"
              isRequired
              // style={{ minWidth: "200px", flexGrow: 1, flexShrink: 1 }}
              {...register("name", { required: t("Enter Your Name") })}
            />
            <Input
              label={t("Furigana")}
              labelPlacement="outside"
              placeholder="たなかたろう"
              size="lg"
              isRequired
              // style={{ minWidth: "200px", flexGrow: 1, flexShrink: 1 }}
              {...register("furigana", {
                required: t("Please Enter Your Furigana"),
              })}
            />
          </div>
          <Input
            label={t("Address")}
            labelPlacement="outside"
            placeholder="東京都千代田区千代田1-1-1"
            size="lg"
            isRequired
            {...register("address", {
              required: t("Please Enter Your Address"),
            })}
          />
        </form>
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-4 p-6 pt-0 pb-4">
        <div className="flex flex-col gap-4">
          <CheckboxGroup
            className="flex flex-col gap-2 w-full h-fit bg-stone-100 rounded-2xl px-2 sm:px-2 py-1"
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
            // onClick={onClickNext}
            size="lg"
            type="submit"
            form="user-info-form"
            isDisabled={!isAllChecked}
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

export default KYCAgreementPage;
