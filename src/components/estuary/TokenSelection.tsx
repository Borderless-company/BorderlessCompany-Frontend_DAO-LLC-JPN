import { FC, useEffect, useState } from "react";
import { RadioGroup } from "@heroui/react";
import { cn } from "@heroui/react";
import Image from "next/image";
import { Button } from "@heroui/react";
import { PiArrowRight, PiSignIn, PiGoogleLogo } from "react-icons/pi";
import { TokenCard } from "./TokenCard";
import { useEstuaryContext } from "./EstuaryContext";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { useWalletConnection } from "@/hooks/useWalletConnection";
import { useSiweAuth } from "@/hooks/useSiweAuth";
import { FirebasePhoneAuthModal } from "@/components/login/FirebasePhoneAuthModal";
import { useEstuary } from "@/hooks/useEstuary";
import { SignInOptionsModal } from "@/components/login/SignInOptionsModal";

export const TokenSelection: FC = () => {
  const { t, i18n } = useTranslation("estuary");
  const { setPage } = useEstuaryContext();
  const [selectedTokenId, setSelectedTokenId] = useState<string>();
  const router = useRouter();
  const { estId } = router.query;
  const { estuary, isLoading } = useEstuary(estId as string);

  // 分離されたフックを使用
  const { connectWithGoogle, isConnecting: isWalletConnecting } =
    useWalletConnection();
  const { signIn, isAuthenticating, me } = useSiweAuth();

  const [isPhoneAuthModalOpen, setIsPhoneAuthModalOpen] = useState(false);
  const [isSignInOptionsModalOpen, setIsSignInOptionsModalOpen] =
    useState(false);
  const [isPhoneConnecting, setIsPhoneConnecting] = useState(false);

  const showKyosoIdLogin = true;

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

  const handleGoogleConnect = async () => {
    try {
      // ウォレット接続後に認証を実行
      await connectWithGoogle();
      await signIn();
    } catch (error) {
      console.error("Google接続エラー:", error);
    }
  };

  const handlePhoneAuthOpen = () => {
    setIsPhoneAuthModalOpen(true);
  };

  const handlePhoneAuthClose = () => {
    setIsPhoneAuthModalOpen(false);
  };

  const handleSiweTrigger = async () => {
    try {
      setIsPhoneConnecting(true);
      await signIn();
    } catch (error) {
      console.error("SIWE-trigger failed:", error);
    } finally {
      setIsPhoneConnecting(false);
      handlePhoneAuthClose();
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSignInOptionsModalOpen(false);
    await handleGoogleConnect();
  };

  const handleKyosoIdSignIn = () => {
    setIsSignInOptionsModalOpen(false);
    handlePhoneAuthOpen();
  };

  // ローディング状態の計算
  const isGoogleLoading = isWalletConnecting || isAuthenticating;
  const isPhoneLoading = isPhoneConnecting || isAuthenticating;

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
              isDisabled={!isSaleActive}
              size="lg"
            >
              {!isSaleActive ? "販売期間外です" : t("Next")}
            </Button>
          ) : (
            <Button
              startContent={<PiSignIn color="white" />}
              className={`w-full text-white text-base font-semibold ${
                isSaleActive ? "bg-blue-700" : "bg-gray-400"
              }`}
              onPress={() => setIsSignInOptionsModalOpen(true)}
              isLoading={isGoogleLoading || isPhoneLoading}
              isDisabled={!isSaleActive}
              size="lg"
            >
              {!isSaleActive
                ? saleStatus.message
                : isGoogleLoading || isPhoneLoading
                ? "処理中..."
                : "サインインして進む"}
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
      <SignInOptionsModal
        isOpen={isSignInOptionsModalOpen}
        onClose={() => setIsSignInOptionsModalOpen(false)}
        onGoogleClick={handleGoogleSignIn}
        onKyosoIdClick={handleKyosoIdSignIn}
        showKyosoIdLogin={showKyosoIdLogin}
        isGoogleLoading={isGoogleLoading}
        isPhoneLoading={isPhoneLoading}
      />
      <FirebasePhoneAuthModal
        isOpen={isPhoneAuthModalOpen}
        onClose={handlePhoneAuthClose}
        onSiweTrigger={handleSiweTrigger}
      />
    </>
  );
};
