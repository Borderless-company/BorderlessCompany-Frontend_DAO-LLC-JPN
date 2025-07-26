import { FC, useEffect, useMemo } from "react";
import { useTranslation } from "next-i18next";
import {
  Button,
  Chip,
  ChipProps,
  cn,
  Spinner,
  useDisclosure,
  Link,
} from "@heroui/react";
import Image from "next/image";
import { Stack } from "@/sphere/Stack";
import {
  PiCheckCircle,
  PiCheckCircleFill,
  PiCopy,
  PiFileDuotone,
  PiKanbanDuotone,
  PiPower,
  PiPowerBold,
} from "react-icons/pi";

import {
  Button as RACButton,
  ButtonProps as RACButtonProps,
} from "react-aria-components";
import { AoIBuilder } from "./AoIBuilder";
import { useCompany } from "@/hooks/useCompany";
import { CompanyProfileEdit } from "./CompanyProfileEdit";
import { ExecutiveTokenInfoEdit } from "./ExecutiveTokenInfoEdit";
import { CompanyActivation } from "./CompanyActivation";
import { useSignOut } from "@/hooks/useSignOut";
import { useTaskStatusByCompany } from "@/hooks/useTaskStatus";
import { motion } from "framer-motion";
import { GovAgreementBuilder } from "./GovAgreementBuilder";
import { NonExecutiveTokenInfoEdit } from "./NonExecutiveTokenInfoEdit";
import { AoIModal } from "./AoIModal";
import { GovAgreementModal } from "./GovAgreementModal";
import { OperationRegulationModal } from "./OperationRegulationModal";
import { TokenAgreementModal } from "./TokenAgreementModal";
import { isStatelessDao } from "@/utils/company";
import {
  useCompanyInfo,
  useExeTokenContract,
  useNonExeTokenContract,
  useSmartCompanyId,
} from "@/hooks/useContract";

export type CompanyHomePageProps = {
  companyId?: string;
};

