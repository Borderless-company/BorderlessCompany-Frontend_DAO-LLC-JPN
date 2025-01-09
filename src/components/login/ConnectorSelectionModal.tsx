import { Button, ModalFooter } from "@nextui-org/react";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalProps,
} from "@nextui-org/react";
import { useTranslation } from "next-i18next";
import { FC } from "react";
import { WalletIcon } from "../icons/WalletIcon";
import { useConnect } from "wagmi";

export type ConnectorSelectionModalProps = {} & Omit<ModalProps, "children">;

export const ConnectorSelectionModal: FC<ConnectorSelectionModalProps> = ({
  isOpen,
  onOpenChange,
  ...props
}) => {
  const { t } = useTranslation();
  const { connect, connectors } = useConnect();
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} {...props}>
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
                      startContent={<WalletIcon connector={connector.name} />}
                      className="card"
                      key={connector.id}
                      onClick={() => connect({ connector: connector as any })}
                    >
                      {connector.name}
                    </Button>
                  );
                })}
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
