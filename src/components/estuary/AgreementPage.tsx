import { Button, CheckboxGroup } from "@nextui-org/react";
import { FC, useState, useMemo, useEffect } from "react";
import {
  PiArrowLeft,
  PiCheckCircleFill,
  PiCreditCardFill,
} from "react-icons/pi";
import Image from "next/image";
import { estuarySample } from "@/types";
import { TermCheckbox } from "./TermCheckbox";
import { useEstuaryContext } from "./EstuaryContext";
import { createPaymentLink } from "@/utils/stripe";
import { useActiveAccount } from "thirdweb/react";
import { useUser } from "@/hooks/useUser";
import { supabase } from "@/utils/supabase";
import { usePayment } from "@/hooks/usePayment";
import { useMember } from "@/hooks/useMember";

const POLLING_INTERVAL = 3000;
const MAX_POLLING_TIME = 600000;

const AgreementPage: FC = () => {
  const [termChecked, setTermChecked] = useState<string[]>([]);
  const [paymentStatus, setPaymentStatus] = useState<
    "initial" | "pending" | "success" | "failed"
  >("initial");
  const { token, price, page, setPage } = useEstuaryContext();
  const account = useActiveAccount();
  const { updateUser } = useUser(account?.address);
  const [pollingCount, setPollingCount] = useState(0);
  const { updatePayment } = usePayment();
  const { createMember } = useMember({});

  const onClickPay = async () => {
    if (!token?.product_id || !price) return;
    setPaymentStatus("pending");
    const paymentLink = await createPaymentLink(token.product_id, price);
    console.log("paymentLink:", paymentLink);
    const user = await updateUser({
      evm_address: account?.address,
    });
    const payment = await updatePayment({
      user_id: account?.address,
      payment_link: paymentLink.id,
      price: price,
    });
    console.log("updated user:", user);
    startPolling();
    window.open(paymentLink.url, "_blank");
  };

  const onClickBack = () => {
    setPage((page) => page - 1);
  };

  const isAllChecked = useMemo(() => {
    return termChecked.length === estuarySample.termSheet.length;
  }, [termChecked]);

  useEffect(() => {
    const addMember = async () => {
      await createMember({
        dao_id: token?.dao_id,
        user_id: account?.address,
        date_of_employment: new Date().toISOString(),
        is_admin: false,
        is_executive: token?.is_executable,
        token_id: token?.id,
        invested_amount: price,
        is_minted: false,
      });
    };

    if (paymentStatus === "success") {
      addMember();
      setPage((page) => page + 1);
    }
  }, [paymentStatus]);

  const startPolling = () => {
    const pollInterval = setInterval(async () => {
      if (!account?.address) return;
      const { data: status } = await supabase
        .from("PAYMENT")
        .select("payment_status")
        .eq("user_id", account?.address);

      console.log("status:", status);
      setPollingCount((count) => count + 1);

      if (status && status[0]?.payment_status === "done") {
        setPaymentStatus("success");
        clearInterval(pollInterval);
      }

      if (pollingCount * POLLING_INTERVAL >= MAX_POLLING_TIME) {
        clearInterval(pollInterval);
        setPaymentStatus("failed");
      }
    }, POLLING_INTERVAL);

    // コンポーネントのアンマウント時にポーリングを停止
    return () => clearInterval(pollInterval);
  };

  return (
    <>
      {/* Header */}
      <div className="flex flex-col gap-2 p-6 pb-0 relative">
        <PiCheckCircleFill size={48} className="text-sky-600" />
        <h1 className="text-[28px] leading-8 font-bold text-slate-800">
          同意と確認
        </h1>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-4 flex-1 p-6 justify-start items-center overflow-y-scroll">
        <div className="flex flex-col gap-0 w-full">
          <div className="flex justify-between items-center w-full h-14 px-3 text-base font-semibold border-b-1 border-slate-200">
            <p>{token?.name}</p>
            <p>¥{price?.toLocaleString()}</p>
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
          isDisabled={paymentStatus === "pending"}
        >
          {/* TODO: TermsheetsのDB作成繋ぎ込み */}
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
            className="w-fit text-base font-semibold"
            startContent={
              paymentStatus === "initial" && (
                <PiCreditCardFill className="flex-shrink-0" />
              )
            }
            onClick={onClickPay}
            variant="solid"
            color="primary"
            size="lg"
            isDisabled={!isAllChecked}
            isLoading={paymentStatus === "pending"}
            style={{ flex: 1 }}
          >
            {paymentStatus === "initial" ? "支払う" : "支払い処理中..."}
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
