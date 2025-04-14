// src/hooks/useGoogleAuth.ts
import { useEffect, useState } from "react";
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
import { useSetContractURI } from "@/hooks/useContract";
import { useMe } from "@/hooks/useMe";
import { hasAccount } from "@/utils/api/user";

export type UseGoogleAuthProps = {
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
};

export const useGoogleAuth = (props?: UseGoogleAuthProps) => {
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const smartAccount = useActiveAccount();
  const smartWallet = useActiveWallet();
  const { disconnect } = useDisconnect();
  const { me, refetch } = useMe();
  const { sendTx } = useSetContractURI();

  const { connect } = useConnect({
    client,
    accountAbstraction: {
      chain: defineChain(Number(process.env.NEXT_PUBLIC_CHAIN_ID)),
      factoryAddress: ACCOUNT_FACTORY_ADDRESS,
      sponsorGas: true,
    },
  });

  useEffect(() => {
    setIsConnecting(false);
  }, []);

  /**
   * Googleアカウントでスマートウォレットに接続する
   */
  const connectWithGoogle = async () => {
    setIsConnecting(true);
    try {
      connect(async () => {
        const wallet = inAppWallet();
        try {
          await wallet.connect({
            client,
            chain: defineChain(Number(process.env.NEXT_PUBLIC_CHAIN_ID)),
            strategy: "google",
          });
        } catch (error) {
          console.error("接続エラー:", error);
          setIsConnecting(false);
          props?.onSignInError?.(
            error instanceof Error ? error : new Error(String(error))
          );
        }
        return wallet;
      });
    } catch (error) {
      console.error("接続エラー:", error);
      setIsConnecting(false);
      props?.onSignInError?.(
        error instanceof Error ? error : new Error(String(error))
      );
    }
  };

  /**
   * アカウントが存在するか確認する
   */
  const checkAccount = async () => {
    if (!smartAccount?.address) return;

    try {
      const _hasAccount = await hasAccount(smartAccount?.address);
      if (!_hasAccount) {
        // アカウントがない場合
        props?.onNoAccount?.();
      }
      return _hasAccount;
    } catch (e) {
      console.error(e);
      setIsConnecting(false);
      props?.onSignInError?.(e instanceof Error ? e : new Error(String(e)));
      return false;
    }
  };

  /**
   * ウォレットを使用してSIWEサインインを実行する
   */
  const signIn = async () => {
    if (!smartAccount?.address) return;
    let nonce = 0;

    console.log("signIn: smartAccount?.address: ", smartAccount?.address);

    // アカウント作成
    sendTx(smartAccount?.address);

    try {
      const nonceRes = await fetch(
        "/api/auth/nonce?address=" + smartAccount?.address
      );
      const { nonce: _nonce } = await nonceRes.json();
      nonce = _nonce;
      console.log(`nonce: ${nonce}`);
    } catch (e) {
      console.error(e);
      setIsConnecting(false);
      props?.onSignInError?.(e instanceof Error ? e : new Error(String(e)));
      return;
    }

    try {
      // SIWE (EIP-4361) フォーマットのメッセージを作成
      const domain = window.location.host;
      const origin = window.location.origin;
      const statement =
        "Borderlessアプリにログインして、あなたのアイデンティティを確認します。";
      const expirationTime = new Date(
        Date.now() + 1000 * 60 * 60 * 24 * 3
      ).toISOString(); // 3日後に期限切れ

      const siweMessage = `${domain} wants you to sign in with your Ethereum account:
${smartAccount.address}

${statement}

URI: ${origin}
Version: 1
Chain ID: ${process.env.NEXT_PUBLIC_CHAIN_ID}
Nonce: ${nonce}
Issued At: ${new Date().toISOString()}
Expiration Time: ${expirationTime}`;

      console.log(`SIWE message: ${siweMessage}`);

      const signature = await smartAccount?.signMessage({
        message: siweMessage,
      });
      console.log(`signature: ${signature}`);
      const verifyRes = await fetch("/api/auth/generateJWT", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          address: smartAccount?.address,
          signature,
          message: siweMessage,
          nonce: String(nonce),
        }),
      });
      console.log(`verifyRes: ${verifyRes}`);

      const data = await verifyRes.json();
      if (verifyRes.ok) {
        setIsConnecting(false);
        await refetch();
        props?.onSignInSuccess?.();
      } else {
        console.error("Verification failed", data);
        setIsConnecting(false);
        if (smartWallet) {
          disconnect(smartWallet);
        }
        props?.onSignInError?.(new Error("Verification failed"));
      }
    } catch (e) {
      console.error(`Error signing in: ${e}`);
      setIsConnecting(false);
      if (smartWallet) {
        disconnect(smartWallet);
      }
      props?.onSignInError?.(e instanceof Error ? e : new Error(String(e)));
    }
  };

  /**
   * サインアウトする
   */
  const signOut = async () => {
    try {
      if (smartWallet) {
        disconnect(smartWallet);
      }
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      await refetch();
    } catch (e) {
      console.error("サインアウトエラー:", e);
      throw new Error("Failed to sign out");
    }
  };

  return {
    connectWithGoogle,
    signIn,
    signOut,
    checkAccount,
    isConnecting,
    setIsConnecting,
    isLoggedIn: !!me?.isLogin,
    me,
    smartAccount,
    smartWallet,
  };
};
