import { FormEvent, useEffect, useState } from "react";
import {
  useWaitForTransactionReceipt,
  useWriteContract,
  BaseError,
  useChainId,
} from "wagmi";
import { NonFungibleTokenTYPE721Abi } from "@/utils/abi/NonFungibleTokenTYPE721.sol/NonFungibleTokenTYPE721";
import { Address, stringToHex } from "viem";
import { Button, Input } from "@nextui-org/react";
import { getBlockExplorerUrl } from "@/utils/contractAddress";
import { useRouter } from "next/router";

export function IssueToken({ contractAddress }: { contractAddress: Address }) {
  const [isClient, setIsClient] = useState(false);
  const chainId = useChainId();

  const { data: hash, error, isPending, writeContract } = useWriteContract();

  const [blockExplorerUrl, setBlockExplorerUrl] = useState<string>();

  async function submit(e: FormEvent<HTMLFormElement>) {
    if (!contractAddress) {
      return;
    }
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const to_ = formData.get("to_") as Address;

    writeContract({
      address: contractAddress,
      abi: NonFungibleTokenTYPE721Abi,
      functionName: "mint",
      args: [to_],
    });
  }

  const { isLoading: isLoading, isSuccess: isSuccess } =
    useWaitForTransactionReceipt({
      hash,
    });

  useEffect(() => {
    setBlockExplorerUrl(getBlockExplorerUrl(chainId));
  }, [chainId]);

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
            {/* // TODO: isAddressでアドレスかどうかの判定をする */}
            <Input name="to_" label="to_" required />
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
