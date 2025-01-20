import { Button } from "@heroui/react";
import { useChainId, useSwitchChain } from "wagmi";

export function SwitchChain() {
  const chainId = useChainId();
  const { chains, switchChain, error } = useSwitchChain();

  return (
    <div className="flex flex-col gap-2">
      {chains.map((chain) => (
        <Button
          disabled={chainId === chain.id}
          key={chain.id}
          onPress={() => switchChain({ chainId: chain.id })}
        >
          {chain.name}
        </Button>
      ))}

      {error?.message}
    </div>
  );
}
