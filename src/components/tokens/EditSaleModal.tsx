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
import { FC, useState, useEffect } from "react";
import { Stack } from "@/sphere/Stack";
import { EstuaryWithRelations, EstuaryUpdate } from "@/hooks/useEstuary";
import { parseDate, CalendarDate } from "@internationalized/date";

type EditSaleModalProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  estuary: EstuaryWithRelations | null;
};

export const EditSaleModal: FC<EditSaleModalProps> = ({
  isOpen,
  onOpenChange,
  estuary,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
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

  // estuaryが変更された時にフォームデータを初期化
  useEffect(() => {
    if (estuary) {
      setFormData({
        sale_name: estuary.sale_name || "",
        fixed_price: estuary.fixed_price?.toString() || "",
        dateRange: {
          start: estuary.start_date
            ? parseDate(estuary.start_date.split("T")[0])
            : parseDate(new Date().toISOString().split("T")[0]),
          end: estuary.end_date
            ? parseDate(estuary.end_date.split("T")[0])
            : parseDate(
                new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                  .toISOString()
                  .split("T")[0]
              ),
        },
      });
    }
  }, [estuary]);

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

  const resetForm = () => {
    if (estuary) {
      setFormData({
        sale_name: estuary.sale_name || "",
        fixed_price: estuary.fixed_price?.toString() || "",
        dateRange: {
          start: estuary.start_date
            ? parseDate(estuary.start_date.split("T")[0])
            : parseDate(new Date().toISOString().split("T")[0]),
          end: estuary.end_date
            ? parseDate(estuary.end_date.split("T")[0])
            : parseDate(
                new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                  .toISOString()
                  .split("T")[0]
              ),
        },
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!estuary) {
      console.error("編集対象のEstuaryが指定されていません");
      return;
    }

    setIsUpdating(true);
    try {
      const updateData: EstuaryUpdate = {
        sale_name: formData.sale_name,
        fixed_price: parseFloat(formData.fixed_price) || null,
        start_date: formData.dateRange.start.toString(),
        end_date: formData.dateRange.end.toString(),
      };

      // updateEstuary関数をカスタムで実装
      const response = await fetch(`/api/estuary?id=${estuary.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || "Estuaryの更新に失敗しました");
      }

      onOpenChange(false);
    } catch (error) {
      console.error("トークンセールの更新に失敗しました:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="lg"
      scrollBehavior="inside"
      onClose={resetForm}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <h2 className="font-headline-sm text-primary">
                トークンセールを編集
              </h2>
              <p className="font-body-md text-neutral">
                トークンの販売価格と期間を変更してください。
              </p>
            </ModalHeader>
            <form onSubmit={handleSubmit} id="edit-sale-form">
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
                  form="edit-sale-form"
                  isLoading={isUpdating}
                  isDisabled={isUpdating}
                >
                  {isUpdating ? "更新中..." : "更新"}
                </Button>
              </ModalFooter>
            </form>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
