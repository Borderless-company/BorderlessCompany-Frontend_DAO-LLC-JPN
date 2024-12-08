"use client";

import type { NextPage } from "next";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import SimpleLayout from "@/components/layout/SimpleLayout";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@nextui-org/react";
import { useEstuary } from "@/hooks/useEstuary";
import { v4 as uuidv4 } from "uuid";
import { useDAO } from "@/hooks/useDAO";
import { supabase } from "@/utils/supabase";
import { useToken } from "@/hooks/useToken";
import { EstuaryLinkDisplay } from "@/components/estuary/EstuaryLinkDisplay";

import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";

export const getServerSideProps = async ({ locale }: { locale: string }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
};

const EstuaryPage: NextPage = () => {
  const router = useRouter();
  const { daoId } = router.query;
  const { createEstuary } = useEstuary();
  const { dao } = useDAO(daoId as string);
  const { updateToken } = useToken();
  const [estuaryId, setEstuaryId] = useState<string>();
  const { t } = useTranslation("common");

  useEffect(() => {
    const fetchEstuaryId = async () => {
      // TODO: read supabase
      const { data, error } = await supabase
        .from("ESTUARY")
        .select()
        .eq("dao_id", daoId as string)
        .single();
      if (data) {
        setEstuaryId(data.id);
      } else {
        setEstuaryId(undefined);
      }
    };
    fetchEstuaryId();
  }, []);

  const onPressCreate = async () => {
    if (!dao) return;
    const estId = uuidv4();
    const estLink = `https://apps.borderless.company/estuary/${estId}`;

    console.log("pre-estId: ", estId);
    // TODO: read supabase
    const { data: tokens, error } = await supabase
      .from("TOKEN")
      .select()
      .eq("dao_id", daoId as string);
    console.log("tokens: ", tokens);

    await createEstuary({
      id: estId,
      org_logo: dao.dao_icon,
      org_name: dao.dao_name,
      estuary_link: estLink,
      is_public: false,
      dao_id: daoId as string,
    });

    tokens?.map(async (token) => {
      await updateToken({
        id: token.id,
        estuary_id: estId,
      });
    });

    setEstuaryId(estId);
  };

  return (
    <DashboardLayout>
      <div className="h-full lg:px-6">
        <div className="flex flex-col justify-center w-full py-5 px-4 lg:px-0 max-w-[90rem] mx-auto gap-8">
          <div className="flex flex-col justify-center w-full mx-auto gap-4">
            <div className="flex flex-col items-start justify-between gap-4">
              <h3 className="text-center text-xl font-semibold">
                {t("Estuary")}
              </h3>
              {estuaryId ? (
                <EstuaryLinkDisplay estId={estuaryId} />
              ) : (
                <Button color="primary" onPress={onPressCreate}>
                  {t("Create Estuary")}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EstuaryPage;
