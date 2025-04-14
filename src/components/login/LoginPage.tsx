import { Button, ButtonProps } from "@heroui/react";
import clsx from "clsx";
import { useTranslation } from "next-i18next";
import Image from "next/image";
import { useRouter } from "next/router";
import { ComponentPropsWithoutRef, FC, useEffect } from "react";
import { PiArrowSquareOut, PiGoogleLogo } from "react-icons/pi";
import { useActiveAccount } from "thirdweb/react";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";

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
  const smartAccount = useActiveAccount();
  const { connectWithGoogle, signIn, checkAccount, isConnecting, me } =
    useGoogleAuth({
      onNoAccount: () => {
        onPageChange(1);
      },
    });

  useEffect(() => {
    if (me?.isLogin) {
      checkAccount();
    } else if (smartAccount?.address) {
      signIn();
    }
  }, [smartAccount?.address, me]);

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
            onPress: connectWithGoogle,
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
