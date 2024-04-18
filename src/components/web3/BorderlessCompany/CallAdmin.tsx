import { useAccount, useReadContract, useTransactionReceipt } from "wagmi";
import { BorderlessCompanyAbi } from "@/utils/abi/BorderlessCompany.sol/BorderlessCompany";
import { Address } from "viem";

export function CallAdmin({ contractAddress }: { contractAddress: Address }) {
  const { address } = useAccount();
  const { data, error, isPending } = useReadContract({
    address: contractAddress as Address,
    abi: BorderlessCompanyAbi,
    functionName: "callAdmin",
    args: [],
    account: address,
  });

  return (
    <>
      {isPending
        ? "Confirming..."
        : String(data) === "true"
        ? "Admin"
        : "Not Admin"}
      {error && (
        <div className="text-red-500">
          {(error as any).shortMessage || error.message}
        </div>
      )}
    </>
  );
}
