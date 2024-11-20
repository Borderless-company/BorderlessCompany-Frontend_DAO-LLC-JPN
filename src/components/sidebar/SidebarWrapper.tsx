import React from "react";
import { Sidebar } from "./sidebar.styles";
import { Avatar, Tooltip } from "@nextui-org/react";
import { SidebarLogo } from "./SidebarLogo";
import { HomeIcon } from "../icons/sidebar/home-icon";
import { AccountsIcon } from "../icons/sidebar/accounts-icon";
import { SettingsIcon } from "../icons/sidebar/settings-icon";
import { SidebarItem } from "./SidebarItem";
import { SidebarMenu } from "./SidebarMenu";
import { useSidebarContext } from "@/components/layout/DashboardLayoutContext";
import { usePathname } from "next/navigation";
import { useRouter } from "next/router";
import Link from "next/link";
import { useTranslation } from "next-i18next";
import { AccountPlate } from "../wallet/AccountPlate";
import clsx from "clsx";

export const SidebarWrapper = () => {
  const pathname = usePathname();
  const { t } = useTranslation("common");
  const { collapsed, setCollapsed } = useSidebarContext();
  const router = useRouter();
  const { daoId } = router.query;

  return (
    <aside className="h-screen z-[20] sticky top-0">
      {collapsed ? (
        <div className={Sidebar.Overlay()} onClick={setCollapsed} />
      ) : null}
      <div
        className={Sidebar({
          collapsed: collapsed,
        })}
      >
        <div className={Sidebar.Header()}>
          <Link href={`/dao/${daoId}`}>
            <SidebarLogo />
          </Link>
        </div>
        <div className="flex flex-col justify-between h-full">
          <div className={Sidebar.Body()}>
            <SidebarMenu title={t("General")}>
              <SidebarItem
                title={t("Home")}
                icon={<HomeIcon />}
                isActive={pathname === `/dao/${daoId}`}
                href={`/dao/${daoId}`}
              />
              <SidebarItem
                isActive={pathname === `/dao/${daoId}/members`}
                title={t("Members")}
                icon={<AccountsIcon />}
                href={`/dao/${daoId}/members`}
              />
            </SidebarMenu>
            <SidebarMenu title={t("Token")}>
              <SidebarItem
                isActive={pathname === `/dao/${daoId}/membership-token`}
                title={t("Membership Tokens")}
                icon={<AccountsIcon />}
                href={`/dao/${daoId}/membership-token`}
              />
              {/* <SidebarItem
                isActive={pathname === `/dao/${daoId}/utility-token`}
                title="ユーティリティトークン"
                icon={<AccountsIcon />}
                href={`/dao/${daoId}/utility-token`}
              /> */}
            </SidebarMenu>
            <SidebarMenu title={t("Sale")}>
              <SidebarItem
                title={t("Estuary")}
                icon={<HomeIcon />}
                isActive={pathname === `/dao/${daoId}/estuary`}
                href={`/dao/${daoId}/estuary`}
              />
            </SidebarMenu>
          </div>
          <div className={clsx(Sidebar.Footer(), "w-full md:p-0")}>
            <AccountPlate fullWidth />
          </div>
        </div>
      </div>
    </aside>
  );
};
