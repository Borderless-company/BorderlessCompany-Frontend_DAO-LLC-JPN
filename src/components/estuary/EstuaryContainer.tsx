import { estuaryPageAtom } from "@/atoms";
import AgreementPage from "@/components/estuary/AgreementPage";
import KYCPage from "@/components/estuary/KYCPage";
import KYCSucceededPage from "@/components/estuary/KYCSucceededPage";
import KYCAgreementPage from "@/components/estuary/KYCAgreementPage";
import ReceivedPage from "@/components/estuary/ReceivedPage";
import { TokenSelection } from "@/components/estuary/TokenSelection";
import { FC, useEffect } from "react";
import { ConnectButton } from "@/components/estuary/ConnectButton";
import { useActiveAccount } from "thirdweb/react";
import { Button } from "@nextui-org/react";
import { useToken } from "@/hooks/useToken";
import { createPaymentLink } from "@/utils/stripe";
import { useEstuaryContext } from "./EstuaryContext";
import { useEstuary } from "@/hooks/useEstuary";
import { useParams } from "next/navigation";
import { supabase } from "@/utils/supabase";

export const EstuaryContainer: FC = () => {
  const { page, setPage } = useEstuaryContext();
  const account = useActiveAccount();
  const params = useParams();
  const estId = params?.estId as string;

  // テスト用
  const estuary = useEstuary(estId);

  // テスト用
  const { createToken, token } = useToken(
    "894e3030-eab9-4842-a6b0-4ae6c328b36c"
  );

  useEffect(() => {
    if (!account) {
      setPage(0);
    }
    // const test = async () => {
    //   const { data: status } = await supabase
    //     .from("PAYMENT")
    //     .select("payment_status")
    //     .eq("user_id", account?.address as string);

    //   console.log("status:", status);
    // };
    // test();
  }, [account]);

  return (
    <div className="w-full h-svh flex flex-col items-center justify-center gap-4">
      <div className="relative w-full max-w-[35rem] h-[720px] bg-stone-50 rounded-3xl shadow-xl flex flex-col justify-center border-1 border-slate-200 overflow-y-scroll">
        <div className="absolute top-3 right-3">
          <ConnectButton />
        </div>
        {page === 0 ? (
          <TokenSelection />
        ) : page === 1 ? (
          <KYCPage />
        ) : page === 2 ? (
          <KYCAgreementPage />
        ) : page === 3 ? (
          <KYCSucceededPage />
        ) : page === 4 ? (
          <AgreementPage />
        ) : page === 5 ? (
          <ReceivedPage />
        ) : null}
      </div>
    </div>
  );
};
