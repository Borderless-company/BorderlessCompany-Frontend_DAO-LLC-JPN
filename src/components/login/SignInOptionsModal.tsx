import { FC } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button,
} from "@heroui/react";
import { PiGoogleLogo, PiSignIn } from "react-icons/pi";

interface SignInOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoogleClick: () => void;
  onKyosoIdClick: () => void;
  showKyosoIdLogin: boolean;
  isGoogleLoading: boolean;
  isPhoneLoading: boolean;
}

export const SignInOptionsModal: FC<SignInOptionsModalProps> = ({
  isOpen,
  onClose,
  onGoogleClick,
  onKyosoIdClick,
  showKyosoIdLogin,
  isGoogleLoading,
  isPhoneLoading,
}) => {
  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} isDismissable={false}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              サインイン方法を選択
            </ModalHeader>
            <ModalBody>
              <div className="flex flex-col gap-4 py-4">
                <Button
                  startContent={<PiGoogleLogo color="white" />}
                  className="w-full text-white text-base font-semibold bg-purple-700"
                  onPress={onGoogleClick}
                  isLoading={isGoogleLoading}
                  isDisabled={isPhoneLoading}
                >
                  {isGoogleLoading
                    ? "Googleでサインイン中..."
                    : "Googleでサインイン"}
                </Button>
                {showKyosoIdLogin && (
                  <Button
                    startContent={<PiSignIn color="white" />}
                    className="w-full text-white text-base font-semibold bg-blue-700"
                    onPress={onKyosoIdClick}
                    isLoading={isPhoneLoading}
                    isDisabled={isGoogleLoading}
                  >
                    {isPhoneLoading
                      ? "サインイン中..."
                      : "共創IDでサインイン（電話番号）"}
                  </Button>
                )}
              </div>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
