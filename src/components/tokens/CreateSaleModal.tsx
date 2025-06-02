import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  DateRangePicker,
} from "@heroui/react";
import { FC, useState } from "react";
import { Stack } from "@/sphere/Stack";
import { useEstuary, EstuaryInsert } from "@/hooks/useEstuary";
import { parseDate, CalendarDate } from "@internationalized/date";

type CreateSaleModalProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  companyId?: string;
  tokenId?: string;
};

export const CreateSaleModal: FC<CreateSaleModalProps> = ({
  isOpen,
  onOpenChange,
  companyId,
  tokenId,
}) => {
  const { createEstuary, isCreating } = useEstuary();
  const [formData, setFormData] = useState({
    sale_name: "",
    fixed_price: "",
    dateRange: {
      start: parseDate(new Date().toISOString().split("T")[0]),
      end: parseDate(
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0]
      ),
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateRangeChange = (
    value: { start: CalendarDate; end: CalendarDate } | null
  ) => {
    if (value) {
      setFormData((prev) => ({
        ...prev,
        dateRange: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!companyId) {
      console.error("Company IDが必要です");
      return;
    }

    try {
      const estuaryData: EstuaryInsert = {
        company_id: companyId,
        token_id: tokenId || null,
        sale_name: formData.sale_name,
        fixed_price: parseFloat(formData.fixed_price) || null,
        start_date: formData.dateRange.start.toString(),
        end_date: formData.dateRange.end.toString(),
        is_public: true,
      };

      await createEstuary(estuaryData);

      // フォームをリセット
      setFormData({
        sale_name: "",
        fixed_price: "",
        dateRange: {
          start: parseDate(new Date().toISOString().split("T")[0]),
          end: parseDate(
            new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0]
          ),
        },
      });

      onOpenChange(false);
    } catch (error) {
      console.error("トークンセールの作成に失敗しました:", error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="lg"
      scrollBehavior="inside"
      onClose={() => {
        // モーダルが閉じられた時にフォームをリセット
        setFormData({
          sale_name: "",
          fixed_price: "",
          dateRange: {
            start: parseDate(new Date().toISOString().split("T")[0]),
            end: parseDate(
              new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0]
            ),
          },
        });
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <h2 className="font-headline-sm text-primary">
                新しいトークンセールを作成
              </h2>
              <p className="font-body-md text-neutral">
                トークンの販売価格と期間を設定してください。
              </p>
            </ModalHeader>
            <form onSubmit={handleSubmit} id="create-sale-form">
              <ModalBody>
                <Stack className="gap-4">
                  <Input
                    name="sale_name"
                    value={formData.sale_name}
                    onChange={handleInputChange}
                    label="セール名"
                    labelPlacement="outside"
                    placeholder="トークンセール第1弾"
                    isRequired
                    description="セール名は購入者には表示されません。"
                  />
                  <Input
                    name="fixed_price"
                    value={formData.fixed_price}
                    onChange={handleInputChange}
                    label="販売価格"
                    labelPlacement="outside"
                    placeholder="100000"
                    type="number"
                    min="0"
                    step="1"
                    isRequired
                    description="トークンの固定販売価格を円で入力してください"
                    startContent={
                      <span className="text-neutral text-sm">¥</span>
                    }
                  />
                  <DateRangePicker
                    label="販売期間"
                    labelPlacement="outside"
                    value={formData.dateRange}
                    onChange={handleDateRangeChange}
                    isRequired
                    description="トークンの販売開始日と終了日を選択してください"
                    granularity="day"
                  />
                </Stack>
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="light" onPress={onClose}>
                  キャンセル
                </Button>
                <Button
                  color="primary"
                  type="submit"
                  form="create-sale-form"
                  isLoading={isCreating}
                  isDisabled={isCreating}
                >
                  {isCreating ? "作成中..." : "作成"}
                </Button>
              </ModalFooter>
            </form>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
