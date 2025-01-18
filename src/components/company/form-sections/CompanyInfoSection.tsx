import { FC } from "react";
import { Input, Textarea } from "@nextui-org/react";
import { AoIFormData } from "@/types/aoi";

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
  return (
    <>
      <Input
        name="companyNameJp"
        value={formData.companyNameJp}
        onChange={handleInputChange}
        label="Company Name (JP)"
        labelPlacement="outside"
        placeholder="ネクストコミュニティ DAO, LLC"
      />
      <Input
        name="companyNameEn"
        value={formData.companyNameEn}
        onChange={handleInputChange}
        label="Company Name (EN)"
        labelPlacement="outside"
        placeholder="Next Community DAO, LLC"
      />
      <Textarea
        name="businessPurpose"
        value={formData.businessPurpose}
        onChange={handleInputChange}
        label="Business Purpose"
        labelPlacement="outside"
        placeholder="Enter your business purpose"
      />
    </>
  );
};
