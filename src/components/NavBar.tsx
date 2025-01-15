import { FC } from "react";

export type NavBarProps = {
  title: string;
};

export const NavBar: FC<NavBarProps> = ({ title }) => {
  return (
    <nav className="w-full h-14 bg-background p-6 flex items-center justify-start">
      <p className="text-foreground font-label-lg">{title}</p>
    </nav>
  );
};
