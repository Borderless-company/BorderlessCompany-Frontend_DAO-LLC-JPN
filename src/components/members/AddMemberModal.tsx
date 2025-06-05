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
  Checkbox,
} from "@heroui/react";
import { LuJapaneseYen } from "react-icons/lu";
import { Tables } from "@/types/schema";
import { useMember } from "@/hooks/useMember";
import { useUser } from "@/hooks/useUser";

type AddMemberModalProps = {
  company?: Tables<"COMPANY">;
  onAddMember?: (member: {
    userId: string;
    name: string;
    address: string;
    walletAddress: string;
    isRepresentative: boolean;
    investment: string;
  }) => void;
} & Omit<ModalProps, "children">;

const AddMemberModal: FC<AddMemberModalProps> = ({
  company,
  onAddMember,
  ...props
}) => {
  const [formData, setFormData] = useState({
    userId: "",
    name: "",
    address: "",
    walletAddress: "",
    isRepresentative: false,
    investment: "",
  });
  const { createMember } = useMember();
  const { createUser } = useUser();
  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof typeof formData
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);

    // ユーザー作成/更新
    const user = await createUser({
      evm_address: formData.walletAddress,
      address: formData.address,
      name: formData.name,
      status: "signedUp",
    });

    // メンバー作成
    await createMember({
      user_id: formData.walletAddress,
      company_id: company?.id,
      is_executive: true,
      is_representative: formData.isRepresentative,
      invested_amount: parseInt(formData.investment) || 0,
    });

    setFormData({
      userId: "",
      name: "",
      address: "",
      walletAddress: "",
      isRepresentative: false,
      investment: "",
    });
    setIsSaving(false);
    props.onClose?.();
    props.onOpenChange?.(false);
  };

  return (
    <Modal
      {...props}
      onClose={() => {
        setFormData({
          userId: "",
          name: "",
          address: "",
          walletAddress: "",
          isRepresentative: false,
          investment: "",
        });
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
                Add Executive Member
              </h2>
              <p className="font-body-md text-neutral">
                Enter the information for the new executive member.
              </p>
            </ModalHeader>
            <form onSubmit={handleSubmit} id="add-member-form">
              <ModalBody>
                <div className="flex flex-col gap-4">
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange(e, "name")}
                    label="Name"
                    labelPlacement="inside"
                    placeholder="John Doe"
                  />
                  <Input
                    name="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange(e, "address")}
                    label="Address"
                    labelPlacement="inside"
                    placeholder="1-1-1 Chiyoda, Chiyoda, Tokyo"
                  />
                  <Input
                    name="walletAddress"
                    value={formData.walletAddress}
                    onChange={(e) => handleInputChange(e, "walletAddress")}
                    label="Wallet Address"
                    labelPlacement="inside"
                    placeholder="0x1234567890abcdef"
                  />
                  <Input
                    name="investment"
                    value={formData.investment}
                    onChange={(e) => handleInputChange(e, "investment")}
                    label="Investment Amount"
                    labelPlacement="inside"
                    type="number"
                    placeholder="1000000"
                    startContent={
                      <LuJapaneseYen className="w-4 h-4 text-neutral" />
                    }
                  />
                  <Checkbox
                    name="isRepresentative"
                    isSelected={formData.isRepresentative}
                    onValueChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        isRepresentative: checked,
                      }))
                    }
                  >
                    Representative Member
                  </Checkbox>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  type="submit"
                  form="add-member-form"
                  isLoading={isSaving}
                >
                  Add Member
                </Button>
              </ModalFooter>
            </form>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default AddMemberModal;
