import { NextPage } from "next";
import { CreateCompanyPage } from "@/components/company/create/CreateCompanyPage";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export const getServerSideProps = async ({ locale }: { locale: string }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
};

const CreateDaoPage: NextPage = () => {
  return <CreateCompanyPage />;
};

export default CreateDaoPage;
