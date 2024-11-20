import { Navbar, NavbarContent } from "@nextui-org/react";
import React from "react";
import { HamburgerButton } from "./HamburgerButton";
import WalletLogin from "../wallet/WalletLogin";

interface Props {
  children: React.ReactNode;
}

export const DashboardNavbar = ({ children }: Props) => {
  return (
    <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
      <Navbar
        isBordered
        className="w-full"
        classNames={{
          wrapper: "w-full max-w-full",
        }}
      >
        <NavbarContent className="md:hidden">
          <HamburgerButton />
        </NavbarContent>
        <NavbarContent className="w-full max-md:hidden"></NavbarContent>
      </Navbar>
      {children}
    </div>
  );
};
