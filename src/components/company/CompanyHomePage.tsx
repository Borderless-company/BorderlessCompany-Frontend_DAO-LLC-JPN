import { FC, useEffect, useMemo } from "react";
import { useTranslation } from "next-i18next";
import { Chip, ChipProps, cn, Spinner, useDisclosure } from "@heroui/react";
import Image from "next/image";
import { useRouter } from "next/router";
import { Stack } from "@/sphere/Stack";
import {
  PiCheckCircle,
  PiCheckCircleFill,
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

export type CompanyHomePageProps = {
  companyId?: string;
};

export const CompanyHomePage: FC<CompanyHomePageProps> = ({ companyId }) => {
  const { signOut } = useSignOut();
  const { t } = useTranslation("company");
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
    isOpen: isOpenCompanyActivation,
    onOpen: onOpenCompanyActivation,
    onOpenChange: onOpenChangeCompanyActivation,
  } = useDisclosure();

  const { company, isLoading, isError } = useCompany(companyId);
  const {
    data: taskStatus,
    isLoading: isLoadingTaskStatus,
    isError: isErrorTaskStatus,
  } = useTaskStatusByCompany(companyId || "");

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
            </Stack>
            <Stack className="w-full h-fit gap-0 pb-6 border-b-1 border-b-divider">
              <Stack
                h
                className="w-full max-w-lg h-full gap-2 items-center justify-between py-3"
              >
                <div className="font-label-md">{t("Founder")}</div>
                <div className=" font-label-md text-ellipsis overflow-hidden text-nowrap">
                  {company?.founder_id || "None"}
                </div>
              </Stack>
              <Stack
                h
                className="w-full max-w-lg h-full gap-2 items-center justify-between py-3"
              >
                <div className="font-label-md">{t("Jurisdiction")}</div>
                <div className=" font-label-md">
                  {company?.jurisdiction?.toUpperCase() || "None"}
                </div>
              </Stack>
              <Stack
                h
                className="w-full max-w-lg h-full gap-2 items-center justify-between py-3"
              >
                <div className="font-label-md">{t("Company Type")}</div>
                <div className=" font-label-md">
                  {company?.company_type?.toUpperCase() || "None"}
                </div>
              </Stack>
              {company?.email && (
                <Stack
                  h
                  className="w-full max-w-lg h-full gap-2 items-center justify-between py-3"
                >
                  <div className="font-label-md">{t("Company Email")}</div>
                  <div className=" font-label-md">
                    {company?.email || "None"}
                  </div>
                </Stack>
              )}
            </Stack>
          </div>
          <Stack className="w-full h-fit gap-4 px-10 py-6">
            <Stack h className="items-center gap-2">
              <PiKanbanDuotone className="text-primary" size={32} />
              <h3 className="w-full font-headline-sm text-foreground">
                {company?.is_active
                  ? t("Level Up Your Company!")
                  : t("Complete Tasks to Activate Your Company")}
              </h3>
            </Stack>
            <div className="w-full grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
              {!company?.is_active &&
                taskStatus?.every((task) => task.status === "completed") && (
                  <TaskCard
                    title={`Activate ${
                      company?.display_name ||
                      company?.COMPANY_NAME?.["ja-jp"] ||
                      "Your Company"
                    }`}
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
                        title={"Create AoI"}
                        status={task.status || "todo"}
                        onPress={onOpenAoiBuilder}
                      />
                    )}
                    {task.task_id === "enter-company-profile" && (
                      <TaskCard
                        key={task.id}
                        title={"Enter Company Profile"}
                        status={task.status || "todo"}
                        onPress={onOpenCompanyProfileEdit}
                      />
                    )}
                    {task.task_id === "enter-executive-token-info" && (
                      <TaskCard
                        key={task.id}
                        title={"Enter Executive Member Token Info"}
                        status={task.status || "todo"}
                        onPress={onOpenExecutiveTokenInfoEdit}
                      />
                    )}
                  </>
                ))}
            </div>
          </Stack>
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
      {status === "completed" && "Completed"}
      {status === "todo" && "ToDo"}
      {status === "inProgress" && "In Progress"}
    </Chip>
  );
};
