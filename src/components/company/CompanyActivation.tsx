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
  Spinner,
  cn,
} from "@heroui/react";
import { Tables } from "@/types/schema";
import { useCompany } from "@/hooks/useCompany";
import { Stack } from "@/sphere/Stack";
import { useTaskStatus } from "@/hooks/useTaskStatus";
import { motion } from "framer-motion";
import { useCreateCompany } from "@/hooks/useContract";
import { ethers } from "ethers";
type CompanyActivationProps = {
  company?: Tables<"COMPANY">;
} & Omit<ModalProps, "children">;
import { useActiveAccount } from "thirdweb/react";
import {
  GOVERNANCE_JP_LLC_ADDRESS,
  LETS_JP_LLC_EXECUTIVE_ADDRESS,
  SC_JP_DAO_LLC_ADDRESS,
  LETS_JP_LLC_NON_EXECUTIVE_ADDRESS,
} from "@/constants";
import { useTokenByCompanyId } from "@/hooks/useToken";
import { useAOIByCompanyId } from "@/hooks/useAOI";
import { useMember, useMembersByCompanyId } from "@/hooks/useMember";

export const CompanyActivation: FC<CompanyActivationProps> = ({
  company,
  ...props
}) => {
  const smartAccount = useActiveAccount();
  const [isDepoying, setIsDepoying] = useState(false);
  const [isDeployed, setIsDeployed] = useState(false);
  const { updateCompany } = useCompany(company?.id);
  const { tokens, isLoadingTokens, isErrorTokens, refetchTokens } =
    useTokenByCompanyId(company?.id);
  const { updateMember } = useMember();
  const { members } = useMembersByCompanyId(company?.id);
  const { aoi } = useAOIByCompanyId(company?.id);
  const { createTaskStatus, deleteTaskStatusByIds } = useTaskStatus();
  const { sendTx: sendCreateCompanyTx } = useCreateCompany();
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
    console.log(`company?.id ${company?.id}`);
    if (!company?.id) return;

    try {
      // 会社を有効化

      setIsDepoying(true);

      // Create Company

      const abiCoder = new ethers.AbiCoder();

      console.log(`token?.name ${tokens?.[0]?.name}`);
      console.log(`token?.symbol ${tokens?.[0]?.symbol}`);

      const executiveTokenExtraParams = abiCoder.encode(
        ["string", "string", "string", "string", "string"],
        [
          tokens?.[0]?.name,
          tokens?.[0]?.symbol,
          "https://example.com/metadata/",
          ".json",
          GOVERNANCE_JP_LLC_ADDRESS,
        ]
      );
      console.log(`executiveTokenExtraParams: ${executiveTokenExtraParams}`);
      const nonExecutiveTokenExtraParams = abiCoder.encode(
        ["string", "string", "string", "string", "string"],
        [
          tokens?.[0]?.name,
          tokens?.[0]?.symbol,
          "https://example.com/metadata/",
          ".json",
          GOVERNANCE_JP_LLC_ADDRESS,
        ]
      );
      console.log(
        `nonExecutiveTokenExtraParams: ${nonExecutiveTokenExtraParams}`
      );

      console.log(`formData?.company_number ${formData?.company_number}`);
      console.log(`company?.company_type ${company?.company_type}`);
      console.log(`company?.company_name ${company?.company_name}`);
      console.log(`aoi?.establishment_date ${aoi?.establishment_date}`);
      console.log(`company?.jurisdiction ${company?.jurisdiction}`);
      console.log(`aoi?.location ${aoi?.location}`);
      console.log(`smartAccount?.address ${smartAccount?.address}`);
      console.log(`company?.company_number ${company?.company_number}`);

      if (
        !formData?.company_number ||
        !company?.company_type ||
        !company?.company_name ||
        !aoi?.establishment_date ||
        !company?.jurisdiction ||
        !aoi?.location ||
        !smartAccount?.address
      ) {
        throw new Error("Company data is missing");
      }

      sendCreateCompanyTx(
        ethers.encodeBytes32String(formData?.company_number),
        SC_JP_DAO_LLC_ADDRESS,
        // company?.company_type,
        "SC_JP_DAOLLC",
        company?.company_name,
        aoi?.establishment_date,
        company?.jurisdiction,
        company?.company_type,
        "",
        [aoi?.location, aoi?.location, aoi?.location, aoi?.location],
        [
          GOVERNANCE_JP_LLC_ADDRESS,
          LETS_JP_LLC_EXECUTIVE_ADDRESS,
          LETS_JP_LLC_NON_EXECUTIVE_ADDRESS,
        ],
        ["", executiveTokenExtraParams, nonExecutiveTokenExtraParams]
      );

      //既存のタスクステータスを削除
      await Promise.all([
        deleteTaskStatusByIds({
          company_id: company.id,
          task_id: "create-aoi",
        }),
        deleteTaskStatusByIds({
          company_id: company.id,
          task_id: "enter-company-profile",
        }),
        deleteTaskStatusByIds({
          company_id: company.id,
          task_id: "enter-executive-token-info",
        }),
      ]);

      //新しいタスクを追加;
      await createTaskStatus({
        company_id: company.id,
        task_id: "mint-exe-token",
        status: "todo",
      });

      // メンバーを追加

      if (members?.length) {
        await Promise.all(
          members.map(async (member) => {
            await updateMember({
              user_id: member.user_id,
              company_id: company.id,
              token_id: tokens?.[0]?.id,
              is_minted: member.user_id === smartAccount?.address,
              date_of_employment:
                member.user_id === smartAccount?.address
                  ? new Date().toISOString()
                  : null,
            });
          })
        );
      }

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
