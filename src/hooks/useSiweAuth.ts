import { useState, useRef, useEffect } from "react";
import {
  useActiveAccount,
  useActiveWallet,
  useDisconnect,
} from "thirdweb/react";
import { defineChain } from "thirdweb/chains";
import { client } from "@/utils/client";
import { useSetContractURI } from "@/hooks/useContract";
import { useMe } from "@/hooks/useMe";
import { hasAccount } from "@/utils/api/user";
import { waitForReceipt } from "thirdweb";

export type UseSiweAuthProps = {
  /**
   * サインイン後に実行するコールバック関数
   */
  onSignInSuccess?: () => void;

  /**
   * サインイン失敗時に実行するコールバック関数
   */
  onSignInError?: (error: Error) => void;

  /**
   * アカウントが存在しない場合の処理
   */
  onNoAccount?: () => void;

  /**
   * 外部から渡されるアクティブアカウント（useActiveAccount()の代替）
   */
  externalAccount?: any;

  /**
   * 外部から渡されるアクティブウォレット（useActiveWallet()の代替）
   */
  externalWallet?: any;
};

export const useSiweAuth = (props?: UseSiweAuthProps) => {
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const hookSmartAccount = useActiveAccount();
  const hookSmartWallet = useActiveWallet();

  // 外部から渡されたアカウント/ウォレットを優先的に使用
  const smartAccount = props?.externalAccount || hookSmartAccount;
  const smartWallet = props?.externalWallet || hookSmartWallet;

  const { disconnect } = useDisconnect();
  const { me, refetch } = useMe();
  const { sendTx } = useSetContractURI();

  // デバッグ: アクティブアカウントとウォレットの状態を監視
  useEffect(() => {
    console.log("🔍 [useSiweAuth] smartAccount変更:", smartAccount?.address);
    console.log(
      "🔍 [useSiweAuth] smartWallet変更:",
      smartWallet ? "存在" : "なし"
    );
    console.log(
      "🔍 [useSiweAuth] externalAccount:",
      props?.externalAccount?.address
    );
    console.log(
      "🔍 [useSiweAuth] externalWallet:",
      props?.externalWallet ? "存在" : "なし"
    );

    // 認証可能な状態になったら自動的にsignInを実行
    if (
      smartAccount?.address &&
      smartWallet &&
      !isAuthenticating &&
      !me?.isLogin
    ) {
      console.log("🎯 [useSiweAuth] 認証可能状態検出 - 自動signIn実行");
      signInWithAddress(smartAccount.address);
    }
  }, [
    smartAccount,
    smartWallet,
    props?.externalAccount,
    props?.externalWallet,
    isAuthenticating,
    me?.isLogin,
  ]);

  /**
   * アカウントが存在するか確認する
   */
  const checkAccount = async () => {
    console.log("🔍 [useSiweAuth] checkAccount開始");
    if (!smartAccount?.address) {
      console.log("❌ [useSiweAuth] smartAccount.addressが存在しません");
      console.log(
        "🔍 [useSiweAuth] 詳細 - smartAccount:",
        JSON.stringify(smartAccount, null, 2)
      );
      return;
    }

    const accountExists = await hasAccount(smartAccount?.address);
    console.log("✅ [useSiweAuth] checkAccount結果:", accountExists);
    return accountExists;
  };

  /**
   * ウォレットを使用してSIWEサインインを実行する
   */
  const signIn = async () => {
    console.log("🚀 [useSiweAuth] サインイン開始");
    console.log("🔍 [useSiweAuth] smartAccount:", smartAccount);
    console.log("🔍 [useSiweAuth] smartWallet:", smartWallet);
    console.log(
      "🔍 [useSiweAuth] smartAccount?.address:",
      smartAccount?.address
    );

    // アクティブアカウントが利用可能になるまで待機（最大2秒）
    if (!smartAccount?.address) {
      console.log("⏳ [useSiweAuth] アクティブアカウント待機開始...");

      // 最大2秒待機（短縮）
      for (let i = 0; i < 10; i++) {
        if (smartAccount?.address) {
          console.log(
            "✅ [useSiweAuth] アクティブアカウント検出:",
            smartAccount.address
          );
          break;
        }
        console.log("🔍 [useSiweAuth] アクティブアカウント待機中...");
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      if (!smartAccount?.address) {
        console.log("❌ [useSiweAuth] アクティブアカウント待機タイムアウト");
        console.log(
          "💡 [useSiweAuth] 自動認証を待つか、手動で再試行してください"
        );
        return; // エラーではなく早期リターン
      }
    }

    const currentAddress = smartAccount.address;
    return await signInWithAddress(currentAddress);
  };

  /**
   * 指定されたアドレスでSIWE認証を実行する
   */
  const signInWithAddress = async (address: string) => {
    console.log("🚀 [useSiweAuth] signInWithAddress開始:", address);

    setIsAuthenticating(true);
    let nonce = 0;

    try {
      console.log("🔍 [useSiweAuth] アカウント存在確認を開始");
      const accountExists = await hasAccount(address);
      console.log("✅ [useSiweAuth] アカウント存在確認結果:", accountExists);

      if (!accountExists) {
        console.log(
          "🔧 [useSiweAuth] 初回ログイン: スマートアカウント作成処理を開始"
        );
        try {
          const txHash = await sendTx(address);
          console.log("📝 [useSiweAuth] トランザクションハッシュ:", txHash);

          if (!txHash) {
            console.error("❌ [useSiweAuth] txHashが未定義です");
            throw new Error("txHash is undefined");
          }

          console.log("⏳ [useSiweAuth] トランザクション完了待機中...");
          await waitForReceipt({
            transactionHash: txHash,
            client,
            chain: defineChain(Number(process.env.NEXT_PUBLIC_CHAIN_ID)),
          });
          console.log("✅ [useSiweAuth] トランザクション完了");
        } catch (e) {
          console.error("❌ [useSiweAuth] スマートアカウント作成エラー:", e);
          throw e;
        }
      } else {
        console.log(
          "✅ [useSiweAuth] 既存ユーザー: スマートアカウント作成をスキップ"
        );
      }

      // Nonce取得
      console.log("🔍 [useSiweAuth] Nonce取得を開始");
      try {
        const nonceRes = await fetch("/api/auth/nonce?address=" + address);
        console.log(
          "📡 [useSiweAuth] Nonce APIレスポンス:",
          nonceRes.status,
          nonceRes.statusText
        );

        const { nonce: _nonce } = await nonceRes.json();
        nonce = _nonce;
        console.log("✅ [useSiweAuth] 取得したNonce:", nonce);
      } catch (e) {
        console.error("❌ [useSiweAuth] Nonce取得エラー:", e);
        throw e;
      }

      // SIWE署名とJWT生成
      console.log("🔍 [useSiweAuth] SIWE署名を開始");
      console.log("🔍 [useSiweAuth] 署名前のアカウント確認:");
      console.log("  - smartAccount:", smartAccount?.address);
      console.log("  - smartWallet:", smartWallet ? "存在" : "なし");
      console.log("  - externalAccount:", props?.externalAccount?.address);
      console.log(
        "  - externalWallet:",
        props?.externalWallet ? "存在" : "なし"
      );

      // アカウントまたはウォレットが必要（外部優先）
      const activeAccount = props?.externalAccount || smartAccount;
      const activeWallet = props?.externalWallet || smartWallet;

      if (!activeAccount && !activeWallet) {
        console.error(
          "❌ [useSiweAuth] アクティブアカウントまたはアクティブウォレットが必要です"
        );
        throw new Error("ウォレットアカウントが利用できません");
      }

      // SIWE (EIP-4361) フォーマットのメッセージを作成
      const domain = window.location.host;
      const origin = window.location.origin;
      const statement =
        "Borderlessアプリにログインして、あなたのアイデンティティを確認します。";
      const expirationTime = new Date(
        Date.now() + 1000 * 60 * 60 * 24 * 3
      ).toISOString(); // 3日後に期限切れ

      const siweMessage = `${domain} wants you to sign in with your Ethereum account:
${address}

${statement}

URI: ${origin}
Version: 1
Chain ID: ${process.env.NEXT_PUBLIC_CHAIN_ID}
Nonce: ${nonce}
Issued At: ${new Date().toISOString()}
Expiration Time: ${expirationTime}`;

      console.log("📝 [useSiweAuth] 生成したSIWEメッセージ:", siweMessage);

      console.log("✍️ [useSiweAuth] メッセージ署名を開始");

      let signature: string;
      if (activeAccount) {
        console.log("🔐 [useSiweAuth] activeAccountで署名中...");
        signature = await activeAccount.signMessage({
          message: siweMessage,
        });
      } else if (activeWallet) {
        console.log("🔐 [useSiweAuth] activeWalletで署名中...");
        const account = activeWallet.getAccount();
        if (!account) {
          throw new Error("ウォレットからアカウントを取得できません");
        }
        signature = await account.signMessage({
          message: siweMessage,
        });
      } else {
        throw new Error(
          "署名に使用できるアカウントまたはウォレットがありません"
        );
      }

      console.log("✅ [useSiweAuth] 署名完了:", signature);

      console.log("📡 [useSiweAuth] JWT生成APIを呼び出し中");
      const verifyRes = await fetch("/api/auth/generateJWT", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          address: address,
          signature,
          message: siweMessage,
          nonce: String(nonce),
        }),
      });
      console.log(
        "📡 [useSiweAuth] JWT生成APIレスポンス:",
        verifyRes.status,
        verifyRes.statusText
      );

      const data = await verifyRes.json();
      console.log("📦 [useSiweAuth] JWT生成APIレスポンスデータ:", data);

      if (verifyRes.ok) {
        console.log("✅ [useSiweAuth] JWT生成成功、ログイン完了");
        await refetch();
        props?.onSignInSuccess?.();
      } else {
        console.error("❌ [useSiweAuth] JWT生成失敗:", data);
        throw new Error("Verification failed");
      }
    } catch (e) {
      console.error("❌ [useSiweAuth] signInWithAddressエラー:", e);
      // エラー時にウォレット切断を行わない（重複認証エラーの場合もあるため）
      props?.onSignInError?.(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setIsAuthenticating(false);
    }
  };

  /**
   * サインアウトする
   */
  const signOut = async () => {
    console.log("👋 [useSiweAuth] サインアウト開始");
    try {
      if (smartWallet) {
        console.log("🔌 [useSiweAuth] ウォレット切断中");
        disconnect(smartWallet);
      }

      console.log("📡 [useSiweAuth] ログアウトAPI呼び出し中");
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      console.log("🔄 [useSiweAuth] ユーザー情報更新中");
      await refetch();
      console.log("✅ [useSiweAuth] サインアウト完了");
    } catch (e) {
      console.error("❌ [useSiweAuth] サインアウトエラー:", e);
      throw new Error("Failed to sign out");
    }
  };

  return {
    signIn,
    signInWithAddress,
    signOut,
    checkAccount,
    isAuthenticating,
    setIsAuthenticating,
    isLoggedIn: !!me?.isLogin,
    me,
    smartAccount,
    smartWallet,
  };
};
