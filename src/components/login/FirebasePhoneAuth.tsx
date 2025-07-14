import { useState } from "react";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import {
  Button,
  Input,
  Card,
  CardBody,
  CardHeader,
  Divider,
} from "@heroui/react";

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
  } = useFirebaseAuth({
    onAuthSuccess: handleAuthSuccess,
    onSiweTrigger: () => {}, // 空の関数で削除予定
  });

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader>
        <h2 className="font-bold text-lg">共創IDでログイン（電話番号）</h2>
      </CardHeader>
      <CardBody className="space-y-4">
        {/* reCAPTCHA用の非表示コンテナ */}
        <div id="recaptcha-container"></div>

        {!isCodeSent ? (
          <div>
            <p className="text-sm text-gray-600 mb-2">
              SMSで認証コードを送信します。
            </p>
            <Input
              type="tel"
              label="電話番号（例: +819012345678）"
              placeholder="+819012345678"
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
              {isLoading ? "Sending..." : "Send Code"}
            </Button>
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-600 mb-2">
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
            <Button
              onPress={verifyCodeAndConnect}
              color="primary"
              isLoading={isLoading}
              isDisabled={!verificationCode}
              className="w-full"
            >
              {isLoading ? "Verifying..." : "Verify"}
            </Button>
          </div>
        )}

        {error && <p className="text-danger mt-4 text-center">{error}</p>}
      </CardBody>
    </Card>
  );
};
