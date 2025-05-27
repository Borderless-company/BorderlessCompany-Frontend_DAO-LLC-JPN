import { FC, useRef, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  ModalProps,
  Spinner,
} from "@heroui/react";
import { useTranslation } from "next-i18next";
import { OperationRegulationPreview } from "./OperationRegulationPreview";
import { LuDownload } from "react-icons/lu";
import generatePDF, { Margin, usePDF } from "react-to-pdf";
import { useAOIByCompanyId } from "@/hooks/useAOI";
import { useCompany } from "@/hooks/useCompany";
type OperationRegulationModalProps = {
  companyId?: string;
} & Omit<ModalProps, "children">;

export const OperationRegulationModal: FC<OperationRegulationModalProps> = ({
  companyId,
  ...props
}) => {
  const { t } = useTranslation(["company", "common"]);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const {
    company,
    isLoading: isLoadingCompany,
    isError: isErrorCompany,
  } = useCompany(companyId);
  const {
    aoi,
    isLoading: isLoadingAOI,
    isError: isErrorAOI,
  } = useAOIByCompanyId(companyId);

  const { toPDF, targetRef } = usePDF({
    filename: `運営規定_${
      company?.COMPANY_NAME?.["ja-jp"] || ""
    }_${new Date().toLocaleDateString("ja-JP")}.pdf`,
    resolution: 2,
    page: {
      margin: Margin.MEDIUM,
      format: "letter",
    },
    overrides: {
      pdf: {
        compress: true,
      },
      canvas: {
        useCORS: true,
      },
    },
  });

  // PDF出力ハンドラー
  const handlePdfExport = async () => {
    setIsPdfLoading(true);
    try {
      await toPDF();
    } catch (error) {
      console.error("PDF export failed:", error);
    } finally {
      setIsPdfLoading(false);
    }
  };

  return (
    <Modal
      {...props}
      classNames={{
        base: "max-w-4xl max-h-[90vh]",
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalBody className="max-h-[70vh] overflow-y-auto">
              <OperationRegulationPreview
                enforcementDate={aoi?.establishment_date || undefined}
                ref={targetRef}
                onlyPreview
                className="pdf-container"
              />
            </ModalBody>
            <ModalFooter>
              <Button
                color="primary"
                variant="flat"
                startContent={isPdfLoading ? <Spinner size="sm" /> : <LuDownload />}
                onPress={handlePdfExport}
                isDisabled={isPdfLoading}
                isLoading={isPdfLoading}
              >
                {isPdfLoading ? "出力中..." : "PDFで出力"}
              </Button>
              <Button color="primary" onPress={onClose}>
                {t("Close", { ns: "common" })}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
