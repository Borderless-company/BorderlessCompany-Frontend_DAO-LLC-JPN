import { useAccount, useConnect, useDisconnect, useSignMessage } from "wagmi";
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
import { BrowserProvider } from "ethers";
import { useAtom } from "jotai";
import { useMe } from "@/hooks/useMe";


export default function WalletLogin() {
  const { me, isLoading, isError } = useMe();
  const [isLogin, setIsLogin] = useState(false);
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [isClient, setIsClient] = useState(false);
  const { signMessageAsync } = useSignMessage();

  useEffect(() => {
    setIsLogin(me ? me.isLogin : false);
    setIsClient(true);
  }, [isLoading]);

  const handleLogin = async () => {
    if (!address) return;
    const nonceRes = await fetch("/api/auth/nonce?address=" + address);
    const { nonce } = await nonceRes.json();

    const signature = await signMessageAsync({ message: String(nonce) });

    const verifyRes = await fetch("/api/auth/generateJWT", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: 'include',
      body: JSON.stringify({
        address,
        signature,
        nonce: String(nonce),
      }),
    });

    const data = await verifyRes.json();
    if (verifyRes.ok) {
      onOpenChange();
    } else {
      console.error("Verification failed", data);
    }
  };


  return (
    <>
      {isClient && (
        <>
          {isConnected ? (
            isLogin ? (
              <LoggedInMenu />
            ) : (
              <Button onPress={handleLogin}>サインしてログイン</Button>
            )
          ) : (
            <div className="">
              <Button onPress={onOpen}>ウォレットログイン</Button>
              <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                  {(onClose) => (
                    <>
                      <ModalHeader className="flex flex-col gap-1">
                        ウォレットログインを選択
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
                        <Button color="danger" variant="light" onPress={onClose}>
                          Close
                        </Button>
                      </ModalFooter>
                    </>
                  )}
                </ModalContent>
              </Modal>
            </div>
          )}
        </>
      )}
    </>
  );
}
