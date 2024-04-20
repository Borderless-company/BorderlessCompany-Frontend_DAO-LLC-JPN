import { useAccount, useReadContract, useTransactionReceipt } from "wagmi";
import { UtilityTokenAbi } from "@/utils/abi/UtilityToken";
import { Address } from "viem";

export function UtilityTokenName({
  contractAddress,
}: {
  contractAddress: Address;
}) {
  const { address } = useAccount();
  const { data, error, isPending } = useReadContract({
    address: contractAddress as Address,
    abi: UtilityTokenAbi,
    functionName: "name",
    args: [],
  });

  return (
    <>
      {isPending ? "Confirming..." : data}
      {error && (
        <div className="text-red-500">
          {(error as any).shortMessage || error.message}
        </div>
      )}
    </>
  );
}
