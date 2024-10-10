import {
  Button,
  CheckboxGroup,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  RadioGroup,
  Radio,
  ModalProps,
} from "@nextui-org/react";

import { FC } from "react";

type TermModalProps = {} & Omit<ModalProps, "children">;

export const TermModal: FC<TermModalProps> = ({ ...props }) => {
  return (
    <Modal {...props}>
      <ModalContent>
        <ModalHeader>
          <h1>Terms of Service</h1>
        </ModalHeader>
        <ModalBody>
          <p>
            Welcome to Estuary! These terms of service outline the rules and
            regulations for the use of our website and services.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
