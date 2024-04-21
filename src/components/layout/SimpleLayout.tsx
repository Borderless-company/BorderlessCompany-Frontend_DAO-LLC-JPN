import { Footer } from "../Footer";
import { Header } from "../Header";
import clsx from "clsx";
import { Noto_Sans_JP } from "next/font/google";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
});

export default function SimpleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={clsx(notoSansJP.className, "font-sans")}>
      <Header />
      <div className="flex w-full h-auto items-center justify-center">
        <div className="flex-row gap-4 justify-between max-w-[1024px] px-6 relative w-full">
          <div className="my-6">{children}</div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
