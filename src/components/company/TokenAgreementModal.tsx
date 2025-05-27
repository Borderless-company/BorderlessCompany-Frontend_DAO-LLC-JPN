import { FC, useRef, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalBody,
  ModalFooter,
  Button,
  ModalProps,
} from "@heroui/react";
import { useTranslation } from "next-i18next";
import { TokenAgreementPreview } from "./TokenAgreementPreview";
import { LuDownload } from "react-icons/lu";
import { Margin, usePDF } from "react-to-pdf";
import { useCompany } from "@/hooks/useCompany";
import { useTokenByCompanyId } from "@/hooks/useToken";
import { useAOIByCompanyId } from "@/hooks/useAOI";
type TokenAgreementModalProps = {
  companyId?: string;
} & Omit<ModalProps, "children">;

export const TokenAgreementModal: FC<TokenAgreementModalProps> = ({
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
  const { tokens, isLoadingTokens, isErrorTokens } =
    useTokenByCompanyId(companyId);
  const {
    aoi,
    isLoading: isLoadingAOI,
    isError: isErrorAOI,
  } = useAOIByCompanyId(companyId);

  const { toPDF, targetRef } = usePDF({
    filename: `トークン規定_${
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
              <TokenAgreementPreview
                data={{
                  exeTokenName:
                    tokens?.filter((token) => token.is_executable)[0].name ||
                    "",
                  nonExeTokenName:
                    tokens?.filter((token) => !token.is_executable)[0].name ||
                    "",
                }}
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