export const CompanyHomePage: FC<CompanyHomePageProps> = ({ companyId }) => {
  const { signOut } = useSignOut();
  const { t } = useTranslation("company");
  const { company, isLoading, isError } = useCompany(companyId);
  const {
    data: taskStatus,
    isLoading: isLoadingTaskStatus,
    isError: isErrorTaskStatus,
  } = useTaskStatusByCompany(companyId || "");

  // const { data: smartCompanyId } = useSmartCompanyId(company?.founder_id || "");
  // const { data: companyInfo } = useCompanyInfo(company?.founder_id || "");
  // const { data: exeTokenContract } = useExeTokenContract(
  //   company?.founder_id || ""
  // );
  // const { data: nonExeTokenContract } = useNonExeTokenContract(
  //   company?.founder_id || ""
  // );

  // useEffect(() => {
  //   console.log("founder_id", company?.founder_id);
  //   console.log("smartCompanyId", smartCompanyId);
  //   console.log("companyInfo", companyInfo);
  //   console.log("exeTokenContract", exeTokenContract);
  //   console.log("nonExeTokenContract", nonExeTokenContract);
  // }, [
  //   smartCompanyId,
  //   companyInfo,
  //   exeTokenContract,
  //   nonExeTokenContract,
  //   company?.founder_id,
  // ]);

  const {
    isOpen: isOpenAoIModal,
    onOpen: onOpenAoIModal,
    onOpenChange: onOpenChangeAoIModal,
  } = useDisclosure();

  const {
    isOpen: isOpenGovAgreementModal,
    onOpen: onOpenGovAgreementModal,
    onOpenChange: onOpenChangeGovAgreementModal,
  } = useDisclosure();

  const {
    isOpen: isOpenOperationRegulationModal,
    onOpen: onOpenOperationRegulationModal,
    onOpenChange: onOpenChangeOperationRegulationModal,
  } = useDisclosure();

  const {
    isOpen: isOpenTokenAgreementModal,
    onOpen: onOpenTokenAgreementModal,
    onOpenChange: onOpenChangeTokenAgreementModal,
  } = useDisclosure();

  const {
    isOpen: isOpenAoiBuilder,
    onOpen: onOpenAoiBuilder,
    onOpenChange: onOpenChangeAoiBuilder,
  } = useDisclosure();

  const {
    isOpen: isOpenCompanyProfileEdit,
    onOpen: onOpenCompanyProfileEdit,
    onOpenChange: onOpenChangeCompanyProfileEdit,
  } = useDisclosure();

  const {
    isOpen: isOpenExecutiveTokenInfoEdit,
    onOpen: onOpenExecutiveTokenInfoEdit,
    onOpenChange: onOpenChangeExecutiveTokenInfoEdit,
  } = useDisclosure();
  const {
    isOpen: isOpenNonExecutiveTokenInfoEdit,
    onOpen: onOpenNonExecutiveTokenInfoEdit,
    onOpenChange: onOpenChangeNonExecutiveTokenInfoEdit,
  } = useDisclosure();

  const {
    isOpen: isOpenCompanyActivation,
    onOpen: onOpenCompanyActivation,
    onOpenChange: onOpenChangeCompanyActivation,
  } = useDisclosure();

  const {
    isOpen: isOpenGovAgreementEdit,
    onOpen: onOpenGovAgreementEdit,
    onOpenChange: onOpenChangeGovAgreementEdit,
  } = useDisclosure();

  console.log("taskStatus", taskStatus);
  useEffect(() => {
    if (isError) {
      signOut();
    }
  }, [isError]);

  return (
    <>
      {isLoading ? (
        <div className="w-full h-full flex items-center justify-center">
          <Spinner color="primary" size="lg" />
        </div>
      ) : (
        <Stack className="w-full h-full overflow-scroll">
          <div
            className={cn("flex flex-col gap-6 w-full h-fit p-10 pb-0 pt-6 ")}
          >
            <Image
              src={company?.icon || "/company_icon_fallback.png"}
              alt="Company Logo"
              width={80}
              height={80}
              className="rounded-lg shadow-md"
            />
            <Stack className="w-full h-full gap-2">
              <div className="w-full font-headline-lg">
                {company?.display_name || "Your Company"}
              </div>
              {!isStatelessDao(company) && (
                <Chip
                  className="transition-colors duration-150"
                  variant="bordered"
                  size="lg"
                  color={company?.is_active ? "primary" : "default"}
                  startContent={
                    <PiPowerBold
                      color={
                        company?.is_active
                          ? "var(--bls-primary)"
                          : "var(--bls-neutral)"
                      }
                      size={20}
                    />
                  }
                >
                  {company?.is_active ? t("Active") : t("Inactive")}
                </Chip>
              )}
            </Stack>
            <Stack className="w-full max-w-xl h-fit gap-0 pb-6 border-b-1 border-b-divider">
              <Stack
                h
                className="w-full h-full gap-2 items-center justify-between py-3"
              >
                <div className="font-label-md">会社名(日本語名/英語名)</div>

                <div className="font-label-md">
                  {company?.COMPANY_NAME?.["ja-jp"] || "未設定"} /{" "}
                  {company?.COMPANY_NAME?.["en-us"] || "未設定"}
                </div>
              </Stack>
              <Stack
                h
                className="w-full h-full gap-2 items-center justify-between py-3"
              >
                <div className="font-label-md">{t("Founder")}</div>

                <div className="font-label-md">
                  {company?.founder_id || "未設定"}
                </div>
              </Stack>
              {company?.contract_address && (
                <Stack
                  h
                  className="w-full h-full gap-2 items-center justify-between py-3"
                >
                  <div className="font-label-md flex-shrink-0">
                    コントラクトアドレス
                  </div>
                  <Link
                    color="primary"
                    isExternal
                    showAnchorIcon
                    href={`${process.env.NEXT_PUBLIC_EXPLORER_URL}/address/${company?.contract_address}`}
                    className="w-full"
                  >
                    <span className="font-label-md w-full text-ellipsis overflow-hidden text-right">
                      {company?.contract_address || "未設定"}
                    </span>
                  </Link>
                </Stack>
              )}
              <Stack
                h
                className="w-full h-full gap-2 items-center justify-between py-3"
              >
                <div className="font-label-md">{t("Jurisdiction")}</div>
                <div className=" font-label-md">
                  {company?.jurisdiction?.toUpperCase() || "未設定"}
                </div>
              </Stack>
              <Stack
                h
                className="w-full h-full gap-2 items-center justify-between py-3"
              >
                <div className="font-label-md">{t("Company Type")}</div>
                <div className=" font-label-md">
                  {company?.company_type?.toUpperCase() || "未設定"}
                </div>
              </Stack>
              {company?.email && (
                <Stack
                  h
                  className="w-full h-full gap-2 items-center justify-between py-3"
                >
                  <div className="font-label-md">{t("Company Email")}</div>
                  <div className=" font-label-md">
                    {company?.email || "未設定"}
                  </div>
                </Stack>
              )}
              {!isStatelessDao(company) && (
                <Stack h className="gap-2 mt-2">
                  <Button
                    variant="faded"
                    color="primary"
                    size="md"
                    startContent={<PiFileDuotone />}
                    onPress={onOpenAoIModal}
                  >
                    {"定款"}
                  </Button>
                  <Button
                    variant="faded"
                    color="primary"
                    size="md"
                    startContent={<PiFileDuotone />}
                    onPress={onOpenGovAgreementModal}
                  >
                    {"総会規定"}
                  </Button>
                  <Button
                    variant="faded"
                    color="primary"
                    size="md"
                    startContent={<PiFileDuotone />}
                    onPress={onOpenOperationRegulationModal}
                  >
                    {"運営規定"}
                  </Button>
                  <Button
                    variant="faded"
                    color="primary"
                    size="md"
                    startContent={<PiFileDuotone />}
                    onPress={onOpenTokenAgreementModal}
                  >
                    {"トークン規定"}
                  </Button>
                </Stack>
              )}
            </Stack>
          </div>
          {!isStatelessDao(company) && (
            <Stack className="w-full h-fit gap-4 px-10 py-6">
              <Stack h className="items-center gap-2">
                <PiKanbanDuotone className="text-primary" size={32} />
                <h3 className="w-full font-headline-sm text-foreground">
                  {company?.is_active
                    ? t("Level Up Your Company!")
                    : t("Complete Tasks")}
                </h3>
              </Stack>
              <div className="w-full grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
                {!company?.is_active &&
                  taskStatus?.every((task) => task.status === "completed") && (
                    <TaskCard
                      title={`${t("Activate")} ${
                        company?.display_name ||
                        company?.COMPANY_NAME?.["ja-jp"] ||
                        "Your Company"
                      }${t("を起動する")}`}
                      status="completed"
                      variant="activation"
                      onPress={onOpenCompanyActivation}
                    />
                  )}
                {!company?.is_active &&
                  taskStatus?.map((task) => (
                    <>
                      {task.task_id === "create-aoi" && (
                        <TaskCard
                          key={task.id}
                          title={t("Create AoI")}
                          status={task.status || "todo"}
                          onPress={onOpenAoiBuilder}
                        />
                      )}
                      {task.task_id === "enter-company-profile" && (
                        <TaskCard
                          key={task.id}
                          title={t("Enter Company Profile")}
                          status={task.status || "todo"}
                          onPress={onOpenCompanyProfileEdit}
                        />
                      )}
                      {task.task_id === "enter-non-executive-token-info" && (
                        <TaskCard
                          key={task.id}
                          title={"非業務執行社員トークン情報を入力する"}
                          status={task.status || "todo"}
                          onPress={onOpenNonExecutiveTokenInfoEdit}
                        />
                      )}
                      {task.task_id === "enter-executive-token-info" && (
                        <TaskCard
                          key={task.id}
                          title={t("Enter Executive Member Token Info")}
                          status={task.status || "todo"}
                          onPress={onOpenExecutiveTokenInfoEdit}
                        />
                      )}
                      {task.task_id === "create-gov-agreement" && (
                        <TaskCard
                          key={task.id}
                          title={t("Create Gov Agreement")}
                          status={task.status || "todo"}
                          onPress={onOpenGovAgreementEdit}
                        />
                      )}
                    </>
                  ))}
              </div>
            </Stack>
          )}
        </Stack>
      )}
      {isOpenAoiBuilder && (
        <AoIBuilder
          isOpen={isOpenAoiBuilder}
          onOpenChange={onOpenChangeAoiBuilder}
          companyId={companyId}
        />
      )}
      {isOpenCompanyProfileEdit && (
        <CompanyProfileEdit
          company={company}
          isOpen={isOpenCompanyProfileEdit}
          onOpenChange={onOpenChangeCompanyProfileEdit}
        />
      )}
      {isOpenNonExecutiveTokenInfoEdit && (
        <NonExecutiveTokenInfoEdit
          company={company}
          isOpen={isOpenNonExecutiveTokenInfoEdit}
          onOpenChange={onOpenChangeNonExecutiveTokenInfoEdit}
        />
      )}
      {isOpenExecutiveTokenInfoEdit && (
        <ExecutiveTokenInfoEdit
          company={company}
          isOpen={isOpenExecutiveTokenInfoEdit}
          onOpenChange={onOpenChangeExecutiveTokenInfoEdit}
        />
      )}
      {isOpenCompanyActivation && (
        <CompanyActivation
          company={company}
          isOpen={isOpenCompanyActivation}
          onOpenChange={onOpenChangeCompanyActivation}
        />
      )}
      {isOpenGovAgreementEdit && (
        <GovAgreementBuilder
          companyId={companyId}
          isOpen={isOpenGovAgreementEdit}
          onOpenChange={onOpenChangeGovAgreementEdit}
        />
      )}
      {isOpenAoIModal && (
        <AoIModal
          companyId={companyId}
          isOpen={isOpenAoIModal}
          onOpenChange={onOpenChangeAoIModal}
        />
      )}
      {isOpenGovAgreementModal && (
        <GovAgreementModal
          companyId={companyId}
          isOpen={isOpenGovAgreementModal}
          onOpenChange={onOpenChangeGovAgreementModal}
        />
      )}
      {isOpenOperationRegulationModal && (
        <OperationRegulationModal
          companyId={companyId}
          isOpen={isOpenOperationRegulationModal}
          onOpenChange={onOpenChangeOperationRegulationModal}
        />
      )}
      {isOpenTokenAgreementModal && (
        <TokenAgreementModal
          companyId={companyId}
          isOpen={isOpenTokenAgreementModal}
          onOpenChange={onOpenChangeTokenAgreementModal}
        />
      )}
    </>
  );
};

