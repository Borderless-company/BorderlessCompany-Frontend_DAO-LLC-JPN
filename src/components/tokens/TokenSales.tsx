import { FC, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Textarea,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Link,
} from "@heroui/react";
import { Stack } from "@/sphere/Stack";
import { PiPlus, PiCopy, PiCheck, PiArrowSquareOut } from "react-icons/pi";
import { useEstuaryByCompanyId } from "@/hooks/useEstuary";
import { useCompany } from "@/hooks/useCompany";
import { Tables } from "@/types/schema";
import Image from "next/image";

export type TokenSalesProps = {
  companyId: string;
  tokenId: string;
};

type EstuaryWithRelations = Tables<"ESTUARY"> & {
  tokens: Tables<"TOKEN">[];
  company: Tables<"COMPANY"> & {
    COMPANY_NAME: Tables<"COMPANY_NAME"> | null;
  };
};

export const TokenSales: FC<TokenSalesProps> = ({ companyId, tokenId }) => {
  const { company } = useCompany(companyId);
  const { estuaries, isLoading } = useEstuaryByCompanyId(companyId);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});

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

  const generateEmbedCode = (estuaryLink: string) => {
    return `<iframe style="border: 0px solid rgba(0, 0, 0, 0.1); border-radius: 28px;" width="100%" height="800px" src="${estuaryLink}" allowfullscreen></iframe>`;
  };

  const copyToClipboard = async (text: string, estuaryId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates({ ...copiedStates, [estuaryId]: true });
      setTimeout(() => {
        setCopiedStates({ ...copiedStates, [estuaryId]: false });
      }, 2000);
    } catch (err) {
      console.error("コピーに失敗しました:", err);
    }
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

  return (
    <div className="h-full flex flex-col gap-4 ">
      {/* ヘッダー */}

      <Button
        color="primary"
        startContent={<PiPlus />}
        onPress={onOpen}
        className="rounded-lg w-fit"
      >
        新しく作成
      </Button>

      {/* トークンセール一覧 */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <p className="font-body-md text-neutral">読み込み中...</p>
          </div>
        ) : estuaries && estuaries.length > 0 ? (
          <div className="grid gap-4">
            {estuaries.map((estuary: EstuaryWithRelations) => (
              <Card key={estuary.id} className="border-1 border-divider">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start w-full">
                    <Stack className="gap-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-label-lg text-foreground">
                          {estuary.org_name}
                        </h3>
                        <Chip
                          size="sm"
                          color={getStatusColor(
                            estuary.start_date,
                            estuary.end_date
                          )}
                          variant="flat"
                        >
                          {getStatusText(estuary.start_date, estuary.end_date)}
                        </Chip>
                      </div>
                      <p className="font-body-sm text-neutral">
                        {formatDate(estuary.start_date)} -{" "}
                        {formatDate(estuary.end_date)}
                      </p>
                    </Stack>
                    {estuary.estuary_link && (
                      <Link
                        href={estuary.estuary_link}
                        isExternal
                        className="text-primary"
                      >
                        <PiArrowSquareOut size={16} />
                      </Link>
                    )}
                  </div>
                </CardHeader>
                <CardBody className="pt-0">
                  <Stack className="gap-3">
                    {/* トークン情報 */}
                    {estuary.tokens && estuary.tokens.length > 0 && (
                      <Stack className="gap-2">
                        <p className="font-label-sm text-neutral">
                          対象トークン
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {estuary.tokens.map((token) => (
                            <div
                              key={token.id}
                              className="flex items-center gap-2 p-2 bg-default-50 rounded-lg"
                            >
                              {token.image && (
                                <Image
                                  src={token.image}
                                  alt={token.name || ""}
                                  width={24}
                                  height={24}
                                  className="rounded"
                                />
                              )}
                              <span className="font-body-sm text-foreground">
                                {token.symbol}
                              </span>
                              {token.fixed_price && (
                                <span className="font-body-sm text-neutral">
                                  {formatPrice(token.fixed_price)}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </Stack>
                    )}

                    {/* 埋め込みコード */}
                    {estuary.estuary_link && (
                      <Stack className="gap-2">
                        <p className="font-label-sm text-neutral">
                          埋め込みコード
                        </p>
                        <div className="relative">
                          <Textarea
                            value={generateEmbedCode(estuary.estuary_link)}
                            readOnly
                            minRows={3}
                            className="font-mono text-xs"
                            classNames={{
                              input: "resize-none",
                            }}
                          />
                          <Button
                            isIconOnly
                            size="sm"
                            variant="flat"
                            className="absolute top-2 right-2"
                            onPress={() =>
                              copyToClipboard(
                                generateEmbedCode(estuary.estuary_link!),
                                estuary.id
                              )
                            }
                          >
                            {copiedStates[estuary.id] ? (
                              <PiCheck className="text-success" />
                            ) : (
                              <PiCopy />
                            )}
                          </Button>
                        </div>
                        {copiedStates[estuary.id] && (
                          <p className="font-body-xs text-success">
                            コピーしました！
                          </p>
                        )}
                      </Stack>
                    )}
                  </Stack>
                </CardBody>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <p className="font-body-md text-neutral mb-2">
              まだトークンセールがありません
            </p>
            <p className="font-body-sm text-neutral">
              新しいトークンセールを作成してください
            </p>
          </div>
        )}
      </div>

      {/* トークンセール作成モーダル */}
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="lg"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                新しいトークンセールを作成
              </ModalHeader>
              <ModalBody>
                <div className="text-center py-8">
                  <p className="font-body-md text-neutral mb-4">
                    トークンセール（Estuary）の作成機能は準備中です。
                  </p>
                  <p className="font-body-sm text-neutral">
                    詳細については管理者にお問い合わせください。
                  </p>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  閉じる
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};
