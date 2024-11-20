import { useAccount, useConnect, useDisconnect } from "wagmi";
import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@nextui-org/react";
import { LoggedInMenu } from "@/components/wallet/LoggedInMenu";
import { WalletIcon } from "../icons/WalletIcon";
import { useTranslation } from "next-i18next";

export default function WalletLogin() {
  const { isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const [isClient, setIsClient] = useState(false);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { t } = useTranslation("common");

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <>
      {isClient && (
        <>
          {isConnected ? (
            <LoggedInMenu />
          ) : (
            <div className="">
              <Button onPress={onOpen}>{t("Connect Wallet")}</Button>
              <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                  {(onClose) => (
                    <>
                      <ModalHeader className="flex flex-col gap-1">
                        {t("Select Wallet")}
                      </ModalHeader>
                      <ModalBody>
                        <div className="flex flex-col gap-1">
                          {connectors.map((connector) => {
                            return (
                              <Button
                                color="primary"
                                variant="bordered"
                                startContent={
                                  <WalletIcon connector={connector.name} />
                                }
                                className="card"
                                key={connector.id}
                                onClick={() =>
                                  connect({ connector: connector as any })
                                }
                              >
                                {connector.name}
                              </Button>
                            );
                          })}
                        </div>
                      </ModalBody>
                      <ModalFooter>
                        <Button
                          color="danger"
                          variant="light"
                          onPress={onClose}
                        >
                          Close
                        </Button>
                      </ModalFooter>
                    </>
                  )}
                </ModalContent>
              </Modal>

              {/* {error && <div>{error.message}</div>} */}
            </div>
          )}
        </>
      )}
    </>
  );
}
