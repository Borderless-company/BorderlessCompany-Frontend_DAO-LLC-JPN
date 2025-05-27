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
import { GovAgreementFormData } from "@/types/govAgreement";
import { GovAgreementPreview } from "./GovAgreementPreview";
import { useTranslation } from "next-i18next";
import { useGovAgreementByCompanyId } from "@/hooks/useGovAgreement";
import { useCompany } from "@/hooks/useCompany";
import { useMembersByCompanyId } from "@/hooks/useMember";
import { LuDownload } from "react-icons/lu";
import generatePDF, { Margin, usePDF } from "react-to-pdf";
import { parseDate, CalendarDate } from "@internationalized/date";

type GovAgreementModalProps = {
  companyId?: string;
} & Omit<ModalProps, "children">;

export const GovAgreementModal: FC<GovAgreementModalProps> = ({
  companyId,
  ...props
}) => {
  const { t } = useTranslation(["govAgreement", "common"]);
  const [formData, setFormData] =
    useState<Partial<GovAgreementFormData> | null>(null);
  const [isPdfLoading, setIsPdfLoading] = useState(false);

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
    filename: `総会規定_${
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

  // 総会規定情報の取得
  const {
    govAgreement,
    isLoading: isLoadingGovAgreement,
    isError: isErrorGovAgreement,
  } = useGovAgreementByCompanyId(companyId);

  // データが取得できたら、formDataを構築
  useEffect(() => {
    if (company && govAgreement) {
      // CalendarDateの型エラーを回避するため、条件チェックでundefinedを回避
      if (govAgreement.enforcementDate) {
        const enforcementDate = parseDate(govAgreement.enforcementDate);

        setFormData({
          communicationTool: govAgreement.communicationTool || "",
          recommenders:
            govAgreement.recommenders?.map((token) =>
              token.is_executable ? "executive" : "non-executive"
            ) || [],
          recommendationRate: govAgreement.recommendationRate || 60,
          votingLevels: [
            {
              level: 1,
              name: govAgreement.votingLevels?.[0]?.name || "",
              participants:
                govAgreement.votingLevels?.[0]?.participants?.map(
                  (participant) =>
                    participant.token.is_executable
                      ? "executive"
                      : "non-executive"
                ) || [],
              quorum: govAgreement.votingLevels?.[0]?.quorum || 50,
              threshold: govAgreement.votingLevels?.[0]?.voting_threshold || 60,
            },
            {
              level: 2,
              name: govAgreement.votingLevels?.[1]?.name || "",
              participants:
                govAgreement.votingLevels?.[1]?.participants?.map(
                  (participant) =>
                    participant.token.is_executable
                      ? "executive"
                      : "non-executive"
                ) || [],
              quorum: govAgreement.votingLevels?.[1]?.quorum || 50,
              threshold: govAgreement.votingLevels?.[1]?.voting_threshold || 60,
            },
          ],
          emergencyVoting: {
            level: -1,
            name:
              govAgreement.votingLevels?.filter(
                (level) => level.is_emergency
              )[0]?.name || "",
            participants:
              govAgreement.votingLevels
                ?.filter((level) => level.is_emergency)[0]
                ?.participants?.map((participant) =>
                  participant.token.is_executable
                    ? "executive"
                    : "non-executive"
                ) || [],
            quorum:
              govAgreement.votingLevels?.filter(
                (level) => level.is_emergency
              )[0]?.quorum || 50,
            threshold:
              govAgreement.votingLevels?.filter(
                (level) => level.is_emergency
              )[0]?.voting_threshold || 60,
          },
          enforcementDate: govAgreement?.enforcementDate
            ? parseDate(govAgreement.enforcementDate)
            : undefined,
        });
      }
    }
  }, [company, govAgreement]);

  // ローディング状態
  const isLoading =
    isLoadingCompany || isLoadingGovAgreement || isLoadingMembers;

  // エラー状態
  const isError = isErrorCompany || isErrorGovAgreement || !!membersError;

  // 表示用のデータを作成
  const previewData = govAgreement
    ? {
        communicationTool: govAgreement.communicationTool || "",
        recommenders:
          govAgreement.recommenders?.map((token) =>
            token.is_executable ? "executive" : "non-executive"
          ) || [],
        recommendationRate: govAgreement.recommendationRate || 60,
        votingLevels: [
          {
            level: 1,
            name: govAgreement.votingLevels?.[0]?.name || "",
            participants:
              govAgreement.votingLevels?.[0]?.participants?.map((participant) =>
                participant.token.is_executable ? "executive" : "non-executive"
              ) || [],
            quorum: govAgreement.votingLevels?.[0]?.quorum || 50,
            threshold: govAgreement.votingLevels?.[0]?.voting_threshold || 60,
          },
          {
            level: 2,
            name: govAgreement.votingLevels?.[1]?.name || "",
            participants:
              govAgreement.votingLevels?.[1]?.participants?.map((participant) =>
                participant.token.is_executable ? "executive" : "non-executive"
              ) || [],
            quorum: govAgreement.votingLevels?.[1]?.quorum || 50,
            threshold: govAgreement.votingLevels?.[1]?.voting_threshold || 60,
          },
        ],
        emergencyVoting: {
          level: -1,
          name:
            govAgreement.votingLevels?.filter((level) => level.is_emergency)[0]
              ?.name || "",
          participants:
            govAgreement.votingLevels
              ?.filter((level) => level.is_emergency)[0]
              ?.participants?.map((participant) =>
                participant.token.is_executable ? "executive" : "non-executive"
              ) || [],
          quorum:
            govAgreement.votingLevels?.filter((level) => level.is_emergency)[0]
              ?.quorum || 50,
          threshold:
            govAgreement.votingLevels?.filter((level) => level.is_emergency)[0]
              ?.voting_threshold || 60,
        },
        // enforcementDateを直接オブジェクトとして渡す
        enforcementDate: {
          year: govAgreement.enforcementDate
            ? parseInt(govAgreement.enforcementDate.split("-")[0])
            : new Date().getFullYear(),
          month: govAgreement.enforcementDate
            ? parseInt(govAgreement.enforcementDate.split("-")[1])
            : new Date().getMonth() + 1,
          day: govAgreement.enforcementDate
            ? parseInt(govAgreement.enforcementDate.split("-")[2])
            : new Date().getDate(),
        },
        companyName: company?.COMPANY_NAME?.["ja-jp"] || undefined,
        initialMembers: govAgreement?.initialExecutive?.map(
          (member) => member.USER.name || ""
        ),
      }
    : null;

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
              {isLoading && (
                <div className="flex justify-center items-center h-60">
                  <Spinner color="primary" size="lg" />
                </div>
              )}
              {isError && (
                <div className="flex justify-center items-center h-60 text-danger font-body-md">
                  {t("Error loading Governance Agreement")}
                </div>
              )}
              {!isLoading && !isError && previewData && (
                <div ref={targetRef}>
                  <GovAgreementPreview onlyPreview data={previewData as any} />
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button
                color="primary"
                variant="flat"
                startContent={!isPdfLoading ? <LuDownload /> : undefined}
                onPress={handlePdfExport}
                isDisabled={isLoading || isError || !previewData || isPdfLoading}
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
