import { FC } from "react";
import MemberList from "./MemberList";

export type MembersPageProps = {
  companyId: string;
};

export const MembersPage: FC<MembersPageProps> = ({ companyId }) => {
  return (
    <main className="w-full h-full overflow-scroll p-6">
      <MemberList companyId={companyId} />
    </main>
  );
};
