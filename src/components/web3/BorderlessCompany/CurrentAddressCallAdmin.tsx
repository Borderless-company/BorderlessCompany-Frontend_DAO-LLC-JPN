import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { CallAdmin } from "./CallAdmin";
import { Address } from "viem";

export function CurrentAddressCallAdmin({
  contractAddress,
}: {
  contractAddress: Address;
}) {
  const { address } = useAccount();
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient ? (
    <div>{address && <CallAdmin contractAddress={contractAddress} />}</div>
  ) : (
    <div>Loading...</div>
  );
}
