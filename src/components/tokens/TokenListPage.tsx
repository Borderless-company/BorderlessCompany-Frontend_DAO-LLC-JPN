import { Button, Spinner } from "@heroui/react";
import { FC, useState } from "react";
import { PiPlus } from "react-icons/pi";
import { TokenCard } from "./TokenCard";
import { useTokenByCompanyId } from "@/hooks/useToken";
import { useRouter } from "next/router";
import { useCompany } from "@/hooks/useCompany";
import { useTranslation } from "next-i18next";
import { StatelessDaoTokenCreate } from "./StatelessDaoTokenCreate";
import { isStatelessDao } from "@/utils/company";
export type TokensPageProps = {
  companyId: string;
};

export const TokenListPage: FC<TokensPageProps> = ({ companyId }) => {
  const router = useRouter();
  const { t } = useTranslation(["token", "common"]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { company, isLoading: isLoadingCompany } = useCompany(companyId);
  const { tokens, isLoadingTokens, refetchTokens } =
    useTokenByCompanyId(companyId);

  const isStatelessDaoCompany = isStatelessDao(company);

  const handleTokenCreated = () => {
    setShowCreateModal(false);
    refetchTokens();
  };
  return (
    <main className="w-full h-full overflow-scroll px-6 py-2">
      {/* 無国籍DAO用のトークン作成ボタン */}
      {isStatelessDaoCompany && (
        <div className="mb-6">
          <Button
            color="primary"
            variant="solid"
            startContent={<PiPlus size={20} />}
            onPress={() => setShowCreateModal(true)}
          >
            トークンを作成
          </Button>
        </div>
      )}

      {isLoadingTokens || isLoadingCompany ? (
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

      {/* 無国籍DAO用のトークン作成モーダル */}
      {isStatelessDaoCompany && (
        <StatelessDaoTokenCreate
          isOpen={showCreateModal}
          onOpenChange={setShowCreateModal}
          company={company}
          onSuccess={handleTokenCreated}
        />
      )}
    </main>
  );
};
