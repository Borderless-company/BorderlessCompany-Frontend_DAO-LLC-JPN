import { CompanyHomePage } from "@/components/company/CompanyHomePage";
import { SHCLayout } from "@/components/layout/SHCLayout";
import { NavBar } from "@/components/NavBar";
import { Sidebar } from "@/components/Sidebar";
import { NextPage } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export const getServerSideProps = async ({ locale }: { locale: string }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
};

const CompanyHome: NextPage = () => {
  return (
    <SHCLayout Sidebar={<Sidebar />} Header={<NavBar title="Home" />}>
      <CompanyHomePage />
    </SHCLayout>
  );
};

export default CompanyHome;
