import { FC, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button, Input, Spinner } from "@heroui/react";
import { useForm } from "react-hook-form";
import { useActiveAccount } from "thirdweb/react";
import { useUser } from "@/hooks/useUser";
import { useTranslation } from "next-i18next";
import { Stack } from "@/sphere/Stack";
import { PiIdentificationCardFill } from "react-icons/pi";

type UserInfoPageProps = {
  page: number;
  onPageChange: (page: number) => void;
};

type UserInfoFormData = {
  name: string;
  furigana: string;
  address: string;
};

export const UserInfoPage: FC<UserInfoPageProps> = ({ page, onPageChange }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useTranslation(["login", "common"]);
  const smartAccount = useActiveAccount();
  const { createUser, updateUser, user } = useUser(smartAccount?.address);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = useForm<UserInfoFormData>({
    mode: "onChange",
  });

  // ユーザー情報が既に存在する場合はフォームに設定
  useEffect(() => {
    if (user) {
      if (user.name) setValue("name", user.name);
      if (user.furigana) setValue("furigana", user.furigana);
      if (user.address) setValue("address", user.address);

      // 全ての必要な情報が設定されていれば次のページに進む
      if (
        user.name &&
        user.furigana &&
        user.address &&
        user.status === "signedUp"
      ) {
        console.log("User information already complete, skipping to next page");
        onPageChange(page + 1);
      }
    }
  }, [user, setValue, onPageChange, page]);

  const onSubmit = async (data: UserInfoFormData) => {
    if (!smartAccount?.address) return;

    try {
      setIsSubmitting(true);

      if (user) {
        // ユーザーが既に存在する場合は更新
        await updateUser({
          ...data,
          status: "signedUp",
        });
      } else {
        // ユーザーが存在しない場合は作成
        await createUser({
          evm_address: smartAccount.address,
          status: "signedUp",
          ...data,
        });
      }

      console.log("User info updated successfully");
      onPageChange(page + 1);
    } catch (error) {
      console.error("Failed to update user info:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onBack = () => {
    onPageChange(page - 2);
  };

  // ユーザー情報が完了済みの場合はローディング表示
  if (
    user &&
    user.name &&
    user.furigana &&
    user.address &&
    user.status === "signedUp"
  ) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center gap-4 w-full max-w-lg p-8"
        initial={{ opacity: 0, x: 0 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <Spinner />
      </motion.div>
    );
  }

  return (
    <motion.div
      className="flex flex-col items-start justify-center gap-4 w-full max-w-lg p-8"
      initial={{ opacity: 0, x: 0 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <Stack className="w-full justify-center gap-2">
        <PiIdentificationCardFill size={48} className="text-primary mx-auto" />
        <p className="w-full font-title-lg text-center text-foreground">
          {t("Enter Your Information")}
        </p>
        <p className="w-full text-medium text-center text-foreground">
          {t(
            "Please provide your personal information to complete registration"
          )}
        </p>
      </Stack>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4 w-full"
      >
        <div className="w-full flex flex-col gap-4">
          <Input
            label={t("Name")}
            labelPlacement="outside"
            placeholder="田中太郎"
            size="lg"
            isRequired
            isInvalid={!!errors.name}
            errorMessage={errors.name?.message}
            {...register("name", {
              required: t("Please enter your name"),
            })}
          />
          <Input
            label={t("Furigana")}
            labelPlacement="outside"
            placeholder="たなかたろう"
            size="lg"
            isRequired
            isInvalid={!!errors.furigana}
            errorMessage={errors.furigana?.message}
            {...register("furigana", {
              required: t("Please enter your furigana"),
            })}
          />
          <Input
            label={t("Address")}
            labelPlacement="outside"
            placeholder="東京都千代田区千代田1-1-1"
            size="lg"
            isRequired
            isInvalid={!!errors.address}
            errorMessage={errors.address?.message}
            {...register("address", {
              required: t("Please enter your address"),
            })}
          />
        </div>

        <Stack h className="w-full justify-end gap-2 z-20 mt-4">
          <Button
            color="primary"
            variant="bordered"
            onPress={onBack}
            isDisabled={isSubmitting}
          >
            {t("Back", { ns: "common" })}
          </Button>
          <Button
            color="primary"
            type="submit"
            isLoading={isSubmitting}
            isDisabled={!isValid}
          >
            {t("Complete Registration")}
          </Button>
        </Stack>
      </form>
    </motion.div>
  );
};
