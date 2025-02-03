import { client, defaultChain } from "@/utils/client";
import { useActiveAccount, useWalletBalance } from "thirdweb/react";

export function Balance() {
  const smartAccount = useActiveAccount();

  const { data } = useWalletBalance({
    chain: defaultChain,
    address: smartAccount?.address,
    client: client,
  });

  return (
    <div>
      <div>Balance: {data?.value?.toString()}</div>
    </div>
  );
}
