import { SHCLayout } from "@/components/layout/SHCLayout";
import { Sidebar } from "@/components/sidebar/Sidebar";
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
  return <SHCLayout Sidebar={<Sidebar />} />;
};

export default CompanyHome;
