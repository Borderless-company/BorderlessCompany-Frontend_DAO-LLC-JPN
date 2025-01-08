import SimpleLayout from "@/components/layout/SimpleLayout";
import { LoginPage } from "@/components/login/LoginPage";
import { CreateBorderlessCompany } from "@/components/web3/RegisterBorderlessCompany/CreateBorderlessCompany";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export const getServerSideProps = async ({ locale }: { locale: string }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
};

export default function Login() {
  return <LoginPage />;
}
