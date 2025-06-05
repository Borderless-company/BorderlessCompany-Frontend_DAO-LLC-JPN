import {
  cn,
  Button as NextUIButton,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
  Modal,
  Divider,
  Card,
  CardBody,
  Chip,
} from "@heroui/react";
import { FC, useEffect, useState } from "react";
import { Button } from "react-aria-components";
import { useActiveAccount } from "thirdweb/react";
import Image from "next/image";
import {
  PiDotsThreeVertical,
  PiCopy,
  PiSignOut,
  PiWallet,
  PiUser,
  PiCheckCircle,
} from "react-icons/pi";
import { Balance } from "./wallet/balance";
import { useSignOut } from "@/hooks/useSignOut";
import { useUser } from "@/hooks/useUser";

export type AccountChipProps = {
  name?: string;
  size?: "sm" | "md";
};

export const AccountChip: FC<AccountChipProps> = ({ name, size = "md" }) => {
  const smartAccount = useActiveAccount();
  const { signOut } = useSignOut();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const { user } = useUser(smartAccount?.address);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCopyAddress = () => {
    if (smartAccount?.address) {
      navigator.clipboard.writeText(smartAccount.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getSizeClasses = () => {
    if (size === "sm") {
      return {
        container: "px-1.5 py-1.5",
        image: { width: 24, height: 24 },
        text: "w-20 text-xs font-medium",
        icon: 16,
      };
    }
    return {
      container: "px-2 py-2",
      image: { width: 40, height: 40 },
      text: "w-32 font-label-lg",
      icon: 24,
    };
  };

  const sizeClasses = getSizeClasses();

  // 初期レンダリング時は何も表示しない
  if (!mounted) return null;

  return (
    <>
      <Button
        className={cn(
          "appearance-none transition-colors duration-150 w-full flex items-center justify-between gap-2 rounded-lg border-1 border-divider",
          "data-[hovered]:cursor-pointer data-[hovered]:bg-neutral-backing data-[focused]:outline-none",
          "shadow-[0px_1px_3px_0px_rgba(0,0,0,0.10),0px_1px_2px_0px_rgba(0,0,0,0.06)]",
          sizeClasses.container
        )}
        onPress={onOpen}
      >
        <div className="flex gap-2 items-center flex-1">
          <Image
            src="/user_icon_fallback.png"
            alt="profile icon"
            width={sizeClasses.image.width}
            height={sizeClasses.image.height}
            className="rounded-md flex-shrink-0"
          />
          <p
            className={cn(
              "text-foreground overflow-hidden text-ellipsis whitespace-nowrap",
              sizeClasses.text
            )}
          >
            {name ||
              (smartAccount?.address
                ? `${smartAccount.address.slice(
                    0,
                    6
                  )}...${smartAccount.address.slice(-4)}`
                : "")}
          </p>
        </div>
        <div className="flex-shrink-0">
          <PiDotsThreeVertical
            size={sizeClasses.icon}
            color="var(--bls-neutral)"
          />
        </div>
      </Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="md">
        <ModalContent>
          <>
            <ModalHeader className="flex flex-col gap-0 pb-2">
              <div className="flex items-center gap-3">
                <PiWallet size={24} className="text-primary" />
                <h3 className="text-lg font-semibold">ウォレット</h3>
              </div>
            </ModalHeader>
            <ModalBody className="gap-4">
              {/* User Profile Section */}
              <Card className="bg-default-50">
                <CardBody className="p-4">
                  <div className="flex items-center gap-3">
                    <Image
                      src="/user_icon_fallback.png"
                      alt="profile icon"
                      width={48}
                      height={48}
                      className="rounded-full flex-shrink-0"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-foreground">
                        {name || user?.name || "未設定"}
                      </p>
                      {user?.status && (
                        <Chip
                          size="sm"
                          color={
                            user.status === "signedUp" ? "success" : "warning"
                          }
                          variant="flat"
                          startContent={
                            user.status === "signedUp" ? (
                              <PiCheckCircle size={12} />
                            ) : undefined
                          }
                        >
                          {user.status === "signedUp" ? "登録完了" : "登録中"}
                        </Chip>
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Wallet Address Section */}
              {smartAccount?.address && (
                <Card className="bg-default-50">
                  <CardBody className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-default-500 mb-1">
                          ウォレットアドレス
                        </p>
                        <p className="font-mono text-sm text-foreground">
                          {`${smartAccount.address.slice(
                            0,
                            6
                          )}...${smartAccount.address.slice(-4)}`}
                        </p>
                      </div>
                      <NextUIButton
                        isIconOnly
                        size="sm"
                        variant="light"
                        onPress={handleCopyAddress}
                        color={copied ? "success" : "default"}
                      >
                        {copied ? (
                          <PiCheckCircle size={16} />
                        ) : (
                          <PiCopy size={16} />
                        )}
                      </NextUIButton>
                    </div>
                  </CardBody>
                </Card>
              )}

              {/* Balance Section */}
              <Card className="bg-default-50">
                <CardBody className="p-4">
                  <p className="text-sm text-default-500 mb-2">残高</p>
                  <Balance />
                </CardBody>
              </Card>
            </ModalBody>
            <ModalFooter className="pt-2">
              <NextUIButton
                color="danger"
                variant="light"
                startContent={<PiSignOut size={16} />}
                onPress={signOut}
                fullWidth
              >
                サインアウト
              </NextUIButton>
            </ModalFooter>
          </>
        </ModalContent>
      </Modal>
    </>
  );
};
