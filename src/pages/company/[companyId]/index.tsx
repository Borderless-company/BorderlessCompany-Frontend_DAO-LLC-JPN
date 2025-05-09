import { CompanyHomePage } from "@/components/company/CompanyHomePage";
import { SHCLayout } from "@/components/layout/SHCLayout";
import { NavBar } from "@/components/NavBar";
import { Sidebar } from "@/components/Sidebar";
import { NextPage } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export const getServerSideProps = async ({
  locale,
  params,
}: {
  locale: string;
  params: { companyId: string };
}) => {
  return {
    props: {
      companyId: params.companyId,
      ...(await serverSideTranslations(locale, ["common", "company", "aoi"])),
    },
  };
};

const CompanyHome: NextPage<{ companyId: string }> = ({ companyId }) => {
  const { t } = useTranslation("common");
  return (
    <SHCLayout
      Sidebar={<Sidebar companyId={companyId} />}
      Header={<NavBar title={t("Home")} />}
    >
      <CompanyHomePage companyId={companyId} />
    </SHCLayout>
  );
};

export default CompanyHome;
