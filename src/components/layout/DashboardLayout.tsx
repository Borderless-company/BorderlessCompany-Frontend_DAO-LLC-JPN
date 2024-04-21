import React from "react";
import { useLockedBody } from "../hooks/useBodyLock";
import { DashboardNavbar } from "../navbar/DashboardNavbar";
import { SidebarWrapper } from "../sidebar/SidebarWrapper";
import { SidebarContext } from "./DashboardLayoutContext";

import clsx from "clsx";
import { Noto_Sans_JP } from "next/font/google";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
});

interface Props {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: Props) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [_, setLocked] = useLockedBody(false);
  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
    setLocked(!sidebarOpen);
  };

  return (
    <SidebarContext.Provider
      value={{
        collapsed: sidebarOpen,
        setCollapsed: handleToggleSidebar,
      }}
    >
      <section className={clsx(notoSansJP.className, "font-sans flex")}>
        <SidebarWrapper />
        <DashboardNavbar>{children}</DashboardNavbar>
      </section>
    </SidebarContext.Provider>
  );
};
