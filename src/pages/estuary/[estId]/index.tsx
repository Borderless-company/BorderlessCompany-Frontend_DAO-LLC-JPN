import { NextPage } from "next";
import { EstuaryContainer } from "../../../components/estuary/EstuaryContainer";
import { EstuaryProvider } from "@/components/estuary/EstuaryContext";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import ThirdwebProviderWrapper from "@/components/provider/ThirdwebProviderWrapper";

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
    <ThirdwebProviderWrapper>
      <EstuaryProvider>
        <EstuaryContainer />
      </EstuaryProvider>
    </ThirdwebProviderWrapper>
  );
};

export default Estuary;
