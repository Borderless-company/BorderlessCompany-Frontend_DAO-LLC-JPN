import { useState } from "react";
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

export const useWalletConnection = () => {
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const smartAccount = useActiveAccount();
  const smartWallet = useActiveWallet();
  const { disconnect } = useDisconnect();

  const { connect } = useConnect({
    client,
    accountAbstraction: {
      chain: defineChain(Number(process.env.NEXT_PUBLIC_CHAIN_ID)),
      factoryAddress: ACCOUNT_FACTORY_ADDRESS,
      sponsorGas: true,
    },
  });

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
          console.error("Google接続エラー:", error);
          setIsConnecting(false);
          throw error;
        }
        return wallet;
      });
    } catch (error) {
      console.error("接続エラー:", error);
      setIsConnecting(false);
      throw error;
    }
  };

  /**
   * ウォレットを切断する
   */
  const disconnectWallet = async () => {
    try {
      if (smartWallet) {
        disconnect(smartWallet);
      }
    } catch (e) {
      console.error("ウォレット切断エラー:", e);
      throw new Error("Failed to disconnect wallet");
    }
  };

  return {
    connectWithGoogle,
    disconnectWallet,
    isConnecting,
    setIsConnecting,
    smartAccount,
    smartWallet,
  };
};
