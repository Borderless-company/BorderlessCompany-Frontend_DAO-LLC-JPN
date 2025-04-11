import { useSetContractURI } from "@/hooks/useContract";
import { useMe } from "@/hooks/useMe";
import { hasAccount } from "@/utils/api/user";
import { Button, ButtonProps } from "@heroui/react";
import clsx from "clsx";
import { useTranslation } from "next-i18next";
import Image from "next/image";
import { useRouter } from "next/router";
import {
  ComponentPropsWithoutRef,
  FC,
  useEffect,
  useMemo,
  useState,
} from "react";
import { PiArrowSquareOut, PiGoogleLogo, PiWalletFill } from "react-icons/pi";
import {
  useActiveAccount,
  useActiveWallet,
  useDisconnect,
  useConnect,
} from "thirdweb/react";
import { inAppWallet } from "thirdweb/wallets";
import { defineChain } from "thirdweb/chains";
import { client } from "@/utils/client";
import { ACCOUNT_FACTORY_ADDRESS } from "@/constants";

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
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const smartAccount = useActiveAccount();
  const smartWallet = useActiveWallet();
  const { disconnect } = useDisconnect();
  const { me, refetch } = useMe();
  const { sendTx } = useSetContractURI();
  const { connect } = useConnect({
    client,
    accountAbstraction: {
      chain: defineChain(Number(process.env.NEXT_PUBLIC_CHAIN_ID)),
      factoryAddress: ACCOUNT_FACTORY_ADDRESS,
      sponsorGas: true,
    },
  });

  const connectToSmartAccount = async () => {
    setIsConnecting(true);
    try {
      connect(async () => {
        const wallet = inAppWallet();
        try {
          await wallet.connect({
            client,
            chain: defineChain(Number(process.env.NEXT_PUBLIC_CHAIN_ID)),
            strategy: "google",
          });
        } catch (error) {
          console.error("接続エラー:", error);
          setIsConnecting(false);
        }
        return wallet;
      });
    } catch (error) {
      console.error("接続エラー:", error);
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    const checkAccount = async () => {
      try {
        const _hasAccount = await hasAccount(smartAccount?.address ?? "");
        if (!_hasAccount) {
          // アカウントがない場合
          onPageChange(1);
        } else {
          // アカウントがある場合
        }
      } catch (e) {
        console.error(e);
        setIsConnecting(false);
        return;
      }
    };

    console.log("me: ", me);
    if (me?.isLogin) {
      checkAccount();
    } else if (smartAccount?.address) {
      setIsConnecting(true);
      signIn();
    }
  }, [smartAccount?.address, me]);

  // ウォレットによるサインイン
  const signIn = async () => {
    if (!smartAccount?.address) return;
    let nonce = 0;

    console.log("signIn: smartAccount?.address: ", smartAccount?.address);

    // create account
    sendTx(smartAccount?.address);

    try {
      const nonceRes = await fetch(
        "/api/auth/nonce?address=" + smartAccount?.address
      );
      const { nonce: _nonce } = await nonceRes.json();
      nonce = _nonce;
      console.log(`nonce: ${nonce}`);
    } catch (e) {
      console.error(e);
      return;
    }

    try {
      // SIWE (EIP-4361) フォーマットのメッセージを作成
      const domain = window.location.host;
      const origin = window.location.origin;
      const statement =
        "Borderlessアプリにログインして、あなたのアイデンティティを確認します。";
      const expirationTime = new Date(
        Date.now() + 1000 * 60 * 60 * 24 * 3
      ).toISOString(); // 3日後に期限切れ

      const siweMessage = `${domain} wants you to sign in with your Ethereum account:
${smartAccount.address}

${statement}

URI: ${origin}
Version: 1
Chain ID: ${process.env.NEXT_PUBLIC_CHAIN_ID}
Nonce: ${nonce}
Issued At: ${new Date().toISOString()}
Expiration Time: ${expirationTime}`;

      console.log(`SIWE message: ${siweMessage}`);

      const signature = await smartAccount?.signMessage({
        message: siweMessage,
      });
      console.log(`signature: ${signature}`);
      const verifyRes = await fetch("/api/auth/generateJWT", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          address: smartAccount?.address,
          signature,
          message: siweMessage,
          nonce: String(nonce),
        }),
      });
      console.log(`verifyRes: ${verifyRes}`);

      const data = await verifyRes.json();
      if (verifyRes.ok) {
        setIsConnecting(false);
        await refetch();
      } else {
        console.error("Verification failed", data);
        setIsConnecting(false);
        if (smartWallet) {
          disconnect(smartWallet);
        }
      }
    } catch (e) {
      console.error(`Error signing in: ${e}`);
      setIsConnecting(false);
      if (smartWallet) {
        disconnect(smartWallet);
      }
    }
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
            onPress: connectToSmartAccount,
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        />
      </div>
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
  const { t } = useTranslation();

  const fontClass =
    variant === "connect" ? "font-headline-sm" : "font-title-md";
  const textContent =
    variant === "connect" ? t("Sign In") : t("Borderless is in beta");
  const buttonText =
    variant === "connect"
      ? isConnecting
        ? t("Connecting...")
        : t("Sign In with Google")
      : t("Join Waitlist");

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
      <p className={clsx("text-foreground text-center", fontClass)}>
        {textContent}
      </p>

      {variant === "connect" ? (
        <Button
          className="gap-1"
          color="primary"
          radius="md"
          size="lg"
          fullWidth
          style={{ fontFamily: "inherit" }}
          startContent={
            !isConnecting && (
              <PiGoogleLogo className="w-6 h-6 text-primary-foreground" />
            )
          }
          {...connectButtonOptions}
          isLoading={isConnecting}
        >
          {buttonText}
        </Button>
      ) : (
        <Button
          className="gap-1"
          color="secondary"
          size="lg"
          fullWidth
          style={{ fontFamily: "inherit" }}
          endContent={<PiArrowSquareOut className="w-4 h-4" />}
          onPress={() => {
            window.open(
              "https://docs.google.com/forms/d/1t3DdeJlV8NCDfr6hY4yynSYupcNDQYBRQMt90GsjXK8",
              "_blank"
            );
          }}
        >
          {buttonText}
        </Button>
      )}
    </div>
  );
};
