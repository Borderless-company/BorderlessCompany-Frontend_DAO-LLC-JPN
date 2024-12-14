import SimpleLayout from "@/components/layout/SimpleLayout";
import WalletLogin from "@/components/wallet/WalletLogin";
import { CreateBorderlessCompany } from "@/components/web3/RegisterBorderlessCompany/CreateBorderlessCompany";
import ListCompanies from "@/components/web3/RegisterBorderlessCompany/ListCompanies";
import { CurrentAddressIsWhitelisted } from "@/components/web3/Whitelist/CurrentAddressIsWhitelisted";
import { FormIsWhitelisted } from "@/components/web3/Whitelist/FormIsWhitelisted";
import { IsWhitelisted } from "@/components/web3/Whitelist/IsWhitelisted";
import { Button } from "@nextui-org/react";
import router from "next/router";
import Image from "next/image";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import clsx from "clsx";
import { Noto_Sans_JP } from "next/font/google";
import { withAuthGSSP } from "@/utils/isLogin";
import { useEffect } from "react";
import { useAtom } from "jotai";
import { isLoginAtom } from "@/atoms";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
});

export default function Home(prop: any) {
  const [isLogin, setIsLogin] = useAtom(isLoginAtom);

  useEffect(() => {
    setIsLogin(true);
  }, []);

  return (
    <div className={clsx(notoSansJP.className, "font-sans")}>
      <Header />
      <div
        className="flex w-full items-center justify-center"
        style={{ height: "calc(100dvh - 4rem - 133px)" }}
      >
        <div className="flex-row gap-4 justify-between max-w-[1024px] px-6 relative w-full">
          <div className="my-12">
            <section className="bg-white dark:bg-gray-900">
              <div className="grid max-w-screen-xl px-4 py-8 mx-auto lg:gap-0 xl:gap-0 lg:py-16 md:grid-cols-12">
                <div className="mx-auto place-self-center md:col-span-8">
                  <h1 className="max-w-2xl mb-4">
                    <Image
                      src="/borderless_logo_withDomain.png"
                      alt="Borderless.company"
                      width={800}
                      height={300}
                    />
                  </h1>
                  <p className="max-w-2xl mb-6 font-light text-gray-500 lg:mb-8 md:text-lg lg:text-2xl">
                    DAOで始める、境界線のない会社へ
                  </p>
                  <div className="flex gap-4">
                    <button
                      onClick={() => {
                        router.push("/dao/register");
                      }}
                      className="bg-sky-500 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded animate-pulse"
                    >
                      DAOを作成する
                    </button>

                    <button
                      onClick={() => {
                        router.push("/dao/");
                      }}
                      className="border-2 bg-white hover:bg-sky-200 text-sky-700 font-bold py-2 px-4 rounded"
                    >
                      DAO一覧を見る
                    </button>
                  </div>
                </div>
                <div className="hidden justify-center md:col-span-4 md:flex lg:mt-0 my-10 max-w-sm mx-auto">
                  <div className="loader">
                    <div className="box-1"></div>
                    <div className="box-2"></div>
                    <div className="box-3"></div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}


export const getServerSideProps = withAuthGSSP()
