import { Button, ButtonProps } from "@heroui/react";
import clsx from "clsx";
import { useTranslation } from "next-i18next";
import Image from "next/image";
import { useRouter } from "next/router";
import { ComponentPropsWithoutRef, FC, useEffect, useState } from "react";
import { PiArrowSquareOut, PiGoogleLogo, PiSignIn } from "react-icons/pi";
import { useActiveAccount, useActiveWallet } from "thirdweb/react";
import { useWalletConnection } from "@/hooks/useWalletConnection";
import { useSiweAuth } from "@/hooks/useSiweAuth";
import { SignInOptionsModal } from "@/components/login/SignInOptionsModal";
import { FirebasePhoneAuthModal } from "@/components/login/FirebasePhoneAuthModal";

type LoginPageProps = {
  page: number;
  onPageChange: (page: number) => void;
  isLoadingCompany: boolean;
};

export const LoginPage: FC<LoginPageProps> = ({
  page,
  onPageChange,
  isLoadingCompany,
}) => {
  console.log("🏁 [LoginPage] コンポーネント開始");

  const smartAccount = useActiveAccount();
  const smartWallet = useActiveWallet();

  console.log("🔍 [LoginPage] Hook実行結果:");
  console.log("  - smartAccount:", smartAccount?.address || "undefined");
  console.log("  - smartWallet:", smartWallet ? "存在" : "なし");

  // 分離されたフックを使用
  const { connectWithGoogle, isConnecting: isWalletConnecting } =
    useWalletConnection();

  console.log("🔍 [LoginPage] useWalletConnection結果:");
  console.log("  - isWalletConnecting:", isWalletConnecting);

  // Firebase認証で得られたアカウント情報をuseSiweAuthに渡す
  const [firebaseAccount, setFirebaseAccount] = useState<any>(null);
  const [firebaseWallet, setFirebaseWallet] = useState<any>(null);

  // 外部アカウント情報（Firebase認証後のアカウント > 通常のsmartAccount）
  const externalAccount = firebaseAccount || smartAccount;
  const externalWallet = firebaseWallet || smartWallet;

  const { signIn, isAuthenticating, me, checkAccount, signInWithAddress } =
    useSiweAuth({
      onNoAccount: () => {
        onPageChange(1);
      },
      externalAccount: externalAccount,
      externalWallet: externalWallet,
    });

  console.log("🔍 [LoginPage] useSiweAuth結果:");
  console.log("  - isAuthenticating:", isAuthenticating);
  console.log("  - me:", me);
  console.log("  - isLoggedIn:", !!me?.isLogin);

  // モーダル状態管理
  const [isSignInOptionsModalOpen, setIsSignInOptionsModalOpen] =
    useState(false);
  const [isPhoneAuthModalOpen, setIsPhoneAuthModalOpen] = useState(false);
  const [isPhoneConnecting, setIsPhoneConnecting] = useState(false);

  // Firebase認証フロー中フラグ（自動signInを無効化するため）
  const [isFirebaseFlow, setIsFirebaseFlow] = useState(false);

  // ローディング状態の計算
  const isGoogleLoading = isWalletConnecting || isAuthenticating;
  const isPhoneLoading = isPhoneConnecting || isAuthenticating;
  const isConnecting = isGoogleLoading || isPhoneLoading;

  useEffect(() => {
    console.log("🔍 [LoginPage] useEffect実行:", {
      isLogin: me?.isLogin,
      smartAccountAddress: smartAccount?.address,
      smartWallet: smartWallet ? "存在" : "なし",
      isFirebaseFlow,
      isAuthenticating,
    });

    // 詳細な条件チェック
    console.log("🔍 [LoginPage] 条件チェック:");
    console.log("  - me?.isLogin:", me?.isLogin);
    console.log("  - smartAccount?.address:", smartAccount?.address);
    console.log("  - !isFirebaseFlow:", !isFirebaseFlow);
    console.log("  - isAuthenticating:", isAuthenticating);

    if (me?.isLogin) {
      console.log("👤 [LoginPage] ログイン済み - checkAccount実行");
      checkAccount();
    } else if (smartAccount?.address && isFirebaseFlow) {
      // Firebase認証フロー専用処理
      console.log("🔥 [LoginPage] Firebase認証フロー中 - 自動signInをスキップ");

      // Firebase認証フロー中にsmartAccountが変更された場合、useSiweAuthに渡す
      if (smartAccount && smartWallet) {
        console.log("🔗 [LoginPage] Firebase認証中のアカウント情報を設定");
        console.log(
          "🔗 [LoginPage] 設定するsmartAccount:",
          smartAccount.address
        );
        console.log(
          "🔗 [LoginPage] 設定するsmartWallet:",
          smartWallet ? "存在" : "なし"
        );
        setFirebaseAccount(smartAccount);
        setFirebaseWallet(smartWallet);
      }
    }
    // 注意: Google認証の自動signInはuseSiweAuth内で実行されるようになりました
  }, [
    smartAccount?.address,
    smartWallet,
    me,
    isFirebaseFlow,
    isAuthenticating,
  ]);

  const handleGoogleConnect = async () => {
    try {
      console.log("🚀 [LoginPage] Google接続開始");

      // ウォレット接続
      console.log("🔗 [LoginPage] ウォレット接続実行中...");
      await connectWithGoogle();
      console.log("✅ [LoginPage] ウォレット接続完了");

      // 短時間待機してからsignInを実行
      console.log("⏳ [LoginPage] 認証前の待機...");
      await new Promise((resolve) => setTimeout(resolve, 500));

      // 認証実行
      console.log("🚀 [LoginPage] signIn()実行開始");
      await signIn();
      console.log("✅ [LoginPage] Google認証フロー完了");
    } catch (error) {
      console.error("❌ [LoginPage] Google接続エラー:", error);
    }
  };

  const handlePhoneAuthOpen = () => {
    console.log("🔥 [LoginPage] Firebase認証フロー開始");
    setIsFirebaseFlow(true);
    setIsPhoneAuthModalOpen(true);
  };

  const handlePhoneAuthClose = () => {
    console.log("🔥 [LoginPage] Firebase認証フロー終了");
    setIsFirebaseFlow(false);
    setIsPhoneAuthModalOpen(false);
  };

  const handleFirebaseSuccess = (jwt: string, address: string) => {
    console.log("✅ [LoginPage] Firebase認証成功:", address);
    console.log("🔗 [LoginPage] Firebase認証後のアカウント情報を設定中...");
    console.log(
      "🔗 [LoginPage] handleFirebaseSuccess関数の型:",
      typeof handleFirebaseSuccess
    );

    // Firebase認証で得られたアカウント情報をuseSiweAuthに設定
    if (smartAccount && smartWallet) {
      console.log("🔗 [LoginPage] Firebase認証後のアカウント情報を設定");
      console.log("  - smartAccount:", smartAccount.address);
      console.log("  - smartWallet:", smartWallet ? "存在" : "なし");

      setFirebaseAccount(smartAccount);
      setFirebaseWallet(smartWallet);
    }

    // モーダルを閉じて、自動SIWE認証を待つ
    handlePhoneAuthClose();
  };

  const handleGoogleSignIn = async () => {
    setIsSignInOptionsModalOpen(false);
    await handleGoogleConnect();
  };

  const handleKyosoIdSignIn = () => {
    setIsSignInOptionsModalOpen(false);
    handlePhoneAuthOpen();
  };

  return (
    <>
      <div className="relative w-full h-[80vh] ">
        <Image
          src="/globe.png"
          alt="login_bg"
          fill
          style={{ objectFit: "contain", paddingBottom: "24px" }}
        />

        <LoginWidget
          variant={"connect"}
          isConnecting={isConnecting || isLoadingCompany}
          connectButtonOptions={{
            onPress: () => setIsSignInOptionsModalOpen(true),
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        />
      </div>

      <SignInOptionsModal
        isOpen={isSignInOptionsModalOpen}
        onClose={() => setIsSignInOptionsModalOpen(false)}
        onGoogleClick={handleGoogleSignIn}
        onKyosoIdClick={handleKyosoIdSignIn}
        showKyosoIdLogin={true}
        isGoogleLoading={isGoogleLoading}
        isPhoneLoading={isPhoneLoading}
      />

      <FirebasePhoneAuthModal
        isOpen={isPhoneAuthModalOpen}
        onClose={handlePhoneAuthClose}
        onAuthSuccess={handleFirebaseSuccess}
      />
    </>
  );
};

type LoginWidgetProps = {
  connectButtonOptions?: ButtonProps;
  isConnecting?: boolean;
  variant: "connect" | "whitelist";
} & ComponentPropsWithoutRef<"div">;

export const LoginWidget: FC<LoginWidgetProps> = ({
  variant = "connect",
  connectButtonOptions,
  className,
  isConnecting,
  ...props
}) => {
  const { t } = useTranslation("login");

  return (
    <div
      className={clsx(
        "flex flex-col items-center gap-3 w-full max-w-80 p-6 bg-background/20 rounded-2xl border-1 border-divider",
        "shadow-[77px_83px_32px_0px_rgba(0,0,0,0.00),50px_53px_29px_0px_rgba(0,0,0,0.01),28px_30px_24px_0px_rgba(0,0,0,0.02),12px_13px_18px_0px_rgba(0,0,0,0.03),3px_3px_10px_0px_rgba(0,0,0,0.04)]",
        "backdrop-blur-[2px]",
        className
      )}
      {...props}
    >
      <p className={clsx("text-foreground text-center font-headline-sm")}>
        {t("Sign In")}
      </p>
      <Button
        className="gap-1"
        color="primary"
        radius="md"
        size="lg"
        fullWidth
        style={{ fontFamily: "inherit" }}
        startContent={
          !isConnecting && (
            <PiSignIn className="w-6 h-6 text-primary-foreground" />
          )
        }
        {...connectButtonOptions}
        isLoading={isConnecting}
      >
        {isConnecting ? t("Connecting...") : "サインイン"}
      </Button>
    </div>
  );
};
