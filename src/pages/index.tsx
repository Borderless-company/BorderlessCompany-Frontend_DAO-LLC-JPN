import router from "next/router";
import { Noto_Sans_JP } from "next/font/google";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { useEffect } from "react";
import { CLayout } from "@/components/layout/CLayout";
import { Spinner } from "@heroui/react";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
});

export const getServerSideProps = async ({ locale }: { locale: string }) => {
  const translations = await serverSideTranslations(locale, ["common"]);
  return {
    props: {
      ...translations,
    },
  };
};

export default function Home() {
  const { t } = useTranslation("common");

  useEffect(() => {
    router.push("/login");
  }, []);

  return (
    <CLayout>
      <Spinner color="primary" size="lg" />
    </CLayout>
  );
}
