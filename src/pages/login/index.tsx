import { Border } from "@/components/decorative/Border";
import { CLayout } from "@/components/layout/CLayout";
import { AgreementPage } from "@/components/login/AgreementPage";
import { LoginPage } from "@/components/login/LoginPage";
import { useCompanybyFounderId } from "@/hooks/useCompany";
import { useMe } from "@/hooks/useMe";
import { useSignOut } from "@/hooks/useSignOut";
import { useUser } from "@/hooks/useUser";
import { Button } from "@heroui/react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

export const getServerSideProps = async ({ locale }: { locale: string }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
};

export default function Login() {
  const [page, setPage] = useState(0);
  const { me } = useMe();
  const { address } = useAccount();
  const router = useRouter();
  const {
    company,
    isLoading: isLoadingCompany,
    isError,
  } = useCompanybyFounderId(address || "");
  const { user } = useUser(address || "");

  // 初期化
  useEffect(() => {
    if (!me?.isLogin) {
      setPage(0);
    } else if (me?.isLogin) {
      if (company && !isLoadingCompany) {
        router.push(`/company/${company.id}`);
      } else if (isError && user) {
        console.log("isError: ", isError);
        router.push("/company/create");
      } else {
        return;
      }
    }
  }, [me, company, router, isLoadingCompany]);

  return (
    <CLayout className="relative shadow-[inset_0px_0px_40px_-7px_#6EBFB8] px-4">
      {page === 0 && (
        <LoginPage
          page={page}
          onPageChange={setPage}
          isLoadingCompany={isLoadingCompany}
        />
      )}
      {page === 1 && <AgreementPage page={page} onPageChange={setPage} />}
      <Image
        src="/borderless_logo.png"
        alt="Borderlss Logo"
        width={160}
        height={24}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 object-contain"
      />
      <div className="absolute top-0 left-0 w-[320px] h-[640px] opacity-20">
        <Border />
      </div>
      <div className="absolute bottom-0 right-0 w-[320px] h-[640px] rotate-180 opacity-20 ">
        <Border />
      </div>
    </CLayout>
  );
}
