import { FC } from "react";
import { Input, DateInput } from "@nextui-org/react";
import { LuJapaneseYen } from "react-icons/lu";
import { AoIFormData } from "@/types/aoi";
import { DateValue } from "@nextui-org/react";
import { CalendarDate, ZonedDateTime } from "@internationalized/date";

type BusinessDatesSectionProps = {
  formData: AoIFormData;
  setFormData: React.Dispatch<React.SetStateAction<AoIFormData>>;
};

export const BusinessDatesSection: FC<BusinessDatesSectionProps> = ({
  formData,
  setFormData,
}) => {
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
        label="Business Start Date"
        labelPlacement="outside"
      />
      <DateInput
        name="businessEndDate"
        //@ts-ignore
        value={formData.businessEndDate as DateValue}
        onChange={(value) => handleDateChange("businessEndDate", value)}
        label="Business End Date"
        labelPlacement="outside"
      />
      <Input
        name="capital"
        value={formData.capital}
        onChange={handleInputChange}
        label="Capital"
        labelPlacement="outside"
        inputMode="numeric"
        placeholder="100000000"
        type="number"
        startContent={<LuJapaneseYen className="w-4 h-4 text-neutral" />}
      />
      <DateInput
        name="establishmentDate"
        //@ts-ignore
        value={formData.establishmentDate as DateValue}
        onChange={(value) => handleDateChange("establishmentDate", value)}
        label="Establishment Date"
        labelPlacement="outside"
      />
    </>
  );
};
