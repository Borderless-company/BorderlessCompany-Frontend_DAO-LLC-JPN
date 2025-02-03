import { CompanyHomePage } from "@/components/company/CompanyHomePage";
import { SHCLayout } from "@/components/layout/SHCLayout";
import { MembersPage } from "@/components/members/MembersPage";
import { NavBar } from "@/components/NavBar";
import { Sidebar } from "@/components/Sidebar";
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

const Members: NextPage<{ companyId: string }> = ({ companyId }) => {
  return (
    <SHCLayout
      Sidebar={<Sidebar companyId={companyId} />}
      Header={<NavBar title="Members" />}
    >
      <MembersPage companyId={companyId} />
    </SHCLayout>
  );
};

export default Members;
