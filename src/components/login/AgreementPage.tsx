import { FC, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckboxGroup } from "@heroui/react";
import { TermCheckbox } from "../estuary/TermCheckbox";
import { useTranslation } from "next-i18next";
import { Stack } from "@/sphere/Stack";
import { Button } from "@heroui/react";
import { useSignOut } from "@/hooks/useSignOut";
import { useUser } from "@/hooks/useUser";
import { useActiveAccount } from "thirdweb/react";
import { usePrivacyPolicy } from "@/hooks/usePrivacyPolicy";
import { useTermsOfUse } from "@/hooks/useTermsOfUse";
import { useAgreement } from "@/hooks/useAgreement";
import { useRouter } from "next/router";
import { useRouterLoading } from "@/hooks/useRouter";

type AgreementPageProps = {
  page: number;
  onPageChange: (page: number) => void;
};

export const AgreementPage: FC<AgreementPageProps> = ({
  page,
  onPageChange,
}) => {
  const [termChecked, setTermChecked] = useState<string[]>([]);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [activeAcceptButton, setActiveAcceptButton] = useState(false);
  const { signOut } = useSignOut();
  const { t } = useTranslation(["login", "common"]);
  const smartAccount = useActiveAccount();
  const { createUser } = useUser();
  const { latest: latestPrivacyPolicy } = usePrivacyPolicy();
  const { latest: latestTermsOfUse } = useTermsOfUse();
  const { createAgreement } = useAgreement();
  const router = useRouter();
  const { isNavigating } = useRouterLoading();
  const onAccept = async () => {
    if (!smartAccount) {
      return;
    }
    try {
      setIsAccepting(true);
      console.log("smartAccount AgreementPage", smartAccount);
      const createdUser = await createUser({
        evm_address: smartAccount?.address,
      });
      const createdAgreement = await createAgreement({
        user_id: createdUser.evm_address,
        type: "termsAndConditions",
        privacy_policy: latestPrivacyPolicy?.id,
        terms_of_use: latestTermsOfUse?.id,
      });
      router.push("/company/create");
    } catch (e) {
      console.error(e);
    } finally {
      setIsAccepting(false);
    }
  };

  useEffect(() => {
    if (termChecked.length === 2) {
      setActiveAcceptButton(true);
    } else {
      setActiveAcceptButton(false);
    }
  }, [termChecked]);

  return (
    <motion.div
      className="flex flex-col items-start justify-center gap-4 w-full max-w-lg p-8"
      initial={{ opacity: 0, x: 0 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <Stack className="w-full justify-center gap-2">
        <p className="w-full font-title-lg text-center text-foreground">
          {t("Terms and Conditions")}
        </p>
        <p className="w-full text-medium text-center text-foreground">
          {t(
            "Please review and accept our Terms of Use and Privacy Policy to continue"
          )}
        </p>
      </Stack>
      <CheckboxGroup
        className="flex flex-col gap-2 w-full h-fit bg-stone-100 rounded-2xl px-4 py-1"
        value={termChecked}
        onValueChange={setTermChecked}
        isDisabled={false}
      >
        <TermCheckbox
          key={"privacyPolicy"}
          value={"privacyPolicy"}
          termName={t("Privacy Policy")}
          href={"https://docs.borderless.company/help/privacy-policy"}
        />
        <TermCheckbox
          key={"termsOfUse"}
          value={"termsOfUse"}
          termName={t("Terms of Use")}
          href={"https://docs.borderless.company/help/terms-of-use"}
          isBorder={false}
        />
      </CheckboxGroup>
      <Stack h className="w-full justify-end gap-2 z-20">
        <Button
          color="primary"
          variant="bordered"
          onPress={() => {
            setIsSigningOut(true);
            signOut();
          }}
          isLoading={isSigningOut}
        >
          {t("Back", { ns: "common" })}
        </Button>
        <Button
          color="primary"
          isDisabled={!activeAcceptButton}
          isLoading={isAccepting || isNavigating}
          onPress={onAccept}
        >
          {t("Accept")}
        </Button>
      </Stack>
    </motion.div>
  );
};
