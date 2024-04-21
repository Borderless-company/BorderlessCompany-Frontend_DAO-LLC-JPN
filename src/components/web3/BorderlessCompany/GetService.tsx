import { useAccount, useReadContract, useTransactionReceipt } from "wagmi";
import { BorderlessCompanyAbi } from "@/utils/abi/BorderlessCompany.sol/BorderlessCompany";
import { Address } from "viem";

// TODO: Hookから呼び出す。多分このコンポーネントいらないので削除してよい。
export function GetService({
  contractAddress,
  serviceIndex,
}: {
  contractAddress: Address;
  serviceIndex: number;
}) {
  const { address } = useAccount();
  const { data, error, isPending } = useReadContract({
    address: contractAddress as Address,
    abi: BorderlessCompanyAbi,
    functionName: "getService",
    args: [BigInt(serviceIndex)],
    account: address,
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
