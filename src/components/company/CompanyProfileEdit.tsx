import { FC, useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  ModalProps,
} from "@heroui/react";
import { Tables } from "@/types/schema";
import { useCompany } from "@/hooks/useCompany";
import { Stack } from "@/sphere/Stack";
import ImageUploader from "@/components/ImageUploader";
import { useAtom } from "jotai";
import { selectedFileAtom } from "@/atoms";
import { uploadFile } from "@/utils/supabase";
import { v4 as uuidv4 } from "uuid";
import { useTaskStatus } from "@/hooks/useTaskStatus";
import { useTranslation } from "next-i18next";

type CompanyProfileEditProps = {
  company?: Tables<"COMPANY">;
} & Omit<ModalProps, "children">;

export const CompanyProfileEdit: FC<CompanyProfileEditProps> = ({
  company,
  ...props
}) => {
  const { t } = useTranslation(["company", "common"]);
  const { updateCompany } = useCompany(company?.id);
  const [selectedFile, setSelectedFile] = useAtom(selectedFileAtom);
  const [imgUrl, setImgUrl] = useState<string | undefined>(undefined);
  const [formData, setFormData] = useState<Partial<Tables<"COMPANY">>>({
    icon: company?.icon || "",
    display_name: company?.display_name || "",
    email: company?.email || "",
  });
  const { updateTaskStatusByIds } = useTaskStatus();

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
      if (selectedFile) {
        const { publicUrl } = await uploadFile(
          "company-icon",
          `${uuidv4()}-icon`,
          selectedFile
        );
        setImgUrl(publicUrl);
        console.log("publicUrl", publicUrl);
        formData.icon = publicUrl;
      }

      await updateCompany({
        id: company.id,
        ...formData,
      });

      const hasAllFields =
        formData.icon && formData.display_name && formData.email;
      const hasAnyField =
        formData.icon || formData.display_name || formData.email;

      const status = hasAllFields
        ? "completed"
        : hasAnyField
        ? "inProgress"
        : "todo";

      await updateTaskStatusByIds({
        company_id: company.id,
        task_id: "enter-company-profile",
        status: status,
      });

      setSelectedFile(undefined);
      setImgUrl(undefined);
      props.onClose?.();
      props.onOpenChange?.(false);
    } catch (error) {
      console.error("Failed to update company profile:", error);
    }
  };

  useEffect(() => {
    if (company) {
      setFormData({
        icon: company.icon || "",
        display_name: company.display_name || "",
        email: company.email || "",
      });
      setImgUrl(company.icon || "");
    }
  }, [company]);

  return (
    <Modal
      {...props}
      onClose={() => {
        setSelectedFile(undefined);
        setImgUrl(undefined);
        props.onClose?.();
      }}
      classNames={{
        base: "max-w-md",
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <h2 className="font-headline-sm text-primary">
                {t("Edit Company Profile")}
              </h2>
              <p className="font-body-md text-neutral">
                {t("Update your company's basic information.")}
              </p>
            </ModalHeader>
            <form onSubmit={handleSubmit} id="company-edit-form">
              <ModalBody>
                <Stack className="gap-4">
                  <ImageUploader
                    label={t("Company Icon")}
                    defaultImage={imgUrl}
                  />
                  <Input
                    name="display_name"
                    value={formData.display_name || ""}
                    onChange={handleInputChange}
                    label={t("Company Name", { ns: "common" })}
                    labelPlacement="outside"
                    placeholder={t("Enter your company name")}
                    description={t("This name is a display name")}
                  />
                  <Input
                    name="email"
                    value={formData.email || ""}
                    onChange={handleInputChange}
                    label={t("Company Email")}
                    labelPlacement="outside"
                    placeholder="company@example.com"
                    type="email"
                  />
                </Stack>
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="light" onPress={onClose}>
                  {t("Cancel", { ns: "common" })}
                </Button>
                <Button color="primary" type="submit" form="company-edit-form">
                  {t("Save", { ns: "common" })}
                </Button>
              </ModalFooter>
            </form>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
