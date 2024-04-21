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

export const SidebarWrapper = () => {
  const pathname = usePathname();
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
            <SidebarMenu title="一般">
              <SidebarItem
                title="ホーム"
                icon={<HomeIcon />}
                isActive={pathname === `/dao/${daoId}`}
                href={`/dao/${daoId}`}
              />
              <SidebarItem
                isActive={pathname === `/dao/${daoId}/members`}
                title="メンバー一覧"
                icon={<AccountsIcon />}
                href={`/dao/${daoId}/members`}
              />
            </SidebarMenu>
            <SidebarMenu title="トークン">
              <SidebarItem
                isActive={pathname === `/dao/${daoId}/membership-token`}
                title="メンバーシップトークン"
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
          </div>
          <div className={Sidebar.Footer()}>
            <Link href={`/dao`}>
              <div className="text-sm font-semibold">DAO一覧に戻る</div>
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
};
