import { FC, useEffect } from "react";
import { client } from "@/utils/client";
import { Button, ButtonProps } from "@heroui/react";
import {
  useActiveAccount,
  useSocialProfiles,
  useWalletDetailsModal,
} from "thirdweb/react";
import { PiGoogleLogo } from "react-icons/pi";
import { useTranslation } from "next-i18next";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { useGoogleEmail } from "@/hooks/useGoogleEmail";

type ConnectButtonProps = {} & ButtonProps;

export const ConnectButton: FC<ConnectButtonProps> = ({ ...props }) => {
  const { t } = useTranslation("estuary");
  const account = useActiveAccount();
  const walletDetail = useWalletDetailsModal();
  const { connectWithGoogle, isConnecting } = useGoogleAuth();
  const { email, picture } = useGoogleEmail();

  // プロフィール画像を決定する関数
  const getProfileImage = () => {
    if (picture) {
      return (
        <img src={picture} className="w-5 h-5 rounded-full" alt="Profile" />
      );
    }

    // デフォルトのアバター
    return <div className="w-5 h-5 rounded-full bg-purple-900"></div>;
  };

  return (
    <>
      {account ? (
        <div>
          <Button
            radius="full"
            size="md"
            className="bg-white border-1 border-stone-200 text-stone-900"
            startContent={getProfileImage()}
            onPress={() => {
              walletDetail.open({ client, theme: "light" });
            }}
          >
            {email
              ? email.length > 10
                ? `${email.slice(0, 8)}...`
                : email
              : `${account.address.slice(0, 4)}...${account.address.slice(-4)}`}
          </Button>
        </div>
      ) : (
        <Button
          startContent={
            !isConnecting && (
              <PiGoogleLogo className="w-5 h-5 text-purple-900" />
            )
          }
          onPress={connectWithGoogle}
          radius="full"
          size="md"
          className="bg-purple-200 text-purple-900 border-1 border-purple-300"
          isLoading={isConnecting}
          {...props}
        >
          {isConnecting ? t("Connecting...") : t("Sign In with Google")}
        </Button>
      )}
    </>
  );
};