export type TaskCardProps = {
  title: string;
  variant?: "task" | "activation";
  status: "completed" | "todo" | "inProgress";
} & RACButtonProps;

export const TaskCard: FC<TaskCardProps> = ({
  title,
  status,
  variant = "task",
  ...props
}) => {
  if (variant === "task") {
    return (
      <RACButton
        className={cn(
          "relative transition-colors duration-150 appearance-none  h-28 flex flex-col gap-2 items-start justify-start p-3 border-1 border-primary-outline rounded-xl ",
          "data-[focused]:outline-none ",
          status !== "completed" && "data-[hovered]:bg-primary-backing",
          status === "completed" &&
            "border-neutral data-[hovered]:bg-neutral-backing"
        )}
        {...props}
      >
        {status === "completed" && (
          <PiCheckCircleFill className="text-neutral " size={32} />
        )}
        {status === "todo" && (
          <PiCheckCircle className="text-primary opacity-40" size={32} />
        )}
        {status === "inProgress" && (
          <PiCheckCircle className="text-primary opacity-40" size={32} />
        )}
        <p
          className={cn(
            "w-fit font-title-md px-1 text-start",
            status !== "completed" && "text-primary",
            status === "completed" && "text-neutral"
          )}
        >
          {title}
        </p>
        <TaskStatusChip status={status} className="absolute top-2 right-2" />
      </RACButton>
    );
  } else {
    return (
      <motion.div
        className="rounded-xl "
        initial={{ opacity: 0, y: 0, scale: 1.2 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
      >
        <motion.div
          className="rounded-xl "
          animate={{
            boxShadow: [
              "0 0 10px rgba(110, 191, 184, 0.7)",
              "0 0 20px rgba(110, 191, 184, 1)",
              "0 0 10px rgba(110, 191, 184, 0.7)",
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <RACButton
            className={cn(
              "dark relative transition-colors duration-150 appearance-none h-28 w-full flex flex-col gap-2 items-start justify-start p-3 rounded-xl",
              "data-[focused]:outline-none bg-background",
              "data-[hovered]:scale-[1.02] transition-transform duration-300 ease-out"
            )}
            {...props}
          >
            <PiPower className="text-[#8ED3CC] " size={32} />

            <p
              className={cn(
                "dark w-fit font-title-md px-1 text-start text-[#8ED3CC]"
              )}
            >
              {title}
            </p>
          </RACButton>
        </motion.div>
      </motion.div>
    );
  }
};

export type TaskStatusChipProps = {
  status: "completed" | "todo" | "inProgress";
} & ChipProps;

export const TaskStatusChip: FC<TaskStatusChipProps> = ({
  status,
  ...props
}) => {
  const { t } = useTranslation("common");
  const color = useMemo(() => {
    if (status === "completed") return "default";
    if (status === "todo") return "primary";
    if (status === "inProgress") return "secondary";
    return "primary";
  }, [status]);

  return (
    <Chip
      variant="solid"
      color={color}
      size="sm"
      classNames={{ base: "rounded-md" }}
      {...props}
    >
      {status === "completed" && t("Completed")}
      {status === "todo" && t("ToDo")}
      {status === "inProgress" && t("In Progress")}
    </Chip>
  );
};
