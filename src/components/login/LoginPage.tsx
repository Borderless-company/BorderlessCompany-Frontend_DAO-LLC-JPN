import { FC } from "react";
import Image from "next/image";
import { useTranslation } from "next-i18next";
import { Button } from "@nextui-org/react";
import { PiSignInBold } from "react-icons/pi";

export const LoginPage: FC = () => {
  const { t } = useTranslation("common");
  return (
    <div className="flex items-center justify-between px-32 bg-background w-screen h-screen shadow-[inset_0px_0px_60px_-7px_#6EBFB8]">
      <Image
        src="/borderless_logo.png"
        alt="Borderless"
        width={300}
        height={100}
      />
      <div className="relative flex flex-col items-center justify-center gap-4 w-full h-80 max-w-[288px] pl-16">
        <h2 className="typo-headline-sm">{t("Sign In")}</h2>
        <Button
          startContent={<PiSignInBold size={24} />}
          color="primary"
          size="lg"
          className="w-full flex-shrink-0"
        >
          {t("Sign In")}
        </Button>
        <div className=" absolute left-0 top-0 bottom-0 w-[2px]  bg-[linear-gradient(180deg,rgba(214,211,209,0.00)_0%,#D6D3D1_50.5%,rgba(214,211,209,0.00)_100%)]"></div>
      </div>
    </div>
  );
};
