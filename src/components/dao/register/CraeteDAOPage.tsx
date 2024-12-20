import { CLayout } from "@/components/layout/CLayout";
import { FC, useState } from "react";
import { ContrySelection } from "./ContrySelection";

export const CreateDAOPage: FC = () => {
  const [page, setPage] = useState<number>(0);
  return (
    <CLayout>
      {page === 0 && <ContrySelection pageHandler={setPage} />}
      {page === 1 && <></>}
    </CLayout>
  );
};
