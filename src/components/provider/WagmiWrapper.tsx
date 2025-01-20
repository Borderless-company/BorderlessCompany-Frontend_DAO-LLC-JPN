"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http } from "wagmi";
import { walletConnect, injected } from "wagmi/connectors";
import { sepolia, polygonAmoy } from "wagmi/chains";
import { defineChain, Chain } from "viem";

import Web3AuthConnectorInstance from "@/utils/Web3AuthConnectorInstance";

const metisSepolia = {
  id: 59902,
  name: "Metis Sepolia",
  nativeCurrency: {
    decimals: 18,
    name: "tMetis",
    symbol: "TMETIS",
  },
  rpcUrls: {
    default: { http: ["https://sepolia.metisdevops.link"] },
  },
  blockExplorers: {
    default: {
      name: "Metis Explorer",
      url: "https://sepolia-explorer.metisdevops.link/",
      apiUrl: "https://sepolia-explorer-api.metisdevops.link/api",
    },
  },
} as const satisfies Chain;

const config = createConfig({
  chains: [metisSepolia],
  transports: {
    [metisSepolia.id]: http(),
  },
  connectors: [
    Web3AuthConnectorInstance([sepolia, polygonAmoy, metisSepolia]),
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID!,
      showQrModal: true,
    }),
  ],
});

const queryClient = new QueryClient();

export default function WagmiWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
