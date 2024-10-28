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
import Link from "next/link";
import { useMember } from "@/hooks/useMember";

export function IssueToken({
  daoId,
  contractAddress,
  mintTo,
}: {
  daoId: string;
  contractAddress: Address;
  mintTo: Address;
}) {
  const [isClient, setIsClient] = useState(false);
  const chainId = useChainId();
  const { updateMember } = useMember({
    daoId: daoId,
    userId: mintTo,
  });

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
      args: [mintTo ? mintTo : to_],
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
    console.log("isSuccess", isSuccess);
    if (isSuccess) {
      updateMember({
        is_minted: true,
      });
    }
  }, [isSuccess]);

  return (
    <>
      {isClient && (
        <div>
          <form onSubmit={submit} className="flex flex-col gap-2">
            {/* // TODO: isAddressでアドレスかどうかの判定をする */}
            <div>
              <label className="font-semibold text-sm">
                受け取り先のアドレス
              </label>
              {mintTo ? (
                <div className="text-md text-primary">
                  <Link
                    href={blockExplorerUrl + "/address/" + mintTo}
                    target="_blank"
                  >
                    {mintTo}
                  </Link>
                </div>
              ) : (
                <Input
                  name="to_"
                  key="inside"
                  type="text"
                  label=""
                  labelPlacement="inside"
                  placeholder="受け取り先のアドレスを入力"
                  description="0xから始まるアドレスを入力する"
                  variant="bordered"
                  size="md"
                />
              )}
            </div>
            <div className="mt-2">
              <Button type="submit" color="primary" size="md">
                {isPending ? "Confirming..." : "トークンを発行する"}
              </Button>
            </div>
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
