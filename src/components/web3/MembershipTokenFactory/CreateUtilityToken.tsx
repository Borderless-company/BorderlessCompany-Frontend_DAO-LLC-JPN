import { FormEvent, useEffect, useState } from "react";
import {
  useWaitForTransactionReceipt,
  useWriteContract,
  BaseError,
  useChainId,
} from "wagmi";
import { MembershipTokenFactoryAbi } from "@/utils/abi/MembershipTokenFactory";
import { Address, stringToHex } from "viem";
import { Button, Input } from "@heroui/react";
import {
  getBlockExplorerUrl,
  getMembershipTokenFactoryContractAddress,
} from "@/utils/contractAddress";

export function CreateUtilityToken() {
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
    const initialSupply_ = formData.get("initialSupply_") as string;

    writeContract({
      address: contractAddress,
      abi: MembershipTokenFactoryAbi,
      functionName: "createUtilityToken",
      args: [name_, symbol_, BigInt(initialSupply_)],
    });
  }

  const { isLoading, isSuccess } = useWaitForTransactionReceipt({
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
            <Input
              type="number"
              name="initialSupply_"
              label="initialSupply_"
              required
            />

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
          {isLoading && <div>Waiting for confirmation...</div>}
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
