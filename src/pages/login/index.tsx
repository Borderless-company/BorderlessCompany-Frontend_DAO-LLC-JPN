import { Border } from "@/components/decorative/Border";
import { CLayout } from "@/components/layout/CLayout";
import { AgreementPage } from "@/components/login/AgreementPage";
import { LoginPage } from "@/components/login/LoginPage";
import { KYCPage } from "@/components/login/KYCPage";
import { UserInfoPage } from "@/components/login/UserInfoPage";
import { SignupCompletePage } from "@/components/login/SignupCompletePage";
import { AccountChip } from "@/components/AccountChip";
import { useCompanybyFounderId } from "@/hooks/useCompany";
import { useMe } from "@/hooks/useMe";
import { useUser } from "@/hooks/useUser";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useActiveAccount } from "thirdweb/react";

export const getServerSideProps = async ({ locale }: { locale: string }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["login", "common", "estuary"])),
    },
  };
};

export default function Login() {
  const [page, setPage] = useState(0);
  const { me } = useMe();
  const smartAccount = useActiveAccount();
  const router = useRouter();
  const {
    company,
    isLoading: isLoadingCompany,
    isError,
  } = useCompanybyFounderId(smartAccount?.address || "");
  const { user } = useUser(smartAccount?.address || "");

  // 初期化
  useEffect(() => {
    console.log("me: ", me);
    console.log("company: ", company);
    console.log("isLoadingCompany: ", isLoadingCompany);
    console.log("user: ", user);

    if (!me?.isLogin) {
      setPage(0);
    } else if (me?.isLogin) {
      if (!user) {
        // ユーザー未作成の場合は利用規約同意から開始
        setPage(1);
      } else if (user.status === "preSignUp") {
        // preSignUpの場合はKYCステータスに応じて分岐
        if (user.kyc_status === "done") {
          // KYC完了済みなら個人情報入力へ
          setPage(3);
        } else {
          // KYC未完了ならKYCへ
          setPage(2);
        }
      } else if (user.status === "signedUp") {
        // signedUpの場合は会社の状態をチェック
        if (company && !isLoadingCompany) {
          router.push(`/company/${company.id}`);
        } else if (isError && user) {
          console.log("isError: ", isError);
          router.push("/company/create");
        }
      }
    }
  }, [me, company, router, isLoadingCompany, user, isError]);

  return (
    <CLayout className="relative shadow-[inset_0px_0px_40px_-7px_#6EBFB8] px-4">
      {/* AccountChipを右上に配置 */}
      {smartAccount && (
        <div className="absolute top-6 right-6 z-30 w-40">
          <AccountChip size="sm" />
        </div>
      )}

      {page === 0 && (
        <LoginPage
          page={page}
          onPageChange={setPage}
          isLoadingCompany={isLoadingCompany}
        />
      )}
      {page === 1 && <AgreementPage page={page} onPageChange={setPage} />}
      {page === 2 && <KYCPage page={page} onPageChange={setPage} />}
      {page === 3 && <UserInfoPage page={page} onPageChange={setPage} />}
      {page === 4 && <SignupCompletePage page={page} onPageChange={setPage} />}

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
