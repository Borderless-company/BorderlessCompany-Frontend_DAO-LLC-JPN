import React from "react";
import { useLockedBody } from "../hooks/useBodyLock";
import { DashboardNavbar } from "../navbar/DashboardNavbar";
import { SidebarWrapper } from "../sidebar/SidebarWrapper";
import { SidebarContext } from "./DashboardLayoutContext";

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
      <section className="flex">
        <SidebarWrapper />
        <DashboardNavbar>{children}</DashboardNavbar>
      </section>
    </SidebarContext.Provider>
  );
};
