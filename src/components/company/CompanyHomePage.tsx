import { FC, useMemo } from "react";
import { useTranslation } from "next-i18next";
import { Chip, ChipProps, cn, useDisclosure } from "@nextui-org/react";
import Image from "next/image";
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

export type CompanyHomePageProps = {};

export const CompanyHomePage: FC<CompanyHomePageProps> = () => {
  const { t } = useTranslation("common");
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <>
      <Stack className="w-full h-full overflow-scroll">
        <div className={cn("flex flex-col gap-6 w-full h-fit p-10 pb-0 pt-6 ")}>
          <Image
            src="/company_icon_fallback.png"
            alt="Company Logo"
            width={80}
            height={80}
            className="rounded-lg shadow-md"
          />
          <Stack className="w-full h-full gap-2">
            <div className="w-full font-headline-lg">{"New Company"}</div>
            <Chip
              variant="bordered"
              size="lg"
              startContent={
                <PiPowerBold color="var(--bls-neutral)" size={20} />
              }
            >
              Inactive
            </Chip>
          </Stack>
          <Stack className="w-full h-fit gap-0 pb-6 border-b-1 border-b-divider">
            <Stack
              h
              className="w-full max-w-lg h-full gap-2 items-center justify-between py-3"
            >
              <div className="font-label-md">{"Founder"}</div>
              <div className=" font-label-md">{"0x1234567890"}</div>
            </Stack>
            <Stack
              h
              className="w-full max-w-lg h-full gap-2 items-center justify-between py-3"
            >
              <div className="font-label-md">{"Founder"}</div>
              <div className=" font-label-md">{"0x1234567890"}</div>
            </Stack>
            <Stack
              h
              className="w-full max-w-lg h-full gap-2 items-center justify-between py-3"
            >
              <div className="font-label-md">{"Founder"}</div>
              <div className=" font-label-md">{"0x1234567890"}</div>
            </Stack>
          </Stack>
        </div>
        <Stack className="w-full h-fit gap-4 px-10 py-6">
          <Stack h className="items-center gap-2">
            <PiKanbanDuotone className="text-primary" size={32} />
            <h3 className="w-full font-headline-sm text-foreground">
              {"Complete Tasks to Activate Your Company"}
            </h3>
          </Stack>
          <div className="w-full grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
            <TaskCard
              title="Enter Company Profile"
              status="todo"
              onPress={onOpen}
            />
            <TaskCard title="Create AoI" status="todo" />
            <TaskCard title="Enter Executive Member Token Info" status="todo" />
          </div>
        </Stack>
      </Stack>
      <AoIBuilder isOpen={isOpen} onOpenChange={onOpenChange} />
    </>
  );
};

export type TaskCardProps = {
  title: string;
  status: "completed" | "todo" | "in-progress";
} & RACButtonProps;

export const TaskCard: FC<TaskCardProps> = ({ title, status, ...props }) => {
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
      {status === "in-progress" && (
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
};

export type TaskStatusChipProps = {
  status: "completed" | "todo" | "in-progress";
} & ChipProps;

export const TaskStatusChip: FC<TaskStatusChipProps> = ({
  status,
  ...props
}) => {
  const color = useMemo(() => {
    if (status === "completed") return "default";
    if (status === "todo") return "primary";
    if (status === "in-progress") return "secondary";
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
      {status === "in-progress" && "In Progress"}
    </Chip>
  );
};
