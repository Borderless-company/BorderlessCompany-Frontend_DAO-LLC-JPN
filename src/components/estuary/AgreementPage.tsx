import { Button, CheckboxGroup, useDisclosure } from "@heroui/react";
import { FC, useState, useMemo, useEffect, useRef } from "react";
import {
  PiArrowLeft,
  PiCheckCircleFill,
  PiCreditCardFill,
} from "react-icons/pi";
import Image from "next/image";
import { estuarySample } from "@/types";
import { TermCheckbox } from "./TermCheckbox";
import { useEstuaryContext } from "./EstuaryContext";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { useEstuary } from "@/hooks/useEstuary";
import { usePayment } from "@/hooks/usePayment";
import { TokenAgreementModal } from "../company/TokenAgreementModal";
import { OperationRegulationModal } from "../company/OperationRegulationModal";
import { GovAgreementModal } from "../company/GovAgreementModal";
import { AoIModal } from "../company/AoIModal";
import { useActiveAccount } from "thirdweb/react";
import { isStatelessDao } from "@/utils/company";

const AgreementPage: FC = () => {
  const { t } = useTranslation("estuary");
  const router = useRouter();
  const { estId } = router.query;
  const { estuary } = useEstuary(estId as string);
  const account = useActiveAccount();
  const { createPayment } = usePayment();
  const [termChecked, setTermChecked] = useState<string[]>([]);
  const [paymentStatus, setPaymentStatus] = useState<
    "initial" | "pending" | "success" | "failed"
  >("initial");
  const { setPage } = useEstuaryContext();
  const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const {
    isOpen: isOpenAoIModal,
    onOpen: onOpenAoIModal,
    onOpenChange: onOpenChangeAoIModal,
  } = useDisclosure();

  const {
    isOpen: isOpenGovAgreementModal,
    onOpen: onOpenGovAgreementModal,
    onOpenChange: onOpenChangeGovAgreementModal,
  } = useDisclosure();

  const {
    isOpen: isOpenOperationRegulationModal,
    onOpen: onOpenOperationRegulationModal,
    onOpenChange: onOpenChangeOperationRegulationModal,
  } = useDisclosure();

  const {
    isOpen: isOpenTokenAgreementModal,
    onOpen: onOpenTokenAgreementModal,
    onOpenChange: onOpenChangeTokenAgreementModal,
  } = useDisclosure();

  const startPaymentPolling = () => {
    if (!account?.address || !estuary?.id) return;

    // 1時間後にタイムアウト
    pollingTimeoutRef.current = setTimeout(() => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      setPaymentStatus("failed");
      console.log("Payment polling timed out after 1 hour");
    }, 60 * 60 * 1000); // 1時間

    // 5秒間隔でpolling
    pollingIntervalRef.current = setInterval(async () => {
      try {
        const response = await fetch(
          `/api/payment?userId=${account.address}&estuaryId=${estuary.id}`,
          { method: "GET" }
        );
        const json = await response.json();

        if (response.ok && json.data && json.data.length > 0) {
          const payment = json.data[0];
          if (payment.payment_status === "done") {
            // polling停止
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
            }
            if (pollingTimeoutRef.current) {
              clearTimeout(pollingTimeoutRef.current);
            }

            setPaymentStatus("success");
            setPage(6);
          }
        }
      } catch (error) {
        console.error("Payment status polling error:", error);
      }
    }, 5000); // 5秒間隔
  };

  const onClickPay = async () => {
    if (!estuary) {
      console.error("Estuary情報が取得できません");
      return;
    }

    setPaymentStatus("pending");

    try {
      // 新しいペイメントを作成
      await createPayment({
        user_id: account?.address,
        estuary_id: estuary.id,
        price: estuary.fixed_price,
        payment_status: "pending",
      });

      // payment_linkがある場合は別タブで開く、ない場合は次のページに移動
      if (estuary.payment_link) {
        window.open(
          `${estuary.payment_link}?recipientAddress=${account?.address}`,
          "_blank"
        );

        // polling開始
        startPaymentPolling();
      }
    } catch (error) {
      console.error("ペイメントの作成に失敗しました:", error);
      setPaymentStatus("failed");
      // エラー状態を少し表示してからリセット
      setTimeout(() => setPaymentStatus("initial"), 3000);
    }
  };

  const onClickBack = () => {
    setPage((page) => page - 1);
  };

  const isAllChecked = useMemo(() => {
    return termChecked.length === 4 && !isStatelessDao(estuary?.company);
  }, [termChecked]);

  // コンポーネントのアンマウント時にpollingをクリーンアップ
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      {/* Header */}
      <div className="flex flex-col gap-2 p-6 pb-0 relative">
        <PiCheckCircleFill size={48} className="text-sky-600" />
        <h1 className="text-[28px] leading-8 font-bold text-slate-800">
          {t("Confirmation")}
        </h1>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-4 flex-1 p-6 justify-start items-center overflow-y-scroll">
        <div className="flex flex-col gap-0 w-full">
          <div className="flex justify-between items-center w-full h-14 px-3 text-base font-semibold border-b-1 border-slate-200">
            <p>{estuary?.token.name}</p>
            <p>¥{estuary?.fixed_price?.toLocaleString()}</p>
          </div>
          <div className="flex justify-between items-center w-full h-14 px-3 text-base font-semibold border-b-0 border-slate-200">
            <p>{t("Identity")}</p>
            <div className="flex items-center gap-1">
              <PiCheckCircleFill size={20} className="text-success-600" />
              <p className="text-success-600">{t("Verified")}</p>
            </div>
          </div>
        </div>
        {!isStatelessDao(estuary?.company) && (
          <CheckboxGroup
            className="flex flex-col gap-2 w-full h-fit bg-stone-100 rounded-2xl px-4 py-1"
            value={termChecked}
            onValueChange={setTermChecked}
            isDisabled={paymentStatus === "pending"}
          >
            <TermCheckbox
              value={"aoi"}
              termName={"定款"}
              isBorder
              isExternal={false}
              onPressLink={onOpenAoIModal}
            />
            <TermCheckbox
              value={"gov-agreement"}
              termName={"総会規定"}
              isBorder
              isExternal={false}
              onPressLink={onOpenGovAgreementModal}
            />
            <TermCheckbox
              value={"token-agreement"}
              termName={"トークン規定"}
              isBorder
              isExternal={false}
              onPressLink={onOpenTokenAgreementModal}
            />
            <TermCheckbox
              value={"op-regulation"}
              termName={"運用規定"}
              isBorder={false}
              isExternal={false}
              onPressLink={onOpenOperationRegulationModal}
            />
          </CheckboxGroup>
        )}
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-4 p-6 pt-0 pb-4">
        <div className="flex gap-2">
          <Button
            className="w-fit text-base font-semibold"
            startContent={
              <PiArrowLeft color="blue" className="flex-shrink-0" />
            }
            onPress={onClickBack}
            variant="bordered"
            color="primary"
            size="lg"
            // isDisabled={paymentStatus === "pending"}
          >
            {t("Back")}
          </Button>
          <Button
            className="w-fit text-base font-semibold"
            startContent={
              paymentStatus === "initial" && (
                <PiCreditCardFill className="flex-shrink-0" />
              )
            }
            onPress={onClickPay}
            variant="solid"
            color="primary"
            size="lg"
            isDisabled={!isAllChecked || !estuary?.payment_link}
            isLoading={paymentStatus === "pending"}
            style={{ flex: 1 }}
          >
            {paymentStatus === "initial"
              ? t("Check Out")
              : paymentStatus === "pending"
              ? "支払い中..."
              : paymentStatus === "failed"
              ? "エラーが発生しました"
              : t("Check Out")}
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
      <AoIModal
        companyId={estuary?.company_id || ""}
        isOpen={isOpenAoIModal}
        onOpenChange={onOpenChangeAoIModal}
      />
      <GovAgreementModal
        companyId={estuary?.company_id || ""}
        isOpen={isOpenGovAgreementModal}
        onOpenChange={onOpenChangeGovAgreementModal}
      />
      <OperationRegulationModal
        companyId={estuary?.company_id || ""}
        isOpen={isOpenOperationRegulationModal}
        onOpenChange={onOpenChangeOperationRegulationModal}
      />
      <TokenAgreementModal
        companyId={estuary?.company_id || ""}
        isOpen={isOpenTokenAgreementModal}
        onOpenChange={onOpenChangeTokenAgreementModal}
      />
    </>
  );
};

export default AgreementPage;
