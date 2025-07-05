import { NextPage } from "next";
import { StatelessDaoCreationPage } from "@/components/company/create/StatelessDaoCreationPage";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export const getServerSideProps = async ({ locale }: { locale: string }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["company", "common"])),
    },
  };
};

const StatelessDaoPage: NextPage = () => {
  return <StatelessDaoCreationPage />;
};

export default StatelessDaoPage;
