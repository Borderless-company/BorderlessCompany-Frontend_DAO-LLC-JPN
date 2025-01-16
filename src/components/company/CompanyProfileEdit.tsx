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
} from "@nextui-org/react";
import { Tables } from "@/types/schema";
import { useCompany } from "@/hooks/useCompany";
import { Stack } from "@/sphere/Stack";
import ImageUploader from "@/components/ImageUploader";
import { useAtom } from "jotai";
import { selectedFileAtom } from "@/atoms";
import { uploadFile } from "@/utils/supabase";
import { v4 as uuidv4 } from "uuid";
import { useTaskStatus } from "@/hooks/useTaskStatus";

type CompanyProfileEditProps = {
  company?: Tables<"COMPANY">;
} & Omit<ModalProps, "children">;

export const CompanyProfileEdit: FC<CompanyProfileEditProps> = ({
  company,
  ...props
}) => {
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
                Edit Company Profile
              </h2>
              <p className="font-body-md text-neutral">
                Update your company&apos;s basic information.
              </p>
            </ModalHeader>
            <form onSubmit={handleSubmit} id="company-edit-form">
              <ModalBody>
                <Stack className="gap-4">
                  <ImageUploader label="Company Icon" />
                  <Input
                    name="display_name"
                    value={formData.display_name || ""}
                    onChange={handleInputChange}
                    label="Company Name"
                    labelPlacement="outside"
                    placeholder="Enter your company name"
                  />
                  <Input
                    name="email"
                    value={formData.email || ""}
                    onChange={handleInputChange}
                    label="Email Address"
                    labelPlacement="outside"
                    placeholder="company@example.com"
                    type="email"
                  />
                </Stack>
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary" type="submit" form="company-edit-form">
                  Save
                </Button>
              </ModalFooter>
            </form>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
