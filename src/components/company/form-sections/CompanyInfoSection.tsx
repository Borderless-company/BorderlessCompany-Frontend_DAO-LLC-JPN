import { FC } from "react";
import { Input, Textarea } from "@heroui/react";
import { AoIFormData } from "@/types/aoi";
import { useTranslation } from "next-i18next";

type CompanyInfoSectionProps = {
  formData: AoIFormData;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
};

export const CompanyInfoSection: FC<CompanyInfoSectionProps> = ({
  formData,
  handleInputChange,
}) => {
  const { t } = useTranslation("aoi");
  return (
    <>
      <Input
        name="companyNameJp"
        value={formData.companyNameJp}
        onChange={handleInputChange}
        label={t("Company Name JP")}
        labelPlacement="outside"
        placeholder="ネクストコミュニティ DAO, LLC"
      />
      <Input
        name="companyNameEn"
        value={formData.companyNameEn}
        onChange={handleInputChange}
        label={t("Company Name EN")}
        labelPlacement="outside"
        placeholder="Next Community DAO, LLC"
      />
      <Textarea
        name="businessPurpose"
        value={formData.businessPurpose}
        onChange={handleInputChange}
        label={t("Business Purpose")}
        labelPlacement="outside"
        placeholder={t("Enter your business purpose")}
      />
      <Input
        name="location"
        value={formData.location}
        onChange={handleInputChange}
        label={t("Location")}
        labelPlacement="outside"
        placeholder={t("Enter your location")}
      />
    </>
  );
};
