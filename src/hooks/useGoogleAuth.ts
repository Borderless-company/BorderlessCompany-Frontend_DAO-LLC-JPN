// src/hooks/useGoogleAuth.ts
import { useWalletConnection } from "./useWalletConnection";
import { useSiweAuth } from "./useSiweAuth";

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
  const walletConnection = useWalletConnection();
  const siweAuth = useSiweAuth(props);

  return {
    // Wallet connection methods
    connectWithGoogle: walletConnection.connectWithGoogle,
    disconnectWallet: walletConnection.disconnectWallet,

    // SIWE authentication methods
    signIn: siweAuth.signIn,
    signOut: siweAuth.signOut,
    checkAccount: siweAuth.checkAccount,

    // State
    isConnecting: walletConnection.isConnecting,
    setIsConnecting: walletConnection.setIsConnecting,
    isAuthenticating: siweAuth.isAuthenticating,
    setIsAuthenticating: siweAuth.setIsAuthenticating,
    isLoggedIn: siweAuth.isLoggedIn,

    // Data
    me: siweAuth.me,
    smartAccount: walletConnection.smartAccount,
    smartWallet: walletConnection.smartWallet,
  };
};
