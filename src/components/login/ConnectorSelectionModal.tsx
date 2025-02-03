import { Button, ModalFooter } from "@heroui/react";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalProps,
} from "@heroui/react";
import { useTranslation } from "next-i18next";
import { FC } from "react";
import { WalletIcon } from "../icons/WalletIcon";
import { inAppWallet } from "thirdweb/wallets";
import { useConnect } from "thirdweb/react";
import { defineChain } from "thirdweb/chains";
import { client } from "@/utils/client";
import { ACCOUNT_FACTORY_ADDRESS } from "@/constants";

export type ConnectorSelectionModalProps = {} & Omit<ModalProps, "children">;

export const ConnectorSelectionModal: FC<ConnectorSelectionModalProps> = ({
  isOpen,
  onOpenChange,
  ...props
}) => {
  const { t } = useTranslation();
  const { connect } = useConnect({
    client,
    accountAbstraction: {
      chain: defineChain(Number(process.env.NEXT_PUBLIC_CHAIN_ID)),
      factoryAddress: ACCOUNT_FACTORY_ADDRESS,
      sponsorGas: true,
    },
  });

  const connectToSmartAccount = async () => {
    connect(async () => {
      const wallet = inAppWallet(); // or any other wallet
      await wallet.connect({
        client,
        chain: defineChain(Number(process.env.NEXT_PUBLIC_CHAIN_ID)),
        strategy: "google",
      });
      return wallet;
    });
  };

  return (
    <Modal
      className="z-50"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      {...props}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              {t("Select Wallet")}
            </ModalHeader>
            <ModalBody>
              <div className="flex flex-col gap-1">
                {/* {connectors.map((connector) => {
                  return (
                    <Button
                      color="primary"
                      variant="bordered"
                      startContent={<WalletIcon connector={connector.name} />}
                      className="card"
                      key={connector.id}
                      onClick={() => connect({ connector: connector as any })}
                    >
                      {connector.name}
                    </Button>
                  );
                })} */}
                <Button
                  color="primary"
                  variant="bordered"
                  startContent={<WalletIcon connector="google" />}
                  className="card"
                  onPress={connectToSmartAccount}
                >
                  Google
                </Button>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Close
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
