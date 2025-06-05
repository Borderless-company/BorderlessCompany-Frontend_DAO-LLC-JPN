import { FC, useEffect, useState } from "react";
import { motion } from "framer-motion";
import SumsubWebSdk from "@sumsub/websdk-react";
import { MessageHandler } from "@sumsub/websdk";
import { EventPayload } from "@sumsub/websdk/types/types";
import { useActiveAccount } from "thirdweb/react";
import { useUser } from "@/hooks/useUser";
import { useTranslation } from "next-i18next";
import { Stack } from "@/sphere/Stack";
import { Button } from "@heroui/react";
import { PiIdentificationCard } from "react-icons/pi";

type KYCPageProps = {
  page: number;
  onPageChange: (page: number) => void;
};

export const KYCPage: FC<KYCPageProps> = ({ page, onPageChange }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation(["login", "common"]);
  const smartAccount = useActiveAccount();
  const { updateUser, user } = useUser(smartAccount?.address);

  // ユーザーのKYCステータスが「done」の場合は次のページに自動的に進む
  useEffect(() => {
    if (user && user.kyc_status === "done") {
      console.log("KYC already completed, skipping to next page");
      onPageChange(page + 1);
    }
  }, [user, onPageChange, page]);

  useEffect(() => {
    const getAccessToken = async () => {
      if (!smartAccount?.address) return;

      try {
        setIsLoading(true);
        const response = await fetch("/api/kyc/accessToken", {
          method: "POST",
          body: JSON.stringify({
            userId: smartAccount.address,
            levelName: "borderless-kyc-level",
          }),
        });
        const accessTokenJson = await response.json();
        console.log("accessToken: ", accessTokenJson);
        setAccessToken(accessTokenJson.token);
      } catch (error) {
        console.error("Error: ", error);
      } finally {
        setIsLoading(false);
      }
    };
    getAccessToken();
  }, [smartAccount?.address]);

  const expirationHandler = async () => {
    try {
      const response = await fetch("/api/kyc/accessToken", {
        method: "POST",
        body: JSON.stringify({
          userId: smartAccount?.address,
          levelName: "borderless-kyc-level",
        }),
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error in expiration handler:", error);
      throw error;
    }
  };

  const kycMessageHandler: MessageHandler = (type, payload) => {
    if (type === "idCheck.onApplicantSubmitted") {
      console.log("onApplicantSubmitted: ", payload);
      onPageChange(page + 1);
    }
    if (type === "idCheck.onApplicantStatusChanged") {
      console.log("onApplicantStatusChanged: ", payload);
      const castedPayload =
        payload as EventPayload<"idCheck.onApplicantStatusChanged">;
      if (castedPayload.reviewStatus === "completed") {
        // KYCの審査が完了したらユーザーのKYCステータスを更新
        updateUser({ kyc_status: "done" })
          .then(() => console.log("KYC status updated to done"))
          .catch((err) => console.error("Failed to update KYC status:", err));

        onPageChange(page + 1);
      }
    }
    if (type === "idCheck.onModuleResultPresented") {
      console.log("onModuleResultPresented: ", payload);
    }
    if (type === "idCheck.onActionSubmitted") {
      console.log("onActionSubmitted: ", payload);
    }
    if (type === "idCheck.onActionCompleted") {
      console.log("onActionCompleted: ", payload);
    }
  };

  const onBack = () => {
    onPageChange(page - 1);
  };

  // KYCが既に完了している場合はローディング表示だけして自動的に次のページに進む
  if (user && user.kyc_status === "done") {
    return (
      <motion.div
        className="flex flex-col items-center justify-center gap-4 w-full max-w-lg p-8"
        initial={{ opacity: 0, x: 0 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="animate-pulse h-6 w-24 bg-gray-200 rounded"></div>
      </motion.div>
    );
  }

  if (isLoading || !accessToken) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center gap-4 w-full max-w-lg p-8"
        initial={{ opacity: 0, x: 0 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <Stack className="w-full justify-center gap-2">
          <PiIdentificationCard size={48} className="text-primary mx-auto" />
          <p className="w-full font-title-lg text-center text-foreground">
            {t("Identity Verification")}
          </p>
          <p className="w-full text-medium text-center text-foreground">
            {t("Setting up identity verification...")}
          </p>
        </Stack>
        <div className="animate-pulse h-6 w-32 bg-gray-200 rounded"></div>
        <Stack h className="w-full justify-end gap-2 z-20">
          <Button color="primary" variant="bordered" onPress={onBack}>
            {t("Back", { ns: "common" })}
          </Button>
        </Stack>
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
      <div className="w-full min-h-[400px]">
        <SumsubWebSdk
          onMessage={kycMessageHandler}
          accessToken={accessToken}
          expirationHandler={expirationHandler}
          options={{
            adaptIframeHeight: true,
            addViewportTag: false,
          }}
          config={{
            lang: "ja",
            i18n: {
              ja: {
                document_photo: {
                  loader: {
                    initial: "読み込み中...",
                  },
                },
              },
            },
          }}
          onError={(error) => console.error("Sumsub SDK error:", error)}
        />
      </div>
    </motion.div>
  );
};
