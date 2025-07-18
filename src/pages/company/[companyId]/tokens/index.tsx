import { SHCLayout } from "@/components/layout/SHCLayout";
import { NavBar } from "@/components/NavBar";
import { Sidebar } from "@/components/Sidebar";
import { TokenListPage } from "@/components/tokens/TokenListPage";

import { NextPage } from "next";
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
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
};

const Tokens: NextPage<{ companyId: string }> = ({ companyId }) => {
  return (
    <SHCLayout
      Sidebar={<Sidebar companyId={companyId} />}
      Header={<NavBar title="Tokens" />}
    >
      {/* <TokensPage companyId={companyId} /> */}
      <TokenListPage companyId={companyId} />
    </SHCLayout>
  );
};

export default Tokens;
