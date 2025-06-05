import { FC, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@heroui/react";
import { useTranslation } from "next-i18next";
import { Stack } from "@/sphere/Stack";
import { useRouter } from "next/router";
import { useRouterLoading } from "@/hooks/useRouter";
import { PiCheckCircleFill } from "react-icons/pi";

type SignupCompletePageProps = {
  page: number;
  onPageChange: (page: number) => void;
};

export const SignupCompletePage: FC<SignupCompletePageProps> = ({
  page,
  onPageChange,
}) => {
  const { t } = useTranslation(["login", "common"]);
  const router = useRouter();
  const { isNavigating } = useRouterLoading();

  const onContinue = () => {
    router.push("/company/create");
  };

  return (
    <motion.div
      className="flex flex-col items-center justify-center gap-6 w-full max-w-lg p-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, duration: 0.3, ease: "easeInOut" }}
      >
        <PiCheckCircleFill size={80} className="text-success" />
      </motion.div>

      <Stack className="w-full justify-center items-center gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
        >
          <p className="w-full font-title-lg text-center text-foreground">
            アカウントが登録されました！
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.3 }}
        >
          <p className="w-full text-medium text-center text-foreground">
            {t(
              "Your account has been successfully created. You can now create your company and start building your DAO."
            )}
          </p>
        </motion.div>
      </Stack>

      <motion.div
        className="w-full"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.3 }}
      >
        <Button
          color="primary"
          size="lg"
          fullWidth
          onPress={onContinue}
          isLoading={isNavigating}
        >
          {t("Create Your Company")}
        </Button>
      </motion.div>
    </motion.div>
  );
};
