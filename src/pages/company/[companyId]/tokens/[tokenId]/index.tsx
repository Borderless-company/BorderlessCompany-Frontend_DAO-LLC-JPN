import { SHCLayout } from "@/components/layout/SHCLayout";
import { NavBar } from "@/components/NavBar";
import { Sidebar } from "@/components/Sidebar";
import { TokenDetailPage } from "@/components/tokens/TokenDetailPage";
import { NextPage } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export const getServerSideProps = async ({
  locale,
  params,
}: {
  locale: string;
  params: { companyId: string; tokenId: string };
}) => {
  return {
    props: {
      companyId: params.companyId,
      tokenId: params.tokenId,
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
};

const Tokens: NextPage<{ companyId: string; tokenId: string }> = ({
  companyId,
  tokenId,
}) => {
  return (
    <SHCLayout
      Sidebar={<Sidebar companyId={companyId} />}
      Header={<NavBar title="トークン" />}
    >
      <TokenDetailPage companyId={companyId} tokenId={tokenId} />
    </SHCLayout>
  );
};

export default Tokens;
