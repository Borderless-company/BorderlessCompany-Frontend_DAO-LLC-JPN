import { useSetContractURI } from "@/hooks/useContract";
import { useMe } from "@/hooks/useMe";
import { useWhitelist } from "@/hooks/useWhitelist";
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
import { PiArrowSquareOut, PiWalletFill } from "react-icons/pi";
import {
  useActiveAccount,
  useActiveWallet,
  useDisconnect,
} from "thirdweb/react";
import { ConnectorSelectionModal } from "./ConnectorSelectionModal";

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
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const smartAccount = useActiveAccount();
  const smartWallet = useActiveWallet();
  const { disconnect } = useDisconnect();
  const { useIsWhitelisted } = useWhitelist();
  const { data: isWhitelisted, error: isWhitelistedError } = useIsWhitelisted(
    smartAccount?.address ?? ""
  );
  const { me, refetch } = useMe();
  const { sendTx } = useSetContractURI();

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
      setIsOpen(false);
      if (isWhitelisted) {
        setIsConnecting(true);
        signIn();
      } else {
        setIsConnecting(false);
      }
    }
  }, [smartAccount?.address, isWhitelisted, me]);

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
      const signature = await smartAccount?.signMessage({
        message: String(nonce),
      });
      console.log(`signature: ${signature}`);
      const verifyRes = await fetch("/api/auth/generateJWT", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          address: smartAccount?.address,
          signature,
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
          variant={
            smartAccount?.address && !isWhitelisted ? "whitelist" : "connect"
          }
          isConnecting={isConnecting || isLoadingCompany}
          connectButtonOptions={{
            onPress: () => {
              setIsConnecting(true);
              setIsOpen(true);
            },
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        />
      </div>
      <ConnectorSelectionModal
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        onClose={() => setIsConnecting(false)}
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
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fontClass = useMemo(
    () =>
      mounted
        ? variant === "connect"
          ? "font-headline-sm"
          : "font-title-md"
        : "font-headline-sm",
    [mounted, variant]
  );

  const textContent = useMemo(
    () =>
      mounted
        ? variant === "connect"
          ? t("Sign In")
          : t("Borderless is in beta")
        : t("Sign In"),
    [mounted, variant, t]
  );

  const buttonText = useMemo(
    () =>
      mounted
        ? variant === "connect"
          ? isConnecting
            ? t("Connecting...")
            : t("Connect Wallet")
          : t("Join Waitlist")
        : "",
    [mounted, variant, isConnecting, t]
  );

  const renderButton = () => {
    if (!mounted) return null;

    if (variant === "connect") {
      return (
        <Button
          className="gap-1"
          color="primary"
          radius="md"
          size="lg"
          fullWidth
          style={{ fontFamily: "inherit" }}
          startContent={
            !isConnecting && (
              <PiWalletFill className="w-6 h-6 text-primary-foreground" />
            )
          }
          {...connectButtonOptions}
          isLoading={isConnecting}
        >
          {buttonText}
        </Button>
      );
    }

    return (
      <>
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
      </>
    );
  };

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
      {renderButton()}
    </div>
  );
};
