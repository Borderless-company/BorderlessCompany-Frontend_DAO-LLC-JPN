import { estuaryPageAtom } from "@/atoms";
import AgreementPage from "@/components/estuary/AgreementPage";
import KYCPage from "@/components/estuary/KYCPage";
import KYCSucceededPage from "@/components/estuary/KYCSucceededPage";
import KYCAgreementPage from "@/components/estuary/KYCAgreementPage";
import ReceivedPage from "@/components/estuary/ReceivedPage";
import { TokenSelection } from "@/components/estuary/TokenSelection";
import { useAtom } from "jotai";
import { FC, useEffect } from "react";
import { ConnectButton } from "@/components/estuary/ConnectButton";
import { useActiveAccount } from "thirdweb/react";
import { Button } from "@nextui-org/react";
import { useToken } from "@/hooks/useToken";
import { createPaymentLink } from "@/utils/stripe";

export const EstuaryContainer: FC = () => {
  const [estuaryPage, setEstuaryPage] = useAtom(estuaryPageAtom);
  const account = useActiveAccount();
  const { createToken, token } = useToken(
    "894e3030-eab9-4842-a6b0-4ae6c328b36c"
  );
  useEffect(() => {
    if (!account) {
      setEstuaryPage(0);
    }
  }, [account]);

  return (
    <div className="w-full h-svh flex flex-col items-center justify-center gap-4">
      <div className="relative w-full max-w-[35rem] h-[720px] bg-stone-50 rounded-3xl shadow-xl flex flex-col border-1 border-slate-200 overflow-hidden">
        <div className="absolute top-3 right-3">
          <ConnectButton />
          {/* <TWConnectButton client={client} /> */}
        </div>
        {estuaryPage === 0 ? (
          <TokenSelection />
        ) : estuaryPage === 1 ? (
          <KYCPage />
        ) : estuaryPage === 2 ? (
          <KYCAgreementPage />
        ) : estuaryPage === 3 ? (
          <KYCSucceededPage />
        ) : estuaryPage === 4 ? (
          <AgreementPage />
        ) : estuaryPage === 5 ? (
          <ReceivedPage />
        ) : null}
      </div>
      <Button
        onPress={() => {
          createToken({
            name: "KABAトークン",
            symbol: "KABA",
            isExecutable: false,
            minPrice: 100,
            maxPrice: 1000,
            fixedPrice: 30000,
          });
        }}
      >
        トークンを登録
      </Button>
      <Button
        onPress={async () => {
          console.log("token: ", token);
          if (!token?.product_id) return;
          const url = await createPaymentLink(token?.product_id, 30000);
          console.log("url: ", url);
          window.open(url, "_blank");
        }}
      >
        支払いをする
      </Button>
    </div>
  );
};
