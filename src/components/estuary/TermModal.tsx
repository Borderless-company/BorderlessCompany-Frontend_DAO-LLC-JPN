import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalProps,
} from "@nextui-org/react";
import { FC, useState, useRef, useEffect } from "react";

type TermModalProps = {} & Omit<ModalProps, "children">;

export const TermModal: FC<TermModalProps> = ({ ...props }) => {
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);
  const modalBodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // setIsScrolledToBottom(false);
    const modalBody = modalBodyRef.current;
    const handleScroll = () => {
      if (modalBody) {
        const { scrollTop, scrollHeight, clientHeight } = modalBody;
        if (scrollTop + clientHeight >= scrollHeight - 10) {
          setIsScrolledToBottom(true);
        }
      }
    };

    modalBody?.addEventListener("scroll", handleScroll);
    return () => modalBody?.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (modalBodyRef.current) {
      console.log(
        "🍅🍅🍅",
        isScrolledToBottom,
        modalBodyRef.current?.scrollTop
      );
    }
  }, [isScrolledToBottom, modalBodyRef.current?.scrollTop]);

  return (
    <Modal {...props}>
      <ModalContent>
        <ModalHeader>
          <h1>Terms of Service</h1>
        </ModalHeader>
        <ModalBody>
          <div ref={modalBodyRef} className="max-h-[320px] overflow-y-scroll">
            <p>
              Welcome to Estuary! These terms of service outline the rules and
              regulations for the use of our website and services. Welcome to
              Estuary! These terms of service outline the rules and regulations
              for the use of our website and services. Welcome to Estuary! These
              terms of service outline the rules and regulations for the use of
              our website and services. Welcome to Estuary! These terms of
              service outline the rules and regulations for the use of our
              website and services. Welcome to Estuary! These terms of service
              outline the rules and regulations for the use of our website and
              services. Welcome to Estuary! These terms of service outline the
              rules and regulations for the use of our website and services.
              Welcome to Estuary! These terms of service outline the rules and
              regulations for the use of our website and services. Welcome to
              Estuary! These terms of service outline the rules and regulations
              for the use of our website and services. Welcome to Estuary! These
              terms of service outline the rules and regulations for the use of
              our website and services. Welcome to Estuary! These terms of
              service outline the rules and regulations for the use of our
              website and services. Welcome to Estuary! These terms of service
              outline the rules and regulations for the use of our website and
              services. Welcome to Estuary! These terms of service outline the
              rules and regulations for the use of our website and services.
              Welcome to Estuary! These terms of service outline the rules and
              regulations for the use of our website and services. Welcome to
              Estuary! These terms of service outline the rules and regulations
              for the use of our website and services.
            </p>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button isDisabled={!isScrolledToBottom}>同意する</Button>
          <Button>閉じる</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
