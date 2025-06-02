import React, { FC, useEffect, useState } from "react";
import { cn } from "@heroui/react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/router";
import {
  PiCoins,
  PiGavel,
  PiGear,
  PiLock,
  PiSquaresFour,
  PiStorefront,
  PiUsersThree,
} from "react-icons/pi";
import { IconContext } from "react-icons";
import Link from "next/link";
import { useTranslation } from "next-i18next";
import { Button } from "react-aria-components";
import Image from "next/image";
import { AccountChip } from "./AccountChip";
import { useCompany } from "@/hooks/useCompany";

export type SidebarProps = {
  companyId?: string;
};

export const Sidebar: FC<SidebarProps> = ({ companyId }) => {
  const pathname = usePathname();
  const { t } = useTranslation("common");
  const router = useRouter();
  const { company } = useCompany(companyId as string);

  return (
    <aside className="bg-background transition-transform h-screen w-60 shrink-0 z-[202] overflow-y-auto border-r border-divider flex flex-col translate-x-0 ">
      <SidebarHeader
        text={company?.display_name || "Your Company"}
        icon={company?.icon || "/company_icon_fallback.png"}
      />
      <div className="flex-1 ">
        <SidebarItem
          title={t("Home")}
          icon={<PiSquaresFour size={24} />}
          isActive={pathname === `/company/${companyId}`}
          href={`/company/${companyId}`}
        />
        <SidebarItem
          title={t("Members")}
          icon={<PiUsersThree size={24} />}
          isActive={pathname.includes(`/company/${companyId}/members`)}
          href={`/company/${companyId}/members`}
          isLocked={!company?.is_active}
        />
        <SidebarItem
          title={t("Tokens")}
          icon={<PiCoins size={24} />}
          isActive={pathname.includes(`/company/${companyId}/tokens`)}
          href={`/company/${companyId}/tokens`}
          isLocked={!company?.is_active}
        />
        {/* <SidebarItem
          title="Estuary"
          icon={<PiStorefront size={24} />}
          isActive={pathname === `/company/${companyId}/estuary`}
          href={`/company/${companyId}/estuary`}
          isLocked={!company?.is_active}
        /> */}
        <SidebarItem
          title={t("Votings")}
          icon={<PiGavel size={24} />}
          isActive={pathname === `/company/${companyId}/votings`}
          href={`/company/${companyId}/votings`}
          isLocked={true}
        />
        {/* <SidebarItem
          title="Settings"
          icon={<PiGear size={24} />}
          isActive={pathname === `/company/${companyId}/settings`}
          href={`/company/${companyId}/settings`}
        /> */}
      </div>
      <div className="w-full h-auto p-2">
        <AccountChip />
      </div>
    </aside>
  );
};

export type SidebarHeaderProps = {
  text?: string;
  icon?: string;
};

export const SidebarHeader: FC<SidebarHeaderProps> = ({ text, icon }) => {
  return (
    <div className="w-full h-20 p-4 flex-none ">
      <Button className="appearance-none w-full h-12 flex items-center gap-2 rounded-xl data-[hovered]:cursor-pointer">
        {({ isHovered }) => (
          <>
            <Image
              src={icon || "/company_icon_fallback.png"}
              alt="Company Logo"
              width={32}
              height={32}
              className={cn(
                "transition-transform duration-150 rounded-md border-1 border-divider",
                isHovered && " scale-105"
              )}
            />
            <p className="w-full text-foreground text-start text-nowrap overflow-hidden overflow-ellipsis whitespace-nowrap font-label-lg">
              {text}
            </p>
          </>
        )}
      </Button>
    </div>
  );
};

export type SidebarItemProps = {
  title: string;
  icon: React.ReactNode;
  isActive?: boolean;
  isLocked?: boolean;
  href: string;
};

export const SidebarItem: FC<SidebarItemProps> = ({
  title,
  icon,
  isActive = true,
  isLocked,
  href,
}) => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 初期レンダリング時は何も表示しない
  if (!mounted) return null;

  const iconColor = isActive ? "#006361" : "#171717";

  return (
    <IconContext.Provider value={{ size: "24", color: iconColor }}>
      <Button
        className={cn(
          "appearance-none transition-colors duration-150 w-full h-12 p-4 flex items-center justify-between gap-2 data-[hovered]:bg-neutral-backing data-[hovered]:cursor-pointer data-[disabled]:opacity-60",
          isActive && "bg-[linear-gradient(90deg,#CFF4EE_93.5%,#006361_100%)]"
        )}
        isDisabled={isLocked}
        onPress={() => {
          router.push(href);
        }}
      >
        {({ isHovered }) => (
          <>
            <div className="flex items-center  gap-2">
              {icon}
              <p
                className={cn(
                  "w-full text-foreground text-start text-nowrap overflow-hidden overflow-ellipsis whitespace-nowrap font-label-lg",
                  isActive && "text-primary"
                )}
              >
                {title}
              </p>
            </div>
            {isLocked && <PiLock size={16} className="text-foreground" />}
          </>
        )}
      </Button>
    </IconContext.Provider>
  );
};
