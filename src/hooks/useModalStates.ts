import { useDisclosure } from "@heroui/react";

export type ModalKeys = 
  | "aoiModal"
  | "govAgreementModal" 
  | "operationRegulationModal"
  | "tokenAgreementModal"
  | "aoiBuilder"
  | "companyProfileEdit"
  | "executiveTokenInfoEdit"
  | "nonExecutiveTokenInfoEdit"
  | "companyActivation"
  | "govAgreementEdit";

export const useModalStates = () => {
  const aoiModal = useDisclosure();
  const govAgreementModal = useDisclosure();
  const operationRegulationModal = useDisclosure();
  const tokenAgreementModal = useDisclosure();
  const aoiBuilder = useDisclosure();
  const companyProfileEdit = useDisclosure();
  const executiveTokenInfoEdit = useDisclosure();
  const nonExecutiveTokenInfoEdit = useDisclosure();
  const companyActivation = useDisclosure();
  const govAgreementEdit = useDisclosure();

  return {
    aoiModal,
    govAgreementModal,
    operationRegulationModal,
    tokenAgreementModal,
    aoiBuilder,
    companyProfileEdit,
    executiveTokenInfoEdit,
    nonExecutiveTokenInfoEdit,
    companyActivation,
    govAgreementEdit,
  };
};