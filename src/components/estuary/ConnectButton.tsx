import { FC, useEffect } from "react";
import { client, wallets } from "@/utils/client";
import { Button, ButtonProps } from "@nextui-org/react";
import {
  useConnectModal,
  useActiveAccount,
  useSocialProfiles,
  useWalletDetailsModal,
} from "thirdweb/react";
import { PiSignIn } from "react-icons/pi";
import { defineChain } from "thirdweb";
import { useTranslation } from "next-i18next";

type ConnectButtonProps = {} & ButtonProps;

export const ConnectButton: FC<ConnectButtonProps> = ({ ...props }) => {
  const { t } = useTranslation("estuary");
  const { connect, isConnecting } = useConnectModal();
  const account = useActiveAccount();
  const { data: socialProfiles } = useSocialProfiles({
    client,
    address: account?.address || undefined,
  });
  const walletDetail = useWalletDetailsModal();

  const handleConnect = async () => {
    const wallet = await connect({
      client,
      wallets: wallets,
      size: "compact",
    });
    console.log("Connected wallet: ", account);
  };

  useEffect(() => {
    console.log("Social profiles: ", socialProfiles);
    console.log("Account: ", account);
  }, [socialProfiles, account]);

  return (
    <>
      {account ? (
        <Button
          radius="full"
          size="md"
          className="bg-white border-1 border-stone-200 text-stone-900"
          startContent={
            socialProfiles?.length !== 0 ? (
              socialProfiles?.[0].avatar ? (
                <img
                  src={socialProfiles?.[0].avatar}
                  className="w-5 h-5 rounded-full"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-purple-900"></div>
              )
            ) : (
              <div className="w-5 h-5 rounded-full bg-purple-900"></div>
            )
          }
          onPress={() => {
            walletDetail.open({ client, theme: "light" });
          }}
        >
          {`${account.address.slice(0, 4)}...${account.address.slice(-4)}`}
        </Button>
      ) : (
        <Button
          startContent={<PiSignIn className="w-5 h-5 text-purple-900" />}
          onPress={handleConnect}
          radius="full"
          size="md"
          className="bg-purple-200 text-purple-900 border-1 border-purple-300"
          {...props}
        >
          {t("Sign In")}
        </Button>
      )}
    </>
  );
};
