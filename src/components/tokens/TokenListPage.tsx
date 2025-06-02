import { Stack } from "@/sphere/Stack";
import { Tables } from "@/types/schema";
import { Button, Chip, Spinner, Tab, Tabs } from "@heroui/react";
import Image from "next/image";
import { FC } from "react";
import { PiPencil } from "react-icons/pi";
import MemberList from "../members/MemberList";
import { TokenCard } from "./TokenCard";
import { useTokenByCompanyId } from "@/hooks/useToken";
import { useRouter } from "next/router";
export type TokensPageProps = {
  companyId: string;
};

export const TokenListPage: FC<TokensPageProps> = ({ companyId }) => {
  const router = useRouter();
  const { tokens, isLoadingTokens, isErrorTokens } =
    useTokenByCompanyId(companyId);
  return (
    <main className="w-full h-full overflow-scroll px-6 py-2">
      {isLoadingTokens ? (
        <Spinner />
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3">
          {/* トークンカード */}
          {tokens?.map((token) => (
            <TokenCard
              key={token.id}
              token={token}
              onPress={() => {
                router.push(`/company/${companyId}/tokens/${token.id}`);
              }}
            />
          ))}
        </div>
      )}
    </main>
  );
};
