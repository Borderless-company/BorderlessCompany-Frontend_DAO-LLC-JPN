import { useState } from "react";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { Button, Input } from "@heroui/react";
import { Stack } from "@/sphere/Stack";

interface FirebasePhoneAuthProps {
  onAuthSuccess: (jwt: string, address: string) => void;
}

export const FirebasePhoneAuth = ({
  onAuthSuccess,
}: FirebasePhoneAuthProps) => {
  const [authData, setAuthData] = useState<{
    jwt: string;
    address: string;
  } | null>(null);

  const handleAuthSuccess = (jwt: string, address: string) => {
    console.log("🎯 [FirebasePhoneAuth] handleAuthSuccess実行開始");
    console.log("🎯 [FirebasePhoneAuth] jwt:", jwt);
    console.log("🎯 [FirebasePhoneAuth] address:", address);
    console.log("🎯 [FirebasePhoneAuth] onAuthSuccess:", typeof onAuthSuccess);

    // API連携のシミュレーションとしてStateに結果を保存
    setAuthData({ jwt, address });

    // 親コンポーネントにも通知
    if (typeof onAuthSuccess === "function") {
      console.log("🎯 [FirebasePhoneAuth] onAuthSuccess呼び出し中...");
      onAuthSuccess(jwt, address);
    } else {
      console.error(
        "❌ [FirebasePhoneAuth] onAuthSuccessが関数ではありません:",
        onAuthSuccess
      );
    }
  };

  const {
    phoneNumber,
    setPhoneNumber,
    verificationCode,
    setVerificationCode,
    isLoading,
    error,
    sendVerificationCode,
    verifyCodeAndConnect,
    isCodeSent,
    goBackToPhoneInput,
  } = useFirebaseAuth({
    onAuthSuccess: handleAuthSuccess,
    onSiweTrigger: () => {}, // 空の関数で削除予定
  });

  return (
    <div>
      {/* reCAPTCHA用の非表示コンテナ */}
      <div id="recaptcha-container"></div>

      {!isCodeSent ? (
        <Stack className="gap-4">
          <p className="text-sm text-gray-600">SMSで認証コードを送信します。</p>
          <Input
            type="tel"
            label="電話番号"
            placeholder="09012345678"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            disabled={isLoading}
            fullWidth
          />
          <Button
            type="submit"
            color="primary"
            onPress={sendVerificationCode}
            isLoading={isLoading}
            isDisabled={!phoneNumber}
            className="w-full"
          >
            {isLoading ? "送信中..." : "認証コードを送信"}
          </Button>
        </Stack>
      ) : (
        <Stack className="gap-4">
          <p className="text-sm text-gray-600">
            SMSで送信された6桁の認証コードを入力してください。
          </p>
          <Input
            type="text"
            label="認証コード"
            placeholder="123456"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            disabled={isLoading}
            fullWidth
          />
          <Stack className="flex flex-row gap-2">
            <Button
              onPress={verifyCodeAndConnect}
              color="primary"
              isLoading={isLoading}
              isDisabled={!verificationCode}
              className="w-full"
            >
              {isLoading ? "認証中..." : "認証する"}
            </Button>
            <Button
              onPress={goBackToPhoneInput}
              color="secondary"
              variant="light"
              isDisabled={isLoading}
              className="w-full"
              size="sm"
            >
              電話番号を変更する
            </Button>
          </Stack>
        </Stack>
      )}

      {error && <p className="text-danger mt-4 text-center">{error}</p>}
    </div>
  );
};
