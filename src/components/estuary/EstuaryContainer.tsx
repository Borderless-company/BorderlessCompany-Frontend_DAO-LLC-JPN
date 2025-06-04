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
import { useEstuaryContext } from "./EstuaryContext";
import { useEstuary } from "@/hooks/useEstuary";
import { useRouter } from "next/router";
import { supabase } from "@/utils/supabase";
import AlreadyMember from "./AlreadyMemberPage";
import { useTranslation } from "next-i18next";
import PaymentPage from "./PaymentPage";

export const EstuaryContainer: FC = () => {
  const { t } = useTranslation("estuary");
  const { page, setPage } = useEstuaryContext();
  const account = useActiveAccount();
  const router = useRouter();
  const { estId } = router.query;
  const { estuary } = useEstuary(estId as string);

  useEffect(() => {
    const checkPaymentStatus = async () => {
      if (account && estuary) {
        // TODO: read supabase
        const { data, error } = await supabase
          .from("MEMBER")
          .select()
          .eq("user_id", account?.address)
          .eq("dao_id", estuary?.dao_id as string);
        if (data && data?.length > 0) {
          setPage(7);
        }
      }
    };
    if (!account) {
      setPage(0);
    } else {
      checkPaymentStatus();
    }
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
          <PaymentPage />
        ) : page === 6 ? (
          <ReceivedPage />
        ) : page === 7 ? (
          <AlreadyMember
            orgLogo={estuary?.org_logo as string}
            orgName={estuary?.sale_name as string}
          />
        ) : null}
      </div>
    </div>
  );
};
