import { FC } from "react";
import { Button, Input } from "@heroui/react";
import { PiPlusCircle, PiMinusCircle } from "react-icons/pi";
import { AoIFormData } from "@/types/aoi";

type BranchLocationsSectionProps = {
  formData: AoIFormData;
  setFormData: React.Dispatch<React.SetStateAction<AoIFormData>>;
};

export const BranchLocationsSection: FC<BranchLocationsSectionProps> = ({
  formData,
  setFormData,
}) => {
  const handleBranchLocationChange = (index: number, value: string) => {
    if (value === "") {
      const newBranchLocations = formData.branchLocations.filter(
        (_, i) => i !== index
      );
      setFormData((prev) => ({
        ...prev,
        branchLocations:
          newBranchLocations.length > 0 ? newBranchLocations : [""],
      }));
    } else {
      const newBranchLocations = [...formData.branchLocations];
      if (index === formData.branchLocations.length) {
        newBranchLocations.push(value);
      } else {
        newBranchLocations[index] = value;
      }
      setFormData((prev) => ({
        ...prev,
        branchLocations: newBranchLocations,
      }));
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <p className="font-label-md text-foreground">Branch Location</p>
      {formData.branchLocations.map((location, index) => (
        <div key={index} className="flex gap-1 items-center">
          <Input
            className="flex-1"
            name={`branchLocation-${index}`}
            value={location}
            onChange={(e) => handleBranchLocationChange(index, e.target.value)}
            label={`Branch Location ${index + 1}`}
            labelPlacement="inside"
          />
          {index > 0 && (
            <Button
              isIconOnly
              size="sm"
              color="danger"
              variant="light"
              onPress={() => handleBranchLocationChange(index, "")}
            >
              <PiMinusCircle className="w-4 h-4" />
            </Button>
          )}
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
            branchLocations: [...prev.branchLocations, ""],
          }));
        }}
      >
        Add Branch Location
      </Button>
    </div>
  );
};
