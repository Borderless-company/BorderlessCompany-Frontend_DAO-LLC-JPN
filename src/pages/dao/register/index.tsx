import { CreateDAOPage } from "@/components/dao/register/CraeteDAOPage";
import SimpleLayout from "@/components/layout/SimpleLayout";
import { CreateBorderlessCompany } from "@/components/web3/RegisterBorderlessCompany/CreateBorderlessCompany";
import { NextPage } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export const getServerSideProps = async ({ locale }: { locale: string }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
};

const RegisterDAO: NextPage = () => {
  return <CreateDAOPage />;
};

export default RegisterDAO;
