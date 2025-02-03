import { FC, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  ModalProps,
  Spinner,
  cn,
} from "@heroui/react";
import { Tables } from "@/types/schema";
import { useCompany } from "@/hooks/useCompany";
import { Stack } from "@/sphere/Stack";
import { useTaskStatus } from "@/hooks/useTaskStatus";
import { motion } from "framer-motion";

type CompanyActivationProps = {
  company?: Tables<"COMPANY">;
} & Omit<ModalProps, "children">;

export const CompanyActivation: FC<CompanyActivationProps> = ({
  company,
  ...props
}) => {
  const [isDepoying, setIsDepoying] = useState(false);
  const [isDeployed, setIsDeployed] = useState(false);
  const { updateCompany } = useCompany(company?.id);
  const { createTaskStatus, deleteTaskStatusByIds } = useTaskStatus();
  const [formData, setFormData] = useState<Partial<Tables<"COMPANY">>>({
    company_number: company?.company_number || "",
    is_active: company?.is_active || false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!company?.id) return;

    try {
      // 既存のタスクステータスを削除
      // await Promise.all([
      //   deleteTaskStatusByIds({
      //     company_id: company.id,
      //     task_id: "create-aoi",
      //   }),
      //   deleteTaskStatusByIds({
      //     company_id: company.id,
      //     task_id: "enter-company-profile",
      //   }),
      //   deleteTaskStatusByIds({
      //     company_id: company.id,
      //     task_id: "enter-executive-token-info",
      //   }),
      // ]);

      // 新しいタスクを追加
      // await createTaskStatus({
      //   company_id: company.id,
      //   task_id: "mint-exe-token",
      //   status: "todo",
      // });

      // 会社を有効化

      setIsDepoying(true);

      // TODO-Contract: SCRを実行する

      setTimeout(async () => {
        setIsDepoying(false);
        setIsDeployed(true);
        setTimeout(async () => {
          setIsDeployed(false);
          await updateCompany({
            id: company.id,
            ...formData,
            is_active: true,
          });
          props.onClose?.();
          props.onOpenChange?.(false);
        }, 2000);
      }, 5000);
    } catch (error) {
      console.error("Failed to activate company:", error);
    }
  };

  return (
    <Modal
      {...props}
      classNames={{
        base: "max-w-md",
      }}
      hideCloseButton={isDepoying}
      isDismissable={!isDepoying}
    >
      <ModalContent>
        {(onClose) => (
          <>
            {!isDepoying && !isDeployed && (
              <ModalHeader className="flex flex-col gap-1">
                <h2 className="font-headline-sm text-primary">
                  Company Activation
                </h2>
                <p className="font-body-md text-neutral">
                  Enter your corporate number to activate your company.
                </p>
              </ModalHeader>
            )}
            {!isDepoying && !isDeployed && (
              <form onSubmit={handleSubmit} id="company-activation-form">
                <ModalBody>
                  <Stack className="gap-4">
                    <Input
                      name="company_number"
                      value={formData.company_number || ""}
                      onChange={handleInputChange}
                      label="Company Number"
                      labelPlacement="outside"
                      placeholder="Enter your 13-digit company number"
                      description="Enter the 13-digit company number issued by the National Tax Agency."
                      pattern="[0-9]{13}"
                      required
                    />
                  </Stack>
                </ModalBody>
                <ModalFooter>
                  <Button color="default" variant="light" onPress={onClose}>
                    Cancel
                  </Button>
                  <Button
                    color="primary"
                    type="submit"
                    form="company-activation-form"
                  >
                    Activate
                  </Button>
                </ModalFooter>
              </form>
            )}
            {isDepoying && !isDeployed && (
              <ModalBody className={cn("p-8")}>
                <motion.div
                  className="flex flex-row items-center justify-center h-full gap-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Spinner />
                  <p className="font-body-md text-primary font-mono">
                    Activating your company...
                  </p>
                </motion.div>
              </ModalBody>
            )}
            {isDeployed && (
              <ModalBody className={cn("p-8")}>
                <motion.div
                  className="flex flex-row items-center justify-center h-full gap-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="font-body-md text-primary font-mono">
                    Activated
                  </p>
                </motion.div>
              </ModalBody>
            )}
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
