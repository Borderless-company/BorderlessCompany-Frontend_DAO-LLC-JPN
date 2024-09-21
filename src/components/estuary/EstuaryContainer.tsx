import { estuaryPageAtom } from "@/atoms";
import AgreementPage from "@/components/estuary/AgreementPage";
import KYCPage from "@/components/estuary/KYCPage";
import KYCSucceededPage from "@/components/estuary/KYCSucceededPage";
import ReceivedPage from "@/components/estuary/ReceivedPage";
import { TokenSelection } from "@/components/estuary/TokenSelection";
import { useAtom } from "jotai";
import { FC } from "react";
import { client } from "@/utils/client";
import { ConnectButton } from "@/components/estuary/ConnectButton";

export const EstuaryContainer: FC = () => {
  const [estuaryPage] = useAtom(estuaryPageAtom);
  return (
    <div className="w-full h-svh grid place-items-center">
      <div className="relative w-full max-w-[35rem] h-[720px] bg-stone-50 rounded-3xl shadow-xl flex flex-col border-1 border-slate-200">
        <div className="absolute top-3 right-3">
          <ConnectButton />
          {/* <TWConnectButton client={client} /> */}
        </div>
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
