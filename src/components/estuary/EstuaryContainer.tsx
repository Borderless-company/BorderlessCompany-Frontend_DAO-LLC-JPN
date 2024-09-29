import { estuaryPageAtom } from "@/atoms";
import AgreementPage from "@/components/estuary/AgreementPage";
import KYCPage from "@/components/estuary/KYCPage";
import KYCSucceededPage from "@/components/estuary/KYCSucceededPage";
import KYCAgreementPage from "@/components/estuary/KYCAgreementPage";
import ReceivedPage from "@/components/estuary/ReceivedPage";
import { TokenSelection } from "@/components/estuary/TokenSelection";
import { useAtom } from "jotai";
import { FC } from "react";
import { client } from "@/utils/client";
import { ConnectButton } from "@/components/estuary/ConnectButton";

export const EstuaryContainer: FC = () => {
  const [estuaryPage] = useAtom(estuaryPageAtom);

  return (
    <div className="w-full h-svh grid place-items-center ">
      <div className="relative w-full max-w-[35rem] h-[720px] bg-stone-50 rounded-3xl shadow-xl flex flex-col border-1 border-slate-200 overflow-hidden">
        <div className="absolute top-3 right-3">
          <ConnectButton />
          {/* <TWConnectButton client={client} /> */}
        </div>
        {estuaryPage === 0 ? (
          <TokenSelection />
        ) : estuaryPage === 1 ? (
          <KYCAgreementPage />
        ) : estuaryPage === 2 ? (
          <KYCPage />
        ) : estuaryPage === 3 ? (
          <KYCSucceededPage />
        ) : estuaryPage === 4 ? (
          <AgreementPage />
        ) : estuaryPage === 5 ? (
          <ReceivedPage />
        ) : null}
      </div>
    </div>
  );
};
