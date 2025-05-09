import { FC, useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  ModalProps,
  Textarea,
} from "@heroui/react";
import { Tables } from "@/types/schema";
import { Stack } from "@/sphere/Stack";
import ImageUploader from "@/components/ImageUploader";
import { useAtom } from "jotai";
import { selectedFileAtom } from "@/atoms";
import { uploadFile } from "@/utils/supabase";
import { v4 as uuidv4 } from "uuid";
import { useTaskStatus } from "@/hooks/useTaskStatus";
import { useToken, useTokenByCompanyId } from "@/hooks/useToken";
import { createNFTMetadata, uploadTokenMetadata } from "@/utils/token";
import { useTranslation } from "next-i18next";

type ExecutiveTokenInfoEditProps = {
  company?: Tables<"COMPANY">;
} & Omit<ModalProps, "children">;

export const ExecutiveTokenInfoEdit: FC<ExecutiveTokenInfoEditProps> = ({
  company,
  ...props
}) => {
  const { t } = useTranslation(["token", "common"]);
  const { createToken } = useToken();
  const [selectedFile, setSelectedFile] = useAtom(selectedFileAtom);
  const [imgUrl, setImgUrl] = useState<string | undefined>(undefined);
  const [formData, setFormData] = useState({
    name: "",
    symbol: "",
    description: "",
  });
  const { updateTaskStatusByIds } = useTaskStatus();
  const { tokens, isLoadingTokens, isErrorTokens, refetchTokens } =
    useTokenByCompanyId(company?.id);

  useEffect(() => {
    console.log("tokens >>>: ", tokens);
    if (tokens && tokens.length > 0) {
      const token = tokens[0]; // 最初のトークンを使用
      console.log("token >>>: ", token);
      setFormData({
        name: token.name || "",
        symbol: token.symbol || "",
        description: token.description || "",
      });
      setImgUrl(token.image || undefined);
    }
  }, [tokens]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!company?.id) return;

    try {
      let imageUrl = "";
      if (selectedFile) {
        const { publicUrl } = await uploadFile(
          "token-image",
          `${uuidv4()}-token-image`,
          selectedFile
        );
        setImgUrl(publicUrl);
        imageUrl = publicUrl;
      }

      // トークンを作成
      const token = await createToken({
        id: tokens?.[0]?.id || undefined,
        name: formData.name,
        symbol: formData.symbol,
        image: imageUrl,
        description: formData.description,
        company_id: company.id,
        is_executable: true,
      });

      await refetchTokens();

      // タスクステータスを更新
      const hasAllFields =
        formData.name && formData.symbol && imageUrl && formData.description;
      const hasAnyField =
        formData.name || formData.symbol || imageUrl || formData.description;

      const status = hasAllFields
        ? "completed"
        : hasAnyField
        ? "inProgress"
        : "todo";

      await updateTaskStatusByIds({
        company_id: company.id,
        task_id: "enter-executive-token-info",
        status: status,
      });

      setSelectedFile(undefined);
      setImgUrl(undefined);
      setFormData({
        name: "",
        symbol: "",
        description: "",
      });
      props.onClose?.();
      props.onOpenChange?.(false);
    } catch (error) {
      console.error("Failed to update token info:", error);
    }
  };

  return (
    <Modal
      {...props}
      onClose={() => {
        setSelectedFile(undefined);
        setImgUrl(undefined);
        props.onClose?.();
      }}
      classNames={{
        base: "max-w-md",
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <h2 className="font-headline-sm text-primary">
                {t("Executive Member Token Info")}
              </h2>
              <p className="font-body-md text-neutral">
                {t("Enter the token information for executive members.")}
              </p>
            </ModalHeader>
            <form onSubmit={handleSubmit} id="token-edit-form">
              <ModalBody>
                <Stack className="gap-4">
                  <ImageUploader label={t("Token Image")} />
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    label={t("Token Name")}
                    labelPlacement="outside"
                    placeholder={t("Enter token name")}
                    description={t("This will be the name")}
                  />
                  <Input
                    name="symbol"
                    value={formData.symbol}
                    onChange={handleInputChange}
                    label={t("Token Symbol")}
                    labelPlacement="outside"
                    placeholder={t("e.g. EXT")}
                    description={t("A short identifier")}
                  />
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    label={t("Token Description")}
                    labelPlacement="outside"
                    placeholder={t("Enter token description")}
                    description={t(
                      "Describe the purpose and benefits of this token."
                    )}
                  />
                </Stack>
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="light" onPress={onClose}>
                  {t("Cancel", { ns: "common" })}
                </Button>
                <Button color="primary" type="submit" form="token-edit-form">
                  {t("Save", { ns: "common" })}
                </Button>
              </ModalFooter>
            </form>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
