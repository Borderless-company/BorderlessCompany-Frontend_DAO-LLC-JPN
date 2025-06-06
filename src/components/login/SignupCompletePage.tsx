import { FC, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button, Card, CardBody, Button as NextUIButton } from "@heroui/react";
import { useTranslation } from "next-i18next";
import { Stack } from "@/sphere/Stack";
import { useRouter } from "next/router";
import { useRouterLoading } from "@/hooks/useRouter";
import { PiCheckCircleFill, PiCopy, PiCheckCircle } from "react-icons/pi";
import { useActiveAccount } from "thirdweb/react";
import { useUser } from "@/hooks/useUser";
import { useCompanybyFounderId } from "@/hooks/useCompany";

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
  const smartAccount = useActiveAccount();
  const [copied, setCopied] = useState(false);
  const { updateUser } = useUser();
  const { company, isLoading: isLoadingCompany } = useCompanybyFounderId(
    smartAccount?.address || ""
  );

  const onContinue = async () => {
    console.log("onContinue", smartAccount?.address);
    if (!smartAccount?.address) return;
    await updateUser({
      evm_address: smartAccount?.address,
      status: "signedUp",
    });
    if (company) {
      await router.push(`/company/${company.id}`);
    } else {
      await router.push("/company/create");
    }
  };

  const handleCopyAddress = () => {
    if (smartAccount?.address) {
      navigator.clipboard.writeText(smartAccount.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.div
      className="flex flex-col items-center justify-center gap-6 w-full max-w-lg p-8 z-10"
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
          <p className="w-full font-body-md text-center text-neutral">
            アカウントが正常に作成されました。
            <br />
            会社を作成してDAOの構築を始めることができます。
          </p>
        </motion.div>
      </Stack>

      {/* ウォレットアドレス表示とコピー機能 */}
      {smartAccount?.address && (
        <motion.div
          className="w-full"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.3 }}
        >
          <Card className="bg-default-50 z-10">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col flex-1 overflow-hidden">
                  <p className="text-sm text-default-500 mb-1">
                    ウォレットアドレス
                  </p>
                  <p className="font-mono text-sm text-foreground text-ellipsis overflow-hidden">
                    {smartAccount.address}
                  </p>
                </div>
                <NextUIButton
                  isIconOnly
                  size="sm"
                  variant="light"
                  onPress={handleCopyAddress}
                  color={copied ? "success" : "default"}
                  className="flex-shrink-0 ml-2"
                >
                  {copied ? <PiCheckCircle size={16} /> : <PiCopy size={16} />}
                </NextUIButton>
              </div>
            </CardBody>
          </Card>
          <p className="font-body-sm text-default-500 mt-2 px-1">
            業務執行社員として会社に参加する場合は、ウォレットアドレスをコピーしてDAO設立者へ共有してください。
          </p>
        </motion.div>
      )}

      <motion.div
        className="w-full"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.3 }}
      >
        <Button
          color="primary"
          size="lg"
          fullWidth
          onPress={onContinue}
          isLoading={isNavigating || isLoadingCompany}
        >
          {company
            ? `(${company.COMPANY_NAME?.["ja-jp"]})へ`
            : t("Create Your Company")}
        </Button>
      </motion.div>
    </motion.div>
  );
};
