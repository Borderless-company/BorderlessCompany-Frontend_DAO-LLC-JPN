import { ComponentPropsWithoutRef, FC } from "react";
import { IBM_Plex_Sans_JP } from "next/font/google";
import clsx from "clsx";

export const ibmPlexSansJP = IBM_Plex_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

type CLayoutProps = {
  children?: React.ReactNode;
} & ComponentPropsWithoutRef<"main">;

export const CLayout: FC<CLayoutProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <main
      className={clsx(
        ibmPlexSansJP.className,
        "flex w-full h-screen items-center justify-center bg-background text-foreground",
        className
      )}
      {...props}
    >
      {children}
    </main>
  );
};
