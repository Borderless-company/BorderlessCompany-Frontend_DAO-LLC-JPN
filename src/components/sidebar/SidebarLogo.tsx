"use client";
import React from "react";
// import { AcmeLogo } from "../icons/acmelogo";
import { Logo } from "@/components/Logo";

interface Company {
  name: string;
  logo: React.ReactNode;
}

export const SidebarLogo = () => {
  return (
    <div className="">
      <Logo />
    </div>
  );
};
