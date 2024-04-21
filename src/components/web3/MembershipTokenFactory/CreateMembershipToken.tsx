import { FormEvent, useEffect, useState } from "react";
import {
  useWaitForTransactionReceipt,
  useWriteContract,
  BaseError,
  useChainId,
} from "wagmi";
import { TokenServiceAbi } from "@/utils/abi/TokenService.sol/TokenService";
import { Address, stringToHex } from "viem";
import { Button, Checkbox, Input } from "@nextui-org/react";
import {
  getBlockExplorerUrl,
  getMembershipTokenFactoryContractAddress,
} from "@/utils/contractAddress";
import { useRouter } from "next/router";

export function CreateMembershipToken({
  contractAddress,
}: {
  contractAddress: Address;
}) {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const chainId = useChainId();

  const { data: hash, error, isPending, writeContract } = useWriteContract();

  const [blockExplorerUrl, setBlockExplorerUrl] = useState<string>();

  const [isSbt, setIsSbt] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    if (!contractAddress) {
      return;
    }
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const name_ = formData.get("name_") as string;
    const symbol_ = formData.get("symbol_") as string;
    const baseURI_ = formData.get("baseURI_") as string;
    const sbt_ = isSbt;

    writeContract({
      address: contractAddress,
      abi: TokenServiceAbi,
      functionName: "activateStandard721Token",
      args: [name_, symbol_, baseURI_, sbt_],
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

  useEffect(() => {
    if (isSuccess) {
      router.reload();
    }
  }, [isSuccess, router]);

  return (
    <>
      {isClient && (
        <div>
          <form onSubmit={submit}>
            <Input name="name_" label="name_" required />
            <Input name="symbol_" label="symbol_" required />
            <Input name="baseURI_" label="baseURI_" />
            <Checkbox isSelected={isSbt} onValueChange={setIsSbt}>
              業務執行社員トークンにする
            </Checkbox>

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
