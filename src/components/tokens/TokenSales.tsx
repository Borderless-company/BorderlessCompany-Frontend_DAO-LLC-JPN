import { FC, useMemo } from "react";
import { Button, Spinner, useDisclosure } from "@heroui/react";
import { PiPlus } from "react-icons/pi";
import {
  useEstuariesByCompanyId,
  EstuaryWithRelations,
} from "@/hooks/useEstuary";
import { useCompany } from "@/hooks/useCompany";
import { CreateSaleModal } from "./CreateSaleModal";
import { TokenSaleItem } from "./TokenSaleItem";
import { Stack } from "@/sphere/Stack";

export type TokenSalesProps = {
  companyId: string;
  tokenId: string;
};

export const TokenSales: FC<TokenSalesProps> = ({ companyId, tokenId }) => {
  const { company } = useCompany(companyId);
  const { estuaries, isLoading } = useEstuariesByCompanyId(companyId);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  // このトークンに関連するセールをフィルタリング
  const filteredEstuaries = useMemo(() => {
    return (
      estuaries?.filter(
        (estuary: EstuaryWithRelations) => estuary.token_id === tokenId
      ) || []
    );
  }, [estuaries, tokenId]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-32">
          <Spinner />
        </div>
      );
    }

    if (filteredEstuaries.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-32 text-center">
          <p className="font-body-md text-neutral">
            トークン販売はまだありません
          </p>
          <p className="font-body-sm text-neutral">
            新しいトークン販売を作成してください
          </p>
        </div>
      );
    }

    return (
      <div className="flex-1 grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3 overflow-y-scroll bg-transparent">
        {filteredEstuaries.map((estuary: EstuaryWithRelations) => (
          <TokenSaleItem key={estuary.id} estuary={estuary} />
        ))}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col gap-4 overflow-hidden ">
      {/* ヘッダー */}
      <Stack h className="justify-between items-center">
        <h3 className="font-title-md text-foreground">トークン販売</h3>
        <Button
          color="primary"
          startContent={<PiPlus />}
          onPress={onOpen}
          className="rounded-lg w-fit"
        >
          新しく作成
        </Button>
      </Stack>

      {/* トークンセール一覧 */}
      <div className="flex-1 bg-transparent">{renderContent()}</div>

      {/* トークンセール作成モーダル */}
      <CreateSaleModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        companyId={companyId}
        tokenId={tokenId}
      />
    </div>
  );
};
