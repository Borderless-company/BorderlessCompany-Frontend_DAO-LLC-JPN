import { useState, useEffect } from "react";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase";

import {
  useConnect,
  useActiveAccount,
  useActiveWallet,
  useDisconnect,
} from "thirdweb/react";
import { inAppWallet } from "thirdweb/wallets";
import { client } from "@/utils/client";
import { defineChain } from "thirdweb/chains";
import { ACCOUNT_FACTORY_ADDRESS } from "@/constants";
import { syncWalletToKyosoId } from "@/utils/api/kyosoId";

// reCAPTCHAとgrecaptchaのインスタンスをグローバルに保持するための対応
declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    grecaptcha: any; // grecaptchaの型定義を追加
  }
}

// 認証完了後のコールバック関数の型定義
interface UseFirebaseAuthProps {
  onAuthSuccess: (jwt: string, address: string) => void;
  onSiweTrigger: (address: string) => void;
}

export const useFirebaseAuth = ({
  onAuthSuccess,
  onSiweTrigger,
}: UseFirebaseAuthProps) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 日本の電話番号を国際形式に変換する関数
  const parseJapanesePhoneNumber = (input: string): string => {
    // 空白とハイフンを削除
    const cleaned = input.replace(/[\s-]/g, "");
    
    // 既に+81で始まる場合はそのまま返す
    if (cleaned.startsWith("+81")) {
      return cleaned;
    }
    
    // 0で始まる日本の電話番号の場合、0を削除して+81を追加
    if (cleaned.startsWith("0")) {
      return "+81" + cleaned.substring(1);
    }
    
    // その他の場合はそのまま返す（エラーハンドリングは後続の処理に任せる）
    return cleaned;
  };
  const { connect } = useConnect({
    client,
    accountAbstraction: {
      chain: defineChain(Number(process.env.NEXT_PUBLIC_CHAIN_ID)),
      factoryAddress: ACCOUNT_FACTORY_ADDRESS,
      sponsorGas: true,
    },
  });
  const [recaptchaVerifier, setRecaptchaVerifier] =
    useState<RecaptchaVerifier | null>(null);

  const activeAccount = useActiveAccount();
  const activeWallet = useActiveWallet();
  const { disconnect } = useDisconnect();

  useEffect(() => {
    // モーダルが表示される（コンポーネントがマウントされる）たびに
    // 新しいRecaptchaVerifierインスタンスを作成する
    initializeRecaptcha();

    // モーダルが閉じる（アンマウントされる）時にクリーンアップする
    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        delete window.recaptchaVerifier;
      }
    };
  }, []);

  const initializeRecaptcha = () => {
    try {
      // 既存のreCAPTCHAインスタンスをクリーンアップ
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        delete window.recaptchaVerifier;
      }

      // DOM要素の存在確認
      const recaptchaContainer = document.getElementById("recaptcha-container");
      if (!recaptchaContainer) {
        throw new Error("reCAPTCHAコンテナが見つかりません");
      }

      // reCAPTCHA初期化
      window.recaptchaVerifier = new RecaptchaVerifier(
        firebaseAuth,
        "recaptcha-container",
        {
          size: "invisible",
          callback: () => {
            console.log("reCAPTCHA solved");
          },
          "expired-callback": () => {
            console.log("reCAPTCHA expired");
            setError("reCAPTCHAの有効期限が切れました。再度お試しください。");
          },
          "error-callback": (error: any) => {
            console.error("reCAPTCHA error:", error);
            setError("reCAPTCHAでエラーが発生しました。");
          },
        }
      );

      console.log("✅ RecaptchaVerifier初期化完了");
    } catch (error) {
      console.error("❌ RecaptchaVerifier初期化エラー:", error);
      setError(
        "reCAPTCHAの初期化に失敗しました。ページを再読み込みしてください。"
      );
    }
  };

  // ウォレット接続状態をクリーンアップする関数
  const cleanupWalletState = async () => {
    if (activeWallet) {
      try {
        disconnect(activeWallet);
        // 切断の完了を少し待つ
        await new Promise((resolve) => setTimeout(resolve, 500));
        console.log("✅ 既存ウォレット切断完了");
      } catch (e) {
        console.error("❌ ウォレット切断エラー:", e);
      }
    }
  };

  // アクティブアカウントが設定されるまで待機する関数
  const waitForActiveAccount = async (
    maxWaitMs = 5000
  ): Promise<string | null> => {
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitMs) {
      if (activeAccount?.address) {
        return activeAccount.address;
      }
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    return null;
  };

  // 1. 確認コードを送信する
  const sendVerificationCode = async () => {
    if (!phoneNumber) {
      setError("電話番号を入力してください");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // 電話番号を国際形式に変換
      const formattedPhoneNumber = parseJapanesePhoneNumber(phoneNumber);
      console.log("📞 電話番号変換:", phoneNumber, "->", formattedPhoneNumber);

      // reCAPTCHAが初期化されていない場合は再初期化
      if (!window.recaptchaVerifier) {
        initializeRecaptcha();

        // 初期化後も存在しない場合はエラー
        if (!window.recaptchaVerifier) {
          throw new Error("reCAPTCHAの初期化に失敗しました");
        }
      }

      console.log("📞 確認コード送信開始:", formattedPhoneNumber);
      const confirmationResult = await signInWithPhoneNumber(
        firebaseAuth,
        formattedPhoneNumber,
        window.recaptchaVerifier
      );

      setConfirmationResult(confirmationResult);
      setIsCodeSent(true);
      console.log("✅ 確認コード送信完了");
    } catch (error: any) {
      console.error("❌ 確認コード送信エラー:", error.code, error.message);
      setError(`確認コード送信に失敗しました: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. 受け取ったコードを検証し、ウォレット接続とAPI連携を行う
  const verifyCodeAndConnect = async () => {
    if (!confirmationResult) {
      setError("先に確認コードを送信してください。");
      return;
    }
    if (!verificationCode) {
      setError("確認コードを入力してください。");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      // 既存のウォレット状態をクリーンアップ
      await cleanupWalletState();

      console.log("🔐 Firebase認証開始");
      const credential = await confirmationResult.confirm(verificationCode);
      console.log("✅ Firebase認証成功");

      const idToken = await credential.user.getIdToken();

      console.log("🔗 ウォレット接続開始");
      const connectedWallet = await connect(async () => {
        const wallet = inAppWallet();
        await wallet.connect({
          client,
          chain: defineChain(Number(process.env.NEXT_PUBLIC_CHAIN_ID)),
          strategy: "jwt",
          jwt: idToken,
        });
        return wallet;
      });

      if (!connectedWallet) {
        throw new Error("ウォレットへの接続に失敗しました。");
      }

      const account = connectedWallet.getAccount();
      if (!account) {
        throw new Error("ウォレットアドレスの取得に失敗しました。");
      }
      const walletAddress = account.address;
      console.log("📍 Wallet Address取得:", walletAddress);

      // 🌐 共創ID→共創DAO ウォレット情報同期（重要：この部分のログは詳細に残す）
      console.log("🌐 共創ID→共創DAO ウォレット同期開始...");
      try {
        await syncWalletToKyosoId(walletAddress, idToken);
        console.log("✅ 共創ID→共創DAO ウォレット同期成功");
      } catch (apiError) {
        console.error("❌ 共創ID→共創DAO ウォレット同期エラー:", apiError);
        // API呼び出しの失敗はログインフローを止めないが、警告として表示
        console.warn(
          "⚠️ 共創ID→共創DAO ウォレット同期に失敗しましたが、ログインフローは継続します"
        );
      }

      onAuthSuccess(idToken, walletAddress);
      console.log("✅ Firebase認証完了");
    } catch (e: any) {
      console.error("❌ コード検証またはウォレット接続エラー:", e.message);
      setError(e.message || "不明なエラーが発生しました。");
    } finally {
      setIsLoading(false);
    }
  };

  // 電話番号入力画面に戻る関数
  const goBackToPhoneInput = () => {
    setIsCodeSent(false);
    setVerificationCode("");
    setError(null);
    setConfirmationResult(null);
  };

  return {
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
  };
};
