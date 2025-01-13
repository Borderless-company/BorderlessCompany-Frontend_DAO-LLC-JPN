import { NextPage } from "next";
import { CreateCompanyPage } from "@/components/dao/register/CreateCompanyPage";
import { serverSideTranslations } from "next-i18next/dist/types/serverSideTranslations";

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
