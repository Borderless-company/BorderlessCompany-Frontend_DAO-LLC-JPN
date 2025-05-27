import { FC, useEffect, useState, useRef } from "react";
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
import { AoIFormData } from "@/types/aoi";
import { AoIPreview } from "./AoIPreview";
import { useTranslation } from "next-i18next";
import { useAOIByCompanyId } from "@/hooks/useAOI";
import { useCompany } from "@/hooks/useCompany";
import { useMembersByCompanyId } from "@/hooks/useMember";
import { getInitialFormData } from "@/utils/aoi";
import { LuDownload } from "react-icons/lu";
import generatePDF, { Margin, usePDF } from "react-to-pdf";

type AoIModalProps = {
  companyId?: string;
} & Omit<ModalProps, "children">;

export const AoIModal: FC<AoIModalProps> = ({ companyId, ...props }) => {
  const { t } = useTranslation(["aoi", "common"]);
  const [formData, setFormData] = useState<AoIFormData | null>(null);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const aoiPreviewRef = useRef<HTMLDivElement>(null);

  // 会社情報の取得
  const {
    company,
    isLoading: isLoadingCompany,
    isError: isErrorCompany,
  } = useCompany(companyId);

  // メンバー情報の取得
  const { members, isLoadingMembers, membersError } =
    useMembersByCompanyId(companyId);

  const { toPDF, targetRef } = usePDF({
    filename: `定款_${
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

  // AoI情報の取得
  const {
    aoi,
    isLoading: isLoadingAOI,
    isError: isErrorAOI,
  } = useAOIByCompanyId(companyId);

  // データが取得できたら、formDataを構築
  useEffect(() => {
    if (company) {
      setFormData(getInitialFormData(company, aoi, members));
    }
  }, [company, aoi, members]);

  // ローディング状態
  const isLoading = isLoadingCompany || isLoadingAOI || isLoadingMembers;

  // エラー状態
  const isError = isErrorCompany || isErrorAOI || !!membersError;

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
            {/* <ModalHeader className="flex flex-col gap-1">
              <h2 className="font-headline-sm text-primary">
                {t("Articles of Incorporation")}
              </h2>
              <p className="font-body-md text-neutral">
                {t("Preview of your Articles of Incorporation")}
              </p>
            </ModalHeader> */}
            <ModalBody className="max-h-[70vh] overflow-y-auto">
              {isLoading && (
                <div className="flex justify-center items-center h-60">
                  <Spinner color="primary" size="lg" />
                </div>
              )}
              {isError && (
                <div className="flex justify-center items-center h-60 text-danger font-body-md">
                  {t("Error loading Articles of Incorporation")}
                </div>
              )}
              {!isLoading && !isError && formData && (
                <AoIPreview
                  ref={targetRef}
                  formData={formData}
                  onlyPreview
                  className="pdf-container"
                />
              )}
            </ModalBody>
            <ModalFooter>
              <Button
                color="primary"
                variant="flat"
                startContent={<LuDownload />}
                onPress={handlePdfExport}
                isDisabled={isLoading || isError || !formData || isPdfLoading}
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
