import type { NextPage } from "next";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

import { useRouter } from "next/router";
import { CreateMembershipToken } from "@/components/web3/MembershipTokenFactory/CreateMembershipToken";
import ListMembershipTokens from "@/components/web3/MembershipTokenFactory/ListMembershipTokens";
import { GetService } from "@/components/web3/BorderlessCompany/GetService";
import { useEffect, useState } from "react";
import { Address } from "viem";
import { useGetService } from "@/components/hooks/useGetService";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";

export const getServerSideProps = async ({ locale }: { locale: string }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
};

const MembershipToken: NextPage = () => {
  const { t } = useTranslation("common");
  const router = useRouter();
  const { daoId } = router.query;
  const [isReady, setIsReady] = useState<boolean>(false);
  const { data, error, isPending } = useGetService(daoId as Address, 3);

  useEffect(() => {
    setIsReady(router.isReady);
  }, [router.isReady]);

  useEffect(() => {
    if (error) {
      console.log("error: ", error);
    }
  }, [error]);

  useEffect(() => {
    console.log("data: ", data);
  }, [data]);

  // TODO: ログインしてなかったらウォレットログインを促す。
  return (
    <>
      {!isReady ? (
        <></>
      ) : (
        <DashboardLayout>
          <div className="h-full lg:px-6">
            <div className="flex flex-col justify-center w-full py-5 px-4 lg:px-0 max-w-[90rem] mx-auto gap-8">
              <div className="flex flex-col justify-center w-full mx-auto gap-4">
                <div className="flex flex-wrap justify-between">
                  <h3 className="text-center text-xl font-semibold">
                    {t("Membership Tokens")}
                  </h3>
                </div>
                <div className="w-full flex flex-col gap-4">
                  <ListMembershipTokens contractAddress={daoId as Address} />
                </div>
              </div>
              <div className="flex flex-col justify-center w-full mx-auto gap-4">
                <div className="flex flex-wrap justify-between">
                  <h3 className="text-center text-xl font-semibold">
                    {t("Create New Membership Token")}
                  </h3>
                </div>
                <div className="w-full flex flex-col gap-4">
                  <CreateMembershipToken contractAddress={data as Address} />
                </div>
              </div>
            </div>
          </div>
        </DashboardLayout>
      )}
    </>
  );
};

export default MembershipToken;
