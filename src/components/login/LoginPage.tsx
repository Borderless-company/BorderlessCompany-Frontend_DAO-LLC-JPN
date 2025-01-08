import { ComponentPropsWithoutRef, FC, useEffect, useState } from "react";
import { CLayout } from "../layout/CLayout";
import Image from "next/image";
import { useTranslation } from "next-i18next";
import { Button } from "@nextui-org/react";
import clsx from "clsx";
import { PiWalletFill } from "react-icons/pi";
import { Border } from "../decorative/Border";

export const LoginPage: FC = () => {
  const [isBorder, setIsBorder] = useState<boolean>(true);
  const [isIdle, setIsIdle] = useState<boolean>(false);

  useEffect(() => {
    setTimeout(() => {
      setIsBorder(false);
      setIsIdle(true);
    }, 1700);
  }, [isBorder]);

  useEffect(() => {
    if (isIdle) {
      setTimeout(() => {
        setIsIdle(false);
        setIsBorder(true);
      }, 2000);
    }
  }, [isIdle]);

  return (
    <CLayout className="relative shadow-[inset_0px_0px_40px_-7px_#6EBFB8] px-4">
      <div className="relative w-full h-[80vh] ">
        <Image
          src="/globe.png"
          alt="login_bg"
          fill
          style={{ objectFit: "contain", paddingBottom: "24px" }}
        />
        <LoginWidget className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>
      <Image
        src="/borderless_logo.png"
        alt="Borderlss Logo"
        width={160}
        height={24}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 object-contain"
      />
      {isBorder && (
        <>
          <div className="absolute top-0 left-0 w-[320px] h-[640px] opacity-20">
            <Border />
          </div>
          <div className="absolute bottom-0 right-0 w-[320px] h-[640px] rotate-180 opacity-20 ">
            <Border />
          </div>
        </>
      )}
    </CLayout>
  );
};

type LoginWidgetProps = {} & ComponentPropsWithoutRef<"div">;

export const LoginWidget: FC<LoginWidgetProps> = ({ className, ...props }) => {
  const { t } = useTranslation();
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
      <p className="font-headline-sm text-foreground">{t("Sign In")}</p>
      <Button
        color="primary"
        size="lg"
        fullWidth
        style={{ fontFamily: "inherit" }}
        startContent={
          <PiWalletFill className="w-6 h-6 text-primary-foreground" />
        }
      >
        {t("Connect Wallet")}
      </Button>
    </div>
  );
};
