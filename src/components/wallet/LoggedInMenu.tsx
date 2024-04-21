import { useAccount, useConnect, useDisconnect } from "wagmi";
import { SwitchChain } from "@/components/web3/switchNetwork";
import { Balance } from "@/components/web3/balance";
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

export function LoggedInMenu() {
  const { address, connector, isConnected } = useAccount();
  const { connect, connectors, error } = useConnect();
  const { disconnect } = useDisconnect();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <div>
      <Button onPress={onOpen}>{address}</Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          <>
            <ModalHeader className="flex flex-col gap-1">
              ウォレットメニュー
            </ModalHeader>
            <ModalBody>
              <div className="flex flex-col gap-1">
                {address && (
                  <Button
                    color="secondary"
                    onPress={() => navigator.clipboard.writeText(address)}
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
