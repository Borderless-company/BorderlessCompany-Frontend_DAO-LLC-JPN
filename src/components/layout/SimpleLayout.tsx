import { Footer } from "../Footer";
import { Header } from "../Header";

export default function SimpleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Header />
      <div className="flex w-full h-auto items-center justify-center">
        <div className="flex-row gap-4 justify-between max-w-[1024px] px-6 relative w-full">
          <div className="my-12">{children}</div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
