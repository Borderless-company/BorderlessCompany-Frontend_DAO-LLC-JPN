"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http } from "wagmi";
import { walletConnect, injected } from "wagmi/connectors";
import { sepolia, polygonAmoy } from "wagmi/chains";

import Web3AuthConnectorInstance from "@/utils/Web3AuthConnectorInstance";

const config = createConfig({
  chains: [sepolia, polygonAmoy],
  transports: {
    [sepolia.id]: http(),
    [polygonAmoy.id]: http(),
  },
  connectors: [
    Web3AuthConnectorInstance([sepolia, polygonAmoy]),
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
