import { NextPage } from "next";
import { EstuaryContainer } from "../../../components/estuary/EstuaryContainer";
import { ThirdwebProvider } from "thirdweb/react";
import { EstuaryProvider } from "@/components/estuary/EstuaryContext";
import { useParams } from "next/navigation";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

type EstuaryProps = {
  logoSrc: string;
  orgName: string;
  // tokens: Token[];
};

export const getServerSideProps = async ({ locale }: { locale: string }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["estuary"])),
    },
  };
};

const Estuary: NextPage<EstuaryProps> = () => {
  return (
    <EstuaryProvider>
      <EstuaryContainer />
    </EstuaryProvider>
  );
};

export default Estuary;
