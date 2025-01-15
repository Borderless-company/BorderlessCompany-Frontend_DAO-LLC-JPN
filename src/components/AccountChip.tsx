import {
  cn,
  Button as NextUIButton,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
  Modal,
} from "@nextui-org/react";
import { FC, useEffect, useState } from "react";
import { Button } from "react-aria-components";
import { useAccount } from "wagmi";
import Image from "next/image";
import { PiDotsThreeVertical } from "react-icons/pi";
import { Balance } from "./web3/balance";
import { useSignOut } from "@/hooks/useSignOut";
export type AccountChipProps = {
  name?: string;
};

export const AccountChip: FC<AccountChipProps> = ({ name }) => {
  const { address } = useAccount();
  const { signOut } = useSignOut();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 初期レンダリング時は何も表示しない
  if (!mounted) return null;

  return (
    <>
      <Button
        className={cn(
          "appearance-none transition-colors duration-150 w-full px-2 py-2 flex items-center justify-between gap-2 rounded-lg border-1 border-divider ",
          "data-[hovered]:cursor-pointer data-[hovered]:bg-neutral-backing data-[focused]:outline-none",
          "shadow-[0px_1px_3px_0px_rgba(0,0,0,0.10),0px_1px_2px_0px_rgba(0,0,0,0.06)]"
        )}
        onPress={onOpen}
      >
        <div className="flex gap-2 items-center flex-1">
          <Image
            src="/user_icon_fallback.png"
            alt="profile icon"
            width={40}
            height={40}
            className="rounded-md flex-shrink-0"
          />
          <p className="w-32 text-foreground font-label-lg overflow-hidden text-ellipsis whitespace-nowrap">
            {name || address}
          </p>
        </div>
        <div className="flex-shrink-0">
          <PiDotsThreeVertical size={24} color="var(--bls-neutral)" />
        </div>
      </Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          <>
            <ModalHeader className="flex flex-col gap-1">
              Wallet Menu
            </ModalHeader>
            <ModalBody>
              <div className="flex flex-col gap-1">
                {address && (
                  <NextUIButton
                    color="secondary"
                    onPress={() => navigator.clipboard.writeText(address)}
                  >
                    Copy Address
                  </NextUIButton>
                )}
                <Balance />
              </div>
            </ModalBody>
            <ModalFooter>
              <NextUIButton color="danger" variant="light" onPress={signOut}>
                Sign Out
              </NextUIButton>
            </ModalFooter>
          </>
        </ModalContent>
      </Modal>
    </>
  );
};
