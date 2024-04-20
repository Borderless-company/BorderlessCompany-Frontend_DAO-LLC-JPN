import { FormEvent, useEffect, useState } from "react";
import {
  useWaitForTransactionReceipt,
  useWriteContract,
  BaseError,
  useChainId,
} from "wagmi";
import { UtilityTokenAbi } from "@/utils/abi/UtilityToken";
import { Address, stringToHex } from "viem";
import { Button, Input } from "@nextui-org/react";
import { getBlockExplorerUrl } from "@/utils/contractAddress";
import { useRouter } from "next/router";

export function MintToken() {
  const [isClient, setIsClient] = useState(false);
  const chainId = useChainId();
  const { daoId, utilityTokenId } = useRouter().query;

  const { data: hash, error, isPending, writeContract } = useWriteContract();

  const [contractAddress, setContractAddress] = useState<Address>();
  const [blockExplorerUrl, setBlockExplorerUrl] = useState<string>();

  async function submit(e: FormEvent<HTMLFormElement>) {
    if (!contractAddress) {
      return;
    }
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    // toにするとsubmitしたときにリンクとして機能する
    const to_ = formData.get("to_") as Address;
    const amount = formData.get("amount") as string;

    writeContract({
      address: contractAddress,
      abi: UtilityTokenAbi,
      functionName: "mint",
      args: [to_, BigInt(amount)],
    });
  }

  const { isLoading: isLoading, isSuccess: isSuccess } =
    useWaitForTransactionReceipt({
      hash,
    });

  useEffect(() => {
    setContractAddress(utilityTokenId as Address);
    setBlockExplorerUrl(getBlockExplorerUrl(chainId));
  }, [chainId, utilityTokenId]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!hash) return;
    console.log("hash", hash);
  }, [hash]);

  return (
    <>
      {isClient && (
        <div>
          <form onSubmit={submit}>
            <Input name="to_" label="to_" required />
            <Input type="number" name="amount" label="amount" required />

            <Button type="submit" color="primary">
              {isPending ? "Confirming..." : "トークンを発行する"}
            </Button>
          </form>

          {hash && (
            <a
              className="text-blue-500"
              href={blockExplorerUrl + "/tx/" + hash}
              target="_blank"
              rel="noopener noreferrer"
            >
              Transaction Hash: {hash}
            </a>
          )}
          {isLoading && "Waiting for confirmation..."}
          {isSuccess && <div>Transaction confirmed.</div>}
          {error && (
            <div className="text-red-500">
              {error.message}
              {(error as BaseError).shortMessage || error.message}
            </div>
          )}
        </div>
      )}
    </>
  );
}
