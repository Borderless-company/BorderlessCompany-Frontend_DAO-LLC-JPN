import { useState } from "react";
import { NextPage } from "next";
import { TokenSelection } from "@/components/estuary/TokenSelection";
import { useAtom } from "jotai";
import { estuaryPageAtom } from "@/atoms";
import KYCPage from "@/components/estuary/KYCPage";
import KYCSucceededPage from "@/components/estuary/KYCSucceededPage";
import ReceivedPage from "@/components/estuary/ReceivedPage";
import AgreementPage from "@/components/estuary/AgreementPage";

type EstuaryProps = {
  logoSrc: string;
  orgName: string;
  // tokens: Token[];
};

const Estuary: NextPage<EstuaryProps> = () => {
  // const { estId } = useParams<{ estId: string }>();
  const [estuaryPage] = useAtom(estuaryPageAtom);

  return (
    <div className="w-full h-svh grid place-items-center">
      <div className="w-full max-w-[35rem] h-[720px] bg-stone-50 rounded-3xl shadow-xl flex flex-col border-1 border-slate-200">
        {estuaryPage === 0 ? (
          <TokenSelection />
        ) : estuaryPage === 1 ? (
          <KYCPage />
        ) : estuaryPage === 2 ? (
          <KYCSucceededPage />
        ) : estuaryPage === 3 ? (
          <AgreementPage />
        ) : estuaryPage === 4 ? (
          <ReceivedPage />
        ) : null}
      </div>
    </div>
  );
};

export default Estuary;
