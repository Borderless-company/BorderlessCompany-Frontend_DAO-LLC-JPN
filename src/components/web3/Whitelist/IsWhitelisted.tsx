import { useChainId, useReadContract } from "wagmi";
import { WhitelistAbi } from "@/utils/abi/Whitelist.sol/Whitelist";
import { Address } from "viem";
import { useEffect, useState } from "react";
import { getWhitelistContractAddress } from "@/utils/contractAddress";

interface IsWhitelistedProps {
  account_: string;
}

export function IsWhitelisted({ account_ }: IsWhitelistedProps) {
  const chainId = useChainId();
  const [contractAddress, setContractAddress] = useState<Address>();

  useEffect(() => {
    setContractAddress(getWhitelistContractAddress(chainId));
  }, [chainId]);

  const {
    data: listed_,
    error,
    isPending,
  } = useReadContract({
    address: contractAddress,
    abi: WhitelistAbi,
    functionName: "isWhitelisted",
    args: [account_ as Address],
  });

  return (
    <div>
      {isPending
        ? "Confirming..."
        : listed_ === true
        ? "Whitelisted"
        : "Not Whitelisted"}
      {error && (
        <div className="text-red-500">
          {(error as any).shortMessage || error.message}
        </div>
      )}
    </div>
  );
}
