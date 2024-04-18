import { Logo } from "@/components/Logo";
import Link from "next/link";
export const Footer = () => {
  return (
    <footer className="w-full items-center justify-center flex flex-col gap-2 py-8">
      <div>
        <Link className="flex items-center gap-1 text-current" href="/">
          <Logo />
        </Link>
      </div>
      <div className="text-xs font-bold">
        Copyright 2024 © OverlayAG All Rights Reserved.
      </div>
    </footer>
  );
};
