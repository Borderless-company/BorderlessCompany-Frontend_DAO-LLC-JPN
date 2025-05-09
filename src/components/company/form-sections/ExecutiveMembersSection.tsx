import { FC } from "react";
import { Button, Input, Checkbox } from "@heroui/react";
import { PiPlusCircle, PiMinusCircle } from "react-icons/pi";
import { LuJapaneseYen } from "react-icons/lu";
import { AoIFormData } from "@/types/aoi";
import { Tables } from "@/types/schema";
import { useTranslation } from "next-i18next";

type ExecutiveMembersSectionProps = {
  formData: AoIFormData;
  setFormData: React.Dispatch<React.SetStateAction<AoIFormData>>;
  company: Tables<"COMPANY"> | null | undefined;
};

export const ExecutiveMembersSection: FC<ExecutiveMembersSectionProps> = ({
  formData,
  setFormData,
  company,
}) => {
  const { t } = useTranslation(["aoi", "common"]);
  const handleExecutiveMemberChange = (
    index: number,
    field: keyof AoIFormData["executiveMembers"][0],
    value: string | boolean
  ) => {
    if (field === "name" && value === "") {
      const newExecutiveMembers = formData.executiveMembers.filter(
        (_, i) => i !== index
      );
      setFormData((prev) => ({
        ...prev,
        executiveMembers:
          newExecutiveMembers.length > 0
            ? newExecutiveMembers
            : [
                {
                  userId: "",
                  name: "",
                  address: "",
                  walletAddress: company?.founder_id ?? "",
                  isRepresentative: true,
                  investment: "",
                },
              ],
      }));
    } else {
      const newExecutiveMembers = [...formData.executiveMembers];

      if (newExecutiveMembers[index]) {
        if (field === "isRepresentative" && value === true) {
          newExecutiveMembers.forEach((member, i) => {
            if (i !== index) {
              member.isRepresentative = false;
            }
          });
        }
        newExecutiveMembers[index] = {
          ...newExecutiveMembers[index],
          [field]: value,
        };
      }
      setFormData((prev) => ({
        ...prev,
        executiveMembers: newExecutiveMembers,
      }));
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {formData.executiveMembers.map((member, index) => (
        <div key={index} className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="font-label-md text-foreground">
              {t("Executive", { ns: "common" })} {index + 1}
            </p>
            {index > 0 && (
              <Button
                isIconOnly
                size="sm"
                color="danger"
                variant="light"
                onPress={() => handleExecutiveMemberChange(index, "name", "")}
              >
                <PiMinusCircle className="w-4 h-4" />
              </Button>
            )}
          </div>
          <Input
            name={`executiveMemberName-${index}`}
            value={member.name}
            onChange={(e) =>
              handleExecutiveMemberChange(index, "name", e.target.value)
            }
            label={t("Name")}
            placeholder={index !== 0 ? t("John Doe") : t("Your Name")}
            labelPlacement="inside"
          />
          <Input
            name={`executiveMemberAddress-${index}`}
            value={member.address}
            onChange={(e) =>
              handleExecutiveMemberChange(index, "address", e.target.value)
            }
            label={t("Address")}
            placeholder={t("Chiyoda, Chiyoda, Tokyo")}
            labelPlacement="inside"
          />
          <Input
            name={`executiveMemberWalletAddress-${index}`}
            value={index !== 0 ? member.walletAddress : company?.founder_id!}
            onChange={(e) =>
              handleExecutiveMemberChange(
                index,
                "walletAddress",
                e.target.value
              )
            }
            isReadOnly={index === 0}
            label={t("Wallet Address")}
            placeholder="0x1234567890abcdef"
            labelPlacement="inside"
          />
          <Input
            name={`executiveMemberInvestment-${index}`}
            value={member.investment}
            onChange={(e) =>
              handleExecutiveMemberChange(index, "investment", e.target.value)
            }
            label={t("Investment Amount")}
            placeholder="1000000"
            labelPlacement="inside"
            type="number"
            startContent={<LuJapaneseYen className="w-4 h-4 text-neutral" />}
          />
          <Checkbox
            name={`isRepresentativeMember-${index}`}
            isSelected={member.isRepresentative}
            onValueChange={(checked) =>
              handleExecutiveMemberChange(index, "isRepresentative", checked)
            }
          >
            {t("Representative", { ns: "common" })}
          </Checkbox>
        </div>
      ))}
      <Button
        size="sm"
        variant="light"
        color="secondary"
        startContent={<PiPlusCircle className="w-4 h-4" />}
        onPress={() => {
          setFormData((prev) => ({
            ...prev,
            executiveMembers: [
              ...prev.executiveMembers,
              {
                userId: "",
                name: "",
                address: "",
                walletAddress: "",
                isRepresentative: false,
                investment: "",
              },
            ],
          }));
        }}
      >
        {t("Add Executive")}
      </Button>
    </div>
  );
};
