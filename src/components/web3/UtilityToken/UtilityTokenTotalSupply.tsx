import { useAccount, useReadContract, useTransactionReceipt } from "wagmi";
import { UtilityTokenAbi } from "@/utils/abi/UtilityToken";
import { Address } from "viem";
import { formatUnits } from "viem";

export function UtilityTokenTotalSupply({
  contractAddress,
}: {
  contractAddress: Address;
}) {
  const { address } = useAccount();
  const {
    data: decimals,
    error: decimalsError,
    isPending: decimalsPending,
  } = useReadContract({
    address: contractAddress as Address,
    abi: UtilityTokenAbi,
    functionName: "decimals",
    args: [],
  });
  const { data, error, isPending } = useReadContract({
    address: contractAddress as Address,
    abi: UtilityTokenAbi,
    functionName: "totalSupply",
    args: [],
    account: address,
  });

  return (
    <>
      {isPending ? "Confirming..." : formatUnits(data!, decimals!)}
      {error && (
        <div className="text-red-500">
          {(error as any).shortMessage || error.message}
        </div>
      )}
    </>
  );
}
