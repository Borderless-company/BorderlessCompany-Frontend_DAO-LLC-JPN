import { useEffect, useState } from "react";
import { IsWhitelisted } from "./IsWhitelisted";
import { useAccount } from "wagmi";

export function CurrentAddressIsWhitelisted() {
  const { address } = useAccount();
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient ? (
    <div>{address && <IsWhitelisted account_={address} />}</div>
  ) : (
    <div>Loading...</div>
  );
}
