import { FC, useEffect, useState } from "react";
import { RadioGroup } from "@heroui/react";
import { cn } from "@heroui/react";
import Image from "next/image";
import { Button } from "@heroui/react";
import { PiArrowRight, PiSignIn } from "react-icons/pi";
import { TokenCard } from "./TokenCard";
import { useActiveAccount } from "thirdweb/react";
import { useEstuaryContext } from "./EstuaryContext";
import { useToken, createProduct } from "@/hooks/useToken";
import { useEstuary } from "@/hooks/useEstuary";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";

export const TokenSelection: FC = () => {
  const { t, i18n } = useTranslation("estuary");
  const account = useActiveAccount();
  const { setPage } = useEstuaryContext();
  const [selectedTokenId, setSelectedTokenId] = useState<string>();
  const { token, updateToken } = useToken(selectedTokenId);
  const router = useRouter();
  const { estId } = router.query;
  const { estuary, isLoading } = useEstuary(estId as string);
  const { connectWithGoogle, signIn, checkAccount, isConnecting, me } =
    useGoogleAuth();

  // 販売期間の状態を判定する関数
  const getSaleStatus = (startDate: string | null, endDate: string | null) => {
    if (!startDate || !endDate)
      return { status: "unknown", message: "販売期間が設定されていません" };

    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) return { status: "upcoming", message: "販売開始前です" };
    if (now > end)
      return { status: "ended", message: "販売期間が終了しました" };
    return { status: "active", message: "販売中" };
  };

  const saleStatus = getSaleStatus(
    estuary?.start_date || null,
    estuary?.end_date || null
  );
  const isSaleActive = saleStatus.status === "active";

  const onClickNext = async () => {
    setPage(1);
  };

  useEffect(() => {
    if (isLoading) {
      return;
    }
    setSelectedTokenId(estuary?.token.id);
  }, [estuary, isLoading]);

  useEffect(() => {
    setSelectedTokenId(selectedTokenId);
  }, [token, selectedTokenId]);

  useEffect(() => {
    if (me?.isLogin) {
      checkAccount();
    } else if (account?.address) {
      signIn();
    }
  }, [account?.address, me]);

  console.log("connecting: ", isConnecting);
  const handleConnect = async () => {
    try {
      await connectWithGoogle();
    } catch (error) {
      console.error("接続エラー:", error);
    }
  };

  console.log("language: ", i18n.language);

  return (
    <>
      {/* Header */}
      <div className="flex flex-col gap-1 md:gap-2 p-6 pb-0">
        <Image
          src={
            (estuary?.company?.icon as string) || "/company_icon_fallback.png"
          }
          alt="DAO LLC Logo"
          width={48}
          height={48}
          style={{
            objectFit: "cover",
            width: "48px",
            height: "48px",
            flexShrink: 0,
            borderRadius: "4px",
          }}
        />
        <h1 className="text-xl md:text-[28px] leading-8 font-bold text-slate-800">
          {i18n.language === "ja"
            ? `${estuary?.company?.COMPANY_NAME?.["ja-jp"]} ${t("Invest")}`
            : `${t("Invest")} ${estuary?.company?.COMPANY_NAME?.["en-us"]}`}
        </h1>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2 md:gap-4 flex-1 py-2 md:py-1">
        <p className="text-slate-800 text-base md:text-lg font-semibold pl-6">
          {estuary?.token.is_executable
            ? "業務執行社員権トークンを購入する"
            : "非業務執行社員権トークンを購入する"}
        </p>

        <RadioGroup
          value={selectedTokenId}
          onValueChange={setSelectedTokenId}
          orientation="horizontal"
          classNames={{
            wrapper: cn(
              "flex gap-3 px-6 pt-1 pb-6 overflow-x-scroll flex-nowrap justify-center"
            ),
          }}
        >
          <TokenCard
            key={estuary?.token.id}
            name={estuary?.token.name || ""}
            value={estuary?.token.id || ""}
            imageSrc={estuary?.token.image || "/token_image_fallback.png"}
            minPrice={estuary?.min_price || 0}
            maxPrice={estuary?.max_price || undefined}
            fixedPrice={estuary?.fixed_price || undefined}
          />
        </RadioGroup>
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-4 p-6 pt-0 pb-4">
        <div className="flex flex-col md:gap-2">
          <div className="flex justify-between items-center h-14 px-2">
            <p className="text-slate-600 font-semibold text-xl md:text-2xl">
              {t("Price")}
            </p>
            <p className="text-slate-700 font-semibold text-2xl md:text-3xl">
              ¥{estuary?.fixed_price?.toLocaleString()}
            </p>
          </div>
          {me?.isLogin ? (
            <Button
              className="w-full bg-yellow-700 text-white text-base font-semibold"
              endContent={
                isSaleActive ? <PiArrowRight color="white" /> : undefined
              }
              onPress={onClickNext}
              isDisabled={!token || !selectedTokenId || !isSaleActive}
              size="lg"
            >
              {!isSaleActive ? "販売期間外です" : t("Next")}
            </Button>
          ) : (
            <Button
              startContent={<PiSignIn color="white" />}
              className={`w-full text-white text-base font-semibold ${
                isSaleActive ? "bg-purple-700" : "bg-gray-400"
              }`}
              onPress={handleConnect}
              isLoading={isConnecting}
              isDisabled={!isSaleActive}
              size="lg"
            >
              {!isSaleActive
                ? saleStatus.message
                : isConnecting
                ? "サインインしています..."
                : t("Sign In")}
            </Button>
          )}
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
