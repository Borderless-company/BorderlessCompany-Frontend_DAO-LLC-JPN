import { Modal, ModalBody, ModalContent, ModalHeader } from "@heroui/react";
import { FirebasePhoneAuth } from "./FirebasePhoneAuth";

interface FirebasePhoneAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (jwt: string, address: string) => void;
}

export const FirebasePhoneAuthModal = ({
  isOpen,
  onClose,
  onAuthSuccess,
}: FirebasePhoneAuthModalProps) => {
  return (
    <Modal isOpen={isOpen} onOpenChange={onClose}>
      <ModalContent>
        <ModalHeader>共創IDでログイン</ModalHeader>
        <ModalBody>
          <FirebasePhoneAuth onAuthSuccess={onAuthSuccess} />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
