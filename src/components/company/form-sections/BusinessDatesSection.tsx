import { FC } from "react";
import { Input, DateInput } from "@heroui/react";
import { LuJapaneseYen } from "react-icons/lu";
import { AoIFormData } from "@/types/aoi";
import { DateValue } from "@heroui/react";
import { CalendarDate, ZonedDateTime } from "@internationalized/date";
import { useTranslation } from "next-i18next";
type BusinessDatesSectionProps = {
  formData: AoIFormData;
  setFormData: React.Dispatch<React.SetStateAction<AoIFormData>>;
};

export const BusinessDatesSection: FC<BusinessDatesSectionProps> = ({
  formData,
  setFormData,
}) => {
  const { t } = useTranslation("aoi");
  const handleDateChange = (name: string, value: DateValue | null) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <>
      <DateInput
        name="businessStartDate"
        //@ts-ignore
        value={formData.businessStartDate as DateValue}
        onChange={(value) => handleDateChange("businessStartDate", value)}
        label={t("Business Start Date")}
        labelPlacement="outside"
        description="今期の事業開始日を記入"
      />
      <DateInput
        name="businessEndDate"
        //@ts-ignore
        value={formData.businessEndDate as DateValue}
        onChange={(value) => handleDateChange("businessEndDate", value)}
        label={t("Business End Date")}
        labelPlacement="outside"
        description="今期の事業終了日を記入"
      />
      <Input
        name="capital"
        value={formData.capital}
        onChange={handleInputChange}
        label={t("Capital")}
        labelPlacement="outside"
        inputMode="numeric"
        placeholder="100000000"
        type="number"
        startContent={<LuJapaneseYen className="w-4 h-4 text-neutral" />}
      />
      <DateInput
        name="establishmentDate"
        //@ts-ignorepp
        value={formData.establishmentDate as DateValue}
        onChange={(value) => handleDateChange("establishmentDate", value)}
        label={t("Establishment Date")}
        labelPlacement="outside"
      />
    </>
  );
};
