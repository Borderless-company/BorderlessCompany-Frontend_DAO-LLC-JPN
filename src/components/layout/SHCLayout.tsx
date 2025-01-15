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
    <main className="w-full h-screen grid grid-cols-[240px_1fr] overflow-hidden">
      <div className="w-full h-full">{Sidebar}</div>
      <div className="w-full h-full  grid grid-rows-[56px_1fr]">
        <nav className="w-full h-full">{Header}</nav>
        <div className="w-full h-[calc(100vh-56px)] overflow-scroll">
          {children}
        </div>
      </div>
    </main>
  );
};
