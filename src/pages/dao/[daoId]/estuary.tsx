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

const EstuaryPage: NextPage = () => {
  const router = useRouter();
  const { daoId } = router.query;
  const { createEstuary } = useEstuary();
  const { dao } = useDAO(daoId as string);
  const { updateToken } = useToken();
  const [estuaryLink, setEstuaryLink] = useState<string>();
  const [estuaryId, setEstuaryId] = useState<string>();

  useEffect(() => {
    const fetchEstuaryId = async () => {
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
    setEstuaryLink(estLink);

    const { data: tokens, error } = await supabase
      .from("TOKEN")
      .select()
      .eq("dao_id", daoId as string);

    tokens?.map((token) => {
      updateToken({
        id: token.id,
        estuary_id: estId,
      });
    });

    await createEstuary({
      id: estId,
      org_logo: dao.dao_icon,
      org_name: dao.dao_name,
      estuary_link: estuaryLink,
      is_public: false,
      dao_id: daoId as string,
    });
  };

  return (
    <DashboardLayout>
      <div className="h-full lg:px-6">
        <div className="flex flex-col justify-center w-full py-5 px-4 lg:px-0 max-w-[90rem] mx-auto gap-8">
          <div className="flex flex-col justify-center w-full mx-auto gap-4">
            <div className="flex flex-col items-start justify-between gap-4">
              <h3 className="text-center text-xl font-semibold">
                エスチャリー
              </h3>
              {estuaryId ? (
                <></>
              ) : (
                <Button color="primary" onPress={onPressCreate}>
                  エスチャリーを作成
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
