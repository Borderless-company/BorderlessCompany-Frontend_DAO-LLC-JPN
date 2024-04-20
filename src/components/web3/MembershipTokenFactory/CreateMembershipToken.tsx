import { FormEvent, useEffect, useState } from "react";
import {
  useWaitForTransactionReceipt,
  useWriteContract,
  BaseError,
  useChainId,
} from "wagmi";
import { MembershipTokenFactoryAbi } from "@/utils/abi/MembershipTokenFactory";
import { Address, stringToHex } from "viem";
import { Button, Input } from "@nextui-org/react";
import {
  getBlockExplorerUrl,
  getMembershipTokenFactoryContractAddress,
} from "@/utils/contractAddress";

export function CreateMembershipToken() {
  const [isClient, setIsClient] = useState(false);
  const chainId = useChainId();

  const { data: hash, error, isPending, writeContract } = useWriteContract();

  const [contractAddress, setContractAddress] = useState<Address>();
  const [blockExplorerUrl, setBlockExplorerUrl] = useState<string>();

  async function submit(e: FormEvent<HTMLFormElement>) {
    if (!contractAddress) {
      return;
    }
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const name_ = formData.get("name_") as string;
    const symbol_ = formData.get("symbol_") as string;

    writeContract({
      address: contractAddress,
      abi: MembershipTokenFactoryAbi,
      functionName: "createMembershipToken",
      args: [name_, symbol_],
    });
  }

  const { isLoading: isLoading, isSuccess: isSuccess } =
    useWaitForTransactionReceipt({
      hash,
    });

  useEffect(() => {
    setContractAddress(getMembershipTokenFactoryContractAddress(chainId));
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
            <Input name="name_" label="name_" required />
            <Input name="symbol_" label="symbol_" required />

            <Button type="submit" color="primary">
              {isPending ? "Confirming..." : "トークンを作成する"}
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
