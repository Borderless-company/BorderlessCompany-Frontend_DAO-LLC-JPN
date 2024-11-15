import { GetServerSideProps, NextPage } from "next";
import { LoginPage } from "@/components/login/LoginPage";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Head from "next/head";

export const getServerSideProps = async ({ locale }: { locale: string }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
};

const Login: NextPage = () => {
  return (
    <>
      <Head>
        <title>Borderless | Login</title>
        <meta
          name="description"
          content="Borderless is the DAO LLC Launch Platform"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <LoginPage />
    </>
  );
};

export default Login;
