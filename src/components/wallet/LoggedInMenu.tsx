import { useActiveAccount, useConnect, useDisconnect } from "thirdweb/react";
import { Balance } from "@/components/wallet/balance";
import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@heroui/react";

export function LoggedInMenu() {
  const smartAccount = useActiveAccount();
  const { disconnect } = useDisconnect();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <div>
      <Button onPress={onOpen}>{smartAccount?.address}</Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          <>
            <ModalHeader className="flex flex-col gap-1">
              ウォレットメニュー
            </ModalHeader>
            <ModalBody>
              <div className="flex flex-col gap-1">
                {smartAccount?.address && (
                  <Button
                    color="secondary"
                    onPress={() => navigator.clipboard.writeText(smartAccount.address)}
                  >
                    アドレスをコピー
                  </Button>
                )}
                <Balance />
                {/* <SwitchChain /> */}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                color="danger"
                variant="light"
                onPress={disconnect as any}
              >
                Disconnect
              </Button>
            </ModalFooter>
          </>
        </ModalContent>
      </Modal>
    </div>
  );
}
