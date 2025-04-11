import { ThirdwebProvider, AutoConnect } from "thirdweb/react";
import { inAppWallet } from "thirdweb/wallets";
import { client } from "@/utils/client";
import { ACCOUNT_FACTORY_ADDRESS } from "@/constants";
import { defineChain } from "thirdweb/chains";

export default function ThirdwebProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const wallets = [inAppWallet()];

  return (
    <ThirdwebProvider>
      <AutoConnect
        wallets={wallets}
        client={client}
        appMetadata={{
          name: "Borderless DAO",
          description: "Borderless DAO Platform",
          url: "https://app.borderless.company",
          logoUrl: "https://app.borderless.company/borderless_logo.png",
        }}
        accountAbstraction={{
          chain: defineChain(Number(process.env.NEXT_PUBLIC_CHAIN_ID)),
          factoryAddress: ACCOUNT_FACTORY_ADDRESS,
          sponsorGas: true,
        }}
      />
      {children}
    </ThirdwebProvider>
  );
}
