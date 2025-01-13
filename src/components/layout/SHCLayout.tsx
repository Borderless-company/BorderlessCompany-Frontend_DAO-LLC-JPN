import { FC } from "react";

type SHCLayoutProps = {
  Sidebar?: React.ReactNode;
  Header?: React.ReactNode;
  children?: React.ReactNode;
};

export const SHCLayout: FC<SHCLayoutProps> = ({
  Sidebar,
  Header,
  children,
}) => {
  return (
    <main className="w-full h-screen grid grid-cols-[240px_1fr]">
      <div className="w-full h-full bg-primary-backing">{Sidebar}</div>
      <div className="w-full h-full bg-secondary-backing grid grid-rows-[56px_1fr]">
        <nav className="w-full h-full bg-neutral-backing">{Header}</nav>
        {children}
      </div>
    </main>
  );
};
