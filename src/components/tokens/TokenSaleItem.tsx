import { FC, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Textarea,
  Link,
  CardFooter,
  useDisclosure,
} from "@heroui/react";
import { Stack } from "@/sphere/Stack";
import {
  PiCopy,
  PiCheck,
  PiArrowSquareOut,
  PiDot,
  PiDotBold,
  PiCircleFill,
  PiPencil,
} from "react-icons/pi";
import { EstuaryWithRelations } from "@/hooks/useEstuary";
import { usePaymentByCompanyId } from "@/hooks/usePayment";
import { EditSaleModal } from "./EditSaleModal";
import Image from "next/image";

export type TokenSaleItemProps = {
  estuary: EstuaryWithRelations;
};

export const TokenSaleItem: FC<TokenSaleItemProps> = ({ estuary }) => {
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onOpenChange: onEditOpenChange,
  } = useDisclosure();

  // 会社に紐づくペイメント情報を取得
  const { payments } = usePaymentByCompanyId(estuary.company_id || undefined);

  // この特定のestuaryに関連するペイメントをフィルタリング
  const estuaryPayments = payments.filter(
    (payment) => payment.estuary_id === estuary.id
  );

  // 調達額を計算（決済完了のペイメントのみ）
  const totalRaised = estuaryPayments
    .filter((payment) => payment.payment_status === "done")
    .reduce((sum, payment) => sum + (payment.price || 0), 0);

  // 購入者数を計算（決済完了のペイメントのみ）
  const buyerCount = estuaryPayments.filter(
    (payment) => payment.payment_status === "done"
  ).length;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "未設定";
    const date = new Date(dateString);
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
    }).format(price);
  };

  const getStatusColor = (startDate: string | null, endDate: string | null) => {
    if (!startDate || !endDate) return "default";

    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) return "warning"; // 開始前
    if (now > end) return "default"; // 終了
    return "success"; // 実施中
  };

  const getStatusText = (startDate: string | null, endDate: string | null) => {
    if (!startDate || !endDate) return "未設定";

    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) return "開始前";
    if (now > end) return "終了";
    return "実施中";
  };

  const isSaleEnded = (endDate: string | null) => {
    if (!endDate) return false;
    const now = new Date();
    const end = new Date(endDate);
    return now > end;
  };

  const copyEmbedCode = async () => {
    const embedCode = `<iframe style="border: 0px solid rgba(0, 0, 0, 0.1); border-radius: 28px;" width="100%" height="800px" src="${process.env.NEXT_PUBLIC_BASE_URL}/estuary/${estuary.id}" allowfullscreen></iframe>`;

    try {
      await navigator.clipboard.writeText(embedCode);
      setCopiedStates((prev) => ({ ...prev, embed: true }));

      // 2秒後にコピー状態をリセット
      setTimeout(() => {
        setCopiedStates((prev) => ({ ...prev, embed: false }));
      }, 2000);
    } catch (error) {
      console.error("埋め込みコードのコピーに失敗しました:", error);
    }
  };

  return (
    <Card className="border-1 border-divider shadow-sm rounded-lg">
      <CardHeader className="relative pb-4">
        <div className="flex justify-between items-start w-full">
          <Stack className="gap-1">
            <div className="flex flex-col items-start gap-2">
              <Chip
                size="sm"
                color={getStatusColor(estuary.start_date, estuary.end_date)}
                variant="flat"
                startContent={<PiCircleFill size={16} />}
              >
                {getStatusText(estuary.start_date, estuary.end_date)}
              </Chip>
              <h3 className="font-title-md text-foreground">
                {estuary.sale_name}
              </h3>
            </div>
          </Stack>
          <Button
            isIconOnly
            size="md"
            variant="ghost"
            color="default"
            startContent={<PiPencil />}
            onPress={onEditOpen}
            isDisabled={isSaleEnded(estuary.end_date)}
            className="absolute rounded-lg top-2 right-2"
          ></Button>
        </div>
      </CardHeader>
      <CardBody className="pt-0">
        <Stack className="gap-3">
          {/* 価格情報 */}
          {(estuary.fixed_price || estuary.min_price || estuary.max_price) && (
            <Stack className="gap-1">
              <p className="font-label-md text-neutral">販売価格</p>
              <div className="flex flex-wrap gap-2">
                {estuary.fixed_price && (
                  <span className="font-body-lg text-foreground">
                    {formatPrice(estuary.fixed_price)}
                  </span>
                )}
              </div>
            </Stack>
          )}
          <Stack className="gap-1">
            <p className="font-label-md text-neutral">販売期間</p>
            <div className="flex flex-wrap gap-2">
              <span className="font-body-lg text-foreground">
                {formatDate(estuary.start_date)} —{" "}
                {formatDate(estuary.end_date)}
              </span>
            </div>
          </Stack>
          <Button
            size="sm"
            color="primary"
            startContent={copiedStates.embed ? <PiCheck /> : <PiCopy />}
            onPress={copyEmbedCode}
          >
            {copiedStates.embed ? "コピー済み" : "埋め込みコードをコピー"}
          </Button>
        </Stack>
      </CardBody>
      <CardFooter className="p-3 pt-0">
        <Stack h className="bg-content2 p-4 rounded-lg gap-2">
          <Stack className="flex-[2] gap-1">
            <p className="font-label-md text-neutral">調達額</p>
            <p className="font-body-lg text-foreground">
              {formatPrice(totalRaised)}
            </p>
          </Stack>

          <Stack className="flex-1 gap-1 border-l-1 border-divider pl-4">
            <p className="font-label-md text-neutral">購入者数</p>
            <p className="font-body-lg text-foreground">{buyerCount}人</p>
          </Stack>
        </Stack>
      </CardFooter>

      {/* 編集モーダル */}
      <EditSaleModal
        isOpen={isEditOpen}
        onOpenChange={onEditOpenChange}
        estuary={estuary}
      />
    </Card>
  );
};
