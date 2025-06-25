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

  // デバッグ: 現在のアクティブなアカウントとウォレットを監視
  const activeAccount = useActiveAccount();
  const activeWallet = useActiveWallet();
  const { disconnect } = useDisconnect();

  useEffect(() => {
    console.log(
      "🔍 [useFirebaseAuth] アクティブアカウント変更:",
      activeAccount?.address
    );
    console.log(
      "🔍 [useFirebaseAuth] アクティブウォレット変更:",
      activeWallet ? "存在" : "なし"
    );
  }, [activeAccount, activeWallet]);

  useEffect(() => {
    // モーダルが表示される（コンポーネントがマウントされる）たびに
    // 新しいRecaptchaVerifierインスタンスを作成する
    initializeRecaptcha();

    // モーダルが閉じる（アンマウントされる）時にクリーンアップする
    return () => {
      console.log("🧹 [useFirebaseAuth] RecaptchaVerifierクリーンアップ");
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        delete window.recaptchaVerifier;
      }
    };
  }, []);

  const initializeRecaptcha = () => {
    console.log("🔧 [useFirebaseAuth] RecaptchaVerifier初期化開始");

    try {
      // 既存のreCAPTCHAインスタンスをクリーンアップ
      if (window.recaptchaVerifier) {
        console.log("🧹 [useFirebaseAuth] 既存reCAPTCHAをクリーンアップ");
        window.recaptchaVerifier.clear();
        delete window.recaptchaVerifier;
      }

      // DOM要素の存在確認
      const recaptchaContainer = document.getElementById("recaptcha-container");
      if (!recaptchaContainer) {
        console.error("❌ [useFirebaseAuth] reCAPTCHAコンテナが見つかりません");
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

      console.log("✅ [useFirebaseAuth] RecaptchaVerifier初期化完了");
    } catch (error) {
      console.error(
        "❌ [useFirebaseAuth] RecaptchaVerifier初期化エラー:",
        error
      );
      setError(
        "reCAPTCHAの初期化に失敗しました。ページを再読み込みしてください。"
      );
    }
  };

  // ウォレット接続状態をクリーンアップする関数
  const cleanupWalletState = async () => {
    console.log("🧹 [useFirebaseAuth] ウォレット状態クリーンアップ開始");
    if (activeWallet) {
      console.log("🔌 [useFirebaseAuth] 既存ウォレット切断中...");
      try {
        disconnect(activeWallet);
        // 切断の完了を少し待つ
        await new Promise((resolve) => setTimeout(resolve, 500));
        console.log("✅ [useFirebaseAuth] 既存ウォレット切断完了");
      } catch (e) {
        console.error("❌ [useFirebaseAuth] ウォレット切断エラー:", e);
      }
    }
  };

  // アクティブアカウントが設定されるまで待機する関数
  const waitForActiveAccount = async (
    maxWaitMs = 5000
  ): Promise<string | null> => {
    console.log("⏳ [useFirebaseAuth] アクティブアカウント待機開始");
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitMs) {
      if (activeAccount?.address) {
        console.log(
          "✅ [useFirebaseAuth] アクティブアカウント検出:",
          activeAccount.address
        );
        return activeAccount.address;
      }
      console.log("🔍 [useFirebaseAuth] アクティブアカウント待機中...");
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    console.log("⚠️ [useFirebaseAuth] アクティブアカウント待機タイムアウト");
    return null;
  };

  // 1. 確認コードを送信する
  const sendVerificationCode = async () => {
    console.log("📞 [useFirebaseAuth] 確認コード送信開始");
    if (!phoneNumber) {
      setError("電話番号を入力してください");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // reCAPTCHAが初期化されていない場合は再初期化
      if (!window.recaptchaVerifier) {
        console.log("🔧 [useFirebaseAuth] reCAPTCHA再初期化");
        initializeRecaptcha();

        // 初期化後も存在しない場合はエラー
        if (!window.recaptchaVerifier) {
          throw new Error("reCAPTCHAの初期化に失敗しました");
        }
      }

      console.log("📡 [useFirebaseAuth] Firebase認証API呼び出し:", phoneNumber);
      const confirmationResult = await signInWithPhoneNumber(
        firebaseAuth,
        phoneNumber,
        window.recaptchaVerifier
      );

      setConfirmationResult(confirmationResult);
      setIsCodeSent(true);
      console.log("✅ [useFirebaseAuth] 確認コードを送信しました。");
    } catch (error: any) {
      console.error("❌ [useFirebaseAuth] 確認コード送信エラー:", error);
      setError(`確認コード送信に失敗しました: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. 受け取ったコードを検証し、ウォレット接続とAPI連携を行う
  const verifyCodeAndConnect = async () => {
    console.log("🔍 [useFirebaseAuth] コード検証・ウォレット接続開始");
    if (!confirmationResult) {
      console.log("❌ [useFirebaseAuth] 確認結果が存在しない");
      setError("先に確認コードを送信してください。");
      return;
    }
    if (!verificationCode) {
      console.log("❌ [useFirebaseAuth] 認証コードが未入力");
      setError("確認コードを入力してください。");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      // 既存のウォレット状態をクリーンアップ
      await cleanupWalletState();

      console.log("🔐 [useFirebaseAuth] Firebase認証中...");
      const credential = await confirmationResult.confirm(verificationCode);
      console.log("✅ [useFirebaseAuth] Firebase認証成功");

      const idToken = await credential.user.getIdToken();
      console.log("🎫 [useFirebaseAuth] IDトークン取得成功");

      // デバッグ: JWTの内容を確認
      console.log("Firebase JWT:", idToken);

      // JWTをデコードして内容を確認（デバッグ用）
      try {
        const base64Payload = idToken.split(".")[1];
        const payload = JSON.parse(atob(base64Payload));
        console.log("Firebase JWT payload:", payload);
        console.log("Firebase JWT aud:", payload.aud);
        console.log("Firebase JWT iss:", payload.iss);
      } catch (e) {
        console.error("JWT decode error:", e);
      }

      console.log("🔗 [useFirebaseAuth] ウォレット接続開始...");
      const connectedWallet = await connect(async () => {
        console.log("💰 [useFirebaseAuth] inAppWallet作成中...");
        const wallet = inAppWallet();
        console.log("🔌 [useFirebaseAuth] ウォレットJWT接続中...");
        await wallet.connect({
          client,
          chain: defineChain(Number(process.env.NEXT_PUBLIC_CHAIN_ID)),
          strategy: "jwt",
          jwt: idToken,
        });
        console.log("✅ [useFirebaseAuth] ウォレット接続完了");
        return wallet;
      });

      if (!connectedWallet) {
        console.error("❌ [useFirebaseAuth] connectedWalletがnull");
        throw new Error("ウォレットへの接続に失敗しました。");
      }
      console.log("✅ [useFirebaseAuth] connectedWallet取得成功");

      const account = connectedWallet.getAccount();
      if (!account) {
        console.error("❌ [useFirebaseAuth] アカウント取得失敗");
        throw new Error("ウォレットアドレスの取得に失敗しました。");
      }
      const walletAddress = account.address;
      console.log("📍 [useFirebaseAuth] Wallet Address取得:", walletAddress);

      console.log("Firebase JWT:", idToken);
      console.log("Wallet Address:", walletAddress);

      // アクティブアカウントが設定されるまで待機
      console.log("⏳ [useFirebaseAuth] アクティブアカウント状態確認中...");
      const activeAddress = await waitForActiveAccount(3000);

      if (activeAddress && activeAddress === walletAddress) {
        console.log(
          "✅ [useFirebaseAuth] アクティブアカウント確認成功:",
          activeAddress
        );
      } else {
        console.log("⚠️ [useFirebaseAuth] アクティブアカウント確認失敗");
        console.log("🔍 [useFirebaseAuth] 期待:", walletAddress);
        console.log("🔍 [useFirebaseAuth] 実際:", activeAddress);
      }

      console.log("📞 [useFirebaseAuth] onAuthSuccessコール中...");
      onAuthSuccess(idToken, walletAddress);
      console.log("✅ [useFirebaseAuth] Firebase認証完了 - 自動SIWE認証に委譲");
      // 注意: onSiweTriggerは削除 - useSiweAuthの自動認証に委譲
    } catch (e: any) {
      console.error(
        "❌ [useFirebaseAuth] コード検証またはウォレット接続エラー:",
        e
      );
      setError(e.message || "不明なエラーが発生しました。");
    } finally {
      setIsLoading(false);
    }
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
  };
};
